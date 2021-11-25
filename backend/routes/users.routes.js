const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { ObjectID } = require("mongodb");
const postmark = require("postmark");
const reqBodyValidator = require("../middlewares/reqBodyValidator");
const { registerPOST, authenticatePOST, authenticateSWITCHaaiPOST, answerSqlPATCH, recoverPOST, resetPOST } = require("../schemes/users");

const cors = require("cors");

router.use(cors())

// /users/register
router.post("/register", reqBodyValidator(registerPOST), async function ({ body: user }, res, next) {
  // Get Users Collections
  const users = db.get().collection("users");

  // Check if user already exists
  if (await users.findOne({ username: user.username })) return next("User already exists!");

  // Hash password
  user.password = bcrypt.hashSync(user.password, 10);

  // Insert into Database
  users
    .insertOne(user)
    .then(() => {
      let { password, ...u } = user;
      return res.json(u);
    })
    .catch((err) => next(err));
});

// /users/authenticate
router.post("/authenticate", reqBodyValidator(authenticatePOST), async function ({ body: value }, res, next) {
  // Get Users Collections
  const users = db.get().collection("users");
  const user = await users.findOne({ username: value.username });

  // Login failed
  if (!user || !user.password || !bcrypt.compareSync(value.password, user.password)) return next("Username or password is incorrect");

  // Sign Token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "365d" });
  const retVal = { token };
  return res.json(retVal);
});

// /users/authenticate
router.post("/authenticateSWITCHaai", reqBodyValidator(authenticateSWITCHaaiPOST), async function ({ headers: headers, body: value }, res, next) {
  
  //Compare cookie from frontend with the one from backend
  //console.log("auth COOKIES", headers.cookie)

  let authCookie=null
  let parsedCookie = {}
  try {
    headers.cookie.split(';').map(item => item.split("=")).forEach( pair => {if (pair[0].trim()=='sqlscrolls-auth') authCookie=pair[1]})
    authCookie.split("|").map(pair => pair.split(":")).forEach(item => { parsedCookie[item[0]] = item[1]})
  } catch {
    return next("No valid authentication cookie found for the API");
  }

  //console.log("auth parsed: ", parsedCookie)

  // Compare cookies
  for (const field of ["uid", "pid", "org"]) {
      if ((!parsedCookie[field]) || (parsedCookie[field] != value[field])){
        return next("User auth cookie icorrect (different from frontend)");
      }
  }
  
  // Get Users Collections
  const users = db.get().collection("users");
  let user = await users.findOne({ username: value.username });

  if (user) {
    let needUpdate = false

    // if switch data stored, compare it otherwise store it
    for (const field of ["uid", "pid", "org"]) {
      if (!user[field]) { 
        user[field] = value[field]
        needUpdate = true
      } else {
        if (user[field] != value[field])
          return next("User data icorrect (different from registration)");
      }
    }

    // add data if necessary
    if (needUpdate){
      users
      .findOneAndUpdate(
          { _id: user._id },
          { $set: value },
          { returnOriginal: false }
        )
        .catch((err) => next(err));
    }
  } 
  else {
    value.password = null
    // register user
    users
    .insertOne(value)
    .catch((err) => next(err));

    user = value;
  }

  // Sign Token
  const switchaai = true
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "365d" });
  const retVal = { token, switchaai };
  return res.json(retVal);
});

// /users/self
router.get("/self", async function (req, res, next) {
  // Get Users Collections
  const users = db.get().collection("users");
  const user = await users.findOne({ _id: new ObjectID(req.user.userId) });
  const { password, ...retVal } = user;
  return res.json(retVal);
});

// /users/self/answer_sql
router.patch("/self/answer_sql", reqBodyValidator(answerSqlPATCH), async function (
  { user: jwt, body: value },
  res,
  next
) {
  // Get Users Collections
  const users = db.get().collection("users");
  const user = await users.findOne({ _id: new ObjectID(jwt.userId) });

  // conduct payload
  const payload = {
    correct: JSON.parse(value.correct),
    date: Date.now(),
    query: value.query,
  };

  // Update
  users
    .findOneAndUpdate(
      { _id: user._id },
      { $addToSet: { [`history.${value.task}`]: payload } },
      { returnOriginal: false }
    )
    .then(({ value }) => {
      var { password, ...user } = value;
      return res.json(user);
    })
    .catch((err) => next(err));
});

// /users/recover
// A reset link is created and an options object is created defining the from, to, subject and text and an email is sent to the user using the sendgrid package.
router.post("/recover", reqBodyValidator(recoverPOST), async function (req, res, next) {
  // Get Users Collections
  const users = db.get().collection("users");
  users
    .findOneAndUpdate(
      { username: req.body.username },
      {
        $set: {
          resetPasswordToken: crypto.randomBytes(20).toString("hex"),
          resetPasswordExpires: Date.now() + 3600000,
        },
      },
      { returnOriginal: false }
    )
    .then(async ({ value: user }) => {
      if (!user) return next("User not found");
      // Send Mail if its not invoked by JEST
      if (!process.env.JEST_WORKER_ID) {
        const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);
        const link = (process.env.IO_URL)+"/?action=resetPassword&token=" + user.resetPasswordToken;
        await client.sendEmail({
          From: process.env.FROM_SENDER,
          To: user.username,
          Subject: "Password change request",
          HtmlBody: `Hi ${user.username} \n 
    Please click on the following link <a href="${link}">${link}</a> to reset your password. \n\n 
    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
          MessageStream: "outbound",
        });
      }
      return res.json({ message: "Password reset link sent!" });
    })
    .catch((err) => next(err));
});

// /users/reset
// Reset the password
router.post("/reset", reqBodyValidator(resetPOST), async function ({ body: value }, res, next) {
  // Get Users Collections
  const users = db.get().collection("users");
  const password = bcrypt.hashSync(value.password, 10);
  users
    .findOneAndUpdate(
      { resetPasswordToken: value.token, resetPasswordExpires: { $gt: Date.now() } },
      {
        $set: {
          password: password,
          resetPasswordToken: undefined,
          resetPasswordExpires: undefined,
        },
      },
      { returnOriginal: false }
    )
    .then(async ({ value: user }) => {
      if (!user) return next("Token invalid or expired! Request a new one!");
      // Send Mail if its not invoked by JEST
      if (!process.env.JEST_WORKER_ID) {
        const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);
        await client.sendEmail({
          From: process.env.FROM_SENDER,
          To: user.username,
          subject: "Your password has been changed",
          HtmlBody: `Hi ${user.username} \n 
          This is a confirmation that the password for your account ${user.username} has just been changed.\n`,
          MessageStream: "outbound",
        });
      }

      return res.json({ message: "Password reset was successfully!" });
    })
    .catch((err) => next(err));
});

// export
module.exports = router;

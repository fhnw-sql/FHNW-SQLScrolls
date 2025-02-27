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
const { checkIfFinished, checkIfNew, generateCertificate } = require("../utils/certificate");

const cors = require("cors");

router.use(cors())

// /users/register
router.post("/register", reqBodyValidator(registerPOST), async function ({ body: user }, res, next) {

  // Get Users Collections
  const users = db.get().collection("users");

  // Check if user is form the FHNW
  if ((user.username.endsWith("@fhnw.ch") || (user.username.endsWith(".fhnw.ch")))) return next("FHNW users shoud use institutional login!");

  // Check if user already exists
  if (await users.findOne({ username: user.username })) return next("User already exists!");

  // Hash password
  user.password = bcrypt.hashSync(user.password, 10);

  // Add registration date
  user.registrationDate = new Date()

  // Initialize stars field with 0
  user.stars = 0;

  // Initialize timeLastActive field
  user.timeLastActive = new Date();

  // Initialize timeStarsEarned field
  user.timeStarsEarned = null;

  // Insert into Database
  users
    .insertOne(user)
    .then(() => {
      let { password, ...u } = user;
      return res.json(u);
    })
    .catch((err) => next(err));
});

// /users/self/stars
router.patch("/self/stars", async function (req, res, next) {
  const users = db.get().collection("users");

  // Extract the stars value from the request body
  const { stars } = req.body;

  // Validate the stars value to ensure it's a number and non-negative
  if (typeof stars !== 'number' || stars < 0) {
    return res.status(400).json({ error: "Invalid stars value. It must be a non-negative number." });
  }

  try {
    // Update the user's stars value without returning the updated document
    const result = await users.findOneAndUpdate(
        { _id: new ObjectID(req.user.userId) }, // Find the user by ID
        { $set: { stars: stars } }              // Update only the stars field
    );

    if (!result.value) {
      return res.status(404).json({ error: "User not found." });
    }

    // Return success message
    return res.json({ message: "stars updated successfully." });
  } catch (err) {
    console.error("Error updating stars:", err);
    next(err);
  }
});

// /users/self/timeLastActive
router.patch("/self/timeLastActive", async function (req, res, next) {
  const users = db.get().collection("users");

  // No request body required, since we call this endpoint without any parameters
  // Also, no checking of incoming parameters required here

  try {
    // Set the timestamp to the current time in the backend
    const result = await users.findOneAndUpdate(
        { _id: new ObjectID(req.user.userId) }, // Find the user by ID
        { $set: { timeLastActive: new Date() } } // Set current time for timeStarsEarned
    );

    if (!result.value) {
      return res.status(404).json({ error: "User not found." });
    }

    // Return success message
    return res.json({ message: "timeLastActive timestamp updated successfully." });
  } catch (err) {
    console.error("Error updating timeLastActive timestamp:", err);
    next(err);
  }
});

// /users/self/timeStarsEarned
router.patch("/self/timeStarsEarned", async function (req, res, next) {
  const users = db.get().collection("users");

  //No request body required, since we call this endpoint without any parameters
  // Also, no checking of incoming parameters required here

  try {
    // Set the timestamp to the current time in the backend
    const result = await users.findOneAndUpdate(
        { _id: new ObjectID(req.user.userId) }, // Find the user by ID
        { $set: { timeStarsEarned: new Date() } } // Set current time for timeStarsEarned
    );

    if (!result.value) {
      return res.status(404).json({ error: "User not found." });
    }

    // Return success message
    return res.json({ message: "timeStarsEarned timestamp updated successfully." });
  } catch (err) {
    console.error("Error updating timeStarsEarned timestamp:", err);
    next(err);
  }
});

// /users/self/classKey
router.patch("/self/classKey", async function (req, res, next) {
  const users = db.get().collection("users");

  // Extract the classKey from the request body
  const { classKey } = req.body;

  // Validate that the classKey is not empty
  if (!classKey || typeof classKey !== 'string' || classKey.trim() === '') {
    return res.status(400).json({ error: "Invalid classKey. It must be a non-empty string." });
  }

  try {
    // Update the user's classKey value without returning the updated document
    const result = await users.findOneAndUpdate(
        { _id: new ObjectID(req.user.userId) }, // Find the user by ID
        { $set: { classKey: classKey} } // Update only the classKey field
    );

    if (!result.value) {
      return res.status(404).json({ error: "User not found." });
    }

    // Return success message
    return res.json({ message: "classKey inserted successfully." });
  } catch (err) {
    console.error("Error inserting classKey:", err);
    next(err);
  }
});

// /users/self/togglePrivacy
router.patch("/self/togglePrivacy", async function (req, res, next) {
  const { makePrivate, aliasName } = req.body;  // Expects `makePrivate: true` or `false`, and `aliasName`
  const users = db.get().collection("users");

  try {
    // Find the user in the database
    const user = await users.findOne({ _id: new ObjectID(req.user.userId) });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (makePrivate) {
      // User wants to anonymize; use the aliasName from the request if provided, or the already saved one
      const newAliasName = user.aliasName || aliasName;

      await users.updateOne(
          { _id: user._id },
          {
            $set: {
              isPublic: false,
              aliasName: newAliasName,
            },
          }
      );
    } else {
      // User wants to be public again; set `isPublic` to true and leave `aliasName` unchanged
      await users.updateOne(
          { _id: user._id },
          {
            $set: { isPublic: true },
          }
      );
    }

    // Return success message
    return res.json({ message: "Privacy setting updated successfully." });
  } catch (err) {
    console.error("Error toggling privacy:", err);
    next(err);
  }
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

// /users/authenticateSWITCHaai
router.post("/authenticateSWITCHaai", reqBodyValidator(authenticateSWITCHaaiPOST), async function ({ headers: headers, body: value }, res, next) {


  // Parse the backend cookie
  let authCookie=null
  let parsedCookie = {}
  try {
    headers.cookie.split(';').map(item => item.split("=")).forEach( pair => {if (pair[0].trim()=='sqlscrolls-auth') authCookie=pair.slice(1).join('=')})
    authCookie.split("|").map(pair => pair.split(":")).forEach(item => { parsedCookie[item[0]] = item[1]})
  } catch {
    console.log("auth COOKIES", headers.cookie)
    console.log("auth parsed: ", parsedCookie)
    console.error("No valid authentication cookie found for the API");
    return next("No valid authentication cookie found for the API");
  }


  // Compare cookie from frontend (value) with the one from backend
  for (const field of ["username", "uid", "pid", "org"]) {
      if ((!parsedCookie[field]) || (parsedCookie[field] !== value[field])){
        console.log("auth COOKIES", headers.cookie)
        console.log("auth parsed: ", parsedCookie)
        console.error("User auth cookie incorrect (different from frontend) cookie = ", parsedCookie[field], " fontend = ", value[field]);
        return next("User auth cookie incorrect (different from frontend)");
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
        if (user[field] != value[field]){
              console.log("auth COOKIES", headers.cookie)
              console.log("auth fontend: ", value)
              console.error("User data icorrect (different from registration) user = ", user[field], " value = ", value[field])
              return next("User data icorrect (different from registration)");
          }
      }
    }
    // check display name changes
    for (const field of ["givenname", "surname"]) {
      if ((!user[field]) ||  (user[field] != value[field])){
        user[field] = value[field]
        needUpdate = true
      }
    }

    // add data if necessary
    if (needUpdate){
      await users
      .findOneAndUpdate(
          { _id: user._id },
          { $set: value },
          { returnOriginal: false }
        )
        .catch((err) => {console.error("update error ", err); next(err)});
    }
  }
  else {
    value.password = null
    // Add registration date
    value.registrationDate = new Date()
    // register user
    await users
    .insertOne(value)
    .catch((err) => {console.error("insert error ", err); next(err)});
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

// /users/all
router.get("/all", async function (req, res, next) {
  try {
    // Get Users Collection
    const users = db.get().collection("users");

    // Calculate the date one year ago
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Find all users
    const allUsers = await users.find(
        {timeLastActive: {$gte: oneYearAgo}}, // Include only users active in the last year
        { projection: { password: 0 } })  // Exclude password field
        .sort({ stars: -1, timeStarsEarned: 1 }) // Sort by stars (decending) and timeStarsEarned (ascending)
        .toArray();

    // Return users
    return res.json(allUsers);
  } catch (err) {
    next(err);
  }
});

// /users/classFiltered
router.get("/classFiltered", async function (req, res, next) {
  try {
    // Get Users Collection
    const users = db.get().collection("users");

    // Retrieve the requesting user's data
    const currentUser = await users.findOne({ _id: new ObjectID(req.user.userId) });

    // Check if the user exists
    if (!currentUser) {
      return res.status(404).send("User not found");
    }

    // If user exists but does not have a classKey, return only their data as an array
    if (!currentUser.classKey) {
      const { password, ...userData } = currentUser;  // Exclude the password
      return res.json([userData]);  // Return the user data as an array
    }

    // Proceed to retrieve users with the same classKey if classKey exists
    const filteredUsers = await users
        .find({ classKey: currentUser.classKey }, { projection: { password: 0 } })
        .sort({ stars: -1, timeStarsEarned: 1 })  // Sort by stars in descending order and timeStarsEarned (ascending)
        .toArray();

    // Return the filtered list of users
    return res.json(filteredUsers);
  } catch (err) {
    next(err);
  }
});

// /users/certificate
router.patch("/self/certificate", async function (req, res, next) {
  // Get Users Certificate if finished Game
  const users = db.get().collection("users");
  const user = await users.findOne({ _id: new ObjectID(req.user.userId) });

  try {

    let progression = req.body.progression
    if (! checkIfFinished(user, progression)){ return res.json({'success': false, 'reason': "GAME_NOT_FINISHED"})}
    if (! checkIfNew(user, progression)){ return res.json({'success': false, 'reason': "CERTIFICATE_ALREADY_GENERATED"})}
    let newCertificate = generateCertificate(user, progression)
    console.log(newCertificate)

    // Add certificate to user
    users
    .findOneAndUpdate(
      { _id: user._id },
      { $addToSet: { [`certificates`]: newCertificate } },
      { returnOriginal: false }
    )
    .then( v => {
      return res.json(newCertificate);
    })
    .catch((err) => next(err));

  } catch (err){
    console.error("Error parsing progression:", err);
    next(err)
  }

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

// Delete history
router.patch("/self/restart", async function (
  { user: jwt },
  res,
  next
) {

  // Get Users Collections
  const users = db.get().collection("users");
  const archives = db.get().collection("users_archive");
  let user = await users.findOne({ _id: new ObjectID(jwt.userId) });

  // Archive current user
  // clone user
  let clone = JSON.parse(JSON.stringify(user))

  // Build historical ID
  clone._id = { '_id': user._id, 'date': Date.now()}

  // save it
  await archives.insertOne(clone)
    .catch((err) => {console.error("insert error ", err); next(err)});

  // Empty history
  users
    .findOneAndUpdate(
      { _id: user._id },
      { $unset: { 'history': 1 } },
      { returnOriginal: false }
    )
    .then(({ value }) => {
      var { password, ...user } = value;
      console.log("Deleted history for user ", user.username)
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

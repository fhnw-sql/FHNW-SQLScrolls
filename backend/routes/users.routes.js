const express = require("express");
const router = express.Router();
const Joi = require("joi");
const db = require("../utils/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("config.json");
const { ObjectID } = require("mongodb");
const postmark = require("postmark");
const reqValidator = require("../middlewares/reqValidator");
const { registerPOST } = require("../models/users");

// /users/register
router.post("/register", reqValidator(registerPOST), async function ({ body: user }, res, next) {
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
router.post("/authenticate", async function (req, res, next) {
  // Schema
  const authSchema = Joi.object().keys({
    username: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().required(),
  });

  // Validate
  const { error, value } = authSchema.validate(req.body, { abortEarly: false });
  if (error) return next(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);

  // Get Users Collections
  const users = db.get().collection("users");
  const user = await users.findOne({ username: value.username });
  if (user && bcrypt.compareSync(value.password, user.password)) {
    const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: "365d" });
    let { password, ...u } = user;
    const retVal = { user: u, token };
    return res.json(retVal);
  } else {
    return next("Username or password is incorrect");
  }
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
router.patch("/self/answer_sql", async function (req, res, next) {
  // Schema
  const sqlAnswerSchema = Joi.object().keys({
    task: Joi.string().required(),
    correct: Joi.boolean().required(),
    query: Joi.string().required(),
  });

  // Validate
  const { error, value } = sqlAnswerSchema.validate(req.body, { abortEarly: false });
  if (error) return next(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);

  // Get Users Collections
  const users = db.get().collection("users");
  const user = await users.findOne({ _id: new ObjectID(req.user.userId) });

  // conduct payload
  const payload = {
    correct: value.correct,
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
router.post("/recover", async function (req, res, next) {
  // Schema
  const recoverSchema = Joi.object().keys({
    username: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
  });

  // Validate
  const { error, value } = recoverSchema.validate(req.body, { abortEarly: false });
  if (error) return next(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);

  // Get Users Collections
  const users = db.get().collection("users");
  users
    .findOneAndUpdate(
      { username: value.username },
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
      // Send email
      const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);
      const link = req.protocol + "://" + req.headers.host + "/api/user/reset/" + user.resetPasswordToken;
      await client.sendEmail({
        From: process.env.FROM_SENDER,
        To: user.username,
        Subject: "Password change request",
        TextBody: `Hi ${user.username} \n 
    Please click on the following link ${link} to reset your password. \n\n 
    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        MessageStream: "outbound",
      });
      return res.json({ message: "Password reset link sent!" });
    })
    .catch((err) => next(err));
});

// /users/reset
// Reset the password
router.post("/reset", async function (req, res, next) {
  // Schema
  const resetSchema = Joi.object().keys({
    token: Joi.string().required(),
    password: Joi.string().min(5).max(20).required(),
  });

  // Validate
  const { error, value } = resetSchema.validate(req.body, { abortEarly: false });
  if (error) return next(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);

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
      if (!user) return next("Invalid request");
      // Send email
      const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);
      await client.sendEmail({
        From: process.env.FROM_SENDER,
        To: user.username,
        subject: "Your password has been changed",
        TextBody: `Hi ${user.username} \n 
          This is a confirmation that the password for your account ${user.username} has just been changed.\n`,
        MessageStream: "outbound",
      });

      return res.json({ message: "Password reset was successfully!" });
    })
    .catch((err) => next(err));
});

// export
module.exports = router;

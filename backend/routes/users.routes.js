const express = require("express");
const router = express.Router();
var Joi = require("joi");
var db = require("../utils/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config.json");

// req.user.sub

// /users/register
router.post("/register", async function (req, res, next) {
  // Schema
  const registerSchema = Joi.object().keys({
    username: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().min(5).max(20).required(),
  });

  // Validate
  const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
  if (error) return next(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);

  // Get Users Collections
  const users = db.get().collection("users");

  // Check if user already exists
  if (await users.findOne({ username: value.username })) return next("User already exists!");

  // Hash password
  value.password = await bcrypt.hashSync(value.password, 10);

  // Insert into Database
  users
    .insertOne(value)
    .then(() => res.json({}))
    .catch((err) => next(err));
});

// /users/authenticate
router.post("/authenticate", async function (req, res, next) {
  // Schema
  const authSchema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });

  // Validate
  const { error, value } = authSchema.validate(req.body, { abortEarly: false });
  if (error) return next(`Validation error: ${error.details.map((x) => x.message).join(", ")}`);

  // Get Users Collections
  const users = db.get().collection("users");
  const user = await users.findOne({ username: value.username });
  if (user && bcrypt.compareSync(value.password, user.password)) {
    const token = jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: "7d" });
    let { password, ...u } = user;
    const retVal = { user: u, token };
    return res.json(retVal);
  } else {
    return next("Username or password is incorrect");
  }
});

// export
module.exports = router;

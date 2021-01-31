// schemas.js
const Joi = require("joi");
const schemas = {
  registerPOST: Joi.object().keys({
    username: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().min(5).max(20).required(),
  }),
  // define all the other schemas below
};
module.exports = schemas;

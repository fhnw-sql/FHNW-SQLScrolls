// users.js
const Joi = require("joi");

const userSchemas = {
  // Registration
  registerPOST: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().min(5).max(20).required(),
  }),
  // Authentication
  authenticatePOST: Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }),
  // AnswerSQL
  answerSqlPATCH: Joi.object().keys({
    task: Joi.string().required(),
    correct: Joi.boolean().required(),
    query: Joi.string().required(),
  }),
  // Recover
  recoverPOST: Joi.object().keys({
    username: Joi.string().required(),
  }),
  // Reset
  resetPOST: Joi.object().keys({
    token: Joi.string().required(),
    password: Joi.string().min(5).max(20).required(),
  }),

};

module.exports = userSchemas;

const logger = require("../utils/logger");

/**
 * reqBodyValidator
 * @param {*} schema
 * @param {*} property
 */
const reqBodyValidator = (schema, property) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    const valid = error == null;

    if (valid) {
      next();
    } else {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");
      logger.error(message);
      return next(message);
    }
  };
};
module.exports = reqBodyValidator;

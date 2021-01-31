const logger = require("../utils/logger");

/**
 * ReqValidator
 * @param {*} schema
 * @param {*} property
 */
const reqValidator = (schema, property) => {
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
module.exports = reqValidator;

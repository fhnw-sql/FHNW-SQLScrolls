const logger = require("./logger");

const environmentVariables = ["MONGODB_URI", "POSTMARK_API_KEY", "FROM_SENDER", "JWT_SECRET"];

function validateEnvVars() {
  let err = environmentVariables.filter((m) => !process.env[m]);
  if (err.length > 0) {
    logger.error(`Environment variables: ${err.join(",")} is not set!`);
    throw new Error(`Environment variables:  ${err.join(",")}  should be set!`);
  }
}

module.exports = validateEnvVars;

const winston = require("winston");

// Format Console Output
const consoleFormat = winston.format.combine(
  winston.format.colorize({
    all: true,
  }),
  winston.format.label({
    label: "[LOGGER]",
  }),
  winston.format.timestamp({
    format: "YY-MM-DD HH:MM:SS",
  }),
  winston.format.printf((info) => `${info.label} ${info.timestamp} ${info.level} ${info.message}`)
);

// Create Logger
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), consoleFormat),
    }),
  ],
});

// Export
module.exports = logger;

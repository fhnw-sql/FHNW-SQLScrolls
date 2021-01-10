const mongoClient = require("mongodb").MongoClient;
const logger = require("./logger");

let mongodb;
function connect(callback) {
  // Check for MONGODB_URI
  if (!process.env.MONGODB_URI) {
    logger.error("Environment variable: MONGODB_URI is not set!");
    throw new Error("Environment variable: MONGODB_URI should be set!");
  }
  mongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) return logger.error(err);
    logger.info("Database Connected");
    mongodb = client.db();
    callback();
  });
}
function get() {
  return mongodb;
}

function close() {
  mongodb.close();
}

module.exports = {
  connect,
  get,
  close,
};

const mongoClient = require("mongodb").MongoClient;
const logger = require("./logger");

let mongodb;
function connect(callback) {
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

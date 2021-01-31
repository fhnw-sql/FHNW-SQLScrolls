const mongoClient = require("mongodb").MongoClient;
const logger = require("./logger");

let mongodb, client;

async function connect() {
  try {
    client = await mongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info("Database Connected");
    mongodb = client.db();
  } catch (err) {
    logger.error(err);
  }
}

function get() {
  return mongodb;
}

async function close() {
  await client.close();
}

module.exports = {
  connect,
  get,
  close,
};

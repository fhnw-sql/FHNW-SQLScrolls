const mongoClient = require("mongodb").MongoClient;
const logger = require("./logger");

let mongodb, client;

async function connect() {
  if (mongodb) return mongodb; // Return if already connected
  try {
    client = await mongoClient.connect(process.env.MONGODB_URI);
    logger.info("Database Connected");
    mongodb = client.db();

    // ✅ Add this line:
    console.log("✅ Connected to DB:", mongodb.databaseName);

    return mongodb;
  } catch (err) {
    logger.error("MongoDB connection error:", err.message);
    throw err;
  }
}



function get() {
  if (!mongodb) {
    throw new Error("Database not connected. Call connect() first.");
  }
  return mongodb;
}


async function close() {
  if (!client) {
    logger.warn("close() called but client was not initialized.");
    return;
  }
  try {
    await client.close();
    logger.info("Database connection closed.");
  } catch (err) {
    logger.error("Error closing MongoDB connection:", err.message);
  }
}


module.exports = {
  connect,
  get,
  close,
};

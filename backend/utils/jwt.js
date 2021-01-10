const expressJwt = require("express-jwt");
const config = require("config.json");
var db = require("../utils/db");
const logger = require("./logger");
const { ObjectID } = require("mongodb");

// JWT
function jwt() {
  const secret = config.jwtSecret;
  return expressJwt({ secret, algorithms: ["HS256"], isRevoked }).unless({
    path: [
      // public routes that don't require authentication
      "/",
      "/users/authenticate",
      "/users/register",
    ],
  });
}

// Revoke
async function isRevoked(req, payload, done) {
  const user = await db
    .get()
    .collection("users")
    .findOne({ _id: new ObjectID(payload.userId) });

  // revoke token if user no longer exists
  if (!user) {
    return done(null, true);
  }

  done();
}

// Export
module.exports = jwt;

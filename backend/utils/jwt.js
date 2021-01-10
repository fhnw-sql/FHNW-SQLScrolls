const expressJwt = require("express-jwt");
const config = require("config.json");
var db = require("../utils/db");

// JWT
function jwt() {
  const secret = config.jwtSecret;
  return expressJwt({ secret, algorithms: ["HS256"], isRevoked }).unless({
    path: [
      // public routes that don't require authentication
      "/users/authenticate",
      "/users/register",
    ],
  });
}

// Revoke
async function isRevoked(req, payload, done) {
  const user = await db.collection("users").findOne({ _id: payload.sub });

  // revoke token if user no longer exists
  if (!user) {
    return done(null, true);
  }

  done();
}

// Export
module.exports = jwt;

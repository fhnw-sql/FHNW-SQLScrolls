const {expressjwt: jwt} = require("express-jwt");
const {ObjectId} = require("mongodb");
const db = require("../utils/db");

// JWT Middleware
function jwtMiddleware() {
    const secret = process.env.JWT_SECRET;
    return jwt({secret, algorithms: ["HS256"], requestProperty: "auth", isRevoked}).unless({
        path: [
            // public routes that don't require authentication
            "/",
            "/users/authenticate",
            "/users/authenticateSWITCHaai",
            "/users/register",
            "/users/reset",
            "/users/recover",
        ],
    });
}

// Revocation check
async function isRevoked(req, token) {
    try {
        const userId = token.payload.userId;
        if (!ObjectId.isValid(userId)) return true;

        const user = await db
            .get()
            .collection("users")
            .findOne({_id: new ObjectId(userId)});

        return !user; // revoked if user doesn't exist
    } catch (err) {
        console.error("JWT revoke check failed:", err);
        return true;
    }
}

module.exports = jwtMiddleware;

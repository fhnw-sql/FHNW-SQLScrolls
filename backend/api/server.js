if (typeof globalThis === 'undefined') {
    global.globalThis = global;
}
require("rootpath")();
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("./middlewares/jwt");
const logger = require("./utils/logger");
const db = require("./utils/db");
const validateEnvVars = require("./utils/envVarValidator");
const errorHandler = require("./middlewares/errorHandler");

// Check all environment variables
validateEnvVars();
const app = express();

// Set Port
const port = process.env.NODE_ENV === "production" ? process.env.PORT || 80 : process.env.PORT || 4001;

// Main async function to initialize server
(async () => {
    try {
        await db.connect(); // Ensure DB connection before loading routes
        logger.info("Connected to MongoDB");

        // Add BodyParser & CORS
        app.use(express.urlencoded({extended: false}));
        app.use(express.json());
        app.use(cors());

        // JWT middleware
        app.use(jwt());

        app.use((req, res, next) => {
            if (req.auth) {
            }
            next();
        });

        app.use((err, req, res, next) => {
            if (err.name === "UnauthorizedError") {
                console.warn("JWT Auth error:", err.message);
                res.status(401).json({message: "Invalid Token"});
            } else {
                next(err);
            }
        });

        // API Routes (safe to require now)
        app.use("/users", require("./routes/users.routes"));

        // Default health check route
        app.get("/", function (req, res) {
            res.send("Up and running \n cookie: " + req.headers.cookie);
        });

        // Global error handler
        app.use(errorHandler);

        // Start server
        if (!process.env.JEST_WORKER_ID) {
            app.listen(port, function () {
                logger.info("Server listening on port " + port);
            });
        }
    } catch (err) {
        logger.error("Failed to start server:", err.message);
        process.exit(1);
    }
})();

module.exports = app;

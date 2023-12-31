﻿require("rootpath")();
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
var app = express();

// add BodyParser & Cors
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// use JWT auth to secure the api
app.use(jwt());

// api routes
app.use("/users", require("./routes/users.routes"));

// Defalt health route
app.get("/", function (req, res) {
  res.send("Up and running 🐛 \n cookie: " + req.headers.cookie);
});

// global error handler
app.use(errorHandler);

// Set Port
const port = process.env.NODE_ENV === "production" ? process.env.PORT || 80 : process.env.PORT || 4000;

// start server
if (!process.env.JEST_WORKER_ID) {
  db.connect().then((m) => {
    app.listen(port, function () {
      logger.info("Server listening on port " + port);
    });
  });
}

module.exports = app;

require("rootpath")();
require("dotenv").config();

var fs = require('fs');
var https = require('https');

const express = require("express");
const cors = require("cors");
const jwt = require("./middlewares/jwt");
const logger = require("./utils/logger");
const db = require("./utils/db");
const validateEnvVars = require("./utils/envVarValidator");
const errorHandler = require("./middlewares/errorHandler");

// Check all environment variables
validateEnvVars();

// setup ssl
var privateKey = fs.readFileSync(process.env.SSL_KEY || '/etc/ssl/private/nginx-selfsigned.key');
var certificate = fs.readFileSync(process.env.SSL_CERT || '/etc/ssl/certs/nginx-selfsigned.crt');
var credentials = {key: privateKey, cert: certificate};

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
  res.send("Up and running 🐛");
});

// global error handler
app.use(errorHandler);

// Set Port
const port = process.env.NODE_ENV === "production" ? process.env.PORT || 80 : process.env.PORT || 4000;

// start server
var httpsServer = https.createServer(credentials, app);

if (!process.env.JEST_WORKER_ID) {
  db.connect().then((m) => {
    httpsServer.listen(port, function () {
      logger.info("Server listening on port " + port);
    });
  });
}

module.exports = app;

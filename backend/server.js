require("rootpath")();
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("utils/jwt");
const errorHandler = require("utils/error-handler");
const logger = require("utils/logger");
const db = require("utils/db");

// user BodyParser & Cors
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// use JWT auth to secure the api
app.use(jwt());

// api routes
app.use("/users", require("./routes/users.routes"));

// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === "production" ? process.env.PORT || 80 : process.env.PORT || 4000;
db.connect(() => {
  app.listen(port, function () {
    logger.info("Server listening on port " + port);
  });
});

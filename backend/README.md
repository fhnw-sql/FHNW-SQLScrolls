# 🔍 Introduction
 This repository is the backend API for the FHNW-SQL-Training-Game which is used to determine the effectiveness and acceptance of a learning game as an alternative learning method within the Bachelor of Business Information Technology at the FHNW, with regard to practising the structured query language (SQL) which is taught as part of the Database Technology course.

**Technologies:**
- Node.JS
- MongoDB

## 💾 Getting Started
For running the project a working Node.JS environment ist required. Afterwards the project dependencies can be installed with `npm i` as usuall.
The following `npm run` commands are available:
- `start` -> starts the api
- `start:dev` -> start the api over nodemon with livereload support
- `test` -> runs the jest tests
- `test:coverage` -> produces a report for jest tests coverage
- `test:watch` -> runs jest test with livereload support
``

## ⚡ API

### Response Codes
Possible codes: 
* `200: Success`
* `400: Bad Request`
* `401: Unauthorized`
* `500: Internal Server Error`


### Endpoint: Users
* `POST: /users/register`
  * `username:string`
  * `password:string`
* `POST: /users/authenticate`
  * `username:string`
  * `password:string`
* `POST: /users/recover`
  * `username:string`
* `POST: /users/reset`
  * `token:string`
  * `password:string`
* `GET: /users/self`
* `PATCH: /users/self/answer_sql`
  * `task:string`
  * `correct:bool`
  * `query:string`


## ⚙️ Configuration
### Environment Variables
* `NODE_ENV` -> Development / Production
* `PORT` -> The port on which the API should run
* `MONGODB_URI` -> MongoDB Connection String
* `POSTMARK_API_KEY` -> Postmark API Key for sending the mails.


## 📦 Packages
The used third party packages for the API are described in the following subchapters. For further information about a single package visit npmjs.com.

### bcryptjs
Optimized bcrypt in JavaScript with zero dependencies. Compatible to the C++ bcrypt binding on node.js and also working in the browser.
Used for the password encryption.

### body-parser
Node.js body parsing middleware.
Parse incoming request bodies in a middleware before your handlers, available under the req.body property.

### cors
CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.

### dotenv
Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env. Storing configuration in the environment separate from code is based on The Twelve-Factor App methodology.

### express
Fast, unopinionated, minimalist web framework for node.

### express-jwt
This module provides Express middleware for validating JWTs (JSON Web Tokens) through the jsonwebtoken module. The decoded JWT payload is available on the request object.

### joi
Data validation library for JS. Used to validate the incoming payloads.

### jsonwebtoken
An library to create JSON Web Tokens.

### mongodb
The official MongoDB driver for Node.js. Provides a high-level API on top of mongodb-core that is meant for end users.

### postmark
Official Node.js library for interacting with the postmark service to send mails. Can be replaced with sending mails over an internal SMTP server.

### rootpath
Little helper to make node.js require relative to your project root

### winston
A logger for just about everything.

# 🔍 Introduction
This repository is the backend API for the FHNW-SQL-Training-Game which is used to determine the effectiveness and acceptance of a learning game as an alternative learning method within the Bachelor of Business Information Technology at the FHNW, concerning practising the structured query language (SQL) which is taught as part of the Database Technology course.

**Technologies:**
- Node.JS
- MongoDB

## ⚙️ Configuration
### Environment Variables
* `NODE_ENV` -> Development / Production
* `PORT` -> The port on which the API should run
* `MONGODB_URI` -> MongoDB Connection String
* `POSTMARK_API_KEY` -> Postmark API Key for sending the mails.

## 💾 Getting Started
For running the project, a working Node.JS and MongoDB environment is required. Afterwards, one can install the project dependencies with `npm i` as usual.
The following `npm run` commands are available:
- `start` -> starts the api
- `start:dev` -> start the api over nodemon with livereload support
- `test` -> runs the jest tests
- `test:coverage` -> produces a report for jest tests coverage
- `test:watch` -> runs jest test with livereload support

### 🔮 Deployment
To deploy the API one can consider one of the mentioned ways below: Docker, BareboneNodeJS, Herok. We recommend to use docker.
**However, if you want to deploy the whole solution (Frontend, Backend, DB) consider the Docker Compose section on the Frontend project.**

#### 🐋 Docker
The following steps assume that a basic understanding of docker already exists. If this is not the case, the following book is recommended [Docker: Up & Running: Shipping Reliable Containers in Production](https://www.oreilly.com/library/view/docker-up/9781492036722/).

To spin-up the container run the following commands, don't forget to replace the environments variables with your actual configuration:

1. Run `docker build -t FHNW-SQL-Training-Game-API-1.0 .`
2. Run `docker run -dp 3000:3000 FHNW-SQL-Training-Game-API-1.0 -e NODE_ENV='Production' -e MONGODB_URI='{MONGODB_URI}' -e POSTMARK_API_KEY='POSTMARK_API_KEY}'

The API is now exposed on the PORT 3000 on the docker host.

#### 👣 Barebone Node
The barebone workflow for NodeJS requires Node 14.x and npm installed on the host as also a basic knowledge of Node. If this is not the case, the following book is recommended [Powers, S. (2016). Learning Node: Moving to the Server-Side](https://www.oreilly.com/library/view/learning-node-2nd/9781491943113/). Don't forget to configure the environment variables.


```js
# Install the app
npm install
# Run the app
npm run start
```

#### ☁️ Heroku
To easily spin-up and instance the one-click deployment to Heroku can be used by using the button below (don't forget to configure the environment variables).

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/FHNW-SQL-Training-Game/FHNW-SQL-Training-Game-API)

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

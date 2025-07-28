# 🌐 Backend: REST API (Node.js + MongoDB)

**[Dockerfile](../../backend/api/Dockerfile)**

## 📂 Component Folder Structure

```
backend/api/
├── middlewares/                            # Request & authentication handling and validation
├── routes/                                 # Express.js application API endpoints (HTTP requests, database, etc.)
├── schemas/                                # Validation schemas for the API endpoints
├── tests/                                  # Automated written testing with Jest
├── utils/                                  # Various javascript utilities
├── Dockerfile                              # Docker container configuration
├── package.json                            # NPM management file
├── package-lock.json                       # NPM generated source file (do not manually edit)
└── server.js                               # Main Express.js application entry point
```

---

## ⚡ API

### 🗨️ Response Codes

Possible codes:

* `200: Success`
* `400: Bad Request`
* `401: Unauthorized`
* `500: Internal Server Error`

### 👥 Endpoint: Users

#### Authentication & Password Management

- POST `/users/register` - Register new user
- POST `/users/authenticate` - Regular user authentication
- POST `/users/authenticateSWITCHaai` - SWITCH AAI authentication
- POST `/users/recover` - Request password recovery
- POST `/users/reset` - Reset password with token

#### User Data Retrieval

- GET `/users/self` - Get current user's data
- GET `/users/all` - Get all users (active in last year)
- GET `/users/classFiltered` - Get users with same classKey
- GET `/users/recommend-task` - Get task recommendations for user

#### User Profile Updates

- PATCH `/users/self/stars` - Update user's stars
- PATCH `/users/self/timeLastActive` - Update user's last active timestamp
- PATCH `/users/self/timeStarsEarned` - Update timestamp when stars were earned
- PATCH `/users/self/classKey` - Update user's class key
- PATCH `/users/self/togglePrivacy` - Toggle user's privacy settings and alias name
- PATCH `/users/self/certificate` - Generate user certificate
- PATCH `/users/self/answer_sql` - Record SQL answer submission
- PATCH `/users/self/restart` - Delete user history (archives it first)

---

## 📦 Dependencies

**Managing dependencies:**

You should install NPM - Node Package Manager locally.

- All dependencies are managed via `package.json` and installed with `npm install`.
- To add, update, or remove packages, edit `package.json` and run `npm install` again.

**Key Packages:**

- `express` – Core Node.js web framework for building REST APIs.
- `mongodb` – Official MongoDB driver for Node.js.
- `body-parser` – Middleware for parsing incoming request bodies.
- `cors` – Enables Cross-Origin Resource Sharing.
- `dotenv` – Loads environment variables from `.env` file.
- `bcryptjs` – Password hashing and encryption.
- `jsonwebtoken` & `express-jwt` – Authentication and JWT validation.
- `joi` – Schema validation for request data.
- `postmark` – Sends transactional emails (password resets, etc).
- `winston` – Logging for Node.js applications.
- `rootpath` – Simplifies project-relative imports.



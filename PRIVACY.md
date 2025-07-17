# 🔐 Usage of Data

The following describes the data which is collected on users playing the game. At the start of registration, a user
document is created containing the username (email), the chosen password encrypted with the leading industry
standard [bcryptjs](https://www.npmjs.com/package/bcryptjs) and a record for the time of the registration. Furthermore,
a user can generate themselves a pseudonym / alias inside the game to hide the username inside the leaderboard (
usernames are truncated email addresses, removing the domain of the name). This was done primarily for the needs of
FHNW. It enables students to be able to identify and compare each other inside the leaderboard feature. However, if one
feels uncomfortable with the encryption, one can use a fake password. You can also choose a fake email to protect your
privacy, so the email doesn't need to exist. But please make sure to securely save your email and password as you won't
be able to recover the account with a fake email, as the password recovery uses two-step verification (1. Request
password recovery mail, 2. Click reset password link). During game play, a history of the answers with a timestamp is
logged as seen in the example below. Those data are used to store your game journey and allow you to come back to the
game to continue playing 🙂. We will calculate average attempts and the time taken for an attempt for a task or filter
the tasks based on some criteria. We will use the usage data to improve the game.

The whole project and its codebase is open source and publicly available under
the [GitHub](https://github.com/FHNW-SQL-Training-Game/) repository.

## 📃 Example database entry

```json
{
  "_id": "6879265a28fd76650222e959",
  "username": "philipp.hutter@students.fhnw.ch",
  "registrationDate": "2025-07-17T16:35:38.113Z",
  "stars": 4,
  "timeLastActive": "2025-07-17T16:36:41.886Z",
  "timeStarsEarned": "2025-07-17T16:36:48.611Z",
  "history": {
    "task-000": [
      {
        "correct": true,
        "date": 1752770151375,
        "query": "SELECT name from ghosts",
        "startTime": "2025-07-17T16:35:48.022Z",
        "endTime": "2025-07-17T16:35:51.368Z"
      }
    ],
    "task-011": [
      {
        "correct": false,
        "date": 1752770190669,
        "query": "Write a SQL query...",
        "startTime": "2025-07-17T16:36:28.995Z",
        "endTime": "2025-07-17T16:36:30.662Z"
      },
      {
        "correct": false,
        "date": 1752770192486,
        "query": "Write a SQL query...",
        "startTime": "2025-07-17T16:36:31.933Z",
        "endTime": "2025-07-17T16:36:32.481Z"
      },
      {
        "correct": true,
        "date": 1752770194925,
        "query": "SELECT * FROM Ghosts WHERE YEAR='1650'",
        "startTime": "2025-07-17T16:36:32.481Z",
        "endTime": "2025-07-17T16:36:34.919Z"
      }
    ],
    "task-010": [
      {
        "correct": true,
        "date": 1752770200939,
        "query": "SELECT DISTINCT NAME FROM Ghosts WHERE YEAR='1833'",
        "startTime": "2025-07-17T16:36:38.689Z",
        "endTime": "2025-07-17T16:36:40.933Z"
      }
    ]
  },
  "aliasName": "RevivedVoldemort9",
  "isPublic": false,
  "classKey": "Database2025",
  "resetPasswordExpires": null,
  "resetPasswordToken": null
}
```

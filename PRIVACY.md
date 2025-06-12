# 🔐 Usage of Data
The following describes the data which is collected on users playing the game.
At the start of registration, a user document is created containing the username (email) and the chosen password encrypted with the leading industry standard [bcryptjs](https://www.npmjs.com/package/bcryptjs). However, if one feels uncomfortable with the encryption, one can use a dummy password. You can also choose a dummy email to protect your privacy, so the email doesn't need to exist. But please make sure to securely save your email and password as you won't be able to recover the account with a fake email, as the password recovery uses two-step verification (1. Request password recovery mail, 2. Click reset password link). During game play, a history of the answers with a timestamp is logged as seen in the example below. Those data are used to store your game journey and allow you to come back to the game to continue playing 🙂. We will use the usage data to improve the game. We will calculate average attempts for a task or filter the tasks based on some criteria.  

To provide further transparency, the backend is open source and publicly available under [API Project](https://github.com/FHNW-SQL-Training-Game/FHNW-SQL-Training-Game-API)

## 📃 Example database entry
```json
{
    "_id": {
        "$oid": "5ffdc4e52a57400814793c14"
    },
    "username": "{email}",
    "password": "{password bcrypted}",
    "history": {
        "task-001": [{
            "correct": false,
            "date": {
                "$numberLong": "1612338596005"
            },
            "query": "SELECT name of each ghosts FROM Ghosts"
        }, {
            "correct": false,
            "date": {
                "$numberLong": "1612338611266"
            },
            "query": "SELECT * FROM Ghosts"
        }, {
            "correct": true,
            "date": {
                "$numberLong": "1612338617716"
            },
            "query": "SELECT name FROM Ghosts"
        }],
        "task-002": [{
            "correct": true,
            "date": {
                "$numberLong": "1612338660865"
            },
            "query": "SELECT name, year FROM Ghosts"
        }],
        "task-003": [{
            "correct": false,
            "date": {
                "$numberLong": "1612338698380"
            },
            "query": "SELECT year from ghost WHERE NAME = \"Sieglinde\""
        }, {
            "correct": true,
            "date": {
                "$numberLong": "1612338708483"
            },
            "query": "SELECT year from ghosts WHERE NAME = \"Sieglinde\""
        }]
    },
    "resetPasswordExpires": null,
    "resetPasswordToken": null
}
```

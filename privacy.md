# 🔐 Usage of Data
The following document shortly describes the data which is collected while playing the game.
By beginning on the registration process, a user document is created containing the username (email) and the chosen password encrypted with the leading industry standard [bcryptjs](https://www.npmjs.com/package/bcryptjs). However, if one feels uncomfortable with the encryption, one can use a dummy password. You can also choose a dummy email to protect your privacy, that doesn't need to exist. But make sure to securely save your password as you won't be able to recover it with a fake email as the password recovery follow a two-step verification (1. Request password recovery mail, 2. Click reset password link). As soon one plays the game, a history of the answers according to time is logged as seen from the example below. Those data are used to persist your game journey if you want to come back in a week 🙂 . Still, we need it also for the analytical purpose like average attempts for a task or identifying the difficulties of a task subset.  

To provide further transparency of the data used the whole backed is open source and publicly available under [API Project](https://github.com/FHNW-SQL-Training-Game/FHNW-SQL-Training-Game-API)

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

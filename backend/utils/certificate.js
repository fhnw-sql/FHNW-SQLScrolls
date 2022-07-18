const db = require("../utils/db");
const ObjectId = require("mongodb").ObjectId;

function getTasks(progression) {
   return [].concat.apply([], progression.map(b => b.tasks)).slice(0, 5)
}

function checkIfFinished(user, progression) {
    let tasks = getTasks(progression)
    let history = user.history

    if (!history) {
        return false
    }
    
    for(let task of tasks) {
        let taskName = 'task-' + task
        let answers = history[taskName]

        if (!answers) {
            return false
        }

        let correct = answers.filter(answer => answer.correct)

        if (correct.length < 1) {
            return false
        }        
    }
    return true
}
  
function checkIfNew(user, progression) {
    let certificates = user.certificates

    if (!certificates) {
        return true
    }

    //check previous certificates
    let startDate = user.history['task-000'][0].date
    let numStars = getTasks(progression).length

    let duplicates = certificates.filter(c => (c.stars >= numStars)&&(c.date>=startDate))

    return (duplicates.length == 0);
}
  
function generateCertificate(user, progression) {

    let certificate = {
        _id: new ObjectId(),
        date: Date.now(),
        stars: getTasks(progression).length,
        name: user.givenname + ' ' + user.surname,
        email: user.username
    }

    return certificate;
}
  
module.exports = {
    checkIfFinished,
    checkIfNew,
    generateCertificate,
};
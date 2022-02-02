const models = require('mongoose').models

const timeout = new createTimeout(20000)
function payOnMessage(message) {
    if (message.author.bot) return

    timeout.check(message.author, pay, () => {
        console.log('On timeout, no pay.')
    })
}

async function pay(user) {
    const { Users } = models

    var userDoc = await models.Users.getByUid(user.id)
    if (!userDoc) userDoc = Users.create(user.id)

    await userDoc.addBalance(100)
}

function createTimeout(max_diff = 20000) {
    var log = new Map()

    this.check = function (user, valid, invalid) {
        if (log.has(user.id)) {
            var lastTime = log.get(user.id)
            var now = new Date()
            var diff = now - lastTime

            if (diff > max_diff) {
                log.set(user.id, now)
                valid(user)
            } else invalid()
        } else {
            log.set(user.id, new Date())
            valid(user)
        }
    }
}

module.exports.name = 'messageCreate'
module.exports.exec = (message) => {
    payOnMessage(message)
}
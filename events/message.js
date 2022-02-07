const models = require('mongoose').models
const Utils = require('../utils')

var delay = 30
const timeouts = new Utils.Timeouts(delay)
function xpOnMessage(message) {
    var valid = () => {
        message.channel.messages.fetch()
            .then(messages => {
                messages = messages.filter(i => {
                    var isAuthor = (i.author.id == message.author.id)

                    var timeDif = Date.now() - i.createdAt
                    var isAfter = (timeDif > (delay * 1000))
                    var isBefore = (timeDif < -700) // Usually when this runs the last message has been sent a couple ms ago

                    return isAuthor && (!isAfter && !isBefore)
                })

                var nCharsMessages = 0, nMessages = 0
                messages.forEach(msg => {
                    nCharsMessages += msg.content.length
                    nMessages += 1
                })

                var max = Math.floor(15 / ((nMessages / nCharsMessages) + 0.01))
                if (isNaN(max)) max = 60

                var min = Math.floor(max * 0.3)

                getUserAnd(message.author, 'addXP', Utils.getRandomInt(max, min))
                getUserAnd(message.author, 'checkLevelUp', 1000)
            })
    }

    var invalid = () => console.log('On timeout, no reward.')
    timeouts.check(message.author.id, 'xp', valid, invalid)
}

function payOnMessage(message) {
    var valid = () => getUserAnd(message.author, 'addBalance', Utils.getRandomInt(15, 5))
    var invalid = () => console.log('On timeout, no pay.')

    timeouts.check(message.author.id, 'pay', valid, invalid)
}

async function getUserAnd(user, toRun, param) {
    const { Users } = models

    var userDoc = await models.Users.getByUid(user.id)
    if (!userDoc) userDoc = Users.create(user.id)

    await userDoc[toRun](param)
}

module.exports.name = 'messageCreate'
module.exports.exec = (message) => {
    if (message.author.bot) return
    // payOnMessage(message)
    xpOnMessage(message)
}

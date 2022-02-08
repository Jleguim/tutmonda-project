const models = require('mongoose').models
const Utils = require('../utils')

const xpTimeout = new Utils.Timeout()
function xpOnMessage(message, guiconf) {
    var valid = async () => {
        var messages = await message.channel.messages.fetch()
        messages = messages.filter(i => i.author.id == message.author.id)
        messages = messages.filter(i => i.createdAt > (Date.now() - xpTimeout.delay))

        var msgs = messages.size, chars = 0
        messages.forEach(msg => chars += msg.content.length)

        var max = Math.floor(15 / ((msgs / chars) + 0.01))
        var min = Math.floor(max * 0.3)
        var randomXp = Utils.getRandomInt(max, min)

        getUserAnd(message.author, 'addXP', randomXp)
        getUserAnd(message.author, 'checkLevelUp', guiconf.perLvlXp)
    }

    var invalid = () => console.log('On timeout, no reward.')
    xpTimeout.check(message.author.id, valid, invalid)
}

async function getUserAnd(user, toRun, param) {
    const { Users } = models

    var userDoc = await models.Users.getByUid(user.id)
    if (!userDoc) userDoc = Users.create(user.id)

    await userDoc[toRun](param)
}

module.exports.name = 'messageCreate'
module.exports.exec = async (message) => {
    const { GuildConfigs } = models
    if (message.author.bot) return

    var guiconf = await GuildConfigs.getByGuid(message.guild.id)
    if (!guiconf) {
        guiconf = new GuildConfigs({ guid: message.guild.id })
        await guiconf.save()
    }

    xpTimeout.delay = guiconf.xpTimeout
    xpOnMessage(message, guiconf)
}

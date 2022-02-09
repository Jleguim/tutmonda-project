const models = require('mongoose').models
const Utils = require('../utils')

module.exports.name = 'messageCreate'
module.exports.exec = async (message) => {
    const { GuildConfigs } = models
    if (message.author.bot) return

    var guiconf = await GuildConfigs.getByGuid(message.guild.id)
    if (!guiconf) {
        guiconf = new GuildConfigs({ guid: message.guild.id })
        await guiconf.save()
    }

    var XpManager = new Utils.XpManager(guiconf)
    XpManager.onMessageCreate(message)
}

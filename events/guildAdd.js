const models = require('mongoose').models

async function createGuildConfig(guid) {
    const { GuildConfigs } = models
    const guiconf = new GuildConfigs({ guid })
    await guiconf.save()
}

module.exports.name = 'guildAdd'
module.exports.exec = (guild) => {
    createGuildConfig(guild.id)
}

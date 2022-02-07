const models = require('mongoose').models

class ConfigManager {
    constructor(guid) {
        const { GuildConfigs } = models
        this._ = new GuildConfigs({ guid })

        GuildConfigs.getByGuid(guid)
        .exec((err, guiconf) => {
            if (err) console.error(err)

            if (!guiconf) {
                this._ = new GuildConfigs(guid)
                this._.save()
            }
            
            this._ = guiconf
        })
    }

    set commandChannels(value) {
        this._.commandChannels = value
        this._.save()
        return this.commandChannels
    }

    get commandChannels () {
        return this._.commandChannels
    }

    set perLvlXp(value) {
        this._.levels.perLvlXp = value
        this._.save()
        return this.perLvlXp
    }

    get perLvlXp () {
        return this._.levels.perLvlXp
    }
}

module.exports = ConfigManager
const models = require('mongoose').models

const Timeout = require('./Timeout')
const { getRandomInt } = require('./Functions')

class XpManager {
    constructor(guildConfig) {
        this.guildConfig = guildConfig
        this.config = {
            perLvlXp: guildConfig.perLvlXp,
            timeoutDelay: guildConfig.xpTimeout,
            farmChannels: guildConfig.farmChannels
        }

        this.timeout = new Timeout()
        this.timeout.delay = this.config.timeoutDelay
    }

    calcXp(messages) {
        var MsgsWithinDelay = messages.filter(i => i.createdAt > (Date.now() - this.timeout.delay))
        
        var chars = 0
        MsgsWithinDelay.forEach(msg => {
            chars += msg.content.length
        })

        var max = Math.floor(15 / ((MsgsWithinDelay.size / chars) + 0.01))
        var min = Math.floor(max * 0.3)

        return getRandomInt(max, min)
    }

    async onMessageCreate(message) {
        var userId = message.author.userId

        var valid = this.farmValid(message)
        var invalid = this.farmInvalid(message)

        this.timeout.check(userId, valid, invalid)
    }

    async getUser(uid) {
        const { Users } = models

        var userDoc = await models.Users.getByUid(uid)
        if (!userDoc) userDoc = Users.create(uid)

        return userDoc
    }

    farmValid(message) {
        return async () => {
            if (!this.guildConfig.isFarmChannel(message.channel.id)) return

            var userId = message.author.id
            var userMessages = (await message.channel.messages.fetch())
                .filter(msg => msg.author.id == userId)

            var xp = this.calcXp(userMessages)
            var user = await this.getUser(userId)

            await user.addXP(xp)
            await user.checkLevelUp(this.config.perLvlXp)
        }
    }

    async farmInvalid(message) {
        return () => {
            console.log(`${message.author.id} is on timeout.`)
        }
    }
}

module.exports = XpManager
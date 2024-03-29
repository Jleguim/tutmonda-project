const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const GuildConfig = new Schema({
    guid: String,

    commandChannels: [String],
    farmChannels: [String],
    notifiactionChannels: [String],

    perLvlXp: { type: Number, default: 1000 },
    xpTimeout: { type: Number, default: 30 }
})

GuildConfig.method('isNotificationChannel', function (chuid) {
    return this.notifiactionChannels.includes(chuid)
})

GuildConfig.method('isFarmChannel', function (chuid) {
    return this.farmChannels.includes(chuid)
})

GuildConfig.method('isCommandChannel', function (chuid) {
    return this.commandChannels.includes(chuid)
})

GuildConfig.static('getByGuid', function (guid) {
    return this.findOne({ guid })
})

module.exports = mongoose.model('GuildConfigs', GuildConfig)
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

GuildConfig.method('isCommandChannel', function (chuid) {
    if (this.commandChannels.includes(chuid)) return true
    else return false
})

GuildConfig.static('getByGuid', function (guid) {
    return this.findOne({ guid })
})

module.exports = mongoose.model('GuildConfigs', GuildConfig)
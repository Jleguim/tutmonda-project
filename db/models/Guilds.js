const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const GuildConfig = new Schema({
    guid: String,
    commandChannels: [String],
    levels: {
        perLvlXp: { type: Number, default: 1000 },
        farmChannels: [String],
        notifiactionChannels: [String]
    }
})

GuildConfig.static('getByGuid', function (guid) {
    return this.findOne({ guid })
})

module.exports = mongoose.model('GuildConfigs', GuildConfig)
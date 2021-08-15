const Discord = require('discord.js')
const fs = require('fs')

const Intents = Discord.Intents.FLAGS // QUE ASCO WN AYUDA
const settings = {
    intents: [
        Intents.DIRECT_MESSAGES, Intents.DIRECT_MESSAGE_REACTIONS, Intents.DIRECT_MESSAGE_TYPING,
        Intents.GUILDS, Intents.GUILD_BANS, Intents.GUILD_EMOJIS_AND_STICKERS,
        Intents.GUILD_INTEGRATIONS, Intents.GUILD_INVITES, Intents.GUILD_MEMBERS,
        Intents.GUILD_MESSAGES, Intents.GUILD_MESSAGE_REACTIONS, Intents.GUILD_MESSAGE_TYPING,
        Intents.GUILD_PRESENCES, Intents.GUILD_VOICE_STATES, Intents.GUILD_WEBHOOKS
    ]
}
const client = new Discord.Client(settings)
client._slash = new Map()

module.exports = client
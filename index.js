require('dotenv').config()

const Discord = require('discord.js')
const Intents = Discord.Intents.FLAGS

const client = new Discord.Client({ intents: [Intents.GUILDS, Intents.GUILD_MESSAGES] })

const cmdManager = require('./CommandManager')

const { connection } = require('./db')
const events = require('./events')

connection.then(() => {
    client.once('ready', () => console.log('Ready'))

    events.load(client)
    cmdManager.loadAndRegister()
    client.login(process.env.TOKEN)
})

module.exports.client = client
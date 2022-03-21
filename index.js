require('dotenv').config()

const Discord = require('discord.js')
const Intents = Discord.Intents.FLAGS
const Queue = require('./utils/Queue')

const client = new Discord.Client({ intents: [Intents.GUILDS, Intents.GUILD_MESSAGES] })

const cmdManager = require('./CommandManager')
const commsQueue = new Queue()
const lobbies = new Map()

const { connection } = require('./db')
const events = require('./events')

connection.then(async () => {
    client.once('ready', () => console.log('Ready'))

    events.load(client)
    cmdManager.loadAndRegister()
    await client.login(process.env.TOKEN)
    await cmdManager.createPerms(client)
})

module.exports.client = client
module.exports.commsQueue = commsQueue
module.exports.lobbies = lobbies
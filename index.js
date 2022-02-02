require('dotenv').config()

const Discord = require('discord.js')
const Intents = Discord.Intents.FLAGS

const client = new Discord.Client({ intents: [Intents.GUILDS, Intents.GUILD_MESSAGES] })

const CmdManager = require('./CommandManager')
const cmdManager = new CmdManager()

client.on('interactionCreate', (i) => cmdManager.handleInteractions(i))

client.once('ready', () => {
    console.log('Ready')
    require('./db')
})

cmdManager.loadAndRegister()
client.login(process.env.TOKEN)
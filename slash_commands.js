const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const fs = require('fs')

const client = require('./bot')
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN)

const commandFiles = fs.readdirSync('./slash')

for (const file of commandFiles) {
    const command = require(`./slash/${file}`)
    client._slash.set(command.data.name, command)
}

var route = (process.env.DEV == 'TRUE') ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID) : Routes.applicationCommands(process.env.CLIENT_ID)
var commands = Array.from(client._slash.values()).map(i => i = i.data.toJSON())

rest.put(route, { body: commands })
    .then((cmds) => {
        // console.log(cmds)
    })
    .catch(console.log)
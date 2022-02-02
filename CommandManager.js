const { Routes } = require('discord-api-types/v9')
const { REST } = require('@discordjs/rest')

const Builders = require('@discordjs/builders')
const models = require('mongoose').models
const fs = require('fs')

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN)
const route = (process.env.DEV == 'TRUE')
    ? Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)
    : Routes.applicationCommands(process.env.CLIENT_ID)

class CmdManager {
    constructor(path = './commands/'/**, client*/) {
        this.path = path
        this.commands = new Map()
        // this.client = client
    }

    loadAndRegister() {
        this._loadCommands()
        this._registerCommands()

        // this.client.on('interactionCreate', (i) => this.handleInteractions(i))
    }

    handleInteractions(inter) {
        const { commandName } = inter

        if (!inter.isCommand()) return
        if (!this.commands.has(commandName)) return

        var command = this.commands.get(commandName)
        var params = {}

        command.options.forEach(o => {
            var n = o.name
            params[n] = inter.options.get(n)
        })

        try {
            command.exec(inter, models, params, this.client)
        } catch (error) {
            console.error(error)
        }
    }

    _loadCommands() {
        const files = fs.readdirSync(this.path)
        files.map(f => {
            const cmd = require(this.path + f)
            cmd.info.aliases.forEach(alias => {
                var slash = this._buildCommand(alias, cmd.info.description, cmd.options)
                this.commands.set(slash.name, { ...cmd, slash })
            })
        })
    }

    _buildCommand(name, desc, options) {
        var slashCommand = new Builders.SlashCommandBuilder()
        slashCommand.name = name
        slashCommand.description = desc
        slashCommand.options = options
        return slashCommand
    }

    _registerCommands() {
        var commands = Array.from(this.commands.values())
            .map(i => i = i.slash.toJSON())

        return rest.put(route, { body: commands })
    }
}

module.exports = new CmdManager('./commands/')
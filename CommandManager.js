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
    constructor(path = './commands/') {
        this.path = path
        this.commands = new Map()
    }

    loadAndRegister() {
        this._loadCommands()
        this._registerCommands()
    }

    async handleInteractions(inter) {
        const { commandName } = inter
        const { GuildConfigs } = models

        if (!inter.isCommand()) return
        if (!this.commands.has(commandName)) return
        if (inter.user.bot) return

        var command = this.commands.get(commandName)
        var params = {}

        command.options.forEach(o => {
            var n = o.name
            params[n] = inter.options.get(n)
        })

        if (inter.inGuild()) {
            var guiconf = await GuildConfigs.getByGuid(inter.guildId)
            if (!guiconf) {
                guiconf = new GuildConfigs({ guid: inter.guildId })
                await guiconf.save()
            }
            
            if (!guiconf.isCommandChannel(inter.channelId)) return
            return command.exec(inter, models, params, guiconf)
        }

        command.exec(inter, models, params)
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
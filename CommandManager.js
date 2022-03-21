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

            if(!params[n] && o.options){
                params["subcommand"] = inter.options.getSubcommand(false); // guarda el subcomando que se está ejecutando
                params["subgroup"] = inter.options.getSubcommandGroup(false); // guarda el grupo de subcomandos

                params[n] = undefined;
                subcommandFix(o.options, (x => {
                    params[n] = x
                }));

                function subcommandFix(options, callback){
                    let x = {};

                    options.forEach((option, i) => {
                        let name = option.name;
                        x[name] = inter.options.get(name);

                        if(!x[name]) subcgroupFix(option, (y => {
                            x[name] = y;
                        }))
                    })

                    callback(x)
                }

                function subcgroupFix(options, callback) {
                    if(options.options){
                        subcommandFix(options.options, z => {
                            callback(z)
                        });
                    }
                }
            }
        })

        if (inter.inGuild()) {
            var guiconf = await GuildConfigs.getByGuid(inter.guildId)
            if (!guiconf) {
                guiconf = new GuildConfigs({ guid: inter.guildId })
                await guiconf.save()
            }
            
            if (!guiconf.isCommandChannel(inter.channelId)) {
                inter.reply({ content: 'Aqui no puedes enviar comandos', ephemeral: true })
                return
            }

            return command.exec(inter, models, params, guiconf)
        }

        command.exec(inter, models, params)
    }

    _loadCommands() {
        const files = fs.readdirSync(this.path)
        files.map(f => {
            const cmd = require(this.path + f)
            cmd.info.aliases.forEach(alias => {
                var slash = this._buildCommand(alias, cmd.info.description, cmd.options, cmd.permissions ?? null)
                this.commands.set(slash.name, { ...cmd, slash })
            })
        })
    }

    _buildCommand(name, desc, options, perms) {
        var slashCommand = new Builders.SlashCommandBuilder()
        slashCommand.name = name
        slashCommand.description = desc
        slashCommand.options = options;

        if(perms) slashCommand.setDefaultPermission(false)
        return slashCommand
    }

    _registerCommands() {
        var commands = Array.from(this.commands.values())
            .map(i => i = i.slash.toJSON())

        return rest.put(route, { body: commands })
    }

    async createPerms(client) {
        
        await client.guilds.fetch()
        client.guilds.cache.forEach(async guild => {
            await guild.commands.fetch();
            await client.application.commands.fetch();
            await this._addPerms(guild, client);
        })

        return;
    }

    async _addPerms(guild, client){
        const { GuildConfigs } = models
        let actualPermissions;
        const commandList = process.env.DEV == "TRUE" ? guild.commands.cache : client.application.commands.cache
        commandList.forEach(async comm => {
            let permissions = [];
            const doc = await GuildConfigs.getByGuid(guild.id);

            const files = fs.readdirSync(this.path)
            files.map(f => {
                const cmd = require(this.path + f)
                cmd.info.aliases.forEach(alias => {
                    actualPermissions = cmd.permissions;
                })
            })

            let query = [];
            if(!actualPermissions) return;
            actualPermissions.forEach(p => {
                switch(p){
                    case "OWNER":
                        permissions.push({
                            id: guild.ownerId,
                            type: "USER",
                            permission: true
                        });
                        break;
                    case "ADMIN":
                        query.push(doc.adminRoles)
                        break;
                    case "MOD":
                        query.push(doc.modRoles)
                        break;
                }
            })

            await guild.roles.fetch();

            if(query.length == 0){ // buscar roles con "Admin", si no hay, owner.
                let adminroles = guild.roles.cache.filter(x => x.permissions.has("ADMINISTRATOR") && !x.tags).toJSON();

                if(adminroles.length === 0) permissions.push({ // no hay roles con Admin
                    id: guild.ownerId,
                    type: "USER",
                    permission: true
                });

                adminroles.forEach(perm => {
                    permissions.push({
                        id: perm.id,
                        type: "ROLE",
                        permission: true
                    })
                })
            } else {
                query.forEach(perm => {
                    permissions.push({
                        id: perm.id,
                        type: "ROLE",
                        permission: true
                    })
                })
            }

            await comm.permissions.set({ permissions });
        })
    }
}

module.exports = new CmdManager('./commands/')
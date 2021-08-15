require('dotenv').config()

const Discord = require('discord.js')
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs')

const Intents = new Discord.Intents()
Intents.add(Discord.Intents.FLAGS.DIRECT_MESSAGES, Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING, Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_BANS, Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Discord.Intents.FLAGS.GUILD_INTEGRATIONS, Discord.Intents.FLAGS.GUILD_INVITES, Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING, Discord.Intents.FLAGS.GUILD_PRESENCES, Discord.Intents.FLAGS.GUILD_VOICE_STATES, Discord.Intents.FLAGS.GUILD_WEBHOOKS); // QUE ASCO WN AYUDA

const client = new Discord.Client({ intents: [Intents] })
client.slash = new Discord.Collection();

// slash commands
const commands = []
const commandFiles = fs.readdirSync('./slash').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./events').filter(f => f.endsWith('.js'))

for (const file of eventFiles) { // event handler
    const name = file.replace('.js', '')
    const handler = require(`./events/${file}`)
    client.on(name, handler)
}

for (const file of commandFiles) { // slash commands handler
    const command = require(`./slash/${file}`);
    commands.push(command.data.toJSON());
    client.slash.set(command.data.name, command);
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands("807797165626753054", "807798472051785769"),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (!client.slash.has(commandName)) return;

    try {
        await client.slash.get(commandName).execute(interaction, client);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(process.env.TOKEN)
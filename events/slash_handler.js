const client = require('../bot')

module.exports.name = 'interactionCreate'
module.exports.exec = (interaction) => {
    if (!interaction.isCommand()) return
    if (!client._slash.has(interaction.commandName)) return

    try {
        client._slash.get(interaction.commandName).exec(interaction, client)
    } catch (error) {
        console.error(error)
        interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
}

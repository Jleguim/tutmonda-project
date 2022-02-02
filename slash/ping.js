const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')

module.exports.exec = (interaction, client) => {
	var first = Date.now()
	interaction.reply('Pong!')
		.then(() => {
			var diff = (Date.now() - first)
			var API = (client.ws.ping).toFixed(0)

			var embed = new Discord.MessageEmbed()
				.setTitle(`🔔 Pong!`)
				.setColor((diff >= 180) ? '#ff2f2f' : (diff >= 120) ? '#ffa12f' : '#2fff3d')
				.addField('📶 Ping', `${diff}ms`)
				.addField('💻 API', `${API}ms`)

			interaction.editReply({ content: null, embeds: [embed] })
		})
}

module.exports.data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Revisa la latencia del bot.')
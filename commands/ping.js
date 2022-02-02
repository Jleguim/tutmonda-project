const Discord = require('discord.js')

module.exports.exec = async function (inter, models, params, client) {
    var first = Date.now()
    inter.reply('Pong!')
        .then(() => {
            var diff = (Date.now() - first)
            var API = (client.ws.ping).toFixed(0)

            var embed = new Discord.MessageEmbed()
                .setTitle(`🔔 Pong!`)
                .setColor((diff >= 180) ? '#ff2f2f' : (diff >= 120) ? '#ffa12f' : '#2fff3d')
                .addField('📶 Ping', `${diff}ms`)
                .addField('💻 API', `${API}ms`)

            inter.editReply({ content: null, embeds: [embed] })
        })
}

module.exports.info = {
    name: 'Ping',
    description: 'Revisa la latencia del bot.',
    aliases: ['ping']
}

module.exports.options = []
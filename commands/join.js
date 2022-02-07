const { SlashCommandStringOption } = require('@discordjs/builders')

const Utils = require('../utils')
const { commsQueue, lobbies } = require('../index')

module.exports.exec = async function (inter, models, params, client) {
    const data = { user: inter.user, channel: inter.channel }
    const { id } = params

    if (commsQueue.exists('user.id', inter.user.id)) {
        return inter.reply('Ya estas en la cola.')
    }

    if (id) {
        var lobby = lobbies.get(id.value)
        lobby.addUser(data)
        return
    }

    commsQueue.q(data) // Agrega el usuario a la cola
    commsQueue.mm() // Intenta matchearlo con otro usuario
        .then(users => { // Encontro match
            var id = Utils.getRandomId()
            var lobby = new Utils.ChatLobby(users)
            
            while (lobbies.has(id)) {
                id = Utils.getRandomId()
            }

            lobbies.set(id, lobby)
            lobby.announce('Se encontro una sala! Invita a tus amigos con este codigo: ' + id)
        })
        .catch((err) => { // No encontro match, o error
            if (err) console.error(err)
            inter.reply('Haz sido agregado a la cola.')
        })
}

module.exports.info = {
    name: 'join',
    description: 'Unete a la cola del comunicador.',
    aliases: ['join']
}

module.exports.options = [
    new SlashCommandStringOption()
        .setName('id')
        .setDescription('ID de la sala a la que te quieres unir.')
        .setRequired(false)
]
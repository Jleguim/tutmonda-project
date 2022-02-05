const { SlashCommandStringOption } = require('@discordjs/builders')

const Utils = require('../utils')
const { commsQueue, lobbies } = require('../index')

module.exports.exec = async function (inter, models, params, client) {
    const data = { user: inter.user, channel: inter.channel }
    const { id } = params

    if (id) {
        var lobby = lobbies.get(id.value)
        lobby.addUser(data)
        return
    }

    commsQueue.q(data)
    commsQueue.mm()
        .then(users => {
            var id = Utils.getRandomId()
            var lobby = new Utils.ChatLobby(users)
            
            while (lobbies.has(id)) {
                id = Utils.getRandomId()
            }

            lobbies.set(id, lobby)
            lobby.announce('Found a lobby! Use this code to invite more friends: ' + id)
        })
        .catch((err) => {
            console.error(err)
            inter.reply('Tendras que esperar un poco')
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
        .setDescription('ID del lobby al que quieres unirte.')
        .setRequired(false)
]
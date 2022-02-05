const Utils = require('../utils')
const { commsQueue } = require('../index')

module.exports.exec = async function (inter, models, params, client) {
    const data = { user: inter.user, channel: inter.channel }
    commsQueue.q(data)

    commsQueue.mm()
        .then(users => {
            const lobby = new Utils.ChatLobby(users)
            lobby.announce('Found a lobby!')
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

module.exports.options = []
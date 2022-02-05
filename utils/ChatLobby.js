// const { client } = require('../index')

class ChatLobby {
    constructor(users) {
        this.users = users

        this.users.forEach((data) => {
            const { user, channel } = data

            const filter = m => m.author.id == user.id
            const collector = channel.createMessageCollector({ filter, time: 50000 })

            data = { ...data, collector }

            collector.on('collect', m => {
                var others = this.filterOut(data)
                this.sendMessages(others, m)
            })

            collector.on('end', () => {
                channel.send('Interrupcion de conexión.')
            })
        })
    }
    
    announce(message) {
        this.users.forEach(data => {
            const { user, channel } = data
            channel.send(message)
        })
    }

    sendMessages(usersToSend, message) {
        usersToSend.forEach(data => {
            const { user, channel } = data
            channel.send(`<${message.author.username}>: ${message.content}`)
        })
    }

    filterOut(x) {
        return this.users.filter(i => i.user.id != x.user.id)
    }
}

module.exports = ChatLobby
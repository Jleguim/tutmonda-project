const fs = require('fs')

module.exports.load = (client) => {
    const eventFiles = fs.readdirSync('./events')

    for (const file of eventFiles) {
        const event = require(`./events/${file}`)
        client.on(event.name, event.exec)
    }
}
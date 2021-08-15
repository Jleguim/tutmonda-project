const fs = require('fs')

const client = require('./bot')
const eventFiles = fs.readdirSync('./events')

for (const file of eventFiles) {
    const event = require(`./events/${file}`)
    client.on(event.name, event.exec)
}
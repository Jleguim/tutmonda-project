require('dotenv').config()

const client = require('./bot')
require('./events')
require('./slash_commands')

client.on('ready', () => console.log('Ready'))

client.login(process.env.TOKEN)
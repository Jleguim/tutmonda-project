const Discord = require('discord.js')
const path = require('path')
const fs = require('fs')

module.exports.name = 'messageCreate'
module.exports.exec = (message) => {
    if (message.author.bot) return
    if (!message.content.startsWith('tut.')) return
    
    const sliced = message.content.slice('tut.'.length)
    const args = sliced.split(' ')
    const cmd = args.shift()
    
    const commandDir = path.join(__dirname, '../commands/')
    const commandFile = path.join(commandDir, `/${cmd}.js`)

    if (fs.existsSync(commandFile)) {
        console.log(cmd, args) // finish this
    } else console.log('Command doesnt exist lol')
}
const Discord = require('discord.js')
const path = require('path')
const fs = require('fs')

/**
 * Message event handler
 * @param {Discord.Message} message 
 */
module.exports = (message) => {
    if (message.author.bot) return
    if (!message.content.startsWith('tut.')) return
    
    const sliced = message.content.slice('tut.'.length)
    const args = sliced.split(' ')
    const cmd = args.shift()
    
    // command handler
    const commandDir = path.join(__dirname, '../commands/')
    const commandFile = path.join(commandDir, `/${cmd}.js`)
    if (fs.existsSync(commandFile)) {
        console.log(cmd, args)
    } else console.log('Command doesnt exist lol')
}
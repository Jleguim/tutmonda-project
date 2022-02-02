const cmdManager = require('../CommandManager')

module.exports.name = 'interactionCreate'
module.exports.exec = (inter) => {
    cmdManager.handleInteractions(inter)
}
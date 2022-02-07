const Timeout = require('./Timeout')
const XpManager = require('./XpManager')
const Functions = require('./Functions')
const ChatLobby = require('./ChatLobby')
const Queue = require('./Queue')

function getRandomId() {
    return ('000000000' + Math.random().toString(36).substr(2, 9)).slice(-9)
}

module.exports = {
    Timeout,
    XpManager,
    Queue,
    ChatLobby,

    ...Functions
}
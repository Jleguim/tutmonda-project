const Timeouts = require('./Timeouts')
const ChatLobby = require('./ChatLobby')
const Queue = require('./Queue')

function getRandomInt(max, min) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

module.exports = {
    Timeouts,
    Queue,
    ChatLobby,

    getRandomInt
}
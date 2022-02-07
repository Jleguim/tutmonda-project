const Timeouts = require('./Timeouts')
const ConfigManager = require('./ConfigManager')

function getRandomInt(max, min) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

module.exports = {
    Timeouts,
    ConfigManager,
    
    getRandomInt
}
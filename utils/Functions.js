function getRandomInt(max, min) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomId() {
    return ('000000000' + Math.random().toString(36).substr(2, 9)).slice(-9)
}

module.exports = {
    getRandomId,
    getRandomInt
}
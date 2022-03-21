function getRandomInt(max, min) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomId() {
    return ('000000000' + Math.random().toString(36).substr(2, 9)).slice(-9)
}

function isOnMobible(member){
    let x = member.presence &&
    member.presence.clientStatus &&
    member.presence.clientStatus.mobile === "online" &&
    !member.presence.clientStatus.desktop;

    return x ? true : false;
  }

module.exports = {
    getRandomId,
    getRandomInt,
    isOnMobible
}
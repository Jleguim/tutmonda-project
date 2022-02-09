const Utils = require('../utils')

async function getChannels(guild, type) {
    return (await guild.channels.fetch())
        .filter(ch => ch.type == type)
}

module.exports.exec = async function (inter, models, params, guildConfig) {
    var menu1 = new Utils.ConfigMenu(inter)
    var channels = await getChannels(inter.guild, 'GUILD_TEXT')
    var options = menu1._parseChannels(channels)

    var cmdOptions = options.filter(i => !guildConfig.isCommandChannel(i.value))
    var farmOptions = options.filter(i => !guildConfig.isFarmChannel(i.value))

    menu1.addMenu('cmd', cmdOptions, { menu_ph: 'Canales de comandos', btn_lbl: 'Agregar canal', time: 180000 })
    menu1.addMenu('farm', farmOptions, { menu_ph: 'Canales de experiencia', btn_lbl: 'Agregar canal', time: 180000 })

    menu1.addSave(180000, 'Guardar', (v1) => {
        var menu2 = new Utils.ConfigMenu(inter)
        var notiOptions = options.filter(i => !guildConfig.isNotificationChannel(i.value))

        menu2.addMenu('noti', notiOptions, { menu_ph: 'Canales de notificaciones', btn_lbl: 'Agregar canal', time: 180000 })
        menu2.addSave(180000, 'Guardar', (v2) => {
            console.log({ ...v1, ...v2 })
        })

        menu2.send(true)
    })

    menu1.send()
}

module.exports.info = {
    name: 'Configure',
    description: 'Configura tu servidor.',
    aliases: ['config', 'configurate', 'cfg']
}

module.exports.options = []
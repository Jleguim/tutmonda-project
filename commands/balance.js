const { SlashCommandUserOption } = require('@discordjs/builders')

module.exports.exec = async function (inter, models, params, client) {
    const { Users, Transfers } = models
    const { usuario } = params

    var target = inter.user
    if (usuario) target = usuario.user

    var userDoc = await Users.getByUid(target.id)
    if (!userDoc) userDoc = Users.create(target.id)

    await userDoc.save()
    inter.reply(`${userDoc.wallet.balance}`)
}

module.exports.info = {
    name: 'Balance',
    description: 'Muestra el balance de un usuario.',
    aliases: ['bal', 'balance']
}

module.exports.options = [
    new SlashCommandUserOption()
        .setName('usuario')
        .setDescription('Usuario a buscar.')
        .setRequired(false)
]
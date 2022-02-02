const { SlashCommandUserOption, SlashCommandIntegerOption } = require('@discordjs/builders')

module.exports.exec = async function (inter, models, params, client) {
    const { Users, Transactions } = models
    const { usuario, cantidad } = params

    var payerDoc = await Users.getByUid(inter.user.id)
    if (!payerDoc) payerDoc = Users.create(inter.user.id)

    var recieverDoc = await Users.getByUid(usuario.user.id)
    if (!recieverDoc) recieverDoc = Users.create(usuario.user.id)

    if (payerDoc.wallet.balance < cantidad.value) return inter.reply('Saldo insuficiente.')

    var transaction = await payerDoc.transfer(recieverDoc, cantidad.value)
    inter.reply('Enviado! Codigo de transaccion: ' + transaction.id)

    await payerDoc.save()
    await recieverDoc.save()
}

module.exports.info = {
    name: 'Pay',
    description: 'Utiliza tu balance para pagarle a alguien.',
    aliases: ['pay', 'give']
}

module.exports.options = [
    new SlashCommandUserOption()
        .setName('usuario')
        .setDescription('Usuario al que pagar.')
        .setRequired(true),
    new SlashCommandIntegerOption()
        .setName('cantidad')
        .setDescription('La cantidad a pagar.')
        .setRequired(true)
]
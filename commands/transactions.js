const { SlashCommandStringOption } = require('@discordjs/builders')
const Discord = require('discord.js')

async function getTransferEmbed(transfer, Transfers) {
    transfer = await Transfers.getById(transfer.id)

    const embed = new Discord.MessageEmbed()
        .setAuthor('Transaction - ' + transfer._id)
        .setColor('BLACK')
        .addField('Detalles', `${transfer.payer.uid}<:space:937499126541742090><:space:937499126541742090>➡️<:space:937499126541742090><:space:937499126541742090>${transfer.reciever.uid}`)
        .addField('Saldo', `${transfer.amount} MON`)
    // .addField('Fecha', transfer.date)
    return embed
}

module.exports.exec = async function (inter, models, params, client) {
    const { Users, Transfers } = models
    const { id } = params

    var userDoc = await Users.getByUid(inter.user.id)
    if (!userDoc) userDoc = Users.create(inter.user.id)

    if (id) {
        var transaction = await Transfers.getById(id.value)
        if (!transaction) return inter.reply('Transaccion no encontrada.')

        var transEmbed = await getTransferEmbed(transaction, Transfers)
        return inter.reply({ embeds: [transEmbed] })
    }

    var initialEmbed = await getTransferEmbed(userDoc.lastTransfer, Transfers)
    var actionRow = new Discord.MessageActionRow().addComponents(
        new Discord.MessageButton().setCustomId('last').setLabel('Anterior').setStyle('PRIMARY'),
        new Discord.MessageButton().setCustomId('next').setLabel('Siguiente').setStyle('PRIMARY'))

    inter.reply({ embeds: [initialEmbed], components: [actionRow] })

    const filter = i => i.user.id == inter.user.id && ['next', 'last'].includes(i.customId)
    const collector = inter.channel.createMessageComponentCollector({ filter, time: 15000 })

    collector.on('end', () => {
        inter.editReply({
            content: "Timed out...",
            components: [],
            embeds: []
        })
        setTimeout(() => {
            inter.deleteReply()
        }, 2000)
    })

    var transfersIndex = 0
    collector.on('collect', async (i) => {
        if (i.customId == 'next') {
            if (transfersIndex + 1 <= userDoc.wallet.transfers.length - 1) transfersIndex++
        } else {
            if (transfersIndex - 1 > 0) transfersIndex--
        }

        var targetTransfer = userDoc.wallet.transfers[transfersIndex]
        var embed = await getTransferEmbed(targetTransfer, Transfers)
        i.update({ embeds: [embed], components: [actionRow] })
    })
}

module.exports.info = {
    name: 'Transactions',
    description: 'Checkea tus transacciones.',
    aliases: ['transfers', 'transactions', 'history']
}

module.exports.options = [
    new SlashCommandStringOption()
        .setName('id')
        .setDescription('Id de la transferencia a checkear.')
        .setRequired(false),

]
const { SlashCommandSubcommandBuilder } = require('@discordjs/builders')
const { Shop } = require('../utils')


module.exports.exec = async function (inter, models, params, guiconf) {
    const { Shops } = models
    const { subcommand } = params
    const { id } = params["buy"];

    const ShopDoc = await Shops.getById(guiconf.shopId) ?? await new Shops({gid: guiconf._id}).save();
    const _Shop = new Shop(ShopDoc, inter);

    switch(subcommand){
        case "buy":
            await inter.deferReply();
            _Shop.buy(id.value);
            break;
        case "items":
            await inter.deferReply();
            _Shop.setup();
            break;
    }
}

module.exports.info = {
    name: 'Tienda',
    description: 'Interactúa con la tienda del servidor.',
    aliases: ['tienda', 'shop']
}

module.exports.options = [
    new SlashCommandSubcommandBuilder()
        .setName("items")
        .setDescription("Muestra los items dentro del servidor."),
    new SlashCommandSubcommandBuilder()
        .setName("buy")
        .setDescription("Compra items de la tienda del servidor con tu balance.")
        .addIntegerOption(option => 
            option
                .setName("id")
                .setDescription("ID del item a comprar.")
                .setRequired(true))
]
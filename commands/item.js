const { SlashCommandSubcommandBuilder } = require('@discordjs/builders')
const { Shop, Inventory } = require('../utils')


module.exports.exec = async function (inter, models, params, guiconf) {
    const { Shops } = models
    const { subcommand } = params

    let user = params["list"].usuario ? params["list"].usuario.user : inter.user;

    const Shop = await Shops.getById(guiconf.shopId) ?? await new Shops({gid: guiconf._id}).save();
    const _Inventory = new Inventory(inter, user, Shop);

    switch(subcommand){
        case "list":
            await inter.deferReply();
            _Inventory.setup(inter);
            break;
        case "use":
            await inter.deferReply();
            _Inventory.useItem(params[subcommand].id.value);
            break;
    }
}

module.exports.info = {
    name: 'Item',
    description: 'Interactúa con los items que tengas en tu inventario.',
    aliases: ['item', 'items']
}

module.exports.options = [
    new SlashCommandSubcommandBuilder()
        .setName("list")
        .setDescription("Muestra el inventario del usuario.")
        .addUserOption(option =>
            option
            .setName("usuario")
            .setDescription("Usuario a revisar.")),
    new SlashCommandSubcommandBuilder()
        .setName("use")
        .setDescription("Usa el item.")
        .addIntegerOption(option => 
            option
                .setName("id")
                .setDescription("ID de uso del item dentro del inventario.")
                .setRequired(true)
        ),
    new SlashCommandSubcommandBuilder()
        .setName("info")
        .setDescription("Muestra lo que hace el item al usarse.")
        .addIntegerOption(option =>
            option
            .setName("id")
            .setDescription("ID de uso del item dentro del inventario.")
            .setRequired(true))
]
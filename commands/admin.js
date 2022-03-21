const { SlashCommandSubcommandGroupBuilder } = require('@discordjs/builders')
const { Shop } = require("../utils");

module.exports.exec = async function (inter, models, params, guiconf) {
    const { Shops } = models
    const { shop, items, subgroup, subcommand } = params

    const ShopDoc = await Shops.getById(guiconf.shopId) ?? await new Shops({gid: guiconf._id}).save();
    const _Shop = new Shop(ShopDoc, inter);

    switch(subgroup){
        case "shop":
            shopSubGroup();
            break;
        case "items":
            itemsSubgroup();
            break;
    }

    async function shopSubGroup(){
        switch(subcommand){
            case "list":
                await inter.deferReply();
                _Shop.showAllItems();
                break;
            case "remove":
                await inter.reply("Eliminando...")
                _Shop.removeItem(shop["remove"].id.value)
                break;
    
            case "add":
                await inter.reply("Agregando...")
                _Shop.addItem(shop["add"])
                break;
        }
    }

    async function itemsSubgroup(){
        switch(subcommand){
            case "action":
                await inter.reply("Actualizando uso...")
                _Shop.editUse(items["action"])
                break;
            case "name":
            case "desc":
                await inter.reply("Actualizando item...")
                _Shop.editItem(items[subcommand], subcommand)
                break;
        }
    }

}

module.exports.info = {
    name: 'Administration',
    description: 'Administrar diferentes secciones activas dentro de un servidor.',
    aliases: ['admin']
}

module.exports.options = [
    new SlashCommandSubcommandGroupBuilder()
        .setName("shop")
        .setDescription("Administrar la tienda")
        .addSubcommand(sub =>
            sub
            .setName("list")
            .setDescription("Lista de todos los items de la tienda, los que tienen usos y los que no."))
        .addSubcommand(sub =>
            sub
            .setName("add")
            .setDescription("Agregar un item a la tienda")
            .addStringOption(option =>
                option.setName("nombre")
                .setDescription("El nombre del item")
                .setRequired(true))
            .addStringOption(option =>
                option.setName("descripcion")
                .setDescription("La descripción del item")
                .setRequired(true))
            .addIntegerOption(option =>
                option.setName("precio")
                .setDescription("El precio base del item")
                .setRequired(true))
        )
        .addSubcommand(sub =>
            sub
            .setName("remove")
            .setDescription("Elimina un item de la tienda")
            .addIntegerOption(option =>
                option.setName("id")
                .setDescription("La id del item a eliminar")
                .setRequired(true))
        ),
    new SlashCommandSubcommandGroupBuilder()
        .setName("items")
        .setDescription("Administrar los items de la tienda")
        .addSubcommand(sub =>
            sub
            .setName("action")
            .setDescription("Editar el uso que tiene un item de la tienda")
            .addIntegerOption(option =>
                option.setName("id")
                .setDescription("La id del item a editar")
                .setRequired(true))
            .addStringOption(option =>
                option.setName("accion")
                .setDescription("¿Se agrega o elimina el 'objetivo'?")
                .addChoices([["Agrega", "add"], ["Elimina", "remove"]])
                .setRequired(true))
            .addStringOption(option =>
                option.setName("objetivo")
                .setDescription("El objetivo al usar el item: ¿a qué se hará la accion?")
                .addChoices([["Role", "role"], ["Item", "item"]])
                .setRequired(true))
            .addRoleOption(option =>
                option.setName("role")
                .setDescription("¿Qué role se agrega/elimina?"))
            .addIntegerOption(option =>
                option.setName("cantidad")
                .setDescription("¿Cuántos 'items' se agregarán al inventario?"))
            .addStringOption(option =>
                option.setName("reply")
                .setDescription("Mensaje que se envía después de usar el item. No llenar esto para dejar el actual"))
        )
        .addSubcommand(sub =>
            sub
            .setName("toggle")
            .setDescription("Ocultar un item de la tienda")
            .addIntegerOption(option =>
                option.setName("id")
                .setDescription("La id del item a alternar")
                .setRequired(true))
            .addStringOption(option =>
                option.setName("duracion")
                .setDescription("¿Cuánto tiempo estará oculto? - 1d, 1h, 10m, 30s, etc."))
        )
        .addSubcommand(sub =>
            sub
            .setName("name")
            .setDescription("Edita el nombre de un item")
            .addIntegerOption(option =>
                option.setName("id")
                .setDescription("La id del item a editar")
                .setRequired(true))
            .addStringOption(option =>
                option.setName("nombre")
                .setDescription("El nuevo nombre del item")
                .setRequired(true))
        )
        .addSubcommand(sub =>
            sub
            .setName("desc")
            .setDescription("Edita la descripción de un item")
            .addIntegerOption(option =>
                option.setName("id")
                .setDescription("La id del item a editar")
                .setRequired(true))
            .addStringOption(option =>
                option.setName("descripcion")
                .setDescription("La nueva descripción del item")
                .setRequired(true))
        )
]

module.exports.permissions = [
    "ADMIN"
]
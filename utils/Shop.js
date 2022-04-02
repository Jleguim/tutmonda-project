const Discord = require("discord.js");
const models = require('mongoose').models
const { Users } = models;
const { isOnMobible } = require("./Functions") // for later
const Id = require("./Id")
const InteractivePages = require("./InteractivePages")

class Shop {
    constructor(doc, inter) {
        this.shop = doc;
        this.shop.items = this.shop.items.sort((a, b) => a.id - b.id);

        this.interaction = inter;

        this.items = new Map();
        this.base = {
            title: `${this.interaction.guild.name} Shop`,
            icon: this.interaction.guild.iconURL() ?? this.interaction.member.displayAvatarURL(),
            description: ``,
            addon: `**{item_id} — {item_name}**\n\`▸\` {item_desc}\n▸ ${this.shop.emote ?? "🍋"}{item_price}\n\n`,
            footer: `Página {ACTUAL} de {TOTAL}`,
            icon_footer: this.interaction.guild.iconURL()
        }

        this.pages;
        this.user;
    }

    async setup(){
        this.user = await Users.getByUid(this.interaction.user.id);
        this.base.description = `**—** ¡Bienvenid@ a la tienda! para comprar items usa usa /shop buy:\`ID del item\`.\n**—** Tienes 🍋**${this.user.wallet.balance}**`;

        this.shop.items.forEach( (item, index) => {

            var price = this._determinePrice(this.user, item, true);

            this.items.set(item.id, {
                item_name: item.name,
                item_desc: item.description,
                item_price: price,
                item_id: item.id,
                showable: (item.after_use.action !== null && !item.disabled) ?? false,
                index
            })
        });

        return this._prepareInit();
    }

    async showAllItems(){
        this.user = await Users.getByUid(this.interaction.user.id);
        this.base.description = `**—** [NOT READY]: Falta el uso (\`/admin items action\`)\n**—** [HIDDEN]: Item desactivado (\`/admin items toggle\`)\n**—** [✅]: El item es visible y usable para cualquiera.`;
        this.base.addon = this.base.addon.substring(0, 2) + "{publicInfo} — ID: " + this.base.addon.substr(2)

        this.shop.items.forEach((item, index) => {
            let publicInfo;
            if(!item.after_use.action) publicInfo = "[NOT READY] ";
            else if(item.disabled) publicInfo = "[HIDDEN] ";
            else publicInfo = "[✅] ";
            
            var price = this._determinePrice(this.user, item, true);
            
            this.items.set(item.id, {
                item_name: item.name,
                item_desc: item.description,
                item_price: price,
                item_id: item.id,
                publicInfo,
                index
            })
        });

        return this._prepareInit();
    }

    async _prepareInit(){
        const interactive = new InteractivePages(this.base, this.items)
        this.pages = interactive.pages;

        let embed = new Discord.MessageEmbed()
        .setAuthor({name: this.base.title, iconURL: this.base.icon})
        .setColor(this.interaction.member.displayHexColor)
        .setDescription(`${this.base.description}\n\n${this.pages.get(1).join(" ")}`)
        .setFooter({text: this.base.footer.replace(new RegExp("{ACTUAL}", "g"), `1`).replace(new RegExp("{TOTAL}", "g"), `${this.pages.size}`), iconURL: this.base.icon_footer});

        await interactive.init(embed, this.interaction);
    }

    async buy(itemId){
        let user = await Users.getByUid(this.interaction.user.id);
        const item = this.shop.findItem(itemId);

        if(!item) return this.interaction.editReply("literalmente no existe, matate");
        var price = this._determinePrice(user, item);

        if(!user.canBuy(price)) return this.interaction.editReply("literalmente no tienes tanta plata, matate");
        if(user.hasItem(itemId)) return this.interaction.editReply("literalmente ya tienes este item, matate")

        const newUseId = new Id(await Users.find(), "inventory", "use_id").newId;

        user.wallet.balance -= price;
        user.inventory.push({item_id: item.id, use_id: newUseId})

        await user.save();
        return this.interaction.editReply("CAPITALISMOOOOOOOON'T ✅");
    }

    async removeItem(itemId){
        const index = this.shop.findItemIndex(itemId);
        if(!index) return this.interaction.editReply("Ese item no existe ❌")

        this.shop.items.splice(index, 1);
        await this.shop.save();
        return this.interaction.editReply("Eliminado ✅")
    }

    async addItem(params){
        const newId = new Id(this.shop.items, "", "id").newId;

        this.shop.items.push(
            {
                name: params.nombre.value,
                description: params.descripcion.value,
                price: params.precio.value,
                id: newId
            }
        )

        await this.shop.save();
        return this.interaction.editReply("✅")
    }

    async editUse(params){
        const item = this.shop.findItem(params.id.value, false);
        if(!item) return this.interaction.editReply(`No existe un item con id \`${params.id.value}\` ❌`)

        const use = item.after_use;

        use.action = params.accion.value;
        use.target = params.objetivo.value;
        use.given = use.target == "role" ? params.role.value : params.cantidad.value;
        use.reply = params.reply.value ?? use.reply;

        await this.shop.save();
        return this.interaction.editReply("Se ha actualizado el item ✅");
    }

    async editItem(params, subcommand){

        
        const item = this.shop.findItem(params.id.value, false);
        if(!item) return this.interaction.editReply(`No existe un item con id \`${params.id.value}\` ❌`)

        switch(subcommand){
            case "name":
                await this._editName(item, params.nombre.value);
                break;
            case "desc":
                await this._editDesc(item, params.descripcion.value);
                break;
        }

        return this.interaction.editReply("Se ha actualizado el item ✅")
    }

    async _editName(item, value){
        item.name = value;
        return this.shop.save();
    }

    async _editDesc(item, value){
        item.description = value;
        return this.shop.save();
    }

    _determinePrice(user, item, toString){
        // por ahora es simplemente un return pero después cuando se metan los descuentos por roles, etc, se usa bien 👍 y no un cursed coso
        return toString ? item.price.toLocaleString("es-CO") : item.price;
    }
}

module.exports = Shop;
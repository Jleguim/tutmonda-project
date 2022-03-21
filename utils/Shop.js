const Discord = require("discord.js");
const ms = require("ms");
const models = require('mongoose').models
const { Users } = models;
const { isOnMobible } = require("./Functions") // for later
const Id = require("./Id")

class Shop {
    constructor(doc, inter) {
        this.shop = doc;
        this.interaction = inter;
        this.items;
        this.user;
    }

    async setup(){
        this.user = await Users.findOne({uid: this.interaction.user.id});

        // items
        this.items = await this._generatePages(this.user, 3);

        const base = {
            title: `${this.interaction.guild.name} Shop`,
            icon: this.interaction.guild.iconURL() ?? this.interaction.member.displayAvatarURL(),
            description: `**—** ¡Bienvenid@ a la tienda! para comprar items usa usa /shop buy:\`ID del item\`.
            **—** Tienes 🍋**${this.user.wallet.balance}**`,
            footer: `Página {ACTUAL} de {TOTAL}`,
            icon_footer: this.interaction.guild.iconURL()
        }

        let embed = new Discord.MessageEmbed()
        .setAuthor({name: base.title, iconURL: base.icon})
        .setColor(this.interaction.member.displayHexColor)
        .setDescription(`${base.description}\n\n${this.items[0].join(" ")}`)
        .setFooter({text: base.footer.replace(new RegExp("{ACTUAL}", "g"), `1`).replace(new RegExp("{TOTAL}", "g"), `${this.items.length}`), iconURL: base.icon_footer});
        
        this._interactivePages(embed, base);
    }

    async showAllItems(){
        this.user = await Users.findOne({uid: this.interaction.user.id});
        this.items = await this._generatePages(this.user, 3, true);

        const base = {
            title: `${this.interaction.guild.name} Listado de items`,
            icon: this.interaction.guild.iconURL() ?? this.interaction.member.displayAvatarURL(),
            description: `**—** [NOT READY]: Falta el uso (\`/admin items action\`)
            **—** [HIDDEN]: Item desactivado (\`/admin items toggle\`)
            **—** [✅]: El item es visible y usable para cualquiera.`,
            footer: `Página {ACTUAL} de {TOTAL}`,
            icon_footer: this.interaction.guild.iconURL()
        }

        let embed = new Discord.MessageEmbed()
        .setAuthor({name: base.title, iconURL: base.icon})
        .setColor(this.interaction.member.displayHexColor)
        .setDescription(`${base.description}\n\n${this.items[0].join(" ")}`)
        .setFooter({text: base.footer.replace(new RegExp("{ACTUAL}", "g"), `1`).replace(new RegExp("{TOTAL}", "g"), `${this.items.length}`), iconURL: base.icon_footer});
        
        this._interactivePages(embed, base);
    }

    async buy(itemId){
        let user = await Users.findOne({uid: this.interaction.user.id});
        const item = this.shop.findItem(itemId);

        if(!item) return this.interaction.editReply("literalmente no existe, matate");
        if(!user.canBuy(item)) return this.interaction.editReply("literalmente no tienes tanta plata, matate");
        if(user.hasItem(itemId)) return this.interaction.editReply("literalmente ya tienes este item, matate")

        const newUseId = new Id(await Users.find(), "inventory", "use_id").newId;

        user.wallet.balance -= item.price;
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
        const item = this.shop.findItem(params.id.value);
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
        
        const item = this.shop.findItem(params.id.value);
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

    async _generatePages(user, itemsPerPage, listing = false){
        itemsPerPage = itemsPerPage || 3;
      
        /* const interest_txt = "Al comprar este item, su precio subirá";
        const viewExtension = "ꜝ"; */
      
        const shop = this.shop
        const emote = "🍋"
      
        if(!shop || shop.items.length === 0) return null;
      
        const items = shop.items.sort((a, b) => a.id - b.id);
      
        let pag_actual = 1;
        let fin = itemsPerPage * pag_actual - 1; // el index del ultimo item a mostrar
      
        if(items.length <= fin){
          fin = items.length - 1;
        }
      
        let pags = [];
        let actualpage = [];
    
        pagesLoop:
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
          
            if(i > fin) { // ayuda no se como hace varias paginas
                pags.push(actualpage);
            
                actualpage = [];
                pag_actual++;
                fin = itemsPerPage * pag_actual - 1;
            
                if(items.length <= fin){
                    fin = items.length - 1;
                }
            }

            const precio = this._determinePrice(user, item, true);
            const nombre = item.name;
            const desc = item.description;
            const id = item.id;

            if((!item.after_use.action || item.disabled) && !listing) continue pagesLoop;
      
            let publicInfo = "";
            if(listing){
                if(!item.after_use.action) publicInfo = "[NOT READY] ";
                else if(item.disabled) publicInfo = "[HIDDEN] ";
                else publicInfo = "[✅] ";
            }

            actualpage.push(`**${publicInfo}{ ${id} } — ${nombre}**\n\`▸\` ${desc}\n▸ ${emote}${precio}\n\n`);
        }
      
        pags.push(actualpage);
      
        return pags || null;
    }

    _determinePrice(user, item, toString){
        // por ahora es simplemente un return pero después cuando se metan los descuentos por roles, etc, se usa bien 👍 y no un cursed coso
        return item.price;
    }
    
    async _interactivePages(firstEmbed, base){
        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId("back")
                    .setEmoji("⬅️")
                    .setStyle("PRIMARY"),
                new Discord.MessageButton()
                    .setCustomId("next")
                    .setEmoji("➡️")
                    .setStyle("PRIMARY"),
            )

        if(this.items.length === 1) row.components.forEach(c => c.setDisabled()); // no tiene más de una pagina

        let msg = await this.interaction.editReply({components: [row], embeds: [firstEmbed]});
        
        const filter = i => i.user.id === this.interaction.user.id;
        const collector = msg.channel.createMessageComponentCollector({ filter, time: ms("1m") });

        let pagn = 0;
        collector.on("collect", async i => {
            await i.deferUpdate();

            if(i.customId === "back"){
                if(pagn === 0) return;
                pagn--;
            } else {
                if(pagn === this.items.length - 1) return;
                pagn++;
            }

            let embed = new Discord.MessageEmbed()
            .setAuthor(base.title, base.icon)
            .setColor(this.interaction.member.displayHexColor)
            .setDescription(`${base.description}\n\n${this.items[pagn].join(" ")}`)
            .setFooter(base.footer.replace(new RegExp("{ACTUAL}", "g"), `${pagn + 1}`).replace(new RegExp("{TOTAL}", "g"), `${this.items.length}`), base.icon_footer);

            await this.interaction.editReply({embeds: [embed]});
        });

        collector.on("end", () => {
            row.components.forEach(c => c.setDisabled());
            this.interaction.editReply({components: [row]});
        })

    }
}

module.exports = Shop;
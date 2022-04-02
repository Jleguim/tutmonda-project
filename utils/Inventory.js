const Discord = require("discord.js");
const ms = require("ms");
const models = require('mongoose').models
const { Shops, Users } = models;
const Shop = require("./Shop")
const InteractivePages = require("./InteractivePages")

class Inventory {
    constructor(inter, user, shop) {
        this.interaction = inter;
        this.user = user;
        this.member = inter.guild.members.cache.find(x => x.id === user.id);
        this.shop = shop;
        this.items = new Map();
        this.base = {
            title: `Inventario de ${this.user.tag}`,
            icon: this.user.displayAvatarURL(),
            description: "",
            addon: `**— "{name}"**\n▸ Activo desde: {active_since}\n▸ ID: \`{id}\`.\n\n`,
            footer: `Página {ACTUAL} de {TOTAL}`
        }

        this.userDoc;
    }

    async setup(){
        this.userDoc = await Users.getByUid(this.user.id);

        this.shop.items.forEach((item, index) => {
            let query = this.userDoc.inventory.find(x => x.item_id === item.id);
            if(query) this.items.set(item.id, {
                name: item.name,
                active_since: query.active_since,
                index,
                id: query.use_id
            })
        });

        const interactive = new InteractivePages(this.base, this.items);
        this.pages = interactive.pages;

        let embed = new Discord.MessageEmbed()
        .setAuthor({name: this.base.title, iconURL: this.base.icon})
        .setColor(this.interaction.member.displayHexColor)
        .setDescription(`${this.base.description}\n\n${this.pages.get(1).join(" ")}`)
        .setFooter({text: this.base.footer.replace(new RegExp("{ACTUAL}", "g"), `1`).replace(new RegExp("{TOTAL}", "g"), `${this.pages.size}`), iconURL: this.base.icon_footer});

        await interactive.init(embed, this.interaction);
    }

    async useItem(useId){
        this.userDoc = await Users.getByUid(this.user.id);

        let q = this.userDoc.inventory.find(x => x.use_id === useId);
        if(!q) return this.interaction.editReply("literalmente no tienes ese item, matate");

        const item = this.shop.findItem(q.item_id);

        if(this.shop.isUsable(item)){
            switch(item.after_use.target){
                case "item":
                    break;
                case "role":
                    this._targetRole(item);
                    break;
            }
        }
        else return this.interaction.editReply("literalmente no puedes usar esto ahora, matate");
    }

    async _targetRole(item){
        const role = this.interaction.guild.roles.cache.find(x => x.id === item.after_use.given)

        if(item.after_use.action === "add"){
            if(this.member.roles.cache.find(x => x == role)) return this.interaction.editReply("literalmente ya tienes el rol q te da esto, matate")
            else this.member.roles.add(role);
        } else {
            if(!this.member.roles.cache.find(x => x == role)) return this.interaction.editReply("literalmente no tienes el rol q se quita, matate")
            else this.member.roles.remove(role)
        }

        // eliminar el item del inventario
        this.userDoc.inventory.splice(this.userDoc.findItemIndex(item.id), 1);
        await this.userDoc.save();

        return this.interaction.editReply(item.after_use.reply);
    }
}

module.exports = Inventory;
const Discord = require("discord.js");
const { time } = require('@discordjs/builders');
const ms = require("ms");

class InteractivePages {
    /**
     * 
     * @param {{title: string, author_icon: string, color: string, description: string, addon: string, footer: string, footer_icon: string}} structure The base for the embed
     * @param {Map<Id, values>} items Mapped by Id's, the {x.y} used on the 'addon', 'y' would be the values inside the key
     * @param {Number} itemsNum The number of items that will be in one page.
     */
    constructor(structure, items, itemsNum = 3){
        this.base = structure;
        this.base.title, this.base.author_icon, this.base.color, this.base.description, this.base.footer, this.base.footer_icon = "";

        if(!this.base.addon) throw "addon can not be undefined nor can be an empty string";

        this.items = items;
        this.itemsPerPage = itemsNum;

        this.pages = new Map();
        this.pageToPush = [];


        this._generatePages();
    }

    _generatePages(){
        if(this.items.size === 0) return this.pages.set(1, ["..."])
      
        let i = 0;
        let pag_actual = 1;
        let fin = this.itemsPerPage * pag_actual - 1; // el index del ultimo item a mostrar

        if(this.items.size <= fin){
          fin = this.items.size - 1;
        }

        this.items.forEach(value => {
            if(value.hasOwnProperty("showable") && !value.showable) return;
            if(i > fin){
                this.pages.set(pag_actual, this.pageToPush)

                this.pageToPush = [];
                pag_actual++;

                if(this.items.size <= fin) fin = this.items.size - 1;
                i = 0;
            }

            // regex
            const regx = new RegExp("\{(.*?)\}", "g");
            let addonMatch = this.base.addon.match(regx) // sacar todo lo que esté dentro de {}

            let originaladdon = this.base.addon;

            addonMatch.forEach(a => {
                let info = a.match(new RegExp("(?<=\{).+?(?=\})", "g"))[0] // sacar lo que está dentro de los {}

                let toReplace = value[info] ?? "🤷";

                if(toReplace instanceof Date) toReplace = time(toReplace);

                let replaced = this.base.addon.replace(a, toReplace) // reemplazar lo que está entre {} con lo que está dentro de estos en los parámetros de value
                this.base.addon = replaced;
            })


            this.pageToPush.push(this.base.addon)
            i++;

            this.base.addon = originaladdon; // wow
        })

        this.pages.set(pag_actual, this.pageToPush)
    }

    async init(firstEmbed, interaction){
        const row = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId("back")
                .setEmoji("⬅️")
                .setStyle("PRIMARY")
                .setDisabled(true),
            new Discord.MessageButton()
                .setCustomId("next")
                .setEmoji("➡️")
                .setStyle("PRIMARY"),
        )

        if(this.pages.size === 1) row.components.forEach(c => c.setDisabled()); // no tiene más de una pagina

        let msg = await interaction.editReply({components: [row], embeds: [firstEmbed]});
        
        const filter = i => i.user.id === interaction.user.id;
        const collector = msg.channel.createMessageComponentCollector({ filter, time: ms("1m") });

        let pagn = 0;
        collector.on("collect", async i => {
            if(!i.deferred) await i.deferUpdate();

            if(i.customId === "back") pagn--;
                else pagn++;

            if(pagn === 0) row.components[0].setDisabled();
                else row.components[0].setDisabled(false);

            if(pagn === this.pages.size - 1) row.components[1].setDisabled();
                else row.components[1].setDisabled(false);

            let embed = new Discord.MessageEmbed()
            .setAuthor({name: this.base.title, iconURL: this.base.icon})
            .setColor(this.base.color)
            .setDescription(`${this.base.description}\n\n${this.pages.get(pagn+1).join(" ")}`)
            .setFooter({text: this.base.footer.replace(new RegExp("{ACTUAL}", "g"), `${pagn + 1}`).replace(new RegExp("{TOTAL}", "g"), `${this.pages.size}`), iconURL: this.base.icon_footer});

            await interaction.editReply({embeds: [embed], components: [row]});
        });

        collector.on("end", () => {
            row.components.forEach(c => c.setDisabled());
            interaction.editReply({components: [row]});
        })
    }
}

module.exports = InteractivePages;
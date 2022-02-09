const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js')

class ConfigMenu {
    constructor(inter) {
        this.options = new Map()
        this.values = new Map()

        this.components = new Map()

        this.inter = inter
        this.finished = false
    }

    send(more = false) {
        var components = Array.from(this.components.values()).map(this._createActionRow)
        
        if (more) this.inter.editReply({ content: '_ _', components: components })
        else this.inter.reply({ content: '_ _', components: components })
    }

    addSave(time, label, cb) {
        const btn = this._createButton('save-btn', label, 'PRIMARY')

        this.components.set(this.components.size, btn)

        const collector = this._createCollector([btn.customId], time, this.inter)

        collector.on('collect', i => {
            this.finished = true
            i.deferUpdate()
            collector.stop()
        })

        collector.on('end', () => {
            var keys = Array.from(this.options.keys())
            var obj = {}

            keys.forEach(k => {
                obj[k] = this.options.get(k)
            })

            cb(obj)
        })
    }

    addMenu(id, options, { menu_ph, btn_lbl, time }) {
        const menu = this._createMenu(`menu-${id}`, menu_ph, options)
        const btn = this._createButton(`btn-${id}`, btn_lbl, 'SECONDARY')

        this.components.set(this.components.size, menu)
        this.components.set(this.components.size, btn)

        this.options.set(id, [])
        this.values.set(id, null)

        const collector = this._createCollector([menu.customId, btn.customId], time, this.inter)

        collector.on('collect', i => {
            if (this.finished) collector.stop()

            if (i.customId == menu.customId) {
                this.values.set(id, i.values[0])
                // console.log(`Set ${id} value from menu => ${i.values[0]}`)
            }

            if (i.customId == btn.customId) {
                var value = this.values.get(id)
                // console.log(`Checked ${id} value from button => ${value}`)

                if (value != undefined) {
                    var selected = this.options.get(id)
                    var arr = [...selected, value]
                    this.options.set(id, arr)

                    // console.log(`Pushed to ${id} options from button => ${[...selected, value].toString()}`)

                    menu.options = options.filter(o => !arr.includes(o.value))

                    var x = 0
                    var components = Array.from(this.components.values()).map(c => {
                        if (c.customId == menu.customId) {
                            c.options = menu.options
                            this.components.set(x, c)
                        } else x++

                        return c
                    })


                    this.inter.editReply({
                        content: '_ _',
                        components: components.map(i => this._createActionRow(i))
                    })
                }
            }

            i.deferUpdate()
        })
    }

    _createCollector(ids, time, inter) {
        const filter = i => i.user.id == inter.user.id && ids.includes(i.customId)
        const collector = inter.channel.createMessageComponentCollector({ filter, time })

        return collector
    }

    _parseChannels(channels) {
        return channels.map(ch => {
            return ch = {
                label: `${ch.name} - ${ch.id}`,
                value: ch.id
            }
        })
    }

    _createMenu(id, ph, options) {
        return new MessageSelectMenu()
            .setCustomId(id)
            .setPlaceholder(ph)
            .addOptions(options)
    }

    _createButton(id, label, style) {
        return new MessageButton()
            .setCustomId(id)
            .setLabel(label)
            .setStyle(style)
    }

    _createActionRow(components) {
        return new MessageActionRow()
            .addComponents(components)
    }
}

module.exports = ConfigMenu
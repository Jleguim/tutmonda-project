const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const Shop = new Schema({
    items: [
        {
            name: { type: String, required: true },
            description: { type: String, required: true },
            price: { type: Number, required: true },
            after_use: {
                action: { type: String, default: null },
                target: { type: String, default: null },
                given: { type: String, default: null }, // puede ser una cantidad o la id del target
                reply: { type: String, default: "Item usado con éxito." }
            },
            disabled: { type: Boolean, default: false },
            disabled_until: { type: Date, default: null },
            id: { type: Number, sparse: true }
        }
    ],
    inflation: {
        value: { type: Number, required: true, default: 1 },
        min_days: { type: Number, default: 0 },
        max_days: { type: Number, default: 30 }
    },
    gid: { type: ObjectId, ref: "GuildConfigs" }
});

Shop.static("getById", function(id){
    return this.findOne({ id });
})

Shop.method("findItem", function(itemId){
    return this.items.find(x => x.id === itemId && !x.disabled && x.after_use.action);
})

Shop.method("findItemIndex", function(itemId){
    let x = this.items.findIndex(x => x.id === itemId);
    return x < 0 ? null : x;
})

module.exports = mongoose.model('Shops', Shop)
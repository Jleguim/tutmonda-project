const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const Transfer = new Schema({
    amount: Number,
    payer: { type:ObjectId, ref: 'Users' },
    reciever: { type:ObjectId, ref: 'Users' },
    date: Date
})

Transfer.static('getById', function (id) {
    return this.findOne({ _id: id }).populate(['payer', 'reciever'])
})

module.exports = mongoose.model('Transfers', Transfer)
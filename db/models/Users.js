const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = Schema.ObjectId

const User = new Schema({
    uid: String,
    profile: {
        lvl: Number,
        xp: Number
    },
    wallet: {
        balance: Number,
        transfers: [{ type: ObjectId, ref: 'Transfers' }]
    }
})

User.method('checkLevelUp', async function(perLvlXp) {
    var lvlUpXp = this.profile.lvl * perLvlXp
    if (this.profile.xp >= lvlUpXp) {
        this.profile.lvl += 1
    }

    await this.save()
})

User.method('addXP', async function (xp) {
    if (!this.profile.xp) this.profile.xp = 0
    if (!this.profile.lvl) this.profile.lvl = 1

    this.profile.xp += xp
    await this.save()
})

User.method('addTransfer', async function (trsfr) {
    if (!this.wallet.transfers) this.transfers = []
    this.wallet.transfers.push(trsfr)
    await this.save()
})

User.method('addBalance', async function (n) {
    this.wallet.balance += n
    await this.save()
})

User.method('transfer', async function (usr, n, give = true) {
    var me = this
    var transfer = new mongoose.models.Transfers({
        amount: n,
        payer: (give) ? me.id : usr.id,
        reciever: (give) ? usr.id : me.id,
        date: Date.now()
    })

    await me.addTransfer(transfer.id)
    await usr.addTransfer(transfer.id)

    await me.addBalance((give) ? -n : n)
    await usr.addBalance((give) ? n : -n)

    await transfer.save()
    await transfer.populate(['payer', 'reciever'])
    return transfer
})

User.virtual('lastTransfer').get(function () {
    if (this.wallet.length == 0) return null
    else return this.wallet.transfers[0]
})

User.static('getByUid', function (uid) {
    return this.findOne({ uid }).populate('wallet.transfers')
})

User.static('create', function (uid) {
    return new this(
        {
            uid,
            wallet: {
                balance: 0,
                transfers: []
            }
        }
    )
})

module.exports = mongoose.model('Users', User)
class Timeouts {
    constructor(delay = 20) { // Delay in seconds
       this.logs = new Map()
       var logs = this.logs

        this.delay = delay * 1000

        this.exists = (n) => logs.has(n)
        this.find = (n) => logs.get(n)
        this.register = (n) => logs.set(n, Date.now())
    }

    check(user, hash, valid, invalid) {
        var uid = `${user.id}-${hash}`
        if (!this.exists(uid)) {
            this.register(uid)
            return valid()
        }

        var before = this.find(uid)
        var now = Date.now()
        var diff = now - before

        if (diff > this.delay) {
            this.register(uid)
            return valid()
        }

        invalid()
    }
}

module.exports = Timeouts
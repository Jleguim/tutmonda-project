class Timeout {
    constructor(delay = 20) { // Delay in seconds
        this.logs = new Map()
        var logs = this.logs

        this._delay = delay * 1000

        this.exists = (n) => logs.has(n)
        this.find = (n) => logs.get(n)
        this.register = (n) => logs.set(n, Date.now())
    }

    set delay(v) {
        this._delay = v * 1000
    }

    get delay() {
        return this._delay
    }

    check(user, valid, invalid) {
        var uid = `${user}`

        if (!this.exists(uid)) {
            this.register(uid)
            return valid()
        }

        var before = this.find(uid)
        var now = Date.now()
        var diff = now - before

        if (diff > this._delay) {
            this.register(uid)
            return valid()
        }

        invalid()
    }
}

module.exports = Timeout
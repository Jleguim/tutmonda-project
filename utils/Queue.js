class Queue {
    constructor() {
        this.queue = new Map()
    }

    mm(n = 2) {
        return new Promise((res, rej) => {
            var users = [], q = this._toArray(), i = 0

            if (this.length < n) return rej()

            while (i < n) {
                var data = q.shift()
                users.push(data)
                this.dq(data.qid)
                i++
            }

            this.rq()
            res(users)
        })
    }

    rq() {
        var arr = this._toArray()
        this.queue = new Map()
        arr.forEach(x => {
            this.q(x)
        })
    }

    dq(x) {
        if (x) return this.queue.delete(x)

        var arr = this._toArray()
        var last = arr.pop()
        this.queue.delete(last.qid)
    }

    q(x) {
        var id = this.length + 1
        this.queue.set(id, { qid: id, ...x })
    }

    exists(property, value) {
        var bool = false
        var props = property.split('.')

        this.forEach(x => {
            var toCheck = x
            props.forEach(prop => toCheck = toCheck[prop])

            if (toCheck == value) bool = true
        })

        return bool
    }

    forEach(func) {
        var id = 1
        while (id <= this.length) {
            var x = this.queue.get(id)
            func(x)
            id++
        }
    }

    get length() {
        return this._toArray().length
    }

    _toArray() {
        return Array.from(this.queue.values())
    }
}

module.exports = Queue
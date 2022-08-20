'use strict'

module.exports = class {
  constructor (context, site, args) {
    this.context = context
    this.url = site.url
    this.key = site.key
    this.args = args
  }

  compare (current, previous) {
    if (previous == null || previous.date == null) {
      this.context.log('previous == null')
      return current.items
    }
    if (previous.date === current.date) {
      this.context.log('same date')
      return []
    }
    this.context.log('differ date')
    const map = new Map()
    current.items.forEach((item) => {
      map.set(`${item.link} ${item.date}`, item)
    })
    previous.items.forEach((item) => {
      map.delete(`${item.link} ${item.date}`)
    })
    this.context.log(map.size)
    const diff = []
    map.forEach((item) => { diff.push(item) })
    return diff
  }

  async watch () {
    const WrappedParser = require('./rss-wrapper.js')
    const parser = new WrappedParser()
    const current = parser.parseURL(this.url)
    const Entity = require('./entity-wrapper.js')
    const entity = new Entity(this.context, this.key, this.args)
    const previous = entity.load()
    this.context.log(JSON.stringify({
      current: await current, previous: await previous
    }))
    const diff = this.compare(await current, await previous)
    this.context.log({ diff })
    if (diff.length < 1) {
      this.context.log('return void')
      return
    }
    entity.save(diff)
    const send = require('./send-line.js')
    send(this.context, diff)
    return diff
  }
}

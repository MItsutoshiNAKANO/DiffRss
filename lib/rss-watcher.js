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
    this.context.log(`${diff.length} diffs`)
    return diff
  }

  async watch () {
    const Parser = require('rss-parser')
    const parser = new Parser({
      customFields: { feed: [['dc:date', 'date']] }
    })
    const currentFeeds = await parser.parseURL(this.url)
    const current = {
      date: currentFeeds.date,
      items: currentFeeds.items.map((i) => ({
        link: i.link, date: i.date, title: i.title
      }))
    }
    const Entity = require('./entity-wrapper.js')
    const entity = new Entity(this.context, this.key, this.args)
    const previous = entity.load()
    const diff = this.compare(current,
      await previous).sort((a, b) => (a.date - b.date) * -1)
    if (diff.length < 1) {
      this.context.log('return void')
      return
    }
    entity.save(current)
    const send = require('./send-line.js')
    await send(this.context, diff)
    return diff
  }
}

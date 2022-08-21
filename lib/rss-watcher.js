'use strict'
// SPDX-License-Identifier: AGPL-3.0-or-later
module.exports = class {
  constructor (context, site, args) {
    this.context = context
    this.url = site.url
    this.key = site.key
    this.args = args
  }

  differ (current, previous) {
    if (previous == null) {
      this.context.log('previous == null')
      return current.items
    }
    if (previous.date != null && previous.date === current.date) {
      this.context.log('same date')
      return []
    }
    this.context.log('differ date')
    if (current.items == null) {
      this.context.log.warn('illegal current format')
      return []
    }
    const map = new Map()
    current.items.forEach((item) => {
      map.set(`${item.link} ${item.date}`, item)
    })
    if (previous.items != null) {
      previous.items.forEach((item) => {
        map.delete(`${item.link} ${item.date}`)
      })
    }
    const diff = []
    map.forEach((item) => { diff.push(item) })
    this.context.log(`${diff.length} differs`)
    return diff.sort((x, y) => (x.date - y.date) * -1)
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
    const diff = this.differ(current, await previous)
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

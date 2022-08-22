// SPDX-License-Identifier: AGPL-3.0-or-later
'use strict'

const Parser = require('rss-parser')
const Entity = require('./entity-wrapper.js')

module.exports = class {
  constructor (context, site, args) {
    this.context = context
    this.url = site.url
    this.parser = new Parser({
      customFields: { feed: [['dc:date', 'date']] }
    })
    this.entity = new Entity(this.context, site.key, args)
  }

  async getCurrent () {
    const feed = await this.parser.parseURL(this.url)
    return {
      date: feed.date,
      items: feed.items.map((i) => ({
        link: i.link, date: i.date, title: i.title
      }))
    }
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
    const current = this.getCurrent()
    const previous = this.entity.load()
    const diff = this.differ(await current, await previous)
    if (diff.length < 1) {
      this.context.log('return void')
      return
    }
    this.entity.save(await current)
    const send = require('./send-line.js')
    await send(this.context, diff)
    return diff
  }
}

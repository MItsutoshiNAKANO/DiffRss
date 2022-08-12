'use strict'

const df = require('durable-functions')
// https://github.com/rbren/rss-parser
const Parser = require('rss-parser')
const parser = new Parser({
  customFields: { feed: [['dc:date', 'date']] }
})

class Entity {
  constructor (context, key) {
    this.client = df.getClient(context)
    this.id = new df.EntityId('Saver', key)
  }

  async getPrevious () {
    return await this.client.readEntityState(this.id)
  }

  async save (feed) {
    await this.client.signalEntity(this.id, 'set', feed)
  }
}

module.exports = class Rss {
  static async load (url) {
    return await parser.parseURL(url)
  }

  static pickup (feed) {
    const items = []
    feed.items.forEach(function (entry) {
      items.unshift({
        date: entry.date, link: entry.link, title: entry.title
      })
    })
    return { date: feed.date, items }
  }

  static diff (context, previous, current) {
    if (previous == null || previous.date == null) {
      context.log('diff(previos == null)')
      return current.items
    }
    if (previous.date === current.date) {
      context.log('diff(same date)')
      return []
    }
    context.log('diff(differ date)')
    const map = {}
    current.items.forEach((item) => { map[`${item.link} ${item.date}`] = item })
    previous.items.forEach((item) => {
      map.detele(`${item.link} ${item.date}`)
    })
    const result = []
    map.forEach((item) => { result.unshift(item) })
    return result
  }

  static async modified (context, site, args) {
    const feed = await Rss.load(site.url)
    const current = Rss.pickup(feed)
    context.log(current)
    const entity = context.entity ?? new Entity(context, site.key)
    const previous = await entity.getPrevious()
    context.log(previous)
    const result = Rss.diff(context, previous.entityState, current)
    context.log(result)
    if (result.length < 1) {
      context.log('return void')
      return
    }
    context.log('saving')
    await entity.save(current)
    context.log('saved')
    return result
  }
}

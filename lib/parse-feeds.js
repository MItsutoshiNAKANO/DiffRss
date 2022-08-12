'use strict'

const df = require('durable-functions')
// https://github.com/rbren/rss-parser
const Parser = require('rss-parser')
const parser = new Parser({
  customFields: { feed: [['dc:date', 'date']] }
})

class Entity {
  constructor (context, site) {
    this.parser = parser
    this.site = site
    this.client = df.getClient(context)
    this.id = new df.EntityId('Saver', site.key)
  }

  async load () {
    return await this.parser.parseURL(this.site.url)
  }

  async getPrevious () {
    return await this.client.readEntityState(this.id)
  }

  async save (feed) {
    await this.client.signalEntity(this.id, 'set', feed)
  }
}

module.exports = class Rss {
  static getNewItems (context, current, previous) {
    if (previous == null || previous.date == null) {
      context.log('diff(previous == null)')
      return current.items
    }
    if (previous.date === current.date) {
      context.log('diff(same date)')
      return []
    }
    context.log('diff(differ date)')
    const map = new Map()
    current.items.forEach((item) => {
      map.set(`${item.link} ${item.date}`, item)
    })
    previous.items.forEach((item) => {
      map.delete(`${item.link} ${item.date}`)
    })
    context.log(map.size)
    const result = []
    map.forEach((item) => {
      context.log(item)
      result.push(item)
    })
    return result
  }

  static async modified (context, site, args) {
    const entity = context.entity ?? new Entity(context, site)
    const current = await entity.load()
    // const current = Rss.pickup(feed)
    context.log(current)
    const previous = await entity.getPrevious()
    context.log(previous)
    const result = Rss.getNewItems(context, current, previous.entityState)
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

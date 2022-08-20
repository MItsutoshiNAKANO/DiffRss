'use strict'

const df = require('durable-functions')

module.exports = class {
  constructor (context, key, args) {
    this.context = context
    this.key = key
    this.client = df.getClient(context)
    this.id = new df.EntityId('Saver', this.key)
  }

  async load () {
    const response = await this.client.readEntityState(this.id)
    return response.entityState
  }

  async save (data) { await this.client.signalEntity(this.id, 'set', data) }
}

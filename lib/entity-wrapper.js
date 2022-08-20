'use strict'

const df = require('durable-functions')

module.exports = class {
  constructor (context, key, args) {
    this.context = context
    this.key = key
    this.client = df.getClient(context)
  }

  async load () {
    const id = new df.EntityId('Saver', this.key)
    const response = await this.client.readEntityState(id)
    return response.entityState
  }

  async save (data) { await this.client.signalEntity(this.id, 'set', data) }
}

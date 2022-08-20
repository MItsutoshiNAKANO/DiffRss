'use strict'

// https://github.com/rbren/rss-parser
const Parser = require('rss-parser')
module.exports = class extends Parser {
  constructor (options = {
    customFields: { feed: [['dc:date', 'date']] }
  }) { super(options) }
}

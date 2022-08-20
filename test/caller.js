'use strict'

const Watcher = require('../lib/rss-watcher.js')

const dummy = new Watcher(console, {
  url: 'https://example.com/', key: 'test'
}, null)

dummy.notice(null, null)

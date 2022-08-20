'use strict'

const RssWatcher = require('../lib/rss-watcher.js')

module.exports = async function (context, timer, saver) {
  const SITE = { url: 'https://jvn.jp/rss/jvn.rdf', key: 'jvn' }
  return (new RssWatcher(context, SITE, { timer, saver })).watch()
}

'use strict'

const RssWatcher = require('../lib/rss-watcher.js')

module.exports = async function (context, timer, saver) {
  const SITES = [
    { url: 'https://jvn.jp/rss/jvn.rdf', key: 'jvn' },
    { url: 'https://www.ipa.go.jp/security/rss/alert.rdf', key: 'ipa' }
  ]
  const site = SITES[(new Date()).getMinutes() % SITES.length]
  return (new RssWatcher(context, site, { timer, saver })).watch()
}

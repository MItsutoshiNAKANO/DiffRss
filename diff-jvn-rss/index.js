'use strict';

const Rss = require('../lib/parse-feeds');

module.exports = async function (context, timer, saver) {
    const SITE =  { 'url': 'https://jvn.jp/rss/jvn.rdf', 'key': 'jvn' };
    return await Rss.modified(context, SITE, { 'timer': timer, 'saver': saver });
};

'use strict';

let RssPicker = require('../lib/parse-feeds');
let rssPicker = new RssPicker();
const URL = 'https://jvn.jp/rss/jvn.rdf';

module.exports = async function (context, myTimer) {
    const feed = await rssPicker.body.parseURL(URL);
    const current = RssPicker.pickup(feed);
    context.log(current);
};

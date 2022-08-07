'use strict';

// https://github.com/rbren/rss-parser
let Parser = require('rss-parser');
const URL = 'https://jvn.jp/rss/jvn.rdf';
let parser = new Parser({
    customFields: {
      feed: [['dcterms:modified', 'modified']],
      item: [['dcterms:modified', 'modified']],
    }
});

function pickupJvnRss(feed) {
    let result = new Map();
    result['modified'] = feed.modified;
    let items = new Array();
    feed.items.forEach(function (entry) {
        items.unshift({
            'modified': entry.modified,
            'link': entry.link,
            'title': entry.title
        });
    });
    result['items'] = items;
    return result;
}

// // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/async_function
// (async () => {
//     const current = pickupJvnRss(await parser.parseURL(URL));
//     console.log(current);
// })();

module.exports = async function (context, myTimer) {
    if (myTimer.isPastDue)
    {
        context.log('JavaScript is running late!');
    }
    const current = pickupJvnRss(await parser.parseURL(URL));
    console.log(current);
};

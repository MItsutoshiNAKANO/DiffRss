'use strict';

// https://github.com/rbren/rss-parser
let Parser = require('rss-parser');

module.exports = class RssPicker {
    constructor() {
        this.body = new Parser({
            customFields: { feed: [['dc:date', 'date']] }
        });
    }
    static pickup(feed) {
        let items = new Array();
        feed.items.forEach(function (entry) {
            items.unshift({
                'date': entry.date,
                'link': entry.link,
                'title': entry.title
            });
        });
        return {
            'date': feed.date,
            'items': items
        };
    }
};

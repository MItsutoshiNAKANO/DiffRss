'use strict';

const df = require("durable-functions");
// https://github.com/rbren/rss-parser
const Parser = require('rss-parser');
const parser = new Parser({
    customFields: { feed: [['dc:date', 'date']] }
});

module.exports = class Rss {
    static pickup(feed) {
        let items = [];
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
    static diff(context, previous, current) {
        if (previous == null || previous.date == null) {
            context.log('diff(previos == null)');
            return current.items;
        }
        if (previous.date == current.date) {
            context.log('diff(same date)');
            return [];
        }
        context.log('diff(differ date)');
        let map = {};
        current.items.forEach((item) => {
            map[item.link, item.date] = item.title;
        });
        previous.items.forEach((item) => {
            map.detele([item.link, item.date]);
        });
        let result = [];
        map.forEach((title, [link, date]) => {
            result.unshift({
                'date': date,
                'link': link,
                'title': title
            });
        });
        return result;
    }
    static async modified(context, site, args) {
        const feed = await parser.parseURL(site.url);
        const current = Rss.pickup(feed);
        context.log({ 'current': current });
        const client = df.getClient(context);
        const entityId = new df.EntityId('Saver', site.key);
        const previous = await client.readEntityState(entityId);
        context.log({ 'previous': previous });
        const result = Rss.diff(context, previous.entityState, current);
        context.log({ 'result': result});
        if (result.length < 1) {
            context.log('return void');
            return;
        }
        context.log({ 'saving': current });
        await client.signalEntity(entityId, 'set', current);
        context.log({ 'result': result });
        return result;
    }
};

'use strict';

module.exports = async function (context, myTimer) {
    if (myTimer.isPastDue)
    {
        context.log('JavaScript is running late!');
    }
    let diffJvnRss = require('./diff-jvn-rss');
    const current = diffJvnRss.pickupJvnRss(await diffJvnRss.parser.parseURL(diffJvnRss.URL));
    console.log(current);
};

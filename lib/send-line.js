'use strict'

const line = require('@line/bot-sdk')

function head (bytes, links) {
  return links.filter(function (link) {
    bytes -= `${link}`.length + 2
    return bytes > 0
  })
}

module.exports = async (context, items) => {
  const links = items.map((item) => `${item.link} ${item.title}`)
  const text = head(5000, links).join('\r\n')
  const lineClient = new line.Client({
    channelAccessToken: process.env.LINE_ACCESS_TOKEN
  })
  return lineClient.pushMessage(process.env.LINE_ID, {
    type: 'text', text
  }).then(() => context.log('sent')).catch((err) => {
    context.log.error(err)
    throw err
  })
}

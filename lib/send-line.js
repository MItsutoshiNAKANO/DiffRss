'use strict'

const line = require('@line/bot-sdk')

module.exports = async (context, message) => {
  const text = message.map((content) => content.url).join(' ')
  const lineClient = new line.Client({
    channelAccessToken: process.env.LINE_ACCESS_TOKEN
  })
  const promise = lineClient.pushMessage(process.env.LINE_ID, {
    type: 'text', text
  })
  console.log(promise)
  promise.then(() => context.log('sent')).catch((err) => {
    context.log.error(err)
    throw err
  })
}

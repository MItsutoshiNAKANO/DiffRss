'use strict'
// https://docs.microsoft.com/ja-jp/azure/azure-functions/durable/durable-functions-overview?tabs=csharp
/*
* This function is not intended to be invoked directly. Instead it will be
* triggered by a client function.
*
* Before running this sample, please:
* - create a Durable entity HTTP function
* - run 'npm install durable-functions' from the root of your app
*/
const df = require('durable-functions')
// https://docs.microsoft.com/ja-jp/azure/azure-functions/functions-reference-node?tabs=v2-v3-v4-export%2Cv2-v3-v4-done%2Cv2%2Cv2-log-custom-telemetry%2Cv2-accessing-request-and-response%2Cwindows-setting-the-node-version#use-async-and-await
const util = require('util')
const entityFunction = util.promisify(function (context) {
  let value
  switch (context.df.operationName) {
    case 'set':
      context.log('set')
      value = context.df.getInput()
      context.df.setState(value)
      context.log('done setState(value)')
      break
    case 'get':
      context.log('get')
      value = context.df.getState(() => 0)
      context.log({ gotValue: value })
      context.df.return(value)
      break
    default:
      context.error({ invalidOperation: context.df.operationName })
      break
  }
  context.log('end switch')
})

// https://docs.microsoft.com/ja-jp/azure/azure-functions/durable/durable-functions-entities?tabs=javascript
module.exports = df.entity(function (context) {
  context.log('begin entity')
  entityFunction(context)
  context.log('end entity')
})

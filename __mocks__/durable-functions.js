/* eslint-env jest */

// see https://jestjs.io/ja/docs/manual-mocks#node-%E3%83%A2%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB%E3%81%AE%E3%83%A2%E3%83%83%E3%82%AF
const df = jest.createMockFromModule('durable-functions')

let __mockData

class MockClient {
  async readEntityState (id) { return { entityState: __mockData } }
  async signalEntity (id, operationName, data) {}
}

df.getClient = function (context) {
  return new MockClient()
}

df.__setMockData = function (data) { __mockData = data }

module.exports = df

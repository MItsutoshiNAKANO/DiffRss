/* eslint-env jest */

// see https://jestjs.io/ja/docs/manual-mocks#node-%E3%83%A2%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB%E3%81%AE%E3%83%A2%E3%83%83%E3%82%AF
const line = jest.createMockFromModule('@line/bot-sdk')

class MockClient extends line.Client {
  async pushMessage (id, config, notNotice) {}
}

line.Client = MockClient
module.exports = line

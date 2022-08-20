/* eslint-env jest */

// see https://jestjs.io/ja/docs/manual-mocks#node-%E3%83%A2%E3%82%B8%E3%83%A5%E3%83%BC%E3%83%AB%E3%81%AE%E3%83%A2%E3%83%83%E3%82%AF
const Parser = jest.createMockFromModule('rss-parser')

let __mockData

module.exports = class extends Parser {
  static __setMockData (data) { __mockData = data }

  async parseURL (url, callback, count) { return __mockData }
}

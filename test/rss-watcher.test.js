/* eslint-env jest */

// see https://jestjs.io/ja/docs/mock-functions
jest.mock('rss-parser')
jest.mock('durable-functions')
jest.mock('@line/bot-sdk')
const Parser = require('rss-parser')
const df = require('durable-functions')

const Watcher = require('../lib/rss-watcher.js')

const itemsOf1st = [
  {
    title: 'a',
    link: 'https://example.com/a',
    date: '2000-01-01T00:00:00+09:00'
  },
  {
    title: 'b',
    link: 'https://example.com/b',
    date: '2000-01-01T00:00:00+09:00'
  }
]

const itemC = {
  title: 'c',
  link: 'https://example.com/c',
  date: '2000-01-01T00:00:01+09:00'
}

const updatedB = {
  title: 'b',
  link: 'https://example.com/b',
  date: '2000-01-01T00:00:02+09:00'
}

const feeds = [
  { date: '2000-01-01T00:00:00+09:00', items: itemsOf1st },
  {
    date: '2000-01-01T00:00:01+09:00',
    items: [
      {
        title: 'b',
        link: 'https://example.com/b',
        date: '2000-01-01T00:00:00+09:00'
      },
      itemC
    ]
  },
  {
    date: '2000-01-01T00:00:02+09:00',
    items: [updatedB]
  }
]

const site = { url: 'https://example.com/', key: 'test' }
const context = console

describe('Test Watcher.compare()', () => {
  const watcher = new Watcher(context, site, null)
  test('undefined', () => {
    expect(watcher.compare(feeds[0], undefined)).toStrictEqual(itemsOf1st)
  })

  test('{}', () => {
    expect(watcher.compare(feeds[0], {})).toStrictEqual(itemsOf1st)
  })

  test('same date', () => {
    expect(watcher.compare(feeds[0],
      { date: '2000-01-01T00:00:00+09:00' })).toStrictEqual([])
  })

  test('bc - ab', async () => {
    expect(watcher.compare(feeds[1], feeds[0])).toStrictEqual([itemC])
  })

  test('update c', async () => {
    expect(watcher.compare(feeds[2], feeds[1])).toStrictEqual([updatedB])
  })
})

describe('Test Watcher.watch()', () => {
  process.env.LINE_ACCESS_TOKEN = 'dummy'
  process.env.LINE_ID = 'dummy'
  test('previous is null', async () => {
    Parser.__setMockData(feeds[0])
    df.__setMockData(undefined)
    const watcher = new Watcher(context, site, null)
    expect(await watcher.watch()).toStrictEqual(itemsOf1st)
  })
  test('same data', async () => {
    Parser.__setMockData(feeds[0])
    df.__setMockData(feeds[0])
    const watcher = new Watcher(context, site, null)
    expect(await watcher.watch()).toBeUndefined()
  })
  test('different data', async () => {
    Parser.__setMockData(feeds[1])
    df.__setMockData(feeds[0])
    const watcher = new Watcher(context, site, null)
    expect(await watcher.watch()).toStrictEqual([itemC])
  })
})

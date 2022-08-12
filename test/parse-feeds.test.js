/* eslint-env jest */

const Rss = require('../lib/parse-feeds')

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

const feeds = [
  {
    date: '2000-01-01T00:00:00+09:00',
    items: itemsOf1st
  },
  {
    date: '2000-01-01T00:00:01+09:00',
    items: [
      {
        title: 'b',
        link: 'https://example.com/b',
        date: '2000-01-01T00:00:00+09:00'
      },
      {
        title: 'c',
        link: 'https://example.com/c',
        date: '2000-01-01T00:00:01+09:00'
      }
    ]
  },
  {
    date: '2000-01-01T00:00:02+09:00',
    items: [
      {
        title: 'b',
        link: 'https://example.com/b',
        date: '2000-01-01T00:00:02+09:00'
      }
    ]
  }
]

class Entity {
  async load () {
    return await this.parser.parseURL(this.site.url)
  }

  async getPrevious () {
    return await this.client.readEntityState(this.id)
  }

  async save (feed) {
    await this.client.signalEntity(this.id, 'set', feed)
  }
}

describe('Test getNewItems()', () => {
  test('undefined', () => {
    expect(Rss.getNewItems(console, feeds[0],
      undefined)).toStrictEqual(itemsOf1st)
  })

  test('{}', () => {
    expect(Rss.getNewItems(console, feeds[0],
      {})).toStrictEqual(itemsOf1st)
  })

  test('same date', () => {
    expect(Rss.getNewItems(console, feeds[0],
      { date: '2000-01-01T00:00:00+09:00' })).toStrictEqual([])
  })

  test('bc - ab', async () => {
    expect(Rss.getNewItems(console, feeds[1],
      feeds[0])).toStrictEqual([{
      title: 'c',
      link: 'https://example.com/c',
      date: '2000-01-01T00:00:01+09:00'
    }])
  })

  test('update c', async () => {
    expect(Rss.getNewItems(console, feeds[2],
      feeds[1])).toStrictEqual([{
      title: 'b',
      link: 'https://example.com/b',
      date: '2000-01-01T00:00:02+09:00'
    }])
  })

})

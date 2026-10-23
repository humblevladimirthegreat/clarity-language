import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { lessonPages, pathPages, readingOrder } from './reading-order.js'
import type { HoldingSitting } from './holding-list.js'

const lessons = [
  { text: 'Why Agebon', link: '/' },
  { text: 'Word endings', link: '/word-endings' },
  { text: 'Clause', link: '/clause' },
] as const

describe('pathPages', () => {
  it('matches sidebar order plus the review page when the holding list is empty', () => {
    const pages = pathPages()
    assert.equal(pages[0], 'index.md')
    assert.equal(pages[1], 'introduction.md')
    assert.equal(pages.at(-1), 'review.md')
    assert.equal(pages.length, readingOrder.length + 1)
    assert.ok(!pages.includes(''))
  })

  it('splices peeled sittings after their parent, Intermediate before Advanced', () => {
    const holding: HoldingSitting[] = [
      { parent: 'word-endings.md', page: 'proper-names.md', band: 'intermediate', title: 'Proper names' },
      { parent: 'clause.md', page: 'left-bound.md', band: 'intermediate', title: 'Left-bound adjectives' },
      { parent: 'clause.md', page: 'emphasis.md', band: 'advanced', title: 'Emphasis' },
    ]
    assert.deepEqual(pathPages(lessons, holding, 'review.md'), [
      'index.md',
      'word-endings.md',
      'proper-names.md',
      'clause.md',
      'left-bound.md',
      'emphasis.md',
      'review.md',
    ])
    assert.deepEqual(
      lessonPages(lessons, holding).map((item) => item.title),
      ['Why Agebon', 'Word endings', 'Proper names', 'Clause', 'Left-bound adjectives', 'Emphasis'],
    )
  })
})

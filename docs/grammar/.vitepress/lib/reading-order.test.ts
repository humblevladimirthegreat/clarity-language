import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  advancedLessons,
  beginnerLessons,
  intermediateLessons,
  lessonPages,
  levelReviewPages,
  orientation,
  pathPages,
  readingOrder,
  sidebarGroups,
} from './reading-order.js'

describe('pathPages', () => {
  it('is orientation, then each group with its review last', () => {
    const pages = pathPages()
    assert.equal(pages[0], 'index.md')
    assert.equal(pages[1], 'introduction.md')
    assert.equal(pages[2], 'phonology.md')
    assert.equal(pages.at(-1), 'review-advanced.md')
    assert.equal(pages.length, readingOrder.length)
    assert.ok(!pages.includes(''))
    assert.deepEqual(
      pages.filter((page) => levelReviewPages.includes(page as (typeof levelReviewPages)[number])),
      [...levelReviewPages],
    )
  })

  it('keeps each review last in its sidebar group', () => {
    assert.equal(sidebarGroups[0]!.items.at(-1)?.link, '/review')
    assert.equal(sidebarGroups[1]!.items.at(-1)?.link, '/review-intermediate')
    assert.equal(sidebarGroups[2]!.items.at(-1)?.link, '/review-advanced')
    assert.equal(sidebarGroups[1]!.collapsed, true)
    assert.equal(sidebarGroups[2]!.collapsed, true)
  })

  it('walks Beginner sittings, then Intermediate, then Advanced', () => {
    const pages = pathPages()
    const beginnerEnd = pages.indexOf('review.md')
    const intermediateEnd = pages.indexOf('review-intermediate.md')
    const advancedEnd = pages.indexOf('review-advanced.md')
    assert.equal(pages[orientation.length], 'phonology.md')
    assert.equal(pages[beginnerEnd - 1], `${beginnerLessons.at(-1)!.link.replace(/^\//, "")}.md`)
    assert.equal(pages.slice(orientation.length, beginnerEnd).length, beginnerLessons.length)
    assert.equal(pages.slice(beginnerEnd + 1, intermediateEnd).length, intermediateLessons.length)
    assert.equal(pages.slice(intermediateEnd + 1, advancedEnd).length, advancedLessons.length)
    assert.ok(intermediateEnd > beginnerEnd)
    assert.ok(advancedEnd > intermediateEnd)
  })
})

describe('lessonPages', () => {
  it('uses job titles for later sittings', () => {
    const titles = lessonPages().map((item) => item.title)
    assert.ok(titles.includes('Rank joins'))
    assert.ok(titles.includes('Proper names and titled phrases'))
    assert.equal(titles.filter((title) => title === 'Review').length, 3)
  })
})

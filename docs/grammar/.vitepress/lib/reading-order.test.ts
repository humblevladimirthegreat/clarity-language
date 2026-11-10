import assert from 'node:assert/strict'
import { readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it } from 'node:test'

import {
  advancedLessons,
  advancedUnits,
  bandLessons,
  beginnerLessons,
  beginnerUnits,
  cheatSheetSidebar,
  cheatSheetSlug,
  intermediateLessons,
  intermediateUnits,
  lessonPages,
  levelReviewPages,
  levelReviews,
  orientation,
  pathPages,
  readingOrder,
  sidebarGroups,
} from './reading-order.js'

const cheatSheetsDir = join(dirname(fileURLToPath(import.meta.url)), '../../cheat-sheets')

const bands = [
  { text: 'Beginner', units: beginnerUnits, lessons: beginnerLessons },
  { text: 'Intermediate', units: intermediateUnits, lessons: intermediateLessons },
  { text: 'Advanced', units: advancedUnits, lessons: advancedLessons },
]

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

  it('keeps each review last in its sidebar group, outside every unit', () => {
    for (const [index, group] of sidebarGroups.entries()) {
      const review = levelReviews[index]!
      assert.equal(group.collapsed, true)
      assert.deepEqual(group.items.at(-1), review)
      const subGroups = group.items.slice(0, -1)
      assert.ok(subGroups.every((item) => 'items' in item))
      for (const unit of bands[index]!.units) {
        assert.ok(!unit.items.some((item) => item.link === review.link), `${review.link} sits in unit ${unit.text}`)
      }
      assert.deepEqual(bandLessons[index]!.items.at(-1), review)
    }
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

describe('units', () => {
  it('has at least one unit per band, each titled and non-empty', () => {
    for (const band of bands) {
      assert.ok(band.units.length > 0, `${band.text} has no units`)
      for (const unit of band.units) {
        assert.ok(unit.text.trim() !== '', `${band.text} has an untitled unit`)
        assert.ok(unit.items.length > 0, `unit ${unit.text} is empty`)
      }
      const titles = band.units.map((unit) => unit.text)
      assert.equal(new Set(titles).size, titles.length, `${band.text} repeats a unit title`)
    }
  })

  it('puts every sitting in exactly one unit', () => {
    const links = bands.flatMap((band) => band.units.flatMap((unit) => unit.items.map((item) => item.link)))
    const repeated = links.filter((link, index) => links.indexOf(link) !== index)
    assert.deepEqual(repeated, [])
    const sittings = readingOrder
      .map((item) => item.link)
      .filter((link) => !orientation.some((item) => item.link === link))
      .filter((link) => !levelReviews.some((item) => item.link === link))
    assert.deepEqual(links, sittings)
  })

  it('keeps the flat lists equal to the flattened units', () => {
    for (const [index, band] of bands.entries()) {
      const flat = band.units.flatMap((unit) => unit.items)
      assert.deepEqual(band.lessons, flat)
      assert.deepEqual(bandLessons[index]!.text, band.text)
      assert.deepEqual(bandLessons[index]!.items, [...flat, levelReviews[index]!])
    }
    assert.deepEqual(readingOrder, [...orientation, ...bandLessons.flatMap((band) => band.items)])
  })

  it('nests each unit in the sidebar as a collapsed sub-group with no number', () => {
    for (const [index, band] of bands.entries()) {
      const group = sidebarGroups[index]!
      assert.equal(group.text, band.text)
      assert.deepEqual(
        group.items.slice(0, -1),
        band.units.map((unit) => ({ text: unit.text, collapsed: true, items: unit.items })),
      )
      for (const unit of band.units) assert.doesNotMatch(unit.text, /\d/)
    }
  })
})

describe('lessonPages', () => {
  it('uses job titles for later sittings', () => {
    const titles = lessonPages().map((item) => item.title)
    assert.ok(titles.includes('Rank joins'))
    assert.ok(titles.includes('Names and titles'))
    assert.ok(titles.includes('How you know'))
    assert.ok(titles.includes('Whose now'))
    assert.ok(titles.includes('Longer chains'))
    assert.equal(titles.filter((title) => title === 'Review').length, 3)
  })
})

describe('cheatSheetSidebar', () => {
  it('lists every file in docs/grammar/cheat-sheets/', () => {
    const onDisk = readdirSync(cheatSheetsDir)
      .filter((name) => name.endsWith('.md'))
      .sort()
    const inSidebar = cheatSheetSidebar.map((item) => `${cheatSheetSlug(item.link)}.md`).sort()
    assert.deepEqual(inSidebar, onDisk)
  })
})

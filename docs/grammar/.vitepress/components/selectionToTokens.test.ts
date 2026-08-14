import assert from 'node:assert/strict'
import { Window } from 'happy-dom'
import { describe, it } from 'node:test'

import {
  TOKEN_INDEX_ATTR,
  endingChipIndex,
  findCoveringConstruction,
  normalizeTokenRange,
  selectionToTokenRange,
  tokenIndexFromElement,
} from './selectionToTokens.js'

function fixture(): { window: Window; root: HTMLElement; english: HTMLElement } {
  const window = new Window()
  const document = window.document
  const root = document.createElement('div')
  root.innerHTML = `
    <p class="stream">
      <span class="tok" ${TOKEN_INDEX_ATTR}="0">zazawan</span>
      <span class="tok punct" ${TOKEN_INDEX_ATTR}="1"> </span>
      <span class="tok" ${TOKEN_INDEX_ATTR}="2">vawul</span>
      <span class="tok punct" ${TOKEN_INDEX_ATTR}="3">.</span>
    </p>
  `
  const english = document.createElement('p')
  english.textContent = 'English prose should be ignored.'
  document.body.append(root, english)
  return { window, root, english }
}

describe('tokenIndexFromElement', () => {
  it('walks up to the token span', () => {
    const { root } = fixture()
    const token = root.querySelector(`[${TOKEN_INDEX_ATTR}="2"]`)!
    const text = token.firstChild!
    assert.equal(tokenIndexFromElement(text, root), 2)
  })

  it('returns null outside the overlay root', () => {
    const { root, english } = fixture()
    const text = english.firstChild!
    assert.equal(tokenIndexFromElement(text, root), null)
  })
})

describe('selectionToTokenRange', () => {
  it('maps a multi-token highlight inside the overlay', () => {
    const { window, root } = fixture()
    const first = root.querySelector(`[${TOKEN_INDEX_ATTR}="0"]`)!.firstChild!
    const last = root.querySelector(`[${TOKEN_INDEX_ATTR}="2"]`)!.firstChild!
    const selection = window.document.getSelection()!
    const range = window.document.createRange()
    range.setStart(first, 0)
    range.setEnd(last, 5)
    selection.removeAllRanges()
    selection.addRange(range)

    assert.deepEqual(selectionToTokenRange(selection, root), { start: 0, end: 2 })
  })

  it('ignores selections anchored in English prose', () => {
    const { window, root, english } = fixture()
    const prose = english.firstChild!
    const token = root.querySelector(`[${TOKEN_INDEX_ATTR}="0"]`)!.firstChild!
    const selection = window.document.getSelection()!
    const range = window.document.createRange()
    range.setStart(prose, 0)
    range.setEnd(token, 3)
    selection.removeAllRanges()
    selection.addRange(range)

    assert.equal(selectionToTokenRange(selection, root), null)
  })

  it('returns null for collapsed selections', () => {
    const { window, root } = fixture()
    const token = root.querySelector(`[${TOKEN_INDEX_ATTR}="0"]`)!.firstChild!
    const selection = window.document.getSelection()!
    const range = window.document.createRange()
    range.setStart(token, 1)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)

    assert.equal(selectionToTokenRange(selection, root), null)
  })
})

describe('normalizeTokenRange', () => {
  it('drops punct-only ranges', () => {
    const tokens = [
      { kind: 'word' },
      { kind: 'punct' },
      { kind: 'word' },
      { kind: 'punct' },
    ]
    assert.equal(normalizeTokenRange({ start: 1, end: 1 }, tokens), null)
  })

  it('keeps inspectable tokens inside a wider range', () => {
    const tokens = [
      { kind: 'word' },
      { kind: 'punct' },
      { kind: 'word' },
      { kind: 'punct' },
    ]
    assert.deepEqual(normalizeTokenRange({ start: 0, end: 3 }, tokens), { start: 0, end: 2 })
  })
})

describe('findCoveringConstruction', () => {
  it('picks the smallest construction that covers the selection', () => {
    const constructions = [
      { tokenIndices: [0, 1, 2, 3, 4] },
      { tokenIndices: [1, 2, 3] },
      { tokenIndices: [2, 3] },
    ]
    assert.equal(findCoveringConstruction({ start: 1, end: 3 }, constructions), 1)
  })

  it('returns null when no construction covers the selection', () => {
    const constructions = [{ tokenIndices: [0, 1] }]
    assert.equal(findCoveringConstruction({ start: 2, end: 4 }, constructions), null)
  })
})

describe('endingChipIndex', () => {
  it('highlights the ending chip when only the suffix is selected', () => {
    const chips = ['/z/', 'zazawa', '-n named']
    assert.equal(endingChipIndex('zazawan', 'n', chips, 6, 7), 2)
  })

  it('returns null when the selection is not the ending suffix', () => {
    const chips = ['/z/', 'zazawa', '-n named']
    assert.equal(endingChipIndex('zazawan', 'n', chips, 0, 3), null)
  })
})

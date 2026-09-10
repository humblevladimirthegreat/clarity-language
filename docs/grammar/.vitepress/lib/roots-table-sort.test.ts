import assert from 'node:assert/strict'
import { Window } from 'happy-dom'
import { describe, it } from 'node:test'

import { cellSortKey, enhanceRootsTables, isRootsUsedTable } from './roots-table-sort.js'

function docWith(html: string): Document {
  const window = new Window()
  window.document.body.innerHTML = html
  return window.document as unknown as Document
}

const rootsTable = `
<div class="vp-doc">
  <table>
    <thead>
      <tr>
        <th>English</th>
        <th>Agalan</th>
        <th>Same root as</th>
        <th>Cue</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>dog</td><td>odogo</td><td></td><td></td></tr>
      <tr><td>cat</td><td>agada</td><td></td><td></td></tr>
      <tr><td>walk</td><td>awala</td><td></td><td></td></tr>
    </tbody>
  </table>
  <table>
    <thead>
      <tr>
        <th>Agalan</th>
        <th>Use</th>
        <th>Cue</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>/z/</td><td>subject</td><td>star</td></tr>
    </tbody>
  </table>
</div>
`

function firstCol(table: HTMLTableElement): string[] {
  return [...table.querySelectorAll('tbody tr')].map((row) => row.children[0]?.textContent ?? '')
}

function secondCol(table: HTMLTableElement): string[] {
  return [...table.querySelectorAll('tbody tr')].map((row) => row.children[1]?.textContent ?? '')
}

describe('isRootsUsedTable', () => {
  it('requires English and Agalan headers', () => {
    const document = docWith(rootsTable)
    const tables = [...document.querySelectorAll('table')] as HTMLTableElement[]
    assert.equal(isRootsUsedTable(tables[0]!), true)
    assert.equal(isRootsUsedTable(tables[1]!), false)
  })
})

describe('cellSortKey', () => {
  it('trims and lowercases', () => {
    assert.equal(cellSortKey('  Dog  '), 'dog')
  })
})

describe('enhanceRootsTables', () => {
  it('makes only English and Agalan sortable', () => {
    const document = docWith(rootsTable)
    enhanceRootsTables(document)
    const tables = [...document.querySelectorAll('table')] as HTMLTableElement[]
    const roots = tables[0]!
    const other = tables[1]!
    assert.equal(roots.querySelectorAll('button.roots-sort-btn').length, 2)
    assert.equal(other.querySelector('button'), null)
    const labels = [...roots.querySelectorAll('th')].map((th) => th.textContent)
    assert.deepEqual(labels, ['English', 'Agalan', 'Same root as', 'Cue'])
  })

  it('cycles English sort then restores teaching order', () => {
    const document = docWith(rootsTable)
    enhanceRootsTables(document)
    const table = document.querySelector('table') as HTMLTableElement
    const english = table.querySelector('button[aria-label="Sort by English"]') as HTMLButtonElement

    english.click()
    assert.deepEqual(firstCol(table), ['cat', 'dog', 'walk'])
    assert.equal(table.querySelector('thead th')?.getAttribute('aria-sort'), 'ascending')

    english.click()
    assert.deepEqual(firstCol(table), ['walk', 'dog', 'cat'])
    assert.equal(table.querySelector('thead th')?.getAttribute('aria-sort'), 'descending')

    english.click()
    assert.deepEqual(firstCol(table), ['dog', 'cat', 'walk'])
    assert.equal(table.querySelector('thead th')?.getAttribute('aria-sort'), 'none')
  })

  it('sorts by Agalan independently', () => {
    const document = docWith(rootsTable)
    enhanceRootsTables(document)
    const table = document.querySelector('table') as HTMLTableElement
    const agalan = table.querySelector('button[aria-label="Sort by Agalan"]') as HTMLButtonElement
    agalan.click()
    assert.deepEqual(secondCol(table), ['agada', 'awala', 'odogo'])
    assert.deepEqual(firstCol(table), ['cat', 'walk', 'dog'])
  })
})

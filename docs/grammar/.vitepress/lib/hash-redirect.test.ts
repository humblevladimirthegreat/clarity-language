import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  applyHashRedirect,
  pageToRoutePath,
  routePathToPage,
  type HashRedirect,
} from './hash-redirect.js'

const map: HashRedirect[] = [
  { page: 'joins.md', hash: 'intermediate', to: 'rank-joins.md' },
  { page: 'joins.md', hash: 'beginner', to: 'joins.md' },
]

describe('applyHashRedirect', () => {
  it('sends a peeled band hash to the new sitting, dropping the fragment', () => {
    assert.deepEqual(applyHashRedirect('/joins.html', '#intermediate', map), {
      path: '/rank-joins.html',
      hash: '',
    })
  })

  it('drops a same-file retired hash so the page scrolls to the top', () => {
    assert.deepEqual(applyHashRedirect('/joins.html', '#beginner', map), {
      path: '/joins.html',
      hash: '',
    })
  })

  it('leaves unknown hashes and empty hashes alone', () => {
    assert.equal(applyHashRedirect('/joins.html', '#clause-joins', map), undefined)
    assert.equal(applyHashRedirect('/joins.html', '', map), undefined)
    assert.equal(applyHashRedirect('/clause.html', '#intermediate', map), undefined)
    assert.equal(applyHashRedirect('/joins.html', undefined, map), undefined)
    assert.equal(applyHashRedirect(undefined, '#intermediate', map), undefined)
  })
})

describe('route path round-trip', () => {
  it('maps VitePress paths to page files', () => {
    assert.equal(routePathToPage('/joins.html'), 'joins.md')
    assert.equal(routePathToPage('/'), 'index.md')
    assert.equal(pageToRoutePath('rank-joins.md'), '/rank-joins.html')
    assert.equal(pageToRoutePath('index.md'), '/')
  })
})

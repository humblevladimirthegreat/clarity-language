import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  amplifyRedirectRules,
  loadSiteRedirects,
  rootIndexHtml,
  stubHtml,
} from './site-redirects.ts'

describe('site-redirects', () => {
  it('maps coordination.html to joins.html', () => {
    const map = loadSiteRedirects()
    const row = map.pageMoves.find((m) => m.from === '/grammar/coordination.html')
    assert.ok(row)
    assert.equal(row.to, '/grammar/joins.html')
  })

  it('puts page 301s before the 404 catch-all', () => {
    const rules = amplifyRedirectRules(loadSiteRedirects())
    const coord = rules.findIndex((r) => r.source === '/grammar/coordination.html')
    const catchAll = rules.findIndex((r) => r.source === '/<*>' && r.status === '404')
    assert.ok(coord >= 0)
    assert.equal(rules[coord].status, '301')
    assert.equal(rules[coord].target, '/grammar/joins.html')
    assert.ok(catchAll > coord)
    assert.equal(rules[catchAll].target, '/grammar/404.html')
  })

  it('keeps hash and query on move stubs', () => {
    const html = stubHtml({
      from: '/grammar/coordination.html',
      to: '/grammar/joins.html',
    })
    assert.match(html, /joins\.html/)
    assert.match(html, /location\.search \+ location\.hash/)
  })

  it('sends non-root index loads to the grammar 404', () => {
    const html = rootIndexHtml()
    assert.match(html, /pathname/)
    assert.match(html, /\/grammar\/404\.html/)
    assert.doesNotMatch(html, /http-equiv="refresh"/)
  })
})

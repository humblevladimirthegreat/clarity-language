import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildStampIso, formatBuildStampEt } from './build-stamp.js'

describe('build-stamp', () => {
  it('formats Eastern Time with a stable ET suffix', () => {
    const date = new Date('2026-01-15T16:51:00.000Z')
    assert.equal(formatBuildStampEt(date), 'Updated Jan 15, 2026 · 11:51 AM ET')
  })

  it('exports ISO for the time element datetime attribute', () => {
    const date = new Date('2026-01-15T16:51:00.000Z')
    assert.equal(buildStampIso(date), '2026-01-15T16:51:00.000Z')
  })
})

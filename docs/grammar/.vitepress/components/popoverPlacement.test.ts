import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { computePopoverPlacement, unionRect, type RectLike } from './popoverPlacement.js'

function rect(left: number, top: number, width: number, height: number): RectLike {
  return { left, top, width, height, right: left + width, bottom: top + height }
}

describe('computePopoverPlacement', () => {
  it('places below when there is room', () => {
    const placement = computePopoverPlacement(rect(100, 100, 80, 24), 240, 120, 8, 800, 600)
    assert.equal(placement.placement, 'below')
    assert.equal(placement.top, 132)
    assert.equal(placement.left, 20)
  })

  it('flips above when below is too tight', () => {
    const placement = computePopoverPlacement(rect(100, 520, 80, 24), 240, 120, 8, 800, 600)
    assert.equal(placement.placement, 'above')
    assert.equal(placement.top, 392)
  })
})

describe('unionRect', () => {
  it('wraps multiple token boxes', () => {
    const merged = unionRect([rect(10, 20, 40, 16), rect(60, 18, 50, 18)])
    assert.equal(merged.left, 10)
    assert.equal(merged.top, 18)
    assert.equal(merged.width, 100)
    assert.equal(merged.height, 18)
  })
})

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { detectPitch, freqMidi, heldNote, judgePitch, type Heard } from './pitch-detect.js'

const RATE = 48000

/** A voice-like tone: a fundamental with strong overtones, the second louder than the first. */
function tone(freq: number, harmonics = [0.6, 1, 0.5, 0.3], n = 2048): Float32Array {
  const buf = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    for (let h = 0; h < harmonics.length; h++) buf[i]! += 0.2 * harmonics[h]! * Math.sin((2 * Math.PI * freq * (h + 1) * i) / RATE)
  }
  return buf
}

describe('pitch detect', () => {
  it('finds sung pitches across the drill range to within a few cents', () => {
    for (const freq of [65.4, 110, 155.6, 220, 392, 523.3, 880]) {
      const p = detectPitch(tone(freq), RATE)
      assert.ok(p, `${freq} Hz`)
      assert.ok(Math.abs(freqMidi(p.freq) - freqMidi(freq)) < 0.05, `${freq} Hz heard as ${p.freq.toFixed(1)}`)
    }
  })

  it('finds a pure sine', () => {
    const p = detectPitch(tone(196, [1]), RATE)
    assert.ok(p && Math.abs(p.freq - 196) < 1)
  })

  it('hears nothing in silence or noise', () => {
    assert.equal(detectPitch(new Float32Array(2048), RATE), null)
    let seed = 1
    const noise = new Float32Array(2048).map(() => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * 0.4)
    assert.equal(detectPitch(noise, RATE), null)
  })

  it('settles on a held note and ignores a wobbly one', () => {
    const held: Heard[] = Array.from({ length: 60 }, (_, i) => ({ t: i / 60, midi: 51.2 + (i % 3) * 0.1 }))
    assert.ok(Math.abs(heldNote(held, 1)! - 51.3) < 1e-9)
    assert.equal(heldNote(held.slice(0, 30), 0.5), null)
    const wobbly = held.map((h, i) => ({ ...h, midi: 51 + (i % 2) * 2 }))
    assert.equal(heldNote(wobbly, 1), null)
    const gappy = held.map((h, i) => ({ ...h, midi: i % 2 ? null : h.midi }))
    assert.equal(heldNote(gappy, 1), null)
  })

  it('judges within a semitone, in any octave', () => {
    assert.equal(judgePitch([55.6, 55.8, 55.7, 55.9, 55.7], 55).verdict, 'ok')
    assert.equal(judgePitch([67.2, 67.1, 67.3, 67.2, 67.2], 55).verdict, 'ok')
    assert.deepEqual(judgePitch([57, 57, 57, 57, 57], 55), { verdict: 'sharp', off: 2 })
    assert.deepEqual(judgePitch([48, 48, 48, 48, 48], 55), { verdict: 'flat', off: -7 })
    assert.equal(judgePitch([55, 55], 55).verdict, 'silent')
  })
})

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { detectPitch, freqMidi, heldNote, judgeMove, judgePitch, type Heard } from './pitch-detect.js'

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
    assert.deepEqual(judgePitch([57, 57, 57, 57, 57], 55), { verdict: 'close', off: 2 })
    assert.deepEqual(judgePitch([59, 59, 59, 59, 59], 55), { verdict: 'sharp', off: 4 })
    assert.deepEqual(judgePitch([48, 48, 48, 48, 48], 55), { verdict: 'sharp', off: 5 })
    assert.deepEqual(judgePitch([52, 52, 52, 52, 52], 55), { verdict: 'flat', off: -3 })
    assert.equal(judgePitch([55, 55], 55).verdict, 'silent')
    assert.equal(judgePitch([55.6, 55.6, 55.6, 55.6, 55.6], 55, 0.5).verdict, 'close')
    assert.equal(judgePitch([55.4, 55.4, 55.4, 55.4, 55.4], 55, 0.5).verdict, 'ok')
  })

  it('judges a move by its direction only, from wherever the last note was', () => {
    const at = (m: number) => [m, m, m, m, m]
    // A rise of 3 aimed: any rise of a semitone or more passes, wherever it starts.
    assert.deepEqual(judgeMove(at(55), 52, 3), { verdict: 'ok', off: 0, aim: 3, moved: 3 })
    assert.equal(judgeMove(at(50.5), 49, 3).verdict, 'ok')
    assert.equal(judgeMove(at(60), 52, 3).verdict, 'ok')
    assert.equal(judgeMove(at(52.5), 52, 3).verdict, 'close')
    assert.equal(judgeMove(at(52), 52, 3).verdict, 'flat')
    assert.equal(judgeMove(at(50), 52, 3).verdict, 'flat')
    // A fall: the mirror image.
    assert.equal(judgeMove(at(48), 52, -4).verdict, 'ok')
    assert.equal(judgeMove(at(51.6), 52, -4).verdict, 'close')
    assert.equal(judgeMove(at(53), 52, -4).verdict, 'sharp')
    // A level move: within a semitone.
    assert.equal(judgeMove(at(52.8), 52, 0).verdict, 'ok')
    assert.equal(judgeMove(at(53.5), 52, 0).verdict, 'close')
    assert.equal(judgeMove(at(49), 52, 0).verdict, 'flat')
  })

  it('keeps octaves in a move, and needs a note before to judge one', () => {
    const at = (m: number) => [m, m, m, m, m]
    // Down a fourth for a fifth up lands an octave from the aim: still the wrong way.
    assert.equal(judgeMove(at(47), 52, 7).verdict, 'flat')
    assert.equal(judgeMove(at(64), 52, 7).verdict, 'ok')
    assert.deepEqual(judgeMove(at(55), null, 3), { verdict: 'heard', off: 0 })
    assert.equal(judgeMove([55, 55], 52, 3).verdict, 'silent')
  })
})

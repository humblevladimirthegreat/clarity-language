import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { detectPitch, freqMidi } from './pitch-detect.js'
import { renderVowel } from './vowel-voice.js'

const RATE = 48000

describe('vowel voice', () => {
  it('sings each vowel on its exact note, across the drill range', () => {
    // The lowest home (43) to the highest home's `u` (60 + 7).
    for (const vowel of ['a', 'o', 'e', 'u']) {
      for (const midi of [43, 51, 58, 67]) {
        const samples = renderVowel(vowel, midi, RATE, 0.5)
        const mid = samples.subarray(RATE * 0.2, RATE * 0.2 + 4096)
        const heard = detectPitch(mid, RATE)
        assert.ok(heard, `${vowel} at ${midi}: no pitch heard`)
        assert.ok(Math.abs(freqMidi(heard.freq) - midi) < 0.1, `${vowel} at ${midi}: heard ${freqMidi(heard.freq).toFixed(2)}`)
      }
    }
  })

  it('renders the length asked for', () => {
    assert.equal(renderVowel('a', 51, RATE, 0.5).length, RATE * 0.5)
  })

  it('has no voice for a non-vowel', () => {
    assert.throws(() => renderVowel('b', 51, RATE, 0.5))
  })
})

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  ESPEAK_SAMPLE_RATE,
  decodeSamples,
  pcmFromSynthesizeCallbacks,
} from './speak-audio.js'

/** Same packing as `eSpeakNGWorker.prototype.synthesize` in espeakng.worker.js. */
function espeakStereoBuffer(mono: number[]): ArrayBuffer {
  const stereo = new Float32Array(mono.length * 2)
  for (let i = 0; i < mono.length; i++) {
    stereo[i * 2] = mono[i]!
    stereo[i * 2 + 1] = mono[i]!
  }
  return stereo.buffer
}

describe('decodeSamples', () => {
  it('deinterleaves the stereo float32 ArrayBuffer eSpeak posts, keeping values in [-1, 1]', () => {
    const left = [0.25, -0.5, 0.125]
    const decoded = decodeSamples(espeakStereoBuffer(left))
    assert.equal(decoded.length, left.length)
    for (let i = 0; i < left.length; i++) {
      assert.ok(
        Math.abs((decoded[i] ?? 0) - left[i]!) < 1e-6,
        `sample ${i}: got ${decoded[i]}, want ${left[i]}`,
      )
    }
  })
})

describe('pcmFromSynthesizeCallbacks', () => {
  it('concatenates every audio chunk until the worker done message (undefined)', () => {
    // ~60ms first callback + the rest of a two-word utterance, then `done: true`.
    const first = Array.from({ length: 1323 }, (_, i) => Math.sin(i / 20) * 0.3)
    const rest = Array.from({ length: 18000 }, (_, i) => Math.sin((i + 1323) / 20) * 0.3)
    const pcm = pcmFromSynthesizeCallbacks([
      espeakStereoBuffer(first),
      espeakStereoBuffer(rest),
      undefined,
    ])

    assert.equal(pcm.length, first.length + rest.length)
    const durationMs = (pcm.length / ESPEAK_SAMPLE_RATE) * 1000
    assert.ok(durationMs > 700, `utterance should last hundreds of ms, got ${durationMs.toFixed(0)}ms`)
  })
})

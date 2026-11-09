// The pitch drill's singing voice: each vowel at its exact pitch, made by a Klatt formant synthesizer.
// The sound is steady and plain on purpose, so the learner hears the vowel and its pitch and nothing else.
// Rendering is pure (testable in Node); `vowelVoice` plays a rendered vowel in the browser, like `pianoVoice`.

import { generateSound, type FrameParms, type GlottalSourceType, type MainParms } from 'klatt-syn'
import { midiFreq } from './piano-voice'

/**
 * Formant frequencies (Hz) for each vowel's IPA quality (phonology.md#vowels): F1 falls as the tongue rises,
 * F2 falls as it backs and the lips round. F4 to F6 are a neutral voice's and shared.
 */
const FORMANTS: Readonly<Record<string, readonly number[]>> = {
  a: [750, 1250, 2600], // /ä/ open central unrounded
  o: [480, 850, 2450], // /o̞/ mid back rounded
  e: [480, 1850, 2550], // /e̞/ mid front unrounded
  u: [320, 1450, 2250], // /ʉ/ close central rounded
}
const UPPER_FORMANTS = [3300, 3750, 4900]
const BANDWIDTHS = [70, 90, 110, 150, 500, 600]

/** Klatt's natural glottal source; the enum is `const`, so it cannot be imported as a value. */
const NATURAL = 1 as GlottalSourceType

/** One steady frame of a vowel at `freq` Hz: no flutter, so the pitch holds exactly. */
export function vowelFrame(vowel: string, freq: number, duration: number): FrameParms {
  const formants = FORMANTS[vowel]
  if (!formants) throw new Error(`no voice for vowel ${vowel}`)
  return {
    duration,
    f0: freq,
    flutterLevel: 0,
    openPhaseRatio: 0.7,
    breathinessDb: -30,
    tiltDb: 0,
    gainDb: NaN,
    agcRmsLevel: 0.18,
    nasalFormantFreq: NaN,
    nasalFormantBw: NaN,
    oralFormantFreq: [...formants, ...UPPER_FORMANTS],
    oralFormantBw: BANDWIDTHS,
    cascadeEnabled: true,
    cascadeVoicingDb: 0,
    cascadeAspirationDb: -30,
    cascadeAspirationMod: 0.5,
    nasalAntiformantFreq: NaN,
    nasalAntiformantBw: NaN,
    parallelEnabled: false,
    parallelVoicingDb: 0,
    parallelAspirationDb: -30,
    parallelAspirationMod: 0.5,
    fricationDb: -99,
    fricationMod: 0.5,
    parallelBypassDb: -99,
    nasalFormantDb: NaN,
    oralFormantDb: [0, -8, -15, -19, -30, -35],
  }
}

/** A vowel sung on `midi` (may be fractional) for `seconds`, as samples at `sampleRate`. */
export function renderVowel(vowel: string, midi: number, sampleRate: number, seconds: number): Float32Array<ArrayBuffer> {
  const main: MainParms = { sampleRate, glottalSourceType: NATURAL }
  return Float32Array.from(generateSound(main, [vowelFrame(vowel, midiFreq(midi), seconds)]))
}

/** Rendered length: longer than any drill note (a slow beat), so one buffer serves every tempo. */
const RENDER_SECONDS = 1.2
const buffers = new WeakMap<BaseAudioContext, Map<string, AudioBuffer>>()

function vowelBuffer(a: BaseAudioContext, vowel: string, midi: number): AudioBuffer {
  let byNote = buffers.get(a)
  if (!byNote) buffers.set(a, (byNote = new Map()))
  const key = `${vowel}:${midi}`
  let buf = byNote.get(key)
  if (!buf) {
    const samples = renderVowel(vowel, midi, a.sampleRate, RENDER_SECONDS)
    buf = a.createBuffer(1, samples.length, a.sampleRate)
    buf.copyToChannel(samples, 0)
    byNote.set(key, buf)
  }
  return buf
}

/** Renders a vowel ahead of time, so a run's first notes do not wait on it. */
export function warmVowel(a: BaseAudioContext, vowel: string, midi: number): void {
  vowelBuffer(a, vowel, midi)
}

/** One sung vowel from `when` for `dur` seconds, with a soft start and end so it never clicks. */
export function vowelVoice(a: AudioContext, out: AudioNode, vowel: string, midi: number, when: number, dur: number, vel: number): void {
  const src = a.createBufferSource()
  src.buffer = vowelBuffer(a, vowel, midi)
  const len = Math.min(dur, RENDER_SECONDS - 0.05)
  const g = a.createGain()
  g.gain.setValueAtTime(0.0001, when)
  g.gain.exponentialRampToValueAtTime(vel, when + 0.03)
  g.gain.setValueAtTime(vel, when + len)
  g.gain.exponentialRampToValueAtTime(0.0001, when + len + 0.04)
  src.connect(g)
  g.connect(out)
  src.start(when)
  src.stop(when + len + 0.05)
}

// Sung-pitch maths for the pitch drill: find a frame's pitch (the McLeod pitch method), settle a held note,
// and judge a sung note against its target. No browser APIs, so the tests can run it.

export type Pitch = { freq: number; clarity: number }

/** Quieter frames than this (RMS) count as silence. */
const MIN_RMS = 0.01
/** A frame counts only when its best period is at least this clear (0–1). */
const MIN_CLARITY = 0.85
/** The first period peak this close to the clearest one wins, which keeps the detector off the octave below. */
const PEAK_RATIO = 0.9

export const freqMidi = (freq: number) => 69 + 12 * Math.log2(freq / 440)

/** The pitch of one frame of samples, or null for silence, noise, or a pitch outside `minFreq..maxFreq`. */
export function detectPitch(buf: Float32Array, sampleRate: number, minFreq = 50, maxFreq = 1100): Pitch | null {
  const n = buf.length
  let sq = 0
  for (let i = 0; i < n; i++) sq += buf[i]! * buf[i]!
  if (Math.sqrt(sq / n) < MIN_RMS) return null

  // Normalized square difference: 1 where the wave repeats exactly after `lag` samples.
  const maxLag = Math.min(n - 1, Math.ceil(sampleRate / minFreq))
  const nsdf = new Float32Array(maxLag + 1)
  for (let lag = 0; lag <= maxLag; lag++) {
    let acf = 0
    let m = 0
    for (let i = 0; i < n - lag; i++) {
      acf += buf[i]! * buf[i + lag]!
      m += buf[i]! * buf[i]! + buf[i + lag]! * buf[i + lag]!
    }
    nsdf[lag] = m > 0 ? (2 * acf) / m : 0
  }

  // One peak per positive stretch after the first dip below zero.
  const peaks: number[] = []
  let lag = 1
  while (lag < maxLag && nsdf[lag]! > 0) lag++
  while (lag < maxLag) {
    while (lag < maxLag && nsdf[lag]! <= 0) lag++
    let best = lag
    while (lag < maxLag && nsdf[lag]! > 0) {
      if (nsdf[lag]! > nsdf[best]!) best = lag
      lag++
    }
    // A stretch cut off at the longest lag still counts once it has turned down.
    if (best > 0 && best < lag - 1) peaks.push(best)
  }
  if (!peaks.length) return null

  const top = Math.max(...peaks.map((p) => nsdf[p]!))
  const pick = peaks.find((p) => nsdf[p]! >= PEAK_RATIO * top)!
  // Parabola through the peak and its neighbours, for a period between samples.
  const [l, c, r] = [nsdf[pick - 1]!, nsdf[pick]!, nsdf[pick + 1]!]
  const bend = l - 2 * c + r
  const shift = bend ? (l - r) / (2 * bend) : 0
  const clarity = c - ((l - r) * shift) / 4
  const freq = sampleRate / (pick + shift)
  if (clarity < MIN_CLARITY || freq < minFreq || freq > maxFreq) return null
  return { freq, clarity }
}

export const median = (xs: readonly number[]): number => {
  const s = [...xs].sort((a, b) => a - b)
  const mid = s.length >> 1
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2
}

/** One heard frame: its time in seconds and its pitch as a MIDI note (null when no pitch was found). */
export type Heard = { t: number; midi: number | null }

/**
 * The note a singer is holding: the median of the last `hold` seconds, once nearly all of those frames
 * found a pitch within half a semitone of it; null until then.
 */
export function heldNote(heard: readonly Heard[], now: number, hold = 0.8): number | null {
  if (!heard.length || now - heard[0]!.t < hold) return null
  const recent = heard.filter((h) => h.t > now - hold)
  const pitched = recent.flatMap((h) => (h.midi === null ? [] : [h.midi]))
  if (pitched.length < 8 || pitched.length < 0.8 * recent.length) return null
  const mid = median(pitched)
  return pitched.every((m) => Math.abs(m - mid) <= 0.5) ? mid : null
}

/**
 * A judged note. `off` is in semitones from the target. A move judgment also keeps `aim`, the semitones the
 * note should move from the one before, and `moved`, how far it did; `heard` marks a note with none before it.
 */
export type Verdict = {
  verdict: 'ok' | 'close' | 'sharp' | 'flat' | 'silent' | 'heard'
  off: number
  aim?: number
  moved?: number
}

/** The smallest move, in semitones, that counts as going up or down. */
export const MIN_MOVE = 1

/**
 * A voiced note judged only by its move from the note before (`from`, the median the learner said there),
 * so a learner off their home note still passes when the shape is right. Moving the way `aim` points by at least
 * `MIN_MOVE` is ok, any smaller move that way is close, and no move or the wrong way is flat (should rise) or
 * sharp (should fall). A level `aim` is ok within `MIN_MOVE`. Unlike `judgePitch`, octaves do not fold: going down
 * a fourth for an aimed fifth up lands an octave from the aim, and is still wrong. A tracker that hears one voice an
 * octave off tends to hear both notes so, and the move survives.
 */
export function judgeMove(heard: readonly number[], from: number | null, aim: number): Verdict {
  if (heard.length < 5) return { verdict: 'silent', off: 0 }
  if (from === null) return { verdict: 'heard', off: 0 }
  const moved = median(heard) - from
  const off = moved - aim
  const result = (verdict: Verdict['verdict']): Verdict => ({ verdict, off, aim, moved })
  if (aim === 0) {
    if (Math.abs(moved) <= MIN_MOVE) return result('ok')
    if (Math.abs(moved) <= 2 * MIN_MOVE) return result('close')
    return result(moved > 0 ? 'sharp' : 'flat')
  }
  const along = Math.sign(aim) * moved
  if (along >= MIN_MOVE) return result('ok')
  if (along > 0) return result('close')
  return result(aim > 0 ? 'flat' : 'sharp')
}

/**
 * A voiced note against its target, in any octave, since a voice may sit an octave from the piano: within
 * `tolerance` semitones is ok, within twice that is close. `off` is in semitones from the nearest octave of the target.
 */
export function judgePitch(heard: readonly number[], target: number, tolerance = 1): Verdict {
  if (heard.length < 5) return { verdict: 'silent', off: 0 }
  const raw = median(heard) - target
  const off = raw - 12 * Math.round(raw / 12)
  if (Math.abs(off) <= tolerance) return { verdict: 'ok', off }
  if (Math.abs(off) <= 2 * tolerance) return { verdict: 'close', off }
  return { verdict: off > 0 ? 'sharp' : 'flat', off }
}

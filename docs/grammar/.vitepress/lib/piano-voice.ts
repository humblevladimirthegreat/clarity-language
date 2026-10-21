// The finger code's piano voice, shared by the Finger Code page and the pitch drill so both use one sound.
// Browser only: create the context from a click.

let ctx: AudioContext | null = null
const waves = new WeakMap<BaseAudioContext, PeriodicWave>()

/** One audio context for every piano on the page. */
export function pianoContext(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** A fresh output: gain into a compressor into the speakers. Drop its gain to silence everything sent to it. */
export function pianoBus(a: AudioContext, gain = 0.3): GainNode {
  const bus = a.createGain()
  bus.gain.value = gain
  const comp = a.createDynamicsCompressor()
  bus.connect(comp)
  comp.connect(a.destination)
  return bus
}

export const midiFreq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12)

export const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
export const noteName = (midi: number) => NOTE_NAMES[midi % 12]! + (Math.floor(midi / 12) - 1)

function pianoWave(a: AudioContext): PeriodicWave {
  let wave = waves.get(a)
  if (!wave) {
    const n = 8
    const real = new Float32Array(n + 1)
    const imag = new Float32Array(n + 1)
    for (let h = 1; h <= n; h++) imag[h] = 1 / Math.pow(h, 2.2)
    wave = a.createPeriodicWave(real, imag)
    waves.set(a, wave)
  }
  return wave
}

/**
 * One piano note; `midi` may be fractional. The default decay is short, so no note rings into the next
 * syllable; the pitch drill lets it ring longer.
 */
export function pianoVoice(a: AudioContext, out: AudioNode, midi: number, when: number, dur: number, vel: number, decay = 0.06): void {
  const f = midiFreq(midi)
  const osc = a.createOscillator()
  osc.setPeriodicWave(pianoWave(a))
  osc.frequency.value = f
  const lp = a.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(Math.min(8000, f * 6), when)
  lp.frequency.exponentialRampToValueAtTime(Math.max(f * 1.2, 200), when + 0.9)
  const g = a.createGain()
  g.gain.setValueAtTime(0.0001, when)
  g.gain.exponentialRampToValueAtTime(vel, when + 0.004)
  g.gain.setTargetAtTime(0.0001, when + 0.004, decay)
  g.gain.setTargetAtTime(0.0001, when + dur, 0.015)
  osc.connect(lp)
  lp.connect(g)
  g.connect(out)
  osc.start(when)
  osc.stop(when + dur + 0.15)
}

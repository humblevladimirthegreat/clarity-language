// The microphone for the pitch drill: one pitch reading per call. Browser only: open it from a click.

import { detectPitch, freqMidi } from './pitch-detect'

export type Mic = {
  /** The pitch heard now as a MIDI note, or null. */
  read(): number | null
  close(): void
}

/** Asks for the microphone; rejects when there is none or the learner says no. */
export async function openMic(a: AudioContext): Promise<Mic> {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('no microphone')
  // Voice processing smooths away the steady tone of a held note, so turn it off.
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  })
  const source = a.createMediaStreamSource(stream)
  const analyser = a.createAnalyser()
  analyser.fftSize = 2048
  // A silent path to the speakers keeps the analyser running in every browser.
  const mute = a.createGain()
  mute.gain.value = 0
  source.connect(analyser)
  analyser.connect(mute)
  mute.connect(a.destination)
  const buf = new Float32Array(analyser.fftSize)
  return {
    read() {
      analyser.getFloatTimeDomainData(buf)
      const p = detectPitch(buf, a.sampleRate)
      return p ? freqMidi(p.freq) : null
    },
    close() {
      for (const track of stream.getTracks()) track.stop()
      source.disconnect()
      mute.disconnect()
    },
  }
}

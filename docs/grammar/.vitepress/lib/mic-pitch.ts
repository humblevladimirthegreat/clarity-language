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
  const stopTracks = () => {
    for (const track of stream.getTracks()) track.stop()
  }
  try {
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
    let closed = false
    return {
      read() {
        if (closed) return null
        analyser.getFloatTimeDomainData(buf)
        const p = detectPitch(buf, a.sampleRate)
        return p ? freqMidi(p.freq) : null
      },
      close() {
        if (closed) return
        closed = true
        // Stop the tracks first: that is what turns off the browser's recording light.
        stopTracks()
        source.disconnect()
        analyser.disconnect()
        mute.disconnect()
      },
    }
  } catch (e) {
    // Setup failed after the browser granted the stream: still release it.
    stopTracks()
    throw e
  }
}

/**
 * eSpeak-NG worker audio contract (espeakng.worker.js):
 * - each synth callback builds a stereo Float32Array (`length * 2`, duplicated channels)
 * - the worker posts `result: [samples.buffer, events]` (ArrayBuffer of those floats)
 * - after synth returns, a final message posts `result: [undefined]` with `done: true`
 */

export const ESPEAK_SAMPLE_RATE = 22050

export function isAudioPayload(value: unknown): value is ArrayBuffer | ArrayLike<number> {
  if (value instanceof ArrayBuffer) return value.byteLength > 0
  if (ArrayBuffer.isView(value)) return value.byteLength > 0
  return false
}

export function decodeSamples(samples: ArrayBuffer | ArrayLike<number>): Float32Array {
  if (samples instanceof ArrayBuffer) {
    const stereo = new Float32Array(samples)
    const mono = new Float32Array(Math.floor(stereo.length / 2))
    for (let i = 0; i < mono.length; i++) mono[i] = stereo[i * 2] ?? 0
    return mono
  }
  if (ArrayBuffer.isView(samples) && samples instanceof Float32Array) {
    return decodeSamples(samples.buffer.slice(samples.byteOffset, samples.byteOffset + samples.byteLength))
  }
  const out = new Float32Array(samples.length)
  let max = 0
  for (let i = 0; i < samples.length; i++) {
    const value = samples[i] ?? 0
    if (Math.abs(value) > max) max = Math.abs(value)
  }
  const scale = max > 1.5 ? 1 / 32768 : 1
  for (let i = 0; i < samples.length; i++) out[i] = (samples[i] ?? 0) * scale
  return out
}

export function concatMono(chunks: Float32Array[]): Float32Array {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const out = new Float32Array(length)
  let offset = 0
  for (const chunk of chunks) {
    out.set(chunk, offset)
    offset += chunk.length
  }
  return out
}

export function pcmFromSynthesizeCallbacks(payloads: unknown[]): Float32Array {
  const chunks: Float32Array[] = []
  for (const samples of payloads) {
    if (isAudioPayload(samples)) {
      chunks.push(decodeSamples(samples))
      continue
    }
    if (samples == null) break
  }
  return concatMono(chunks)
}

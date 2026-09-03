export const KITTEN_SAMPLE_RATE = 24000
export const KITTEN_AUDIO_TRIM = 5000

export function trimAudio(samples: Float32Array, trim = KITTEN_AUDIO_TRIM): Float32Array {
  const length = Math.max(0, samples.length - trim)
  return samples.slice(0, length)
}

export function flattenAudioTensor(data: Float32Array): Float32Array {
  return data
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

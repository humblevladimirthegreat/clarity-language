/**
 * Minimal NumPy .npz loader (ZIP of .npy files).
 * Adapted from kitten-tts-js (Apache-2.0).
 */

import { unzipSync } from 'fflate'

const MAGIC = '\x93NUMPY'

export interface NpyArray {
  data: Float32Array
  shape: number[]
  dtype: string
}

export type NpzResult = Record<string, NpyArray>

function parseNpy(buf: Uint8Array): NpyArray {
  const bytes = buf
  for (let i = 0; i < 6; i++) {
    if (bytes[i] !== MAGIC.charCodeAt(i)) {
      throw new Error('Not a valid .npy file (bad magic)')
    }
  }
  const majorVersion = bytes[6]!
  const headerLen =
    majorVersion >= 2
      ? new DataView(bytes.buffer, bytes.byteOffset + 8, 4).getUint32(0, true)
      : new DataView(bytes.buffer, bytes.byteOffset + 8, 2).getUint16(0, true)
  const headerOffset = majorVersion >= 2 ? 12 : 10
  const headerBytes = bytes.slice(headerOffset, headerOffset + headerLen)
  const header = new TextDecoder().decode(headerBytes).trim()

  const descrMatch = header.match(/'descr'\s*:\s*'([^']+)'/)
  const shapeMatch = header.match(/'shape'\s*:\s*\(([^)]*)\)/)
  const fortranMatch = header.match(/'fortran_order'\s*:\s*(True|False)/)

  if (!descrMatch || !shapeMatch) {
    throw new Error(`Cannot parse .npy header: ${header}`)
  }

  const descr = descrMatch[1]!
  const shapeStr = shapeMatch[1]!.trim()
  const shape =
    shapeStr === ''
      ? [1]
      : shapeStr
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .map(Number)
  const fortranOrder = fortranMatch ? fortranMatch[1] === 'True' : false

  const dataOffset = headerOffset + headerLen
  const dataBuffer = bytes.buffer.slice(bytes.byteOffset + dataOffset, bytes.byteOffset + bytes.byteLength)

  const dtype = descr.replace(/[<>|=]/, '')
  let data: Float32Array | Int32Array | Uint8Array
  switch (dtype) {
    case 'f4':
      data = new Float32Array(dataBuffer)
      break
    case 'f8': {
      const f64 = new Float64Array(dataBuffer)
      data = new Float32Array(f64.length)
      for (let i = 0; i < f64.length; i++) (data as Float32Array)[i] = f64[i]!
      break
    }
    case 'i4':
      data = new Int32Array(dataBuffer)
      break
    case 'i8': {
      const i64 = new BigInt64Array(dataBuffer)
      data = new Float32Array(i64.length)
      for (let i = 0; i < i64.length; i++) (data as Float32Array)[i] = Number(i64[i]!)
      break
    }
    case 'u1':
      data = new Uint8Array(dataBuffer)
      break
    default:
      throw new Error(`Unsupported .npy dtype: ${descr}`)
  }

  if (fortranOrder && shape.length === 2) {
    const [rows, cols] = shape as [number, number]
    const cOrder = new Float32Array(rows * cols)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cOrder[r * cols + c] = (data as Float32Array)[c * rows + r]!
      }
    }
    data = cOrder
  }

  const result = new Float32Array(data.buffer, data.byteOffset, data.length)
  return { data: result, shape, dtype }
}

export function loadNpz(npzBuffer: ArrayBuffer): NpzResult {
  const files = unzipSync(new Uint8Array(npzBuffer))
  const result: NpzResult = {}

  for (const [name, bytes] of Object.entries(files)) {
    if (!name.endsWith('.npy') || name.startsWith('__MACOSX')) continue
    const key = name.replace(/\.npy$/, '')
    result[key] = parseNpy(bytes)
  }

  return result
}

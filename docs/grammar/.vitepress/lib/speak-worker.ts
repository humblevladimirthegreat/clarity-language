/**
 * KittenTTS inference in a worker so the page stays interactive (spinner + Stop)
 * while WASM runs.
 */

import { loadNpz } from './npz-loader.js'
import { concatMono, KITTEN_AUDIO_TRIM, trimAudio } from './speak-audio.js'
import type { SpeakWorkerRequest, SpeakWorkerResponse } from './speak-worker-protocol.js'

type OrtTensor = {
  data: Float32Array | BigInt64Array
}

type OrtSession = {
  run(feeds: Record<string, OrtTensor>): Promise<Record<string, OrtTensor>>
}

type OrtModule = {
  InferenceSession: {
    create(model: ArrayBuffer, options?: Record<string, unknown>): Promise<OrtSession>
  }
  Tensor: new (
    type: string,
    data: BigInt64Array | Float32Array,
    dims: readonly number[],
  ) => OrtTensor
  env: {
    wasm: {
      wasmPaths?: string
      numThreads: number
      simd: boolean
    }
  }
}

type KittenEngine = {
  session: OrtSession
  ort: OrtModule
  style: Float32Array
  styleDim: number
}

const VOICE_KEY = 'expr-voice-2-f'
const STYLE_ROW = 0
const SPEED = 1

type WorkerScope = {
  postMessage(message: SpeakWorkerResponse, transfer?: Transferable[]): void
}

const scope = self as unknown as WorkerScope

let engine: KittenEngine | null = null
let latestId = 0
let runChain = Promise.resolve()

function post(message: SpeakWorkerResponse, transfer?: Transferable[]): void {
  if (transfer) scope.postMessage(message, transfer)
  else scope.postMessage(message)
}

async function loadOrt(wasmPaths: string): Promise<OrtModule> {
  const ort = (await import('onnxruntime-web/wasm')) as unknown as OrtModule
  ort.env.wasm.wasmPaths = wasmPaths
  ort.env.wasm.numThreads = 1
  ort.env.wasm.simd = true
  return ort
}

async function createEngine(
  wasmPaths: string,
  onnxUrl: string,
  voicesUrl: string,
): Promise<KittenEngine> {
  const ort = await loadOrt(wasmPaths)
  const [onnxBuf, npzBuf] = await Promise.all([
    fetch(onnxUrl).then((r) => {
      if (!r.ok) throw new Error('Could not load KittenTTS model')
      return r.arrayBuffer()
    }),
    fetch(voicesUrl).then((r) => {
      if (!r.ok) throw new Error('Could not load KittenTTS voices')
      return r.arrayBuffer()
    }),
  ])

  const session = await ort.InferenceSession.create(onnxBuf, {
    executionProviders: ['wasm'],
  })

  const voices = loadNpz(npzBuf)
  const voice = voices[VOICE_KEY]
  if (!voice) {
    throw new Error(`Voice ${VOICE_KEY} missing from voices.npz`)
  }

  const styleDim = voice.shape.at(-1) ?? voice.shape[0] ?? 256
  const numStyles = voice.shape.length >= 2 ? voice.shape[0]! : 1
  const row = Math.min(STYLE_ROW, numStyles - 1)
  const style = voice.data.slice(row * styleDim, (row + 1) * styleDim)

  return { session, ort, style, styleDim }
}

async function synthesizeChunk(engine: KittenEngine, inputIds: number[]): Promise<Float32Array> {
  const { session, ort, style, styleDim } = engine
  const results = await session.run({
    input_ids: new ort.Tensor(
      'int64',
      BigInt64Array.from(inputIds.map(BigInt)),
      [1, inputIds.length],
    ),
    style: new ort.Tensor('float32', style, [1, styleDim]),
    speed: new ort.Tensor('float32', new Float32Array([SPEED]), [1]),
  })
  const key = Object.keys(results)[0]!
  const audioData = results[key]!.data as Float32Array
  return trimAudio(audioData, KITTEN_AUDIO_TRIM)
}

async function synthesizePlan(
  engine: KittenEngine,
  chunks: number[][],
  id: number,
): Promise<Float32Array> {
  const parts: Float32Array[] = []
  for (const ids of chunks) {
    if (latestId !== id) throw new Error('cancelled')
    parts.push(await synthesizeChunk(engine, ids))
  }
  return concatMono(parts)
}

function enqueueRun(id: number, chunks: number[][]): void {
  latestId = id
  runChain = runChain.then(async () => {
    if (latestId !== id || !engine) return
    try {
      const samples = await synthesizePlan(engine, chunks, id)
      if (latestId !== id) return
      post({ type: 'audio', id, samples }, [samples.buffer])
    } catch (err) {
      if (latestId !== id) return
      const message = err instanceof Error ? err.message : String(err)
      if (message === 'cancelled') return
      post({ type: 'error', id, message })
    }
  })
}

self.addEventListener('message', (event: MessageEvent<SpeakWorkerRequest>) => {
  const msg = event.data
  if (msg.type === 'init') {
    void (async () => {
      try {
        engine = await createEngine(msg.wasmPaths, msg.onnxUrl, msg.voicesUrl)
        post({ type: 'ready' })
      } catch (err) {
        engine = null
        post({
          type: 'error',
          message: err instanceof Error ? err.message : String(err),
        })
      }
    })()
    return
  }
  if (msg.type === 'cancel') {
    latestId = 0
    return
  }
  if (msg.type === 'run') {
    enqueueRun(msg.id, msg.chunks)
  }
})

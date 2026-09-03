import { previewPhonemes, skipLabel, type PhonemePlan } from '@tts-browser'
import {
  concatMono,
  KITTEN_AUDIO_TRIM,
  KITTEN_SAMPLE_RATE,
  trimAudio,
} from './speak-audio.js'
import { loadNpz } from './npz-loader.js'

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

const SAMPLE_RATE = KITTEN_SAMPLE_RATE
const VOICE_KEY = 'expr-voice-2-f'
const STYLE_ROW = 0
const SPEED = 1

let enginePromise: Promise<KittenEngine> | null = null
let audioCtx: AudioContext | null = null
let currentSource: AudioBufferSourceNode | null = null
let playToken = 0

type KittenEngine = {
  session: OrtSession
  ort: OrtModule
  style: Float32Array
  styleDim: number
}

function assetUrl(name: string): string {
  const base = import.meta.env.BASE_URL
  return `${base}tts/${name}`
}

function ortWasmBase(): string {
  return `${import.meta.env.BASE_URL}tts/ort/`
}

async function loadOrt(): Promise<OrtModule> {
  const ort = (await import('onnxruntime-web/wasm')) as unknown as OrtModule
  ort.env.wasm.wasmPaths = ortWasmBase()
  ort.env.wasm.numThreads = 1
  ort.env.wasm.simd = true
  return ort
}

async function getEngine(): Promise<KittenEngine> {
  if (!enginePromise) {
    enginePromise = (async () => {
      const ort = await loadOrt()
      const [onnxBuf, npzBuf] = await Promise.all([
        fetch(assetUrl('kitten_tts_nano_v0_8.onnx')).then((r) => {
          if (!r.ok) throw new Error('Could not load KittenTTS model')
          return r.arrayBuffer()
        }),
        fetch(assetUrl('voices.npz')).then((r) => {
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
    })().catch((error) => {
      enginePromise = null
      throw error
    })
  }
  return enginePromise
}

/** Prefetch ONNX Runtime and the nano model (Inspect page mount). */
export function warmupSpeak(): Promise<KittenEngine> {
  return getEngine()
}

function unlockAudio(): AudioContext {
  const ctx = audioCtx ?? new AudioContext({ sampleRate: SAMPLE_RATE })
  audioCtx = ctx
  void ctx.resume()
  return ctx
}

function stopCurrentSource(): void {
  try {
    currentSource?.stop()
  } catch {
    /* already stopped */
  }
  currentSource = null
}

function playSamples(data: Float32Array): Promise<void> {
  stopCurrentSource()
  const ctx = unlockAudio()
  if (data.length === 0) throw new Error('KittenTTS returned empty audio')
  const buffer = ctx.createBuffer(1, data.length, SAMPLE_RATE)
  buffer.copyToChannel(data, 0)
  const source = ctx.createBufferSource()
  currentSource = source
  source.buffer = buffer
  source.connect(ctx.destination)
  return new Promise((resolve, reject) => {
    source.onended = () => {
      if (currentSource === source) currentSource = null
      resolve()
    }
    void ctx.resume().then(() => {
      source.start()
    }, reject)
  })
}

async function synthesizeChunk(
  engine: KittenEngine,
  inputIds: number[],
): Promise<Float32Array> {
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

async function synthesizePlan(engine: KittenEngine, plan: PhonemePlan): Promise<Float32Array> {
  const chunks = plan.inputIdChunks.length > 0 ? plan.inputIdChunks : [plan.inputIds]
  const parts: Float32Array[] = []
  for (const ids of chunks) {
    parts.push(await synthesizeChunk(engine, ids))
  }
  return concatMono(parts)
}

export function stopSpeaking(): void {
  playToken += 1
  stopCurrentSource()
}

export async function speakPlan(plan: PhonemePlan): Promise<void> {
  if (plan.words.length === 0) {
    const skip = plan.skipped[0]
    const extra = skip ? skipLabel(skip.reason) : 'no native words'
    throw new Error(`Nothing to speak — ${extra}`)
  }
  unlockAudio()
  const mine = ++playToken
  const engine = await getEngine()
  if (mine !== playToken) return
  const samples = await synthesizePlan(engine, plan)
  if (mine !== playToken) return
  await playSamples(samples)
}

export async function speak(text: string): Promise<void> {
  await speakPlan(previewPhonemes(text))
}

export function previewLine(plan: PhonemePlan): string {
  const spoken = plan.words.map((w) => w.raw).join(' ')
  const skipped = plan.skipped
  if (!spoken && skipped.length) {
    return `Skipped: ${skipped.map((s) => `${s.raw} (${skipLabel(s.reason)})`).join('; ')}`
  }
  if (skipped.length) {
    return `Will speak: ${spoken}. Skipped: ${skipped.map((s) => s.raw).join(', ')}`
  }
  return spoken ? `Will speak: ${spoken}` : ''
}

/** Phonology IPA for spoken words (same join as the CLI). */
export function ipaLine(plan: PhonemePlan): string {
  return plan.words.map((w) => w.ipa).join('  ')
}

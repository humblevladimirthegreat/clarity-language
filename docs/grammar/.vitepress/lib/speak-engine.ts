import { previewPhonemes, skipLabel, type PhonemePlan } from '@tts-browser'
import { KITTEN_SAMPLE_RATE } from './speak-audio.js'
import type {
  SpeakWorkerRequest,
  SpeakWorkerResponse,
} from './speak-worker-protocol.js'

const SAMPLE_RATE = KITTEN_SAMPLE_RATE

let worker: Worker | null = null
let workerReady: Promise<void> | null = null
let audioCtx: AudioContext | null = null
let currentSource: AudioBufferSourceNode | null = null
let playToken = 0

type Waiter = {
  resolve: () => void
  reject: (err: Error) => void
  onBeforePlay?: () => void
}

const waiters = new Map<number, Waiter>()

function assetUrl(name: string): string {
  const base = import.meta.env.BASE_URL
  return `${base}tts/${name}`
}

function ortWasmBase(): string {
  return `${import.meta.env.BASE_URL}tts/ort/`
}

function postToWorker(message: SpeakWorkerRequest): void {
  worker?.postMessage(message)
}

function settleWaiter(id: number | undefined, err?: Error): void {
  if (id === undefined) {
    for (const waiter of waiters.values()) {
      if (err) waiter.reject(err)
      else waiter.resolve()
    }
    waiters.clear()
    return
  }
  const waiter = waiters.get(id)
  if (!waiter) return
  waiters.delete(id)
  if (err) waiter.reject(err)
  else waiter.resolve()
}

function handleWorkerMessage(event: MessageEvent<SpeakWorkerResponse>): void {
  const msg = event.data
  if (msg.type === 'ready') return
  if (msg.type === 'error') {
    settleWaiter(msg.id, new Error(msg.message))
    return
  }
  if (msg.type !== 'audio') return
  const waiter = waiters.get(msg.id)
  if (!waiter) return
  if (msg.id !== playToken) {
    waiters.delete(msg.id)
    waiter.resolve()
    return
  }
  waiter.onBeforePlay?.()
  void playSamples(msg.samples, msg.id).then(
    () => {
      if (waiters.get(msg.id) !== waiter) return
      waiters.delete(msg.id)
      waiter.resolve()
    },
    (err: Error) => {
      if (waiters.get(msg.id) !== waiter) return
      waiters.delete(msg.id)
      waiter.reject(err)
    },
  )
}

function getWorker(): Promise<void> {
  if (!workerReady) {
    workerReady = new Promise<void>((resolve, reject) => {
      const next = new Worker(new URL('./speak-worker.ts', import.meta.url), {
        type: 'module',
      })
      worker = next
      next.onmessage = (event: MessageEvent<SpeakWorkerResponse>) => {
        if (event.data.type === 'ready') {
          next.onmessage = handleWorkerMessage
          next.onerror = () => {
            worker = null
            workerReady = null
            settleWaiter(undefined, new Error('KittenTTS worker failed'))
            next.terminate()
          }
          resolve()
          return
        }
        if (event.data.type === 'error') {
          worker = null
          workerReady = null
          next.terminate()
          reject(new Error(event.data.message))
          return
        }
        handleWorkerMessage(event)
      }
      next.onerror = () => {
        worker = null
        workerReady = null
        next.terminate()
        reject(new Error('KittenTTS worker failed'))
      }
      postToWorker({
        type: 'init',
        wasmPaths: ortWasmBase(),
        onnxUrl: assetUrl('kitten_tts_nano_v0_8.onnx'),
        voicesUrl: assetUrl('voices.npz'),
      })
    }).catch((error) => {
      workerReady = null
      throw error
    })
  }
  return workerReady
}

/** Prefetch ONNX Runtime and the nano model (Inspect page mount). */
export function warmupSpeak(): Promise<void> {
  return getWorker()
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

function playSamples(data: Float32Array, token: number): Promise<void> {
  stopCurrentSource()
  if (token !== playToken) return Promise.resolve()
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
      if (token !== playToken) {
        try {
          source.disconnect()
        } catch {
          /* already stopped */
        }
        if (currentSource === source) currentSource = null
        resolve()
        return
      }
      source.start()
    }, reject)
  })
}

export function stopSpeaking(): void {
  playToken += 1
  stopCurrentSource()
  postToWorker({ type: 'cancel' })
  settleWaiter(undefined)
}

export type SpeakPlanOptions = {
  /** Called after synthesis finishes and before playback starts. */
  onBeforePlay?: () => void
}

export async function speakPlan(
  plan: PhonemePlan,
  options?: SpeakPlanOptions,
): Promise<void> {
  if (plan.words.length === 0) {
    const skip = plan.skipped[0]
    const extra = skip ? skipLabel(skip.reason) : 'no native words'
    throw new Error(`Nothing to speak — ${extra}`)
  }
  unlockAudio()
  const mine = ++playToken
  await getWorker()
  if (mine !== playToken) return
  const chunks = plan.inputIdChunks.length > 0 ? plan.inputIdChunks : [plan.inputIds]
  await new Promise<void>((resolve, reject) => {
    if (mine !== playToken) {
      resolve()
      return
    }
    waiters.set(mine, {
      resolve,
      reject,
      onBeforePlay: options?.onBeforePlay,
    })
    postToWorker({ type: 'run', id: mine, chunks })
  })
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

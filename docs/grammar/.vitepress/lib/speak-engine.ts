import { previewPhonemes, skipLabel, type EngineUtterance, type PhonemePlan } from '@tts-browser'
import {
  ESPEAK_SAMPLE_RATE,
  concatMono,
  decodeSamples,
  isAudioPayload,
} from './speak-audio.js'

type ESpeakNGHandle = {
  worker?: Worker
  set_rate: (value: number) => void
  set_pitch: (value: number) => void
  set_voice: (voice: string) => void
  synthesize: (
    text: string,
    cb: (samples: unknown, events: unknown) => void,
  ) => void
}

type ESpeakNGCtor = new (workerPath: string, ready: () => void) => ESpeakNGHandle

const SAMPLE_RATE = ESPEAK_SAMPLE_RATE

let enginePromise: Promise<ESpeakNGHandle> | null = null
let audioCtx: AudioContext | null = null
let currentSource: AudioBufferSourceNode | null = null
let playToken = 0

function assetUrl(name: string): string {
  const base = import.meta.env.BASE_URL
  return `${base}tts/${name}`
}

function loadScript(src: string): Promise<void> {
  const existing = document.querySelector(`script[src="${src}"]`)
  if (existing) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load eSpeak-NG'))
    document.head.appendChild(script)
  })
}

async function getEngine(): Promise<ESpeakNGHandle> {
  if (!enginePromise) {
    enginePromise = (async () => {
      await loadScript(assetUrl('espeakng.min.js'))
      const Ctor = (window as unknown as { eSpeakNG?: ESpeakNGCtor }).eSpeakNG
      if (!Ctor) throw new Error('eSpeak-NG constructor missing')
      return await new Promise<ESpeakNGHandle>((resolve, reject) => {
        let settled = false
        const tts = new Ctor(assetUrl('espeakng.worker.js'), () => {
          if (settled) return
          settled = true
          resolve(tts)
        })
        tts.worker?.addEventListener('error', () => {
          if (settled) return
          settled = true
          reject(new Error('eSpeak-NG worker failed to load'))
        })
        window.setTimeout(() => {
          if (settled) return
          settled = true
          reject(new Error('eSpeak-NG worker timed out'))
        }, 20000)
      })
    })().catch((error) => {
      enginePromise = null
      throw error
    })
  }
  return enginePromise
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
  if (data.length === 0) throw new Error('eSpeak-NG returned empty audio')
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

function synthesize(engine: ESpeakNGHandle, phonemeText: string, rate: number): Promise<Float32Array> {
  return new Promise((resolve, reject) => {
    const chunks: Float32Array[] = []
    let settled = false
    engine.set_voice('en')
    engine.set_rate(rate)
    engine.synthesize(phonemeText, (samples) => {
      if (settled) return
      if (isAudioPayload(samples)) {
        chunks.push(decodeSamples(samples))
        return
      }
      if (samples != null) return
      settled = true
      if (chunks.length === 0) {
        reject(new Error('eSpeak-NG returned empty audio'))
        return
      }
      resolve(concatMono(chunks))
    })
    window.setTimeout(() => {
      if (settled) return
      settled = true
      reject(new Error('eSpeak-NG synthesize timed out'))
    }, 20000)
  })
}

/** Map 0.5–2.0 playback rate to eSpeak 80–450 (default 1 → 160). */
function espeakRate(rate: number | undefined): number {
  const n = rate ?? 1
  return Math.round(Math.min(450, Math.max(80, 160 * n)))
}

export function stopSpeaking(): void {
  playToken += 1
  stopCurrentSource()
}

export async function speakPlan(plan: PhonemePlan, opts?: { rate?: number }): Promise<void> {
  if (plan.words.length === 0) {
    const skip = plan.skipped[0]
    const extra = skip ? skipLabel(skip.reason) : 'no native words'
    throw new Error(`Nothing to speak — ${extra}`)
  }
  await speakEngineText(plan.engineText, opts)
}

export async function speakUtterance(utterance: EngineUtterance, opts?: { rate?: number }): Promise<void> {
  if (utterance.words.length === 0 || !utterance.text.trim()) {
    throw new Error('Nothing to speak — no native words')
  }
  await speakEngineText(utterance.text, opts)
}

async function speakEngineText(text: string, opts?: { rate?: number }): Promise<void> {
  unlockAudio()
  const mine = ++playToken
  const engine = await getEngine()
  if (mine !== playToken) return
  const samples = await synthesize(engine, text, espeakRate(opts?.rate))
  if (mine !== playToken) return
  await playSamples(samples)
}

export async function speak(text: string, opts?: { rate?: number }): Promise<void> {
  await speakPlan(previewPhonemes(text), opts)
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

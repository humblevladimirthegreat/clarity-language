import { previewPhonemes, skipLabel, type PhonemePlan } from '@tts-browser'

type ESpeakNGHandle = {
  set_rate: (value: number) => void
  set_pitch: (value: number) => void
  set_voice: (voice: string) => void
  synthesize: (
    text: string,
    cb: (samples: unknown, events: unknown) => void,
  ) => void
}

type ESpeakNGCtor = new (workerPath: string, ready: () => void) => ESpeakNGHandle

const SAMPLE_RATE = 22050

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

function decodeSamples(samples: ArrayBuffer | ArrayLike<number>): Float32Array {
  if (samples instanceof ArrayBuffer) {
    const stereo = new Float32Array(samples)
    const mono = new Float32Array(Math.floor(stereo.length / 2))
    for (let i = 0; i < mono.length; i++) mono[i] = stereo[i * 2] ?? 0
    return mono
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

function playSamples(samples: ArrayBuffer | ArrayLike<number>): Promise<void> {
  stopSpeaking()
  const ctx = audioCtx ?? new AudioContext()
  audioCtx = ctx
  const data = decodeSamples(samples)
  if (data.length === 0) return Promise.resolve()
  const buffer = ctx.createBuffer(1, data.length, SAMPLE_RATE)
  buffer.copyToChannel(data, 0)
  const source = ctx.createBufferSource()
  currentSource = source
  source.buffer = buffer
  source.connect(ctx.destination)
  return new Promise((resolve) => {
    source.onended = () => {
      if (currentSource === source) currentSource = null
      resolve()
    }
    void ctx.resume()
    source.start()
  })
}

function isAudioPayload(value: unknown): value is ArrayBuffer | ArrayLike<number> {
  if (value instanceof ArrayBuffer) return value.byteLength > 0
  if (ArrayBuffer.isView(value)) return value.byteLength > 0
  return Boolean(value && typeof value === 'object' && 'length' in value && (value as ArrayLike<number>).length > 16)
}

function synthesize(engine: ESpeakNGHandle, phonemeText: string, rate: number): Promise<ArrayBuffer | ArrayLike<number>> {
  return new Promise((resolve, reject) => {
    let settled = false
    engine.set_voice('en')
    engine.set_rate(rate)
    engine.synthesize(phonemeText, (samples) => {
      if (settled || !isAudioPayload(samples)) return
      settled = true
      resolve(samples)
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
  try {
    currentSource?.stop()
  } catch {
    /* already stopped */
  }
  currentSource = null
}

export async function speakPlan(plan: PhonemePlan, opts?: { rate?: number }): Promise<void> {
  if (plan.words.length === 0) {
    const skip = plan.skipped.find((s) => s.reason !== 'punct')
    const extra = skip ? skipLabel(skip.reason) : 'no native words'
    throw new Error(`Nothing to speak — ${extra}`)
  }
  const mine = ++playToken
  const engine = await getEngine()
  if (mine !== playToken) return
  const samples = await synthesize(engine, `[[${plan.espeak}]]`, espeakRate(opts?.rate))
  if (mine !== playToken) return
  await playSamples(samples)
}

export async function speak(text: string, opts?: { rate?: number }): Promise<void> {
  await speakPlan(previewPhonemes(text), opts)
}

export function previewLine(plan: PhonemePlan): string {
  const spoken = plan.words.map((w) => w.raw).join(' ')
  const skipped = plan.skipped.filter((s) => s.reason !== 'punct' && s.reason !== 'island')
  if (!spoken && skipped.length) {
    return `Skipped: ${skipped.map((s) => `${s.raw} (${skipLabel(s.reason)})`).join('; ')}`
  }
  if (skipped.length) {
    return `Will speak: ${spoken}. Skipped: ${skipped.map((s) => s.raw).join(', ')}`
  }
  return spoken ? `Will speak: ${spoken}` : ''
}

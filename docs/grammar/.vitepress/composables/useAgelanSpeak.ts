import { nextTick, ref } from 'vue'
import { previewPhonemes } from '@tts-browser'
import { ipaLine, previewLine, speakPlan, stopSpeaking } from '../lib/speak-engine'

const busy = ref(false)
const loading = ref(false)
const error = ref('')
let generation = 0

async function waitForPaint(): Promise<void> {
  await nextTick()
  if (typeof requestAnimationFrame !== 'function') return
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

export function useAgelanSpeak() {
  function lineFor(text: string): string {
    if (!text.trim()) return ''
    return previewLine(previewPhonemes(text))
  }

  function ipaFor(text: string): string {
    if (!text.trim()) return ''
    return ipaLine(previewPhonemes(text))
  }

  async function speakText(text: string): Promise<void> {
    if (busy.value) {
      stop()
      return
    }
    const mine = ++generation
    busy.value = true
    loading.value = true
    error.value = ''
    await waitForPaint()
    if (mine !== generation) return
    try {
      await speakPlan(previewPhonemes(text), {
        onBeforePlay: () => {
          if (mine === generation) loading.value = false
        },
      })
    } catch (err) {
      if (mine !== generation) return
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      if (mine === generation) {
        busy.value = false
        loading.value = false
      }
    }
  }

  function stop(): void {
    generation += 1
    stopSpeaking()
    busy.value = false
    loading.value = false
  }

  return { busy, loading, error, lineFor, ipaFor, speakText, stop }
}

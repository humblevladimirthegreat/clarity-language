import { ref } from 'vue'
import { previewPhonemes } from '@tts-browser'
import { ipaLine, previewLine, speak, stopSpeaking } from '../lib/speak-engine'

const busy = ref(false)
const error = ref('')
let generation = 0

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
    error.value = ''
    try {
      await speak(text)
    } catch (err) {
      if (mine !== generation) return
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      if (mine === generation) busy.value = false
    }
  }

  function stop(): void {
    generation += 1
    stopSpeaking()
    busy.value = false
  }

  return { busy, error, lineFor, ipaFor, speakText, stop }
}

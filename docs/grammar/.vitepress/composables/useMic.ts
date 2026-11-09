// The microphone for one component: opened on request, closed when no longer used, and always
// closed when the component's scope ends, so the browser's recording light never outlives the page.

import { getCurrentScope, onScopeDispose } from 'vue'
import { openMic, type Mic } from '../lib/mic-pitch'

export type MicHandle = {
  /** True while the microphone is open and readable. */
  readonly ready: boolean
  /**
   * Opens the microphone once; a second call while the browser asks shares the same request.
   * Resolves false when there is no microphone, the learner says no, or the scope has ended.
   */
  open(): Promise<boolean>
  /** The pitch heard now as a MIDI note, or null (also while closed). */
  read(): number | null
  /** Closes the microphone unless `inUse()` still says it is needed. */
  release(): void
}

/**
 * Call during a component's setup. `inUse` says whether something still listens,
 * so `release()` keeps the microphone open for it.
 */
export function useMic(context: () => AudioContext, inUse: () => boolean): MicHandle {
  if (!getCurrentScope()) throw new Error('useMic must be called inside a component setup or effect scope')
  let mic: Mic | null = null
  let opening: Promise<boolean> | null = null
  let disposed = false

  function close(): void {
    mic?.close()
    mic = null
  }

  onScopeDispose(() => {
    disposed = true
    close()
  })

  return {
    get ready() {
      return mic !== null
    },
    open() {
      if (mic) return Promise.resolve(true)
      if (disposed) return Promise.resolve(false)
      opening ??= openMic(context()).then(
        (m) => {
          opening = null
          // The scope ended while the browser asked for permission: close at once.
          if (disposed) {
            m.close()
            return false
          }
          mic = m
          return true
        },
        () => {
          opening = null
          return false
        },
      )
      return opening
    },
    read() {
      return mic?.read() ?? null
    },
    release() {
      if (!inUse()) close()
    },
  }
}

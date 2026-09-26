import { computed, onMounted, ref, shallowRef, type ShallowRef } from 'vue'
import { DEFAULT_SELF_ROOT, eligibleNames, suggestedNames, type LearnerNameOption } from '@learner-name'

/**
 * The learner's own Agalan name (a published root + -n), kept in this browser. Unset or no longer valid → the speaker special `ugobon` fills `SELF` slots.
 */

const STORAGE_KEY = 'agalan.learnerName'
/** Ask a nav chip (or anything else) to open the name helper. */
export const OPEN_NAME_HELPER_EVENT = 'agalan:open-name-helper'

const chosen = ref<string | null>(null)
const eligible: ShallowRef<LearnerNameOption[]> = shallowRef([])
/** Hand-picked names the helper draws from. */
const suggested: ShallowRef<LearnerNameOption[]> = shallowRef([])
const ready = ref(false)
let started = false
let loading: Promise<LearnerNameOption[]> | null = null

function readStored(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStored(root: string | null): void {
  try {
    if (root) window.localStorage.setItem(STORAGE_KEY, root)
    else window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage blocked (private window, previews): the name lasts for this page view only.
  }
}

/** Eligible names, from the lexicon CSVs in their own chunk (only loaded when a page needs them). */
export function loadEligibleNames(): Promise<LearnerNameOption[]> {
  loading ??= Promise.all([
    import('@data/lexicon-published.csv?raw'),
    import('@data/lexicon-overlays.csv?raw'),
    import('@lexicon-search'),
  ]).then(([published, overlays, lexicon]) => {
    const rows = lexicon.parsePublishedCsv(published.default)
    const list = eligibleNames(rows, lexicon.parseOverlayCsv(overlays.default))
    eligible.value = list
    suggested.value = suggestedNames(rows)
    return list
  })
  return loading
}

async function adopt(stored: string | null): Promise<void> {
  if (!stored) {
    chosen.value = null
    return
  }
  const list = await loadEligibleNames()
  chosen.value = list.some((option) => option.root === stored) ? stored : null
}

function start(): void {
  if (started) return
  started = true
  void adopt(readStored()).finally(() => {
    ready.value = true
  })
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) void adopt(event.newValue)
  })
}

export function useLearnerName() {
  onMounted(start)

  /** Root shown in `SELF` slots: the chosen name, else the speaker special. */
  const root = computed(() => chosen.value ?? DEFAULT_SELF_ROOT)

  async function set(next: string): Promise<boolean> {
    const list = await loadEligibleNames()
    if (!list.some((option) => option.root === next)) return false
    chosen.value = next
    writeStored(next)
    return true
  }

  function clear(): void {
    chosen.value = null
    writeStored(null)
  }

  function openHelper(): void {
    window.dispatchEvent(new CustomEvent(OPEN_NAME_HELPER_EVENT))
  }

  return { root, chosen, ready, eligible, suggested, set, clear, openHelper, loadEligibleNames }
}

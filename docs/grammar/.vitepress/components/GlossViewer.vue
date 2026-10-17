<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import {
  inspectText,
  morphGlossLine,
  promptForPassage,
  type InspectResult,
  type PromptContext,
} from '@parse-browser'
import { useClassifyTables } from '../composables/useClassifyTables'
import { previewPhonemes } from '@tts-browser'
import GlossOverlay from './GlossOverlay.vue'

const SAMPLE = 'zazawan vowogal.'
const ERROR_IDLE_MS = 1000
const COPIED_MS = 1200

const text = ref(SAMPLE)

const { tables, status, errorMessage } = useClassifyTables()

const deferredParseError = ref('')
let parseErrorTimer = 0

function emptyResult(): InspectResult {
  return { tokens: [], constructions: [] }
}

const result = computed<InspectResult>(() => {
  if (!tables.value) return emptyResult()
  try {
    return inspectText(text.value, tables.value)
  } catch (err) {
    return {
      ...emptyResult(),
      sentenceWarning: err instanceof Error ? err.message : String(err),
    }
  }
})

/** Phonology IPA for the spoken forms (writing shorthand and spans expanded). */
const ipaPreview = computed(() => {
  if (!text.value.trim()) return ''
  try {
    return previewPhonemes(text.value).words.map((w) => w.ipa).join('  ')
  } catch {
    return ''
  }
})

/** Bracketed morph gloss for the whole input (docs/meta/glosses.md § Phrase brackets). */
const morphLine = computed(() => {
  if (!tables.value || !text.value.trim()) return ''
  try {
    return morphGlossLine(text.value, tables.value)
  } catch {
    return ''
  }
})

function currentParseError(): string {
  const warning = result.value.sentenceWarning
  if (warning) return `Sentence parse: ${warning}`
  const failed = result.value.tokens.find((token) => token.kind === 'error')
  if (failed && failed.kind === 'error') return failed.error.message
  return ''
}

function scheduleParseError() {
  window.clearTimeout(parseErrorTimer)
  deferredParseError.value = ''
  parseErrorTimer = window.setTimeout(() => {
    deferredParseError.value = currentParseError()
  }, ERROR_IDLE_MS)
}

watch([text, result], scheduleParseError)

/** The prompt's doc examples load as their own chunk, started on mount so a click rarely waits. */
const promptContext = shallowRef<PromptContext | null>(null)
const promptCopied = ref(false)
const promptError = ref('')
let promptCopiedTimer = 0

const canCopyPrompt = computed(
  () => Boolean(tables.value && promptContext.value && text.value.trim() && !currentParseError()),
)

async function loadPromptContext() {
  const { data } = await import('../lib/llm-context.data')
  promptContext.value = {
    index: data.index.map((pair) => ({ ...pair, source: '' })),
    labelGlosses: new Map(data.labelGlosses),
    readers: new Map(data.readers),
  }
}

/** Same prompt as `parse.mjs --llm-prompt`: each non-empty line is one input. */
async function copyPrompt() {
  if (!tables.value || !promptContext.value) return
  promptError.value = ''
  const inputs = text.value.split('\n').map((line) => line.trim()).filter(Boolean)
  try {
    await navigator.clipboard.writeText(promptForPassage(inputs, tables.value, promptContext.value))
    promptCopied.value = true
    window.clearTimeout(promptCopiedTimer)
    promptCopiedTimer = window.setTimeout(() => {
      promptCopied.value = false
    }, COPIED_MS)
  } catch (err) {
    promptError.value = err instanceof Error ? err.message : String(err)
  }
}

watch(text, () => {
  promptError.value = ''
})

onMounted(() => {
  scheduleParseError()
  loadPromptContext().catch((err) => {
    promptError.value = `Could not load the prompt examples. ${err instanceof Error ? err.message : String(err)}`
  })
})

onBeforeUnmount(() => {
  window.clearTimeout(parseErrorTimer)
  window.clearTimeout(promptCopiedTimer)
})
</script>

<template>
  <div class="viewer">
    <textarea
      id="gloss-input"
      v-model="text"
      rows="4"
      spellcheck="false"
      placeholder="Paste Agazan…"
      aria-label="Agazan text"
      :disabled="status !== 'ready'"
    />
    <p v-if="ipaPreview" class="ipa" lang="und-Latn-fonipa">IPA: {{ ipaPreview }}</p>
    <div class="prompt-row">
      <button type="button" class="prompt-button" :disabled="!canCopyPrompt" @click="copyPrompt">
        {{ promptCopied ? 'Copied' : 'Copy Translation Prompt' }}
      </button>
      <span class="prompt-note">
        An English-translation prompt for an LLM, one numbered line per input line. Use a model at
        least as capable as Claude Opus 5.5; smaller models misread the gloss.
      </span>
    </div>
    <p v-if="promptError" class="warn" role="status">{{ promptError }}</p>
    <p class="hint">
      Hover for a short gloss. The morph gloss below shows phrase structure: <code>[ … ]</code> groups a unit, and labels such as <code>NAME[…]</code> or <code>CITE[…]</code> mark packages. Click or highlight a word for a floating inspect card. Highlight a
      join or span fence, or click a <code>SCOPE</code> label, to inspect the construction. Pin or press Enter for the
      full breakdown beside the stream. Copy uses the romanized surface form (not English). Arrow
      keys walk words; <kbd>g</kbd> opens Why; <kbd>Esc</kbd>
      closes the card. IPA expands number shorthand and span brackets. Foreign
      <code>&lt;&gt;</code> interiors and compact loans are skipped.
    </p>
    <p v-if="status === 'error'" class="warn">Could not load lexicon. {{ errorMessage }}</p>
    <p v-else-if="deferredParseError" class="warn" role="status">{{ deferredParseError }}</p>
    <GlossOverlay v-if="status === 'ready'" :result="result" />
    <p v-if="status === 'ready' && morphLine" class="morph">
      <span class="morph-label">Morph gloss</span>
      <code>{{ morphLine }}</code>
    </p>
  </div>
</template>

<style scoped>
.viewer {
  margin-top: 1rem;
}

textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
}

textarea:focus {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 1px;
}

.ipa {
  margin: 0.65rem 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  font-family: var(--vp-font-family-mono);
}

.prompt-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.85rem;
  margin: 0.65rem 0 0;
}

.prompt-button {
  padding: 0.35rem 0.85rem;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
}

.prompt-button:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}

.prompt-button:disabled {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
  cursor: not-allowed;
}

.prompt-note {
  flex: 1 1 16rem;
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
}

.hint {
  margin: 0.65rem 0 1rem;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.morph {
  margin: 0.85rem 0 0;
  font-size: 0.9rem;
  overflow-wrap: anywhere;
}

.morph-label {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.warn {
  color: var(--vp-c-danger-1);
  font-size: 0.9rem;
}
</style>

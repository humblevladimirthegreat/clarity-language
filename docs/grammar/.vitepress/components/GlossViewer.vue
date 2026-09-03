<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { inspectText, type InspectResult } from '@parse-browser'
import { useClassifyTables } from '../composables/useClassifyTables'
import { useAgelanSpeak } from '../composables/useAgelanSpeak'
import { warmupSpeak } from '../lib/speak-engine'
import GlossOverlay from './GlossOverlay.vue'
import SpeakButton from './SpeakButton.vue'

const SAMPLE = 'zazawan vawalal.'
const ERROR_IDLE_MS = 1000

const text = ref(SAMPLE)

const { tables, status, errorMessage } = useClassifyTables()
const { error: speakError, lineFor, ipaFor } = useAgelanSpeak()

const showIpa = ref(false)
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

const spokenPreview = computed(() => lineFor(text.value))
const ipaPreview = computed(() => ipaFor(text.value))

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

onMounted(() => {
  scheduleParseError()
  void warmupSpeak().catch(() => {
    /* prefetch failure surfaces on Speak click */
  })
})

onBeforeUnmount(() => {
  window.clearTimeout(parseErrorTimer)
})
</script>

<template>
  <div class="viewer">
    <textarea
      id="gloss-input"
      v-model="text"
      rows="4"
      spellcheck="false"
      placeholder="Paste Agalan…"
      aria-label="Agalan text"
      :disabled="status !== 'ready'"
    />
    <div class="speak-bar">
      <SpeakButton
        :text="text"
        label="Speak Agalan"
        :disabled="status !== 'ready'"
      />
      <div v-if="spokenPreview" class="spoken">
        <p class="preview">{{ spokenPreview }}</p>
        <button
          type="button"
          class="btn"
          :disabled="!ipaPreview"
          :aria-pressed="showIpa"
          :aria-label="showIpa ? 'Hide IPA' : 'Show IPA'"
          @click="showIpa = !showIpa"
        >
          {{ showIpa ? 'Hide IPA' : 'Show IPA' }}
        </button>
        <p v-if="showIpa && ipaPreview" class="ipa" lang="und-Latn-fonipa">
          <span class="ipa-label">IPA</span>
          {{ ipaPreview }}
        </p>
      </div>
    </div>
    <p v-if="speakError" class="warn">{{ speakError }}</p>
    <p class="hint">
      Hover for a short gloss. Click or highlight a word for a floating inspect card. Highlight a
      join, span fence, or <code>^</code> to inspect the construction. Pin or press Enter for the
      full breakdown beside the stream. Copy uses the romanized surface form (not English). Arrow
      keys walk words; <kbd>g</kbd> opens Why; <kbd>s</kbd> speaks the selection; <kbd>Esc</kbd>
      closes the card. Speak Agalan expands number shorthand and span brackets. Foreign
      <code>&lt;&gt;</code> interiors and compact loans are skipped.
    </p>
    <p v-if="status === 'error'" class="warn">Could not load lexicon. {{ errorMessage }}</p>
    <p v-else-if="deferredParseError" class="warn" role="status">{{ deferredParseError }}</p>
    <GlossOverlay v-if="status === 'ready'" :result="result" />
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

.speak-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.65rem 1rem;
  margin: 0.65rem 0 0;
}

.spoken {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem 0.85rem;
  min-width: 0;
  flex: 1 1 12rem;
}

.btn {
  font: inherit;
  font-size: 0.85rem;
  padding: 0.35rem 0.7rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.preview,
.ipa {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.ipa {
  font-family: var(--vp-font-family-mono);
}

.ipa-label {
  font-family: var(--vp-font-family-base);
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  margin-right: 0.35rem;
}

.hint {
  margin: 0.65rem 0 1rem;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.warn {
  color: var(--vp-c-danger-1);
  font-size: 0.9rem;
}
</style>

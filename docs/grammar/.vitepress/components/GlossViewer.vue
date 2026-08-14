<script setup lang="ts">
import { computed, ref } from 'vue'
import { inspectText, type InspectResult } from '@parse-browser'
import { useClassifyTables } from '../composables/useClassifyTables'
import { useAgelanSpeak } from '../composables/useAgelanSpeak'
import GlossOverlay from './GlossOverlay.vue'

const SAMPLE = 'zazawan vawul.'

const text = ref(SAMPLE)

const { tables, status, errorMessage } = useClassifyTables()
const { busy, error: speakError, lineFor, speakText } = useAgelanSpeak()

const result = computed<InspectResult>(() => {
  if (!tables.value) return { tokens: [], constructions: [] }
  return inspectText(text.value, tables.value)
})

const spokenPreview = computed(() => lineFor(text.value))
</script>

<template>
  <div class="viewer">
    <label class="sr-only" for="gloss-input">Agelan text</label>
    <textarea
      id="gloss-input"
      v-model="text"
      rows="4"
      spellcheck="false"
      placeholder="Paste Agelan…"
      :disabled="status !== 'ready'"
    />
    <div class="speak-bar">
      <button
        type="button"
        class="btn"
        :disabled="status !== 'ready'"
        aria-label="Speak Agelan"
        @click="speakText(text)"
      >
        {{ busy ? 'Stop' : 'Speak Agelan' }}
      </button>
      <p v-if="spokenPreview" class="preview">{{ spokenPreview }}</p>
    </div>
    <p v-if="speakError" class="warn">{{ speakError }}</p>
    <p class="hint">
      Hover for a short gloss. Click or highlight a word for a floating inspect card. Highlight a
      join, span fence, or <code>^</code> to inspect the construction. Pin or press Enter for the
      full breakdown beside the stream. Copy uses the romanized surface form (not English). Arrow
      keys walk words; <kbd>g</kbd> opens Why; <kbd>s</kbd> speaks the selection; <kbd>Esc</kbd>
      closes the card. Speak Agelan plays native words only (Phase 1 skips writing shorthand and
      <code>&lt;&gt;</code> payloads).
    </p>
    <p v-if="status === 'error'" class="warn">Could not load lexicon. {{ errorMessage }}</p>
    <p v-else-if="result.sentenceWarning" class="warn">
      Sentence parse: {{ result.sentenceWarning }}
    </p>
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

.preview {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
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

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>

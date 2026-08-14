<script setup lang="ts">
import { computed, ref } from 'vue'
import { inspectText, type InspectResult } from '@parse-browser'
import { useClassifyTables } from '../composables/useClassifyTables'
import GlossOverlay from './GlossOverlay.vue'

const SAMPLE = 'zazawan vawul.'

const text = ref(SAMPLE)

const { tables, status, errorMessage } = useClassifyTables()

const result = computed<InspectResult>(() => {
  if (!tables.value) return { tokens: [], constructions: [] }
  return inspectText(text.value, tables.value)
})
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
    <p class="hint">
      Hover for a short gloss. Click a word to inspect morphology. Click a join, span fence, or
      <code>^</code> to inspect the construction. Pin or press Enter for the full breakdown. Copy
      uses the romanized surface form (not English). Arrow keys walk words; <kbd>g</kbd> opens Why.
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

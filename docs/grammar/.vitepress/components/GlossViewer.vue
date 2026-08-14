<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import publishedCsv from '@data/lexicon-published.csv?raw'
import overlayCsv from '@data/lexicon-overlays.csv?raw'
import {
  createClassifyTables,
  inspectText,
  type ClassifyTables,
  type InspectResult,
} from '@parse-browser'
import GlossOverlay from './GlossOverlay.vue'

const SAMPLE = 'zazawan vawul.'

const text = ref(SAMPLE)
const status = ref<'loading' | 'ready' | 'error'>('loading')
const errorMessage = ref('')
const tables = shallowRef<ClassifyTables | null>(null)

onMounted(() => {
  try {
    tables.value = createClassifyTables(publishedCsv, overlayCsv)
    status.value = 'ready'
  } catch (err) {
    status.value = 'error'
    errorMessage.value = err instanceof Error ? err.message : String(err)
  }
})

const result = computed<InspectResult>(() => {
  if (!tables.value) return { tokens: [] }
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
      Hover for a short gloss. Click a word to inspect morphology. Pin or press Enter for the full
      breakdown. Copy uses the romanized surface form (not English). Arrow keys walk words.
    </p>
    <p v-if="status === 'error'" class="warn">Could not load lexicon. {{ errorMessage }}</p>
    <p v-else-if="result.sentenceWarning" class="warn">
      Sentence parse: {{ result.sentenceWarning }}
    </p>
    <GlossOverlay v-if="status === 'ready'" :tokens="result.tokens" />
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

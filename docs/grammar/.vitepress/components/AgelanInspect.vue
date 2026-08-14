<script setup lang="ts">
import { computed } from 'vue'
import { inspectText, type InspectResult } from '@parse-browser'
import { useClassifyTables } from '../composables/useClassifyTables'
import GlossOverlay from './GlossOverlay.vue'

const props = defineProps<{
  text: string
  pin?: boolean
}>()

const { tables, status, errorMessage } = useClassifyTables()

const result = computed<InspectResult>(() => {
  if (!tables.value) return { tokens: [], constructions: [] }
  return inspectText(props.text, tables.value)
})
</script>

<template>
  <div class="embed">
    <p v-if="status === 'error'" class="warn">Could not load lexicon. {{ errorMessage }}</p>
    <p v-else-if="result.sentenceWarning" class="warn">
      Sentence parse: {{ result.sentenceWarning }}
    </p>
    <GlossOverlay v-if="status === 'ready'" :result="result" :initial-pinned="pin" />
  </div>
</template>

<style scoped>
.embed {
  margin: 1rem 0 1.5rem;
}

.warn {
  color: var(--vp-c-danger-1);
  font-size: 0.9rem;
}
</style>

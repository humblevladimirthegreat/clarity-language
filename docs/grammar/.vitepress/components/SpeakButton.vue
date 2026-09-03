<script setup lang="ts">
import { computed } from 'vue'
import { useAgelanSpeak } from '../composables/useAgelanSpeak'

const props = withDefaults(
  defineProps<{
    text: string
    label: string
    disabled?: boolean
  }>(),
  { disabled: false },
)

const { busy, loading, speakText } = useAgelanSpeak()

const caption = computed(() => {
  if (busy.value) return 'Stop'
  return props.label
})

function onClick(): void {
  void speakText(props.text)
}
</script>

<template>
  <button
    type="button"
    class="btn speak-btn"
    :disabled="disabled"
    :aria-busy="loading"
    :aria-label="busy ? 'Stop' : label"
    @click="onClick"
  >
    <span v-if="loading" class="speak-spinner" aria-hidden="true" />
    <span class="speak-label">{{ caption }}</span>
  </button>
</template>

<style scoped>
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

.speak-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.speak-spinner {
  flex: 0 0 auto;
  width: 0.85em;
  height: 0.85em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: speak-spin 0.65s linear infinite;
}

@keyframes speak-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

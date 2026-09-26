<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { OPEN_NAME_HELPER_EVENT, useLearnerName } from '../composables/useLearnerName'
import NameHelper from './NameHelper.vue'

/** Nav-bar chip: the learner's Agalan name (or a prompt), opening the name helper. */
const { chosen } = useLearnerName()
const open = ref(false)
const root = ref<HTMLElement | null>(null)

const label = computed(() => (chosen.value ? `${chosen.value}n` : 'Choose a name'))

function onOpen(): void {
  open.value = true
}

function onKey(event: KeyboardEvent): void {
  if (event.key === 'Escape') open.value = false
}

function onPointer(event: PointerEvent): void {
  if (open.value && root.value && !root.value.contains(event.target as Node)) open.value = false
}

onMounted(() => {
  window.addEventListener(OPEN_NAME_HELPER_EVENT, onOpen)
  window.addEventListener('keydown', onKey)
  window.addEventListener('pointerdown', onPointer)
})

onBeforeUnmount(() => {
  window.removeEventListener(OPEN_NAME_HELPER_EVENT, onOpen)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('pointerdown', onPointer)
})
</script>

<template>
  <div ref="root" class="name-chip">
    <button
      type="button"
      class="chip"
      :aria-expanded="open"
      aria-controls="name-chip-panel"
      :title="chosen ? 'Your Agalan name' : 'Choose your Agalan name'"
      @click="open = !open"
    >
      <span v-if="chosen" class="agalan">{{ label }}</span>
      <span v-else>{{ label }}</span>
    </button>
    <div v-if="open" id="name-chip-panel" class="panel" role="dialog" aria-label="Your Agalan name">
      <NameHelper />
    </div>
  </div>
</template>

<style scoped>
.name-chip {
  position: relative;
  display: flex;
  align-items: center;
  margin-left: 0.75rem;
}

.chip {
  font: inherit;
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  cursor: pointer;
  white-space: nowrap;
}

.agalan {
  font-family: var(--vp-font-family-mono);
}

.panel {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: min(26rem, calc(100vw - 2rem));
  z-index: 50;
  background: var(--vp-c-bg);
  border-radius: 8px;
  box-shadow: var(--vp-shadow-3);
}

.panel :deep(.name-helper) {
  margin: 0;
}
</style>

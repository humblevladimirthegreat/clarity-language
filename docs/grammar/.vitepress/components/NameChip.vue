<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { OPEN_NAME_HELPER_EVENT, useLearnerName } from '../composables/useLearnerName'
import NameHelper from './NameHelper.vue'

const props = withDefaults(
  defineProps<{
    /** Bar chip stays in the header; screen chip is inside the phone hamburger sheet. */
    placement?: 'bar' | 'screen'
  }>(),
  { placement: 'bar' },
)

/** Nav-bar chip: the learner's Agebon name (or a prompt), opening the name helper. */
const { chosen } = useLearnerName()
const open = ref(false)
const root = ref<HTMLElement | null>(null)

const panelId = computed(() => `name-chip-panel-${props.placement}`)
const label = computed(() => (chosen.value ? `${chosen.value}n` : 'Choose a name'))

function onOpen(): void {
  // The screen copy is only mounted while the hamburger sheet is open.
  // Lexicon "Use as my name" always targets the bar chip.
  if (props.placement === 'screen') return
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
  <div ref="root" class="name-chip" :class="`name-chip--${placement}`">
    <button
      type="button"
      class="chip"
      :aria-expanded="open"
      :aria-controls="panelId"
      :title="chosen ? 'Your Agebon name' : 'Choose your Agebon name'"
      @click="open = !open"
    >
      <span v-if="chosen" class="agebon">{{ label }}</span>
      <span v-else>{{ label }}</span>
    </button>
    <div
      v-if="open"
      :id="panelId"
      class="panel"
      role="dialog"
      aria-label="Your Agebon name"
    >
      <NameHelper />
    </div>
  </div>
</template>

<style scoped>
.name-chip {
  position: relative;
  display: flex;
  align-items: center;
}

.name-chip--bar {
  margin-left: 0.5rem;
}

.name-chip--screen {
  display: block;
  margin: 1rem 0 0;
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

.name-chip--screen .chip {
  width: 100%;
}

.agebon {
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

.name-chip--screen .panel {
  position: static;
  width: auto;
  margin-top: 0.75rem;
  box-shadow: none;
}

.panel :deep(.name-helper) {
  margin: 0;
}

@media (max-width: 767px) {
  .name-chip--bar {
    margin: 0;
    width: 0;
  }

  .name-chip--bar > .chip {
    display: none;
  }

  .name-chip--bar .panel {
    position: fixed;
    top: calc(var(--vp-nav-height) + 0.5rem);
    right: 1rem;
    left: 1rem;
    width: auto;
  }
}
</style>

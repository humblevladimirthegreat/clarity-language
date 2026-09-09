<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{
  file: string
  label: string
}>()

const playing = ref(false)
const audio = ref<HTMLAudioElement | null>(null)

const src = computed(
  () =>
    `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(props.file)}`,
)

function stop(): void {
  const el = audio.value
  if (!el) return
  el.pause()
  el.currentTime = 0
  playing.value = false
}

function onEnded(): void {
  playing.value = false
}

function onClick(): void {
  let el = audio.value
  if (!el) {
    el = new Audio(src.value)
    el.preload = 'none'
    el.addEventListener('ended', onEnded)
    audio.value = el
  }
  if (playing.value) {
    stop()
    return
  }
  playing.value = true
  void el.play().catch(() => {
    playing.value = false
  })
}

onBeforeUnmount(() => {
  const el = audio.value
  if (!el) return
  el.removeEventListener('ended', onEnded)
  stop()
  audio.value = null
})
</script>

<template>
  <button
    type="button"
    class="btn ipa-play"
    :aria-label="playing ? `Stop ${label}` : `Play ${label}`"
    :aria-pressed="playing"
    @click="onClick"
  >
    <span class="ipa-play-icon" aria-hidden="true">{{ playing ? '■' : '▶' }}</span>
  </button>
</template>

<style scoped>
.btn {
  font: inherit;
  font-size: 0.85rem;
  line-height: 1;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  white-space: nowrap;
  margin-inline-start: 0.35rem;
  vertical-align: middle;
}

.ipa-play-icon {
  display: inline-block;
  min-width: 0.85em;
  text-align: center;
}

.btn:hover {
  border-color: var(--vp-c-brand-1);
}
</style>

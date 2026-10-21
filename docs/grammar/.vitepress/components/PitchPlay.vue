<script setup lang="ts">
import { pitchOf } from '@vowel-pitch'
import { noteName, pianoBus, pianoContext, pianoVoice } from '../lib/piano-voice'

// Plays a vowel's pitch on its finger-code piano key, the reference for that pitch.

const props = defineProps<{
  vowel: string
}>()

let bus: GainNode | null = null

function onClick(): void {
  const a = pianoContext()
  bus?.gain.setTargetAtTime(0, a.currentTime, 0.02)
  bus = pianoBus(a)
  pianoVoice(a, bus, pitchOf(props.vowel), a.currentTime + 0.02, 1.2, 0.9, 0.5)
}
</script>

<template>
  <button
    type="button"
    class="btn pitch-play"
    :aria-label="`Play the pitch of ${vowel} (${noteName(pitchOf(vowel))})`"
    :title="noteName(pitchOf(vowel))"
    @click="onClick"
  >
    <span class="pitch-play-icon" aria-hidden="true">♪</span>
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

.pitch-play-icon {
  display: inline-block;
  min-width: 0.85em;
  text-align: center;
}

.btn:hover {
  border-color: var(--vp-c-brand-1);
}
</style>

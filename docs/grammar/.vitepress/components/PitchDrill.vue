<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  DRILL_MODES,
  PITCH_BASE,
  PITCH_ORDER,
  RANGE_LABELS,
  drillPhrases,
  pitchOf,
  type DrillMode,
  type DrillPhrase,
  type DrillStep,
  type PitchRange,
} from '@vowel-pitch'
import { noteName, pianoBus, pianoContext, pianoVoice } from '../lib/piano-voice'

// Plays vowel-pitch patterns on the finger code's piano voice and lights each vowel as its note sounds;
// the learner sings the vowels back. `advanced` adds the contour mode and the speech ranges.

const props = defineProps<{ advanced?: boolean }>()

const modes = computed(() => DRILL_MODES.filter((m) => props.advanced || !m.advanced))
const RANGES = Object.keys(RANGE_LABELS) as PitchRange[]

const mode = ref<DrillMode>('up')
const range = ref<PitchRange>('full')
const base = ref(PITCH_BASE)
const phrases = ref<DrillPhrase[]>(drillPhrases('up'))
const playing = ref(false)
const now = ref(-1)

const BASE_MIN = 36
const BASE_MAX = 72
const BEAT = 0.7

type Timed = { phrase: number; step: number; at: number; dur: number }

const timeline = computed<Timed[]>(() => {
  const out: Timed[] = []
  let t = 0
  phrases.value.forEach((p, pi) => {
    p.steps.forEach((s, si) => {
      out.push({ phrase: pi, step: si, at: t, dur: s.beats * BEAT })
      t += s.beats * BEAT
    })
    t += BEAT
  })
  return out
})

const active = computed(() => timeline.value.find((e) => now.value >= e.at && now.value < e.at + e.dur) ?? null)
const isOn = (pi: number, si: number) => active.value?.phrase === pi && active.value.step === si

/** Which letter of a phrase's word sounds now: its vowels in order, after the opening `a`. */
function wordLetterOn(p: DrillPhrase, pi: number, li: number): boolean {
  if (!p.word || active.value?.phrase !== pi) return false
  const step = p.steps[active.value.step]!
  if (step.kind === 'ref') return false
  const notes = p.steps.slice(0, active.value.step + 1).filter((s) => s.kind !== 'ref').length
  const vowelAt = [...p.word].map((c, i) => ({ c, i })).filter(({ c }) => PITCH_ORDER.includes(c))
  return vowelAt[notes - 1]?.i === li
}

const stepLabel = (s: DrillStep) => (s.kind === 'ref' ? 'your a' : s.kind === 'sing' ? 'you sing' : '')

let bus: GainNode | null = null
let t0 = 0
let raf = 0

function frame(): void {
  raf = 0
  if (!playing.value) return
  now.value = pianoContext().currentTime - t0
  const end = timeline.value.at(-1)
  if (end && now.value < end.at + end.dur + 0.2) raf = requestAnimationFrame(frame)
  else stop()
}

function stop(): void {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  playing.value = false
  now.value = -1
  if (bus) bus.gain.setTargetAtTime(0, pianoContext().currentTime, 0.02)
  bus = null
}

function play(): void {
  stop()
  if (mode.value === 'random') phrases.value = drillPhrases('random')
  const a = pianoContext()
  bus = pianoBus(a)
  t0 = a.currentTime + 0.1
  for (const e of timeline.value) {
    const s = phrases.value[e.phrase]!.steps[e.step]!
    if (s.kind === 'sing') continue
    pianoVoice(a, bus, pitchOf(s.vowel, base.value, range.value), t0 + e.at, e.dur * 0.9, s.kind === 'ref' ? 0.6 : 0.9, 0.4)
  }
  playing.value = true
  raf = requestAnimationFrame(frame)
}

function step(by: number): void {
  base.value = Math.min(BASE_MAX, Math.max(BASE_MIN, base.value + by))
}

watch(mode, (m) => {
  stop()
  phrases.value = drillPhrases(m)
})
watch([base, range], stop)

onBeforeUnmount(stop)
</script>

<template>
  <div class="pitch-drill">
    <div class="pd-controls">
      <div class="pd-modes" role="group" aria-label="Pattern">
        <button
          v-for="m in modes"
          :key="m.id"
          type="button"
          class="btn"
          :class="{ on: mode === m.id }"
          :aria-pressed="mode === m.id"
          @click="mode = m.id"
        >
          {{ m.label }}
        </button>
      </div>
      <div class="pd-base" role="group" aria-label="Note for a">
        <button type="button" class="btn" aria-label="Lower a by a semitone" :disabled="base <= BASE_MIN" @click="step(-1)">−</button>
        <span class="pd-base-note"><code>a</code> = {{ noteName(base) }}</span>
        <button type="button" class="btn" aria-label="Raise a by a semitone" :disabled="base >= BASE_MAX" @click="step(1)">+</button>
      </div>
      <div v-if="advanced" class="pd-modes" role="group" aria-label="Range">
        <button
          v-for="r in RANGES"
          :key="r"
          type="button"
          class="btn"
          :class="{ on: range === r }"
          :aria-pressed="range === r"
          @click="range = r"
        >
          {{ RANGE_LABELS[r] }}
        </button>
      </div>
      <button type="button" class="btn play" @click="playing ? stop() : play()">{{ playing ? '■ Stop' : '▶ Play' }}</button>
    </div>
    <ol class="pd-phrases">
      <li v-for="(p, pi) in phrases" :key="pi" class="pd-phrase">
        <span v-if="p.word" class="pd-word"
          ><code><span v-for="(c, li) in p.word" :key="li" :class="{ lit: wordLetterOn(p, pi, li) }">{{ c }}</span></code></span
        >
        <span class="pd-steps">
          <span v-for="(s, si) in p.steps" :key="si" class="pd-step" :class="[s.kind, { on: isOn(pi, si) }]">
            <span class="pd-letter">{{ s.vowel }}</span>
            <span v-if="stepLabel(s)" class="pd-sub">{{ stepLabel(s) }}</span>
          </span>
        </span>
        <span class="pd-caption">{{ p.caption }}</span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.pitch-drill {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.75rem;
  margin: 1rem 0;
}

.pd-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  align-items: center;
}

.pd-modes,
.pd-base {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
}

.pd-base-note {
  min-width: 5.5rem;
  text-align: center;
  font-size: 0.9rem;
}

.btn {
  font: inherit;
  font-size: 0.85rem;
  line-height: 1;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  white-space: nowrap;
}

.btn:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
}

.btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.btn.on {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.btn.play {
  margin-inline-start: auto;
}

.pd-phrases {
  list-style: none;
  padding: 0;
  margin: 0.75rem 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
}

.pd-phrase {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.pd-word .lit {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.pd-steps {
  display: flex;
  gap: 0.25rem;
}

.pd-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 2.2rem;
  padding: 0.2rem 0.35rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  transition: background 0.08s;
}

.pd-step.ref {
  border-style: dashed;
}

.pd-step.on {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
}

.pd-letter {
  font-family: var(--vp-font-family-mono);
  font-size: 1.1rem;
  font-weight: 600;
}

.pd-sub,
.pd-caption {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
</style>

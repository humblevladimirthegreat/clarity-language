<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  DRILL_MODES,
  PITCH_BASE,
  PITCH_ORDER,
  RANGE_LABELS,
  drillPhrases,
  pitchOf,
  withSingTurns,
  type DrillMode,
  type DrillPhrase,
  type DrillStep,
  type PitchRange,
} from '@vowel-pitch'
import { openMic, type Mic } from '../lib/mic-pitch'
import { heldNote, judgePitch, type Heard, type Verdict } from '../lib/pitch-detect'
import { noteName, pianoBus, pianoContext, pianoVoice } from '../lib/piano-voice'

// Plays vowel-pitch patterns on the finger code's piano voice and lights each vowel as its note sounds;
// the learner sings the vowels back. `advanced` adds the contour mode and the speech ranges.
// The microphone is optional: *Find my a* sets the note for `a` from a held note, and *Check me* adds a
// silent turn after each note (Random keeps its turn before) and judges what the learner sang in it. Without it, − and + set `a`.

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
/** Seconds at the start of a sing turn not judged: the singer's reaction time and the last note's tail. */
const GRACE = 0.3
/** How long *Find my a* listens before giving up. */
const FIND_LIMIT = 8

const check = ref(false)
const finding = ref(false)
const hearing = ref<number | null>(null)
const micNote = ref('')
const results = ref<Record<string, Verdict>>({})

/** The phrases as played: with a sing turn before each note while the microphone checks. */
const shown = computed(() => (check.value ? withSingTurns(phrases.value) : phrases.value))

type Timed = { phrase: number; step: number; at: number; dur: number }

const timeline = computed<Timed[]>(() => {
  const out: Timed[] = []
  let t = 0
  shown.value.forEach((p, pi) => {
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
  // A turn to sing a note back lights what the note lit.
  let at = active.value.step
  const prev = p.steps[at - 1]
  if (p.steps[at]!.kind === 'sing' && prev && prev.kind !== 'sing' && prev.vowel === p.steps[at]!.vowel) at--
  const step = p.steps[at]!
  if (step.kind === 'ref') return false
  const notes = p.steps.slice(0, at + 1).filter((s) => s.kind === 'note').length + (step.kind === 'sing' ? 1 : 0)
  const vowelAt = [...p.word].map((c, i) => ({ c, i })).filter(({ c }) => PITCH_ORDER.includes(c))
  return vowelAt[notes - 1]?.i === li
}

const VERDICT_LABELS: Record<Verdict['verdict'], string> = { ok: '✓ in tune', sharp: 'too high', flat: 'too low', silent: 'not heard' }
const resultOf = (pi: number, si: number): Verdict | undefined => results.value[`${pi}:${si}`]

function stepLabel(s: DrillStep, pi: number, si: number): string {
  const result = resultOf(pi, si)
  if (result) return VERDICT_LABELS[result.verdict]
  return s.kind === 'ref' ? 'your a' : s.kind === 'sing' ? 'you sing' : ''
}

const offTitle = (r: Verdict | undefined) =>
  r && r.verdict !== 'silent' ? `${r.off > 0 ? '+' : '−'}${Math.abs(r.off).toFixed(1)} semitones` : undefined

let mic: Mic | null = null
/** Pitches heard in each sing turn, by `phrase:step`. */
const sung = new Map<string, number[]>()

async function ensureMic(): Promise<boolean> {
  if (mic) return true
  const a = pianoContext()
  try {
    mic = await openMic(a)
    micNote.value = ''
    return true
  } catch {
    micNote.value = 'No microphone available. Set a with − and + instead.'
    return false
  }
}

function releaseMic(): void {
  if (check.value || finding.value) return
  mic?.close()
  mic = null
}

/** Listens while a sung turn is open, and judges each turn once it ends. */
function listen(): void {
  if (!mic || !check.value) return
  const e = active.value
  if (e && shown.value[e.phrase]!.steps[e.step]!.kind === 'sing' && now.value >= e.at + GRACE) {
    const m = mic.read()
    const key = `${e.phrase}:${e.step}`
    if (m !== null) sung.set(key, [...(sung.get(key) ?? []), m])
  }
  for (const t of timeline.value) {
    const s = shown.value[t.phrase]!.steps[t.step]!
    const key = `${t.phrase}:${t.step}`
    if (s.kind !== 'sing' || now.value < t.at + t.dur || results.value[key]) continue
    results.value[key] = judgePitch(sung.get(key) ?? [], pitchOf(s.vowel, base.value, range.value))
  }
}

let bus: GainNode | null = null
let t0 = 0
let raf = 0

function frame(): void {
  raf = 0
  if (!playing.value) return
  now.value = pianoContext().currentTime - t0
  listen()
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
  results.value = {}
  sung.clear()
  const a = pianoContext()
  bus = pianoBus(a)
  t0 = a.currentTime + 0.1
  for (const e of timeline.value) {
    const s = shown.value[e.phrase]!.steps[e.step]!
    if (s.kind === 'sing') continue
    pianoVoice(a, bus, pitchOf(s.vowel, base.value, range.value), t0 + e.at, e.dur * 0.9, s.kind === 'ref' ? 0.6 : 0.9, 0.4)
  }
  playing.value = true
  raf = requestAnimationFrame(frame)
}

let previewBus: GainNode | null = null

/** Sounds one vowel's pitch alone: the new `a` after a step, or any vowel the learner clicks. */
function preview(vowel: string): void {
  const a = pianoContext()
  if (previewBus) previewBus.gain.setTargetAtTime(0, a.currentTime, 0.02)
  previewBus = pianoBus(a)
  pianoVoice(a, previewBus, pitchOf(vowel, base.value, range.value), a.currentTime + 0.02, BEAT * 0.9, 0.9, 0.4)
}

function step(by: number): void {
  const next = Math.min(BASE_MAX, Math.max(BASE_MIN, base.value + by))
  if (next === base.value) return
  base.value = next
  preview('a')
}

let findRaf = 0

function endFind(): void {
  if (findRaf) cancelAnimationFrame(findRaf)
  findRaf = 0
  finding.value = false
  hearing.value = null
  releaseMic()
}

/** Listens for a held note and makes it the note for `a`. */
async function findA(): Promise<void> {
  if (finding.value) return endFind()
  stop()
  if (!(await ensureMic())) return
  finding.value = true
  micNote.value = ''
  const a = pianoContext()
  const start = a.currentTime
  const heard: Heard[] = []
  const tick = () => {
    if (!mic) return endFind()
    const t = a.currentTime - start
    const midi = mic.read()
    hearing.value = midi
    heard.push({ t, midi })
    const held = heldNote(heard, t)
    if (held !== null) {
      endFind()
      base.value = Math.min(BASE_MAX, Math.max(BASE_MIN, Math.round(held)))
      preview('a')
    } else if (t > FIND_LIMIT) {
      endFind()
      micNote.value = 'No steady note heard. Try again, and hold the note a little longer.'
    } else findRaf = requestAnimationFrame(tick)
  }
  findRaf = requestAnimationFrame(tick)
}

async function toggleCheck(): Promise<void> {
  if (check.value) {
    check.value = false
    releaseMic()
  } else if (await ensureMic()) check.value = true
}

watch(mode, (m) => {
  stop()
  phrases.value = drillPhrases(m)
})
watch([base, range, check], () => {
  stop()
  results.value = {}
})

onBeforeUnmount(() => {
  stop()
  check.value = false
  endFind()
})
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
        <button type="button" class="btn" :class="{ on: finding }" :aria-pressed="finding" @click="findA">
          <template v-if="finding">Listening… {{ hearing === null ? '' : noteName(Math.round(hearing)) }}</template>
          <template v-else>🎤 Find my <code>a</code></template>
        </button>
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
      <button type="button" class="btn check" :class="{ on: check }" :aria-pressed="check" @click="toggleCheck">🎤 Check me</button>
      <button type="button" class="btn play" @click="playing ? stop() : play()">{{ playing ? '■ Stop' : '▶ Play' }}</button>
    </div>
    <p v-if="finding" class="pd-mic-note">Sing a comfortable low <code>a</code> and hold it.</p>
    <p v-else-if="micNote" class="pd-mic-note">{{ micNote }}</p>
    <ol class="pd-phrases">
      <li v-for="(p, pi) in shown" :key="pi" class="pd-phrase">
        <span v-if="p.word" class="pd-word"
          ><code><span
              v-for="(c, li) in p.word"
              :key="li"
              :class="{ lit: wordLetterOn(p, pi, li), vowel: PITCH_ORDER.includes(c) }"
              @click="PITCH_ORDER.includes(c) && preview(c)"
              >{{ c }}</span
            ></code></span
        >
        <span class="pd-steps">
          <button
            v-for="(s, si) in p.steps"
            :key="si"
            type="button"
            class="pd-step"
            :class="[s.kind, resultOf(pi, si)?.verdict, { on: isOn(pi, si) }]"
            :aria-label="`Play ${s.vowel}`"
            :title="offTitle(resultOf(pi, si))"
            @click="preview(s.vowel)"
          >
            <span class="pd-letter">{{ s.vowel }}</span>
            <span v-if="stepLabel(s, pi, si)" class="pd-sub">{{ stepLabel(s, pi, si) }}</span>
          </button>
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

.btn.check {
  margin-inline-start: auto;
}

.pd-mic-note {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
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
  font: inherit;
  color: inherit;
  background: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 2.2rem;
  padding: 0.2rem 0.35rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  transition: background 0.08s;
}

.pd-step:hover {
  border-color: var(--vp-c-brand-1);
}

.pd-word .vowel {
  cursor: pointer;
}

.pd-step.ref {
  border-style: dashed;
}

.pd-step.ok {
  border-color: var(--vp-c-green-1);
}

.pd-step.sharp,
.pd-step.flat,
.pd-step.silent {
  border-color: var(--vp-c-yellow-1);
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

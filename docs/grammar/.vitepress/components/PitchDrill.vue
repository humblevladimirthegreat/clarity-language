<script lang="ts">
import { ref } from 'vue'
import { PITCH_BASE } from '@vowel-pitch'

const STORAGE_KEY = 'agebon.pitchBase'
/** The home note (the note `a` is said on), shared by every drill on the page and kept in the browser. */
const sharedBase = ref(PITCH_BASE)
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import {
  DRILL_MODES,
  DRILL_TEMPOS,
  PITCH_HOMES,
  PITCH_ORDER,
  drillPhrases,
  nearestHome,
  pitchOf,
  type DrillMode,
  type DrillPhrase,
  type DrillStep,
  type DrillTempo,
} from '@vowel-pitch'
import { openMic, type Mic } from '../lib/mic-pitch'
import { heldNote, judgePitch, type Heard, type Verdict } from '../lib/pitch-detect'
import { noteName, pianoBus, pianoContext, pianoVoice } from '../lib/piano-voice'

// Plays vowel-pitch patterns on the finger code's piano voice and lights each vowel as its note sounds;
// the learner says the vowels back on their notes. Tempo sets the beat. `level` intermediate swaps pairs for the contour
// mode and runs the scales through the consonants in alphabet order, with no rest between runs.
// The microphone is optional: *Find my home note* sets the home note from a held `a` (the nearest listed home), and *Check me* leaves a
// silent turn after each note and marks the note with what the learner said in it; a clicked step does the same for one note.
// With *From memory*, the vowel notes do not sound, so the learner says each unprompted; an opening `a` still sounds.
// *Strict* (only while checking) halves the match window. Without the microphone, the home-note buttons set the home.

const props = defineProps<{ level?: 'intermediate' }>()
const homeSelectId = `pd-home-${props.level ?? 'beginner'}`

const modes = computed(() => DRILL_MODES.filter((m) => (props.level ? m.intermediate : m.beginner)))

// A drill past beginner opens on the stacks, which only it has.
const mode = ref<DrillMode>(props.level ? 'contours' : 'up')
const tempo = ref<DrillTempo>('normal')
const beat = computed(() => DRILL_TEMPOS.find((t) => t.id === tempo.value)!.beat)
const base = sharedBase
/** Past beginner, the scales run through the consonants, one per note. */
const consonants = !!props.level
const phrases = ref<DrillPhrase[]>(drillPhrases(mode.value, consonants))
const playing = ref(false)
const now = ref(-1)

/** The normal beat: the length of a lone note, and the unit of the say turns, which never speed up. */
const BEAT = 0.7
/** Seconds at the start of a say turn not judged: the learner's reaction time and the last note's tail. */
const GRACE = 0.3
/** How long *Find my home note* listens before giving up. */
const FIND_LIMIT = 8

const check = ref(false)
/** While checking: whether each vowel's note sounds before the learner's turn. */
const hearFirst = ref(true)
/** While checking: half-semitone match instead of a semitone. Off until the learner turns it on. */
const strict = ref(false)
const finding = ref(false)
const hearing = ref<number | null>(null)
const micNote = ref('')
const results = ref<Record<string, Verdict>>({})

/** `turn`: a silent stretch for the learner to say the step's vowel. */
type Timed = { phrase: number; step: number; at: number; dur: number; turn: boolean }

/** Seconds of the turn to say a note back, while the microphone checks. Fixed, so a quick tempo still leaves time to find the note. */
const SAY_BACK = 2 * BEAT

const timeline = computed<Timed[]>(() => {
  const out: Timed[] = []
  let t = 0
  phrases.value.forEach((p, pi) => {
    p.steps.forEach((s, si) => {
      if (!check.value || hearFirst.value || s.kind === 'ref') {
        out.push({ phrase: pi, step: si, at: t, dur: s.beats * beat.value, turn: false })
        t += s.beats * beat.value
      }
      // The microphone must hear the learner alone, so they say each note back after it.
      if (check.value) {
        out.push({ phrase: pi, step: si, at: t, dur: SAY_BACK, turn: true })
        t += SAY_BACK
      }
    })
    if (!p.tied) t += beat.value
  })
  return out
})

const active = computed(() => timeline.value.find((e) => now.value >= e.at && now.value < e.at + e.dur) ?? null)
const isOn = (pi: number, si: number) => active.value?.phrase === pi && active.value.step === si

/** Which letter of a phrase's word sounds now: its vowels in order, after the opening `a`. */
function wordLetterOn(p: DrillPhrase, pi: number, li: number): boolean {
  if (!p.word || active.value?.phrase !== pi) return false
  const at = active.value.step
  const step = p.steps[at]!
  if (step.kind === 'ref') return false
  const notes = p.steps.slice(0, at + 1).filter((s) => s.kind === 'note').length
  const vowelAt = [...p.word].map((c, i) => ({ c, i })).filter(({ c }) => PITCH_ORDER.includes(c))
  return vowelAt[notes - 1]?.i === li
}

const VERDICT_LABELS: Record<Verdict['verdict'], string> = {
  ok: '✓ matched',
  close: 'close',
  sharp: 'a bit high',
  flat: 'a bit low',
  silent: "didn't hear",
}
const resultOf = (pi: number, si: number): Verdict | undefined => results.value[`${pi}:${si}`]

function stepLabel(s: DrillStep, pi: number, si: number): string {
  if ((manual.value?.key === `${pi}:${si}` && manual.value.saying) || (active.value?.turn && isOn(pi, si))) return 'your turn'
  const result = resultOf(pi, si)
  if (result) return VERDICT_LABELS[result.verdict]
  return s.kind === 'ref' ? 'home' : ''
}

const offTitle = (r: Verdict | undefined) =>
  r && r.verdict !== 'silent' ? `${r.off > 0 ? '+' : '−'}${Math.abs(r.off).toFixed(1)} semitones` : undefined

let mic: Mic | null = null
/** Pitches heard in each say turn, by `phrase:step`. */
const heardIn = new Map<string, number[]>()

async function ensureMic(): Promise<boolean> {
  if (mic) return true
  const a = pianoContext()
  try {
    mic = await openMic(a)
    micNote.value = ''
    return true
  } catch {
    micNote.value = 'No microphone available. Choose a home note instead.'
    return false
  }
}

function releaseMic(): void {
  if (check.value || finding.value) return
  mic?.close()
  mic = null
}

/** Listens while a turn to say is open, and marks its step once the turn ends. */
function listen(): void {
  if (!mic || !check.value) return
  const e = active.value
  if (e?.turn && now.value >= e.at + GRACE) {
    const m = mic.read()
    const key = `${e.phrase}:${e.step}`
    if (m !== null) heardIn.set(key, [...(heardIn.get(key) ?? []), m])
  }
  for (const t of timeline.value) {
    const key = `${t.phrase}:${t.step}`
    if (!t.turn || now.value < t.at + t.dur || results.value[key]) continue
    const s = phrases.value[t.phrase]!.steps[t.step]!
    results.value[key] = judgePitch(heardIn.get(key) ?? [], pitchOf(s.vowel, base.value), strict.value ? 0.5 : 1)
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
  endManual()
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  playing.value = false
  now.value = -1
  if (bus) bus.gain.setTargetAtTime(0, pianoContext().currentTime, 0.02)
  bus = null
}

function play(): void {
  stop()
  endPreview()
  results.value = {}
  heardIn.clear()
  const a = pianoContext()
  bus = pianoBus(a)
  t0 = a.currentTime + 0.1
  for (const e of timeline.value) {
    if (e.turn) continue
    const s = phrases.value[e.phrase]!.steps[e.step]!
    pianoVoice(a, bus, pitchOf(s.vowel, base.value), t0 + e.at, e.dur * 0.9, s.kind === 'ref' ? 0.6 : 0.9, 0.4)
  }
  playing.value = true
  raf = requestAnimationFrame(frame)
}

let previewBus: GainNode | null = null
const previewMidi = ref<number | null>(null)
let previewClear = 0

function endPreview(): void {
  if (previewClear) clearTimeout(previewClear)
  previewClear = 0
  previewMidi.value = null
}

/** Sounds one vowel's pitch alone: the new `a` after a step, or any vowel the learner clicks. */
function preview(vowel: string): void {
  const a = pianoContext()
  if (previewBus) previewBus.gain.setTargetAtTime(0, a.currentTime, 0.02)
  previewBus = pianoBus(a)
  const midi = pitchOf(vowel, base.value)
  const dur = BEAT * 0.9
  pianoVoice(a, previewBus, midi, a.currentTime + 0.02, dur, 0.9, 0.4)
  previewMidi.value = midi
  if (previewClear) clearTimeout(previewClear)
  previewClear = window.setTimeout(() => {
    previewClear = 0
    previewMidi.value = null
  }, (dur + 0.05) * 1000)
}

/** The piano note sounding now, or null while nothing plays. */
const playedMidi = computed(() => {
  if (previewMidi.value !== null) return previewMidi.value
  const e = active.value
  if (!playing.value || !e || e.turn) return null
  return pitchOf(phrases.value[e.phrase]!.steps[e.step]!.vowel, base.value)
})
const playedName = computed(() => (playedMidi.value === null ? '' : noteName(Math.round(playedMidi.value))))

/** A step the learner clicked while the microphone checks: its note sounds, then a turn to say it back. */
const manual = ref<{ key: string; saying: boolean } | null>(null)
let manualRaf = 0

function endManual(): void {
  if (manualRaf) cancelAnimationFrame(manualRaf)
  manualRaf = 0
  manual.value = null
}

/** Sounds a clicked step; while the microphone checks, also judges the learner saying it (back). */
function clickStep(pi: number, si: number, vowel: string): void {
  if (!check.value || !mic) return preview(vowel)
  stop()
  const key = `${pi}:${si}`
  delete results.value[key]
  // Without the note first, the turn opens at once.
  const lead = hearFirst.value ? BEAT : 0
  if (lead) preview(vowel)
  const a = pianoContext()
  const start = a.currentTime
  const target = pitchOf(vowel, base.value)
  const heard: number[] = []
  manual.value = { key, saying: false }
  const tick = () => {
    const t = a.currentTime - start
    if (t >= lead) manual.value!.saying = true
    if (t >= lead + GRACE) {
      const m = mic?.read() ?? null
      if (m !== null) heard.push(m)
    }
    if (t >= lead + SAY_BACK) {
      results.value[key] = judgePitch(heard, target, strict.value ? 0.5 : 1)
      endManual()
    } else manualRaf = requestAnimationFrame(tick)
  }
  manualRaf = requestAnimationFrame(tick)
}

function setHome(midi: number): void {
  if (midi === base.value) {
    preview('a')
    return
  }
  base.value = midi
  preview('a')
}

function onHome(e: Event): void {
  setHome(Number((e.target as HTMLSelectElement).value))
}

let findRaf = 0

function endFind(): void {
  if (findRaf) cancelAnimationFrame(findRaf)
  findRaf = 0
  finding.value = false
  hearing.value = null
  releaseMic()
}

/** Listens for a held note and makes it the home note. */
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
      base.value = nearestHome(held)
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
  results.value = {}
  phrases.value = drillPhrases(m, consonants)
})
watch([base, tempo, check, hearFirst, strict], () => {
  stop()
  results.value = {}
})

onMounted(() => {
  try {
    const saved = Number(window.localStorage.getItem(STORAGE_KEY))
    if (Number.isFinite(saved)) base.value = nearestHome(saved)
  } catch {
    // Storage blocked: start from the default note.
  }
})
watch(base, (b) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(b))
  } catch {
    // Storage blocked or full: the setting lasts for this visit.
  }
})

onBeforeUnmount(() => {
  stop()
  endPreview()
  check.value = false
  endFind()
})
</script>

<template>
  <div class="pitch-drill">
    <div class="pd-now" aria-live="polite">{{ playedName }}</div>
    <div class="pd-controls">
      <div class="pd-row">
        <div class="pd-group">
          <label class="pd-home" :for="homeSelectId">
            Home
            <select :id="homeSelectId" :value="base" @change="onHome">
              <option v-for="h in PITCH_HOMES" :key="h.midi" :value="h.midi">{{ h.label }}</option>
            </select>
          </label>
          <button type="button" class="btn find" :class="{ on: finding }" :aria-pressed="finding" @click="findA">
            <template v-if="finding">Listening… {{ hearing === null ? '' : noteName(Math.round(hearing)) }}</template>
            <template v-else>🎤 Find my home note</template>
          </button>
        </div>
      </div>
      <div class="pd-row">
        <div class="pd-group" role="group" aria-label="Pattern">
          <button
            v-for="m in modes"
            :key="m.id"
            type="button"
            class="btn"
            :class="{ on: mode === m.id }"
            :aria-pressed="mode === m.id"
            @click="mode = m.id"
          >
            {{ (consonants && m.consonantLabel) || m.label }}
          </button>
        </div>
        <div class="pd-group" role="group" aria-label="Tempo">
          <button
            v-for="t in DRILL_TEMPOS"
            :key="t.id"
            type="button"
            class="btn"
            :class="{ on: tempo === t.id }"
            :aria-pressed="tempo === t.id"
            @click="tempo = t.id"
          >
            {{ t.label }}
          </button>
        </div>
      </div>
      <div class="pd-row">
        <div class="pd-group">
          <button type="button" class="btn" :class="{ on: check }" :aria-pressed="check" @click="toggleCheck">🎤 Check me</button>
          <button type="button" class="btn play" @click="playing ? stop() : play()">{{ playing ? '■ Stop' : '▶ Play' }}</button>
        </div>
        <div v-if="check" class="pd-group" role="group" aria-label="Check">
          <button type="button" class="btn" :class="{ on: hearFirst }" :aria-pressed="hearFirst" @click="hearFirst = true">Hear first</button>
          <button type="button" class="btn" :class="{ on: !hearFirst }" :aria-pressed="!hearFirst" @click="hearFirst = false">From memory</button>
          <button type="button" class="btn" :class="{ on: strict }" :aria-pressed="strict" @click="strict = !strict">Strict</button>
        </div>
      </div>
    </div>
    <p v-if="finding" class="pd-mic-note">Say a long <code>a</code> on a comfortable low note, and hold it.</p>
    <p v-else-if="micNote" class="pd-mic-note">{{ micNote }}</p>
    <ol class="pd-phrases">
      <li v-for="(p, pi) in phrases" :key="pi" class="pd-phrase">
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
            :class="[s.kind, resultOf(pi, si)?.verdict, { on: isOn(pi, si) || manual?.key === `${pi}:${si}` }]"
            :aria-label="`Play ${(s.onset ?? '') + s.vowel}`"
            :title="offTitle(resultOf(pi, si))"
            @click="clickStep(pi, si, s.vowel)"
          >
            <span class="pd-letter">{{ (s.onset ?? '') + s.vowel }}</span>
            <span class="pd-sub">{{ stepLabel(s, pi, si) || '\u00a0' }}</span>
          </button>
        </span>
        <span class="pd-caption">{{ p.caption }}</span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.pitch-drill {
  position: relative;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.6rem 0.75rem 0.75rem;
  margin: 1rem 0;
}

.pd-now {
  position: absolute;
  top: 0.4rem;
  right: 0.75rem;
  min-height: 1rem;
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  color: var(--vp-c-text-2);
  pointer-events: none;
}

.pd-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pd-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  align-items: center;
}

.pd-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
}

.pd-label {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  margin-inline-end: 0.15rem;
}

.pd-home {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.pd-home select {
  font: inherit;
  font-size: 0.85rem;
  line-height: 1;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
}

.pd-home select:hover {
  border-color: var(--vp-c-brand-1);
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

.btn.find {
  min-width: 8.5rem;
  margin-inline-start: 0.25rem;
}

.btn code {
  font-size: inherit;
  padding: 0 0.15em;
}

.btn.play {
  min-width: 4.5rem;
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
  flex-direction: column;
  gap: 0.5rem;
}

.pd-phrase {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.pd-word {
  min-width: 2.5rem;
}

.pd-sub {
  white-space: nowrap;
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
  /* Wide enough for the longest label, so a mark never resizes the button. */
  width: 5rem;
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

.pd-step.close {
  border-color: var(--vp-c-green-3);
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

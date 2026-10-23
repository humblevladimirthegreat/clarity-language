<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  CONSONANT_LETTERS,
  GUITAR_CONSONANTS,
  GUITAR_SPARE,
  GUITAR_STRINGS,
  GUITAR_VOWELS,
  PIANO_LEFT_KEYS,
  PIANO_RIGHT_KEYS,
  VOWEL_LETTERS,
  fingerCodeScore,
  guitarNotes,
  pianoForm,
  pianoNotes,
  shapeOf,
  type Beat,
  type Finger,
  type Hand,
  type Note,
  type Shape,
} from '@finger-code'
import { NOTE_NAMES as NAMES, midiFreq as freq, noteName, pianoBus, pianoContext, pianoVoice } from '../lib/piano-voice'

// The page's sample list is the default slot: clicking a sample plays it.

type Channel = 'signed' | 'touch' | 'piano' | 'guitar'
const CHANNELS: { id: Channel; label: string }[] = [
  { id: 'signed', label: 'Signed' },
  { id: 'touch', label: 'Touch' },
  { id: 'piano', label: 'Piano' },
  { id: 'guitar', label: 'Guitar' },
]

const channel = ref<Channel>('signed')
const text = ref('')
const tempo = ref(150)
const mirrored = ref(false)
const tick = ref(false)
const picked = ref<Beat | null>(null)
const playing = ref(false)
const now = ref(0)
const samples = ref<HTMLElement | null>(null)

const handsView = computed(() => channel.value === 'signed' || channel.value === 'touch')
const score = computed(() => fingerCodeScore(text.value))
const beatSeconds = computed(() => 60 / tempo.value)

// ---- Events: what each hand shows over time, in seconds ----

type Event = { at: number; dur: number; cons: string | null; vowel: string | null; grace: boolean; beat: Beat; vel: number }

const events = computed<Event[]>(() => {
  const beat = beatSeconds.value
  const grace = Math.min(0.07, beat / 3)
  const out: Event[] = []
  for (const b of score.value.beats) {
    const vel = b.coda ? 0.5 : b.stress ? 1 : 0.6
    b.grace.forEach((cons, i) =>
      out.push({ at: b.at * beat - grace * (b.grace.length - i), dur: grace, cons, vowel: null, grace: true, beat: b, vel: vel * 0.7 }),
    )
    out.push({ at: b.at * beat, dur: b.dur * beat, cons: b.cons, vowel: b.vowel, grace: false, beat: b, vel })
  }
  return out
})

type Frame = { cons: string | null; vowel: string | null; pulse: number; stress: boolean; rest: boolean; beat: Beat | null; caption: string }

function beatCaption(b: Beat, grace = b.grace.length ? `grace ${b.grace.join(', ')}, then ` : ''): string {
  if (b.coda) return `${b.text}: consonant hand alone${b.held ? ', held' : ''}`
  if (!b.vowel) return `${b.text}: ${grace}consonant hand alone`
  return `${b.text}: ${grace}${b.cons ? 'both hands together' : 'no onset, vowel hand alone'}`
}

const REST: Frame = { cons: null, vowel: null, pulse: 0, stress: false, rest: true, beat: null, caption: '' }

const frame = computed<Frame>(() => {
  if (!playing.value) {
    const b = picked.value
    return b ? { cons: b.cons, vowel: b.vowel, pulse: 0, stress: b.stress, rest: false, beat: b, caption: beatCaption(b) } : REST
  }
  const t = now.value
  // A grace shape wins over the beat it overlaps.
  let ev: Event | null = null
  for (const e of events.value) if (t >= e.at && t < e.at + e.dur && (!ev || e.grace)) ev = e
  if (!ev) return { ...REST, caption: channel.value === 'signed' ? 'rest: both fists drop' : 'rest' }
  const since = t - ev.at
  return {
    cons: ev.cons,
    vowel: ev.vowel,
    pulse: since > beatSeconds.value ? 0 : Math.exp(-since / (ev.grace ? 0.03 : 0.07)),
    stress: !ev.grace && ev.beat.stress,
    rest: false,
    beat: ev.beat,
    caption: ev.grace ? `grace shape ${ev.cons}, then ${ev.beat.text}` : beatCaption(ev.beat, ''),
  }
})

const notesOf = (letter: string): Note[] => (channel.value === 'guitar' ? guitarNotes(letter) : pianoNotes(letter))

/** Keys or strings sounding now, by hand. */
const sounding = computed(() => {
  const on = { cons: new Set<number>(), vow: new Set<number>() }
  const f = frame.value
  for (const letter of [f.cons, f.vowel]) if (letter) for (const n of notesOf(letter)) on[n.hand].add(n.midi)
  return on
})

// ---- Audio ----

let ctx: AudioContext | null = null
let master: GainNode | null = null
let t0 = 0
let raf = 0
const stringCache = new Map<string, AudioBuffer>()

function ensureAudio(): AudioContext {
  ctx = pianoContext()
  if (!master) master = pianoBus(ctx)
  return ctx
}

// Guitar: a Karplus-Strong string; a hammer-on starts from a duller excitation than a pluck.
function stringBuffer(a: AudioContext, midi: number, hammer: boolean): AudioBuffer {
  const key = `${midi}${hammer}`
  const cached = stringCache.get(key)
  if (cached) return cached
  const rate = a.sampleRate
  const len = Math.floor(rate * 2.5)
  // Averaging two neighbors delays half a sample, so the loop is one period minus a half.
  const n = Math.round(rate / freq(midi) - 0.5)
  const buf = a.createBuffer(1, len, rate)
  const y = buf.getChannelData(0)
  const smooth = hammer ? 0.75 : 0.35
  let lp = 0
  for (let i = 0; i < n; i++) {
    lp = smooth * lp + (1 - smooth) * (Math.random() * 2 - 1)
    y[i] = lp
  }
  for (let i = n; i < len; i++) y[i] = 0.996 * 0.5 * (y[i - n]! + (i > n ? y[i - n - 1]! : 0))
  let peak = 0
  for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(y[i]!))
  for (let i = 0; i < len; i++) y[i] = y[i]! / (peak || 1)
  stringCache.set(key, buf)
  return buf
}

function guitarVoice(a: AudioContext, midi: number, hammer: boolean, when: number, dur: number, vel: number): void {
  const src = a.createBufferSource()
  src.buffer = stringBuffer(a, midi, hammer)
  const g = a.createGain()
  g.gain.setValueAtTime(vel * (hammer ? 1.2 : 1.6), when)
  // The picking hand mutes the string after its beat.
  g.gain.setTargetAtTime(0, when + dur + 0.03, 0.012)
  src.connect(g)
  g.connect(master!)
  src.start(when)
  src.stop(when + dur + 0.25)
}

function click(a: AudioContext, when: number, accent: boolean): void {
  const osc = a.createOscillator()
  const g = a.createGain()
  osc.type = 'triangle'
  osc.frequency.value = accent ? 1760 : 1175
  g.gain.setValueAtTime(0.0001, when)
  g.gain.exponentialRampToValueAtTime(accent ? 0.9 : 0.5, when + 0.002)
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.04)
  osc.connect(g)
  g.connect(master!)
  osc.start(when)
  osc.stop(when + 0.06)
}

/** Schedules the sound of these events, `start` seconds from now on the audio clock. */
function sound(evs: Event[], start: number): void {
  const a = ensureAudio()
  for (const e of evs) {
    const when = start + e.at
    if (handsView.value) {
      if (tick.value && !e.grace) click(a, when, e.beat.stress)
      continue
    }
    for (const letter of [e.cons, e.vowel]) {
      if (!letter) continue
      notesOf(letter).forEach((n, i) => {
        if (channel.value === 'guitar') guitarVoice(a, n.midi, n.hand === 'vow' && letter === e.vowel, when, e.dur, e.vel * (i ? 0.8 : 1))
        // The upper key of a pair, and the hook mark, sound softer.
        else pianoVoice(a, master!, n.midi, when, e.dur, e.vel * (n.hand === 'vow' && letter !== e.vowel ? 0.7 : i ? 0.55 : 1))
      })
    }
  }
}

function silence(): void {
  if (ctx && master) master.gain.setTargetAtTime(0, ctx.currentTime, 0.02)
  master = null
}

function frameLoop(): void {
  raf = 0
  if (!ctx || !playing.value) return
  now.value = ctx.currentTime - t0
  const end = score.value.end * beatSeconds.value
  if (now.value < end) raf = requestAnimationFrame(frameLoop)
  else stop()
}

function stop(): void {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  playing.value = false
  silence()
}

function play(): void {
  stop()
  if (!score.value.beats.length) return
  picked.value = null
  const a = ensureAudio()
  t0 = a.currentTime + 0.08
  sound(events.value, t0)
  now.value = 0
  playing.value = true
  raf = requestAnimationFrame(frameLoop)
}

function toggle(): void {
  if (playing.value) stop()
  else play()
}

function pick(b: Beat): void {
  stop()
  picked.value = picked.value === b ? null : b
  if (!picked.value) return
  const evs = events.value.filter((e) => e.beat === b)
  const shift = Math.min(...evs.map((e) => e.at))
  const a = ensureAudio()
  sound(evs.map((e) => ({ ...e, at: e.at - shift })), a.currentTime + 0.02)
}

async function onSample(event: MouseEvent): Promise<void> {
  const item = (event.target as HTMLElement).closest('li')
  const code = item?.querySelector('code')
  if (!code?.textContent) return
  text.value = code.textContent
  // Let the text watcher reset playback first.
  await nextTick()
  play()
}

watch([text, tempo, channel], () => {
  if (playing.value) stop()
  picked.value = null
})

onMounted(() => {
  text.value = samples.value?.querySelector('code')?.textContent ?? ''
})

onBeforeUnmount(() => {
  stop()
  ctx = null
})

// ---- Note names ----

const STRING_BY_MIDI = new Map(Object.entries(GUITAR_STRINGS).map(([s, x]) => [x.midi as number, s]))

// ---- Hands: signed and touch ----

const FINGER: Record<number, { x: number; w: number; len: number }> = {
  2: { x: 27, w: 16, len: 50 },
  3: { x: 9, w: 16, len: 56 },
  4: { x: -9, w: 16, len: 52 },
  5: { x: -26, w: 14, len: 40 },
}
const TOP = -28
const FIST: Shape = { fingers: [], hooked: false, name: 'fist' }

// Signed hand, in its own frame: palm toward the viewer, fingers up, thumb on the +x side.
function signedHand(shape: Shape, cls: Hand): string {
  const up = new Set<number>(shape.fingers)
  let s = `<g class="hand ${cls}">`
  s += `<rect class="palm" x="-26" y="38" width="52" height="28" rx="8"/>`
  // Fingers first, so the palm covers their roots.
  for (const f of [2, 3, 4, 5]) {
    const { x, w, len } = FINGER[f]!
    if (!up.has(f)) s += `<rect class="finger down" x="${x - w / 2}" y="${TOP - 9}" width="${w}" height="16" rx="${w / 2}"/>`
    else if (shape.hooked) s += `<rect class="finger up" x="${x - w / 2}" y="${TOP - len * 0.5}" width="${w}" height="${len * 0.5 + 8}" rx="${w / 2}"/>`
    else s += `<rect class="finger up" x="${x - w / 2}" y="${TOP - len}" width="${w}" height="${len + 8}" rx="${w / 2}"/>`
  }
  s += `<rect class="palm" x="-36" y="-30" width="72" height="72" rx="16"/>`
  for (const f of [2, 3, 4, 5]) {
    const { x, w, len } = FINGER[f]!
    // A folded finger's tip rests on the palm; a hooked finger's outer joints curl toward the viewer over its base.
    if (!up.has(f)) s += `<rect class="finger down" x="${x - w / 2 + 1}" y="${TOP + 2}" width="${w - 2}" height="14" rx="${(w - 2) / 2}"/>`
    else if (shape.hooked) s += `<rect class="finger curl" x="${x - w / 2 + 1}" y="${TOP - len * 0.5 + 1}" width="${w - 2}" height="${len * 0.34}" rx="${(w - 2) / 2}"/>`
  }
  if (up.has(1)) s += `<g transform="translate(28 20) rotate(52)"><rect class="thumb up" x="-9" y="-44" width="18" height="50" rx="9"/></g>`
  else s += `<rect class="thumb down" x="-20" y="8" width="54" height="17" rx="8.5"/>`
  s += `<path class="crease" d="M-24 30 Q0 36 24 30"/>`
  return s + `</g>`
}

// Pressed shape, in the pressing hand's frame: fingers point down toward the receiver, thumb on the +x side.
// Straight fingers land on fingertips (dots), hooked fingers on middle knuckles (broad bars further back).
const TIP: Record<number, [number, number]> = { 1: [50, -26], 2: [24, 8], 3: [8, 16], 4: [-8, 14], 5: [-24, 6] }
function pressPattern(shape: Shape | null, cls: Hand, strength: number): string {
  let s = ''
  for (const f of [1, 2, 3, 4, 5]) {
    const [x, y] = TIP[f]!
    s += `<circle class="ghost" cx="${x}" cy="${y}" r="${f === 1 ? 8 : 7}"/>`
  }
  if (!shape) return s
  for (const f of shape.fingers) {
    const [x, y] = TIP[f]!
    if (f === 1) s += `<circle class="press ${cls}" cx="${x}" cy="${y}" r="${8 * strength}"/>`
    else if (shape.hooked) s += `<rect class="press ${cls}" x="${x - 6.5 * strength}" y="${y - 20 - 5 * strength}" width="${13 * strength}" height="${10 * strength}" rx="${4 * strength}"/>`
    else s += `<circle class="press ${cls}" cx="${x}" cy="${y}" r="${7 * strength}"/>`
  }
  return s
}

function receiverPalm(): string {
  let s = `<rect class="rx-palm" x="-62" y="-60" width="124" height="120" rx="40"/>`
  // The receiver faces the signer, so their own fingers point toward the signer (up the screen).
  for (const [x, h] of [[-38, 30], [-13, 40], [13, 42], [38, 34]] as const) s += `<rect class="rx-finger" x="${x - 10}" y="${-52 - h}" width="20" height="${h}" rx="10"/>`
  return s
}

// A right-handed signer, seen by the receiver; a left-handed signer mirrors it. Signed: the consonant hand
// is on the viewer's left, and the vowel hand's fingers point sideways toward it. Touch: the consonant hand
// presses into the receiver's left palm.
const SLOT: Record<Hand, number> = { cons: 105, vow: 325 }
const SCENE_W = 430
const HAND_FRAME: Record<Hand, string> = { cons: '', vow: 'rotate(-90) scale(-1 1)' }
const PRESS_FRAME: Record<Hand, string> = { cons: '', vow: 'scale(-1 1)' }

const shapeIn = (letter: string | null) => (letter ? shapeOf(letter) : null)

const sceneSvg = computed(() => {
  const f = frame.value
  const flip = mirrored.value ? `translate(${SCENE_W} 0) scale(-1 1)` : ''
  let s = `<g transform="${flip}">`
  for (const hand of ['cons', 'vow'] as const) {
    const shape = shapeIn(hand === 'cons' ? f.cons : f.vowel)
    if (channel.value === 'signed') {
      const drop = f.rest ? 26 : 0
      const scale = 1.2 * (f.rest ? 0.94 : 1 + f.pulse * (f.stress ? 0.14 : 0.07))
      s += `<g transform="translate(${SLOT[hand]} ${120 + drop}) scale(${scale})" opacity="${f.rest ? 0.45 : 1}"><g transform="${HAND_FRAME[hand]}">${signedHand(shape ?? FIST, hand)}</g></g>`
    } else {
      const strength = shape ? 1 + f.pulse * 0.35 + (f.stress ? 0.18 : 0) : 1
      s += `<g transform="translate(${SLOT[hand]} 150)">${receiverPalm()}<g transform="${PRESS_FRAME[hand]}">${pressPattern(f.rest ? null : shape, hand, strength)}</g></g>`
    }
  }
  s += `</g>`
  if (channel.value === 'touch') s += `<text class="scene-label" x="${SCENE_W / 2}" y="16" text-anchor="middle">receiver’s palms · signer across the top</text>`
  return s
})

function miniSvg(letter: string | null, hand: Hand): string {
  const shape = letter ? shapeOf(letter) : FIST
  const flip = mirrored.value ? 'scale(-1 1)' : ''
  if (channel.value === 'signed') return `<svg viewBox="-90 -90 180 180" aria-hidden="true"><g transform="${flip}"><g transform="${HAND_FRAME[hand]}">${signedHand(shape, hand)}</g></g></svg>`
  return `<svg viewBox="-70 -100 140 170" aria-hidden="true"><g transform="${flip}">${receiverPalm()}<g transform="${PRESS_FRAME[hand]}">${pressPattern(letter ? shape : null, hand, 1)}</g></g></svg>`
}

const shapeCards = computed(() => [
  ...VOWEL_LETTERS.map((l) => ({ letter: l, hand: 'vow' as Hand, name: shapeOf(l).name, svg: miniSvg(l, 'vow') })),
  ...CONSONANT_LETTERS.map((l) => ({ letter: l, hand: 'cons' as Hand, name: shapeOf(l).name, svg: miniSvg(l, 'cons') })),
  { letter: '·', hand: null, name: channel.value === 'signed' ? 'fist: this hand is silent' : 'no press: this hand is silent', svg: miniSvg(null, 'cons') },
])

// ---- Piano ----

type Key = { midi: number; left: number; width: number; letter: string; finger: Finger | null }
type Keyboard = { hand: Hand; whites: { midi: number; octave: string }[]; blacks: Key[] }

const singleFinger = (letter: string) => {
  const { fingers, hook } = pianoForm(letter)
  return !hook && fingers.length === 1 ? fingers[0]! : null
}

function keyboard(hand: Hand): Keyboard {
  const keys = hand === 'cons' ? PIANO_RIGHT_KEYS : PIANO_LEFT_KEYS
  const fingerAt = new Map(Object.entries(keys).map(([f, midi]) => [midi, Number(f) as Finger]))
  const letters = hand === 'cons' ? CONSONANT_LETTERS : VOWEL_LETTERS
  const lo = 12 * Math.floor(Math.min(...fingerAt.keys()) / 12)
  const whites: Keyboard['whites'] = []
  for (let m = lo; m < lo + 24; m++) if (!NAMES[m % 12]!.includes('♯')) whites.push({ midi: m, octave: m % 12 === 0 ? noteName(m) : '' })
  const w = 100 / whites.length
  const blacks: Key[] = []
  for (let m = lo; m < lo + 24; m++) {
    if (!NAMES[m % 12]!.includes('♯')) continue
    const before = whites.filter((x) => x.midi < m).length
    const finger = fingerAt.get(m) ?? null
    const letter = finger === null ? '' : (letters.find((l) => singleFinger(l) === finger) ?? (hand === 'vow' ? '+' : ''))
    blacks.push({ midi: m, left: before * w - w * 0.32, width: w * 0.64, letter, finger })
  }
  return { hand, whites, blacks }
}

const keyboards = [keyboard('cons'), keyboard('vow')]

function pianoLabel(letter: string): string {
  return pianoNotes(letter)
    .map((n) => (n.hand === 'vow' && !VOWEL_LETTERS.includes(letter) ? `hook ${noteName(n.midi)}` : noteName(n.midi)))
    .join(' + ')
}

const pianoRows = computed(() => [
  ...VOWEL_LETTERS.map((l) => ({ letter: l, hand: 'vow', shape: shapeOf(l).name, fingers: pianoForm(l).fingers.join(' + '), keys: pianoLabel(l) })),
  ...CONSONANT_LETTERS.map((l) => {
    const p = pianoForm(l)
    return { letter: l, hand: 'cons', shape: shapeOf(l).name, fingers: p.fingers.join(' + ') + (p.hook ? ' + hook' : ''), keys: pianoLabel(l) }
  }),
])

// ---- Guitar ----

// Tab order: highest string on top. The two low strings carry the vowels.
const BOARD_ROWS: [string, number, string | null][] = [
  ['D', 62, 'D4'],
  ['B', 59, 'B3'],
  ['G', 55, 'G3'],
  ['D', 50, 'D3'],
  ['G', 43, null],
  ['D', 38, null],
]

const boardSvg = computed(() => {
  const on = sounding.value
  const W = 640
  const nutX = 96
  const frets = 8
  const fw = (W - nutX - 12) / frets
  const top = 28
  const gap = 26
  const y = (i: number) => top + i * gap
  let s = `<rect class="wood" x="${nutX}" y="${top - 13}" width="${W - nutX - 12}" height="${gap * 5 + 26}" rx="3"/>`
  for (const f of [3, 5, 7]) s += `<circle class="inlay" cx="${nutX + (f - 0.5) * fw}" cy="${top + gap * 2.5}" r="6"/>`
  s += `<rect class="nut" x="${nutX - 4}" y="${top - 13}" width="6" height="${gap * 5 + 26}"/>`
  for (let f = 1; f <= frets; f++) {
    s += `<line class="fretline" x1="${nutX + f * fw}" y1="${top - 13}" x2="${nutX + f * fw}" y2="${top + gap * 5 + 13}"/>`
    s += `<text class="fnum" x="${nutX + (f - 0.5) * fw}" y="${top + gap * 5 + 30}" text-anchor="middle">${f}</text>`
  }
  BOARD_ROWS.forEach(([name, midi, treble], i) => {
    const lit = treble && on.cons.has(midi) ? ' on' : ''
    s += `<text class="sname" x="4" y="${y(i) + 4}">${name}</text>`
    s += `<line class="str${lit}" x1="52" y1="${y(i)}" x2="${W - 12}" y2="${y(i)}" stroke-width="${1 + i * 0.45}"/>`
    if (!treble) return
    s += `<circle class="pick${lit}" cx="68" cy="${y(i)}" r="11"/>`
    s += `<text class="pick-text${lit}" x="68" y="${y(i) + 4.5}" text-anchor="middle">${GUITAR_STRINGS[treble as keyof typeof GUITAR_STRINGS].finger}</text>`
  })
  for (const v of VOWEL_LETTERS) {
    const { midi, string, fret } = GUITAR_VOWELS[v]!
    const i = string === 'D2' ? 5 : 4
    const cx = nutX + (fret - 0.5) * fw
    const lit = on.vow.has(midi) ? ' on' : ''
    s += `<circle class="vdot${lit}" cx="${cx}" cy="${y(i)}" r="11"/>`
    s += `<text class="vtext${lit}" x="${cx}" y="${y(i) + 4.5}" text-anchor="middle">${v}</text>`
  }
  return s
})

const vowelFret = (v: string) => `${GUITAR_VOWELS[v]!.string} fret ${GUITAR_VOWELS[v]!.fret}`

// Tab: one column per beat; open treble strings are 0, vowels show their fret, a held coda adds ~.
// A bar line ends each sentence.
const tab = computed(() => {
  const order = ['D4', 'B3', 'G3', 'D3', 'G2', 'D2']
  type Cell = { text: string; hand?: 'c' | 'v' }
  const cols: Record<string, Cell>[] = [Object.fromEntries(order.map((s) => [s, { text: `${s[0]}|` }]))]
  const column = (strings: string[], vowel: string | null, held: boolean) => {
    const c: Record<string, Cell> = {}
    for (const s of strings) c[s] = { text: `0${held ? '~' : ''}`, hand: 'c' }
    if (vowel) c[GUITAR_VOWELS[vowel]!.string] = { text: String(GUITAR_VOWELS[vowel]!.fret), hand: 'v' }
    cols.push(c)
  }
  for (const w of score.value.words) {
    for (const b of w.beats) {
      for (const g of b.grace) column(GUITAR_CONSONANTS[g]!.strings, null, false)
      column(b.cons ? GUITAR_CONSONANTS[b.cons]!.strings : [], b.vowel, b.held)
    }
    cols.push(Object.fromEntries(order.map((s) => [s, { text: w.period ? '|' : '' }])))
  }
  const lines = order.map(() => '')
  for (const c of cols) {
    const width = Math.max(1, ...order.map((s) => c[s]?.text.length ?? 0))
    order.forEach((s, i) => {
      const cell = c[s] ?? { text: '' }
      lines[i] += (cell.hand ? `<span class="${cell.hand}">${cell.text}</span>` : cell.text) + '-'.repeat(width - cell.text.length + 1)
    })
  }
  return lines.join('\n')
})

const guitarRows = computed(() => [
  ...VOWEL_LETTERS.map((l, i) => ({ letter: l, hand: 'vow', fingers: 'fretting hand', strings: `${noteName(GUITAR_VOWELS[l]!.midi)} · ${vowelFret(l)}`, why: `${i + 1}: count order up the scale` })),
  ...CONSONANT_LETTERS.map((l) => {
    const { strings, why } = GUITAR_CONSONANTS[l]!
    return { letter: l, hand: 'cons', fingers: strings.map((s) => GUITAR_STRINGS[s].finger).join(' '), strings: strings.join(' + '), why }
  }),
  { letter: 'spare', hand: '', fingers: GUITAR_SPARE.map((s) => GUITAR_STRINGS[s].finger).join(' '), strings: GUITAR_SPARE.join(' + '), why: 'unused' },
])

// ---- Stage heading and beat labels ----

const HAND_TITLE: Record<Channel, Record<Hand, string>> = {
  signed: { cons: 'Consonant hand', vow: 'Vowel hand' },
  touch: { cons: 'Consonant hand', vow: 'Vowel hand' },
  piano: { cons: 'Right hand · consonants', vow: 'Left hand · vowels' },
  guitar: { cons: 'Picking hand · consonants', vow: 'Fretting hand · vowels' },
}

const stageHead = computed(() => {
  const f = frame.value
  const hands: Hand[] = handsView.value && mirrored.value ? ['vow', 'cons'] : ['cons', 'vow']
  return hands.map((hand) => {
    const letter = hand === 'cons' ? f.cons : f.vowel
    let title = HAND_TITLE[channel.value][hand]
    if (handsView.value) title += ` · signer’s ${(hand === 'cons') !== mirrored.value ? 'right' : 'left'}`
    let detail = ''
    if (handsView.value) detail = letter ? shapeOf(letter).name : f.rest ? (channel.value === 'signed' ? 'rest' : 'lift') : channel.value === 'signed' ? 'fist' : 'no press'
    else if (channel.value === 'piano') detail = [...sounding.value[hand]].sort((a, b) => a - b).map(noteName).join(' + ')
    else if (hand === 'cons') detail = [...sounding.value.cons].sort((a, b) => a - b).map((m) => `${STRING_BY_MIDI.get(m)} (${GUITAR_STRINGS[STRING_BY_MIDI.get(m) as keyof typeof GUITAR_STRINGS].finger})`).join(' + ')
    else detail = f.vowel ? `${noteName(GUITAR_VOWELS[f.vowel]!.midi)} · ${vowelFret(f.vowel)}` : ''
    return { hand, title, letter: handsView.value ? letter : null, detail }
  })
})

function consLabel(letter: string): string {
  if (handsView.value) return shapeOf(letter).name
  if (channel.value === 'piano') return pianoLabel(letter)
  return GUITAR_CONSONANTS[letter]!.strings.join('+')
}

function vowelLabel(letter: string): string {
  if (handsView.value) return shapeOf(letter).name
  if (channel.value === 'piano') return pianoLabel(letter)
  return vowelFret(letter)
}

const silentHand = computed(() => (channel.value === 'signed' ? 'fist' : '—'))
</script>

<template>
  <div class="finger-code">
    <div class="fc-tabs" role="tablist" aria-label="Channel">
      <button
        v-for="c in CHANNELS"
        :key="c.id"
        type="button"
        role="tab"
        :aria-selected="channel === c.id"
        :class="{ active: channel === c.id }"
        @click="channel = c.id"
      >
        {{ c.label }}
      </button>
    </div>

    <div class="fc-input">
      <input v-model="text" type="text" spellcheck="false" autocomplete="off" aria-label="Ageben to sign or play" @keydown.enter="play" />
      <button type="button" class="fc-play" @click="toggle">{{ playing ? 'Stop' : 'Play' }}</button>
    </div>
    <div ref="samples" class="fc-samples" @click="onSample">
      <slot />
    </div>

    <div class="fc-controls">
      <label v-if="handsView" for="fc-signer">
        Signer
        <select id="fc-signer" v-model="mirrored">
          <option :value="false">Right-handed</option>
          <option :value="true">Left-handed (mirrored)</option>
        </select>
      </label>
      <label v-if="handsView" for="fc-tick"><input id="fc-tick" v-model="tick" type="checkbox" /> Beat tick</label>
      <label for="fc-tempo">
        Tempo <input id="fc-tempo" v-model.number="tempo" type="range" min="60" max="300" step="10" />
        <span class="fc-num">{{ tempo }}</span> beats/min
      </label>
    </div>

    <section class="fc-stage" aria-label="Hands">
      <div class="fc-stage-head">
        <div v-for="(slot, i) in stageHead" :key="slot.hand" :class="['fc-slot', slot.hand, { right: i === 1 }]">
          <div class="fc-h"><span class="dot" />{{ slot.title }}</div>
          <div class="fc-now">
            <b v-if="slot.letter" class="fc-letter">{{ slot.letter }}</b><span class="muted">{{ slot.detail }}</span>
          </div>
        </div>
      </div>

      <svg v-if="handsView" class="fc-scene" viewBox="0 0 430 250" role="img" aria-label="The two hands" v-html="sceneSvg" />

      <div v-else-if="channel === 'piano'" class="fc-keyboards">
        <div v-for="kb in keyboards" :key="kb.hand" :class="['fc-keyboard', kb.hand]">
          <div v-for="w in kb.whites" :key="w.midi" class="white">
            <span v-if="w.octave" class="octave">{{ w.octave }}</span>
          </div>
          <div
            v-for="k in kb.blacks"
            :key="k.midi"
            :class="['black', { inactive: k.finger === null, on: sounding[kb.hand].has(k.midi) }]"
            :style="{ left: `${k.left}%`, width: `${k.width}%` }"
            :title="noteName(k.midi)"
          >
            <template v-if="k.finger !== null">
              <span class="letter">{{ k.letter }}</span><span class="finger">{{ k.finger }}</span>
            </template>
          </div>
        </div>
      </div>

      <div v-else class="fc-board-wrap">
        <svg class="fc-board" viewBox="0 0 640 196" role="img" aria-label="Guitar fretboard" v-html="boardSvg" />
      </div>

      <p class="fc-caption">{{ frame.caption }}</p>
    </section>

    <div class="fc-h">Beats</div>
    <div class="fc-strip">
      <template v-for="(w, wi) in score.words" :key="wi">
        <div class="fc-word">
          <button
            v-for="(b, bi) in w.beats"
            :key="bi"
            type="button"
            :class="['fc-syl', { coda: b.coda, stress: b.stress, on: frame.beat === b }]"
            @click="pick(b)"
          >
            <b>{{ b.text }}</b>
            <small>
              <span v-if="b.grace.length" class="c">{{ b.grace.join('') }}› </span>
              <span class="c">{{ b.cons ? consLabel(b.cons) : silentHand }}</span>
              <template v-if="!b.coda"> / <span class="v">{{ b.vowel ? vowelLabel(b.vowel) : silentHand }}</span></template>
            </small>
          </button>
        </div>
        <span v-if="w.period" class="fc-rest">rest</span>
      </template>
    </div>
    <p v-if="score.skipped.length" class="fc-warn">Skipped (not plain Ageben letters): {{ score.skipped.join(' ') }}</p>
    <p class="fc-legend">
      <span><span class="tag u">zu</span> stressed first beat</span>
      <span><span class="tag dash">-n</span> coda: consonant hand alone, the last one held</span>
      <span><span class="tag">b›</span> grace shape before the beat</span>
      <span>Click a beat to hold it.</span>
    </p>

    <template v-if="channel === 'guitar'">
      <div class="fc-h">Tab</div>
      <pre class="fc-tab" v-html="tab" />
    </template>

    <div class="fc-h">Chart</div>
    <div v-if="handsView" class="fc-cards">
      <div v-for="card in shapeCards" :key="card.letter" :class="['fc-card', card.hand]">
        <span class="fc-mini" v-html="card.svg" />
        <b>{{ card.letter }}</b>
        <small>{{ card.name }}</small>
      </div>
    </div>
    <div v-else-if="channel === 'piano'" class="fc-table">
      <table>
        <thead>
          <tr><th>Letter</th><th>Shape</th><th>Fingers</th><th>Keys</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in pianoRows" :key="row.letter">
            <td :class="['l', row.hand]">{{ row.letter }}</td>
            <td>{{ row.shape }}</td>
            <td>{{ row.fingers }}</td>
            <td class="k">{{ row.keys }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="fc-table">
      <table>
        <thead>
          <tr><th>Letter</th><th>Fingers</th><th>Strings</th><th>Count</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in guitarRows" :key="row.letter">
            <td :class="['l', row.hand]">{{ row.letter }}</td>
            <td>{{ row.fingers }}</td>
            <td class="k">{{ row.strings }}</td>
            <td class="why">{{ row.why }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<!-- Not scoped: the hand, palm, and fretboard drawings are v-html SVG. Every rule sits under .finger-code. -->
<style>
.finger-code {
  --fc-cons: #1f7a8c;
  --fc-cons-soft: #d3ecf0;
  --fc-vow: #c0702a;
  --fc-vow-soft: #f6e3d1;
  --fc-palm: #e6e2dc;
  --fc-palm-edge: #b9b2a8;
  --fc-board: #5b3f2e;
  --fc-board-edge: #43301f;
  --fc-fret: #c8c3b8;
  --fc-string: #e4ddcd;
  --fc-inlay: #d9cbb3;
  --fc-key-white: #fbfbfa;
  --fc-key-white-edge: #c9ccd1;
  --fc-key-black: #1d2025;
  margin: 1rem 0 1.5rem;
  padding: 1rem 1.1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.dark .finger-code {
  --fc-cons: #5cc2d4;
  --fc-cons-soft: #18343a;
  --fc-vow: #eb9d5a;
  --fc-vow-soft: #3a2a1c;
  --fc-palm: #2a2724;
  --fc-palm-edge: #5a544c;
  --fc-board: #3d2a1e;
  --fc-board-edge: #2a1c13;
  --fc-fret: #8f8a80;
  --fc-string: #c9c2b2;
  --fc-inlay: #7d6d55;
  --fc-key-white: #d9dbde;
  --fc-key-white-edge: #6b7078;
  --fc-key-black: #0d0e10;
}

.finger-code .fc-h {
  margin: 1.2rem 0 0.5rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-2);
}

.finger-code button,
.finger-code select {
  font: inherit;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
}

.finger-code button:hover {
  border-color: var(--vp-c-brand-1);
}

.finger-code .fc-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.8rem;
}

.finger-code .fc-tabs button {
  padding: 0.3rem 0.85rem;
  font-size: 0.9rem;
}

.finger-code .fc-tabs button.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-white);
}

.finger-code .fc-input {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.finger-code .fc-input input {
  flex: 1 1 16rem;
  min-width: 0;
  padding: 0.55rem 0.8rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 1rem;
}

.finger-code .fc-input input:focus {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 1px;
}

.finger-code .fc-play {
  min-width: 5.5rem;
  padding: 0.5rem 1rem;
  font-weight: 600;
}

.finger-code .fc-samples ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 1.1rem;
  margin: 0.6rem 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
}

.finger-code .fc-samples li {
  margin: 0;
  cursor: pointer;
}

.finger-code .fc-samples li:hover code {
  color: var(--vp-c-brand-1);
}

.finger-code .fc-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.4rem;
  align-items: center;
  margin-top: 0.8rem;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
}

.finger-code .fc-controls label {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}

.finger-code .fc-controls select {
  padding: 0.15rem 0.3rem;
}

.finger-code .fc-controls input[type='range'] {
  width: 8rem;
  accent-color: var(--fc-cons);
}

.finger-code .fc-num {
  font-variant-numeric: tabular-nums;
  min-width: 3ch;
  color: var(--vp-c-text-1);
}

.finger-code .fc-stage {
  margin-top: 0.9rem;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.finger-code .fc-stage-head {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}

.finger-code .fc-slot.right {
  text-align: right;
}

.finger-code .fc-stage .fc-h {
  margin: 0;
}

.finger-code .dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: 1px;
}

.finger-code .cons .dot {
  background: var(--fc-cons);
}

.finger-code .vow .dot {
  background: var(--fc-vow);
}

.finger-code .fc-now {
  min-height: 1.4em;
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
}

.finger-code .fc-letter {
  margin-right: 0.5em;
}

.finger-code .muted,
.finger-code .fc-caption {
  color: var(--vp-c-text-2);
}

.finger-code .fc-caption {
  min-height: 1.3em;
  margin: 0.3rem 0 0;
  font-size: 0.82rem;
  text-align: center;
}

.finger-code .fc-scene {
  display: block;
  width: 100%;
  height: auto;
  max-height: 340px;
}

/* Hands */
.finger-code .hand .palm,
.finger-code .hand .finger,
.finger-code .hand .thumb {
  stroke-width: 1.6;
  stroke-linejoin: round;
}

.finger-code .hand.cons {
  --c: var(--fc-cons);
  --s: var(--fc-cons-soft);
}

.finger-code .hand.vow {
  --c: var(--fc-vow);
  --s: var(--fc-vow-soft);
}

.finger-code .hand .palm {
  fill: var(--s);
  stroke: var(--c);
}

.finger-code .hand .up {
  fill: color-mix(in srgb, var(--c) 45%, var(--s));
  stroke: var(--c);
}

.finger-code .hand .curl {
  fill: color-mix(in srgb, var(--c) 75%, var(--s));
  stroke: var(--c);
}

.finger-code .hand .down {
  fill: var(--s);
  stroke: color-mix(in srgb, var(--c) 55%, var(--s));
}

.finger-code .hand .crease {
  fill: none;
  stroke: color-mix(in srgb, var(--c) 40%, var(--s));
  stroke-width: 1.2;
  stroke-linecap: round;
}

.finger-code .rx-palm {
  fill: var(--fc-palm);
  stroke: var(--fc-palm-edge);
  stroke-width: 1.6;
}

.finger-code .rx-finger {
  fill: var(--fc-palm);
  stroke: var(--fc-palm-edge);
  stroke-width: 1.4;
}

.finger-code .ghost {
  fill: none;
  stroke: var(--fc-palm-edge);
  stroke-width: 1;
  stroke-dasharray: 2 3;
}

.finger-code .press.cons {
  fill: var(--fc-cons);
}

.finger-code .press.vow {
  fill: var(--fc-vow);
}

.finger-code .scene-label {
  font-size: 11px;
  font-weight: 600;
  fill: var(--vp-c-text-2);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* Piano */
.finger-code .fc-keyboards {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 0.5rem;
}

.finger-code .fc-keyboard {
  position: relative;
  display: flex;
  height: 120px;
  user-select: none;
}

.finger-code .fc-keyboard .white {
  position: relative;
  flex: 1 1 0;
  border: 1px solid var(--fc-key-white-edge);
  border-left-width: 0;
  border-radius: 0 0 5px 5px;
  background: var(--fc-key-white);
}

.finger-code .fc-keyboard .white:first-child {
  border-left-width: 1px;
}

.finger-code .fc-keyboard .octave {
  position: absolute;
  bottom: 4px;
  left: 4px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.6rem;
  color: #8a9097;
}

.finger-code .fc-keyboard .black {
  position: absolute;
  top: 0;
  z-index: 2;
  height: 64%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 1px;
  padding-bottom: 6px;
  border-radius: 0 0 4px 4px;
  background: var(--fc-key-black);
  transition: transform 60ms;
}

.finger-code .fc-keyboard .letter {
  font-family: var(--vp-font-family-mono);
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1;
  color: #f2f2f2;
}

.finger-code .fc-keyboard .finger {
  font-family: var(--vp-font-family-mono);
  font-size: 0.62rem;
  line-height: 1;
  color: #9ba1a9;
}

.finger-code .cons .black.on {
  background: var(--fc-cons);
  transform: translateY(2px);
}

.finger-code .vow .black.on {
  background: var(--fc-vow);
  transform: translateY(2px);
}

.finger-code .black.on .finger {
  color: #fff;
}

/* Guitar */
.finger-code .fc-board-wrap {
  overflow-x: auto;
}

.finger-code .fc-board {
  display: block;
  width: 100%;
  min-width: 520px;
  height: auto;
}

.finger-code .fc-board .wood {
  fill: var(--fc-board);
  stroke: var(--fc-board-edge);
}

.finger-code .fc-board .fretline {
  stroke: var(--fc-fret);
  stroke-width: 2;
}

.finger-code .fc-board .nut {
  fill: var(--fc-string);
}

.finger-code .fc-board .inlay {
  fill: var(--fc-inlay);
}

.finger-code .fc-board .str {
  stroke: var(--fc-string);
}

.finger-code .fc-board .str.on {
  stroke: var(--fc-cons);
}

.finger-code .fc-board .pick {
  fill: var(--vp-c-bg);
  stroke: var(--vp-c-divider);
}

.finger-code .fc-board .pick.on {
  fill: var(--fc-cons);
  stroke: var(--fc-cons);
}

.finger-code .fc-board .pick-text,
.finger-code .fc-board .vtext {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  font-weight: 600;
  fill: var(--vp-c-text-1);
}

.finger-code .fc-board .pick-text.on,
.finger-code .fc-board .vtext.on {
  fill: var(--vp-c-bg);
}

.finger-code .fc-board .sname,
.finger-code .fc-board .fnum {
  font-family: var(--vp-font-family-mono);
  font-size: 11px;
  fill: var(--vp-c-text-2);
}

.finger-code .fc-board .vdot {
  fill: var(--fc-vow-soft);
  stroke: var(--fc-vow);
  stroke-width: 1.5;
}

.finger-code .fc-board .vdot.on {
  fill: var(--fc-vow);
}

.finger-code .fc-tab {
  margin: 0;
  padding: 0.6rem 0.8rem;
  overflow-x: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
  line-height: 1.35;
}

.finger-code .fc-tab .c {
  color: var(--fc-cons);
  font-weight: 600;
}

.finger-code .fc-tab .v {
  color: var(--fc-vow);
  font-weight: 600;
}

/* Beats */
.finger-code .fc-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 0.9rem;
}

.finger-code .fc-word {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.finger-code .fc-syl {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  padding: 4px 8px;
  font-family: var(--vp-font-family-mono);
}

.finger-code .fc-syl b {
  font-weight: 500;
  font-size: 0.98rem;
}

.finger-code .fc-syl small {
  font-size: 0.68rem;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

.finger-code .c,
.finger-code td.cons {
  color: var(--fc-cons);
}

.finger-code .v,
.finger-code td.vow {
  color: var(--fc-vow);
}

.finger-code .fc-syl.coda {
  border-style: dashed;
}

.finger-code .fc-syl.stress b,
.finger-code .tag.u {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.finger-code .fc-syl.on {
  background: var(--vp-c-text-1);
  border-color: var(--vp-c-text-1);
}

.finger-code .fc-syl.on b,
.finger-code .fc-syl.on small,
.finger-code .fc-syl.on .c,
.finger-code .fc-syl.on .v {
  color: var(--vp-c-bg);
}

.finger-code .fc-rest {
  align-self: center;
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.finger-code .fc-warn {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: var(--vp-c-danger-1);
}

.finger-code .fc-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 1.1rem;
  margin: 0.6rem 0 0;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.finger-code .tag {
  display: inline-block;
  padding: 0 5px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-1);
}

.finger-code .tag.dash {
  border-style: dashed;
}

/* Charts */
.finger-code .fc-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
}

.finger-code .fc-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 8px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.finger-code .fc-mini {
  display: block;
  width: 100%;
  max-width: 96px;
}

.finger-code .fc-mini svg {
  display: block;
  width: 100%;
  height: auto;
}

.finger-code .fc-card b {
  font-family: var(--vp-font-family-mono);
}

.finger-code .fc-card.cons b {
  color: var(--fc-cons);
}

.finger-code .fc-card.vow b {
  color: var(--fc-vow);
}

.finger-code .fc-card small {
  font-size: 0.72rem;
  line-height: 1.3;
  text-align: center;
  color: var(--vp-c-text-2);
}

.finger-code .fc-table {
  overflow-x: auto;
}

.finger-code .fc-table table {
  display: table;
  width: 100%;
  margin: 0;
  font-size: 0.85rem;
}

.finger-code .fc-table td.l {
  font-family: var(--vp-font-family-mono);
  font-weight: 600;
}

.finger-code .fc-table td.k,
.finger-code .fc-table td.why {
  color: var(--vp-c-text-2);
}

.finger-code .fc-table td.k {
  font-family: var(--vp-font-family-mono);
}

@media (max-width: 520px) {
  .finger-code .fc-keyboard {
    height: 100px;
  }

  .finger-code .fc-keyboard .finger {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .finger-code .fc-keyboard .black {
    transition: none;
  }
}
</style>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, shallowRef, triggerRef, watch } from 'vue'
import { withBase } from 'vitepress'
import {
  checkpointStops,
  createEngine,
  entity,
  exportTurnLog,
  heldBy,
  logEntry,
  PLAYER,
  QUESTS,
  roomOf,
  visibleTo,
  type Engine,
  type EntityId,
  type Line,
  type LogEntry,
  type Spoken,
} from '@game-browser'
import { morphGlossWords, parseWords } from '@parse-browser'
import { useClassifyTables } from '../composables/useClassifyTables'
import { useLearnerName } from '../composables/useLearnerName'
import { data as gameData } from '../lib/wizard.data'

const LOG_KEY = 'agebon.wizardSandbox.log'
const SETTINGS_KEY = 'agebon.wizardSandbox.settings'

type Turn = { id: number; lines: Line[]; outcome?: string }
type Narration = 'auto' | 'agebon' | 'english'
type Settings = { position: number | 'everything'; narration: Narration }

const { tables, status, errorMessage } = useClassifyTables()
const { root: learnerRoot, ready: nameReady } = useLearnerName()

const engine = shallowRef<Engine | null>(null)
const turns = ref<Turn[]>([])
const log = ref<LogEntry[]>([])
const input = ref('')
const loading = ref(true)
const settings = ref<Settings>({ position: 'everything', narration: 'auto' })
/** Lines whose other version (English or Agebon, or the parser card) is showing. */
const flipped = ref(new Set<string>())
/** The tapped word: line key and word index. */
const picked = ref<{ key: string; index: number } | null>(null)
const transcript = ref<HTMLElement | null>(null)
let nextTurn = 0

const stops = checkpointStops(gameData.gate)

function stopLabel(anchor: string, band: string): string {
  const page = anchor.split('#')[0]!.replace(/\.md$/, '').replace(/-/g, ' ')
  return `${page.charAt(0).toUpperCase()}${page.slice(1)} · ${band}`
}

function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage blocked (private window, previews): the session lasts for this page view only.
  }
}

/** A fresh engine for the current name and progress, with earlier inputs replayed. */
function start(replay: string[]): void {
  if (!tables.value) return
  const position = settings.value.position === 'everything' ? Number.POSITIVE_INFINITY : settings.value.position
  const next = createEngine(tables.value, gameData, { playerRoot: learnerRoot.value, progress: { position } })
  const opening: Turn = { id: nextTurn++, lines: next.opening() }
  const replayed: Turn[] = []
  const entries: LogEntry[] = []
  for (const text of replay) {
    const result = next.turn(text)
    replayed.push({ id: nextTurn++, lines: result.lines, outcome: result.outcome })
    entries.push(logEntry(result, next.world.turn))
  }
  engine.value = next
  turns.value = [opening, ...replayed]
  log.value = entries
  flipped.value = new Set()
  picked.value = null
  loading.value = false
  void scrollDown()
}

function boot(): void {
  if (!tables.value || !nameReady.value || engine.value) return
  const stored = readJson<Settings>(SETTINGS_KEY)
  if (stored) settings.value = { ...settings.value, ...stored }
  const inputs = (readJson<LogEntry[]>(LOG_KEY) ?? []).map((entry) => entry.input)
  // Let the loading note paint before the parser is built.
  window.setTimeout(() => start(inputs), 30)
}

onMounted(boot)
watch([tables, nameReady], boot)

watch(
  () => [settings.value.position, learnerRoot.value],
  () => {
    if (!engine.value) return
    writeJson(SETTINGS_KEY, settings.value)
    start(log.value.map((entry) => entry.input))
  },
)

watch(
  () => settings.value.narration,
  () => writeJson(SETTINGS_KEY, settings.value),
)

async function scrollDown(): Promise<void> {
  await nextTick()
  transcript.value?.scrollTo({ top: transcript.value.scrollHeight })
}

function send(text: string = input.value): void {
  const current = engine.value
  if (!current || !text.trim()) return
  const result = current.turn(text)
  turns.value.push({ id: nextTurn++, lines: result.lines, outcome: result.outcome })
  log.value.push(logEntry(result, current.world.turn))
  writeJson(LOG_KEY, log.value)
  input.value = ''
  picked.value = null
  triggerRef(engine)
  void scrollDown()
}

function restart(): void {
  writeJson(LOG_KEY, null)
  start([])
}

function exportLog(): void {
  const position = settings.value.position
  const body = exportTurnLog(log.value, { position, build: __SITE_BUILD_ISO__ })
  const url = URL.createObjectURL(new Blob([body], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `agebon-sandbox-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function name(id: EntityId | undefined): string {
  const current = engine.value
  if (!current || !id) return 'Narrator'
  return current.gen.english(current.world, id, {}).replace(/^(a|an|the|some) /, '')
}

/** Things in the room with the player, and what the player holds. */
const scene = computed(() => {
  const current = engine.value
  if (!current) return null
  const { world } = current
  const room = roomOf(world, PLAYER)
  const chip = (id: EntityId) => {
    const e = entity(world, id)
    const row = current.lex.row(e.root)
    return { id, emoji: row?.emoji ?? '', citation: `${e.name ?? e.root}${e.name ? 'n' : 'l'}`, english: name(id) }
  }
  const held = heldBy(world, PLAYER).map((e) => e.id)
  return {
    room: room ? chip(room) : null,
    things: visibleTo(world, PLAYER).filter((e) => !held.includes(e.id)).map((e) => chip(e.id)),
    held: held.map(chip),
    talkingTo: world.addressee ? name(world.addressee) : null,
    quests: QUESTS.map((quest) => ({ id: quest.id, title: quest.title, done: world.facts.includes(`quest:${quest.id}`) })),
  }
})

const keyOf = (turn: Turn, index: number) => `${turn.id}:${index}`

function toggle(key: string): void {
  const next = new Set(flipped.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  flipped.value = next
}

/** Narration shows Agebon when its grammar is reached (or the setting says so); a tap flips it. */
function narrationInAgebon(line: Extract<Line, { kind: 'narration' }>, key: string): boolean {
  if (!line.spoken) return false
  const base = settings.value.narration === 'auto' ? !!line.gate?.ok : settings.value.narration === 'agebon'
  return flipped.value.has(key) ? !base : base
}

type WordInfo = { raw: string; gloss: string; emoji: string; concrete: string; abstract: string }
const wordCache = new Map<string, WordInfo[]>()

function words(agebon: string): WordInfo[] {
  const cached = wordCache.get(agebon)
  if (cached) return cached
  const t = tables.value
  let out: WordInfo[] = agebon.split(/\s+/).map((raw) => ({ raw, gloss: '', emoji: '', concrete: '', abstract: '' }))
  if (t) {
    try {
      out = morphGlossWords(agebon, t).map(({ raw, gloss }) => {
        let row
        try {
          const word = parseWords(raw)[0]
          const root = word?.family.kind === 'content' ? word.family.roots[0] : undefined
          row = root ? t.published.get(root) : undefined
        } catch {
          row = undefined
        }
        return { raw, gloss, emoji: row?.emoji ?? '', concrete: row?.concrete ?? '', abstract: row?.abstract ?? '' }
      })
    } catch {
      // Words with no gloss still show; the line itself was parsed before it was shown.
    }
  }
  wordCache.set(agebon, out)
  return out
}

/** The sentence mark after the last word (the tappable words leave it off). */
function endMark(agebon: string): string {
  return agebon.match(/[.?!]$/)?.[0] ?? ''
}

function pick(key: string, index: number): void {
  picked.value = picked.value?.key === key && picked.value.index === index ? null : { key, index }
}

function pickedWord(key: string, spoken: Spoken): WordInfo | undefined {
  return picked.value?.key === key ? words(spoken.agebon)[picked.value.index] : undefined
}

function grammarLink(anchor: string): string {
  const [page, id] = anchor.split('#')
  return withBase(`/${page!.replace(/\.md$/, '.html')}${id ? `#${id}` : ''}`)
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    event.preventDefault()
    send()
  }
}
</script>

<template>
  <div class="sandbox">
    <p v-if="status === 'error'" class="warn">Could not load the lexicon: {{ errorMessage }}</p>
    <p v-else-if="loading" class="note">Loading the parser…</p>

    <div v-if="scene" class="controls">
      <label class="control" for="sandbox-position">
        <span>Pretend you have reached</span>
        <select id="sandbox-position" v-model="settings.position">
          <option value="everything">Everything (sandbox)</option>
          <option v-for="stop in stops" :key="stop.position" :value="stop.position">
            {{ stopLabel(stop.section.anchor, stop.section.band) }}
          </option>
        </select>
      </label>
      <label class="control" for="sandbox-narration">
        <span>Narration</span>
        <select id="sandbox-narration" v-model="settings.narration">
          <option value="auto">Agebon once its grammar is reached</option>
          <option value="agebon">All Agebon</option>
          <option value="english">All English</option>
        </select>
      </label>
      <div class="buttons">
        <button type="button" :disabled="!log.length" @click="exportLog">Export turn log</button>
        <button type="button" @click="restart">Restart</button>
      </div>
    </div>

    <div v-if="scene" class="scene">
      <p class="here">
        <span v-if="scene.room" class="room">{{ scene.room.emoji }} {{ scene.room.english }}</span>
        <span v-if="scene.talkingTo" class="talking">talking to {{ scene.talkingTo }}</span>
      </p>
      <ul class="chips" aria-label="Things here">
        <li v-for="thing in scene.things" :key="thing.id" :title="thing.english">
          <span class="emoji" aria-hidden="true">{{ thing.emoji }}</span><code>{{ thing.citation }}</code>
        </li>
      </ul>
      <p v-if="scene.held.length" class="held">
        You hold:
        <span v-for="thing in scene.held" :key="thing.id" :title="thing.english" class="chip">
          <span class="emoji" aria-hidden="true">{{ thing.emoji }}</span><code>{{ thing.citation }}</code>
        </span>
      </p>
      <details class="quests">
        <summary>Quests ({{ scene.quests.filter((q) => q.done).length }}/{{ scene.quests.length }})</summary>
        <ul>
          <li v-for="quest in scene.quests" :key="quest.id" :class="{ done: quest.done }">
            <span aria-hidden="true">{{ quest.done ? '✓' : '○' }}</span> {{ quest.title }}
          </li>
        </ul>
      </details>
    </div>

    <div ref="transcript" class="transcript" role="log" aria-live="polite">
      <div v-for="turn in turns" :key="turn.id" class="turn" :class="turn.outcome">
        <template v-for="(line, i) in turn.lines" :key="i">
          <div v-if="line.kind === 'player'" class="line player">
            <span class="prompt" aria-hidden="true">›</span>
            <span class="agebon">{{ line.agebon }}</span>
            <span v-if="line.gloss" class="gloss">{{ line.gloss }}</span>
          </div>

          <div v-else-if="line.kind === 'speech'" class="line speech">
            <span class="who">{{ name(line.speaker) }}:</span>
            <span class="agebon">
              <template v-for="(word, w) in words(line.spoken.agebon)" :key="w">
                <button type="button" class="word" @click="pick(keyOf(turn, i), w)">{{ word.raw }}</button>{{ w < words(line.spoken.agebon).length - 1 ? ' ' : '' }}
              </template>{{ endMark(line.spoken.agebon) }}
            </span>
            <button type="button" class="flip" @click="toggle(keyOf(turn, i))">English</button>
            <span v-if="!line.gate.ok" class="above" title="Uses grammar or words past the level you picked">above your level</span>
            <span v-if="pickedWord(keyOf(turn, i), line.spoken)" class="card">
              {{ pickedWord(keyOf(turn, i), line.spoken)!.emoji }} <code>{{ pickedWord(keyOf(turn, i), line.spoken)!.raw }}</code>
              {{ pickedWord(keyOf(turn, i), line.spoken)!.gloss }}
              <template v-if="pickedWord(keyOf(turn, i), line.spoken)!.concrete">
                · {{ pickedWord(keyOf(turn, i), line.spoken)!.concrete }}<template v-if="pickedWord(keyOf(turn, i), line.spoken)!.abstract"> / {{ pickedWord(keyOf(turn, i), line.spoken)!.abstract }}</template>
              </template>
            </span>
            <span v-if="flipped.has(keyOf(turn, i))" class="english">“{{ line.spoken.english }}” <span class="gloss">{{ line.spoken.gloss }}</span></span>
          </div>

          <div v-else-if="line.kind === 'narration'" class="line narration">
            <template v-if="line.spoken && narrationInAgebon(line, keyOf(turn, i))">
              <span class="agebon">
                <template v-for="(word, w) in words(line.spoken.agebon)" :key="w">
                  <button type="button" class="word" @click="pick(keyOf(turn, i), w)">{{ word.raw }}</button>{{ w < words(line.spoken.agebon).length - 1 ? ' ' : '' }}
                </template>{{ endMark(line.spoken.agebon) }}
              </span>
              <span v-if="pickedWord(keyOf(turn, i), line.spoken)" class="card">
                {{ pickedWord(keyOf(turn, i), line.spoken)!.emoji }} <code>{{ pickedWord(keyOf(turn, i), line.spoken)!.raw }}</code>
                {{ pickedWord(keyOf(turn, i), line.spoken)!.gloss }}
              </span>
            </template>
            <span v-else class="english">{{ line.english }}</span>
            <button v-if="line.spoken" type="button" class="flip" @click="toggle(keyOf(turn, i))">
              {{ narrationInAgebon(line, keyOf(turn, i)) ? 'English' : 'Agebon' }}
            </button>
          </div>

          <div v-else-if="line.kind === 'recast'" class="line recast">
            <span class="who">{{ name(line.speaker) }}:</span>
            <span class="lead">Ah, you mean</span>
            <span class="agebon">{{ line.spoken.agebon }}</span>
            <span class="gloss">{{ line.spoken.gloss }}</span>
            <span v-if="line.why" class="why">
              {{ line.why }}
              <a v-if="line.source" :href="grammarLink(line.source)" target="_blank" rel="noopener">Grammar</a>
            </span>
          </div>

          <div v-else-if="line.kind === 'choice'" class="line choice">
            <span class="who">{{ name(line.speaker) }}:</span>
            <span class="lead">Which did you mean?</span>
            <span class="options">
              <button v-for="option in line.options" :key="option.agebon" type="button" @click="send(option.agebon)">
                {{ option.agebon }}
              </button>
            </span>
          </div>

          <div v-else-if="line.kind === 'beyond'" class="line beyond">
            <span class="lead">{{ line.english }}</span>
            <span class="parts">What the game cannot do yet: {{ line.parts.join('; ') }}.</span>
          </div>

          <div v-else-if="line.kind === 'refusal'" class="line refusal">
            <span v-if="line.speaker" class="who">{{ name(line.speaker) }}:</span>
            <span v-if="line.spoken" class="agebon">{{ line.spoken.agebon }}</span>
            <span class="english">{{ line.english }}</span>
          </div>

          <div v-else-if="line.kind === 'confused'" class="line confused">
            <span v-if="line.speaker" class="who">{{ name(line.speaker) }}:</span>
            <span v-if="line.spoken" class="agebon">{{ line.spoken.agebon }}</span>
            <span class="english">{{ line.speaker ? 'They did not understand.' : 'Your words fizzle: that is not a sentence yet.' }}</span>
            <button type="button" class="flip" @click="toggle(keyOf(turn, i))">Parser error</button>
            <span v-if="flipped.has(keyOf(turn, i))" class="card error-card">
              {{ line.card.message }}
              <template v-if="line.card.expected"> Expected: {{ line.card.expected }}.</template>
              <a v-if="line.card.anchor" :href="grammarLink(line.card.anchor)" target="_blank" rel="noopener">Grammar</a>
            </span>
          </div>

          <div v-else-if="line.kind === 'note'" class="line note">{{ line.english }}</div>

          <div v-else-if="line.kind === 'quest'" class="line quest">✓ {{ line.english }}</div>
        </template>
      </div>
    </div>

    <form class="entry" @submit.prevent="send()">
      <label for="sandbox-input" class="input-label">
        <span class="sr-only">Your sentence in Agebon</span>
        <input
          id="sandbox-input"
          v-model="input"
          type="text"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          placeholder="Type Agebon and press Enter"
          :disabled="!engine"
          @keydown="onKeydown"
        >
      </label>
      <button type="submit" :disabled="!engine || !input.trim()">Say it</button>
    </form>
  </div>
</template>

<style scoped>
.sandbox {
  margin: 1rem 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1.2rem;
  align-items: flex-end;
}

.control {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

select,
input[type='text'] {
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font: inherit;
  font-size: 0.9rem;
  max-width: 100%;
}

button {
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: default;
}

.buttons {
  display: flex;
  gap: 0.5rem;
}

.scene {
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.here {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  margin: 0;
  font-weight: 600;
}

.talking {
  font-weight: 400;
  color: var(--vp-c-text-2);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 0.8rem;
  margin: 0.5rem 0 0;
  padding: 0;
  list-style: none;
}

.chips li,
.chip {
  margin: 0;
  white-space: nowrap;
}

.emoji {
  margin-right: 0.2rem;
}

.held {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 0.8rem;
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
}

.quests {
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.quests ul {
  margin: 0.3rem 0 0;
  padding-left: 0.2rem;
  list-style: none;
}

.quests li.done {
  color: var(--vp-c-text-2);
}

.transcript {
  max-height: 32rem;
  overflow-y: auto;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.turn + .turn {
  margin-top: 0.7rem;
  padding-top: 0.7rem;
  border-top: 1px dashed var(--vp-c-divider);
}

.line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.5rem;
  margin: 0.3rem 0;
  line-height: 1.5;
}

.agebon {
  font-family: var(--vp-font-family-mono);
  font-size: 0.95rem;
}

.word {
  padding: 0;
  border: none;
  border-radius: 3px;
  background: none;
  font-family: var(--vp-font-family-mono);
  font-size: 0.95rem;
  color: inherit;
}

.word:hover,
.word:focus-visible {
  background: var(--vp-c-default-soft);
}

.gloss {
  flex-basis: 100%;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}

.who {
  font-weight: 600;
}

.flip {
  padding: 0 0.4rem;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

.card {
  flex-basis: 100%;
  padding: 0.3rem 0.55rem;
  border-radius: 6px;
  background: var(--vp-c-default-soft);
  font-size: 0.85rem;
}

.english {
  color: var(--vp-c-text-2);
}

.speech .english {
  flex-basis: 100%;
}

.player .prompt {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.narration .agebon,
.narration > .english {
  font-style: italic;
}

.above {
  font-size: 0.75rem;
  color: var(--vp-c-warning-1);
}

/* The three failures look different: parse (red), beyond (purple), refused (amber). */
.confused {
  padding-left: 0.6rem;
  border-left: 3px solid var(--vp-c-danger-1);
}

.beyond {
  padding-left: 0.6rem;
  border-left: 3px solid var(--vp-c-purple-1);
}

.refusal {
  padding-left: 0.6rem;
  border-left: 3px solid var(--vp-c-warning-1);
}

.recast {
  padding-left: 0.6rem;
  border-left: 3px solid var(--vp-c-tip-1);
}

.choice .options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.choice .options button {
  font-family: var(--vp-font-family-mono);
}

.why,
.parts,
.note {
  flex-basis: 100%;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.lead {
  color: var(--vp-c-text-2);
}

.quest {
  font-weight: 600;
  color: var(--vp-c-green-1);
}

.error-card {
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
}

.entry {
  display: flex;
  gap: 0.5rem;
}

.input-label {
  display: flex;
  flex: 1;
  min-width: 0;
}

.entry input {
  flex: 1;
  min-width: 0;
  font-family: var(--vp-font-family-mono);
}

.warn {
  color: var(--vp-c-danger-1);
}

.note {
  color: var(--vp-c-text-2);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>

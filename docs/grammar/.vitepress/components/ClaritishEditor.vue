<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { EditorState, Prec, StateEffect, StateField, type Extension } from '@codemirror/state'
import { Decoration, EditorView, keymap, placeholder, type DecorationSet } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import {
  compileTrigger,
  createScanner,
  dismissKey,
  normalize,
  type Cue,
  type Mark,
  type PlacedChange,
} from '@claritish-editor-browser'
import { data } from '../lib/claritish-editor.data'
import ClaritishCard from './ClaritishCard.vue'

const STORE = {
  draft: 'claritish-editor:draft',
  off: 'claritish-editor:lessons-off',
  never: 'claritish-editor:never',
  dismissed: 'claritish-editor:left-in-english',
}
const SCAN_IDLE_MS = 150
const SAVE_IDLE_MS = 400
const HOVER_OPEN_MS = 350
const HOVER_CLOSE_MS = 250
const SAMPLE = 'I think the store is closed, so I went home. Apparently Marco quit.\nSorry, I forgot to call you back. Thanks for covering my shift!'

const lessonOrder = data.lessons.map((l) => l.id)
const toneOf = (lesson: string) => Math.max(0, lessonOrder.indexOf(lesson)) % 4
const triggers = data.triggers.map(compileTrigger)
const triggerById = new Map(data.triggers.map((t) => [t.id, t]))
const formsByLesson = new Map(Object.entries(data.formsByLesson).map(([k, v]) => [k, new Set(v)]))
const scan = createScanner(triggers, lessonOrder)

// ---------------------------------------------------------------- storage

function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

function save(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage blocked or full: the page still works for this visit.
  }
}

const off = ref(new Set<string>())
const never = ref(new Set<string>())
const dismissed = ref(new Set<string>())
const enabled = computed(() => new Set(lessonOrder.filter((id) => !off.value.has(id))))

// ---------------------------------------------------------------- marks

const setMarks = StateEffect.define<DecorationSet>()
const markField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(set, tr) {
    for (const effect of tr.effects) if (effect.is(setMarks)) return effect.value
    return set.map(tr.changes)
  },
  provide: (field) => EditorView.decorations.from(field),
})

const host = ref<HTMLElement | null>(null)
const wrap = ref<HTMLElement | null>(null)
const marks = shallowRef<Mark[]>([])
const isEmpty = ref(true)
const announce = ref('')
let view: EditorView | null = null
let scanTimer = 0
let saveTimer = 0

function rescan() {
  if (!view) return
  marks.value = scan(view.state.doc.toString(), {
    enabled: enabled.value,
    never: never.value,
    dismissed: dismissed.value,
    formsByLesson,
  })
  const decorations = Decoration.set(
    marks.value.map((m) =>
      Decoration.mark({ class: `cl-cue cl-tone-${toneOf(m.cue.lesson)}` }).range(m.cue.from, m.cue.to),
    ),
  )
  view.dispatch({ effects: setMarks.of(decorations) })
}

function markAt(pos: number): Mark | undefined {
  return marks.value.find((m) => pos >= m.cue.from && pos <= m.cue.to)
}

// ---------------------------------------------------------------- card

type Active = { mark: Mark; cue: Cue; pinned: boolean; top: number; left: number }
const active = shallowRef<Active | null>(null)
const card = ref<InstanceType<typeof ClaritishCard> | null>(null)
let hoverTimer = 0

const activeTrigger = computed(() => (active.value ? triggerById.get(active.value.cue.trigger) : undefined))
const activeFlow = computed(() => (activeTrigger.value ? data.flows[activeTrigger.value.flow] : undefined))
const activeLesson = computed(() => data.lessons.find((l) => l.id === active.value?.cue.lesson))
const activeAlso = computed(() => {
  const a = active.value
  if (!a) return []
  return [a.mark.cue, ...a.mark.also].filter((c) => c !== a.cue)
})

function open(mark: Mark, cue: Cue, pinned: boolean) {
  if (!view || !wrap.value) return
  const coords = view.coordsAtPos(cue.from)
  const box = wrap.value.getBoundingClientRect()
  const top = coords ? coords.bottom - box.top + 6 : 0
  const left = coords ? Math.max(0, Math.min(coords.left - box.left, box.width - 480)) : 0
  active.value = { mark, cue, pinned, top, left }
}

async function openPinned(mark: Mark, cue: Cue = mark.cue) {
  open(mark, cue, true)
  await nextTick()
  await card.value?.focus()
}

function close(refocus = true) {
  const a = active.value
  active.value = null
  if (refocus && view && a?.pinned) {
    view.focus()
    view.dispatch({ selection: { anchor: Math.min(a.cue.to, view.state.doc.length) } })
  }
}

function pin() {
  if (active.value && !active.value.pinned) active.value = { ...active.value, pinned: true }
}

function useForm(changes: PlacedChange[], form: string) {
  if (!view) return
  const set = view.state.changes(changes)
  const placed = changes.find((c) => c.form === form)
  const anchor = placed ? set.mapPos(placed.to, 1) : undefined
  active.value = null
  view.dispatch({ changes: set, selection: anchor === undefined ? undefined : { anchor } })
  view.focus()
}

function leave() {
  const a = active.value
  if (!a) return
  dismissed.value = new Set([...dismissed.value, dismissKey(a.cue)])
  save(STORE.dismissed, [...dismissed.value])
  close()
  rescan()
}

function neverFlag() {
  const a = active.value
  if (!a) return
  never.value = new Set([...never.value, normalize(a.cue.text)])
  save(STORE.never, [...never.value])
  close()
  rescan()
}

function switchCue(cue: Cue) {
  const a = active.value
  if (a) void openPinned(a.mark, cue)
}

function clearNever() {
  never.value = new Set()
  dismissed.value = new Set()
  save(STORE.never, [])
  save(STORE.dismissed, [])
  rescan()
}

function onCardPointer(entering: boolean) {
  window.clearTimeout(hoverTimer)
  if (entering) pin()
  else if (active.value && !active.value.pinned) hoverTimer = window.setTimeout(() => close(false), HOVER_CLOSE_MS)
}

/** A click outside the card closes it; a click in the text means the writer is back to writing. */
function onPointerDown(event: PointerEvent) {
  const target = event.target as Node | null
  if (active.value && target && !card.value?.root?.contains(target)) close(false)
}

function onFocusOut(event: FocusEvent) {
  const next = event.relatedTarget as Node | null
  if (active.value?.pinned && next && !card.value?.root?.contains(next) && !view?.dom.contains(next)) close(false)
}

// ---------------------------------------------------------------- keyboard

function step(direction: 1 | -1): boolean {
  if (!view || !marks.value.length) return false
  const pos = view.state.selection.main.head
  const list = direction === 1 ? marks.value : [...marks.value].reverse()
  const next = list.find((m) => (direction === 1 ? m.cue.from > pos : m.cue.to < pos)) ?? list[0]!
  view.dispatch({ selection: { anchor: next.cue.from, head: next.cue.to }, scrollIntoView: true })
  const lesson = data.lessons.find((l) => l.id === next.cue.lesson)
  announce.value = `“${next.cue.text}”, ${lesson?.title ?? ''}. Alt+Enter opens its card.`
  return true
}

function openAtCursor(): boolean {
  if (!view || !marks.value.length) return false
  const pos = view.state.selection.main.head
  // The mark in the cursor's sentence, else the next one, else the last.
  const mark =
    marks.value.find((m) => pos >= m.cue.sentence.from && pos <= m.cue.sentence.to) ??
    marks.value.find((m) => m.cue.from >= pos) ??
    marks.value[marks.value.length - 1]!
  void openPinned(mark)
  return true
}

// ---------------------------------------------------------------- lesson filter

function toggleLesson(id: string) {
  const next = new Set(off.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  off.value = next
  save(STORE.off, [...next])
  if (active.value && next.has(active.value.cue.lesson)) close(false)
  rescan()
}

function loadSample() {
  if (!view) return
  view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: SAMPLE } })
  view.focus()
}

// ---------------------------------------------------------------- setup

onMounted(() => {
  off.value = new Set(load<string[]>(STORE.off, []))
  never.value = new Set(load<string[]>(STORE.never, []))
  dismissed.value = new Set(load<string[]>(STORE.dismissed, []))
  const draft = load<string>(STORE.draft, '')

  const extensions: Extension[] = [
    history(),
    Prec.high(
      keymap.of([
        { key: 'Alt-Enter', run: openAtCursor },
        { key: 'Mod-.', run: openAtCursor },
        { key: 'Alt-ArrowDown', run: () => step(1) },
        { key: 'Alt-ArrowUp', run: () => step(-1) },
        {
          key: 'Escape',
          run: () => {
            if (!active.value) return false
            close(false)
            return true
          },
        },
      ]),
    ),
    keymap.of([...defaultKeymap, ...historyKeymap]),
    markField,
    EditorView.lineWrapping,
    placeholder('Write or paste a journal entry…'),
    EditorView.contentAttributes.of({ 'aria-label': 'Journal entry', 'aria-describedby': 'claritish-editor-keys', spellcheck: 'true' }),
    EditorView.updateListener.of((update) => {
      if (!update.docChanged) return
      isEmpty.value = update.state.doc.length === 0
      if (active.value) close(false)
      window.clearTimeout(scanTimer)
      scanTimer = window.setTimeout(rescan, SCAN_IDLE_MS)
      window.clearTimeout(saveTimer)
      saveTimer = window.setTimeout(() => save(STORE.draft, update.state.doc.toString()), SAVE_IDLE_MS)
    }),
    EditorView.domEventHandlers({
      mousemove(event, v) {
        const pos = v.posAtCoords({ x: event.clientX, y: event.clientY })
        const mark = pos === null ? undefined : markAt(pos)
        window.clearTimeout(hoverTimer)
        if (mark && active.value?.cue === mark.cue) return
        if (mark) hoverTimer = window.setTimeout(() => open(mark, mark.cue, false), HOVER_OPEN_MS)
        else if (active.value && !active.value.pinned) hoverTimer = window.setTimeout(() => close(false), HOVER_CLOSE_MS)
      },
      mouseleave() {
        window.clearTimeout(hoverTimer)
        if (active.value && !active.value.pinned) hoverTimer = window.setTimeout(() => close(false), HOVER_CLOSE_MS)
      },
    }),
  ]
  view = new EditorView({ parent: host.value!, state: EditorState.create({ doc: draft, extensions }) })
  document.addEventListener('pointerdown', onPointerDown)
  isEmpty.value = view.state.doc.length === 0
  rescan()
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  window.clearTimeout(scanTimer)
  window.clearTimeout(hoverTimer)
  if (saveTimer && view) {
    window.clearTimeout(saveTimer)
    save(STORE.draft, view.state.doc.toString())
  }
  view?.destroy()
  view = null
})
</script>

<template>
  <div class="claritish-editor">
    <div class="filters" role="group" aria-label="Lessons that mark text">
      <button
        v-for="lesson in data.lessons"
        :key="lesson.id"
        type="button"
        :class="['filter', `cl-tone-${toneOf(lesson.id)}`, { on: !off.has(lesson.id) }]"
        :aria-pressed="!off.has(lesson.id)"
        @click="toggleLesson(lesson.id)"
      >
        <span class="dot" aria-hidden="true" />{{ lesson.title }}
      </button>
    </div>

    <div ref="wrap" class="wrap" @focusout="onFocusOut">
      <div ref="host" class="host" />
      <ClaritishCard
        v-if="active && activeTrigger && activeFlow && activeLesson"
        ref="card"
        class="floating"
        :style="{ top: `${active.top}px`, left: `${active.left}px` }"
        :cue="active.cue"
        :also="activeAlso"
        :trigger="activeTrigger"
        :flow="activeFlow"
        :lesson="activeLesson"
        :tone="toneOf(active.cue.lesson)"
        :lessons="data.lessons"
        @mouseenter="onCardPointer(true)"
        @mouseleave="onCardPointer(false)"
        @focusin="pin"
        @use="useForm"
        @leave="leave"
        @never="neverFlag"
        @switch="switchCue"
        @close="close()"
      />
    </div>

    <p id="claritish-editor-keys" class="keys">
      Hover a dotted phrase, or put the cursor on it and press <kbd>Alt</kbd>+<kbd>Enter</kbd>, to open its card.
      <kbd>Alt</kbd>+<kbd>↓</kbd> and <kbd>Alt</kbd>+<kbd>↑</kbd> move between marked phrases; <kbd>Esc</kbd> closes a card.
    </p>
    <p class="sr-only" aria-live="polite">{{ announce }}</p>
    <div class="footer">
      <button v-if="isEmpty" type="button" class="link" @click="loadSample">Try a sample entry</button>
      <button v-if="never.size || dismissed.size" type="button" class="link" @click="clearNever">
        Mark everything again ({{ never.size + dismissed.size }} left in English)
      </button>
      <span class="private">Your text stays in this browser.</span>
    </div>
  </div>
</template>

<style>
/* CodeMirror content is outside the scoped styles. */
.claritish-editor {
  --cl-tone-0: var(--vp-c-indigo-1);
  --cl-tone-1: var(--vp-c-green-1);
  --cl-tone-2: var(--vp-c-purple-1);
  --cl-tone-3: var(--vp-c-yellow-1);
}

.claritish-editor .cl-tone-0 { --cl-tone: var(--cl-tone-0); }
.claritish-editor .cl-tone-1 { --cl-tone: var(--cl-tone-1); }
.claritish-editor .cl-tone-2 { --cl-tone: var(--cl-tone-2); }
.claritish-editor .cl-tone-3 { --cl-tone: var(--cl-tone-3); }

.claritish-editor .cm-editor {
  min-height: 14rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.claritish-editor .cm-editor.cm-focused {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 1px;
}

.claritish-editor .cm-content {
  padding: 0.7rem 0.85rem;
  font-family: var(--vp-font-family-base);
  font-size: 1rem;
  line-height: 1.6;
  caret-color: var(--vp-c-text-1);
}

.claritish-editor .cm-placeholder {
  color: var(--vp-c-text-3);
}

.claritish-editor .cl-cue {
  text-decoration: underline dotted var(--cl-tone);
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
  cursor: help;
}
</style>

<style scoped>
.claritish-editor {
  margin-top: 1rem;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.65rem;
}

.filter {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.7rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
  cursor: pointer;
}

.filter.on {
  border-color: var(--cl-tone);
  color: var(--vp-c-text-1);
}

.dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  border: 2px solid var(--cl-tone);
}

.filter.on .dot {
  background: var(--cl-tone);
}

.wrap {
  position: relative;
}

.floating {
  position: absolute;
  z-index: 20;
}

@media (max-width: 640px) {
  .floating {
    left: 0 !important;
    right: 0;
    width: 100%;
  }
}

.keys,
.footer {
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
}

.keys {
  margin: 0.6rem 0 0;
}

kbd {
  padding: 0 0.3rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.8rem;
}

.footer {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.3rem 1rem;
  margin-top: 0.4rem;
}

.link {
  padding: 0;
  border: 0;
  background: none;
  color: var(--vp-c-brand-1);
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}

.private {
  margin-left: auto;
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

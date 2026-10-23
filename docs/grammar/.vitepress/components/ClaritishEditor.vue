<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { withBase } from 'vitepress'
import { EditorState, Prec, StateEffect, StateField, type Extension } from '@codemirror/state'
import {
  Decoration,
  EditorView,
  hoverTooltip,
  keymap,
  placeholder,
  showTooltip,
  type DecorationSet,
  type Tooltip,
} from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import {
  acceptCompletion,
  autocompletion,
  closeCompletion,
  completionStatus,
  moveCompletionSelection,
  selectedCompletion,
  startCompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
} from '@codemirror/autocomplete'
import {
  compileTrigger,
  createScanner,
  dismissKey,
  findDropIns,
  findNearMisses,
  indexForms,
  normalize,
  sameDropIns,
  type CommandAt,
  type Cue,
  type EditorCommand,
  type FoundDropIn,
  type Mark,
  type NearMiss,
  type PlacedChange,
} from '@claritish-editor-browser'
import { previewPhonemes } from '@tts-browser'
import { data } from '../lib/claritish-editor.data'
import ClaritishCard from './ClaritishCard.vue'

const STORE = {
  draft: 'claritish-editor:draft',
  off: 'claritish-editor:lessons-off',
  never: 'claritish-editor:never',
  dismissed: 'claritish-editor:left-in-english',
  mirror: 'claritish-editor:mirror',
}
const SCAN_IDLE_MS = 150
const SAVE_IDLE_MS = 400
const HOVER_OPEN_MS = 350
const HOVER_CLOSE_MS = 250
const SAMPLE =
  "I think the store is closed, so I went home. Apparently Marco quit. I was so lazy this morning.\nSorry, I forgot to call you back. Thanks for covering my shift!\nI can't run this week. You should call your sister. I'll try the new class lol\nI'm anxious about the review."

const lessonOrder = data.lessons.map((l) => l.id)
const toneOf = (lesson: string) => Math.max(0, lessonOrder.indexOf(lesson)) % 4
const lessonById = new Map(data.lessons.map((l) => [l.id, l]))
const triggers = data.triggers.map(compileTrigger)
const triggerById = new Map(data.triggers.map((t) => [t.id, t]))
const { formsByLesson: formsOfLesson, glossary } = indexForms(data.flows)
const formsByLesson = new Map(Object.entries(formsOfLesson).map(([k, v]) => [k, new Set(v)]))
const known = new Set(Object.keys(glossary))
const english = new Set(data.english)
const commandByName = new Map(data.commands.map((c) => [c.name, c]))
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

// ---------------------------------------------------------------- glosses

/** A found drop-in's English: its form's gloss, each mark's for a run of tone marks. */
function glossOf(drop: Pick<FoundDropIn, 'form' | 'marks'>): string {
  if (drop.marks) {
    const parts = drop.marks.map((m) => glossary[m]?.gloss.join(', ') ?? m)
    return parts.join(' + ') + (drop.form.length > drop.marks.length ? ' (doubled: more)' : '')
  }
  return glossary[drop.form]?.gloss.join(' · ') ?? ''
}

function lessonOfForm(drop: Pick<FoundDropIn, 'form' | 'marks'>) {
  return lessonById.get(glossary[drop.marks?.[0] ?? drop.form]?.lesson ?? '')
}

function ipaOf(form: string): string {
  if (!/^\p{L}/u.test(form)) return ''
  try {
    return previewPhonemes(form).words.map((w) => w.ipa).join(' ')
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------- marks and read-back

const setMarks = StateEffect.define<DecorationSet>()
const markField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(set, tr) {
    for (const effect of tr.effects) if (effect.is(setMarks)) return effect.value
    return set.map(tr.changes)
  },
  provide: (field) => EditorView.decorations.from(field),
})

/** A drop-in already in the text, or a word that looks like one. */
type ReadItem = { from: number; to: number; text: string; drop?: FoundDropIn; miss?: NearMiss }
type ReadBack = { items: ReadItem[]; deco: DecorationSet }

const setReadBack = StateEffect.define<ReadBack>()
const readField = StateField.define<ReadBack>({
  create: () => ({ items: [], deco: Decoration.none }),
  update(value, tr) {
    for (const effect of tr.effects) if (effect.is(setReadBack)) return effect.value
    if (!tr.docChanged) return value
    const items = value.items
      .map((i) => ({ ...i, from: tr.changes.mapPos(i.from, 1), to: tr.changes.mapPos(i.to, -1) }))
      .filter((i) => i.from < i.to)
    return { items, deco: value.deco.map(tr.changes) }
  },
  provide: (field) => EditorView.decorations.from(field, (value) => value.deco),
})

function readItemAt(state: EditorState, pos: number): ReadItem | undefined {
  return state.field(readField).items.find((i) => pos >= i.from && pos <= i.to)
}

/** The word being typed: no near miss for it until the cursor leaves. */
let typing: { from: number; to: number } | null = null

const REASONS: Record<NearMiss['reason'], string> = {
  ending: 'Suffixes take no ending.',
  'no-t': 'Ageben has no t; it writes th.',
  spelling: 'Close to a drop-in.',
}

function replaceWith(view: EditorView, item: ReadItem, text: string) {
  view.dispatch({ changes: { from: item.from, to: item.to, insert: text }, selection: { anchor: item.from + text.length } })
  announce.value = `Changed to ${text}.`
}

function tipDom(view: EditorView, item: ReadItem, keyboard: boolean): HTMLElement {
  const dom = document.createElement('div')
  dom.className = 'cl-tip'
  const line = (cls: string) => dom.appendChild(Object.assign(document.createElement('p'), { className: cls }))
  if (item.drop) {
    const head = line('cl-tip-head')
    head.append(Object.assign(document.createElement('code'), { textContent: item.text }), ` ${glossOf(item.drop)}`)
    const lesson = lessonOfForm(item.drop)
    if (lesson) {
      const meta = line('cl-tip-meta')
      meta.append(`${lesson.title} · `, Object.assign(document.createElement('a'), { href: withBase(`/${lesson.learn}`), textContent: 'Learn this' }))
    }
    const ipa = ipaOf(item.drop.form)
    if (ipa) line('cl-tip-ipa').textContent = `/${ipa}/`
  } else if (item.miss) {
    const { suggestions, reason } = item.miss
    line('cl-tip-head').textContent = `${REASONS[reason]} Did you mean ${suggestions.join(' or ')}?`
    const actions = line('cl-tip-actions')
    for (const s of suggestions) {
      const button = Object.assign(document.createElement('button'), { type: 'button', textContent: `Use ${s}` })
      button.addEventListener('mousedown', (event) => event.preventDefault())
      button.addEventListener('click', () => replaceWith(view, item, s))
      actions.append(button)
    }
    if (keyboard) line('cl-tip-meta').textContent = `Alt+Enter uses ${suggestions[0]}.`
  }
  return dom
}

function tipFor(item: ReadItem, keyboard: boolean): Tooltip {
  return { pos: item.from, end: item.to, above: false, create: (view) => ({ dom: tipDom(view, item, keyboard) }) }
}

/** Keyboard reach: the cursor inside a near miss shows its tip. */
const cursorTip = StateField.define<Tooltip | null>({
  create: () => null,
  update(_, tr) {
    const sel = tr.state.selection.main
    if (!sel.empty) return null
    const item = readItemAt(tr.state, sel.head)
    return item?.miss ? tipFor(item, true) : null
  },
  provide: (field) => showTooltip.from(field),
})

const hoverTip = hoverTooltip(
  (view, pos) => {
    const item = readItemAt(view.state, pos)
    if (!item || (item.miss && view.state.field(cursorTip)?.pos === item.from)) return null
    return tipFor(item, false)
  },
  { hideOnChange: true },
)

const host = ref<HTMLElement | null>(null)
const wrap = ref<HTMLElement | null>(null)
const marks = shallowRef<Mark[]>([])
const isEmpty = ref(true)
const announce = ref('')
let view: EditorView | null = null
let extensions: Extension[] = []
let scanTimer = 0
let saveTimer = 0

function rescan() {
  if (!view) return
  const doc = view.state.doc.toString()
  marks.value = scan(doc, { enabled: enabled.value, never: never.value, dismissed: dismissed.value, formsByLesson })
  const decorations = Decoration.set(
    marks.value.map((m) =>
      Decoration.mark({ class: `cl-cue cl-tone-${toneOf(m.cue.lesson)}` }).range(m.cue.from, m.cue.to),
    ),
  )

  const head = view.state.selection.main.head
  const found = findDropIns(doc, known)
  const misses = findNearMisses(doc, known, { found, english })
  typing = misses.find((m) => head >= m.from && head <= m.to) ?? null
  const items: ReadItem[] = [
    ...found.map((drop) => ({ from: drop.from, to: drop.to, text: doc.slice(drop.from, drop.to), drop })),
    ...misses.filter((m) => m !== typing).map((miss) => ({ from: miss.from, to: miss.to, text: miss.text, miss })),
  ]
  const deco = Decoration.set(
    items.map((i) => Decoration.mark({ class: i.drop ? 'cl-dropin' : 'cl-near' }).range(i.from, i.to)),
    true,
  )
  view.dispatch({ effects: [setMarks.of(decorations), setReadBack.of({ items, deco })] })
}

function scheduleRescan() {
  window.clearTimeout(scanTimer)
  scanTimer = window.setTimeout(rescan, SCAN_IDLE_MS)
}

function markAt(pos: number): Mark | undefined {
  return marks.value.find((m) => pos >= m.cue.from && pos <= m.cue.to)
}

// ---------------------------------------------------------------- card

type Place = { pinned: boolean; top: number; left: number }
type Active =
  | (Place & { kind: 'cue'; mark: Mark; cue: Cue })
  | (Place & { kind: 'command'; command: CommandAt; spec: EditorCommand })
const active = shallowRef<Active | null>(null)
const card = ref<InstanceType<typeof ClaritishCard> | null>(null)
let hoverTimer = 0

const activeCue = computed(() => (active.value?.kind === 'cue' ? active.value.cue : undefined))
const activeCommand = computed(() => (active.value?.kind === 'command' ? active.value : undefined))
const activeTrigger = computed(() => (activeCue.value ? triggerById.get(activeCue.value.trigger) : undefined))
const activeFlow = computed(() => {
  const id = activeCommand.value?.spec.flow ?? activeTrigger.value?.flow
  return id ? data.flows[id] : undefined
})
const activeLesson = computed(() => (activeFlow.value ? lessonById.get(activeFlow.value.lesson) : undefined))
const activeAlso = computed(() => {
  const a = active.value
  if (a?.kind !== 'cue') return []
  return [a.mark.cue, ...a.mark.also].filter((c) => c !== a.cue)
})

function placeAt(pos: number): Omit<Place, 'pinned'> {
  const coords = view!.coordsAtPos(pos)
  const box = wrap.value!.getBoundingClientRect()
  const top = coords ? coords.bottom - box.top + 6 : 0
  const left = coords ? Math.max(0, Math.min(coords.left - box.left, box.width - 480)) : 0
  return { top, left }
}

function open(mark: Mark, cue: Cue, pinned: boolean) {
  if (!view || !wrap.value) return
  active.value = { kind: 'cue', mark, cue, pinned, ...placeAt(cue.from) }
}

async function focusCard() {
  await nextTick()
  await card.value?.focus()
}

async function openPinned(mark: Mark, cue: Cue = mark.cue) {
  open(mark, cue, true)
  await focusCard()
}

function openCommand(spec: EditorCommand, from: number, to: number) {
  if (!view || !wrap.value) return
  closeCompletion(view)
  const line = view.state.doc.lineAt(from)
  const command: CommandAt = { name: spec.name, from, to, line: line.text, lineFrom: line.from }
  active.value = { kind: 'command', command, spec, pinned: true, ...placeAt(from) }
  void focusCard()
}

function close(refocus = true) {
  const a = active.value
  active.value = null
  if (refocus && view && a?.pinned) {
    view.focus()
    const at = a.kind === 'cue' ? a.cue.to : a.command.to
    view.dispatch({ selection: { anchor: Math.min(at, view.state.doc.length) } })
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

/** *Leave it in English*: a cue stays unmarked; a command's text goes away. */
function leave() {
  const a = active.value
  if (!a) return
  if (a.kind === 'command') {
    active.value = null
    view?.dispatch({ changes: { from: a.command.from, to: a.command.to }, selection: { anchor: a.command.from } })
    view?.focus()
    return
  }
  dismissed.value = new Set([...dismissed.value, dismissKey(a.cue)])
  save(STORE.dismissed, [...dismissed.value])
  close()
  rescan()
}

function neverFlag() {
  const a = active.value
  if (a?.kind !== 'cue') return
  never.value = new Set([...never.value, normalize(a.cue.text)])
  save(STORE.never, [...never.value])
  close()
  rescan()
}

function switchCue(cue: Cue) {
  const a = active.value
  if (a?.kind === 'cue') void openPinned(a.mark, cue)
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

// ---------------------------------------------------------------- slash commands and autocomplete

/** `/name` right before `pos`, at the start of a line or after a space. */
function commandBefore(state: EditorState, pos: number): { spec: EditorCommand; from: number } | undefined {
  const line = state.doc.lineAt(pos)
  const m = /(?:^|[\s"“(])\/([a-z]+)$/.exec(line.text.slice(0, pos - line.from))
  const spec = m ? commandByName.get(m[1]!) : undefined
  return spec ? { spec, from: pos - m![1]!.length - 1 } : undefined
}

function commandSource(ctx: CompletionContext): CompletionResult | null {
  const word = ctx.matchBefore(/\/[a-z]*/)
  if (!word) return null
  const before = ctx.state.sliceDoc(word.from - 1, word.from)
  if (before && !/[\s"“(]/.test(before)) return null
  const options: Completion[] = data.commands.map((spec) => ({
    label: `/${spec.name}`,
    detail: spec.hint,
    type: 'command',
    apply: (v: EditorView, _c: Completion, from: number, to: number) => {
      v.dispatch({ changes: { from, to, insert: `/${spec.name}` }, selection: { anchor: from + spec.name.length + 1 } })
      openCommand(spec, from, from + spec.name.length + 1)
    },
  }))
  return { from: word.from, options, validFor: /^\/[a-z]*$/ }
}

/** Forms of enabled lessons, for autocomplete. */
const offered = computed(() => [...enabled.value].flatMap((id) => formsOfLesson[id] ?? []).filter((f) => /^[\p{Ll}-]/u.test(f)))

function dropInOption(form: string): Completion {
  return { label: form, detail: glossary[form]?.gloss.join(' · '), type: 'dropin' }
}

function dropInSource(ctx: CompletionContext): CompletionResult | null {
  const hyphen = ctx.matchBefore(/\p{L}+-\p{Ll}*/u)
  if (hyphen) {
    const at = hyphen.text.lastIndexOf('-')
    const typed = hyphen.text.slice(at)
    const forms = offered.value.filter((f) => f.startsWith('-') && f.startsWith(typed))
    return forms.length ? { from: hyphen.from + at, options: forms.map(dropInOption), validFor: /^-\p{Ll}*$/u } : null
  }
  const word = ctx.matchBefore(/\p{L}+/u)
  if (!word || !/^\p{Ll}+$/u.test(word.text) || english.has(word.text)) return null
  if (word.text.length < data.autocompleteMin && !ctx.explicit) return null
  const forms = offered.value.filter((f) => f.startsWith(word.text) && f !== word.text)
  return forms.length ? { from: word.from, options: forms.map(dropInOption), validFor: /^\p{Ll}*$/u } : null
}

/** Tab takes a suggestion; Enter takes only a command, so an English line break never becomes a drop-in. */
const completionKeys = keymap.of([
  { key: 'Tab', run: acceptCompletion },
  {
    key: 'Enter',
    run: (v) => completionStatus(v.state) === 'active' && selectedCompletion(v.state)?.type === 'command' && acceptCompletion(v),
  },
  { key: 'ArrowDown', run: moveCompletionSelection(true) },
  { key: 'ArrowUp', run: moveCompletionSelection(false) },
  { key: 'PageDown', run: moveCompletionSelection(true, 'page') },
  { key: 'PageUp', run: moveCompletionSelection(false, 'page') },
  { key: 'Escape', run: closeCompletion },
  { key: 'Ctrl-Space', run: startCompletion },
])

// ---------------------------------------------------------------- keyboard

function step(direction: 1 | -1): boolean {
  if (!view || !marks.value.length) return false
  const pos = view.state.selection.main.head
  const list = direction === 1 ? marks.value : [...marks.value].reverse()
  const next = list.find((m) => (direction === 1 ? m.cue.from > pos : m.cue.to < pos)) ?? list[0]!
  view.dispatch({ selection: { anchor: next.cue.from, head: next.cue.to }, scrollIntoView: true })
  const lesson = lessonById.get(next.cue.lesson)
  announce.value = `“${next.cue.text}”, ${lesson?.title ?? ''}. Alt+Enter opens its card.`
  return true
}

/** Alt+Enter: a command just typed, a near miss under the cursor, or the mark in the cursor's sentence. */
function openAtCursor(): boolean {
  if (!view) return false
  const pos = view.state.selection.main.head
  const command = commandBefore(view.state, pos)
  if (command) {
    openCommand(command.spec, command.from, pos)
    return true
  }
  const item = readItemAt(view.state, pos)
  if (item?.miss) {
    replaceWith(view, item, item.miss.suggestions[0]!)
    return true
  }
  if (!marks.value.length) return false
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
  if (activeCue.value && next.has(activeCue.value.lesson)) close(false)
  rescan()
}

function loadSample() {
  if (!view) return
  view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: SAMPLE } })
  view.focus()
}

// ---------------------------------------------------------------- mirror

const mirrorOpen = ref(true)

/** The cues still in plain English, grouped by habit, in the order they first appear. */
const mirrorLines = computed(() => {
  const groups = new Map<string, { text: [string, string]; lesson: string; cues: Cue[] }>()
  for (const mark of marks.value) {
    for (const cue of [mark.cue, ...mark.also]) {
      const trigger = triggerById.get(cue.trigger)!
      const key = trigger.mirror[0]
      const group = groups.get(key) ?? { text: trigger.mirror, lesson: trigger.lesson, cues: [] }
      group.cues.push(cue)
      groups.set(key, group)
    }
  }
  return [...groups.values()].map((g) => ({
    key: g.text[0],
    label: `${g.cues.length} ${g.cues.length === 1 ? g.text[0] : g.text[1]}`,
    tone: toneOf(g.lesson),
    cues: [...g.cues].sort((a, b) => a.from - b.from),
  }))
})

function setMirror(open: boolean) {
  mirrorOpen.value = open
  save(STORE.mirror, open)
}

/** The next cue of a line after the cursor, wrapping. */
function jumpTo(cues: Cue[]) {
  if (!view || !cues.length) return
  const pos = view.state.selection.main.head
  const cue = cues.find((c) => c.from > pos) ?? cues[0]!
  view.dispatch({ selection: { anchor: cue.from, head: cue.to }, scrollIntoView: true })
  view.focus()
  announce.value = `“${cue.text}”. Alt+Enter opens its card.`
}

// ---------------------------------------------------------------- practice

type PracticeAt = { lesson: string; index: number }
type PracticeCheck = { same: boolean; yours: { text: string; gloss: string }[]; lesson: { form: string; gloss: string }[] }
const practice = ref<PracticeAt | null>(null)
const checked = shallowRef<PracticeCheck | null>(null)
let journal = ''

const practiceItem = computed(() => (practice.value ? data.practice[practice.value.lesson]?.[practice.value.index] : undefined))
const practiceCount = computed(() => (practice.value ? data.practice[practice.value.lesson]?.length ?? 0 : 0))
const practiceLessons = computed(() => data.lessons.filter((l) => data.practice[l.id]?.length))

/** Swap the whole text, with a fresh undo history, so practice and the journal never undo into each other. */
function setDoc(text: string) {
  if (!view) return
  active.value = null
  view.setState(EditorState.create({ doc: text, extensions }))
  isEmpty.value = text.length === 0
  rescan()
}

function startPractice(lesson: string) {
  if (!view) return
  if (!practice.value) {
    journal = view.state.doc.toString()
    save(STORE.draft, journal)
  }
  practice.value = { lesson, index: 0 }
  showItem()
}

function showItem() {
  checked.value = null
  setDoc(practiceItem.value?.prompt ?? '')
  view?.focus()
  view?.dispatch({ selection: { anchor: view.state.doc.length } })
}

function nextItem() {
  if (!practice.value) return
  practice.value = { ...practice.value, index: (practice.value.index + 1) % practiceCount.value }
  showItem()
}

function stopPractice() {
  practice.value = null
  checked.value = null
  setDoc(journal)
  view?.focus()
}

function checkPractice() {
  const item = practiceItem.value
  if (!view || !item) return
  const written = view.state.doc.toString()
  const yours = findDropIns(written, known)
  checked.value = {
    same: sameDropIns(yours.map((d) => d.form), item.forms),
    yours: yours.map((d) => ({ text: written.slice(d.from, d.to), gloss: glossOf(d) })),
    lesson: item.forms.map((form) => ({ form, gloss: glossOf({ form, marks: /^\p{L}|^-/u.test(form) ? undefined : [...new Set(form)] }) })),
  }
}

function onPracticeLesson(event: Event) {
  startPractice((event.target as HTMLSelectElement).value)
}

// ---------------------------------------------------------------- setup

onMounted(() => {
  off.value = new Set(load<string[]>(STORE.off, []))
  never.value = new Set(load<string[]>(STORE.never, []))
  dismissed.value = new Set(load<string[]>(STORE.dismissed, []))
  mirrorOpen.value = load<boolean>(STORE.mirror, true)
  const draft = load<string>(STORE.draft, '')

  extensions = [
    history(),
    Prec.highest(completionKeys),
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
    autocompletion({ override: [commandSource, dropInSource], defaultKeymap: false, icons: false }),
    markField,
    readField,
    cursorTip,
    hoverTip,
    EditorView.lineWrapping,
    placeholder('Write or paste a journal entry…'),
    EditorView.contentAttributes.of({ 'aria-label': 'Journal entry', 'aria-describedby': 'claritish-editor-keys', spellcheck: 'true' }),
    EditorView.updateListener.of((update) => {
      if (!update.docChanged) {
        // The cursor left a word it was typing: look at that word again.
        const head = update.state.selection.main.head
        if (update.selectionSet && typing && (head < typing.from || head > typing.to)) scheduleRescan()
        return
      }
      isEmpty.value = update.state.doc.length === 0
      if (active.value) close(false)
      scheduleRescan()
      if (practice.value) return
      window.clearTimeout(saveTimer)
      saveTimer = window.setTimeout(() => save(STORE.draft, update.state.doc.toString()), SAVE_IDLE_MS)
    }),
    EditorView.domEventHandlers({
      mousemove(event, v) {
        const pos = v.posAtCoords({ x: event.clientX, y: event.clientY })
        const mark = pos === null ? undefined : markAt(pos)
        window.clearTimeout(hoverTimer)
        if (mark && active.value?.kind === 'cue' && active.value.cue === mark.cue) return
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
  if (practice.value) save(STORE.draft, journal)
  else if (saveTimer && view) {
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

    <section v-if="practice && practiceItem" class="practice" aria-label="Practice">
      <div class="practice-head">
        <label for="cl-practice-lesson">
          Practice
          <select id="cl-practice-lesson" :value="practice.lesson" @change="onPracticeLesson">
            <option v-for="lesson in practiceLessons" :key="lesson.id" :value="lesson.id">{{ lesson.title }}</option>
          </select>
        </label>
        <span class="count">{{ practice.index + 1 }} of {{ practiceCount }}</span>
      </div>
      <p class="note">
        Add the drop-in that fits the note<template v-if="practiceItem.note">: <em>{{ practiceItem.note }}</em></template>.
      </p>
      <div class="practice-actions">
        <button type="button" class="action" @click="checkPractice">Compare with the lesson</button>
        <button type="button" class="action" @click="nextItem">Next</button>
        <button type="button" class="link" @click="stopPractice">Back to my journal</button>
      </div>
      <div v-if="checked" class="result" aria-live="polite">
        <p v-if="checked.same">Same drop-in as the lesson: {{ practiceItem.answer }}</p>
        <template v-else>
          <p>
            The lesson wrote: {{ practiceItem.answer }}
            <span v-for="f in checked.lesson" :key="f.form" class="gloss"><code>{{ f.form }}</code> {{ f.gloss }}</span>
          </p>
          <p v-if="checked.yours.length">
            Yours:
            <span v-for="(f, i) in checked.yours" :key="i" class="gloss"><code>{{ f.text }}</code> {{ f.gloss }}</span>.
            If yours fits the note too, it counts.
          </p>
          <p v-else>No drop-in in yours yet.</p>
        </template>
      </div>
    </section>

    <div :class="['body', { 'with-mirror': mirrorOpen }]">
      <div ref="wrap" class="wrap" @focusout="onFocusOut">
        <div ref="host" class="host" />
        <ClaritishCard
          v-if="active && activeFlow && activeLesson"
          ref="card"
          class="floating"
          :style="{ top: `${active.top}px`, left: `${active.left}px` }"
          :cue="activeCue"
          :trigger="activeTrigger"
          :command="activeCommand?.command"
          :command-defaults="activeCommand?.spec.defaults"
          :word-defaults="data.wordDefaults"
          :also="activeAlso"
          :flow="activeFlow"
          :lesson="activeLesson"
          :tone="toneOf(activeFlow.lesson)"
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

      <aside v-if="mirrorOpen" class="mirror" aria-label="Mirror">
        <div class="mirror-head">
          <span>Still in plain English</span>
          <button type="button" class="close" aria-label="Close the mirror" @click="setMirror(false)">×</button>
        </div>
        <ul v-if="mirrorLines.length">
          <li v-for="line in mirrorLines" :key="line.key" :class="`cl-tone-${line.tone}`">
            <button type="button" @click="jumpTo(line.cues)"><span class="dot" aria-hidden="true" />{{ line.label }}</button>
          </li>
        </ul>
        <p v-else class="quiet">No marked phrases.</p>
      </aside>
    </div>

    <p id="claritish-editor-keys" class="keys">
      Hover a dotted phrase, or put the cursor on it and press <kbd>Alt</kbd>+<kbd>Enter</kbd>, to open its card.
      <kbd>Alt</kbd>+<kbd>↓</kbd> and <kbd>Alt</kbd>+<kbd>↑</kbd> move between marked phrases; <kbd>Esc</kbd> closes a card.
      Type <kbd>/</kbd> for a drop-in with no English cue (<code>/sure</code>, <code>/can</code>, <code>/tone</code>), and
      <kbd>Tab</kbd> to take a suggested drop-in.
    </p>
    <p class="sr-only" aria-live="polite">{{ announce }}</p>
    <div class="footer">
      <button v-if="isEmpty && !practice" type="button" class="link" @click="loadSample">Try a sample entry</button>
      <button v-if="!practice" type="button" class="link" @click="startPractice(practiceLessons[0]!.id)">Practice a lesson</button>
      <button v-if="!mirrorOpen" type="button" class="link" @click="setMirror(true)">Show the mirror</button>
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

/* A drop-in already written: a quiet tint, glossed on hover. */
.claritish-editor .cl-dropin {
  border-radius: 3px;
  background: var(--vp-c-default-soft);
}

/* Looks like a drop-in but is not one: a grey dashed line, never red. */
.claritish-editor .cl-near {
  text-decoration: underline dashed var(--vp-c-text-3);
  text-underline-offset: 4px;
  cursor: help;
}

.claritish-editor .cm-tooltip {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  box-shadow: var(--vp-shadow-2);
}

.claritish-editor .cl-tip {
  max-width: 22rem;
  padding: 0.45rem 0.65rem;
  font-family: var(--vp-font-family-base);
  font-size: 0.85rem;
  line-height: 1.45;
}

.claritish-editor .cl-tip p {
  margin: 0;
}

.claritish-editor .cl-tip-meta,
.claritish-editor .cl-tip-ipa {
  margin-top: 0.2rem !important;
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
}

.claritish-editor .cl-tip-ipa {
  font-family: var(--vp-font-family-mono);
}

.claritish-editor .cl-tip-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.35rem !important;
}

.claritish-editor .cl-tip-actions button {
  padding: 0.1rem 0.55rem;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 6px;
  color: var(--vp-c-brand-1);
  font: inherit;
  cursor: pointer;
}

.claritish-editor .cm-tooltip-autocomplete > ul {
  font-family: var(--vp-font-family-base);
  font-size: 0.9rem;
}

.claritish-editor .cm-tooltip-autocomplete > ul > li[aria-selected] {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-text-1);
}

.claritish-editor .cm-completionDetail {
  margin-left: 0.6rem;
  color: var(--vp-c-text-2);
  font-style: normal;
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

.body {
  display: grid;
  gap: 0.75rem;
}

@media (min-width: 960px) {
  .body.with-mirror {
    grid-template-columns: minmax(0, 1fr) 14rem;
    align-items: start;
  }
}

.wrap {
  position: relative;
  min-width: 0;
}

.mirror {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  font-size: 0.85rem;
}

.mirror-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--vp-c-text-2);
}

.mirror-head .close {
  padding: 0 0.3rem;
  border: 0;
  background: none;
  color: var(--vp-c-text-2);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
}

.mirror ul {
  margin: 0.4rem 0 0;
  padding: 0;
  list-style: none;
}

.mirror li {
  margin: 0.15rem 0;
}

.mirror li button {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  padding: 0.1rem 0;
  border: 0;
  background: none;
  color: var(--vp-c-text-1);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.mirror li button:hover {
  text-decoration: underline;
}

.mirror .dot {
  flex: none;
  background: var(--cl-tone);
}

.quiet {
  margin: 0.4rem 0 0;
  color: var(--vp-c-text-3);
}

.practice {
  margin-bottom: 0.65rem;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  font-size: 0.9rem;
}

.practice-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem 0.6rem;
  font-weight: 600;
}

.practice-head label {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}

.practice-head select {
  padding: 0.15rem 0.4rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font: inherit;
  font-weight: 400;
}

.count {
  color: var(--vp-c-text-2);
  font-weight: 400;
}

.note {
  margin: 0.4rem 0;
}

.practice-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem 0.7rem;
}

.action {
  padding: 0.25rem 0.7rem;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
  font: inherit;
  cursor: pointer;
}

.result p {
  margin: 0.5rem 0 0;
}

.result .gloss {
  margin-left: 0.4rem;
  color: var(--vp-c-text-2);
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

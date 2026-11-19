<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { InspectConstruction, InspectResult, InspectToken } from '@parse-browser'
import { inspectNotes, notesForToken, type FrameNote, type InspectNotes } from '@interpret-browser'
import { withBase } from 'vitepress'
import { useClassifyTables } from '../composables/useClassifyTables'
import InspectCard from './InspectCard.vue'
import { computePopoverPlacement } from './popoverPlacement'
import { getInspectAnchorRect, tokenElement } from './selectionAnchorRect'
import {
  endingChipIndex,
  findCoveringConstruction,
  normalizeTokenRange,
  selectionToTokenRange,
} from './selectionToTokens'

const props = defineProps<{
  result: InspectResult
  initialPinned?: boolean
}>()


const overlayRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
const hoverTipRef = ref<HTMLElement | null>(null)
const selected = ref(-1)
const inspectRange = ref<{ start: number; end: number } | null>(null)
const constructionIndex = ref<number | null>(null)
const phraseSelection = ref<{ raws: string[]; glosses: string[] } | null>(null)
const pinned = ref(false)
const peekOpen = ref(false)
const hovered = ref<number | null>(null)
const copied = ref(false)
const domSelectionActive = ref(false)
const highlightedChipIndex = ref<number | null>(null)
const popoverStyle = ref<Record<string, string>>({ top: '0px', left: '0px' })
const hoverTipStyle = ref<Record<string, string>>({ top: '0px', left: '0px' })
const popoverPlacement = ref<'above' | 'below'>('below')

const tokens = computed(() => props.result.tokens)
const constructions = computed(() => props.result.constructions)

/** Phrase-bracket opens before a word: label (`NAME`, `SCOPE`) + `[` (glosses.md § Phrase brackets). */
function openMarks(token: InspectToken): { label: string }[] {
  if (token.kind !== 'word' || !token.brackets) return []
  return token.brackets.open.map((open) => ({ label: open.slice(0, -1) }))
}

/** The `{` token opening the island whose `SCOPE[` sits on word `index` (`{` itself is not drawn). */
function caretBefore(index: number): number | null {
  for (let i = index - 1; i >= 0; i--) {
    const token = props.result.tokens[i]!
    if (token.kind === 'island') return i
    if (token.kind === 'word' || token.kind === 'error') return null
  }
  return null
}

function closeMarks(token: InspectToken): string[] {
  return token.kind === 'word' && token.brackets ? token.brackets.close : []
}

const inspectable = computed(() =>
  tokens.value
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => token.kind === 'word' || token.kind === 'error' || token.kind === 'island'),
)

const selectedToken = computed(() => {
  if (selected.value < 0) return null
  return tokens.value[selected.value] ?? null
})

const selectedConstruction = computed<InspectConstruction | null>(() => {
  if (constructionIndex.value === null) return null
  return constructions.value[constructionIndex.value] ?? null
})

const constructionRaws = computed(() => {
  const group = selectedConstruction.value
  if (!group) return []
  return group.tokenIndices
    .map((i) => tokens.value[i]?.raw)
    .filter((raw): raw is string => Boolean(raw))
})

const highlighted = computed(() => {
  const group = selectedConstruction.value
  if (!group) return new Set<number>()
  return new Set(group.tokenIndices)
})

const hasInspectTarget = computed(
  () =>
    selected.value >= 0 ||
    selectedConstruction.value !== null ||
    phraseSelection.value !== null,
)

const showFloatingPeek = computed(() => peekOpen.value && hasInspectTarget.value && !pinned.value)

const showHoverTip = computed(
  () =>
    !domSelectionActive.value &&
    !peekOpen.value &&
    hovered.value !== null &&
    tokens.value[hovered.value]?.kind === 'word',
)

const anchorTokenIndices = computed(() => {
  const group = selectedConstruction.value
  if (group) return group.tokenIndices
  const range = inspectRange.value
  if (!range) return selected.value >= 0 ? [selected.value] : []
  const indices: number[] = []
  for (let index = range.start; index <= range.end; index += 1) indices.push(index)
  return indices
})

let pointerDownX = 0
let pointerDownY = 0
let didDrag = false
// Frame notes come from the reading of the parse inspectText already made; nothing new shows when it did not parse.
const { tables } = useClassifyTables()

const notes = computed<InspectNotes | null>(() => {
  const parsed = props.result.parsed
  if (!parsed) return null
  try {
    return inspectNotes(parsed, props.result.tokens, { tables: tables.value ?? undefined })
  } catch {
    return null
  }
})

const sentenceNotes = computed(() => notes.value?.sentences ?? [])

const selectedFrames = computed<FrameNote[]>(() => {
  if (!notes.value || selected.value < 0 || selectedConstruction.value || phraseSelection.value) return []
  return notesForToken(notes.value, selected.value)
})

function hoverTerm(index: number): string {
  if (!notes.value) return ''
  const terms = notesForToken(notes.value, index).flatMap((note) => (note.term ? [note.term] : []))
  return [...new Set(terms)].join(', ')
}

/** `page.md#heading` → the site's `/page#heading`. */
function siteHref(anchor: string): string {
  const [page = '', hash] = anchor.split('#')
  return withBase(`/${page.replace(/\.md$/, '.html')}${hash ? `#${hash}` : ''}`)
}

/** The quoted text of the frame whose first word is `first` (all its words). */
function frameWords(first: number): string {
  const frame = notes.value?.frames.find((note) => note.tokenIndex === first)
  const carried = sentenceNotes.value
    .flatMap((sentence) => sentence.carried)
    .find((note) => note.tokenIndex === first)
  const indices = frame?.tokenIndices ?? carried?.tokenIndices ?? [first]
  return `"${indices.map((i) => tokens.value[i]?.raw ?? '').join(' ')}"`
}

function wordList(firsts: number[]): string {
  return firsts.map(frameWords).join(', ')
}

let selectionTimer: number | undefined
let positionFrame: number | undefined

const DRAG_THRESHOLD = 5

watch(
  () => props.result,
  () => {
    selected.value = inspectable.value[0]?.index ?? -1
    inspectRange.value =
      selected.value >= 0 ? { start: selected.value, end: selected.value } : null
    constructionIndex.value = null
    phraseSelection.value = null
    pinned.value = Boolean(props.initialPinned)
    peekOpen.value = false
    hovered.value = null
    highlightedChipIndex.value = null
    domSelectionActive.value = false
  },
  { immediate: true },
)

watch(
  [showFloatingPeek, selected, constructionIndex, phraseSelection, pinned],
  () => {
    void schedulePopoverPosition()
  },
)

watch(showHoverTip, () => {
  void scheduleHoverTipPosition()
})

function endingClass(token: InspectToken): string {
  if (token.kind === 'error') return 'is-error'
  if (token.kind === 'island') return 'is-island'
  if (token.kind !== 'word' || !token.word.ending) return 'is-plain'
  return `ending-${token.word.ending}`
}

function triggerConstruction(index: number): number | undefined {
  return constructions.value.findIndex((group) => group.triggerIndices.includes(index))
}

function openPeek() {
  peekOpen.value = true
  void schedulePopoverPosition()
}

function select(index: number, pin = false) {
  const token = tokens.value[index]
  if (!token) return
  const groupIdx = triggerConstruction(index)
  const useGroup = groupIdx >= 0 && (token.kind === 'island' || token.kind === 'word')

  inspectRange.value = { start: index, end: index }

  if (pin || (selected.value === index && constructionIndex.value === (useGroup ? groupIdx : null) && !pinned.value)) {
    selected.value = index
    constructionIndex.value = useGroup ? groupIdx : null
    phraseSelection.value = null
    pinned.value = true
    peekOpen.value = false
    return
  }
  selected.value = index
  constructionIndex.value = useGroup ? groupIdx : null
  phraseSelection.value = null
  pinned.value = false
  openPeek()
}

function jump(index: number) {
  select(index)
}

function step(delta: number) {
  const list = inspectable.value
  if (list.length === 0) return
  const current = list.findIndex(({ index }) => index === selected.value)
  const next = list[(Math.max(current, 0) + delta + list.length) % list.length]
  if (next) select(next.index)
}

function copyText(): string {
  if (selectedConstruction.value) return constructionRaws.value.join(' ')
  if (phraseSelection.value) return phraseSelection.value.raws.join(' ')
  const token = selectedToken.value
  if (!token || token.kind === 'punct') return ''
  return token.raw
}

async function copyRaw() {
  const text = copyText()
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1200)
  } catch {
    copied.value = false
  }
}

function followWhy() {
  const token = selectedToken.value
  if (token?.kind !== 'word' || !token.why) return
  window.location.assign(token.why.href)
}

function updateDomSelectionState() {
  const root = overlayRef.value
  const selection = window.getSelection()
  domSelectionActive.value = Boolean(
    root && selection && !selection.isCollapsed && selectionToTokenRange(selection, root),
  )
}

function applyPartialWordHighlight(selection: Selection, index: number) {
  highlightedChipIndex.value = null
  const token = tokens.value[index]
  if (token?.kind !== 'word' || !token.word.ending) return
  highlightedChipIndex.value = endingChipIndex(
    token.raw,
    token.word.ending,
    token.chips,
    selection.anchorOffset,
    selection.focusOffset,
  )
}

function applySelection() {
  const root = overlayRef.value
  if (!root) return
  const selection = window.getSelection()
  const range = selectionToTokenRange(selection, root)
  updateDomSelectionState()
  if (!range) return

  const normalized = normalizeTokenRange(range, tokens.value)
  if (!normalized) return

  const { start, end } = normalized
  inspectRange.value = { start, end }

  if (start === end) {
    const token = tokens.value[start]
    if (!token) return
    select(start)
    if (selection) applyPartialWordHighlight(selection, start)
    return
  }

  highlightedChipIndex.value = null
  const constructionIdx = findCoveringConstruction(normalized, constructions.value)
  if (constructionIdx !== null) {
    selected.value = normalized.start
    constructionIndex.value = constructionIdx
    phraseSelection.value = null
    pinned.value = false
    openPeek()
    return
  }

  const raws: string[] = []
  const glosses: string[] = []
  for (let index = start; index <= end; index += 1) {
    const token = tokens.value[index]
    if (!token) continue
    if (token.kind === 'word') {
      raws.push(token.raw)
      glosses.push(token.gloss)
    } else if (token.kind === 'error') {
      raws.push(token.raw)
      glosses.push(token.error.message)
    } else if (token.kind === 'island') {
      raws.push(token.raw)
      glosses.push('island')
    } else if (token.kind === 'punct') {
      raws.push(token.raw)
    }
  }
  selected.value = start
  constructionIndex.value = null
  phraseSelection.value = { raws, glosses }
  pinned.value = false
  openPeek()
}

function onPointerDown(event: PointerEvent) {
  pointerDownX = event.clientX
  pointerDownY = event.clientY
  didDrag = false
}

function onPointerMove(event: PointerEvent) {
  if (Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY) > DRAG_THRESHOLD) {
    didDrag = true
  }
}

function onStreamMouseUp() {
  window.setTimeout(() => {
    if (didDrag) applySelection()
    else updateDomSelectionState()
  }, 0)
}

function onTokenClick(index: number) {
  if (didDrag) {
    didDrag = false
    return
  }
  phraseSelection.value = null
  highlightedChipIndex.value = null
  select(index)
}

function onSelectionChange() {
  window.clearTimeout(selectionTimer)
  selectionTimer = window.setTimeout(() => {
    const root = overlayRef.value
    const selection = window.getSelection()
    if (!root || !selection || selection.isCollapsed) {
      domSelectionActive.value = false
      return
    }
    if (!selectionToTokenRange(selection, root)) {
      domSelectionActive.value = false
      return
    }
    domSelectionActive.value = true
  }, 180)
}

function clearInspect() {
  window.getSelection()?.removeAllRanges()
  domSelectionActive.value = false
  peekOpen.value = false
  if (!pinned.value) {
    selected.value = -1
    inspectRange.value = null
    constructionIndex.value = null
    phraseSelection.value = null
    highlightedChipIndex.value = null
  }
}

async function schedulePopoverPosition() {
  window.cancelAnimationFrame(positionFrame ?? 0)
  positionFrame = window.requestAnimationFrame(async () => {
    await nextTick()
    const root = overlayRef.value
    const popover = popoverRef.value
    if (!root || !popover || !showFloatingPeek.value) return

    const anchor = getInspectAnchorRect(root, { tokenIndices: anchorTokenIndices.value })
    if (!anchor) return

    const rect = popover.getBoundingClientRect()
    const placement = computePopoverPlacement(anchor, rect.width || 280, rect.height || 160)
    popoverPlacement.value = placement.placement
    popoverStyle.value = {
      top: `${placement.top}px`,
      left: `${placement.left}px`,
    }
  })
}

async function scheduleHoverTipPosition() {
  await nextTick()
  const root = overlayRef.value
  const tip = hoverTipRef.value
  const index = hovered.value
  if (!root || !tip || index === null || !showHoverTip.value) return

  const element = tokenElement(root, index)
  if (!element) return

  const anchor = element.getBoundingClientRect()
  const rect = tip.getBoundingClientRect()
  const placement = computePopoverPlacement(anchor, rect.width || 120, rect.height || 28, 6)
  hoverTipStyle.value = {
    top: `${placement.top}px`,
    left: `${placement.left}px`,
  }
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!peekOpen.value || pinned.value) return
  const target = event.target
  if (!(target instanceof Node)) return
  if (overlayRef.value?.contains(target)) return
  if (popoverRef.value?.contains(target)) return
  peekOpen.value = false
}

function onReposition() {
  void schedulePopoverPosition()
  void scheduleHoverTipPosition()
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    clearInspect()
    return
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    step(-1)
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    step(1)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    if (selected.value >= 0) select(selected.value, true)
  } else if (event.key === 'g' || event.key === 'G') {
    if (event.metaKey || event.ctrlKey) return
    event.preventDefault()
    followWhy()
  } else if (event.key === 'c' || event.key === 'C') {
    if (event.metaKey || event.ctrlKey) return
    event.preventDefault()
    void copyRaw()
  }
}

function clickable(token: InspectToken): boolean {
  return token.kind === 'word' || token.kind === 'error' || token.kind === 'island'
}

onMounted(() => {
  document.addEventListener('selectionchange', onSelectionChange)
  document.addEventListener('pointerdown', onDocumentPointerDown)
  window.addEventListener('resize', onReposition)
  window.addEventListener('scroll', onReposition, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('selectionchange', onSelectionChange)
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  window.removeEventListener('resize', onReposition)
  window.removeEventListener('scroll', onReposition, true)
  window.clearTimeout(selectionTimer)
  window.cancelAnimationFrame(positionFrame ?? 0)
})
</script>

<template>
  <div
    ref="overlayRef"
    class="overlay"
    role="region"
    aria-label="Ageben gloss overlay"
    tabindex="0"
    @keydown="onKey"
  >
    <p
      class="stream"
      aria-label="Ageben tokens"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @mouseup="onStreamMouseUp"
    >
      <template v-for="(token, index) in tokens" :key="`${token.start}-${token.raw}`">
        <template v-for="(mark, m) in openMarks(token)" :key="`o${m}`">
          <span
            v-if="mark.label === 'SCOPE' && caretBefore(index) !== null"
            class="bracket scope"
            role="button"
            tabindex="-1"
            title="scope island"
            @click="onTokenClick(caretBefore(index)!)"
          ><span class="bracket-label">SCOPE</span>[</span>
          <span v-else class="bracket" aria-hidden="true"
            ><span v-if="mark.label" class="bracket-label">{{ mark.label }}</span>[</span
          >
        </template>
        <span v-if="token.kind === 'island'" hidden :data-token-index="index" />
        <span
          v-else-if="clickable(token)"
          class="tok"
          :data-token-index="index"
          role="button"
          tabindex="-1"
          :class="[
            endingClass(token),
            {
              active: selected === index,
              pinned: pinned && selected === index,
              inGroup: highlighted.has(index),
            },
          ]"
          :title="token.kind === 'word' ? token.gloss : token.kind === 'error' ? token.error.message : 'island'"
          @mouseenter="hovered = index"
          @mouseleave="hovered = null"
          @click="onTokenClick(index)"
        >
          {{ token.raw }}
        </span>
        <span v-else class="tok punct" :data-token-index="index">{{ token.raw }}</span>
        <span
          v-for="(mark, m) in closeMarks(token)"
          :key="`c${m}`"
          class="bracket"
          aria-hidden="true"
        >{{ mark }}</span>
      </template>
    </p>

    <div v-if="sentenceNotes.length" class="sentence-notes" aria-label="What covers what">
      <ul v-for="sentence in sentenceNotes" :key="sentence.reading">
        <li v-for="pair in sentence.covers" :key="`c${pair.over}-${pair.under}`">
          {{ frameWords(pair.over) }} covers {{ frameWords(pair.under) }}
        </li>
        <li v-for="pair in sentence.unsettled" :key="`u${pair[0]}-${pair[1]}`">
          {{ frameWords(pair[0]) }} and {{ frameWords(pair[1]) }}: not settled
        </li>
        <li v-for="carried in sentence.carried" :key="`k${carried.tokenIndex}`">
          {{ frameWords(carried.tokenIndex) }}<template v-if="carried.term">
            (<a :href="siteHref(carried.termAnchor ?? carried.anchor)">{{ carried.term }}</a>)</template
          >
          <a :href="siteHref(carried.anchor)">carries over</a> from an earlier sentence<template
            v-if="carried.coveredBy.length"
            >, under {{ wordList(carried.coveredBy) }}</template
          >
        </li>
      </ul>
    </div>

    <aside v-if="pinned" class="pin" aria-label="Pinned morph">
      <InspectCard
        :token="selectedToken"
        :construction="selectedConstruction"
        :construction-raws="constructionRaws"
        :phrase-raws="phraseSelection?.raws"
        :phrase-glosses="phraseSelection?.glosses"
        :highlighted-chip-index="highlightedChipIndex"
        :expanded="true"
        @jump="jump"
      />
      <div v-if="selectedFrames.length" class="gloss-frame-notes">
        <p v-for="note in selectedFrames" :key="`${note.reading}:${note.tokenIndex}`">
          <a v-if="note.term" :href="siteHref(note.termAnchor ?? note.anchor)">{{ note.term }}</a>
          <template v-if="note.reachLine">{{ note.term ? ': reaches ' : 'Reaches ' }}{{ note.reachLine }}</template>
          <template v-if="note.covers.length"><br />Covers {{ wordList(note.covers) }}</template>
          <template v-if="note.coveredBy.length"><br />Under {{ wordList(note.coveredBy) }}</template>
          <br /><a class="more" :href="siteHref(note.anchor)">Section</a>
        </p>
      </div>
      <div class="actions pin-actions">
                <button type="button" class="btn" @click="copyRaw">
          {{ copied ? 'Copied' : 'Copy romanized' }}
        </button>
      </div>
    </aside>

    <Teleport to="body">
      <div
        v-if="showHoverTip"
        ref="hoverTipRef"
        class="hover-tip"
        :style="hoverTipStyle"
        role="tooltip"
      >
        {{ (tokens[hovered!] as { gloss: string }).gloss
        }}<template v-if="hoverTerm(hovered!)"> · {{ hoverTerm(hovered!) }}</template>
      </div>

      <div
        v-if="showFloatingPeek"
        ref="popoverRef"
        class="floating-peek"
        :class="`place-${popoverPlacement}`"
        :style="popoverStyle"
        role="dialog"
        aria-label="Gloss inspect"
      >
        <InspectCard
          :token="selectedConstruction || phraseSelection ? null : selectedToken"
          :construction="selectedConstruction"
          :construction-raws="constructionRaws"
          :phrase-raws="phraseSelection?.raws"
          :phrase-glosses="phraseSelection?.glosses"
          :highlighted-chip-index="highlightedChipIndex"
          :expanded="false"
          @jump="jump"
        />
        <div v-if="selectedFrames.length" class="gloss-frame-notes">
          <p v-for="note in selectedFrames" :key="`${note.reading}:${note.tokenIndex}`">
            <a v-if="note.term" :href="siteHref(note.termAnchor ?? note.anchor)">{{ note.term }}</a>
            <template v-if="note.reachLine">{{ note.term ? ': reaches ' : 'Reaches ' }}{{ note.reachLine }}</template>
            <template v-if="note.covers.length"><br />Covers {{ wordList(note.covers) }}</template>
            <template v-if="note.coveredBy.length"><br />Under {{ wordList(note.coveredBy) }}</template>
            <br /><a class="more" :href="siteHref(note.anchor)">Section</a>
          </p>
        </div>
        <div class="actions">
          <button type="button" class="btn" @click="select(selected, true)">Pin</button>
                    <button type="button" class="btn" :disabled="!copyText()" @click="copyRaw">
            {{ copied ? 'Copied' : 'Copy romanized' }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.bracket {
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  user-select: none;
}

.bracket.scope {
  cursor: pointer;
}

.bracket-label {
  margin-right: 0.1em;
  font-size: 0.7em;
  letter-spacing: 0.02em;
  vertical-align: 0.15em;
}

.overlay:focus {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 4px;
}

.stream {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.4rem 0.5rem;
  font-family: var(--vp-font-family-mono);
  font-size: 1.15rem;
  line-height: 1.9;
  margin: 0 0 0.75rem;
}

.tok {
  font: inherit;
  color: inherit;
  background: var(--vp-c-bg);
  cursor: pointer;
  padding: 0.12rem 0.45rem;
  border: 1px solid var(--vp-c-divider);
  border-bottom-width: 2px;
  border-radius: 4px;
  user-select: text;
}

.tok.punct {
  cursor: text;
  border-bottom-color: transparent;
  user-select: text;
}

.ending-l {
  border-bottom-color: var(--vp-c-text-2);
}
.ending-m {
  border-bottom-style: dashed;
  border-bottom-color: var(--vp-c-text-2);
}
.ending-n {
  border-bottom-color: var(--vp-c-brand-1);
}
.ending-r {
  border-bottom-style: dotted;
  border-bottom-color: var(--vp-c-brand-1);
}
.is-error {
  border-bottom-color: var(--vp-c-danger-1);
  color: var(--vp-c-danger-1);
}
.is-island {
  border-bottom-color: var(--vp-c-text-2);
}

.tok.active {
  background: var(--vp-c-bg-mute);
}
.tok.inGroup {
  background: var(--vp-c-bg-mute);
}
.tok.pinned {
  box-shadow: inset 0 -2px 0 var(--vp-c-brand-1);
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.btn {
  font: inherit;
  font-size: 0.85rem;
  padding: 0.35rem 0.7rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.pin {
  margin-top: 0.5rem;
}

.sentence-notes {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.sentence-notes ul {
  margin: 0 0 0.5rem;
}

.pin-actions {
  margin-top: 0.75rem;
}

@media (min-width: 880px) {
  .overlay {
    display: grid;
    grid-template-columns: 1fr minmax(16rem, 22rem);
    gap: 1.25rem;
    align-items: start;
  }

  .stream {
    grid-column: 1;
  }

  .sentence-notes {
    grid-column: 1;
  }

  .pin {
    grid-column: 2;
    grid-row: 1;
    margin-top: 0;
  }
}
</style>

<style>
.hover-tip {
  position: fixed;
  z-index: 200;
  max-width: min(20rem, calc(100vw - 1rem));
  padding: 0.3rem 0.55rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
  line-height: 1.35;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  pointer-events: none;
}

.gloss-frame-notes {
  margin: 0.5rem 0.75rem 0;
  font-size: 0.85rem;
  line-height: 1.45;
  color: var(--vp-c-text-2);
}

.gloss-frame-notes p {
  margin: 0 0 0.4rem;
}

.gloss-frame-notes .more {
  font-size: 0.8rem;
}

.floating-peek {
  position: fixed;
  z-index: 210;
  width: min(22rem, calc(100vw - 1rem));
  padding: 0.25rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.16);
}

.floating-peek.place-below::before,
.floating-peek.place-above::before {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  border: 7px solid transparent;
}

.floating-peek.place-below::before {
  top: -14px;
  border-bottom-color: var(--vp-c-divider);
}

.floating-peek.place-above::before {
  bottom: -14px;
  border-top-color: var(--vp-c-divider);
}
</style>

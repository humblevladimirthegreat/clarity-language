<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { InspectConstruction, InspectResult, InspectToken } from '@parse-browser'
import InspectCard from './InspectCard.vue'
import { computePopoverPlacement } from './popoverPlacement'
import { getInspectAnchorRect, tokenElement } from './selectionAnchorRect'
import {
  endingChipIndex,
  findCoveringConstruction,
  normalizeTokenRange,
  selectionToTokenRange,
} from './selectionToTokens'
import { useAgelanSpeak } from '../composables/useAgelanSpeak'

const props = defineProps<{
  result: InspectResult
  initialPinned?: boolean
}>()

const { busy, speakText } = useAgelanSpeak()

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

function speakSelection() {
  const text = copyText()
  if (!text) return
  void speakText(text)
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
  } else if (event.key === 's' || event.key === 'S') {
    if (event.metaKey || event.ctrlKey) return
    event.preventDefault()
    speakSelection()
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
  <div ref="overlayRef" class="overlay" tabindex="0" @keydown="onKey">
    <p
      class="stream"
      aria-label="Agelan tokens"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @mouseup="onStreamMouseUp"
    >
      <template v-for="(token, index) in tokens" :key="`${token.start}-${token.raw}`">
        <span
          v-if="clickable(token)"
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
      </template>
    </p>

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
      <div class="actions pin-actions">
        <button type="button" class="btn" :disabled="!copyText()" @click="speakSelection">
          {{ busy ? 'Stop' : 'Speak word' }}
        </button>
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
        {{ (tokens[hovered!] as { gloss: string }).gloss }}
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
        <div class="actions">
          <button type="button" class="btn" @click="select(selected, true)">Pin</button>
          <button type="button" class="btn" :disabled="!copyText()" @click="speakSelection">
            {{ busy ? 'Stop' : 'Speak word' }}
          </button>
          <button type="button" class="btn" :disabled="!copyText()" @click="copyRaw">
            {{ copied ? 'Copied' : 'Copy romanized' }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
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

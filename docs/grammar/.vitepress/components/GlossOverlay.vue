<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { InspectConstruction, InspectResult, InspectToken } from '@parse-browser'
import InspectCard from './InspectCard.vue'

const props = defineProps<{
  result: InspectResult
  initialPinned?: boolean
}>()

const selected = ref(0)
const constructionIndex = ref<number | null>(null)
const pinned = ref(false)
const hovered = ref<number | null>(null)
const copied = ref(false)

const tokens = computed(() => props.result.tokens)
const constructions = computed(() => props.result.constructions)

const inspectable = computed(() =>
  tokens.value
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => token.kind === 'word' || token.kind === 'error' || token.kind === 'island'),
)

const selectedToken = computed(() => tokens.value[selected.value] ?? null)

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

watch(
  () => props.result,
  () => {
    selected.value = inspectable.value[0]?.index ?? 0
    constructionIndex.value = null
    pinned.value = Boolean(props.initialPinned)
    hovered.value = null
  },
  { immediate: true },
)

function endingClass(token: InspectToken): string {
  if (token.kind === 'error') return 'is-error'
  if (token.kind === 'island') return 'is-island'
  if (token.kind !== 'word' || !token.word.ending) return 'is-plain'
  return `ending-${token.word.ending}`
}

function triggerConstruction(index: number): number | undefined {
  return constructions.value.findIndex((group) => group.triggerIndices.includes(index))
}

function select(index: number, pin = false) {
  const token = tokens.value[index]
  if (!token) return
  const groupIdx = triggerConstruction(index)
  const useGroup = groupIdx >= 0 && (token.kind === 'island' || token.kind === 'word')

  if (pin || (selected.value === index && constructionIndex.value === (useGroup ? groupIdx : null) && !pinned.value)) {
    selected.value = index
    constructionIndex.value = useGroup ? groupIdx : null
    pinned.value = true
    return
  }
  selected.value = index
  constructionIndex.value = useGroup ? groupIdx : null
  pinned.value = false
}

function jump(index: number) {
  select(index)
}

function step(delta: number) {
  const list = inspectable.value
  if (list.length === 0) return
  const current = list.findIndex(({ index }) => index === selected.value)
  const next = list[(current + delta + list.length) % list.length]
  if (next) select(next.index)
}

function copyText(): string {
  if (selectedConstruction.value) return constructionRaws.value.join(' ')
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

function onKey(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    step(-1)
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    step(1)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    select(selected.value, true)
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
</script>

<template>
  <div class="overlay" tabindex="0" @keydown="onKey">
    <p class="stream" aria-label="Agelan tokens">
      <template v-for="(token, index) in tokens" :key="`${token.start}-${token.raw}`">
        <button
          v-if="clickable(token)"
          type="button"
          class="tok"
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
          @click="select(index)"
        >
          {{ token.raw }}
        </button>
        <span v-else class="tok punct">{{ token.raw }}</span>
      </template>
    </p>

    <p v-if="hovered !== null && tokens[hovered]?.kind === 'word'" class="hover-gloss">
      {{ (tokens[hovered] as { gloss: string }).gloss }}
    </p>

    <div class="peek">
      <InspectCard
        :token="selectedConstruction ? null : selectedToken"
        :construction="selectedConstruction"
        :construction-raws="constructionRaws"
        :expanded="false"
        @jump="jump"
      />
      <div class="actions">
        <button type="button" class="btn" @click="select(selected, true)">Pin</button>
        <button type="button" class="btn" @click="copyRaw">
          {{ copied ? 'Copied' : 'Copy romanized' }}
        </button>
      </div>
    </div>

    <aside v-if="pinned" class="pin" aria-label="Pinned morph">
      <InspectCard
        :token="selectedToken"
        :construction="null"
        :expanded="true"
        @jump="jump"
      />
    </aside>
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
}

.tok.punct {
  cursor: default;
  border-bottom-color: transparent;
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

.hover-gloss {
  min-height: 1.4em;
  margin: 0 0 0.75rem;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.peek {
  display: grid;
  gap: 0.75rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
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

.pin {
  margin-top: 1rem;
}

@media (min-width: 880px) {
  .overlay {
    display: grid;
    grid-template-columns: 1fr minmax(16rem, 22rem);
    gap: 1.25rem;
    align-items: start;
  }

  .stream,
  .hover-gloss,
  .peek {
    grid-column: 1;
  }

  .pin {
    grid-column: 2;
    grid-row: 1 / span 4;
    margin-top: 0;
  }
}
</style>

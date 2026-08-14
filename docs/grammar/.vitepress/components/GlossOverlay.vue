<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { InspectToken } from '@parse-browser'
import InspectCard from './InspectCard.vue'

const props = defineProps<{
  tokens: InspectToken[]
}>()

const selected = ref(0)
const pinned = ref(false)
const hovered = ref<number | null>(null)
const copied = ref(false)
const root = ref<HTMLElement | null>(null)

const inspectable = computed(() =>
  props.tokens
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => token.kind === 'word' || token.kind === 'error'),
)

const selectedToken = computed(() => props.tokens[selected.value] ?? null)

watch(
  () => props.tokens,
  () => {
    selected.value = inspectable.value[0]?.index ?? 0
    pinned.value = false
    hovered.value = null
  },
)

function endingClass(token: InspectToken): string {
  if (token.kind === 'error') return 'is-error'
  if (token.kind !== 'word' || !token.word.ending) return 'is-plain'
  return `ending-${token.word.ending}`
}

function select(index: number, pin = false) {
  const token = props.tokens[index]
  if (!token || (token.kind !== 'word' && token.kind !== 'error')) return
  if (pin || (selected.value === index && !pinned.value)) {
    selected.value = index
    pinned.value = true
    return
  }
  selected.value = index
  pinned.value = false
}

function step(delta: number) {
  const list = inspectable.value
  if (list.length === 0) return
  const current = list.findIndex(({ index }) => index === selected.value)
  const next = list[(current + delta + list.length) % list.length]
  if (next) select(next.index)
}

async function copyRaw() {
  const token = selectedToken.value
  if (!token || token.kind === 'punct' || token.kind === 'island') return
  try {
    await navigator.clipboard.writeText(token.raw)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1200)
  } catch {
    copied.value = false
  }
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
  } else if (event.key === 'c' || event.key === 'C') {
    if (event.metaKey || event.ctrlKey) return
    event.preventDefault()
    void copyRaw()
  }
}
</script>

<template>
  <div
    ref="root"
    class="overlay"
    tabindex="0"
    @keydown="onKey"
  >
    <p class="stream" aria-label="Agelan tokens">
      <template v-for="(token, index) in tokens" :key="`${token.start}-${token.raw}`">
        <button
          v-if="token.kind === 'word' || token.kind === 'error'"
          type="button"
          class="tok"
          :class="[endingClass(token), { active: selected === index, pinned: pinned && selected === index }]"
          :title="token.kind === 'word' ? token.gloss : token.error.message"
          @mouseenter="hovered = index"
          @mouseleave="hovered = null"
          @click="select(index)"
        >
          {{ token.raw }}
        </button>
        <span v-else class="tok punct">{{ token.raw }}</span>
        <span class="gap"> </span>
      </template>
    </p>

    <p v-if="hovered !== null && tokens[hovered]?.kind === 'word'" class="hover-gloss">
      {{ (tokens[hovered] as { gloss: string }).gloss }}
    </p>

    <div class="peek">
      <InspectCard :token="selectedToken" :expanded="false" />
      <div class="actions">
        <button type="button" class="btn" @click="select(selected, true)">Pin</button>
        <button type="button" class="btn" @click="copyRaw">
          {{ copied ? 'Copied' : 'Copy romanized' }}
        </button>
      </div>
    </div>

    <aside v-if="pinned" class="pin" aria-label="Pinned morph">
      <InspectCard :token="selectedToken" :expanded="true" />
    </aside>
  </div>
</template>

<style scoped>
.overlay:focus {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 4px;
}

.stream {
  font-family: var(--vp-font-family-mono);
  font-size: 1.15rem;
  line-height: 1.9;
  margin: 0 0 0.75rem;
}

.tok {
  font: inherit;
  color: inherit;
  background: transparent;
  border: none;
  padding: 0 0 0.12rem;
  cursor: pointer;
  border-bottom: 2px solid var(--vp-c-divider);
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

.tok.active {
  background: var(--vp-c-bg-mute);
  border-radius: 3px;
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

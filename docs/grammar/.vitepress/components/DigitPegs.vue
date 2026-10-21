<script setup lang="ts">
import { computed, ref } from 'vue'
import publishedCsv from '@data/lexicon-published.csv?raw'
import { isDigitInput, pegBank, suggestPegs, wordDigits, type ChunkPegs, type WordDigits } from '@digit-pegs'
import { parsePublishedCsv } from '@lexicon-search'
import { classifyAll, parseWords } from '@parse-browser'
import { useClassifyTables } from '../composables/useClassifyTables'

const DEBOUNCE_MS = 150
const SHOWN = 6

const { tables, status, errorMessage } = useClassifyTables()
const bank = pegBank(parsePublishedCsv(publishedCsv))
const query = ref('')
const expanded = ref(new Set<string>())
let debounceTimer = 0

type Result =
  | { kind: 'digits'; chunks: ChunkPegs[] }
  | { kind: 'words'; words: WordDigits[] }
  | { kind: 'error'; message: string }

const result = computed<Result | null>(() => {
  const text = query.value.trim()
  if (!text) return null
  if (isDigitInput(text)) return { kind: 'digits', chunks: suggestPegs(text, bank) }
  if (!tables.value) return null
  try {
    return { kind: 'words', words: classifyAll(parseWords(text), tables.value).map(wordDigits) }
  } catch (err) {
    return { kind: 'error', message: err instanceof Error ? err.message : String(err) }
  }
})

const total = computed(() => {
  const r = result.value
  if (r?.kind !== 'words' || r.words.length < 2) return ''
  return r.words.map((word) => ('digits' in word ? word.digits : '·')).join(' ')
})

function shown(chunk: ChunkPegs, index: number): ChunkPegs['pegs'] {
  return expanded.value.has(`${index}`) ? chunk.pegs : chunk.pegs.slice(0, SHOWN)
}

function expand(index: number): void {
  expanded.value = new Set([...expanded.value, `${index}`])
}

function onInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value
  window.clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(() => {
    query.value = value
    expanded.value = new Set()
  }, DEBOUNCE_MS)
}
</script>

<template>
  <div class="digit-pegs">
    <label class="label" for="digit-pegs-input">
      Digits or Agebon
      <input
        id="digit-pegs-input"
        type="search"
        placeholder="2371, 555-1234, zudozol dabedol…"
        autocomplete="off"
        spellcheck="false"
        @input="onInput"
      />
    </label>
    <p v-if="status === 'error'" class="warn">{{ errorMessage }}</p>
    <div v-else-if="result" class="out" aria-live="polite">
      <template v-if="result.kind === 'digits'">
        <div v-for="(chunk, index) in result.chunks" :key="index" class="chunk">
          <span class="digits">{{ chunk.chunk }}</span>
          <ul class="pegs">
            <li v-for="peg in shown(chunk, index)" :key="peg.root">
              <span v-if="peg.emoji" class="emoji" aria-hidden="true">{{ peg.emoji }}</span>
              <code>{{ peg.root }}</code> {{ peg.concrete }}<span v-if="peg.core" class="core"> core</span>
            </li>
            <li v-if="chunk.pegs.length > shown(chunk, index).length">
              <button type="button" class="btn" @click="expand(index)">
                {{ chunk.pegs.length - shown(chunk, index).length }} more
              </button>
            </li>
          </ul>
        </div>
      </template>
      <template v-else-if="result.kind === 'words'">
        <p v-for="(word, index) in result.words" :key="index" class="word">
          <code>{{ word.raw }}</code>
          <template v-if="'digits' in word">
            → <span class="digits">{{ word.digits }}</span>
            <span class="note"> ({{ word.roots.join(' + ') }})</span>
          </template>
          <span v-else class="note"> not a peg: {{ word.notPeg }}</span>
        </p>
        <p v-if="total" class="lead">All together: <span class="digits">{{ total }}</span></p>
      </template>
      <p v-else class="warn">{{ result.message }}</p>
    </div>
    <p v-else class="note">Type a number to see pegs for each chunk, or Agebon words to read their digits.</p>
  </div>
</template>

<style scoped>
.digit-pegs {
  margin: 1rem 0 1.5rem;
  padding: 1rem 1.1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

input[type='search'] {
  width: 100%;
  max-width: 28rem;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font: inherit;
  font-size: 0.95rem;
}

input[type='search']:focus {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 1px;
  border-color: var(--vp-c-brand-1);
}

.chunk {
  display: flex;
  gap: 0.8rem;
  align-items: baseline;
  margin: 0.7rem 0 0;
}

.digits {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  min-width: 1.6rem;
}

.pegs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pegs li {
  margin: 0;
}

.lead,
.word,
.note,
.warn {
  margin: 0.55rem 0 0;
}

.note,
.core {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.warn {
  color: var(--vp-c-danger-1);
}

.emoji {
  margin-right: 0.25rem;
}

.btn {
  font: inherit;
  font-size: 0.85rem;
  padding: 0.15rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
}

.btn:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}
</style>

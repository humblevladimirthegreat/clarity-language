<script setup lang="ts">
import MiniSearch from 'minisearch'
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import publishedCsv from '@data/lexicon-published.csv?raw'
import overlayCsv from '@data/lexicon-overlays.csv?raw'
import {
  createLexiconIndex,
  createOverlayIndex,
  parseOverlayCsv,
  parsePublishedCsv,
  searchLexicon,
  type LexiconSearchResult,
  type OverlayRow,
  type PublishedRow,
} from '@lexicon-search'
import { nameBanReason } from '@learner-name'
import { useLearnerName } from '../composables/useLearnerName'

const DEBOUNCE_MS = 100

const query = ref('')
const status = ref<'loading' | 'ready' | 'error'>('loading')
const errorMessage = ref('')
const rows = shallowRef<PublishedRow[]>([])
const overlays = shallowRef<OverlayRow[]>([])
const index = shallowRef<MiniSearch | null>(null)
const overlayIndex = shallowRef<MiniSearch | null>(null)

let debounceTimer = 0

const learner = useLearnerName()
/** Why a row cannot be the learner's name ("Use as my name" is then disabled), or null. */
function banReason(row: PublishedRow): string | null {
  return nameBanReason(row, overlays.value)
}

function useAsName(row: PublishedRow): void {
  if (!banReason(row)) void learner.set(row.clarity)
}

const results = computed(() => {
  if (status.value !== 'ready' || !index.value) return []
  return searchLexicon(index.value, rows.value, query.value, {
    overlays: overlays.value,
    overlayIndex: overlayIndex.value ?? undefined,
  })
})

const countLabel = computed(() => {
  const trimmed = query.value.trim()
  if (!trimmed) return `${rows.value.length} rows`
  return `${results.value.length} of ${rows.value.length}`
})

function formatOverlays(row: LexiconSearchResult): string {
  if (!row.overlays?.length) return ''
  return row.overlays.map((o) => `${o.senseForm}+${o.pos}: ${o.definition}`).join('; ')
}

function concreteLabel(row: LexiconSearchResult): string {
  if (row.concrete) return row.concrete
  if (row.overlayOnly) return row.overlays[0]?.definition || '(overlay)'
  return '—'
}

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  window.clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(() => {
    query.value = value
  }, DEBOUNCE_MS)
}

onMounted(() => {
  try {
    const published = parsePublishedCsv(publishedCsv)
    const overlayRows = parseOverlayCsv(overlayCsv)
    rows.value = published
    overlays.value = overlayRows
    index.value = createLexiconIndex(published)
    overlayIndex.value = createOverlayIndex(overlayRows)
    status.value = 'ready'
  } catch (err) {
    status.value = 'error'
    errorMessage.value = err instanceof Error ? err.message : String(err)
    console.error(err)
  }
})

onUnmounted(() => {
  window.clearTimeout(debounceTimer)
})
</script>

<template>
  <div class="lexicon-search">
    <div class="toolbar">
      <input
        id="lexicon-filter"
        type="search"
        placeholder="Search literal, metaphor, role English, clarity, mnemonic…"
        autocomplete="off"
        aria-label="Search lexicon"
        :disabled="status !== 'ready'"
        @input="onInput"
      />
      <span v-if="status === 'ready'" class="count">{{ countLabel }}</span>
    </div>

    <p v-if="status === 'loading'" class="status">Loading…</p>
    <p v-else-if="status === 'error'" class="status error">
      Could not load lexicon data. {{ errorMessage }}
    </p>

    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th scope="col">Emoji</th>
            <th scope="col">Concrete</th>
            <th scope="col">Agalan</th>
            <th scope="col">Abstract</th>
            <th scope="col">Role English</th>
            <th scope="col">Overlays</th>
            <th scope="col">Mnemonic</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in results" :key="`${row.clarity}-${i}`">
            <td class="emoji">{{ row.emoji || '—' }}</td>
            <td class="literal">
              {{ concreteLabel(row) }}
              <span v-if="row.matchFields.length" class="match-fields">
                matched: {{ row.matchFields.join(', ') }}
              </span>
            </td>
            <td class="clarity">
              {{ row.clarity }}
              <span v-if="learner.chosen.value === row.clarity" class="my-name">✓ your name</span>
              <button
                v-else
                type="button"
                class="use-name"
                :aria-disabled="banReason(row) ? 'true' : undefined"
                :title="banReason(row) ?? `Use ${row.clarity}n as my name`"
                :aria-label="banReason(row) ? `Can't use ${row.clarity}n as a name: ${banReason(row)}` : `Use ${row.clarity}n as my name`"
                @click="useAsName(row)"
              >
                Use as my name
              </button>
            </td>
            <td>
              <span v-if="row.abstract">{{ row.abstract }}</span>
              <span v-else class="empty">—</span>
            </td>
            <td>
              <span v-if="row.englishByPos">{{ row.englishByPos }}</span>
              <span v-else class="empty">—</span>
            </td>
            <td>
              <span v-if="formatOverlays(row)">{{ formatOverlays(row) }}</span>
              <span v-else class="empty">—</span>
            </td>
            <td>
              <span v-if="row.mnemonic === 'REVIEW'" class="review">REVIEW</span>
              <span v-else-if="row.mnemonic">{{ row.mnemonic }}</span>
              <span v-else class="empty">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.use-name,
.my-name {
  display: block;
  margin-top: 0.3rem;
  font-family: var(--vp-font-family-base);
  font-size: 0.75rem;
  white-space: nowrap;
}

.use-name {
  padding: 0.1rem 0.45rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.use-name[aria-disabled='true'] {
  opacity: 0.5;
  cursor: not-allowed;
}

.use-name:not([aria-disabled='true']):hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.my-name {
  color: var(--vp-c-brand-1);
}

.lexicon-search {
  margin-top: 1rem;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

input[type='search'] {
  flex: 1 1 14rem;
  min-width: 0;
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

input[type='search']:disabled {
  opacity: 0.6;
}

.count {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
  white-space: nowrap;
}

.status {
  padding: 1.5rem;
  color: var(--vp-c-text-2);
  text-align: center;
}

.status.error {
  color: var(--vp-c-danger-1);
}

.table-wrap {
  overflow: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

thead {
  position: sticky;
  top: 0;
  background: var(--vp-c-bg-alt);
  z-index: 1;
}

th {
  text-align: left;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-2);
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

td {
  padding: 0.55rem 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
  vertical-align: top;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background: var(--vp-c-bg-mute);
}

.emoji {
  font-size: 1.45rem;
  line-height: 1;
  width: 3.5rem;
}

.clarity {
  font-family: var(--vp-font-family-mono);
  font-weight: 500;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.empty {
  color: var(--vp-c-text-3);
}

.review {
  color: var(--vp-c-warning-1);
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.match-fields {
  display: block;
  margin-top: 0.2rem;
  color: var(--vp-c-text-3);
  font-size: 0.78rem;
}

@media (max-width: 720px) {
  th,
  td {
    padding: 0.5rem 0.65rem;
  }

  .emoji {
    width: 2.75rem;
  }

  .match-fields {
    display: none;
  }
}
</style>

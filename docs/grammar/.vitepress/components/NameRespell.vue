<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { withBase } from 'vitepress'
import publishedCsv from '@data/lexicon-published.csv?raw'
import { parseCmuDict } from '@cmu-lookup'
import { parsePublishedCsv, type PublishedRow } from '@lexicon-search'
import { respellEnglishName, type NamePiece, type NameRespell } from '@name-respell'

const DEBOUNCE_MS = 150
const COPIED_MS = 1200

const query = ref('')
const rows = shallowRef<PublishedRow[]>([])
const cmu = shallowRef<Map<string, string[]> | null>(null)
const status = ref<'loading' | 'ready' | 'error'>('loading')
const errorMessage = ref('')
const copied = ref('')
let debounceTimer = 0
let copiedTimer = 0

const spansHref = withBase('/spans.html#loans')
const namesHref = withBase('/word-endings.html#named-n-beginner')

const result = computed<NameRespell | null>(() => {
  const text = query.value.trim()
  if (!text || status.value !== 'ready') return null
  try {
    return respellEnglishName(text, cmu.value, rows.value)
  } catch {
    return null
  }
})

function familyCitation(result: NameRespell): string {
  const full = result.fullName
  if (!full) return ''
  return `${full.given.citation} ${full.family.map((piece) => `g${piece.citation}`).join(' ')}`
}

function opaqueCitation(source: string): string {
  return `@<${source}>`
}

async function copy(form: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(form)
    copied.value = form
    window.clearTimeout(copiedTimer)
    copiedTimer = window.setTimeout(() => {
      copied.value = ''
    }, COPIED_MS)
  } catch {
    copied.value = ''
  }
}

function viaNote(piece: NamePiece): string {
  return piece.via === 'cmu' ? 'from the English sound' : 'from the English letters (no dictionary pronunciation)'
}

function onInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value
  window.clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(() => {
    query.value = value
    errorMessage.value = ''
  }, DEBOUNCE_MS)
}

onMounted(async () => {
  try {
    rows.value = parsePublishedCsv(publishedCsv)
    try {
      const text = await fetch(withBase('/cmudict.dict')).then((response) => {
        if (!response.ok) throw new Error(`Could not load pronunciations (${response.status})`)
        return response.text()
      })
      cmu.value = parseCmuDict(text)
    } catch {
      cmu.value = null
    }
    status.value = 'ready'
  } catch (err) {
    status.value = 'error'
    errorMessage.value = err instanceof Error ? err.message : String(err)
  }
})
</script>

<template>
  <div class="name-respell" id="respell-widget">
    <label class="label" for="name-respell-input">
      English name
      <input
        id="name-respell-input"
        type="search"
        placeholder="Japan, Sam, Alan Owen…"
        autocomplete="off"
        spellcheck="false"
        :disabled="status === 'loading'"
        :aria-describedby="result ? 'name-respell-out' : undefined"
        @input="onInput"
      />
    </label>
    <p v-if="status === 'loading'" class="note">Loading pronunciations…</p>
    <p v-else-if="status === 'error'" class="warn">{{ errorMessage }}</p>
    <div v-else-if="result" id="name-respell-out" class="out" aria-live="polite">
      <p v-if="result.published" class="lead">
        <span v-if="result.published.emoji" class="emoji" aria-hidden="true">{{ result.published.emoji }}</span>
        In the lexicon:
        <code>{{ result.published.citation }}</code>
        <em v-if="result.published.abstract"> ({{ result.published.abstract }})</em>.
      </p>
      <p v-else class="lead">
        Not in the lexicon.
        Citation <code>{{ result.whole.citation }}</code>
        ({{ viaNote(result.whole) }}).
      </p>
      <p v-if="result.fullName" class="note">
        As a given name and family name:
        <code>{{ familyCitation(result) }}</code>.
      </p>
      <div class="actions">
        <button type="button" class="btn" @click="copy(result.published?.citation ?? result.whole.citation)">
          Copy citation
        </button>
        <button
          v-if="result.fullName"
          type="button"
          class="btn"
          @click="copy(familyCitation(result))"
        >
          Copy full name
        </button>
        <button type="button" class="btn" @click="copy(opaqueCitation(result.query))">
          Copy span
        </button>
      </div>
      <p v-if="copied" class="note">Copied <code>{{ copied }}</code>.</p>
      <p class="note">
        A span keeps the original spelling (<a :href="spansHref"><code>{{ opaqueCitation(result.query) }}</code></a>).
        To wear a published root as your name in the examples, pick one
        <a :href="namesHref">on word endings</a> or with <strong>Use as my name</strong> below.
      </p>
    </div>
    <p v-else class="note">
      Type a person or place. A country already in the lexicon shows its published spelling.
    </p>
  </div>
</template>

<style scoped>
.name-respell {
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

.lead,
.note,
.warn {
  margin: 0.55rem 0 0;
}

.note {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.warn {
  color: var(--vp-c-danger-1);
}

.emoji {
  margin-right: 0.35rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.7rem 0 0;
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

.btn:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}
</style>

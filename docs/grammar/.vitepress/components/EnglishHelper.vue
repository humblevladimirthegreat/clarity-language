<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { withBase } from 'vitepress'
import publishedCsv from '@data/lexicon-published.csv?raw'
import overlayCsv from '@data/lexicon-overlays.csv?raw'
import compoundCsv from '@data/lexicon-compounds.csv?raw'
import type { Analysis, Band, HelperData, HelperPayload, Slot, SuggestionChip } from '@english-helper-browser'
import type { PromptContext } from '@parse-browser'
import { useClassifyTables } from '../composables/useClassifyTables'
import { useInspectorText } from '../composables/useInspectorText'

type HelperModule = typeof import('@english-helper-browser')

const SAMPLE = 'My sister could not come to the tea shop.'
const ANALYZE_IDLE_MS = 250
const COPIED_MS = 1200
const LEVELS: { value: Band | ''; label: string }[] = [
  { value: '', label: 'All levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const english = ref(SAMPLE)
const stage = ref<Band | ''>('')
const draft = ref('')
const inspectorText = useInspectorText()
const { tables } = useClassifyTables()

/** The analyzer, compromise, and the grammar-page data load as their own chunks, started on mount. */
const helper = shallowRef<HelperModule | null>(null)
const payload = shallowRef<HelperPayload | null>(null)
const loadError = ref('')

const data = computed<HelperData | null>(() => {
  if (!helper.value || !payload.value || !tables.value) return null
  return helper.value.createHelperData(
    payload.value,
    { published: publishedCsv, overlays: overlayCsv, compounds: compoundCsv },
    tables.value,
  )
})

const analysis = shallowRef<Analysis | null>(null)
const analyzeError = ref('')
let analyzeTimer = 0

function analyze() {
  if (!helper.value || !data.value) return
  analyzeError.value = ''
  try {
    analysis.value = helper.value.analyzeEnglish(data.value, english.value, stage.value ? { stage: stage.value } : {})
  } catch (err) {
    analysis.value = null
    analyzeError.value = err instanceof Error ? err.message : String(err)
  }
}

watch([english, stage], () => {
  window.clearTimeout(analyzeTimer)
  analyzeTimer = window.setTimeout(analyze, ANALYZE_IDLE_MS)
})
watch(data, analyze)

function chipsOf(slot: Slot, jobs: boolean): SuggestionChip[] {
  if (!helper.value) return []
  return slot.suggestions.filter((s) => (s.kind === 'job') === jobs).map(helper.value.suggestionChip)
}

function features(clause: Analysis['clauses'][number]): string {
  return helper.value ? helper.value.featureLabels(clause.features).join(' · ') : ''
}

/** `*see*` → italic runs, for the English notes. */
function marked(text: string): { text: string; em?: boolean; code?: boolean }[] {
  return text.split(/(\*[^*]+\*|`[^`]+`)/).filter(Boolean).map((part) => {
    if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) return { text: part.slice(1, -1), em: true }
    if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) return { text: part.slice(1, -1), code: true }
    return { text: part }
  })
}

function href(link: string): string {
  return withBase(`/${link.replace(/\.md(?=#|$)/, '.html')}`)
}

function sectionTitle(link: string): string {
  const title = data.value?.sections.get(link)?.title
  return title && helper.value ? helper.value.plainTitle(title) : link
}

const TIER_NOTES: Record<string, string> = {
  root: 'lexicon root',
  alias: 'lexicon search word (not a sense)',
  compound: 'dictionary compound',
  overlay: 'overlay',
  grammar: 'grammar row',
  synonym: 'WordNet synonym of a lexicon sense',
  broader: 'WordNet: a kind of a lexicon sense',
  route: 'built from a pattern the docs teach',
  live: 'compound built on the spot',
}

const copied = ref('')
let copiedTimer = 0

async function copy(form: string) {
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

/** The helper prompt's doc examples are the inspector's (one shared chunk), started on mount so a click rarely waits. */
const promptContext = shallowRef<PromptContext | null>(null)
const promptCopied = ref(false)
const promptError = ref('')
let promptCopiedTimer = 0

const canCopyPrompt = computed(() => Boolean(helper.value && data.value && promptContext.value && english.value.trim()))

async function loadPromptContext() {
  const { data: loaded } = await import('../lib/llm-context.data')
  promptContext.value = {
    index: loaded.index.map((pair) => ({ ...pair, source: '' })),
    labelGlosses: new Map(loaded.labelGlosses),
    readers: new Map(loaded.readers),
    anchors: new Map(loaded.anchors),
  }
}

/** Same prompt as `english-helper.mjs --llm-prompt`: each non-empty line is one input. */
async function copyPrompt() {
  if (!helper.value || !data.value || !promptContext.value) return
  promptError.value = ''
  const inputs = english.value.split('\n').map((line) => line.trim()).filter(Boolean)
  try {
    const prompt = helper.value.promptForEnglish(inputs, data.value, promptContext.value, stage.value ? { stage: stage.value } : {})
    await navigator.clipboard.writeText(prompt)
    promptCopied.value = true
    window.clearTimeout(promptCopiedTimer)
    promptCopiedTimer = window.setTimeout(() => {
      promptCopied.value = false
    }, COPIED_MS)
  } catch (err) {
    promptError.value = err instanceof Error ? err.message : String(err)
  }
}

watch([english, stage], () => {
  promptError.value = ''
})

async function sendToInspector() {
  if (!draft.value.trim()) return
  inspectorText.value = draft.value
  await nextTick()
  const input = document.getElementById('gloss-input')
  input?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  input?.focus({ preventScroll: true })
}

onMounted(() => {
  Promise.all([import('@english-helper-browser'), import('../lib/english-helper.data')])
    .then(([mod, { data: loaded }]) => {
      helper.value = mod
      payload.value = loaded
    })
    .catch((err) => {
      loadError.value = err instanceof Error ? err.message : String(err)
    })
  loadPromptContext().catch((err) => {
    promptError.value = `Could not load the prompt examples. ${err instanceof Error ? err.message : String(err)}`
  })
})

onBeforeUnmount(() => {
  window.clearTimeout(analyzeTimer)
  window.clearTimeout(copiedTimer)
  window.clearTimeout(promptCopiedTimer)
})
</script>

<template>
  <div class="helper">
    <textarea
      v-model="english"
      rows="3"
      spellcheck="true"
      placeholder="Type English…"
      aria-label="English text"
    />
    <div class="levels" role="group" aria-label="Level">
      <button
        v-for="level in LEVELS"
        :key="level.value"
        type="button"
        :class="{ active: stage === level.value }"
        :aria-pressed="stage === level.value"
        @click="stage = level.value"
      >
        {{ level.label }}
      </button>
    </div>
    <div class="prompt-row">
      <button type="button" class="prompt-button" :disabled="!canCopyPrompt" @click="copyPrompt">
        {{ promptCopied ? 'Copied' : 'Copy Helper Prompt' }}
      </button>
      <span class="prompt-note">
        An Agazan-writing prompt for an LLM: these suggestions, the writing rules, and matching doc
        examples, one numbered line per English line. Paste its answer in the draft box below.
      </span>
    </div>
    <p v-if="promptError" class="warn" role="status">{{ promptError }}</p>
    <p v-if="loadError" class="warn">Could not load the English helper. {{ loadError }}</p>
    <p v-else-if="!data" class="status">Loading the English helper…</p>
    <p v-if="analyzeError" class="warn" role="status">{{ analyzeError }}</p>

    <template v-if="analysis && data">
      <section v-for="(clause, n) in analysis.clauses" :key="n" class="clause">
        <header class="clause-head">
          <span class="clause-text">{{ clause.text }}</span>
          <span class="features">{{ features(clause) }}</span>
        </header>
        <ul v-if="clause.detectors.length" class="clause-detectors">
          <li v-for="(d, i) in clause.detectors" :key="i" class="chip tier-grammar">
            <span class="note">
              <template v-for="(part, k) in marked(d.label)" :key="k"><em v-if="part.em">{{ part.text }}</em><code v-else-if="part.code">{{ part.text }}</code><template v-else>{{ part.text }}</template></template>
            </span>
            <span class="links">
              <a v-for="link in d.links" :key="link" :href="href(link)">{{ sectionTitle(link) }}</a>
            </span>
            <span v-if="d.example" class="example">e.g. <code>{{ d.example.form }}</code> {{ d.example.english }}</span>
          </li>
        </ul>
        <div class="slots">
          <div
            v-for="(slot, i) in clause.slots"
            :key="i"
            class="slot"
            :class="{ skipped: slot.skipped, gap: !slot.skipped && !slot.suggestions.length }"
          >
            <div class="slot-head">
              <span class="word">{{ slot.text }}</span>
              <span class="cls">{{ slot.cls }}</span>
            </div>
            <p v-if="slot.reading" class="reading">
              <template v-for="(part, k) in marked(slot.reading)" :key="k"><em v-if="part.em">{{ part.text }}</em><template v-else>{{ part.text }}</template></template>
            </p>
            <p v-if="slot.skipped" class="empty">No word of its own.</p>
            <p v-else-if="!slot.suggestions.length" class="empty">No suggestion.</p>
            <ul class="chips">
              <li
                v-for="(chip, k) in chipsOf(slot, false)"
                :key="k"
                class="chip"
                :class="`tier-${chip.tier}`"
                :title="TIER_NOTES[chip.tier]"
              >
                <button
                  v-if="chip.form && chip.copy"
                  type="button"
                  class="form copy"
                  :title="`Copy (${TIER_NOTES[chip.tier]})`"
                  @click="copy(chip.form)"
                >
                  <span v-if="chip.emoji" class="emoji">{{ chip.emoji }}</span>
                  <code>{{ copied === chip.form ? 'Copied' : chip.form }}</code>
                </button>
                <code v-else-if="chip.form" class="form">{{ chip.form }}</code>
                <span class="note">
                  <template v-for="(part, m) in marked(chip.note)" :key="m"><em v-if="part.em">{{ part.text }}</em><code v-else-if="part.code">{{ part.text }}</code><template v-else>{{ part.text }}</template></template>
                </span>
                <button v-if="chip.phrase" type="button" class="form copy phrase" title="Copy the hook with its landmark" @click="copy(chip.phrase)">
                  <code>{{ copied === chip.phrase ? 'Copied' : chip.phrase }}</code>
                </button>
                <span v-if="chip.links.length" class="links">
                  <a v-for="link in chip.links" :key="link" :href="href(link)">{{ sectionTitle(link) }}</a>
                </span>
                <span v-if="chip.example" class="example">e.g. <code>{{ chip.example.form }}</code> {{ chip.example.english }}</span>
              </li>
            </ul>
            <div v-if="chipsOf(slot, true).length" class="jobs">
              <p v-if="chipsOf(slot, true).length > 1" class="pick">
                {{ chipsOf(slot, true).length }} jobs: pick one by meaning
              </p>
              <ul class="job-row">
                <li v-for="(chip, k) in chipsOf(slot, true)" :key="k" class="chip job tier-grammar">
                  <a :href="href(chip.links[0]!)" :title="sectionTitle(chip.links[0]!)">
                    <code>{{ chip.form }}</code>
                  </a>
                  <span class="note">{{ chip.note }}</span>
                  <button v-if="chip.phrase" type="button" class="form copy phrase" title="Copy the hook with its landmark" @click="copy(chip.phrase)">
                    <code>{{ copied === chip.phrase ? 'Copied' : chip.phrase }}</code>
                  </button>
                  <span v-if="chip.example" class="example">e.g. <code>{{ chip.example.form }}</code> {{ chip.example.english }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section v-if="analysis.gaps.length" class="gaps">
        <h3>No suggestion</h3>
        <ul>
          <li v-for="(gap, i) in analysis.gaps" :key="i">
            <strong>{{ gap.word }}</strong> ({{ gap.cls }}; tried {{ gap.tried.join(', ') }})
          </li>
        </ul>
      </section>
    </template>

    <div class="draft">
      <label for="english-helper-draft">
        <span class="draft-label">Your Agazan draft</span>
        <textarea
          id="english-helper-draft"
          v-model="draft"
          rows="2"
          spellcheck="false"
          placeholder="Write the sentence from the suggestions…"
        />
      </label>
      <button type="button" class="send" :disabled="!draft.trim()" @click="sendToInspector">
        Send to inspector
      </button>
    </div>
  </div>
</template>

<style scoped>
.helper {
  margin-top: 1rem;
}

textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
}

textarea:focus {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 1px;
}

#english-helper-draft {
  font-family: var(--vp-font-family-mono);
}

.levels {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0.65rem 0 0;
}

.levels button,
.send {
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
  cursor: pointer;
}

.prompt-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.85rem;
  margin: 0.65rem 0 0;
}

.prompt-button {
  padding: 0.35rem 0.85rem;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
}

.prompt-button:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}

.prompt-button:disabled {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
  cursor: not-allowed;
}

.prompt-note {
  flex: 1 1 16rem;
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
}

.levels button.active {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.send {
  margin-top: 0.5rem;
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

.send:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}

.send:disabled {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
  cursor: not-allowed;
}

.status {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.warn {
  color: var(--vp-c-danger-1);
  font-size: 0.9rem;
}

.clause {
  margin-top: 1.1rem;
}

.clause-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.25rem 0.75rem;
}

.clause-text {
  font-weight: 600;
}

.features {
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

li + li {
  margin-top: 0;
}

.clause-detectors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.4rem;
}

.slots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 0.6rem;
  margin-top: 0.6rem;
}

.slot {
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  min-width: 0;
}

.slot.skipped {
  opacity: 0.6;
}

.slot.gap {
  border-color: var(--vp-c-warning-1);
}

.slot-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.word {
  font-weight: 600;
}

.cls,
.reading,
.empty,
.pick {
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
}

.reading,
.empty,
.pick {
  margin: 0.2rem 0 0;
}

.chips {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-top: 0.35rem;
}

.chip {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  font-size: 0.85rem;
  overflow-wrap: anywhere;
}

.chip.tier-synonym,
.chip.tier-broader,
.chip.tier-route,
.chip.tier-live,
.chip.tier-alias {
  border-style: dashed;
}

.form {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  align-self: flex-start;
}

.copy {
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: copy;
}

.copy code {
  border: 1px solid transparent;
}

.copy:hover code,
.copy:focus-visible code {
  border-color: var(--vp-c-brand-1);
}

.note {
  color: var(--vp-c-text-1);
}

.example {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}
.links {
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.6rem;
  font-size: 0.8rem;
}

.jobs {
  margin-top: 0.35rem;
}

.job-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.25rem;
}

.chip.job {
  flex: 1 1 6rem;
}

.chip.job .note {
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
}

.gaps {
  margin-top: 1.1rem;
}

.gaps h3 {
  margin: 0 0 0.3rem;
  font-size: 1rem;
}

.gaps li {
  font-size: 0.9rem;
}

.draft {
  margin-top: 1.4rem;
}

.draft-label {
  display: block;
  margin-bottom: 0.3rem;
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import type { LearnerNameOption } from '@learner-name'
import { useLearnerName } from '../composables/useLearnerName'
import SpeakButton from './SpeakButton.vue'

/** Suggest a published root as the learner's Agalan name, or show the one they chose. */
const { chosen, eligible, suggested, set, clear, loadEligibleNames } = useLearnerName()

const status = ref<'loading' | 'ready' | 'error'>('loading')
const history = ref<LearnerNameOption[]>([])
const at = ref(-1)
const changing = ref(false)
const shown = new Set<string>()

const current = computed(() => history.value[at.value] ?? null)
const chosenOption = computed(() => eligible.value.find((option) => option.root === chosen.value) ?? null)
const lexiconHref = withBase('/lexicon.html')

function another(): void {
  if (at.value < history.value.length - 1) {
    at.value += 1
    return
  }
  const list = suggested.value
  if (!list.length) return
  if (shown.size >= list.length) shown.clear()
  let pick: LearnerNameOption
  do {
    pick = list[Math.floor(Math.random() * list.length)]!
  } while (shown.has(pick.root))
  shown.add(pick.root)
  history.value = [...history.value, pick]
  at.value = history.value.length - 1
}

function back(): void {
  if (at.value > 0) at.value -= 1
}

async function choose(): Promise<void> {
  if (current.value && (await set(current.value.root))) changing.value = false
}

function change(): void {
  changing.value = true
  if (!current.value) another()
}

onMounted(async () => {
  try {
    await loadEligibleNames()
    status.value = 'ready'
    another()
  } catch {
    status.value = 'error'
  }
})
</script>

<template>
  <div class="name-helper">
    <p v-if="status === 'error'" class="warn">Could not load the lexicon.</p>
    <template v-else-if="chosenOption && !changing">
      <p class="lead">
        Your Agalan name is <code>{{ chosenOption.name }}</code>
        <span class="senses">(<em>{{ chosenOption.concrete }}</em><template v-if="chosenOption.abstract"> / <em>{{ chosenOption.abstract }}</em></template>)</span>.
      </p>
      <div class="actions">
        <SpeakButton :text="`${chosenOption.name}.`" label="Say it" />
        <button type="button" class="btn" @click="change">Change</button>
        <button type="button" class="btn" @click="clear">Clear</button>
      </div>
    </template>
    <template v-else>
      <p class="lead">Pick an Agalan name. Any published root becomes a name with <strong>-n</strong>.</p>
      <div v-if="current" class="card" aria-live="polite">
        <p class="name">
          <span class="emoji" aria-hidden="true">{{ current.emoji }}</span>
          <code>{{ current.name }}</code>
        </p>
        <p class="senses">
          everyday picture <em>{{ current.concrete }}</em> · abstract sense <em>{{ current.abstract }}</em>
        </p>
        <p v-if="current.mnemonic" class="mnemonic">{{ current.mnemonic }}</p>
        <p class="note">As a name, it carries both.</p>
      </div>
      <p v-else-if="status === 'loading'" class="note">Loading names…</p>
      <div class="actions">
        <SpeakButton v-if="current" :text="`${current.name}.`" label="Say it" />
        <button type="button" class="btn" :disabled="at <= 0" @click="back">Back</button>
        <button type="button" class="btn" :disabled="status !== 'ready'" @click="another">Another</button>
        <button type="button" class="btn primary" :disabled="!current" @click="choose">Choose this name</button>
        <button v-if="chosenOption" type="button" class="btn" @click="changing = false">Keep {{ chosenOption.name }}</button>
      </div>
      <p class="note">
        Or <a :href="lexiconHref">pick your own in the lexicon</a> (<strong>Use as my name</strong> on a row).
        Until you choose, examples marked as yours use <code>ugobon</code>, the word for whoever is speaking.
      </p>
    </template>
  </div>
</template>

<style scoped>
.name-helper {
  margin: 1rem 0 1.5rem;
  padding: 1rem 1.1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.name-helper p {
  margin: 0.4rem 0;
}

.card {
  margin: 0.6rem 0;
}

.name {
  font-size: 1.35rem;
}

.emoji {
  margin-right: 0.4rem;
}

.senses,
.note,
.mnemonic {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.6rem 0;
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
  opacity: 0.55;
  cursor: not-allowed;
}

.btn.primary {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.warn {
  color: var(--vp-c-danger-1);
}
</style>

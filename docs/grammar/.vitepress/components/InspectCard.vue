<script setup lang="ts">
import { endingSense, morphDetails, type InspectToken } from '@parse-browser'

defineProps<{
  token: InspectToken | null
  expanded?: boolean
}>()
</script>

<template>
  <div v-if="!token" class="empty">Click a word for PoS, ending, and gloss.</div>
  <div v-else-if="token.kind === 'error'" class="card error">
    <header>
      <span class="surface">{{ token.raw }}</span>
      <span class="chip fail">parse error</span>
    </header>
    <p class="gloss">{{ token.error.message }}</p>
    <p v-if="token.error.expected" class="expected">expected {{ token.error.expected }}</p>
  </div>
  <div v-else-if="token.kind === 'word'" class="card">
    <header>
      <span class="surface">{{ token.raw }}</span>
      <span v-if="token.word.pos" class="chip pos">/{{ token.word.pos }}/</span>
      <span v-if="token.word.ending" class="chip ending">
        -{{ token.word.ending }} {{ endingSense(token.word.ending) }}
      </span>
    </header>
    <p class="gloss">{{ token.gloss }}</p>
    <ul class="chips">
      <li v-for="(chip, i) in token.chips" :key="i">{{ chip }}</li>
    </ul>
    <dl v-if="expanded" class="details">
      <template v-for="row in morphDetails(token.word)" :key="row.label">
        <dt>{{ row.label }}</dt>
        <dd>{{ row.value }}</dd>
      </template>
    </dl>
  </div>
  <div v-else class="card">
    <header>
      <span class="surface">{{ token.raw }}</span>
      <span class="chip">{{ token.kind }}</span>
    </header>
  </div>
</template>

<style scoped>
.card,
.empty {
  padding: 0.85rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.empty {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.card.error {
  border-color: var(--vp-c-danger-1);
}

header {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.6rem;
  align-items: baseline;
  margin-bottom: 0.5rem;
}

.surface {
  font-family: var(--vp-font-family-mono);
  font-weight: 600;
  font-size: 1.05rem;
}

.chip {
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  padding: 0.12rem 0.4rem;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-2);
}

.chip.fail {
  color: var(--vp-c-danger-1);
}

.gloss {
  margin: 0 0 0.5rem;
  color: var(--vp-c-text-1);
}

.expected {
  margin: 0;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.chips li {
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}

.details {
  display: grid;
  grid-template-columns: 7.5rem 1fr;
  gap: 0.25rem 0.75rem;
  margin: 0.85rem 0 0;
  font-size: 0.85rem;
}

dt {
  color: var(--vp-c-text-2);
}

dd {
  margin: 0;
  font-family: var(--vp-font-family-mono);
}
</style>

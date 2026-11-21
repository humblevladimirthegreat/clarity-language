<script setup lang="ts">
// The Ageben flashcard page's live parts: the pack table with download links, the unlock
// searches by band and unit, and the release search. Counts, searches and the release id come
// from the packs themselves (flashcards.data.ts), never from the page.
import { withBase } from 'vitepress'
import { data } from '../lib/flashcards.data.ts'

defineProps<{ part: 'packs' | 'checkpoints' | 'cleanup' }>()

/** One table row per checkpoint, with its unit's cell spanning the unit's rows. */
const bandRows = data.bands.map((band) => ({
  ...band,
  checkpoints: band.units.reduce((sum, unit) => sum + unit.checkpoints.length, 0),
  rows: band.units.flatMap((unit) =>
    unit.checkpoints.map((checkpoint, i) => ({ unit, checkpoint, span: i === 0 ? unit.checkpoints.length : 0 })),
  ),
}))
</script>

<template>
  <table v-if="part === 'packs'">
    <thead>
      <tr>
        <th>Pack</th>
        <th>Decks</th>
        <th>Notes</th>
        <th>Cards</th>
        <th>Download</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="pack in data.packs" :key="pack.id">
        <td>{{ pack.title }}</td>
        <td>{{ pack.decks }}</td>
        <td>{{ pack.notes }}</td>
        <td>{{ pack.cards }}</td>
        <td>
          <a :href="withBase(pack.path)" download>{{ pack.title }} flashcards</a>
        </td>
      </tr>
    </tbody>
  </table>
  <div v-else-if="part === 'checkpoints'">
    <details v-for="band in bandRows" :key="band.band" class="details custom-block">
      <summary>{{ band.title }}: {{ band.checkpoints }} checkpoints in {{ band.units.length }} units</summary>
      <table class="ageben-unlock">
        <thead>
          <tr>
            <th>Unit</th>
            <th>Checkpoint</th>
            <th>New cards</th>
            <th>Search</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in band.rows" :key="row.checkpoint.tag">
            <td v-if="row.span" :rowspan="row.span">{{ row.unit.number }}. {{ row.unit.title }}</td>
            <td>
              <a :href="withBase(row.checkpoint.link)">{{ row.checkpoint.title }}</a>
            </td>
            <td>{{ row.checkpoint.cards }}</td>
            <td><code>{{ row.checkpoint.search }}</code></td>
          </tr>
        </tbody>
      </table>
    </details>
  </div>
  <p v-else>
    <code class="ageben-search">{{ data.cleanupSearch }}</code>
  </p>
</template>

<style scoped>
.ageben-unlock code,
.ageben-search {
  user-select: all;
}
</style>

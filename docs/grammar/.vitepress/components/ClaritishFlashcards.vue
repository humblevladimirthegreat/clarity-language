<script setup lang="ts">
// The Claritish flashcard page's live parts: the download link, the lesson table, and the
// release search. Counts and the release tag come from the pack itself, never from the page.
import { withBase } from 'vitepress'
import { data } from '../lib/claritish-flashcards.data.ts'

defineProps<{ part: 'download' | 'decks' | 'search' }>()

const releaseSearch = `deck:Claritish* -tag:${data.releaseTag}`
</script>

<template>
  <p v-if="part === 'download'">
    <a :href="withBase(data.path)" download>Download the Claritish flashcards</a>
    ({{ data.total }} flashcards, one file)
  </p>
  <table v-else-if="part === 'decks'">
    <thead>
      <tr>
        <th>Lesson</th>
        <th>Flashcards</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="deck in data.decks" :key="deck.slug">
        <td>
          <a :href="withBase(`/claritish/${deck.slug}.html`)">{{ deck.title }}</a>
        </td>
        <td>{{ deck.count }}</td>
      </tr>
      <tr>
        <td>All lessons</td>
        <td>{{ data.total }}</td>
      </tr>
    </tbody>
  </table>
  <p v-else>
    <code>{{ releaseSearch }}</code>
  </p>
</template>

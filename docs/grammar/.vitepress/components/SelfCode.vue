<script setup lang="ts">
import { computed } from 'vue'
import { useLearnerName } from '../composables/useLearnerName'

/** Agalan text with `SELF` slots: the learner's name, or `ugobon` until one is chosen. */
const props = withDefaults(defineProps<{ text: string; bare?: boolean }>(), { bare: false })

const { root, chosen, openHelper } = useLearnerName()

/** Text split so odd entries are slots. */
const parts = computed(() => props.text.split(/SELF(?=[a-z])/))
</script>

<template>
  <component :is="bare ? 'span' : 'code'" class="self-code">
    <template v-for="(part, i) in parts" :key="i">
      <button
        v-if="i > 0 && !chosen"
        type="button"
        class="self-slot self-unset"
        title="Choose your Agalan name"
        @click="openHelper"
      >{{ root }}</button><span
        v-else-if="i > 0"
        class="self-slot"
      >{{ root }}</span>{{ part }}
    </template>
  </component>
</template>

<style scoped>
.self-unset {
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
  text-decoration: underline dotted;
  text-underline-offset: 0.2em;
}
</style>

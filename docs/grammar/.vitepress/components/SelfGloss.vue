<script setup lang="ts">
import { computed } from 'vue'
import { selfGlossEnglish } from '@learner-name'
import { useLearnerName } from '../composables/useLearnerName'

/** Morph-gloss English for a `SELF` slot: `speaker` until a name is chosen, then the name. */
const { root } = useLearnerName()
const english = computed(() => selfGlossEnglish(root.value))
</script>

<template><span class="self-gloss">{{ english }}</span></template>

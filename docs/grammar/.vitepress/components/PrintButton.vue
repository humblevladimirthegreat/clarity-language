<script setup lang="ts">
function printPage() {
  window.print()
}
</script>

<template>
  <button
    type="button"
    class="print-button"
    aria-label="Print this page"
    title="Print this page"
    @click="printPage"
  >
    🖨️
  </button>
</template>

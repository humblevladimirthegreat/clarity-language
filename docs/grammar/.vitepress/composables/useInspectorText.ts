import { ref } from 'vue'

/** The Ageben inspector's input, shared so the English helper can send a draft to it. */
const text = ref('zoguvom thaber guwathum. zuwen vomuroxom.')

export function useInspectorText() {
  return text
}

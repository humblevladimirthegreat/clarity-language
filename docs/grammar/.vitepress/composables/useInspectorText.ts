import { ref } from 'vue'

/** The Agebon inspector's input, shared so the English helper can send a draft to it. */
const text = ref('zoguvom thaber guwathum. zuwen veveroxom.')

export function useInspectorText() {
  return text
}

import { ref } from 'vue'

/** The Agebon inspector's input, shared so the English helper can send a draft to it. */
const text = ref('zuguvem thabor guwathum. zuwon veverexom.')

export function useInspectorText() {
  return text
}

import { ref } from 'vue'

/** The Egabon inspector's input, shared so the English helper can send a draft to it. */
const text = ref('zugavem thahor gulothum. zamun veverexom.')

export function useInspectorText() {
  return text
}

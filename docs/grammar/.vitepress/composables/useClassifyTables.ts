import { onMounted, ref, shallowRef, type ShallowRef } from 'vue'
import publishedCsv from '@data/lexicon-published.csv?raw'
import overlayCsv from '@data/lexicon-overlays.csv?raw'
import { createClassifyTables, type ClassifyTables } from '@parse-browser'

const tables: ShallowRef<ClassifyTables | null> = shallowRef(null)
const status = ref<'loading' | 'ready' | 'error'>('loading')
const errorMessage = ref('')
let started = false

export function useClassifyTables() {
  onMounted(() => {
    if (started) {
      if (tables.value) status.value = 'ready'
      return
    }
    started = true
    try {
      tables.value = createClassifyTables(publishedCsv, overlayCsv)
      status.value = 'ready'
    } catch (err) {
      status.value = 'error'
      errorMessage.value = err instanceof Error ? err.message : String(err)
    }
  })

  return { tables, status, errorMessage }
}

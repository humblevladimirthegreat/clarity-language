import { defineComponent, nextTick, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vitepress'
import { enhanceRootsTables, isRootsUsedTable } from '../lib/roots-table-sort'

export default defineComponent({
  name: 'RootsTableSort',
  setup() {
    const route = useRoute()
    let teardown: (() => void) | undefined
    let observer: MutationObserver | undefined

    function attach() {
      if (typeof document === 'undefined') return
      teardown?.()
      teardown = enhanceRootsTables(document)
    }

    function hasRootsTable(): boolean {
      return [...document.querySelectorAll('table')].some((el) => isRootsUsedTable(el as HTMLTableElement))
    }

    function sync() {
      if (typeof document === 'undefined') return
      observer?.disconnect()
      observer = undefined
      teardown?.()
      teardown = undefined
      void nextTick(() => {
        attach()
        if (hasRootsTable()) return
        const host = document.querySelector('#VPContent') ?? document.body
        observer = new MutationObserver(() => {
          if (!hasRootsTable()) return
          observer?.disconnect()
          observer = undefined
          attach()
        })
        observer.observe(host, { childList: true, subtree: true })
      })
    }

    watch(() => route.path, sync, { immediate: true })
    onBeforeUnmount(() => {
      observer?.disconnect()
      teardown?.()
    })

    return () => null
  },
})

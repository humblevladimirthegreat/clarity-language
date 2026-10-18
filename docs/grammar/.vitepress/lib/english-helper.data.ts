import { helperPayload } from '../../../../src/english-helper/load.ts'
import type { HelperPayload } from '../../../../src/english-helper/browser.ts'

/** The English helper's grammar-page data (cue index, entries, sections, WordNet index), for the Inspect page. */
declare const data: HelperPayload
export { data }

export default {
  load(): HelperPayload {
    return helperPayload()
  },
}

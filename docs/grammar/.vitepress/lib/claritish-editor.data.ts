import { buildEditorData } from '../../../../src/claritish-editor/data.ts'
import type { EditorData } from '../../../../src/claritish-editor/types.ts'

/** The Claritish editor's triggers, flows, and the forms they resolve to on the cheat sheet. */
declare const data: EditorData
export { data }

export default {
  load(): EditorData {
    const { data, problems } = buildEditorData()
    if (problems.length) throw new Error(`Claritish editor data:\n  ${problems.join('\n  ')}`)
    return data
  },
}

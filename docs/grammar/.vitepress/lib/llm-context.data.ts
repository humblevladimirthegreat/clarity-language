import { loadDefaultTables } from '../../../../src/parse/index.ts'
import { loadPromptContext } from '../../../../src/parse/llm-examples.ts'
import type { ExamplePair } from '../../../../src/parse/llm-prompt.ts'

/** The translation prompt's doc inputs, JSON-safe, for the Inspect page's Copy Translation Prompt. */
export type LlmContextData = {
  index: Omit<ExamplePair, 'source'>[]
  labelGlosses: [string, string][]
  readers: [string, string][]
}

declare const data: LlmContextData
export { data }

export default {
  load(): LlmContextData {
    const context = loadPromptContext(loadDefaultTables())
    return {
      index: context.index.map(({ source: _source, ...pair }) => pair),
      labelGlosses: [...context.labelGlosses],
      readers: [...context.readers],
    }
  },
}

/**
 * `/tools/ageben.mjs`: the parser as one self-contained ES module for agents that can run code.
 * Bundles [src/agent/ageben.ts](../../src/agent/ageben.ts) with the lexicon CSVs and the
 * translation prompt's doc examples inlined, so it needs no repo, no network, and no npm install.
 */
import { build } from 'esbuild'

import { loadDefaultTables } from '../../src/parse/index.ts'
import { loadPromptContext } from '../../src/parse/llm-examples.ts'
import { readData, REPO_ROOT } from '../../src/repo-paths.ts'
import { join } from 'node:path'

/** Published path of the bundle, relative to the site root. */
export const AGENT_BUNDLE_PATH = 'tools/ageben.mjs'

/** Source of the `ageben:data` virtual module. */
export function agentDataModule(): string {
  const context = loadPromptContext(loadDefaultTables())
  const contextData = {
    index: context.index.map(({ source: _source, ...pair }) => pair),
    labelGlosses: [...context.labelGlosses],
    readers: [...context.readers],
  }
  return [
    `export const publishedCsv = ${JSON.stringify(readData('lexicon-published.csv'))};`,
    `export const overlaysCsv = ${JSON.stringify(readData('lexicon-overlays.csv'))};`,
    `export const compoundsCsv = ${JSON.stringify(readData('lexicon-compounds.csv'))};`,
    `export const contextData = ${JSON.stringify(contextData)};`,
  ].join('\n')
}

/** The bundle's text. */
export async function agentBundle(): Promise<string> {
  const data = agentDataModule()
  const result = await build({
    entryPoints: [join(REPO_ROOT, 'src', 'agent', 'ageben.ts')],
    bundle: true,
    platform: 'neutral',
    format: 'esm',
    target: 'es2022',
    mainFields: ['module', 'main'],
    minify: true,
    legalComments: 'none',
    write: false,
    logLevel: 'warning',
    banner: {
      js: '// Ageben parser: https://clarityconlang.com/llms.txt. Run `node ageben.mjs --help`.',
    },
    plugins: [
      {
        name: 'ageben-data',
        setup(build) {
          build.onResolve({ filter: /^ageben:data$/ }, () => ({ path: 'ageben:data', namespace: 'ageben-data' }))
          build.onLoad({ filter: /.*/, namespace: 'ageben-data' }, () => ({ contents: data, loader: 'js' }))
        },
      },
    ],
  })
  return result.outputFiles[0]!.text
}

#!/usr/bin/env node
/**
 * After VitePress writes dist/grammar/, add Amplify publish extras:
 * root index (home vs 404), copy of 404.html, stubs for pageMoves, and the
 * plain-Markdown copies for AI agents (llms.txt, llms-full.txt, per-page .md).
 */
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  amplifyRedirectRules,
  loadSiteRedirects,
  rootIndexHtml,
  stubHtml,
} from './lib/site-redirects.ts'
import { llmsFiles } from './lib/llms-txt.ts'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')

const map = loadSiteRedirects()
mkdirSync(DIST, { recursive: true })
writeFileSync(join(DIST, 'index.html'), rootIndexHtml())

const grammar404 = join(DIST, 'grammar', '404.html')
copyFileSync(grammar404, join(DIST, '404.html'))

for (const move of map.pageMoves) {
  const dest = join(DIST, move.from.replace(/^\//, ''))
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, stubHtml(move))
}

writeFileSync(
  join(DIST, 'amplify-redirects.json'),
  `${JSON.stringify(amplifyRedirectRules(map), null, 2)}\n`,
)

for (const [path, body] of llmsFiles()) {
  const dest = join(DIST, path)
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, body)
}

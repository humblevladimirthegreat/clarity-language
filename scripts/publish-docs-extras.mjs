#!/usr/bin/env node
/**
 * After VitePress writes dist/grammar/, add Amplify publish extras:
 * root index (home vs 404), copy of 404.html, stubs for pageMoves, and the
 * plain-Markdown copies for AI agents (llms.txt, llms-full.txt, per-page .md), and the
 * parser bundle agents can run (tools/ageben.mjs), and the Claritish flashcard pack
 * (grammar/flashcards/claritish.apkg, packaged by .venv/bin/python with genanki).
 */
import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  amplifyRedirectRules,
  loadSiteRedirects,
  rootIndexHtml,
  stubHtml,
} from './lib/site-redirects.ts'
import { agentBundle, AGENT_BUNDLE_PATH } from './lib/agent-bundle.ts'
import { llmsFiles } from './lib/llms-txt.ts'
import { claritishLessons } from '../docs/grammar/.vitepress/lib/reading-order.ts'
import { CLARITISH_APKG_PATH } from '../docs/grammar/.vitepress/lib/claritish-flashcards.data.ts'
import { claritishPackJson, loadClaritishPack } from '../src/flashcards-claritish.ts'
import { tmpPath } from '../src/tmp-paths.ts'

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

const bundleDest = join(DIST, AGENT_BUNDLE_PATH)
mkdirSync(dirname(bundleDest), { recursive: true })
writeFileSync(bundleDest, await agentBundle())

// Claritish flashcards: same pack JSON as `npm run flashcards -- --pack claritish`, without the
// Anki import check (publishing installs only requirements-publish.txt). A failure fails the deploy.
const python = join(ROOT, '.venv', 'bin', 'python')
if (!existsSync(python)) {
  throw new Error('no .venv/bin/python: create it with `python3 -m venv .venv && .venv/bin/pip install -r requirements-publish.txt`')
}
const pack = loadClaritishPack(claritishLessons)
const packJson = tmpPath('out', 'flashcards', 'claritish-publish.json')
mkdirSync(dirname(packJson), { recursive: true })
writeFileSync(
  packJson,
  `${JSON.stringify(claritishPackJson(pack), null, 1)}\n`,
)
const apkg = join(DIST, 'grammar', CLARITISH_APKG_PATH.replace(/^\//, ''))
mkdirSync(dirname(apkg), { recursive: true })
const packaged = spawnSync(python, [join(ROOT, 'scripts', 'flashcards-package.py'), packJson, apkg], { stdio: 'inherit' })
if (packaged.status !== 0) {
  throw new Error(`flashcards-package.py failed (status ${packaged.status ?? packaged.signal}) for ${apkg}`)
}
console.log(`claritish flashcards: ${pack.notes.length} notes in ${pack.decks.length} deck(s), release ${pack.releaseId} → dist/grammar${CLARITISH_APKG_PATH}`)

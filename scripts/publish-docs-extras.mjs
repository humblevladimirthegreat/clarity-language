#!/usr/bin/env node
/**
 * After VitePress writes dist/grammar/, add Amplify publish extras:
 * root index (home vs 404), copy of 404.html, stubs for pageMoves, and the
 * plain-Markdown copies for AI agents (llms.txt, llms-full.txt, per-page .md), and the
 * parser bundle agents can run (tools/ageben.mjs), and the flashcard packs: Claritish
 * (grammar/flashcards/claritish.apkg) and the four Ageben packs (grammar/flashcards/ageben-<pack>.apkg),
 * packaged by .venv/bin/python with genanki.
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
import { claritishLessons, lessonPages, levelReviewPages } from '../docs/grammar/.vitepress/lib/reading-order.ts'
import { AGEBEN_APKG_PATHS } from '../docs/grammar/.vitepress/lib/flashcards.data.ts'
import { CLARITISH_APKG_PATH } from '../docs/grammar/.vitepress/lib/claritish-flashcards.data.ts'
import { claritishPackJson, loadClaritishPack } from '../src/flashcards-claritish.ts'
import { buildNotes, loadFlashcardInputs, packJson as agebenPackJson } from '../src/flashcards.ts'
import { buildPack, noteCards } from '../src/flashcards-packs.ts'
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

// Ageben flashcards: the same pack JSON as `npm run flashcards`, packaged the same way.
const inputs = loadFlashcardInputs(lessonPages(), levelReviewPages)
const notes = buildNotes(inputs)
for (const { pack: id, path } of AGEBEN_APKG_PATHS) {
  const started = Date.now()
  const built = buildPack(id, notes, inputs)
  const json = tmpPath('out', 'flashcards', `ageben-${id}-publish.json`)
  writeFileSync(json, `${JSON.stringify(agebenPackJson(built), null, 1)}\n`)
  const out = join(DIST, 'grammar', path.replace(/^\//, ''))
  const run = spawnSync(python, [join(ROOT, 'scripts', 'flashcards-package.py'), json, out], { stdio: 'inherit' })
  if (run.status !== 0) {
    throw new Error(`flashcards-package.py failed (status ${run.status ?? run.signal}) for ${out}`)
  }
  const packNotes = built.decks.flatMap((d) => d.notes)
  const cards = packNotes.reduce((n, note) => n + noteCards(note), 0)
  console.log(`ageben ${id} flashcards: ${packNotes.length} notes, ${cards} cards in ${built.decks.length} deck(s) → dist/grammar${path} (${Date.now() - started} ms)`)
}

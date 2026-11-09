import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, describe, it } from 'node:test'
import { pathToFileURL } from 'node:url'

import { agentBundle } from './agent-bundle.ts'

describe('agent bundle', () => {
  // Outside the repo, so nothing can fall back to data/ or node_modules/.
  const dir = mkdtempSync(join(tmpdir(), 'ageben-bundle-'))
  const file = join(dir, 'ageben.mjs')
  type Bundle = typeof import('../../src/agent/ageben.ts')
  let mod: Bundle

  before(async () => {
    writeFileSync(file, await agentBundle())
    mod = (await import(pathToFileURL(file).href)) as Bundle
  })
  after(() => rmSync(dir, { recursive: true, force: true }))

  it('checks input with the built-in lexicon', () => {
    const good = mod.check('zahelan howar voguvol.')
    assert.equal(good.ok, true)
    assert.ok(good.gloss)
    assert.deepEqual(good.unknown, [])
    const bad = mod.check('zahelan howr voguvol.')
    assert.equal(bad.ok, false)
    assert.match(bad.error ?? '', /howr|Expected/)
  })

  it('builds the translation prompt with its examples', () => {
    assert.match(mod.translationPrompt('zahelan howar voguvol.'), /How to read the gloss/)
  })

  it('runs as a CLI and exits 1 on a failed input', () => {
    const out = execFileSync(process.execPath, [file, 'zahelan howar voguvol.'], { encoding: 'utf8' })
    assert.match(out, /^zahelan howar voguvol\.\n {2}\S/)
    const failed = spawnSync(process.execPath, [file, 'zahelan howr voguvol.'], { encoding: 'utf8' })
    assert.equal(failed.status, 1)
    assert.match(failed.stdout, /ERROR word "howr"/)
  })

  it('does nothing on import', () => {
    const run = spawnSync(process.execPath, ['--input-type=module', '-e', `await import(${JSON.stringify(pathToFileURL(file).href)})`], {
      encoding: 'utf8',
    })
    assert.equal(run.status, 0)
    assert.equal(run.stdout, '')
  })
})

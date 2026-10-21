import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

import { listMarkdown } from '../../../../src/markdown-files.ts'
import { REPO_ROOT } from '../../../../src/repo-paths.ts'
import { IPA_HASH_DIRS, ipaAudioUrl } from './ipa-audio.ts'

describe('ipa-audio', () => {
  it('stores each clip under the MD5 of its name', () => {
    for (const [file, dir] of Object.entries(IPA_HASH_DIRS)) {
      const md5 = createHash('md5').update(file).digest('hex')
      assert.equal(dir, `${md5[0]}/${md5.slice(0, 2)}`, file)
    }
  })

  it('has a path for every IpaPlay file on the grammar pages', () => {
    const missing = new Set<string>()
    for (const md of listMarkdown(join(REPO_ROOT, 'docs/grammar'))) {
      for (const [, file] of readFileSync(md, 'utf8').matchAll(/<IpaPlay file="([^"]+)"/g)) {
        if (!ipaAudioUrl(file!)) missing.add(file!)
      }
    }
    assert.deepEqual([...missing], [], 'add these to IPA_HASH_DIRS')
  })

  it('links to the upload host', () => {
    assert.equal(
      ipaAudioUrl('Close_central_rounded_vowel.ogg'),
      'https://upload.wikimedia.org/wikipedia/commons/6/66/Close_central_rounded_vowel.ogg',
    )
  })
})

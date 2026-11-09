import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { cleanPageMarkdown, linkSlug, llmsSections, resolveLink, SITE_ORIGIN } from './llms-txt.ts'

const G = `${SITE_ORIGIN}/grammar/`

describe('llms-txt', () => {
  it('maps sidebar links to public slugs', () => {
    assert.equal(linkSlug('/'), 'index')
    assert.equal(linkSlug('/claritish/'), 'claritish/index')
    assert.equal(linkSlug('/clause#role-letters'), 'clause')
  })

  it('resolves page links to absolute HTML URLs', () => {
    assert.equal(resolveLink('/clause#x', 'joins'), `${G}clause.html#x`)
    assert.equal(resolveLink('word-endings.md', 'clause'), `${G}word-endings.html`)
    assert.equal(resolveLink('could-be.md', 'claritish/labels'), `${G}claritish/could-be.html`)
    assert.equal(resolveLink('../clause.md#a', 'claritish/labels'), `${G}clause.html#a`)
    assert.equal(resolveLink('#here', 'joins'), `${G}joins.html#here`)
    assert.equal(resolveLink('https://example.org/a', 'joins'), 'https://example.org/a')
  })

  it('strips site-only markup and keeps fenced code as written', () => {
    const source = [
      '---',
      'band: beginner',
      '---',
      '# Title {#top}',
      '',
      'Say *bottle* <IpaPlay file="x.mp3" label="bottle" />, see [clause](/clause).',
      '<!-- generated -->',
      '<code>d&lt;NaCl&gt;</code>',
      '```',
      '<Keep /> [x](/clause)',
      '```',
    ].join('\n')
    assert.equal(
      cleanPageMarkdown(source, 'phonology', '/nowhere.md'),
      [
        '# Title',
        '',
        `Say *bottle*, see [clause](${G}clause.html).`,
        '',
        '`d<NaCl>`',
        '```',
        '<Keep /> [x](/clause)',
        '```',
      ].join('\n'),
    )
  })

  it('loads every sidebar page with no Vue components left', () => {
    for (const page of llmsSections().flatMap((section) => section.pages)) {
      assert.doesNotMatch(page.markdown, /<\/?[A-Z][A-Za-z]*\b[^>]*>(?![^`]*`)/, page.slug)
    }
  })
})

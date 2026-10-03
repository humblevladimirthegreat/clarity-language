import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'
import { buildStampIso, formatBuildStampEt } from './lib/build-stamp.ts'
import { injectInArticleToc } from './lib/inject-in-article-toc.ts'
import { learnerNameSlots } from './lib/learner-name-md.ts'
import { readingOrder } from './lib/reading-order.ts'

const buildAt = new Date()

const repoRoot = fileURLToPath(new URL('../../..', import.meta.url))
const dataDir = fileURLToPath(new URL('../../../data', import.meta.url))
const srcDir = fileURLToPath(new URL('../../../src', import.meta.url))

export default defineConfig({
  title: 'Agazan Grammar',
  description:
    'Learner grammar for Agazan — compassion, rationality, and empowerment encoded in vocabulary and grammar.',
  base: '/grammar/',
  // Repo root `dist/grammar/` so Amplify can publish `dist/` and serve at /grammar/
  outDir: '../../dist/grammar',
  // Amplify static hosting serves `.html` files as-is; avoid extensionless URLs
  cleanUrls: false,
  ignoreDeadLinks: false,
  vite: {
    define: {
      __SITE_BUILD_ISO__: JSON.stringify(buildStampIso(buildAt)),
      __SITE_BUILD_ET__: JSON.stringify(formatBuildStampEt(buildAt)),
    },
    resolve: {
      alias: {
        '@data': dataDir,
        '@lexicon-search': `${srcDir}/lexicon-search.ts`,
        '@learner-name': `${srcDir}/learner-name.ts`,
        '@parse-browser': `${srcDir}/parse/browser.ts`,
        '@tts-browser': `${srcDir}/tts/browser.ts`,
      },
    },
    worker: {
      format: 'es',
    },
    server: {
      fs: {
        allow: [repoRoot],
      },
    },
  },
  themeConfig: {
    nav: [
      { text: 'Why Agazan', link: '/' },
      { text: 'Introduction', link: '/introduction' },
      { text: 'Clause', link: '/clause' },
      { text: 'Lexicon', link: '/lexicon' },
      { text: 'Inspect', link: '/inspect' },
      { text: 'Terminology', link: '/terminology' },
      { text: 'Saying it in Agazan', link: '/english' },
      { text: 'Claritish', link: '/claritish/' },
    ],
    sidebar: [
      {
        text: 'Suggested reading order',
        items: readingOrder,
      },
      {
        text: 'Saying it in Agazan',
        items: [
          { text: 'Overview', link: '/english' },
          { text: 'People, things and places', link: '/say-people-places' },
          { text: 'Amounts, sizes and time', link: '/say-amounts' },
          { text: 'Reasons, knowledge and plans', link: '/say-reasons' },
          { text: 'Asking and answering', link: '/say-questions' },
          { text: 'Tense and modals', link: '/say-tense' },
        ],
      },
      {
        text: 'Claritish: Agazan in English',
        items: [
          { text: 'Introduction', link: '/claritish/' },
          { text: '1. How sure are you?', link: '/claritish/could-be' },
          { text: '2. How do you know?', link: '/claritish/how-you-know' },
          { text: '3. Labels', link: '/claritish/labels' },
          { text: '4. Thanks and sorry', link: '/claritish/thanks-and-sorry' },
          { text: '5. Allowed, required, agreed', link: '/claritish/allowed-required-agreed' },
          { text: '6. Decisions and tries', link: '/claritish/decisions-and-tries' },
          { text: '7. Feelings in three parts', link: '/claritish/feelings' },
          { text: 'Bonus: Tone marks', link: '/claritish/tone-marks' },
          { text: 'Learn the full language', link: '/claritish/learn-agazan' },
        ],
      },
      {
        text: 'Tools',
        items: [
          { text: 'Lexicon', link: '/lexicon' },
          { text: 'Inspect', link: '/inspect' },
          { text: 'Terminology', link: '/terminology' },
        ],
      },
    ],
    outline: {
      level: [2, 3],
    },
    search: {
      provider: 'local',
    },
    notFound: {
      title: 'PAGE NOT FOUND',
      quote:
        'This page is not in the grammar. The link may be outdated or mistyped. Check the sidebar for the reading order and tools, or use the search bar in the header.',
      linkText: 'Take me home',
      linkLabel: 'go to home',
    },
  },
  markdown: {
    toc: { level: [2, 3] },
    config(md) {
      injectInArticleToc(md)
      learnerNameSlots(md)
    },
  },
})

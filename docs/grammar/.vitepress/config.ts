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
      { text: 'Agazan Introduction', link: '/introduction' },
      { text: 'Clause', link: '/clause' },
      { text: 'Lexicon', link: '/lexicon' },
      { text: 'Inspect', link: '/inspect' },
      { text: 'Terminology', link: '/terminology' },
      { text: 'Saying it in Agazan', link: '/english' },
      { text: 'Claritish', link: '/claritish/' },
    ],
    sidebar: [
      {
        text: 'Claritish: Agazan in English',
        collapsed: true,
        items: [
          { text: 'Claritish Introduction', link: '/claritish/' },
          { text: 'How sure are you?', link: '/claritish/could-be' },
          { text: 'How do you know?', link: '/claritish/how-you-know' },
          { text: 'Labels', link: '/claritish/labels' },
          { text: 'Can and can\'t', link: '/claritish/can-and-cant' },
          { text: 'Thanks and sorry', link: '/claritish/thanks-and-sorry' },
          { text: 'Allowed, required, agreed', link: '/claritish/allowed-required-agreed' },
          { text: 'Oughts and motives', link: '/claritish/oughts-and-motives' },
          { text: 'Wants and plans', link: '/claritish/wants-and-plans' },
          { text: 'Decisions and tries', link: '/claritish/decisions-and-tries' },
          { text: 'Feelings in three parts', link: '/claritish/feelings' },
          { text: 'Bonus: Tone marks', link: '/claritish/tone-marks' },
          { text: 'Learn the full language', link: '/claritish/learn-agazan' },
          { text: 'Cheat sheet', link: '/claritish/cheat-sheet' },
        ],
      },
      {
        text: 'Agazan Lessons',
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
        text: 'Tools',
        items: [
          { text: 'Lexicon', link: '/lexicon' },
          { text: 'Inspect', link: '/inspect' },
          { text: 'Terminology', link: '/terminology' },
        ],
      },
      {
        text: 'Cheat Sheets',
        items: [
          { text: 'Joins and hooks', link: '/cheat-sheets/joins-hooks' },
          { text: 'Agazan → English', link: '/cheat-sheets/agazan-english' },
          { text: 'Exceptions', link: '/cheat-sheets/exceptions' },
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

import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'
import { ensureCmuDict } from '../../../src/echo-pronunciation.ts'
import { buildStampIso, formatBuildStampEt } from './lib/build-stamp.ts'
import { injectInArticleToc } from './lib/inject-in-article-toc.ts'
import { learnerNameSlots } from './lib/learner-name-md.ts'
import { cheatSheetSidebar, orientation, sidebarGroups } from './lib/reading-order.ts'

const buildAt = new Date()

const repoRoot = fileURLToPath(new URL('../../..', import.meta.url))
const dataDir = fileURLToPath(new URL('../../../data', import.meta.url))
const srcDir = fileURLToPath(new URL('../../../src', import.meta.url))
const cmuDict = fileURLToPath(new URL('../../../tmp/cmudict.dict', import.meta.url))
const cmuPublic = fileURLToPath(new URL('../public/cmudict.dict', import.meta.url))

await ensureCmuDict()
mkdirSync(dirname(cmuPublic), { recursive: true })
copyFileSync(cmuDict, cmuPublic)

export default defineConfig({
  title: 'Ageben Grammar',
  description:
    'Learner grammar for Ageben — compassion, rationality, and empowerment encoded in vocabulary and grammar.',
  base: '/grammar/',
  rewrites: {
    'beginner/:page': ':page',
    'intermediate/:page': ':page',
    'advanced/:page': ':page',
  },
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
        '@claritish-editor-browser': `${srcDir}/claritish-editor/browser.ts`,
        '@claritish-owned-noun': `${srcDir}/claritish-editor/owned-noun.ts`,
        '@english-helper-browser': `${srcDir}/english-helper/browser.ts`,
        '@lexicon-search': `${srcDir}/lexicon-search.ts`,
        '@learner-name': `${srcDir}/learner-name.ts`,
        '@cmu-lookup': `${srcDir}/cmu-lookup.ts`,
        '@digit-pegs': `${srcDir}/digit-pegs.ts`,
        '@finger-code': `${srcDir}/finger-code.ts`,
        '@game-browser': `${srcDir}/game/index.ts`,
        '@name-respell': `${srcDir}/name-respell.ts`,
        '@parse-browser': `${srcDir}/parse/browser.ts`,
        '@tts-browser': `${srcDir}/tts/browser.ts`,
        '@vowel-pitch': `${srcDir}/vowel-pitch.ts`,
      },
    },
    worker: {
      format: 'es',
    },
    server: {
      fs: {
        allow: [repoRoot],
      },
      // Rebuild on disk; the tab only picks up changes on a manual refresh.
      hmr: false,
    },
  },
  themeConfig: {
    nav: [
      { text: 'Lexicon', link: '/lexicon' },
      { text: 'Inspect', link: '/inspect' },
      { text: 'Claritish', link: '/claritish/' },
    ],
    socialLinks: [
      { icon: 'reddit', link: 'https://www.reddit.com/r/ClarityLanguage', ariaLabel: 'Ageben on Reddit' },
      { icon: 'discord', link: 'https://discord.gg/CAMGw2Akhc', ariaLabel: 'Ageben on Discord' },
    ],
    sidebar: [
      {
        text: 'Claritish: Ageben in English',
        collapsed: true,
        items: [
          { text: 'Claritish Introduction', link: '/claritish/' },
          { text: 'How sure are you?', link: '/claritish/could-be' },
          { text: 'How do you know?', link: '/claritish/how-you-know' },
          { text: 'Labels', link: '/claritish/labels' },
          { text: 'Can and can\'t', link: '/claritish/can-and-cant' },
          { text: 'Thanks and sorry', link: '/claritish/thanks-and-sorry' },
          { text: 'Allowed and required', link: '/claritish/allowed-required-agreed' },
          { text: 'Oughts and motives', link: '/claritish/oughts-and-motives' },
          { text: 'Wants and plans', link: '/claritish/wants-and-plans' },
          { text: 'Decisions and tries', link: '/claritish/decisions-and-tries' },
          { text: 'Feelings in three parts', link: '/claritish/feelings' },
          { text: 'Bonus: Tone marks', link: '/claritish/tone-marks' },
          { text: 'Learn the full language', link: '/claritish/learn' },
          { text: 'Cheat sheet', link: '/claritish/cheat-sheet' },
          { text: 'Journal editor', link: '/claritish/editor' },
        ],
      },
      ...orientation,
      ...sidebarGroups,
      {
        text: 'Saying it in Ageben',
        collapsed: true,
        items: [
          { text: 'Overview', link: '/english' },
          { text: 'People and places', link: '/say-people-places' },
          { text: 'Amounts, sizes and time', link: '/say-amounts' },
          { text: 'Reasons and plans', link: '/say-reasons' },
          { text: 'Asking and answering', link: '/say-questions' },
          { text: 'Tense and modals', link: '/say-tense' },
        ],
      },
      {
        text: 'Tools',
        items: [
          { text: 'Lexicon', link: '/lexicon' },
          { text: 'Inspect', link: '/inspect' },
          { text: 'Number Pegs', link: '/pegs' },
          { text: 'Finger Code', link: '/finger-code' },
          { text: 'Terminology', link: '/terminology' },
        ],
      },
      {
        text: 'Cheat Sheets',
        collapsed: true,
        items: cheatSheetSidebar,
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

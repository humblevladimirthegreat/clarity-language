import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'
import { injectInArticleToc } from './lib/inject-in-article-toc'
import { ortWasmPlugin } from './lib/ort-wasm-plugin'

const repoRoot = fileURLToPath(new URL('../../..', import.meta.url))
const dataDir = fileURLToPath(new URL('../../../data', import.meta.url))
const srcDir = fileURLToPath(new URL('../../../src', import.meta.url))

const readingOrder = [
  { text: 'Why Agalan', link: '/' },
  { text: 'Introduction', link: '/introduction' },
  { text: 'Core', link: '/core' },
  { text: 'Vowel series', link: '/vowel-series' },
  { text: 'Phonology', link: '/phonology' },
  { text: 'Reference suffix', link: '/reference-suffix' },
  { text: 'Pronouns', link: '/pronouns' },
  { text: 'Plurality', link: '/plurality' },
  { text: 'Predication', link: '/predication' },
  { text: 'Coordination', link: '/coordination' },
  { text: 'Questions', link: '/questions' },
  { text: 'Revisers', link: '/revisers' },
  { text: 'Restrictors', link: '/restrictors' },
  { text: 'Spans', link: '/spans' },
  { text: 'Numbers', link: '/numbers' },
  { text: 'Comparatives', link: '/comparatives' },
  { text: 'Causation', link: '/causation' },
  { text: 'Values', link: '/values' },
  { text: 'Ability', link: '/ability' },
  { text: 'Commentary', link: '/commentary' },
  { text: 'Roles', link: '/roles' },
  { text: 'x-compounds', link: '/x-compounds' },
  { text: 'Plan / decision', link: '/plan-decision' },
  { text: 'Join extras', link: '/join-extras' },
  { text: 'Special vocabulary', link: '/special-vocabulary' },
  { text: 'Numeric derivation', link: '/numeric-derivation' },
]

export default defineConfig({
  title: 'Agalan Grammar',
  description:
    'Learner grammar for Agalan — compassion, rationality, and empowerment encoded in vocabulary and grammar.',
  base: '/grammar/',
  // Repo root `dist/grammar/` so Amplify can publish `dist/` and serve at /grammar/
  outDir: '../../dist/grammar',
  // Amplify static hosting serves `.html` files as-is; avoid extensionless URLs
  cleanUrls: false,
  ignoreDeadLinks: false,
  vite: {
    plugins: [ortWasmPlugin(repoRoot, '/grammar/')],
    resolve: {
      alias: {
        '@data': dataDir,
        '@lexicon-search': `${srcDir}/lexicon-search.ts`,
        '@parse-browser': `${srcDir}/parse/browser.ts`,
        '@tts-browser': `${srcDir}/tts/browser.ts`,
      },
    },
    optimizeDeps: {
      exclude: ['onnxruntime-web'],
    },
    server: {
      fs: {
        allow: [repoRoot],
      },
    },
  },
  themeConfig: {
    nav: [
      { text: 'Why Agalan', link: '/' },
      { text: 'Introduction', link: '/introduction' },
      { text: 'Core', link: '/core' },
      { text: 'Lexicon', link: '/lexicon' },
      { text: 'Inspect', link: '/inspect' },
      { text: 'Terminology', link: '/terminology' },
    ],
    sidebar: [
      {
        text: 'Suggested reading order',
        items: readingOrder,
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
  },
  markdown: {
    toc: { level: [2, 3] },
    config(md) {
      injectInArticleToc(md)
    },
  },
})

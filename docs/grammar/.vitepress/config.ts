import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'

const repoRoot = fileURLToPath(new URL('../../..', import.meta.url))
const dataDir = fileURLToPath(new URL('../../../data', import.meta.url))
const srcDir = fileURLToPath(new URL('../../../src', import.meta.url))

const readingOrder = [
  { text: 'Why Agelan', link: '/' },
  { text: 'Introduction', link: '/introduction' },
  { text: 'Core', link: '/core' },
  { text: 'Phonology', link: '/phonology' },
  { text: 'Reference suffix', link: '/reference-suffix' },
  { text: 'Pronouns', link: '/pronouns' },
  { text: 'Plurality', link: '/plurality' },
  { text: 'Questions', link: '/questions' },
  { text: 'Predication', link: '/predication' },
  { text: 'Revisers', link: '/revisers' },
  { text: 'Restrictors', link: '/restrictors' },
  { text: 'Coordination', link: '/coordination' },
  { text: 'Spans', link: '/spans' },
  { text: 'Numbers', link: '/numbers' },
  { text: 'Comparatives', link: '/comparatives' },
  { text: 'Causation', link: '/causation' },
  { text: 'Values', link: '/values' },
  { text: 'Special vocabulary', link: '/special-vocabulary' },
  { text: 'x-compounds', link: '/x-compounds' },
]

export default defineConfig({
  title: 'Agelan Grammar',
  description:
    'Learner grammar for Agelan — compassion, rationality, and empowerment encoded in vocabulary and grammar.',
  base: '/grammar/',
  // Repo root `dist/grammar/` so Amplify can publish `dist/` and serve at /grammar/
  outDir: '../../dist/grammar',
  // Amplify static hosting serves `.html` files as-is; avoid extensionless URLs
  cleanUrls: false,
  ignoreDeadLinks: false,
  vite: {
    resolve: {
      alias: {
        '@data': dataDir,
        '@lexicon-search': `${srcDir}/lexicon-search.ts`,
      },
    },
    server: {
      fs: {
        allow: [repoRoot],
      },
    },
  },
  themeConfig: {
    nav: [
      { text: 'Why Agelan', link: '/' },
      { text: 'Introduction', link: '/introduction' },
      { text: 'Core', link: '/core' },
      { text: 'Lexicon', link: '/lexicon' },
    ],
    sidebar: [
      {
        text: 'Suggested reading order',
        items: readingOrder,
      },
      {
        text: 'Tools',
        items: [{ text: 'Lexicon', link: '/lexicon' }],
      },
    ],
    outline: {
      level: [2, 3],
    },
    search: {
      provider: 'local',
    },
  },
})

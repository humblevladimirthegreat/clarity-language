import { defineConfig } from 'vitepress'

const readingOrder = [
  { text: 'Introduction', link: '/' },
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
  title: 'Clarity Grammar',
  description:
    'Learner grammar for Clarity — compassion, rationality, and empowerment encoded in vocabulary and grammar.',
  base: '/grammar/',
  // Repo root `dist/grammar/` so Amplify can publish `dist/` and serve at /grammar/
  outDir: '../../dist/grammar',
  // Amplify static hosting serves `.html` files as-is; avoid extensionless URLs
  cleanUrls: false,
  ignoreDeadLinks: false,
  themeConfig: {
    nav: [
      { text: 'Introduction', link: '/' },
      { text: 'Core', link: '/core' },
    ],
    sidebar: [
      {
        text: 'Suggested reading order',
        items: readingOrder,
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

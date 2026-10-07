/** Grammar reading order: the sidebar, and the learning order the docs lint checks against. */
export const readingOrder = [
  { text: 'Why Agazan', link: '/' },
  { text: 'Agazan Introduction', link: '/introduction' },
  { text: 'Phonology', link: '/phonology' },
  { text: 'Word endings', link: '/word-endings' },
  { text: 'Clause', link: '/clause' },
  { text: 'Speech moves', link: '/speech-moves' },
  { text: 'Dependents', link: '/dependents' },
  { text: 'Pronouns', link: '/pronouns' },
  { text: 'Plurality', link: '/plurality' },
  { text: 'Predication', link: '/predication' },
  { text: 'Joins', link: '/joins' },
  { text: 'Questions', link: '/questions' },
  { text: 'Hooks', link: '/hooks' },
  { text: 'Restrictors', link: '/restrictors' },
  { text: 'Relations', link: '/relations' },
  { text: 'Spans', link: '/spans' },
  { text: 'Numbers', link: '/numbers' },
  { text: 'Comparatives', link: '/comparatives' },
  { text: 'Causation', link: '/causation' },
  { text: 'Sakes', link: '/sakes' },
  { text: 'Knowing', link: '/knowing' },
  { text: 'Role compounds', link: '/roles' },
  { text: 'x-compounds', link: '/x-compounds' },
  { text: 'Intention', link: '/intention' },
  { text: 'Join across roles', link: '/join-across-roles' },
  { text: 'Numbers in use', link: '/numbers-applied' },
  { text: 'Numeric derivation', link: '/numeric-derivation' },
]

/**
 * Level reviews: one page with a band per level. The docs lint reads it after every stage page,
 * so each band's review comes after every stage band of that level.
 */
export const levelReviewPage = 'review.md'

/** Sidebar links to each level's review band. */
export const levelReviews = [
  { text: 'Beginner review', link: '/review#beginner' },
]

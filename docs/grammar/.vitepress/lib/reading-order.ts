import { holdingList, type HoldingSitting } from './holding-list.js'

/** Grammar reading order: the sidebar, and the learning order the docs lint checks against. */
export const readingOrder = [
  { text: 'Why Agebon', link: '/' },
  { text: 'Agebon Introduction', link: '/introduction' },
  { text: 'Phonology', link: '/phonology' },
  { text: 'Word endings', link: '/word-endings' },
  { text: 'Clause', link: '/clause' },
  { text: 'Speech moves', link: '/speech-moves' },
  { text: 'Dependents', link: '/dependents' },
  { text: 'Pronouns', link: '/pronouns' },
  { text: 'Topic', link: '/topic' },
  { text: 'Plurality', link: '/plurality' },
  { text: 'Predication', link: '/predication' },
  { text: 'Joins', link: '/joins' },
  { text: 'Questions', link: '/questions' },
  { text: 'Fill-ask roles', link: '/fill-ask-roles' },
  { text: 'Hooks', link: '/hooks' },
  { text: 'Discourse hooks', link: '/discourse-hooks' },
  { text: 'Restrictors', link: '/restrictors' },
  { text: 'Relations', link: '/relations' },
  { text: 'Spans', link: '/spans' },
  { text: 'Numbers', link: '/numbers' },
  { text: 'Digitless and exponents', link: '/digitless-exponents' },
  { text: 'Comparatives', link: '/comparatives' },
  { text: 'Causation', link: '/causation' },
  { text: 'Sakes', link: '/sakes' },
  { text: 'Feelings and permission', link: '/feelings-permission' },
  { text: 'Knowing', link: '/knowing' },
  { text: 'Notional and standing', link: '/notional-standing' },
  { text: 'Role compounds', link: '/roles' },
  { text: 'Compounds', link: '/compounds' },
  { text: 'Intention', link: '/intention' },
  { text: 'Join across roles', link: '/join-across-roles' },
  { text: 'Numbers in use', link: '/numbers-applied' },
  { text: 'Numeric prefixes', link: '/numeric-derivation' },
]

/**
 * Level reviews: one page with a band per level. The docs lint reads it after every stage page,
 * so each band's review comes after every stage band of that level.
 */
export const levelReviewPage = 'review.md'

/** Sidebar links to each level's review band. */
export const levelReviews = [
  { text: 'Beginner review', link: '/review#beginner' },
  { text: 'Intermediate review', link: '/review#intermediate' },
  { text: 'Advanced review', link: '/review#advanced' },
]

function pageFile(link: string): string {
  const path = link.split(/[?#]/, 1)[0]!.replace(/^\//, '').replace(/\.(?:md|html)$/, '')
  return `${path || 'index'}.md`
}

/** Sidebar lessons plus holding-list sittings after their parent. */
export function lessonPages(
  lessons: readonly { text: string; link: string }[] = readingOrder,
  holding: readonly HoldingSitting[] = holdingList,
): { page: string; title: string }[] {
  const out: { page: string; title: string }[] = []
  for (const item of lessons) {
    const page = pageFile(item.link)
    out.push({ page, title: item.text })
    for (const sitting of holding) {
      if (sitting.parent === page) out.push({ page: sitting.page, title: sitting.title })
    }
  }
  return out
}

/**
 * Stage pages in path order, level review last. Holding-list sittings sit after
 * their parent so Intermediate/Advanced peels stay in the right band walk.
 */
export function pathPages(
  lessons: readonly { text: string; link: string }[] = readingOrder,
  holding: readonly HoldingSitting[] = holdingList,
  review = levelReviewPage,
): string[] {
  return [...lessonPages(lessons, holding).map((item) => item.page), review]
}

/** Orientation rows sit above the three lesson groups and are not sittings. */
export const orientation = [
  { text: 'Why Ageben', link: '/' },
  { text: 'Ageben Introduction', link: '/introduction' },
]

/** Beginner sittings; the group’s Review is appended in `withReview`. */
export const beginnerLessons = [
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
  { text: 'Compounds', link: '/compounds' },
  { text: 'Intention', link: '/intention' },
  { text: 'Adjectives first', link: '/left-bound-adjectives' },
  { text: 'Firm and soft', link: '/firm-soft' },
  { text: 'Extra nouns and whose', link: '/extra-noun-hooks' },
  { text: 'Here and there', link: '/here-there' },
  { text: 'Fill-ask jobs', link: '/fill-ask-jobs' },
  { text: 'Social relations', link: '/social-ties' },
  { text: 'Clause sequence', link: '/clause-sequence' },
  { text: 'Digits and time', link: '/digit-strings' },
  { text: 'Label seams', link: '/label-seams' },
  { text: 'Fault', link: '/fault' },
  { text: 'Ought for a sake', link: '/ought-for-a-sake' },
  { text: 'Thanks and sorry', link: '/thanks-and-sorry' },
  { text: 'Live and memory', link: '/live-and-memory' },
  { text: 'Already and still', link: '/already-still-yet' },
  { text: "Can and can't", link: '/can-and-cant' },
]

/** Intermediate sittings, in the same topic order as the Beginner group. */
export const intermediateLessons = [
  { text: 'Word shape and letter names', link: '/phonotactics' },
  { text: 'Names and titles', link: '/proper-names' },
  { text: 'Longer chains', link: '/left-bound' },
  { text: 'Doubling and stacking acts', link: '/speech-acts' },
  { text: 'Tone marks', link: '/tone-marks' },
  { text: 'Linking sentences', link: '/sentence-linkers' },
  { text: 'Tag pronouns', link: '/tag-pronouns' },
  { text: 'Topic', link: '/topic' },
  { text: 'The group as one', link: '/collectives' },
  { text: 'How a kind holds', link: '/label-scope' },
  { text: 'Rank joins', link: '/rank-joins' },
  { text: 'Every and none', link: '/universals-domains' },
  { text: 'Joins on the verb', link: '/vp-clause-forms' },
  { text: 'Stance joins', link: '/join-across-roles' },
  { text: 'Yes, no, and not that', link: '/polar-inventory' },
  { text: 'Who, which, and any', link: '/fill-ask-roles' },
  { text: 'Closed and open hooks', link: '/ending-grids' },
  { text: 'In fact, here, and anyway', link: '/discourse-hooks' },
  { text: 'Exclusive and ranked times', link: '/more-occasions' },
  { text: 'Part of, made of, from', link: '/of-relations' },
  { text: 'Mention and islands', link: '/span-mention' },
  { text: 'Number markers and endings', link: '/number-markers' },
  { text: 'How many and how big', link: '/digitless-exponents' },
  { text: 'Measures, ranges, and percent', link: '/numbers-applied' },
  { text: 'Place on a scale', link: '/comparative-arity' },
  { text: 'Because, iff, and make', link: '/iff-fault' },
  { text: 'Motive and stake', link: '/prescription' },
  { text: 'Feelings', link: '/feelings-permission' },
  { text: 'Permission and consent', link: '/permission-consent' },
  { text: 'How you know', link: '/evidentiality' },
  { text: 'Whose view', link: '/holder' },
  { text: 'Many and few', link: '/vague-amounts' },
  { text: 'Residue and former', link: '/notional-standing' },
  { text: 'It turns out', link: '/mirative' },
  { text: 'As if', link: '/notional' },
  { text: 'Left, right, and facing', link: '/viewpoint' },
  { text: 'Role scope', link: '/role-scope' },
  { text: 'Which compound', link: '/compound-families' },
  { text: 'Decision and try', link: '/ability' },
]

/** Advanced sittings, in the same topic order as the earlier groups. */
export const advancedLessons = [
  { text: 'Singing and speech edges', link: '/singability' },
  { text: 'Emphasis and audible start', link: '/emphasis' },
  { text: 'Stand-in words', link: '/stand-in-roles' },
  { text: 'Named lists and join limits', link: '/join-islands' },
  { text: 'Cite plus a hook', link: '/hook-compounds' },
  { text: 'Hook plus a join', link: '/hooked-joins' },
  { text: 'Whose now', link: '/as-of' },
  { text: 'Closing and nesting spans', link: '/span-nesting' },
  { text: 'From the end, and stacked marks', link: '/stacked-markers' },
  { text: 'Infinity, zero, and hyperbole', link: '/special-values' },
  { text: 'Every bar', link: '/stance-bars' },
  { text: 'Mood on one adjective', link: '/universality' },
  { text: 'Root tails', link: '/root-tails' },
  { text: 'Initials and rays', link: '/initials' },
  { text: 'Numeric prefixes', link: '/numeric-derivation' },
]

export const levelReviews = [
  { text: 'Review', link: '/review' },
  { text: 'Review', link: '/review-intermediate' },
  { text: 'Review', link: '/review-advanced' },
] as const

/** Beginner review slug; keep the public URL. */
export const levelReviewPage = 'review.md'

export const levelReviewPages = ['review.md', 'review-intermediate.md', 'review-advanced.md'] as const

export function isLevelReview(page: string): boolean {
  return (levelReviewPages as readonly string[]).includes(page)
}

export type LessonLink = { text: string; link: string }

/** Public slug for a cheat-sheet sidebar link (`/cheat-sheets/vowels` → `vowels`). */
export function cheatSheetSlug(link: string): string {
  const path = link.split(/[?#]/, 1)[0]!
  const match = /^\/cheat-sheets\/([^/]+)$/.exec(path)
  if (!match) throw new Error(`not a cheat-sheet link: ${link}`)
  return match[1]!
}

/** Cheat Sheets sidebar, in reading order (sounds, letter meanings, then subsystems; lookup sheets last). */
export const cheatSheetSidebar: LessonLink[] = [
  { text: 'Sounds and spelling', link: '/cheat-sheets/sounds-spelling' },
  { text: 'Vowels', link: '/cheat-sheets/vowels' },
  { text: 'Consonants', link: '/cheat-sheets/consonants' },
  { text: 'Word shape and clause', link: '/cheat-sheets/word-shape-clause' },
  { text: 'People and pointing', link: '/cheat-sheets/people-pointing' },
  { text: 'Talking', link: '/cheat-sheets/talking' },
  { text: 'Knowing and intending', link: '/cheat-sheets/knowing-intending' },
  { text: 'Why and allowed', link: '/cheat-sheets/why-allowed' },
  { text: 'Joins and hooks', link: '/cheat-sheets/joins-hooks' },
  { text: 'Restrictors and spans', link: '/cheat-sheets/restrictors-spans' },
  { text: 'Linking clauses', link: '/cheat-sheets/linking-clauses' },
  { text: 'Roles', link: '/cheat-sheets/roles' },
  { text: 'Comparing', link: '/cheat-sheets/comparing' },
  { text: 'Numbers', link: '/cheat-sheets/numbers' },
  { text: 'Ageben → English', link: '/cheat-sheets/to-english' },
]

function withReview(lessons: readonly LessonLink[], review: LessonLink): LessonLink[] {
  return [...lessons, review]
}

/** Three sidebar groups. Beginner, Intermediate, and Advanced start collapsed. */
export const sidebarGroups = [
  { text: 'Beginner', collapsed: true, items: withReview(beginnerLessons, levelReviews[0]) },
  { text: 'Intermediate', collapsed: true, items: withReview(intermediateLessons, levelReviews[1]) },
  { text: 'Advanced', collapsed: true, items: withReview(advancedLessons, levelReviews[2]) },
]

/**
 * Flattened curriculum: orientation, then Beginner (review last), Intermediate,
 * Advanced. Prev/next and the docs lint walk this list.
 */
export const readingOrder: LessonLink[] = [
  ...orientation,
  ...sidebarGroups[0]!.items,
  ...sidebarGroups[1]!.items,
  ...sidebarGroups[2]!.items,
]

function pageFile(link: string): string {
  const path = link.split(/[?#]/, 1)[0]!.replace(/^\//, '').replace(/\.(?:md|html)$/, '')
  return `${path || 'index'}.md`
}

const sittingNames = (lessons: readonly LessonLink[]) => new Set(lessons.map((item) => pageFile(item.link)))

const beginnerPages = sittingNames(beginnerLessons)
const intermediatePages = sittingNames(intermediateLessons)
const advancedPages = sittingNames(advancedLessons)

/** Disk path of a sitting or review relative to `docs/grammar/`. Public URLs stay flat. */
export function pageRelPath(page: string): string {
  const name = page.replace(/^.*\//, '')
  if (name === 'review.md' || beginnerPages.has(name)) return `beginner/${name}`
  if (name === 'review-intermediate.md' || intermediatePages.has(name)) return `intermediate/${name}`
  if (name === 'review-advanced.md' || advancedPages.has(name)) return `advanced/${name}`
  return name
}

/** Sidebar curriculum pages (orientation, sittings, and each group’s review). */
export function lessonPages(
  lessons: readonly LessonLink[] = readingOrder,
): { page: string; title: string }[] {
  return lessons.map((item) => ({ page: pageFile(item.link), title: item.text }))
}

/** Stage pages in path order, reviews last in each band group. */
export function pathPages(lessons: readonly LessonLink[] = readingOrder): string[] {
  return lessonPages(lessons).map((item) => item.page)
}

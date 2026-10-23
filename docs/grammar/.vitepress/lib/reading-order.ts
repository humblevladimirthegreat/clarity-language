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
  { text: 'Phonotactics', link: '/phonotactics' },
  { text: 'Names and titles', link: '/proper-names' },
  { text: 'Left-bound chaining', link: '/left-bound' },
  { text: 'Speech acts', link: '/speech-acts' },
  { text: 'Tone marks', link: '/tone-marks' },
  { text: 'Sentence linkers', link: '/sentence-linkers' },
  { text: 'Tag pronouns', link: '/tag-pronouns' },
  { text: 'Topic', link: '/topic' },
  { text: 'Collectives', link: '/collectives' },
  { text: 'Label scope', link: '/label-scope' },
  { text: 'Rank joins', link: '/rank-joins' },
  { text: 'Universals and domains', link: '/universals-domains' },
  { text: 'VP and clause forms', link: '/vp-clause-forms' },
  { text: 'Join across roles', link: '/join-across-roles' },
  { text: 'Polar inventory', link: '/polar-inventory' },
  { text: 'Fill-ask roles', link: '/fill-ask-roles' },
  { text: 'Ending grids', link: '/ending-grids' },
  { text: 'Discourse hooks', link: '/discourse-hooks' },
  { text: 'More occasions', link: '/more-occasions' },
  { text: 'Of-relations', link: '/of-relations' },
  { text: 'Mention and islands', link: '/span-mention' },
  { text: 'Number shape', link: '/number-markers' },
  { text: 'Digitless and exponents', link: '/digitless-exponents' },
  { text: 'Numbers in use', link: '/numbers-applied' },
  { text: 'Comparative scales', link: '/comparative-arity' },
  { text: 'Iff and CAUSE', link: '/iff-fault' },
  { text: 'Prescription and motive', link: '/prescription' },
  { text: 'Feelings and permission', link: '/feelings-permission' },
  { text: 'Evidentiality', link: '/evidentiality' },
  { text: 'Whose view', link: '/holder' },
  { text: 'Vague amounts', link: '/vague-amounts' },
  { text: 'Notional and standing', link: '/notional-standing' },
  { text: 'Viewpoint and landmark', link: '/viewpoint' },
  { text: 'Compound families', link: '/compound-families' },
  { text: 'Decision and try', link: '/ability' },
]

/** Advanced sittings, in the same topic order as the earlier groups. */
export const advancedLessons = [
  { text: 'Singability', link: '/singability' },
  { text: 'Emphasis', link: '/emphasis' },
  { text: 'Lexicalized stand-ins', link: '/stand-in-roles' },
  { text: 'Join islands', link: '/join-islands' },
  { text: 'Hook compounds', link: '/hook-compounds' },
  { text: 'Hooked joins', link: '/hooked-joins' },
  { text: 'As-of', link: '/as-of' },
  { text: 'Span nesting', link: '/span-nesting' },
  { text: 'Stacked markers', link: '/stacked-markers' },
  { text: 'Number stance', link: '/special-values' },
  { text: 'Stance bars', link: '/stance-bars' },
  { text: 'Universality', link: '/universality' },
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
  { text: 'Roles and comparing', link: '/cheat-sheets/roles-comparing' },
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

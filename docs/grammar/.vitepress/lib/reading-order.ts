/** Orientation rows sit above the three lesson groups and are not sittings. */
export const orientation = [
  { text: 'Why Agebon', link: '/' },
  { text: 'Agebon Introduction', link: '/introduction' },
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
  { text: "Speech act: firm and soft", link: "/firm-soft" },
  { text: "Adjectives before the noun", link: "/left-bound-adjectives" },
  { text: "Extra nouns and whose", link: "/extra-noun-hooks" },
  { text: "What kind, when, where, whose, how, why", link: "/fill-ask-jobs" },
  { text: "Here, there, and somewhere", link: "/here-there" },
  { text: "Social relations", link: "/social-ties" },
  { text: "Clause sequence", link: "/clause-sequence" },
  { text: "Digit-strings and time", link: "/digit-strings" },
  { text: "Can and can't", link: "/can-and-cant" },
  { text: "Live and memory", link: "/live-and-memory" },
  { text: "How far a label reaches", link: "/label-seams" },
  { text: "Thanks and sorry", link: "/thanks-and-sorry" },
  { text: "Ought for a sake", link: "/ought-for-a-sake" },
  { text: "Already, still, not yet, no longer", link: "/already-still-yet" },
  { text: "Fault", link: "/fault" },
]

/** Intermediate sittings, in the same topic order as the Beginner group. */
export const intermediateLessons = [
  { text: 'Phonotactics and letter names', link: '/phonotactics' },
  { text: 'Proper names and titled phrases', link: '/proper-names' },
  { text: 'Left-bound adjectives and chaining', link: '/left-bound' },
  { text: 'Speech acts and tone marks', link: '/speech-acts' },
  { text: 'Sentence linkers and stand-ins', link: '/sentence-linkers' },
  { text: 'Tag pronouns and resume sense', link: '/tag-pronouns' },
  { text: 'Topic', link: '/topic' },
  { text: 'Collectives', link: '/collectives' },
  { text: 'Label scope', link: '/label-scope' },
  { text: 'Rank joins', link: '/rank-joins' },
  { text: 'Polar inventory and rhetorical', link: '/polar-inventory' },
  { text: 'Fill-ask roles', link: '/fill-ask-roles' },
  { text: 'Ending grids', link: '/ending-grids' },
  { text: 'Discourse hooks', link: '/discourse-hooks' },
  { text: 'More occasions', link: '/more-occasions' },
  { text: 'Of-relations and social ties', link: '/of-relations' },
  { text: 'Mention and scope islands', link: '/span-mention' },
  { text: 'Word shape, markers, and endings', link: '/number-markers' },
  { text: 'Digitless and exponents', link: '/digitless-exponents' },
  { text: 'Comparative arity and scales', link: '/comparative-arity' },
  { text: 'Iff, fault, and CAUSE', link: '/iff-fault' },
  { text: 'Prescription and motive', link: '/prescription' },
  { text: 'Feelings and permission', link: '/feelings-permission' },
  { text: 'Evidentiality', link: '/evidentiality' },
  { text: 'Notional and standing', link: '/notional-standing' },
  { text: 'Viewpoint and landmark', link: '/viewpoint' },
  { text: 'Compound families', link: '/compound-families' },
  { text: 'Ability, decision, and try', link: '/ability' },
  { text: 'Join across roles', link: '/join-across-roles' },
  { text: 'Numbers in use', link: '/numbers-applied' },
]

/** Advanced sittings, in the same topic order as the earlier groups. */
export const advancedLessons = [
  { text: 'Singability and speech edges', link: '/singability' },
  { text: 'Emphasis and audible start', link: '/emphasis' },
  { text: 'Lexicalized stand-ins', link: '/stand-in-roles' },
  { text: 'Join islands and role grid', link: '/join-islands' },
  { text: 'Hook compounds', link: '/hook-compounds' },
  { text: 'As-of', link: '/as-of' },
  { text: 'Editorial close and nesting', link: '/span-nesting' },
  { text: 'End-relative and stacked markers', link: '/stacked-markers' },
  { text: 'Special values, hyperbole, number as stance', link: '/special-values' },
  { text: 'Stance bars', link: '/stance-bars' },
  { text: 'Universality and dated channel', link: '/universality' },
  { text: 'Root tails', link: '/root-tails' },
  { text: 'Initials, rays, named ranges', link: '/initials' },
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

function withReview(lessons: readonly LessonLink[], review: LessonLink): LessonLink[] {
  return [...lessons, review]
}

/** Three sidebar groups. Intermediate and Advanced start collapsed. */
export const sidebarGroups = [
  { text: 'Beginner', items: withReview(beginnerLessons, levelReviews[0]) },
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

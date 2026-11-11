export type LessonLink = { text: string; link: string }

/**
 * A unit is a named run of consecutive sittings inside one band. The sidebar
 * shows it as a collapsed sub-group, with no number.
 */
export type Unit = { text: string; items: LessonLink[] }

/** Orientation rows sit above the three lesson groups and are not sittings. */
export const orientation = [
  { text: 'Why Ageben', link: '/' },
  { text: 'Ageben Introduction', link: '/introduction' },
]

/** Beginner sittings, grouped into units; the group’s Review is appended in `withReview`. */
export const beginnerUnits: Unit[] = [
  {
    text: 'First words and sentences',
    items: [
      { text: 'Phonology', link: '/phonology' },
      { text: 'Word endings', link: '/word-endings' },
      { text: 'Clause', link: '/clause' },
      { text: 'Leaving out who acts', link: '/no-subject' },
      { text: 'Speech moves', link: '/speech-moves' },
      { text: 'Dependents', link: '/dependents' },
    ],
  },
  {
    text: 'Pointing and describing',
    items: [
      { text: 'Pronouns', link: '/pronouns' },
      { text: 'Plurality', link: '/plurality' },
      { text: 'Predication', link: '/predication' },
      { text: 'Knowing', link: '/knowing' },
      { text: 'Adjectives first', link: '/left-bound-adjectives' },
    ],
  },
  {
    text: 'Linking and asking',
    items: [
      { text: 'Joins', link: '/joins' },
      { text: 'Questions', link: '/questions' },
      { text: 'Clause sequence', link: '/clause-sequence' },
    ],
  },
  {
    text: 'Why and what for',
    items: [
      { text: 'Spans', link: '/spans' },
      { text: 'Causation', link: '/causation' },
      { text: 'Sakes', link: '/sakes' },
      { text: 'Fault', link: '/fault' },
      { text: 'Ought for a sake', link: '/ought-for-a-sake' },
    ],
  },
  {
    text: 'Where, when, how often',
    items: [
      { text: 'Hooks', link: '/hooks' },
      { text: 'Restrictors', link: '/restrictors' },
      { text: 'Extra-noun hooks', link: '/extra-noun-hooks' },
      { text: 'Here, there, and somewhere', link: '/here-there' },
      { text: 'Already and still', link: '/already-still-yet' },
    ],
  },
  {
    text: 'Counting and comparing',
    items: [
      { text: 'Numbers', link: '/numbers' },
      { text: 'Comparatives', link: '/comparatives' },
      { text: 'Digits and time', link: '/digit-strings' },
    ],
  },
  {
    text: 'Who does what to whom',
    items: [
      { text: 'Relations', link: '/relations' },
      { text: 'Role compounds', link: '/roles' },
      { text: 'Compounds', link: '/compounds' },
      { text: "Whose: Azozon's", link: '/social-ties' },
      { text: 'Label seams', link: '/label-seams' },
    ],
  },
  {
    text: 'Wanting and being able',
    items: [
      { text: 'Intention', link: '/intention' },
      { text: "Can and can't", link: '/can-and-cant' },
    ],
  },
  {
    text: 'Talking together',
    items: [
      { text: 'Firm and soft', link: '/firm-soft' },
      { text: 'Fill-ask jobs', link: '/fill-ask-jobs' },
      { text: 'Thanks and sorry', link: '/thanks-and-sorry' },
    ],
  },
]

/** Beginner sittings, flat, in reading order. */
export const beginnerLessons: LessonLink[] = beginnerUnits.flatMap((unit) => unit.items)

/** Intermediate sittings, grouped into units. */
export const intermediateUnits: Unit[] = [
  {
    text: 'Names and spelling',
    items: [
      { text: 'Word shape', link: '/phonotactics' },
      { text: 'Letter names', link: '/letter-names' },
      { text: 'Names and titles', link: '/proper-names' },
      { text: 'Place-name roots', link: '/place-name-roots' },
      { text: 'Conversation length', link: '/conversation-length' },
    ],
  },
  {
    text: 'Fuller sentences',
    items: [
      { text: 'Longer chains', link: '/longer-chains' },
      { text: 'Very and slightly', link: '/very-and-slightly' },
      { text: 'How a label holds', link: '/label-reach' },
    ],
  },
  {
    text: 'Conversation craft',
    items: [
      { text: 'Turn words, further', link: '/more-turn-words' },
      { text: 'Frankly and to be clear', link: '/speech-manner' },
      { text: 'Tone marks', link: '/tone-marks' },
      { text: 'Yes, no, and not that', link: '/polar-inventory' },
      { text: 'Who, which, and any', link: '/fill-ask-roles' },
    ],
  },
  {
    text: 'Across sentences',
    items: [
      { text: 'Linking sentences', link: '/sentence-linkers' },
      { text: 'Hinges on a degree or a noun', link: '/more-hinges' },
      { text: 'Stand-in vowels', link: '/stand-in-vowels' },
      { text: 'Topic', link: '/topic' },
    ],
  },
  {
    text: 'Keeping track of who',
    items: [
      { text: 'Resume, further', link: '/resume-sense' },
      { text: 'Tag pronouns', link: '/tag-pronouns' },
      { text: 'Groups, further', link: '/collectives' },
    ],
  },
  {
    text: 'Lists of things',
    items: [
      { text: 'What a list word reaches', link: '/list-structure' },
      { text: 'Rank joins', link: '/rank-joins' },
      { text: 'Set joins', link: '/set-joins' },
      { text: 'Talking about a whole kind', link: '/universals-domains' },
    ],
  },
  {
    text: 'Joining actions',
    items: [
      { text: 'Joins on verbs and stances', link: '/verb-and-stance-joins' },
      { text: 'List verbs', link: '/list-verbs' },
      { text: 'With and without', link: '/join-relations' },
    ],
  },
  {
    text: 'Causes and stakes',
    items: [
      { text: 'Because and iff', link: '/because-and-iff' },
      { text: 'CAUSE', link: '/cause' },
      { text: 'Doing it for a sake', link: '/for-a-sake' },
    ],
  },
  {
    text: 'Feelings and choices',
    items: [
      { text: 'Feelings', link: '/feelings' },
      { text: 'Permission and consent', link: '/permission-consent' },
      { text: 'Try', link: '/try' },
    ],
  },
  {
    text: 'Quoting and mentioning',
    items: [
      { text: 'Spans as words', link: '/spans-as-words' },
      { text: 'Inside a quote', link: '/quote-contents' },
      { text: 'Scope islands', link: '/scope-islands' },
    ],
  },
  {
    text: 'Number forms',
    items: [
      { text: 'Number markers and endings', link: '/number-markers' },
      { text: 'A number in other roles', link: '/number-roles' },
      { text: 'How many and how big', link: '/digitless-exponents' },
    ],
  },
  {
    text: 'How you know',
    items: [
      { text: 'How you know', link: '/evidentiality' },
      { text: 'Whose view', link: '/holder' },
    ],
  },
  {
    text: 'Setting the scene',
    items: [
      { text: 'Hooks inside the clause', link: '/in-clause-hooks' },
      { text: 'In fact and anyway', link: '/discourse-hooks' },
      { text: 'Exclusive and ranked times', link: '/more-occasions' },
      { text: 'Ranges', link: '/ranges' },
    ],
  },
  {
    text: 'Places and viewpoint',
    items: [
      { text: 'In a crisis, out of debt', link: '/abstract-landmarks' },
      { text: 'Landmark relations', link: '/locative-relations' },
      { text: 'Left, right, and facing', link: '/viewpoint' },
      { text: 'Role parts', link: '/role-parts' },
      { text: 'Which compound', link: '/compound-families' },
    ],
  },
  {
    text: 'Likeness and connection',
    items: [
      { text: 'Part of, made of, from', link: '/of-relations' },
      { text: 'Exactly like', link: '/exactly-like' },
      { text: 'Before, after, while, and like', link: '/same-role-words' },
    ],
  },
  {
    text: 'Measuring and ranking',
    items: [
      { text: 'Measures and percent', link: '/measures-and-percent' },
      { text: 'Ranking on any scale', link: '/comparative-arity' },
      { text: 'Than planned, enough, too', link: '/bars' },
      { text: 'Many and few', link: '/vague-amounts' },
    ],
  },
  {
    text: "Surprise and what's not so",
    items: [
      { text: 'Contrary to', link: '/contrary-to' },
      { text: 'Residue and former', link: '/residue-and-former' },
      { text: 'Dated channel', link: '/dated-channel' },
      { text: 'It turns out', link: '/mirative' },
      { text: 'As if', link: '/notional' },
      { text: 'Want and decide', link: '/want-and-decide' },
    ],
  },
]

/** Intermediate sittings, flat, in reading order. */
export const intermediateLessons: LessonLink[] = intermediateUnits.flatMap((unit) => unit.items)

/** Advanced sittings, grouped into units. */
export const advancedUnits: Unit[] = [
  {
    text: 'Fine shades of knowing',
    items: [
      { text: 'Whose now', link: '/as-of' },
      { text: 'Every bar', link: '/stance-bars' },
      { text: 'Mood on one adjective', link: '/universality' },
      { text: 'Usually vs must', link: '/usually-vs-must' },
    ],
  },
  {
    text: 'Number values',
    items: [
      { text: 'Stacked markers, from the end first', link: '/stacked-markers' },
      { text: 'Infinity, zero, and hyperbole', link: '/special-values' },
    ],
  },
  {
    text: 'Number-built words',
    items: [
      { text: 'Initials', link: '/initials' },
      { text: 'Open and named ranges', link: '/open-ranges' },
      { text: 'Generations', link: '/generations' },
      { text: 'Numeric prefixes', link: '/numeric-derivation' },
    ],
  },
  {
    text: 'Building words and voice',
    items: [
      { text: 'Voicing Ageben', link: '/singability' },
      { text: 'Cite plus a hook', link: '/hook-compounds' },
      { text: 'Root tails', link: '/root-tails' },
    ],
  },
  {
    text: 'Deep structure',
    items: [
      { text: 'Stand-in words', link: '/stand-in-roles' },
      { text: 'Nested dependents', link: '/nested-dependents' },
      { text: 'Join limits', link: '/join-limits' },
      { text: 'Named phrases', link: '/named-phrases' },
      { text: 'Hook plus a join', link: '/hooked-joins' },
      { text: 'Closing and nesting spans', link: '/span-nesting' },
    ],
  },
]

/** Advanced sittings, flat, in reading order. */
export const advancedLessons: LessonLink[] = advancedUnits.flatMap((unit) => unit.items)

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

/**
 * One flat entry per band: its sittings in reading order, then its review.
 * Readers that want a band as a plain list of pages take this, not `sidebarGroups`.
 */
export const bandLessons: { text: string; items: LessonLink[] }[] = [
  { text: 'Beginner', items: withReview(beginnerLessons, levelReviews[0]) },
  { text: 'Intermediate', items: withReview(intermediateLessons, levelReviews[1]) },
  { text: 'Advanced', items: withReview(advancedLessons, levelReviews[2]) },
]

type SidebarUnit = { text: string; collapsed: boolean; items: LessonLink[] }
type SidebarBand = { text: string; collapsed: boolean; items: (SidebarUnit | LessonLink)[] }

/** A band's units as collapsed sub-groups, then its review as a plain link, outside every unit. */
function bandGroup(text: string, units: readonly Unit[], review: LessonLink): SidebarBand {
  return {
    text,
    collapsed: true,
    items: [...units.map((unit) => ({ text: unit.text, collapsed: true, items: unit.items })), review],
  }
}

/**
 * Three sidebar groups. Beginner, Intermediate, and Advanced start collapsed,
 * and so does each unit inside them; the theme opens the groups that hold the
 * active page.
 */
export const sidebarGroups: SidebarBand[] = [
  bandGroup('Beginner', beginnerUnits, levelReviews[0]),
  bandGroup('Intermediate', intermediateUnits, levelReviews[1]),
  bandGroup('Advanced', advancedUnits, levelReviews[2]),
]

/**
 * Flattened curriculum: orientation, then Beginner (review last), Intermediate,
 * Advanced. Prev/next and the docs lint walk this list.
 */
export const readingOrder: LessonLink[] = [...orientation, ...bandLessons.flatMap((band) => band.items)]

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

/** Claritish track, in sidebar order. */
export const claritishLessons: LessonLink[] = [
  { text: 'Claritish Introduction', link: '/claritish/' },
  { text: 'How sure are you?', link: '/claritish/could-be' },
  { text: 'How do you know?', link: '/claritish/how-you-know' },
  { text: 'Labels', link: '/claritish/labels' },
  { text: "Can and can't", link: '/claritish/can-and-cant' },
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
]

/** Saying it in Ageben recipe track, in sidebar order. */
export const recipePages: LessonLink[] = [
  { text: 'Overview', link: '/english' },
  { text: 'People and places', link: '/say-people-places' },
  { text: 'Amounts, sizes and time', link: '/say-amounts' },
  { text: 'Reasons and plans', link: '/say-reasons' },
  { text: 'Asking and answering', link: '/say-questions' },
  { text: 'Tense and modals', link: '/say-tense' },
]

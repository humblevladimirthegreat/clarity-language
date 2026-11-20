import { claritishLessons } from './reading-order.ts'
import { loadClaritishPack } from '../../../../src/flashcards-claritish.ts'

/** Where `publish-docs-extras.mjs` writes the pack, relative to the grammar site's base. */
export const CLARITISH_APKG_PATH = '/flashcards/claritish.apkg'

export type ClaritishFlashcardDeck = {
  /** Lesson title, as in the sidebar. */
  title: string
  /** Lesson page slug under `/claritish/`. */
  slug: string
  /** Anki deck name, `Claritish::NN Title`. */
  deck: string
  count: number
}

export type ClaritishFlashcardsData = {
  /** Site-base-relative path of the `.apkg`; wrap in `withBase` for an href. */
  path: string
  total: number
  decks: ClaritishFlashcardDeck[]
  /** 8 hex digits of the tagless note list. */
  releaseId: string
  /** The tag every note of this release carries, for Anki's search. */
  releaseTag: string
}

/** The Claritish flashcard pack's counts and release id, from the cheat sheet and the lesson pages. */
declare const data: ClaritishFlashcardsData
export { data }

export default {
  watch: ['../../claritish/*.md'],
  load(): ClaritishFlashcardsData {
    const pack = loadClaritishPack(claritishLessons)
    return {
      path: CLARITISH_APKG_PATH,
      total: pack.notes.length,
      decks: pack.decks.map((d) => ({ title: d.title, slug: d.slug, deck: d.name, count: d.notes.length })),
      releaseId: pack.releaseId,
      releaseTag: pack.notes[0]?.tags.find((t) => t.endsWith(`::${pack.releaseId}`)) ?? '',
    }
  },
}

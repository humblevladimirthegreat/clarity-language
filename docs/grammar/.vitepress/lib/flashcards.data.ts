import { lessonPages, levelReviewPages } from './reading-order.ts'
import { buildNotes, checkpointTag, loadFlashcardInputs, releaseTag, type FlashcardNote, type LexiconPackId } from '../../../../src/flashcards.ts'
import { buildPack, checkpointNotes, noteCards, unitDeckName } from '../../../../src/flashcards-packs.ts'
import type { Band } from '../../../../src/lint/learning-order.ts'

/** Ageben pack keys, as `scripts/flashcards.ts --pack` names them, in page order. */
export const AGEBEN_PACK_IDS = ['beginner', 'intermediate', 'advanced', 'everything'] as const satisfies readonly LexiconPackId[]

/** Directory `publish-docs-extras.mjs` writes the Ageben packs to, relative to the grammar site's base. */
export const AGEBEN_APKG_DIR = '/flashcards'

/** File name of a pack, as `npm run flashcards` writes it: `ageben-<pack>.apkg`. */
export function agebenApkgFile(pack: LexiconPackId): string {
  return `ageben-${pack}.apkg`
}

/** Every Ageben pack with its site-base-relative path: `/flashcards/ageben-<pack>.apkg`. */
export const AGEBEN_APKG_PATHS: readonly { pack: LexiconPackId; path: string }[] = AGEBEN_PACK_IDS.map((pack) => ({
  pack,
  path: `${AGEBEN_APKG_DIR}/${agebenApkgFile(pack)}`,
}))

const PACK_TITLES: Record<LexiconPackId, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', everything: 'Everything' }

export type AgebenFlashcardPack = {
  /** Pack key, as `npm run flashcards -- --pack` names it. */
  id: LexiconPackId
  /** English name: Beginner, Intermediate, Advanced, Everything. */
  title: string
  /** Site-base-relative path of the `.apkg`; wrap in `withBase` for an href. */
  path: string
  /** Notes in the pack. */
  notes: number
  /** Cards the notes make (two per lexicon and overlay note, one per cloze on a set note). */
  cards: number
  /** Subdecks: one per sidebar unit with notes in a band pack; Roots, Compounds, Closed, Overlays in Everything. */
  decks: number
}

export type AgebenFlashcardCheckpoint = {
  /** Sidebar title of the checkpoint's page. */
  title: string
  /** Page file under `docs/grammar/`, e.g. `sakes.md`. */
  page: string
  /** Site-relative link to the checkpoint heading, e.g. `/sakes#practice`; wrap in `withBase` for an href. */
  link: string
  /** Unlock tag the checkpoint's notes carry: `ageben::cp::<page>::<band>`. */
  tag: string
  /** Anki search that selects the checkpoint's cards: `deck:Ageben* tag:ageben::cp::<page>::<band>`. */
  search: string
  /** Notes this checkpoint first drills. */
  notes: number
  /** New cards those notes make. */
  cards: number
}

export type AgebenFlashcardUnit = {
  /** Unit title, as in the sidebar. */
  title: string
  /** 1-based place of the unit in its band. */
  number: number
  /** Anki subdeck: `Ageben::1 Beginner::04 Why and what for`. */
  deck: string
  /** Checkpoints with notes, in checkpoint order. */
  checkpoints: AgebenFlashcardCheckpoint[]
}

export type AgebenFlashcardBand = {
  band: Band
  /** English name: Beginner, Intermediate, Advanced. */
  title: string
  /** Units with at least one checkpoint that has notes, in sidebar order. */
  units: AgebenFlashcardUnit[]
}

export type AgebenFlashcardsData = {
  /** Beginner, Intermediate, Advanced, Everything, in that order. */
  packs: AgebenFlashcardPack[]
  /** Checkpoints grouped by band, then unit; level reviews unlock nothing and are left out. */
  bands: AgebenFlashcardBand[]
  /** 8 hex digits of the tagless note list. */
  releaseId: string
  /** The tag every note of this release carries: `ageben::release::<id>`. */
  releaseTag: string
  /** Anki search for notes outside this release, to delete after importing: `deck:Ageben* -tag:ageben::release::<id>`. */
  cleanupSearch: string
}

/** The Ageben packs' counts, the per-checkpoint unlock searches, and the release id, from `data/` and the grammar pages. */
declare const data: AgebenFlashcardsData
export { data }

/** Build the page data; exported so a probe can run it under `tsx`. */
export function loadAgebenFlashcards(): AgebenFlashcardsData {
  const pages = lessonPages()
  const titles = new Map(pages.map((p) => [p.page, p.title]))
  const inputs = loadFlashcardInputs(pages, levelReviewPages)
  const notes = buildNotes(inputs)
  const all: FlashcardNote[] = [...notes.roots, ...notes.compounds, ...notes.closed, ...notes.overlays, ...notes.slots, ...notes.sets, ...notes.endings]
  const tag = releaseTag(all)
  const cardsOf = (list: readonly FlashcardNote[]) => list.reduce((n, note) => n + noteCards(note), 0)

  const packs = AGEBEN_APKG_PATHS.map(({ pack: id, path }): AgebenFlashcardPack => {
    const pack = buildPack(id, notes, inputs)
    const packNotes = pack.decks.flatMap((d) => d.notes)
    return { id, title: PACK_TITLES[id], path, notes: packNotes.length, cards: cardsOf(packNotes), decks: pack.decks.length }
  })

  const bands = (['beginner', 'intermediate', 'advanced'] as const).map((band): AgebenFlashcardBand => {
    const units = inputs.units.filter((u) => u.band === band)
    const byUnit = new Map<(typeof units)[number], AgebenFlashcardCheckpoint[]>()
    for (const checkpoint of inputs.checkpoints) {
      if (checkpoint.band !== band || checkpoint.review) continue
      const here = checkpointNotes(notes, checkpoint)
      if (here.length === 0) continue
      const unit = units.find((u) => u.pages.includes(checkpoint.page))
      if (!unit) throw new Error(`${checkpoint.anchor}: page is in no ${band} unit`)
      const cpTag = checkpointTag(checkpoint.page, band)
      const id = checkpoint.anchor.split('#')[1] ?? ''
      byUnit.set(unit, [
        ...(byUnit.get(unit) ?? []),
        {
          title: titles.get(checkpoint.page) ?? checkpoint.page,
          page: checkpoint.page,
          link: `/${checkpoint.page.replace(/\.md$/, '')}${id ? `#${id}` : ''}`,
          tag: cpTag,
          search: `deck:Ageben* tag:${cpTag}`,
          notes: here.length,
          cards: cardsOf(here),
        },
      ])
    }
    return {
      band,
      title: PACK_TITLES[band],
      units: units
        .filter((u) => byUnit.has(u))
        .map((u) => ({
          title: u.title,
          number: u.number,
          deck: unitDeckName(u),
          checkpoints: byUnit.get(u)!,
        })),
    }
  })

  return {
    packs,
    bands,
    releaseId: tag.slice('ageben::release::'.length),
    releaseTag: tag,
    cleanupSearch: `deck:Ageben* -tag:${tag}`,
  }
}

export default {
  watch: [
    '../../beginner/*.md',
    '../../intermediate/*.md',
    '../../advanced/*.md',
    '../../../../data/lexicon-published.csv',
    '../../../../data/lexicon-compounds.csv',
    '../../../../data/lexicon-overlays.csv',
    '../../../../data/closed-words.csv',
  ],
  load(): AgebenFlashcardsData {
    return loadAgebenFlashcards()
  },
}

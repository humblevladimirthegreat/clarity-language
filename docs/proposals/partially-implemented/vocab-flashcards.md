# Proposal: vocab flashcard generator / system

**Status:** v1 **shipped** (`npm run flashcards`: Core, Sakes, Everything packs to `tmp/flashcards/`); v2–v3 **proposed**  
**Related:** long-term TODO *vocab flashcard generator/system*; reuses the CSV parsers in [`src/lexicon-search.ts`](../../../src/lexicon-search.ts) and [`src/lexicon-compounds.ts`](../../../src/lexicon-compounds.ts), the [core vocabulary column](../../meta/lexicon.md#core-vocabulary-column) and its checkpoint order from [`src/core-vocabulary.ts`](../../../src/core-vocabulary.ts); packaging via `genanki` from [`requirements.txt`](../../../requirements.txt) (the devcontainer installs it into `.venv`); optional later drill UI may sit next to `gloss-overlay-ui.md`  
**Design authority:** remains [`docs/grammar/`](../../grammar/introduction.md), [glosses.md](../../meta/glosses.md), and lexicon CSVs. This proposal covers **tooling only**: turn published roots, compounds, and overlays into study decks; do not invent senses or replace the lexicon as source of truth.

## Motivation

Learners can **look up** roots ([lexicon](../../grammar/lexicon.md)) and eventually **inspect** sentences in context (`gloss-overlay-ui.md`). They still lack a path to **retain** vocabulary: Egabon ↔ English mappings, concrete vs abstract senses, and the closed overlay inventory.

The data is already curated (`lexicon-published.csv`, `lexicon-compounds.csv`, `lexicon-overlays.csv`), and the `core` column already orders the learner's content roots by the checkpoint that introduces each one. Spaced repetition is a solved product problem (Anki and FSRS). The missing piece is a **thin generator** that emits Egabon-shaped notes from those CSVs: not a second dictionary, not a custom SRS engine, and not a fork of generic “AI vocab deck” tools that assume natural-language TTS and LLM enrichment.

## Goals

1. Generate **importable study decks** from the lexicon CSVs (regenerable; CSV stays canonical).
2. One note per word with **two cards**: recognition (Egabon → English) and production (English → Egabon). The English is the concrete and abstract glosses plus the `english_aliases` cues.
3. Ship **packs** in the order the grammar introduces words, so nobody is handed the full root list on day one and the deck matches what the checkpoints use.
4. Prefer **Anki** for long-term review (scheduling, mobile, offline); one shared note type across every pack so a learner keeps one schedule.
5. Keep generation **deterministic and gloss-locked**: no network fetch, no AI sense invention.
6. Expose a small CLI (`npm` script) that fits existing TypeScript tooling.

## Non-goals

- Replacing lexicon search or becoming the primary root browser.
- Audio of any kind on cards.
- LLM sentence enrichment, generated card art, or forking CSV→Anki SaaS/CLIs aimed at natural L2 pairs.
- Implementing a full custom SRS product (scheduling, sync, mobile clients).
- Inflected full-sentence production as the v1 unit of study (stems first; cloze / PoS+ending drills later).
- Emoji on cards: the seed emoji stay a lexicon and lookup aid; cards teach the English.
- Changing lexicon schema, the `core` column policy, or gloss writing rules.

## Output format

**`.apkg` is the primary output; `.tsv` is a secondary debug / interchange output.**

- A TSV carries field data only. The note type, templates, and CSS must already exist in the learner’s collection, and Anki’s TSV header directives can only point at existing note types. An `.apkg` ships the note type with the notes, so import works on a fresh install.
- `.apkg` carries stable note GUIDs, so re-importing after a lexicon change updates notes and keeps review history. Derive each GUID from the stable key (below), never from row order. The note type and deck ids are fixed constants for the same reason.
- Packaging uses **`genanki`** (Python), pinned in `requirements.txt` and installed into `.venv` by the devcontainer. The TypeScript side builds the note list and writes it as JSON; a small Python script (run as `.venv/bin/python`) only packages it. Hand-writing Anki’s SQLite schema from Node is the riskier path.
- The TSV output is the same note list as plain text, for diffing in review and for other tools.
- Generated files go under `tmp/flashcards/` (gitignored); they are build output, not data.

Stable keys: published `root`; compound `stem`; overlay `sense_form` (the `th` / `w` rows collapse into one note, with the `pos` values as tags). v1 builds overlay notes for the `sake` kind only; the generator stops if one sake's rows disagree.

## Card

One note type, **Egabon lexicon**, two cards per note.

| Card | Front | Back |
|------|-------|------|
| **Recognition** | Egabon stem (no PoS letter, no ending) | The English block; for a compound, its parts; mnemonic as a small optional line |
| **Production** | The English block | Egabon stem; for a compound, its parts; mnemonic as a small optional line |

The **English block** is the **concrete** gloss, the **abstract** gloss, and an **also** line of `english_aliases`, each labeled and omitted when empty.

Concrete and abstract stay on **separate labeled lines**, never one merged gloss, so the card does not blur the [separate senses](../../meta/glosses.md) the lexicon keeps apart. The aliases sit on their own **also** line below them: they widen the English a learner can map to the stem (*say*, *talk*, *speak* for *speech* / *discourse*), but they are cues, not senses, so they never share a line with the glosses.

**Production cards have one answer.** A row’s concrete and abstract never repeat another row’s ([labels and senses](../../meta/lexicon.md#labels-and-senses)), so the glosses on the front pick out one stem. Aliases may repeat across rows; they help recall but do not have to identify the row on their own. An overlay’s production front leads with its `definition` (*autonomy sake*), which keeps it apart from a root whose sense shares the overlay’s short `gloss`. A compound whose sense collides with a root’s is a lexicon fix, found by the note-builder test.

**Compound parts** show the stem’s left root, boundary letter, and head (`obaho` + `l` + `uraha`) with each root’s concrete gloss. The compound becomes readable from roots the learner already knows, and the boundary letter is drilled in passing.

### Fields

| Field | Published root | Compound | Overlay |
|-------|----------------|----------|---------|
| `front` | `root` | `stem` | `sense_form` |
| `concrete` | `concrete` | `concrete` | `gloss` |
| `abstract` | `abstract` (may be empty) | `abstract` (may be empty) | `definition` |
| `aliases` | `english_aliases`, joined with `, ` (may be empty) | (none) | (none) |
| `parts` | (none) | `left` + `join` + `right`, with the two roots’ concrete glosses | (none) |
| `mnemonic` | `mnemonic` | `mnemonic` | `mnemonic` |
| `kind` | (none) | (none) | `kind`; the template leads with the definition when it is set |
| `tags` | source, `core` checkpoint | source, `core` checkpoint | source, `kind`, `pos`, stage from `anchor` |

An overlay has no concrete / abstract split; its `gloss` fills the concrete line and its `definition` fills the abstract line.

`english_by_pos` is not shown on cards: it is role-English for glossing a stem in a given role, and the front has no role letter.

**Tags** use Anki’s `::` hierarchy: `egabon::root` / `egabon::compound` / `egabon::overlay`; `egabon::core::<page>::<band>` from the `core` cell (e.g. `egabon::core::clause::beginner`); `egabon::overlay::<kind>`; `egabon::stage::<band>`.

**Citation vs sentence use:** cards study stems as in the lexicon. The PoS letter and reference ending are not on the card; learners add them when writing sentences ([role letters](../../grammar/clause.md#role-letters)).

## Packs

All packs use the same note type. A pack is a filter over the note list plus deck names and tags; a learner who imports several keeps one schedule. A note already in the collection keeps its deck and history when a second pack also contains it, so overlapping packs never duplicate cards. A learner who only wants to read can suspend the production card type in the Anki browser.

### v1

| Pack | Contents | Source of the list |
|------|----------|--------------------|
| **Core** | Every published root and compound with a `core` cell. One subdeck per checkpoint, numbered in path order (`Egabon::Core::01 Clause · beginner`, …); within a subdeck, CSV order | `core` column, ordered by `stageCheckpoints` (reading order, every Beginner checkpoint, then Intermediate, then Advanced) |
| **Sakes** | The nine sake roots, each followed by its sake overlay note, in [sake inventory](../../grammar/sakes.md#sake-inventory) order | `sake` rows of `lexicon-overlays.csv`; each root is the overlay's host (`senseFormRoot`) |
| **Everything** | All published roots and compounds, one deck per source | Published and compound CSVs |

**Core follows the checkpoints.** A root’s `core` cell names the checkpoint that introduces it, so the Core subdecks are exactly the **New words** of each checkpoint, in the order a learner meets them. A learner unlocks the next subdeck as they reach its checkpoint. The column is hand-edited and linted (at most 5 new roots per checkpoint), so the pack inherits that pacing without its own list. Level reviews introduce no roots and get no subdeck. The checkpoints ask for English → Egabon translation from the first beginner band, which is why production cards ship with v1.

**Not core, not in Core.** House names, the `SELF` root, discourse-role specials, topic and generic pronouns, and the nine sake roots are never core ([core vocabulary column](../../meta/lexicon.md#core-vocabulary-column)): they are grammar, taught by their sections. They appear in **Everything**. The sake roots also get their own **Sakes** pack, since a learner names sakes from the beginner stage and the Core pack never carries them.

**No Claritish pack.** The Claritish track gets a one-page [cheat sheet](../../grammar/claritish/cheat-sheet.md) instead of a deck. Its unit is a whole drop-in (`thovul`), not a stem, and its meaning is the lesson's sense, so it does not fit this note type; the set is small (about ten families, most of them one word with three endings); and drop-ins are used in everyday English from the first lesson, so that use is the review. A sheet kept open while writing serves that better than a separate drill. Flashcards start where the grammar does.

### v2

| Pack | Contents |
|------|----------|
| **Overlays by kind** | One subdeck per overlay `kind` (`evidential`, `clause_pole`, `phasal`, `join_relation`, `deontic`, …); `th` / `w` rows collapsed; tagged by the stage of each `anchor` section. **Everything** gains the overlays as a third deck |
| **Compounds** | All of `lexicon-compounds.csv`, not only core stems |
| **Feelings** | Roots from the feelings and emotion-compose sections |

**Before the overlay packs: a key rule for sense forms that differ by row.** Several sense forms carry a different meaning per `pos` row, so collapsing them into one note would merge two lessons: a join act and its join relations (`an` on `v` vs `g` / `h`), the similative's manner and type readings (`umum` on `h` vs `g`), the AS-OF stance pole on `th` beside its clause poles (`uhum`, `uhur`, `uram`, `urar`), and the CAUSE causer note on `th` (`egem`). Options: key those notes by `sense_form` + `kind` (still one note per join act / join relation), or by `sense_form` + `pos` when the definitions differ. Settle it with the v2 overlay packs.

Overlays wait for v2 because each one is a grammar piece taught on its own page: `ahum` alone on a card, without the mid-word `th` around it, is a weak cue until its section has been read. The sake overlays, which learners need early, are already in the v1 **Sakes** pack. Overlay decks are tagged by the stage of their `anchor` section, not blanket “advanced”: many `evidential` and plan / want forms are taught at beginner stage.

## Pipeline

```text
lexicon-published.csv ─┐
lexicon-compounds.csv ─┼─► buildNotes() ─► Note[] ─► pack filter ─► notes.json ─► genanki ─► .apkg
lexicon-overlays.csv ──┘                    ▲        + decks/tags        └──────────────────► .tsv
grammar pages ─► stageCheckpoints() ────────┘ (core order, overlay stage)
```

- **Canonical data:** CSVs under `data/`. Regenerating overwrites generated artifacts; do not hand-edit Anki notes as source of truth.
- **Opts:** pack id (default: all v1 packs), output directory, `--tsv-only` to skip the Python step.
- **Tests:** `npm test` covers the TypeScript side: note counts match CSV filters, `th` / `w` collapse, stable GUIDs, Core subdeck order, nine roots and nine overlays in Sakes, compound parts, and that no two production fronts are identical. The Python step is not part of `npm test`.

## Phasing

### v1

- `npm` script: CSVs → note list → `.apkg` (and `.tsv`) for the Core, Sakes, and Everything packs, written to `tmp/flashcards/` for local import. Nothing is published to the site yet.
- The single note type with recognition and production cards, and the compound parts line.
- Short maintainer note (this proposal or a one-page tooling doc): regenerate from CSV; import into Anki.

### v2

- **Decks on the site.** `docs:publish` builds the packs and the site links them for download. Amplify builds them; they are not committed (see [Where decks are built](#where-decks-are-built)).
- Overlays by kind, Compounds, and Feelings packs; overlays join **Everything**.
- Optional in-docs drill using `ts-fsrs` over the same notes, still exportable to Anki.

### v3

- Inflected prompts (PoS + ending → surface form).
- Cloze / translation-exercise decks from [translation exercises](../../meta/translation-exercises.md).

## Where decks are built

The downloadable decks (v2) are built by Amplify during `docs:publish`, not committed to the repo.

- **They are derived output.** Every lexicon or `core` edit changes them. A committed copy goes stale the first time someone edits a CSV and forgets to regenerate, and the site would serve old senses with nothing to catch it.
- **`.apkg` is a binary zip.** It cannot be reviewed in a diff, and `genanki` writes timestamps into the collection, so each regeneration is a new blob in history even when no word changed. The `.tsv` output is what a reviewer reads.
- **The cost is small.** Amplify’s build image has Python 3; `preBuild` adds a venv and `pip install -r requirements.txt` beside `npm ci`, the same steps as the devcontainer. A failed packaging step fails the deploy, which is the right signal.

## Regenerating (maintainers)

- `npm run flashcards` writes `egabon-core`, `egabon-sakes`, and `egabon-everything` (`.apkg`, `.tsv`, and the `.json` handed to genanki) under `tmp/flashcards/`. `--pack core,sakes` picks packs, `--out <dir>` moves the output, `--tsv-only` skips Python.
- After packaging, `scripts/flashcards-check.py` imports every pack into a throwaway collection with Anki's own backend (the `anki` package, no GUI): the note type arrives, nothing conflicts, overlapping packs share notes, every card renders, and a second import adds nothing. `npm run build` runs `npm run flashcards`, so a lexicon edit that breaks a deck fails the build. A full run takes about 1.5 s.
- The packager is `scripts/flashcards-package.py`, run as `.venv/bin/python` (the devcontainer creates the venv from `requirements.txt`, which pins `genanki` and `anki`). It owns the note type (fixed model id, templates, CSS); `src/flashcards.ts` owns the notes, GUIDs, deck ids, tags, and packs, and `npm test` covers it.
- After any lexicon or `core` edit, regenerate; re-importing is covered in [Studying with the decks](#studying-with-the-decks).
- The mnemonic line shows on the answer side, small and muted (see [Open questions](#open-questions)).

## Studying with the decks

Recommended use, for the learner. In v2 this becomes the copy beside the site download links.

**Setup**

- Install Anki on a computer and AnkiDroid or AnkiMobile on a phone, and sync them through a free AnkiWeb account. Review happens on the learner's own devices; the devcontainer carries only Anki's backend, for the import check.
- Import **Core** and **Sakes**. **Everything** is for lookup, not study: set its new cards per day to 0, or it queues every root and compound at once.
- In deck options, turn on **FSRS** with desired retention near 0.9, and turn on **bury new siblings** and **bury review siblings**, so a word's recognition and production cards never fall on the same day.

**Pacing with the checkpoints**

- After import, suspend every Core card (Browse, search `deck:Egabon::Core`, select all, Suspend).
- On reaching a checkpoint, unsuspend its subdeck (at most five words). New words then match the page being read, and the checkpoint's practice uses them right away.
- Study from the top **Egabon** deck each day, so reviews from every subdeck come mixed.

**Reviewing**

- About 10 to 15 minutes a day. Do the reviews every day; when time is short, skip new cards, not reviews.
- On a production card, say or write the Egabon before flipping. Grade **Again** when it did not come, **Good** when it did; **Hard** is a slow pass, not a fail.
- Use the mnemonic line on the back when a word will not stick, and the checkpoint practice on the site to use the word in a sentence.
- A learner who only wants to read can suspend the Production card type.

**After a lexicon change**

- Regenerate and re-import (**File → Import** the `.apkg`). Notes update in place and keep their history; a note whose checkpoint moved keeps its old deck.
- **A respelled root is a new note.** The stable key is the spelling, so after a respelling the new spelling arrives as a new note and the old one stays with its history. Delete the old note in the browser. Carrying history across a respelling needs a stable row id in the lexicon CSVs, which the v1 schema does not have (see [Open questions](#open-questions)).

## Reuse (OSS)

| Need | Prefer | Avoid |
|------|--------|--------|
| Scheduling + client | **Anki** (import `.apkg`) | Building sync / mobile / review UX |
| Deck packaging | **`genanki`** driven by a thin script in this repo | Hand-writing the Anki SQLite schema; forking anki-artisan / anita / VocabAudioAutomator (natural-L2 + TTS/LLM assumptions) |
| In-browser SRS (optional, v2) | **`ts-fsrs`** | Homegrown interval math |
| CSV parsing, lookup, filters | Existing parsers in `src/lexicon-search.ts` and `src/lexicon-compounds.ts` | A parallel parsing stack in the exporter |
| Word order | `core` column + `stageCheckpoints` in `src/core-vocabulary.ts` | A second hand-kept or frequency-derived list |
| Sense text | Lexicon CSVs only | AI “enrichment” of glosses |

## Interaction with other proposals

| Proposal | Relationship |
|----------|----------------|
| Lexicon search (shipped) | Discovery and filtering; flashcards are retention, not lookup |
| `gloss-overlay-ui.md` | Sentence inspect while reading; flashcards study isolated stems |
| [parser-pipeline.md](../../meta/parser-pipeline.md) | Needed for inflected / cloze decks (v3), not for stem export |

## Open questions

- **Mnemonic line.** Shown by default or hidden behind a tap? Tune on the template without changing the note model.
- **Review history across respellings.** GUIDs come from the spelling, so `npm run retie-docs` after a respelling orphans the old note. A stable id column in the lexicon CSVs would fix it, but it changes the lexicon schema, which is a non-goal here; decide before decks go on the site.

## Out of scope for product debates

- Whether Anki or a web drill is “the” learner product: Anki is the v1 delivery; a web drill is optional sugar.
- Redesigning the emoji-seeded lexicon layout: export consumes current columns.
- Teaching full grammar via vocab cards: morphology teaching stays in grammar docs; cards drill lexicon memory.

# Proposal: vocab flashcard generator / system

**Status:** PROPOSED  
**Related:** long-term TODO *vocab flashcard generator/system*; reuses [lexicon search](../grammar/lexicon.md) / [`src/lexicon-search.ts`](../../src/lexicon-search.ts) and the CSV parsers there; frequency tags from [`scripts/frequency-coverage.ts`](../../scripts/frequency-coverage.ts); optional later drill UI may sit next to `gloss-overlay-ui.md` and `diphone-tts.md` (neither required for v1)  
**Design authority:** remains [`docs/grammar/`](../grammar/introduction.md), [glosses.md](../meta/glosses.md), and lexicon CSVs. This proposal covers **tooling only**: turn published roots, compounds, and overlays into study decks; do not invent senses or replace the lexicon as source of truth.

## Motivation

Learners can **look up** roots ([lexicon](../grammar/lexicon.md)) and eventually **inspect** sentences in context (`gloss-overlay-ui.md`). They still lack a path to **retain** vocabulary: Agazan ↔ English mappings, concrete vs abstract senses, and the closed overlay inventory.

The data is already curated (`lexicon-published.csv`, `lexicon-compounds.csv`, `lexicon-overlays.csv`). Spaced repetition is a solved product problem (Anki and FSRS). The missing piece is a **thin generator** that emits Agazan-shaped notes from those CSVs: not a second dictionary, not a custom SRS engine, and not a fork of generic “AI vocab deck” tools that assume natural-language TTS and LLM enrichment.

## Goals

1. Generate **importable study decks** from the lexicon CSVs (regenerable; CSV stays canonical).
2. One simple card shape: **Agazan on the front; emoji, concrete, and abstract on the back.**
3. Ship **packs** ordered by what a learner has met, so nobody is handed the full root list on day one.
4. Prefer **Anki** for long-term review (scheduling, mobile, offline); one shared note type across every pack so a learner keeps one schedule.
5. Keep generation **deterministic and gloss-locked**: no AI sense invention; optional English-side media only if explicitly added later.
6. Expose a small CLI (`npm` script) that fits existing TypeScript tooling.

## Non-goals

- Replacing lexicon search or becoming the primary root browser.
- Training or shipping **Agazan TTS** on cards (see `diphone-tts.md` when speech exists; flashcards do not depend on it).
- LLM sentence enrichment, generated card art, or forking CSV→Anki SaaS/CLIs aimed at natural L2 pairs.
- Implementing a full custom SRS product (scheduling, sync, mobile clients).
- Inflected full-sentence production as the v1 unit of study (roots, compounds, and overlays first; cloze / PoS+ending drills later).
- English → Agazan (production) cards in v1.
- Changing lexicon schema or gloss writing rules.

## Output format

**`.apkg` is the primary output; `.tsv` is a secondary debug / interchange output.**

- A TSV carries field data only. The note type, templates, and CSS must already exist in the learner’s collection, and Anki’s TSV header directives can only point at existing note types. An `.apkg` ships the note type with the notes, so import works on a fresh install.
- `.apkg` carries stable note GUIDs, so re-importing after a lexicon change updates notes and keeps review history. Derive each GUID from the stable key (below), never from row order.
- Packaging uses **`genanki`** (Python), driven by a small script. The TypeScript side builds the note list and writes it as JSON; the Python script only packages it. Hand-writing Anki’s SQLite schema from Node is the riskier path.
- The TSV output is the same note list as plain text, for diffing in review and for other tools.

Stable keys: published `root`; compound `stem`; overlay `sense_form` (the `th` / `w` rows collapse into one note, with the `pos` values as tags).

## Card

One note type, **Agazan lexicon**, one card per note.

| Side | Shows |
|------|-------|
| **Front** | Agazan stem (no PoS letter, no ending) |
| **Back** | **Emoji**, **concrete** gloss, **abstract** gloss (labeled, and omitted when empty); mnemonic as a small optional line |

Concrete and abstract stay on **separate labeled lines** of the back, never one merged gloss, so the card does not blur the [separate senses](../meta/glosses.md) the lexicon keeps apart.

### Fields

| Field | Published root | Compound | Overlay |
|-------|----------------|----------|---------|
| `front` | `root` | `stem` | `sense_form` |
| `emoji` | `emoji` | (none) | `emoji` |
| `concrete` | `concrete` | `concrete` | `gloss` |
| `abstract` | `abstract` (may be empty) | `abstract` (may be empty) | `definition` |
| `mnemonic` | `mnemonic` | `mnemonic` | `mnemonic` |
| `tags` | derived | derived | `kind`, stage from `anchor` |

An overlay has no concrete / abstract split; its `gloss` fills the concrete line and its `definition` fills the abstract line.

`english_aliases` and `english_by_pos` are not shown on cards (search-only and role-English data respectively).

**Citation vs sentence use:** cards study stems as in the lexicon. The PoS letter and reference ending are not on the front; learners add them when writing sentences ([role letters](../grammar/clause.md#role-letters)).

## Packs

All packs use the same note type. A pack is a filter over the note list plus tags; a learner who imports several keeps one schedule.

### v1

| Pack | Contents | Source of the list |
|------|----------|--------------------|
| **Core 250** | Published roots in NGSL rank order, first 250 that have a root (500 / 1000 as later rungs) | `scripts/frequency-coverage.ts` tags |
| **Follow the grammar** | One subdeck per grammar page, roots from its **Roots used here** tables, ordered by the cross-doc learning path | Grammar pages plus [learning-levels.md](../meta/learning-levels.md#cross-doc-path) |
| **Overlays by kind** | One deck per overlay `kind` (`evidential`, `clause_pole`, `phasal`, `sake`, `join_relation`, `deontic`, …); `th` / `w` rows collapsed | `lexicon-overlays.csv` |
| **Everything** | All published roots, compounds, and overlays | All three CSVs |

**No Claritish pack.** The Claritish track gets a one-page [cheat sheet](../grammar/claritish/cheat-sheet.md) instead of a deck. Its unit is a whole drop-in (`thovul`), not a stem, and its meaning is the lesson's sense, so it does not fit this note type; the set is small (about ten families, most of them one word with three endings); and drop-ins are used in everyday English from the first lesson, so that use is the review. A sheet kept open while writing serves that better than a separate drill. Flashcards start where the grammar does.

Overlay decks are tagged by the stage of their `anchor` page, not blanket “advanced”: many `sake`, `evidential`, and plan / want forms are taught at beginner stage.

### v2

| Pack | Contents |
|------|----------|
| **Abstract senses** | Only rows with an `abstract` gloss; intersect with Core 250 for newcomers |
| **Compounds** | `lexicon-compounds.csv` |
| **Emoji recognition** | Emoji on the front, Agazan stem on the back (a second template on the same note type) |
| **Feelings and sakes** | Roots from the sakes and feelings pages plus the `sake` overlays |

### Cut

`published-slice-N` and its hand-kept allowlist are dropped: Core 250 and Follow the grammar cover the same need from data that already exists.

## Pipeline

```text
lexicon-published.csv ─┐
lexicon-compounds.csv ─┼─► buildNotes(opts) ─► Note[] ─► notes.json ─► genanki ─► .apkg
lexicon-overlays.csv ──┘         │                           └──────────────────► .tsv
                                 └─ pack filter + tags
```

- **Canonical data:** CSVs under `data/`. Regenerating overwrites generated artifacts; do not hand-edit Anki notes as source of truth.
- **Opts:** pack id, deck name, include / exclude empty abstract.
- **CI optional later:** smoke that export runs and note counts match CSV filters.

## Phasing

### v1

- `npm` script: CSVs → note list → `.apkg` (and `.tsv`).
- The single note type and the v1 packs above.
- Short maintainer note (this proposal or a one-page tooling doc): regenerate from CSV; import into Anki.

### v2

- v2 packs; the emoji-recognition template.
- Optional in-docs drill using `ts-fsrs` over the same notes, still exportable to Anki.
- Optional English-only TTS on the English face (not Agazan speech).

### v3

- Inflected prompts (PoS + ending → surface form).
- Cloze / translation-exercise decks from [translation exercises](../meta/translation-exercises.md).
- Optional Agazan audio on the Agazan face once `diphone-tts.md` ships.

## Reuse (OSS)

| Need | Prefer | Avoid |
|------|--------|--------|
| Scheduling + client | **Anki** (import `.apkg`) | Building sync / mobile / review UX |
| Deck packaging | **`genanki`** driven by a thin script in this repo | Hand-writing the Anki SQLite schema; forking anki-artisan / anita / VocabAudioAutomator (natural-L2 + TTS/LLM assumptions) |
| In-browser SRS (optional, v2) | **`ts-fsrs`** | Homegrown interval math |
| CSV parsing, lookup, filters | Existing parsers in `src/lexicon-search.ts` | A parallel parsing stack in the exporter |
| Sense text | Lexicon CSVs only | AI “enrichment” of glosses |

## Interaction with other proposals

| Proposal | Relationship |
|----------|----------------|
| Lexicon search (shipped) | Discovery and filtering; flashcards are retention, not lookup |
| `gloss-overlay-ui.md` | Sentence inspect while reading; flashcards study isolated stems |
| `diphone-tts.md` | Optional later audio on the Agazan face; not a v1 dependency |
| [parser-pipeline.md](../meta/parser-pipeline.md) | Needed for inflected / cloze decks (v3), not for stem export |

## Open questions

- **Roots used here tables.** The column set varies (`English | Agazan`, with or without `Same root as` / `Cue`). The exporter should read only the Agazan column and join to the published CSV; unknown stems (names, compounds) are skipped or routed to the compound table.
- **Mnemonic line.** Shown by default or hidden behind a tap? Tune on the template without changing the note model.

## Out of scope for product debates

- Whether Anki or a web drill is “the” learner product: Anki is the v1 delivery; a web drill is optional sugar.
- Redesigning the emoji-seeded lexicon layout: export consumes current columns.
- Teaching full grammar via vocab cards: morphology teaching stays in grammar docs; cards drill lexicon memory.

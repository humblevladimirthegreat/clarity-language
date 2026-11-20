# Flashcards (editors)

Editors only. How the Anki packs are generated, keyed, checked and published. The learner page for the Claritish pack is [Flashcards](../grammar/claritish/flashcards.md); its policy is the **Flashcards** paragraph of [Claritish track](grammar-docs.md#claritish-track).

## Packs and decks {#packs}

| Pack | Built by | Note type | Decks |
|------|----------|-----------|-------|
| `ageben-core` | [`src/flashcards.ts`](../../src/flashcards.ts) | Ageben lexicon | `Ageben::Core::NN <page> · <band>`, one per stage checkpoint |
| `ageben-sakes` | same | Ageben lexicon | `Ageben::Sakes` |
| `ageben-everything` | same | Ageben lexicon | every lexicon note |
| `claritish` | [`src/flashcards-claritish.ts`](../../src/flashcards-claritish.ts) | Claritish | `Claritish::NN <lesson title>`, one per lesson that has notes |

- **Deck ids** hash the full deck name (`ageben-deck/<name>`), in genanki's range [2^30, 2^31). Renaming a deck makes a new deck.
- **Claritish deck numbers** follow the lesson's position in `claritishLessons` ([`reading-order.ts`](../grammar/.vitepress/lib/reading-order.ts)), the bonus last. A lesson with no notes leaves its number free, so the other names stay stable.
- **Order:** new cards follow deck order, then sheet order inside a deck. Nothing ships suspended.
- The Ageben packs overlap: a note in two packs is one note in Anki, by its GUID.

## Note types {#note-types}

[`scripts/flashcards-package.py`](../../scripts/flashcards-package.py) owns both note types and packages with `genanki`. The pack JSON's `model` field picks the type; the packager stops on an unknown model or a field list that does not match.

| Note type | Model id | Fields | Cards |
|-----------|----------|--------|-------|
| Ageben lexicon | 1738204517 | `front`, `concrete`, `abstract`, `aliases`, `parts`, `mnemonic`, `kind` | Recognition (stem → English) and Production (English → stem) |
| Claritish | 1738204518 | `front`, `meaning`, `lesson` | Recognition only, with a small muted lesson line under the meaning |

- Model ids are fixed constants. Never change one: Anki would treat it as a new note type.
- **Ageben lexicon:** the English block has concrete, abstract and *also* (`english_aliases`) lines. A compound shows its parts with each root's concrete gloss. The mnemonic shows small on the back. No two production fronts may match.
- **Claritish:** `meaning` is HTML and is not escaped by the packager; `meaningHtml` escapes the text it builds from. The two note types never share notes.

## Keys and release tags {#keys}

| Note | GUID hashes | Tags |
|------|-------------|------|
| Root | `ageben/root/<root>` | `ageben::root`, core tags |
| Compound | `ageben/compound/<stem>` | `ageben::compound`, core tags |
| Sake overlay | `ageben/overlay/<sense_form>`, `th` / `w` rows collapsed | `ageben::overlay`, its kind and PoS, a stage tag where its anchor has one |
| Claritish | `claritish/<section id>/<form>` | `claritish`, `claritish::lesson::<slug>`, `claritish::release::<id>` |

- A GUID never comes from row order. A new meaning keeps the note and its review history; a respelling makes a new note.
- **Release id:** the first 8 hex of a SHA-256 over the decks (name, id) and their notes (GUID, fields), without tags. It changes only when card content, a deck or a GUID changes, and never from a timestamp.
- **Updating:** after importing a new release, the learner deletes `deck:Claritish* -tag:claritish::release::<id>`, which clears the notes of respelled or dropped forms. The Ageben packs will take the same scheme with an `ageben::` prefix.

## Claritish notes {#claritish-notes}

Card text comes only from the [Claritish cheat sheet](../grammar/claritish/cheat-sheet.md), read through [`sheet.ts`](../../src/claritish-editor/sheet.ts) and [`cheat-sheet-tables.ts`](../../src/lint/cheat-sheet-tables.ts). The generator never types a form or a meaning; a sheet edit reaches the cards with no code change. Fronts show the form only.

| Sheet section | Notes |
|---------------|-------|
| `#sounds` (vowels and `x`) | none: sounds, not meanings |
| `#settled`, `#how-you-know`, `#allowed` | one per form cell; the back is row label · column header: English |
| `#suffixes` | one per suffix, front with its hyphen |
| `#tone-marks` | one per mark |
| `#sakes` | one per need; one per stance; one per stance × ending, spelled by swapping the ending on the row's Example; each form in a Says cell (cut at its first comma); each prose line with a swap and its example (`gobathal`) |
| `#feelings` | one per urge; a line that gives a form already on the sheet another meaning joins that note |

- A section with tables and no rule above throws, so a new sheet section needs a rule in `sheetPlaces`.
- **No note** for pattern pieces (`th`, `g`, the formula table, the *Sake word* line) or a bare ending: endings read differently in each table, so their readings sit on full forms.
- **Merging:** one note per distinct form. A form in two places gets one meaning per place, joined by a line break; its section id (and so its GUID) is that of its first place.
- **Ending labels** on stance × ending notes come from the `#settled` column headers. An ending swap is `swapEnding`, the same variant the cheat sheet lint accepts as taught.
- **Lesson of a note:** where the sheet links the note's first place to a lesson (its row, then its column header, then its section heading), that lesson. Otherwise the first lesson in `claritishLessons` order whose page has the form, or an ending-swapped variant, in a backtick span, including as a whole word inside a multi-word span. The build throws on a sheet link to a page that is not a lesson, and on a form in no lesson.
- **Tests** ([`flashcards-claritish.test.ts`](../../src/flashcards-claritish.test.ts)) fail on a note with no lesson and on a lesson page that lacks its note's form.

## Regenerating {#regenerating}

[`scripts/flashcards.ts`](../../scripts/flashcards.ts), run by `npm run build`:

| Command | Writes to `tmp/out/flashcards/` |
|---------|---------------------------------|
| `npm run flashcards` | every pack: `.apkg`, `.tsv`, `.json`, then the import check |
| `npm run flashcards -- --pack core,sakes` | only these (`core`, `sakes`, `everything`, `claritish`) |
| `npm run flashcards -- --tsv-only` | `.tsv` and `.json` only; no packaging, no check, no `.venv` needed |
| `npm run flashcards -- --out DIR` | the same, into `DIR` |

- Packaging and the check need `.venv/bin/python` with [`requirements.txt`](../../requirements.txt) (`genanki` through [`requirements-publish.txt`](../../requirements-publish.txt), and the `anki` pin for the check).
- Output is deterministic: no timestamps or random ids in notes, GUIDs, deck ids or the release id. Nothing generated is committed.

## Import check {#import-check}

[`scripts/flashcards-check.py`](../../scripts/flashcards-check.py) imports every built pack into a throwaway collection with Anki's backend and checks:

- the note type arrives, nothing conflicts, and overlapping Ageben packs share notes;
- every card renders: 2 cards per lexicon note, 1 per Claritish note;
- a second import adds nothing;
- **release search:** it rebuilds the Claritish pack with one note dropped, recomputing the release id in Python as the TS does, imports it with *always update*, and checks that the release search finds exactly the dropped note. A change to the release id formula changes `release_id` in the check too.

## Publishing {#publishing}

- `docs:publish` runs [`scripts/publish-docs-extras.mjs`](../../scripts/publish-docs-extras.mjs) after VitePress. It builds the Claritish pack JSON and packages it into `dist/grammar/flashcards/claritish.apkg`, served at `/grammar/flashcards/claritish.apkg`. It skips the import check. The Ageben packs are not published yet.
- [`amplify.yml`](../../amplify.yml) `preBuild` runs `python3 -m venv .venv` and installs `requirements-publish.txt` (`genanki` only) after `npm ci`.
- A missing `.venv` or a failed packaging step fails the deploy.
- The learner page reads its counts, deck list, download path and release tag from [`claritish-flashcards.data.ts`](../grammar/.vitepress/lib/claritish-flashcards.data.ts), so the page holds no hand-written data.

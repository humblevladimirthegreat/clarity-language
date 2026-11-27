# Flashcards (editors)

Editors only. How the Anki packs are generated, keyed, checked and published. The learner pages are [Flashcards](../grammar/flashcards.md) for the Ageben packs and [Claritish flashcards](../grammar/claritish/flashcards.md) for the Claritish pack; the Claritish page's policy is the **Flashcards** paragraph of [Claritish track](grammar-docs.md#claritish-track).

## Packs and decks {#packs}

| Pack | Built by | Decks |
|------|----------|-------|
| `ageben-beginner`, `ageben-intermediate`, `ageben-advanced` | [`src/flashcards-packs.ts`](../../src/flashcards-packs.ts) | One subdeck per sidebar unit of the band that has notes, named and numbered as in [`reading-order.ts`](../grammar/.vitepress/lib/reading-order.ts): `Ageben::1 Beginner::04 Why and what for` |
| `ageben-everything` | same | `Ageben::Everything::Roots`, `::Compounds`, `::Closed`, `::Overlays`: every root, compound, closed word and overlay word note, for lookup |
| `claritish` | [`src/flashcards-claritish.ts`](../../src/flashcards-claritish.ts) | `Claritish::NN <lesson title>`, one per lesson that has notes |

- A band subdeck holds the notes its unit's checkpoints first drill: core words (by the `core` cell), closed words, and overlay notes. Level reviews add none. A root or compound with no `core` cell is in Everything only.
- **Deck ids** hash the full deck name (`ageben-deck/<name>`), in genanki's range [2^30, 2^31). Renaming a deck makes a new deck.
- **Claritish deck numbers** follow the lesson's position in `claritishLessons` ([`reading-order.ts`](../grammar/.vitepress/lib/reading-order.ts)), the bonus last. A lesson with no notes leaves its number free, so the other names stay stable.
- The Ageben packs overlap: a note in two packs is one note in Anki, by its GUID. It keeps the new-card position of the pack imported first, so the learner page says to import the band packs before Everything.

## Unlocking and order {#unlocking}

- **Suspended:** every card of the four Ageben packs ships suspended. The pack JSON says so with a top-level `"suspend": true`, and the packager sets `suspend` on each card. Claritish ships unsuspended.
- **Checkpoint tag:** each note a checkpoint first drills carries `ageben::cp::<page>::<band>` (page without `.md`; a page has at most one checkpoint per band). On reaching the checkpoint, the learner unsuspends `deck:Ageben* tag:<tag>`.
- **Anchor to checkpoint** (`anchorCheckpoint` in [`src/flashcards.ts`](../../src/flashcards.ts)): an overlay or closed-word row goes to the first non-review checkpoint after its `anchor` section on the same page, in that section's band. The anchor may be an explicit id or a heading slug. A row that maps to no checkpoint fails `npm test`.
- **Order inside a band pack:** units in sidebar order, checkpoints in path order inside a unit. Inside a checkpoint (`checkpointNotes`): core roots, core compounds, closed words, then each overlay kind in order of its first note, with its word notes, slot notes, ending note (the scale note sits with `sake`) and set note.
- **New-card order:** the packager gives each note a running `due` across the pack's decks; both cards of a note share it. Anki's default sort, *Card type, then order gathered*, would show a day's recognition cards before its production and higher cloze cards, so the learner page says to sort by *Order gathered*. It also says to tick *Import any learning progress*: the default import resets every card to new and drops the suspension.
- **Load check:** `npm test` fails when one checkpoint adds more than 45 new cards (a little over two days at Anki's default 20).

## Note types {#note-types}

[`scripts/flashcards-package.py`](../../scripts/flashcards-package.py) owns the note types and packages with `genanki`. The pack JSON's `model` names the default type and `fields` its field order; a note of another type names it in its own `model`, and `modelFields` gives that type's field order (`packJson`). The packager stops on an unknown model or a field list that does not match.

| Note type | Model id | Fields | Cards |
|-----------|----------|--------|-------|
| Ageben lexicon | 1738204517 | `front`, `concrete`, `abstract`, `aliases`, `parts`, `mnemonic`, `kind` | Recognition (form → English) and Production (English → form) |
| Ageben overlay | 1738204519 | `example`, `form`, `definition`, `readings`, `host`, `slot_of`, `gloss`, `link`, `mnemonic`, `kind` | Recognition and Production |
| Ageben set | 1738204520 | `text`, `title`, `link`, `mnemonic` | Cloze: one card per member |
| Claritish | 1738204518 | `front`, `meaning`, `lesson` | Recognition only, with a small muted lesson line under the meaning |

- Model ids are fixed constants. Never change one: Anki would treat it as a new note type.
- **Mnemonic,** on every Ageben type: on the back only, small and muted, except on an overlay card, where it is the labeled *cue* that leads from the host to the meaning.
- **Ageben lexicon:** roots, compounds and closed words. Roots and compounds show labeled concrete, abstract and *also* (`english_aliases`) lines. A closed word (`kind` set) shows a *definition* line, its English as plain text, and a *gloss* line, the words starred in `english`. `parts` is HTML, the [letters](#letters) of a root, compound or closed word. No two production fronts may match (`npm test`).
- **Ageben overlay:** `example`, `readings` and `host` are HTML; the example wraps the overlay word in `<span class="overlay">`, and `host` holds the highlighted word's [letters](#letters).

  | Card | Front | Back |
  |------|-------|------|
  | Recognition | The example, overlay highlighted | Definition; per-slot readings when they differ; *new slot of* (slot notes); the word's letters, ending with its host's concrete sense; the mnemonic as a labeled *cue*; morph gloss of the example; link to the anchor section |
  | Production | Definition, and the example with the overlay blanked | The full example, then the recognition back |

- **Ageben set:** `text` is cloze HTML, one `{{cN::<code>…</code>}}` per member with its English after it, so the other members show on each card. Scale, ending, name and set notes all use it.
- **Claritish:** `meaning` is HTML and is not escaped by the packager; `meaningHtml` escapes the text it builds from. Claritish and Ageben notes never share a note type.

## Digit and letter names {#sound-names}

[`data/sound-names.csv`](../../data/sound-names.csv) owns the digit syllables and the letter names (`group`, `form`, `reading`, `cue`, `anchor`, `checkpoint`); [`src/flashcards-names.ts`](../../src/flashcards-names.ts) builds one Ageben set note per group: `digits`, `digit-letters`, `other-letters`, `vowels`. Each blank hides a name, and the digit or letter it names shows beside it; a vowel also shows its English cue, because a vowel's name is the vowel.

- **Checkpoint:** a row's `checkpoint` is the stage checkpoint whose Practice unlocks the note, one per group. Digits unlock at `numbers.md#beginner-practice`. `letter-names.md` has no checkpoint, so its names unlock at the next intermediate one in the sidebar, `proper-names.md#intermediate-practice`. The note is tagged `ageben::names` and `ageben::names::<group>`; its key and GUID spelling is `names:<group>`.
- **Link:** the row's `anchor`.
- **Kept current by `npm test`** (`src/sound-names.test.ts`): the `digits` rows must equal the Digit / Syllable table of `numbers.md`; the three letter groups together must equal the Ageben / Name / Cue table of `letter-names.md`, letter, name and cue, in page order; `digit-letters` must equal the digit-syllable table there; and each digit letter's name must be its digit syllable's consonant with the opposite vowel. Change a table and the CSV together.

## Overlay notes {#overlay-notes}

Card text comes only from the `data/` CSVs and checked page examples; nothing adds or rewrites a sense.

- **Word note** (`overlayWordNotes`, [`src/flashcards-overlays.ts`](../../src/flashcards-overlays.ts)): one per sense form, at the checkpoint of its first row. Rows of the form at that checkpoint fold in; where their definitions differ, `readings` lists them per slot (`ezem`: WHEREAS on `h`, ALTHOUGH on `th` / `g`). A folded note takes its example, definition, mnemonic and link from the first row in CSV order that has an example.
- **Slot note** (`overlaySlotNotes`): one per later checkpoint that puts a known form in a new slot, such as join relations, hinges, and moods on one adjective. Its back gives the new slot's reading and names the word note in `slot_of`. In an ending set only the `-m` form gets one, unless the `-l` / `-r` form's gloss in the new slot is new (`slotTaughtByMForm`).
- **Example** (`overlayExamples`, [`src/flashcards-examples.ts`](../../src/flashcards-examples.ts)): the shortest code span in the anchor section whose parse uses the overlay in the row's slot; failing that, the shortest such span in the rest of the page before its checkpoint. A lone citation never counts. The morph gloss comes from the page glosser's strict `morphGlossLine`. A row with no example fails `npm test`, except the `-l` / `-r` forms an ending note covers.
- **Host:** the `host` field is the [letters](#letters) of the highlighted word, the host root's line among them when it is a published root. Bare-vowel forms have no host line.
- **Link:** `https://clarityconlang.com/grammar/<page>.html#<id>` of the row's anchor.

## Letters {#letters}

[`src/flashcards-letters.ts`](../../src/flashcards-letters.ts) says where each letter of a word comes from, one `.letter` line per letter or piece: the letters in `<code>`, then the text in a `<span>`. The two make flex columns, so a long line wraps under its text; the overlay *cue* line uses the same layout. It reads only data and grammar pages, never CMU. The wording of kinds, jobs and sizes comes from the tables on [root tails](../grammar/beginner/root-tails.md#root-tails), and the role letters from the [consonants cheat sheet](../grammar/cheat-sheets/consonants.md#role-letters). The act, polar, join, sake-stance and ability vowels are a table in the file, quoting the vowels cheat sheet and their owning sections. Change a page's wording and the file together.

- **Root:** never the first vowel, which only keeps roots apart. On a five-letter root, the first consonant gets a line only when it equals the row's `onset` ([onset](procedures/lexicon.md#onset)), and the middle vowel only when it is the row's size vowel. A miss there is a root that gave the echo up in a full cell, so it gets no line, and a `mind` row has no size. Then the tail: kind and job. A place-name root gets one line, spelled from the English sound.
- **Compound:** the left root, the join (`-l` everyday sense, `-m` abstract sense), and the right root or a tail suffix as kind and job. A compound with an extra-noun hook keeps the plain parts line.
- **Closed word and overlay word:** split by `parseWord`. The role letter (`gl-` as one piece), the root's letters and concrete sense, or the stacked act, polar or join vowels, or a sake or ability stance after the host. Then the ending where a rule covers it: `-m` on a root is the abstract ending with the host's abstract sense, which is the step from the host to the overlay meaning; `-l` / `-r` on a kind taught on the settled-to-passing scale (the ending-note kinds, MAY, plan, notional); `-l` / `-m` / `-r` on `/y/` firm, soft, for now; a linker's `-l` firm; a special pronoun's `-n`. Any other ending gets no line (hinge `-l` / `-r`, likeness, identity, mention, the join `-n`, and a stance word's ending, which follows its stance's table). An overlay card explains the word its example highlights, so a sake card explains `thunatham`, not the citation `unam`.

## Endings and sets {#endings-and-sets}

[`src/flashcards-endings.ts`](../../src/flashcards-endings.ts) and [`src/flashcards-sets.ts`](../../src/flashcards-sets.ts) build Ageben set notes.

- **Scale note** (*Settled-to-passing scale*): `-l` settled, `-m` default, `-r` passing, at `sakes.md#beginner-practice`.
- **Ending note** (*<Kind> endings*): one per kind in `SCALE_ENDING_KINDS` (evidential, phasal, want, attempt, decision, mirative), at the kind's first `-l` / `-r` checkpoint. An ending's reading is the suffix of the kind's CSV gloss (a bare gloss reads *default*); every form of the kind must agree, or the build throws. The note lists the kind's `-m` forms below the cloze. These kinds keep word notes for `-m` forms only (`coveredByEndingNote`).
- **Lexical endings** keep a word note per form: `LEXICAL_ENDING_FORMS` (`elol`, `elor`, `ahul`, `ahur`), and every form of a kind outside `SCALE_ENDING_KINDS`, such as plan, MAY, notional and the as-of resume forms.
- **Set note** (*<Kind> words*): a kind's word notes first taught at one checkpoint, when there are at least `SET_MIN_MEMBERS` (3), `-m` forms only where the kind has an ending note. It sorts after its members.

## Closed words {#closed-words}

[`data/closed-words.csv`](../../data/closed-words.csv) (`form,english,kind,anchor`, read by [`src/closed-words.ts`](../../src/closed-words.ts)) holds closed words with a fixed English reading: pronouns, linkers, polar words, stance words and turn words. `english` marks the gloss words with `*…*`. Each row becomes an Ageben lexicon note, tagged `ageben::closed` and `ageben::closed::<kind>`, placed at its anchor's checkpoint like an overlay row. Its test checks that every form parses and is spelled in its anchor section; `retie-docs` relinks the anchors but does not rewrite the forms, so a stale form fails that test.

## Keys and release tags {#keys}

An `.apkg` import matches notes by GUID only. A GUID never comes from row order: an edit to a gloss line, alias, mnemonic, example, `core` cell or deck keeps the note and its review history, and a respelling makes a new note.

| Note | Key | GUID hashes | Tags |
|------|-----|-------------|------|
| Root | `root` | `root`, root, concrete | `ageben::root`, checkpoint tag |
| Compound | `stem` | `compound`, stem, concrete | `ageben::compound`, checkpoint tag |
| Closed word | `form` | `closed`, form, `english` | `ageben::closed`, its kind, stage, checkpoint tag |
| Overlay word | `sense_form` | `overlay`, key, its glosses | `ageben::overlay`, its kind, each PoS, stage, checkpoint tag |
| Overlay slot | `<form>@<page>` | same | same |
| Set | `<kind>@<page>` | `set`, key | `ageben::overlay`, its kind, stage, checkpoint tag |
| Ending | `endings:<kind>` | same | same |
| Scale | `scale` | same | `ageben::overlay`, stage, checkpoint tag |
| Claritish | | `claritish/<section id>/<form>` | `claritish`, `claritish::lesson::<slug>`, `claritish::release::<id>` |

- **Ageben GUID** (`noteGuid`): the first 12 characters of a base64url SHA-256 over `ageben/v2`, the source, the key and the gloss. An overlay note's gloss is its rows' distinct glosses, sorted and joined with ` / `. A row that takes another row's old spelling in a retie gets a new note, since the gloss differs.
- Kind, PoS and stage tags read `ageben::overlay::<kind>`, `ageben::closed::<kind>`, `ageben::pos::<pos>` and `ageben::stage::<band>`. Every Ageben note also carries the release tag.
- **Ageben release id** (`releaseId`): the first 8 hex of a SHA-256 over the notes (source, GUID, fields, `core`) sorted by GUID, without tags or decks. **Claritish release id:** the same over the decks (name, id) and their notes (GUID, fields), without tags. Each changes only when content changes, never from a timestamp.
- **Updating:** after importing a new release, the learner deletes `deck:Ageben* -tag:ageben::release::<id>` (or `deck:Claritish* -tag:claritish::release::<id>`), which clears the notes of respelled, reglossed and dropped forms.

## Claritish notes {#claritish-notes}

Card text comes only from the [Claritish cheat sheet](../grammar/claritish/cheat-sheet.md), read through [`sheet.ts`](../../src/claritish-editor/sheet.ts) and [`cheat-sheet-tables.ts`](../../src/lint/cheat-sheet-tables.ts). The generator never types a form or a meaning; a sheet edit reaches the cards with no code change. Fronts show the form only.

| Sheet section | Notes |
|---------------|-------|
| `#sounds` (vowels and `x`) | none: sounds, not meanings |
| `#settled`, `#how-you-know`, `#allowed` | each table is one ending scale: its first row gets one note per form cell, each later row one for its `-m` cell ([ending scales](#ending-scales)); the back is row label · column header: English |
| `#suffixes` | one per suffix, front with its hyphen |
| `#tone-marks` | one per mark |
| `#sakes` | one per need; one per stance; stance × ending forms, spelled by swapping the ending on the row's Example: one per row for its `-m` form in the first stance table, and every ending on the first row of each later table ([ending scales](#ending-scales)); each form in a Says cell (cut at its first comma); each prose line with a swap and its example (`gobathal`) |
| `#feelings` | one per urge; a line that gives a form already on the sheet another meaning joins that note |

- A section with tables and no rule above throws, so a new sheet section needs a rule in `sheetPlaces`.
- **No note** for pattern pieces (`th`, `g`, the formula table, the *Sake word* line) or a bare ending: endings read differently in each table, so their readings sit on full forms.
- **Merging:** one note per distinct form. A form in two places gets one meaning per place, joined by a line break; its section id (and so its GUID) is that of its first place.
- <a id="ending-scales"></a>**Ending scales:** once a learner knows a scale's three endings, a second row's `-l` and `-r` cards only drill its stem again. So each scale's endings get notes once, on the row that first teaches it (`rowPlaces`). Every other row gets one note, for its `-m` form, and its `-l` / `-r` forms and readings sit on that back in a muted `.also` line. A row whose endings read in a way the scale does not predict (*backups ready* on a plan, *they invited it* on an ought) goes in a table of its own on the sheet, so it is the first row of its scale. Its headers are bare `-l` / `-m` / `-r`, the first header cell names what the ending grades, and its cells give the readings.
- **Ending labels** on stance × ending notes come from the stance table's headers. Bare headers in the first stance table read the `#settled` column headers; a later stance table's bare headers give no label, and the cell is the reading. An ending swap is `swapEnding`, the same variant the cheat sheet lint accepts as taught.
- **Lesson of a note:** where the sheet links the note's first place to a lesson (its row, then its column header, then its section heading), that lesson. Otherwise the first lesson in `claritishLessons` order whose page has the form, or an ending-swapped variant, in a backtick span, including as a whole word inside a multi-word span. The build throws on a sheet link to a page that is not a lesson, and on a form in no lesson.
- **Tests** ([`flashcards-claritish.test.ts`](../../src/flashcards-claritish.test.ts)) fail on a note with no lesson and on a lesson page that lacks its note's form.
- Claritish cards ship unsuspended; new cards follow deck order, then sheet order inside a deck.

## Regenerating {#regenerating}

[`scripts/flashcards.ts`](../../scripts/flashcards.ts), run by `npm run build`:

| Command | Writes to `tmp/out/flashcards/` |
|---------|---------------------------------|
| `npm run flashcards` | every pack: `.apkg`, `.json` and the TSVs, then the import check |
| `npm run flashcards -- --pack beginner,everything` | only these (`beginner`, `intermediate`, `advanced`, `everything`, `claritish`) |
| `npm run flashcards -- --tsv-only` | TSVs and `.json` only; no packaging, no check, no `.venv` needed |
| `npm run flashcards -- --no-check` | every pack packaged, no import check; `.venv` needs only `genanki` |
| `npm run flashcards -- --out DIR` | the same, into `DIR` |

- An Ageben pack writes `ageben-<pack>.apkg`, `.json`, and one TSV per note type it holds: `ageben-<pack>.tsv` (lexicon), `-overlay.tsv` and `-set.tsv` (the last two `#html:true`). Claritish writes `claritish.apkg`, `.json` and `.tsv`.
- Packaging and the check need `.venv/bin/python` with [`requirements.txt`](../../requirements.txt) (`genanki` through [`requirements-publish.txt`](../../requirements-publish.txt), and the `anki` pin for the check). A `.venv` with only `requirements-publish.txt`, as on Amplify, still packages; see [import check](#import-check) for when the check is skipped.
- Output is deterministic: no timestamps or random ids in notes, GUIDs, deck ids or release ids. Nothing generated is committed.

## Import check {#import-check}

[`scripts/flashcards-check.py`](../../scripts/flashcards-check.py) imports every built pack into a throwaway collection with Anki's backend, with *Import any learning progress* on (`with_scheduling`), as the learner page says, and checks:

- the note types arrive, nothing conflicts, and overlapping Ageben packs share notes;
- cards arrive suspended where the pack JSON says `suspend`, and unsuspended elsewhere;
- new cards sorted by `(due, ord)` follow pack order, for the notes each pack brought;
- every card renders a question and an answer, and a cloze card has a blank: 2 cards per lexicon or overlay note, one per cloze number on a set note, 1 per Claritish note;
- each `ageben::cp::` tag's unlock search, `deck:Ageben* tag:<tag>`, finds exactly the notes that carry it;
- a second import adds nothing, and a card the learner unsuspended and one they reviewed keep their state;
- **release search:** for Claritish and for the Ageben packs together, it rebuilds the packs with one note dropped and the release tags recomputed, imports them with *always update*, and checks that the release search finds exactly the dropped note. For Claritish the Python release id matches the TS one, so a change to that formula changes `release_id` in the check too; for Ageben the check needs only a different id.

**When `.venv` has no `anki`.** Amplify installs only `requirements-publish.txt`, and a `.venv` set up by hand may do the same; the cloud setup script ([`.claude/cloud-setup-script.sh`](../../.claude/cloud-setup-script.sh)) installs `requirements.txt`, `anki` included. `npm run flashcards` (and so `npm run build`) then decides from `git diff` against the merge base with `origin/main`, untracked files included:

- No flashcard code changed: it packages every pack, skips the check, and prints a `warning:` line, which the build shows without failing.
- `src/flashcards*`, `scripts/flashcards*` or a `requirements*.txt` changed, or git can't tell: it fails before packaging and names the changed files. Install `requirements.txt` and rerun, or run the check where `anki` is installed.

Data edits (lexicon, closed words, sound names) change the notes but not how packs import, so they don't need the check.

## Publishing {#publishing}

- `docs:publish` runs [`scripts/publish-docs-extras.mjs`](../../scripts/publish-docs-extras.mjs) after VitePress. From the same `src/` calls as `npm run flashcards`, it packages `dist/grammar/flashcards/claritish.apkg` and `dist/grammar/flashcards/ageben-{beginner,intermediate,advanced,everything}.apkg`, served under `/grammar/flashcards/`. It skips the import check.
- [`amplify.yml`](../../amplify.yml) `preBuild` runs `python3 -m venv .venv` and installs `requirements-publish.txt` (`genanki` only) after `npm ci`.
- A missing `.venv` or a failed packaging step fails the deploy.
- **Data loaders** build from `src/` only, so the learner pages hold no hand-written data:
  - [`flashcards.data.ts`](../grammar/.vitepress/lib/flashcards.data.ts) gives the Ageben page each pack's title, download path (`AGEBEN_APKG_PATHS`, site-base-relative), note, card and deck counts; the checkpoints by band and unit, each with its title, link, tag, unlock search and counts (level reviews left out); and the release id, tag and cleanup search.
  - [`claritish-flashcards.data.ts`](../grammar/.vitepress/lib/claritish-flashcards.data.ts) gives the Claritish page its counts, deck list, download path and release tag.

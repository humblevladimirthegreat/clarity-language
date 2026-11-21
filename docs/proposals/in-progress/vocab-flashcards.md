# Proposal: vocab flashcards v2

**Status:** IN PROGRESS 2026-11-21. Phase 1 (U1–U5, closed words) done 2026-11-21: `data/closed-words.csv` (44 rows), its parser and test, the cheat sheets read it. Phase 2 (U6–U11, late hosts) done 2026-11-21: six hosts made core earlier (see [late hosts](#late-hosts)); no checkpoint over its `core` cap. Phase 3 (E1–E4, U12–U16, keys, examples, note types) done 2026-11-21, after the user settled the stop on overlay rows with no example (2026-11-21: exempt the `-l` / `-r` forms of ending-note kinds; write example sentences into the anchor sections for the rest, 69 rows on 12 pages). Every overlay row now has an example or is exempt. Autonomous, 2026-11-21: `un` on `/h/` is glossed *refusing*, as its definition and the parser label say. Phase 4 (U17–U23, notes and packs) done 2026-11-21: `npm run flashcards` gives Beginner 197 notes / 414 cards (9 decks), Intermediate 217 / 459 (17), Advanced 35 / 72 (5), Everything 2562 / 5124 (4), Claritish 98 notes (12 decks); the import check sees 2716 notes, 5381 cards, 47 decks. Largest checkpoint `sakes.md` at 42 new cards, so the load test passes with closed words in. Autonomous, phase 4, 2026-11-21: an `-l` / `-r` form whose `-m` sibling takes a new slot gets no slot note unless its gloss there is new (`ewel` cite at `same-role-words.md` gets one); closed-word English shows as plain text, the starred words on the concrete line; one TSV per note type; same-gloss members of a set (`enam` / `enar` in the as-of hinge set) stay as they are. Phase 5 (U24–U27, packaging and publishing) done 2026-11-21: the four Ageben packs ship every card suspended, new-card positions follow pack order, the import check proves both plus learner state through re-import, the release search, cloze blanks and each checkpoint's unlock search; `docs:publish` builds the four packs into `dist/grammar/flashcards/`; `flashcards.data.ts` feeds the page. Autonomous, phase 5, 2026-11-21: the page tells the learner to import the band packs before Everything, because a note shared between packs keeps the new-card position of the pack imported first. **Decided by agent:**
- 2026-11-21: `gezem` / `govam` on a noun are taught at `more-hinges.md#time-hinge-on-noun` with the other noun hinges; their anchors moved there from beginner `dependents.md#hinges`, whose two sentences naming them went (a `/ɡ/` hinge with `/b/` is taught later). High, not flagged, `9a6714b9`.
- 2026-11-21: the `/ɡ/` and `/w/` as-of resume forms (`genar`, `gunor`, `wenar`, `wunor`) take the snapshot of the matching earlier pair, taught with examples at `as-of.md#as-of`. Medium, not flagged, `99d9109f`.
- 2026-11-21: `hadam` on an event names what the act puts in as the filling (`zazozon vobuvul hadam bledudal` *Azozon pours, filling something with tea*), at `of-relations.md#of-relations`. Medium, not flagged, `a63e020d`.
- 2026-11-21: Anki's default import drops the suspension (it resets scheduling), so the Flashcards page tells the learner to tick **Import any learning progress**, and the U25 import check imports with `with_scheduling=True`; the alternative was a different unlock mechanism. Medium, not flagged, `9e905ed2`.
- 2026-11-21: Anki's default new-card sort (*Card type, then order gathered*) breaks note order within a day, so the Flashcards page tells the learner to set the Ageben preset to **Order gathered**; the alternative, a deck preset inside the `.apkg`, applies only if the learner ticks *Import deck presets* and genanki lacks it. Medium, not flagged, `40cf18cf`.

v1 shipped (`npm run flashcards`: Core, Sakes and Everything packs, summed up under [v1 as shipped](#v1-as-shipped); [`docs/meta/flashcards.md`](../../meta/flashcards.md) owns it and the Claritish pack; phase 6 extends that doc). Plan re-cut to one item per unit and six phases, 2026-11-21. Decisions, 2026-11-20:
- One pack per band, plus Everything.
- One subdeck per unit; words and grammar share each subdeck; unlocking is per checkpoint, by tag.
- Endings are taught once per kind; closed sets are drilled as overlapping cloze; no emoji on any card.
- Late hosts move their `core` cell earlier where a bank has room; closed function words move to data and get notes.
- No contrast cards; confusable pairs wait for v3; Advanced stays its own pack.
- GUIDs come from source + spelling + concrete gloss, with release tags for stale notes; the mnemonic stays on the back.
- The plan ends with a Flashcards download page under **Tools**.
- The Claritish pack shipped first (2026-11-20): it built the publish step, the release tag scheme and `docs/meta/flashcards.md`, which this plan extends.

**Related:** [`src/flashcards.ts`](../../../src/flashcards.ts), [`scripts/flashcards.ts`](../../../scripts/flashcards.ts), [`scripts/flashcards-package.py`](../../../scripts/flashcards-package.py), [`scripts/flashcards-check.py`](../../../scripts/flashcards-check.py), [`data/lexicon-overlays.csv`](../../../data/lexicon-overlays.csv), the [core vocabulary column](../../meta/procedures/lexicon.md#core-vocabulary-column), units in [`reading-order.ts`](../../grammar/.vitepress/lib/reading-order.ts), the [settled-to-passing scale](../../grammar/beginner/sakes.md#settled-to-passing), closed words in [`data/closed-words.csv`](../../../data/closed-words.csv) and [`src/closed-words.ts`](../../../src/closed-words.ts), the sidebar in [`config.ts`](../../grammar/.vitepress/config.ts), [`amplify.yml`](../../../amplify.yml).  
**Depends on:** none. The Claritish pack shipped 2026-11-20: publish step, Amplify venv, release tags and [`docs/meta/flashcards.md`](../../meta/flashcards.md).  
**Design authority:** none. No form or reading changes.

## Design

### Packs and decks

| Pack | Decks |
|------|-------|
| **Beginner**, **Intermediate**, **Advanced** | One subdeck per unit, named as in the sidebar: `Ageben::1 Beginner::04 Why and what for`. Each holds the unit's new core words, closed words and grammar notes |
| **Everything** | Every root, compound, closed word and overlay word note, for lookup. The page says to set its new cards per day to 0 |

Core and Sakes packs go away. Advanced stays its own pack although it is small, so the packs match the three bands.

- **Unlocking.** Every card ships suspended (`genanki.Card(suspend=True)`). Each note carries `ageben::cp::<page>::<band>` for the checkpoint that first drills it (a page has at most one checkpoint per band). On reaching a checkpoint, the learner unsuspends that tag.
- **Order inside a unit:** checkpoint order. Inside a checkpoint: core words, closed words, then for each overlay set its word notes, ending note and set note. New-card order in Anki must follow this order.
- **Anchor to checkpoint.** An overlay or closed-word row maps to the first non-review checkpoint after its `anchor` section on the same page, in that section's band (`anchorBand`). Anchors may be explicit ids or auto-slugged headings. A row that maps to no checkpoint fails `npm test`.
- **Other tags** stay as in v1: `ageben::root` / `compound` / `overlay` / `closed`, `ageben::overlay::<kind>`, `ageben::stage::<band>`.

### Note identity

An `.apkg` import matches notes by GUID only. A stable GUID lets a release change a gloss, alias, mnemonic, example, `core` cell or deck while the learner keeps their history. A respelling must instead become a new note, because the memorized form is wrong. A retie often gives one row another row's old spelling, so a spelling-only key would hand that row the old note's history.

- **GUID** = hash of source + spelling + concrete gloss. For overlays it is `sense_form` + `gloss`, and slot notes add `@page`. Closed words use form + English; set notes use kind + page; ending notes use kind; the scale note uses a fixed key. Deck ids stay hashed from deck names.
- **Release tag.** Every note carries `ageben::release::<id>`, where `<id>` is the first 8 hex of a hash of the note list without tags. It is deterministic and changes only when content changes. After importing, the learner deletes `deck:Ageben* -tag:ageben::release::<id>`. That one search removes respelled, retitled and dropped notes.
- Switching keys orphans v1 notes, which no learner holds.

### Overlay notes

New note type **Ageben overlay**, model id `1738204519` (`OVERLAY_MODEL`), fields `OVERLAY_FIELDS`: `example` (HTML, the overlay word in `<span class="overlay">`), `form`, `definition`, `readings` (HTML, empty for one reading), `host` (empty for bare-vowel forms), `slot_of` (slot notes only: the word note it names), `gloss`, `link` (anchor URL), `mnemonic`, `kind`. A pack JSON note names it with `model`, the pack's `modelFields` giving the field order (`packJson`, `PackJsonNote` in `src/flashcards.ts`):

| Card | Front | Back |
|------|-------|------|
| Recognition | The example, overlay highlighted | Definition (per-slot readings when they differ); host's concrete sense; mnemonic; morph gloss of the example; link to the anchor section |
| Production | Definition, and the example with the overlay blanked | The full example, then the recognition back |

- **Example:** the shortest code span in the anchor section whose parse uses the overlay in the row's slot. If there is none, take the shortest from the rest of the anchor's page, before its checkpoint. A row with none fails `npm test`, except the `-l` / `-r` forms of kinds with an ending note ([endings taught once](#endings-taught-once)). The **morph gloss** comes from the parser. Built: `overlayExamples` in `src/flashcards-examples.ts` (keyed by `overlayRowKey`, gives `text`, `index`, `from`, `gloss` from the page glosser's strict `morphGlossLine`); `coveredByEndingNote(row)`, `SCALE_ENDING_KINDS` and `LEXICAL_ENDING_FORMS` in `src/flashcards.ts`.
- **Word note:** one per sense form, at its first checkpoint. Rows at the same checkpoint fold in; differing readings are listed per slot (`ezem`: WHEREAS on `h`, ALTHOUGH on `th` / `g`).
- **Slot note:** one per later checkpoint that puts a known form in a new slot (join relations, hinges at `more-hinges.md` / `same-role-words.md`, moods at `universality.md`). Its back gives the new slot's reading and names the word note. For a form in an ending set, only the `-m` form gets a slot note.
- **Host:** `senseFormRoot`. The concrete sense is shown when it is a published root; bare-vowel forms show no host line.
- **Mnemonic,** on every note type: always on the back, small and muted, never on the front.

### Endings taught once

- **Scale note** at `sakes.md#beginner-practice`: `-l` settled · `-m` default · `-r` passing ([scale](../../grammar/beginner/sakes.md#settled-to-passing)).
- **Ending note** per kind whose endings read the scale (evidential, phasal, want, attempt, decision, mirative), at the kind's first `-l` / `-r` checkpoint. Its readings come from the kind's definitions in the overlay CSV.
- Those kinds keep word notes for `-m` forms only.
- Lexical endings keep a word note per form: plan, MAY, notional, `elol` / `elor`, `ahul` / `ahur`, and the as-of resume forms.

### Set notes

New note type **Ageben set**, Anki Cloze, model id `1738204520` (`SET_MODEL`), fields `SET_FIELDS`: `text` (one `{{cN::…}}` per member), `title`, `link`, `mnemonic`. One note per set, one blank per member; the other members show:

> {{c1::`avem`}} *already* · {{c2::`awum`}} *still* · {{c3::`elom`}} *not yet* · {{c4::`uvum`}} *no longer*

A set is a kind's word notes first taught at one checkpoint, three or more of them, `-m` forms only where the kind has an ending note. Scale and ending notes use the same type. A set note sorts after its members.

### Closed function words

[`data/closed-words.csv`](../../../data/closed-words.csv) (`form,english,kind,anchor`) holds 44 closed words with a fixed English reading: kinds `pronoun` 5, `linker` 9, `polar` 19 (answer words and the question particle `yem`), `stance` 7 (the act-word variants of `firm-soft.md`), `turn` 4 (`yal` `yel` `yol` `yul`). `english` carries `*…*` markup around the gloss words. `src/closed-words.ts` exports `loadClosedWords()`, `parseClosedWordsCsv()`, `ClosedWordRow` and `CLOSED_WORD_KINDS`; its test checks every form parses and is spelled in its anchor section. The cheat sheets show the `pronoun` and `linker` kinds only. `retie-docs` relinks its anchors but does not rewrite its forms; a stale form fails that test.

- Each row becomes an **Ageben lexicon** note, tagged and placed like an overlay.

### Late hosts

Done in phase 2: `eze`, `uge`, `eho`, `awu`, `ago` and `uba` are now core at or before the checkpoint that first drills their overlay. `ewe` and `uvahu` stay cues. A host cannot be a New word at a checkpoint whose bank lists one of its overlays: the word-bank lint counts the overlay row as the host root.

### Load check

`npm test` fails when a checkpoint adds more than **45 new cards**, a little over two days at Anki's default 20. Without closed words, the largest is `sakes.md` at 42; before these rules it was `universality.md` at 60.

### Download page

`docs/grammar/flashcards.md`, titled **Flashcards**, sits under **Tools** in the sidebar after Inspect. It holds:
- What the packs hold, with download links.
- Setup: Anki with AnkiDroid or AnkiMobile, FSRS at about 0.9, bury siblings, study from the top **Ageben** deck. When importing, tick **Import any learning progress**: Anki's default import resets every card to new, which drops the suspension the packs ship with (found in U24; Anki 26.9, `with_scheduling` off by default). In the study preset, set the new-card sort order to **Order gathered**: the default, *Card type, then order gathered*, shows a day's recognition cards before its production and higher cloze cards. Import the band packs before Everything: a note in both keeps the new-card position of the pack imported first.
- Unlocking: one tag search per checkpoint, grouped by band and unit.
- Updating: re-import, then delete with the release search.
- Reviewing: daily reviews before new cards; on a production card, say the answer before flipping; read-only learners suspend the production cards.

The page gets its pack list, checkpoint list and release id from the data loader `docs/grammar/.vitepress/lib/flashcards.data.ts` (see *As built* below). No hand-written list goes stale.

### Publishing

`docs:publish` builds the four packs into `dist/grammar/flashcards/` beside the Claritish pack, through the publish step and Amplify venv the Claritish pack added ([publishing](../../meta/flashcards.md#publishing)). A failed packaging step fails the deploy. Nothing generated is committed.

### As built (phases 1–5)

Input for U28 and U30; `docs/meta/flashcards.md` still describes v1 (Core, Sakes, one TSV) until U30.

- **Modules.** `src/flashcards.ts`: inputs, GUIDs (`noteGuid`), release tag, checkpoint tags (`anchorCheckpoint`, `checkpointTag`), `buildNotes`, `closedWordNotes`, `packJson`, `packTsv`. `src/flashcards-overlays.ts`: word and slot notes (`slotTaughtByMForm`). `src/flashcards-endings.ts`: scale and ending notes. `src/flashcards-sets.ts`: set notes (`overlaySetNotes`, `SET_MIN_MEMBERS`). `src/flashcards-packs.ts`: band packs, Everything, `checkpointNotes`, `noteCards`. `src/flashcards-examples.ts`: `overlayExamples`.
- **Notes.** `FlashcardNotes` holds `overlays` (90 word notes), `slots` (36), `endings` (scale + 6), `sets` (13) and `closed` (44), all in the release tag. Keys: word note `sense_form`; slot `<form>@<page>`; set `<kind>@<page>`; ending `endings:<kind>`; scale `scale`; GUID gloss of a folded note is its sorted distinct glosses joined with ` / `. A folded word note takes its example, definition, mnemonic and link from the first row in CSV order with an example. `link` is `https://clarityconlang.com/grammar/<page>.html#<id>`.
- **Slot rule.** An `-l` / `-r` form whose `-m` sibling takes the new slot gets a slot note only when its gloss there is new.
- **Set and ending notes.** HTML cloze, `{{c1::<code>-l</code>}} <i>settled</i> · …`; an ending's reading is the suffix of its kind's CSV gloss (a bare gloss reads *default*); titles *Settled-to-passing scale*, *<Kind> endings*, *<Kind> words*. An ending note lists its kind's `-m` forms outside the cloze.
- **Closed words.** Ageben lexicon notes, GUID `noteGuid("closed", form, english)`, tags `ageben::closed`, `ageben::closed::<kind>`; the English shows as plain text, the starred words on the concrete line.
- **Packs.** Subdeck per sidebar unit from `reading-order.ts`. Inside a checkpoint: core roots, core compounds, closed words, then each overlay kind in order of its first note: word, slot, ending, set (the scale note sits with `sake`). Everything holds Roots, Compounds, Closed and Overlays (word notes) only.
- **Output.** `npm run flashcards` (`--pack`, `--out`, `--tsv-only`) writes per pack `ageben-<pack>.apkg`, `.json`, and one TSV per note type: `ageben-<pack>.tsv`, `-overlay.tsv`, `-set.tsv` (the last two `#html:true`). `scripts/flashcards-check.py` reads each note's `model` and counts cards per type.

- **Suspension and order.** `packJson` writes a top-level `"suspend": true` for the four Ageben packs (absent for Claritish, which ships unsuspended); the packager sets `card.suspend` on every card. Each note gets a running `due` across decks in pack order; both cards of a note share it. With Anki's default import the suspension is lost and the default sort reorders a day's cards, hence the two setup steps on the page.
- **Import check** (`scripts/flashcards-check.py`, run by every `npm run flashcards`, about 5 s): imports with `with_scheduling=True`; Ageben cards arrive suspended, Claritish not; new cards sorted by `(due, ord)` match note order; an unsuspended and a reviewed card keep their state through re-import; after a next build with one note dropped, the release search finds exactly that note; every card renders, a cloze card has a blank; each `ageben::cp::` search (`deck:Ageben* tag:<tag>`, 99 tags) finds exactly its notes.
- **Publish.** `scripts/publish-docs-extras.mjs` writes `dist/grammar/flashcards/ageben-{beginner,intermediate,advanced,everything}.apkg` from the same `src/` calls as `npm run flashcards`, beside `claritish.apkg`; no import check there.
- **Data loader** `docs/grammar/.vitepress/lib/flashcards.data.ts`, built from `src/` only (about 2 s cold). Exports `AGEBEN_PACK_IDS`, `AGEBEN_APKG_DIR = '/flashcards'`, `agebenApkgFile(pack)`, `AGEBEN_APKG_PATHS` (`{ pack, path }`, site-base-relative, wrap in `withBase`), `loadAgebenFlashcards()`, and `data: AgebenFlashcardsData`:
  - `packs`: `{ id, title, path, notes, cards, decks }` for Beginner, Intermediate, Advanced, Everything.
  - `bands`: `{ band, title, units }`; a unit is `{ title, number, deck, checkpoints }` (units with notes only); a checkpoint is `{ title, page, link, tag, search, notes, cards }`, `link` like `/clause#beginner-practice`, `search` like `deck:Ageben* tag:ageben::cp::<page>::<band>`. Level reviews unlock nothing and are left out. Beginner 34 checkpoints in 9 units, Intermediate 52 in 17, Advanced 13 in 5.
  - `releaseId` (8 hex), `releaseTag`, `cleanupSearch` (`deck:Ageben* -tag:ageben::release::<id>`).

## Plan

Phase 6 is left, in a fresh orchestrator session, planned at well under 40 orchestrator turns. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends. Each phase starts with `npm run verify -- --baseline`. Every unit ends with `npm run verify -- --allow-generate`, and the orchestrator commits it when green. Subagents never commit.

The build runs `npm run flashcards`, which packages every pack with `scripts/flashcards-package.py` and checks it. The packager and `scripts/flashcards-check.py` know all three note types. Every unit leaves `npm run flashcards` working.

### Rule digest (copied into every brief)

> - You implement one unit of the flashcards v2 plan. Your brief quotes the design you build; do not read the proposal.
> - Run `.ts` with `npx --no-install tsx`, Python with `.venv/bin/python`. Generated output goes under `tmp/out/flashcards/`; probes under `tmp/scratch/`.
> - Never write a root spelling by hand. Check forms with one batched `node scripts/parse.mjs --check-lexicon '<a>' '<b>' …`.
> - Card text comes only from `data/` CSVs and checked page examples. No emoji, audio or invented senses on cards. The mnemonic shows on the back only.
> - Stage pages under `docs/grammar/{beginner,intermediate,advanced}/` never mention decks or link to the Flashcards page.
> - Output must be deterministic: no timestamps or random ids in notes, GUIDs, deck ids or the release id. Model ids are fixed constants.
> - GUID = hash of source + spelling + concrete gloss (overlays `sense_form` + `gloss`, slot notes `+@page`). Release tag `ageben::release::<8 hex of the tagless note list>`. Checkpoint tag `ageben::cp::<page>::<band>`.
> - Leave `npm run flashcards` working at the end of the unit: the build runs it, packaging and checking every pack.
> - A data JSON edit goes through load-and-save, then `npm run format-json`.
> - List headings first (`npm run -s outline -- <file>`), then read only the ranges you need. Trim output (`2>&1 | tail -30`).
> - Check with `npm run verify -- --allow-generate` (`--fast` inside an item). On a new error, read only its line in `tmp/logs/verify-last.log`.
> - Never edit `AGENTS.md`, `.claude/`, or files outside your **May edit** list; report needed changes instead.
> - Stop and report, without working around it, when: a premise of the unit no longer holds; the unit would need a different design; skipping would leave later units on a broken state; or more than a few rows fail a rule the design states.
> - At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
> - **Report** (about 150 words): done (one line); counts (notes, cards, rows) where the unit makes them; files touched (count); registry or `AGENTS.md` lines to change; the `verify` line; skips with reasons; lexicon choices; **left:**; **inefficient:**.

### Phase 6: page and docs

**U28 Flashcards page.** `proposal-worker`, `model: opus`, effort `high`.
- Write `docs/grammar/flashcards.md` per the design's download page, reading the data loader (its exports, from *As built*, go in the brief). Follow [doc-style.md](../../meta/doc-style.md) and its checklist.
- Run `npm run build`; links to the `.apkg` files must pass the dead-link check.
- **May edit:** `docs/grammar/flashcards.md`, a Vue component under `.vitepress/components/` if the tables need one.

**U29 Sidebar and TODO.** *orchestrator*.
- Add `{ text: 'Flashcards', link: '/flashcards' }` to **Tools** in `config.ts`, after Inspect.
- Optional: extend the resume row of the `linking-clauses` cheat-sheet block on `as-of.md` and `cheat-sheets/linking-clauses.md` to `henar` / `genar` / `wenar`, `hunor` / `gunor` / `wunor`.
- Remove the `flashcards download on tools` line from `TODO.md` when that file has no other uncommitted change; otherwise tell the user.

**U30 Meta doc.** `proposal-worker`, `model: opus`, effort `medium`.
- Extend `docs/meta/flashcards.md` (written with the Claritish pack) with the Ageben packs:
  - packs and decks, note types, keys and release tags, the anchor-to-checkpoint rule, endings and sets, the load check;
  - regenerating and the import check;
  - where decks are built.
- The brief carries this proposal's Design and [v1 as shipped](#v1-as-shipped) sections.
- **May edit:** `docs/meta/flashcards.md`.

**U31 Style gate.** `style-editor`, `model: opus`, effort `high`.
- Review the `npm run changed-sections -- <rev>` list, where `<rev>` is `1a0e3e4f`, the commit before phase 1's first. That list covers phase 2's checkpoint top-ups (`speech-moves.md`, `dependents.md`, `plurality.md`, `clause-sequence.md`, `here-there.md`, `label-seams.md`, `collectives.md`), phase 3's anchor examples and decisions (`sakes.md`, `universality.md`, `already-still-yet.md`, `can-and-cant.md`, `join-relations.md`, `locative-relations.md`, `of-relations.md`, `same-role-words.md`, `as-of.md`, `more-hinges.md`, `because-and-iff.md`, `dependents.md`) and the Flashcards page.
- One weak example for the orchestrator to swap if a better one parses: `can-and-cant.md#ability-fallback`, `zazozon dogozel wodaxam guzemel vayebel.`, where the page itself prefers `guzemexal`.

Final gate: `npm run verify` against an empty baseline (`--allow-generate` only for allowlist **generate** rows this plan did not touch). The orchestrator then:
- cuts this proposal down to an idea holding the v3 items, per [consolidate](../../meta/procedures/proposals.md#consolidate);
- runs `git mv` to `ideas/`.

### Commits

One commit per unit, with the message `vocab-flashcards U<n>: <summary> [skip-cd]` plus the co-author line. A `cheat-sheet-blocks --write` that changes output gets its own fenced commit. Each phase ends with a commit of the consolidated proposal. Expected: phase 6, 5, the last being the idea cut-down.

## Open decisions

None.


## Background

### Problem

v1 teaches words but almost no grammar. Its Core pack holds only content roots, and the Sakes pack is the only one with overlays. A learner meets about 180 overlay notes and the closed function words (pronouns, sentence linkers, polar particles, turn words) on the pages, with nothing to review them.

The v2 plan in v1 (one overlay subdeck per `kind`) would make this worse:

- **Kinds mix stages.** Clause hinges are anchored from beginner `dependents.md` to advanced `as-of.md`.
- **Ending series triple the load.** Evidentials alone are 7 channels × `-m` / `-l` / `-r`, three nearly identical notes per channel.
- **Bare forms are weak cues.** `unam` alone on a card means little until its section has been read.
- **Subdeck sizes swing widely.** Per checkpoint, 82 of 115 subdecks hold 1–5 notes and 8 hold more than 10, up to 30 (`universality.md`, 60 cards).

### Goals

1. Band packs whose unit subdecks hold the unit's words and grammar, unlocked one checkpoint at a time.
2. Overlay, set, ending and closed-word notes, built from data and checked pages, with no hand-written card text.
3. Note identity that survives edits, makes a respelling a new note, and lets a learner clear stale notes.
4. Decks built at publish and offered on a Flashcards page under **Tools**.

### Non-goals

- Anything in v3: cloze from sentences (anchor examples, never checkpoint items), inflected prompts, confusable-pair cards. When this plan is done, those go back to `ideas/`.
- Contrast cards, emoji on cards, audio, LLM enrichment, a custom SRS engine, an in-browser drill.
- Changing the lexicon schema (no row id column), gloss rules, or any form or reading.
- Stage pages mentioning the decks. Only the Flashcards page and the sidebar do.

### v1 as shipped

- **Command:** `npm run flashcards` writes `ageben-core`, `ageben-sakes` and `ageben-everything` (`.apkg`, `.tsv`, `.json`) under `tmp/out/flashcards/`. `--pack`, `--out` and `--tsv-only` are its flags, and `npm run build` runs it.
- **Split:** `src/flashcards.ts` owns notes, GUIDs, deck ids, tags and packs (`npm test`). `scripts/flashcards-package.py` owns the note type and packages with `genanki`. `scripts/flashcards-check.py` imports every pack into a throwaway collection with Anki's backend: the note type arrives, nothing conflicts, overlapping packs share notes, every card renders, and a second import adds nothing.
- **Note type "Ageben lexicon":** recognition (stem → English) and production (English → stem). The English block is labeled concrete, abstract and *also* (`english_aliases`) lines. A compound shows its parts with each root's concrete gloss. The mnemonic shows small on the back. No two production fronts may match.
- **Keys:** root `root`, compound `stem`, sake overlay `sense_form` with the `th` / `w` rows collapsed.

### Measurements

Measured 2026-11-20, mapping each overlay row to its checkpoint as in the design. Cards = 2 per word or overlay note, plus one per member of a set or ending note. Closed words are not counted.

| Band | Checkpoints | Core words | Overlay notes, v1 rules | Overlay notes, this design | Cards, this design |
|------|-------------|------------|-------------------------|----------------------------|--------------------|
| Beginner | 37 | 120 | 58 | 51 | 364 |
| Intermediate | 61 | 118 | 88 | 77 | 415 |
| Advanced | 17 | 21 | 37 | 16 | 76 |

Largest checkpoints under this design: `sakes.md` 17 notes and 42 cards (with the scale note), `dependents.md` 13 and 32, `list-verbs.md` 12 and 32, `universality.md` 12 and 24. Per unit, the 31 subdecks hold 2–34 notes. Fourteen units have no overlays.

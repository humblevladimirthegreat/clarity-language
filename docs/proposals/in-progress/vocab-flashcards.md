# Proposal: vocab flashcards v2

**Status:** IN PROGRESS 2026-11-21. Phase 1 (U1–U5, closed words) done 2026-11-21: `data/closed-words.csv` (44 rows), its parser and test, the cheat sheets read it; next is phase 2. v1 shipped (`npm run flashcards`: Core, Sakes and Everything packs, summed up under [v1 as shipped](#v1-as-shipped); [`docs/meta/flashcards.md`](../../meta/flashcards.md) owns it and the Claritish pack; phase 6 extends that doc). Plan re-cut to one item per unit and six phases, 2026-11-21. Decisions, 2026-11-20:
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
**Design authority:** none. No form or reading changes. Phase 2 moves six `core` cells earlier and tops up those checkpoints with existing forms.

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

New note type **Ageben overlay**, fixed model id:

| Card | Front | Back |
|------|-------|------|
| Recognition | The example, overlay highlighted | Definition (per-slot readings when they differ); host's concrete sense; mnemonic; morph gloss of the example; link to the anchor section |
| Production | Definition, and the example with the overlay blanked | The full example, then the recognition back |

- **Example:** the shortest code span in the anchor section whose parse uses the overlay in the row's slot. If there is none, take the shortest from the rest of the anchor's page, before its checkpoint. A row with none fails `npm test`. The **morph gloss** comes from the parser.
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

New note type **Ageben set**, Anki Cloze, fixed model id. One note per set, one blank per member; the other members show:

> {{c1::`avem`}} *already* · {{c2::`awum`}} *still* · {{c3::`elom`}} *not yet* · {{c4::`uvum`}} *no longer*

A set is a kind's word notes first taught at one checkpoint, three or more of them, `-m` forms only where the kind has an ending note. Scale and ending notes use the same type. A set note sorts after its members.

### Closed function words

[`data/closed-words.csv`](../../../data/closed-words.csv) (`form,english,kind,anchor`) holds 44 closed words with a fixed English reading: kinds `pronoun` 5, `linker` 9, `polar` 19 (answer words and the question particle `yem`), `stance` 7 (the act-word variants of `firm-soft.md`), `turn` 4 (`yal` `yel` `yol` `yul`). `english` carries `*…*` markup around the gloss words. `src/closed-words.ts` exports `loadClosedWords()`, `parseClosedWordsCsv()`, `ClosedWordRow` and `CLOSED_WORD_KINDS`; its test checks every form parses and is spelled in its anchor section. The cheat sheets show the `pronoun` and `linker` kinds only. `retie-docs` relinks its anchors but does not rewrite its forms; a stale form fails that test.

- Each row becomes an **Ageben lexicon** note, tagged and placed like an overlay.

### Late hosts

A host the learner already has is the strongest mnemonic. Six hosts that are now core only after their overlay move to a checkpoint with room, at or before the overlay. Each moved root goes from **New words** to **Review** on its old page.

| Host | Overlay first drilled at | Moves to |
|------|-------------------------|----------|
| `eze` *zebra* | `dependents.md` (beginner) | `dependents.md#beginner-practice` |
| `uge` *attest* | `knowing.md` (beginner) | `plurality.md#beginner-practice` |
| `eho` *east-west* | `causation.md` (beginner) | `clause-sequence.md#beginner-practice` |
| `awu` *anchor* | `already-still-yet.md` (beginner) | `already-still-yet.md#beginner-practice` |
| `ago` *map* | `intention.md` (beginner) | `intention.md#beginner-practice` |
| `uba` *socks* | `list-structure.md` (intermediate) | `list-structure.md#intermediate-practice` |

`ewe` (`clause.md`) and `uvahu` (`dependents.md`, whose one free slot goes to `eze`) find no room and stay cues.

### Load check

`npm test` fails when a checkpoint adds more than **45 new cards**, a little over two days at Anki's default 20. Without closed words, the largest is `sakes.md` at 42; before these rules it was `universality.md` at 60.

### Download page

`docs/grammar/flashcards.md`, titled **Flashcards**, sits under **Tools** in the sidebar after Inspect. It holds:
- What the packs hold, with download links.
- Setup: Anki with AnkiDroid or AnkiMobile, FSRS at about 0.9, bury siblings, study from the top **Ageben** deck.
- Unlocking: one tag search per checkpoint, grouped by band and unit.
- Updating: re-import, then delete with the release search.
- Reviewing: daily reviews before new cards; on a production card, say the answer before flipping; read-only learners suspend the production cards.

The page gets its checkpoint list and release id from a VitePress data loader, `flashcards.data.ts`, beside the other `*.data.ts` in `.vitepress/lib/`. No hand-written list goes stale.

### Publishing

`docs:publish` builds the four packs into `dist/grammar/flashcards/` beside the Claritish pack, through the publish step and Amplify venv the Claritish pack added ([publishing](../../meta/flashcards.md#publishing)). A failed packaging step fails the deploy. Nothing generated is committed.

## Plan

Phases 2–6 are left, each in a fresh orchestrator session, each planned at well under 40 orchestrator turns and cut where the next units read different rules or pages, or wait on a finding. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends. Each phase starts with `npm run verify -- --baseline`. Every unit ends with `npm run verify -- --allow-generate`, and the orchestrator commits it when green. Subagents never commit.

The build runs `npm run flashcards`, which packages every pack with `scripts/flashcards-package.py` and checks it. So the packager learns the new note types (U16) before the generator emits them (U17 on), and every unit leaves `npm run flashcards` working.

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

### Phase 2: late hosts

Six units, one sitting each. Before each launch, the orchestrator runs `node scripts/checkpoint-pack.mjs --unit <pack id> --band <band> <page>`. The prompt names the sitting, the pack and the host. The writer introduces the host at that sitting, moves its `core` cell there, and turns its old page's bank row from **New words** to **Review**. **May edit:** what `checkpoint-writer` allows for that sitting.

**U6 `eze` at `dependents.md`.** `checkpoint-writer`, `model: opus`, effort `high`. Pack `V2a`, band Beginner.

**U7 `uge` at `plurality.md`.** `checkpoint-writer`, `model: opus`, effort `high`. Pack `V2b`, band Beginner.

**U8 `eho` at `clause-sequence.md`.** `checkpoint-writer`, `model: opus`, effort `high`. Pack `V2c`, band Beginner.

**U9 `awu` at `already-still-yet.md`.** `checkpoint-writer`, `model: opus`, effort `high`. Pack `V2d`, band Beginner.

**U10 `ago` at `intention.md`.** `checkpoint-writer`, `model: opus`, effort `high`. Pack `V2e`, band Beginner.

**U11 `uba` at `list-structure.md`.** `checkpoint-writer`, `model: opus`, effort `high`. Pack `V2f`, band Intermediate.

Gate: `npm run verify -- --allow-generate` against the phase baseline, and `npm run core-vocabulary` shows no checkpoint over its cap.

### Phase 3: keys, examples, note types

**U12 Anchor to checkpoint.** `proposal-worker`, `model: opus`, effort `high`.
- In `src/flashcards.ts`, map each overlay row's `anchor` to its checkpoint per the design (explicit ids and auto slugs, `anchorBand`), as a function the later units call.
- Test: every overlay row maps.
- **May edit:** `src/flashcards.ts`, `src/flashcards.test.ts`.

**U13 Keys and tags.** `proposal-worker`, `model: opus`, effort `medium`.
- Add the new GUID, the release tag and the checkpoint tags (from U12) to the notes v1 builds today. Retire the v1 key.
- Tests: GUIDs follow the new key; a reused spelling with a new gloss makes a new GUID; the release id changes only when content changes.
- **May edit:** `src/flashcards.ts`, `src/flashcards.test.ts`.

**U14 Overlay examples.** `proposal-worker`, `model: opus`, effort `high`.
- Choose each overlay row's example per the design: the shortest code span in the anchor section whose parse uses the overlay in the row's slot, else the shortest from the rest of the anchor's page before its checkpoint.
- A test fails on a row with no example. If more than a few rows have none, stop and report the list.
- **May edit:** `src/flashcards.ts`, `src/flashcards.test.ts`, a new helper beside them.

**U15 Morph glosses.** `proposal-worker`, `model: opus`, effort `medium`.
- Attach the parser's morph gloss to each U14 example. Find the gloss code the build uses to check morph glosses and reuse it; do not write a new glosser.
- **May edit:** `src/flashcards.ts`, `src/flashcards.test.ts`, U14's helper.

**U16 Note types in the packager.** `proposal-worker`, `model: opus`, effort `medium`.
- Let the pack JSON name the note type per note, keeping the pack-level `model` as the default so the Claritish pack and the v1 notes package unchanged.
- In `scripts/flashcards-package.py`, add the **Ageben overlay** and **Ageben set** note types per the design (fixed model ids; mnemonic on the back only; a highlight style for the example). Nothing emits them yet.
- **May edit:** `scripts/flashcards-package.py`, `scripts/flashcards.ts`, `src/flashcards.ts` (pack JSON shape only).

Gate: `npm run verify -- --allow-generate` against the phase baseline.

### Phase 4: notes and packs

**U17 Overlay word notes.** `proposal-worker`, `model: opus`, effort `high`.
- Build an **Ageben overlay** word note per sense form at its first checkpoint, from U12–U15: rows at one checkpoint fold in, readings listed per slot where they differ, the host line from `senseFormRoot`.
- Retire the v1 sake-only collapse.
- **May edit:** `src/flashcards.ts`, `src/flashcards.test.ts`.

**U18 Slot notes.** `proposal-worker`, `model: opus`, effort `high`.
- Add a slot note per later checkpoint that puts a known form in a new slot; for a form in an ending set, only the `-m` form.
- Test: slot notes appear only at later checkpoints.
- **May edit:** `src/flashcards.ts`, `src/flashcards.test.ts`.

**U19 Scale and ending notes.** `proposal-worker`, `model: opus`, effort `high`.
- Add the scale note at `sakes.md#beginner-practice`, and an ending note per kind whose endings read the scale, at its first `-l` / `-r` checkpoint, both as **Ageben set** notes. Those kinds keep word notes for `-m` forms only; lexical endings keep a word note per form.
- **May edit:** `src/flashcards.ts`, `src/flashcards.test.ts`.

**U20 Set notes.** `proposal-worker`, `model: opus`, effort `medium`.
- Add a cloze set note per set as the design defines it, sorted after its members.
- **May edit:** `src/flashcards.ts`, `src/flashcards.test.ts`.

**U21 Closed-word notes.** `proposal-worker`, `model: opus`, effort `medium`.
- Build an **Ageben lexicon** note per row of `loadClosedWords()` (`src/closed-words.ts`; 44 rows, kinds `pronoun`, `linker`, `polar`, `stance`, `turn`), tagged and placed like an overlay through U12's mapping. Render the `*…*` markup in `english` as on the other notes. GUID: form + English.
- Test: every closed-word row maps to a checkpoint.
- **May edit:** `src/flashcards.ts`, `src/flashcards.test.ts`.

**U22 Band packs.** `proposal-worker`, `model: opus`, effort `high`.
- Build the band packs with unit subdecks in the design's order, plus Everything. Drop the Core and Sakes packs.
- Make `PACK_IDS` `beginner,intermediate,advanced,everything,claritish`.
- Update the TSV and CLI flags in `scripts/flashcards.ts` in the same unit, so the build keeps running.
- **May edit:** `src/flashcards.ts`, `src/flashcards.test.ts`, `scripts/flashcards.ts`.

**U23 Load test.** `proposal-worker`, `model: sonnet`, effort `medium`.
- Add the test: no checkpoint adds more than 45 new cards. If it fails with closed words in, stop and report the checkpoints over the limit.
- **May edit:** `src/flashcards.test.ts`.

Gate: `npm run verify -- --allow-generate`, and `npm run flashcards` prints its note and card counts per pack. The orchestrator puts those counts on the Status line.

### Phase 5: packaging and publishing

**U24 Suspended cards and new-card order.** `proposal-worker`, `model: opus`, effort `medium`.
- In `scripts/flashcards-package.py`, ship every card suspended, and make new-card order follow deck order.
- **May edit:** `scripts/flashcards-package.py`, `requirements.txt` (pins only).

**U25 Import check.** `proposal-worker`, `model: opus`, effort `medium`.
- Extend `scripts/flashcards-check.py`:
  - first import arrives suspended;
  - a card unsuspended before re-import stays unsuspended;
  - new-card order matches the note list;
  - after importing a second build with one note dropped, the release search finds exactly that note;
  - every card of every type renders.
- **May edit:** `scripts/flashcards-check.py`.

**U26 Publish step.** `proposal-worker`, `model: sonnet`, effort `medium`.
- Extend the Claritish publish step in `scripts/publish-docs-extras.mjs` to build the four Ageben packs into `dist/grammar/flashcards/`. Run `npm run docs:publish` and check the four `.apkg` files land.
- **May edit:** `scripts/publish-docs-extras.mjs`, `scripts/flashcards.ts`.

**U27 Data loader.** `proposal-worker`, `model: opus`, effort `medium`.
- Add `docs/grammar/.vitepress/lib/flashcards.data.ts`, modeled on the other data loaders. It returns the packs (name, file, note and card counts), the checkpoints grouped by band and unit (title, tag search), and the release id.
- The report lists the loader's exports and their shapes, for U28's brief.
- **May edit:** the new data loader.

Gate: `npm run verify -- --allow-generate` against the phase baseline.

### Phase 6: page and docs

**U28 Flashcards page.** `proposal-worker`, `model: opus`, effort `high`.
- Write `docs/grammar/flashcards.md` per the design's download page, reading U27's loader (its exports go in the brief). Follow [doc-style.md](../../meta/doc-style.md) and its checklist.
- Run `npm run build`; links to the `.apkg` files must pass the dead-link check.
- **May edit:** `docs/grammar/flashcards.md`, a Vue component under `.vitepress/components/` if the tables need one.

**U29 Sidebar and TODO.** *orchestrator*.
- Add `{ text: 'Flashcards', link: '/flashcards' }` to **Tools** in `config.ts`, after Inspect.
- Remove the `flashcards download on tools` line from `TODO.md` when that file has no other uncommitted change; otherwise tell the user.

**U30 Meta doc.** `proposal-worker`, `model: opus`, effort `medium`.
- Extend `docs/meta/flashcards.md` (written with the Claritish pack) with the Ageben packs:
  - packs and decks, note types, keys and release tags, the anchor-to-checkpoint rule, endings and sets, the load check;
  - regenerating and the import check;
  - where decks are built.
- The brief carries this proposal's Design and [v1 as shipped](#v1-as-shipped) sections.
- **May edit:** `docs/meta/flashcards.md`.

**U31 Style gate.** `style-editor`, `model: opus`, effort `high`.
- Review the `npm run changed-sections -- <rev>` list, where `<rev>` is `1a0e3e4f`, the commit before phase 1's first. That list covers U6–U11's checkpoints and the Flashcards page.

Final gate: `npm run verify` against an empty baseline (`--allow-generate` only for allowlist **generate** rows this plan did not touch). The orchestrator then:
- cuts this proposal down to an idea holding the v3 items, per [consolidate](../../meta/procedures/proposals.md#consolidate);
- runs `git mv` to `ideas/`.

### Commits

One commit per unit, with the message `vocab-flashcards U<n>: <summary> [skip-cd]` plus the co-author line. A `cheat-sheet-blocks --write` that changes output gets its own fenced commit. Each phase ends with a commit of the consolidated proposal. Expected: phase 2, 7; phase 3, 6; phase 4, 8; phase 5, 5; phase 6, 5, the last being the idea cut-down. About 31 left.

## Open decisions

None block phase 2. If U14 finds more than a few overlay rows with no example on their page, or U23's load test fails with closed words in, the orchestrator stops and brings the options to the user.

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

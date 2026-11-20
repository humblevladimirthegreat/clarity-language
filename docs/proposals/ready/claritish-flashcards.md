# Proposal: Claritish flashcards

**Status:** READY 2026-11-20. Decisions, 2026-11-20:
- Claritish gets a flashcard pack, built from the cheat sheet, and ships before flashcards v2 (`vocab-flashcards.md`).
- Card fronts show only the drop-in form; no example sentences.
- The pack has its own download page in the Claritish track.

**Related:** [Claritish cheat sheet](../../grammar/claritish/cheat-sheet.md), its reader [`src/claritish-editor/sheet.ts`](../../../src/claritish-editor/sheet.ts), [`scripts/lint-cheat-sheets.ts`](../../../scripts/lint-cheat-sheets.ts), the [Claritish track policy](../../meta/grammar-docs.md#claritish-track), [Claritish wording and voice](../../meta/claritish-style.md), lesson order in [`reading-order.ts`](../../grammar/.vitepress/lib/reading-order.ts) (`claritishLessons`), v1 flashcards in [`src/flashcards.ts`](../../../src/flashcards.ts), [`scripts/flashcards.ts`](../../../scripts/flashcards.ts), [`scripts/flashcards-package.py`](../../../scripts/flashcards-package.py), [`scripts/flashcards-check.py`](../../../scripts/flashcards-check.py), [`scripts/publish-docs-extras.mjs`](../../../scripts/publish-docs-extras.mjs), [`amplify.yml`](../../../amplify.yml), [`requirements.txt`](../../../requirements.txt).  
**Depends on:** none. `vocab-flashcards.md` depends on this one: it reuses the publish step, the release tag and the meta doc built here.  
**Design authority:** none. No form or reading changes; the pack adds no forms.

## Problem

The Claritish cheat sheet is where you look a form up, and the journal editor prompts while you write. Neither gets you to recall a drop-in without looking: someone who has done the lessons still has to open the sheet to tell `thubom` from `theyom`. The track policy says Claritish has no flashcard deck. Nothing is published for download yet, so the Ageben packs can't be offered either.

## Goals

1. A **Claritish** Anki pack: one recognition card per drop-in on the cheat sheet, with the form on the front and the sheet's meaning on the back.
2. Card text read from the cheat sheet's checked tables, never written by hand, so a lesson edit or a retie reaches the cards.
3. Built at publish time and offered on a **Flashcards** page in the Claritish track, as early as possible.
4. A publish step, release tag and meta doc that flashcards v2 extends rather than rebuilds.

## Non-goals

- Production cards (English → form), example sentences, cloze, audio, emoji.
- Full feeling words (sake + stance + ending + urge + duration): too many combinations. The parts get cards.
- Any change to the Ageben packs (v2's job), or a Tools-sidebar page.
- Unlocking by suspension: lessons are short, and each has its own subdeck.

## Design

### Notes

One note per distinct form, from the sheet sections below. Where one form appears in two places, its note joins both meanings (`thomam`: *could be*; and, right before a feeling word, *a cost or payoff that may come*).

| Sheet section | Notes | Back, for example |
|---------------|-------|-------------------|
| Vowels and x | none: sounds, not meanings | |
| Sure, decided, wanted | one per form cell | `thomal`: **could be** · lasting: *and I'll find out* |
| How you know | one per form cell | `thugel`: **live: seeing, hearing, feeling it now** · strong |
| Allowed and required | one per form cell | `hwuvar`: **allowed** · no one's word: *tolerated* |
| Suffixes on English words | one per suffix, front with its hyphen | `-xo`: **ability** · can't, just for now |
| Sakes, needs table | one per need | `una`: autonomy |
| Sakes, stance table | one per stance; one per stance × ending, its form spelled by swapping the ending on the row's Example | `tha`: **met** · thanks. `thawethal`: **thanks** (relatedness) · lasting: *it will stay with me* |
| Sakes, prose lines | `blawan`, `gobathal` | `gobathal`: *my coat*, thanks for a thing you own |
| Feelings, urge table | one per urge | `uo`: urge, pulls you to push back |
| Feelings, `thomam` line | joins the `thomam` note | |
| Tone marks | one per mark | `&`: contrast: this one, not another |

No note for the pattern pieces (`th`, `g`, the formula table, the *Sake word* line), and none for a bare ending (`-l`): the endings read differently in each table, so their readings sit on the full forms. Swapping an ending is the same variant `lint-cheat-sheets.ts` already accepts as taught.

The **back** is built from the cell's row label, column header and English, as `cellEnglish` and the other [`sheet.ts`](../../../src/claritish-editor/sheet.ts) readers do for the editor. A small muted line under it names the lesson. About 98 notes, one card each (counted by hand from the sheet; C1 reports the real count).

### Lessons and decks

- **Lesson of a note:** the first lesson in `claritishLessons` order whose page has the form, or an ending-swapped variant, in a backtick span. Where the sheet links a row or heading to a lesson, the two must agree; a test fails if they don't or if a note maps to no lesson.
- **Decks:** `Claritish::01 How sure are you?`, one subdeck per lesson in sidebar order, the bonus last. Deck ids hash the deck name, as v1 does.
- **Order:** new-card order follows deck order, then sheet order.
- **Tags:** `claritish`, `claritish::lesson::<slug>`, `claritish::release::<id>`.
- Nothing ships suspended. The page tells the learner to study a lesson's subdeck after reading it; studying the top deck draws from every lesson in order.

### Note identity

- **GUID:** hash of `claritish/` + sheet section id + form. A new meaning keeps the note's history; a respelling makes a new note.
- **Release tag:** `claritish::release::<id>`, where `<id>` is the first 8 hex of a hash of the note list without tags. It is deterministic and changes only when the content changes. After importing an update, the learner deletes `deck:Claritish* -tag:claritish::release::<id>`, which clears notes for respelled or dropped forms. v2 uses the same scheme with an `ageben::` prefix.
- **Note type:** **Claritish**, with its own fixed model id: fields `front`, `meaning`, `lesson`; one template, Recognition. It never shares notes with the Ageben packs. A learner who moves on to Ageben meets these forms again in Ageben sentences.

### Download page

`docs/grammar/claritish/flashcards.md`, titled **Flashcards**, sits in the Claritish sidebar after Cheat sheet and before Journal editor (the editor stays last, `next: false`). The intro page's table gets a row for it. It holds:
- What the pack holds: a table of lessons with card counts, and the download link.
- Setup: Anki, AnkiDroid or AnkiMobile; import the file.
- Studying: read a lesson, then study its subdeck; say the meaning before flipping.
- Updating: re-import, then run the release search.

It follows [Claritish wording and voice](../../meta/claritish-style.md), links only to lessons, the download and the Anki apps, and is not a lesson (no gap or practice). Its counts and release id come from a VitePress data loader, `claritish-flashcards.data.ts` in `.vitepress/lib/`, so nothing on it is hand-written data.

### Publishing

- `docs:publish` builds the pack into `dist/grammar/flashcards/claritish.apkg` after VitePress, in `publish-docs-extras.mjs`. Nothing generated is committed.
- `amplify.yml` `preBuild` creates `.venv` and installs `requirements-publish.txt` (`genanki` only) after `npm ci`. `requirements.txt` includes it with `-r` and keeps the `anki` pin for the import check, which publishing does not run.
- A failed packaging step fails the deploy.

## Plan

One phase, in one orchestrator session. If the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends. The phase starts with `npm run verify -- --baseline`. Every unit ends with `npm run verify`, and the orchestrator commits it when green. Subagents never commit.

### Rule digest (copied into every brief)

> - You implement one unit of the Claritish flashcards plan. Your brief quotes the design you build; do not read the proposal.
> - Run `.ts` with `npx --no-install tsx`, Python with `.venv/bin/python`. Generated output goes under `tmp/out/flashcards/`; probes under `tmp/scratch/`.
> - Card text comes only from the Claritish cheat sheet's tables and lines, through `src/claritish-editor/sheet.ts` and `src/lint/cheat-sheet-tables.ts`. Never type a form or a meaning into code. Fronts show the form only.
> - Lesson pages never mention the pack. Only the Flashcards page, the intro page's table and the sidebar do.
> - Output must be deterministic: no timestamps or random ids in notes, GUIDs, deck ids or the release id. Model ids are fixed constants.
> - GUID = hash of `claritish/` + section id + form. Release tag `claritish::release::<8 hex of the tagless note list>`. Lesson tag `claritish::lesson::<slug>`.
> - List headings first (`npm run -s outline -- <file>`), then read only the ranges you need. Trim output (`2>&1 | tail -30`).
> - Check with `npm run verify` (`--fast` inside an item). On a new error, read only its line in `tmp/logs/verify-last.log`.
> - Never edit `AGENTS.md`, `.claude/`, or files outside your **May edit** list; report needed changes instead.
> - Stop and report, without working around it, when: a premise of the unit no longer holds; the unit would need a different design; skipping would leave later units on a broken state; or more than a few forms fail a rule the design states.
> - At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
> - **Report** (about 150 words): done (one line); counts (notes per lesson) where the unit makes them; files touched (count); registry or `AGENTS.md` lines to change; the `verify` line; skips with reasons; **left:**; **inefficient:**.

**C1 Notes and pack.** `proposal-worker`, `model: opus`, effort `high`.
- Add `src/flashcards-claritish.ts`: read the sheet with `readSheet`, build the notes per the design's table (merging same-form notes, stance × ending by ending swap), map each to its lesson, set GUIDs, tags and the release id, and build the pack's lesson decks.
- Add `claritish` to `PACK_IDS` and make `scripts/flashcards.ts` write it (`--pack claritish`), with a `model` field in the pack JSON naming the note type.
- Tests: every note maps to one lesson and agrees with the sheet's links; no two fronts match; no note for the excluded sections; GUIDs and the release id are stable across two runs; a changed meaning keeps the GUID, a changed form changes it.
- **May edit:** `src/flashcards-claritish.ts`, `src/flashcards-claritish.test.ts`, `src/flashcards.ts` (`PACK_IDS` and pack dispatch only), `scripts/flashcards.ts`.

**C2 Note type and import check.** `proposal-worker`, `model: opus`, effort `medium`.
- In `scripts/flashcards-package.py`, add the **Claritish** note type (fixed model id, one Recognition template, lesson line small and muted) and pick the model from the pack JSON's `model` field.
- Extend `scripts/flashcards-check.py` to the Claritish pack: it imports, every card renders, a re-import adds nothing, and after importing a build with one note dropped, the release search finds exactly that note.
- **May edit:** `scripts/flashcards-package.py`, `scripts/flashcards-check.py`.

**C3 Publish pipeline and data loader.** `proposal-worker`, `model: opus`, effort `medium`.
- Make `publish-docs-extras.mjs` build the Claritish pack into `dist/grammar/flashcards/`. Add `requirements-publish.txt` and the venv steps to `amplify.yml` `preBuild`. Confirm the Amplify build image has Python 3, and say how in the report.
- Add `docs/grammar/.vitepress/lib/claritish-flashcards.data.ts`, modeled on the other data loaders: the file path, notes per lesson (title, slug, count, deck name) and the release id, computed by C1's code.
- **May edit:** `scripts/publish-docs-extras.mjs`, `amplify.yml`, `requirements.txt`, `requirements-publish.txt`, `package.json` (scripts), the new data loader, `.gitignore`.

**C4 Flashcards page and sidebar.** `proposal-worker`, `model: opus`, effort `high`.
- Write `docs/grammar/claritish/flashcards.md` per the design's download page, reading C3's loader. Follow [claritish-style.md](../../meta/claritish-style.md) (voice, the grammar's terms) and doc-style's [interface instructions](../../meta/doc-style.md#interface-instructions); the lead rules for teaching sections do not apply. Say *flashcard* where *card* alone could mean a journal editor card.
- Add it to `claritishLessons` after Cheat sheet, add the intro page's table row, and add `flashcards.md` to `CLARITISH_NOT_LESSONS` in `scripts/lint-cheat-sheets.ts`.
- Run `npm run build`; the `.apkg` link must pass the build's link checks (it exists only in `dist/` after publish).
- **May edit:** `docs/grammar/claritish/flashcards.md`, `docs/grammar/claritish/index.md` (the table only), `docs/grammar/.vitepress/lib/reading-order.ts` (`claritishLessons` only), `scripts/lint-cheat-sheets.ts` (`CLARITISH_NOT_LESSONS` only), a Vue component under `.vitepress/components/` if the table needs one.

**C5 Meta doc and policy.** *orchestrator* for the policy and `AGENTS.md`; `proposal-worker`, `model: opus`, effort `medium`, for the meta doc.
- The subagent writes `docs/meta/flashcards.md`, which owns the generator: packs and decks, note types, keys and release tags, the Claritish note rules, regenerating, the import check, and publishing. Its brief carries this proposal's Design and the *v1 as shipped* section of `vocab-flashcards.md`. **May edit:** `docs/meta/flashcards.md`.
- The orchestrator edits the [Claritish track policy](../../meta/grammar-docs.md#claritish-track): the page list gains a flashcards page, the cheat sheet paragraph loses *Claritish has no flashcard deck*, and a **Flashcards** paragraph says what the page holds and that it adds no forms and links only to lessons. In `AGENTS.md`, the `claritish/` row names the flashcards page, and Editor notes gains a `flashcards.md` row.
- The orchestrator also fixes the two style guides, which have no rule for this page. In [claritish-style.md](../../meta/claritish-style.md#grammar-terms), the paragraph that keeps **cue**, **card** and **mirror** on the editor page says the Flashcards page's flashcards are Anki cards, not editor cards. In doc-style's [which-page table](../../meta/doc-style.md), a row for a Claritish page that is not a lesson (cheat sheet, flashcards, editor) says [interface instructions](../../meta/doc-style.md#interface-instructions) and Claritish voice apply, and the lead rules and slogan test do not. This lands before C6.

**C6 Style gate.** `style-editor`, `model: opus`, effort `high`.
- Review the `npm run changed-sections -- <rev>` list, where `<rev>` is the commit before C1's. That list covers the Flashcards page and the intro row.
- The brief names [claritish-style.md](../../meta/claritish-style.md) as a second guide to read in full (it is short), and says these pages are Claritish pages that are not lessons. So the agent's lead rule (English job, then Ageben shape) does not apply; doc-style's new which-page row from C5 does, with the Claritish checklist's judgment rules on terms and machinery. *Flashcard* and *card* on the Flashcards page mean Anki cards.

Final gate: `npm run verify` against an empty baseline. The orchestrator then removes this proposal per [consolidate](../../meta/procedures/proposals.md#consolidate) (the meta doc and the policy own the result) and updates `vocab-flashcards.md`'s **Depends on:** line.

### Commits

One commit per unit, with the message `claritish-flashcards C<n>: <summary> [skip-cd]` plus the co-author line, and a last commit removing this proposal. About 7 in all.

## Open decisions

None.

# Readings for six open cells

**Status:** READY, 2026-11-25. R1 and R2 ran ahead of phase 1, on 2026-11-25. The user settled D1 to D8 on 2026-11-25 (see [Decisions](#decisions)); none is left open. Phase 1 starts at U1.

**Related:** [unassigned-reserved.md](../../meta/unassigned-reserved.md), [design-decisions.md](../../meta/design-decisions.md), [special-values.md](../../grammar/advanced/special-values.md), [questions.md](../../grammar/beginner/questions.md), [relations.md](../../grammar/beginner/relations.md), [exactly-like.md](../../grammar/intermediate/exactly-like.md), [comparatives.md](../../grammar/beginner/comparatives.md), [as-of.md](../../grammar/advanced/as-of.md), [hooked-joins.md](../../grammar/advanced/hooked-joins.md), [ranges.md](../../grammar/intermediate/ranges.md), [because-and-iff.md](../../grammar/intermediate/because-and-iff.md), [interpreter.md § classification table](../../meta/interpreter.md#classification-table), [`enforce.ts`](../../../src/parse/enforce.ts), [`enforce-word.ts`](../../../src/parse/enforce-word.ts), [`tokens.ts`](../../../src/parse/tokens.ts), [`constructions.ts`](../../../src/parse/constructions.ts), [`detectors.ts`](../../../src/english-helper/detectors.ts).

**Depends on:** none. **Order:** do not interleave with `parser-structure.md` phase 4. Its parse-neutral gate compares construction counts, and this proposal adds constructions. Land that phase first, or finish this one first. The working tree had uncommitted edits to `constructions.ts`, `enforce-word.ts` and `tokens.ts` when this was written. Commit or stash them before phase 1.

**Design authority:** gives readings to these spellings, which are open now:
- `yrawul` / `yrawum` (`y+e-` / `y~+e-`)
- `yel` / `yem` + a citation (`yel azozon.`); `yul` + a citation (`yul azozon.`), per D2; a call + a citation (`yalazun azozon.`), per D3
- `/w/` likeness + `/b/` before an adjective (`wewem bohahal gelazem`, `wewel …`)
- `/h/` hooked joins on `ue` *through*, `am` *amid*, `oem` *in the direction of* (`huexual`, `hamxual`, `hoemxual`)
- a range of labelled landmarks (`al burahal g_3 oel g_5`), per D6
- `herol` + a `bl-` word or `blarl`, *only while*, per D8

`thohel` stays open (D7); only its entry is reworded. `yol azozon.` stays open (D2).

## Problem

[unassigned-reserved.md](../../meta/unassigned-reserved.md) keeps a cell open when no reading is natural yet. Six entries fall short of that test. Either the entry names a natural reading itself, or it gives a second route as the reason, which line 10 of the page rules out ([two ways to say one thing](../../meta/design-decisions.md)):

1. **`y+e-`**, Overlay `/y/`: "the nearest is `y+e-` *just made it!*, the mirror of `y-e-` *so close!*". `yrawul` already parses.
2. **A citation after a question word** (`yel azozon.`), Role-letter structure: kept out because "no page teaches a reading" and the lettered `yel zazozon.` exists. A learner who knows the reply `yal azozon.` will ask with `yel azozon.`, and English echo questions (*Azozon?*) are everyday speech. The parser rejects it as `citationTurn`.
3. **`wewem bazozon`**, Hosted relations: kept out because "*as big as Azozon* is the equative". The equative `zoel` only ties two list items in a clause. *A dog as big as a house* puts the comparison inside a noun phrase, and nothing says that today. The parser rejects `/w/` + `/b/` here (`clause.md#adjective-detail-w`); only the as-of pair (`wenam b_#22,7 gamahum`) has that shape.
4. **`/h/` hooked joins on `ue` / `am` / `oem`**, Hooked joins: the entry gives *throughout*, *in the thick of* and *in the run-up to*, then keeps them out because they "read close to" `a` and `habam`. The parser rejects them as `hookedJoinTime`.
5. **A range of landmarks** (*walk in rooms 3 through 5*), Hooks in-clause: a real English job, with only a clumsy workaround (`ul bX oel bY`, or the range in its own role). Borderline: it needs a design, not just a reading.
6. **`thohel`**, Closed-root endings: half of its reason is a second route (`thohem` plus a deontic). The other half, that neither **-l** guess fits a hinge, may hold on its own. Borderline.

## Goals

- Teach readings for cells 1 to 4 on their owning pages. Lift each parser rejection in the same change, add its interpreter rows, and remove or narrow its entry in `unassigned-reserved.md`.
- Settle cells 5 and 6 through research and a user decision. Then either teach them or reword their entries so each stands on a cost or a real guess conflict.
- Top up Practice where [drill-generation.md](../../meta/procedures/drill-generation.md) calls for it on a sitting that gained a form.

## Non-goals

- Other open cells. Their notes hold up.
- `yol azozon.` (a command + a citation). A request needs one action and a bare noun does not name it (*Coffee!* can be *bring me*, *I want* or *make*), so the cell stays open on that reason.
- `wewem` with no landmark. `wewem gelazem` keeps its current parse.
- Respelling the *if* / *if and only if* roots. `ohe` and `eho` are vowel-order mirrors, so one slip turns `thohem` into `thehom`. That is flagged to the user, not changed here.
- Hooks with no time reading on `/h/` (`ua`, `ao`, `e`, `ae`, `ue` *against*, `humxal`).

## Design

### 1. Near-made-it cheer (`yrawul`)

On `/y/`, the *a hair over* special `+e-` (`grawul`) is a cheer, the mirror of `yruwul` *so close!*:

| Form | Reading |
|------|---------|
| `yrawul` (`y+e-`) | *Just made it!* (cleared it by a hair) |
| `yrawum` (`y~+e-`) | the soft form, following the `y~-e-` row (*just about made it!*) |

Pages: the `/y/` cheer table in [special-values.md § number as interjection](../../grammar/advanced/special-values.md), and the role table under *Just short*, where `yruwul` sits. The numbers cheat sheet regenerates. The parser already accepts both forms, so the change is prose, interpreter rows (if the cheer reading is keyed by form), and the entry, which keeps `y-e`, `y_…` and the rest.

### 2. A citation after a question word

`yel azozon.` (and soft `yem azozon.`) asks whether a word is the one in play, the question twin of the reply `yal azozon.`:
- After a fill-ask, it offers a guess and asks whether it is right: `yel zar vowurol. yel azozon.` *Who walks?* *Azozon?* It fills nothing until the asker confirms.
- After any other sentence, it echoes a word from it: `zalazun veruvol. yel alazun.` *Alazun runs.* *Alazun?* (*did you say Alazun?*).

The lettered `yel zazozon.` stays as it is. Both uses go in, as one reading (D1).

`yul azozon.` is its prohibition twin, *not X!* (D2). `yul` is the prohibition act, so the citation names what is ruled out:
- After a fill-ask about what should happen, it rules a candidate out as a wish: *Who should go?* *Not Azozon!* It fills nothing.
- Anywhere else, it is a ban: *No phones!* Whatever one would do with the thing, don't.

It is not `yuel` *not that*. `yuel` is a polar answer that rejects an option as false, while `yul azozon.` is a directive about what should happen and makes no claim.

Page: [questions.md § fill-ask](../../grammar/beginner/questions.md), right after the paragraph that teaches `yal azozon.`. `yul azozon.` goes on the same page only if the prohibition act is taught at or before that point; otherwise it goes with `yul` in [speech-moves.md](../../grammar/beginner/speech-moves.md), whichever comes later in reading order. No example uses `?` or a polar reply, since both are taught later on questions.md. Parser: `enforce.ts:133` lets a question act or a prohibition act open a citation turn. The `citationTurn` summary in `constructions.ts` changes to match. Each new construction id gets an interpreter row. The `invalid-forms.test.ts:207` case changes to a `yol` turn, which stays rejected. Per D3, a call followed by a citation (`yalazun azozon.`) is a citation reply addressed to that person, like `yalazun yal azozon.` (which parses now). That one lifts a `citationInClause` rejection.

### 3. *As big as a house* (`wewem` + `/b/`)

The likeness relation on `/w/`, with a plain `/b/` model, grades the `/ɡ/` adjective right after the pair. The shape is the same as the as-of `/w/` pair:

> `zodozel wewem bohahal gelazem vowurol.` *A dog as big as a house walks.*

- `wewem` is *as … as* the model, the open match of likeness (*about as big as*, like `zoem`).
- `wewel`, from *exactly like*, is *exactly as … as*.

The equative `zoel` / `zoem` stays the clause-level tie between two list items. The relations page's Compare-with row on *as sleepy as* changes to point at both routes. Band (D4): `wewem` at beginner in relations.md, `wewel` at intermediate in exactly-like.md. If the forward-link lint shows the `/w/` + `/b/` pair needs something taught later, both go in exactly-like.md.

Pages: [relations.md § likeness](../../grammar/beginner/relations.md) teaches `wewem`; [exactly-like.md](../../grammar/intermediate/exactly-like.md) teaches `wewel`. Comparatives gets a Compare-with line only if no forward link results. Parser: the as-of pair comes in as a `WAsOf` token (`tokens.ts:456`, `isAsOfOverlay`) and `asOfWPair` rules (`sentence-grammar.ts`, `grammar/package-rules.ts`, `sentence-build.ts`, `construction-trace.ts`, `enforce-structure.ts`, `enforce-binding.ts`). The code unit either generalizes those to a hosted-relation `/w/` pair or adds a sibling, with new construction ids and their `interpret/classes.ts` rows. It keeps as-of's ids and counts unchanged.

### 4. Time bounds *throughout*, *in the thick of*, *in the run-up to*

Three more hooks bound an `/h/` restrictor by a time, each with its reading from the [extra-noun grid](../../grammar/advanced/hooked-joins.md#hooked-joins-hooks):

| Hook | Times it bounds | Ageben | English |
|------|-----------------|---------|---------|
| `uo` (`ue`) | every part of the landmark's span | `huexual blozulul` | *always, throughout the thunderstorm* |
| `am` | the busiest part of the span (the zone of `a`) | `hamxual blozulul` | *always, in the thick of the thunderstorm* |
| `oem` | the stretch leading up to it (the zone of `oe`) | `hoemxual blozulul` | *always, in the run-up to the thunderstorm* |

Page: the table and the Compare-with lines in [hooked-joins.md § bounding a time](../../grammar/advanced/hooked-joins.md#hooked-joins-time). The joins-hooks cheat sheet regenerates. Parser: `TIME_HOOKS` in `enforce-word.ts:29`, the `hookedJoinTime` summary, and the hook list in `detectors.ts:286` if it is spelled out there. All three go in (D5). The entry keeps the other hooks.

### 5. A range of labelled landmarks (D6)

Teach the range on the landmark's label: `al burahal g_3 oel g_5` *in rooms 3 through 5*; also `gragel oel grazal` *in three to five rooms* and `g#3 oel g#5`. *Room 3* is `burahal g_3` (the noun, then the `/ɡ/` label, per [number markers](../../grammar/intermediate/number-markers.md#marker-vowel-referential-identity)). [Ranges of numbers](../../grammar/intermediate/ranges.md#number-ranges) already teaches this range on a counted noun in `/z/`, `/d/` and `/b/`. Today the parser accepts it after a hook, but the reader drops it and reads `g_5` as a stray clause predicate.

This keeps the [rule that a hook right after a landmark is an extra noun on it](../../meta/design-decisions.md), because `g_5` is `/ɡ/`, not `/b/`: the role letter decides, as [ranges](../../grammar/intermediate/ranges.md#ranges) already says. One contrast is taught: `ul burahal g_3 oel g_5` is *from rooms 3 through 5*, while the path *from room 3 to room 5* keeps a `/b/` on the right (`ul burahal g_3 oel burahal g_5`). No new form. The entry narrows to *a range of named landmarks*, which stays open because no English job asks for it.

Code:
- `countedRange` in `src/interpret/read.ts` looks only in `claim.roles`. It also accepts a hook unit whose landmark ends in a `/ɡ/` number, and attaches the range to that number.
- Check that the stated range in `src/interpret/translate-helpers.ts` reaches landmarks held by a hook.
- Tests: `src/interpret/fixtures/solve-numbers.txt`, plus a reader test.
- Docs: a landmark example and the `ul … oel g_5` / `oel burahal g_5` Compare-with in `ranges.md`; the `hookJob:span` row in `interpreter.md`; the entry in `unassigned-reserved.md`; a clarifying clause in the landmark bullet of `design-decisions.md`.
- No new construction ids: the form falls under `hookJob:span`.

### 6. Hinge -l: `thohel` stays open, `herol` *only while* (D7, D8)

R2 found four **-l** patterns on closed roots, where the entry names two, and that the entry's *by* `arul` is a mistake (`arul` is the plain root *timer*; the *by* hinge is `huvahum`). The four:
1. strongest, an exact match: `hewel` / `gewel`
2. the reason broke a norm: `thahul`
3. the settled end of the settled-to-passing scale: `havel` and the other phasals, `thomal`, `themel`, `ubol`
4. closed, *B is the whole of it*: `abal` / `alal` / `erol` / `ewel`, and `hual` against `huam`

On *if* they pull opposite ways. *Strongest* and *no exceptions* give *whenever*, which is sufficiency. *The whole of it* gives *only if*, which is necessity and is `thebem`'s job. So `thohel` stays open on the guess conflict alone (D7), with this wording in `unassigned-reserved.md`:
- Lead of *Closed-root endings*: "**-l** on a closed root has no single guess. It is *strongest* on *exactly like* (`hewel`), *broke a norm* on *because* (`thahul`), the settled end of the [settled-to-passing scale](/knowing#settled-to-passing) on the phasals and channels (`havel`, `ubol`), and *B is the whole of it* on the same-role words (`erol` *only while*). A family where these disagree, or where none meets an English job, has no guessable **-l**."
- Entry: "**open:** clause-hinge **-l** beyond *because* (`thahul`) and *while* (`herol`). On *if* (`thohel`) the guesses pull opposite ways: *strongest* and the restrictors' *no exceptions* (`hual`) give *whenever*, and the same-role *B is the whole of it* (`erol`) gives *only if*, so the listener cannot tell which was meant. On the other clause hinges no guess meets an English job."

On *while* the patterns agree: `erol`'s *A happens during B and at no other time* carries over to the *while* hinge word for word. So `herol` + a `bl-` word or `blarl` is *only while* / *as long as* (time) (D8). `habal` / `halal` (*only before* / *only after*) carry over less well and stay under the open entry.

Two edits keep sufficiency and necessity apart on the pages:
- **The *if* cue.** `thohem`'s door cue reads "walk through only if it opens", which is the *only if* wording on the sufficiency word. It becomes "🚪 *door*: open it and you're through" everywhere it appears: [causation.md](../../grammar/beginner/causation.md) lines 19, 91 and 110, and the table in [because-and-iff.md](../../grammar/intermediate/because-and-iff.md) line 21.
- **A Compare-with on `erol`** in [same-role-words.md](../../grammar/intermediate/same-role-words.md#same-role-while): `erol` *only while* is about time; for *only if* on a condition, use `thebem`, linking back to [causation.md § only if](../../grammar/beginner/causation.md#only-if). That page is beginner, so the link is backward.

## Implementation plan

Two phases, run through subagents. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates the proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

**Gates.**
- At the start of each phase, the orchestrator:
  - saves `npm run verify -- --baseline`
  - notes the phase-start commit
  - writes the rule digest below, with that sha, to the scratchpad
- Each unit ends with `npm run verify -- --allow-generate`, which passes before its commit.
- A unit that lifts a rejection also runs `npm run grammar-check` (U3a adds grammar rules, so the LR(1) check matters there).
- **Recall gate:** phase 1 edits `src/english-helper/detectors.ts` if U4 needs it. If so, run `npm run english-helper-recall -- --check` at phase 1's end and put the result on the Status line.
- **Cheat sheets:** after a phase's hand units are committed, the orchestrator runs `npm run cheat-sheet-blocks -- --write` and commits its output alone ([fence automated rewrites](../../meta/procedures/proposals.md#fence-automated-rewrites)).
- **The final gate** is a full `npm run verify` against an empty baseline at the end of phase 2.

**Style.** Writers of grammar prose self-check against the [checklist](../../meta/doc-style.md#checklist).
- **While `grammar-newcomer-rewrite.md` is unfinished:** no `style-editor` unit runs, since no unit creates a page.
- **Once it is done:** phase 2 ends with a `style-editor` unit (`model: opus`, effort `high`) over `npm run changed-sections -- <commit before phase 1>`, folded into that phase. It runs only if the run's grammar edits add a section or come to more than a few sentences on a page.

**Decisions.** All are settled by the user; no decision commits are needed. The brief carries the settled reading from the design section.

### Phase 1: settled readings

Phase 1 is roughly 30 orchestrator turns.

**U1 Near-made-it cheer.** `proposal-worker`, `model: opus`, effort `high`.
- Teaches [design § 1](#1-near-made-it-cheer-yrawul). Checks `yrawul` / `yrawum` with `--check-lexicon --at special-values.md#…`, and gives them interpreter rows if `npm run class-row` shows the cheers are keyed by form.
- Narrows the Overlay `/y/` entry.
- **May edit:** `docs/grammar/advanced/special-values.md`, `docs/meta/unassigned-reserved.md`, `docs/meta/interpreter.md`, `src/interpret/classes.ts`.

**U2 Citation after a question word.** `proposal-worker`, `model: opus`, effort `high`.
- Teaches [design § 2](#2-a-citation-after-a-question-word): `yel` / `yem` + a citation, `yul` + a citation, and a call + a citation. Lifts the matching rejections.
- Narrows the Role-letter structure entry to `yol azozon.`, with the reason in Non-goals.
- **May edit:** `src/parse/enforce.ts`, `src/parse/constructions.ts`, `src/parse/invalid-forms.test.ts`, `src/parse/parse.test.ts`, `src/interpret/classes.ts`, `docs/meta/interpreter.md`, `docs/grammar/beginner/questions.md`, `docs/grammar/beginner/speech-moves.md`, `docs/meta/unassigned-reserved.md`.

**U4 Time bounds.** `proposal-worker`, `model: opus`, effort `high`.
- Teaches [design § 4](#4-time-bounds-throughout-in-the-thick-of-in-the-run-up-to), all three hooks, and narrows the Hooked joins entry.
- **May edit:** `src/parse/enforce-word.ts`, `src/parse/constructions.ts`, `src/parse/invalid-forms.test.ts`, `src/english-helper/detectors.ts`, `src/interpret/classes.ts`, `docs/meta/interpreter.md`, `docs/grammar/advanced/hooked-joins.md`, `docs/meta/unassigned-reserved.md`.

**U6 Hinge -l (`herol` *only while*, `thohel` open).** `proposal-worker`, `model: opus`, effort `high`.
- Carries out [design § 6](#6-hinge--l-thohel-stays-open-herol-only-while-d7-d8):
  - teaches `herol` + a `bl-` word or `blarl` on the [time hinges](../../grammar/beginner/dependents.md#hinges) section
  - adds an `erol` row on `h` to `data/lexicon-overlays.csv` (and on `g` if the page teaches a noun-side use)
  - updates `isHinge` in `src/parse/enforce-structure.ts`, if the hinge list does not come from overlay data
  - adds a `clause_hinge` row to `src/interpret/classes.ts` and its row in `interpreter.md`
  - rewrites the *Closed-root endings* lead and the clause-hinge **-l** entry in `unassigned-reserved.md`, with the wording in design § 6
  - fixes the *if* door cue in all four places
  - adds the `erol` / `thebem` Compare-with
- **May edit:** `docs/meta/unassigned-reserved.md`, `data/lexicon-overlays.csv`, `src/parse/enforce-structure.ts`, `src/interpret/classes.ts`, `docs/meta/interpreter.md`, `docs/grammar/beginner/dependents.md`, `docs/grammar/beginner/causation.md`, `docs/grammar/intermediate/because-and-iff.md`, `docs/grammar/intermediate/same-role-words.md`.

Order: U1, U2, U4, U6, then the cheat-sheet rewrite, which also picks up U6's overlay row.

**Commits:** U1, U2, U4, U6, the cheat-sheet output, and the consolidated proposal: about six.

### Phase 2: likeness on `/w/`, the landmark range, Practice

Phase 2 is roughly 30 orchestrator turns.

**U3a `/w/` likeness pair: code.** `proposal-worker`, `model: opus`, effort `high`.
- Builds the parse in [design § 3](#3-as-big-as-a-house-wewem--b): `wewem` *about as … as*, `wewel` *exactly as … as*.
- Before briefing, the orchestrator greps once for `isAsOfOverlay` and `asOfWPair` and adds any file the value reaches that is not listed here.
- Reports the forms, glosses and construction ids that U3b is briefed from.
- **May edit:** `src/parse/tokens.ts`, `src/parse/classify.ts`, `src/parse/types.ts`, `src/parse/sentence-grammar.ts`, `src/parse/grammar/package-rules.ts`, `src/parse/sentence-build.ts`, `src/parse/construction-trace.ts`, `src/parse/enforce-structure.ts`, `src/parse/enforce-binding.ts`, `src/parse/gloss-structure.ts`, `src/parse/constructions.ts`, the parser tests, `src/interpret/classes.ts`, `docs/meta/interpreter.md`.

**U3b `/w/` likeness pair: prose.** `proposal-worker`, `model: opus`, effort `high`.
- Teaches U3a's result on the pages in [design § 3](#3-as-big-as-a-house-wewem--b).
- Deletes the Hosted relations entry.
- **May edit:** `docs/grammar/beginner/relations.md`, `docs/grammar/intermediate/exactly-like.md`, `docs/grammar/beginner/comparatives.md`, `docs/meta/unassigned-reserved.md`.

**U5 Range of labelled landmarks.** `proposal-worker`, `model: opus`, effort `high`.
- Carries out [design § 5](#5-a-range-of-labelled-landmarks-d6) in one unit: the reader fix and its prose, as listed under *Code* there. The design is settled, so it does not split.
- **May edit:** `src/interpret/read.ts`, `src/interpret/translate-helpers.ts`, `src/interpret/fixtures/solve-numbers.txt`, the reader tests, `docs/grammar/intermediate/ranges.md`, `docs/meta/interpreter.md`, `docs/meta/design-decisions.md` (the landmark bullet under hooks and relations), `docs/meta/unassigned-reserved.md`.

**C1, C2 Practice top-up.** `checkpoint-writer`, `model: opus`, effort `high`.
- C1 covers the beginner and intermediate sittings that gained a form: questions (and speech-moves if `yul azozon.` landed there), relations, dependents (time hinges), exactly-like, ranges.
- C2 covers the advanced ones: special-values, hooked-joins.
- The orchestrator rebuilds the pack with `node scripts/checkpoint-pack.mjs` right before each. It skips a sitting where [drill-generation.md](../../meta/procedures/drill-generation.md) asks for no top-up.
- **May edit:** the `### Practice` sections of its sittings, and the drill allowlist.

Order: U3a, U3b, U5, C1, C2, the cheat-sheet rewrite, the final gate.

**Commits:** U3a, U3b, U5, C1, C2, the cheat-sheet output, and the consolidated proposal: about seven.

### Rule digest (copied into every brief)

- The language is **Ageben**. Grammar pages show only the current language.
- **Phase-start sha:** `<sha>`. The `verify` baseline was saved there.
- **Parser and grammar:** a change to what the parser accepts or how it reads a form lands with the grammar edit that teaches it, and with an interpreter classification row for each new construction id (`npm run class-row -- KEY`).
- **The entry:** remove or narrow the cell's entry in `docs/meta/unassigned-reserved.md` in the same unit. What stays open keeps a reason that is a cost or a real guess conflict, never another route.
- **Tests:** change a test only where it expects the rejection this unit lifts. Turn such a case into one that stays rejected, or into a valid parse. Run tests with `npm test` (`npm test -- FILE`), never a bare `tsx --test` or `npx vitest`.
- **Code:** run `.ts` with `npx --no-install tsx`. Keep files under 1,500 lines; measure with `npm run deps`, move with `npm run move-decl`. Never run `prettier`. After a grammar-rule change, `npm run grammar-check` passes.
- **Ageben:** check forms with `node scripts/parse.mjs --check-lexicon '<a>' '<b>' …` in one batched call, with `--at <page>#<id>` for a stage page. Use `--llm-prompt` only to work out what a sentence means. Search examples with `node scripts/find.mjs`, never grep. Batch probes in one `reading.mjs probe` file.
- **Grammar prose:** follow the [checklist](../../meta/doc-style.md#checklist). No forward links on stage pages. Never link to a file under `docs/proposals/`. Find links into a page with `npm run page-refs`. Never edit text between `<!-- generated -->` markers; the orchestrator regenerates cheat sheets.
- **Reading:** list headings first, then read only the line ranges you need. When a result says *Output too large*, grep or slice the saved file.
- **Scratch files** go in `tmp/scratch/`. Write a script that edits files with the Write tool and run it; a hook blocks heredoc and inline edit scripts.
- **Verify:** end with `npm run verify -- --allow-generate`. When it reports a new error, read only that line of `tmp/logs/verify-last.log`.
- **Never commit**, and never edit `AGENTS.md` or `.claude/`. Report the change as exact old and new text.
- **Stop and report**, without working around it, when a premise no longer holds, later units would need a different design or order, or skipping would leave a broken state. Stop the same way when a needed file is outside the brief's list.
- **Decisions:** settle none the brief does not hand you. Write it up with a **Recommendation:** and a confidence, and skip the item.
- At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
- **Report**, about 150 words, in fixed fields:
  - done, in one line
  - forms, glosses and construction ids added
  - `AGENTS.md` lines to change
  - the `verify` line
  - skips, with reasons
  - decision write-ups
  - **left:**
  - **inefficient:**

### Commits

Each commit message starts with `open-cell-readings.md` and the unit ID, then `[skip-cd]`, then the co-author line. A decision commit is named *`open-cell-readings.md`: decide <topic> (agent, <confidence>)*. Only the orchestrator commits, staging only the unit's files. The expected totals are under each phase.

## Decisions
<a id="decisions"></a>

Settled by the user, 2026-11-25. Each reading is written into the design section named.

- **D1** `yel` + a citation: one reading, *is it this word?*, a guess after a fill-ask and an echo elsewhere ([§ 2](#2-a-citation-after-a-question-word)).
- **D2** `yul` + a citation: *not X!*, ruling out a candidate after a fill-ask and a ban elsewhere ([§ 2](#2-a-citation-after-a-question-word)). `yol azozon.` stays open (Non-goals).
- **D3** A call + a citation: a citation reply addressed to that person ([§ 2](#2-a-citation-after-a-question-word)).
- **D4** `wewem` *about as … as* at beginner in relations.md, `wewel` *exactly as … as* at intermediate in exactly-like.md; both in exactly-like.md if the forward-link lint requires it ([§ 3](#3-as-big-as-a-house-wewem--b)).
- **D5** All three time hooks: `ue` *throughout*, `am` *in the thick of*, `oem` *in the run-up to* ([§ 4](#4-time-bounds-throughout-in-the-thick-of-in-the-run-up-to)).
- **D6** A range on the landmark's `/ɡ/` label, through a reader fix; *a range of named landmarks* stays open ([§ 5](#5-a-range-of-labelled-landmarks-d6)).
- **D7** `thohel` stays open on the guess conflict alone, with the reworded lead and entry; the *if* door cue is fixed and `erol` gains a Compare-with to `thebem` ([§ 6](#6-hinge--l-thohel-stays-open-herol-only-while-d7-d8)).
- **D8** `herol` + a `bl-` word or `blarl`: *only while* / *as long as* ([§ 6](#6-hinge--l-thohel-stays-open-herol-only-while-d7-d8)).

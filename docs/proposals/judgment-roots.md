# Judgment roots

**Status:** Phase 1 (lexicon) done 2026-11-11: commits A, B, regloss, C1, C2, D, E. Its results live in the lexicon CSVs, [D-75](../meta/design-decisions.md), [lexicon.md](../meta/procedures/lexicon.md), [Lie, ignore, mock, exploit, crime](../grammar/say-reasons.md#accusation-words) and [What someone else knew or meant](../grammar/purpose.md#what-they-knew-or-meant). Phase 2 (expectation words) is ready to implement; Decisions 5–7 settled by the user on 2026-11-11, each taking the recommended option.

**Related:** [lexicon-overlays.csv](../../data/lexicon-overlays.csv), [dependents.md](../grammar/beginner/dependents.md), [already-still-yet.md](../grammar/beginner/already-still-yet.md), [because-and-iff.md](../grammar/intermediate/because-and-iff.md), [contrary-to.md](../grammar/intermediate/contrary-to.md), [residue-and-former.md](../grammar/intermediate/residue-and-former.md), [universality.md](../grammar/advanced/universality.md), [design-decisions.md](../meta/design-decisions.md) (D-46, D-64), [unassigned-reserved.md](../meta/unassigned-reserved.md), [`src/parse/enforce.ts`](../../src/parse/enforce.ts), [`src/parse/constructions.ts`](../../src/parse/constructions.ts), [`src/parse/invalid-forms.test.ts`](../../src/parse/invalid-forms.test.ts).

**Depends on:** none.

**Design authority:** ALTHOUGH moves from `/h/` to `/th/` (`thezem`), and `/h/` `hezem` is reread as *whereas* (Decision 5); NOT YET moves from `/h/` to `/th/` (`thelom`, `thelol`, `thelor`), and `/h/` `helo-` is retired (Decision 6); a teaching note on RESIDUE after a harm (Decision 7); a new design decision D-76. Root spellings don't change; only the role letter does.

## Problem

`/th/` holds what is in a mind. Two closed `/h/` words hold an expectation. MIRATIVE (*against what I expected*) is already `/th/`. But *although* (`hezem`: P would normally have stopped Q) and *not yet* (`helom`: "the change is expected but has not come") are on `/h/`, as if the expectation were part of what happened. So they can't take a holder or MAY. *I failed although I studied* states a theory about effort as a fact about the event. `helol` (*not yet, but it will*) is a forecast, though [intention.md](../grammar/beginner/intention.md#L7) says a forecast always says what it rests on.

## Goals

- A word whose meaning includes an expectation is `/th/`, so the expectation reads as the speaker's and can take a holder or MAY.

## Non-goals

- **The `/h/` vs `/th/` letter of TRY, RESIDUE and FORMER.** Settled by D-46. Only a teaching note on RESIDUE is added.
- **ALREADY, STILL, NO LONGER.** Each can be watched, so they stay on `/h/`. Their **-l** / **-r** endings carry small forecasts (*for good*, *about to end*); left as they are.

## Design {#expectation-words}

**The rule.** A word whose meaning includes an expectation is `/th/`. An expectation is in a mind; on `/h/` it reads as part of what happened, and it can't take a holder or MAY. MIRATIVE already follows this rule. Purpose moved from `/h/` to `/th/` the same way ([D-64](../meta/design-decisions.md), parser `retiredPurposeHinge`), and that change is the model here.

**ALTHOUGH → `thezem`.** The two clauses already state P and Q; the hinge adds only that P would normally have stopped Q.

- `thezem blarl` + the clause is *although*; `thezem` + a `bl-` noun is *despite*.
- *Even if* stays a two-hinge stack, `thezem thohem blarl`. [`enforce.ts`](../../src/parse/enforce.ts) allows the stack by overlay gloss (`although if`), not by letter, so the check carries over.
- On `/th/` it takes a holder the way PLAN does, through a channel before it. That gives *although, as Alazun saw it*, where the expectation that was overturned is Alazun's. Unit 2A confirms the stack parses before any page teaches it, and logs it under Open decisions if it doesn't.
- `gezem` (the hinge attached to a noun) stays on `/ɡ/`, read as the speaker's expectation, just as `govam` is the speaker's aim (D-64).
- [contrary-to.md](../grammar/intermediate/contrary-to.md) and [`constructions.ts`](../../src/parse/constructions.ts) (`hookStandIn`) say *contrary to an event is `hezem blarl`*. That becomes `thezem blarl`. The split stays: `uom` goes against a stance, the hinge against an event.
- `/h/` `hezem blarl` becomes *whereas*: two facts set side by side, with no expectation ([Decision 5](#d5-whereas)). `hezem` + a `bl-` noun has no reading, since *despite* is `/th/` only.

**NOT YET → `thelom`, `thelol`, `thelor`.** Of the four already / still / not-yet / no-longer words, it is the only one whose basic meaning is an expectation. *Still* and *no longer* can be watched; *not yet* waits on something.

- Its endings become how firmly you expect the change: **-l** *but it will*, **-m** expected, **-r** *may never come*. A forecast on `/th/` can take MAY, a channel or a holder like any other stance.
- `/w/` `welom` stays. `/w/` serves both letters ([universality.md](../grammar/advanced/universality.md)).
- `/h/` `helo-` is retired with a parser rejection, and a closed row goes in unassigned-reserved.md.
- already-still-yet.md teaches the four words as one family; the page now says why one of them sits on `/th/`.
- `th` + `el` collides with no `/th/` overlay (the `/th/` overlays begin `ev`, `ey`, `em`, `eb`, `eh`, `en`, `ew`, `om`, `ag`, `al`, `og`, `ah`, `ov`, `un`, `uw`, `ur` …); Unit 2D confirms it with the parser.

**RESIDUE after a harm (teaching note, letter unchanged).** [Decision 7](#d7-residue). residue-and-former.md gains a **Compare with**:
- After an act that broke a norm, `haram` says only that the outcome is still in effect: the money is still owed, the window still broken.
- That the act *still counts against* the person is fault plus a feeling, and both are yours.

**D-76**, in [design-decisions.md](../meta/design-decisions.md) under *By design*:

> A word whose meaning includes an expectation is `/th/`: MIRATIVE, ALTHOUGH (`thezem`), NOT YET (`thelom`). `/h/` `helo-` and `/h/` `hezem` + a `bl-` noun have no reading (Parser: retired-form rejections like `retiredPurposeHinge`); `/h/` `hezem blarl` is *whereas*, a contrast with no expectation. | An expectation is in a mind. On `/h/` it reads as part of what happened and can't take a holder or MAY, and a *not yet* ending would be a forecast with no grounds. Purpose moved the same way (D-64). ALREADY, STILL and NO LONGER stay `/h/`: each can be watched. `gezem` on a noun stays `/ɡ/`, the speaker's expectation, as `govam` is the speaker's aim. | dependents.md, already-still-yet.md

## Implementation plan

Orchestrated per [proposals.md](../meta/procedures/proposals.md), with subagents, in one phase. If the user says to stop partway, the orchestrator [consolidates this proposal](../meta/procedures/proposals.md#consolidate) before the session ends. The orchestrator saves `npm run verify -- --baseline` before Unit 2A. Line numbers in the unit table were taken before Phase 1, which added rows to `say-reasons.md`, `english.md` and `say-people-places.md`; units locate their targets by grep, not by line.

**Parser changes ship with grammar changes** (AGENTS.md), so 2A, 2B and 2C land in one commit, and 2D carries its own pages. Between 2A and 2C, `verify` is expected to show new errors on the pages still being fixed; 2A's report lists them, and that list is the worklist for 2B and 2C.

| Unit | Items | Agent | `model` / `effort` | May edit |
|------|-------|-------|--------------------|----------|
| **2A** | ALTHOUGH data and parser. In `lexicon-overlays.csv`, add the `/th/` `ezem` row (gloss `although`, so the `although if` stack still matches); reread the `/h/` row as *whereas* (gloss `whereas`, definition *WHEREAS clause hinge (contrast; no expectation)*); keep the `/ɡ/` row. Add a retired-form rejection, modeled on `retiredPurposeHinge`, for `hezem` + a `bl-` noun. Update the `constructions.ts` summaries that name `hezem`, and update `invalid-forms.test.ts` (`thezem blarl` becomes valid; fix the `valid:` sides; add the rejection). Add D-76 and a closed row in unassigned-reserved.md, citing it, for `hezem` + a `bl-` noun. Check with the parser that `thezem thohem blarl`, `thezem` + `bl-` noun, and a channel-plus-holder before `thezem` parse. `npm test`, then `verify`; report the new doc errors by file without fixing them. | `proposal-worker` | `opus` / `high` | `lexicon-overlays.csv`, `src/parse/enforce.ts`, `src/parse/constructions.ts`, `src/parse/invalid-forms.test.ts`, the parser's rejection table, `design-decisions.md`, `unassigned-reserved.md` |
| **2B** | ALTHOUGH stage pages: `dependents.md` (the letter sentence at line 59, the hinge table, the *despite* paragraph, Practice), `because-and-iff.md` (*even if*, Practice), `more-hinges.md`, `contrary-to.md`. Teach the `/th/` reading as an expectation you hold; add the holder example only if 2A confirmed it parses. | `proposal-worker` | `opus` / `high` | those four pages |
| **2C** | ALTHOUGH recipe, index and editor pages: `say-reasons.md` rows 15–34, `say-questions.md` line 121, `english.md` rows 123–124, `terminology.md` line 249, the hand rows in `cheat-sheets/linking-clauses.md` and `cheat-sheets/why-allowed.md`, and `docs/meta/procedures/drill-generation.md`. The *whereas* rows point to `/h/` `hezem blarl` (Decision 5). | `proposal-worker` | `opus` / `medium` | those pages |
| **blocks** | Orchestrator commits 2A–2C together, then runs `npm run cheat-sheet-blocks -- --write` and commits that alone. | orchestrator | n/a | generated blocks only |
| **2D** | NOT YET, whole: the `/h/` `elo-` overlay rows become `/th/` (keep `/w/`), a retired-form rejection for `/h/`, tests, the NOT YET clause of D-76, a closed row in unassigned-reserved.md; `already-still-yet.md` (table, the family framing, endings as expectation, Practice); `universality.md` if its list needs it; the `knowing-intending.md` cheat-sheet hand rows, including the stale line 165 that calls PLAN and DECISION `/h/` words; `drill-generation.md`. Then the orchestrator commits, and runs and commits `cheat-sheet-blocks -- --write` on its own. | `proposal-worker` | `opus` / `high` | those files, plus the parser files 2A touched |
| **2E** | Decision 7: the RESIDUE **Compare with** on `residue-and-former.md`. | `proposal-worker` | `opus` / `medium` | `residue-and-former.md` |

**Gates.** `npm run verify -- --allow-generate` after each unit, against the Phase 2 baseline (2A and 2B carry the expected page errors forward). Final gate: a clean `npm run build` and `npm test`.

**Commits**, each `judgment-roots <unit>: … [skip-cd]` plus the co-author line: 2A–2C, blocks, 2D, blocks, 2E. Five.

### Rule digest (paste into every brief)

```
Proposal: judgment-roots, Phase 2 (expectation words).
Rule: a word whose meaning includes an expectation is /th/ (MIRATIVE, ALTHOUGH, NOT YET).
ALREADY, STILL, NO LONGER, RESIDUE, FORMER stay /h/ (D-46). /w/ forms serve both letters; keep them.
Model for the letter move and its parser rejection: D-64 (purpose, retiredPurposeHinge).
Parser changes ship with the grammar edit that teaches them; never one without the other.
Generated cheat-sheet blocks: never by hand; the orchestrator runs cheat-sheet-blocks.
Someone else's mind: holder seam on a channel (holder.md), or MAY.
No root spelling changes. Never hand-spell a root; never bulk-replace.
Stage pages never link to say-*.md. Never link to docs/proposals/.
Present the current language only: no "formerly", no old glosses.
Check every Ageben form with: node scripts/parse.mjs --llm-prompt '<sentence>'
Grammar decisions are the user's: log under Open decisions, skip the item, carry on.
Lexicon choices (which root or sense to use): decide, and list them in the report.
Stop and report (do not work around) if: a premise no longer holds; later units would need a
different design; skipping would leave a broken state; too many skips to meet the goals.
Read headings first (grep -n '^#'), then only the ranges you edit.
Scripted edits go in a file under tmp/, never inline.
Verify with: npm run verify -- --allow-generate (--fast inside an item). Read only new error lines.
At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls.
If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a
clean point, leave the tree green, and report: done, left (as steps), files touched.
Report fields: done; files touched (count); registry edits; AGENTS.md lines to change; verify line;
skips with reasons; left; inefficient.
```

## Decisions

All settled by the user on 2026-11-11, each taking the recommended option. Options not taken are in the git history of this file.

### 5. `/h/` `hezem` is *whereas* {#d5-whereas}

`/h/` `hezem blarl` is *whereas*: two facts set side by side, with no expectation. ALTHOUGH is `thezem`. *Despite* + a `bl-` noun is `/th/` only, so `hezem` + a `bl-` noun has no reading. A neutral contrast beside the one that carries an expectation means neither reads as the correct default; it mirrors SO-THAT (`/th/`) beside SO-THAT-RESULT (`/h/`).

### 6. NOT YET moves to `/th/` {#d6-not-yet}

`thelom` / `thelol` / `thelor`; `/h/` `helo-` is retired; `/w/` `welom` stays. On `/th/`, the growth-mindset *yet* can take MAY or a holder.

### 7. A RESIDUE note after a harm {#d7-residue}

residue-and-former.md gains a **Compare with**: residue is the outcome still in effect; *it still counts against them* is fault plus a feeling. Unit 2E writes it.

## Open decisions

Agents log new ones here during the run, per [proposals.md](../meta/procedures/proposals.md#what-a-proposal-is). These came out of Phase 1 and don't block Phase 2.

- **Contempt has no build (Unit D, *mock*).** The *mock* row was to pair ridicule with contempt through a holder, but no page builds *contempt* (`find-english` on *contempt*, *scorn*: no entry; the [emotion lookup](../grammar/say-reasons.md#emotion-lookup) has no row). The row ships as ridicule plus the holder's aim to hurt (`zalazun theyomazozon thagom genemum.`). Options: (a) leave it so; (b) add a *contempt* row to the emotion lookup (a typical build, e.g. relatedness unmet, aimed at someone, pushing away), then add it to the *mock* row with a holder; (c) treat contempt as a comparison (the holder ranks the person below a bar). **Recommendation:** (b), since *contempt* is a common emotion word learners will look up, and the lookup is where its build belongs.
- **Dead *liar* → *lie* doer entry (Unit B).** `IRREGULAR_DOERS` in [`src/english-helper/tag.ts`](../../src/english-helper/tag.ts) maps *liar* to *lie*, which no root has any more, and the English helper returns nothing for *lie* / *liar*. Options: (a) leave it; (b) map *liar* → *misstate* and add *lie* routing to the [accusation-words](../grammar/say-reasons.md#accusation-words) recipe; (c) delete the entry. **Recommendation:** (b), so a learner typing *lie* lands on the recipe that says how to split it.
- **`uzuyu` 🦹 size cell (Unit B).** Its `size` column is `none`, though *outlaw* is a being (`big`). Changing it respells the root ([root tails](../meta/procedures/lexicon.md#root-tails)). **Recommendation:** leave it unless a root-tail audit takes it up; the spelling is in use across pages.

# Parser structure: context passes, slot rules, tree building, and what they say about the grammar

**Status:** IN PROGRESS, 2026-11-25. Phases 1 to 3 done (`a2ea44e7` to `835d90ec`; `8710f3b3` to `7e596408`; `980abfee` to `785ed838`). Phase 4 is next. No decision is open.

Where the results live:
- **Why the passes stay:** [parser-pipeline.md § why the remaining passes stay](../../meta/parser-pipeline.md#why-passes-stay).
- **Reshaping that stays:** [§ reshaping that stays](../../meta/parser-pipeline.md#reshaping-stays) (D12, D13). `HSharedV` is gone (D14, S3): the plain SHARED `/h/` after a verb list fills the join's `shared` through `joinAdverb` in `verb-items.ts`, and `construction-trace.ts` (`joinAdverbUnits`) traces it under its old ids.
- **The slot table:** `data/word-slots.csv`, [§ word slots](../../meta/parser-pipeline.md#word-slots). Every closed cell has its entry in [unassigned-reserved.md](../../meta/unassigned-reserved.md) (D8, D9, D11). `-ln` is open on `/x/` (topic) and `/y/` (call), taught in `proper-names.md#name-instance--ln` (D10).
- **The listener's list strategy:** [joins.md § right-close](../../grammar/beginner/joins.md#right-close), plus the bar sentence in [bars.md § bars](../../grammar/intermediate/bars.md#bars).
- **Left fences:** in [design-decisions.md](../../meta/design-decisions.md).

Decided, for phase 4:
- 2026-11-24 (user): one shared grade for the stance endings.
- 2026-11-25 (user), stance endings:
  - D3: keep the name *settled-to-passing*; the field values are `settled` / `default` / `passing`, and every kind keeps its own gloss.
  - D4: teach the scale on `knowing.md#follow-up-endings-may`.
  - D5: DECISION `-m` keeps its meaning *modifiable*, a claim that the decision can still change. `ogem` gets no grade; `ogel` / `oger` are graded.
  - D6: PLAN is graded (`agol` settled, `agom` default, `agor` passing).
  - D7: MAY and NOTIONAL are graded (`omal` / `eyul` settled, `-m` default, `-r` passing).

**Related:**
- [parser-pipeline.md](../../meta/parser-pipeline.md), [unassigned-reserved.md](../../meta/unassigned-reserved.md), [design-decisions.md](../../meta/design-decisions.md), [interpreter.md § classification table](../../meta/interpreter.md#classification-table).
- Code: [`word-slots.ts`](../../../src/parse/word-slots.ts), [`mark-context.ts`](../../../src/parse/mark-context.ts), [`tokens.ts`](../../../src/parse/tokens.ts), [`grammar/`](../../../src/parse/grammar/), [`verb-items.ts`](../../../src/parse/verb-items.ts), [`constructions.ts`](../../../src/parse/constructions.ts) (`REJECTIONS`).
- Data: [`lexicon-overlays.csv`](../../../data/lexicon-overlays.csv), [`src/flashcards-endings.ts`](../../../src/flashcards-endings.ts) (`SCALE_ANCHOR`).

**Depends on:** none. Phase 4's prose unit edits `knowing.md`, `sakes.md` and the stance pages. If `grammar-newcomer-rewrite.md` is rewriting any of them when phase 4 starts, land phase 4 first or rebase its edits onto the rewrite.

**Design authority:** phase 4 changes only the stance-ending readings D3 to D7 settled. No gloss changes.

## Implementation plan

One phase remains, run through subagents. At its end, and if the user says to stop partway, the orchestrator [consolidates the proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

**Gates.**
- At the start of the phase, the orchestrator does four things:
  - saves `npm run verify -- --baseline` and `npm run context-report -- --save`
  - saves the construction counts with `node scripts/find.mjs --constructions --all > tmp/state/parser-structure-constructions.txt`
  - notes the phase-start commit
  - writes the rule digest below, with that sha, to the scratchpad
- Each unit ends with `npm run verify -- --allow-generate` and passes before its commit.
- **A parse-neutral unit** (P1) also shows three things:
  - 0 differences in `npm run parse-snapshot -- --ref <phase-start sha> --drop-one --swap`
  - a passing `npm run grammar-check`
  - an unchanged construction-count file
- **The final gate** is a full `npm run verify` against an empty baseline at the end of phase 4.
- No unit edits `say-*.md`, `english.md` or `src/english-helper/`, so there is no recall gate.

**Style.** Writers of grammar prose self-check against the [checklist](../../meta/doc-style.md#checklist).
- **While `grammar-newcomer-rewrite.md` is unfinished:** no `style-editor` unit runs unless a unit creates a new page.
- **Once it is done:** the last phase that edits grammar prose ends with a `style-editor` unit over `npm run changed-sections -- 13d7b221`. It runs only if the run's grammar edits add a section or come to more than a few sentences on a page.

### Phase 4: stance grade

Written from G1's audit. D3 to D7 are settled; see Status.

**Background for both units.** `sakes.md#settled-to-passing` already teaches the `-l` / `-m` / `-r` order as the **settled-to-passing scale**. It has a `terminology.md` entry and a consonants cheat-sheet row, and 11 references point to the anchor, one of them `SCALE_ANCHOR` in `src/flashcards-endings.ts`.
- PLAN, NOTIONAL, DECISION, NOT-YET, `/h/` ALREADY / STILL, the polar stances, the linkers and the feelings already say they use it.
- The evidentials (*evidence strength*), MIRATIVE, WANT and MAY on `knowing.md` do not point to it.
- `knowing.md` (12th in the reading order) and `already-still-yet.md` (16th) come before `sakes.md` (19th).

The graded endings:

| Kind | `-l` / `-m` / `-r` |
|---|---|
| evidential | strong / base / weak |
| MIRATIVE | firm / base / mild |
| phasal | sure / base / maybe-never |
| WANT | lasting / unstated / passing |
| DECISION | irreversible / modifiable / temporary |
| plan | atlas / itinerary / sketch |
| MAY | find-out / default / who-knows |
| NOTIONAL | rehearse / default / suppose |

**P1. Grade field (code).**
Agent `proposal-worker`, `model: opus`, effort `high`.
- Give each `/th/` overlay reading a `grade` set from its ending: `settled` (`-l`), `default` (`-m`), `passing` (`-r`). Each kind's gloss stays the same.
- Derive the field in code from the ending. A new column in `lexicon-overlays.csv` would change a data format, and that needs the user.
- Every kind in the table is graded, PLAN, MAY and NOTIONAL included, with two exceptions that get no grade: `ogem` (DECISION *modifiable*, a claim rather than the default) and `ahul` / `ahur` (BECAUSE fault / share). `ogel` / `oger` are graded.
- The sake rows list only `-m`, and `/h/` ALREADY / STILL are not `/th/` overlays, so the field doesn't reach them. Report how the field could cover them; don't widen it.
- The brief names the files P1 may edit, from a grep for where overlay readings are built.

**P2. Teach the scale once (prose).**
Agent `proposal-worker`, `model: opus`, effort `high`. Briefed from P1's result, with glosses checked with `parse.mjs`.
- Move the teaching to `knowing.md#follow-up-endings-may`, the first graded ending in the reading order. It follows Claritish, where `could-be.md` already teaches the scale on MAY.
- Keep a `settled-to-passing` anchor, and retarget its references with `npm run page-refs` and `retarget-id`: `sakes.md`, `terminology.md`, the consonants cheat sheet, the 7 linking pages and `SCALE_ANCHOR`.
- Point the evidentials, MIRATIVE, WANT and MAY to the scale. Each kind keeps its own gloss, and *evidence strength* stays the channels' reading of the grade.
- Lead with each kind's own gloss and give the scale second, so that the cue *lasting* doesn't replace it. On MAY and NOTIONAL, `-l` is settled because the thought leads somewhere lasting (an answer, an act), not because the guess is held firmly; `could-be.md` puts it as "the question will be settled". On PLAN, the atlas stays *fully prepared*, and the prompt to ask what could go wrong stays as it is.
- DECISION (`want-and-decide.md#endings-changeability`): `-l` irreversible and `-r` temporary are the scale's ends. `-m` keeps *modifiable* as a claim that the decision can still change, and is not the scale's default. Reword the sentence that says `-m` "claims nothing either way" so the page matches its table. The when-unsure advice can stay, with a reason that fits the claim (until you know a choice is final, it can still change).
- Before reshaping a section, read its read-by block.

**Then the style unit**, only if the style rule above calls for it: `style-editor`, `opus`, `high`.

**Final gate**, then consolidate. The grammar and meta pages then own the result, so the proposal leaves the folder per [folder and links](../../meta/procedures/proposals.md#folder-and-links).

Expected commits: one per unit, plus one closing commit.

### Rule digest (copied into every brief)

- The language is **Ageben**. Grammar pages show only the current language.
- **Phase-start sha:** `<sha>`. The baselines saved there: `verify`, `context-report`, and `tmp/state/parser-structure-constructions.txt`.
- **Parse-neutral units:**
  - `npm run parse-snapshot -- --ref <sha> --drop-one --swap` shows 0 differences. Raw parser messages may change.
  - `npm run grammar-check` passes. Turn a new choice into structure or a token mark, never a `GATE`. It includes an LR(1) conflict check; `npm run grammar-check -- --examples 0` runs that alone (about 60 s).
  - Construction ids: compare `node scripts/find.mjs --constructions --all` with the saved file. Rename an id only one for one, keeping its count, and change its `constructions.ts` entry and its interpreter rows in the same unit (`npm run class-row -- KEY`).
  - `npm run context-report -- --diff` lists only the retype rows the unit removes.
- **Tests:** change a test only where it names a removed token type or a moved function, never an expected parse, gloss, reading or rejection. Run tests with `npm test` (`npm test -- FILE` for one file), never a bare `tsx --test` or `npx vitest`.
- **Parser and grammar:** a change to what the parser accepts or how it reads a form lands with the grammar edit that teaches it.
- **Data reaching the parser:** the parser also runs in the browser and never reads `data/` itself. Tables come in as CSV text through `createClassifyTables(published, overlay, compound, wordSlots)`. Node fills it with `readData` in `src/parse/index.ts` (`loadDefaultTables()`), the browser with `?raw` in `useClassifyTables.ts`, and the agent bundle through `scripts/lib/agent-bundle.ts`.
- **Code:** run `.ts` with `npx --no-install tsx`. Measure with `npm run deps` and move code with `npm run move-decl`. Keep files under 1,500 lines. Never run `prettier`; the repo does not use it.
- **Ageben:** check forms with `node scripts/parse.mjs --check-lexicon '<a>' '<b>' …` (one batched call; `--at <page>#<id>` on a stage page). Use `--llm-prompt` only to work out what a sentence means. Search examples with `node scripts/find.mjs`, never grep.
- **Grammar prose:** follow the [checklist](../../meta/doc-style.md#checklist). Find links into a page with `npm run page-refs`. Never link to a file under `docs/proposals/`.
- **Reading:** list headings first, then read only the line ranges you need. When a result says *Output too large*, grep or slice the saved file.
- **Scratch files** go in `tmp/scratch/`. Write a script that edits files with the Write tool and run it; a hook blocks heredoc and inline edit scripts.
- **Verify:** end with `npm run verify -- --allow-generate`. When it reports a new error, read only that line of `tmp/logs/verify-last.log`.
- **Never commit**, and never edit `AGENTS.md` or `.claude/`. Report the change as exact old and new text.
- **Stop and report**, without working around it, when a premise no longer holds, later units would need a different design or order, skipping would leave a broken state, or the unit's stop condition is met. Stop the same way when a needed file is outside the brief's list.
- **Decisions:** settle none the brief does not hand you. Write it up and skip the item.
- At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
- **Report**, about 150 words, in fixed fields:
  - done, in one line
  - measurements
  - renamed construction ids
  - `AGENTS.md` Owns or Data lines
  - the `verify` line
  - skips, with reasons
  - **left:**
  - **inefficient:**

### Commits

Each commit message starts with `parser-structure.md` and the unit ID, then `[skip-cd]`, then the co-author line. Only the orchestrator commits, staging only the unit's files. Phase totals are under each phase.

## Open decisions

None. The user settled D3 to D7 on 2026-11-25; see Status.

## Background

### Problem

Most of the parser's logic sits around the Chevrotain grammar rather than in it:
- `markContext` retypes words from their neighbors in named passes (`CONTEXT_PASSES`), and the `/w/` target types alone are about 100 token types.
- `sentence-build.ts` reshapes the finished tree.
- `enforce` holds 133 rejection ids, among them about 15 rules on which role letters take a word feature, each hand-coded.
- Each stance overlay kind spells its `-l` / `-m` / `-r` meanings on its own.

An editor can't see which of these are parser plumbing and which stand for a grammar rule that could be simpler. A learner meets the same rules as scattered exceptions.

### Goals

1. Every retype decided by the word before or the word after becomes grammar structure, with no parse changed. Narrowed by D2 (A): every retype that one word of lookahead can state.
2. Lists are recognized the way a listener recognizes them: a second same-role noun or verb opens a list (no apposition), and the join says how the items combine.
3. Which letters take which word feature is one data table that `enforce` reads.
4. The tree is built by the grammar; what still needs reshaping afterwards is named as a surface ambiguity, for a decision.
5. `enforce` is split by what each check needs (done).
6. The grammar states why joins close on the right, and teaches how a listener finds a list.
7. Audits turn slot gaps, leftover reshaping, and the stance endings into decisions for the user.

### Non-goals

- No phrase builder in place of Chevrotain.
- No change to where joins sit, no left-bound negation, no marker for bars.
- No cheat sheet page for the slot table: a new sidebar page is a separate decision.
- No change to `scope.ts`, `carry.ts` or `src/interpret/` beyond import paths.

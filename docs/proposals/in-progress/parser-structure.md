# Parser structure: context passes, slot rules, tree building, and what they say about the grammar

**Status:** IN PROGRESS, 2026-11-25. Phase 1 done (`a2ea44e7` to `835d90ec`). Phase 2 is next. U6, U7, U9 and G1 may start now; U8 waits on D2, which is blocking. Phase 1 results:
- `VCont` and the stand-in `…Lone` types are now grammar structure.
- `HostedBJoined` is decided at the second `bl-` word.
- `enforce` is split by need.
- The `/w/`, `gl-`, verb-list end and hosted retypes stay as passes for now (D2).
- Parser construction went from 210 ms to 201 ms (median), and token types from 200 to 194.

Decided 2026-11-24 (user, all as recommended):

- no phrase builder in place of the retype passes
- fold the `/w/` and `gl-` retypes into grammar structure first, and fold class A only if the measurements allow it. Phase 1 tried both; see D2 for what is left.
- keep bars as they are
- keep joins closing on the right, and record why
- state in [joins.md](../../grammar/beginner/joins.md#right-close) how a listener uses *no apposition*
- add no left-bound *not* and no bar marker
- one slot table as data
- build the tree in the grammar where it can
- one shared grade for the stance endings, in phase 4
- split `enforce` by what each check needs (done in phase 1)

**Related:** [parser-pipeline.md](../../meta/parser-pipeline.md); [read-ageben.md § one tree per sentence](../../meta/procedures/read-ageben.md#grammar-check); [joins.md § right-close](../../grammar/beginner/joins.md#right-close); [bars.md § bars](../../grammar/intermediate/bars.md#bars); [design-decisions.md](../../meta/design-decisions.md); [unassigned-reserved.md](../../meta/unassigned-reserved.md); [interpreter.md § classification table](../../meta/interpreter.md#classification-table); [`mark-context.ts`](../../../src/parse/mark-context.ts) (`CONTEXT_PASSES`), [`tokens.ts`](../../../src/parse/tokens.ts), [`grammar/`](../../../src/parse/grammar/), [`sentence-build.ts`](../../../src/parse/sentence-build.ts), [`enforce.ts`](../../../src/parse/enforce.ts) and its `enforce-*.ts` parts, [`constructions.ts`](../../../src/parse/constructions.ts) (`REJECTIONS`), [`context-report.ts`](../../../src/parse/context-report.ts), [`lexicon-overlays.csv`](../../../data/lexicon-overlays.csv).

**Depends on:** none. `scope-model.md` is fully implemented, so no phase here waits on it, and phases 3 and 4 may run whenever their decisions are settled. **Order:** land U6's edits to joins.md and bars.md before `grammar-newcomer-rewrite.md` rewrites those pages.

**Design authority:**
- *None* for phase 2: it restructures code and adds teaching sentences and an editor note about rules the grammar already has.
- Phase 3 changes only the forms and readings the user accepts from U9's decisions.
- Phase 4 changes only the stance-ending readings the user accepts from G1's decisions.

## Findings

**Where lists settle.** These findings come from `npm run context-report`, over 6,032 distinct grammar examples.
- Every verb list settles at the **second verb**, as no apposition predicts. Noun lists need no retype at all.
- Every other wait for a join has one of two reasons:
  - The list has only one item: bars 83, a single negated `/ɡ/` or `/th/` 45, hosted lists and item hooks 18. A list of one has no second item to show it.
  - The items are modifiers, which stack without a join, so a second adjective doesn't signal a list: 8.

**Joins close on the right** because the join's meaning depends on how many items came before it (*nobody*, *just X*, a list; a superlative or a comparison). A join at the end is read once, after the count is known. The earlier left fences made it hard to know where a list ended, and so what the count meant. That still holds for modifiers, which stack; for verb lists with words between the verbs; and for lists of none or one. For noun lists, no apposition already shows where a list starts, but the count argument alone still favors the end. The measured cost is lists of one, not long lists. A left-bound *not* or bar marker would remove a wait of one to three words, and no existing form says the same thing: `/w/` restrictors count occasions (*never sleepy*), and `uom` + stance means *contrary to*.

**Slot rules.** The `*Slot` rejections each hard-code a letter set, and the sets are irregular:

| Feature | Allowed on |
|---|---|
| sake | `/ɡ/` `/th/` `/w/` |
| label reach | `/ɡ/` `/z/` `/d/` `/b/` `/v/` `/h/` |
| hook prefix | `/ɡ/` `/z/` `/d/` `/b/` `/h/` |
| hooked join | `/z/` `/d/` `/b/` `/h/` |
| ability | `/v/` `/ɡ/` |

**Reshaping after the parse.** `disambiguateClause` turns a lone noun's adjective list into the predicate and closes the predicate at a trailing `/ɡ/` fence, except after a name (`ohun galuden`).

**Stance endings.** The `/th/` overlays' `-l` / `-m` / `-r` nearly share one scale:

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

## Implementation plan

Three phases remain, run through subagents. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates the proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

**Gates.**
- At the start of each phase the orchestrator saves `npm run verify -- --baseline`, `npm run context-report -- --save`, and the construction counts (`node scripts/find.mjs --constructions --all > tmp/state/parser-structure-constructions.txt`), and notes the phase-start commit.
- Each unit ends with `npm run verify -- --allow-generate` and passes before its commit.
- **Parse-neutral units** (U7 and U8) also show:
  - 0 differences in `npm run parse-snapshot -- --ref <phase-start sha> --drop-one --swap`. Raw parser messages may change; the tool counts them but does not fail on them.
  - a passing `npm run grammar-check`.
  - an unchanged construction-count file, except for ids renamed one for one with the same count.
- In phase 3, `parse-snapshot` lists only the forms the unit's decision names.
- The final gate is a full `npm run verify` against an empty baseline at the end of phase 4, or of phase 3 when phase 4 is dropped.
- No unit edits `say-*.md`, `english.md` or `src/english-helper/`, so there is no recall gate.

**Style.** Writers of grammar prose self-check against the [checklist](../../meta/doc-style.md#checklist).
- **While `grammar-newcomer-rewrite.md` is unfinished:** no `style-editor` unit runs unless a unit creates a new page. That rewrite gives the existing pages a batch style pass.
- **Once it is done:** the last phase that edits grammar prose ends with a `style-editor` unit over `npm run changed-sections -- 13d7b221`. It runs only if the run's grammar edits add a section or come to more than a few sentences on a page; otherwise the self-checks stand.

### Phase 2: grammar notes, slot table, tree building, audits

**U6. Joins, bars, left fences.**
Agent `proposal-worker`, `model: opus`, effort `medium`.
- **In [joins.md § right-close](../../grammar/beginner/joins.md#right-close):** add the reading strategy. Two nouns of the same role, or two verbs, never sit side by side without a join, so the second one tells you a list has started, and the join then says how the items combine. Adjectives, adverbs and stances stack, so for them only the join shows a list. Add too that a single negated word takes its join right after it.
  - First check the claim with `node scripts/find.mjs --seq 'role=z' 'role=z' --all`, and the same for `d`, `b` and `v`. Every hit must be a list, or a word the page already sets apart (a tag, a hosted `bl-` word). Word the sentence so any such case stays true.
- **In [bars.md § bars](../../grammar/intermediate/bars.md#bars):** one sentence. A stance word right before a rank join is read as the bar once the join arrives.
- **In [design-decisions.md](../../meta/design-decisions.md):** a *Left fences* section under *Rejected alternatives*. Joins once opened their list. The listener then had to find where the list ended to know how many items it had, and the join's meaning depends on that count (*nobody*, *just X*, a list; a superlative or a comparison). At the end, the join is read once, after the count.
- Writers self-check against the [checklist](../../meta/doc-style.md#checklist).

**May edit:** `docs/grammar/beginner/joins.md`, `docs/grammar/intermediate/bars.md`, `docs/meta/design-decisions.md`.

**U7. Slot table.**
Agent `proposal-worker`, `model: opus`, effort `high`.
- Write `data/word-slots.csv`: one row per feature, with columns `feature`, `rejection`, `letters`, `endings`, `note`, `anchor`.
  - It covers the `*Slot` rejections and the ending-on-letter rejections (`pluralOnPos`, `pluralInterjection`, `sakeEnding`, `emotionTail`, `turnSeriesCall`).
  - A condition that doesn't fit the columns goes in `note`, naming the code that still checks it.
- Add a loader, and have `enforce` read the table for those ids. Since phase 1, `enforce.ts` is the entry point. Word-shape checks are in `enforce-word.ts`, tree checks in `enforce-structure.ts`, `ResolveInfo` checks in `enforce-binding.ts`, and the retired checks in `enforce-retired.ts`. The `RETIRED` table there, keyed by rejection id, is a model for a table-driven check.
- Add a test that each row's rejection id is in `REJECTIONS` and its anchor resolves.
- Gates: parse-neutral. Report the `AGENTS.md` Data row.

**May edit:** `data/word-slots.csv`, `src/parse/word-slots.ts`, `src/parse/word-slots.test.ts`, `src/parse/enforce*.ts`, `docs/meta/parser-pipeline.md`.

**U8. Tree built by the grammar (waits on D2).**
Agent `proposal-worker`, `model: opus`, effort `high`.
- Sort each function in `sentence-build.ts` into *mapping* (tree node from tree node) or *reshaping* (moves or retypes material after the parse: `disambiguateClause`, `mergeIslandJoins`, `markPredicateAdj`, and others).
- Move reshaping into productions wherever `grammar-check` stays clean.
  - Phase 1 found that `grammar-check` holds the grammar to LR(1). Any production that must choose before the deciding word arrives conflicts (D2). Reshaping that settles an ambiguity on a later word will likely stay.
  - Test each move with `npm run grammar-check -- --examples 0`, which runs the LR(1) check alone, about 60 s. Model each move faithfully before the run.
- For each one left, state in the report the surface ambiguity it resolves, with one example. U9 reads that list.
- If D2 is settled as option A, also add to [parser-pipeline.md](../../meta/parser-pipeline.md) Stage 3 why each remaining context pass stays: the word it retypes is ambiguous until a later word. Cite the conflict shapes in D2.
- Gates as parse-neutral. Run `npm run deps` before moving code.

**May edit:** `src/parse/tokens.ts`, `src/parse/mark-context.ts`, `src/parse/sentence-grammar.ts`, `src/parse/grammar/*.ts`, `src/parse/sentence-shapes.ts`, `src/parse/sentence-build.ts`, `src/parse/constructions.ts` and `src/parse/construction-trace.ts` (renamed ids only), `src/parse/enforce*.ts`, `src/parse/gloss-structure.ts` and `src/parse/morph-gloss*.ts` (token references only), tests under `src/parse/` (token names only), `docs/meta/interpreter.md` (rows of renamed construction ids only), `docs/meta/parser-pipeline.md`, `src/parse/context-report.ts` (`SETTLES` rows of removed types only).

**U9. Audit: slot gaps and leftover reshaping.**
Agent `proposal-worker`, `model: opus`, effort `high`. A fresh context that made none of U6 to U8.
- **Inputs:** `data/word-slots.csv`, U8's list, design-decisions.md, and the owning sections the rows cite (slices only).
- **For each (feature, letter) cell the table closes:** find a stated cost on the owning page or in design-decisions.md. Cells with one stay closed. For each cell without one, write a decision: open it with a reading, leave it open in unassigned-reserved.md, or close it with a reason.
- **For each leftover reshaping:** write a decision on a simpler rule, or keep the rule.
- **Each write-up** follows [open decisions](../../meta/procedures/proposals.md#open-decisions): the problem, the options (always including *keep as is*), the pages and example count affected, the effect on the learner, the decision class, and a **Recommendation:** with confidence.
- Check examples with one batched `node scripts/reading.mjs probe` file.
- Group the decisions that would land together.

**May edit:** this proposal, under *Open decisions* only.

**G1. Audit: stance endings.**
Agent `proposal-worker`, `model: opus`, effort `high`. A fresh context.
- **Inputs:** the `/th/` rows of `lexicon-overlays.csv`, and the sections that teach each kind's endings (slices only).
- **Write decisions** on:
  - the shared scale: its meaning and its learner-facing name
  - the one section that teaches it, and how the other pages point to it
  - each outlier: DECISION `-m`, plan, and the MAY and NOTIONAL follow-ups. Each either fits the scale or is named as an exception.
- Format as U9. These are blocking (*precedent*).

**May edit:** this proposal, under *Open decisions* only.

**Phase 2 close.** *Orchestrator.*
1. Apply the `AGENTS.md` Data row for `data/word-slots.csv`.
2. Consolidate. Write phase 3's S-units from U9's decisions, one per group, each marked *waits on D<n>*. Write phase 4's units from G1's decisions.
3. Tell the user which decisions are due.

Expected commits: U6, U7 and U8, one each; one `AGENTS.md` commit; and one consolidation commit, which also holds U9's and G1's write-ups.

### Phase 3: slot and tree decisions

Written at phase 2 close, one S-unit per accepted group of U9 decisions. If none are accepted, skip this phase.

**S<n>. <topic> (D<n>).**
Agent `proposal-worker`, `model: opus`, effort `high`.
- Change the slot table, the grammar and the parser together:
  - the owning grammar section
  - [unassigned-reserved.md](../../meta/unassigned-reserved.md) for a newly closed or opened spelling
  - a [design-decisions.md](../../meta/design-decisions.md) entry for an alternative the user rejected with a reason
  - the [classification table](../../meta/interpreter.md#classification-table) for a new construction
- Fix any Practice item whose answer changes, found with `node scripts/find.mjs`, per [drill-generation.md](../../meta/procedures/drill-generation.md).
- `parse-snapshot` lists only the forms the decision names.

**May edit:** the files the decision's write-up names, plus `data/word-slots.csv`, `src/parse/`, `docs/meta/unassigned-reserved.md`, `docs/meta/design-decisions.md`, `docs/meta/interpreter.md`.

**Phase 3 close.** Consolidate. Expected commits: one per S-unit, plus one consolidation commit.

### Phase 4: stance grade

Written at phase 2 close from G1's accepted decisions.
- **First unit (code):** one `grade` field on `/th/` overlays, set from the ending, with each kind's gloss unchanged. It is a code unit (`opus`, `high`).
- **Then a prose unit**, briefed from what the code produced (glosses checked with `parse.mjs`): it teaches the scale once on the section the decision names, and points the other pages to it (`opus`, `high`).
- **Then the style unit**, only if the style rule above calls for it: `style-editor`, `opus`, `high`.
- **Final gate**, then consolidate. The grammar and meta pages now own the result, so the proposal moves out of the folder per [folder and links](../../meta/procedures/proposals.md#folder-and-links).

Expected commits: one per unit, plus one closing commit.

### Rule digest (copied into every brief)

- The language is **Ageben**. Grammar pages show only the current language.
- **Parse-neutral units:**
  - `npm run parse-snapshot -- --ref <sha> --drop-one --swap` shows 0 differences (the brief gives the sha).
  - `npm run grammar-check` passes. Turn a new choice into structure or a token mark, never a `GATE`. It includes an LR(1) conflict check; `npm run grammar-check -- --examples 0` runs that alone for experiments.
  - Construction ids: compare `node scripts/find.mjs --constructions --all` with `tmp/state/parser-structure-constructions.txt`. Rename an id only one for one, keeping its count, and change its `constructions.ts` entry and its interpreter rows in the same unit (`npm run class-row -- KEY`).
  - `npm run context-report -- --diff` lists only the retype rows the unit removes.
- **Tests:** change a test only where it names a removed token type or a moved function, never an expected parse, gloss, reading or rejection.
- **Parser and grammar:** a change to what the parser accepts or how it reads a form lands with the grammar edit that teaches it (phases 3 and 4 only).
- **Code:** run `.ts` with `npx --no-install tsx`. Measure with `npm run deps` and move code with `npm run move-decl`. Keep files under 1,500 lines. Never run `prettier`; the repo does not use it.
- **Ageben:** check forms with `node scripts/parse.mjs --check-lexicon '<a>' '<b>' …` (one batched call). Use `--llm-prompt` only to work out what a sentence means. Search examples with `node scripts/find.mjs`, never grep.
- **Grammar prose:** follow the [checklist](../../meta/doc-style.md#checklist). Find links into a page with `npm run page-refs`.
- **Reading:** list headings first, then read only the line ranges you need. When a result says *Output too large*, grep or slice the saved file.
- **Scratch files** go in the scratchpad, or `tmp/scratch/` when there is none. Write a script that edits files with the Write tool and run it; a hook blocks heredoc and inline edit scripts.
- **Verify:** end with `npm run verify -- --allow-generate`. When it reports a new error, read only that line of `tmp/logs/verify-last.log`.
- **Stop and report**, without working around it, when: a premise no longer holds; later units would need a different design or order; skipping would leave a broken state; or the unit's stop condition is met.
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

### D2. Retypes that need more than one word of lookahead
<a id="d2"></a>

**Problem.** Goal 1 asks for every retype decided by the word before or the word after to become grammar structure. In phase 1 that worked for `VCont` and the stand-in `…Lone` types, and `HostedBJoined` now settles one word earlier. Everything else conflicts under `grammar-check`'s LR(1) check. In each case the grammar would have to choose before the deciding word arrives:

| Pass (retypes) | Conflicts | Shape |
|---|---|---|
| `wLeaf` (`/w/` targets, 315) | 3,801 in 342 decisions | after a finished phrase, a `/w/` word starts a modifier run or attaches higher; the word after an unbounded run decides |
| `glLean` (`gl-` lean, 38) | 678 in 150 | noun vs package, and list-item close; the noun after the `gl-` word decides |
| `verbEnd` (`VPlainEnd/More`, `JoinVEnd/More`) | 1,892 in 55 | lone verb vs list at the first verb, where the second verb may come any number of words later; the `/v/` join's end and more readings reduce on the same lookahead |
| `hosted` (`HostedBNoun`, `HostedBNumber`, `HostedOdo`, `LateOdo`, `Amount`, `HScale`, `BScale`, `Factor`, `HZone`, `HZoneHeld`, `HSharedV`) | 3 to 2,916 per family | after a host (or rank join, shared adjective, `HookHosting`), the same word could also start a new phrase; `Amount` is reduce/reduce, cardinal vs adjective on the landmark |

The logs are `tmp/scratch/u2-gc-exp.log`, `u2-gc-gl.log`, `u3-gc-exp.log` and `u4-gc2-*.log`. `HookHosting` was not tried; it is class B, like `/w/`.

**Options.**
- **A. Keep these passes.** Record in parser-pipeline.md why each stays: the word it retypes is ambiguous until a later word. Goal 1 becomes *every retype that one word of lookahead can state*. U8 writes the note.
- **B. Restructure the tree.** Parse the ambiguous stretch as neutral units, carry a *list pending* flag in the chain states, and have the builder and `construction-trace.ts` regroup them. This changes the tree shape and construction ids (`vpItemUnit.*` becomes `unit.*`, not one for one). It adds the post-parse reshaping that U8 aims to remove. It is a large unit per pass family.
- **C. Change the grammar so one word decides:** a left-bound list marker, or no new phrase right after a host. This restricts the language, and the left-bound marker was already declined.

**Effect on the learner.** None for A or B, which change no parse. C changes forms.

**Class:** blocking. It drops U2 and the verb-list half of U3, and changes Goal 1 (*scope*). B also changes the tree shape that other code relies on.

**Recommendation: (high)** A. The passes record grammar that by design needs a later word, which the *joins close on the right* finding already explains. B moves the same lookahead into post-parse reshaping, the opposite of U8. C was declined.

## Background

### Problem

Most of the parser's logic sits around the Chevrotain grammar rather than in it:
- `markContext` retypes words from their neighbors in named passes (`CONTEXT_PASSES`), and the `/w/` target types alone are about 100 token types.
- `sentence-build.ts` reshapes the finished tree.
- `enforce` holds 133 rejection ids, among them about 15 rules on which role letters take a word feature, each hand-coded.
- Each stance overlay kind spells its `-l` / `-m` / `-r` meanings on its own.

An editor can't see which of these are parser plumbing and which stand for a grammar rule that could be simpler. A learner meets the same rules as scattered exceptions.

### Goals

1. Every retype decided by the word before or the word after becomes grammar structure, with no parse changed. D2 may narrow this.
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

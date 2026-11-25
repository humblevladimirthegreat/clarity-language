# Parser structure: context passes, slot rules, tree building, and what they say about the grammar

**Status:** IN PROGRESS, 2026-11-25. Phases 1 and 2 done (`a2ea44e7` to `835d90ec`; `8710f3b3` to `7e596408`). Phase 3 is next. S3 may start now; S1 and S2 wait on the user's D8 to D11. Phase 4 waits on D3 to D7.

Where the results live:
- **Why the passes stay:** [parser-pipeline.md § why the remaining passes stay](../../meta/parser-pipeline.md#why-passes-stay).
- **Reshaping that stays:** [§ reshaping that stays](../../meta/parser-pipeline.md#reshaping-stays).
- **The slot table:** `data/word-slots.csv`, [§ word slots](../../meta/parser-pipeline.md#word-slots).
- **The listener's list strategy:** [joins.md § right-close](../../grammar/beginner/joins.md#right-close), plus the bar sentence in [bars.md § bars](../../grammar/intermediate/bars.md#bars).
- **Left fences:** in [design-decisions.md](../../meta/design-decisions.md).

Decided:
- 2026-11-24 (user): one shared grade for the stance endings, in phase 4.
- 2026-11-25 (user): `data/word-slots.csv` reaches `enforce` as CSV text, a required fourth argument to `createClassifyTables`.
- 2026-11-25 (agent, autonomous, U9's audit):
  - D12 (high): keep the seven post-parse rules that wait on a later word.
  - D13 (high): keep `splitUnits` (noun case) and `joinClauseItems` in code.
  - D14 (medium): drop `HSharedV` and keep the tree (S3).

Both D12 and D13 are recorded in [§ reshaping that stays](../../meta/parser-pipeline.md#reshaping-stays).

**Related:**
- [parser-pipeline.md](../../meta/parser-pipeline.md), [unassigned-reserved.md](../../meta/unassigned-reserved.md), [design-decisions.md](../../meta/design-decisions.md), [interpreter.md § classification table](../../meta/interpreter.md#classification-table).
- Code: [`word-slots.ts`](../../../src/parse/word-slots.ts), [`mark-context.ts`](../../../src/parse/mark-context.ts), [`tokens.ts`](../../../src/parse/tokens.ts), [`grammar/`](../../../src/parse/grammar/), [`verb-items.ts`](../../../src/parse/verb-items.ts), [`constructions.ts`](../../../src/parse/constructions.ts) (`REJECTIONS`).
- Data: [`lexicon-overlays.csv`](../../../data/lexicon-overlays.csv), [`src/flashcards-endings.ts`](../../../src/flashcards-endings.ts) (`SCALE_ANCHOR`).

**Depends on:** none. Phase 4's prose unit edits `knowing.md`, `sakes.md` and the stance pages. If `grammar-newcomer-rewrite.md` is rewriting any of them when phase 4 starts, land phase 4 first or rebase its edits onto the rewrite.

**Design authority:**
- Phase 3 changes only the forms and readings the user accepts from D8 to D11; S3 changes no parse.
- Phase 4 changes only the stance-ending readings the user accepts from D3 to D7.

## Implementation plan

Two phases remain, run through subagents. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates the proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

**Gates.**
- At the start of each phase, the orchestrator does four things:
  - saves `npm run verify -- --baseline` and `npm run context-report -- --save`
  - saves the construction counts with `node scripts/find.mjs --constructions --all > tmp/state/parser-structure-constructions.txt`
  - notes the phase-start commit
  - writes the rule digest below, with that sha, to the scratchpad
- Each unit ends with `npm run verify -- --allow-generate` and passes before its commit.
- **A parse-neutral unit** (S3, and P1 unless D3 to D7 change a gloss) also shows three things:
  - 0 differences in `npm run parse-snapshot -- --ref <phase-start sha> --drop-one --swap`
  - a passing `npm run grammar-check`
  - an unchanged construction-count file
- **A unit that changes what the parser accepts** (S2): `parse-snapshot` lists only the forms its decision names.
- **The final gate** is a full `npm run verify` against an empty baseline at the end of phase 4, or of phase 3 when phase 4 is dropped.
- No unit edits `say-*.md`, `english.md` or `src/english-helper/`, so there is no recall gate.

**Style.** Writers of grammar prose self-check against the [checklist](../../meta/doc-style.md#checklist).
- **While `grammar-newcomer-rewrite.md` is unfinished:** no `style-editor` unit runs unless a unit creates a new page.
- **Once it is done:** the last phase that edits grammar prose ends with a `style-editor` unit over `npm run changed-sections -- 13d7b221`. It runs only if the run's grammar edits add a section or come to more than a few sentences on a page.

### Phase 3: slot and tree decisions

The units run one at a time (each runs `verify`), in the order S3, S1, S2. An S-unit whose decision the user rejects is dropped. If only S3 is left, fold it into phase 4 as its first unit, and say so on the Status line.

**S3. Drop `HSharedV` (D14).**
Agent `proposal-worker`, `model: opus`, effort `high`. Parse-neutral.
- Today `mark-context.ts` retypes an `/h/` right after a `/v/` join to `HSharedV`, and `hSharedUnitRule` puts it in the join's `shared`.
- U8 dropped the retype (in `mark-context`, the adverb slot in `vJoinCloseRule`, the `vpCoordOpen` chain entry and the `EndOpen` branch of `vpParts`). The LR(1) check passed: 0 conflicts, one tree per sentence. But one tree changed: in `zazozon vowurol veruvol val hahunom.` the `/h/` went to `sharedAfter` in `verb-items.ts`, which takes plain adverbs into the last part's `sharedUnits`.
- This unit drops the retype and has the plain SHARED `/h/` after a verb list fill the join's `shared` field, so the tree stays the same. The hosting checks in `hostedType` that name `HSharedV` already accept `H`. Check that a `bl-` word after the `/h/` is still hosted.
- Drop `HSharedV` from `tokens.ts`, from `SETTLES` in `context-report.ts`, and from the `hosted` row in parser-pipeline.md. Replace that page's `HSharedV` paragraph with a line saying how the plain SHARED phrase fills `shared`.
- If 0 differences can't be had, revert and report why. D14 then becomes *keep*, and the paragraph stays.

**May edit:** `src/parse/tokens.ts`, `src/parse/mark-context.ts`, `src/parse/grammar/*.ts`, `src/parse/verb-items.ts`, `src/parse/sentence-build.ts`, `src/parse/enforce*.ts`, `src/parse/context-report.ts`, tests under `src/parse/` (token names only), `docs/meta/parser-pipeline.md`.

**S1. Slot cells in unassigned-reserved.md (D8, D9, D11; waits on the user).**
Agent `proposal-worker`, `model: opus`, effort `medium`. Docs only; no parse change.
- Give every cell that `data/word-slots.csv` closes, and that D8 or D9 does not keep closed with a stated cost, an entry in `unassigned-reserved.md`, with its rejection id:
  - D8: add the missing `Parser: prescriptionSlot` to the prescription entry.
  - D9: add open entries with no-reading reasons for the 17 cells that have none, as D9's write-up lists them. If D10 is accepted, the `/x/` `-ln` cell is left out.
  - D11: restate the `/v/` hook-prefix reason as *no reading yet*, in `design-decisions.md` *Hook prefixes* and in its `unassigned-reserved.md` entry.
- Commit each accepted decision's edits together; these are user decisions.

**May edit:** `docs/meta/unassigned-reserved.md`, `docs/meta/design-decisions.md`.

**S2. `-ln` as a topic (D10; waits on the user).**
Agent `proposal-worker`, `model: opus`, effort `high`.
- Open `-ln` on `/x/`: one thing the name applies to, set as the topic, read and resumed like any `-l` topic (`xazozoln …`).
- Change the slot table, the grammar and the parser together:
  - the `nameInstanceSlot` row and its rejection text
  - `topic.md` and `proper-names.md#name-instance--ln`, a sentence and an example each
  - an interpreter row for the topic in the [classification table](../../meta/interpreter.md#classification-table)
  - `unassigned-reserved.md`: the `/y/` cell stays open
- Fix any Practice item whose answer changes, found with `node scripts/find.mjs`, per [drill-generation.md](../../meta/procedures/drill-generation.md).
- `parse-snapshot` lists only `-ln` topic forms.

**May edit:** `data/word-slots.csv`, `src/parse/`, `docs/grammar/*/topic.md`, `docs/grammar/*/proper-names.md`, `docs/meta/unassigned-reserved.md`, `docs/meta/interpreter.md`, Practice under those pages.

**Phase 3 close.** Consolidate. Expected commits: one per S-unit, plus one consolidation commit.

### Phase 4: stance grade

Written from G1's audit (D3 to D7). The units wait on the user's decisions there.

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
- Give each `/th/` overlay reading a `grade` set from its ending, with the values D3 names (recommended: `settled` / `default` / `passing`). Each kind's gloss stays the same.
- Derive the field in code from the ending. A new column in `lexicon-overlays.csv` would change a data format, and that needs the user.
- The outliers follow D5 to D7. `ahul` / `ahur` (BECAUSE fault / share) get no grade.
- The sake rows list only `-m`, and `/h/` ALREADY / STILL are not `/th/` overlays, so the field doesn't reach them. Report how the field could cover them; don't widen it.
- The brief names the files P1 may edit, from a grep for where overlay readings are built.

**P2. Teach the scale once (prose).**
Agent `proposal-worker`, `model: opus`, effort `high`. Briefed from P1's result, with glosses checked with `parse.mjs`.
- Move the teaching to the section D4 names (recommended: `knowing.md#follow-up-endings-may`; `already-still-yet.md#stage-of-change` if D7 makes MAY an exception).
- Keep a `settled-to-passing` anchor, and retarget its references with `npm run page-refs` and `retarget-id`: `sakes.md`, `terminology.md`, the consonants cheat sheet, the 7 linking pages and `SCALE_ANCHOR`.
- Point the evidentials, MIRATIVE, WANT and MAY to the scale. Each kind keeps its own gloss, and *evidence strength* stays the channels' reading of the grade.
- Note *modifiable* (DECISION `-m`) as a label to revisit if D5 goes as recommended.
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

### Stance endings (G1)

Groups: **A** (D3, D4) settles the scale and where it is taught: the grade-field unit takes its value names from D3, and the prose unit follows D4. **B** (D5 to D7) settles the outliers and lands with the grade-field unit.

The finding behind all five is in phase 4's background.

### D3. The shared scale: meaning and names (group A)

**Problem.** The field needs value names, and the learner needs one name for the scale. The scale's meaning is how settled the stance's hold is: `-l` the most settled (cue *lasting*), `-m` the default, `-r` the most passing (cue *right now*), and neither end is better. Evidentials use a separate term whose test (show / describe / gesture) is about the strength of the grounds.

**Options.** (a) Keep as is: the name exists, but evidentials, MIRATIVE and WANT teach their endings without it. (b) Keep *settled-to-passing* and use the grades `settled` / `default` / `passing` as the field values. Every graded kind names the scale and keeps its own gloss; *evidence strength* stays the channels' reading of the grade, as *time horizon* is the sakes'. (c) A new name (*firmness*, *hold*), which renames the term, the cheat-sheet row and 11 references.

**Affected.** 362 examples in 28 files carry a graded `/th/` `-l` / `-r` ending (evidential 135 in 11 files; each other kind 57 or fewer). The prose changes about 8 sections and no example.

**Learner.** One cue (*lasting* / *right now*) predicts the direction of every slot. Strong evidence read as *settled grounds* is a small stretch, and the channel page keeps its own test.

**Class.** Blocking (precedent).

**Recommendation:** (b) **(high)**. The name is already on 11 references, the cheat sheet and the flashcards, so a new name would give the learner a second term for nothing.

### D4. The section that teaches it (group A)

**Problem.** `sakes.md` (19th in the reading order) teaches the scale. `knowing.md` (12th) teaches MAY's graded endings (17 examples) without naming the scale, and `already-still-yet.md` (16th) links forward to `sakes.md`. The teaching section must come no later than the first page with a graded ending.

**Options.** (a) Keep as is: one forward link, and the learner meets MAY's endings without a name for the scale. (b) Move the teaching to `knowing.md#follow-up-endings-may`, the first graded ending in the order. This follows Claritish, where `could-be.md` already teaches the scale on MAY. Keep a `settled-to-passing` anchor there and retarget `sakes.md`, the other references, the terminology entry, the cheat sheet and `SCALE_ANCHOR`. (c) Teach it on `already-still-yet.md#stage-of-change`, the closest literal fit, but only if D7 rules MAY an exception. (d) Teach it on `word-endings.md` (4th), before any stance word: earliest, but abstract.

**Affected.** `knowing.md`, `sakes.md`, `terminology.md`, `consonants.md`, the 7 pages that link the anchor, and one code constant. No example changes.

**Learner.** The learner gets the name with its first instance, and every later page refers back to it.

**Class.** Blocking (precedent).

**Recommendation:** (b) **(medium)**. It is the earliest concrete case. It depends on D7 keeping MAY on the scale; if D7 goes the other way, (c).

### D5. DECISION `-m` (group B)

**Problem.** The gloss names `ogem` *modifiable*, a claim (open to revision), while the scale's `-m` is the default. `want-and-decide.md#endings-changeability` already says `-m` "claims nothing either way" and is the ending to use when unsure.

**Options.** (a) Keep as is. (b) It fits: `ogel` / `ogem` / `oger` get `settled` / `default` / `passing`, and the gloss stays. (c) Exception: `ogem` gets no grade.

**Affected.** 38 graded examples in 8 files, plus the `ogem` examples, whose text is unchanged.

**Learner.** Reading `ogem` as the default matches how the page already tells learners to choose; an exception would contradict that page.

**Class.** Blocking (precedent).

**Recommendation:** (b) **(high)**. The page already teaches `-m` as the choice when you are unsure. Note *modifiable* for the prose unit as a label to revisit; it is not a field exception.

### D6. PLAN (group B)

**Problem.** Atlas / itinerary / sketch grade how fully the plan is worked out (backups, steps, direction only), not how long it lasts. `-m` *itinerary* claims that steps exist, though its gloss adds "detail unstated". `intention.md` and `wants-and-plans.md` already claim the shared scale.

**Options.** (a) Keep as is. (b) It fits: `agol` settled, `agom` default, `agor` passing. A plan with backups is the most settled, and a sketch is a direction you may drop. (c) Exception: no grade, and both pages teach map resolution as PLAN's own scale.

**Affected.** 57 graded examples in 12 files (`intention.md` 16).

**Learner.** With (b), the cue still predicts the direction (more prepared is `-l`). With (c), the learner loses a claim they could test and find loose, but has one more scale to learn.

**Class.** Blocking (precedent).

**Recommendation:** (b) **(medium)**. The direction holds, and the pages already teach it that way. The weak point is that `-m` names a content (steps) rather than the default.

### D7. MAY and NOTIONAL follow-ups (group B)

**Problem.** These endings say what you will do with the thought, not how lasting your hold on it is. MAY: find out / unsaid / let it pass. NOTIONAL: rehearse / picture / toy with. `notional.md` claims the scale, and `could-be.md` reads MAY `-l` as "the question will be settled".

**Options.** (a) Keep as is (NOTIONAL claims the scale; `knowing.md` doesn't). (b) They fit: `omal` / `eyul` settled, `omam` / `eyum` default, `omar` / `eyur` passing. `-l` leads somewhere lasting (an answer, an act), and `-r` is a passing thought. (c) Exception: no grade, or a separate follow-up grade (pursue / default / drop).

**Affected.** MAY: 44 examples in 10 files (`knowing.md` 17, `could-be.md` 15). NOTIONAL: 25 in 6 files.

**Learner.** With (c), the first graded ending in the reading order is off the scale, so D4 moves to (c). With (b), the *right now* cue reads literally on `-r`.

**Class.** Blocking (precedent).

**Recommendation:** (b) **(medium)**. The `-r` reading is literal, `-l` is where the thought settles, and Claritish already teaches MAY this way.

### Slots and reshaping (U9)

Groups: **C** (D8, D9, D11) lands as S1, a docs unit on `unassigned-reserved.md` (and `design-decisions.md` for D11), so that every cell `data/word-slots.csv` closes has an entry with its rejection id. **D** (D10) gives an open spelling a reading, which changes what the parser accepts; it lands as S2. **E** (D12 to D14, the reshaping left after the parse) is settled; see Status.

**Cells.** The universe is the ten letters `src/parse/word-slots.ts` validates (`z d b v g w h th x y`). Thirteen rows limit letters and close 72 cells. Six have a stated cost and stay closed:

| Feature | Closed letters | Cost stated in |
|---|---|---|
| tag pronoun | `/x/` `/y/` | `design-decisions.md` D-24 |
| role pointer | `/x/` `/y/` | `design-decisions.md` D-24 |
| role pointer | `/h/` | `unassigned-reserved.md` *Role pointers*: the shape is a say word (`hwuzam`) |
| plural `-x` | `/th/` | `design-decisions.md` D-37 |

The prescription row's seven cells outside the sake slots (`/z/ /d/ /b/ /v/ /h/ /x/ /y/`) follow the sake-word cells: a prescription is a sake word, so they open or stay closed with them. All examples below were checked with one batched probe; every reshaping example parses and reads with no clash.

### D8. Slot cells already open (group C)

**Problem.** 49 closed cells have an open entry in `unassigned-reserved.md` whose reason is *no reading yet*, not a cost: sake word on `/z/ /d/ /b/ /v/ /h/ /x/ /y/` (with prescription's seven), prescription on `/ɡ/ /w/` (`gawethel`), role compound on `/v/ /w/ /th/`, hook prefix on `/v/ /w/ /th/ /x/ /y/`, hooked join on `/v/ /ɡ/ /w/ /th/ /x/ /y/`, ability on `/z/ /d/ /b/ /h/`, an aside under `/z/ /d/ /b/ /v/`, a cite, opaque or mention span under `/th/`, a tag on `/v/ /ɡ/ /h/ /w/ /th/`, a role pointer on `/v/ /ɡ/ /w/`, `-x` on `/w/ /h/`. Only the prescription entry lacks its id (`Parser: prescriptionSlot`).

**Options.** (a) Keep as is: open, and the parser rejects them, as the page's own policy allows. (b) Close some with a reason. (c) Open some with a reading.

**Affected.** No example (every form is rejected); `unassigned-reserved.md` only, one line for the missing id.

**Learner.** None. Each parser message already names the slots the feature takes.

**Class.** Review later: it confirms each cell's status, which is stricter than code shape.

**Recommendation:** (a), plus the missing id **(high)**. Every reason is a no-reading reason, and no cell has a job a learner reaches for, apart from the `/v/` hook prefix (D11).

### D9. Closed cells with no entry (group C)

**Problem.** 17 cells the parser rejects appear nowhere in `unassigned-reserved.md`, and the owning pages list the allowed slots without a reason: label reach on `/w/ /th/ /x/ /y/` (`labelReachSlot`, `wowurothul`); `-ln` on `/ɡ/ /v/ /h/ /w/ /th/ /x/ /y/` (`nameInstanceSlot`, `gazozoln`); ability on `/w/ /th/ /x/ /y/` (`abilitySlot`, `wowuroxal`; the open entry names only nouns, names, pronouns and `/h/`); an aside under `/x/` (`spanSlot`); a role pointer on `/th/` (`pointerSlot`, `thwuzer`, whose message speaks only of the holder seam).

**Options.** (a) Keep as is. (b) Add open entries with ids and no-reading reasons: label reach labels a content word, and these slots hold a degree, a stance, a topic or a call (on a sake root, the `th` spot is the sake's own stance); ability belongs to an act or a quality; an aside comments and sets no topic; a pointer picks a participant; `-ln` names one thing that fills a role (`/x/` waits on D10). (c) Close any of them; no cost was found for one.

**Affected.** No example; `unassigned-reserved.md`, and optionally the `thwuzer` message.

**Learner.** None now. Drill generation stops drilling these cells.

**Class.** Review later (sets each cell's status).

**Recommendation:** (b) **(high)**. The repo rule wants every rejected spelling listed, and none of these has a cost to state.

### D10. `-ln` as a topic (group D)

**Problem.** A topic word takes a content noun on `-l` (`xodozel zalazun vowurol.` *as for a dog, …*; 35 examples in 10 files have one), but `-ln` is closed on `/x/`, and neither the page nor the parser message gives a reason. *As for an iPhone, …* (`xazozoln …`) is a form a learner would reach for, since `-ln` is taught as `-l` under a name. On `/y/`, `-l` is an interjection, so `-ln` there has no guess.

**Options.** (a) Keep it closed, with the open entry from D9. (b) Open `-ln` on `/x/`: one thing the name applies to, set as the topic, read and resumed like any `-l` topic. (c) Open `/y/` too.

**Affected.** 23 examples in 6 files carry `-ln`, and none changes. `topic.md` and `proper-names.md#name-instance--ln` gain a sentence and an example; the `nameInstanceSlot` row, its rejection text, and an interpreter row for the topic.

**Learner.** With (b), `-ln` goes wherever a first-mention noun goes, one exception fewer to learn; the `/y/` cell stays open.

**Class.** Review later (gives a reading to a spelling with no entry yet).

**Recommendation:** (b) **(medium)**. The reading follows from two taught rules with no new piece. It changes what the parser accepts, so it lands after this phase.

### D11. The hook prefix on `/v/` (group C)

**Problem.** `design-decisions.md` *Hook prefixes* and the open entry give the `/v/` cell's reason as *it would repeat the `/ɡ/` predicate* (*is anti-fighting*). By the repo's weighing rule, a second way to say the same thing is not a cost, so the stated reason is no reason. A verb `vuoxuvuvul` could also mean more than the predicate: *acts against fighting*.

**Options.** (a) Keep the text. (b) Restate it as no reading yet: a hook prefix names a stance toward its stem, and a verb would have to say which act carries the stance (opposing, campaigning, refusing), which the hook does not tell. The cell stays open. (c) Open `/v/` as *takes that stance toward the stem, in acts*.

**Affected.** No example. (b): one bullet in `design-decisions.md`, one entry in `unassigned-reserved.md`. (c) also `hook-compounds.md#hook-prefixes`, the slot row and an interpreter row.

**Learner.** (b): none. (c): one more slot for the prefix, with a reading close to the `/ɡ/` predicate.

**Class.** Review later: (b) rewrites a design-decisions reason without changing the cell's status; (c) adds a form.

**Recommendation:** (b) **(medium)**. The reason should be one the repo accepts, and no learner job needs the verb yet.

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

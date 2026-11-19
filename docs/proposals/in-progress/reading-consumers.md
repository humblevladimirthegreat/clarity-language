# Tools that read readings

**Status:** IN PROGRESS, 2026-11-19: phases 1 and 2 done. The practice lint compares with `sameReadings` (`src/interpret/equal.ts`, [equal readings](../../meta/interpreter.md#equal-readings)); `src/lint/reading-equivalence.ts` is gone. Settled in phase 2 and now on their pages: an `-l` pointer takes the `slot:newMember` binder ([new member in a statement](../../grammar/beginner/joins.md#new-member-in-a-statement)); attitude × new member follows text order ([speaker attitude](../../grammar/intermediate/feelings.md#speaker-attitude)); a restrictor's frame holds the unbroken run of `/h/` occasion words before it, kept as `unit:h` details the frame's `occasions` field points at ([restrictors](../../grammar/beginner/restrictors.md)). Decided 2026-11-19: Inspect shows hover notes on each frame word, plus a "what covers what" list when a sentence has two or more whole-clause frames; the prompt eval runs first on about 20 examples with two or more whole-clause frames, reusing stored replies as the baseline, goes to the full set only if the subset shows a gain, and the `--structure` flag is kept only if the overall miss rate drops by at least 3 points. Phase 3 is ready.  
**Related:** the reader [read.ts](../../../src/interpret/read.ts) and its note [interpreter.md](../../meta/interpreter.md); the parser note [parser-pipeline.md](../../meta/parser-pipeline.md); the "same reading" lint [reading-equivalence.ts](../../../src/lint/reading-equivalence.ts) and its caller [practice-item-rules.ts](../../../src/lint/practice-item-rules.ts); checkpoint policy [translation-exercises.md](../../meta/translation-exercises.md) (principle 14); construction search [src/find/](../../../src/find/) and its how-to [read-ageben.md](../../meta/procedures/read-ageben.md#find); Inspect [inspect.ts](../../../src/parse/inspect.ts), [AgebenInspect.vue](../../grammar/.vitepress/components/AgebenInspect.vue), [GlossOverlay.vue](../../grammar/.vitepress/components/GlossOverlay.vue), [config.ts](../../grammar/.vitepress/config.ts); the translation prompt [llm-prompt.ts](../../../src/parse/llm-prompt.ts), [scripts/parse.mjs](../../../scripts/parse.mjs), [src/agent/ageben.ts](../../../src/agent/ageben.ts), [scripts/llm-eval.ts](../../../scripts/llm-eval.ts); the reader's browser entry [src/interpret/browser.ts](../../../src/interpret/browser.ts).  
**Depends on:** none. **Order:** lands before `mind-map-view.md`. Phase 4 adds the reader to the Inspect page; the mind map then reuses that alias and the parse-once plumbing instead of adding its own. `clingo-solver.md` is in progress and also edits `src/interpret/`; never run a phase of each at the same time. `structural-search.md` (an idea) keeps claim search; phase 3 here moves only the existing frame queries, and that idea builds on the reading pass this one adds to `src/find/`.  
**Design authority:** *none*. Tooling only: no form or reading changes, and the parser's accept/reject behavior does not change. Every comparison rule cites the grammar section it follows. 

## Design

### Construction search over readings (phase 3, C1)

`src/find/` runs the reader on each parsed example and takes frames from the readings:

- `frame=` lists every frame on a word: whole-clause frames, frames nested in `inner`, adjective-reach frames, and stance-list joins. A new word key `reach=` (`clause`, `adjective`, `list`, `noun`, `word`, `nested`) restricts it; `frame=X,reach=clause` gives today's results.
- `--over`, `--under` and `--unordered` read each reading's `order` and `unordered`, nested readings included, so islands and verb-list items count.
- `--diff REV` reads both passes through the reader. `rev-parser.ts` already archives all of `src`, so it takes `readParse` from REV as well. The floor moves to the first commit whose reader copies scope order; the unit finds it and replaces the current floor (`ff43d91d`) in the code and in `read-ageben.md`.
- A run's time is measured before and after. If the reading pass adds more than about 30% to a full run, the readings go in the find cache with the parses.

### Inspect over readings (phase 4)

The parse stays the base. When the sentence parses, a new `src/interpret/inspect-notes.ts` takes the `ParseResult` that `inspectText` already made (parse once) and returns, by token: each frame word's family and reach, which frame covers which, unsettled pairs, and carried frames. The family names shown are the learner terms from [terminology.md](../../grammar/terminology.md), never the internal family ids, and each links to its owning section. The site gets an `@interpret-browser` alias in `config.ts` for `src/interpret/browser.ts`; `mind-map-view.md` reuses it. On hover or focus, a frame word shows its kind, how far it reaches, and what it covers. When the sentence has two or more whole-clause frames, a short list under it also says what covers what (*"maybe" covers "want"*), which pairs are not settled, and which frames carry over from an earlier sentence.

`inspect.ts` also holds `whyFor`, a hand-written map from a word to the section that explains it, while the classification table records an owning section for every key. D3 compares the two and reports; any change to `whyFor` is a later decision, since its links may deliberately point at beginner pages.

### Reader facts in the translation prompt (phase 5)

`buildPrompt` in `llm-prompt.ts` stays pure and stays in `src/parse/`. It gains an optional input: plain-English structure lines (*"may" covers "want"*, *the order of X and Y is not settled*, *the channel from sentence 1 still applies*). A new `src/interpret/prompt-notes.ts` builds those lines from readings, and `scripts/parse.mjs --llm-prompt` passes them when a new `--structure` flag is set. The flag stays off until the eval says otherwise; the agent bundle does not change in this phase.

## Implementation plan

Three phases left, each one orchestrator session. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

The orchestrator saves `npm run verify -- --baseline` at the start of each phase. Between units the gate is `npm run verify -- --allow-generate` against that baseline; the phase's final gate is a full `npm run verify` that passes with no new errors. No phase edits `say-*.md`, `english.md` or `src/english-helper/`, so there is no recall gate. Grammar-page edits here are small (one paragraph on `inspect.md` in phase 4); the writer self-checks them against the [checklist](../../meta/doc-style.md#checklist). If a phase's grammar edits pass a few sentences or add a section, the orchestrator adds a `style-editor` unit (`opus`, `high`) on `npm run changed-sections -- <rev>` at that phase's end ([batch style reviews](../../meta/procedures/proposals.md#running-with-subagents)).

### Phase 3: construction search

**C1 Frames from readings.** Agent: `proposal-worker`, `model: opus`, effort `high`.
Per [construction search over readings](#construction-search-over-readings-phase-3-c1): run the reader in the find pass, take `frame=` and the new `reach=` key from readings, read `--over` / `--under` / `--unordered` from `order` and `unordered` (nested readings included), and make `--diff` take `readParse` from REV, with the new floor. Keep `--json` output keys stable apart from the added `reach`. Measure a full run before and after (`--jobs 1`) and cache readings if it grows past about 30%. Tests in `src/find/` for an island frame, an adjective-reach frame and `reach=clause`.
**May edit:** `src/find/`, `scripts/find.mjs`, `src/interpret/browser.ts` (an export only).

**C2 Docs.** Agent: *orchestrator*.
In `read-ageben.md`, rewrite the *Scope order* and *Measuring a scope decision* paragraphs and the `frame=` example: frames come from readings, `reach=` restricts them, and the new `--diff` floor. In the [parse or reading](../../meta/interpreter.md#parse-or-reading) table, change construction search's row to *readings*.
**May edit:** `docs/meta/procedures/read-ageben.md`, `docs/meta/interpreter.md`.

### Phase 4: Inspect

**D1 Notes.** Agent: `proposal-worker`, `model: opus`, effort `high`.
Write `src/interpret/inspect-notes.ts` and its test per [Inspect over readings](#inspect-over-readings-phase-4): input the `ParseResult` and tokens from `inspectText` (change `inspectText` to return its `ParseResult` as an optional field, so the text is parsed once); output per token the frame family as a learner term and anchor, its reach and what it covers (for the hover), and the sentence's covers / unsettled / carried list, filled only when the sentence has two or more whole-clause frames. A family with no term in `terminology.md` is a stop-and-alert finding, not a made-up name. No Node APIs; export from `src/interpret/browser.ts`.
**May edit:** `src/interpret/inspect-notes.ts`, `src/interpret/inspect-notes.test.ts`, `src/interpret/browser.ts`, `src/parse/inspect.ts` (the return field only).

**D2 UI.** Agent: `proposal-worker`, `model: opus`, effort `medium`.
Add the `@interpret-browser` alias in `config.ts`; render D1's notes in `GlossOverlay.vue`: the hover or focus card of a frame word, and the list under the sentence when D1 fills it; add one paragraph to `docs/grammar/inspect.md` saying what the new notes show. Report the Inspect page's bundle size before and after, measured as [browser / bundle size](../../meta/parser-pipeline.md#browser--bundle-size) measures the parser's. Self-check the paragraph against the [checklist](../../meta/doc-style.md#checklist). Update Inspect's row in the [parse or reading](../../meta/interpreter.md#parse-or-reading) table if what it reads has changed.
**May edit:** `docs/grammar/.vitepress/config.ts`, `docs/grammar/.vitepress/components/GlossOverlay.vue`, `docs/grammar/.vitepress/components/AgebenInspect.vue`, `docs/grammar/inspect.md`, `docs/meta/interpreter.md`.

**D3 Why-links audit.** Agent: `proposal-worker`, `model: sonnet`, effort `medium`.
For every branch of `whyFor` in `src/parse/inspect.ts`, find the classification-table key the same word reads by (`wordKey`) and compare the two anchors. Write `docs/proposals/in-progress/reading-consumers-files/why-audit.md`: same section, different section on purpose (a beginner page for an advanced owner), or drift. Report the counts. No code edits. The orchestrator logs any drift as an open decision when consolidating.
**May edit:** `tmp/scratch/reading-consumers/`, `tmp/state/reading-consumers/`.

### Phase 5: the translation prompt

**E1 Structure lines.** Agent: `proposal-worker`, `model: opus`, effort `high`.
Write `src/interpret/prompt-notes.ts` and its test per [reader facts in the translation prompt](#reader-facts-in-the-translation-prompt-phase-5); add the optional input to `buildPrompt` (a test that the prompt is byte-identical when it is absent) and a `--structure` flag to `--llm-prompt` in `scripts/parse.mjs`. One line of the [Parsing](../../meta/procedures/read-ageben.md#parsing) section names the flag as experimental.
**May edit:** `src/interpret/prompt-notes.ts`, `src/interpret/prompt-notes.test.ts`, `src/parse/llm-prompt.ts`, `src/parse/llm-prompt.test.ts`, `scripts/parse.mjs`, `docs/meta/procedures/read-ageben.md`.

**E2 Eval.** Agent: *orchestrator*.
Run `scripts/llm-eval.ts` with `--structure` on about 20 examples that have two or more whole-clause frames, using stored replies as the without-structure baseline where they exist (run without the flag only where none is stored). Run the full set only if the subset shows a gain. Record both miss rates and the cost on the Status line.

**E3 Keep or drop.** Agent: *orchestrator*.
If the overall miss rate drops by at least 3 points: make `--structure` the default, say so in `read-ageben.md`, and log whether to add the reader to the agent bundle as a new open decision with the bundle size. Otherwise: remove the flag and `prompt-notes.ts`, and add one line to the [parse or reading](../../meta/interpreter.md#parse-or-reading) table saying the prompt was tried with reader facts on this date and did not improve.
**May edit:** `scripts/parse.mjs`, `src/interpret/prompt-notes*.ts`, `src/parse/llm-prompt*.ts`, `docs/meta/procedures/read-ageben.md`, `docs/meta/interpreter.md`.

### Rule digest

Copied into every subagent brief:

> - Read `AGENTS.md`. This proposal is tooling only: no form or reading changes, and the parser's accept/reject behavior does not change. A change that would need one is a stop-and-alert finding, unless your brief names the user's decision that allows it.
> - A tool that needs what a sentence says reads readings (`src/interpret/`); one that needs how it is written reads the parse ([parse or reading](docs/meta/interpreter.md#parse-or-reading)). When a reading lacks something, add it to the reader with its classification-table row in `docs/meta/interpreter.md`, never a local walk of the parse tree.
> - The reader never defaults a missing field, binds a pronoun, or orders an unsettled pair (interpreter.md#reader-rules). Comparison rules that do (the omitted act word) live in the consumer and cite their grammar anchor. "Same reading" is `sameReadings` in `src/interpret/equal.ts` ([equal readings](docs/meta/interpreter.md#equal-readings)); doc examples load tables with `loadDefaultTables()`.
> - Run `.ts` with `npx --no-install tsx`. Check Ageben forms with one batched `node scripts/parse.mjs --check-lexicon '<a>' '<b>' …`; see readings with `npm run -s reading -- '<text>'`; keep `--llm-prompt` for working out what a sentence means.
> - List headings before reading a long page (`npm run -s outline -- <file>`) and read only the ranges you need. Never paste raw build output.
> - Scripts that edit files go in a file under `tmp/scratch/reading-consumers/`, never inline. Reports a later unit or phase reads go in `docs/proposals/in-progress/reading-consumers-files/` (tracked: `tmp/` does not survive between sessions).
> - Verify with `npm run verify -- --allow-generate` at the end of the item (`--fast` inside it; skip it when only `tmp/` changed). On a new error, read only that line of `tmp/logs/verify-last.log`.
> - Edit only the files on your **May edit:** line. Do not commit; the orchestrator does.
> - Stop and report, without working around it, when: a premise of the item no longer holds; the item needs a parser or grammar change your brief does not name; skipping it would leave later items on a broken state; or the item cannot be done as written.
> - At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
>
> **Report** (about 150 words): done (one line); counts or ids a later unit is briefed from; files touched (a count); `AGENTS.md` Owns changes; the `verify` line; skips with reasons; anything the orchestrator must run or fix; **left:**; **inefficient:**.

Rule sections a subagent may open when the digest does not settle a question: [reader rules](../../meta/interpreter.md#reader-rules), [classification table](../../meta/interpreter.md#classification-table), [stop and alert](../../meta/procedures/proposals.md#stop-and-alert).

### Commits

One commit per unit after its gate, staged to that unit's files, message `reading-consumers <ID>: <what> [skip-cd]` and the co-author line; plus one commit of the consolidated proposal at the end of each phase. Expected: 2 + 1 (phase 3), 3 + 1 (phase 4, D3 commits nothing if it only writes `tmp/`), 1–2 + 1 (phase 5). When the last phase ends, the proposal and `reading-consumers-files/` are deleted.

## Open decisions

- **`-l` after a name, the "Compare with" line.** [A new one](../../grammar/beginner/pronouns.md#a-new-one) says writing the noun out says the same as `dwudel`; after a name that is false (`dalazun` written out is the same person, `dwudel` a new bearer of the name; the reader now compares them different, per the page's own name sentence). Options: add "for a common noun" to that line; leave it. **Recommendation:** (high) add the clause, since a learner can read the line as general.
- **Order of a restrictor's occasions.** B2 compares occasions in text order for every restrictor, as join items compare. Options: text order everywhere; as a set for the set series (`hal`), in order for the ranked series. **Recommendation:** (medium) keep text order, matching joins.
- **Where an occasion run stops.** An earlier restrictor ends the run, so in `hal hual` the `hual` has no occasions, from "each listed occasion is one simple content word". **Recommendation:** (medium) keep it. Known gap either way: islands and verb-list items get no occasion list.

## Background

### Problem

The interpreter turns a parse into readings, one per clause: claim, frames, the order between frames, details, and links ([interpreter.md](../../meta/interpreter.md)). [Parse or reading](../../meta/interpreter.md#parse-or-reading) says no tool walks the parse tree for meaning. Three tools that do work out meaning still walk the tree or the resolve records directly:

- **The "same reading" lint.** `reading-equivalence.ts` decides whether two sentences mean the same thing by flattening the parse with its own rules: a second definition of "same reading" next to the reader's, which ignores frame order beyond keeping `/h/` words in relative order. It checks every **Also correct:**, **Pick one**, **Fix it** and **What changes** item.
- **Construction search's frame queries.** `frame=`, `--over`, `--under`, `--unordered` and `--diff` read `resolve.scope`. Scope records exist only for sentence clauses, members of a clause join, and dependents. So frames inside islands and verb-list items, frames that reach one adjective, and stance lists are invisible to these queries.
- **The translation prompt.** `--llm-prompt` gives the model a morph gloss plus prose rules ("a plan … on `h-` covers the whole sentence") and leaves the model to work out scope. The reader already knows which frame covers which, which pairs are unsettled, and which frames carry over from an earlier sentence.

Separately, **Inspect** shows each word's form but nothing about how the words combine. It should keep its parser base: its word-by-word layer runs even when the sentence does not parse. The reader can add a layer on top.

### Goals

- One definition of "same reading", the interpreter's, used by the practice-item lint.
- Construction search's frame queries see every frame the reader places, with a way to restrict them to whole-clause frames.
- Inspect shows how a parsed sentence's frames combine, on top of its current word layer.
- A measured answer on whether reader facts improve the translation prompt, kept only if they do.

### Non-goals

- Moving the scope and carry computation out of the parser's resolve stage (`src/parse/scope.ts`, `src/parse/carry.ts`), or moving the reader's own attachment work (clause-join grouping, hook landmarks, counted ranges) into the tree. Both are boundary moves, not tool switches; they need their own idea.
- Form-level tools stay on the parse (listed in [parse or reading](../../meta/interpreter.md#parse-or-reading)).
- Claim search (`structural-search.md`).
- The mind map (`mind-map-view.md`).

# Ageben interpreter: one reader and one runtime for the tools that act on meaning

**Status:** IN PROGRESS. Phases 1–4 done (2026-11-13 to 2026-11-18): the classification, the scope rule, the reader, the log and the matcher; their outcome is [interpreter.md](../../meta/interpreter.md), `src/interpret/` and [scope.ts](../../../src/parse/scope.ts). Phase 5 units W1 and H7 done on 2026-11-18: the host, the loop and replies (`src/interpret/host.ts`, `run.ts`, `reply.ts`), the wizard running on them (`src/game/host.ts`), and decisions 21, 23 and 24 on their grammar pages. Cut on 2026-11-18, since the game is not due soon: the wizard's knowledge in the log, its window and its off-script test went to `wizard-adventure.md`, and knowledge views read from the text went to `who-knows-what.md`; the wizard check became the loop probe L1, which can settle readings for every tool. W2c, L1 and C1 done on 2026-11-18. **Next: H8a, H8b, then the final commit.** Decision 18 (a new-member phrase on a question is not a filter) is cited by C1; every other decision is on its grammar page or in the git log.

**Related:** the parser's tree ([types.ts](../../../src/parse/types.ts)), [resolve.ts](../../../src/parse/resolve.ts), [ast-walk.ts](../../../src/parse/ast-walk.ts), the construction registry ([constructions.ts](../../../src/parse/constructions.ts)), [hook-jobs.ts](../../../src/parse/hook-jobs.ts), overlay kinds ([parser-pipeline.md](../../meta/parser-pipeline.md#overlay-kinds)), gloss to Ageben ([gloss-inverse.ts](../../../src/parse/gloss-inverse.ts), [glosses.md](../../meta/glosses.md#round-trip)), the wizard engine ([src/game/](../../../src/game/), [wizard-game.md](../../meta/wizard-game.md)), [read-ageben.md](../../meta/procedures/read-ageben.md). Consumers: `mind-map-view.md`, `ageben-spec.md`, `structural-search.md`, `agent-tool-permissions.md`, `wizard-adventure.md`.

**Depends on:** none. **Order:** phase 3 lands before `mind-map-view.md` and before unit T1 of `ageben-spec.md`; phase 4 before that proposal's T2 and T4. Its pilot units (P1, P2) wait for nothing here.

**Design authority:** *none* from here. Every remaining unit is tooling: no form or reading changes unless the user decides one, and then the code lands in the same commit as the grammar edit that teaches it. Where the reader needs a meaning the grammar pages do not state, that is an open decision for the user, never a rule written into code.

## Design

### Terms

| Term | Meaning |
|------|---------|
| **reading** | What one clause says: a claim, its frames, and pointers back into the parse tree |
| **claim** | The bare clause: verb, role-filled arguments, predicate, details |
| **frame** | A construction that changes the claim's truth, force, or owner: speech act, negation, a say word, a stance, a holder, a condition. The mind map's *lift* |
| **detail** | A construction that narrows the claim without changing it: place, time, manner, degree. The mind map's *fold* |
| **label** | A construction that is part of a word's own wording: an ending, a compound seam |
| **link** | A pointer from one reading to another: a pronoun, a tag, an answer filling a blank, a stand-in |
| **log** | Readings in order, each with who said it |
| **host** | The tool that supplies the context a reading is run in |

### The reading

The shipped types in [src/interpret/types.ts](../../../src/interpret/types.ts) are the contract; no consumer adds its own fields. A `Reading` holds `id`, `source` (pointers into the `ParseResult`), `frames` (text order), `order` (copied from `ParseResult.resolve.scope`, each pair with its rule), `unordered`, `claim` (`verb`, `roles` by letter, `predicate`, `details`, `clauses` for a clause join), `links`, and `unread`. Terms are `thing`, `speaker`/`listener`, `pronoun`, `blank`, `literal`, `number`, `list` (with `shared`, `sharedDetails`, `bound`), `clause`, `quote`; any term may carry `details` and `frames` (a tone mark sits there). Frames carry `key`, `anchor`, `values` (a word's typed fields, `hook`, `stanceVowel`), `party`, `hosted`, `content`, `inner`. A binder, a new-member phrase, a cited span and a hooked join's bound each **host** their term, so every word has one place. Links: `anaphor`, `shared`, `pairing` (with `partners`), `grounds`, `carriedFrame` (typed, never filled until R7).

Read readings with `npm run -s reading -- '<text>'` (`--json` for every field); `readParse`, `readText`, `allReadings` are the API ([read.ts](../../../src/interpret/read.ts)).

### The classification table

`CLASSES` in [classes.ts](../../../src/interpret/classes.ts) is transcribed from the meta note; frame rows come from `FRAME_KEYS` in `scope.ts`. A coverage test fails `npm test` when a `constructionRegistry()` id has no row, and [coverage.ts](../../../src/interpret/coverage.ts) fails it when any doc example's word lands in no place or two (ratchet `coverage-ratchet.json`, now 0 / 0). A construction with no row becomes an `unknown` frame and an `unread` entry.

### Reader rules

1. **One reading per clause.** A `BodyClause` gives one. A clause join gives one per member, held by a list term. A dependent, a hinge's clause, an island, and a quote give nested readings in `content`.
2. **Nesting comes only from the tree.** A frame sits inside another only where the parse tree nests them.
3. **Frame order.** The grammar marks what one frame reaches: a stance word inside a [scope island](/scope-islands#scope-islands) frames that chunk, one outside frames the clause, and a dependent or quote nests in the tree. Rule 2 covers all of that. What is left is two frames that both reach the whole clause. The reader sorts every such pair of families into one of four kinds, from a pair table in the meta note:
   | Kind | Example | The reader |
    |------|---------|------------|
    | **commutes** | either order says the same thing | records nothing |
    | **fixed by word shape** | both sit in one word, in fixed slots (a say word's fields, a holder seam on its stance) | records the order in `order`, citing the word's section |
    | **fixed by a rule** | a grammar page, or the parser's resolve stage, states the order | copies it into `order`, citing the rule |
    | **unsettled** | the two do not commute, and nothing orders them | puts the pair in `unordered` |

    Text order is a rule for every pair no other rule orders ([clause](/clause#which-covers-which)), and the resolve stage emits each clause's orders on `ParseResult.resolve.scope` ([scope.ts](../../../src/parse/scope.ts)); the reader copies them. A pair still unsettled (none today) goes in `unordered`. The reader never picks, and neither does any consumer or host: a reading with a non-empty `unordered` is `beyond` in the loop, is marked as such in a match, and is shown as unsettled by a consumer with no loop. The parser's ambiguity check cannot see such a pair, because it reports competing trees and here there is one tree.
4. **Not stated stays empty.** A missing source, holder, or closure is absent from the reading, never defaulted.
5. **Pointers, not copies.** Every frame, detail, and term keeps its `LexWord`s, so a consumer can show the text, the gloss, and the position.
6. **Pronouns keep both ends.** A pronoun term holds the resolver's `AnaphorBind` and, when bound, its antecedent's term. The reader never binds one itself.
7. **Numbers stay stems** in the reading; `value.ts` gives their values for comparison.

### The log

`Log` holds readings in order with `{ speaker, at }` per sentence. A session parses each new sentence together with the transcript so far (or the host's window of it), so the resolver's bindings cross turns with no parser change. The same text always gives the same log. A sentence that does not parse adds nothing and is reported.

### The matcher

`match(query: Claim, target: Claim) → Binding | undefined`, and `ask(question: Reading, log, host) → Match[]`.

- **Verb** matches by root.
- **Roles** match by letter, never by word order. A role the query leaves out matches anything.
- **Terms** match by the host's referent when both resolve; otherwise by root, with the query's details a subset of the target's. A pronoun matches through its antecedent. A literal matches by exact payload.
- **A blank binds** to the target's term in that role.
- **Frames on the question**, other than its own ask force, are filters: the target must carry a frame of that family with equal `values` and a matching `party`.
- **An unsettled pair travels with the match.** A reading with a non-empty `unordered` still matches on its claim, and the match says which pair is unsettled, so no consumer can file it under a heading that assumes an order.
- **A match carries its frame path**: the frames on the matched reading and on every reading that contains it. *Ana says Lee never paid her* matches a question about Lee paying Ana with the path *reported by Ana, denied*. The matcher never decides that a framed claim holds; the host's `verdict` does.
- **Widening** (compound to its head) and **inference** (membership in a stated list; universal to instance, for closed `zual` only) are switches, off by default, and every match found through one says so.

### The host

The contract is `Host<E>` in [host.ts](../../../src/interpret/host.ts), and `ask.ts` re-exports it; no consumer defines a second one. Members: `refer` (one, several, none), `referent`, `holds` (live state; `Held.answers` keyed by role letter or a blank's `at`, listed by `blankSites(claim)`, which covers role, detail, verb and what-kind blanks), `handler` (by verb root), `told` (returns effects, or a `Refusal` that makes the reading `refused`), `verdict`, `accepts` (narrows only), and `window` (the re-parse window; the host sets its size). Only `refer` is needed, and only for a command with roles.

### The loop

`createSession(host, tables, { speaker?, text? })` and `run(text, session) → TurnResult` (`outcome`, `beyond: BeyondPart[]`, `readings`, `effects`, `replies`), in [run.ts](../../../src/interpret/run.ts). Each reading is dispatched on its force:

| Force | Loop does |
|-------|-----------|
| statement (also *yes* / *no*, which imply `yal` / `yam`) | calls `told`; if nothing is refused, adds the turn to the log |
| said (a greeting or interjection alone) | logs it and calls `told`; no handler, no question |
| question | `ask`, then `holds`, then `verdict`; replies |
| command, prohibition | resolves the roles with `refer` (several gives `refused` with *which one?*), then runs `handler` |

**A framed command fails closed.** A command runs only when every frame on it, other than its force, passes `PASS_THROUGH` in `host.ts`: later act words, `call`, `attitude`, a lone first-mention noun (`slot:newMember`, a single `thing` term with no number, no other binder on the command; [joins](/joins#new-member-in-a-command)), and a whole-clause sake or feeling word ([whose stake](/for-a-sake#whose-stake), [feeling word](/how-you-feel#feeling-word)). Any other frame makes the turn `beyond` and names it. No host widens the list.

**The default verdict** counts a match as plain when every frame on its path passes `passThrough`, with no unsettled pair and no switch, except that `attitude` together with `slot:newMember` is not plain (no page settles that pair). It cites [vocative](/speech-moves#vocative) and [joins](/joins#new-member-in-a-statement).

**Turns.** The log closes each turn with a period before it joins the transcript. A call, *yes* / *no*, or interjection closed by a period is its own utterance (`buildUtterances`, `afterTurnWord`); a call-only turn is its own reading (verb `-`). Any `beyond` reading in a turn means nothing in the turn runs and the log does not change.

**Outcomes:** `parse`, `beyond` (names every part), `refused`, `ok`, always distinct.

### Replies

A reply is a `Draft` (`{ gloss, english }`) written as morph gloss. `reply.ts` spells it with gloss-inverse, parses it, and drops any draft that does not parse to one tree, so the interpreter never shows an unparsed line. Shared shapes: yes, no, cannot say, a fill answer as a fragment and as a full clause, *which one?*, and *why* (the readings that decided, by id). Code never spells a root ([closed roots](../../../src/closed-roots.ts)).

### What each consumer uses

| Consumer | Reader | Log + matcher | Host + loop | Keeps for itself |
|----------|:------:|:-------------:|:-----------:|------------------|
| Mind map | yes | | | tree building, layout, drawing |
| Structural search | yes | yes | | surfaces, grouping by frame path, widening choices |
| Ageben Spec | yes | yes | | statement kinds, canned checks, prompt, read-back diff, render |
| Agent permissions | yes | yes | yes | precedence verdict, payload matching, the pre-tool hook |
| Wizard | yes | yes | yes | world model, handlers, quests, recasts, gating |

### The wizard on the interpreter

Done in W1: `src/game/host.ts` (`createGameHost`) supplies `refer` (noun resolution over `Term`; `unreadable(term)` serves `accepts`), `holds`, `handler` (wraps `HANDLERS`), `told` (a call sets the addressee and wakes them; a statement whose subject is the speaker runs that verb's handler), `verdict` and `accepts`. `engine.ts` sends every turn through `run`, one session per engine, made again on `reset`; `Doing` takes a reading. `Scope` lives in `src/game/types.ts`. The game's `Draft` is the reply draft plus the entities it mentions; `generate.ts` keeps only wizard lines (`whichDrafts` over `whatIsItLikeDraft`, `report`, `describe`, `where`, `list`, `greeting`, `FIXED`).

What is left for the game (its events and knowledge in the log, its window, an off-script test) is in `wizard-adventure.md`, milestone 1 as built.

### Files

| Path | Holds |
|------|-------|
| `src/parse/scope.ts`, `carry.ts`; `src/interpret/` reader, log, matcher files | phases 1–4 (done) |
| `scripts/reading.mjs`, npm script `reading` | print a text's readings, `reading ask FILE QUERY`, `reading log FILE` (done) |
| `src/interpret/host.ts`, `run.ts`, `reply.ts` (+ tests) | phase 5 (done) |
| `src/game/host.ts` | the wizard host (done) |
| `docs/meta/interpreter.md` | terms, the table, links, pair table, reader rules; the host contract (C1) |

## Implementation plan

Phases 1–4 and phase 5's W1 and H7 are done. The rest of phase 5 runs through subagents in a fresh session; at its end the orchestrator applies the `AGENTS.md` rows and deletes this proposal.

### Phase 5 (rest): the call rule, the loop probe, the interpreter note

Order: W2c → L1 → C1. W2c and L1 share no files and C1 touches only meta notes, but L1's report feeds C1, so they run in this order.

#### W2c: the call rule and leftover reply shapes

**Agent:** `proposal-worker`, `sonnet`, `medium`.
**May edit:** `src/game/host.ts`, `src/game/generate.ts`, their tests.

- Drop the host's `told` rule that skips a call finding no one on a statement with a body: decision 22 removed its cause (a call no longer reaches past its period), so the call applies strictly. Check the deliver-book walkthrough still plays.
- Reply shapes the shared ones in `reply.ts` cover leave `generate.ts`; W1b moved `checkLine`, `whatIsItLikeDraft`, `listGroup` and `closed`.

#### L1: the loop probe

**Agent:** `proposal-worker`, `opus`, `high`.
**May edit:** `src/interpret/*.test.ts`, and the Open decisions section of this proposal.

- With a toy host, as in `run.test.ts`, run a command and a yes / no question under one frame of every family in `FRAME_KEYS` (`src/parse/scope.ts`), and the turn-boundary cases: a call, *yes* / *no*, and an interjection closed by a period, each followed by a bare body and by a sentence linker. Keep the cases as one table-driven test of the outcomes the loop gives today.
- For each command: a frame that passes has a `PASS_THROUGH` row citing a grammar section; a frame that makes the command `beyond` needs none. Where no page says whether a frame is part of the act, log an open decision (options, recommendation with confidence) and change no code. Decisions 20, 21 and 24 came this way.
- For each question: a frame on it is a filter unless a page says otherwise, as for a new-member phrase (decision 18). Log any frame whose filter reading no page supports.
- Check the outcome changes W1 made, and report each as kept or as a finding: a command whose subject is not the one called is `refused` (was `beyond`); *unknown* on a yes / no question is an `ok` *can't say* reply (was a refusal); a lone greeting or interjection is force `said`.
- Report the families probed, the outcomes by kind, and the decisions logged; C1 and `agent-tool-permissions.md` inherit them.

#### C1: the interpreter note

**Agent:** `proposal-worker`, `opus`, `medium`.
**May edit:** `docs/meta/interpreter.md`, `docs/meta/parser-pipeline.md`, `docs/meta/wizard-game.md`.

- Finish `docs/meta/interpreter.md`: the host contract, the loop's dispatch and outcomes, the pass-through list with its conditions, the default verdict rule, and how to write a host (from [the host](#the-host) and [the loop](#the-loop) above, checked against `host.ts` / `run.ts`).
- Add the matcher rules phase 4 settled, from `match.ts` / `ask.ts`: a question is read after the log's window, so its pronouns bind through the resolver; a role missing from the outer claim is looked for in the claim's scope islands, with the island on the path; a query term matches a member of a target `u` list, with the list's frames on the path; a denied or excluded frame passes an equal filter, with the denial on the path; a `slot:newMember` frame on a question is not a filter (decision 18); holder filters compare the holder and its channel, never the ending; a number blank in a measure detail binds by key and number kind; the `widen` and `infer` switches, and that membership needs one list or a *respectively* pairing.
- Add to `parser-pipeline.md` (or `interpreter.md`, whichever owns resolve inputs) that `ParseOptions.speakers` gives one speaker per sentence and the carry record keeps one state per speaker; with none, a text is one speaker. Note that a call, *yes* / *no*, or interjection closed by a period gets its own utterance (`buildUtterances`, `afterTurnWord`), and that the log closes each turn with a period.
- Add a pointer from [parser-pipeline.md](../../meta/parser-pipeline.md), and one line in [wizard-game.md](../../meta/wizard-game.md) saying the engine is a host of the loop (`src/game/host.ts`), linking the host section.
- Record what L1 settled: the pass-through rows and the outcomes it confirmed.
- Report the `AGENTS.md` rows (editor notes: `interpreter.md`, which owns the reading terms, frame families, classification table, pair table, reader rules and host contract; tooling notes: classify a construction when the parser gains one).

#### H8a: decision 25, and contrary-to on a command

**Agent:** `proposal-worker`, `opus`, `high`.
**May edit:** `src/interpret/ask.ts`, `src/interpret/host.ts`, their tests (the L1 probe in `run.test.ts`), `docs/meta/interpreter.md` (question filters, pass-through, what the probe settled), `docs/grammar/intermediate/contrary-to.md`.

- Decision 25 (a): `questionFilters` drops every frame `passThrough` holds, plus MIRATIVE; flip the probe rows marked decision 25 and update the question-filter table in `interpreter.md`.
- Decision 26, contrary to a stance: one sentence and one example in contrary-to.md#contrary-to-stance saying `uom` + a stance on a command (or request, prohibition) is a reluctant or defiant order: the ordered event goes against the stance, and the act is unchanged (`y-command | v-walk | [contrary-to | th-plan-itinerary]`, `yol vowurol uom thagom.`, *Walk, even though it's not what I planned*). A `PASS_THROUGH` row citing it; the probe row flips to `ok`; the pass-through table in `interpreter.md` gains the row.

#### H8b: decision 26, the remark frames with no reading on a command

**Agent:** `proposal-worker`, `opus`, `high`.
**May edit:** the parser rule that rejects them (precedent: `uom themem`, rejected with an error citing contrary-to.md), its tests, `docs/grammar/intermediate/mirative.md`, `docs/grammar/intermediate/evidentiality.md`, `docs/grammar/*/knowing.md` (MAY), `docs/meta/unassigned-reserved.md`, `docs/meta/design-decisions.md`, the L1 probe, `docs/meta/interpreter.md`.

- First check with `node scripts/find.mjs` that no doc example has these frames on a command, request or prohibition; if one does, stop and report.
- MIRATIVE on a command, request or prohibition has no reading: a command is not news, so there is nothing to overturn (as for a bar). One line on mirative.md#mirative; the parser rejects it, citing it.
- REPORTED on a command is a relayed order (*I'm told you should walk*): the command is someone else's. One line and one example on evidentiality.md (beside the line that a command does not take a carried channel); it parses and stays `beyond` in the loop, so no `PASS_THROUGH` row.
- Every other channel (LIVE, MEMORY, PATTERN, CLUES, DEDUCED, INTUITION) and MAY on a command has no reading: a command is not a claim. One line on evidentiality.md and one on knowing.md#may; the parser rejects them, citing those lines.
- Each rejected spelling gets a **closed** entry in `unassigned-reserved.md` and a design-decisions entry (the reason: a command is not a claim or news; softening a command is firm-soft.md's job). Probe rows for the rejected forms become parse-outcome rows; `interpreter.md` says what the probe settled.
- Grammar edits are a few sentences per page: self-check against the doc-style checklist; `npm run build` must be clean.

**`AGENTS.md` rows (from C1), applied in the final commit:**
- Editor notes, after `wizard-game.md`: `| \`interpreter.md\` | Interpreter: reading terms, frame families, classification table, pair table, reader rules, matcher rules, host contract, the loop and its pass-through list. |`
- Tooling notes: `- **Interpreter rows:** when the parser gains a construction, classify it in the [classification table](docs/meta/interpreter.md#classification-table) from its owning grammar section in the same change; the coverage test fails on an id with no row.`

### Rule digest (pasted into every brief)

> - Read `AGENTS.md` first; it routes. This is tooling: never change a form, a reading, or what the parser accepts.
> - A **reading** is one clause: a **claim** (verb, roles, predicate, details), its **frames**, its **links**, and pointers back into the parse tree. A **frame** changes truth, force, or whose claim it is. A **detail** narrows without changing. A **label** is part of a word's own wording. The families, the table, the links, and the pair table are in `docs/meta/interpreter.md`; read it by outline and slice.
> - Classify from the owning grammar page, never from memory, and cite its anchor on the row. Work out what a sample means with `node scripts/parse.mjs --llm-prompt`; check forms with `node scripts/parse.mjs --check-lexicon '<a>' '<b>' …` in one batched call.
> - The reader copies the tree. It never re-derives a reading, binds a pronoun, defaults a missing field, or claims a scope order no rule states.
> - See a text's readings with `npm run -s reading -- '<text>'` (`--json` for every field). The shipped types are `src/interpret/types.ts`.
> - Coverage: every word of a doc example lands in exactly one place in its readings (`src/interpret/coverage.ts`); the ratchet `src/interpret/coverage-ratchet.json` is 0 / 0 and only goes down. A frame that keeps a word hosts the term built from it.
> - Scope rule (decided 2026-11-13): where no other rule orders two frames that both reach the whole clause, the earlier in the text covers the later. The grammar states it (`clause.md#which-covers-which`) and the resolve stage emits it (`ParseResult.resolve.scope`, `src/parse/scope.ts`); the reader copies the emitted order. A pair still unsettled goes in the reading's `unordered`, and no reader, consumer, or host ever picks an order for it.
> - A meaning the grammar pages do not state is an open decision: log the sentence, the options, and a recommendation with its confidence (high, medium or low), skip the item, and go on.
> - A command runs only when every frame on it, other than its force, is on the loop's pass-through list. Anything else is `beyond`. No host widens the list or runs a framed command itself.
> - No consumer and no host walks the parse tree for meaning. If a reading lacks what you need, stop and report; the fix is a table row, not a local walker.
> - Code never spells a root. Write test Ageben as morph gloss and spell it with gloss-inverse; name roots by concrete sense.
> - TypeScript, Node ≥ 24, tests with `tsx --test` beside the source (`*.test.ts`). Reuse `src/parse/`.
> - Never link to a file under `docs/proposals/`; name it in backticks.
> - Read slices: `npm run -s outline -- <file>` first, then the ranges you need.
> - Scripted edits go in a file under `tmp/`, never inline.
> - Verify with `npm run verify -- --allow-generate` at the end of the item (`--fast` inside it). Read only new error lines from `tmp/verify-last.log`.
> - Stop and report, without working around, when: a premise here no longer holds; later units would need a different design or order; skipping would leave later units on a broken state; or enough is skipped that the goals can't be met.
> - At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
> - Do not commit. Report in these fields: **done**, **files touched** (count), **table or pair rows changed** (count), **open decisions logged** (ids), **AGENTS.md lines**, **verify** line, **skips** with reasons, **left**, **inefficient**.

### Gates

- `npm run verify -- --baseline` at the start of each phase; `npm run verify -- --allow-generate` must show no new errors before each unit's commit.
- W2c and L1: `npm test` green, including the coverage test, and every walkthrough plays to its goal.
- Phase 5: every wizard walkthrough plays to its goal, and a clean `npm run build`, since the game's content lint and the site build read the engine.
- Final gate: a full `npm run verify` against an empty baseline.
- No style gate remains: no later unit changes prose under `docs/grammar/`. If a unit finds it must edit `docs/grammar/wizard.md`, the style gate applies to that phase.

### Commits

One per unit after its gate; the last carries the `AGENTS.md` rows and deletes this file. A unit whose code changes a reading lands in the same commit as the grammar edit that teaches it. Phase 5 has made thirteen so far, including H7 and the cut. Expected from here: four (W2c, L1, C1, the final one). Messages start `ageben-interpreter W2c:` (and so on), then `[skip-cd]`, then the co-author line. Only the orchestrator commits.

## Open decisions

All decisions (1–24) are decided; 21 (a), 23 (a) and 24 (a) on 2026-11-18, carried out by H7; numbers stay stable because commits cite them. L1 logged 25 and 26; 25 (a) and 26 decided 2026-11-18.

**25. Frames outside what is asked still filter a question.** **Decided (a), 2026-11-18.** `ask.ts` makes every frame on a question a filter except its ask force and a new-member binder (decision 18). So after `z-Alazun | b-Azozon | v-pay` (`zalazun bazozon varal.`), each of these answers *can't say*, though the bare question answers *yes*: a call, `y-Ahelan | y-question | z-Alazun | b-Azozon | v-pay` (`yahelan yel zalazun bazozon varal.`); a doubled act word, `y-question | y-question | …` (`yel yel …`); a speaker attitude, `y-question | th-hope | …` (`yel thuwuyom …`), or an interjection, `y-sleepy | y-question | …` (`yuzemel yel …`); MIRATIVE, `… | th-MIRATIVE` (`… themem`); a sake word on the clause, `… | th-physical-met-any-term` (`… thobatham`). Pages put each outside what is asked: speech-moves.md#vocative (a call does not change the claim), more-turn-words.md#doubled-act (the act stays the same), mirative.md#mirative (*stays yours, outside what is asked, as a speaker attitude does*), for-a-sake.md (*a sake word on the clause stays outside a question*). Tone marks are attitude frames too. The loop probe (`run.test.ts`) pins today's outcomes, marked decision 25.
- (a) A question filters on no frame a command passes through: `questionFilters` drops every frame `passThrough` holds (call, force, attitude, clause sake), plus MIRATIVE, which no command passes yet (decision 26).
- (b) Drop only the frames a page states for questions (call, attitude, MIRATIVE, sake); a doubled `yel yel` stays a filter.
- (c) Keep them all as filters; the host's verdict decides.

**Recommendation:** **(high)** (a). A learner who adds *Ahelan,* or *I hope* to a question asks the same thing and should get the same answer; one rule (outside the act is outside what is asked) matches the pages and keeps the command and question lists from drifting apart.

**26. Speaker-side frames on a command with no page saying whether they are part of the act.** **Decided 2026-11-18, revising L1's recommendation:** MIRATIVE has no reading on a command (rejected); REPORTED is a relayed order (`beyond`); every other channel and MAY have no reading on a command (rejected); contrary to a stance passes through. H8a and H8b carry it. Every frame on a command other than force, call, attitude, clause sake and a lone new-member noun is `beyond` today. For most (polarity, occasion, ability, phase, intention, NOTIONAL, residue, hinge, holder, a universal, a say word, a bar, a quote) the frame changes what is done or whose word it is, so `beyond` is right and needs no row. Three are the speaker's own remark on a claim, and no page says what they do on a command:
- MIRATIVE: `y-command | v-walk | th-MIRATIVE` (`yol vowurol themem.`). mirative.md#mirative settles questions only.
- A channel or MAY: `y-command | v-walk | th-REPORTED` (`yol vowurol thebam.`), `y-command | v-walk | th-MAY` (`yol vowurol thomam.`). evidentiality.md says a command does not take a carried channel *because it is not a claim*, but not what a channel written on a command means (a relayed order? a hedge?).
- Contrary to a stance: `y-command | v-walk | [contrary-to | th-plan-itinerary]` (`yol vowurol uom thagom.`). contrary-to.md#contrary-to-stance shows statements only.

Options, per frame: (a) pass through, with a grammar line on its page saying it stays outside the act and a `PASS_THROUGH` row citing it; (b) stay `beyond`, with a grammar line saying the frame has no reading on a command (or what it means there); (c) leave it unstated and `beyond`.

**Recommendation:** MIRATIVE (a), **(medium)**: the page already treats it as a speaker attitude in questions, and a learner's surprise should not block the act. A channel or MAY (b), **(medium)**: *walk, I hear* reads as a relayed order, which changes whose command it is, so the loop should not run it. Contrary to a stance (b), **(low)**: *walk, against my plan* may be a reluctant order or a report of one; until a page says, failing closed costs a learner one retry.

## Background

### Problem

Five tools need to know what an Ageben sentence says, not just how it parses, and each planned its own tree walker:

| Tool | Its walker | What it calls the result |
|------|-----------|--------------------------|
| Wizard game (built) | [read.ts](../../../src/game/read.ts) | `Act`: force and roles; everything else is `unsupported` |
| Mind map | `src/mind-map/` with a lift / fold / label table | badges, folded children, labels |
| Ageben Spec | `src/spec/ir.ts` | one IR record per sentence |
| Structural search | not planned yet | one record per sentence, grouped by how the clause is put forward |
| Agent permissions | not planned yet | one record per say word |

All five split a sentence the same way: a bare clause (who does what to whom), and the wrappers that change its truth, its force, or whose claim it is. Four of them then do the same things with it: keep it, match a question against what is kept, act on a command, and answer in Ageben. Five walkers would be five places for a grammar change to land, and five chances for two tools to disagree about what one sentence says.

### Goals

1. **One reader.** `ParseResult` in, one **reading** per clause out. No tool walks the parse tree for meaning again.
2. **One classification table**, owned by a meta note and checked complete against the construction registry, so new grammar cannot ship without a decision on how it is read.
3. **A log and a matcher.** Readings kept in order; a question, itself a reading, matched against them by structure.
4. **A host interface and a loop.** A tool supplies its context (what a noun refers to, what holds, what a verb does); the loop dispatches each sentence by its speech act.
5. **Replies in Ageben**, written as morph gloss, spelled by gloss-inverse, and parser-checked before anyone sees them.
6. **The wizard runs on it.** Every existing walkthrough still plays to its goal.
7. **Each consumer loses its walker.** The other four proposals are revised to build on this one.

### Non-goals

- **No new forms for programming.** No control flow, variables, or types are added to Ageben. In this plan, *execute* means: log a statement, answer a question, hand a bare command to the host. The grammar already has constructs that compose commands (a condition, a binder, clause sequence, try and fallback). What they do when run is one meaning for every host, so the interpreter will define it, in a bounded evaluator that always terminates; that is later work (`generic-ui.md`), and until it lands such a command is `beyond` ([the loop](#the-loop)).
- **No second grammar authority.** The reader copies what the tree says. It never re-derives a reading, and every table row cites the grammar section that owns it.
- **No inference by default.** The matcher is structural. Each inference step is a named switch that stays off until the user accepts it ([open decisions](#open-decisions)).
- **No paraphrase and no ranking.** A different root is a different claim.
- **No surfaces.** The map, the search box, the spec commands, and the permission hook stay in their own proposals. This one ships a library and a debugging command.
- **No English input.**

# Ageben interpreter: one reader and one runtime for the tools that act on meaning

**Status:** IN PROGRESS. Phases 1–4 done (2026-11-13 to 2026-11-18): the classification, the scope rule, the reader, the log and the matcher; their outcome is [interpreter.md](../../meta/interpreter.md), `src/interpret/` and [scope.ts](../../../src/parse/scope.ts). Phase 5 unit W1 done on 2026-11-18 (commits H1–H6, W1a, W1b): the host, the loop and replies (`src/interpret/host.ts`, `run.ts`, `reply.ts`), and the wizard running on them (`src/game/host.ts`; the game's `read.ts`, `answers.ts` and `reference.ts` deleted); every walkthrough plays to its goal. **Next: W2, in a fresh session.** Decisions the remaining units cite: the wizard's events live in the log, each with who witnessed it (4); the session re-parses a window the host sets, measured in W3 (5); a new-member phrase on a question is not a filter (18, decided 2026-11-18). Decided and landed 2026-11-18: decision 20 (a), a lone first-mention noun on a command acts on one such thing ([joins](/joins#new-member-in-a-command)), and in a statement says the claim holds of one such thing ([joins](/joins#new-member-in-a-statement)), which grounds the default verdict; decision 22, a call closed by a period reaches only its own turn ([past a period](/sentence-linkers#past-a-period)). Every earlier decision is on its grammar page or in the git log.

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

The contract is `Host<E>` in [host.ts](../../../src/interpret/host.ts), and `ask.ts` re-exports it; no consumer defines a second one. Members: `refer` (one, several, none), `referent`, `holds` (live state; `Held.answers` keyed by role letter or a blank's `at`, listed by `blankSites(claim)`, which covers role, detail, verb and what-kind blanks), `handler` (by verb root), `told` (returns effects, or a `Refusal` that makes the reading `refused`), `verdict`, `accepts` (narrows only), and `window` (the re-parse window, decision 5). Only `refer` is needed, and only for a command with roles.

### The loop

`createSession(host, tables, { speaker?, text? })` and `run(text, session) → TurnResult` (`outcome`, `beyond: BeyondPart[]`, `readings`, `effects`, `replies`), in [run.ts](../../../src/interpret/run.ts). Each reading is dispatched on its force:

| Force | Loop does |
|-------|-----------|
| statement (also *yes* / *no*, which imply `yal` / `yam`) | calls `told`; if nothing is refused, adds the turn to the log |
| said (a greeting or interjection alone) | logs it and calls `told`; no handler, no question |
| question | `ask`, then `holds`, then `verdict`; replies |
| command, prohibition | resolves the roles with `refer` (several gives `refused` with *which one?*), then runs `handler` |

**A framed command fails closed.** A command runs only when every frame on it, other than its force, passes `PASS_THROUGH` in `host.ts`: later act words, `call`, `attitude`, and a lone first-mention noun (`slot:newMember`, a single `thing` term with no number, no other binder on the command; [joins](/joins#new-member-in-a-command)). Any other frame makes the turn `beyond` and names it. No host widens the list. A whole-clause sake stays off it (open decision 21).

**The default verdict** counts a match as plain when every frame on its path passes `passThrough`, with no unsettled pair and no switch, except that `attitude` together with `slot:newMember` is not plain (no page settles that pair). It cites [vocative](/speech-moves#vocative) and [joins](/joins#new-member-in-a-statement).

**Turns.** The log closes each turn with a period before it joins the transcript. A call-only turn is its own reading (verb `-`). Any `beyond` reading in a turn means nothing in the turn runs and the log does not change.

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

Left for W2: `World.events`, the `told:` strings in `World.facts`, `World.mentioned` and `Entity.knows` become log entries, each with its speaker and who witnessed it (decision 4). Kept: world state, objects, handler bodies, quests, reachability, scene, recasts, gating, the turn log, build, lint. The gate is behaviour: every walkthrough plays to its goal, and the three failures stay distinct.

### Files

| Path | Holds |
|------|-------|
| `src/parse/scope.ts`, `carry.ts`; `src/interpret/` reader, log, matcher files | phases 1–4 (done) |
| `scripts/reading.mjs`, npm script `reading` | print a text's readings, `reading ask FILE QUERY`, `reading log FILE` (done) |
| `src/interpret/host.ts`, `run.ts`, `reply.ts` (+ tests) | phase 5 (done) |
| `src/game/host.ts` | the wizard host (done) |
| `docs/meta/interpreter.md` | terms, the table, links, pair table, reader rules; the host contract (C1) |

## Implementation plan

Phases 1–4 and phase 5's W1 are done. The rest of phase 5 is one orchestrator session, run through subagents; at its end the orchestrator applies the `AGENTS.md` rows and deletes this proposal.

### Phase 5 (rest): wizard knowledge, wizard check, the interpreter note

Order: H7 → W2 → W3 → C1. H7 and W2 touch disjoint files (`src/parse/`, `src/interpret/` and grammar vs `src/game/`) and may run in parallel.

#### H7: decision 23, an answer word or interjection closed by a period

**Agent:** `proposal-worker`, `opus`, `high`.
**May edit:** `docs/grammar/intermediate/sentence-linkers.md` (`#past-a-period`), `src/parse/**`, `src/interpret/**`, and their tests.

- Decided 2026-11-18 (23 a): *yes*, *no* or an interjection closed by a period is a whole move of its own, as a call is; the bare body after the period gets its own utterance and carries no polar link or interjection frame.
- Grammar: extend the call sentence H6 added to `#past-a-period` (*A call closed by a period reaches only its own turn …*) and its table row to cover *yes* / *no* and interjections. Self-check against `docs/meta/doc-style.md#checklist`.
- Code: H6 put the call case in `src/parse/sentence-parser.ts` `buildUtterances` (`afterCall`); widen that check. The parser accepts the same texts; the coverage ratchet stays 0 / 0. Tests: `yes.` then a bare body, and an interjection then a bare body, each give the body its own reading with no polar link or interjection frame; *yes* or an interjection before a body in one sentence is unchanged.
- Leave alone the edge case H6 kept: a call plus a written act word, then a sentence linker, stays one utterance (the linker keeps the act).

#### W2: wizard knowledge in the log

**Agent:** `proposal-worker`, `opus`, `high`.
**May edit:** `src/game/`**.

- Events, told facts, mentions, and what a character knows move to the log (decision 4).
- Drop the host's `told` rule that skips a call finding no one on a statement with a body: decision 22 removed its cause (a call no longer reaches past its period), so the call applies strictly. Check the deliver-book walkthrough still plays.
- Reply shapes the shared ones in `reply.ts` cover leave `generate.ts`; W1b moved `checkLine`, `whatIsItLikeDraft`, `listGroup` and `closed`.

#### W3: wizard check

**Agent:** `proposal-worker` (fresh), `opus`, `medium`.
**May edit:** `src/game/*.test.ts`, `docs/meta/wizard-game.md`.

- Play every walkthrough and 15 off-script lines per failure kind; confirm the three failures stay distinct and each `beyond` names its parts. Among the `beyond` lines, include commands under a condition and under a binder, and confirm the world does not change.
- Check the outcome changes W1 made, and report each as kept or as a finding: a command whose subject is not the one called is now `refused` (was `beyond`); *unknown* on a yes / no question is now an `ok` *can't say* reply (was a refusal); a lone greeting or interjection is force `said`.
- A walkthrough line that is a command with a frame off the pass-through list is a finding for the user (the frame joins the list by a grammar citation, or the line changes), never a host-side exception.
- Measure the turn time against the re-parse window and set the wizard's window (decision 5).
- Update [wizard-game.md](../../meta/wizard-game.md) to describe what exists.

#### C1: the interpreter note

**Agent:** `proposal-worker`, `opus`, `medium`.
**May edit:** `docs/meta/interpreter.md`, `docs/meta/parser-pipeline.md`.

- Finish `docs/meta/interpreter.md`: the host contract, the loop's dispatch and outcomes, the pass-through list with its conditions, the default verdict rule, and how to write a host (from [the host](#the-host) and [the loop](#the-loop) above, checked against `host.ts` / `run.ts`).
- Add the matcher rules phase 4 settled, from `match.ts` / `ask.ts`: a question is read after the log's window, so its pronouns bind through the resolver; a role missing from the outer claim is looked for in the claim's scope islands, with the island on the path; a query term matches a member of a target `u` list, with the list's frames on the path; a denied or excluded frame passes an equal filter, with the denial on the path; a `slot:newMember` frame on a question is not a filter (decision 18); holder filters compare the holder and its channel, never the ending; a number blank in a measure detail binds by key and number kind; the `widen` and `infer` switches, and that membership needs one list or a *respectively* pairing.
- Add to `parser-pipeline.md` (or `interpreter.md`, whichever owns resolve inputs) that `ParseOptions.speakers` gives one speaker per sentence and the carry record keeps one state per speaker; with none, a text is one speaker. Note that a call closed by a period gets its own utterance (`buildUtterances`, `afterCall`), and that the log closes each turn with a period.
- Add a pointer from [parser-pipeline.md](../../meta/parser-pipeline.md).
- Report the `AGENTS.md` rows (editor notes: `interpreter.md`, which owns the reading terms, frame families, classification table, pair table, reader rules and host contract; tooling notes: classify a construction when the parser gains one).

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
- W2: `npm test` green, including the coverage test.
- Phase 5: every wizard walkthrough plays to its goal, and a clean `npm run build`, since the game's content lint and the site build read the engine.
- Final gate: a full `npm run verify` against an empty baseline.
- No style gate remains: no later unit changes prose under `docs/grammar/`. If a unit finds it must edit `docs/grammar/wizard.md`, the style gate applies to that phase.

### Commits

One per unit after its gate; the last carries the `AGENTS.md` rows and deletes this file. A unit whose code changes a reading lands in the same commit as the grammar edit that teaches it. Phase 5 has made ten so far, including this consolidation. Expected from here: five (H7, W2, W3, C1, the final one). Messages start `ageben-interpreter W2:` (and so on), then `[skip-cd]`, then the co-author line. Only the orchestrator commits.

## Open decisions

Decisions 1–20, 22 and 23 are decided (23 (a) on 2026-11-18, carried out by H7); numbers stay stable because commits cite them.

**21. A whole-clause sake on a command.** A `/th/` sake word on the clause (met `tha`, unmet `thu`, prescription `the`, motive `tho`, with or without a `bl-` stake holder) is a stance frame, so a command carrying one is `beyond`. [Whose stake](/for-a-sake#whose-stake) settles only questions: the sake word stays outside the question, *your own remark on what the act serves*, so the question asks only about the act. The page also says every sake stance is the speaker's view (*the reason is yours*; *what the act serves is your stake, as you see it*).
- (a) Mirror the question rule with a sentence on that page: on a command, a sake word is your remark on what the act serves, and the command asks only for the act. The family joins the pass-through list, citing it.
- (b) A sake on a command also asks the listener to act so that it serves the sake; it stays off the list, since a host cannot check that.
- (c) Leave it unsettled and off the list until a sample needs it.

**Recommendation:** (medium) (a). The page already treats every sake word as the speaker's stance, never the actor's, and (a) is the same reading it gives a question; (b) would make a sake mean one thing on a command and another everywhere else.

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

# Ageben interpreter: one reader and one runtime for the tools that act on meaning

**Status:** IN PROGRESS. Phases 1 (classification) and 2 (the scope rule) done; their outcome is [interpreter.md](../../meta/interpreter.md) and [scope.ts](../../../src/parse/scope.ts). Phase 3 done on 2026-11-18, with decisions 10–17 implemented: the reader (`src/interpret/`), the `reading` CLI, a word-coverage check (every word in exactly one place; 0 missing / 0 doubled across 1364 doc examples), the parser records the reader needed, the carried-frame record (`ResolveInfo.carried`, [carry.ts](../../../src/parse/carry.ts); the reader fills one `carriedFrame` link per inherited channel, holder or NOTIONAL), and two audits (R4 22/30, R8 30/32; every failure since fixed). **Next: phase 4, in a fresh session.** Decided 2026-11-13: one shared backend serves the mind map, Ageben Spec, structural search, agent permissions, and the wizard game; the wizard engine is rebuilt on it. Decided 2026-11-13 (open decisions 2–5, 7): the matcher's inference switches are membership in a stated list and a compound matching on its head, plus universal to instance for closed `zual` only, each off by default and marked on its match (2); a role the question leaves out matches anything (3); the wizard's events live in the log, each with who witnessed it (4); the session re-parses a window the host sets, measured in phase 5 (5); a pair that text order can give only one way keeps that order wherever there is a form for the other reading (7). Decided 2026-11-14: the loop never runs a command that carries a frame it has no rule for (`beyond`); what composition constructs do when run is later work outside this plan (`generic-ui.md`). Decided 2026-11-17 and landed on grammar pages: decisions 7a, 8a, 9b ([stance joins](/verb-and-stance-joins#stance-join-reach), [holder](/holder#holder), [generalization](/usually-vs-must#generalization)); a phrase that brings in a new member follows text order everywhere, against binders and stance words, including `-l`/`-m` nouns, `-r` joins, and-lists and hook landmarks, but not fill-ask blanks, measure units or words inside a title ([joins](/joins#everything-ua), [which covers which](/clause#which-covers-which)); a call commutes with every frame ([vocative](/speech-moves#vocative)); a clause joined after the last nested dependent belongs to it ([nested dependents](/nested-dependents#nested-dependents)). Decided 2026-11-18 and landed: decisions 10 (c) and 11 (b), a free-standing tone mark after the start of a sentence colors only the words after it, up to the next free-standing mark, so two such marks commute ([tone marks](/tone-marks#tone-marks)). Decided 2026-11-18 and landed (decisions 12–17): a bare body after a period is a statement, and only a sentence linker keeps the prior act ([past a period](/sentence-linkers#past-a-period)); a carried frame covers what you claim, never your own stance: a WANT, PLAN or DECIDE sentence neither takes nor ends it, an attitude or feeling stance sits over the carried claim (the `carriedFrame` link's `coveredBy`; speech manner shares the attitude key and sits over it too), only the main clause's channel starts or ends a carry, MAY does not carry under a holder, and grounds inherit ([carry forward](/evidentiality#carry-forward), [holder](/holder#holder)); an ordinary feeling root on `/th/` is a speaker attitude ([speaker attitude](/feelings#speaker-attitude)); a `/th/` join over stance words is one stance list (`Reading.stanceLists`, `interpreter.md`).

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
7. **Numbers stay stems** in the reading; phase 4 adds their values for comparison.

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

```ts
type Host<E> = {
  refer(term: Term, ctx: ReferCtx<E>): Referent<E>;          // one, several, none
  holds?(claim: Claim, bound: Bound<E>): Held[];              // live state, for a host with more than a log
  handler?(root: string): Handler<E> | undefined;             // what a verb does, for a host that acts
  told?(reading: Reading, session: Session<E>): Effect[];     // what a statement does beyond being logged
  verdict?(question: Reading, matches: Match[], held: Held[]): Verdict;  // which frames count, and who wins
  accepts?(reading: Reading): string[];                       // parts this host cannot act on yet
};
```

Every member but `refer` is optional. A host with none of the rest is a pure reader's client.

### The loop

`run(text, session) → Turn`, where a `Turn` has an outcome, its readings, effects, and reply drafts. Each reading is dispatched on its `force` frame:

| Force | Loop does |
|-------|-----------|
| statement | adds it to the log, then calls `told` |
| question | `ask`, then `holds`, then `verdict`; replies |
| command, prohibition | resolves the roles with `refer`, then runs `handler` |

**A framed command fails closed.** A command or prohibition runs only when every frame on its reading, other than its force, is in the loop's **pass-through list**: the frame families that leave what the command does unchanged. The list is a typed const beside `CLASSES`, transcribed from the meta note, and each row cites the grammar section that says so. Any other frame (a condition, a binder, a stance, a holder, a family with no row) makes the turn `beyond` and names the frame, so *if the build fails, delete the branch* never deletes the branch. No host can add to the list: `accepts` narrows what a host takes, never widens it. A statement or a question is not affected; its frames are kept in the log or used as filters.

**Outcomes** are the wizard's three failures, made general, plus success: `parse` (did not parse), `beyond` (parsed, but `unread`, `unordered`, or `accepts` is non-empty, or no handler, or a command carries a frame outside the pass-through list), `refused` (the host or its verdict said no), `ok`. The three failures always stay distinct, and `beyond` always names its parts. Agent permissions' *fail closed* is this rule.

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

| Today | After phase 5 |
|-------|---------------|
| [read.ts](../../../src/game/read.ts) and the `Act`, `NounRef`, `PlaceRef`, `Force` types | deleted; the reader |
| [answers.ts](../../../src/game/answers.ts) (`truthOf`, `answerYesNo`, `answerFill`) | deleted; `ask` over the log plus the host's `holds` |
| [reference.ts](../../../src/game/reference.ts) | becomes the host's `refer` |
| the dispatch in [engine.ts](../../../src/game/engine.ts) (`perform`, `performAct`, `ask`, `state`, `command`, `prohibit`) | deleted; the loop |
| [voice.ts](../../../src/game/voice.ts) `checkLine`, and the yes / no / fill / *which one?* shapes in [generate.ts](../../../src/game/generate.ts) | move to `reply.ts` |
| `World.events`, the `told:` strings in `World.facts`, `World.mentioned`, `Entity.knows` | become log entries, each with its speaker and who witnessed it ([open decision 4](#open-decisions)) |
| world state (`place`, `props`, `state`), [objects.ts](../../../src/game/objects.ts), handler bodies in [verbs.ts](../../../src/game/verbs.ts), quests, reachability, scene, recasts, gating, the turn log, build, lint | kept; `Doing` takes a reading |

A kept file may still be rewritten when the host interface makes its shape wrong. The gate is behaviour, not diff size: every walkthrough plays to its goal, and the three failures stay distinct.

### Files

| Path | Holds |
|------|-------|
| `src/parse/scope.ts` | frame keys, pair rows, new-member and greeting tests, the order the resolve stage emits (done) |
| `src/interpret/types.ts`, `classes.ts`, `read.ts`, `tones.ts`, `coverage.ts`, `cli.ts`, `browser.ts`; `src/parse/carry.ts` | phase 3 (done) |
| `scripts/reading.mjs`, npm script `reading` | print a text's readings (done); later `reading ask`, `reading log` |
| `src/interpret/log.ts`, `match.ts`, `ask.ts`, `value.ts` | phase 4 |
| `src/interpret/host.ts`, `run.ts`, `reply.ts` | phase 5 |
| `docs/meta/interpreter.md` | terms, the table, links, pair table, reader rules; the host contract (C1) |

## Implementation plan

Phases 1–3 are done. Each remaining phase is one orchestrator session, run through subagents; at its end, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate).

### Phase 4: log and matcher

Order: M1 → M2 → M3 → M4. T2 and T4 of `ageben-spec.md` may start once this phase is committed.

#### M1: log, match, ask

**Agent:** `proposal-worker`, `opus`, `high`.
**May edit:** `src/interpret/`**.

- `log.ts`, `match.ts`, `ask.ts`, tests.
- Tests include the five-sentence *who paid Ana?* example from `structural-search.md`, written as morph gloss: four matches under four frame paths, and no match for the reversed roles.
- Builds on phase 3: frame paths include `carriedFrame` links (R7), a `slot:newMember` frame is a binder-family frame on the path, a `pairing` link's `partners` pair list members, and a term's `frames` hold tone marks. Two free-standing tone marks no longer fill `unordered` (decisions 10–11); a mark after the start puts a tone on each word it colors.
- Stance lists (R9, `interpreter.md` Terms): `Reading.stanceLists?: StanceList[]`, text order. `StanceList = { kind: "stanceList"; key; construction; anchor; join; values; members: (Frame | StanceList)[]; inner?: Frame[]; details? }`. `members` point at frames still in `frames`; `inner` is polarity for `u`/`ue`, binder for `ua`/`uo`, absent for structure series. A frame path through a stance list includes the list; what denying (`set-joins.md`, whole-list denial) or ranking (`rank-joins.md`) the list means is the matcher's to apply, with fixtures from `verb-and-stance-joins.md:154`, `:186`, `:246`.
- Carried frames sit under the speaker's own stances: a `carriedFrame` link's `coveredBy` lists the attitude frames over it; a frame path shows the attitude outside the channel.
- Speakers: [evidentiality](/evidentiality#carry-forward) says another speaker's reply neither takes nor ends a carried frame, but the parse has no speakers, so `ResolveInfo.carried` treats a text as one speaker. The log passes a speaker per utterance into resolve and the carry record honors it; fixture: a reply between a hearsay statement and a bare one.

#### M2: values and switches

**Agent:** `proposal-worker`, `opus`, `medium`.
**May edit:** `src/interpret/`**.

- `value.ts`: a number's and a measure's value from its `NumberStem`, for comparison; literal payload equality.
- The switches decided in open decision 2 (membership in a stated list; a compound matching on its head; universal to instance, for closed `zual` only), each off by default and marked on every match it produces.

#### M3: `ask` and `log` in the CLI

**Agent:** `proposal-worker`, `sonnet`, `medium`.
**May edit:** `scripts/reading.mjs`, `src/interpret/cli.ts`.

- `reading ask FILE QUERY` and `reading log FILE`, printing each match with its frame path and both sentences' glosses.

#### M4: matcher audit

**Agent:** `proposal-worker` (fresh), `opus`, `high`.
**May edit:** `src/interpret/*.test.ts`.

- 20 question / passage pairs built from doc examples.
- Every match must be explained by pointing at the two trees; no match across reversed roles; no frame path that misstates its sentence.
- Report failures; edit only test fixtures.

### Phase 5: host, loop, replies, and the wizard

Order: H1 → W1 → W2 → W3 → C1. The orchestrator applies the `AGENTS.md` rows, then deletes this proposal.

#### H1: host, loop, replies

**Agent:** `proposal-worker`, `opus`, `high`.
**May edit:** `src/interpret/`**.

- `host.ts`, `run.ts`, `reply.ts`.
- Tests against a toy host of three entities: each force, each outcome, each shared reply shape.
- The pass-through list ([the loop](#the-loop)): draft it from the frame families in `docs/meta/interpreter.md`, one row per family the owning grammar page shows leaves a command's action unchanged, with its anchor. A family the pages do not settle stays off the list and is logged as an open decision. Tests: a command under a condition, under a binder, and under a holder each give `beyond`, name the frame, and call no handler; a toy host whose `accepts` returns nothing still cannot run them.
- The re-parse window is a host setting (decision 5).

#### W1: the wizard host

**Agent:** `proposal-worker`, `opus`, `high`.
**May edit:** `src/game/`**, `docs/grammar/.vitepress/lib/wizard.data.ts`, `docs/grammar/.vitepress/components/WizardSandbox.vue`.

- `src/game/host.ts` (`refer`, `holds`, `handler`, `told`, `accepts`) over the kept world model.
- Delete the files and types in the left column of [the wizard on the interpreter](#the-wizard-on-the-interpreter).
- The engine's turn calls `run`; handlers take a reading.
- `src/parse/scope.test.ts` imports `fullGlossIndex` from `src/game/build.ts` (the plain gloss index cannot spell holders, sake words or numbers). Keep that export, or move it under `src/parse/` and update the import.

#### W2: wizard knowledge in the log

**Agent:** `proposal-worker`, `opus`, `high`.
**May edit:** `src/game/`**.

- Events, told facts, mentions, and what a character knows move to the log (decision 4).
- Reply shapes the shared ones cover leave `generate.ts`.

#### W3: wizard check

**Agent:** `proposal-worker` (fresh), `opus`, `medium`.
**May edit:** `src/game/*.test.ts`, `docs/meta/wizard-game.md`.

- Play every walkthrough and 15 off-script lines per failure kind; confirm the three failures stay distinct and each `beyond` names its parts. Among the `beyond` lines, include commands under a condition and under a binder, and confirm the world does not change.
- A walkthrough line that is a command with a frame off the pass-through list is a finding for the user (the frame joins the list by a grammar citation, or the line changes), never a host-side exception.
- Measure the turn time against the re-parse window and set the wizard's window (decision 5).
- Update [wizard-game.md](../../meta/wizard-game.md) to describe what exists.

#### C1: the interpreter note

**Agent:** `proposal-worker`, `opus`, `medium`.
**May edit:** `docs/meta/interpreter.md`, `docs/meta/parser-pipeline.md`.

- Finish `docs/meta/interpreter.md`: the host contract, the pass-through list, and how to write a host.
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
> - A meaning the grammar pages do not state is an open decision: log the sentence, the options, and a recommendation, skip the item, and go on.
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
- R2, M1, M2, H1, W1, W2: `npm test` green, including the coverage test from R2 on.
- Phase 5: every wizard walkthrough plays to its goal, and a clean `npm run build`, since the game's content lint and the site build read the engine.
- Final gate: a full `npm run verify` against an empty baseline.
- No style gate remains: no later unit changes prose under `docs/grammar/`. If a unit finds it must edit `docs/grammar/wizard.md`, the style gate applies to that phase.

### Commits

One per unit after its gate, and one per phase for the consolidated proposal; the last of those carries the `AGENTS.md` rows and deletes this file. A unit whose code changes a reading lands in the same commit as the grammar edit that teaches it. Phase 3 made thirty, including its two consolidations. Expected from here: phase 4 five, phase 5 six. Messages start `ageben-interpreter M1:` (and so on), then `[skip-cd]`, then the co-author line. Only the orchestrator commits.

## Open decisions

None open. Decisions 1–17 are decided (see Status); numbers stay stable because the body and commits cite them.

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

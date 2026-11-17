# Ageben interpreter: one reader and one runtime for the tools that act on meaning

**Status:** IN PROGRESS. Phase 1 (classification: R1a, R1b, and the pair-table audit) done 2026-11-13; its outcome is [interpreter.md](../../meta/interpreter.md). Phase 2 (the scope rule: S1 + S2, S3) done 2026-11-17: text order is scope order on [clause](/clause#which-covers-which), with its standing exceptions there and on the pages that own them; an attitude word, MIRATIVE and a sake word stay outside a question ([speaker attitude](/feelings#speaker-attitude), [it turns out](/mirative#mirative), [whose stake](/for-a-sake#whose-stake)); a binder keeps its reach on [joins](/joins#everything-ua) and takes its order from the clause rule; the resolve stage emits each clause's frame order ([scope.ts](../../../src/parse/scope.ts)). Next: phase 3, unit R2. Decided 2026-11-13: one shared backend serves the mind map, Ageben Spec, structural search, agent permissions, and the wizard game; the wizard engine is rebuilt on it, and existing wizard code may be discarded where the new backend makes its shape wrong. Decided 2026-11-13 (open decisions 2–5, and 7 in part, as recommended): the matcher's inference switches are membership in a stated list and a compound matching on its head, plus universal to instance for closed `zual` only, each off by default and marked on its match (2); a role the question leaves out matches anything (3); the wizard's events live in the log, each with who witnessed it, and a character's knowledge is the part of the log they saw or were told (4); the session re-parses a window the host sets, measured in phase 5 (5); a pair that text order can give only one way keeps that order wherever there is a form for the other reading (7). Decided 2026-11-14: the loop never runs a command that carries a frame it has no rule for; such a turn is `beyond` ([the loop](#the-loop), unit H1). Decided 2026-11-14: what the composition constructs the grammar already has (a condition or a binder on a command, clause sequence, try and fallback) do when run is the interpreter's to define, once, as a bounded evaluator in the loop; that is later work outside this plan, sketched in `generic-ui.md`, and the non-goal now bans only new forms.

**Related:** the parser's tree ([types.ts](../../../src/parse/types.ts)), [resolve.ts](../../../src/parse/resolve.ts), [ast-walk.ts](../../../src/parse/ast-walk.ts), the construction registry ([constructions.ts](../../../src/parse/constructions.ts)), [hook-jobs.ts](../../../src/parse/hook-jobs.ts), overlay kinds ([parser-pipeline.md](../../meta/parser-pipeline.md#overlay-kinds)), gloss to Ageben ([gloss-inverse.ts](../../../src/parse/gloss-inverse.ts), [glosses.md](../../meta/glosses.md#round-trip)), the wizard engine ([src/game/](../../../src/game/), [wizard-game.md](../../meta/wizard-game.md)), [read-ageben.md](../../meta/procedures/read-ageben.md). Consumers: `mind-map-view.md`, `ageben-spec.md`, `structural-search.md`, `agent-tool-permissions.md`, `wizard-adventure.md`.

**Depends on:** none. **Order:** phase 3 lands before `mind-map-view.md` and before unit T1 of `ageben-spec.md`; phase 4 before that proposal's T2 and T4. Its pilot units (P1, P2) wait for nothing here.

**Design authority:** none from here. Phase 2 put the scope rule on the grammar pages and in the parser's resolve stage (Status). Every remaining unit is tooling: no form or reading changes, and the parser's accept/reject behavior does not change. Where the reader needs a meaning the grammar pages do not state, that is an open decision for the user, never a rule written into code.

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

```ts
type Reading = {
  id: ReadingId;                       // text id, sentence index, clause path
  source: { utterance: number; body: number; clause: Clause };  // into the ParseResult; never a copy
  frames: Frame[];                     // text order (see frame order)
  order: FrameOrder[];                 // which frame scopes over which, each with the rule that says so
  unordered: [Frame, Frame][];         // pairs that do not commute and that no rule orders
  claim: Claim;
  links: Link[];
  unread: Unread[];                    // constructions the reader could not place
};

type Claim = {
  verb?: Term;
  roles: Partial<Record<"z" | "d" | "b", Term>>;
  predicate: Term[];                   // clause-level /ɡ/: what the subject is
  details: Detail[];
};

type Frame = {
  family: FrameFamily;
  construction: string;                // registry id, so every frame names its grammar section
  words: LexWord[];
  values: Record<string, string>;      // the word's own typed fields, copied (a say word: reach, part, answer, ending)
  party?: Term;                        // whose it is: a holder, the one with the say
  content?: Reading[];                 // the clause it embeds: a condition, a quote
};

type Term =
  | { kind: "thing"; head: LexWord; root: string; named: boolean; details: Detail[] }
  | { kind: "speaker" | "listener"; word: LexWord }
  | { kind: "pronoun"; word: LexWord; bind: AnaphorBind; antecedent?: Term }
  | { kind: "blank"; word: LexWord }
  | { kind: "literal"; word: LexWord; payload: string }
  | { kind: "number"; word: LexWord; stem: NumberStem }
  | { kind: "list"; join: LexWord; members: Term[]; shared: SharedRecord[]; values: Record<string, string> }
  | { kind: "clause"; reading: Reading };
```

`Detail` has the shape of `Frame` without `party`. These types are the contract; unit R2 may add fields the classification shows are needed, and no consumer may add its own.

The frame families, the classification table, the links, the scope statements, and the pair table are in [interpreter.md](../../meta/interpreter.md). Phase 1 added two link kinds the types above lack: a **grounds** link (a hinge's condition or a channel's grounds in the next sentence, `blarl`) and a **carried-frame** link (a channel, holder, NOTIONAL or dated offset carried over later bare sentences). R2 adds them to `Link`.

### The classification table

One typed const, `CLASSES`, transcribed from the meta note `docs/meta/interpreter.md`. Each row has a key, a class, and the owning grammar anchor.

- **Keys** are what the reader switches on: `Unit.kind`, `HookJob`, `LexReading`, overlay `kind`, `XFamily`, join series, and resolve record type.
- **Classes:** `frame:<family>`, `detail:<kind>`, `label`, `link`, or `structure` (punctuation and other rows with no meaning of their own).
- **Coverage test.** A function maps every id in `constructionRegistry()` to a table key. An id that maps to no key fails `npm test`. A construction added to the parser therefore cannot land until someone classifies it, which extends the rule that parser changes ship with grammar changes.
- **Unknown is a frame.** A construction the reader meets with no row becomes an `unknown` frame and an `unread` entry. Showing too much clutters; hiding a stance misstates.

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

    Text order is a rule for every pair no other rule orders ([clause](/clause#which-covers-which)), and the resolve stage emits each clause's orders on `ParseResult.resolve.scope` ([scope.ts](../../../src/parse/scope.ts)); the reader copies them. A pair still unsettled (open decision 8) goes in `unordered`. The reader never picks, and neither does any consumer or host: a reading with a non-empty `unordered` is `beyond` in the loop, is marked as such in a match, and is shown as unsettled by a consumer with no loop. The parser's ambiguity check cannot see such a pair, because it reports competing trees and here there is one tree.
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
| `src/parse/scope.ts` | frame keys, pair rows, and the order the resolve stage emits (phase 2, done) |
| `src/interpret/types.ts`, `classes.ts`, `read.ts` | phase 3 |
| `src/interpret/log.ts`, `match.ts`, `ask.ts`, `value.ts` | phase 4 |
| `src/interpret/host.ts`, `run.ts`, `reply.ts` | phase 5 |
| `src/interpret/browser.ts` | browser entry, as [browser.ts](../../../src/parse/browser.ts) is for the parser |
| `scripts/reading.mjs`, npm script `reading` | print a text's readings; later `reading ask FILE QUERY` |
| `docs/meta/interpreter.md` | terms, the table, reader rules, the host contract |

## Implementation plan

Five phases, each one orchestrator session, run through subagents. Phases 1 (classification) and 2 (the scope rule) are done. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

### Phase 3: the reader

Order: R2 → R3 → R4, in sequence. R4 failures go to a fresh R2-style subagent with the failing sentences and the diff stat. `mind-map-view.md` and T1 of `ageben-spec.md` may start once this phase is committed.

#### R2: the reader

**Agent:** `proposal-worker`, `opus`, `high`.
**May edit:** `src/interpret/`**.

- `src/interpret/types.ts`, `classes.ts` (transcribed from the note; the frame rows import `src/parse/scope.ts` rather than copy it), `read.ts`, `browser.ts`, tests.
- `order` is copied from the resolve stage's record; the grounds and carried-frame links are added to `Link`.
- **The record (phase 2).** `ParseResult.resolve.scope?: ClauseScope[]`, present only when some clause has a whole-clause frame; types in `src/parse/scope.ts`. `ClauseScope = { clause; utteranceIndex; frames: ScopeFrame[] (text order); order: ScopeOrder[]; unordered: ScopeUnordered[] }`, one per body clause, clause-join member (each member also gets the turn's edge frames: act word, interjections) and dependent (no edge frames). `ScopeFrame = { family; key; word: LexWord; member?: "channel" | "may" | "number" | "residue" | "former"; holderHost?: true }`; a holder word gives two frames, the holder and its host stance or NOTIONAL (`holderHost`), holder over host by word shape. `ScopeOrder = { over; under; kind: "rule" | "wordShape"; anchors }`; `ScopeUnordered = { frames: [a, b]; anchors }`; a pair that commutes records nothing. Data: `FRAME_KEYS` (key → family, reach, anchor) and `PAIR_ROWS` (the table's rows, split by member where the note does, plus binder × binder and intention × intention), with four sub-keys that are not literal table keys: `lexReading:sake:g`, `lexReading:restrictor:w`, `lexReading:number:th`, `joinSeries:u:standalone`. `resolve(result, tables?)` takes the tables to find a holder's host.
- **Frames the record leaves out.** It emits no frame for tone marks (`enforceTones` strips them before the tree), vocatives, greetings, `reading:frequencyScale`, `bareQuestion`, `feelingStake`, or the binder phrase that brings in a new member (no classification key names it); force comes only from the act word, and a `/th/` `u` join right after a `/th/` word is that list's join and never pairs. Where the note classes one of these as a whole-clause frame, report it; the fix is a row in `scope.ts`, not a walker in the reader.
- Tests:
  - one fixture per frame family and one per pair kind, written as morph gloss and spelled by gloss-inverse
  - the coverage test against `constructionRegistry()` (the note's *Construction ids* section is its list; `tmp/r1a-note.ts` generated it)
  - a test that every two families that can share a clause have a pair-table row
  - a sweep that reads every doc example ([llm-examples.ts](../../../src/parse/llm-examples.ts)) without throwing and writes to `tmp/` the `unread` counts by construction id and the doc examples that hold a pair still unsettled, by pair

#### R3: the `reading` CLI

**Agent:** `proposal-worker`, `sonnet`, `medium`.
**May edit:** `scripts/reading.mjs`, `src/interpret/cli.ts`, `package.json`, `docs/meta/procedures/read-ageben.md`.

- `scripts/reading.mjs` and the `reading` npm script: compact text by default, `--json`.
- One paragraph in [read-ageben.md](../../meta/procedures/read-ageben.md) saying when to use it.

#### R4: reader audit

**Agent:** `proposal-worker` (fresh), `opus`, `high`.
**May edit:** `src/interpret/read.test.ts`.

- 30 doc examples spread across the frame families (`node scripts/find.mjs` by construction). Compare each reading with the sentence's `--llm-prompt` meaning.
- Fail any reading where something that changes truth, force, or owner is a detail, where a frame order is claimed with no rule behind it, where a pair the table calls *commutes* gives two different meanings, or where a stated field is missing.
- Report failures; edit only test fixtures.

### Phase 4: log and matcher

Order: M1 → M2 → M3 → M4. T2 and T4 of `ageben-spec.md` may start once this phase is committed.

#### M1: log, match, ask

**Agent:** `proposal-worker`, `opus`, `high`.
**May edit:** `src/interpret/`**.

- `log.ts`, `match.ts`, `ask.ts`, tests.
- Tests include the five-sentence *who paid Ana?* example from `structural-search.md`, written as morph gloss: four matches under four frame paths, and no match for the reversed roles.

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

> - Read `AGENTS.md` first; it routes. Every unit is tooling: never change a form, a reading, or what the parser accepts.
> - A **reading** is one clause: a **claim** (verb, roles, predicate, details), its **frames**, its **links**, and pointers back into the parse tree. A **frame** changes truth, force, or whose claim it is. A **detail** narrows without changing. A **label** is part of a word's own wording. The families, the table, the links, and the pair table are in `docs/meta/interpreter.md`; read it by outline and slice.
> - Classify from the owning grammar page, never from memory, and cite its anchor on the row. Work out what a sample means with `node scripts/parse.mjs --llm-prompt`; check forms with `node scripts/parse.mjs --check-lexicon '<a>' '<b>' …` in one batched call.
> - The reader copies the tree. It never re-derives a reading, binds a pronoun, defaults a missing field, or claims a scope order no rule states.
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
- No style gate: no remaining unit changes prose under `docs/grammar/`. If a unit finds it must edit `docs/grammar/wizard.md`, the style gate applies to that phase.

### Commits

One per unit after its gate, and one per phase for the consolidated proposal; the last of those carries the `AGENTS.md` rows and deletes this file. Phase 1 made five, phase 2 three. Expected from here: phase 3 four, phase 4 five, phase 5 six. Messages start `ageben-interpreter R2:` (and so on), then `[skip-cd]`, then the co-author line. Only the orchestrator commits.

## Open decisions

None blocks phase 3. Open decisions 1–6 are decided, and 7 in part; see Status. Numbers stay stable because the body cites them.

7. **Pairs that text order can give only one way, with no form for the other reading.** Some frames have a fixed position (a hinge with `blarl` is kept last; a force word comes first), so text order allows only one of the two orders. Where a form for the other reading exists, the pair keeps its order (Status). Phase 2 found one group with none, below; the pair table records its rows as fixed by a rule, since every sayable sentence has one order, so it blocks nothing. Options: (a) keep the one order, and leave the other reading unsayable for now; (b) let the frame move.
   Phase 2 found a form for the other reading of every hinge pair (a hinge + `blarth` put first, `stand-in-vowels.md#stand-in-back`) and of the inside readings of force × attitude, mirative and sake (the hope or the surprise as the verb; the act first, then a question about `zarth`), so those pairs keep their order. One group has none:
   - **`polarity` (a standalone `/th/` join) × a `/th/` frame** (`stance`, `intention`, `sake`, `attitude`, `notional`, `mirative`, `contrary`, `hinge`). `zazozon vowurol thul thomam.` is *no judgment on whether possibly Azozon walks* (the join covers MAY). The other reading, *possibly (Azozon walks, no judgment)*, is unsayable: in `thomam zazozon vowurol thul.` MAY is the join's item and nests under it (`verb-and-stance-joins.md#standalone-stance-joins`). Looked for: a `/w/` form (none on a clause), a carried frame (a stance carries only to later sentences, and the join is per sentence), a second sentence (it would take the stance off the no-judgment). The `/h/` frames (`ability`, `phase`, `residue`, `occasion`) are not items, so they take either order. The pair table records these rows as fixed by a rule, since every sayable sentence has one order. **Recommendation:** (a). The missing reading puts a stance or a feeling over your own refusal to judge (*possibly I take no view*, *hopefully I take no view*), which a learner rarely needs and which half contradicts itself; letting a `/th/` word before the join escape it would break how the join finds its items.

8. **Whose no-judgment a standalone join is under a holder** (`polarity` × `holder`, the one pair the table leaves unsettled; the resolve stage emits it in `unordered`). `holder.md#holder` says the holder covers its clause, but speech moves and speaker attitudes stay yours, and no page says which a standalone `/th/` join (`thul`) is. `zazozon vowurol thul thevumazozon.` (z-Azozon | v-walk | th-not | th-MEMORY-Azozon) reads either *as Azozon remembers it, Azozon walks, and Azozon takes no view on it* or *as Azozon remembers it, Azozon walks; I take no view on it*. Options: (a) the holder's, as a stance word is; (b) the speaker's, as a speech move is. **Recommendation:** (a). The join sits in the `/th/` stance series and judges the claim, and the holder's exceptions are a closed list of speech moves and attitudes; a learner who means their own no-view can say it in a sentence of their own.

9. **A channel after a binder on a generalization.** `usually-vs-must.md#generalization` says a channel on a clause with a universal fence or restrictor covers the whole generalization, wherever it sits (`zual gogozel vezuvel thubol …`, *going by a well-established pattern, every cat sleeps …*). Phase 2 kept this as a standing exception (the pair table's `binder` × `stance` row, channel only; MAY and a stance number follow text order). It departs from the 2026-11-13 decision that a binder takes its order against a frame word from the clause rule. Options: (a) keep the exception; (b) retire it, so a channel after the binder speaks of each instance, and the whole-generalization reading needs the channel first. **Recommendation:** (a). How you know a general claim is the reading a learner wants, the per-instance reading (*for each cat, going by a pattern, it sleeps*) is rarely meant, and the page's samples put the binder phrase first as the subject, so (b) would rewrite them all.

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

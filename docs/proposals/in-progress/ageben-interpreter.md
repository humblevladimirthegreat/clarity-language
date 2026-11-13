# Ageben interpreter: one reader and one runtime for the tools that act on meaning

**Status:** IN PROGRESS. Phase 1 (classification: R1a, R1b, and the pair-table audit) done 2026-11-13; its outcome is [interpreter.md](../../meta/interpreter.md). Next: phase 2, unit S1. Decided 2026-11-13: one shared backend serves the mind map, Ageben Spec, structural search, agent permissions, and the wizard game; the wizard engine is rebuilt on it, and existing wizard code may be discarded where the new backend makes its shape wrong. Decided 2026-11-13 (open decision 1): **text order is scope order**: where no other rule orders two frames that both reach the whole clause, the earlier covers the later; this covers a binder against any frame word. An attitude word stays outside a question (it is the speaker's, not what is asked). The grammar and the parser carry both (phase 2); the reader only copies the order.

**Related:** the parser's tree ([types.ts](../../../src/parse/types.ts)), [resolve.ts](../../../src/parse/resolve.ts), [ast-walk.ts](../../../src/parse/ast-walk.ts), the construction registry ([constructions.ts](../../../src/parse/constructions.ts)), [hook-jobs.ts](../../../src/parse/hook-jobs.ts), overlay kinds ([parser-pipeline.md](../../meta/parser-pipeline.md#overlay-kinds)), gloss to Ageben ([gloss-inverse.ts](../../../src/parse/gloss-inverse.ts), [glosses.md](../../meta/glosses.md#round-trip)), the wizard engine ([src/game/](../../../src/game/), [wizard-game.md](../../meta/wizard-game.md)), [read-ageben.md](../../meta/procedures/read-ageben.md). Consumers: `mind-map-view.md`, `ageben-spec.md`, `structural-search.md`, `agent-tool-permissions.md`, `wizard-adventure.md`.

**Depends on:** none. **Order:** phase 3 lands before `mind-map-view.md` and before unit T1 of `ageben-spec.md`; phase 4 before that proposal's T2 and T4. Its pilot units (P1, P2) wait for nothing here.

**Design authority:** phase 2 only: units S1 and S2 put the decided scope rule (Status) on its grammar pages and in the parser's resolve stage, and S1 adds to `feelings.md` that an attitude word stays outside a question. Every other unit is tooling: no form or reading changes, and the parser's accept/reject behavior does not change. Where the reader needs a meaning the grammar pages do not state, that is an open decision for the user, never a rule written into code.

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

   The decided rule (Status) makes text order a rule for every pair no other rule orders, so after phase 2 the resolve stage emits each order and the reader copies it as *fixed by a rule*. A pair still unsettled after that (open decisions 6 and 7) goes in `unordered`. The reader never picks, and neither does any consumer or host: a reading with a non-empty `unordered` is `beyond` in the loop, is marked as such in a match, and is shown as unsettled by a consumer with no loop. The parser's ambiguity check cannot see such a pair, because it reports competing trees and here there is one tree.
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
- **Widening** (compound to its head) and **inference** (universal to instance, membership in a stated list) are switches, off by default, and every match found through one says so.

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

**Outcomes** are the wizard's three failures, made general, plus success: `parse` (did not parse), `beyond` (parsed, but `unread`, `unordered`, or `accepts` is non-empty, or no handler), `refused` (the host or its verdict said no), `ok`. The three failures always stay distinct, and `beyond` always names its parts. Agent permissions' *fail closed* is this rule.

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
| `src/interpret/types.ts`, `classes.ts`, `read.ts` | phase 3 |
| `src/interpret/log.ts`, `match.ts`, `ask.ts`, `value.ts` | phase 4 |
| `src/interpret/host.ts`, `run.ts`, `reply.ts` | phase 5 |
| `src/interpret/browser.ts` | browser entry, as [browser.ts](../../../src/parse/browser.ts) is for the parser |
| `scripts/reading.mjs`, npm script `reading` | print a text's readings; later `reading ask FILE QUERY` |
| `docs/meta/interpreter.md` | terms, the table, reader rules, the host contract |

## Implementation plan

Five phases, each one orchestrator session, run through subagents. Phase 1 (classification) is done. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

### Phase 2: the scope rule

| ID | Items | Agent | `model` | effort | May edit |
|----|-------|-------|---------|--------|----------|
| S1 | **Grammar.** On [clause](/clause), next to [stance](/clause#stance-th), state the decided rule (Status): when two words that each cover the whole clause share it, the earlier covers the later, with a sample of each order; name or link the standing exceptions (the pair table's *fixed by a rule* and *fixed by word shape* rows). Rewrite the sentences that now say such a word means the same wherever it sits: [can and can't](/can-and-cant#intention-adverbs), [intention](/intention) (PLAN), [try](/try), [residue and former](/residue-and-former) (RESIDUE, FORMER), and any more that `grep -rn -i 'wherever it sits\|anywhere in the sentence\|meaning stays the same' docs/grammar` finds. An ordinary adverb's free placement stays. Broaden the binder sentence in [joins](/joins#everything-ua): a frame word after a binder is inside it, one before covers it. Add to [speaker attitude](/feelings#speaker-attitude) that an attitude word stays outside a question. Check the Practice sections on each edited page for an answer the rule changes. **Then the note:** move every pair-table row the rule settles to *fixed by a rule*, citing the new anchor (force × attitude cites `feelings.md`), and recount. This settles the binder rows phase 1 disagreed on (binder × intention, ability, say, residue). Leave force × sake and force × mirative (open decision 6). List each pair whose forms have fixed positions, so that text order allows only one of its orders (a hinge with `blarl` kept last, a force word first), under open decision 7, with how the other reading can be said, and leave it unsettled. Rows in [unassigned-reserved.md](../../meta/unassigned-reserved.md) and [design-decisions.md](../../meta/design-decisions.md) only if a form loses its reading | `proposal-worker` | `opus` | `high` | the grammar pages named, `docs/meta/interpreter.md`, `docs/meta/design-decisions.md`, `docs/meta/unassigned-reserved.md`, this file's open decisions 6 and 7 |
| S2 | **Parser.** Transcribe the frame part of the classification table (key → family, and whether it reaches the whole clause) into `src/parse/scope.ts`. In the resolve stage, emit for each clause the order of every two whole-clause frames: the earlier over the later, except where a pair-table row orders them otherwise (copied as data, with its anchor; never re-derived), and no order for a pair still unsettled. Expose it on the resolved tree, each order with the anchor of its rule. Accept/reject unchanged unless S1 took a form's reading away. Tests beside the source. Then `grammar-check` per [read-ageben.md](../../meta/procedures/read-ageben.md). Report the record's shape for R2 | `proposal-worker` | `opus` | `high` | `src/parse/**` |
| S3 | Style review of the `npm run changed-sections -- <rev>` list, where `<rev>` is the commit before S1 | `style-editor` (fresh) | `opus` | `high` | the listed sections |

Order: S1 → S2 → S3, in sequence. S1 and S2 land in **one commit**, since parser changes ship with the grammar edit that teaches them. If S1 changes `say-*.md` or `english.md`, the recall gate applies. **Cut:** after S3; the user decides open decisions 6 and 7 before phase 3 if S1 logged pairs there.

### Phase 3: the reader

| ID | Items | Agent | `model` | effort | May edit |
|----|-------|-------|---------|--------|----------|
| R2 | `src/interpret/types.ts`, `classes.ts` (transcribed from the note; the frame rows import `src/parse/scope.ts` rather than copy it), `read.ts`, `browser.ts`, tests. `order` is copied from the resolve stage's record; the grounds and carried-frame links are added to `Link`. Tests: one fixture per frame family and one per pair kind, written as morph gloss and spelled by gloss-inverse; the coverage test against `constructionRegistry()` (the note's *Construction ids* section is its list; `tmp/r1a-note.ts` generated it); a test that every two families that can share a clause have a pair-table row; a sweep that reads every doc example ([llm-examples.ts](../../../src/parse/llm-examples.ts)) without throwing and writes to `tmp/` the `unread` counts by construction id and the doc examples that hold a pair still unsettled, by pair | `proposal-worker` | `opus` | `high` | `src/interpret/**` |
| R3 | `scripts/reading.mjs` and the `reading` npm script: compact text by default, `--json`. One paragraph in [read-ageben.md](../../meta/procedures/read-ageben.md) saying when to use it | `proposal-worker` | `sonnet` | `medium` | `scripts/reading.mjs`, `src/interpret/cli.ts`, `package.json`, `docs/meta/procedures/read-ageben.md` |
| R4 | Fresh-context audit: 30 doc examples spread across the frame families (`node scripts/find.mjs` by construction). Compare each reading with the sentence's `--llm-prompt` meaning. Fail any reading where something that changes truth, force, or owner is a detail, where a frame order is claimed with no rule behind it, where a pair the table calls *commutes* gives two different meanings, or where a stated field is missing. Report failures; edit only test fixtures | `proposal-worker` (fresh) | `opus` | `high` | `src/interpret/read.test.ts` |

Order: R2 → R3 → R4, in sequence. R4 failures go to a fresh R2-style subagent with the failing sentences and the diff stat. `mind-map-view.md` and T1 of `ageben-spec.md` may start once this phase is committed.

### Phase 4: log and matcher

| ID | Items | Agent | `model` | effort | May edit |
|----|-------|-------|---------|--------|----------|
| M1 | `log.ts`, `match.ts`, `ask.ts`, tests. Tests include the five-sentence *who paid Ana?* example from `structural-search.md`, written as morph gloss: four matches under four frame paths, and no match for the reversed roles | `proposal-worker` | `opus` | `high` | `src/interpret/**` |
| M2 | `value.ts`: a number's and a measure's value from its `NumberStem`, for comparison; literal payload equality. The inference and widening switches the user accepted (open decision 2), each off by default and marked on every match it produces | `proposal-worker` | `opus` | `medium` | `src/interpret/**` |
| M3 | `reading ask FILE QUERY` and `reading log FILE` in the CLI, printing each match with its frame path and both sentences' glosses | `proposal-worker` | `sonnet` | `medium` | `scripts/reading.mjs`, `src/interpret/cli.ts` |
| M4 | Fresh-context audit: 20 question / passage pairs built from doc examples. Every match must be explained by pointing at the two trees; no match across reversed roles; no frame path that misstates its sentence. Report failures; edit only test fixtures | `proposal-worker` (fresh) | `opus` | `high` | `src/interpret/*.test.ts` |

Order: M1 → M2 → M3 → M4. T2 and T4 of `ageben-spec.md` may start once this phase is committed.

### Phase 5: host, loop, replies, and the wizard

| ID | Items | Agent | `model` | effort | May edit |
|----|-------|-------|---------|--------|----------|
| H1 | `host.ts`, `run.ts`, `reply.ts`, tests against a toy host of three entities: each force, each outcome, each shared reply shape | `proposal-worker` | `opus` | `high` | `src/interpret/**` |
| W1 | The wizard host: `src/game/host.ts` (`refer`, `holds`, `handler`, `told`, `accepts`) over the kept world model. Delete the files and types in the left column of [the wizard on the interpreter](#the-wizard-on-the-interpreter); the engine's turn calls `run`; handlers take a reading | `proposal-worker` | `opus` | `high` | `src/game/**`, `docs/grammar/.vitepress/lib/wizard.data.ts`, `docs/grammar/.vitepress/components/WizardSandbox.vue` |
| W2 | Events, told facts, mentions, and what a character knows move to the log, if open decision 4 is accepted. Reply shapes the shared ones cover leave `generate.ts` | `proposal-worker` | `opus` | `high` | `src/game/**` |
| W3 | Fresh-context check: play every walkthrough and 15 off-script lines per failure kind; confirm the three failures stay distinct and each `beyond` names its parts. Update [wizard-game.md](../../meta/wizard-game.md) to describe what exists | `proposal-worker` (fresh) | `opus` | `medium` | `src/game/*.test.ts`, `docs/meta/wizard-game.md` |
| C1 | Finish `docs/meta/interpreter.md`: the host contract and how to write a host. Add a pointer from [parser-pipeline.md](../../meta/parser-pipeline.md). Report the `AGENTS.md` rows (editor notes: `interpreter.md`, which owns the reading terms, frame families, classification table, pair table, reader rules and host contract; tooling notes: classify a construction when the parser gains one) | `proposal-worker` | `opus` | `medium` | `docs/meta/interpreter.md`, `docs/meta/parser-pipeline.md` |

Order: H1 → W1 → W2 → W3 → C1. The orchestrator applies the `AGENTS.md` rows, then deletes this proposal.

### Rule digest (pasted into every brief)

> - Read `AGENTS.md` first; it routes. Outside S1 and S2 this is tooling: never change a form, a reading, or what the parser accepts.
> - A **reading** is one clause: a **claim** (verb, roles, predicate, details), its **frames**, its **links**, and pointers back into the parse tree. A **frame** changes truth, force, or whose claim it is. A **detail** narrows without changing. A **label** is part of a word's own wording. The families, the table, the links, and the pair table are in `docs/meta/interpreter.md`; read it by outline and slice.
> - Classify from the owning grammar page, never from memory, and cite its anchor on the row. Work out what a sample means with `node scripts/parse.mjs --llm-prompt`; check forms with `node scripts/parse.mjs --check-lexicon '<a>' '<b>' …` in one batched call.
> - The reader copies the tree. It never re-derives a reading, binds a pronoun, defaults a missing field, or claims a scope order no rule states.
> - Scope rule (decided 2026-11-13): where no other rule orders two frames that both reach the whole clause, the earlier in the text covers the later. The grammar states it and the resolve stage emits it (phase 2); the reader copies the emitted order. A pair still unsettled goes in the reading's `unordered`, and no reader, consumer, or host ever picks an order for it.
> - A meaning the grammar pages do not state is an open decision: log the sentence, the options, and a recommendation, skip the item, and go on.
> - No consumer and no host walks the parse tree for meaning. If a reading lacks what you need, stop and report; the fix is a table row, not a local walker.
> - Code never spells a root. Write test Ageben as morph gloss and spell it with gloss-inverse; name roots by concrete sense.
> - TypeScript, Node ≥ 24, tests with `tsx --test` beside the source (`*.test.ts`). Reuse `src/parse/`.
> - S1 edits teaching prose: follow `docs/meta/grammar-docs.md` and `docs/meta/doc-style.md`; Ageben in code spans must parse.
> - Never link to a file under `docs/proposals/`; name it in backticks.
> - Read slices: `npm run -s outline -- <file>` first, then the ranges you need.
> - Scripted edits go in a file under `tmp/`, never inline.
> - Verify with `npm run verify -- --allow-generate` at the end of the item (`--fast` inside it). Read only new error lines from `tmp/verify-last.log`.
> - Stop and report, without working around, when: a premise here no longer holds; later units would need a different design or order; skipping would leave later units on a broken state; or enough is skipped that the goals can't be met.
> - At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
> - Do not commit. Report in these fields: **done**, **files touched** (count), **table or pair rows changed** (count), **open decisions logged** (ids), **AGENTS.md lines**, **verify** line, **skips** with reasons, **left**, **inefficient**.

### Gates

- `npm run verify -- --baseline` at the start of each phase; `npm run verify -- --allow-generate` must show no new errors before each unit's commit.
- S2, R2, M1, M2, H1, W1, W2: `npm test` green, including the coverage test from R2 on.
- Phase 2: the style gate (S3). The recall gate (`npm run english-helper-recall -- --check`) only if S1 touched `say-*.md` or `english.md`.
- Phase 5: every wizard walkthrough plays to its goal, and a clean `npm run build`, since the game's content lint and the site build read the engine.
- Final gate: a full `npm run verify` against an empty baseline.
- No style gate outside phase 2: no other unit changes prose under `docs/grammar/`. If a unit finds it must edit `docs/grammar/wizard.md`, the style gate applies to that phase.

### Commits

One per unit after its gate (S1 and S2 share one), and one per phase for the consolidated proposal; the last of those carries the `AGENTS.md` rows and deletes this file. Phase 1 made five. Expected from here: phase 2 three (S1 + S2, S3, consolidation), phase 3 four, phase 4 five, phase 5 six. Messages start `ageben-interpreter S1:` (and so on), then `[skip-cd]`, then the co-author line. Only the orchestrator commits.

## Open decisions

None blocks phase 2. Open decision 1 (scope order) is decided; see Status. Numbers stay stable because the body cites them.

2. **Which inference steps the matcher may take** (phase 4). (a) None. (b) Universal to instance: a claim about every member answers a question about one. (c) Membership in a stated list. (d) A compound matches a question on its head. Phase 1 found that closed `zual` claims no exceptions, while open `zuam` "leaves the list of exceptions open" (`universals-domains.md#not-every`). **Recommendation:** (c) and (d) as switches, each marked on the match; (b) as a switch for closed `zual` only.
3. **Does a question with fewer roles match a fuller claim?** (a) Yes: an unstated role matches anything. (b) Only an explicit blank does. **Recommendation:** (a). *Who paid Ana?* should find *Sam paid Ana yesterday*, and (b) would make every question list every role.
4. **Do the wizard's events live in the log?** (a) Yes: each event is a logged claim with who witnessed it, and a character's knowledge is the part of the log they saw or were told. (b) Keep `World.events` and `Entity.knows`, and answer past-tense questions through `holds`. **Recommendation:** (a). The mysteries, companions, and belief puzzles in `wizard-adventure.md` all need *who knows what, and how*, which is the log with its frames; (b) would build that a second time.
5. **How long a transcript the session re-parses.** (a) All of it. (b) A window set by the host. **Recommendation:** (b), with the window measured in phase 5 against the wizard's turn time; nothing depends on it earlier.
6. **A sake word or MIRATIVE in a question.** A force word comes first, so text order puts these inside what is asked: `yel zazozon vowurol thobatham.` would be *does Azozon walking serve your health?*, and `yel zazozon vowurol themem.` *did it surprise you that Azozon walks?* The alternative keeps them outside, as decided for an attitude word: *does Azozon walk? (that would serve my health / that surprises me)*. (a) Text order (inside). (b) Outside, like attitude. **Recommendation:** (b) for MIRATIVE, since the surprise is the speaker's own reaction, as an attitude is. For a sake word, (b) if [sakes](/sakes) makes the stake the speaker's when none is named, else (a), so that a question can ask whose health a thing serves. Blocks only these two rows of S1.
7. **Pairs that text order can give only one way.** Some frames have a fixed position (a hinge with `blarl` is kept last; a force word comes first), so text order allows only one of the two orders. S1 lists each such pair here, with how the other reading can be said today (a `/w/` form, a carried frame, a second sentence), and leaves it unsettled. Options per pair: (a) keep the one order, and say the other with the form S1 lists; (b) let the frame move. **Recommendation:** (a) where S1 finds a form for the other reading, since moving a hinge or a force word would undo rules learners meet first; no basis yet where S1 finds none.

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

- **No programming language.** *Execute* here means: log a statement, answer a question, hand a command to the host. No control flow, variables, or types are added to Ageben.
- **No second grammar authority.** The reader copies what the tree says. It never re-derives a reading, and every table row cites the grammar section that owns it.
- **No inference by default.** The matcher is structural. Each inference step is a named switch that stays off until the user accepts it ([open decisions](#open-decisions)).
- **No paraphrase and no ranking.** A different root is a different claim.
- **No surfaces.** The map, the search box, the spec commands, and the permission hook stay in their own proposals. This one ships a library and a debugging command.
- **No English input.**

# Proposal: prove one syntax tree per sentence

**Status:** IN PROGRESS (phase 0 done on a branch; nothing merged)  
**Related:** none  
**Design authority:** the grammar pages own every reading. This note covers **parser and test tooling** only. Every attachment rule the work turns up goes to the owning grammar page, or to [design-decisions.md](../meta/design-decisions.md) when a form is ruled out on purpose.

## Goal

Show that every Agazan sentence has **at most one valid syntax tree**, with a check in `npm test` that fails the moment a grammar edit breaks this. The parser stays the only implementation; nothing else is kept in sync with it by hand.

Out of scope: word boundaries in speech, the analysis of a single word, pronoun resolution ([`resolve.ts`](../../src/parse/resolve.ts)), and other readings settled after parsing.

## Why the current parser cannot show it

Any deterministic parser returns exactly one tree, so "the parser returns one tree" proves nothing. The question is whether the **grammar** allows two trees, and the parser currently settles that question in code that no check can see:

- [`sentence-parser.ts`](../../src/parse/sentence-parser.ts) has **68 `GATE`s**: hand-written lookahead functions, some scanning arbitrarily far and reading word payloads. Chevrotain implicitly turns off its ambiguity check for any alternative that has a gate.
- One alternation (`bodyClause`) sets **`IGNORE_AMBIGUITIES: true`**, so an ambiguity Chevrotain once reported there is decided by gates.
- Chevrotain's static check covers `OR` alternatives only. `OPTION` and `MANY` are greedy, with no check against what follows (the "dangling else" class of ambiguity).
- `maxLookahead: 2` means any decision needing a third token goes into a gate.

General background: no algorithm decides ambiguity for every context-free grammar, but a **specific** grammar can be proved unambiguous. The standard route is to show it is **LR(1)**: an LR(1) table with no conflicts proves exactly one tree for every input.

## Why there are gates

Chevrotain is LL(k): it picks a branch at the **start** of a construction, from the next k tokens. Agazan often puts the deciding word **later**: `/w/` before its host, `gl-` before its noun, the join word at the **end** of a list (right-close), a stance bar before its rank join. The gates scan ahead to find that word. This is a limit of LL(k) parsing, not of grammars: an LR parser reads first and builds the structure when the deciding word arrives. From a first read, no gate needs more than a context-free grammar.

Rough inventory (counts overlap):

| Kind | About | What the gate does | Converts to |
|------|-------|--------------------|-------------|
| Skip a `/w/` run | 29 | `laAfterW` and friends: reach the host past any number of `/w/` words | Nothing under ALL(\*); a left-factored rule otherwise |
| Read the payload | 15 | the token type is too coarse: `isStanceJoin`, `isAsOfWToken`, `isScopeThoVerb`, `isFrameHook`, `scaleNumberAhead`, `factorAhead`, `gl`, `joinSeries`, ending | A finer token type from `classify` (a Chevrotain token category, so existing `CONSUME`s still match) |
| Scan to the closing join or bar | 10 | `vpItemMaterialAhead`, `rankBarAhead`, `respectivelyAdjListAhead`, `boundJoinAhead`, `crossPeriodJoinAhead`, `itemHookAhead`, … | Grammar rules. **Each carries a documented attachment rule.** The LR(1) check confirms the rule gives one tree or reports a conflict |
| Short lookahead / "otherwise" | rest | `tokenIs(LA(1), …)`, `leadForceAhead`, negated gates (`!clauseEndAhead()`) | Delete and see whether Chevrotain complains. The negated ones are the likeliest to be quietly choosing between two trees |

Checks that only **reject** a tree (`enforce.ts`, force pairs, a second stance word) can stay as code: rejecting trees never makes a grammar ambiguous.

## Phase 0 results (2026-10-08)

Phase 0 built the measuring tools and changed no parser behavior. Everything is on the `allstar-lookahead` branch (worktree `tmp/allstar`), not yet committed.

- **`npm run grammar-check`** (`scripts/grammar-check.ts`, `src/grammar-check/`). It exports the parser's grammar as BNF with every gate deleted, builds canonical LR(1) tables, and groups the conflicts by decision. It also counts the gate-free trees of every doc sentence the parser accepts and names the decision where two trees part. It only reports and never fails. It runs in about 6 s (LR(1) 44 ms, the doc pass the rest). Unit tests cover a dangling else, a clean list, and the split-run shape.
- **`npm run parse-snapshot -- --ref <ref>`** (`scripts/parse-snapshot.ts`). It runs the parser at a git ref and the working tree's parser over this checkout's doc spans, and fails on any difference. Checked against a deliberately broken gate, it caught 3 changed spans.

### Baseline

| Measure | Value |
|---------|-------|
| Exported grammar | 111 nonterminals, 207 productions, 26 token types |
| LR(1) | 549 states, **573 conflicts from 155 decisions** |
| Doc sentences the parser accepts | 2,655 |
| … with exactly one gate-free tree | 54 |
| … with two or more | **2,601**, through 41 distinct forks |
| … with none | **0** |

The last row matters. The export accepts every sentence the parser accepts, so it is a faithful gate-free picture: every extra tree is one that a gate, a rule argument, or a greedy `OPTION` / `MANY` removes.

### What the forks are

Nearly every sentence has several gate-free trees. That is a statement about **how the parser is written**, not about Agazan: much of the structure lives where the grammar cannot see it. One finding widens the inventory above: **greedy `OPTION` / `MANY` also choose**, with no gate at all (cause 4).

| # | Cause | Main forks (doc sentences hitting it) | Kind | Fix |
|---|-------|---------------------------------------|------|-----|
| 1 | **Utterance boundaries.** The grammar lets one utterance end and the next begin anywhere; only the gate on `document` requires a period first | `document.AT_LEAST_ONE` (2,522) | Parser shape | Put the period in the rule structure |
| 2 | **Slot in a rule argument.** `npCoord(level)` is one rule for `/z/`, `/d/` and `/b/`; the level only reaches gates, so every noun phrase matches all three | `unit.OR` alts 1–3 (2,494), `vpItemUnit.OR` (1,523), `npCoord.AT_LEAST_ONE` on `Z D` (870) | Parser shape | One rule per slot, generated in a loop; slot-specific tokens for `Odo` and `WritingSpan` |
| 3 | **Runs of same-role words.** List rules make the join word optional, so `Z Z` or `H H` is either one list with no join or two units | `AT_LEAST_ONE` in `npCoord`, `hCoord`, `gCoord`, `vpCoord`, `clauseItem` (tens to 2,381) | Probably parser shape | [Joins](../grammar/joins.md) closes every list with a join word, and [clause](../grammar/clause.md) counts plain `/h/` words as separate units. Make the join required in list rules, after checking the AST does not change |
| 4 | **Hosting by position.** A `/b/` after a `/ɡ/`, `/h/` or `/th/` word is hosted or a separate recipient unit; the greedy `OPTION` picks hosted. An adjective after a hosted `/b/` likewise | `clauseItem` forks on `H B` / `G B`, `unit.OR` alt 5, `npPackage.MANY`, `gCoordPart` | Documented rule ([clause](../grammar/clause.md): a `/b/` right after any `/ɡ/`, `/h/` or `/th/` word completes it; an adjective after it describes that `/b/`) | Encode in the grammar: no unhosted `/b/` unit directly after a host |
| 5 | **Split `/w/` run** around the optional as-of pair | `gPackage` body (123) | Parser shape | `W* (asOf W*)?` |
| 6 | **Sentence-initial hook:** discourse glue or in-clause hook | `utterance.OR` (265 + 7) | Real choice, made by a gate | Editor check (open question 3) |
| 7 | **Number `/ɡ/` after a hosted `/b/`:** amount or a separate word | `hUnitRule.OR` on `B G` (24) | Real choice, made from the payload | Token split, plus editor check (open question 3) |
| 8 | **Two `/x/` words after a clause** | `clause.MANY` on `JoinX JoinX` (3) | Probably token granularity | Split stand-in `/x/` from join `/x/` |

Causes 1, 2, 3 and 5 account for nearly all of the 2,601 sentences and most of the 155 conflicting decisions, and none of them needs a grammar decision. Fixing them first should leave a short conflict list made of causes 4, 6, 7 and 8 plus whatever they were hiding. That list is the actual question of whether Agazan has one tree per sentence.

## Approach

Batches, each merged to main on its own with `npm test` green and `npm run parse-snapshot` either empty or explained by a doc edit in the same batch. After each batch, record the LR(1) conflict count and the doc fork count here.

1. **Switch to ALL(\*)** with [`chevrotain-allstar`](https://www.npmjs.com/package/chevrotain-allstar) (TypeFox / Langium, peer `chevrotain ^13`). Collect its runtime ambiguity reports instead of printing them. The `grammar-check` report already covers the static check that the switch turns off.
2. **Parser-shape fixes** (causes 1, 2, 5). No grammar decisions; the snapshot must stay empty.
3. **Lists and hosting** (causes 3, 4). Both rules are documented; small doc clarifications may come with them.
4. **Finer token types** (cause 8 and the payload gates, cause 7's token split). Mechanical.
5. **Remaining gates**, family by family (the inventory above). A gate that chooses between two valid trees is a grammar decision: it is logged for the editor and lands with its grammar-page edit, never quietly kept in code. Causes 6 and 7 are decided here.
6. **Make the check strict.** `grammar-check` fails on any conflict, with an allowlist for gates that only reject a tree, so a new gate fails until it is classified.

If a parser that *is* the proof is wanted later, a gate-free Chevrotain grammar ports mechanically to [Lezer](https://lezer.codemirror.net/), an LR(1) generator whose build fails on conflicts. The batches above are needed on either path.

### Comparing old and new behavior

No frozen copy of the old parser. It would stop working at the first gate removal (a gate-free rule does not run under LL(2)) and drift from the docs meanwhile. Instead, a snapshot script runs the parser over every Agazan sentence and phrase span in `docs/grammar/` (2,657 today) and diffs the results. The baseline is built **from a git ref** (the migration's base commit) and run on the **current** docs, so a diff only ever means a parser change. Each diff is a regression or an intended change that ships with its doc edit. The script only covers sentences that appear in the docs; the LR(1) check covers the rest.

## Findings from a throwaway experiment

An experiment in a separate worktree (not merged) switched the parser to ALL(\*) with every gate still in place.

**Output.** All 2,657 doc spans gave the same result as under LL(2).

**Speed.** No measurable change:

| Lookahead | Startup | Per sentence |
|-----------|---------|--------------|
| LL(2) | 62 ms | 0.07 ms |
| LL(3) | 882 ms | 0.06 ms |
| LL(4) | did not finish | |
| ALL(\*) | 62 ms | 0.07 ms |

All of LL(k)'s cost is the up-front table build in `performSelfAnalysis()`, which grows exponentially with k. ALL(\*) skips that build and works out each decision on first use, then caches it.

**Static check.** allstar's `validateAmbiguousAlternationAlternatives()` returns an empty list, so the switch removes Chevrotain's (already partial) static check. That is why the `grammar-check` report has to exist before the switch (done in phase 0). At runtime allstar picks the lowest alternative and reports the ambiguity through a `logging` hook (default `console.log`, which would corrupt the CLI's JSON, so the hook has to collect reports instead).

### The 15 runtime ambiguity reports

ALL(\*) reported 15 ambiguities on the doc corpus.

**What a report proves, and what it does not.** allstar predicts from **token types only**. It ignores gates in sub-rules and on `OPTION` / `MANY` (it honors `OR` gates). It also never looks past the end of the rule that holds the decision (SLL prediction, with no full-context retry). A report fires in one of two cases:

- **Merge:** two alternatives reach the same parser state with the same rule stack. Then every way of finishing one also finishes the other, so the sentence really has two parses **in the token-type grammar with those gates removed**.
- **Rule end:** every alternative runs off the end of the rule before the alternatives differ. The predictor ran out of context; this may not be a real ambiguity at all.

So the reports **do not show that Agazan is ambiguous**. They mark places where the grammar's **structure** cannot decide and a gate or a payload check does. Each is a real ambiguity in Agazan only if the docs do not state the rule the gate applies. The list is also not complete: a decision is reported only the first time a sentence reaches it (later hits use the cache), and only for sentences in the corpus.

The 15 reports fall on five decisions. Row 1 counts as two decision points in the parser, because `hostedTail` is inlined into both `hUnitRule` and `gPackage`.

| # | Decision (rule) | Example (first hit) | Reports | First assessment |
|---|-----------------|---------------------|---------|------------------|
| 1 | Number `/ɡ/` right after a hosted `/b/`: its **amount**, or a separate `/ɡ/` word (`hostedTail` `OPTION6`, inside `hUnitRule` and `gPackage`) | `zazawan thevom bagazem grurel vowogal.`, `thunem bazazam grazol` | 6 | **Real token-level choice**, decided by the number's marker (a cardinal is the amount; ordinals and labels are adjectives). [Measure phrases](../grammar/numbers-applied.md#measure-phrases) put the amount on the unit as a `/ɡ/` number. Still to check: whether the docs say a cardinal there can **never** be the clause's own `/ɡ/`. If so, splitting cardinal `/ɡ/` into its own token type dissolves the conflict |
| 2 | Sentence-initial hook: **discourse glue** at the left edge, or an **in-clause hook** opening the clause (`utterance` `OR`) | `al zazawan vowogal.`, `el zahaben godogal.`, `ul barl` | 5 | **Real token-level choice**, decided by `discourseHookAhead` (no `/b/` after the hook → glue). Still to check: that [hooks](../grammar/hooks.md) says an in-clause hook cannot open a sentence without its `/b/` |
| 3 | `/w/` words before an optional as-of pair (`gPackage` `MANY`) | `zazawan wegem gelevam vowogal.` | 2 | **Artifact.** `W* (asOf)? W*` with no as-of pair splits the `/w/` run two ways, giving the same tree. Fix the rule shape; no grammar question |
| 4 | Sentence-initial `/x/`: **cross-period join**, or a **stand-in clause** (`bodyClause` `OPTION2`, already `IGNORE_AMBIGUITIES`) | `zazawan vowogal. xan zalahen varahal xol zahaben vezebal.` | 1 | **Probably a rule-end report.** The stand-in reading seems to die at the next word (a clause must follow a cross join; a lone stand-in needs a period or `/x/` join). Confirm with the LR(1) check |
| 5 | `/x/` word right after a mid-clause `/x/` join: a **stand-in item**, or **another join word** (`clause` `OPTION`) | `zazawan vowogal xam xar.` | 1 | **Probably dissolved by a finer token**: the two words differ by ending, but both are `JoinX` tokens. Splitting stand-in `/x/` from join `/x/` should remove it. If not, it is a grammar question for [clause joins](../grammar/joins.md#clause-joins) |

In rows 1 and 2, a rule chooses between two token-level trees. Rows 3–5 are probably side effects of how the parser is written.

## Open questions

1. Scope of the proof: one clause first, then the whole utterance across periods (continue, cross-period joins, topic carry-over)? The utterance is still context-free, just bigger.
2. If the grammar is unambiguous but not LR(1) somewhere, is a short list of explained conflicts acceptable, or must it reach zero (by reshaping rules or switching to Lezer)?
3. Causes 6 and 7, and rows 1 and 2 of the runtime reports: are those rules already taught, or are they new decisions?
4. Cause 3: is a run of same-role words without a join word ever one list? If not, list rules require the join.

## Costs and risks

- **Dependency:** allstar is version 0.x with one main maintainer and ties into Chevrotain internals, so a major Chevrotain upgrade waits for an allstar release. It is used by Langium; if it were abandoned, a gate-free grammar moves to Lezer.
- **Behavior:** where alternatives overlap, ALL(\*) may pick differently from LL(2). The snapshot diff catches each case.
- **Debugging:** a branch decision moves from a readable gate into the grammar's structure.
- **Bundle:** allstar depends on `lodash-es`; tree-shaking should keep most of it out of the browser bundle.

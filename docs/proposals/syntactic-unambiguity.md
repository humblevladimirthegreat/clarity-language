# Proposal: prove one syntax tree per sentence

**Status:** PROPOSED (planning; nothing merged)  
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

## Approach

1. **Switch lookahead to ALL(\*)** with [`chevrotain-allstar`](https://www.npmjs.com/package/chevrotain-allstar) (TypeFox / Langium, peer `chevrotain ^13`). ALL(\*) looks as far ahead as a decision needs, so gates that only skip ahead can be deleted.
2. **Add the proof check** to `npm test`, landing no later than step 1. It exports the grammar with Chevrotain's `getGAstProductions()`, flattens `OPTION` / `MANY` / `OR` into plain BNF, builds LR(1) tables, and fails on any conflict, naming the rule and tokens. The BNF is generated on every run, never maintained.
3. **Convert gates** family by family, using the table above. A gate that chooses between two valid trees is a **grammar decision**: it is logged for the editor and lands with its grammar-page edit, never quietly kept in code.
4. **Allowlist** the gates that remain as pure rejections, so a new gate fails the test until it is classified.

If a parser that *is* the proof is wanted later, a gate-free Chevrotain grammar ports mechanically to [Lezer](https://lezer.codemirror.net/), an LR(1) generator whose build fails on conflicts. Converting the gates first is needed on either path.

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

**Static check.** allstar's `validateAmbiguousAlternationAlternatives()` returns an empty list, so the switch removes Chevrotain's (already partial) static check. That is why step 2 must land no later than step 1. At runtime allstar picks the lowest alternative and reports the ambiguity through a `logging` hook (default `console.log`, which would corrupt the CLI's JSON, so the hook has to collect reports instead).

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
3. For items 1 and 2: are those rules already taught, or are they new decisions?

## Costs and risks

- **Dependency:** allstar is version 0.x with one main maintainer and ties into Chevrotain internals, so a major Chevrotain upgrade waits for an allstar release. It is used by Langium; if it were abandoned, a gate-free grammar moves to Lezer.
- **Behavior:** where alternatives overlap, ALL(\*) may pick differently from LL(2). The snapshot diff catches each case.
- **Debugging:** a branch decision moves from a readable gate into the grammar's structure.
- **Bundle:** allstar depends on `lodash-es`; tree-shaking should keep most of it out of the browser bundle.

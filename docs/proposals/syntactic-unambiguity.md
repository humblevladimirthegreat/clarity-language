# Proposal: prove one syntax tree per sentence

**Status:** IN PROGRESS (phase 0 and batches 1–5 done)  
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

Phase 0 built the measuring tools and changed no parser behavior. Merged to main.

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
   **Done (2026-10-08).** `chevrotain-allstar` 0.5.0, gates unchanged. `parse-snapshot` against the pre-switch commit: 0 of 2,657 spans differ. `grammar-check` unchanged (573 LR(1) conflicts from 155 decisions; 2,601 doc sentences with two or more gate-free trees, through 41 forks) and now lists the runtime reports, collected through `takeAmbiguityReports()` in `sentence-parser.ts`: the same 15 as the experiment below.
2. **Parser-shape fixes** (causes 1, 2, 5). No grammar decisions; the snapshot must stay empty.
   **Done (2026-10-08).** `parse-snapshot` against batch 1: 0 of 2,657 spans differ.
   - **Cause 1:** `document → sentence (Period sentence?)* EOF`. Which sentences share an utterance is read after parsing (`buildUtterances`): a left edge, or a leading hook, opens a new one, which is the rule the deleted gate applied. Two changes outside the docs, both toward them: a `/w/` + hook after a period is now discourse glue, as it is at the start of a text ([hooks § detail on the hook](../grammar/hooks.md#hook-w): "A discourse hook takes `/w/` the same way"). Before, it was an in-clause hook there only. A body also no longer takes the period of an earlier, body-less sentence (`yol. zazawan vowogal` with no final period).
   - **Cause 2:** `zCoord` / `dCoord` / `bCoord` with their parts, packages (`zPackage`, …) and join closes (`zJoinClose`, …), one set per slot from a loop. Stand-ins and noun-slot written spans got per-slot token types (`OdoZ` / `OdoD` / `OdoB` / `OdoOther`, `WritingSpanZ` / `D` / `B`) as members of the old categories, so every existing `CONSUME(Odo)` still matches. The `gl-` adjective's slot lookahead now skips the adjective's own hosted `/b/` (`glugol bazawan zodogal`). Before, the level-agnostic package hid this.
   - **Cause 5:** `W` became a category of `WPlain` and `WAsOf`, and `gPackage` is `WPlain* (asOfWPair WPlain*)?` with no gates. The ALL(\*) reports on `gPackage.MANY` (runtime row 3) are gone.
   - **Tooling:** the BNF export now expands a consumed token category into one production per member. Before, it made the category a nonterminal, so LR(1) had to reduce `WPlain → W` before knowing which rule the word belonged to. Chevrotain matches a category as a set of terminals, so this is the faithful export.

   | Measure | Batch 1 | Batch 2 |
   |---------|---------|---------|
   | Exported grammar | 111 nonterminals, 207 productions, 26 token types | 142 nonterminals, 278 productions, 32 token types |
   | LR(1) | 549 states, 573 conflicts from 155 decisions | 952 states, 808 conflicts from 165 decisions |
   | … decisions, with the three slot copies counted once | 155 | **106** |
   | Doc sentences with exactly one gate-free tree | 54 | **651** |
   | … with two or more | 2,601, through 41 forks | **2,004**, through 36 forks |
   | ALL(\*) runtime reports | 15 | 13 |

   The raw conflict count rose only because canonical LR(1) builds a separate state for each noun-slot context, and each conflict that is left is counted once per state. Counted by decision, with the slot copies folded together, conflicts fell by a third. Every remaining doc fork is cause 3 (join-less runs: `clauseItem` on `H B` / `G B`, `zCoord` on `Z Z zal`, `hCoord` on `H H`, `gCoord` on `G G`), cause 4 (hosting), or cause 6 (`sentence.OR`, 48 + 7 sentences). Those belong to batches 3 and 5.
3. **Lists and hosting** (causes 3, 4). Both rules are documented; small doc clarifications may come with them.
   **Done (2026-10-08).** The editor decided open question 4: a join is required for more than one noun in a slot, and for more than one verb ([joins § right-close](../grammar/joins.md#right-close) now says so). `parse-snapshot` against batch 2: 7 of 2,658 spans differ, all intended (below).
   - **Lists are closed.** Each `/z/` / `/d/` / `/b/` / `/v/` / `/ɡ/` / `/h/` list is one or more parts, each closed by its join. A phrase with no join is one noun (`zNoun`), one forward stand-in (`zStandIn`), one bare tag (`zTag`), one verb (`vpVerb`), one adjective (`gSingle`) or one adverb (`hSingle`). Adjectives and adverbs still stand in a row with no join: after a noun they stack on it, and elsewhere each is its own unit (`gSingle gSingle`, `hSingle hSingle`). Only nouns and verbs need the join. The item hook (`em` + `/b/` on the last item) is part of the list, right before its bars and join, instead of an optional tail on every noun with a gate.
   - **The clause is a chain of units** (`unit`, `unitAfterZ`, …): each unit rule holds one unit and the rest of the clause, and what may follow depends on the unit before. No two noun phrases of one slot, and no two verb phrases, stand side by side. No `/ɡ/` or `/h/` list follows another `/ɡ/` or `/h/` unit, since a list takes every item right before its join. A stand-in, an `/h/` hosting one (`hGrounds`), or a list whose bar hosts `barl` (`zCoordGrounds`, [comparatives § bars](../grammar/comparatives.md#bars)) ends the main clause, so the next unit starts fresh. `chainUnits` reads the chain back into a flat unit list, so the AST keeps its shape.
   - **Context tokens** (`markContext`, run before parsing): a `/b/` right after an `/h/`, `/th/` or `/ɡ/` word, or after a pair-scope verb, is `HostedB`; a stand-in right after an `/h/` or `/th/` word is `HostedOdo` ([clause § extra nouns](../grammar/clause.md#extra-nouns)). A cardinal `/ɡ/` right after a hosted `/b/` is that unit's `Amount`, and a signed `/h/` number after an equative's shared scale its `Factor` (cause 7's token split, done here). Neither has a `/b/` slot. The editor banned a `/b/` right after either (`slotlessHost`, D-45): read as the clause's own extra noun, it would make attaching a `/b/` depend on the number's marker. The context pass marks that `/b/` hosted like any other, so the parse fails and the rejection names the rule. A stance word that runs up to its own list's rank join is a `Bar` (the old `rankBarAhead` scan, now token-level). Each rule reads one neighbor, or one scan, from the word list, so it cannot add a tree.
   - **Payload tokens:** a word with no role letter is `Citation` (it names and fills no slot, so `azawan odogal.` is two units, not a list), and a bare tag **-l** is `TagZ` / `TagD` / `TagB`, which names the noun before it, names a closed list after its join, or stands alone. This replaces `foldTags` and the group-tag repair after parsing.
   - **Diagnosis:** a parse that fails on a noun or verb right after a phrase of its slot throws `joinlessRun` or `leftFence` (`diagnoseParseError`), not a raw Chevrotain message.
   - **Tooling:** the BNF export gives structurally identical constructs one nonterminal (named after the first call site), and expands an `OR` of single tokens as a token set, as it already did for categories. Neither changes a tree count; both stop LR(1) from choosing between copies of the same empty run.
   - **Snapshot changes:** four stand-in sentences (`gamadam zarl zazawan vowogal.` and three like it) now hand the noun after the stand-in to the dependent; before, it stayed in the main clause as a second item of the stand-in's list. Three citation spans (`azawan odogal.`, `xredul zazawan vehahel.`, `xrebal zazawan dagavulx vahahal.`) are separate units. Docs that broke the rule were fixed: [word-endings](../grammar/word-endings.md) (`zohun zaluden zal`), [say-amounts](../grammar/say-amounts.md) (`degehum`, an object), [say-people-places](../grammar/say-people-places.md) (`gamolameval gul`, a predicate), and `glosses.md` (a label and its clause as two sentences).
   - **Beyond the docs** (every doc sentence with one word deleted, old parser against new): 282 now fail as `joinlessRun` / `leftFence`. Two other changes: an item hook needs its own list's join right after it (the old gate took any noun join), and a bar with no `/b/` before a number (`thevom gruwol zel`) no longer leaves an unclosed bar.

   | Measure | Batch 2 | Batch 3 |
   |---------|---------|---------|
   | Exported grammar | 104 nonterminals, 198 productions, 32 token types | 149 nonterminals, 403 productions, 41 token types |
   | LR(1), batch 3 exporter for both | 937 states, 814 conflicts from 107 decisions | 2,454 states, 3,388 conflicts from 169 decisions |
   | Doc sentences with exactly one gate-free tree | 651 | **1,737** |
   | … with two or more | 2,004, through 35 forks | **919**, through 53 forks |
   | ALL(\*) runtime reports | 13 | 23 |

   Doc forks fell by more than half. LR(1) conflicts rose, for a reason the batch exposes rather than adds: a lone noun and the first item of a list are now different rules, and only the join at the end tells them apart. The same holds for a verb and the first verb of a list. That is unambiguous but not LR(1) ([open question 2](#2-unambiguous-but-not-lr1-explained-conflicts-or-zero)); the fix is to left-factor (one package, then an optional list tail) once bars and verb items no longer need a scan. The largest remaining fork (`unit.OR1` alt 3, about 470 sentences: `zerehel goyem bagavul.`) is a plain `/ɡ/` after a noun: its adjective, or a `/ɡ/` unit of its own. The rule is taught, but the grammar can state it only once plain and `gl-` adjectives are different tokens (batch 4).
4. **Finer token types** (cause 8 and the payload gates, cause 7's token split). Mechanical. Plain against `gl-` `/ɡ/` comes first: with it, the unit chain can rule out a plain `/ɡ/` unit right after a noun phrase.
   **Done (2026-10-08).** `parse-snapshot` against batch 3: 0 of 2,658 spans differ.
   - **Token categories** (members of the old type, so every existing `CONSUME` still matches): `G` → `GPlain` / `GGl`, `H` → `HPlain` / `HTh`, `JoinH` → `JoinHPlain` / `JoinTh`, `HostedB` → `HostedBNoun` / `HostedBNumber`, and `WPairing` (respectively `wazem`) under `W`. These replace the payload checks in `isGlHead`, `plainAdjAhead`, `isStanceWord`, `isStanceJoin`, and the landmark test on a hosted `/b/`.
   - **Context tokens** (`markContext`, standalone types like `HostedB`): an `/h/` or `/th/` word right after a rank, equative or sequence noun join (past any `/w/`) is its shared scale `HScale`, and a digitless `/b/` number there is `BScale` ([joins § SHARED](../grammar/joins.md#shared-after-the-join): after a noun join, an `/h/` is only a scale after those joins). A `/th/` stance right after `uem` is its frame `HFrame` ([sakes](../grammar/sakes.md#contrary-to-stance)). This replaces the rank test on the shared slot and `isFrameHook`.
   - **Open and closed units.** A plain adjective describes the word before it, so the grammar now knows where one would still attach. Each unit that can end that way comes in two forms: **open** (a noun and its adjectives, a list's join with nothing shared, an `/h/`, `/ɡ/` or bar host whose `/b/` takes landmark adjectives) and **closed** (a tag after the noun, a shared scale or factor, a hosted join or number). After an open unit, no unit starts with a plain adjective; only a `/ɡ/` list that opens with its join word (`zazawan godogol gul`) or a respectively list follows. A list whose join shares an adjective ends a third way, `shared`: no respectively `/ɡ/` list follows it, since [joins § respectively](../grammar/joins.md#respectively) says those adjectives start right at the join. Inside a run of adjectives only the last may end open (`trailingAdjs`), and an item of a `/ɡ/` list never takes landmark adjectives (`gListItem`, which replaces the `landmark` rule argument the export could not see).
   - **Cause 8 needed no token split.** [Joins § clause joins](../grammar/joins.md#clause-joins): a join word with no clause before it is a clause of its own. The rule is `clause → item (JoinX item)* JoinX?`, so `xam xar` has one tree; a trailing join still parses so its check can name the rule. Also by structure: a mention marker comes only right before its topic span, and a sentence-initial `/x/` before a hook is the stand-in clause (`xual ul …`), so a cross-period join's clause does not open with a hook.
   - **ALL(\*) order.** Where the gate-free grammar still has two trees, ALL(\*) takes the first alternative and ignores gates below the decision. Each closed unit form is listed before its open form, which keeps the old greedy reading for the remaining forks (a hosted `/b/` filled by a join).
   - **Diagnosis:** a `gl-` adjective with no noun or call after it fails to parse now, and `diagnoseParseError` names it (`glNoNoun`), as it does a `wazem` away from a join word (`joinDetail`). A `gl-` adjective before a second noun of one slot reports `joinlessRun` instead of `glNoNoun`.
   - **Beyond the docs** (every doc sentence with one word deleted, batch 3 against batch 4, 8,271 variants): 9 trees changed, all one case. An adjective unit with a hosted `/b/` and no noun before it (`gugol bazawan gubuhel`) now gives the plain adjective after its `/b/` to that `/b/`, as [clause § complex chaining](../grammar/clause.md#complex-chaining) does after a noun; before, it was a separate predicate. Six error messages got more precise (`wazem` at the end of a sentence is now `joinDetail`).
   - **`/th/` hosts (editor decision, after batch 4):** a plain adjective after a `/th/` host's `/b/` describes that `/b/`, as after an `/h/` host (`thegem bazawan gubuhel`: *blue* describes Azawan). [Clause § complex chaining](../grammar/clause.md#complex-chaining) now says so. The parser applies it to every `/th/` host: a stance unit, the `uem` frame, and a shared scale after a rank join, each with an open and a closed form. No doc sentence changed; one test that held the old reading was updated.

   | Measure | Batch 3 | Batch 4 |
   |---------|---------|---------|
   | Exported grammar | 149 nonterminals, 403 productions, 41 token types | 269 nonterminals, 993 productions, 49 token types |
   | LR(1) | 2,454 states, 3,388 conflicts from 169 decisions | 5,207 states, 23,445 conflicts from 264 decisions (36 s; 1.5 s once the builder keys states by kernel) |
   | Doc sentences with exactly one gate-free tree | 1,737 | **2,577** |
   | … with two or more | 919, through 53 forks | **79**, through 17 forks |
   | ALL(\*) runtime reports | 23 | 13 |
   | `GATE`s in `sentence-parser.ts` | 57 | 49 |

   LR(1) conflicts rose for the reason batch 3 gave, now at every unit: an open and a closed form share their start, and only the end of the unit tells them apart. That is unambiguous but not LR(1); left-factoring them is part of batch 6 ([open question 2](#2-unambiguous-but-not-lr1-explained-conflicts-or-zero)). The 79 remaining sentences all belong to batch 5 (one sentence can hit two forks): cause 6 (`sentence.OR`, 50), a hosted `/b/` slot filled by a join against a `/b/` list after it (9; its gate `boundJoinAhead` is gone, and the closed-first order picks the join, as ALL(\*) reports), material between the verbs of a verb list (`vpItemMaterialAhead`, 11), an adverb a verb join shares against an adverb unit (4), a `barl` after a stance join (`lastHostOpen`, 4) or after a channel's offset (1), and a bar after a closed `ua` fence (1).
5. **Remaining gates**, family by family (the inventory above). A gate that chooses between two valid trees is a grammar decision: it is logged for the editor and lands with its grammar-page edit, never quietly kept in code. Cause 7 was settled by batches 3 and 4; cause 6 is decided here. Two sub-batches, each merged on its own with the usual checks (snapshot, every doc sentence with one word deleted, measures table).
   **Starting point:** the batch 4 follow-up closed the `/th/` gap above ([clause § complex chaining](../grammar/clause.md#complex-chaining) now covers a `/th/` host's `/b/`). At that point: 65 gate sites in `sentence-parser.ts` plus `IGNORE_AMBIGUITIES` on `bodyClause`, 79 doc sentences with two or more gate-free trees through 17 forks, 15 ALL(\*) reports, 24,248 LR(1) conflicts in 265 decisions (LR(1) is batch 6's job, not this one's).
   - **5a. The doc forks. Done (2026-10-08).** Every doc sentence has one gate-free tree, and ALL(\*) reports nothing. Each family's rule was already on its grammar page; none needed a new decision beyond `ul barl`. `parse-snapshot` against `28235ec`: 5 of 2,659 spans differ, all intended (below).
     - **Cause 6, the sentence-initial hook.** `Hook` became a category of `HookPlain` and `HookHosting`. `markContext` makes a hook `HookHosting` when a `/b/` word comes right after it (`B`, `JoinB`, `OdoB`, `TagB`, `WritingSpanB`), or a frame after `uem`. Glue in the left edge takes only `HookPlain`. `sentence` now has four forms, by how the left edge ends:
       - With an act word (`leftEdgeForce`), the body opens any way.
       - With a call or reaction (`leftEdgeTurn`), the body opens with neither a plain hook nor a plain adjective (`bodyClauseAfterTurn` → `unitAfterTurn`). The adjective describes the call ([speech moves](../grammar/speech-moves.md#vocative)).
       - With a polar or glue (`leftEdgeOther`), or with no left edge at all, the body opens with no plain hook (`bodyClauseNoGlue` → `unitNoGlue`, the `hooks: "hosting"` filter on the unit chain).
       This replaces `discourseHookAhead`, and `barl` no longer slips past it. `ul barl …` at the front is extra-noun *since*, per the decision in [open question 3](#3-causes-6-and-7-runtime-rows-1-and-2-taught-or-new), and `al barl …` there is now `hookStandIn`. [Hooks](../grammar/hooks.md) states the `/b/` condition in the Beginner glue section, and § since gains the stand-alone answer `ul barl zalahen vezebal.`
     - **A hosted `/b/` filled by a list.** A hosted `/b/` whose `/b/` words run on to a `/b/` join is `HostedBJoined`, a third member of `HostedB`. Only it takes `boundJoinTail`, so "open host, then a `/b/` list of its own" no longer tokenizes. By right-close, a list that starts right after a host is the hosted `/b/`; a lone `/b/` after a finished pair is still the recipient ([clause § extra nouns](../grammar/clause.md#extra-nouns)).
     - **Verb lists.** `V` became a category of `VPlain` and `VCont`. A verb right after another verb or a `/v/` join, past only item words (`/h/`, `/d/`, `/b/`, `/w/`, `/ɡ/`, tags, hosted `/b/`), is `VCont`. A list's first part opens with a bare `VPlain` verb (`vpCoordPartFirst`): words before every verb are the clause's own ([join-across-roles § forms](../grammar/join-across-roles.md#vp-clause-forms)). Later items and parts take any verb. This deletes `vpItemMaterialAhead`.
     - **The adverb a verb join shares.** An `HPlain` right after a `/v/` join, past any `/w/`, is `HSharedV`, and only `sharedAdverb` takes it. A `/th/` stance there is now a clause unit, not SHARED. Join-across-roles says so in one line: like any stance word, it is about the whole claim.
     - **`barl` after a stance join or a channel's offset.** `LateOdo` (standalone, so no `/b/` stand-in unit takes it) is an `OdoB` in one of two places: right after a `/th/` join whose last stance word has no `/b/`, or right after a `/th/` or frame host's number `/b/` (past its join and amount). This replaces the `lastHostOpen` parser state.
     - **A bar after a closed `ua` fence.** `Bar` became a category of `BarPlain` and `FenceBar`, the first bar right after a `ua` noun join. Only the bars-only list part takes it. This replaces `universalFenceBarAhead` and the `lastNpJoin` parser state.
     - **Snapshot changes:** `ul barl` and the new `ul barl zalahen vezebal.` (now extra-noun); `zalahen vedabal vul thegem bazawan.`, `vul thugum thoyem barl` and `zazawan vowogal vul thugum thoyem barl zazawan vezebal.` (the stance is a clause unit). [Say-reasons](../grammar/say-reasons.md) had glossed the last one inside the verb list; its gloss now matches.
     - **Beyond the docs** (`npm run parse-snapshot -- --ref 28235ec --drop-one`, 8,279 variants): 13 trees change with the `/th/`-after-a-verb-join rule, and 2 are variants of the new `ul barl` example. 10 now fail as `joinlessRun`, all two verbs in one clause with no join (below). Every other difference is the same rejection with a reworded message.
     - **Decided by the editor: two verbs with no join are rejected even with words between them.** `zazawan vowogal hadehum varahal.` used to parse as two verb units. A lone verb now takes only `VPlain`, so a `VCont` (counting a shared adverb as part of the item) must go on a list, and `diagnoseParseError` names `joinlessRun`. [Joins § right-close](../grammar/joins.md#right-close) now says so (with no example there: verb items are taught later, in [join-across-roles](../grammar/join-across-roles.md#vp-clause-forms)).
     - **Tooling:** `grammar-check --no-lr1` skips the LR(1) build for a quick doc pass, and `parse-snapshot --drop-one` runs the one-word-deleted comparison that batches 3 and 4 ran by hand.

     | Measure | Batch 4 | Batch 5a |
     |---------|---------|----------|
     | Exported grammar | 284 nonterminals, 1,033 productions, 49 token types | 307 nonterminals, 1,166 productions, 54 token types |
     | LR(1) | 5,320 states, 24,248 conflicts in 265 decisions | 6,607 states, 24,752 conflicts in **179** decisions |
     | Doc sentences with exactly one gate-free tree | 2,577 | **2,657 (all)** |
     | … with two or more | 79, through 17 forks | **0** |
     | ALL(\*) runtime reports | 15 | **0** |
     | Gate sites in `sentence-parser.ts` | 65 | 68 |

     The gate sites rose by 3: the four `sentence` forms each test a token type, and the scans they replace are gone (`discourseHookAhead`, `vpItemMaterialAhead` at 3 sites, the `lastHostOpen` test, `universalFenceBarAhead` at 2). What is left that reads a payload or parser state is the 5b list. Conflicting decisions fell by a third. The raw count rose with the new open and closed forms, which batch 6 left-factors.
   - **5b. Gates with no doc fork. Done (2026-10-08).** `sentence-parser.ts` has no `GATE` and no `IGNORE_AMBIGUITIES` left. Every gate was redundant with the token types, or only rejected; none chose a tree on its own. `parse-snapshot` against `bba3e8e`: 0 of 2,659 spans differ.
     - **Tooling first.** `grammar-check --variants` runs the doc-corpus check over every doc span with one word deleted or two neighboring words swapped (15,135 inputs, about 3 minutes), and also lists inputs the parser rejects that the gate-free grammar accepts. `parse-snapshot --swap` adds the swapped variants to `--drop-one`. Both share `spanVariants` in `src/grammar-check/corpus.ts`. On the batch 5a parser the variants showed 11 inputs with two gate-free trees (8 forks, all also ALL(\*) reports) and 3 that only a gate rejected. The doc corpus had shown neither.
     - **Deleted as redundant** (no snapshot change): the unit-chain gates (`citationAhead`, the slot, `/ɡ/`, `/h/` and hook tests), the `npSlot` gates in `vpItemUnit`, the list-part and item gates in the noun, verb, `/ɡ/` and `/h/` lists, the tag, standalone-join, `Bar`, `FenceBar` and `HSharedV` tests, the `B` gates in `asOfWPair` and `boundJoinTail`, `islandUnit`'s, the stand-in clause item's and its `xual ul` hook gate, `!clauseEndAhead`, the left edge's (`leftEdgeAhead`, `turnWordAhead`, `glueAhead`, `leftEdgeItemAhead`, `leadForceAhead`), `crossPeriodJoinAhead` with `IGNORE_AMBIGUITIES` (runtime row 4 was a rule-end report), `markedTopicAhead` (the token checks already reject any other `gl-` word before a topic word, `linkerMidSentence`), and the three `respectivelyAdjListAhead` sites.
     - **A gate bug.** The slot gate on a noun phrase read the word after a `gl-` adjective's hosted `/b/` as the head, so `glugol bazawan gugol zodogal balahen.` failed to parse, although [clause § complex chaining](../grammar/clause.md#complex-chaining) gives `gugol` to Azawan. It parses now (3 variants).
     - **Rejecting gates, moved out of the grammar:**
       - `tagPolarsAhead`: an asking tag is a sentence form of its own with no body (`leftEdgeTag`), so `yol yael zazawan vowogal.` fails by structure, and `diagnoseParseError` names `tagBody` ([questions § tags](../grammar/questions.md#tags): the tag is a turn of its own). It had a raw Chevrotain message.
       - `loneTopicWordAhead`, `markedLoneTopicAhead`: a lone `/x/` word parses, and enforce rejects a linker with no clause as `linkerAlone` ([dependents § sentence linkers](../grammar/dependents.md#sentence-linkers): a linker joins the last sentence to the one it starts). A topic word and the clearing linkers (`xevavem.`, `xavazem.`) still stand alone. `xodum.` had a raw message.
       - Both are listed as **open** in `unassigned-reserved.md`.
     - **Forks the gates had hidden, now structure.** Both rules were on their pages, and the parser already applied them through ALL(\*)'s alternative order or a gate, so no tree changed:
       - **A hook before a join word.** `zodogal em bazawar zal vowogal.` was one item with its hook, or a noun, a hook unit, and a standalone `zal`. [Joins § SHARED after the join](../grammar/joins.md#shared-after-the-join): a hook and its `/b/` right before the join word belong to the last item. `markContext` makes that hook `ItemHook` (a member of `Hook`) when a noun of the join's slot comes before it, and only the item-hook position takes it. The same holds before a rank fence's bar (`zugul om bamun zel garagam.`).
       - **A stance join after `barl`.** `thavem barl thul` was a one-word stance list holding the stand-in, or the pole and its stand-in with `thul` opening the next sentence. [Dependents § nested dependents](../grammar/dependents.md#nested-dependents): a clause's one stand-in is at its end, so `thul` opens the grounds, as the parser already read it. An `/h/` list item no longer hosts a stand-in. [Join-across-roles](../grammar/join-across-roles.md#stance-join-before-barl) puts the join before `barl` for *not because*.
     - **Beyond the docs** (`parse-snapshot --ref bba3e8e --drop-one --swap`, 15,135 variants): 7 differ. 3 are the `gl-` fix above. 4 are rejected by both parsers with a different raw message (`xezom xazawan. …`, `xevavem yom zehon vowogal.`, `xavazem yol zehon vewal.`, `… xagezam yael. …`).
     - **Fragment start rule: not added (editor decision).** Open question 1 is closed below.

     | Measure | Batch 5a | Batch 5b |
     |---------|----------|----------|
     | Exported grammar | 307 nonterminals, 1,166 productions, 54 token types | 307 nonterminals, 1,165 productions, 55 token types |
     | LR(1) | 6,607 states, 24,752 conflicts in 179 decisions | 6,641 states, 24,511 conflicts in **177** decisions |
     | Doc sentences with exactly one gate-free tree | 2,657 (all) | 2,657 (all) |
     | Variants the parser accepts, with two or more gate-free trees | 11 of 12,970, through 8 forks | **0** of 12,973 |
     | Variants only a gate rejects | 3 | **0** |
     | ALL(\*) runtime reports, docs and variants | 8 | **0** |
     | Gate sites in `sentence-parser.ts` | 68 | **0** |

     With no gates left, batch 6 needs no allowlist for them: every remaining LR(1) conflict is an open / closed form pair or a list against a lone item, which only left-factoring removes.
6. **Make the check strict.** `grammar-check` fails on any LR(1) conflict and on any `GATE` in `sentence-parser.ts`. Batch 5b left no gate, so a new one fails until it is turned into structure, a token type, or an enforce check.

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

Each question has a recommendation. None of them needs a new grammar decision except the `ul barl` item under question 3, which the editor has decided.

### 1. Scope: one clause first, or the whole text across periods?

**Decided (2026-10-08): the whole text, and no separate fragment rule.** The bullets below were the recommendation; batch 5b dropped its last one. A final period that is left out sits right before the end of input, so it cannot add a tree, and every period-less doc span already has one tree. The strict check covers `document` as it is, period-less spans included, which promises more than a check of complete sentences alone.

- **Starting with one clause saves nothing.** The exported grammar already starts at `document`, and the LR(1) check runs on all of it in 44 ms. The cross-period material is already in it: continue, cross-period `/x/` joins (runtime row 4), and stand-ins that point back. Cutting the grammar down to one clause would mean writing a second start symbol and then removing it later.
- **Cause 1 is the actual work here.** Once the period is part of the rule structure (batch 2), utterance boundaries stop forking and the proof covers the whole text at no extra cost.
- **Topic carry-over is out of scope.** It decides what a word refers to, not how the tree is built, so it belongs with pronoun resolution (`resolve.ts`), which the Goal already excludes. The same goes for any other reading worked out after parsing.
- **Fragments need their own entry point** (superseded, see above). The doc corpus includes phrase spans that are not sentences (`ul barl`, `thunem bazazam grazol`). The parser accepts them because the period is optional at the end. A fragment has no surrounding context, so it can honestly have two readings, and it should not count against the proof. The parser should keep accepting fragments for doc checking, through a separate start rule (or a fragment flag). The proof and the strict check (batch 6) should then cover only `document`, where every utterance ends in a period.

### 2. Unambiguous but not LR(1): explained conflicts, or zero?

**Recommendation: aim for zero, and allow a short allowlist only when each entry has a stated argument plus a mechanical bounded check. Lezer does not change this.**

- **Most conflicts in an unambiguous grammar can be reshaped away.** Usually the parser only needs one more token before it reduces. Left-factoring or delaying the reduction fixes that, and this is the same kind of work batches 2–4 already do. Each fix is small and local.
- **Lezer is no way out.** Its build fails on the same LR(1) conflicts. Its GLR markers (`~`) accept an ambiguity on purpose, so they would remove the proof rather than supply it. Lezer is only worth it if we later want the parser itself to serve as the proof, not as a way around a conflict.
- **If a conflict cannot be reshaped away**, accept it only when all three hold:
  1. The allowlist entry names the decision (rule and token pair) and states in one paragraph why only one choice can finish a sentence.
  2. `grammar-check` runs a bounded exhaustive search on that nonterminal: it enumerates every token-type string up to a fixed length that the nonterminal derives and counts trees, in the style of AMBER-type ambiguity detectors. It fails if any string gets two trees.
  3. The entry is keyed on the exact conflict, so a new conflict, or a changed one, still fails the build.
- **Why an allowlist and not just a comment:** the end-user promise is that a learner or tool never meets two trees. A conflict with a written argument and a bounded check keeps that promise to a known depth. A conflict with no check makes no promise at all.

### 3. Causes 6 and 7 (runtime rows 1 and 2): taught, or new?

**Recommendation: both rules are already taught. Encode them with a token split and grammar structure, not gates. One edge case (`ul barl` at the front of a sentence) was untaught; the editor decided it below.**

**Cause 6 / row 2, sentence-initial hook.** This is taught. [Hooks § extra noun](../grammar/hooks.md#extra-noun) gives the test: a `/b/` right after the hook makes it an extra-noun hook. [Hooks § detail on the hook](../grammar/hooks.md#hook-w) says the same about the front of a sentence: "A `/b/` right after the hook still makes it an extra-noun hook, not a discourse hook." [Stacked discourse hooks](../grammar/hooks.md#stacked-discourse) repeats the condition ("with no `/b/` right after it").

- **Grammar:** the decision rests on the token after the hook, so it fits LR(1) as is. After the leading `W* Hook`, a `B` (or `JoinB`) lookahead goes into the clause as an extra-noun unit, and anything else closes the left edge as glue. `discourseHookAhead` becomes structure.
- **Small doc edit:** the Beginner section that teaches glue, [glue this sentence to prior talk](../grammar/hooks.md#discourse-hooks), never states the `/b/` condition; it first appears in an Intermediate section. Add one sentence there. That is a clarification, not a new rule.
- **`ul barl …` at the front of a sentence: decided (2026-10-08), extra-noun *since*.** The gate tests only `B` / `JoinB`, so the stand-in `barl` (`OdoB`) slips past it, and `ul barl zazawan vowogal.` parses today as glue `ul` (*Except, …*) plus a clause that is only `barl`. `al barl …` slips past the same way, although `ul` is the only hook that takes `barl`. The rule above, read literally, makes it the extra-noun *since* + `barl` ([since](../grammar/hooks.md#since)), and the editor chose that reading. No new boundary rule is needed: [dependents § poles](../grammar/dependents.md#poles) already puts the pair last in its clause, with the dependent as the next sentence, and [nested dependents](../grammar/dependents.md#nested-dependents) allows one stand-in per clause, at its end. So the main clause is `ul barl` alone, and the sentence means *Since Azawan walked.*, not *Since Azawan walked, …* plus a main clause. The parser already reads a fronted pole pair that way (`thavem barl zazawan vowogal.`). It is the natural answer to `yol ul bar …` (*since when?*): [questions § where](../grammar/questions.md#where) answers with the hook and its landmark. English *Since X, Y* stays `Y ul barl X`, as with *if*.
  - Rejected: glue plus stand-in (an exception to a rule the page states twice, a host-less `barl` clause with no reading, a duplicate of `ul zazawan vowogal.`, and `barl` after every fronted hook), and banning the form (it fills a taught slot, at no stated cost).
  - **Lands in batch 5a:** [hooks § since](../grammar/hooks.md#since) gains the answer example (`ul barl zalahen vezebal.`) and a line that the pair keeps its usual order; the parser treats any `/b/` word after a fronted hook, stand-ins included, as an extra noun; `al barl` / `ol barl` / `el barl` at the front are rejected under "only `ul` takes `barl`" (check that the rejection names that rule, and list them in `unassigned-reserved.md` if missing).

**Cause 7 / row 1, number `/ɡ/` after a hosted `/b/`.** This is taught. [Clause](../grammar/clause.md) says an adjective after a hosted `/b/` describes that `/b/`: after an `/h/` host (the extra-nouns section, "an adjective after its `/b/` describes that extra noun") and after a relation adjective's pair ("a plain adjective after that pair describes the **extra noun**"). [Measure phrases](../grammar/numbers-applied.md#measure-phrases) put the amount on the unit as a `/ɡ/` number. So a number `/ɡ/` there is **never** the clause's own `/ɡ/`, and the fork in the report is internal: *amount* (`OPTION6`) or *adjective on the landmark* (`MANY5`). Both attach to the same `/b/`.

- **Grammar:** split number `/ɡ/` by marker into token categories: scalar (cardinal), ordinal, and label. The amount slot takes only a scalar. The adjective path takes ordinals and labels, which may host their own `/b/`, plus ordinary `/ɡ/`. The fork disappears, and the AST matches today's, so the snapshot should stay empty.
- **Settled after batch 4:** an adjective after a `/th/` host's `/b/` describes that `/b/` too ([clause § complex chaining](../grammar/clause.md#complex-chaining)).

### 4. Cause 3: is a run of same-role words without a join ever one list?

**Decided (2026-10-08): no, and it is not a sentence either.** More than one noun in a slot, or more than one verb, takes a join ([joins § right-close](../grammar/joins.md#right-close)). Adjectives and adverbs need none: each describes on its own.

- **What the parser did before.** The recommendation here assumed the AST already split join-less runs into separate units. It did not: `zazawan zalahen vowogal.` gave one `/z/` phrase whose single part had two items and no join. Only `/h/` runs came out as separate units, and `/ɡ/` runs stacked on a noun.
- **Rule shape:** `list → part+`, with `part → item+ bar* JOIN` or a lone join, and the clause chain forbids two phrases of one slot side by side. A single item followed by a join stays valid (single-item *not X*, [denying a list](../grammar/joins.md#negation-u)).
- **Out of scope:** two `/z/` phrases with something between them (`zavahal al zazawan`, a range hook) stay grammatical.

## Costs and risks

- **Dependency:** allstar is version 0.x with one main maintainer and ties into Chevrotain internals, so a major Chevrotain upgrade waits for an allstar release. It is used by Langium; if it were abandoned, a gate-free grammar moves to Lezer.
- **Behavior:** where alternatives overlap, ALL(\*) may pick differently from LL(2). The snapshot diff catches each case.
- **Debugging:** a branch decision moves from a readable gate into the grammar's structure.
- **Bundle:** allstar depends on `lodash-es`. The published site does not bundle the parser, so this only affects Node tooling.

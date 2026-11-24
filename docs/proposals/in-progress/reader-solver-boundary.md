# Reader and solver boundary

**Status:** IN PROGRESS. Phase 1 done 2026-11-24: U1 restrictor occasions (602ba9cb), U3 solver-note check dropped (c5a1ec3e), U2 link values (f945c899). Next: phase 2 (U4 to U6). D1 settled by the editor: (a), `ask` honors the supposition link.
**Related:** [interpreter.md](../../meta/interpreter.md) ([links](../../meta/interpreter.md#links), [reader rules](../../meta/interpreter.md#reader-rules), [parse or reading](../../meta/interpreter.md#parse-or-reading), [matching](../../meta/interpreter.md#matching)), [solver.md](../../meta/solver.md) ([translation table](../../meta/solver.md#translation-table), [the edge](../../meta/solver.md#the-edge)), [`read.ts`](../../../src/interpret/read.ts), [`types.ts`](../../../src/interpret/types.ts), [`log.ts`](../../../src/interpret/log.ts), [`ask.ts`](../../../src/interpret/ask.ts), [`match.ts`](../../../src/interpret/match.ts), [`translate.ts`](../../../src/interpret/translate.ts), [`translate-say.ts`](../../../src/interpret/translate-say.ts)  
**Depends on:** none
**Design authority:** *none*. No form or reading changes. `ask` answers change only where `ask` lacked the turn persons the solver already uses (B3).

## Findings

Line numbers are from 2026-11-21 and may have drifted; grep for the named identifiers.

**B3. Turn persons.** The reader gives *I* and *you* their own term kinds (`speaker`, `listener`, [`read.ts:118-119`](../../../src/interpret/read.ts#L118-L119)), but gives *we* (`zayan`) none. So [`match.ts:232-236`](../../../src/interpret/match.ts#L232-L236) and [`translate.ts:242`](../../../src/interpret/translate.ts#L242) each test `root === CLOSED.handshake && named && !plural`. Mapping a turn's speaker, listener and *we* to people (`speaker()`, `listener()`, `person()`, `we()`, `site()` at [`translate.ts:168-216`](../../../src/interpret/translate.ts#L168-L216), from `LogEntry.addressees`) happens in the Translator. `ask` fills only the target's `speaker` ([`ask.ts:113-114`](../../../src/interpret/ask.ts#L113-L114)). So in the loop, `zawan` after a call to Azozon does not fit `zazozon`, while in the solver it does (R4a-8, D16).

**B4. Holder and say-word parties.** `holderOf` ([`translate-say.ts:192-230`](../../../src/interpret/translate-say.ts#L192-L230)) works these out from the word itself:

- the generic and topic pronouns (`isGenericPronoun`, `isTopicPronoun` from `parse/resolve.ts`);
- holders on the microphone and headphones roots, although the reader makes only a `-n` headphones holder a `listener` term ([`read.ts:608`](../../../src/interpret/read.ts#L608));
- a `-r` holder with no antecedent, whose name it builds from `rightRoots` ([`translate-say.ts:199`](../../../src/interpret/translate-say.ts#L199)).

On `v`, the say word's `Who` comes from its ending: `-m` speaker, `-l` `rules`, `-r` `unsaid` ([`translate-say.ts:141`](../../../src/interpret/translate-say.ts#L141)). The reader already fills `frame.party` for holders and sakes.

**B5. A NOTIONAL question's supposition.** For a question, the solver picks the latest NOTIONAL reading in the log, and spots a question by `reading.id.startsWith("?")` ([`translate-say.ts:98-100`](../../../src/interpret/translate-say.ts#L98-L100)). Choosing which earlier reading a frame refers to is link resolution, of the same kind as `carriedFrame`. `ask` matches a NOTIONAL question against any NOTIONAL reading.

## Design

- **B3.** The reader reads `zayan` (the singular, named handshake word) as a new term kind `{ kind: "we"; word }`, beside `speaker` and `listener`. `zayanx` stays the `grp(..)` thing. `log.ts` gains one function that gives a log entry's persons, `{ speaker, listener, we }`, as the opaque id strings the solver writes today (`sp("…")`, `listener(N)`, `we(…)`, a name's root id). The function is moved from the Translator, not rewritten. The Translator calls it, keeping its own constant for a first-mention addressee. `ask` puts the entry's persons in `targetSite`. `equal.ts`, `reply.ts`, `game/host.ts` and every other `kind === "listener"` consumer handle `we` the way they handle `listener`.
- **B4.** `holderParty` gives the party the term the word gets in a role:
  - a topic or generic pronoun is a `pronoun` term, which gains `sort?: "generic" | "topic"`, set by the reader in roles and parties alike from `parse/resolve.ts`'s helpers;
  - the microphone root is a `speaker` term, and the headphones root is a `listener` term on any ending;
  - a `-r` holder whose bind has no antecedent is the named thing it spells ([holder.md](../../grammar/intermediate/holder.md#naming-a-holder)).

  On the say frame, the reader sets `party` to the hosted `bl-` word. With none, on `v`, it sets a `speaker` term for `-m`, and `values.source` `rules` for `-l` or `unsaid` for `-r` ([say words](../../grammar/intermediate/permission-consent.md#say-words)). `holderOf` and `sayWrap` switch on term kinds and values only. The `CLOSED.*` and `is*Pronoun` tests leave `translate-say.ts`. The solver's output for each fixture stays byte-identical.
- **B5.** `readQuestion` (`log.ts`) adds a link `{ kind: "supposition", key: "link:supposition", to }` from a question's NOTIONAL frame to the latest stated NOTIONAL reading in the log. With none, there is no link. The solver takes the supposition from the link and tells a question by its force frame, not by its id prefix. Whether `ask` also honors the link is decision D1.

## Implementation plan

One phase left, run through subagents. At its end, and if the user says to stop partway, the orchestrator [consolidates the proposal](../../meta/procedures/proposals.md#consolidate) before the session ends. Phase 2 changes shared shapes (`Term`, `LogEntry`) and `ask`.

**Gates.** The orchestrator saves `npm run verify -- --baseline` at the start of the phase. Each unit ends with `npm run verify` and passes before its commit. The proposal touches no prose under `docs/grammar/`, so it has no style gate and no recall gate. The final gate is a full `npm run verify` against an empty baseline.

**Golden files.** No phase 2 unit changes a solver answer: every `src/interpret/fixtures/solve-*.lp` golden stays unchanged.

**Built in phase 1** (for briefs):

- `Link.values?: Record<string, string>` exists. `link()` in `read-context.ts` fills it from `wordValues` (`series` / `ending`) plus a `gloss` from the parse stage's labels (`linkerEnglish`, `hookLabel`, `joinMarkerLabel`). `equal.ts` compares links field by field and leaves `values` out. The [links](../../meta/interpreter.md#links) table is followed by a paragraph naming which links carry `values`; a new link kind (U6) is added there if it carries any.
- The solver's restrictor test reads `Frame.occasions` (`translate.ts`, `translate-conditions.ts`).

### Phase 2: shared shapes

**U4. Turn persons (B3).**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Add the `we` term kind. Move the persons function into `log.ts`, and have the Translator and `ask` both read it. Remove the `CLOSED.handshake` tests from `match.ts` and `translate.ts`. Add an `ask` test: after a call to Azozon, a logged `zawan vowurol.` answers `zazozon vowurol.`, as the solver already does. Document the persons function under [the log](../../meta/interpreter.md#the-log) and the site under [matching a claim](../../meta/interpreter.md#matching-a-claim), and point R4a-7 / R4a-8 in [the edge](../../meta/solver.md#the-edge) at it. If a `run.test.ts` or `src/game/` test changes outcome, stop and report. Do not edit the test.  
**May edit:** `src/interpret/types.ts`, `src/interpret/read.ts`, `src/interpret/log.ts`, `src/interpret/ask.ts`, `src/interpret/match.ts`, `src/interpret/translate.ts`, `src/interpret/equal.ts`, `src/interpret/reply.ts`, `src/game/host.ts` (term-kind switch only), the matching `*.test.ts` files (new cases only), `docs/meta/interpreter.md`, `docs/meta/solver.md`.

**U5. Holder and say-word parties (B4).**  
Agent `proposal-worker`, `model: opus`, effort `high`.  
Fill the parties in `holderParty` and on the say frame, and add `pronoun.sort`. Simplify `holderOf` and `sayWrap` to switch on kinds and values only. All solver goldens stay unchanged. Add reader tests for each party shape listed in the design. Update [Holders row 3 and row 5](../../meta/solver.md#holders-and-say-words) to say the reader gives the party, and the holder entry in [links](../../meta/interpreter.md#links) or the `party` description in [terms](../../meta/interpreter.md#terms).  
**May edit:** `src/interpret/types.ts`, `src/interpret/read.ts`, `src/interpret/read.test.ts`, `src/interpret/translate-say.ts`, `src/interpret/translate.ts` (pronoun term writing only), `src/interpret/equal.ts`, `docs/meta/interpreter.md`, `docs/meta/solver.md`.

**U6. NOTIONAL supposition link (B5).**  
Agent `proposal-worker`, `model: opus`, effort `medium`.  
Add the link in `readQuestion`, with its row in the [links](../../meta/interpreter.md#links) table and, if the coverage test asks, the [classification table](../../meta/interpreter.md#classification-table). Switch `translate-say.ts` to the link and to the force frame. Apply D1 as settled. Rewrite the question sentence of [row 45](../../meta/solver.md#translation-table) to name the link. Solver goldens stay unchanged.  
**May edit:** `src/interpret/log.ts`, `src/interpret/types.ts`, `src/interpret/translate-say.ts`, `src/interpret/ask.ts` (only per D1), the matching `*.test.ts` files (new cases only), `docs/meta/interpreter.md`, `docs/meta/solver.md`.

**Phase 2 close.** *Orchestrator.* Full `npm run verify` against an empty baseline, then `npm run sweep -- --diff` against the `--save` taken at the start of phase 1 (`tmp/state/sweep-accounting.json`; do not re-save before the diff). The unused and left counts must not rise. Then, once `interpreter.md` and `solver.md` own the result, delete this file ([consolidate](../../meta/procedures/proposals.md#consolidate)).

### Rule digest (copied into every brief)

```text
Ageben reader/solver boundary. You change where meaning is computed, not what it is.
- No form, reading or translation-table row changes. If one seems needed, stop and report.
- The reader (read.ts, read-context.ts, log.ts) copies what the parse and resolve stage say;
  consumers (translate*.ts, match.ts, ask.ts) never test spellings, roots or id prefixes for meaning.
- Never walk the parse tree outside the reader. A missing fact is a reader field.
- Parser behaviour does not change. If a fix seems to need a parser change, stop and report.
- Solver goldens (src/interpret/fixtures/solve-*.lp) must stay byte-identical unless your item
  says an answer changes; never regenerate a golden you did not mean to change.
- Never loosen, delete or edit an existing test assertion; add new cases only.
- Run .ts probes with `npx --no-install tsx`; tests with `npm test -- FILE`; check sentences with
  `node scripts/parse.mjs --check-lexicon '<a>' '<b>'` and solver cases with one batched
  `node scripts/reading.mjs probe FILE` (no --program in a batch).
- End the item with `npm run verify` (use --fast inside the item). On a new error, read only
  that line of tmp/logs/verify-last.log.
- Read code by outline first: `npm run -s outline -- FILE`, then the ranges you need.
- Meta notes (docs/meta/interpreter.md, solver.md): edit only the rows and notes your item names;
  no grammar pages. Never link to docs/proposals/.
- Do not commit. Scratch files go in tmp/scratch/.
At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls.
If a significant amount is left (more than a few edits, or pages you have not read yet), stop at
a clean point, leave the tree green, and report: done, left (as steps), files touched.
Report (about 150 words): done (one line); fields the reader gained; answers that changed (case,
old → new); verify line; decisions you could not settle (problem, options, Recommendation with
confidence); left; inefficient.
Full rules if the digest does not settle it: docs/meta/interpreter.md#parse-or-reading,
docs/meta/solver.md#adding-a-row, docs/meta/procedures/proposals.md#stop-and-alert.
```

### Commits

Four more commits, each message starting `reader-solver-boundary.md <unit>:`, then `[skip-cd]` and the co-author line: U4, U5, U6, then the final commit, which deletes the proposal. A review-later decision adds its own commit.

## Open decisions

None open. D1 is settled (Status line).

## Background

### Problem

[Parse or reading](../../meta/interpreter.md#parse-or-reading) says the reader turns a parse into meaning, and every other tool reads readings. The solver should only translate readings into a program. A comparison of the two (2026-11-21) found five places where the solver works out meaning itself, from spellings, roots or log position. It also found one place where it ignores a field the reader already fills. One reader question is filed in the solver's note.

### Goals

- The solver reads every piece of meaning it needs from the reading or the log. It does no spelling or root tests of its own.
- `ask` and the solver use one source for who a turn's speaker, listener and *we* are.
- Each meaning the reader takes over is recorded in `interpreter.md`, and the solver note stops describing work the reader now does.

### Non-goals

- New translation-table rows, or changes to what a row claims. If a unit finds it needs one, it stops and reports ([adding a row](../../meta/solver.md#adding-a-row)).
- Changing how the solver writes the generic pronoun in a role. Today it writes `pro(..)`. Writing it as the one `generic` constant would be a new reading.
- The range hook's spelling inside `rng(..)` ([`translate-helpers.ts:75`](../../../src/interpret/translate-helpers.ts#L75)). That spelling is the term's identity, and nothing in the solver chooses a meaning from it.

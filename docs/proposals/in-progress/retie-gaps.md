# Retie gaps: what a lexicon retie still leaves by hand

**Status:** IN PROGRESS (2026-11-19): phase 1 started. The scope follows the 2026-11-19 retie (107 five-letter roots, size-first placement) and a scan for that retie's old spellings left in tracked files. Not design authority; when carried out, the rules live in [retie.md](../../meta/procedures/retie.md) and this file is deleted.

**Related:** [retie.md](../../meta/procedures/retie.md) (known issues), [lexicon.md § respelling a row](../../meta/procedures/lexicon.md#respelling-a-row), [`scripts/retie-docs.ts`](../../../scripts/retie-docs.ts), [`src/retie/`](../../../src/retie/) (`markdown.ts`, `source.ts`, `derived.ts`, `fixtures.ts`), [initials](/initials#initials) and [`src/lint/initials-docs.test.ts`](../../../src/lint/initials-docs.test.ts), [`src/tts/numbers.ts`](../../../src/tts/numbers.ts) (`numberWordToSpeech`), [`src/tts/phonemes.test.ts`](../../../src/tts/phonemes.test.ts), [`src/tts/plan.test.ts`](../../../src/tts/plan.test.ts), [`src/parse/lexicon-check.test.ts`](../../../src/parse/lexicon-check.test.ts), [`src/parse/inspect.test.ts`](../../../src/parse/inspect.test.ts), [`src/find/query.test.ts`](../../../src/find/query.test.ts), [solver.md](../../meta/solver.md).

**Depends on:** none. **Order:** none.

**Design authority:** *none*. Tooling and tests only: no form or reading changes, and the parser's accept/reject behavior does not change.

## Problem

`retie-docs` rewrites Ageben in docs, source string literals and (since 2026-11-19) solver fixtures. [retie.md](../../meta/procedures/retie.md) lists what it still leaves to a person. Several of those are mechanical, so a person redoes the same fix after every retie, and a few fail silently:

1. **Initials.** A title's initials handle (`z@_nl`) and its spoken form (🔊 `zrenulan`) copy the title roots' first consonants. The retie respells the title but not the handle; `initials-docs.test.ts` fails, and the handle and its 🔊 lines are fixed by hand. Under size-first placement a root can lose its English first consonant, so a title root's first consonant moves more often than before.
2. **IPA test inputs.** `phonemes.test.ts` and `plan.test.ts` test sound conversion on words whose spelling is arbitrary (`gozulamum`). They pass with a stale spelling. They break only because the retie respells the input word and not the expected IPA beside it.
3. **Ageben in source comments.** Comments are never retied, so a backticked example in a comment goes stale: after the 2026-11-19 retie, `wal al bohehal` in `src/parse/scope.ts` and `src/interpret/read.ts`, and `zexual blahehal` in `src/parse/types.ts`, still spell *house* as `oheha` (now `amaha`).
4. **Forms the retie cannot read.** A rejected or reserved form does not parse, so the retie skips it with no review line. `gorxahehal` in [design-decisions.md](../../meta/design-decisions.md) and [unassigned-reserved.md](../../meta/unassigned-reserved.md) still spells *shop* as `aheha` (now `awaha`). Encoding atoms in [solver.md](../../meta/solver.md) (`isa(X,oboza)`) are not Ageben to the retie either.
5. **Tests that rest on a lexicon coincidence.** `lexicon-check.test.ts` and `inspect.test.ts` (and parts of `find/query.test.ts`) hard-code roots whose relation (two roots that make an unlisted stem, a possible second split) holds only in the lexicon they were written against. The 2026-11-19 retie broke `inspect.test.ts` this way.
6. **A stale known issue.** `retie.md` lists `ezuzo` in `ageben-docs.test.ts` as a spelling that must stay unknown. The test already picks the first unpublished spelling from a list ([`ageben-docs.test.ts`](../../../src/lint/ageben-docs.test.ts)), so the row no longer applies.

## Goals

- A retie fixes initials handles and their 🔊 lines with the title.
- The TTS spelling-fixture tests survive a retie untouched.
- Backticked Ageben in source comments is retied like a doc code span.
- Every remaining old spelling the retie cannot rewrite shows up as a review line, never silently.
- The coincidence tests build their roots from the lexicon, so a retie leaves them passing.
- `retie.md` lists only what is still left to a person.

## Non-goals

- Retieing house names or other English in source comments. The rule stays: a comment states the rule, not a house name.
- Rewriting forms that do not parse. They are listed for review only: the map's new roots are often other rows' old roots, so a substring rewrite in text the parser cannot split could hit the wrong boundary.
- IPA inside tables or prose, letter-by-letter spellings without the `letter-names` marker, examples that rest on a spelling coincidence, bare-resume warnings with no keep, and the language name. These stay as `retie.md` describes them.

## Design

### Initials follow their title (U1)

A new `src/retie/initials.ts`, run in the Markdown passes next to `respellDerived`:

- For each word change whose old and new forms are hyphenated titles (the `x`-compound name shape `initials-docs.test.ts` reads), compute the old and new initials from the roots' first consonants (`th` as one letter), the same way the test does.
- When they differ, on that page rewrite every handle that spells the old initials on that title's marker forms (`z@_old`, `z=_old`, and the other marker letters the word grammar allows), and every 🔊 span that spells the old handle's speech, from `numberWordToSpeech(parseWord(handle))`.
- When two titles on one page share the old initials, rewrite nothing for them and print a review line naming both.
- Each rewrite is listed in the dry run like any other change.

### Source: skip marker and comments (U2)

- **Skip marker.** A source file with `// retie: skip` on a line of its own is left out of the source pass, like `<!-- retie: skip -->` on a page. `phonemes.test.ts` and `plan.test.ts` take it. Before marking `plan.test.ts`, confirm `previewPhonemes` gives the same IPA when the word's root is unpublished; if it does not, build the word from `CLOSED` and keep the IPA expectation as a literal (an expectation is never computed by the code under test).
- **Comments.** Backticked spans inside `//`, `/* */` and JSDoc comments under `src/`, `scripts/` and the site are retied with the Markdown code-span logic (the same classifier: only spans the doc lint reads as Ageben). The comment text is passed through `rewriteMarkdown` and spliced back; respellings keep their length, so offsets hold. Unbackticked words and names in comments are not touched. Files on `SOURCE_SKIP` or marked `retie: skip` are skipped here too.

### What the retie cannot read (U3)

- **Review line.** In every pass (Markdown, fixtures, comments, string literals), a code span or literal that does not parse with the old tables and contains a map old root as a letter run prints `review  <span> spells old root X (now Y) in a form that does not parse`. No rewrite.
- **Encoding atoms.** In a Markdown code span that reads as solver encoding (it contains `holds(`, `isa(` or `:-`), a lowercase token that is exactly a map old root, bounded by non-letters, is rewritten to its new root. Only exact whole tokens: a root inside a longer token is left to the review line.

### Coincidence tests (U4)

`lexicon-check.test.ts`, `inspect.test.ts` and the hard-coded parts of `find/query.test.ts` pick their roots from the loaded lexicon: for example, the first two published five-letter roots whose `l` stem is not a listed compound, for *shows potential dictionary compounds for an unlisted stem*. The expected values are built from the roots picked, the way `ageben-docs.test.ts` picks an unknown spelling. Then the `retie.md` row for these tests goes, with the stale `ezuzo` row.

## Implementation plan

One phase, carried out in the orchestrator's session: four units, all in `src/retie/`, `scripts/retie-docs.ts`, a few tests and `retie.md`, none touching grammar prose. No subagents: each unit reads one or two source files in slices, which costs less than a subagent's cold start. At the end of the phase, and if the user says to stop partway, the orchestrator [consolidates the proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

**Gates.** `npm run verify -- --baseline` before U1. After each unit, its new unit tests, then `npm run verify` (PASS, no new errors). The final gate is a full `npm run verify` that passes against the baseline. No style gate: no prose under `docs/grammar/` changes.

**Acceptance run.** U1 and U3 are checked against real data with a dry run, never `--write`: copy `tmp/state/lexicon-retie-map.json` to the scratchpad and strip `appliedAt`, then `npm run retie-docs -- --map <copy>`. The run reports collisions as blocking because the docs already carry the new spellings; ignore those and check that the U3 review lines list `gorxahehal` (both meta pages) and that the comment pass from U2 lists the three comment examples above. For U1, add to that copy a synthetic pair that moves a title root used on [initials](/initials#initials) to a root with a different first consonant, and check that the dry run respells the handle and its 🔊 lines.

**U1 Initials follow their title.** *orchestrator.* Add `src/retie/initials.ts` per [the design](#initials-follow-their-title-u1), call it from `scripts/retie-docs.ts` next to `respellDerived`, and test it in `src/retie/initials.test.ts` (a handle and its 🔊 line move with the title; a shared-initials pair gives a review line and no rewrite; a title whose initials keep their letters changes nothing). In `retie.md`, replace the **Initials** bullet with one line saying the retie moves handles and 🔊 lines, and names the shared-initials review case.
**May edit:** `src/retie/initials.ts`, `src/retie/initials.test.ts`, `scripts/retie-docs.ts`, `docs/meta/procedures/retie.md`.

**U2 Source skip marker and comments.** *orchestrator.* Add the `// retie: skip` marker and the comment pass per [the design](#source-skip-marker-and-comments-u2), mark the two TTS tests after the `previewPhonemes` check, and retie the three stale comment examples by running the new pass with the 2026-11-19 map copy (dry run first; then apply only those comment changes by hand, since the map is stamped). Tests in `src/retie/retie-tokens.test.ts` or a new `src/retie/comments.test.ts`. In `retie.md`: the **Names** bullet says backticked Ageben in comments is retied and English in comments is not; the IPA row of the tests table goes; the marker joins [retie-safe writing](../../meta/grammar-docs.md#retie-safe-writing) only if that section lists the Markdown marker (else `retie.md` names it).
**May edit:** `src/retie/source.ts`, `src/retie/comments.ts`, `src/retie/comments.test.ts`, `src/retie/retie-tokens.test.ts`, `scripts/retie-docs.ts`, `src/tts/phonemes.test.ts`, `src/tts/plan.test.ts`, `src/parse/scope.ts`, `src/interpret/read.ts`, `src/parse/types.ts` (comments only), `docs/meta/procedures/retie.md`, `docs/meta/grammar-docs.md` (the marker line only).

**U3 Review what the retie cannot read.** *orchestrator.* Add the review line and the encoding-atom rewrite per [the design](#what-the-retie-cannot-read-u3), with tests. Run the acceptance dry run; if the review lines run past about 20 on the current tree, narrow the trigger (for example, skip spans under 4 letters, or spans the lint already marks as wrong forms) and say so in the commit. Fix the stale `gorxahehal` / `gaxahehaxal` examples and the `solver.md` atom by hand from the review list. In `retie.md`: a bullet under [docs](../../meta/procedures/retie.md#docs) for the new review line, and the solver encoding row of the tests table goes.
**May edit:** `src/retie/markdown.ts`, `src/retie/source.ts`, `src/retie/fixtures.ts`, `src/retie/comments.ts`, their tests, `scripts/retie-docs.ts`, `docs/meta/design-decisions.md` and `docs/meta/unassigned-reserved.md` (the stale spellings only), `docs/meta/solver.md`, `docs/meta/procedures/retie.md`.

**U4 Coincidence tests from the lexicon.** *orchestrator.* Rewrite the hard-coded coincidence cases in `lexicon-check.test.ts`, `inspect.test.ts` and `find/query.test.ts` per [the design](#coincidence-tests-u4); each test still asserts the same behavior. In `retie.md`, drop the lexicon-coincidence row and the `ezuzo` row; if the tests table is then left with only the retie tool's own tests, fold that row into a sentence.
**May edit:** `src/parse/lexicon-check.test.ts`, `src/parse/inspect.test.ts`, `src/find/query.test.ts`, `docs/meta/procedures/retie.md`.

**Commits.** Five, each staging only its unit's files, message starting `retie-gaps <unit>:` and ending `[skip-cd]` and the co-author line: one per unit (U1–U4), then a last commit that deletes this proposal once [retie.md](../../meta/procedures/retie.md) carries every rule (or, if stopped partway, commits the consolidated proposal instead).

## Open decisions

None. Two calls are settled in the design above: forms that do not parse get a review line, never a rewrite (a substring rewrite could hit the wrong boundary), and a shared-initials pair is left for review rather than guessed.

# Optimization review: vocab-flashcards full run

**Status:** IDEA, written 2026-11-21, from the token review of the full run of `vocab-flashcards.md` (runner session `67f2111b`, 46 subagents, 10.6M weighted tokens).

**Related:** [AGENTS.md](../../../../AGENTS.md), [agents-md.md](../../../meta/agents-md.md), [phase-executor.md](../../../../.claude/agents/phase-executor.md), [proposal-worker.md](../../../../.claude/agents/proposal-worker.md), [full-execution.md](../../../meta/procedures/full-execution.md), [parser-pipeline.md](../../../meta/parser-pipeline.md#repo-layout), [verify.ts](../../../../scripts/verify.ts).

## Problem

Costs are weighted tokens, as `npm run token-report` counts them (cache write 1.25× at 5 min, cache read 0.1×, output 5×).

1. **Standing context that no subagent used: about 600k.** Every subagent's first message carries `AGENTS.md` (about 6k tokens) and the claude.ai Claude Docs MCP instructions (about 0.6k). Of that, the Sources of truth tables (about 3.6k; the grammar table alone is 2.1k) and the MCP block never helped here: the briefs named every page and file a worker opened, and the executors routed from the proposal. 45 subagents wrote that context fresh (16.5k uncached on nearly every first call), and the 950 subagent calls each read it again. That comes to about 4.2k × 158 ≈ 660k, of which the grammar table is about 340k and the MCP block about 99k. For these agents it should have cost close to nothing.
2. **Executor cache expiry while a worker runs: 469k, of which about 430k was avoidable.** Subagents cache for 5 minutes; the runner caches for 1 hour. An executor blocks on a foreground Agent call, so when a worker takes more than 5 minutes, the executor rewrites its whole context when the worker returns. This happened 6 times: Phase 2 after the first U6 run (52k), Phase 3 rest after E4 (74k), Phase 4 after U17, U19 and U22 (55k, 65k, 75k), and Phase 6 after the parallel U28 and U30 (52k). In all, 375k tokens were rewritten at 1.25×, where warm cache reads would have cost about 38k.
3. **Workers searching for code entry points: about 220k, about 170k avoidable.** U14 (calls 5–19, 109k) spent 15 calls finding how to walk every Ageben example in the docs and see each word's overlay: through `parser-pipeline.md`, `classify.ts`, `types.ts`, `ageben-docs.ts` and `ast-walk.ts`. U17 (calls 13–23, 111k) spent 10 calls finding the site origin for the anchor `link` field (it is `SITE_ORIGIN` in `scripts/lib/llms-txt.ts`). It also grepped `MorphWord` and `visitResult` again, after U14 had already used them. Recurring shapes show the same pattern: `export type LexWord` was grepped in 7 subagents, `OverlayRow` in 5, `MorphWord` in 3. With the entry points named, each search would have taken 2 or 3 calls, about 25k.
4. **Chasing a check failure that did not come back: about 75k.** U17's `npm run flashcards` failed once: the Claritish release search found all 98 notes. U17 then spent 8 calls (55–62, 86k at about 95k context) rerunning the import check on old and new copies, on stripped packs, and on several pack orders. All of them passed. One rerun and a line in the report would have cost about 10k.
5. **Executors reading the proposal's Background: about 35k.** Six of the seven executors read the whole proposal with one `Read`, including the 0.9k-token `## Background` that consolidation moves to the end so that it can be skipped. That section was then carried through 21–54 calls each and rewritten on every cache expiry. The Phase 5 executor read from the top to Background only (`sed -n 1,203p`), which is the intended shape.
6. **A verify FAIL line that did not name the fix: 32k.** After the Phase 3 rest executor edited `data/lexicon-overlays.csv`, verify failed with only the key `test | generated WordNet index`. The executor then spent 3 calls at about 93k context (calls 46–48) grepping `tmp/logs/verify-last.log` for the assertion, which says `run npm run english-helper-wordnet`. Had the summary printed the assertion, the next call would have been the fix.

## Sketch

1. **Standing context.** Keep the routing that subagents with a brief never use out of their context (shapes under Open questions). Disable the claude.ai Claude Docs connector for this project, since no task here creates claude.ai docs. Files: `AGENTS.md`, `docs/meta/agents-md.md` (its *Include* item 2), and possibly a new routing page under `docs/meta/`.
2. **Keep the executor's cache warm.** In `.claude/agents/phase-executor.md` and the *Phase executor* section of `full-execution.md`, the executor launches each worker in the background, along with a background `sleep 270`. Each time the sleep ends and the worker has not reported, it starts another sleep. Each wake costs about 0.1× context (7–9k at 75k), against about 90k for a rewrite. That is the runner's 45-minute keep-alive, sized for a 5-minute cache.
3. **Name the entry points once.** Add a short *Library entry points* list under *Repo layout* in `docs/meta/parser-pipeline.md`:
   - walk every Ageben code span in the docs: `walkAgebenSpans`, `classifyAgebenSpan` (`src/lint/ageben-docs.ts`)
   - parse with tables: `parseWithTables` (`src/parse/parse-core.ts`), `loadDefaultTables` (`src/parse/index.ts`)
   - visit words: `visitResult` (`src/parse/ast-walk.ts`)
   - the site origin: `SITE_ORIGIN` (`scripts/lib/llms-txt.ts`)

   In `proposals.md` (step 2, briefs), the *built by earlier units* notes also list the library helpers each unit used, not just what it built.
4. **Flaky checks.** In the *Working* section of `.claude/agents/proposal-worker.md`: when a check fails and then passes on a rerun with no edit, the worker reports it as a possible flake, quoting the failing line, and does not bisect it. Optionally, the release-search failure in `scripts/flashcards-check.py` could also print the found notes' decks and release tags, so that one run shows the cause.
5. **Read to Background.** In `.claude/agents/phase-executor.md`, before you start, the executor lists the proposal's headings (`npm run -s outline`) and reads from the top to `## Background`, opening Background only when a unit needs it.
6. **Verify prints the assertion.** In `scripts/verify.ts`, under each new `test | …` key, print the first assertion message for that test from the log, clipped with `clip()`.

## Open questions

- **How to keep routing out of subagents (finding 1).** The options:
  - (a) A Claude Code agent setting that leaves project instructions out of a custom subagent, if one exists (not verified). `proposal-worker.md` and `phase-executor.md` would then restate the tooling notes they need, much as they already restate parts of `proposals.md`.
  - (b) Move the grammar table out of `AGENTS.md` into a routing page that `AGENTS.md` points to. Main sessions would pay about 2.5k once, for each grammar task.
  - (c) Leave it as it is.

  **Recommendation:** check (a) first; failing that, (b) for the grammar table only, because a full run pays for it 45 times. Confidence **low**: (b) changes the `agents-md.md` policy and every main session's routing.
- **Does a background worker work inside an executor (finding 2)?** It depends on whether a subagent gets woken by its background Agent and Bash completions, as the runner does. If not, the fallback is to size units under about 5 minutes, or to run independent units in parallel so that a batch costs one rewrite. **Recommendation:** try the keep-alive on one small phase first. Confidence **medium**.
- **Where entry points live (finding 3):** in `parser-pipeline.md` (near the parser), or in `code-layout.md` (with the rest of the source layout). **Recommendation:** `parser-pipeline.md` *Repo layout*, because it already lists `ast-walk.ts` and `types.ts`. Confidence **medium**.

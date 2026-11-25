# Tips from scope-model: token spend

**Status:** IDEA, 2026-11-25.  
**Related:** [proposal-plans.md](../../../meta/procedures/proposal-plans.md#the-plan-section), [proposals.md](../../../meta/procedures/proposals.md#running-with-subagents), [grammar-docs.md](../../../meta/grammar-docs.md#cheat-sheets), [AGENTS.md](../../../../AGENTS.md), `.claude/agents/proposal-worker.md`, `scripts/verify.ts`, `scripts/hooks/guard-long-output.mjs`, `.claude/settings.json`. The run reviewed is the full run of `scope-model.md`, phases 2 to 5 (7 sessions, 27 workers, 11.2M weighted tokens; executors and runner 3.7M, workers 7.5M).

Not design authority. Tooling and procedure only.

## Problem

Costs are weighted tokens (cache read 0.1×, 1 h write 2×, 5 min write 1.25×, output 5×), summed per cause over every agent it touched.

1. **S11 was planned on a premise nobody checked (about 225k).** The plan gave S11 (*goodbye ends slots*) `discourse-slots.ts`, `read.ts` and their tests. But the reader cannot see which sentence is a goodbye: `resolve.ts` keeps `ctx.goodbyes` and passes it only to `carriedFrames`, and `ResolveInfo` has no goodbye field. The first S11 worker (phase 4, `a1daaf51`) spent 25 calls finding this out, then stopped with no edits (154k). The executor then checked its finding, rewrote the brief with `types.ts` and `resolve.ts` added, and launched a retry (phase 4 main calls 19–22, about 73k beyond a normal launch). One grep at plan time (`grep -n goodbye src/parse/types.ts src/interpret/read.ts`, about 5k) would have shown it, and S11 would have gotten the right files from the start. Nothing in the plan rules asks a code unit to check that the data its change reads reaches the files it may edit.
2. **L4's brief said "No procedure file applies", so the print lint ran late (about 75k).** L4 (phase 5, `a10ad885`) added the scope cheat sheet. [grammar-docs.md](../../../meta/grammar-docs.md#cheat-sheets) says to run `npm run lint:cheat-sheet-print -- --only ID` after adding a sheet. But `AGENTS.md`'s *Procedures* table has no row for cheat sheets, so the brief named no procedure, and `npm run verify` does not run the print lint. L4 finished without it. The executor then ran the lint, found that a table spilled past a page, briefed L4b and launched it (main calls 40–41, about 26k), and L4b cost 76k. Inside L4, running the lint and splitting the table would have cost about 25k. (L3b, the level-review item, is left out: `checkpoint-writer` may not edit level reviews, so that work needed its own unit anyway. The plan should have listed it.)
3. **Inline edit scripts restated the same helper (about 40k).** 19 of the 27 workers wrote 60 heredoc scripts into `tmp/scratch/` (for example S5c calls 39, 40, 47, 49, 53 and 57, and S4 with 7). Each one declared its own read, count-check, replace and write helper, about 27k characters in all (about 7.5k output tokens, plus their carry). The executors and the runner wrote 6 more as `python3 - <<EOF`. Most of these quote the old text word for word. `proposal-worker.md` (the edit-shape bullet) and step 10 of [running with subagents](../../../meta/procedures/proposals.md#running-with-subagents) already say: use Edit calls for that, and never pass a script inline. Nothing enforces it. With Edit calls the overhead would have been about 5k.

## Sketch

1. **Check a code unit's inputs when its files are listed.** In [the plan section](../../../meta/procedures/proposal-plans.md#the-plan-section), extend the bullet on *the files each unit may edit*. For a unit that makes a stage act on something new, the plan names the field or type the change reads and greps once to confirm it reaches the files listed. If it doesn't, the plan lists the files that carry it there (here `types.ts` and `resolve.ts`). The executor repeats that grep before it writes the brief when the plan predates earlier phases' edits.
2. **Make the cheat-sheet steps findable, and make verify catch a broken print layout.**
   - Add a row to `AGENTS.md`'s *Procedures* table: *Add a cheat sheet, or change a sheet's tables or page breaks* → `grammar-docs.md`, sections *Adding a sheet* and *Print breaks*. A brief then names it.
   - Optionally, have `scripts/verify.ts` run `lint:cheat-sheet-print --only <id>` for each sheet changed since the baseline, so the worker sees the failure itself.
3. **Enforce the inline-script rule with a hook.** Add a rule to `scripts/hooks/guard-long-output.mjs`, or a sibling hook wired in `.claude/settings.json`, that refuses a Bash call writing a script under `tmp/scratch/` from a heredoc, and `python3 - <<` or `node -e` scripts that call `writeFileSync` or `open(…, 'w')`. Its message quotes the rule: Edit calls for quoted old text, several in one response; a Write-tool file for section-level rewrites. Add cases to `guard-long-output.test.ts`.

## Open questions

1. **Where the premise check lives (finding 1).** Options:
   - plan time only, in `proposal-plans.md`;
   - also before each brief, in `proposals.md`;
   - a standing permission in `proposal-worker.md` to also edit the type and plumbing files that the brief's files import, within the same layer, and report it.

   **Recommendation:** plan time plus the executor's re-check before the brief. A standing permission would weaken the brief's file list, which protects the units that follow. Confidence **medium**.
2. **Print lint in verify (finding 2).** The lint needs Playwright Chromium and takes seconds per sheet. Running it only for sheets changed since the baseline keeps `verify` fast on other units. The Procedures row alone might be enough. **Recommendation:** the row first, and verify only if a later run misses the lint again. Confidence **medium**.
3. **Hook only, or also a shared replace tool (finding 3).** A `scripts/replace.mjs` that takes a file of exact-once old/new pairs would remove the boilerplate even for scripts the rule allows. But it would compete with the Edit tool, which the rule prefers. **Recommendation:** hook only. Confidence **medium**.

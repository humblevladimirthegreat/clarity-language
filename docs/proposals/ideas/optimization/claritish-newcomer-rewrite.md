# Optimization review: P1 of claritish-newcomer-rewrite.md

**Status:** IDEA, 2026-11-23.  
**Related:** [claritish-style.md](../../../meta/claritish-style.md), [grammar-docs.md](../../../meta/grammar-docs.md#claritish-track), [`src/claritish-editor/data.test.ts`](../../../../src/claritish-editor/data.test.ts), [`scripts/retarget-id.ts`](../../../../scripts/retarget-id.ts), [`scripts/lint-cheat-sheets.ts`](../../../../scripts/lint-cheat-sheets.ts).

Tooling and procedure only: the sketch adds no form and changes no reading.

The P1 session of `claritish-newcomer-rewrite.md` (session f698d6e5, from its start to commit `938e2c2b`) cost about 2.57M weighted tokens: the orchestrator about 0.73M, six lesson writers (U2 to U7) 0.19M to 0.30M each, and two fact audits 0.20M and 0.23M. Most of it was work the task needed: each writer read the model lesson, the style page and the owning sections, then composed the lesson. Two causes cost more than they needed to. Call numbers below are the tool-call numbers from `npm run -s token-report -- --session f698d6e5 --calls`.

## Problem

1. **Writers searched for what reads or links into their lesson: about 83k, about 70k of it avoidable.** A rewrite renames headings, adds tables and rewrites the practice, so a careful writer first checks what depends on the page. Nothing a writer reads says that, so each writer worked it out from the code:
   - U6, tool calls 10-11 (how `lint-cheat-sheets.ts` reads lesson tables), 13-15 and 18 (repo-wide greps for links into `allowed-required-agreed.md`, then `reading-order.ts`): about 38k.
   - U5, tool calls 13-15 (scripts that might read the lesson's headings, `flashcards-claritish.ts`, `claritish-flows.json`): about 19k.
   - U3, tool calls 12-13 (how `lint-cheat-sheets.ts` reads lesson tables): about 13k.
   - The orchestrator, tool call 31 (a repo-wide grep for links to the `#sakes` anchor U5 removed), costing 13k because each orchestrator turn carries about 95k of context.

   The brief's Notes said the cheat-sheet lint ties lesson tables and that the triggers file reads the gap italics, but not which tables the lint reads, nor what else reads a lesson. The one question that needs a search (does anything link to an anchor I removed?) needs no reading: one call to a tool that lists inbound links would answer it. That should have cost about 10-15k across the run.

2. **An undocumented placement rule failed U7's verify, and finding and fixing it took six calls: about 61k.** U7 tool calls 20-28: after verify failed (`a practice prompt's cue, or a command, places the answer's form as the lesson does`), the writer grepped the log, then the tests, then its own *should* lines, read a slice, made four edits and ran verify again. The test in `src/claritish-editor/data.test.ts` places each practice answer's drop-in the way the journal editor's *Use this* would. For the `you-should` cue (`dropCue` is `yes` in `data/claritish-triggers.csv`) that drops *We should*, so *We should eat together more* becomes *Eat together more `thawether`*, and an answer that keeps *We should* fails. Nothing in `claritish-style.md` says practice answers must read as the editor places them. The writer read that page in full, so one sentence there would have meant no failure, and verify would have passed the first time.

## Sketch

1. **Say what reads a lesson, where writers already read.** Add a short list, about six lines, to `docs/meta/claritish-style.md` near the checklist, or to the Claritish track section of `docs/meta/grammar-docs.md` with a pointer from the style page:
   - lesson tables: `scripts/lint-cheat-sheets.ts`, and exactly which tables it reads (every table in the lesson, or only `## The forms`), so a writer knows whether an explanatory table of drop-ins must match the sheet;
   - gap italics: `data/claritish-triggers.csv`;
   - examples and practice: the lesson round-trip tests in `src/claritish-editor/data.test.ts`;
   - the H1 title and the lesson order: `docs/grammar/.vitepress/lib/reading-order.ts`;
   - inbound anchor links: the command below.

   Give `scripts/retarget-id.ts` a `--list` mode that needs only `--page`, and optionally `--id`, and skips the split preconditions. It would print each inbound reference to the page's ids, so a writer runs it once before dropping a heading. Today `--list` needs `--to` and fails while the id still exists.

2. **State the placement rule in the practice rules.** In `docs/meta/claritish-style.md#examples-practice`, add: a practice answer must read as the journal editor would place its drop-in from the prompt's own cue (or, with no cue, by command). Some cues are dropped, as *should* is: *We should eat together more* is answered *Eat together more `thawether`*. Add a checklist row for it (Build, fails; `src/claritish-editor/data.test.ts`). The phase digest of a later Claritish rewrite then picks it up with the rest of the page.

## Open questions

- **Where the "what reads a lesson" list lives.** Options: `claritish-style.md`, which every writer reads in full, or `grammar-docs.md#claritish-track`, which owns the track's machinery, plus a one-line pointer. **Recommendation:** put it in `grammar-docs.md` and point to it from the style page's checklist, because that section already names the triggers file and the cheat-sheet lint. Confidence **medium**: a pointer costs writers one slice read, while the style page would cost none.
- **A wider `retarget-id --list` or a new tool.** Options: relax `retarget-id --list` as sketched, or add a separate `links-to` script built on the same `findReferences` scan. **Recommendation:** relax `--list`, because the scan already exists and the usage line already documents `--list`. Confidence **medium**.
- **Also improve the test's failure message?** The failure already shows the placed sentence. A hint naming the dropped cue (*the `you-should` cue is dropped*) would shorten a future fix loop, but with the rule documented the loop should not happen. **Recommendation:** document only. Confidence **low**: no basis yet for how often other cues trip it.

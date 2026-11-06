# Proposal: Fixing what the sitting re-audit found

**Status:** partially implemented.
- **Decided 2026-11-06:**
  - Every audit recommendation is accepted: changes D1–D15, and the pass rulings listed in this file's earlier version at commit `ba22e5ab`.
  - The *someone* overlap between `pronouns.md` and `joins.md` is dropped, because that special pronoun leaves in a future update.
  - Percentage points get a unit noun (D16).
  - Each unit's model and effort are set by difficulty (see the plan).
  - A worker may place moved Practice items itself under the exception in the plan.
- **Done:**
  - Workstream 1, commits `c371aa93`–`4d250b42`.
  - Workstream 2, units 2a and 2c–2j (D7, D1, D2, D3, D4, D6, D9, D10, D11), commits `d8bab329` through the 2j commit (the one that also consolidated this file), 2026-11-06.
  - Unit 2b (D8) was skipped because its guard failed. It is waiting on the open decision below.
- **Next:** unit 2k, in a new session. Save a fresh `npm run verify -- --baseline` first.
- **`AGENTS.md` Owns lines to apply at the final step:**
  - From workstream 1:
    - `very-and-slightly.md` → "degree words"
    - `resume-sense.md` → "resume, further: one sense, cross-role recast"
    - `collectives.md` → "groups, further: collectives, each other, addressing several people"
    - `label-reach.md` → "how a label holds: packaging, IDENTITY endings"
    - `universals-domains.md` → "a whole kind: universals, domains"
    - `comparative-arity.md` → "ranking on any scale"
    - `here-there.md` → "here, there, and somewhere"
  - From workstream 2:
    - `phonology.md` row: add "thinking sounds".
    - `speech-moves.md` row: drop "thinking sounds"; the `more-turn-words.md` list gains "rhetorical questions, quizzes"; "tone marks (`tone-marks.md`)" → "tone marks, emphasis and clefts (`tone-marks.md`)".
    - `questions.md` row: drop "rhetorical questions, quizzes (`rhetorical-questions.md`)".
    - `clause.md` row: drop "; emphasis, clefts (`emphasis.md`)".
    - `causation.md` row: "Causation / condition hinges" → "if, only if, iff (condition hinges)". In the same row, "because, iff" → "because", since *iff* is now taught at Beginner on `causation.md`; take the filename from D15.
    - `knowing.md` row: "MAY; live / memory (`live-and-memory.md`); evidentiality …" → "MAY, live / memory; evidentiality (`evidentiality.md`); …".
    - `hooks.md` row: "stacked extra-noun and whose" → "stacked extra-noun".
    - `relations.md` row: "social ties (`social-ties.md`)" → "whose, social ties (`social-ties.md`)".
    - `restrictors.md` row: add "again".
    - `joins.md` row: after "join limits, role grid (`join-limits.md`)" add "; named phrases (`named-phrases.md`)".
    - `digitless-exponents.md` row: "bare OoM, group separator" → "bare OoM, ambient magnitude, group separator".
- **Carried over from the closed sitting-cohesion run:** the user still has to paste `dist/amplify-redirects.json` into the Amplify console ([steps](../meta/site-redirects.md#add-a-remap-page-rename)). Workstream 2 added page remaps for `rhetorical-questions`, `live-and-memory` and `emphasis`.

**Related:** [what one sitting holds](../meta/grammar-docs.md#one-sitting), [page skeleton](../meta/grammar-docs.md#page-skeleton), [recipe track](../meta/grammar-docs.md#recipe-track), [gates](../meta/learning-levels.md#gates), [restructuring sittings](../meta/procedures/restructure-sittings.md), [drill allowlist](../meta/procedures/drill-generation.md#allowlist), [site redirects](../meta/site-redirects.md).
**Depends on:** none.
**Design authority:** one form: D16's unit noun for percentage points, as a measure on `/b/`. Otherwise none; what is left moves pages and sentences, renames two files, and fixes prose, practice items, and allowlist rows.

## Problem

A read-only audit after sitting-cohesion found these problems:
- forms a learner must pick between that sit on different pages
- titles and lead lines that do not cover their page
- H3s in the wrong band
- filenames that no longer name their page

The user accepted every recommendation, and the changes below are the ones still to land.

## Goals

1. Every change below lands.
2. Every sitting touched still passes tests 1–8 of [what one sitting holds](../meta/grammar-docs.md#one-sitting).
3. No learner-facing URL breaks without a redirect.

## Non-goals

- New forms or readings other than D16, and audits of pages outside the findings.
- The two Beginner words for *someone* (`pronouns.md` special pronoun, `joins.md` #unspecified-member-r-phrase): the special pronoun is to be dropped, so leave both as they are.

## Changes left

Each change moves an H3, a page, or a sentence. The guard in a change is a stop condition. If it fails, the unit skips the change and reports back.

- **D8** Singability. Blocked on the [open decision](#open-decisions).
  - Move "Rhythm and stress" from `singability.md` to `phonology.md`, after "Word edges" and before Thinking sounds.
  - Retitle singability "Voicing Ageben", and promote its H4 "Vowel pitch values" to an H3.
  - Voice and certainty and Singability constraints stay.
- **D12** Stance bars:
  - Cut the channel part of `stance-bars.md` "Every bar" to a link to `bars#channel-bars`.
  - Keep FORMER, ability, rules and permission, and hopes and fears.
  - Rewrite the practice onto those bars; ability, rules / permission, and hopes / fears have no items today.

  **Guard:** first diff the two pages' channel paragraphs, and keep anything that exists only on stance-bars.
- **D13** Dated channel:
  - Move `dated-channel.md` to Intermediate, placed after both `evidentiality.md` and `measures-and-percent.md` in the sidebar.
  - Move its as-of sentence (line 97) to `as-of.md`.
  - Update `say-tense.md`'s routing if its wording names a band.

  **Guard:** gate 4, checked against both of those pages.
- **D5** Evidentiality vs holder: keep the pages apart. Add a Compare-with line in `holder.md` "Whose view (holder)" back to `evidentiality.md#source`: passing on a claim you got from Azozon, vs giving Azozon's view. They are two jobs that share an English cue, and a merge would make a 490-line sitting.
- **D14** `stand-in-roles.md`: add one Compare-with line under "Lexicalized stand-ins in other roles". It links `dependents#hinges` (verb + `darl`, *tells … that*) and says when to pick the fixed word. **Guard:** the pages already state what the fixed word adds. If they don't, skip and report; the difference is a reading for the user.
- **D15** Rename the two files whose name says a job the page doesn't have, with `git mv` and redirects:
  - `iff-fault.md` → `because-and-iff.md` (fault is on `fault.md`). *iff* is now first taught at Beginner on `causation.md`, so check whether `because-and-iff` still names the page, and check its line 12 ("Beginner's *if* and *only if* do not claim…"). If *iff* is now only a recap there, report a better name rather than choosing one.
  - `feelings-permission.md` → `feelings.md` (permission is on `permission-consent.md`)

  Leave `social-ties`, `speech-manner`, `join-relations`, `abstract-landmarks`, `hook-compounds`, `compound-families`, `left-bound-adjectives`, and `more-occasions`: their filenames name the topic noun the H3 teaches, which is the house pattern.
- **D16** Percentage points in a clause. `measures-and-percent.md` teaches percent vs points (`yo` / `yu`) only as a noun phrase: *a growth of two percentage points* is `zelom gradoyul.` A measure on `/b/` needs a unit noun, and points have none. So `zuderem bradoyul velol` (*the cost rose two points*) parses, but the word-order lint reads `bradoyul` as a recipient. Then:
  - Add a unit noun for percentage points through the [lexicon procedure](../meta/procedures/lexicon.md) (`npm run convert-word`, never by hand). A rise in points then takes the same measure `/b/` pattern as a rise in dollars or hours.
  - Teach it in the percent vs points H3 of `measures-and-percent.md`, with a clause example. If the parser or the word-order lint needs a change to read it, that change ships in this unit with the grammar edit.
  - A `checkpoint-writer` top-up then changes Practice English → Ageben item 3 to a full clause, as first planned. Use *The price of the pills went up two percentage points.*, or the nearest wording the lexicon allows: *price* and *rise* have no root, but *cost* `uderem` and *growth* `elom` do.

  **Guard:** if the lexicon procedure leaves a choice the user must make (a new root vs a compound, or which seed), stop and report the options with a recommendation.

## Plan

If the user says to stop partway, the orchestrator [consolidates this proposal](../meta/procedures/proposals.md#consolidate-on-stop) before the session ends.

Units run in sequence, one fresh subagent each, because most share the sidebar, the allowlist, or the cheat sheets. Every `proposal-worker` brief names its items, pastes their text from this file, and pastes the rule digest. A unit adds a remap for every retired or renamed file ([site redirects](../meta/site-redirects.md#add-a-remap-page-rename)), and fixes the allowlist rows of the pages it touches.

**Models and Practice.**
- Each unit runs on `proposal-worker` at the model and effort in its row.
- A unit with teaching prose, placement, a gate-4 guard, or grammar judgment stays on opus, and its effort follows how much judgment it needs. A purely mechanical unit runs on sonnet.
- If a page gained or lost an H3, a `checkpoint-writer` then splits or tops up its Practice. Use opus / medium for a top-up that places or replaces one or two items, and opus / high for a new checkpoint, a merge of two Practice blocks, or a top-up on a page that lost content.
- **Exception:** the unit's own worker places moved items itself, with no `checkpoint-writer`, when all three of these hold:
  - the job is a verbatim move of one or two items onto the receiving page
  - the worker has read no page later than the receiving page in sidebar order ([what you may read](../meta/procedures/drill-generation.md#execute))
  - the move needs no new words, `core` cells, or setting change
- `checkpoint-writer` may not edit level reviews. When a move leaves a review item linking the wrong band, or leaves a sitting with no review item, a `proposal-worker` (opus / medium) fixes the review, per [level review](../meta/procedures/drill-generation.md#level-review).

| Unit | Change | May edit | Worker model / effort | Why |
|------|--------|----------|-----------------------|-----|
| 2k | D12 | stance-bars | opus / high | diff two pages' channel prose and keep only what is unique |
| 2l | D13 | dated-channel, as-of, say-tense, the sidebar | opus / high | a band move with a gate-4 guard against two pages, plus a sentence move |
| 2m | D5, D14 | holder, stand-in-roles | opus / medium | two Compare-with lines; D14's guard is a read, not a rewrite |
| 2n | D15 | `git mv` of the two files, every link to them | sonnet / medium | mechanical: `git mv`, link retargets, redirects |
| 2o | D16 | `data/lexicon-published.csv` or `data/lexicon-compounds.csv`, measures-and-percent, parser and lint code if needed; then a `checkpoint-writer` top-up of measures-and-percent Practice | opus / xhigh | a new root, and possibly parser and word-order lint code |
| 2b | D8, once decided | singability, phonology, `reading-order.ts`, and the pages option A names | opus / high | a split H3 with a gate-4 rewrite |

**Run notes** (learned in 2a–2j; put each in the brief that needs it):
- **Fencing a tool's `--write`.** Subagents cannot commit, so a worker writes `git diff -- . ':!docs/proposals' > <scratchpad>/<unit>-tool.diff` right after the tool's `--write` and before any hand edit, plus `git status --short` when the tool creates files. The orchestrator commits that output with `git apply --cached <file>` (after `git reset` if a `git rm` is already staged), then commits the hand work. Do not restore from a stash: `git checkout stash -- .` does not restore deletions.
- `move-heading` needs an id on a heading that `--ids`, `--after` or `--before` names. It also refuses to leave a page with no taught H3. To retire a page, add a throwaway `### Placeholder` H3 before the dry run. After the `git rm`, run `--record-only --write` for the H1's hash row.
- `peel-headings` appends the sidebar row at the end of the band; move it by hand.
- After a move, `terminology.md` link text must name the target's sidebar page, and the build flags it.
- A worker that cuts Practice items saves them verbatim to the scratchpad, with each item's H4 direction and words. The next `checkpoint-writer` places them.

**Rule digest** (pasted into every brief):

> - Read `AGENTS.md`, then only the procedure files your task names. List headings first (`grep -n '^#' FILE`) and read slices; never a whole long page. Use `grep -E`, not awk interval regexes.
> - Edit only the files your brief names. Moves, peels, and hash rows go through `npm run move-heading` / `peel-headings` (dry run first); never retarget links by hand. Move or rename a file with `git mv`.
> - Show the current language only. Ageben in code spans must parse and use lexicon roots. Never spell a root by hand.
> - Teach in English jobs. A title is one job, or a choice set joined by *and*. Each H3 after the first uses, extends, or is chosen against an earlier one. A moved H3 must not use anything taught later in sidebar order on its new page (gate 4).
> - Do not decide grammar. If a fix needs a reading the pages do not give, or a guard in your item fails, skip it and report.
> - Stop and report, without working around it, when a premise fails, a later item would build on a broken state, or the fix needs different pages than the brief names.
> - At the end of each item run `npm run verify -- --allow-generate` (`--fast` inside an item). On a new error, read only that line of `tmp/verify-last.log`. Never paste raw build output.
> - Do not commit. Report the `AGENTS.md` Owns-line changes; do not edit `AGENTS.md`.
> - At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
> - Report: done (ids moved, titles changed), files touched (count), registry edits, Owns lines to change, the `verify` line, skips with reasons, **Left:**, **Inefficient:**.

**Gates.**

- The orchestrator saves `npm run verify -- --baseline` at the start of each session, and commits each unit on a green `verify -- --allow-generate`.
- **Final gate:**
  1. `npm run cheat-sheet-blocks -- --write` (in its own commit)
  2. a clean `npm run build`, with no **generate** rows left
  3. `npm run lint:cheat-sheet-print`
- The orchestrator then applies the Owns lines on the Status line to `AGENTS.md`, and asks the user to paste the new `dist/amplify-redirects.json` into Amplify.

**Commits.** One per unit, `sitting audit followups: <unit> [skip-cd]`, then the co-author line. Each `--write` from a move tool is fenced in its own commit ([fence automated rewrites](../meta/procedures/proposals.md#fence-automated-rewrites)). There is also one cheat-sheet-blocks commit and one last `AGENTS.md` commit. Expect 12–18 more commits, counting checkpoint units and fenced tool writes.

## Open decisions

A guard that fails in D12, D13, D14, or D16 comes back here as a decision.

- **D8 fails gate 4 (unit 2b, skipped).** "Rhythm and stress" on `singability.md` cannot go onto `phonology.md` whole, for three reasons:
  - It says a number word stresses the last digit of each group, and numbers come later.
  - Its word-break paragraph uses a hooked join and a join followed by a hook, and hooks and hooked joins come later.
  - Its example `zazozon gamahum.` is a full clause.

  Two more facts matter whichever option is chosen:
  - Its H4 "Vowel pitch values" `{#vowel-pitch-values}` sits inside it and would travel with it. It must be promoted to an H3 first, keeping its id, which `finger-code.md`, `cheat-sheets/sounds-spelling.md`, `terminology.md` and `src/vowel-pitch.ts` link to.
  - The sidebar label is hard-coded in `reading-order.ts` ("Singing and speech edges").

  Options:
  - **A. Split the H3.** Promote the H4, then move rhythm and stress to phonology. Take the number-word sentence and the word-break paragraph out, either to `numbers.md` and `hooked-joins.md` (which already links `#rhythm-and-stress`), or back onto Voicing Ageben. Swap the clause example for cited words, as "Word edges" uses.
  - **B. Move it whole and rewrite** the two sentences in Beginner terms. The dropped facts still need a home on later pages.
  - **C. Drop the move.** Only retitle singability "Voicing Ageben" and promote the H4.

  **Recommendation:** A, with the number-word sentence going to `numbers.md` and the word-break paragraph to `hooked-joins.md`. A Beginner learner then gets stress where they learn sounds, and each later fact sits where its grammar is taught.

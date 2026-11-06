# Proposal: Fixing what the sitting re-audit found

**Status:** partially implemented. Decided 2026-11-06: every audit recommendation accepted (changes D1–D15 and the pass rulings); the *someone* overlap between `pronouns.md` and `joins.md` is dropped, because that special pronoun leaves in a future update. Workstream 1 (the edits that needed no moves) is done, commits `c371aa93`–`4d250b42`, 2026-11-06. Decided 2026-11-06: percentage points get a unit noun, so a rise in points takes the measure `/b/` pattern (D16). **Next:** workstream 2, unit 2a, in a new session. `AGENTS.md` Owns lines to apply at the final step, from workstream 1: `very-and-slightly.md` → "degree words"; `resume-sense.md` → "resume, further: one sense, cross-role recast"; `collectives.md` → "groups, further: collectives, each other, addressing several people"; `label-reach.md` → "how a label holds: packaging, IDENTITY endings"; `universals-domains.md` → "a whole kind: universals, domains"; `comparative-arity.md` → "ranking on any scale"; `here-there.md` → "here, there, and somewhere". Carried over from the closed sitting-cohesion run: the user still has to paste `dist/amplify-redirects.json` into the Amplify console ([steps](../meta/site-redirects.md#add-a-remap-page-rename)).
**Related:** [what one sitting holds](../meta/grammar-docs.md#one-sitting), [page skeleton](../meta/grammar-docs.md#page-skeleton), [recipe track](../meta/grammar-docs.md#recipe-track), [gates](../meta/learning-levels.md#gates), [restructuring sittings](../meta/procedures/restructure-sittings.md), [drill allowlist](../meta/procedures/drill-generation.md#allowlist), [site redirects](../meta/site-redirects.md).
**Depends on:** none. The findings come from the sitting-cohesion re-audit (commit `04668ade`).
**Design authority:** one form: D16's unit noun for percentage points, as a measure on `/b/`. Otherwise none; it moves H3s between pages and bands, retitles pages, renames two files, retires four, and fixes prose, practice items, and allowlist rows.

## Problem

After sitting-cohesion, a read-only audit checked 77 sittings against [what one sitting holds](../meta/grammar-docs.md#one-sitting), tests 1–6. It found the following:

- forms a learner must pick between that sit on different pages
- titles and lead lines that do not cover their page
- a few H3s in the wrong band
- filenames that no longer name their page

The user accepted the auditors' recommendation for each finding; this proposal carries them out.

## Goals

1. Every change below lands.
2. Every sitting touched still passes tests 1–8.
3. No learner-facing URL breaks without a redirect.

## Non-goals

- New forms or readings other than D16, and audits of pages outside the findings.
- The two Beginner words for *someone* (`pronouns.md` special pronoun, `joins.md` #unspecified-member-r-phrase): the special pronoun is to be dropped, so leave both as they are.

## Changes (workstream 2)

Each change moves an H3 or a page. The guard in a change is a stop condition. If it fails, the unit skips the change and reports back.

**Choice sets onto one page (test 5)**

- **D1** Stacked act words. Move `rhetorical-questions.md`'s 3 H3s (Rhetorical question, Quiz, Questions that sound like another act) onto `more-turn-words.md`, right after "Stacking two act words", for 7 H3s. Retire `rhetorical-questions.md` with a redirect. Retarget its two check-back Compare-with links (lines 42, 75) to the Beginner check-back. Moving the other way would make `polar-inventory.md:81` and `:157` point forward.
- **D2** Condition hinges. `causation.md` owns *if*, *only if*, *iff*. Move those rows, the command-with-*if* example, and the *whether* vs *if* Compare-with from `dependents.md#hinges` into causation (#if, #only-if, with *iff* as a row in #only-if). Then:
  - Retitle dependents#hinges "Because, although (hinges)".
  - Rewrite causation's lead to name *if*, *only if*, *if and only if*, keeping "you do not claim the condition is a fact" as a property of all three.
  - Move the dependents checkpoint items that use these hinges.
- **D3** *I think*. Move `live-and-memory.md`'s one H3 onto `knowing.md` after "Follow-up endings (MAY)", for 3 H3s. Retire `live-and-memory.md` with a redirect. **Guard:** live-and-memory's examples need nothing taught between the two pages in sidebar order.
- **D4** *Azozon's X*:
  - Move `extra-noun-hooks.md#genitive` onto `social-ties.md`, before #social-relations.
  - Retitle social-ties "Whose: *Azozon's*", and place it right after extra-noun-hooks in the Beginner sidebar, before fill-ask-jobs, which reuses `om`.
  - Leave a link to the moved H3 in the extra-noun `-m` table.
  - Add a one-line English-job lead under the extra-noun-hooks title: two-vowel hooks and the `-m` setting hooks.
- **D5** Evidentiality vs holder: keep the pages apart. Add a Compare-with line in `holder.md` "Whose view (holder)" back to `evidentiality.md#source`: passing on a claim you got from Azozon, vs giving Azozon's view. They are two jobs that share an English cue, and a merge would make a 490-line sitting.

**Off-axis H3s and band (tests 1–4)**

- **D6** *Again* `herugom`. Move it from `very-and-slightly.md` to a new H3 "Again" on Beginner `restrictors.md`, after "Sometimes / anytime / some other time", and set it against *some other time*. **Guard (gate 4):** nothing in the H3 depends on Intermediate.
- **D7** Thinking sounds. Move `speech-moves.md#thinking-sounds` to `phonology.md` as a new H3 after "Word edges". Retarget the links from `hooks.md` and `letter-names.md`, and drop "You can also hold a pause while you think" from speech-moves' lead.
- **D8** Singability:
  - Move "Rhythm and stress" from `singability.md` to `phonology.md`, after "Word edges" and before Thinking sounds (D7).
  - Retitle singability "Voicing Ageben", and promote its H4 "Vowel pitch values" to an H3.
  - Voice and certainty and Singability constraints stay.
- **D9** Emphasis. Fold `emphasis.md` into `tone-marks.md` "Tone marks" as a short recipe, about 10 lines plus the four-row table. Delete the Advanced sitting and its allowlist row, with a redirect. Clefts are everyday talk, and `&` is homed on tone-marks ([recipe track](../meta/grammar-docs.md#recipe-track): nothing new, but needed early, goes on the stage page).
- **D10** Named phrases. Peel `join-limits.md` "Named phrase `-n`" to a new Advanced sitting "Named phrases", with its checkpoint (setting: a treaty table). Join-limits gets a new checkpoint or a **skip** row with its reason. Its Scope islands H3 is now only a Compare-with line to `scope-islands.md`, but three Practice items still drill it (E→A 2, A→E 2, Pick one 1); the new checkpoint replaces them.
- **D11** Ambient magnitude. Move `stacked-markers.md` "Ambient magnitude (casual)" to Intermediate `digitless-exponents.md`, after "Bare OoM", with its practice items. That page goes from 6 to 7 H3s. **Guard (gate 4):** nothing in it depends on Advanced.
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

**Cross-band Compare-with**

- **D14** `stand-in-roles.md`: add one Compare-with line under "Lexicalized stand-ins in other roles". It links `dependents#hinges` (verb + `darl`, *tells … that*) and says when to pick the fixed word. **Guard:** the pages already state what the fixed word adds. If they don't, skip and report; the difference is a reading for the user.

**Filenames**

- **D15** Rename the two files whose name says a job the page doesn't have, with `git mv` and redirects:
  - `iff-fault.md` → `because-and-iff.md` (fault is on `fault.md`)
  - `feelings-permission.md` → `feelings.md` (permission is on `permission-consent.md`)

  Leave `social-ties`, `speech-manner`, `join-relations`, `abstract-landmarks`, `hook-compounds`, `compound-families`, `left-bound-adjectives`, and `more-occasions`: their filenames name the topic noun the H3 teaches, which is the house pattern.

**New form (decided 2026-11-06)**

- **D16** Percentage points in a clause. `measures-and-percent.md` teaches percent vs points (`yo` / `yu`) only as a noun phrase: *a growth of two percentage points* is `zelom gradoyul.` A measure on `/b/` needs a unit noun, and points have none, so `zuderem bradoyul velol` (*the cost rose two points*) parses but the word-order lint reads `bradoyul` as a recipient. Then:
  - Add a unit noun for percentage points through the [lexicon procedure](../meta/procedures/lexicon.md) (`npm run convert-word`, never by hand), so a rise in points takes the same measure `/b/` pattern as a rise in dollars or hours.
  - Teach it in the percent vs points H3 of `measures-and-percent.md`, with a clause example. If the parser or the word-order lint needs a change to read it, that change ships in this unit with the grammar edit.
  - A `checkpoint-writer` top-up then changes Practice English → Ageben item 3 to a full clause, as first planned: *The price of the pills went up two percentage points.*, or the nearest wording the lexicon allows, since *price* and *rise* have no root (*cost* `uderem`, *growth* `elom`).

  **Guard:** if the lexicon procedure leaves a choice the user must make (a new root vs a compound, or which seed), stop and report the options with a recommendation.

## Pass rulings (no work)

The auditors ruled these doubtful findings pass, and the user accepted:

- `joins.md` clause *and* vs `clause-sequence.md` *and then*
- `roles.md` vs relative clauses (the Compare-with at roles.md:183)
- `word-endings.md` #greeting
- `sentence-linkers.md` "What carries past a period"
- `more-hinges.md`
- `polar-inventory.md` single-item yes/no
- `in-clause-hooks.md` Point back
- the `want-and-decide.md` and `measures-and-percent.md` titles
- `join-limits.md` inventories
- `numeric-derivation.md` vs `special-values.md`, and `as-of.md` vs `dated-channel.md`
- `singability.md` Voice and certainty, and the Singability constraints table
- `role-parts.md` "Places, tools, and times"
- `more-turn-words.md` "Describing a call or reaction"

## Plan

If the user says to stop partway, the orchestrator [consolidates this proposal](../meta/procedures/proposals.md#consolidate-on-stop) before the session ends.

Units run in sequence, one fresh subagent each, because most share the sidebar, the allowlist, or the cheat sheets. Every `proposal-worker` brief names its items and pastes their text from this file and the rule digest. A unit adds a remap for every retired or renamed file ([site redirects](../meta/site-redirects.md#add-a-remap-page-rename)), and fixes the allowlist rows of the pages it touches.

**Workstream 2, changes**

Each unit is one change, run on `proposal-worker` at opus / high. Moves go through `npm run move-heading` / `peel-headings` per [restructuring sittings](../meta/procedures/restructure-sittings.md). After each unit, if a page gained or lost an H3, a `checkpoint-writer` unit (opus / high) splits or tops up the Practice on that page. The units run in this order, so every receiving page is settled before its next move:

| Unit | Change | May edit |
|------|--------|----------|
| 2a | D7 | speech-moves, phonology, hooks, letter-names |
| 2b | D8 | singability, phonology |
| 2c | D1 | rhetorical-questions (retire), more-turn-words, polar-inventory |
| 2d | D2 | dependents, causation |
| 2e | D3 | live-and-memory (retire), knowing |
| 2f | D4 | extra-noun-hooks, social-ties, the sidebar |
| 2g | D6 | very-and-slightly, restrictors |
| 2h | D9 | emphasis (retire), tone-marks |
| 2i | D10 | join-limits, the new Named phrases sitting |
| 2j | D11 | stacked-markers, digitless-exponents |
| 2k | D12 | stance-bars |
| 2l | D13 | dated-channel, as-of, say-tense, the sidebar |
| 2m | D5, D14 | holder, stand-in-roles |
| 2n | D15 | `git mv` of the two files, every link to them |
| 2o | D16 | `data/lexicon-published.csv` or `data/lexicon-compounds.csv`, measures-and-percent, parser and lint code if needed; then a `checkpoint-writer` top-up of measures-and-percent Practice |

Every unit may also edit the allowlist, hash redirects, site redirects, and level-review links for its pages. Unit 2i's new sitting is `named-phrases.md`.

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

- The orchestrator saves `npm run verify -- --baseline` at the start of each workstream, and commits each unit on a green `verify -- --allow-generate`.
- **Final gate:**
  1. `npm run cheat-sheet-blocks -- --write` (in its own commit)
  2. a clean `npm run build`, with no **generate** rows left
  3. `npm run lint:cheat-sheet-print`
- The orchestrator then applies the reported Owns lines to `AGENTS.md`, and asks the user to paste the new `dist/amplify-redirects.json` into Amplify.

**Commits.** One per unit, `sitting audit followups: <unit> [skip-cd]`, then the co-author line. Each `--write` from a move tool is fenced in its own commit ([fence automated rewrites](../meta/procedures/proposals.md#fence-automated-rewrites)). There are also one cheat-sheet-blocks commit and one last `AGENTS.md` commit. Expect 30–40 commits for workstream 2, counting checkpoint units and fenced tool writes.

## Open decisions

None open. A guard that fails in D3, D6, D11, D12, D13, D14, or D16 comes back here as a decision.

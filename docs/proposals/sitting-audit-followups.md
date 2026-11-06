# Proposal: Fixing what the sitting re-audit found

**Status:** ready to implement. Decided 2026-11-06: every recommendation accepted (edits E1–E13, changes D1–D14, and the pass rulings); the *someone* overlap between `pronouns.md` and `joins.md` is dropped, because that special pronoun leaves in a future update. **Workstream 1 done** 2026-11-06 (units 1a–1e); workstream 2 not started. One new open decision from E11. `AGENTS.md` Owns lines for the final step, from 1b: `very-and-slightly.md` → "degree words"; `resume-sense.md` → "resume, further: one sense, cross-role recast"; `collectives.md` → "groups, further: collectives, each other, addressing several people"; `label-reach.md` → "how a label holds: packaging, IDENTITY endings"; `universals-domains.md` → "a whole kind: universals, domains"; `comparative-arity.md` → "ranking on any scale"; `here-there.md` → "here, there, and somewhere". Carried over from the closed sitting-cohesion run: the user still has to paste `dist/amplify-redirects.json` into the Amplify console ([steps](../meta/site-redirects.md#add-a-remap-page-rename)).
**Related:** [what one sitting holds](../meta/grammar-docs.md#one-sitting), [page skeleton](../meta/grammar-docs.md#page-skeleton), [recipe track](../meta/grammar-docs.md#recipe-track), [gates](../meta/learning-levels.md#gates), [restructuring sittings](../meta/procedures/restructure-sittings.md), [drill allowlist](../meta/procedures/drill-generation.md#allowlist), [site redirects](../meta/site-redirects.md).
**Depends on:** none. The findings come from the sitting-cohesion re-audit (commit `04668ade`).
**Design authority:** none for forms or readings. It moves H3s between pages and bands, retitles pages, renames two files, retires four, and fixes prose, practice items, and allowlist rows.

## Problem

After sitting-cohesion, a read-only audit checked 77 sittings against [what one sitting holds](../meta/grammar-docs.md#one-sitting), tests 1–6. It found the following:

- forms a learner must pick between that sit on different pages
- titles and lead lines that do not cover their page
- a few H3s in the wrong band
- content slips
- stale allowlist rows
- filenames that no longer name their page

The user accepted the auditors' recommendation for each finding; this proposal carries them out.

## Goals

1. Every edit and change below lands.
2. Every sitting touched still passes tests 1–8.
3. No learner-facing URL breaks without a redirect.

## Non-goals

- New forms or readings, and audits of pages outside the findings.
- The two Beginner words for *someone* (`pronouns.md` special pronoun, `joins.md` #unspecified-member-r-phrase): the special pronoun is to be dropped, so leave both as they are.

## Edits (workstream 1)

These need no page moves.

**Content slips**

- **E1** `dependents.md:313` (Pick one answer) says *whether* takes stand-in **`o`**. The page (line 45) and the parser give `derl`, vowel **`e`**. Fix the label.
- **E2** `tag-pronouns.md:168` (Fix it answer): cut ", whoever acted last". A tag stays on its referent whoever acts later.
- **E3** `stance-bars.md:11`: the lead sentence has no subject. Replace it with: "A plan bar ranks against what a plan set, a channel bar against what a source led you to expect, and a sake bar against what a sake needs. Any other stance that sets a value can be the bar too, and each keeps its own endings and meaning." Keep its links to `bars#bars`, `bars#channel-bars`, `bars#sake-bars`. D12 later cuts the page's channel-bar teaching; this sentence still fits.
- **E4** `usually-vs-must.md`: its H3 id is `#universality`, while `universality.md` teaches mood on one adjective. Make the id `generalization`, keep `universality` as an alias anchor, and retarget inbound links.
- **E5** `join-limits.md` Scope islands re-teaches `scope-islands.md` (Intermediate). Cut it to a Compare-with line to `/scope-islands#scope-islands`, and retarget `as-of.md:105`.

**Lead lines and titles** ([page skeleton](../meta/grammar-docs.md#page-skeleton) item 1 requires a title and a one-line job on every page)

- **E6** Lead lines that promise jobs the page doesn't teach:
  - `residue-and-former.md`: drop the *already / still / not yet / no longer* clause; that job is on `already-still-yet.md`.
  - `feelings-permission.md`: drop *thank you* and the thanks / sorry clause; that job is on `thanks-and-sorry.md`.
- **E7** Add a one-line English-job lead under the title of `of-relations`, `number-markers`, `ranges`, `evidentiality`, `holder`, `bars`, `try`, and `want-and-decide`. The extra-noun-hooks lead goes with D4, and `no-subject` stays as is (its one H3 has the page's title).
- **E8** Retitles with no move. Each title then covers every H3 on its page. Keep each H1 id, or record a renamed id per [one current heading, one current id](../meta/grammar-docs.md#one-current-heading-one-current-id).
  - `resume-sense.md` → "Resume, further" (all three readings of whole-stem `-r`, not only `-rl` / `-rm`).
  - `collectives.md` → "Groups, further" (the rest of the `-x` family after Beginner plurality).
  - `label-reach.md` → "How a label holds" (covers the IDENTITY endings too).
  - `universals-domains.md` → "Talking about a whole kind" (covers `zuan` and `eyen`).
  - `set-joins.md` → "Set joins", to match "Rank joins".
  - `comparative-arity.md` → "Ranking on any scale", with a lead naming *less than*, *more often than*, *earlier than*, *the more … the more*, *twice as … as*. Today the page title equals one of its 8 H3s.
  - `here-there.md` → "Here, there, and somewhere", plus a lead line. Its id already says here-there-and-somewhere.
  - `digitless-exponents.md`: add "and how a long number is said group by group" to the lead, and keep Group separator on the page. Its examples need exponents, which number-markers comes before.
  - `very-and-slightly.md` H3 "How much: degree words on `/w/`" → "How much: degree words", since `hayurom` is on `/h/`. D6 moves `herugom` off the page.

**Small cross-page edits**

- **E9** `permission-consent.md`, under "Someone over the act": add a Compare-with line to `/can-and-cant`. *Can I …?* asking leave is a say word, not ability.
- **E10** `want-and-decide.md`: `holder.md` homes *someone else's plan*. Retitle the H3 to "Someone else's want or decision", and replace its PLAN example with a link to `holder.md#holder`.

**Practice**

- **E11** `measures-and-percent.md` English → Ageben item 3 (*Three to five hours*) drills a range, and ranges moved to `ranges.md`. Replace it with *The price of the pills went up two percentage points.*, which drills percent vs points; that H3 has no item today.
- **E12** `nested-dependents.md`: the nesting does not need the late verb. A default-order version of E→A 2 parses with the same structure. Use subject, object, verb in every clause with an object: E→A 1–3, A→E 1–3, Fix it, What changes. This clears the build's three word-order warnings.

**Allowlist rows** (`docs/meta/procedures/drill-generation.md`)

- **E13** Rows that no longer match their pages:
  - `comparatives.md`: "Rank fence **`e`/`ae`/`ue`**" → rank **`o`** (`zol`) + SHARED scale; single-item superlative; equative **`oe`**.
  - `roles.md`: "reach `a`/`e`" → reach `u` / `o`.
  - `proper-names.md`: add one of a name `-ln`, and countries and traditions.
  - `evidentiality.md`: list the page's H3s. Those are channels after LIVE / MEMORY, evidence strength, hand depth, source `bl-`, forecasts, the evidence clause, carry forward, and deduction. Drop "MAY vs nearby jobs" and `blweyer` / `blwayer`, which no grammar page teaches.
  - `comparative-arity.md`: list all 8 H3s.
  - `number-markers.md`: ranges are on `ranges.md` and clock / calendar time on Beginner `digit-strings.md`, not `measures-and-percent.md`.
  - `stand-in-roles.md` and `nested-dependents.md`: Notes still give finished instructions. Keep only the standing notes.

  Rows for pages that D1–D14 retire, move, or rename are fixed in those units, not here.

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
  - Add the extra-noun-hooks lead (E7): two-vowel hooks and the `-m` setting hooks.
- **D5** Evidentiality vs holder: keep the pages apart. Add a Compare-with line in `holder.md` "Whose view (holder)" back to `evidentiality.md#source`: passing on a claim you got from Azozon, vs giving Azozon's view. They are two jobs that share an English cue, and a merge would make a 490-line sitting.

**Off-axis H3s and band (tests 1–4)**

- **D6** *Again* `herugom`. Move it from `very-and-slightly.md` to a new H3 "Again" on Beginner `restrictors.md`, after "Sometimes / anytime / some other time", and set it against *some other time*. **Guard (gate 4):** nothing in the H3 depends on Intermediate.
- **D7** Thinking sounds. Move `speech-moves.md#thinking-sounds` to `phonology.md` as a new H3 after "Word edges". Retarget the links from `hooks.md` and `letter-names.md`, and drop "You can also hold a pause while you think" from speech-moves' lead.
- **D8** Singability:
  - Move "Rhythm and stress" from `singability.md` to `phonology.md`, after "Word edges" and before Thinking sounds (D7).
  - Retitle singability "Voicing Ageben", and promote its H4 "Vowel pitch values" to an H3.
  - Voice and certainty and Singability constraints stay.
- **D9** Emphasis. Fold `emphasis.md` into `tone-marks.md` "Tone marks" as a short recipe, about 10 lines plus the four-row table. Delete the Advanced sitting and its allowlist row, with a redirect. Clefts are everyday talk, and `&` is homed on tone-marks ([recipe track](../meta/grammar-docs.md#recipe-track): nothing new, but needed early, goes on the stage page).
- **D10** Named phrases. Peel `join-limits.md` "Named phrase `-n`" to a new Advanced sitting "Named phrases", with its checkpoint (setting: a treaty table). Join-limits gets a new checkpoint or a **skip** row with its reason. E5 cut its Scope islands H3 to a Compare-with line, but three Practice items still drill it (E→A 2, A→E 2, Pick one 1); the new checkpoint replaces them.
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

**Workstream 1, edits**

| Unit | Items | Agent | Model / effort | May edit |
|------|-------|-------|----------------|----------|
| 1a | E1–E5 | `proposal-worker` | opus / medium | dependents, tag-pronouns, stance-bars, usually-vs-must, join-limits, as-of |
| 1b | E6–E8 | `proposal-worker` | opus / high | the pages named, cheat-sheet sources |
| 1c | E9, E10 | `proposal-worker` | opus / medium | permission-consent, want-and-decide |
| 1d | E11, E12 | `checkpoint-writer` | opus / high | measures-and-percent and nested-dependents Practice |
| 1e | E13 | `proposal-worker` | sonnet / medium | drill-generation.md allowlist |

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

**Commits.** One per unit, `sitting audit followups: <unit> [skip-cd]`, then the co-author line. Each `--write` from a move tool is fenced in its own commit ([fence automated rewrites](../meta/procedures/proposals.md#fence-automated-rewrites)). There are also one cheat-sheet-blocks commit and one last `AGENTS.md` commit. Expect about 5 commits for workstream 1, and 30–40 for workstream 2, counting checkpoint units and fenced tool writes.

## Open decisions

A guard that fails in D3, D6, D11, D12, D13, or D14 comes back here as a decision.

- **A rise of N percentage points in a full clause** (found in E11, 2026-11-06). E11 asked for *The price of the pills went up two percentage points.* No grammar page gives a clause form for it. A measure on `/b/` needs a unit noun, and points have none, so `zuderem bradoyul velol` parses but the word-order lint reads `bradoyul` as a recipient. The Practice item is now a noun phrase, *A growth of two percentage points* (`zelom gradoyul.`). Options:
  - (a) a unit noun for points, so the rise fits the measure `/b/` pattern
  - (b) teach the change amount on `/h/` or `/d/`
  - (c) leave the gap; the noun phrase is enough

  **Recommendation:** (a). It reuses the measure-phrase rule learners already have, so a rise in points reads like a rise in dollars or hours.

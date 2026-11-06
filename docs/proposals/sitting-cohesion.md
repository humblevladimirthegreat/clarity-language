# Proposal: Making every sitting pass "what one sitting holds"

**Status:** in progress. Phases 0–4 done (2026-11-06). Phase 5 steps 1–7 done (2026-11-06): Owns lines committed, final gate green, re-audit R1–R4 done (findings below). Step 8 waits on the user: delete this proposal, or move it to `partially-implemented/` with the findings as open follow-ups. Earlier plans, findings, the Phase 4 unit table, and gate runs are in git history (this file at `af655e7e`; the original findings and URL table at `89c0b5a2`).
**Related:** [what one sitting holds](../meta/grammar-docs.md#one-sitting), [how to apply levels](../meta/learning-levels.md#how-to-apply), [site redirects](../meta/site-redirects.md), [AGENTS.md policy](../meta/agents-md.md).
**Depends on:** none.
**Design authority:** none. This proposal moved, merged, peeled, and retitled existing sections, and wrote checkpoints. It adds no form and changes no reading.

## Problem

An audit of all 98 sittings against [what one sitting holds](../meta/grammar-docs.md#one-sitting) found mixed jobs, titles that did not cover the page, and split choice sets. Phases 1–3 moved, peeled, merged, and renamed pages; Phase 4 wrote the checkpoints the moves left short. What is left is bookkeeping and a re-audit.

## Goals

1. Every sitting passes tests 2–5, 7, and 8, with tests 1 and 6 checked on every page this proposal touched.
2. Every form has one home H3.
3. No learner-facing URL breaks without a redirect.
4. Every `AGENTS.md` Owns line matches the result.

## Non-goals

New forms, new readings, changed spellings, or fixes the re-audit finds. Those go to the user as a list.

## Plan: Phase 5, bookkeeping and re-audit

The orchestrator (the session the user talks to) does steps 1–4 and 6–8 itself; only the re-audit runs in subagents.

1. `npm run verify -- --baseline`.
2. Apply the [reported Owns lines](#reported-owns-lines) to `AGENTS.md`. Add rows only for new topics ([how to apply](../meta/learning-levels.md#how-to-apply)); keep within [AGENTS.md policy](../meta/agents-md.md).
3. Final gate: a clean `npm run build`, then `npm run lint:cheat-sheet-print`. Run `npm run grammar-check` only if parser source changed in this phase.
4. Commit: `sitting cohesion: 5, AGENTS.md Owns lines [skip-cd]`, a blank line, then `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Stage only this phase's files.
5. Re-audit, in sequence, one fresh `proposal-worker` per unit (model `opus`, effort `high`). Scope: every sitting changed since `2274a6e8~1` (`git diff --name-only 2274a6e8~1 -- docs/grammar`, leaving out level reviews, cheat sheets, Claritish, `say-*.md`, `english.md`, and `terminology.md`; about 70 sittings), plus any sitting sharing a choice set with one, plus the [follow-ups](#follow-ups). Units, by band in sidebar order: **R1** Beginner (16); **R2** Intermediate, first half (19); **R3** Intermediate, second half (19); **R4** Advanced (15). Each brief names its pages and defines the task:
   - An audit: no files to edit, so nothing to verify.
   - Check each sitting against [what one sitting holds](../meta/grammar-docs.md#one-sitting), tests 1–6, from headings and the slices a test needs.
   - Report one line per finding (page, test, what fails, suggested fix), with no line cap, then **Left:** and **Inefficient:**.
   - Start a fresh unit for any pages a worker leaves.

   Merge the findings into one list for the user.
6. Ask the user to paste `dist/amplify-redirects.json` into the Amplify console (**Hosting → Rewrites and redirects**, [steps](../meta/site-redirects.md#add-a-remap-page-rename)). The renamed pages and `join-across-roles.html` need it for real 301s.
7. List for the user the untouched pages whose filename no longer names their title (for example `feelings-permission.md`, titled "Feelings").
8. Delete this proposal, or move it to `partially-implemented/` if the user keeps any follow-up open, per [proposals](../meta/procedures/proposals.md), and commit.

## Reported Owns lines
<a id="reported-owns-lines"></a>

For step 2 (current filenames):

- `clause.md`: add "leaving out who acts (`no-subject.md`)" and "degree words on `/w/` (`very-and-slightly.md`)"; chaining (`longer-chains.md`) covers chaining only.
- `speech-moves.md`: "Turns, vocatives, interjections, thinking sounds, continue (`/x/`), speech acts, …"; "turn words, further: doubled and stacked acts, commands to be ADJ, describing a call (`more-turn-words.md`)".
- `dependents.md`: "Next-sentence grammar: subordinators; continue overview, sentence linkers, what carries past a period (`sentence-linkers.md`); hinges on a degree or a noun (`more-hinges.md`); lexicalized stand-ins (`stand-in-roles.md`); nested dependents (`nested-dependents.md`)".
- `pronouns.md`: "…; resume one sense, cross-role recast (`resume-sense.md`); tag pronouns (`tag-pronouns.md`)".
- `plurality.md`: "collectives, each other, addressing several people (`collectives.md`)".
- `hooks.md`: "in-clause hooks: parallel chains, hook detail, point back (`in-clause-hooks.md`)"; "ranges, including ranges of numbers (`ranges.md`)".
- `discourse-hooks.md`: "Discourse endings at the front (-m, -r *anyway*), stacked discourse, discourse placements; somewhere / here and there (`here-there.md`)".
- `joins.md`: "what a list word reaches: SHARED, respectively, fence nesting (`list-structure.md`); rank joins, invert, route (`rank-joins.md`); and/or, whole-list denial, set inventories (`set-joins.md`)".
- `join-across-roles.md` row becomes `verb-and-stance-joins.md` (the old file no longer exists): "Joins on verbs and stances: verb-phrase, clause and stance joins; list verbs (`list-verbs.md`); join-relations (`join-relations.md`); clause sequence (`clause-sequence.md`)".
- `spans.md`: "spans as words: mention, span nouns, `gl` spans, one of a title (`spans-as-words.md`); inside a quote: act words, topics (`quote-contents.md`)".
- `numbers.md`: "word shape, markers, endings, writing, letter codes (`number-markers.md`)".
- `measures-and-percent.md`: "Ranges, measure phrases, percent; …" → "Measure phrases, percent, fractions; …".
- `sakes.md`: "doing it for a sake: motive, attachment, whose stake (`for-a-sake.md`); bars: than planned, than usual, enough and too (`bars.md`)".
- `residue-and-former.md`: "Residue / former; contrary to: plan, say words, channels, whose (`contrary-to.md`); mirative (`mirative.md`); notional (`notional.md`); already / still / not yet / no longer (`already-still-yet.md`)".
- `intention.md`: "try / fallback (`try.md`); want, decision (`want-and-decide.md`)".

## Open decisions

None open.

## Re-audit findings
<a id="follow-ups"></a>

From step 5, units R1–R4 (77 sittings). Not fixed: each is a user decision or a follow-up edit. "(doubtful)" marks a finding the auditor was unsure of.

### Choice sets split across pages (test 5)

- `more-turn-words.md` "Stacking two act words" (`yul yel`) and `rhetorical-questions.md` "Questions that sound like another act" (`yel yul`) are the two orders of one choice, on two Intermediate pages. The rhetorical-questions title also misses "Quiz" and the reversed-order H3 (test 3). Fix: one page for all stacked-act H3s, titled for the family.
- `dependents.md` hinge table teaches *if*, *only if*, *iff*; `causation.md` teaches *if* and *only if* again. Causation's lead line promises *because* and "whether you claim the condition is a fact", which no H3 teaches (test 3). Fix: one home for the condition hinges.
- `knowing.md` lead line sets MAY against "a word for how you know it" for a memory; LIVE / MEMORY is on Beginner `live-and-memory.md`. Fix: merge (knowing has 2 H3s) or narrow the line.
- `pronouns.md` `umen` *someone* and `joins.md` `zar` *someone*, both Beginner, no Compare-with between them.
- `extra-noun-hooks.md` genitive `om` and `social-ties.md` roots, both Beginner (cross-linked, but on separate pages).
- `want-and-decide.md` "Someone else's want, plan, or decision" repeats `holder.md` "Someone else's plan".
- (doubtful) `evidentiality.md` source `bl-` vs `holder.md`: both answer *Azozon says…*; evidentiality never links holder.
- (doubtful) `polar-inventory.md` "Yes/no with single-item / standalone" is used instead of a fill-ask blank; partner of "Fill-ask arity" on `fill-ask-roles.md`.
- (doubtful) `joins.md` clause *and* vs `clause-sequence.md` *and then*.
- (doubtful) Missing Compare-with lines across bands: `permission-consent.md` *Can I…?* vs Beginner `can-and-cant.md`; `stand-in-roles.md` `varn` / `vaon` vs Beginner `darl` (dependents#hinges).

### Title or lead line does not cover the page (test 3)

- `very-and-slightly.md`: `hayurom` *kind of* fits; `herugom` *again* is repetition, not degree, and has no other stage home. Fix: move it to `more-occasions.md`.
- `resume-sense.md`: the title fits only the `-rl` / `-rm` H3; the page is the `-r` family.
- `collectives.md`: "The group as one" misses associate-set resolution, addressing several people, vocatives, where `-x` sits. The axis is the `-x` family.
- `label-reach.md`: "How a kind holds" misses "IDENTITY endings".
- `universals-domains.md`: "Every and none" misses the kind itself (`zuan`) and people in general (`eyen`).
- `set-joins.md`: "And/or and the full set map" joins two jobs; suggest "Set joins", matching "Rank joins".
- `singability.md`: "Singing and speech edges" joins two jobs and misses Rhythm and stress, Words never said quietly, Voice and certainty. Suggest one job: how Ageben is voiced aloud.
- `join-limits.md`: Named phrase `-n` is a reading, not a limit, yet it is the checkpoint's main drill. Peel or retitle.
- `stacked-markers.md`: Ambient magnitude (omitted exponents) is not a marker stack and uses neither earlier H3 (tests 2, 4). Move it beside the exponent owner.
- `here-there.md`: no lead line, and the title misses *somewhere / nowhere / everywhere*.
- `residue-and-former.md` lead line names *already / still / not yet / no longer* (on `already-still-yet.md`); `feelings-permission.md` lead line names thanks and sorry (on `thanks-and-sorry.md`).
- (doubtful) `comparative-arity.md`: page title equals one H3's name; the page covers all scales, covarying clauses, factor.
- (doubtful) `digitless-exponents.md` Group separator is about a fully written number; move to number-markers "Writing".
- (doubtful) `measures-and-percent.md` and `want-and-decide.md` titles each join two jobs unless read as one family.
- (doubtful) No lead line under the title: `extra-noun-hooks`, `of-relations`, `number-markers`, `ranges`, `comparative-arity`, `evidentiality`, `holder`, `bars`, `try`, `want-and-decide`.

### Off-axis or unconnected H3s (tests 2, 4)

- `speech-moves.md` Thinking sounds: unwritten, uses and is used by nothing, can't be drilled in writing; also makes the lead line an *and also*. Move to phonology / singability or the recipe track.
- `join-limits.md` Scope islands re-teaches `scope-islands.md`; `as-of.md:105` links the copy. Cut to a Compare-with and retarget.
- (doubtful) `join-limits.md` "Allowed joins by role letter" and "Constraints" are inventories.
- (doubtful) `role-parts.md` "Places, tools, and times" teaches no role-part form.
- (doubtful) `more-turn-words.md` "Describing a call or reaction"; `more-hinges.md` two hosts for two jobs; `sentence-linkers.md` "What carries past a period"; `in-clause-hooks.md` Point back uses extra-noun hooks.

### Band (test 1), user decisions

- `singability.md` Rhythm and stress (first-syllable stress) has no earlier home though every utterance uses it; Voice and certainty likewise.
- `emphasis.md` homes no new form (gate 0); a candidate for the recipe track.
- `dated-channel.md` is the only home for *now*, *today*, *yesterday*, *ago*, all Advanced.

### Content fixes (no decision needed)

- `dependents.md:313` (Pick one answer) says *whether* takes stand-in **`o`**; the page (line 45) and the parser give `derl`, vowel `e`.
- `tag-pronouns.md:168`: "whoever acted last" implies recency, which the page denies.
- `stance-bars.md:11`: the lead sentence is garbled (missing subject). Practice never drills ability, rules / permission, or hopes / fears.
- `usually-vs-must.md`: its H3 id `#universality` names another page's job.
- `measures-and-percent.md` Practice E→A 3 (*Three to five hours*, `oel`) is a range item; the page has no percentage-points item. Suggested cue: *The price of the pills went up two percentage points.*
- `nested-dependents.md`: the late verb is not needed by the nesting (default order parses with the same structure). Use object-before-verb in every clause: lines 61, 76, 92, plus E→A 1 and 3, A→E 2, Fix it, What changes.

### Stale allowlist rows (`drill-generation.md`)

- `comparatives.md`: "Rank fence `e`/`ae`/`ue`"; the page teaches rank `o` (`zol`) and equative `oe`.
- `roles.md`: "reach `a`/`e`"; the page teaches `u` and `o`.
- `proper-names.md`: omits `-ln` and Countries and traditions.
- `evidentiality.md`: lists `blweyer` / `blwayer` (in no grammar page) and "MAY vs nearby jobs" (MAY is on `knowing.md`); omits strength, hand depth, source, forecast, evidence clause, carry forward, deduction.
- `comparative-arity.md`: lists only full arity and manner.
- `number-markers.md`: says ranges and time live in `measures-and-percent.md` (now `ranges.md` and `digit-strings.md`).
- `stand-in-roles.md` and `nested-dependents.md` Notes still give instructions that are done.

### Filenames that no longer name their title (step 7)

Untouched by this proposal: `left-bound-adjectives` (Adjectives first), `social-ties` (Social relations), `abstract-landmarks` (In a crisis, out of debt), `iff-fault` (Because and iff), `join-relations` (With and without), `more-occasions` (Exclusive and ranked times), `speech-manner` (Frankly and to be clear), `hook-compounds` (Cite plus a hook), `compound-families` (Which compound). Touched but kept: `feelings-permission` (Feelings).

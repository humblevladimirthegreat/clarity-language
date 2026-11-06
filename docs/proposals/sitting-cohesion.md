# Proposal: Making every sitting pass "what one sitting holds"

**Status:** in progress. Phases 0–4 done (2026-11-06); next is Phase 5, the last. Earlier plans, findings, the Phase 4 unit table, and gate runs are in git history (this file at `af655e7e`; the original findings and URL table at `89c0b5a2`).
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

## Follow-ups
<a id="follow-ups"></a>

For the step 5 audit:

- `very-and-slightly.md`: do `/h/` `hayurom` *kind of* and `herugom` *again* fit the title (test 3)?
- `rhetorical-questions.md`: does the title cover its three H3s (test 3)?
- drill-generation's `comparatives.md` row says "Rank fence **`e`/`ae`/`ue`**", which looks like a stale vowel label.
- Bare bold vowel labels in prose outside the pages workstream 1 fixed were not audited.
- `measures-and-percent.md` Practice: E→A item 3 (*Three to five hours*, `oel`) is still a range item, though ranges moved off the page; replace it with a single-topic measure or percent item.
- `nested-dependents.md` Practice: the build warns "statement: verb late" on three items (lines 61, 76, 92; the outer clause reads z v d h). Check whether the late verb is something the nesting needs; if not, use the default order.

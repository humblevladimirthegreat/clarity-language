# Proposal: Making every sitting pass "what one sitting holds"

**Status:** in progress. Phases 0–3 done (2026-11-05). Phase 4 (2026-11-06): units B1 and I1–I5 done; next is I6. Level reviews may now hold checkpoints + 5 items (was + 3). Decided ODs, the original findings, URL table, gate runs, and moved-H3 list are in git history (this file at `89c0b5a2`).
**Related:** [what one sitting holds](../meta/grammar-docs.md#one-sitting), [drill-generation](../meta/drill-generation.md#execute), [allowlist](../meta/drill-generation.md#allowlist), [level reviews](../meta/translation-exercises.md#level-reviews), [site redirects](../meta/site-redirects.md).
**Depends on:** none left (`range-series.md` landed).
**Design authority:** none. This proposal moves, merges, peels, and retitles existing sections. It adds no form and changes no reading.

## Problem

An audit of all 98 sittings against the tests in [what one sitting holds](../meta/grammar-docs.md#one-sitting) found sittings with mixed jobs, titles that did not cover the page, and split choice sets. Phases 1–3 fixed them by moving, peeling, merging, and renaming pages. The moves left checkpoints short or missing, which Phase 4 writes.

## Goals

1. Every sitting passes tests 2–5, 7, and 8, with tests 1 and 6 checked on every page this proposal touched.
2. Every form has one home H3.
3. No learner-facing URL breaks without a redirect.
4. Every checkpoint covers its sitting, and every allowlist row, review item, sidebar row, and `AGENTS.md` Owns line matches the result.

## Non-goals

New forms, new readings, changed spellings, or splits this proposal does not list. New findings go to a follow-up list.

## Plan

The orchestrator (the session the user talks to) runs the units in order, does no page editing itself, and commits each unit.

### Rules

- **Sequential.** One subagent at a time: units share the allowlist, the lexicon `core` column, and level reviews.
- **Gate.** A unit is done when `npm run verify -- --allow-generate` passes against the phase baseline (`tmp/verify-baseline.json`, saved at the start of Phase 4; reuse it, and re-save only if it is missing). When the subagent's last act was a passing `verify`, commit on that result.
- **Read lean.** Read the report and `git diff --stat`, not whole diffs. Open a hunk only when the report flags it or the stat shows a file outside the unit.
- **Commit** per [commits](../meta/proposals.md#commits): `sitting cohesion: 4 <unit>, <short summary> [skip-cd]`, a blank line, then `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Stage only the unit's files. A unit that skipped an item still commits and names the skip and its open decision in the body.
- **No grammar decisions.** A reported form or reading question goes under [open decisions](#open-decisions) with options and a recommendation; the item is skipped.
- **One writer for `AGENTS.md`**: the orchestrator, in Phase 5.

### Phase 4: Checkpoints

Each unit, in table order:

1. `node scripts/checkpoint-pack.mjs --unit <id> --band <Band> <pages in order>`. It writes `tmp/checkpoint-pack/<id>.md` (allowlist rows, baseline errors, settings in use, `core-vocabulary --for` per page) and rebuilds `tmp/checkpoint-pack/free-roots.tsv`. Run it right before the launch: each unit claims roots and settings.
2. Spawn one fresh subagent with `subagent_type: checkpoint-writer` (`.claude/agents/checkpoint-writer.md`: Bash, Read, Edit, Write only; opus, high effort; the full brief and report format are in its definition). Its prompt names only the unit, the pages in order, the pack path, the unit note below, and any open decision to avoid. It starts at about 15k tokens of context, against 32k for general-purpose.
3. On the report: `git diff --stat`, commit, and log any open decision.

| Unit | Band | Sittings, in order | Note for the prompt |
|------|------|--------------------|---------------------|
| I6 | Intermediate | `verb-and-stance-joins.md`, `in-clause-hooks.md`, `discourse-hooks.md` (all top up) | Hook items may drill `aer` *on it* / `aor` *with it* (parser readings confirmed). The review item for in-clause-hooks exists; no review edits |
| I7 | Intermediate | `spans-as-words.md` (top up), `quote-contents.md` (new) | |
| I8 | Intermediate | `number-markers.md`, `measures-and-percent.md` (both top up) | |
| I9 | Intermediate | `for-a-sake.md` (top up) | |
| I10 | Intermediate | `contrary-to.md` (new), `residue-and-former.md`, `bars.md` (top up) | |
| I11 | Intermediate | `try.md` (top up) | The review item for try exists; no review edits |
| A1 | Advanced | `stand-in-roles.md` (top up), `nested-dependents.md` (new) | |

### Phase 5: Bookkeeping and re-audit

- `npm run verify -- --baseline`.
- Apply the [reported Owns lines](#reported-owns-lines) to `AGENTS.md`; add rows only for new topics ([how to apply](../meta/learning-levels.md#how-to-apply)).
- Final gate: a clean `npm run build`, then `npm run lint:cheat-sheet-print` (and `npm run grammar-check` only if parser source changed).
- Re-audit with one fresh subagent (`general-purpose`, opus, high effort): check each sitting against [what one sitting holds](../meta/grammar-docs.md#one-sitting), tests 1–6, from headings and the slices a test needs; audit, don't edit; one line per finding (page, test, what fails, suggested fix). Scope: every sitting changed since `2274a6e8~1` (`git diff --stat`), plus any sitting sharing a choice set with one, plus the [follow-ups](#follow-ups). Its findings go to the user as a list.
- Ask the user to paste `dist/amplify-redirects.json` into the Amplify console (**Hosting → Rewrites and redirects**, [steps](../meta/site-redirects.md#add-a-remap-page-rename)); the renamed pages and `join-across-roles.html` need it for real 301s.
- List untouched pages whose filename no longer names their title (for example `feelings-permission.md` "Feelings") for the user.
- Commit, then delete this proposal or move it to `partially-implemented/` per [proposals](../meta/proposals.md).

## Reported Owns lines
<a id="reported-owns-lines"></a>

For Phase 5 to apply to `AGENTS.md` (current filenames):

- `clause.md`: add "leaving out who acts (`no-subject.md`)" and "degree words on `/w/` (`very-and-slightly.md`)"; chaining (`longer-chains.md`) covers chaining only.
- `speech-moves.md`: "Turns, vocatives, interjections, thinking sounds, continue (`/x/`), speech acts, …"; "turn words, further: doubled and stacked acts, commands to be ADJ, describing a call (`more-turn-words.md`)".
- `dependents.md`: "Next-sentence grammar: subordinators; continue overview, sentence linkers, what carries past a period (`sentence-linkers.md`); hinges on a degree or a noun (`more-hinges.md`); lexicalized stand-ins (`stand-in-roles.md`); nested dependents (`nested-dependents.md`)".
- `pronouns.md`: "…; resume one sense, cross-role recast (`resume-sense.md`); tag pronouns (`tag-pronouns.md`)".
- `plurality.md`: "collectives, each other, addressing several people (`collectives.md`)".
- `hooks.md`: "in-clause hooks: parallel chains, hook detail, point back (`in-clause-hooks.md`)"; "ranges, including ranges of numbers (`ranges.md`)".
- `discourse-hooks.md`: "Discourse endings at the front (-m, -r *anyway*), stacked discourse, discourse placements; somewhere / here and there (`here-there.md`)".
- `joins.md`: "what a list word reaches: SHARED, respectively, fence nesting (`list-structure.md`); rank joins, invert, route (`rank-joins.md`); and/or, whole-list denial, set inventories (`set-joins.md`)".
- `join-across-roles.md` row becomes `verb-and-stance-joins.md`: "Joins on verbs and stances: verb-phrase, clause and stance joins; list verbs (`list-verbs.md`); join-relations (`join-relations.md`); clause sequence (`clause-sequence.md`)".
- `spans.md`: "spans as words: mention, span nouns, `gl` spans, one of a title (`spans-as-words.md`); inside a quote: act words, topics (`quote-contents.md`)".
- `numbers.md`: "word shape, markers, endings, writing, letter codes (`number-markers.md`)".
- `measures-and-percent.md`: "Ranges, measure phrases, percent; …" → "Measure phrases, percent, fractions; …".
- `sakes.md`: "doing it for a sake: motive, attachment, whose stake (`for-a-sake.md`); bars: than planned, than usual, enough and too (`bars.md`)".
- `residue-and-former.md`: "Residue / former; contrary to: plan, say words, channels, whose (`contrary-to.md`); mirative (`mirative.md`); notional (`notional.md`); already / still / not yet / no longer (`already-still-yet.md`)".
- `intention.md`: "try / fallback (`try.md`); want, decision (`want-and-decide.md`)".

## Open decisions

None open. OD11 (a hook right after a join word) was decided on 2026-11-06: it is SHARED, taught on list-structure *SHARED after the join*.

## Follow-ups
<a id="follow-ups"></a>

For the Phase 5 audit:

- `very-and-slightly.md`: do `/h/` `hayurom` *kind of* and `herugom` *again* fit the title (test 3)?
- `rhetorical-questions.md`: does the title cover its three H3s (test 3)?
- drill-generation's `comparatives.md` row says "Rank fence **`e`/`ae`/`ue`**", which looks like a stale vowel label.
- Bare bold vowel labels in prose outside the pages workstream 1 fixed were not audited.

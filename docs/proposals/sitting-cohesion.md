# Proposal: Making every sitting pass "what one sitting holds"

**Status:** in progress. Phase 0 done (2026-11-05, every finding held). Workstreams done: 1, 2a, 2b, 2c, 2d, 2e (Phase 2 complete; stopped before Phase 3 at the user's request). Plan for Phases 3–5 rewritten into units on 2026-11-05 (new tools: `move-heading`, `verify`). Every open decision settled on 2026-11-05 ([open decisions](#open-decisions)); OD1, OD6, and OD10 add units 2f and 2g. Unit 2f done. Next: unit 2g.
**Related:** [what one sitting holds](../meta/grammar-docs.md#one-sitting) (the tests this proposal applies), [sitting length](../meta/drill-generation.md#sitting-length), [how to apply](../meta/learning-levels.md#how-to-apply), [gates](../meta/learning-levels.md#gates), [allowlist](../meta/drill-generation.md#allowlist), [site redirects](../meta/site-redirects.md).
**Depends on:** `range-series.md`, implemented first (B6 assumes one range series).
**Design authority:** none. This proposal moves, merges, peels, and retitles existing sections. It adds no form and changes no reading. Band changes for three sections are settled in [gate runs](#gate-runs). Any further grammar decision goes under [open decisions](#open-decisions) and waits.

## Problem

An audit of all 98 sittings against the eight tests in [what one sitting holds](../meta/grammar-docs.md#one-sitting) found one content bug, eight clear failures, ten pages whose title does not cover the page, five split choice sets or overlaps, and a handful of minor issues. About 70 sittings pass.

The audit read each page's title, lead, and the opening of every H3, and compared pages that looked like they overlapped. It did **not** re-run test 1 (band gates) or test 6 (one setting). Phase 0 re-checks every finding, because the tree has moved since the audit.

## Goals

1. Every sitting passes tests 2–5, 7, and 8, with tests 1 and 6 checked on every page this proposal touches.
2. Every form has one home H3. Other pages reach it with a Compare-with line or a link, never a second H3.
3. No learner-facing URL breaks without a redirect.
4. Every checkpoint still covers its sitting, with no leaks, and every allowlist row, review item, sidebar row, and `AGENTS.md` Owns line matches the result.

## Non-goals

- New forms, new readings, or changed spellings.
- Rewriting prose beyond what a move needs: a new lead, a bridging sentence, or a Compare-with line.
- Splitting or merging anything this proposal does not list. New findings found along the way go into a follow-up list, not into the current phase.

## Findings and recommendations

Each item has an ID used by the [plan](#phased-plan). **Move** means cutting an H3 from one existing sitting and pasting it into another existing one, by hand. **Peel** means `npm run peel-headings` onto a new file. **Merge** means two sittings become one. **Fold** means an H3 heading goes away and anything it still teaches joins the H3 above it.

### A. Content bug

**A1. [vp-clause-forms.md](../grammar/intermediate/vp-clause-forms.md): vowel rows mislabelled.** The **o** row lists `vel` / `xel` / `thel`, but the parser reads `vel` as *choice* and `vol` as *rank*. That matches [joins.md](../grammar/beginner/joins.md), where `zol` is rank and `zel` is choice. The **e**, **ao**, **ae**, **uo**, and **ue** rows look swapped the same way.
*Recommendation:* fix every cell so that its row label matches what `node scripts/parse.mjs` reads it as, checking each spelling one at a time. Then grep the grammar, cheat sheets, and Claritish for any other table copied from this one. (`range-series.md` fixes the same swap in unassigned-reserved's in-clause hooks entry.)

### B. Clear failures

**B1. [left-bound.md](../grammar/intermediate/left-bound.md) "Longer chains": three unrelated jobs (tests 2, 3, 4).**
- Keep *Complex chaining* here. The page passes as a single-H3 sitting.
- Move *How much: degree words on `/w/`* to [vague-amounts.md](../grammar/intermediate/vague-amounts.md). *Very*, *slightly*, *many*, and *few* are one choice set: degree against an unstated baseline. If vague-amounts then fails test 4, peel the H3 onto its own sitting instead ("Very and slightly").
- Peel *Leaving out who acts* onto a new **Beginner** sitting, `no-subject.md`, titled "Leaving out who acts", placed right after [clause.md](../grammar/beginner/clause.md). See [gate runs](#gate-runs) G1.

**B2. [tag-pronouns.md](../grammar/intermediate/tag-pronouns.md): the title covers 1 of 6 H3s (tests 3, 4).**
- Peel *How English approximates -r*, *Resume one sense*, and *Cross-role recast* onto a new sitting, `resume-sense.md`, titled "Resume one sense". All three answer *how do I point back when plain whole-stem -r is not enough?*
- Move *Each other* and *Addressing several people* to [collectives.md](../grammar/intermediate/collectives.md). *Addressing several people* (`awanx`) forms a choice set with that page's *Vocatives (`/y/`)* (calling a group). *Each other* is a group acting on itself, next to *Verbs: collective*.
- *Tag pronouns* stays. The page keeps its URL, title, and job.

**B3. [proper-names.md](../grammar/intermediate/proper-names.md): two off-axis H3s (tests 2, 3).**
- Move *Continue (`/x/`): overview* to [sentence-linkers.md](../grammar/intermediate/sentence-linkers.md). Linkers are `/x/` continue words, so the endings overview belongs beside them.
- Fold *Number-word exception* (the endings on number words) into *Number endings* on [number-markers.md](../grammar/intermediate/number-markers.md). [phonotactics.md](../grammar/intermediate/phonotactics.md) also uses the id `#number-word-exception`, so give the folded content a distinct id and retarget its links.

**B4. [notional-standing.md](../grammar/intermediate/notional-standing.md) "Residue and former": channel material, plus a split `uom` choice set (tests 2, 3, 5).**
- Move *Channels as comparison bars* into the bars sitting (see D4).
- **Settled by OD6 (a).** A new sitting, `contrary-to.md`, titled "Contrary to", gathers every `uom` stance kind that comes before it on the path: *Contrary to a stance (`uom`)* from [prescription.md](../grammar/intermediate/prescription.md) (plan), the say-word paragraphs from [permission-consent.md](../grammar/intermediate/permission-consent.md) *How far the say reaches* (*against the rules*, *against their will*), *Channels after `uom`* from notional-standing, and the two holder paragraphs (holder.md's *against their plan* and the channel H3's *whose view*). It sits right after [holder.md](../grammar/intermediate/holder.md) and before notional-standing. [want.md](../grammar/intermediate/want.md) comes later and keeps its WANT and DECISION rows after `uom`, linking back; mirative's and notional's *does not follow `uom`* notes stay too. Unit [2g](#unit-2g) carries it out.
- notional-standing keeps *Residue and former climate*. Rewrite its lead so it no longer promises channels.

**B5. [collectives.md](../grammar/intermediate/collectives.md) and [topic.md](../grammar/intermediate/topic.md): duplicate *Groups as the topic* (test 8).**
- Delete the collectives copy. topic.md owns `#topic-groups`. If collectives' readers need the pointer, it becomes one Compare-with line.

**B6. Ranges: one English job, two intermediate homes (test 5).** This assumes `range-series.md` is implemented. In that state:
- [ordered-ranges.md](../grammar/intermediate/ordered-ranges.md) `#ranges` teaches the one range series (`oel` / `uel` / `ual` / `uol`, with -m / -r / -n) on any ordered line, plus the endpoint rule.
- [numbers-applied.md](../grammar/intermediate/numbers-applied.md) `#number-ranges` teaches the same hooks with number ends: counted nouns, which end `uel` leaves out, and kinds of number.
- `al` / `ul` between numbers keep their *including* / *except* readings.

The job is unified, but it is still taught on two pages 11 sittings apart.
- Merge the two H3s into one sitting, `ranges.md`, titled "Ranges", in this order: `### Ranges {#ranges}` (the series), then `### Ranges of numbers {#number-ranges}`.
- Place the merged sitting after [locative-relations.md](../grammar/intermediate/locative-relations.md) (the number H3's Compare-with links to its place paths) and after [digitless-exponents.md](../grammar/intermediate/digitless-exponents.md) (±∞ ends).
- Keep both `<!-- cheat-sheet: … -->` markers with their tables, and check that the numbers and joins-hooks cheat sheets list every row once.
- Retarget [open-ranges.md](../grammar/advanced/open-ranges.md) links to `/ranges#ranges` and `/ranges#number-ranges`.
- Practice: ordered-ranges' checkpoint stays with the merged sitting. Move numbers-applied's range items only if they fit that setting; otherwise mark the row **generate** (Phase 4).
- Fix numbers-applied's lead, which still promises clock times and dates (now on [digit-strings.md](../grammar/beginner/digit-strings.md)) and ranges. What remains of that page (measures and percent) is renamed and retitled under D3. `/ordered-ranges` and `/numbers-applied` both get redirects ([URLs](#urls)).

**B7. [ability.md](../grammar/intermediate/ability.md) and [want.md](../grammar/intermediate/want.md): DECISION and WANT split (tests 3, 5).**
- Move *Decision (revisability)* to want.md, before *Someone else's want, plan, or decision*, which already covers both. Retitle want.md "Want and decide" (a choice set of mind-states about an act).
- ability.md keeps *Try* and is retitled "Try" (renamed `try.md`; see [URLs](#urls)).
- Check that DECISION's examples do not depend on TRY, and that the path order still holds.

**B8. [sentence-linkers.md](../grammar/intermediate/sentence-linkers.md): hinges mixed in with linkers (tests 3, 4).**
- Keep *Writing and speech rhythm (periods)* on sentence-linkers, and retitle the H3 "What carries past a period". Its table is mostly about what crosses a sentence edge: `/x/` continue, linkers, topic words, stand-in hangs. That is the linking job, so it passes test 4 after all. See [gate runs](#gate-runs) G2 for the Beginner slice and the topic row.
- Peel *Result (so … that)* and *Time hinges on a noun* onto a new sitting, `more-hinges.md`, titled "Hinges on a degree or a noun". Both are hinge + stand-in uses beyond Beginner [dependents](../grammar/beginner/dependents.md).
- sentence-linkers keeps *Sentence linkers* and *What carries past a period*, and gains *Continue overview* (B3). Title: "Linking sentences".

### C. Title does not cover the page (test 3)

**C1. [rank-joins.md](../grammar/intermediate/rank-joins.md):** only 3 of 8 H3s are about rank.
- rank-joins keeps *Rank joins* (tie), *Invert*, and *Route*.
- Peel *SHARED after the join*, *Respectively*, and *Fence nesting* onto `list-structure.md`, titled "What a list word reaches". All three decide what a word inside or after a list attaches to.
- Peel *Exclusivity and denying a whole list* and *Full single-item and standalone inventories* onto `set-joins.md`, titled "And/or and the full set map". If the inventory H3 turns out to be only a table that finishes a series, fold it under the exclusivity H3 and title the page "And/or".

**C2. [span-mention.md](../grammar/intermediate/span-mention.md) "Mention":** the title covers 1 of 7 H3s.
- Peel *Act words in a quote* and *Topics in a quote* onto `quote-contents.md`, titled "Inside a quote".
- Retitle span-mention "Spans as words". The rest of the page is one form family: written only, mention, span as a noun, spans before the noun, and one of a title.

**C3. [prescription.md](../grammar/intermediate/prescription.md) "Motive":** after B4 removes `uom`, retitle the page "Doing it for a sake" and rename it `for-a-sake.md` (OD6). Motive, the ending tables, attachment sites, and whose stake are all one job: saying an act is for a sake.

**C4. [label-reach.md](../grammar/intermediate/label-reach.md) "How a kind holds":** move *Commands to be ADJ* to [speech-acts.md](../grammar/intermediate/speech-acts.md) (see D2).

**C5. [digitless-exponents.md](../grammar/intermediate/digitless-exponents.md):**
- ~~Move *How big? How fast?* to fill-ask-roles~~: dropped (OD2). It stays on digitless-exponents.
- ~~Move *Group separator* to number-markers~~: dropped (OD4). It stays on digitless-exponents.
- digitless-exponents keeps *Digitless*, *How many?*, *How big? How fast?*, *Exponents*, *Bare OoM*, and *Group separator*. "How many and how big" fits: every H3 counts or sizes a number.

**C6. [discourse-hooks.md](../grammar/intermediate/discourse-hooks.md) and [ending-grids.md](../grammar/intermediate/ending-grids.md):** these two hook sittings mix discourse and in-clause hooks. Re-cut them along that axis.
- discourse-hooks keeps *Stacked discourse* and *Discourse placements*, and gains ending-grids' *Discourse* endings H3. Title: "In fact and anyway".
- ending-grids keeps *In-clause* and *Detail on the hook*, and gains *Parallel chains* and *Point back* from discourse-hooks. Title: "Hooks inside the clause".
- Both stay intermediate. Check that their order on the path still holds.

**C7. [speech-acts.md](../grammar/intermediate/speech-acts.md) "Doubling and stacking acts":** *Describing a call or reaction* is off the act-word job, but every H3 is a `/y/` turn word. With D2's additions, retitle the page "Turn words, further" (form family) and keep the call H3 there.

**C8. [dependents.md](../grammar/beginner/dependents.md):** move *Continue (`/x/`)* to [speech-moves.md](../grammar/beginner/speech-moves.md). There it forms a choice set with *Turn*: start a new speech move, or continue the one you started. Check that speech-moves sits late enough on the path for continue's examples, or thin those examples.

### D. Split choice sets and overlaps (test 5)

**D1. Joins outside nouns.** [vp-clause-forms.md](../grammar/intermediate/vp-clause-forms.md) already lists the `/th/` forms that [join-across-roles.md](../grammar/intermediate/join-across-roles.md) teaches as *Stance joins*.
- Merge join-across-roles into vp-clause-forms. Retitle the result "Joins on verbs and stances".
- join-across-roles.md goes away, so add a redirect (see [URLs](#urls)).
- [list-verbs.md](../grammar/intermediate/list-verbs.md) stays separate (a list move as the action itself), with one Compare-with line each way.

**D2. Stacked acts.** ~~Move rhetorical-questions' *Questions that sound like another act* to speech-acts~~: dropped (OD5 (a)). [rhetorical-questions.md](../grammar/intermediate/rhetorical-questions.md) keeps all three H3s (questions that are not plain asks) and its title.
- speech-acts receives *Commands to be ADJ* (C4).

**D3. Numbers in other roles, and number-marker housekeeping.**
- ~~Move number-markers' *Parts of speech on numbers* into number-roles~~: dropped (OD3). number-markers teaches it first and uses it throughout; number-roles extends it.
- number-markers receives *Letter codes* from numbers-applied (a `_` marker) and the folded number-word endings (B3).
- After B6, numbers-applied keeps *Measure phrases* and *Percent*. Retitle it "Amount of a unit", if the percent prose supports reading percent as a per-hundred unit. If not, use "Measures and percent" and note why.

**D4. Bars: three intermediate homes.** The plan bar (*Comparing against a stance (bars)*, [comparative-arity.md](../grammar/intermediate/comparative-arity.md)), the channel bar (B4), and [sake-bars.md](../grammar/intermediate/sake-bars.md) (*enough* / *too*) all rank against a value that a stance sets.
- Merge all three into sake-bars.md, in the order plan bar, channel bar, sake bar. Retitle it "Than planned, enough, too".
- comparative-arity drops to 8 H3s.
- The merged sitting must come after evidentiality and comparative-arity on the path. [stance-bars.md](../grammar/advanced/stance-bars.md) (Advanced) stays.

**D5. [roles.md](../grammar/beginner/roles.md) *Without the stem: role pointers*** re-teaches [pronouns.md](../grammar/beginner/pronouns.md#role-pointers). Remove the H3 and keep one Compare-with line in *The extra `/b/` party*. Retarget `#role-pointers-family`.

### E. Minor

**E1. [pronouns.md](../grammar/beginner/pronouns.md):** *Generic pronoun* and *Special pronouns* do not point back, but the lead says the page is about pointing back. Rewrite the lead's one-line job ("stand in for a noun") so the title covers them. Nothing moves. universals-domains' *People in general* is already framed as a comparison.

**E2. Recap H3s (test 8):**
- [joins.md](../grammar/beginner/joins.md) *Vowels and endings* (the page is at the 10-H3 cap): fold both tables to the end of *Unspecified member (`-r`)*, keeping `<a id="join-type-vowel-series">` and both cheat-sheet markers with them. The English helper is re-keyed first (OD1 (b), unit 2f).
- [word-endings.md](../grammar/beginner/word-endings.md) *The three endings*: fold.
- [stacked-markers.md](../grammar/advanced/stacked-markers.md) *Examples inventory*: fold into *Stacked markers*, or cut rows that only repeat.
- [sakes.md](../grammar/beginner/sakes.md) *Word shape* was checked and teaches (the stimulus word for a noun that is not yours), so it stays.

**E3. [stacked-markers.md](../grammar/advanced/stacked-markers.md) "From the end, and stacked marks":** end-relative `#-` is itself a stacked marker, so the H3s connect. Retitle it "Stacked markers, from the end first", or a similar title that covers both.

**E4. [stand-in-roles.md](../grammar/advanced/stand-in-roles.md):** peel *Nested dependents* onto `nested-dependents.md` (Advanced), titled "Nested dependents", if it can carry its own checkpoint. If it cannot, retitle stand-in-roles "Stand-in words and nesting".

**E5. [extra-noun-hooks.md](../grammar/beginner/extra-noun-hooks.md) "Extra nouns and whose":** `om` is itself an extra-noun hook, so the page passes as one form family. Retitle it "Extra-noun hooks" so the *and* goes.

**E6. [singability.md](../grammar/advanced/singability.md) *Thinking sounds*:** this is a form, not a singing rule. Move it to [speech-moves.md](../grammar/beginner/speech-moves.md) as a **Beginner** H3 after *Interjections* ([gate runs](#gate-runs) G3). singability keeps 7 H3s, and its title still covers them.

**E7. [join-limits.md](../grammar/advanced/join-limits.md) *Named phrase -n*** echoes proper-names' *Titled phrases*. They are in different bands, so add one Compare-with line from join-limits to proper-names. Nothing moves.

**E8. [here-there.md](../grammar/beginner/here-there.md):** on review this passes. *Somewhere* and *here* are a choice set: two ways to name a place without naming it. Add a Compare-with line between the two H3s if there isn't one already.

### Summary of new and removed files

| New sitting | Band | From |
|-------------|------|------|
| `no-subject.md` "Leaving out who acts" | Beginner | B1 |
| `resume-sense.md` "Resume one sense" | Intermediate | B2 |
| `contrary-to.md` "Contrary to" (after holder.md) | Intermediate | B4, OD6 |
| `more-hinges.md` "Hinges on a degree or a noun" | Intermediate | B8 |
| `list-structure.md` "What a list word reaches" | Intermediate | C1 |
| `set-joins.md` "And/or and the full set map" | Intermediate | C1 |
| `quote-contents.md` "Inside a quote" | Intermediate | C2 |
| `nested-dependents.md` "Nested dependents" (if E4 peels) | Advanced | E4 |
| `very-and-slightly.md` "Very and slightly" (B1 fallback) | Intermediate | B1 |

Removed: `join-across-roles.md` (D1), which redirects to the merged joins page.

### URLs
<a id="urls"></a>

**Rule.** When this proposal retitles a page and its filename no longer names the new job, rename the file to match. Every old URL gets a redirect. The public URL is `/grammar/<file>.html`, so renaming the file *is* rewriting the URL.

| Now | Rename to | New title | Item |
|-----|-----------|-----------|------|
| `ability.md` | `try.md` | Try | B7 |
| `want.md` | `want-and-decide.md` | Want and decide | B7 |
| `left-bound.md` | `longer-chains.md` | Longer chains | B1 |
| `notional-standing.md` | `residue-and-former.md` | Residue and former | B4 |
| `ordered-ranges.md` | `ranges.md` | Ranges | B6 |
| `numbers-applied.md` | `measures-and-percent.md` | Measures and percent (settled in 2a: percent is a share of a whole, not a unit) | B6, D3 |
| `rank-joins.md` | keep | Rank joins | C1 |
| `span-mention.md` | `spans-as-words.md` | Spans as words | C2 |
| `prescription.md` | `for-a-sake.md` | Doing it for a sake | C3, OD6 |
| ~~`fill-ask-roles.md`~~ | keep (OD2) | — | C5 |
| `ending-grids.md` | `in-clause-hooks.md` | Hooks inside the clause | C6 |
| `discourse-hooks.md` | keep | In fact and anyway | C6 |
| `speech-acts.md` | `more-turn-words.md` | Turn words, further | C7 |
| `vp-clause-forms.md` | `verb-and-stance-joins.md` | Joins on verbs and stances | D1 |
| `join-across-roles.md` | removed → `verb-and-stance-joins.md` | — | D1 |
| `sake-bars.md` | `bars.md` | Than planned, enough, too | D4 |
| `extra-noun-hooks.md` | keep | Extra-noun hooks | E5 |
| `stacked-markers.md` | keep | (E3 retitle) | E3 |

If a final title comes out different from this table, the slug follows the final title: kebab-case, dropping punctuation and filler words.

**How to rename one page** (Phase 3 does every row in one pass; these are the steps each row needs):

1. `git mv` the file within its band folder.
2. Retarget every reference to the old name, including the sidebar entry: grep the old slug across `docs/`, `src/`, `scripts/`, `data/`, `AGENTS.md`, and `TODO.md`. That covers links (`/old`, `old.md`, `old.md#id`), `reading-order.ts`, the allowlist **file** cell, level reviews, cheat-sheet links, `constructions.ts`, overlay CSV anchors, the lexicon `core` column, game `source`, and Claritish `<!-- Source -->`.
3. Add a `pageMoves` row to [`site-redirects.json`](../../scripts/site-redirects.json) (`/grammar/old.html` → `/grammar/new.html`), per [add a remap](../meta/site-redirects.md#add-a-remap-page-rename).
4. Prevent redirect chains: point any existing `pageMoves` row or [`hash-redirect.ts`](../grammar/.vitepress/lib/hash-redirect.ts) row that targets or names the old file at the new one.
5. Change the H1 `{#id}` to match the new title and retarget its links. Keep H3 ids.
6. Run `npm run build` and confirm that `dist/grammar/old.html` is a stub and `dist/amplify-redirects.json` lists the 301 above the `/<*>` rule.

**The user's manual step.** The Amplify console list only changes when someone pastes it. After the last phase, the user pastes `dist/amplify-redirects.json` into **Hosting → Rewrites and redirects** ([steps](../meta/site-redirects.md#add-a-remap-page-rename)). The stubs already redirect in the browser before then.

Moved H3s keep their `{#id}`, so links into them only need the page part rewritten.

## Phased plan

A single **main agent** runs the plan and does no page editing itself. Phases 0–2e ran with long-lived workstream subagents and are done. Units 2f and 2g and Phases 3–5 run as small **units**: one fresh subagent per unit, each with one or two items, the model and effort named below, and the [digest](#subagent-brief) pasted into its first prompt.

### Token budget

Follow [running with subagents](../meta/proposals.md#running-with-subagents). Phase 2's workstream subagents ran 45–100 tool calls each and ended at 140k–280k tokens of context, and since every turn re-sends the context, their spend grew with the square of their turns. Most of it was re-read build output, whole-page reads, and hand link-retargeting. For Phases 3–5 that means:

- one fresh subagent per unit; never continue a subagent into the next unit
- a fresh subagent when a unit passes about 25 turns or about 80k tokens, carrying only the item, the failing `verify` lines, and `git diff --stat`
- moves, hash rows, and link retargets through `npm run move-heading` and `npm run peel-headings`, never by hand
- `npm run verify -- --allow-generate` instead of raw build and test runs
- slice reading: headings first, then only the line ranges a unit edits
- each unit's model and effort set from the table below, through the Agent tool's `model` and `effort` fields

| Unit | Model | Effort | Why |
|------|-------|--------|-----|
| 2f joins fold, helper re-key, `aor` fix | main model | medium | A small `src/english-helper/` change with a recall gate, plus two in-place edits |
| 2g contrary-to | main model | high | Gathers paragraphs from four pages, writes seams, splits Practice: judgment |
| 3.1 hash-row backfill | smaller (`sonnet`) | low | Runs 23 listed `move-heading --record-only` commands and one row edit; `verify` gates it |
| 3.2 renames, 3.3 redirect check | smaller (`sonnet`) | low | One scratch script over settled slugs, then mechanical checks on `dist/`; `verify` gates it |
| 3.4 placement and level reviews | main model | high | Applies [order inside a band](../meta/learning-levels.md#order-inside-a-band) and writes review items: judgment |
| 4 checkpoint batches | main model | high | Checkpoints never run on a smaller model or at low effort |
| 5 re-audit | main model | high | An audit against [what one sitting holds](../meta/grammar-docs.md#one-sitting) |

### Rules for the main agent

- **Baseline per phase.** At the start of each phase, after the previous phase's last commit, run `npm run verify -- --baseline`. Every unit in the phase is gated against that baseline.
- **Sequential.** Units touch shared registry files: the sidebar in [`reading-order.ts`](../grammar/.vitepress/lib/reading-order.ts), the hash map in [`hash-redirect.ts`](../grammar/.vitepress/lib/hash-redirect.ts), [`site-redirects.json`](../../scripts/site-redirects.json), the [allowlist](../meta/drill-generation.md#allowlist), level reviews, cheat sheets, `AGENTS.md`, `src/parse/constructions.ts`, the overlay CSV, the lexicon `core` column, game `source`, and Claritish `<!-- Source -->`. Only one subagent edits at a time.
- **The first prompt carries the unit.** Paste the unit's text from this plan, each item's finding text, the gate run or open decision that settles it, and the [digest](#subagent-brief). Do not tell the subagent to read the whole proposal.
- **Gate.** A unit is done when `npm run verify -- --allow-generate` passes against the phase's baseline. When the subagent's last act was a passing `verify` and nothing has changed since, commit on that result without rerunning it.
- **Failures go back to the owner** (SendMessage), while it is under about 25 turns and 80k tokens. Past that, start a fresh subagent of the same model and effort with the item, the failing `verify` lines, and `git diff --stat`.
- **No grammar decisions.** If a subagent reports that an item needs a new form, a changed reading, or a band the gates do not support, log it under [open decisions](#open-decisions) and skip the item. If the finding changes the plan beyond that item, [stop and alert](../meta/proposals.md#stop-and-alert) the user instead.
- **Read lean.** Read each report and `git diff --stat`, not whole diffs. Open a hunk only when a report flags it, `verify` fails, or the stat shows a file outside the unit's list.
- **Commit at the end of each unit**, per [commits](../meta/proposals.md#commits).
  - One commit per unit: `sitting cohesion: <unit id>, <short summary> [skip-cd]`, then a blank line and `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Unit ids: `2f`, `2g`, `3.1`, `3.2`, `3.4`, `4 B1`, `4 I1`–`4 I11`, `4 A1`, `5`.
  - Stage only the files the unit changed. Never amend or force-push.
  - 3.1 and 3.2 are tool output; their commits hold nothing else, per [fence automated rewrites](../meta/proposals.md#fence-automated-rewrites). Hand fixes after a script go in the next unit's commit.
  - Subagents never commit. A unit whose items were all skipped makes no commit. A unit that changed files but skipped an item still commits, and the commit body names the skipped item and its [open decision](#open-decisions).

  | Phase | Units | Commits |
  |-------|-------|---------|
  | 0 | main agent, no edits (done) | 0 |
  | 1 | in-place fixes (done) | 1 |
  | 2 | 2a numbers, 2b turns, 2c stances, 2d pronouns, 2e joins (done); 2f joins fold, 2g contrary-to | 7 |
  | 3 | 3.1 backfill; 3.2 renames with 3.3 check; 3.4 placement and reviews | 3 |
  | 4 | B1, I1–I11, A1 checkpoint batches | 13 |
  | 5 | bookkeeping (`AGENTS.md`, status, proposal move) | 1 |
  | **Total** | | **25** (6 made, 19 to go) |

  The audit in Phase 5 edits nothing, so it adds no commit. Its follow-up list goes to the user.
- **One writer for `AGENTS.md`.** Subagents report the Owns-line changes they need. The main agent applies them all in Phase 5, with the ones already under [reported Owns lines](#reported-owns-lines).

### Subagent brief
<a id="subagent-brief"></a>

The main agent pastes the digest below into every subagent's first prompt, after the unit's text, each item's finding text, and the gate run or open decision that settles it. A checkpoint unit also gets the Phase 4 lines; the audit gets the Phase 5 lines.

> You are doing one unit (one or two items) of the sitting-cohesion proposal. This prompt holds what you need to start. Open a linked rule section only when the prompt does not settle a question; do not read the whole proposal.
>
> 1. **Scope.** Edit only the pages your items name, plus a registry file when the item needs it (`reading-order.ts`, `hash-redirect.ts`, `site-redirects.json`, the allowlist in `docs/meta/drill-generation.md`, level reviews, cheat sheets, `constructions.ts`). Never edit `AGENTS.md`; report Owns-line changes instead. Never commit.
> 2. **Read slices.** List headings first (`npm run page-lines -- --headings`, or `grep -n '^#' <file>`), then read only the line ranges you edit. Never open a whole long page to move one H3. Trim command output (`2>&1 | tail -30`).
> 3. **Move with tools.** An H3 into an existing sitting: `npm run move-heading -- --from a.md --ids x --into b.md (--after <id> | --before <id> | --end)`, dry run first, then `--write`. An H3 onto a new sitting: `npm run peel-headings`. Both rewrite every `page.md#id` link and write the hash rows. Never retarget links by hand. Your hand work is Practice, the allowlist, prose seams, and placement.
> 4. **Rules.** Keep every `{#id}`. Present the current language only. Teach now; never link forward to a later sitting. Add no form and change no reading: if an item needs one, stop and report it.
> 5. **Practice.** Move Practice items whose target H3 moved. A source sitting keeps its own items. A destination keeps moved items only if its setting fits; otherwise drop them and mark its allowlist row **generate**. Write no new checkpoint outside Phase 4.
> 6. **Verify.** Run `npm run verify -- --allow-generate` at the end of each item, and `--fast` for checks partway through. Never run raw `npm run build` or `npm test`, and never paste build output into your context. On a FAIL, read only the new lines it prints, or grep `tmp/verify-last.log` for one file. Check Ageben you moved or wrote with `node scripts/parse.mjs` (several inputs in one call).
> 7. **Report** in at most 8 lines, these fields only:
>    - Moved: ids, from → to
>    - Files touched: a count
>    - Registry edits: sidebar, allowlist, reviews, redirects
>    - Owns lines: exact text for `AGENTS.md`
>    - Verify: the PASS/FAIL line
>    - Skipped: item, reason, and the open decision it needs
>
> Full rules, if needed: [what one sitting holds](../meta/grammar-docs.md#one-sitting), [how to apply](../meta/learning-levels.md#how-to-apply), [order inside a band](../meta/learning-levels.md#order-inside-a-band), [present the current language only](../meta/grammar-docs.md#present-the-current-language-only), [teach now](../meta/grammar-docs.md#teach-now-dont-preview-later), [level reviews](../meta/translation-exercises.md#level-reviews), [drill-generation](../meta/drill-generation.md#execute).

**Phase 4 lines** (checkpoint units only):

> 8. **Read rules.** For each sitting, read only that sitting and earlier ones on the [path](../meta/learning-levels.md#cross-doc-path); never open a later path file or `docs/examples/` ([what you may read](../meta/drill-generation.md#execute)). Work in the order given.
> 9. **Write.** Follow [drill-generation](../meta/drill-generation.md#execute): pick a setting not used by any other checkpoint, write the `### Practice`, then set the allowlist row's Setting cell and status **exists**. A top-up keeps the existing setting and adds only the items its notes cell asks for.

**Phase 5 lines** (audit only):

> 8. **Audit, don't edit.** Check each sitting in scope against [what one sitting holds](../meta/grammar-docs.md#one-sitting), tests 1–6, from headings and the slices a test needs. Report one line per finding: page, test, what fails, a suggested fix.

### Phase 0: Baseline and re-check (main agent)

- Run `npm run build` and `npm test`, and record `npm run page-lines -- --sittings --headings`.
- Re-check every finding in this proposal against the current tree. Drop any that no longer hold. Check titles, leads, and H3 lists (`page-lines --headings`, `grep -n '^#'`), not whole pages; open a page only where the heading list can't settle it.
- Confirm that `range-series.md` is implemented: its proposal file is gone, a design-decisions entry exists, and `find.mjs --seq 'family=number' 'raw=(al|ul|am|um|ar|ur|an|un)' 'family=number'` finds no number-range uses. If it is not implemented, stop and tell the user; B6 depends on it.
- Commit nothing; Phase 0 changes no files.

### Phase 1: In-place fixes (1 subagent, workstream 1)

Every item stays within its own page(s) plus link retargets.

- **1.1** A1 (vp-clause-forms.md, then the grep for copied tables)
- **1.2** B5 (collectives.md)
- **1.3** D5 (roles.md)
- **1.4** E1 (pronouns.md)
- **1.5** E2 and E3 (joins.md, word-endings.md, stacked-markers.md)
- **1.6** E5 (extra-noun-hooks.md)
- **1.7** E7 and E8 (join-limits.md, here-there.md)

### Phase 2: Moves, merges, and peels (5 workstreams, then units 2f and 2g)

Each workstream does its moves before its peels, so a peel cuts the page in its final shape. A peel uses `npm run peel-headings` (dry run first, then `--write`), splits Practice by hand, and leaves the new allowlist row as **generate**. Run the workstreams in this order; later ones assume the earlier ones' pages.

**2a. Numbers.** Pages: proper-names, number-markers, number-roles, numbers-applied, digitless-exponents, ordered-ranges, open-ranges, fill-ask-roles, phonotactics (id retarget), the numbers and joins-hooks cheat sheets.
- **2a.1** B6's numbers-applied lead fix (lead only).
- **2a.2** B3 (number-word fold), D3, and C5's *Group separator*.
- **2a.3** C5 *How big?* → fill-ask-roles, with its retitle.
- **2a.4** B6 ranges: merge numbers-applied's `#number-ranges` H3 into ordered-ranges as its second H3, with the B6 steps (cheat-sheet markers, open-ranges links, Practice). Placement and the file rename wait for Phase 3.

**2b. Turns, linkers, and dependents.** Pages: proper-names, sentence-linkers, dependents, speech-moves, singability, label-reach, speech-acts, rhetorical-questions, stand-in-roles.
- **2b.1** B3 *Continue overview* → sentence-linkers.
- **2b.2** C8 dependents *Continue* → speech-moves; E6 *Thinking sounds* → speech-moves with G3's thinning; G2's Beginner sentence on the spoken rest; B8's period H3 retitle and topic-row move. speech-moves ends at 7 H3s.
- **2b.3** C4 and D2: *Commands to be ADJ* and *Questions that sound like another act* → speech-acts; then C7's retitle.
- **2b.4** B8 peel: `more-hinges.md`.
- **2b.5** E4: `nested-dependents.md`, or the retitle fallback.

**2c. Stances.** Pages: ability, want, notional-standing, prescription, comparative-arity, sake-bars.
- **2c.1** B7 Decision → want.md; retitle want.md and ability.md.
- **2c.2** D4 bars merge into sake-bars, including the channel bar from notional-standing.
- **2c.3** B4: peel `contrary-to.md`, then the hand move from prescription; then C3's retitle.

**2d. Pronouns and chains.** Pages: tag-pronouns, collectives, left-bound, vague-amounts, clause (placement only).
- **2d.1** B2 part 1: *Each other* and *Addressing several people* → collectives.
- **2d.2** B2 part 2: peel `resume-sense.md`.
- **2d.3** B1 part 1: degree words → vague-amounts, or the fallback peel.
- **2d.4** B1 part 2: peel `no-subject.md` into `beginner/`, with G1's thinning. Place it after clause.md in `reading-order.ts`.

**2e. Joins, hooks, and spans.** Pages: discourse-hooks, ending-grids, join-across-roles, vp-clause-forms, list-verbs, rank-joins, span-mention.
- **2e.1** C6 hooks re-cut (discourse-hooks ↔ ending-grids).
- **2e.2** D1 merge join-across-roles → vp-clause-forms, with its redirect row.
- **2e.3** C1: peel `list-structure.md`, then `set-joins.md`.
- **2e.4** C2: peel `quote-contents.md`, then retitle span-mention.

Units 2f and 2g carry out the decisions taken after 2e. Run `npm run verify -- --baseline` before 2f; both units are gated against it, and 2g runs after 2f is committed.

<a id="unit-2f"></a>
**2f. Joins fold, helper re-key, and the stale `aer`.** Main model, medium effort. Pages: joins.md, role-parts.md, the roles cheat sheet; code: `src/english-helper/`.
- **2f.1** OD1 (b). In [`analyze.ts`](../../src/english-helper/analyze.ts) `spellJoinVowel`, match any joins.md row whose form is vowels only, wherever it sits, instead of the exact `JOIN_VOWELS_SECTION` link. Then fold *Vowels and endings* per E2: both tables go to the end of *Unspecified member (`-r`)*, with `<a id="join-type-vowel-series">` and both cheat-sheet markers. Rows there now report their section as `joins.md#unspecified-member-r-phrase`, so re-pin `cases.tsv` line 106 (*among other things*) and the `and-or` links in [`detectors.ts`](../../src/english-helper/detectors.ts) to whatever link the row now carries. Cases 128–132 must still pass. Run `npm run cheat-sheet-blocks -- --write` and check the vowels and joins-hooks sheets list each row once. Run `npm run english-helper-recall -- --check` before the unit ends; it must not regress.
- **2f.2** OD10. [role-parts.md:80](../grammar/intermediate/role-parts.md) `zazozon vuguyol aol banewul. zahelan vuguyol aer.` (English *with it*) ends in `aor`, and its morph gloss in `with.it`. The same sentence on the roles cheat sheet (line 67, not generated) gets the same fix. Check both with `node scripts/parse.mjs`, then `find.mjs --word 'raw=a[eo]r'` for any other `aer` whose English is *with it* or `aor` whose English is *on it* (`aor` on ordered-ranges is the route join: leave it).
- Commit: `sitting cohesion: 2f, joins vowel recap folded, helper re-keyed, aor fix [skip-cd]`.

<a id="unit-2g"></a>
**2g. Contrary to.** Main model, high effort. Pages: prescription, permission-consent, holder, notional-standing, the new `intermediate/contrary-to.md`, want, mirative, notional (link checks only), `reading-order.ts`, the allowlist.
- **2g.1** Peel *Contrary to a stance (`uom`)* (`#contrary-to-stance`) off prescription onto `contrary-to.md`, titled "Contrary to", band intermediate, with `npm run peel-headings`. Then `npm run move-heading -- --from notional-standing.md --ids channel-zone --into contrary-to.md --end`.
- **2g.2** Move by hand, as new H3s on contrary-to between the two above (or folded into the H3 they extend, if that reads better; the page title must cover them):
  - from permission-consent *How far the say reaches* (`#say-reach`): the *against the rules* / *against their will* paragraphs and examples, and the *a yes only lifts a restriction* paragraph (lines 143–157 on 2026-11-05). permission-consent drops them with no pointer, since contrary-to comes later on the path (teach now); check the H3 still reads whole.
  - from holder: the *After `uom`, write the holder word, then the plan* sentence and its example `zazozon vowurol uom theyomalazun thagom.` Join them with the channel H3's holder paragraph (*whose view*) into one holder part at the end of the page.
  - Give each new H3 a `{#id}`; keep every existing id.
- **2g.3** Place `contrary-to.md` in `reading-order.ts` right after holder.md and before notional-standing.md. Check that nothing before it on the path still uses `uom` after a stance: `grep -rnE '\buom\b'` over pages up to holder. Noun uses (`uom berulal`, `uom bonam`) have their home on extra-noun-hooks and stay.
- **2g.4** Retitle prescription "Doing it for a sake" (H1 `{#doing-it-for-a-sake}`, keep H3 ids) and rewrite its lead without `uom`. Rewrite notional-standing's lead so it no longer promises channels. Add one Compare-with line on contrary-to's first H3 for *despite the rain* (noun after `uom`, back to extra-noun-hooks), kept from prescription's.
- **2g.5** Practice. prescription's item 3 (`zalazun vezuvel uom thagom.`) and permission-consent's item 3 (`zazozon vahuyal uom hwuvul.`) leave their pages. contrary-to has no setting yet, so drop them and leave its new allowlist row **generate**. If either source then falls short of the item counts, mark that row **generate** with a top-up note. Rewrite the allowlist rows: prescription (filename after Phase 3), permission-consent, feelings-permission (recycle notes no longer name contrary `uom` on prescription), notional-standing (drop *channels after `uom`*), and the new contrary-to row (between the holder and notional-standing rows, a scope cell naming plan, say words, channels, holder; *not* WANT / DECISION, which want.md adds later).
- Commit: `sitting cohesion: 2g, contrary-to gathers uom stances [skip-cd]`.

### Phase 3: Hash rows, renames, redirects, and placement (4 units)

Run `npm run verify -- --baseline` first. Units run in order: hash rows before renames, so the rename script renames them along with everything else; renames before placement, so the sidebar is edited once under its final names.

**3.1 Hash-row backfill.** Smaller model (`sonnet`), low effort. One `move-heading --record-only --write` call per entry in [H3s that changed pages](#moved-h3s); each call was checked as a dry run on 2026-11-05. `roles.md#role-pointers-family` and `proper-names.md#number-word-exception` need their id renames. `stacked-markers.md#examples` was removed, so it gets no row. The `join-across-roles.md` stance-join ids get no row either: the page stub carries the fragment to `vp-clause-forms.html`, where those ids live.

```sh
r() { npm run -s move-heading -- --record-only --write --from "$1" --ids "$2" --into "$3"; }
r roles.md role-pointers-family:role-pointers pronouns.md
r proper-names.md number-word-exception:number-endings number-markers.md
r numbers-applied.md letter-codes number-markers.md
r numbers-applied.md number-ranges ordered-ranges.md
r proper-names.md continue-x sentence-linkers.md
r dependents.md continue-x speech-moves.md
r singability.md thinking-sounds speech-moves.md
r sentence-linkers.md orthography-and-prosody-periods:past-a-period sentence-linkers.md
r label-reach.md command-property speech-acts.md
r sentence-linkers.md result-hinge,time-hinge-on-noun more-hinges.md
r stand-in-roles.md nested-dependents nested-dependents.md
r ability.md decision-revisability,decision,decision-mood,decision-changeability want.md
r comparative-arity.md bars sake-bars.md
r notional-standing.md channel-bars sake-bars.md
r tag-pronouns.md reciprocal,addressing-several-people collectives.md
r tag-pronouns.md how-english-approximates-r,resume-sense,cross-role-recast resume-sense.md
r left-bound.md degree-w very-and-slightly.md
r left-bound.md no-subject no-subject.md
r ending-grids.md discourse discourse-hooks.md
r discourse-hooks.md parallel-chains,hook-resume ending-grids.md
r rank-joins.md shared-after-the-join,scope-fence-p-join,respectively,fence-nesting list-structure.md
r rank-joins.md exclusivity-and-denying-a-whole-list,full-single-item-and-standalone-inventories set-joins.md
r span-mention.md quote-acts,topic-quotes quote-contents.md
```

2g needs no lines here: its `peel-headings` (`prescription.md#contrary-to-stance`) and `move-heading` (`notional-standing.md#channel-zone`) write their own rows. Check that both rows exist.

Then edit one row by hand: `{ page: "intention.md", hash: "intermediate", to: "ability.md" }` becomes `to: "want.md"`. That band opened with Decision, and want.md now holds Decision, Want, and Someone else's want; ability.md holds only Try. Gate: `verify --allow-generate`.

**3.2 Renames, in one pass.** Smaller model (`sonnet`), low effort. Every slug is settled: each page's H1 already matches its [URLs](#urls) title (checked 2026-11-05; prescription's is set by 2g), so the H1 `{#id}`s need no change.

| Now | Rename to |
|-----|-----------|
| `ability.md` | `try.md` |
| `want.md` | `want-and-decide.md` |
| `left-bound.md` | `longer-chains.md` |
| `notional-standing.md` | `residue-and-former.md` |
| `ordered-ranges.md` | `ranges.md` |
| `numbers-applied.md` | `measures-and-percent.md` |
| `span-mention.md` | `spans-as-words.md` |
| `ending-grids.md` | `in-clause-hooks.md` |
| `speech-acts.md` | `more-turn-words.md` |
| `vp-clause-forms.md` | `verb-and-stance-joins.md` |
| `sake-bars.md` | `bars.md` |
| `prescription.md` | `for-a-sake.md` |

Kept: `rank-joins.md`, `discourse-hooks.md`, `extra-noun-hooks.md`, `stacked-markers.md`, `fill-ask-roles.md` (OD2).

Write one scratch script that applies the six [rename steps](#urls) to every row, then run it once:

- `git mv` each file within its band folder.
- Retarget each old slug across `docs/`, `src/`, `scripts/`, `data/`, `AGENTS.md`, and `TODO.md` (links in every form, the sidebar, the allowlist **file** cell, reviews, cheat sheets, `constructions.ts`, overlay CSV anchors, the `core` column, game `source`, Claritish `<!-- Source -->`). Under `docs/proposals/`, retarget Markdown link targets only; filenames in tables and history lists are records and stay.
- Add one `pageMoves` row per old URL. Repoint every older `pageMoves` row whose target is an old name; the `join-across-roles.html` row then points straight at `verb-and-stance-joins.html`, with no chain.
- In `hash-redirect.ts`, rename the old file in both `page` and `to`. The page stubs carry the fragment to the new URL, so a row must be keyed on the new page to fire. Re-key the `join-across-roles.md` rows onto `verb-and-stance-joins.md` the same way, and drop any row that then sends an id to the page where it already lives.

Review `git diff --stat`, then gate with `verify --allow-generate`. Hand fixes the script can't place go in 3.4.

**3.3 Redirect check.** Same subagent as 3.2. Its last `verify` already built `dist/`, so read the results there, with no further build: one 301 per old URL in `dist/amplify-redirects.json`, no chains, all above `/<*>`; every old `dist/grammar/<old>.html` is a stub; every `hash-redirect.ts` row's `page` is a live page (not a stub), and its `to` and `toHash` exist. The main agent spot-checks two rows. No commit of its own: it lands with 3.2.

**3.4 Placement and level reviews.** Main model, high effort.

- Walk the three sidebar groups in `reading-order.ts` and apply [order inside a band](../meta/learning-levels.md#order-inside-a-band) to every sitting this proposal touched. Fixed placements: `no-subject.md` right after clause.md (Beginner), before pronouns.md. `ranges.md` after `locative-relations.md` and `digitless-exponents.md`. `bars.md` after evidentiality and comparative-arity. `contrary-to.md` right after holder.md and before `residue-and-former.md` (set in 2g; check it held). The `more-turn-words.md` placement no longer binds (OD5).
- Give each new sitting one item in its band's [level review](../meta/translation-exercises.md#level-reviews): `no-subject.md` (Beginner); `very-and-slightly.md`, `resume-sense.md`, `more-hinges.md`, `list-structure.md`, `set-joins.md`, `quote-contents.md`, `contrary-to.md` (Intermediate); `nested-dependents.md` (Advanced).
- Clear the four Phase 2 leftovers in the baseline that no generate row owns: joins.md's anchors `#standalone-phrase` (`sentence.vpCoordPart.standaloneJoin`) and `#right-close` (`npCoordPart.itemHook` / `itemHookBound`) are not exercised on joins.md; and the `join.ae` family's home on set-joins `#exclusivity-and-denying-a-whole-list` traces no member while discourse-hooks *Stacked discourse* uses it. Fix each by re-homing the construction in `constructions.ts` where it is taught first, or by a Practice or example change; report which.
- english.md line 194's link text still names the removed *Vowels and endings* heading (2f); update the text.
- Fill the review gaps in OD7–OD9: one item each for `try.md` (ATTEMPT), `tag-pronouns.md`, `in-clause-hooks.md`, and `rank-joins.md`. `verify` then shows the four level-review errors resolved.
- Gate: `verify --allow-generate`, with every touched sitting's placement passing `lint:forward-links` (part of the build).

### Phase 4: Checkpoints (13 units, in path order)

Run `npm run verify -- --baseline` first. Then regenerate the list below from the allowlist itself (every row whose status is **generate**, by band, in path order), since 3.4 may have moved rows. The list as of 2026-11-05, under the Phase 3 filenames:

| Unit | Band | Path | Sittings, in order |
|------|------|------|--------------------|
| B1 | Beginner | 5, 6 | `no-subject.md` (new), `speech-moves.md` (top up) |
| I1 | Intermediate | 5 | `longer-chains.md` (top up), `very-and-slightly.md` (new) |
| I2 | Intermediate | 7 | `sentence-linkers.md` (top up), `more-hinges.md` (new) |
| I3 | Intermediate | 9 | `resume-sense.md` (new), `tag-pronouns.md` (top up), `collectives.md` (top up) |
| I4 | Intermediate | 10, 11 | `label-reach.md` (top up), `list-structure.md` (new) |
| I5 | Intermediate | 11 | `rank-joins.md` (top up), `set-joins.md` (new) |
| I6 | Intermediate | 12 | `verb-and-stance-joins.md` (top up), `in-clause-hooks.md` (top up), `discourse-hooks.md` (top up) |
| I7 | Intermediate | 14 | `spans-as-words.md` (top up), `quote-contents.md` (new) |
| I8 | Intermediate | 15 | `number-markers.md` (top up), `measures-and-percent.md` (top up) |
| I9 | Intermediate | 16 | `for-a-sake.md`, `permission-consent.md` (top ups, only if 2g left them **generate**; otherwise skip the unit) |
| I10 | Intermediate | 16, 17 | `contrary-to.md` (new), `residue-and-former.md` (top up), `bars.md` (top up) |
| I11 | Intermediate | 17 | `try.md` (top up) |
| A1 | Advanced | 7 | `stand-in-roles.md` (top up), `nested-dependents.md` (new) |

- One fresh subagent per unit, main model, high effort, with the digest and its Phase 4 lines. Units run in table order; each writes its sittings in the order given, following [drill-generation](../meta/drill-generation.md#execute) ("one file at a time").
- Each subagent has read only its own sittings and earlier ones, which keeps the [read rules](../meta/drill-generation.md#execute). Running in sequence also means each checkpoint sees the `core` cells and settings the earlier ones wrote, so the subagent picks each setting itself and writes its own Setting cell and status.
- Each unit's prompt also carries its rows' allowlist notes cells (what to top up, what moved where). If the regenerated list differs from the table, keep batches of two or three in path order.
- Gate per unit: `verify --allow-generate`, which shows that unit's generate-row errors gone and nothing new.
- I6's hook checkpoints may drill `aer` *on it* / `aor` *with it*: OD10 confirmed the parser readings, and 2f fixed the last stale example.

### Phase 5: Bookkeeping and re-audit (main agent, plus 1 fresh subagent)

- Run `npm run verify -- --baseline` first, as in every phase.
- Apply every [reported Owns line](#reported-owns-lines) to `AGENTS.md`, under the Phase 3 filenames, plus any reported since. Rows are added only for new topics, per [how to apply](../meta/learning-levels.md#how-to-apply).
- Final gate: a clean `npm run build`. Phase 4 cleared every **generate** row, so nothing is expected to fail. If it does, `npm run verify` names what is new since the Phase 5 baseline. Then `npm run grammar-check` (only if any parser source changed, which this proposal should not cause) and `npm run lint:cheat-sheet-print`.
- Spawn a fresh subagent (main model, high effort, the digest plus its Phase 5 lines, no context from earlier phases) to re-audit against [what one sitting holds](../meta/grammar-docs.md#one-sitting), including tests 1 and 6. Scope: every sitting this proposal created, edited, or renamed (from `git diff --stat` since the Phase 0 baseline), plus any sitting that shares a choice set with one of them. The audit also covers the follow-ups already logged: the very-and-slightly title (test 3, follow-up from 2d.3), the rhetorical-questions title over its three H3s (test 3, OD5), the drill-generation `comparatives.md` row's vowel label, and the bare bold vowel labels left from A1. Leftover findings become a follow-up list for the user, not more edits.
- Ask the user to paste `dist/amplify-redirects.json` into the Amplify console ([URLs](#urls)): every renamed page and `join-across-roles.html` needs it for real 301s.
- List pages this proposal did not touch whose filename no longer names their title (for example `feelings-permission.md` "Feelings"), as a follow-up for the user.
- Commit the phase.
- Set this proposal's status, and move it to `partially-implemented/` or delete it per [proposals](../meta/proposals.md).

## Gate runs
<a id="gate-runs"></a>

**Decided** (2026-11-04): G1, G2, and G3 below are adopted as written. Three items could move between bands, so the [gates](../meta/learning-levels.md#gates) were run on each, in order: gate 0 (is it a form?), gate 1 (Advanced, any one criterion), gate 2 (Beginner: corpus, usable, and slice, all three), then gate 4 (dependency placement). Path positions come from [`reading-order.ts`](../grammar/.vitepress/lib/reading-order.ts).

### G1. Leaving out who acts (B1): Beginner

| Gate | Result |
|------|--------|
| 0. Form | Yes: a role-letter rule (the `/z/` word may be left out, and then the sentence names no doer). |
| 1. Advanced | Fails. The passive (*was seen*, *got stolen*, *mistakes were made*) is everyday English, not rare or stylistic. |
| 2. Corpus | **Passes, twice over.** First-stretch dialogue hits the passive. And a Beginner sitting already needs it: [pronouns.md](../grammar/beginner/pronouns.md#whoever-it-was) *Whoever it was* opens with `dugedel vayebel.`, a sentence with no subject, while the rule's home sits in Intermediate. That is a live gate-4 violation today. |
| 2. Usable | Passes: one sentence of explanation and one example. |
| 2. Slice | Passes: the whole rule is the slice. |
| 4. Dependencies | The H3 uses `/d/` and `/v/` (clause.md, position 11), so it goes right after clause.md and before pronouns.md (position 14). Its Compare-with line has two forward references to thin: **`zumen`** (pronouns, later) and **`zalen`** (topic, Intermediate). Move the `zumen` contrast onto pronouns' *Special pronouns* H3, pointing back to this one. Move the *a missing subject never means the topic* sentence to topic.md's *The topic pronoun*. |

**Decision:** a new Beginner sitting, not an H3 on clause.md. clause.md has 9 H3s, and a 10th would put it at the cap with no room left. A one-H3 sitting passes the [lower bound](../meta/grammar-docs.md#one-sitting) if it earns a checkpoint, and a short "who did it?" setting can.

### G2. Periods (B8): split, with the Beginner slice already in place

| Gate | Result |
|------|--------|
| 0. Form | Yes: punctuation, and the rest that a period stands for in speech. |
| 1. Advanced | Only the speech column touches "speech edges"; the table as a whole is about what a period does to the speech act. Not Advanced. |
| 2. Corpus | The *core* passes: every Beginner example ends in a period. |
| 2. Usable | **The whole table fails.** Its rows need `/x/` continue, linkers, topic words, soft **-m**, and stand-in hangs, most of them Intermediate. |
| 2. Slice | **A slice exists and is mostly taught already.** clause.md says *a period ends the statement*, and speech-moves says *a period already marks a statement, so you usually leave `yal` out*. The only missing part is the spoken side: *in speech, a period is a rest of one silent beat*. |
| 3. Otherwise | The rest is Intermediate, "finish the series". |
| 4. Dependencies | sentence-linkers is position 58 and topic.md 61, so the table's topic-word row already points forward. |

**Decision:**
- Add one sentence on the spoken rest to speech-moves' *Turn* H3. That is a Beginner slice, not a moved H3.
- Keep the table on sentence-linkers, retitled "What carries past a period".
- Move its topic-word row to topic.md (*What a topic change resets*), which follows sentence-linkers on the path.
- This replaces the earlier plan (move to speech-moves, falling back to tone-marks), so the conditional tone-marks rename is dropped.

### G3. Thinking sounds (E6): Beginner

| Gate | Result |
|------|--------|
| 0. Form | Yes: two conventional sounds with distinct, assigned meanings (*still thinking* / *the word is on its way*), plus a rule (never hold `u`). |
| 1. Advanced | Fails. It is not rare: hesitation is constant in learner speech. It is not stylistic or singing. It is not a speech *edge* either: singability's *Speech edges* is about where a sentence starts and stops, and a thinking sound holds a gap in the middle. |
| 2. Corpus | **Passes strongly.** A learner speaking at all needs a way to hold the floor, and Beginner is when they will pause most. |
| 2. Usable | Passes: one table of two rows. |
| 2. Slice | Passes: the whole H3. |
| 4. Dependencies | It uses vowels and pitch (phonology, position 1). The `u` warning relies on `u` meaning *not*, which is in [joins.md](../grammar/beginner/joins.md#negation-u), Beginner, after speech-moves. Rephrase that warning as "a held `u` can sound like a denial" without the grammar-word claim, or place the H3 after joins. Two forward references to thin: **letter names** (Intermediate, position 51): move the *a thinking vowel is held well past one beat, unlike a letter name* contrast to letter-names.md. The **`ol` / `el`** Compare-with (hooks.md, position 19): keep it, but move it to hooks.md's *Rather* H3, pointing back. |

**Decision:** an H3 on speech-moves after *Interjections*. Both are short sounds that stand outside the clause. That brings speech-moves to 7 H3s once C8's *Continue* lands too.

## Reported Owns lines
<a id="reported-owns-lines"></a>

Owns-line changes that subagents reported, for Phase 5 to apply to `AGENTS.md`:

- 2a, `numbers.md` row: number-markers also owns letter codes ("word shape, markers, endings, writing, letter codes (`number-markers.md`)").
- 2a, `numbers-applied.md` row: "Ranges, measure phrases, percent; …" → "Measure phrases, percent, fractions; …" (and the filename after Phase 3).
- 2b, `speech-moves.md` row: "Turns, vocatives, interjections, thinking sounds, continue (`/x/`), speech acts, …"; "doubled and stacked acts (`speech-acts.md`)" → "turn words, further: doubled and stacked acts, commands to be ADJ, describing a call (`speech-acts.md`)" (filename after Phase 3).
- 2b, `dependents.md` row: "Next-sentence grammar: subordinators; continue overview, sentence linkers, what carries past a period (`sentence-linkers.md`); hinges on a degree or a noun (`more-hinges.md`)"; lexicalized stand-ins (`stand-in-roles.md`); nested dependents (`nested-dependents.md`).
- 2c, `intention.md` row: "decision, try / fallback (`ability.md`); want (`want.md`)" → "try / fallback (`ability.md`); want, decision (`want.md`)" (filenames after Phase 3).
- 2c, `sakes.md` row: "enough and too, sake bars (`sake-bars.md`)" → "bars: than planned, than usual, enough and too (`sake-bars.md`)" (filename after Phase 3).
- 2c, `notional-standing.md` row: "Residue / former, channel bars" → "Residue / former; contrary to a stance: plan, say words, channels, whose (`contrary-to.md`)" (OD6; filename after Phase 3). This replaces the earlier "channels after `uom`" wording.
- OD6, `sakes.md` row: "motive, attachment, whose stake, contrary (`prescription.md`)" → "doing it for a sake: motive, attachment, whose stake (`prescription.md`)" (filename after Phase 3).
- 2d, `plurality.md` row: "collectives, each other, addressing several people (`collectives.md`)".
- 2d, `pronouns.md` row: "…; resume one sense, cross-role recast (`resume-sense.md`); tag pronouns (`tag-pronouns.md`)".
- 2d, `clause.md` row: add "leaving out who acts (`no-subject.md`)" and "degree words on `/w/` (`very-and-slightly.md`)"; chaining (`left-bound.md`, filename after Phase 3) covers chaining only.
- 2e, `hooks.md` row: "in-clause hooks: parallel chains, hook detail, point back (`ending-grids.md`)"; `discourse-hooks.md` row: "Discourse endings at the front (-m, -r *anyway*), stacked discourse, discourse placements; somewhere / here and there (`here-there.md`)".
- 2e, `join-across-roles.md` row becomes `vp-clause-forms.md`: "Joins on verbs and stances: verb-phrase, clause and stance joins; list verbs (`list-verbs.md`); join-relations (`join-relations.md`); clause sequence (`clause-sequence.md`)".
- 2e, `joins.md` row: "what a list word reaches: SHARED, respectively, fence nesting (`list-structure.md`); rank joins, invert, route (`rank-joins.md`); and/or, whole-list denial, set inventories (`set-joins.md`)".
- 2e, `spans.md` row: "spans as words: mention, span nouns, `gl` spans, one of a title (`span-mention.md`); inside a quote: act words, topics (`quote-contents.md`)".
- 2a, `hooks.md` row: "ordered ranges (`ordered-ranges.md`)" → "ranges, including ranges of numbers" (and the filename after Phase 3).

## H3s that changed pages
<a id="moved-h3s"></a>

For Phase 3's hash-redirect rows (`old.md#id` → new page):

- 1: `roles.md#role-pointers-family` removed → `pronouns.md#role-pointers`; `stacked-markers.md#examples` removed; `proper-names.md#number-word-exception` folded → `number-markers.md#number-endings`.
- 2a: `numbers-applied.md#letter-codes` → `number-markers.md`; `numbers-applied.md#number-ranges` → `ordered-ranges.md`.
- 2b: `proper-names.md#continue-x` → `sentence-linkers.md`; `dependents.md#continue-x` → `speech-moves.md`; `singability.md#thinking-sounds` → `speech-moves.md`; `sentence-linkers.md#orthography-and-prosody-periods` → `sentence-linkers.md#past-a-period` (id renamed); `label-reach.md#command-property` → `speech-acts.md`; `sentence-linkers.md#result-hinge` and `#time-hinge-on-noun` → `more-hinges.md`; `stand-in-roles.md#nested-dependents` → `nested-dependents.md`.
- 2c: `ability.md#decision-revisability` (also `#decision`, `#decision-mood`, `#decision-changeability`) → `want.md`; `comparative-arity.md#bars` → `sake-bars.md`; `notional-standing.md#channel-bars` → `sake-bars.md`. 
- 2d: `tag-pronouns.md#reciprocal` and `#addressing-several-people` → `collectives.md`; `tag-pronouns.md#how-english-approximates-r`, `#resume-sense`, `#cross-role-recast` → `resume-sense.md`; `left-bound.md#degree-w` → `very-and-slightly.md`; `left-bound.md#no-subject` → `beginner/no-subject.md`.
- 2e: `ending-grids.md#discourse` → `discourse-hooks.md`; `discourse-hooks.md#parallel-chains`, `#hook-resume` → `ending-grids.md`; `join-across-roles.md#stance-joins`, `#stance-join-before-barl`, `#standalone-stance-joins` → `vp-clause-forms.md`; `rank-joins.md#shared-after-the-join`, `#scope-fence-p-join`, `#respectively`, `#fence-nesting` → `list-structure.md`; `rank-joins.md#exclusivity-and-denying-a-whole-list`, `#full-single-item-and-standalone-inventories` → `set-joins.md`; `span-mention.md#quote-acts`, `#topic-quotes` → `quote-contents.md`.
- 2g (planned): `prescription.md#contrary-to-stance` → `contrary-to.md` (3.1 records it); `notional-standing.md#channel-zone` → `contrary-to.md` (`move-heading` writes it). The paragraphs from permission-consent and holder are not H3s, so they get no row.
- Also repoint `hash-redirect.ts`'s `intention.md#intermediate → ability.md` row (that page now holds only Try).

## Open decisions

The main agent adds anything a subagent reports, and skips the affected item until the user decides. **All of OD1–OD10 were decided on 2026-11-05**; each entry keeps its finding and records the decision.

- **OD1. joins.md *Vowels and endings* fold (E2), skipped in workstream 1.** Folding the H3 under another one and keeping an `<a id="join-type-vowel-series">` breaks the English helper: `JOIN_VOWELS_SECTION` in `src/english-helper/analyze.ts` keys on the section a table row sits in, and `sectionAt` (`src/lint/learning-order.ts`) ignores mid-section anchors, so vowel-only rows (*not* → `u`) stop spelling as join words (cases.tsv 128, 130–132). Options: (a) teach `sectionAt` to honour mid-section `<a id>`s, (b) re-key the helper on vowel-only joins.md rows wherever they sit, (c) leave the recap H3.
  **Decided: (b), then fold** (unit 2f). (a) changes `sectionAt`, which drives the learning order, forward-link lint, drill coverage, and the game build, for one table. (c) keeps a recap H3 (test 8) on a page at the cap. The tables go to the end of *Unspecified member (`-r`)*, which already teaches the endings and leads into *Clause joins*.
- **OD2. C5 *How big? How fast?* → fill-ask-roles (2a.3), skipped.** `wrar` is a digitless number blank (`ra` + -r), taught on number-markers and digitless-exponents, both after fill-ask-roles on the path (gate 4). The move would also split *how much* (`grar` on *How many?* / `wrar` on *How big?*, test 5). digitless-exponents keeps the H3; fill-ask-roles keeps its title and filename, so its URLs row drops. Reopen only if fill-ask-roles moves after digitless-exponents.
  **Decided: closed as written.** The move is dropped from C5.
- **OD3. D3 *Parts of speech on numbers* → number-roles (2a.2), skipped.** number-markers comes before number-roles and uses numbers in other slots throughout (Number endings `dragel` / `drager`, marker-table cells, three Practice items), so the H3 stays where it is taught first. Options: keep it, or thin number-markers heavily, Practice included.
  **Decided: keep it on number-markers.** Thinning would make learners wait for forms they meet right away; number-roles extends it. The move is dropped from D3.
- **OD4. C5 *Group separator* → number-markers (2a.2), skipped.** Its scalar examples need exponents (`wa` / `ya`), taught on digitless-exponents, after number-markers; without an exponent the examples have no documented reading. number-markers' Word shape already introduces the spoken comma.
  **Decided: keep it on digitless-exponents.** Writing a big number fits "How many and how big". The move is dropped from C5 and D3.
- **OD5. D2 *Questions that sound like another act* → speech-acts (2b.3), skipped.** Its table teaches `yel yal` as *quiz*, the home form of rhetorical-questions' *Quiz* H3, and ties `yel yol` to the quiz, so moving it makes a second home or splits a choice set (test 5). Its check-back Compare-with lines would also point forward from speech-acts to polar-inventory. Options: (a) leave it on rhetorical-questions (all three H3s are questions that are not plain asks); (b) move *Quiz* with it and move the check-back lines to polar-inventory; (c) move it, drop the `yel yal` row, and move the quiz and check-back sentences to their own pages. With D2 skipped, the "speech-acts before rhetorical-questions" placement no longer binds.
  **Decided: (a), keeping the title.** (b) splits *Quiz* from *Rhetorical question*; (c) deletes a teaching row. The Phase 5 audit checks the title under test 3.
- **Phase 3 addition: hash redirects for moved H3s.** Hand moves and `peel-headings` added no `hash-redirect.ts` rows, so old `page#id` URLs open the old page but not the section. Phase 3 adds a row for every H3 that moved pages (goal 3).
  **Closed:** unit 3.1 does it.
- **OD6. B4 `contrary-to.md` peel and C3 retitle (2c.3), skipped.** Moving *Contrary to a stance (`uom`)* off prescription puts the `uom` home after holder (the channel H3 needs channels and a holder), but permission-consent (4 uses: `uom hwuvul` / `hwubum`) and holder (`uom theyomalazun thagom`) already use and link to it earlier on the path. Options: (a) contrary-to gathers every `uom` stance kind (plan, say words from permission-consent, holder's paragraph, channels), placed after holder; (b) peel only *Channels after `uom`*, leaving the base H3 on prescription (C3's retitle then fails test 3 and the `uom` set stays split); (c) move permission-consent after contrary-to and drop holder's `uom` paragraph. notional-standing's lead rewrite and C3 wait on this; prescription keeps "Motive" and its filename, so its URLs row is on hold.
  **Decided: (a)** (unit 2g). Path positions on 2026-11-05: prescription 95, permission-consent 97, evidentiality 98, holder 99, notional-standing 100, so contrary-to after holder has no forward references, and one page answers *what does this event go against?* want.md (111) keeps its WANT and DECISION rows after `uom` and links back, as a later page extending the series; mirative (103) and notional (104) keep their *does not follow `uom`* notes. Noun uses (`uom berulal`, `uom bonam`) have their home on extra-noun-hooks and do not move. prescription becomes "Doing it for a sake" (`for-a-sake.md`). (b) leaves the set split; (c) puts permission-consent after a page that depends on it.
- **OD7. Level review for ability.md (2c.1).** With DECISION on want.md, review-intermediate has no item linking ability.md, and `lint ageben` reports a level-review error (not a generate-row error). Unit 3.4 adds an ATTEMPT review item.
- **OD8. Level review for tag-pronouns.md (2d.2).** The review item *How English approximates -r* now links resume-sense.md, so tag-pronouns has none; same kind of error as OD7. Unit 3.4 adds a tags item.
- **Follow-up from 2d.3.** B1's degree words went to the fallback peel `very-and-slightly.md`, not vague-amounts: speech-acts, exactly-like, and feelings-permission use or link `#degree-w` well before vague-amounts (gate 4). Its `/h/` words `hayurom` *kind of* and `herugom` *again* may not fit "Very and slightly" (test 3); the Phase 5 audit checks the title.
- **OD9. Level reviews for ending-grids.md and rank-joins.md (2e).** Their review items now link discourse-hooks and list-structure; same kind as OD7/OD8. Unit 3.4 adds one item each.
- **OD10. `aer` / `aor` readings (2e.1), user to confirm.** Workstream 2e swapped *on it* / *with it* on the Point back table, english.md, role-parts, hooked-joins, and the joins-hooks cheat sheet so the prose matches the parser (`aer` *on it*, `aor` *with it*). It looks like the same stale vowel relabel as A1 (as do the `aol` / `ael` cue labels it fixed), but it changes stated readings, so confirm the parser side is the intended one.
  **Decided: the parser side holds.** The Beginner base hooks are `ael` *on* and `aol` *using* ([extra-noun-hooks](../grammar/beginner/extra-noun-hooks.md)), and ending-grids itself says the pointer keeps its hook's vowel. 2e missed one example: role-parts `zazozon vuguyol aol banewul. zahelan vuguyol aer.` (English *with it*), echoed on the roles cheat sheet. Unit 2f fixes both.
- **Follow-up.** drill-generation's `comparatives.md` row says "Rank fence **`e`/`ae`/`ue`**", which looks like the old swap; unaudited.
- **Process note.** A **generate** allowlist row fails the build until Phase 4 writes its checkpoint, so from 2a.2 on, "green" means tests pass and every `lint ageben` error (checkpoint inventory, drill coverage, practice-item count, word bank, core cells) sits on a **generate** row that Phase 4 writes or tops up.
- **Follow-up from A1.** Workstream 1 also fixed stale bold vowel labels (`**…el** (`zol`)`) on rank-joins, say-questions, join-limits, fill-ask-roles, causation, and the talking cheat sheet. Bare bold vowel labels in other prose were not audited.

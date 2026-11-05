# Proposal: Making every sitting pass "what one sitting holds"

**Status:** PROPOSED.
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
- Peel *Channels after `uom`* onto a new sitting, `contrary-to.md`, titled "Contrary to". Then move *Contrary to a stance (`uom`)* from [prescription.md](../grammar/intermediate/prescription.md) into it, ahead of the channel H3. Both put a stance after the same hook. The new sitting must come after [evidentiality.md](../grammar/intermediate/evidentiality.md) and prescription on the path.
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

**C3. [prescription.md](../grammar/intermediate/prescription.md) "Motive":** after B4 removes `uom`, retitle the page "Doing it for a sake". Motive, the ending tables, attachment sites, and whose stake are all one job: saying an act is for a sake.

**C4. [label-reach.md](../grammar/intermediate/label-reach.md) "How a kind holds":** move *Commands to be ADJ* to [speech-acts.md](../grammar/intermediate/speech-acts.md) (see D2).

**C5. [digitless-exponents.md](../grammar/intermediate/digitless-exponents.md):**
- Move *How big? How fast?* (`wrar`, a blank on `/w/`, not a number) to [fill-ask-roles.md](../grammar/intermediate/fill-ask-roles.md). Retitle that page "More fill-asks" (form family: fill-ask blanks).
- Move *Group separator* to number-markers (see D3).
- digitless-exponents keeps *Digitless*, *How many?*, *Exponents*, and *Bare OoM*. "How many and how big" still fits, because *big* is now magnitude.

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

**D2. Stacked acts.** Move rhetorical-questions' *Questions that sound like another act* to [speech-acts.md](../grammar/intermediate/speech-acts.md), right after *Stacking two act words*, which it extends.
- [rhetorical-questions.md](../grammar/intermediate/rhetorical-questions.md) keeps *Rhetorical question* and *Quiz* (two questions that do not seek information).
- speech-acts also receives *Commands to be ADJ* (C4).
- speech-acts must come before rhetorical-questions on the path.

**D3. Numbers in other roles, and number-marker housekeeping.**
- Move number-markers' *Parts of speech on numbers* into [number-roles.md](../grammar/intermediate/number-roles.md), whose title "A number in other roles" is exactly that job.
- number-markers receives *Letter codes* from numbers-applied (a `_` marker), *Group separator* (C5), and the folded number-word endings (B3).
- After B6, numbers-applied keeps *Measure phrases* and *Percent*. Retitle it "Amount of a unit", if the percent prose supports reading percent as a per-hundred unit. If not, use "Measures and percent" and note why.

**D4. Bars: three intermediate homes.** The plan bar (*Comparing against a stance (bars)*, [comparative-arity.md](../grammar/intermediate/comparative-arity.md)), the channel bar (B4), and [sake-bars.md](../grammar/intermediate/sake-bars.md) (*enough* / *too*) all rank against a value that a stance sets.
- Merge all three into sake-bars.md, in the order plan bar, channel bar, sake bar. Retitle it "Than planned, enough, too".
- comparative-arity drops to 8 H3s.
- The merged sitting must come after evidentiality and comparative-arity on the path. [stance-bars.md](../grammar/advanced/stance-bars.md) (Advanced) stays.

**D5. [roles.md](../grammar/beginner/roles.md) *Without the stem: role pointers*** re-teaches [pronouns.md](../grammar/beginner/pronouns.md#role-pointers). Remove the H3 and keep one Compare-with line in *The extra `/b/` party*. Retarget `#role-pointers-family`.

### E. Minor

**E1. [pronouns.md](../grammar/beginner/pronouns.md):** *Generic pronoun* and *Special pronouns* do not point back, but the lead says the page is about pointing back. Rewrite the lead's one-line job ("stand in for a noun") so the title covers them. Nothing moves. universals-domains' *People in general* is already framed as a comparison.

**E2. Recap H3s (test 8):**
- [joins.md](../grammar/beginner/joins.md) *Vowels and endings* (the page is at the 10-H3 cap): fold the table under *Clause joins* or the last set-join H3, keeping the `<!-- cheat-sheet: vowels -->` marker with it.
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
| `contrary-to.md` "Contrary to" | Intermediate | B4 |
| `more-hinges.md` "Hinges on a degree or a noun" | Intermediate | B8 |
| `list-structure.md` "What a list word reaches" | Intermediate | C1 |
| `set-joins.md` "And/or and the full set map" | Intermediate | C1 |
| `quote-contents.md` "Inside a quote" | Intermediate | C2 |
| `nested-dependents.md` "Nested dependents" (if E4 peels) | Advanced | E4 |

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
| `numbers-applied.md` | `measures.md` | Amount of a unit (or Measures and percent) | B6, D3 |
| `rank-joins.md` | keep | Rank joins | C1 |
| `span-mention.md` | `spans-as-words.md` | Spans as words | C2 |
| `prescription.md` | `doing-it-for-a-sake.md` | Doing it for a sake | C3 |
| `fill-ask-roles.md` | `more-fill-asks.md` | More fill-asks | C5 |
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

A single **main agent** runs the plan. It does no page editing itself. It hands the work to a few long-lived **workstream subagents**, each owning a cluster of items that share pages, and keeps the tree green between workstreams.

### Token budget

Follow [running with subagents](../meta/proposals.md#running-with-subagents). For this proposal, that means:

- one subagent per workstream below, with later items sent as one line ("Do 2b.3")
- renames done by one script in Phase 3, not one subagent per row
- fresh subagents for Phase 4 checkpoints (read rules) and the Phase 5 audit (independence), and nowhere else

### Rules for the main agent

- **Sequential.** Moves, peels, and merges touch shared registry files: the sidebar in [`reading-order.ts`](../grammar/.vitepress/lib/reading-order.ts), the hash map in [`hash-redirect.ts`](../grammar/.vitepress/lib/hash-redirect.ts), [`site-redirects.json`](../../scripts/site-redirects.json), the [allowlist](../meta/drill-generation.md#allowlist), level reviews, cheat sheets, `AGENTS.md`, `src/parse/constructions.ts`, the overlay CSV, the lexicon `core` column, game `source`, and Claritish `<!-- Source -->`. Only one subagent edits at a time.
- **Green between items.** A subagent finishes an item only when build and tests pass. On a failure the main agent finds, it sends the failure back to the subagent that owns the item (SendMessage), not to a new one.
- **No grammar decisions.** If a subagent reports that a move needs a new form, a changed reading, or a band the gates do not support, log it under [open decisions](#open-decisions) and skip the item. If the finding changes the plan beyond that item, [stop and alert](../meta/proposals.md#stop-and-alert) the user instead.
- **Commit at the end of each workstream**, per [commits](../meta/proposals.md#commits).
  - Commit once the workstream is green: build and tests pass, and every item in it is done or logged as skipped.
  - One commit per workstream: `sitting cohesion: <workstream id>, <short summary>`, then `[skip-cd]`, then a blank line and `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. The id is the phase number, plus the letter in Phase 2 and the band in Phase 4: `1`, `2a`–`2e`, `3`, `4 beginner`, `5`.
  - Stage only the files the workstream changed. Never amend or force-push.
  - Subagents never commit, and items inside a workstream get no commits of their own. Build and tests are green after every item, so the workstream's single commit can be reviewed as one unit.
  - A workstream whose items were all skipped makes no commit. A workstream that changed files but has a skipped item still commits, and the commit body names the skipped item and its [open decision](#open-decisions).

  | Phase | Workstreams | Commits |
  |-------|-------------|---------|
  | 0 | main agent, no edits | 0 |
  | 1 | in-place fixes | 1 |
  | 2 | 2a numbers, 2b turns, 2c stances, 2d pronouns, 2e joins | 5 |
  | 3 | renames and placement | 1 |
  | 4 | one per band with **generate** rows (one in all if five rows or fewer) | 1–3 |
  | 5 | bookkeeping (`AGENTS.md`, status, proposal move) | 1 |
  | **Total** | | **9–11** |

  The audit in Phase 5 edits nothing, so it adds no commit. Its follow-up list goes to the user.
- **One writer for `AGENTS.md`.** Subagents report the Owns-line changes they need. The main agent applies them all in Phase 5.

### Subagent brief
<a id="subagent-brief"></a>

The first prompt to each workstream subagent contains the brief below and the workstream's item list. Later prompts name one item.

1. Read once, at the start: this proposal's [findings](#findings-and-recommendations), [URLs](#urls), and [gate runs](#gate-runs), plus the rule sections in step 3. Read each page when its first item needs it, not up front.
2. The files the workstream may edit (its item list names them), plus the registry files above.
3. The rules to follow: [what one sitting holds](../meta/grammar-docs.md#one-sitting), [how to apply](../meta/learning-levels.md#how-to-apply) (keep `{#id}`s; rewrite `parent.md#id` everywhere listed there), [present the current language only](../meta/grammar-docs.md#present-the-current-language-only), [teach now; don't preview later](../meta/grammar-docs.md#teach-now-dont-preview-later), and `AGENTS.md`.
4. **Checkpoints.**
   - Move Practice items whose target H3 moved along with it.
   - A source sitting keeps its own items.
   - A destination sitting may hold items for a moved H3 only if its setting fits. Otherwise drop the items and mark the destination row **generate** in the allowlist.
   - Never write a new checkpoint inside a move item; Phase 4 does that.
5. **Gates.** Bands for B1, B8, and E6 are settled in [gate runs](#gate-runs); follow the matching G section, including its thinning steps. If you find a dependency the G section missed, report it instead of changing the band.
6. **Verify each item** before reporting it: `npm run cheat-sheet-blocks -- --write`, then `npm run build` and `npm test`. Check every moved example with `node scripts/parse.mjs` (several inputs in one call).
7. **Report each item** in a few lines:
   - H3s moved, with ids
   - links retargeted, as a file count
   - allowlist, review, and sidebar edits
   - the `AGENTS.md` Owns lines to change
   - build and test results
   - anything skipped, and why

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

### Phase 2: Moves, merges, and peels (5 workstreams, one subagent each, in order)

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

### Phase 3: Renames, redirects, and placement (1 subagent, workstream 3)

Renames come before placement, so the sidebar is edited once under its final names. One subagent does both, since both edit `reading-order.ts` and the redirect files.

- **3.1 Renames, in one pass.** Settle every row of the [URLs](#urls) table first, including numbers-applied's title, which Phase 2 fixed. Then write a small script in the scratchpad that applies the six [rename steps](#urls) to every row: `git mv`, retarget the old slug across the listed folders, add each `pageMoves` row, repoint any older `pageMoves` or `hash-redirect.ts` row that names an old file, and change each H1 `{#id}`. Run it once, review `git diff --stat`, then run one build and test. Hand fixes stay for what the script can't place.
- **3.2 Redirect check.** In `dist/amplify-redirects.json`: one 301 per old URL, no chains, all above `/<*>`; and every old `dist/grammar/<old>.html` is a stub. The subagent reports it; the main agent spot-checks two rows.
- **3.3 Placement and order.**
  - Walk the three sidebar groups in `reading-order.ts` and apply [order inside a band](../meta/learning-levels.md#order-inside-a-band) to every sitting this proposal touched. Run `npm run lint:forward-links` (part of the build).
  - Every new sitting gets a review item in its band's level review, and the removed sitting's item goes.
  - Fixed placements: `no-subject.md` right after clause.md (Beginner), before pronouns.md. `ranges.md` after `locative-relations.md` and `digitless-exponents.md`. `contrary-to.md` after evidentiality and `doing-it-for-a-sake.md`. `bars.md` after evidentiality and comparative-arity. `more-turn-words.md` before rhetorical-questions.

### Phase 4: Checkpoints (1 subagent per band, in order)

- The main agent lists every allowlist row now marked **generate**, grouped by band.
- One fresh subagent per band, Beginner then Intermediate then Advanced, writes that band's checkpoints in [path](../meta/learning-levels.md#cross-doc-path) order, following [drill-generation](../meta/drill-generation.md#execute) for several files ("one file at a time"). If the whole list is five rows or fewer, one subagent does them all, still in path order.
- Path order keeps the [read rules](../meta/drill-generation.md#execute) intact: when the subagent writes a sitting, it has read only that sitting and earlier ones. Running in sequence also means each checkpoint sees the `core` cells and settings the earlier ones wrote, so the subagent picks each setting itself and writes its own setting cell and status.
- Fresh subagents here, not ones from Phase 2: those have read later pages, which the read rules forbid.

### Phase 5: Bookkeeping and re-audit (main agent, plus 1 fresh subagent)

- Apply every reported `AGENTS.md` Owns-line change. Rows are added only for new topics, per [how to apply](../meta/learning-levels.md#how-to-apply).
- Run `npm run build`, `npm test`, `npm run grammar-check` (only if any parser source changed, which this proposal should not cause), and `npm run lint:cheat-sheet-print`.
- Spawn a fresh subagent with no context from earlier phases to re-audit against [what one sitting holds](../meta/grammar-docs.md#one-sitting), including tests 1 and 6. Scope: every sitting this proposal created, edited, or renamed (from `git diff --stat` since the Phase 0 baseline), plus any sitting that shares a choice set with one of them. The first audit already covered the rest. Leftover findings become a follow-up list for the user, not more edits.
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

## Open decisions

None at present. The main agent adds anything a subagent reports, and skips the affected item until the user decides.

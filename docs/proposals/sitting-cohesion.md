# Proposal: Making every sitting pass "what one sitting holds"

**Status:** PROPOSED.
**Related:** [what one sitting holds](../meta/grammar-docs.md#one-sitting) (the tests this proposal applies), [sitting length](../meta/drill-generation.md#sitting-length), [how to apply](../meta/learning-levels.md#how-to-apply), [gates](../meta/learning-levels.md#gates), [allowlist](../meta/drill-generation.md#allowlist), [site redirects](../meta/site-redirects.md).
**Design authority:** none. This proposal moves, merges, peels, and retitles existing sections. It adds no form and changes no reading. Where a fix would need a grammar decision, it says so under [open decisions](#open-decisions) and waits.

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
*Recommendation:* fix every cell so that its row label matches what `node scripts/parse.mjs` reads it as, checking each spelling one at a time. Then grep the grammar, cheat sheets, and Claritish for any other table copied from this one.

### B. Clear failures

**B1. [left-bound.md](../grammar/intermediate/left-bound.md) "Longer chains": three unrelated jobs (tests 2, 3, 4).**
- Keep *Complex chaining* here. The page passes as a single-H3 sitting.
- Move *How much: degree words on `/w/`* to [vague-amounts.md](../grammar/intermediate/vague-amounts.md). *Very*, *slightly*, *many*, and *few* are one choice set: degree against an unstated baseline. If vague-amounts then fails test 4, peel the H3 onto its own sitting instead ("Very and slightly").
- Peel *Leaving out who acts* onto a new sitting, `no-subject.md`, titled "Leaving out who acts". Run the gates: it may pass Beginner. If it does, put it in `beginner/` and place it after [clause.md](../grammar/beginner/clause.md).

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

**B6. Ranges: one English job, two intermediate homes (test 5).** See [ranges in detail](#ranges-in-detail) for the full analysis.
- Merge the two range H3s into one sitting, `ranges.md`, titled "Ranges": first the general range hooks, then number ranges.
- Place the merged sitting after [locative-relations.md](../grammar/intermediate/locative-relations.md) and [digitless-exponents.md](../grammar/intermediate/digitless-exponents.md) on the path.
- Fix numbers-applied's lead, which still promises clock times and dates (now on [digit-strings.md](../grammar/beginner/digit-strings.md)).

#### Ranges in detail
<a id="ranges-in-detail"></a>

**What each page teaches today.**

| | [ordered-ranges.md](../grammar/intermediate/ordered-ranges.md) `#ranges` | [numbers-applied.md](../grammar/intermediate/numbers-applied.md) `#ranges` | [open-ranges.md](../grammar/advanced/open-ranges.md) (Advanced) |
|---|---|---|---|
| Path position | Intermediate, early in the group | Intermediate, 11 sittings later | Advanced |
| Items | Any ordered line: people in a queue, days, chapters, *numbers* | Two numbers with digits, both the same kind (amounts, ranks, labels / times) | Numbers, with ±∞ or first / last place as one end |
| Both ends in | `A oel B` | `A al B` (the include hook, read as *through* because a number has nothing to include into) | `al` to ±∞ (*5 or more*) |
| One end out | none | `A ul B` excludes the end said second | `ul` to ±∞ (*more than 5*) |
| Both ends out / outside | `ual` / `uol` | `ual` / `uol`, tabled again for numbers | none |
| Soft ends | `oem` | `am`, `um` | `am` |
| Some member (-r) | `oer` / `uar` / `uor` | none | `ar` / `ur`, plus `uar` / `uor` again |
| Named band (-n) | `oen`, mentioned only | none | `an` (*the teens*) |
| `/w/` detail | before the hook | before the hook | none |

**What is wrong.**

1. **One English job, two homes.** For *3 through 5*, a learner has met `zragel oel zrazal` early in the Intermediate group and is taught `zragel al zrazal` 11 sittings later. The parser and the translation prompt read both as *three through five*. Neither page tells the learner which one to reach for: ordered-ranges mentions `al` / `ul` for numbers in one sentence, and numbers-applied never mentions `oel`.
2. **Same heading, same id.** Both H3s are titled *Ranges* with `{#ranges}`, so `/ordered-ranges#ranges` and `/numbers-applied#ranges` look like the same thing in links. open-ranges links to both.
3. **Rows taught twice.** `ual` and `uol` are tabled on both pages (numbers-applied says they "are the range hooks" and links to ordered-ranges). open-ranges re-tables `uar` / `uor`.
4. **An asymmetry nobody states.** Half-open ranges (`ul`) exist only between numbers. A learner who wants *from Monday up to but not including Friday* has no form, and neither page says so. This proposal does not add one; see open decision 1.
5. **Silent alias anchors.** numbers-applied's H3 carries `<a id="number-ranges">`, `<a id="numeric-ranges">`, and `<a id="from-to">` under the heading, against [one current heading, one current id](../meta/grammar-docs.md#one-current-heading).

**These are not in conflict.** Between numbers, `oel` and `al` say the same thing, and `ual` / `uol` mean the same on both pages. A second way to say the same thing is not a cost (`AGENTS.md`, evaluating ideas), so nothing has to be banned. The fix is about where things are taught and how a learner chooses between them.

**Recommended shape of `ranges.md` "Ranges"** (Intermediate):

1. **`### A through B (oel / ual / uol) {#ranges}`**: today's ordered-ranges H3, unchanged except that the one-sentence pointer to `al` / `ul` is cut (H3 2 now teaches them).
2. **`### Between two numbers (al / ul) {#number-ranges}`**: today's numbers-applied H3. It opens with the choice: *between two numbers with digits, `oel` works as it does anywhere, and `al` says the same thing. Use `al` when you also need its partner `ul` to leave out one end, which only numbers allow.* Then:
   - Drop the `ual` / `uol` rows from its table and point back to H3 1.
   - Drop the three silent anchors, retargeting any links to `#number-ranges`.
   - Keep its Compare-with line about `zaol`, `zal`, rank joins, and place paths. The place-path link is why the merged sitting must come after locative-relations.

**Knock-on changes:**
- [open-ranges.md](../grammar/advanced/open-ranges.md): retarget *range* to `/ranges#number-ranges` and the *range hooks* to `/ranges#ranges`. Cut the repeated `uar` / `uor` sentence down to a link, unless it carries the only example of those forms with numbers (it does: keep the example and drop the restatement).
- The `<!-- cheat-sheet: numbers -->` and `<!-- cheat-sheet: joins-hooks -->` markers move with their tables, so check that both cheat sheets still list every row once.
- Practice: ordered-ranges' checkpoint stays with the merged sitting. Move numbers-applied's range items only if they fit that setting; otherwise mark the row **generate** (Phase 7).
- The numbers-applied remainder (measures and percent) gets renamed and retitled under D3, and the old `/numbers-applied` URL redirects there. `/ordered-ranges` redirects to `/ranges`.

**B7. [ability.md](../grammar/intermediate/ability.md) and [want.md](../grammar/intermediate/want.md): DECISION and WANT split (tests 3, 5).**
- Move *Decision (revisability)* to want.md, before *Someone else's want, plan, or decision*, which already covers both. Retitle want.md "Want and decide" (a choice set of mind-states about an act).
- ability.md keeps *Try* and is retitled "Try" (renamed `try.md`; see [URLs](#urls)).
- Check that DECISION's examples do not depend on TRY, and that the path order still holds.

**B8. [sentence-linkers.md](../grammar/intermediate/sentence-linkers.md): writing rules and hinges mixed in with linkers (tests 3, 4).**
- Move *Writing and speech rhythm (periods)* to [speech-moves.md](../grammar/beginner/speech-moves.md) if it passes the Beginner gate (a period closes a body; a new `/y/` starts a turn). If it fails the gate, move it to [tone-marks.md](../grammar/intermediate/tone-marks.md) and retitle that page "Periods and tone marks".
- Peel *Result (so … that)* and *Time hinges on a noun* onto a new sitting, `more-hinges.md`, titled "Hinges on a degree or a noun". Both are hinge + stand-in uses beyond Beginner [dependents](../grammar/beginner/dependents.md).
- sentence-linkers keeps *Sentence linkers* and gains *Continue overview* (B3). Title: "Linking sentences".

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

**E6. [singability.md](../grammar/advanced/singability.md) *Thinking sounds*:** this is a form, not a singing rule. Run the gates.
- If it passes Beginner, move it to speech-moves beside *Interjections*. Watch speech-moves' H3 count, since B8 and C8 also add to it.
- If it doesn't, keep it and retitle singability "Singing, speech edges, and pauses".

**E7. [join-limits.md](../grammar/advanced/join-limits.md) *Named phrase -n*** echoes proper-names' *Titled phrases*. They are in different bands, so add one Compare-with line from join-limits to proper-names. Nothing moves.

**E8. [here-there.md](../grammar/beginner/here-there.md):** on review this passes. *Somewhere* and *here* are a choice set: two ways to name a place without naming it. Add a Compare-with line between the two H3s if there isn't one already.

### Summary of new and removed files

| New sitting | Band | From |
|-------------|------|------|
| `no-subject.md` "Leaving out who acts" | gate (Beginner or Intermediate) | B1 |
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
| `tone-marks.md` | `periods-and-tone-marks.md`, only if B8's fallback applies | Periods and tone marks | B8 |

If a final title comes out different from this table, the slug follows the final title: kebab-case, dropping punctuation and filler words.

**How to rename one page** (one subagent per row, in order; see Phase 5):

1. `git mv` the file within its band folder.
2. Retarget every reference to the old name, including the sidebar entry: grep the old slug across `docs/`, `src/`, `scripts/`, `data/`, `AGENTS.md`, and `TODO.md`. That covers links (`/old`, `old.md`, `old.md#id`), `reading-order.ts`, the allowlist **file** cell, level reviews, cheat-sheet links, `constructions.ts`, overlay CSV anchors, the lexicon `core` column, game `source`, and Claritish `<!-- Source -->`.
3. Add a `pageMoves` row to [`site-redirects.json`](../../scripts/site-redirects.json) (`/grammar/old.html` → `/grammar/new.html`), per [add a remap](../meta/site-redirects.md#add-a-remap-page-rename).
4. Prevent redirect chains: point any existing `pageMoves` row or [`hash-redirect.ts`](../grammar/.vitepress/lib/hash-redirect.ts) row that targets or names the old file at the new one.
5. Change the H1 `{#id}` to match the new title and retarget its links. Keep H3 ids.
6. Run `npm run build` and confirm that `dist/grammar/old.html` is a stub and `dist/amplify-redirects.json` lists the 301 above the `/<*>` rule.

**The user's manual step.** The Amplify console list only changes when someone pastes it. After the last phase, the user pastes `dist/amplify-redirects.json` into **Hosting → Rewrites and redirects** ([steps](../meta/site-redirects.md#add-a-remap-page-rename)). The stubs already redirect in the browser before then.

Moved H3s keep their `{#id}`, so links into them only need the page part rewritten.

## Phased plan

A single **main agent** runs the plan. It does no page editing itself. It spawns one **subagent** per work item, reviews the result, and keeps the tree green between items.

### Rules for the main agent

- **Sequential by default.** Peels, moves, and merges touch shared registry files: the sidebar in [`reading-order.ts`](../grammar/.vitepress/lib/reading-order.ts), the hash map in [`hash-redirect.ts`](../grammar/.vitepress/lib/hash-redirect.ts), [`site-redirects.json`](../../scripts/site-redirects.json), the [allowlist](../meta/drill-generation.md#allowlist), level reviews, cheat sheets, `AGENTS.md`, `src/parse/constructions.ts`, the overlay CSV, the lexicon `core` column, game `source`, and Claritish `<!-- Source -->`. Run such subagents one at a time.
- **Parallel only where marked.** A parallel batch lists the files each subagent may edit, and no two subagents in a batch share a file.
- **Gate between subagents.** After each subagent, read its diff and run `npm run build` and `npm test`. On failure, send the same subagent the failure (SendMessage) to fix. Don't start the next item until the tree is green.
- **No grammar decisions.** If a subagent reports that a move needs a new form, a changed reading, or a band the gates do not support, log it under [open decisions](#open-decisions) and skip the item.
- **Commit at the end of each phase.** This is an **exception** to the usual policy, under which agents never commit and the user does. It holds for this proposal only.
  - Commit once the phase's gate is green: build and tests pass, and every item in the phase is done or logged as skipped.
  - Use one commit per phase: `sitting cohesion: phase N, <short summary>`, then `[skip-cd]`, then a blank line and `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
  - Stage only the files the phase changed. Never amend or force-push.
  - Subagents never commit.
- **Pre-assign settings.** Before Phase 7, the main agent picks every new checkpoint's setting, so parallel checkpoint writers cannot collide on [setting uniqueness](../meta/drill-generation.md#settings).
- **One writer for `AGENTS.md`.** Subagents report the Owns-line changes they need. The main agent applies them all in Phase 8.

### Subagent brief (every item)

Each prompt contains:

1. The item text from this proposal, verbatim.
2. The files it may edit, plus any registry files named for that item.
3. The rules to follow: [what one sitting holds](../meta/grammar-docs.md#one-sitting), [how to apply](../meta/learning-levels.md#how-to-apply) (keep `{#id}`s; rewrite `parent.md#id` everywhere listed there), [present the current language only](../meta/grammar-docs.md#present-the-current-language-only), [teach now; don't preview later](../meta/grammar-docs.md#teach-now-dont-preview-later), and `AGENTS.md`.
4. **Checkpoints.**
   - Move Practice items whose target H3 moved along with it.
   - A source sitting keeps its own items.
   - A destination sitting may hold items for a moved H3 only if its setting fits. Otherwise drop the items and mark the destination row **generate** in the allowlist.
   - Never write a new checkpoint inside a move item; Phase 7 does that.
5. **Gates.** For any item marked "run the gates", report the result of each [gate](../meta/learning-levels.md#gates) before placing the file.
6. **Verify.** Run `npm run cheat-sheet-blocks -- --write`, then `npm run build` and `npm test`. Check every moved example with `node scripts/parse.mjs`.
7. **Report:**
   - H3s moved, with ids
   - links retargeted, as a file count
   - allowlist, review, and sidebar edits
   - the `AGENTS.md` Owns lines to change
   - build and test results
   - anything skipped, and why

### Phase 0: Baseline and re-check (main agent)

- Run `npm run build` and `npm test`, and record `npm run page-lines -- --sittings --headings`.
- Re-check every finding in this proposal against the current tree. Drop any that no longer hold.
- Ask the user open decision 1 (whether to teach a default between `oel` and `al` for numbers). It shapes 3.12's lead sentence, but not whether 3.12 runs.
- Commit nothing; Phase 0 changes no files.

### Phase 1: Content bug (1 subagent)

- **1.1** A1.

### Phase 2: Removals and folds, no new homes (parallel batch)

Every item in this batch stays within its own page(s) plus link retargets.

- **2.1** B5 (collectives.md)
- **2.2** D5 (roles.md)
- **2.3** E1 (pronouns.md)
- **2.4** E2: joins.md, word-endings.md, stacked-markers.md, together with E3 (same file)
- **2.5** E5 (extra-noun-hooks.md)
- **2.6** E7 and E8 (join-limits.md, here-there.md)
- **2.7** numbers-applied lead fix from B6 (lead only), plus dropping its three silent alias anchors (retarget links to `#ranges` for now; 3.12 renames the id)

Main agent: one build and test run after the batch, then send any fixes back to the subagent that owns the failing file. Then commit the phase.

### Phase 3: Moves into existing sittings (sequential, 1 subagent each)

Work outward from the clusters that other items depend on.

- **3.1** Numbers cluster: B3 (number-word fold), D3, and C5's *Group separator*. Files: proper-names, number-markers, number-roles, numbers-applied, digitless-exponents.
- **3.2** C5 *How big?* → fill-ask-roles, with its retitle.
- **3.3** B3 *Continue overview* → sentence-linkers.
- **3.4** C8 dependents *Continue* → speech-moves, and B8 *Periods* (gate first), then E6 (gate first). Watch speech-moves' H3 count.
- **3.5** B7 Decision → want.md; retitle want.md and ability.md.
- **3.6** C4 and D2: Commands to be ADJ and Questions that sound like another act → speech-acts; then C7's retitle.
- **3.7** B2 (part 1): *Each other* and *Addressing several people* → collectives.
- **3.8** B1 (part 1): degree words → vague-amounts, or the fallback peel.
- **3.9** C6 hooks re-cut (discourse-hooks ↔ ending-grids).
- **3.10** D4 bars merge into sake-bars, including the channel bar from notional-standing.
- **3.11** D1 merge join-across-roles → vp-clause-forms, with its redirect row.
- **3.12** B6 ranges: merge numbers-applied's *Ranges* into ordered-ranges as the second H3 `{#number-ranges}`, following [ranges in detail](#ranges-in-detail). This includes the opening choice sentence, dropping the duplicate `ual` / `uol` rows, retargeting open-ranges, and both cheat-sheet markers. Placement on the path waits for Phase 6, and the file rename for Phase 5.

### Phase 4: Peels onto new sittings (sequential, 1 subagent each)

Each peel uses `npm run peel-headings` (dry run first, then `--write`), splits Practice by hand, and leaves the new allowlist row as **generate**.

- **4.1** B1 (part 2): `no-subject.md` (gate first).
- **4.2** B2 (part 2): `resume-sense.md`.
- **4.3** B4: `contrary-to.md`, then the hand move from prescription; then C3's retitle.
- **4.4** B8: `more-hinges.md`.
- **4.5** C1: `list-structure.md`, then `set-joins.md`.
- **4.6** C2: `quote-contents.md`, then retitle span-mention.
- **4.7** E4: `nested-dependents.md`, or the retitle fallback.

### Phase 5: Renames and redirects (sequential, 1 subagent per row)

- One subagent per renamed row in the [URLs](#urls) table, following its six steps.
- Rows whose new title is still unsettled (numbers-applied's title choice, `tone-marks.md`'s conditional) wait until Phases 3 and 4 have fixed the title.
- Rename before Phase 6 places sittings, so the sidebar is edited once under its final names.
- The main agent checks `dist/amplify-redirects.json` after the last rename: one 301 per old URL, no chains, all above `/<*>`.

### Phase 6: Placement and order (1 subagent)

- Walk the three sidebar groups in `reading-order.ts` and apply [order inside a band](../meta/learning-levels.md#order-inside-a-band) to every sitting this proposal touched. Run `npm run lint:forward-links` (part of the build).
- Every new sitting gets a review item in its band's level review, and the removed sitting's item goes.
- Fixed placements: `ranges.md` after `locative-relations.md` and `digitless-exponents.md`. `contrary-to.md` after evidentiality and `doing-it-for-a-sake.md`. `bars.md` after evidentiality and comparative-arity. `more-turn-words.md` before rhetorical-questions.

### Phase 7: Checkpoints (parallel, 1 subagent per sitting)

- The main agent lists every allowlist row now marked **generate** and assigns each one a setting.
- One subagent per row then writes that sitting's checkpoint, following [drill-generation](../meta/drill-generation.md#execute) ("one file per agent"). Each subagent edits only its own grammar page. The main agent writes the setting cells and flips the rows to **exists**.

### Phase 8: Bookkeeping and re-audit (main agent, plus 1 fresh subagent)

- Apply every reported `AGENTS.md` Owns-line change. Rows are added only for new topics, per [how to apply](../meta/learning-levels.md#how-to-apply).
- Run `npm run build`, `npm test`, `npm run grammar-check` (only if any parser source changed, which this proposal should not cause), and `npm run lint:cheat-sheet-print`.
- Spawn a fresh subagent with no context from earlier phases to re-run the full audit against [what one sitting holds](../meta/grammar-docs.md#one-sitting), including tests 1 and 6 for every touched sitting. Leftover findings become a follow-up list for the user, not more edits.
- Ask the user to paste `dist/amplify-redirects.json` into the Amplify console ([URLs](#urls)): every renamed page and `join-across-roles.html` needs it for real 301s.
- List pages this proposal did not touch whose filename no longer names their title (for example `feelings-permission.md` "Feelings"), as a follow-up for the user.
- Commit the phase.
- Set this proposal's status, and move it to `partially-implemented/` or delete it per [proposals](../meta/proposals.md).

## Open decisions

These wait for the user. The main agent adds anything a subagent reports.

1. **Ranges, default for numbers** (does not block 3.12). Between two numbers, `oel` and `al` mean the same. The recommendation is to teach both and say: *use `al` when you also need `ul` to leave out one end*. Alternatives:
   - Make `al` the only taught form for numbers, so `oel` between numbers is never shown (but stays grammatical).
   - Make `oel` the default everywhere, and teach `al` / `ul` only for half-open ranges.
2. **Half-open ranges on non-number lines** ([ranges in detail](#ranges-in-detail), problem 4). *From Monday up to but not including Friday* has no form. This proposal does not add one. If it is a gap, log it with the `find-english.mjs` phrases tried.
3. **Gate results:** B1 `no-subject.md`, B8 *Periods*, and E6 *Thinking sounds* can each land in Beginner. The main agent reports each result, and asks only if the gates are unclear.

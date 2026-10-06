# Proposal: new standards for checkpoints and word banks

**Status:** PROPOSED (not current policy). Policy today: [translation-exercises.md](../meta/translation-exercises.md) (placement, principles, setting, template) and [drill-generation.md](../meta/drill-generation.md) (allowlist, settings inventory, recycle, review).  
**Related:** [learning-levels.md](../meta/learning-levels.md) (stage path), [claritish-style.md](../meta/claritish-style.md#examples-practice) (Claritish practice), `vocab-flashcards.md` (packs ordered by what a learner has met).  
**Design authority:** none until absorbed into the two meta pages.

## Keep

- One checkpoint at the end of each page stage, never one after every H3 ([placement](../meta/translation-exercises.md#placement)).
- Recycle and leak rules: no form the learner has not been taught, no same-slot sibling. The build enforces these.
- Both directions, and the two directions never test the same proposition ([principle 3](../meta/translation-exercises.md#principles)).
- Spoiler answers with a morph line, house cast, `SELF` for the learner as speaker.

## Problems with the current standard

1. **Translation is the only item type.** A translation item tests vocabulary recall and the stage's decision together. A learner who forgets `vezevul` fails an item about role letters. [Principle 8](../meta/translation-exercises.md#principles) says *test the decision, not the dictionary*, but the format cannot isolate the decision.
2. **One answer per production item.** Agazan allows legal reorderings ([principle 3](../meta/translation-exercises.md#principles) uses them as parsing packaging). A learner who writes a legal variant sees a different spoiler and concludes they were wrong.
3. **Vocabulary is not spaced.** Settings are [globally unique](../meta/translation-exercises.md#checkpoint-setting), so each checkpoint brings 10 to 15 new roots that never return. The [clause.md Beginner bank](../grammar/clause.md#beginner-translation-practice) has 16 rows for 10 items. Nothing schedules a root to come back, so checkpoint vocabulary is met once and lost.
4. **The bank table is hard to read.** The **Agazan** column mixes citations (`amol`) with role-marked forms (`vehahel`, `welavam`, `thevegam`), and **Same root as** exists to explain the mix. **Cue** is filled on about half the rows, which reads as unfinished.
5. **Settings are mostly a label.** The bank checkpoint has nothing bank-like except *money*, and the items do not climb. The tension rule costs authors effort with little visible to the learner.
6. **No cross-page review.** Level-end review is "optional later" ([what belongs where](../meta/translation-exercises.md#what-belongs-where)), so nothing in the site revisits a decision once its page is done.

## Proposed standard

### 1. Mixed item types

Translation stays the backbone, about two thirds of a checkpoint. Add 2 to 3 items per checkpoint from these types, each aimed straight at the stage's decision:

| Type | Prompt | Answer |
|------|--------|--------|
| **Pick one** | English sentence and two Agazan forms that differ only in this stage's decision | The right form, and one line on why |
| **Fix it** | An Agazan sentence with one error an English speaker would make | The corrected sentence, and the error named |
| **What changes** | Two Agazan sentences that differ in one morph | The difference in meaning, in plain English |

Example of **Pick one**, from clause.md Beginner: *Ahaben sees Azawan.* `zahaben dazawan vahahal.` or `zazawan dahaben vahahal.`

Rules:

- Both forms in **Pick one** and the corrected form in **Fix it** are legal and parse. The wrong form in **Fix it** must be a real learner error, not a random spelling. When it is a spelling the parser rejects, it must be one [unassigned-reserved.md](../meta/unassigned-reserved.md) does not list as having another reading.
- **What changes** uses only taught morphs on both sides.
- These items still follow the setting and recycle rules.
- The build accepts the new item headings under `### Translation practice` (rename the heading to `### Practice` if the mix makes the old name wrong).

### 2. Accepted alternatives

Each English → Agazan spoiler adds an **Also correct:** line when a legal variant exists that a learner is likely to write (reordering, omitted recoverable word, resume form). The build parses each listed variant and checks it has the same morph reading as the main answer.

Later, optionally: a client-side answer box that runs the parser on the learner's input and compares readings. Not required by this standard.

### 3. A core learner vocabulary with spaced reuse

Add an ordered **core vocabulary** list that assigns each learner root the checkpoint where it is first met. It lives in the `core` column of `lexicon-published.csv` and `lexicon-compounds.csv` ([core vocabulary column](../meta/lexicon.md#core-vocabulary-column)).

| Rule | Detail |
|------|--------|
| **New per checkpoint** | At most 5 new content roots (house names excluded) |
| **Review per checkpoint** | At least 3 roots from earlier checkpoints, preferring ones not used for the longest stretch of the path |
| **Source** | New roots come from the core list in order; a setting may pull a core root forward but then owns its introduction |
| **Check** | The build counts new vs review roots per checkpoint against the path order |

Settings stay unique as a theme, but stop forcing a fresh vocabulary each time. The same ordered list can feed the packs in `vocab-flashcards.md`.

### 4. A simpler bank table

```md
**New words:**

| English | Agazan | Cue |
|---------|--------|-----|
| *see* | `vahahal` | 👁️ from *eye* |

**Review:**

| English | Agazan |
|---------|--------|
| *money* | `amol` |
```

- Two groups, **New words** and **Review**. Review rows need no cue.
- Drop **Same root as**. When the Agazan cell is not the citation of the English, the cue names the citation sense (*from eye*).
- Every **New words** row has a cue. If a root has no useful cue, the cue gives the emoji alone.
- The build check that every row is used, and every content root used has a row, stays as is across both groups.

### 5. Settings that show

Keep one setting per checkpoint. Require at least half the items in each direction to use a root or situation that belongs to the setting. Drop the tension-climb requirement and the house-scene love triangle as **must**; keep them as optional flavor.

### 6. Required level reviews

One review page at the end of each level (Beginner, Intermediate, Advanced), outside the stage pages:

- 12 to 20 items mixing every productive page in that level, mostly **Pick one** and short translation.
- Each item links back to the section it tests, so a miss sends the learner to the rule.
- Vocabulary is review only: no new roots.

## Claritish

Out of scope. Claritish has almost no vocabulary to space, so it keeps its own practice format unchanged ([claritish-style.md](../meta/claritish-style.md#examples-practice)).

## Fixes needed regardless

- **Anchor conflict:** the [template](../meta/translation-exercises.md#template) pins `{#beginner-translation-practice}`, which the grammar pages use. [drill-generation.md step 5](../meta/drill-generation.md#execute) still lists `<a id="translation-practice">` anchors. Remove the step 5 anchor table.
- **Duplicate settings rows:** the [settings](../meta/drill-generation.md#settings) table lists `intention.md` Beginner twice (*a climbing wall*, *a chess club*) and Intermediate twice (*a locked vault*, *a board meeting*). One of each pair likely belonged to a page merged into intention.md. Confirm which checkpoint each names and drop the stale rows.

## Rollout

Each numbered step is one session. Scale: 53 checkpoints across 24 pages, about 100 lines each.

1. **Fixes.** Apply the two fixes above. Also remove the 30 legacy `<a id="translation-practice…">` anchors still on grammar pages (nothing in the repo links them; check [site-redirects.md](../meta/site-redirects.md) first).
2. **Done.** **Core vocabulary list.** Settle the cap and the storage open questions first. Build the ordered list from the existing banks: first checkpoint in path order where each root appears. Output a report of checkpoints over the new-root cap. Do not trim checkpoints here; trimming is part of step 7. Result: the cap is 5 for every band; the list is the `core` column, seeded by `npm run core-vocabulary -- --write`. It has 220 core roots across 53 checkpoints. 12 checkpoints are over the cap, with 46 roots to move in step 7. The worst are `sakes.md` Beginner (14), `clause.md` Beginner (11), and `sakes.md` Intermediate, `roles.md` Intermediate and `comparatives.md` Advanced (10 each). Rerun `npm run core-vocabulary` for the current report.
3. **Policy and gating.** Update [translation-exercises.md](../meta/translation-exercises.md) and [drill-generation.md](../meta/drill-generation.md) with items 1 to 5. Decide how a converted checkpoint is marked (for example the `### Practice` heading), so the new checks run only on converted checkpoints and the old ones keep passing until replaced.
4. **Item-type and alternative checks.** Build checks for the **Pick one**, **Fix it** and **What changes** headings and their rules, and **Also correct:** parsing that compares morph readings, not strings. Update the drill coverage and spoiler padding scripts for the new item types.
5. **Bank and vocabulary checks.** Build checks for the **New words** / **Review** groups (cue on every new row) and the new vs review root counts against the core list.
6. **Spacing helper.** A script that, for a given checkpoint, lists the core roots it may introduce and the review roots unused for the longest stretch of the path.
7. **Replace checkpoints**, one page per session (2 to 3 checkpoints), in path order through the existing [execute](../meta/drill-generation.md#execute) procedure, trimming to the cap as each page is done. Pages with one checkpoint (`numeric-derivation.md`, `join-across-roles.md`, `numbers-applied.md`) may share a session. Order is strict: each checkpoint's review set depends on the ones before it. About 20 to 24 sessions.
8. **Level reviews**, one level per session (Beginner, Intermediate, Advanced), each once its pages carry the new checkpoints.

## Open questions

- Should the answer box (item 2) be part of this standard or its own proposal?

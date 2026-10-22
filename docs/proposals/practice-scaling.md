# Proposal: Scale checkpoint size with the band, and check every taught section

**Status:** PROPOSED. Editor policy and lint only; no grammar change.  
**Related:** [item counts](../meta/drill-generation.md#execute), [drill principles](../meta/translation-exercises.md#principles), [decision items](../meta/translation-exercises.md#item-types), [level reviews](../meta/translation-exercises.md#level-reviews).  
**Code:** [`src/lint/practice-items.ts`](../../src/lint/practice-items.ts) (`TRANSLATION_ITEMS`, `DECISION_ITEMS`), [`src/lint/drill-coverage.ts`](../../src/lint/drill-coverage.ts) (`drillCoverage`), [`scripts/lint-agebon-docs.ts`](../../scripts/lint-agebon-docs.ts) (`reportDrillCoverage`).

## Problem

Each band on a page ends in one checkpoint. The lint caps every checkpoint at the same size: 3–6 items per translation direction and 2–3 decision items. It does not matter how much the band teaches.

Bands differ a lot. Across the grammar pages, a band teaches between 1 and 17 sections (`###` headings other than Practice), with a median of 5. The largest are knowing.md Intermediate (17), questions.md and pronouns.md Intermediate (15 each), and sakes, numbers and hooks Intermediate (12 each). A two-section band and a seventeen-section band get the same six items. In large bands, some sections are never practiced, and the cap leaves no room to add an item for them: a new item has to replace one that practices something else.

The coverage check does not catch this. It groups constructions into families, and every construction the parser produces (`sentence.*`, `token.*`, `word.*`, `reading.*`, `resolve.*`) forms one family per home section. Then `drillCoverage` skips every family of that kind (`if (family.parser || …) continue`). Only data families such as overlay rows, values and spans are checked. Most grammar is parser-built, so most sections can go unpracticed and the lint still passes.

This happened when the quiz was added to questions.md: the checkpoint was full, so the quiz got no item. With parser families counted, the lint reports the following today:

- 194 families practiced, and **11 families not practiced**:
  - speech-moves.md `#describe-turn-word`
  - questions.md `#quiz`
  - spans.md `#mention`
  - joins.md `#negation-u` (Beginner) and `#kind-reference`
  - predication.md `#scope-relative`
  - join-across-roles.md `#vp-clause-forms` and `#stance-join-before-barl`
  - dependents.md `#stand-in`
  - numbers.md `#digitless`
  - numbers-applied.md `#time`
- 1 band with taught sections and **no checkpoint at all**: dependents.md Advanced.

The gap is small enough to fix in one pass.

## Proposal

### 1. Scale the counts with the band

Let *S* be the number of `###` sections the band teaches, not counting Practice.

| Band kind | Per translation direction | Decision items |
|-----------|---------------------------|----------------|
| Beginner or Intermediate | 3 to **max(6, ⌈S / 2⌉ + 2)**, at most 10 | 2 to **max(3, ⌈S / 4⌉)**, at most 5 |
| Advanced, or a thin generate row | 3 to **max(4, ⌈S / 2⌉ + 1)**, at most 8 | 2 to **max(2, ⌈S / 4⌉)**, at most 4 |

This keeps small and median bands exactly where they are today (up to 6 and 3). A large band gets room for one item per section across both directions combined. For example, questions.md Intermediate (S = 15) allows up to 10 per direction and 4 decision items; knowing.md Intermediate (S = 17) allows 10 and 5.

The minimums stay where they are. The upper limits are room, not a target. Principle 6, small sets, still applies: write only as many items as the band's sections need.

### 2. Split a band past the ceiling

Above about 20 sections, even 10 items per direction cannot reach every section, and a 25-item checkpoint is long for one sitting. Such a band takes a **split** row in the [allowlist](../meta/drill-generation.md), which already allows a second checkpoint. No band is that large today; knowing.md Intermediate, at 17, is the closest.

### 3. Count parser families in drill coverage

Remove `family.parser ||` from the skip in `drillCoverage`. Every taught section then needs at least one practice item, in either direction, that uses one of its constructions. The **skip** rows in the allowlist still exempt a whole band. Add a per-section exemption only if a section turns out to have nothing a learner can be drilled on; none of the 11 gaps above looks like that.

## Changes

- **[`src/lint/practice-items.ts`](../../src/lint/practice-items.ts):**
  - Replace the fixed `TRANSLATION_ITEMS` / `DECISION_ITEMS` with a function of the band kind and *S*.
  - `practiceItems` already has the page markdown, so it can count the band's `###` headings above the checkpoint.
  - The error message names *S*, so the limit is easy to understand: `11 Agebon → English item(s); this band teaches 15 sections, use 3–10`.
  - Level reviews keep their own rule.
- **[`src/lint/drill-coverage.ts`](../../src/lint/drill-coverage.ts):** drop the parser skip, and update [`drill-coverage.test.ts`](../../src/lint/drill-coverage.test.ts) to match.
- **[drill-generation.md](../meta/drill-generation.md):** the count table becomes the formula, with a line on splitting past the ceiling.
- **[translation-exercises.md](../meta/translation-exercises.md):**
  - Principle 6: counts scale with the band.
  - Principle 13: "2–3" becomes a reference to the table.
  - State that every taught section is practiced at least once.
- **Fill the gaps** in the same change:
  - one item for each of the 11 families above, following [drill generation](../meta/drill-generation.md);
  - a checkpoint for dependents.md Advanced;
  - bring back the `yar` item in the speech-moves Intermediate checkpoint, which the stacked-acts change replaced.

## Open questions

- **What counts as a section?** Counting every `###` heading treats a short "Compare with" section the same as a large table. Counting only sections that home at least one construction would track teaching load more closely. That count is available in the coverage lint but not in `practiceItems`, which reads one page at a time.
- **Should a section that only adds data rows count fully?** An example is a vocabulary table on an overlay page. Its overlay family is already checked, so counting it again for size may make the limit too generous.

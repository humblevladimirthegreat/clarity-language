# Proposal: Scale checkpoint size with the band, and check every taught section

**Status:** PARTIALLY IMPLEMENTED. Phase 1 is built: item caps scale with band kind and *S*, parser families count in drill coverage, editor policy is in [drill-generation.md](../meta/drill-generation.md) and [translation-exercises.md](../meta/translation-exercises.md), the 11 named families and dependents.md Advanced are practiced, the `yar` item is restored, and Joins Beginner recap headings are merged. Phase 2 splits knowing.md: MAY and the channel system stay on the parent; notional / standing material is the Intermediate-only sibling [notional-standing.md](../grammar/notional-standing.md) (After S 10 + 7). Phase 3 splits questions.md and pronouns.md: asking and answering stay on [questions.md](../grammar/questions.md); fill-ask roles are the Intermediate-only sibling [fill-ask-roles.md](../grammar/fill-ask-roles.md) (After S 7 + 8). Pointing stays on [pronouns.md](../grammar/pronouns.md); the discourse topic is the Intermediate-only sibling [topic.md](../grammar/topic.md) (After S 6 + 7, two four-line H3s merged). Phase 4 splits hooks.md: in-clause hooks, extra noun, *whose*, ranges, and Advanced stay on [hooks.md](../grammar/hooks.md); stacked discourse, place indefinites, here and there, hook resume, parallel chains, and discourse placements are the Intermediate-only sibling [discourse-hooks.md](../grammar/discourse-hooks.md) (After S 6 + 6). Remaining page splits and the ceiling lint are later phases.  
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

Those 11 families, and the missing checkpoint, are a small fill. The large bands are a page-structure problem: even a scaled checkpoint is a long sitting, and a band past 10 sections should not stay on one page.

## Rules

These hold for every phase. Phase 1 writes them into the editor docs; the last phase turns on the ceiling lint. Each phase is one session.

### What *S* is

*S* is the number of `###` headings in the band, not counting Practice.

Count every such heading, including a short recap, a Compare-with, and a section that only adds overlay or vocabulary rows. Do not count only sections that home a construction, and do not discount data-row sections.

- **Sitting length is headings.** A new `###` is a new bite for the learner, whether it is a large table or a recap. The ceiling is a sitting-length rule, not a parser-load rule. Coverage already tracks construction families on its own; *S* should not double as that metric.
- **`practiceItems` reads one page.** It can count headings. Wiring construction homes into it would couple two lints for a number the formula only uses as room.
- **The cap is room, not a target.** Principle 6 still applies: write only as many items as the band needs. An overlay table whose family is already practiced does not need a second item just because it counted in *S*. Coverage requires each family once; extra headings do not require extra items.
- **Recap headings get merged, not special-cased.** A Compare-with beat belongs inside the section it contrasts ([compare with](../meta/grammar-docs.md#compare-with)), not as its own H3. Phase 1 folds the two recap H3s that currently push joins Beginner over 10.

A section with nothing a learner can be drilled on can take a per-section coverage exemption. None of the 11 gaps above looks like that. That exemption does not remove the heading from *S*.

### Item counts

| Band kind | Per translation direction | Decision items |
|-----------|---------------------------|----------------|
| Beginner or Intermediate | 3 to **max(6, ⌈S / 2⌉ + 2)**, at most 10 | 2 to **max(3, ⌈S / 4⌉)**, at most 5 |
| Advanced, or a thin generate row | 3 to **max(4, ⌈S / 2⌉ + 1)**, at most 8 | 2 to **max(2, ⌈S / 4⌉)**, at most 4 |

Small and median bands stay where they are today (up to 6 and 3). Until the page splits land, a 15-section band is allowed 10 per direction and 4 decision items, which is enough to add the named gaps. After the splits, no band is past 10, so the formula's cap and the page ceiling are the same number. Level reviews keep their own rule.

### Every taught section is practiced

Every family, parser-built or data, needs at least one practice item in that page's same-band checkpoint, in either direction. Allowlist **skip** rows still exempt a whole band.

### Ceiling of 10: split the page

A band past **10** taught sections is too long for one sitting. Split that **page** into two sibling grammar pages, each a full subsystem with its own stages and one checkpoint.

10 is the split trigger, not a target to fill. A band at 9 is fine. Do not split Beginner / Intermediate / Advanced into separate files ([learning-levels](../meta/learning-levels.md#how-to-apply)). Do not peel two or three leftover H3s onto a stub page. Do not default to an allowlist **split** row (a second checkpoint on the same page); keep that only when one page must stay together.

Existing models: [numbers.md](../grammar/numbers.md) / [numbers-applied.md](../grammar/numbers-applied.md) / [numeric-derivation.md](../grammar/numeric-derivation.md), and [joins.md](../grammar/joins.md) / [join-across-roles.md](../grammar/join-across-roles.md). A new sibling may start at Intermediate when the Beginner on-ramp stays on the parent ([empty stages](../meta/grammar-docs.md#empty-stages)).

Do not add an H3 to a band already at 10 (roles.md Intermediate) without splitting first.

### When to break or merge a heading

*S* and line count track different things, so they will not move together. A twelve-line *when?* is one new English job; a two-hundred-line overlay inventory is still one job if every row is the rest of a map the learner already uses ([later-stage shape](../meta/grammar-docs.md#later-stage-shape): **new English job** vs **finish the series**). Do not unpack a paradigm into one H3 per cell just to even out lines, and do not keep two English jobs under one heading just to hold *S* down.

| Do | Don't |
|----|--------|
| Promote an H4 (or an unmarked stretch) to H3 when it is a **new English job** the learner can misuse on its own (*how many?* vs an unspecified amount; permission vs consent; infinity vs *a gazillion*) | Promote *number as verb* by slot, polar endings, or hooked-join which-hook: those are one job's table |
| Merge an H3 that is not a new job (a four-line topic edge) into a neighbor | Keep a four-line H3 so *S* looks like coverage |
| Do the promote or merge in the **same session** as the page split that already touches the file | Add H3s to a band at 10 without a sibling page |

Fat headings that stay one H3 (one job, long table): [Whose view](../grammar/knowing.md#holder) (201), [Number as verb](../grammar/numbers.md#number-as-verb-by-marker) (109), [Polar stance: fuller inventory](../grammar/questions.md) (114), [Hooked joins](../grammar/hooks.md#hooked-joins) (171), [Emotion compose](../grammar/sakes.md#emotion-compose) (90). Breaking Holder would put Knowing Intermediate back over 10 after phase 2.

## Phased plan

One session per phase. A session can hold **one hard split** (interleaved cut, or a 30%+ move with H3 promotions) **or two clean contiguous splits** that share a pattern. Do not pair two hard splits, and do not add a second parent of 1,400+ lines to a hard split. Each split still needs a sibling file, a sidebar slot, an `AGENTS.md` row, retargeted construction homes, cheat-sheet links, a `pageMoves` row if a public path changes, and a new checkpoint. The ceiling is per band, so a parent stays long when Beginner and Advanced remain.

Line counts below are taught `###` body (not Practice). The 27 Agebon Lessons pages are **21,367** lines (median **779**). Existing siblings for scale: [join-across-roles.md](../grammar/join-across-roles.md) 529, [numbers-applied.md](../grammar/numbers-applied.md) 686, [numeric-derivation.md](../grammar/numeric-derivation.md) 385. A new Intermediate-only page also needs a lead and a checkpoint (~170 lines). After S is headings as they stand today, before promotions in that session. Sidebar names are working titles.

**Leave, not a phase:** [roles.md](../grammar/roles.md) Intermediate is already 10 (826-line page; viewpoint cluster 156 lines, 19%). Split **Viewpoint and landmark** if it grows. Clause Beginner and comparatives Intermediate are 9.

### Phase 1 — Scale, cover, fill

Lint, the named gaps, and the joins recap merge. No new grammar pages. After this phase, every current family is practiced, a full checkpoint has room to add an item, and Joins Beginner is at most 10.

- **[`src/lint/practice-items.ts`](../../src/lint/practice-items.ts):** replace the fixed `TRANSLATION_ITEMS` / `DECISION_ITEMS` with a function of the band kind and *S*. Count the band's `###` headings above the checkpoint. The error message names *S*: `11 Agebon → English item(s); this band teaches 15 sections, use 3–10`.
- **[`src/lint/drill-coverage.ts`](../../src/lint/drill-coverage.ts):** drop `family.parser ||` from the skip; update [`drill-coverage.test.ts`](../../src/lint/drill-coverage.test.ts).
- **[drill-generation.md](../meta/drill-generation.md):** the count table becomes the formula. State the ceiling: a band past 10 sections splits into a sibling page, not an allowlist **split** row. State what *S* counts.
- **[translation-exercises.md](../meta/translation-exercises.md):** Principle 6, counts scale with the band. Principle 13, "2–3" becomes a reference to the table. Every taught section is practiced at least once.
- **Fill:**
  - one item for each of the 11 families above, following [drill generation](../meta/drill-generation.md);
  - a checkpoint for dependents.md Advanced;
  - the `yar` item in the speech-moves Intermediate checkpoint, which the stacked-acts change replaced.
- **[joins.md](../grammar/joins.md) Beginner:** merge Vowels and endings (recap) and Beginner forms into **How many items**, or into each other (9 or 10). Join-across-roles already split off.

The formula can land first (current 3–6 still pass). Parser coverage fails until the 11 items and the dependents checkpoint exist, so those fills land in the same change as that lint, or the lint lands last. Drill generation stays one grammar file per agent; batch the fills if needed, then turn the skip off. The joins merge is two headings and can ride along.

### Phase 2 — Split knowing

| Parent | S | Move | Sibling | After S |
|--------|---|------|---------|---------|
| [knowing.md](../grammar/knowing.md) 1,553 (7.3%) | 17 | 290 (19%) | Notional and standing | 10 + 7 |

Keep MAY (Beginner) and the channel system (evidentiality, strength, second-hand, source, forecasts, evidence clause, live vs memory, carry-forward, deduction, holder). Advanced dated channel, universality, and mood on one adjective stay. Move to **Notional and standing** (starts Intermediate): mirative, residue / former, already-still-not-yet, notional + hold endings, channels as bars, channels after `uem`.

Alone: the moved sections are interleaved with channels, so this is the fiddliest retarget. Holder is 201 lines and stays as **one** H3 (one English job, long host inventory). Breaking it would put this band back over 10. Matches the cheat sheet's "How you know" vs "Could be, imagined, surprising, still in effect," and the Claritish pair How sure are you? / How do you know?

### Phase 3 — Split questions and pronouns

Two clean contiguous cuts, same pattern (on-ramp stays, Intermediate inventory becomes its own page). Combined move 296 lines.

| Parent | S | Move | Sibling | After S |
|--------|---|------|---------|---------|
| [questions.md](../grammar/questions.md) 1,011 (4.7%) | 15 | 145 (14%) | Fill-ask roles | 7 + 8 |
| [pronouns.md](../grammar/pronouns.md) 921 (4.3%) | 15 | 151 (16%) | Topic | 6 + 9 |

**Questions:** keep asking and answering, including Beginner fill-ask. Move arity, *what kind / when / where / whose / how / why*, and a blank inside a dependent.

**Pronouns:** keep pointing (resume, role pointers, specials, tags, reciprocal). Move setting a topic through asking about the topic. Merge the four-line H3s (quotes and asides, me or you as the topic) into a neighbor.

### Phase 4 — Split hooks

| Parent | S | Move | Sibling | After S |
|--------|---|------|---------|---------|
| [hooks.md](../grammar/hooks.md) 1,588 (7.4%) | 12 | 234 (15%) | Discourse hooks | 6 + 6 |

Keep in-clause hooks, extra noun, *whose*, ranges, and Advanced compounds / prefixes / hooked joins. Discourse glue and *since* stay on Beginner so the sibling is not a two-section stub. Move stacked discourse, somewhere / nowhere / everywhere, here and there, hook resume, parallel chains, discourse placements.

Alone: largest parent. The cut is contiguous, but editing 1,588 lines plus a new page fills a session. After the split this is still the longest lesson page because Advanced stays. Hooked joins (171) stays one H3.

### Phase 5 — Split digitless and exponents

| Parent | S | Move | Sibling | After S |
|--------|---|------|---------|---------|
| [numbers.md](../grammar/numbers.md) 1,413 (6.6%) | 12 | 469 (33%) | Digitless and exponents | 8 + 4 (then promote) |

Keep counts, markers, endings, writing, and number-as-verb on **Numbers**. Fold Starter examples and Style into Writing while there. Move Digitless, Exponents, Bare OoM, Group separator, and Advanced Digitless exponents.

Alone: largest move, and 283 of it is one Advanced H3 that already has four English jobs as H4s. Promote in this session:

- Intermediate: *How many?* and *How big?* out of Digitless.
- Advanced: Special values, Zero × exponent, Hyperbole, Number as stance out of Digitless exponents.

After promotions, sibling Intermediate is about 6, Advanced about 4. Numbers Intermediate is 8 (or 6 if Writing absorbs the two recap tables). Numbers Advanced keeps From the end, Stacked markers, Ambient magnitude.

### Phase 6 — Split sakes, then lint the ceiling

| Parent | S | Move | Sibling | After S |
|--------|---|------|---------|---------|
| [sakes.md](../grammar/sakes.md) 1,130 (5.3%) | 12 | 322 (28%) | Feelings and permission | 7 + 5 |

Keep the lattice, met / unmet, prescription, motive, attachment, whose stake, contrary, sake bars. Move emotion compose, feeling with no object, thanks and sorry, speaker attitude, say-words. Interleaved like knowing, so this split stays alone; the ceiling lint is small and rides at the end, once every other band is at most 10.

Emotion compose stays one H3. Promote say-words' H4s (someone over the act, consent, how far the say reaches) to H3. Sibling Intermediate then about 7.

Then `practiceItems` fails when *S* > 10, with a message that names the page, the band, and *S*, and points at the sibling-page rule. Roles at 10 still passes. Do not turn this lint on before this phase: six bands would fail today. The editor-doc rule from phase 1 is what stops new H3s on those pages until they split.

# Worth a look: structural highlights on introduction.md

**Status:** PROPOSED. 2026-11-11: user decided no emoji or other marker anywhere (heading, sidebar, entries).
**Related:** [introduction.md](../grammar/introduction.md), [purpose.md](../grammar/purpose.md), [orientation-style.md](../meta/orientation-style.md), [grammar-docs.md](../meta/grammar-docs.md#what-belongs-where), [lint-forward-links.ts](../../scripts/lint-forward-links.ts)
**Depends on:** none
**Design authority:** *none*. It adds an orientation section and editor notes. No form or reading changes.

## Problem

A visitor who is not seriously learning yet has no short way into what is unusual about how Ageben is built. The sidebar is a reading order. The [feature tour](../grammar/purpose.md#psychological-features) on Why Ageben covers only psychological features. The introduction's [structural goals](../grammar/introduction.md#structural-goals) name the three goals (unambiguous, singable, reusable) but do not show where in the grammar each one pays off.

## Goals

- One new section on `introduction.md` that gives a visitor a short menu of the most distinctive **structural** features, each with a link to the section that teaches it.
- The menu is organized by the three structural goals, so it reads as "where to see each goal at work" and serves the page's own job.
- Each row says what English leaves open and what Ageben does instead, in plain English, with no Ageben spellings.
- One line says the sidebar order is still the way to learn the language.

## Non-goals

- Psychological features. Why Ageben and Claritish own them.
- Emoji, sidebar markers, toggles, generated pages, or new data files.
- An equivalent menu on the cheat sheets, the recipe track, or Claritish.
- Example sentences. `orientation-style.md` → [forms and notation](../meta/orientation-style.md#forms-notation) allows a spelled form only where it is fully glossed, and a menu row has no room for that.
- Any change to a grammar stage page.

## Design

### Placement and heading

The section is a new H2 **between Structural goals and How to learn**:

- It is in the overview register, not the site-manual register of How to learn ([three registers](../meta/orientation-style.md#three-registers)).
- Structural goals is its premise, so it follows it ([one owner per topic](../meta/orientation-style.md#one-owner): order follows dependence).
- A casual visitor reaches it before the site manual.

Heading: **Features that show the design** `{#worth-a-look}`. A heading on the overview part must be a plain claim a visitor can read alone, and "Worth a look" is not one. The anchor keeps the working name.

Opening, one short paragraph (draft):

> Each row below names something English leaves open and links to the section where Ageben settles it. The pages come from all three levels and build on earlier ones, so a term may be new when you land there; follow its link back. To learn the language itself, use the reading order in How to learn. *(On the page, "How to learn" links to `#how-to-learn`.)*

The level is written out in words in each row. The **B** / **I** / **A** tags are defined under How to learn, which comes later on the page and which this reader has not read ([the reader](../meta/orientation-style.md#reader)).

### Format

One H3 per structural goal, each with a one-sentence opener about the language and then a table. Parallel items go in a table ([carry-over rules](../meta/orientation-style.md#carry-over)).

| Column | Holds |
|--------|-------|
| **Feature** | A plain English name, linked to the H3 anchor that teaches it |
| **What English leaves open** | One or two sentences: the English case, then what Ageben does. Grammar fact, stated plainly ([calibrated claims](../meta/orientation-style.md#calibrated-claims)) |
| **Level** | Beginner, Intermediate, or Advanced, in words |

No row names a placement rule, an inventory, or a term the row does not gloss. *Join word*, *power of ten*, and *braces* are glossed or self-evident; *binder*, *exponent*, *mantissa*, *hook*, *fence*, and *SHARED* do not appear.

### The nine rows

Draft wording. Step 3 of the plan checks each one against its section.

#### Every sentence has one reading

Opener (draft): *Ageben settles in the writing several things English leaves to context.*

| Feature | What English leaves open | Level | Target |
|---------|--------------------------|-------|--------|
| Where a list ends | *Tea or coffee and cake* leaves open which items go together. Every Ageben list ends with its own join word, so the grouping is written out. | Beginner | `joins.md#right-close`, or `list-structure.md#fence-nesting` (Intermediate) if right-close does not show a nested list |
| What a describing word covers | In *old men and women*, are the women old? Where an Ageben describing word sits says whether it covers the whole list or one item. | Intermediate | `list-structure.md#shared-after-the-join` |
| How much *possibly* covers | In *you possibly left early and missed the bus*, does *possibly* cover both? Ageben puts braces around exactly the part it covers. | Intermediate | `scope-islands.md#scope-islands` |
| Whether the ends count | *Between 3 and 5* leaves open whether 3 and 5 count. Ageben has a separate word for *through*, *up to but not including*, and *strictly between*. | Intermediate | `ranges.md#ranges` |
| Whose left | *On the left* leaves open whose left. Ageben says whether it is a person's side or a fixed compass direction. | Intermediate | `viewpoint.md#viewpoint-laterals` |

#### A few patterns do many jobs

Opener (draft): *Ageben gets many meanings out of a few patterns, so forms English learns one by one fall out of patterns you already know.*

| Feature | What English leaves open | Level | Target |
|---------|--------------------------|-------|--------|
| One set of vowels for kinds of sentence | English uses unrelated words for *that …*, *whether …*, and *to …*. Ageben builds them from the same four vowels that mark a statement, a question, an instruction, and something to avoid. | Intermediate | `stand-in-vowels.md#stand-in` |
| Rough amounts | English learns *thousands*, *millions*, and *a few* as separate words. In Ageben they are ordinary number words with digits left out: keep only the power of ten and the word means *in the thousands*; leave out every digit and it means only *more than one*. | Intermediate | `digitless-exponents.md` (page top, `#how-many-and-how-big`) |
| Infinity, zero, and *a gazillion* | English learns *infinity*, *absolutely zero*, *last place*, and *a gazillion* as separate words. In Ageben each is a number word with its power of ten left empty, and what comes before the empty slot says which one. | Advanced | `special-values.md` (page top, `#infinity-zero-and-hyperbole`) |

The two number rows make the point that these meanings need no new vocabulary: they follow from the number system itself. They do not pitch the meanings as such.

#### Built to be sung

Opener (draft): *Ageben word shapes are chosen so a melody can carry them.*

| Feature | What English leaves open | Level | Target |
|---------|--------------------------|-------|--------|
| Word shapes for singing | English *strengths* stacks five consonants together, and *record* changes meaning when the stress moves. Ageben words mostly alternate consonant and vowel, and stress always falls on the same beat, which is meant to let a melody place any word freely. | Advanced | `singability.md#singability-constraints` |

### Reserve rows

If a row fails the cold-start check or a fact check, replace it from here and keep it in the same goal group:

- `list-structure.md#respectively`: pairing two lists item by item (one reading).
- `list-structure.md#fence-nesting`: if the joins row stays on `right-close` and a second list row is wanted (one reading).
- `span-nesting.md`: marking a quote as cut off or faulty in the writing itself (one reading, Advanced).
- `numeric-derivation.md`: number prefixes such as *tri-* built from ordinary numbers (patterns, Advanced).
- `phonology.md#vowel-pitch` / `singability.md#vowel-pitch-values`: vowel pitch, dropped in song (singable).

Dropped from the earlier draft: `locative-relations` (giving source and goal their own words is not unusual, and its opening points at extra-noun hooks, so a newcomer cannot read it) and `abstract-landmarks` (its opening says Ageben does the same as English).

### Overlap with Why Ageben

- The joins row is about grouping, not open versus closed lists, which the tour owns ([open lists, closed lists](../grammar/purpose.md#open-and-closed-lists)).
- Role letters and free word order are already shown in [Ageben at a glance](../grammar/purpose.md#at-a-glance) and the structural goals. They get no row.
- Hyperbole is a number form here. Its psychological use, if any, is not mentioned.

### Editor notes

- `orientation-style.md`:
  - a new section **The feature menu** `{#feature-menu}`, which states the format above (columns, row length, English case first, no forms, level in words, link to an anchor a newcomer can read, structural features only);
  - a checklist row: "A menu row names what English leaves open and what Ageben does, and stops";
  - a row in [one owner per topic](../meta/orientation-style.md#one-owner): structural feature menu → Introduction;
  - the overview row of [three registers](../meta/orientation-style.md#three-registers) names the menu as part of the overview.
- `grammar-docs.md` → [what belongs where](../meta/grammar-docs.md#what-belongs-where): the introduction entry adds "structural feature menu".

## Plan

One session, no subagents: one page and two editor notes, small enough to hold in context.

1. **Editor notes.** Make the `orientation-style.md` and `grammar-docs.md` edits above, so the section is written to a stated rule.
2. **Cold start.** For each target, read only the target H3's first paragraph or two. Can someone who has read nothing else follow it? If not, move the link to a better anchor on the same page, or swap in a reserve row.
3. **Fact checks.** Read each target section only as far as the row's claim needs:
   - joins: whether `#right-close` shows a nested list; if not, link `#fence-nesting`.
   - list-structure: that a describing word right after the join covers each item, and one placed on an item covers that item only. Confirm with `node scripts/parse.mjs --llm-prompt` on a sample (the sample does not go on the page).
   - stand-in vowels: that the four vowels map to statement, instruction, question, avoid, and that an English *to …* complement is the instruction case. If not, drop *to …* from the row.
   - ranges: the three named ends are each one word.
   - digitless: power of ten only = a band such as *in the thousands*; every digit left out = *more than one*; *a few* is the soft-ending variant.
   - special values: empty power of ten gives infinity, *last place*, zero, and *a gazillion*, chosen by what comes before it.
   - singability: the stress claim and the consonant-vowel claim.
4. **Write the section** on `introduction.md`.
5. **Before you finish.** Run the six [closing tests](../meta/orientation-style.md#before-you-finish). For "Once", grep `introduction.md` and `purpose.md` for each row's key word (*list*, *possibly*, *left*, *infinity*, *sing*).
6. **Build.** `npm run build`.
7. **Commit.** Only when the user asks: one commit, `introduction: features that show the design; orientation-style feature menu [skip-cd]`.
8. **Close.** Delete this proposal once the section and notes are in.

If the user says to stop partway, [consolidate the proposal](../meta/procedures/proposals.md#consolidate-on-stop) before the session ends.

## Done when

- `introduction.md` has the new H2 between Structural goals and How to learn, with three goal groups, nine rows (or reserve substitutes), and the opening paragraph that points to How to learn.
- Every row links to an anchor a newcomer can read, uses no Ageben spelling, and states its level in words.
- The `orientation-style.md` and `grammar-docs.md` edits are in.
- `npm run build` passes.
- No link points to a page under `docs/proposals/`.

## Open decisions

1. **Heading wording.** Options: *Features that show the design*; *Where the design shows*; *Worth a look* (fails the plain-claim heading rule). **Recommendation:** *Features that show the design*. It reads alone and says what the rows are.
2. **One row under Built to be sung.** Options: keep one row; add vowel pitch from the reserve list. **Recommendation:** keep one row. Vowel pitch is a speech feature that song drops, so it shows singability less directly than word shape does.

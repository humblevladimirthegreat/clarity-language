# Proposal: named-handle coinage (VC harvest)

**Status:** PROPOSED (not current language). Grammar today: a handle is one **published** root + **-n**; long titles stay [phrasal proper names](../grammar/reference-suffix.md#phrasal-proper-names) / [named handles](../grammar/reference-suffix.md#named-handles).  
**Related:** [reference-suffix.md](../grammar/reference-suffix.md#named-handles), [spans.md](../grammar/spans.md#loans) (mention vs office **-n**), [pronouns.md](../grammar/pronouns.md) (short resume = through the 2nd vowel)  
**Design authority:** none until absorbed. Speakers currently do **not** mint new `V(CV)+` stems.

## Motivation

English offices often have a **short name** (*FBI*) beside a long title. Agalan already has:

- Long native titles: `ROOT x ROOT` … + **-n** (`zabogoxululon`).
- Short names: ordinary proper names from the **published** lexicon (`zabogon`).
- Foreign letter-names: loans / opaque spans (`z<FBI>n`).

Harvest would mint a **new** native root from the title’s content roots, so the short name is recoverable from the long title without picking an existing lemma (and without treating the acronym as foreign).

## Non-goals

- Changing how **-n**, mention `{…}`, or opaque `<…>` work.
- Putting harvest products in [`lexicon-published.csv`](../../data/lexicon-published.csv) as ordinary senses.
- Teaching coinage on learner grammar pages while this stays a proposal.

## Proposed harvest

Institutions mint a native handle from the long title’s **content roots** (skip joins, revisers, and number words). The result must be one legal `V(CV)+` root, then **-n** in use.

| Step | Do |
|------|----|
| 1 | From each content root, take **first vowel + next consonant** (`abogo` → `ab`, `alodo` → `al`, `ululo` → `ul`) |
| 2 | Concatenate those pieces **without** mid-word **`x`** |
| 3 | If the string ends in a consonant, add the **last root’s 2nd vowel** (the same cut as a [short resume](../grammar/pronouns.md)) |
| 4 | If that root already names something else, **lengthen** (include the next vowel of a distinctive root) |

Two-root example (step 4: `ab`+`ul`+ last root’s 2nd vowel is published `abulu`, so lengthen):

```
`abogo` × `ululo` → `ab` + `ul` + `o` → `abulo` → `zabulon`
```

Hearers treat the handle as a **name**. Full-root resume of `abulo` is `zabulor` (not `zabulur`, which is published `abulu` + **-r**). Mention of the **form** stays `{abulo}`; the office as referent is `zabulon`. Foreign acronyms stay loans / opaque; they do not use this harvest.

Citation of the handle is prefix-less `abulon`.

## Open: arity

A three-root run of the same algorithm:

```
`abogo` × `alodo` × `ululo` → `ab` + `al` + `ul` + `o` → `abalulo` → `zabalulon`
```

That only shows “more title roots ⇒ a longer coined stem.” A handle’s job is a **short** stand-in for a long `x`-title. Two `VC` pieces plus a final vowel is ordinary `VCVCV` (`abulo`). Three pieces is `VCVCVCV` (`abalulo`), already in the weight class of keeping the full title. Unbounded harvest would mint still heavier “handles.”

If this proposal is absorbed, prefer **cap at two content roots** (first and last of the title is enough), and keep step 4 only to dodge an existing lemma. Do not teach n-ary harvest as productive.

## Why it is not in grammar

Current language does not ask speakers to invent roots. Handles already work as published names (`zabogon`) beside the long title (`zabogoxululon`). Harvest needs extra tooling (unpublished stems in docs, resume collisions with nearby published roots) for a job the lexicon already covers.

## Absorb sketch (if yes)

1. Decide arity (two-root only vs n-ary).
2. Put the algorithm on [reference-suffix.md](../grammar/reference-suffix.md) Advanced; keep Beginner/Intermediate handles as published roots until that band.
3. Grammar-doc lint: either allow listed harvest products (`abulo`, …) or only show them inside mention spans.
4. Do not add harvest stems to the published lexicon as senses.

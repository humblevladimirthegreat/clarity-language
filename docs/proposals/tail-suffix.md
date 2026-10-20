# Proposal: tail suffixes (kind + job as a compound head)

<!-- retie: skip -->

**Status:** PROPOSED. Depends on `root-tails.md` (the kind and job letter map). Not started.  
**Related:** `root-tails.md`; [lexical compounds](../grammar/x-compounds.md#lexical-compounds); [hook compounds](../grammar/hooks.md#hook-compounds); [lexicon editing § dictionary compounds](../meta/lexicon.md#dictionary-compounds); [word-endings.md](../grammar/word-endings.md); [`src/lexicon-compounds.ts`](../../src/lexicon-compounds.ts) (`factorizationsForStem`, `validateCompoundRows`); [`src/parse/hook-compounds.ts`](../../src/parse/hook-compounds.ts).  
**Design authority:** none until absorbed. Grammar today: a dictionary compound is left root + join + full head root. Speakers do not attach a two-letter tail as a head.

## Summary

- A listed compound may take a **tail suffix** as its head: the same `CV` that ends a five-letter root (`z` + `a` = gathering-creature, `h` + `o` = a place of the left, `w` + `u` = a tool that undoes the left).
- The left piece is a **five-letter** published root. **No suffix on a three-letter root** (that spelling is already a five-letter simple root).
- **No 3 + join + 3 compounds.** That frees the seven-letter stem for five-letter left + suffix, and today's seventeen such rows are rewritten when this is absorbed.
- The compound is still a **dictionary word**: you look it up. The suffix is not built on the spot; live pairings stay mid-word **`x`** or two words.
- Named (`n`) is not a suffix head: it has no job vowel.

## Motivation

Lexical compounds already end in the head's tail once `root-tails.md` is live, so the last two letters before the ending name the kind of thing. Many English one-word kinds do not need a *specific* head root: *firehouse* is a place of fire, *friend* is a person of a bond. Writing a full second root (`house`, `person`) spends five letters on a kind the tail already names.

A `CV` head is that kind plus the job vowel, attached to a specifier. The vowel is the same extra as on simple roots ([job](../grammar/speech-moves.md#speech-act-beginner) series: **a** holds, **o** one, **e** order, **u** takes away), so it composes: `…ha` a place that holds the left, `…yo` a person characterized by the left, `…wu` a tool that undoes the left.

Per-kind subcategory vowels were considered and rejected in `root-tails.md`: a suffix needs one operator, not a twelve-by-four lookup.

## Form {#form}

```
five-letter root  |  C V
specifier            tail (kind + job)
```

The stem is **seven letters**, `VCVCV` + `CV`. There is **no join letter**. The left root's sense is the everyday one; an abstract left still wants two full roots and a join **-m**, as today.

The suffix consonant is a [kind](../grammar/clause.md#role-letters) letter from `root-tails.md` except **`n`**. The suffix vowel is a job: **a** the new thing holds the left, **o** default (a kind of the left), **e** arranged or in sequence from the left, **u** undoes or works against the left. Tie rule as in `root-tails.md`: **u → a → e → o**.

Examples below write roots as patterns or English labels, never as pinned spellings ([placeholder spellings](../meta/lexicon.md#placeholder-spellings)).

| English | Pieces | Why that job |
|---------|--------|----------------|
| *library* | *book* + `ha` | a place that holds books |
| *bedroom* | *bed* + `ho` | a place characterized by a bed (keep two full roots when *room* is the specific head you mean) |
| *friend* | *bond* + `yo` | a person characterized by the bond |
| *eraser* | *mark* + `wu` | a tool that takes marks away |
| *teacher* | *teach* + `ye` | a person in that ranked job |
| *beekeeper* | *bee* + `ya` | a person who holds/tends bees |

Use a **two-root** compound when the head is a more specific kind than its tail (*oak* = *nut* + *tree*, not *nut* + nature-suffix). Use a suffix when the head *is* the kind.

## Bans {#bans}

**No three-letter left.** `VCV` + `CV` is the shape of a five-letter root. Under tails that root already ends in that kind and job, so the suffix reading would steal every simple five-letter word. Overlay-backed shorts stay simple roots; a compound on them uses a five-letter synonym as the left, or stays two full roots of legal lengths.

**No 3 + join + 3 listed compounds.** A seven-letter stem `VCV l VCV` (and `m` / `n` / `r` in the same slot) would split two ways: three + join + three, or five + suffix whose left kind is `l` / `m` / `n` / `r`. Dropping 3 + 3 leaves **5 + `CV` as the only listed seven-letter shape**. Today's rows (live lexicon, 2026-10-19): *friend*, *investment*, *budget*, *citizen*, *literature*, *stem*, *piggy-bank*, *rib*, *neighbor*, *celebrity*, *atlas*, *manual*, *guidebook*, *audiobook*, *detective-story*, *donation*, *windpipe*. Absorb rewrites each to a suffix on a five-letter left, or to 5 + join + 5 / 5 + join + 3 / 3 + join + 5.

Live **`x`** compounds and hook compounds are untouched. Hook compounds stay citation + extra-noun hook ([hook compounds](../grammar/hooks.md#hook-compounds)), eight or more letters, not this seven-letter stem.

## Seams {#seams}

A reader finds the suffix by length: seven letters, last two the tail, first five a published root.

The remaining clash is accidental, not listed: a suffix whose left kind is nature / mind / counting (`l` / `m` / `r` at letter 4; named is not a suffix) still *looks* like 3 + join + 3. If both three-letter pieces are published shorts, `factorizationsForStem` would report two splits.

**Lint:** a suffix stem must not also be 3 + join + 3 of published three-letter roots. Skip that suffix spelling, or pick another left root. The same check already used for two-root compounds in `root-tails.md` ([listed compounds](../meta/lexicon.md#dictionary-compounds)).

Kinds whose letter is not a join (`z y b v h d w g`) never hit this: letter 4 is not `l` / `m` / `n` / `r`.

## Parser and data {#parser}

Listed only, like other dictionary compounds. The parser accepts a seven-letter stem when [`lexicon-compounds.csv`](../../data/lexicon-compounds.csv) (or a sibling table) names it as left + suffix, not when any `CV` is tacked onto any root.

`right` today must be a published content root. Absorb either:

- allows a two-letter `right` that is `KIND_LETTERS[kind] + SHAPE_VOWELS[shape]`, with `join` empty, or
- adds a `suffix` column (`ha`, `yo`, …) and keeps two-root rows as they are.

Hook-compound rows (`right` an extra-noun hook) stay a separate shape.

`npm test` / `check-compounds`: unique factorization; no 3 + 3 two-root rows; no three-letter left on a suffix row; suffix `CV` in the closed kind×job set; no clash with a published five-letter root (a suffix stem is seven letters, so this is free).

## Teaching {#teaching}

Not a Beginner form. If absorbed, a short Advanced note on [lexical compounds](../grammar/x-compounds.md#lexical-compounds): some dictionary words end in a kind-job tail instead of a second root. Dictionary views of those rows link to the tails section in Advanced [phonology](../grammar/phonology.md#advanced). Do not teach speakers to mint suffix words on the spot; that would compete with **`x`**.

## Costs

1. **Seventeen live 3 + 3 compounds must be rewritten.** Several sit on overlay shorts (*bond*, *person*). The rewrite picks a five-letter left or a longer two-root spelling.
2. **Abstract left** still needs join **-m** and a full head; the suffix has no join, so it cannot mark the left's abstract sense. Those entries stay two-root.
3. **Edge calls** on the job vowel are the same judgment as simple-root tails. Record them on the row.
4. **Nature / mind / counting** left roots need the extra lint against published shorts.

## Alternatives considered

| Alternative | Why not |
|-------------|---------|
| **Suffix on three-letter roots** | Indistinguishable from a five-letter simple root. |
| **Keep 3 + join + 3** | Seven-letter stems split two ways whenever the suffix kind is a join letter. |
| **Join letter plus `CV`** (`bed` **-l** `ho`) | Eight letters, and letter 6 is a vowel so it does not look like today's 5 + join + 3. Longer than needed once 3 + 3 is gone. |
| **Productive (unlisted) suffixing** | Competes with **`x`** and with two-root listing; every `CV` on every five-letter root would be a word. |
| **Named (`n`) suffixes** | No job vowel; countries and traditions are not coined as "an X-country". |
| **Per-kind subcategory vowels** | Breaks composition; see `root-tails.md`. |

## Absorb sketch (if yes)

1. Land `root-tails.md` phase 2 (live roots have tails).
2. Ban 3 + join + 3 in `validateCompoundRows`; rewrite the seventeen rows.
3. Extend the compound CSV and parser for seven-letter left + `CV` rows.
4. Lint suffix stems against 3 + join + 3 of published shorts.
5. Teach on [x-compounds.md](../grammar/x-compounds.md) Advanced and point at the phonology tails section. New suffix entries follow [when a compound earns a row](../meta/lexicon.md#when-a-compound-earns-a-row), with the head being the kind rather than a specific root.

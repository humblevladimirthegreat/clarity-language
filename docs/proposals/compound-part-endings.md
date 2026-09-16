# Proposal: reference endings on inner `x`-compound parts

**Status:** PROPOSED (not current language). Grammar today: the [reference suffix](../grammar/reference-suffix.md) (**-l** / **-m** / **-n** / **-r**) belongs to the **whole** content word. Inner pieces of a productive **`x`** compound are bare roots (`golovexagal`, `zazawaxululon`). Closed [lexical compounds](../grammar/x-compounds.md) store a left-member letter in the **dictionary stem** (`ohohulabede`), not as a live inner ending.  
**Related:** [x-compounds.md](../grammar/x-compounds.md), [phonology.md](../grammar/phonology.md#phonotactics), [clause.md](../grammar/dependents.md#sentence-linkers) (sentence linkers), [numeric-derivation.md](../grammar/numeric-derivation.md) (right half has no ending of its own)  
**Design authority:** none until absorbed.

## Motivation

A live compound is one slot-filler, but each published root still has a sense (everyday kind, published metaphor, name, resume). Speakers currently cannot mark that sense on a **piece**. The whole-word ending only says how to take the **package** (*peanut butter* as a kind, *Coffee-Tea* as a shop name).

Allowing **-l** / **-m** / **-n** / **-r** after **any content root** in the compound (every part except the last, which already carries the word ending) would let the kind and the package differ: metaphor on the left, named whole; resume of a prior root as the kind; a later field named independently of the word’s last letter.

## Proposed shape

On a productive **`x`** compound whose content pieces are full roots:

```
PoS + ROOT1 + (ENDING)? + x + ROOT2 + (ENDING)? + x + … + ROOTn + ENDING
```

- The **last** ending is required and is ordinary reference for the whole word (current rule).
- An ending after a **non-final** piece is optional. Omit it when that piece’s sense is the same as the whole-word ending, or when the piece is only a field label with no independent reference.
- Inner endings have the same four jobs as today (**-l** literal, **-m** metaphor, **-n** name, **-r** resume), scoped to **that piece**, not to the slot-filler.
- Role-compound vowels (`a` / `e` / `u` / `o` left of **`x`**), span type/edge vowels, greeting-bid / values / ability stance vowels, and [numeric](../grammar/numeric-derivation.md) right halves still **cannot** take an inner ending (they are not content roots with a reference suffix).

Lexical dictionary stems stay frozen (`ohohulabede`). Speakers do not insert **`x`** or rewrite the join letter ad hoc. This proposal is only for **live** **`x`**.

## Ban: next piece is a sentence linker root

Do **not** write an inner ending when the **next** content root is the body of a [sentence linker](../grammar/dependents.md#sentence-linkers). Those words are `/x/` plus one of a handful of roots; an inner ending would put a word-edge consonant immediately before that **`x`**, which is the same sound as “this word ended, then a linker started.”

| Linker | Spoken word | Next-piece root (illegal after an inner ending) |
|--------|-------------|--------------------------------------------------|
| *therefore* | `xezazal` | `ezaza` |
| *however* | `xezebal` | `ezeba` |
| *meanwhile* | `xanelol` | `anelo` |
| *next* | `xuvumul` | `uvumu` |
| *but* | `xonugol` | `onugo` |

Illegal: `…l` / `…m` / `…n` / `…r` then **`x`** then one of those five roots (any later piece of the compound, not only the first seam).

Legal: the same compound **without** the inner ending (`ROOTxezaza…`), because the seam then sits after a vowel, which is not a word edge.

The ban is only this closed linker list. Other `/x/` jobs (continue on a new word, discourse number words, ordinary roots that happen to start after **`x`**) stay as they are; they do not start with “ending + linker body.”

## Hearer notes (if absorbed)

- Word-edge letters currently tell the listener the content word is over ([phonology](../grammar/phonology.md#phonotactics)). An inner ending is a **fake edge**; the ban above removes the worst collision (linker). Song and fast speech still need a rule that more letters after **`x`** mean “still this word.”
- Associative plural **-x** stays **word-final** after the whole-word ending. Inner `…lx…` is ending + seam, not plural.
- Two-word lists (`zazawan zululon`) vs one compound (`zazawaxululon` vs proposed `zazawanxululon`) stay distinct in writing (space). Speakers who use the inner **-n** must not pause as if the first name had finished.

## Non-goals

- Changing lexical-compound spelling or letting speakers mint dictionary stems with **`x`**.
- Required inner endings on every piece.
- New linker words, or extending the ban to every word-initial **`x`**.
- Teaching this on learner grammar pages while it stays a proposal.

## Absorb sketch (if yes)

1. State optional inner endings on [x-compounds.md](../grammar/x-compounds.md) (Intermediate: any non-final content piece; the linker ban in the same breath).
2. Update [phonology.md](../grammar/phonology.md#phonotactics): a syllable-final **l** / **m** / **n** / **r** is legal **before mid-word `x`**, not only at the word edge; keep the linker ban as the collision rule.
3. Parser: inner suffix tokens on compound parts; reject inner ending + linker root; leave numeric / role / stance / span families unchanged.
4. Do not rewrite closed lexicon compounds.

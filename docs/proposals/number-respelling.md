# Proposal: number respelling (digit syllables, exponent, alphabet order)

**Status:** PROPOSED. Nothing here is built.  
**Related:** [numbers.md § Counts](../grammar/numbers.md#counts) (digit syllables), [§ Exponents](../grammar/numbers.md#exponents) (`ba` / `bu`, `ya` / `ye` / `yo` / `yu`), [§ Group separator](../grammar/numbers.md#group-separator), [§ Digitless exponents](../grammar/numbers.md#digitless-exponents); [numeric-derivation.md](../grammar/numeric-derivation.md) (stems such as `raba`); [phonology.md § Letter names](../grammar/phonology.md#letter-names) (alphabet order, digit letters, [opposite vowels](../grammar/phonology.md#opposite-vowels)); [lexicon editing § root tails](../meta/lexicon.md#root-tails); [`src/tts/numbers.ts`](../../src/tts/numbers.ts) (`DIGIT_TO_SYLLABLE`, exponent speech); `number-mnemonic.md` and `manual-phonology.md` (both key on the digit letters and alphabet order).  
**Design authority:** none until absorbed. The number grammar (word shape, markers, endings, groups, shorthand) is unchanged. Only the spoken spelling of the ten digits, the exponent sign, and the alphabet order change.

## Summary

| Digit | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0 |
|-------|---|---|---|---|---|---|---|---|---|---|
| Today | wo | du | re | mo | va | gu | le | ha | na | zo |
| Proposed | **bu** | **da** | **go** | **ve** | **zu** | **ha** | **lo** | **re** | **nu** | **ma** |

- **Consonant:** stops (`b d g`) for 1–3, fricatives (`v z h`) for 4–6, the four ending letters for 7–0. Within the stops and the fricatives, front of the mouth to back.
- **Vowel:** cycles in alphabet order, **u a o e**, starting at 1 (0 counts as the tenth).
- **Exponent sign:** `wa` / `wu` replaces `ba` / `bu`. The points (`ya` `ye` `yo` `yu`) are unchanged.
- **Alphabet:** b d g v z h l r m n, then w y th x, then u a o e.

## Problems with the current table

1. **No rule.** Some cues come from English (*one*, *duo*, *three*, *five*, *nine*, *zero*); 4, 6, 7 and 8 have none. All ten pairs are learned as a list.
2. **The vowel is redundant, but it does not catch the likeliest mishearings.** Each digit consonant has exactly one vowel, so 30 of the 40 consonant + vowel pairs are not digits. That should let a listener notice a misheard consonant. But the most confusable pairs share a vowel: `du` / `gu` (d/g), `re` / `le` (r/l), `mo` / `wo` (both lip sounds), `va` / `ha` (weak fricatives). Mishearing one of those gives another valid digit, so the error goes unnoticed.
3. **The exponent filler is confusable with a digit.** `bu` (negative exponent) and `gu` (6) differ only in b vs g.
4. **Digit 3 sounds like the rank marker** (`re`), so *the 33rd* is `grererel`.

## Goals

1. **The table follows from rules,** not English cues: a consonant order and a vowel cycle.
2. **Every likely mishearing of a single consonant gives a syllable that is not a digit,** among digits and between a digit and a number filler.
3. **Strong consonants on the most frequent leading digits** (Benford: 1 > 2 > 3 …).
4. **Root letters suit the digit-onset mnemonic:** the rarest root letters carry no digit, so no two-digit cell is empty.
5. **One consonant per digit,** so the finger code and the mnemonic keep a 1:1 digit ↔ letter map.

## Non-goals

- Changing number grammar: markers (`ra` `ru` `re` `ro` and the stacks), endings, the group separator (`th` + marker vowel), shorthand, word shape.
- Changing the points syllables (`ya` mantissa follows, `ye` decimal point, `yo` percent, `yu` percentage points).
- Revising `number-mnemonic.md`. This proposal only fixes which letters carry digits. The mnemonic's tables follow once this is absorbed.
- A base-5 table. It was rejected, see [alternatives](#alternatives-considered).

## The design

### Which letters carry digits

Inside a number word, digits must avoid `th` (the group separator) and `x` (the compound seam and plural). Of the remaining twelve letters (`w d r m v g l h n z b y`), ten carry digits and two become the number fillers. That leaves 66 possible filler pairs. They were scored on two tests:

- **Confusion test** ([below](#confusion-test)): only 14 of the 66 pairs allow a vowel-cycle assignment with no confusable clash.
- **Mnemonic coverage** (the lexicon after a simulated re-placement with the second-consonant ban lifted, under English-echo placement, all 100 two-digit cells, flag roots counted; `root-tails.md` changes which letters are rare, so this test needs a rerun): `y` has to be a filler, because it is the rarest root letter (25 first consonants, 60 second consonants in today's lexicon). Of the 66 pairs, **`w` + `y`** is the only one that leaves no two-digit cell empty.

| Fillers | Fewest roots in a two-digit cell | Cells with < 3 roots | Fewest one-digit roots for a letter | Two-digit cells with a `core` root |
|---------|---------------------------------|-------------------|--------------------------------|------------------------------|
| **w y** | **1** | **4** | 9 | **68** / 100 |
| h y | 0 | 12 | 8 | 58 |
| b y (today) | 0 | 12 | 14 | 60 |
| d y | 0 | 13 | 13 | 56 |

So the digit letters are **`b d g v z h l r m n`**, and the fillers are **`w`** (exponent sign) and **`y`** (points, as today).

### Exponent sign: `wa` / `wu`

| Today | Proposed | Meaning |
|-------|----------|---------|
| `ba` | `wa` | positive exponent (*e*) |
| `bu` | `wu` | negative exponent (*e-*) |

The vowel cues stay: **a** ≈ add, **u** ≈ undo. `b` is now a digit (1), so `ba` and `bu` are no longer exponent syllables.

### Vowel cycle

Digit *k* takes vowel number *k* in the order **u a o e**, repeating, with 0 counted as 10:

| Vowel | Digits |
|-------|--------|
| u | 1, 5, 9 |
| a | 2, 6, 0 |
| o | 3, 7 |
| e | 4, 8 |

Within each mouth group, neighbouring letters are the ones most often misheard for each other. Neighbouring digits always get different vowels, so those mishearings give non-digit syllables.

### Consonant order

| Digits | Letters | Group | Order inside |
|--------|---------|-------|--------------|
| 1–3 | `b d g` | stops | front to back |
| 4–6 | `v z h` | fricatives | front to back |
| 7–0 | `l r n m` | the four [word endings](../grammar/word-endings.md) | hooks, [below](#ending-block) |

Sonority rises across the three blocks: closed stops, then fricatives, then sonorants you can hold.

The fricative block has to start at 4. With `w` as the exponent filler, `v` (confusable with `w`) and `r` (confusable with `w`) can't take `a` or `u`. So they must sit on 3, 4, 7 or 8. Every pure sonority order and every strict manner-then-place order puts a liquid on an `a` or `u` digit, and fails. This blocked order is the strict manner-then-place order except for the sonorant block.

### Ending block {#ending-block}

`r` must be 7 or 8. All 12 arrangements of `l r m n` that satisfy this are legal. Proposed: **7 l, 8 r, 9 n, 0 m** (`lo re nu ma`).

- **It has no weaker clashes either.** Only the four arrangements with `m` on 0 avoid the weight-1 pairs: d/l, d/n, b/m sharing a vowel. Those pairs differ in manner and are lower risk, but a mishearing between them still lands on a valid digit.
- **0 = `ma`:** a nasal, among the most noise-robust syllables. That suits the digit that turns up most in phone numbers, dates and IDs.
- **Hooks that need no English:**
  - 0 = m: lips closed, nothing comes out. The phonology page already uses closed-lip *mmm* for "not ready to speak".
  - 8 = r: the figure 8 loops back on itself, and **-r** is the ending that points back.
  - 7 = l: a 7 looks roughly like an upside-down L.
  - 9 = n: by elimination.
- **Coverage is the same for every arrangement.** The mnemonic reads both digits from root consonants, so moving digits among `l r n m` only relabels cells.

The alternative `no re mu la` adds the d/l and b/m clashes and has weaker hooks.

### Confusion test {#confusion-test}

Pairs that count as confusable when they share a vowel:

| Weight | Pairs | Source |
|--------|-------|--------|
| hard (must differ) | m/n, d/g, b/d, b/v, l/r, b/g, v/w, r/w, l/n, v/z, v/h | Place of articulation is the weakest cue in noise (Miller & Nicely 1955). Known second-language merges: l/r (Japanese, Korean), b/v (Spanish), v/w (German, Hindi), l/n (some Chinese varieties). |
| soft (avoid when free) | d/l, d/n, d/z, b/m, g/h, l/y, r/y | Manner differs; lower risk. |

The test covers digit–digit pairs and digit–filler pairs:
- The exponent filler is checked on `a` and `u`, the vowels it uses.
- The points filler is checked on all four vowels.

The proposed table passes every hard pair. No two digits share a vowel across a soft pair either; the points filler `y` still shares vowels with `l` and `r`, which can't be avoided for a filler that uses all four vowels.

### Alphabet and letter names

The alphabet opens with the digit letters in digit order, as today:

| Agebon | `b` | `d` | `g` | `v` | `z` | `h` | `l` | `r` | `n` | `m` | `w` | `y` | `th` | `x` |
|--------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|------|-----|
| Digit syllable | bu (1) | da (2) | go (3) | ve (4) | zu (5) | ha (6) | lo (7) | re (8) | nu (9) | ma (0) | | | | |
| Name | ba | du | ge | vo | za | hu | le | ro | na | mu | we | ya | tho | xu |

- **Digit-letter names keep the [opposite-vowel](../grammar/phonology.md#opposite-vowels) rule,** so naming a letter never sounds like counting.
- **`w`, `y`, `th` and `x` keep their current names.**
- **The vowels follow,** in the order **u a o e**. Vowel stacks are unchanged.

The finger code in `manual-phonology.md` assigns count shapes by alphabet position, so it keeps its rule unchanged: `b` is now the index finger (1) and `m` the horns (0).

## Examples

All are generated from the shorthand by the current speech rules with the new table.

| Shorthand | Today | Proposed |
|-----------|-------|----------|
| `g+3` | `grarel` | `gragol` |
| `g+20` | `graduzol` | `gradamal` |
| `g+2026` | `graduzodugul` | `gradamadahal` |
| `g+33` | `grarerel` | `gragogol` |
| `g#2` | `gredul` | `gredal` |
| `g+5.2` | `gravayedul` | `grazuyedal` |
| `g+27e6` | `grabaguyadulel` | `grawahayadalol` |
| `g+5e3,860` | `grabareyavathahaguzol` | `grawagoyazutharehamal` |
| `d_555,123,4567` | `drovavavathowodurethomovagulel` | `drozuzuzuthobudagothovezuhalol` |
| `g+e` (+∞) | `grabal` | `grawal` |
| `g+e-` | `grabul` | `grawul` |
| `g-e` (−∞) | `grubal` | `gruwal` |
| `g+1e` (*one gazillion*) | `grawobal` | `grabuwal` |

Numeric-derivation stems change the same way: `raba` → `rawa` (`zulamalrabal` → `zalavalrawal` *essence of love*).

## Known costs

- **`r` still sounds like a marker.** Under `w` as the exponent, `r` can only be `ro` or `re`, which are the label and rank markers. On 8 it is `re`, so *the 8th* is `grerel`. This can't be avoided while `r` is a digit. Taking `r` off the digits forces it to become the exponent ([alternatives](#alternatives-considered)).
- **`wa` / `wu` is a weak exponent sign.** A glide carries less in noise than the stop it replaces, and `wu` doesn't exist in Japanese. This is the main cost of choosing `w` / `y` as fillers for mnemonic coverage.
- **Any number with a digitful exponent starts with `w`:** `grawa…`, `gruwu…`. Unlike an `r` exponent, this doesn't repeat the marker syllable.
- **The ending block's order needs its own hooks.** The stop and fricative blocks follow from the rule; the sonorant block doesn't.

## Alternatives considered

| Alternative | Why not |
|-------------|---------|
| **Keep today's letters, reorder only** (place walk with the vowel cycle: `mu wa vo de zu na lo re gu ha`) | It passes digit–digit confusions but fails at the exponent: `bu` vs 9 `gu`. With `b` / `y` as fillers, no order that follows a single principle passes digits and fillers together. |
| **Base 5** (five consonants; a rounded vowel for 1–5, `a` for +5) | Fewer facts to learn, and `r` is freed. But n and n+5 differ only in the vowel, so a misheard vowel gives a valid digit off by five, with nothing in the syllable to catch it. Mnemonic coverage drops to 43–94 of 100 cells, depending on the consonant set (flag roots excluded; measured on today's lexicon, before `root-tails.md`). |
| **`r` as exponent** (`ra` / `ru`; fillers `r` + `y`, so `b` becomes a digit) | `r` would mean sign and kind and nothing else. But the exponent comes right after the marker, so roughly 30% of the number words in the docs would open with a repeated syllable (`grara…`). The dropped syllable would be the order of magnitude, and the result would still be a valid number. It also stacks up r's: `graral`, `grarar`. |
| **`h` + `y` fillers** (`gu ba do le ru za wo ve nu ma`) | A deep stock of one-digit roots, but it leaves empty two-digit cells, the exponent `ha` / `hu` is weaker still, and the best order has no rule. |
| **`m` + `n` fillers** (nasal exponent and points) | The fillers are confusable with each other (`na` / `ma`, `nu` / `mu`), and this can't be avoided with four point roles. |
| **Place walk on `w` / `y`** (`mu ba vo re lu za do ne gu ha`) | Passes and keeps zero = breath. It was set aside because the ending letters land on 1, 4, 5 and 8, which scattered the mnemonic's old ending cells. The mnemonic no longer reads endings, so that reason is gone ([open question 2](#open-questions)). |
| **Place walk back to front on `w` / `y`** | Puts `h`, the weakest consonant, on 1, the most frequent leading digit. |
| **Marker harmony** (each digit copies the marker vowel) | The sign would be heard on every digit, but there would be no vowel redundancy left to catch a misheard consonant. |

## Open questions

1. **Listening test.** The confusion weights and robustness ranking come from published phonetics and common second-language errors, not from Agebon listeners. Before absorbing, play the proposed table and the strongest alternatives to listeners in noise. Include speakers of Japanese, Korean and Spanish.
2. **Ending block or place walk.** The mnemonic no longer reads endings, so putting the four ending letters on 7–0 rests only on its hooks. Compare the proposed table again with the place walk on `w` / `y` (`mu ba vo re lu za do ne gu ha`), which also passes and keeps zero = breath.
3. **Exponent strength.** If `wa` / `wu` tests badly, the fallback is `h` + `y` fillers with exponent `ha` / `hu`. Expect it to test about as badly, since `h` is the weakest consonant. Otherwise go back to `b` / `y` fillers and drop the filler-confusion requirement.
4. **Hook for 9.** `nu` has none. A hook that needs no English would complete the block.

## Absorb sketch

Grammar edits, one change:

- **[numbers.md](../grammar/numbers.md):** the digit table, every spelled number, exponents (`wa` / `wu`), digitless exponents, the starter and inventory tables, practice items.
- **[numbers-applied.md](../grammar/numbers-applied.md):** spelled time, date, range, measure and percent examples.
- **[numeric-derivation.md](../grammar/numeric-derivation.md):** stems (`raba` → `rawa`, …) and examples.
- **[phonology.md](../grammar/phonology.md):** the alphabet comment, the consonant table order, the letter-name table, the digit-letter table and the number-word exception example.
- **Cheat sheets:** regenerate with `npm run cheat-sheet-blocks -- --write`.

Code and tooling:

- **Speech output and parser:** `DIGIT_TO_SYLLABLE` and the exponent speech in [`src/tts/numbers.ts`](../../src/tts/numbers.ts), and the parser's spelled-number reader. Change them with the grammar edits, in the same change.
- **A number-aware retie:** `retie-docs` follows lexicon rows, not number words. It needs a pass that parses each spelled number word (about 1,500 number words in `docs/grammar/`, shorthand and spelled), reads its stem, and re-spells it with the new table. Shorthand (`g+3`) doesn't change.
- **Alphabet order:** anything that sorts or lists by alphabet order (the letter-name recitation, any sort in tooling).
- **After absorbing:** regenerate the coverage tables in `number-mnemonic.md` and the shape tables in `manual-phonology.md`.

## Non-criteria

Retie effort and the number of edited examples aren't reasons to reject this. There are no current speakers, so unlearning isn't a cost either.

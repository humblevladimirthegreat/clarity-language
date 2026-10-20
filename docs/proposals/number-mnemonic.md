# Proposal: digit-onset mnemonic (Major system)

**Status:** PROPOSED. **Depends on** two proposals:
- `number-respelling.md`: every map, table and example below uses the respelled digits (`b d g v z h l r n m` = 1–9, 0; fillers `w` and `y`). The current grammar's digits (`w d r m v g l h n z`) don't fit this design.
- `root-tails.md` (absorbed through phase 2): a five-letter root may have any consonant second, so every two-digit cell has roots. A root's second consonant names its kind, so each column of the 00–99 table fills from one kind (foods in column 2, animals in column 5, flags in column 9), and tools and people (`w`, `y` second) are one-digit pegs.

This proposal can't be absorbed before `number-respelling.md`.  
**Related:** [numbers.md § Counts](../grammar/numbers.md#counts) (digit syllables); [phonology.md § letter names](../grammar/phonology.md#letter-names) (the alphabet opens with the ten digit letters in digit order); [phonology.md § phonotactics](../grammar/phonology.md#phonotactics) (word shape, endings, seams); [word-endings.md](../grammar/word-endings.md); [x-compounds.md § lexical compounds](../grammar/x-compounds.md#lexical-compounds); [lexicon editing § root length](../meta/lexicon.md#root-length) and [§ seeds](../meta/lexicon.md#seeds-concrete-senses-and-pictographs); [`data/lexicon-published.csv`](../../data/lexicon-published.csv); `manual-phonology.md` (count shapes for the optional count layer).  
**Design authority:** spoken number grammar is unchanged. This is an optional **memory channel** that reuses the digit onsets. It adds no morphology, no second digit table, and no [numeric-derivation](../grammar/numeric-derivation.md) reading.

## Motivation

English memory systems (Major / Herigone) turn digits into consonants, then add vowels to make picture-words. Their map is many-to-one (`1` = *t* or *d*, `6` = *j/sh/ch/g*, …), so encoding and decoding work against each other.

Agebon gives each digit **one unique onset**, and the [alphabet](../grammar/phonology.md#letter-names) starts with those ten letters in digit order. The mnemonic should be that map, not a parallel code. A number becomes a **root consonant skeleton**, and published roots become the pictures.

Every published root has a concrete seed, usually an emoji ([seeds](../meta/lexicon.md#seeds-concrete-senses-and-pictographs)). The seed is the one sense that pictures reliably, so **every peg is a root pictured as its seed**. The [root length](../meta/lexicon.md#root-length) policy fixes two shapes, three letters (`VCV`) and five letters (`VCVCV`). Those line up with 0–9 and 00–99 pegs.

## Goals

1. Fix a **1:1 digit ↔ onset** table identical to the spoken digit syllables.
2. Define **payload vs silent** letters, so role letters, endings, seams and fillers can't corrupt a PIN or phone chunk.
3. Encode by filling vowels into a root skeleton; decode by stripping back to onsets.
4. **Every digit comes from a root consonant.** Endings never carry a digit, so every scene is the root's seed.
5. Use **published** roots as shared images, chosen from the existing lexicon. The mnemonic never steers a root's spelling.

## Non-goals

- Changing how number words are **said**: `g+32` stays `gragodal`, not a root.
- A new CSV column, overlay, or numeric-derivation reading. (`ROOT` + **-l** / **-m** + number stem already means essence / grain / …; this channel doesn't.)
- Encoding sign, ordinal vs scalar, `.`, `e`, or `%` as extra letters. Those stay numeral grammar; chunk the digit string only.
- Mixing letter-name recitation (`ba` vs digit `bu`) into the peg. Names use the opposite vowel, and the mnemonic ignores vowels anyway.
- Changing [root length](../meta/lexicon.md#root-length). Which consonants a root may have second belongs to `root-tails.md`.
- Hand-picking root spellings. New roots come from `convert-word`, so a cell gains roots only when a seed happens to land there.
- A 000–999 bank. No root is longer than five letters. The optional [count layer](#count-layer) reaches three digits without one.

## The map

The same onsets as the respelled digit syllables in `number-respelling.md`:

| Digit | Onset | Syllable |
|-------|-------|----------|
| 1 | **b** | bu |
| 2 | **d** | da |
| 3 | **g** | go |
| 4 | **v** | ve |
| 5 | **z** | zu |
| 6 | **h** | ha |
| 7 | **l** | lo |
| 8 | **r** | re |
| 9 | **n** | nu |
| 0 | **m** | ma |

Vowels never encode a digit. The same skeleton with different vowels is the **same number**: `egule` *gold*, `ogoro` *guitar*, `ageda` *cutlery* and `ogemu` *cold* are all **32**. Use that freedom to pick a vivid picture; don't treat `u` / `a` / `o` / `e` as extra digits.

## Payload vs silent

**Payload** (left to right, **inside the root**): `b d g v z h l r n m`.

**Fillers:** `w` and `y`. They add a syllable without adding a digit. A five-letter root with one filler and one digit letter is a **one-onset** root (`erahe` *railway* → **r** → **8**). Roots never contain `x` or `th`.

**Always silent:**

- All vowels.
- The role letter, and the `l` of left-hanging `gl-`. The role letter changes a word's job, not what you picture: `zudozol` and `dudozol` are the same dog. It also has its own job in [person–action–object](#optional-person-action-object).
- **The ending** (**-l / -m / -n / -r**). Picture the seed whatever the ending: `zudozol` and `zudozom` are both the dog, **23**.
- Plural **-x**, name instance **-ln**, and the stand-in codas **-rl / -rm / -rth**.
- Mid-word **x** (compound seam) and mid-word **th** (stance seam).

So the role letter, the ending and every coda sit outside the root. Read only the root.

**Not pegs:** number words (a role letter followed directly by `r`), numeric-derivation words (join **-l** / **-m** followed by `r`), and pronouns. Read those as grammar.

### Dictionary compounds

A [dictionary compound](../grammar/x-compounds.md#lexical-compounds) is one stem: left root + join letter + head root. The join letter (**l / m / n / r**) **counts**: it is spelled and heard like any root letter, so decoding never needs to know where the seam is. `zobaholurahal` *bedroom* is **b d l r h** → **12786**.

A compound has three or more onsets, so it doesn't fit a fixed-length slot. Compounds are optional long pegs for a palace slot set to their own length. They aren't part of the canonical bank.

## Encode / decode

**Number → image**

1. Take the digit string (PIN, phone group, π chunk, year).
2. Cut it into 2-digit (or 1-digit) chunks, or 3-digit chunks with the [count layer](#count-layer).
3. For each chunk, pick a root whose digit consonants are those digits, in order: one for a 1-digit chunk, two for a 2-digit chunk.
4. Each word is one palace image, pictured as its seed. Glue with **x** if you want one spoken compound; the **x** only marks the cut.

**Image → number**

1. Drop the role letter (and `gl-`), the ending, plural **-x**, and the other codas.
2. Split on **x**; drop **th** seams.
3. Drop vowels and **w / y**, and read the remaining onsets as digits.

Decoding is unique. That is the gap in the English Major system this closes.

**The slot length checks the decode.** Every palace slot has a fixed length: **1** on the 0–9 list, **2** on the 00–99 list. Counting the ending, or a filler, gives one digit too many; dropping a root consonant gives one too few.

## Peg sizes

| Word shape | Payload | Peg |
|------------|---------|-----|
| 3 letters `VCV` (digit consonant), or 5 letters `VCVCV` with one filler (`w` / `y`) | 1 onset | **0–9** |
| 5 letters `VCVCV`, two digit letters | 2 onsets | **00–99** |
| Dictionary compound | 3–5 onsets | long chunk (optional) |

Three-letter roots with a filler consonant (`oye` *door*) and five-letter roots with two fillers (`oyevo` *yoyo*) carry no digit.

Phone-style groups already match how they're spoken (`555,123,4567`): one image per comma group, or 2-digit chunks with the 3-digit groups split 2+1.

**2381** → **23 | 81**: `zodegel` *ticket*, `zorebol` *ring*.

**5970** → **59 | 70**: `zezwedzerlandal` *Swiss flag*, `zolamal` *laugh*. A root's second consonant is its kind, so **59** is always a named root (a flag) with **z** first, and **70** a mind-and-feeling root with **l** first.

Don't encode the decimal point. Use two scenes (integer, then fraction) or two palace slots.

## Optional: person–action–object {#optional-person-action-object}

The same 00–99 pegs work here; the role letter picks the job, so no second map is needed:

- Person: `/z/`
- Action: `/v/`
- Object: `/d/` or `/b/`

Read the digits in the clause's default order (subject, object, verb), so six digits fill one locus:

> `zudozol derowol veyuyal.`
>
> z-dog | d-radio | v-kiss
>
> "The dog kisses a radio." → **23 82 35**

Each word is a two-onset root, so each fills two digits.

## Optional: count layer {#count-layer}

A three-digit chunk is a **count** plus a two-digit peg: **415** = four of the **15** peg (`obahe` *bus stop*).

- **Capacity:** 3 digits per image instead of 2.
- **Decoding:** the count is the first digit, and the peg reads as usual. On a three-digit list, a single item still counts as 1, so `162` is one item of peg 62, never the bare peg.
- **Speech:** the image is ordinary Agebon, a noun with a count. Plural **-x** stays silent, so `zobahelx` is still peg 15.

**Show the count as a hand shape, not as copies.** People take in up to about four items at a glance; five and more have to be counted, and a mental image is hard to count accurately. Zero copies can't be pictured at all. The finger code in `manual-phonology.md` gives every digit a count shape in alphabet order: runs of fingers for 1–4, the thumb for 5, thumb plus a run for 6–9, horns for 0. So the count becomes a hand held over the peg scene. That covers zero and the large counts with no special case. If the finger code stays unbuilt, use copies for 1–4 and a hand for the rest.

## Lexicon coverage {#lexicon-coverage}

Counts come from the published lexicon (2026-10-20, root tails live), read with the respelled map: **1420** roots.

### 0–9

**349** one-onset roots: the three-letter roots, plus the five-letter roots with one filler consonant, which under root tails are every tool (`w` second) and every person (`y` second):

| Digit | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0 |
|-------|---|---|---|---|---|---|---|---|---|---|
| Roots | 47 | 30 | 44 | 27 | 35 | 35 | 27 | 22 | 50 | 32 |

22 roots carry no digit.

### 00–99

**1049** two-onset roots. Roots per cell, all / flags (rows = first digit, columns = second digit, which is the root's kind):

| | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0 |
|---|---|---|---|---|---|---|---|---|---|---|
| **1** | 12/0 | 16/0 | 15/0 | 16/0 | 16/0 | 12/0 | 10/0 | 12/0 | 27/27 | 8/0 |
| **2** | 12/0 | 12/0 | 11/1 | 9/0 | 13/0 | 11/0 | 6/0 | 16/0 | 20/20 | 9/0 |
| **3** | 12/0 | 16/0 | 11/0 | 13/0 | 14/0 | 10/0 | 11/0 | 12/0 | 28/28 | 10/0 |
| **4** | 8/0 | 9/0 | 8/0 | 11/0 | 6/0 | 11/0 | 9/0 | 9/0 | 18/18 | 7/0 |
| **5** | 16/0 | 11/0 | 8/0 | 16/0 | 11/0 | 12/0 | 12/0 | 10/0 | 28/28 | 13/0 |
| **6** | 16/0 | 9/0 | 6/0 | 10/0 | 11/0 | 12/0 | 7/0 | 6/0 | 20/20 | 8/0 |
| **7** | 8/0 | 8/0 | 5/0 | 7/0 | 9/0 | 4/0 | 4/0 | 4/0 | 20/20 | 4/0 |
| **8** | 8/0 | 8/0 | 11/0 | 10/0 | 7/0 | 5/0 | 8/0 | 4/0 | 20/20 | 4/0 |
| **9** | 5/0 | 8/0 | 13/0 | 6/0 | 4/0 | 4/0 | 4/0 | 4/0 | 23/23 | 8/0 |
| **0** | 6/0 | 8/0 | 6/0 | 7/0 | 6/0 | 5/0 | 4/0 | 4/0 | 24/24 | 4/0 |

- **Every cell has a root.** The thinnest have four: 00, 70, 77, 80, 88, 95 and a few more in rows 7–0.
- **Column 9 is all flags** (a root with **n** second is a named root), so a cell ending in 9 has no non-flag peg. The canonical list's *never use names* rule can't hold there; it needs a decision ([open questions](#open-questions)).
- **71** of the 100 cells have a root in the `core` vocabulary column, so a canonical list can lean on words learners meet early.
- The filler pair `w` + `y` now takes two whole kinds (tools, people) out of the two-digit table. Whether those are still the right fillers is `number-respelling.md`'s call.

Working examples:

| Word | Payload | Digits |
|------|---------|--------|
| `zabedol` *pear* | b d | **12** |
| `zabolol` *plant* | b l | **17** |
| `zodegel` *ticket* | d g | **23** |
| `zagebol` *glasses* | g b | **31** |
| `zuvogal` *frame* | v g | **43** |
| `zezezal` *squirrel* | z z | **55** |
| `zohedal` *hotdog* | h d | **62** |
| `zagorul` *hourglass* | l r | **78** |
| `zorebol` *ring* | r b | **81** |
| `zaruvel` *run* | r v | **84** |
| `zanumul` *anxious* | n m | **90** |
| `zemamul` *melt* | m m | **00** |

### v1 usability bar {#v1-usability-bar}

1. **Publish a canonical 00–99 list:** one preferred word per cell, and **no root used twice** across the 0–9 and 00–99 lists. Prefer `core` roots, then roots whose seed is a concrete thing, then non-flag roots. Never use names.
2. **Keep the list retie-safe:** store the row (seed / sense), never the spelling, and derive the digits from the current root. A respelling can move a row to a different cell, so a check should flag any cell that empties.

## Open questions

1. **Where the canonical list lives.** A small `data/` peg file (row + digits + scene) keeps grammar pages free of a 100-row table. A grammar Advanced appendix is heavier for learners.
2. **Thin cells.** The thinnest cells hang on four roots, so a later respelling could thin them further. Accept that and let the check flag a cell that empties? Or let `convert-word` break near-ties toward nearly empty cells? The second fills them but breaks goal 5.
3. **Three-letter rows as pegs.** These rows also carry closed grammar overlays. Their seeds picture well (*map*, *anchor*, *knot*), but a learner may hear the overlay first. Should the canonical list prefer five-letter filler roots where a digit has enough?
4. **Count layer.** Adopt it, and if so, hand shapes for every count or copies for 1–4?
5. **Where to mention the method:** [numbers.md](../grammar/numbers.md) Beginner (one sentence plus a link), or Advanced / a sibling page after absorbing. The letter-name table already teaches the digit letters in order, which is a natural hook.
6. **Column 9.** Every root with **n** second is a flag, so the ten cells ending in 9 have only flag pegs. Allow flags there (they picture well), or treat 9 as a filler-like digit in second place?

## Absorb sketch

This isn't core-grammar morphology. If accepted, and after `number-respelling.md` and `root-tails.md` are absorbed:

- A short **optional** section, likely [numbers.md](../grammar/numbers.md) Intermediate or Advanced, or a sibling `docs/grammar/` page linked from numbers and the phonology letter names. It would cover the onset table, the silent letters, the fillers and the peg sizes.
- A **canonical 0–9 and 00–99** list kept next to the lexicon, keyed by row.
- Grammar pages stay free of this proposal until it is absorbed.

The blockers to absorbing are the two proposals it depends on and the canonical list, not lexicon size.

## Non-criteria

Implementation effort (a peg file, a peg picker in the dictionary UI, flashcards) isn't a reason to reject the map. The learner-facing tests:
- decoding is 1:1;
- role letters, endings and seams never count;
- every scene is the root's seed;
- 0–9 and every 00–99 cell can be filled from published roots.

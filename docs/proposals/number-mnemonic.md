# Proposal: digit-onset mnemonic (Major system)

**Status:** PROPOSED. **Depends on** two proposals:
- `number-respelling.md`: every map, table and example below uses the respelled digits (`b d g v z h l r n m` = 1–9, 0; fillers `w` and `y`). The current grammar's digits (`w d r m v g l h n z`) don't fit this design.
- `root-tails.md`: lifts the second-consonant ban, so a five-letter root may have **l / r / n / m** second, which fills every two-digit cell ending in 7, 8, 9 or 0. It also makes a root's second consonant name its kind, so each column of the 00–99 table fills from one kind (animals in column 5, foods in column 2).

This proposal can't be absorbed before both.  
**Related:** [numbers.md § Counts](../grammar/numbers.md#counts) (digit syllables); [phonology.md § letter names](../grammar/phonology.md#letter-names) (the alphabet opens with the ten digit letters in digit order); [phonology.md § phonotactics](../grammar/phonology.md#phonotactics) (word shape, endings, seams); [word-endings.md](../grammar/word-endings.md); [x-compounds.md § lexical compounds](../grammar/x-compounds.md#lexical-compounds); [lexicon editing § root length](../meta/lexicon.md#root-length) and [§ seeds](../meta/lexicon.md#seeds-concrete-senses-and-pictographs); [`data/lexicon-published.csv`](../../data/lexicon-published.csv); `manual-phonology.md` (count shapes for the optional count layer).  
**Design authority:** spoken number grammar is unchanged. This is an optional **memory channel** that reuses the digit onsets. It adds no morphology, no second digit table, and no [numeric-derivation](../grammar/numeric-derivation.md) reading.

## Motivation

English memory systems (Major / Herigone) turn digits into consonants, then add vowels to make picture-words. Their map is many-to-one (`1` = *t* or *d*, `6` = *j/sh/ch/g*, …), so encoding and decoding work against each other.

Agazan gives each digit **one unique onset**, and the [alphabet](../grammar/phonology.md#letter-names) starts with those ten letters in digit order. The mnemonic should be that map, not a parallel code. A number becomes a **root consonant skeleton**, and published roots become the pictures.

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

Vowels never encode a digit. The same skeleton with different vowels is the **same number**: `ogoda` *gold*, `egeda` *guitar*, `agade` *cutlery* and `ogode` *cold* are all **32**. Use that freedom to pick a vivid picture; don't treat `u` / `a` / `o` / `e` as extra digits.

## Payload vs silent

**Payload** (left to right, **inside the root**): `b d g v z h l r n m`.

**Fillers:** `w` and `y`. They add a syllable without adding a digit. A five-letter root with one filler and one digit letter is a **one-onset** root (`erewe` *railway* → **r** → **8**). Roots never contain `x` or `th`.

**Always silent:**

- All vowels.
- The role letter, and the `l` of left-hanging `gl-`. The role letter changes a word's job, not what you picture: `zodogal` and `dodogal` are the same dog. It also has its own job in [person–action–object](#optional-person-action-object).
- **The ending** (**-l / -m / -n / -r**). Picture the seed whatever the ending: `zodogal` and `zodogam` are both the dog, **23**.
- Plural **-x**, name instance **-ln**, and the stand-in codas **-rl / -rm / -rth**.
- Mid-word **x** (compound seam) and mid-word **th** (stance seam).

So the role letter, the ending and every coda sit outside the root. Read only the root.

**Not pegs:** number words (a role letter followed directly by `r`), numeric-derivation words (join **-l** / **-m** followed by `r`), and pronouns. Read those as grammar.

### Dictionary compounds

A [dictionary compound](../grammar/x-compounds.md#lexical-compounds) is one stem: left root + join letter + head root. The join letter (**l / m / n / r**) **counts**: it is spelled and heard like any root letter, so decoding never needs to know where the seam is. `zebedaluruhel` *bedroom* is **b d l r h** → **12786**.

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

Three-letter roots with a filler consonant (`oye` *door*) and five-letter roots with two fillers (`oyoyo` *yoyo*) carry no digit.

Phone-style groups already match how they're spoken (`555,123,4567`): one image per comma group, or 2-digit chunks with the 3-digit groups split 2+1.

**2381** → **23 | 81**: `zodogal` *dog*, `zarabal` *rabbit*.

**5970** → **59 | 70**. Neither cell has a root today. Under `root-tails.md`, a root's second consonant is its kind, so **59** is a named root (a flag) with **z** first, and **70** is a mind-and-feeling root with **l** first. Which rows land there is up to placement.

Don't encode the decimal point. Use two scenes (integer, then fraction) or two palace slots.

## Optional: person–action–object {#optional-person-action-object}

The same 00–99 pegs work here; the role letter picks the job, so no second map is needed:

- Person: `/z/`
- Action: `/v/`
- Object: `/d/` or `/b/`

Read the digits in the clause's default order (subject, object, verb), so six digits fill one locus:

> `zodogal deredel vegezal.`
>
> z-dog | d-radio | v-kiss
>
> "The dog kisses a radio." → **23 82 35**

Each word is a two-onset root, so each fills two digits.

## Optional: count layer {#count-layer}

A three-digit chunk is a **count** plus a two-digit peg: **415** = four of the **15** peg (`abaza` *bus stop*).

- **Capacity:** 3 digits per image instead of 2.
- **Decoding:** the count is the first digit, and the peg reads as usual. On a three-digit list, a single item still counts as 1, so `162` is one item of peg 62, never the bare peg.
- **Speech:** the image is ordinary Agazan, a noun with a count. Plural **-x** stays silent, so `zabazalx` is still peg 15.

**Show the count as a hand shape, not as copies.** People take in up to about four items at a glance; five and more have to be counted, and a mental image is hard to count accurately. Zero copies can't be pictured at all. The finger code in `manual-phonology.md` gives every digit a count shape in alphabet order: runs of fingers for 1–4, the thumb for 5, thumb plus a run for 6–9, horns for 0. So the count becomes a hand held over the peg scene. That covers zero and the large counts with no special case. If the finger code stays unbuilt, use copies for 1–4 and a hand for the rest.

## Lexicon coverage {#lexicon-coverage}

Counts come from a simulated re-placement under today's English-echo placement (2026-10-19, second-consonant ban lifted, hook-compound rule on), read with the respelled map: **1420** roots. `root-tails.md` replaces that placement, so every table and example in this section needs a rerun once it is absorbed. Flag roots (country and regional flags) count toward coverage; the canonical list prefers other roots where a cell has them.

### 0–9

**164** one-onset roots:

| Digit | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0 |
|-------|---|---|---|---|---|---|---|---|---|---|
| Roots | 19 | 14 | 28 | 9 | 24 | 11 | 10 | 12 | 21 | 16 |

Nine roots carry no digit.

### 00–99

**1247** two-onset roots. Roots per cell, all / flags (rows = first digit, columns = second digit):

| | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0 |
|---|---|---|---|---|---|---|---|---|---|---|
| **1** | 12/1 | 23/2 | 26/3 | 13/4 | 24/6 | 22/2 | 16/0 | 36/4 | 36/6 | 5/1 |
| **2** | 11/0 | 7/0 | 17/5 | 9/1 | 11/1 | 13/1 | 9/3 | 29/1 | 16/3 | 10/2 |
| **3** | 16/4 | 14/2 | 16/3 | 8/0 | 20/3 | 11/1 | 12/0 | 43/4 | 22/10 | 11/4 |
| **4** | 3/2 | 10/1 | 13/2 | 2/0 | 9/0 | 10/1 | 15/1 | 18/4 | 18/5 | 8/0 |
| **5** | 22/5 | 28/6 | 35/2 | 13/6 | 7/0 | 11/5 | 10/1 | 9/6 | 30/6 | 6/3 |
| **6** | 14/4 | 16/3 | 15/3 | 7/0 | 12/1 | 12/1 | 10/1 | 19/1 | 13/3 | 5/1 |
| **7** | 16/4 | 12/3 | 8/2 | 13/0 | 6/4 | 5/2 | 4/0 | 1/0 | 21/13 | 3/0 |
| **8** | 9/1 | 10/2 | 9/1 | 1/0 | 16/0 | 8/1 | 5/0 | 1/0 | 12/2 | 5/2 |
| **9** | 5/1 | 18/4 | 9/4 | 6/1 | 7/1 | 10/3 | 4/0 | 6/4 | 4/2 | 4/1 |
| **0** | 4/0 | 15/4 | 14/6 | 4/0 | 10/1 | 4/0 | 9/4 | 9/4 | 18/5 | 4/0 |

- **Every cell has a root.** The thinnest are **78**, **84** and **88** (one root each) and **44** (two). Cells with fewer than 3 non-flag roots: 41, 44, 75, 78, 84, 88, 98, 99.
- **68** of the 100 cells have a root in the `core` vocabulary column, so a canonical list can lean on words learners meet early.
- `y` is the rarest root letter and `w` the next rarest, which is why they are the fillers. Of the 66 possible filler pairs, only `w` + `y` leaves no cell empty.

Working examples (current spellings that the simulated re-placement keeps):

| Word | Payload | Digits |
|------|---------|--------|
| `zebedal` *bed* | b d | **12** |
| `zodogal` *dog* | d g | **23** |
| `zegabal` *eggplant* | g b | **31** |
| `zavagel` *factory* | v g | **43** |
| `zozazol` *saw* | z z | **55** |
| `zehedal` *head* | h d | **62** |
| `zarabal` *rabbit* | r b | **81** |
| `zerevel` *refresh* | r v | **84** |

The cells ending in 7, 8, 9 and 0 have no roots until `root-tails.md` is absorbed. From the echo-placement simulation: 🍽️ *plate* (**17**), 🦣 *mammoth* (**00**), ⏰ *alarm clock* (**78**), ℹ️ *information* (**90**).

### v1 usability bar {#v1-usability-bar}

1. **Publish a canonical 00–99 list:** one preferred word per cell, and **no root used twice** across the 0–9 and 00–99 lists. Prefer `core` roots, then roots whose seed is a concrete thing, then non-flag roots. Never use names.
2. **Keep the list retie-safe:** store the row (seed / sense), never the spelling, and derive the digits from the current root. A respelling can move a row to a different cell, so a check should flag any cell that empties.

## Open questions

1. **Where the canonical list lives.** A small `data/` peg file (row + digits + scene) keeps grammar pages free of a 100-row table. A grammar Advanced appendix is heavier for learners.
2. **Thin cells.** 78, 84 and 88 each hang on one root, so a later respelling could empty them. Accept that and let the check flag it? Or let `convert-word` break near-ties toward nearly empty cells? The second fills them but breaks goal 5.
3. **Three-letter rows as pegs.** These rows also carry closed grammar overlays. Their seeds picture well (*map*, *anchor*, *knot*), but a learner may hear the overlay first. Should the canonical list prefer five-letter filler roots where a digit has enough?
4. **Count layer.** Adopt it, and if so, hand shapes for every count or copies for 1–4?
5. **Where to mention the method:** [numbers.md](../grammar/numbers.md) Beginner (one sentence plus a link), or Advanced / a sibling page after absorbing. The letter-name table already teaches the digit letters in order, which is a natural hook.

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

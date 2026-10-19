# Proposal: digit-onset mnemonic (Major system)

**Status:** PROPOSED  
**Related:** [numbers.md § Counts](../grammar/numbers.md#counts) (digit syllables); [phonology.md § letter names](../grammar/phonology.md#letter-names) (the alphabet opens with the ten digit letters in digit order; names use the opposite vowel); [phonology.md § phonotactics](../grammar/phonology.md#phonotactics) (word shape, endings, seams); [word-endings.md](../grammar/word-endings.md); [x-compounds.md § lexical compounds](../grammar/x-compounds.md#lexical-compounds); [lexicon editing § root length](../meta/lexicon.md#root-length) and [§ second consonant](../meta/lexicon.md#second-consonant); [`data/lexicon-published.csv`](../../data/lexicon-published.csv)  
**Design authority:** spoken number grammar is unchanged. This is an optional **memory channel** that reuses the existing digit onsets. It does not add morphology, a second digit table, or a [numeric-derivation](../grammar/numeric-derivation.md) reading.

## Motivation

English memory systems (Major / Herigone) turn digits into consonants, then fill vowels to make picture-words. The map is many-to-one (`1` = *t* or *d*, `6` = *j/sh/ch/g*, …), so encode and decode fight each other.

Agazan already assigns **one unique onset per digit**, and the [alphabet](../grammar/phonology.md#letter-names) already starts with those ten letters in digit order (`w d r m v g l h n z` = 1–9, 0). The mnemonic should be that map, not a parallel code. A number becomes a **root consonant skeleton**, and published roots become the pictures.

Every published root has a concrete seed (usually an emoji), so most roots are already picturable. The [root length](../meta/lexicon.md#root-length) policy fixes two shapes, three letters (`VCV`) and five letters (`VCVCV`), which line up with 0–9 and 00–99 pegs.

One gap is structural: no five-letter root has **l / m / n / r** as its second consonant ([second consonant](../meta/lexicon.md#second-consonant)), so no root ends in digit 7, 4, 9 or 3. Those four letters are exactly the four [word endings](../grammar/word-endings.md). The ending supplies the missing digit, so the existing lexicon covers every 00–99 cell but one ([second digit from the ending](#second-digit-from-the-ending)).

## Goals

1. Fix a **1:1 digit ↔ onset** table identical to the spoken digit syllables.
2. Define **payload vs silent** letters so role letters, seams and fillers cannot corrupt a PIN or phone chunk.
3. Encode by filling vowels into a root skeleton; decode by stripping back to onsets.
4. Treat **one-onset** roots as 0–9 pegs, and **two-onset** roots or **one-onset roots plus ending** as **00–99** pegs.
5. Use **published** roots as shared images, chosen from the existing lexicon. The mnemonic never steers a root's spelling.

## Non-goals

- Changing how number words are **said** (`g+62` stays `gragudul`, not `agadu`).
- A new CSV column, overlay, or numeric-derivation reading (`ROOT` + **-l** / **-m** + number stem already means essence / grain / …; this channel does not).
- Encoding sign, ordinal vs scalar, `.`, `e`, or `%` as extra letters. Those stay numeral grammar; chunk the digit string only.
- Mixing letter-name recitation (`we` vs digit `wo`) into the peg. Names already use the opposite vowel, and the mnemonic ignores vowels anyway.
- Changing [root length](../meta/lexicon.md#root-length) or the [second-consonant](../meta/lexicon.md#second-consonant) ban. Pegs use the roots that exist.
- Hand-picking root spellings. New roots come from `convert-word`, so a two-onset cell fills only when a seed happens to land there.
- A 000–999 bank. No root is longer than five letters; [dictionary compounds](#dictionary-compounds) are the only longer stems.

## The map

Same onsets as [digit syllables](../grammar/numbers.md#counts):

| Digit | Onset | Syllable |
|-------|--------|----------|
| 1 | **w** | wo |
| 2 | **d** | du |
| 3 | **r** | re |
| 4 | **m** | mo |
| 5 | **v** | va |
| 6 | **g** | gu |
| 7 | **l** | le |
| 8 | **h** | ha |
| 9 | **n** | na |
| 0 | **z** | zo |

Vowels never encode a digit. The same skeleton with different vowels is the **same number**: `agadu` *cat*, `agoda` *goat*, `agodo` *carrot* and `egeda` *guitar* are all **62**. Use that freedom to pick a vivid picture; do not treat `u` / `a` / `o` / `e` as extra digits.

## Payload vs silent

**Payload** (left to right, **inside the stem**): `w d r m v g l h n z`.

**Fillers:** `b` and `y`. They add a syllable without adding a digit. A five-letter root with one filler and one digit letter is a **one-onset** root (`araba` *rabbit* → **r** → **3**). Roots never contain `x` or `th`.

**Always ignore**

- All vowels
- The role letter, and the `l` of left-hanging `gl-`
- Plural **-x**, name instance **-ln**, and stand-in codas **-rl / -rm / -rth**
- Mid-word **x** (compound seam) and mid-word **th** (stance seam)

**The ending** (**-l / -m / -n / -r**) is silent except in one case: on the **00–99 list**, a **one-onset** stem reads its ending as the second digit ([below](#second-digit-from-the-ending)). On the 0–9 list, and on any two-onset stem, the ending is always silent.

Citation `zagadul` (*cat*): role letter `z` and ending `-l` are silent; payload **g d** → **62**. Plural `zagadulx` is still **62**.

**Not pegs:** number words (a role letter followed directly by `r`), numeric-derivation words (join **-l** / **-m** followed by `r`), and pronouns. Read those as grammar.

### Second digit from the ending

The four endings are the four digits a root cannot end in:

| Ending | Digit | Scene |
|--------|-------|-------|
| **-l** | **7** | the thing itself (concrete sense) |
| **-m** | **4** | the root's abstract sense |
| **-n** | **9** | a character with that name |
| **-r** | **3** | the same thing again (a repeat) |

So a one-onset root fills the four cells of its digit. With `ega` *egg* (**6**):

| Word | Scene | Digits |
|------|-------|--------|
| `zegal` | an egg | **67** |
| `zegam` | potential (egg's abstract sense) | **64** |
| `zegan` | someone named Egg | **69** |
| `zegar` | that egg again | **63** |

The ending cells (second digit 3, 4, 7, 9) and the two-onset cells (second digit 1, 2, 5, 6, 8, 0) never overlap, so decode stays unique once you know which list a palace slot uses. Only the four plain endings count; a peg on the 00–99 list never uses `-ln`, `-rl`, `-rm` or `-rth`. A word that the grammar reads as something else is not a peg: `ozo` *strawberry* + **-n** / **-r** is the [topic pronoun](../grammar/pronouns.md), so pick another zero root for **09** and **03**.

**Backup:** a learner who skips the ending rule splits these cells into two 0–9 pegs (`ura` + `ama` for **34**). This costs a second image per chunk. The same split covers **41**, the one two-onset cell with no usable root ([coverage](#lexicon-coverage)).

### Dictionary compounds

A [dictionary compound](../grammar/x-compounds.md#lexical-compounds) is one stem: left root + join letter + head root. The join letter (**l / m / n / r**) **counts**: it is spelled and heard like any root letter, so decoding never needs to know where the seam is. `zebedaluruhel` *bedroom*: `b` filler, then **d l r h** → **2738**. A compound always has at least two onsets, so its ending never counts. Compounds are optional long pegs, not part of the canonical bank.

## Encode / decode

**Number → image**

1. Take the digit string (PIN, phone group, π chunk, year).
2. Cut it into 2-digit (or 1-digit) chunks.
3. For a 2-digit chunk whose second digit is 1, 2, 5, 6, 8 or 0, find a root with that **exact** two-onset payload. For a second digit of 3, 4, 7 or 9, take a one-onset root for the first digit and add the ending for the second.
4. Each word is one palace image. Glue with **x** if you want one spoken compound; **x** is only the cut.

**Image → number**

1. Drop the role letter (and `gl-`), plural **-x**, and the other codas. Note the ending.
2. Split on **x**; drop **th** seams.
3. Drop vowels and **b / y**, and read the remaining onsets as digits.
4. On the 00–99 list, if only one digit is left, add the ending's digit.

Decode is unique. That is the English Major-system gap this closes.

## Peg sizes

| Word shape | Payload | Peg | Published (snapshot below) |
|------------|---------|-----|-----------|
| 3 letters `VCV` (digit consonant) | 1 onset | **0–9** | 59 roots; every digit |
| 5 letters `VCVCV` with one filler (`b` / `y`) | 1 onset | **0–9** | 386 roots; every digit |
| either of the above + ending | 1 onset + ending | **00–99**, second digit 3 / 4 / 7 / 9 | 445 roots; all 40 cells |
| 5 letters `VCVCV`, two digit letters | 2 onsets | **00–99**, second digit 1 / 2 / 5 / 6 / 8 / 0 | 922 roots; 59 of 60 cells |
| Dictionary compound | 2–5 onsets | long chunk (optional) | not counted |

Three-letter roots with a filler consonant (`obe` *person*, `oye` *door*) and five-letter roots with two fillers carry no digit.

Phone-style groups already match spoken labels (`555,123,4567`): one image per comma-group, or 2+2+3 on the 00–99 list.

**314159** → **31 | 41 | 59**: `zerewel` *railway* (**31**), a split for **41** (`zewal` *ear* + `zamal` *map*), and `zavabon` *someone named Vampire* (**59**, `avabo` *vampire* + **-n**).

Do not encode the decimal point. Use two scenes (integer, then fraction) or two palace slots.

## Optional person–action–object

Same 00–99 pegs; the role letter picks the job, so no second map is needed:

- Person: `/z/`, or a name with **-n**
- Action: `/v/`
- Object: `/d/` or `/b/`

Read the digits in the clause's default order (subject, object, verb), so six digits fill one locus:

> `zagadul dahadal vevegal.`
>
> z-cat | d-hand | v-think
>
> "The cat thinks about a hand." → **62 82 56**

A one-onset word in a clause still reads its ending as the second digit, so `zegal` as the subject is **67**.

## Lexicon coverage {#lexicon-coverage}

Snapshot of [`lexicon-published.csv`](../../data/lexicon-published.csv) on 2026-10-19: **1418** roots (69 three-letter, 1349 five-letter). Payload = digit onsets only.

### 0–9 and the ending cells

The same one-onset roots serve as 0–9 pegs and, with an ending, fill the 40 ending cells. **-l**, **-n** and **-r** work on any root; **-m** needs a root with an abstract sense.

| Digit | Three-letter roots | Five-letter filler roots | With an abstract sense (for **-m**) |
|-------|--------------------|--------------------------|----|
| 1 | 4 (`ewa` *ear*, `uwu` *wood*) | 20 | 18 |
| 2 | 7 (`ado` *lightbulb*, `udu` *tube*) | 62 | 54 |
| 3 | 2 (`ura` *bookmark*, `ere` *record*) | 14 (`araba` *rabbit*, `oroba` *robot*) | 13 |
| 4 | 7 (`ama` *map*, `umu` *mirror*) | 9 | 14 |
| 5 | 4 (`ave` *wall*, `avo` *theater*) | 47 | 34 |
| 6 | 9 (`ega` *egg*, `ugo` *coin*) | 81 | 76 |
| 7 | 3 (`ulo` *tool*, `ele` *letters*) | 16 (`elebe` *leopard*, `alabe` *lobster*) | 17 |
| 8 | 10 (`aho` *heart*, `ahe` *jar*) | 63 | 61 |
| 9 | 5 (`ana` *knot*, `ano` *sand*) | 8 (`anaya` *onion*, `anaba` *knob*) | 12 |
| 0 | 8 (`ezo` *zebra*, `ozo` *strawberry*) | 66 | 63 |

Every digit has at least 13 one-onset roots, so 0–9 and all 40 ending cells are covered today with no lexicon growth.

### Two-onset cells

Non-flag roots per cell (rows = first digit, columns = second digit). The other 40 cells are the ending cells above.

| | 1 | 2 | 5 | 6 | 8 | 0 |
|---|---|---|---|---|---|---|
| **1** | 4 | 8 | 4 | 3 | 7 | 7 |
| **2** | 6 | 17 | 15 | 18 | 19 | 17 |
| **3** | 2 | 12 | 5 | 8 | 14 | 19 |
| **4** | **0** | 13 | 10 | 13 | 11 | 9 |
| **5** | 8 | 16 | 14 | 17 | 15 | 10 |
| **6** | 12 | 29 | 16 | 22 | 20 | 23 |
| **7** | 1 | 13 | 13 | 9 | 11 | 3 |
| **8** | 8 | 17 | 12 | 15 | 20 | 16 |
| **9** | 1 | 15 | 9 | 7 | 12 | 6 |
| **0** | 10 | 24 | 15 | 39 | 15 | 12 |

- **41** has only flag roots (`amawa`, `amawe`). It is the one 00–99 cell with no usable picture; it uses the backup split until a seed lands on `m_w`.
- **71** and **91** have one non-flag root each; **31**, **16** and **70** have two or three.
- **176** of the 922 two-onset roots are flags: weak scenes, excluded from the canonical list.
- **48** cells already have a root in the `core` vocabulary column, so a canonical list can lean on words learners meet early.

Working examples (illustration, not the canonical list):

| Word | Payload | Digits |
|------|---------|--------|
| `zagadul` *cat* | g d | **62** |
| `zazazal` *sunrise* | z z | **00** |
| `zodogal` *dog* | d g | **26** |
| `zavahel` *fire* | v h | **58** |
| `zahadal` *hand* | h d | **82** |
| `zarabal` *rabbit* | r + **-l** | **37** |
| `zegam` *potential* | g + **-m** | **64** |
| `zavabon` *someone named Vampire* | v + **-n** | **59** |
| `zorobar` *that robot again* | r + **-r** | **33** |

### v1 usability bar

1. **Publish a canonical 00–99 list**: one preferred word per cell. For two-onset cells, prefer `core` roots, then concrete nouns over abstract senses; never flags or names. For ending cells, prefer roots whose abstract sense pictures well (for **-m**).
2. **Cover 41** with the backup split until a seed lands on `m_w`.
3. **Keep the list retie-safe**: store the row (seed / sense), never the spelling, and derive digits from the current root. A respelling can move a row to a different cell, so a check should flag any cell that empties.

## Open questions

1. **One root or four per first digit in the ending cells.** One root per digit (`zegal`, `zegam`, `zegan`, `zegar`) makes the ending cells easy to learn, but four scenes of one picture may blur together in a palace. Four different roots keep images distinct.
2. **Canonical list location.** A small `data/` peg file (row + digits + scene) keeps grammar pages free of a 100-row table; a grammar Advanced appendix is heavier for learners.
3. **Three-letter rows as pegs.** These rows also carry closed grammar overlays. Their seeds picture well (*egg*, *map*, *heart*), but a learner may hear the overlay first. Should the canonical list prefer five-letter filler roots?
4. **Names and flags.** Exclude country / flag roots and other proper-name senses from the canonical list (weak scenes, easy to confuse with spelling). The **-n** ending cells are the exception: there the name is the scene.
5. **Where to mention the method:** [numbers.md](../grammar/numbers.md) Beginner (one sentence plus a link), or Advanced / a sibling page after absorb. The letter-name table already teaches the digit letters in order, which is a natural hook.

## Absorb sketch

Not a core-grammar morph. If accepted:

- A short **optional** section (likely [numbers.md](../grammar/numbers.md) Intermediate or Advanced, or a sibling `docs/grammar/` page linked from numbers and phonology letter names) with the onset table, the silent letters, the ending rule, fillers, and the peg sizes.
- A **canonical 0–9 and 00–99** list maintained next to the lexicon, keyed by row.
- Grammar pages stay free of this proposal until absorb.

The absorb blocker is the canonical list, not lexicon size.

## Non-criteria

Implementation effort (a peg file, a peg picker in the dictionary UI, flashcards) is not a reason to reject the map. Learner-facing tests: 1:1 decode, role letters and seams never counted, the ending counted only on a one-onset stem on the 00–99 list, and 0–9 and every 00–99 cell but **41** fillable from published roots without leaning on flags.

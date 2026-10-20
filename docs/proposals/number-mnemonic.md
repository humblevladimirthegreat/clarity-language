# Proposal: digit-onset mnemonic (Major system)

**Status:** PROPOSED. Every map, table and example below uses the [digit syllables](../grammar/numbers.md#counts) (`b d g v z h l r n m` = 1–9, 0; fillers `w` and `y`).

Root tails are live ([lexicon editing § root tails](../meta/lexicon.md#root-tails)): a five-letter root may have any consonant second, so every two-digit cell has roots. A root's second consonant names its kind, so each column of the 00–99 table fills from one kind (foods in column 2, animals in column 5, titles in column 9). Tools and people (`w`, `y` second) are one-digit pegs: the kind letter is a filler, and the first consonant is the digit.

**Related:** [numbers.md § Counts](../grammar/numbers.md#counts) (digit syllables); [phonology.md § letter names](../grammar/phonology.md#letter-names) (the alphabet opens with the ten digit letters in digit order); [phonology.md § phonotactics](../grammar/phonology.md#phonotactics) (word shape, endings, seams); [word-endings.md](../grammar/word-endings.md); [compounds.md § lexical compounds](../grammar/compounds.md#lexical-compounds); [lexicon editing § root length](../meta/lexicon.md#root-length) and [§ seeds](../meta/lexicon.md#seeds-concrete-senses-and-pictographs); [`data/lexicon-published.csv`](../../data/lexicon-published.csv); `manual-phonology.md` (count shapes for the optional count layer).  
**Design authority:** spoken number grammar is unchanged. This is an optional **memory channel** that reuses the digit onsets. It adds no morphology, no second digit table, and no [numeric-derivation](../grammar/numeric-derivation.md) reading. Absorb it as a **converter**, not as a 100-row table on a grammar page.

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
6. Ship a **tool** that does both directions: a digit string yields suggested pegs, and a word or scene yields the digits.

## Non-goals

- Changing how number words are **said**: `g+32` stays `gragodal`, not a root.
- A new CSV column, overlay, or numeric-derivation reading. (`ROOT` + **-l** / **-m** + number stem already means essence / grain / …; this channel doesn't.)
- Encoding sign, ordinal vs scalar, `.`, `e`, or `%` as extra letters. Those stay numeral grammar; chunk the digit string only.
- Mixing letter-name recitation (`ba` vs digit `bu`) into the peg. Names use the opposite vowel, and the mnemonic ignores vowels anyway.
- Changing [root length](../meta/lexicon.md#root-length). Which consonants a root may have second belongs to [root tails](../meta/lexicon.md#root-tails).
- Hand-picking root spellings. New roots come from `convert-word`, so a cell gains roots only when a seed happens to land there.
- A 000–999 bank. No root is longer than five letters. The optional [count layer](#count-layer) reaches three digits without one.

## The map

The same onsets as the [digit syllables](../grammar/numbers.md#counts):

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

Vowels never encode a digit. The same skeleton with different vowels is the **same number**: `ageda` *cutlery*, `agedo` *croissant*, `ogoda` *coconut* and `ugedo` *cookie* are all **32**. Use that freedom to pick a vivid picture; don't treat `u` / `a` / `o` / `e` as extra digits.

## Payload vs silent

**Payload** (left to right, **inside the root**): `b d g v z h l r n m`.

**Fillers:** `w` and `y`. They add a syllable without adding a digit. A five-letter root with one filler and one digit letter is a **one-onset** root (`erowo` *radio* → drop `w` → **r** → **8**; `anewu` *knife* → **n** → **9**). Roots never contain `x` or `th`.

**Always silent:**

- All vowels.
- The role letter, and the `l` of left-hanging `gl-`. The role letter changes a word's job, not what you picture: `zudozol` and `dudozol` are the same dog. It also has its own job in [person–action–object](#optional-person-action-object).
- **The ending** (**-l / -m / -n / -r**). Picture the seed whatever the ending: `zudozol` and `zudozom` are both the dog, **25**.
- Plural **-x**, name instance **-ln**, and the stand-in codas **-rl / -rm / -rth**.
- Mid-word **x** (compound seam) and mid-word **th** (stance seam).

So the role letter, the ending and every coda sit outside the root. Read only the root.

**Not pegs:** number words (a role letter followed directly by `r`), numeric-derivation words (join **-l** / **-m** followed by `r`), and pronouns. Read those as grammar.

### Dictionary compounds

A [dictionary compound](../grammar/compounds.md#lexical-compounds) is one stem: left root + join letter + head root. The join letter (**l / m / n / r**) **counts**: it is spelled and heard like any root letter, so decoding never needs to know where the seam is. `oholebora` *doorbell* is **h l b r** → **6718**.

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

## The tool {#the-tool}

Absorb this as a converter (CLI, and the same logic in the dictionary UI if it has a home there). Grammar pages teach the map in a short optional section; they do not host the bank.

**Number → suggestions.** The input is a digit string (PIN, phone group, year). The tool chunks it (2+1 for a three-digit group, or the [count layer](#count-layer) if that is on), and for each chunk lists published roots whose payload is those digits. Rank `core` first, then a concrete seed, then the rest. Titles are allowed; country-name place roots are not. Show the seed (emoji) and the English concrete, so the learner can pick a picture. Do not pick one canonical word unless the user asks for a default scene.

**Word → number.** The input is one Agebon word, or a short scene (`zudozol dabedol varuvel`). Strip silent letters as in [Image → number](#encode--decode) and print the digits. A number word, a pronoun, or a digitless root (both consonants fillers) is not a peg: say so, rather than guessing.

The ranking lives in the tool, derived from the live lexicon each run. Store no spelling column. A respelling that empties a cell is a check failure the tool can print.

## Peg sizes

| Word shape | Payload | Peg |
|------------|---------|-----|
| 3 letters `VCV` (digit consonant), or 5 letters `VCVCV` with one filler (`w` / `y`) | 1 onset | **0–9** |
| 5 letters `VCVCV`, two digit letters | 2 onsets | **00–99** |
| Dictionary compound | 3–5 onsets | long chunk (optional) |

Three-letter people and tools (`awu` *anchor*, `ewa` *present*) and five-letter roots with two fillers (`oyayu` *ogre*, `eyuya` *kiss*) carry no digit. A three-letter place such as `oho` *door* still encodes **6**, because `h` is a digit.

Phone-style groups already match how they're spoken (`555,123,4567`): one image per comma group, or 2-digit chunks with the 3-digit groups split 2+1.

**2381** → **23 | 81**: `zudugul` *triangle*, `zorebol` *ring*.

**5970** → **59 | 70**: `zazunal` *soccer*, `zulamal` *laugh*. A root's second consonant is its kind, so **59** is always a title with **z** first, and **70** a mind-and-feeling root with **l** first.

Don't encode the decimal point. Use two scenes (integer, then fraction) or two palace slots.

## Optional: person–action–object {#optional-person-action-object}

The same 00–99 pegs work here; the role letter picks the job, so no second map is needed:

- Person: `/z/`
- Action: `/v/`
- Object: `/d/` or `/b/`

Read the digits in the clause's default order (subject, object, verb), so six digits fill one locus:

> `zudozol dabedol varuvel.`
>
> z-dog | d-pear | v-run
>
> "The dog runs a pear." → **25 12 84**

Each word is a two-onset root, so each fills two digits. Person-kind verbs such as *kiss* (`eyuya`) are filler-only and cannot fill a two-digit slot; pick a doing root.

## Optional: count layer {#count-layer}

A three-digit chunk is a **count** plus a two-digit peg: **415** = four of the **15** peg (`ebazu` *bear*).

- **Capacity:** 3 digits per image instead of 2.
- **Decoding:** the count is the first digit, and the peg reads as usual. On a three-digit list, a single item still counts as 1, so `162` is one item of peg 62, never the bare peg.
- **Speech:** the image is ordinary Agebon, a noun with a count. Plural **-x** stays silent, so `zebazulx` is still peg 15.

**Show the count as a hand shape, not as copies.** People take in up to about four items at a glance; five and more have to be counted, and a mental image is hard to count accurately. Zero copies can't be pictured at all. The finger code in `manual-phonology.md` gives every digit a count shape in alphabet order: runs of fingers for 1–4, the thumb for 5, thumb plus a run for 6–9, horns for 0. So the count becomes a hand held over the peg scene. That covers zero and the large counts with no special case. If the finger code stays unbuilt, use copies for 1–4 and a hand for the rest.

## Lexicon coverage {#lexicon-coverage}

Counts come from the published lexicon (2026-10-20, root tails and `title` live), read with the respelled map: **1420** roots, of which **1158** ordinary three- and five-letter roots and **262** place-name flags (not in the 0–9 or 00–99 banks).

### 0–9

**308** one-onset roots. A five-letter person or tool is in this bank when its **first** consonant is a digit: drop the kind letter (`y` / `w`), and that onset is the digit (`onayo` *nerd* → **9**, `anewu` *knife* → **9**). So are three-letter roots whose kind letter is a digit, and five-letter roots whose first consonant is a filler and whose kind is a digit.

| Digit | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0 |
|-------|---|---|---|---|---|---|---|---|---|---|
| Roots | 47 | 30 | 41 | 27 | 28 | 32 | 30 | 27 | 19 | 27 |

**31** roots carry no digit: 15 three-letter people and tools, and 16 five-letter roots whose both consonants are fillers.

People and tools are **not** digitless as a class. Only the kind letter is silent.

### 00–99

**819** two-onset roots. Roots per cell, all / titles (rows = first digit, columns = second digit, which is the root's kind):

| | 1 b body | 2 d food | 3 g sign | 4 v doing | 5 z creature | 6 h place | 7 l nature | 8 r counting | 9 n title | 0 m mind |
|---|---|---|---|---|---|---|---|---|---|---|
| **1** | 12/0 | 16/0 | 11/0 | 13/0 | 16/0 | 12/0 | 12/0 | 12/0 | 10/10 | 8/0 |
| **2** | 12/0 | 12/0 | 5/0 | 8/0 | 12/0 | 11/0 | 6/0 | 14/0 | 7/7 | 9/0 |
| **3** | 13/0 | 15/0 | 10/0 | 10/0 | 14/0 | 10/0 | 12/0 | 12/0 | 4/4 | 10/0 |
| **4** | 8/0 | 9/0 | 6/0 | 7/0 | 6/0 | 11/0 | 8/0 | 9/0 | 6/6 | 7/0 |
| **5** | 15/0 | 11/0 | 8/0 | 11/0 | 11/0 | 12/0 | 12/0 | 10/0 | 5/5 | 13/0 |
| **6** | 14/0 | 9/0 | 6/0 | 7/0 | 11/0 | 12/0 | 7/0 | 6/0 | 3/3 | 8/0 |
| **7** | 8/0 | 8/0 | **2**/0 | 5/0 | 9/0 | 4/0 | 4/0 | 4/0 | 4/4 | 4/0 |
| **8** | 8/0 | 7/0 | 8/0 | 6/0 | 7/0 | 5/0 | 7/0 | 4/0 | 7/7 | 4/0 |
| **9** | 6/0 | 8/0 | 8/0 | 4/0 | 5/0 | 4/0 | 4/0 | 5/0 | 7/7 | 8/0 |
| **0** | 7/0 | 8/0 | 5/0 | 3/0 | 6/0 | 5/0 | 4/0 | 4/0 | 3/3 | 4/0 |

- **Every cell has a root.** The thinnest is **73** (two signs). Three others have three: **69**, **04**, **09**.
- **Column 9 is all titles** (mail, paper, labels, named sports), not country flags. Flags are place-name roots with clusters and extra letters; they are optional long pegs, not 00–99 cells. A flag can decode to two digits if stripping `w` / `y` happens to leave two payload letters; do not put those on the canonical list.
- **75** of the 100 cells have a root in the `core` vocabulary column, so a canonical list can lean on words learners meet early.
- Fillers `w` + `y` take tools and people out of this table and put them on 0–9.

Working examples:

| Word | Payload | Digits |
|------|---------|--------|
| `zabedol` *pear* | b d | **12** |
| `zobolol` *plant* | b l | **17** |
| `zudugul` *triangle* | d g | **23** |
| `zudenel` *ticket* | d n | **29** |
| `zagebol` *glasses* | g b | **31** |
| `zuvogal` *frame* | v g | **43** |
| `zezezal` *squirrel* | z z | **55** |
| `zohedal` *hotdog* | h d | **62** |
| `zolerel` *alarm-clock* | l r | **78** |
| `zorebol` *ring* | r b | **81** |
| `zaruvel` *run* | r v | **84** |
| `zanumul` *anxious* | n m | **90** |
| `zumemul` *melt* | m m | **00** |

### v1 usability bar {#v1-usability-bar}

1. **Ship the converter** ([the tool](#the-tool)): digits in, ranked pegs out; words in, digits out. Both directions use the live published lexicon.
2. **Every 0–9 and 00–99 cell still has a root.** A check (the same payload walk the tool uses) fails if a cell empties after a respelling.
3. **No spelling is stored.** Rank by `core`, then seed, then the rest. Titles are allowed; country-name place roots are not. A default scene, if offered, is the current top-ranked row for that cell, not a hand-picked list.

## Open questions

1. **Where the converter lives.** A `scripts/` CLI in the same family as `parse.mjs` is enough for v1. A dictionary-page field (type a PIN, see pegs; type a word, see digits) can wait. Grammar pages stay free of a 100-row table either way. 
2. **Thin cells.** The thinnest cell hangs on two signs (**73**). A later respelling could empty it. Accept that and let the check flag a cell that empties? Or let `convert-word` break near-ties toward nearly empty cells? The second fills them but breaks goal 5.
3. **Three-letter rows as pegs.** These rows also carry closed grammar overlays. Their seeds picture well (*map*, *door*), but a learner may hear the overlay first, and three-letter people/tools (`awu` *anchor*) carry no digit. Should the tool rank five-letter filler roots (people and tools) above three-letter overlay hosts when a digit has both?
4. **Count layer.** Adopt it in the chunker, and if so, hand shapes for every count or copies for 1–4?
5. **Where to mention the method:** [numbers.md](../grammar/numbers.md) Beginner (one sentence plus a link to the tool), or Advanced / a sibling page after absorbing. The letter-name table already teaches the digit letters in order, which is a natural hook.

## Absorb sketch

This isn't core-grammar morphology. If accepted:

- **The converter** ([the tool](#the-tool)): number → ranked pegs, word → digits, plus a check that no 0–9 or 00–99 cell is empty.
- A short **optional** section, likely [numbers.md](../grammar/numbers.md) Intermediate or Advanced, covering the onset table, the silent letters, the fillers and the peg sizes, and pointing at the tool. Grammar pages never carry the bank.

The blocker to absorbing is the converter, not lexicon size.

## Non-criteria

Building the converter (CLI, later a dictionary field, flashcards) isn't a reason to reject the map. The learner-facing tests:
- decoding is 1:1;
- role letters, endings and seams never count;
- every scene is the root's seed;
- 0–9 and every 00–99 cell can be filled from published roots;
- the tool can suggest pegs for a digit string and recover the digits from a word.

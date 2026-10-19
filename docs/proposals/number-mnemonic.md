# Proposal: digit-onset mnemonic (Major system)

**Status:** PROPOSED. **Depends on** `number-respelling.md`: every map, table and example below uses the respelled digits (`b d g v z h l r n m` = 1–9, 0; fillers `w` and `y`). The current grammar's digits (`w d r m v g l h n z`) don't fit this design, so this proposal can't be absorbed before that one.  
**Related:** [numbers.md § Counts](../grammar/numbers.md#counts) (digit syllables); [phonology.md § letter names](../grammar/phonology.md#letter-names) (the alphabet opens with the ten digit letters in digit order); [phonology.md § phonotactics](../grammar/phonology.md#phonotactics) (word shape, endings, seams); [word-endings.md](../grammar/word-endings.md); [x-compounds.md § lexical compounds](../grammar/x-compounds.md#lexical-compounds); [lexicon editing § root length](../meta/lexicon.md#root-length) and [§ second consonant](../meta/lexicon.md#second-consonant); [`data/lexicon-published.csv`](../../data/lexicon-published.csv); `manual-phonology.md` (count shapes for the optional count layer).  
**Design authority:** spoken number grammar is unchanged. This is an optional **memory channel** that reuses the digit onsets. It adds no morphology, no second digit table, and no [numeric-derivation](../grammar/numeric-derivation.md) reading.

## Motivation

English memory systems (Major / Herigone) turn digits into consonants, then add vowels to make picture-words. Their map is many-to-one (`1` = *t* or *d*, `6` = *j/sh/ch/g*, …), so encoding and decoding work against each other.

Agazan gives each digit **one unique onset**, and the [alphabet](../grammar/phonology.md#letter-names) starts with those ten letters in digit order. The mnemonic should be that map, not a parallel code. A number becomes a **root consonant skeleton**, and published roots become the pictures.

Every published root has a concrete seed (usually an emoji), so most roots can be pictured. The [root length](../meta/lexicon.md#root-length) policy fixes two shapes, three letters (`VCV`) and five letters (`VCVCV`). Those line up with 0–9 and 00–99 pegs.

One gap is structural. No five-letter root has **l / m / n / r** as its second consonant ([second consonant](../meta/lexicon.md#second-consonant)). Under the respelled digits these four letters are 7, 8, 9 and 0, so no root ends in those digits. The same four letters are the four [word endings](../grammar/word-endings.md), and the ending supplies the missing digit ([top-up rule](#top-up-rule)). The respelling put the four ending letters on 7–0 for this reason: "the last four digits are the endings" is one fact.

## Goals

1. Fix a **1:1 digit ↔ onset** table identical to the spoken digit syllables.
2. Define **payload vs silent** letters, so role letters, seams and fillers can't corrupt a PIN or phone chunk.
3. Encode by filling vowels into a root skeleton; decode by stripping back to onsets.
4. Use **one decode rule** for every peg: read the root's digit consonants, then top up from the ending.
5. Use **published** roots as shared images, chosen from the existing lexicon. The mnemonic never steers a root's spelling.

## Non-goals

- Changing how number words are **said**: `g+32` stays `gragodal`, not `agadu`.
- A new CSV column, overlay, or numeric-derivation reading. (`ROOT` + **-l** / **-m** + number stem already means essence / grain / …; this channel doesn't.)
- Encoding sign, ordinal vs scalar, `.`, `e`, or `%` as extra letters. Those stay numeral grammar; chunk the digit string only.
- Mixing letter-name recitation (`ba` vs digit `bu`) into the peg. Names use the opposite vowel, and the mnemonic ignores vowels anyway.
- Changing [root length](../meta/lexicon.md#root-length) or the [second-consonant](../meta/lexicon.md#second-consonant) ban. Pegs use the roots that exist.
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

Vowels never encode a digit. The same skeleton with different vowels is the **same number**: `agadu` *cat*, `ogoda` *gold*, `ogodu` *coat* and `agada` *calendar* are all **32**. Use that freedom to pick a vivid picture; don't treat `u` / `a` / `o` / `e` as extra digits.

## Payload vs silent

**Payload** (left to right, **inside the stem**): `b d g v z h l r n m`.

**Fillers:** `w` and `y`. They add a syllable without adding a digit. A five-letter root with one filler and one digit letter is a **one-onset** root (`erewe` *railway* → **r** → **8**). Roots never contain `x` or `th`.

**Always silent:**

- All vowels.
- The role letter, and the `l` of left-hanging `gl-`. The digit has to be in the picture, and the role letter changes a word's job, not what you picture: `zagadul` and `dagadul` are the same cat. It also has its own job in [person–action–object](#optional-person-action-object).
- Plural **-x**, name instance **-ln**, and the stand-in codas **-rl / -rm / -rth**.
- Mid-word **x** (compound seam) and mid-word **th** (stance seam).

**The ending** (**-l / -m / -n / -r**) is silent unless the slot still needs a digit ([below](#top-up-rule)).

**Not pegs:** number words (a role letter followed directly by `r`), numeric-derivation words (join **-l** / **-m** followed by `r`), and pronouns. Read those as grammar.

### Top-up rule {#top-up-rule}

> Read the root's digit consonants. If the slot needs one more digit, the ending supplies it.

Every slot in a memory palace has a fixed length: **1** on the 0–9 list, **2** on the 00–99 list. With the [count layer](#count-layer) the length is 3, made of a count plus a two-digit peg. The rule doesn't ask the learner to remember which kind of root a word is. They read its consonants to decode it anyway.

| Ending | Digit | Scene |
|--------|-------|-------|
| **-l** | **7** | the thing itself (concrete sense) |
| **-r** | **8** | the same thing again (a repeat) |
| **-n** | **9** | a character with that name |
| **-m** | **0** | the root's abstract sense |

Any one-onset root takes any of the four endings. With `ega` *egg* (**3**) on the 00–99 list:

| Word | Scene | Digits |
|------|-------|--------|
| `zegal` | an egg | **37** |
| `zegar` | that egg again | **38** |
| `zegan` | someone named Egg | **39** |
| `zegam` | potential (egg's abstract sense) | **30** |

On the 0–9 list the slot is full after one consonant, so `zegal` is just **3**. On a two-onset root the slot is full before the ending, so `zagadul` is **32**.

**The slot length checks itself.** Each way of misapplying the rule gives the wrong number of digits:
- counting the ending on a two-onset root: `zagadul` → 3, 2, 7 (three digits in a two-digit slot);
- skipping it on a one-onset root: `zegal` → 3 (one digit in a two-digit slot).

The one mistake the length can't catch is miscounting the fillers. Only `w` and `y` are silent.

The canonical list still gives each cell **its own root** ([usability bar](#v1-usability-bar)), because four scenes of one picture blur together in a palace. The table above only shows how the endings read.

**Encoding by the second digit:**
- **1–6:** take a root with those two onsets.
- **7, 8, 9 or 0:** take a one-onset root for the first digit, plus the ending for the second.

The two kinds of cell never overlap, so decoding stays unique. Only the four plain endings count; a peg never uses `-ln`, `-rl`, `-rm` or `-rth`.

**A word the grammar reads as something else is not a peg.** `obe` *person* + **-n** is the [generic pronoun](../grammar/pronouns.md#generic-pronoun) `oben`, so pick another root for **19**.

**Backup:** a learner who skips the ending rule splits these cells into two 0–9 pegs (`ezo` *zebra* + `una` *neutral* for **59**). That costs a second image per chunk.

### Dictionary compounds

A [dictionary compound](../grammar/x-compounds.md#lexical-compounds) is one stem: left root + join letter + head root. The join letter (**l / m / n / r**) **counts**: it is spelled and heard like any root letter, so decoding never needs to know where the seam is. `zebedaluruhel` *bedroom* is **b d l r h** → **12786**.

A compound has three or more onsets, so it doesn't fit a fixed-length slot. Compounds are optional long pegs for a palace slot set to their own length. They aren't part of the canonical bank.

## Encode / decode

**Number → image**

1. Take the digit string (PIN, phone group, π chunk, year).
2. Cut it into 2-digit (or 1-digit) chunks, or 3-digit chunks with the [count layer](#count-layer).
3. For each 2-digit chunk, pick a peg by its second digit ([top-up rule](#top-up-rule)).
4. Each word is one palace image. Glue with **x** if you want one spoken compound; the **x** only marks the cut.

**Image → number**

1. Drop the role letter (and `gl-`), plural **-x**, and the other codas. Note the ending.
2. Split on **x**; drop **th** seams.
3. Drop vowels and **w / y**, and read the remaining onsets as digits.
4. If the slot still needs a digit, add the ending's digit.

Decoding is unique. That is the gap in the English Major system this closes.

## Peg sizes

| Word shape | Payload | Peg | Published (snapshot below) |
|------------|---------|-----|----------------------------|
| 3 letters `VCV` (digit consonant) | 1 onset | **0–9** | 63 roots; every digit |
| 5 letters `VCVCV`, one filler (`w` / `y`) | 1 onset | **0–9** | 193 roots; every digit |
| either of the above + ending | 1 onset + ending | **00–99**, second digit 7 / 8 / 9 / 0 | 256 roots; all 40 cells |
| 5 letters `VCVCV`, two digit letters | 2 onsets | **00–99**, second digit 1–6 | 1148 roots; all 60 cells |
| Dictionary compound | 3–5 onsets | long chunk (optional) | not counted |

Three-letter roots with a filler consonant (`ewa` *ear*, `oye` *door*) and five-letter roots with two fillers (`oyoyo` *yoyo*) carry no digit: 16 roots in all.

Phone-style groups already match how they're spoken (`555,123,4567`): one image per comma group, or 2-digit chunks with the 3-digit groups split 2+1.

**314159** → **31 | 41 | 59**: `zegabol` *clipboard* (**31**), `zavabol` *vampire* (**41**), `zezon` *someone named Zebra* (**59**: `ezo` + **-n**).

Don't encode the decimal point. Use two scenes (integer, then fraction) or two palace slots.

## Optional: person–action–object {#optional-person-action-object}

The same 00–99 pegs work here; the role letter picks the job, so no second map is needed:

- Person: `/z/`, or a name with **-n**
- Action: `/v/`
- Object: `/d/` or `/b/`

Read the digits in the clause's default order (subject, object, verb), so six digits fill one locus:

> `zagadul dahadal vevegal.`
>
> z-cat | d-hand | v-think
>
> "The cat thinks about a hand." → **32 62 43**

A one-onset word in a clause still tops up from its ending, so `zegal` as the subject is **37**.

## Optional: count layer {#count-layer}

A three-digit chunk is a **count** plus a two-digit peg: **415** = four of the **15** peg (`abaze` *police*).

- **Capacity:** 3 digits per image instead of 2.
- **Decoding:** the count is the first digit, and the peg reads by the [top-up rule](#top-up-rule). On a three-digit list, a single item still counts as 1, so `162` is one item of peg 62, never the bare peg.
- **Speech:** the image is ordinary Agazan, a noun with a count. Plural **-x** stays silent, so `zabazelx` is still peg 15.

**Show the count as a hand shape, not as copies.** People take in up to about four items at a glance; five and more have to be counted, and a mental image is hard to count accurately. Zero copies can't be pictured at all. The finger code in `manual-phonology.md` gives every digit a count shape in alphabet order: runs of fingers for 1–4, the thumb for 5, thumb plus a run for 6–9, horns for 0. So the count becomes a hand held over the peg scene. That covers zero and the large counts with no special case. If the finger code stays unbuilt, use copies for 1–4 and a hand for the rest.

This doesn't fill any cell the ending cells leave empty. It is a capacity extension, not a coverage fix.

## Lexicon coverage {#lexicon-coverage}

Snapshot of [`lexicon-published.csv`](../../data/lexicon-published.csv) on 2026-10-19 with the respelled map: **1420** roots (69 three-letter, 1351 five-letter). **264** are flag roots (country and regional flags). Flags count toward coverage; the canonical list prefers other roots where a cell has them.

### 0–9 and the ending cells

The same one-onset roots serve as 0–9 pegs and, with an ending, fill the 40 ending cells. **-l**, **-n** and **-r** work on any root; **-m** needs a root with an abstract sense.

| Digit | Three-letter | Five-letter (one filler) | With an abstract sense | Examples |
|-------|--------------|--------------------------|------------------------|----------|
| 1 | 8 | 34 | 33 | `ubo` *bowl*, `obo` *bone*, `abawu` *pie* |
| 2 | 7 | 24 | 25 | `odu` *east*, `owoda` *watermelon*, `ewedu` *wind* |
| 3 | 9 | 40 | 42 | `ugu` *book*, `ugo` *coin*, `age` *anchor* |
| 4 | 4 | 20 | 19 | `ave` *wall*, `ovu` *thought*, `evewa` *veil* |
| 5 | 8 | 33 | 32 | `ezo` *zebra*, `uze` *seedling*, `ezewe` *swim* |
| 6 | 10 | 26 | 30 | `aho` *heart*, `aha` *handshake*, `awahe` *wine* |
| 7 | 3 | 3 | 6 | `ulo` *tool*, `ele` *letters*, `alawe` *llama* |
| 8 | 2 | 4 | 6 | `ura` *bookmark*, `ere` *record*, `erewe` *railway* |
| 9 | 5 | 4 | 8 | `una` *neutral*, `eno` *empty nest*, `anaya` *onion* |
| 0 | 7 | 5 | 12 | `amo` *money*, `ama` *map*, `ame` *compass* |

Each digit needs **five** distinct one-onset roots: one 0–9 peg and one root for each of its four ending cells. Every digit clears the bar. The thinnest are **7** and **8**, with 6 each, of which 2 each are flags. `l`, `r`, `n` and `m` can only be a five-letter root's first consonant, and only with a filler (`w` / `y`) second, so lexicon growth adds choice slowly for 7–0. Spellings come from `convert-word`, so growth can't be aimed at a digit.

### Two-onset cells

Roots per cell, all / flags (rows = first digit, columns = second digit). The other 40 cells are the ending cells above.

| | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| **1** | 21/2 | 40/5 | 38/5 | 30/6 | 30/7 | 37/3 |
| **2** | 15/0 | 18/1 | 24/6 | 17/2 | 18/1 | 23/4 |
| **3** | 25/7 | 32/3 | 29/7 | 18/2 | 28/5 | 22/2 |
| **4** | 11/3 | 19/3 | 21/4 | 14/0 | 12/2 | 17/2 |
| **5** | 26/7 | 34/9 | 42/3 | 20/5 | 14/2 | 20/5 |
| **6** | 16/4 | 22/5 | 20/5 | 13/1 | 18/2 | 23/3 |
| **7** | 16/4 | 21/8 | 11/2 | 14/1 | 7/4 | 12/1 |
| **8** | 13/2 | 14/2 | 10/2 | 5/0 | 19/0 | 18/4 |
| **9** | 7/2 | 20/5 | 12/5 | 11/2 | 7/1 | 18/6 |
| **0** | 6/0 | 22/9 | 21/8 | 11/1 | 12/3 | 14/3 |

- Every cell has at least **5** roots, and at least **3** that aren't flags. The thinnest are **84** (5), **01** (6), and **75** and **91** (7).
- **51** of the 60 cells have a root in the `core` vocabulary column, so a canonical list can lean on words learners meet early.
- `y` is the rarest root letter and `w` the next rarest, which is why they are the fillers: every other choice of fillers leaves thinner cells.

Working examples (illustration, not the canonical list):

| Word | Payload | Digits |
|------|---------|--------|
| `zagadul` *cat* | g d | **32** |
| `zazazal` *sunrise* | z z | **55** |
| `zodogal` *dog* | d g | **23** |
| `zavahel` *fire* | v h | **46** |
| `zahadal` *hand* | h d | **62** |
| `zarabal` *rabbit* | r b | **81** |
| `zegam` *potential* | g + **-m** | **30** |
| `zezon` *someone named Zebra* | z + **-n** | **59** |
| `zulor` *that tool again* | l + **-r** | **78** |

### v1 usability bar {#v1-usability-bar}

1. **Publish a canonical 00–99 list:** one preferred word per cell, and **no root used twice** across the 0–9 and 00–99 lists.
   - **Two-onset cells:** prefer `core` roots, then concrete nouns over abstract senses, then non-flag roots. Never use names.
   - **Ending cells:** give the **-m** cell the root whose abstract sense pictures best, and the **-l** cell the most concrete one. The x0 cells carry the abstract scene and are common chunks (round numbers, years, dates), so choose them first.
2. **Keep the list retie-safe:** store the row (seed / sense), never the spelling, and derive the digits from the current root. A respelling can move a row to a different cell, so a check should flag any cell that empties.

## Open questions

1. **Where the canonical list lives.** A small `data/` peg file (row + digits + scene) keeps grammar pages free of a 100-row table. A grammar Advanced appendix is heavier for learners.
2. **Three-letter rows as pegs.** These rows also carry closed grammar overlays. Their seeds picture well (*egg*, *map*, *heart*), but a learner may hear the overlay first. Should the canonical list prefer five-letter filler roots? That isn't possible for 7 and 8, which have only 3 and 4 five-letter roots.
3. **Count layer.** Adopt it, and if so, hand shapes for every count or copies for 1–4?
4. **Where to mention the method:** [numbers.md](../grammar/numbers.md) Beginner (one sentence plus a link), or Advanced / a sibling page after absorbing. The letter-name table already teaches the digit letters in order, which is a natural hook.

## Absorb sketch

This isn't core-grammar morphology. If accepted, and after `number-respelling.md` is absorbed:

- A short **optional** section, likely [numbers.md](../grammar/numbers.md) Intermediate or Advanced, or a sibling `docs/grammar/` page linked from numbers and the phonology letter names. It would cover the onset table, the silent letters, the top-up rule, the fillers and the peg sizes.
- A **canonical 0–9 and 00–99** list kept next to the lexicon, keyed by row.
- Grammar pages stay free of this proposal until it is absorbed.

The blockers to absorbing are the digit respelling and the canonical list, not lexicon size.

## Non-criteria

Implementation effort (a peg file, a peg picker in the dictionary UI, flashcards) isn't a reason to reject the map. The learner-facing tests:
- decoding is 1:1;
- role letters and seams never count;
- one top-up rule decides when the ending counts;
- 0–9 and every 00–99 cell can be filled from published roots.

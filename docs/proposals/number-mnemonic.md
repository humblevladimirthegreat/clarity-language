# Proposal: digit-onset mnemonic (Major system)

**Status:** PROPOSED  
**Related:** [numbers.md § Saying it aloud](../grammar/numbers.md#digits) (digit syllables); [phonology.md § letter names](../grammar/phonology.md#letter-names) (opposite-vowel names so recitation ≠ digit); [phonology.md § phonotactics](../grammar/phonology.md#phonotactics) (roots `V(CV)+`; ending consonants); [lexicon.md](../grammar/lexicon.md) / [`data/lexicon-published.csv`](../../data/lexicon-published.csv)  
**Design authority:** spoken number grammar is unchanged. This is an optional **memory channel** that reuses the existing digit onsets. It does not add morphology, a second digit table, or numeric-derivation readings.

## Motivation

English memory systems (Major / Herigone) turn digits into consonants, then fill vowels to make picture-words. The map is many-to-one (`1` = *t* or *d*, `6` = *j/sh/ch/g*, …), so encode and decode fight each other.

Agalan already assigns **one unique onset per digit**. The mnemonic should be that map, not a parallel code. A number becomes a **root consonant skeleton**; published short roots become the pictures.

Usability depends on having **enough two- and three-syllable content roots** with the right skeletons. The published lexicon is not there yet as a peg bank (counts below).

## Goals

1. Fix a **1:1 digit ↔ onset** table identical to the spoken digit syllables.
2. Define **payload vs silent** letters so PoS, endings, and fillers cannot corrupt a PIN or phone chunk.
3. Encode by filling vowels (and optional fillers) into a legal root; decode by stripping back to onsets.
4. Treat **2-syllable** roots as 0–9 pegs and **3-syllable** roots as **00–99** pegs.
5. Prefer **published** roots as shared images; allow private nonce roots when the bank has a hole.
6. Call out the **lexicon gap**: grow two- and three-syllable imageable roots until 0–9 and 00–99 are usable without coinage.

## Non-goals

- Changing how number words are **said** (`g+62` stays *gragudul*, not *agada*).
- A new CSV column, overlay, or `ROOTxNUM` reading. Derivation already means essence / grain / …; this channel does not.
- Encoding sign, ordinal vs scalar, `.`, `e`, or `%` as extra letters (those stay numeral grammar; chunk the digit string only).
- Mixing letter-name recitation (`we` vs digit `wo`) into the peg. Names already use the opposite vowel; the mnemonic ignores vowels anyway.
- Requiring a 000–999 (4-syllable) bank in v1.
- Reserving all 2-syllable roots for closed specials (that would starve the 0–9 pegs). If some 2-syllable forms stay closed, the **open** 2-syllable inventory still needs to grow.

## The map

Same onsets as [digit syllables](../grammar/numbers.md#digits):

| Digit | Onset | Syllable |
|-------|--------|----------|
| 0 | **z** | zo |
| 1 | **w** | wo |
| 2 | **d** | du |
| 3 | **r** | re |
| 4 | **m** | mo |
| 5 | **v** | va |
| 6 | **g** | gu |
| 7 | **l** | le |
| 8 | **h** | ha |
| 9 | **n** | na |

Vowels never encode a digit. Same skeleton + different vowels = **same number** (`agada` / `egede` / … → **62**). Use that freedom to pick a vivid picture; do not treat `a` / `o` / `e` / `u` as extra digits.

## Payload vs silent

**Payload** (left to right, **inside the root only**): `z w d r m v g l h n`.

**Always ignore**

- All vowels
- PoS prefix
- Reference ending (**-l / -m / -n / -r**) and plural **-sh** (those letters *are* digit onsets; counting them would rewrite the number)
- Mid-word **x** (compound glue)
- The number-marker **r** + **ra / ru / re / ro / reu** — the mnemonic *replaces* the numeral word with content, it does not recite it

**Fillers** (optional padding): **j**, **b**, and root-internal **x**. They add syllables without adding digits. A 3-syllable root with a filler and only **one** payload consonant is a **0–9** peg, not a 00–99 peg (`ubuzu` → **z** → **0**).

Citation `zagadal` (*cat*): prefix `z` and ending `-l` are silent; payload **g d** → **62**.

## Encode / decode

**Number → image**

1. Take the digit string (PIN, phone group, π chunk, year).
2. Replace each digit by its onset.
3. Insert vowels until the shape is `V(CV)+`. Add **j / b** only if needed to pronounce or to pick a better scene.
4. Prefer a published root with that **exact** payload. If none, coin a nonce root (legal phonology, not lexicon).
5. Long strings: cut into 2-digit (or 1-digit) chunks. One root per chunk; glue with **x** if you want one spoken compound. Each root is one palace image; **x** is only the cut.

**Image → number**

1. Strip PoS, ending, **-sh**.
2. Split on **x**.
3. Drop vowels and **j / b / x**.
4. Read remaining onsets as digits.

Decode is unique. That is the English Major-system gap this closes.

## Peg sizes

| Root shape | Typical payload | Peg |
|------------|-----------------|-----|
| 2 syllables `VCV` | 1 onset | **0–9** |
| 3 syllables `VCVCV` | 2 onsets | **00–99** |
| 4 syllables `VCVCVCV` | 3 onsets | 000–999 (optional later) |

Phone-style groups already match spoken labels (`555,123,4567`): one image per comma-group, or 2+2+3 on the 00–99 list.

**314159** → `r w m w v n` → **31 | 41 | 59**. Three palace scenes, or a nonce compound `arawa x amawa x avana`. Zeros count: PIN **007** is `z z l`.

Do not encode the decimal point. Two scenes (integer, then fraction) or two palace slots.

## Optional person–action–object

Same 00–99 skeletons; PoS picks the role — no second map:

- Person — `/z/` or named **-n**
- Action — `/v/`
- Object — `/d/` or `/b/`

Six digits per locus: person **62** does action **17** to object **89**.

## Lexicon gap (why this is not usable yet)

Snapshot of [`lexicon-published.csv`](../../data/lexicon-published.csv) at proposal time (~1367 roots). Payload = digit onsets only.

| Band | What we have | Why it is thin for pegs |
|------|----------------|-------------------------|
| **2-syllable** (`VCV`) | **94** roots; all **10** single onsets exist | About 5–12 per digit. Mix of imageable words (`ele` *elephant*, `unu` *sun*, `oho` *horse*) and weak pegs (country codes, abbreviations, closed-looking forms). A working 0–9 list wants **several concrete nouns/verbs per digit**, not one lucky hit. |
| **3-syllable** | **1273** roots; **98 / 100** two-onset skeletons with exact payload 2 | Quantity is high; **peg quality** is not. **260** 3-syllable roots include **j / b** (or otherwise fail exact-2), so they fall out of 00–99. Skeletons **mw (41)** and **hw (81)** are **empty**. **mv**, **vw**, **lh** have only one pure (no-filler) root each. No canonical “this is the 00–99 word.” |
| **4-syllable** | **0** | No 000–999 bank; out of v1 scope. |

**v1 usability bar**

1. **Fill 41 and 81** with at least one imageable 3-syllable root each (`…m…w…` / `…h…w…`).
2. **Publish a canonical 00–99 list**: one preferred 3-syllable root per skeleton (concrete noun or verb over abstract / proper / abbreviation). Where several roots share a skeleton, pick the most picturable literal.
3. **Grow the 2-syllable open lexicon** until each digit 0–9 has multiple good pictures (not only the current ~94, and not by treating names as pegs).
4. **Grow 3-syllable coverage** on the thin skeletons (single-root cells) so a learner can still find an image if the canonical word is unknown.
5. Prefer new roots whose mid consonants are **digit onsets**, not filler-only patterns, when the sense would otherwise be a short word anyway.

Until (1)–(3) hold, the system is teachable as a *method* but learners must coin nonce pegs for holes and for dull cells. That is weaker than English Major system’s published 00–99 lists, which is the opposite of the design intent.

Existing 3-syllable examples that already work as pictures (not the canonical list — illustration only):

| Root | Payload | Digits |
|------|---------|--------|
| `agada` | g d | **62** |
| `azaza` | z z | **00** |
| `awala` | w l | **17** |
| `avara` | v r | **53** |
| `amana` | m n | **49** |
| `ahana` | h n | **89** |
| `adaza` | d z | **20** |

## Open questions (absorb time)

1. **Canonical 00–99 CSV vs docs table** — a small `data/` peg file (root + digits + scene) keeps grammar pages free of a 100-row dump; a grammar Advanced appendix is heavier for learners.
2. **2-syllable vs closed specials** — [TODO](../../TODO.md) considers reserving 2-syllable words for specials. Pegs want the opposite for 0–9. Decide which 2-syllable forms stay closed, then fill 0–9 from the **open** remainder plus new roots.
3. **Fillers in the canonical list** — allow one **j / b** in a 00–99 word if the two payload onsets are right and the picture is better, or require filler-free `VCVCV` only.
4. **House-cast / proper names** — exclude **-n** uses and published country/code roots from the canonical peg list (weak scenes, easy to confuse with spelling).
5. **Whether to mention the method in** [numbers.md](../grammar/numbers.md) **Beginner** (one sentence + link) or keep it Advanced / a sibling page after absorb.

## Absorb sketch

Not a core-grammar morph. If accepted:

- A short **optional** section (likely [numbers.md](../grammar/numbers.md) Intermediate or Advanced, or a sibling `docs/grammar/` page linked from numbers + phonology letter-names) with the onset table, silent-letter rules, and 2-syl / 3-syl peg sizes.
- A **canonical 00–99** (and 0–9) list maintained next to the lexicon, filled only when those roots exist.
- Grammar pages stay free of this proposal path until absorb.

Lexicon growth is the absorb blocker, not the mapping.

## Non-criteria

Implementation effort (CSV rows, a peg picker in the dictionary UI, flashcards) is not a reason to reject the map. Learner-facing tests: 1:1 decode, endings never counted, 00–99 fillable from published 3-syllable roots, 0–9 fillable from published 2-syllable roots without leaning on names.

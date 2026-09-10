# Proposal: one-handed fingerspelling (STS subset + Chinese **z**)

**Status:** PROPOSED  
**Related:** [phonology.md § letter names](../grammar/phonology.md#letter-names) (spoken spelling recitation); [phonology.md § phonotactics](../grammar/phonology.md#phonotactics) (word-final **-x**); silent use when speech is not possible  
**Design authority:** spoken grammar is unchanged. This is an optional **manual spelling channel** for existing letters. It does not add lexicon, morphology, or a sign language.

## Motivation

Agalan already has an unambiguous spoken spelling: one [letter name](../grammar/phonology.md#letter-names) per glyph, pauses between names. There is no documented way to spell a **single word** when the listener cannot hear (noise, distance, mouth occupied, remaining quiet).

A primitive channel should:

- Stay **one-handed** (other hand free).
- Use **static holds** (no air-tracing of **J** or **Z**, no wipe motions).
- Spell the **same letters** as writing, in the same order as the spoken names.
- Avoid inventing a second language of iconic word-signs.

Swedish Sign Language (**STS**) fingerspelling is one-handed. Most of its Latin letters are holds; **J** is a still flat hand (unlike ASL). Chinese fingerspelling (**汉语手指字母方案**) gives a still, more glyph-like **Z**. Associative plural is letter **x**, already in the written inventory — no extra hold.

## Goals

1. Define a **closed 17-sign** inventory: the 17 written letters.
2. Default each sign to a **one-hand hold** (orientation + handshape; no path).
3. Take **a e o u b d g h j l m n r v w x** from **STS** (Stockholm [handalfabet](https://teckensprakslexikon.su.se/kategori/handalfabetet)).
4. Take **z** from **Chinese** (2019 *汉语手指字母方案* **Z**).
5. Spell in **letter-name order**; mark the **word edge** with a brief hold or drop after the last sign (same job as audible **-l / -m / -n / -r / -x**).
6. Keep the channel **compositional spelling only** — no lexical STS/CSL signs.

## Non-goals

- A full sign language, classifiers, or root-iconic vocabulary.
- Two-handed alphabets (BSL / Auslan) as the default (optional distance mode later).
- Cued speech / lipreading (fails when the mouth is not visible).
- Teaching unused Latin letters (**c f i k p q s t y**) or Swedish **å ä ö**.
- ASL / LSF as the native chart (false friends with STS; tracing **J** or **Z**).
- Changing spoken letter names or phonology.
- Tactile (Lorm) or semaphore remaps in v1 (same inventory later if needed).

## Inventory

Spoken names stay as in phonology. Plural **-x** uses the **x** hold (`xe`).

| Glyph | Spoken name | Manual source | Notes |
|-------|-------------|---------------|--------|
| **e** | *e* (hold vowel) | STS **E** | |
| **u** | *u* | STS **U** | |
| **o** | *o* | STS **O** | |
| **a** | *a* | STS **A** | |
| **b** | *be* | STS **B** | |
| **m** | *me* | STS **M** | |
| **w** | *we* | STS **W** | |
| **v** | *vu* | STS **V** | |
| **d** | *da* | STS **D** | |
| **n** | *nu* | STS **N** | |
| **z** | *ze* | **Chinese Z** | Index + little finger extended, tips to the side, back of hand to viewer; other fingers bent. **Not** STS rounded-middle-finger **Z**, **not** ASL zigzag |
| **l** | *lo* | STS **L** | |
| **r** | *ro* | STS **R** | |
| **g** | *ga* | STS **G** | ASL false friend risk (see below) |
| **h** | *hu* | STS **H** | |
| **j** | *ja* | STS **J** | **Hold** (flat hand); not ASL pinky-trace |
| **x** | *xe* | STS **X** | Hold; check vs Chinese **Z** (open question). Plural **-x** is this same sign after the ending. |

**Dropped STS letters:** **c f i k p q s t y å ä ö**. Dropping **y / å / ä / ö** also drops the STS letters that use **path movement**.

**Dropped Chinese letters:** everything except **Z** (do not import Chinese **H**, **S**, **SH**, **ZH**, …).

## How to spell a word

Same sequence as spoken spelling. Example citation `agada`:

***a ga a da a*** — five holds, pause (or slight drop) between them so **da** + **a** stay two signs.

Content word: PoS letter, then root letters, then ending (**l / m / n / r**), then **x** if plural. One sign per letter. Foreign / opaque payloads stay letter-by-letter only when the interior is Latin-Agalan; other orthographies are out of scope (or stay unspelled).

**Location (sketch):** STS habit is a small space near chin/cheek. Absorb with photos/video; consistency matters more than copying STS height exactly.

## Why this mix

- **STS** supplies a one-hand Latin set whose **j** is already a hold, with more print-cursive iconicity than ASL, and no need to teach English-only letters.
- **Chinese Z** is a hold that still suggests the **two bars** of printed **Z**; STS **Z** is a weak cursive pose and is marked *less common* even in Swedish.

ASL transfer is **not** a goal. STS and ASL share some shapes on **different** letters (e.g. ASL **B C D R S** ≈ STS **D S L X G**). Charts must say **do not read this as ASL**.

## Open questions (absorb time)

1. **STS X vs Chinese Z** — confirm the two holds stay distinct at conversation distance; if not, tweak orientation of one, not the letter assignment.
2. **Form source of record** — link stills/video: [teckenspråkslexikon handalfabet](https://teckensprakslexikon.su.se/kategori/handalfabetet) for STS rows; PRC *汉语手指字母方案* (2019) for **Z**. Do not redraw from memory.
3. **Numbers** — digit syllables are not this alphabet; number words still spell as letters (`g`, `+` writing is not a letter). Digit-hand overlap with **we/da/…** is a later pass if needed.
4. **Non-dominant / left-handed** — mirror; pick one convention in the chart.

## Absorb sketch

Not a core-grammar morph. If accepted: a short **optional** section (likely [phonology.md](../grammar/phonology.md) Advanced, or a sibling `docs/grammar/` page linked from phonology) with the 17-sign chart, the two source citations, and “spelling = letter names.” Grammar pages stay free of proposal links until then.

## Non-criteria

Implementation effort (drawings, video, site widgets) is not a reason to reject the mix. Learner-facing tests: one-hand, holds only, 17 signs, no ASL tracing, plural **-x** is the **x** sign.

# Proposal: one-handed fingerspelling (STS subset + Chinese **z** / **sh**)

**Status:** PROPOSED  
**Related:** [phonology.md § letter names](../grammar/phonology.md#letter-names) (spoken spelling recitation); [phonology.md § phonotactics](../grammar/phonology.md#phonotactics) (word-final **-sh**); silent use when speech is not possible  
**Design authority:** spoken grammar is unchanged. This is an optional **manual spelling channel** for existing letters (plus the edge digraph **sh**). It does not add lexicon, morphology, or a sign language.

## Motivation

Agelan already has an unambiguous spoken spelling: one [letter name](../grammar/phonology.md#letter-names) per glyph, pauses between names. There is no documented way to spell a **single word** when the listener cannot hear (noise, distance, mouth occupied, remaining quiet).

A primitive channel should:

- Stay **one-handed** (other hand free).
- Use **static holds** (no air-tracing of **J** or **Z**, no wipe motions).
- Spell the **same letters** as writing, in the same order as the spoken names.
- Avoid inventing a second language of iconic word-signs.

Swedish Sign Language (**STS**) fingerspelling is one-handed. Most of its Latin letters are holds; **J** is a still flat hand (unlike ASL). Chinese fingerspelling (**汉语手指字母方案**) gives a still, more glyph-like **Z**, and a still dedicated **SH** (Agelan has no *s+h* two-letter spelling for the plural edge).

## Goals

1. Define a **closed 18-sign** inventory: the 17 written letters plus **sh**.
2. Default each sign to a **one-hand hold** (orientation + handshape; no path).
3. Take **a e o u b d g h j l m n r v w x** from **STS** (Stockholm [handalfabet](https://teckensprakslexikon.su.se/kategori/handalfabetet)).
4. Take **z** and **sh** from **Chinese** (2019 *汉语手指字母方案* **Z** and **SH**).
5. Spell in **letter-name order**; mark the **word edge** with a brief hold or drop after the last sign (same job as audible **-l / -m / -n / -r / -sh**).
6. Keep the channel **compositional spelling only** — no lexical STS/CSL signs.

## Non-goals

- A full sign language, classifiers, or root-iconic vocabulary.
- Two-handed alphabets (BSL / Auslan) as the default (optional distance mode later).
- Cued speech / lipreading (fails when the mouth is not visible).
- Teaching unused Latin letters (**c f i k p q s t y**) or Swedish **å ä ö**.
- ASL / LSF as the native chart (false friends with STS; tracing **J** or **Z**).
- Changing spoken letter names, phonology, or treating **sh** as a root consonant.
- Tactile (Lorm) or semaphore remaps in v1 (same inventory later if needed).

## Inventory

Spoken names stay as in phonology. **sh** has no spoken letter name today (it is only the plural edge); the manual channel still gets **one hold** so `…nsh` is not two English letters.

| Glyph | Spoken name | Manual source | Notes |
|-------|-------------|---------------|--------|
| **e** | *e* (hold vowel) | STS **E** | |
| **u** | *u* | STS **U** | |
| **o** | *o* | STS **O** | |
| **a** | *a* | STS **A** | |
| **h** | *hu* | STS **H** | |
| **w** | *we* | STS **W** | |
| **g** | *ga* | STS **G** | ASL false friend risk (see below) |
| **d** | *da* | STS **D** | |
| **j** | *ja* | STS **J** | **Hold** (flat hand); not ASL pinky-trace |
| **b** | *be* | STS **B** | |
| **z** | *ze* | **Chinese Z** | Index + little finger extended, tips to the side, back of hand to viewer; other fingers bent. **Not** STS rounded-middle-finger **Z**, **not** ASL zigzag |
| **m** | *me* | STS **M** | |
| **n** | *nu* | STS **N** | |
| **v** | *vu* | STS **V** | |
| **l** | *lo* | STS **L** | |
| **r** | *ro* | STS **R** | |
| **x** | *xe* | STS **X** | Hold; check vs Chinese **Z** (open question) |
| **sh** | *(no name; edge only)* | **Chinese SH** | Index + middle bent ~90° to palm, thumb up, ring + little tucked. Dedicated hold, **not** S then H, **not** print *sh*. Chinese **S** is unused here |

**Dropped STS letters:** **c f i k p q s t y å ä ö**. Dropping **y / å / ä / ö** also drops the STS letters that use **path movement**.

**Dropped Chinese letters:** everything except **Z** and **SH** (do not import Chinese **H**, **S**, **ZH**, …).

## How to spell a word

Same sequence as spoken spelling. Example citation `agada`:

***a ga a da a*** — five holds, pause (or slight drop) between them so **da** + **a** stay two signs.

Content word: PoS letter, then root letters, then ending (**l / m / n / r**), then **sh** if plural. One sign per glyph (digraph **sh** is one sign). Foreign / opaque payloads stay letter-by-letter only when the interior is Latin-Agelan; other orthographies are out of scope (or stay unspelled).

**Location (sketch):** STS habit is a small space near chin/cheek. Absorb with photos/video; consistency matters more than copying STS height exactly.

## Why this mix

- **STS** supplies a one-hand Latin set whose **j** is already a hold, with more print-cursive iconicity than ASL, and no need to teach English-only letters.
- **Chinese Z** is a hold that still suggests the **two bars** of printed **Z**; STS **Z** is a weak cursive pose and is marked *less common* even in Swedish.
- **Chinese SH** is the rare **single-hold** *sh*-slot; DGS **SCH** is a wipe; two-beat **S+H** teaches the wrong analysis for Agelan **sh**.

ASL transfer is **not** a goal. STS and ASL share some shapes on **different** letters (e.g. ASL **B C D R S** ≈ STS **D S L X G**). Charts must say **do not read this as ASL**.

## Open questions (absorb time)

1. **STS X vs Chinese Z** — confirm the two holds stay distinct at conversation distance; if not, tweak orientation of one, not the letter assignment.
2. **Chinese SH vs unused STS S** — SH is a two-finger relative of Chinese **S**; Agelan never uses **S**, so no in-inventory clash. Still check SH vs STS **E** / clawed letters in the subset.
3. **Form source of record** — link stills/video: [teckenspråkslexikon handalfabet](https://teckensprakslexikon.su.se/kategori/handalfabetet) for STS rows; PRC *汉语手指字母方案* (2019) for **Z** / **SH**. Do not redraw from memory.
4. **Whether to name manual sh in speech** — optional later CV (must not collide with digit *…* or revisers). v1 can leave spoken recitation unchanged and only add the hold.
5. **Numbers** — digit syllables are not this alphabet; number words still spell as letters (`g`, `+` writing is not a letter). Digit-hand overlap with **we/da/…** is a later pass if needed.
6. **Non-dominant / left-handed** — mirror; pick one convention in the chart.

## Absorb sketch

Not a core-grammar morph. If accepted: a short **optional** section (likely [phonology.md](../grammar/phonology.md) Advanced, or a sibling `docs/grammar/` page linked from phonology) with the 18-sign chart, the two source citations, and “spelling = letter names.” Grammar pages stay free of proposal links until then.

## Non-criteria

Implementation effort (drawings, video, site widgets) is not a reason to reject the mix. Learner-facing tests: one-hand, holds only, 18 signs, no ASL tracing, **sh** is one sign.

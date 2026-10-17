# Proposal: one-handed fingerspelling (STS subset + Chinese **z**)

**Status:** REJECTED. Spelling one letter per hold is slow, and the borrowed inventory takes 18 shapes from three source alphabets with no shared logic. Adopted instead: the signed channel in `manual-phonology.md`. It signs one syllable per beat with both hands, uses finger-count shapes for the digit letters, and shares its shapes with the piano and touch channels.  
**Related:** [phonology.md § letter names](../../grammar/phonology.md#letter-names) (spoken spelling recitation); [phonology.md § phonotactics](../../grammar/phonology.md#phonotactics) (word-final **-x**); silent use when speech is not possible  
**Design authority:** spoken grammar is unchanged. This is an optional **manual spelling channel** for existing letters. It does not add lexicon, morphology, or a sign language.

## Motivation

Agazan already has an unambiguous spoken spelling: one [letter name](../../grammar/phonology.md#letter-names) per glyph, pauses between names. There is no documented way to spell a **single word** when the listener cannot hear (noise, distance, mouth occupied, remaining quiet).

A primitive channel should:

- Stay **one-handed** (other hand free).
- Use **static holds** (no air-tracing of **J** or **Z**, no wipe motions).
- Spell the **same letters** as writing, in the same order as the spoken names.
- Avoid inventing a second language of iconic word-signs.

Swedish Sign Language (**STS**) fingerspelling is one-handed. Most of its Latin letters are holds; **J** is a still flat hand (unlike ASL). Chinese fingerspelling (**汉语手指字母方案**) gives a still, more glyph-like **Z**. Associative plural is letter **x**, already in the written inventory — no extra hold.

## Goals

1. Define a **closed 18-sign** inventory: the 18 written letters (**th** is one letter, one sign).
2. Default each sign to a **one-hand hold** (orientation + handshape; no path).
3. Take **a e o u b d g h l m n r v w x** from **STS** (Stockholm [handalfabet](https://teckensprakslexikon.su.se/kategori/handalfabetet)).
4. Take **y** and **z** from **Chinese** (2019 [*汉语手指字母方案*](http://www.moe.gov.cn/jyb_sjzl/ziliao/A19/201404/t20140422_167548.html), GF 0021-2019, [PDF](http://www.moe.gov.cn/jyb_sjzl/ziliao/A19/201404/W020191101556565933988.pdf) p. 5).
5. Take **th** from **Icelandic Sign Language** **Þ** (one hold, no path; [SignWiki](https://is.signwiki.org/index.php/%C3%9E)).
6. Spell in **letter-name order**; mark the **word edge** with a brief hold or drop after the last sign (same job as audible **-l / -m / -n / -r / -x**).
7. Keep the channel **compositional spelling only** — no lexical STS/CSL signs.

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
| **z** | *ze* | **Chinese Z** ([GF 0021-2019](http://www.moe.gov.cn/jyb_sjzl/ziliao/A19/201404/W020191101556565933988.pdf) p. 5) | Index + little finger extended sideways, tips left, back of hand outward; thumb over the bent middle and ring fingers (右手食、小指横伸，指尖朝左，拇、中、无名指弯曲，拇指搭在中、无名指远节指上，手背向外). Resembles Icelandic **Y** rotated, fine for now. **Not** STS rounded-middle-finger **Z**, **not** ASL zigzag |
| **l** | *lo* | STS **L** | |
| **r** | *ro* | STS **R** | |
| **y** | *ya* | **Chinese Y** ([GF 0021-2019](http://www.moe.gov.cn/jyb_sjzl/ziliao/A19/201404/W020191101556565933988.pdf) p. 5) | **Hold**: thumb and little finger extended, tips up, index, middle and ring fingers bent, palm forward and slightly left (右手伸拇、小指，指尖朝上，食、中、无名指弯曲，掌心向前偏左). Same shape as the ASL **Y**; do not read it as ASL. Replaces STS **J** (a flat-hand hold) so the sign matches the letter. STS **Y** was checked and rejected: it moves briefly downward ([entry](https://teckensprakslexikon.su.se/ord/11945)) |
| **g** | *ga* | STS **G** | ASL false friend risk (see below) |
| **h** | *hu* | STS **H** | |
| **x** | *xe* | STS **X** | Hold; check vs Chinese **Z** (open question). Plural **-x** is this same sign after the ending. |
| **th** | *tho* | **Icelandic Þ** | One sign for the whole digraph, not **t** + **h** (there is no **t**). Static hold in neutral space, SignWiki handshape "7": index, middle and ring fingers extended, thumb touching the little finger ([SignWiki Þ](https://is.signwiki.org/index.php/%C3%9E), [still](https://is.signwiki.org/index.php/Mynd:StafrofTH.JPG)). Different fingers from STS **W**. |

**Dropped STS letters:** **c f i k p q s t y å ä ö**. Dropping **y / å / ä / ö** also drops the STS letters that use **path movement**.

**Dropped Icelandic letters:** everything except **Þ** (**Ð**, **Æ**, **Ö**, and the Latin letters Iceland shares with STS are not imported). Icelandic **Y** ([SignWiki](https://is.signwiki.org/index.php/Y)) is not used; **y** is Chinese.

**Dropped Chinese letters:** everything except **Y** and **Z** (do not import Chinese **H**, **S**, **SH**, **ZH**, …).

## How to spell a word

Same sequence as spoken spelling. Example citation `agada`:

***a ga a da a*** — five holds, pause (or slight drop) between them so **da** + **a** stay two signs.

Content word: PoS letter, then root letters, then ending (**l / m / n / r**), then **x** if plural. One sign per letter. Foreign / opaque payloads stay letter-by-letter only when the interior is Latin-Agazan; other orthographies are out of scope (or stay unspelled).

**Location (sketch):** STS habit is a small space near chin/cheek. Absorb with photos/video; consistency matters more than copying STS height exactly.

## Why this mix

- **STS** supplies a one-hand Latin set with more print-cursive iconicity than ASL, and no need to teach English-only letters.
- **Chinese Y** is a hold that matches its letter; STS **Y** moves, and STS **J** is the letter **J**.
- **Chinese Z** is a hold that still suggests the **two bars** of printed **Z**; STS **Z** is a weak cursive pose and is marked *less common* even in Swedish.

ASL transfer is **not** a goal. STS and ASL share some shapes on **different** letters (e.g. ASL **B C D R S** ≈ STS **D S L X G**). Charts must say **do not read this as ASL**.

## Open questions (absorb time)

1. **STS X vs Chinese Z** — confirm the two holds stay distinct at conversation distance; if not, tweak orientation of one, not the letter assignment.
2. **Form source of record** — link stills/video: [teckenspråkslexikon handalfabet](https://teckensprakslexikon.su.se/kategori/handalfabetet) for STS rows; [PRC *汉语手指字母方案* (2019)](http://www.moe.gov.cn/jyb_sjzl/ziliao/A19/201404/t20140422_167548.html) for **Y** and **Z**; [SignWiki Þ](https://is.signwiki.org/index.php/%C3%9E) for **th**. Do not redraw from memory.
3. **Numbers** — digit syllables are not this alphabet; number words still spell as letters (`g`, `+` writing is not a letter). Digit-hand overlap with **we/da/…** is a later pass if needed.
4. **Icelandic Þ for th** — Iceland's **þ** is the voiceless *th* of *thin*; the Agazan **th** (*tho*, cue *though*) may be the voiced one, so the match is by letter, not sound. SignWiki states no licence for the still, so link it; do not copy it. The ISL source is only a still plus a video on the [Árni Magnússon Institute page](https://ait.arnastofnun.is/grein.php?id=406); check the exact thumb/little-finger contact before drawing the chart. No other manual alphabet searched (ASL, Danish, Norwegian, Faroese, Irish, Greek) had a documented single **th** sign.
5. **Non-dominant / left-handed** — mirror; pick one convention in the chart.

## Alternative: number-based alphabet (prototype only)

**Status:** not adopted; worth a prototype and a speed test. The borrowed inventory above stays the default.

**Idea:** sign the letter's **position in the alphabet** with one-hand number signs, so one rule replaces 18 borrowed shapes. [Letter names](../../grammar/phonology.md#letter-names) already list the alphabet in order: the ten [digit-syllable](../../grammar/phonology.md#digit-letters) consonants come first (**w d r m v g l h n z** = 1 to 9, then 0), then **b y th x**, then the vowels **u a o e**.

Four banks, each signed with a plain **finger count** (extended fingers, no thumb-to-finger shapes):

| Bank | Letters | Finger count |
|------|---------|--------------|
| **1** | **w d r m v** | 1 to 5 |
| **2** | **g l h n z** | 1 to 5 (the digits 6 to 9, then 0) |
| **3** | **b y th x** | 1 to 4 |
| **4** | **u a o e** | 1 to 4 |

So the whole alphabet needs only the shapes for 1 to 5. The thumb-touching 6 to 9 shapes are never used for letters.

**Markers (open):**
- **Bank:** four states from two position-independent features, so the sign still reads when held above the head across a crowd. Orientation is defined relative to the room (vertical or horizontal), not the forearm. Not an extra finger, because 5 already uses every finger. Position (height) is not used.

  | | Fingers up | Fingers sideways |
  |---|---|---|
  | **Straight** | bank 1 (**w d r m v**) | bank 2 (**g l h n z**) |
  | **Hooked** | bank 3 (**b y th x**) | bank 4 (**u a o e**) |

  - **Orientation:** up vs sideways, tips toward the signer's non-dominant side (mirrored for left-handed signers, see open question 5).
  - **Finger shape:** straight vs hooked (claw). The **thumb is the fifth finger** and is never hooked. Only banks 3 and 4 are hooked, and they need counts 1 to 4, so a hooked 5 (which could read as a fist) is never signed.
  - The two features carry meaning: straight vs hooked separates the digit letters from the other eight, and up vs sideways marks which half of each pair.
  - Weak point to test: hooked 1 may read as a plain pointing finger, and hooked 2 and 3 are the most likely to be misread at distance.
  - Fallbacks if hooked reads badly: finger spread (together vs spread), or a third orientation (diagonal) for one pair. Spread is undefined for a count of 1, so banks using it would start their counts at 2.
- **Numeral vs letter:** numerals reuse banks 1 and 2 by context (1 to 5 upright, 6 to 0 sideways, both straight), so the shape for 3 is both the numeral and **r**. Context decides which: whether the signer is spelling a word or giving a number. Spoken Agazan separates the two by form (letter name **ro** vs digit syllable **re**), so this is a deliberate loss in the manual channel. This also settles open question 3 above (digit-hand overlap with **we / da / …**) by design.
- **Vowels:** bank 4 holds all four. The opposite-vowel pairs **a↔u** and **o↔e** (see [letter names](../../grammar/phonology.md#digit-letters)) could be a thumb flip between pair members; untested.

**Count set:** pick one convention and say so, since index-first and thumb-first counting differ by region. Only 1 to 5 are needed for letters.

**Why try it:**
- One rule plus ten numbers learners need anyway, not 18 shapes from three source languages. No ASL false-friend notes in the chart.
- Still one-handed static holds, no path.

**Risks:**
- **Reading speed.** Latin-glyph signs look like letters. Finger counts are easy to read, but a letter now needs both a count and a bank state, and telling four bank states apart at distance is the weak point. Test by having several people spell real words.
- **Count convention.** Index-first and thumb-first counting differ by region; letters need only 1 to 5.
- **No external source.** The chart would be drawn in-house, unlike the borrowed inventory with linked official images.
- **Memory.** Learners must know letter order. The phonology table already teaches it.

### Tactile use (hand-over-hand)

The channel can be received by touch. The receiver rests a hand lightly over the signer's signing hand and feels the shape, as Deafblind users already receive fingerspelling. No new signs are needed.

- **Finger count:** felt directly. The thumb stays the fifth finger.
- **Orientation (up vs sideways):** felt as the direction of the fingers under the receiver's palm. With the receiver's hand as the reference, "up" and "sideways" are defined by the signer's hand, so the signer must hold the room-relative orientation steadily.
- **Straight vs hooked:** felt as the curl of the fingers; hooked fingers should be easy to feel.
- **Word edge:** the signer lifts the hand briefly, since a visual drop or hold is not available to the receiver.

**Why hand-over-hand:** it reuses the whole visual inventory, so both channels share one chart.

**Tap-on-body (noted, not specified):** tapping on the receiver's arm or hand would map flat pads vs fingertips to straight vs hooked, and fingers along vs across the receiver's arm to up vs sideways. It needs a fixed reference zone on the receiver (palm or back of hand, not the forearm, whose touch resolution is too coarse to tell 2 from 3 fingers apart). Treat it as a separate design if hand-over-hand proves insufficient.

**Open:** test whether four bank states stay distinguishable by touch, whether the receiver's resting hand blurs the hooked vs straight difference, and whether the lift-off word edge is clear in a fast word.

**Prototype test:** spell 20 real Agazan words with both inventories, measure recognition accuracy and time per word at conversation distance, and compare.

## Absorb sketch

Not a core-grammar morph. If accepted: a short **optional** section (likely [phonology.md](../../grammar/phonology.md) Advanced, or a sibling `docs/grammar/` page linked from phonology) with the 18-sign chart, the three source citations (STS, Chinese, Icelandic), and “spelling = letter names.” Grammar pages stay free of proposal links until then.

## Non-criteria

Implementation effort (drawings, video, site widgets) is not a reason to reject the mix. Learner-facing tests: one-hand, holds only, 18 signs, no ASL tracing, plural **-x** is the **x** sign.

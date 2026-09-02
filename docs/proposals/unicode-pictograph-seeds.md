# Proposal: non-emoji Unicode pictographs as extra lexicon seeds

**Status:** PROPOSED  
**Related:** `speed-reading-view.md`, `speed-reading-icons.md`; published seeds in [`data/lexicon-published.csv`](../../data/lexicon-published.csv)  
**Design authority:** roots stay assigned in the published CSV; grammar is unchanged. This note only covers **optional extra pictograph inventories** (plain-text Unicode, not a third morphology).

## Motivation

Published roots are almost entirely **RGI emoji** (Emoticons, Miscellaneous Symbols and Pictographs, Supplemental / Ext-A, Transport and Map, plus some Dingbats and Miscellaneous Symbols). Emoji cover everyday **scenes**: faces, food, animals, tools-as-stickers.

That inventory is weak on **process, apparatus, classical-science operations, writing-system pictures, and music notation atoms**. Unicode still has pictographic blocks that are **not** emoji (or are text-default symbols). They could seed further roots or specialist bands without waiting on a named icon pack (`speed-reading-icons.md`).

This is complementary to, not a replacement for, Tabler / Icons8 display ids. Icon packs restyle and fill UI-metaphor gaps; these blocks stay **copyable codepoints** in CSV and plain text.

## Goals

1. Record which non-emoji Unicode pictograph sets **add kinds of picture** the current CSV does not already cover.
2. Record **font** reality (Noto + OS tofu) so a UI can ship faces instead of assuming emoji fonts.
3. Record how hard it is to **mix** those sets with each other and with color emoji in one sentence vs one word.
4. Keep romanized Agalan as the phonological word; pictographs remain **seeds / speed-read display**, not letters inside `zugobon`.

## Non-goals

- Replacing emoji seeds already published.
- Filling every unused VCVCV slot because a codepoint exists.
- Using geometric shapes, block elements, ornamental dingbats, or legacy-computing mosaics as roots (poor mnemonics).
- Encoding music **scores** (beams, combining stems) or Egyptian **layout engines** (cartouches, insertions) as lexicon glyphs.
- Mixing historic scripts **inside** romanized Agalan orthography.
- Treating font/engineering cost as a reason to reject a set (end-user tofu and metric clash still matter).

## Current CSV coverage (sketch)

A pass over published `emoji` cells is almost all emoji pipelines: ZWJ sequences, Misc Symbols and Pictographs, Supplemental Symbols and Pictographs, Ext-A, Transport, Emoticons, variation selectors, plus small Dingbats / Misc Symbols / Technical / arrows. Non-emoji pictograph blocks below are effectively unused as seeds.

Characters that are `Emoji=Yes` but text-default (☀ ☁ ☕ ♻ ⚙ …) are already in the emoji pipeline; `U+FE0E` only changes presentation, not inventory.

## Candidate sets

### High complement

These add **new kinds** of picture rather than more faces/food/animals.

| Set | Range (approx.) | Why it complements emoji | Learner / font catch |
|-----|-----------------|--------------------------|----------------------|
| **Alchemical Symbols** | `U+1F700`–`U+1F77F` | Vessels, operations (calcination, dissolution, distillation, coagulation), metals, planetary-metal signs. Maps to process / “treat as” metaphors emoji usually cover with lab-coat scenes. Best closed Unicode set for this job. | Text presentation; restyles with the symbol font. |
| **Egyptian Hieroglyphs** | `U+13000`+ | Large *thing* inventory (person, house, water, reed, loaf, boat, poses). Overlaps emoji objects; leftover value is parts/poses emoji never isolated. | Dedicated font; optional specialist band, not a second full lexicon. Bare signs only — not format-control stacking. |
| **Linear B Ideograms** | `U+10080`–`U+100FA` | Commodity / tally icons (livestock, grain, vessels, cloth, bronze) vs emoji product photos. Font also covers syllabary + Aegean numbers if wanted. | Thinner OS coverage than alchemical. |
| **Phaistos Disc** | `U+101D0`–`U+101FF` | ~45 Bronze Age pictographs (walker, hide, bee, ship, helmet). Almost no RGI twins. | Weak shared cultural reading; boutique pack. |

### Also in scope: musical symbols

| Set | Range (approx.) | Why | Catch |
|-----|-----------------|-----|--------|
| **Musical Symbols** | `U+1D100` (plus related blocks in Noto Music) | Atomic signs: clefs, noteheads, rests, accidentals, fermata, coda, pedal, dynamics-as-symbols. Useful if a music band of roots is wanted. | **Plain-text** music, not SMuFL/Bravura scores. Seed **isolated** codepoints. Combining stems/flags/beams look broken without music OpenType. |

Noto Music also covers Byzantine Musical Symbols and Ancient Greek Musical Notation; those are optional extras, not required for a first music band.

### Medium / usually skip (recorded so they are not rediscovered)

| Set | Note |
|-----|------|
| Yijing hexagrams / Tai Xuan Jing | Situation glyphs; must learn the system. |
| Chess Symbols beyond ♔♕, mahjong/domino/cards | Niche or already overlapped by game emoji. |
| Misc Symbols text-only leftovers | Recycling subtypes, Go stones, dice ⚀–⚅, trigrams — neighbors in `U+2600` are often already emoji in the CSV. |
| Kangxi / CJK radicals | Compact “essence of X”; script-looking seeds next to Latin orthography; overlaps emoji. |
| Dingbats / Wingdings leftovers | Ornaments; duplicates of check/star/scissors emoji. |
| Arrows / math operators | Grammar-adjacent marks, not extra roots (direction is already morphology). |

## Font support

The site body face is IBM Plex (`web/index.html`). None of the candidate blocks live there. Emoji still come from **color emoji** fonts. These sets are **monochrome outline**.

All five in-scope sets have a first-party **Noto** face (SIL OFL; Fontsource packages). That is the practical web story. Chat apps, Docs, and SMS tofu unless the reader has the face.

| Set | Web font | Useful subset size (order of) | Typical OS without a webfont |
|-----|----------|-------------------------------|------------------------------|
| Alchemical | [Noto Sans Symbols](https://fonts.google.com/noto/specimen/Noto+Sans+Symbols) | Small slice of that family | Sometimes Segoe UI Symbol / Apple Symbols; often tofu on Linux |
| Phaistos | [Noto Sans Symbols 2](https://fonts.google.com/noto/specimen/Noto+Sans+Symbols+2) | ~45 glyphs; subset is tiny | Rare on desktop; not in emoji fonts |
| Linear B ideograms | [Noto Sans Linear B](https://notofonts.github.io/noto-docs/specimen/NotoSansLinearB/) | ~270 glyphs with syllabary + Aegean numbers | Windows *Segoe UI Historic* if present; macOS/iOS weak |
| Egyptian | [Noto Sans Egyptian Hieroglyphs](https://fonts.google.com/noto/specimen/Noto+Sans+Egyptian+Hieroglyphs) | Full block ~390 KB woff2 | Some Windows Historic SKUs; otherwise tofu |
| Musical | [Noto Music](https://fonts.google.com/noto/specimen/Noto+Music) | Music subset ~55 KB woff2 | Partial Segoe / Apple Symbols; **not** Bravura/SMuFL |

Egyptian is the file-size outlier. The others are cheap if subsetted to assigned seeds only.

## Mixing (sentence vs word)

**Plain text:** UTF-8 can put alchemical, hieroglyph, Linear B, Phaistos, musical, and emoji in one line. Encoding cost is nil.

**Drawing on the web:** one `font-family` name with several `@font-face` rules and `unicode-range` (Noto Symbols, Symbols 2, Linear B, Egyptian Hieroglyphs, Music, then color emoji, then Plex). The browser picks a face **per character**. Self-hosting those files is straightforward (~0.5–0.7 MB with full Egyptian; tens of KB if every face is subset to used codepoints).

What still looks wrong without extra work:

- **EM square / x-height.** Symbols vs squarish Linear B vs tall hieroglyphs vs staff-relative music.
- **Advance width.** Uneven rhythm next to color-emoji boxes.
- **Stroke and color.** Plex + Noto Symbols + COLR/bitmap emoji reads as several packs, not one script.
- **Baseline.** Music sits as if on a staff; a treble clef blows default `line-height`. Hieroglyphs sit like letters; emoji sit in a graphic box.

CSS can only approximate (`font-size` per span, `vertical-align`, a tall shared `line-height`). Even metrics need a **merged subset font** (shared UPM/baseline), e.g. fonttools `pyftsubset`.

### Sentence (space- or cell-separated pictographs)

**Easy** with the unicode-range stack. Prefer **one pictograph per root in a fixed square** (same layout idea as `speed-reading-icons.md` option 2), not a raw run of mixed fallbacks.

### Concatenated “word” (no spaces)

Still valid UTF-8; fallback still per character. There is **no** ZWJ or ligature that fuses an alchemical sign with a hieroglyph. Combining marks stay in-script (musical stems do not attach to Phaistos; Egyptian insertion does not stack a retort). The result is a ransom strip unless each root is an inline **cell**.

### Inside romanized Agalan

**Out of scope.** Roots stay unicase Latin (`agala`). Pictographs are seed/display, not letters after the PoS.

### Paste outside the site

Hard for the reader: tofu in apps that only ship emoji fonts. In-app webfonts do not travel with the clipboard.

## Difficulty (end user + in-app)

| Goal | Difficulty |
|------|------------|
| Store mixed seeds in CSV / lexicon grid | Easy |
| HTML sentence of mixed pictographs with webfonts | Easy (`unicode-range`) |
| Same sentence even next to color emoji | Medium (fixed slots and/or merged metrics) |
| Cross-set “compound glyph” | High / skip — Unicode will not help |
| Paste into Slack, Word, SMS | Hard (tofu) |
| VitePress / web UI next to Plex | Easy–medium: Fontsource CSS or one subset WOFF2 |

## Suggested use if adopted

1. Keep emoji as the default everyday seed.
2. Add **alchemical** first if a process/metaphor band is wanted (best complement, small font slice, text presentation).
3. Add **musical** only as **atomic** signs if a music band is wanted.
4. Treat **Egyptian / Linear B / Phaistos** as optional specialist seeds, not a second general lexicon.
5. In speed-read UI: **icon cells** + shipped Noto subsets; do not rely on OS fallback; do not concatenate mixed scripts into one visual word.
6. If `speed-reading-icons.md` ships named pack ids, Unicode can remain an optional `emoji`-style column for plain-text identity; pack ids still win for restyling.

## Open questions

- One extra CSV column vs overloading `emoji` with any pictograph codepoint?
- Specialist bands in the dictionary UI (filter “alchemical”) vs a flat list?
- Subset-on-publish pipeline vs shipping full Noto faces?
- Literal English lemmas for alchemical operations: keep Unicode/alchemy names, or learner glosses only?

## See also

- `speed-reading-icons.md`, `speed-reading-view.md`
- [lexicon.md](../grammar/lexicon.md)
- [`data/lexicon-published.csv`](../../data/lexicon-published.csv)

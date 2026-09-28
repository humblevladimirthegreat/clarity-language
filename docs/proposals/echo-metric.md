# Proposal: pronunciation-based English echo

**Status:** PROPOSED (2026-09-28); nothing under `data/` or `docs/grammar/` has changed.  
**Related:** `lexicon-revamp.md` (its dry run introduced the first echo metric), [data/lexicon-published.csv](../../data/lexicon-published.csv), [scripts/prototype-lexicon-revamp.ts](../../scripts/prototype-lexicon-revamp.ts), [src/word-converter.ts](../../src/word-converter.ts)

## Motivation

Roots are meant to echo the English word for their concrete sense (`olove` *love*, `owolo` *wolf*), so learners can hook the root onto a word they already know. The `lexicon-revamp.md` dry run added a first **echo metric** to compare settings. It showed that echo is where most of the trade-offs land (the second-consonant ban, the swap, the stop rules). The metric has three weaknesses, and they are shared by the generator that builds roots:

- **It reads spelling, not sound.** The converter maps English letters, so silent and merged letters become consonants (*knife*, *laugh*, *thumb*, *-ing*). Hand-written spelling → sound rules fix the common cases only. Vowels are unreliable: *i* always becomes `u`, so vowels get little weight.
- **It ignores which consonants a listener notices.** A consonant at the start of the stressed syllable is heard far more clearly than one in an unstressed syllable or at a syllable's end. The metric treats them alike.
- **It can't see distance.** A second consonant borrowed from the end of a long word (*hippopotamus* → `…z…` from the final *s*) earns the same credit as the next consonant. So the look-ahead limit had no measurable effect, although it clearly matters by ear.

A fourth problem sits upstream of both: **the English labels themselves**. The metric and the generator both echo the `concrete` column, and many of those labels aren't the word a speaker would use.

## Step 1: fix the English labels

283 of 1,350 `concrete` labels are hyphenated (76 of them countries). A hyphenated label is a warning sign: it is usually an emoji's descriptive name, not a word. The root then echoes a description nobody says. Kinds seen in the lexicon:

| Kind | Examples | Fix |
|---|---|---|
| Descriptive name for something that has a plain word | *sewing-needle*, *computer-mouse*, *hand-fan*, *musical-keyboard*, *video-camera*, *life-ring* | use the plain word (*needle*, *mouse*, *fan*, *keyboard*, *camcorder*, *lifebuoy*) |
| Description of an expression or gesture | *nervous-laugh*, *wink-tongue*, *blank-face*, *eye-roll*, *blow-kiss* | find the word the emoji stands for (*giggle*?, *tease*?, *deadpan*?), or ask whether the row is worth a root at all |
| Variant that differs only by a modifier | *exclamation-red* / *exclamation-double*, *question-red*, *chart-up*, *down-triangle*, *speaker-low* | decide what the row means; if it's the same sense as its sibling, merge or drop it; otherwise name the sense (*alarm*?, *growth*?, *quiet*?) |
| Real compound or fixed name | *hot-dog*, *x-ray*, *santa-claus*, *christmas-tree*, *fortune-cookie* | keep, but say which word the root echoes |
| Country or place | *american-samoa*, *bosnia-herzegovina*, *st-helena* | keep; echo the distinctive word (*samoa*, *bosnia*, *helena*) |

Proposed changes:

1. **Review all 283 hyphenated labels** by the table above. An agent can draft the replacements, with a reason per row; an editor accepts or rejects each.
2. **Add an `echo_word` column** to `lexicon-published.csv`: the single English word the root is built from, when it differs from `concrete` (*hot-dog* → *hotdog*, *american-samoa* → *samoa*). The generator and the metric use it; `concrete` stays the gloss.
3. **Flag same-sense rows** (the modifier variants) for a meaning decision before the revamp spends a root on each.

Renaming `concrete` affects docs: translation **Roots used here** lines must match the lexicon gloss, and `build` checks that. Renames go through the normal lexicon edit and `npm run build`.

## Step 2: pronunciation data

Use the **CMU Pronouncing Dictionary** (about 134,000 words, including many names; permissive licence; one text file, downloaded to `tmp/` like the frequency list — no new library). Each word is a phoneme string with a stress mark on each vowel: *smile* = `S M AY1 L`, *hippopotamus* = `HH IH2 P AH0 P AA1 T AH0 M AH0 S` (`1` = primary stress, `2` = secondary, `0` = unstressed).

- **Coverage:** look up `echo_word` (or each word of `concrete`). Words not in the dictionary fall back to today's spelling → sound rules, and the report lists them.
- **Phoneme → Agalan letter map.** A design decision, like today's spelling map. A first draft:

| English sounds | Agalan |
|---|---|
| P B | `b` |
| T D | `d` |
| K G | `g` |
| F V | `v` |
| S Z SH ZH TH DH | `z` |
| CH JH | `z` (or `d`) |
| HH | `h` |
| W | `w` |
| Y | `y` |
| M N NG | `m` / `n` / `n` |
| L R | `l` / `r` |
| AA AE AH | `a` |
| EH EY IH IY | `e` |
| AO OW OY | `o` |
| UH UW AW | `u` |

   The stressed vowel's mapping matters most; unstressed `AH0` ("uh") should not count against a root.

## Step 3: a better metric

Score a root by the **best in-order alignment** of its letters with the English sounds (the dynamic-programming match used for spell-checking), with weights for salience and distance. Exact matches only.

- **Consonant salience:** start of the word 3; start of the stressed syllable 2; any other syllable onset 1; syllable-final 0.5.
- **Distance decay:** each English consonant skipped between two matched root consonants multiplies the later match by 0.6. This makes the look-ahead limit measurable.
- **Vowels:** the root's first vowel against the word's first vowel; each later root vowel against the vowel after the consonant it follows. The stressed vowel counts 1, other vowels 0.5, unstressed "uh" 0 (never a penalty).
- **Normalise** by the best score any root of that length could get for that word, so a short word that fits a 3-letter root perfectly scores 1.
- **Multi-word labels:** score against `echo_word` if set; otherwise take the best of each word and the joined label.

Then **check the metric by ear**: rate about 50 roots from 0 to 3 (editor, with an agent draft), and tune the weights until the metric ranks them the same way.

## Step 4: use it in the generator

Once the metric is trusted, build candidates from the phonemes too: keep the word's first consonant, prefer the stressed syllable's onset as the second consonant (subject to the second-consonant ban and the stop rules in `lexicon-revamp.md`), and rank candidates by the metric instead of by the converter's list order. That should raise echo more than any metric change, because today the generator works from spelling and the metric only measures the result.

## Open questions

- Which modifier-variant rows keep separate roots? That is a meaning decision, not an echo one.
- Is *ch* / *j* closer to `z` or `d` for learners? Is *sh* `z`?
- Should the English vowel *ee* (IY) map to `e`, or does it stay a free choice?
- For countries, is the distinctive word always the right echo (*samoa* vs *american*)?
- Should echo be scored against the abstract sense for rows where the abstract is the main use (`agala` is mostly *clarity*)? The dry run scores concrete only, because that is what the root was built from.

# Proposal: pronunciation-based English echo

**Status:** Step 1 APPLIED (2026-09-28): 115 `concrete` labels renamed in place (no `echo_word` column); Step 2 APPLIED (2026-09-28): CMU lookup + phoneme map; Steps 3–4 PROPOSED.  
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
2. **Rename `concrete` in place** to the word the root echoes (*hot-dog* → *hotdog*, *bosnia-herzegovina* → *bosnia*). No separate `echo_word` column: `concrete` is both the gloss and the echo source.
3. **Flag same-sense rows** (the modifier variants) for a meaning decision before the revamp spends a root on each.

Renaming `concrete` affects docs: translation **Roots used here** lines must match the lexicon gloss, and `build` checks that. Renames go through the normal lexicon edit and `npm run build`.

## Step 2: pronunciation data

Use the **CMU Pronouncing Dictionary** (about 134,000 words, including many names; permissive licence; one text file, downloaded to `tmp/` like the frequency list — no new library). Each word is a phoneme string with a stress mark on each vowel: *smile* = `S M AY1 L`, *hippopotamus* = `HH IH2 P AH0 P AA1 T AH0 M AH0 S` (`1` = primary stress, `2` = secondary, `0` = unstressed).

**Status:** APPLIED (2026-09-28) as [scripts/echo-pronunciation.ts](../../scripts/echo-pronunciation.ts) → `tmp/echo-pron/pron.csv` + `report.md`.

- **Build temporarily ignored:** while this work only edits the lexicon, `npm run build` is not run and its doc failures (glosses and **Roots used here** lines that still use old labels) are expected. Docs are retied in one pass once the lexicon settles.
- **Variant:** score the **first** CMU pronunciation, except where the script's `VARIANTS` picks the right sense (*tear* = *teer*, *wind* = air, *id* / *un* / *us* = letters, *st* = *saint*, *record* = noun). The CMU download is pinned to cmudict commit `7479086`.
- **Coverage:** look up `concrete`. When the only difference from a CMU entry is a hyphen, the lexicon is respelled to match CMU (`--write`; applied: *video-game* → *videogame*). A label stays hyphenated when the two-word form is the more common lookup (`KEEP_HYPHEN`: *old-man*). A joined label missing from CMU that splits into two common CMU words is re-hyphenated (applied: 35, e.g. *airkiss* → *air-kiss*, *firetruck* → *fire-truck*; *tamale*, *singlet*, *pinata*, *mahjong* excluded). A hyphenated label is looked up by its parts. No spelling fallback: a label missing from CMU is reported, and the fix is to find a label that is in CMU. Small territories keep their names; loanwords are replaced with a CMU word where possible (applied: *onigiri* → *rice-ball*, *matryoshka* → *nesting-doll*, *capsicum* → *bell-pepper*, *alembic* → *still*, *hanafuda* → *flower-cards*, *sauropod* → *brontosaurus*, *hamsa* → *hand-of-fatima*, *boba* → *bubble-tea*). Kept although missing, because no English word is as recognisable: *tempura*, *tamale*, *mahjong*, *pinata*, *sagittarius*, *ophiuchus*. Also replaced: *shush* → *hush*, *unamused* → *unimpressed*, *orate* → *orator*, *sparkler* → *sparkle*, *singlet* → *tank-top*, *prev-track* → *previous-track*. The script's `OVERRIDES` gives our own pronunciation (American, CMU phonemes) for *hibiscus*, *khanda*, *unlink*, *interrobang*, the six kept loans and the 19 territories CMU lacks (keyed by the whole label). Now: 1,166 exact, 183 by parts, 0 missing.
- **Phoneme → Agalan letter map.** `x` and `th` never occur inside a root, so their English sounds map elsewhere. `y` is allowed in roots as a consonant only.

| English sounds | Agalan |
|---|---|
| P B | `b` |
| T D | `d` |
| K G | `g` |
| F V TH DH | `v` |
| S Z | `z` |
| SH ZH CH JH HH | `h` |
| W | `w` |
| Y | `y` |
| M | `m` |
| N NG | `n` |
| L | `l` |
| R | `r` |
| AA AE AH AY AW | `a` |
| EH EY IH IY ER | `e` |
| AO OW OY | `o` |
| UH UW | `u` |

   Stressed AH (*love*, *cup*) maps to `a` even where existing roots use `o`: the metric is meant to improve existing roots, not to fit them. The stressed vowel's mapping matters most; unstressed `AH0` ("uh") is written `·` and never counts against a root.

## Step 3: a better metric

Score a root by the **best in-order alignment** of its letters with the English sounds (the dynamic-programming match used for spell-checking), with weights for salience and distance. Exact matches only.

- **Consonant salience:** start of the word 3; start of the stressed syllable 2; any other syllable onset 1; syllable-final 0.5.
- **Distance decay:** each English consonant skipped between two matched root consonants multiplies the later match by 0.6. This makes the look-ahead limit measurable.
- **Vowels:** the root's first vowel against the word's first vowel; each later root vowel against the vowel after the consonant it follows. The stressed vowel counts 1, other vowels 0.5, unstressed "uh" 0 (never a penalty).
- **Normalise** by the best score any root of that length could get for that word, so a short word that fits a 3-letter root perfectly scores 1.
- **Multi-word labels:** take the best of each word and the joined label.

Then **check the metric by ear**: rate about 50 roots from 0 to 3 (editor, with an agent draft), and tune the weights until the metric ranks them the same way.

## Step 4: use it in the generator

Once the metric is trusted, build candidates from the phonemes too: keep the word's first consonant, prefer the stressed syllable's onset as the second consonant (subject to the second-consonant ban and the stop rules in `lexicon-revamp.md`), and rank candidates by the metric instead of by the converter's list order. That should raise echo more than any metric change, because today the generator works from spelling and the metric only measures the result.

## Open questions

- Which modifier-variant rows keep separate roots? That is a meaning decision, not an echo one.
- Which CMU label replaces each of the 79 missing ones (`tmp/echo-pron/report.md`)?
- For countries, is the distinctive word always the right echo (*samoa* vs *american*)?
- Should echo be scored against the abstract sense for rows where the abstract is the main use (`agala` is mostly *clarity*)? The dry run scores concrete only, because that is what the root was built from.

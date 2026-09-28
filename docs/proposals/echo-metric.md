# Proposal: pronunciation-based English echo

**Status:** Step 1 APPLIED (2026-09-28): 115 `concrete` labels renamed in place (no `echo_word` column); Step 2 APPLIED (2026-09-28): CMU lookup + phoneme map; Step 3 APPLIED (2026-09-28): pronunciation metric, tuned on agent-drafted, editor-accepted ratings; Step 4 APPLIED (2026-09-28): the converter builds candidates from phonemes and ranks them with the metric. The published lexicon is not rewritten yet.  
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
- **Coverage:** look up `concrete`. When the only difference from a CMU entry is a hyphen, the lexicon is respelled to match CMU (`--write`; applied: *video-game* → *videogame*). A label stays hyphenated when the two-word form is the more common lookup (`KEEP_HYPHEN`: *old-man*). A joined label missing from CMU that splits into two common CMU words is re-hyphenated (applied: 35, e.g. *airkiss* → *air-kiss*, *firetruck* → *fire-truck*; *tamale*, *singlet*, *pinata*, *mahjong* excluded). A hyphenated label is looked up by its parts. No spelling fallback: a label missing from CMU is reported, and the fix is to find a label that is in CMU. Small territories keep their names; loanwords are replaced with a CMU word where possible (applied: *onigiri* → *rice-ball*, *matryoshka* → *nesting-doll*, *capsicum* → *bell-pepper*, *alembic* → *distiller*, *hanafuda* → *flower-cards*, *sauropod* → *brontosaurus*, *hamsa* → *hand-of-fatima*, *boba* → *bubble-tea*). Kept although missing, because no English word is as recognisable: *tempura*, *tamale*, *mahjong*, *pinata*, *sagittarius*, *ophiuchus*. Also replaced: *shush* → *hush*, *unamused* → *unimpressed*, *orate* → *orator*, *sparkler* → *sparkle*, *singlet* → *tank-top*, *prev-track* → *previous-track*. The script's `OVERRIDES` gives our own pronunciation (American, CMU phonemes) for *hibiscus*, *khanda*, *unlink*, *interrobang*, the six kept loans and the 19 territories CMU lacks (keyed by the whole label). Now: 1,166 exact, 183 by parts, 0 missing.
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

**Status:** APPLIED (2026-09-28) as [scripts/echo-metric.ts](../../scripts/echo-metric.ts) → `tmp/echo-pron/metric.csv` + `metric.md`. The phoneme map moved to [scripts/echo-pronunciation-map.ts](../../scripts/echo-pronunciation-map.ts), and `pron.csv` now marks word breaks with `|`. The lexicon dry run uses the metric with `--pron-echo`.

Echo is always scored against the **concrete** sense: the root is built from it, and the concrete label is what a learner hooks the root onto. Rows whose abstract sense is the main use (`agala` is mostly *clarity*) are no exception.

A root (V C V or V C V C V) is scored by its **best in-order alignment** with the English sounds. Only exact letter matches count. Published roots still spell the glide `j`; it is read as `y`.

- **Syllables:** CMU has no syllable breaks. A consonant cluster between two vowels goes to the next syllable as far as English allows that cluster at the start of a word (the clusters that start ≥ 20 CMU words): *hip·po·pot·a·mus*, *mas·ter*, *a·pron*.
- **Consonant salience:** start of the word 3; start of the primary-stress syllable 2; any other syllable onset 1; later consonants of an onset cluster 1 (*smile*: `z` 3, `m` 1); syllable-final 0.75 (always below an onset). Secondary stress counts as unstressed.
- **Distance decay:** each English consonant skipped between two matched root consonants multiplies the later match by 0.4. It doesn't apply before the first match: a root that skips the word's first consonant only loses that consonant's weight.
- **Vowels:** the root's first vowel against the word's first vowel; each later root vowel against the vowel after the consonant it follows (no credit when that consonant is unmatched). The primary-stress vowel counts 0.5, other vowels 0.25, unstressed "uh" 0 (never a penalty).
- **Unmatched root letters** earn nothing and cost nothing.
- **Normalise** by the ceiling: the same alignment when every root letter may be anything, so a word that a root of that length fits perfectly scores 1.
- **Multi-word labels:** the best of the joined label and each word, each against its own ceiling. In the joined label only the first word's first consonant gets the word-start weight.

**Checked by ear:** `--sample` drafted 50 roots in `tmp/echo-pron/ratings.csv` (evenly spread by score, plus spelling traps: *knife*, *knot*, *laugh*, *ghost*, *phone*, *wrench*, *hippopotamus*). An agent rated them 0–3 without seeing the scores, and the editor accepted the ratings. `--tune` grid-searches the weights for rank agreement (Spearman ρ). The first weights (syllable-final 0.5, decay 0.6, vowels 1 / 0.5) scored ρ 0.73. The grid preferred syllable-final consonants equal to onsets (ρ 0.80). The editor ruled that out, since a syllable-final consonant is heard less clearly, so the search keeps them below 1. With that limit, the weights above score 0.78. Many settings land within 0.01 of that, so the onset weights stay as first proposed. The two changes are a stronger decay and vowels counting half.

**Dry run (2026-09-28):** mean echo of today's roots is 0.63 by pronunciation vs 0.78 by spelling. The spelling metric overrated roots that match silent or merged letters. With `--pron-echo`, the dry run lowers long-root echo (0.62 → 0.55), because the generator still builds long roots from spelling. Short roots, which the metric places, rise from 0.66 to 0.84. Step 4, which rebuilds the long roots from the phonemes, raises their mean from 0.62 to 0.89.

## Step 4: use it in the generator

**Status:** APPLIED to the converter (2026-09-28): [src/word-converter.ts](../../src/word-converter.ts) builds roots from CMU phonemes and ranks them with the metric. `convert-word` and `convert-word --lexicon` use it, so `--lexicon` writes `tmp/lexicon-retie-map.json` from those spellings. Published roots are not rewritten yet. Dry-run result (`tmp/lexicon-revamp/report.md`, same candidate function): long-root mean echo **0.623 → 0.891** (median 0.706 → 0.905; roots under 0.4: 333 → 1 of 1,278). Short roots stay at the Step 3 placement, **0.661 → 0.836**. All roots **0.625 → 0.888**. Checks are all zero. Consonant mix (current → dry run, share of consonants): stops 34.8% → 44.1%, fricatives 20.8% → 35.6%, glides 5.2% → 7.5%, `l m n r` 39.3% → 12.8% (the second-consonant ban keeps `l m n r` out of the second slot, so the remaining share is first consonants).

- **Replace, not add:** `src/word-converter.ts` no longer builds candidates from spelling. A word missing from CMU is an error.
- **Candidates:** the first consonant is the label's first consonant (for a multi-word label, the first consonant of any of its words). The second consonant may be any letter except `l` / `m` / `n` / `r` (the second-consonant ban). It may be a stop only if the English word has that stop, so filler stops never appear. All vowels are tried; vowels follow the phoneme map, so stressed AH gives `a`.
- **Ranking:** by the metric. Ties go to fewer stops, then alphabetical order. When the stressed onset is banned, the next-best onset by score wins. The converter-era rule that preferred a non-stop second consonant over an English stop no longer applies. The metric decides.
- **Collisions:** placement is unchanged (priority, then regret). Each row takes its best-scoring free candidate.
- **Short roots** were already placed by the metric over every VCV. They use it unchanged.
- **Success measure:** the mean echo of long roots rises. The report now also lists the share of consonants in each group (stops, fricatives, glides, `l m n r`).

## Open questions

- Which modifier-variant rows keep separate roots? That is a meaning decision, not an echo one.
- For countries, is the distinctive word always the right echo (*samoa* vs *american*)?

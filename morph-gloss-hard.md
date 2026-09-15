# Morph-gloss cases that are hard to fix correctly

Editor notes. These are **not** leftover `--check-ambiguity` hits. They are places where a mechanical serializer tweak, or a silent first-match, is easy to get wrong for learners.

Corpus lint still fails CI only on leftover ambiguity and a stale `morph-gloss-ambiguity-report.md`. Easy mismatches should be retied or serialized; this file is the inventory of **residual risk** after those reties.

## Isolated resume (`-r`) without an antecedent in the example

Teaching lines often show **resume alone** after a previous block named the referent (`zazawarx` on [plurality.md](docs/grammar/plurality.md)). Resolve only looks inside the scanned Agalan string.

**House-cast** (`azawa` / `ululo` / `uhubu`) now glosses as `z-←Azawan` (etc.) even with no same-line binder. That matches [glosses.md](docs/meta/glosses.md#house-cast).

**Still hard:** a non-house-cast content `-r` with no same-line match (`z-←tea` with no prior `tea`). Guessing the literal of the current root is not the same as “most recent matching antecedent.” Do not invent a second binder rule for isolated drills.

## Named `-n` on mid-word `x` (DIR × name vs name × name)

The reference ending belongs to the **whole word**. A naive “**-n** → title every stem” rule names the left piece too (`Eweze` instead of compass *west*).

Viewpoint laterals now force a closed **arrow-root** set to the published **compass** literal (`west`, `east`, …) and apply named reading on the **anchor**. Ordinary phrasal names still title **each** piece (`j-Ubune-x-Unowen`).

**Still hard:** any other `ROOT x NAME` family that should keep a non-name sense on the left (not in the compass set). Expanding that set without a grammar cue will mis-name compounds.

## Overlay grain vs ordinary ending (emotion ACT / LOCUS)

[lexicon-overlays.csv](data/lexicon-overlays.csv) hosts HIGH / MED / LOW / INTERNAL / EXTERNAL / CIRCUM on **-m** (`hogegam`, …). Grammar examples were **-l** (ocean-wave / candle). Those pages now use overlay **-m**.

**Still hard:** `/h/` + **-l** on the same roots is ordinary *ocean-wave* / *candle*. Do not make overlay fire on **-l** or `/z/` `zogegal` becomes HIGH.

## Digitless number stems after `x` (quasi / grain / void / …)

Spelling `x` + marker + `e-` produces extra hyphens (`x---e-`) if the morph line echoes the stem. Kind morphs now use English (`quasi`, `grain`, `infinity`, `void`, `origin`, `telos`) from [numeric-derivation.md](docs/grammar/numeric-derivation.md).

**Still hard:** free number words (`g-e-` *imaginary amount*) vs kind `ROOTx-e-` (*quasi-*). The same stem must not share one English label across families. Hyperbole / zero×exp / `_` codes still need per-row English, not a second hyphen dump.

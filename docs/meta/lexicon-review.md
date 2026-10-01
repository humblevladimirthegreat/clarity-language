# Lexicon review (local LLM)

Systematic review of the published lexicon, compounds and overlay collisions with a local model in LM Studio. The model never sees Agazan: each check is one atomic English question about a concrete / abstract / mnemonic tuple or a word pair. Output is a **triage queue for a human**; nothing here edits the lexicon CSVs. Flag-emoji rows (countries and territories) are excluded from every check, and compounds built on them too.

Code: `scripts/lexicon-review.ts` and `scripts/lib/lexicon-review-*.ts`. Results land in `data/lexicon-review/` (`<check>.jsonl`, `pairs.jsonl`, `gold.jsonl`, `triage.csv`).

## Setup

- LM Studio server running with `qwen/qwen3.8-27b` loaded (100k context) and, for `pairs --embed`, `text-embedding-nomic-embed-text-v1.5`.
- `cp .env.example .env` (model id, base URL). `npm run lexicon-review -- ping --smoke-test` lists loaded models.
- **Reasoning:** `--reasoning none` (the default here) sends `reasoning_effort: none`, which skips the thinking trace: about 0.5 s per call instead of about 5 s. The setting is part of the cache key, so `none` and `default` results never mix. Calibrate both before trusting `none`.

## Commands

```
npm run lexicon-review -- ping [--smoke-test]
npm run lexicon-review -- calibrate leap,mnemonic-sound --sample 60 --seed 1   # write gold.jsonl skeleton
npm run lexicon-review -- calibrate leap,mnemonic-sound                        # score against labeled gold
npm run lexicon-review -- run <check> [--limit N] [--only ROOT,KEY] [--single-pass | --full]
npm run lexicon-review -- pairs --embed --scan                                 # candidates for pair checks
npm run lexicon-review -- report <check|a,b|all> [--worst 30]
npm run lexicon-review -- triage                                               # merge all flagged rows
npm run lexicon-review -- status
```

A `run` is resumable: results are cached by a hash of model + reasoning + full prompt, so editing a row (or a prompt) re-asks only what changed, and a failed call is retried on the next run. Default `run` is **adaptive**: every subject gets pass 0; pass 1 (a differently phrased prompt) is asked only where pass 0 landed within a point of the flag boundary. `--full` asks both passes everywhere.

## Verdicts

Each call returns `{score 1–5, reason, tag?}`. A subject is **flagged** when both passes flag, **unstable** when the passes differ by 2+ points (a human decides), otherwise ok. A lone clear pass is final (ok); a lone borderline pass stays `missing` until pass 1 runs.

## Checks

| Check | Subject | Flags |
|-------|---------|-------|
| `leap` | published row | abstract is not a natural figurative extension of the concrete |
| `mnemonic-sound` | published row | mnemonic restates a word or does not link the senses |
| `abstract-is-abstract` | published row | abstract word names something physical |
| `concrete-is-concrete` | published row | concrete word is not picturable |
| `sense-primary` | published row | intended abstract sense is a minor sense of the English word |
| `alias-fit` | one `english_aliases` cue | cue is not a near-synonym |
| `role-english` | one `english_by_pos` piece | packed lemma is not the natural English for that role |
| `compound-concrete` / `compound-abstract` | compound | left + right do not yield the gloss |
| `bias-prone` | published row | abstract concept is prone to a cognitive bias (tag names it) |
| `bias-image` | rows flagged by `bias-prone` | the concrete image could prime that bias |
| `pair-synonym` | candidate pair | two entries mean nearly the same |
| `overload` | same-abstract pair | duplicate sense or ambiguous gloss (tag) |
| `special-form-conflict` | published abstract × overlay gloss | published row duplicates a closed special form |

`pairs` builds candidates without the model (inflection-aware shared abstract / concrete / alias, overlay gloss collisions), then adds the closest embedding pairs (ranked, not thresholded: nomic similarities all sit high) and, with `--scan`, one 100k-context prompt that asks the model for groups of near-synonyms among all abstracts.

## Protected roots

A root that hosts an overlay row is marked `protected`. It is reported, but the review never proposes changing the root (TODO: do not modify roots used by lexicon-overlays). For an overlay pair, the published row is the one to revise.

## Calibration gate

The model is a 27B judge, not an authority. Before a full run, label a sample by hand:

1. `calibrate <checks> --sample 60` writes `gold.jsonl` (a third suspect rows, the rest random).
2. Set each `label` to `good`, `bad` or `borderline` (`view` shows the entry; `note` is free text).
3. `calibrate <checks>` scores the check. **Keep** needs at least 80% accuracy and 70% recall on `bad`, over at least 10 labeled entries; otherwise rewrite the prompt (changing it invalidates the cache) or drop the check. `borderline` labels are ignored.
4. Re-run calibration with `--reasoning default` and with another loaded model (`--model`) to see whether they add recall.

## Suggested order

1. Calibrate `leap`, `mnemonic-sound`, `role-english`, `bias-prone`.
2. Row checks over all rows: `run leap`, `mnemonic-sound`, `abstract-is-abstract`, `concrete-is-concrete`, `sense-primary`.
3. `run alias-fit`, `role-english`, `compound-concrete`, `compound-abstract`.
4. `pairs --embed --scan`, then `run pair-synonym`, `overload`, `special-form-conflict`.
5. `run bias-prone`, then `run bias-image`.
6. `triage`, then work through `data/lexicon-review/triage.csv` (`human_decision` and `notes` survive a re-run of `triage`). Edit the lexicon through the normal workflow and re-run the affected checks.

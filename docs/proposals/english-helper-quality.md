# Proposal: Checking and improving the English helper

**Status:** PARTIALLY IMPLEMENTED. Phase 1 is built: the **checkpoint** set, *word in prompt*, *pattern in prompt*, *self-contained*, and the worklist ([`src/english-helper/coverage.ts`](../../src/english-helper/coverage.ts)). Phase 2 is built: [`cases.tsv`](../../src/english-helper/cases.tsv) and the baseline (`--check`, `--write-baseline`). Phase 3 is built: the **wild** set ([`wild.tsv`](../../src/english-helper/wild.tsv)) and gap rate, noise and prompt size on every set. Phases 4–5 are not.  
**Related:** [`src/english-helper/`](../../src/english-helper/) (analyzer, prompt, `--verify`), [`scripts/english-helper-recall.ts`](../../scripts/english-helper-recall.ts), [`scripts/frequency-coverage.ts`](../../scripts/frequency-coverage.ts), [`scripts/llm-eval.ts`](../../scripts/llm-eval.ts) (the Agebon → English counterpart), [translation checkpoints](../meta/translation-exercises.md), [recipe track](../meta/grammar-docs.md#recipe-track).  
**Design authority:** none. This is a process for the tool. Every fix it produces is either tool code or a doc row that teaches a form a grammar page already owns. A missing form is logged as a grammar gap, never invented here.

## Problem

`node scripts/english-helper.mjs --llm-prompt` is meant to give a translator everything needed to write Agebon from English without opening the grammar. A hand test on five new sentences found that the prompt fell short in several ways:

- It linked a section without showing the form (*my*, *three*).
- It had no suggestion at all for common words (*me*, *last night*, *not sure*).
- It offered an alias root on its wrong sense (*grateful* → `-l` *pray*).
- It printed digit notation that read like a spelling (`th+e`).
- It never reached the language's own feature for the word (thanks as a met sake word).
- Its notes and examples were for constructions the input didn't use.
- `--verify` passed every one of those drafts, because it only checks that a draft parses.

All of those are fixed now. They were found by chance, though, and the only standing measure has a blind spot. `npm run english-helper-recall` scores the analyzer on the doc example pairs, which are the same English that the cue rows, aliases and jobs were written against. It says nothing about English the docs never wrote, and it can't see whether a form is actually *in the prompt* or only linked.

We need a repeatable loop: a held-out test set, free metrics that answer "could the translator copy this instead of opening the docs?", a worklist ranked by impact, a fixed place for each kind of fix, and a regression net.

## Goals

1. **Measure self-containment.** For a sentence with a reference translation, report whether every word of the reference can be found in the prompt (spelled, or as a pattern shown in an example), and which words can't.
2. **Measure on held-out English.** Score on English the cue rows were not written from, beside the in-sample doc pairs.
3. **Rank the work.** Turn every miss into one row of a worklist, weighted by how often the English comes up.
4. **Route every fix to its owner.** Each failure class has one place its fix belongs: a doc row, tool code, or a logged grammar gap.
5. **Never regress silently.** Pinned regression cases and a metrics baseline both fail loudly.
6. **Stay free by default.** Everything but the optional model eval is deterministic and runs offline.

## Non-goals

- New grammar. When the reference needs a form no page teaches, or the English has no Agebon way to say it yet, that's a grammar gap: log it with the `find-english.mjs` phrases tried, and leave the decision to the editor.
- Writing Agebon sentences inside the analyzer. The helper stays suggestion-only.
- Tuning to the test set. Held-out sentences are never copied into cue rows or examples. A fix has to work for the class of word, not for the one sentence.

## What exists

| Tool | Measures | Limit |
|------|----------|-------|
| `npm run english-helper-recall` (`--set doc\|checkpoint\|wild\|all`) | per set: root recall (top-1, top-3, anywhere), construction recall (home anchor, home page), *word in prompt*, *pattern in prompt*, *self-contained* (reference sets); gap rate by word class, noise, prompt size (every set); gap rate by phenomenon and stage (wild); most-missed roots, constructions and words; writes `tmp/english-helper-report.md` and `tmp/english-helper-worklist.csv` | the worklist sorts only four classes (*missing cue*, *link without form*, *tagger*, *ranking*) |
| `npx tsx scripts/frequency-coverage.ts` | which of NGSL's 2,809 frequent lemmas the lexicon or a grammar row knows | word by word, no context, no prompt |
| `english-helper.mjs --verify` | parse, unknown words, and each content word's sense next to the English that suggested its root | checks one draft; no aggregate |
| `npm run llm-eval` | Agebon → English prompt quality, with a judge model | other direction; costs money |
| tests in `src/english-helper/*.test.ts` | pinned behavior per feature | written ad hoc, one feature at a time |
| `src/english-helper/cases.tsv` | one pinned behavior per line (`link:`, `not:`, `first:`, `has:`, `sense:`, `form:`, `no-gap`), run by `analyze.test.ts` | slot-level only; no stage column |
| `english-helper-recall --check` / `--write-baseline` | headline metrics per set against `src/generated/english-helper-baseline.json` | not in `npm test` |

## Plan

### 1. Test sets

Three sets, each scored separately:

| Set | Source | Role |
|-----|--------|------|
| **doc** | doc example pairs (what `english-helper-recall` reads today) | in-sample: catches breakage, overstates quality |
| **checkpoint** | English → Agebon practice items, with their **Also correct** answers ([`src/lint/practice-items.ts`](../../src/lint/practice-items.ts)); 68 sections today | held out from the example pool, with several right answers each |
| **wild** | a committed list of plain English sentences grouped by phenomenon (pronouns, possessives, numbers, time words, feelings, stance, clauses, questions, comparatives, kin, places) at each stage | no reference Agebon; scored on gaps, noise and size, and is the input for the model eval |

The wild set is written once (around 20 sentences per phenomenon), checked in as a TSV, and grown only through the triage loop below. It stores no Agebon, so root respelling never touches it.

### 2. Free metrics

Extend `english-helper-recall` into a report over all three sets (`--set doc|checkpoint|wild`, default all):

| Metric | Definition | Sets |
|--------|-----------|------|
| **root recall** | as today | doc, checkpoint |
| **construction recall** | as today | doc, checkpoint |
| **word in prompt** | share of reference words found verbatim anywhere in the prompt: a root line's word, an alias's two words, a job form or phrase, a detector form, an example sentence | doc, checkpoint |
| **pattern in prompt** | of the rest, the share whose construction appears in a shown example's parse (the translator can copy the shape) | doc, checkpoint |
| **self-contained** | share of sentences where every reference word is *word in prompt* or *pattern in prompt*. **The headline number.** | doc, checkpoint |
| **gap rate** | slots with no suggestion, by word class, with the top lemmas | all |
| **top-1 right** | share of slots whose first suggestion is the one the reference used | doc, checkpoint |
| **noise** | suggestions per slot, jobs per slot, and how often a guess tier (alias, WordNet, live) ranks above a grammar row | all |
| **prompt size** | characters per sentence, median and 90th percentile | all |
| **verify precision** | `--verify` on each reference answer: every *check* flag on a correct answer is a false alarm | checkpoint |
| **verify recall** | `--verify` on reference answers with one planted error each (`-l` ↔ `-m`, an alias on its other side, a grammar row's word with another ending): share flagged | checkpoint |

When an *Also correct* answer exists, a word counts as found if it matches any accepted answer. A checkpoint word missing from the prompt is the clearest sign of a link without a form.

The report writes `tmp/english-helper-report.md` and `tmp/english-helper-worklist.csv`.

### 3. The worklist

One row per miss, with columns `set, english, word, kind, lemma, frequency, owner, suggested_fix`:

- `kind` is the failure class (below).
- `frequency` is the lemma's NGSL rank, or the number of test sentences that hit it, so *me* outranks *aardvark*.
- `owner` and `suggested_fix` are filled in from the routing table.

Rows are sorted by frequency, then by how many sentences share the miss.

### 4. Failure classes and where each fix goes

| Class | Symptom | Fix goes in | Example |
|-------|---------|-------------|---------|
| **missing cue** | a common word or phrase gets a gap or only a wrong lead, but a page already teaches its form | an italic cue on the owning recipe row (`say-*.md`, `english.md`) or the owning section's table | *me* on the `uwon` row; *not sure* on the MAY row |
| **link without form** | a detector or row points at a section, but the prompt never spells the form | the analyzer: a speller (numbers), or an `e.g.` from the section, following `Teach` links | *my* → `em buwon` example; *three* → `gragol` |
| **pattern read as spelling** | a row's form is notation (`th+e`, `/ɡ/ / -r`) with no spelled word or example | the doc cell spells the word; the analyzer shows an example for any form that is only a pattern | *sure* → `thrawal` |
| **joined prose cell** | a recipe cell's prose (`X and Y`) becomes ` / ` alternatives | the doc cell becomes one code span | *last night* |
| **wrong side** | an alias or lead on the sense the English doesn't mean | the analyzer spells both sides; `--verify` flags it | *grateful* → *pray* |
| **feature not reached** | the English has a dedicated Agebon feature (sakes, evidentials, clusivity), but the helper offers only a root | a recipe row that names the feature for that English word | *grateful* → met sake word |
| **ranking** | the right suggestion is there but below a worse one | cue rank, tier order or slot order in the analyzer | listener *you* above generic *you* |
| **tagger** | wrong word class or lemma from compromise | `tag.ts` overrides, or a context rule in the analyzer | *that* tagged as a preposition |
| **opener / structure** | a clause-level English structure with no detector | `detectors.ts` (pointers only), with its links in `detectorLinks` | *that* + clause → `darl` |
| **prompt noise** | notes, examples or leads the input doesn't need | `llm-prompt.ts` selection | fragment examples; unrelated reader notes |
| **verify blind spot** | a wrong draft passes `--verify` | `verify.ts` | a parse with no sense check |
| **grammar gap** | no page teaches a form for the meaning | **nothing in the tool.** Log it with the `find-english.mjs` phrases tried, for an editor's decision | |

Two rules keep fixes honest:

- **Before adding a cue row,** run `find-english.mjs` and open the owning section. The row must restate a form the section already teaches, and the build must pass.
- **When a fix fixes one sentence, find its class.** Then confirm the fix works on at least two other sentences of that class from the wild set.

### 5. Regression net

- **Cases file.** `src/english-helper/cases.tsv` holds one line per pinned behavior: English, the slot word, and an expectation. Supported expectations:
  - `link:<page.md#id>` — some suggestion links this section;
  - `first:<kind>` — the first suggestion is of this kind;
  - `sense:<english sense>` — a root with this sense is suggested;
  - `form:<number or closed word>` — this word is spelled;
  - `no-gap`;
  - `not:<page.md#id>` — no suggestion links this section.

  Expectations name senses and sections, never root spellings, so a retie never breaks them. One `analyze.test.ts` test runs the file. Adding a case is one line, and each worklist fix adds at least one.
- **Baseline.** `src/generated/english-helper-baseline.json` holds the headline metrics per set. `english-helper-recall --check` fails when one drops by more than a set tolerance (start at 0.5 points), and `--write-baseline` updates the file. The check doesn't run in `npm test` (docs change the numbers); it runs in the triage loop and before a commit that touches `src/english-helper/` or a recipe table.

### 6. Model eval (optional, costs money)

Add `npm run english-helper-eval`, built on `llm-eval`'s runner. For each sampled checkpoint item:

1. Build the helper prompt, with the item's own doc pair held out.
2. Translate with a small model. Give it tool access to `--verify` only if the run is testing that loop.
3. Parse the reply. Record parse failure, unknown words, and *check* flags from `--verify`.
4. Back-translate with the Agebon → English prompt and have a stronger model judge it against the item's English, keeping who did what, negation and stance.
5. Report miss rate by failure class (from which slot's word went wrong), by construction, and by stage.

Results are cached by prompt hash, like `llm-eval`. Run it only when asked, and sample (default `--n 100`).

### 7. The loop

Each round:

1. `npm run english-helper-recall` (all sets, `--check`). Read the report's headline and the top 30 worklist rows.
2. Group the rows by class. Take the largest group whose fix belongs in the tool or in an existing doc row.
3. Fix it in the place the routing table names. Add a `cases.tsv` line per behavior.
4. Rerun the report. Confirm the headline went up on **checkpoint** and **wild**, not just **doc**, and that nothing else fell past tolerance. Write the new baseline.
5. Log grammar gaps from the worklist with their tried phrases. Don't resolve them.
6. `npm run build`, then `npm test`, then commit (`[skip-cd]`).

Every few rounds, or after a big grammar change, run the model eval on a sample to check that the free metrics still track real translation quality. If they diverge, the metrics need fixing before the loop continues.

## Phases

1. **Checkpoint set and self-containment metrics.** Read practice items into the recall script; add *word in prompt*, *pattern in prompt* and *self-contained*; write the worklist. This shows how big the problem is. **Done.** First numbers (2026-10-20, full prompt, no `--stage`):

   | | doc | checkpoint |
   |---|---|---|
   | sentences | 1145 | 312 |
   | **self-contained** | 57.2% | 64.4% |
   | word in prompt | 79.2% | 78.4% |
   | pattern in prompt (of the rest) | 34.4% | 48.8% |
   | words missing | 13.6% | 11.1% |
   | root recall top-1 / anywhere | 75.4% / 90.6% | 85.0% / 94.3% |
   | prompt chars median | 12,583 | 12,329 |

   How the pieces work: a word is *pattern* when it is an ordinary content word on `-l` or `-m` whose roots the prompt shows (an `x` word also needs a shown word of its `x` family), or any other word whose family and ending a shown word shares, so only the role letter differs. A miss is *tagger* when the prompt never shows the root though a word of the sentence names it, *link without form* when a linked page spells the word (or a numbers page is linked for a number), and *missing cue* otherwise. The other classes in the routing table still need a person to sort them.
2. **Cases file and baseline.** Move the ad hoc feature tests that fit the format into `cases.tsv`; add `--check` and `--write-baseline`. **Done.** Beyond the expectations listed above, `has:<kind>` checks that some suggestion is of a kind, tier or detector id (*from … to*, a stranded hook), `first:` also takes a tier or detector id, and an empty slot names the sentence's clause detectors (past tense). Tests that pin more than one slot can say (exact suggestion lists, built forms, the stage filter, the hand-built WordNet index) stay in `analyze.test.ts`. The baseline guards, per set: *self-contained*, *word in prompt*, root recall top-1 and anywhere, construction recall by page (0.5 points each), and the median prompt size (500 characters). It tracks every set it was written for, doc included.
3. **Wild set.** Write the phenomenon-grouped sentences; add gap rate, noise and prompt-size scoring for sets with no reference. **Done.** 221 sentences, about 20 for each of the eleven phenomena, split across the three stages, drafted from the phenomenon list alone. The stage is a grouping column only: every set is still scored on the full prompt (see **Stage** below). Gap rate, noise and prompt size run on every set; the baseline guards gap rate (0.5 points) and prompt size on all three. In the worklist, a wild gap is a *missing cue* row and a guess ranked above a grammar row is a *ranking* row; the `word` column holds the English word, since there is no reference. First numbers (2026-10-20):

   | | doc | checkpoint | wild |
   |---|---|---|---|
   | gap rate | 3.6% | 3.4% | 5.2% |
   | suggestions / jobs per slot | 2.12 / 1.01 | 1.99 / 0.86 | 2.05 / 1.14 |
   | guess above a grammar row | 0 of 273 | 0 of 41 | 0 of 107 |
   | prompt chars median | 12,583 | 12,329 | 12,894 |

   The wild set's gaps are mostly degree and quantity words (*more*, *better*, *each*, *every*, *both*), with comparatives (9.4%) and pronouns (10.5%) the worst phenomena and places the best (0%). No guess ever ranks above a grammar row, since the analyzer puts every guess tier after the jobs; the metric stays as a guard for that order.
4. **Verify precision and recall.** Planted-error drafts from checkpoint answers.
5. **Model eval.** Only after phases 1–4 settle, so its misses can be read against the free metrics.

## Open questions

- **Tolerance and noise.** Doc edits move the doc-set numbers for reasons unrelated to the helper. Should the baseline track only checkpoint and wild, with doc as a smoke test?
- **Who writes the wild set.** A model can draft it fast, but it must not be drafted from the cue rows, or it stops being held out. Drafting from the NGSL list and the phenomenon list alone may be enough.
- **Stage.** Should the checkpoint scores use `--stage` set to each item's own band, so a beginner item is scored on what a beginner prompt shows?
- **Example budget.** The `e.g.` sentences make the prompt longer. Prompt size should be weighed against *self-contained*, probably as characters per self-contained sentence.

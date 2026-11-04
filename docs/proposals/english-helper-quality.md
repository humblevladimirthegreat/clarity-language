# Proposal: Checking and improving the English helper

**Status:** PARTIALLY IMPLEMENTED. Phase 1 is built: the **checkpoint** set, *word in prompt*, *pattern in prompt*, *self-contained*, and the worklist ([`src/english-helper/coverage.ts`](../../src/english-helper/coverage.ts)). Phase 2 is built: [`cases.tsv`](../../src/english-helper/cases.tsv) and the baseline (`--check`, `--write-baseline`). Phase 3 is built: the **wild** set ([`wild.tsv`](../../src/english-helper/wild.tsv)) and gap rate, noise and prompt size on every set. Phase 4 is built: *verify precision* and *verify recall* on the checkpoint set ([`plant.ts`](../../src/english-helper/plant.ts)). Phase 5 is built ([`english-helper-eval.ts`](../../scripts/english-helper-eval.ts)), with a 10-item and a 40-item batch run (the 40-item run: 36% miss on self-contained items, 56% on the rest). Round 2 (2026-11-04) split top-1 by root class, guards each metric only on the sets it means something for, adds staged scoring and three more mechanical worklist classes, and closes the open questions (see [Round 2](#round-2-2026-11-04)).  
**Related:** [`src/english-helper/`](../../src/english-helper/) (analyzer, prompt, `--verify`), [`scripts/english-helper-recall.ts`](../../scripts/english-helper-recall.ts), [`scripts/frequency-coverage.ts`](../../scripts/frequency-coverage.ts), [`scripts/llm-eval.ts`](../../scripts/llm-eval.ts) (the Ageben → English counterpart), [translation checkpoints](../meta/translation-exercises.md), [recipe track](../meta/grammar-docs.md#recipe-track).  
**Design authority:** none. This is a process for the tool. Every fix it produces is either tool code or a doc row that teaches a form a grammar page already owns. A missing form is logged as a grammar gap, never invented here.

## Problem

`node scripts/english-helper.mjs --llm-prompt` is meant to give a translator everything needed to write Ageben from English without opening the grammar. A hand test on five new sentences found that the prompt fell short in several ways:

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

- New grammar. When the reference needs a form no page teaches, or the English has no Ageben way to say it yet, that's a grammar gap: log it with the `find-english.mjs` phrases tried, and leave the decision to the editor.
- Writing Ageben sentences inside the analyzer. The helper stays suggestion-only.
- Tuning to the test set. Held-out sentences are never copied into cue rows or examples. A fix has to work for the class of word, not for the one sentence.

## What exists

| Tool | Measures | Limit |
|------|----------|-------|
| `npm run english-helper-recall` (`--set doc\|checkpoint\|wild\|all`) | per set: root recall (open-class top-1, closed root row first, all-roots top-1, top-3, anywhere), construction recall (home anchor, home page), *word in prompt*, *pattern in prompt*, *self-contained*, prompt characters per self-contained sentence (reference sets); staged self-contained (checkpoint); gap rate by word class, noise, prompt size (every set); gap rate by phenomenon and stage (wild, checkpoint); most-missed roots, constructions and words; writes `tmp/english-helper-report.md` and `tmp/english-helper-worklist.csv` | the worklist sorts nine classes mechanically; *feature not reached*, *opener / structure*, *prompt noise* and *grammar gap* need a person |
| `npx tsx scripts/frequency-coverage.ts` | which of NGSL's 2,809 frequent lemmas the lexicon or a grammar row knows | word by word, no context, no prompt |
| `english-helper.mjs --verify` | parse, unknown words, and each content word's sense next to the English that suggested its root | checks one draft; aggregated by `english-helper-recall` on the checkpoint set |
| `npm run llm-eval` | Ageben → English prompt quality, with a judge model | other direction; costs money |
| `npm run english-helper-eval` | English → Ageben: a model writes from the helper prompt, a second reads the draft back, a third judges it; miss rate by level, against *self-contained* | costs money; checkpoint set only |
| tests in `src/english-helper/*.test.ts` | pinned behavior per feature | written ad hoc, one feature at a time |
| `src/english-helper/cases.tsv` | one pinned behavior per line (`link:`, `not:`, `first:`, `has:`, `sense:`, `form:`, `no-gap`), run by `analyze.test.ts` | slot-level only; no stage column |
| `english-helper-recall --check` / `--write-baseline` | headline metrics per set against `src/generated/english-helper-baseline.json` | not in `npm test` |

## Plan

### 1. Test sets

Three sets, each scored separately:

| Set | Source | Role |
|-----|--------|------|
| **doc** | doc example pairs (what `english-helper-recall` reads today) | in-sample: catches breakage, overstates quality |
| **checkpoint** | English → Ageben practice items, with their **Also correct** answers ([`src/lint/practice-items.ts`](../../src/lint/practice-items.ts)); 68 sections today | held out from the example pool, with several right answers each |
| **wild** | a committed list of plain English sentences grouped by phenomenon (pronouns, possessives, numbers, time words, feelings, stance, clauses, questions, comparatives, kin, places, rhetorical questions) at each stage | no reference Ageben; scored on gaps, noise and size, and is the input for the model eval |

The wild set is written once (around 20 sentences per phenomenon), checked in as a TSV, and grown only through the triage loop below. New items are drafted from the phenomenon alone, never from cue rows, and are never copied into cue rows or examples. It stores no Ageben, so root respelling never touches it.

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
| **open-class root top-1** | share of roots the reference reads as ordinary content words (or compound parts) that are their slot's first lexicon suggestion | doc, checkpoint |
| **closed root row first** | share of roots the reference reads only as a closed row (overlay, stand-in, join, sake) that some slot's first grammar or overlay row spells | doc, checkpoint |
| **noise** | suggestions per slot, jobs per slot, and how often a guess tier (alias, WordNet, live) ranks above a grammar row | all |
| **prompt size** | characters per sentence, median and 90th percentile | all |
| **characters per self-contained sentence** | total prompt characters ÷ self-contained sentences: prompt growth is worth it only when this holds or falls | doc, checkpoint |
| **staged self-contained** | *self-contained* with each checkpoint item scored on the prompt for its own band (`--stage`, from its page's folder) | checkpoint |
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
| **missing cue** | a common word or phrase gets a gap or only a wrong lead, but a page already teaches its form | an italic cue on the owning recipe row (`say-*.md`, `english.md`) or the owning section's table | *me* on the `uwen` row; *not sure* on the MAY row |
| **link without form** | a detector or row points at a section, but the prompt never spells the form | the analyzer: a speller (numbers), or an `e.g.` from the section, following `Teach` links | *my* → `em buwen` example; *three* → `gragol` |
| **pattern read as spelling** | a row's form is notation (`th+e`, `/ɡ/ / -r`) with no spelled word or example | the doc cell spells the word; the analyzer shows an example for any form that is only a pattern | *sure* → `thrawal` |
| **joined prose cell** | a recipe cell's prose (`X and Y`) becomes ` / ` alternatives | the doc cell becomes one code span | *last night* |
| **wrong side** | an alias or lead on the sense the English doesn't mean | the analyzer spells both sides; `--verify` flags it | *grateful* → *pray* |
| **feature not reached** | the English has a dedicated Ageben feature (sakes, evidentials, clusivity), but the helper offers only a root | a recipe row that names the feature for that English word | *grateful* → met sake word |
| **ranking** | the right suggestion is there but below a worse one | cue rank, tier order or slot order in the analyzer | listener *you* above generic *you* |
| **tagger** | wrong word class or lemma from compromise | `tag.ts` overrides, or a context rule in the analyzer | *that* tagged as a preposition |
| **opener / structure** | a clause-level English structure with no detector | `detectors.ts` (pointers only), with its links in `detectorLinks` | *that* + clause → `darl` |
| **prompt noise** | notes, examples or leads the input doesn't need | `llm-prompt.ts` selection | fragment examples; unrelated reader notes |
| **verify blind spot** | a wrong draft passes `--verify` | `verify.ts` | a parse with no sense check |
| **verify false alarm** | `--verify` puts a *check* on a correct answer's word | `verify.ts` when the check is too strict (*other-side*, *spelled*); a cue or sense when the English never suggested the root (*alias*, *unmatched*) | *hastily* reaching its root only as an alias |
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
- **Baseline.** `src/generated/english-helper-baseline.json` holds the headline metrics per set. `english-helper-recall --check` fails when one drops by more than a set tolerance (0.5 points; 500 characters for prompt size), and `--write-baseline` updates the file. Each metric names the sets it guards. Checkpoint guards all of them. Wild has no reference, so it guards gap rate and prompt size. Doc is in-sample, and doc edits move its scores for reasons unrelated to the helper, so it guards only breakage: root recall anywhere, gap rate and prompt size. The check doesn't run in `npm test` (docs change the numbers); it runs in the triage loop and before a commit that touches `src/english-helper/` or a recipe table.

### 6. Model eval (optional, costs money)

Add `npm run english-helper-eval`, built on `llm-eval`'s runner. For each sampled checkpoint item:

1. Build the helper prompt, with the item's own doc pair held out.
2. Translate with a small model. Give it tool access to `--verify` only if the run is testing that loop.
3. Parse the reply. Record parse failure, unknown words, and *check* flags from `--verify`.
4. Back-translate with the Ageben → English prompt and have a stronger model judge it against the item's English, keeping who did what, negation and stance.
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

   How the pieces work: a word is *pattern* when it is an ordinary content word on `-l` or `-m` whose roots the prompt shows (an `x` word also needs a shown word of its `x` family), or any other word whose family and ending a shown word shares, so only the role letter differs. A miss is *tagger* when the prompt never shows the root though a word of the sentence names it, *link without form* when a linked page spells the word (or a numbers page is linked for a number), and *missing cue* otherwise. Round 2 added three more mechanical classes (*pattern read as spelling*, *joined prose cell*, *wrong side*); *feature not reached*, *opener / structure*, *prompt noise* and *grammar gap* still need a person.
2. **Cases file and baseline.** Move the ad hoc feature tests that fit the format into `cases.tsv`; add `--check` and `--write-baseline`. **Done.** Beyond the expectations listed above, `has:<kind>` checks that some suggestion is of a kind, tier or detector id (*from … to*, a stranded hook), `first:` also takes a tier or detector id, and an empty slot names the sentence's clause detectors (past tense). Tests that pin more than one slot can say (exact suggestion lists, built forms, the stage filter, the hand-built WordNet index) stay in `analyze.test.ts`. The baseline guards, per set: *self-contained*, *word in prompt*, root recall top-1 and anywhere, construction recall by page (0.5 points each), and the median prompt size (500 characters). It tracks every set it was written for, doc included.
3. **Wild set.** Write the phenomenon-grouped sentences; add gap rate, noise and prompt-size scoring for sets with no reference. **Done.** 221 sentences, about 20 for each of the eleven phenomena, split across the three stages, drafted from the phenomenon list alone. The stage is a grouping column only: every set is still scored on the full prompt (see **Stage** under [Decisions](#decisions)). Gap rate, noise and prompt size run on every set; the baseline guards gap rate (0.5 points) and prompt size on all three. In the worklist, a wild gap is a *missing cue* row and a guess ranked above a grammar row is a *ranking* row; the `word` column holds the English word, since there is no reference. First numbers (2026-10-20):

   | | doc | checkpoint | wild |
   |---|---|---|---|
   | gap rate | 3.6% | 3.4% | 5.2% |
   | suggestions / jobs per slot | 2.12 / 1.01 | 1.99 / 0.86 | 2.05 / 1.14 |
   | guess above a grammar row | 0 of 273 | 0 of 41 | 0 of 107 |
   | prompt chars median | 12,583 | 12,329 | 12,894 |

   The wild set's gaps are mostly degree and quantity words (*more*, *better*, *each*, *every*, *both*), with comparatives (9.4%) and pronouns (10.5%) the worst phenomena and places the best (0%). No guess ever ranks above a grammar row, since the analyzer puts every guess tier after the jobs; the metric stays as a guard for that order.
4. **Verify precision and recall.** Planted-error drafts from checkpoint answers. **Done.** Precision is the share of content words on accepted answers that `--verify` passes with no *check*; every check there is a *verify false alarm* row in the worklist. Recall plants one error per draft, one draft per eligible word of the first answer that verifies: a word `--verify` passes, moved to the other side's ending (*side*), or to the other ending when a grammar row spells it (*row-ending*), and an alias word on its other side (*alias-side*). A draft that stops parsing, or whose word does not land on the other side, is not counted; a miss is a *verify blind spot* row. `--verify` now marks a word matched by a grammar row's spelling (`row`), and takes the analysis when the caller has it. The baseline guards both (0.5 points). First numbers (2026-10-20):

   | | checkpoint |
   |---|---|
   | accepted answers verified | 339 (none fail to parse) |
   | **verify precision** (555 content words) | 89.4% |
   | answers with no check | 83.8% |
   | false alarms: alias / unmatched / other-side | 33 / 25 / 1 |
   | **verify recall** (383 planted) | 99.5% |
   | side / alias-side / row-ending | 99.4% of 347 / 100% of 28 / 100% of 8 |

   Recall is near the ceiling because these plants are the errors `--verify` was built to catch. The false alarms are the more useful list: *alias* is mostly a few words reached only through an alias (*hastily*, *speak*, *say*), and *unmatched* is a root the English never suggested, which is also a root recall miss.
5. **Model eval.** Only after phases 1–4 settle, so its misses can be read against the free metrics. **Built.** `npm run english-helper-eval` samples checkpoint items evenly across the three levels, builds the helper prompt with the item's own answers and English held out of the examples, and has Haiku write the Ageben. Two shortcuts save the paid steps: a draft equal to an accepted answer is right, and a draft that does not parse is wrong. Every other draft is read back by Haiku with the Ageben → English prompt, and Opus judges it against the English, with the glosses of the accepted answers and the draft. For each item the report lists the words of the closest accepted answer that the draft did not use, with their coverage label (*word*, *pattern*, *missing*), and compares the miss rate of self-contained and not self-contained sentences. A rerun reuses a stored draft when its prompt is unchanged, and its verdict when the draft reads the same, so a scoring fix costs nothing; `--dry` lists the sample with no calls. The share of shortcut items sets the cost: about $0.07 for an item that stops after translating, and $0.14–0.16 for one that goes through all three steps. Translating is most of it, since Haiku writes about 1,000 output tokens for a one-line reply. First batch (2026-10-20, `--n 10 --seed 1`, $0.92):

   | | items | miss |
   |---|---|---|
   | beginner | 4 | 13% |
   | intermediate | 3 | 33% |
   | advanced | 3 | 67% |
   | **all** | 10 | **35%** |

   Outcomes: 5 exact, 1 same, 1 partly, 3 no parse. All three no-parse drafts were self-contained in the prompt: a comma inside a clause, a negation join with nothing to join, and a dropped verb (*contradicts*, which the prompt showed only as a pattern). The partial miss wrote *plan* as a second verb instead of the stance word the prompt showed only as a pattern. Ten items are too few to say whether *self-contained* tracks the model; the next step is a batch of 30–50.

   Second batch (2026-11-04, `--n 40 --seed 1`, after Round 2, $4.80): miss **45%** overall (beginner 43%, intermediate 50%, advanced 42%). Outcomes: 10 exact, 4 same, 16 partly, 3 wrong, 6 no parse, 1 unreadable.

   | Prompt | n | Miss |
   |---|---|---|
   | not self-contained | 18 | 56% |
   | self-contained | 22 | 36% |

   *Self-contained* does predict the model's result: 20 points apart on 40 items. So it stays the headline. Missed words of the closest answer split evenly across *word* (10), *pattern* (13) and *missing* (15), so having a word in the prompt is not enough on its own. Three of the six no-parse drafts were self-contained again, and all three are syntax errors the prompt never warns about: a join vowel written as a word on its own (`zogowal u.`), notation copied as a word (`w+2`, from a lead that shows a pattern), and a comma inside a clause before a hook (`dodedel, ul zur`). The comma error also appeared in the first batch. The one unreadable draft was the translator trying to call a tool, not a prompt problem.

   **Proposed, not built (Next round step 1):** a short *common mistakes* block in the helper prompt. A join vowel is never a word alone. Notation (`+`, `/b/`, `/ɡ/`) shows a shape and is never copied as a word. No comma inside a clause. After that block lands, rerun the same seed (stored drafts are reused only when the prompt is unchanged, so this costs a full run).

## Round 2 (2026-11-04)

Notes from the Phase 4 sitting split ([`sitting-job-splits.md`](partially-implemented/sitting-job-splits.md)), 2026-11-04. That change moved checkpoint items between pages and added new ones, and `--check` failed on four metrics. Fixes that landed with it:

- **Verify recall: 98.5 → 100.** `verify.ts` used to count a side-less match (a live compound's part, a role word) as agreeing with either ending, even when another English word named only the other sense. Now the ending gets a *check* in that case.
- **New recipe cues:** *what makes* → `thewom thahum` (habit table in `say-reasons.md`); *who even*, *so who*, *tell me* → the stacked acts (ask table in `say-questions.md`); *to* + verb → stand-in `dorl` / `durl` (`english.md`). Each one is pinned in `cases.tsv`.

The rest of the round:

1. **Top-1 split by root class.** All-roots top-1 counted only a slot's first lexicon suggestion, so a closed or overlay root reached through a grammar row never counted, and a page split that moved such items read as a ranking loss (the Phase 4 split cost 0.1 points with no ranking change). The recall script now reads each root's class from the reference parse. **Open-class root top-1** counts roots read as ordinary content words or compound parts. **Closed root row first** counts roots read only as a closed row (overlay, stand-in, join, sake) that some slot's first grammar or overlay row spells. Both are in the baseline. All-roots top-1 stays in the report, and the recall CSV's `not_top1` column (`root:result`) still shows which roots sit below first place.
2. **The 0.9-point top-1 drop was item mix.** The current recall script, run on `c97fc288` (the commit that wrote the first baseline), reproduces that baseline exactly: 377 items, all-roots top-1 84.9. Open-class top-1 was 92.0% of 1,008 uses there and 91.9% of 1,165 now. Closed row first was 54.3% of 92 and 54.4% of 114. So no ranking was lost. The all-roots drop came from closed roots growing from 8.4% to 8.9% of uses as pages split, and the commits in between needed no bisect.
3. **Tagger: a noun / verb word before *to* + verb.** compromise read *wishes* in *Ahelan wishes to sing* as a plural noun. `tag.ts` now reads such a word as the verb when it sits between its subject and *to* + a verb. The subject is a clause-opening noun phrase or a subject pronoun, with adverbs skipped. *The wishes to sing* and *my plans to leave* keep the noun. Pinned in `tag.test.ts` and `cases.tsv`.
4. **Open *and maybe more*.** `english.md` has a new [*and maybe more*](../grammar/english.md#and-maybe-more) table with three rows, one per form that says it: the list's join on **-m** (`zam`), the hook on **-m** (`am` / `um`), and the stand-in on **-rm** (`dorm` and its series). The *to* row also spells `dorm` / `durm`. All three forms are already taught on their pages.
5. **CAUSE carried by the English, not a note.** The `cause.md` example now reads *If it rains, rain is what makes Azozon walk.*, like the `blavulul` example below it. The analyzer still never reads notes as cues: checkpoint and wild English carry none, so a note-reading fix would raise only the in-sample doc scores.
6. **Rhetorical questions in the wild set.** Ten `rhetorical` items (*Why bother?*, *Since when …?*, *As if …!*, *Who would ever …?*) are scored on gap rate, like the rest of the wild set. Each one marks itself as rhetorical in plain English. A bare *Who claps?* stays out, because its English is a real question until context says otherwise, and treating it as one is the right output.
7. **Three more mechanical worklist classes.** *Pattern read as spelling*: the row that links the section spelling the missing word writes its form only as notation (the analyzer's `patternForm`). *Joined prose cell*: a job row whose cell joins two code spans with prose (*and*, *then*, `+`), so the helper offers them as ` / ` alternatives. *Wrong side*: a reference word on `-l` / `-m` whose root the lexicon suggestions offer only on the other side.

Numbers after the round (2026-11-04, the new baseline):

| | doc | checkpoint | wild |
|---|---|---|---|
| sentences | 1243 | 437 | 231 |
| **self-contained** | 56.2% | 59.3% | - |
| staged self-contained | - | 59.0% | - |
| characters per self-contained sentence | 26,331 | 24,478 | - |
| **open-class root top-1** | 83.8% | 91.9% | - |
| **closed root row first** | 50.6% | 54.4% | - |
| root recall anywhere | 91.0% | 94.1% | - |
| gap rate | 3.6% | 3.0% | 5.3% |
| prompt chars median | 14,204 | 14,039 | 14,613 |

Checkpoint *self-contained* fell from 60.7 to 59.3 because of new items, not a regression. The 11 English → Ageben items on the new advanced pages (`generations.md`, `initials.md`, `open-ranges.md`) are 0% self-contained. The other 426 items are at 60.8%. Staged scoring costs only 0.3 points, since `--stage` filters the analyzer's rows but not the prompt's doc examples.

## Next round

Run these steps in order. Every step follows [The loop](#7-the-loop): fixes go where the routing table says, each fixed behavior gets a `cases.tsv` line, and a missing form is logged as a grammar gap (with the `find-english.mjs` phrases tried), never invented. Don't commit; the user handles commits.

1. **Common mistakes block in the helper prompt.** Not built yet. In `buildHelperPrompt` ([`src/english-helper/llm-prompt.ts`](../../src/english-helper/llm-prompt.ts)), add a short block under *How to write Ageben*, with one rule per error the eval batches found:
   - A join vowel is never a word on its own (`zogowal u.` failed).
   - Notation in a row or lead (`+`, `/b/`, `/ɡ/`, `h+2`) shows a shape; it is never copied as a word (`w+2` failed).
   - No comma inside a clause (`dodedel, ul zur` failed, in both batches).

   Before writing a rule, confirm on its owning grammar page that it is true as stated (`joins.md` for join words, `clause.md` for commas). Reword or drop a rule a page does not support. Add a test in `llm-prompt.test.ts` that the block is in the prompt. Done when `npm test` passes and `--check` shows prompt size within tolerance.
2. **`+` joins read as alternatives.** `tableForm` in [`src/find/english.ts`](../../src/find/english.ts) joins every code span of a cell with ` / `, so a cell like **`om`** + `/b/` reaches the helper as `om / /b/`, which reads as two alternatives. It accounts for most of the 118 *joined prose cell* worklist rows (35 on checkpoint). Keep spans joined by `+` as one form (`om + /b/`), and check that the analyzer's form handling (`patternForm`, `addExamples`, the hook phrase builder in `analyze.ts`) still reads it. Pin two rows in `cases.tsv` (the *to* row's goal-reached form, the *of* rows). Done when the *joined prose cell* count on checkpoint drops and `npm test` passes.
3. **The new advanced number pages.** The 11 English → Ageben items on `generations.md`, `initials.md` and `open-ranges.md` are 0% self-contained. Run `npm run english-helper-recall -- --set checkpoint` and filter `tmp/english-helper-worklist.csv` and `tmp/english-helper-recall.csv` to those pages. Group the misses by class and fix each where the routing table says. Number words are usually *link without form* (the analyzer's number speller) or *missing cue* (a recipe row in `say-amounts.md` or `english.md`). Confirm each fix on at least two other sentences of its class. Done when most of those items are self-contained, or each remaining miss is logged as a grammar gap.
4. **Free metrics and baseline.** `npm run build` (if docs changed), `npm test`, then `npm run english-helper-recall -- --check`. Any drop past tolerance must be explained (an item-mix change, like the new advanced pages in Round 2) or fixed. Then `-- --write-baseline`.
5. **Staged self-contained.** It is 59.0% after Round 2, and report-only. If this round's value is within 0.5 points of the full-prompt *self-contained* again, add `stagedSelfContained` to the headline (checkpoint only, 0.5 points) and rewrite the baseline. If not, note the gap here and leave it report-only.
6. **Model eval (paid, about $5; the user approved it).** `npm run english-helper-eval -- --n 40 --seed 1`, the same sample as Round 2. The prompt changed, so every draft is regenerated. Compare against Round 2: overall miss 45%, self-contained 36% vs not 56%, and 6 no-parse drafts, 3 of them self-contained. The block in step 1 worked if no-parse drafts on self-contained items fall.
7. **Write it up.** Add a Round 3 section to this proposal: what landed, the numbers table (as in Round 2), the eval comparison, and a new Next round list built from the top of the worklist.

## Decisions

These were open questions. Each is now settled:

- **Tolerance and noise.** Each baseline metric names the sets it guards. Checkpoint and wild carry the quality guards. Doc guards only breakage (root recall anywhere, gap rate, prompt size), since doc edits move its other scores.
- **Who writes the wild set.** It was drafted from the phenomenon list alone. It grows only through the triage loop, from the phenomenon, never from cue rows.
- **Stage.** Checkpoint items are also scored on their own band's prompt (*staged self-contained*), beside the full-prompt score. The full-prompt score stays the guard for the analyzer itself.
- **Example budget.** The report shows prompt characters per self-contained sentence. Prompt growth is worth it only when that number holds or falls. The raw median stays the guarded ceiling.

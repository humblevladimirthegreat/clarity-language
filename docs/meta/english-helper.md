# English helper quality

Editors only. Not linked from grammar pages. This note explains how the English → Ageben helper (`node scripts/english-helper.mjs`, [`src/english-helper/`](../../src/english-helper/)) is measured and improved: the test sets, the free metrics, the worklist and where each fix goes, the regression net, the paid model eval, and the loop that ties them together.

**Design authority:** none. Every fix is either tool code or a doc row that restates a form a grammar page already teaches. A missing form is a grammar gap: log it with the `find-english.mjs` phrases you tried, and leave the decision to the editor. Never invent the form here.

## Goal

`--llm-prompt` should give a translator everything needed to write the Ageben without opening the grammar. The headline question is: **could the translator copy every word of a right answer from the prompt?** The helper only suggests. It never writes the sentence.

## Test sets

| Set | Source | Role |
|-----|--------|------|
| **doc** | doc example pairs | In-sample: the cue rows were written against this English. Catches breakage, but overstates quality. |
| **checkpoint** | English → Ageben practice items with their **Also correct** answers ([`src/lint/practice-items.ts`](../../src/lint/practice-items.ts)) | Held out from the example pool, with several right answers each. The main quality set. |
| **wild** | [`src/english-helper/wild.tsv`](../../src/english-helper/wild.tsv): plain English grouped by phenomenon and stage | No reference Ageben. Scored on gaps, noise and size. |

The wild set grows only through the loop below, and new items are drafted from the phenomenon alone. Never copy a wild or checkpoint sentence into a cue row, an example, or `cases.tsv`. A fix has to work for the class of word, not for one sentence.

## Free metrics

`npm run english-helper-recall` (`--set doc|checkpoint|wild|all`) writes `tmp/english-helper-report.md`, `tmp/english-helper-recall.csv` and `tmp/english-helper-worklist.csv`.

| Metric | Definition | Sets |
|--------|-----------|------|
| **self-contained** | Share of sentences where every reference word is *word in prompt* or *pattern in prompt*. **The headline.** | doc, checkpoint |
| **staged self-contained** | Self-contained, with each checkpoint item scored on the prompt for its own band (`--stage`, from its page's folder) | checkpoint |
| **word in prompt** | Share of reference words found verbatim in the prompt: a root line's word, an alias's two words, a job form or `say` phrase, a detector form, an example sentence | doc, checkpoint |
| **pattern in prompt** | Of the rest, the share whose shape a shown word gives. An `-l` / `-m` content word counts when the prompt shows its roots (an `x` word also needs a shown word of its `x` family). Any other word counts when a shown word shares its family and ending, so that only the role letter differs. | doc, checkpoint |
| **open-class root top-1** | Share of roots the reference reads as content words (or compound parts) that are their slot's first lexicon suggestion | doc, checkpoint |
| **closed root row first** | Share of roots the reference reads only as a closed row (overlay, stand-in, join, sake) that some slot's first grammar or overlay row spells | doc, checkpoint |
| **root recall anywhere**, **construction recall** (home anchor, home page) | The reference's roots and constructions appear or are linked at all | doc, checkpoint |
| **gap rate** | Slots with no suggestion, by word class, phenomenon and stage | all |
| **noise** | Suggestions and jobs per slot, and how often a guess tier (alias, WordNet, live) ranks above a grammar row | all |
| **prompt size** | Characters per sentence, median and 90th percentile | all |
| **characters per self-contained sentence** | Total prompt characters ÷ self-contained sentences. Growing the prompt is worth it only when this holds or falls. | doc, checkpoint |
| **verify precision** | `--verify` on each accepted answer. Every *check* flag on a correct answer is a false alarm. | checkpoint |
| **verify recall** | `--verify` on accepted answers with one planted error each (`-l` ↔ `-m`, an alias on its other side, a grammar row's word with another ending): the share flagged | checkpoint |

When an item has *Also correct* answers, a word counts as found if it matches any of them.

## The worklist and where each fix goes

The worklist has one row per miss: `set, english, word, kind, lemma, frequency, sentences, owner, suggested_fix`. `frequency` is the lemma's NGSL rank, so *me* outranks *aardvark*. Rows are sorted by frequency, then by how many sentences share the miss.

| Class | Symptom | Fix goes in | Sorted mechanically |
|-------|---------|-------------|---|
| **missing cue** | A common word gets a gap or only a wrong lead, though a page already teaches its form | An italic cue on the owning recipe row (`say-*.md`, `english.md`) or on the owning section's table | yes |
| **link without form** | A row or detector links the section, but the prompt never spells the word | The analyzer: a speller (numbers, initials, number cues), or an `e.g.` from the section | yes |
| **pattern read as spelling** | The linking row writes its form only as notation | The doc cell spells the word; the analyzer shows an example for a form that is only a pattern | yes |
| **joined prose cell** | A cell joins code spans with prose (*and*, *then*), so the helper offers them as alternatives. A `+` already keeps them one form. | The doc cell becomes one code span | yes |
| **wrong side** | The lexicon suggestions offer the root only on its other `-l` / `-m` side | The analyzer spells both sides; `--verify` flags it | yes |
| **tagger** | The prompt never shows the root, though a word of the sentence names it | `tag.ts` context rules | yes |
| **ranking** | The right suggestion is there, but below a worse one | Cue rank, tier order or slot order in the analyzer | yes (wild) |
| **verify false alarm** | `--verify` checks a word of a correct answer | `verify.ts` when the check is too strict; a cue or sense when the English never suggested the root | yes |
| **verify blind spot** | A planted error passes `--verify` | `verify.ts` | yes |
| **feature not reached** | The English has a dedicated Ageben feature (sakes, evidentials, clusivity), but the helper offers only a root | A recipe row that names the feature for that English | no |
| **opener / structure** | A clause-level English structure with no detector | `detectors.ts`, with its links in `detectorLinks` | no |
| **prompt noise** | Notes, examples or leads the input doesn't need | Selection in `llm-prompt.ts` | no |
| **grammar gap** | No page teaches a form for the meaning | **Nothing in the tool.** Log it for an editor's decision. | no |

Two rules keep fixes honest:

- **Before adding a cue row,** run `find-english.mjs` and open the owning section. The row must restate a form the section already teaches, and the build must pass.
- **When a fix fixes one sentence, find its class.** Then confirm it on at least two other sentences of that class, and pin those (not held-out sentences) in `cases.tsv`.

The analyzer never reads example notes as cues. Checkpoint and wild English carry none, so a note-reading fix would raise only the in-sample doc scores.

## Regression net

- **[`src/english-helper/cases.tsv`](../../src/english-helper/cases.tsv)** has one line per pinned behavior: English, the slot word, an expectation, and why. `analyze.test.ts` runs it, and the expectation kinds are listed in [`cases.ts`](../../src/english-helper/cases.ts) (`link:`, `not:`, `first:`, `has:`, `sense:`, `form:`, `shape:`, `reach:`, `sake:`, `no-gap`). An empty slot names the sentence's clause detectors. Expectations name senses, sections and closed words, never root spellings, so a retie never breaks them. Each fixed behavior adds a line.
- **Baseline.** [`src/generated/english-helper-baseline.json`](../../src/generated/english-helper-baseline.json) holds the headline metrics per set. `english-helper-recall -- --check` fails when one drops past its tolerance: 0.5 points, or 500 characters for prompt size. `-- --write-baseline` updates it. Each metric names the sets it guards:
  - Checkpoint guards all of them, *staged self-contained* included.
  - Wild has no reference, so it guards gap rate and prompt size.
  - Doc is in-sample, and doc edits move its scores for reasons unrelated to the helper. It guards only breakage: root recall anywhere, gap rate and prompt size.

  The check is not part of `npm test`, because docs change the numbers. Run it before a commit that touches `src/english-helper/` or a recipe table. When a drop comes from item mix (new or moved checkpoint items), say so where you report the run, then rewrite the baseline.

## Model eval (paid)

`npm run english-helper-eval -- --n 40 --seed 1` samples checkpoint items evenly across the three levels. It builds the helper prompt with the item's own answers and English held out of the examples, and has a small model write the Ageben. A draft equal to an accepted answer is right, and a draft that doesn't parse is wrong. Every other draft is read back with the Ageben → English prompt and judged against the English by a stronger model. The report gives the miss rate by level, compares self-contained and not-self-contained items, and lists the closest answer's unused words with their coverage label. Drafts and verdicts are cached by prompt, so a scoring fix reruns for free. `--dry` lists the sample. A run of 40 costs about $4.50. Run it only when asked.

Run it every few rounds, or after a big grammar change, to check that *self-contained* still tracks real translation quality. If the two diverge, fix the metrics before going on.

| Batch | Miss | Self-contained / not | No-parse (on self-contained items) |
|---|---|---|---|
| 2026-10-20, n = 10 | 35% | – | 3 (3) |
| 2026-11-04, n = 40, before the common-mistakes block | 45% | 36% / 56% | 6 (3) |
| 2026-11-04, n = 40, after the block | 44% | 32% / 58% | 6 (3) |

The *common mistakes* block in the prompt came from these batches. Since it landed, no draft has a comma between words or copies notation. The two drafts that still wrote a bare join vowel followed analysis rows that offered one. Those rows now spell the join word (`vul`, `zam`), so the next batch should show whether that error is gone.

## The loop

Each round:

1. `npm run english-helper-recall -- --check`. Read the report's headline and the top 30 worklist rows.
2. Group the rows by class. Take the largest group whose fix belongs in the tool or in an existing doc row.
3. Fix it where the routing table says, and add a `cases.tsv` line per behavior.
4. Rerun. Confirm the headline went up on **checkpoint** (and wild's gap rate didn't rise), not just on doc, and that nothing else fell past tolerance. Then `--write-baseline`.
5. Log grammar gaps from the worklist with the phrases you tried. Don't resolve them.
6. `npm run build` (if docs changed), then `npm test`.
7. Update [Next round](#next-round) below.

## Decisions

- **Tolerance.** Each baseline metric names the sets it guards. Checkpoint and wild carry the quality guards, and doc guards only breakage.
- **Wild set.** It is drafted from the phenomenon list alone, never from cue rows, and grows only through the loop. A bare *Who claps?* stays out of the rhetorical group: its English is a real question until context says otherwise.
- **Stage.** Checkpoint items are scored on the full prompt and on their own band's prompt, and both are guarded. The full-prompt score is the headline for the analyzer itself.
- **Example budget.** Prompt growth is worth it only when characters per self-contained sentence hold or fall. The raw median stays the guarded ceiling.
- **Whose stance.** A stance or feeling row is filtered by its owner, the word before the cue past adverbs, auxiliaries, *not* and copulas (`ownerAt` in `analyze.ts`). The speaker drops holder rows (links in `HOLDER_LINKS`). Someone else drops the bare twin (a word the holder row repeats, or the host of a holder alone, `holderHost`) and speaker-only attitudes (`SPEAKER_ONLY_LINKS`), and a feeling row adds the holder hit (`FEELING_LINKS`). In a question, *you* counts as the speaker. *we* keeps both, its own stance first. Holder rows are spelled with the owner and led by the way of knowing the English names (`HOLDER_CHANNELS`, CLUES by default), and `--verify` flags a bare stance when someone else owns it. A subject beyond the word before the stance (a relative clause) stays unknown, so both rows stay.

## Next round

1. **Comparatives: *more*, *than*, *better*, *much*.** Comparatives are the worst wild phenomenon (9.4% gap rate). *more* is the most-missed wild word, and *better*, *than*, *good* and *much* follow. Run `find-english.mjs` on *more than*, *better* and *as much as*, then add cues to the comparatives rows that already teach the forms (`comparatives.md`, `comparative-arity.md`). Watch that a *more than* cue doesn't take over the ray rows (*more than 5*), which match through the number placeholder.
2. **Feeling words with only a root.** The holder hint for someone else's feeling fires only when a slot links a feeling or sake row (*upset*). *Alazun is anxious* reaches only the *anxious* root, so it gets no hint and `--verify` does not check it. Find a signal that a root is a feeling (an overlay kind, a lexicon column, or a sake row cue), not a hand list.
3. ***work*.** *works* / *working* are gaps (4 wild sentences). Check the lexicon and `english_aliases` for a sense that fits. If none fits, log a lexicon gap for the editor. Don't add a root.
4. **Verify false alarm on *talk*.** `vezuyol` is checked on 16 checkpoint answers because *talk* reaches the speech root only through an alias. If *talk* is a true sense of that root, that is a lexicon edit for the editor. If not, `verify.ts` should accept an alias whose side matches.
5. **A range under a question.** *How many coins, from 3 to 5, …?* needs the range hook on **-r** (`gragel oer grazal`). The helper offers the closed `oel`. Add a cue on the `say-amounts.md` *some value in the band* rows only if the page's own example supports that reading; otherwise log it as *feature not reached*.
6. **Model eval** (paid, only when asked), to confirm that the bare-join-vowel drafts are gone.

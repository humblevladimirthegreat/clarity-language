# English helper: Jev picks the context

**Status:** IDEA (2026-11-13). Nothing is built. Open decisions 1 to 4 wait on the user, and Phase 1 cannot start before decision 1.

**Related:** [English helper quality](../meta/procedures/english-helper.md) ([free metrics](../meta/procedures/english-helper.md#free-metrics), [the worklist](../meta/procedures/english-helper.md#the-worklist-and-where-each-fix-goes), [model eval](../meta/procedures/english-helper.md#model-eval-paid), [next round](../meta/procedures/english-helper.md#next-round)), [`src/english-helper/paradigms.ts`](../../src/english-helper/paradigms.ts), [`src/english-helper/llm-prompt.ts`](../../src/english-helper/llm-prompt.ts), [`scripts/english-helper-recall.ts`](../../scripts/english-helper-recall.ts), [`scripts/english-helper-eval.ts`](../../scripts/english-helper-eval.ts), [`docs/grammar/cheat-sheets/`](../grammar/cheat-sheets/), [`TODO.md`](../../TODO.md) (*use jev for translation?*). Jev: [docs index](https://docs.typesafe.ai/llms.txt), [models and price](https://docs.typesafe.ai/models.md), [known limits](https://docs.typesafe.ai/model-jaggedness.md), [Noul](https://docs.typesafe.ai/primitives/noul.md), [JavaScript SDK](https://docs.typesafe.ai/sdk/javascript.md).

**Depends on:** `english-helper-closed-forms.md`, Phase 1 code (in the tree). **Order:** Phase 1 here runs before that proposal's Phase 2 step 3, which strips the dry measure this one reuses. Phase 2 here runs after that proposal's Phase 2.

**Design authority:** none. Every change is tool code. Jev chooses among blocks, examples and rows that the docs already hold. It never supplies a form.

## Problem

The helper's prompt is built by link-following: a cue in the English hits a row, the row links a section, and the prompt shows what that section reaches. Whatever the cues miss, the prompt misses. `english-helper-closed-forms.md` measured three places where this falls short on the 500 checkpoint items:

- **Block choice under the cap.** At the 6,000-character cap, the nearest-first fill makes 71.4% of items self-contained. The whole sheet gives 78.4%, and every block gives 85.2%. The gap is a ranking problem: the right table exists, but the links do not rank it first.
- **Sheets never linked.** 24 closed words (polar answers, say words, `grawal`, `gral`, `howar`, `zael`) are on a sheet the analysis never links. No reach recovers them.
- **Frames never wanted.** Of 789 frames not shown, 748 were never wanted, mostly joins and sakes that the analysis reaches through another page.

All three are the same question: *does this English sentence express this feature?* The worklist classes that are not sorted mechanically, *feature not reached* and *opener / structure*, ask it too. Today each answer is a hand-written cue or detector.

Jev is a model built for that question. It takes a state and typed questions (yes/no, pick one, score) and returns probabilities. Jev 1.14 costs $0.042 per million input tokens, with output free, and takes any number of questions in one 64k-token request. What it cannot do also shapes the design:

- It writes no text. Its docs say that forcing generation through chained choices works poorly.
- It reads each question literally and favors the first option of a choice.
- Its accuracy falls when the state is long and mostly irrelevant.
- It is weak at counting and at reasoning in several steps.
- It has never seen Ageben, so a question can only be about the English.

## Goals

- Under the same 6,000-character cap, more checkpoint items are self-contained than with the nearest-first fill, including items whose form sits on a sheet no cue links.
- The prompt shows an example for more of the constructions a right answer uses, measured by *frame shown*.
- The worklist classes *feature not reached* and *opener / structure* get a sorted list that Jev labels offline.
- Each use is measured against the checkpoint references before it is built, for under a dollar.
- The helper stays free, offline and deterministic when Jev is off. The guarded baseline is the Jev-off helper.

## Non-goals

- **Jev does not write the sentence.** Word choice, order and spelling stay with the translator model. This answers the `TODO.md` line.
- No question asks about an Ageben form. Questions are built from the English a cheat sheet row or a recipe row already carries.
- No Jev call from the site. The Inspect page and the journal editor keep the deterministic helper, and no learner sentence leaves the browser.
- No new forms, cues on grammar pages, or recipe rows. A feature Jev finds that no cue reaches goes on the worklist, and the ordinary [loop](../meta/procedures/english-helper.md#the-loop) fixes it.
- No trim of the fixed gloss reader core. That is deterministic and stays in the helper's Next round.

## Design

### Where Jev fits

| Use | Question | Ground truth for a free check | Phase |
|---|---|---|---|
| **A. Block ranking** | Per cheat sheet block: does saying this sentence need one of these meanings? | The block holds a closed word of a reference answer | 1, 2 |
| **B. Wanted frames** | Per construction: does this sentence use it? | The reference answer's constructions | 1, 3 |
| **C. Worklist labels** | Per feature, on wild and checkpoint sentences: does the English have it? | Checkpoint: as in A. Wild has none, so a person reads the list. | 3 |
| **D. Sense ranking** | Per slot: which of the offered lexicon senses fits? | *Open-class root top-1* | 4 |
| **E. Eval screen** | Does this back-translation say what the English says? | The stored judge verdicts | 4 |

A and B share one request per sentence. D and E are separate requests.

### The request

- **State.** The English sentence, and nothing else. A short state avoids the long-state weakness, and it makes the cost independent of how Jev bills state across questions, which its docs do not say.
- **Questions.** One Noul (yes/no with a probability) per block and per construction. Each is a statement, phrased so that a high value means yes: *Saying this in another language needs one of these meanings:* followed by the block's heading and its rows' italic English. The Ageben forms are left out. Jev cannot use them, and leaving them out roughly halves the tokens.
- **Size.** 239 blocks in lean form are about 70,000 characters with their forms, so about 10k to 20k tokens per sentence. That is about $0.001 per sentence and about $0.50 for the 500 checkpoint items. If a request passes 64k tokens, split it by sheet.
- **Question text comes from the docs, never from a test sentence.** The rule that a fix works for the class of word, not for one sentence, applies to question wording as it does to cue rows.
- **Choice questions (D)** shuffle their options by a seed, to counter the first-option bias.

### Using the answers

- **Blocks.** A third fill, `ranked`, beside `nearest`: blocks with a probability at or above the threshold come first, highest first, then the nearest-first order fills what is left of the cap. A block Jev picks on a sheet no cue links is now eligible. The deterministic selection stays the candidate list and the fallback.
- **Frames.** A construction at or above the threshold joins the wanted set with its own weight, next to the `c:<id>` feature.
- **Threshold.** Jev's docs suggest 0.7 for yes as a start. Tune it on half of the checkpoint items, split by seed, and report on the other half.

### Cache and determinism

- Answers are cached on disk under `tmp/english-helper-jev/`, keyed by a hash of the model id, the sentence and the question text. A rerun with unchanged docs makes no call.
- `--jev` turns the layer on in the CLI, the recall script and the eval script. Without it, or without `TYPESAFE_API_KEY`, the helper behaves as it does today.
- The baseline and `--check` run with Jev off. The recall report gains a second column for Jev-on numbers when the flag is set. They are reported, not guarded, because a cache miss would make the check cost money and depend on the network.

### How each part is tested

| Part | Measure | Go ahead when |
|---|---|---|
| A | Self-contained on the held-out half at the 6,000 cap under the `ranked` fill, against 71.4%. Per-block precision and recall. How many of the 24 never-linked words it recovers. | 75% or more |
| A | The same run twice, and with two phrasings (statement and question, with and without `criteria`) | Answers that cross the threshold between runs stay under 2% |
| B | *Frame shown* with the wanted set widened by Jev, against 71.4% and against the doc-example widening in `english-helper-closed-forms.md` part B | It beats the doc-example widening, or adds to it |
| C | A person reads the top 30 labeled wild rows | Most rows are real misses |
| E | Agreement with the stored judge verdicts, at a threshold where Jev's *yes* and *no* are each at least 95% right | It settles at least half the drafts |

## Implementation plan

Four phases. Each is one session in the orchestrator's own context with no subagents, because the work is a few source files that share one context. At the end of each phase, and if the user says to stop partway, the agent [consolidates the proposal](../meta/procedures/proposals.md#consolidate) before the session ends. Commits follow the user's standing rule: the agent leaves the tree green and uncommitted unless told otherwise. Report the cost of each paid run from the `usage` field of the responses.

### Phase 1: dry measure

1. Add `src/english-helper/jev.ts`: build the questions from `loadParadigmBlocks()` and the construction list, send one request per sentence, and cache the answers. Add a test for the question builder and the cache key. No test calls the network.
2. In the recall script, behind `--jev`, add a `ranked` row to the report section *Paradigm blocks: dry measure*, with the per-block precision and recall, the never-linked words recovered, and the tune and report halves.
3. Add the Jev row to the frame breakdown: how many of the 748 unwanted frames it would bring in, and how many frames it would wrongly want.
4. Run it on checkpoint, twice, and once with the second phrasing. Put the results and the cost on the Status line.

**Gate:** `npm test`. Then stop: the user decides from the numbers whether Phases 2 and 3 go ahead.

### Phase 2: ranked blocks in the prompt

1. Add the `ranked` fill to `paradigmLines` and pass the probabilities from `buildHelperPrompt` when `--jev` is set.
2. Add `llm-prompt.test.ts` cases with fixed probabilities: a ranked block comes first, a block on an unlinked sheet is shown, and the output without probabilities equals the `nearest` fill.
3. Rerun recall with and without `--jev`. Run a plain model eval on the stored 20 items with `--jev`, against the result `english-helper-closed-forms.md` records for its own Phase 2.

**Gate:** `npm test`, then recall `--check` with Jev off, with its result on the Status line.

### Phase 3: frames and the worklist

1. Add the Jev-wanted constructions to example selection, with their weight tuned on *frame shown*.
2. Add `--jev-labels` to the recall script: for each wild and checkpoint sentence, list the features Jev says the English has that no slot links, as worklist rows of class *feature not reached*.
3. Update [english-helper.md](../meta/procedures/english-helper.md): the `--jev` flag, the cache, the rule that the baseline is Jev-off, and the labeled worklist.

**Gate:** `npm test`, then recall `--check`.

### Phase 4: sense ranking and the eval screen

1. Replay the stored eval results through a Jev Noul and report agreement with the judge. If it meets the bar in the test table, add `--screen jev` to the eval script, which sends only the uncertain drafts to the judge.
2. Measure a Choice over each slot's offered senses against *open-class root top-1*. Build the re-rank only if it beats the current order on the held-out half.
3. Fold what remains into the helper's Next round, then delete this proposal.

**Gate:** `npm test`, then recall `--check`.

## Open decisions

1. **The Phase 1 paid run and the key.** Phase 1 needs a TypeSafe account, `TYPESAFE_API_KEY` in the environment, and about $1.50 for three checkpoint passes. The options are to approve it, or to hold this proposal. **Recommendation:** approve. It is the cheapest measurement the helper has had, and its result decides the rest of the proposal.
2. **Optional layer, or the default.** Jev could be an optional `--jev` layer over the deterministic helper, or the helper's normal path with the deterministic one as a fallback. **Recommendation:** optional. The free metrics, the baseline and the site all rely on a helper that runs offline, and a default network call would make every recall run depend on a third party.
3. **SDK or plain HTTP.** The `@typesafe-ai/sdk` package handles retries and compression but is a new dependency. A plain `fetch` to `POST /v1/systemone` adds none, but the agent would write the request shape and the retry from the OpenAPI file. **Recommendation:** the SDK as a devDependency, imported only by `jev.ts` and never by the browser bundle. A vendor's own client is less likely to be wrong than a hand-written one.
4. **Sentences sent to a third party.** The doc, checkpoint and wild sentences are the project's own, and sending them is what Phase 1 does. A learner's sentence is different. **Recommendation:** keep the non-goal as written, with no Jev call from the site, and reopen it only if the measured gain is large enough to want a proxy.

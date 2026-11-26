# Verbless sentences: existence takes a verb, the rest reply

**Status:** READY, 2026-11-26. The user settled every design decision on 2026-11-26 (see [Decisions](#decisions)). Two decisions stay open for phase 2 and neither blocks phase 1 ([Open decisions](#open-decisions)). Phase 1 starts at R0.

**Related:** [predication.md](../../grammar/beginner/predication.md), [questions.md](../../grammar/beginner/questions.md), [fill-ask-jobs.md](../../grammar/beginner/fill-ask-jobs.md), [restrictors.md](../../grammar/beginner/restrictors.md), [no-subject.md](../../grammar/beginner/no-subject.md), [clause.md § extra detail on an adjective](../../grammar/beginner/clause.md#adjective-detail-w), [hooks.md](../../grammar/beginner/hooks.md), [causation.md](../../grammar/beginner/causation.md), [how-you-feel.md](../../grammar/beginner/how-you-feel.md), [thanks-and-sorry.md](../../grammar/beginner/thanks-and-sorry.md), [social-ties.md](../../grammar/beginner/social-ties.md), [universals-domains.md](../../grammar/intermediate/universals-domains.md), [very-and-slightly.md](../../grammar/intermediate/very-and-slightly.md), [polar-inventory.md § confirming a negative](../../grammar/intermediate/polar-inventory.md#confirming-a-negative), [resume-sense.md](../../grammar/intermediate/resume-sense.md), [sentence-linkers.md § what carries past a period](../../grammar/intermediate/sentence-linkers.md#past-a-period), [evidentiality.md](../../grammar/intermediate/evidentiality.md), [cheat-sheets/word-shape-clause.md](../../grammar/cheat-sheets/word-shape-clause.md), [terminology.md](../../grammar/terminology.md), [design-decisions.md](../../meta/design-decisions.md) (D-65, the feelings note), [unassigned-reserved.md](../../meta/unassigned-reserved.md), [interpreter.md § classification table](../../meta/interpreter.md#classification-table), [grammar-docs.md § marking Ageben](../../meta/grammar-docs.md#marking-ageben), [`lexicon-published.csv`](../../../data/lexicon-published.csv) (root `uzuve`), [`construction-trace.ts`](../../../src/parse/construction-trace.ts) (`isExistence`, `isUnsaidEvent`), [`constructions.ts`](../../../src/parse/constructions.ts), [`enforce.ts`](../../../src/parse/enforce.ts) (`wNoHost`), [`resolve.ts`](../../../src/parse/resolve.ts) (`fillAnswers`), [`discourse-slots.ts`](../../../src/parse/discourse-slots.ts), [`llm-prompt.ts`](../../../src/parse/llm-prompt.ts), [`read-context.ts`](../../../src/interpret/read-context.ts), [`classes.ts`](../../../src/interpret/classes.ts), [`translate-conditions.ts`](../../../src/interpret/translate-conditions.ts), [`claim.ts`](../../../src/realize/claim.ts), [`detectors.ts`](../../../src/english-helper/detectors.ts).

**Depends on:** none. **Order:** phase 1 rewrites examples across 77 files. Do not run it at the same time as another proposal that edits examples in bulk.

**Design authority:** changes these readings:
- **Existence** takes the verb `vuzuvem`. This is the abstract *presence* sense of `uzuve` *stand*, so `zodozel vuzuvem.` is *There is a dog*. A noun or noun list with no verb and no predicate no longer says that the thing exists.
- **A subject plus a predicate with no verb** is one claim shape, whatever the noun's ending. The predicate is a `/ɡ/` word, IDENTITY with its `bl-` partner, or a place hook with its `/b/`. The split in `predication.md#existence`, where a new noun plus `/ɡ/` meant *there is a G Z*, is retired. A new noun still brings its thing in, as it does in any clause. A number or amount on a subject is a property of that set. To count what exists, use `vuzuvem`.
- **A short reply** is any other body with no verb. It reaches back to the sentence before. Three kinds of body are not short replies: a lone feeling or sake word (D10, D11), a bare citation (a greeting or a one-noun answer), and a body under a command word with no command before it (D9). A short reply with nothing to reach back to is not well formed.
- **The lone object** (`dodozel.`, `zazozon dalazun.`) has no reading of its own any more. It is a short reply.
- **A lone `/w/` word** is accepted when it is a whole body and is read as a short reply (D6). `wNoHost` still rejects a `/w/` with no host inside a clause.
- **New rejections:** a short reply with nothing before it; a lone `/w/` reply with no single host (D6); a blank answer whose letter does not match the blank (D7). Open decision O1 may add one more: nouns and a feeling word with no verb.

## Problem

1. **Sentences of only an `/h/` word have no taught meaning, and sentences of only a `/w/` word are rejected.** `hal.`, `hadurom.` and `thomam.` parse, but no page says what they mean. The reader treats each as a claim with no verb, which gives *an unsaid event happened at no time* for `hal.`. `wal.` and `welazem.` fail `wNoHost`. This blocks a taught question: `fill-ask-jobs.md#when` teaches `yel war guzemel zazozon.` (*When is Azozon sleepy?*), but its natural answers, `wanurul.` and `wal.`, do not parse. No page shows an answer to a `har` or `war` question, and no page shows a short answer like *Never.*, *Sometimes.*, *Very.* or *Maybe.*
2. **The verbless readings that exist are rarely what a speaker means.** *There is a dog* (`zodozel.`), *something happened to a dog* (`dodozel.`) and *something is big* (`gelazem.` outside an answer) are rare sentences. The same short shapes are exactly what English uses for replies, afterthoughts and corrections.
3. **The docs' own English disagrees with the existence rule.** In the blockquoted examples with `reading.existence`, a new noun plus `/ɡ/` is glossed as a property claim 58 times (*The book is less clear than advertised*) and as *there is* 28 times. The other 63 are phrases or feeling sentences, and 303 hits have no blockquote gloss. The people writing examples did not use the split, and learners will not either.
4. **Gaps in blank replies.** `questions.md:102` gives existence as the reply for a `/z/` blank and a lone object for a `/d/` blank, but says nothing about `/b/`. No page shows a reply to a `var` question.

**What existence actually does in the docs.** 760 example hits in 77 files. Its main real job is counting and amounts: *There are three cats*, *There are few trumpets*, *There is more tea than the rules allow*. Every one of these takes one more word under this proposal, and all of the rewritten forms parse today:
- `zogozelx gragel vuzuvem.`
- `zul godozel vuzuvem.`
- `zerulal vuzuvem thohem blugalal.`
- `zodozel zogozel zal vuzuvem.`

## Goals

- A one-word `/h/`, `/w/` or `/th/` sentence has a sensible meaning in every context where English uses it: as a blank answer, as a yes/no answer, and as an afterthought or correction.
- Existence has one spelling, with a verb. A subject plus a predicate has one reading. No verbless sentence keeps a rare reading of its own.
- The *when?* question can be answered, the *what happened?* question shows its answer, and the `/b/` blank reply is taught.
- Tools agree with the grammar: parser, reader, solver (an existence claim follows from a property claim on a new noun), realizer, English helper and LLM prompt.

## Non-goals

- **Definiteness glosses.** Many examples gloss a new `-l` noun with English *the* (*The ship is water-powered*, `zahaval gaoxowulal.`). That is a separate question about `-l` against `-r`, and this proposal leaves those glosses alone. It could be logged as an idea of its own.
- **A copula.** Property, kind and identity claims stay verbless (N1).
- **The open bare restrictors** (`hel`, `hul`, `hol`, …, `unassigned-reserved.md:104`). They still compete with standalone joins.
- **A lone sentence linker** (`xezem.`) stays open.
- **Gift tags and dedications** (*For Azozon.*). A lone `/b/` with nothing before it is not well formed (D13 is dropped as a rare form).

## Design

### 1. Claim shapes with no verb

| Body with no verb | Reads as | Example |
|---|---|---|
| Subject + `/ɡ/` predicate | a property, kind, in-progress or amount claim | `zazozon gamahum.` *Azozon is challenging*; `zodozel gelazem.` *A dog is big* |
| Subject + IDENTITY + `bl-` | identity | `zagayul gorel blazozon.` |
| Subject + place hook + `/b/` (N5) | where it is | `zodozel al bohahal.` *A dog is in a house* |
| A lone feeling or sake word (D10, D11) | unchanged: a sentence about you | `thawetham.`, `thudathumum.` |
| A bare citation | unchanged: a greeting, or a one-noun answer | `azozon.` |
| Under a command word, with no command before | unchanged: the act is unsaid, the listener does it (D9) | `yol hadurom.` *Hurry!*; `yol gugowul.` *Be quiet!* |
| Anything else | a **short reply** (§ 3) | `hal.`, `welazem.`, `dodozel.`, `balazun.`, `gelazem.` |

- The predicate test uses the reader's claim: a `pred`, an IDENTITY pair, or a place detail (`hookJob` place). A `/ɡ/` that is a fence's shared kind (`zul godozel`) is not a predicate. Neither is a genitive `om` pair (`zodozel om buwen`).
- A new noun on `-l`, `-m` or `-ln` still brings in a new member, as it does in any clause (`newMember` binder). So *a dog is big* still entails that a dog exists, and the solver must keep that entailment (F4).
- **Counts and amounts (N4).** A number or amount on a subject is a property of that set: `zogozerx gragel.` *The cats number three*. *There are three cats* is `zogozelx gragel vuzuvem.`. Two sets compared with no verb stay a property claim when the English reads that way (*Cats are fewer than dogs*). When the English is about how many exist, add `vuzuvem`.
- **Noun-outcome hinges** (`causation.md`: `zerulal gohem blugalal.`) keep their form and reading: a subject plus a `/ɡ/` hinge is a predicate. The prose stops calling it existence: *a new noun brings rain in, and the hinge says when*. The gloss *There is rain if there are clouds* stays.

### 2. Existence (`vuzuvem`)

- `vuzuvem` is `v` + `uzuve` *stand* + abstract `-m`, whose sense is *presence* (the lexicon's aliases already list *existence; attendance*). It covers *there is / there are*, *exists*, and *is here*.
- Examples:
  - `zodozel vuzuvem.` *There is a dog.*
  - `yel zodozel vuzuvem.` *Is there a dog?*
  - `zul godozel vuzuvem.` *There is no dog.*
  - `zodozel om buwen vuzuvem.` *My dog is here.*
  - `zalazun vuzuvem thudathumum.` *Something is off now that Alazun is here, and I want to get away* (N7).
- The lexicon unit adds the English reading (an `english_by_pos` entry for the verb on `-m`), following [lexicon.md](../../meta/procedures/lexicon.md).
- `predication.md#existence` keeps its id and is retitled *Existence (`vuzuvem`)*, so the 17 inbound links stay valid. Each linking sentence is checked against the new reading.

### 3. Short replies

**Which sentence a short reply reaches back to (D2).**
- The sentence right before it, whoever said it. This is the window sentence linkers and polar words use (`sentenceBefore` in `discourse-slots.ts`). A goodbye ends it, and a quote blocks it.
- A sentence with no clause is skipped: a call, a polar word, an interjection. So in `yel zahelan vowurol. yuol. hur.`, the `hur.` reaches back to the question.
- If the sentence before was itself a short reply, the new one reuses the clause that reply rebuilt. A chain keeps building on the same clause.

**What carries over (D3, D4).**
- The verb, the nouns, the `/h/` words, and a verb denial (`vul`) carry over.
- Person pointers keep the people they pointed to. If A says `zuwen vowurol.` and B replies `hal.`, B means *You never walk*.
- The earlier sentence's `/th/` words and its act word do not carry over. The reply's own act word applies: `yel hanurul.` after a statement is the echo question *At night?*.
- A carried denial stays inside the reply's words. After `yel zahelan vowurol vul.`, the reply `har.` means *Sometimes (she doesn't)*. To say *sometimes she does*, restate the body: `yuol. zahelan vowurol har.`. This matches how `yaol` / `yuol` treat a negative question.

**How the reply's words combine with the rebuilt clause (D5, N6).** A word for something the clause holds only once replaces it:
- a restrictor replaces the restrictor (`zahelan vowurol hal.`, then `har.`, is a correction);
- a degree word replaces the degree on its host;
- a blank filler replaces the blank;
- a `/ɡ/` predicate replaces the predicate (`zodozer gelazem.`, then `gamezem.`);
- a noun in a role the clause already fills replaces that noun (*Azozon sees a dog.* `zazozon dodozel vayebel.`, then `dogozel.` *(No,) a cat.*).

Everything else is added, and covers the whole rebuilt clause as if it were said first in it:
- a noun in an empty role (`zazozon varuyol.`, then `balazun.` *For Alazun.*);
- `/h/` words (`hadurom.` *Quickly.*);
- `/th/` stance words (`thomam.` *Maybe.*).

*Too* is the resumed verb, which is already taught: `zazozon vowuror.` *Azozon does too* (`resume-sense.md`).

**Which clause the reply applies to (D8).** A blank's filler goes wherever the blank is, including inside a dependent, as it does today. With no blank, the reply applies to the last main clause.

**A lone `/w/` reply (D6).** It grades, in this order:
1. the blank's host (`yel war guzemel zazozon.`, then `wal.`);
2. the claim's predicate adjective, in a claim with no verb;
3. the one gradable (`/ɡ/`, `/h/` or `/th/`) word in the rebuilt clause.

With no host, or with two or more candidates, the reply is rejected (`wReplyHostless`). The learner then writes the host: `welazem gelazem.`

**Letters (D7, D12).** A blank answer keeps its blank's letter. `hanurul.` after a `war` blank is rejected (`replyLetterMismatch`), and the message names the right letter. After a `var` blank, a lone verb fills it (`yel var zazozon. vowurol.` *Walks.*). A `/b/` blank takes a lettered `/b/` reply.

**Commands (D9).** Under a command word, a reply reuses the clause before only when that sentence was a command. Otherwise it keeps the unsaid-act reading.

**`/th/` words (D10, D11).** Stance words take part as replies: MAY, channels, certainty, wants and plans, and reasons with `bl-`. That gives *Maybe.*, *So I hear.* and *Because of X.* Feeling words and sake words do not take part: a lone feeling or sake word keeps its taught reading as a sentence about you, and thanks is unchanged.

**Examples the teaching section uses.** All of these parse today except the `/w/` replies.

| Pair | Reads |
|---|---|
| `yel har zahelan vowurol. hanurul.` | *When does Ahelan walk?* *At night.* |
| `yel har zahelan vowurol. hal.` | *… Never.* (also `hual.` *Always.*, `huam.` *Usually.*, `har.` *Sometimes.*) |
| `yel zahelan vowurol. har.` | *Does Ahelan walk?* *Sometimes.* |
| `yel zodozel gelazem. thomam.` | *Is the dog big?* *Maybe.* |
| `yel zodozel gelazem. welazem.` | *… Very.* (`wamezem.` *Slightly.*) |
| `yel war guzemel zazozon. wal.` | *When is Azozon sleepy?* *Never.* |
| `zazozon vowurol. hadurom.` | *Azozon walks. Quickly.* |
| `yel zahelan vowurol. yuol. hur.` | *… No. Some other time.* |

**Writing examples.** A short reply is checked in context, so a reply example sits in the same code span as the sentence it reaches back to. Today, `fill-ask-jobs.md#what-kind` shows `> gelazem.` in a blockquote of its own; it moves into one span with its question. `<!-- lint: fragment -->` is not used for replies: its sample context cannot supply the blank.

### 4. Where it is taught

- **`predication.md`:**
  - the claim-shape rule in § 1;
  - *Existence (`vuzuvem`)* (§ 2);
  - the *Something happened (a lone object)* section is removed, and its two inbound links (`questions.md:102`, `:160`) point to the short-replies section instead.
- **`fill-ask-jobs.md`:** a new H3, *Short replies* (`#short-replies`), at the end of the teaching sections, before Practice. It covers the rule, the three contexts, replace or add, the `/h/`, `/w/` and MAY examples, and the D4 *Compare with*.
  - It sits there because it comes after restrictors, questions and MAY in the reading order, so it needs no forward links.
  - The *When?* section gains its answer examples, and a `var` reply goes in `questions.md`.
  - O2 covers the case where the sitting grows too long.
- **`questions.md:102`** and **`:160`:** blank replies of several nouns are short replies, and the `/b/` blank case is added.
- **One line each, on pages later in the reading order:** `very-and-slightly.md` (*Very.* / *Slightly.* as replies) and `evidentiality.md` (a lone channel as a reply).
- **Prose that names existence** is reworded: `hooks.md:220`, `causation.md:27`, `universals-domains.md:62`, `how-you-feel.md:281`, `social-ties.md:61`, the `word-shape-clause` cheat sheet rows, and the Existence link in `say-reasons.md`.
- **`terminology.md`:** *short reply*.
- **`design-decisions.md`:** D-65's rationale changes, because a lettered reply is now a short reply rather than existence or a lone object. The feelings note on *a noun before a lone feeling* changes to the `vuzuvem` form. New entries record the D7 and D6 rejections and the reason a short reply needs a sentence before it.
- **`unassigned-reserved.md`:** entries for the new rejections. The lone `/b/` with nothing before it is listed as open.

## Implementation plan

Three phases, run through subagents. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates the proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

**Order and why.** Phase 1 rewrites the examples into forms that are valid, and mean the same, under both the old rules and the new ones: add `vuzuvem`, drop the period on phrases, merge each reply into its question's span. That keeps the tree green before the parser changes. Phase 2 changes the rules: teaching, parser, reader, tools. Phase 3 adds Practice, the remaining lines and the style gate.

**Gates.**
- **At the start of each phase**, the orchestrator saves `npm run verify -- --baseline`, notes the phase-start commit, and writes the rule digest below, with that commit's sha, to the scratchpad.
- **Each unit** ends with `npm run verify -- --allow-generate`, which must pass before its commit.
- **F2** also runs `npm run grammar-check`.
- **Recall gate:** phase 1 (R5) and phase 2 (F4) edit `say-*.md`, `english.md` or `src/english-helper/`. Each of those phases ends with `npm run english-helper-recall -- --check`, and the result goes on the Status line.
- **Cheat sheets:** after a phase's hand units are committed, the orchestrator runs `npm run cheat-sheet-blocks -- --write` and commits its output alone ([fence automated rewrites](../../meta/procedures/proposals.md#fence-automated-rewrites)).
- **The final gate** is a full `npm run verify` against an empty baseline at the end of phase 3.

**Style.** Writers of grammar prose self-check against the [checklist](../../meta/doc-style.md#checklist). Phase 3 ends with a `style-editor` unit over `npm run changed-sections -- <commit before R0>`.

**Decisions.** The user settled them all. O1 and O2 are logged under [Open decisions](#open-decisions) for phase 2.

### Phase 1: example rewrites

About 38 orchestrator turns. As a [full run](../../meta/procedures/full-execution.md), this phase splits after R3 (phase 1a: R0–R3; phase 1b: R4–R6), because of the four-unit cap.

**R0 Triage worklist.** `proposal-worker`, `model: sonnet`, effort `medium`.
- Writes a script in `tmp/scratch/` that lists every example whose body has no verb, under `docs/grammar/` and in `src/` string literals and fixtures. It should not rely on the two reading ids alone: lone `/ɡ/` answers, for example, carry neither. Suggested sources:
  - `find.mjs --json --all` over `--construction reading.existence`, `reading.unsaidEvent` and `sentence.sentence.fragment`;
  - plus a pass that parses each example and keeps bodies with no `vp` unit.
- For each hit, records the file, line, span, nearest English gloss, and a bucket:
  - **K**, keep: a subject plus a predicate (§ 1), whose English is not a count of what exists;
  - **E**, add `vuzuvem`: no predicate and the English says *there is / are / exists / is here*, or a count or amount whose English says how many exist;
  - **P**, phrase: no predicate and the English is a noun phrase, so drop the period;
  - **Q**, reply: a reply in a span of its own after its question, so merge it into the question's span;
  - **U**, a lone object, or a body with no predicate used as a claim, to be reworded as a short reply after a sentence, or cut;
  - **?**, unsure.
- Writes the worklist to `docs/proposals/run-state/verbless-sentences/worklist.tsv`, so it survives a lost container, and reports the counts per bucket and per band.
- **May edit:** that worklist only.

**R1 Beginner pages.** `proposal-worker`, `model: opus`, effort `medium`. Works through the worklist rows for `docs/grammar/beginner/`, Practice and `review.md` included.
- Applies E, P, Q and U, and updates each changed example's morph line. The P, Q and U changes need no gloss change; E keeps its *there is* gloss.
- Also rewrites the example and its one sentence of prose in `how-you-feel.md:281` (`zalazun vuzuvem thudathumum.`) and `social-ties.md:61` (`zodozel om buwen vuzuvem.`). Both forms are valid and true under the current grammar.
- Leaves untouched the `predication.md` sections *Existence* and *Something happened*, the `fill-ask-jobs.md` answer `> gelazem.` (F1 owns all three), and every K row.
- Writes `?` rows up as decisions, with a **Recommendation:**.
- **May edit:** `docs/grammar/beginner/*.md` except `predication.md` and `fill-ask-jobs.md`.

**R2 Intermediate pages, A–L.** `proposal-worker`, `model: opus`, effort `medium`. As R1, for the files under `docs/grammar/intermediate/` from A to L.
- Includes the `universals-domains.md:62` example and sentence (`zul godozel vuzuvem.`).
- **May edit:** those files.

**R3 Intermediate pages, M–Z.** As R2, for M to Z.

**R4 Advanced pages and cheat sheets.** `proposal-worker`, `model: opus`, effort `medium`. Reads [cheat-sheets.md](../../meta/procedures/cheat-sheets.md) first.
- Covers `docs/grammar/advanced/`, `review-advanced.md`, and the hand-written rows of `docs/grammar/cheat-sheets/`, including the `word-shape-clause` existence rows (*Something exists*: `zodozel vuzuvem.`).
- A row inside a generated block is fixed in its source data, never in the block.
- **May edit:** those pages, and the data file a generated row comes from.

**R5 Recipe track.** `proposal-worker`, `model: opus`, effort `medium`.
- Covers `english.md`, every `say-*.md` (`say-people-places.md` has 68 hits, `say-amounts.md` 28), and the *there is* detector's suggested form in `src/english-helper/detectors.ts` (it now points at `vuzuvem`).
- **May edit:** those files and `src/english-helper/detectors.ts`.

**R6 Source literals and meta corpora.** `proposal-worker`, `model: sonnet`, effort `medium`.
- Covers the worklist rows in `src/` fixtures and test literals, and in `docs/meta/syntax-test-corpus.md`. Only rows whose test does not assert the existence reading itself; F2 owns those.
- **May edit:** the listed fixture and test files, and that corpus.

Order: R0, R1, R2, R3, R4, R5, R6, then the cheat-sheet output and the recall gate.

**Commits:** R0 (the worklist), R1–R6, the cheat-sheet output, and the consolidated proposal: about nine.

### Phase 2: the rules

About 36 orchestrator turns. O1 and O2 are settled before F1 starts.

**F1 Teaching.** `proposal-worker`, `model: opus`, effort `high`. Prose that is valid under both parsers.
- Rewrites `predication.md` per § 1 and § 2, and removes *Something happened*.
- Writes `fill-ask-jobs.md#short-replies` with every § 3 example except the `/w/` replies, which wait for F2. Merges the `> gelazem.` answer into its question's span.
- Rewords `questions.md:102` and `:160`, and adds the `/b/` and `var` replies.
- Rewords the existence prose in `hooks.md:220` and `causation.md:27`. Retargets the inbound links of `#unsaid-event` with `npm run page-refs` and `retarget-id`.
- Measures `fill-ask-jobs.md` per [restructure-sittings.md](../../meta/procedures/restructure-sittings.md). If it is over the limit, stops and reports (O2).
- Checks forms with `--check-lexicon --at <page>#<id>`.
- **May edit:** `predication.md`, `fill-ask-jobs.md`, `questions.md`, `hooks.md`, `causation.md`, `say-reasons.md` (the link only), `terminology.md`.
- **Commit:** held, and made together with F2, so the grammar and the parser land in one commit.

**F2 Parser.** `proposal-worker`, `model: opus`, effort `high`.
- **Verbless bodies.** Classifies each one in `construction-trace.ts` and `resolve.ts` as a claim (subject + predicate), a short reply, or one of the unchanged kinds in § 1.
  - Retires `reading.existence` and `reading.unsaidEvent`.
  - Adds `reading.shortReply`, and `reading.existence` for a `vuzuvem` clause if the reader needs the id.
  - Generalizes `fillAnswers` to every short reply.
- **Rejections.** Short reply with nothing before (`shortReplyNoSentence`); `wReplyHostless` (D6); `replyLetterMismatch` (D7); and O1's id if O1 says to reject. Each gets an error message that names the fix.
- **`wNoHost`** is lifted for a `/w/` that is a whole body.
- Adds an interpreter classification row for each new id and removes the retired ones (`classes.ts`, `interpreter.md`).
- Adds the `/w/` reply examples to `fill-ask-jobs.md#short-replies`, plus their entries in `unassigned-reserved.md` and `design-decisions.md` (§ 4).
- Updates parser tests: a case expecting the old reading turns into a short reply in context, or into a `vuzuvem` sentence.
- Before briefing, the orchestrator greps once for `isExistence`, `isUnsaidEvent`, `reading:existence`, `reading:unsaidEvent` and `fillAnswers`, and adds any file the value reaches.
- Reports the ids and forms that F3 and F4 are briefed from.
- **May edit:** `src/parse/construction-trace.ts`, `src/parse/constructions.ts`, `src/parse/resolve.ts`, `src/parse/enforce.ts`, `src/parse/enforce-structure.ts`, `src/parse/discourse-slots.ts`, `src/parse/sentence-grammar.ts`, the parser tests, `src/interpret/classes.ts`, `docs/meta/interpreter.md`, `docs/meta/unassigned-reserved.md`, `docs/meta/design-decisions.md`, `docs/grammar/beginner/fill-ask-jobs.md` (the `/w/` examples only), and the files the grep adds.

**F3 Reader.** `proposal-worker`, `model: opus`, effort `high`.
- Builds the short-reply reading in `src/interpret/`: it rebuilds the clause before per D2, D3, D4, D5, D6, D8 and D9, and puts the reply's words in.
- Before briefing, the orchestrator runs one `reading.mjs probe` over the § 3 table, the D4 pair, a chain, a reply that skips a polar word, a command reply, and a noun correction. It pastes the result into the brief.
- Adds reader tests, and updates the `interpreter.md` reader notes and the `sentenceBefore` row.
- **May edit:** `src/interpret/read.ts`, `src/interpret/read-context.ts`, the reader tests and fixtures, `src/parse/discourse-slots.ts` (the reader cell), `docs/meta/interpreter.md`.

**F4 Solver, realizer, helper, prompt.** `proposal-worker`, `model: opus`, effort `high`.
- **Solver.** A `vuzuvem` clause on a new noun gets the existence encoding, so `yel zodozel vuzuvem.` is answered *yes* after `zodozel gelazem.`. A *no K* fence with `vuzuvem` denies it.
- **Realizer.** Spells existence with `vuzuvem`, and never spells a verbless noun sentence as a claim.
- **English helper.** Its *there is* detector names `vuzuvem`.
- **LLM prompt.** Gains a line saying that a body with no verb and no subject–predicate pair continues the sentence before. The `reader` notes in `constructions.ts` change to match.
- Before briefing, the orchestrator probes 5 to 10 existence and count samples with `npm run realize -- spell`.
- Runs the recall gate.
- **May edit:** `src/interpret/translate*.ts`, `src/interpret/solve.ts`, `src/interpret/equal.ts`, `src/interpret/ask.ts`, `src/realize/claim.ts`, `src/english-helper/detectors.ts`, `src/parse/llm-prompt.ts`, `src/parse/constructions.ts` (the `reader` fields), the matching tests and fixtures, `docs/meta/solver.md`, `docs/meta/realizer.md`.

**L1 Lexicon.** *Orchestrator*. Gives `uzuve` the English reading of the verb on `-m` (*exist / be present*), following [lexicon.md](../../meta/procedures/lexicon.md). Reads that procedure's *editing a row* section, and the `uzuve` row only.

Order: L1, F1, F2 (F1 and F2 commit together), F3, F4, the cheat-sheet output, the recall gate.

**Commits:** L1, F1+F2, F3, F4, the cheat-sheet output, and the consolidated proposal: about six.

### Phase 3: Practice, the rest, style

About 30 orchestrator turns.

**L2 Remaining lines.** `proposal-worker`, `model: opus`, effort `high`.
- Adds the one line each to `very-and-slightly.md` and `evidentiality.md` (§ 4).
- Adds a sentence to the *What carries past a period* table in `sentence-linkers.md`, saying a short reply reads the sentence before.
- Checks that `word-reach.md` mentions nothing these changes broke.
- **May edit:** `very-and-slightly.md`, `evidentiality.md`, `sentence-linkers.md`, `word-reach.md`.

**C1 Beginner Practice.** `checkpoint-writer`, `model: opus`, effort `high`.
- Tops up the checkpoints on `predication.md` (existence with `vuzuvem`; a subject plus a predicate with a new noun) and `fill-ask-jobs.md` (each short-reply context).
- Two **Fix it** items: `gelazem.` with nothing before it, and `hanurul.` after a `war` blank.
- One or two items for the beginner level review.
- The orchestrator rebuilds the pack with `node scripts/checkpoint-pack.mjs` right before the unit.
- **May edit:** the `### Practice` sections of those sittings, `docs/grammar/beginner/review.md`, the drill allowlist.

**C2 Intermediate Practice.** `checkpoint-writer`, `model: opus`, effort `high`.
- Tops up `very-and-slightly.md` (*Very.* as a reply) and `polar-inventory.md` (the D4 negative-question item).
- **May edit:** those Practice sections, `review-intermediate.md`, the drill allowlist.

**S1 Style gate.** `style-editor`, `model: opus`, effort `high`. Reviews `npm run changed-sections -- <commit before R0>`.

Order: L2, C1, C2, the cheat-sheet output, S1, the final gate.

**Commits:** L2, C1, C2, the cheat-sheet output, S1, and the consolidated proposal, which is then deleted or moved per [folder and links](../../meta/procedures/proposals.md#folder-and-links): about six.

### Rule digest (copied into every brief)

- The language is **Ageben**. Grammar pages show only the current language.
- **Phase-start sha:** `<sha>`. The `verify` baseline was saved there.
- **The rule (settled):**
  - A body with no verb is a claim only as a subject plus a predicate: a `/ɡ/` word, IDENTITY + `bl-`, or a place hook + `/b/`. This holds whatever the noun's ending.
  - Existence is `vuzuvem` (`zodozel vuzuvem.`). A count of what exists uses it (`zogozelx gragel vuzuvem.`).
  - Every other verbless body is a short reply that reaches back to the sentence before. The exceptions are a lone feeling or sake word, a bare citation, and a command with no command before it.
  - A short reply with nothing before it is not well formed.
- **Phase 1 only:** every rewrite must be valid, and mean the same, under the current parser too. Add `vuzuvem`; drop the period on a phrase; merge a reply into its question's span. Never change a K row's spelling or a gloss's meaning.
- **Parser and grammar:** a change to what the parser accepts or how it reads a form lands with the grammar edit that teaches it, and with an interpreter classification row for each new construction id (`npm run class-row -- KEY`).
- **Tests:** change a test only where it expects a reading this proposal retires. Run tests with `npm test` (`npm test -- FILE`), never a bare `tsx --test` or `npx vitest`.
- **Code:** run `.ts` with `npx --no-install tsx`. Keep files under the size limit; measure with `npm run deps`, move with `npm run move-decl`. Never run `prettier`. After a grammar-rule change, `npm run grammar-check` must pass.
- **Ageben:** check forms with `node scripts/parse.mjs --check-lexicon '<a>' '<b>' …` in one batched call, with `--at <page>#<id>` for a stage page. Use `--llm-prompt` only to work out what a sentence means. Search examples with `node scripts/find.mjs`, never grep. Batch probes in one `reading.mjs probe` file. Root spellings come from `npm run convert-word`, never by hand.
- **Morph lines:** every changed example's morph line is updated to match the parse.
- **Grammar prose:** follow the [checklist](../../meta/doc-style.md#checklist). No forward links on stage pages. Never link to a file under `docs/proposals/`. Find links into a page with `npm run page-refs`. Never edit text between `<!-- generated -->` markers.
- **Reading:** list headings first, then read only the line ranges you need. When a result says *Output too large*, grep or slice the saved file.
- **Scratch files** go in `tmp/scratch/`. A script that edits files is written with the Write tool and run from there.
- **Verify:** end with `npm run verify -- --allow-generate`. When it reports a new error, read only that line of `tmp/logs/verify-last.log`.
- **Never commit**, and never edit `AGENTS.md` or `.claude/`. Report any change they need as exact old and new text.
- **Stop and report**, without working around it, when a premise no longer holds, when later units would need a different design or order, or when skipping would leave a broken state. Stop the same way when a needed file is outside the brief's list.
- **Decisions:** settle none that the brief does not hand you. Write it up with a **Recommendation:** and a confidence, and skip the item.
- At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
- **Report**, about 150 words, in fixed fields:
  - done, in one line
  - counts per bucket handled (phase 1)
  - forms, glosses and construction ids added
  - `AGENTS.md` lines to change
  - the `verify` line
  - skips, with reasons
  - decision write-ups
  - **left:**
  - **inefficient:**

### Commits

Each commit message starts with `verbless-sentences.md` and the unit ID, then `[skip-cd]`, then the co-author line. Only the orchestrator commits, staging only the unit's files. F1 and F2 share one commit. The expected totals are under each phase.

## Decisions
<a id="decisions"></a>

Settled by the user, 2026-11-26. Each reading is written into the design section named.

- **D1** Adopt short replies in three contexts: blank answer, yes/no answer, afterthought or correction (§ 3). The redesign below extends them to nouns.
- **D2** The window is the sentence before, whoever said it. Sentences with no clause are skipped, and a chain reuses the clause the previous reply rebuilt (§ 3).
- **D3** Content carries over, including the people pointers point to. `/th/` words and the act word do not (§ 3).
- **D4** A verb denial carries over, with a *Compare with* for English speakers (§ 3).
- **D5** Words for something the clause holds once replace it. Everything else is added and covers the whole rebuilt clause (§ 3).
- **D6** The host order for a lone `/w/` reply; otherwise `wReplyHostless` (§ 3).
- **D7** A blank answer with the wrong letter is rejected (`replyLetterMismatch`), and the message names the right letter (§ 3).
- **D8** A blank's filler goes wherever the blank is; otherwise the reply applies to the last main clause (§ 3).
- **D9** A command reply reuses only a command; otherwise the act is unsaid (§ 1, § 3).
- **D10** Feeling words keep their lone reading (§ 3). A correction recorded with it: `thuwathal` is a sake word (thanks), not a feeling word.
- **D11** Sake words keep their lone reading. Thanks is unchanged (§ 3).
- **D12** A `var` blank takes a lone verb reply, and a `/b/` blank a lettered `/b/` reply (§ 3, § 4).
- **D13, D14** Dropped as rare forms. A lone `/b/` and a lone `/ɡ/` are short replies, and with nothing before them they are not well formed.
- **N1** Only existence takes a verb. Property, kind and identity claims stay verbless (§ 1).
- **N2** The existence verb is `vuzuvem` (§ 2, L1).
- **N3** A subject plus `/ɡ/` is a property claim whatever the noun's ending (§ 1).
- **N4** A number or amount on a subject is a property of that set. A count of what exists uses `vuzuvem` (§ 1).
- **N5** A place hook with its `/b/` after a subject is a predicate (§ 1).
- **N6** A noun reply replaces a filled role and adds to an empty one. *Too* is the resumed verb (§ 3).
- **N7** A noun before a lone feeling takes `vuzuvem` (§ 2).
- **N8** Phrase examples drop the period; real claims get a verb (phase 1).
- **Placement and name:** *Short replies* goes at the end of `fill-ask-jobs.md`'s teaching sections, with one line each on `very-and-slightly.md` and `evidentiality.md`. The English name is *short reply* (§ 4).

## Open decisions
<a id="open-decisions"></a>

**O1. Nouns plus a feeling word, with no verb** (`zalazun thudathumum.` once N7 is in place). *Blocking* (it restricts a form, and it touches the feelings theme); due before F2.
- Under § 1 this body is neither a claim nor a lone feeling.
- **(a) Reject it** (`feelingNounNoVerb`), with a message pointing to `zalazun vuzuvem thudathumum.`
- **(b) Read it as a short reply** whose feeling covers the rebuilt clause. After *Azozon left.*, `zalazun thudathumum.` would replace the subject and add the feeling: *something is off now that Alazun left*.
- **Recommendation (medium):** (a). Under (b), a feeling attaches to the last claim without being said, which D10 rules out for a lone feeling. A noun in front should not bring that back. The cost is one word (`vuzuvem`).

**O2. If `fill-ask-jobs.md` grows past the sitting limit.** *Blocking* only if it happens (a new page changes the sidebar); F1 measures it.
- **(a)** A new beginner page, *Short replies*, right after *Fill-ask jobs* in the sidebar.
- **(b)** Peel an existing H3 off `fill-ask-jobs.md`.
- **Recommendation (medium):** (a). Short replies are a topic of their own, and learners will look for them by name. Peeling would split the *when / where / how* set, which belongs together.

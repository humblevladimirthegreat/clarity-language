# Expressiveness review plan

Editors only — not linked from grammar pages. Phased plan for a systematic suggestion pass over `docs/grammar/`, answering two questions:

1. **Gaps** — Is there common English grammar that Agalan cannot express easily, and that is not intentionally discouraged?
2. **Extensions** — Could existing grammar be extended into other forms (unused slots, other role letters, other endings, other vowels) with intuitive new readings?

This is a **suggestion** pass: output is a findings ledger plus proposals, not direct edits to grammar pages. Accepted proposals are applied afterwards through the normal grammar-doc workflow ([grammar-docs](../meta/grammar-docs.md), [doc-style](../meta/doc-style.md)).

Status: `[x]` done · `[~]` partial · `[ ]` not started.

## Ground rules

- **Intentionally discouraged ≠ gap.** Before logging a gap, check [why-agelan](../grammar/why-agelan.md) (limits, feature criteria) and the owning page for a deliberate omission (e.g. no general *to-be* `/v/`, no cause-arrow word, no metric prefixes, generics via joins not **-x**). If the omission is deliberate, log it once as **by design** with the citing section, and move on.
- **"Easily" means for the learner.** A gap exists when the only route is long, unnatural, ambiguous, or taught far later than English speakers need it. Dev effort (cross-reference churn, parser work) is not a cost — see `AGENTS.md`.
- **Extensions must be intuitive.** A proposed reading should be guessable from the existing form's meaning (same vowel series, same role-letter semantics, same ending semantics). Reject extensions that merely fill a slot.
- **Check before proposing.** Look up [unassigned-reserved](../meta/unassigned-reserved.md) (free forms), the lexicon CSVs, and [english.md](../grammar/english.md) (existing English → Agalan mappings) so a proposal neither collides with nor duplicates something already published.
- **No proposal-page links.** New design writeups go in `docs/proposals/` per [proposals](../meta/proposals.md); refer to them by filename in backticks.

## Findings ledger

All phases write to one ledger: [grammar-gaps.md](../meta/grammar-gaps.md) (referenced by `AGENTS.md`, grammar-docs, drill-generation, and unassigned-reserved). Each row:

| Field | Content |
|-------|---------|
| ID | `G-nn` (gap) or `E-nn` (extension) |
| English job / source form | e.g. *reflexive "herself"*; or `th+N` on `/h/` |
| Current route | Best existing Agalan expression, with example, or *none* |
| Verdict | **covered** · **awkward** · **missing** · **by design** · **extension candidate** |
| Owning page | the `docs/grammar/` page that would own it |
| Proposal | one-line suggestion, or `docs/proposals/<file>.md` |
| Priority | **P1** common everyday English · **P2** common in writing · **P3** niche |

## Phase 0 — Setup

- [x] Create `docs/meta/grammar-gaps.md` with the ledger table and a short header (editors only).
- [x] Collect the **by design** list: skim [why-agelan](../grammar/why-agelan.md), [introduction](../grammar/introduction.md), and the removed consistency audit's Decisions (now under [grammar-gaps](../meta/grammar-gaps.md#by-design)) for deliberate omissions; seed ledger rows with verdict **by design**.
- [x] Snapshot [unassigned-reserved](../meta/unassigned-reserved.md) as the free-slot inventory for Phase 3.
- [x] Run `npm run build` to confirm a clean baseline.

## Phase 1 — English coverage checklist (gaps, top-down)

Walk a standard English reference-grammar inventory and find the Agalan route for each item. One agent per group; each agent writes only its group's ledger rows. For each item, write the best Agalan sentence using published roots, run it through the parser, and record the verdict.

| Status | Group | Items to check |
|--------|-------|----------------|
| [x] | **A. Clause types** | declarative, yes/no and wh- questions (incl. *how*, *why*, *how many*, *which*), imperatives (incl. *let's*, negative imperative), exclamatives (*what a…!*, *how …!*), tag questions, echo questions, rhetorical questions |
| [x] | **B. Verb phrase** | tense/aspect jobs (past, perfect *have done*, progressive, habitual, *used to*, *about to*, *just*, *still / already / yet / anymore*), modals (*can, could, may, might, must, should, would, need to, had better*), passive / agentless clauses, causatives (*make/let/have/get someone do*), phrasal verbs, light-verb constructions, reflexive / reciprocal (*themselves*, *each other*) |
| [x] | **C. Noun phrase** | articles and definiteness (*a / the / some / any*), demonstratives, quantifiers (*all, each, every, both, either, neither, none, few, a few, little, several, most, enough, too many*), possessives (*'s*, *of*, double genitive), partitives (*a piece of*), compounds, appositives, generic vs specific reference |
| [x] | **D. Modification** | adjective order and stacking, intensifiers and downtoners (*very, quite, rather, barely, almost, too, so … that*), degree (*as … as*, *more/less*, *the more … the more*), focus adverbs (*only, even, also, just*), sentence adverbs (*frankly, hopefully, apparently*) |
| [x] | **E. Clause combining** | coordination (*and, or, but, nor, either … or, both … and*), subordinators (*because, if, unless, although, while, until, before, after, since, once, as soon as, whereas, whether*), relatives (restrictive, non-restrictive, *whose*, *where/when* relatives, free relatives *whatever / whoever*), complements (*that*-clause, *whether*, infinitive, gerund, reported speech and questions), purpose / result (*so that, so … that, in order to*), conditionals (real, hypothetical, counterfactual, *even if*, *only if*, *unless*) |
| [x] | **F. Information structure** | topicalization, clefts (*it was X who…*, *what I want is…*), existentials (*there is / there are*), extraposition (*it is hard to…*), contrast and focus, ellipsis and gapping (*so do I*, *me too*, *neither does she*), pro-forms (*do so*, *one*, *so / not* as in *I think so*) |
| [x] | **G. Comparison and quantity** | comparatives / superlatives, equatives, *same / different / similar*, *more than N*, *at least / at most*, *approximately*, proportions, *each … respectively*, distributive *apiece* |
| [x] | **H. Discourse and speech acts** | greetings, thanks, apology, requests (softened / firm), offers, suggestions (*why don't we…*), permission, promises, warnings, backchannel (*uh-huh, right, oh*), hedges (*kind of, sort of, I guess*), discourse markers (*anyway, actually, by the way, well, so, besides, in fact, on the other hand*) |
| [x] | **I. Deixis and reference** | person / number in pronouns, *here / there / now / then*, *this / that*, *come / go*, *bring / take*, generic *you / one / they*, indefinite pronouns (*someone, anything, nowhere, everybody*), anaphora across sentences |
| [x] | **J. Time, place, and manner phrases** | locative prepositions (*in, on, under, behind, between, near, across, through, toward*), temporal phrases (*during, since, by (deadline), for (duration), ago, from … to*), manner / instrument / accompaniment (*with, by, without, like*), recipient / beneficiary (*to, for*), source / goal |

**Exit:** every item has a verdict. Items marked **awkward** or **missing** carry a P1–P3 priority.

## Phase 2 — Real-text sampling (gaps, bottom-up)

Checklists miss things that only surface in real use. Translate English sentences and texts into Agalan and log every point where the translator had to stop, paraphrase heavily, or guess.

### 2a — Standard syntax test corpus

Use the [Conlang Syntax Test Cases](https://cofl.github.io/conlang/resources/mirror/conlang-syntax-test-cases.html) (218 sentences, graded from *The sun shines.* to multi-clause reported speech; curated from ~1200 sentences to remove syntactic duplicates) as a fixed, external sentence set. Sentences we did not write avoid picking examples Agalan already handles well, and a shared corpus makes results comparable with other conlangs.

- [ ] Copy the list into `docs/meta/syntax-test-corpus.md` (numbered, source credited) as the working sheet; add an Agalan translation + parser check per sentence. Keep the original numbering so rows can cite `STC-nn`.
- [ ] Split into batches of ~30 (one agent per batch, in list order, since difficulty rises); each stopping point becomes a ledger row citing `STC-nn` (dedupe against Phase 1 IDs).
- [ ] Keep the **by design** rule: a sentence whose English form is deliberately not mirrored (e.g. *is* copula, tense) is **covered** if the meaning has a natural route.

The corpus covers core syntax only — its register is dated narrative, with few questions, almost no discourse markers, hedges, or speech acts, and nothing on the psychological themes. Phase 2b fills those.

### 2b — Register samples

- [ ] Pick ~8 short samples (≈150 words each) across registers: casual chat, text message thread, how-to instructions, news paragraph, story narration, argument / opinion, a support conversation (compassion theme), a decision memo (empowerment / rationality theme).
- [ ] One agent per sample translates with the published lexicon and parser; each stopping point becomes a ledger row (dedupe against Phase 1 IDs).
- [ ] Also log **lexicon-only** gaps separately (missing roots, not grammar) and hand them to the TODO lexicon items rather than this ledger.

**Exit:** corpus and samples translated; new rows added; each row's verdict set.

## Phase 3 — Extension sweep (existing grammar, new readings)

Systematically cross every productive mechanism with every place it could plausibly apply, and ask whether the unused combination has an intuitive reading. Work page by page in the consistency-audit wave order (clause / phonology / word-endings first, overview pages last) so foundations settle first.

For each mechanism, build its applicability grid and inspect the empty cells:

| Status | Mechanism | Axes to cross |
|--------|-----------|---------------|
| [ ] | Role letters | each role letter × each closed-form family (numbers, joins, hooks, polar stance, values, knowing moods) — e.g. is there a `/w/` or `/h/` reading a family lacks? |
| [ ] | Word endings | **-l / -m / -n / -r** × each closed-form family where only some endings are defined |
| [ ] | Vowel series | **a / o / e / u** (add / one / order / undo) × every family that uses the series — any family using only part of it? |
| [ ] | Numbers | digitless and exponent forms × role letters not yet assigned (see [numbers](../grammar/numbers.md)); stance numbers × other stances |
| [ ] | Joins | set / rank × arity × role letters (see [joins](../grammar/joins.md), [join-across-roles](../grammar/join-across-roles.md)) |
| [ ] | Hooks | hook × role / ending combinations not yet read |
| [ ] | Mid-word `x` and `th` | [x-compounds](../grammar/x-compounds.md) families × left-hand types not yet allowed |
| [ ] | Spans | TYPE × EDGE × ending cells in [spans](../grammar/spans.md) |
| [ ] | Stance / mood roots | [knowing](../grammar/knowing.md), [causation](../grammar/causation.md), [intention](../grammar/intention.md) moods × other role letters (stance vs noun vs adverb readings) |
| [ ] | Plurality | **-x** on hosts where it is currently "unused" ([plurality](../grammar/plurality.md)) |
| [ ] | Tone marks | tone marks × scopes and positions not yet defined ([speech-moves](../grammar/speech-moves.md#tone-marks)) |

For each empty cell, record one of:

- **intuitive** — a reading follows from the existing semantics without new explanation → extension candidate (`E-nn`).
- **forced** — a reading exists but must be taught as a new rule → log only if it also fills a Phase 1/2 gap.
- **none** — leave unused; mark in [unassigned-reserved](../meta/unassigned-reserved.md) if not already listed.

**Exit:** every grid inspected; extension candidates logged. Cross-link each **intuitive** extension to any gap it closes.

## Phase 4 — Triage and proposals

- [ ] Merge duplicates; link gaps to extensions that close them (preferring extensions over new forms).
- [ ] Rank by priority, then by how many ledger rows one proposal closes.
- [ ] For each P1 item and any multi-row extension, write a short proposal in `docs/proposals/` (current route, proposed form, examples with morph glosses, interaction with existing forms, learning level per [learning-levels](../meta/learning-levels.md)).
- [ ] Present proposals to the language owner in batches with a recommendation each; record decisions (accepted / rejected / by design) in the ledger.

**Exit:** every **awkward** / **missing** row is either answered with a proposal decision or deferred with a reason.

## Phase 5 — Apply accepted proposals

- [ ] Apply each accepted proposal to its owning grammar page only (one agent per page), following [grammar-docs](../meta/grammar-docs.md) and [doc-style](../meta/doc-style.md).
- [ ] Update lexicon / overlay CSVs and the parser where the proposal adds forms; add parser tests.
- [ ] Update [english.md](../grammar/english.md) with new English → Agalan mappings.
- [ ] Remove used slots from [unassigned-reserved](../meta/unassigned-reserved.md).
- [ ] Add each accepted and rejected decision to [grammar-gaps by design](../meta/grammar-gaps.md#by-design) so it is not re-raised.
- [ ] Add translation checkpoints for new beginner / intermediate features per [drill-generation](../meta/drill-generation.md).
- [ ] Run `npm run build` and `npm test`.

**Exit:** build and tests clean; ledger rows marked **covered**.

## Progress

| Phase | Status | Date |
|-------|--------|------|
| 0 — Setup | [x] | 2026-09-25 |
| 1 — English coverage checklist | [x] | 2026-09-25 |
| 2 — Real-text sampling | [ ] | |
| 3 — Extension sweep | [ ] | |
| 4 — Triage and proposals | [ ] | |
| 5 — Apply | [ ] | |

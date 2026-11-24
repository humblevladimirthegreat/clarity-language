# Grammar newcomer rewrite: explain for people, summarize for agents

**Status:** IN PROGRESS, 2026-11-24. P1 done 2026-11-24 (U1 to U5, A1, S1; commits 0f176a5c to dbe65d02): the newcomer tests and agent summaries are in [grammar-docs.md](../../meta/grammar-docs.md#newcomer), the agent-summary lint and `outline --summaries` are built, and the pilot pages [clause.md](../../grammar/beginner/clause.md), [knowing.md](../../grammar/beginner/knowing.md) and [how-you-feel.md](../../grammar/beginner/how-you-feel.md) are rewritten and are the model the digest names. M1 was dropped, because the user approved the pilot in advance. Next: P2. `<rev>` is 5cb1637b. Decided 2026-11-24 (user): the pilot is approved in advance. Decided 2026-11-24 (user): an inline overlay cue names the root's citation plus a short why, `(cue: same root as …: …)`, with no emoji scene; table **Cue** cells keep their scenes ([when to state a scene cue](../../meta/grammar-docs.md#when-to-state-a-scene-cue)); every rewrite applies it. Decided 2026-11-24 (user): later phases may be far off, so until L2 nothing (`AGENTS.md`, agent files, the stage checklist) tells an agent to rely on summaries; L2 makes the tooling hand them out. Decided 2026-11-24 (user): digests and unit briefs are tracked in git under `docs/proposals/run-state/grammar-newcomer-rewrite/`, not in the scratchpad, so the run can continue in another environment ([run state](#run-state)). Decided 2026-11-24 (user): the Claritish review list (R1 of `claritish-newcomer-rewrite.md`) folds into this proposal as unit C1, and that proposal is deleted when C1 lands. The scope is tiered: stage pages and the recipe track get the full newcomer rewrite. The orientation pages, terminology and the tool pages get a tone pass plus agent summaries. The cheat sheets get a tone pass of their hand-written prose only. On stage pages, contrasts and near misses go inside the existing H3s, so headings, sittings, URLs and checkpoints stay as they are. Carried over from the Claritish run (decided 2026-11-21 and 2026-11-23): the prose is written for human comprehension first, in the voice of technical documentation per the [tone](../../meta/doc-style.md#tone) guidelines; there is no length cap, because the newcomer tests set the length; agents read each section's rules from a terse `<!-- Agent summary: … -->` comment; the agent-summary lint and the `outline` support were deferred to this proposal.

**Related:** every stage page under [`docs/grammar/beginner/`](../../grammar/beginner/), [`intermediate/`](../../grammar/intermediate/) and [`advanced/`](../../grammar/advanced/); the recipe track ([english.md](../../grammar/english.md) and the `say-*.md` pages); [purpose.md](../../grammar/purpose.md), [introduction.md](../../grammar/introduction.md), [terminology.md](../../grammar/terminology.md), the tool pages at the top of [`docs/grammar/`](../../grammar/), the [cheat sheets](../../grammar/cheat-sheets/) and the level reviews. Policy: [grammar-docs.md](../../meta/grammar-docs.md), [doc-style.md](../../meta/doc-style.md), [claritish-style.md](../../meta/claritish-style.md) (newcomer tests and agent summaries, the model for this run), [orientation-style.md](../../meta/orientation-style.md), [glosses.md](../../meta/glosses.md). Tooling: [`scripts/outline.ts`](../../../scripts/outline.ts), the build's lint steps, [AGENTS.md](../../../AGENTS.md).

**Depends on:** none. `claritish-newcomer-rewrite.md` is finished except for its review, which C1 absorbs.

**Design authority:** *none*. The rewrite adds, drops and respells no form. It adds no reading, rule, exception or default. Every rule the new prose states is already on the page or on the page that owns that subsystem.

## Implementation plan

At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

The run uses subagents. Each page reads its own owning sections, which other pages share little of. Fact audits need a fresh context that wrote none of the prose, and so do style reviews.

**Phases.** P1 (done) wrote the policy, the tooling and the pilot. P2 to P5 cover the rest of Beginner, P6 to P12 Intermediate, P13 and P14 Advanced, P15 and P16 the recipe track, and P17 the tier-two pages and the final gate. Each phase holds four to seven rewrite units, two fact audits and two style units, which comes to about 40 orchestrator turns. The cuts fall at band edges, and inside a band after every few sidebar units, so the next phase needs only the consolidated digest.

**Audits and style.** Each phase splits its rewrite units in half. A fresh audit covers each half, and then a fresh style unit does. If a half covers more than about six pages, the orchestrator splits it again. These per-phase style units stand in for one proposal-wide style gate, which would be far past the unit size ([running with subagents](../../meta/procedures/proposals.md#running-with-subagents), step 1). The Claritish run split its gate the same way.

**Standard units.** Most units below are one line. The line names the unit's pages, and the rest comes from these templates:

- **Rewrite unit:** `proposal-worker`, `model: opus`, `effort: high`. Rewrite the named pages per the stage digest, in reading order. **May edit:** the named pages.
- **Audit unit:** `proposal-worker` (fresh), `model: opus`, `effort: high`. Run the [audit brief](#audit-brief) on the pages the named units changed. **May edit:** those pages.
- **Style unit:** `style-editor` (fresh), `model: opus`, `effort: high`. Review the `npm run changed-sections -- <rev>` list for the named pages against [doc-style.md](../../meta/doc-style.md) (including [tone](../../meta/doc-style.md#tone)) and [explaining for a newcomer](../../meta/grammar-docs.md#newcomer). `<rev>` is 5cb1637b. Wording only. **May edit:** the named pages.

<a id="run-state"></a>
**Run state.** The run may continue in a different environment, and neither the scratchpad nor `tmp/` travels with the repo. So the files the run carries from unit to unit are tracked in git, in `docs/proposals/run-state/grammar-newcomer-rewrite/`. For this run, that folder replaces the scratchpad that [running with subagents](../../meta/procedures/proposals.md#running-with-subagents), step 2, names for briefs.

- `stage-digest.txt` and `audit-digest.txt`: the two digests, and their only copy. Each phase's consolidation updates them. `stage-digest.txt` goes into every rewrite brief. `audit-digest.txt` goes into every audit brief: it is the stage digest with its Task, Newcomer and Tone lines replaced by audit lines.
- `build-brief.mjs`: `node docs/proposals/run-state/grammar-newcomer-rewrite/build-brief.mjs <ID> "<page> <page>" "<unit note>"` writes `briefs/<ID>.txt` for a rewrite unit from the stage digest. Audit and style briefs are short and written by hand, after the reports they cite (the P1 ones are in the git log under A1 and S1).
- `briefs/<unit-id>.txt`: each unit's brief, built from the digest and the unit's line, and written before the unit starts. The unit's commit includes it, so a unit cut off mid-run can be started again elsewhere from the same brief. A unit that makes no commit leaves its brief to the phase's consolidation commit. Each phase's consolidation deletes the briefs of its finished units; the git log keeps them.
- Digests and briefs are `.txt`, so the build's Markdown checks skip them. Nothing links into the folder; name its files by path in backticks. F1 deletes the folder along with this proposal.

### Phase P2: Beginner, first words; Claritish review

**C1 Claritish review.** `proposal-worker`, `model: opus`, `effort: high`. Act on the items `claritish-newcomer-rewrite.md` left under *Review (R1)*:

- [could-be.md](../../grammar/claritish/could-be.md): say that an *I think* resting on reasons takes a channel, as the [evidentiality](../../grammar/intermediate/evidentiality.md#evidentiality) section states. Apply the user's answer to open decision 1.
- [feelings.md](../../grammar/claritish/feelings.md): fix the Examples rows for `thuwathumur` and `thobathumaor`, which say *may* (that is `thomam`'s meaning, not the drop-in's).
- [wants-and-plans.md](../../grammar/claritish/wants-and-plans.md): bring the *I'm going to* sentence in line with [intention](../../grammar/beginner/intention.md), which lists intention and forecast. If the journal editor's cue for *going to* then disagrees with that page, report it and do not change the data.
- [oughts-and-motives.md](../../grammar/claritish/oughts-and-motives.md): apply the user's answer to open decision 2.
- Wording, per the [tone](../../meta/doc-style.md#tone) guidelines and [say it once](../../meta/doc-style.md#say-it-once):
  - Replace the figurative wording R1 lists. Leave the thanks-and-sorry table cell alone if the cheat sheet shares it, and report it.
  - In allowed-required-agreed, align practice item 7's note with the prose.
  - Cut the restated sections R1 names (labels *A role or a type*; can-and-cant *Not yet or never*, second paragraph; the thanks-and-sorry forms paragraph; feelings *The situation or the feeling* and *How long or how strong*), keeping anything they say that appears nowhere else.
- Move index.md's agent summaries to match the placement in [agent summaries](../../meta/grammar-docs.md#agent-summaries).
- Log the points the writers left out for want of an owning statement to [TODO.md](../../../TODO.md) as grammar gaps, one line each. These are the want or plan default and PLAN in questions (wants-and-plans); leaving the drop-in off when the English says *for now* or *for good* (decisions-and-tries); an English strength word staying in the sentence (feelings); and leaving the mark off when the words make the tone plain, against the editor's *laughing* cue (tone-marks). Add the points the pilot writers left out: a plain sentence with no `/th/` word states the claim as so (clause.md); whether a name, like a new noun, changes which word an adjective covers (clause.md); what a `bl-` word after an `a` feeling word means, what the last-letter difference between `guremel` and `guremem` means, and whether a feeling word always reports the speaker's own feeling (how-you-feel.md). Add one reader item: `reading.mjs` reads `thewathumum blalazun.` with `blalazun` as a whose-sake party, not the landmark the urge section teaches. If `TODO.md` has uncommitted edits by the user at that point, put the lines in the report instead.
- Delete `claritish-newcomer-rewrite.md`.

**May edit:** the Claritish lessons named, `docs/grammar/claritish/index.md`, `TODO.md`, `docs/proposals/in-progress/claritish-newcomer-rewrite.md` (delete). C1's changed sections join S2b.

**B1** Rewrite unit: [phonology.md](../../grammar/beginner/phonology.md).
**B2** Rewrite unit: [word-endings.md](../../grammar/beginner/word-endings.md), [no-subject.md](../../grammar/beginner/no-subject.md).
**B3** Rewrite unit: [speech-moves.md](../../grammar/beginner/speech-moves.md), [firm-soft.md](../../grammar/beginner/firm-soft.md).
**B4** Rewrite unit: [dependents.md](../../grammar/beginner/dependents.md).
**A2a** Audit unit for B1, B2. **A2b** Audit unit for B3, B4.
**S2a** Style unit for B1, B2. **S2b** Style unit for B3, B4 and C1.

### Phase P3: Beginner, pointing to asking

**B5** [pronouns.md](../../grammar/beginner/pronouns.md).
**B6** [plurality.md](../../grammar/beginner/plurality.md).
**B7** [predication.md](../../grammar/beginner/predication.md), [left-bound-adjectives.md](../../grammar/beginner/left-bound-adjectives.md), [label-seams.md](../../grammar/beginner/label-seams.md).
**B8** [joins.md](../../grammar/beginner/joins.md), [clause-sequence.md](../../grammar/beginner/clause-sequence.md).
**B9** [questions.md](../../grammar/beginner/questions.md), [fill-ask-jobs.md](../../grammar/beginner/fill-ask-jobs.md).
**B10** [spans.md](../../grammar/beginner/spans.md).
Each is a rewrite unit. **A3a** / **S3a** for B5 to B7; **A3b** / **S3b** for B8 to B10.

### Phase P4: Beginner, why to counting

**B11** [causation.md](../../grammar/beginner/causation.md), [fault.md](../../grammar/beginner/fault.md).
**B12** [sakes.md](../../grammar/beginner/sakes.md), [ought-for-a-sake.md](../../grammar/beginner/ought-for-a-sake.md).
**B13** [hooks.md](../../grammar/beginner/hooks.md), [extra-noun-hooks.md](../../grammar/beginner/extra-noun-hooks.md).
**B14** [restrictors.md](../../grammar/beginner/restrictors.md).
**B15** [here-there.md](../../grammar/beginner/here-there.md), [already-still-yet.md](../../grammar/beginner/already-still-yet.md).
**B16** [numbers.md](../../grammar/beginner/numbers.md), [digit-strings.md](../../grammar/beginner/digit-strings.md).
Each is a rewrite unit. **A4a** / **S4a** for B11 to B13; **A4b** / **S4b** for B14 to B16.

### Phase P5: Beginner, comparing to talking together

**B17** [comparatives.md](../../grammar/beginner/comparatives.md).
**B18** [relations.md](../../grammar/beginner/relations.md), [social-ties.md](../../grammar/beginner/social-ties.md).
**B19** [roles.md](../../grammar/beginner/roles.md).
**B20** [compounds.md](../../grammar/beginner/compounds.md).
**B21** [intention.md](../../grammar/beginner/intention.md), [can-and-cant.md](../../grammar/beginner/can-and-cant.md).
**B22** [thanks-and-sorry.md](../../grammar/beginner/thanks-and-sorry.md).
Each is a rewrite unit. **A5a** / **S5a** for B17 to B19; **A5b** / **S5b** for B20 to B22.

### Phase P6: Intermediate, names to conversation craft

**I1** [phonotactics.md](../../grammar/intermediate/phonotactics.md), [letter-names.md](../../grammar/intermediate/letter-names.md).
**I2** [proper-names.md](../../grammar/intermediate/proper-names.md), [place-name-roots.md](../../grammar/intermediate/place-name-roots.md), [conversation-length.md](../../grammar/intermediate/conversation-length.md).
**I3** [longer-chains.md](../../grammar/intermediate/longer-chains.md), [very-and-slightly.md](../../grammar/intermediate/very-and-slightly.md), [label-reach.md](../../grammar/intermediate/label-reach.md).
**I4** [more-turn-words.md](../../grammar/intermediate/more-turn-words.md), [speech-manner.md](../../grammar/intermediate/speech-manner.md).
**I5** [tone-marks.md](../../grammar/intermediate/tone-marks.md).
**I6** [polar-inventory.md](../../grammar/intermediate/polar-inventory.md), [fill-ask-roles.md](../../grammar/intermediate/fill-ask-roles.md).
Each is a rewrite unit. **A6a** / **S6a** for I1 to I3; **A6b** / **S6b** for I4 to I6.

### Phase P7: Intermediate, across sentences to lists

**I7** [sentence-linkers.md](../../grammar/intermediate/sentence-linkers.md), [more-hinges.md](../../grammar/intermediate/more-hinges.md).
**I8** [stand-in-vowels.md](../../grammar/intermediate/stand-in-vowels.md).
**I9** [topic.md](../../grammar/intermediate/topic.md).
**I10** [resume-sense.md](../../grammar/intermediate/resume-sense.md).
**I11** [tag-pronouns.md](../../grammar/intermediate/tag-pronouns.md).
**I12** [collectives.md](../../grammar/intermediate/collectives.md).
Each is a rewrite unit. **A7a** / **S7a** for I7 to I9; **A7b** / **S7b** for I10 to I12.

### Phase P8: Intermediate, lists to stakes

**I13** [list-structure.md](../../grammar/intermediate/list-structure.md).
**I14** [rank-joins.md](../../grammar/intermediate/rank-joins.md), [set-joins.md](../../grammar/intermediate/set-joins.md).
**I15** [universals-domains.md](../../grammar/intermediate/universals-domains.md).
**I16** [verb-and-stance-joins.md](../../grammar/intermediate/verb-and-stance-joins.md).
**I17** [list-verbs.md](../../grammar/intermediate/list-verbs.md), [join-relations.md](../../grammar/intermediate/join-relations.md).
**I18** [because-and-iff.md](../../grammar/intermediate/because-and-iff.md), [cause.md](../../grammar/intermediate/cause.md).
Each is a rewrite unit. **A8a** / **S8a** for I13 to I15; **A8b** / **S8b** for I16 to I18.

### Phase P9: Intermediate, sakes to number forms

**I19** [for-a-sake.md](../../grammar/intermediate/for-a-sake.md).
**I20** [feelings.md](../../grammar/intermediate/feelings.md).
**I21** [permission-consent.md](../../grammar/intermediate/permission-consent.md).
**I22** [try.md](../../grammar/intermediate/try.md).
**I23** [spans-as-words.md](../../grammar/intermediate/spans-as-words.md), [quote-contents.md](../../grammar/intermediate/quote-contents.md), [scope-islands.md](../../grammar/intermediate/scope-islands.md).
**I24** [number-markers.md](../../grammar/intermediate/number-markers.md).
Each is a rewrite unit. **A9a** / **S9a** for I19 to I21; **A9b** / **S9b** for I22 to I24.

### Phase P10: Intermediate, number forms to the scene

**I25** [number-roles.md](../../grammar/intermediate/number-roles.md).
**I26** [digitless-exponents.md](../../grammar/intermediate/digitless-exponents.md).
**I27** [evidentiality.md](../../grammar/intermediate/evidentiality.md). The longest stage page. If the writer stops at its turn cap, a fresh rewrite unit finishes it from the report's **left:** steps.
**I28** [holder.md](../../grammar/intermediate/holder.md).
**I29** [in-clause-hooks.md](../../grammar/intermediate/in-clause-hooks.md), [discourse-hooks.md](../../grammar/intermediate/discourse-hooks.md).
**I30** [more-occasions.md](../../grammar/intermediate/more-occasions.md).
Each is a rewrite unit. **A10a** / **S10a** for I25 to I27; **A10b** / **S10b** for I28 to I30.

### Phase P11: Intermediate, ranges to likeness

**I31** [ranges.md](../../grammar/intermediate/ranges.md).
**I32** [abstract-landmarks.md](../../grammar/intermediate/abstract-landmarks.md), [locative-relations.md](../../grammar/intermediate/locative-relations.md).
**I33** [viewpoint.md](../../grammar/intermediate/viewpoint.md).
**I34** [role-parts.md](../../grammar/intermediate/role-parts.md).
**I35** [compound-families.md](../../grammar/intermediate/compound-families.md).
**I36** [of-relations.md](../../grammar/intermediate/of-relations.md), [exactly-like.md](../../grammar/intermediate/exactly-like.md), [same-role-words.md](../../grammar/intermediate/same-role-words.md).
Each is a rewrite unit. **A11a** / **S11a** for I31 to I33; **A11b** / **S11b** for I34 to I36.

### Phase P12: Intermediate, measuring to surprise

**I37** [measures-and-percent.md](../../grammar/intermediate/measures-and-percent.md).
**I38** [comparative-arity.md](../../grammar/intermediate/comparative-arity.md), [vague-amounts.md](../../grammar/intermediate/vague-amounts.md).
**I39** [bars.md](../../grammar/intermediate/bars.md).
**I40** [residue-and-former.md](../../grammar/intermediate/residue-and-former.md), [contrary-to.md](../../grammar/intermediate/contrary-to.md).
**I41** [mirative.md](../../grammar/intermediate/mirative.md), [notional.md](../../grammar/intermediate/notional.md).
**I42** [dated-channel.md](../../grammar/intermediate/dated-channel.md).
**I43** [want-and-decide.md](../../grammar/intermediate/want-and-decide.md).
Each is a rewrite unit. **A12a** / **S12a** for I37 to I40; **A12b** / **S12b** for I41 to I43.

### Phase P13: Advanced, knowing and numbers

**X1** [as-of.md](../../grammar/advanced/as-of.md).
**X2** [stance-bars.md](../../grammar/advanced/stance-bars.md), [universality.md](../../grammar/advanced/universality.md).
**X3** [usually-vs-must.md](../../grammar/advanced/usually-vs-must.md).
**X4** [stacked-markers.md](../../grammar/advanced/stacked-markers.md), [initials.md](../../grammar/advanced/initials.md), [open-ranges.md](../../grammar/advanced/open-ranges.md).
**X5** [special-values.md](../../grammar/advanced/special-values.md).
**X6** [generations.md](../../grammar/advanced/generations.md).
**X7** [numeric-derivation.md](../../grammar/advanced/numeric-derivation.md).
Each is a rewrite unit. **A13a** / **S13a** for X1 to X4; **A13b** / **S13b** for X5 to X7.

### Phase P14: Advanced, words and deep structure

**X8** [singability.md](../../grammar/advanced/singability.md).
**X9** [hook-compounds.md](../../grammar/advanced/hook-compounds.md).
**X10** [root-tails.md](../../grammar/advanced/root-tails.md).
**X11** [stand-in-roles.md](../../grammar/advanced/stand-in-roles.md), [nested-dependents.md](../../grammar/advanced/nested-dependents.md), [span-nesting.md](../../grammar/advanced/span-nesting.md).
**X12** [join-limits.md](../../grammar/advanced/join-limits.md), [named-phrases.md](../../grammar/advanced/named-phrases.md).
**X13** [hooked-joins.md](../../grammar/advanced/hooked-joins.md).
Each is a rewrite unit. **A14a** / **S14a** for X8 to X10; **A14b** / **S14b** for X11 to X13.

### Phases P15 and P16: the recipe track

Recipe units follow the stage digest with three changes. Read the [recipe track](../../meta/grammar-docs.md#recipe-track) policy and not the stage-page sections. The axis is an English job, so a contrast shows two English sentences that call for different recipes. Examples may use any construction the recipe names, because recipe pages are outside stage order. Each phase ends with the [recall gate](../../meta/procedures/english-helper.md#regression-net), `npm run english-helper-recall -- --check`, and its result goes on the Status line.

P15: **E1** [english.md](../../grammar/english.md). **E2** [say-amounts.md](../../grammar/say-amounts.md). **E3** and **E4** [say-people-places.md](../../grammar/say-people-places.md), split by its H2s into two halves of about equal size. **A15a** / **S15a** for E1, E2; **A15b** / **S15b** for E3, E4.

P16: **E5** [say-questions.md](../../grammar/say-questions.md). **E6** and **E7** [say-reasons.md](../../grammar/say-reasons.md), split by H2s as for E3 and E4. **E8** [say-tense.md](../../grammar/say-tense.md). **A16a** / **S16a** for E5 to E7; **A16b** / **S16b** for E8.

Each E unit is a rewrite unit. On a recipe page the summary lint counts every H3 outside Practice and See also as a teaching heading, and every H2 with no H3 under it, so each of those gets a summary.

### Phase P17: tier-two pages, final gate

**T1 Orientation.** `proposal-worker`, `model: opus`, `effort: high`. Apply the tone guidelines and [orientation-style.md](../../meta/orientation-style.md) to [purpose.md](../../grammar/purpose.md) and [introduction.md](../../grammar/introduction.md). Add agent summaries per U1's placement. Wording only, and no section is added or dropped.
**May edit:** those two pages.

**T2 Terminology.** `proposal-worker`, `model: opus`, `effort: medium`. As T1 for [terminology.md](../../grammar/terminology.md), with doc-style.md in place of orientation-style.md. English names stay as they are.
**May edit:** that page.

**T3 Tool pages.** `proposal-worker`, `model: opus`, `effort: medium`. As T2 for [index.md](../../grammar/index.md), [wizard.md](../../grammar/wizard.md), [inspect.md](../../grammar/inspect.md), [lexicon.md](../../grammar/lexicon.md), [pegs.md](../../grammar/pegs.md) and [pitch-practice.md](../../grammar/pitch-practice.md). Interface steps follow [interface instructions](../../meta/doc-style.md#interface-instructions).
**May edit:** those pages.

**T4 Tool pages, long.** `proposal-worker`, `model: opus`, `effort: medium`. As T3 for [finger-code.md](../../grammar/finger-code.md) and [flashcards.md](../../grammar/flashcards.md).
**May edit:** those pages.

**T5 Cheat sheets and level reviews.** `proposal-worker`, `model: opus`, `effort: medium`. Apply the tone pass to the hand-written prose of every page under [`cheat-sheets/`](../../grammar/cheat-sheets/) and to the leads of the three level reviews. Text between `<!-- generated -->` markers stays as it is. These pages get no agent summaries. List the prose lines with a script that skips generated blocks and tables, and read only those.
**May edit:** those pages.

**S17a** Style unit for T1, T2. **S17b** Style unit for T3 to T5.

**L1 Lint on.** *Orchestrator.* Turn on the agent-summary lint's coverage check for every stage page, recipe page and Claritish lesson (add `"stage"`, `"recipe"` and `"lesson"` to `COVERAGE_REQUIRED` in `src/lint/agent-summaries.ts`), so that a new page cannot ship without summaries. If a page fails, it missed a summary: send it back to the unit that wrote it (or a fresh rewrite unit). Never add a page to an exemption list. In [grammar-docs.md](../../meta/grammar-docs.md), make the stage-checklist line about summaries unconditional, and cut the sentence in *Agent summaries* that says not every page has them.
**May edit:** the lint's page-kind setting, `docs/meta/grammar-docs.md` (those two sentences).

**L2 Summaries for agents.** `proposal-worker`, `model: opus`, `effort: medium`. Until now nothing tells an agent to rely on summaries, since most pages had none (decided 2026-11-24, on the Status line). Now every page has them, so make the tooling hand them out:

- Per open decision 3, either `outline` prints each heading's summary by default on a grammar page (with a flag to leave them out), or `--summaries` stays opt-in.
- Add a way to dump the summaries of several pages in one call (a directory, a band, or a list of pages), so an agent can read the rules of a whole subsystem without its prose.
- Tests for both, and the [agent summaries](../../meta/grammar-docs.md#agent-summaries) section says how to get them.
- Report the line for `AGENTS.md`. The orchestrator adds it to *Large output* in Tooling notes: *On a grammar page, `outline` prints each teaching heading's agent summary (spell the command as L2 built it); read those before the prose, and open the prose only when a summary does not settle the question.* The orchestrator also adds the same step to the *list headings first* rule in each agent file that restates it (`proposal-worker`, `style-editor`, `checkpoint-writer`, `phase-executor`).

**May edit:** `scripts/outline.ts` and its test, any new script and its test, `package.json` (a script entry), `docs/meta/grammar-docs.md` (the *Agent summaries* section), `docs/meta/doc-style.md` (the command table in *What the build checks*). The orchestrator edits `AGENTS.md` and `.claude/agents/`.

**F1 Final gate.** *Orchestrator.* A full `npm run verify` against an empty baseline. Then delete this proposal and `docs/proposals/run-state/grammar-newcomer-rewrite/`, and commit.

### Digests
<a id="audit-brief"></a>

The stage digest and the audit digest are files in the [run-state](#run-state) folder: `stage-digest.txt` and `audit-digest.txt`.

### Gates and commits

- `npm run verify -- --baseline` at the start of each phase. `npm run verify -- --allow-generate` after each unit, before its commit.
- P15 and P16 end with the recall gate.
- Final gate (F1): a full `npm run verify` against an empty baseline.
- One commit per unit that changed something. The message is `grammar-newcomer-rewrite <ID>: … [skip-cd]`, with the co-author line. An audit or style unit that changed nothing makes no commit. Each phase ends with a commit of the consolidated proposal. That comes to about 10 to 12 commits in each phase, and about 170 still to come.
- `AGENTS.md` changes twice. The orchestrator adds the summaries line at L2, not before, and checks at F1 that no **Owns** line has gone stale (none should, since no heading moves).

## Open decisions

1. **could-be.md, the user's hand redo.** A Claritish audit read the redo (294f89ff) as drift and suggested restoring four sentences. The suggestions were *the word it is about* (now *next to the word you are unsure of*), *earns its place* (now *Use the drop-in most on painful guesses*), *most easily turns into facts* (now *most often said with I think and then believed*) and *reports what's in your head* (now *describes an activity*). It also noted that the swap test now settles the answer rather than being *a good test*, and that two clauses were dropped (*so the listener doesn't take it as news*, *the plain sentence says it*). Options: keep the redo as it is; adopt some of the suggestions; restore all of them. **Recommendation:** (medium) keep the redo as it is, because it is the model the whole track was voiced to, and the tone guidelines favour the literal wording it uses. Blocks only C1.
2. **oughts-and-motives.md: `blawan` and `hual`.** The lesson does not teach advice for the listener's own good (`blawan`) or *the usual reason* (`hual`), and its writer suggested adding `blawan`. Adding either one adds a drop-in to the Claritish cheat sheet, the flashcard pack and the editor cues. Options: add `blawan`; add both; leave both out. **Recommendation:** (low) leave both out, because the lesson's gap names no English failure they fix. What would settle it: whether English advice *for your own good* is common enough in journaling to earn a cue. Blocks only C1.
3. **Summaries by default in `outline`.** Once every page has summaries (L2), `outline` on a grammar page could print them by default, or keep them behind `--summaries`. Options: default on, with a flag to leave them out; opt-in flag only. **Recommendation:** (medium) default on, because agents already list headings first, so the summaries reach them with no extra step, and a summary is one line per heading. Opt-in stays defensible if heading lists are often used only to find line ranges. Blocks only L2.

## Background

### Problem

The grammar pages are terse. A reader who already knows the language can follow them. A newcomer, though, meets distinctions that are stated once and never shown, near misses that are denied but not explained, and long lists with no shape to learn them by. The same pages serve agents, which need the rules quickly and cheaply, so the prose has stayed compressed for both readers. The Claritish track tried another approach: explanation written for people, with a terse comment for agents under each heading. The user judged it a success.

### Goals

- Every stage page and recipe page explains its forms well enough that a newcomer can use them after one read. Contrasts are shown, near misses explained, and defaults and omissions stated.
- Every user-facing page reads like technical documentation, per the [tone](../../meta/doc-style.md#tone) guidelines.
- Agents get each teaching section's rules from one comment under its heading, through `outline --summaries`, without reading the explanation. A lint keeps summaries present and well formed.
- The Claritish review is settled and its proposal closed.

### Non-goals

- New forms, readings, rules or defaults. Where explaining needs a point no page states, it is left out and logged.
- New headings, peeled sittings, changed ids or URLs, sidebar or unit changes. Pages grow, but `units.md` cuts units by file size, so any recut stays with that proposal.
- New checkpoints, or rewritten ones. A Practice item changes only when the new prose makes it wrong.
- Generated cheat-sheet tables, data files, interface strings under `src/` (the journal editor, the wizard), and meta notes beyond the policy and tooling above.
- The Claritish lessons, beyond C1.

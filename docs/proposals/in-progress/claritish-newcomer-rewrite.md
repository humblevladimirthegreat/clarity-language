# Claritish newcomer rewrite: explain for people, summarize for agents

**Status:** IN PROGRESS, 2026-11-23. P1 under way. Decided 2026-11-21: grammar prose is written for human comprehension first; agents get a terse `<!-- Agent summary: … -->` comment directly under each teaching heading, invisible to readers; the [tone](../../meta/doc-style.md#tone) guidelines join `doc-style.md`; lessons no longer tell the reader a list need not be memorized, and instead help them learn it. The pilot, [How do you know?](../../grammar/claritish/how-you-know.md), is the model for every lesson. After this proposal's human review, a second proposal applies the same approach to the full grammar. Decided 2026-11-21 (the open decisions, as recommended): no length cap on a rewritten lesson, the newcomer tests set the length and R1 judges it; a lint for agent summaries waits for the grammar-wide proposal; practice may grow to about eight items, added only as contrast pairs.

**Related:** every page under [`docs/grammar/claritish/`](../../grammar/claritish/); [claritish-style.md](../../meta/claritish-style.md), [doc-style.md](../../meta/doc-style.md) (tone section), the [Claritish track](../../meta/grammar-docs.md#claritish-track) policy; the journal editor's cue data [`data/claritish-triggers.csv`](../../../data/claritish-triggers.csv), which reads each lesson's gap; [`scripts/lint-cheat-sheets.ts`](../../../scripts/lint-cheat-sheets.ts), which ties each lesson table to the cheat sheet.

**Depends on:** none.

**Design authority:** *none*. The rewrite adds, drops, and respells no drop-in, and states no meaning the owning grammar section does not already state.

## Implementation plan

At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

The run uses subagents. Each lesson reads its own owning grammar sections, which the other lessons share little of, and the fact audits need a fresh context that wrote none of the prose.

Two phases. **P1** writes the policy, rewrites the first six lessons in sidebar order, and audits them. **P2** rewrites the remaining five lessons and the track's other prose pages, audits them, runs the style gate, and ends by asking the user for review. The cut after P1 falls where the audit's findings can still change the brief for P2.

### Phase P1

**U1 Policy.** *Orchestrator.* Write the rules the lesson units follow, so that each brief points to a written policy and the pilot conforms to it.

- In [claritish-style.md](../../meta/claritish-style.md), add a section **Explaining for a newcomer** (anchor `newcomer`) that holds the newcomer tests from the digest below. Also add a section **Agent summaries** (anchor `agent-summaries`) that sets the format: one HTML comment directly under each teaching H2, starting `Agent summary:`, terse, every form in backticks, stating no rule the section does not teach. Gap, Examples, and Practice get none.
- In the same file's forms section, allow explanatory sections after `## The forms` and before `## Practice`. Examples are a contrast section with an H3 per pair, a strength section, and a section on how the drop-in carries across sentences. Add a checklist row for each new section.
- In the [Claritish track](../../meta/grammar-docs.md#claritish-track) lesson shape, name those explanatory sections and the agent summary comment.
- Check [how-you-know.md](../../grammar/claritish/how-you-know.md) against the new sections and fix anything it misses.
- Write the brief digest file from the digest below.

**May edit:** `docs/meta/claritish-style.md`, `docs/meta/grammar-docs.md`, `docs/grammar/claritish/how-you-know.md`.

**U2 How sure are you?** `proposal-worker`, `model: opus`, `effort: high`. Rewrite [could-be.md](../../grammar/claritish/could-be.md) per the digest. This lesson introduces the `-l` / `-m` / `-r` scale that later lessons point back to. The scale's first teaching should therefore be the clearest one in the track, with a contrast example for each ending.
**May edit:** `docs/grammar/claritish/could-be.md`.

**U3 Labels.** `proposal-worker`, `model: opus`, `effort: high`. Rewrite [labels.md](../../grammar/claritish/labels.md) per the digest. The hyphenated host is the hard part for a newcomer: show the same English label with each reach vowel, and say when to leave the suffix off.
**May edit:** `docs/grammar/claritish/labels.md`.

**U4 Can and can't.** `proposal-worker`, `model: opus`, `effort: high`. Rewrite [can-and-cant.md](../../grammar/claritish/can-and-cant.md) per the digest.
**May edit:** `docs/grammar/claritish/can-and-cant.md`.

**U5 Thanks and sorry.** `proposal-worker`, `model: opus`, `effort: high`. Rewrite [thanks-and-sorry.md](../../grammar/claritish/thanks-and-sorry.md) per the digest. Replace *Nine sakes is a menu; you don't need to memorize it.* with a way to learn the nine, such as a grouping drawn from the owning section.
**May edit:** `docs/grammar/claritish/thanks-and-sorry.md`.

**U6 Allowed and required.** `proposal-worker`, `model: opus`, `effort: high`. Rewrite [allowed-required-agreed.md](../../grammar/claritish/allowed-required-agreed.md) per the digest. Its endings grade the source, not the settled-to-passing scale, so say that in plain words before the endings table.
**May edit:** `docs/grammar/claritish/allowed-required-agreed.md`.

**U7 Oughts and motives.** `proposal-worker`, `model: opus`, `effort: high`. Rewrite [oughts-and-motives.md](../../grammar/claritish/oughts-and-motives.md) per the digest. Its two ending sets (prescription and motive) need a contrast that shows them apart on one example.
**May edit:** `docs/grammar/claritish/oughts-and-motives.md`.

**A1 Fact audit, P1 lessons.** `proposal-worker` (fresh), `model: opus`, `effort: high`. For each lesson U2 to U7 changed, plus the pilot:

- Check every sentence of new or changed prose that states what a drop-in means or when to use it against the owning sections named in the page's `<!-- Source (editors): … -->` comment. List each claim those sections do not support, with the line.
- Check that each agent summary states only what its section teaches, and that each teaching H2 has one.
- Fix wording that overstates what the owning section says. A claim that would need a new meaning goes into the report and is not fixed.
- Report any pattern of invention the P2 brief should warn against.

Read slices only: headings first, then the cited sections.
**May edit:** the seven lessons named.

End of P1: consolidate this proposal. If A1 found a pattern, add a line to the digest for P2, then commit.

### Phase P2

**U8 Wants and plans.** `proposal-worker`, `model: opus`, `effort: high`. Rewrite [wants-and-plans.md](../../grammar/claritish/wants-and-plans.md) per the digest. English *I'm going to* can be either a want or a plan; if the owning sections draw that line, give it a contrast example.
**May edit:** `docs/grammar/claritish/wants-and-plans.md`.

**U9 Decisions and tries.** `proposal-worker`, `model: opus`, `effort: high`. Rewrite [decisions-and-tries.md](../../grammar/claritish/decisions-and-tries.md) per the digest.
**May edit:** `docs/grammar/claritish/decisions-and-tries.md`.

**U10 What a feeling wants.** `proposal-worker`, `model: opus`, `effort: high`. Rewrite [what-a-feeling-wants.md](../../grammar/claritish/what-a-feeling-wants.md) per the digest. Replace *The four urges are a menu; you don't need to memorize it.* with something that helps the reader learn the four.
**May edit:** `docs/grammar/claritish/what-a-feeling-wants.md`.

**U11 Feelings in full.** `proposal-worker`, `model: opus`, `effort: high`. Rewrite [feelings.md](../../grammar/claritish/feelings.md) per the digest. Its *First, …* run and its *This is a menu; you don't need to memorize it* both go. This is the longest lesson, so split it into explanatory sections rather than lengthening its paragraphs.
**May edit:** `docs/grammar/claritish/feelings.md`.

**U12 Bonus: Tone marks.** `proposal-worker`, `model: opus`, `effort: high`. Rewrite [tone-marks.md](../../grammar/claritish/tone-marks.md) per the digest. Tone marks are written bare, not in backticks ([hyphenated host](../../meta/claritish-style.md#hyphenated-host)); keep that.
**May edit:** `docs/grammar/claritish/tone-marks.md`.

**U13 Track pages.** `proposal-worker`, `model: opus`, `effort: medium`. Apply the [tone](../../meta/doc-style.md#tone) guidelines to the prose of [index.md](../../grammar/claritish/index.md), [learn.md](../../grammar/claritish/learn.md), [editor.md](../../grammar/claritish/editor.md), and [flashcards.md](../../grammar/claritish/flashcards.md). Keep these constraints:

- Wording only. No new sections, and the lesson list on the intro page stays as it is.
- `index.md` gets agent summaries on the sections that state track-wide rules; the other three get none.
- The cheat sheet is out of scope: it is tables, and its lead lines are already terse by design.

**May edit:** those four files.

**A2 Fact audit, P2 lessons.** `proposal-worker` (fresh), `model: opus`, `effort: high`. As A1, for U8 to U12.
**May edit:** the five lessons named.

**S1 Style gate.** `style-editor` (fresh), `model: opus`, `effort: high`. Review the `npm run changed-sections -- <rev>` list, where `<rev>` is the commit before U0, against [doc-style.md](../../meta/doc-style.md) (including [tone](../../meta/doc-style.md#tone)) and [claritish-style.md](../../meta/claritish-style.md).
**May edit:** the changed lessons and track pages.

**R1 Human review.** *Orchestrator.* Consolidate this proposal and commit. Then ask the user to review the rewritten track, and stop. Name these for the user:

- the pages changed, with word counts before and after
- the claims A1 and A2 could not support and left in their reports
- any open decisions the run logged
- three pages worth reading first: could-be, labels, and feelings, which carry the most new explanation

Addressing the review's concerns, and the follow-up proposal that applies this approach to the full grammar, come after R1. They are not part of this plan.

### Rule digest (pasted into every lesson brief)

```
- Task: rewrite one Claritish lesson so a newcomer understands it on first read. Read
  docs/grammar/claritish/how-you-know.md first: it is the model. Then read your lesson, then the
  owning grammar sections named in its <!-- Source (editors): --> comment (headings first, then slices).
- Rules: docs/meta/claritish-style.md (all of it) and docs/meta/doc-style.md#tone. Do not link to them
  from the lesson.
- Adds no forms. Do not add, drop, or respell a drop-in in any lesson table (the cheat-sheet lint
  ties them). Every statement about what a drop-in means or when to use it must be stated in the
  owning sections. If a point you need is not there, leave it out and report it.
- Keep: H1; ## The gap; ## The forms first after it; ## Examples; ## Practice last; the Source comment.
  Explanatory H2s go between The forms and Practice; parallel comparisons get one H3 each.
- Gap: keep every italic phrase exactly (journal editor cues read them). Reword around them only;
  each gap sentence must read alone. If an italic phrase must change, stop and report.
- Agent summary: directly under each teaching H2 (not gap, examples, practice), one comment
  <!-- Agent summary: ... --> stating the section's rules tersely, forms in backticks, nothing more.
- Newcomer tests: each distinction gets a contrast example (the same sentence both ways); each form
  in a table appears in an example or a sentence explaining it; a near miss is explained with an
  example, not just denied; say when to leave the drop-in out and which form to use when unsure; a
  long list gets a grouping or pattern to learn it by (never "you don't need to memorize it"); a
  point back to an earlier lesson names its title in italics and says the idea in plain words.
- Tone: would a good teacher say it aloud? Link ideas with because / so / for example. At most one
  semicolon-balanced pair and one "X, not Y" per section. People and things act, not features.
  Vary sentence length. No ≈ or → in prose. One grammatical shape per table column. No numbered
  "First, … Second, …" runs.
- Practice: keep the format; notes say what the speaker means, never which form. You may add
  contrast pairs (same English, different note). Answers in ::: details Show answer.
- No links into the grammar or between lessons; no full Ageben sentences; no glosses; no house cast.
- Paragraphs: five sentences or fewer; split where the idea divides, not by clipping sentences.
- Check forms with node scripts/parse.mjs --check-lexicon '<a>' '<b>' … (one batched call).
- Verify with npm run verify -- --allow-generate (--fast inside the item); never paste raw build output.
  When verify reports a prose warning on your page, clear it; do not update the baseline.
- Do not commit; the orchestrator commits. Never link to a file under docs/proposals/.
- At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls.
  If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a
  clean point, leave the tree green, and report: done, left (as steps), files touched.
- Report (about 150 words): done; word count before → after; claims left out for want of an owning
  statement; gap italics changed (should be none); verify line; skips with reasons; left; inefficient.
```

The audit briefs (A1, A2) carry the same digest with the task lines replaced by their unit text.

### Gates and commits

- `npm run verify -- --baseline` at the start of each phase. `npm run verify -- --allow-generate` after each unit, before its commit.
- Final gate, in P2 before R1: a full `npm run verify` that passes against an empty baseline.
- One commit per unit, with the message `claritish-newcomer-rewrite <ID>: … [skip-cd]` and the co-author line. A unit whose audit changed nothing makes no commit. P1 ends with the consolidated proposal: about 10 commits. P2 makes about 9, the last being R1's consolidation.
- No `AGENTS.md` change is expected. The Claritish row already points to the track, and the agent-summary convention reaches `AGENTS.md` with the grammar-wide proposal.

## Open decisions

None open. The decisions of 2026-11-21 are on the Status line.

## Background

### Problem

The grammar pages, and the Claritish lessons most of all, are terse. A reader who knows the language follows them, but a newcomer meets distinctions stated once and never shown, house names with no plain gloss, and prose made of slogans and stock sentences. Two kinds of reader use the same pages: agents need rules quickly and cheaply, and people need explanation. The pages have tried to serve both with one compressed text.

### Goals

- Every Claritish lesson explains its drop-ins well enough that a newcomer can use them after one read: contrasts shown, near misses explained, defaults and omissions stated.
- The prose reads like a teacher talking, per the [tone](../../meta/doc-style.md#tone) guidelines.
- Agents get each teaching section's rules from one comment under its heading, without reading the explanation.
- The approach is proven on one track, and reviewed, before the full grammar adopts it.

### Non-goals

- New forms, meanings, or lessons. Lesson order and the sidebar stay as they are.
- The grammar stage pages, the recipe track, and the grammar cheat sheets: those come in the follow-up proposal.
- Tooling for agent summaries (a lint, or `outline` printing summaries): deferred to the follow-up proposal.
- The Claritish cheat sheet, the flashcard pack, and the journal editor's data, beyond keeping them in step.

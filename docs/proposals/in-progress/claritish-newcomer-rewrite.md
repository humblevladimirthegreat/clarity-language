# Claritish newcomer rewrite: explain for people, summarize for agents

**Status:** IN PROGRESS. P1 done 2026-11-23 (U1 to U7, A1 as two audits A1a and A1b; commits dc85ee42 to b7f14f57): the policy is in [claritish-style.md](../../meta/claritish-style.md#newcomer) and the [lesson shape](../../meta/grammar-docs.md#claritish-track), and six lessons are rewritten and audited. P2 done 2026-11-23 (V1 to V5, A3; commits 4d32a46e to dda3e727): the six P1 lessons are in the technical voice of could-be.md, and A3 restored the claims the pass had shifted. Next: P3. Decided 2026-11-23 (consent on things a person owns): a participant's say word names only the holder of that role ([D-78](../../meta/design-decisions.md)), so [Allowed and required](../../grammar/claritish/allowed-required-agreed.md) now uses examples where the one who agrees is the one the act is done to, says an owner's yes in English (*Their things or their time*), and the journal editor's consent flow offers a *their things or time* choice with no drop-in; done outside the run. Decided 2026-11-23: the voice is technical documentation, not a teacher talking. The [tone](../../meta/doc-style.md#tone) guidelines now ask for literal words, literal verbs on forms, effects stated directly, and no conversational filler, and a [consequence](../../meta/doc-style.md#consequence) says when to use a form, never how good it is. [How sure are you?](../../grammar/claritish/could-be.md) was redone in that voice outside the run and replaces the pilot as the model. Decided 2026-11-21: grammar prose is written for human comprehension first; agents get a terse `<!-- Agent summary: … -->` comment directly under each teaching heading, invisible to readers; the [tone](../../meta/doc-style.md#tone) guidelines join `doc-style.md`; lessons no longer tell the reader a list need not be memorized, and instead help them learn it. The pilot, [How do you know?](../../grammar/claritish/how-you-know.md), was the model for every lesson until 2026-11-23. After this proposal's human review, a second proposal applies the same approach to the full grammar. Decided 2026-11-21 (the open decisions, as recommended): no length cap on a rewritten lesson, the newcomer tests set the length and R1 judges it; a lint for agent summaries waits for the grammar-wide proposal; practice may grow to about eight items, added only as contrast pairs.

**Related:** every page under [`docs/grammar/claritish/`](../../grammar/claritish/); [claritish-style.md](../../meta/claritish-style.md), [doc-style.md](../../meta/doc-style.md) (tone section), the [Claritish track](../../meta/grammar-docs.md#claritish-track) policy; the journal editor's cue data [`data/claritish-triggers.csv`](../../../data/claritish-triggers.csv), which reads each lesson's gap; [`scripts/lint-cheat-sheets.ts`](../../../scripts/lint-cheat-sheets.ts), which ties each lesson table to the cheat sheet.

**Depends on:** none.

**Design authority:** *none*. The rewrite adds, drops, and respells no drop-in, and states no meaning the owning grammar section does not already state.

## Implementation plan

At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

The run uses subagents. Each lesson reads its own owning grammar sections, which the other lessons share little of, and the fact audits need a fresh context that wrote none of the prose.

One phase is left. **P3** rewrites the remaining five lessons and the track's other prose pages, audits them, runs the style gate, and ends by asking the user for review. could-be.md is the model for voice and shape; the six P1 lessons are now in the same voice.

**Built in P1.** [claritish-style.md](../../meta/claritish-style.md) now holds [Explaining for a newcomer](../../meta/claritish-style.md#newcomer) (the newcomer tests, no length cap, practice up to about eight items as contrast pairs), [Agent summaries](../../meta/claritish-style.md#agent-summaries), and an *Explanatory sections* bullet under [forms](../../meta/claritish-style.md#forms); back-references now say the reused idea in plain words. *How sure are you?* (could-be.md) owns the track's first teaching of the `-l` / `-m` / `-r` scale, in `## What the ending says`: think of `-l` as *lasting* and `-r` as *right now*. A later lesson that points back to it names the title and says the idea in those words. Thanks-and-sorry.md no longer has a `## The sakes` H2; the sake table is under `## The forms`. Rewrites grew three to five times (table below), and A1 found that the longer lessons restate themselves in places. The audit of 1,000-plus-word lessons should report restated sections, as A1 did.

**Split audits.** A1 ran as two audits of three or four lessons each, because one audit of seven lessons and their sources passes the six-page unit size. A2 splits the same way: A2a for U8 to U10, A2b for U11 and U12.

### Phase P3

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

**A2 Fact audit, P3 lessons.** `proposal-worker` (fresh), `model: opus`, `effort: high`, as two units (A2a: U8 to U10; A2b: U11, U12). For each lesson the phase changed: check every sentence of new or changed prose that states what a drop-in means or when to use it against the owning sections named in its Source comment, and list each claim they do not support, with the line. Check that each agent summary states only what its section teaches, and that each teaching H2 has one. Fix wording that overstates the owning section; a claim that would need a new meaning goes into the report, unfixed. Report word counts and sections that restate another. Read slices only: headings first, then the cited sections.
**May edit:** the five lessons named.

**S1 Style gate.** `style-editor` (fresh), `model: opus`, `effort: high`. Review the `npm run changed-sections -- <rev>` list, where `<rev>` is `271a14ae`, the commit before U1, against [doc-style.md](../../meta/doc-style.md) (including [tone](../../meta/doc-style.md#tone)) and [claritish-style.md](../../meta/claritish-style.md).
**May edit:** the changed lessons and track pages.

**R1 Human review.** *Orchestrator.* Consolidate this proposal and commit. Then ask the user to review the rewritten track, and stop. Name these for the user:

- the pages changed, with word counts before and after
- the claims A1 (below) and A2 could not support and left in place, and any drift A3 left
- any open decisions the run logged
- three pages worth reading first: could-be, labels, and feelings, which carry the most new explanation

**P1 and P2 input for R1.** Word counts (`wc -w` on the file), before (commit `271a14ae`), after P1, and after P2. The P2 column includes the generated read-by comment added between the phases, about 90 to 110 words per page:

| Lesson | Before | After P1 | After P2 |
|--------|--------|----------|----------|
| how-you-know (pilot) | 1823 | 1823 | 1929 |
| could-be | 413 | 1400 | 1475 |
| labels | 308 | 1444 | 1566 |
| can-and-cant | 346 | 1138 | 1255 |
| thanks-and-sorry | 568 | 2094 | 2242 |
| allowed-required-agreed | 392 | 1860 | 2132 |
| oughts-and-motives | 818 | 2081 | 2202 |

Points from P2 for the user to judge at R1:

- **could-be.md, user's hand redo.** A3 read the diff of the redo (294f89ff) as drift and restored four sentences. The orchestrator undid that, because the redo is the user's own model. A3's points: *next to the word you are unsure of* (was *the word it colors*; A3 suggests *the word it is about*); *Use the drop-in most on painful guesses* (was *earns its place*, a usage aid, now an instruction); *most often said with I think and then believed* (was *most easily turns into facts*, now a claim about frequency); *describes an activity* (was *reports what's in your head*); the swap test now settles the answer (was *a good test*); and the dropped *so the listener doesn't take it as news* and *the plain sentence says it*.
- **Kept figurative wording.** *that got me through right now* in the thanks-and-sorry table: the same cell is on the cheat sheet, so both change together or neither. *builds over time* and *why the move is welcome* in oughts-and-motives. A3 judged *hides* → *introduces* / *can mean* in the could-be and can-and-cant gaps a small loss.
- **Practice notes no longer match the prose word for word.** allowed-required-agreed item 7 says *(frowned on)*; the prose now says *disapprove of*.

Claims A1 found no owning statement for and left in place, each a usage aid that adds no meaning:

- how-you-know: when to use a channel (P2 wording: *Use it when the source matters*; news about a person, a reason for blame, a fact someone acts on); *obviously* usually means clues; the reason given for *lasting* (evidence you can show still holds up tomorrow).
- could-be: the swap test. Not a claim, but a gap: an *I think* that rests on reasons takes a channel ([evidentiality](../../grammar/intermediate/evidentiality.md#evidentiality)), and the lesson does not say so.
- labels: when unsure of the reach, go by what you have seen (one episode gives `-thu`).
- allowed-required-agreed: leave the drop-in out when the English already names the source (the style policy's leave-out point).
- oughts-and-motives: advice for the listener's own good with `blawan`, and `hual` for *the usual reason*, are not taught; the writer suggested adding `blawan` (medium).

Restated sections A1 reported, for R1 to judge: labels H3 *A role or a type*; can-and-cant *Not yet or never*, second paragraph; thanks-and-sorry, the forms paragraph *the word is about you*.

Addressing the review's concerns, and the follow-up proposal that applies this approach to the full grammar, come after R1. They are not part of this plan.

### Rule digest (pasted into every lesson brief)

```
- Task: rewrite one Claritish lesson so a newcomer understands it on first read. Read
  docs/grammar/claritish/could-be.md first: it is the model for voice and shape. Then read your lesson, then the
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
- Tone: technical documentation, literal words. No idioms or figurative verbs (colors, earns its
  place, chases, does the work, where it belongs). A form may be the subject of means / marks / says /
  applies to, never of a human verb (pretends, hears, wants). Say what a form means, not how a
  listener reacts. A payoff says when to use the form, not how good it is. Cut just, actually,
  simply, it pays to, it's worth. Link ideas with because / so / for example. At most one
  semicolon-balanced pair and one "X, not Y" per section. Vary sentence length. No ≈ or → in prose.
  The English in table cells and agent summaries takes the same voice (P2 found "the office they
  inhabit", "a dip", "doubles down" there).
  One grammatical shape per table column. No numbered "First, … Second, …" runs.
- Do not invent (A1 found each of these): a "use it when" trigger beyond the owning rule; a "when
  unsure" default on a scale whose owning section gives none (say which forms are ruled out instead);
  a reason for the lasting / right-now picture; an English cue word (*obviously*) tied to a drop-in;
  an effect on the listener (*easier to turn down*); a definition pushed into a consequence it does
  not state ("nobody said" is not "no rule exists"). A back-reference restates the earlier idea in
  its own lesson's words; check them. An agent summary borrows nothing from a neighbouring section.
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
- Final gate, in P3 before R1: a full `npm run verify` that passes against an empty baseline.
- One commit per unit, with the message `claritish-newcomer-rewrite <ID>: … [skip-cd]` and the co-author line. A unit whose audit changed nothing makes no commit. P1 made 10 commits, P2 made 7 (the start commit was the user's). P3 makes about 10 (A2 is two units), the last being R1's consolidation.
- No `AGENTS.md` change is expected. The Claritish row already points to the track, and the agent-summary convention reaches `AGENTS.md` with the grammar-wide proposal.

## Open decisions

None.

## Background

### Problem

The grammar pages, and the Claritish lessons most of all, are terse. A reader who knows the language follows them, but a newcomer meets distinctions stated once and never shown, house names with no plain gloss, and prose made of slogans and stock sentences. Two kinds of reader use the same pages: agents need rules quickly and cheaply, and people need explanation. The pages have tried to serve both with one compressed text.

### Goals

- Every Claritish lesson explains its drop-ins well enough that a newcomer can use them after one read: contrasts shown, near misses explained, defaults and omissions stated.
- The prose reads like technical documentation, per the [tone](../../meta/doc-style.md#tone) guidelines.
- Agents get each teaching section's rules from one comment under its heading, without reading the explanation.
- The approach is proven on one track, and reviewed, before the full grammar adopts it.

### Non-goals

- New forms, meanings, or lessons. Lesson order and the sidebar stay as they are.
- The grammar stage pages, the recipe track, and the grammar cheat sheets: those come in the follow-up proposal.
- Tooling for agent summaries (a lint, or `outline` printing summaries): deferred to the follow-up proposal.
- The Claritish cheat sheet, the flashcard pack, and the journal editor's data, beyond keeping them in step.

# Claritish newcomer rewrite: explain for people, summarize for agents

**Status:** IN PROGRESS. Every phase is done; waiting on the user's review (R1). P1 done 2026-11-23 (U1 to U7, A1a, A1b; commits dc85ee42 to b7f14f57): the policy is in [claritish-style.md](../../meta/claritish-style.md#newcomer) and the [lesson shape](../../meta/grammar-docs.md#claritish-track), and six lessons were rewritten and audited. P2 done 2026-11-23 (V1 to V5, A3; commits 4d32a46e to dda3e727): the six P1 lessons were put in the technical voice of could-be.md. P3 done 2026-11-23 (U8 to U13, A2a, A2b, S1a to S1c; commits b203d647 to 62c35b36): the last five lessons were rewritten and audited, the track pages got a tone pass, and the style gate covered every changed page except could-be.md, the user's own model. S1 ran as three units (P3 lessons, P1 lessons, track pages) because one unit of fifteen pages passes the unit size. The final gate, a full `npm run verify` against an empty baseline, passed. Decided 2026-11-23 (user, tone marks): Claritish tone marks follow Ageben's reach, so a mark attached to a word applies to that word only, also on a sentence's first word, and a mark with a space after it applies to the rest of the sentence (`% You're the worst.`); the rule is in the [Claritish track](../../meta/grammar-docs.md#claritish-track) policy, and the lesson, cheat sheet, and journal editor follow it. Decided 2026-11-23 (consent on things a person owns): a participant's say word names only the holder of that role ([D-78](../../meta/design-decisions.md)), done outside the run. Decided 2026-11-23: the voice is technical documentation, per the [tone](../../meta/doc-style.md#tone) guidelines and [consequence](../../meta/doc-style.md#consequence); [How sure are you?](../../grammar/claritish/could-be.md) is the model. Decided 2026-11-21: prose is written for human comprehension first, with a terse `<!-- Agent summary: … -->` comment under each teaching heading; lessons help the reader learn a list instead of saying it need not be memorized; no length cap; practice up to about eight items, added as contrast pairs; a lint for agent summaries waits for the grammar-wide proposal.

**Next:** the user reviews the rewritten track (below). Addressing the review, and the follow-up proposal that applies this approach to the full grammar, are not part of this plan. Once the review is addressed, delete this proposal.

**Related:** every page under [`docs/grammar/claritish/`](../../grammar/claritish/); [claritish-style.md](../../meta/claritish-style.md), [doc-style.md](../../meta/doc-style.md) (tone section), the [Claritish track](../../meta/grammar-docs.md#claritish-track) policy.

**Design authority:** *none*. The rewrite adds, drops, and respells no drop-in, and states no meaning the owning grammar section does not already state.

## Review (R1)

Read first: [How sure are you?](../../grammar/claritish/could-be.md), [Labels](../../grammar/claritish/labels.md), and [Feelings in full](../../grammar/claritish/feelings.md), which carry the most new explanation.

### Word counts

`wc -w` on the file, before (commit `271a14ae`) and now. *Now* includes the generated read-by comment added during the run, about 90 to 110 words per lesson.

| Page | Before | Now |
|------|--------|-----|
| how-you-know (pilot) | 1823 | 1929 |
| could-be | 413 | 1475 |
| labels | 308 | 1559 |
| can-and-cant | 346 | 1240 |
| thanks-and-sorry | 568 | 2242 |
| allowed-required-agreed | 392 | 2133 |
| oughts-and-motives | 818 | 2202 |
| wants-and-plans | 523 | 1730 |
| decisions-and-tries | 316 | 1769 |
| what-a-feeling-wants | 733 | 1802 |
| feelings | 881 | 2704 |
| tone-marks | 353 | 1359 |
| index | 484 | 635 |
| learn | 305 | 331 |
| editor | 359 | 401 |
| flashcards | 401 | 421 |

### Claims the audits left in place

Each is a usage aid that adds no meaning, unless noted.

- how-you-know: when to use a channel (*Use it when the source matters*; news about a person, a reason for blame, a fact someone acts on); *obviously* usually means clues; the reason given for *lasting* (evidence you can show still holds up tomorrow).
- could-be: the swap test. Also a gap: an *I think* that rests on reasons takes a channel ([evidentiality](../../grammar/intermediate/evidentiality.md#evidentiality)), and the lesson does not say so.
- labels: when unsure of the reach, go by what you have seen (one episode gives `-thu`).
- allowed-required-agreed: leave the drop-in out when the English already names the source.
- oughts-and-motives: advice for the listener's own good with `blawan`, and `hual` for *the usual reason*, are not taught; the P1 writer suggested adding `blawan` (medium).
- wants-and-plans: *English I'm going to can introduce a wish or something you mean to do.* A claim about English; the journal editor offers both a want and a plan on that cue, but [intention](../../grammar/beginner/intention.md) lists only intention and forecast for *going to*. The auditor's confidence that it needs a change: low.
- feelings, pre-existing: the Examples rows for `thuwathumur` and `thobathumaor` say *may*, which is `thomam`'s meaning, not the drop-in's.

Points the writers left out for want of an owning statement, which the lessons could teach if a grammar page states them: in wants-and-plans, a want or plan default, and PLAN in questions; in decisions-and-tries, leaving the drop-in off when the English says how settled (*for now*, *for good*); in feelings, an English strength word (*a little*) staying in the sentence; in tone-marks, leaving the mark off when the words make the tone plain (the editor's *laughing* cue already contradicts that line).

### Wording and restatement to judge

- **could-be.md, the user's hand redo.** A3 read the redo (294f89ff) as drift and restored four sentences; the orchestrator undid that, and S1 left the page alone. A3's points: *next to the word you are unsure of* (was *the word it colors*; A3 suggests *the word it is about*); *Use the drop-in most on painful guesses* (was *earns its place*); *most often said with I think and then believed* (was *most easily turns into facts*); *describes an activity* (was *reports what's in your head*); the swap test now settles the answer (was *a good test*); and the dropped *so the listener doesn't take it as news* and *the plain sentence says it*.
- **Kept figurative wording.** *that got me through right now* in the thanks-and-sorry table, a cell shared with the cheat sheet; *builds over time* and *why the move is welcome* in oughts-and-motives. A3 judged *hides* → *introduces* / *can mean* in the could-be and can-and-cant gaps a small loss.
- **Practice notes and prose differ in wording.** allowed-required-agreed item 7 says *(frowned on)*; the prose says *disapprove of*.
- **Restated sections.** labels H3 *A role or a type*; can-and-cant *Not yet or never*, second paragraph; thanks-and-sorry, the forms paragraph *the word is about you*; feelings *The situation or the feeling* (repeats the middle-ending point from The forms) and *How long or how strong* (repeats the duration section), both minor.
- **Agent summary placement.** index.md has one under the H1, because the track-wide rules sit above any H2, and one under *The lessons*. The convention elsewhere is under teaching H2s only.
- **New composed forms in examples.** wants-and-plans and decisions-and-tries show two drop-ins together (`thalol` `thagom`, `thagom` `thogel`), each in the order the owning section gives. what-a-feeling-wants and feelings use composed feeling words not on the cheat sheet (`thawethamem`, `thewathumum`, `thunathumum`, `thuwatham` and others); each parses with the reading the prose gives.

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

# Tags for someone, pseudonyms, and logic

**Status:** Implemented; consolidated on 2026-11-10 with only the audit's open decisions left. Done and committed: W1 (retire the old *someone* word), W2 (`zwan` is a pseudonym), W3 (scope by order), W4 (bound tags), W5 (first-use `zwanx` and pair **-n**), W6 (Practice), W7 (audit). User decisions, 2026-11-10: a pair on **-n** with one tag free and one held by `zwan` is rejected (D-74); a pseudonym assigned inside a bound reach expires with it. Settled readings live on their grammar pages: [tag pronouns](../grammar/intermediate/tag-pronouns.md), [scope by order](../grammar/beginner/joins.md#everything-ua), [bound tags](../grammar/intermediate/universals-domains.md#bound-tags), D-69 to D-74 in [design-decisions.md](../meta/design-decisions.md). Delete this file once the decisions below are settled.

**Related:** [joins.md](../grammar/beginner/joins.md#everything-ua), [tag-pronouns.md](../grammar/intermediate/tag-pronouns.md), [universals-domains.md](../grammar/intermediate/universals-domains.md#bound-tags), [people-pointing.md](../grammar/cheat-sheets/people-pointing.md), [consonants.md](../grammar/cheat-sheets/consonants.md), [`src/parse/resolve.ts`](../../src/parse/resolve.ts), [`src/parse/constructions.ts`](../../src/parse/constructions.ts).

**Depends on:** none.

**Design authority:** none until a decision below is made; each decision names the reading it would change.

## Problem

The W7 audit found three places where the landed pages and the parser, or two pages, disagree, and each fix changes a stated reading. It also noted three things the parser accepts that no page teaches.

## Goals

- Each open decision is settled, its page and parser text made to agree, and this file deleted.

## Non-goals

- No other new forms or readings.

## Implementation plan

Each decision is a few lines on one or two pages plus, for decision 1, a parser change with a test. It fits in one session without subagents. Gate: `npm run verify` green against a fresh baseline. If the user says to stop partway, the agent [consolidates this proposal](../meta/procedures/proposals.md#consolidate-on-stop) before the session ends.

## Open decisions

1. **A share word after a pair recall.** In `zodozel zwal zogozel zwol zam vowurol. zwaor veruvol. zazozon dwaom vayebel.` the parser ties `dwaom` to the walk, not the run, and the same holds for `zwam` after a pair recall. The tag page says a share is *the latest earlier event both took part in*, which is the run. A test in `src/parse/resolve.test.ts` asserts the walk. Options: (a) a pair recall counts as each member's part in its event, so the share finds the run, and the test changes; (b) keep the parser and reword the page. **Recommendation:** (a). The page's rule is the one a listener would apply, and W5 already made a share find an introducing pair's event.
2. **Whether `zwal` is glossed *someone*.** W2 glosses `zwal` as *suppose A: a placeholder, no one in particular*. D-69, the `retiredSomeone` message, and the `unassigned-reserved.md` row call `zwal` the *someone* you will return to, and Practice item 2 on the tag page translates it *Someone (A)*. `node scripts/find-english.mjs 'someone'` finds `zeyel zar` but not `zwal`. The tree in `consonants.md` still reads `-l assign / someone A`. Options: (a) add *someone, call them A* to the English cell of the `zwal` row on the tag page and the people-pointing cheat sheet; (b) make `zeyel zwal` the *someone you return to* form and reword D-69, `retiredSomeone`, and the registry row; (c) leave it. **Recommendation:** (a). It matches D-69 and the Practice item, and it lets the English helper reach `zwal`.
3. **How far a quantified phrase reaches past its sentence.** `joins.md` under `### Everything (ua)` says the reach *runs on into a later sentence that points back to the phrase*, and the `ua` reader note in `src/parse/constructions.ts` says *any later sentence that points back into it*. The bound-tags section and D-72 give the reach as the sentence plus the sentences its stand-ins point to. A learner can read the joins wording as covering *Every dog sees a cat. The cat sleeps.* Options: (a) narrow both to the stand-in wording: *The reach also runs on into the sentence a stand-in in it points to*; (b) keep the wider wording and widen bound tags to match. **Recommendation:** (a). It is what the parser does, and one rule then covers tagged and untagged phrases.

**Accepted by the parser, taught by no page** (no decision needed unless one should be rejected or taught):

- `zwaonx` on first use reads as two people plus their associates. It already parsed as a recall.
- `zodozel zwan veruvol.` parses, though the tag page says a pseudonym names people only. The parser cannot tell a person noun from another noun.
- A reach carried by a sentence-final stand-in also enters a next sentence opened by `/y/` (`zual gogozel zwal vezuvel thohem blarl. yal zwar guzemel.`), though `dependents.md` says the inner sentence does not open with `/y/`. This is general stand-in handling, not specific to tags.

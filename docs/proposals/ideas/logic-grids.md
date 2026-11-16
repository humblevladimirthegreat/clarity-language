# Logic grids: deduction puzzles with Ageben clues

**Status:** IDEA, 2026-11-16.  
**Related:** the line generator and gloss spelling ([`generate.ts`](../../../src/game/generate.ts), [`gloss-inverse.ts`](../../../src/parse/gloss-inverse.ts)); gating from the construction registry and the `core` column ([wizard-game.md](../../meta/wizard-game.md), [core vocabulary](../../meta/procedures/lexicon.md#core-vocabulary-column)); the interpreter's reader ([interpreter.md](../../meta/interpreter.md)); the solver (`clingo-solver.md`); `wizard-adventure.md` (its mysteries are the same puzzle with a story); `various-interpreter-applications.md` (where the blurb came from); grammar pages [joins](/joins), [set joins](/set-joins), [rank joins](/rank-joins), [locative relations](/locative-relations), [comparatives](/comparatives), [numbers](/numbers), [causation](/causation), [evidentiality](/evidentiality), [holder](/holder).

Not design authority. Tooling only: the sketch adds no form and changes no reading. The examples are English paraphrase; no Ageben form here has been checked.

## Problem

A learner has nothing to *read for a reason* between the checkpoints and the wizard game, and the wizard game needs typing and waits on the interpreter. The forms where Ageben is more exact than English (*or* against *either-or*, *if* against *only if*, a set against a ranking) are taught by explanation, and nothing makes a wrong reading of one fail visibly.

## Sketch

A puzzle is a few people, a few attributes each, and a grid of emoji to fill. The clues are the only language on the page, and all of them are Ageben. Behind the puzzle is a hidden assignment and a clue set chosen so that exactly one assignment fits. The player only reads and taps cells; any word can be tapped for its gloss, and a tap counts as a lookup for repetition, as in the wizard game.

**Clue ladder.** Each rung is gated by the player's position on the learning order, like every line the wizard game shows:

| Rung | Clue types | Example |
|------|------------|---------|
| 1 | Plain clause, negation | *Ana does not have the fish* |
| 2 | Adjectives, joins: *neither*, *either-or*, *all but* | *either Ana eats the cookie or Ana sits last, not both* |
| 3 | Order and place: *left of*, *between*, *first* | *the one who eats the mango sits somewhere left of Ana* |
| 4 | Comparatives, numbers | *exactly two of them are older than Ben* |
| 5 | Conditions: *if*, *only if*, *if and only if* | *Mia sits last only if Ben eats the bread* |
| 6 | Sources and holders | *Ana, who heard it: Ben took the bell* |

**Worked example, rungs 1 to 5.** Three people sit in a row and each eats one of 🥭 🍞 🍪.

1. *The one who eats the mango sits somewhere left of Ana.*
2. *Ana does not eat the bread.*
3. *Either Ana eats the cookie or Ana sits last, not both.*
4. *Mia sits last only if Ben eats the bread.*

Clues 1 and 2 leave Ana the cookie; clue 3 then puts her in the middle; clue 1 puts the mango first and so the bread last; clue 4 rules out Mia sitting last, since she would eat the bread herself. Solution: Mia first with the mango, Ana in the middle with the cookie, Ben last with the bread. A brute-force check confirms one solution, and that dropping any clue leaves several.

**Misreadings fail visibly.** Clue sets are chosen so that an English-habit reading of one clue does not reach the solution. In the example, clue 3 read as a plain *or* leaves five assignments, so the player is stuck and the hint points at clue 3. Clue 4 read as *if Ben eats the bread, Mia sits last* gives exactly one assignment, the wrong one; the grid is rejected and the feedback names clue 4.

**Worked example, rung 6.** Someone took the bell. The puzzle's premise: what a witness saw is so, and what a witness only heard may not be.

1. Ana, who heard it: *Ben took the bell.*
2. Ben, who saw it: *Ana did not take it.*
3. Mia, who saw it: *Ben did not take it.*

Mia took it. The only clue that names a culprit is the hearsay one, and it is false.

**Vocabulary.** People come from the house cast, attributes from core roots that have an emoji, picked from what is due for review. The grid's row and column heads are emoji, so the page has no English.

**Hints** come from the derivation: first the clues that settle the next cell (*clues 2 and 5 settle the cat*), then, on higher rungs, the step itself as an Ageben sentence with *because*.

**Production is optional.** A solved grid can close with a fill question (*who has the fish?*) answered in Ageben. A later reverse mode shows a solved grid and asks for the fewest clues that pin it down, which rewards exact wording.

**Format.** One puzzle a day at the player's rung, plus an endless mode. A puzzle prints, with its glosses on the back.

**How a puzzle is made.** A clue type is a morph-gloss template paired with a test over an assignment. The generator draws a hidden assignment, proposes clues that are true of it, and keeps a set with exactly one solution, every clue needed, and at least one chosen misreading that fails. Grids this small are searched exhaustively in the browser, so the first version needs neither the interpreter nor the solver. Every clue is spelled by gloss-inverse and parsed before it is shown.

## Open questions

1. **Who decides what a clue means?** Options: (a) each template carries its own hand-written test; (b) wait for the interpreter's reader and derive the test from the clue's reading; (c) start with (a) and replace the tests with readings when the reader exists, keeping the old tests as a cross-check. A hand-written test is a second statement of what a form means and can drift from the grammar pages. **Recommendation:** (c). The learner gets the game sooner, and the cross-check turns the drift risk into a test of the reader.
2. **Which forms state each clue type?** The ladder is written from English. Each row needs its Ageben form found on its owning page and spelled by the tools; a clue type with no clean form is a grammar gap to report, not to resolve here. No recommendation until that pass is done.
3. **May a misreading lead to a confident wrong answer?** Options: (a) only misreadings that leave the player stuck or in contradiction; (b) also ones that give a unique wrong grid. **Recommendation:** (b), provided the rejection always names the misread clue. Being wrong and told exactly why teaches the distinction better than being stuck.
4. **What does a source mark promise in a puzzle?** Rung 6 needs a premise such as *what was seen is so*. Evidentiality marks a channel, not truth, so the premise belongs to the puzzle and not to the form. Options: (a) state the premise in English in the rules; (b) state it as an Ageben clue; (c) drop the fixed premise and give each witness a stated reliability. **Recommendation:** (b), so the page stays all Ageben and the learner sees that the premise is extra. Whether such a premise reads naturally is the user's call.
5. **Where does it live?** Options: (a) its own page in the Tools sidebar group; (b) only inside the wizard game, as its generated mysteries. **Recommendation:** (a), with the wizard game reusing the generator. A reading-only game on its own page serves learners who do not want to type, and from the first rung.

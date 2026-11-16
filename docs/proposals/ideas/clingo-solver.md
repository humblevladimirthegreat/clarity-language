# A solver behind the interpreter: Clingo for what follows, what clashes, and what stands

**Status:** IDEA, 2026-11-14.  
**Related:** the interpreter's reading, log, matcher, host and replies ([interpreter.md](../../meta/interpreter.md), `src/interpret/`, made by `ageben-interpreter.md`); grammar pages [usually vs must](/usually-vs-must#generalization), [causation](/causation), [everything](/joins#everything-ua), [knowing](/knowing), [contrary to](/contrary-to); consumers `ageben-spec.md`, `agent-tool-permissions.md`, `structural-search.md`, `wizard-adventure.md`; the wizard engine ([wizard-game.md](../../meta/wizard-game.md)).

Not design authority. Tooling only: the sketch adds no form and changes no reading. Where the translation to the solver needs a meaning the grammar pages do not state, that is an open question for the user.

## Problem

The interpreter's matcher is structural on purpose: it finds the readings that say a thing, and never works out what else must be true. Four jobs need the second step, and each would otherwise grow its own search code:

| Job | Who wants it | What the matcher cannot do |
|-----|--------------|----------------------------|
| **What follows** | structural search, Ageben Spec | chain a condition to its result, or several inference switches together, and say which steps it took |
| **What clashes** | Ageben Spec, agent permissions, a journal or text lint | show that a set of sentences cannot all hold, and name the smallest set that clash |
| **What stands** | a disagreement view | weigh claims against the objections stated to them and say which survive |
| **What can be done** | the wizard | prove a quest reachable, find its shortest walkthrough, generate a new quest |

All four are one problem: find the worlds consistent with what was said. That is what an answer-set solver does.

## Sketch

**Clingo** is an answer-set solver (Potassco, MIT licence, with a WASM build). A program is facts, rules, choices and constraints; the output is every consistent world, or none. Its `not` means *not shown*, so a rule can hold by default and give way to an exception.

One new module, `src/interpret/solve.ts`, sits beside the matcher and is the only code that talks to Clingo:

1. **Translate.** Each reading in the log becomes facts and rules. A claim is a term, so frames stay data and never leak: *Ana says Lee paid* is `said(ana, paid(lee))`, not `paid(lee)`. A translation table, one row per frame family, lives in the meta note and cites the classification table row it reads from. A family with no row makes the reading `beyond`, as an unread construction does today.
2. **Tag.** Every rule carries the id of the reading it came from and derives a `fired(id, conclusion)` marker. Every reading is switched by one assumption atom.
3. **Solve, then explain.** Walking the `fired` markers back from a conclusion gives the readings that decided it. When no world exists, Clingo's unsatisfiable core over the assumption atoms gives the readings that clash. Both come back as reading ids, which is what the *why* reply in `reply.ts` already takes.

**Worked example: what follows, with a default.** Three readings, shown here in English:

- s1: *Birds usually fly.*
- s2: *Penguins never fly.*
- s3: *Pingu is a penguin, and a bird.*

```prolog
holds(fly(X))  :- holds(bird(X)), not -holds(fly(X)), on(s1).   % default: gives way
-holds(fly(X)) :- holds(penguin(X)), on(s2).                    % strict
holds(bird(pingu)) :- on(s3).   holds(penguin(pingu)) :- on(s3).
fired(s2, -fly(X)) :- holds(penguin(X)), on(s2).
```

Asked *does Pingu fly?*, the solver gives *no*, and the *why* reply cites s2 and s3. Change s1 to *all birds fly* (a closed universal) and there is no world; the core is {s1, s2, s3}, and the reply says those three cannot all hold. The grammar already keeps *usually* and *must* apart; this is the first tool that would act on the difference.

**Worked example: a quest.** Each wizard verb handler declares what must hold before it and what it changes. A choice rule picks one action per step, a constraint states the goal, and each answer set is a walkthrough; minimising the step count gives the shortest. No answer set within the step limit means the quest cannot be finished, which replaces the hand-written walkthrough check with a proof.

**What each job uses:**

| Job | Solver feature | Explanation |
|-----|----------------|-------------|
| What follows | rules, defaults | `fired` markers |
| What clashes | constraints, assumptions | unsatisfiable core, shrunk by re-solving |
| What stands | the standard encoding of attack and support between claims | the attack graph itself |
| What can be done | choices, minimising | the plan; a missing plan has only a partial answer |

## Open questions

1. **Does *usually* become a default rule?** The example reads a *usually* claim as holding unless an exception is shown, and a closed universal as strict. Options: (a) as in the example; (b) every general claim is strict, and *usually* is carried as data only; (c) a switch per run. This decides what the tool says a text implies, so it is a meaning decision. **Recommendation:** (a), since it is the reading [usually vs must](/usually-vs-must#generalization) teaches, but the user confirms each family's row before it is used.
2. **Is a thing nobody said false?** The reader's rule is *not stated stays empty*. The solver's `not` treats the unshown as false. Options: (a) `not` appears only inside a default's exception check, and a question about something never stated answers *cannot say*; (b) the log is the whole world, and the unsaid is false; (c) the host chooses (the wizard's world is closed, a journal is not). **Recommendation:** (c), with (a) the default.
3. **Where do the inference switches live?** The matcher has three switches (list membership, compound to head, closed universal to instance). The solver needs the same steps as rules. Options: (a) both keep their own, checked equal by a test; (b) the switches move to the solver, and the matcher is structure only. **Recommendation:** (b), so each step is defined once; it rests on question 6.
4. **Which frames get a row first?** Options: (a) negation, condition hinges and closed universals only, which covers *what follows* and *what clashes*; (b) add holders and say words, for permissions; (c) add because, contrary-to and fault, for *what stands*. **Recommendation:** in that order, one job at a time; each row is a decision.
5. **How are *why not* questions answered?** *Why does the door not open?* has many failed routes. Options: (a) force the conclusion and report the core, which gives one reason; (b) leave it out; (c) use a goal-directed solver (s(CASP)) for these. **Recommendation:** (a). The wizard is where a learner would ask, and one reason is what a hint needs.
6. **Does it run in the browser?** The mind map, search and the wizard run on the site. Options: (a) ship the WASM build, loaded only when a solver job runs; (b) Node only, with the site limited to the matcher. **Recommendation:** no basis yet; see Not checked.
7. **Numbers.** Clingo by itself handles small integers only. Options: (a) number stems stay opaque terms here, compared by the matcher's values; (b) a Clingo extension that adds numeric constraints, if one fits (see Not checked); (c) a second solver for measures, ranges and percent. **Recommendation:** no basis until the extensions are checked. If none fits, (a); a second solver is its own idea.

## Non-goals

- **No second grammar authority.** The translation table reads from the classification table and cites it. It never states a meaning of its own.
- **No inference by default.** A solver job runs only when a consumer asks for it, and every answer found through one says so and names the readings.
- **No probability.** How strongly a channel supports a claim is not something this solver weighs.
- **No paraphrase.** A different root is still a different claim.

## Not checked

Named from memory, to verify before planning: the current state, size and API of the Clingo WASM build (including whether it exposes assumptions and cores); the licence of that build; whether an explanation add-on (xclingo) is maintained and worth using over `fired` markers; solve time on a log the size of a long journal.

**Extensions, numbers first.** Check which Potassco extensions exist, are maintained, and run in the WASM build, since each could widen what this idea covers without a second engine:

| Extension (from memory) | Would add | Bears on |
|-------------------------|-----------|----------|
| clingcon | constraints over integers | open question 7: measures, ranges, counts |
| clingo-dl | differences between times or amounts | open question 7; before / after, durations |
| clingo-lp | linear constraints over reals | open question 7: percent, fractions, measures that are not whole |
| telingo | temporal rules | wizard planning, dated claims |
| plingo | probabilities on rules | the probability non-goal |
| eclingo | what a holder knows, apart from what holds | holders and say words (open question 4) |

For numbers, the test is whether one extension covers what [measures and percent](/measures-and-percent) and [ranges](/ranges) can say: non-integer values, percent, open rays, and comparison across units. If none does, open question 7 falls to option (a) or (c).

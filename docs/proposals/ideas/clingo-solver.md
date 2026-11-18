# A solver behind the interpreter: Clingo for what follows, what clashes, and what stands

**Status:** IDEA, 2026-11-14. Researched 2026-11-18 (see [Research](#research)). User, 2026-11-18: the wizard integration comes later; the first jobs are what follows, what clashes and what stands. User, 2026-11-18: adopted the recommendations on open generalizations, the unsaid, numbers, the first rows, the browser, *why not*, and clashes under choices; each is now in the Sketch. User, 2026-11-18: the matcher's step conditions are shared TypeScript functions that both engines call (Sketch, *the matcher's steps*).  
**Related:** the interpreter's reading, log, matcher, host and replies ([interpreter.md](../../meta/interpreter.md), `src/interpret/`, made by `ageben-interpreter.md`); grammar pages [usually vs must](/usually-vs-must#generalization), [causation](/causation), [everything](/joins#everything-ua), [knowing](/knowing), [contrary to](/contrary-to), [measures and percent](/measures-and-percent), [ranges](/ranges), [open ranges](/open-ranges); consumers `ageben-spec.md`, `agent-tool-permissions.md`, `argument-map.md`, `knowledge-store.md`, `structural-search.md`, `who-knows-what.md`, `various-interpreter-applications.md`, later `wizard-adventure.md` and `logic-grids.md`; the wizard engine ([wizard-game.md](../../meta/wizard-game.md)).

Not design authority. Tooling only: the sketch adds no form and changes no reading. Where the translation to the solver needs a meaning the grammar pages do not state, that is an open question for the user.

## Problem

The interpreter's matcher is structural on purpose: it finds the readings that say a thing, and never works out what else must be true. Its two switches (`widen`, `infer` in `src/interpret/match.ts`) take one step each and say so. Four jobs need more, and each would otherwise grow its own search code:

| Job | Who wants it | What the matcher cannot do |
|-----|--------------|----------------------------|
| **What follows** | Ageben Spec, structural search, knowledge store, who knows what | chain a condition to its result, or several steps together, and say which readings it used |
| **What clashes** | Ageben Spec, agent permissions, knowledge store, argument map | show that a set of sentences cannot all hold, and name the smallest set that clash, or the smallest set to give up |
| **What stands** | argument map | weigh claims against the objections stated to them and say which survive |
| **What can be done** (later) | the wizard, logic grids | prove a quest reachable, find its shortest walkthrough, generate a puzzle with one solution |

All four are one problem: find the worlds consistent with what was said. That is what an answer-set solver does.

## Sketch

**Clingo** is an answer-set solver from Potassco. A program is facts, rules, choices and constraints; the output is every consistent world, or none. Its `not` means *not shown*, so a rule can hold by default and give way to an exception. It runs as the `clingo-wasm` package in Node and on the site, where it loads in a worker the first time a solver job runs (about 0.9 MB gzipped). The package bundles Clingo 5.8, so the translator writes programs that mean the same under Clingo 6 ([Research](#research)).

One new module, `src/interpret/solve.ts`, sits beside the matcher and is the only code that talks to Clingo:

1. **Translate.** Each `Reading` in the log becomes facts and rules. Its `claim` (verb, `z` / `d` / `b` roles, predicate, details) becomes a term, and each frame wraps that term, so frames stay data and never leak: *Ana says Lee paid* is `said(ana, paid(lee))`, not `paid(lee)`. A hinge's clauses are already nested readings in the frame's `content`, and a holder is the frame's `party`. A translation table, one row per frame family, lives in the meta note and cites the classification table row it reads from. A frame with no row is left out of the program and is reported like an `unread` part today: the turn is `beyond` for that job.
2. **Switch.** Every reading is switched by one atom, `on(Id)`, and every rule carries the reading id it came from and derives a `fired(Id, Conclusion)` marker.
3. **Solve, then explain.** Walking the `fired` markers back from a conclusion gives the readings that decided it. A contradiction derives a `clash` atom instead of ending the world, so the same walk names the readings that clash ([naming a clash](#naming-a-clash)). Both come back as reading ids, which is what `whyReply(because)` in `reply.ts` already takes.

**What a question asks of the worlds.** *Does it follow?* is true in every world (Clingo's cautious consequences); *could it be?* is true in some world (brave consequences). Both are a run option, not a new program. A question answers *yes* when the claim holds in every world, *no* when its denial does, and *cannot say* otherwise.

### What the solver may conclude
<a id="what-the-solver-may-conclude"></a>

- **Open and closed generalizations.** [Usually vs must](/usually-vs-must#generalization) teaches that a closed fence (`zual`, `hual`) allows no exceptions and an open one (`zuam`, *as a rule*) leaves them *not ruled out*. So a closed generalization is a strict rule, and an open one gives only *could be*: a member may hold, in some world, unless a stated denial or strict rule rules it out. A host that wants everyday defaults (an open claim holds of a member until an exception is shown) switches them on, and every answer that used one names the switch, as `widen` and `infer` are named today. (*Must* as a rule someone sets is a say word, not a fence.)
- **The unsaid.** The reader's rule is *not stated stays empty* (reader rule 4). By default the solver keeps it: `not` appears only inside an exception check, and a question about something never stated answers *cannot say*. A host whose world is closed (a game) may declare that the unsaid is false. Either way, the solver can answer *no* from a stated denial or a strict rule, which the log alone never does today (`defaultVerdict` in `run.ts`); the answer names the readings, so the step is visible.
- **Numbers.** Number stems stay opaque terms. For the values that appear in the log, the translator adds order and range facts computed in TypeScript (`compareValues` in `value.ts`), which covers *more than*, rays and ranges. A stem with no value (digitless words, the ends of a ray) gets no order facts, so a question that needs one answers *cannot say*. Arithmetic across claims (*three plus two*) stays out; a second solver for it would be its own idea.
- **The first rows.** The translation table grows one job at a time: (a) polarity, condition hinges and closed universals, for *what follows* and *what clashes* in Ageben Spec; (b) holders and say words, for permissions and who knows what; (c) because, contrary-to and fault, for *what stands*. Each row is a decision the user confirms when it is written.
- **The matcher's steps.** The matcher has two switches (`src/interpret/match.ts`): `widen` (a compound matches on its head) and `infer` (a member of an *and* list whose pairing is stated, and a closed `zual` + kind to an instance; neither with a collective `-x` verb or a list frame). The solver needs the same steps as rules, so it can chain them. The conditions for each step stay TypeScript functions that read one reading (`claimMemberLists`, `collective`, the closed-universal test, the lexicon's compound heads), and both engines call them. The matcher uses them as today; the translator uses them to emit facts where a step applies (`member(L, X)`, `every(Id, Kind, Template)`, `head(Compound, Root)`), and the solver's rules only apply those facts, one line each. So each condition is defined once, the matcher stays synchronous and needs no WASM, and a test that the two engines agree on one-step cases guards only the one-line rules. Not yet checked: that every condition is decidable from one reading.

**Worked example: what follows, and what clashes.** Three readings, shown here in English:

- s1: *Birds usually fly.*
- s2: *Penguins never fly.*
- s3: *Pingu is a penguin, and a bird.*
- s6: *Robin is a bird.*

```prolog
{ holds(fly(X)) } :- holds(bird(X)), not -holds(fly(X)), on(s1).  % open: could be
-holds(fly(X)) :- holds(penguin(X)), on(s2).                      % strict
holds(bird(pingu)) :- on(s3).   holds(penguin(pingu)) :- on(s3).
holds(bird(robin)) :- on(s6).
fired(s2, -fly(X)) :- holds(penguin(X)), on(s2).
```

Asked *does Pingu fly?*, the solver gives *no*, and the *why* reply cites s2 and s3. Asked *does Robin fly?*, it gives *cannot say*: Robin flies in some worlds, not in all, and *could Robin fly?* gets *yes*, citing s1 and s6. With everyday defaults switched on, s1 becomes `holds(fly(X)) :- holds(bird(X)), not -holds(fly(X)), on(s1).` and Robin flies, with the switch named. Change s1 to *all birds fly* (a closed universal, `zual`) and s1, s2 and s3 clash, and the reply says those three cannot all hold. The grammar already keeps closed and open generalizations apart; this is the first tool that would act on the difference.

### Naming a clash
<a id="naming-a-clash"></a>

A clash has two answers. A **smallest clash** is a set of readings that cannot all hold, where dropping any one makes the rest consistent: *why is this contradictory?* A **smallest set to give up** is a set whose removal makes everything else consistent: *what should I drop?* Every set to give up takes at least one reading from every clash, so either answer gives the other. Add two readings to the example, with s1 as *all birds fly*:

- s4: *Tweety is a bird.*
- s5: *Tweety doesn't fly.*

There are two smallest clashes, {s1, s2, s3} and {s1, s4, s5}, and one smallest set to give up, {s1}. The reply names each clash on its own line (*These cannot all hold: s1, s2, s3.*) and, when the consumer asks, the set to give up (*Giving up s1 resolves both.*).

The translator writes a contradiction as a derived atom, not a constraint:

```prolog
clash(P) :- holds(P), -holds(P).
```

The program then always has a world, and the `fired` markers behind each `clash(P)` name its readings in one run. That is exact when the program has one world, which holds for the first rows (denials, condition hinges and closed universals are plain rules). A `clash` found this way can carry a reading it does not need, when a fact was derived two ways; one removal pass over those few readings shrinks it.

**Clashes under choices.** *Or*, *maybe* and open generalizations make several worlds, and a clash may hold in some of them only. Then the solver re-solves with the switch atoms free:

- One optimization run maximises the readings kept; the readings left out are a smallest set to give up.
- A smallest clash follows by switching readings off one at a time, or by halves (QuickXplain), keeping each one whose loss restores a world.

Both use only plain programs and run options, so they work on Clingo 5 and 6 alike. Clingo's assumption cores would be faster, but `clingo-wasm`'s JavaScript API does not expose them.

**Why not.** *Why is this not allowed?* has many failed routes. The solver adds the conclusion as a reading and reports the smallest clash it joins: one reason, which is what a reply needs. A goal-directed solver (s(CASP)) would give the whole tree, at the cost of a second engine of 13.7 MB.

Frames stay data, so *Ana says Lee paid* and *Ben says Lee didn't pay* never clash: `said(ana, paid(lee))` and `said(ben, -paid(lee))` are two facts. Whether one person's beliefs clash among themselves is a holder row (the second group of first rows) and `who-knows-what.md`.

**What each job uses:**

| Job | Solver feature | Explanation |
|-----|----------------|-------------|
| What follows | rules, cautious consequences | `fired` markers |
| What clashes | `clash` atoms; switch atoms when there are choices | `fired` markers behind each clash; re-solving when there are choices |
| What stands | the standard ASPARTIX encodings of attack between claims (grounded, stable, preferred) | the attack graph itself |
| What can be done (later) | choices, minimising | the plan; a missing plan has only a partial answer |

The wizard already checks its quests without a solver: each quest has a hand-written `QuestModel` (`src/game/quests.ts`) and `checkReachability` (`src/game/reachability.ts`) searches it. The solver adds to that only when the wizard wants generated quests, hints, or one-solution mysteries (`wizard-adventure.md`), so it waits.

## Open questions

None at this stage. Each translation table row is still a decision the user confirms when it is written ([the first rows](#what-the-solver-may-conclude)).

## Non-goals

- **No second grammar authority.** The translation table reads from the classification table and cites it. It never states a meaning of its own.
- **No inference by default.** A solver job runs only when a consumer asks for it, and every answer found through one says so and names the readings.
- **No probability.** How strongly a channel supports a claim is not something this solver weighs.
- **No paraphrase.** A different root is still a different claim.

## Research
<a id="research"></a>

Done 2026-11-18 from package metadata, the package's README and type files, and the strings in its WASM binary. The package was not run: executing it was not permitted in this session, so nothing below is a measurement of solving.

**What the interpreter gives the translator.**

- A `Reading` (`src/interpret/types.ts`) has an `id` (`<text>:<utterance>.<body>` plus a clause path), a `claim`, `frames` in text order, the `order` between frames (from the pair table), `unordered` pairs, `links` to other readings, and `unread` parts.
- There is no polarity field: a denial is a `polarity` frame, either on a list term (a `u` join denies only its items) or on the whole clause.
- Frames nest: a hinge's or quote's clause is a nested `Reading` in `content`, and a holder is the frame's `party`.
- Values (`value.ts`) are JS floats with a percent kind, ranks, or codes. Digitless words, infinite ray ends and fractions (`g-N`) carry no value, and `compareValues` orders only like with like.
- The *why* reply takes reading ids and held-state sources; a question's verdict is `yes`, `no`, `unknown` (*I can't say.*) or a fill.

**Clingo in JavaScript.**

| Package | State |
|---------|-------|
| `clingo-wasm` 0.6.0 | Apache-2.0, published 2026-08-06, by the author of the older builds (Dominik Moritz). Clingo 5.8.1 with Lua 5.4.6, no Python. Two builds, single-threaded and threaded, 2.6 MB each, 0.93 MB gzipped. Runs in a worker in Node and the browser; threads need a cross-origin isolated page, otherwise it falls back to one thread. Vite needs `worker: { format: "es" }`. |
| `wasm-clingo`, `node-clingo-wasm` | Older names of the same work, last published 2022. |

- **API.** `run(program, models, options, onModel)`, `stream(program, models, options)`, `init(wasmUrl)` and `restart()`. `options` are Clingo's command-line flags, so `--enum-mode=cautious` / `brave` and optimization flags work. The result is Clingo's JSON output: `Result` (SATISFIABLE, UNSATISFIABLE, OPTIMUM FOUND, UNKNOWN), witnesses as lists of atom strings, costs, and timings.
- **One-shot.** Each `run` grounds the whole program again. Holding a ground program and switching readings on and off between solves (`knowledge-store.md` asks for this) is possible only inside a Lua `#script` main, untested.
- **Cores.** There is no assumption or core call in the JavaScript API. The binary holds the Lua solve keys `assumptions`, `yield`, `async` and `on_finish`, but no `on_core` string, so core access from Lua is unconfirmed. The Sketch does without it ([clashes under choices](#naming-a-clash)).

**Clingo 6.**

- **Status.** 6.0.0 is on Potassco's conda channel (updated 2026-11-05), but PyPI and GitHub releases still show 5.8.3 (2026-11-03) as latest, and the new guide calls itself a work in progress. An October 2026 issue (a 5% slowdown on Spack's encoding) was fixed by restoring clingo 5 behaviour. `clingo-wasm` bundles 5.8.1 and has no clingo 6 build.
- **Language.** Mostly unchanged, but some results change:
  - a conditional literal in a body (`h :- p(1..3) : #true.`) needs every condition, not any
  - `_` inside a `not` literal is an ordinary fresh variable (write `*`, or pass `--project-anonymous`)
  - integers are arbitrary precision, `/` floors, and `-2**2` is `-4`
  - new: format strings, `#parts`, digit separators, `\u{HEX}` escapes, `#sort` aggregates
- **API.** It "changed more substantially", undocumented in the migration page. The 6.0 Python reference splits it into `core`, `control`, `solve`, `ground` and others, starts a solve with `start_solve`, keeps `SolveHandle.core()` and cautious / brave consequences, and documents only Python scripting, with no word on Lua.
- **Constraint solving.** The guide lists a built-in constraint-solving chapter, which may mean integer constraints without clingcon; the page was not reachable.
- **Bearing.** The translator targets 5.8 through `clingo-wasm`, and writes programs that mean the same under 6: no conditional literals in bodies, no `_` inside `not`, no integer division. A golden test that solves the translator's output under the bundled version shows any drift when `clingo-wasm` moves to 6. Recheck then whether Lua survives and what the constraint chapter covers; neither changes how numbers are handled ([what the solver may conclude](#what-the-solver-may-conclude)), since neither gives decimals or percent.

**Who wants which clash answer.**

| Consumer | Wants | From |
|----------|-------|------|
| Ageben Spec | every smallest clash, each reported as a bug | `clash` atoms; re-solving when there are choices |
| Knowledge store admission gate | the clashes a new entry causes | removal over the old entries only, since the store was consistent before |
| Argument map (the crux) | the smallest set two people would have to give up | the optimization run |
| Agent permissions, *why not* | one reason | the conclusion added as a reading, then `clash` atoms |

**Cost of re-solving.** Removal one at a time is one solve per reading, and each `clingo-wasm` call grounds the whole program again; QuickXplain needs about k·log(n/k) solves for a clash of k among n.

**Extensions.** All are maintained by Potassco, with conda packages updated in 2025. None has a WASM or JavaScript build, and the ones in Python cannot run on the site.

| Extension | Adds | Runs as | Bears on |
|-----------|------|---------|----------|
| clingcon 3.x | integer linear constraints (`&sum`, `&dom`), integers only | native, Python / Lua multi-shot | numbers: counts, not percent or decimals |
| clingo-dl 1.5 | difference constraints | native, Python | before / after, durations |
| clingo-lp | linear constraints over reals | Python | numbers: percent, decimals |
| telingo | temporal rules | Python | wizard planning, later |
| plingo | probabilities on rules | Python | the probability non-goal |
| eclingo | epistemic operators `&k{}` (known) and `&m{}` (possible), Gelfond 1991 semantics | Python | holders (the second group of first rows); the same split as cautious and brave consequences, which core Clingo already gives |

For numbers, no single extension covers what [measures and percent](/measures-and-percent), [ranges](/ranges) and [open ranges](/open-ranges) can say (decimals, percent and points, fractions, rays to infinity, a named band, *about*), and none runs on the site. So the translator compares stated values itself, and arithmetic waits for a second solver.

**Explanation tools.** Both are Python only, so neither replaces `fired` markers:

- `xclingo2` (comment annotations give text explanations; last push 2025-03)
- `clingo-explaid` (MIT; minimal unsatisfiable and correction subsets; needs clingo 5.7.1+)

They are useful as references for re-solving under choices.

**Argumentation.** The ASPARTIX encodings for *what stands* are plain Clingo programs:

- grounded semantics is stratified, so it has one world and is fast
- stable and complete are normal programs
- preferred and semi-stable need disjunction, which Clingo supports

Credulous (some extension) and skeptical (every extension) acceptance map onto brave and cautious consequences.

**s(CASP).** A goal-directed answer-set engine in SWI-Prolog. It gives a justification tree for a query, including *why not*, without grounding the whole program, and handles constraints over rationals through CLP(Q). It runs on the site only through `swipl-wasm` (8.3.1, BSD-2, 13.7 MB unpacked), a whole Prolog. It is an alternative for *why not* and for numbers, not a first choice.

**Not yet checked.**

- Solve time and grounding size on a log the size of a long journal, and on Ageben Spec's checks; this needs the package run in Node.
- Whether the Lua binding exposes the core, which would make clashes under choices faster.
- The first-load time of the worker on the site.

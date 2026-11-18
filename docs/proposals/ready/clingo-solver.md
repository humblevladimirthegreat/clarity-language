# A solver behind the interpreter: Clingo for what follows, what clashes, and what stands

**Status:** READY, 2026-11-18. No phase started. Idea 2026-11-14; researched 2026-11-18 ([Research](#research)). User, 2026-11-18: the wizard integration comes later; the first jobs are what follows, what clashes and what stands. User, 2026-11-18: adopted the recommendations on open generalizations, the unsaid, numbers, the first rows, the browser, *why not*, and clashes under choices; each is in the Sketch. User, 2026-11-18: the matcher's step conditions are shared TypeScript functions that both engines call (Sketch, *the matcher's steps*).  
**Related:** the interpreter's reading, log, matcher, host and replies ([interpreter.md](../../meta/interpreter.md), `src/interpret/`, [reading.mjs](../../../scripts/reading.mjs)); grammar pages [usually vs must](/usually-vs-must#general-claims), [causation](/causation), [everything](/joins#everything-ua), [universals](/universals-domains#universals-domains-generics), [knowing](/knowing), [holder](/holder), [contrary to](/contrary-to), [fault](/fault), [because](/because-and-iff), [measures and percent](/measures-and-percent), [ranges](/ranges), [open ranges](/open-ranges); consumers `ageben-spec.md`, `agent-tool-permissions.md`, `argument-map.md`, `knowledge-store.md`, `structural-search.md`, `who-knows-what.md`, `various-interpreter-applications.md`, later `wizard-adventure.md` and `logic-grids.md`; the wizard engine ([wizard-game.md](../../meta/wizard-game.md)).  
**Depends on:** none (the interpreter's reader, log and matcher have landed). **Order:** none required. `ageben-spec.md` may switch its contradiction check to the solver once phase 2 here lands.  
**Design authority:** *none*. Tooling only: it adds no form and changes no reading. Each translation row states what the solver concludes from a frame family as the grammar page already teaches it; where a row needs a meaning the grammar pages do not state, that is an open decision for the user, and the row waits.

## Problem

The interpreter's matcher is structural on purpose: it finds the readings that say a thing, and never works out what else must be true. Its two switches (`widen`, `infer` in `src/interpret/match.ts`) take one step each and say so. Four jobs need more, and each would otherwise grow its own search code:

| Job | Who wants it | What the matcher cannot do |
|-----|--------------|----------------------------|
| **What follows** | Ageben Spec, structural search, knowledge store, who knows what | chain a condition to its result, or several steps together, and say which readings it used |
| **What clashes** | Ageben Spec, agent permissions, knowledge store, argument map | show that a set of sentences cannot all hold, and name the smallest set that clash, or the smallest set to give up |
| **What stands** | argument map | weigh claims against the objections stated to them and say which survive |
| **What can be done** (later) | the wizard, logic grids | prove a quest reachable, find its shortest walkthrough, generate a puzzle with one solution |

All four are one problem: find the worlds consistent with what was said. That is what an answer-set solver does.

## Goals

- One module, `src/interpret/solve.ts`, is the only code that talks to Clingo. Consumers ask it what follows, what clashes, and what stands, and every answer names the readings that decided it, by the ids `whyReply` already takes.
- A translation table in a meta note, one row per frame family, each row citing the classification table row it reads from and confirmed by the user when it is written.
- The matcher's step conditions are defined once and called by both engines.
- It runs in Node and from the site's browser entry, loading the solver only when a job first runs.

## Non-goals

- **No second grammar authority.** The translation table reads from the classification table and cites it. It never states a meaning of its own.
- **No inference by default.** A solver job runs only when a consumer asks for it, and every answer found through one says so and names the readings.
- **No change to the loop.** `run` and a host's `verdict` stay synchronous and never call the solver; the solver is its own asynchronous entry, which a consumer calls before or beside the loop.
- **No probability.** How strongly a channel supports a claim is not something this solver weighs.
- **No paraphrase.** A different root is still a different claim.
- **No arithmetic across claims**, no Clingo extension, and no second engine (s(CASP)). None of Clingo's extensions has a build that runs on the site, none covers every number form the grammar has (decimals, percent, fractions, rays, *about*), and s(CASP) would add a whole Prolog of 13.7 MB.
- **No held ground program.** Each job grounds its program again. Switching readings on a held program (`knowledge-store.md`) waits for that consumer; S1 measures whether it will be needed.
- **No wizard integration**, and no *what can be done*: user, 2026-11-18.

## Sketch

**Clingo** is an answer-set solver from Potassco. A program is facts, rules, choices and constraints; the output is every consistent world, or none. Its `not` means *not shown*, so a rule can hold by default and give way to an exception. It runs as the `clingo-wasm` package in Node and on the site, where it loads in a worker the first time a solver job runs (about 0.9 MB gzipped). The package bundles Clingo 5.8, so the translator writes programs that mean the same under Clingo 6 ([Research](#research)). Its calls are asynchronous, so the solver is its own entry, never a step inside the loop.

`src/interpret/solve.ts` sits beside the matcher and is the only code that talks to Clingo. The translation lives in `src/interpret/translate.ts`, and the step conditions both engines share in `src/interpret/steps.ts`:

1. **Translate.** Each `Reading` in the log becomes facts and rules. Its `claim` (verb, `z` / `d` / `b` roles, predicate, details) becomes a term, and each frame wraps that term, so frames stay data and never leak: *Ana says Lee paid* is `said(ana, paid(lee))`, not `paid(lee)`. A hinge's clauses are already nested readings in the frame's `content`, and a holder is the frame's `party`. A translation table, one row per frame family, lives in `docs/meta/solver.md` and cites the classification table row it reads from. A frame with no row is left out of the program and is reported like an `unread` part today: the turn is `beyond` for that job.
2. **Switch.** Every reading is switched by one atom, `on(Id)`, and every rule carries the reading id it came from and derives a `fired(Id, Conclusion)` marker.
3. **Solve, then explain.** Walking the `fired` markers back from a conclusion gives the readings that decided it. A contradiction derives a `clash` atom instead of ending the world, so the same walk names the readings that clash ([naming a clash](#naming-a-clash)). Both come back as reading ids, which is what `whyReply(because)` in `reply.ts` already takes.

**Fitting stays the matcher's.** Whether a stated claim fits a condition, or a question, is decided by `match`, never by Clingo's term equality, so roots, referents, details and blanks keep the matcher's rules. The translator runs `match` over each condition and the claims that could meet it (logged and nested readings, and a universal's template with its instance) and emits the fits as facts that the rules join on. A question is matched in TypeScript against the claims the consequences name. B1 designs the encoding under this constraint; if it cannot keep the matcher's rules, B1 stops and reports.

**What a question asks of the worlds.** *Does it follow?* is true in every world (Clingo's cautious consequences); *could it be?* is true in some world (brave consequences). Both are a run option, not a new program. A question answers *yes* when the claim holds in every world, *no* when its denial does, and *cannot say* otherwise.

### What the solver may conclude
<a id="what-the-solver-may-conclude"></a>

- **Open and closed generalizations.** [Usually vs must](/usually-vs-must#general-claims) teaches that a closed fence (`zual`, `hual`) allows no exceptions and an open one (`zuam`, *as a rule*) leaves them *not ruled out*. So a closed generalization is a strict rule, and an open one gives only *could be*: a member may hold, in some world, unless a stated denial or strict rule rules it out. A host that wants everyday defaults (an open claim holds of a member until an exception is shown) switches them on, and every answer that used one names the switch, as `widen` and `infer` are named today. (*Must* as a rule someone sets is a say word, not a fence.)
- **The unsaid.** The reader's rule is *not stated stays empty* (reader rule 4). By default the solver keeps it: `not` appears only inside an exception check, and a question about something never stated answers *cannot say*. A host whose world is closed (a game) may declare that the unsaid is false. Either way, the solver can answer *no* from a stated denial or a strict rule, which the log alone never does today (`defaultVerdict` in `run.ts`); the answer names the readings, so the step is visible.
- **Numbers.** Number stems stay opaque terms. For the values that appear in the log, the translator adds order and range facts computed in TypeScript (`compareValues` in `value.ts`), which covers *more than*, rays and ranges. A stem with no value (digitless words, the ends of a ray) gets no order facts, so a question that needs one answers *cannot say*. Arithmetic across claims (*three plus two*) stays out; a second solver for it would be its own idea.
- **The first rows.** The translation table grows one job at a time: (a) polarity, condition hinges and closed and open universals, for *what follows* and *what clashes* in Ageben Spec; (b) holders and say words, for permissions and who knows what; (c) because, contrary-to and fault, for *what stands*. Each row is a decision the user confirms when it is written: R1 drafts group (a), R2 groups (b) and (c).
- **The matcher's steps.** The matcher has two switches (`src/interpret/match.ts`): `widen` (a compound matches on its head) and `infer` (a member of an *and* list whose pairing is stated, and a closed `zual` + kind to an instance; neither with a collective `-x` verb or a list frame). The solver needs the same steps as rules, so it can chain them. The conditions for each step stay TypeScript functions that read one reading (`memberList`, `claimMemberLists`, `collective`, `universalInstance`, the lexicon's compound heads), and both engines call them. The matcher uses them as today; the translator uses them to emit facts where a step applies (`member(L, X)`, `every(Id, Kind, Template)`, `head(Compound, Root)`), and the solver's rules only apply those facts, one line each. So each condition is defined once, the matcher stays synchronous and needs no WASM, and a test that the two engines agree on one-step cases guards only the one-line rules. Checked 2026-11-18: each condition reads one claim, its reading's pairing links, and the lexicon, nothing across readings.

**Worked example: what follows, and what clashes.** Four readings, shown here in English:

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

Frames stay data, so *Ana says Lee paid* and *Ben says Lee didn't pay* never clash: `said(ana, paid(lee))` and `said(ben, -paid(lee))` are two facts. Whether one person's beliefs clash among themselves is a holder row (group (b)) and `who-knows-what.md`.

**What each job uses:**

| Job | Solver feature | Explanation |
|-----|----------------|-------------|
| What follows | rules, cautious consequences | `fired` markers |
| What clashes | `clash` atoms; switch atoms when there are choices | `fired` markers behind each clash; re-solving when there are choices |
| What stands | the standard ASPARTIX encodings of attack between claims (grounded, stable, preferred) | the attack graph itself |
| What can be done (later) | choices, minimising | the plan; a missing plan has only a partial answer |

The wizard already checks its quests without a solver: each quest has a hand-written `QuestModel` (`src/game/quests.ts`) and `checkReachability` (`src/game/reachability.ts`) searches it. The solver adds to that only when the wizard wants generated quests, hints, or one-solution mysteries (`wizard-adventure.md`), so it waits.

## Research
<a id="research"></a>

Done 2026-11-18 from the package's metadata, README and type files; the package was not run. S1 runs it and adds what it measures here.

**What the interpreter gives the translator.**

- A `Reading` (`src/interpret/types.ts`) has an `id` (`<text>:<utterance>.<body>` plus a clause path), a `claim`, `frames` in text order, the `order` between frames (from the pair table), `unordered` pairs, `links` to other readings, and `unread` parts.
- There is no polarity field: a denial is a `polarity` frame, either on a list term (a `u` join denies only its items) or on the whole clause.
- Frames nest: a hinge's or quote's clause is a nested `Reading` in `content`, and a holder is the frame's `party`.
- Values (`value.ts`) are JS floats with a percent kind, ranks, or codes. Digitless words, infinite ray ends and fractions (`g-N`) carry no value, and `compareValues` orders only like with like.
- The *why* reply takes reading ids and held-state sources; a question's verdict is `yes`, `no`, `unknown` (*I can't say.*) or a fill.
- The loop (`run`) and a host's `verdict` are synchronous.

**`clingo-wasm` 0.6.0.** Apache-2.0; Clingo 5.8.1 with Lua 5.4.6, no Python. Single-threaded and threaded builds, 0.93 MB gzipped. It runs in a worker in Node and the browser; threads need a cross-origin isolated page, otherwise it falls back to one thread. Vite needs `worker: { format: "es" }`.

- **API.** `run(program, models, options, onModel)`, `stream(program, models, options)`, `init(wasmUrl)` and `restart()`. `options` are Clingo's command-line flags, so `--enum-mode=cautious` / `brave` and optimization flags work. The result is Clingo's JSON output: `Result` (SATISFIABLE, UNSATISFIABLE, OPTIMUM FOUND, UNKNOWN), witnesses as lists of atom strings, costs, and timings.
- **One-shot.** Each `run` grounds the whole program again. Holding a ground program between solves is possible only inside a Lua `#script` main, untested.
- **Cores.** The JavaScript API has no assumption or core call, and core access from Lua is unconfirmed, so clashes under choices re-solve instead ([naming a clash](#naming-a-clash)).

**Clingo 5 / 6 common ground.** `clingo-wasm` has no Clingo 6 build. A program means the same under both when it has no conditional literal in a rule body (6 needs every condition, not any), no `_` inside `not` (6 makes it a fresh variable), and no integer division (6 floors). A golden test that solves the translator's output under the bundled version shows any drift when the package moves to 6.

**Cost of re-solving.** Removal one at a time is one solve per reading, and each `clingo-wasm` call grounds the whole program again; QuickXplain needs about k·log(n/k) solves for a clash of k among n.

**Argumentation.** The ASPARTIX encodings for *what stands* are plain Clingo programs:

- grounded semantics is stratified, so it has one world and is fast
- stable and complete are normal programs
- preferred and semi-stable need disjunction, which Clingo supports

Credulous (some extension) and skeptical (every extension) acceptance map onto brave and cautious consequences.

## Implementation plan

Run with subagents, in three phases. Each phase ends where the user confirms translation rows, which later units build on ([phases](../../meta/procedures/proposal-plans.md#phases)). At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends, then stops and gives the prompt for the next phase.

No unit edits prose under `docs/grammar/`, so there is no style gate and no recall gate. The only new library is `clingo-wasm`; S1 tries it before anything depends on it.

### Phase 1: try the package, share the steps, draft group (a)

**S1 Spike: run `clingo-wasm` in Node.**  
`proposal-worker`, `model: opus`, effort `medium`.  
Add `clingo-wasm` pinned to `0.6.0` as a dependency. In a probe under the scratchpad, run the [worked example](#what-the-solver-may-conclude) program and confirm: cautious and brave consequences through `--enum-mode`; an optimization run (`#maximize` over `on/1` with switch atoms free) and its cost output; the JSON result shape (witness atoms as strings, `Result` values). Measure grounding and solve time on a synthetic program of the worked example's shape at 200, 2,000 and 20,000 readings, and time `init` (the first load). Try one Lua `#script` main that solves under assumptions and asks for a core; record whether it works. Write the results into [Research](#research). Stop and report instead of working around if the package does not run under Node 24 with `tsx`, if cautious or brave consequences or optimization do not work through the options, or if 2,000 readings take more than about 2 seconds.  
**May edit:** `package.json`, `package-lock.json`, this proposal (Research only).

**S2 Shared step conditions.**  
`proposal-worker`, `model: opus`, effort `medium`.  
Move the conditions behind `widen` and `infer` out of `match.ts` into `src/interpret/steps.ts`, exported: `memberList`, `collective`, `claimMemberLists`, `asMember`, `universalInstance`, and the compound-head lookup `widen` uses. `match.ts` calls them; its behavior does not change, and `match.test.ts` and `ask.test.ts` pass unchanged. Add `steps.test.ts` with one case per condition, built from readings of short Ageben sentences checked with `parse.mjs`.  
**May edit:** `src/interpret/steps.ts`, `src/interpret/steps.test.ts`, `src/interpret/match.ts`.

**F1 Fixtures.**  
`proposal-worker`, `model: opus`, effort `high`.  
Write the solver's test texts in Ageben, one sentence per line, each checked with `parse.mjs` per [read-ageben.md](../../meta/procedures/read-ageben.md), with an English line under each: (1) the worked example (s1 to s3, s6), (2) the clash example (s1 as a closed universal, s2 to s5), (3) a chain of two condition hinges (*if A then B*, *if B then C*, *A*), with *only if* and *iff* variants, (4) a denial against a stated claim, (5) an *and* list with *respectively*, and a collective verb that must not infer, (6) a compound that matches on its head, (7) stated numbers with *more than*, a range and a ray, including a digitless word. Use `zual` for the closed universal and `zuam` for the open one as the grammar pages teach them; never trust a form from memory. Log any sentence the grammar cannot say as a finding, with the English and the nearest workaround, and move on.  
**May edit:** `src/interpret/fixtures/solve-*.txt`, this proposal (Findings only).

**R1 Draft the group (a) rows.**  
`proposal-worker`, `model: opus`, effort `high`.  
For each frame family and step in group (a) (polarity on a clause and on a list term; condition hinges: *if*, *only if*, *iff*; closed universals `zual` and `hual`; open universals `zuam`; the two `infer` steps and `widen`; numbers' order facts), draft one translation row: the classification table row and grammar anchor it reads from, the Clingo rule it emits (as a template), its `fired` marker, and the program it gives for the F1 fixture that shows it. Read the [scope statements](../../meta/interpreter.md#scope-statements) for hinge and polarity and the owning grammar sections, in slices. Write the rows into this proposal under **Open decisions**, as one decision per row whose reading is not a direct copy of a stated grammar rule, each with options and a **Recommendation:** with its confidence; rows that are a direct copy go in one decision as a list, for one confirmation. Write nothing under `docs/meta/` yet.  
**May edit:** this proposal (Open decisions only).

**Order:** S1, then S2 and F1 (disjoint files; in parallel only if wall time matters), then R1. **Stop for the user to confirm the group (a) rows.** If S1 stops, the run stops there and the orchestrator alerts the user ([stop and alert](../../meta/procedures/proposals.md#stop-and-alert)).

### Phase 2: build group (a), draft groups (b) and (c)

**B1 Translator.**  
`proposal-worker`, `model: opus`, effort `high`.  
`src/interpret/translate.ts`: a log (readings, nested ones included) to a Clingo program, from the confirmed group (a) rows only. Claims become terms, frames wrap them, every reading gets `on(Id)`, every rule carries its reading id and derives `fired`. Fitting stays the matcher's ([Sketch](#sketch)): fits computed with `match` and emitted as facts. Step facts come from `steps.ts`. Number order facts from `compareValues`. A frame with no row is left out and reported per reading, as `unread` is. The program text keeps to the Clingo 5 / 6 common ground ([Research](#research)). `translate.test.ts`: golden program text per F1 fixture. Report the encoding (atom shapes, what a fit fact holds) in the report, for B5.  
**May edit:** `src/interpret/translate.ts`, `src/interpret/translate.test.ts`, `src/interpret/fixtures/solve-*`.

**B2 Solve and explain.**  
`proposal-worker`, `model: opus`, effort `high`.  
`src/interpret/solve.ts`, the only importer of `clingo-wasm`: `follows(log, question, options)` (cautious), `couldBe` (brave), and `clashes(log)`. Options: `defaults` (everyday defaults for open universals), `closedWorld` (the unsaid is false); an answer that used either names it, as `Match.switches` does. A question answers *yes*, *no* or *cannot say* per the [Sketch](#sketch), with `because` as the reading ids from the `fired` walk, ready for `whyReply`. `clash` atoms with the one removal pass. Tests: the worked example's answers and *why* ids, the two smallest clashes, the hinge chain, numbers, and that the two engines agree on every one-step `widen` and `infer` case in `match.test.ts`.  
**May edit:** `src/interpret/solve.ts`, `src/interpret/solve.test.ts`.

**B3 Clashes under choices.**  
`proposal-worker`, `model: opus`, effort `medium`.  
In `solve.ts`: when the program has more than one world, re-solve with the switch atoms free: one optimization run for a smallest set to give up (`giveUp(log)`), and QuickXplain for a smallest clash; `clashes` uses them only when needed. *Why not*: `whyNot(log, claim)` adds the claim as a reading and returns the smallest clash it joins. Tests on fixtures with *or* and open universals, and on the clash example (sets {s1, s2, s3}, {s1, s4, s5}; give up {s1}).  
**May edit:** `src/interpret/solve.ts`, `src/interpret/solve.test.ts`, `src/interpret/fixtures/solve-*`.

**B4 Entries: CLI and browser.**  
`proposal-worker`, `model: opus`, effort `medium`.  
`reading.mjs solve [--json] [--possible] [--defaults] [--closed] [--window N] FILE '<question>'`, plus `reading.mjs clashes [--give-up] FILE`, with replies drafted through `reply.ts` (*why*, *these cannot all hold*). Browser: `src/interpret/solve-browser.ts` that loads `clingo-wasm` in a worker on the first call, exported beside `browser.ts`, and a test that a Vite build of a one-line entry importing it succeeds (`worker: { format: "es" }`). If the site's build cannot bundle the worker, stop and report.  
**May edit:** `src/interpret/cli.ts`, `src/interpret/cli.test.ts`, `scripts/reading.mjs`, `src/interpret/solve-browser.ts`, `src/interpret/browser.ts`, a test file beside them.

**B5 Meta note.**  
`proposal-worker`, `model: opus`, effort `medium`.  
`docs/meta/solver.md` from what B1 to B4 produced: the encoding, the confirmed group (a) translation table (each row citing its classification table row and grammar anchor), the API and its options, what each job returns, the CLI, and the rule that each new row is confirmed by the user when written. One line in [interpreter.md](../../meta/interpreter.md) under [switches](../../meta/interpreter.md#switches) pointing to it. Report an `AGENTS.md` Editor notes row (solver: translation table, encoding, jobs); the orchestrator applies it.  
**May edit:** `docs/meta/solver.md`, `docs/meta/interpreter.md` (one line).

**R2 Draft the group (b) and (c) rows.**  
`proposal-worker`, `model: opus`, effort `high`.  
As R1, for holders and say words (group (b)) and because, contrary-to and fault (group (c)), reading `docs/meta/solver.md` for the encoding. For group (c), also draft the attack relation *what stands* uses: which stated relations count as an attack between two readings, and which semantics a consumer gets by default (grounded, with stable and preferred as options). Add F1-style fixtures for each row, checked with `parse.mjs`. Rows go under **Open decisions** with recommendations.  
**May edit:** `src/interpret/fixtures/solve-*`, this proposal (Open decisions and Findings only).

**Order:** B1, B2, B3, B4, B5, R2, in sequence (shared files). The orchestrator applies the `AGENTS.md` row after B5 and commits it with B5. **Stop for the user to confirm the group (b) and (c) rows.**

### Phase 3: build groups (b) and (c), and what stands

**B6 Holders and say words.**  
`proposal-worker`, `model: opus`, effort `high`.  
The confirmed group (b) rows in `translate.ts`, with golden programs and `solve.test.ts` cases: one holder's own beliefs can clash, two holders' never do, a say word's content stays wrapped.  
**May edit:** `src/interpret/translate.ts`, `src/interpret/translate.test.ts`, `src/interpret/solve.test.ts`, `src/interpret/fixtures/solve-*`.

**B7 What stands.**  
`proposal-worker`, `model: opus`, effort `high`.  
The confirmed group (c) rows in `translate.ts`, the attack relation, and `stands(log, options)` in `solve.ts` with the ASPARTIX encodings (grounded by default; stable and preferred as options), credulous through brave and skeptical through cautious consequences. `reading.mjs stands [--semantics S] FILE`. Tests on the R2 fixtures.  
**May edit:** `src/interpret/translate.ts`, `src/interpret/solve.ts`, their tests, `src/interpret/cli.ts`, `scripts/reading.mjs`, `src/interpret/fixtures/solve-*`.

**B8 Meta note, groups (b) and (c).**  
`proposal-worker`, `model: sonnet`, effort `medium`.  
Add the confirmed rows, the attack relation, `stands` and its CLI to `docs/meta/solver.md`. Report any change to the `AGENTS.md` row.  
**May edit:** `docs/meta/solver.md`.

**Order:** B6, B7, B8, in sequence. Then the final gate, and the orchestrator deletes this proposal ([consolidate](../../meta/procedures/proposals.md#consolidate)).

### Rule digest (pasted into every brief)

```
- Work only on your unit's items and files. Read AGENTS.md; never trust a form from memory.
- Ageben forms come from grammar pages and the parser. Check forms with one batched
  node scripts/parse.mjs --check-lexicon '<a>' '<b>' ...; keep --llm-prompt for working out
  what a sentence means. Root spellings come from npm run convert-word.
- No new grammar. A sentence that needs a form the grammar lacks is logged as a finding with
  the English and the nearest workaround; then move on.
- Tooling only: a translation row copies what a grammar page and the interpreter's
  classification table already say, and cites both. A meaning neither states is an open
  decision for the user, never a choice you make.
- Code: TypeScript, Node >= 24, run with npx --no-install tsx; tests with tsx --test beside the
  source (*.test.ts). Only src/interpret/solve.ts (and solve-browser.ts) import clingo-wasm.
- Never walk the parse tree; read Readings. Fitting is match()'s; step conditions are steps.ts's.
  If a reading lacks what the translator needs, stop and report: the fix is a classification
  table row, not a local walker.
- Clingo programs keep to the Clingo 5 / 6 common ground: no conditional literals in rule
  bodies, no _ inside not, no integer division.
- The loop (run) and host verdicts stay synchronous; never call the solver from them.
- Never link to a file under docs/proposals/; name it in backticks.
- Read slices: grep -n '^#' or npm run -s outline first, then the line ranges you need.
- Edits that repeat go in a script file under the scratchpad or tmp/scratch/, never inline.
- Verify with npm run verify -- --allow-generate (--fast inside an item); never paste raw build
  output. On a new error, read only that line of tmp/logs/verify-last.log.
- Do not commit; the orchestrator commits.
- Stop and report instead of working around: a premise no longer holds, later units would need a
  different design, or skipping would leave a broken state.
- At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls.
  If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a
  clean point, leave the tree green, and report: done, left (as steps), files touched.
- Report (about 150 words): done; files touched (count); verify line; findings or decisions
  logged; skips with reasons; AGENTS.md lines to change; anything the orchestrator must run;
  left; inefficient. Add the encoding or ids a later unit is briefed from.
```

Full rules a subagent may open if the digest does not settle a question: [interpreter.md](../../meta/interpreter.md) ([matching](../../meta/interpreter.md#matching), [the host](../../meta/interpreter.md#the-host), [scope statements](../../meta/interpreter.md#scope-statements)), [read-ageben.md](../../meta/procedures/read-ageben.md), and this proposal's [Sketch](#sketch) and [Research](#research).

### Gates and commits

- `npm run verify -- --baseline` at the start of each phase; `npm run verify -- --allow-generate` after each unit, before its commit.
- Final gate, at the end of phase 3: a full `npm run verify` that passes against an empty baseline (it runs the build and the tests).
- One commit per unit, after its gate: `clingo-solver <ID>: … [skip-cd]` with the co-author line. S1 commits the dependency with its Research. R1 and R2 commit only the proposal.
- Each phase ends with a commit of the consolidated proposal: phase 1 about 5 commits, phase 2 about 7, phase 3 about 4 (the last deletes the proposal). About 16 in all.

## Open decisions

None open for phase 1. R1 adds the group (a) translation rows here, and R2 the group (b) and (c) rows and the attack relation, each with options and a **Recommendation:**; the next phase waits for them.

## Findings

*(F1 and R2 write here: each sentence the grammar could not say, with its English and the workaround used.)*

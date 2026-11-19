# Solver

<!-- retie: skip -->

**Status:** group (a) rows built; jobs, CLI and browser entry shipped  
**Design authority:** [`docs/grammar/`](../grammar/introduction.md) through the [classification table](interpreter.md#classification-table). A row copies what a grammar anchor and its classification row already say; it never decides a reading.

The solver answers questions that take more than one step over a log: *does this follow*, *could this be*, *what clashes*, *what to give up*, *why not*. It translates the log's [readings](interpreter.md#terms) to a Clingo program and runs it with `clingo-wasm`. This note owns the encoding, the translation table, the jobs and their options, what each job returns, and the CLI. The one-step matcher, its steps and its switches stay in [interpreter](interpreter.md#matching).

Files: `src/interpret/translate.ts` (log to program), `src/interpret/solve.ts` (the jobs; the only file that imports `clingo-wasm`), `src/interpret/solve-browser.ts` (the browser entry), and `src/interpret/steps.ts` (step conditions shared with the matcher). Goldens are `src/interpret/fixtures/solve-*.lp`, each beside its `solve-*.txt` fixture.

## Adding a row

Each new row is confirmed by the user when it is written: the row, its classification table row, its grammar anchor, and a fixture that shows it. A construction with no row is left out and reported (see [the edge](#the-edge)); an agent never writes a row the user has not confirmed. A meaning that neither a grammar page nor the classification table states is an open decision for the user, not a row.

Every row keeps to the Clingo 5 / 6 common ground: no conditional literals in rule bodies, no `_` inside `not`, no integer division. Fitting is `match()`'s and step conditions are `steps.ts`'s; the translator never walks the parse tree. If a reading lacks what a row needs, the fix is a classification table row.

## Encoding

- **One predicate.** A claim is `holds(T)`, with every claim term inside it. A classification is `holds(isa(X, K))`, so a step rule can name the kind as a variable.
- **Denial is `holds(neg(T))`**, not `-holds(T)`: Clingo's strong negation forbids `holds(P), -holds(P)` in every world, so no `clash` atom could be derived.
- **Claim terms.** A plain claim is `<verbRoot>(z(..), d(..), b(..), g(K), w(dt(Key, Words), ..))` with only the roles present, where the translator writes root ids. A classification is `isa(Z, K)`; there is no `be(..)`. A list verb or a root whose name the encoding reserves is `act(Verb, ..)`.
- **Things.** A named thing is its root id. A first-mention noun is `nm(Id, Place)` (Place `z`, `d`, `b`, `d1`, …), one fresh constant per reading and role, with facts `holds(isa(..))`, `count(nm, V)` or `count(nm, rng(A, B, Hook))`, and `detail(nm, dt)`. Two readings of *a dog* are two dogs; a question still matches by root ([question filters](interpreter.md#question-filters)). A list is `ls(Id, Place)`.
- **Values.** `v(3)`, `pct`, `pts`, `rk`, `rke`, `cd`, `inf` / `ninf`, or `w("raw")` when the word has no value.
- **Readings.** A reading id is a Clingo string, and every translated reading gets a fact `on("t:0.2").` Every rule carries its `on(Id)`; a job swaps the fact for a choice to re-solve without it.
- **Fits.** `fits(Q, T)` means `match(Q, T)` succeeds: T says at least Q. Facts are computed before solving, against every ground term the log holds (stated claims, nested clauses, universal templates with their members). Slots: `c(Id)` (a hinge's condition), `o(Id)` (its outcome), `i(Id, K)` (an item of a whole-list denial). Each slot is matched both ways against every ground term, and each denied term against every other term.
- **Provenance.** Each rule has a twin `fired(Id, C)` with the same body (C the `holds` argument; for other heads `notall(Id)`, `none(Id)`, `always(T)`, `count(..)`), and `used(Id, C, Premise)` for each `holds` literal in its body (not `member`, `fits`, `on`). *Why* is a walk over the answer set from a conclusion through `used` to the readings whose `fired` produced each premise.
- **Facts from steps.** `member(ls, X, Index)` (the index pairs *respectively*), `head(C, H)` chained, `less`, `same`, `within`.
- **Generic rules**, in every program:

  ```prolog
  clash(P) :- holds(P), holds(neg(P)).
  clash(Q) :- holds(neg(Q)), holds(P), fits(Q, P).
  holds(isa(X, H)) :- holds(isa(X, C)), head(C, H), switch(widen).
  holds(neg(P)) :- candidate(P), not holds(P), switch(closed).
  ```

  The widen rule has its `fired(widen, ..)` and `used(widen, ..)` twins.
- **Switches** are facts: `switch(widen)`, `switch(defaults)`, `switch(closed)`. Closed world adds `candidate(P)` for each term the log or the question mentions.
- **Lookups.** `Translation.terms` maps each ground term to its claim, so a question is matched in TypeScript; `inRange` decides a question's fit to a `within` fact.
- **Size.** A program text over about 1 MiB fails in `clingo-wasm`, whose fixed WebAssembly stack the text is copied onto; the jobs refuse it first (`maxBytes`). One `holds/1` keeps the rules one line each; a predicate per root grounds faster and waits until a consumer needs the speed.

## Translation table

Templates name things in English for reading; the program writes root ids. `T[X]` is a universal's template with its member as `X`: Clingo cannot substitute into a stored term, so the template is emitted per reading as a rule over `X`. Each row's `fired` and `used` twins are left out below.

| # | Row | Classification row | Grammar anchor | Program |
|---|-----|--------------------|----------------|---------|
| 1 | Plain claim | `unit:vp`, `unit:np`, `unit:predicate` | `clause.md#who-acts-and-the-action`, `predication.md#identity` | `holds(T) :- on(Id).` A predicate `/ɡ/` gives `holds(isa(X, K))` |
| 2 | Denial on a verb or a term: each item denied, the rest of the clause stands | `joinSeries:u` (frame:polarity, list reach) | `joins.md#negation-u`, `verb-and-stance-joins.md#vp-clause-forms` | `holds(neg(T[item])) :- on(Id).` for each item; open `-m` denies the same items |
| 3 | A clash: a claim and its denial | (generic, over rows 1 and 2) | `joins.md#negation-u` | `clash(P) :- holds(P), holds(neg(P)).` and, where the terms differ but fit, `clash(Q) :- holds(neg(Q)), holds(P), fits(Q, P).` |
| 4 | Whole-list denial (*not both*) | `joinSeries:u` over a closed list as its one item | `set-joins.md#exclusivity-and-denying-a-whole-list` | `clash(notall(Id)) :- fits(i(Id, 1), P1), holds(P1), fits(i(Id, 2), P2), holds(P2), on(Id).` |
| 5 | If: the outcome holds whenever the condition does; the condition is not claimed | `overlay:clause_hinge:th`, `overlay:clause_hinge:g` (frame:hinge) | `causation.md#if` | `holds(Out) :- fits(c(Id), P), holds(P), on(Id).` and back, `holds(neg(Cond)) :- fits(P, o(Id)), holds(neg(P)), on(Id).` |
| 6 | Only if: the outcome cannot hold without the condition | as row 5 | `causation.md#only-if` | `holds(neg(Out)) :- fits(P, c(Id)), holds(neg(P)), on(Id).` and back, `holds(Cond) :- fits(o(Id), P), holds(P), on(Id).` |
| 7 | Iff | as row 5 (`thehom`) | `causation.md#only-if` | Rows 5 and 6 together |
| 8 | Closed every kind; *no K* with the head denied | `joinSeries:ua` + `shared:kind`; `joinSeries:u:kind` (frame:binder), step `universalInstance` | `universals-domains.md#universals-domains-generics`, `usually-vs-must.md#general-claims` | `holds(T[X]) :- holds(isa(X, K)), on(Id).`; with the verb denied (`zual gogozel vezuvel vul.`, `zul gawozal vewobol.`) the head is `holds(neg(T[X]))`. A hinge on it takes `holds(isa(X, K))` in its body (`usually-vs-must.md#how-things-work`) |
| 9 | *No K* with no verb: the kind is denied | `joinSeries:u:kind` + `shared:kind` | `universals-domains.md#universals-domains-generics` | `clash(none(Id)) :- holds(isa(X, K)), on(Id).` (`zul godozel.`) |
| 10 | Open every kind | `joinSeries:ua` (`zuam`) + `shared:kind` | `universals-domains.md#not-every` | `{ holds(T[X]) } :- holds(isa(X, K)), not holds(neg(T[X])), on(Id).`; with `switch(defaults)` the same body derives `holds(T[X])` |
| 11 | Membership; *respectively* pairs by index | `joinSeries:a`, steps `memberList`, `claimMemberLists`, `collective` | `joins.md#and-lists-a`, `list-structure.md#respectively` | The claim keeps its list term, and `holds(T[X]) :- member(ls(Id, z), X, G), on(Id).`; paired, `holds(T[X, Y]) :- member(ls(Id, z), X, G), member(ls(Id, d), Y, G), on(Id).` Two unpaired lists and a collective `-x` verb get no `member` facts |
| 12 | Compound head (switch `widen`) | step `compoundHeads` | `compounds.md#two-roots-one-word` | `head(C, H).` facts and the generic widen rule; it runs only from compound to head |
| 13 | Numbers | `wordFamily:number`, `lexReading:number` | `numbers.md#counts` | `count(nm(Id, P), V)`; `less(V1, V2)` or `same(V1, V2)` from `compareValues` for each pair of values; `within(V, R)` for each value and each stated range or ray (`ranges.md#ranges`, `open-ranges.md#rays`). A number word with no value gets no facts |
| 14 | First-mention noun | `slot:newMember` (frame:binder) | `joins.md#everything-ua` | `nm(Id, P)` with `holds(isa(nm(Id, P), K)) :- on(Id).` and its count and details. A denial *not … a dog* takes row 2 on the root's kind |
| 15 | Bare *always* / *never* | `lexReading:restrictor` (`hual`, `hal`, `huam`) | `restrictors.md#always-hual`, `restrictors.md#only-when-never-hal` | Bare `hual` + P: row 1 plus the marker `always(P)`; bare `hal`: row 2 plus `never(P)`; open `huam`: row 10's choice rule. With listed exceptions or occasions, only the marker |
| 16 | Standalone `thul`, `thum`, `thur` | `joinSeries:u` on `/th/` (frame:polarity) | `verb-and-stance-joins.md#standalone-stance-joins` | Row 1, with the frame kept in `Translation.notes` so a reply can mention it (`zazozon vowurol thul.`) |
| 17 | *More cats than dogs* with no counts | `joinSeries:o` with a shared scale word | `comparative-arity.md#amount-scale` | `holds(more(amount, cats, dogs))`: data, answered only when asked as said, with no link to stated counts |

Notes on the rows:

- **Only if (row 6).** A denied P rules out the condition only when the condition says at least P, so the fit runs from P to `c(Id)`; when the terms are equal this is the plain row.
- **Whole-list denial (row 4)** joins each item on `fits(i(Id, K), Pk)`, so a claim that says at least the item counts.
- **Listed exceptions (row 15).** Any `unit:h` adverb in a `hual` / `hal` claim counts as listed exceptions (marker only), since the reader does not attach the occasions to the restrictor frame.
- **A hinge on a command** makes no claim (`causation.md#if`); the force frame has no row, so the turn is `beyond`.
- **Steps always on.** Membership and closed universal to instance always run in a solver job, since the pages state them as what the sentence says. `widen` stays a switch, named in the answer, since a compound's head is the lexicon's.

## The edge

`Translation.left` lists each reading left out whole (a frame with no row), as `unread` is; a job answers from the rest and returns the list. The translator also reports:

- A hinge on a universal gets only the forward rule; its condition must not mention `X`.
- `speaker` and `listener` are constants, not tied to the turn.
- Two denial lists in one clause have no row.
- Shared details after a join are not facts on first-mention members.

No row yet: *or* (`e` lists) and *maybe*; group (b), holders and say words; group (c), *because*, *contrary to*, and fault; fill questions; a denial of a stance (`thomam thul`), which waits for the stance's row.

## Jobs

`solve.ts` exports each job as an async function over `log` (its `readings`). Options (`SolveOptions`):

| Option | Effect |
|--------|--------|
| `lexicon` | The parser's lexicon tables: compound heads for `widen`, in the program and in the question's match |
| `widen` | A compound holds of its head (row 12) |
| `defaults` | Everyday defaults for open universals (row 10) |
| `closedWorld` | Every term the log or the question mentions that does not hold is denied |
| `maxBytes` | The program size refused past; `MAX_PROGRAM_BYTES` (1 MiB) by default |

| Job | Returns |
|-----|---------|
| `follows(log, question)` | `Answer`: cautious, what holds in every world |
| `couldBe(log, question)` | `Answer`: brave, what holds in some world |
| `clashes(log)` | `{clashes, left, refused?}`; each `Clash` has `atom`, `readings` (log order), `switches`, `english` |
| `giveUp(log)` | `{giveUp, english?, left, refused?}`: a smallest set of readings whose removal leaves a world with no clash. English: "Giving up X resolves every clash." |
| `whyNot(log, claim)` | `{clash?, left, verdict?: "beyond", refused?}`: the smallest clash the claim joins, the claim itself left out. English: "That cannot hold with X, Y." |

**`Answer`** is `{verdict, because, switches, left, english?}`. `verdict` is `yes`, `no`, `unknown`, `both` (the claim and its denial both follow), `beyond` (the question has a frame with no row), or `refused` (program over `maxBytes`, or Clingo failed), with `english` saying why. `because` lists the reading ids behind the answer in log order; `switches` names each switch the answer used.

**The question** goes in as one more reading with its claim switched off, but a first-mention noun's facts stay on as a witness, an arbitrary member of its kind, so *a cat sleeps?* reaches a closed `zual` universal as the matcher's `infer` step does. Each `holds` atom is matched against the question with `match()`; `holds(neg(T))` gives *no* when `match(T, question)` succeeds; a range on a question noun is decided by `inRange` against the stated count.

**Clashes.** With one world, the readings come from walking back through `fired` / `used`, trimmed by one removal pass that re-solves. With more than one world (a choice rule), the switch atoms go free: QuickXplain finds one smallest clash, and a hitting-set tree (capped at 256 nodes) finds every smallest clash. Under choices, a set of readings clashes when none of its worlds is free of `clash` atoms. `Clash.atom` is an atom true in every world of the clash's readings if there is one, else one true in some world. `giveUp` is one optimization run: every `on(..)` a free choice, `:- clash(P).`, and a weak constraint per reading to keep it. `whyNot` runs QuickXplain with the claim held fixed; if the log clashes without it, it returns the smallest clash that contains it.

**Browser.** `solve-browser.ts` exports the same five jobs, each loading `solve.ts` on its first call; `browser.ts` re-exports them. A page that imports them needs `build.target: 'es2022'` (or `'esnext'`) in the site's Vite config, since the `clingo-wasm` worker uses top-level await.

The [loop](interpreter.md#the-loop) and host verdicts stay synchronous and never call the solver.

## CLI

```sh
node scripts/reading.mjs solve [--json] [--possible] [--defaults] [--closed] [--window N] FILE '<question>'
node scripts/reading.mjs clashes [--json] [--give-up] [--window N] FILE
```

`solve` runs `follows` (`couldBe` with `--possible`) and prints `verdict`; `reply` (the spelled yes / no / I can't say, or *these cannot all hold* for `both`); `english` when refused or beyond; `why` (each reading id with `[at] speaker: text`); `switches`; `left`. `clashes` prints each clash with its atom and readings, `no clash` when none, and the set to give up with `--give-up`. A refused run exits 1. Replies come from `clashReply` and `giveUpReply` in `reply.ts`.

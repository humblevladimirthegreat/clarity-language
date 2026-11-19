# Solver

<!-- retie: skip -->

**Status:** rows built for plain claims, holders, say words, *because*, contrary-to, MAY and *or*; jobs, CLI and browser entry shipped  
**Design authority:** [`docs/grammar/`](../grammar/introduction.md) through the [classification table](interpreter.md#classification-table). A row copies what a grammar anchor and its classification row already say; it never decides a reading.

The solver answers questions that take more than one step over a log: *does this follow*, *could this be*, *what clashes*, *what to give up*, *why not*, *what stands*. It translates the log's [readings](interpreter.md#terms) to a Clingo program and runs it with `clingo-wasm`. This note owns the encoding, the translation table, the jobs and their options, what each job returns, and the CLI. The one-step matcher, its steps and its switches stay in [interpreter](interpreter.md#matching).

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
| 8 | Closed every kind; *no K* with the head denied | `joinSeries:ua` + `shared:kind`; `joinSeries:u:kind` (frame:binder), step `universalInstance` | `universals-domains.md#universals-domains-generics`, `usually-vs-must.md#general-claims` | `holds(T[X]) :- holds(isa(X, K)), on(Id).`; with the verb denied (`zual gogozel vezuvel vul.`, `zul gobozal vewobol.`) the head is `holds(neg(T[X]))`. A hinge on it takes `holds(isa(X, K))` in its body (`usually-vs-must.md#how-things-work`) |
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

### Holders and say words

Each row reads one classification row and copies what its anchor states. A reply names the holder: *In Azozon's view these cannot all hold: b1, b2.* (`Clash.english`).

1. **A holder's view** (`xFamily:holder` with its host `overlay:evidential:th` or `overlay:may:th`; `holder.md#what-the-holder-covers`). `holds(view(H, T)) :- on(Id).`, a denial inside it `holds(view(H, neg(T))) :- on(Id).`, never `holds(T)`. The seam word's channel is data, `via(Id, Channel)`, outside the term, so two reports of one holder by different channels meet. One holder's views clash through the generic rules, wrapped: `clash(view(H, P)) :- holds(view(H, P)), holds(view(H, neg(P))).` and its `fits` form; two holders differ in `H` and never clash, and a view never clashes with your claim. The clash is the log's, so `clashes`, `giveUp`, `whyNot` and `both` see it.
2. **A carried holder** (`carry:holder`; `holder.md#naming-a-holder`): the later reading takes row 1 with the `H` of the reading it links to, and gives no `holds(T)`.
3. **Who the holder is.** A name is its root id; `-n` / `-ln` is `named` and keyed by root, and a `-r` holder is `named` with the root it resumes (no binding, so keyed by root); the topic pronoun resolves through `throughAntecedent`. A kind of person or a bare kind (`theyomeyel`, *someone*) is a first-mention noun, `nm(Id, h)` with its `isa` fact, so two such holders are two people. The associative `-x` is `grp(R)`, the interlocutors `interlocutors`, the generic pronoun `generic`: each its own holder, with nothing passing between them or into your claims. The generic view is one holder, so two generic views can clash.
4. **Inference inside one view.** The holder's own stated rules (rows 5 to 11, and the *because* and *or* rows) run inside the view: `holds(view(H, Out)) :- fits(c(Id), P), holds(view(H, P)), on(Id).`, likewise for universals and membership. Your own rules never reach a view.
5. **A say word** (`wordFamily:say`; `permission-consent.md#say-words`). `holds(say(Who, Part, Reach, Answer, Ending, T)) :- on(Id).` and no `holds(T)`: every say word is wrapped, consent too (the vow `zuwen vowurol hwuzal.` is consent with no act yet). `Who` is the hosted `bl-` word when there is one; else on `v` it is `sp("<turn speaker>")` for `-m` (`uwen` in a role is the same turn speaker; a question has no turn, so its speaker stays `speaker`), `rules` for `-l`, `unsaid` for `-r`; on `z`, `d`, `b` it is that role's filler. Pair reach `e` on `z` / `d` / `b` keeps its `bl-` word as a seventh argument, `to(X)`.
6. **Which say words clash.** Same `Who`, `Part`, `Reach`, `Ending` and a fitting act, with answers `a` and `u`, or `o` and `u`: `clash(say(W, P, R, u, E, T)) :- holds(say(W, P, R, a, E, T)), holds(say(W, P, R, u, E, T)).`, the `o` line, and the `fits` forms. Another party, source, ending or reach never clashes; `e` (*their call*) clashes with nothing. A standing grant and this episode's ban, or two parties, stand together.
7. **A requirement gives permission.** `holds(say(W, P, R, a, E, T)) :- holds(say(W, P, R, o, E, T)).` (`fired` id `requires`). After *the rules require Azozon to walk*, *may Azozon walk?* answers *yes*.
8. **A ban denies the matching permission** (user, 2026-11-19; `permission-consent.md#requirement`: "A ban takes permission away"). `holds(neg(say(W, P, R, a, E, Q))) :- holds(say(W, P, R, u, E, T)), fits(T, Q).` and the plain form, `fired` id `bans`. After *the rules forbid Azozon walking*, *may Azozon walk?* answers *no*, citing the ban (`hits` reads a wrapped `neg(say(..))`). A requirement plus a ban still clashes.
9. **An act against a stated say word.** `holds(against(T, say(W, P, R, u, E))) :- holds(T), holds(say(W, P, R, u, E, T)).` (`fired` id `against`): the atom `uom hwuvul` gives, never a clash, whatever the speaker said. Only answer `u`.

`requires`, `against`, `bans` and `widen` are the generic `fired` ids; `explain` leaves the first three out of `because`. Every golden `.lp` carries the 36 shared generic lines.

### Because, fault and contrary-to

10. **Because** (`overlay:clause_hinge:th` / `:g` with gloss `because`; `because-and-iff.md#choosing-a-hinge`): `holds(Out) :- on(Id).`, `holds(Cond) :- on(Id).`, `holds(cause(Cond, Out)) :- on(Id).` *Enough* adds no rule while both sides are claimed. A first-mention noun in the condition reads as its kind (no `isa` facts).
11. **Not because** (`joinSeries:u` in the hinge's stance list; `verb-and-stance-joins.md#stance-joins`): `holds(Out) :- on(Id).` and `holds(neg(cause(Cond, Out))) :- on(Id).` The condition stays unstated: no `holds(Cond)`. It clashes with *partly because* and with fault, since all three endings share one link `cause(C, O)`.
12. **Fault and share** (`because.fault` on `-l`, `because.share` on `-r`; `fault.md#fault`): row 10 plus the marker `holds(fault(C, O))` or `holds(share(C, O))`. `fault` is a marker only: it claims no fault from `thahum`, denies none, and never meets a say word.
13. **Only because** (`thebem` then `thahum`): row 10 plus row 6 on the same condition. A stacked `thebem` with no `/b/` of its own shares the following `thahum`'s `hosted` term, and links its own `grounds` when the condition is the next sentence.
14. **Contrary to** (`hookJob:zone`, frame:contrary; `contrary-to.md#contrary-to-holder`: "the event is still your claim"): `holds(T) :- on(Id).` and `holds(against(T, Z)) :- on(Id).`, with `Z` = `plan(H)` (a plan with no holder is the turn speaker's, `plan(sp("…"))`), `channel(Gloss, H)`, or `say(W, P, R, A, E[, to])`. A say-word zone uses the say word's own answer and also claims the wrapped say word, so it clashes with a say word of the other answer and *do the rules forbid it?* answers *yes*; a plan or channel zone gives only the marker, never a clash.

### MAY and *or*: worlds

MAY and *or* make several worlds, so MAY alone never makes anything follow.

15. **MAY on a claim** (`overlay:may:th`; `knowing.md#may`): `{ holds(T) } :- on(Id).` plus `holds(may(T)) :- on(Id).` (under a MAY holder, `may(view(H, T))`). The ending (`thomal`, `thomam`, `thomar`) adds no rule and is kept in `Translation.notes`. Possibly not (`joinSeries:u` on the verb under MAY): `{ holds(neg(T)) } :- on(Id).` MAY denied (`thomam thul`, `joinSeries:u` in the stance list): row 1's `holds(T)`, frame in `notes` as row 16.
16. **A holder on MAY**: `{ holds(view(H, T)) } :- on(Id).` and `{ holds(view(H, neg(T))) } :- on(Id).`; a later bare sentence it carries to is a plain view. The holder's own MAY is the wrap flag `Wrap.may`, writing `holds(view(H, may(T))) :- on(Id).`, which never meets `view(H, T)` or `view(H, neg(T))`; row 4 does not run on it.
17. **MAY over a hinge or an *or* list** (order `overlay:may:th > overlay:clause_hinge:th`, or text order over a list term): a gate `{ maybe(Id) } :- on(Id).`, and every rule of the content takes `maybe(Id)` beside `on(Id)`. **A hinge over MAY** (the `blarth` hinge first; its condition resolves through the `standInBack` link, `byId`): row 5's forward rule as a choice, `{ holds(Out) } :- fits(c(Id), P), holds(P), on(Id).`, and no backward rule.
18. **MAY on a hinge's condition** (`causation.md#if`): the condition is the possibility. A stated T gives `may(T)` by a rule inside each hinge with a MAY condition, not one generic rule (that would loop `may(may(..))`); the hinge's body takes `holds(may(T))` in place of `holds(P)`. No `holds(may(T))` for estimates or for a hinge over MAY. A stated *not T* does not withdraw it.
19. **Degrees** (`thraremol`, `th+`, `th+100`, `th+0`; `th-` too): an estimate is row 15's choice with the figure as data, `likely(Id, V)`, so a 0% estimate still *could be*. `thrawal` (certain) is a plain claim and `thramowal` (no chance) a denial.
20. **The *or* bounds** (`joinSeries:e`, `joinSeries:ae`; `joins.md#choice-e`, `set-joins.md#exclusivity-and-denying-a-whole-list`): `el` exactly one, `em` at most one, `ael` and `aem` at least one. Each item k of the reading's list term is a choice, `{ holds(T[k]) } :- on(Id).` (no `member` facts), and the bounds are clash atoms plus plain rules, no hard constraint, so a log that breaks a bound keeps a world with a `clash` atom. For `el` and `ae`: `some(Id) :- holds(T[k]), on(Id).` per item and `clash(noneof(Id)) :- on(Id), not some(Id).`, plus `holds(T[k]) :- holds(neg(T[j])), …, on(Id).` with every other item denied. For `el` and `em`: `holds(neg(T[j])) :- holds(T[k]), on(Id).` per pair. Each joins on `fits(i(Id, K), P)`. Open `aem` adds no rule, since the solver has no term for an item not listed.
21. **Whole-list denial of an *or* list** (`joinSeries:u` over a closed `e` / `ae` list): `vael vul` denies at least one, each item denied. `vel vul` (not exactly one): for each item k, `clash(notone(Id)) :- holds(T[k]), holds(neg(T[j])), …, on(Id).` with every other item denied, joined on `fits(i(Id, K), P)`; with two items also `holds(T[2]) :- holds(T[1]), on(Id).` and `holds(neg(T[2])) :- holds(neg(T[1])), on(Id).`, both ways. `vem vul` (at least two) adds the same clash with no item held.

New reserved names: `bans`, `cause`, `fault`, `share`, `plan`, `channel`, `maybe`, `likely`, `some`, `noneof`, `notone`, `may`, `view`, `say`, `grp`, `interlocutors`, `generic`.

### Which worlds a job reads

**Clash-free worlds first.** `follows` and `couldBe` add `:- clash(P).` and solve; if no world is left, they answer from every world, where the log's own clash shows as `both`. A one-world log answers as before. Reasoning by cases then holds: *A or B; if A then C; if B then C* gives C. *Maybe P* never clashes with *not P* or with *P*, so a later settled guess reads as an update: *maybe Alazun left* then *Alazun didn't leave* has no clash, and `couldBe` *did Alazun leave?* gives *no*. With a MAY holder, one world holds both views and the clash, the other does not, so `couldBe` gives *yes* and `clashes` none (m7 + m8, settled: *no* for `couldBe` of the stale reading). A `not P?` question is read as P with the answer flipped (`positive()`). Fewest clashes (`#minimize`) may come later.

### What stands
<a id="what-stands"></a>

The attack relation. Arguments are the log's readings, `arg(Id) :- on(Id).`; a nested reading (a hinge's clause, a quote) belongs to its reading. For each clash, the readings whose `fired` gives its two sides attack each other, both ways: `att(A, B) :- fired(A, P), fired(B, neg(P)).` and the reverse, with the `fits` form, the `view` form, and, for `notall(Id)` and `none(Id)`, the denying reading against each reading that fired an item. `rebut/2` covers plain claims, the `fits` form, the view form, `notall` and `none`; `src/2` follows the generic ids (`requires`, `against`, `bans`, `widen`) back through `used`. A clash's premises are not attacked; a reading whose own atoms clash attacks itself. An open universal never fires against a stated denial, so it neither attacks nor is attacked. Under choices, attacks come from the brave `fired` atoms of a first run (the program plus `ATTACKS`), and the `att` facts feed an ASPARTIX program in a second run.

`stands(log, {semantics})` labels each translated reading `in`, `out` (attacked by a reading that is in) or `undec`; semantics are `grounded` (default), `stable` or `preferred`. `in` is skeptical (in every extension), and `credulous` is brave (in some). With every attack mutual, grounded is exactly the unattacked readings, and the semantics differ only once a one-way attack exists (a host's own `att` facts, which may come later). Example: c1 + c2 + c13 give `att(c1, c2)` and `att(c2, c1)`; grounded gives c13 in and c1, c2 undecided; preferred gives {c1, c13} and {c2, c13}.

## The edge

`Translation.left` lists each reading left out whole (a frame with no row), as `unread` is; a job answers from the rest and returns the list. The translator also reports:

- A hinge on a universal gets only the forward rule; its condition must not mention `X`.
- `speaker` and `listener` are constants; only a say word's `Who` is tied to the turn (`sp("…")`).
- Two denial lists in one clause have no row.
- Shared details after a join are not facts on first-mention members.

Left out, by area (each stays in `left` or is named in an answer):

- **Holders.** A topic-pronoun holder (the reader gives no antecedent); a speaker or listener holder. A holder after `uom` (`uom thebamalazun`): the reader's holder frame after `uom` carries no party and no channel gloss, a `readHook` zone gap in `read.ts`, so a contrary channel zone with a holder is out. The `/ɡ/` stack on a noun (`gebem gahum`): the reader does not give it a row; it stays in `left`. A noun condition on *because* (`gahum blugalal`).
- **Say words.** A say word with a hinge or a universal; membership inside a say word; a restrictor, whole-list denial or *no K* inside a holder's wrap.
- **Because and contrary-to.** *Because* with MAY, a holder, a say word, a restrictor or *or*; contrary-to on anything but a plain claim.
- **MAY.** Only-if or iff with MAY, on the condition or under the hinge; MAY over members or a whole-list denial; MAY with a carried holder; MAY with a say word, universal or restrictor; MAY in a question (`yel … thomal`); `vaem vul`.
- **Or.** `ue` and `oe` lists.
- **Numbers.** Other stance-number markers (`th_N`, `th#N`).
- **Fill questions.**

## Jobs

`solve.ts` exports each job as an async function over `log` (its `readings`). Options (`SolveOptions`):

| Option | Effect |
|--------|--------|
| `lexicon` | The parser's lexicon tables: compound heads for `widen`, in the program and in the question's match |
| `widen` | A compound holds of its head (row 12) |
| `defaults` | Everyday defaults for open universals (row 10) |
| `closedWorld` | Every term the log or the question mentions that does not hold is denied |
| `maxBytes` | The program size refused past; `MAX_PROGRAM_BYTES` (1 MiB) by default |
| `semantics` | `stands` only: `grounded` (default), `stable`, `preferred` |

| Job | Returns |
|-----|---------|
| `follows(log, question)` | `Answer`: cautious, what holds in every world |
| `couldBe(log, question)` | `Answer`: brave, what holds in some world |
| `clashes(log)` | `{clashes, left, refused?}`; each `Clash` has `atom`, `readings` (log order), `switches`, `english` |
| `giveUp(log)` | `{giveUp, english?, left, refused?}`: a smallest set of readings whose removal leaves a world with no clash. English: "Giving up X resolves every clash." |
| `stands(log, {semantics})` | `{semantics, stands, attacks, extensions, english?, left, refused?}`: `stands` is each reading with `label` (`in` / `out` / `undec`) and `credulous`; `attacks` is `[attacker, attacked]` pairs; `extensions` is one under grounded, at most `MAX_EXTENSIONS` otherwise. English: "Standing: …. Out: …. Undecided: …." See [What stands](#what-stands) |
| `whyNot(log, claim)` | `{clash?, left, verdict?: "beyond", refused?}`: the smallest clash the claim joins, the claim itself left out. English: "That cannot hold with X, Y." |

**`Answer`** is `{verdict, because, switches, left, english?}`. `verdict` is `yes`, `no`, `unknown`, `both` (the claim and its denial both follow), `beyond` (the question has a frame with no row), or `refused` (program over `maxBytes`, or Clingo failed), with `english` saying why. `because` lists the reading ids behind the answer in log order; `switches` names each switch the answer used.

**The question** goes in as one more reading with its claim switched off, but a first-mention noun's facts stay on as a witness, an arbitrary member of its kind, so *a cat sleeps?* reaches a closed `zual` universal as the matcher's `infer` step does. Each `holds` atom is matched against the question with `match()`; `holds(neg(T))` gives *no* when `match(T, question)` succeeds; a range on a question noun is decided by `inRange` against the stated count.

**Clashes.** With one world, the readings come from walking back through `fired` / `used`, trimmed by one removal pass that re-solves. With more than one world (a choice rule), the switch atoms go free: QuickXplain finds one smallest clash, and a hitting-set tree (capped at 256 nodes) finds every smallest clash. Under choices, a set of readings clashes when none of its worlds is free of `clash` atoms. `Clash.atom` is an atom true in every world of the clash's readings if there is one, else one true in some world. `giveUp` is one optimization run: every `on(..)` a free choice, `:- clash(P).`, and a weak constraint per reading to keep it. `whyNot` runs QuickXplain with the claim held fixed; if the log clashes without it, it returns the smallest clash that contains it.

**Browser.** `solve-browser.ts` exports the same six jobs, each loading `solve.ts` on its first call; `browser.ts` re-exports them. A page that imports them needs `build.target: 'es2022'` (or `'esnext'`) in the site's Vite config, since the `clingo-wasm` worker uses top-level await.

The [loop](interpreter.md#the-loop) and host verdicts stay synchronous and never call the solver.

## CLI

```sh
node scripts/reading.mjs solve [--json] [--possible] [--defaults] [--closed] [--window N] FILE '<question>'
node scripts/reading.mjs clashes [--json] [--give-up] [--window N] FILE
node scripts/reading.mjs stands [--json] [--semantics grounded|stable|preferred] [--window N] FILE
node scripts/reading.mjs probe [--json] [--program] [--possible] [--defaults] [--closed] FILE
```

`solve` runs `follows` (`couldBe` with `--possible`) and prints `verdict`; `reply` (the spelled yes / no / I can't say, or *these cannot all hold* for `both`); `english` when refused or beyond; `why` (each reading id with `[at] speaker: text`); `switches`; `left`. `clashes` prints each clash with its atom and readings, `no clash` when none, and the set to give up with `--give-up`. `stands` prints each reading in, out or undecided, the attacks and the extensions. A refused run exits 1. Replies come from `clashReply` and `giveUpReply` in `reply.ts`.

`probe` (`probe.ts`) runs many independent cases from one FILE, each its own log: a line starting `---` starts a case (the rest of the line is its label), turn lines read as `log` reads them, `? text` asks with `follows` and `?~ text` with `couldBe` (`--possible` makes `?` use `couldBe`). Per case it prints turns that did not parse, `left` (reading, reason, frame key), `note`s, each smallest clash (readings and atom) or `no clash`, and each question's verdict, `because`, switches and its own `left`; `--program` adds the translated program, `--json` one JSON object per line per case. A solve fixture reads as one case, as `translate.test.ts` reads it: `@ id` tags the next turn's readings (`t:0.0=s1`), `= English` is skipped. A failing case is reported in place; only a usage error or an unreadable FILE exits 1.

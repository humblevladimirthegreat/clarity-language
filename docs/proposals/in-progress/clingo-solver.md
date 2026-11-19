# A solver behind the interpreter: Clingo for what follows, what clashes, and what stands

**Status:** IN PROGRESS, 2026-11-19. Phase 1 done (S1, S2, F1, R1); phase 2 done (B0, B1, B2, B3, B4, B5, R2), 2026-11-19. Group (a) is built and its confirmed rows, encoding and jobs are in [solver.md](../../meta/solver.md). Phase 2 departed from the confirmed rows in two places, both recorded there: a denial is `holds(neg(T))`, not `-holds(T)` (Clingo's strong negation makes a claim beside its denial unsatisfiable, so no `clash` atom could be derived); and *only if* fires when the condition says at least the denied term (`fits(P, c(Id))`), which agrees with the row whenever the terms are equal. **Waiting on the user:** confirm the group (b) and (c) rows and decide R2-2 to R2-13 and B3-1 ([Open decisions](#open-decisions)); then phase 3. User, 2026-11-18: the wizard integration comes later; the first jobs are what follows, what clashes and what stands; the matcher's step conditions are shared TypeScript functions that both engines call. Idea 2026-11-14; researched and spiked 2026-11-18 ([Research](#research)).  
**Related:** [solver.md](../../meta/solver.md); the interpreter's reading, log, matcher, host and replies ([interpreter.md](../../meta/interpreter.md), `src/interpret/`, [reading.mjs](../../../scripts/reading.mjs)); grammar pages [holder](/holder), [permission and consent](/permission-consent), [because](/because-and-iff), [fault](/fault), [contrary to](/contrary-to), [causation](/causation); consumers `ageben-spec.md`, `agent-tool-permissions.md`, `argument-map.md`, `knowledge-store.md`, `structural-search.md`, `who-knows-what.md`, `various-interpreter-applications.md`, later `wizard-adventure.md` and `logic-grids.md`; the wizard engine ([wizard-game.md](../../meta/wizard-game.md)).  
**Depends on:** none. `ageben-spec.md` may now switch its contradiction check to the solver.  
**Design authority:** *none*. Tooling only: it adds no form and changes no reading. Each translation row states what the solver concludes from a frame family as the grammar page already teaches it; where a row needs a meaning the grammar pages do not state, that is an open decision for the user, and the row waits.

## Implementation plan

Run with subagents. Phases 1 and 2 are done; phase 3 is left, and starts once the user has confirmed the group (b) and (c) rows. At its end the orchestrator runs the final gate and deletes this proposal ([consolidate](../../meta/procedures/proposals.md#consolidate)).

No unit edits prose under `docs/grammar/`, so there is no style gate and no recall gate.

**What phase 2 left for phase 3.**

- [solver.md](../../meta/solver.md) holds the encoding, the group (a) translation table, the jobs and their options, the CLI, and the edge (what has no row yet). Every unit reads it first; B8 extends it.
- `src/interpret/translate.ts`: `translate(log, {lexicon, switches})` returns `{program, readings, terms, slots, left, notes}`. A reading with no row is listed in `left` with reason `noRow` and the frame's key. `speaker` and `listener` are constants, not tied to the turn: group (b) rows that need the turn's speaker fix that in B6.
- `src/interpret/solve.ts`: `follows`, `couldBe`, `clashes`, `giveUp`, `whyNot` (verdicts yes / no / unknown / `both` / `beyond` / `refused`); clashes under choices by QuickXplain and a hitting-set tree. `stands` is B7's.
- `reading.mjs solve` and `reading.mjs clashes` are in `src/interpret/cli.ts`; `reply.ts` has `clashReply` and `giveUpReply`; `src/interpret/solve-browser.ts` is the browser entry (a site page that imports it needs `build.target: 'es2022'`).
- `translate.test.ts` translates every `src/interpret/fixtures/solve-*.txt`, requires an empty `left`, and writes or checks a golden `solve-*.lp`. R2's fixtures are `draft-holders.txt` (b1–b11), `draft-say.txt` (p1–p9) and `draft-because.txt` (c1–c13); the unit that builds a fixture's rows renames it to `solve-*.txt` with `git mv` and drops or splits out any line whose row the user did not confirm.
- R2's two reader gaps ([Findings](#findings)) are B0b's.

### Phase 3: build groups (b) and (c), and what stands

**B0b Reader fixes for holders and *only because*.**  
`proposal-worker`, `model: opus`, effort `high`.  
The two gaps in [Findings](#findings): a `-n` holder party is marked named on the `xFamily:holder` frame, as the same name in a role is; the stacked `thebem` frame carries its condition (the `thahum` frame's clause), as a link or a note, per `because-and-iff.md#choosing-a-hinge`. A test for each, and the [classification table](../../meta/interpreter.md#classification-table) rows changed in the same edit. If either needs a reading the grammar pages do not state, stop and report.  
**May edit:** `src/interpret/read.ts`, `src/interpret/classes.ts`, their tests, `src/parse/scope.ts` (frame rows only), `src/interpret/coverage-ratchet.json` if the coverage test asks, `docs/meta/interpreter.md` (classification table rows).

**B6 Holders and say words.**  
`proposal-worker`, `model: opus`, effort `high`.  
The confirmed group (b) rows (R2-1 rows 1 to 4 and R2-2 to R2-9 as decided) in `translate.ts`, with golden programs and `solve.test.ts` cases: one holder's own beliefs can clash, two holders' never do, a say word's content stays wrapped. `git mv` `draft-holders.txt` and `draft-say.txt` to `solve-*`.  
**May edit:** `src/interpret/translate.ts`, `src/interpret/translate.test.ts`, `src/interpret/solve.ts` (only where a decided row changes a verdict or a reply, such as a holder named in a clash), `src/interpret/solve.test.ts`, `src/interpret/fixtures/solve-*`, `src/interpret/fixtures/draft-*`.

**B7 What stands.**  
`proposal-worker`, `model: opus`, effort `high`.  
The confirmed group (c) rows (R2-1 rows 5 to 9, R2-10, R2-11) in `translate.ts`, the attack relation (R2-12), and `stands(log, options)` in `solve.ts` with the ASPARTIX encodings (R2-13), credulous through brave and skeptical through cautious consequences. `reading.mjs stands [--semantics S] FILE`. Tests on the R2 fixtures; `git mv` `draft-because.txt` to `solve-because.txt`.  
**May edit:** `src/interpret/translate.ts`, `src/interpret/solve.ts`, their tests, `src/interpret/cli.ts`, `src/interpret/cli.test.ts`, `scripts/reading.mjs`, `src/interpret/solve-browser.ts`, `src/interpret/browser.ts`, `src/interpret/fixtures/solve-*`, `src/interpret/fixtures/draft-*`.

**B8 Meta note, groups (b) and (c).**  
`proposal-worker`, `model: sonnet`, effort `medium`.  
Add the confirmed rows, the attack relation, `stands` and its CLI to [solver.md](../../meta/solver.md), and update its edge. Report any change to the `AGENTS.md` row.  
**May edit:** `docs/meta/solver.md`.

**Order:** B0b, B6, B7, B8, in sequence. Then the final gate, and the orchestrator deletes this proposal ([consolidate](../../meta/procedures/proposals.md#consolidate)), or cuts it to an idea if B3-1 leaves *or* / *maybe* rows for later.

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
- Encoding, translation table and jobs: docs/meta/solver.md. A denial is holds(neg(T)).
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

- `npm run verify -- --baseline` at the start of phase 3; `npm run verify -- --allow-generate` after each unit, before its commit.
- Final gate, at the end of phase 3: a full `npm run verify` that passes against an empty baseline (it runs the build and the tests).
- One commit per unit, after its gate: `clingo-solver <ID>: … [skip-cd]` with the co-author line.
- Phase 1 made 5 commits, phase 2 made 9 (with a fix to B1 and the consolidation); phase 3 about 5 (the last deletes the proposal).

## Open decisions

R2 drafted the group (b) and (c) rows on 2026-11-19, in the encoding of `docs/meta/solver.md` (a denial is `holds(neg(T))`; each rule's `fired` and `used` twins are left out). Fixtures: `src/interpret/fixtures/draft-holders.txt` (b1–b11), `draft-say.txt` (p1–p9) and `draft-because.txt` (c1–c13), not `solve-*` until B6 and B7 build them. Every line parses.

### R2-1: rows that copy a stated rule

Each row reads one classification table row and copies what its grammar anchor states. To confirm.

1. **A holder's view.** `xFamily:holder` with its host (`overlay:evidential:th` or `overlay:may:th`, `holderHost`) (`holder.md#what-the-holder-covers`: the event is "what the holder takes to be so; you do not assert it"). `holds(view(H, T)) :- on(Id).`, and a denial inside it `holds(view(H, neg(T))) :- on(Id).`; never `holds(T)`. The seam word is yours ("says how you know about the holder's view"), so its channel is data, `via(Id, Channel)`, outside the term: two reports of one holder by different channels meet. One holder's views clash through the generic rules, wrapped: `clash(view(H, P)) :- holds(view(H, P)), holds(view(H, neg(P))).` and its `fits` form. Two holders differ in `H` and never clash, and a view never clashes with your claim (Sketch, *Frames stay data*). b1 + b2 give `clash(view(azozon, departure(alazun)))`; b1 + b3 and b1 + b4 give none. Whether that clash counts as the log's is R2-2.
2. **A carried holder.** `carry:holder` link (`holder.md#naming-a-holder`: "your bare claims go on giving that person's view, until a new frame"). The later reading takes row 1 with the `H` of the reading it links to. b5 gives `view(azozon, departure(alazun))` and `view(azozon, sleep(alazun))`, and no `holds(sleep(alazun))`.
3. **Who the holder is.** The ending table on `holder.md#naming-a-holder`: a name is its root id; `-r` and the topic pronoun resolve through `throughAntecedent`; `-lx` on a kind of person (*some people*) and a bare kind (`theyomeyel`, *someone*) are a first-mention noun, `nm(Id, h)` with its `isa` fact (row 14), so b8 and b9 are two people and never clash. The other holder terms are R2-4.
4. **A say word.** `wordFamily:say`, values `reach`, `part`, `answer`, `ending` (`permission-consent.md#say-words`; `#permission`: "a say word says only who allows or demands it"). `holds(say(Who, Part, Reach, Answer, Ending, T)) :- on(Id).`, and no `holds(T)` (Sketch: a say word's content stays wrapped). `Who` is the hosted `bl-` word when there is one; else on `v` it is `speaker` for `-m`, `rules` for `-l`, `unsaid` for `-r` ("nobody said") (`#permission`); on `z`, `d`, `b` it is that role's filler in the claim (`#consent`). Pair reach `e` on `z` / `d` / `b` keeps its `bl-` word as a seventh argument, `to(X)` (`#say-reach`). p1 gives `say(rules, v, u, a, l, walk(azozon))`; p4 `say(alazun, v, u, a, m, walk(azozon))`; p4 + p5 never clash (two parties). Consent is R2-6.
5. **Because.** `overlay:clause_hinge:th` / `:g` with gloss `because` (`because-and-iff.md#choosing-a-hinge`: "enough; condition asserted as the reason"; the outcome is the clause's claim). `holds(Out) :- on(Id).` `holds(Cond) :- on(Id).` `holds(cause(Cond, Out)) :- on(Id).` `Cond` is the hosted clause's term, or with a noun (`gahum blugalal`) the noun's term, whose kind row 14 gives. *Enough* adds no rule while both sides are claimed; on a closed universal the row takes row 8's body, as a hinge does (`usually-vs-must.md#how-things-work`). c1 gives `walk(azozon)`, `sleep(alazun)` and `cause(sleep(alazun), walk(azozon))`; c1 + c2 clash on `sleep(alazun)`, c1 + c4 on `walk(azozon)`.
6. **Not because.** `joinSeries:u` in the hinge's stance list (`verb-and-stance-joins.md#stance-joins`: "the claim itself still stands and only its grounds are denied"; `#stance-join-before-barl`). `holds(Out) :- on(Id).` `holds(neg(cause(Cond, Out))) :- on(Id).` c1 + c3 give `clash(cause(sleep(alazun), walk(azozon)))`. Whether the condition holds is R2-10.
7. **Fault and share.** Gloss `because.fault` (`-l`) and `because.share` (`-r`) (`fault.md#fault`): row 5, plus the marker `holds(fault(Cond, Out))` ("the reason broke a norm") or `holds(share(Cond, Out))` ("one share among others"). `thahum` claims no fault and denies none, so c5 + c7 do not clash. The link term they share is R2-10.
8. **Only because.** `thebem` then `thahum`, ordered by rule (`because-and-iff.md#choosing-a-hinge`: "stacks two hinges: `thebem` (the outcome needs it), then `thahum` with the condition"). Row 5 of this list, plus row 6 (only if) of `docs/meta/solver.md` on the same condition. c8 gives c1's atoms and row 6's two rules. The reading gives `thebem` no content of its own ([Findings](#findings)).
9. **Contrary to.** `hookJob:zone`, frame:contrary (`contrary-to.md#contrary-to-holder`: "the event is still your claim"; `#contrary-to-stance`: the word after `uom` "no longer applies to the claim"). `holds(T) :- on(Id).` `holds(against(T, Z)) :- on(Id).` The zone `Z` is `plan(H)`, `channel(Gloss, H)` or `say(Who, Part, Reach, Answer, Ending)`, with `H` the holder after `uom` or `speaker`. c9 gives `walk(azozon)` and `against(walk(azozon), plan(speaker))`; c4 clashes with c9, c10 and c11 on `walk(azozon)`. What the zone implies is R2-11.

### R2-2: a clash inside one holder's view

b1 + b2: either one report is wrong, or Azozon holds two views that cannot both be so, which people do. No page says which.

- (A) A `clash` like any other: `clashes`, `giveUp`, `whyNot` and a `both` verdict see it, and the reply names the holder (*In Azozon's view these cannot all hold: b1, b2.*).
- (B) A separate atom, `torn(H, P)`, on its own field of `clashes`, never in `giveUp`.
- (C) No clash inside a view.

**Recommendation:** (A) **(medium)**. A consumer (who knows what, the argument map) wants the two reports flagged with their readings, and the reply can say whose view; (B) gives every consumer a second clash kind to handle, and (C) drops what the B6 test names (*one holder's own beliefs can clash*).

### R2-3: a holder on MAY

b6, *Maybe Azozon thinks Alazun left.* MAY has no row yet (`docs/meta/solver.md`, the edge).

- (A) Left out (`left`), as MAY is, until MAY's row.
- (B) A choice, `{ holds(view(H, T)) } :- on(Id).`: Azozon could think it.
- (C) As a channel host: the view holds.

**Recommendation:** (A) **(medium)**. (B) is what a MAY row would give, so it lands with that row and both read the same; (C) claims more than *maybe*.

### R2-4: holder terms no page ties together

The associative `-x` (`theyomazozonx`, *Azozon and co.*), the interlocutors (`theyomayan`, b7) and the generic pronoun (`theyomeyen`). `holder.md#what-the-holder-covers` says the interlocutors' view is "one you both share", that "you can't know the listener's memory, only claim the view is shared", and that "you are never the holder".

- (A) Each is its own holder term, `grp(azozon)`, `interlocutors`, `generic`, with nothing passing between them or into your claims. The generic view is one holder, so two generic views can clash.
- (B) As A, and the interlocutors' view is also your claim, `holds(T)`, since you are one of them.
- (C) As A, and a group's view is each member's view.

**Recommendation:** (A) **(medium)**. (B) would turn a claim that a view is shared into your plain claim, which the page keeps apart; (C) needs the group's members, which `-x` leaves open. A consumer that wants either can add the rule as a host rule, named in the answer.

### R2-5: inference inside one view

b10 + b11: Azozon's own hinge, and Azozon's view of its condition. Does Azozon's view hold *Alazun leaves*? `holder.md#what-the-holder-covers` makes a hinge under a holder the holder's.

- (A) No: a view holds only what is reported.
- (B) The holder's own stated rules (rows 5 to 11 under the same holder) run inside the view: `holds(view(H, Out)) :- fits(c(Id), P), holds(view(H, P)), on(Id).`, and the same for universals and membership. Your own rules never reach a view.
- (C) As B, and your own rules run in every view.

**Recommendation:** (B) **(medium)**. A who-knows-what consumer asks what someone would conclude from what they think; (A) answers *cannot say* to the plain case, and (C) puts your premises in their head, the false-belief case the seam keeps apart. The answer names the holder's readings, so the step shows.

### R2-6: does consent claim the act?

The Sketch wraps every say word. On `permission-consent.md#consent` the glosses read as if the act happened (p6, *Azozon looks at Alazun, and Alazun agreed*), while permission's do not (*Azozon may walk*); the page states neither. The vow `zuwen vowurol hwuzal.` (*I promise to walk*) is consent on `z` with no act yet.

- (A) Wrapped for every say word.
- (B) Consent (`z` / `d` / `b`) on a statement also claims the act; permission (`v`) does not.
- (C) By ending or answer: a granted consent (`a`) claims the act, the rest do not.

**Recommendation:** (A) **(medium)**. The vow shows consent that claims no act, so (B) would read a promise as done; a host that wants the act asks for it in its own sentence. A grammar sentence on whether `hwudam` reports the act would settle (C).

### R2-7: which say words clash

p1 + p2 (the rules allow, the rules forbid); p8 + p9 (standing permission, this episode's ban). No page says two say words exclude each other.

- (A) None: say terms are data.
- (B) The same `Who`, `Part`, `Reach`, `Ending` and a fitting act, with answers `a` and `u`, or `o` and `u`: `clash(say(W, P, R, u, E, T)) :- holds(say(W, P, R, a, E, T)), holds(say(W, P, R, u, E, T)).` and the `o` line. Another party, source, ending or reach never clashes, so p8 + p9 and p4 + p5 stand together.
- (C) As B, and `e` (*their call*: "neither allowed, forbidden, nor required") against `o` and `u`.

**Recommendation:** (B) **(medium)**. An agent-permissions host needs *the rules allow it* and *the rules forbid it* flagged, with both readings; keying on reach keeps a standing grant beside a one-time ban, which the reach vowels exist to say. (C) rests on reading *their call* as excluding a demand, which the page does not say.

### R2-8: does a requirement give permission?

p7, *the rules require Azozon to walk*: may Azozon walk?

- (A) No: `o` and `a` are separate answers.
- (B) Yes: `holds(say(W, P, R, a, E, T)) :- holds(say(W, P, R, o, E, T)).`, with its `fired` twin.

**Recommendation:** (B) **(medium)**. A host asking *may the agent do this?* after *the rules require it* gets *yes*, citing p7, instead of *cannot say*; with R2-7 (B), `o` against `u` then follows from `a` against `u`.

### R2-9: an act against a stated say word

p2 + p3: the rules forbid Azozon to walk, and Azozon walks. Not a clash: the page has `uom hwuvul` to say it on purpose (`contrary-to.md#contrary-to-say`).

- (A) Nothing is derived.
- (B) `holds(against(T, say(W, P, R, u, E))) :- holds(T), holds(say(W, P, R, u, E, T)).` (with `fits` where the terms differ): the atom R2-1 row 9 gives for `uom hwuvul`, never a clash. Only answer `u` (the page: "the event breaks a rule or someone's refusal").

**Recommendation:** (B) **(medium)**. A host checking an agent against its rules asks *did anything go against a ban?* and gets the pair of readings, whether the speaker said `uom` or not.

### R2-10: the link term, and what *not because* says of the condition

Three questions R2-1 rows 5 to 7 leave open:

1. Do `thahul` and `thahur` carry the same link, `cause(C, O)`, so *not because* (c3) clashes with *partly because* (c6) and with fault (c5)? (A) One link for all three endings, the markers on top. (B) One link per ending, and *not because* denies only `thahum`'s.
2. Does *not because* claim its condition? (A) No: the condition stays unstated (reader rule 4). (B) Yes, as *because* does.
3. Does fault meet the say words: does c5 (*Alazun was wrong to speak*) clash with *the rules allow Alazun to speak*? (A) No: `fault` is a marker. (B) Yes, fault as `say(rules, v, u, u, l, C)`.

**Recommendation:** 1 (A), 2 (A), 3 (A), each **(medium)**. *Not because of the rain* rules the rain out as any part of the reason, so the argument map's *deny the link* should meet a partial cause too. The page says only that the claim stands and the grounds are denied, so claiming the condition would invent a claim. A norm is not a stated rule, so fault against a rule would clash where the speaker meant no contradiction.

### R2-11: what a contrary zone implies

c10 (*against the rules*) beside c12 (*the rules allow it*); c11 (*contrary to what I hear Alazun thinks*).

- (A) The marker `against(T, Z)` only.
- (B) A say-word zone also claims its say word on the act, `holds(say(W, P, R, u, E, T))`, so c10 + c12 clash under R2-7 (B) and *do the rules forbid it?* answers *yes*. A plan or channel zone stays a marker.
- (C) As B, and a plan or channel zone with a holder also gives that holder's view of the denial, `view(H, neg(T))`.

**Recommendation:** (B) **(medium)**. The page says the say word names "a rule or someone's refusal", so *against the rules* cannot hold beside *the rules allow it*; a plan or a view "says otherwise" without saying what, so (C) would give a holder a view no page states.

### R2-12: the attack relation for *what stands*

The ASPARTIX encodings take `arg(X)` and `att(X, Y)`. Arguments are the log's readings, `arg(Id) :- on(Id).`; a nested reading (a hinge's clause, a quote) belongs to its reading. Which readings attack which?

- (A) **Rebut on the clashing pair.** For each clash, the readings whose `fired` gives its two sides attack each other, both ways: `att(A, B) :- fired(A, P), fired(B, neg(P)).` `att(B, A) :- fired(A, P), fired(B, neg(P)).`, with the `fits` form, the `view` form (R2-2), and for `notall(Id)` and `none(Id)` the denying reading against each reading that fired an item. A clash's other readings (premises) are not attacked, and a reading whose own atoms clash attacks itself.
- (B) Every reading of a smallest clash attacks every other.
- (C) As A, with one-way attacks the grammar does not state: a claim about a named thing defeats a closed universal (a counter-case), or a stronger channel a weaker one.

Under choices, attacks come from the brave `fired` atoms of a first run; the `att` facts then feed the ASPARTIX program in a second. An open universal never fires against a stated denial (row 10's `not holds(neg(..))`), so it neither attacks nor is attacked.

**Recommendation:** (A) **(medium)**. It names the two readings that disagree and leaves a shared premise standing: in `solve-clash`, s1 is attacked by s2 and by s5, and s3 and s4 stand, where (B) would leave *Tweety is a bird* undecided because of what someone said about flying. (C) needs a preference no page states; a host can add its own `att` facts, named in the answer. c1 + c2 + c13: `att(c1, c2)` and `att(c2, c1)`; grounded gives c13 in and c1, c2 undecided; preferred gives {c1, c13} and {c2, c13}.

### R2-13: semantics, and what `stands` returns

`stands(log, options)` labels each reading `in`, `out` (attacked by a reading that is in) or `undec`. Credulous acceptance is brave and skeptical is cautious over stable or preferred extensions; grounded has one extension, where both agree.

- (A) Grounded by default, `semantics: 'stable' | 'preferred'` as options (the plan).
- (B) Preferred by default.

**Recommendation:** (A) **(high)**. Grounded has one answer, is stratified and fast, and never accepts a reading an unanswered objection meets, so a consumer never shows one side of a live disagreement as the winner. Note for the user: with R2-12 (A) every attack is mutual, so grounded is exactly the unattacked readings, and the stable and preferred extensions are the largest sets with no attacking pair. The three semantics differ only once a one-way attack exists (R2-12 (C), or a host's own).

### B3-1: *or* and *maybe*

B3 built clashes under choices, but the translator has no row for *or* (`e` lists: a list term with no member rule and no choice, so one world) or for MAY, and an open universal's choice never forces a clash. So no fixture has every world clashing with no shared atom; the code handles that case in general terms but no test reaches it. R2-3 also waits on MAY's row.

- (A) Draft *or* and MAY rows now as one more unit in phase 3, with a stop for the user to confirm them before they are built (a phase 4).
- (B) Leave them out of this proposal: when phase 3 ends, cut what is left to an idea (*or* and MAY rows, and a test of clashes under choices on them) instead of deleting the proposal.

**Recommendation:** (B) **(medium)**. Groups (a) to (c) meet the proposal's goals for stated claims, and the solver reports an *or* or *maybe* reading in `left` instead of guessing; drafting the rows is the same kind of work as R1 and R2 and needs its own confirmation round, which fits a follow-up better than a fourth phase here. (A) is better if a consumer due soon (logic grids, the argument map) needs *or* first.

## Findings

F1 found no sentence the grammar could not say. R2 found none either: every English line in the three draft fixtures has a form, *not because* included (`thahum thul blarl`, `verb-and-stance-joins.md#stance-join-before-barl`).

R2 found two gaps in what a reading carries; B0b fixes them before B6 and B7 (the fix is the reader or a classification table note, not a walker):

- **A holder's party is not marked named.** In `zalazun theyomazozon vudurul.` the holder frame's `party` has root `azozo` and `named: false`, where `zazozon` as `z` is named. Keyed as a first-mention noun, b1 and b2 would be two holders and never clash. The reader should mark a `-n` holder named (`xFamily:holder`), or B6 keys holders by root and ending.
- **A stacked `thebem` has no content.** In `zazozon vowurol thebem thahum blarl zalazun vezuvel.` the `thebem` frame has no `hosted`; its condition is the `thahum` frame's clause (`because-and-iff.md#choosing-a-hinge`). B7 needs it on the reading, as a link or a note on the `overlay:clause_hinge:th` row, before R2-1 row 8 can be built.

## Background

### Problem

The interpreter's matcher is structural on purpose: it finds the readings that say a thing, and never works out what else must be true. Its two switches (`widen`, `infer` in `src/interpret/match.ts`) take one step each and say so. Four jobs need more, and each would otherwise grow its own search code:

| Job | Who wants it | What the matcher cannot do |
|-----|--------------|----------------------------|
| **What follows** | Ageben Spec, structural search, knowledge store, who knows what | chain a condition to its result, or several steps together, and say which readings it used |
| **What clashes** | Ageben Spec, agent permissions, knowledge store, argument map | show that a set of sentences cannot all hold, and name the smallest set that clash, or the smallest set to give up |
| **What stands** | argument map | weigh claims against the objections stated to them and say which survive |
| **What can be done** (later) | the wizard, logic grids | prove a quest reachable, find its shortest walkthrough, generate a puzzle with one solution |

All four are one problem: find the worlds consistent with what was said. That is what an answer-set solver does.

### Goals

- One module, `src/interpret/solve.ts`, is the only code that talks to Clingo. Consumers ask it what follows, what clashes, and what stands, and every answer names the readings that decided it, by the ids `whyReply` already takes.
- A translation table in a meta note, one row per frame family, each row citing the classification table row it reads from and confirmed by the user when it is written.
- The matcher's step conditions are defined once and called by both engines.
- It runs in Node and from the site's browser entry, loading the solver only when a job first runs.

### Non-goals

- **No second grammar authority.** The translation table reads from the classification table and cites it. It never states a meaning of its own.
- **No inference by default.** A solver job runs only when a consumer asks for it, and every answer found through one says so and names the readings.
- **No change to the loop.** `run` and a host's `verdict` stay synchronous and never call the solver; the solver is its own asynchronous entry, which a consumer calls before or beside the loop.
- **No probability.** How strongly a channel supports a claim is not something this solver weighs.
- **No paraphrase.** A different root is still a different claim.
- **No arithmetic across claims**, no Clingo extension, and no second engine (s(CASP)). None of Clingo's extensions has a build that runs on the site, none covers every number form the grammar has (decimals, percent, fractions, rays, *about*), and s(CASP) would add a whole Prolog of 13.7 MB.
- **No held ground program.** Each job grounds its program again. Switching readings on a held program (`knowledge-store.md`) waits for that consumer; S1 measures whether it will be needed.
- **No wizard integration**, and no *what can be done*: user, 2026-11-18.

### Sketch

**Clingo** is an answer-set solver from Potassco. A program is facts, rules, choices and constraints; the output is every consistent world, or none. Its `not` means *not shown*, so a rule can hold by default and give way to an exception. It runs as the `clingo-wasm` package in Node and on the site, where it loads in a worker the first time a solver job runs (about 0.9 MB gzipped). The package bundles Clingo 5.8, so the translator writes programs that mean the same under Clingo 6 ([Research](#research)). Its calls are asynchronous, so the solver is its own entry, never a step inside the loop.

`src/interpret/solve.ts` sits beside the matcher and is the only code that talks to Clingo. The translation lives in `src/interpret/translate.ts`, and the step conditions both engines share in `src/interpret/steps.ts`:

1. **Translate.** Each `Reading` in the log becomes facts and rules. Its `claim` (verb, `z` / `d` / `b` roles, predicate, details) becomes a term, and each frame wraps that term, so frames stay data and never leak: *Ana says Lee paid* is `said(ana, paid(lee))`, not `paid(lee)`. A hinge's clauses are already nested readings in the frame's `content`, and a holder is the frame's `party`. A translation table, one row per frame family, lives in `docs/meta/solver.md` and cites the classification table row it reads from. A frame with no row is left out of the program and is reported like an `unread` part today: the turn is `beyond` for that job.
2. **Switch.** Every reading is switched by one atom, `on(Id)`, and every rule carries the reading id it came from and derives a `fired(Id, Conclusion)` marker.
3. **Solve, then explain.** Walking the `fired` markers back from a conclusion gives the readings that decided it. A contradiction derives a `clash` atom instead of ending the world, so the same walk names the readings that clash ([naming a clash](#naming-a-clash)). Both come back as reading ids, which is what `whyReply(because)` in `reply.ts` already takes.

**Fitting stays the matcher's.** Whether a stated claim fits a condition, or a question, is decided by `match`, never by Clingo's term equality, so roots, referents, details and blanks keep the matcher's rules. The translator runs `match` over each condition and the claims that could meet it (logged and nested readings, and a universal's template with its instance) and emits the fits as facts that the rules join on. A question is matched in TypeScript against the claims the consequences name. B1 designs the encoding under this constraint; if it cannot keep the matcher's rules, B1 stops and reports.

**What a question asks of the worlds.** *Does it follow?* is true in every world (Clingo's cautious consequences); *could it be?* is true in some world (brave consequences). Both are a run option, not a new program. A question answers *yes* when the claim holds in every world, *no* when its denial does, and *cannot say* otherwise.

#### What the solver may conclude
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

#### Naming a clash
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

### Research
<a id="research"></a>

Done 2026-11-18 from the package's metadata, README and type files, then run by S1 (2026-11-18): the worked example, an optimization run, a Lua main, and synthetic programs of the worked example's shape, under Node 24.21 with `tsx`.

**Measured (S1).**

- **Loading.** `import clingo from "clingo-wasm"` resolves the `node` export and runs under `tsx` with no setup; the file must be ESM (the repo's `"type": "module"` covers `src/`; a `.ts` file outside it needs `.mts`). `init()` takes about 0.8 s, once per process.
- **Consequences.** On the worked example, `--enum-mode=cautious` gives one witness with the four atoms true in every world (`-holds(fly(pingu))`, no `holds(fly(robin))`), and `brave` adds `holds(fly(robin))`: *no* for Pingu, *cannot say* but *could* for Robin, as the Sketch says. The closed s1 with `:- holds(F), -holds(F).` is UNSATISFIABLE.
- **Optimization.** Free `{ on(s1); on(s2); on(s3); on(s6) }.` with `#maximize { 1,R : on(R) }.` and `--opt-mode=optN` gives OPTIMUM FOUND, cost `[-3]`, and the three optimal sets, each one of s1, s2, s3 left out.
- **JSON shape.** `{ Solver, Call: [{ Witnesses: [{ Value: string[], Costs?, Consequences? }] }], Result, Models: { Number, More, Optimum?, Costs?, Cautious? / Brave? }, Time: { Total, Solve, … } }`. Witness atoms are strings (`"-holds(fly(pingu))"`, `"fired(s2,-fly(pingu))"`). `Result` is `SATISFIABLE`, `UNSATISFIABLE`, `OPTIMUM FOUND`, or `ERROR` with an `Error` string; an error does not throw. `Call[0]` is `null` when unsatisfiable. Use `--quiet=1` with `brave`: without it every intermediate witness is printed and parsed (2 s instead of 0.3 s at 2,000).
- **Lua main.** Works: one `prg:ground`, then `prg:solve{assumptions=…, yield=true}` and `handle:core()` give the core `on(s1), on(s2), on(s3)`, and a second solve on the same ground program without s1 is satisfiable. `print` from Lua corrupts the JSON (`Result: ERROR`); report through facts added with `prg:add` and a last solve. `solve{on_core=…}` returned no core.
- **Size limit.** A program text over about 1 MiB fails with `RuntimeError: memory access out of bounds` (1.03 MB of facts runs, 1.15 MB fails), so 20,000 readings in the `holds(k(X))` encoding did not run. Every run grounds again, and grounding grows faster than linearly when many rules share one predicate.

Synthetic program: per group of four readings, a kind fact, an exception-kind fact, an open rule `{ holds(fly(X)) } :- holds(kI(X)), not -holds(fly(X)), on(gI).` and a strict denial, each guarded by `on/1`. Clingo's `Time.Total` in seconds (solving is under 0.02 s in every row; the rest is grounding):

| Readings | `holds(kI(X))`, cautious | brave (`--quiet=1`) | kind as its own predicate `kI(X)` |
|---|---|---|---|
| 200 | 0.012 | 0.010 | |
| 2,000 | 0.27 | 0.28 | 0.12 |
| 5,000 | 1.6 | | |
| 10,000 | 5.9 | | 1.4 |
| 20,000 | fails (1.19 MB text) | | 5.4 (0.93 MB) |

**What the interpreter gives the translator.**

- A `Reading` (`src/interpret/types.ts`) has an `id` (`<text>:<utterance>.<body>` plus a clause path), a `claim`, `frames` in text order, the `order` between frames (from the pair table), `unordered` pairs, `links` to other readings, and `unread` parts.
- There is no polarity field: a denial is a `polarity` frame, either on a list term (a `u` join denies only its items) or on the whole clause.
- Frames nest: a hinge's or quote's clause is a nested `Reading` in `content`, and a holder is the frame's `party`.
- Values (`value.ts`) are JS floats with a percent kind, ranks, or codes. Digitless words, infinite ray ends and fractions (`g-N`) carry no value, and `compareValues` orders only like with like.
- The *why* reply takes reading ids and held-state sources; a question's verdict is `yes`, `no`, `unknown` (*I can't say.*) or a fill.
- The loop (`run`) and a host's `verdict` are synchronous.

**`clingo-wasm` 0.6.0.** Apache-2.0; Clingo 5.8.1 with Lua 5.4.6, no Python. Single-threaded and threaded builds, 0.93 MB gzipped. It runs in a worker in Node and the browser; threads need a cross-origin isolated page, otherwise it falls back to one thread. Vite needs `worker: { format: "es" }`.

- **API.** `run(program, models, options, onModel)`, `stream(program, models, options)`, `init(wasmUrl)` and `restart()`. `options` are Clingo's command-line flags, so `--enum-mode=cautious` / `brave` and optimization flags work. The result is Clingo's JSON output: `Result` (SATISFIABLE, UNSATISFIABLE, OPTIMUM FOUND, UNKNOWN), witnesses as lists of atom strings, costs, and timings.
- **One-shot.** Each `run` grounds the whole program again. Holding a ground program between solves is possible only inside a Lua `#script` main (works, S1).
- **Cores.** The JavaScript API has no assumption or core call; a Lua main gets a core (S1). The Sketch still has clashes under choices re-solve ([naming a clash](#naming-a-clash)).

**Clingo 5 / 6 common ground.** `clingo-wasm` has no Clingo 6 build. A program means the same under both when it has no conditional literal in a rule body (6 needs every condition, not any), no `_` inside `not` (6 makes it a fresh variable), and no integer division (6 floors). A golden test that solves the translator's output under the bundled version shows any drift when the package moves to 6.

**Cost of re-solving.** Removal one at a time is one solve per reading, and each `clingo-wasm` call grounds the whole program again; QuickXplain needs about k·log(n/k) solves for a clash of k among n.

**Argumentation.** The ASPARTIX encodings for *what stands* are plain Clingo programs:

- grounded semantics is stratified, so it has one world and is fast
- stable and complete are normal programs
- preferred and semi-stable need disjunction, which Clingo supports

Credulous (some extension) and skeptical (every extension) acceptance map onto brave and cautious consequences.

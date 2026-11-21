# Solver coverage: open questions left from the coverage work

**Status:** IDEA, 2026-11-21. The coverage work shipped: the accounting guard, rows 1 to 46, the fill job and its CLI, and the edge, all owned by [solver.md](../../meta/solver.md). What is left is four questions logged during that work, which need a user decision before anyone plans them.  
**Related:** [solver.md](../../meta/solver.md) (translation table, the edge); [interpreter.md](../../meta/interpreter.md) (matching); `src/interpret/match.ts`, `translate.ts`, `translate-say.ts`.

## Problem

Each question below is a case where the solver gives an answer a learner would not expect (*unknown* where they expect *yes*, or a clash between unrelated scenes), or a reading built beyond what its row stated.

## Sketch

Each fix is small once decided: a matching change for questions 1 and 2, nothing for question 3 under (a), and a holder term per supposition for question 4.

## Open questions

1. **A genitive on one noun and on a joined list** (B4b). The reader puts `om bahelan` on the clause after a single noun (`yel zogozel om bahelan vowurol.`) but on each member after a join (`zodozel zogozel zal om bahelan vowurol.`), so the question never fits the log and answers unknown; the fixture asks `yel zogozel vowurol.` instead. Options: (a) the matcher treats a clause-level genitive as a detail of the `z` noun; (b) accept the gap and list it on the edge. **Recommendation:** **(medium)** (a): a learner who says *Ahelan's dog and cat walk* expects *does Ahelan's cat walk?* to answer yes, and the program already writes the detail on each member.
2. **A ratio asked the other way round** (B4c). `zazozon zalazun zoel gelazem hradol.` (*twice as big*) and `zalazun zazozon zoel gelazem hrudol.` (*half as big*) encode the same `ratio` atom, but a question in one wording against a log in the other answers unknown, since `match()` compares the members in order and the factor. Options: (a) accept it; (b) pool the inverse claim as a second fitting claim. **Recommendation:** **(medium)** (b): a learner who hears *twice as big* expects *is Alazun half as big?* to answer yes, and the atom is already shared, so only matching changes. B4c leaned (a), with no reason given beyond scope.
3. **`yuor`** (B6a). O-4 names only `yaor`; B6a read it as a rule about the `-r` ending and built `yuor` the same way (the denial, held for now). Options: (a) keep it; (b) `yuor` claims nothing. **Recommendation:** **(medium)** (a): `-r` carries *for now* on both verdicts, and the polar grid stays regular.
4. **One holder for every supposition** (B6c2, 2026-11-21; blocking, since it changes the term the user settled in O-6). Row 45 writes every NOTIONAL reading as `view(notional, T)`, so two separate suppositions in one log share one view and can clash with each other. Options: (a) keep it, as O-6 reads; (b) each stated NOTIONAL gets its own holder, such as `notional(Id)`, which the sentences it carries to inherit. **Recommendation:** **(medium)** (b): two unrelated imagined scenes should not clash with each other.

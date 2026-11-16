# Argument map: a disagreement between people, drawn from its grammar

**Status:** IDEA, 2026-11-16.  
**Related:** the interpreter's readings and classification table ([interpreter.md](../../meta/interpreter.md), `src/interpret/`, made by `ageben-interpreter.md`); the map it would be drawn on (`mind-map-view.md`, `src/mind-map/`); the solver and store behind the later steps (`clingo-solver.md`, `knowledge-store.md`); grammar pages [causation](/causation), [because](/because-and-iff), [evidentiality](/evidentiality), [holder](/holder), [sakes](/sakes), [questions](/questions), [dependents](/dependents), [stand-in vowels](/stand-in-vowels), [residue and former](/residue-and-former).

Not design authority. Tooling only: the sketch adds no form and changes no reading.

## Problem

Two people who disagree in writing rarely find out where they disagree. A reply answers a whole message, so nobody can tell whether it denies a fact, doubts the evidence, rejects the reasoning, or wants something different. Long exchanges end when people tire, not when anything is settled, and what both sides accept is never stated.

Ageben already marks the pieces: each claim carries how the speaker knows it and whose claim it is, hinges name how one claim supports another, and a sake names what a position is for. Nothing uses that to show an exchange's structure or to say where two people actually differ.

## Sketch

A page where two or more people write short Ageben passages in turn, and each reply attaches to one part of an earlier passage.

**Each passage is a map.** It is drawn by the builder from `mind-map-view.md`, from the interpreter's readings, so its *no folded meaning* rule holds here too: a collapsed passage still shows its condition, report, holder and negation badges, and nobody's reported view reads as their own claim.

**A reply picks a target.** The reader's classes supply the targets, and the reply's own grammar gives the kind of move, so the writer chooses no category:

| Move | Target on the map | In English |
|------|-------------------|------------|
| Deny a premise | a hinge's content | *That didn't happen.* |
| Challenge the evidence | an evidence badge | *You heard that; you didn't see it.* |
| Deny the link | a hinge badge | *True, but that isn't why.* |
| Counter-case | a condition or a whole-kind claim | *Here is one where it fails.* |
| Different sake | a sake | *Agreed on the facts; I want something else.* |
| Ask | any node | *What kind? How do you know?* |

A reply with no target (a feeling about the passage as a whole) is allowed and is shown beside the exchange, not inside it.

**An overlay says where the two differ.** Computed outside the map builder and drawn on top of it:

- **Agreement list**: the claims both sides have asserted or accepted.
- **Crux**: the smallest set of claims or sakes on which they differ, pinned at the top.
- **Open steps**: a hinge whose premise nobody has supported or challenged.
- **Own-consistency note**: shown only to the writer, before sending, when a reply contradicts their earlier claim. Exits: retract it, mark it former, or narrow the new claim.
- **Sake prompt**: when two people agree on every claim and still oppose each other, each is asked for the sake behind their position.

**An exchange ends in a named state**: *converged*, *crux agreed* (both confirm where they differ), *different sakes*, or *open* (waiting on a named piece of evidence).

**Worked example.** A writes: *the bridge should close, because an inspector told me a cable is frayed.* The map shows a claim, a because badge, and the premise with a reported-evidence badge. B attaches *I looked yesterday and saw none frayed* to the premise. The overlay lists what both accept (there is a bridge, it has cables, a frayed cable would justify closing) and pins the crux: one premise, held on a report by A and on sight by B. The exchange is *open*, waiting on a second look.

**Smallest useful version.** Two people, reply targeting, and an agreement list that matches only identical readings and their direct negation. It needs the reader and the map, not the solver, and it tests whether targeting changes how people argue.

## Non-goals

- Judging who is right. The overlay reports structure and stated evidence; it verifies neither.
- Showing one person's contradictions to anyone else. That would punish changing one's mind.
- A second walk of the parse tree. Whatever the page needs that a reading does not carry is a finding for the interpreter's table.

## Open questions

1. **Is a reply's target grammar or a click?** (a) The writer selects a node, and the link is page metadata. (b) The reply points back with Ageben's own forms ([stand-in vowels](/stand-in-vowels), linkers), and the resolver makes an ordinary cross-link. (c) Both: a click inserts the pointing form. **Recommendation:** no basis yet. Whether those forms can pick out one premise in another speaker's passage has not been checked; if they can, (c) teaches the form while keeping the click.
2. **How does a cross-passage link fit a tree?** The map never gives a node two parents. (a) Each passage stays its own tree and a reply is a cross-link marker, as pronouns are. (b) A reply becomes a child of its target, so the exchange is one tree. **Recommendation:** (a). It keeps the builder unchanged and each passage readable in its own text order.
3. **Fold defaults.** The map opens roles and folds a hinge's content; arguing wants premises open. (a) A second fold policy over the same tree. (b) One policy with the depth control. **Recommendation:** (a); the reader should see premises without touching a control.
4. **Does the crux break the map's rule against ranking?** The map shows structure, never salience. (a) Keep the crux strictly in the overlay. (b) Let the map reorder or highlight by it. **Recommendation:** (a).
5. **What counts as the same claim?** (a) Identical readings only. (b) The matcher's structural match. (c) What the solver can derive. **Recommendation:** start at (a) and widen; a missed agreement costs less than a false one.
6. **Claims the solver cannot check.** A reading with an `unknown` frame or an unsettled pair. (a) Mark it *not checked* and leave it out of the crux. (b) Ask the writer to restate. **Recommendation:** (a), with the mark visible, so silence never reads as *consistent*.
7. **Writers who do not know Ageben yet.** (a) Ageben only. (b) English in, with the English helper's suggestion shown for confirmation. (c) Claritish. **Recommendation:** (b) for a first trial, since the page is only as useful as its parses are faithful to what the writer meant.
8. **More than two people.** The crux is defined for a pair. (a) Pairs only. (b) A crux per pair. (c) Group positions by shared claims first. **Recommendation:** (a) until the pair case has been tried.

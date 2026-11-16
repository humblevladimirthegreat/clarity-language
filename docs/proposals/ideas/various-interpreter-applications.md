# Various applications of the interpreter

**Status:** IDEA, 2026-11-14. A list of blurbs, none planned. One that is taken up gets its own idea file and leaves this list.  
**Related:** the interpreter's reader, log, matcher, host and loop ([interpreter.md](../../meta/interpreter.md), `src/interpret/`, made by `ageben-interpreter.md`); the solver (`clingo-solver.md`); `generic-ui.md`.

Not design authority. Tooling only: no blurb adds a form or changes a reading.

## Problem

The interpreter is planned for five consumers. Its reading, log and matcher make many other tools cheap, and nothing records them.

## Sketch

Each blurb names what it needs in brackets. *Solver* means `clingo-solver.md`.

### For learners and editors

- **Drill answer checker** [reader, matcher]. Compare a learner's translation with the expected answer by reading, not by string. Any valid order or second way of saying it passes, and feedback names the difference (*you dropped the holder*).
- **Conversation tutor** [host, loop]. A host with a small hidden world, played as twenty questions: the learner asks, the tutor answers in parser-checked Ageben and asks back. No language model.
- **Grammar equivalence tests** [reader]. Where a page says two forms mean the same, assert equal readings; where it says they differ, assert that. A census of `unordered` and `unread` over all doc examples shows which unsettled pairs really occur.
- **Free gloss check** [reader]. Flag an example whose English gloss shows no trace of a frame its reading has. A lint with false positives.
- **English helper scoring** [reader, matcher]. Score a suggested translation by comparing its reading with a reference reading, frame by frame. Deterministic and free.
- **Language model output as a reading** [reader, gloss-inverse]. The model fills a reading-shaped schema from English and never spells Ageben; gloss-inverse spells it, the parser checks it, and the reader confirms the round trip.
- **Readings in the translation prompt** [reader]. Give `parse.mjs --llm-prompt` the reading, not the tree: claim, frames in scope order, resolved links.
- **Language server** [reader]. Hover shows the reading, `unordered` and `unread` are diagnostics, go-to-definition follows a pronoun to its antecedent. One codebase for VS Code and the journal editor.

### Seeing your own thinking

- **Journal frame profile** [reader, log]. Summarise how a writer puts things forward: claims stated bare against those marked as memory, hearsay, or someone's view; oughts with no sake; feelings with no stake.
- **Open threads and commitments ledger** [log, matcher]. Over a conversation log, list the questions nothing later answers, and who planned, decided, or consented to what.
- **Calibration ledger** [log]. Every dated claim with a likelihood number is a prediction; a later *it turns out* resolves and scores it. Also catches incoherent numbers, such as *A and B* rated likelier than *A*.
- **Dependency tracking** [solver]. Each conclusion carries the readings it rests on: *what do I believe only because Ana told me?*, *what falls if this memory is wrong?*, and the smallest set to give up when a new fact clashes.
- **Preference consistency** [log]. Close the stated comparatives transitively: flag cycles, find dominated options, show the real trade-off set.

### Reasoning further than you can in your head

- **Missing-premise finder** [solver]. Check whether the stated grounds entail the conclusion; if not, find the smallest extra claims that would. The reply is *this follows only if also …*.
- **Hypothesis generator** [solver]. From what was observed, list every minimal set of unstated facts that would explain it.
- **Next-question finder** [solver]. Find the unknown whose answer splits the remaining worlds most evenly, and ask it in Ageben: the crux of a disagreement, or the best test in a diagnosis.
- **Analogy finder** [reader, a structure-mapping algorithm]. Find a past text with the same shape of relations under different roots.
- **Necessity and sufficiency** [solver]. Switch a stated cause off and solve again: the but-for test for a fault claim, and which causes were needed against which only helped.
- **Perspective simulation** [solver, one run per holder]. What each person would conclude from only what they witnessed or were told, and the smallest thing to tell one of them so they reach a given conclusion.
- **Goal and plan checker** [solver]. Sakes are goals; plans, tries, and fallbacks are means. Find sakes with no plan, plans that serve no sake, plans that cannot both succeed, and the smallest change that satisfies all.
- **Contingency checker** [solver]. Test both outcomes of every MAY fact in a plan: *your plan fails if the shop is closed, and you named no fallback*.

### Other engines and plumbing

- **A second solver for numbers and strings** [Z3 or similar]. Measures, percent and ranges in a spec; whether any command string matches both an allow rule and a deny rule. Needs the solver's translation table to produce a neutral rule form, with one printer per engine.
- **Evidence weighting** [a probabilistic logic engine]. How strongly the stated channels support a conclusion, and which explanation is most likely. The weights are a user decision.
- **Policy engine for permissions** [Cedar or OPA]. Compile say-word readings to policies: a tested enforcement engine, plus analysis of what a change newly permits.
- **Graph store** [RDF-star with SPARQL, or a property graph]. A claim is a set of triples and each frame an annotation on it; structural search then scales across texts. GraphQL as the API on top, its schema generated from the classification table.
- **Agent memory server** [log, matcher, MCP]. Expose `log` and `ask` as tools, so an agent's memory is in Ageben and every recalled fact comes with who said it and on what grounds.

## Open questions

None stated per blurb. The solver blurbs wait on the meaning decisions in `clingo-solver.md` (how conditions, causes, and sakes become rules). Library names are from memory and unchecked.

# A knowledge store: one library of facts, rules, tools and methods, in Ageben

**Status:** IDEA, 2026-11-16.  
**Related:** the agent that reads and writes it (`ageben-agent.md`); the solver that reasons over it (`clingo-solver.md`); the search surface over the same readings (`structural-search.md`); the graph store, memory server and calibration blurbs in `various-interpreter-applications.md`; the interpreter's reader, log and matcher ([interpreter.md](../../meta/interpreter.md), `src/interpret/`); wizard content as morph gloss ([wizard-game.md](../../meta/wizard-game.md)); the English helper ([english-helper.md](../../meta/procedures/english-helper.md)); the WordNet link ([src/wordnet.ts](../../../src/wordnet.ts)) over the roots in [lexicon-published.csv](../../../data/lexicon-published.csv).

Not design authority. Tooling only: the sketch adds no form and changes no reading.

## Problem

The agent's sketch names a log, a tool catalogue and a method library, and says only that each is written in Ageben. Nothing says where they are kept, how the agent finds the few entries a goal needs among many, how an entry is added or withdrawn without breaking what rests on it, or where the first entries come from. Without that, each domain would build its own store, and nothing learned in one would serve another.

## Sketch

One store for everything the agent knows and knows how to do. The text is the only authority; whatever the agent runs on is rebuilt from it.

**An entry** is one sentence or short paragraph, plus a sidecar: status (proposed, confirmed, former), the entries it was derived from, a count of uses and successes, and for an import its batch. What the sentence can state stays in the sentence: holder, channel and date are frames, not sidecar fields.

**The grammar types the entry.** There is no schema language. The frame family in the classification table says what an entry is:

| Entry | Read from |
|-------|-----------|
| fact | a plain claim, with its channel and holder |
| rule | a universal, or a *usually* claim |
| tool | a condition hinge, a cause, and an ability claim |
| method | a sake over a clause sequence (open in `ageben-agent.md`, question 2) |
| policy | an ought, a permission |

**Stored as morph gloss**, as wizard content is, in plain files under git. A respelled root never breaks the store, and every change is a diff a person can review. Spellings, readings and solver rules are generated.

**Packs.** A core pack holds domain-free rules (time, place, possession, transfer, containment, telling). A domain pack (the wizard world, files, a calendar) declares the roots it gives rules for and whether its world is closed. An episodic log holds one run's dated observations. A proposed layer holds learned and imported entries until confirmed.

**Finding entries is the interpreter's matcher.** The store is a set of interpreter logs, so it has no index of its own, and `structural-search.md` works over it unchanged:

- *Methods whose sake is X* and *tools whose result is Y* are searches by shape.
- A match comes back under its frame path (asserted, denied, supposed, reported), so hearsay is never used as a fact, and a trust rule is a source filter.
- A method for a compound's head serves the compound, by the matcher's compound-to-head switch. The most specific match wins.

**What the store adds to the matcher:**

- **Slice by goal.** Record at build time which rule's result feeds which rule's condition. Start from the goal's roots, take the closure, and hand the solver only that slice. Grounding size is the main cost, so the solver never sees the whole store.
- **Choose.** The matcher does not rank. Preferring the most specific, then the most proven, method is the store's job.
- **Plan one level at a time.** Methods break a task down, so the solver never searches the flat space of tool calls.

**The graph store is a later backend, not a second store.** Triples with frame annotations are what the matcher needs at scale, and the closure, *derived from* walks and same-shape lookups become graph queries. It is rebuilt from the text like every other cache, and it finds what was stated; what follows stays with the solver. A method's steps are ordered and share roles, so they need explicit next-step edges.

**Updating:**

- **Append only.** A withdrawn entry becomes former and is never deleted, so the explanation of a past run still resolves.
- **Admission gate.** The matcher refuses a duplicate and flags the same claim under denial. The solver then checks the entry against the store: a clash reports its core and asks; an entry that already follows is not stored.
- **Methods carry their tests.** Each keeps the goals it has solved. An entry that makes one unsolvable is refused.
- **Repair by exception.** A method that fails gains a *not when Y* clause; it is not dropped.
- **Gap ledger.** Each *I have no method for this* is logged by root. The ledger says what to write next.

**First entries, in order:**

1. The wizard pack, generated from the engine: verb handlers become tools, the world model becomes facts.
2. A taxonomy over published roots from the WordNet link, which method inheritance needs.
3. Core rules written by hand, a few sentences per root (what it requires, what follows from it), only for roots the first pack uses, then by the gap ledger.
4. Methods, written by hand or generalised from successful wizard runs.

The format is universal from the start; coverage grows from what the agent fails on.

**Mass import (later).** The agent calls no language model; data preparation may. The model is an untrusted drafter with deterministic checks between it and the store.

- **Templates first.** For a structured source such as Wikidata, the model drafts one clause template per property, a person reviews each, and code fills them. A few hundred reviewed templates cover millions of statements.
- **Prose through gates.** The model splits text into single claims, each tied to its source sentence, and translates them using published roots. A claim is kept only if it parses and the interpreter builds a reading; its numbers, dates and names equal the source's as values; and it has no frame the source did not state. Then an English gloss generated from the parse, with no model, is judged against the source by a second model, in both directions. Last, the admission gate.
- **No approximating.** A claim that needs a root the lexicon lacks is refused and tallied by missing concept.
- **Held as reported.** An imported claim is said by its source, never asserted, and sits in its own pack. The sidecar records model, prompt version and batch, so a bad batch is withdrawn whole.
- **Measured.** A hand-checked gold set scored per frame family, a sample audit per batch, and a count against the source each time the agent finds an imported claim wrong.

**Worked example.** The goal is *Ana has the report*. The matcher finds no method for *get a report to a person*, widens to the head, and finds *get a document to a person*. The closure from that method's steps pulls in three tool entries, the core rules for possession and transfer, and one episodic fact, reported by Lee. The solver grounds about a dozen entries out of thousands. The run succeeds, so the method's count rises and the goal joins its tests. Later a send fails on a file that is too large: the method gains an exception, held in the proposed layer until confirmed.

## Open questions

1. **Where the widening switches live.** `clingo-solver.md` question 3 recommends moving them to the solver; `structural-search.md` treats them as matcher switches. The store uses both, and they must agree. (a) Solver only, and the matcher asks it. (b) Both, checked equal by a test. **Recommendation:** no basis beyond that one definition is better than two; decide it there.

2. **Marking an entry withdrawn.** (a) Sidecar status only. (b) In Ageben, with a former or *no longer* form, so it is searchable under its own heading (`structural-search.md`, question 4). Which form would carry it is a grammar question for the user. **Recommendation:** (b) if an existing form fits without strain, else (a).

3. **Saying a claim was translated by a model.** (a) Sidecar only. (b) In Ageben, perhaps through the holder seam. A grammar question for the user. **Recommendation:** none; (a) works meanwhile.

4. **Who confirms a proposed entry.** (a) The user, always. (b) The user for rules and methods; facts pass on the gates alone. (c) Per pack. **Recommendation:** (b). A wrong rule changes what the solver infers everywhere; a wrong fact is one reported claim.

5. **Looking a fact up outside.** The agent's non-goal rules out open-world tasks. Is a Wikidata lookup, as a tool whose result is logged as reported, inside that line? (a) No outside lookups. (b) Facts only, never methods. **Recommendation:** (b), once a real domain needs it.

6. **Imported generalisations.** A model that turns *usually* into *all* changes inference, and no gate catches it reliably. (a) Import facts only. (b) Rules and methods too, each confirmed by a person. **Recommendation:** (a) first.

7. **Bridging vocabularies.** Two packs that use different roots for one idea do not find each other's entries. (a) Review each pack against the core pack's roots. (b) Stated bridging rules. **Recommendation:** (a), with (b) where two roots truly differ.

## Non-goals

- Not a general encyclopedia. Wikipedia prose is not a first source, and nothing is bulk-loaded before a domain needs it.
- No write goes to a cache first. The graph store and solver rules are always rebuilt from the text.

## Not checked

- Whether Clingo's WASM build lets facts be switched without grounding again, which belief revision over a large slice would want.
- Licences: Wikidata is believed public domain and Wikipedia share-alike; whether share-alike would attach to a derived store.
- Whether ConceptNet or SUMO is usable as a checklist for core rules (*used for*, *has prerequisite*, *causes*), and how noisy each is.
- Cost per admitted claim for a prose import. A small pilot batch would measure it.

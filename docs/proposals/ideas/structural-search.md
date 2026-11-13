# Search by what was claimed

**Status:** IDEA, 2026-11-13. Decided 2026-11-13: the search is a surface over the shared interpreter (`ageben-interpreter.md`); its record is the interpreter's reading and its matching is the interpreter's matcher, so this idea keeps only what a person sees and chooses.  
**Related:** the construction search [find.mjs](../../../scripts/find.mjs) and [src/find/](../../../src/find/); the interpreter's reader, log and matcher (`src/interpret/`, made by `ageben-interpreter.md`, phases 1 and 2); `ageben-spec.md` (the same readings, so a spec is searchable with no extra work); grammar pages [questions](/questions), [fill-ask roles](/fill-ask-roles), [knowing](/knowing), [evidentiality](/evidentiality), [holder](/holder), [pronouns](/pronouns), [topic](/topic), [spans](/spans), [causation](/causation), [measures and percent](/measures-and-percent), [compounds](/compounds).

Not design authority. Tooling only: it adds no form and changes no reading.

## Problem

Word search matches words. It cannot tell a claim from a denial, a question, a supposition, or a quote that uses the same words. A search for *the drug causes harm* also returns *the drug does not cause harm*, *does it cause harm?*, *if it caused harm…*, and *critics say it causes harm*. The reader sorts them by hand.

Word search also misses sentences that are about a thing without naming it (*it bit him*), and it cannot answer *who paid whom*, because it has no idea of roles.

Ageben marks all of this in its grammar, and each sentence has one parse. The existing construction search uses that to find doc examples by the rules they use. Nothing yet searches a text by **what it says**.

## Sketch

A search over any Ageben text where the query is itself an Ageben sentence, and a match is a match of parse trees, not of words. No AI takes part in matching, so every result can be explained by pointing at the two trees.

**Each clause is a reading**, built by the interpreter, not here:

- the **claim**: the bare clause, with each role filled and pronouns resolved;
- the **frames** around it, which say how the clause is put forward: asserted, denied, asked, supposed (inside a condition or *as if*), reported (inside a quote or under a holder), wanted or planned; and the holder, evidence channel, and date, when stated;
- list closure and whether a universal allows exceptions, on the list and binder;
- numbers and measures as values, not digit strings.

A field the sentence does not state stays empty and is shown as *not stated*. The search never guesses one.

**A match is the interpreter's.** It pairs the query's claim with a logged claim, role by role, and returns the frames on the matched reading and on every reading that contains it. This idea turns that frame path into a heading; it adds no matching rule of its own.

**What the search can then do:**

- **Group results by how the match holds.** The same clause comes back under separate headings, one per frame path: asserted, denied, asked, supposed, reported, wanted. This is the main feature; no word search offers it.
- **Match roles, not word order.** *Sam paid Ana* never matches *Ana paid Sam*, however either sentence is arranged.
- **Find what is not named.** A sentence that refers to the dog by pronoun, or sits inside a stretch whose topic is the dog, matches a query about the dog.
- **Filter by source and holder.** *Only what someone saw first-hand*, or *only what Ana believes*, are exact filters.
- **Search by shape.** Every condition whose result is X; every plan with no stated sake; every open list that contains Y. This is the construction search, widened from rule names to rule contents.
- **Compare numbers as values.** A query for *more than 5 km* matches a sentence that says 7 km.
- **Skip stemming.** One root serves every part of speech, and a compound splits at its joins, so a root query finds the root wherever it sits.
- **Answer, not just locate.** A fill question as the query returns the phrase that fills its blank, with the sentence as evidence. A yes/no question returns whether a match exists and under which heading.
- **Count.** Because each match is a record, results can be tallied: who holds this claim, how many hold it first-hand against by report, when each started or stopped.

**Worked example** (shown in English; the real query and text are Ageben). Query: *who paid Ana?* over this text:

1. *Sam paid Ana yesterday.*
2. *Ana says Lee never paid her.*
3. *If Kim pays her, Ana will leave.*
4. *I heard that Sam paid her twice.*
5. *Ana paid Sam.*

| Heading | Answer | From |
|---------|--------|------|
| Asserted | Sam | 1 |
| Asserted, by hearsay | Sam | 4 (*her* resolved to Ana) |
| Denied, reported by Ana | Lee | 2 |
| Supposed | Kim | 3 |

Sentence 5 does not appear: the roles are reversed. A word search for *paid Ana* returns 1 and 5, misses 2, 3, and 4, and tells the reader nothing about which of them is a claim.

## Non-goals

- **Ranking by relevance.** A sentence matches or it does not. Results are grouped and ordered by place in the text.
- **Understanding paraphrase.** The same idea in different roots is a different tree. See the open question on widening.

## Open questions

1. **Which text does it search?** (a) Ageben only. (b) Also English, translated to Ageben by an AI at index time. English often leaves the source, holder, and scope unsaid, so under (b) many fields would be empty, and a translation error becomes a wrong match that looks exact. **Recommendation:** (a) first. If (b) follows, label every such record as translated and keep unstated fields empty.
2. **How far does a match stretch past identical roots?** (a) Exact roots only. (b) Also through compound families, so a compound matches a query on its head. (c) Also through the WordNet link, for near-synonyms. Each step finds more and brings back some of word search's fuzziness. (b) is a switch in the interpreter's matcher, decided there; this question is which switches the search turns on by default. **Recommendation:** (a) and (b), with every widened match labelled as such; leave (c) until real searches show what (b) misses.
3. **How does a person who can't yet write Ageben ask?** (a) Ageben queries only. (b) English in, turned into an Ageben query by the English helper, shown for the person to confirm. (c) A form: pick a root for each role, tick the headings wanted. **Recommendation:** (c) beside (a). The form needs no fluency and can't produce a wrong query; (b) can, without the person seeing why.
4. **Which headings?** A heading is a name for a frame path, so this is a wording and grouping choice, not a matching rule. The six above are a first cut. Open points: whether a clause under *only if* counts as supposed; whether a former state (*no longer*) is its own heading or a dated assertion; whether a command gets a heading. **Recommendation:** none yet. Run the matcher over the doc examples and see which cases pile up under the wrong heading.
5. **Where does a person use it?** (a) Command line, beside the construction search. (b) A search box on the Inspect page, over the pasted passage. (c) Site-wide, over every example in the grammar. **Recommendation:** (b) and (c); learners are on the site, and (c) gives the grouped view a real corpus on day one. (a) exists once the interpreter's phase 2 lands, as its `reading ask` debugging command.

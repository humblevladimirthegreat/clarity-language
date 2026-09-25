# Proposal: reject-by-default parser with a doc-anchored construction registry

**Status:** PROPOSED (tooling, not a language change).  
**Related:** [clause.md](../grammar/clause.md), [marking Agalan](../meta/grammar-docs.md#marking-agalan), [src/parse/](../../src/parse/), [scripts/lint-agalan-docs.ts](../../scripts/lint-agalan-docs.ts)  
**Design authority:** none. The grammar docs decide what is legal. This proposal makes the parser prove it follows them.

## Motivation

The docs lint already fails the build when a documented example doesn't parse. The other direction is unchecked. The parser **accepts** forms that no grammar page defines, and some that a page rules out ([initial findings](#initial-findings)). Much of the sentence grammar is open-ended ("any number of units", any role letter in a slot), so it accepts whatever isn't explicitly forbidden.

Finding those forms case by case never tells us whether we're done. Learners pay for this:

- The gloss viewer, and later drills and the web UI, show a confident gloss for text that isn't Agalan. An invalid sentence gets no correction.
- A doc typo that happens to land on an accepted but undefined form passes the build.
- An accepted form with no documented reading can be read two ways, which undercuts Agalan's design goal of unambiguous syntax.

The fix is to invert the default. The parser accepts only what a registered construction licenses, and every registered construction points to the doc section that defines it.

## Part 1: construction registry

Add one registry module, `src/parse/constructions.ts`. Each entry is one grammar rule the parser may apply:

```text
id:        dependent.burl
anchor:    dependents.md#dependent-clauses
summary:   purpose-not stand-in after its pole
licenses:  /b/ stand-in "burl" immediately after a host in {holalam}
```

```text
id:        resume.short
anchor:    pronouns.md#resume
summary:   PoS + root prefix + -r picks the most recent matching word
licenses:  -r word whose stem prefixes an earlier content root in the same text
requires:  antecedent found
```

```text
id:        values.need
anchor:    values.md#…
summary:   need word with stance vowel
licenses:  need forms on /g/, /th/, /w/ only
```

Rules:

- **Reject by default.** Any parser step that attaches a unit, fills a slot, applies an ending, or accepts a closed form has to name the registry entry that licenses it. If no entry licenses it, the result is a parse error that names the unlicensed shape (`no construction licenses burl after thadorom`).
- **Constraints live in the entry, not scattered through the parser.** An entry lists the allowed hosts, slots, role letters, and endings. The parser checks them in one place, so narrowing a rule means editing its entry.
- **Anchors must resolve.** The build fails if an entry's anchor isn't a real heading or `<a id>` on a grammar page.
- **Error messages carry the anchor**, so the lint and the gloss viewer can point the learner to the page that shows the right form.

This covers all three layers: word and classify level (endings, closed forms, where values and **-x** may go), the sentence parser (slots, order, stand-ins, linkers, shared scales), and resolve (antecedents for **-r** and digitless-number **-r**).

## Part 2: two-way coverage check

`parse()` returns the construction IDs it applied, along with the tree. `lint-agalan-docs` then checks both directions:

1. **Docs → registry (already mostly done).** Every doc example parses using only registered constructions.
2. **Registry → docs (new).** Every registered construction is used by at least one example on the page its anchor names. A construction no page exercises is one the docs never taught, so the build fails. You then either add a teach example to that page, or narrow or delete the entry.

Check 2 is what makes "Is the parser too loose?" answerable. The registry is a finite list, and each entry is backed by a doc example, so an accepted form is either explained by a documented construction or rejected.

The lint's summary line gains a count: `N constructions, all exercised by their anchor page`.

## Negative tests

Invalid forms stay in code, not in the docs. *Compare with* and *not X* lines on grammar pages show **other valid forms** with different meanings, so they can't serve as rejection tests. Add `src/parse/invalid-forms.test.ts`: each row is an input that must throw, the construction ID whose constraint rejects it, and one valid neighbor that must parse (for example `… thadorom burl …` rejected, `… holalam burl …` accepted).

## Initial findings

Checked on 2026-09-25 with `node scripts/parse.mjs`: the parser **accepts** every input below. Under Parts 1 and 2, each one either loses its license (a registry constraint rejects it) or needs a doc decision, then a teach example. **Decide** marks rows where the docs don't yet say which.

| Accepted input | Likely registry outcome | Doc basis |
|----------------|-------------------------|-----------|
| `… thadorom burl …` | `dependent.burl` hosts = `{holalam}` | [dependents](../grammar/dependents.md): "The one exception is purpose-not: **`holalam burl`**." |
| `… hezazam barl …` | `dependent.barl` hosts = listed poles | [dependents](../grammar/dependents.md#dependent-clauses) pole list |
| `… hezebam thadorom barl …` | pole stacks limited to the documented **`theberom thurugum`** | [causation](../grammar/causation.md) |
| `… thezebam barl …` | *although* pole on `/h/` only, unless the page adds `/th/` | dependents. **Decide.** |
| `zazawan xezebal vawalal.` | `linker.discourse` only at the start of a sentence | [dependents](../grammar/dependents.md#sentence-linkers) |
| `zazawan vawalal hogobor.` | `resume.short` requires an antecedent | [pronouns](../grammar/pronouns.md) |
| `zazawan g+r.` | `number.digitless.resume` requires a prior number | [numbers](../grammar/numbers.md) |
| `zodogol.` / `zululon dagadal.` / `zodogol om banabal.` | the clause requires a `/v/` or a documented predication shape | [predication](../grammar/predication.md). **Decide** whether a lone noun is a citation utterance. |
| `zazawan zel gelem h+2 vawalal.` / `zazawan zel h+ vawalal.` | `join.rank.shared` scale = `/ɡ/`, or `/h/` immediately after the join | [comparatives](../grammar/comparatives.md#manner-scale) |
| `zual gagadalx.` | `plural.x` slots exclude join-scoped `/ɡ/` | [plurality](../grammar/plurality.md). **Decide.** |
| `jonogotham zazawan vawalal.` / `zazawan hagadum vawalal.` | `values.need` slots = `/ɡ/` / `/th/` / `/w/` | [values](../grammar/values.md) |
| `zazawan thabenem vawalal.` / `zodogol gerenem vawalal.` | `values.need` roots = need inventory | values. **Decide** against the overlays. |
| `jol.` / `jom.` | `question.polar` requires a body | [questions](../grammar/questions.md). **Decide** whether *Huh?* gets a reading. |
| `jelel.` | `/j/` forms = published series only | [speech-moves](../grammar/speech-moves.md) |

## Rollout

1. **Registry with no enforcement.** Build the registry from what the parser does today, one entry per rule. Make `parse()` report construction IDs. Run check 2 and see which constructions have no example on their anchor page. That list replaces hand-collected findings like the table above.
2. **Enforcement.** Switch to reject-by-default. Add constraints entry by entry, starting with the rows above, each with an `invalid-forms` test.
3. **Resolve every uncovered construction** in the docs: add a teach example, narrow the entry, or delete it. Once none remain, check 2 becomes a build failure.

## Effect on learners

- Invalid input gets an error that points to the page teaching the right form. It no longer gets a plausible gloss.
- Every form the parser accepts has a page that teaches it, so tools and docs describe the same language.
- Nothing that is currently documented changes. Every doc example must still parse, and `npm run build` checks that.

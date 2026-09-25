# Proposal: reject-by-default parser with a doc-anchored construction registry

**Status:** PROPOSED (tooling, not a language change).  
**Related:** [clause.md](../grammar/clause.md), [marking Agalan](../meta/grammar-docs.md#marking-agalan), [src/parse/](../../src/parse/), [scripts/lint-agalan-docs.ts](../../scripts/lint-agalan-docs.ts)  
**Design authority:** none. The grammar docs decide what is legal. This proposal makes the parser prove it follows them.

## Motivation

The docs lint already fails the build when a documented example doesn't parse. Nothing checks the other direction. The parser **accepts** forms that no grammar page defines, and some that a page rules out ([initial findings](#initial-findings)). Much of the sentence grammar is open-ended ("any number of units", any role letter in a slot), so it accepts whatever isn't explicitly forbidden.

Finding these forms one at a time never tells us when we're done. Learners pay for this:

- The gloss viewer, and later drills and the web UI, show a confident gloss for text that isn't Agalan. An invalid sentence gets no correction.
- A doc typo that happens to land on an accepted but undefined form passes the build.
- An accepted form with no documented reading can be read two ways, which undercuts Agalan's design goal of unambiguous syntax.

The fix is to invert the default. The parser accepts only what a registered construction licenses, and every registered construction points to the doc section that defines it.

## Principle: the grammar is the registry

We don't build a second parser or a separate detector pass that re-derives what the grammar did. The constructions are the productions the parsers already have:

- **Sentence layer.** Chevrotain rules in `src/parse/sentence-parser.ts`: about 33 `RULE`s and 44 `GATE`s today. Every CST node records the rule that produced it. Chevrotain can list the whole grammar (`getGAstProductions()` / `getSerializedGastProductions()`), so the full set of rules and alternatives is available at build time. It also supports labeled alternatives inside `OR`.
- **Word layer.** Peggy rules in `src/parse/word.peggy`, plus the `LexReading` that `classify.ts` assigns.
- **Resolve layer.** The closed set of binding outcomes in `src/parse/resolve.ts` (`AnaphorKind` × bound / unbound).

A construction ID names one of these: a rule, a labeled alternative, a word-grammar rule or reading, or a resolve outcome. Enforcement uses the parser's own mechanism, `GATE` predicates on the production that owns the rule. It doesn't use checks that run after the parse.

## Part 1: construction registry

`src/parse/constructions.ts` maps each production to its doc anchor and summary:

```text
id:        dependent.burl            (labeled ALT in the stand-in rule)
anchor:    dependents.md#dependent-clauses
summary:   purpose-not stand-in after its pole
gate:      previous host ∈ {holalam}
```

```text
id:        resolve.content.bound
anchor:    pronouns.md#resume
summary:   -r word binds the most recent matching content word
```

Rules:

- **Complete by construction.** A test compares the registry with the grammar that Chevrotain and Peggy report. Every rule and labeled alternative needs an entry, and every entry must name a real production. A new grammar rule without an anchor fails the build.
- **Granularity follows the grammar.** A rule too coarse to name one documented construction (for example, a catch-all `unit`) gets **split in the grammar**, so the parser itself becomes more precise, not just the report.
- **Constraints live on the production.** A narrowing is a `GATE` on the rule or alternative that owns it, and the gate's condition sits next to that rule's registry entry. The post-parse `validate*` functions in `sentence-parser.ts` move into gates over time.
- **Anchors must resolve.** The build fails if an anchor isn't a real heading or `<a id>` on a grammar page.
- **Error messages carry the anchor.** When a gate refuses input, the error names the construction and its anchor (`no construction licenses burl after thadorom — dependents.md#dependent-clauses`), so the lint and the gloss viewer can point the learner to the right page.

## Part 2: two-way coverage check

`parse()` can return the construction IDs a parse used. It reads them off the CST (rule names and labeled alternatives), the word-grammar trace, and the resolve binds. There's no separate tree walk. `lint-agalan-docs` then checks both directions:

1. **Docs → grammar (mostly done already).** Every doc example parses.
2. **Grammar → docs (new).** Every construction is used by at least one example on the page its anchor names. If no page exercises it, the docs never taught it, and the build fails. The fix is to add a teach example to that page, or to narrow or delete the production.

Check 2 is what makes "Is the parser too loose?" answerable. The grammar is finite, and each production is backed by a doc example. An accepted form is therefore either explained by a documented construction or rejected.

The lint's summary line gains a count: `N constructions, all exercised by their anchor page`.

## Negative tests

Invalid forms stay in code, not in the docs. *Compare with* and *not X* lines on grammar pages show **other valid forms** with different meanings, so they can't serve as rejection tests. Add `src/parse/invalid-forms.test.ts`. Each row gives an input that must throw, the construction whose gate rejects it, and one valid neighbor that must parse (for example, `… thadorom burl …` is rejected and `… holalam burl …` is accepted).

## Initial findings

Checked on 2026-09-25 with `node scripts/parse.mjs`: the parser **accepted** every input below before phase 2 (see [Rollout](#rollout) for what is now rejected). Each one either loses its license (a gate rejects it) or needs a doc decision followed by a teach example. **Decide** marks rows where the docs don't yet say which.

| Accepted input | Likely outcome | Doc basis |
|----------------|----------------|-----------|
| `… thadorom burl …` | `dependent.burl` gate: host ∈ `{holalam}` | [dependents](../grammar/dependents.md): "The one exception is purpose-not: **`holalam burl`**." |
| `… hezazam barl …` | `dependent.barl` gate: host ∈ listed poles | [dependents](../grammar/dependents.md#dependent-clauses) pole list |
| `… hezebam thadorom barl …` | pole stacks limited to the documented **`theberom thurugum`** | [causation](../grammar/causation.md) |
| `… thezebam barl …` | *although* pole on `/h/` / `/ɡ/` only | [dependents](../grammar/dependents.md#dependent-clauses). **Decided:** reject. |
| `zazawan xezebal vawalal.` | discourse linker only at the start of a sentence | [dependents](../grammar/dependents.md#sentence-linkers) |
| `zazawan vawalal hogor.` | `resolve.content.unbound` is unlicensed for a **short** resume; full-root **-r** with no match = *the one you both know* | [pronouns](../grammar/pronouns.md) |
| `zazawan g+r.` | `resolve.number.unbound` is unlicensed | [numbers](../grammar/numbers.md) |
| `zodogol.` / `zululon dagadal.` / `zodogol om banabal.` | valid: [existence](../grammar/predication.md#existence), `zodogol.` = *There is a dog.*, `zodogol om banabal.` = *There is a dog near a bank.* `zululon dagadal.` is **rejected**: an object `/d/` needs a `/v/`. | [predication](../grammar/predication.md) |
| `zazawan zel gelem h+2 vawalal.` / `zazawan zel h+ vawalal.` | rank-join shared scale = `/ɡ/`, or `/h/` immediately after the join | [comparatives](../grammar/comparatives.md#manner-scale) |
| `zual gagadalx.` | **-x** excluded on join-scoped `/ɡ/` | [joins](../grammar/joins.md#universals-domains-generics): the kind after **`ua`** / **`uo`** takes no **-x**. **Decided:** reject. (Collective SHARED `/ɡ/`…**-x** after **`a`** stays valid.) |
| `jonogotham zazawan vawalal.` / `zazawan hagadum vawalal.` | need forms on `/ɡ/` / `/th/` / `/w/` only | [values](../grammar/values.md) |
| `zawaral gabenethal.` | the need form (ROOT + `th` + stance vowel) takes only the six inventory roots; read the list from the `need` overlays | [values](../grammar/values.md#need-inventory). **Decided:** reject. |
| `jol.` / `jom.` | stays valid: bare `jol.` = *Huh?*, `jom.` = *Hm?* | [questions](../grammar/questions.md#question) |
| `jelel.` | stays valid: a `/j/` call on **-l** is taught (`jubal.`, `jagadalx.`) | [speech-moves](../grammar/speech-moves.md) |

## Rollout

1. **Registry, no enforcement.** *Done 2026-09-25.* The registry is in `src/parse/constructions.ts`, the tracing in `src/parse/construction-trace.ts` (`parse(…, { constructions: true })`, CLI `--constructions`), and the tests in `src/parse/constructions.test.ts`: every grammar production has an entry and every anchor resolves. Standalone joins and utterance bodies got `LABEL`s. `lint-agalan-docs` prints the coverage report. The first run found 176 constructions, 147 exercised by their anchor page and 29 not. Highlights:
   - `?` / `!` sentence ends are used on no page.
   - Standalone `/h/` / clause joins and shared words after `/v/` / `/h/` / clause joins are used on no page.
   - `/d/` / `/b/` joins are never shown on joins.md.
   - `-x` on `/w/` / `/h/` / `/th/` / `/x/` is used on no page.
   - Hook compounds and the *means* reading are used on no page.
   - Unbound `-r` appears on numbers-applied.md and plurality.md.

   Not yet surfaced: shape-level combinations that reuse registered child keys (bare `jol.`, a mid-sentence linker, values on `/h/`). Those need rule splits or gates in step 2.

   Original step text: Label alternatives and split coarse rules until each production names one documented construction, keeping every current doc example parsing. Map productions to anchors. Add the completeness and anchor tests. Have `parse()` report construction IDs behind an option. Run check 2 in report-only mode. Its list of unexercised constructions replaces hand-collected findings like the table above.
2. **Enforcement.** *Mostly done 2026-09-25.* Rejections live in `src/parse/enforce.ts` (`ConstructionError` names the rule and its anchor from `REJECTIONS` in `constructions.ts`); rows are in `src/parse/invalid-forms.test.ts`. Grammar-level removals: `?` / `!` sentence ends, SHARED after `/h/` / `/th/` / `/x/` joins, a shared `/ɡ/` after a `/v/` join, a stand-in as the as-of bound, a new utterance with no period before it (this is what let a mid-sentence linker through), and the dead `means` reading. Enforced from the findings table: stand-in hosts (`clause_pole` overlays; `burl` only after `holalam`), pole stacks (`theberom thurugum` only), linker placement, short unbound **-r**, `/z/` + `/d/` with no `/v/`, a number `/h/` after a rank join, **-x** on the kind after `ua` / `uo`, need-form slot and roots, **-x** on `/w/` `/h/` `/th/` `/x/`.
   Settled after review: `/j/` words on **-l** stay valid (`jubal.`, `jagadalx.`; `jelel.` has no reading issue). Unbound number **-r** is rejected (the numbers.md drill now names a number first). Verbless fragments stay valid; only `/z/` + `/d/` with no `/v/` is rejected. `h+2` after a rank-join adjective is a plain adverb. A root ending at its 2nd vowel (`odo`) reads as a short resume.
   Still open:
   Reading IDs `reading.existence` (predication.md) and `reading.bareQuestion` (questions.md) put the new doc sections under the coverage check.
   Moved to step 3: the `validate*` checks in `sentence-parser.ts` (not user-visible; rejects the same inputs).
3. **Move `validate*` checks into gates** on the productions that own them. **Resolve every uncovered construction** in the docs: add a teach example, narrow the production, or delete it. Once none remain, check 2 becomes a build failure.

## Effect on learners

- Invalid input gets an error that points to the page teaching the right form. It no longer gets a plausible gloss.
- Every form the parser accepts has a page that teaches it, so tools and docs describe the same language.
- Nothing that is currently documented changes. Every doc example must still parse, and `npm run build` checks that.

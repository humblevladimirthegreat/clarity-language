# Proposal: parser rule consolidation

**Status:** PROPOSED. Editors only.  
**Scope:** parser code under [`src/parse/`](../../src/parse/) only. The set of Agazan sentences the parser accepts and rejects does not change, and the grammar docs do not change.  
**Allowed to change:** AST shapes, internal readings, construction IDs, and a few morph-gloss brackets. Each item says which ones.  
**Design authority:** [`docs/grammar/`](../grammar/introduction.md). The parser implements the docs ([parser pipeline](../meta/parser-pipeline.md)).

## Why

The parser grew one rule at a time. That was most visible while the recipe track (`say-*.md`) and the syntax-test gaps were being plugged ([syntax test results](../meta/syntax-test-results.md)). Each gap fix added its own lookahead gate, AST field, gloss flag, or enforce check, even where the grammar docs state one general rule. The result is several copies of the same rule, each covering one context. They already disagree in small ways (see B1 for a live bug).

Goal: **fewer special cases**. Where the docs state one rule, the parser should have one production, one AST shape, and one place that decides it. Where a distinction exists only in the parser and nothing downstream reads it, drop it.

## Summary

| ID | Change | Special cases removed | Distinction dropped | Risk |
|----|--------|-----------------------|---------------------|------|
| A1 | One shared-scale rule for `gral` / `hral` / `bral` | `timeScaleAhead`, `isFrequencyScale` exemption, `isAmountScale` gloss flag, bare-`LexWord` case of `CoordShared`, 4 copies of the scale series set | `sentence.sharedAfterJoin.timeScale` | low |
| A2 | One hosted-`/b/` slot shape and rule | `hostedLandmarkAdjAhead` (looks backward), `sharedLandmarkAdjAhead`, `nestOnExtraNoun`, `boundAmount`, `VpCoord.hosted`, the `GPackage` / `HUnit` twin walkers | per-host construction IDs for the `/b/` tail | medium |
| A3 | The parser decides each hook's job once | `contextFor` hook branch, `isHostedLandmark`, `isLeftEdgeHook`, `itemHook` labels, the literal `em` in `isExistence` | none (gains structure) | medium |
| A4 | One left-edge force-pair rule | `julEchoAhead`, `rhetoricalAhead` (literal-image gates) | `forceEcho` vs `rhetoricalAnswer` fields | low |
| A5 | *Respectively* checked in one place | `enforceRespectivelyToken` | none | low |
| B1 | Word position on every word; stop matching by spelling | raw-spelling cursors in 3 files, raw queues and counters in `morph-gloss.ts` | none (fixes a bug) | low |
| B2 | One AST visitor | 7 hand-written walkers kept in sync by hand | none | low |
| B3 | One ordered classify table | `classify` / `classifyHits` duplicate chains; `classifiedShape` second reshape order | none | low |
| B4 | Overlay readings collapse to `overlay` | 6 `LexReading` values that only copy `overlay.kind` | `locative`, `similative`, `ofRelation`, `exchange`, `proxy`, `stimulus` readings | low |
| B5 | One stand-in test and one dependent split | 3 near-identical `is*StandIn` tests; 3 split branches in `finalizeClause` | none | low |
| B6 | One noun-phrase list rule for `/z/` `/d/` `/b/` | three copies of `*Coord` / `*CoordPart` | per-slot construction IDs for conjunct and join close | low |
| B7 | Shared series and number helpers | duplicated join-series tables, 2nd-vowel cut ×3, digitless tests ×5 | none | trivial |
| B8 | The grammar owns utterance splitting | `splitUtteranceGroups` in `parse-core.ts` | none | medium |
| B9 | Review the post-parse rewrite passes | `disambiguateClause` (2 cases), `mergeAdjLists`, `mergeIslandJoins` | TBD | high; audit only |

Suggested order: B1 and B2 first, because they make every later item smaller. Then A1, A4, A5, B3–B7, then A2 and A3, then B8. B9 stays an audit.

---

## A. Rules from recipe and gap work

### A1. One shared-scale rule {#a1}

**Docs:** [comparatives § amount scale](../grammar/comparatives.md#amount-scale), [§ frequency scale](../grammar/comparatives.md#frequency-scale), [§ time scale](../grammar/comparatives.md#time-scale). One rule: a digitless **`+`** number shared right after a rank join (`e` / `ue` / `ae` / `oe`) is the scale, and its PoS picks what is ranked: `/ɡ/` how many, `/h/` how often, `/b/` how late.

**Today:** three routes.

- `gral` rides the ordinary shared-`/ɡ/` path. The gloss sees a flag, `isAmountScale` in `morph-gloss.ts`, computed from the *previous word* in the flat list.
- `hral` rides shared `/h/`. `enforce.ts` then rejects numbers after a rank join (`rankJoinNumberManner`), with `isFrequencyScale` carved out as an exception. The gloss uses the same `isAmountScale` flag.
- `bral` (G-03) has its own gate `timeScaleAhead`, its own CST label `timeScale`, and is stored in `shared` as a **bare `LexWord`**. That extra case in `CoordShared` is why every walker has an `if ("raw" in item)` branch. It glosses through a general `/b/` digitless rule in `numberLabel` (`b-later`), not through the scale flag.

The "digitless `+`" test is written five times (`timeScaleAhead`, `isFrequencyScale`, `isAmountScale`, `isDigitlessNumberBlank`, `numberLabel`). The scale series set is written four times, and the `resolve.ts` copy leaves out `ae` on purpose.

**Proposed:** `sharedAfterJoin` gets one alternative, a *scale number*: a `G` / `H` / `B` token holding a digitless `+` stem after a scale-series join. It builds a `{ kind: "scale", word }` shared item. `rankJoinNumberManner` then needs no exemption, because a scale number is no longer an `/h/` manner word. The gloss reads the item kind plus the PoS from one table (`g` amount, `h` how-often, `b` later). `CoordShared` loses its bare-`LexWord` case.

**Drops:** the construction ID `sentence.sharedAfterJoin.timeScale`, which becomes one `sharedAfterJoin.scale` anchored per PoS. **Gloss:** unchanged.

### A2. One hosted-`/b/` slot {#a2}

**Docs:** [clause § complex chaining](../grammar/clause.md#complex-chaining): after a host and its `/b/`, "a plain adjective after that pair describes the **extra noun**", and "the same holds after an `/h/` host". Measure amounts on a hosted `/b/` come from [knowing § dated channel](../grammar/knowing.md#dated-channel) and G-15.

**Today:** the hosted `/b/` slot is parsed and stored four ways.

| Host | Parse | Trailing `/ɡ/` on the landmark | Amount |
|------|-------|--------------------------------|--------|
| `/ɡ/` (`gPackage`) | `B` + `boundJoinTail?` | the caller collects later adjectives, then `nestOnExtraNoun` re-nests them after the build | — |
| `/h/` (`hUnitRule`) | `B` + `boundJoinTail?` | `hostedLandmarkAdjAhead`, which looks **backward** with `LA(0)` / `LA(-1)` to find the host | `boundAmount` (non-ordinal numbers only, STC-117) |
| SHARED `/ɡ/` after a join (STC-149) | through `gPackage` | `sharedLandmarkAdjAhead`, a second gate | — |
| label-scope `tho` verb | `OPTION3` in `vpCoordPart` | none | — |
| hook on a join item (G-18) | `itemHook` + `itemHookBound` labels | none | — |

Types: `GPackage` and `HUnit` carry the same four fields under different names. `VpCoord.hosted` is a third shape, and the item hook is faked as a `GPackage` whose "word" is a hook. Resolve, gloss structure, inspect and enforce each carry a twin walker for `GPackage` vs `HUnit`.

**Proposed:** one type and one sub-rule.

```ts
type Hosted = { bound: LexWord; boundJoin?: BoundJoin; amount?: LexWord; adjs: GPackage[] };
```

`hostedBound(hostKind)` parses `(B | Odo) boundJoinTail? amount? landmarkAdj*`. `/ɡ/`, `/h/`, `tho` verbs, shared relations and item hooks all call it. The one real exception stays as a parameter: after a `/th/` host, the `/b/` is an offset or source, so no landmark adjectives follow (STC-67). The adjectives are consumed inside the rule, so no gate needs to look back, and `nestOnExtraNoun` goes away.

**Check before doing:** today, after a `/ɡ/` host, a count right after the `/b/` is taken as an adjective on the landmark. Under A2 it would become `amount`, as it already is after `/h/`. The set of accepted sentences is unchanged. The AST differs, and the morph-gloss brackets stay the same shape.

**Drops:** the construction IDs `hUnitRule.B` / `hUnitRule.G` / `hUnitRule.gPackage` / `gPackage.B` / `vpCoordPart.B` / `npPackage.itemHook*` collapse into `hostedBound.*`. That loses the distinct anchors for "hosted `/b/` after `/ɡ/`" (predication) vs "after `/h/`" (clause). If the anchors matter for the construction explorer, keep them by passing the host kind into the trace.

### A3. The parser decides each hook's job once {#a3}

**Docs:** [hooks](../grammar/hooks.md): discourse hooks, in-clause hooks, [extra noun](../grammar/hooks.md#genitive), spans. Gap rulings G-07 (`em` makes a noun known), G-08 (a hook + `/b/` after a **landmark** describes that landmark) and G-18 (a hook + `/b/` before a noun join word belongs to that item).

**Today:** the hook's job is decided in three places that do not share code.

- The sentence parser decides left edge vs in-clause (`discourseHookAhead`, "a `/b/` right after makes it extra-noun") and the join item (`itemHookAhead`).
- `morph-gloss.ts`'s `contextFor` decides it **again** from the flat word list: `extraNounHook`, `spanHook`, `discourseHook` after an `/x/` join, and the G-08 landmark walk `isHostedLandmark`. G-08 exists **only** here. The AST keeps `al bahedem om bamegun` flat, so resolve, inspect and the gloss brackets never see it.
- `construction-trace.ts`'s `isExistence` checks `unit.word.raw === "em"` followed by a `/b/` unit (G-07).

**Proposed:** the parser records a `job` on each hook unit: `discourse` / `clause` / `extraNoun` / `span` / `resume`. A hook + `/b/` that belongs to a noun (G-08 after a landmark, G-18 before a join word) is parsed into that noun's slot through A2's `hostedBound`, as a hook pair next to the landmark adjectives. The gloss reads `job` and never re-derives it. `isExistence` asks "does the head package carry a genitive pair?" instead of scanning for the spelling `em`.

**Gloss effect:** G-08 sentences gain one bracket level: the second hook pair nests inside the first landmark's bracket instead of sitting beside it. That is a gloss-line change, not an Agazan change. Documented morph lines for those examples would be refreshed with the regloss script.

**`em` (decided: option A, always on the noun to its left).**

*Docs.* G-07 and [hooks § whose](../grammar/hooks.md#genitive) both say `em` "attaches to the noun", and that a noun marked with `em` counts as known (`zodogal gelavam em bamegun` *My dog is big*). The documented glosses disagree: they bracket the pair as a sibling (`[z-dog | g-big] | [used-by | b-speaker]`). For extra-noun hooks in general, hooks.md leaves the attachment open ("toward the clause, or toward the noun already in play"). So `em` is the only hook whose attachment to a noun is actually stated.

*Parser.* The AST never attaches `em` to a noun, except as a G-18 join item. `zodogal em bazawan varahal` has the same shape as `zodogal al bahedem varahal`. G-07 lives only in `isExistence`, which matches any hook spelled `em` followed by a `/b/` anywhere in the rest of the clause. That misfires:

| Sentence | Reading today | Should be |
|----------|---------------|-----------|
| `zodogal gelavam em bamegun.` | property | property |
| `zodogal em bamegun gelavam.` | existence | existence (*big* is on the speaker) |
| `zodogal gelavam al bahedem em bamegun.` | **property** | existence: G-08 puts `em` on the village, and the dog is not marked |

*Rule.* An `em` + `/b/` pair attaches to the **nearest noun phrase on its left**, after that noun's own `/ɡ/` adjectives and `/w/` words. It goes into the noun's hosted slot (A2), just as a landmark takes its adjectives. The noun phrase can be:

- a `/z/` or `/d/` noun (`zodogal gelavam em bamegun`, `zazawan dahazal em balahen vahahal`);
- a landmark `/b/` (`ol bazewem em behodon bal`; `ael buvudul gazebam em bazar`, STC-119);
- a join item before its join word (G-18, `zazawan zodogal em bazar zal`);
- a standalone join with its shared kind (`dual gerebum em balahen …`, STC-202).

`isExistence` then asks whether the first noun carries an `em` pair, which fixes the misfire above. The glosses nest the pair inside the noun's bracket (`[z-dog | g-big | [used-by | b-speaker]]`), which matches the prose. The documented `em` glosses in hooks.md, joins.md, relations.md and say-people-places.md get regenerated.

**Right after a recipient `/b/`**, `em` stays the same-role hook (*or rather*, open), as hooks.md already says for every hook. That is not the genitive and does not change.

*With no noun on its left: reject (confirmed).* A new named rejection, `genitiveHost` ("`em` + `/b/` follows the noun B uses", anchored to hooks.md § whose), covers `em` + `/b/` after a verb, an adverb, a stance word, or at the start of a sentence. Today these parse as a clause extra *used-by B* (`zazawan vowogal em bamegun` → `v-walk | [used-by | b-speaker]`).

- **The docs define no clause-level genitive.** hooks.md places `em` "right after the noun" and says B uses *the thing*. Accepting a clause-level `em` would mean the parser inventing a reading the docs never teach.
- **An act as someone's already has a route.** *Azawan's walk* is ruled by design (G-13): say the act as its own sentence, then resume it. The rejection points there.
- **Nearby clause meanings have their own hooks.** *For B* is `el`, *using* is `ael`, *by* is `aem`. A clause-level `em` would only overlap with them.
- **Nothing depends on it.** A search of every `em` + `/b/` under `docs/` (grammar, meta and proposals; 60 hits) found a noun, a noun's adjective, or a landmark on the left every time. The only exceptions are four citation fragments in prose (`em bamegun` *my*, `em behodon` *your*, `em bazar`, `em bamegunx`) and this page's own probe sentence.

The parser cannot check hooks.md's other limit, that `em` never takes a person on its left (`zazawan gamadam em bamegun`), because personhood is not in the lexicon. That stays a teaching rule.

*Doc follow-up (done).* The ruling is a G-07 addendum in [syntax test results](../meta/syntax-test-results.md), and hooks.md § whose now says that `em` needs a noun on its left. Still to do in code: the `genitiveHost` rejection and attaching the pair to the noun.

### A4. One left-edge force-pair rule {#a4}

**Docs:** [speech-moves § emphatic prohibition](../grammar/speech-moves.md#emphatic-prohibition) (`yul yul`) and [questions § rhetorical](../grammar/questions.md#rhetorical) (`yal yol` / `yam yol` / …).

**Today:** two separate optional prefixes before the act word, each gated by a check on the **literal image** (`a.image === "yul"`). Each has its own CST label (`ForceEcho`, `ForceAnswer`) and its own `LeftEdge` field (`forceEcho`, `rhetoricalAnswer`). Resolve reads one of them.

**Proposed:** the grammar accepts `Force Force?`. One table lists the legal pairs by series (`u`+`u` emphatic; `a`+`o` rhetorical, with either ending), and `enforce` rejects any other pair with a named rejection. `LeftEdge` gets `leadForce?: LexWord`. Resolve's rhetorical test becomes "`leadForce` is series `a` and `force` is series `o`". Adding another pair later (if the docs ever add one) is one table row.

**Drops:** the two `LeftEdge` fields and the two construction IDs, which become `leftEdge.leadForce` with the anchor chosen per pair.

### A5. *Respectively* checked in one place {#a5}

**Today:** `wazagum` is checked twice. `enforceRespectivelyToken` scans tokens ("must sit right before a `/z/` `/d/` `/b/` join word"). `enforceRespectively` walks the AST ("every join modifier must be *respectively*, on an and-list, with a same-length partner").

**Proposed:** keep only the AST check, extended to fail on a pairing overlay found anywhere other than `joinModifiers`, including a `/w/` on an adjective or adverb. With B2's visitor this is a single "every `/w/` word" pass.

---

## B. Structural duplication

### B1. Word position on every word {#b1}

**Today:** after parsing, several consumers find a word's position in the line again by **matching its spelling**:

- `gloss-structure.ts` `Cursor.take` (first unused word with the same `raw`).
- `inspect.ts` `takeRaw` / `findWordIndex`.
- `morph-gloss.ts`: `dependentVerbCounts` (counts per spelling), `standaloneJoinIndexes` (a queue per spelling), `isFillAsk` and `isLeftEdgeHook` (**any** word with that spelling), and `bindFor` (the nth `-r` word with that spelling).

**Live bug:** in `al zazawan vowogal. zazawan al zalahen zal vowogal.` the in-clause `al` in the second sentence glosses as *additionally*, because `isLeftEdgeHook` matches every `al` once the first sentence opens with one:

```text
additionally | z-Azawan | v-walk . z-Azawan | additionally | [z-Alahen | z-and] | v-walk
```

The same pattern can mislabel fill-ask gaps and standalone joins when a spelling repeats.

**Proposed:** `tokenize` stamps each `LexWord` with its word index (`at: number`). Every consumer reads `word.at`. The cursors, queues and counters go away. No distinction is dropped, and the bug is fixed.

### B2. One AST visitor {#b2}

**Today:** `resolve.ts` (`consider*`), `enforce.ts` (`enforceStructure` and `enforceClause`, two separate walks), `gloss-structure.ts`, `inspect.ts` (`walk*`), `morph-gloss.ts` (a reflective walk over `Object.entries`), and `construction-trace.ts` each walk the AST by hand. Every new AST field (for example `boundAdjs` in STC-67, `joinModifiers` / `factor` in the ratio work) had to be added to each walker, and the misses show up as silent gaps.

**Proposed:** one `visit(result, handlers)` in a new `ast-walk.ts`. It yields words in surface order with their enclosing unit, part and slot, and fires enter/exit hooks per node kind. Resolve, enforce and inspect become handler sets. The gloss tree stays a fold, because it builds structure, but uses the same child order. Adding an AST field then means editing one file.

### B3. One ordered classify table {#b3}

**Today:** `classify` is a first-match chain. `classifyHits` repeats the same chain, collecting every hit, for the ambiguity checker. The two copies are already written differently: `classifyHits` tests sake roots inline and skips the seam reshape, while `classify` reshapes first and then tests the sake family. They agree today only because the two differences cancel out. Separately, the "`ROOT th …` seam" reshape (tail lateral, holder seam, landmark lateral, label scope) runs recursively inside `classify` and runs again in `classifiedShape`, in a different order.

**Proposed:** one array of `{ source, test, build }` rules. `classify` returns the first hit, and `classifyHits` maps all of them. The seam reshape runs once, as a `reshape(word)` step before the table.

### B4. Overlay readings collapse to `overlay` {#b4}

**Today:** `overlayReading` maps overlay `kind` into `LexReading` values `locative`, `similative`, `ofRelation`, `exchange`, `proxy`, `stimulus` and `mood`. Nothing outside `classify.ts` and the `OverlayOnlyReading` type branches on the first six. They only copy `overlay.kind`. `mood` is read by `ambiguity.ts` (a set check) and indirectly by resolve.

**Proposed:** one reading, `overlay`, for every non-join overlay. Consumers that care read `word.overlay.kind`. `joinAct` / `joinRelation` stay, because token classification branches on them. **Drops** six reading values. Construction IDs are unaffected: overlay words already trace as `overlay.*`.

### B5. One stand-in test and one dependent split {#b5}

**Today:** `isStandIn`, `isBackStandIn` and `isNamedStandIn` repeat the same guards with different ending sets. `finalizeClause` then splits a matrix from its dependent in three branches: a named verbal stand-in (with an implied-subject series set), a stand-in hosted on `/h/`, and a stand-in in a noun phrase. Each branch has its own slicing code.

**Proposed:** `standInKind(word): "forward" | "back" | "named" | undefined`, and a `standInIn(unit)` that returns the stand-in word for any unit kind, followed by one split. The implied-subject rule for named verbal stand-ins stays as a table row.

### B6. One noun-phrase list rule {#b6}

**Today:** `zCoord` / `dCoord` / `bCoord` and `zCoordPart` / `dCoordPart` / `bCoordPart` are three copies that differ only in the slot letter. The CST readers then re-merge them (`npCoordCst`, `npCoordParts`).

**Proposed:** one `npCoord` and one `npCoordPart`, taking the slot as a Chevrotain `ARGS` parameter. `unit` keeps three labeled alternatives, so `unit.zCoord` / `unit.dCoord` / `unit.bCoord` survive. **Drops** the per-slot inner IDs (`zCoordPart.npConjunct`, …), which all point at the same join sections anyway.

The `/v/`, `/ɡ/` and `/h/` list rules share the same "items, then optional join close, or a standalone join" shape. Merging those too is possible, but each has a different item rule, and a generic rule would need gates keyed on its arguments. Leave them unless B6 goes smoothly.

### B7. Shared series and number helpers {#b7}

Small, but each copy has been edited separately:

- The join-series English is written twice (`JOIN_SERIES_GLOSS` in `classify.ts`, `JOIN_JOB` in `morph-gloss.ts`), and the two use different wording for the same series.
- The scale / rank series set is written 4 times (see A1).
- The 2nd-vowel resume cut is written 3 times (`shortResumeStem`, `letterPrefix`, the loop in `publishedShortResumeStems`).
- The digitless-stem test is written 5 times (see A1).

**Proposed:** a `series.ts` holding one table per series fact, and `isDigitless(stem)` / `resumeCut(root)` in one place.

### B8. The grammar owns utterance splitting {#b8}

**Today:** `parse-core.ts` pre-splits the token stream at any `.` followed by a left-edge starter (polar, force, vocative, hook) and parses each piece separately. The Chevrotain grammar also has a multi-utterance `document` rule. The two disagree: without the pre-split, a hook after `.` would be read as an in-clause hook of the next body, not a new left edge. So one language rule ("after a sentence end, a turn word or discourse hook opens a new utterance") lives outside the grammar.

**Proposed:** move it into `utterance` (stop the `Period` loop when a left-edge start follows) and delete the pre-split. **Risk:** error messages change position, because one bad utterance no longer isolates the others. Keep the pre-split if that isolation is wanted, but then drop the grammar's multi-utterance loop, so exactly one of them owns the rule.

### B9. Audit the post-parse rewrite passes {#b9}

`finalizeClause` rewrites the parsed units three times: `mergeIslandJoins`, `mergeAdjLists`, and `disambiguateClause` (two verbless-predicate cases). Each exists because the grammar cannot decide something with its lookahead of 2. They are the riskiest place to simplify and are **not** proposed for change here. The audit would list, for each pass, the doc rule it implements and whether A2 or B6 makes it unnecessary. For example, the second `disambiguateClause` case may disappear once `/ɡ/` join closes are parsed by one list rule.

---

## Verification

For every item:

1. `npm test`, including the parser fixture suites, the invalid-forms suite, and `constructions.test.ts` (which keeps the construction registry complete against the grammar).
2. `npm run build`: every Agazan code span in `docs/grammar/` must still parse, and every documented morph line must still match. The accepted-sentence invariant is exactly this check.
3. A before/after diff of `node scripts/parse.mjs -` over all example sentences in `docs/grammar/` and the syntax-test corpus. Expected differences are limited to the AST shapes named in each item.
4. For A3 only: regloss the G-08 examples whose brackets gain a level, and review the diff by hand.

## Not in scope

- Grammar changes, including new rulings on G-07 (see A3) or G-19.
- Performance (see `parser-optimization.md`).
- The Peggy word grammar. Its alternation order mirrors [x-compounds decision order](../grammar/x-compounds.md#decision-order) on purpose, and no duplicate rules were found there. The only reshaping is the classify step in B3.

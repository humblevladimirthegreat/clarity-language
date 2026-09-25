# Learning-order check

**Status:** proposal (editors only).

**Goal:** fail `npm run build` when any grammar-page section uses Agalan grammar that has not been taught yet by that point in the learning order. The check is driven by the parser's existing construction trace. There is no preview exemption.

## What already exists

- **Construction registry:** [constructions.ts](../../src/parse/constructions.ts) maps every production the parser can apply (`sentence.*`, `token.*`, `word.*`, `resolve.*`, `reading.*`) to the `page.md#anchor` that teaches it. Completeness is already tested against the Chevrotain grammar and the typed `Record<>`s.
- **Per-parse trace:** [construction-trace.ts](../../src/parse/construction-trace.ts) collects the construction IDs one parse used.
- **Page-level coverage:** `checkConstructionCoverage` in [lint-agalan-docs.ts](../../scripts/lint-agalan-docs.ts) already fails when a construction is not used on its anchor's **page**. This check tightens it to the anchor's **section**.
- **Rejections:** `REJECTIONS` anchors already point to the rule's section. They aren't used by this check, because a rejected shape is not a use.

So the check needs no new mapping. The concept ID is the construction ID, and its home is the registry anchor.

## Section position (computed at build time)

1. **Band:** the nearest `## Beginner` / `## Intermediate` / `## Advanced` heading above the anchor. Every grammar doc already uses these headings. `### Beginner forms` in joins.md sits inside `## Beginner`, so band detection should use only the level-2 headings.
2. **Doc order:** the VitePress sidebar order, read at run time. `readingOrder` lives in [reading-order.ts](../grammar/.vitepress/lib/reading-order.ts). The sidebar config and the docs lint both import it, so no copy of the order is kept anywhere else. Reordering the sidebar reorders the check.
3. **Section order:** heading order within the doc.

Global order: every Beginner band in sidebar order, then every Intermediate band, then every Advanced band. An anchor that resolves to a band-level heading (e.g. `clause.md#beginner`, `relations.md#beginner`) takes that band's first position. An `<a id>` anchor belongs to the heading section it sits in.

A **home section** is the anchor's heading together with its subsections. Registry anchors are always heading ids, never an `<a id>` inside a section (the registry test enforces this), and every id on a grammar page is unique (`lint:agalan` fails on a repeat; no `-1` / `-2` suffix references). "Taught at home" is checked per **family**: the constructions that share a home section and a first ID segment (`overlay`, `value`, `span`, `sentence`, …), usually the rows of one table. The family is taught at home when some span in that subtree traces any member. A representative example teaches the table; every cell does not need its own. Text above a page's first band heading (the page intro) is outside every band. `## See also` sections are ignored: they close the band and nothing in them is checked. Pages not in the sidebar (`english.md`, `terminology.md`, `lexicon.md`, `inspect.md`) are not checked.

## Check

For each Agalan span or block in section *S*, trace its constructions. Every construction's home position must be ≤ position(*S*). Use in the home section itself is allowed.

The build also fails when:

- **Unresolved anchor:** a registry anchor does not resolve to a heading, or sits outside every band heading.
- **Family not taught at home:** no span in the home section traces any member of the family. This keeps the anchors honest.
- **Forward link:** a markdown link from *S* targets an anchor in a later section.
- **`lint: skip`:** any occurrence in `docs/grammar/`. It's meant to be disallowed, but one exists now: `numbers-applied.md:194` (`wo zo zo jo`). Fix it by making the span parse, or by writing it another way.
- **`lint: fragment`:** these spans (2 today) are not parsed now. They should be parsed as partial phrases and traced. If a fragment can't be traced, fix the parser.
- **Other untraced spans:** templates (spans with `…` or placeholders) and ```` ```text ```` fences (12 today) are not parsed either. Templates should be parsed with the placeholder treated as a slot-filling word. `text` fences need an audit to confirm they hold no Agalan; any Agalan in them moves to ```` ```agalan ````.

## No previews

No marker exempts a span or link. When a check fails, there are two fixes: rewrite the example using constructions already taught, or move the home section earlier (and its teaching with it).

## Constructions to split

A construction ID needs splitting when it covers forms taught in different sections, since one anchor can then only be right for part of it. These are the cases found by reading the registry:

| Current ID | Why it is too coarse | Split by |
|---|---|---|
| `word.reading.mood` → `knowing.md#may` | Covers every closed `/th/` stance mood: MAY, evidentiality, RESIDUE / FORMER, NOTIONAL, universality, causation poles, CAUSE. | Closed overlay (below). |
| `word.reading.value` / `word.xFamily.value` | Need roots, the four stances (`tha` / `the` / `tho` / `thu`), and the channel / warrant / standing / changeability endings are taught in stages. | Stance vowel, need root, and ending-meaning. |
| `word.family.number` / `word.reading.number` → `numbers.md#digits` | One ID covers the whole number stem: digits, exponents, digitless `g+` / `v+` / `h+`, ordinals `#`, imaginary `-e-`, zero × exponent, bare OoM bands, stance numbers `th+N`, per-source `th_N`, group separator, percent, and `~` / `@` / `=` writing marks. The data is already in `NumberStem`. | One ID per stem feature. |
| `token.join` / `word.family.joinMarker` / `word.reading.join` | Set vs rank, each vowel (`a` … `ue`, `ae`), universals `ua` / `uo`, and arity are taught in different sections of joins.md and comparatives.md. | Join series (vowel), and arity if the parser records it. |
| `token.hook` / `word.family.hook` / `unit.hookUnit` | In-clause *including* / *rather* / *instead* / *except*, discourse glue, and each extra-noun hook are separate lessons. | Hook form. |
| `token.polar` | `jael` / `juel` / `jaol` / … are taught progressively. | Particle form. |
| `token.force` / `leftEdge.Force` | Speech-act words vary in firmness and are taught across bands. | Speech-act form. |
| `token.linker` / `bodyClause.Linker` | Each sentence linker (and `x#e-` / `x#e`). | Linker form. |
| `token.standIn` / `word.reading.standIn` | `darl` / `barl` / `dorl` / `derl` / `durl`, plus hosted vs unhosted use. | Stand-in form. |
| `word.reading.restrictor` | `hal`, `hual` (habitual), `har` … | Restrictor form. |
| `word.xFamily.span` / `token.spanOpen` | TYPE (cite / aside / mention / opaque), EDGE, and the `@` / `~` marks are staged in spans.md. | TYPE, EDGE, mark. |
| `word.xFamily.role` / `resolve.role.*` | Agent / place / patient / recipient vowels, lexical kind vs `-r` instance. | Role vowel, ending. |
| `word.reading.locative` etc. | Probably fine: already one ID per relation kind. Check once overlays get anchors. | Overlay if needed. |

**Missing entirely (fixed in phase 2):** tone marks (`!` `!!` `?` `?!` `%` `&` `;`) are accepted and then dropped by [tokenize.ts](../../src/parse/tokenize.ts) and [span-scan.ts](../../src/parse/span-scan.ts) (`toneMarkLength`), so they never reach the parse. The tokenizer should emit them as prosody tokens. The sentence grammar places them by the [tone-mark](../grammar/speech-moves.md#tone-marks) rules: attached to a word, island or span, or free-standing for the rest of the sentence. Each mark and each scope becomes a construction. Placement errors then become parse errors instead of being silently ignored.

### Closed overlays

Closed overlays are grammar, so each one gets its own construction ID (`overlay.<sense_form>.<pos>`). [lexicon-overlays.csv](../../data/lexicon-overlays.csv) has no anchor column, so the overlays have no home section yet. Add an `anchor` column there: overlays are data, so the anchor belongs in the data. Then trace `overlay.*` alongside `word.reading.*`. With these IDs in place, the split rows above for moods, restrictors, relations, polar particles, speech acts, stand-ins and linkers collapse into `overlay.*` wherever those forms are overlay rows. The registry's completeness test should also require every overlay row to have an anchor that resolves.

## What counts as a learner problem

The test is whether a reader meets a form in an example before anything has explained it. Triage of the phase 5 report (137 constructions used early, 1,100 section uses; 117 forward links; 83 uses outside every band; 128 constructions, now 21 families, not taught at home):

**Real problems (fix in phase 6):**

- **A feature used in an earlier page's examples.** For example, causation uses stance joins; comparatives uses joins and right-close; earlier pages use hook, relation, causation and knowing overlays. A gloss alone does not teach the form.
- **An advanced feature used early**, such as laterals, x-compound families, greetings / conversation length, ability, numeric derivation, or numbers-applied labels and calendar. This is worse when the use sits in a Beginner band.
- **Same-page order** where an example in an earlier section depends on a later section's form (common in numbers.md and spans.md).
- **Unexplained examples in a page intro** (above the first band heading), such as in hooks.md, restrictors.md and dependents.md. Give the intro a band, or move the examples down into a banded section.
- **A family with no example at home**, when a table or prose is the only thing that teaches the whole family. Open gaps (9 families):
  - need-inventory overlays (`/th/` and `/w/`) and `egeram`: used nowhere
  - `span.type.*` at spans.md#type-vowels and `span.close.complete` at spans.md#shape
  - `join.ue` at joins.md#invert-ua-uo-ue
  - `number.decimal` at numbers.md#digits and `number.marker.scalarNeg` at numbers.md#sign
  - `word.family.foreign` at spans.md#loans: the examples are HTML `<code>`, which the lint does not trace
  - `resolve.number.bound` at numbers.md#digitless: digitless `-r` resume is described in prose with no example

**Not problems (ignored or fixed in the checker):**

- **Table cells without their own example.** Handled by family coverage above.
- **Parser productions** (`sentence.*`, `token.*`, `word.*`, `reading.*`, `resolve.*`) whose home section clearly shows the construction but is not the section the trace lands in. A learner never sees these IDs. Fix by re-homing the production, not by adding examples. Coverage treats these five prefixes as one family per home section, since they name the same lesson at different parse levels. *Done:* role-letter productions moved to clause.md#who-acts-and-the-action (`/d/` ones to #direct-object-d); turn cluster to speech-moves.md#vocative and body to #speech-act-statement-question-command; clause `/x/` join to joins.md#right-close (where `xam` is taught); hostless clause-level `/ɡ/` to joins.md#negation-u (first `gomonam gul.`); value words to values.md#met-tha-serves-the-need; vocative `-x` to plurality.md#vocatives-j; close-all to spans.md's close-forms section.
- **Foundations homed too late.** For example, `sentence.utterance.Period` is homed in dependents.md but used from the first page, and force / tone are homed in speech-moves.md. A learner reads a sentence-final `.` without a lesson. Fix the home anchor, not the docs.
- **Overview tables and "shape" sections** at the top of a page that preview the page's own later forms on purpose. There is still no preview marker (see [No previews](#no-previews)), so such a table either moves its home anchors up or uses only forms already taught.
- **Forward links**, when the sentence reads fine without following the link. A link is how a page says "covered later". A forward link is a problem only when the text depends on it.

## Scope limits

- **Content roots** are vocabulary and are not gated.
- **English-prose terminology** is not visible to the parser and is out of scope.

## Phases

Every phase lands with a green build. The new check stays **report-only** until the last phase, so it can't fail the build while splits and doc fixes are still in progress.

1. **Order and report.** *Done.* [learning-order.ts](../../src/lint/learning-order.ts) builds section positions from the sidebar, the level-2 band headings, and heading order. The docs lint records the section of every traced span. It prints a one-line summary on every build; `npm run lint:agalan -- --order-report` lists every finding: forward uses, forward links, constructions not taught in their home section, home anchors outside every band, and uses outside every band. Section-level coverage (the "not taught at home" finding) is report-only for now, because 46 constructions fail it. The page-level `checkConstructionCoverage` still fails the build. Section-level coverage becomes a failure in phase 7, along with the rest of the check.
2. **Tone marks.** *Done.* [tokenize.ts](../../src/parse/tokenize.ts) emits each mark run as a `Tone` token. `enforceTones` in [enforce.ts](../../src/parse/enforce.ts) checks placement before the sentence grammar runs, then drops the tokens: a stack (`!?`, `??`) fails `toneStack`; a mark before `.`, at the end, or on a closing `^` fails `toneTarget`. Each use traces `tone.mark.<name>` and `tone.scope.<word|island|span|rest>`, all homed at [tone marks](../grammar/speech-moves.md#tone-marks), which now teaches every mark and scope. Morph glosses put an island's mark on its `SCOPE[…]` (`!SCOPE[…]`).
3. **Overlays.** *Done.* [lexicon-overlays.csv](../../data/lexicon-overlays.csv) has an `anchor` column (required by the CSV reader). A word read through an overlay traces `overlay.<sense_form>.<pos>` in place of `word.reading.*`. `constructionRegistry` in [constructions.ts](../../src/parse/constructions.ts) adds one entry per overlay row, and the registry test checks that each one exists and its anchor resolves to a heading. The readings only overlays produce (`mood`, `locative`, `similative`, `ofRelation`, `exchange`, `proxy`, `stimulus`, `joinAct`, `joinRelation`) are gone from `word.reading.*`. `value` and `ability` stay, because non-overlay words also produce them. Most `/w/` rows share the section of their `/th/` or `/ɡ/` form. The knowing.md moods are the exception: their `/w/` forms are taught in [mood on one adjective](../grammar/knowing.md#mood-on-adjective), so that is their home. Overlay rows are left out of the page-level `checkConstructionCoverage` (71 rows, mostly `/w/`, `b` and `d` forms, have no example on any page). They show up in the report-only "not taught at home" finding instead. With family coverage, only families that have no example at all remain.
4. **Split the rest.** *Done.* Each coarse ID stays as a **carrier**, re-homed to its family's first lesson (`word.family.number` → counts, join fences → and-lists, values → need inventory). Beside it, `featureConstructions` in [construction-trace.ts](../../src/parse/construction-trace.ts) traces one ID per lesson, read from fields the parser already fills: `number.*` (marker identity, digitless, exponent, digitless-exponent class, percent, decimal, groups, calendar, writing mark, PoS), `value.stance.*` / `value.ending.<stance>.*`, `join.<series>`, `force.<vowel>` / `force.soft`, `polar.<group>` and `restrictor.<group>` (series grouped by the section that teaches them, since forms that share a section aren't split), `standIn.<vowel>`, `hook.<form>`, `span.type` / `edge` / `ending` / `mark` / `close`, and `role.vowel.*` / `role.instance`. Linkers stay coarse: they are open-class `/x/` content words, and content roots are not gated. Features still listed as "not taught in their home section" are doc gaps for phase 6 (the home section teaches the form in prose or a table without a traced example).
5. **Close the exemptions.** *Done.* `<!-- lint: skip -->` is a `bad-marker` failure. [template-trace.ts](../../src/lint/template-trace.ts) traces templates and fragments without a grammar change: each slot (`…`, a placeholder like `HOOK` or `ROOT`, or `…` glued into a word) is filled with sample words, and the trace keeps only the constructions every successful filling shares. A fragment is parsed with sample context before and after it. Word-shape notation is read as one word (`DIR th ANCHOR`, `ROOT x ROOT`), each `a/e/u/o` alternative must parse, and a shorthand derivation shape (`…l#N`) traces as its free number on a numeric-derivation word. A template or fragment that no filling parses fails the build. Placeholders alone (`ROOT`, `NUM`) count as English. The parser now reads the clause-scoped written cite `d[…` (no close, EDGE **e**), which spans.md teaches. Two doc spans were rewritten (`HOOK jal BODY` in hooks.md, `roba` in numeric-derivation.md). Text-fence audit: three spans.md fences held Agalan and are now `agalan`. The rest are notation, and a `text` line that reads as an Agalan phrase or sentence now fails.
6. **Fix the docs.** Fix only the [learner problems](#what-counts-as-a-learner-problem), and re-home the anchors in the "not problems" list. Work one grammar file per agent, in sidebar order ([drill execution](../meta/drill-generation.md#execute) pattern). Earlier files go first, since moving a home section earlier changes what later files may use.
7. **Enforce.** Switch the check to fail the build.

Phases 2, 3 and 5 are independent of each other and can run in any order after phase 1. Phase 4 needs phase 3, so the overlay IDs already cover what they can.

# Parser pipeline

**Status:** CURRENT  
**Design authority:** [`docs/grammar/`](../grammar/introduction.md) — parsers implement the docs; they do not define the language.

Library-first multi-stage parser for CLI checks, fixtures that lock the grammar docs, and later UI. Recursive / ordered-choice structure lives in Peggy and Chevrotain; TypeScript is wiring, table lookup, AST assembly, and a discourse post-pass.

## Goals

1. **Library-owned string and clause structure** — morphology, numbers, writing atoms, joins, spans, utterance framing.
2. **Thin custom layer** — lexicon/overlay classification, token adapters, AST assembly, orchestration, resolve.
3. **Doc sync** — mid-word **`x`** rule order mirrors [x-compounds.md](../grammar/x-compounds.md); number stems mirror [numbers.md](../grammar/numbers.md); sentence fences mirror [coordination.md](../grammar/coordination.md) / [spans.md](../grammar/spans.md) / [core.md](../grammar/core.md).
4. **Testable stages** — morph fixtures, classify fixtures, sentence fixtures, and resolve fixtures fail independently.
5. **No design authority creep** — if a parse fork is not in the docs, fix the docs or reject the input; do not paper over with backtracking across stages.

## Non-goals (still out)

- Multi-document / conversation-ledegul discourse (this pipeline resolves within one `parse(text)` call).
- Checking fill-ask *answers* against prior gaps.
- Treating the parser as a substitute for grammar docs.
- In-house PEG combinator kits as the foundation.

## Stack

| Layer | Library | Role |
|-------|---------|------|
| Word morph, number stems, writing forms | **[Peggy](https://peggyjs.org/)** | Ordered choice matches the [x-compounds decision order](../grammar/x-compounds.md#decision-order); generates JS + `.d.ts` at build time |
| Sentence / joins / spans / `orodo` / framing | **[Chevrotain](https://chevrotain.io/)** | Grammar as TS; CST → sentence AST; operates on **typed word tokens**, not raw characters |
| Overlays and open roots | CSV → `Map` | [`lexicon-overlays.csv`](../../data/lexicon-overlays.csv), [`lexicon-published.csv`](../../data/lexicon-published.csv) — classification, not parsing |
| Anaphor / question / SHARED resolve | [`src/parse/resolve.ts`](../../src/parse/resolve.ts) | Discourse over a finished AST |

**Rejected for the foundation:** Parsimmon / Arcsecond / `typescript-parsec`; Ohm as default; Chevrotain alone for character-ledegul morph; a single mega-grammar for all stages.

## Pipeline

```text
Agelan text
    │
    ▼
┌──────────────────────────────────────┐
│  Peggy — grammar/word.peggy          │
│  PoS / gl- / endings / -sh           │
│  <> foreign, writing atoms, numbers  │
│  xFamily via alternation order       │
└──────────────────────────────────────┘
    │  MorphWord[]
    ▼
┌──────────────────────────────────────┐
│  classify() — Maps only              │
│  overlay (sense_form, pos)           │
│  published roots / need-set          │
└──────────────────────────────────────┘
    │  LexWord[]  →  Chevrotain IToken[]
    ▼
┌──────────────────────────────────────┐
│  Chevrotain — SentenceParser         │
│  /j/ turns, /x/ continue             │
│  right-close joins, span stacks      │
│  ^ islands, orodo dependents           │
└──────────────────────────────────────┘
    │  ParseResult.utterances
    ▼
┌──────────────────────────────────────┐
│  resolve() — discourse sidecar       │
│  -r anaphors, fill-ask vs yes/no     │
│  SHARED /ɡ/ scale vs continuum vs …  │
└──────────────────────────────────────┘
    │
    ▼
ParseResult  (utterances + resolve)
```

Public entry: `parse(text)` in [`src/parse/index.ts`](../../src/parse/index.ts). CLI: `npm run parse -- 'zazawan vawalal.'`

### Stage 1 — Peggy (characters → `MorphWord`)

[`grammar/word.peggy`](../../grammar/word.peggy) → [`src/generated/word-parser.js`](../../src/generated/word-parser.js) via `npm run generate:word`. Wrapper: [`src/parse/word.ts`](../../src/parse/word.ts).

Owns every **string-shaped** subsystem:

- PoS prefix, left-bound **`gl-`**, reference ending, optional **-sh**
- Foreign `PoS<…>ENDING` / opaque `PoS<…>` (no phonology inside `<>`)
- Free number words and writing shorthand ([numbers.md](../grammar/numbers.md))
- Mid-word **`x`** families: rule alternation order = doc decision order (closes → span open → role → value/ability → numeric → ordinary compound)
- Span open/close **word shapes**; writing bracket atoms (`d@[…]`, …)
- Prefix-less [revisers](../grammar/revisers.md)

Semantic actions build a discriminated `MorphWord` only. **No lexicon calls inside Peggy.**

### Stage 2 — classify (tables → `LexWord`)

[`src/parse/classify.ts`](../../src/parse/classify.ts). Lookup order:

1. Overlay hit on `(sense_form, pos)` → closed special vocabulary reading
2. Else already-classified number stem → stay number
3. Else published root (and need-list when values apply)
4. Else unknown / foreign payload

This is where join-act vs soft clause **-n**, mood vs manner, value vs ability, etc. become **readings** without re-parsing spelling.

### Closed forms follow the lexicon
<a id="closed-forms-follow-lexicon"></a>

Hosted overlays (needs, evidentials, COMMENT, NOTIONAL, plan / DECISION, special pronouns, emotion ACT/LOCUS, clause poles, …) are **the published root** for that host (emoji / English literal) plus the overlay ending. When you **add** a closed overlay, pick an existing published row and spell that root (plus ending / mid-word **`x`** morph). Do **not** freeze a private spelling, and do **not** coin a new lexicon word just to host the overlay. If conversion reassigns *fishing*, witnessed **`huvuvum`** moves with **`uvuvu`**.

**Exception:** join-act / join-relation sense-forms (`an` / `on` / `aon` / …) and other **vowel-series** morphology (join fences, restrictor cores) are keyed by **`a` / `o` / `e` / `u`**, not by a lexicon row — those spellings stay.

### Stage 3 — Chevrotain (typed tokens → sentence AST)

Adapter: [`src/parse/tokens.ts`](../../src/parse/tokens.ts) / [`src/parse/tokenize.ts`](../../src/parse/tokenize.ts) maps `LexWord[]` plus peeled `.` `?` `!` `^` → Chevrotain `IToken[]` (no second character lexer). Grammar: [`src/parse/sentence-parser.ts`](../../src/parse/sentence-parser.ts).

Owns:

- Utterance framing ([core.md](../grammar/core.md) — `/j/` turns, omissible default assertoric, `/x/` continue)
- Right-close joins at phrase / VP / clause level (illegal left fence)
- Span open…close nesting; adjunct islands **`^ … ^`**
- Complex `/ɡ|h/` + `/b/`; floating `/h/` as adjuncts
- Matrix-final **`orodo`** + contiguous dependent

Recovery is off. Illegal left fences, infix joins, and binderless islands throw `SentenceParseError`.

### Stage 4 — resolve (AST → discourse sidecar)

[`src/parse/resolve.ts`](../../src/parse/resolve.ts). `parse(text)` always runs it; `resolve(result)` is also exported. Annotations sit on `ParseResult.resolve` — the Stage 3 tree is unchanged.

| Job | Rule |
|-----|------|
| Content **-r** | Most recent prior root whose full stem **or** letter prefix (cut through the 2nd vowel) matches ([pronouns.md](../grammar/pronouns.md)) |
| Span **-r** / `d[=]` | Most recent span open of that TYPE ([spans.md](../grammar/spans.md)) |
| Number **-r** / `g=+` | Most recent number with the same marker identity ([numbers.md](../grammar/numbers.md#number-endings)) |
| Role **-r** | Most recent verb / event noun / relation / role compound with that ROOT ([roles.md](../grammar/roles.md)) |
| Join **-r** under `jol` / `jom` | Fill-ask gaps in spoken order; none → yes/no ([questions.md](../grammar/questions.md)) |
| SHARED `/ɡ/` after a join | `scale` / `equative` / `distribute` / `collective` / `continuum` / `kind` / `ordinary` from join series + conjunct kinds |

Skipped as anaphors: join **-r** (ask / unspecified-member), restrictors, values / ability ending channels. Dangling resumes are recorded with no `antecedent` — they do not fail the parse.

SHARED classification is **structural** (join vowel + whether conjuncts are number words). The lexicon CSV has no gradable / continuum column yet.

## Custom code budget

| Allowed custom | Not allowed as “the parser” |
|----------------|-----------------------------|
| `classify` Map lookups + small PoS/ending branches | Recursive morph / number descent |
| `LexWord` → `IToken` adapter | Character-ledegul backtracking toolkit |
| Peggy / Chevrotain action bodies that build AST nodes | Parallel hand fence-stack that duplicates Chevrotain rules |
| `resolve` walks over a finished AST | Re-parsing spelling to bind anaphors |
| `parse(text)` orchestration + CLI | Silent recovery that invents structure absent from docs |

Principle: **mature libraries parse; repo code classifies, assembles, and annotates.** If a rule is in `docs/grammar/`, it should appear as a Peggy/Chevrotain production, a CSV row, or an explicit resolve walk.

## Repo layout

```text
grammar/
  word.peggy                     # Peggy — morph + numbers + writing atoms
src/
  generated/word-parser.js       # Peggy output (+ .d.ts) — import this, do not generate at runtime
  parse/
    word.ts                      # Stage 1 wrapper
    classify.ts                  # Stage 2
    tokenize.ts / tokens.ts      # peel .?!^ ; LexWord → IToken
    sentence-parser.ts           # Stage 3 Chevrotain
    resolve.ts                   # Stage 4
    index.ts                     # parse(text)
    types.ts                     # MorphWord / LexWord / AST / ResolveInfo
    cli.ts                       # npm run parse
data/
  lexicon-overlays.csv
  lexicon-published.csv
```

npm scripts: `generate:word` (Peggy); `build` (generate + `tsc`); `test`; `parse`. Chevrotain needs no generate step.

## IR

Canonical types: [`src/parse/types.ts`](../../src/parse/types.ts).

- **`MorphWord`** — Stage 1: `pos`, `ending`, `plural`, `gl`, discriminated `family` (`content` / `number` / `x` / `spanClose` / `reviser` / `joinMarker` / `writingSpan` / `foreign`).
- **`LexWord`** — Stage 2: `MorphWord` plus `reading`, optional `overlay` / `rootGloss`.
- **Sentence AST** — `Utterance` → `BodyClause` → `Clause` (`units`, optional `orodo` `dependent`). Units: NP/VP coords, predicate `/ɡ/`, `/h/`, spans, islands, clause coords, revisers.
- **`ResolveInfo`** — `anaphors[]`, `asks[]` (`yesNo` / `fillAsk` / `none`), `shared[]` (`SharedRole`).

## Browser / bundle size

In-browser use is a **goal** (CLI and web share one pipeline). Peggy is **pre-generated**; do **not** call `peggy.generate()` in the page. Chevrotain ships browser ESM.

A production **parse** bundle is **not wired yet** (`build:lexicon-web` only bundles lexicon search). Expected page cost once shipped: Chevrotain (~31 KB gzip) + generated morph parser (~5–40 KB gzip) + classify/AST/resolve glue → on the order of **~40–80 KB gzip** before lexicon data.

## What is shipped vs leftover

**Shipped**

- Peggy word grammar covers orthography, numbers (writing + speech), and [x-compounds](../grammar/x-compounds.md) decision order.
- `classify` is table-driven from the two lexicon CSVs (plus the need-set for values).
- Chevrotain sentence grammar covers framing, right-close joins, spans, islands, and **`orodo`** dependents.
- Public `parse(text)` returns a typed AST plus `resolve`; fixture tests drawn from `docs/grammar/`.
- Peggy parser is pre-generated; `peggy` is a devDependency.
- No ANTLR artifacts.

**Not yet**

- Browser bundle of the parse pipeline.
- Lexicon column for gradable / continuum adjectives (SHARED `scale` vs ordinary `/ɡ/` is join-driven for now).
- Speech span anaphors (`daxur`) as NP-slot tokens — Chevrotain still treats all spoken span opens as fence openers; writing `d[=]` resolves.
- Join-arity inventory checks beyond fence shape.
- Multi-turn discourse outside one `parse(text)` call.

## Risks

| Risk | Mitigation |
|------|------------|
| Peggy grammar drifts from docs | Fixtures quoted from grammar pages; fail CI on mismatch |
| Chevrotain LL(k) vs PEG morph | Morph finished before clause stage; clause tokens are already disambiguated |
| Overlay vs restrictor vs value same spelling | `classify` tables + PoS/ending; document any residual ambiguity as a language bug |
| Resolve over-binds (join `-r`, value `-r`) | Explicit skip list; fixtures that `zar` / `halorodoxar` are not content anaphors |
| Accidental Peggy-compiler-in-bundle | Generate at build time; do not import `peggy` from `src/parse/` |

## Cross-links

| Topic | Doc |
|-------|------|
| Core sentence grammar / orthography / framing | [core.md](../grammar/core.md) |
| Mid-word **`x`** families | [x-compounds.md](../grammar/x-compounds.md) |
| Numbers | [numbers.md](../grammar/numbers.md) |
| Joins | [coordination.md](../grammar/coordination.md) |
| Spans | [spans.md](../grammar/spans.md) |
| Pronouns / **-r** | [pronouns.md](../grammar/pronouns.md) |
| Questions / fill-ask | [questions.md](../grammar/questions.md) |
| Comparatives / SHARED scale | [comparatives.md](../grammar/comparatives.md) |
| Overlays / special vocabulary | [special-vocabulary.md](../grammar/special-vocabulary.md) |
| Revisers | [revisers.md](../grammar/revisers.md) |

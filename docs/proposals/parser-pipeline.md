# Proposal: library-first multi-stage parser

**Status:** PROPOSED  
**Design authority:** remains [`docs/grammar/`](../grammar/introduction.md) — parsers implement the docs; they do not define the language.  

## Motivation

Agelan is meant to be surface-unambiguous (PoS prefixes, right-close joins, mid-word **`x`** families with a documented decision order). Tooling still needs a real parser for CLI checks, future UI, and fixtures that lock the grammar docs.

Hand-rolled combinators and one giant CFG both tend to accumulate bugs: either custom backtracking logic, or a grammar that silently diverges from prose decision procedures. This proposal minimizes **custom parsing algorithms** by putting recursive / ordered-choice structure in mature libraries, and keeping TypeScript to **wiring + table lookup**.

## Goals

1. **Library-owned string and clause structure** — morphology, numbers, writing atoms, joins, spans, utterance framing.
2. **Thin custom layer** — lexicon/overlay classification, token adapters, AST assembly, orchestration.
3. **Doc sync** — mid-word **`x`** rule order mirrors [x-compounds.md](../grammar/x-compounds.md); number stems mirror [numbers.md](../grammar/numbers.md); sentence fences mirror [coordination.md](../grammar/coordination.md) / [spans.md](../grammar/spans.md) / [core.md](../grammar/core.md).
4. **Testable stages** — morph fixtures and sentence fixtures can fail independently.
5. **No design authority creep** — if a parse fork is not in the docs, fix the docs or reject the input; do not paper over with backtracking across stages.

## Non-goals

- Full discourse resolve in v1 (anaphors, fill-ask vs yes/no reinterpretation) — optional later pass.
- Treating the parser as a substitute for grammar docs.
- In-house PEG combinator kits as the foundation (acceptable only as a last resort if a library cannot express a stage).

## Recommended stack

| Layer | Library | Role |
|-------|---------|------|
| Word morph, number stems, writing forms | **[Peggy](https://peggyjs.org/)** | Mature PEG generator; **ordered choice** matches the [x-compounds decision order](../grammar/x-compounds.md#decision-order); packrat cache; generates JS + `.d.ts` |
| Sentence / joins / spans / `odo` / framing | **[Chevrotain](https://chevrotain.io/)** | Mature TypeScript parser toolkit; grammar as TS (no second codegen for this stage); CST / error recovery; operates on **typed word tokens**, not raw characters |
| Overlays and open roots | CSV → `Map` | [`lexicon-overlays.csv`](../../data/lexicon-overlays.csv), [`lexicon-published.csv`](../../data/lexicon-published.csv) — classification, not parsing |
| Anaphor / question resolve | Post-pass (later) | Discourse over a finished AST |

**Rejected for the foundation:** Parsimmon / Arcsecond / `typescript-parsec` (API fit, weak maintenance); Ohm as default (mature, but v18 API still in flux — revisit later if desired); Chevrotain alone for character-level morph (token-first model fights mid-word **`x`** / number spelling); a single mega-grammar for all stages.

## Pipeline

```text
Agelan text
    │
    ▼
┌──────────────────────────────────────┐
│  Peggy — WordGrammar                 │
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
│  ^ islands, odo dependents           │
└──────────────────────────────────────┘
    │
    ▼
AST  (+ optional resolve pass)
```

### Stage 1 — Peggy (characters → `MorphWord`)

Owns every **string-shaped** subsystem:

- PoS prefix, left-bound **`gl-`**, reference ending, optional **-sh**
- Foreign `PoS<…>ENDING` / opaque `PoS<…>` (no phonology inside `<>`)
- Free number words and writing shorthand ([numbers.md](../grammar/numbers.md))
- Mid-word **`x`** families: rule alternation order = doc decision order (closes → span open → role → value/ability → numeric → ordinary compound)
- Span open/close **word shapes**; writing bracket atoms (`d@[…]`, …)
- Prefix-less [revisers](../grammar/revisers.md)

Semantic actions build a small discriminated `MorphWord` only. **No lexicon calls inside Peggy.**

### Stage 2 — classify (tables → `LexWord`)

Lookup order (sketch):

1. Overlay hit on `(sense_form, pos)` → closed special vocabulary reading  
2. Else already-classified number stem → stay number  
3. Else published root (and need-list when values apply)  
4. Else unknown / foreign payload  

This is where join-act vs soft clause **-n**, mood vs manner, value vs ability, etc. become **readings** without re-parsing spelling.

### Stage 3 — Chevrotain (typed tokens → sentence AST)

A thin adapter maps `LexWord[]` → Chevrotain `IToken[]` (no second character lexer).

Grammar rules own:

- Utterance framing ([core.md](../grammar/core.md) — `/j/` turns, omissible default assertoric, `/x/` continue)
- Right-close joins at phrase / VP / clause level; [frame echo](../grammar/coordination.md#frame-echo) as two sequential closes (no illegal left fence)
- Span open…close nesting; adjunct islands **`^ … ^`**
- Complex `/ɡ|h/` + `/b/`; floating `/h/` as adjuncts
- Matrix-final **`odo`** + contiguous dependent

Fence nesting lives **in the Chevrotain grammar**, not a hand-maintained stack helper.

### Stage 4 — resolve (optional, later)

**-r** anaphors, question force reinterpretation of join **-r**, SHARED `/ɡ/` after rank joins (scale vs continuum vs distribute). Structure first; discourse second.

## Custom code budget

Expect glue, not parser engines:

| Allowed custom | Not allowed as “the parser” |
|----------------|-----------------------------|
| `classify` Map lookups + small PoS/ending branches | Recursive morph / number descent |
| `LexWord` → `IToken` adapter | Character-level backtracking toolkit |
| Peggy / Chevrotain action bodies that build AST nodes | Parallel hand fence-stack that duplicates Chevrotain rules |
| `parse(text)` orchestration + CLI | Silent recovery that invents structure absent from docs |

Principle: **mature libraries parse; repo code classifies and assembles.** If a rule is in `docs/grammar/`, it should appear as a Peggy/Chevrotain production or a CSV row.

## Suggested repo layout

```text
grammar/                         # machine grammars (not design authority)
  word.peggy                     # Peggy — morph + numbers + writing atoms
src/
  generated/word-parser.js       # Peggy output (+ .d.ts)
  parse/
    classify.ts
    tokens.ts                    # LexWord → Chevrotain tokens
    sentence-parser.ts           # Chevrotain rules
    index.ts                     # parse(text) pipeline
    types.ts                     # MorphWord / LexWord / AST
data/
  lexicon-overlays.csv
  lexicon-published.csv
```

npm scripts (illustrative): Peggy generate; `tsx` fixture tests; public `parse` CLI once stage 3 exists. Chevrotain needs no generate step.

## IR sketch

```ts
type MorphWord = {
  raw: string;
  pos?: "z" | "d" | "b" | "v" | "g" | "w" | "h" | "x" | "j"; // absent = reviser
  ending?: "l" | "m" | "n" | "r";
  plural?: boolean;
  family:
    | { kind: "content"; roots: string[] }
    | { kind: "number"; stem: /* number AST */ unknown }
    | { kind: "x"; xFamily: "span" | "role" | "value" | "ability" | "numeric" | "compound" }
    | { kind: "spanClose" }
    | { kind: "reviser"; form: string }
    | { kind: "joinMarker"; level: "phrase" | "vp" | "clause"; series: string };
};

type LexWord = MorphWord & {
  overlay?: { sense_form: string; pos: string; definition: string };
  rootGloss?: { literal?: string; metaphorical?: string };
  reading:
    | "ordinary"
    | "value"
    | "restrictor"
    | "mood"
    | "joinAct"
    | "joinRelation"
    | "number"
    | "unknown";
};
```

Refine fields when implementation starts; keep the **stage split** stable.

## Build order

1. Peggy word grammar + fixtures (`zumogon`, `g+3`, `daxal` / `xuxul`, `v<sing>xun`, revisers, number shorthand vs speech).  
2. `classify` against overlays + published roots.  
3. Chevrotain sentence over synthetic `LexWord[]` (`/j/` / `/x/`, joins first).  
4. Spans + **`odo`** in Chevrotain.  
5. End-to-end `parse(text)` + doc-derived fixture suite.

## Browser / bundle size

In-browser use is a **goal** (CLI and web share one pipeline). Both libraries support that; weight depends on **what is shipped at runtime**.

| Piece | Approx size (orders of magnitude) | Ship to browser? |
|-------|-----------------------------------|------------------|
| **Peggy compiler** (`peggy.min.js`) | ~161 KB min / **~44 KB gzip** | **No** — build-time only |
| **Generated Peggy parser** (from `word.peggy`) | Toy morph ~19 KB / **~4 KB gzip**; full number + **`x`** grammar likely **tens of KB** gzip | **Yes** |
| **Chevrotain** runtime | ~114 KB min / **~31 KB gzip** | **Yes** — fixed cost |

**Expected page cost for this stack:** Chevrotain (~31 KB gzip) + generated morph parser (~5–40 KB gzip) + classify/AST glue → on the order of **~40–80 KB gzip** before lexicon data. Lexicon CSVs / search will often dominate.

### Practices

- Generate the Peggy parser in `npm run build` (or a dedicated generate script); **import the generated JS** in Node and browser. Do **not** call `peggy.generate()` in the page unless building a live grammar editor.
- Chevrotain ships browser ESM (`chevrotain.min.mjs`); no Node-only APIs needed for ordinary parsing.
- Bundle with the same esbuild (or equivalent) path already used for lexicon web assets.

### If size becomes a constraint later

Chevrotain is the main **fixed** weight (~31 KB gzip floor; hard to tree-shake much further). Fallback options (not defaults):

1. **Peggy for both stages** — generated word + sentence parsers, no Chevrotain runtime (likely smaller; sentence fences are more awkward in pure PEG).  
2. **Peggy morph + thin hand clause parser** — lightest runtime, more custom code (against the library-first goal).

Browser use does **not** block adopting Peggy + Chevrotain as proposed.

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Peggy grammar drifts from docs | Fixtures quoted from grammar pages; fail CI on mismatch |
| Chevrotain LL(k) vs PEG morph | Morph finished before clause stage; clause tokens are already disambiguated |
| Overlay vs restrictor vs value same spelling | `classify` tables + PoS/ending; document any residual ambiguity as a language bug |
| Scope creep into discourse | Ship AST without resolve; add stage 4 explicitly later |
| Ohm temptation mid-project | Stick to Peggy unless a concrete Ohm feature blocks shipping |
| Accidental Peggy-compiler-in-bundle | Generate at build time; CI/bundle check that `peggy` is not a production browser dependency |

## Alternatives considered

| Alternative | Why not default |
|-------------|-----------------|
| In-house PEG combinators | Minimizes deps but maximizes bug surface — opposite of this proposal’s goal |
| Chevrotain-only | Poor fit for mid-word / number character structure |
| Peggy-only through clauses | Possible (and likely **smaller** in-browser); typed-token Chevrotain still preferred for join/span fence work and TS tooling in v1 |
| Ohm instead of Peggy | Strong toolkit; prefer stable Peggy generate path for v1 |
| Single-stage “full language” grammar | Mixes lexicon policy with spelling; harder to test and to keep aligned with docs |

## Acceptance criteria (for absorbing this proposal)

- [ ] Peggy word grammar covers orthography, numbers (both writing styles), and [x-compounds](../grammar/x-compounds.md) decision order.  
- [ ] `classify` is table-driven from the two lexicon CSVs (plus explicit need-set if required for values).  
- [ ] Chevrotain sentence grammar covers framing, right-close joins, spans, and **`odo`** dependents.  
- [ ] Public `parse(text)` returns a typed AST; fixture tests drawn from `docs/grammar/`.  
- [ ] Browser-ready: Peggy parser is **pre-generated**; production browser bundles do not include the Peggy compiler.  
- [ ] No dependency on deleted ANTLR artifacts; docs remain sole design authority.

## Cross-links

| Topic | Doc |
|-------|-----|
| Core sentence grammar / orthography / framing | [core.md](../grammar/core.md) |
| Mid-word **`x`** families | [x-compounds.md](../grammar/x-compounds.md) |
| Numbers | [numbers.md](../grammar/numbers.md) |
| Joins | [coordination.md](../grammar/coordination.md) |
| Spans | [spans.md](../grammar/spans.md) |
| Overlays / special vocabulary | [special-vocabulary.md](../grammar/special-vocabulary.md) |
| Revisers | [revisers.md](../grammar/revisers.md) |

# Clarity Language

Constructed language and tooling that encode psychologically useful distinctions into vocabulary and grammar (love / truth / freedom themes: gratitude, bias awareness, authentic choice). Unambiguous syntax supports computational tools; phonology aims to be easy to sing.

Always call the language **Clarity** (never Geran or other legacy names).

This repo is TypeScript + ANTLR tooling (`grammar/*.g4` → `src/generated/`). A web UI may come later.

## Sources of truth

| Source | Role |
|--------|------|
| `docs/language-reference.md` | **Source of truth** for the language design. Revise it as design decisions land. |
| `docs/phonology.md` | Phonology and phonotactics (linked from the language reference). |
| `docs/numbers.md` | Numeral grammar, including [digitless / zero-group forms](docs/numbers.md#zero-digit-groups) (`g+l` = plural count `>1`, …), [ranges](docs/numbers.md#ranges) (SHARED continuum `/ɡ/` + two number endpoints; bare `zel z+3l z+5l` = preference) and [measure phrases](docs/numbers.md#measure-phrases) (linked from the language reference). |
| `docs/pronouns.md` | Pronoun grammar (linked from the language reference). |
| `docs/plurality.md` | Plural grammar (**-sh** after the reference suffix; by PoS and reference suffix; generics / *every K* via coordination, not **-sh** — [universals](docs/coordination.md#universals-domains-generics); linked from the language reference). |
| `docs/reference-suffix.md` | Reference suffix grammar (**-l** / **-m** / **-n** / **-r**; linked from the language reference). |
| `docs/questions.md` | Interrogative grammar (**jol** / soft **jom** = yes/no **and** fill-ask; formerly *polar question*; multi-gap **fill-all**; unary/nullary under question; linked from the language reference).
| `docs/quotations.md` | Quote / mention / aside fences (writing `[…]` / `{…}` / `(…)` + **`~`** = paraphrase; speech **`xl-`** only — **a** quote / **e** aside / **o** mention / **u** close; **-l** exact / **-m** paraphrase; no **-n**; linked from the language reference).
| `docs/comparatives.md` | Scalar comparison: ranked **`e` / `oe` / `ue`** SHARED `/ɡ/` = [comparatives / superlatives](docs/comparatives.md) (`zel g-bigl z-Samn z-Lean` / unary *the …-est* / nullary **`oe`** *no biggest*); **`ae`** SHARED scale = [equative](docs/comparatives.md#equatives) (`zael g-bigl z-Samn z-Lean` = *as big as*); boolean **`a`** SHARED `/ɡ/` distributes (*both ADJ*); measured differentials use [measure phrases](docs/numbers.md#measure-phrases) (`zel g-talll b-inchl g+2l …`); linked from the language reference. |
| `docs/coordination.md` | Phrase-, VP-, and clause-level **fence**; **`/h/`** / **`/w/`** circumstance restrictors (**hal**, **hual**, **hael**, …); **e**/**oe**/**ue** ranked; **ae** = equality/tie/equative; **`a`** distributes SHARED `/ɡ/`; nullary **ae** = draw, **en** = unspecified ranking, **oe**+scale = empty superlative; **-r**, revision **al**/**am**/…; linked from the language reference. |
| `TODO.md` | Planned major revision notes (PoS prefixes, word-final consonants, pronoun/number rules, phonology). Fold into the reference, `phonology.md`, and `pronouns.md` as work proceeds. |
| `docs/claritish-rules.js` | English “Claritish” regex enforcers (value tags, evidentiality, mindfulness noting, etc.). **To be ported** into Clarity (lexicon/grammar), not kept as an English overlay forever. |
| `grammar/*.g4` | Existing ANTLR parsers for tooling experiments. **Do not change for now.** They may lag the reference; do not treat them as design authority. |

## Claritish → Clarity

`claritish-rules.js` defines English-side constraints that force explicit tagging (e.g. `my+c`, `caused_i`, `always_c`, emotion decompose). The long-term goal is that Clarity’s own words and morphology carry those distinctions natively so speakers don’t need English suffixes.

## Tooling notes

- Node ≥ 20; `npm run generate` / `npm run parse` exist for the current grammars — leave grammars alone unless explicitly asked.
- Generated parsers live in `src/generated/` (gitignored).
- Language design work goes through `docs/language-reference.md` (and `TODO.md` until absorbed).

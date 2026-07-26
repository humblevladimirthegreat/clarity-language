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
| `docs/plurality.md` | Plural grammar (**-sh** = group referent on nouns / event-sets / vocatives; **collective** on `/ɡ/`; unused on `/w/` `/h/` `/x/` and number words; generics / *every K* via joins, not **-sh** — [universals](docs/coordination.md#universals-domains-generics); habitual **`hual`** — [restrictors](docs/restrictors.md); linked from the language reference). |
| `docs/reference-suffix.md` | Reference suffix grammar (**-l** / **-m** / **-n** / **-r**; linked from the language reference). |
| `docs/questions.md` | Interrogative grammar (**jol** / soft **jom** = yes/no **and** fill-ask; formerly *polar question*; multi-gap **fill-all**; focus/bare under question; linked from the language reference).
| `docs/quotations.md` | Quote / mention / aside fences (writing `[…]` / `{…}` / `(…)` + **`~`** = paraphrase; speech **`xl-`** only — **a** quote / **e** aside / **o** mention / **u** close; **-l** exact / **-m** paraphrase; no **-n**; linked from the language reference).
| `docs/comparatives.md` | Scalar comparison via **rank joins**: **`e` / `oe` / `ue`** SHARED `/ɡ/` = [comparatives / superlatives](docs/comparatives.md) (`zel g-bigl z-Samn z-Lean` / focus *the …-est* / bare **`oe`** *no biggest*); **`ae`** SHARED scale = [equative](docs/comparatives.md#equatives); set **`a`** SHARED `/ɡ/` distributes (*both ADJ*); measured differentials use [measure phrases](docs/numbers.md#measure-phrases); linked from the language reference. |
| `docs/coordination.md` | **Joins** — phrase-, VP-, clause-level **fence**; **set joins** vs **rank joins**; arity **bare** / **focus** / **list**; **-r** member; linked from the language reference. |
| `docs/revisers.md` | Prefix-less **revisers** (**al** / **am** / **an** / **el** / … — *including* / *rather* / *instead* / *except*); linked from the language reference. |
| `docs/restrictors.md` | **`/h/`** / **`/w/`** **restrictors** (**hal**, **hual**, **har**, … — applicability, not sibling *and*); linked from the language reference. |
| `docs/values.md` | **Values** on ordinary **`/h/`** / **`/w/`** (default reading): need inventory; **`x`+a/e/o/u** stake (*satisfies* / *rather* / *instead* / *detracts*); endings = **contact channel** on **`xa` / `xo`**, **preference standing** on **`xe`** (circumstantial / internal / habitual / protective), or **changeability** on **`xu`**; linked from the language reference. |
| `TODO.md` | Planned major revision notes (PoS prefixes, word-final consonants, pronoun/number rules, phonology). Fold into the reference, `phonology.md`, and `pronouns.md` as work proceeds. |
| `docs/claritish-rules.js` | English “Claritish” regex enforcers (value tags, evidentiality, mindfulness noting, etc.). **To be ported** into Clarity (lexicon/grammar), not kept as an English overlay forever. |
| `grammar/*.g4` | Existing ANTLR parsers for tooling experiments. **Do not change for now.** They may lag the reference; do not treat them as design authority. |

## Claritish → Clarity

`claritish-rules.js` defines English-side constraints that force explicit tagging (e.g. `my+c`, `caused_i`, `always_c`, emotion decompose). The long-term goal is that Clarity’s own words and morphology carry those distinctions natively so speakers don’t need English suffixes. Values: **[docs/values.md](docs/values.md)**.

## Tooling notes

- Node ≥ 20; `npm run generate` / `npm run parse` exist for the current grammars — leave grammars alone unless explicitly asked.
- Generated parsers live in `src/generated/` (gitignored).
- Language design work goes through `docs/language-reference.md` (and `TODO.md` until absorbed).

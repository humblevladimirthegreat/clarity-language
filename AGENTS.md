# Clarity Language

Constructed language and tooling that encode psychologically useful distinctions into vocabulary and grammar (love / truth / freedom themes: gratitude, bias awareness, authentic choice). Unambiguous syntax supports computational tools; phonology aims to be easy to sing.

Always call the language **Clarity** (never Geran or other legacy names).

This repo is TypeScript + ANTLR tooling (`grammar/*.g4` → `src/generated/`). A web UI may come later.

## Sources of truth

| Source | Role |
|--------|------|
| `docs/language-reference.md` | **Source of truth** for the language design. Revise it as design decisions land. |
| `docs/phonology.md` | Phonology and phonotactics (linked from the language reference). |
| `docs/numbers.md` | Numeral grammar (linked from the language reference). |
| `docs/pronouns.md` | Pronoun grammar (linked from the language reference). |
| `docs/plurality.md` | Plural grammar (**-sh** after the reference suffix; by PoS and reference suffix; linked from the language reference). |
| `docs/reference-suffix.md` | Reference suffix grammar (**-l** / **-m** / **-n** / **-r**; linked from the language reference). |
| `docs/questions.md` | Interrogative grammar (**jol** / soft **jom** = yes/no **and** fill-ask; formerly *polar question*; multi-gap **fill-all**; unary/nullary under question; linked from the language reference).
| `docs/coordination.md` | Phrase-, VP-, and clause-level **fence** (**zam**, **gam**, **vam**, **xam**, …; left preferred, right close for style/comedy; shared mods right after coordinator; nesting: left stack = right-assoc, right stack = left-assoc; pure infix illegal); **`/h/`** / **`/w/`** same forms = [circumstance restrictors](docs/coordination.md#circumstance-restriction-h-w) (**core**: **hal** = *never*, **hual** = *always*, **hal** C… = *only when…*, **hul** C… = *not when…*, **har**/**hor**/**hur** = *sometime*/*anytime*/*sometime else*; sibling manner/adjunct *and* = juxtaposition; other `/h/`/`/w/` coordinator spellings reserved but undefined); **-r** on **a**/**o**/**e**/**u** at all levels (**zar** / **zor** / **zer** / **zur** / **var** / **vor** / **ver** / **vur** / **xar** / … = *something* / *anything* / *whatever-by-rank* / *something else* (other than) — VP *do something*, clause *something happened*; under [question](docs/questions.md) = fill-ask; under `/h/` `/w/` = *sometime* / *anytime* / …); soft **-n** on VP/clause (**van** / **xan** = *and then…*); prefix-less **al**/**am**/**an**/**el**/… (**-l**/**-m**/named **-n** required; parallel chains on A) = in-clause revision (*including* / *rather* / *instead* / *except*); no bare word-level coordinators; **-l**/**-m**/**-n** = closed/open/named or soft; **e** / **ae** / **oe** = ranked conjunction (unmarked / co-satisfiable / exclusive); NP ranked SHARED `/ɡ/` = [comparatives / superlatives](docs/coordination.md#comparatives) (multi = *bigger than*; unary = *the biggest* — `zel g-bigl z-Samn`; nullary = *no biggest* — `zel g-bigl`); leading **u** on **a** / **o** / **e** = invert (**ua** / **uo** / **ue** = *everything but* / *anything but* / **rank reversal**; not bare **u** negation (*not* / *none of* / *no*); no three-vowel stacks; empty-allowed on **…om** only (*or none*; **…ol** = exactly one)); unary / nullary phrase (**…em** / **…el** / **…oem** / **…oel** / **…uem** / **…uel** / **…en** / **…al** / **…am** / **…an** / **…ol** / **…om** / **…ual** / **…uam** / **…uol** / **…uom** / **…aol** / **…aom** / **…ul** / **…um** / **…ar** / **…or** / **…er** / **…ur**; nullary **…an** = *null* / *void*, **…en** = *it’s a draw*, **…oel** = *do nothing*, **…ul** = *no*, **…ual** = *everything*, **…uol** = *anything (goes)*, **…ar** = *something*, **…or** = *anything*, **…er** = *whatever-by-rank*, **…ur** = *something else*; unary **…ul** = *not X*; VP/clause unary/nullary on **-r** and negation **…ul** / **…um** / soft **…un**; bare **u** = negation (*not* / *none of* / *no*)); linked from the language reference. |
| `TODO.md` | Planned major revision notes (PoS prefixes, word-final consonants, pronoun/number rules, phonology). Fold into the reference, `phonology.md`, and `pronouns.md` as work proceeds. |
| `docs/claritish-rules.js` | English “Claritish” regex enforcers (value tags, evidentiality, mindfulness noting, etc.). **To be ported** into Clarity (lexicon/grammar), not kept as an English overlay forever. |
| `grammar/*.g4` | Existing ANTLR parsers for tooling experiments. **Do not change for now.** They may lag the reference; do not treat them as design authority. |

## Claritish → Clarity

`claritish-rules.js` defines English-side constraints that force explicit tagging (e.g. `my+c`, `caused_i`, `always_c`, emotion decompose). The long-term goal is that Clarity’s own words and morphology carry those distinctions natively so speakers don’t need English suffixes.

## Tooling notes

- Node ≥ 20; `npm run generate` / `npm run parse` exist for the current grammars — leave grammars alone unless explicitly asked.
- Generated parsers live in `src/generated/` (gitignored).
- Language design work goes through `docs/language-reference.md` (and `TODO.md` until absorbed).

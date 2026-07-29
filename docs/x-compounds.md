# Mid-word `x` compounds (parser families)
<a id="x-compounds"></a>
<a id="compound-parser"></a>

This page is the source of truth for **disambiguating mid-word `x`**. Mid-word **`x`** is only the [compound joiner](phonology.md#phonotactics) (never an ordinary root consonant). Word-initial **`x`** is the discourse-marker PoS — not this table.

Family-specific morphology lives elsewhere; this page is the **parser cue** map.

## Families by shape
<a id="families-by-shape"></a>

After the PoS prefix, look at what sits **left** and **right** of the first mid-word **`x`**:

| Shape (after PoS) | Family | Details |
|-------------------|--------|---------|
| **`VOWEL x VOWEL`** + ending | **[Span fence](spans.md)** | TYPE **a** / **e** / **o** / **u** then EDGE **a** / **e** / **o** / **u**; exact **`xuxul`** / **`xuxur`** / **`xuxun`** / **`xuxum`** = close |
| **`VOWEL x ROOT…`** + ending | **[Role compound](special-vocabulary.md#role-compounds)** | ROLE **`a`** / **`u`** / **`o`** then event or relation root; **`e`** reserved |
| **`ROOT… x VOWEL`** + ending | **[Values](values.md)** or **[ability](special-vocabulary.md#ability)** | Need root + **`a`/`e`/`o`/`u`** → values; other root + **`xa`/`xu`** → ability (**`xe`/`xo`** undefined on ability) |
| **`ROOT… x NUM…`** + ending | **[Numeric derivation](special-vocabulary.md#numeric-derivation)** | Right half matches [number](numbers.md) stem grammar **without** its own ending (marker **`+`/`-`/`#`/`_`**, digitless exp including label **`_e`/`_e-`**, hyperbole, label digits, scalar digit morph **`+N`/`-N`**, or ordinal digit morph **`#N`**) |
| **`ROOT… x ROOT…`** + ending | **Ordinary compound** | Lexicon sense-compounds; [phrasal proper names](reference-suffix.md#phrasal-proper-names) (`z-MaryxSmithn`) |

No open content root is a **bare single vowel**, so a single vowel **left** of `x` is never an ordinary host root. Spans are the only family with a **single vowel right** of `x` (EDGE); role compounds put a full **`V(CV)+`** root there. Numeric **`NUM`** is never a content root — it is a PoS-less number stem (see [numeric derivation](special-vocabulary.md#numeric-derivation)).

### Decision order (practical)

1. Exact **`xuxul`** / **`xuxur`** / **`xuxun`** / **`xuxum`** → span close.
2. After PoS: one vowel + `x` + one vowel + ending → **span open** (or atomic / anaphor / empty / proper per [quotations](spans.md)).
3. After PoS: one vowel **`a`/`u`/`o`** + `x` + longer root + ending → **role compound**.
4. Longer material before `x`, then `x` + single stance vowel **`a`/`e`/`o`/`u`** + ending → **value** (need host) or **ability** (non-need + **`a`/`u`** only).
5. Longer material before `x`, then `x` + material that matches **number stem** grammar (writing **`+`/`-`/`#`/`_`**, speech **`r`+V…**, including digit morph **`+N`/`-N`** / **`#N`**) + ending → **numeric derivation**.
6. Longer material on **both** sides of `x` → ordinary multi-root compound (sense / name).

Stacked vowels on TYPE/EDGE/ROLE are **not** used: role ROLE is one of **`a`** / **`u`** / **`o`** only; span TYPE/EDGE stay single vowels.

**Do not** parse bare **`ROOT x e`** as infinity-essence — that is stance **`xe`** (values / undefined on ability). Essence uses scalar digitless exp writing **`ROOTx+e`**.

## Cross-links

| Topic | Page |
|-------|------|
| Role **`a`/`u`/`o`** (agent / patient / reltum) | [special-vocabulary.md § Role compounds](special-vocabulary.md#role-compounds) |
| Numeric derivation (**`ROOT x NUM`**) | [special-vocabulary.md § Numeric derivation](special-vocabulary.md#numeric-derivation) |
| Values **`need x {a\|e\|o\|u}`** | [values.md](values.md) |
| Ability **`HOST x {a\|u}`** | [special-vocabulary.md § Ability](special-vocabulary.md#ability) |
| Number stem grammar (free words) | [numbers.md](numbers.md) |
| Span open / close | [spans.md](spans.md) |
| Phrasal names / sense compounds | [reference-suffix.md](reference-suffix.md#phrasal-proper-names), [phonology.md](phonology.md#phonotactics) |
| Joins (no mid-word `x`) | [coordination.md](coordination.md) |

# How to read mid-word `x`
<a id="x-compounds"></a>
<a id="compound-parser"></a>

How to tell which **family** a mid-word **`x`** word belongs to. Mid-word **`x`** is only the [compound joiner](phonology.md#phonotactics) — never an ordinary root consonant. Word-initial **`x`** is the discourse-marker PoS — a different job.

## Beginner
<a id="beginner"></a>

### What mid-word `x` does

Inside a word, **`x`** glues roots into **one** content word. Start with **two** roots. Write it as one token; the ending applies to the whole compound.

```
`zuzuzuxogoven.`

gloss: `z-sushi-x-coffee`

*Sushi-Coffee* (one label)
```

<AgelanInspect text="zuzuzuxogoven." />

Mid-word **`x`** is glue; word-initial **`x`** is the discourse PoS.

Other shapes (span fences, role compounds, values / ability, numbers) and compounds with more than two roots are Intermediate ([families by shape](#families-by-shape)).

## Intermediate
<a id="intermediate"></a>

### Families by shape
<a id="families-by-shape"></a>

After the PoS prefix, look at what sits **left** and **right** of the first mid-word **`x`**:

| Shape (after PoS) | Family | Details |
|-------------------|--------|---------|
| **`VOWEL x VOWEL`** + ending | **[Span fence](spans.md)** | TYPE **a** / **e** / **o** / **u** then EDGE **a** / **e** / **o** / **u**; exact **`xuxul`** / **`xuxur`** / **`xuxum`** = close |
| **`VOWEL x ROOT…`** + ending | **[Role compound](roles.md#role-compounds)** | ROLE **`a`** / **`u`** / **`o`** then edegunt or relation root |
| **`ROOT… x VOWEL`** + ending | **[Values](values.md)** or **[ability](ability.md#ability)** | Need root + **`a`/`e`/`o`/`u`** → values; other root + **`xa`/`xe`/`xo`/`xu`** → ability |
| **`ROOT… x NUM…`** + ending | **[Numeric derivation](numeric-derivation.md#numeric-derivation)** | Right half matches [number](numbers.md) stem grammar **without** its own ending (marker **`+`/`-`/`#`/`_`**, digitless exp including label **`_e`/`_e-`**, hyperbole, [zero × exp](numbers.md#zero-exponent) **`+0e`/`±0e-1`/`#0e`**, label digits, scalar digit morph **`+N`/`-N`**, or ordinal digit morph **`#N`**) |
| **`ROOT x ROOT`** (+ more **`x ROOT`**) + ending | **Ordinary compound** | Lexicon sense-compounds; [phrasal proper names](reference-suffix.md#phrasal-proper-names) (`zozohuxalenan`); [viewpoint laterals](roles.md#viewpoint-laterals) (`gewezexebonen` *your left*; bare `gewezel` *west*). Extra **`x ROOT`** pieces are ordinary roots only — [order](#ordinary-compound-order) |

No open content root is a **bare single vowel**, so a single vowel **left** of `x` is never an ordinary host root. Spans are the only family with a **single vowel right** of `x` (EDGE); role compounds put a full **`V(CV)+`** root there. Numeric **`NUM`** is a PoS-less number stem — [numeric derivation](numeric-derivation.md#numeric-derivation). Running-text / citation examples prefer spelled CV (`…xraba…`); inventory tables may keep shorthand — [writing style](numbers.md#writing-style-numeric-vs-spelled).

### Ordinary compound order
<a id="ordinary-compound-order"></a>

The **first** content root is the **kind**. Each later root **narrows** it (field, topic, further label). The list is **flat**: `KIND x FIELD`, then `KIND x FIELD x FURTHER`. One ending on the whole word.

```
`golovexurul.`

gloss: `g-love-x-crush`

*love in the crush sense*
```

<AgelanInspect text="golovexurul." />

```
`zuzuzuxogovexadedan.`

gloss: `z-sushi-x-coffee-x-tea`

*Sushi-Coffee-Tea* (one named label)
```

<AgelanInspect text="zuzuzuxogovexadedan." />

[Phrasal names](reference-suffix.md#phrasal-proper-names) use the same left-to-right order (given × family × further title). An office’s **handle** is one root, not this compound ([named handles](reference-suffix.md#named-handles)). [Viewpoint laterals](roles.md#viewpoint-laterals) stay **two** roots (`DIR x ANCHOR`). Span, role, values / ability, and numeric families stay **one** mid-word **`x`**.

### Decision order

1. Exact **`xuxul`** / **`xuxur`** / **`xuxum`** → span close.
2. After PoS: one vowel + `x` + one vowel + ending → **span open** (or atomic / anaphor / empty / proper per [spans](spans.md)).
3. After PoS: one vowel **`a`/`u`/`o`** + `x` + longer root + ending → **role compound**.
4. Longer material before `x`, then `x` + single stance vowel **`a`/`e`/`o`/`u`** + ending → **value** (need host) or **ability** (non-need host).
5. Longer material before `x`, then `x` + material that matches **number stem** grammar (writing **`+`/`-`/`#`/`_`**, speech **`r`+V…**, including digit morph **`+N`/`-N`** / **`#N`**) + ending → **numeric derivation**.
6. Longer material on **both** sides of the first `x`, with optional further **`x` + content root** pieces → ordinary compound (sense / name).

Stacked vowels on TYPE/EDGE/ROLE are **not** used: role ROLE is one of **`a`** / **`u`** / **`o`** only; span TYPE/EDGE stay single vowels.

## See also

- Word-initial **`x`** discourse role: [core.md](core.md#discourse-markers-x)
- Phonotactics of mid-word **`x`**: [phonology.md](phonology.md#phonotactics)
- Ability / values stance: [ability.md](ability.md) / [values.md](values.md)
- Role compounds / laterals: [roles.md](roles.md)
- Numeric derivation: [numeric-derivation.md](numeric-derivation.md)
- Named handles vs long titles: [reference-suffix.md](reference-suffix.md#named-handles)

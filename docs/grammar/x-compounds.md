# Mid-word `x` compounds (parser families)
<a id="x-compounds"></a>
<a id="compound-parser"></a>

How to **disambiguate mid-word `x`**. Mid-word **`x`** is only the [compound joiner](phonology.md#phonotactics) — never an ordinary root consonant. Word-initial **`x`** is the discourse-marker PoS — a different job.

## Beginner
<a id="beginner"></a>

### What mid-word `x` does

Inside a word, **`x`** glues two roots into **one** content word. Write it as one token; the ending applies to the whole compound.

```
`zuzuzuxogeven.`

gloss: `z-sushi-x-coffee`

*Sushi-Coffee* (one label — two roots, one word)
```

**Mnemonic:** mid-word **`x`** = glue; word-initial **`x`** = discourse PoS.

Other shapes (span fences, role compounds, values / ability, numbers) are Intermediate ([families by shape](#families-by-shape)).

## Intermediate
<a id="intermediate"></a>

### Families by shape
<a id="families-by-shape"></a>

After the PoS prefix, look at what sits **left** and **right** of the first mid-word **`x`**:

| Shape (after PoS) | Family | Details |
|-------------------|--------|---------|
| **`VOWEL x VOWEL`** + ending | **[Span fence](spans.md)** | TYPE **a** / **e** / **o** / **u** then EDGE **a** / **e** / **o** / **u**; exact **`xuxul`** / **`xuxur`** / **`xuxun`** / **`xuxum`** = close |
| **`VOWEL x ROOT…`** + ending | **[Role compound](special-vocabulary.md#role-compounds)** | ROLE **`a`** / **`u`** / **`o`** then event or relation root; **`e`** reserved |
| **`ROOT… x VOWEL`** + ending | **[Values](values.md)** or **[ability](special-vocabulary.md#ability)** | Need root + **`a`/`e`/`o`/`u`** → values; other root + **`xa`/`xe`/`xo`/`xu`** → ability |
| **`ROOT… x NUM…`** + ending | **[Numeric derivation](special-vocabulary.md#numeric-derivation)** | Right half matches [number](numbers.md) stem grammar **without** its own ending (marker **`+`/`-`/`#`/`_`**, digitless exp including label **`_e`/`_e-`**, hyperbole, [zero × exp](numbers.md#zero-exponent) **`+0e`/`±0e-1`/`#0e`**, label digits, scalar digit morph **`+N`/`-N`**, or ordinal digit morph **`#N`** — not free end-relative **`#-`** / generation / **`Ne0`** assert morphs; no **`ROOTx+e0`/`+0e0`**) |
| **`ROOT… x ROOT…`** + ending | **Ordinary compound** | Lexicon sense-compounds; [phrasal proper names](reference-suffix.md#phrasal-proper-names) (`zozohuxalenan`); [viewpoint laterals](special-vocabulary.md#viewpoint-laterals) (`gevedexehadon` *your left*) |

No open content root is a **bare single vowel**, so a single vowel **left** of `x` is never an ordinary host root. Spans are the only family with a **single vowel right** of `x` (EDGE); role compounds put a full **`V(CV)+`** root there. Numeric **`NUM`** is a PoS-less number stem — [numeric derivation](special-vocabulary.md#numeric-derivation). Running-text / citation examples prefer spelled CV (`…xraba…`); inventory tables may keep shorthand — [writing style](numbers.md#writing-style-numeric-vs-spelled).

### Decision order

1. Exact **`xuxul`** / **`xuxur`** / **`xuxun`** / **`xuxum`** → span close.
2. After PoS: one vowel + `x` + one vowel + ending → **span open** (or atomic / anaphor / empty / proper per [spans](spans.md)).
3. After PoS: one vowel **`a`/`u`/`o`** + `x` + longer root + ending → **role compound**.
4. Longer material before `x`, then `x` + single stance vowel **`a`/`e`/`o`/`u`** + ending → **value** (need host) or **ability** (non-need host).
5. Longer material before `x`, then `x` + material that matches **number stem** grammar (writing **`+`/`-`/`#`/`_`**, speech **`r`+V…**, including digit morph **`+N`/`-N`** / **`#N`**) + ending → **numeric derivation**.
6. Longer material on **both** sides of `x` → ordinary multi-root compound (sense / name).

Stacked vowels on TYPE/EDGE/ROLE are **not** used: role ROLE is one of **`a`** / **`u`** / **`o`** only; span TYPE/EDGE stay single vowels.

## Advanced
<a id="advanced"></a>

### Traps worth one look

| Shape | Reading |
|-------|---------|
| Bare **`ROOT x e`** | Stance **`xe`** (values motive **or** ability temporary *can’t*) — **not** infinity-essence |
| Bare **`ROOT x o`** | Stance **`xo`** (values prescription **or** ability modifiable *can’t*) — **not** a ROLE |
| Essence | Scalar digitless exp **`ROOTx+e`** — [numeric derivation](special-vocabulary.md#numeric-derivation) |
| **`e x ROOT`** | Reserved (undefined ROLE) — not a fourth role vowel |
| Lateral **`DIR x ANCHOR`** | Ordinary compound with closed spatial reading — [viewpoint laterals](special-vocabulary.md#viewpoint-laterals); bare spatial `gevedel` illegal |

## See also

- Word-initial **`x`** discourse role: [core.md](core.md#discourse-markers-x)
- Phonotactics of mid-word **`x`**: [phonology.md](phonology.md#phonotactics)

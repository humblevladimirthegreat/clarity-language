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

A conventional kind that already has its own published root stays that word (`zunowel` *sunflower*) — not a homemade sun×flower assembly.

Other shapes (span fences, role compounds, values / ability, numbers) and compounds with more than two roots are Intermediate ([families by shape](#families-by-shape)).

## Intermediate
<a id="intermediate"></a>

### Families by shape
<a id="families-by-shape"></a>

After the PoS prefix, look at what sits **left** and **right** of the first mid-word **`x`**:

| Shape (after PoS) | Family | Details |
|-------------------|--------|---------|
| **`VOWEL x VOWEL`** + ending | **[Span fence](spans.md)** | Assigned opens: EDGE **`a`/`e`/`o`** + **-l / -m / -n**, EDGE **`u`** + **-l / -r**. Closes: **`xuxul`** / **`xuxur`** / **`xuxum`**. |
| **`VOWEL x ROOT…`** + ending | **[Role compound](roles.md#role-compounds)** | ROLE **`a`** / **`u`** / **`o`** then event or relation root |
| **`ROOT… x VOWEL`** + ending | **[Values](values.md)** or **[ability](ability.md#ability)** | Need root + **`a`/`e`/`o`/`u`** → values; other root + **`xa`/`xe`/`xo`/`xu`** → ability |
| **`ROOT… x NUM…`** + ending | **[Numeric derivation](numeric-derivation.md#numeric-derivation)** | Right half matches [number](numbers.md) stem grammar **without** its own ending (marker **`+`/`-`/`#`/`_`**, digitless exp including label **`_e`/`_e-`**, hyperbole, [zero × exp](numbers.md#zero-exponent) **`+0e`/`±0e-1`/`#0e`**, label digits, scalar digit morph **`+N`/`-N`**, or ordinal digit morph **`#N`**) |
| **`ROOT x ROOT`** (+ more **`x ROOT`**) + ending | **Ordinary compound** | Productive sense / name assembly; [phrasal proper names](reference-suffix.md#phrasal-proper-names) (`zozohuxalanen`); [viewpoint laterals](roles.md#viewpoint-laterals) (`gewezexedonen` *your left*; bare `gewezel` *west*). Extra **`x ROOT`** pieces are ordinary roots only — [order](#ordinary-compound-order) |

No open content root is a **bare single vowel**, so a single vowel **left** of `x` is never a values / ability / numeric **host**, and role compounds still put a full **`V(CV)+`** root after ROLE. Assigned span cells are the usual **`VOWEL x VOWEL`** family. Numeric **`NUM`** is a PoS-less number stem — [numeric derivation](numeric-derivation.md#numeric-derivation). Running-text / citation examples prefer spelled CV (`…xraba…`); inventory tables may keep shorthand — [writing style](numbers.md#writing-style-numeric-vs-spelled).

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
2. After PoS: one vowel + `x` + one vowel + an **assigned** span ending → **span open** (or atomic / anaphor / empty per [spans](spans.md)).
3. After PoS: one vowel **`a`/`u`/`o`** + `x` + longer root + ending → **role compound**.
4. Longer material before `x`, then `x` + single stance vowel **`a`/`e`/`o`/`u`** + ending → **value** (need host) or **ability** (non-need host).
5. Longer material before `x`, then `x` + material that matches **number stem** grammar (writing **`+`/`-`/`#`/`_`**, speech **`r`+V…**, including digit morph **`+N`/`-N`** / **`#N`**) + ending → **numeric derivation**.
6. Longer material on **both** sides of the first `x`, with optional further **`x` + content root** pieces → ordinary compound (sense / name).

Role ROLE is one of **`a`** / **`u`** / **`o`** only; span TYPE/EDGE stay single vowels.

### Productive **`x`** vs one word vs two words
<a id="compound-vs-separate"></a>

Three packages — pick **one** job; do not spell the same intent two ways.

| Package | When | Example |
|---------|------|---------|
| **Two words** | Two slot-fillers, or another subsystem already owns the relation | `zodogol zagadal` *a dog and a cat*; `zodogol gelulul` *a blue dog* (property = `/ɡ/`, not noun×noun) |
| **`x` compound** | One referent, still hear KIND then FIELD — live label, sense-narrowing, multipart name | `golovexurul` *love in the crush sense*; `zuzuzuxogoven` *Sushi-Coffee* |
| **Lexical kind** | One conventional kind the lexicon already closed — hear one root, not assembly | `zohohulabedel` *bedroom*; `zunowel` *sunflower* ([lexical compounds](#lexical-compounds)) |

**Slot test (first).** How many things fill the slot? That many words. `zozohun zalanen` = two people; `zozohuxalanen` = one person.

**Construction menu.** Property on a host → `/ɡ/` (or `/w/`). List → [join](coordination.md). Participant → [role compound](roles.md#role-compounds). Count / unit → [number](numbers.md). Stance / ability / numeric derivation → those **`x`** families. Only when none of those apply and you still want KIND×FIELD in one slot → productive **`x`**.

**One packaging per job.** A shop mashup stays **`x`** even when frequent. A fossil kind is a lexicon lemma, not a silent **`x`** drop.

### Translation practice
<a id="translation-practice"></a>

Short drills on this Intermediate band. Try each item before opening **Show answer**. The point is **`x`** assembly vs two words vs a lexical kind.

**Roots used here:** `olove` *love* · `aga` *crush* · `uzu` *sushi* · `ogove` *coffee* · `adeda` *tea* · `ohohu` *house* · `abede` *bed* · `ebere` *person* · `onogo` *bond* · `odogo` *dog* · `agada` *cat* · `unowe` *sunflower* (lexical kind)

#### English → Agalan

**1.** *love in the crush sense* (one word, still hear the field)

::: details Show answer
`golovexurul.`
:::

**2.** *a dog and a cat*

::: details Show answer
`zodogol zagadal zam.`
:::

**3.** *Sushi-Coffee* (one shop label)

::: details Show answer
`zuzuzuxogoven.`
:::

**4.** *a bedroom* (lexical kind)

::: details Show answer
`zohohulabedel.`
:::

#### Agalan → English

**5.** `zeberelonogon.`

::: details Show answer
*a friend* (lexical kind)
:::

**6.** `zunowel.`

::: details Show answer
*a sunflower* (lexical kind — not sun×flower tonight)
:::

## Advanced
<a id="advanced"></a>

### Lexical compounds (x-less kinds)
<a id="lexical-compounds"></a>

Some conventional kinds are **one root** in the lexicon: the seam between two published roots is spelled with the **first member’s reference letter** (`l` / `m` / `n` / `r`), with **no** mid-word **`x`**. Speakers do not coin these ad hoc — only the published compound list may add them.

**Shape:** `LEFT` + **join** + `RIGHT` = **stem**; then PoS + stem + **ending** on the whole word (same as any content word).

```
`zohohulabedel.`

gloss: `z-bedroom`

*a bedroom.*
```

<AgelanInspect text="zohohulabedel." />

The join letter records how the **left** root entered the closed kind (usually **-l** literal). The word’s final **-l** / **-m** / **-n** / **-r** is ordinary reference on the **whole** lemma.

| Stem | Parts | Kind |
|------|--------|------|
| `ohohulabede` | house **-l** bed | bedroom |
| `eberelonogo` | person **-l** bond | friend |
| `abogolahala` | book **-l** school | textbook |

Productive **`x`** is the default when you are still assembling (`golovexurul`, shop mashups, multipart names). Lexical closure is for kinds hearers should treat as **one entry** — like English *bedroom*, not *bed-room* tonight.

**Lexicon rules (summary).** Stem must not equal another published simple root. Among published roots, the stem must factor as exactly one `LEFT + join + RIGHT` pair. Members are content roots only — not join vowels or reviser shapes.

### Translation practice
<a id="translation-practice-advanced"></a>

Try each item before opening **Show answer**. Pick productive **`x`**, a lexical kind, or two words.

**1.** *a friend* (lexical kind)

::: details Show answer
`zeberelonogon.`
:::

**2.** *love in the crush sense* (still hear the field)

::: details Show answer
`golovexurul.`
:::

**3.** *a textbook* (lexical kind)

::: details Show answer
`zabogolahalal.`
:::

**4.** *Ozohu and guidance as two roots* (two people / two labels — not one person)

::: details Show answer
`zozohun zalanen.` (two slot-fillers — contrast `zozohuxalanen` one person)
:::

**5.** *Sushi-Coffee* (live shop label)

::: details Show answer
`zuzuzuxogoven.`
:::

**6.** *a firehouse* (lexical kind)

::: details Show answer
`zohohulurel.`
:::

## See also

- Word-initial **`x`** discourse role: [core.md](core.md#discourse-markers-x)
- Phonotactics of mid-word **`x`**: [phonology.md](phonology.md#phonotactics)
- Ability / values stance: [ability.md](ability.md) / [values.md](values.md)
- Role compounds / laterals: [roles.md](roles.md)
- Numeric derivation: [numeric-derivation.md](numeric-derivation.md)
- Named handles vs long titles: [reference-suffix.md](reference-suffix.md#named-handles)

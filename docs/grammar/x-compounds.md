# How to read mid-word `x`
<a id="x-compounds"></a>
<a id="compound-parser"></a>

How you tell, in an ordinary word, which **job** a mid-word **`x`** is doing. Inside a content word, **`x`** sits at the seam between pieces (the [compound joiner](phonology.md#phonotactics)). Word-initial **`x`** is the discourse-marker PoS, a different job.

## Beginner
<a id="beginner"></a>

### What mid-word `x` does

Glue two roots into **one** content word. Write **`x`** between them; the ending belongs to the whole word.

Mnemonic: **`x`** is the seam, like a plus between two labels.

```
`zuzuzuxogoven.`

gloss: `z-sushi-x-coffee`

*Sushi-Coffee* (one label)
```

<AgelanInspect text="zuzuzuxogoven." />

If the lexicon already has a single kind for that meaning, use that word (`zunowel` *sunflower*).

Shapes with a **vowel** (not a full root) on one side of **`x`**, a **number** on the right, or **more than two** roots, are Intermediate ([left and right of `x`](#families-by-shape)).

## Intermediate
<a id="intermediate"></a>

### Left and right of `x`
<a id="families-by-shape"></a>

You already know several jobs that use mid-word **`x`**. After the PoS letter, look at what sits **left** and **right** of the **first** **`x`**.

| You see (after PoS) | Job | Example |
|---------------------|-----|---------|
| One vowel, **`x`**, one vowel, then a span ending | [Span fence](spans.md) open or close | `daxal` … `xuxul` |
| One vowel **`a`** / **`u`** / **`o`**, **`x`**, then a longer root | [Role compound](roles.md#role-compounds) | `zaxuvugul` *a fighter* |
| Longer root, **`x`**, then one stance vowel **`a`** / **`e`** / **`o`** / **`u`** | [Values](values.md) (need host) or [ability](ability.md#ability) (other host) | `vuzunuxel` |
| Longer root, **`x`**, then a [number](numbers.md) stem (no ending of its own) | [Numeric derivation](numeric-derivation.md#numeric-derivation) | `…x+1…` / speech `…xraba…` |
| Full roots on **both** sides, optional further **`x`** + root | Ordinary compound | `zuzuzuxogoven`; `gewezexazawanen` *Azawan’s left* ([viewpoint laterals](roles.md#viewpoint-laterals)); `zozohuxalanen` ([phrasal proper names](reference-suffix.md#phrasal-proper-names)) |

A content root is never a **bare single vowel**, so a lone vowel **left** of **`x`** is a span open or a role vowel, not a values / ability / numeric **host**. Role compounds still put a full root (`V(CV)+`) after the role vowel. Span opens are the usual **vowel `x` vowel** shape. Numeric right halves follow number-stem grammar (markers **`+`** / **`-`** / **`#`** / **`_`**, digitless exponents including labels **`_e`** / **`_e-`**, hyperbole, [zero × exp](numbers.md#zero-exponent) **`+0e`** / **`±0e-1`** / **`#0e`**, label digits, scalar **`+N`** / **`-N`**, ordinal **`#N`**). Running-text examples prefer spelled CV (`…xraba…`); see [writing style](numbers.md#writing-style-numeric-vs-spelled).

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

[Phrasal names](reference-suffix.md#phrasal-proper-names) use the same left-to-right order (given × family × further title). An office’s **handle** is one root, not this compound ([named handles](reference-suffix.md#named-handles)). [Viewpoint laterals](roles.md#viewpoint-laterals) are **two** roots (`DIR x ANCHOR`). Span, role, values / ability, and numeric jobs use **one** mid-word **`x`**.

### Decision order

Walk the list in this order:

1. Exact **`xuxul`** / **`xuxur`** / **`xuxum`** → span close.
2. After PoS: one vowel + `x` + one vowel + a span ending → **span open** (or atomic / resume / empty per [spans](spans.md)).
3. After PoS: one vowel **`a`** / **`u`** / **`o`** + `x` + longer root + ending → **role compound**.
4. Longer material before `x`, then `x` + single stance vowel **`a`** / **`e`** / **`o`** / **`u`** + ending → **value** (need host) or **ability** (non-need host).
5. Longer material before `x`, then `x` + material that matches **number stem** grammar (writing **`+`** / **`-`** / **`#`** / **`_`**, speech **`r`+V…**, including digit morph **`+N`** / **`-N`** / **`#N`**) + ending → **numeric derivation**.
6. Longer material on **both** sides of the first `x`, with optional further **`x`** + content root pieces → ordinary compound (sense / name).

Role vowels are **`a`** / **`u`** / **`o`** only. Span type and edge letters stay single vowels.

### One slot, one package
<a id="compound-vs-separate"></a>

Pick **one** package for the job.

| Package | When | Example |
|---------|------|---------|
| **Two words** | Two slot-fillers, or a relation that already has its own marking: join / adjective | `zodogol zagadal` *a dog and a cat*; `zodogol gelulul` *a blue dog* (property = `/ɡ/`) |
| **`x` compound** | One referent; you still hear KIND then FIELD (live label, sense-narrowing, multipart name) | `golovexurul` *love in the crush sense*; `zuzuzuxogoven` *Sushi-Coffee* |
| **Lexical kind** | One conventional kind already closed as a single lexicon entry | `zohohulabedel` *bedroom*; `zunowel` *sunflower* ([lexical compounds](#lexical-compounds)) |

**Slot test (first).** How many things fill the slot? That many words. `zazawan zululon` is two people; `zazawaxululon` is one person.

**Construction menu.** Property on a host → `/ɡ/` (or `/w/`). List → [join](coordination.md). Participant → [role compound](roles.md#role-compounds). Count / unit → [number](numbers.md). Stance / ability / numeric derivation → those **`x`** jobs. When none of those apply and you still want KIND×FIELD in one slot → productive **`x`**.

A shop mashup stays **`x`** even when frequent. A fossil kind is a lexicon lemma (hear one root, not a dropped **`x`**).

### Translation practice
<a id="translation-practice"></a>

Short drills on this Intermediate band. Try each item before opening **Show answer**. The point is **`x`** assembly vs two words vs a lexical kind.

**Roots used here:** `olove` *love* · `aga` *crush* · `uzu` *sushi* · `ogove` *coffee* · `adeda` *tea* · `ohohu` *house* · `abede` *bed* · `ebere` *person* · `onogo` *bond* · `odogo` *dog* · `agada` *cat* · `unowe` *sunflower` (lexical kind) · `azawa` · `ululo`

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
*a sunflower* (lexical kind)
:::

## Advanced
<a id="advanced"></a>

### Lexical compounds (x-less kinds)
<a id="lexical-compounds"></a>

Some conventional kinds are **one root** in the lexicon: the seam between two published roots is spelled with the **first member’s reference letter** (`l` / `m` / `n` / `r`), with no mid-word **`x`**. You do not coin these on the fly; you learn each closed kind.

**Shape:** `LEFT` + join letter + `RIGHT` = **stem**; then PoS + stem + **ending** on the whole word (same as any content word).

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

Productive **`x`** is the default when you are still assembling (`golovexurul`, shop mashups, multipart names). Lexical closure is for kinds hearers should treat as **one entry**, like English *bedroom*.

### Translation practice
<a id="translation-practice-advanced"></a>

Try each item before opening **Show answer**. Recognize a lexical kind vs productive **`x`**.

**1.** *a friend* (lexical kind)

::: details Show answer
`zeberelonogon.`
:::

**2.** *a textbook* (lexical kind)

::: details Show answer
`zabogolahalal.`
:::

**3.** *Azawan and Ululon as two people*

::: details Show answer
`zazawan zululon.`
:::

**4.** *a firehouse* (lexical kind)

::: details Show answer
`zohohulurel.`
:::

## See also

- Word-initial **`x`** continue: [core.md](core.md#continue-x)
- Phonotactics of mid-word **`x`**: [phonology.md](phonology.md#phonotactics)
- [ability.md](ability.md) / [values.md](values.md) / [roles.md](roles.md) / [numeric-derivation.md](numeric-derivation.md)
- Named handles vs long titles: [reference-suffix.md](reference-suffix.md#named-handles)

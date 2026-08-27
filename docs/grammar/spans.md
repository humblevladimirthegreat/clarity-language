# Spans

Package wording (cite / aside / mention / opaque) with a PoS, TYPE, EDGE, and ending — brackets in writing, open / close words in speech. Multi-word binder scope uses **`^ … ^`** (not typed wording).

## Beginner
<a id="beginner"></a>

English marks special wording with quotes, parentheses, and italics. Agalan does it with **span fences**: a PoS letter plus a bracket pair in writing (or open / close words in speech). The bracket shape tells you the **type** — cite, mention, aside, or opaque.

### Writing vs speech
<a id="writing-vs-speech"></a>

| Channel | Form |
|---------|------|
| **Writing (preferred)** | **PoS letter** + optional **`@`** / **`~`** + brackets — type from bracket shape; marks sit **after** the PoS (`d@[…]`, `d~[…]`); anaphor uses interior **`=`** (`d[=]`) |

Same split as number shorthand (`g+3` written, full CV spoken); the spoken shapes are Intermediate ([below](#shape)). Prefer brackets in ordinary text when a bracket form exists.

### Writing fences
<a id="writing"></a>

| Brackets | Span type |
|----------|-----------|
| `[` … `]` | **cite** — attributed speech / cited wording (including title strings and proverbs cited as wording) |
| `{` … `}` | **mention** — the word or form itself (*the word X*); with **-n**, *the saying / proverb / title X* as a named unit |
| `(` … `)` | **aside** — parenthetical digression on `/h/`; still asserted |
| `<` … `>` | **opaque** — foreign, code, raw orthography |

**PoS:** write the PoS letter immediately before any **`@`** / **`~`** marks and the opening bracket (`d[…]`, `z{…}`, `h(…)`, `d<…>`).

| Mark | Job |
|------|-----|
| *(none)* | **exact** (**-l**) |
| **`~`** | **paraphrase** (**-m**) — `d~[…]` |
| **`@`** | **proper** (**-n**) — `d@[…]` |

Anaphor (**-r**): interior **`=`** (`d[=]`, `d{=}`, `h(=)`, `d<=>`).

```
`zedonen v[uzunu] d[jael]l.`

gloss: `z-listener` · `v-[sing]` · `d-[yes]`

*You “sing” a “yes.”*
```

```
`jol z<he>n d[=] v<said>l.`

gloss: `j-ask` · `z-he` · `d-[=]` · `v-said`

*He said that?!* (anaphor to a prior cite)
```

### When spans are required
<a id="when-required"></a>

Use a span when:

- citing someone’s words, a title string, or a proverb **as wording** (**cite**)
- mid-sentence parenthetical digression (**aside** — open **`h(…)`**; interior is ordinary Agalan, often a fragment)
- talking about the word or form itself, or *the saying / title X* as a named unit (**mention**; prefer **`@`** / **-n** for the named-unit reading)
- foreign, code, or other surface Agalan does **not** parse as native content (**opaque**)
- referring back to a prior span (**anaphor** **-r** / `…[=]`)

| Reading | Use |
|---------|-----|
| **Title-as-cite** / **proverb-as-cite** | **cite** `[…]` — deploy the **wording** |
| **Title-as-mention** / **proverb-as-mention** | **mention** `{…}` — point at the **form** or **named unit** (prefer **`@`** / **-n**) |
| Ordinary *the word X* | **mention** exact / paraphrase |

### Part of speech (slot)
<a id="pos"></a>

The open’s PoS is the **outer-clause slot** of the **entire** span — not the PoS of words inside. Ask: *in the outer sentence, what slot does this chunk fill?*

| PoS | When it earns its keep | Writing sketch |
|-----|------------------------|----------------|
| `/d/` | Default cite object — *said / wrote “…”* | `d[jael]`, `d[=]` |
| `/z/` | The wording or title **is** the subject | `z@[Hamlet]`, `z[=]` |
| `/b/` | Host needs a `/b/` argument — *about “…”*, *called “…”* | `b{…}`, `b[=]` |
| `/v/` | Span **is** the verb (phrase) — echo / report the act as wording | `v[oops]`, `v[=]` |
| `/ɡ/` | Property **is** the spanned string — *so-called “ready”* | `g@[Draft]` |
| `/h/` | **Asides** (digressions float like other adverbs); also manner cite | `h(…)`, `h~(…)`, `h(=)` |
| `/j/` | Vocative / expressive edge with a spanned call | `j@[…]` |
| `/x/` | Discourse-only citation (epigraph, freestanding span) | `x[…]` |

```
`jul zedonen v[uzunu] dugobol.`

gloss: `j-command` · `z-listener` · `v-[sing]` · `d-speaker`

*Don’t “sing” at me.*
```

### Asides
<a id="asides"></a>

An **aside** is a parenthetical comment packaged as an **adverb**. Write **`h(`** … **`)`**. The outer slot is `/h/`, so the whole fence sits anywhere an adverb may sit.

The interior is ordinary Agalan. It does **not** have to be a full sentence:

| Interior | Example | Reading |
|----------|---------|---------|
| Fragment (one word or a short stretch) | `zazawan vawalal h(zuzumum).` | *Azawan walks (happily).* |
| Same-force clause body | `zazawan vawalal h(zululon velebel).` | *Azawan walks (Ululon sleeps).* |

Interior words keep **their** PoS. The fence is the adverb. A one-word manner comment with nothing to package is a plain adverb: `zazawan vawalal huzumum.`

The aside **keeps the outer speech act** (omissible statement `jal` stays omitted). Put a new question or command in its own turn, not inside `h(…)`.

A *because* / *if* dependent is still **`adoro`**, not an aside. A second name for the same person uses [identity](predication.md#identity) or classification, not `h(…)`.

```
`zazawan vawalal h(zuzumum).`

gloss: `z-grace` · `v-walk` · `h-(happy)`

*Azawan walks (happily).*
```

### Mentions, opaque, and loan words
<a id="loans"></a>

| Need | Use |
|------|-----|
| **Raw foreign / code / unparsed surface** | **opaque** — `d<sushi>` (no ending after `>`); keep the source’s **casing** inside `<>` when that orthography uses case (`d<NaCl>`, `d<iPhone>`) — [capitalization](core.md#capitalization) |
| **Compact foreign content word** | `PoS<…>ENDING` — e.g. `d<sushi>l`, `z<Sam>n` (ordinary word, not a span fence); same casing rule inside `<>` |
| **The word or form itself** | **mention** — `d{…}` |
| **Title string / proverb as wording** | **cite** — `d[…]` / `d@[…]` |
| ***The title X* / *the proverb X*** as named unit | **mention** **-n** — `d@{…}` |
| **Nativized loan** | ordinary PoS + root + ending — no span |
| **That (prior span) again** | span anaphor — `daxur` / `hexur` / `duxur` / … |
| **Name / word citation outside a clause** | prefix-less **root + ending** — [citation forms](core.md#citation-forms) (`ugobon.`, `<Sam>n`) — not a span |

`d<sushi>` is a span open + interior blob; `d<sushi>l` is one content word whose root is foreign. Do not put **-l** / **-m** / **-n** / **-r** after an opaque closer. Spans need a PoS because they fill a **clause** slot; freestanding citation drops the role letter instead.

### Translation practice
<a id="translation-practice"></a>

Short drills on this Beginner band. Try each item before opening **Show answer**. Prefer a one-token cite, mention, or opaque blob; nativize when the surface wording is not the point. House names for people unless the item is a loan name.

**Roots used here:** `azawa` / `ululo` / `uhubu` · `ezehe` *tell* · `uwuru` *write* · `uzunu` *sing* · `eje` *see* · `awala` *walk* · `elebe` *sleep* · `uzumu` *happy* (**-m**) · `odogo` *dog* · `agada` *cat* · `abogo` *book* · `elulu` *blue* · `odogo` *dog*

#### English → Agalan

**1.** *Azawan said “hi.”*

::: details Show answer
`zazawan d[hi] vezehel.`
:::

**2.** *Azawan said that.* (resume the prior cite)

::: details Show answer
`zazawan d[=] vezehel.`
:::

**3.** *Ululon wrote something like “hi.”*

::: details Show answer
`zululon d~[hi] vuwurul.`
:::

**4.** *Uhubun sang “Hamlet.”* (title as wording)

::: details Show answer
`zuhubun d@[Hamlet] vuzunul.`
:::

**5.** *Azawan saw sushi.* (ordinary compact loan, not an opaque blob)

::: details Show answer
`zazawan d<sushi>l vejel.`
:::

**6.** *The word “dog” is blue.* (the form itself is the subject)

::: details Show answer
`z{odogo} gelulun.`
:::

**7.** *Don’t “oops,” Ululon.*

::: details Show answer
`jul zululon v[oops].`
:::

**8.** *Azawan walks (happily).* (parenthetical aside)

::: details Show answer
`zazawan vawalal h(zuzumum).`
:::

**9.** *Azawan walks (Ululon sleeps).* (clause-body aside)

::: details Show answer
`zazawan vawalal h(zululon velebel).`
:::

#### Agalan → English

**1.** `zululon d[=] vezehel.`

::: details Show answer
*Ululon said that.*
:::

**2.** `zazawan d<sushi> vejel.`

::: details Show answer
*Azawan saw sushi.* (opaque surface — not parsed as Agalan, and not a compact loan word)
:::

**3.** `zuhubun d{abogo} vezehel.`

::: details Show answer
*Uhubun said the word “book.”*
:::

**4.** `zululon d@{Hamlet} vuwurul.`

::: details Show answer
*Ululon wrote the title Hamlet (as a named unit).*
:::

**5.** `jol zazawan d[=] vezehel.`

::: details Show answer
*Azawan said that?!*
:::

**6.** `z{agada} godogol.`

::: details Show answer
*The word “cat” is a dog.*
:::

**7.** `z<Sam>n d[hi] vezehel.`

::: details Show answer
*Sam said “hi.”*
:::

**8.** `<Sam>n`

::: details Show answer
*Sam* (name citation outside a clause — not a span)
:::

**9.** `zazawan vawalal h(zululon velebel).`

::: details Show answer
*Azawan walks (Ululon sleeps).*
:::

## Intermediate
<a id="intermediate"></a>

Span fences are **pronounceable**: every bracket has a spoken word shape, given below.

### Spoken word shape
<a id="shape"></a>

```text
{PoS}{TYPE}x{EDGE}{ENDING}
```

| Piece | Values | Job |
|-------|--------|-----|
| **PoS** | `z` `d` `b` `v` `g` `w` `h` `j` `x` | slot the whole span fills |
| **TYPE** | **a** cite · **e** aside · **o** mention · **u** opaque | span kind |
| **`x`** | mid-word joiner | marks a span-fence form |
| **EDGE** | **a** · **e** · **o** · **u** | extent — how far an open runs |
| **ENDING** | **-l** exact · **-m** paraphrase · **-n** proper · **-r** anaphor | fidelity, titled designation, or span pronoun |

Example: **`daxal`** = `d` + `a` + `x` + `a` + `l` → open exact multi-token cite as direct object (needs close).

### TYPE (vowels)
<a id="type"></a>
<a id="vowels"></a>

Only **a** / **e** / **o** / **u** on TYPE. No stacked vowels on TYPE.

| TYPE | Role | Writing | Mnemonic |
|------|------|---------|----------|
| **a** | **cite** — cited wording; clausal interiors: outer speaker does **not** assert | `[` … `]` | **a** additive → cite |
| **e** | **aside** — `/h/` digression; outer speaker **does** assert; interior may be a fragment or a same-force clause body | `h(` … `)` | **e** rank → aside |
| **o** | **mention** — the word or form as object; with **-n**, named unit | `{` … `}` | **o** choice → mention |
| **u** | **opaque** — foreign / code / raw blob; interior is not native Agalan | `<` … `>` | **u** negation → opaque |

A native office **handle** refers with ordinary **-n** (`zabulon`) — [named handles](reference-suffix.md#named-handles). Mention `{abulo}` is that **form**; opaque / compact loan is a **foreign** acronym’s surface (`z<FBI>n`).

Scare / ironic *“so-called”* distance is not a separate TYPE; use ordinary lexicon attitude if needed.

### EDGE (extent)
<a id="edge"></a>

The vowel **after** `x` is **EDGE** — how far the open runs.

| EDGE | Job | Needs close? | Typical writing |
|------|-----|--------------|-----------------|
| **a** | **Multi-token open** — push a stack frame until explicit close (default) | yes | `d[…]` … `]` |
| **e** | **Clause-scoped** — auto-pop before the next clause-force `/j/` or clause-ledegul `/x/` join (**complete**) | no (auto) | `d[…` run to clause end |
| **o** | **Atomic** — exactly **one** following token | no | `d[uzunu]`, `d<sushi>` |
| **u** | **Empty / redacted** — no interior; also **anaphor** **-r** | no | `d[]`, `d[=]` |

**Anaphor `-r`** always uses EDGE **`u`** in the spoken template (`daxur`).

EDGE **`a`** / **`e`** / **`o`** take **-l** / **-m** / **-n**. EDGE **`u`** takes exact **-l** (`daxul`) or anaphor **-r** (`daxur`). Other **`VOWEL x VOWEL`** silhouettes (including **`xuxun`**) are [ordinary compounds](x-compounds.md#families-by-shape), not span opens.

### Endings on opens and span pronouns
<a id="endings"></a>

| Ending | Meaning | Preferred writing |
|--------|---------|-------------------|
| **-l** | **exact** — verbatim / precise surface | bare open (no `@` / `~`) |
| **-m** | **paraphrase** — gist / non-verbatim rendering | **`~`** after PoS (`d~[…]`) |
| **-n** | **proper** — titled / conventional designation of the **whole span** | **`@`** after PoS (`d@[…]`) |
| **-r** | **anaphor** — pronoun for the **most recent span of this TYPE**; PoS = role **now** | `d[=]`, `h(=)`, `z{=}`, … |

 Hedged proper (`@~`) is written **`d@[…]`** only (spoken as the **proper** open with uncertain tonality). **`@`** / **`~`** do not combine with anaphor **-r**.

**-r** is ordinary [anaphora](pronouns.md). `daxur` = *that (cite)* as object — matching the most recent **cite** (TYPE **a**). `hexur` / `h(=)` = *that (aside)*. The pronoun’s PoS need not match the antecedent open’s PoS (`zaxur` = that cite as subject). No interior; no close (EDGE **`u`**).

### Writing ↔ speech map (core)

| Writing | Speech (object slot) | Notes |
|---------|----------------------|-------|
| `d[…]` | `daxal` … `xuxul` | exact multi-token cite (EDGE **a**); complete close |
| `d~[…]` | `daxam` … `xuxul` | paraphrased multi-token cite |
| `d@[…]` | `daxan` … `xuxul` | proper multi-token cite; also spelling of hedged proper |
| `d{…}` / `d~{…}` / `d@{…}` | `doxal` / `doxam` / `doxan` … `xuxul` | mention |
| `h(…)` / `h~(…)` / `h@(…)` | `hexal` / `hexam` / `hexan` … `xuxul` | aside (open PoS is `/h/`) |
| `h(zuzumum)` | `hexol zuzumum` | atomic aside |
| `h(=)` | `hexur` | aside anaphor |
| `d<…>` / `d~<…>` / `d@<…>` | `duxal` / `duxam` / `duxan` … `xuxul` | opaque |
| `d[hi]` | `daxol hi` | atomic (EDGE **o**) |
| `d@[Hamlet]` | `daxon Hamlet` | atomic proper cite |
| `d[…` … (to clause end) | `daxel` … | clause-scoped (EDGE **e**) |
| `d[]` | `daxul` | empty / redacted (EDGE **u**) |
| `d[=]` | `daxur` | anaphor (EDGE **u**) |

Close does not repeat PoS, TYPE, EDGE, or open fidelity. Explicit close for EDGE **a**: **`xuxul`** (complete) — Intermediate editorial / close-all live in Advanced.

### Nesting
<a id="nesting"></a>

Typed span fences nest freely. Each multi-token open pushes; **`xuxul`** pops the innermost (complete). Atomic and anaphor do not nest-push. **Adjunct-scope islands** (`^ … ^`) do **not** nest — use a typed span when you need nested packaging.

Examples: `d[ h(…) ]`, `d[ z{…} ]`, `d~[ d<…> ]`. **`@`** / **`~`** apply only to the immediately following open.

### Adjunct-scope islands
<a id="adjunct-scope-islands"></a>
<a id="scope-islands"></a>

**Scope islands** mark a multi-word chunk so an **inside binder** can target that chunk. Writing **`^ … ^`**; speech is **prosody only** (no spoken open/close word). The edges carry **no meaning of their own** — like parentheses; the inside binder is the function.

```
`^ h<maybe>l zaredel zodogol ^ v<saw>l.`

gloss: `^` · `h-maybe` · `z-red` · `z-dog` · `^` · `v-saw`

*… saw maybe the red dog* — *maybe* targets that chunk.
```

**Rules:**

- No PoS on the edges (contrast `d[…]`, `h(…)`, `d<…>`).
- **One island per clause.** Do not nest islands.
- Empty `^^` is illegal.
- **Binder required:** at least one scope-taking `/h/` and/or a [join](coordination.md#join-scope-islands-rules) particle **inside**. Binderless `^ … ^` is illegal.
- Prefer spaces inside: `^ h<maybe>l zaredel zodogol ^`.

| Binder | Job inside the island |
|--------|------------------------|
| Scope-taking **`/h/`** | frames that **chunk** (prefer first in the island) |
| Prefixed **join** | lookback-absorbs **only** matching-role material **inside** — [join scope islands](coordination.md#join-scope-islands-rules) |

`/h/` and a join may share one island (`^ h<maybe>l z<A> z<B> zam ^`). **`/w/` does not bind islands** — it still only frames the previous `/ɡ/`.

| Placement | Reading |
|-----------|---------|
| `/h/` **inside** | frames that chunk |
| `/h/` **outside** | ordinary floating adverb — frames the verb / clause |
| Join **inside** | joins only interior conjuncts |
| Join **outside** with island nearby | ordinary lookback (edges do not filter an outside join) |

```
`z<Sam>n ^ z<water>l zal ^ zam v<saw>l.`

gloss: `z-Sam` · `^` · `z-water` · `zal` · `^` · `zam` · `v-saw`

*Sam and (just water) saw …*
```

**Speech / prosody:** brief reset into the island, one tight intonation phrase, boundary on the last island stress. In singing: an ordinary phrase bow — not quote voice, not quiet aside voice.

| Need | Use instead |
|------|-------------|
| Nested packaging / wording fidelity / opaque | typed [span fences](#writing) |
| Whole-clause soft assert | **`jam`** — [clause force](core.md#clause-force) |
| Single-adjective frame | `/w/` on that `/ɡ/` |
| Join over only part of a same-slot stretch | put that join **inside** `^ … ^` |

### Translation practice
<a id="translation-practice-intermediate"></a>

Short drills on this Intermediate band. Try each item before opening **Show answer**. Test spoken opens (TYPE / EDGE / ending), an explicit **`xuxul`** close, nesting, or a **`^ … ^`** island — not only Beginner brackets.

**Roots used here:** `azawa` / `ululo` / `uhubu` · `ezehe` *tell* · `eje` *see* · `urunu` *run* · `arede` *red* · `odogo` *dog* · `agada` *cat* · `abogo` *book* · `elulu` *blue* · `uzumu` *happy* (**-m**) · `abulo` (handle **Abulo**)

#### English → Agalan

**1.** *Azawan said “hi.”* (spoken atomic cite)

::: details Show answer
`zazawan daxol hi vezehel.`
:::

**2.** *Ululon said “hi Azawan.”* (spoken multi-token cite)

::: details Show answer
`zululon daxal hi zazawan xuxul vezehel.`
:::

**3.** *Uhubun said that.* (spoken cite anaphor)

::: details Show answer
`zuhubun daxur vezehel.`
:::

**4.** *Azawan said \[redacted\].*

::: details Show answer
`zazawan daxul vezehel.`
:::

**5.** *Azawan saw sushi.* (spoken atomic opaque)

::: details Show answer
`zazawan duxol sushi vejel.`
:::

**6.** *Azawan said “hi” (happily).* (cite nesting an aside)

::: details Show answer
`zazawan d[ h(zuzumum) hi ] vezehel.`
:::

**7.** *Azawan walks (happily).* (spoken atomic aside)

::: details Show answer
`zazawan vawalal hexol zuzumum.`
:::

**8.** *Azawan saw maybe the red dog.* (*maybe* targets that chunk)

::: details Show answer
`zazawan ^ h<maybe>l zaredel zodogol ^ vejel.`
:::

**9.** *Uhubun and (just a cat) ran.*

::: details Show answer
`zuhubun ^ zagadal zal ^ zam vurunul.`
:::

**10.** *Azawan said the word “Abulo.”*

::: details Show answer
`zazawan d{abulo} vezehel.`
:::

#### Agalan → English

**1.** `zazawan daxel hi.`

::: details Show answer
*Azawan said “hi.”* (clause-scoped cite — no explicit close)
:::

**2.** `zululon daxam hi zazawan xuxul vezehel.`

::: details Show answer
*Ululon said something like “hi Azawan.”*
:::

**3.** `zaxur gelulun.`

::: details Show answer
*That (cite) is blue.* (anaphor as subject)
:::

**4.** `zuhubun daxon Hamlet vuzunul.`

::: details Show answer
*Uhubun sang “Hamlet.”* (spoken atomic proper cite)
:::

**5.** `zululon doxom abogo vezehel.`

::: details Show answer
*Ululon said the word “book” (as a gist / paraphrase).*
:::

**6.** `zazawan d[ z{abogo} ] vezehel.`

::: details Show answer
*Azawan said the word “book” (cite wrapping a mention).*
:::

**7.** `zululon ^ h<maybe>l zaredel zagadal ^ vejel.`

::: details Show answer
*Ululon saw maybe the red cat.*
:::

**8.** `zazawan ^ zodogol zal ^ zam vejel.`

::: details Show answer
*Azawan and (just a dog) saw (it).*
:::

**9.** `zazawan vawalal hexol zuzumum.`

::: details Show answer
*Azawan walks (happily).*
:::

**10.** `zazawan d{abulo} vezehel.`

::: details Show answer
*Azawan said the word “Abulo.”*
:::

## Advanced
<a id="advanced"></a>

### Close forms (complete / editorial / close-all)

| Spoken | Job | Writing | Mnemonic |
|--------|-----|---------|----------|
| **`xuxul`** | pop **one** — **complete** | matching closer `]` / `}` / `)` / `>` | exact **-l**: the span closes whole |
| **`xuxur`** | pop **one** — **editorial** (wording kept as written under an editorial mark: cut off, trail off, or defect noted) | `#]` / `#}` / `#)` / `#>` | resume **-r**: the wording stops short or carries a mark; resume may pick up |
| **`xuxum`** | pop **all** open spans | optional close-all mark `\|` | soft **-m**: sweep everything lightly |
| **`xuxur`** + **`xuxum`** | editorial innermost, then pop all | `#\|` | |

```text
xuxul  =  x + u + x + u + l
xuxur  =  x + u + x + u + r
xuxum  =  x + u + x + u + m
```

Editorial spans **are committed** and enter anaphor history (`d[=]` / `daxur` may resume them). Combined `#\|` is writing-only shorthand for two spoken closes; bare `xuxur` never means pop-all by itself. Illegal: `\|#` (editorial mark must precede close-all).

These forms are not clause joins (`xul` / `xum` = negation — different shape). They are not an empty cite under `/d/` (`daxul` = empty/redacted; `daxur` = that cite; `xuxul` = complete close; `xuxur` = editorial close).

| Writing | Speech | Notes |
|---------|--------|-------|
| `d[…#]` | `daxal` … `xuxur` | editorial close |
| `d[…#\|]` | `daxal` … `xuxur xuxum` | editorial + close-all |

Prefer EDGE **`a`** + **`xuxur`** for cut-off cites; EDGE **`e`** auto-pop is **complete**, not editorial.

### Spoken inventory
<a id="inventory"></a>

#### Opens and related (PoS shown as `…`; EDGE **a** unless noted)

| TYPE | exact multi **-l** | paraphrase **-m** | proper **-n** | anaphor **-r** (EDGE **u**) |
|------|--------------------|-------------------|---------------|------------------------------|
| cite **a** | `…axal` | `…axam` | `…axan` | `…axur` |
| aside **e** | `hexal` | `hexam` | `hexan` | `hexur` |
| mention **o** | `…oxal` | `…oxam` | `…oxan` | `…oxur` |
| opaque **u** | `…uxal` | `…uxam` | `…uxan` | `…uxur` |

Atomic (EDGE **o**): `…axol` / `…axom` / `…axon` (cite examples); aside atomic **`hexol`**. Clause-scoped (EDGE **e**): `…axel` / `…axem` / `…axen`. Empty exact (EDGE **u**): `…axul` / `hexul` / `…oxul` / `…uxul`. Aside **opens** use `/h/`; anaphor may recast the aside into another slot (`dexur`).

#### Closes

| Form | Job |
|------|-----|
| `xuxul` | pop one — complete |
| `xuxur` | pop one — editorial |
| `xuxum` | pop all |
| `xuxur xuxum` | editorial + pop all (writing `#\|`) |

### Literal content (fence words / meta glyphs)
<a id="literal-content"></a>
<a id="escape"></a>

When a span-marker word or a fence glyph (`[` / `]` / `{` / `}` / `(` / `)` / `<` / `>` / `=` / `|` / `#` / `^`) must appear **as content** — not ordinary nesting — wrap that token in **atomic opaque**. Writing and speech use the same vehicle. There is no backslash escape.

The outer span’s wording is the opaque **interior** (the wrapper is packaging, not extra cited words).

```text
d[ he typed d<]> then left ]
d[ d<xuxul> ]
d[ pipe d<|> here ]
d[ item d<#> ]
```

Speech for a fence **word**:

```text
daxal duxol xuxul xuxul
```

`d[ item d<#> ]` is a **complete** cite whose last content character is `#` (a bare `#]` would be editorial close). A hyphen before a closer is ordinary content, not a close mark.

Writing opaque `d<…>` closes on the first `>`. If the blob **contains** `>`, do not use `<>`; write the spoken opaque (EDGE **a** + **`xuxul`**):

```text
duxal code > 1 xuxul
```

While scanning a span interior, `#` immediately before a closer or close-all is the editorial mark; `|` is close-all. Number words still use `#` for ordinals — [numbers.md](numbers.md) — that is not a span closer unless the `#` sits immediately before `]` / `}` / `)` / `>` / `|`.

### Translation practice
<a id="translation-practice-advanced"></a>

Short drills on this Advanced band. Try each item before opening **Show answer**. Test how the span **closes** (complete / editorial / close-all), or literal fence material as **opaque** content.

**Roots used here:** `azawa` / `ululo` / `uhubu` · `ezehe` *tell* · `uzumu` *happy* (**-m**)

#### English → Agalan

**1.** *Azawan said “hi…”* (the cite trails off)

::: details Show answer
`zazawan daxal hi xuxur vezehel.`
:::

**2.** *Ululon said “hi”* (keep the wording as written, defects and all — editorial close)

::: details Show answer
`zululon daxal hi xuxur vezehel.`
:::

**3.** *Uhubun said “hi” (happily)* — then pop every open span at once.

::: details Show answer
`zuhubun daxal hi hexol zuzumum xuxum vezehel.`
:::

**4.** *Azawan said “he typed ] then left.”*

::: details Show answer
`zazawan d[ he typed d<]> then left ] vezehel.`
:::

#### Agalan → English

**1.** `zazawan d[hi#] vezehel.`

::: details Show answer
*Azawan said “hi…”* (editorial cite — wording trails off)
:::

**2.** `zuhubun daxal hi xuxul vezehel.`

::: details Show answer
*Uhubun said “hi.”* (complete close of one span)
:::

**3.** `zazawan daxal hi xuxur xuxum vezehel.`

::: details Show answer
*Azawan said “hi…”* (editorial innermost, then pop all)
:::

**4.** `zululon daxal duxol xuxul xuxul vezehel.`

::: details Show answer
*Ululon said the word “xuxul” (as opaque content inside a cite).*
:::

**5.** `zululon duxal code > 1 xuxul vezehel.`

::: details Show answer
*Ululon said “code > 1.”* (opaque blob; spoken close — writing `<>` would take the first `>` as closer)
:::

<a id="xl<spa>n-markers"></a>

## See also

- Join scope islands: [coordination.md](coordination.md#join-scope-islands-rules)
- Identity vs parenthetical comment: [predication.md](predication.md#identity)
- Phrasal proper names (no span needed): [reference-suffix.md](reference-suffix.md#phrasal-proper-names)
- Native office handles: [reference-suffix.md](reference-suffix.md#named-handles)
- Prefix-less citation outside a clause: [core.md § Outside a sentence](core.md#citation-forms)

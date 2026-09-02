# Spans

Package wording (cite / aside / mention / opaque) with a role letter, a span kind, how far the open runs, and an ending. Writing uses brackets; speech uses open / close words.

## Beginner
<a id="beginner"></a>

English marks special wording with quotes, parentheses, and italics. Agalan uses **span fences**: a role letter plus a bracket pair in writing (or open / close words in speech). The bracket shape tells you the **type**: cite, mention, aside, or opaque.

Prefer brackets in ordinary text when a bracket form exists. Spoken open / close words are Intermediate ([spoken word shape](#shape)).

### Writing fences
<a id="writing"></a>
<a id="writing-vs-speech"></a>

Write the **role letter** immediately before any **`@`** / **`~`** marks and the opening bracket (`d[…]`, `z{…}`, `h(…)`, `d<…>`). Marks sit **after** the role letter (`d@[…]`, `d~[…]`).

| Brackets | Span type | Mnemonic |
|----------|-----------|----------|
| `[` … `]` | **cite** — attributed speech / cited wording (including title strings and proverbs cited as wording) | square quotes: you are **quoting** someone |
| `{` … `}` | **mention** — the word or form itself (*the word X*); with **-n**, *the saying / proverb / title X* as a named unit | curly braces: you are **holding the form** as an object |
| `(` … `)` | **aside** — parenthetical digression on `/h/`; still asserted | round parentheses: a **side comment** |
| `<` … `>` | **opaque** — foreign, code, raw orthography | angle brackets: a **raw blob** |

```
`zazawan v[uzunu] d[jael]l.`

gloss: `z-grace` · `v-[sing]` · `d-[yes]`

*Azawan “sings” a “yes.”*
```

| Mark | Job |
|------|-----|
| *(none)* | **exact** (**-l**) |
| **`~`** | **paraphrase** (**-m**) — `d~[…]` |
| **`@`** | **proper** (**-n**) — `d@[…]` |

To point back at a prior span (**-r**), put **`=`** inside the same brackets: `d[=]`, `d{=}`, `h(=)`, `d<=>`.

```
`jol zululon d[=] vezehel.`

gloss: `j-ask` · `z-courage` · `d-[=]` · `v-tell`

*Ululon said that?!* (resume a prior cite)
```

### When spans are required
<a id="when-required"></a>

Use a span when you need one of these jobs:

| Reading | Use |
|---------|-----|
| Someone’s words, a title string, or a proverb **as wording** | **cite** `[…]` |
| *The title X* / *the proverb X* as a **named unit** | **mention** `{…}` with **`@`** / **-n** |
| Ordinary *the word X* / the form itself | **mention** `{…}` |
| Mid-sentence parenthetical digression | **aside** (`h(…)`); interior is ordinary Agalan, often a fragment |
| Foreign, code, or other surface that is not ordinary Agalan words | **opaque** |
| Referring back to a prior span | **resume** **-r** / `…[=]` |

### Part of speech (slot)
<a id="pos"></a>

The open’s role letter is the **outer-clause slot of the entire span**. Ask: *in the outer sentence, what slot does this chunk fill?* Interior words keep their own role letters.

| PoS | When | Writing sketch |
|-----|------|----------------|
| `/d/` | Default cite object — *said / wrote “…”* | `d[jael]`, `d[=]` |
| `/z/` | The wording or title **is** the subject | `z@[Hamlet]`, `z[=]` |
| `/b/` | Host needs a `/b/` argument — *about “…”*, *called “…”* | `b{…}`, `b[=]` |
| `/v/` | Span **is** the verb (phrase): echo / report the act as wording | `v[oops]`, `v[=]` |
| `/ɡ/` | Property **is** the spanned string — *so-called “ready”* | `g@[Draft]` |
| `/h/` | Asides (digressions float like other adverbs); also manner cite | `h(…)`, `h~(…)`, `h(=)` |
| `/j/` | Vocative / expressive edge | `j@[…]` |
| `/x/` | Discourse-only citation (epigraph, freestanding span) | `x[…]` |

```
`jul zululon v[uzunu] dazawan.`

gloss: `j-command` · `z-courage` · `v-[sing]` · `d-grace`

*Ululon, don’t “sing” Azawan.*
```

### Asides
<a id="asides"></a>

An **aside** is a parenthetical comment packaged as an **adverb**. Write **`h(`** … **`)`**. The outer slot is `/h/`, so the whole fence sits anywhere an adverb may sit.

The interior is ordinary Agalan. It may be a fragment or a same-speech-act clause body:

| Interior | Example | Reading |
|----------|---------|---------|
| Fragment (one word or a short stretch) | `zazawan vawalal h(zuzumum).` | *Azawan walks (happily).* |
| Same-speech-act clause body | `zazawan vawalal h(zululon velebel).` | *Azawan walks (Ululon sleeps).* |

Interior words keep **their** role letters. The fence is the adverb. A one-word manner comment with nothing to package is a plain adverb: `zazawan vawalal huzumum.`

The aside **keeps the outer speech act** (omissible statement `jal` stays omitted). Put a new question or command in its own turn.

A *because* / *if* dependent is still **`adoro`**. A second name for the same person uses [identity](predication.md#identity) or classification.

```
`zazawan vawalal h(zuzumum).`

gloss: `z-grace` · `v-walk` · `h-(happy)`

*Azawan walks (happily).*
```

### Mentions, opaque, and loan words
<a id="loans"></a>

| Need | Use |
|------|-----|
| **Raw foreign / code / surface that is not Agalan words** | **opaque** — `d<sushi>` (no ending after `>`); keep the source’s **casing** inside `<>` when that writing system uses case (`d<NaCl>`, `d<iPhone>`): [capitalization](core.md#capitalization) |
| **Compact foreign content word** | `PoS<…>ENDING` — e.g. `d<sushi>l`, `z<Sam>n` (ordinary word); same casing rule inside `<>` |
| **The word or form itself** | **mention** — `d{…}` |
| **Title string / proverb as wording** | **cite** — `d[…]` / `d@[…]` |
| ***The title X* / *the proverb X*** as a named unit | **mention** **-n** — `d@{…}` |
| **Nativized loan** | ordinary role letter + root + ending |
| **That (prior span) again** | span resume — `daxur` / `hexur` / `duxur` / … |
| **Name / word citation outside a clause** | prefix-less **root + ending**: [citation forms](core.md#citation-forms) (`ugobon.`, `<Sam>n`) |

`d<sushi>` is a span open plus an interior blob. `d<sushi>l` is one content word whose root is foreign. Opaque closers take no **-l** / **-m** / **-n** / **-r** after `>`. Spans need a role letter because they fill a **clause** slot; freestanding citation drops the role letter instead.

### Translation practice
<a id="translation-practice"></a>

Short drills on this Beginner band. Try each item before opening **Show answer**. Prefer a one-token cite, mention, or opaque blob; nativize when the surface wording is not the point. House names for people unless the item is a loan name.

**Roots used here:** `azawa` / `ululo` / `uhubu` · `ezehe` *tell* · `uwuru` *write* · `uzunu` *sing* · `eje` *see* · `awala` *walk* · `elebe` *sleep* · `uzumu` *happy* (**-m**) · `odogo` *dog* · `agada` *cat* · `abogo` *book* · `elulu` *blue*

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
*Azawan saw sushi.* (opaque surface: not ordinary Agalan words, and not a compact loan word)
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
*Sam* (name citation outside a clause)
:::

**9.** `zazawan vawalal h(zululon velebel).`

::: details Show answer
*Azawan walks (Ululon sleeps).*
:::

## Intermediate
<a id="intermediate"></a>

Span fences are **pronounceable**: every bracket has a spoken word shape.

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
| **EDGE** | **a** · **e** · **o** · **u** | extent: how far an open runs |
| **ENDING** | **-l** exact · **-m** paraphrase · **-n** proper · **-r** resume | fidelity, titled designation, or span resume |

Example: **`daxal`** = `d` + `a` + `x` + `a` + `l` → open exact multi-token cite as direct object (needs close).

### TYPE (vowels)
<a id="type"></a>
<a id="vowels"></a>

TYPE uses **a** / **e** / **o** / **u**.

| TYPE | Role | Writing | Mnemonic |
|------|------|---------|----------|
| **a** | **cite** — cited wording; clausal interiors: outer speaker does **not** assert | `[` … `]` | **a** add → cite |
| **e** | **aside** — `/h/` digression; outer speaker **does** assert; interior may be a fragment or a same-speech-act clause body | `h(` … `)` | **e** order → aside |
| **o** | **mention** — the word or form as object; with **-n**, named unit | `{` … `}` | **o** one → mention |
| **u** | **opaque** — foreign / code / raw blob; interior is not native Agalan | `<` … `>` | **u** undo → opaque |

A native office **handle** refers with ordinary **-n** (`zabulon`): [named handles](reference-suffix.md#named-handles). Mention `{abulo}` is that **form**; opaque / compact loan is a **foreign** acronym’s surface (`z<FBI>n`).

### EDGE (extent)
<a id="edge"></a>

The vowel **after** `x` is **EDGE**: how far the open runs.

| EDGE | Job | Needs close? | Typical writing |
|------|-----|--------------|-----------------|
| **a** | **Multi-token open** — push a stack frame until explicit close (default) | yes | `d[…]` … `]` |
| **e** | **Clause-scoped** — auto-pop before the next speech-act `/j/` or clause-level `/x/` join (**complete**) | no (auto) | `d[…` run to clause end |
| **o** | **Atomic** — exactly **one** following token | no | `d[uzunu]`, `d<sushi>` |
| **u** | **Empty / redacted** — no interior; also **resume** **-r** | no | `d[]`, `d[=]` |

**Anaphor `-r`** always uses EDGE **`u`** in the spoken template (`daxur`).

EDGE **`a`** / **`e`** / **`o`** take **-l** / **-m** / **-n**. EDGE **`u`** takes exact **-l** (`daxul`) or resume **-r** (`daxur`).

### Endings on opens and span pronouns
<a id="endings"></a>

| Ending | Meaning | Preferred writing |
|--------|---------|-------------------|
| **-l** | **exact** — verbatim / precise surface | bare open (no `@` / `~`) |
| **-m** | **paraphrase** — gist / non-verbatim rendering | **`~`** after the role letter (`d~[…]`) |
| **-n** | **proper** — titled / conventional designation of the **whole span** | **`@`** after the role letter (`d@[…]`) |
| **-r** | **resume** — the **most recent span of this TYPE**; PoS = role **now** | `d[=]`, `h(=)`, `z{=}`, … |

Hedged proper (`@~`) is written **`d@[…]`** only (spoken as the **proper** open with uncertain tonality). **`@`** / **`~`** do not combine with resume **-r**.

**-r** resumes a prior span ([pronouns.md](pronouns.md); linguists: anaphora). `daxur` = *that (cite)* as object, matching the most recent **cite** (TYPE **a**). `hexur` / `h(=)` = *that (aside)*. The resume’s role letter need not match the antecedent open’s (`zaxur` = that cite as subject). No interior; no close (EDGE **`u`**).

### Writing ↔ speech map (core)

| Writing | Speech (object slot) | Notes |
|---------|----------------------|-------|
| `d[…]` | `daxal` … `xuxul` | exact multi-token cite (EDGE **a**); complete close |
| `d~[…]` | `daxam` … `xuxul` | paraphrased multi-token cite |
| `d@[…]` | `daxan` … `xuxul` | proper multi-token cite; also spelling of hedged proper |
| `d{…}` / `d~{…}` / `d@{…}` | `doxal` / `doxam` / `doxan` … `xuxul` | mention |
| `h(…)` / `h~(…)` / `h@(…)` | `hexal` / `hexam` / `hexan` … `xuxul` | aside (open PoS is `/h/`) |
| `h(zuzumum)` | `hexol zuzumum` | atomic aside |
| `h(=)` | `hexur` | aside resume |
| `d<…>` / `d~<…>` / `d@<…>` | `duxal` / `duxam` / `duxan` … `xuxul` | opaque |
| `d[hi]` | `daxol hi` | atomic (EDGE **o**) |
| `d@[Hamlet]` | `daxon Hamlet` | atomic proper cite |
| `d[…` … (to clause end) | `daxel` … | clause-scoped (EDGE **e**) |
| `d[]` | `daxul` | empty / redacted (EDGE **u**) |
| `d[=]` | `daxur` | resume (EDGE **u**) |

Close does not repeat PoS, TYPE, EDGE, or open fidelity. Explicit close for EDGE **a**: **`xuxul`** (complete). Editorial / close-all live in Advanced.

### Nesting
<a id="nesting"></a>

Typed span fences nest freely. Each multi-token open pushes; **`xuxul`** pops the innermost (complete). Atomic and resume do not nest-push. **Scope islands** (`^ … ^`) are a single layer: use a typed span when you need nested packaging.

Examples: `d[ h(…) ]`, `d[ z{…} ]`, `d~[ d<…> ]`. **`@`** / **`~`** apply only to the immediately following open.

### Scope islands
<a id="adjunct-scope-islands"></a>
<a id="scope-islands"></a>

**Scope islands** mark a multi-word chunk so an **inside binder** can target that chunk. Writing **`^ … ^`**. In speech you only hear a pause and one tight phrase: there is no spoken open or close word. The edges are only grouping marks, like parentheses; the inside binder is the function.

```
`zazawan ^ h<maybe>l zaredel zodogol ^ vejel.`

gloss: `z-grace` · `^` · `h-maybe` · `z-red` · `z-dog` · `^` · `v-see`

*Azawan saw maybe the red dog* (*maybe* targets that chunk).
```

**Rules:**

- No role letter on the edges (typed fences like `d[…]` already have one).
- **One island per clause.** Islands do not nest.
- Empty `^^` has no reading.
- **Binder required:** at least one scope-taking `/h/` and/or a [join](coordination.md#join-scope-islands-rules) particle **inside**.
- Prefer spaces inside: `^ h<maybe>l zaredel zodogol ^`.

| Binder | Job inside the island |
|--------|------------------------|
| Scope-taking **`/h/`** | frames that **chunk** (prefer first in the island) |
| Prefixed **join** | lookback-absorbs **only** matching-role material **inside** — [join scope islands](coordination.md#join-scope-islands-rules) |

`/h/` and a join may share one island (`^ h<maybe>l zazawan zululon zam ^`). **`/w/`** still only frames the previous `/ɡ/`.

| Placement | Reading |
|-----------|---------|
| `/h/` **inside** | frames that chunk |
| `/h/` **outside** | ordinary floating adverb: frames the verb / clause |
| Join **inside** | joins only interior conjuncts |
| Join **outside** with island nearby | ordinary lookback (edges do not filter an outside join) |

```
`zazawan ^ zululon zal ^ zam vejel.`

gloss: `z-grace` · `^` · `z-courage` · `zal` · `^` · `zam` · `v-see`

*Azawan and (just Ululon) saw …*
```

**Speech:** brief reset into the island, one tight phrase, boundary on the last island stress. In singing, use an ordinary phrase bow.

| Need | Use |
|------|-----|
| Nested packaging / wording fidelity / opaque | typed [span fences](#writing) |
| Whole-clause soft assert | **`jam`** — [speech act](core.md#speech-act) |
| Single-adjective frame | `/w/` on that `/ɡ/` |
| Join over only part of a same-slot stretch | put that join **inside** `^ … ^` |

### Translation practice
<a id="translation-practice-intermediate"></a>

Short drills on this Intermediate band. Try each item before opening **Show answer**. Test spoken opens (TYPE / EDGE / ending), an explicit **`xuxul`** close, nesting, or a **`^ … ^`** island: not only Beginner brackets.

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

**3.** *Uhubun said that.* (spoken cite resume)

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
*Azawan said “hi.”* (clause-scoped cite: no explicit close)
:::

**2.** `zululon daxam hi zazawan xuxul vezehel.`

::: details Show answer
*Ululon said something like “hi Azawan.”*
:::

**3.** `zaxur gelulun.`

::: details Show answer
*That (cite) is blue.* (resume as subject)
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

Editorial spans **are committed** and enter resume history (`d[=]` / `daxur` may resume them). Combined `#\|` is writing-only shorthand for two spoken closes; bare `xuxur` pops one (editorial). Write editorial first, then close-all: `#\|`.

Clause joins that negate use a different shape (`xul` / `xum`). Empty or resumed **cite opens** use `/d/` (`daxul` empty/redacted; `daxur` that cite). Closes are **`xuxul`** / **`xuxur`**.

| Writing | Speech | Notes |
|---------|--------|-------|
| `d[…#]` | `daxal` … `xuxur` | editorial close |
| `d[…#\|]` | `daxal` … `xuxur xuxum` | editorial + close-all |

Prefer EDGE **`a`** + **`xuxur`** for cut-off cites. EDGE **`e`** auto-pop is **complete**.

### Spoken inventory
<a id="inventory"></a>

#### Opens and related (PoS shown as `…`; EDGE **a** unless noted)

| TYPE | exact multi **-l** | paraphrase **-m** | proper **-n** | resume **-r** (EDGE **u**) |
|------|--------------------|-------------------|---------------|------------------------------|
| cite **a** | `…axal` | `…axam` | `…axan` | `…axur` |
| aside **e** | `hexal` | `hexam` | `hexan` | `hexur` |
| mention **o** | `…oxal` | `…oxam` | `…oxan` | `…oxur` |
| opaque **u** | `…uxal` | `…uxam` | `…uxan` | `…uxur` |

Atomic (EDGE **o**): `…axol` / `…axom` / `…axon` (cite examples); aside atomic **`hexol`**. Clause-scoped (EDGE **e**): `…axel` / `…axem` / `…axen`. Empty exact (EDGE **u**): `…axul` / `hexul` / `…oxul` / `…uxul`. Aside **opens** use `/h/`; resume may recast the aside into another slot (`dexur`).

#### Closes

| Form | Job |
|------|-----|
| `xuxul` | pop one — complete |
| `xuxur` | pop one — editorial |
| `xuxum` | pop all |
| `xuxur xuxum` | editorial + pop all (writing `#\|`) |

### Literal content (fence words / fence marks)
<a id="literal-content"></a>
<a id="escape"></a>

When a span-marker word or a fence glyph (`[` / `]` / `{` / `}` / `(` / `)` / `<` / `>` / `=` / `|` / `#` / `^`) must appear **as content** (not ordinary nesting), wrap that token in **atomic opaque**. Writing and speech use the same vehicle.

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

`d[ item d<#> ]` is a **complete** cite whose last content character is `#` (a bare `#]` would be editorial close). A hyphen before a closer is ordinary content.

Writing opaque `d<…>` closes on the first `>`. If the blob **contains** `>`, write the spoken opaque (EDGE **a** + **`xuxul`**):

```text
duxal code > 1 xuxul
```

While scanning a span interior, `#` immediately before a closer or close-all is the editorial mark; `|` is close-all. Number words still use `#` for ordinals ([numbers.md](numbers.md)). That `#` is a span closer only when it sits immediately before `]` / `}` / `)` / `>` / `|`.

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

**3.** *Uhubun said “hi” (happily)*, then pop every open span at once.

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
*Ululon said “code > 1.”* (opaque blob; spoken close, because writing `<>` would take the first `>` as closer)
:::

<a id="xl<spa>n-markers"></a>

## See also

- Join scope islands: [coordination.md](coordination.md#join-scope-islands-rules)
- Identity vs parenthetical comment: [predication.md](predication.md#identity)
- Phrasal proper names: [reference-suffix.md](reference-suffix.md#phrasal-proper-names)
- Native office handles: [reference-suffix.md](reference-suffix.md#named-handles)
- Prefix-less citation outside a clause: [core.md § Outside a sentence](core.md#citation-forms)

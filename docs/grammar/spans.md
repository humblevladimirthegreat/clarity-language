# Spans

When you set wording apart from the rest of the sentence (a quote, a parenthetical, a loan surface), Agalan packages that chunk in a **span fence**. In writing you put a role letter, then a pair of brackets around the interior. That first letter is the chunk’s role in the outer sentence (subject, object, verb, or adverb).

## Beginner
<a id="beginner"></a>

Start with a quote of what someone said.

### Cite (`[…]`)
<a id="writing"></a>
<a id="writing-vs-speech"></a>

A **cite** holds wording you are quoting: what someone said, a title string, or a proverb **as wording**. Write the role letter, then square brackets around the quoted text. (cue: `[…]` like quote marks)

Start with one quoted token as the object of *said*:

> `zazawan d[hi] vezehel.`
>
> z-Azawan | d-hi | v-tell
>
> "Azawan said “hi.”"

The whole `d[hi]` is the direct object (who or what is acted on). If the interior is Agalan words, those inner words still start with their own role letters.

### Exact, paraphrase, proper
<a id="when-required"></a>

You can mark how faithful the quote is. Put the mark **after** the role letter, before the opening bracket.

Verbatim wording is **exact**: no extra mark (`d[hi]`). That is the same as ending **-l**, omitted in writing. When you mean the gist, not the exact words, write **`~`** (`d~[hi]`), the same as **-m**. When the chunk is a titled designation of that wording, write **`@`** (`d@[Hamlet]`), the same as **-n**.

| Agalan | Use | English | Cue |
|--------|-----|---------|-----|
| *(none)* | exact (**-l**) | verbatim wording | **-l** stand behind the words |
| **`~`** | paraphrase (**-m**) | the gist, not the exact words | **~** / **-m** leaves the hold open |
| **`@`** | proper (**-n**) | titled designation of that wording | **@** / **-n** names the chunk |

> `zululon d~[hi] vuwurul.`
>
> z-Ululon | d-hi | v-write
>
> "Ululon wrote something like “hi.”"

> `zuhubun d@[Hamlet] vuzunul.`
>
> z-Uhubun | d-Hamlet | v-sing
>
> "Uhubun sang “Hamlet.”"

### Resume (`[=]`)

To point back at a prior span without repeating its interior, put **`=`** inside the same brackets: `d[=]`. That form uses resume **-r**. The letter on the resume is the role this pointer plays in *this* sentence (here still the object of *said*).

> `jol zululon d[=] vezehel.`
>
> j-question | z-Ululon | d-←cite | v-tell
>
> "Ululon said that?!"

### Mention (`{…}`)

A **mention** holds the **word or form itself** (*the word “dog”*), not a quote of speech. Write the role letter, then curly braces around that form.

> `z{odogo} gelulul.`
>
> z-{dog} | g-blue
>
> "The word “dog” is blue."

With **`@`** / **-n**, mention is *the title X* / *the proverb X* as a **named unit**: `d@{Hamlet}`.

**Compare with:** quoting the title as wording uses cite (`d@[Hamlet]` *sang “Hamlet”*). Mention `d@{Hamlet}` is the titled unit, not the sung wording.

### Opaque and loan words
<a id="loans"></a>

**Opaque** holds a foreign, code, or raw surface that is not ordinary Agalan words. Write the role letter, then angle brackets around that blob. Write no ending after `>`:

> <code>zazawan d&lt;sushi&gt; vejel.</code>
>
> z-Azawan | <code>d-&lt;sushi&gt;</code> | v-see
>
> "Azawan saw sushi." (opaque surface)

Keep the source’s **casing** inside `<>` when that writing system uses case (<code>d&lt;NaCl&gt;</code>, <code>d&lt;iPhone&gt;</code>). Native Agalan letters stay [lowercase](phonology.md#beginner).

A **compact foreign content word** takes an ending after `>`: <code>d&lt;sushi&gt;l</code>, <code>z&lt;Sam&gt;n</code>. Same casing rule inside. That is one ordinary word whose root is foreign, not a span.

**Compare with:** use opaque <code>d&lt;sushi&gt;</code> when the foreign **surface** is the point. Use <code>d&lt;sushi&gt;l</code> when sushi is an ordinary object in the sentence.

When a published Agalan root already matches, write the ordinary word (`dagadal`, not a fence).

Outside a clause, a name or word uses prefix-less **root + ending**: [citation forms](reference-suffix.md#citation-forms) (<code>&lt;Sam&gt;n</code>). A span still takes a role letter, because it fills a sentence slot.

### Asides (`h(…)`)
<a id="asides"></a>

An **aside** is a parenthetical comment. Package it as an **adverb**: write **`h(`** … **`)`**. Round parentheses mark the side comment. The fence may sit anywhere an adverb may sit.

The interior is ordinary Agalan: a fragment, or a clause body that keeps the **same speech act** as the outer sentence (the same statement, question, or command).

> `zazawan vawalal h(huzumum).`
>
> z-Azawan | v-walk | h-happy
>
> "Azawan walks (happily)."

> `zazawan vawalal h(zululon velebel).`
>
> z-Azawan | v-walk | h- | z-Ululon | v-sleep
>
> "Azawan walks (Ululon sleeps)."

A one-word manner with nothing to package is a plain adverb: `zazawan vawalal huzumum.`

**For *because* / *if*, use:** [**`adoro`**](core.md#dependent-clauses) dependents, not an aside.

**Compare with:** a second name for the same person uses [identity](predication.md#identity) (`gonunu` + `/b/`), not an aside.

### Outer slot
<a id="pos"></a>

The letter on the open is the role of the **entire span** in the outer sentence. Ask what that chunk is doing out there: object of *said*, subject of *is blue*, and so on. A cite can be the **verb** when you echo the act as wording:

> `jul zululon v[oops].`
>
> j-prohibition | z-Ululon | v-oops
>
> "Don’t “oops,” Ululon."

| Agalan | Use | English | Cue |
|--------|-----|---------|-----|
| `/d/` | object | *said / wrote / saw “…”* (`d[hi]`, `d[=]`, <code>d&lt;sushi&gt;</code>) | **d** ≈ done to |
| `/z/` | subject | the wording or form **is** the subject (`z{odogo}`) | **z** ≈ star (who it is about) |
| `/v/` | verb | echo the act as wording (`v[oops]`) | **v** as in English *verb* |
| `/h/` | adverb | asides (`h(…)`) | **h** starts *how* / *when* / *where* |

If the interior is Agalan words, those inner words still start with **their** role letters.

### Translation practice
<a id="translation-practice"></a>

Short drills for Beginner. Try each item before opening **Show answer**.

**Roots used here:**

| English | Agalan | Same root as |
|---------|--------|--------------|
| *Azawan* | `azawan` | |
| *Ululon* | `ululon` | |
| *Uhubun* | `uhubun` | |
| *tell* | `vezehel` | `ezehel` *speech* |
| *write* | `uwurul` | |
| *see* | `vejel` | `ejel` *eye* |
| *sing* | `uzunul` | |
| *walk* | `awalal` | |
| *sleep* | `elebel` | |
| *happy* | `huzumum` | `uzumul` *smile* |
| *dog* | `odogol` | |
| *book* | `abogol` | |
| *blue* | `elulul` | |

#### English → Agalan

**1.** *Ululon said “hi.”*

::: details Show answer
`zululon d[hi] vezehel.`
:::

**2.** *Azawan wrote something like “hi.”*

::: details Show answer
`zazawan d~[hi] vuwurul.`
:::

**3.** *Uhubun sang “Hamlet.”* (title as wording)

::: details Show answer
`zuhubun d@[Hamlet] vuzunul.`
:::

**4.** *Azawan saw sushi.* (ordinary loan object)

::: details Show answer
<code>zazawan d&lt;sushi&gt;l vejel.</code>
:::

**5.** *The word “dog” is blue.*

::: details Show answer
`z{odogo} gelulul.`
:::

**6.** *Don’t “oops,” Ululon.*

::: details Show answer
`jul zululon v[oops].`
:::

**7.** *Uhubun said that.* (resume the prior cite)

::: details Show answer
`zuhubun d[=] vezehel.`
:::

**8.** *Azawan walks (happily).*

::: details Show answer
`zazawan vawalal h(huzumum).`
:::

#### Agalan → English

**1.** <code>zululon d&lt;sushi&gt; vejel.</code>

::: details Show answer
*Ululon saw sushi.* (opaque surface)
:::

**2.** `zazawan d{abogo} vezehel.`

::: details Show answer
*Azawan said the word “book.”*
:::

**3.** `zuhubun d@{Hamlet} vuwurul.`

::: details Show answer
*Uhubun wrote the title Hamlet.*
:::

**4.** `jol zululon d[=] vezehel.`

::: details Show answer
*Ululon said that?!*
:::

**5.** `z{abogo} gelulul.`

::: details Show answer
*The word “book” is blue.*
:::

**6.** <code>z&lt;Sam&gt;n d[hi] vezehel.</code>

::: details Show answer
*Sam said “hi.”*
:::

**7.** <code>&lt;Sam&gt;n</code>

::: details Show answer
*Sam*
:::

**8.** `zululon velebel h(zazawan vawalal).`

::: details Show answer
*Ululon sleeps (Azawan walks).*
:::

## Intermediate
<a id="intermediate"></a>

### Spoken word shape
<a id="shape"></a>

Beginner writing already packages a quote, mention, aside, or blob in brackets. Speech still has to say which slot the chunk fills, what kind of span it is, how far the open runs, and how faithful the wording is. The open is one word: role letter, then TYPE vowel, then mid-word **`x`**, then EDGE vowel, then the ending. That word stands where writing had `d[` or `h(`; a multi-token open still needs a close word later.

> `zazawan daxol hi vezehel.`
>
> z-Azawan | d-cite.atomic | hi | v-tell
>
> "Azawan said “hi.”"

```text
{PoS}{TYPE}x{EDGE}{ENDING}
```

| Piece | Values | Use |
|-------|--------|-----|
| **PoS** | `z` `d` `b` `v` `g` `w` `h` `j` `x` | slot the whole span fills |
| **TYPE** | **a** cite · **e** aside · **o** mention · **u** opaque | span kind |
| **`x`** | mid-word joiner | marks a span-fence form |
| **EDGE** | **a** · **e** · **o** · **u** | how far an open runs |
| **ENDING** | **-l** exact · **-m** paraphrase · **-n** proper · **-r** resume | fidelity, titled designation, or span resume |

**`daxal`** is `d` + `a` + `x` + `a` + `l`: open an exact multi-token cite as direct object (needs close).

### TYPE (vowels)
<a id="type"></a>
<a id="vowels"></a>

Beginner already used square, round, curly, and angle brackets for cite, aside, mention, and opaque. Speech puts that choice in the vowel **before** `x`.

| Agalan | Use | English | Cue |
|--------|------|---------|-----|
| **a** | **cite** (`[` … `]`); clausal interiors: outer speaker does **not** assert | quoted wording | **a** ≈ add (hold cited words) |
| **e** | **aside** (`h(` … `)`); `/h/` digression; outer speaker **does** assert; interior may be a fragment or a same-speech-act clause body | parenthetical | **e** ≈ order (a side instruction) |
| **o** | **mention** (`{` … `}`); with **-n**, named unit | the word or form itself | **o** ≈ one (the form as one object) |
| **u** | **opaque** (`<` … `>`); interior is not native Agalan | foreign / code / raw blob | **u** ≈ undo (not native Agalan) |

**Compare with:** a native office name uses ordinary **-n** (`zabogon`) — [named handles](reference-suffix.md#named-handles). Mention `{abogo}` is that **form**; opaque / loan is a **foreign** acronym’s surface (<code>z&lt;FBI&gt;n</code>).

### EDGE (extent)
<a id="edge"></a>

A pair of brackets can wrap one token or many, run to the end of the clause, or hold nothing. In speech, the vowel **after** `x` is **EDGE**: it says whether the open waits for an explicit close, ends at the next turn or clause join, takes exactly one following token, or has no interior.

> `zululon daxal hi zazawan xuxul vezehel.`
>
> z-Ululon | d-cite.multi | hi | z-Azawan | x-close | v-tell
>
> "Ululon said “hi Azawan.”"

| Agalan | Use | English | Cue |
|--------|-----|---------|-----|
| **a** | **multi-token open** — stays open until an explicit close (default) | `d[…]` … `]` (needs close) | **a** ≈ add (push more tokens) |
| **e** | **clause-scoped** — ends before the next speech-act `/j/` or clause-level `/x/` join | `d[…` run to clause end (no close) | **e** ≈ order (this clause only) |
| **o** | **atomic** — exactly **one** following token | `d[uzunu]`, <code>d&lt;sushi&gt;</code> | **o** ≈ one |
| **u** | **empty / redacted** — no interior; also **resume** **-r** | `d[]`, `d[=]` | **u** ≈ undo (nothing inside) |

Resume **-r** always uses EDGE **`u`** (`daxur`).

EDGE **`a`** / **`e`** / **`o`** take **-l** / **-m** / **-n**. EDGE **`u`** takes exact **-l** (`daxul`) or resume **-r** (`daxur`).

### Endings on opens and span pronouns
<a id="endings"></a>

Beginner already used a bare open, **`~`**, **`@`**, and **`[=]`**. Speech puts the same jobs on **-l** / **-m** / **-n** / **-r**.

| Agalan | Use | English | Cue |
|--------|---------|---------|-----|
| **-l** | **exact** — verbatim / precise surface | bare open (no `@` / `~`) | **-l** stand behind the wording |
| **-m** | **paraphrase** — gist / non-verbatim rendering | **`~`** after the role letter (`d~[…]`) | **-m** leaves the hold open |
| **-n** | **proper** — titled / conventional designation of the **whole span** | **`@`** after the role letter (`d@[…]`) | **-n** names the chunk |
| **-r** | **resume** — the **most recent span of this TYPE**; PoS = role **now** | `d[=]`, `h(=)`, `z{=}`, … | **-r** points back |

Hedged proper (`@~`) is written **`d@[…]`** only (spoken as the **proper** open with uncertain tone). **`@`** / **`~`** do not combine with resume **-r**.

**-r** resumes a prior span ([pronouns.md](pronouns.md)). `daxur` is *that (cite)* as object, matching the most recent **cite** (TYPE **a**). `hexur` / `h(=)` is *that (aside)*. The resume’s role letter need not match the earlier open’s (`zaxur` = that cite as subject). No interior; no close (EDGE **`u`**).

### Writing ↔ speech map

Beginner brackets map to these spoken opens and closes.

| Writing | Speech (object slot) | Notes |
|---------|----------------------|-------|
| `d[…]` | `daxal` … `xuxul` | exact multi-token cite (EDGE **a**); matching close |
| `d~[…]` | `daxam` … `xuxul` | paraphrased multi-token cite |
| `d@[…]` | `daxan` … `xuxul` | proper multi-token cite; also spelling of hedged proper |
| `d{…}` / `d~{…}` / `d@{…}` | `doxal` / `doxam` / `doxan` … `xuxul` | mention |
| `h(…)` / `h~(…)` / `h@(…)` | `hexal` / `hexam` / `hexan` … `xuxul` | aside (open PoS is `/h/`) |
| `h(huzumum)` | `hexol huzumum` | atomic aside |
| `h(=)` | `hexur` | aside resume |
| `d<…>` / `d~<…>` / `d@<…>` | `duxal` / `duxam` / `duxan` … `xuxul` | opaque |
| `d[hi]` | `daxol hi` | atomic (EDGE **o**) |
| `d@[Hamlet]` | `daxon Hamlet` | atomic proper cite |
| `d[…` … (to clause end) | `daxel` … | clause-scoped (EDGE **e**) |
| `d[]` | `daxul` | empty / redacted (EDGE **u**) |
| `d[=]` | `daxur` | resume (EDGE **u**) |

The close does not repeat PoS, TYPE, EDGE, or open fidelity. Explicit close for EDGE **a** is **`xuxul`**.

### Nesting
<a id="nesting"></a>

When one packaged chunk sits inside another (a quote that contains a parenthetical, or a cite wrapping a mention), each typed fence nests. A multi-token open starts a layer; **`xuxul`** closes the innermost layer. Atomic opens and resumes do not start a new layer. **`@`** / **`~`** apply only to the immediately following open.

> `zazawan d[ h(huzumum) hi ] vezehel.`
>
> z-Azawan | d-cite | h-aside | h-happy | hi | v-tell
>
> "Azawan said “hi” (happily)."

The same nest works as `d[ z{…} ]` or `d~[ d<…> ]`.

### Scope islands
<a id="scope-islands"></a>

Sometimes *maybe* or a join should apply only to a multi-word chunk, not the whole clause. Writing marks that chunk with **`^ … ^`**. Speech has no open or close word for those edges: you hear a pause and one tight phrase. The binder **inside** does the work.

> <code>zazawan ^ h&lt;maybe&gt;l zodogol garedel ^ vejel.</code>
>
> z-Azawan | ^ | h-maybe | z-dog | g-red | ^ | v-see
>
> "Azawan saw maybe the red dog." (*maybe* targets that chunk).

**Compare with:** quoting, asides, mentions, and opaque blobs use typed [span fences](#writing) (`d[…]`, `h(…)`). Islands only group so a binder inside can target that chunk.

- No role letter on the edges.
- **One island per clause.** Islands do not nest.
- Empty `^^` has no reading.
- **Binder required:** at least one scope-taking `/h/` and/or a [join](joins.md#scope-islands-join) particle **inside**.
- Prefer spaces inside: <code>^ h&lt;maybe&gt;l zodogol garedel ^</code>.

| Binder | Use inside the island |
|--------|------------------------|
| Scope-taking **`/h/`** | frames that **chunk** (prefer first in the island) |
| Prefixed **join** | joins **only** matching-role material **inside** — [scope islands](joins.md#scope-islands-join) |

`/h/` and a join may share one island (<code>^ h&lt;maybe&gt;l zazawan zululon zam ^</code>).

| Placement | Reading |
|-----------|---------|
| `/h/` **inside** | frames that chunk |
| `/h/` **outside** | ordinary floating adverb: frames the verb / clause |
| Join **inside** | joins only interior conjuncts |
| Join **outside** with island nearby | ordinary lookback (edges do not filter an outside join) |

> `zazawan ^ zululon zal ^ zam vejel.`
>
> z-Azawan | ^ | z-Ululon | z-and | ^ | z-and.open | v-see
>
> "Azawan and (just Ululon) saw …."

**Speech:** brief reset into the island, one tight phrase, boundary on the last island stress. In singing, use an ordinary phrase bow.

### Translation practice
<a id="translation-practice-intermediate"></a>

Short drills for Intermediate. Try each item before opening **Show answer**.

**Roots used here:**

| English | Agalan | Same root as |
|---------|--------|--------------|
| *Azawan* | `azawan` | |
| *Ululon* | `ululon` | |
| *Uhubun* | `uhubun` | |
| *tell* | `vezehel` | `ezehel` *speech* |
| *sing* | `uzunul` | |
| *see* | `vejel` | `ejel` *eye* |
| *run* | `urunul` | |
| *walk* | `awalal` | |
| *dog* | `odogol` | |
| *red* | `aredel` | |
| *book* | `abogol` | |
| *Abogon* | `abogon` | |
| *blue* | `elulul` | |
| *happy* | `huzumum` | `uzumul` *smile* |

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

**5.** *Ululon saw sushi.* (spoken atomic opaque)

::: details Show answer
`zululon duxol sushi vejel.`
:::

**6.** *Azawan said “hi” (happily).* (cite nesting an aside)

::: details Show answer
`zazawan d[ h(huzumum) hi ] vezehel.`
:::

**7.** *Azawan saw maybe the red dog.* (*maybe* targets that chunk)

::: details Show answer
<code>zazawan ^ h&lt;maybe&gt;l zodogol garedel ^ vejel.</code>
:::

**8.** *Uhubun and (just a dog) ran.*

::: details Show answer
`zuhubun ^ zodogol zal ^ zam vurunul.`
:::

#### Agalan → English

**1.** `zululon daxel hi.`

::: details Show answer
*Ululon said “hi.”*
:::

**2.** `zazawan daxam hi zululon xuxul vezehel.`

::: details Show answer
*Azawan said something like “hi Ululon.”*
:::

**3.** `zaxur gelulul.`

::: details Show answer
*That (cite) is blue.*
:::

**4.** `zuhubun daxon Hamlet vuzunul.`

::: details Show answer
*Uhubun sang “Hamlet.”*
:::

**5.** `zazawan vawalal hexol huzumum.`

::: details Show answer
*Azawan walks (happily).*
:::

**6.** `zazawan d[ z{abogo} ] vezehel.`

::: details Show answer
*Azawan said the word “book.”*
:::

**7.** <code>zululon ^ h&lt;maybe&gt;l zodogol garedel ^ vejel.</code>

::: details Show answer
*Ululon saw maybe the red dog.*
:::

**8.** `zabogon gelulul.`

::: details Show answer
*Abogon is blue.*
:::

## Advanced
<a id="advanced"></a>

### Close forms (complete / editorial / close-all)

You already close a multi-token span with **`xuxul`**, the spoken match for `]` / `}` / `)` / `>`. Two more close words: **`xuxur`** keeps the wording as written but marks that the span is cut off, trails off, or is defective; **`xuxum`** closes every still-open span at once.

> `zazawan daxal hi xuxur vezehel.`
>
> z-Azawan | d-cite.multi | hi | x-close.editorial | v-tell
>
> "Azawan said “hi…”"

| Agalan | Use | English | Cue |
|--------|-----|---------|-----|
| **`xuxul`** | close **one** span, whole | matching closer `]` / `}` / `)` / `>` | **-l** exact: the span closes whole |
| **`xuxur`** | close **one** — **editorial** (wording kept as written: cut off, trail off, or defect noted) | `#]` / `#}` / `#)` / `#>` | **-r** resume: the wording stops short; resume may pick up |
| **`xuxum`** | close **all** open spans | optional close-all mark `\|` | **-m** soft: sweep everything |
| **`xuxur`** + **`xuxum`** | editorial innermost, then close all | `#\|` | |

```text
xuxul  =  x + u + x + u + l
xuxur  =  x + u + x + u + r
xuxum  =  x + u + x + u + m
```

An editorial span still counts as said: resume (`d[=]` / `daxur`) may point back to it. Combined `#\|` is two spoken closes in writing; write editorial first, then close-all. Bare `xuxur` closes one (editorial).

**Not the same job as:** a negating clause join (`xul` / `xum`). Empty or resumed **cite opens** are `/d/` (`daxul` redacted; `daxur` that cite). Closes are **`xuxul`** / **`xuxur`**.

| Writing | Speech | Notes |
|---------|--------|-------|
| `d[…#]` | `daxal` … `xuxur` | editorial close |
| `d[…#\|]` | `daxal` … `xuxur xuxum` | editorial + close-all |

For a cut-off cite, use EDGE **`a`** + **`xuxur`**. EDGE **`e`** already ends at the clause with a whole close.

### Spoken inventory
<a id="inventory"></a>

The rest of the spoken open map (PoS shown as `…`; EDGE **a** unless noted).

| TYPE | exact multi **-l** | paraphrase **-m** | proper **-n** | resume **-r** (EDGE **u**) |
|------|--------------------|-------------------|---------------|------------------------------|
| cite **a** | `…axal` | `…axam` | `…axan` | `…axur` |
| aside **e** | `hexal` | `hexam` | `hexan` | `hexur` |
| mention **o** | `…oxal` | `…oxam` | `…oxan` | `…oxur` |
| opaque **u** | `…uxal` | `…uxam` | `…uxan` | `…uxur` |

Atomic (EDGE **o**): `…axol` / `…axom` / `…axon` (cite examples); aside atomic **`hexol`**. Clause-scoped (EDGE **e**): `…axel` / `…axem` / `…axen`. Empty exact (EDGE **u**): `…axul` / `hexul` / `…oxul` / `…uxul`. Aside **opens** use `/h/`; resume may recast the aside into another slot (`dexur`).

| Form | Use |
|------|-----|
| `xuxul` | close one — whole |
| `xuxur` | close one — editorial |
| `xuxum` | close all |
| `xuxur xuxum` | editorial + close all (writing `#\|`) |

### Literal content (fence words / fence marks)
<a id="literal-content"></a>
<a id="escape"></a>

When a span-marker word or a fence glyph (`[` / `]` / `{` / `}` / `(` / `)` / `<` / `>` / `=` / `|` / `#` / `^`) must appear **as content**, wrap that token in **atomic opaque**. Writing and speech use the same vehicle. The outer span’s wording is the opaque **interior** (the wrapper is packaging, not extra cited words).

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

`d[ item d<#> ]` is a whole cite whose last content character is `#` (a bare `#]` would be editorial close). A hyphen before a closer is ordinary content.

Writing opaque `d<…>` closes on the first `>`. If the blob **contains** `>`, use the spoken opaque (EDGE **a** + **`xuxul`**):

```text
duxal code > 1 xuxul
```

**For *ordinals*, use:** [number words](numbers.md) with `#`. Inside a span, `#` is an editorial closer only when it sits immediately before `]` / `}` / `)` / `>` / `|`. `|` is close-all.

### Translation practice
<a id="translation-practice-advanced"></a>

Short drills for Advanced. Try each item before opening **Show answer**.

**Roots used here:**

| English | Agalan | Same root as |
|---------|--------|--------------|
| *Azawan* | `azawan` | |
| *Ululon* | `ululon` | |
| *Uhubun* | `uhubun` | |
| *tell* | `vezehel` | `ezehel` *speech* |
| *happy* | `huzumum` | `uzumul` *smile* |

#### English → Agalan

**1.** *Ululon said “hi…”* (the cite trails off)

::: details Show answer
`zululon daxal hi xuxur vezehel.`
:::

**2.** *Uhubun said “hi.”* (complete close of one span)

::: details Show answer
`zuhubun daxal hi xuxul vezehel.`
:::

**3.** *Azawan said “hi” (happily), then close every open span at once.*

::: details Show answer
`zazawan daxal hexol huzumum hi xuxum vezehel.`
:::

**4.** *Azawan said “he typed ] then left.”*

::: details Show answer
<code>zazawan d[ he typed d&lt;]&gt; then left ] vezehel.</code>
:::

**5.** *Uhubun said “code > 1.”* (spoken opaque, because a writing `<>` would close on the first `>`)

::: details Show answer
`zuhubun duxal code > 1 xuxul vezehel.`
:::

#### Agalan → English

**1.** `zazawan d[hi#] vezehel.`

::: details Show answer
*Azawan said “hi…”*
:::

**2.** `zululon daxal hi xuxur xuxum vezehel.`

::: details Show answer
*Ululon said “hi…”*
:::

**3.** `zazawan daxal duxol xuxul xuxul vezehel.`

::: details Show answer
*Azawan said the word “xuxul.”*
:::

**4.** <code>zululon d[ item d&lt;#&gt; ] vezehel.</code>

::: details Show answer
*Ululon said “item #.”*
:::

**5.** `zuhubun d[hi#|] vezehel.`

::: details Show answer
*Uhubun said “hi…”*
:::

## See also

- Scope islands: [joins.md](joins.md#scope-islands-join)
- Identity vs parenthetical comment: [predication.md](predication.md#identity)
- Phrasal proper names: [reference-suffix.md](reference-suffix.md#phrasal-proper-names)
- Native office handles: [reference-suffix.md](reference-suffix.md#named-handles)
- Prefix-less citation outside a clause: [reference-suffix.md](reference-suffix.md#citation-forms)

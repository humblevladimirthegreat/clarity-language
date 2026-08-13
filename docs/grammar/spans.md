# Spans

Package wording (cite / aside / mention / opaque) with a PoS, TYPE, EDGE, and ending — brackets in writing, open / close words in speech. Multi-word binder scope uses **`^ … ^`** (not typed wording).

## Beginner
<a id="beginner"></a>

### Writing vs speech
<a id="writing-vs-speech"></a>

| Channel | Form |
|---------|------|
| **Writing (preferred)** | **PoS letter** + optional **`@`** / **`~`** + brackets — type from bracket shape; marks sit **after** the PoS (`d@[…]`, `d~[…]`); anaphor uses interior **`=`** (`d[=]`) |
| **Speech** | full **open** `{PoS}{TYPE}x{EDGE}{ENDING}`; full **close** when a multi-token open needs an explicit close |

Same split as number shorthand (`g+3` written, full CV spoken). Prefer brackets in ordinary text when a bracket form exists.

### Writing fences
<a id="writing"></a>

| Brackets | Span type |
|----------|-----------|
| `[` … `]` | **cite** — attributed speech / cited wording (including title strings and proverbs cited as wording) |
| `{` … `}` | **mention** — the word or form itself (*the word X*); with **-n**, *the saying / proverb / title X* as a named unit |
| `(` … `)` | **aside** — parenthetical digression; still asserted |
| `<` … `>` | **opaque** — foreign, code, raw orthography; **do not** parse interior as Agelan |

**PoS:** write the PoS letter immediately before any **`@`** / **`~`** marks and the opening bracket (`d[…]`, `z{…}`, `h(…)`, `d<…>`).

| Mark | Job |
|------|-----|
| *(none)* | **exact** (**-l**) |
| **`~`** | **paraphrase** (**-m**) — `d~[…]` |
| **`@`** | **proper** (**-n**) — `d@[…]` |

Anaphor (**-r**): interior **`=`** (`d[=]`, `d{=}`, `d(=)`, `d<=>`).

```
`z<he>n d[hi] v<said>l.`

gloss: `z-he` · `d-[hi]` · `v-said`

*He said “hi.”* (atomic object cite)
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
- mid-sentence parenthetical digression (**aside** — prefer PoS `/h/`; must not use floating `/j/`)
- talking about the word or form itself, or *the saying / title X* as a named unit (**mention**; prefer **`@`** / **-n** for the named-unit reading)
- foreign, code, or other surface the parser must **not** read as Agelan (**opaque**)
- referring back to a prior span (**anaphor** **-r** / `…[=]`)

Prefer **atomic** one-token forms for a single cited / mentioned / opaque token (`d[hi]`, `d<sushi>`). Prefer a nativized ordinary word when the surface wording is not the point.

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
| `/d/` | Default cite object — *said / wrote “…”* | `d[hi]`, `d[=]` |
| `/z/` | The wording or title **is** the subject | `z@[Hamlet]`, `z[=]` |
| `/b/` | Host needs a `/b/` argument — *about “…”*, *called “…”* | `b{…}`, `b[=]` |
| `/v/` | Span **is** the verb (phrase) — echo / report the act as wording | `v[oops]`, `v[=]` |
| `/ɡ/` | Property **is** the spanned string — *so-called “ready”* | `g@[Draft]` |
| `/h/` | Manner cite; **asides** prefer this so digressions float like other adverbs | `h(…)`, `h~(…)` |
| `/j/` | Vocative / expressive edge with a spanned call | `j@[…]` |
| `/x/` | Discourse-only citation (epigraph, freestanding span) | `x[…]` |

TYPE and EDGE are independent of PoS (`h` + **a** is still **cite** as manner). Prefer `/h/` for asides — a **PoS preference**, not a TYPE override.

```
`jul z<you>n v[oops] d<me>l.`

gloss: `j-command` · `z-you` · `v-[oops]` · `d-me`

*Don’t “oops” me.*
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
| **That (prior span) again** | span anaphor — `daxur` / `duxur` / … |
| **Name / word citation outside a clause** | prefix-less **root + ending** — [citation forms](core.md#citation-forms) (`umogon.`, `<Sam>n`) — not a span |

**Trap:** `d<sushi>` is a span open + interior blob; `d<sushi>l` is one content word whose root is foreign. Do not put **-l** / **-m** / **-n** / **-r** after an opaque closer. Spans need a PoS because they fill a **clause** slot; freestanding citation drops the role letter instead.

## Intermediate
<a id="intermediate"></a>

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

**Parser cue:** after PoS, material before the first `x` is exactly one TYPE vowel, and after `x` exactly one EDGE vowel + ending. Longer material before `x` is a different compound family.

### TYPE (vowels)
<a id="type"></a>
<a id="vowels"></a>

Only **a** / **e** / **o** / **u** on TYPE. No stacked vowels on TYPE.

**Mnemonic:** vowels track the [join series](coordination.md#join-type-vowel-series) loosely — **a** additive → cite; **e** rank → aside; **o** choice → mention; **u** negation → opaque. The job is **span packaging**, not revision or set/rank join.

| TYPE | Role | Writing |
|------|------|---------|
| **a** | **cite** — cited wording; clausal interiors: outer speaker does **not** assert | `[` … `]` |
| **e** | **aside** — digression; outer speaker **does** assert | `(` … `)` |
| **o** | **mention** — the word or form as object; with **-n**, named unit | `{` … `}` |
| **u** | **opaque** — foreign / code / raw blob; parser **skips** interior | `<` … `>` |

Scare / ironic *“so-called”* distance is not a separate TYPE; use ordinary lexicon attitude if needed.

### EDGE (extent)
<a id="edge"></a>

The vowel **after** `x` is **EDGE** — how far the open runs. It is **not** a second TYPE.

| EDGE | Job | Needs close? | Typical writing |
|------|-----|--------------|-----------------|
| **a** | **Multi-token open** — push a stack frame until explicit close (default) | yes | `d[…]` … `]` |
| **e** | **Clause-scoped** — auto-pop before the next clause-force `/j/` or clause-level `/x/` join (**complete**) | no (auto) | `d[…` run to clause end |
| **o** | **Atomic** — exactly **one** following token | no | `d[hi]`, `d<sushi>` |
| **u** | **Empty / redacted** — no interior; also **anaphor** **-r** | no | `d[]`, `d[=]` |

**Anaphor `-r`** always uses EDGE **`u`** in the spoken template (`daxur`). Other EDGE + **-r** combinations are undefined.

EDGE **`a`** / **`e`** / **`o`** take **-l** / **-m** / **-n**. EDGE **`u`** takes exact **-l** (`daxul`) or anaphor **-r** (`daxur`); paraphrase-empty and proper-empty are unused.

### Endings on opens and span pronouns
<a id="endings"></a>

| Ending | Meaning | Preferred writing |
|--------|---------|-------------------|
| **-l** | **exact** — verbatim / precise surface | bare open (no `@` / `~`) |
| **-m** | **paraphrase** — gist / non-verbatim rendering | **`~`** after PoS (`d~[…]`) |
| **-n** | **proper** — titled / conventional designation of the **whole span** | **`@`** after PoS (`d@[…]`) |
| **-r** | **anaphor** — pronoun for the **most recent span of this TYPE**; PoS = role **now** | `d[=]`, `z{=}`, … |

**-n** is not one-token scope (that is EDGE **o**). A proper span may be multi, clause-scoped, or atomic. Hedged proper (`@~`) is written **`d@[…]`** only (spoken as the **proper** open with uncertain tonality). **`@`** / **`~`** do not combine with anaphor **-r**.

**-r** is ordinary [anaphora](pronouns.md), not “resume citing.” `daxur` = *that (cite)* as object — matching the most recent **cite** (TYPE **a**). The pronoun’s PoS need not match the antecedent open’s PoS (`zaxur` = that cite as subject). No interior; no close (EDGE **`u`**).

Named entities *inside* a cite / mention / aside still take ordinary PoS + **-n** (`z<Sam>n`). Opaque interiors are not parsed as Agelan words.

### Writing ↔ speech map (core)

| Writing | Speech (object slot) | Notes |
|---------|----------------------|-------|
| `d[…]` | `daxal` … `xuxul` | exact multi-token cite (EDGE **a**); complete close |
| `d~[…]` | `daxam` … `xuxul` | paraphrased multi-token cite |
| `d@[…]` | `daxan` … `xuxul` | proper multi-token cite; also spelling of hedged proper |
| `d{…}` / `d~{…}` / `d@{…}` | `doxal` / `doxam` / `doxan` … `xuxul` | mention |
| `d(…)` / `d~(…)` / `d@(…)` | `dexal` / `dexam` / `dexan` … `xuxul` | aside |
| `d<…>` / `d~<…>` / `d@<…>` | `duxal` / `duxam` / `duxan` … `xuxul` | opaque |
| `d[hi]` | `daxol hi` | atomic (EDGE **o**) |
| `d@[Hamlet]` | `daxon Hamlet` | atomic proper cite |
| `d[…` … (to clause end) | `daxel` … | clause-scoped (EDGE **e**) |
| `d[]` | `daxul` | empty / redacted (EDGE **u**) |
| `d[=]` | `daxur` | anaphor (EDGE **u**) |

Close does not repeat PoS, TYPE, EDGE, or open fidelity. Explicit close for EDGE **a**: **`xuxul`** (complete) — Intermediate trunc/sic/close-all live in Advanced.

### Nesting
<a id="nesting"></a>

Typed span fences nest freely. Each multi-token open pushes; **`xuxul`** pops the innermost (complete). Atomic and anaphor do not nest-push. **Adjunct-scope islands** (`^ … ^`) do **not** nest — use a typed span when you need nested packaging.

Examples: `d[ h(…) ]`, `d[ z{…} ]`, `d~[ d<…> ]`. **`@`** / **`~`** apply only to the immediately following open.

### Adjunct-scope islands
<a id="adjunct-scope-islands"></a>
<a id="scope-islands"></a>

**Scope islands** mark a multi-word chunk so an **inside binder** can target that chunk. Writing **`^ … ^`**; speech is **prosody only** (no spoken open/close word). The edges carry **no meaning of their own**.

**Mnemonic:** edges = parentheses; binder = function.

```
`^ h<maybe>l zedejel zogodol ^ v<saw>l.`

gloss: `^` · `h-maybe` · `z-red` · `z-dog` · `^` · `v-saw`

*… saw maybe the red dog* — *maybe* targets that chunk.
```

**Rules:**

- No PoS on the edges (contrast `d[…]`, `h(…)`, `d<…>`).
- **One island per clause.** Do not nest islands.
- Empty `^^` is illegal.
- **Binder required:** at least one scope-taking `/h/` and/or a [join](coordination.md#join-scope-islands-rules) particle **inside**. Binderless `^ … ^` is illegal.
- Prefer spaces inside: `^ h<maybe>l zedejel zogodol ^`.

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

**Trap:** `jal h<maybe>l ^ zedejel zogodol ^ …` is illegal — island has no inside binder. Put the `/h/` inside.

| Need | Use instead |
|------|-------------|
| Nested packaging / wording fidelity / opaque | typed [span fences](#writing) |
| Whole-clause soft assert | **`jam`** — [clause force](core.md#clause-force) |
| Single-adjective frame | `/w/` on that `/ɡ/` |
| Join over only part of a same-slot stretch | put that join **inside** `^ … ^` |

## Advanced
<a id="advanced"></a>

### Close forms (complete / truncated / sic / close-all)

| Spoken | Job | Writing |
|--------|-----|---------|
| **`xuxul`** | pop **one** — **complete** | matching closer `]` / `}` / `)` / `>` |
| **`xuxur`** | pop **one** — **truncated** (cut off / trail off) | `-]` / `-}` / `-)` / `->` (ASCII hyphen + closer) |
| **`xuxun`** | pop **one** — **sic / editorial** (complete as-written, including defects) | `#]` / `#}` / `#)` / `#>` |
| **`xuxum`** | pop **all** open spans | optional close-all mark `\|` |
| **`xuxur`** + **`xuxum`** | truncated innermost, then pop all | `-\|` |
| **`xuxun`** + **`xuxum`** | sic innermost, then pop all | `#\|` |

```text
xuxul  =  x + u + x + u + l
xuxur  =  x + u + x + u + r
xuxun  =  x + u + x + u + n
xuxum  =  x + u + x + u + m
```

**Mnemonic:** close endings are not open exact/paraphrase/proper. Open **-n** = proper/titled span; close **-n** = sic. Open **-r** = span anaphor; close **-r** = truncated.

Truncated and sic spans **are committed** and enter anaphor history (`d[=]` / `daxur` may resume them). Combined `-\|` / `#\|` are writing-only shorthand for two spoken closes; bare `xuxur` / `xuxun` never means pop-all by themselves. Illegal: `\|-` / `\|#` (mark must precede close-all).

These forms are not clause joins (`xul` / `xum` = negation — different shape). They are not an empty cite under `/d/` (`daxul` = empty/redacted; `daxur` = that cite; `xuxul` = complete close; `xuxur` = truncated close).

| Writing | Speech | Notes |
|---------|--------|-------|
| `d[…-]` | `daxal` … `xuxur` | truncated close |
| `d[…#]` | `daxal` … `xuxun` | sic / editorial close |
| `d[…-\|]` | `daxal` … `xuxur xuxum` | truncated + close-all |
| `d[…#\|]` | `daxal` … `xuxun xuxum` | sic + close-all |

Prefer EDGE **`a`** + **`xuxur`** for cut-off cites; EDGE **`e`** auto-pop is **complete**, not truncated or sic.

### Spoken inventory
<a id="inventory"></a>

#### Opens and related (PoS shown as `…`; EDGE **a** unless noted)

| TYPE | exact multi **-l** | paraphrase **-m** | proper **-n** | anaphor **-r** (EDGE **u**) |
|------|--------------------|-------------------|---------------|------------------------------|
| cite **a** | `…axal` | `…axam` | `…axan` | `…axur` |
| aside **e** | `…exal` | `…exam` | `…exan` | `…exur` |
| mention **o** | `…oxal` | `…oxam` | `…oxan` | `…oxur` |
| opaque **u** | `…uxal` | `…uxam` | `…uxan` | `…uxur` |

Atomic (EDGE **o**): `…axol` / `…axom` / `…axon` (cite examples); same pattern on other TYPEs. Clause-scoped (EDGE **e**): `…axel` / `…axem` / `…axen`. Empty exact (EDGE **u**): `…axul` / `…exul` / `…oxul` / `…uxul`.

#### Closes

| Form | Job |
|------|-----|
| `xuxul` | pop one — complete |
| `xuxur` | pop one — truncated |
| `xuxun` | pop one — sic / editorial |
| `xuxum` | pop all |
| `xuxur xuxum` | truncated + pop all (writing `-\|`) |
| `xuxun xuxum` | sic + pop all (writing `#\|`) |

### Literal content (fence words / meta glyphs)
<a id="literal-content"></a>
<a id="escape"></a>

When a span-marker word (speech) or a raw bracket / `~` / `@` / `<` / `>` / `=` / `|` / `#` / hyphen-before-closer / scope-island `^` sequence (writing) must appear **as content** inside a span — not for ordinary nesting.

**Writing:** `\` before `[` / `]` / `{` / `}` / `(` / `)` / `<` / `>` / `~` / `@` / `|` / `#` / `=` / `^` / `-` (when the hyphen would form truncated close). Literal backslash: `\\`.

```text
d[ he typed \] then left ]
d<code \> 1>
d[ pipe \| here ]
d[ score\- ]
d[ item \# ]
```

`d[score\-]` is a **complete** cite whose interior ends in a hyphen. `d[item\#]` is a **complete** cite whose interior ends in `#` — not sic close `#]`.

**Speech:** there is no transparent speech escape. Bind the fence-shaped token as an **atomic opaque** so it is content, not an open/close:

```text
daxal duxol xuxul xuxul
```

Writing: `d[ d<xuxul> ]`.

While scanning a span interior, bare `|` / `#` / hyphen are ordinary content unless they form a special-close digraph with the following closer or close-all. Number words still use `#` for ordinals — [numbers.md](numbers.md) — that is not a span closer.

### Not this series
<a id="not-this"></a>

| Need | Use instead |
|------|-------------|
| Multi-word adjunct or join scope without typed wording | [adjunct-scope islands](#adjunct-scope-islands) **`^ … ^`** |
| Clause negation *no* / *not* | `xul` / `xum` / `xun` — **not** `xuxul` / `xuxum` / `xuxur` / `xuxun` |
| Em dash as truncated closer | ASCII hyphen + closer `-]` / `xuxur` |
| Inferring close-all from bare `xuxur` / `xuxun` | say `xuxur xuxum` / `xuxun xuxum`; writing may use `-\|` / `#\|` |
| Ordinary content anaphor (*that dog*) | content root + **-r** — [pronouns.md](pronouns.md) |
| Re-citing the same words as a fresh cite | new open, not **-r** |
| Literal fence word / meta glyph as content | [literal content](#literal-content) |

<a id="xl<spa>n-markers"></a>

## See also

- Join scope islands: [coordination.md](coordination.md#join-scope-islands-rules)
- Phrasal proper names (no span needed): [reference-suffix.md](reference-suffix.md#phrasal-proper-names)
- Prefix-less citation outside a clause: [core.md § Outside a sentence](core.md#citation-forms)

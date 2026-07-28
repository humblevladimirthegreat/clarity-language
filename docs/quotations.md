# Citations, mentions, asides, and opaque spans

This page is the source of truth for **span fences**: every **open** carries a **PoS**, a **TYPE**, an **EDGE** (extent), and an **ENDING**; **close** is a fixed discourse quartet (**`xuxul`** / **`xuxur`** / **`xuxun`** / **`xuxum`**). Preferred **bracket writing**, fidelity, extent, atomic spans, proper designation, and span anaphors. Discourse linkers and clause joins under `/x/` stay in [language-reference.md](language-reference.md#discourse-markers-x) and [coordination.md](coordination.md). Span fences use ordinary mid-word **`x`** (compound joiner) — [phonology.md](phonology.md#phonotactics). Parallel to [numbers](numbers.md): writing uses shorthand; speech is the full form.

<a id="writing-vs-speech"></a>

## Writing vs speech

| Channel | Form |
|---------|------|
| **Writing (preferred)** | **PoS letter** + optional **`@`** / **`~`** + brackets — type from bracket shape; marks sit **after** the PoS (`d@[…]`, `d~[…]`); anaphor uses interior **`=`** (`d[=]`, same glyph as [number **-r**](numbers.md#number-endings)); extent / atomic / empty from bracket shape (below). Do **not** write `daxal` / `xuxul` / … in ordinary text when a bracket form exists. |
| **Speech** | full **open** `{PoS}{TYPE}x{EDGE}{ENDING}`; full **close** **`xuxul`** (pop one, complete), **`xuxur`** (truncated), **`xuxun`** (sic / editorial), or **`xuxum`** (pop all) when a multi-token open needs an explicit close. |

Same split as number shorthand (`g+3` written, full CV spoken).

<a id="shape"></a>

## Word shape

### Open / pronoun

```text
{PoS}{TYPE}x{EDGE}{ENDING}
```

| Piece | Values | Job |
|-------|--------|-----|
| **PoS** | `z` `d` `b` `v` `g` `w` `h` `j` `x` | slot the **whole span** (or span anaphor) fills in the outer clause |
| **TYPE** | **a** cite · **e** aside · **o** mention · **u** opaque | span kind (matches bracket shape) |
| **`x`** | mid-word joiner | marks a span-fence form |
| **EDGE** | **a** · **e** · **o** · **u** | **extent** — how far an open runs ([EDGE](#edge)) |
| **ENDING** | **-l** exact · **-m** paraphrase · **-n** proper · **-r** anaphor | fidelity, titled designation, or span pronoun ([endings](#endings)) |

Example: **`daxal`** = `d` + `a` + `x` + `a` + `l` → **open exact multi-token cite as direct object** (needs close).

### Close (universal)

| Spoken | Job | Writing |
|--------|-----|---------|
| **`xuxul`** | pop **one** (innermost) — **complete** surface | matching closer `]` / `}` / `)` / `>` |
| **`xuxur`** | pop **one** (innermost) — **truncated** surface (cut off / trail off / incomplete) | ASCII hyphen + matching closer: `-]` / `-}` / `-)` / `->` (hyphen-minus `-`, not an em dash) |
| **`xuxun`** | pop **one** (innermost) — **sic / editorial**: complete surface kept **as-is** (odd spelling, broken grammar, non-normative form); outer speaker does **not** normalize | `#]` / `#}` / `#)` / `#>` |
| **`xuxum`** | pop **all** open spans | optional close-all mark `\|` (or matching closers for each open) |
| **`xuxur`** + **`xuxum`** | truncated innermost, then pop **all** remaining | writing shorthand `-\|` (mark before close-all); speech says both words |
| **`xuxun`** + **`xuxum`** | sic innermost, then pop **all** remaining | writing shorthand `#\|`; speech says both words |

```text
xuxul  =  x + u + x + u + l
xuxur  =  x + u + x + u + r
xuxun  =  x + u + x + u + n
xuxum  =  x + u + x + u + m
```

Close does **not** repeat PoS, TYPE, EDGE, or open fidelity. Open fidelity (**-l** / **-m** / **-n**) still applies to whatever interior is present. **`xuxur`** adds that the surface is **incomplete** (interrupted speech, trail-off, broken recording) — not paraphrase, not empty/redacted (`d[]`), not abort/scratch. **`xuxun`** adds an **editorial** frame: the wording is committed **verbatim including its defects** (*sic*) — not open proper **-n** (titled unit), not paraphrase **-m**. Truncated and sic spans **are committed** and enter anaphor history (`d[=]` / `daxar` may resume them).

**Combined writing `-\|` / `#\|`:** in closer position only — apply truncated or sic to the **innermost** open, then pop **all** remaining frames (those outer pops are plain complete). No new spoken stem: say **`xuxur xuxum`** / **`xuxun xuxum`**. Bare **`xuxur`** / **`xuxun`** in speech still means pop **one** only; do not make the listener infer close-all from ending alone. Writing may pack what speech spells as two closes (same channel split as brackets vs full opens). Illegal: `\|-` / `\|#` (mark must precede close-all).

These forms are **not** clause joins (`xul` / `xum` = negation — different shape). They are **not** an empty cite under `/d/` (`daxul` = empty/redacted object cite; `xuxul` = complete close). Truncated and sic closes are for writing (and careful speech) when incompleteness or *as-written* oddity is part of what you want to record; casual mid-utterance repair needs no special close.

Opens, empties, atomics, anaphors, and closes are **not** [value](values.md) / [ability](special-vocabulary.md#ability) compounds (those have a **content root** before `x`).

**Parser cue — span form:** after PoS, material before the first `x` is exactly one TYPE vowel (**a** / **e** / **o** / **u**), and after `x` exactly one EDGE vowel (**a** / **e** / **o** / **u**) + **-l** / **-m** / **-n** / **-r**. One vowel before `x` + **longer** root after → [role compound](special-vocabulary.md#role-compounds). Longer material before `x` → ordinary / value / ability compound. Full map: **[x-compounds.md](x-compounds.md)**.

**Parser cue — close:** exact words **`xuxul`** / **`xuxur`** / **`xuxun`** / **`xuxum`** only (combo writing expands to two closes in speech).

Spoken open/close may be omitted in casual speech when the listener has writing or clear prosody; they matter for voice-to-text, singing, and emphatic citing.

<a id="pos"></a>

## Part of speech (slot)

The **open** (or anaphor’s) PoS is the **outer-clause slot** of the **entire** span — not the PoS of words inside the fence. Interior may be a fragment, a full sentence, foreign text, or code; the open’s PoS only says how that packaged surface sits in the host clause. Close is always `/x/`-shaped **`xuxul`** / **`xuxur`** / **`xuxun`** / **`xuxum`** (no PoS match required). Anaphor **-r** may take a **different** PoS than its antecedent open (`zaxar` = that prior cite as subject).

Ask: *in the outer sentence, what slot does this chunk fill?* Prefer a **nativized** ordinary word (PoS + adapted root + ending, no span) when the surface wording is not the point. Prefer a **span** at that PoS when fidelity, opacity, use–mention, or attributed wording matters.

| PoS | When it earns its keep | Forms (sketch) |
|-----|------------------------|----------------|
| `/d/` | Default cite object — *said / wrote / typed “…”* | `daxal` … `xuxul`; `d[hi]`; `d[=]` |
| `/z/` | The wording or title **is** the subject — *“Hello” started the fight*; *“Hamlet” sold out* | `zaxal` …; `z@[Hamlet]`; `z[=]` |
| `/b/` | Host needs a `/b/` argument — *about “…”*, *of the form {…}*, *called “…”* | `baxal` …; `b{…}`; `b[=]` |
| `/v/` | Span **is** the verb (phrase) — not an object of *say*: echo / report the act as wording (*don’t “I never said that” me*); opaque or foreign predicate (`v<code.run()>`); mention-as-predicate (*to “hello” someone*); anaphor in VP slot (*and then he `v[=]`-ed again*) | `vaxal` …; `v{hello}`; `vuxol run`; `v[=]` |
| `/ɡ/` | Predicative or attributive property **is** the spanned string — *so-called “ready”*; title / opaque label as AP | `gaxal` …; `g@[Draft]`; `g[=]` |
| `/w/` | Rare — span as **frame** on the preceding `/ɡ/` | `waxal` … |
| `/h/` | Manner cite; **asides** prefer this so digressions float like other adverbs | `hexal` … `xuxul`; `h(…)`; `h~(…)` |
| `/j/` | Vocative / expressive edge with a spanned call or title — *Hey, “Captain”!* | `jaxol Captain`; `j@[…]` |
| `/x/` | Discourse-only citation (epigraph, freestanding span — not a main-clause argument) | `xaxal` …; `x[…]` |

TYPE and EDGE are independent of PoS (`h` + **a** is still **cite** as manner; `/v/` + **u** is opaque VP). Prefer `/h/` for asides — that is a **PoS preference**, not a TYPE override.

Sketch (*he said “hi”* — atomic object cite):

```text
jal z-hen daxol hi v-saidl
```

Writing: `jal z-hen d[hi] v-saidl`

Sketch (*he said **that**?!* — anaphor to a prior cite):

```text
jol z-hen daxar v-saidl
```

Writing: `jol z-hen d[=] v-saidl`

Sketch (*don’t “oops” me* — cite as VP):

```text
jul z-you vaxol oops d-mel
```

Writing: `jul z-you v[oops] d-mel`

<a id="writing"></a>

## Writing

| Brackets | Span type |
|----------|-----------|
| `[` … `]` | **cite** — attributed speech / cited wording (including title strings and proverbs cited as wording) |
| `{` … `}` | **mention** — use–mention; form / label as designated surface; with **-n**, *the saying/proverb / the title X* as a named unit |
| `(` … `)` | **aside** — parenthetical digression; still asserted |
| `<` … `>` | **opaque** — foreign, code, IPA, raw orthography; **do not** parse interior as Clarity |

**PoS:** write the PoS letter immediately before any **`@`** / **`~`** marks and the opening bracket (`d[…]`, `z{…}`, `h(…)`, `d<…>`, `x[…]`, …).

**Marks (after PoS, before the bracket):**

| Mark | Job |
|------|-----|
| *(none)* | **exact** (-**l**) |
| **`~`** | **paraphrase** (-**m**) — `d~[…]` |
| **`@`** | **proper** (-**n**) — `d@[…]` |

Anaphor (**-r**) is **not** a second-slot mark here: write interior **`=`** (`d[=]`, `d{=}`, `d(=)`, `d<=>`). Numbers use second-slot **`=`** instead ([numbers.md](numbers.md#writing-preferred-shorthand)).

Order when both apply: **`@` then `~`** (`d@~[…]`). **Do not write** the stack with both glyphs — spell **`d@[…]`** only. That writing is still spoken as the **proper** open (`daxan` / `daxon` / …), with **uncertain tonality**; English/other translation **hedges** (gist / soft rendering of the titled unit). Bare **`d~[…]`** remains ordinary paraphrase without proper. **`@`** / **`~`** do **not** combine with anaphor **-r**.

| Writing | Speech (object slot) | Notes |
|---------|----------------------|-------|
| `d[…]` | `daxal` … `xuxul` | exact multi-token cite (EDGE **a**); complete close |
| `d[…-]` | `daxal` … `xuxur` | same open; **truncated** close (hyphen + `]`) |
| `d[…#]` | `daxal` … `xuxun` | same open; **sic / editorial** close (`#` + `]`) |
| `d[…-\|]` | `daxal` … `xuxur xuxum` | truncated innermost + **close-all** (writing `-\|`) |
| `d[…#\|]` | `daxal` … `xuxun xuxum` | sic innermost + **close-all** (writing `#\|`) |
| `d~[…]` | `daxam` … `xuxul` | paraphrased multi-token cite |
| `d@[…]` | `daxan` … `xuxul` | **proper** multi-token cite; also the spelling of hedged proper (`@~`) — uncertain tone |
| `d{…}` / `d~{…}` / `d@{…}` | `doxal` / `doxam` / `doxan` … `xuxul` | mention (exact / paraphrase / proper) |
| `d(…)` / `d~(…)` / `d@(…)` | `dexal` / `dexam` / `dexan` … `xuxul` | aside |
| `d<…>` / `d~<…>` / `d@<…>` | `duxal` / `duxam` / `duxan` … `xuxul` | opaque |
| `d{…-}` / `d(…-)` / `d<…->` | … `xuxur` | truncated mention / aside / opaque (hyphen + matching closer) |
| `d{…#}` / `d(…#)` / `d<…#>` | … `xuxun` | sic mention / aside / opaque (`#` + matching closer) |
| `d[hi]` | `daxol hi` | **atomic** (EDGE **o**) — one token; no close (closer optional in writing) |
| `d@[Hamlet]` | `daxon Hamlet` | atomic **proper** cite |
| `d<sushi>` | `duxol sushi` | atomic opaque |
| `d[…` … (to clause end) | `daxel` … | **clause-scoped** (EDGE **e**); auto-pop before next clause-force `/j/` or clause join |
| `d[]` | `daxul` | **empty / redacted** (EDGE **u**); no interior |
| `d[=]` | `daxar` | **anaphor** — prior cite as object (*that*) |
| `d{=}` / `d(=)` / `d<=>` | `doxar` / `dexar` / `duxar` | anaphor of that TYPE |

Same TYPE with any other PoS (`zaxal`, `hexal`, `xoxal`, `duxal`, `zaxar`, `daxol`, …). Explicit close is **`xuxul`** (complete), **`xuxur`** (truncated), **`xuxun`** (sic), or **`xuxum`** (clear stack) when EDGE **a** left a frame open. Prefer EDGE **`a`** + **`xuxur`** for cut-off cites; EDGE **`e`** auto-pop is **complete**, not truncated or sic. EDGE **`o`** is **atomic** — one following token; not a multi-token open.

**Cite vs mention** (same string, different job):

| Reading | Use |
|---------|-----|
| **Title-as-cite** / **proverb-as-cite** | **cite** `[…]` — deploy the **wording** (title string naming a work; recite / report / attribute the line) |
| **Title-as-mention** / **proverb-as-mention** | **mention** `{…}` — point at the **form** or **named unit** (*the title/saying X*); prefer **`@`** / **-n** for *the proverb X* / *the title X* as a conventional designation |
| Ordinary use–mention (*the word X*) | **mention** exact / paraphrase — not necessarily **-n** |

Long / mixed-PoS work titles used to **pick out the work** prefer **cite** (often **`d@[…]`** / **`z@[…]`**). Referring to that title or a stock saying **as a named discourse unit** prefers **mention** **-n**. Short nativized proper names and ritual calls used as ordinary words need **no** span — just PoS + root + **-n** (or an **`x`-compound** when multipart — [phrasal proper names](reference-suffix.md#phrasal-proper-names)).

Nesting is by matching depth — nests are legal (`d[ z[…] ]`, `d[ h(…) ]`, `d~[ z{…} ]`, `d[ d<…> ]`, …). Do **not** use nesting depth as a glyph-escape convention. **`@`** / **`~`** apply only to the immediately following open (marks after that open’s PoS). Atomic and anaphor forms do **not** push a nest frame that needs a closer.

Literal bracket / `~` / `@` / `<` / `>` / `=` / `|` / `#` / hyphen-before-closer glyphs that must appear as content use a writing escape (`\` before the glyph). Spoken: nest an **atomic opaque** (or other atomic) around the fence-shaped token — [literal content](#literal-content). Close-all `|`, truncated `-]` / `-}` / `-)` / `->`, sic `#]` / `#}` / `#)` / `#>`, and combined `-\|` / `#\|` are recognized only in closer position (outside an open interior); while scanning a span interior, bare `|` / `#` / hyphen are ordinary content unless they form a special-close digraph with the following closer or close-all. (Number words still use `#` for ordinals — [numbers.md](numbers.md) — that is not a span closer.)

<a id="type"></a>
<a id="vowels"></a>

## TYPE (vowels)

Only **a** / **e** / **o** / **u** on TYPE. No stacked vowels on TYPE (`*daexal`, …).

Mnemonics track the [join series](coordination.md#join-type-vowel-series) loosely (same atoms as [revisers](revisers.md)): **a** additive → cite (*include* cited wording); **e** rank → aside (secondary / digression track); **o** choice → mention (form as designated label); **u** negation → opaque (*subtract from the Clarity parse*). The job is **span packaging**, not revision or set/rank join.

| TYPE | Role | Writing |
|------|------|---------|
| **a** | **cite** — cited wording (attributed speech, title string, proverb-as-wording); clausal interiors: outer speaker does **not** assert | `[` … `]` |
| **e** | **aside** — digression; outer speaker **does** assert | `(` … `)` |
| **o** | **mention** — use–mention / form-as-object; with **-n**, *the saying/title X* as named unit (interior may be Clarity) | `{` … `}` |
| **u** | **opaque** — foreign / code / raw blob; parser **skips** interior | `<` … `>` |

Prefer `/h/` for asides (`hexal` …) so they float like other adverbs — that is a **PoS preference**, not a TYPE override (`h` + **a** remains **cite** as manner/citation, rare).

Scare / ironic *“so-called”* distance is **not** a separate TYPE; use ordinary lexicon attitude if needed.

<a id="edge"></a>

## EDGE (extent)

The vowel **after** `x` is **EDGE** — how far the open runs. It is **not** a second TYPE.

| EDGE | Job | Needs close? | Typical writing |
|------|-----|--------------|-----------------|
| **a** | **Multi-token open** — push a stack frame until explicit close (default) | yes: **`xuxul`** / **`xuxur`** / **`xuxun`** (unless anaphor **-r**) | `d[…]` … `]` or `…-]` or `…#]` |
| **e** | **Clause-scoped** — auto-pop before the next clause-force `/j/` or clause-level `/x/` join (**complete**) | no (auto) | `d[…` run to clause end |
| **o** | **Atomic** — exactly **one** following token; no close | no | `d[hi]`, `d<sushi>`, … (closer optional) |
| **u** | **Empty / redacted** — no interior (*said ―*) | no | `d[]` |

**Anaphor `-r`** always uses EDGE **`a`** in the spoken template (`daxar`). Other EDGE + **-r** combinations are undefined.

EDGE **`a`** / **`e`** / **`o`** take **-l** / **-m** / **-n** (`daxal`, `daxel`, `daxol`; `daxam`, `daxem`, `daxom`; `daxan`, `daxen`, `daxon`). EDGE **`u`** is normally exact **-l** (`daxul`); paraphrase-empty (`daxum`) and proper-empty (`daxun`) are unused for now.

Open (EDGE **a** / **e** with interior) pushes a stack frame (PoS + TYPE + EDGE + ending) when there is interior to fence. **`xuxul`** pops one frame (complete); **`xuxur`** pops one (truncated); **`xuxun`** pops one (sic); **`xuxum`** pops all. Atomic (EDGE **o**), anaphor, and empty do not leave a frame that needs popping.

<a id="endings"></a>

## Endings

### On opens and span pronouns

| Ending | Meaning | Preferred writing |
|--------|---------|-------------------|
| **-l** | **exact** — verbatim / precise surface (multi, clause-scoped, atomic, or empty) | bare open (no `@` / `~`) |
| **-m** | **paraphrase** — gist / non-verbatim rendering | **`~`** after PoS (`d~[…]`) |
| **-n** | **proper** — titled / conventional designation of the **whole span** (work title, named saying, official citation unit) — same mnemonic as content-word [proper **-n**](reference-suffix.md#proper-name--n) | **`@`** after PoS (`d@[…]`); hedged proper (`@~`) uses the same spelling + uncertain tone |
| **-r** | **anaphor** — pronoun for the **most recent span of this TYPE**; PoS = role **now**; **not** a new open | `d[=]`, `z{=}`, … (interior **`=`**; same glyph as [number anaphor](numbers.md#number-endings)) |

**-n** is **not** one-token scope (that is EDGE **o**). A proper span may be multi (`d@[…]` / `daxan` … `xuxul`), clause-scoped (`d@[…` / `daxen` …), or atomic (`d@[Hamlet]` / `daxon Hamlet`). Morphological ending stays **-n** under hedged proper; **-m** is only for bare paraphrase writing (`d~[…]`).

**-r** is ordinary [anaphora](pronouns.md), not “resume citing.” `daxar` = *that (cite)* as object — *he said **that**?!* — matching the most recent **cite** (TYPE **a**) antecedent. `duxar` matches the most recent **opaque**; `doxar` the most recent **mention**; and so on. The pronoun’s PoS need not match the antecedent open’s PoS (`zaxar` = that cite as subject). No interior; no close.

### On closes

| Form | Ending job | Writing |
|------|------------|---------|
| **`xuxul`** | pop one — **complete** | `]` / `}` / `)` / `>` |
| **`xuxur`** | pop one — **truncated** (cut off / trail off; unspecified remainder) | `-]` / `-}` / `-)` / `->` (ASCII hyphen + closer) |
| **`xuxun`** | pop one — **sic / editorial** (complete as-written, including defects; conventional editorial frame) | `#]` / `#}` / `#)` / `#>` |
| **`xuxum`** | pop all | `\|` (or matching closers) |
| **`xuxur xuxum`** | truncated innermost + pop all | `-\|` |
| **`xuxun xuxum`** | sic innermost + pop all | `#\|` |

Close endings are **not** open exact/paraphrase/proper. Open **-n** = proper/titled span; close **-n** = sic/editorial — different jobs. Open **-r** = span anaphor; close **-r** = truncated. Truncated and sic spans are ordinary antecedents for later **-r** opens (`daxar` = *that* cut-off or *sic* cite). Combined `-\|` / `#\|` are writing-only shorthand for two spoken closes; bare `xuxur` / `xuxun` never means pop-all by themselves.

Named entities *inside* a **cite / mention / aside** still take ordinary PoS + **-n** (`z-Samn`, …) — [reference-suffix.md](reference-suffix.md). **Opaque** interiors are not parsed as Clarity words.

<a id="inventory"></a>

## Spoken inventory

### Opens and related (PoS shown as `…`; EDGE **a** unless noted)

| TYPE | exact multi **-l** | paraphrase **-m** | proper **-n** | anaphor **-r** |
|------|--------------------|-------------------|---------------|----------------|
| cite **a** | `…axal` | `…axam` | `…axan` | `…axar` |
| aside **e** | `…exal` | `…exam` | `…exan` | `…exar` |
| mention **o** | `…oxal` | `…oxam` | `…oxan` | `…oxar` |
| opaque **u** | `…uxal` | `…uxam` | `…uxan` | `…uxar` |

Atomic (EDGE **o**): `…axol` / `…axom` / `…axon` (cite examples); same pattern on other TYPEs (`…uxol`, `…oxon`, …). Clause-scoped (EDGE **e**): `…axel` / `…axem` / `…axen`. Empty: `…axul` (exact).

Object-slot examples: `daxal` / `daxam` / `daxan` / `daxar`; `daxol` / `daxon`; `duxal` / `duxol` / `duxar`; `daxul` (empty cite).

### Closes

| Form | Job |
|------|-----|
| `xuxul` | pop one — complete |
| `xuxur` | pop one — truncated |
| `xuxun` | pop one — sic / editorial |
| `xuxum` | pop all |
| `xuxur xuxum` | truncated + pop all (writing `-\|`) |
| `xuxun xuxum` | sic + pop all (writing `#\|`) |

<a id="when-required"></a>

## When spans are required

Use a span (PoS + brackets in writing; matching spoken open + close when a multi-token EDGE **a** open is pronounced) when:

- citing someone’s words, a title string, or a proverb / stock saying **as wording** (**cite** TYPE **a** / `…[…]`)
- mid-sentence parenthetical digression (**aside** TYPE **e** / `…(…)`) — prefer PoS `/h/`; must **not** use floating `/j/` — [utterance markers](language-reference.md#utterance-markers-j)
- use–mention, or *the saying/title X* as a named unit (**mention** TYPE **o** / `…{…}`; prefer **`d@{…}`** / **-n** for the named-unit reading)
- foreign, code, IPA, or other non-lexicon surface the parser must **not** read as Clarity (**opaque** TYPE **u** / `…<…>`)
- referring back to a prior span as a referent (**anaphor** **-r** / `…[=]`) — *said **that***

Prefer **atomic** (EDGE **o**) for a single cited / mentioned / opaque token (`daxol hi`, `duxol sushi`). Prefer EDGE **`e`** for a long spoken cite that runs to the clause end without hunting for `xuxul`.

Cited wording / title-as-cite → **a**; use–mention / title-or-saying-as-named-unit → **o** (often **-n**); raw import → **u**.

Material inside a **cite / aside / mention** may be a fragment or a full sentence (with its own `/j/` force if it is a full sentence). The outer clause does not treat **cited** clausal speech as the speaker’s assertoric commitment; **asides** remain asserted. Non-clausal cite interiors (title strings, short wording) are **cited wording**, not claims to assert or withhold. **Opaque** material is a surface blob in that slot, not Clarity syntax. An anaphor contributes the prior span’s **surface / cite** as a referent in the new slot — it does not re-open attribution.

<a id="loans"></a>

## Mentions, opaque, and loan words

| Need | Use |
|------|-----|
| **Raw foreign / code / unparsed surface** in a clause slot | **opaque** — writing `d<sushi>`, speech `duxol sushi` (atomic) or `duxal sushi xuxul` |
| **Use–mention** (*the word/form X*) | **mention** — `d{…}` / `doxal` … `xuxul` / `doxol` … |
| **Title string / proverb as wording** (pick out work; recite/report line) | **cite** — `d[…]` / `d@[…]` / `daxal` … / `daxan` … |
| ***The title X* / *the proverb X*** as named unit | **mention** **-n** — `d@{…}` / `doxan` … |
| **Nativized loan** (adapted Clarity root, ordinary morphology) | ordinary PoS + adapted `V(CV)+` root + reference suffix — **no** span (`z-susil`, `z-susir`, `g-susil`, …) |
| **That (prior opaque / cite / …) again** | span anaphor — `duxar` / `daxar` / … — [endings](#endings) |

Prefer **opaque** while the form is foreign orthography, unparsed donor text, or code-like. Prefer **cite** for **long / mixed-PoS work titles** used to name the work — especially titles that would make a clumsy multi-root **`x`-compound** (e.g. *Harry Potter and the Sorcerer's Stone* as `z@[…]` / `zaxan` …, not one mega-compound). Prefer **mention** **-n** when the point is the conventional unit (*the title …*, *the proverb …*). Prefer a bare nativized loan when the name is short enough to resume with ordinary content **-r** or shift PoS freely. Compact **multipart** person/place names (given+family, *New York*) use mid-word **`x`** (`z-MaryxSmithn`), not adjacent `z-Maryn z-Smithn` — [phrasal proper names](reference-suffix.md#phrasal-proper-names). Do not write `z-<sushi>l` or attach reference suffixes outside the open template.

<a id="nesting"></a>

## Nesting

Fences nest freely. Each multi-token open pushes; **`xuxul`** / **`xuxur`** / **`xuxun`** pops the innermost (complete / truncated / sic); **`xuxum`** clears the stack. Atomic and anaphor do not nest-push.

**Writing examples:**

- `d[…]` — exact multi cite as object
- `d[…-]` — truncated exact multi cite (*“I was going to—”*)
- `d[…#]` — sic / editorial exact multi cite (*“seperate”* [sic])
- `d[ … z{…} -|]` — truncated innermost + close-all (speech `xuxur xuxum`)
- `d[ … z{…} #|]` — sic innermost + close-all (speech `xuxun xuxum`)
- `d~[…]` — paraphrased multi cite as object
- `d@[…]` — proper multi cite as object (also spelling of hedged proper `@~`)
- `d[hi]` — atomic exact cite (*“hi”*)
- `d@[Hamlet]` — atomic proper cite (*Hamlet* as title wording)
- `d[=]` — anaphor (*that* cite)
- `d[]` — empty / redacted cite
- `z{…}` — exact mention as subject
- `z@{…}` — proper mention (*the title/saying …* as named unit)
- `h~(…)` — paraphrased aside as adverb
- `d<bonjour>` — atomic or multi opaque as object
- `x[…]` — discourse-only exact cite
- `d[… h( … ) …]` — aside inside an object cite
- `d[… z{ … } …]` — mention nested inside an object cite
- `d~[… d< … > …]` — paraphrased cite containing an opaque

**Speech sketch** for `d~[ hello ]`: `daxam` … `xuxul`.  
**Speech sketch** for `d@[…]` (committed proper): `daxan` … `xuxul`.  
**Speech sketch** for hedged proper (written `d@[…]`, conceptual `@~`): `daxan` … `xuxul` with uncertain tonality.  
**Speech sketch** for atomic: `daxol hi`.  
**Speech sketch** for atomic proper: `daxon Hamlet`.  
**Speech sketch** for anaphor: `daxar`.  
**Speech sketch** for truncated cite: `daxal` … `xuxur`.  
Writing: `d[I was going to-]`.  
**Speech sketch** for sic cite: `daxal` … `xuxun`.  
Writing: `d[seperate#]`.  
**Speech sketch** for nested then clear: `daxal` … `zoxal` … `xuxum` (pops both).  
Writing: `d[ … z{…} |` (close-all) — or matching closers `} ]`.  
**Speech sketch** for truncated + clear: `daxal` … `zoxal` … `xuxur xuxum`.  
Writing: `d[ … z{…} -|]`.  
**Speech sketch** for sic + clear: `daxal` … `zoxal` … `xuxun xuxum`.  
Writing: `d[ … z{…} #|]`.  
**Speech sketch** for literal close-shaped word as content: `daxal duxol xuxul xuxul`.

<a id="literal-content"></a>
<a id="escape"></a>

## Literal content (fence words / meta glyphs)

When a span-marker word (speech) or a raw bracket / `~` / `@` / `<` / `>` / `=` / `|` / `#` / hyphen-before-closer / PoS-before-bracket sequence (writing) must appear **as content** inside a span — **not** for ordinary nesting.

### Writing

`\` before `[` / `]` / `{` / `}` / `(` / `)` / `<` / `>` / `~` / `@` / `|` / `#` / `=` / `-` (when the hyphen would form truncated close with the following closer). Literal backslash: `\\`.

```text
d[ he typed \] then left ]
d<code \> 1>
d[ pipe \| here ]
d[ score\- ]
d[ item \# ]
```

`d[score\-]` is a **complete** cite whose interior ends in a hyphen. `d[item\#]` is a **complete** cite whose interior ends in `#` — not sic close `#]`.
### Speech — nest atomic opaque

There is **no** transparent speech escape. Bind the fence-shaped token as an **atomic opaque** (or other atomic cite/mention) so it is content, not an open/close:

```text
daxal duxol xuxul xuxul
      └ cite “xuxul” as opaque ┘ └ close cite
```

Writing: `d[ d<xuxul> ]`.

<a id="not-this"></a>

## Not this series

| Need | Use instead |
|------|-------------|
| Clause *and* / *or* / ranked claim join | `/x/` joins `xal` / `xol` / … — [coordination.md](coordination.md#clause-level-coordination) |
| Clause negation *no* / *not* | `xul` / `xum` / `xun` — **not** `xuxul` / `xuxum` / `xuxur` / `xuxun` |
| Em dash as truncated closer | ASCII hyphen + closer `-]` / `xuxur` — not an em dash |
| Casual abort / scratch of a draft cite | revise the text; closes do **not** abort (truncated `xuxur` and sic `xuxun` still **commit** the surface) |
| Open proper **-n** / `d@[…]` | titled designation of the span — **not** sic; use `#]` / `xuxun` for editorial *as-written* |
| Number ordinal `#` in a number word | [numbers.md](numbers.md) — not span sic close (sic is `#]` in closer position only) |
| Inferring close-all from bare `xuxur` / `xuxun` in speech | say `xuxur xuxum` / `xuxun xuxum`; writing may use `-\|` / `#\|` |
| *However* / *therefore* / *but* (asymmetric linkers) | other `/x/` lexicon roots — [discourse markers](language-reference.md#discourse-markers-x) |
| Numbered *point N:* | `/x/` + number — [numbers.md](numbers.md#number-as-discourse-marker-by-marker) |
| *Because* / *if* subordination | `/h/` + `/b/` next-clause pronoun — [dependent clauses](language-reference.md#dependent-clauses) |
| Vocative / interjection | left-edge `/j/` only — not mid-clause asides |
| Nativized loan as ordinary word | PoS + adapted root + ending — [loans](#loans) |
| Ordinary content anaphor (*that dog*) | content root + **-r** — [pronouns.md](pronouns.md) |
| Re-citing the same words as a fresh cite | new open (`daxal` / `daxol` / `daxan` / …), not **-r** |
| Literal fence word / meta glyph as content | [literal content](#literal-content) — `\` / nest atomic opaque |

<a id="xl-span-markers"></a>

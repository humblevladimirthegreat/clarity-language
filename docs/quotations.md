# Quotations, mentions, asides, and opaque spans

This page is the source of truth for **span fences**: every **open** carries a **PoS**, a **TYPE**, an **EDGE** (extent), and an **ENDING**; **close** is a fixed discourse pair (**`xuxul`** / **`xuxum`**). Preferred **bracket writing**, fidelity, extent, atomic spans, and span anaphors. Discourse linkers and clause joins under `/x/` stay in [language-reference.md](language-reference.md#discourse-markers-x) and [coordination.md](coordination.md). Span fences use ordinary mid-word **`x`** (compound joiner) — [phonology.md](phonology.md#phonotactics). Parallel to [numbers](numbers.md): writing uses shorthand; speech is the full form.

<a id="writing-vs-speech"></a>

## Writing vs speech

| Channel | Form |
|---------|------|
| **Writing (preferred)** | **PoS letter** + brackets — type from bracket shape; paraphrase from **`~`** before the PoS (or immediately before the opening bracket); extent / atomic / empty / anaphor from bracket shape (below). Do **not** write `daxal` / `xuxul` / … in ordinary text when a bracket form exists. |
| **Speech** | full **open** `{PoS}{TYPE}x{EDGE}{ENDING}`; full **close** **`xuxul`** (pop one) or **`xuxum`** (pop all) when a multi-token open needs an explicit close. |

Same split as number shorthand (`g+3l` written, full CV spoken).

<a id="shape"></a>

## Word shape

### Open / pronoun

```text
{PoS}{TYPE}x{EDGE}{ENDING}
```

| Piece | Values | Job |
|-------|--------|-----|
| **PoS** | `z` `d` `b` `v` `g` `w` `h` `j` `x` | slot the **whole span** (or span anaphor) fills in the outer clause |
| **TYPE** | **a** quote · **e** aside · **o** mention · **u** opaque | span kind (matches bracket shape) |
| **`x`** | mid-word joiner | marks a span-fence form |
| **EDGE** | **a** · **e** · **o** · **u** | **extent** — how much material the open covers ([EDGE](#edge)) |
| **ENDING** | **-l** exact · **-m** paraphrase · **-n** atomic · **-r** anaphor | fidelity, single-token packaging, or span pronoun ([endings](#endings)) |

Example: **`daxal`** = `d` + `a` + `x` + `a` + `l` → **open exact multi-token quote as direct object** (needs close).

### Close (universal)

| Spoken | Job | Writing |
|--------|-----|---------|
| **`xuxul`** | pop **one** (innermost open) | matching closer `]` / `}` / `)` / `>` |
| **`xuxum`** | pop **all** open spans | optional close-all mark **`»`** (or matching closers for each open) |

```text
xuxul  =  x + u + x + u + l
xuxum  =  x + u + x + u + m
```

Close does **not** repeat PoS, TYPE, EDGE, or open fidelity. Fidelity and extent are decided only at open. These forms are **not** clause joins (`xul` / `xum` = negation — different shape). They are **not** an empty quote under `/d/` (`daxul` = empty/redacted object quote; `xuxul` = close). **`xuxun`** / **`xuxur`** are undefined for now.

Opens, empties, atomics, anaphors, and closes are **not** [value](values.md) / [ability](special-vocabulary.md#ability) compounds (those have a **content root** before `x`).

**Parser cue — span form:** after PoS, material before the first `x` is exactly one TYPE vowel (**a** / **e** / **o** / **u**), and after `x` exactly one EDGE vowel (**a** / **e** / **o** / **u**) + **-l** / **-m** / **-n** / **-r**. Longer material before `x` → ordinary compound.

**Parser cue — close:** exact words **`xuxul`** / **`xuxum`** only.

Spoken open/close may be omitted in casual speech when the listener has writing or clear prosody; they matter for voice-to-text, singing, and emphatic quoting.

<a id="pos"></a>

## Part of speech (slot)

The **open** (or anaphor’s) PoS is the role of the **entire** span in the outer clause. Close is always `/x/`-shaped **`xuxul`** / **`xuxum`** (no PoS match required).

| PoS | Typical use |
|-----|-------------|
| `/d/` | *said “…”* — span as object (`daxal` … `xuxul`; `daxan hi`; `daxar`) |
| `/z/` | span as subject |
| `/b/` | span as argument of a complex `/ɡ/` or `/h/` (*about “…”*) |
| `/v/` | quoted / opaque VP chunk |
| `/ɡ/` | predicative or attributive span property |
| `/w/` | rare — span frame on the preceding `/ɡ/` |
| `/h/` | manner span; **asides** prefer this (`hexal` … `xuxul`) so digressions float like other adverbs |
| `/j/` | vocative / expressive edge with a spanned formula |
| `/x/` | discourse-only citation (epigraph, freestanding span — not a main-clause argument) |

Sketch (*he said “hi”* — atomic):

```text
jal z-hen daxan hi v-saidl
```

Writing: `jal z-hen d[hi] v-saidl`

Sketch (*he said **that**?!* — anaphor to a prior quote):

```text
jol z-hen daxar v-saidl
```

Writing: `jol z-hen d[·] v-saidl`

<a id="writing"></a>

## Writing

| Brackets | Span type |
|----------|-----------|
| `[` … `]` | **quote** — attributed speech / citation (including proverbs and stock sayings cited as wording) |
| `{` … `}` | **mention** — use–mention, titles / labels / names; Clarity-shaped form as designated surface |
| `(` … `)` | **aside** — parenthetical digression; still asserted |
| `<` … `>` | **opaque** — foreign, code, IPA, raw orthography; **do not** parse interior as Clarity |

**PoS:** write the PoS letter immediately before the opening bracket (`d[…]`, `z{…}`, `h(…)`, `d<…>`, `x[…]`, …).

**Paraphrase:** put **`~`** immediately before the **PoS letter** (preferred) or immediately before the opening bracket. Bare opening (no `~`) = **exact**. **`~`** does **not** combine with atomic **-n** or anaphor **-r** (those are exact packaging / pronouns).

| Writing | Speech (object slot) | Notes |
|---------|----------------------|-------|
| `d[…]` | `daxal` … `xuxul` | exact multi-token quote (EDGE **a**) |
| `~d[…]` | `daxam` … `xuxul` | paraphrased multi-token quote |
| `d{…}` / `~d{…}` | `doxal` / `doxam` … `xuxul` | mention |
| `d(…)` / `~d(…)` | `dexal` / `dexam` … `xuxul` | aside |
| `d<…>` / `~d<…>` | `duxal` / `duxam` … `xuxul` | opaque |
| `d[hi]` | `daxan hi` | **atomic** — one token; no close (closer optional in writing) |
| `d<sushi>` | `duxan sushi` | atomic opaque |
| `d[…` … (to clause end) | `daxel` … | **clause-scoped** (EDGE **e**); auto-pop before next clause-force `/j/` or clause join |
| `d[…` … (interrupted) | `daxol` … | **soft / interrupted** (EDGE **o**); rare |
| `d[]` | `daxul` | **empty / redacted** (EDGE **u**); no interior |
| `d[·]` | `daxar` | **anaphor** — prior quote as object (*that*) |
| `d{·}` / `d(·)` / `d<·>` | `doxar` / `dexar` / `duxar` | anaphor of that TYPE |

Same TYPE with any other PoS (`zaxal`, `hexal`, `xoxal`, `duxal`, `zaxar`, …). Explicit close is **`xuxul`** (or **`xuxum`** to clear the stack) when EDGE **a** (or **o**) left a frame open.

There is **no** separate “conventional saying” span type. Cite a proverb / stock line as a **quote**. Treat a formula as a named label / title with **mention** and ordinary content-word **-n** inside when it is a proper designation.

Nesting is by matching depth — unescaped nests are legal (`d[ z[…] ]`, `d[ h(…) ]`, `~d[ z{…} ]`, `d[ d<…> ]`, …). Do **not** use nesting depth as an escape convention. **`~`** applies only to the immediately following open (each nested open may take its own `~` or not). Atomic and anaphor forms do **not** push a nest frame that needs a closer.

Literal bracket / `~` / `<` / `>` glyphs that must appear as content use a writing escape (`\` before the glyph). Spoken escape: see [escape](#escape).

<a id="type"></a>
<a id="vowels"></a>

## TYPE (vowels)

Only **a** / **e** / **o** / **u** on TYPE. No stacked vowels on TYPE (`*daexal`, …).

Mnemonics track the [join series](coordination.md#join-type-vowel-series) loosely (same atoms as [revisers](revisers.md)): **a** additive → quote (*include* attributed speech); **e** rank → aside (secondary / digression track); **o** choice → mention (form as designated label); **u** negation → opaque (*subtract from the Clarity parse*). The job is **span packaging**, not revision or set/rank join.

| TYPE | Role | Writing |
|------|------|---------|
| **a** | **quote** — attributed; outer speaker does **not** assert | `[` … `]` |
| **e** | **aside** — digression; outer speaker **does** assert | `(` … `)` |
| **o** | **mention** — use–mention / label / title (interior may be Clarity) | `{` … `}` |
| **u** | **opaque** — foreign / code / raw blob; parser **skips** interior | `<` … `>` |

Prefer `/h/` for asides (`hexal` …) so they float like other adverbs — that is a **PoS preference**, not a TYPE override (`h` + **a** remains **quote** as manner/citation, rare).

Scare / ironic *“so-called”* distance is **not** a separate TYPE; use ordinary lexicon attitude if needed.

<a id="edge"></a>

## EDGE (extent)

The vowel **after** `x` is **EDGE** — how far the open runs. It is **not** a second TYPE.

| EDGE | Job | Needs `xuxul`? | Typical writing |
|------|-----|----------------|-----------------|
| **a** | **Multi-token open** — push a stack frame until explicit close (default) | yes (unless atomic **-n** / anaphor **-r**) | `d[…]` … `]` |
| **e** | **Clause-scoped** — auto-pop before the next clause-force `/j/` or clause-level `/x/` join | no (auto) | `d[…` run to clause end |
| **o** | **Soft / interrupted** — open may be unfinished; listener may close | optional | rare |
| **u** | **Empty / redacted** — no interior (*said ―*) | no | `d[]` |

**Atomic `-n`** and **anaphor `-r`** always use EDGE **`a`** in the spoken template (`daxan`, `daxar`). Other EDGE + **-n** / **-r** combinations are undefined.

EDGE **`e`** / **`o`** take ordinary fidelity **-l** / **-m** (`daxel`, `daxem`, `daxol`, …). EDGE **`u`** is normally exact **-l** (`daxul`); paraphrase-empty (`daxum`) is odd and unused for now.

Open (EDGE **a** / **e** / **o** with **-l** / **-m**) pushes a stack frame (PoS + TYPE + EDGE + fidelity) when there is interior to fence. **`xuxul`** pops one frame; **`xuxum`** pops all. Atomic and anaphor do not leave a frame that needs popping.

<a id="endings"></a>

## Endings

### On opens and span pronouns

| Ending | Meaning | Preferred writing |
|--------|---------|-------------------|
| **-l** | **exact** — verbatim / precise surface (multi, clause-scoped, soft, or empty) | bare open (no `~`) |
| **-m** | **paraphrase** — gist / non-verbatim rendering | **`~`** before PoS / opening bracket |
| **-n** | **atomic** — exactly **one** following token; **exact** only; **no** close | `d[hi]`, `d<sushi>`, … (closer optional) |
| **-r** | **anaphor** — pronoun for the **most recent span of this TYPE**; PoS = role **now**; **not** a new open | `d[·]`, `z{·}`, … |

Atomic is **exact-only**. To paraphrase a single token, use a normal multi open (`~daxam hi xuxul`) — rare.

**-r** is ordinary [anaphora](pronouns.md), not “resume quoting.” `daxar` = *that (quote)* as object — *he said **that**?!* — matching the most recent **quote** (TYPE **a**) antecedent. `duxar` matches the most recent **opaque**; `doxar` the most recent **mention**; and so on. The pronoun’s PoS need not match the antecedent open’s PoS (`zaxar` = that quote as subject). No interior; no close.

### On closes

| Form | Ending job |
|------|------------|
| **`xuxul`** | pop one |
| **`xuxum`** | pop all |

Close endings are **not** exact/paraphrase (that lives only on the open). **`xuxun`** / **`xuxur`** undefined.

Named entities *inside* a **quote / mention / aside** still take ordinary PoS + **-n** (`z-Samn`, …) — [reference-suffix.md](reference-suffix.md). **Opaque** interiors are not parsed as Clarity words.

<a id="inventory"></a>

## Spoken inventory

### Opens and related (PoS shown as `…`; EDGE **a** unless noted)

| TYPE | exact multi **-l** | paraphrase **-m** | atomic **-n** | anaphor **-r** |
|------|--------------------|-------------------|---------------|----------------|
| quote **a** | `…axal` | `…axam` | `…axan` | `…axar` |
| aside **e** | `…exal` | `…exam` | `…exan` | `…exar` |
| mention **o** | `…oxal` | `…oxam` | `…oxan` | `…oxar` |
| opaque **u** | `…uxal` | `…uxam` | `…uxan` | `…uxar` |

Clause-scoped / soft / empty (quote examples): `…axel` / `…axem`; `…axol` / `…axom`; `…axul` (empty). Same EDGE pattern on other TYPEs (`…exel`, `…uxul`, …).

Object-slot examples: `daxal` / `daxam` / `daxan` / `daxar`; `duxal` / `duxan` / `duxar`; `daxul` (empty quote).

### Closes

| Form | Job |
|------|-----|
| `xuxul` | pop one |
| `xuxum` | pop all |

<a id="when-required"></a>

## When spans are required

Use a span (PoS + brackets in writing; matching spoken open + close when a multi-token EDGE **a**/**o** open is pronounced) when:

- quoting someone’s words, or citing a proverb / stock saying as wording (**quote** TYPE **a** / `…[…]`)
- mid-sentence parenthetical digression (**aside** TYPE **e** / `…(…)`) — prefer PoS `/h/`; must **not** use floating `/j/` — [utterance markers](language-reference.md#utterance-markers-j)
- use–mention, title, or label when the interior may still be Clarity-shaped (**mention** TYPE **o** / `…{…}`)
- foreign, code, IPA, or other non-lexicon surface the parser must **not** read as Clarity (**opaque** TYPE **u** / `…<…>`)
- referring back to a prior span as a referent (**anaphor** **-r** / `…[·]`) — *said **that***

Prefer **atomic `-n`** for a single quoted / mentioned / opaque token (`daxan hi`, `duxan sushi`). Prefer EDGE **`e`** for a long spoken quote that runs to the clause end without hunting for `xuxul`.

Speech citation → **a**; label / use–mention → **o**; raw import → **u**.

Material inside a **quote / aside / mention** may be a fragment or a full sentence (with its own `/j/` force if it is a full sentence). The outer clause does not treat **quoted** speech as the speaker’s assertoric commitment; **asides** remain asserted. **Opaque** material is a surface blob in that slot, not Clarity syntax. An anaphor contributes the prior span’s **surface / cite** as a referent in the new slot — it does not re-open attribution.

<a id="loans"></a>

## Mentions, opaque, and loan words

| Need | Use |
|------|-----|
| **Raw foreign / code / unparsed surface** in a clause slot | **opaque** — writing `d<sushi>`, speech `duxan sushi` (atomic) or `duxal sushi xuxul` |
| **Use–mention / title / label** (form as designated surface; may be Clarity) | **mention** — `d{…}` / `doxal` … `xuxul` / `doxan` … |
| **Nativized loan** (adapted Clarity root, ordinary morphology) | ordinary PoS + adapted `V(CV)+` root + reference suffix — **no** span (`z-susil`, `z-susir`, `g-susil`, …) |
| **That (prior opaque / quote / …) again** | span anaphor — `duxar` / `daxar` / … — [endings](#endings) |

Prefer **opaque** while the form is foreign orthography, multi-word donor text, or code-like. Prefer **mention** for *the word X* / titled formulas. Prefer a nativized loan when you will resume with ordinary content **-r** or shift PoS freely. Do not write `z-<sushi>l` or attach reference suffixes outside the open template.

<a id="nesting"></a>

## Nesting

Fences nest freely. Each multi-token open pushes; **`xuxul`** pops the innermost; **`xuxum`** clears the stack. Atomic and anaphor do not nest-push.

**Writing examples:**

- `d[…]` — exact multi quote as object
- `~d[…]` — paraphrased multi quote as object
- `d[hi]` — atomic exact quote (*“hi”*)
- `d[·]` — anaphor (*that* quote)
- `d[]` — empty / redacted quote
- `z{…}` — exact mention as subject
- `~h(…)` — paraphrased aside as adverb
- `d<bonjour>` — atomic or multi opaque as object
- `x[…]` — discourse-only exact quote
- `d[… h( … ) …]` — aside inside an object quote
- `d[… z{ … } …]` — mention nested inside an object quote
- `~d[… d< … > …]` — paraphrased quote containing an opaque

**Speech sketch** for `~d[ hello ]`: `daxam` … `xuxul`.  
**Speech sketch** for atomic: `daxan hi`.  
**Speech sketch** for anaphor: `daxar`.  
**Speech sketch** for nested then clear: `daxal` … `zoxal` … `xuxum` (pops both).

<a id="escape"></a>

## Escape

Escape is **only** for when a span-marker word (speech) or a raw bracket / `~` / `<` / `>` / PoS-before-bracket sequence (writing) must appear **as content** inside a span — **not** for ordinary nesting.

- **Writing:** `\` before `[` / `]` / `{` / `}` / `(` / `)` / `<` / `>` / `~` / `»`.
- **Speech:** a dedicated longer escape root (dictionary form TBD; likely under `/x/`) immediately before the token that would otherwise be read as a span open/anaphor or as `xuxul` / `xuxum`.

<a id="not-this"></a>

## Not this series

| Need | Use instead |
|------|-------------|
| Clause *and* / *or* / ranked claim join | `/x/` joins `xal` / `xol` / … — [coordination.md](coordination.md#clause-level-coordination) |
| Clause negation *no* / *not* | `xul` / `xum` / `xun` — **not** `xuxul` / `xuxum` |
| *However* / *therefore* / *but* (asymmetric linkers) | other `/x/` lexicon roots — [discourse markers](language-reference.md#discourse-markers-x) |
| Numbered *point N:* | `/x/` + number — [numbers.md](numbers.md#number-as-discourse-marker-by-marker) |
| *Because* / *if* subordination | `/h/` + `/b/` next-clause pronoun — [dependent clauses](language-reference.md#dependent-clauses) |
| Vocative / interjection | left-edge `/j/` only — not mid-clause asides |
| Nativized loan as ordinary word | PoS + adapted root + ending — [loans](#loans) |
| Ordinary content anaphor (*that dog*) | content root + **-r** — [pronouns.md](pronouns.md) |
| Re-quoting the same words as a fresh cite | new open (`daxal` / `daxan` / …), not **-r** |

<a id="xl-span-markers"></a>

## Historical note

Earlier designs used discourse-only onset **`xl-`**, then PoS-matched EDGE-**u** closes (`daxul` = *close object quote*). Those closes are **withdrawn** in favor of **`xuxul`** / **`xuxum`**. Spoken **`daxul`** is now **empty/redacted** object quote (EDGE **u**), not a close. Opens are `{PoS}{TYPE}x{EDGE}{ENDING}` with TYPE and EDGE both **a** / **e** / **o** / **u**; closes are only **`xuxul`** / **`xuxum`**.

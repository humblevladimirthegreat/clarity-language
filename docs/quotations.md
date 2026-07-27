# Quotations, mentions, asides, and opaque spans

This page is the source of truth for **span fences**: every **open** carries a **PoS** and a **TYPE**; **close** is a fixed discourse pair (**`xuxul`** / **`xuxum`**). Preferred **bracket writing**, fidelity, and nesting. Discourse linkers and clause joins under `/x/` stay in [language-reference.md](language-reference.md#discourse-markers-x) and [coordination.md](coordination.md). Span fences use ordinary mid-word **`x`** (compound joiner) — [phonology.md](phonology.md#phonotactics). Parallel to [numbers](numbers.md): writing uses shorthand; speech is the full form.

<a id="writing-vs-speech"></a>

## Writing vs speech

| Channel | Form |
|---------|------|
| **Writing (preferred)** | **PoS letter** + brackets — type from bracket shape; paraphrase from **`~`** before the PoS (or immediately before the opening bracket). Do **not** write `daxal` / `xuxul` / … in ordinary text. |
| **Speech** | full **open** `{PoS}{TYPE}xa{ENDING}`; full **close** **`xuxul`** (pop one) or **`xuxum`** (pop all). |

Same split as number shorthand (`g+3l` written, full CV spoken).

<a id="shape"></a>

## Word shape

### Open

```text
{PoS}{TYPE}xa{ENDING}
```

| Piece | Values | Job |
|-------|--------|-----|
| **PoS** | `z` `d` `b` `v` `g` `w` `h` `j` `x` | slot the **whole span** fills in the outer clause |
| **TYPE** | **a** quote · **e** aside · **o** mention · **u** opaque | span kind (matches bracket shape) |
| **`x`** | mid-word joiner | marks a span-fence open |
| **`a`** | open edge (fixed) | push a stack frame |
| **ENDING** | **-l** exact · **-m** paraphrase | fidelity (**-n** unused on opens; **-r** reserved) |

Example: **`daxal`** = `d` + `a` + `x` + `a` + `l` → **open exact quote as direct object**.

### Close (universal)

| Spoken | Job | Writing |
|--------|-----|---------|
| **`xuxul`** | pop **one** (innermost open) | matching closer `]` / `}` / `)` / `|` |
| **`xuxum`** | pop **all** open spans | optional close-all mark **`»`** (or matching closers for each open) |

```text
xuxul  =  x + u + x + u + l
xuxum  =  x + u + x + u + m
```

Close does **not** repeat PoS, TYPE, or open fidelity. Fidelity is decided only at open. These forms are **not** clause joins (`xul` / `xum` = negation — different shape). They are **not** an open opaque under `/x/` (`xuxal` = open opaque discourse-only; `xuxul` = close).

Opens and closes are **not** [value](values.md) / [ability](special-vocabulary.md#ability) compounds (those have a **content root** before `x`).

**Parser cue — open:** after PoS, material before the first `x` is exactly one TYPE vowel (**a** / **e** / **o** / **u**), and after `x` exactly **`a`** + **-l** / **-m** → span open. Longer material before `x` → ordinary compound.

**Parser cue — close:** exact words **`xuxul`** / **`xuxum`** only.

Spoken open/close may be omitted in casual speech when the listener has writing or clear prosody; they matter for voice-to-text, singing, and emphatic quoting.

<a id="pos"></a>

## Part of speech (slot)

The **open** marker’s PoS is the role of the **entire** span in the outer clause. Close is always `/x/`-shaped **`xuxul`** / **`xuxum`** (no PoS match required).

| PoS | Typical use |
|-----|-------------|
| `/d/` | *said “…”* — span as object (`daxal` … `xuxul`) |
| `/z/` | span as subject |
| `/b/` | span as argument of a complex `/ɡ/` or `/h/` (*about “…”*) |
| `/v/` | quoted / opaque VP chunk |
| `/ɡ/` | predicative or attributive span property |
| `/w/` | rare — span frame on the preceding `/ɡ/` |
| `/h/` | manner span; **asides** prefer this (`hexal` … `xuxul`) so digressions float like other adverbs |
| `/j/` | vocative / expressive edge with a spanned formula |
| `/x/` | discourse-only citation (epigraph, freestanding span — not a main-clause argument) |

Sketch (*he said “hi”*):

```text
jal z-hen daxal hi xuxul v-saidl
```

Writing: `jal z-hen d[hi] v-saidl`

<a id="writing"></a>

## Writing

| Brackets | Span type |
|----------|-----------|
| `[` … `]` | **quote** — attributed speech / citation (including proverbs and stock sayings cited as wording) |
| `{` … `}` | **mention** — use–mention, titles / labels / names; Clarity-shaped form as designated surface |
| `(` … `)` | **aside** — parenthetical digression; still asserted |
| `|` … `|` | **opaque** — foreign, code, IPA, raw orthography; **do not** parse interior as Clarity |

**PoS:** write the PoS letter immediately before the opening bracket (`d[…]`, `z{…}`, `h(…)`, `d|…|`, `x[…]`, …).

**Paraphrase:** put **`~`** immediately before the **PoS letter** (preferred) or immediately before the opening bracket. Bare opening (no `~`) = **exact**.

| Writing | Fidelity | Spoken open … close (object slot) |
|---------|----------|-------------------------------------|
| `d[…]` | exact quote | `daxal` … `xuxul` |
| `~d[…]` | paraphrased quote | `daxam` … `xuxul` |
| `d{…}` | exact mention | `doxal` … `xuxul` |
| `~d{…}` | paraphrased mention | `doxam` … `xuxul` |
| `d(…)` | exact aside | `dexal` … `xuxul` |
| `~d(…)` | paraphrased aside | `dexam` … `xuxul` |
| `d|…|` | exact opaque | `duxal` … `xuxul` |
| `~d|…|` | paraphrased opaque | `duxam` … `xuxul` |

Same open TYPE with any other PoS (`zaxal`, `hexal`, `xoxal`, `duxal`, …). Close is always **`xuxul`** (or **`xuxum`** to clear the stack).

There is **no** separate “conventional saying” span type or ending. Cite a proverb / stock line as a **quote**. Treat a formula as a named label / title with **mention** and ordinary content-word **-n** inside when it is a proper designation.

Nesting is by matching depth — unescaped nests are legal (`d[ z[…] ]`, `d[ h(…) ]`, `~d[ z{…} ]`, `d[ d|…| ]`, …). Do **not** use nesting depth as an escape convention. **`~`** applies only to the immediately following open (each nested open may take its own `~` or not).

Literal bracket / `~` / `|` glyphs that must appear as content use a writing escape (`\` before the glyph). Spoken escape: see [escape](#escape).

<a id="type"></a>
<a id="vowels"></a>

## TYPE (vowels)

Only **a** / **e** / **o** / **u** on TYPE. Open edge is always **`a`** (no stacked vowels: `*daexal`, `*daxael`, …).

Mnemonics track the [join series](coordination.md#join-type-vowel-series) loosely (same atoms as [revisers](revisers.md)): **a** additive → quote (*include* attributed speech); **e** rank → aside (secondary / digression track); **o** choice → mention (form as designated label); **u** negation → opaque (*subtract from the Clarity parse*). The job is **span packaging**, not revision or set/rank join.

| TYPE | Role | Open forms | Writing |
|------|------|------------|---------|
| **a** | **quote** — attributed; outer speaker does **not** assert | `…axal` · `…axam` | `[` … `]` |
| **e** | **aside** — digression; outer speaker **does** assert | `…exal` · `…exam` | `(` … `)` |
| **o** | **mention** — use–mention / label / title (interior may be Clarity) | `…oxal` · `…oxam` | `{` … `}` |
| **u** | **opaque** — foreign / code / raw blob; parser **skips** interior | `…uxal` · `…uxam` | `|` … `|` |

Open pushes a stack frame (PoS + TYPE + fidelity). **`xuxul`** pops one frame; **`xuxum`** pops all. Prefer `/h/` for asides (`hexal` …) so they float like other adverbs — that is a **PoS preference**, not a TYPE override (`h` + **a** remains **quote** as manner/citation, rare).

**No `-n` forms** on opens (`*daxan`, …). Scare / ironic *“so-called”* distance is **not** a separate TYPE; use ordinary lexicon attitude if needed.

<a id="endings"></a>

## Endings

### On opens (fidelity)

| Ending | Meaning | Preferred writing |
|--------|---------|-------------------|
| **-l** | **exact** — verbatim / precise surface | bare open (no `~`) |
| **-m** | **paraphrase** — gist / non-verbatim rendering | **`~`** before PoS / opening bracket |
| **-n** | **not used** on span opens | — |
| **-r** | **reserved** — resume / point back at a prior span (*that quote again*); not “end” | — |

### On closes

| Form | Ending job |
|------|------------|
| **`xuxul`** | pop one |
| **`xuxum`** | pop all |

Close endings are **not** exact/paraphrase (that lives only on the open).

Named entities *inside* a **quote / mention / aside** still take ordinary PoS + **-n** (`z-Samn`, …) — [reference-suffix.md](reference-suffix.md). **Opaque** interiors are not parsed as Clarity words.

<a id="inventory"></a>

## Spoken inventory

### Opens (PoS shown as `…`)

| TYPE | exact **-l** | paraphrase **-m** |
|------|--------------|-------------------|
| quote **a** | `…axal` | `…axam` |
| aside **e** | `…exal` | `…exam` |
| mention **o** | `…oxal` | `…oxam` |
| opaque **u** | `…uxal` | `…uxam` |

Object-slot examples: `daxal` / `daxam`; `dexal` / `dexam`; `doxal` / `doxam`; `duxal` / `duxam`.

### Closes

| Form | Job |
|------|-----|
| `xuxul` | pop one |
| `xuxum` | pop all |

<a id="when-required"></a>

## When spans are required

Use a span (PoS + brackets in writing; matching spoken open + close when pronounced) when:

- quoting someone’s words, or citing a proverb / stock saying as wording (**quote** TYPE **a** / `…[…]`)
- mid-sentence parenthetical digression (**aside** TYPE **e** / `…(…)`) — prefer PoS `/h/`; must **not** use floating `/j/` — [utterance markers](language-reference.md#utterance-markers-j)
- use–mention, title, or label when the interior may still be Clarity-shaped (**mention** TYPE **o** / `…{…}`)
- foreign, code, IPA, or other non-lexicon surface the parser must **not** read as Clarity (**opaque** TYPE **u** / `…|…|`)

Speech citation → **a**; label / use–mention → **o**; raw import → **u**.

Material inside a **quote / aside / mention** may be a fragment or a full sentence (with its own `/j/` force if it is a full sentence). The outer clause does not treat **quoted** speech as the speaker’s assertoric commitment; **asides** remain asserted. **Opaque** material is a surface blob in that slot, not Clarity syntax.

<a id="loans"></a>

## Mentions, opaque, and loan words

| Need | Use |
|------|-----|
| **Raw foreign / code / unparsed surface** in a clause slot | **opaque** — writing `d{sushi}`, speech `duxal sushi xuxul` |
| **Use–mention / title / label** (form as designated surface; may be Clarity) | **mention** — `d{…}` / `doxal` … `xuxul` |
| **Nativized loan** (adapted Clarity root, ordinary morphology) | ordinary PoS + adapted `V(CV)+` root + reference suffix — **no** span (`z-susil`, `z-susir`, `g-susil`, …) |

Prefer **opaque** while the form is foreign orthography, multi-word donor text, or code-like. Prefer **mention** for *the word X* / titled formulas. Prefer a nativized loan when you will resume with **-r** or shift PoS freely. Do not write `z-|sushi|l` or attach reference suffixes outside the open template.

<a id="nesting"></a>

## Nesting

Fences nest freely. Each open pushes; **`xuxul`** pops the innermost; **`xuxum`** clears the stack.

**Writing examples:**

- `d[…]` — exact quote as object
- `~d[…]` — paraphrased quote as object
- `z{…}` — exact mention as subject
- `~h(…)` — paraphrased aside as adverb
- `d|bonjour|` — exact opaque as object
- `x[…]` — discourse-only exact quote
- `d[… h( … ) …]` — aside inside an object quote
- `d[… z{ … } …]` — mention nested inside an object quote
- `~d[… d| … | …]` — paraphrased quote containing an exact opaque

**Speech sketch** for `~d[ hello ]`: `daxam` … `xuxul`.  
**Speech sketch** for nested then clear: `daxal` … `zoxal` … `xuxum` (pops both).

<a id="escape"></a>

## Escape

Escape is **only** for when a span-marker word (speech) or a raw bracket / `~` / `|` / PoS-before-bracket sequence (writing) must appear **as content** inside a span — **not** for ordinary nesting.

- **Writing:** `\` before `[` / `]` / `{` / `}` / `(` / `)` / `|` / `~` / `»`.
- **Speech:** a dedicated longer escape root (dictionary form TBD; likely under `/x/`) immediately before the token that would otherwise be read as a span open or as `xuxul` / `xuxum`.

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

<a id="xl-span-markers"></a>

## Historical note

Earlier designs used discourse-only onset **`xl-`**, then PoS-matched EDGE-**u** closes (`daxul`, …). Those are **withdrawn**. Opens are `{PoS}{TYPE}xa…` with TYPE **a** / **e** / **o** / **u**; closes are only **`xuxul`** / **`xuxum`**.

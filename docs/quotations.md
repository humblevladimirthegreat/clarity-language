# Quotations, mentions, and asides

This page is the source of truth for **quote / mention / aside fences**: every span carries a **PoS**, preferred **bracket writing**, spoken **`{PoS}{TYPE}x{EDGE}{ENDING}`** forms, fidelity, and nesting. Discourse linkers and clause joins under `/x/` stay in [language-reference.md](language-reference.md#discourse-markers-x) and [coordination.md](coordination.md). Span fences use ordinary mid-word **`x`** (compound joiner) — [phonology.md](phonology.md#phonotactics). Parallel to [numbers](numbers.md): writing uses shorthand; speech is the full form.

<a id="writing-vs-speech"></a>

## Writing vs speech

| Channel | Form |
|---------|------|
| **Writing (preferred)** | **PoS letter** + brackets — type from bracket shape; paraphrase from **`~`** before the PoS (or immediately before the opening bracket). Do **not** write `daxal` / `daxul` / … in ordinary text. |
| **Speech** | always the full **`{PoS}{TYPE}x{EDGE}{ENDING}`** words (open and close). |

Same split as number shorthand (`g+3l` written, full CV spoken).

<a id="shape"></a>

## Word shape

```text
{PoS}{TYPE}x{EDGE}{ENDING}
```

| Piece | Values | Job |
|-------|--------|-----|
| **PoS** | `z` `d` `b` `v` `g` `w` `h` `j` `x` | slot the **whole span** fills in the outer clause |
| **TYPE** | **a** quote · **e** aside · **o** mention | span kind (matches bracket shape) |
| **`x`** | mid-word joiner | marks a span fence (not a content compound) |
| **EDGE** | **a** open · **u** close | push / pop the span stack |
| **ENDING** | **-l** exact · **-m** paraphrase | fidelity (**-n** unused; **-r** reserved) |

Every letter is meaningful. Example: **`daxal`** = `d` + `a` + `x` + `a` + `l` → **open exact quote as direct object**. Matching close: **`daxul`**.

These forms are **not** clause joins (`dal` / `xal` / … — no mid `x` on the join series), **not** number enumeration (`x+2l` / …), and **not** [value](values.md) / [ability](special-vocabulary.md#ability) compounds (those have a **content root** before `x`).

**Parser cue:** after PoS, material before the first `x` is exactly one TYPE vowel (**a** / **e** / **o**), and after `x` exactly EDGE (**a** / **u**) + ending → span fence. Longer material before `x` → ordinary compound (value, ability, lexicon compound).

Spoken open/close may be omitted in casual speech when the listener has writing or clear prosody; they matter for voice-to-text, singing, and emphatic quoting.

<a id="pos"></a>

## Part of speech (slot)

The open marker’s PoS is the role of the **entire quoted / mentioned / aside span** in the outer clause. Close **must match** open in PoS, TYPE, and ending fidelity.

| PoS | Typical use |
|-----|-------------|
| `/d/` | *said “…”* — quoted content as object (`daxal` … `daxul`) |
| `/z/` | quoted material as subject |
| `/b/` | span as argument of a complex `/ɡ/` or `/h/` (*about “…”*) |
| `/v/` | quoted VP / performative chunk |
| `/ɡ/` | predicative or attributive quoted property |
| `/w/` | rare — quoted frame on the preceding `/ɡ/` |
| `/h/` | quoted manner; **asides** prefer this (`hexal` … `hexul`) so digressions float like other adverbs |
| `/j/` | vocative / expressive edge with a quoted formula |
| `/x/` | discourse-only citation (epigraph, freestanding quote — not a main-clause argument) |

Sketch (*he said “hi”*):

```text
jal z-hen daxal hi daxul v-saidl
```

Writing: `jal z-hen d[hi] v-saidl`

<a id="writing"></a>

## Writing

| Brackets | Span type |
|----------|-----------|
| `[` … `]` | **quote** — attributed speech / citation (including proverbs and stock sayings cited as wording) |
| `{` … `}` | **mention** — foreign, slang, bare proper, use–mention; also fixed formulas used as **labels / titles / names** |
| `(` … `)` | **aside** — parenthetical digression; still asserted |

**PoS:** write the PoS letter immediately before the opening bracket (`d[…]`, `z{…}`, `h(…)`, `x[…]`, …).

**Paraphrase:** put **`~`** immediately before the **PoS letter** (preferred) or immediately before the opening bracket. Bare opening (no `~`) = **exact**.

| Writing | Fidelity | Spoken open … close (object slot) |
|---------|----------|-------------------------------------|
| `d[…]` | exact quote | `daxal` … `daxul` |
| `~d[…]` | paraphrased quote | `daxam` … `daxum` |
| `d{…}` | exact mention | `doxal` … `doxul` |
| `~d{…}` | paraphrased mention | `doxam` … `doxum` |
| `d(…)` | exact aside | `dexal` … `dexul` |
| `~d(…)` | paraphrased aside | `dexam` … `dexum` |

Same TYPE / EDGE / ending with any other PoS (`zaxal`, `hexal`, `xoxal`, …).

There is **no** separate “conventional saying” span type or ending. Cite a proverb / stock line as a **quote**. Treat a formula as a named label / title with **mention** and ordinary content-word **-n** inside when it is a proper designation.

Nesting is by matching depth — unescaped nests are legal (`d[ z[…] ]`, `d[ h(…) ]`, `~d[ z{…} ]`, …). Do **not** use nesting depth as an escape convention. **`~`** applies only to the immediately following open (each nested open may take its own `~` or not).

Literal `[` / `]` / `{` / `}` / `(` / `)` / `~` glyphs that must appear as content use a writing escape (`\` before the glyph). Spoken escape: see [escape](#escape).

<a id="type-edge"></a>
<a id="vowels"></a>

## TYPE and EDGE (vowels)

Only **a** / **e** / **o** on TYPE; only **a** / **u** on EDGE. No stacked vowels on either half (`*daexal`, `*daxael`, …).

Mnemonics track the [join series](coordination.md#join-type-vowel-series) loosely (same atoms as [revisers](revisers.md)): **a** additive → quote (*include* attributed speech); **e** rank → aside (secondary / digression track); **o** choice → mention (form as designated label / exclusive surface); EDGE **u** → close (pop / end the open frame). The job is **span packaging**, not revision or set/rank join.

| TYPE | Role | Open EDGE **a** | Close EDGE **u** | Writing brackets |
|------|------|-----------------|------------------|------------------|
| **a** | **quote** | `…axal` · `…axam` | `…axul` · `…axum` | `[` … `]` |
| **e** | **aside** | `…exal` · `…exam` | `…exul` · `…exum` | `(` … `)` |
| **o** | **mention** | `…oxal` · `…oxam` | `…oxul` · `…oxum` | `{` … `}` |

Open pushes a stack frame (PoS + TYPE + fidelity). Each EDGE-**u** close pops one frame. Close **must match** the open’s PoS, TYPE, and ending (`daxal` … `daxul`, `daxam` … `daxum`). Mismatched PoS, TYPE, or fidelity on close is illegal for now.

**No `-n` forms** on this series (`*daxan`, `*daxun`, …). Scare / ironic *“so-called”* distance is **not** a separate vowel yet; use ordinary lexicon attitude or a later reserved single vowel if needed.

<a id="endings"></a>

## Endings (fidelity)

| Ending | Meaning | Preferred writing |
|--------|---------|-------------------|
| **-l** | **exact** — verbatim / precise surface | bare open (no `~`) |
| **-m** | **paraphrase** — gist / non-verbatim rendering | **`~`** before PoS / opening bracket |
| **-n** | **not used** on span markers | — |
| **-r** | **reserved** — resume / point back at a prior span (*that quote again*); not “end” | — |

Named entities *inside* a span still take ordinary PoS + **-n** (`z-Samn`, …) — [reference-suffix.md](reference-suffix.md). That is content-word proper/named **-n**, not a span-marker ending.

<a id="inventory"></a>

## Spoken inventory (by TYPE × EDGE × ending)

PoS is shown as `…`; replace with `z` `d` `b` `v` `g` `w` `h` `j` or `x`.

| | exact **-l** | paraphrase **-m** |
|--|--------------|-------------------|
| quote open **a**×**a** | `…axal` | `…axam` |
| quote close **a**×**u** | `…axul` | `…axum` |
| aside open **e**×**a** | `…exal` | `…exam` |
| aside close **e**×**u** | `…exul` | `…exum` |
| mention open **o**×**a** | `…oxal` | `…oxam` |
| mention close **o**×**u** | `…oxul` | `…oxum` |

Object-slot examples: `daxal` / `daxam` / `daxul` / `daxum`; `dexal` / …; `doxal` / ….

<a id="when-required"></a>

## When spans are required

Use a **quote** or **mention** span (PoS + brackets in writing; matching spoken pair when pronounced) when:

- quoting someone’s words, or citing a proverb / stock saying as wording (**quote** `…[…]` / `~…[…]`)
- using a proper name, foreign word, slang / non-lexicon surface, or a fixed formula as a **label / title** (**mention** `…{…}` / spoken TYPE **o**)
- full citation speech vs imported label: speech citation → TYPE **a**; label-like chunk → TYPE **o**

Use an **aside** span for mid-sentence parenthetical digression — prefer PoS `/h/` (`h(…)` / `hexal` … `hexul`). Mid-sentence asides must **not** use floating `/j/` — [utterance markers](language-reference.md#utterance-markers-j).

Material inside a span may be a fragment or a full sentence (with its own `/j/` force if it is a full sentence). The outer clause does not treat quoted speech as the speaker’s assertoric commitment.

<a id="loans"></a>

## Mentions vs loan words

| Need | Use |
|------|-----|
| **Foreign / slang surface** as a span in a clause slot | **mention** with that slot’s PoS — writing `d{sushi}`, speech `doxal sushi doxul` |
| **Nativized loan** (adapted Clarity root, ordinary morphology) | ordinary PoS + adapted `V(CV)+` root + reference suffix — **no** span fence (`z-susil`, `z-susir`, `g-susil`, …) |

Mention keeps the donor surface and marks it imported. A loan word participates in anaphora (**-r**), plurality (**-sh**), and PoS shift like any other root. Adapt loans to legal phonotactics ([phonology.md](phonology.md)); do not write `z-{sushi}l` or attach endings outside the fence template.

Prefer mention while the form is still foreign orthography/pronunciation, multi-word, or code-like. Prefer a nativized loan when you will resume with **-r** or shift PoS freely.

<a id="nesting"></a>

## Nesting

Fences nest freely. Each open pushes; each close pops the innermost open. Matching is by stack order **and** by PoS + TYPE + fidelity on the close.

**Writing examples:**

- `d[…]` — exact quote as object
- `~d[…]` — paraphrased quote as object
- `z{…}` — exact mention as subject
- `~h(…)` — paraphrased aside as adverb
- `x[…]` — discourse-only exact quote
- `d[… h( … ) …]` — aside inside an object quote
- `d[… z{ … } …]` — mention nested inside an object quote
- `~d[… z{ … } …]` — paraphrased object quote containing an exact mention

**Speech sketch** for `~d[ hello ]`: `daxam` … `daxum` (do not write those forms in the preferred orthography).

<a id="escape"></a>

## Escape

Escape is **only** for when a span-marker word (speech) or a raw bracket / `~` / PoS-before-bracket sequence (writing) must appear **as content** inside a span — **not** for ordinary nesting.

- **Writing:** `\` before `[` / `]` / `{` / `}` / `(` / `)` / `~`.
- **Speech:** a dedicated longer escape root (dictionary form TBD; likely under `/x/`) immediately before the token that would otherwise be read as a span marker.

There is **no** peer “escape vowel” in the TYPE / EDGE series.

<a id="not-this"></a>

## Not this series

| Need | Use instead |
|------|-------------|
| Clause *and* / *or* / ranked claim join | `/x/` joins `xal` / `xol` / … — [coordination.md](coordination.md#clause-level-coordination) |
| *However* / *therefore* / *but* (asymmetric linkers) | other `/x/` lexicon roots — [discourse markers](language-reference.md#discourse-markers-x) |
| Numbered *point N:* | `/x/` + number — [numbers.md](numbers.md#number-as-discourse-marker-by-marker) |
| *Because* / *if* subordination | `/h/` + `/b/` next-clause pronoun — [dependent clauses](language-reference.md#dependent-clauses) |
| Vocative / interjection | left-edge `/j/` only — not mid-clause asides |
| Nativized loan as ordinary word | PoS + adapted root + ending — [loans](#loans); not a mention span |

<a id="xl-span-markers"></a>

## Historical note

An earlier design used discourse-only onset **`xl-`** (`xlal` / `xlol` / …) with no PoS on the fence. That series is **withdrawn**. Spans now always carry PoS; discourse-only citations use PoS `/x/` (`xaxal` … `xaxul`).

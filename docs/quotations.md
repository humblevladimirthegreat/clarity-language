# Quotations, mentions, and asides

This page is the source of truth for **quote / mention / aside fences**: preferred **bracket writing**, spoken **`xl-`** pronunciation, fidelity, and nesting. Discourse linkers and clause coordination under `/x/` stay in [language-reference.md](language-reference.md#discourse-markers-x) and [coordination.md](coordination.md). Phonotactic exception for onset **`xl-`**: [phonology.md](phonology.md#phonotactics). Parallel to [numbers](numbers.md): writing uses shorthand; speech is the full `xl-` form.

<a id="writing-vs-speech"></a>

## Writing vs speech

| Channel | Form |
|---------|------|
| **Writing (preferred)** | brackets only — type from bracket shape; paraphrase from **`~`** before the opening bracket. Do **not** write `xlal` / `xlam` / … in ordinary text. |
| **Speech** | always the full **`xl-`** + vowel + ending words (open and close). |

Same split as number shorthand (`g+3l` written, full CV spoken).

<a id="writing"></a>

## Writing

| Brackets | Span type |
|----------|-----------|
| `[` … `]` | **quote** — attributed speech / citation (including proverbs and stock sayings cited as wording) |
| `{` … `}` | **mention** — foreign, slang, bare proper, use–mention; also fixed formulas used as **labels / titles / names** |
| `(` … `)` | **aside** — parenthetical digression; still asserted |

**Paraphrase:** put **`~`** immediately before the **opening** bracket. Bare opening bracket = **exact**.

| Writing | Fidelity | Spoken open … close |
|---------|----------|---------------------|
| `[…]` | exact | `xlal` … `xlul` |
| `~[…]` | paraphrase | `xlam` … `xlum` |
| `{…}` | exact mention | `xlol` … `xlul` |
| `~{…}` | paraphrased mention | `xlom` … `xlum` |
| `(…)` | exact aside | `xlel` … `xlul` |
| `~(…)` | paraphrased aside | `xlem` … `xlum` |

There is **no** separate “conventional saying” span type or ending. Cite a proverb / stock line as a **quote** (`[…]` / `~[…]`). Treat a formula as a named label / title with **mention** (`{…}`) and ordinary content-word **-n** inside when it is a proper designation.

Nesting is by matching depth — unescaped nests are legal (`[[]]`, `[{}]`, `~[()]`, `{[]}`, …). Do **not** use nesting depth as an escape convention. **`~`** applies only to the immediately following opening bracket (each nested open may take its own `~` or not).

Literal `[` / `]` / `{` / `}` / `(` / `)` / `~` glyphs that must appear as content use a writing escape (`\` before the glyph). Spoken escape: see [escape](#escape).

<a id="xl-span-markers"></a>

## Speech (`xl-`)

Span markers are a **closed** `/x/` subsystem used **in pronunciation only**. Onset is **`xl-`** (discourse `/x/` + mid-word **l**), then a **single** vowel, then an ending. **No stacked vowels** (`*xlael`, `*xluol`, …).

These forms are **not** clause coordinators (`xal` / `xam` / …) and **not** number enumeration (`x+2l` / …).

| Piece | Job |
|-------|-----|
| **`xl-`** | spoken span-fence onset |
| **vowel** | open type **or** close |
| **ending** | fidelity of the span (**-l** / **-m** only on this series; **-r** reserved) |

Spoken open/close may be omitted in casual speech when the listener has writing or clear prosody; they matter for voice-to-text, singing, and emphatic quoting.

<a id="vowels"></a>

## Vowels (edge / type) — speech

Only **a** / **e** / **o** / **u**. Close is always **u** (stack pop); open vowels choose the span type (and match the written bracket shape).

| Vowel | Role | Forms | Writing |
|-------|------|--------|---------|
| **a** | **quote open** | `xlal` · `xlam` | `[` / `~[` |
| **e** | **aside open** | `xlel` · `xlem` | `(` / `~(` |
| **o** | **mention open** | `xlol` · `xlom` | `{` / `~{` |
| **u** | **close** | `xlul` · `xlum` | `]` / `}` / `)` |

Open pushes a stack frame (type + fidelity). Each **u**-close pops one frame. Close **ending should match** the open’s ending (`xlal` … `xlul`, `xlam` … `xlum`). Mismatched fidelity on close is illegal for now.

**No `-n` forms** on this series (`*xlan`, `*xlun`, …). Scare / ironic *“so-called”* distance is **not** a separate vowel yet (no stacked vowels); use ordinary lexicon attitude or a later reserved single vowel if needed.

<a id="endings"></a>

## Endings (fidelity) — speech

| Ending | Meaning | Preferred writing |
|--------|---------|-------------------|
| **-l** | **exact** — verbatim / precise surface | bare opening bracket |
| **-m** | **paraphrase** — gist / non-verbatim rendering | **`~`** before opening bracket |
| **-n** | **not used** on `xl-` span markers | — |
| **-r** | **reserved** — resume / point back at a prior span (*that quote again*); not “end” | — |

Named entities *inside* a span still take ordinary PoS + **-n** (`z-Samn`, …) — [reference-suffix.md](reference-suffix.md). That is content-word proper/named **-n**, not a span-marker ending.

<a id="inventory"></a>

## Spoken inventory

| | exact **-l** | paraphrase **-m** |
|--|--------------|-------------------|
| quote open **a** | `xlal` | `xlam` |
| aside open **e** | `xlel` | `xlem` |
| mention open **o** | `xlol` | `xlom` |
| close **u** | `xlul` | `xlum` |

<a id="when-required"></a>

## When spans are required

Use a **quote** or **mention** span (brackets in writing; matching `xl-` pair in speech when pronounced) when:

- quoting someone’s words, or citing a proverb / stock saying as wording (**quote** `[…]` / `~[…]`)
- using a proper name, foreign word, slang / non-lexicon surface, or a fixed formula as a **label / title** (**mention** `{…}` / spoken **o**)
- full citation speech vs imported label: speech citation → **a** / `[…]`; label-like chunk → **o** / `{…}`

Use an **aside** span for mid-sentence parenthetical digression. Mid-sentence asides must **not** use floating `/j/` — [utterance markers](language-reference.md#utterance-markers-j).

Material inside a span may be a fragment or a full sentence (with its own `/j/` force if it is a full sentence). The outer clause does not treat quoted speech as the speaker’s assertoric commitment.

<a id="nesting"></a>

## Nesting

Fences nest freely. Each open pushes; each close pops the innermost open.

**Writing examples:**

- `[…]` — exact quote (including a cited proverb)
- `~[…]` — paraphrased quote
- `{…}` — exact mention
- `~{…}` — paraphrased mention
- `(…)` — exact aside
- `~(…)` — paraphrased aside
- `[… ( … ) …]` — aside inside a quote
- `[… { … } …]` — mention nested inside a quote
- `~[… { … } …]` — paraphrased quote containing an exact mention

**Speech sketch** for `~[ hello ]`: `xlam` … `xlum` (do not write those forms in the preferred orthography).

<a id="escape"></a>

## Escape

Escape is **only** for when an `xl-` marker word (speech) or a raw bracket / `~` glyph (writing) must appear **as content** inside a span — **not** for ordinary nesting.

- **Writing:** `\` before `[` / `]` / `{` / `}` / `(` / `)` / `~`.
- **Speech:** a dedicated longer `/x/` escape root (dictionary form TBD) immediately before the token that would otherwise be read as a span marker.

There is **no** peer “escape vowel” in the `xl-` series.

<a id="not-this"></a>

## Not this series

| Need | Use instead |
|------|-------------|
| Clause *and* / *or* / ranked claim join | `/x/` coordinators `xal` / `xol` / … — [coordination.md](coordination.md#clause-level-coordination) |
| *However* / *therefore* / *but* (asymmetric linkers) | other `/x/` lexicon roots — [discourse markers](language-reference.md#discourse-markers-x) |
| Numbered *point N:* | `/x/` + number — [numbers.md](numbers.md#number-as-discourse-marker-by-marker) |
| *Because* / *if* subordination | `/h/` + `/b/` next-clause pronoun — [dependent clauses](language-reference.md#dependent-clauses) |
| Vocative / interjection | left-edge `/j/` only — not mid-clause asides |

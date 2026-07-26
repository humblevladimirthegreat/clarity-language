# Values (`/h/` / `/w/`)
<a id="values"></a>
<a id="value-ascription"></a>

This page is the source of truth for **values** (needs): which psychological payoff a host serves or costs, how firmly that stake is framed, and how changeable the (un)met state is. Port of Claritish value tags (`+a` / `-ct`, `my+c`, `should+r`, …) into native Clarity morphology. Restrictors: [restrictors.md](restrictors.md). Revisers (slot repair, not values): [revisers.md](revisers.md). Ordinary reference-suffix senses: [reference-suffix.md](reference-suffix.md).

## Default reading of `/h/` and `/w/`

Ordinary content words under **`/h/`** (clause) and **`/w/`** (prior `/ɡ/`) are **values**, unless the form is already in a clearer closed subcategory:

| Keep as non-value | Examples |
|-------------------|----------|
| Restrictor joins | `hal`, `hual`, `har`, `wal`, … — [restrictors](restrictors.md) |
| Evidentiality / mood | clause or adjective framing of *how you know* / claim strength |
| Degree | *very*, *slightly*, … |
| Time / place / manner / recipient adjuncts | ordinary adverb lexicon under `/h/` |
| Number words under `/h/` | `h+…`, `h-…`, … — [numbers](numbers.md) |

Parser cue: restrictor joins are PoS + join-vowel + ending only (`hal`). Value words have a **need root** (and usually an **`x`-addition**).

| Prefix | Scope |
|--------|--------|
| `/h/` | the **clause** (motive, ought-stake, judgment of the event) — floats like other `/h/` |
| `/w/` | the **preceding `/ɡ/`** (property or possessive ascription) — stays on that adjective |

## Need inventory

Closed set of six needs (Claritish `a/c/r/p/s/x`). Lexicon roots TBD; senses are fixed:

| Sense | Claritish | Gloss |
|-------|-----------|--------|
| autonomy | **a** | choice, agency, self-direction |
| competence | **c** | efficacy, skill, getting things to work |
| relatedness | **r** | connection, belonging, care |
| pleasure | **p** | enjoyment, comfort, aesthetic payoff |
| survival | **s** | safety, health, material sufficiency |
| unspecified | **x** | need named without picking among the five |

No ranked “better” need — unspecified is first-class (avoids shame).

## Word shape

```
[h|w] + need-root [ + x + {a|e|o|u} ] + {-l|-m|-n|-r}
```

1. **PoS** — `/h/` or `/w/`.
2. **Need root** — one of the six senses (`V(CV)+`).
3. **Optional `x`-addition** — compound second half: reviser-like vowel **`a` / `e` / `o` / `u`** (stake framing). Mid-word **`x`** is the ordinary [compound joiner](phonology.md#phonotactics).
4. **Ending** — on value compounds with an `x`-addition, reinterpreted as **changeability** (below), not literal / metaphorical / name / pronoun.

**Bare need** (no `x`-addition): names the need only — no satisfies / detracts claim (Claritish host with unspecified polarity, or topic-only). Ending on a bare need keeps ordinary [reference-suffix](reference-suffix.md) senses for now.

**Compound need** (`…x{a|e|o|u}…`): judgment, gratitude, ought, and motive ascriptions. Ending = changeability.

Schematic examples use English-shaped need roots (`compet`, `relat`, …) until the lexicon assigns Clarity roots.

## Stake framing (`x` + vowel)
<a id="value-stake"></a>

Same vowel letter logic as [revisers](revisers.md) (*including* / *rather* / *instead* / *except*) and joins (**a** additive, **e** soft rank, **o** exclusive swap, **u** subtract). Do **not** swap this table with changeability endings.

| After `x` | Reviser parallel | On a value |
|-----------|------------------|------------|
| **a** | *including* | **Satisfies / serves** — host pays off this need |
| **e** | *rather* | **Main stake** — prefer reading the motive/judgment as this need (soft; other needs not fully denied) |
| **o** | *instead* | **Exclusive stake** — this need replaces other value readings |
| **u** | *except* | **Detracts / unmet / costs** — host subtracts from this need |

Satisfies vs detracts is **`xa`** vs **`xu`**. Use **`xe` / `xo`** when several needs could fit and you are choosing how hard to pick.

## Changeability (endings on `x`-compounds)
<a id="value-changeability"></a>

On **`need x {a|e|o|u}`** compounds only, **-l / -m / -n / -r** encode temporariness / reversibility (Claritish `_t/_m/_i/_w` on unmet tags). Four endings → four codes; Claritish unspecified changeability (**`_x`**) merges into **-m** (“when unsure, prefer open”).

| Ending | Changeability | Claritish | Mnemonic |
|--------|---------------|-----------|----------|
| **-l** | **temporary** — usually met/able; not this moment | **t** | closed *right-now* snapshot |
| **-m** | **modifiable** — effort or circumstance may change it (also soft default if unknown) | **m** (+ **x**) | open to change |
| **-n** | **irreversible** — fixed as far as you can tell | **i** | settled / named-as-fixed |
| **-r** | **won't-now** — choice or deferral, not inability | **w** | not updating this *now* |

| Polarity | Ending job |
|----------|------------|
| **Detracts (`xu`)** | Primary Claritish nudge — block permanence-smuggling; always pick an ending. Unknown → **-m**. |
| **Satisfies (`xa`)** | Stability of the payoff (fleeting gratitude vs settled vs treating as met for now). |
| **Rather / instead (`xe` / `xo`)** | Changeability of that stake claim. |

**Can't vs won't:** **-n** (irreversible) vs **-r** (won't-now). Do not collapse them.

## Combined matrix (schematic)

Need root shown as `compet` / `relat` only for readability.

| | **-l** temporary | **-m** modifiable | **-n** irreversible | **-r** won't-now |
|--|------------------|-------------------|---------------------|------------------|
| **xa** satisfies | `w-competxal` | `w-competxam` | `w-competxan` | `w-competxar` |
| **xe** rather | `h-relatxel` | `h-relatxem` | `h-relatxen` | `h-relatxer` |
| **xo** instead | `h-autonxol` | `h-autonxom` | `h-autonxon` | `h-autonxor` |
| **xu** detracts | `h-relatxul` | `h-relatxum` | `h-relatxun` | `h-relatxur` |

## Attachment sites (where the nudge fires)

| Site | Typical shape | Claritish analogue |
|------|---------------|-------------------|
| Speaker-possessive / gratitude | host + `/ɡ/` possessive + `w-NEEDxa…` | `my+c` |
| Valence judgment (praise) | neutral host + `w-` / `h-` **`xa`** | `gift+r` |
| Valence judgment (criticism) | neutral host + **`xu`** + changeability ending | `meeting-at` |
| Ought / normative | clause + `h-NEEDxa…` or `xe` / `xo` | `should+r` |
| Motive (ex-*need to* / *have to*) | clause + `h-NEEDxa…` | `I+r am …` |

Prefer **`xa`** for gratitude / praise; **`xu`** for unmet; **-m** when changeability is unclear. Bare need words are fine for topic-only mention.

Elsewhere, values are optional — do not tax every clause.

## Examples

| Clarity (schematic) | Reading |
|---------------------|---------|
| `z-neighborhoodl g-ofl b-SPEAKER w-competxal` | *my+c neighborhood* — serves competence for now |
| `z-giftl w-relatxam` | gift serves relatedness (modifiable / among soft stability) |
| `z-meetingl w-autonxul` | meeting costs autonomy right now |
| `… h-relatxem` | ought / motive: rather relatedness; changeable |
| `… h-relatxun` | costs relatedness; irreversible |
| `… h-relatxur` | costs relatedness; won't address that now |
| `h-pleasl` | pleasure (need named only; no met/unmet) |

## Out of scope (for now)

- **Emotion decompose** (activation × locus × value) — later feature that should *reuse* this ascription, not a parallel tag system.
- **Incapability** changeability (`can't_t`, …) — same ending senses may apply to ability denials later; not defined here.
- **Listener / third-person possessives** — no forced value (reminder is for self-gratitude / self-ought / self-judgment).

## Constraints

- Do **not** put satisfies/detracts on endings or changeability on `x`-vowels (letter logic would break).
- Do **not** use number markers `h+` / `h-` for value polarity.
- Do **not** use ordinary **-l / -m** (literal / metaphorical) to mean met / unmet on these compounds.
- Value `x`-second halves are the bare vowels **`a` / `e` / `o` / `u`** inside a compound — not prefix-less reviser words (`al`, `ul`, …) and not restrictor joins (`hal`, …).
- Plural **-sh** stays unused on `/h/` `/w/` ([plurality](plurality.md)).
- Multiple values = multiple `/h/` or `/w/` words (`h-competxal h-relatxam`), not stacked `x`-additions on one need.

# Ability
<a id="ability-page"></a>

Tag **can** / **can’t** on an activity or property. Stance lives on the vowel; endings stay ordinary [reference-suffix](reference-suffix.md).

## Beginner
<a id="beginner"></a>

### Ability (primary: host + `xa` / `xe` / `xo` / `xu`)
<a id="ability"></a>
<a id="incapability"></a>
<a id="ability-changeability"></a>

Tag **can** / **can’t** on an activity or property root. The stance **vowel** carries capability polarity and *can’t* grain; the **ending** stays ordinary [reference-suffix](reference-suffix.md) so literal / metaphorical / proper / anaphor stay audible on the host.

**Shape** (when the capability **is** a single content root) — same mid-word **`x`** joiner as [values](values.md#word-shape):

```
PoS + HOST + x + {a|e|o|u} + {-l|-m|-n|-r}
```

| Piece | Role |
|-------|------|
| **PoS** | Prefer the host’s usual role — `/v/` (event), `/ɡ/` (property), etc. |
| **HOST** | Any **non-need** content root (*sing*, *lift*, *lead*, …) |
| **Stance vowel** | [Ability stance](#ability-stance) — **`a`** can; **`e` / `o` / `u`** can’t grains |
| **Ending** | Ordinary [reference-suffix](reference-suffix.md) on the **host** sense |

**Mnemonic:** vowel = can / *can’t how*; ending = how the root enters the talk (**-l** literal, **-m** metaphorical, …).

Start with incapability vowels (**`xe` / `xo` / `xu`**). **`xa`** when you want tagged *can*. Soft default *can’t* when grain is unclear → **`xo`**.

**Parser cue:** root ∈ [six needs](values.md#need-inventory) + `x…` → **value** tables. Other roots + **`xa` / `xe` / `xo` / `xu`** → **ability**. After PoS, single ROLE vowel **a** / **u** / **o** then `x` then a **longer** root → [role compound](roles.md#role-compounds). After PoS, single TYPE vowel then `x` then a single EDGE vowel + ending → [span form](spans.md). Full map: [x-compounds.md](x-compounds.md).

#### Stance vowels
<a id="ability-stance"></a>

| Form | Stance | Reading |
|------|--------|---------|
| **`xa`** | **Capable** | can (solo / underspecified scaffold) |
| **`xe`** | **Temporary can’t** | can’t **right now** (usually able) |
| **`xo`** | **Modifiable can’t** | can’t, and that may change — **unspecified** whether the speaker will change it (also soft default if grain unknown) |
| **`xu`** | **Irreversible can’t** | can’t — fixed / impossible as far as you can tell |

**Not won’t:** ability morph marks capability, not refusal. *Won’t* / *choose not to* stays ordinary lexicon (or other packaging) — not a fourth ability vowel.

| Form | Reading |
|------|---------|
| `veguxal` / `geguxal` | can sing (literal host) |
| `veguxam` | can sing (metaphorical host sense) |
| `veguxel` | can’t sing **right now** |
| `veguxol` | can’t sing yet / may become able (or unknown grain) |
| `veguxul` | can’t sing — fixed / impossible as far as you can tell |

```
`veguxel.`

gloss: `v-express-unable-temporary`

*Can’t sing right now.*
```

```
`veguxol.`

gloss: `v-express-unable-modifiable`

*Can’t sing (open to change — not claiming who will change it).*
```

Hostless / clause-wide ability uses fallback **`egera`** — [Intermediate](#ability-fallback). Ability is not a need: stance lives on the vowel; endings stay ordinary reference-suffix. Plural **-sh** on `/h/` `/w/` stays unused ([plurality](plurality.md)); host `/v/` / `/ɡ/` ability compounds follow ordinary plurality for that PoS.

## Intermediate
<a id="intermediate"></a>

### Ability fallback (`egera`)
<a id="ability-fallback"></a>

When there is **no single host root** (complex VP, hostless *I can’t*, or ability as a floating adverb), use closed **`ABIL`** = lexicon **`egera`** 🥣 *cereal* → *capacity*:

```
[h|w] + egera + x + {a|e|o|u} + {-l|-m|-n|-r}
```

| Prefix | Scope |
|--------|--------|
| `/h/` | clause-level capability claim (floats like other `/h/`) |
| `/w/` | capability framed on the preceding `/ɡ/` |

**Mnemonic:** a bowl holds **what it can** — hostless ability names that capacity without naming one activity root. Ordinary content still available (`zegeral` *cereal* / *a capacity*). Prefer **host + stance** whenever the activity fits one root ([Beginner ability](#ability)).

Bare `hegeral` / `wegeral` = ability **topic** only (ordinary [reference-suffix](reference-suffix.md)).

| Form | Stance | Gloss |
|------|--------|--------|
| bare host (no `x`) | ordinary word | no ability claim |
| bare **`egera`** (no `x`) | **Topic** | Ability named only |
| **`xa`** | **Capable** | can |
| **`xe`** | **Temporary can’t** | can’t right now |
| **`xo`** | **Modifiable can’t** | can’t; may change (speaker change unspecified) — soft default |
| **`xu`** | **Irreversible can’t** | can’t; fixed as far as you can tell |

Endings on **`egera` + stance** are ordinary [reference-suffix](reference-suffix.md) (same as host-attached ability). Overlay mood reading usually prefers **-m** when the published sense is figurative; **-l** when you mean capacity in a literal *bowl / cereal* frame.

```
`hegeraxel.`

gloss: `h-ABIL-unable-temporary`

*Can’t right now (no single host / clause-wide).*
```

#### Ability vs values vs restrictors

| Claim | Prefer |
|-------|--------|
| Can’t / can **this** activity or property | **host + `xa` / `xe` / `xo` / `xu`** ([Beginner](#ability)) |
| Clause-wide / hostless capability | **`hegeraxa…`** / **`hegeraxe…`** / **`hegeraxo…`** / **`hegeraxu…`** (same under `/w/`) |
| Need unmet + changeability | need **`xu…`** — [values](values.md) (`hodoloxul` ≠ “can’t competence”) |
| When / never / sometime the host applies | [restrictors](restrictors.md) (`hal`, `har`, …) |

Stack when useful: e.g. can’t-sing plus unmet competence (`veguxol` + `hodoloxum`). Bare **`hal`** (*never*) is applicability, not tagged incapability. Need-root **`xu`** stays unmet need, not ability. Unspecified need **`egege`** 🥚 (*potential*) is not **`ABIL`**.

| Agelan (schematic) | Reading |
|---------------------|---------|
| `veguxel` | can’t sing **right now** |
| `veguxol` | can’t sing yet / may become able (or unknown) |
| `veguxul` | can’t sing (fixed / impossible as far as you can tell) |
| `golodoxal` | can lead (literal) |
| `veguxol hodoloxum` | can’t sing (modifiable) **and** unmet competence |
| `… hegeraxel` | can’t **right now** (no single host / clause-wide) |
| `hegeral` | ability (**topic** only) |

## Advanced
<a id="advanced"></a>

### Design notes

Unassigned or rare edges (not required for ordinary reading): scaffolding stacks on **`xa`** (assisted / instrumental); *won’t* as ability morph; whose-ability / evidentiality on the denial; positive *can* forced on every clause.

## See also

- Need unmet vs *can’t*: [values.md](values.md)
- Applicability *when* / *never*: [restrictors.md](restrictors.md)
- Mid-word **`x`** families: [x-compounds.md](x-compounds.md)

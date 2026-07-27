# Special vocabulary
<a id="special-vocabulary"></a>

This page is the source of truth for **special morphology and closed roots** that are **not** [values](values.md) (needs) and **not** [restrictors](restrictors.md) (applicability joins). They reuse the value-compound **shape** (`… x {vowel} …`) where useful, but keep their own stance inventories.

Ordinary `/h/` / `/w/` content still defaults to values unless the root is in a clearer closed subcategory (restrictors, special vocabulary here, evidentiality/mood, degree, adjuncts, numbers) — see [values.md](values.md#default-reading-of-h-and-w).

**Not here:** Claritish *worse than Average|…* benchmarks are NP comparees on comparative fences — [comparatives.md § Judgment benchmarks](comparatives.md#judgment-benchmarks).

## Ability
<a id="ability"></a>
<a id="incapability"></a>

Port of Claritish **Incapability** (`can't_t`, `impossible_i`, …): capability denials often smuggle permanence; tag **changeability** on the denial. Restrictors (`hal` = *never*, …) stay **when the host applies**, not ability speech acts — do not redefine them as *can’t*.

### Primary: host + `xa` / `xu`

When the denied (or claimed) capability **is** a single content root, compound ability onto that root — same mid-word **`x`** joiner as [values](values.md#word-shape):

```
PoS + HOST + x + {a|u} + {-l|-m|-n|-r}
```

| Piece | Role |
|-------|------|
| **PoS** | Prefer the host’s usual role — `/v/` (event), `/ɡ/` (property), etc. |
| **HOST** | Any **non-need** content root (*sing*, *lift*, *lead*, …) |
| **`xa` / `xu`** | Capable / incapable |
| **Ending** | [Changeability](#ability-changeability) only |

**Parser cue:** root ∈ [six needs](values.md#need-inventory) + `x…` → **value** tables. Other roots + **`xa` / `xu`** → **ability**. **`xe` / `xo`** on non-need hosts stay **undefined** (do not borrow motive / prescription).

**Ship first:** **`xu`** (incapability). **`xa`** when you want tagged *can*.

| Form | Reading |
|------|---------|
| `v-singxul` / `g-singxul` | can’t sing **right now** (usually able) |
| `…singxum` | can’t sing yet / may learn (or unknown) |
| `…singxun` | can’t sing — fixed / impossible as far as you can tell |
| `…singxur` | won’t sing (choice) — not can’t |
| `…singxam` | can sing; capability open to change |
| `…singxan` | can sing; claim treated as fixed |

### Fallback: closed `ABIL` root

When there is **no single host root** (complex VP, hostless *I can’t*, or ability as a floating adverb), use a closed **ability** root (lexicon form TBD; schematic `ABIL`):

```
[h|w] + ABIL + x + {a|u} + {-l|-m|-n|-r}
```

| Prefix | Scope |
|--------|--------|
| `/h/` | clause-level capability claim (floats like other `/h/`) |
| `/w/` | capability framed on the preceding `/ɡ/` |

Bare `h-ABILl` / `w-ABILl` = ability **topic** only (ordinary [reference-suffix](reference-suffix.md) for now). Prefer **host+`xu`/`xa`** whenever the activity fits one root.

### Stances

| Form | Stance | Gloss |
|------|--------|--------|
| bare host (no `x`) | ordinary word | no ability claim |
| bare **`ABIL`** (no `x`) | **Topic** | Ability named only |
| **`xa`** | **Capable** | Capability present / claimed |
| **`xu`** | **Incapable** | Capability denied — primary Claritish port |

### Endings — changeability only
<a id="ability-changeability"></a>

On ability **`xa`** and **`xu`** (host-attached or `ABIL`), **-l / -m / -n / -r** are **changeability** — the same table as unmet values ([values.md § Changeability](values.md#value-changeability)). Not contact channel, preference standing, or prescription force.

| Ending | Changeability | Claritish | Mnemonic |
|--------|---------------|-----------|----------|
| **-l** | **temporary** — usually able; not this moment | **t** | closed *right-now* snapshot |
| **-m** | **modifiable** — effort or circumstance may change it (also soft default if unknown; Claritish **`_x`** merges here) | **m** (+ **x**) | open to change |
| **-n** | **irreversible** — fixed / impossible as far as you can tell | **i** | settled / named-as-fixed |
| **-r** | **won't-now** — choice or deferral, not inability | **w** | not updating this *now* |

**Can't vs won't:** **-n** (irreversible) vs **-r** (won't-now). Do not collapse them. Always pick an ending on **`xa`** / **`xu`**; unknown → **-m**.

| Form | Reading |
|------|---------|
| `…xal` | capable, **temporary** standing of that claim |
| `…xam` | capable, **modifiable** (or unknown) |
| `…xan` | capable, **irreversible** / fixed as far as you can tell |
| `…xar` | capable, **won't-claim-now** (defer saying you can) |
| `…xul` | incapable, **temporary** |
| `…xum` | incapable, **modifiable** (or unknown) |
| `…xun` | incapable, **irreversible** |
| `…xur` | incapable, **won't-now** (choice) |

### Claritish → Clarity

| Claritish | Clarity (schematic) |
|-----------|---------------------|
| `can't_t` swim / sing | `v-swimxul` / `v-singxul` (host primary) |
| `can't_m` … | `v-HOSTxum` |
| `impossible_i` / `can't_i` … | `v-HOSTxun` |
| `can't_w` … | `v-HOSTxur` |
| `incapable_x` … | `v-HOSTxum` |
| hostless / clause-wide *can’t_t* | `h-ABILxul` |

Hosts `can't` / `cannot` / `unable` / `incapable` / `impossible` collapse to **`xu` + changeability** on the activity root when there is one; otherwise on **`ABIL`**.

### Ability vs values vs restrictors

| Claim | Prefer |
|-------|--------|
| Can’t / can **this** activity or property | **host + `xu` / `xa`** (this page) |
| Clause-wide / hostless capability | **`h-ABILxu…`** / **`w-ABILxu…`** |
| Need unmet + changeability | need **`xu…`** — [values](values.md) (`competxun` ≠ “can’t competence”) |
| When / never / sometime the host applies | [restrictors](restrictors.md) (`hal`, `har`, …) |

Stack when useful: e.g. can’t-sing plus unmet competence (`v-singxum` + `h-competxum`). Do **not** use bare **`hal`** (*never*) as a substitute for tagged incapability. Do **not** read need-root **`xu`** as ability.

### Examples

| Clarity (schematic) | Reading |
|---------------------|---------|
| `v-singxul` | can’t sing **right now** |
| `v-singxum` | can’t sing yet / may become able |
| `v-singxun` | can’t sing (fixed / impossible as far as you can tell) |
| `v-singxur` | won’t sing (choice), not can’t |
| `g-leadxam` | can lead; capability open to change |
| `v-singxum h-competxum` | can’t sing (modifiable) **and** unmet competence |
| `… h-ABILxul` | can’t **right now** (no single host / clause-wide) |
| `h-ABILl` | ability (**topic** only) |

### Out of scope (for now)

- Lexicon phonetic form of the fallback **`ABIL`** root.
- **`xe`** / **`xo`** on ability hosts (motive / prescription stay on [needs](values.md)).
- Whose-ability / evidentiality on the denial (use ordinary mood `/h/` later if needed).
- Positive *can* forced on every clause (optional **`xa`** only).

### Constraints

- Ability is **not** a need; do **not** apply contact / preference-standing / prescription-force tables to it.
- Defined ability stances are **`xa`** and **`xu`** only; endings on those compounds = **changeability** only.
- Need roots + `x…` stay [values](values.md); never reinterpret as host-ability.
- Prefer host-attached forms; use **`ABIL`** only when there is no suitable single host.
- Do **not** overload [restrictors](restrictors.md) as ability morphology.
- Plural **-sh** stays unused on `/h/` `/w/` ([plurality](plurality.md)); host **`/v/`** / **`/ɡ/`** ability compounds follow ordinary plurality rules for that PoS.

# Unassigned and reserved forms

Editor inventory of **unused slots** and **later-dimension** ideas — not learner text, not parser authority, not linked from grammar pages.

Grammar docs under `docs/grammar/` teach **defined** readings only. When a cell here gets a reading, add it to the relevant grammar page and **delete the row here**. Rejected or speculative features stay in [TODO.md](../../TODO.md) or drop entirely.

## How to use

| Action | Where |
|--------|--------|
| Assign a reading | Teach in the grammar subsystem page; remove from this inventory |
| Reject / defer a feature | [TODO.md](../../TODO.md) or delete |
| Parser / drill guard | [drill-generation.md](drill-generation.md) — do not drill unassigned cells |

## Numbers — free forms

Source: [numbers.md](../grammar/numbers.md), [numeric-derivation.md](../grammar/numeric-derivation.md)

### Mantissa `0` + named exp `0` (`…0e0`)

- **`g+0e0`**, **`v+0e0`**, **`h+0e0`**, **`y+0e0`**, ordinal **`#0e0`**, overlays, … — mantissa **`0`** + named exp **`0`**
- Grammar states **`…0e0`** is **not used**; no assigned reading yet

### Other `±0eN` / `±0e-N` for `N≠1`

- Positive **`…0eN`** and other **`±0eN`** / **`±0e-N`** bands — only **`±0e-1`** is assigned ([zero × exponent](../grammar/numbers.md#zero-exponent))

### Digit-string / marker holes

- Digit-string **`_`** zero-exp free forms
- Digit-string **`ro`** / **`_`** + mantissa + digitless exp (free number words)
- Digitless exp on **`ro`** / **`_`** (free number words) — derivation may use digitless **`_`** as [catalog topology](../grammar/numeric-derivation.md#infinite-labels)

### Overlay `/v/` / `/h/`

- **`ro`** under `/v/` / `/h/` (label marker on overlay hosts)

### Overlay `/y/` — no-mantissa digitless exp

- Beyond the defined table: **`y-e`**, **`y+e-`**, **`y_…`**, …

### Overlay `/y/` — zero-exp

- Beyond the defined zero×exp table

### Overlay `/x/`

- No-mantissa digitless-exp beyond start/last/notional: **`x+e`**, **`x-e`**, … (notional **`x-e-`** is defined)
- Digitless-exp on end-relative marker **`#-`** / **`rue`**
- Zero×exp under `/x/` (discourse nesting uses [generation](../grammar/numbers-applied.md#ordinal-generation))
- Ordinal zero×digitless under `/x/` (free twin of derivation **`ROOTl#0e`** is defined on other hosts)

### Digitless-exp / hyperbole on `#-`

- Digitless-exp and hyperbole on forward/end-relative **`#-`** / **`rue`** (combine with [digitful generation](../grammar/numbers-applied.md#ordinal-generation) when needed)

### Further `/y/` / `/x/` zero-exp cells

- **`x+0e`**, **`x±0e-1`**, **`x#0e`**, … beyond defined overlays

### Number markers on `/w/`, `/th/`, and stacks

- **`w+N`**, **`w-N`**, **`w_N`**, **`w#-N`**, **`w#1`**: `/w/` takes only the blank, *barely* / *almost*, and an ordinal place from 2 ([D-25](design-decisions.md))
- **`th-N`**, **`th#-N`**, **`th#1`**, **`th#`** digitless non-blank: `/th/` takes `+`, `_`, and `#N` from 2 ([D-26](design-decisions.md))
- Marker stacks **`rao`** (`+_`) and **`rae`** (`+#`)

### Ordinal pronoun `#0`

- **`z=#0`** / **`d=#0`** / **`b=#0`** (`zrezor`, …): introduction starts at 1, so place 0 names no one and is rejected. Not assigned as a shifting *speaker*: that would make *I* shorter than a name, against D-13 ([design-decisions](design-decisions.md)).

## Numbers — numeric derivation

Source: [numeric-derivation.md](../grammar/numeric-derivation.md)

| Shape | Note |
|-------|------|
| **`ROOTl+e0`** | Kind twin of free ones-band **`g+e0`** |
| **`ROOTl+0e0`** | Kind twin of free **`…0e0`** |
| **`ROOTl+Ne0`** | Kind twin of free scale-assert **`Ne0`** |
| **`ROOTl#0e0`** / free **`#0e0`** | Ordinal morph |
| **`ROOTl±0eN`** for **`N≠1`** | Only **`±0e-1`** assigned |
| **`ROOTl-e-0`** | Undefined — use **`ROOTl-0`** (anti-null) or **`ROOTl-0e-`** (micro-residue) |
| **`ROOTl-e-3`…`-e-9`** | Out of quasi morph set — prefer bare **`ROOTl-e-`** or ordinary wording |

## Restrictors (`/h/` / `/w/`)

Source: [restrictors.md](../grammar/restrictors.md)

Spellings under `/h/` / `/w/` that share the join series but have **no circumstance reading** yet:

### Bare (no conjunct)

- **`hol` / `hom`**, **`haol` / `haom`**, **`hul` / `hum`**, **`huol` / `huom`**
- **`hel` / `hem`**, **`hoel` / `hoem`**
- Beyond **`wal` / `wam` / `wual` / `wuam` / `war` / `wor` / `wur`** and the non-bare Intermediate core, further `/w/` bare forms

### Ranked / unspecified (no reading)

- **`her` / `wer`** (any arity) — declined (D-27): no English job; one restrictor chain is one unit, so **`hel`** and **`har`** cannot combine either
- Other stacked or rare parallels not in the Intermediate core tables

### `-n` under `/w/`

- `/w/`…**-n** and **`wazem`** before **-r** / **-n** — reserved, no gloss (`/h/`…**-n** = [join-relations](../grammar/join-across-roles.md#join-relations), not restrictors)

### Join leftovers

Under `/h/` / `/w/`, join spellings beyond the [defined restrictor core](../grammar/restrictors.md#defined-core-full) and beyond [join-relations](../grammar/join-across-roles.md#join-relations) on `/h/`…**-n** — reserved slot, no gloss. See also [phrase join inventory](../grammar/joins.md#phrase-reserved-forms).

## Stance joins (`/th/`)

Source: [join-across-roles.md](../grammar/join-across-roles.md#stance-joins)

- **`/th/`…-n** — reserved; no join-relation or sequence reading
- Stacked **-r** outside a question (`thaor` … `thuer` are fill-asks only); stacked **-r** on `/z/` `/d/` `/b/` `/v/` `/x/` `/ɡ/` joins (`zuar`, `vaor`, `xuar`, `gaor`) — the parser rejects them
- Clause sequence **-n** beyond `xan` `xon` `xun` `xaon` (`xuan`, `xuon`, `xen`, `xaen`, `xoen`, `xuen`)

## Hosted relations

Source: [relations.md](../grammar/relations.md)

- A relation root on `/w/` with `/b/` (`wumum bazawan`) — only the as-of pair (`wuhum` / `wuram`) takes `/b/` on `/w/`
- A social tie on `/h/` (`hemezem bazawan`) — the tie on the doer already says *as a friend of* (D-30)

## Hooks — in-clause

Source: [hooks.md](../grammar/hooks.md#spans)

- In-clause **`ao`** / **`ae`** / **`uo`** (`aol` / `ael` / `uol` and **-m** / **-n**) between same-role words — no reading; the parser rejects them (extra-noun and discourse uses unaffected)
- Stacked hook **-r** outside a span (no same-role word on both sides) — not permitted; **`aor`** / **`aer`** / **`uor`** are not words
- Discourse **`oel`** / **`ual`** / **`uol`** / **`uel`** (and **-m** / **-n**) at the front of a sentence — no reading; the parser rejects them

## Role compounds

Source: [roles.md](../grammar/roles.md), [x-compounds.md](../grammar/x-compounds.md)

| Slot | Status |
|------|--------|
| PoS `/v/` / `/h/` / `/w/` on role compounds | Undefined — prefer `/z/` `/d/` `/b/`; `/ɡ/` optional |
| [Role pointers](../grammar/pronouns.md#role-pointers) on `/v/` / `/ɡ/` / `/h/` / `/w/` / `/y/` / `/x/` | Undefined (rejected by the parser; D-24) — for *does so* / *such*, use whole-stem **-r**; to call or return to someone, name the stem |
| Pointer vowel **`u`** | Not a pointer: after one role vowel, vowel **`x`** **`u`** + **-r** is a [span resume](../grammar/spans.md#endings) |

## Pronouns and plurality

Source: [pronouns.md](../grammar/pronouns.md), [plurality.md](../grammar/plurality.md); D-24 in [design-decisions](design-decisions.md)

- Ordinal pronouns on `/y/` (`yredur`): rejected; call by name.
- **-x** on `/h/` / `/w/` / `/th/` and the six linkers, and on `unan` (use `obelx` for *some people*).
- Topic words `xunan`, `xozan`, `xozar`, and the resume `zozar`.

## Identity (`SAME`)

Source: [predication.md](../grammar/predication.md)

| Slot | Status |
|------|--------|
| **`gugon`** / **`gugor`** (SAME with **-n** / **-r**) | Undefined — only **-l** / **-m** are taught |

## Closed-root endings

Source: [causation.md](../grammar/causation.md#poles), [relations.md](../grammar/relations.md), [dependents.md](../grammar/dependents.md#dependent-clauses). Cells with a candidate reading are logged in [extension-results](extension-results.md), not here.

- Clause-pole **-r** as a grade on *iff* (`eda`), *although* (`ezo`), *while* (`uwe`), *before* (`aba`), *after* (`enu`), *until* / *by* (`oma`), and the result pole (`odu`): no reading (the ordinary resume reading stays)
- Clause-pole **-l** beyond *because* (`thevel`) and *by* (`omal`), other than *if*: no reading
- **-l** on exchange (`ehe`), proxy (`ade`), the of-relations, the locatives, stimulus (`obu`), and *respectively* (`aze`): no reading (**-r** is the ordinary resume)

## Stand-ins

Source: [dependents.md](../grammar/dependents.md#stand-in)

- Forward, back and named stand-ins (`-rl` `-rm` `-rth` `-rn`) on `/ɡ/` `/h/` `/w/` `/th/` and on `/x/` `/y/`: no reading (the parser rejects them on `/ɡ/` `/h/` `/w/` `/th/`)
- Stacked-vowel stand-ins (`daerl`, `duarl`): a stacked join, not a stand-in
- **-x** on a stand-in

## Sentence linkers (`/x/`)

Source: [dependents.md](../grammar/dependents.md#sentence-linkers)

- A linker stacked with a topic word in one sentence (`xezom xazawan …`): no reading (two sentences)
- Firm **-l** on *meanwhile* (`xagagal`), *next* (`xevavel`), and *by the way* (`xavazel`): no reading (the parser rejects them)

## Turn words (`/y/`)

Source: [speech-moves.md](../grammar/speech-moves.md#speech-act), [questions.md](../grammar/questions.md#polar-endings)

- Act and polar series with **-n** (`yan` / `yon` / `yen` / `yun`, `yaen` / …): no reading. On `/y/`, **-n** calls someone, and there is no named-formula interjection.
- A blank in the `/y/` slot (`yar` / `yor` / `yer` / `yur`): a stacked act word, rejected.
- Ask tags with a polar word other than `yael` / `yaem` (`yol yuel`, `yol yaol`, `yol yaer`, …): no reading (D-31).
- A polar word before an act word, or two polar words in a row (`yael yal`, `yael yuel`): the parser rejects them; an answer and a question are two turns.

## Spans

Source: [spans.md](../grammar/spans.md), [x-compounds.md](../grammar/x-compounds.md)

- EDGE + **-r** combinations other than EDGE **`u`** (anaphor **-r** always uses EDGE **`u`** in the spoken template; other EDGE + **-r** silhouettes are ordinary compounds, not span opens)
- An aside open under any role but `/th/` (`dexal`, `d(…)`); a cite, mention or opaque open under `/th/` (`th[…]`, `thaxol`); any span open under `/w/`. The parser rejects them (`spanSlot`); an aside **resume** (`dexur`) may still recast the aside. An `/x/` cite, mention or opaque is a topic word (`x@[onodan alahen]`, `x{odoga}`, `x@<Sam>`)
- Unassigned **`VOWEL x VOWEL`** silhouettes that are not taught span opens/closes — including **`xuxun`** (`/x/` + **`u` × `u`** + proper **-n**) — ordinary compounds / [phrasal names](../grammar/word-endings.md#phrasal-proper-names), not fences

## Values — later dimensions

Source: [sakes.md](../grammar/sakes.md)

- Whose-sake / care direction on prescription
- Forced listener / third-person possessives on sake ascription (speaker `/ɡ/` default is [personal possession](../grammar/sakes.md#personal-possession); unowned is **`gobum`**)

### Near-miss inventory (editor)

| Job | Where taught |
|-----|----------------|
| Emotion compose | [sakes.md § Emotion compose](../grammar/sakes.md#emotion-compose) |
| MAY | [knowing.md § MAY](../grammar/knowing.md#may) — **`ovu`** + find out / default / who knows |
| NOTIONAL | [knowing.md § Notional](../grammar/knowing.md#notional) — **`avo`** |
| RESIDUE / FORMER | [knowing.md § Residue](../grammar/knowing.md#residue) — **`amo`** / **`eno`** |
| DECISION | [intention.md § Decision](../grammar/intention.md#decision) — **`ehu`** |
| PLAN | [intention.md § Plan](../grammar/intention.md#plan-predict) — **`ama`** |

## Role-letter structure

Source: [clause.md](../grammar/clause.md)

- Lean **`l`** on any role letter but `/ɡ/`: `zl-` / `dl-` / `bl-` / `vl-` / `hl-` / `thl-` / `wl-` (`/z/`, `/d/`, `/b/` modifiers use mid-word **`x`**; a verb root before the noun uses `gl-`; `/h/` and `/th/` already go anywhere; `/w/` already sits before its host)
- `/w/` before `/z/`, `/d/`, `/b/`, or `/v/` (degree on a noun goes through an adjective; degree on a verb goes through a degree word before a manner adverb)
- A hosted `/b/` after `/z/`, `/d/`, `/v/`, or `/w/` (that `/b/` reads as the unhosted recipient)

## Vowel series

Source: [speech-moves.md](../grammar/speech-moves.md), [questions.md](../grammar/questions.md#polar-endings), [intention.md](../grammar/intention.md#ability)

- Polar `oe` (`yoel` / `yoem`): no reading
- Stacked vowels after ability **x** (`xua`, …) and after sake / scope **th**: no reading (the parser rejects them)

## Tone marks

Source: [speech-moves.md](../grammar/speech-moves.md#tone-marks)

- `~` is taken (opaque marker); stacks other than `?!` are not marks

## Phonology

Source: [phonology.md](../grammar/phonology.md)

- Unused potential onset clusters (not part of the language): *gw*, *vw*, *xw*, *bl* (*bl* should not mean left-aligned *b*)

## Related meta

| Page | Role |
|------|------|
| [grammar-docs.md](grammar-docs.md) | Grammar prose — unused slots do not earn a stage |
| [design-decisions.md](design-decisions.md) | Settled readings and deliberate omissions; this page is unused **forms** |
| [drill-generation.md](drill-generation.md) | Do not drill cells listed here |
| [TODO.md](../../TODO.md) | Rejected / speculative features, open lexicon |

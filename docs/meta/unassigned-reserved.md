# Unassigned and reserved forms

Editor inventory of **spellings with no reading**. Not learner text, not parser authority, and not linked from grammar pages. This page answers **is this spelling taken?** The reasons behind closed rows live in [design-decisions.md](design-decisions.md).

Each entry has a status:

- **open:** nothing in the design stands against a reading. None is natural yet: any reading would be forced, would only repeat another route, or there is no English job for it. The parser may still reject the form. The short note says what a reading would have to beat.
- **closed (D-nn, or a named design-decisions section):** a reading would cost something (a collision with a live reading, a broken invariant, the project's aims). That entry says what.

Grammar docs under `docs/grammar/` teach **defined** readings only. A spelling that already has a reading does not belong here.

## How to use

| Action | Where |
|--------|--------|
| Assign a reading to an **open** cell | Teach it in the grammar subsystem page; delete the entry here |
| Close a cell for a reason | Add the reason to [design-decisions.md](design-decisions.md); mark the entry **closed** with the D-id |
| Reopen a **closed** cell | Retire or narrow the D-row first |
| Defer a speculative feature | [TODO.md](../../TODO.md) |
| Parser / drill guard | [drill-generation.md](drill-generation.md): do not drill cells listed here |

Number holes below are all **open**.

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

- **open:** **`w+N`**, **`w-N`**, **`w_N`** (a count or fraction on `/w/`). A factor is `hradul` / `hrudul` on `/h/` ([factor](../grammar/comparatives.md#factor)).
- **open:** **`w#-N`**, **`w#1`**, and `w#N` outside a single-name `zel` / `zuel` frame. First place is the plain superlative, *second from the bottom* is `zuel` + `w#2`, and `w#N` needs one name before the fence to rank within.
- **open:** **`th-N`**, **`th#-N`**, **`th#1`**, and digitless non-blank **`th#`**. First-hand is a channel word; a minus or end-relative rank on a stance has no guessable reading.
- **open:** marker stacks **`rao`** (`+_`) and **`rae`** (`+#`). Labels carry no sign, and a count and a rank are separate markers on separate words.

### Ordinal pronoun `#0`

- **open:** **`z=#0`** / **`d=#0`** / **`b=#0`** (`zrezor`, …). Introduction starts at 1, so place 0 names no one; the parser rejects it. The one obvious candidate, a shifting *speaker*, is **closed (D-13)**.

## Numbers — numeric derivation

Source: [numeric-derivation.md](../grammar/numeric-derivation.md). All **open**.

| Shape | Note |
|-------|------|
| **`ROOTl+e0`** | Kind twin of free ones-band **`g+e0`** |
| **`ROOTl+0e0`** | Kind twin of free **`…0e0`** |
| **`ROOTl+Ne0`** | Kind twin of free scale-assert **`Ne0`** |
| **`ROOTl#0e0`** / free **`#0e0`** | Ordinal morph |
| **`ROOTl±0eN`** for **`N≠1`** | Only **`±0e-1`** assigned |
| **`ROOTl-e-0`** | Undefined: use **`ROOTl-0`** (anti-null) or **`ROOTl-0e-`** (micro-residue) |
| **`ROOTl-e-3`…`-e-9`** | Out of the quasi morph set: prefer bare **`ROOTl-e-`** or ordinary wording |

## Restrictors (`/h/` / `/w/`)

Source: [restrictors.md](../grammar/restrictors.md)

- **open:** bare restrictors beyond `hal` / `hual` / `har` / `hor` / `hur`: **`hol` / `hom`**, **`haol` / `haom`**, **`hul` / `hum`**, **`huol` / `huom`**, **`hel` / `hem`**, **`hoel` / `hoem`**. With no occasions their only readings are *never* / *always*, which `hal` / `hual` already own (`hul` would equal `hual`, `huol` would equal `hor`).
- **open:** further `/w/` bare forms beyond **`wal` / `wam` / `wual` / `wuam` / `war` / `wor` / `wur`** and the non-bare Intermediate core.
- **open:** **`her` / `wer`** (unspecified ranked occasion, any arity). No English job; regularity only. One restrictor chain is one unit, so **`hel`** and **`har`** cannot combine either.
- **open:** **-n** on `/w/` (`wan`, …). `/w/` is never a phrase-list item, so there is no package to name. (`/h/`…**-n** is [join-relations](../grammar/join-across-roles.md#join-relations).)
- **open:** **`wazem`** before **-r** / **-n**. *Respectively something* has no reading.
- **open:** other join spellings under `/h/` / `/w/` beyond the [defined restrictor core](../grammar/restrictors.md#defined-core-full) and the join-relations. See also [phrase join inventory](../grammar/joins.md#phrase-reserved-forms).

## Joins

Source: [joins.md](../grammar/joins.md), [join-across-roles.md](../grammar/join-across-roles.md#stance-joins)

- **open:** **`/th/`…-n**: no join-relation or sequence reading.
- **open:** stacked **-r** outside a question on `/th/` (`thaor` … `thuer` are fill-asks only), and on `/z/` `/d/` `/b/` `/v/` `/x/` `/ɡ/` joins (`zuar`, `vaor`, `xuar`, `gaor`). No question wants a stacked blank. Parser: `stackedJoinResume`.
- **open:** clause sequence **-n** beyond `xan` `xon` `xun` `xaon` (`xuan`, `xuon`, `xen`, `xaen`, `xoen`, `xuen`). A sequence is already ordered, so an order vowel adds nothing; *first of all* and *finally* are `xrebul` / `xrebal`. `xen` is also a departure mark after a name.
- **open:** a single-item clause join (`A xul` *not the case that A*, `A xal` *only A happened*). Clause `/x/` joins go between clauses. Deny or focus on the verb or noun (`vowogal vul`, `zazawan zal`), or use stand-in items (`A xol xal` *optionally A*, `xual ul A`).
- **open:** a rank or sequence join (`e` / `ue` / `oe`) with a number as a threshold, and a SHARED continuum word. Ranges use hooks and [rays](../grammar/numbers-applied.md#rays).

## Comparison bars

Source: [comparatives.md](../grammar/comparatives.md#bars)

- **open:** a stance that sets no value as a bar: clause poles, MAY, MIRATIVE, DECISION, ATTEMPT, RESIDUE, CAUSE, and the deontic noes (FORBID, refused consent). A decision or an attempt commits to an act and sets no level; a ban and a refusal are the other side of PERMIT and CONSENT. *Than decided* is PLAN. Parser: `barKind`.
- **open:** a second comparee next to a bar (`barCount`).

## Hosted relations

Source: [relations.md](../grammar/relations.md)

- **open:** a relation root on `/w/` with `/b/` (`wumum bazawan`). Only the as-of pair (`wuhum` / `wuram`) takes `/b/` on `/w/`.
- **open:** a social tie on `/h/` (`hemezem bazawan`). The tie on the doer already says *as a friend of* (`zalahen gemezem bazawan vowogal`).

## Hooks — in-clause

Source: [hooks.md](../grammar/hooks.md#spans), [sakes.md](../grammar/sakes.md#contrary-to-stance)

- **open:** in-clause **`ao`** / **`ae`** / **`uo`** (`aol` / `ael` / `uol` and **-m** / **-n**) between same-role words, including same-role `aol` *namely* (`el` or an aside covers it). The parser rejects them; extra-noun and discourse uses are unaffected.
- **open:** stacked point-back **-r** (`aor` *on it*, `aer`, `uor`). A hook + resumed `/b/` already says it. (`oer` / `uar` / `uer` are the span fill-ask.)
- **open:** discourse **`oel`** / **`ual`** / **`uol`** / **`uel`** (and **-m** / **-n**) at the front of a sentence, and a discourse *Alternatively* or *Apart from that*. Each guess already has a route (`am` *such as*, `zem` *especially*, the linkers, `xom` / `xaom`, `al …` / `ur …`). The parser rejects them.
- **open:** a hook + `barl` other than `ul` (`hookStandIn`). *Contrary to* an event is `hezom barl`; no job turned up for `uem barl`.
- **open:** `uem` before a stance with no content an event can contradict (`frameKind`): PERMIT, given CONSENT (they only lift a restriction), MIRATIVE (it already says *against expectation*), MAY, NOTIONAL (held by no one as true; use FELT), RESIDUE, FORMER (use a PATTERN frame for *unlike before*), sake words (*against Alahen's interest* is `thegathum balahen`), clause poles, CAUSE, ATTEMPT, ability, and stance numbers.

## Role compounds

Source: [roles.md](../grammar/roles.md), [x-compounds.md](../grammar/x-compounds.md)

- **open:** a role compound on `/v/` / `/w/` / `/th/`. A role compound names a participant, so it fills `/z/` `/d/` `/b/` `/ɡ/`, sets a topic under `/x/`, and calls under `/y/`. Parser: `roleCompoundSlot`.
- **closed (D-34):** a role compound on `/h/`.
- **open:** a role compound as a piece of an ordinary compound, or two role vowels in a word. *Noun + agent* is the role compound's stem (`zaxodogaxowogal`).
- **open:** a special pronoun (root + **-n**) as a role-compound stem or a label-scope host (`zaxamagon`, `zamagothan`). It is neither an event nor a label. Parser: `roleCompoundStem`, `labelScopeStem`.
- **open:** ability (`x` + vowel) on a `/z/` / `/d/` / `/b/` noun, a name, a pronoun, or `/h/` (`zodogaxal`). Ability is on `/v/` and `/ɡ/` (plus hostless `eze`). Parser: `abilitySlot`.
- **open:** name + `x` + vowel + **-n** in a clause body (`zalahen zazawaxon varahal.`). That shape is a conversation-length bid only as a citation or a `/y/` call.

## Role pointers

Source: [pronouns.md](../grammar/pronouns.md#role-pointers)

- **open:** a role pointer on `/v/` / `/ɡ/` / `/h/` / `/w/` (`vaxar`). A pointer picks a participant; *does so* and *such* are whole-stem **-r**. Parser: `pointerSlot`.
- **closed (D-24):** a role pointer on `/y/` / `/x/`.
- **open:** *the other one* (`o`) on the scene (`zexor`, `zexol`, `zexom`). The scene's overt filler is not settled for comparison. Parser: `pointerOtherRole`.
- **open:** a new-one pointer (**-l**) with pointer vowel `u`, or after a special, topic or generic pronoun (`zaxul`). A new-one pointer copies a kind, and an unsaid filler or a conversation role has none. Parser: `pointerNewUnsaid`, `pointerNewSpecial`.
- **open:** a share (**-m**) with pointer vowel `e` or with **-x** (`zaxem`, `zaxamx`). A share is a part of an event, so it names no group and cannot be the very event it describes. Parser: `pointerShareSelf`, `pointerSharePlural`.
- **open:** a share or new-one pointer in a holder seam.
- **open:** a role pointer as a viewpoint lateral's facing anchor (`gewezathaxar`). Name the anchor by its stem or a resume (`gewezathazawar`).

## Pronouns and plurality

Source: [pronouns.md](../grammar/pronouns.md), [plurality.md](../grammar/plurality.md)

- **closed (D-24):** an ordinal pronoun on `/y/` (`yredur`).
- **open:** **-x** on `/h/` / `/w/` / `/th/` and the six linkers. A plural adverb, degree, stance or linker has no reading; stances belong to holders, who take **-x**.
- **open:** **-x** on an interjection (`/y/` **-l** / **-m**). An interjection addresses no one.
- **open:** the nonspecific *someone* `unan` as a topic or with **-x** (`xunan`, `unanx`). `unan` names no group, so *some people* is `obelx`.
- **open:** the topic pronoun as a topic word or a resume (`xozan`, `zozar`). The topic pronoun is the topic itself.

## Identity (`SAME`)

Source: [predication.md](../grammar/predication.md)

- **closed (D-33):** `gugon` / `gugor` as identity.
- **open:** **-x** on `gugol`.
- **open:** a `/z/` or `/d/` as the second identity label. The label is a `/b/`.
- **closed (D-33):** a bare `/ɡ/` right after the verb (depictive / resultative).

## Closed-root endings

Source: [causation.md](../grammar/causation.md#poles), [relations.md](../grammar/relations.md), [dependents.md](../grammar/dependents.md#dependent-clauses), [knowing.md](../grammar/knowing.md#residue)

An **-r** grade on a closed root without its own **-r** would take away the live whole-stem resume ([design-decisions § Closed-root endings](design-decisions.md#closed-root-endings)). **-l** has two competing guesses (strongest, or broke a norm, as on *because*), so a family with neither has no guessable **-l**.

- **closed (closed-root -r):** clause-pole **-r** as a grade on *iff* (`eda`), *although* (`ezo`), *while* (`uwe`), *before* (`aba`), *after* (`enu`), *until* / *by* (`oma`), and the result pole (`odu`).
- **closed (closed-root -r):** clause-pole **-r** as *one of several* on *if* (`thoyer`), *only if* (`tholur`) and *so that* (`hogor`). The resume is the only route to *in that case* (`thoyer`); *partly because* is `thever`.
- **closed (closed-root -r):** CAUSE **-r** as *one contributing push* (`theger`); RESIDUE and FORMER **-r** as *for now* (`thamor`, `thenor`); similative **-r** as *a bit like* (`humur`, `gumur`).
- **open:** clause-pole **-l** beyond *because* (`thevel`) and *by* (`omal`). *If* **-l** as *by rule* (`thoyel`): only *because* uses **-l** for a norm, and `thoyem` plus a deontic already says it.
- **open:** CAUSE **-l** as *compel* (`thegel`). **-l** is not guessable here, and refused consent plus CAUSE ([consent](../grammar/sakes.md#consent)) already names whose will was overridden.
- **open:** RESIDUE and FORMER **-l** as *for good* (`thamol`, `thenol`); a phasal adverb already says it.
- **open:** similative **-l** as *exactly like* (`humul`, `gumul`).
- **open:** **-l** on exchange (`ehe`), proxy (`ade`), the of-relations, the locatives, stimulus (`obu`), and *respectively* (`aze`).

## Stand-ins and dependents

Source: [dependents.md](../grammar/dependents.md#stand-in)

- **closed (D-32):** a stand-in on `/ɡ/` (`garl`).
- **open:** forward, back and named stand-ins (`-rl` `-rm` `-rth` `-rn`) on `/h/` `/w/` `/th/` (`garth`, `harth`, `tharn`) and on `/x/` `/y/`. *Such* is whole-stem **-r** and *like that* is `humum barth`. Parser: `standInRole`.
- **open:** **-x** on a stand-in.
- **open:** a stance-only dependent (`dependentStanceOnly`): the sentence after a stand-in needs a noun or a verb, except a lone sake word. `hezom barl thedel` adds nothing over `uem thedel`.

## Sentence linkers (`/x/`)

Source: [dependents.md](../grammar/dependents.md#sentence-linkers)

- **closed (D-32):** a linker and a topic word in one sentence (`xezom xazawan …`).
- **open:** firm **-l** on *meanwhile* (`xagagal`), *next* (`xevavel`), and *by the way* (`xavazel`). The parser rejects them.

## Turn words (`/y/`)

Source: [speech-moves.md](../grammar/speech-moves.md#speech-act), [questions.md](../grammar/questions.md#polar-endings)

- **closed (closed-root endings):** act and polar series with **-n** (`yan` / `yon` / `yen` / `yun`, `yaen` / …). On `/y/`, **-n** calls someone.
- **open:** a blank in the `/y/` slot (`yar` / `yor` / `yer` / `yur`): a stacked act word.
- **open:** ask tags with a polar word other than `yael` / `yaem` (`yol yuel`, `yol yaol`, `yol yaer`, …). `yol yael` is the one confirm tag, and the English *no?* tag is the same job.
- **closed (D-31):** a polar word before an act word, or two polar words in a row; a topic-only question.
- **open:** a mention or an aside under `/y/` (`ySpanType`). A mention talks about a word and an aside comments on the sentence, so neither calls nor reacts.

## Spans

Source: [spans.md](../grammar/spans.md)

- **open:** an aside under any role but `/th/` (`d(…)`); a cite, opaque or mention under `/th/` (`th[…]`). Parser: `spanSlot`.
- **closed (D-28):** any span under `/w/`.
- **open:** a span resume (`d[=]`). A span is an ordinary noun for role pointers (`duxar`).
- **open:** a resume pronoun for a span in a `/v/` slot (`v[vazadal]`).

## Values and sakes

Source: [sakes.md](../grammar/sakes.md)

- **open:** forced listener / third-person possessives on sake ascription. The speaker `/ɡ/` default is [personal possession](../grammar/sakes.md#personal-possession); unowned is **`gobum`**.
- **open:** a sake word on `/z/` `/d/` `/b/` `/v/` `/h/` `/x/` `/y/` (`sakeSlot`). *Walks healthily* is the clause stance (`thoyutham`).
- **open:** prescription **`the`** on a noun (`ganathel`, `wanathel gobum`). Its endings are the warrant for a move, and a noun is not a move; what a noun is for is **`tho`** (`ganathom`).
- **closed (D-36):** **-n** on a sake word.
- **open:** a `/b/` after an INTERNAL or UNPLACED feeling (`wanathumal gobum balahen`). A placement locus has no landmark; someone else's stake is ON-BEHALF (`e`) or a holder.

## Role-letter structure

Source: [clause.md](../grammar/clause.md)

- **open:** lean **`l`** on any role letter but `/ɡ/`: `zl-` / `dl-` / `bl-` / `vl-` / `hl-` / `thl-` / `wl-`. A noun modifying a noun is mid-word **`x`** ([x-compounds](../grammar/x-compounds.md#ordinary-compound-order)); a verb root in `gl-` or on `/ɡ/` is the participle; `/h/` and `/th/` already go anywhere; `/w/` already sits before its host.
- **open:** `/w/` before `/z/`, `/d/`, `/b/`, or `/v/`. Degree on a noun goes through an adjective; degree on a verb is a degree word before a manner adverb.
- **closed (D-22):** a hosted `/b/` after `/z/`, `/d/`, `/v/`, or `/w/`.

## Vowel series and tone marks

Source: [speech-moves.md](../grammar/speech-moves.md#tone-marks), [intention.md](../grammar/intention.md#ability)

- **open:** stacked vowels after ability **x** (`xua`, …) and after sake / scope **th**. *It depends* is MAY or a sentence (polar `oe` is *decline to answer*); *can again* is `xa` plus a sentence. The parser rejects them.
- **open:** a new tone mark (whisper, sarcasm, …). `;` `%` `?` already cover quiet, sarcasm and hesitation.
- **closed (D-23):** `~` as a tone mark, and stacks other than `?!`.

## Phonology

Source: [phonology.md](../grammar/phonology.md)

- **open:** unused onset clusters *gw*, *vw*, *xw*, *bl* (*bl* should not mean left-aligned *b*).

## Related meta

| Page | Role |
|------|------|
| [design-decisions.md](design-decisions.md) | Why a cell is closed; rejected alternatives; settled readings not yet taught |
| [grammar-docs.md](grammar-docs.md) | Grammar prose: unused slots do not earn a stage |
| [drill-generation.md](drill-generation.md) | Do not drill cells listed here |
| [TODO.md](../../TODO.md) | Speculative features, open lexicon |

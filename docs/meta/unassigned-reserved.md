# Unassigned and reserved forms

Editor inventory of **spellings with no reading**. Not learner text, not parser authority, and not linked from grammar pages. This page answers **is this spelling taken?** The reasons behind closed rows live in [design-decisions.md](design-decisions.md).

Each entry has a status:

- **open:** nothing in the design stands against a reading, but none is natural yet: no English job asks for it, the guesses compete, or no learner would reach for the form. The parser may still reject the form. The short note says why it stays open.
- **closed (D-nn, or a named design-decisions section):** a reading would cost something (a collision with a live reading, a broken invariant, the project's aims). That entry says what.

Repeating another route is never a reason to keep a form out. When a spelling has an intuitive reading that would arise naturally, assign it even if another form already says the same thing, and close it only for a cost ([two ways to say one thing](design-decisions.md)).

Grammar docs under `docs/grammar/` teach **defined** readings only. A spelling that already has a reading does not belong here.

## How to use

| Action | Where |
|--------|--------|
| Assign a reading to an **open** cell | Teach it in the grammar subsystem page; delete the entry here |
| Close a cell for a reason | Add the reason to [design-decisions.md](design-decisions.md); mark the entry **closed** with the D-id |
| Reopen a **closed** cell | Retire or narrow the D-row first |
| Defer a speculative feature | [TODO.md](../../TODO.md) |
| Parser / drill guard | [drill-generation.md](drill-generation.md): do not drill cells listed here |

Number cells are **open** unless marked **closed**. Most extend advanced forms, and no learner job has asked for them.

## Numbers — free forms

Source: [numbers.md](../grammar/numbers.md), [numeric-derivation.md](../grammar/numeric-derivation.md)

### Mantissa `0` + named exp `0` (`…0e0`)

- **`g+0e0`**, **`v+0e0`**, **`h+0e0`**, **`y+0e0`**, ordinal **`#0e0`**, overlays, …: mantissa **`0`** + named exp **`0`**. Zero is zero at every magnitude, so asserting the ones place on it changes nothing.

### Other `±0eN` / `±0e-N` for `N≠1`

- Positive **`…0eN`** and other **`±0eN`** / **`±0e-N`** bands. Only **`±0e-1`** is assigned ([zero × exponent](../grammar/numbers.md#zero-exponent)); no job has asked for a wipe or residue at another named scale.

### Digit-string / marker holes

- Digit-string **`_`** zero-exp free forms
- Digit-string **`ro`** / **`_`** + mantissa + digitless exp (free number words)
- Digitless exp on **`ro`** / **`_`** (free number words). Derivation uses digitless **`_`** as [catalog topology](../grammar/numeric-derivation.md#infinite-labels).

A label is a code, not an amount, so it has no magnitude for an exponent to scale or a zero to wipe.

### Overlay `/y/` — no-mantissa digitless exp

- Beyond the defined table: **`y-e`**, **`y+e-`**, **`y_…`**, … No cheer has needed them. The nearest is **`y+e-`** *just made it!*, the mirror of **`y-e-`** *so close!*

### Overlay `/y/` — zero-exp

- Beyond the defined zero×exp table (**`y-0e-`**, **`y_0e`**, …): no cheer job.

### Overlay `/x/`

- No-mantissa digitless-exp beyond start / last / *just before that*: **`x+e`**, **`x-e`**, … (**`x-e-`** *just before that:* is defined). No discourse job for an unbounded list item.
- Digitless-exp on end-relative marker **`#-`** / **`rue`**. Counting from the end has no far landmark of its own: the two ends are **`#e`** and **`#e-`**.
- Zero×exp under `/x/` (**`x+0e`**, **`x±0e-1`**, …). No discourse job; discourse nesting uses [generation](../grammar/numbers-applied.md#ordinal-generation).
- Ordinal zero×digitless under `/x/` (**`x#0e`**, *struck point*; its twins on other hosts are defined). No list has needed a struck item: a dropped point is `ur …`.

### Digitless-exp / hyperbole on `#-`

- Digitless-exp and hyperbole on forward/end-relative **`#-`** / **`rue`** (combine with [digitful generation](../grammar/numbers-applied.md#ordinal-generation) when needed). Counting from the end flips which landmark the joke points at, so no reading is guessable.

### Number markers on `/w/`, `/th/`, and stacks

- **open:** **`w+N`**, **`w-N`**, **`w_N`** (a count or fraction on `/w/`). Not guessable: before an adjective a count could be a ratio (*twice as big*) or a difference (*bigger by two*). A factor is `hradul` / `hrudul` on `/h/` ([factor](../grammar/comparatives.md#factor)).
- **open:** **`w#-N`**, **`w#1`**, and `w#N` outside a single-name `zel` / `zuel` frame. No learner reaches for them: English never says *the first biggest* (first place is the plain superlative) or counts a scale *from the end* (*second smallest* is `zuel` + `w#2`), and `w#N` needs one name before the fence to rank within.
- **closed (D-38):** **`th#1`** as *first-hand*.
- **closed (D-41):** **`th#N`** in a clause with LIVE or MEMORY (`thodom thredul`).
- **open:** **`th#N`** after INTUITION (`thahom thredul`). A gut sense is your own, and no learner has a *second-hand gut feeling* to say.
- **open:** **`th-N`**, **`th#-N`**, and digitless non-blank **`th#`**. A minus on a likelihood (`th-30`: *30% unlikely*, or *30 points less likely*?) and an end-relative count of tellers have no guessable reading; digitless **`th#`** would say only *passed on to me*, with no depth, and no job has asked for that.
- **open:** marker stacks **`rao`** (`+_`) and **`rae`** (`+#`). No reading composes: labels carry no sign, and a count and a rank are separate markers on separate words.

## Numbers — numeric derivation

Source: [numeric-derivation.md](../grammar/numeric-derivation.md). All **open**.

| Shape | Note |
|-------|------|
| **`ROOTl+e0`** | Kind twin of free ones-band **`g+e0`**: a kind has no ones band |
| **`ROOTl+0e0`** | Kind twin of free **`…0e0`**: zero at any magnitude is zero |
| **`ROOTl+Ne0`** | Kind twin of free scale-assert **`Ne0`**: a kind morph has no ambient magnitude to break out of |
| **`ROOTl#0e0`** / free **`#0e0`** | Ordinal morph: no job |
| **`ROOTl±0eN`** for **`N≠1`** | Only **`±0e-1`** assigned; no job for a wipe at another scale |
| **`ROOTl-e-0`** | Two guesses compete: anti-null (**`ROOTl-0`**) and micro-residue (**`ROOTl-0e-`**) |
| **`ROOTl-e-3`…`-e-9`** | No job: *quasi-* with a part count past two (*as-if three-part*) has not come up; bare **`ROOTl-e-`** or ordinary wording covers it |

## Restrictors (`/h/` / `/w/`)

Source: [restrictors.md](../grammar/restrictors.md)

- **open:** bare restrictors beyond `hal` / `hual` / `har` / `hor` / `hur` / `her`: **`hol` / `hom`**, **`haol` / `haom`**, **`hul` / `hum`**, **`huol` / `huom`**, **`hel` / `hem`**, **`hael` / `haem`**. With no occasions two readings compete: the restrictor's empty list (*never* / *always*) and the matching standalone join (`zol` *no options*, `zaol` *nothing more needed*, `zuol` *anything goes*, `zel` *no favorite*, `zael` *in no particular order*), so none is guessable.
- **open:** further `/w/` bare forms beyond **`wal` / `wam` / `wual` / `wuam` / `war` / `wor` / `wur` / `wer`** and the non-bare Intermediate core: the same competing readings.
- **open:** **-n** on `/w/` (`wan`, …). `/w/` is never a phrase-list item, so there is no package to name. (`/h/`…**-n** is [join-relations](../grammar/join-across-roles.md#join-relations).)
- **open:** **`wazem`** before **-r** / **-n**. *Respectively something* has no reading.
- **open:** other join spellings under `/h/` / `/w/` beyond the [defined restrictor core](../grammar/restrictors.md#defined-core-full) and the join-relations, such as stacked **-r** (`haor`): a stacked blank has no statement job. See also [phrase join inventory](../grammar/joins.md#phrase-reserved-forms).

## Joins

Source: [joins.md](../grammar/joins.md), [join-across-roles.md](../grammar/join-across-roles.md#stance-joins)

- **open:** **`/th/`…-n**. Join-relations frame a noun or an event, and a stance is neither, so no reading composes.
- **open:** stacked **-r** outside a question on `/th/` (`thaor` … `thuer` are fill-asks only), and on `/z/` `/d/` `/b/` `/v/` `/x/` `/ɡ/` joins (`zuar`, `vaor`, `xuar`, `gaor`). No statement wants a stacked blank, and no question has asked for one on these joins. Parser: `stackedJoinResume`.
- **open:** clause sequence **-n** beyond `xan` `xon` `xun` `xaon` `xuen` (`xuan`, `xuon`, `xen`, `xaen`, `xoen`). No reading is guessable: `xen` and `xaen` put rank or order into a sequence that is already ordered, `xoen` could be *at the same time* or *in either order*, and `xuan` / `xuon` (*everything but* / *anything but*) have no clause job. `xen` is also a departure mark after a name.
- **closed (D-39):** a single-item clause join (`A xul` *not the case that A*, `A xal` *only A happened*).
- **open:** a rank or sequence join (`e` / `ue` / `ae`) with a number as a threshold, and a SHARED continuum word. In a rank or sequence fence a number is one of the items, so a threshold reading is not guessable. Ranges use hooks and [rays](../grammar/numbers-applied.md#rays).

## Comparison bars

Source: [comparatives.md](../grammar/comparatives.md#bars)

- **open:** a stance that sets no value as a bar: clause poles, MAY, MIRATIVE, DECISION, ATTEMPT, RESIDUE, CAUSE, and the deontic noes (FORBID, refused consent). None sets a level to rank against: a decision or an attempt commits to an act, and a ban or a refusal only says no (the other side of PERMIT and CONSENT). *Than decided* is PLAN. Parser: `barKind`.
- **open:** a second comparee next to a bar (`barCount`). A bar fence ranks one item against one bar, so a second item has nothing to rank against.

## Hosted relations

Source: [relations.md](../grammar/relations.md)

- **open:** a relation root on `/w/` with `/b/` (`wumum bazawan`). Only the as-of pair (`wuhum` / `wuram`) takes `/b/` on `/w/`. No learner reaches for it: *as big as Azawan* is the equative, and *like Azawan* goes on the noun (`gumum`) or the verb (`humum`).
- **closed (D-34):** a social tie on `/h/` (`hemezem bazawan` *as a friend of Azawan*).

## Hooks — in-clause

Source: [hooks.md](../grammar/hooks.md#ranges), [sakes.md](../grammar/sakes.md#contrary-to-stance)

- **open:** in-clause **`ao`** / **`ae`** / **`uo`** (`aol` / `ael` / `uol` and **-m** / **-n**) between same-role words. `aol` has two guesses (*for example*, from discourse `aol …`, or *namely*); `ael` *A, in fact B* (it escalates and keeps A, unlike `el`) is a fair fill but rarely needed; `uol` has no guess. The parser rejects them; extra-noun and discourse uses are unaffected.
- **open:** stacked **-r** at the front of a sentence (`aor …`, `aer …`, `uor …`). Extra-noun point-back is assigned; as sentence glue they have no guess (*For example, anyway?* *In fact, as I said?*). Parser: `hookDiscourseStack`.
- **open:** discourse **`oel`** / **`ual`** / **`uol`** / **`uel`** (and **-m** / **-n**) at the front of a sentence. *Toward*, *out of*, *through* and *against* give no guessable sentence-to-sentence glue (guesses range from *Alternatively* to *Apart from that*). The parser rejects them.
- **open:** a hook + `barl` other than `ul` (`hookStandIn`). Most have no guess (*in that…*, *at that…*). *Contrary to* an event is `hezom barl`, and no job has turned up for `uem barl`.
- **open:** `uem` before a stance with no content an event can contradict (`frameKind`): PERMIT, given CONSENT (they only lift a restriction), MIRATIVE (it already says *against expectation*), MAY, NOTIONAL (held by no one as true; use INTUITION), RESIDUE, FORMER (use a PATTERN frame for *unlike before*), sake words (*against Alahen's interest* is `thegathum balahen`), clause poles, CAUSE, ATTEMPT, ability, and stance numbers. There is nothing for the event to go against.

## Role compounds

Source: [roles.md](../grammar/roles.md), [x-compounds.md](../grammar/x-compounds.md)

- **open:** a role compound on `/v/` / `/w/` / `/th/`. A role compound names a participant, and these slots take none: it fills `/z/` `/d/` `/b/` `/ɡ/`, sets a topic under `/x/`, and calls under `/y/`. Parser: `roleCompoundSlot`.
- **closed (D-34):** a role compound on `/h/`.
- **open:** a role compound as a piece of an ordinary compound, or two role vowels in a word. Not guessable: the first **`x`** decides the family, so an inner role vowel reads as part of the stem. *Noun + agent* is the role compound's own stem (`zaxodogaxowogal`).
- **open:** a special pronoun (root + **-n**) as a role-compound stem or a label-scope host (`zaxamun`, `zamuthan`). It is neither an event nor a label. Parser: `roleCompoundStem`, `labelScopeStem`.
- **open:** ability (`x` + vowel) on a `/z/` / `/d/` / `/b/` noun, a name, a pronoun, or `/h/` (`zodogaxal`). *Can* belongs to an act or a quality, and a noun or an adverb is neither. Ability is on `/v/` and `/ɡ/` (plus hostless `eze`). Parser: `abilitySlot`.
- **open:** name + `x` + vowel + **-n** in a clause body (`zalahen zazawaxon varahal.`). A bid is said to someone when arriving or leaving; inside a clause it has no job. That shape is a conversation-length bid only as a citation or a `/y/` call.

## Role pointers

Source: [pronouns.md](../grammar/pronouns.md#role-pointers)

- **open:** a role pointer on `/v/` / `/ɡ/` / `/h/` / `/w/` (`vaxar`). A pointer picks a participant, and these slots take none; *does so* and *such* are whole-stem **-r**. Parser: `pointerSlot`.
- **closed (D-24):** a role pointer on `/y/` / `/x/`.
- **open:** *the other one* (`o`) on the scene (`zexor`, `zexol`, `zexom`). A scene can be a place or a time, so *the other one* has no clear comparison. Parser: `pointerOtherRole`.
- **open:** a new-one pointer (**-l**) with pointer vowel `u`, or after a special, topic or generic pronoun (`zaxul`). A new-one pointer copies a kind, and an unsaid filler or a conversation role has none. Parser: `pointerNewUnsaid`, `pointerNewSpecial`.
- **open:** a share (**-m**) with pointer vowel `e` or with **-x** (`zaxem`, `zaxamx`). A share is a part of an event, so it names no group and cannot be the very event it describes. Parser: `pointerShareSelf`, `pointerSharePlural`.
- **open:** a share or new-one pointer in a holder seam or as a lateral's facing anchor. A holder and a facing anchor are someone; a share is part of an event, and a new one has nobody in particular to name.

## Tag pronouns

Source: [pronouns.md](../grammar/pronouns.md#tag-pronouns)

- **closed (D-24):** a tag on `/y/` / `/x/` (`ywar`, `xwar`).
- **open:** a tag on `/v/` / `/ɡ/` / `/h/` / `/w/` / `/th/`, or with `gl-` (`vwar`). A tag names a participant, and these slots take none. Parser: `tagSlot`.
- **open:** the stand-in endings on a tag (`zwarl`, `zwarm`). No job yet. Parser: `tagEnding`.
- **open:** **-x** on a tag **-l** or **-m** (`zwalx`, `zwamx`). A share is a part, not a group; a group is tagged through its plural phrase (`zodogalx zwal`). Parser: `tagPlural`.
- **open:** a tag on a word that is already a fixed pronoun: a special pronoun, the generic or topic pronoun, or another tag (`zamun zwal`, `zozan zwal`, `zwar zwel`). It already has one short form, and a second label for the same pronoun would only rename it. Parser: `tagPronoun`.
- **open:** a tag pair with **-l** (`zwael`). After a two-item list it could tag the items in order or the group as one, so neither reading is guessable; each tag is assigned on its own. Parser: `tagPairAssign`.
- **open:** **-x** on a tag pair **-m** (`zwaemx`), as on any share.

## Pronouns and plurality

Source: [pronouns.md](../grammar/pronouns.md), [plurality.md](../grammar/plurality.md)

- **open:** **-x** on `/h/` / `/w/` and the six linkers. An adverb, a degree word, or a linker names no group.
- **closed (D-37):** **-x** on a `/th/` stance word.
- **closed (D-42):** `/th/` on the record or scroll root (`therem`, `thozem`, any ending but **-n**). Parser: `retiredChannelRoot`.
- **open:** **-x** on an interjection (`/y/` **-l** / **-m**). An interjection addresses no one.
- **open:** the nonspecific *someone* `unan` as a topic or with **-x** (`xunan`, `unanx`). `unan` names no particular person or group: a topic is someone in particular, and *some people* is `zobelx`.
- **open:** the topic pronoun as a topic word or a resume (`xozan`, `zozar`). The topic pronoun is the topic itself, so there is nothing to set or return to.

## Identity (`SAME`)

Source: [predication.md](../grammar/predication.md)

- **closed (D-33):** `gugon` / `gugor` as identity.
- **open:** **-x** on `gugol`. No guessable reading (*the same as a group*?); on a joined subject, plain `gugol` already compares the members.
- **open:** a `/z/` or `/d/` as the second identity label. The label is a hosted `/b/`; a `/z/` or `/d/` there is a new participant.
- **closed (D-33):** a bare `/ɡ/` right after the verb (depictive / resultative).

## Closed-root endings

Source: [causation.md](../grammar/causation.md#poles), [relations.md](../grammar/relations.md), [dependents.md](../grammar/dependents.md#dependent-clauses), [knowing.md](../grammar/knowing.md#residue)

An **-r** grade on a closed root without its own **-r** would take away the live whole-stem resume ([design-decisions § Closed-root endings](design-decisions.md#closed-root-endings)). **-l** has two competing guesses (strongest, as on *exactly like* `humul`, or broke a norm, as on *because*), so a family where neither fits has no guessable **-l**.

- **closed (closed-root -r):** clause-pole **-r** as a grade on *iff* (`eda`), *although* (`ezo`), *while* (`uwe`), *before* (`aba`), *after* (`enu`), *until* / *by* (`oma`), and the result pole (`odu`).
- **closed (closed-root -r):** clause-pole **-r** as *one of several* on *if* (`thoyer`), *only if* (`tholur`) and *so that* (`hogor`). The resume is the only route to *in that case* (`thoyer`); *partly because* is `thever`.
- **closed (closed-root -r):** CAUSE **-r** as *one contributing push* (`theger`); RESIDUE and FORMER **-r** as *for now* (`thamor`, `thenor`); similative **-r** as *a bit like* (`humur`, `gumur`).
- **open:** clause-pole **-l** beyond *because* (`thevel`) and *by* (`omal`). Neither guess fits these poles. The nearest, *if* **-l** as *by rule* (`thoyel`), is not a stronger *if* but a rule, which `thoyem` plus a deontic says.
- **open:** CAUSE **-l** as *compel* (`thegel`). **-l** is not guessable here, and refused consent plus CAUSE ([consent](../grammar/sakes.md#consent)) says more: it names whose will was overridden.
- **open:** RESIDUE and FORMER **-l** (`thamol`, `thenol`). Two guesses compete: *for good*, as on the phasals (`hohal`), and *strong*, as on the channels.
- **open:** **-l** on exchange (`ehe`), proxy (`ade`), the of-relations, the locatives, stimulus (`obu`), and *respectively* (`aze`). *Strongest* is the only guess, and none of these has needed it (*exactly between*?).

## Stand-ins and dependents

Source: [dependents.md](../grammar/dependents.md#stand-in)

- **closed (D-32):** a stand-in on `/ɡ/` (`garl`).
- **open:** forward, back and named stand-ins (`-rl` `-rm` `-rth` `-rn`) on `/h/` `/w/` `/th/` (`harth`, `tharn`) and on `/x/` `/y/`. Not guessable: a sentence filling an adverb slot could be its manner, its time, or its condition, and `/x/` and `/y/` words already open sentences. *Such* is whole-stem **-r** and *like that* is `humum barth`. Parser: `standInRole`.
- **open:** **-x** on a stand-in. A stand-in stands for what a sentence says, which is not a group.
- **open:** a stance-only dependent (`dependentStanceOnly`): the sentence after a stand-in needs a noun or a verb, except a lone sake word. A lone stance there adds nothing: `hezom barl thedel` says what `uem thedel` says.

## Sentence linkers (`/x/`)

Source: [dependents.md](../grammar/dependents.md#sentence-linkers)

- **closed (D-32):** a linker and a topic word in one sentence (`xezom xazawan …`).
- **open:** firm **-l** on *meanwhile* (`xagagal`), *next* (`xevavel`), and *by the way* (`xavazel`). Not guessable: firmness fits a link that can hold more or less surely (*it follows that*, *nevertheless*, *on the contrary*), and *meanwhile*, *next* and *by the way* claim no such link. The parser rejects them.

## Turn words (`/y/`)

Source: [speech-moves.md](../grammar/speech-moves.md#speech-act), [describing a call or reaction](../grammar/speech-moves.md#describe-turn-word), [questions.md](../grammar/questions.md#polar-endings)

- **closed (closed-root endings):** act and polar series with **-n** (`yan` / `yon` / `yen` / `yun`, `yaen` / …). On `/y/`, **-n** calls someone.
- **closed (closed-root endings):** a fill-ask blank for the act itself (*are you asking or telling?*). `yar` / `yor` / `yer` / `yur` are the [for-now acts](../grammar/speech-moves.md#act-r).
- **closed (D-31):** a polar word before an act word, or two polar words in a row; a topic-only question.
- **closed (D-43):** a `/b/` hosted by a call or reaction; `yuhohul bazawan` is a reaction and then a body with a recipient.
- **open:** `/w/` on a call (`welavam yalahen`). The person called is not more or less called. Parser: `turnWordModifier`.
- **open:** `/w/` on an act word or a polar word (`welavam yel`). Firm / soft already grades the act, and the polar stance has its own strengths. The parser rejects them.
- **open:** `gl-`, `/ɡ/`, or `/w/` on a number cheer or a `/y/` span (`yrabarel gelavam`, `y<…> gelavam`). A number cheer already carries its own size, and a span's inside is not graded. Parser: `turnWordModifier`.
- **open:** a mention or an aside under `/y/` (`ySpanType`). A mention talks about a word and an aside comments on the sentence, so neither calls nor reacts.

## Spans

Source: [spans.md](../grammar/spans.md)

- **open:** an aside under any role but `/th/` (`d(…)`); a cite, opaque or mention under `/th/` (`th[…]`). An aside comments on the sentence and fills no slot, and no job has asked for a quoted or foreign stance word: a foreign phrase goes in an aside or a `/y/` interjection. Parser: `spanSlot`.
- **closed (D-28):** any span under `/w/`.
- **open:** a span resume (`d[=]`). The shape is not guessable, and a span is an ordinary noun for role pointers (`duxar`).
- **open:** a resume pronoun for a span in a `/v/` slot (`v[vazadal]`). A verb span echoes wording, so there is no stem to resume.

## Values and sakes

Source: [sakes.md](../grammar/sakes.md)

- **open:** forced listener / third-person possessives on sake ascription. A `/ɡ/` sake already means the speaker's belonging ([personal possession](../grammar/sakes.md#personal-possession)); anyone else's noun is **`gobum`** or ownership (`gegabem`), so a second possessive reading would compete.
- **open:** a sake word on `/z/` `/d/` `/b/` `/v/` `/h/` `/x/` `/y/` (`sakeSlot`). A sake word is a stance on a belonging, an unowned noun, or the clause, and these slots are none of those. *Walks healthily* is the clause stance (`thoyutham`).
- **open:** prescription **`the`** on a noun (`ganathel`, `wanathel gobum`). Its endings are the warrant for a move, and a noun is not a move; what a noun is for is **`tho`** (`ganathom`).
- **closed (D-36):** **-n** on a sake word.
- **open:** a `/b/` after an INTERNAL or UNPLACED feeling (`wanathumal gobum balahen`). A placement locus has no landmark; someone else's stake is ON-BEHALF (`e`) or a holder.

## Role-letter structure

Source: [clause.md](../grammar/clause.md)

- **open:** a `gl-` adjective with no noun after it (`zazawan glubuhel.`, `zazawan dedehal glubuhel vahahal.`). It describes the next noun, and there is none; an adjective on the noun before it is a plain `/ɡ/` word. Parser: `glNoNoun`.
- **open:** lean **`l`** on any role letter but `/ɡ/`: `zl-` / `dl-` / `bl-` / `vl-` / `hl-` / `thl-` / `wl-`. No job: a noun modifying a noun is mid-word **`x`** ([x-compounds](../grammar/x-compounds.md#ordinary-compound-order)); an event root on `/ɡ/` or in `gl-` is already an act [in progress](../grammar/predication.md#in-progress); `/h/` and `/th/` already go anywhere; `/w/` already sits before its host.
- **open:** `/w/` before `/z/`, `/d/`, `/b/`, or `/v/`. Not guessable: *very* on a verb could mean how intensely, how often, or how fully, and an `/h/` adverb says which (a degree word before a manner adverb); degree on a noun goes through an adjective.
- **closed (D-22):** a hosted `/b/` after `/z/`, `/d/`, `/v/`, or `/w/`.

## Vowel series and tone marks

Source: [speech-moves.md](../grammar/speech-moves.md#tone-marks), [intention.md](../grammar/intention.md#ability)

- **open:** stacked vowels after ability **x** (`xua`, …) and after sake **th** as a second stance (`gulothaol`). Not guessable (*can again*? *it depends*?): *it depends* is MAY or a sentence (polar `oe` is *decline to answer*), and *can again* is `xa` plus a sentence. Label scope uses those stacks ([predication](../grammar/predication.md#scope-stacks)). Sake locus stacks still come after the horizon letter (`gulothamol`). The parser rejects a stacked sake stance and stacked ability.
- **open:** a new tone mark (whisper, sarcasm, …). No voice job is left: `;` `%` `?` already cover quiet, sarcasm and hesitation.
- **closed (D-23):** `~` as a tone mark, and a third copy of a mark (`!!!`).

## Phonology

Source: [phonology.md](../grammar/phonology.md)

- **open:** unused onset clusters *gw*, *vw*, *xw*, *bl*. No morphology needs them (*bl* should not mean left-aligned *b*).

## Related meta

| Page | Role |
|------|------|
| [design-decisions.md](design-decisions.md) | Why a cell is closed; rejected alternatives |
| [grammar-docs.md](grammar-docs.md) | Grammar prose: unused slots do not earn a stage |
| [drill-generation.md](drill-generation.md) | Do not drill cells listed here |
| [TODO.md](../../TODO.md) | Speculative features, open lexicon |

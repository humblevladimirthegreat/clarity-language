# Proposal: evaluation frames (*as-of*, channel, play)

**Status:** PROPOSED (not current language). Grammar today: verbs have **no** past/future letter; PREDICT is later than **speech-now**; RESIDUE / FORMER score the **current** tally / climate; evidential `/h/` is **this clause only**; omitting an evidential means **unmarked**, not “keep the last channel”; *before* / *after* / *while* order **events**. There is no reference now \(R\) other than speaker-now \(S\).  
**Related:** [knowing.md](../grammar/knowing.md) (MAY / evidentiality / RESIDUE / FORMER / NOTIONAL), [intention.md](../grammar/intention.md) (PLAN / PREDICT / DECISION), [causation.md](../grammar/causation.md#factivity) (*if* vs *because*), [dependents.md](../grammar/dependents.md) (`barl`, `/x/` continue), [relations.md](../grammar/relations.md) (hosted `/h|ɡ/` + `/b/`), [hooks.md](../grammar/hooks.md) (extra-noun *at* / *from* — not \(R\)), [spans.md](../grammar/spans.md) / [joins.md](../grammar/joins.md#scope-islands-join) (`^ … ^`), [numbers-applied.md](../grammar/numbers-applied.md#time) (clock / date), [why-agelan.md](../grammar/why-agelan.md#residue-and-former-climate)  
**Design authority:** none until absorbed. Speakers currently do **not** mark *would* / *as of Friday* / *if he had* as a dated snapshot, and do **not** persist evidentiality or mood across clauses.

## Motivation

English *would*, *was going to*, *will have*, *still counted then*, *I remember that leftover*, and *if he had* mix **when the event sits**, **whose now** leftover / climate / plan / forecast are scored against, and **how you know**.

Agalan already splits those moods and channels. It still scores them against **speech-now**, and it still drops the channel at the next clause. A remembered telling plus PREDICT is heard as *will rain* (after **now**), not *would rain* (after **that telling**). RESIDUE is leftover on **today’s** books, not Friday’s.

**Evaluation frames** are the missing settings: whose **now** \(R\), which **channel**, whether the host is **play**. Event order stays *before* / *after* / clock. Score moods (RESIDUE, FORMER, PREDICT, PLAN, MAY, …) stay **claims about this episode**. Channel and play stay **this host** (repeat them if the next clause still needs them). \(R\) is a hosted pole: introduce with `/b/`, reuse with resume **-r** on the **next** host — not a paragraph persist stack.

**Default omit = today’s language.** No \(R\), no channel, no play, local clause. Forcing frames on every clause would add shame and extra thought. Mark them when English would smuggle *would* / *as of* / *had … would* / a narrative *I saw* / a scene of *as if*.

## Non-goals

- A past / present / future letter on `/v/`.
- Progressive / mid-course aspect (stays *while* / LIVE paraphrase).
- “Last scene” as an implicit \(R\) (a telling, an *if*-clause, or a clock does **not** plant viewpoint by itself).
- Reusing discourse **`x#e0`**, TALE **`horolom`**, or *after* **`oranem`** as viewpoint.
- Silent inherit of evidentiality or mood (omit still means unmarked / speaker-now, not “keep last”).
- Mid-word **`x`** + **`a`/`o`/`e`/`u`** on mood roots for scope (that family is [values](../grammar/values.md) / [ability](../grammar/ability.md)).
- Reusing ending **-r** as persist on MAY / NOTIONAL / PLAN / DECISION (those endings already mean find-out / mask-off / map grain / changeability). **-r** on the *as-of* stem is **resume of \(R\)**, not persist of channel or play.
- Prefix-less **frame-scope hooks** (`eal` / `eol` / `eel` / `eul`). Scope is the role letter: `/h/` = this clause (or this [scope island](../grammar/joins.md#scope-islands-join)); `/ɡ/` = this noun; `/w/` = this preceding `/ɡ/` adjective. No until-undone, no speech-act-long inherit, no standalone clear.
- `/b/` on evidentials, PREDICT, PLAN, RESIDUE, or other moods as *as-of* (those `/b/` jobs stay causal / extra-noun / existing poles). Only the *as-of* overlay takes snapshot `/b/`.
- Two *as-of* stems (outer ledger vs inner bookmark). One stem; a new hosted `/b/` **replaces** \(R\). Nested clauses may each have their own pair.
- Paragraph-level parse state as a requirement for the first absorb.
- Using **`^ … ^`** or span fences as a paragraph of viewpoint.
- Observation vs imagination tense as a new slot ([TODO.md](../../TODO.md) evidentiality notes). LIVE vs WITNESSED stay channels.

## Architecture

Three **settings** (independent; at most one value each per host) plus **score claims** that are not settings:

| Setting | Job | Default | How far |
|---------|-----|---------|---------|
| **Now \(R\)** | books PREDICT / PLAN / RESIDUE / FORMER score against | speech-now \(S\) | this host (`/h/` clause or island, `/ɡ/` noun, `/w/` adjective); next host only if you **resume** |
| **Channel** | how **you** know (LIVE, WITNESSED, RECORDED, PATTERN, INFERRED, TOLD, FELT, STORY) | unmarked report | this host only (write the evidential again next clause) |
| **Play** | real tally vs NOTIONAL | real | this host only |

**Score claims** (ordinary `/h/` moods, always this host): RESIDUE, FORMER, PREDICT, PLAN, MAY, CAUSE, DECISION, universality, emotion compose, values, ability, restrictors.

Do **not** hang snapshot `/b/` on those moods. Do **not** steal their **-l / -m / -r** for *as-of* factivity (MAY find-out, PLAN map grain, NOTIONAL mask, DECISION changeability stay as published).

**LIVE + marked \(R\)** = camera still in that snapshot (narrative present). **LIVE** alone = camera at \(S\). **WITNESSED + marked \(R\)** = you, at \(S\), pulling a scene whose internal now is \(R\). Channel is still **your** knowing at \(S\), except that LIVE-at-\(R\) moves the camera into the snapshot.

## Chosen forms

### *As-of* pole (one overlay)

New overlay **`kind`:** `clause_pole` (hosted `/b/`, morph `mood`). One stem. Do **not** reuse ⌛ `orane` (*after*) or 📌 `ubuhu` (*at*). Factivity is this word’s **-l / -m**; resume is **-r** (no `/b/`).

| Ending | Factivity | Overlay (`/h/`) | `/ɡ/` twin | `/w/` twin | Cue |
|--------|-----------|-----------------|------------|------------|-----|
| **-l** | **Asserted** (default for a real dated line) | `helerel` | `gelerel` | `welerel` | 📒 dated **line in the books** |
| **-m** | **Unasserted** (hypothetical now) | `helerem` | `gelerem` | `welerem` | 🔖 **placeholder** in the story, not a stamped line |
| **-r** | resume last `/b/` of this stem | `helerer` | `gelerer` | `welerer` | same snapshot value, this host |

Ordinary `zelere` stays *a ledger* (`elere` has no published metaphor yet). Overlay rows to add (sense_form, pos, kind `clause_pole`): `elerel` / `elerem` on `h`, `g`, and `w`. Continue is ending **-r**, not extra rows.

**Avoided for \(R\):** 📅 `alena`, 🎥 `omovu`, 🦭 `ezeza`, ⚓ `anogo` / 🧭 `ogomo`; second bookmark stem.

Resume **parses** in isolation (`helerer`); learner rule: only after an *as-of* introduce. Resume **with** a new `/b/` is illegal (that is a reset; use **-l** or **-m** + `/b/`). Resume does not re-state factivity: the open snapshot keeps the introduce’s asserted vs unasserted until replaced.

### Channel and play (existing overlays)

No new evidential or NOTIONAL roots. Write them as today (`huvuvum`, `hadezem`, `hadadem`, …). They do **not** take *as-of* `/b/`. They do **not** last past this host.

## *As-of* grammar

### Snapshot vs resume vs scope

| Job | Shape |
|-----|--------|
| **Set \(R\)** | Hosted **as-of** + `/b/` immediately after |
| **Reuse that snapshot** | Same stem, ending **-r**, **no** `/b/` — **this** host only |
| **How far \(R\) lasts** | Role letter: `/h/` this clause (or `^ … ^` island that contains it); `/ɡ/` this noun; `/w/` the preceding `/ɡ/` adjective |

No hook after the pair. No until-undone. A later `/x/` clause is a new host: omit = speaker-now; write `helerer` to keep the same books.

### Factivity

Factivity is **not** on causal *if*. **`hadorom`** does not plant \(R\). Unasserted *as-of* (**-m**) is the **hypothetical now** so PREDICT / PLAN / RESIDUE / FORMER can score against a scene you are **not** claiming.

**NOTIONAL** stays play / off the real tally for the **host**. Do not use it for *if he had* (serious other-world reasoning). Play may stack with \(R\) (*as if, from Friday’s books*).

| English | Shape |
|---------|--------|
| *As of Friday, the leaving still counts* | Asserted *as-of* + RESIDUE |
| *If it rains, Azawan walks* | **`hadorom`** only (speaker-now) |
| *If he had left, the door would still be shut* | Unasserted *as-of* + RESIDUE (and PREDICT if *would* is later-than-\(R\)) |
| *If he had meant to walk* | Unasserted *as-of* + PLAN |
| *As if he had left* | NOTIONAL on the content verb |
| Memory of Friday’s leftover | WITNESSED + asserted *as-of* + RESIDUE |
| Memory **paragraph** | Repeat WITNESSED each clause; resume *as-of* with **`helerer`** where the books stay |
| Historical present | LIVE + marked \(R\) |
| *Would* on later clauses | Repeat PREDICT; resume *as-of* |

Causal *if* plus a **real** dated ledger remains legal (*if it rains, then as of Friday the tab still counts*): both poles, different jobs.

### What `/b/` may be

Clock or date, event noun (*as of the leaving*), **`barl`** + next sentence (that sentence **is** \(R\)), extra-noun **-r**. **`barl` factivity follows the pole** (asserted claims the scene; unasserted does not).

Do **not** put a bare person in `/b/` as “from Ululon’s now” (collides with proxy **`hudagam`**). Prefer *as of Ululon’s telling* or `barl` + he tells.

On `/ɡ/`, the noun is scored as of that snapshot (*the tab as of Friday*); clause moods still need `/h/` *as-of* if the **verb** scores against \(R\). `/w/` *as-of* grades a preceding `/ɡ/` adjective the same way other `/w/` moods do.

### What \(R\) does to score moods

Once \(R\) is set on a host (or reused by resume-**-r**):

| Mood | Relative to \(R\) |
|------|-------------------|
| PREDICT | event **after** \(R\) (*would rain*) |
| PLAN | intention **from** \(R\) (*was going to*) |
| RESIDUE | leftover on **that** tally |
| FORMER | not **that stretch’s** climate |

**Bare verb + *as-of*:** legal = **concurrent with \(R\)** (event *at* snapshot-now: *as of Friday, Azawan is in Paris*). Teach scoring moods as the usual pair so learners do not hear *as-of* as event-when. Clock / *before* / *after* may sit beside *as-of*: *as-of* = books; the other `/h/` = event order.

## Channel and play

Write the evidential or NOTIONAL `/h/` as today. Scope of the channel is that evidential’s role letter (`/h/` clause or island, `/w/` on a preceding adjective) — same as current grammar. Prefer `/w/` on a value adjective; there is **no** extra hook for “this verb only.”

**One channel per host clause.** Stacking LIVE + WITNESSED stays illegal. A later clause that is still memory writes **`huvuvum`** again.

## Binding and islands

\(R\) sits on the **host** of the marked pair (or resume). Channel and play sit on **their** mood words. None of them leak into the next clause unless you write them (or resume \(R\)).

**Does not inherit frames** (inner PREDICT defaults to after **speech-now**; inner evidential defaults to unmarked):

- The **`barl` snapshot body** (defines \(R\); no leak inward)
- Clock / *before* / *after* (event order)
- **`darl` / `hadorom` / `holalam` bodies** unless they contain their own frames
- Aside spans and opaque / cite interiors
- Later `/x/` clauses (inherit **speech act**, not \(R\) / channel / play)

### `^ … ^` (join / `/h/` islands)

Keep existing [scope islands](../grammar/joins.md#scope-islands-join): binder inside is `/h/` and/or a join; no nesting.

**Length cap:** an island is a **handful of words**, and **never longer than one written sentence**. Do not wrap a memory paragraph, a chain of `/x/` clauses, or a multi-sentence *would* stretch in `^ … ^`. Repeat the evidential and/or resume \(R\) on each host instead. Inside an island, `/h/` frames **that chunk only**, then the island ends. Prosody-only edges; not a discourse persist device.

Span fences (`[…]`, `{…}`, asides) are wording packages, not viewpoint paragraphs.

## Stacking

- **One** *as-of* pair per host. Two snapshots on one verb: illegal.
- **One** channel; **one** play root.
- Nested clauses may each have one of each. Resume-**-r** resumes the **latest still-open snapshot** of this stem, not “the outer one” by magic.
- New hosted `/b/` **replaces** \(R\) (including switching asserted **-l** vs unasserted **-m**).
- Score claims may stack with frames on the same clause (`huvuvum honenom helerel badorol`).
- Independent slots: channel, play, and \(R\) are three marks. `/b/` only on the *as-of* word.

## Examples

House-cast people. Date `/b/` is a [calendar digit-string](../grammar/numbers-applied.md#time) (`b_#22,7` = 22 July). These sentences are **not** current language.

Asserted *as-of* + RESIDUE (this clause):

> `zululon honenom helerel b_#22,7 vebarum.`
>
> z-Ululon | h-RESIDUE | h-as-of.asserted | b-22-July | v-leave
>
> "As of 22 July, Ululon’s leaving still counts."

Bare verb concurrent with \(R\) (not event-when):

> `zazawan helerel b_#22,7 vajul al b@<Paris>.`
>
> z-Azawan | h-as-of.asserted | b-22-July | v-sit | in | b-Paris
>
> "As of 22 July, Azawan sits in Paris."

Causal *if* only (no \(R\); PREDICT would still be after **speech-now**):

> `zazawan vawalal hadorom banunul.`
>
> z-Azawan | v-walk | h-if | b-rain
>
> "Azawan walks if there is rain."

Unasserted *as-of* + RESIDUE + PREDICT (*if he had … would still*):

> `zadorol gologem honenom helezom helerem barl zululon vebarum.`
>
> z-door | g-locked | h-RESIDUE | h-PREDICT | h-as-of.unasserted | b-that-clause | z-Ululon | v-leave
>
> "If Ululon had left, the door would still be locked." — bookmark now; leftover scored there; locked later-than that now

Unasserted *as-of* + PLAN:

> `zululon hemabam vawalal helerem b_#22,7.`
>
> z-Ululon | h-plan-sketch | v-walk | h-as-of.unasserted | b-22-July
>
> "If (as of 22 July) Ululon had meant to walk."

NOTIONAL is play, not a bookmark:

> `zululon hadadem vebarum.`
>
> z-Ululon | h-NOTIONAL | v-leave
>
> "As if Ululon leaves."

WITNESSED + asserted \(R\) + RESIDUE (one clause):

> `zululon huvuvum honenom helerel b_#22,7 vebarum.`
>
> z-Ululon | h-WITNESSED | h-RESIDUE | h-as-of.asserted | b-22-July | v-leave
>
> "Ululon’s leaving still counted on 22 July — from memory."

LIVE-at-\(R\) (camera in the snapshot):

> `zazawan hadezem helerel b_#22,7 vawalal.`
>
> z-Azawan | h-LIVE | h-as-of.asserted | b-22-July | v-walk
>
> "Azawan walks — live in the 22 July snapshot."

`barl` defines \(R\); the telling body does **not** inherit the ledger:

> `zululon honenom vebarum helerel barl zululon vezehel.`
>
> z-Ululon | h-RESIDUE | v-leave | h-as-of.asserted | b-that-clause | z-Ululon | v-tell
>
> "As of Ululon’s telling, the leaving still counts." — the telling sentence is the dated now, not itself leftover

Resume of that snapshot on the next clause (channel and RESIDUE written again; no persist):

> `zululon honenom helerel b_#22,7 vebarum. xazawan honenom helerer vawalal.`
>
> z-Ululon | h-RESIDUE | h-as-of.asserted | b-22-July | v-leave | x-Azawan | h-RESIDUE | h-as-of.resume | v-walk
>
> "As of 22 July, Ululon’s leaving still counts. Azawan’s walking still counts — same ledger."

Memory stretch: repeat the channel; resume \(R\):

> `zululon huvuvum helerel b_#22,7 honenom vebarum. xazawan huvuvum helerer vawalal.`
>
> z-Ululon | h-WITNESSED | h-as-of.asserted | b-22-July | h-RESIDUE | v-leave | x-Azawan | h-WITNESSED | h-as-of.resume | v-walk
>
> "From memory, as of 22 July, Ululon’s leaving still counts. Azawan walks — still memory, same books, no leftover claim on the second clause."

`/ɡ/` twin on a noun (clause moods still need `/h/` if the verb scores against \(R\)):

> `zonebam gelerel b_#22,7.`
>
> z-money-bag | g-as-of.asserted | b-22-July
>
> "The tab as of 22 July."

PREDICT + unasserted \(R\) on two clauses (*would*; repeat PREDICT, resume books):

> `helezom helerem b_#22,7 vanunul. xazawan helezom helerer vawalal.`
>
> h-PREDICT | h-as-of.unasserted | b-22-July | v-rain | x-Azawan | h-PREDICT | h-as-of.resume | v-walk
>
> "As of that bookmark, it would rain. Azawan would walk."

Short island (handful of words). Not a paragraph:

> `zazawan ^ huvuvum zululon zal ^ zam vejel.`
>
> z-Azawan | ^-start | h-WITNESSED | z-Ululon | z-and | ^-end | z-and.open | v-see
>
> "Azawan and (just Ululon, that conjunct from memory) see …."

Do **not** wrap a memory stretch in `^ … ^`. Repeat the evidential / resume \(R\).

Illegal (proxy, not whose now): not `helerel bululon`. Prefer `helerel barl zululon vezehel` or *as of Ululon’s telling*.

*If it rains, then as of 22 July the tab still counts* (both poles):

> `zonebam honenom helerel b_#22,7 hadorom banunul.`
>
> z-money-bag | h-RESIDUE | h-as-of.asserted | b-22-July | h-if | b-rain
>
> "If there is rain, the tab still counts as of 22 July."

## Parser vs discourse

| Layer | Rule |
|-------|------|
| Sentence parse | Hosted + `/b/` introduces *as-of*; stem + **-r** and no `/b/` resumes. Isolated `helerer` **parses**. No scope-hook series. |
| Learner rule | Resume only after an *as-of* introduce. Islands stay short. Next clause omits \(R\) unless `helerer` (or a new pair). |
| Docs examples | A block that uses resume includes the hosted pair in that block. |
| Cheap local checks | Hosted *as-of* without `/b/` unless **-r**; **-r** *as-of* with `/b/` is illegal; `/b/` on evidential / PREDICT / PLAN / RESIDUE is **not** this pole. |
| Cross-sentence bind | Optional later. Do **not** require paragraph state for the first absorb. Resume is a learner/discourse rule until a later resolve pass. |

## Compare with

| Other device | Job |
|--------------|-----|
| Clock / date / **`oranem`** | Event-when, not books |
| Extra-noun **`ol`** *at* | Place / time landmark, not score-now |
| **`hadorom`** | Causal *if*; no \(R\) |
| NOTIONAL | Play, not hypothetical ledger |
| **`hudagam`** | Whose agency, not whose now |
| Speech act + `/x/` | Inherit **act**, not frames |
| TALE **`horolom`** | Channel = lore, not \(R\) |
| Ambient **`Ne0`** | Order of magnitude, not time |

## Absorb sketch (if yes)

1. Overlay rows for `elerel` / `elerem` on `/h/`, `/ɡ/`, and `/w/`; resume is ending **-r**.
2. Teach the pole on [relations.md](../grammar/relations.md); link from [knowing.md](../grammar/knowing.md) / [intention.md](../grammar/intention.md): *as-of* vs *after* vs PREDICT vs *if*. No new hook family.
3. LIVE-at-\(R\); concurrent bare verb + *as-of*; island length cap; resume on the next host.
4. [why-agelan.md](../grammar/why-agelan.md): rumination = which ledger; *had … would* = unasserted *as-of*, not play; memory stretches repeat the channel (opt-in, not silent leak).
5. [grammar-gaps.md](../meta/grammar-gaps.md) item 14 / time: viewpoint as hosted pole, not a tense letter and not frame-scope hooks.
6. Parser: hosted pair like other `clause_pole`; no last-scene inference; optional local **-r** `/b/` clash; no required paragraph state; no `ea`/`eo`/`ee`/`eu` hooks.
7. Drills (later, not in this file): asserted + RESIDUE; unasserted *had … would*; LIVE-at-\(R\); resume on `/x/`; negative *if it rains* without *as-of*; island too long as a **don’t**.

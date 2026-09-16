# Proposal: evaluation frames (*as-of*, channel, play) plus scope

**Status:** PROPOSED (not current language). Grammar today: verbs have **no** past/future letter; PREDICT is later than **speech-now**; RESIDUE / FORMER score the **current** tally / climate; evidential `/h/` is **this clause only**; omitting an evidential means **unmarked**, not “keep the last channel”; *before* / *after* / *while* order **events**. There is no reference now \(R\) other than speaker-now \(S\).  
**Related:** [knowing.md](../grammar/knowing.md) (MAY / evidentiality / RESIDUE / FORMER / NOTIONAL), [intention.md](../grammar/intention.md) (PLAN / PREDICT / DECISION), [causation.md](../grammar/causation.md#factivity) (*if* vs *because*), [dependents.md](../grammar/dependents.md) (`barl`, `/x/` continue), [relations.md](../grammar/relations.md) (hosted `/h|ɡ/` + `/b/`), [hooks.md](../grammar/hooks.md) (prefix-less hooks; extra-noun stacks), [spans.md](../grammar/spans.md) / [joins.md](../grammar/joins.md#scope-islands-join) (`^ … ^`), [numbers-applied.md](../grammar/numbers-applied.md#time) (clock / date), [why-agelan.md](../grammar/why-agelan.md#residue-and-former-climate), [vowel-series.md](../grammar/vowel-series.md)  
**Design authority:** none until absorbed. Speakers currently do **not** mark *would* / *as of Friday* / *if he had* as a dated snapshot, and do **not** persist evidentiality or mood across clauses.

## Motivation

English *would*, *was going to*, *will have*, *still counted then*, *I remember that leftover*, and *if he had* mix **when the event sits**, **whose now** leftover / climate / plan / forecast are scored against, and **how you know**.

Agalan already splits those moods and channels. It still scores them against **speech-now**, and it still drops the channel at the next clause. A remembered telling plus PREDICT is heard as *will rain* (after **now**), not *would rain* (after **that telling**). RESIDUE is leftover on **today’s** books, not Friday’s. A memory paragraph repeats **`huvuvum`**.

**Evaluation frames** are the missing settings: whose **now** \(R\), which **channel**, whether the stretch is **play**. **Scope** says how far those settings reach. Event order stays *before* / *after* / clock. Score moods (RESIDUE, FORMER, PREDICT, PLAN, MAY, …) stay **claims about this episode** unless you opt a persistable one into a stretch.

**Default omit = today’s language.** No \(R\), no channel, no play, local clause. Forcing frames on every clause would add shame and extra thought. Mark them when English would smuggle *would* / *as of* / *had … would* / a narrative *I saw* / a scene of *as if*.

## Non-goals

- A past / present / future letter on `/v/`.
- Progressive / mid-course aspect (stays *while* / LIVE paraphrase).
- “Last scene” as an implicit \(R\) (a telling, an *if*-clause, or a clock does **not** plant viewpoint by itself).
- Reusing discourse **`x#e0`**, TALE **`horolom`**, or *after* **`oranem`** as viewpoint.
- Silent inherit of evidentiality or mood (omit still means unmarked / speaker-now, not “keep last”).
- Mid-word **`x`** + **`a`/`o`/`e`/`u`** on mood roots for scope (that family is [values](../grammar/values.md) / [ability](../grammar/ability.md)).
- Reusing ending **-r** as persist on MAY / NOTIONAL / PLAN / DECISION (those endings already mean find-out / mask-off / map grain / changeability).
- Paragraph-level parse state as a requirement for the first absorb.
- Using **`^ … ^`** or span fences as a paragraph of viewpoint.
- Observation vs imagination tense as a new slot ([TODO.md](../../TODO.md) evidentiality notes). LIVE vs WITNESSED stay channels.

## Architecture

Three **slots** (independent; at most one value each per host clause) plus **score claims** that are not slots:

| Slot | Job | Default | Persistable |
|------|-----|---------|-------------|
| **Now \(R\)** | books PREDICT / PLAN / RESIDUE / FORMER score against | speech-now \(S\) | yes |
| **Channel** | how **you** know (LIVE, WITNESSED, RECORDED, PATTERN, INFERRED, TOLD, FELT, STORY) | unmarked report | yes |
| **Play** | real tally vs NOTIONAL | real | yes |

**Score claims** (ordinary `/h/` moods, local unless you whitelist-persist PREDICT): RESIDUE, FORMER, PREDICT, PLAN, MAY, CAUSE, DECISION, universality, emotion compose, values, ability, restrictors.

Do **not** persist MAY holds, NOTIONAL mask-off vs fused (the **root** may persist as play; the hold ending is this clause), PLAN map-resolution, DECISION changeability, values, ability, or restrictors.

**LIVE + marked \(R\)** = camera still in that snapshot (narrative present). **LIVE** alone = camera at \(S\). **WITNESSED + marked \(R\)** = you, at \(S\), pulling a scene whose internal now is \(R\). Channel is still **your** knowing at \(S\), except that LIVE-at-\(R\) moves the camera into the snapshot.

## Chosen forms

### *As-of* poles (new overlays)

New overlay **`kind`:** `clause_pole` (hosted `/b/`, morph `mood`). Ending **-m** like other poles. Do **not** reuse ⌛ `orane` (*after*) or 📌 `ubuhu` (*at*).

| Factivity | Picture | Stem | Overlay (`/h/`) | `/ɡ/` twin | Cue |
|-----------|---------|------|-----------------|------------|-----|
| **Asserted** (default) | 📒 ledger | `elere` | `helerem` | `gelerem` | dated **line in the books**; leftover is scored on that page |
| **Unasserted** | 🔖 bookmark | `oboma` | `hobomam` | `gobomam` | **placeholder** in the story, not a stamped line |

Ordinary `zelere` stays *a ledger* (`elere` has no published metaphor yet). Ordinary `zobomam` stays *a reminder*; the overlay is hypothetical-now. Resume of that **snapshot value** (same stem, no `/b/`): `helerer` / `hobomar` (and `gelerer` / `gobomar`). Resume is **not** persist; it reuses the last `/b/` of **that** stem for **this** host, at whatever duration the scope hook (or default) says.

**Avoided for \(R\):** 📅 `alena`, 🎥 `omovu`, 🦭 `ezeza`, ⚓ `anogo` / 🧭 `ogomo`.

Overlay rows to add (sense_form, pos, kind `clause_pole`): `elerem` / `obomam` on `h` and `g`. Continue is ending **-r**, not extra rows.

### Channel and play (existing overlays)

No new evidential or NOTIONAL roots. Write them as today (`huvuvum`, `hadezem`, `hadadem`, …). Scope (below) is what lets them last.

### Frame-scope hooks (new prefix-less series)

Extra-noun and same-role hooks already occupy simplex **`a`/`e`/`o`/`u`** and the stacks **`ao` `oe` `ua` `uo` `ae` `ue`**. Unused two-vowel stacks **`ea` `eo` `ee` `eu`** are this series. They are **hooks** (no role letter, not lexicon overlays). They do **not** take `/b/`.

Cue: a leading **`e`** (order) plus the [vowel series](../grammar/vowel-series.md) for **how far the preceding frame run reaches**. Teach **-l** only.

| Hook | Vowels | Duration | Cue |
|------|--------|----------|-----|
| **`eal`** | **ea** | **this word** — the content word immediately left of the frame run (or left of this hook if the run is empty and you are clearing — not used) | **a** ≈ add onto this token |
| **`eol`** | **eo** | **this clause** (one host clause) | **o** ≈ one |
| **`eel`** | **ee** | **this speech-act body** — opener through later `/x/` clauses until a new `/j/` (or recoverable new turn) | **e** ≈ order of the act |
| **`eul`** | **eu** | **until undone** | **u** ≈ undo |

**Default when no scope hook:** this **clause** (same as **`eol`**). Omit the hook in ordinary one-clause marking.

**Placement:** immediately **after** the frame word, or after the hosted *as-of* pair (`… /b/` then the hook). A **run** of consecutive frame `/h/` (and/or one hosted *as-of* pair) shares **one** hook on the right; that duration applies to **every slot set in that run**.

**Standalone `eul`:** no frame word immediately left = **clear** every persistable slot back to defaults (speaker-now, unmarked channel, real tally). Standalone **`eol` / `eal` / `eel`** are illegal (nothing to size).

**Replace:** a new introduce in a slot overwrites that slot; other persist slots stay. **Clear** wipes the persist stack.

**Illegal:** scope hook with `/b/` on the right (not an extra-noun); **`eal`** when the left is not a content word; persist hook on a non-whitelist mood as if it were a frame (parser may still accept the hook; learner rule: it does not persist MAY / DECISION / …).

## *As-of* grammar

### Snapshot vs resume vs persist

| Job | Shape |
|-----|--------|
| **Set \(R\)** | Hosted **as-of** on `/h/` (clause) or `/ɡ/` (noun): overlay + `/b/` immediately after |
| **Reuse that snapshot value** | Same stem, ending **-r**, **no** `/b/` |
| **How far \(R\) lasts** | Scope hook after the pair (or after resume), or default = this clause |

Resume is like other **-r**: isolated `helerer` **parses**; learner rule: only after an *as-of* of **that stem**. Resume **with** a new `/b/` is illegal (that is a reset; use **-m** + `/b/`).

### Factivity

Factivity is **not** on causal *if*. **`hadorom`** does not plant \(R\). Unasserted *as-of* is the **hypothetical now** so PREDICT / PLAN / RESIDUE / FORMER can score against a scene you are **not** claiming.

**NOTIONAL** stays play / off the real tally for the **host**. Do not use it for *if he had* (serious other-world reasoning). Play may stack with \(R\) (*as if, from Friday’s books*).

| English | Shape |
|---------|--------|
| *As of Friday, the leaving still counts* | Asserted *as-of* + RESIDUE |
| *If it rains, Azawan walks* | **`hadorom`** only (speaker-now) |
| *If he had left, the door would still be shut* | Unasserted *as-of* + RESIDUE (and PREDICT if *would* is later-than-\(R\)) |
| *If he had meant to walk* | Unasserted *as-of* + PLAN |
| *As if he had left* | NOTIONAL on the content verb |
| Memory of Friday’s leftover | WITNESSED + asserted *as-of* + RESIDUE |
| Memory **paragraph** | WITNESSED + asserted *as-of* + **`eul`**; score moods local |
| Historical present | LIVE + marked \(R\) |
| *Would* throughout a stretch | marked \(R\) + PREDICT + **`eul`** (or **`eel`** if only this turn) |

Causal *if* plus a **real** dated ledger remains legal (*if it rains, then as of Friday the tab still counts*): both poles, different jobs.

### What `/b/` may be

Clock or date, event noun (*as of the leaving*), **`barl`** + next sentence (that sentence **is** \(R\)), extra-noun **-r**. **`barl` factivity follows the pole** (asserted claims the scene; unasserted does not).

Do **not** put a bare person in `/b/` as “from Ululon’s now” (collides with proxy **`hudagam`**). Prefer *as of Ululon’s telling* or `barl` + he tells.

On `/ɡ/`, the noun is scored as of that snapshot (*the tab as of Friday*); clause moods still need `/h/` *as-of* if the **verb** scores against \(R\).

### What \(R\) does to score moods

Once \(R\) is set on a host (or reused by resume-**-r**):

| Mood | Relative to \(R\) |
|------|-------------------|
| PREDICT | event **after** \(R\) (*would rain*) |
| PLAN | intention **from** \(R\) (*was going to*) |
| RESIDUE | leftover on **that** tally |
| FORMER | not **that stretch’s** climate |

**Bare verb + *as-of*:** legal = **concurrent with \(R\)** (event *at* snapshot-now: *as of Friday, Azawan is in Paris*). Teach scoring moods as the usual pair so learners do not hear *as-of* as event-when. Clock / *before* / *after* may sit beside *as-of*: *as-of* = books; the other `/h/` = event order.

## Channel and play under the same scope

Write the evidential or NOTIONAL `/h/` as today. Put **`eal` / `eol` / `eel` / `eul`** immediately after it (or after a run that also contains *as-of*).

`/w/` evidential / NOTIONAL still grades a preceding `/ɡ/` adjective (current grammar). **`eal`** grades an immediately preceding content word of any role. Prefer `/w/` on a value adjective; prefer **`eal`** on a verb or noun when the channel or play is only for that word.

**One channel per host clause.** Stacking LIVE + WITNESSED stays illegal. Persist then replace is how a paragraph switches from memory to live look.

## Binding and islands

\(R\), channel, and play sit on the **host** of the marked pair/run, like a speech act, then last as long as the scope hook (or default clause).

**Does not inherit frames** (inner PREDICT defaults to after **speech-now**; inner evidential defaults to unmarked):

- The **`barl` snapshot body** (defines \(R\); no leak inward)
- Clock / *before* / *after* (event order)
- **`darl` / `hadorom` / `holalam` bodies** unless they contain their own frames
- Aside spans and opaque / cite interiors

### `^ … ^` (join / `/h/` islands)

Keep existing [scope islands](../grammar/joins.md#scope-islands-join): binder inside is `/h/` and/or a join; no nesting.

**Length cap:** an island is a **handful of words**, and **never longer than one written sentence**. Do not wrap a memory paragraph, a chain of `/x/` clauses, or a multi-sentence *would* stretch in `^ … ^`. Those use **`eel`** or **`eul`**. Inside an island, `/h/` frames **that chunk only** (a word or a tight phrase), then the island ends. Prosody-only edges; not a discourse persist device.

Span fences (`[…]`, `{…}`, asides) are wording packages, not viewpoint paragraphs.

## Stacking

- **One** *as-of* pair per host clause. Two snapshots on one verb: illegal.
- **One** channel; **one** play root.
- Nested clauses may each have one of each. Resume-**-r** of *as-of* resumes the **latest still-open snapshot of that stem**, not “the outer one” by magic.
- New hosted `/b/` on the same *as-of* stem **replaces** \(R\).
- Asserted and unasserted may both appear in a paragraph (different stems). Resume must match the stem.
- Persist **`eul`** then a new introduce in one slot replaces that slot only.
- Score claims may stack with frames on the same clause (`huvuvum honebam helerem badorol`).

Two *as-of* stems keep outer ledger vs inner bookmark from clobbering each other.

## Examples

House-cast people. Date `/b/` is a [calendar digit-string](../grammar/numbers-applied.md#time) (`b_#22,7` = 22 July). These sentences are **not** current language.

Asserted *as-of* + RESIDUE (default = this clause):

> `zululon honebam helerem b_#22,7 vebarum.`
>
> z-Ululon | h-RESIDUE | h-as-of | b-22-July | v-leave
>
> "As of 22 July, Ululon’s leaving still counts."

Bare verb concurrent with \(R\) (not event-when):

> `zazawan helerem b_#22,7 vajul al b@<Paris>.`
>
> z-Azawan | h-as-of | b-22-July | v-sit | in | b-Paris
>
> "As of 22 July, Azawan sits in Paris."

Causal *if* only (no \(R\); PREDICT would still be after **speech-now**):

> `zazawan vawalal hadorom banunul.`
>
> z-Azawan | v-walk | h-if | b-rain
>
> "Azawan walks if there is rain."

Unasserted *as-of* + RESIDUE + PREDICT (*if he had … would still*):

> `zadorol gologem honebam helezom hobomam barl zululon vebarum.`
>
> z-door | g-locked | h-RESIDUE | h-PREDICT | h-as-of.unasserted | b-that-clause | z-Ululon | v-leave
>
> "If Ululon had left, the door would still be locked." — bookmark now; leftover scored there; locked later-than that now

Unasserted *as-of* + PLAN:

> `zululon howoram vawalal hobomam b_#22,7.`
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

> `zululon huvuvum honebam helerem b_#22,7 vebarum.`
>
> z-Ululon | h-WITNESSED | h-RESIDUE | h-as-of | b-22-July | v-leave
>
> "Ululon’s leaving still counted on 22 July — from memory."

LIVE-at-\(R\) (camera in the snapshot):

> `zazawan hadezem helerem b_#22,7 vawalal.`
>
> z-Azawan | h-LIVE | h-as-of | b-22-July | v-walk
>
> "Azawan walks — live in the 22 July snapshot."

`barl` defines \(R\); the telling body does **not** inherit the ledger:

> `zululon honebam vebarum helerem barl zululon vezehel.`
>
> z-Ululon | h-RESIDUE | v-leave | h-as-of | b-that-clause | z-Ululon | v-tell
>
> "As of Ululon’s telling, the leaving still counts." — the telling sentence is the dated now, not itself leftover

Resume of that snapshot on the next clause (still local; no **`eul`**):

> `zululon honebam helerem b_#22,7 vebarum. xazawan honebam helerer vawalal.`
>
> z-Ululon | h-RESIDUE | h-as-of | b-22-July | v-leave | x-Azawan | h-RESIDUE | h-as-of.resume | v-walk
>
> "As of 22 July, Ululon’s leaving still counts. Azawan’s walking still counts — same ledger."

`/ɡ/` twin on a noun (clause moods still need `/h/` if the verb scores against \(R\)):

> `zonebam gelerem b_#22,7.`
>
> z-money-bag | g-as-of | b-22-July
>
> "The tab as of 22 July."

**`eal`** — channel on one verb only:

> `zululon dazawan vejel huvuvum eal.`
>
> z-Ululon | d-Azawan | v-see | h-WITNESSED | this-word
>
> "Ululon sees Azawan — that *see* from memory."

**`eel`** — channel + \(R\) through `/x/` until a new turn; RESIDUE stays local:

> `zululon huvuvum helerem b_#22,7 eel honebam vebarum. xazawan vawalal.`
>
> z-Ululon | h-WITNESSED | h-as-of | b-22-July | this-speech-act | h-RESIDUE | v-leave | x-Azawan | v-walk
>
> "From memory, as of 22 July: Ululon’s leaving still counts. Azawan walks." — second clause keeps memory and the date, not leftover

**`eul`** persist, then standalone clear:

> `zululon huvuvum helerem b_#22,7 eul honebam vebarum. xazawan vawalal. eul. zuhubun vogorol.`
>
> z-Ululon | h-WITNESSED | h-as-of | b-22-July | until-undone | h-RESIDUE | v-leave | x-Azawan | v-walk | undo-frames | z-Uhubun | v-cry
>
> Memory + 22 July last through Azawan’s walking. **`eul`** returns to speaker-now / unmarked. Uhubun’s crying is a fresh report.

PREDICT persist (*would* through a stretch):

> `helezom hobomam b_#22,7 eul vanunul. xazawan vawalal.`
>
> h-PREDICT | h-as-of.unasserted | b-22-July | until-undone | v-rain | x-Azawan | v-walk
>
> "As of that bookmark, it would rain. Azawan would walk."

Short island (handful of words). Not a paragraph:

> `zazawan ^ huvuvum zululon zal ^ zam vejel.`
>
> z-Azawan | ^-start | h-WITNESSED | z-Ululon | z-and | ^-end | z-and.open | v-see
>
> "Azawan and (just Ululon, that conjunct from memory) see …."

Do **not** wrap a memory stretch in `^ … ^`. Use **`eel`** / **`eul`**.

Illegal (proxy, not whose now): not `helerem bululon`. Prefer `helerem barl zululon vezehel` or *as of Ululon’s telling*.

*If it rains, then as of 22 July the tab still counts* (both poles):

> `zonebam honebam helerem b_#22,7 hadorom banunul.`
>
> z-money-bag | h-RESIDUE | h-as-of | b-22-July | h-if | b-rain
>
> "If there is rain, the tab still counts as of 22 July."

## Parser vs discourse

| Layer | Rule |
|-------|------|
| Sentence parse | Hosted + `/b/` introduces *as-of*; stem + **-r** and no `/b/` resumes. Isolated `helerer` **parses**. Scope hooks parse as prefix-less **`ea`/`eo`/`ee`/`eu`** + **-l**; no `/b/`. |
| Learner rule | Resume only after an *as-of* of **that stem**. Persist only after an introduce of a persistable slot. Standalone **`eul`** clears. Islands stay short. |
| Docs examples | A block that uses resume or **`eul`** includes the hosted pair / channel / play in that block. |
| Cheap local checks | Hosted *as-of* without `/b/` unless **-r**; **-r** *as-of* with `/b/` is illegal; scope + `/b/` illegal; standalone non-**`eul`** scope illegal. |
| Cross-sentence bind | Optional later. Do **not** require paragraph state for the first absorb. **`eul`** is a learner/discourse rule until a later resolve pass. |

## Compare with

| Other device | Job |
|--------------|-----|
| Clock / date / **`oranem`** | Event-when, not books |
| **`hadorom`** | Causal *if*; no \(R\) |
| NOTIONAL | Play, not hypothetical ledger |
| **`hudagam`** | Whose agency, not whose now |
| Speech act + `/x/` | Inherit **act**, not frames, unless **`eel`/`eul`** |
| TALE **`horolom`** | Channel = lore, not \(R\) |
| Ambient **`Ne0`** | Order of magnitude, not time |

## Absorb sketch (if yes)

1. Overlay rows for `elerem` / `obomam` on `/h/` and `/ɡ/`; resume is ending **-r**.
2. Teach prefix-less **`eal` `eol` `eel` `eul`** on [hooks.md](../grammar/hooks.md) (new family) and the poles on [relations.md](../grammar/relations.md); link from [knowing.md](../grammar/knowing.md) / [intention.md](../grammar/intention.md): *as-of* vs *after* vs PREDICT vs *if* vs channel persist.
3. LIVE-at-\(R\); concurrent bare verb + *as-of*; island length cap.
4. [why-agelan.md](../grammar/why-agelan.md): rumination = which ledger; *had … would* = bookmark, not play; memory paragraphs = opt-in channel persist, not shame-repeat and not silent leak.
5. [grammar-gaps.md](../meta/grammar-gaps.md) item 14 / time: viewpoint as hosted pole + scope hooks, not a tense letter.
6. Parser: hosted pair like other `clause_pole`; hook series `ea`/`eo`/`ee`/`eu`; no last-scene inference; optional local **-r** `/b/` clash; no required paragraph state.
7. Drills (later, not in this file): asserted + RESIDUE; persist channel; unasserted *had … would*; LIVE-at-\(R\); negative *if it rains* without *as-of*; island too long as a **don’t**.

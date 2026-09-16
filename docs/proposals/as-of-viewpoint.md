# Proposal: hosted *as-of* (viewpoint time)

**Status:** PROPOSED (not current language). Grammar today: verbs have **no** past/future letter; PREDICT is later than **speech-now**; RESIDUE / FORMER score the **current** tally / climate; *before* / *after* / *while* order **events**. There is no reference now \(R\) other than speaker-now \(S\).  
**Related:** [commentary.md](../grammar/commentary.md) (LIVE / WITNESSED / RESIDUE / FORMER / NOTIONAL), [plan-decision.md](../grammar/plan-decision.md) (PLAN / PREDICT), [causation.md](../grammar/causation.md#factivity) (*if* vs *because*), [dependents.md](../grammar/dependents.md) (`barl`, `/x/` continue), [relations.md](../grammar/relations.md) (hosted `/h|ɡ/` + `/b/`), [numbers-applied.md](../grammar/numbers-applied.md#time) (clock / date), [why-agelan.md](../grammar/why-agelan.md#residue-and-former-climate)  
**Design authority:** none until absorbed. Speakers currently do **not** mark *would* / *as of Friday* / *if he had* as a dated snapshot.

## Motivation

English *would*, *was going to*, *will have*, *still counted then*, and *if he had* mix **when the event sits** with **whose now** leftover, climate, plan, and forecast are scored against.

Agalan already splits those moods. It still scores them against **speech-now**. A remembered telling plus PREDICT is heard as *will rain* (after **now**), not *would rain* (after **that telling**). RESIDUE is leftover on **today’s** books, not Friday’s.

**Viewpoint time** is that missing \(R\). Event order stays *before* / *after* / clock. Evidential channel stays how **you** know at \(S\) (unless LIVE-at-\(R\) is absorbed later).

**Default omit = speaker-now.** Forcing \(R\) on every clause would add shame and extra thought. Mark it when English would smuggle *would* / *as of* / *had … would*.

## Non-goals

- A past / present / future letter on `/v/`.
- Progressive / mid-course aspect (stays *while* / LIVE paraphrase).
- “Last scene” as an implicit \(R\) (a telling, an *if*-clause, or a clock does **not** plant viewpoint by itself).
- Reusing discourse **`x#e0`**, TALE **`horolom`**, or *after* **`oranem`** as viewpoint.
- Paragraph-level parse state as a requirement for the first absorb.
- Observation vs imagination tense ([TODO.md](../../TODO.md) evidentiality notes).

## Recommended design

### Snapshot vs continue

| Job | Shape |
|-----|--------|
| **Set \(R\)** | Hosted **as-of** on `/h/` (clause) or `/ɡ/` (noun): overlay + `/b/` immediately after |
| **Keep \(R\)** | **Same stem**, ending **-r**, **no** `/b/` (floating `/h/`). Resume of that pole only |

Continue is **not** a second mood and **not** a last-scene overlay. Isolated continue is like other **-r**: legal shape, bad discourse if no prior *as-of* of **that stem**.

### Two factivity roots (like *because* / *if*)

Factivity is **not** on causal *if*. **`hadorom`** does not plant \(R\). Unasserted *as-of* is the **hypothetical now** so PREDICT / PLAN / RESIDUE / FORMER can score against a scene you are **not** claiming.

**NOTIONAL** stays play / off the real tally for the **host** clause. Do not use it for *if he had* (serious other-world reasoning).

| English | Shape |
|---------|--------|
| *As of Friday, the leaving still counts* | Asserted *as-of* + RESIDUE |
| *If it rains, Azawan walks* | **`hadorom`** only (speaker-now) |
| *If he had left, the door would still be shut* | Unasserted *as-of* + RESIDUE (and PREDICT if *would* is later-than-\(R\)) |
| *If he had meant to walk* | Unasserted *as-of* + PLAN |
| *As if he had left* | NOTIONAL on the content verb |

Causal *if* plus a **real** dated ledger remains legal (*if it rains, then as of Friday the tab still counts*): both poles, different jobs.

### Overlay picks

New overlay **`kind`:** `clause_pole` (hosted `/b/`, morph `mood`). Ending **-m** like other poles. Do **not** reuse ⌛ `orane` (*after*) or 📌 `ubuhu` (*at*).

| Factivity | Picture | Stem | Overlay (clause) | `/ɡ/` twin | Cue |
|-----------|---------|------|------------------|------------|-----|
| **Asserted** (default) | 📒 ledger | `elere` | `helerem` | `gelerem` | dated **line in the books**; leftover is scored on that page |
| **Unasserted** | 🔖 bookmark | `oboma` | `hobomam` | `gobomam` | **placeholder** in the story, not a stamped line |

`elere` has no published metaphor yet; ordinary `zelere` stays *a ledger*. `oboma`’s published metaphor stays *reminder*; overlay is the hypothetical-now reading. Continue: `helerer` / `hobomar`.

**Avoided:** 📅 `alena` (clock/date already do schedule), 🎥 `omovu` (too close to RECORDED), 🦭 `ezeza` (too “audit-official” for lunch), ⚓ `anogo` / 🧭 `ogomo` (grounding / PLAN-ish).

### What `/b/` may be

Clock or date, event noun (*as of the leaving*), **`barl`** + next sentence (that sentence **is** \(R\)), extra-noun **-r**. **`barl` factivity follows the pole** (asserted claims the scene; unasserted does not).

Do **not** put a bare person in `/b/` as “from Ululon’s now” (collides with proxy **`hudagam`**). Prefer *as of Ululon’s telling* or `barl` + he tells.

### What *as-of* does to moods

Once \(R\) is set on a host clause (or copied by continue-**-r**):

| Mood | Relative to \(R\) |
|------|-------------------|
| PREDICT | event **after** \(R\) (*would rain*) |
| PLAN | intention **from** \(R\) (*was going to*) |
| RESIDUE | leftover on **that** tally |
| FORMER | not **that stretch’s** climate |

Evidential channel stays how **you** know at \(S\).

**Bare verb + *as-of* (open at absorb):** prefer **illegal unless** PREDICT / PLAN / RESIDUE / FORMER (or LIVE, if allowed) is present — otherwise speakers will hear *as-of Friday* as event-when and collide with clock / *after*. Alternative if that is too strict: concurrent with the snapshot (event *at* \(R\)-now).

**Event-when in the same clause:** allow clock / *before* / *after* beside *as-of*. Teach: *as-of* = books; the other `/h/` = event order.

### Binding (clause feature)

\(R\) sits on the **host clause** of the pair, like a speech act.

**Scores:** that host; later clauses with **continue-**-r** of the **same stem** (after `.` or `/x/`) until a new *as-of* or omit (back to \(S\)).

**Does not score:**

- The **`barl` snapshot body** (defines \(R\); no leak inward)
- Clock / *before* / *after* (event order)
- **`darl` / `hadorom` / `holalam` bodies** unless they contain their own *as-of* or continue-**-r** (inner PREDICT defaults to after **speech-now**)

### Stacking

- **One** *as-of* pair per host clause. Two snapshots on one verb: illegal.
- Nested clauses may each have one. Continue-**-r** resumes the **latest still-open *as-of* of that stem**, not “the outer one” by magic.
- New hosted `/b/` on the same stem **replaces** \(R\).
- Asserted and unasserted may both appear in a paragraph (different stems). Continue must match the stem.
- Continue-**-r** **with** a new `/b/` is illegal (that is a reset; use **-m** + `/b/`).

Two stems also keep outer ledger vs inner bookmark from clobbering each other.

### Parser vs discourse

Same as other **-r** (house-cast resume without a same-line antecedent already parses).

| Layer | Rule |
|-------|------|
| Sentence parse | Hosted + `/b/` introduces; stem + **-r** and no `/b/` continues. Isolated `helerer` **parses**. |
| Learner rule | Continue only after an *as-of* of **that stem** in the discourse. |
| Docs examples | A drill that uses continue includes the hosted pair (or a prior sentence in the same block). |
| Cheap local checks | Hosted *as-of* without `/b/` unless **-r**; **-r** *as-of* with `/b/` is illegal. |
| Cross-sentence bind | Optional later. Do **not** require paragraph state for the first absorb. |

## Open at absorb (not blockers)

- **LIVE at \(R\):** legal = camera still in that snapshot (narrative present; not WITNESSED). Illegal = LIVE stays speaker-now. Compassion-relevant; pick before teaching historical present.
- Bare verb + *as-of* (illegal unless a scoring mood vs concurrent-with-\(R\)).
- First-pass scope: overlays + grammar + examples vs parser host-check in the same pass.

## Absorb sketch (if yes)

1. Overlay rows for `elerem` / `obomam` on `/h/` and `/ɡ/`; continue is ending **-r**, not extra rows.
2. Teach on [relations.md](../grammar/relations.md) or a short section linked from [commentary.md](../grammar/commentary.md) / [plan-decision.md](../grammar/plan-decision.md): *as-of* vs *after* vs PREDICT vs *if*.
3. Compare-with: NOTIONAL, **`hadorom`**, clock, **`oranem`**, proxy.
4. [why-agelan.md](../grammar/why-agelan.md): rumination = which ledger; *had … would* = bookmark, not play.
5. [grammar-gaps.md](../meta/grammar-gaps.md) item 14 / time: viewpoint as hosted pole, not a tense letter.
6. Parser: hosted pair like other `clause_pole`; no last-scene inference; optional local **-r** `/b/` clash.
7. Drills: asserted + RESIDUE; continue + PREDICT (*would*); unasserted *had … would*; one negative *if it rains* without *as-of*.

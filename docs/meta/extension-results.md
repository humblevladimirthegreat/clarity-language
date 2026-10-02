# Extension sweep results

Editors only — not linked from grammar pages. Findings from Phase 3 of the expressiveness review (`docs/proposals/expressiveness-review.md`): every productive mechanism crossed with every place it could apply, and each empty cell judged. Rows are logged per batch, ruled by the language owner, and applied before the next batch starts; each row's **Outcome** records the ruling.

Progress: batch 1 (word endings pilot) ruled and applied. Wave 0 batch 2 (role-letter structure) ruled and applied. Wave 1 (vowel series, tone marks) ruled and applied. Other mechanisms not started.

## How to read this file

Each mechanism has a grid and a row table. A grid cell is one of:

- **def** — defined on the owning page.
- **gen** — no family reading, but a general rule already gives one (for example **-n** as an ordinary proper name, or **-r** as a content resume).
- **E-nn** — an empty cell, or a cell held only by a general rule, with a candidate reading logged below.
- **none** — no reading; listed in [unassigned-reserved](unassigned-reserved.md).
- **—** — owned by another mechanism's grid (named in the section).

Row verdicts:

- **intuitive** — a learner who knows the mechanism and the family could guess the reading without being told, and nothing in [design-decisions](design-decisions.md) rules it out.
- **intuitive but redundant** — intuitive, but an existing route already says the same thing. The **Better than current route?** column says whether the new form would still be an improvement (shorter, earlier stage, or clearer).
- **forced** — a reading exists but must be taught as a new rule, or a learner would just as easily guess a different, already-live reading.

**Priority** is **P1** common everyday English · **P2** common in writing · **P3** niche. **Closes** names a ruled `G-nn` row (Phase 1 / 2) or an English job with no current route, found with `find-english.mjs` (phrases tried are listed). Each candidate spelling was run through `node scripts/parse.mjs --check-lexicon`, and checked for a resume reading in context.

Inconsistencies in the existing grammar found along the way are logged as `C-nn` rows in [Inconsistencies](#inconsistencies). They are not extensions. Each needs a ruling on the owning page.

Each cell belongs to exactly one grid, so the same cell is never logged twice:

| Cell | Owning grid |
|------|-------------|
| Endings on closed content roots (overlay moods, clause poles, relations, identity), the `/y/` act and polar series, linkers, special pronouns | Word endings |
| Endings on join-shaped series (phrase joins, restrictors, stance joins, join-acts, join-relations) | Joins |
| Endings on hooks | Hooks |
| Endings on number words | Numbers |
| Endings on span fences | Spans |
| Endings after a mid-word `x` / `th` seam (ability vowels, sake words, emotion compose) | Mid-word `x` and `th` |
| Stand-in endings (`-rl` / `-rm` / `-rth` / `-rn`) | Stand-ins |
| Which role letters a closed root takes | Mood roots × role letters |

## Ending patterns already in use

Later grids use this as the guessability test: a candidate counts as intuitive when it reuses one of these patterns on a family where that pattern clearly fits, and no other live reading competes.

| Pattern | **-l** | **-m** | **-n** | **-r** | Where |
|---------|--------|--------|--------|--------|-------|
| Content reference | concrete | abstract | name | resume | every content root |
| List completeness | closed | open (*maybe more*) | named package / stock | unspecified member | joins, restrictors, hooks, speech acts |
| Strong-to-light | strongest / most settled / lasting | default, unstated | ordinary proper | lightest / for now / just formed | evidentials, mirative, MAY, NOTIONAL, PLAN, DECISION, ATTEMPT, WANT, deontics, phasal, polar stance, sake words |
| Blame and share | broke a norm (fault) | plain cause | ordinary proper | one share among several | `because` only |

**-r on closed roots has a live competitor.** A closed root is short (`ege`, `amo`, `umu`, `oye`), so role letter + root + **-r** is also the full-root content [resume](../grammar/pronouns.md#resume-r) of that root. The parser resolves `theger`, `thamor`, `humur` and `thoyer` as resumes of an earlier `thegem`, `thamom`, `humum` and `thoyem` today. A hosted `/b/` can still follow a resume (`thoyer berehel` reads as *if* again, now with rain, roughly *also if it rains*). So on any closed root where **-r** is not yet a grade, a learner who knows resume guesses resume. An **-r** grade there is **forced**, however natural the grade itself. See C-02 for how unevenly the existing families handle this.

For **-l**, "strongest" and "broke a norm" compete, so a family that has neither reading has no single guessable **-l**.

## Word endings (pilot)

Owning page: [word-endings](../grammar/word-endings.md); each family's own page owns its forms. Source inventory: [lexicon-overlays.csv](../../data/lexicon-overlays.csv).

### Grid

| Family | Roles | **-l** | **-m** | **-n** | **-r** |
|--------|-------|--------|--------|--------|--------|
| Evidential channels (7) | `/th/` `/w/` | def strong | def | gen | def weak |
| Mirative | `/th/` | def firm | def | gen | def loose |
| MAY / NOTIONAL | `/th/` `/w/` | def | def | def (C-03) | def |
| PLAN / DECISION / ATTEMPT / WANT | `/th/` `/w/` | def | def | def (C-03) | def |
| Deontic (permit / forbid / require / consent) | `/th/` | def | def | gen | def |
| Phasal (already / still / not yet / no longer) | `/h/` `/w/` | def lasting | def | gen | def for now |
| RESIDUE `amo` | `/th/` `/w/` | E-05 | def | gen | gen resume; E-05 |
| FORMER `eno` | `/th/` `/w/` | E-06 | def | gen | gen resume; E-06 |
| CAUSE `ege` | `/th/` `/w/` | E-04 | def | gen | gen resume; E-03 |
| ABIL `eze` | `/th/` `/w/` | — (`x` seam) | — | — | — |
| Pole: *because* `eve` | `/th/` `/ɡ/` | def fault | def | gen | def share (no resume) |
| Pole: *if* `oye` | `/th/` `/ɡ/` | E-08 | def | gen | gen resume; E-02 |
| Pole: *only if* `olu` | `/th/` `/ɡ/` | none | def | gen | gen resume; E-02 |
| Pole: *iff* `eda` | `/th/` `/ɡ/` | none | def | gen | gen resume |
| Pole: *so that* `ogo` | `/ɡ/` `/h/` | none | def | gen | gen resume; E-02 |
| Pole: *so … that* result `odu` | `/h/` | none | def | gen | gen resume |
| Poles: *although*, *while*, *before*, *after* | `/ɡ/` `/h/` | none | def | gen | gen resume |
| Poles: *until* / *by* `oma` | `/ɡ/` `/h/` | def *by* | def *until* | gen | gen resume |
| Pole: as-of `uhu` / `ura` | all four | none | def | gen | def resume |
| Similative `umu` | `/ɡ/` `/h/` | E-07 | def | gen | gen resume; E-07 |
| Exchange, proxy, of-relations (4), locatives (3) | `/ɡ/` `/h/` | none | def | gen | gen resume |
| Stimulus `obu` | `/ɡ/` | none | def | gen | gen resume |
| Respectively `aze` | `/w/` | none | def | gen | gen resume |
| Identity SAME `ugo` | `/ɡ/` | def | def | none (listed) | none (listed) |
| Bare sake roots | `/th/` `/w/` | — (`th` seam) | — | — | — |
| Speech acts `ya` / `yo` / `ye` / `yu` | `/y/` | def | def | none | def (E-01) |
| Polar stance (5) | `/y/` | def | def | none | def |
| Special pronouns | all nouns | content | content | def | def resume |
| Sentence linkers (6) | `/x/` | def on three (E-09); none on three | def (E-09) | gen | def resume |

### Rows

#### E-01 — speech act **-r** (`yar` / `yor` / `yer` / `yur`) · intuitive · P2

- **Proposed reading:** an act **just formed** or **for now**, matching polar **-r**: `yar` first-take statement (*off the top of my head*, *at first glance*); `yor` a question that just occurred to you (*wait — …?*); `yer` an instruction for now (*go ahead for now*); `yur` a prohibition for now (*hold off on …*, *don't … yet*)
- **Example:** `yur vowogal.` — y-prohibit-for-now | v-walk — "Hold off on walking for now."
- **Pattern:** strong-to-light, from polar stance in the same `/y/` slot with the same vowels
- **Current route:** no single form; `yul` / `yum` plus a time phrase
- **Better than current route:** yes: one word, and it marks the act itself as provisional
- **Conflicts and notes:** No resume conflict: act words are a join-shaped series, not content, and a one-vowel stem can't be a resume prefix. The parser already reads these as act words with no gloss. `yuor` (*not right now*) answers an offer; `yur` forbids, so they don't overlap. `yor` sits close to soft `yom`, so it may be the weakest of the four.
- **Closes:** *hold off*, *for now* (instruction), *off the top of my head*: no form found
- **Outcome:** adopted — taught in [speech-moves § just formed or for now](../grammar/speech-moves.md#act-r), with parser glosses and drills.

#### E-02 — pole **-r** on *if*, *only if*, *so that* (`thoyer` / `goyer`, `tholur` / `golur`, `hogor` / `gogor`) · forced · P2

- **Proposed reading:** **one of several**, as on `thever`: `thoyer` one sufficient condition among others (*if, for instance*); `tholur` one requirement among others (*needs X, among other things*); `hogor` partly for this purpose (*partly so that*)
- **Example:** `zazawan vowogal tholur berehel.` — z-Azawan | v-walk | [th-only-if.share | b-rain] — "Azawan walks only if it rains — among other things."
- **Pattern:** blame and share (**-r**), plus list **-r** member
- **Current route:** `thever` covers *partly because* only; the rest need a join of conditions or a second sentence
- **Better than current route:** yes, for *partly so that* and *one requirement among several*
- **Conflicts and notes:** Today these spellings are resumes of the pole (`thoyer berehel` ≈ *also if it rains*), so the share reading competes with a live one. Bare `thoyer` as a resume is itself useful (*if so* / *in that case* has no other form; `say-people-places` routes *in that case* through `thoyem barl`). Taking **-r** for share would lose that, as it already has on `because`. The parser also rejects `hogor barl` (a hosted stand-in may only follow a listed pole). *iff*, *although*, *while*, *before*, *after*, *until* and the result pole get no share reading: it contradicts *iff* and makes no sense for time order.
- **Closes:** *partly so that*, *one of the conditions*, *among other things*: only `thever`
- **Outcome:** not adopted.

#### E-03 — CAUSE **-r** (`theger`) · forced · P2

- **Proposed reading:** the mechanism is **one contributing push**, not the whole cause (*helps bring about*, *contributes to*, *nudges*)
- **Example:** `zalahen vowogal theger bazawan.` — z-Alahen | v-walk | [th-CAUSE.share | b-Azawan] — "Azawan helped get Alahen walking."
- **Pattern:** blame and share, and strong-to-light (both **-r** grades agree)
- **Current route:** `thegem` (whole mechanism) or `thever` (one reason among several)
- **Better than current route:** slightly: names the how rather than the why
- **Conflicts and notes:** Same resume conflict as E-02 (`theger bazawan` today ≈ *Azawan also caused it*). Close to `thever`: `thever` shares the **why**, `theger` the **how**. Phase 4 should decide whether both are needed.
- **Closes:** *encourage* currently routes through `thohum … thegem` (say-reasons § cause verbs)
- **Outcome:** not adopted.

#### E-04 — CAUSE **-l** (`thegel`) · forced · P3

- **Proposed reading:** the mechanism **compels**: no room to do otherwise (*force*, *make* in the strong sense)
- **Example:** `zalahen vowogal thegel bazawan.` — z-Alahen | v-walk | [th-CAUSE.compel | b-Azawan] — "Azawan forced Alahen to walk."
- **Pattern:** strong-to-light **-l**; competes with the *because* fault **-l**
- **Current route:** refused consent plus CAUSE (*against their will*, sakes § consent)
- **Better than current route:** no: the consent route names whose will was overridden, which fits the empowerment theme better
- **Conflicts and notes:** Two readings are guessable (strongest vs wrongful).
- **Closes:** *force*: no table entry
- **Outcome:** not adopted.

#### E-05 — RESIDUE **-l** / **-r** (`thamol` / `thamor`) · forced, and redundant · P3

- **Proposed reading:** the outcome still counts **for good** / **for now**
- **Example:** `zalahen thamor vedabal.` — z-Alahen | th-RESIDUE.for-now | v-leave — "Alahen's leaving still counts, for now."
- **Pattern:** strong-to-light, from phasal (`agel` / `ager` *still*, lasting / for now)
- **Current route:** `thamom` plus a phasal adverb
- **Better than current route:** no: the phasal adverb is already transparent
- **Conflicts and notes:** **-r** is a live resume today (`thamor` resumes an earlier `thamom`).
- **Closes:** —
- **Outcome:** not adopted.

#### E-06 — FORMER **-l** / **-r** (`thenol` / `thenor`) · forced, and redundant · P3

- **Proposed reading:** the old pattern is over **for good** / **for now** (a lapse)
- **Example:** `zazawan hual vezebel thenor.` — z-Azawan | h-always | v-tell | th-FORMER.for-now — "Azawan used to always tell — lapsed for now."
- **Pattern:** strong-to-light, from phasal *no longer* (`ewel` / `ewer`)
- **Current route:** `thenom` plus `hewel` / `hewer`
- **Better than current route:** no
- **Conflicts and notes:** **-r** is a live resume today. Duplicates the phasal *no longer* endings.
- **Closes:** —
- **Outcome:** not adopted.

#### E-07 — similative **-l** / **-r** (`humul` / `humur`, `gumul` / `gumur`) · forced, and redundant · P3

- **Proposed reading:** **exactly like** / **a bit like** (*just like*, *reminiscent of*)
- **Example:** `zazawan vowogal humur balahen.` — z-Azawan | v-walk | [h-like.loose | b-Alahen] — "Azawan walks a bit like Alahen."
- **Pattern:** list completeness (**-l** the whole story, **-r** partial) and strong-to-light agree
- **Current route:** `/w/` degree before `humum` (`welavam humum` *very like*, `wamazam humum` *a bit like*)
- **Better than current route:** only for *exactly like*, if no degree word covers it (a `/w/` gap, not an ending one)
- **Conflicts and notes:** **-r** is a live resume today (`humur balahen` ≈ *likewise like Alahen*).
- **Closes:** *exactly like*: no form found
- **Outcome:** not adopted.

#### E-08 — *if* **-l** (`thoyel`) · forced · P3

- **Proposed reading:** a condition **set by a rule or agreement** (*if you're late, you pay*)
- **Example:** `zazawan vowogal thoyel berehel.` — z-Azawan | v-walk | [th-if.rule | b-rain] — "By the rule, Azawan walks if it rains."
- **Pattern:** blame and share **-l** (norms)
- **Current route:** `thoyem` plus a deontic (`thumel` *required by rule*)
- **Better than current route:** no
- **Conflicts and notes:** Only *because* uses **-l** for norms, so a learner wouldn't guess it here.
- **Closes:** —
- **Outcome:** not adopted.

#### E-09 — linker endings, treating the six linkers as a closed set · **-m** intuitive; **-l** forced · P2

- **Proposed reading:** **-m** default (the root's abstract sense is already the linker's meaning: `odu` *progress* → *therefore*, `ezo` *contrast* → *however*, `agaga` *passage* → *meanwhile*, `evave` *sequence* → *next*, `ageza` *blockage* → *but*, `avaze` *accessory* → *by the way*). **-l** a firm link on the strong-to-light scale (*it necessarily follows*, *nevertheless*). **-r** stays the existing resume (*likewise*, *and so*).
- **Example:** `zodogal vowogal. xezom zagadul varahal.` — z-dog | v-walk . x-however | z-cat | v-run — "The dog walks. However, the cat runs."
- **Pattern:** content reference (**-m** abstract) and strong-to-light (**-m** default) agree on **-m**; **-l** from strong-to-light
- **Current route:** five linkers use **-l** today; `xodum` uses **-m**
- **Better than current route:** yes: one consistent default, and the default matches the root's published abstract sense
- **Conflicts and notes:** **-l** "firm" has a clear reading for *therefore*, *however* and *but*, a weak one for *next* and *meanwhile*, and none for *by the way*; a per-linker table may be needed. Giving **-r** a grade instead would remove the documented *same linker again* resume (pronouns § How English approximates **-r**), so this keeps resume. If adopted, the parser would read only these six roots as linkers, and any other `/x/` content root + **-l** / **-m** at a sentence start would go to unassigned (see C-01).
- **Closes:** — (fixes C-01)
- **Outcome:** adopted — the six linkers default to **-m**; firm **-l** on *therefore*, *however*, *but* only ([dependents § sentence linkers](../grammar/dependents.md#sentence-linkers)). The parser rejects other `/x/` linkers on **-l** / **-m**; settled in [design-decisions](design-decisions.md#closed-root-endings).

### None (added to unassigned-reserved)

- `/y/` act and polar **-n** (`yan` / `yon` / `yen` / `yun`, `yaen` / …): on `/y/`, **-n** calls someone, and there is no named-formula interjection ([design-decisions](design-decisions.md)).
- Clause-pole **-r** grades on *iff*, *although*, *while*, *before*, *after*, *until* / *by*, and the result pole (the resume reading stays). Clause-pole **-l** beyond *because* and *by*.
- **-l** on exchange, proxy, of-relations, locatives, stimulus, and *respectively*.
- Firm **-l** on the linkers *meanwhile*, *next*, and *by the way*.

## Role-letter structure

Owning page: [clause](../grammar/clause.md). Wave 0 second batch. Cells checked with `node scripts/parse.mjs` (2026-10-02).

### Grid

| Axis | z | d | b | v | ɡ | w | h | th |
|------|---|---|---|---|---|---|---|----|
| Lean **`l`** (looks ahead to the next noun) | E-10 | E-10 | E-10 | E-11 | def (`gl-`) | none | none | none |
| `/w/` before it (degree) | none | none | none | E-12 | def | def (stacked) | def | def |
| Hosted `/b/` right after it | — | — | def (chain) | none | def | none | def | def |

Hooks as `/w/` and `/b/` hosts are **def** ([hooks](../grammar/hooks.md#hook-w)) and belong to the Hooks grid.

Parser findings: `zl-` / `dl-` / `bl-` / `vl-` / `hl-` / `thl-` / `wl-` do not parse (the only legal `l` cluster is `gl-`, [phonology](../grammar/phonology.md#phonotactics)); `/w/` before `/z/`, `/d/`, `/b/`, or `/v/` does not parse; `glowogal zodogal vezebal.` parses (a verb root in `/ɡ/` before the noun).

### Rows

#### E-10 — noun leaning ahead (`zl-` / `dl-` / `bl-`) · intuitive but redundant · P3

- **Proposed reading:** the noun describes the **next** noun, like `gl-` (*stone wall*, *dog house*)
- **Example:** none worth teaching; the route below already gives one word.
- **Pattern:** the lean **`l`** of `gl-`
- **Current route:** mid-word **`x`** glue (`zebeyaxabodel` *peanut butter*, [x-compounds](../grammar/x-compounds.md#ordinary-compound-order)), or an of-relation adjective
- **Better than current route:** no. The glued compound is one word and can be listed in the dictionary; a leaning noun would be a loose pair that reads as two nouns.
- **Conflicts and notes:** needs new legal clusters `zl` / `dl` / `bl` in phonology, and two nouns in a row would compete with a join or a new subject. `hl-`, `thl-`, `wl-` have no job: `/h/` and `/th/` already go anywhere, and `/w/` already sits before its host.
- **Closes:** *stone wall*, *dog house*: covered
- **Recommendation:** decline; add the none cells to unassigned-reserved.
- **Outcome:** declined — settled in [design-decisions](design-decisions.md) D-22; none cells added to unassigned-reserved.

#### E-11 — verb leaning ahead (`vl-`) · intuitive but redundant · P2

- **Proposed reading:** a participle before its noun (*a walking dog*, *running water*)
- **Example:** `glowogal zodogal vezebal.` — [gl-walk | z-dog] | v-sleep — "A walking dog sleeps." Already parses with no new form.
- **Pattern:** `gl-` plus the general rule that a root takes any role letter
- **Current route:** `gl-` + the verb's root, or `g` after the noun
- **Better than current route:** no new form needed. Gap: `find-english.mjs` (*walking dog*, *running water*, *falling leaves*, *sleeping*) finds no row that teaches an action root as an adjective, so the English job *V-ing noun* has no stated route.
- **Conflicts and notes:** the reading of a verb root in `/ɡ/` (the noun is doing it now, versus a standing property) needs one stated rule.
- **Closes:** *a walking dog*, *running water*: no row found
- **Recommendation:** decline `vl-`; add a recipe row for *V-ing noun* via `gl-` / `g` once the owner confirms the reading.
- **Outcome:** `vl-` declined (D-22). The recipe row is deferred until the reading of a verb root in `/ɡ/` is confirmed.

#### E-12 — degree before the verb (`/w/` + `/v/`) · forced · P3

- **Proposed reading:** `/w/` grades the action (*a lot*, *a little*, *really walks*)
- **Example:** `zodogal wamazam vowogal.` — does not parse today.
- **Pattern:** `/w/` before `/ɡ/` / `/h/` / `/th/`
- **Current route:** a degree word before a manner adverb (`welavam habezem`), `hrabul` / `hrubul` for *barely* / *almost*, `habedem` for *kind of* ([say-amounts](../grammar/say-amounts.md#degree-words))
- **Better than current route:** marginal.
- **Conflicts and notes:** [clause](../grammar/clause.md#adjective-detail-w) says `/w/` describes only the adjective (or adverb, stance, hook) right after it. A verb host would make `welavam vowogal` read as either *really walk* or a stray `/w/`, and `zodogal wamazam vowogal` clashes with the existing degree-before-adjective habit. Nouns have no `/w/` either: degree on a noun goes through an adjective (`wadeham gubuhel`), and focus words (*even*, *only*, *also*) are [joins and hooks](../grammar/say-amounts.md#focus-words).
- **Closes:** *walks a lot*, *sleeps a little*: only `welavam habezem`-style routes
- **Recommendation:** decline.
- **Outcome:** declined — D-22.

### None (to add to unassigned-reserved)

- `zl-` / `dl-` / `bl-` / `vl-` / `hl-` / `thl-` / `wl-` (see E-10, E-11).
- `/w/` before `/z/`, `/d/`, `/b/`, `/v/` (E-12).
- A hosted `/b/` after `/z/`, `/d/`, `/v/`, or `/w/`: a `/b/` there reads as the unhosted recipient, so no second reading is free.

C-05 is logged under [Inconsistencies](#inconsistencies).

## Vowel series and tone marks

Owning page: [speech-moves](../grammar/speech-moves.md). Wave 1. Cells checked with `node scripts/parse.mjs` (2026-10-02). The parser is looser than the docs here (it reads `yoel`, `aol`, `uol` as unassigned markers), so a form that parses is not a reading.

Scope: this grid asks whether each family covers the whole series (**a** add / **o** one / **e** order / **u** undo, and the six stacks `ao` `ua` `uo` `ae` `oe` `ue`). Endings, arity and role letters on the join-shaped series belong to the Joins and Hooks grids (waves 4, 5), so those rows only restate which vowel cells exist.

### Vowel grid

| Family | **a** | **o** | **e** | **u** | Stacks |
|--------|-------|-------|-------|-------|--------|
| Speech acts `/y/` | def | def | def | def | — (`yal yol` / `yam yol` stack two acts, def) |
| Polar stance `/y/` | — | — | — | — | `ae` `ao` `ue` `uo` `ua` def; `oe` E-13 |
| Stand-ins (`d` / `b` + vowel + **-rl** …) | def | def | def | def | none (one stand-in per act type) |
| Ability (`x` + vowel) | def | none (`xo` is *not yet*; no open *can*) | def | def | E-14 |
| Sake words (`th` + vowel) | def | def | def | def | E-15 |
| Scope label (`th` + vowel) | def | def | def | def | none |
| Presence on a name (`SELFx` + vowel) | def | def | def | def | none |
| Span TYPE / EDGE | def | def | def | def | — Spans grid (wave 6) |
| Hooks | def | def | def | def | — Hooks grid (wave 5); `aol` `ael` `uol` in-clause already listed none |
| Joins, restrictors, stance joins, join-acts | def | def | def | def | — Joins grid (wave 4); `huel` / `her` / `wer` already listed none |
| Role pointers, role compounds | — | — | — | — | — Pronouns, Role compounds grids (waves 2, 12) |

The ability row's **o** cell is not empty: `xo` is the *can't yet* grade, so the series is complete there.

Every family that uses the series either uses all four single vowels or is owned by a later grid. The only family that uses the stacks outside joins and hooks is polar stance.

### Rows

#### E-13 — polar `oe` (`yoel` / `yoem`) · forced · P3

- **Proposed reading:** a fifth polar answer, one + order: *it depends* / *whichever*
- **Example:** none worth teaching.
- **Pattern:** the polar stacks (first vowel the family, second what you answer)
- **Current route:** a MAY stance (`thovum` *could be*) or a full sentence
- **Better than current route:** no
- **Conflicts and notes:** the five defined answers already read as *match*, *take up*, *mismatch*, *reject this option*, *reject the premise*. One + order gives no guessable answer to a polar question (it is a ranking of picks, not a stance on the claim), so a learner would have to be told it. The parser reads `yoel` as an unassigned join marker today.
- **Closes:** *it depends*: not found
- **Recommendation:** decline; add `yoel` / `yoem` to unassigned-reserved.
- **Outcome:** declined — D-23; cell added to unassigned-reserved.

#### E-14 — ability stacks (`xua` *can again*) · forced · P3

- **Proposed reading:** `xua` the ability was lost and is back (*can again*, undo + add)
- **Example:** none: the parser rejects any stack after ability **x**.
- **Pattern:** `ua` as *undo, then add* in joins
- **Current route:** the plain `xa` form plus an ordinary adverb of repetition, or a second sentence
- **Better than current route:** marginal
- **Conflicts and notes:** the ability vowels run on a *now / yet / never* scale, so a stack would add a second axis (history) to a one-axis table. *can again* is also not a time grade at all.
- **Closes:** *can again* (find-english *can again*, *able again*: no dedicated row)
- **Recommendation:** decline; add the stack cells to unassigned-reserved.
- **Outcome:** declined — D-23; cells added to unassigned-reserved.

#### E-15 — *shouldn't* has no recipe row · no new form · P2

- **Proposed reading:** none. English *shouldn't* is the sake **ought** before the act, with the act denied by `vul` after the verb, the same shape as the *needn't* row.
- **Example:** `zazawan thanathem vezebel vul.` — z-Azawan | th-relatedness-ought-offered | [v-tell | v-not] — "Azawan shouldn't tell, to serve relatedness (offered)." Parses (`vul` reads as a join marker on the verb); whether `vul` scopes over the act alone, as in *needn't*, needs the owner's confirmation.
- **Pattern:** say-tense *must / should* table
- **Current route:** the table lists *must*, *has to*, *supposed to*, *should*, *should have*, *mustn't* (`yul`) and *needn't*, but not *shouldn't*
- **Better than current route:** n/a (recipe gap, not a form gap)
- **Conflicts and notes:** a stacked sake vowel (`thue` *ought not*) would collide with `thu` *unmet*, and the parser rejects any stack after the sake **th**. Reuse of `the` + a denied act needs no new rule.
- **Closes:** *shouldn't*, *ought not*: no row
- **Recommendation:** no new form; add a *shouldn't* row to [say-tense](../grammar/say-tense.md#must-should) once the spelling is confirmed.
- **Outcome:** adopted — *shouldn't* row and example in say-tense; no new form.

### Tone marks grid

Marks: `!` `!!` `?` `?!` `%` `&` `;`. Positions: a word, a span, a scope island, the rest of the sentence.

| Mark | Word | Span / island | Rest of sentence | Act word / linker | Number |
|------|------|---------------|------------------|-------------------|--------|
| all seven | def | def | def | def | def (`!g+5` parses) |

No position is empty. The open questions are about the mark set, not the positions.

#### E-16 — a new voice mark (`~` sung / drawn out, whisper, sadness, trailing off, sarcasm) · none · P3

- **Proposed reading:** a mark for a voice quality the seven do not cover
- **Example:** none.
- **Pattern:** one mark = one voice, written before what it colors
- **Current route:** `;` (soft, gentle) covers quiet and tender; `%` (not meant literally) covers sarcasm and irony; `?` (unsure, rising) covers a trailing-off hesitation
- **Better than current route:** no
- **Conflicts and notes:** `~` is the opaque-payload marker (`@~`), so it would clash. Each added mark needs a glyph that is not a fence glyph and a voice no existing mark gives. find-english: *whisper*, *sarcastic*, *ironic* return nothing.
- **Closes:** —
- **Recommendation:** decline; no unassigned-reserved row needed beyond a note that `~` is taken.
- **Outcome:** declined — D-23.

#### E-17 — combined marks (`%!`, `!?`, `!%`) · forced · P3

- **Proposed reading:** two voices at once (*mock-excited*)
- **Example:** `%! zazawan vowogal.`: the parser rejects `!?` today, with a pointer to the tone-marks section.
- **Pattern:** `?!` is already one mark
- **Current route:** a mark on the sentence plus a different mark on one word (the inner mark overrides, it does not combine)
- **Better than current route:** marginal
- **Conflicts and notes:** the page already states that other stacks are not marks, but no design decision gives the reason. `?!` is one recognized blend with its own voice (rising and loud); an open stack grammar would make `!?` and `?!` two orderings of one sound.
- **Closes:** —
- **Recommendation:** decline, and record the reason in design-decisions so it is not re-raised.
- **Outcome:** declined — D-23.

### Inconsistencies (wave 1)

#### C-06 — vowel cues drift between families · found in vowel series

- **Where:** [speech-moves § speech act](../grammar/speech-moves.md#speech-act-beginner), [spans § TYPE](../grammar/spans.md#type), [pronouns § role pointers](../grammar/pronouns.md#role-pointers)
- **Problem:** speech-moves says *the same four vowel cues appear in many small word families* but names none of them. Two families gloss the vowel differently from the stated series: span TYPE **e** is *≈ else (an extra comment)* and the role-pointer vowel **a** is *≈ again*, where the series says **e** order and **a** add. A learner who trusts the series cue reads the span aside as an ordered thing. (Role pointers use role vowels `a` `u` `o`, which are not the series, so this one is a different mechanism sharing the letters.)
- **Suggested ruling:** reword span TYPE **e** to the series cue (an aside is an ordered-in extra comment); leave the pointer cue but state that role vowels are not the series; add one sentence to speech-moves pointing at the families that use the series.
- **Outcome:** fixed — span TYPE **e** cue reworded, pointer cue notes role vowels are not the series, speech-moves names the families.

### None (to add to unassigned-reserved, if E-13, E-14 are declined)

- `yoel` / `yoem` and the polar `oe` cell (E-13).
- Stacked vowels after ability **x** and after sake / scope **th** (E-14, E-15).

## Inconsistencies

Problems in the existing grammar, found while building grids. Each needs a ruling on the owning page; none adds a form.
#### C-01 — linker endings · found in word endings

- **Where:** [dependents § sentence linkers](../grammar/dependents.md#sentence-linkers), [word-endings § continue](../grammar/word-endings.md#continue-x), parser
- **Problem:** Three accounts of linker endings disagree. word-endings lists "linker + **-l** / **-m**" without saying what each means. dependents says the "default ending **-l** is closed", which is the join reading. In practice each linker means its root's **abstract** sense, yet five of the six are spelled with concrete **-l** (`xezol` is *zebra*, not *contrast*) and `xodum` alone is on **-m**. The docs use exactly these six, but the parser accepts any `/x/` content word at a sentence start as a linker (`xagavel` *coffee* parses as one).
- **Suggested ruling:** Declare the six a closed set and give them one ending table (E-09).
- **Outcome:** fixed by E-09.

#### C-02 — **-r** on closed roots · found in word endings

- **Where:** [pronouns § resume](../grammar/pronouns.md#resume-r), [parser-pipeline § resolve](parser-pipeline.md), closed-root pages
- **Problem:** **-r** on a closed root behaves four ways with no stated rule: a grade with no resume (evidentials, phasal, PLAN and the other strong-to-light families); a share with no resume (`thever`); a documented resume (as-of `huhur`); and an undocumented resume (*if*, CAUSE, RESIDUE, *like*, …). The pronouns table "How English approximates **-r**" has no `/th/` row, so *the same stance again* is never taught. parser-pipeline says it skips "values / ability ending channels" as anaphors, but it also skips every graded mood, which the note doesn't mention.
- **Suggested ruling:** State the rule once on pronouns.md: on a closed root whose family defines an **-r** grade, **-r** is that grade; otherwise it is a resume. Add the `/th/` row. Fix the parser-pipeline note.
- **Outcome:** fixed — the rule and a `/th/` row are on [pronouns](../grammar/pronouns.md#how-english-approximates-r); the parser-pipeline note now lists every family with its own **-r**; settled in [design-decisions](design-decisions.md#closed-root-endings).

#### C-03 — **-n** on graded moods · found in word endings

- **Where:** [lexicon-overlays.csv](../../data/lexicon-overlays.csv), [intention](../grammar/intention.md), [knowing](../grammar/knowing.md)
- **Problem:** The pages say **-n** on PLAN, DECISION, ATTEMPT, WANT, MAY and NOTIONAL is "ordinary proper". But the CSV lists those **-n** forms as overlays (`aman` *plan*, `ovun` *MAY.named*, …), so the parser reads `thaman` as the PLAN mood, not a proper name. Other families have no **-n** row, so their **-n** falls back to ordinary content.
- **Suggested ruling:** Either drop the six **-n** rows from the CSV, or teach what a named mood means and add **-n** rows to the other graded families.
- **Outcome:** fixed — the twelve **-n** mood rows are dropped from the CSV, so **-n** on a mood root parses as an ordinary proper name. DECISION and MAY roots are now eligible learner names.

#### C-04 — dead `grammar-gaps.md` link · found while editing

- **Where:** [unassigned-reserved § related meta](unassigned-reserved.md#related-meta)
- **Problem:** Links to `grammar-gaps.md`, which was deleted when the Phase 1 gaps were folded in.
- **Suggested ruling:** Point the row at this file or at [design-decisions](design-decisions.md).
- **Outcome:** fixed — the row now points at design-decisions.

#### C-05 — first-position paragraph skips the opening `/x/` word · found in role-letter structure

- **Where:** [clause § word order](../grammar/clause.md#word-order-emphasis), [pronouns § topic](../grammar/pronouns.md#topic)
- **Problem:** clause.md says "Opening `/y/` words come before the clause itself and do not count" for first position. A topic `/x/` word also opens a sentence before the clause (the parser puts it in a separate linker slot, and `xazawan dagadul vahahal.` highlights `dagadul`), but clause.md does not say so. A learner could read `xazawan` as the highlighted first word.
- **Suggested ruling:** name `/x/` topic and linker words beside `/y/` words in that sentence, linking [topic](../grammar/pronouns.md#topic). No form changes.
- **Outcome:** fixed — clause.md now names the `/x/` topic word and linkers, adds a topic **Compare with**, and states that a dropped subject is never the topic (also on pronouns.md).

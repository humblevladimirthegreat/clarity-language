# Extension sweep results

Editors only — not linked from grammar pages. Findings from Phase 3 of the expressiveness review (`docs/proposals/expressiveness-review.md`): every productive mechanism crossed with every place it could apply, and each empty cell judged. Rows are logged per batch, ruled by the language owner, and applied before the next batch starts; each row's **Outcome** records the ruling.

Progress: batch 1 (word endings pilot) ruled and applied. Wave 0 batch 2 (role-letter structure) ruled and applied. Wave 1 (vowel series, tone marks) ruled and applied. Wave 2 (pronouns, plurality) ruled and applied. Wave 3 (numbers) ruled and applied. Wave 4 (joins and restrictors): ruled and applied (E-29, E-30 adopted; E-31, E-32 declined; C-12 fixed; C-13 deferred to Wave 9). Wave 5 (hooks): logged (E-33 to E-35, C-14), ruled and applied (E-33 to E-35 declined, C-14 fixed). Wave 6 (spans): logged (E-36 to E-38, C-15, C-16), ruled and applied (E-36 adopted as a docs gap, E-37 and E-38 adopted (reversed from decline), C-15 and C-16 fixed). Wave 7 (join series on other roles): logged (E-39, E-40, C-17 to C-19), ruled and applied (E-39 adopted as a docs gap, E-40 declined, C-17 to C-19 fixed). Wave 8 (hosted relations and bars): logged (E-41 to E-43), ruled and applied (E-41 and E-43 declined, E-42 adopted). Wave 9 (questions): logged (E-44 to E-49, C-20, C-21, C-13 revisited), ruled and applied (E-44 to E-47 adopted, E-48 and E-49 declined, C-20, C-21 and C-13 fixed). Wave 10 (stand-ins and `/x/` words): logged (E-50, E-51, C-22), ruled and applied (E-50 and E-51 declined, C-22 fixed). Wave 11 (predication): logged (E-52, E-53, C-23), ruled and applied (E-52 adopted as a docs gap, E-53 declined, C-23 fixed). Wave 12 (mid-word `x` and `th`, role compounds): logged (E-54 to E-58, C-24 to C-26), ruled and applied (E-54, E-55, E-57 adopted, E-56 and E-58 declined, C-24 to C-26 fixed). Wave 13 (mood roots × role letters): logged (E-59 to E-62, C-27), rows redone 2026-10-03, ruled and applied (E-59 adopted as a docs gap, E-60 to E-62 declined, C-27 fixed). Wave 14 (sakes): logged (E-63 to E-65, C-28 to C-30), ruled and applied (E-63 adopted as a docs gap, E-64 declined, E-65 adopted, C-28 to C-30 fixed). Phase 3 complete.

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
- **Outcome:** declined as *it depends* — D-23. Superseded: `oe` now reads *decline to answer* (`yoel` / `yoem` / `yoer`), split from `ua` (reject the frame).

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

## Pronouns and plurality

Owning pages: [pronouns](../grammar/pronouns.md), [plurality](../grammar/plurality.md), [roles § role pointers](../grammar/roles.md#role-pointers-family). Wave 2. Cells checked with `node scripts/parse.mjs` (2026-10-02). Whole-stem **-r** on closed roots belongs to the Word endings grid (C-02), and **-r** on joins and compounds is **def** (a joined slot resumes as one group through a pointer, `zaxar`; whole-stem **-r** names one member).

### Pronoun grid

| Pronoun | `/z/` `/d/` `/b/` | `/v/` `/ɡ/` `/h/` `/w/` | `/th/` | `/y/` | `/x/` (topic) |
|---------|-------------------|--------------------------|--------|-------|---------------|
| Role pointer (`a` `u` `o` role vowels; `a` `e` `o` pointer vowels) | def | E-20 (parser rejects; already listed none) | — (holder slot def) | E-19 | E-18 |
| Ordinal (`z=#n`) | def | — (free ordinals are numbers) | — | E-21 | none (D-20) |
| Generic `oben` | def | gen | — | gen | gen (C-07) |
| Topic `ozan` | def | gen | — | none | C-07 (`xozan` / `xozar`) |
| `amago` / `ehodo` | def | gen | — | def (`yehodon`) | def |
| `aha` | def | gen | — | gen | gen (C-07) |
| `una` | def | gen | — | gen | gen (C-07) |

Parser findings: pointers parse only on `/z/` `/d/` `/b/` and a holder seam's holder slot; `yaxar`, `vaxar`, `hexar` and `xaxar` are rejected with a pointer to the pronouns page, and `xaxaxar`, which I first tried as the topic pointer, is not one: the pointer spelling `xaxar` is the rejected form, and `xaxaxar` is an unrelated compound. `yrewor` is rejected. `xahan`, `xunan`, `xoben` and `xozan` parse as topic words with a working `zozan` after them; `xozar` and `zozar` parse. `zahanx` and `zunanx` parse; `zobenx` is rejected (D-21). The other-one pointer `o` takes only `axor` / `uxor` / `oxor` (D-19), so `dexor` and `doexor` are rejected.

### Rows

#### E-18 — role pointer as a topic word (`xaxar`) · intuitive but redundant · P3

- **Proposed reading:** `/x/` + a pointer makes the latest doer (or undergoer, or extra party) the topic: *now, about that one*
- **Example:** `zazawan vowogal. xaxar zozan vehahel.` — rejected today.
- **Pattern:** a pointer for the pronoun slots, a whole-stem **-r** return for the topic
- **Current route:** `xazawar` (whole stem + **-r**), or `xodogar` for a kind
- **Better than current route:** only for a long compound stem
- **Conflicts and notes:** the topic change resets pointer anchors ([topic resets](../grammar/pronouns.md#topic-resets)), so a pointer here would need an order rule (resolve first, reset after). D-20 wants every return spelled out by stem, so every tool and every reader computes the same topic from the words alone.
- **Closes:** *now, about the other one*: only a name
- **Recommendation:** decline; the topic keeps stem returns only. The parser already rejects it.
- **Outcome:** declined — D-24; the parser already rejects it.

#### E-19 — role pointer in a vocative (`yaxar`) · forced · P3

- **Proposed reading:** *hey, you who just did that*
- **Example:** none: rejected today.
- **Pattern:** pointer for the pronoun slots, vocative **-r** for the call
- **Current route:** `yazawar` (a vocative resume), or the name
- **Better than current route:** no
- **Conflicts and notes:** pointers are third person (D-18); a call is second person, and a vocative already resumes by whole stem.
- **Closes:** —
- **Recommendation:** decline; add `/y/` to the pointer none cells.
- **Outcome:** declined — D-24; cell added to unassigned-reserved.

#### E-20 — role pointer on `/v/` `/ɡ/` `/h/` `/w/` · forced · P3

- **Proposed reading:** *do so* / *such* / *thus* without respelling the stem
- **Example:** none: `vaxar`, `hexar` rejected today.
- **Pattern:** pointer plus role vowel
- **Current route:** whole-stem **-r** (`vowogar`, [How English approximates **-r**](../grammar/pronouns.md#how-english-approximates-r))
- **Better than current route:** no. A pointer picks a *participant* by its part in an event; a verb slot names the event itself, so there is no role vowel to write, and the whole stem is already short.
- **Conflicts and notes:** already listed as undefined in unassigned-reserved.
- **Closes:** *do so*, *such*: covered
- **Recommendation:** decline; keep the cell none and add the reason to design-decisions.
- **Outcome:** declined — D-24; cell stays in unassigned-reserved.

#### E-21 — ordinal in a vocative (`yredur`) · intuitive but redundant · P3

- **Proposed reading:** *hey, second one* (call the second person named)
- **Example:** none: rejected today with a digitless-resume message.
- **Pattern:** ordinal pronoun on `/z/` `/d/` `/b/`
- **Current route:** the name (`yalahen`); ordinals exist only for names, so the caller always knows it
- **Better than current route:** no
- **Conflicts and notes:** the parser's message mentions digitless numbers, which misleads here.
- **Closes:** —
- **Recommendation:** decline; add the `/y/` cell to the none list, and point the parser's message at the ordinal-pronoun section.
- **Outcome:** declined — D-24; parser message now points at the ordinal-pronoun section (`ordinalSlot`).

#### E-22 — inclusive *we* plus associates (`ahanx`) · intuitive · P2

- **Proposed reading:** you, I, and our associates: English *we* meaning more than the two of us (*we all*, *us and ours*)
- **Example:** `zahanx vowogal.` — z-interlocutors-x | v-walk — "We (you, I and our people) walk." Already parses.
- **Pattern:** **-x** adds associates to an anchor; `amagonx` adds them to the speaker, `ehodonx` is the address set
- **Current route:** `zahan` alone (the extent stays open), or a join with `ehodon`, `amagon` and a named third party
- **Better than current route:** yes: English *we* has three readings, and this is the one the table cannot say. `amagonx` excludes the listener, `ehodonx` excludes the speaker, `ahan` names the two.
- **Conflicts and notes:** the table says `ahan` is "already the interlocutor set (no **-x**)", so adopting this changes that line. `ahan` can already cover several addressees, so `ahanx` means *beyond the people in this conversation*. `aha` was the only person root with no **-x** cell, and the parser accepts it today.
- **Closes:** *we all*, *us and our people*: no form (`find-english` *all of us*, *we and our*)
- **Recommendation:** adopt: teach it in [plurality § person-role **-x**](../grammar/plurality.md#person-role-x) with a table row, and change the `ahan` row.
- **Outcome:** adopted — `ahanx` taught in [plurality § person-role **-x**](../grammar/plurality.md#person-role-x), `ahan` row changed; no parser change.

#### E-23 — **-x** on `/h/` `/w/` `/th/` and the six linkers · none · P3

- **Proposed reading:** a group of adverbs, degrees, stances or linkers
- **Example:** none: `hanalx`, `thoyemx` rejected with a plurality pointer.
- **Pattern:** **-x** names a group of **referents** (nouns, vocatives, person roles) or structures an **event** (`/v/`) or **property** (`/ɡ/`)
- **Current route:** the event or property host already carries the collective; stances belong to holders, who take **-x** on the noun ([holder seam](../grammar/knowing.md))
- **Better than current route:** no
- **Conflicts and notes:** no guessable reading: a plural adverb has none in English either. plurality.md already says these hosts are unused, but no design decision gives the reason.
- **Closes:** —
- **Recommendation:** decline; record the reason in design-decisions so it is not re-raised.
- **Outcome:** declined — D-24.

### Inconsistencies (wave 2)

#### C-07 — topic words on the special pronouns and `ozan` · found in pronouns

- **Where:** [pronouns § me or you as the topic](../grammar/pronouns.md#topic-participants), [pronouns § topic pronoun](../grammar/pronouns.md#topic-pronoun), parser
- **Problem:** the page teaches `xamagon` and `xehodon` only. The parser also accepts `xahan` (*now, about us*), `xunan`, `xoben`, and `xozan` / `xozar`. `xahan` and `xoben` have clear readings (*now, about the two of us*, *now, about people in general*). `xunan` is a topic with no particular referent. `xozan` would make the word *topic pronoun* its own topic, and `xozar` / `zozar` resume that word instead of pointing at the topic, so they either do nothing or reach an earlier use.
- **Suggested ruling:** list `xahan` and `xoben` beside `xamagon` / `xehodon`; reject `xunan` (a topic needs someone to be about); reject `xozan`, `xozar` and `zozar` (the topic pronoun is the topic, never its own topic or a resume). Say so on the topic-pronoun paragraph.
- **Outcome:** fixed — `xahan` and `xoben` taught beside `xamagon` / `xehodon`; the parser rejects `xunan`, `xozan`, `xozar`, `zozar` (`topicNonspecific`, `topicOfTopic`); D-24.

#### C-08 — parser accepts `-x` the page denies, on `ahan` and `unan` · found in plurality

- **Where:** [plurality § person-role **-x**](../grammar/plurality.md#person-role-x), parser
- **Problem:** the table says `ahan` takes no **-x**, and the generic pronoun is rejected with a message (D-21), but `zahanx` and `zunanx` both parse with no reading. `unan` + **-x** would be *someone and associates*, which duplicates *some people* (`zobelx`).
- **Suggested ruling:** if E-22 is adopted, `ahanx` is defined; reject `unanx` with a message pointing at `obelx`, and say *nonspecific someone takes no **-x*** beside the generic pronoun's sentence.
- **Outcome:** fixed — the parser rejects `unanx` (`nonspecificPlural`); `ahanx` defined by E-22.

### None (to add to unassigned-reserved if the rows above are declined)

- Role pointers on `/y/` and `/x/` (E-18, E-19), and ordinal pronouns on `/y/` (E-21).
- **-x** on `/h/` `/w/` `/th/` and the six linkers (E-23), and on `unan` (C-08).
- Topic words `xunan`, `xozan`, `xozar`, and `zozar` (C-07).

Confirmed **def** with nothing to add: the `o` pointer on the scene and hook roles (D-19), pointer vowel `u` (span resume), ordinal `#0` (already listed), **-x** on pointers, ordinals, `ozan` and topic nouns.

## Numbers

Owning pages: [numbers](../grammar/numbers.md), [numbers-applied](../grammar/numbers-applied.md), [numeric-derivation](../grammar/numeric-derivation.md). Wave 3. Cells checked with `node scripts/parse.mjs` (2026-10-02). The parser reads any `r` + vowel word after a role letter as a number, so it accepts `wredul`, `thredul` and `thrurel` today with no reading; a form that parses is not a reading. Ending cells (**-l** / **-m** / **-n** / **-r**) on number words are all **def** by one rule ([number endings](../grammar/numbers.md#number-endings)), so the grid below is markers by role letters.

### Grid

| Marker | `/z/` `/d/` `/b/` `/ɡ/` | `/v/` | `/h/` | `/y/` | `/x/` | `/th/` | `/w/` |
|--------|--------------------------|-------|-------|-------|-------|--------|-------|
| `ra` (`+`) | def | def add | def times | def more | def corroborating | def likelihood | none (E-25) |
| `ru` (`-`) | def (`g-N` fraction, C-11) | def remove | def divide | def short | def independent | none (C-09) | none (E-25) |
| `re` (`#`) | def | def rank | def nth time | def place | def point | E-28 (C-09) | E-24 |
| `ro` (`_`) | def | def dial | def clock | def label | def cite | def source | none |
| `rue` (`#-`) | def | def | def | def | def | none (C-09) | E-24 |
| Digitless `-r` blank | def | def | def | def | def | def (`thrar`) | def (`wrar`) |
| Digitless exponent specials (∞, last, hair-short) | def | def | def | def | def (start / last / just-before) | def (`thrubul`) | def (`wrabul` / `wrubul`) |

Marker stacks (two marker vowels, the six standard stacks of D-23 order):

| Stack | Marker | Reading |
|-------|--------|---------|
| `ua` | `rua` | def: symmetric error bound (`g+-N`) |
| `uo` | `ruo` | def: negative label |
| `ue` | `rue` | def: from the end (`#-`), taught in its own section |
| `oe` | `roe` | def: calendar ordinal for dates (`h_#22,7`), taught in numbers-applied |
| `ao` | `rao` | E-26 (parser rejects) |
| `ae` | `rae` | E-26 (parser rejects) |

Every cell not named above is covered by an existing form: digit-string exponents and zero × exponent cells are already on the unassigned list, and **-x** on number words belongs to the Plurality grid.

### Rows

#### E-24 — rank on a scale (`w#N`, `w#-N`) · intuitive · P2

- **Proposed reading:** `/w/` + an ordinal before the adjective gives the **place on that scale**, so `zel` + `w#2` + adjective is *the second …-est*, and `w#-2` is *the second from the bottom*.
- **Example:** `zazawan zel wredul gelavam.` — z-Azawan | [more-than | [w-2nd | g-big]] — "Azawan is the second biggest." Parses, but as a stray number, with no reading.
- **Pattern:** `/w/` is the degree slot right before an adjective ([clause](../grammar/clause.md#adjective-detail-w)); the ordinal marker **`e`** ≈ order, as on `g#2`
- **Current route:** none. A superlative names only the winner ([superlatives](../grammar/comparatives.md#superlatives)); `g#2` after the noun picks the second *noun*, never the second on a scale (`find-english`: *second biggest*, *second largest*, *two thirds*: no row)
- **Better than current route:** yes: *the second largest*, *the third tallest* and *runner-up* have no one-word route today
- **Conflicts and notes:** the superlative frame (one name before `zel`) must carry the group, since an ordinal with no group has nothing to rank within. Only the ordinal markers fit: a count (`w+3`) is a factor, which `hradul` already says (E-25). `w#-N` mirrors `g#-N`.
- **Closes:** *second biggest*, *third tallest*, *runner-up*: no row found
- **Recommendation:** adopt `w#N` / `w#-N` on a superlative frame; teach it in [comparatives § superlatives](../grammar/comparatives.md#superlatives) and add a [say-amounts](../grammar/say-amounts.md) row.
- **Outcome:** adopted, narrowed: `w#N` from 2 under a single-name `zel` / `zuel` frame. `w#-N` is dropped as redundant (`zuel` + `w#2` is second from the bottom). Taught in [comparatives § place on a scale](../grammar/comparatives.md#place-on-a-scale); D-25; parser rejects other `/w/` numbers (`degreeNumber`, `degreePlaceFrame`).

#### E-25 — count and fraction as degree (`w+N`, `w-N`) · forced · P3

- **Proposed reading:** `/w/` + a count grades the quality (*three times as big*), `/w/` + a minus the fraction (*half as big*).
- **Example:** `zodogal wrarel gelavam.` parses with no reading.
- **Pattern:** `/w/` degree; `h+N` / `h-N` factor
- **Current route:** the factor on an equative, `zazawan zalahen zael gelavam hradul` ([factor](../grammar/comparatives.md#factor))
- **Better than current route:** no. A second route would let `w+3` and `h+3` both mean *three times* with different frames.
- **Conflicts and notes:** the factor route compares two things and names the second; a bare `w+3` would not say *three times what*.
- **Closes:** —
- **Recommendation:** decline; add `w+N`, `w-N` to the none cells (E-12 already declined a verb host for `/w/`).
- **Outcome:** declined — D-25; parser rejects `w+N` / `w-N` / `w_N` (`degreeNumber`).

#### E-26 — positive and ordinal-count marker stacks (`rao`, `rae`) · forced · P3

- **Proposed reading:** `rao` a positive label (`+44`, a country code that shows its plus); `rae` an ordinal with an added count.
- **Example:** none: the parser rejects both.
- **Pattern:** the six stacks; four of them are already markers
- **Current route:** `d_44` (labels carry no sign) and `g#N`
- **Better than current route:** no. The plus in a dialing code is a writing convention, not a sign the word needs, and `rae` has no guessable reading (count and rank are separate questions, answered by two markers on two words).
- **Conflicts and notes:** labels are unsigned by design ([sign](../grammar/numbers.md#sign)); `ruo` exists only because *below zero* is a real label (a basement floor).
- **Closes:** —
- **Recommendation:** decline; add `rao` / `rae` to unassigned-reserved.
- **Outcome:** declined — D-26; cells added to unassigned-reserved; numbers.md lists the four stacks in use.

#### E-27 — fraction with a numerator (*two thirds*, *three quarters*) · intuitive · P2

- **Proposed reading:** a count and then the fraction on the same noun: **`g+N`** then **`g-M`** is *N parts of M*.
- **Example:** `zagadulx gradul grurel vehahel.` — [z-cat-x | g-two | g-third-of] | v-sit — "Two thirds of the cats sit." Parses today with no reading.
- **Pattern:** the English order (*two* + *thirds*) and the fraction **`g-N`** that already means *one part in N* ([fractions](../grammar/numbers-applied.md#fractions))
- **Current route:** only `g-N` for a single part (*a third*, *a quarter*), or a percent (`g+67%`), which is not exact
- **Better than current route:** yes: *two thirds*, *three quarters* and *three fifths* have no exact route
- **Conflicts and notes:** `g-N` already stands alone as *one part in N*, so `g+1 g-N` and `g-N` would say the same thing and `g-N` stays the short form. After a measure unit `g-N` is a negative amount, so *a third of an hour* has no fraction route and uses a smaller unit (*20 minutes*): say so beside the rule. Two stacked number modifiers read no other way today.
- **Closes:** *two thirds*, *three quarters*: no row (`find-english`)
- **Recommendation:** adopt; teach in [numbers-applied § fractions](../grammar/numbers-applied.md#fractions) and add a [say-amounts](../grammar/say-amounts.md#quantity-words) row beside *a quarter of the cats*.
- **Outcome:** adopted — count then fraction, in any slot, units included. Taught in [numbers-applied § fractions](../grammar/numbers-applied.md#fractions) with say-amounts rows; the parser glosses the stack as a fraction.

#### E-28 — stance by order (`th#N`, `th#-N`, `th-N`) · forced · P3

- **Proposed reading:** `th#2` *second-hand*, `th#3` *third-hand*: the number of links between the claim and the one who saw it.
- **Example:** `zazawan vowogal th#2.` parses with no reading (`thredul`).
- **Pattern:** `th_N` *per source N*; the ordinal marker
- **Current route:** hearsay `thewam` already says *so they say* (second-hand); `th_N` names a numbered source
- **Better than current route:** no. A chain of two or more retellings is rare, and the channel root already says the part that matters (someone said so).
- **Conflicts and notes:** the page already says `th-N` and `th#N` are not used, but no design decision gives the reason, and the parser accepts them (C-09).
- **Closes:** *second-hand*, *third-hand*: hearsay covers it
- **Recommendation:** decline; record the reason in design-decisions and reject the forms in the parser with a pointer to `thewam` and `th_N`.
- **Outcome:** adopted (reversed from the first recommendation) — `th#N` from 2 is N-th hand, taught in [knowing § second-hand and further](../grammar/knowing.md#hand-depth); `th#1`, `th-N`, `th#-N` rejected (D-26).

### Inconsistencies (wave 3)

#### C-09 — parser accepts `th-N` / `th#N` the page denies · found in number as stance

- **Where:** [numbers § number as stance](../grammar/numbers.md#number-as-stance-by-marker), parser
- **Problem:** the page says *`th-N` and `th#N` are not used*, but `thrurel`, `thredul`, `thruedul` and `threbal` all parse as number words with no reading. Digitless `thr` + `ru` / `re` is likewise open.
- **Suggested ruling:** reject with a message pointing at `th+N` and `th_N`; list the cells in unassigned-reserved; pair with E-28.
- **Outcome:** fixed — `stanceNumber` / `handDepth` rejections point at numbers.md and knowing.md; cells listed in unassigned-reserved.

#### C-10 — the marker inventory is split across three pages · found in marker stacks

- **Where:** [numbers § stacked markers](../grammar/numbers.md#stacked-markers), [from the end](../grammar/numbers.md#from-the-end), [numbers-applied § time](../grammar/numbers-applied.md#time)
- **Problem:** the stacked-markers section lists only `ruo` and `rua`. `rue` is taught in its own advanced section, and `roe` (the calendar-date marker, `hroe`) only appears under time, so no page says that these four are the whole stack set or that `rao` and `rae` are unused.
- **Suggested ruling:** add the full stack table to stacked markers (`rua`, `ruo`, `rue`, `roe` with links, plus the two unused), and link back to the section that teaches each.
- **Outcome:** fixed — the stacked-markers table lists `rua`, `ruo`, `rue`, `roe` and the two unused stacks.

#### C-11 — the fraction rule has a hole after a measure unit · found in fractions

- **Where:** [numbers-applied § fractions](../grammar/numbers-applied.md#fractions), [measure phrases](../grammar/numbers-applied.md#measure-phrases)
- **Problem:** `g-N` is a fraction only right after a plain noun, and a negative amount after a unit, so *a third of a meter* or *half an hour* cannot use a fraction. *Half* has a decimal route (`g+0.5`), but *a third* has none that is exact.
- **Suggested ruling:** state the limit and the route (a smaller unit or a decimal) where the rule is taught; no new form.
- **Outcome:** fixed by E-27 — a count before the minus is a fraction after a unit too; the fractions section states the rule.

### None (to add to unassigned-reserved, if the rows above are declined)

- `w+N`, `w-N`, `w_N` (E-25), `rao`, `rae` (E-26), `th#N`, `th#-N`, `th-N` (E-28, C-09).

Confirmed **def** with nothing to add: every marker on `/v/` `/h/` `/y/` `/x/`, `/th/` for `+` and `_`, the **-r** blank on every host, the digitless-exponent specials on `/w/` (`wrabul`, `wrubul`) and `/th/` (`thrubul`), and number endings on every host.

## Joins and restrictors

Owning pages: [joins](../grammar/joins.md), [restrictors](../grammar/restrictors.md). Wave 4. Cells checked with `node scripts/parse.mjs` (2026-10-02), sweeping every role letter × the ten parsed vowel series × **-l** / **-m** / **-n** / **-r**. The series are **a o e u** and the six stacks **ao ae oe ua uo ue** (the other two-letter pairs do not parse on any role). Join-act and join-relation **-n** forms, stance joins and clause joins belong to Wave 7 (join across roles); hooks to Wave 5. Ending meanings follow [ending patterns](#ending-patterns-already-in-use) (**-l** closed, **-m** open, **-n** named / stock, **-r** unspecified member).

### Grid

| Series | `/z/` `/d/` `/b/` | `/ɡ/` | `/h/` | `/w/` |
|--------|-------------------|-------|-------|-------|
| **a o u**, **-l** / **-m** | def | def | def | def (`wal` `wam` `wol` `wom` `wul` `wum`) |
| **e** **-l** / **-m** | def | def | def | def (`wel` `wem`) |
| **ao ae oe ua uo** **-l** / **-m** | def | def | def | def |
| **ue** **-l** / **-m** | def | def | E-30 (`huel` `huem` parse, no reading) | E-30 (rejected) |
| **a o u** **-r** | def | def | def (`har` `hor` `hur`) | def (`war` `wor` `wur`) |
| **e** **-r** | def | def | E-31 (`her` parses, no reading) | E-31 (rejected) |
| stacks **-r** | C-13 | C-13 | C-13 | rejected |
| **-n**, every series | def named package | def join-relation on a `/b/` (Wave 7) | def join-relation (Wave 7) | C-12 (rejected) |
| Bare (no items) | def (standalone table) | def | **hal** **ham** **hual** **huam** **har** **hor** **hur** only; the rest E-32 | the same seven only |
| Single item | def | def | def | def |
| `wazem` (respectively) before a join | `/z/` `/d/` `/b/` **a**-list only | E-29 (rejected) | — | — |

Every `/v/` item is in the join-across-roles grid, and every `/x/` cell is a clause join; neither is logged here.

### Rows

#### E-29 — respectively on adjective and verb lists (`wazem` before `gal`, `val`) · intuitive · P2

- **Proposed reading:** `wazem` pairs two **a**-lists by position wherever the lists are the same role: a `/ɡ/` list after the subject list (*tall and short, respectively*), a `/v/` list (*walk and run, respectively*).
- **Example:** `zazawan zalahen zal gelavam gamazam wazem gal.` — [z-Azawan | z-Alahen | z-and] | [g-big | g-small | w-respectively | g-and] — "Azawan and Alahen are big and small, respectively." The parser rejects it today (`wazem` only before a `/z/` `/d/` `/b/` join). `zazawan zalahen zal vowogal varahal wazem val.` — "Azawan and Alahen walk and run, respectively." — rejected the same way.
- **Pattern:** [respectively](../grammar/joins.md#respectively), whose rule (same-length **a**-lists, same clause) does not depend on the role letter
- **Current route:** two clauses, `zazawan gelavam. zalahen gamazam.`, or a clause join `xal` with each subject repeated
- **Better than current route:** yes. *X and Y are A and B, respectively* is the commonest use of *respectively* in English, and `/ɡ/` and `/v/` are the lists it is most often said over.
- **Conflicts and notes:** an adjective after a subject join is SHARED, so a `/ɡ/` list after the join must be told apart from a SHARED pair. `wazem` right before the closing `gal` is that signal (nothing else may stand before a join word, so there is no collision), and without it the list stays SHARED. The rule that both lists need the same number of items carries over unchanged. **-r** and **-n** are not wanted: see C-12.
- **Closes:** *respectively* over adjectives and verbs: no row (`find-english`: *respectively*, *tall and short respectively*)
- **Recommendation:** adopt on `/ɡ/` and `/v/`; teach in [joins § respectively](../grammar/joins.md#respectively), add a translation checkpoint, and keep **`wazem`** out of every other role.
- **Outcome:** adopted. `wazem` now closes an adjective or verb list as well as a noun list, in [joins § respectively](../grammar/joins.md#respectively); the parser reads it (a respectively-marked adjective row is its own list, so its first adjective is not SHARED), with checks, a recipe row in english.md, and checkpoints.

#### E-30 — reverse rank of occasions (`huel` / `huem`, `wuel` / `wuem`) · intuitive · P3

- **Proposed reading:** the **ue** (undo + order) rank on occasions, as on nouns: one occasion before it is the **last resort**, several are *last first*. `herehel huel` is *as a last resort, when raining* / *least readily when raining*; open `huem` *rather not when raining*.
- **Example:** `zazawan vowogal herehel huel.` — z-Azawan | v-walk | h-rain | h-rank/less — "Azawan walks only as a last resort when raining." Parses today as a join word with no reading.
- **Pattern:** noun `zuel` *X last* / *Ahaben, then Alahen, then Azawan*; the ranked restrictors `hel` / `hael` / `hoel`; join-relation `huen` *deprioritizing* (so the slot is already taken for the relation, not for the restrictor)
- **Current route:** none. `hel` ranks occasions best-first, and putting the occasions in the other order is the only way to say *least when X*, which gives no single last-resort reading. `xon` says *failing that* between clauses ([say-reasons](../grammar/say-reasons.md)) but not for one occasion.
- **Better than current route:** yes: *as a last resort*, *least of all when*, *only when nothing else works*
- **Conflicts and notes:** on `/w/` the parser rejects **ue** at every ending, so `/w/` and `/h/` do not match even on the "same map" the page promises. The map is complete once `/w/` takes `wuel` / `wuem`.
- **Closes:** *as a last resort*, *least of all when*: no row (`find-english`)
- **Recommendation:** adopt on `/h/` and `/w/` together; teach under [ranked](../grammar/restrictors.md#more-occasions), and remove from unassigned-reserved.
- **Outcome:** adopted on `/h/` and `/w/`. `huel` / `huem` / `wuel` / `wuem` are restrictors (gloss `when-last`), taught in [restrictors § ranked](../grammar/restrictors.md#more-occasions) with checkpoints; removed from unassigned-reserved.

#### E-31 — unspecified ranked member on occasions (`her`, `wer`) · intuitive but redundant · P3

- **Proposed reading:** `her` *at whichever occasion ranks first*, matching `zer` / `ver` / `xer` / `ther`.
- **Example:** `zazawan vowogal herehel hanadal her.` — "Azawan walks, at whichever of rain or night ranks first." Parses for `/h/`; `/w/` rejects `wer`.
- **Pattern:** **-r** on single-vowel **e**; it is the only role letter missing it
- **Current route:** none that is exact; *preferably when …* is `hel`
- **Better than current route:** no. There is no English cue (*whenever it matters most* is not a job anyone does), so the cell is regularity only.
- **Conflicts and notes:** the unassigned-reserved line gives *`hel` + `har`* as a near-miss, but one restrictor chain is one unit ([more occasions](../grammar/restrictors.md#more-occasions)), so the two cannot stack and the note is wrong.
- **Closes:** —
- **Recommendation:** decline (ground rule: no slot-filling); keep reserved, and correct the near-miss note.
- **Outcome:** declined (D-27). `her` / `wer` stay reserved; the near-miss note is corrected.

#### E-32 — bare restrictors beyond `hal` / `hual` (`hol`, `hel`, `hoel`, `haol`, `hul`, `huol`, `hael`) · forced · P3

- **Proposed reading:** mirror the standalone join table: `hel` *no occasion matters most*, `hoel` *at any time, in no order*, `haol` *no matter when*.
- **Example:** `zazawan vowogal haol.` parses with no reading.
- **Pattern:** the standalone readings in [joins](../grammar/joins.md#full-single-item-and-standalone-inventories)
- **Current route:** `hal` *never*, `hual` *always*, `hor` *anytime*, `har` *sometimes*; *regardless of* is `hezom` plus `/b/` ([say-reasons](../grammar/say-reasons.md))
- **Better than current route:** no. With an empty occasion list the only guessable readings are *never* and *always*, which `hal` and `hual` own. `hul` would read *not when nothing* = *always*, `huol` *anytime* (that is `hor`), `hol` *no pick* = *never*, so each collides with a live reading; the rank readings (*no occasion matters most*) say nothing a speaker needs.
- **Conflicts and notes:** bare `/w/` forms follow the same rule, since `wal` / `wual` are the only ones used.
- **Closes:** —
- **Recommendation:** decline; keep the unassigned-reserved bare list as it stands.
- **Outcome:** declined (D-27). Bare restrictors stay as they are.

### Inconsistencies (wave 4)

#### C-12 — **-n** and **-r** on `/w/` are described one way and parsed another · found in allowed joins by PoS

- **Where:** [joins § named phrase](../grammar/joins.md#named-list), [allowed joins](../grammar/joins.md#phrase-reserved-forms), [unassigned-reserved](unassigned-reserved.md#restrictors-h--w), parser
- **Problem:** joins says **-n** works under `/z/` `/d/` `/b/` `/w/` as a named package, and the table gives `/w/` **-l** / **-m** / **-n** / **-r** (**-r** on single vowels only). Unassigned-reserved says `/w/`…**-n** is reserved with no gloss, and the parser rejects every `/w/` **-n** (`wan`, `won`, …) and `wer`. Under `/w/` the units are restrictors and `wazem`, not phrases, so no package can be named. The same table also says `wazem` takes only **-l** / **-m**, but the parser accepts `wazem dar` and `wazem dan`.
- **Three separate mismatches:** (1) **-n** on `/w/`: the sentence and table in joins.md promise a named package, but a `/w/` is never a list item (the only `/w/` before a join word is `wazem`, and a restrictor chain is a unit, not a package), so there is nothing for **-n** to title; the parser rejects `wan` … `wuen`, and unassigned-reserved already lists it as reserved. (2) **-r** on `/w/`: `war` `wor` `wur` work, but as restrictors, not joins; the table's *`/w/` **-r** only on **a** / **o** / **e** / **u*** promises `wer` too, and the parser rejects it (E-31). (3) `wazem` itself: the page says it goes before an **-l** or **-m** `a` join, but `wazem dar` and `wazem dan` parse. *Respectively something* has no reading, and a named respectively list is not a thing, so both are accidents of the grammar rule, not designs.
- **Suggested ruling:** take `/w/` out of the **-n** sentence and the table row (point the `/w/` row at restrictors, **-l** / **-m** / **-r** on **a** / **o** / **u** only until E-31 is ruled), and make the parser reject `wazem` before **-r** / **-n** with a pointer to [respectively](../grammar/joins.md#respectively). With E-29 adopted, that rule covers `wazem gal` and `wazem val` too, so state it once on the respectively table (`Where`: **-l** or **-m** only).
- **Outcome:** fixed. joins.md no longer gives `/w/` a named package or a phrase-list row; `wazem` before **-r** / **-n** is rejected by the parser; D-27 and unassigned-reserved record it.

#### C-13 — stacked **-r** on phrase joins parses but is documented as undefined · found in unspecified member

- **Where:** [joins § unspecified member](../grammar/joins.md#unspecified-member-r-phrase), [constraints](../grammar/joins.md#constraints), [verb-phrase and clause forms](../grammar/join-across-roles.md#vp-clause-forms), parser
- **Problem:** the docs allow **-r** only on **a** / **o** / **e** / **u** (the join-across-roles table leaves `—` for stacks), but the parser accepts `zaor`, `zuar`, `zuor`, `zaer`, `zoer`, `zuer` on `/z/` `/d/` `/b/` `/ɡ/` `/v/` `/x/` and `/h/` (`haor`, `haer`, `hoer`, `huar`, `huor`). Every stack takes **-r** only as a fill-ask on `/y/` and `/th/` ([stance joins](../grammar/join-across-roles.md#standalone-stance-joins)).
- **Suggested ruling:** reject stacked **-r** outside those two with a message pointing at the single-vowel forms; no new form. Re-check against the fill-ask grid in Wave 9 before closing, since a question might want `zuar` (*everything but what?*).
- **Outcome:** known and deferred. No good reading exists for the missing stacked **-r** forms; the parser kept accepting them at that point. Closed in Wave 9: no fill-ask wants one, so the parser rejects them (see C-13, revisited).

### None (to add to unassigned-reserved, if the rows above are declined)

- Bare `hol` `hom` `haol` `haom` `hul` `hum` `huol` `huom` `hel` `hem` `hael` `haem` `hoel` `hoem` and their `/w/` twins (E-32); `her` / `wer` (E-31, already listed, with a corrected note); `wazem` before any join but an **a**-list.

Confirmed **def** with nothing to add: the ten series on `/z/` `/d/` `/b/` at every arity and ending; the single-vowel **-r** on every join role; **-n** as a named package on `/z/` `/d/` `/b/`; scope islands and SHARED placement; `/h/` **-l** / **-m** on every defined vowel.

## Hooks

Owning page: [hooks](../grammar/hooks.md). Wave 5. Cells checked with `node scripts/parse.mjs` (2026-10-02), sweeping the ten series (**a o e u**, **ao ae oe ua uo ue**) × **-l** / **-m** / **-n** / **-r** × five placements. The parser is loose on hooks: only the role check (`hookSameRole`), the point-back noun check (`hookResumeNoun`) and the stacked **-r** check (`stackedHookResume`) reject anything, so a form that parses is not a reading. Readings below come from hooks.md. Hooks as `/w/` hosts and hook compounds are **def** and added no rows. Ending cells on hooks follow the [ending patterns](#ending-patterns-already-in-use) (**-l** closed, **-m** open, **-n** titled phrase, **-r** unspecified member / point back).

### Grid

| Series | Same-role | Discourse (front) | Extra noun (+ `/b/`) | Point back (**-r**, no noun) | Fused (advanced) |
|--------|-----------|-------------------|----------------------|------------------------------|------------------|
| **a** | def *including* | def *additionally* | def *in* / *amid* | def `ar` | def *enter* / *mill amid* |
| **o** | def *instead* | def *instead* | def *at* / *near* | def `or` | def *attend* / *adjoin* |
| **e** | def *rather* | def *in other words* | def *for* / *used by* | def `er` | def *serve* / *have in use* |
| **u** | def *except* | def *except* | def *from* / *away from* | def `ur` | def *leave* / *recede* |
| **ao** | E-34 (listed none) | def *for example* (`aom` *among others*) | def *on* / *over* | none (E-35, D-line) | def *mount* / *cover* |
| **ae** | E-34 (listed none) | def *in fact* (`aem` gen, C-14) | def *using* / *by* | none (E-35) | def *wield* / *channel* |
| **oe** | def span *through* | E-33 | def *toward* / *in the direction of* | span **-r** only (E-35) | def *head for* / *orient* |
| **ua** | def span *strictly between* | E-33 | def *out of* / *out from among* | span **-r** only (E-35) | def *exit* / *pick out* |
| **uo** | E-34 (listed none) | E-33 | def *through* / *by way of* | none (E-35) | def *traverse* / *relay* |
| **ue** | def span *outside* | E-33 | def *against* / *contrary to* | span **-r** only (E-35) | def *oppose* / *defy* |

By ending: **-l** / **-m** are **def** on every defined cell (closed / open). **-n** is **def** on every placement by one rule (the hook titles a proper-name phrase). **-r** is **def** only as the four plain point-back hooks, and as the span fill-ask on `oe` / `ua` / `ue` (always a word each side). Extra-noun **-r** is rejected by design (`hookResumeNoun`).

The extra-noun column is full: all ten series have both **-l** and **-m**, so no unused slot remains there. The only empty cells are the ones logged below.

### Rows

#### E-33 — discourse stacks `oel` / `ual` / `uol` / `uel` (and **-m**) · forced · P3

- **Proposed reading:** the extra-noun cue carried to the front of a sentence, as `aol` / `ael` already are: `oel …` *Next, …* / *Heading there, …*; `ual …` *Aside from that, …*; `uol …` *By the way, …*; `uel …` *On the contrary, …*.
- **Example:** `uel zalahen varahal.` — against | z-Alahen | v-run — "On the contrary, Alahen runs." Parses with no reading.
- **Pattern:** extra-noun stacks reused at the front (`aol` *for example*, `ael` *in fact*)
- **Current route:** `xevavem` *next*, `xavazem` *by the way*, `xagezal` *on the contrary* (dependents § sentence linkers); *apart from that* is `al …` / `ur …` ([design-decisions](design-decisions.md#genitive-and-other-free-hook-slots))
- **Better than current route:** no. Every guess already has a linker, and a second way to open a sentence would split the same job between the linker and hook families. The cues also drift: `oe` says an ordered path, which a learner reads as *next* or as *toward*, so no single reading is guessable.
- **Conflicts and notes:** the two readings **`aol …`** and **`ael …`** work because the cue *add one case* and *add a further point* are about adding. The other four stacks have no adding cue.
- **Closes:** —
- **Recommendation:** decline; add the cells to unassigned-reserved (only the D-line mentions them today) and extend the D-line with the reason.
- **Outcome:** declined — design-decisions (hooks), unassigned-reserved; the parser rejects the forms (`hookDiscourseStack`).

#### E-34 — same-role `aol` / `ael` / `uol` · intuitive but redundant (`aol`), forced (`ael`, `uol`) · P3

- **Proposed reading:** `aol` one sample of A (*such as B*, the same cue as discourse `aol …` *for example*); `ael` *especially B*; `uol` *via B*.
- **Example:** `zavahal aol zazawan.` — "The family, for example Azawan." Parses with no reading.
- **Pattern:** `aol …` for example, carried inside the clause
- **Current route:** `am` (*including, and maybe more*; hooks.md says *such as* is `am`), `zem` for *especially* ([say-amounts](../grammar/say-amounts.md#focus-words)), and an extra-noun `uol` after the verb for *via*
- **Better than current route:** no. `am` already says B is part of A and not the whole, which is what *such as* says. The `aol` / `am` difference (a sample versus a membership claim) is too fine to teach as two words.
- **Conflicts and notes:** already declined once for `aol` *namely* ([design-decisions](design-decisions.md#genitive-and-other-free-hook-slots)), and listed in unassigned-reserved. `ao` / `ae` / `uo` stay unused in this slot.
- **Closes:** *such as*, *especially*, *via*: covered
- **Recommendation:** decline; keep reserved; no change to unassigned-reserved beyond naming the whole `ao` / `ae` / `uo` same-role cell.
- **Outcome:** declined — design-decisions (hooks); the parser rejects the forms (`hookSameRoleStack`).

#### E-35 — stacked point-back (`aor` / `aer` / `uor`, and `oer` / `uar` / `uer` outside a span) · intuitive but redundant · P3

- **Proposed reading:** a resume hook for the extra-noun stacks: `aor` *on it*, `aer` *with it*, `uor` *through there*, with `oer` / `uar` / `uer` *toward there* / *out of there* / *against it*.
- **Example:** `zodogal varahal aor.` — "A dog runs on it (the place already named)." `aor` is not a word at all today (syntax error).
- **Pattern:** the four plain point-back hooks (`ar` `er` `or` `ur`)
- **Current route:** the hook + a resumed `/b/` (`aol bahazar` *on the house*, `oel bahazar` *toward it*), which already names the landmark without a pointer
- **Better than current route:** no. Only four plain hooks carry a place, source or goal; the other six name a relation to a landmark, and the landmark's whole stem is the reliable way to point.
- **Conflicts and notes:** `oer` / `uar` / `uer` are already the span fill-ask (*some one in the range*), so a point-back reading would collide with a defined reading; `aor` / `aer` / `uor` would be the only stacked forms with a resume and no span. Already settled in [design-decisions](design-decisions.md#genitive-and-other-free-hook-slots) for `aor`.
- **Closes:** *toward there*, *through there*: covered
- **Recommendation:** decline; widen the D-line to the other five cells so it is not re-raised.
- **Outcome:** declined — design-decisions (hooks); `aor` / `aer` / `uor` are no longer words (`stackedHookResume`).

### Inconsistencies (wave 5)

#### C-14 — the parser accepts hook forms the docs call unassigned, and one fails without a pointer · found in hooks grid

- **Where:** [hooks § Point back](../grammar/hooks.md#hook-resume), [hooks § Spans](../grammar/hooks.md#spans), [unassigned-reserved § Hooks — in-clause](unassigned-reserved.md#hooks--in-clause), parser (`enforce.ts`)
- **Problem:** (1) `zavahal aol zazawan`, `zavahal ael zazawan`, `zavahal uol zazawan` and the `ao` / `ae` / `uo` same-role forms parse silently, although unassigned-reserved says they have no reading. (2) `zavahal ar zazawan` and `zazawan or zahaben vezebal` (a plain point-back hook with a noun on each side) parse silently, although hooks.md says a point-back hook takes no noun to its right and the only same-role **-r** is the stacked span fill-ask. (3) `oel` / `ual` / `uol` / `uel` at the front of a sentence parse with no reading (E-33). (4) `aor` / `aer` / `uor` fail at the word level with *Expected [aeouhwdybgzmnvlr] but end of input found*, with no pointer, unlike `oer` / `uar` / `uer`, which have `stackedHookResume`. (5) hooks.md gives no reading for discourse `aem …` (only `aom …` is stated), though the general **-m** rule makes it *in fact, and maybe more*.
- **Suggested ruling:** reject (1), (2) and (3) with messages pointing at `am`, the span hooks and the linker table; give (4) the same pointer as the stacked **-r** rule (never a word); in hooks.md state the **-m** reading for `aem` and say once that a point-back hook has nothing on its right.
- **Outcome:** fixed — the parser rejects same-role `ao` / `ae` / `uo`, discourse `oe` / `ua` / `uo` / `ue`, and a point-back hook with a noun on its right, and gives `aor` / `aer` / `uor` the stacked **-r** pointer; hooks.md states `aem …` and that a point-back hook takes no noun.

### None (to add to unassigned-reserved, if the rows above are declined)

- Discourse `oel` / `oem`, `ual` / `uam`, `uol` / `uom`, `uel` / `uem` (E-33).
- Same-role `ao`, `ae`, `uo` at every ending (E-34; `aol` / `ael` / `uol` already listed).
- Stacked point-back **-r** `aor` / `aer` / `uor` (E-35); `oer` / `uar` / `uer` stay span-only.

Confirmed **def** with nothing to add: all four plain vowels at **-l** / **-m** in the three placements, the ten extra-noun series at **-l** / **-m**, hook **-n** as a title, `/w/` before every hook placement, parallel chains, the fused compounds, and the span series at every ending.

## Spans

Owning page: [spans](../grammar/spans.md). Wave 6. Cells checked with `node scripts/parse.mjs` (2026-10-02), sweeping every role letter (`z d b v g w h th y x`) × TYPE (**a e o u**) × EDGE (**a e o u**) × **-l** / **-m** / **-n** / **-r**, plus the written fences. EDGE **-r** forms outside EDGE **u** collide with role pointers (`zaxar`, `zaxor`) or are rejected, and `daxum` / `daxun` are ordinary compounds (already in unassigned-reserved), so the ending cells that matter are EDGE **a / e / o** × **-l** / **-m** / **-n**, EDGE **u** × **-l** / **-r**, which are all **def**. Topics inside quotes are **def** (spans § Topics in a quote). The grid below is therefore by role letter.

### Grid

| Span | `/z/` | `/d/` | `/b/` | `/v/` | `/ɡ/` | `/h/` | `/th/` | `/w/` | `/x/` | `/y/` |
|------|-------|-------|-------|-------|-------|-------|--------|-------|-------|-------|
| Cite `[…]` | def | def | E-36 | def | E-36 | E-36 | C-15 | C-15 | E-38 | def |
| Mention `{…}` | def | def | E-36 | def | E-36 | E-36 | C-15 | C-15 | E-38 | def (none, `ySpanType`) |
| Opaque `<…>` | def | def | E-36 | E-36 | E-36 | E-36 | C-15 | C-15 | E-38 | def |
| Aside `(…)` | C-15 | C-15 | C-15 | C-15 | C-15 | C-15 | def | C-15 | C-15 | def (none, `ySpanType`) |

Parser findings: every cell above parsed except `/x/` written spans (a syntax error), so the parser read `d(…)`, `th[…]`, `thaxol` and `w<very>` with no reading. A written bracket cite holds its interior as a single payload (`d[ yol zalahen vowogal ]` parses; the spoken `daxal yol zalahen vowogal xuxul` is still rejected today, pending E-37). Asides add no names to an outer ordinal count and no pointer anchors; a cite counts its own names from scratch and adds none outside (C-16).

### Rows

#### E-36 — opaque (loan) words in the verb, adjective, adverb and recipient slots · intuitive · P2

- **Proposed reading:** the role letter says the part of speech; the blob keeps its own spelling (*googled*, *a rouge dog*, *allegro*, *tell Sam*).
- **Example:** `zalahen v<google> dazawan.` — z-Alahen | v-<google> | d-Azawan — "Alahen googled Azawan." Parses today.
- **Pattern:** `d<kimchi>` and `z@<Sam>`: the letter on the fence is the slot
- **Current route:** the page names only `/z/` `/d/` (and `/y/` calls); a loan verb has no stated route (`find-english`: *foreign word*, *loanword*: no row)
- **Better than current route:** yes: loans are common, and `/b/` is where a foreign name goes as recipient
- **Conflicts and notes:** none; the parser already reads these cells. Only a part of speech with a content root takes a loan: `/th/` is the aside, and `/w/` and `/x/` are closed classes (C-15).
- **Closes:** *to google*, *a rouge dog*, *tell Sam*: no row
- **Recommendation:** adopt as a docs gap; no new form. Teach in [spans § Outer slot](../grammar/spans.md#pos) with a drill.
- **Outcome:** adopted — rows for `/b/` `/ɡ/` `/h/` and the loan paragraph added to spans § Outer slot, with an English → Agazan and an Agazan → English drill.

#### E-37 — an act word inside a spoken cite (`daxal yol … xuxul`) · intuitive but redundant · P3

- **Proposed reading:** a quoted question or command keeps its own act word, as it keeps its own tone mark.
- **Example:** `zazawan daxal yol zalahen vowogal xuxul vezebel.` — rejected today (a spoken cite holds clauses, not turns).
- **Pattern:** a quote keeps the original speaker's tone ([speech-moves](../grammar/speech-moves.md#tone-marks))
- **Current route:** a reported question, `zazawan vezebel dorl zalahen vowogal.`; the gist is `d~[…]`
- **Better than current route:** only for a verbatim question, which the report already carries
- **Conflicts and notes:** the written `d[ yol zalahen vowogal ]` parses, but its interior is one payload that the parser never reads, so the written and spoken forms are not a mismatch in grammar. An inner act word would also split the cite from the turn it sits in: `yol` at the front of a clause reads as a new turn.
- **Closes:** *she asked, "Are you coming?"*: covered by the reported question
- **Recommendation:** adopt (reversed from decline).
- **Outcome:** adopted (reversed from decline) — a quoted question or command keeps its own act word inside a spoken cite. Taught in [spans § Act words in a quote](../grammar/spans.md#quote-acts); the parser reads `daxal yol … xuxul`.

#### E-38 — a span as a topic word (`x@<Sam>`) · intuitive but redundant · P3

- **Proposed reading:** *now, about Sam* for a foreign name.
- **Example:** `x@<Sam> zozan vowogal.` — a syntax error today.
- **Pattern:** an `/x/` content word sets the topic ([topic](../grammar/pronouns.md#topic))
- **Current route:** `z@<Sam>` as the subject each time, with `z<=>` resuming it
- **Better than current route:** marginal
- **Conflicts and notes:** D-20 wants every topic return spelled by stem so every tool reads one topic from the words alone; an opaque blob has no stem, and the topic pronoun would then point at a blob.
- **Closes:** —
- **Recommendation:** adopt (reversed from decline).
- **Outcome:** adopted (reversed from decline) — an `/x/` cite, mention or opaque sets the topic (`x@[onodan alahen]`, `x{odoga}`, `x@<Sam>`). Taught in [spans § Topics in a quote](../grammar/spans.md#topic-quotes) and [pronouns § Topic](../grammar/pronouns.md#topic).

### Inconsistencies (wave 6)

#### C-15 — the parser accepts spans in slots the page gives no reading · found in span grid

- **Where:** [spans § Outer slot](../grammar/spans.md#pos), [spans § Asides](../grammar/spans.md#asides), parser
- **Problem:** `d(zalahen vowogal)`, `dexal … xuxul` (an aside under `/d/`), `th[sic]`, `thaxol …` (a cite under `/th/`) and `w<very>` / `wexal …` parsed with no reading, though the page says an aside is `th(…)` and the slot table lists only `/d/` `/z/` `/v/` `/th/`.
- **Suggested ruling:** reject them with a pointer to the slot table; an aside resume (`dexur`) stays free to recast the aside.
- **Outcome:** fixed — the parser rejects them (`spanSlot`); D-28 and unassigned-reserved record the cells.

#### C-16 — spans.md does not say what an aside or cite does to outer ordinals and pointers · found in topics and ordinals inside spans

- **Where:** [spans § Topics in a quote](../grammar/spans.md#topic-quotes), parser (`resolve.ts`)
- **Problem:** the page gave a topic row for cite and aside only. The parser counts no name inside a cite or an aside toward an outer ordinal (`z=#3` fails after `th(zahaben vezehal)`), and an aside adds no pointer anchors (`zaxar` after it still points at the outer doer), but no page said so.
- **Suggested ruling:** state both beside the topic table; no parser change.
- **Outcome:** fixed — one sentence added after the table.

### None (added to unassigned-reserved)

- Aside under any role but `/th/`; cite, mention or opaque under `/th/`; any span under `/w/` (C-15). `/x/` cite, mention and opaque are topic words (E-38).

Confirmed **def** with nothing to add: TYPE × EDGE × **-l** / **-m** / **-n** on `/z/` `/d/` `/b/` `/v/` `/ɡ/` `/h/` (the open map in spans § Reference tables), EDGE **u** with **-l** / **-r**, nesting, the three close words, `/y/` calls with cite and opaque, and topics inside cites.

## Join series on other roles

Owning page: [join-across-roles](../grammar/join-across-roles.md). Wave 7. Cells checked with `node scripts/parse.mjs` (2026-10-02), sweeping `/v/` `/x/` `/th/` `/ɡ/` `/h/` × the ten vowels (**a o u ao ua uo e ae oe ue**) × **-l** / **-m** / **-n** / **-r**. The parser reads nearly every cell (a stance join after stance words, a clause join between clauses and a verb join all parse with no reading), so a form that parses is not a reading. Only `/h/` stacked **-r** (`haor`, `huar`, `huor`, `haer`) and `her` are rejected, because restrictors own them (D-27). Phrase joins on `/z/` `/d/` `/b/` and **-l** / **-m** / **-r** on the verb and clause joins belong to the Joins grid (wave 4), and standalone `/v/` and `/ɡ/` objects (`dal van`, `gan bar`) are already def.

### Grid

| Series | **a o u** | **ao ua uo** | **e ae oe ue** | **-n** | **-r** (single vowel) | **-r** (stacks) |
|--------|-----------|--------------|----------------|--------|------------------------|------------------|
| Stance join `/th/` (standalone) | def | def | def | none (listed) | def (`thar`, `thor`, `thur`; `ther` C-18) | question only (C-18) |
| Stance join `/th/` after stance words | def (`thal` `thol` `thul`) | E-39 | E-39 | none (listed) | def | none |
| Clause sequence `/x/` | def (`xan` `xon` `xun`) | def `xaon`; E-40 for `xuan` `xuon` | E-40 (C-17 for `xen`) | def (four of ten) | def resume | none (C-19) |
| Join-act verb `/v/` | def | def | def | def (all ten) | — (VP join **-r**) | none (C-19) |
| Join-relation `/ɡ/` `/h/` | def | def | def | def (all ten) | — (adjective and restrictor **-r**) | none (C-19; `/h/` D-27) |

### Rows

#### E-39 — stance joins after stance words, the vowels beyond **a o u** (`thel` `thael` `thoel` `thuel` `thaol` `thual` `thuol`) · intuitive · P3

- **Proposed reading:** the same series as on phrase lists, applied to the stance words before the join: **e** ranked (the first ground is the main one: `thevom thewam thel`, *mostly because I saw it, and partly because I was told*), **ae** equal weight, **oe** in the order the grounds arose, **ue** the first is the weakest; **ao** open (*these grounds and maybe others*), **ua** *every ground but these*, **uo** *any ground but these*.
- **Example:** `zazawan vowogal thevom thewam thel.` — z-Azawan | v-walk | th-WITNESSED | th-TOLD | th-rank — "Azawan walks: I mainly saw it, and I was also told." Parses today; the page shows only **a** / **o** / **u** here.
- **Pattern:** the join vowel series ([joins § recap](../grammar/joins.md#join-type-vowel-series)); a stance join already works on the stance words in front of it
- **Current route:** two sentences, or `thevem` `thever` for causes; evidence weight has no one-word route (`find-english`: *mainly because*, *chiefly*: no row)
- **Better than current route:** yes for rank and equal weight; marginal for the rest
- **Conflicts and notes:** the standalone table already lists every vowel, and the unassigned list says the rank series has "no worked reading yet", so this closes a docs gap, not a form gap. A stance join is a list of grounds, so the readings follow the phrase list exactly and add nothing to learn.
- **Closes:** *mainly because …, partly because …*: only `thever`
- **Recommendation:** adopt as a docs gap; no new form. Add one worked row per vowel to [join-across-roles § stance joins](../grammar/join-across-roles.md#stance-joins) and drop the rank line from unassigned-reserved.
- **Outcome:** adopted — taught as a worked row per vowel in [join-across-roles § stance joins](../grammar/join-across-roles.md#stance-joins); no new form, no parser change.

#### E-40 — clause sequence **-n** on the other six vowels (`xuan` `xuon` `xen` `xaen` `xoen` `xuen`) · forced, and redundant · P3

- **Proposed reading:** *and then* with a second axis: `xen` *and then, most important first*, `xoen` *first of all*, `xuan` *and then, leaving out …*.
- **Example:** none worth teaching; the parser reads all six with no reading.
- **Pattern:** the four defined `xan` `xon` `xun` `xaon`, and the ten-vowel `/v/` and `/ɡ/` **-n** series
- **Current route:** `xoel` / `xoem` for steps whose order is the claim; `xrebal` *finally* and `xrebul` *starting with* ([numbers](../grammar/numbers.md)); the linker `xevavem` *next*
- **Better than current route:** no. A sequence is already ordered, so **e** adds nothing; *first of all* and *finally* have number words; the inverted vowels have no guessable *and then* reading.
- **Conflicts and notes:** `xen` / `xon` / `xun` are also the greeting departure marks after a name ([x-compounds](../grammar/x-compounds.md)), though a name before them keeps the two readings apart. The join-act table (C-17) wrongly shows `xen` as a clause counterpart.
- **Closes:** *first of all*, *to begin with*: covered by `xrebul`
- **Recommendation:** decline; add the six cells to unassigned-reserved and record the reason in design-decisions.
- **Outcome:** declined — D-29; cells added to unassigned-reserved.

### Inconsistencies (wave 7)

#### C-17 — the join-act table shows `xen` as a clause join that is not taught · found in join-act verbs

- **Where:** [join-across-roles § join-act verbs](../grammar/join-across-roles.md#join-act-verbs), [§ sequence](../grammar/join-across-roles.md#clause-sequence)
- **Problem:** the table pairs `xen` with `ven`, but Sequence defines only `xan` `xon` `xun` `xaon`. `xen` has no clause reading, and `xen` as a sentence word is the departure greeting.
- **Suggested ruling:** drop the `xen` row, and say the table pairs each join-act verb with its clause sequence where one exists.
- **Outcome:** fixed — the `xen` row is dropped and the table says prioritizing has no clause sequence.

#### C-18 — the standalone stance table leaves `ther` and the stacked **-r** cells blank, but the question list uses them · found in stance joins

- **Where:** [join-across-roles § standalone stance joins](../grammar/join-across-roles.md#standalone-stance-joins)
- **Problem:** the table shows `—` for `ther` and for every stacked **-r**, while the question list that follows defines `ther` (*What's the main reason?*) and `thaor` … `thuer` as fill-asks, and joins.md says **-r** attaches only to single vowels. Outside a question, only the single-vowel **-r** cells have a reading.
- **Suggested ruling:** fill `ther` in the table (*for one main reason, not named*), and mark the stacked **-r** cells *question only*.
- **Outcome:** fixed — `ther` filled in; stacked **-r** cells marked *question only*.

#### C-19 — the parser reads stacked **-r** on `/v/` `/x/` `/ɡ/` joins with no reading · found in the sweep

- **Where:** [joins § rare arities](../grammar/joins.md#reference-tables), parser
- **Problem:** `vaor`, `xuar`, `gaor` and the like parse silently, though stacked **-r** is defined only as the stance fill-ask (`/th/`) and is rejected on `/h/` (D-27). A learner who tries `vaor` gets no error and no reading.
- **Suggested ruling:** reject them with a pointer to the join-series section; the stance fill-ask stays.
- **Outcome:** fixed — the parser rejects stacked **-r** on `/v/` `/x/` `/ɡ/` joins (`stackedJoinResume`); D-29.

### None (to add to unassigned-reserved if the rows above are declined)

- Clause sequence **-n** beyond `xan` `xon` `xun` `xaon` (E-40). The `/th/` **-n** cells are already listed.
- Stacked **-r** on `/v/` `/x/` `/ɡ/` joins (C-19).

Confirmed **def** with nothing to add: the ten join-act verbs and ten join-relations on `/ɡ/` `/h/` at **-n**, the **-l** / **-m** ten-vowel series on `/v/` `/x/` `/th/`, the standalone stance joins at **-l** / **-m**, and a standalone object under `van` / `gan`.

## Hosted relations and bars

Owning pages: [relations](../grammar/relations.md), [comparatives](../grammar/comparatives.md#bars). Wave 8. Cells checked with `node scripts/parse.mjs` (2026-10-02). The parser does not tie a relation root to a host letter, so every relation parses on every letter, and a parse is not a reading. The rejection that matters is `barKind`: only a value-setting stance is a bar.

### Grid

| Relation | `/ɡ/` | `/h/` | `/th/` | `/w/` |
|----------|-------|-------|--------|-------|
| similative, exchange, proxy | def | def | none | none |
| locative (`azam` `ebum` `ugem`) | def | def | none | none |
| of-relations (`obom` `ahem` `uwum` `agum`, `ozazom`) | def | def | none | none |
| as-of (`uhum` `uram`) | def | def | def (stance as-of) | def (adjective snapshot) |
| social ties (`emezem` `agayem` `ohoham` `ahabom`) | def | E-41 | none | none |
| stimulus (`obum`) | def | none (the stance owns the event) | none | def (sake before `gobum`) |

| Bar | def | E-42 | E-43 |
|-----|-----|------|------|
| met sake, channels, FORMER, NOTIONAL, PLAN, ABIL, REQUIRE, PERMIT, CONSENT, speaker attitude | def | | |
| WANT `thohul` `thohum` `thohur` | | E-42 | |
| DECISION, ATTEMPT, bans (`thedel` …), refusals (`thuxedel` …), RESIDUE, MAY, MIRATIVE, CAUSE, poles | | | E-43 |

Only the as-of overlay takes `/b/` on `/w/`; any other `/w/` + `/b/` is a parse error (`wumum bazawan`). A relation root on `/th/` (`thumum bazawan`) reads as a speaker attitude with a holder, the ordinary content root on `/th/`. Which roles a closed root takes is the Mood roots grid (wave 13).

### Rows

#### E-41 — social ties on `/h/` (`hemezem bazawan`, `hagayem bazawan`) · intuitive but redundant · P3

- **Proposed reading:** the event is done in that tie: *as Azawan's friend*, *as Azawan's boss*.
- **Example:** `zalahen vowogal hemezem bazawan.` — z-Alahen | v-walk | [h-companionship | b-Azawan] — "Alahen walks as Azawan's friend." Parses today; the page shows only `/ɡ/`.
- **Pattern:** the of-relations, which sit on `/ɡ/` for a noun and `/h/` for an event
- **Current route:** the tie on the person, which is the capacity: `zalahen gemezem bazawan vowogal` (*Alahen, Azawan's friend, walks*); `gugol` + a role noun for *as a guard* ([identity](../grammar/predication.md))
- **Better than current route:** no. The doer is always a noun in the clause, so the adjective already says *as*; an adverb adds only a second tie word to learn.
- **Conflicts and notes:** `hemezem` is already the ordinary `/h/` use of the root.
- **Closes:** *works as*, *acts as*, *in the capacity of* (`find-english`: *works as*, *acting as*, *in the capacity*, *serves as*, *treated as*, *qualifies as*: no row)
- **Recommendation:** decline; record in design-decisions.
- **Outcome:** declined — D-30. (Applied on my recommendation before the language owner ruled; see the no-change-without-approval rule in the review plan.)

#### E-42 — WANT as a bar (`thohul` `thohum` `thohur`) · intuitive · P2

- **Proposed reading:** the want sets the level wanted: *more than wanted*, *lighter than Alahen wanted*. The ending keeps its job, and the holder `/b/` is whose want it is.
- **Example:** `zubugal thohum balahen zuel garagam.` — [z-book | [th-WANT-unstated | b-Alahen] | z-rank/less | g-heavy] — "The book is lighter than Alahen wanted." The parser rejected it before (`barKind`).
- **Pattern:** PLAN (*than planned*) and the speaker attitude (*than hoped*): both name the level a mind set. WANT already has a holder `/b/` ([whose want](../grammar/intention.md#whose-intention)).
- **Current route:** the hope bar `thevegem` (*than I hoped*), which is your attitude, not the subject's want; for someone else's want, two sentences
- **Better than current route:** yes. *Than he wanted* is common, and a learner who knows the bar and the want guesses it.
- **Conflicts and notes:** this reverses an earlier exclusion: [design-decisions](design-decisions.md#bars) listed WANT among stances that set no value. The language owner ruled that WANT stays a bar. DECISION and ATTEMPT commit to an act and set no level (E-43).
- **Closes:** *more than wanted*, *less than I wanted* (`find-english`: *than wanted*, *than I wanted*, *than desired*: no row)
- **Recommendation:** adopt; parser accepts the `want` overlay kind as a bar.
- **Outcome:** adopted (confirmed by the language owner) — taught in the bar table and [Every bar](../grammar/comparatives.md#stance-bars); `want` added to the bar kinds in the parser.

#### E-43 — DECISION, ATTEMPT, bans, refusals and the rest as bars · forced · P3

- **Proposed reading:** *than decided* (`thehum`), *than tried for* (`thudum`), *more than banned* (`thedel`).
- **Example:** none worth teaching; the parser rejects all of them (`barKind`).
- **Pattern:** the bars that already set a value
- **Current route:** PLAN for *than decided* (`thamam`); PERMIT for a limit (`thegol`); REQUIRE for a demand
- **Better than current route:** no. A decision or an attempt commits to an act and sets no level, a ban is the other side of PERMIT, and a refusal is the other side of CONSENT. Each already has the positive bar.
- **Closes:** *than decided*, *than I tried*: PLAN
- **Recommendation:** decline; record in design-decisions.
- **Outcome:** declined — D-30. (Applied on my recommendation before the language owner ruled; the owner has not yet confirmed.)

### None (added to unassigned-reserved)

- Relation roots on `/w/` with `/b/`, other than as-of; a relation root on `/th/` is wave 13.

Confirmed **def** with nothing to add: each relation on `/ɡ/` and `/h/`, `/w/` grading the relation before the host, an empty `/b/` after a joined subject (*alike*, *friends*), the as-of pair on all four letters, and stance bars at **-l** / **-m** / **-r** on channels, REQUIRE and PERMIT.

## Questions

Owning page: [questions](../grammar/questions.md); the stance fill-ask lives in [join-across-roles](../grammar/join-across-roles.md#standalone-stance-joins). Wave 9. Cells checked with `node scripts/parse.mjs` (2026-10-02). The parser accepts a join-**-r** blank on every host, so a parse is not a reading; the rejections that matter are stacked act words (`yol yar`), a `/w/` blank with no adjective after it, and stacked **-r** on `/v/` `/x/` `/ɡ/` (C-19).

### Grid

| Blank | `/z/` `/d/` `/b/` | `/v/` | `/x/` | `/ɡ/` | `/h/` | `/w/` | `/th/` | `/y/` |
|-------|--------------------|-------|-------|-------|-------|-------|--------|-------|
| **-r** *who / what* | def | def (`var` *what did they do?*) | def (`xar` *what happened?*) | E-44 | def (`har` *when?*) | def (`war` before an adjective) | def (`thar`, C-20) | none (`yar` is a stacked act) |
| **-o / -u / -e** *any / else / first* | def | def | def | E-44 | def | def | def | none |
| Stacked **-r** | C-13 | rejected (C-19) | rejected (C-19) | rejected (C-19) | rejected | rejected | def (question only) | none |
| Number blank (`grar`, `drar`, `hrar`) | def | — | — | def | def | — | — | — |
| Hook + `bar` (*where?*, *how?*, *why?*) | def | — | — | — | — | — | — | — |

| Position | Yes/no | Fill-ask |
|----------|--------|----------|
| Matrix `yol` / `yom` | def | def |
| Inside `dorl` under a statement (reported question) | def | def |
| Inside `dorl` / `darl` under `yol` | E-46 | E-46 (parser reads every blank as the outer ask) |
| Topic word as the whole question (`yol xazawan.`) | E-49 | — |
| Genitive hook + `bar` (`em bar`) | — | E-45 |

| Polar position | State |
|----------------|-------|
| alone, before a body, as a `yol` / `yom` confirm tag, with `!!` or `?` | def |
| tag with another polar word (`yol yuel`, `yol yaol`, `yol yaer`) | E-48 |
| *Really?* (`yol ?!yael`) | E-47 |
| before an act word, or two polar words in a row (`yael yal`, `yael yol zar vowogal`, `yael yuel`) | C-21 |
| after a body inside a turn (`zazawan vowogal yael.`), or inside a dependent | rejected: a polar word is its own turn |

### Rows

#### E-44 — property blank on `/ɡ/` (`gar` / `gor` / `gur` / `ger`) · intuitive · P2

- **Proposed reading:** the blank for a **property**: `yol zodogal gar.` *What is the dog like?* / *What kind of dog is it?*; `gor` *any kind?*, `gur` *what else is it like?*.
- **Example:** `yol zodogal gar.` — y-question | z-dog | g-what-kind — "What is the dog like?" Answer: `gelavam.` (a citation). Parses today as a fill-ask.
- **Pattern:** the fill-ask rule (the slot you want filled takes join **-r**), which already reads `zar`, `var`, `xar`, `har`
- **Current route:** the similative blank `humum bar` (*like what?*), which asks for a model to resemble, not the property; for a number, `grar`
- **Better than current route:** yes: *What color is it?*, *What's it like?* have no row (`find-english`: *what color*, *what is it like*, *what kind of*)
- **Conflicts and notes:** the fill-ask table lists only `/z/` `/v/` `/x/`, and [joins](../grammar/joins.md) does not teach adjective **-r** as a blank, so the cell is **def** by rule but never shown.
- **Closes:** *what is it like?*, *what color is it?*
- **Recommendation:** adopt as a docs gap; no new form. Add `/ɡ/` to the fill-ask table and one example to [questions § fill-ask](../grammar/questions.md#fill-ask-r), and a checkpoint.
- **Outcome:** adopted as a docs gap — taught in [questions § What kind?](../grammar/questions.md#what-kind) with a checkpoint; no new form, no parser change.

#### E-45 — *whose?* (`em bar`) · intuitive · P1

- **Proposed reading:** the genitive hook with the blank, the same shape as *where?* (`ol bar`): `yol zodogal em bar.` *Whose dog?*; `yol zodogal em bar vowogal.` *Whose dog walks?*.
- **Example:** `yol zodogal em bar vowogal.` — y-question | [z-dog | [used-by | b-who]] | v-walk — "Whose dog walks?" Parses today.
- **Pattern:** hook + `bar` ([where](../grammar/questions.md#where), [how](../grammar/questions.md#how), [why](../grammar/questions.md#why))
- **Current route:** none stated (`find-english`: *whose*: only as-of rows)
- **Better than current route:** yes: *whose?* is everyday English
- **Conflicts and notes:** `em` says use or access, not ownership ([whose](../grammar/hooks.md#genitive)), so the question is *whose use?*. For ownership, `gegabem` + `bar`.
- **Closes:** *whose dog?*, *whose is this?*
- **Recommendation:** adopt as a docs gap; no new form. Add `em bar` to the *where?* table (rename the section to cover hook questions, or add a short *Whose?* section) and a checkpoint.
- **Outcome:** adopted as a docs gap — taught in [questions § Whose?](../grammar/questions.md#whose) with a checkpoint; no new form.

#### E-46 — a blank inside a dependent under `yol` · forced (one new rule) · P1

- **Proposed reading:** the stand-in vowel owns the blank. In a **`dorl`** (*whether*) dependent the blank belongs to the dependent and the outer `yol` is yes/no: `yol zehodon vubugal dorl zar vowogal.` *Do you know who walks?*. In a **`darl`** (*that*) dependent the blank belongs to the outer `yol`: `yol zehodon vevegal darl zar vowogal.` *Who do you think walks?*.
- **Example:** both above. Today the parser reads both as an outer fill-ask, so *Do you know who walks?* has no route but two turns.
- **Pattern:** [stand-in vowels](../grammar/dependents.md#stand-in): **o** question-like, **a** statement-like
- **Current route:** none that keeps it one question: ask `yol zehodon vubugal.` and then the inner question as a second turn; a reported question works only under a statement
- **Better than current route:** yes: *Do you know who…?*, *Can you tell me where…?* and *Who do you think…?* are everyday. Details in `question-in-dependent.md`.
- **Conflicts and notes:** the parser currently reads both shapes as one. Changes resolve (`asks`), not the grammar of any single word.
- **Closes:** *do you know who*, *can you tell me where*, *who do you think*
- **Recommendation:** adopt the rule in `question-in-dependent.md`; teach it in [questions § embedded whether](../grammar/questions.md#embedded-whether), with a recipe row and a pair of checkpoints.
- **Outcome:** adopted — taught in [questions § A blank inside a dependent](../grammar/questions.md#blank-in-dependent) with checkpoints; the parser gives a `dorl` blank to the dependent (`inner` on the ask) and a `darl` blank to the outer `yol`; D-31.

#### E-47 — *Really?* / *Is that so?* (`yol ?!yael.`) · no new form · P2

- **Proposed reading:** none new. A bare confirm tag as the listener's own turn already asks whether the other's claim is true: `yol yael.` *Is that so?*; with the doubting mark, `yol ?!yael.` *Really?!*.
- **Example:** `zazawan vowogal. yol ?!yael.` — z-Azawan | v-walk . y-question | ?!y-yes — "Azawan walks." "Really?!" Parses.
- **Pattern:** confirm tag (`yol yael`) plus the echo mark ([echo questions](../grammar/say-questions.md#echo))
- **Current route:** `yol.` (*Huh?*) asks to repeat, not to confirm; no row for *really?* (`find-english`: *really?*, *is that so*)
- **Better than current route:** n/a (recipe gap, not a form gap)
- **Conflicts and notes:** `yaer` is receipt, not a question; `yol yaer` has no guessable reading (E-48).
- **Closes:** *really?*, *is that so?*, *seriously?*
- **Recommendation:** adopt as a recipe row in [say-questions § echo questions](../grammar/say-questions.md#echo); no new form.
- **Outcome:** adopted as a recipe row — [say-questions § Really?](../grammar/say-questions.md#really); no new form.

#### E-48 — ask tags with the other polar words (`yol yuel`, `yol yaol`, `yol yaer`, `yol yuar`) · forced, and redundant · P3

- **Proposed reading:** `yol yuel.` *…, no?* (check the denial), `yol yaol.` *…, want it?*, `yol yaer.` *…, you see?*.
- **Example:** none worth teaching; all parse as yes/no questions with no reading.
- **Pattern:** the confirm tag `yol yael`
- **Current route:** `yol yael.` for *right?* (the English *no?* tag is the same job); offers are `yom` plus a body or a `zam` list ([offers](../grammar/say-questions.md#offer-words)); *you see?* is a question about the listener, not a polar stance
- **Better than current route:** no
- **Conflicts and notes:** an answer word asked back has no stable reading: `yol yaol` would ask *take this?* of something that was never an offer.
- **Closes:** —
- **Recommendation:** decline; add the cells to unassigned-reserved and record in design-decisions.
- **Outcome:** declined — D-31; cells added to unassigned-reserved.

#### E-49 — topic-only question (`yol xazawan.`) · intuitive but redundant · P2

- **Proposed reading:** a topic word then the question mark: *What about Azawan?* / *And Azawan?*.
- **Example:** `yol xazawan.` — y-question | x-Azawan — "What about Azawan?" Parses as a yes/no question with no body.
- **Pattern:** the topic word ([topic](../grammar/pronouns.md#topic)) and the empty-body question (`yol.` *Huh?*)
- **Current route:** `yol zazawan zam.` *How about Azawan?*, taught in [yes/no with single-item](../grammar/questions.md#yes-no-single-item-standalone)
- **Better than current route:** no: the offer join already says it, and a topic word sets the topic for later sentences, which a quick *And you?* does not want
- **Conflicts and notes:** the topic reset ([topic resets](../grammar/pronouns.md#topic-resets)) would fire on a throwaway question.
- **Closes:** *what about X?*, *and you?*: covered
- **Recommendation:** decline; record in design-decisions. Add `yol zehodon zam.` *And you?* as a recipe row only if the owner confirms the reading.
- **Outcome:** declined — D-31.

### Inconsistencies (wave 9)

#### C-20 — `thar` is glossed *Why?* but asks for grounds, not cause · found in fill-ask

- **Where:** [join-across-roles § standalone stance joins](../grammar/join-across-roles.md#standalone-stance-joins), [questions § why](../grammar/questions.md#why)
- **Problem:** the example `yol zazawan vowogal thar.` is glossed "Why does Azawan walk?", but the **Compare with** line right after says `thar` asks for the speaker's grounds, not what caused the event. The cause question is `thevem bar` in questions.md, which never mentions `thar`. A learner who reads either page alone picks the wrong *why*.
- **Suggested ruling:** regloss the example and table to the grounds reading (*Why do you say Azawan walks?* / *On what grounds?*), and add a **Compare with** in questions § Why? pointing at it.
- **Outcome:** fixed — `thar` glossed as the grounds question in join-across-roles, and questions § Why? compares it with `thevem bar`.

#### C-21 — the parser accepts a polar word before an act word, and two polar words in a row · found in polar stance

- **Where:** [questions § polar stance](../grammar/questions.md#polar-stance), parser
- **Problem:** the page says a polar word stands alone or sits before a body, and that `yal` is not written after it. `yael yal.`, `yael yol zar vowogal.`, `yael yuel.` and `yaer yal zazawan vowogal.` all parse with no reading.
- **Suggested ruling:** reject a polar word before any act word, and two polar words in a row, with a pointer to the polar-stance section (an answer and then a question are two turns).
- **Outcome:** fixed — the parser rejects a polar word before an act word and two polar words in a row (`polarOrder`); stated in questions § polar stance; D-31.

#### C-13 — revisited: stacked **-r** on `/z/` `/d/` `/b/` joins

- **Check:** no fill-ask wants one. The arity table needs only **a o e u**, and a stacked blank (`zuar` *everything but what?*) has no common English question.
- **Suggested ruling:** reject stacked **-r** on `/z/` `/d/` `/b/` with a pointer to the single-vowel forms, as C-19 did for `/v/` `/x/` `/ɡ/`; the `/th/` stance fill-ask stays.
- **Outcome:** fixed — the parser rejects stacked **-r** on `/z/` `/d/` `/b/` joins too (`stackedJoinResume`); D-31 and unassigned-reserved.

### None (to add to unassigned-reserved if the rows above are declined)

- `yar` / `yor` / `yer` / `yur` as a blank in the `/y/` slot: a stacked act word, rejected.
- Tag forms `yol yuel` `yol yaol` `yol yuol` `yol yual` `yol yaer` and the rest (E-48).

Confirmed **def** with nothing to add: `zar` `dar` `bar` at every arity, `var` `xar` `har`, the number blanks, `ol` / `al` / `ul` / `el` + `bar`, `humum bar`, `thevem bar` and the other cause poles + `bar`, polar stance at **-l** / **-m** / **-r** as a turn or a before-body word, and `yol ?zar`.

## Stand-ins and `/x/` words

Owning page: [dependents](../grammar/dependents.md); the topic words are owned by [pronouns § topic](../grammar/pronouns.md#topic). Wave 10. Cells checked with `node scripts/parse.mjs` (2026-10-03). A parse is not a reading: the classifier accepts several stand-in cells that no page teaches.

### Grid

Stand-in vowels **a o e u** × ending × role letter. Forward is **-rl** / **-rm** (the next sentence fills the slot), back is **-rth**, named is **-rn**.

| Role | Forward **-rl** / **-rm** | Back **-rth** | Named **-rn** |
|------|---------------------------|---------------|---------------|
| `/z/` `/d/` `/b/` | def | def | def |
| `/v/` | — (a stacked-join **-r** form, not a stand-in; the verbal dependents `vaen` `vuon` … are def) | — | def (`varn` …) |
| `/ɡ/` | rejected (E-50) | accepted, untaught (C-22) | accepted, untaught (C-22) |
| `/h/` | rejected | accepted, untaught (C-22) | accepted, untaught (C-22) |
| `/th/` | rejected | accepted, untaught (C-22) | accepted, untaught (C-22) |
| `/w/` | rejected | rejected (gen: whole-stem **-r** on the degree word) | rejected |
| `/x/` `/y/` | rejected | rejected | rejected |
| Stacked vowel + **-rl** (`daerl`) | none (parses as the stacked join, not a stand-in) | — | — |
| **-x** on a stand-in (`darlx`) | none | none | none |

| `/x/` position or ending | State |
|--------------------------|-------|
| Linker or topic word at a sentence start, after `.`, after a `/y/` turn word, after a vocative or polar word | def |
| Topic word, then a linker in the next sentence (`xalahen. xodum zozan …`) | def |
| After a clause join, inside a dependent, after a fronted hook other than `or` | rejected, as stated (D-20) |
| Linker then topic word in one sentence (`xezom xazawan zozan …`), or the reverse | E-51 |
| Linker alone (`xodum.`), or two linkers in a row | rejected: a linker needs a body |
| Linker **-m**; firm **-l** on `xodul` `xezol` `xagezal`; **-r** resume | def |
| **-l** on `xevavem` `xagagam` `xavazem`, and **-n** on any linker (`xevavel`, `xodun`) | gen (topic of the concrete sense, or of a name) |
| **-x** on a linker | rejected (D-24) |
| Topic word on verb, adjective or adverb roots (`xowogal`, `xubuhel`, `xadehum`) | gen (a topic noun on that root) |
| Topic pronoun with no topic set, or after `xevavem` / `xavazem` | rejected, as stated |

### Rows

#### E-50 — forward stand-in on `/ɡ/` (*the fact that …*) · intuitive but redundant · P2

- **Proposed reading:** `garl` / `garm` on an adjective: the noun complement, *the fact that Azawan walks*, *glad that Alahen sits*.
- **Example:** none worth teaching. `zalahen vowogal. zarth genevem.` and `genevem zarl zazawan vowogal.` (*it is a fact that Azawan walks*) both parse and say it today.
- **Pattern:** forward stand-in on `/z/` `/d/` `/b/`
- **Current route:** the predicate `/ɡ/` with a `/z/` stand-in (`gamadam zarl …`, the subject slot); or two sentences with `zarth` (the [which-noun](../grammar/dependents.md#which-noun) rule). Verbs that take a clause (*deny*, *confirm*, *know*) take `darl`.
- **Better than current route:** no: `garl` would make a clause modify a noun, which is the relative-clause shape Agazan writes as two sentences on purpose.
- **Conflicts and notes:** the parser rejects `garl` `harl` `warl` `tharl` with a raw token-list error, not a pointer (C-22).
- **Closes:** *the fact that*, *the idea that*: covered (`find-english`: *the fact that*, *the idea that*, *glad that*)
- **Recommendation:** decline the form. Add a recipe row *the fact / idea / rumor that …* (`genevem zarl …`, or two sentences) to the owning `say-*.md` page; no new form.
- **Outcome:** declined — D-32; recipe row added to say-reasons.

#### E-51 — linker and topic word in one sentence (`xezom xazawan zozan varahal.`) · intuitive but redundant · P3

- **Proposed reading:** the linker keeps its job and the topic word then changes the topic: *However, now about Azawan: …*.
- **Example:** `zalahen vowogal. xezom xazawan zozan varahal.` — both words are `/x/`, so a learner who knows each could stack them. Rejected today (one `/x/` word opens a sentence).
- **Pattern:** a fronted word then the clause
- **Current route:** two sentences: `xazawan.` (a topic word may stand alone) then `xezom zozan varahal.`; the topic persists across the linker. Parses.
- **Better than current route:** barely: one fewer period. A stack would need a rule for which of the two sets the topic and for `xevavem` / `xavazem`, which already clear it (so *so, now about Azawan* is just the topic word).
- **Conflicts and notes:** D-20 keeps one topic-setting `/x/` word per sentence start so every tool reads the topic from one position. Reordering (`xazawan xezom …`) has the same two-word problem.
- **Closes:** *however, as for X* with a topic reset
- **Recommendation:** decline; record in design-decisions. Add the two-sentence route to [dependents § sentence linkers](../grammar/dependents.md#sentence-linkers) as one example if the owner wants it taught.
- **Outcome:** declined — D-32; the two-sentence route is taught in dependents § sentence linkers.

### Inconsistencies (wave 10)

#### C-22 — the parser accepts stand-in cells no page teaches · found in stand-ins

- **Where:** [dependents § stand-in vowels](../grammar/dependents.md#stand-in), [§ pointing back](../grammar/dependents.md#stand-in-back), [§ lexicalized stand-ins](../grammar/dependents.md#stand-in-roles), `standInKind` in `src/parse/classify.ts`
- **Problem:** `standInKind` accepts **-rth** and **-rn** on every PoS except `/x/` `/y/`, so `garth`, `harth`, `tharth`, `garn`, `harn`, `tharn` and the other vowels parse as stand-ins with morph glosses (*that-same-claim*, *statement*). The docs teach back stand-ins on `/z/` `/d/` `/b/` only (the page says other role letters work as the forward stand-in does, which is `/z/` `/d/` `/b/`), and named stand-ins on `/z/` `/d/` `/b/` and `/v/`. No reading is guessable: *such* is whole-stem **-r** (D-24), *then* and *so* are `henum barth` and `humum barth`, a stance cannot be a back pointer. The forward forms (`garl`, `harl`, `warl`, `tharl`) are rejected, but with a raw token list instead of a pointer.
- **Suggested ruling:** reject **-rth** and **-rn** on `/ɡ/` `/h/` `/th/` with a pointer to the stand-in section, and give the forward rejection the same pointer. No new form. State the `/z/` `/d/` `/b/` limit once in dependents.md. Record in design-decisions.
- **Outcome:** fixed — the parser rejects stand-ins on `/ɡ/` `/h/` `/w/` `/th/` (`standInRole`); stated in dependents § stand-in vowels; D-32.

### None (to add to unassigned-reserved, if the rows above are declined)

- Forward, back and named stand-ins on `/ɡ/` `/h/` `/w/` `/th/`, and on `/x/` `/y/`.
- Stacked-vowel stand-ins (`daerl`, `duarl`): a stacked join, not a stand-in.
- **-x** on a stand-in.
- A linker stacked with a topic word (E-51).

Confirmed **def** with nothing to add: `darl` `dorl` `derl` `durl` and **-rm** at every vowel on `/z/` `/d/` `/b/`, **-rth** and **-rn** on `/z/` `/d/` `/b/`, a pole + `barth` (*because of that*), nested `derl … darl`, the six linkers at **-m** and firm **-l**, **-r** resume on a linker, topic words on any root, a topic word after a `/y/` turn word, and the topic persisting across a linker.

## Predication

Owning page: [predication](../grammar/predication.md). Wave 11. Cells checked with `node scripts/parse.mjs` (2026-10-03). A parse is not a reading: the classifier accepts several cells that no page teaches.

### Grid

Classification (kind on `/ɡ/`) and identity (**`gugol`** + `/b/`) × role and ending.

| Cell | State |
|------|-------|
| Kind `/ɡ/` after a `/z/` name or noun (`zazawan godogal`), with `/w/` hedge, `gul`, `hual`, `yol`, `yel` | def |
| Kind **-m** (demonym) and **-r** (*of that kind*, [pronouns](../grammar/pronouns.md#cross-role-recast)) | def |
| Kind **-n** (`godogan`) | gen (a named kind, as **-n** anywhere) |
| Kind **-x** (`godogax`) | rejected; plural subjects share the kind through a noun join ([joins § shared](../grammar/joins.md#shared-after-the-join)) (def) |
| Kind on a `/d/` or `/b/` noun (`dazawan godogal varahal`) | def (the noun plus its `/ɡ/`: *Azawan, a dog*) |
| Kind or property after a verb with no `/d/` (`zalahen vedabal gadadal`) | E-53 |
| Kind or property after a `/d/` noun, as a result (`dazawan geredal` = *painted it red*) | E-53 (reads as *the red Azawan*) |
| Kind scope on `th` (`godogathal` …) | def (label scope) |
| Identity **-l** / **-m** + name `/b/` | def |
| Identity + common-noun or pronoun `/b/` (`zagavol gugol babazel`, `zalahen gugol bamagon`) | E-52 |
| Identity + resume `/b/` (`gugol bazawar`) | gen (**-r** on any `/b/`) |
| Identity with no `/b/` (`gugol`), **-m** with no `/b/` | def (*the same one again*) |
| Identity **-n** / **-r** (`gugon`, `gugor`) | gen (the ordinary root *coin* as a name / resume; not identity) |
| Identity + `/z/` or `/d/` second label (`gugol zazawan`, `gugol dazawan`) | rejected / parses as two nouns (a `/b/` is the label) |
| Identity inside a noun phrase (`zobel gugol bazawan`) | def |
| Identity question (`yol zalahen gugol bar`), kind question (`yol zodogal gar`) | def |
| Identity with `gul`, `hual`, `/w/` hedge | def (`hual` and `wabedem` parse; no page teaches `gugol … hual`) |
| Identity with label scope (`gugothal` …) | gen (a label-scope word on the identity root) |
| Existence (lone noun, noun + `/ɡ/`) | def |
| Lone `/d/` or `/b/` noun | rejected, as stated |

### Rows

#### E-52 — identity with a common-noun or pronoun label (*the guard is the police officer*, *it is me*) · intuitive but redundant · P2

- **Proposed reading:** none new. `zagavol gugol babazel.` (*the guard is the police officer*) and `zalahen gugol bamagon.` (*Alahen is me*) already parse and read as the page's rule: two labels, one individual.
- **Current route:** the same string. The page's examples use a name or `zagavol` + name only, so a learner sees no common noun or pronoun in the `/b/` slot.
- **Better than current route:** n/a; a docs gap, not a form.
- **Closes:** *it's me*, *that's him*, *the winner is the guard* (`find-english`: *it is me*, *who is that*, *the same as*)
- **Recommendation:** adopt as a docs gap (as E-36 and E-39): add one common-noun and one pronoun example to predication § Identity, and note that the second label is a `/b/` whatever its type. No parser change.
- **Outcome:** adopted as a docs gap — common-noun and pronoun examples added to predication § Identity.

#### E-53 — secondary predicate: *arrived tired*, *painted the wall red* · intuitive but redundant · P2

- **Proposed reading:** a `/ɡ/` word after the verb (`zalahen vedabal gadadal.`) says the subject's state during the act (depictive); after the object (`zalahen vazadol dazawan geredal.`) the object's resulting state.
- **Example:** `zalahen vedabal gadadal.` parses today as a second predicate unit, with no page teaching it. `zalahen vahahal dazawan gadadal.` reads as *sees tired Azawan*.
- **Pattern:** verb + `/ɡ/`
- **Current route:** two sentences with resume (`zalahen gadadal. zalahar vedabal.`), `huwem barl` for *while*, and for a result the adjective root as a verb with `thegem` (*make X ADJ*, [causation § make](../grammar/causation.md#make)).
- **Better than current route:** slightly shorter for the depictive, but the object case clashes with the noun's own adjective (*the red wall*), so a rule would be subject-only and asymmetrical. Result already has `thegem`.
- **Conflicts and notes:** [clause § complex chaining](../grammar/clause.md#complex-chaining) already stacks `/ɡ/` words after a name; a second reading of a trailing `/ɡ/` would make `vedabal gadadal gagavol` ambiguous between two states and a state plus a kind.
- **Closes:** *arrived tired*, *painted it red*, *left it open* (`find-english`: *painted the wall red*, *make him angry*, *arrived tired*)
- **Recommendation:** decline the form; record in design-decisions. Add a recipe row *arrived tired / painted it red* (two sentences, `huwem barl`, or `thegem`) to the owning `say-*.md` page, and give the stray predicate unit a rejection with a pointer (C-23).
- **Outcome:** declined — D-33; recipe rows added to say-reasons; stray predicate rejected (C-23).

### Inconsistencies (wave 11)

#### C-23 — the parser accepts predicate cells no page teaches · found in predication

- **Where:** [predication](../grammar/predication.md), [clause](../grammar/clause.md), `src/parse/`
- **Problem:** after a verb, a bare `/ɡ/` word parses as a predicate unit (`zalahen vedabal gadadal.`, `zalahen vedabal gadadal gagavol.`) with no reading in any page (E-53). (**`gugon`** and **`gugor`** also parse, but only as the ordinary root *coin* with a name or resume ending, so they are not a defect.)
- **Suggested ruling:** reject a verb followed by a bare `/ɡ/` with a pointer to [predication](../grammar/predication.md#classification) and the two-sentence route. State the limit once in predication. Record in design-decisions.
- **Outcome:** fixed — the parser rejects it (`predicateAfterVerb`, only when nothing follows and no `/b/` is hosted); stated in predication § Property; D-33.

### None (to add to unassigned-reserved, if the rows above are declined)

- **-x** on the identity root (**-n** / **-r** are the ordinary root *coin*).
- A verb followed by a bare `/ɡ/` (depictive) or a `/ɡ/` after the object as a result.
- A `/z/` or `/d/` as the second identity label.

Confirmed **def** with nothing to add: kind and property on `/ɡ/` at every ending the page teaches, `godogal gul` / `hual` / `wabedem godogal`, `yel` / `yul` + `/ɡ/`, existence with and without a `/ɡ/`, `gugol` / `gugom` + name, `gugol` alone, identity in a noun phrase, `yol … gugol bar`, `yol … gar`, and label scope on kinds.

## Mid-word `x` and `th`, role compounds

Owning pages: [x-compounds](../grammar/x-compounds.md), [roles](../grammar/roles.md); the families themselves are owned by [intention § ability](../grammar/intention.md#ability), [predication § label scope](../grammar/predication.md#label-scope) and [sakes](../grammar/sakes.md). Wave 12. Cells checked with `node scripts/parse.mjs` (2026-10-03). A parse is not a reading: the classifier accepts several cells that no page teaches. Sake vowels, the ending table and emotion compose are wave 14; closed roots × role letters is wave 13; neither is gridded here.

### Grid

Left-hand types of an ordinary `x` compound, then role compounds × role letter, ending and stem, then the `th` seam × host.

| Cell | State |
|------|-------|
| Ordinary compound, left = noun, verb, adjective, name, special pronoun, closed root (`zodogaxavadal`, `zazawaxodogal`, `zamagoxodogal`, `zoyexabodel`) | def / gen (every full root can stand left; the last root is the kind) |
| Ordinary compound, right = name or special pronoun (`zodogaxazawan`) | gen (**-n** names the whole) |
| Ordinary compound on `/v/` `/ɡ/` `/h/` (`vodogaxavadal`) | gen (the slot is the whole word's) |
| Ordinary compound with a role compound on the left or right (`zaxedehoxabodel`, `zodogaxaxowogal`) | rejected → E-54 for the right-hand case |
| Role compound `a` / `e` / `u` / `o` and stacked vowels on `/z/` `/d/` `/b/` | def |
| Role compound on `/ɡ/` (`gaxedehol`) | def (*is a teacher*) |
| Role compound on `/v/` `/h/` `/th/` (`vaxedehol`, `haxedehol`) | none (C-24, rejected); `/x/` topic def after C-24 |
| Role compound on `/y/` + **-n** (`yaxebezan`) | gen (a title, as `yagavon`) → E-57 docs gap |
| Role compound on `/w/` | rejected (`/w/` takes no role compound) |
| Role compound with **-l** / **-m** / **-n** / **-r** / **-x** | def (**-n** is a handle; **-x** plural, `zaxewalx`) |
| Role compound over a name stem (`zaxazawan`); over a special pronoun with **-n** (`zaxamagon`) | gen (a name is any root + **-n**); C-25 for the pronoun |
| Role compound over a lexicon compound stem (`zaxubugalahahal`) | def |
| Role compound over an ordinary `x` compound stem (`zaxodogaxowogal`) | E-54 |
| Role compound twice (`zaxaxedehol`) | rejected |
| Role compound + label scope (`gaxedehothal`, `thul`) | E-55 |
| Role compound + ability vowel (`gaxedehoxa…`) | def ([role ability](../grammar/intention.md#role-ability), `/ɡ/` only) |
| Role pointer as the anchor of a viewpoint lateral (`gewezathaxar`) | rejected → by design (D-24) |
| Viewpoint lateral anchor = special pronoun, name, content **-r**, content **-l** (`hewezathodogal`) | def / gen |
| Label scope on `/ɡ/` `/z/` `/d/` `/b/` `/v/` `/h/` content roots | def |
| Label scope on `/w/` `/th/` `/y/` | rejected (stated) |
| Label scope on a name (`zazawathan`); on a special pronoun with **-n** (`zamagothan`) | gen; C-25 for the pronoun (`zamagothal` is *microphone*, def) |
| Conversation length on a named citation or `/y/` name | def |
| Name + `x` + vowel in a clause body (`zalahen zazawaxon varahal.`) | C-26 (reads as ability on a name) |
| Ability on a `/z/` noun, name or pronoun (`zodogaxal`, `zamagoxan`) | C-26 (ability is stated on `/v/` and `/ɡ/` only) |

### Rows

#### E-54 — role compound over an ordinary compound stem (*dog walker*, *bookseller*, *truck driver*) · intuitive · P2

- **Proposed reading:** the stem after the role vowel and **`x`** may itself be an ordinary `x` compound: `zaxodogaxowogal` is *a dog walker* (the doer of *dog-walking*), `zuxodogaxowogar` the dog walked. The compound inside is read as one event stem, exactly as a lexicon compound already is in `zaxubugalahahal`.
- **Example:** `zaxodogaxowogal varahal.` — *A dog walker runs.* Today it is rejected (the parser reads a second `x` as another seam).
- **Pattern:** `…axROOT…` with an `x` compound as ROOT; **-r** resumes the whole stem ([resume](../grammar/pronouns.md#resume-r)).
- **Current route:** none as one word. `zodogaxowogal` is only the ordinary compound *dog walk*, a kind of walk. Otherwise two sentences with resume (`zazawan vowogal dodogal. zaxowogar …`), or the doer plus an of-relation (`zaxowogal gobom bodogal`), which says *walker, a part of the dog*.
- **Better than current route:** yes. English builds *noun + agent* constantly (*taxi driver*, *wood cutter*, *bookseller*), and the left-to-right stack is already taught on the same page ([adding another piece](../grammar/x-compounds.md#ordinary-compound-order)).
- **Conflicts and notes:** the first root after `ax` can never be a single vowel, so no collision with role pointers (`zaxar`). Role vowel stays left of the first `x`; a role compound is never the left piece of another compound (keep that rejected). The relation between the pieces is as vague as in English (*dog walker* is undergoer, *coffee maker* is result); the page should say so and point to `u` / `ao` for an exact job.
- **Closes:** *dog walker*, *bookseller*, *wood cutter*, *taxi driver* (`find-english`: *dog walker*, *bookseller*, *maker*, *driver*, *wood cutter*; only unrelated hits)
- **Recommendation:** adopt. Allow an ordinary compound as the stem of a role compound; teach it under [x-compounds § adding another piece](../grammar/x-compounds.md#ordinary-compound-order) and [roles](../grammar/roles.md#role-compounds); add *dog walker / bookseller* to say-people-places § agent nouns.
- **Outcome:** adopted — a role compound's stem may be an ordinary compound; taught in roles § role compounds, x-compounds § adding another piece, and say-people-places § agent nouns; drills added.

#### E-55 — label scope on a role compound (*a teacher this time*, *so-called teacher*) · intuitive · P2

- **Proposed reading:** the scope seam goes on a role compound like any other content root: `gaxedehothal` *Alahen is a teacher (this time only)*, `gaxedehothel` *tends to act as a teacher*, `gaxedehothol balahen` *a teacher as far as Azawan is concerned*, `zaxedehothul` *a so-called teacher*.
- **Example:** `zalahen gaxedehothal.` Today rejected.
- **Pattern:** root + `th` + scope vowel + ending, with the role compound as the root.
- **Current route:** none. The stem alone takes scope (`vedehothal` *taught this once*), but that scopes the teaching, not the occupation; *so-called teacher* has no route (a [mention](../grammar/spans.md#mention) quotes the word).
- **Better than current route:** yes for *so-called doctor / expert* and *acting as a teacher this time*, both common. The scope page already says the vowel covers "how far a label reaches", and *teacher* is exactly a label that overreaches.
- **Conflicts and notes:** no rival reading: after a non-sake root, `th` + vowel is only scope, and a lateral needs a direction root. A role compound can carry ability (`x` + vowel) or scope (`th` + vowel), never both, which keeps one seam per word. Scope on the stem inside the compound stays the event.
- **Closes:** *so-called doctor*, *acted as the teacher this once* (`find-english`: *so-called*, *as a teacher*)
- **Recommendation:** adopt. Add the role-compound host to label scope and one example for **`thu`** and **`tha`**; state the one-seam rule.
- **Outcome:** adopted — label scope on a role compound (**one seam per word**, in place of the ability tail); taught in predication § label scope (*On a role compound*); drills added.

#### E-56 — role compound on `/h/` for capacity (*as a teacher, …*) · forced · P2

- **Proposed reading:** `haxedehol` as *in the capacity of a teacher*.
- **Example:** `zamagon vezebal haxedehol.` parses today with no page behind it.
- **Pattern:** `/h/` + role compound.
- **Current route:** two sentences (`zamagon gaxedehol. zamagor …`) or `humum baxedehol` for *like a teacher* (the similative).
- **Better than current route:** shorter, but `/h/` already means manner. A learner guessing `haxedehol` would as easily read *in a teacherly way*, which is the similative's job, so the form is **forced** and splits one job across two spellings.
- **Closes:** *as a parent, I …* (`find-english`: *as a teacher*, *in the capacity of*, *acts as*, *serves as*)
- **Recommendation:** decline; record in design-decisions. Give the two-sentence route a recipe row in say-people-places; reject `/h/` role compounds with a pointer (C-24).
- **Outcome:** declined — D-34; *as a teacher* gets a two-sentence recipe row in say-people-places, and `/h/` role compounds are rejected (C-24).

#### E-57 — calling someone by a role compound (*Doctor!*, *Driver!*, *Teacher!*) · intuitive but redundant · P2

- **Proposed reading:** none new. `yaxebezan.` (*Doctor!*) and `yaxedehon vowogal.` already parse: the vocative's kind-as-title rule ([speech-moves § call someone](../grammar/speech-moves.md#vocative)) takes a role compound with **-n**, exactly as it takes `yagavon`.
- **Current route:** the same string. The page's only kind-title example is a plain noun (`yagavon`), so a learner never sees that the common title nouns (*doctor*, *officer*, *driver*, *waiter*) are role compounds.
- **Better than current route:** n/a; a docs gap, not a form.
- **Closes:** *Waiter!*, *Doctor!*, *Officer!* (`find-english`: *waiter*, *doctor*)
- **Recommendation:** adopt as a docs gap (as E-36, E-39, E-52): add `yaxebezan` to the vocative section and note the resume use (`yaxebezar` is not a call). No parser change.
- **Outcome:** adopted as a docs gap — roles § role compounds names the `/y/` + **-n** / **-r** call; speech-moves § vocative points to it. No parser change.

#### E-58 — role pointer as a lateral's facing anchor (*on the doer's left*) · intuitive but redundant · P3

- **Proposed reading:** `gewezathaxar` as *on the left of whoever did the latest thing*.
- **Current route:** name the party by whole-stem resume (`gewezathazawar`), which every lateral already takes. D-24 keeps pointers to `/z/` `/d/` `/b/` and holder slots, and a lateral's anchor is neither.
- **Better than current route:** no; a pointer there is one letter shorter than a resume and gives up the stated rule.
- **Closes:** nothing found (`find-english`: *left of the one who*, no entry).
- **Recommendation:** decline; add to the D-24 list (the parser already rejects it).
- **Outcome:** declined — added to D-24; the parser already rejects it.

### Inconsistencies (wave 12)

#### C-24 — role compounds parse on `/v/` `/h/` `/x/` `/th/` with no reading (`/x/` kept as a topic) · found in roles

- **Where:** [roles](../grammar/roles.md#role-compounds), [unassigned-reserved § role compounds](unassigned-reserved.md#role-compounds), `src/parse/`
- **Problem:** the page teaches `/z/` `/d/` `/b/` and (on predication) `/ɡ/`; unassigned-reserved lists `/v/` `/h/` `/w/` as *undefined*. The parser accepts `vaxedehol`, `haxedehol`, `xaxedehol` and `thaxedehol`, and only rejects `/w/`. `xaxedehol` does not even set a [topic](../grammar/pronouns.md#topic) (a following `zozan` is rejected), so it is a topic-shaped word with no topic. `/y/` + **-n** is a title (E-57) and stays.
- **Suggested ruling:** reject a role compound outside `/z/` `/d/` `/b/` `/ɡ/` and `/y/` + **-n**, with a pointer to [roles](../grammar/roles.md#role-compounds); list `/x/` and `/th/` beside `/v/` / `/h/` in unassigned-reserved; record in design-decisions with E-56.
- **Outcome:** fixed, narrowed by ruling — role compounds are rejected on `/v/` `/h/` `/w/` `/th/` (`roleCompoundSlot`) and on `/y/` except **-n** / **-r**; `/x/` is kept and the parser now treats a role compound as a topic word (introduce, and return by whole stem), taught in pronouns § topic. D-34. Every other `x` compound (ordinary compound, multipart name, numeric derivation) was then made a topic word the same way.

#### C-25 — role compound and label scope accept a name or special pronoun · found in roles and predication

- **Where:** [roles](../grammar/roles.md#role-compounds), [predication § label scope](../grammar/predication.md#label-scope), `src/parse/`
- **Problem:** `zaxazawan`, `zaxamagon` (a doer of a person) and `zazawathal`, `zamagothal`, `zehodothal` (a scope on a name or pronoun) parse. A role compound names a role of an *event*, and a scope vowel covers a *label*; a name or pronoun is neither, and no page gives these readings. Every other root, including nouns used as stems (`zaxavol` *actor* from *theater*), stays allowed.
- **Suggested ruling:** reject a name or special pronoun as the stem of a role compound, and as the host of a scope seam, with a pointer to the owning section. A paraphrase or mention covers *so-called Azawan*.
- **Outcome:** fixed, narrowed — a special pronoun with **-n** is rejected as a role-compound stem (`roleCompoundStem`) and as a scope host (`labelScopeStem`). Its root on **-l** / **-m** is an ordinary word (`zamagothal` *a microphone, this time*) and stays allowed. A name is any root + **-n**, so names are not restricted: `zaxazawan` is a handle and `zazawathal` a scope on a root. D-34.

#### C-26 — ability vowel accepted outside `/v/` and `/ɡ/`, and on names in a clause · found in x-compounds and intention

- **Where:** [intention § ability](../grammar/intention.md#ability), [x-compounds § conversation length](../grammar/x-compounds.md#conversation-length), `src/parse/`
- **Problem:** the ability page teaches `x` + vowel on `/v/` and `/ɡ/` (and role-ability on `/ɡ/`). The parser also accepts it on `/z/` nouns, names and pronouns (`zodogaxal`, `zamagoxan`) and on `/h/`, with no reading. A name + `x` + vowel + **-n** inside a clause (`zalahen zazawaxon varahal.`) reads as ability on a name, though the same shape is a conversation-length bid only on a named citation or `/y/`.
- **Suggested ruling:** reject ability outside `/v/` and `/ɡ/`; reject name + `x` + vowel + **-n** except as a citation or under `/y/`, pointing to [conversation length](../grammar/x-compounds.md#conversation-length). State the limit once on intention.md and record in design-decisions.
- **Outcome:** fixed — ability is rejected outside `/v/` and `/ɡ/` (the hostless `eze` aside), and name + `x` + vowel + **-n** is rejected in a clause body (`abilitySlot`); it stays a conversation-length bid as a citation or a `/y/` call. Stated in intention § ability and x-compounds § conversation length. D-34.

### None (to add to unassigned-reserved, if the rows above are declined)

- A role compound on `/v/` `/h/` `/th/` and `/w/` (C-24, E-56); `/x/` is a topic word.
- A role pointer as a lateral's facing anchor (E-58).
- A role compound as the left piece of an ordinary compound (`zaxedehoxabodel`); *noun + agent* goes through E-54 instead.
- A role compound twice in one word (`zaxaxedehol`).
- Label scope or a role compound on a special pronoun with **-n** (C-25); ability on a noun, name or pronoun (C-26).

Confirmed **def** with nothing to add: left-hand pieces of an ordinary compound at every type; role compounds with **-l** / **-m** / **-n** / **-r** / **-x**; role compounds over lexicon compound stems; stacked role vowels (`ae` `ao` `oe` `ua` `uo` `ue`) on `/z/` `/d/` `/b/` and `/ɡ/`; viewpoint laterals with a special pronoun, name, content **-r** or content **-l** anchor; label scope on content roots at `/ɡ/` `/z/` `/d/` `/b/` `/v/` `/h/`; conversation length on a named citation and under `/y/`.

## Mood roots × role letters

Owning pages: [knowing](../grammar/knowing.md), [causation](../grammar/causation.md), [intention](../grammar/intention.md), [sakes § permission](../grammar/sakes.md#permission); the inventory is [lexicon-overlays.csv](../../data/lexicon-overlays.csv) (`pos` column = the role letters a row exists on). Wave 13. Cells checked with `node scripts/parse.mjs` (2026-10-03), one stem per kind on each of `/z/` `/d/` `/b/` `/v/` `/ɡ/` `/w/` `/h/` `/th/` `/x/` `/y/`. The overlay only fires on its listed slots. On any other role letter the same spelling is the **ordinary content word** of its root (`gedel` *forbidden*, `hezum` *surprisingly*), so a "none" cell below is not an unparsed cell: it already means the root's own sense, which is what a learner would guess. Closed relations (*like*, *between*, of-relations) × `/w/` `/th/` are wave 8; sake vowels and emotion compose are wave 14.

### Grid

Redone 2026-10-03. The first pass marked several `/w/` cells **none** and claimed `wezum` was taken by the *even* hook. Neither holds: `wezum al` is the ordinary root `ezu` (*amazement*) on `/w/` grading the hook `al`, and every `/w/` cell with no overlay row parses as its root's ordinary `/w/` word (checked below). Those cells are **gen**, and the rows ask only whether an overlay reading should replace that ordinary reading.

| Family | `/th/` | `/w/` (before a `/ɡ/`) | `/ɡ/` | `/h/` | `/z/` `/d/` `/b/` `/v/` `/x/` `/y/` |
|--------|--------|------------------------|-------|-------|-------------------------------------|
| Evidential channels (7), MAY, NOTIONAL | def | def (knowing § mood on one adjective) | gen (ordinary root) | gen | gen |
| RESIDUE, FORMER | def | def (prose only, no example → C-27) | gen | gen | gen |
| CAUSE `ege` | def | def (prose only, no example → C-27) | gen | gen | gen |
| ABIL `eze` | def | def | gen | gen | gen |
| PLAN, DECISION, ATTEMPT, WANT | def | gen (overlay rows dropped, E-61) | gen | gen | gen |
| Mirative `ezu` | def | gen: `wezum` *amazingly* → E-59 | gen | gen (`hezum`) | gen |
| Deontic (permit / forbid / require / consent) | def | gen: `wedem`, `wegom`, `wumem` → E-60 | gen | gen | gen |
| Phasal (4) | gen | def | gen | def | gen |
| Poles *if*, *iff*, *only if*, *because* | def | gen: `woyem` *opportunely* → E-62 | def | gen (`hoyem`) | gen |
| Poles *although*, *while*, *before*, *after*, *until / by*, *so that*, result | gen | gen | def | def | gen |
| As-of (2) | def | def | def | def | gen |
| SAME `ugo` | gen | gen | def | gen | gen |
| Stimulus `obu`, respectively `aze`, mention `ele` | gen | `aze` def | `obu` / `ele` def | gen | gen |

Parses (all in `zazawan W gubuhel vowogal.`): `wezum`, `wezul`, `wedem`, `wegol`, `wumel`, `woyem` read as **ordinary** content words; `wamam`, `wohum`, `wudum` read as the PLAN / WANT / ATTEMPT **overlay**; `wegem`, `wamom`, `wevom` read as CAUSE / RESIDUE / WITNESSED overlays.

### Rows

The question for each row is the same: on `/w/` before an adjective, should the spelling keep its **ordinary root** reading (which already parses) or take the **mood** reading (as the evidentials do)? The test is what a learner would guess, and what each reading lets them say that the other cannot.

#### E-59 — mirative on `/w/` (*surprisingly big*) · intuitive but redundant · P2

- **Today:** `zazawan wezum gubuhel vowogal.` already parses as *Azawan, surprisingly blue, walks*: `ezu` (*surprise* / *amazement*) on `/w/` grades the adjective. This is the same word as in `wezum al` (*even*), where it grades the hook instead. There is no collision: one word, graded host decides.
- **Proposed overlay reading:** the same spelling as the mirative mood, adding the firmness endings (`wezul` against a firm expectation, `wezur` against a loose one).
- **What the overlay would add:** only the firm / loose distinction. The ordinary word already says the property was unexpected, which is all English *surprisingly X* says.
- **Gap that is real:** no page teaches *surprisingly* + adjective. `find-english` (*surprisingly*, *unexpectedly*) finds only `thezum` (whole clause) and `hezum` (on the verb). *Surprisingly good*, *unexpectedly cheap* are common, so this is P2, not P3.
- **Recommendation:** **adopt as a docs gap; no overlay.** Add one `wezum` + adjective example to [knowing § mirative](../grammar/knowing.md#mirative) beside the existing **Compare with** on `wezum al`, and an [english.md](../grammar/english.md) row for *surprisingly / unexpectedly* + adjective. No parser or CSV change.
- **Outcome:** adopted as a docs gap — `wezum` + adjective taught in [knowing § mirative](../grammar/knowing.md#mirative) with a checkpoint item; recipe row in say-amounts § manner words. No new form, no parser change.

#### E-60 — deontic and consent words on `/w/` (*an allowed colour*, *a required course*) · intuitive but redundant · P3

- **Two English jobs:**
  1. *a forbidden book*, *required reading*, *a permitted move*: the **noun** is what the rule covers. This is the ordinary root on `/ɡ/` (`ede` *forbidden*, `ego` *permission*, `ume` *policy*, abstract **-m**). It is not a `/w/` cell at all.
  2. *a car in a forbidden colour*: only the **property** is under the rule. This is the `/w/` cell, and it is rare.
- **Today:** job 2 already parses with the ordinary roots: `wedem gubuhel` *forbiddenly blue*, `wegom gubuhel` *permissibly blue*, `wumem gubuhel` *blue per policy*.
- **What the overlay would add:** the source distinction in the endings (rule **-l** / person **-m** / custom **-r**), and for **-m** a `/b/` naming who allows, forbids or demands. `/w/` takes no `/b/` (only as-of does; see the wave 8 grid), so the person reading would lose its grantor, which is the main thing the deontic **-m** is for. A learner who knows `thedem bazawan` (*Azawan forbids it*) would try `wedem bazawan gubuhel` and hit a parse error.
- **Recommendation:** **decline the overlay; keep the ordinary reading.** Record in design-decisions. Optional docs gap: an english.md row for attributive *forbidden / permitted / required* → the ordinary root on `/ɡ/` (spelling and ending to be confirmed with `--check-lexicon` when applied).
- **Outcome:** declined — D-35. Recipe rows for attributive *forbidden* (`gedem`) and *permitted* (`gegom`) added to english.md.

#### E-61 — PLAN, DECISION, ATTEMPT, WANT on `/w/` · forced · P3

- **Today:** the CSV gives these four kinds `/w/` rows, so `wamam`, `wehum`, `wudum`, `wohum` parse as moods, but no page teaches them (C-27). The ruling is either to teach the overlay or to drop it, which turns these spellings back into ordinary words.
- **Proposed overlay reading:** the intention scoped to one property: `wudum geyayem` *trying to be careful*, `wohum gubuhel` *wanting to be blue*, `wamam gubuhel` *(the) planned blue*.
- **Why it is forced, not intuitive:**
  1. **Whose intention splits.** On `/th/` an intention mood belongs to the subject unless a `/b/` names someone else ([intention § whose](../grammar/intention.md#whose-intention)). Before an adjective there is a second candidate, the noun the adjective describes. In `zazawan dodogal wudum geyayem vahahal.`, is the dog trying to be careful, or is Azawan trying to make it so? Guesses split, so this needs a new rule. The evidentials never have this problem, because their holder is always the speaker.
  2. **No `/b/`.** `/w/` takes no `/b/`, so *someone else's* plan or want cannot be named, unlike on `/th/`.
  3. **The intention moods do not assert the event.** On `/th/` that is the point (*tries to walk* does not say they walk). On `/w/` it would make one adjective unasserted inside an asserted clause, which the evidential `/w/` uses never do.
- **What dropping it gives:** the ordinary readings are themselves guessable and useful: `wamam` *as planned* / *by design*, `wehum` *decidedly*, `wudum` *tentatively* / *experimentally*, `wohum` *wishfully*.
- **Existing routes:** *as planned* on a property is the bar `thamam zael` ([comparatives § bars](../grammar/comparatives.md#bars)); *experimental* is `gudum` (english.md); *tries to be careful* is `thudum` on a predicate clause.
- **Case for adopting instead:** uniformity. A learner taught "a `/th/` mood moves to `/w/` to cover one adjective" will try it on every mood. Declining makes PLAN, DECISION, ATTEMPT and WANT exceptions. That cost is small, because the spelling still parses with a nearby ordinary meaning, and the exception can be taught in one line ("moods about how you know or how it is"; not intentions).
- **Recommendation:** **decline; fix C-27 by dropping the twelve `/w/` CSV rows.** Record in design-decisions with the holder-split reason.
- **Outcome:** declined — D-35. The twelve `/w/` rows dropped from lexicon-overlays.csv, so the spellings read as ordinary words; knowing § mood on one adjective names which moods move to `/w/`.

#### E-62 — clause poles on `/w/` or `/h/` (*in case of*, *if only*) · none · P3

- **Why there is no slot:** a pole is not a mood. It links its clause to a condition in `/b/` (a noun or a dependent clause). `/w/` takes no `/b/`, so a pole on `/w/` has nothing to link to. `/h/` is already where the time, place and purpose poles live, and *if* is not one of those.
- **Today:** `woyem` and `hoyem` parse as the ordinary root `oye` (*door* / *opportunity*): *opportunely*.
- **Both English jobs are already covered:**
  - *in case of rain* → `thoyem berehel` (the pole with a noun in `/b/`, as in `tholum berehel` *only if there is rain*).
  - *if only …* is a wish against the facts, not a condition → WANT on the clause (`thohum`). `find-english` (*if only*) finds only the condition poles, so this is a recipe-track gap, not a missing form.
- **Recommendation:** **decline; nothing to reserve** (the cells are **gen**). Log *if only* → `thohum` as a recipe-track row for [english.md](../grammar/english.md).
- **Outcome:** declined — D-35; nothing reserved. Recipe row *if only* / *I wish* → `thohum bamagon` added to say-tense § will, want, try.

### Inconsistencies (wave 13)

#### C-27 — `/w/` accepted on PLAN, DECISION, ATTEMPT, WANT with no page · found in intention

- **Where:** [intention](../grammar/intention.md), [knowing § mood on one adjective](../grammar/knowing.md#mood-on-adjective), [lexicon-overlays.csv](../../data/lexicon-overlays.csv), `src/parse/`
- **Problem:** the CSV gives these four kinds a `/w/` row, so `wamam`, `wehum`, `wudum` and `wohum` parse as moods, and their anchors point at intention sections that teach only `/th/`. Knowing's `/w/` list names *could be*, channel, residue / former and as-if only. Causation has a prose `/w/` line for CAUSE and knowing a prose line for RESIDUE / FORMER, but neither has an example.
- **Suggested ruling:** follows E-61. If declined: drop the twelve `/w/` rows so the spellings read as ordinary words, and add one sentence to knowing § mood on one adjective naming which moods move to `/w/`. If adopted: teach the `/w/` forms on intention with the holder rule. Either way, add one worked `/w/` example each for RESIDUE and CAUSE.
- **Outcome:** fixed — the four kinds' `/w/` rows dropped (E-61); knowing § mood on one adjective lists the moods that move to `/w/`; worked `/w/` examples added for RESIDUE (knowing § mood on one adjective) and CAUSE (causation § CAUSE).

### None (to add to unassigned-reserved)

Nothing. Every `/w/` and `/h/` cell in this grid either has an overlay reading or reads as its root's ordinary word. The declined overlay readings go to design-decisions, not unassigned-reserved.

Confirmed **def** or **gen** with nothing to add: every stance on `/th/`; evidentials, MAY, NOTIONAL, RESIDUE, FORMER, CAUSE, ABIL and phasals on `/w/`; poles on `/ɡ/` (and `/h/` for the time, place and purpose poles); as-of on all four slots; every mood root on `/z/` `/d/` `/b/` `/v/` `/x/` `/y/` as its ordinary word (`/x/` a topic word, `/y/` + **-n** a title).

## Sakes

Owning page: [sakes](../grammar/sakes.md); the stimulus and bar uses are also taught in [comparatives § bars](../grammar/comparatives.md#bars), and feeling recipes in say-reasons. Wave 14. Cells checked with `node scripts/parse.mjs` (2026-10-03), on the nine sake roots (mostly `ana`, `ulo`, `ozo`). Permission, requirement and consent are mood roots (wave 13); `uem` before a stance is a hook (wave 5); stacked vowels after the sake **th** are settled as none (D-23).

### Grid

Sake vowel × host, then ending and `/b/`, then the emotion tail.

| Cell | State |
|------|-------|
| **`tha`** / **`thu`** on `/ɡ/`, `gl-`, `/th/`, and `/w/` before `gobum` | def |
| **`tho`** on `/th/` (motive), `/ɡ/` (the noun's purpose), `/w/` before `gobum` | def (the attachment table's "same stances" on `gobum`) |
| **`the`** on `/th/` | def |
| **`the`** on `/ɡ/`, `gl-`, `/w/` before `gobum` (`ganathel`, `glanathel zebel`, `wanathel gobum`) | parses, no page → E-64, C-28 |
| Any sake word on `/z/` `/d/` `/b/` `/v/` `/h/` `/x/` `/y/` (`zanathal`, `hanathal`, `yanathal`) | rejected (`sakeSlot`); none |
| Sake word on `/w/` before a `/ɡ/` other than `gobum` (`wozotham gahadul`) | parses, no page → E-65 |
| **-l** / **-m** / **-r** on each stance vowel | def (four tables) |
| **-n** on a sake word (`ganathan`, `thanathon`) | parses as a sake word; the page calls it "ordinary proper" → C-29 |
| **-x** on a sake word (`ganathalx`) | gen ([plurality](../grammar/plurality.md); `gubuhelx` parses the same way) |
| `/b/` after a tail-less **`tha`** / **`thu`** on `/th/` | def (whose stake: thanks and sorry) |
| `/b/` after a sake bar | def (whose stake) |
| `/b/` after a tail-less **`tho`** / **`the`** on `/th/`, or a tail-less sake word on `/ɡ/` / `/w/` + `gobum` (`thanathom balahen`, `ganathal balahen`) | parses (hosted); gen by the D-rule "after a tail-less sake word, `/b/` names whose stake", but untaught → E-63 |
| Tail (10 loci × **-l** / **-m** / **-r**) on **`tha`** / **`tho`** / **`thu`**, on `/ɡ/`, `/w/` + `gobum`, `/th/` | def (motive tail only on the recipe track: `wadothomom gobum` → C-30) |
| Tail on **`the`** (`ganathemar`) | rejected (`emotionTail`); def none |
| Tail motion **-n** (`ganathaman`); stacked loci beyond the six standard pairs (`…amoar`) | rejected; none |
| Tail after a sake **-n** (`ganathanar`, `gulothanar`) | reads as a viewpoint lateral → C-29 |
| `/b/` after a direction or CIRCUM locus | def (landmark) |
| `/b/` after an INTERNAL or UNPLACED locus (`wanathumal gobum balahen`) | parses; the page says these take no `/b/` → C-30 |
| Sake bar with **`thu`** / **`tho`** / **`the`**, or with a tail (`thegathum zel`, `thegathamar zael`) | rejected (`bar`); by design (D-rule on bars) |
| Sake word after `uem` | rejected; by design |
| Sake word with a holder seam | by design (sakes never host a holder) |

### Rows

#### E-63 — whose stake on motive, prescription and `/ɡ/` sake words (*for Alahen's sake*, *my gift is good for Alahen*) · intuitive · P2

- **Today:** `zazawan vezebel thanathom balahen.`, `zalahen vabayal thanathem bazawan.` and `zebel ganathal balahen.` already parse, with `/b/` hosted on the sake word. design-decisions already states the rule generally ("after a tail-less sake word, `/b/` names whose stake"), but sakes.md teaches it only for thanks and sorry (`thanathum behodon`) and for sake bars. unassigned-reserved still lists *whose-sake on prescription* as a later dimension.
- **Proposed reading:** the stated rule, taught on every tail-less sake word. `thanathom balahen` *tells for Alahen's sake (Alahen's relatedness)*; `thanathem bazawan` *ought to bow, for Azawan's relatedness*; `ganathal balahen` *my gift serves Alahen's relatedness in the long term*; `wanathul gobum balahen` *the gathering detracts from Alahen's relatedness*.
- **Current route:** the *for* hook (`el balahen`, as in say-people-places *for a family's sake*) names the beneficiary but not which need. A sake word plus `el balahen` leaves open whose sake it is.
- **Better than current route:** yes. *For her sake*, *good for him*, *for your own good* are everyday English, and the stake is exactly what a sake word is about.
- **Conflicts and notes:** on `/ɡ/` a learner could guess the `/b/` is the **owner** (*Alahen's gift*). Possession stays the speaker's; someone else's thing still uses `gegabem` + `/b/` or `gobum`. The page should say this in one line. With a tail, a `/b/` stays the direction landmark, so a feeling cannot also name whose stake (that is ON-BEHALF, or a holder).
- **Closes:** *for Alahen's sake*, *good for Alahen*, *for your own good* (`find-english`: *for her sake*, *for the sake of*, *good for*; only `tho` without a person and the *for* hook).
- **Recommendation:** adopt as a docs gap. One line plus one example each in sakes § attachment sites (motive, prescription, `/ɡ/`); remove *whose-sake on prescription* from unassigned-reserved; english.md row *for X's sake* / *good for X*. No parser change.
- **Outcome:** adopted as a docs gap — new [sakes § whose stake](../grammar/sakes.md#whose-stake) (motive, prescription, `/ɡ/`, `/w/` + `gobum`; `/b/` is never the owner); english.md *for* row; reserved line removed; D-rule in design-decisions widened; checkpoint items added. No parser change.

#### E-64 — prescription `the` on a noun (`ganathel`, `wanathel gobum`) · forced · P3

- **Today:** parses on `/ɡ/`, `gl-` and `/w/` before `gobum`, with no page. The tail rule already excludes **`the`** ("advice, not a feeling").
- **Proposed reading:** *my gift ought to go toward relatedness* (advice about what to use the noun for).
- **Why it is forced:** the **`the`** endings are the warrant for a **move** (invited / offered / trial), and a noun is not a move. A learner who knows `g…tho…` (the noun's purpose) would as easily read `ganathel` as *my gift is for relatedness*. English *you should use it for …* is a command plus that purpose, or `the` on a clause with a use verb.
- **Recommendation:** decline; reject **`the`** off `/th/` (C-28); record in design-decisions.
- **Outcome:** declined — D-36; rejected by C-28.

#### E-65 — sake word on `/w/` before any adjective (*pleasantly hot*, *usefully short*, *annoyingly loud*) · intuitive · P2

- **Today:** `zedehel wozotham gahadul.` parses, with no page. sakes.md says only that `/w/` before a **sake** `/ɡ/` grades it and that `/w/` right before `gobum` is the sake.
- **Proposed reading:** a sake word on `/w/` says how **that property** stands toward the sake: `zedehel wozotham gahadul.` *The tea is pleasantly hot* (its heat serves pleasure). With a tail it is a feeling about the property: `zezebel wanathumor galadul.` *The speech is irritatingly loud* (relatedness unmet, aimed, surging). `gobum` becomes the special case where the property is *being the stimulus*, so the noun as a whole.
- **Pattern:** wave 13 taught "a mood on `/w/` before an adjective covers that one property" (knowing § mood on one adjective); this is the same move for a sake.
- **Current route:** a few ordinary roots on `/w/` (`wegevom` *pleasantly*, `wogozom` *dangerously*); otherwise two words where the stimulus is the whole noun (`gahadul` + `wozotham gobum`), which loses that it is the **heat** that pleases.
- **Better than current route:** yes, for the open class *comfortably warm*, *usefully short*, *frustratingly slow*, *painfully bright*, where English packs a payoff or a feeling onto one property. It also names the need and the horizon, which the ordinary roots cannot.
- **Conflicts and notes:** stake is the speaker's by default, as with `gobum`; there is no slot for a `/b/` stake (a `/b/` after the adjective belongs to the adjective). A degree word still goes before the sake word (`wamazam wozotham gahadul`) and grades the feeling, as before `gobum`. `/w/` sake before a `/ɡ/` sake (`wulothal gulothal`) falls under the same rule and needs no special case.
- **Closes:** *pleasantly warm*, *usefully short*, *annoyingly loud*, *comfortably* (`find-english`: *pleasantly*, *usefully*, *comfortably*, *dangerously*; hits only `egevo`, `ogozo` roots and `gulotham` on a noun).
- **Recommendation:** adopt. Teach in sakes § personal possession (beside `gobum`) and § emotion compose with one example each; english.md rows; checkpoint item. The parser already accepts it and glosses it correctly.
- **Outcome:** adopted — taught in sakes § personal possession (`wozotham gahadul`) with an attachment-table row, and a tailed example in emotion compose (`wulothumuer gezehom` *frustratingly slow*); recipe row in say-amounts § manner words; beginner checkpoint item. No parser change.

### Inconsistencies (wave 14)

#### C-28 — prescription `the` accepted on `/ɡ/`, `gl-` and `/w/` + `gobum` · found in sakes

- **Where:** [sakes § prescription](../grammar/sakes.md#sake-force), [sakes § attachment sites](../grammar/sakes.md#attachment-sites), `src/parse/enforce.ts` (`sakeSlot`)
- **Problem:** the page teaches **`the`** only on `/th/` (*ought this act*), and its attachment table has no `/ɡ/` or `/w/` row for it. The parser accepts `ganathel`, `glanathel zebel` and `wanathel gobum`.
- **Suggested ruling:** follows E-64. If declined, reject **`the`** outside `/th/` with a pointer to prescription, and state it in the attachment table.
- **Outcome:** fixed — `prescriptionSlot` rejects **`the`** off `/th/`; sakes § attachment sites states it. D-36.

#### C-29 — **-n** on a sake word: "ordinary proper" on the page, a sake word in the parser, and a lateral with a tail · found in sakes

- **Where:** [sakes § word shape](../grammar/sakes.md#word-shape), [sakes § motive](../grammar/sakes.md#sake-preference), [x-compounds](../grammar/x-compounds.md) (*after a sake root, letters that look like a root are always the emotion tail*), `src/parse/classify.ts`
- **Problem:** two pages say **-n** on a sake word is "ordinary proper", but no name can have this shape (`zanathan` is rejected by `sakeSlot`), and the parser reads `ganathan` / `thanathon` as a sake word with an **-n** horizon that no table defines. Add a tail and `ganathanar`, `gulothanar` and `thanathanar` parse as viewpoint laterals, which x-compounds says never happens after a sake root. Same shape as C-03 (named moods).
- **Suggested ruling:** reject **-n** on a sake word (with or without a tail), pointing at the ending tables; drop the two "**-n** is ordinary proper" lines. No reading is lost: there is no proper sense to give.
- **Outcome:** fixed — `sakeEnding` rejects **-n** on a sake word and the **-n** + tail shape that read as a lateral (a tail motion **-n** stays `emotionTail`); sakes § word shape and § motive now say sake words end in **-l** / **-m** / **-r**. D-36.

#### C-30 — the emotion tail: `/b/` after a placement locus, and no motive example · found in emotion compose

- **Where:** [sakes § emotion compose](../grammar/sakes.md#emotion-compose), `src/parse/`
- **Problem:** (1) the page says INTERNAL and UNPLACED take no `/b/`, but `wanathumal gobum balahen` and `wanathumuor gobum balahen` parse. (2) The page says the tail goes on **`tho`**, but every example uses **`tha`** or **`thu`**; the only motive tail is on the recipe track (`wadothomom gobum` *curious about*).
- **Suggested ruling:** reject a `/b/` after an INTERNAL or UNPLACED locus, with a pointer (the stake of a feeling goes through ON-BEHALF or a holder). Add one **`tho`** tail to the emotion-compose table (*curious about*, *eager to*).
- **Outcome:** fixed — `feelingLandmark` rejects it on `/ɡ/`, `/w/` + `gobum` and `/th/`. The **`tho`** tail example (`wadothomom gobum` *curious about*) went into sakes § motive rather than the emotion-compose table, which comes before motive is taught. D-36.

### None (added to unassigned-reserved)

- A sake word on `/z/` `/d/` `/b/` `/v/` `/h/` `/x/` `/y/` (rejected today). `/h/` (*walks healthily*) is the clause stance's job: `thoyutham` already says the walking serves the physical sake.
- Prescription **`the`** off `/th/` (E-64, C-28); **-n** on a sake word (C-29).
- A tail on **`the`**; motion **-n**; stacked loci beyond the six standard pairs; any bar but a tail-less met sake (already rejected).

Confirmed **def** with nothing to add: **`tha`** / **`thu`** / **`tho`** on `/ɡ/`, `gl-`, `/th/` and `/w/` + `gobum`; **`the`** on `/th/`; every ending table; the ten loci × three motions on `/ɡ/`, `/w/` + `gobum` and `/th/`; `/b/` as landmark after a direction or CIRCUM locus; whose-stake `/b/` on thanks, sorry and bars.

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

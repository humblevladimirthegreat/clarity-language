# Extension sweep results

Editors only — not linked from grammar pages. Findings from Phase 3 of the expressiveness review (`docs/proposals/expressiveness-review.md`): every productive mechanism crossed with every place it could apply, and each empty cell judged. Rows are logged per batch, ruled by the language owner, and applied before the next batch starts; each row's **Outcome** records the ruling.

Progress: batch 1 (word endings pilot) ruled and applied. Wave 0 batch 2 (role-letter structure) ruled and applied. Wave 1 (vowel series, tone marks) ruled and applied. Wave 2 (pronouns, plurality) ruled and applied. Wave 3 (numbers) ruled and applied. Wave 4 (joins and restrictors): ruled and applied (E-29, E-30 adopted; E-31, E-32 declined; C-12 fixed; C-13 deferred to Wave 9). Wave 5 (hooks): logged (E-33 to E-35, C-14), ruled and applied (E-33 to E-35 declined, C-14 fixed). Wave 6 (spans): logged (E-36 to E-38, C-15, C-16), ruled and applied (E-36 adopted as a docs gap, E-37 and E-38 adopted (reversed from decline), C-15 and C-16 fixed). Other mechanisms not started.

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
- **Outcome:** known and deferred. No good reading exists for the missing stacked **-r** forms; the parser keeps accepting them for now. Revisit in Wave 9 (questions) in case a fill-ask wants one.

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

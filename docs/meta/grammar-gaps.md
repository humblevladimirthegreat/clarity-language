# Grammar gaps and extensions ledger

Editors only — not linked from grammar pages. Findings ledger for the expressiveness review (plan: `docs/proposals/expressiveness-review.md`). Lists English jobs Agazan handles awkwardly or not at all (**gaps**, `G-nn`) and unused forms with an intuitive reading (**extensions**, `E-nn`). Unused **forms** live in [unassigned-reserved](unassigned-reserved.md); this page tracks **jobs**.

Grammar pages teach only settled readings. Do not drill open rows as if taught ([drill-generation](drill-generation.md)).

## Fields

| Field | Content |
|-------|---------|
| ID | `G-nn` (gap), `E-nn` (extension), `D-nn` (by design) |
| English job / source form | e.g. *reflexive "herself"*; or `th+N` on `/h/` |
| Current route | Best existing Agazan expression, with example, or *none* |
| Verdict | **covered** · **awkward** · **missing** · **by design** · **extension candidate** |
| Owning page | the `docs/grammar/` page that would own it; an application-only resolution (no new form) goes on a `say-*.md` [recipe track](grammar-docs.md#recipe-track) page, not a stage |
| Proposal | one-line suggestion, or `docs/proposals/<file>.md` |
| Priority | **P1** common everyday English · **P2** common in writing · **P3** niche (awkward / missing only) |

## By design

Deliberate omissions. An English job that only these forms would serve is **covered** if the meaning has a natural route; do not re-log it as a gap.

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| D-01 | copula *to be* as a verb | property on `/ɡ/`, kind on predicative `/ɡ/` (`yal zazawan godogal`), identity **`SAME`** | by design | predication.md | — | — |
| D-02 | grammatical past / future tense, progressive aspect | time via `/h/` lexicon, clock / date, closed moods; **RESIDUE** / **FORMER** are standing, not tense ([knowing](../grammar/knowing.md#evidentiality): verbs have no past or future letter) | by design | knowing.md, glosses.md | — | — |
| D-03 | article *the* for an already-mentioned kind | resume **-r** | by design | pronouns.md | — | — |
| D-04 | single *cause* arrow word (*X causes Y*) | two-place poles **`odo`** / **`ebo`** / **`era`** / **`ewu`**; **CAUSE** mood | by design | causation.md | — | — |
| D-05 | metric prefixes (*kilo-*, *milli-*) and unit abbreviations | scaled amount on the base unit | by design | numbers-applied.md | — | — |
| D-06 | generic plural / *every K* via plural marking | universals joins (`zual gagadal`), habitual **`hual`**; **-x** is associative | by design | plurality.md, joins.md | — | — |
| D-07 | written capitals for names | named **-n** / **`@`**; native text is unicase | by design | phonology.md, word-endings.md | — | — |
| D-08 | sentence-final `?` / `!` carrying force | act word carries force; tone marks are prosody only; sentences end in `.` | by design | speech-moves.md | — | — |
| D-09 | *attacker*-style agent-noun lexicon | role compounds **`a` / `e` / `u` / `o` x ROOT** | by design | roles.md | — | — |
| D-10 | neutral past / *earlier* / bare *now* word | signed offset on a channel ([knowing#dated-channel](../grammar/knowing.md#dated-channel)): `thunom bagazem g-3`; forecast (channel + `b+`) / PLAN `+`; *just* / *about to* = `b-e-` / `b+e-` | by design | knowing.md | Every offset from now sits on an evidential or forecast (channel + `b+`) / PLAN; wrong sign on a one-way channel is not a sentence. Absolute dates stay channel-free | — |
| D-11 | single-item clause join (`A xul` *not the case that A*, `A xal` *only A happened*) | clause `/x/` joins go between clauses only; deny / focus on the verb or noun (`vowogal vul`, `zazawan zal`); stand-in items (`A xol xal` *optionally A*, `A xam xar`, `A xel xur`, `xual ul A`) — [joins#clause-joins](../grammar/joins.md#clause-joins) | by design | joins.md | — | — |

### Settled decisions from the dated-channel review

- The offset after a channel dates the **event**, not when the speaker learned of it.
- A hosted `/b/` after an evidential is read by its filler: a time measure = offset; a person or other noun = source (*per Alahen*, not yet taught).
- `g-e-` means *just short* (was *imaginary*); *as if* stays on NOTIONAL `ove`.

### Settled decisions carried from the consistency audit

The consistency audit (removed after wave 6) settled these; do not re-raise them as gaps:

- Hosted `/b/` right after any `/ɡ/`, `/h/`, or `/th/` word is structural; a recipient there is a speaker error.
- `r` + vowel overlap in numbers is accepted.
- Word edges before vowel-initial words are not fixed.
- Hook compounds have no mid-word coda.
- Sentences end in `.`, never `?` or `!`.
- Short resumes are preferred when unambiguous.
- `/ɡ/` + **-r** on a noun means *of that kind*.
- `/v/` + **-r** on a noun means *do the same action again, now involving that entity*.

## Free-slot snapshot

Phase 3 starts from [unassigned-reserved](unassigned-reserved.md) as of commit `48a682c` (2026-09-25). Sections: numbers free forms, numeric derivation, restrictors, stance joins, role compounds, identity (`SAME`), spans, values later dimensions, phonology.

## Phase 1 — English coverage checklist

Completed 2026-09-25: 294 rows across groups A–J (160 covered, 80 awkward, 49 missing, 2 by design, 1 extension candidate). Parser / docs mismatches found along the way are handed off in [build-investigate](build-investigate.md).

### Cross-group P1 themes (input to Phase 4)

- **Deixis:** done 2026-09-26: *here / there / this / that / come / go* = place hook + speaker / listener / interlocutors ([hooks#deixis](../grammar/hooks.md#deixis)); *now / today* = zero channel offset ([knowing#now](../grammar/knowing.md#now)); day / week / month / year units published. Done 2026-09-27: generic *go / move* `vuvudel` (👣 `uvude`) and *carry* `valagal` (🧳 `alaga`); *bring / take* = carry + `oel` / `ul` (G-I16).
- **Question words:** done 2026-09-26: *why / how* (G-A09, G-A11). Done 2026-09-27: *how big / how fast* = `w=+` before the adjective / adverb (G-A10).
- **Aspect adverbs:** *just / already / still / not yet / anymore / about to* (G-B).
- **Permission:** done 2026-09-26: permission `thegam` / `thegal`, consent `thuxegam` / `thuxegar` (sakes.md).
- **Expressive / commissive acts:** *thanks / sorry / promise* (G-H); values on `/y/` (`yonatham`) parse.
- **Quantity words:** done 2026-09-26: *a few* `g~+`, mass *some* `g+`, *many / few / enough / too* = amount scale `g+` against a named bar (judgment or sake bar), *most* `g+50% guel`, *half* `g-2`, *at most* `eo` ray, *more X than Y*. Done: *how many / how big* (G-A10, G-A12).
- **Degree and focus:** done 2026-09-27: *quite* `wadeham`, *barely* `h+e-` / `w+e-` (effort `h~+e-` / `h~-e-`), *almost* on adjectives `w-e-`, *even* `wazebam al`, *too* = verb resume. Promise (G-H12) = self-consent **-l**.
- **Existentials:** done 2026-09-26: *there is* = lone noun ([predication#existence](../grammar/predication.md#existence)). Done 2026-09-28: *there is no* = verbless `zul godogal` (G-F07); *all the cats here* (G-C13); *the same X* = hostless `gogal` (G-G13).
- **Subordinators:** done 2026-09-26: *unless* (G-E09), reported wh-questions (G-E32), asking tag (G-A18). Done 2026-09-27: temporal *since* = `ul` *from* on a time (G-E15, G-J13).
- **Discourse / attitude:** done 2026-09-27: *hopefully / luckily / sadly* = content root on `/th/` (G-D23, G-D25); *oh* = polar **-r** `yaer` (G-H15); *anyway* = resume hook `or` (G-H20); polar `ua` now rejects the question's premise, strength via `!!`.
- **Others:** Done 2026-09-27: social *'s* (G-C28), one-clause causative *make* (G-B32), *behind / in front of* (G-J05). Done 2026-09-26: *under / above* (G-J03–04), pro-form *one* (G-F16). Done 2026-09-27: reciprocal *each other* `hewum` (G-B39).

### A. Clause types

No open rows.

**Notes**

- Parser rejects the questions.md#confirming-a-negative examples `yol zazawan vul varahal.` and `yael vul varahal.`-style pre-verb `vul` ("Illegal left fence: join before conjuncts"); `yel vul vowogal.` fails too. Post-verb `varahal vul` parses. Either the page or the parser is out of step (the build apparently does not catch it).
- Digitless number **-r** written `g+r` parses and glosses as "more-than-one" rather than resume; docs say resume is written `g=+`.
- Bare `yol.` / `yol yael.` as a whole turn parse but have no documented reading.
- `/y/` + content root (`yelaval`) parses as an interjection with no documented reading on **-l** (docs use **-n** for conventional calls).
- `yol zazawan vowogal war.` fails to parse although `/w/` occasion restrictors are documented alongside `har`.

### B. Verb phrase

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| G-B01 | grammatical tense (past / present / future marking on the verb) | No tense letter, stated as a design choice: "Verbs have **no past or future letter**" ([knowing#evidentiality](../grammar/knowing.md#evidentiality)); "Neither word is a past tense" ([why-agazan](../grammar/why-agazan.md)); morph glosses never carry tense ([glosses](glosses.md), line ~270). Time comes from channel, *before* / *after*, clock, forecast (channel + `b+`) | by design | knowing.md | Add to the By design table as D-nn so it is not raised again | — |
| G-B03 | past with no evidential claim (plain narration: *Yesterday Azawan walked*, told with no source) | channel or date: `thunom` / `themam` / `thazom` (*per the tale*, for narration), or a clock / date | by design | knowing.md | Neutral past is deliberately absent (see D-10). No *earlier* adverb and no bare *before now*: *before* / *after* always name a landmark | — |
| G-B05 | experiential perfect *has ever done / has never done* | `har` *sometimes* / bare `hal` *never* are restrictor habits, not "at least once in a lifetime" ([restrictors](../grammar/restrictors.md)) | awkward | restrictors.md | Add a documented reading: `har` + WITNESSED = *has at some point*; show *never has* with `hal` | P2 |
| G-B15 | *begin / stop / finish* doing (phase verbs) | Content roots only: `vazadal` *stop* + object `dowogam` (`zazawan vazadal dowogam.` parses); `eveha` *terminus*; nothing for *start*. Using an action noun as the object is not taught | awkward | clause.md | Teach event-noun objects for phase verbs and give *start* a root | P2 |
| G-B16 | *again* / repeat | `/v/` + **-r** on a noun (settled: *do the same action again*); content `vegezol` *repeat* as a co-verb (`zazawan vegezol vowogal.` parses, not taught) | awkward | pronouns.md | Teach *again* as an `/h/` on `erebe` (`hegezom`) with the verb | P2 |
| G-B21 | *must* (obligation) | Firm command `yel`, or need-linked prescription `…thel`/`…them`/`…ther` ([values#sake-force](../grammar/sakes.md#sake-force)). By design, a bare *must* without a named sake is avoided ([why-agazan](../grammar/why-agazan.md)) | by design | sakes.md | — | — |

**Notes**

- Parser: all 27 test sentences parsed, including forms the docs do not teach: subjectless `dazawan vahahal.`, same-clause reflexive `zazawan vahahal dazar.`, and `zazawan vazadal dowogam.`. The parser accepts more than the pages teach, so these count as awkward or missing, not covered.
- No tense by design: yes, it is stated. knowing.md#evidentiality says "Verbs have **no past or future letter**". knowing.md#residue says the RESIDUE / FORMER moods "do **not** locate time", and so does why-agazan.md ("Neither word is a past tense"). glosses.md (~line 270) says Agazan "does not mark English tense or progressive aspect". It is **not** in the ledger's By design table. Add it (G-B01).
- Aspect particles (*just / already / still / yet / anymore*) form the biggest gap cluster. RESIDUE and FORMER each cover only part of the ground. A single small aspect/expectation adverb series on the add / one / order / undo vowel pattern could fill most of G-B09 to G-B14.
- Permission (G-B20, G-B33) filled 2026-09-26 in sakes.md#permission / #consent.
- Parser speed: each `npm run parse` took about 25 s under load. The two runs that printed nothing were killed jobs (exit 144), not parse failures.

### C. Noun phrase

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| G-C02 | *the* for an already-mentioned referent | resume **-r**: `zodogal vowogal. zodor vehahel.` — [pronouns#resume-r](pronouns.md#resume-r) | by design (D-03) | pronouns.md | — | — |
| G-C29 | double genitive (*a friend of Azawan's*) | depends on G-C28; for things `dubugal gegabem bazawan` (*a book of Azawan's*) = same as *'s*, fine | awkward | relations.md | Resolved by G-C28 | P2 |
| G-C30 | stacked possessives (*Azawan's dog's owner*) | chained hosts parse (`zodogal gegabem bazawan gegabem balahen`) but attachment of the second `gegabem` is not taught | awkward | joins.md / relations.md | Teach chaining order of stacked of-relations | P3 |
| G-C32 | partitive portion of a mass (*a piece of bread*, *a slice*, *a bit of*) | none; `gabom` = constitutive part, not an arbitrary portion; measure phrases need a unit | missing | relations.md | Portion *of* relation (piece severed from a whole) beside `gabom` | P2 |
| G-C38 | generic reference (*Cats sit. / A cat is an animal.*) | `zual gagadal` (strict) / `zuam gagadal` (soft) — [joins#universals-domains-generics](joins.md#universals-domains-generics); habitual `hual` | by design (D-06) | joins.md | — | — |

**Notes**

- Approximate numbers write the `~` in the second slot (`g~+3`); `g+3~` fails the parser, matching numbers.md. Worth a drill on this since English speakers will write `~` last.
- `zual gagadal zul` is rejected as an illegal left fence, and no page shows how to say *no K*, even though *every K* (`zual gagadal`) is taught. This is the biggest gap in the quantifier area.
- `zual gagadalx` (every + SHARED `/ɡ/`…**-x**) parses, but its reading isn't defined. plurality.md defines `/ɡ/`…**-x** after **`a`** as collective, but nothing covers it after **`ua`**.
- Quantity vocabulary (*few, several, many, most, enough, too many*) has no teaching home. numbers.md gives magnitudes (bands, ∞, arbitrarily small), which are too hyperbolic or technical for everyday *many* / *few*.
- Ownership `gegabem` is only defined in passing inside joins.md (SHARED after the join), and relations.md points there. Kinship and social *'s* (*Azawan's sister*) have no route.
- Deixis gap: *this / that* is anaphoric only, via **-r**. Proximal vs distal pointing is absent, and this likely overlaps group I (*here / there*, *this / that*).

### D. Modification

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| G-D12 | *so ADJ that …* (degree + result) | `welavam` + next-sentence linker (*therefore* `xezadam`, [dependents](dependents.md#continue-x)) — two sentences, degree-result link lost | awkward | dependents.md | Teach the two-sentence route explicitly, or a `/w/` *to-that-degree* word pointing at the next sentence | P2 |
| G-D16 | correlative *the more …, the more …* | none; you could chain two sentences with *because*, but the covariation is lost | missing | comparatives.md | Rank join `e` on `/x/` linking two scale claims (a *co-rank* reading) | P2 |
| G-D20 | *just* = *merely* (*it's just a cat*) | `zal` single item gives *only*, but not the "no more than / small" judgment | awkward | joins.md | Teach `zal` + `wamazam`, or say that `zal` covers both | P3 |

**Notes**

- The parser accepts any content root under `/th/` (`thevegem`) and `/w/` (`wamazam`), and number `w~-e` / `h~-e`, but the docs teach none of these readings. So the fixes for G-D05/08/23 are mostly teaching, not new forms.
- Only *very* (`welavam`, `m.w:very` on *elephant*) has a published `/w/` role English. There are no lexicon hits for *slightly, almost, barely, enough, quite, also, frankly*.
- In comparatives.md#degree, the heading says *much / slightly* but only *much* (`wohahal`) gets a form.
- The scratchpad `out.txt` / `s.txt` are shared, and other agents overwrote them mid-run. My parse checks used `D-sents.txt`. Every tested sentence parsed. The last two (manner scale, MAY) are taken directly from the docs.

### E. Clause combining

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| G-E16 | *once* / *as soon as* | `hulam barl …` (*after*); immediacy unmarked | awkward | dependents.md | Immediate-after: `/w/` detail on `hulam` (e.g. haste root `wadehom hulam barl`) or teach `hulam` + `hal` | P2 |
| G-E23 | *when* relative (*the day when …*) | two sentences + time `/h/`; no pattern taught for resuming a time | awkward | dependents.md | Teach resume on a time noun in `/h/` (or `har`-style restrictor) as the *when*-relative pair | P3 |
| G-E34 | result *so … that* / *such … that* (*so tired that he slept*) | two sentences + `xezadam` (*therefore*): `zazawan vowogal. xezadam zalahen vehahel.`; degree→result link not expressible in one clause | awkward | dependents.md | Result pole on `/h/` from the *therefore* root: `hezadam barl` (outcome follows; parses, unassigned) | P2 |
| G-E37 | hypothetical / remote conditional (*If Alahen slept, Azawan would walk*) | open `thodom barl` + optional stance inside dependent (`zalahen th- vezebal`, unlikely) or forecast (channel + `b+`) `thevem b+`; remoteness not taught as a pattern | awkward | causation.md | Teach `th-` / `th+N` inside the `barl` clause as the "remote" conditional | P3 |
| G-E38 | counterfactual (*If Alahen had left, the door would still be locked*) | bookmark `humem barl` + RESIDUE + forecast (`zodol galagel thamom thevem b+ humem barl zalahen vadebal`) ([causation#factivity](../grammar/say-reasons.md#factivity)); contrary-to-fact itself unmarked | awkward | causation.md | Mark the unreal condition with imaginary `th-e-` inside the dependent (`thodom barl zalahen th-e- vadebal`, parses) — reuse of *as if* | P2 |

**Notes**

- Parser is permissive about hosted pole overlays: unassigned `hezadam barl` and `thazem barl`, and the two-pole stack `hazem thodom barl`, all parse. Good for proposals, but the build check will not catch misuse of un-inventoried pole forms.
- `thodom burl` parses although [dependents#stand-in](../grammar/dependents.md#stand-in) says `hagom burl` is "the one exception" to `barl` after a pole — the parser does not enforce that restriction.
- `xazel` placed mid-sentence as a clause join (`zazawan vowogal xazel zalahen varahal`) parses, though docs teach linkers only after a period; a trailing linker (`… barl zalahen vezebal xazel.`) fails.
- Causation.md (factivity) says *if he had* is `humem` with **no** `thodom`, while a counterfactual is still a condition; learners get no marker that the condition is false, only a moved "now".
- Restrictors page line ~325 says *when* + clause is "`/h/` pole + `barl`" but names no *when* pole; `hehum` is taught only as *while* (same time).
- `zar` standalone parses as a declarative subject (*someone walks*); no doc says whether `-r` blanks outside `yol` mean *someone* vs *whoever*.

### F. Information structure

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| G-F12 | bare *me too* (no verb) | `zamun zam.` parses but is untaught; taught route needs the verb resume (G-F11) | extension candidate | pronouns.md, joins.md | Consider teaching subject + `zam` / `zal` fragment after a claim as *me too* (add-join reading is guessable) | P3 |
| G-F18 | clausal pro-form *so* in a complement (*Azawan says so*, *I hope so*, *I told you so*, *I hope not*) | none for a prior plain clause: `darr` fails to parse; span resume `d[=]` only works if the earlier content was a span ([spans](spans.md)); `darn` = *a statement*, not *that one*; `zalahen vaen xar` is untaught | missing | dependents.md | Stand-in resume: stand-in + **-r** (e.g. `darr` / `dorr` / `durr`) = *that same content* (most recent claim); negative *not* via `u` vowel or `darr zul` — guessable from resume **-r** | P2 |
| G-F19 | ellipsis with modal / ability (*Azawan can sing and so can I*) | verb resume `vezeher` drops the ability; would need `x` ability on the resume, not taught ([intention#incapability](intention.md#incapability)) | awkward | intention.md, pronouns.md | State whether ability **`x` + vowel** may sit on a resumed verb (`/v/ … -r` stem) or on `eze`; add example | P3 |

**Notes**

- Verbless clauses: lone noun (+ `/ɡ/`) = existence or property ([predication#existence](../grammar/predication.md#existence)); subject + object is rejected (an object needs a verb). Open: negative existential (G-F07).
- `zarl` (subject stand-in) parses with predicative `/ɡ/` (`gamadam zarl zazawan vowogal.`), but dependents.md never shows a `/z/` stand-in; the Advanced "other roles" section only illustrates `-rn` lexicalized forms and `/v/`.
- Subject focus can't use fronting (subject already default-first), so English subject clefts rely on `&` prosody only — worth one sentence in clause.md.
- No *want* root in the published lexicon (`lexicon-search want` → no match); log as lexicon gap, blocks the natural *what I want is…* example.

### G. Comparison and quantity

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| G-G17 | reciprocal *similar to each other* / *they look alike* | no reciprocal route for similative (`/b/` needs a model) | awkward | relations.md | Allow similative over a set subject with resume/set `/b/` for *alike*; coordinate with group B reciprocal row | P2 |
| G-G25 | ratios / rates *one in three*, *3 to 1*, *per hour* | *one in N* = fraction `g-N` after the noun (`zagadalx grurel vehahel.`) — say-amounts.md#one-in-n; *every Nth* via `h-N`; no per-unit rate (*per hour*) or ratio (*3 to 1*) | missing | numbers-applied.md | Per-unit rates need a new attachment (measure `/b/` + inverse amount); ratio *N to M* undecided | P2 |
| G-G27 | distributive *apiece* / *each* with a count (*they each got three*; *three apples apiece*) | singular verb leaves collective vs distributive open ([plurality#verbs-v](plurality.md#verbs-v)); no marker for per-member count | missing | plurality.md | Add a distributive counterpart to verb **-x** collective (e.g. marked count scope *per member*), or teach `h-` / set-join `a` distributive reading on the count | P2 |

**Notes**

- The parser accepts `zazawan zalahen zel gelavam h+2.` and `zazawan zalahen zel h+ vowogal.` with no taught reading — parse success is not evidence of coverage for G-G07 / G-G08.
- Threshold direction: single-item `z+5 zel` = *less than 5* and `zuel` = *greater than 5* (numbers-applied#numeric-thresholds) runs opposite to the comparative intuition (`zel` = *more*); learners will likely reverse it. Worth a Phase 4 look.
- `godogolr` alone fails to parse (`/ɡ/` + **-r** "of that kind" needs a following word), so no quick *same kind* route was tested.
- `h-N` is taught as *÷N / into N parts / every Nth* on `/h/` only; no `/ɡ/` fraction reading exists, which is why G-G24 is awkward despite the marker being close.

### H. Discourse and speech acts

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| G-H02 | greeting to someone whose name you don't know / group greeting (*hi all*) | none taught; `yohenx.` (listener -x) only calls them | awkward | word-endings.md / speech-moves.md | allow `/y/` + **`ohe`** / **`oha`** + **-n** as a conventional greeting, or teach `yohan.` as *hello, all of us* | P2 |
| G-H18 | hedge on a verb (*kind of walked*) | `zazawan vowogal habedum.` parses but only `/w/` hedge is taught | awkward | clause.md | teach `/h/` **`abedu`** (-m) as verb-degree hedge alongside `/w/` | P2 |
| G-H25 | *so* (topic launch / *so, what happened?*) | none; `xevavel` *next* partial | awkward | dependents.md / hooks.md | pair with G-H20 (`or` / `ar` resume hooks) or note `xevavel` as *so, next* | P3 |
| G-H27 | *in fact* (strengthening prior) | `al …` adds but does not escalate; `el …` rephrases | awkward | hooks.md | reading for a rank-upward discourse hook (e.g. `ael …` *even more so*), or teach `el` + `!` | P2 |

**Notes**

- Parser is permissive beyond the docs: `yonatham.`, `yonathum.` (values on `/y/`), `zamun thebewum …` (non-stance root on `/th/`), `zohen vowogal gegam`, `habedum`, and bare `yom.` all parse though none is taught. Verdicts treat them as untaught.
- `th( zalahen vowogal ).` fails (spaces inside the fence); `thexal … xuxul` works.
- Done 2026-09-27: hooks take **-r** on a plain vowel as a resume hook (G-H20, [hooks#hook-resume](../grammar/hooks.md#hook-resume)).
- The speech-act system is rich for directives (`yel/yem/yul/yum`) but has no expressive (thanks/sorry) or commissive (promise) act; values-on-`/y/` would fill both from existing morphology.
- Interjection `/y/` + **-n** is productive per speech-moves, so `yowawon` / `yogozon` count as covered, but no conventional interjections other than `yazeban` are listed.

### I. Deixis and reference

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| G-I30 | anaphora to a previous clause that a verb resume cannot pick up: no verb (`yal zazawan godogal`, *that surprised me*), a denied or unreal event (*Azawan didn't leave; that surprised me*), the claim not the event (*I doubt that*), several clauses (*he lied, then left; that's why*) | none | missing | dependents.md | Same fix as G-F18: backward stand-in `darr` / `dorr` / … = *that same content* | P2 |

**Notes**

- Parser accepts resume **-r** with no antecedent anywhere in the text (`zazawan vowogal hogaber.`), so it gives no warning when a learner writes a deictic "that one" with no antecedent (G-I05).
- `bar` after a hook is taught only as fill-ask *where?*; outside a question the same string would be *somewhere* by the join rule. The docs never state which wins in an assertion (G-I24).
- Neither the lexicon nor english.md has *here, there, now, come, go, bring, take, carry*; every deictic motion / place / time job depends on untaught hook + `amu` / `ohe` combos.
- `zonun` (*someone*) and `zar` (*something / someone*) overlap; pronouns.md and joins.md do not cross-reference the difference.
- G-I29 overlaps group B (reflexive); G-I05 / G-I12 overlap group C (demonstratives).

### J. Time, place, and manner phrases

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| G-J08 | *across* (to the other side) | `uol` *through* / `uom` *by way of*: `zazawan vowogal uol bebevul.` Loses the "side to side / other side" sense | awkward | hooks.md | Consider a stacked-vowel or `-m` reading for traversal-to-far-side, or teach `uol` + `ebevu` *span* idiom | P2 |
| G-J14 | *by* (deadline) | english.md: clock `/h/` or `hodam barl` *until* — neither means "no later than" | awkward | numbers-applied.md | Use `hodam` + `/b/` with **-l** closed bound, or rank threshold (`ue`) on time; teach explicitly | P2 |
| G-J26 | *for* (beneficiary) | hook `el` *for* (intended get): `zazawan vugugal el balahen.`; proxy `hadem` for *on behalf of*. `el` is glossed "intended get", so *cooks for Alahen* (benefit to a person) vs *for a money-bag* (goal to get) is blurred | awkward | hooks.md | Clarify that `el` + person = beneficiary, or split beneficiary (`em`?) from goal-to-get | P2 |

**Notes**

- All 40-odd test sentences parsed (cold-start `npx tsx` parse needs >20 s per call; first runs timed out and were rerun).
- The parser accepts any hosted `/h/` + `/b/` noun, so *during / before / after / until + NP* parse fine; the gap is teaching, not grammar.
- english.md *by (deadline)* maps to `hodam barl` *until*, which is a different meaning (event continues until vs completes no later than).
- `aom` is glossed *over* (frame of *on*), which competes with vertical *above/over* via `gabahal` + `/b/`; learners will likely pick `aom` for *over the bridge*.
- No published root for *now* / *today* / *yesterday* found via lexicon-search; this blocks a clean *ago* and deictic time.

## Phase 2 — Real-text sampling

## Phase 3 — Extension sweep

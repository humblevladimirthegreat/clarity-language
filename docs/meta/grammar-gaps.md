# Grammar gaps and extensions ledger

Editors only — not linked from grammar pages. Findings ledger for the expressiveness review (plan: `docs/proposals/expressiveness-review.md`). Lists English jobs Agalan handles awkwardly or not at all (**gaps**, `G-nn`) and unused forms with an intuitive reading (**extensions**, `E-nn`). Unused **forms** live in [unassigned-reserved](unassigned-reserved.md); this page tracks **jobs**.

Grammar pages teach only settled readings. Do not drill open rows as if taught ([drill-generation](drill-generation.md)).

## Fields

| Field | Content |
|-------|---------|
| ID | `G-nn` (gap), `E-nn` (extension), `D-nn` (by design) |
| English job / source form | e.g. *reflexive "herself"*; or `th+N` on `/h/` |
| Current route | Best existing Agalan expression, with example, or *none* |
| Verdict | **covered** · **awkward** · **missing** · **by design** · **extension candidate** |
| Owning page | the `docs/grammar/` page that would own it |
| Proposal | one-line suggestion, or `docs/proposals/<file>.md` |
| Priority | **P1** common everyday English · **P2** common in writing · **P3** niche (awkward / missing only) |

## By design

Deliberate omissions. An English job that only these forms would serve is **covered** if the meaning has a natural route; do not re-log it as a gap.

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| D-01 | copula *to be* as a verb | property on `/ɡ/`, kind on predicative `/ɡ/` (`yal zazawan godogol`), identity **`SAME`** | by design | predication.md | — | — |
| D-02 | grammatical past / future tense, progressive aspect | time via `/h/` lexicon, clock / date, closed moods; **RESIDUE** / **FORMER** are standing, not tense ([knowing](../grammar/knowing.md#evidentiality): verbs have no past or future letter) | by design | knowing.md, glosses.md | — | — |
| D-03 | article *the* for an already-mentioned kind | resume **-r** | by design | pronouns.md | — | — |
| D-04 | single *cause* arrow word (*X causes Y*) | two-place poles **`adoro`** / **`ebero`** / **`urugu`** / **`ezaze`**; **CAUSE** mood | by design | causation.md | — | — |
| D-05 | metric prefixes (*kilo-*, *milli-*) and unit abbreviations | scaled amount on the base unit | by design | numbers-applied.md | — | — |
| D-06 | generic plural / *every K* via plural marking | universals joins (`zual gagadal`), habitual **`hual`**; **-x** is associative | by design | plurality.md, joins.md | — | — |
| D-07 | written capitals for names | named **-n** / **`@`**; native text is unicase | by design | phonology.md, word-endings.md | — | — |
| D-08 | sentence-final `?` / `!` carrying force | act word carries force; tone marks are prosody only; sentences end in `.` | by design | speech-moves.md | — | — |
| D-09 | *attacker*-style agent-noun lexicon | role compounds **`a` / `e` / `u` / `o` x ROOT** | by design | roles.md | — | — |
| D-10 | neutral past / *earlier* / bare *now* word | signed offset on a channel ([knowing#dated-channel](../grammar/knowing.md#dated-channel)): `thuvuvum bohoram g-3`; PREDICT / PLAN `+`; *just* / *about to* = `b-e-` / `b+e-` | by design | knowing.md | Every offset from now sits on an evidential or PREDICT / PLAN; wrong sign on a one-way channel is not a sentence. Absolute dates stay channel-free | — |

### Settled decisions from the dated-channel review

- The offset after a channel dates the **event**, not when the speaker learned of it.
- A hosted `/b/` after an evidential is read by its filler: a time measure = offset; a person or other noun = source (*per Ululon*, not yet taught).
- `g-e-` means *just short* (was *imaginary*); *as if* stays on NOTIONAL `adade`.

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

- **Deixis:** done 2026-09-26: *here / there / this / that / come / go* = place hook + speaker / listener / interlocutors ([hooks#deixis](../grammar/hooks.md#deixis)); *now / today* = zero channel offset ([knowing#now](../grammar/knowing.md#now)); day / week / month / year units published. Open: *bring / take* (no carry root, G-I16) and a generic motion root.
- **Question words:** done 2026-09-26: *why / how* (G-A09, G-A11). Open: *how many / how big* (G-A10, G-A12).
- **Aspect adverbs:** *just / already / still / not yet / anymore / about to* (G-B).
- **Permission:** done 2026-09-26: permission `therenem` / `therenel`, consent `thuxerenem` / `thuxerener` (interests.md).
- **Expressive / commissive acts:** *thanks / sorry / promise* (G-H); values on `/y/` (`yonogotham`) parse.
- **Quantity words:** done 2026-09-26: *a few* `g~+`, mass *some* `g+`, *many / few / enough / too* = amount scale `g+` against a named bar (judgment or interest bar), *most* `g+50% guel`, *half* `g-2`, *at most* `eo` ray, *more X than Y*. Open: *how many / how big* (G-A10, G-A12).
- **Degree and focus:** *almost / barely / quite / slightly / even / also* (G-D).
- **Existentials:** done 2026-09-26: *there is* = lone noun ([predication#existence](../grammar/predication.md#existence)). Open: *there is no* (G-F07).
- **Subordinators:** done 2026-09-26: *unless* (G-E09), reported wh-questions (G-E32), asking tag (G-A18). Open: temporal *since* (G-E15, G-J13).
- **Others:** kin / social *'s* (G-C), reciprocal *each other* and one-clause causative (G-B), *behind / in front of* (G-J05). Done 2026-09-26: *under / above* (G-J03–04), pro-form *one* (G-F16).

### A. Clause types

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| G-A01 | declarative (*Azawan walks.*) | `zazawan vawalal.` (omissible `yal`); soft `yam` — speech-moves.md#speech-act-beginner, #speech-act | covered | speech-moves.md | — | — |
| G-A02 | yes/no question (*Does Azawan walk?*) | `yol zazawan vawalal.` / soft `yom`; optional `?` — questions.md#question, #question-tone | covered | questions.md | — | — |
| G-A03 | negative yes/no (*Didn't Azawan run?*) | `yol zazawan vurunul vul.` (post-verb `vul`); answers `yael` / `yuel` — questions.md#confirming-a-negative | covered | questions.md | Fix page examples: they write `yol zazawan vul vurunul.`, which the parser rejects (see Notes) | — |
| G-A04 | alternative question (*the teapot or the dog?*) | closed-menu list join under question: `yol zazawan dedebol dodogol dol vejel.` — questions.md#single-item-standalone-inventory | covered | questions.md | Advanced only; could get one Intermediate example | — |
| G-A05 | wh- *who / what / do what / what happened* | join **-r** blank: `yol zar vawalal.`, `yol var.`, `yol xar.`; *what else* `zur`; fill-all `yol zar vejel dar.` — questions.md#fill-ask-r, #fill-all | covered | questions.md | — | — |
| G-A06 | *which (X)* | `yol zagegol zar.`; list + `…ar` = *which of these*; `…er` *which first* — questions.md#fill-ask-arity | covered | questions.md | — | — |
| G-A07 | *where / where from / in what* | hook + `bar`: `yol zuhubun vawalal ol bar.` — questions.md#where | covered | questions.md | — | — |
| G-A08 | *when* | `yol zazawan vawalal har.` — questions.md#when | covered | questions.md | — | — |
| G-A09 | *how* (manner / means: *How does Azawan walk?*) | `yol zazawan vawalal hurorom bar.`; means `ael bar` | covered | questions.md#how, hooks.md#extra-noun-intermediate | — | — |
| G-A10 | *how* + degree (*How big is the dog?*, *how fast*) | none. No degree blank before `/ɡ/` (`wel` is already rank-restrictor; `war` rejected after the verb) | missing | questions.md / comparatives.md | Degree fill-ask on `/w/` before the adjective (e.g. a digitless `/w/` number blank, or a measure-phrase blank); check numbers free forms | P1 |
| G-A11 | *why* / *what for* | `thurugum bar` / `holalam bar` / `thadorom bar` | covered | questions.md#why | — | — |
| G-A12 | *how many / how much* | digitless number **-r** is a blank like standalone join **-r**: `yol zazawan dagadalx g=+ vejel.` *How many cats?*; `g=#` *which place?*, `d=_` *what number?*; statement = *some number*. Resume needs a digit (`g=+3`) — [numbers#how-many](../grammar/numbers.md#how-many) | covered | numbers.md | — | — |
| G-A13 | imperative (*Walk!*) | `yel vawalal.`; addressee explicit `yel zedonen vawalal.` (roles.md examples) — speech-moves.md#speech-act-beginner | covered | speech-moves.md | — | — |
| G-A14 | polite request (*Please walk.*) | `yem vawalal.` — speech-moves.md#speech-act | covered | speech-moves.md | — | — |
| G-A15 | *let's* (*Let's walk.*) | `yem zahan vawalal.` / `yum zahan …` | covered | speech-moves.md#speech-act | — | — |
| G-A16 | negative imperative (*Don't walk.* / *Please don't*) | `yul vawalal.`, `yum`, emphatic `yul yul` — speech-moves.md#emphatic-prohibition | covered | speech-moves.md | — | — |
| G-A17 | exclamative (*What a big dog!*, *How big the dog is!*) | tone + intensifier: `! zodogol welem gelel.` — speech-moves.md#tone-marks | awkward | speech-moves.md | Teach the `!` + `welem` route as the exclamative pattern; optionally a degree-exclamation (`/y/` + adjective, e.g. `yelel` parses as y-elephant) giving *So big!* | P2 |
| G-A18 | tag question (*Azawan walks, doesn't he? / right?*) | `zazawan vawalal. yol yael.` (parser change 2026-09-26) | covered | questions.md#polar-stance | — | — |
| G-A19 | echo question (*You saw WHAT?*, *Azawan did?*) | `yol zedonen vejel ?!dar.` | covered | questions.md#echo | — | — |
| G-A20 | rhetorical question (*Who cares?*, *Isn't it obvious?*) | none. `yol` expects a reply; `%` is joking; `yam yol …` / `yal yol …` stack parses with no defined reading | missing | speech-moves.md | Define stacked `yal yol …` (claim asked as question: answer asserted) as rhetorical; soft `yam yol` for musing | P2 |
| G-A21 | wondering / self-question (*I wonder if…*) | `yom zululon velebel.` — questions.md#question | covered | questions.md | — | — |

**Notes**

- Parser rejects the questions.md#confirming-a-negative examples `yol zazawan vul vurunul.` and `yael vul vurunul.`-style pre-verb `vul` ("Illegal left fence: join before conjuncts"); `yel vul vawalal.` fails too. Post-verb `vurunul vul` parses. Either the page or the parser is out of step (the build apparently does not catch it).
- Digitless number **-r** written `g+r` parses and glosses as "more-than-one" rather than resume; docs say resume is written `g=+`.
- Bare `yol.` / `yol yael.` as a whole turn parse but have no documented reading.
- `/y/` + content root (`yelel`) parses as an interjection with no documented reading on **-l** (docs use **-n** for conventional calls).
- `yol zazawan vawalal war.` fails to parse although `/w/` occasion restrictors are documented alongside `har`.

### B. Verb phrase

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| G-B01 | grammatical tense (past / present / future marking on the verb) | No tense letter, stated as a design choice: "Verbs have **no past or future letter**" ([knowing#evidentiality](../grammar/knowing.md#evidentiality)); "Neither word is a past tense" ([why-agelan](../grammar/why-agelan.md)); morph glosses never carry tense ([glosses](glosses.md), line ~270). Time comes from channel, *before* / *after*, clock, PREDICT | by design | knowing.md | Add to the By design table as D-nn so it is not raised again | — |
| G-B02 | simple past (*Azawan walked*) | WITNESSED `zazawan thuvuvum vawalal.`, or a when-frame (`helabam barl`, clock `/h/`) ([knowing#live-vs-memory](../grammar/knowing.md#live-vs-memory)) | covered | knowing.md | — | — |
| G-B03 | past with no evidential claim (plain narration: *Yesterday Azawan walked*, told with no source) | channel or date: `thuvuvum` / `theraram` / `thorolom` (*per the tale*, for narration), or a clock / date | by design | knowing.md | Neutral past is deliberately absent (see D-10). No *earlier* adverb and no bare *before now*: *before* / *after* always name a landmark | — |
| G-B04 | perfect *has done* (result still relevant) | RESIDUE `zazawan thonenom vawalal.` ([knowing#residue](../grammar/knowing.md#residue)) | covered | knowing.md | — | — |
| G-B05 | experiential perfect *has ever done / has never done* | `har` *sometimes* / bare `hal` *never* are restrictor habits, not "at least once in a lifetime" ([restrictors](../grammar/restrictors.md)) | awkward | restrictors.md | Add a documented reading: `har` + WITNESSED = *has at some point*; show *never has* with `hal` | P2 |
| G-B06 | progressive *is walking* | Unmarked verb; LIVE `zazawan thadezem vawalal.` for "going on in view"; *while* `hegemum barl` for a frame ([glosses](glosses.md)) | covered | knowing.md | — | — |
| G-B07 | habitual (*walks every day*, *usually*) | `zazawan hual vawalal.` ([restrictors](../grammar/restrictors.md)); motive habit `…thom` + `hual` | covered | restrictors.md | — | — |
| G-B08 | *used to* (former habit) | `zazawan hual vawalal themebem.` FORMER ([knowing#former-climate](../grammar/knowing.md#former-climate)) | covered | knowing.md | — | — |
| G-B09 | *about to* / imminent | PREDICT + just-after offset: `thelezom b+e- vanunul.` ([knowing#dated-channel](../grammar/knowing.md#dated-channel)) | covered | knowing.md | — | — |
| G-B10 | *just* (recent past: *has just left*) | channel + just-before offset: `zazawan thuvuvum b-e- vawalal.` | covered | knowing.md | — | — |
| G-B11 | *still* (continuing state/action) | `/h/` STILL `hanogom` (`/w/` on one adjective); ending = permanence, **-l** not expected to change back / **-m** could change — [knowing#phasal](../grammar/knowing.md#phasal) | covered | knowing.md | — | — |
| G-B12 | *already* | `/h/` ALREADY `hahagam` (`/w/` on one adjective); ending = permanence, **-l** not expected to change back / **-m** could change — [knowing#phasal](../grammar/knowing.md#phasal) | covered | knowing.md | — | — |
| G-B13 | *not yet* | `/h/` NOT-YET `hezedem` (`/w/` on one adjective); ending = permanence, **-l** not expected to change back / **-m** could change — [knowing#phasal](../grammar/knowing.md#phasal) | covered | knowing.md | — | — |
| G-B14 | *anymore* / *no longer* | `/h/` NO-LONGER `huwulum` (`/w/` on one adjective); ending = permanence, **-l** not expected to change back / **-m** could change — [knowing#phasal](../grammar/knowing.md#phasal) | covered | knowing.md | — | — |
| G-B15 | *begin / stop / finish* doing (phase verbs) | Content roots only: `vozodol` *stop* + object `dawalam` (`zazawan vozodol dawalam.` parses); `unuhu` *terminus*; nothing for *start*. Using an action noun as the object is not taught | awkward | clause.md | Teach event-noun objects for phase verbs and give *start* a root | P2 |
| G-B16 | *again* / repeat | `/v/` + **-r** on a noun (settled: *do the same action again*); content `vererel` *repeat* as a co-verb (`zazawan vererel vawalal.` parses, not taught) | awkward | pronouns.md | Teach *again* as an `/h/` on `erebe` (`hererem`) with the verb | P2 |
| G-B17 | *can* (ability) | `zazawan vuzunuxal.` ([intention#can](../grammar/intention.md#can)); `xe`/`xo`/`xu` for *can't* | covered | intention.md | — | — |
| G-B18 | *could* (past ability, *could swim as a child*) | `zazawan vuzunuxal themebem.` | covered | intention.md#can | — | — |
| G-B19 | *may / might / could* (epistemic) | MAY `zazawan thodohom vawalal.` ([knowing#may](../grammar/knowing.md#may)) | covered | knowing.md | — | — |
| G-B20 | *may / can* (permission: *you may go*) | `zazawan vawalal therenem.` (granted) / `therenel` (rule allows) / `therener` (tolerated); negatives `thononem` / `thononel` / `thononer` — [values#permission](../grammar/interests.md#permission) | covered | interests.md | — | — |
| G-B21 | *must* (obligation) | Firm command `yel`, or need-linked prescription `…thel`/`…them`/`…ther` ([values#interest-force](../grammar/interests.md#interest-force)). By design, a bare *must* without a named interest is avoided ([why-agelan](../grammar/why-agelan.md)) | by design | interests.md | — | — |
| G-B22 | *must* (epistemic: *must be home*) | Evidentials such as clue-based inference ([knowing#evidentiality](../grammar/knowing.md#evidentiality)) or a stance number `th+95` | covered | knowing.md | — | — |
| G-B23 | *should / ought to* | `zazawan vezehel thonogothem.` ([values#interest-force](../grammar/interests.md#interest-force)); a forecast *should* uses PREDICT | covered | interests.md | — | — |
| G-B24 | rules or norms not tied to an interest (*you should signal before turning*, *passengers must…*) | Prescription requires a named interest; a plain rule without one has only a command | awkward | interests.md | Document which interest to pick for social or legal rules, or show `yel` with generic `enenu` | P2 |
| G-B25 | *would* (counterfactual / conditional) | as-of + RESIDUE / PREDICT ([causation](../grammar/causation.md)); NOTIONAL for hypotheticals | covered | causation.md | — | — |
| G-B26 | *would* (past habitual, polite *would you…*) | Past habit = FORMER; polite request = soft `yem` ([speech-moves](../grammar/speech-moves.md)) | covered | speech-moves.md | — | — |
| G-B27 | *need to / have to* | motive `zazawan vawalal thonogothom.` ([values#interest-preference](../grammar/interests.md#interest-preference)); necessary condition `ebero` | covered | interests.md | — | — |
| G-B28 | *had better* (warning advice) | offered prescription `…them` + *so that … not* (`holalam burl`) | covered | interests.md | — | — |
| G-B29 | *will* / *going to* (future) | PREDICT `thelezom` / PLAN `themabam`; DECISION `ehege` | covered | intention.md | — | — |
| G-B30 | passive with agent (*seen by Azawan*) | Front the object: `dagadal zazawan vejel.` ([clause#word-order-emphasis](../grammar/clause.md#word-order-emphasis), [english#by](../grammar/english.md)) | covered | clause.md | — | — |
| G-B31 | agentless passive (*the cat was seen*, *mistakes were made*) | `dazawan vejel.` | covered | clause.md#no-subject | — | — |
| G-B32 | causative *make X do* (force) | Two sentences + CAUSE / because: `zazawan thegegam vuzunul. zululon vezehel.`; `zululon vawalal thurugum barl. zazawan dular vezehel.` ([causation](../grammar/causation.md)). No one-clause causer + causee | awkward | causation.md / roles.md | A causative route: `/b/` causee + closed causer relation, or verb + `/b/` + `egega` host | P1 |
| G-B33 | causative *let X do* (permission) | Permission **-m** with a hosted `/b/` grantor: `zazawan vawalal therenem bululon.` (*Ululon lets Azawan walk*) — [values#permission](../grammar/interests.md#permission) | covered | interests.md | — | — |
| G-B34 | causative *have / get X to do* (arrange, persuade) | Tell + *to* stand-in: `vezehel … dorl`/`derl` with the next sentence ([dependents](../grammar/dependents.md)) — *asks X to* | covered | dependents.md | — | — |
| G-B35 | phrasal verbs, directional (*walk out*, *go in*, *climb on*) | fused hook compounds `zazawan dazadol vawalalul.` ([hooks#hook-compounds](../grammar/hooks.md#hook-compounds)) or free hook + `/b/` | covered | hooks.md | — | — |
| G-B36 | idiomatic phrasal verbs (*give up*, *put up with*, *figure out*) | Pick a content root (`ozodo` *cessation* for *give up*); no systematic route | covered | lexicon | — | — |
| G-B37 | light-verb constructions (*take a walk*, *have a look*, *make a decision*) | Use the content verb (`vawalal`); DECISION `ehege`. English light verbs are not needed | covered | clause.md | — | — |
| G-B38 | reflexive (*Azawan sees herself*) | `zazawan vejel dazar.` | covered | pronouns.md#resume-r | — | — |
| G-B40 | *try* (attempt, with no order implied: *Azawan tries the workaround*) | none; join-act `voen` is now *starts with* (sequence), and the lexicon has no *try* / *attempt* root | missing | join-across-roles.md / lexicon | Add a *try* root or sense; keep `voen` as sequence | P1 |
| G-B41 | fallback condition (*if A, else if B*: B applies only when A fails) | none; restrictor `hoel` is now occasions in order, and `hel` (*preferably when A rather than B*) states a preference, not a plan B | missing | restrictors.md | Likely the same form as G-B40 *try* (attempt A, fall back to B) | P2 |
| G-B39 | reciprocal (*Azawan and Ululon see each other*) | No taught route. `zazawan zululon zal dazar vejel.` parses, but `zar` is a join member and `dazar` would just resume Azawan. Numeric derivation `ROOTl+2` *mutual* makes only nouns/adjectives ([numeric-derivation](../grammar/numeric-derivation.md)), advanced | missing | pronouns.md / join-across-roles.md | Reciprocal: a set-join resume on the object (`d` + join resume) read as *each other*, or published `ezaze` *reciprocity* as `/h/` | P1 |

**Notes**

- Parser: all 27 test sentences parsed, including forms the docs do not teach: subjectless `dazawan vejel.`, same-clause reflexive `zazawan vejel dazar.`, and `zazawan vozodol dawalam.`. The parser accepts more than the pages teach, so these count as awkward or missing, not covered.
- No tense by design: yes, it is stated. knowing.md#evidentiality says "Verbs have **no past or future letter**". knowing.md#residue says the RESIDUE / FORMER moods "do **not** locate time", and so does why-agelan.md ("Neither word is a past tense"). glosses.md (~line 270) says Agalan "does not mark English tense or progressive aspect". It is **not** in the ledger's By design table. Add it (G-B01).
- Aspect particles (*just / already / still / yet / anymore*) form the biggest gap cluster. RESIDUE and FORMER each cover only part of the ground. A single small aspect/expectation adverb series on the add / one / order / undo vowel pattern could fill most of G-B09 to G-B14.
- Permission (G-B20, G-B33) filled 2026-09-26 in interests.md#permission / #consent.
- Parser speed: each `npm run parse` took about 25 s under load. The two runs that printed nothing were killed jobs (exit 144), not parse failures.

### C. Noun phrase

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| G-C01 | indefinite *a / an* (first mention) | bare first-mention **-l** / **-m**: `zodogol vawalal.` *A dog walks.* — [word-endings#first-mention-concrete-l](word-endings.md) | covered | word-endings.md | — | — |
| G-C02 | *the* for an already-mentioned referent | resume **-r**: `zodogol vawalal. zodor vajul.` — [pronouns#resume-r](pronouns.md#resume-r) | by design (D-03) | pronouns.md | — | — |
| G-C03 | *the* for a unique / situational referent never mentioned (*the sun*, *the door*, *the kitchen*) | *the sun* = unique **-n** `zunun vawalal.`; situational *the door* = plain **-l**: Agalan does not mark *the* vs *a*, so context supplies definiteness (decided 2026-09-26) | covered | word-endings.md | State the **-l** reading on word-endings.md if learners ask | — |
| G-C04 | *some* + count noun (*some cats*) | indefinite group **-lx**: `zagadalx vajul.` — [plurality#beginner](plurality.md#beginner) | covered | plurality.md | — | — |
| G-C05 | *some* = a specific unknown one (*some person*) | join **-r**: `zeberel zar vawalal.` — [joins#unspecified-member-r-phrase](joins.md#unspecified-member-r-phrase) | covered | joins.md | — | — |
| G-C06 | *some* + mass noun (*some bread / water*) | `g+` on a mass noun = non-zero amount: `zadedal g+ vajul.` ([numbers#mass-some](../grammar/numbers.md#mass-some)) | covered | numbers.md | — | — |
| G-C07 | free-choice *any* (*any cat will do*) | `zagadal zor vajul.` — [joins#universals-domains-generics](joins.md#universals-domains-generics) | covered | joins.md | — | — |
| G-C08 | NPI *any* (*I don't see any dogs*) | negation join: `zazawan dual vejel.` / `zazawan dodogol dul vejel.`; not explicitly mapped from NPI *any* | covered | joins.md | Add an English-side note (*not … any* = **u** join) in english.md | — |
| G-C09 | demonstrative *this / that* (anaphoric, *that dog* just mentioned) | resume **-r** (`zodor`) — [pronouns#how-english-approximates--r](pronouns.md) | covered | pronouns.md | — | — |
| G-C10 | deictic demonstrative *this X (here) / that X (there)*, proximal vs distal, pointing at an unmentioned thing | `zodogol om bugobon vajul.` *this dog (by me)*; `om bedonen` *that (by you)*; `um bahan` *yonder* — [hooks#deixis](../grammar/hooks.md#deixis) | covered | hooks.md | — | — |
| G-C11 | *all* (of a listed / known set) | closed **-l** and-list: `zazawan zululon zal vawalal.` — [joins#and-lists-a](joins.md#beginner) | covered | joins.md | — | — |
| G-C12 | *all / every K* (universal over a kind) | `zual gagadal vajul.` (open `zuam` for soft generic) — [joins#universals-domains-generics](joins.md#universals-domains-generics) | covered | joins.md | — | — |
| G-C13 | *all the cats (here)* — universal over a situational group | `zual gagadalx vajul.` parses, but no page says what SHARED `/ɡ/`…**-x** under **`ua`** means (collective? situational domain?) | awkward | joins.md | Teach **`ua`** + SHARED kind + domain restriction (*all the cats in this house*) explicitly | P1 |
| G-C14 | *each* (distributive, one at a time) | `zual gagadal vajul.` distributive vs `vajulx` collective | covered | joins.md#universals-domains-generics | — | — |
| G-C15 | *both* | two-item **`a`** join: `zazawan zululon zal vawalal.` — [comparatives#distributive-both-are-adj](comparatives.md) | covered | joins.md | — | — |
| G-C16 | *either* (one of two) | `zazawan zululon zol vawalal.` (pick one); free-choice `zor` — [joins#choice-o](joins.md#beginner) | covered | joins.md | — | — |
| G-C17 | *neither* / *none of* | `zazawan zululon zul vawalal.` — [joins#negation-u](joins.md#negation-u) | covered | joins.md | — | — |
| G-C18 | *none* / *nobody* / *no X* (standalone, or *no cats* over a kind) | `zul gagadal vajul.` | covered | joins.md#universals-domains-generics | — | — |
| G-C19 | *few* (small, "not many" — negative orientation) | amount rank below a named bar: `zagadalx zahaman zuel g+.` *few cats* ([comparatives#vague-amounts](../grammar/comparatives.md#vague-amounts)) | covered | comparatives.md | — | — |
| G-C20 | *a few* / *several* (small positive count) | soft digitless count `g~+`: `zagadalx g~+ vajul.` ([numbers#a-few](../grammar/numbers.md#a-few)) | covered | numbers.md | — | — |
| G-C21 | *many / much / a lot of* | amount rank above a named bar: `zagadalx zahaman zel g+.` ([comparatives#vague-amounts](../grammar/comparatives.md#vague-amounts)) | covered | comparatives.md | — | — |
| G-C22 | mass *little* (*little water*) | same as *few*: `zadedal zahaman zuel g+.` ([comparatives#vague-amounts](../grammar/comparatives.md#vague-amounts)) | covered | comparatives.md | — | — |
| G-C23 | *most (of the X)* | `zagadalx g+50% guel vajul.` (more than half — [numbers-applied#most](../grammar/numbers-applied.md#most)) | covered | numbers-applied.md | — | — |
| G-C24 | quantity *enough (bread)* | tie against a interest bar: `zadedal zegen zael g+.`; whose interest = `/b/` after the scale ([comparatives#interest-benchmarks](../grammar/comparatives.md#interest-benchmarks)) | covered | comparatives.md | — | — |
| G-C25 | *too many / too much* (excess) | rank above a interest bar (`zadedal zegen zel g+.`) or above *my standard* (`zuroron`) ([comparatives#interest-benchmarks](../grammar/comparatives.md#interest-benchmarks)) | covered | comparatives.md | — | — |
| G-C26 | possessive *'s* / *of* (ownership) | `zodogol goborum bazawan vawalal.` — [joins#scope-fence-p-join](joins.md#scope-fence-p-join); speaker *my* via values need on `/ɡ/` | covered | joins.md (owner) | Ownership is taught only inside joins.md SHARED section; give it a home in relations.md#of-relations | — |
| G-C27 | *'s* for body part / whole–part (*Ululon's hand*) | `dahanal gobonem bululon` — [relations#of-relations](relations.md#of-relations) | covered | relations.md | — | — |
| G-C28 | *'s* for kin / social relations (*Azawan's sister, friend, boss*) | kin: generation ordinal + `/b/` anchor, tree cohorts (`zululon g#e0 bazawan` *Azawan's sibling*; nested anchor for aunt/uncle) — [numbers-applied#kin-generations](../grammar/numbers-applied.md#kin-generations). Social (*friend*, *boss*) still none; `goborum` is ownership, `gobonem` is part-of | awkward | relations.md | Social relations: role compound + `/b/` anchor, or a relational-*of* host | P1 |
| G-C29 | double genitive (*a friend of Azawan's*) | depends on G-C28; for things `dabogol goborum bazawan` (*a book of Azawan's*) = same as *'s*, fine | awkward | relations.md | Resolved by G-C28 | P2 |
| G-C30 | stacked possessives (*Azawan's dog's owner*) | chained hosts parse (`zodogol goborum bazawan goborum bululon`) but attachment of the second `goborum` is not taught | awkward | joins.md / relations.md | Teach chaining order of stacked of-relations | P3 |
| G-C31 | partitive of a container / material (*a cup of tea*, *a house of wood*) | `gajaram` / `gowodom` + `/b/` — [relations#of-relations](relations.md#of-relations) | covered | relations.md | — | — |
| G-C32 | partitive portion of a mass (*a piece of bread*, *a slice*, *a bit of*) | none; `gobonem` = constitutive part, not an arbitrary portion; measure phrases need a unit | missing | relations.md | Portion *of* relation (piece severed from a whole) beside `gobonem` | P2 |
| G-C33 | partitive of a set (*three of the cats*, *one of them*) | `zagarx g+3` | covered | numbers-applied.md#percent-denominators | — | — |
| G-C34 | noun–noun compounds, lexicalized (*bedroom*, *textbook*) | `data/lexicon-compounds.csv`: `zabedelohohul vajul.` — [x-compounds#lexical-compounds](x-compounds.md#lexical-compounds) | covered | x-compounds.md | — | — |
| G-C35 | noun–noun compounds, productive (*dog house*, *peanut butter*) | mid-word `x`: `zabanuxudel vajul.`; or two words / hosted relation — [x-compounds#compound-vs-separate](x-compounds.md#compound-vs-separate) | covered | x-compounds.md | — | — |
| G-C36 | appositive (*Azawan, a teacher, walks*) | classification `/ɡ/` on the name: `zazawan gaxedegel vawalal.` — [predication#classification](predication.md) | covered | predication.md | Name *appositive* in english.md → predication | — |
| G-C37 | identifying appositive (*my friend Azawan*, *the teacher, Azawan,*) | **`SAME`**: `zazawan zaxedegel gonunul bululon`… or `zaxedegel gonunul bazawan` — [predication#identity](predication.md#identity) | covered | predication.md | — | — |
| G-C38 | generic reference (*Cats sit. / A cat is an animal.*) | `zual gagadal` (strict) / `zuam gagadal` (soft) — [joins#universals-domains-generics](joins.md#universals-domains-generics); habitual `hual` | by design (D-06) | joins.md | — | — |
| G-C39 | specific vs non-specific indefinite (*I want a book — any / a particular one*) | specific unknown `dabogol dar`; free-choice `dabogol dor` (both parse) | covered | joins.md | — | — |

**Notes**

- Approximate numbers write the `~` in the second slot (`g~+3`); `g+3~` fails the parser, matching numbers.md. Worth a drill on this since English speakers will write `~` last.
- `zual gagadal zul` is rejected as an illegal left fence, and no page shows how to say *no K*, even though *every K* (`zual gagadal`) is taught. This is the biggest gap in the quantifier area.
- `zual gagadalx` (every + SHARED `/ɡ/`…**-x**) parses, but its reading isn't defined. plurality.md defines `/ɡ/`…**-x** after **`a`** as collective, but nothing covers it after **`ua`**.
- Quantity vocabulary (*few, several, many, most, enough, too many*) has no teaching home. numbers.md gives magnitudes (bands, ∞, arbitrarily small), which are too hyperbolic or technical for everyday *many* / *few*.
- Ownership `goborum` is only defined in passing inside joins.md (SHARED after the join), and relations.md points there. Kinship and social *'s* (*Azawan's sister*) have no route.
- Deixis gap: *this / that* is anaphoric only, via **-r**. Proximal vs distal pointing is absent, and this likely overlaps group I (*here / there*, *this / that*).

### D. Modification

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| G-D01 | adjective stacking (*a small blue dog*) | several `/ɡ/` after the noun, or `gl-` before it: `zodogol glelulul gumuzem vawalal.` ([clause#adjectives-ɡ](clause.md#adjectives-ɡ), [#left-bound-adjectives](clause.md#left-bound-adjectives)) | covered | clause.md | — | — |
| G-D02 | adjective order (size-before-colour rules) | no fixed order; a plain `/ɡ/` after a `/ɡ/`+`/b/` pair describes the `/b/` noun ([clause#complex-chaining](clause.md#complex-chaining)) | covered | clause.md | Add one line saying stacked plain adjectives come in any order | — |
| G-D03 | intensifier *very* | `/w/` `welem` before `/ɡ/`: `zodogol welem gelulul vawalal.` ([clause#adjective-detail-w](clause.md#adjective-detail-w)) | covered | clause.md | — | — |
| G-D04 | *very* on a verb (*walks very quickly*) / *very much* on the verb | `welem hadazam` | covered | clause.md#degree-w | — | — |
| G-D05 | downtoners *slightly / a bit / somewhat* | `wumuzem` | covered | clause.md#degree-w | — | — |
| G-D06 | *quite / rather / fairly / pretty* (moderate degree) | none taught; you would have to invent a `/w/` root | missing | clause.md | Name a mid-degree `/w/` (e.g. an existing moderate-scale root) in the same `/w/` degree table as `welem` / `wumuzem` | P1 |
| G-D07 | *extremely / overwhelmingly* | `wogegal` | covered | clause.md#degree-w | — | — |
| G-D08 | *almost / nearly* (on a verb or adjective: *almost falls*, *almost empty*) | verb: `h-e-` (*almost*), `h~-e-` (*nearly*); claim: `th-e-` (*virtually*); amount: `g-e-` (*just short*) — [numbers#just-short](../grammar/numbers.md#just-short) | covered | numbers.md | Adjective (*almost empty*) not yet shown; `w-e-` is the candidate | — |
| G-D09 | *barely / hardly / scarcely* | none | missing | numbers.md / clause.md | Mirror of G-D08: `h~+e`-type *just over the threshold*, or `wumuzem` + something; decide with G-D08 | P1 |
| G-D10 | *too* ADJ (excess: *too hot to drink*) | rank above a interest bar on the quality: `zadedal zuhuhen zel gohodol.` ([comparatives#interest-benchmarks](../grammar/comparatives.md#interest-benchmarks)) | covered | comparatives.md | — | — |
| G-D11 | *enough* (*warm enough to swim*) | tie **`ae`** against a interest bar on the quality ([comparatives#interest-benchmarks](../grammar/comparatives.md#interest-benchmarks)) | covered | comparatives.md | — | — |
| G-D12 | *so ADJ that …* (degree + result) | `welem` + next-sentence linker (*therefore* `xezazam`, [dependents](dependents.md#continue-x)) — two sentences, degree-result link lost | awkward | dependents.md | Teach the two-sentence route explicitly, or a `/w/` *to-that-degree* word pointing at the next sentence | P2 |
| G-D13 | equative *as … as* | `zazawan zululon zael gomonam.`; open `zaem` = *about as* ([comparatives#equatives](comparatives.md#equatives)) | covered | comparatives.md | — | — |
| G-D14 | *more / less … than*, *most / least* | `zel` / `zuel` + shared `/ɡ/`; manner via `/h/` after the join ([comparatives](comparatives.md#manner-scale)) | covered | comparatives.md | — | — |
| G-D15 | *much more / slightly more* | `zazawan zululon zel wogegal gomonam.` ([comparatives#degree](comparatives.md#degree)) | covered | comparatives.md | (slightly: see G-D05) | — |
| G-D16 | correlative *the more …, the more …* | none; you could chain two sentences with *because*, but the covariation is lost | missing | comparatives.md | Rank join `e` on `/x/` linking two scale claims (a *co-rank* reading) | P2 |
| G-D17 | focus *only X* / *just X* | single-item set join `zazawan zal vawalal.` *just Azawan* ([joins#standalone-phrase](joins.md#standalone-phrase)); *only when* `hal` ([restrictors](restrictors.md)) | covered | joins.md | — | — |
| G-D18 | focus *also / too* (*Azawan also walks*) | discourse hook `al zazawan vawalal.` *Additionally …* ([hooks#discourse-hooks](hooks.md#discourse-hooks)) adds the whole sentence; does not mark which item is added | awkward | hooks.md | Allow the same-role hook with the left side left implicit (`al zazawan` = *Azawan too*) | P1 |
| G-D19 | scalar focus *even X* (*even Azawan walks*) | none (the hook `al` has no "least expected" reading) | missing | hooks.md | Add a stacked-vowel hook (e.g. `ael`-style) or `/w/` on the hook: *including, least expected* | P1 |
| G-D20 | *just* = *merely* (*it's just a cat*) | `zal` single item gives *only*, but not the "no more than / small" judgment | awkward | joins.md | Teach `zal` + `wumuzem`, or say that `zal` covers both | P3 |
| G-D21 | *apparently / reportedly / evidently* | evidential `/th/`: `theraram` hearsay, `thunevem` inferred ([knowing#evidentiality](knowing.md#evidentiality)) | covered | knowing.md | — | — |
| G-D22 | *probably / possibly / certainly* | MAY `thodohom`; stance numbers `th+`, `th+e` ([numbers#number-as-stance-by-marker](numbers.md#number-as-stance-by-marker)) | covered | knowing.md | — | — |
| G-D23 | *hopefully* (speaker hope toward the clause) | emotion compose is for judgment only ([values#emotion-compose](interests.md#emotion-compose)); `zazawan thozedem vawalal.` parses (content *hope* under `/th/`) but is not taught | missing | interests.md / clause.md | Teach content-root `/th/` stance (`thozedem` *hopefully*) as a general "speaker attitude" pattern | P1 |
| G-D24 | *frankly / honestly / to be clear* (speech-act manner) | none; tone marks are prosody only ([speech-moves#tone-marks](speech-moves.md#tone-marks)) | missing | speech-moves.md | A `/y/` or `/th/` word for the speaker's manner of saying it | P2 |
| G-D25 | *fortunately / sadly* (evaluative sentence adverb) | none taught; same gap as G-D23 | missing | interests.md | Same pattern as G-D23 with a value / emotion root on `/th/` | P2 |

**Notes**

- The parser accepts any content root under `/th/` (`thozedem`) and `/w/` (`wumuzem`), and number `w~-e` / `h~-e`, but the docs teach none of these readings. So the fixes for G-D05/08/23 are mostly teaching, not new forms.
- Only *very* (`welem`, `m.w:very` on *elephant*) has a published `/w/` role English. There are no lexicon hits for *slightly, almost, barely, enough, quite, also, frankly*.
- In comparatives.md#degree, the heading says *much / slightly* but only *much* (`wogegal`) gets a form.
- The scratchpad `out.txt` / `s.txt` are shared, and other agents overwrote them mid-run. My parse checks used `D-sents.txt`. Every tested sentence parsed. The last two (manner scale, MAY) are taken directly from the docs.

### E. Clause combining

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| G-E01 | *and* (phrase / clause) | phrase `zazawan zululon zal vawalal`; clause `zazawan vawalal zululon vurunul xal` ([joins](../grammar/joins.md), [join-across-roles#vp-clause-forms](../grammar/join-across-roles.md#vp-clause-forms)); *and then* `xan` | covered | joins.md | — | — |
| G-E02 | *or* (exclusive / inclusive) | `xol` / `zol`; *and/or* `xaol` / `zaol` ([joins](../grammar/joins.md)) | covered | joins.md | — | — |
| G-E03 | *but* (clause) | linker `zazawan vawalal. xonugol zululon vurunul.` / softer `xezebal` ([dependents#sentence-linkers](../grammar/dependents.md#sentence-linkers)); in-clause `xezebal` also parses mid-sentence (`zazawan vawalal xezebal zululon vurunul`) | covered | dependents.md | — | — |
| G-E04 | *nor* / *neither … nor* | `zazawan zululon zul vawalal` (neither A nor B); clause `zazawan vawalal zululon vurunul xul` ([joins](../grammar/joins.md), negation distributes) | covered | joins.md | — | — |
| G-E05 | *either … or* | exclusive `zol` / `xol`; the English "either" emphasis is the closed **-l** | covered | joins.md | — | — |
| G-E06 | *both … and* | `zal`; *both ADJ* = set `a` + SHARED `/ɡ/` ([joins](../grammar/joins.md)) | covered | joins.md | — | — |
| G-E07 | *because* / *since* (reason) / *as* | `zazawan vawalal thurugum barl zululon velebel` ([dependents#dependent-clauses](../grammar/dependents.md#dependent-clauses), [causation#because](../grammar/causation.md#because)) | covered | causation.md | — | — |
| G-E08 | *if* (real / open conditional) | `zazawan vawalal thadorom barl zululon velebel` ([causation#dependent](../grammar/causation.md#dependent)) | covered | causation.md | — | — |
| G-E09 | *unless* (clause) | `thadorom burl` (parser change 2026-09-26) | covered | dependents.md#stand-in, causation.md#only-because | — | — |
| G-E10 | *although* / *even though* / *despite* | `hezebam barl …`; NP `hezebam bululon` ([dependents](../grammar/dependents.md#dependent-clauses)) | covered | dependents.md | — | — |
| G-E11 | *while* / *when* (same time) | `hegemum barl …`; phrase-time *when* via restrictor `hanunul hal` ([restrictors](../grammar/restrictors.md)) | covered | dependents.md | — | — |
| G-E12 | *while* / *whereas* (contrast) | linker `xezebal` after a full sentence ([dependents#sentence-linkers](../grammar/dependents.md#sentence-linkers)); no dependent contrast pole | covered | dependents.md | — | — |
| G-E13 | *until* | `hudumem barl …` | covered | dependents.md | — | — |
| G-E14 | *before* / *after* | `hababam barl …` / `helabam barl …` | covered | dependents.md | — | — |
| G-E15 | temporal *since* (*since Ululon left*, starting point up to now) | none taught; nearest `helabam barl` (*after*) loses "continuing until now"; hook `ul` is spatial *from* | missing | dependents.md | Add a *since* reading: `helabam` + open **-m**/restrictor `hual`, or hook `ul` on a `barl` clause (*from when …*); pick one and teach | P1 |
| G-E16 | *once* / *as soon as* | `helabam barl …` (*after*); immediacy unmarked | awkward | dependents.md | Immediate-after: `/w/` detail on `helabam` (e.g. haste root `wadazam helabam barl`) or teach `helabam` + `hal` | P2 |
| G-E17 | *whether* (embedded) | `zazawan vejel dorl zululon velebel` ([questions#embedded-whether](../grammar/questions.md#embedded-whether)) | covered | dependents.md | — | — |
| G-E18 | restrictive relative (*the guard who sits*) | two sentences + resume: `zugugal vajul. zazawan bugur vezehel.` ([dependents#which-noun](../grammar/dependents.md#which-noun)); one-place kind via role compound `dodogol gaxajul` | covered | dependents.md | — | — |
| G-E19 | non-restrictive relative (*Azawan, who walks, sings*) vs restrictive | restrictive = two sentences / role compound; non-restrictive = aside `th(…)` | covered | dependents.md#which-noun-intermediate | — | — |
| G-E20 | object-gapped relative (*the dog that Azawan sees runs*) | two sentences: `zazawan dodogol vejel. zodor vurunul.` | covered | dependents.md | — | — |
| G-E21 | *whose* | `zodogol goborum bugur` | covered | dependents.md#which-noun-intermediate | — | — |
| G-E22 | *where* relative (*the house where Azawan sleeps*) | two sentences + hook: `zazawan velebel al bohohul. zululon vuzunul al bohor.`; kind *sleep-place* = role compound `e x ROOT` (`gexelebel`) ([roles](../grammar/roles.md#role-compounds)) | covered | dependents.md | — | — |
| G-E23 | *when* relative (*the day when …*) | two sentences + time `/h/`; no pattern taught for resuming a time | awkward | dependents.md | Teach resume on a time noun in `/h/` (or `har`-style restrictor) as the *when*-relative pair | P3 |
| G-E24 | free relative *whoever* / *whatever* (generic) | `zual gaxawalal vuzunul.` | covered | joins.md#universals-domains-generics | — | — |
| G-E25 | free relative *what* (*I see what Azawan sees*) | none taught; `dar` is *something*; two sentences need a named thing | missing | dependents.md | Allow unspecified-member `dar` + next sentence resuming it (`dar` … `dor`?) or patient role compound `duxejer` (*the thing seen*) | P2 |
| G-E26 | *that*-clause as object | `zazawan bululon vezehel darl zodogol vurunul.` | covered | dependents.md | — | — |
| G-E27 | *that*-clause as subject / adjective complement (*That he left surprised me*; *happy that*) | subject: stand-in in other roles `zarl` ([dependents#stand-in-roles](../grammar/dependents.md#stand-in-roles), advanced; `zazawan zarl vuzunul` parses) ; *happy that* = `thurugum barl` | covered | dependents.md | — | — |
| G-E28 | infinitive complement (*wants / decides to walk*, *tells X to sit*) | `darl` + repeated subject (`zazawan vuzunul darl zazawan vawalal`); directive `derl` (`zazawan bululon vezehel derl vajul`); *decline to* `vuon` | covered | dependents.md | — | — |
| G-E29 | gerund (*sees walking*, *enjoys swimming*) | verb root under `/d/` as noun (`zazawan dawalal vejel`) or `darl` + clause | covered | clause.md | — | — |
| G-E30 | reported speech (indirect / direct) | indirect `darl` (`zazawan bululon vezehel darl …`); direct wording = [spans](../grammar/spans.md) | covered | dependents.md | — | — |
| G-E31 | reported yes/no question (*asks whether*) | `zazawan bululon vezehel dorl zululon velebel.`; lexical *question…* `vorn` | covered | dependents.md | — | — |
| G-E32 | reported wh-question (*asks who walks*, *knows what Ululon sees*) | `zazawan vezehel dorl zar vawalal.` | covered | questions.md#reported-questions | — | — |
| G-E33 | *so that* / *in order to* / *so as not to* | `holalam barl …` / `holalam burl …` ([dependents#so-that](../grammar/dependents.md#so-that)) | covered | dependents.md | — | — |
| G-E34 | result *so … that* / *such … that* (*so tired that he slept*) | two sentences + `xezazam` (*therefore*): `zazawan vawalal. xezazam zululon vajul.`; degree→result link not expressible in one clause | awkward | dependents.md | Result pole on `/h/` from the *therefore* root: `hezazam barl` (outcome follows; parses, unassigned) | P2 |
| G-E35 | *only if* / *iff* | `theberom barl` / `thezazem barl` ([causation#only-if](../grammar/causation.md#only-if)) | covered | causation.md | — | — |
| G-E36 | *even if* (concessive conditional) | `hezebam thadorom barl` (parser change 2026-09-26) | covered | causation.md#only-because | — | — |
| G-E37 | hypothetical / remote conditional (*If Ululon slept, Azawan would walk*) | open `thadorom barl` + optional stance inside dependent (`zululon th- velebel`, unlikely) or PREDICT `thelezom`; remoteness not taught as a pattern | awkward | causation.md | Teach `th-` / `th+N` inside the `barl` clause as the "remote" conditional | P3 |
| G-E38 | counterfactual (*If Ululon had left, the door would still be locked*) | bookmark `hobomam barl` + RESIDUE/PREDICT (`zadorol gologel thonenom thelezom hobomam barl zululon vebarul`) ([causation#factivity](../grammar/causation.md#factivity)); contrary-to-fact itself unmarked | awkward | causation.md | Mark the unreal condition with imaginary `th-e-` inside the dependent (`thadorom barl zululon th-e- vebarul`, parses) — reuse of *as if* | P2 |

**Notes**

- Parser is permissive about hosted pole overlays: unassigned `hezazam barl` and `thezebam barl`, and the two-pole stack `hezebam thadorom barl`, all parse. Good for proposals, but the build check will not catch misuse of un-inventoried pole forms.
- `thadorom burl` parses although [dependents#stand-in](../grammar/dependents.md#stand-in) says `holalam burl` is "the one exception" to `barl` after a pole — the parser does not enforce that restriction.
- `xezebal` placed mid-sentence as a clause join (`zazawan vawalal xezebal zululon vurunul`) parses, though docs teach linkers only after a period; a trailing linker (`… barl zululon velebel xezebal.`) fails.
- Causation.md (factivity) says *if he had* is `hobomam` with **no** `thadorom`, while a counterfactual is still a condition; learners get no marker that the condition is false, only a moved "now".
- Restrictors page line ~325 says *when* + clause is "`/h/` pole + `barl`" but names no *when* pole; `hegemum` is taught only as *while* (same time).
- `zar` standalone parses as a declarative subject (*someone walks*); no doc says whether `-r` blanks outside `yol` mean *someone* vs *whoever*.

### F. Information structure

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| G-F01 | topicalization by fronting (*A cat, Azawan sees*) | free order, leftmost content word highlighted: `dagadal zazawan vejel.` ([clause#word-order-emphasis](clause.md#word-order-emphasis)) | covered | clause.md | — | — |
| G-F02 | *as for X* / *regarding X* topic | `hozam bazawan zululon dagadal vejel.` ([clause#as-for](clause.md#as-for)) | covered | clause.md | — | — |
| G-F03 | object / adverb cleft (*It's a cat that Azawan sees*) | object-first order `dagadal zazawan vejel.` ([clause#word-order-emphasis](clause.md#word-order-emphasis)) | covered | clause.md | — | — |
| G-F04 | subject cleft (*It was Azawan who saw the cat*, contrastive) | `&zazawan dagadal vejel.` | covered | clause.md#word-order-emphasis | — | — |
| G-F05 | pseudo-cleft (*What Azawan does is see a cat*; *A cat is what he sees*) | verb-first / object-first order: `vejel zazawan dagadal.` ([clause#word-order-emphasis](clause.md#word-order-emphasis)) | covered | clause.md | — (*what I want is…* blocked only by missing *want* root: lexicon item, not grammar) | — |
| G-F06 | existential *there is / there are* (*There is a dog near the bank*) | lone noun (optionally + `/ɡ/` on a new common noun) asserts existence: `zodogol.` *There is a dog*, `zodogol gelem.` *There is a big dog*; a hook adds where ([predication#existence](../grammar/predication.md#existence)) | covered | predication.md | — | — |
| G-F07 | negative existential (*There is no dog here*) | lone-noun existence ([predication#existence](../grammar/predication.md#existence)) + deny join gives `zodogol zul.`, but joins.md teaches that as *not a dog* / *No dog.*, and no page states the *there is no* reading | awkward | predication.md, joins.md | State that a lone denied noun is the negative existential (`zodogol zul om banabal.` *there is no dog near the bank*) | P1 |
| G-F08 | extraposition (*It is hard to walk*; *It's good that Ululon sits*) | `gomonam zarl zazawan vawalal.` | covered | dependents.md#stand-in-roles | — | — |
| G-F09 | contrastive focus (*Azawan sees the DOG*) | tone mark `&`: `zazawan vejel &dodogol.` ([speech-moves#tone-marks](speech-moves.md#tone-marks)); or fronting | covered | speech-moves.md | — | — |
| G-F10 | contrastive correction (*not a dog but a cat*) | two sentences with join: `zazawan dodogol vejel. zululon dodogol zul vejer.`; hooks *rather / instead* ([hooks](hooks.md)) | covered | hooks.md | — | — |
| G-F11 | VP ellipsis *so do I* / *me too* | verb resume: `zodogol vawalal. zugobon vawar.` ([pronouns](pronouns.md) Intermediate `/v/ … -r` = *do so*) | covered | pronouns.md | — | — |
| G-F12 | bare *me too* (no verb) | `zugobon zam.` parses but is untaught; taught route needs the verb resume (G-F11) | extension candidate | pronouns.md, joins.md | Consider teaching subject + `zam` / `zal` fragment after a claim as *me too* (add-join reading is guessable) | P3 |
| G-F13 | *neither does she* / *me neither* | `zululon vawalal vul. zugobon vawar vul.` (verb resume + verb join `vul`, [join-across-roles](join-across-roles.md)) | covered | pronouns.md | — | — |
| G-F14 | gapping (*Azawan sees a dog, and Ululon a cat*) | verb resume keeps it short: `zazawan dodogol vejel. zululon dagadal vejer.` Verbless `zululon dagadal.` parses but is untaught (and a lone noun + `/ɡ/` already reads as existence or property — [predication#existence](../grammar/predication.md#existence)) | covered | pronouns.md | — (state that verbless subject + object is not gapping: an object needs a verb) | — |
| G-F15 | pro-form *do so / do that* | `/v/ … -r`: `zazawan vajul. zululon vajer.` ([pronouns](pronouns.md)) | covered | pronouns.md | — | — |
| G-F16 | pro-form *one* (*a blue one*, *I want the red one*) | `zululon dar godor gelulul vejel.` | covered | pronouns.md#cross-role-recast | — | — |
| G-F17 | *so / not* as answer (*I think so / I don't think so*) | polar stance `yaem` / `yuem` ([questions#polar-stance](questions.md#polar-stance)) | covered | questions.md | — | — |
| G-F18 | clausal pro-form *so* in a complement (*Azawan says so*, *I hope so*, *I told you so*, *I hope not*) | none for a prior plain clause: `darr` fails to parse; span resume `d[=]` only works if the earlier content was a span ([spans](spans.md)); `darn` = *a statement*, not *that one*; `zululon vaen xar` is untaught | missing | dependents.md | Stand-in resume: stand-in + **-r** (e.g. `darr` / `dorr` / `durr`) = *that same content* (most recent claim); negative *not* via `u` vowel or `darr zul` — guessable from resume **-r** | P2 |
| G-F19 | ellipsis with modal / ability (*Azawan can sing and so can I*) | verb resume `vuzunur` drops the ability; would need `x` ability on the resume, not taught ([intention#incapability](intention.md#incapability)) | awkward | intention.md, pronouns.md | State whether ability **`x` + vowel** may sit on a resumed verb (`/v/ … -r` stem) or on `egera`; add example | P3 |

**Notes**

- Verbless clauses: lone noun (+ `/ɡ/`) = existence or property ([predication#existence](../grammar/predication.md#existence)); subject + object is rejected (an object needs a verb). Open: negative existential (G-F07).
- `zarl` (subject stand-in) parses with predicative `/ɡ/` (`gomonam zarl zazawan vawalal.`), but dependents.md never shows a `/z/` stand-in; the Advanced "other roles" section only illustrates `-rn` lexicalized forms and `/v/`.
- Subject focus can't use fronting (subject already default-first), so English subject clefts rely on `&` prosody only — worth one sentence in clause.md.
- No *want* root in the published lexicon (`lexicon-search want` → no match); log as lexicon gap, blocks the natural *what I want is…* example.

### G. Comparison and quantity

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| G-G01 | comparative *X is bigger than Y* | rank join `e` + shared `/ɡ/`: `zazawan zululon zel gelem.` ([comparatives#comparatives](comparatives.md#comparatives)) | covered | comparatives.md | — | — |
| G-G02 | *less … than* | reverse rank `ue`: `zazawan zululon zuel gelem.` ([comparatives#comparative-arity](comparatives.md#comparative-arity)) | covered | comparatives.md | — | — |
| G-G03 | superlative *the biggest* / *the least big* | single-item `zazawan zel gelem.` / `zazawan zuel gelem.` ([comparatives#superlatives](comparatives.md#superlatives)) | covered | comparatives.md | — | — |
| G-G04 | *much / slightly more* | `/w/` before scale: `zazawan zululon zel wogegal gelem.` ([comparatives#degree](comparatives.md#degree)) | covered | comparatives.md | — | — |
| G-G05 | measured gap *two meters taller* | measure `/b/` on scale: `zazawan zululon zel godowem bedurem g+2.` ([comparatives#measured-differentials](comparatives.md#measured-differentials)) | covered | comparatives.md | — | — |
| G-G06 | manner comparative *walks more intensely than* | `/h/` right after join: `zululon zazawan zel hohogem vawalal.` ([comparatives#manner-scale](comparatives.md#manner-scale)) | covered | comparatives.md | — | — |
| G-G07 | factor comparative *twice as big as* / *three times faster* | none taught; `zazawan zululon zel gelem h+2.` parses but `h+2` reads as clause *two times*, not the ratio | missing | comparatives.md | Allow a free `h+N` (factor adverb, [numbers#number-as-adverb-by-marker](numbers.md#number-as-adverb-by-marker)) immediately after the shared scale as the ratio, parallel to measured-differential `/b/`; `ae` + `h+2` = *twice as big as* | P2 |
| G-G08 | verb-degree / frequency comparative *runs more (often) than* | digitless `h+` after the rank join: `zazawan zululon zel h+ vawalal.` ([comparatives#frequency-scale](../grammar/comparatives.md#frequency-scale)) | covered | comparatives.md | — | — |
| G-G09 | quantity comparative *more cats than dogs* / *fewer* | `g+` amount scale: `zagadalx zodogolx zel g+.`; rough `g~+`; difference `zel g+ b+3` ([comparatives#amount-scale](../grammar/comparatives.md#amount-scale)) | covered | comparatives.md | — | — |
| G-G10 | equative *as big as* / *about as big as* | `zazawan zululon zael gelem.` / `zaem` ([comparatives#equatives](comparatives.md#equatives)) | covered | comparatives.md | — | — |
| G-G11 | *the same height / age as* | equative on the dimension: `zazawan zululon zael godowem.` ([comparatives#equatives](comparatives.md#equatives)) | covered | comparatives.md | — | — |
| G-G12 | *same* = identity *Ululon is the same person as Azawan* | `zululon gonunul bazawan.` ([predication#identity](predication.md#identity)) | covered | predication.md | — | — |
| G-G13 | *same* = shared referent *we read the same book* / *the same one again* | only resume **-r** on a noun (object-slot token resume) or **`SAME`** + `/b/` inside NP; no taught pattern for "same X" across two subjects | awkward | predication.md | Teach NP `dX gonunul` + resume `/b/` (or a collective-subject pattern) for *the same X* in a shared-referent sentence | P1 |
| G-G14 | *different (from)* = not the same one | `zululon gonunul bazawan gul.` ([predication#same-endings](predication.md#same-endings)) | covered | predication.md | — | — |
| G-G15 | *different* = unlike in kind / quality (*a different kind of house*, *Azawan is different from Ululon*) | `zazawan gurorom bululon gul.` | covered | predication.md#different | — | — |
| G-G16 | *similar / like* | similative: `zohohul gurorom bazawan.` ([relations#similative](relations.md#similative)) | covered | relations.md | — | — |
| G-G17 | reciprocal *similar to each other* / *they look alike* | no reciprocal route for similative (`/b/` needs a model) | awkward | relations.md | Allow similative over a set subject with resume/set `/b/` for *alike*; coordinate with group B reciprocal row | P2 |
| G-G18 | *more than N* / *fewer than N* | single-item threshold: `zagadalx g+5 guel vawalal.` / `g+5 gel` ([numbers-applied#numeric-thresholds](numbers-applied.md#numeric-thresholds)) | covered | numbers-applied.md | — (note: `e` = *less than* is counter-intuitive for learners; English *more than* uses `ue`) | — |
| G-G19 | *at least N* (≥) | sequence ray **`oe`** is inclusive: `z+5 zoel` *5 or more*; modifier `g+5 goel` ([numbers-applied#numeric-thresholds](../grammar/numbers-applied.md#numeric-thresholds)) | covered | numbers-applied.md | — | — |
| G-G20 | *at most N* (≤) | reversed-sequence ray: `z+5 zeol` *5 or fewer* ([numbers-applied#numeric-thresholds](../grammar/numbers-applied.md#numeric-thresholds), [joins#reversed-sequence-eo](../grammar/joins.md#reversed-sequence-eo)) | covered | numbers-applied.md | — | — |
| G-G21 | *approximately / about N* | number **-m**: `zagadalx g~+5 vawalal.` ([numbers#number-endings](numbers.md#number-endings)) | covered | numbers.md | — | — |
| G-G22 | *approximately* on a non-number (*roughly equal*, *about the same*) | `zaem` equative; `gonunum` (*basically the same*) | covered | comparatives.md, predication.md | — | — |
| G-G23 | percent *25% of the cats* | `zagadalx g+25% vawalal.` ([numbers-applied#percent-denominators](numbers-applied.md#percent-denominators)) | covered | numbers-applied.md | — | — |
| G-G24 | fractions *half / a third of the cats* | `g-N` after a plain noun: `zagadalx g-2 vajul.` *half of the cats* ([numbers-applied#fractions](../grammar/numbers-applied.md#fractions)) | covered | numbers-applied.md | — | — |
| G-G25 | ratios / rates *one in three*, *3 to 1*, *per hour* | *every Nth* via `h-N`; no ratio or per-unit route taught | missing | numbers-applied.md | Teach *per unit* as measure `/b/` with inverse `h-` amount, and *N in M* as percent/fraction; P2 for per-unit rates | P2 |
| G-G26 | *each … respectively* (A and B got X and Y respectively) | none; parallel joins have no pairing marker | missing | joins.md | Pair two equal-length same-order lists by a marked join ending or a hook (e.g. rank `e` fence on both lists = *in order*); needs design | P3 |
| G-G27 | distributive *apiece* / *each* with a count (*they each got three*; *three apples apiece*) | singular verb leaves collective vs distributive open ([plurality#verbs-v](plurality.md#verbs-v)); no marker for per-member count | missing | plurality.md | Add a distributive counterpart to verb **-x** collective (e.g. marked count scope *per member*), or teach `h-` / set-join `a` distributive reading on the count | P2 |
| G-G28 | distributive *both are ADJ* | set join `a` + shared `/ɡ/`: `zazawan zululon zal gelem.` ([comparatives#distributive-both](comparatives.md#distributive-both)) | covered | comparatives.md | — | — |

**Notes**

- The parser accepts `zazawan zululon zel gelem h+2.` and `zazawan zululon zel h+ vawalal.` with no taught reading — parse success is not evidence of coverage for G-G07 / G-G08.
- Threshold direction: single-item `z+5 zel` = *less than 5* and `zuel` = *greater than 5* (numbers-applied#numeric-thresholds) runs opposite to the comparative intuition (`zel` = *more*); learners will likely reverse it. Worth a Phase 4 look.
- `godogolr` alone fails to parse (`/ɡ/` + **-r** "of that kind" needs a following word), so no quick *same kind* route was tested.
- `h-N` is taught as *÷N / into N parts / every Nth* on `/h/` only; no `/ɡ/` fraction reading exists, which is why G-G24 is awkward despite the marker being close.

### H. Discourse and speech acts

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| G-H01 | greeting / goodbye (*hi*, *bye*) | speaker's named citation `azawan.` ([word-endings#greeting](../grammar/word-endings.md#greeting)); call the other with `yululon.` | covered | word-endings.md | — | — |
| G-H02 | greeting to someone whose name you don't know / group greeting (*hi all*) | none taught; `yedonenx.` (listener -x) only calls them | awkward | word-endings.md / speech-moves.md | allow `/y/` + **`edone`** / **`aha`** + **-n** as a conventional greeting, or teach `yahan.` as *hello, all of us* | P2 |
| G-H03 | thanks (*thank you*, *thanks for the gift*) | a lone met `/th/` value is the thanks: `thonogotham.`; interest root says what for, ending = appreciation channel — [values#thanks-sorry](../grammar/interests.md#thanks-sorry) | covered | interests.md | — | — |
| G-H04 | apology (*sorry*, *I apologize*) | unmet `/th/` value + `/b/` owner of the interest: `thonogothum bedonen.`; changeability grades it (**-l** deep / **-m** default / **-r** *my bad*) — [values#thanks-sorry](../grammar/interests.md#thanks-sorry) | covered | interests.md | — | — |
| G-H05 | softened request (*please…*, *could you…*) | **`yem`**: `yem vawalal.` ([speech-moves#speech-act](../grammar/speech-moves.md#speech-act)); gentle ask **`yom`** | covered | speech-moves.md | — | — |
| G-H06 | firm request / command / prohibition | **`yel`** / **`yul`**, emphatic `yul yul vazanal.` ([speech-moves#emphatic-prohibition](../grammar/speech-moves.md#emphatic-prohibition)) | covered | speech-moves.md | — | — |
| G-H07 | offer of a thing (*want some?*, *how about X?*) | single-item open join under question (`…am` / `…om`) ([questions](../grammar/questions.md#yes-no-single-item-standalone)); accept/refuse `yaol` / `yuol` | covered | questions.md | — | — |
| G-H08 | offer to act (*shall I…?*, *let me help*) | `yom zugobon vawalal.` (soft question, self subject); warrant **`the…m`** *offered* on the act ([values#interest-force](../grammar/interests.md#interest-force)) | covered | speech-moves.md / interests.md | — | — |
| G-H09 | suggestion (*why don't we…*, *let's…*) | inclusive we + soft request/question: `yem zahan vawalal.` / `yom zahan vawalal.`; firm *let's* `yel zahan vawalal.` ([pronouns](../grammar/pronouns.md)) | covered | speech-moves.md | — | — |
| G-H10 | asking permission (*may I…?*, *is it OK if…*) | `yom zugobon vajul therenem.`; *is it OK with you* = consent `thuxerenem` — [values#permission](../grammar/interests.md#permission), [values#consent](../grammar/interests.md#consent) | covered | interests.md | — | — |
| G-H11 | granting permission (*you may*, *go ahead*) | `yaol.` in reply to a permission ask; declarative `…therenem.` — [values#permission](../grammar/interests.md#permission) | covered | interests.md | — | — |
| G-H12 | promise (*I promise to…*) | plan + locked decision: `zugobon themabam thehegel vawaral bedonen.` ([intention#decision](../grammar/intention.md#decision)); states resolve, not an obligation to the listener | awkward | intention.md | commitment stance from **`abene`** *commitment* (`thabenem`, -l binding / -m open) or a **`yal`**-series act for commissives | P2 |
| G-H13 | warning (*watch out!*, *careful!*) | interjection `yawarun.` (*Warning!*) / `yulonen.` (*Danger!*) ([speech-moves#interjections](../grammar/speech-moves.md#interjections)); advice with offered warrant `yel zedonen vawalal thuhuhethem.` ([values#interest-force](../grammar/interests.md#interest-force)); `yul yul` for danger | covered | speech-moves.md | — | — |
| G-H14 | backchannel *uh-huh* / *right* / *got it* | polar stance `yaem.` / `yael.` (*yeah / got it*) ([questions#polar-stance](../grammar/questions.md#polar-stance)) | covered | questions.md | — | — |
| G-H15 | backchannel *oh* (news receipt, change of state) | `yuruzen.` is *Surprise!*, too strong; `yael.` loses "news to me" | missing | speech-moves.md / questions.md | teach a receipt polar (e.g. soft `yaem` vs a new-info particle); or a conventional interjection `y…n` for *I see* | P1 |
| G-H16 | backchannel *hmm* / *I'm listening* (continuer) | none; bare `yom.` parses (*…?*) but undefined as continuer | missing | speech-moves.md | define bare act words (`yam.` / `yom.`) as continuers: *go on* / *hmm?* | P2 |
| G-H17 | hedge on a class / adjective (*kind of a dog*, *sort of big*) | `/w/` hedge: `zazawan wagadum godogol.` ([predication](../grammar/predication.md)); **-m** on joins/numbers for *about* | covered | predication.md / clause.md | — | — |
| G-H18 | hedge on a verb (*kind of walked*) | `zazawan vawalal hagadum.` parses but only `/w/` hedge is taught | awkward | clause.md | teach `/h/` **`agadu`** (-m) as verb-degree hedge alongside `/w/` | P2 |
| G-H19 | hedge on the whole claim (*I guess*, *I think*, *sort of*) | soft statement `yam …`; MAY `thodohom zazawan vawalal.` ([knowing#may](../grammar/knowing.md#may)); soft polar `yaem`; tone `?` | covered | speech-moves.md / knowing.md | — | — |
| G-H20 | *anyway* (return from digression / dismiss prior) | none; `xezebal` *however* is contrast, not topic return | missing | hooks.md#discourse-hooks | discourse hook **-r** (`ar …` = resume the main line; parser rejects `ur` today) — resume reading fits **-r** | P1 |
| G-H21 | *actually* (correcting expectation) | `ol …` | covered | hooks.md#discourse-hooks | — | — |
| G-H22 | *by the way* (aside) | aside span `thexal … xuxul` ([spans](../grammar/spans.md)) is a nested aside, not a new topic turn | awkward | spans.md / hooks.md | teach aside open at sentence start as *by the way* (or `am …` *additionally, and maybe more*) | P2 |
| G-H23 | *well* (hesitation / dispreferred reply opener) | none; soft `yam` / `yaom` approximates | missing | speech-moves.md | define a filler: soft polar `yaom` as *well…* opener, or a spoken hesitation word | P2 |
| G-H24 | *so* (consequence) | `xezazam` *therefore* ([dependents#sentence-linkers](../grammar/dependents.md#sentence-linkers)) | covered | dependents.md | — | — |
| G-H25 | *so* (topic launch / *so, what happened?*) | none; `xuvumul` *next* partial | awkward | dependents.md / hooks.md | pair with G-H20 (`ar` resume) or note `xuvumul` as *so, next* | P3 |
| G-H26 | *besides* / *moreover* | discourse hook `al …` *additionally* ([hooks#discourse-hooks](../grammar/hooks.md#discourse-hooks)) | covered | hooks.md | — | — |
| G-H27 | *in fact* (strengthening prior) | `al …` adds but does not escalate; `el …` rephrases | awkward | hooks.md | reading for a rank-upward discourse hook (e.g. `ael …` *even more so*), or teach `el` + `!` | P2 |
| G-H28 | *on the other hand* | `xezebal` *however* ([dependents#sentence-linkers](../grammar/dependents.md#sentence-linkers)) | covered | dependents.md | — | — |

**Notes**

- Parser is permissive beyond the docs: `yonogotham.`, `yonogothum.` (values on `/y/`), `zugobon thabenem …` (non-stance root on `/th/`), `zedonen vawalal gerenem`, `hagadum`, and bare `yom.` all parse though none is taught. Verdicts treat them as untaught.
- `th( zululon vawalal ).` fails (spaces inside the fence); `thexal … xuxul` works.
- Discourse hooks accept only `a/e/o/u` + **-l/-m** (`ur …` fails); the **-r** column is unused and has an intuitive *resume* reading (G-H20).
- The speech-act system is rich for directives (`yel/yem/yul/yum`) but has no expressive (thanks/sorry) or commissive (promise) act; values-on-`/y/` would fill both from existing morphology.
- Interjection `/y/` + **-n** is productive per speech-moves, so `yawarun` / `yulonen` count as covered, but no conventional interjections other than `yuruzen` are listed.

### I. Deixis and reference

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| G-I01 | 1st / 2nd person singular *I* / *you* | `zugobon dedonen vejel.` *I see you*; names preferred ([pronouns#special-pronouns](pronouns.md#special-pronouns)) | covered | pronouns.md | — | — |
| G-I02 | inclusive *we* (you and I) | `zahan vajul.` ([pronouns#special-pronouns](pronouns.md#special-pronouns)) | covered | pronouns.md | — | — |
| G-I03 | exclusive *we* / plural *you (all)* | `zugobonx vajul.` / `zedonenx vajul.` ([plurality#clusivity](plurality.md#clusivity)) | covered | plurality.md | — | — |
| G-I04 | 3rd person *he / she / it / they* (anaphoric) | resume **-r**: `zodogol vawalal. zodor vajul.` ([pronouns#resume-r](pronouns.md#resume-r)); no gender / animacy, by stem match | covered | pronouns.md | — | — |
| G-I05 | 3rd person on first mention with no antecedent (*he* for someone visible but unnamed) | noun + `om bedonen` / `om bugobon` (*that person by you*) — [hooks#deixis](../grammar/hooks.md#deixis); names preferred | covered | pronouns.md | — | — |
| G-I06 | *here* | `om bugobon` *here*, `om bedonen` *there (by you)*, `om bahan` *here with us*, `um bahan` *over there* — [hooks#deixis](../grammar/hooks.md#deixis) | covered | hooks.md | — | — |
| G-I07 | *there* (anaphoric, place already named) | `zazawan vawalal ol bazadol. zululon vajul ol bazar.` resume **-r** on `/b/` ([pronouns#resume-r](pronouns.md#resume-r)) | covered | pronouns.md | Add an explicit *there* example to the slot table | P3 |
| G-I08 | *now* (speech time) | zero offset on a two-way channel: `zululon thunevem bohoram g+0 velebel.`; `bunuzem g+0` *today* — [knowing#now](../grammar/knowing.md#now) | covered | knowing.md | — | — |
| G-I09 | *then* (anaphoric time) | `/h/` resume: `zazawan velebel hanunul. zululon vajul hanunur.` ([pronouns#cross-role-inventory](pronouns.md#cross-role-inventory)) — needs a prior `/h/` antecedent | covered | pronouns.md | — | — |
| G-I10 | *then* (next in sequence) | `xan`: `zazawan vawalal. xan zululon vajul.` ([join-across-roles#sequence](join-across-roles.md#sequence)) | covered | join-across-roles.md | — | — |
| G-I11 | *this / that* (anaphoric, *that one*) | resume **-r** ([pronouns#intermediate](pronouns.md#intermediate)): `zululon vejel daboger.`; spans `d[=]` for quoted text | covered | pronouns.md | — | — |
| G-I12 | *this* vs *that* (proximal / distal contrast, pointing) | same as G-I06 — [hooks#deixis](../grammar/hooks.md#deixis) | covered | hooks.md | — | — |
| G-I13 | *such* / *so* (property deixis) | `/ɡ/` / `/w/` resume **-r** ([pronouns#intermediate](pronouns.md#intermediate)) | covered | pronouns.md | — | — |
| G-I14 | *come* | motion + `oel bugobon` / `oel bedonen` — [hooks#deixis](../grammar/hooks.md#deixis); still manner-specific (no generic *go* root) | covered | hooks.md | — | — |
| G-I15 | *go* | motion + `ul bugobon` (*go away*) or `oel` + goal — [hooks#deixis](../grammar/hooks.md#deixis) | covered | hooks.md | — | — |
| G-I16 | *bring / take* | `zazawan dabogol vawalal oel bugobon.` (*walks the book toward me*) — object on an intransitive motion root; no *carry* root | awkward | hooks.md | Carry root in lexicon + deictic hook (`oel bugobon` *bring*, `ul bugobon` *take away*) | P2 |
| G-I17 | generic *you / one / they* (people in general) | `zuam geberel velebel.` soft generic ([joins#universals-domains-generics](joins.md#universals-domains-generics)); ordinary everyday register feels heavy | covered | joins.md | Consider teaching a short pointer from pronouns.md (*you* / *one* in general ≠ `edone`) | P3 |
| G-I18 | impersonal *they* (*they say…*, unknown agents) | `zenenunx`? not taught; evidential **told** `eraram` + `/th/` covers *they say* ([knowing#evidentiality](knowing.md#evidentiality)); agent *they* = `zenenun` / `zar` | covered | knowing.md | — | — |
| G-I19 | *someone / something* | `zenenun` ([pronouns#special-pronouns](pronouns.md#special-pronouns)); `zar` ([joins#unspecified-member-r-phrase](joins.md#unspecified-member-r-phrase)) | covered | pronouns.md, joins.md | Clarify `zenenun` vs `zar` overlap on one page | P3 |
| G-I20 | *anything / anyone* | `zor vawalal.` ([joins](joins.md#unspecified-member-r-phrase)) | covered | joins.md | — | — |
| G-I21 | *nothing / nobody* | `zal vawalal.` ([joins](joins.md)) | covered | joins.md | — | — |
| G-I22 | *everything / everybody* | `zual vawalal.`; *everyone* as a kind `zual geberel` | covered | joins.md | — | — |
| G-I23 | *something else / someone else* | `zur` ([joins](joins.md#unspecified-member-r-phrase)) | covered | joins.md | — | — |
| G-I24 | *somewhere / anywhere / nowhere / everywhere* | `ol bar` / `ol bur` / `ol bal` / `ol bual` | covered | hooks.md#place-indefinites | — | — |
| G-I25 | *sometime / never / always / anytime* | `har` / `hal` / `hual` / `hor` ([restrictors](restrictors.md)) | covered | restrictors.md | — | — |
| G-I26 | anaphora across sentences (tracking several referents) | short / full-root **-r**, most-recent match; `xazar` going-back; cross-role recast ([pronouns#resume-r](pronouns.md#resume-r), [#going-back-to-a-thread](pronouns.md)) | covered | pronouns.md | — | — |
| G-I27 | anaphora to a whole previous clause (*that* = what just happened) | `/x/` resume `…-r` and spans; no plain noun-slot *that (event)* taught from a clause antecedent ([pronouns#antecedent-was-j-or-x](pronouns.md)) | awkward | pronouns.md | Teach a clause-antecedent noun pointer (e.g. `dar`-like stand-in pointing **back**) with an example | P2 |
| G-I28 | person shift across speakers (my *I* = your *you*) | `ugobo` / `edone` are role-relative per turn; names preferred | covered | pronouns.md | — | — |
| G-I29 | reflexive *myself / herself* (reference aspect) | `zazawan vejel dazar.` | covered | pronouns.md#resume-r | — | — |

**Notes**

- Parser accepts resume **-r** with no antecedent anywhere in the text (`zazawan vawalal hogobor.`), so it gives no warning when a learner writes a deictic "that one" with no antecedent (G-I05).
- `bar` after a hook is taught only as fill-ask *where?*; outside a question the same string would be *somewhere* by the join rule. The docs never state which wins in an assertion (G-I24).
- Neither the lexicon nor english.md has *here, there, now, come, go, bring, take, carry*; every deictic motion / place / time job depends on untaught hook + `ugobo` / `edone` combos.
- `zenenun` (*someone*) and `zar` (*something / someone*) overlap; pronouns.md and joins.md do not cross-reference the difference.
- G-I29 overlaps group B (reflexive); G-I05 / G-I12 overlap group C (demonstratives).

### J. Time, place, and manner phrases

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| G-J01 | *in* (containment) | hook `al` + `/b/`: `zodogol velebel al bohohul.` — [hooks#extra-noun](hooks.md#extra-noun) | covered | hooks.md | — | — |
| G-J02 | *on* (surface) | hook `aol` + `/b/`: `zabogol vajul aol bajul.` — [hooks#extra-noun-intermediate](hooks.md#extra-noun-intermediate) | covered | hooks.md | — | — |
| G-J03 | *under* / *below* | `hodowol berel` | covered | roles.md#viewpoint-vs-landmark | — | — |
| G-J04 | *above* / *over* (vertical) | `gubal berel` | covered | roles.md#viewpoint-vs-landmark | — | — |
| G-J05 | *behind* / *in front of* | landmark's own facing: `gojuthohohul bohohur` (DIR `th` ANCHOR + resumed landmark), or viewer-relative `gojuthazawan bohohul` — [roles#viewpoint-laterals](roles.md#viewpoint-laterals). Long; intrinsic-front case (*behind the house*) not taught, only *Azawan's left of the tree* | awkward | roles.md | Teach intrinsic front: bare-ahead/back DIR + `/b/` landmark = the landmark's own front/back (or a short `th` + resume pattern) | P1 |
| G-J06 | *between* | `hazanum` + `/b/` join: `zululon vajul hazanum badadul bazadol bal.` — [relations#locative-relations](relations.md#locative-relations) | covered | relations.md | — | — |
| G-J07 | *near* / *by* (place) | hook `om`: `zululon vajul om bazadol.` — [hooks#extra-noun-intermediate](hooks.md#extra-noun-intermediate); english.md *by* | covered | hooks.md | — | — |
| G-J08 | *across* (to the other side) | `uol` *through* / `uom` *by way of*: `zazawan vawalal uol burudel.` Loses the "side to side / other side" sense | awkward | hooks.md | Consider a stacked-vowel or `-m` reading for traversal-to-far-side, or teach `uol` + `urude` *span* idiom | P2 |
| G-J09 | *through* | hook `uol`: `zazawan vawalal uol bohohul.` | covered | hooks.md | — | — |
| G-J10 | *toward* | hook `oel`: `zazawan vawalal oel badadul.` | covered | hooks.md | — | — |
| G-J11 | *during* + NP | `hegemum bunerol` | covered | dependents.md#dependent-clauses | — | — |
| G-J12 | *before* / *after* + NP | `hababam` / `helabam` + `/b/` | covered | dependents.md#dependent-clauses | — | — |
| G-J13 | *since* (continuous from a point) | `helabam` *after* + `/b/` (`zazawan vajul helabam bunerol.`) — loses "and still ongoing"; none taught | missing | dependents.md | Stack *after* with a continuing aspect, or propose `ul` *from* on a time `/b/` (`ul b_#22,7`) = *since* — intuitive extension of source hook to time | P1 |
| G-J14 | *by* (deadline) | english.md: clock `/h/` or `hudumem barl` *until* — neither means "no later than" | awkward | numbers-applied.md | Use `hudumem` + `/b/` with **-l** closed bound, or rank threshold (`ue`) on time; teach explicitly | P2 |
| G-J15 | *for* (duration) | measure phrase `/b/`: `zazawan vawalal bohoram g+3.` — [numbers-applied#measure-phrases](numbers-applied.md#measure-phrases) | covered | numbers-applied.md | — | — |
| G-J16 | *ago* | channel + signed measure offset: `zazawan thuvuvum bohoram g-3 vawalal.` (*three hours ago*); `+` = *from now* | covered | knowing.md | Offset dates the event, never the moment of learning. Day / week / month / year units: G-J29 | — |
| G-J17 | *from … to* (time) | `zazawan ul b_9 vawalal oel b_17.` | covered | numbers-applied.md#time | — | — |
| G-J18 | *from … to* (place) | `zazawan ul bohohul vawalal ol bazadol.` — relations#locative-relations | covered | relations.md | — | — |
| G-J19 | *with* (instrument) | hook `ael` *using*: `zazawan dabogol ael babenel vuwurul.` | covered | hooks.md | — | — |
| G-J20 | *by* (means / channel) | hook `aem`: `zazawan vezehel aem bameral.` | covered | hooks.md | — | — |
| G-J21 | *by* (manner, *by walking hastily*) | adverb `/h/`: `zazawan vawalal hadazam.` — [clause#adverbs-h](clause.md#adverbs-h) | covered | clause.md | — | — |
| G-J22 | *with* (accompaniment) | join-relation `han`: `zazawan han bululon vawalal.` — [join-across-roles#join-relations](join-across-roles.md#join-relations) | covered | join-across-roles.md | — | — |
| G-J23 | *without* | `huan` / `guan`: `zazawan huan bululon vawalal.` | covered | join-across-roles.md | — | — |
| G-J24 | *like* (manner resemblance) | `hurorom` + `/b/`: `zodogol velebel hurorom bazawan.` — [relations#similative](relations.md#similative) | covered | relations.md | — | — |
| G-J25 | *to* (recipient / addressee) | unhosted `/b/`: `zazawan bululon dabogol vezehel.` — [clause#extra-nouns](clause.md#extra-nouns) | covered | clause.md | — | — |
| G-J26 | *for* (beneficiary) | hook `el` *for* (intended get): `zazawan vogogol el bululon.`; proxy `hudagam` for *on behalf of*. `el` is glossed "intended get", so *cooks for Ululon* (benefit to a person) vs *for a money-bag* (goal to get) is blurred | awkward | hooks.md | Clarify that `el` + person = beneficiary, or split beneficiary (`em`?) from goal-to-get | P2 |
| G-J27 | source (*from*, *out of*) | `ul` / `ual` / `um`: `zazawan vawalal ual bohohul.` | covered | hooks.md | — | — |
| G-J28 | goal (*to*, *into*, arrival) | `ol` *at* / `al` *in* after a verb of motion (`… vawalal ol bazadol.`); `oel` = direction only. Goal vs location not distinguished (`ol` = *at* and *to*) | covered | relations.md | — | — |
| G-J29 | time units *day / week / month / year* | `unuze` *day*, `alena` *week*, `amono` *month*, `urewo` *year* — [numbers-applied#stock-units](../grammar/numbers-applied.md#stock-units) | covered | numbers-applied.md | — | — |

**Notes**

- All 40-odd test sentences parsed (cold-start `npx tsx` parse needs >20 s per call; first runs timed out and were rerun).
- The parser accepts any hosted `/h/` + `/b/` noun, so *during / before / after / until + NP* parse fine; the gap is teaching, not grammar.
- english.md *by (deadline)* maps to `hudumem barl` *until*, which is a different meaning (event continues until vs completes no later than).
- `aom` is glossed *over* (frame of *on*), which competes with vertical *above/over* via `gubal` + `/b/`; learners will likely pick `aom` for *over the bridge*.
- No published root for *now* / *today* / *yesterday* found via lexicon-search; this blocks a clean *ago* and deictic time.

## Phase 2 — Real-text sampling

## Phase 3 — Extension sweep

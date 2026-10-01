# Expressiveness review plan

Editors only — not linked from grammar pages. Phased plan for a systematic suggestion pass over `docs/grammar/`, answering two questions:

1. **Gaps** — Is there common English grammar that Agazan cannot express easily, and that is not intentionally discouraged?
2. **Extensions** — Could existing grammar be extended into other forms (unused slots, other role letters, other endings, other vowels) with intuitive new readings?

This is a **suggestion** pass for Phases 1 and 3: output is a findings ledger plus proposals, not direct edits to grammar pages. Accepted proposals are applied afterwards through the normal grammar-doc workflow ([grammar-docs](../meta/grammar-docs.md), [doc-style](../meta/doc-style.md)).

Status: `[x]` done · `[~]` partial · `[ ]` not started.

## Ground rules

- **Intentionally discouraged ≠ gap.** Before logging a gap, check [why-agazan](../grammar/why-agazan.md) (limits, feature criteria) and the owning page for a deliberate omission (e.g. no general *to-be* `/v/`, no cause-arrow word, no metric prefixes, generics via joins not **-x**). If the omission is deliberate, log it once as **by design** with the citing section, and move on.
- **"Easily" means for the learner.** A gap exists when the only route is long, unnatural, ambiguous, or taught far later than English speakers need it. Dev effort (cross-reference churn, parser work) is not a cost — see `AGENTS.md`.
- **Extensions must be intuitive.** A proposed reading should be guessable from the existing form's meaning (same vowel series, same role-letter semantics, same ending semantics). Reject extensions that merely fill a slot.
- **Check before proposing.** Look up [unassigned-reserved](../meta/unassigned-reserved.md) (free forms), the lexicon CSVs, and [english.md](../grammar/english.md) (existing English → Agazan mappings) so a proposal neither collides with nor duplicates something already published.
- **No proposal-page links.** New design writeups go in `docs/proposals/` per [proposals](../meta/proposals.md); refer to them by filename in backticks.

## Findings ledger

Phases 1 and 3 write to one ledger and are triaged at the end (Phase 4). Phase 2 does not collate: each real-text sample is fixed as it is translated (see [Phase 2 process](#phase-2-process)). Settled **by design** decisions live in [design-decisions](../meta/design-decisions.md). Each row:

| Field | Content |
|-------|---------|
| ID | `G-nn` (gap) or `E-nn` (extension) |
| English job / source form | e.g. *reflexive "herself"*; or `th+N` on `/h/` |
| Current route | Best existing Agazan expression, with example, or *none* |
| Verdict | **covered** · **awkward** · **missing** · **by design** · **extension candidate** |
| Owning page | the `docs/grammar/` page that would own it |
| Proposal | one-line suggestion, or `docs/proposals/<file>.md` |
| Priority | **P1** common everyday English · **P2** common in writing · **P3** niche |

## Phase 0 — Setup

- [x] Create `docs/meta/grammar-gaps.md` with the ledger table and a short header (editors only).
- [x] Collect the **by design** list: skim [why-agazan](../grammar/why-agazan.md), [introduction](../grammar/introduction.md), and the removed consistency audit's Decisions (now under [grammar-gaps](../meta/grammar-gaps.md#by-design)) for deliberate omissions; seed ledger rows with verdict **by design**.
- [x] Snapshot [unassigned-reserved](../meta/unassigned-reserved.md) as the free-slot inventory for Phase 3.
- [x] Run `npm run build` to confirm a clean baseline.

## Phase 1 — English coverage checklist (gaps, top-down)

Walk a standard English reference-grammar inventory and find the Agazan route for each item. One agent per group; each agent writes only its group's ledger rows. For each item, write the best Agazan sentence using published roots, run it through the parser, and record the verdict.

| Status | Group | Items to check |
|--------|-------|----------------|
| [x] | **A. Clause types** | declarative, yes/no and wh- questions (incl. *how*, *why*, *how many*, *which*), imperatives (incl. *let's*, negative imperative), exclamatives (*what a…!*, *how …!*), tag questions, echo questions, rhetorical questions |
| [x] | **B. Verb phrase** | tense/aspect jobs (past, perfect *have done*, progressive, habitual, *used to*, *about to*, *just*, *still / already / yet / anymore*), modals (*can, could, may, might, must, should, would, need to, had better*), passive / agentless clauses, causatives (*make/let/have/get someone do*), phrasal verbs, light-verb constructions, reflexive / reciprocal (*themselves*, *each other*) |
| [x] | **C. Noun phrase** | articles and definiteness (*a / the / some / any*), demonstratives, quantifiers (*all, each, every, both, either, neither, none, few, a few, little, several, most, enough, too many*), possessives (*'s*, *of*, double genitive), partitives (*a piece of*), compounds, appositives, generic vs specific reference |
| [x] | **D. Modification** | adjective order and stacking, intensifiers and downtoners (*very, quite, rather, barely, almost, too, so … that*), degree (*as … as*, *more/less*, *the more … the more*), focus adverbs (*only, even, also, just*), sentence adverbs (*frankly, hopefully, apparently*) |
| [x] | **E. Clause combining** | coordination (*and, or, but, nor, either … or, both … and*), subordinators (*because, if, unless, although, while, until, before, after, since, once, as soon as, whereas, whether*), relatives (restrictive, non-restrictive, *whose*, *where/when* relatives, free relatives *whatever / whoever*), complements (*that*-clause, *whether*, infinitive, gerund, reported speech and questions), purpose / result (*so that, so … that, in order to*), conditionals (real, hypothetical, counterfactual, *even if*, *only if*, *unless*) |
| [x] | **F. Information structure** | topicalization, clefts (*it was X who…*, *what I want is…*), existentials (*there is / there are*), extraposition (*it is hard to…*), contrast and focus, ellipsis and gapping (*so do I*, *me too*, *neither does she*), pro-forms (*do so*, *one*, *so / not* as in *I think so*) |
| [x] | **G. Comparison and quantity** | comparatives / superlatives, equatives, *same / different / similar*, *more than N*, *at least / at most*, *approximately*, proportions, *each … respectively*, distributive *apiece* |
| [x] | **H. Discourse and speech acts** | greetings, thanks, apology, requests (softened / firm), offers, suggestions (*why don't we…*), permission, promises, warnings, backchannel (*uh-huh, right, oh*), hedges (*kind of, sort of, I guess*), discourse markers (*anyway, actually, by the way, well, so, besides, in fact, on the other hand*) |
| [x] | **I. Deixis and reference** | person / number in pronouns, *here / there / now / then*, *this / that*, *come / go*, *bring / take*, generic *you / one / they*, indefinite pronouns (*someone, anything, nowhere, everybody*), anaphora across sentences |
| [x] | **J. Time, place, and manner phrases** | locative prepositions (*in, on, under, behind, between, near, across, through, toward*), temporal phrases (*during, since, by (deadline), for (duration), ago, from … to*), manner / instrument / accompaniment (*with, by, without, like*), recipient / beneficiary (*to, for*), source / goal |

**Exit:** every item has a verdict. Items marked **awkward** or **missing** carry a P1–P3 priority.

## Phase 2 — Real-text sampling (gaps, bottom-up)

### Phase 2 process {#phase-2-process}

Phase 2 resolves as it goes; nothing waits for Phase 4. Each batch of sentences or samples is translated, then every stopping point is handled in the same pass:

- **Parser miss** (the docs already imply the reading): fix the parser, add a test, and list the fix in the results file.
- **Missing vocabulary:** add the lexicon row or role English, and record it as an `L-nn` row.
- **Grammar gap:** log a `G-nn` row with the current route and a recommendation. The language owner rules on it, and the fix is applied straight away: taught on the owning grammar page, listed in [english.md](../grammar/english.md) where it is a new English job, and marked **done** in the row. A **by design** ruling goes into [design-decisions](../meta/design-decisions.md) instead.

The results file ([syntax-test-results](../meta/syntax-test-results.md), and the register-sample equivalent) is therefore a record of what was found and how it was settled, not a backlog. Once a phase-2 row is ruled, it needs no further triage, and Phase 4 covers only Phase 1 and Phase 3 rows plus any Phase 2 row still open.

Checklists miss things that only surface in real use. Translate English sentences and texts into Agazan and log every point where the translator had to stop, paraphrase heavily, or guess.

### 2a — Standard syntax test corpus

Use the [Conlang Syntax Test Cases](https://cofl.github.io/conlang/resources/mirror/conlang-syntax-test-cases.html) (218 sentences, graded from *The sun shines.* to multi-clause reported speech; curated from ~1200 sentences to remove syntactic duplicates) as a fixed, external sentence set. Sentences we did not write avoid picking examples Agazan already handles well, and a shared corpus makes results comparable with other conlangs.

- [x] Copy the list into `docs/meta/syntax-test-corpus.md` (numbered, source credited) as the working sheet; add an Agazan translation + parser check per sentence. Keep the original numbering so rows can cite `STC-nn`. *(List copied; all 218 translated; findings in `docs/meta/syntax-test-results.md`: G-01–G-23 and L-01–L-12 ruled.)*
- [x] Split into batches of ~30 (one agent per batch, in list order, since difficulty rises); each stopping point becomes a ledger row citing `STC-nn` (dedupe against Phase 1 IDs).
- [x] Keep the **by design** rule: a sentence whose English form is deliberately not mirrored (e.g. *is* copula, tense) is **covered** if the meaning has a natural route.

The corpus covers core syntax only — its register is dated narrative, with few questions, almost no discourse markers, hedges, or speech acts, and nothing on the psychological themes. Phase 2b fills those.

### 2b — Register samples

- [x] Pick ~8 short samples (≈150 words each) across registers: casual chat, text message thread, how-to instructions, news paragraph, story narration, argument / opinion, a support conversation (compassion theme), a decision memo (empowerment / rationality theme).
- [x] The eight English samples are in `docs/meta/register-samples.md`. Record each translation in this file; log identified gaps in `docs/meta/register-results.md`.
- [ ] One agent per sample translates with the published lexicon and parser; each stopping point is handled by the [Phase 2 process](#phase-2-process) (dedupe against Phase 1 IDs and earlier results rows).
- [ ] Also log **lexicon-only** gaps separately (missing roots, not grammar) and hand them to the TODO lexicon items rather than this ledger.

#### RS-1 — Casual chat {#rs-1}

Translated with the house cast for the two friends' *I* / *you* as the speaker and listener pronouns (the turn's role is the point). Every line was checked with `node scripts/parse.mjs`. Gaps are in [register-results](../meta/register-results.md); *awkward* rows cite the `G-nn` or `L-nn` there.

| RS-1 | English | Agazan | Morph gloss | Verdict |
|------|---------|--------|-------------|---------|
| 1.1a | Hey, | `yalahen.` | y-Alahen | covered |
| 1.1b | you made it! | `! zehodon thunom vevahal.` | ! \| z-listener \| th-WITNESSED \| v-arrival | covered |
| 1.1c | I wasn't sure you'd come. | `zamegun thunom vevegam dorl zehodon vuvudel oel bamegun.` | z-speaker \| th-WITNESSED \| v-doubt \| d-whether-clause \| z-listener \| v-go \| [toward \| b-speaker] | covered |
| 1.2a | Yeah, | `yael.` | y-yes | covered |
| 1.2b | sorry | `yabayen.` | y-Abayen | covered |
| 1.2c | I'm late. | `zamegun thodum vevahal hulam barl zohan thumam vevahal.` | z-speaker \| th-LIVE \| v-arrival \| [h-after \| b-that-clause] \| z-interlocutors \| th-plan-itinerary \| v-arrival | covered (G-01) |
| 1.2d | The bus was kind of a mess. | `zabazul thunom habedum gazabom.` | z-bus \| th-WITNESSED \| h-kind-of \| g-disorder | covered |
| 1.3a | Oh no. | `yewedan.` | y-Ewedan | covered |
| 1.3b | Was it the same driver as last time? | `yol zaxuvudel gogal bazaxuvudel gruedul.` | y-question \| [z-agent-x-go \| g-SAME \| [b-agent-x-go \| g-2nd-from-end]] | covered (G-02) |
| 1.4a | I think so, | `yaem.` | y-yes-soft | covered |
| 1.4b | but I'm not sure. | `xagozal zamegun vevegam.` | x-but \| z-speaker \| v-doubt | covered |
| 1.4c | Anyway, I'm here now. | `or zamegun thodum vevahal.` | anyway \| z-speaker \| th-LIVE \| v-arrival | covered (G-03) |
| 1.5a | Good. | `yazahan.` | y-Azahan | covered |
| 1.5b | So, do you want to get coffee first, or just walk? | `yom xevavel zehodon hogodam vozodel dagavel xol zehodon vowogal.` | y-soft-question \| x-next \| z-listener \| h-first \| v-drink \| d-coffee \| x-or \| z-listener \| v-walk | awkward (G-04) |
| 1.6a | Honestly, coffee sounds great. | `thaveham zamegun vuhudem dagavel.` | th-frankly \| z-speaker \| v-wish \| d-coffee | covered |
| 1.6b | I haven't eaten anything yet. | `zamegun hezul vagudel.` | z-speaker \| h-not-yet \| v-eat | covered |
| 1.7a | Nothing at all? | `yol zehodon vagudel dal.` | y-question \| z-listener \| v-eat \| d-nothing | covered |
| 1.7b | You should have said something. | `zehodon thenem brul thugethem vezebel. zehodon vezebel vul.` | z-listener \| [th-as-of.ledger \| b-earlier] \| th-sake-ought-offered \| v-tell . z-listener \| [v-tell \| v-not] | covered (G-05) |
| 1.7c | There's a bakery around the corner. | `zozodoxebewel om bamegun.` | z-market-x-bread \| [near \| b-speaker] | stand-in (L-02) |
| 1.8a | Right, | `yael.` | y-yes | covered |
| 1.8b | but I didn't want to keep you waiting. | `xagozal zamegun thunom vuhudem durl zehodon vabazem.` | x-but \| z-speaker \| th-WITNESSED \| v-wish \| d-lest-clause \| z-listener \| v-wait | covered |
| 1.9a | You're ridiculous. | `; zehodon gahezem.` | ; \| z-listener \| g-foolishness | covered |
| 1.9b | Come on, my treat. | `yem zohan vuvudel. zamegun thumam vamol.` | y-request \| z-interlocutors \| v-go . z-speaker \| th-plan-itinerary \| v-pay | done (L-03) |
| 1.10a | Really? | `?!yaer.` | ?!y-yes-fresh | covered |
| 1.10b | Thanks. | `yebewan.` | y-Ebewan | covered |
| 1.10c | Next one's on me, okay? | `zamegun thumam bral vamol. yol yaom.` | z-speaker \| th-plan-itinerary \| b-later \| v-money . y-question \| y-okay | stand-in (L-03) |
| 1.11a | Deal. | `yaol.` | y-sure | covered |
| 1.11b | By the way, did you ever hear back about that job? | `yol xavazel zehodon thunom vemal dezebem hahehom bebevel om behodon.` | y-question \| x-by-the-way \| z-listener \| th-WITNESSED \| v-hear \| d-discourse \| [as-for \| [b-job \| [near \| b-listener]]] | done (G-06, L-04) |
| 1.12a | Not yet. | `yuor.` | y-not-now | covered |
| 1.12b | Maybe next week, if they're quick. | `zamegun thovom vemal dezebem hehum bagadem grawol thodom barl zebezalx gavazol.` | z-speaker \| th-MAY \| v-hear \| d-discourse \| [h-while \| [b-week \| g-one]] \| [th-if \| b-that-clause] \| z-person-x \| g-fast | covered |
| 1.12c | Fingers crossed. | `yevegen.` | y-Evegen | covered |
| 1.13 | They'd be lucky to have you, you know. | `; zebezalx thovem geledel thodom bezehodon.` | ; \| z-person-x \| th-NOTIONAL \| g-luck \| [th-if \| b-listener] | awkward (L-04) |
| 1.14a | Stop it. | `yel vazadal.` | y-command \| v-stop | covered |
| 1.14b | You're making me blush. | `zamegun thodum vabohel thegem bezehodon.` | z-speaker \| th-LIVE \| v-blush \| [th-CAUSE \| b-listener] | covered |

#### RS-2 — Text message thread {#rs-2}

Translated with the house cast for the third parties (Priya is `zahaben`). *I* / *you* / *we* are the speaker, listener and interlocutor pronouns, because the turn's role is the point. Emoji and *lol* / *haha* are written as tone marks or interjections, and message-level sign-offs as the speaker's own name ([greetings](../grammar/word-endings.md#greeting)). Every line was checked with `node scripts/parse.mjs`. Gaps are in [register-results](../meta/register-results.md); *awkward* and *stand-in* rows cite the `G-nn` or `L-nn` there.

| RS-2 | English | Agazan | Morph gloss | Verdict |
|------|---------|--------|-------------|---------|
| 2.1a | morning! | `yedebem.` | y-dawn | covered |
| 2.1b | are we still on for saturday? | `yol zohan thumam hagem vagudel hehum belagam gregul.` | y-question \| z-interlocutors \| th-plan-itinerary \| h-still \| v-eat \| [h-while \| [b-weekday \| g-6th]] | covered |
| 2.2a | yes!! | `!!yael.` | !!y-yes | covered |
| 2.2b | 7:30 at the place on Pine St, right? | `zohan thumam vagudel h_19,30 om bagudelahazal. zagudelahazal om b<pine st>. yol yael.` | z-interlocutors \| th-plan-itinerary \| v-eat \| h-_19,30 \| [near \| b-restaurant] . z-restaurant \| [near \| b-opaque] . y-question \| y-yes | covered |
| 2.3a | that's the one | `yael.` | y-yes | covered |
| 2.3b | i booked a table for four | `zamegun thunom vababul debedelagudel el bebezarx gramol.` | z-speaker \| th-WITNESSED \| v-reserve \| d-table \| [for \| [b-person-x \| g-four]] | done (L-05) |
| 2.4a | four? | `?! debezarx gramol.` | ?! \| d-person-x \| g-four | covered |
| 2.4b | who else is coming | `yol zur vuvudel.` | y-question \| z-who-else \| v-go | covered |
| 2.5a | Priya said she might bring her brother | `zahaben themam thovom valagal dezebal gemehel grebazol bahaben.` | z-Ahaben \| th-HEARSAY \| th-MAY \| v-bring \| [d-person \| g-brother-of-ranked \| [b-Ahaben]] | covered |
| 2.5b | not sure yet | `zamegun thodum hagem vevegam.` | z-speaker \| th-LIVE \| h-still \| v-doubt | covered |
| 2.6a | cool cool | `yaol. yaol.` | y-sure . y-sure | covered |
| 2.6b | can you ask her to confirm by thursday? | `yem zehodon bahaben vezebel derl vaen hodal belagam gremol.` | y-request \| z-listener \| b-Ahaben \| v-tell \| d-to-clause \| [v-confirm \| [h-by \| [b-weekday \| g-4th]]] | covered (G-07) |
| 2.6c | they'll want a final number | `yem zehodon bahaben vezebel derl vaen hodal belagam gremol theram barl zagudelahazal thabem bral vuhum danabel gogovel.` | (as 2.6b) \| [th-because \| b-that-clause] \| z-restaurant \| [th-PATTERN \| b-later] \| v-wish \| d-numbers \| g-final | covered |
| 2.7 | will do | `zamegun thumam vezebel oel bahaben.` | z-speaker \| th-plan-itinerary \| v-tell \| [toward \| b-Ahaben] | covered |
| 2.8a | sorry just seeing this | `yabayen. zamegun thunom brubul vahahal dezebem.` | y-Abayen . z-speaker \| th-WITNESSED \| h-just-before-now \| v-see \| d-discourse | covered |
| 2.8b | i can come but i'll be 15 min late, work thing | `zamegun vuvudexal. xagozal zamegun thumam vevahal h_19,45 theram bebevel.` | z-speaker \| v-go-able . x-but \| z-speaker \| th-plan-itinerary \| v-arrival \| h-_19,45 \| [th-because \| b-job] | covered (G-01) |
| 2.9a | no worries | `; yaol.` | ; \| y-sure | covered |
| 2.9b | we'll order drinks and wait 🙂 | `; zohan thumam vebedol dozodel. zohan thumam vabazel.` | ; \| z-interlocutors \| th-plan-itinerary \| v-order \| d-drink . z-interlocutors \| th-plan-itinerary \| v-wait | covered |
| 2.10a | you're the best | `; zehodon zel gazahal.` | ; \| z-listener \| rank/more \| g-good | covered |
| 2.10b | should i bring anything? | `yol zamegun thugethem valagal dor.` | y-question \| z-speaker \| th-sake-ought-offered \| v-bring \| d-anything | covered |
| 2.11a | just yourself | `zehodon zal.` | z-listener \| z-only | covered |
| 2.11b | and maybe an appetite lol | `% al zehodon thovom vuhum dagudel.` | % \| also \| z-listener \| th-MAY \| v-wish \| d-food | covered |
| 2.12a | haha | `yalavom.` | y-laugh | covered |
| 2.12b | always | `zamegun hual vuhum dagudel.` | z-speaker \| h-always \| v-wish \| d-food | covered |
| 2.13a | ok gotta run, meeting starting | `yaol. ameguxen. zagadelohal thodum vebegel.` | y-sure . speaker-x-leaving-soon . z-appointment \| th-LIVE \| v-begin | covered |
| 2.13b | talk later! | `! zohan thabem bral vezebel.` | ! \| z-interlocutors \| [th-PATTERN \| b-later] \| v-talk | covered |
| 2.14a | bye!! | `!! amegun.` | !! \| greeting | covered |
| 2.14b | see you both saturday ❤️ | `; zamegun thabem bral dehodonx vahahal hehum belagam gregul.` | ; \| z-speaker \| [th-PATTERN \| b-later] \| v-see \| d-listener-x \| [h-while \| [b-weekday \| g-6th]] | covered |

#### RS-3 — How-to instructions {#rs-3}

Each step is a command (`yel`) with no subject, so the listener is the cook. Steps are kept as separate turns, and a *because* that English puts in its own sentence becomes a plain statement after the command. A word the step already named comes back as a full-root resume (`danayar`, `zuzudur`). Every line was checked with `node scripts/parse.mjs --check-lexicon --check-ambiguity`. Gaps are in [register-results](../meta/register-results.md); *awkward*, *stand-in* and *by design?* rows cite the `G-nn` or `L-nn` there.

| RS-3 | English | Agazan | Morph gloss | Verdict |
|------|---------|--------|-------------|---------|
| 3.1 | Before you start, wash your hands and clear a space on the counter. | `yel vabeval dahadalx xal vubuval dawazem aol bebedelagudel habum barl zehodon vebegel.` | y-command \| v-wash \| d-hand-x \| x-and \| v-clear \| d-blank \| [on \| b-table] \| [h-before \| b-that-clause] \| z-listener \| v-begin | stand-in (L-06) |
| 3.2a | Chop one onion and three cloves of garlic. | `yel vanaval danayal grawol dagegol gozazom grarel dal.` | y-command \| v-cut \| [d-onion \| g-one] \| [d-garlic \| g-division \| g-three] \| d-and | covered |
| 3.2b | Cut them as small as you can, | `yel vanavar hagom barl zozazor zel gamazal.` | y-command \| v-←cut.full \| [h-so-that \| b-that-clause] \| [z-←division.full \| z-rank/more \| g-small] | awkward (G-08) |
| 3.2c | because they cook faster that way. | `zozazor gamazal zahen zel havazom vugugel.` | [z-←division.full \| g-small \| z-Typical \| z-rank/more \| h-quickly] \| v-cook | covered |
| 3.3a | Heat two tablespoons of oil in a wide pan over medium heat. | `yel vebem duzubul gradul gaham bababul al bozegal gorodam ael bebem beyen bael gahadol.` | y-command \| v-heat \| [d-spoon \| g-two \| [g-contents \| b-oil]] \| [in \| [b-skillet \| g-wide]] \| [using \| [b-heat \| b-Average \| b-equal-rank \| g-hot]] | covered |
| 3.3b | When the oil shimmers, add the onion. | `yel vabavol danayar wadehom hulam barl zababur vabawel.` | y-command \| v-add \| d-←onion.full \| [[w-haste \| h-after] \| b-that-clause] \| z-←oil.full \| v-shine | covered |
| 3.4a | Stir often. | `yel zahen zel hral vagogel.` | y-command \| [z-Typical \| z-rank/more \| h-how-often] \| v-stir | covered |
| 3.4b | If the onion browns too quickly, lower the heat. | `yel vadahem debem thodom barl zanayar zugen zel havazom vabawal.` | y-command \| v-decrease \| d-heat \| [th-if \| b-that-clause] \| [z-←onion.full \| z-Some-sake \| z-rank/more \| h-quickly] \| v-brown | by design? (G-09) |
| 3.5a | After about five minutes, add the garlic and cook for one more minute. | `yel hulam bumunum gravam vabavol dagegor xal vugugel bumunum grawol.` | y-command \| [h-after \| [b-minute \| g-five.about]] \| v-add \| d-←garlic.full \| x-and \| v-cook \| [b-minute \| g-one] | covered |
| 3.5b | Do not let it burn; | `yul dagegor vavahel.` | y-prohibition \| d-←garlic.full \| v-burn | covered |
| 3.5c | burnt garlic tastes bitter. | `zagegol gavahel gazahal gul.` | [z-garlic \| g-burn \| g-good \| g-not] | stand-in (L-07) |
| 3.6a | Pour in one large can of crushed tomatoes and half a cup of water. | `yel vobohel dedewel grawol gelaval gaham badedolx gagabel dedehelezel grudul gaham bowodel dal al bozegar.` | y-command \| v-pour \| [d-tin \| g-one \| g-big \| [g-contents \| [b-tomato-x \| g-pressed]]] \| [d-cup \| g-half-of \| [g-contents \| b-water]] \| d-and \| [in \| b-←skillet.full] | covered |
| 3.6b | Add a pinch of salt. | `yel vabavol debohol gaham bozodal.` | y-command \| v-add \| [d-pinch \| [g-contents \| b-salt]] | covered |
| 3.7 | Let the sauce simmer, uncovered, for twenty to thirty minutes, until it thickens. | `yel vuzudum duzudul bumunum g+20 al g+30 huan bagebal hodam barl zuzudur gehobalagodel.` | y-command \| v-simmer \| d-stew \| [b-minute \| g-twenty] \| through \| g-thirty \| [without \| b-cap] \| [h-until \| b-that-clause] \| z-←stew.full \| g-density | stand-in (L-08, L-09) |
| 3.8a | Taste it. | `yel vadavalahahal duzudur.` | y-command \| v-taste \| d-←stew.full | covered |
| 3.8b | If it is too sharp, add a small spoonful of sugar. | `yel vabavol duzubul gamazal gaham bagedem thodom barl zuzudur zugen zel ganaval.` | y-command \| v-add \| [d-spoon \| g-small \| [g-contents \| b-sugar]] \| [th-if \| b-that-clause] \| [z-←stew.full \| z-Some-sake \| z-rank/more \| g-sharp] | stand-in (L-07, G-09) |
| 3.8c | If it is bland, add more salt. | `yel vabavol dozodal herebem thodom barl zuzudur zugen zuel gozodal.` | y-command \| v-add \| d-salt \| h-again \| [th-if \| b-that-clause] \| [z-←stew.full \| z-Some-sake \| z-rank/less \| g-salt] | stand-in (L-07, G-09) |
| 3.9a | Be careful when you stir: | `yel geyayem hehum barl zehodon vagogel.` | y-command \| g-caution \| [h-while \| b-that-clause] \| z-listener \| v-stir | covered |
| 3.9b | hot sauce can splash. | `zadabalx gahadol thovom vagugel ul bozegar.` | [z-droplet-x \| g-hot] \| th-MAY \| v-jump \| [from \| b-←skillet.full] | covered |
| 3.10 | Serve immediately, or let it cool and store it in the fridge for up to four days. | `yel vowogalel duzudur hodal brabul xol vaham duzudur bazazam grazol al gramol ol bar gogodel hulam barl zuzudur vogodel.` | y-command \| v-serve \| d-←stew.full \| [h-by \| b-just-after-now] \| x-or \| v-store \| d-←stew.full \| [b-day \| g-zero] \| through \| g-four \| [at \| [b-somewhere \| g-cold]] \| [h-after \| b-that-clause] \| z-←stew.full \| v-cold | stand-in (L-10) |

Notes on the covered rows. Measures that English names by a vessel (*two tablespoons*, *half a cup*, *a pinch*) use the vessel with its contents (`gaham`), as English does; only the stock units (minutes, days) are measure phrases. *Medium heat* is heat at the Average bar (`beyen bael gahadol`). *Shimmers* is *shines*, *thickens* is *is dense* (`ehobalagode`), *crushed* is *pressed* (`gagabel`), and *splash* is *hot drops may jump out of the pan*. *Let it cool and store it* is reordered as *store it after it cools*. *Up to four days* is the band *zero to four days*. *Serve* is the hook compound `vowogalel`.

**Exit:** corpus and samples translated; every stopping point ruled and applied or recorded as by design.

## Phase 3 — Extension sweep (existing grammar, new readings)

Systematically cross every productive mechanism with every place it could plausibly apply, and ask whether the unused combination has an intuitive reading. Work page by page in the consistency-audit wave order (clause / phonology / word-endings first, overview pages last) so foundations settle first.

For each mechanism, build its applicability grid and inspect the empty cells:

| Status | Mechanism | Axes to cross |
|--------|-----------|---------------|
| [ ] | Role letters | each role letter × each closed-form family (numbers, joins, hooks, polar stance, values, knowing moods) — e.g. is there a `/w/` or `/h/` reading a family lacks? |
| [ ] | Word endings | **-l / -m / -n / -r** × each closed-form family where only some endings are defined |
| [ ] | Vowel series | **a / o / e / u** (add / one / order / undo) × every family that uses the series — any family using only part of it? |
| [ ] | Numbers | digitless and exponent forms × role letters not yet assigned (see [numbers](../grammar/numbers.md)); stance numbers × other stances |
| [ ] | Joins | set / rank × arity × role letters (see [joins](../grammar/joins.md), [join-across-roles](../grammar/join-across-roles.md)) |
| [ ] | Hooks | hook × role / ending combinations not yet read |
| [ ] | Mid-word `x` and `th` | [x-compounds](../grammar/x-compounds.md) families × left-hand types not yet allowed |
| [ ] | Spans | TYPE × EDGE × ending cells in [spans](../grammar/spans.md) |
| [ ] | Stance / mood roots | [knowing](../grammar/knowing.md), [causation](../grammar/causation.md), [intention](../grammar/intention.md) moods × other role letters (stance vs noun vs adverb readings) |
| [ ] | Plurality | **-x** on hosts where it is currently "unused" ([plurality](../grammar/plurality.md)) |
| [ ] | Tone marks | tone marks × scopes and positions not yet defined ([speech-moves](../grammar/speech-moves.md#tone-marks)) |

For each empty cell, record one of:

- **intuitive** — a reading follows from the existing semantics without new explanation → extension candidate (`E-nn`).
- **forced** — a reading exists but must be taught as a new rule → log only if it also fills a Phase 1/2 gap.
- **none** — leave unused; mark in [unassigned-reserved](../meta/unassigned-reserved.md) if not already listed.

**Exit:** every grid inspected; extension candidates logged. Cross-link each **intuitive** extension to any gap it closes.

## Phase 4 — Triage and proposals

- [ ] Merge duplicates (Phase 1 and Phase 3 rows, plus any open Phase 2 row); link gaps to extensions that close them (preferring extensions over new forms).
- [ ] Rank by priority, then by how many ledger rows one proposal closes.
- [ ] For each P1 item and any multi-row extension, write a short proposal in `docs/proposals/` (current route, proposed form, examples with morph glosses, interaction with existing forms, learning level per [learning-levels](../meta/learning-levels.md)).
- [ ] Present proposals to the language owner in batches with a recommendation each; record decisions (accepted / rejected / by design) in the ledger.

**Exit:** every **awkward** / **missing** row is either answered with a proposal decision or deferred with a reason.

## Phase 5 — Apply accepted proposals

- [ ] Apply each accepted proposal to its owning grammar page only (one agent per page), following [grammar-docs](../meta/grammar-docs.md) and [doc-style](../meta/doc-style.md).
- [ ] Update lexicon / overlay CSVs and the parser where the proposal adds forms; add parser tests.
- [ ] Update [english.md](../grammar/english.md) with new English → Agazan mappings.
- [ ] Remove used slots from [unassigned-reserved](../meta/unassigned-reserved.md).
- [ ] Add each accepted and rejected decision to [design-decisions](../meta/design-decisions.md) so it is not re-raised.
- [ ] Add translation checkpoints for new beginner / intermediate features per [drill-generation](../meta/drill-generation.md).
- [ ] Run `npm run build` and `npm test`.

**Exit:** build and tests clean; ledger rows marked **covered**.

## Progress

| Phase | Status | Date |
|-------|--------|------|
| 0 — Setup | [x] | 2026-09-25 |
| 1 — English coverage checklist | [x] | 2026-09-25 |
| 2 — Real-text sampling | [~] | 2026-09-29 |
| 3 — Extension sweep | [ ] | |
| 4 — Triage and proposals | [ ] | |
| 5 — Apply | [ ] | |

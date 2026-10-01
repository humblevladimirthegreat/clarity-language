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

The translation tables are a record, not live examples. `retie-docs` does not cover this file, so later respellings may have broken sentences in earlier samples (they no longer parse, or use an old spelling). That is tolerated: earlier rows are not re-checked or updated.

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

Each step is a command (`yel`) with no subject, so the listener is the cook. Steps are kept as separate turns, and a *because* that English puts in its own sentence becomes a plain statement after the command. A word the step already named comes back as a full-root resume (`danayar`, `zuzudur`). The table uses the spellings after the October 2026 respell. Every line was checked with `node scripts/parse.mjs --check-lexicon --check-ambiguity`. Gaps are in [register-results](../meta/register-results.md); *awkward*, *stand-in* and *by design?* rows cite the `G-nn` or `L-nn` there.

| RS-3 | English | Agazan | Morph gloss | Verdict |
|------|---------|--------|-------------|---------|
| 3.1 | Before you start, wash your hands and clear a space on the counter. | `yel vabeval dahadalx xal vubuval dawazem aol bebedelugugel habam barl zehodon vabegel.` | y-command \| v-wash \| d-hand-x \| x-and \| v-clear \| d-blank \| [on \| b-counter] \| [h-before \| b-that-clause] \| z-listener \| v-begin | done (L-06) |
| 3.2a | Chop one onion and three cloves of garlic. | `yel vanaval danayal grawol dagegol gozazom grarel dal.` | y-command \| v-cut \| [d-onion \| g-one] \| [d-garlic \| g-division \| g-three] \| d-and | covered |
| 3.2b | Cut them as small as you can, | `yel vanavar hogom barl zozazor zawon zael gamazal behodon.` | y-command \| v-←cut.full \| [h-so-that \| b-that-clause] \| [z-←division.full \| z-Best-effort \| z-equal-rank \| [g-small \| b-listener]] | done (G-08) |
| 3.2c | because they cook faster that way. | `zozazor gamazal zehon zel havazom vugugel.` | [z-←division.full \| g-small \| z-Typical \| z-rank/more \| h-quickly] \| v-cook | covered |
| 3.3a | Heat two tablespoons of oil in a wide pan over medium heat. | `yel vubem duzubul gradul gahem bababal al bozegal gorodam ael bubem buyen bael gahadul.` | y-command \| v-heat \| [d-spoon \| g-two \| [g-contents \| b-oil]] \| [in \| [b-skillet \| g-wide]] \| [using \| [b-heat \| b-Average \| b-equal-rank \| g-hot]] | covered |
| 3.3b | When the oil shimmers, add the onion. | `yel vabavel danayar wadehum henum barl zababar vabawal.` | y-command \| v-add \| d-←onion.full \| [[w-haste \| h-after] \| b-that-clause] \| z-←oil.full \| v-shine | covered |
| 3.4a | Stir often. | `yel zehon zel hral vagogel.` | y-command \| [z-Typical \| z-rank/more \| h-how-often] \| v-stir | covered |
| 3.4b | If the onion browns too quickly, lower the heat. | `yel vadahem dubem thoyem barl zanayar zegan zel havazom vabavul.` | y-command \| v-decrease \| d-heat \| [th-if \| b-that-clause] \| [z-←onion.full \| z-Some-sake \| z-rank/more \| h-quickly] \| v-brown | done (G-09) |
| 3.5a | After about five minutes, add the garlic and cook for one more minute. | `yel henum bavegam gravam vabavel dagegor xal vugugel bavegam grawol.` | y-command \| [h-after \| [b-minute \| g-five.about]] \| v-add \| d-←garlic.full \| x-and \| v-cook \| [b-minute \| g-one] | covered |
| 3.5b | Do not let it burn; | `yul dagegor vavahel.` | y-prohibition \| d-←garlic.full \| v-burn | covered |
| 3.5c | burnt garlic tastes bitter. | `zagegol gavahel gazahul gul.` | [z-garlic \| g-burn \| g-good \| g-not] | stand-in (L-07) |
| 3.6a | Pour in one large can of crushed tomatoes and half a cup of water. | `yel vobohol dedevul grawol gelaval gahem badedolx gagabel dedehelezel grudul gahem bowodel dal al bozegar.` | y-command \| v-pour \| [d-tin \| g-one \| g-big \| [g-contents \| [b-tomato-x \| g-pressed]]] \| [d-cup \| g-half-of \| [g-contents \| b-water]] \| d-and \| [in \| b-←skillet.full] | covered |
| 3.6b | Add a pinch of salt. | `yel vabavel debewul gahem bozodel.` | y-command \| v-add \| [d-pinch \| [g-contents \| b-salt]] | covered |
| 3.7 | Let the sauce simmer, uncovered, for twenty to thirty minutes, until it thickens. | `yel vuzudum duzudul bavegam g+20 al g+30 huan bagebal homam barl zuzudur gehobalegodel.` | y-command \| v-simmer \| d-stew \| [b-minute \| g-twenty] \| through \| g-thirty \| [without \| b-cap] \| [h-until \| b-that-clause] \| z-←stew.full \| g-density | stand-in (L-08, L-09) |
| 3.8a | Taste it. | `yel vadavalahahal duzudur.` | y-command \| v-taste \| d-←stew.full | covered |
| 3.8b | If it is too sharp, add a small spoonful of sugar. | `yel vabavel duzubul gamazal gahem bagedem thoyem barl zuzudur zegan zel ganaval.` | y-command \| v-add \| [d-spoon \| g-small \| [g-contents \| b-sugar]] \| [th-if \| b-that-clause] \| [z-←stew.full \| z-Some-sake \| z-rank/more \| g-sharp] | stand-in (L-07; G-09 done) |
| 3.8c | If it is bland, add more salt. | `yel vabavel dozodel hedum thoyem barl zuzudur zegan zuel gozodel.` | y-command \| v-add \| d-salt \| h-again \| [th-if \| b-that-clause] \| [z-←stew.full \| z-Some-sake \| z-rank/less \| g-salt] | stand-in (L-07; G-09 done) |
| 3.9a | Be careful when you stir: | `yel geyayem huwem barl zehodon vagogel.` | y-command \| g-caution \| [h-while \| b-that-clause] \| z-listener \| v-stir | covered |
| 3.9b | hot sauce can splash. | `zadabalx gahadul thovum vagagel ul bozegar.` | [z-droplet-x \| g-hot] \| th-MAY \| v-jump \| [from \| b-←skillet.full] | covered |
| 3.10 | Serve immediately, or let it cool and store it in the fridge for up to four days. | `yel vowogalel duzudur homal brabul xol vahem duzudur bazazam grazol al gramol al bahelogodel henum barl zuzudur vogodel.` | y-command \| v-serve \| d-←stew.full \| [h-by \| b-just-after-now] \| x-or \| v-store \| d-←stew.full \| [b-day \| g-zero] \| through \| g-four \| [in \| b-fridge] \| [h-after \| b-that-clause] \| z-←stew.full \| v-cold | done (L-10) |

Notes on the covered rows. Measures that English names by a vessel (*two tablespoons*, *half a cup*, *a pinch*) use the vessel with its contents (`gaham`), as English does; only the stock units (minutes, days) are measure phrases. *Medium heat* is heat at the Average bar (`buyen bael gahadul`). *Shimmers* is *shines*, *thickens* is *is dense* (`ehobalegode`), *crushed* is *pressed* (`gagabel`), and *splash* is *hot drops may jump out of the pan*. *Let it cool and store it* is reordered as *store it after it cools*. *Up to four days* is the band *zero to four days*. *Serve* is the hook compound `vowogalel`.

#### RS-4 — News paragraph {#rs-4}

Translated with the house cast for the council member (Dr. Okafor is `zalahen`; the title is dropped). The writer is the speaker, so each reported fact carries the channel the paper has for it: RECORDED (`therel` for the official record of the vote and the report) or TOLD with the officials as source (`thewal baxagedumx`). Each *who* / *which* clause is its own sentence ([which noun](../grammar/dependents.md#which-noun)), each passive leaves out the subject ([leaving out who acts](../grammar/clause.md#no-subject)), and *X said* is the cite or **`darl`**. The attribution in 4.5a comes before the two quotes, so the quotes can follow it. Street and bridge names stay an opaque name (`b@<harbor street>`). Every line was checked with `node scripts/parse.mjs --check-lexicon --check-ambiguity`. Gaps are in [register-results](../meta/register-results.md); *stand-in* rows cite the `G-nn` or `L-nn` there.

| RS-4 | English | Agazan | Morph gloss | Verdict |
|------|---------|--------|-------------|---------|
| 4.1a | The city council voted … on Tuesday night to close the Harbor Street bridge for repairs, | `zadedeluzal therel huwem belagam gredul huwem banadal vahul derl zadedeluzar valagal debul ol b@<harbor street> hogom barl debur varebel.` | z-council \| th-RECORDED.strong \| [h-while \| [b-weekday \| g-2nd]] \| [h-while \| b-night] \| v-ballot \| d-to-clause \| z-←council.full \| v-shut \| d-bridge \| [at \| b-NAME.OPAQUE["harbor street"]] \| [h-so-that \| b-that-clause] \| d-←bridge \| v-repair | covered |
| 4.1b | 7 to 2 | `zaxahulx gralel vanadel derth. zaxahulx gradul vanadel derth vul.` | [z-agent-x-ballot-x \| g-seven] \| v-nod \| d-that-same-instruction . [z-agent-x-ballot-x \| g-two] \| v-nod \| d-that-same-instruction \| v-no | covered |
| 4.1c | ending months of debate. | `zebezalx therel vadedom bumuham g+ hahehom bebur. xodum zadedor hewem.` | z-person-x \| th-RECORDED.strong \| v-controversy \| [b-month \| g-more-than-one.short] \| [h-topic \| b-←bridge.full] . x-therefore \| z-←controversy.full \| h-no-longer | covered |
| 4.2a | The bridge, which was built in 1962, | `debur therel huwem bavawem g_1962 vagozal.` | d-←bridge.full \| th-RECORDED.strong \| [h-while \| [b-year \| g-_1962]] \| v-construct | done (G-10) |
| 4.2b | carries about 14,000 vehicles a day. | `zagahalx g~+14e3 therem vuvudel uol bebur hruwol bazazam.` | [z-car-x \| g-14e3.about] \| th-RECORDED \| v-go \| [through \| b-←bridge.full] \| [h-divided-by-one \| b-day] | covered |
| 4.3a | According to a report released last month, | `therel bumuham gruwol dumel varadal.` | [th-RECORDED.strong \| [b-month \| g-minus-one]] \| d-memo \| v-write | covered |
| 4.3b | several support beams have cracked | `zagavamx g+ gobom bebur therel bumer thamom valazem.` | [z-support-x \| g-more-than-one.short \| [g-part-of \| b-←bridge.full]] \| [th-RECORDED.strong \| b-←memo.full] \| th-RESIDUE \| v-breakdown | covered |
| 4.3c | and must be replaced. | `dagavar therel bumer hehem bagavamx gunuham vehem thumel.` | d-←crutch.full \| [th-RECORDED.strong \| b-←memo.full] \| [h-in-exchange-for \| [b-support-x \| g-novelty]] \| v-convertibility \| th-REQUIRE-rule | done (L-11) |
| 4.4a | Work is expected to begin in March | `zaxagedumx vezebel darl zarebem therem bral huwem bumuham grerel vabegel.` | z-agent-x-institution-x \| v-tell \| d-that-clause \| z-maintenance \| [th-RECORDED \| b-later] \| [h-while \| [b-month \| g-3rd]] \| v-begin | done (G-10) |
| 4.4b | and could last up to eight months, officials said. | `zaxawolx thewal baxagedumx thovum vawol bumuham grazol al grahal.` | z-agent-x-sweat-x \| [th-TOLD.strong \| b-agent-x-institution-x] \| th-MAY \| v-sweat \| [b-month \| g-zero] \| through \| g-eight | covered |
| 4.5a | said council member Dr. Okafor, who voted in favor. | `zalahen gobom badedeluzal therel vanadel derth.` | [z-Alahen \| [g-part-of \| b-council]] \| th-RECORDED.strong \| v-nod \| d-that-same-instruction | covered |
| 4.5b | "We understand this will be difficult for residents," | `zalahen d[zamagonx vevegal darl zahazamebezalx thunem bral vawom.] vezebel.` | z-Alahen \| d-CITE[z-speaker-x \| v-think \| d-that-clause \| z-resident-x \| [th-INFERRED \| b-later] \| v-effort] \| v-tell | covered |
| 4.5c | "But delaying the work would cost more and put people at risk." | `zalahen d[xagezal zadahum zedun zel gelavam xal zebezalx gowawom thoyem barl zamagonx thrul darebem vabazam.] vezebel.` | z-Alahen \| d-CITE[x-but \| [[z-cost \| z-Usual \| z-rank/more \| g-big] \| x-and \| [z-person-x \| g-risk] \| [th-if \| b-that-clause] \| z-speaker-x \| th-unlikely \| d-maintenance \| v-wait]] \| v-tell | covered |
| 4.6a | Shop owners near the bridge, who fear losing customers, | `zaxehelx om bebul vevehem darl zoxehelx thunem bral vedabal.` | z-agent-x-currency-exchange-x \| [near \| b-bridge] \| v-threat-appraisal \| d-that-clause \| z-recipient-x-currency-exchange-x \| [th-INFERRED \| b-later] \| v-departure | covered |
| 4.6b | say they were not consulted. | `zaxehelx vezebel darl daxehelx thevom vezebelolal vul.` | z-agent-x-currency-exchange-x \| v-tell \| d-that-clause \| d-agent-x-currency-exchange-x \| th-WITNESSED \| [v-consultation \| v-not] | covered |
| 4.7a | The mayor has promised that a free shuttle will run | `zezagamerevol thamom vezebel darl zezagamerevor dabazul huan badahum vebel thuxegol el bahazamebezalx.` | z-mayor \| th-RESIDUE \| v-tell \| d-that-clause \| z-←mayor.full \| d-bus \| [h-without \| b-cost] \| v-present \| th-CONSENT-contract \| [for \| b-resident-x] | covered |
| 4.7b | between the two shores while the bridge is closed. | `zabazur thewam bral vuvudel hazam babehalx gradul huwem barl zebur galagal.` | z-←bus.full \| [th-TOLD \| b-later] \| v-go \| [h-between \| [b-beach-x \| g-two]] \| [h-while \| b-that-clause] \| [z-←bridge.full \| g-locked] | covered |
| 4.8a | It is not yet clear who will pay for the shuttle. | `zal huzem vezebel dorl zar thamam vamol el babazur.` | z-none \| h-not-yet \| v-tell \| d-whether-clause \| z-something \| th-plan-itinerary \| v-pay \| [for \| b-←bus.full] | covered |
| 4.8b | The council will meet again on the 12th to discuss funding. | `zadedeluzal thamam hedum vezebemuzal h_#12 hahehom bamol.` | z-council \| th-plan-itinerary \| h-again \| v-conference \| h-_12 \| [h-topic \| b-money] | done (G-10) |
| 4.9 | Residents can share comments online until the end of the month. | `zahazamebezalx dovumx varadal uol bawazam thegol homam barl zumuham vogovem.` | z-resident-x \| d-commentary-x \| v-write \| [through \| b-connectivity] \| th-PERMIT-allowed \| [h-until \| b-that-clause] \| z-month \| v-end | covered |

Notes on the covered rows. *Voted 7 to 2* is the vote (`vahul derl …`, the council closing the bridge) and then the tally: seven voters agreed to it and two did not (`vanadel derth`, pointing back at the instruction-like content). *Ending months of debate* is *people argued about the bridge for months; therefore the debate is over* (`hewem`). *Carries 14,000 vehicles a day* is *about 14,000 cars go over the bridge per day* (`hruwol bazazam`). *Support beams* are the bridge's *supports* (`zagavamx gobom bebur`), and *replaced* is the swap recipe with *new* supports (`gunuham`, novelty). *Released* is *written*. *Work could last up to eight months* is *the workers may work zero to eight months*, the same band as RS-3. *Difficult for residents* is *residents will have to strain* (`vawom`). *Would cost more* keeps the long-shot condition (`thoyem barl … thrul`) on both results, and *more* is against the cost itself (`zedun`). *Shop owners* are *merchants* (`zaxehelx`), and *losing customers* is *customers will leave*. *Free* is *without cost* (`huan badahum`). *The mayor has promised* is RESIDUE on the telling with a binding vow inside it (`thuxegol el bahazamebezalx`). *It is not yet clear who will pay* is *no one has said yet who plans to pay*. *Meet to discuss funding* is *confer about money*.

#### RS-5 — Story narration {#rs-5}

Translated with the house cast for Nadia (`zahaben`, then the resume `zahaber`). The first sentence carries the TALE channel (`thozem`), and the rest of the narration uses bare verbs, which go on telling the tale (G-11, [evidentiality](../grammar/knowing.md#evidentiality)). Quoted speech is a cite with the speaking verb (`d[…] vezebel`, `valadul` *call*, `vagawalezebel` *whisper*), and inside the quotes *I* / *you* are the speaker and listener pronouns. Each *which* clause is its own sentence. Every line was checked with `node scripts/parse.mjs --check-lexicon --check-ambiguity`. Gaps are in [register-results](../meta/register-results.md); *awkward* and *stand-in* rows cite the `G-nn` or `L-nn` there.

| RS-5 | English | Agazan | Morph gloss | Verdict |
|------|---------|--------|-------------|---------|
| 5.1a | When Nadia reached the top of the hill, the sun had already set, | `zazahel thozem hoham vadahel huwem barl zahaben vuvudel oel babahal gobom bamadalamazal.` | z-sun \| th-STORY \| h-already \| v-fall \| [h-while \| b-that-clause] \| z-Ahaben \| v-go \| [toward \| [b-up \| [g-part-of \| b-hill]]] | done (L-12) |
| 5.1b | and the valley below was filling with mist. | `zavegel vuzem al bevedaladahel.` | z-fog \| v-growth \| [in \| b-valley] | done (L-12) |
| 5.2a | She stood still for a long time, listening. | `zahaber vazadol zehon zel hadaham xal vewal.` | [z-←Ahaben.full \| v-stand \| [z-Typical \| z-rank/more \| h-duration] \| x-and \| v-hear] | done (G-11) |
| 5.2b | Somewhere a dog was barking, | `zodogal valadul ol bar.` | z-dog \| v-shout \| [at \| b-something] | stand-in (L-13) |
| 5.2c | and the wind moved through the grass like a hand through hair. | `zewedul vuvudel uol bevedal humum barl zahadal vuvudel uol behebelx.` | z-wind \| v-go \| [through \| b-field] \| [h-like \| b-that-clause] \| z-hand \| v-go \| [through \| b-hair-pick-x] | done (G-12); stand-in (L-13) |
| 5.3a | "Is anyone there?" she called. | `zahaber d[yol zunan om bamagon.] valadul.` | z-←Ahaben.full \| d-CITE[y-question \| z-someone \| [near \| b-speaker]] \| v-shout | covered |
| 5.3b | Nobody answered. | `zal vezebel oel bahaber.` | z-none \| v-tell \| [toward \| b-←Ahaben.full] | covered |
| 5.4a | She had walked all day to get here, | `zahaber vowogal bazazam grawol hogom barl zahaber vuvudel oel bamadalamazal.` | z-←Ahaben.full \| v-walk \| [b-day \| g-one] \| [h-so-that \| b-that-clause] \| z-←←Ahaben.full.full \| v-go \| [toward \| b-hill] | covered |
| 5.4b | and her feet ached. | `zuvudalx em bahaber vagahum.` | [z-foot-x \| [used-by \| b-←Ahaben.full]] \| v-anguish | covered |
| 5.4c | She sat down on a flat stone and took off her boots. | `zahaber vehahel aol baragal gabogul xal valagel dubudalx ul buvudalx.` | [z-←Ahaben.full \| v-sit \| [on \| [b-rock \| g-pancake]] \| x-and \| v-carry \| d-boot-x \| [from \| b-foot-x]] | covered |
| 5.5a | As she rubbed her heels, | `zahaber duvudalx vamezal.` | z-←Ahaben.full \| d-foot-x \| v-massage | stand-in (L-13) |
| 5.5b | she noticed a small light moving among the trees. | `xagagal zahaber vamagal darl zabawal gamazam vuvudel am bedehulx.` | x-meanwhile \| z-←Ahaben.full \| v-find \| d-that-clause \| [z-bright \| g-small] \| v-go \| [amid \| b-tree-x] | covered |
| 5.5c | It came closer, slowly, | `zabawar vuvudel oel bahaber hezehom.` | z-←bright.full \| v-go \| [toward \| b-←Ahaben.full] \| h-slow | covered |
| 5.5d | as if it were unsure of her. | `zabawar thavom vevegam dahaber.` | z-←bright.full \| th-NOTIONAL \| v-doubt \| d-←Ahaben.full | covered |
| 5.6 | "Who are you?" she whispered. | `zahaber d[yol zehodon gar.] vagawalezebel.` | z-←Ahaben.full \| d-CITE[y-question \| z-listener \| g-who] \| v-whisper | covered |
| 5.7a | The light stopped. | `zabawar vazadal.` | z-←bright.full \| v-stop | covered |
| 5.7b | Then a voice, thin and old, said, "I was about to ask you the same thing." | `zadeham guvudum goladam d[zamagon thamam huhum brubul dorth vezebel behodon.] vezebel.` | [z-voice \| g-lightness \| g-elderhood] \| d-CITE[z-speaker \| th-plan-itinerary \| h-as-of.ledger \| b---e- \| d-that-same-question \| v-tell \| b-listener] \| v-tell | covered |
| 5.8a | Nadia laughed in spite of herself. | `zahaber valavol thuxeder.` | z-←Ahaben.full \| v-laugh \| th-CONSENT-unlikely | covered |
| 5.8b | Her fear, which had been heavy a moment before, | `zevehem garagam em bahaber habam barl zahaber valavor.` | [z-threat-appraisal \| g-heavy \| [used-by \| b-←Ahaben.full]] \| [h-before \| b-that-clause] \| z-←←Ahaben.full.full \| v-←laugh.full | covered |
| 5.8c | felt suddenly foolish. | `zeveher thahom hazebam gezeham.` | z-←fear.full \| th-FELT \| h-amazement \| g-crazy | covered |
| 5.9a | "I'm only a traveler," she said. | `zahaber d[zamagon gaxehebam gal.] vezebel.` | z-←Ahaben.full \| d-CITE[z-speaker \| [g-agent-x-voyage \| g-and]] \| v-tell | covered |
| 5.9b | "I lost the road hours ago." | `zahaber d[zamagon thevom bagazem g- ul borodal vuvudel. zamagon dorodar vamagaxel.] vezebel.` | z-←Ahaben.full \| d-CITE[z-speaker \| [th-WITNESSED \| [b-hour \| g-negative-unspecified.short]] \| [from \| b-road] \| v-go . z-speaker \| d-←road.full \| v-find-unable-temporary] \| v-tell | covered |
| 5.10a | "Then you are in the right place," said the voice. | `zadehar d[xodum zehodon ol behahem gegegal.] vezebel.` | z-←audio.full \| d-CITE[x-therefore \| z-listener \| [at \| [b-position \| g-correct]]] \| v-tell | covered |
| 5.10b | "Nobody finds this hill unless they are lost." | `zadehar d[zunan damadalamazal vamagal tholum barl zunar dorodal vamagaxel.] vezebel.` | z-←audio.full \| d-CITE[z-someone \| d-hill \| v-find \| [th-only-if \| b-that-clause] \| z-←someone \| d-road \| v-find-unable-temporary] \| v-tell | done (L-12) |

Notes on the covered rows. *When she reached the top, the sun had already set* is *the sun has already gone down while she arrives* (`hoham` + `huwem barl`); *the top of the hill* is *an up part of the hill* (`babahal gobom bamadalamazal`). *Filling with mist* is *the fog grows in the valley*. *Stood still for a long time* is *stood longer than typical* (`zehon zel hadaham`); *still* is left to *stand*. *Is anyone there?* is *is someone near me?* *Nobody answered* is *nobody spoke to her*. *Took off her boots* is *carried the boots off her feet* (`ul buvudalx`). *As she rubbed her heels, she noticed …* is two sentences joined by *meanwhile* (`xagagal`), since one sentence cannot hold both `huwem barl` and the `darl` for what she noticed. *As if it were unsure of her* is NOTIONAL (`thavom`). *I was about to ask you the same thing* is *as of a moment ago, I planned to ask you that question* (`huhum brubul`, `dorth`). *Laughed in spite of herself* is *laughed without letting herself* (`thuxeder`, consent presumed absent with no `/b/`). *A moment before* is *before she laughed*. *Felt suddenly foolish* is FELT with *sudden* (`hazebam`) and *crazy* (`gezeham`). *Only a traveler* puts the one-item join on the predicate (`gaxehebam gal`). *Lost the road hours ago* is *went off the road some hours ago and cannot find it now* (`bagazem g-`, `vamagaxel`), and *unless they are lost* is *only if they cannot find the road* (`tholum barl`). *The right place* is the *correct* place (`gegegal`), since bare *good* / *right* as praise has no root by design.

#### RS-6 — Argument / opinion {#rs-6}

The op-ed writer is the speaker (`zamagon`; *we* is `zamagonx`). Each *which* / *that* clause is its own sentence. *Company* / *firm* is *business* (`ebeve` -m), *workers* are `axawolx` as in RS-4, *the idea* is `ovu` -m, and *trial* / *test* is `udu`. A claim about companies or people in general uses the open fence (`zuam`), since **-x** is associative. Every line was checked with `node scripts/parse.mjs --check-lexicon --check-ambiguity`, and each bar fence was checked in the parse tree. Gaps are in [register-results](../meta/register-results.md); *done* and *covered* rows cite the `G-nn` or `L-nn` there.

| RS-6 | English | Agazan | Morph gloss | Verdict |
|------|---------|--------|-------------|---------|
| 6.1a | Many people believe that a four-day work week would make companies less productive. | `zebezalx thobam zel gral vevegal darl zuam gebevem davagem thobam duel gral vamevam thoyem barl zebever vawol bazazam gramol hruwol bagadam.` | [z-person-x \| th-PATTERN \| z-rank/more \| g-amount] \| v-think \| d-that-clause \| [z-everything.open \| g-business] \| [d-output \| th-PATTERN \| d-rank/less \| g-amount] \| v-production \| [th-if \| b-that-clause] \| z-←business.full \| v-sweat \| [b-day \| g-four] \| [h-divided-by-one \| b-week] | covered |
| 6.1b | I think they are mistaken. | `zevegar gegegal gul thunem.` | z-←think.full \| [g-correct \| g-not] \| th-INFERRED | covered |
| 6.2a | Admittedly, the evidence is still limited. | `yael zezegom thadotham zuel gral hagem.` | y-yes \| [z-evidence \| th-understanding-met-any-term \| z-rank/less \| g-amount] \| h-still | done (G-14) |
| 6.2b | Most trials have been small, | `zudumx g+100% ul g+50% gamazam.` | [z-experiment-x \| g-100yo] \| through-excluding \| g-50yo \| g-small | covered |
| 6.2c | and the companies that volunteered were probably already open to change. | `xal zebevemx verezem el budumx. zebever hoham thohum vemebam th+70.` | x-and \| z-business-x \| v-initiative \| [for \| b-experiment-x] . z-←business.full \| h-already \| th-WANT-unstated \| v-change \| th-70-percent-likely | covered |
| 6.3a | Even so, the results are hard to ignore. | `zamagonx thobam zel hawom dubuhumx vanevexal hezom barth.` | [z-speaker-x \| th-PATTERN \| z-rank/more \| h-effort] \| d-consequence-x \| v-neglect-able \| [h-although \| b-that-same-claim] | done (G-15) |
| 6.3b | Workers reported less stress, | `zezedum em baxawolx thenom zuel gral thewam baxawor.` | [z-tension \| [used-by \| b-agent-x-sweat-x] \| th-FORMER \| z-rank/less \| g-amount] \| [th-TOLD \| b-←agent-x-sweat-x] | covered |
| 6.3c | and the firms that took part kept their output, sometimes even raising it. | `xal zavagem em bebever thenom zael gral. zavager thenom zel gral har thezum.` | x-and \| [z-output \| [used-by \| b-←business.full] \| th-FORMER \| z-equal-rank \| g-amount] . [z-←output.full \| th-FORMER \| z-rank/more \| g-amount] \| h-sometimes \| th-MIRATIVE | covered |
| 6.4a | Why would that be? | `yam yol zarth thevem bar.` | y-soft-statement \| y-question \| z-that-same-claim \| [th-because \| b-who] | covered |
| 6.4b | Tired people make more mistakes, | `zuam gaxadadal thobam zel hral vabogam.` | [[z-everything.open \| g-agent-x-tired] \| th-PATTERN \| z-rank/more \| h-how-often] \| v-flaw | done (G-13) |
| 6.4c | and rested people work better than exhausted ones. | `xal zuam gaxenaham thobam bebezalx gadadam zel hamedam vawol.` | x-and \| [[z-everything.open \| g-agent-x-rest] \| [th-PATTERN \| [b-person-x \| g-burnout]] \| z-rank/more \| h-achievement] \| v-sweat | done (G-13) |
| 6.4d | This is not a new idea. | `zarth gunuham gul.` | z-that-same-claim \| [g-novelty \| g-not] | covered |
| 6.5a | Critics say that some jobs simply cannot be compressed. | `zaxahahumx vezebel darl debevemx g+ vagabexul.` | z-agent-x-judgment-x \| v-tell \| d-that-clause \| [d-business-x \| g-more-than-one.short] \| v-pressure-unable-irreversible | covered |
| 6.5b | A hospital cannot close on Fridays. | `zuam gahazol valagaxul huwem belagam greval.` | [z-everything.open \| g-hospital] \| v-restriction-unable-irreversible \| [h-while \| [b-weekday \| g-5th]] | covered |
| 6.5c | That is true, but it is not an argument against trying elsewhere. | `yael. xagezal dovum vudum ol bur thegather hezom barth.` | y-yes . x-but \| d-commentary \| v-experiment \| [at \| b-other] \| th-sake-ought-trial \| [h-although \| b-that-same-claim] | covered |
| 6.6a | I should say that I may be biased: | `thaveham zamagon thovum vevegal thegathom.` | th-revelation \| z-speaker \| th-MAY \| v-think \| th-sake-motive-any-term | done (G-16) |
| 6.6b | I have worked long hours for years, | `zamagon thobam zel hadaham vawol bavawem g+ hagem.` | [z-speaker \| th-PATTERN \| z-rank/more \| h-duration] \| v-sweat \| [b-year \| g-more-than-one.short] \| h-still | covered |
| 6.6c | and I would like to believe it was not necessary. | `xal zamagon thohum vevegal darl zamagon thegatham zel hadaham vawor.` | x-and \| z-speaker \| th-WANT-unstated \| v-think \| d-that-clause \| [z-speaker \| th-sake-met-any-term \| z-rank/more \| h-duration] \| v-←sweat.full | done (L-14) |
| 6.7 | Still, if the choice is between a small risk and a system that burns people out, I know which one I would take. | `xezol zamagon thavor dowawom gamazam dadebam gadadam dol vahum. zamagon vubugam dorl zamagon dor vahum.` | x-however \| z-speaker \| th-NOTIONAL-suppose \| [[d-risk \| g-small] \| [d-organization \| g-burnout] \| d-or-exactly-one] \| v-choice . z-speaker \| v-knowledge \| d-whether-clause \| z-speaker \| d-which \| v-choice | covered (G-17) |
| 6.8a | If we never test the idea, we will never know whether it works. | `zamagonx thavor dovum vudum hal. xodum zamagonx thunel bral hal vubugam dorl zovur vamedam.` | z-speaker-x \| th-NOTIONAL-suppose \| d-commentary \| v-experiment \| h-never . x-therefore \| z-speaker-x \| [th-INFERRED.strong \| b-later] \| h-never \| v-knowledge \| d-whether-clause \| z-←commentary.full \| v-achievement | covered (G-17) |
| 6.8b | Surely that is reason enough to try. | `dovum vudum thegathem thevem barth thunel.` | d-commentary \| v-experiment \| th-sake-ought-offered \| [th-because \| b-that-same-claim] \| th-INFERRED.strong | covered |

Notes on the covered rows. *Many people* is *more people than usual* (`thobam zel gral`). *Companies* in general is `zuam gebevem`, and the *if* clause resumes it (`zebever`): each business, if it works four days a week (`hruwol bagadam`), makes less output than usual (a bar fence on the object, `davagem thobam duel gral`). *They are mistaken* is *their thinking is not correct*, with the verb resumed as a noun (`zevegar`) and the writer's own reasoning as the channel (`thunem`). *Admittedly* is *true:* plus the body (`yael …`). *Limited* is *not enough for understanding* (`thadotham zuel gral`); *still* goes after the fence, since a word between the item and its bar breaks the fence. *Open to change* is *wanted to change*, and *probably* is `th+70`. *Even so* is *despite that* (`hezom barth`). *Hard to ignore* is *we can ignore them only with more effort than usual* (`thobam zel hawom`, the *easily* route from say-amounts turned around). *Workers reported* is TOLD with the workers as the source. *Kept their output* is *as much output as before* (`thenom zael`), and *even raising it* is *sometimes more, which I did not expect* (`har thezum`). *Why would that be?* muses (`yam yol`) about the last claim (`zarth`). *Tired people* and *rested people* are the open fence on an agent compound (`zuam gaxadadal`, `zuam gaxenaham`), ranked against a PATTERN bar (G-13); *better* is *more successfully* (`hamedam`), against the pattern of exhausted people (`thobam bebezalx gadadam`). *Critics* are *judges* (`zaxahahumx`), and *cannot be compressed* is *can never be squeezed* (`agabe` *clamp*, `-xul`), with no subject. *On Fridays* is *during the fifth weekday* (`belagam greval`). *Not an argument against trying elsewhere* is *despite that, testing the idea elsewhere is worth a try* (`thegather`, `hezom barth`). *I should say* is *to be honest* (`thaveham`), and *biased* is *I may think this for a stake of my own* (motive `thegathom`). *Long hours* is *longer than usual*, and *for years* is a measure plus *still* (`bavawem g+ hagem`). *It was not necessary* is *I worked longer than any need required* (the sake bar `thegatham zel`). *If the choice is between A and B* is *suppose I pick one of A and B* (`thavor … dol vahum`), and *I know which one I would take* is *I know which I pick* (`vubugam dorl … dor vahum`), since one sentence cannot hold both `thoyem barl` and `dorl`; *a system that burns people out* is *a burnout system* (`dadebam gadadam`). *If we never test it* is likewise *suppose we never test it*, then *therefore*; *know whether it works* is *know whether it succeeds* (`vubugam dorl … vamedam`), forecast on strong inference. *Surely that is reason enough to try* is *it follows that we ought to test the idea because of that* (`thunel`, `thegathem thevem barth`). Words covered by existing roots: *mistake* (`aboga` *flaw*), *stress* (`ezedu` *tension*), *compress* (`agabe` *clamp*), *critic* (agent-x-judgment), *Friday* (the fifth weekday).

#### RS-7 — Support conversation {#rs-7}

Mara is the speaker (`zamagon`) and Ines the listener (`zehodon`) in each line's own turn, as in RS-1. Mara's sister is `zebezal geveval grebazol bamagon` (kin words, say-people-places.md), resumed as `zebezar`. Neither speaker can assert the other's feelings, so a feeling that belongs to the other person carries a holder seam on the channel that gives access to it (knowing.md § whose view): `thunemehodon` (*I gather you …*), `thewamehodon` (*you tell me you …*), `thunelebezar` (*I could tell she …*). Every line was checked with `node scripts/parse.mjs --check-lexicon --check-ambiguity`. Gaps are in [register-results](../meta/register-results.md); *stand-in* and *awkward* rows cite the `G-nn` there.

| RS-7 | English | Agazan | Morph gloss | Verdict |
|------|---------|--------|-------------|---------|
| 7.1a | I don't even know why I'm upset. | `thanathumuor.` | th-relatedness-unmet-modifiable-UNPLACED-SURGING | covered |
| 7.1b | It's such a small thing. | `zar welavam gamazam.` | z-something \| [w-very \| g-small] | covered |
| 7.2a | It doesn't sound small to me. | `yuem.` | y-no-soft | covered |
| 7.2b | Do you want to tell me what happened? | `yom zehodon thohum vezebel bamagon dorl var.` | y-soft-question \| z-listener \| th-WANT-unstated \| v-tell \| b-speaker \| d-whether-clause \| v-what | covered |
| 7.3a | I forgot my sister's birthday. | `zamagon debeval em bebezal geveval grebazol bamagon thevom vevom vul.` | z-speaker \| [d-birthday \| [in-use-of \| [b-person \| g-female \| [g-#-e0 \| b-speaker]]]] \| th-WITNESSED \| [v-memory \| v-not] | covered (G-21) |
| 7.3b | She didn't say anything, | `zebezar thevom vezebel dal.` | z-←person.full \| th-WITNESSED \| v-tell \| d-nothing | covered |
| 7.3c | but I could tell she was hurt. | `xagezal thanathumar thunelebezar.` | x-but \| th-relatedness-unmet-modifiable-INTERNAL-SURGING \| th-INFERRED.strong-←person.full | covered (G-19) |
| 7.4a | That sounds painful. | `thanathumar thunemehodon.` | th-relatedness-unmet-modifiable-INTERNAL-SURGING \| th-INFERRED-listener | covered (G-22) |
| 7.4b | It makes sense that you feel guilty. | `wadotham gobum zarl zevor wanathumam gobum thunemehodon.` | [w-understanding-met-any-term \| g-stimulus] \| z-that-clause \| [z-←memory \| [w-relatedness-unmet-modifiable-INTERNAL-FLOWING \| g-stimulus]] \| th-INFERRED-listener | covered (G-18, G-19) |
| 7.5a | Everyone else remembers these things. | `zamagon zuam gebezal vevom debevalx.` | [z-speaker \| z-everything.open \| g-person] \| v-memory \| d-birthday-x | covered |
| 7.5b | I'm a terrible sibling. | `zamagon gebezal grebazol bebezar thanathul bebezar.` | [z-speaker \| g-person \| [g-#-e0 \| b-←person.full]] \| [th-relatedness-unmet-irreversible \| b-←person.full] | covered |
| 7.6a | I hear that you're being hard on yourself. | `zehodon dehodor vahahum hanavam thunem.` | z-listener \| d-←listener \| v-judgment \| h-severity \| th-INFERRED | covered (G-22) |
| 7.6b | Can I offer another way to look at it? | `yom zamagon behodon vezebel devewem dur thegom.` | y-soft-question \| z-speaker \| b-listener \| v-tell \| [d-perspective \| d-something-else] \| th-PERMIT-granted | covered |
| 7.7 | Okay. | `yaol.` | y-sure | covered |
| 7.8a | You forgot a date, | `zehodon thewam dazazam vevom vul.` | z-listener \| th-TOLD \| d-day \| [v-memory \| v-not] | covered |
| 7.8b | and you feel bad because you love her. | `xal thanathumam thewamehodon. zarth thevem barl zehodon debezar valaval.` | x-and \| th-relatedness-unmet-modifiable-INTERNAL-FLOWING \| th-TOLD-listener . z-that-same-claim \| [th-because \| b-that-clause] \| z-listener \| d-←person.full \| v-cherish | covered |
| 7.8c | Those are two different things. | `zevor gumum balavar gul.` | z-←memory \| [[g-like \| b-←cherish.full] \| g-not] | covered (G-23) |
| 7.8d | One is a mistake; | `zevor gabeyom.` | z-←memory \| g-mishap | covered (G-23) |
| 7.8e | the other is who you are. | `zalavar gobom behodon.` | z-←cherish.full \| [g-part-of \| b-listener] | covered |
| 7.9a | I guess so. | `yaem.` | y-yes-soft | covered |
| 7.9b | I just don't know what to say to her. | `yam yol zamagon bebezar dar vezebel.` | y-soft-statement \| y-question \| z-speaker \| b-←person.full \| d-what \| v-tell | covered (G-17) |
| 7.10a | You could tell her the truth: that you're sorry, and that she matters to you. | `zehodon bebezar haveham vezebel d[thanathum behodon. zehodon wanathal gobum.] thanather.` | z-listener \| b-←person.full \| h-revelation \| v-tell \| d-CITE[th-relatedness-unmet-modifiable \| b-listener . z-listener \| [w-relatedness-met-lasting \| g-stimulus]] \| th-relatedness-ought-trial | covered |
| 7.10b | You don't have to do it today. | `zehodon thegom huwem bazazam grazol vezebel vul.` | z-listener \| th-PERMIT-granted \| [h-while \| [b-day \| g-zero]] \| [v-tell \| v-not] | covered (G-20) |
| 7.11a | Thank you for listening. | `thanatham thevem barl zehodon vewal.` | th-relatedness-met-any-term \| [th-because \| b-that-clause] \| z-listener \| v-hear | covered |
| 7.11b | I really needed someone to. | `! zamagon thevom dunan volum.` | ! \| z-speaker \| th-WITNESSED \| d-someone \| v-need | covered (L-15) |
| 7.12a | I'm glad you told me. | `zehodon bamagon vezebel thanathamam.` | z-listener \| b-speaker \| v-tell \| th-relatedness-met-any-term-INTERNAL-FLOWING | covered |
| 7.12b | I'm here whenever you want to talk more. | `zamagon vewal thuxegom hual huwem barl zehodon thohum hagem vezebel.` | z-speaker \| v-hear \| th-CONSENT-given \| h-always \| [h-while \| b-that-clause] \| z-listener \| th-WANT-unstated \| h-still \| v-tell | covered |

Notes on the covered rows. *I don't even know why* is the UNPLACED locus (`uo`, *I can't place where it comes from*), so the feeling word alone says it. *Such a small thing* is *something very small*. *It doesn't sound small to me* answers Mara's claim with the soft *I don't think so* (`yuem`). *What happened* in a request to tell is the blank verb under `dorl`. *I could tell she was hurt* is a strong inference with the sister as holder; *upset* / *hurt* is unmet relatedness, held inside, surging (say-reasons.md § sake words). *That sounds painful* is the same feeling with Mara as holder, on Ines's inference. *It makes sense that you feel guilty* is a stance on Mara's stance: Ines's own sake word in the main sentence, and Mara's feeling about the forgetting (`zevor`) in the dependent, with Mara as holder (knowing.md § whose view). *Everyone else* is *every person but me* (a leftover before `zuam`, open because it is a sweeping claim), and *these things* are birthdays. *A terrible sibling* has no bare evaluative (say-reasons.md § wrong): *being her sibling harms her bond, for good*. *Hard on yourself* is *you judge yourself severely* (`vahahum` *criticize*, `hanavam` from `anava` *severity*), inferred. *Can I offer* is *may I tell you* under a soft question (sakes.md § permission), and *Okay* takes up the offer (`yaol`). In 7.8a Ines repeats what Mara told her, so the channel is TOLD, and *a date* is *a day*. In 7.8b the feeling is Mara's (TOLD with her as holder), but *because you love her* is Ines's own claim, so it goes in its own sentence about that claim (`zarth thevem barl`); one sentence would make the reason Mara's too. *Who you are* is *part of you* (`gobom`). *I don't know what to say* is a musing fill-ask (`yam yol`), as in RS-6. *The truth* is told *revealingly* (`haveham`, the manner reading of the speech-manner root), the words Mara would say are a cite, and *you could* is a suggestion worth trying (`thanather`). Inside the cite, *you matter to me* is *you serve my bond, lastingly*, with the sister as an unowned stimulus. *Thank you for listening* is met relatedness with the listening as its cause. *I really needed someone to* is *I needed someone*, stressed with `!`; `thanathar` (*thanks, that got me through*) would say it in one word. *I'm glad you told me* is a feeling on the clause (sakes.md § feeling with no object). *I'm here whenever you want to talk more* is a soft commitment (`thuxegom`, *I'll do it*, not a vow) to listen whenever Mara wants to keep talking.

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
| 2 — Real-text sampling | [~] | 2026-10-01 |
| 3 — Extension sweep | [ ] | |
| 4 — Triage and proposals | [ ] | |
| 5 — Apply | [ ] | |

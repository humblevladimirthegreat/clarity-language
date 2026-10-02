# Design decisions

Editors only — not linked from grammar pages. This page records design decisions a reader **cannot see** in the grammar docs: deliberate omissions (forms the language chooses not to have), readings settled between two plausible options, and the reason behind a choice that would otherwise look like a gap. Grammar pages present only the current language, so anything they already teach does not belong here; add an entry only when the decision leaves no trace on a teaching page.

Do not re-raise these as gaps or inconsistencies. An English job that only an omitted form would serve is **covered** when the meaning has a natural route.

## By design

| ID | English job / source form | Current route | Verdict | Owning page | Proposal | Priority |
|----|---------------------------|---------------|---------|-------------|----------|----------|
| D-01 | copula *to be* as a verb | property on `/ɡ/`, kind on predicative `/ɡ/` (`yal zazawan godogal`), identity **`SAME`** | by design | predication.md | — | — |
| D-02 | grammatical past / future tense, progressive aspect | time via `/h/` lexicon, clock / date, closed moods; **RESIDUE** / **FORMER** are standing, not tense ([knowing](../grammar/knowing.md#evidentiality): verbs have no past or future letter) | by design | knowing.md, glosses.md | — | — |
| D-03 | article *the* for an already-mentioned kind | resume **-r** | by design | pronouns.md | — | — |
| D-04 | single *cause* arrow word (*X causes Y*) | two-place poles **`oye`** / **`olu`** / **`eve`** / **`eda`**; **CAUSE** mood | by design | causation.md | — | — |
| D-05 | metric prefixes (*kilo-*, *milli-*) and unit abbreviations | scaled amount on the base unit | by design | numbers-applied.md | — | — |
| D-06 | generic plural / *every K* via plural marking | universals joins (`zual gagadul`), the kind itself (`zuan gagadul`), habitual **`hual`**; **-x** is associative | by design | plurality.md, joins.md | — | — |
| D-07 | written capitals for names | named **-n** / **`@`**; native text is unicase | by design | phonology.md, word-endings.md | — | — |
| D-08 | sentence-final `?` / `!` carrying force | act word carries force; tone marks are prosody only; sentences end in `.` | by design | speech-moves.md | — | — |
| D-09 | *attacker*-style agent-noun lexicon | role compounds **`a` / `e` / `u` / `o` x ROOT** | by design | roles.md | — | — |
| D-10 | neutral past / *earlier* / bare *now* word | signed offset on a channel ([knowing#dated-channel](../grammar/knowing.md#dated-channel)): `thevom bagazem g-3`; forecast (channel + `b+`) / PLAN `+`; *just* / *about to* = `b-e-` / `b+e-` | by design | knowing.md | Every offset from now sits on an evidential or forecast (channel + `b+`) / PLAN; wrong sign on a one-way channel is not a sentence. A signed offset in a time pole's `/b/` is allowed only when the clause is a command, request, or PLAN, or carries a channel. A signed offset in as-of `/b/` is allowed only on stance as-of (`thuhum` / `thuram`), which dates the speaker's stance, not the event; `huhum` / `huram` / `wuhum` keep dates, event nouns, and `barl` clauses. Absolute dates stay channel-free | — |
| D-11 | single-item clause join (`A xul` *not the case that A*, `A xal` *only A happened*) | clause `/x/` joins go between clauses only; deny / focus on the verb or noun (`vowogal vul`, `zazawan zal`); stand-in items (`A xol xal` *optionally A*, `A xam xar`, `A xel xur`, `xual ul A`) — [joins#clause-joins](../grammar/joins.md#clause-joins) | by design | joins.md | — | — |
| D-13 | short *I* / *you* pronouns | *speaker* **`amago`** / *listener* **`ehodo`** are five-letter on purpose (`FORCE_LONG` in `src/lexicon-place.ts`), so names or a dropped subject are the easier choice; inclusive *we* **`aha`** stays short. `ehodo` is always the person actually listening; generic *you* / *one* is the [generic pronoun](../grammar/pronouns.md#generic-pronoun). The topic pronoun (`zozan`) is a short *I* / *you* only inside a stretch the speaker overtly made about themself (`xamagon`, `xehodon`) | by design | pronouns.md | — | — |
| D-14 | *I hope X will happen* as a forecast | hope is not evidence, so a forecast still needs a channel: `thevegem thahor brabum …` ([say-reasons](../grammar/say-reasons.md#hope-forecast), [sakes](../grammar/sakes.md#speaker-attitude)) | by design | sakes.md, say-reasons.md | — | — |
| D-15 | an act as someone's (*the monkey's tricks*, *the sound of the drums*) | the act is its own sentence, then resumed, the same pattern as *who / that / which* ([dependents](../grammar/dependents.md#which-noun), [say-people-places](../grammar/say-people-places.md)); something that only comes from B is origin `gagum` + `/b/`; `em` never takes an act | by design | dependents.md, say-people-places.md | — | — |
| D-16 | bare evaluatives (*good*, *bad*, *nice*, *great*, *wonderful*, *excellent*, *lovely*, *terrible*, *awful*, *horrible*, *fantastic*, *brilliant*, *quality*) as roots | no root. Say whose need it serves (met / unmet sake), rank against a stated bar, or name the specific quality ([say-reasons](../grammar/say-reasons.md#sake-words), [comparatives](../grammar/comparatives.md#stance-bars)) | by design | sakes.md, comparatives.md | — | — |
| D-17 | *the latter* / *the former* (the second / first of two just named) | when the two filled the same role, the latter is the [role pointer](../grammar/pronouns.md#role-pointers) `zaxar` and the former is *the other one* `zaxor`; otherwise whole-stem **-r** names either. When both are names, the [ordinal pronouns](../grammar/pronouns.md#ordinal-pronouns) count by **introduction** order (`z=#-1` / `z=#-2`), not by most recent mention | by design | pronouns.md | — | — |
| D-18 | *he* / *she* / *it* (a short pronoun split by gender or animacy) | no category pronouns: a single *it* would give up mechanical matching, and a gender split conflicts with the project's aims. Short reference is a [role pointer](../grammar/pronouns.md#role-pointers) (by the part played in a recent event); anything else is whole-stem **-r**. Pointers are third person only (D-13) | by design | pronouns.md | — | — |
| D-19 | role pointer lookup limits | settled readings: lookup is unbounded (no stop at a turn or paragraph) and every speaker's clauses count; *the other one* (`o`) takes only the doer, undergoer, and extra party, because the other roles are often implicit and could not be compared; the scene's overt filler is the first place hook's `/b/`, else *during*'s (*before* / *after* / *until* / *by* and *as-of* are reference points, not the scene); a joined slot, rank joins included, is one group filler; event nouns are not anchors | by design | pronouns.md, roles.md | — | — |
| D-20 | a topic inferred from salience, first mention, or being the subject; a topic stack | the [topic](../grammar/pronouns.md#topic) is set only by an overt `/x/` word, so every tool computes the same topic at every point, and every return is spelled out (`xazawar`). Topic words never sit in a dependent, after a clause join, or in an aside; a quote keeps its own topic and count; **-x** is allowed on `/x/` topic nouns; the topic never takes an ordinal | by design | pronouns.md | — | — |
| D-21 | generic *they* (*they say*) | none: English *they say* is [hearsay](../grammar/knowing.md#evidentiality). Generic *one* / *you* is [`oben`](../grammar/pronouns.md#generic-pronoun), which takes no ordinal and no **-x** | by design | pronouns.md, knowing.md | — | — |
| D-23 | polar `oe`; stacks after ability **x** or sake / scope **th**; a new tone mark (`~`, whisper, sarcasm); combined tone marks (`%!`, `!?`) | none. *It depends* is MAY or a sentence; *can again* is `xa` plus a sentence; `;` `%` `?` already cover quiet, sarcasm and hesitation, and `~` is the opaque marker. `?!` is one recognized blend, so an open stack grammar would make `!?` and `?!` two spellings of one sound; mix tones by marking a word inside a marked sentence | by design | speech-moves.md, questions.md, intention.md | — | — |
| D-22 | lean **`l`** on other role letters; `/w/` before nouns and verbs; a hosted `/b/` after `/z/` / `/d/` / `/v/` / `/w/`; a dropped subject read as the topic | none. A noun modifying a noun is mid-word **`x`** ([x-compounds](../grammar/x-compounds.md#ordinary-compound-order)); a verb root in `gl-` or `/ɡ/` is the participle; degree on a verb is a degree word before a manner adverb; a `/b/` after those hosts is the unhosted recipient. A dropped subject stays unmentioned, and the topic doer is always written `zozan` | by design | clause.md, pronouns.md | — | — |
| D-24 | a role pointer on `/y/`, `/x/`, `/v/` `/ɡ/` `/h/` `/w/` (`yaxar`, `xaxar`, `vaxar`); an ordinal in a vocative (`yredur`); **-x** on `/h/` `/w/` `/th/` and the six linkers; a nonspecific *someone* as a topic or with **-x**; the topic pronoun as a topic word or resume (`xozan`, `zozar`) | none. A pointer picks a participant by its part in an event, so it fills `/z/` `/d/` `/b/` and a holder slot only; a call or a topic return names the stem (`yazawar`, `xazawar`), so the listener and every tool read one topic from the words alone; *do so* and *such* are whole-stem **-r**; ordinals exist only for names you can already call by name. **-x** names a group of referents or structures an event or property, and a plural adverb, degree, stance or linker has no reading; stances belong to holders, who take **-x**. `unan` names no group, so *some people* is `obelx`; the topic pronoun is the topic itself | by design | pronouns.md, plurality.md | — | — |
| D-25 | a count or fraction on `/w/` (`w+N`, `w-N`, `w_N`); a place on a scale from the end (`w#-N`) or first place (`w#1`); `w#N` outside a single-name `zel` / `zuel` frame | a factor is `hradul` / `hrudul` on `/h/` ([factor](../grammar/comparatives.md#factor)); first place is the plain superlative; *second from the bottom* is `zuel` + `w#2`. `w#N` (from 2) is taught only as a place on a scale, so it needs one name before `zel` / `zuel` to rank within | by design | comparatives.md, numbers.md | — | — |
| D-26 | `th-N`, `th#-N`, `th#1`; positive or ordinal-count marker stacks `rao` / `rae` | none. `th#N` from 2 is [N-th hand](../grammar/knowing.md#hand-depth); first-hand is a channel word, and a minus or end-relative rank on a stance has no guessable reading (likelihood is `th+N`, source `th_N`). Labels carry no sign (`_44`), and a count and a rank are separate markers on separate words, so `rao` / `rae` read as nothing a learner could guess | by design | numbers.md, knowing.md | — | — |
| D-27 | `her` / `wer` (unspecified ranked occasion); bare restrictors beyond `hal` / `hual` / `har` / `hor` / `hur` (`hol`, `hel`, `hoel`, `haol`, `hul`, `huol`, `hael`, …); **-n** on `/w/` (`wan`, …); `wazem` before **-r** / **-n** | none. `her` has no English job and is regularity only. A restrictor with no occasions can only read *never* or *always*, which `hal` / `hual` already own, and the other bare forms would collide with them (`hul` = `hual`, `huol` = `hor`). `/w/` is never a phrase-list item, so there is no package for **-n** to name, and *respectively something* has no reading | by design | restrictors.md, joins.md | — | — |
| D-28 | a cite, mention or opaque span under `/th/`; an aside under any role but `/th/`; any span under `/w/` | none. Under `/th/` the only span is the aside; a degree word is a closed class with no loan reading. An `/x/` cite, mention or opaque is a [topic word](../grammar/pronouns.md#topic) (`x@[onodan alahen]`, `x{odoga}`, `x@<Sam>`). An opaque span in a verb, adjective, adverb or recipient slot is the foreign word in that part of speech (taught in spans.md § Outer slot). A quoted question keeps its act word inside a spoken cite ([act words in a quote](../grammar/spans.md#quote-acts)); a reported question is `dorl` ([reported questions](../grammar/say-questions.md#reported-questions)) | by design | spans.md | — | — |
| D-29 | clause sequence **-n** beyond `xan` `xon` `xun` `xaon` (`xuan` `xuon` `xen` `xaen` `xoen` `xuen`); stacked **-r** on `/v/` `/x/` `/ɡ/` joins (`vaor`, `xuar`, `gaor`) | none. A sequence is already ordered, so an order vowel adds nothing, *first of all* and *finally* are `xrebul` / `xrebal`, and `xen` / `xon` / `xun` are also the departure marks after a name. Stacked **-r** exists only as the `/th/` fill-ask; the parser rejects it elsewhere (`stackedJoinResume`) | by design | join-across-roles.md | — | — |
| D-30 | a social tie on `/h/` (`hemezem bazawan`); DECISION, ATTEMPT, bans, refusals, RESIDUE, MAY, MIRATIVE, CAUSE or a pole as a bar (`thehum zel`, `thudum zel`, `thedel zel`) | none. The doer is a noun in the clause, so a tie on it already says *as a friend of* (`zalahen gemezem bazawan vowogal`), and an adverb would only add a second word for it. A decision or an attempt commits to an act and sets no level; a ban and a refusal are the other side of PERMIT and CONSENT, which are bars; *than decided* is PLAN. WANT is a bar (it sets the level wanted) | by design | relations.md, comparatives.md | — | — |

## Bare evaluatives

- A bare evaluative hides two things the language wants audible: **whose** need or taste the judgment serves, and **what bar** it is measured against. Agazan has no root for it, so a speaker cannot say *good* and leave both unsaid.
- Routes, by what the English word was hiding:

| Hidden job | Route |
|------------|-------|
| serves someone's need (*good for me*, *useful*) | met sake `…tham` / `…thal` / `…thar`, with the person in `/b/` for someone else's sake |
| harms a need (*bad for*, *wrong for*) | unmet sake `…thum` / `…thul` / `…thur` |
| better or worse than a standard (*good at*, *poor*) | rank `zel` / `zuel` against a `/th/` bar: PATTERN `thobam` (*than usual*), FELT `thahom` (*than expected*), REQUIRE `thumem` (*than I demand*), or a met sake bar |
| a particular quality (*lovely*, *terrible*, *brilliant*) | the content root for that quality: delight, love, beauty, anguish, kindness, intelligence, shine |
| intensity (*great*, *wonderful*, *awful*) | a degree word (`welavam`, `wohahal`) or an exclamation on the specific root |

- The rule is about **bare** evaluatives only. Roots whose sense is itself a quality (delight, beauty, anguish, safety) stay roots. Descriptive adjectives measured on a scale (*expensive*, *weak*, *thick*, *far*) are not evaluatives: they are written against a bar ([say-amounts](../grammar/say-amounts.md#bar-words)).
- *Effective*, *practical* and similar judgments reduce to what the thing does for a sake (`gulotham`) or a rank of the result against a bar, so they are not roots either.
- Do not re-raise a bare evaluative as a lexical gap. If a learner needs a new specific quality, add a root for that quality, not for the evaluation.

## Stance time and emotional blame

- No separate stimulus-timing words: a channel + offset in an emotion-compose clause dates the stimulus, and the `/th/` *as-of* pair dates the stance.
- AIMED (direction locus `o`) never carries blame; fault lives only on the because-pole ending.
- The because-pole `/b/` should be an act or a thing, not a bare person. This is guidance, not parser-enforced: a named `/b/` can be a named event or place.

## Emotion compose: motion, strength, objects

- Motion (**-r** / **-m** / **-l**) is only how a feeling moves: in waves, steadily, or not at all. Strength is never on the motion ending; it is a degree word on `/w/` right before the feeling word. Before a `/w/` feeling, that degree word grades the feeling, not the stimulus (the parser brackets stacked `/w/` flat; the reading is the doc rule).
- A lone `/th/` feeling word, with no clause body, is the speaker's feeling with no object (predication about the speaker). Thanks (`thanatham.`) is the same construction, not a special *that act* reading. Sorry keeps its `/b/`: after a tail-less sake word, `/b/` names whose stake.
- A lone feeling with a channel + offset has a real but unnamed stimulus; the offset dates it.
- Someone else's objectless feeling goes through a holder (`thulothuruor thunemalahen`). A noun before a lone feeling is an existence clause, so `zalahen thulothuruor` is *anxious that Alahen is here*, never *Alahen is anxious*. There is no experiencer adjective: it would bypass the holder warrant.
- Understanding is its own sake, not part of competence: boredom with an easy task is competence met and understanding unmet, and the two call for different help. Novelty for its own sake stays under pleasure.
- Surprise is not a sake. It is the MIRATIVE (`thezum`), a closed `/th/` mood separate from the eight channels: it says nothing about how you know, stacks with a channel, and takes no holder seam (a holder elsewhere in the clause makes it the holder's).

## Bars

- A rank fence (`zel` / `zuel` / `zael`, and their **-m** forms) takes, as its comparee, either a noun or exactly **one `/th/` stance word that sets a value**: a met sake, a channel, FORMER, NOTIONAL, PLAN, WANT, ABIL, REQUIRE, PERMIT, CONSENT, or a speaker attitude. Each keeps its own ending table, hosted `/b/`, holder seam, dated offset, and `barl` ([comparatives](../grammar/comparatives.md#bars)).
- **No named -n bars.** A closed list of standards (root + **-n** under `/z/` `/d/` `/b/`) duplicated what the stance words already say, hid *how you know* the standard, and needed a placement rule to keep sake bars apart from judgment bars. Each old bar maps onto a stance:

| Old bar | Why it went | Say instead |
|---------|-------------|-------------|
| Typical | the usual case is a pattern of cases | PATTERN `thobam`, no `/b/` (the item's own usual level, or the usual case here) |
| Average | a population's usual level; mean vs mode was never audible | PATTERN with the population in `/b/` |
| Social / Professional | a peer or expert population, or their rule | PATTERN with that population in `/b/`; or REQUIRE `thumer` (custom) / `thumel` (rule) |
| Everyone | a single-item superlative already ranks against the whole group in play | a superlative, or PATTERN with the class in `/b/` |
| my standard | the speaker's normative bar is a demand or a hope | REQUIRE `thumem` (no `/b/`: the speaker's demand), or the attitude `thevegem` |
| Best-effort | the limit of what can be done is ability | ABIL `thezexal` (tie = *as … as possible*) |
| the nine sake bars | a met sake word already names the sake, and its ending adds the payoff horizon | the met sake word: `thegatham`, `thoyutham`, … |

- Stances that set no value are not bars: clause poles, MAY, MIRATIVE, DECISION, ATTEMPT, RESIDUE, CAUSE, and the deontic noes (FORBID, refused consent). WANT is a bar (it sets the level wanted; added in the wave 8 review). The parser rejects the rest (`barKind`), and a second comparee next to a bar, noun or bar (`barCount`).
- A bar sits right before the join word, after the one ranked item (and after that item's own hook + `/b/`, as before a join word). A stance word after the fence is the claim's stance. With a bar and no ranked item, the stance word stays outside the fence.
- A holder seam on a bar names whose expectation it is; inside the fence the seam covers only the bar, not the ranking.
- A closed `ua` fence (`zual` / `zuam` / `zuan` + kind) right before a bar is the one ranked item, nested by right-close: `zuam gaxadadal thobam zel hral` *tired people err more often than usual*. Kind against kind is not two fenced items (a second `…uan` after items is a named bundle); the other kind goes in the PATTERN bar's `/b/` (`thobam bobelx gadadam`). Other fences (`zul` + kind) do not rank this way. An adjective after a bar's `/b/` describes that noun, as after any host.
- A bar's `barl` ends its sentence at the fence: noun parts after the scale start the grounds sentence.

## Contrary to a stance (`uem` + `/th/`)

- **`uem`** directly before a `/th/` stance holds it as the frame the event goes against ([sakes](../grammar/sakes.md#contrary-to-stance)). Position decides, as with rank-fence bars: the same word anywhere else in the clause is a stance on the claim. The frame keeps its ending table and hosted `/b/`; a holder seam on a channel frame covers only the frame.
- **Criterion:** the stance must have content the event can contradict: a norm, an intention, a wish, a report, or an expectation. The parser rejects the rest (`frameKind`).

| Kind | Frame? | Why |
|------|--------|-----|
| FORBID (`ede`), REQUIRE (`ume`), refused CONSENT (`uxede`) | yes | a norm or a person's no; *against the rules* / *against orders* / *against their will* |
| PERMIT (`ego`), given CONSENT (`uxego`) | no | they only lift a restriction, so an act cannot go against them; going beyond what was allowed is a ban or a refusal frame |
| PLAN, DECISION, WANT (all endings, **-n** included) | yes | an intention or a wish. Owner is the subject, or the hosted `/b/` person, as on the clause |
| speaker attitude (content root on `/th/`) | yes | the attitude's object is what you hoped or feared. An attitude with no content of its own (*luckily* `theledem`) makes no sensible frame; the parser does not police root meaning, and pages teach only hope |
| all eight channels, with or without a holder | yes | a report or an expectation; LIVE is *contrary to appearances* |
| MIRATIVE | no | it already says *against expectation*; pairing it with `uem` doubles the contrast |
| MAY, NOTIONAL | no | a possibility or an imagined scene is held by no one as true; *contrary to what I imagined* is FELT |
| RESIDUE, FORMER | no | a balance still on the books or a climate already over is nothing an event goes against; *unlike before* is a PATTERN frame |
| sake words (met, unmet, prescription, motive, emotion compose) | no | *against Alahen's interest* is an unmet sake word on the clause (`thegathum balahen`), which already says it |
| clause poles, CAUSE, ATTEMPT, ability, stance numbers | no | relations, mechanisms, or the act's own trying; *against the rule* is FORBID / REQUIRE |

- **No hook + `barl` except `ul`** (`hookStandIn`). *Contrary to* an event is `hezom barl`; *against a stance* is `uem` + the stance. No job turned up that needs `uem barl`.
- **In-clause hooks pair same-role words** (`hookSameRole`): the word just before the hook and the word just after it share a role letter, as [Including](../grammar/hooks.md#including-am-al) states. The `xual ul …` stand-in clause is exempt. Turning the check on caught two recipe slips (a ray with mixed `g` / `z` ends, and `ual` + `/z/` for a `/b/` landmark).
- **No stance-only dependent** (`dependentStanceOnly`). The sentence after a stand-in needs a noun or a verb; a lone sake word (feeling, thanks, sorry) is the exception, since it is a whole sentence about the speaker. `hezom barl thedel` added nothing over `uem thedel`.

## Whose want, plan, or decision

- On WANT, PLAN, and DECISION, a hosted `/b/` person is whose want, plan, or decision it is; with none, it is the subject's ([intention](../grammar/intention.md#whose-intention)). Same rule as deontic **-m**: on a stance a person holds, `/b/` names that person. It reads the same inside a `uem` frame.
- **One slot.** PLAN's hosted `/b/` also holds a later offset (`thamam bral`). A plan with both an owner and a date keeps the person there and puts the date on a time pole (`huwem bral`), which the pole-offset rule already licenses for a plan clause. Rejected: a holder seam (`thamamalahen`: the seam means access to someone's view and hands them the whole clause), a person + time join in the slot (two kinds in one slot), and a second hosted slot (new machinery for a case the pole covers).
- **DECISION + `/b/` stays apart from REQUIRE + `/b/`.** `thehum balahen` is Alahen's choice about how things go, with no demand on the subject; `thumem balahen` puts a demand on the subject. Each happens without the other (a coach picks a lineup; someone relays an order they did not decide).

## Stand-in dependents

- **A dependent runs to the end of the written sentence.** Clause joins after a forward stand-in (`darl`, `dorl`, `derl`, `durl`, `barl`, a verbal stand-in) stay inside the dependent, so `dorl P xol Q` is *whether P or Q* ([dependents](../grammar/dependents.md#stand-in)). Rejected: the join closing everything before it, main clause included, which left *whether P or Q* with different subjects no route but asking the question and pointing back with `dorth`. A clause joined to the main sentence starts its own sentence with the join, the existing rule for a group on the right.

## Vocatives and interjections

- The ending decides the `/y/` job: **-n** calls someone (a name, or a kind used as a title: `yagavon`); **-l** / **-m** are interjections in their ordinary lexical sense (`yezul`, `yezum`). **-r** resumes either, read through its antecedent. There is no *named formula* interjection on **-n**.
- Spans under `/y/` follow the same split: `y@<…>` calls (the **`@`** mark is the span's **-n**); `y<…>` / `y~<…>` is a foreign interjection. Spoken opens do the same by ending (**-n** / **-r** call, **-l** / **-m** react), and land in the same left-edge slot, before the act word.
- Only opaque `<…>` and cite `[…]` (spoken TYPE **u** / **a**) go under `/y/`. A mention `{…}` talks about a word and an aside `(…)` comments on the sentence, so neither calls nor reacts (`ySpanType`). A `/y/` span inside a clause body is not a sentence, written or spoken.
- **-x** on `/y/` goes only on a call (**-nx** / **-rx**); an interjection addresses no one.

## Dated channels

- A hosted `/b/` after an evidential is read by its filler: a time measure = offset; a person or other noun = source (*per Alahen*). The source reading is settled but not yet taught. A clause as the grounds is the separate [evidence clause](../grammar/knowing.md#evidence-clause): only INFERRED and PATTERN take `barl`, and other channels keep a noun source.
- No number form means *imaginary*: *as if* belongs to NOTIONAL `avo`, not to a digitless number.

## Holders (whose view)

- Someone else's stance is written only as a holder fused onto an evidential, MAY, or NOTIONAL (`thunemazawan`). There is no free holder word or hosted `/b/` holder: fusing makes a warrant-less attribution unwritable even where no parser checks it.
- The seam is the host's own **-l / -m / -r**, so strength and holds survive. A `th` seam (`thunethazawan`) was rejected because it drops the grade; a consonant + `th` cluster (`thevemthazawan`) is illegal mid-word. **-n** is never a seam.
- Hosts are recognized by spelling: a `/th/` word that begins with a closed host root, then `l` / `m` / `r`, then a vowel, is a holder. This is safe only while no published root begins with a host root + `l` / `m` / `r` + vowel; a new root of that shape must be respelled, not given a special case.
- Holder and source are different jobs: the holder is whose view the clause is (`thewamazawan`: I hear it is Azawan's view); a person in hosted `/b/` after an evidential is where you heard it (`thewam balahen`: per Alahen). Both can appear on one word.
- Only knowing, guessing, and imagining hosts (the eight channels, MAY, NOTIONAL). DECISION, PLAN, CAUSE, and sakes never host a holder; inside a holder clause they are the holder's.
- The holder word ends like a noun for that person: **-n** name, **-r** resume, **-lx** some people of a kind, with associative **-x** after any of them (`thodomazawanx`). A group is a holder only this way; there is no generic holder without a warrant.
- One clause, one holder, whole-clause scope regardless of position. A stance on someone's stance nests: yours in the main sentence, theirs in a dependent.
- `/w/` after a stance word is not reserved: it grades whatever it sits before (a `/ɡ/` or an `/h/`). The parser used to reject `th w g` because the `/h/`-unit loop took any `/w/` as the start of another `/h/` unit; that was a bug, not a rule.

## General claims

- **No universality moods.** COMMON, UNCOUNTERED, FORMAL, NATURAL, and RULE (`ogade` / `ebeza` / `oza` / `abovu` / `obebe` on `/th/`) duplicated two things the language already says. How far a claim reaches and whether it allows exceptions is the universal fence or restrictor: closed **-l** none, open **-m** leaves them open (`huam` *usually*, `ham` *never, as far as I know*, `zuam` + kind *K in general*). What the claim rests on is a channel ([knowing](../grammar/knowing.md#universality)), which already has strength endings, holders, `barl` grounds, bars, and `uem` frames.

| Old | Say instead |
|-----|-------------|
| COMMON | open fence (`huam`, `zuam` + kind), plus any channel |
| UNCOUNTERED | closed fence plus a weak channel (`hual … thobar`): no exceptions claimed, thin evidence |
| FORMAL | INFERRED.strong `thunel` (*it follows*); a definition is a closed fence + `thedam barl` with the defining property, and no channel ([knowing](../grammar/knowing.md#universality)) |
| NATURAL | CAUSE + `thoyem barl` on a closed fence: a sufficient condition and its mechanism |
| RULE | RECORDED.strong with the rules as the `/b/` source (`therel bazagul`); a norm someone sets is REQUIRE / FORBID |

- **One rule for open -m: it never says there are more, it only declines to close the list.** Listed items read *and possibly more*; an empty list reads *as far as I know* (`zam`, `zuam`, `zaom`, `xam`, `ham`, `zum`, `zom`, `zem`). On a list of exceptions to *always* / *every*, English renders the same hedge as *usually*, *as a rule*, *in general* (`huam`, `zuam` + kind); it is not a second reading. Agazan does not split *I have not checked* from *I know of exceptions but am not listing them*. To claim exceptions exist, list one or add `har`; to claim none on thin evidence, use closed `hual` / `zual` with a weak channel (`hual … thobar`). Rejected: *just about everything* / *hardly anything* for the empty forms, which assert an amount -m never states and made the counting forms read unlike deny, menu, and rank.
- **A channel on a fenced clause warrants the whole generalization**, not one case. A cause or condition pole on it holds for **each** member or occasion, as the verb does. A cause of the regularity itself is a claim about the kind, so it goes on a `zuan` + kind clause.
- **The kind itself is `zuan` + SHARED kind**, not a new fence. The join series is closed, and standalone `zuan` + SHARED `/ɡ/` was the only unread spelling in the `ua` family. **-n** fits: it names one individual, as on a person or a titled bundle. Rejected: `zalebam` + kind (the label or category, not the lineage: *the cat category was domesticated* is wrong), **-n** on the kind root (`zagadun` is a creature named Cat), **-nx** (a named team), and recipes alone (*domesticated*, *invented*, *evolved* do not reduce to claims about members). With items before it, `…uan` stays a named bundle.
- **A resume of the kind inside the `barl` sentence is the same member, one at a time** (`zual gagadul vezebal thoyem barl zagadur gezebul.` *every cat sleeps if it is sleepy*). The parser reads the resume as an ordinary `-r`; the bound reading is semantic.

## Closed-root endings

- **Linkers are a closed set of six** (`xodum` *therefore*, `xezom` *however*, `xagagam` *meanwhile*, `xevavem` *next*, `xagezam` *but*, `xavazem` *by the way*). Each means its root's abstract sense, so the default is **-m**. Firm **-l** exists only where it reads (`xodul` *it follows that*, `xezol` *nevertheless*, `xagezal` *on the contrary*). Any other `/x/` content word at a sentence start sets the [topic](../grammar/pronouns.md#topic): **-l** / **-m** / **-n** introduce it and **-r** returns to it. A **-r** on a published linker resumes that linker and sets no topic.
- **-r on a closed root:** when the family defines its own **-r** (a strong-to-light grade, or the `because` share), **-r** is that meaning and never a resume. Every other closed root resumes with **-r** like content (`thoyer` *in that case*), so giving such a family an **-r** grade would take away a live reading.
- **-n on a mood root is an ordinary proper name.** There is no named-mood overlay; `lexicon-overlays.csv` lists no **-n** mood rows.

## Consistency audit

- Hosted `/b/` right after any `/ɡ/`, `/h/`, or `/th/` word is structural; a recipient there is a speaker error, not a second reading.
- `r` + vowel overlap in numbers is accepted.
- Word edges before vowel-initial words are not fixed.
- Hook compounds have no mid-word coda.

## Stacked vowels

Closed words (joins, hooks, join-act verbs, emotion loci) stack two of the series vowels (**a** add / **o** one / **e** order / **u** undo), each its own syllable. The six standard stacks:

| Stack | Cue |
|-------|-----|
| `ao` | add + one |
| `ua` | undo + add |
| `uo` | undo + one |
| `ae` | add + order |
| `oe` | one + order |
| `ue` | undo + order |

- **No exceptions.** No other vowel pairs (`eo`, `oa`, `ea`, …) and no three-vowel stacks are permitted: a reversed or extra pair is too easy to confuse by ear with its standard twin (`eo` vs `oe`). The former reversed-sequence join `eo` was removed for this reason; *at most N* is a [ray](../grammar/numbers-applied.md#rays).

## Ranges, rays, and span hooks

- Ranges use hooks, not joins. Rank and sequence joins (`e` / `ue` / `oe`) with a number have no threshold reading, and there is no SHARED continuum word; don't restore either.
- `oel` stays although `al` already spans numbers: for other nouns, *A, including B* depends on whether A names a group, which the syntax cannot see.
- Scope islands do not bind hooks. Whole-span scope comes from `/w/` before the hook or from the host noun.

## Genitive and other free hook slots

- Extra-noun **`em`** is the use / access genitive (*B's* = in B's use; says nothing about title). It replaced *with … in mind*, which `el` *for* and `halegolam` + `/b/` already covered. It is not a catch-all: ownership is `gegabem`, people take a tie (care = `gahabom`), parts / material / origin are of-relations, feelings are emotion compose, made things are role compounds. People are never `em` or `gegabem`; feelings and traits are never `em` or `gobom`. Fused `em` = *have in use*.
- No `el` / `em` / `er` possession series by time horizon (`rejected/el-em-er-possession.md`).
- Discourse **`aol …`** / **`aom …`** = *For example* (an instance of the prior claim; `al …` is a sibling point).
- Considered and left unassigned: stacked point-back **-r** (`aor` *on it*; a hook + resumed `/b/` already says it), same-role `aol` *namely* (`el` or an aside covers it), discourse *Alternatively* (a sentence-initial `xom` / `xaom` join) and *Apart from that* (`al …` / `ur …`). Same-role `ao` / `uo` / `ae` and discourse `oe` / `ua` / `uo` / `ue` have no pressing job: each guess already has a route (`am` *such as*, `zem` *especially*, the linkers `xevavem` *next*, `xavazem` *by the way*, `xagezal` *on the contrary*), and the parser rejects them. Stacked point-back is closed for `aor` / `aer` / `uor` (hook + resumed `/b/`), and `oer` / `uar` / `uer` stay the span fill-ask (wave 5, E-33 to E-35).

## Role compound vowels

- Role vowel **`e`** is the **scene** (place or time) of an event, not place only.
- Stacked role vowels: **`ae`** instrument, **`oe`** goal, **`ua`** source, **`uo`** path, each echoing its extra-noun hook (`ael` / `oel` / `ual` / `uol`). **`ao`** = result (a made thing, apart from the changed undergoer `u`), **`ue`** = the one who bears the event's cost (apart from the acted-on `u`). Rejected for these stacks: co-agent (rare as a kind; join-relation *with* covers it), opponent (usually `u`), beneficiary (overlaps recipient `o`; *for* is the hook `el`).

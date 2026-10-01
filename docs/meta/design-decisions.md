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
| D-06 | generic plural / *every K* via plural marking | universals joins (`zual gagadul`), habitual **`hual`**; **-x** is associative | by design | plurality.md, joins.md | — | — |
| D-07 | written capitals for names | named **-n** / **`@`**; native text is unicase | by design | phonology.md, word-endings.md | — | — |
| D-08 | sentence-final `?` / `!` carrying force | act word carries force; tone marks are prosody only; sentences end in `.` | by design | speech-moves.md | — | — |
| D-09 | *attacker*-style agent-noun lexicon | role compounds **`a` / `e` / `u` / `o` x ROOT** | by design | roles.md | — | — |
| D-10 | neutral past / *earlier* / bare *now* word | signed offset on a channel ([knowing#dated-channel](../grammar/knowing.md#dated-channel)): `thevom bagazem g-3`; forecast (channel + `b+`) / PLAN `+`; *just* / *about to* = `b-e-` / `b+e-` | by design | knowing.md | Every offset from now sits on an evidential or forecast (channel + `b+`) / PLAN; wrong sign on a one-way channel is not a sentence. A signed offset in a time pole's `/b/` is allowed only when the clause is a command, request, or PLAN, or carries a channel. A signed offset in as-of `/b/` is allowed only on stance as-of (`thuhum` / `thuram`), which dates the speaker's stance, not the event; `huhum` / `huram` / `wuhum` keep dates, event nouns, and `barl` clauses. Absolute dates stay channel-free | — |
| D-11 | single-item clause join (`A xul` *not the case that A*, `A xal` *only A happened*) | clause `/x/` joins go between clauses only; deny / focus on the verb or noun (`vowogal vul`, `zazawan zal`); stand-in items (`A xol xal` *optionally A*, `A xam xar`, `A xel xur`, `xual ul A`) — [joins#clause-joins](../grammar/joins.md#clause-joins) | by design | joins.md | — | — |
| D-13 | short *I* / *you* pronouns | *speaker* **`amago`** / *listener* **`ehodo`** are five-letter on purpose (`FORCE_LONG` in `src/lexicon-place.ts`), so names or a dropped subject are the easier choice; inclusive *we* **`aha`** stays short | by design | pronouns.md | — | — |
| D-14 | *I hope X will happen* as a forecast | hope is not evidence, so a forecast still needs a channel: `thevegem thahor brabum …` ([say-reasons](../grammar/say-reasons.md#hope-forecast), [sakes](../grammar/sakes.md#speaker-attitude)) | by design | sakes.md, say-reasons.md | — | — |
| D-15 | an act as someone's (*the monkey's tricks*, *the sound of the drums*) | the act is its own sentence, then resumed, the same pattern as *who / that / which* ([dependents](../grammar/dependents.md#which-noun), [say-people-places](../grammar/say-people-places.md)); something that only comes from B is origin `gagum` + `/b/`; `em` never takes an act | by design | dependents.md, say-people-places.md | — | — |
| D-16 | bare evaluatives (*good*, *bad*, *nice*, *great*, *wonderful*, *excellent*, *lovely*, *terrible*, *awful*, *horrible*, *fantastic*, *brilliant*, *quality*) as roots | no root. Say whose need it serves (met / unmet sake), rank against a stated bar, or name the specific quality ([say-reasons](../grammar/say-reasons.md#sake-words), [comparatives](../grammar/comparatives.md#stance-bars)) | by design | sakes.md, comparatives.md | — | — |
| D-17 | *the latter* / *the former* (the second / first of two just named) | resume **-r** points at the most recent matching word, so it is the latter; for the earlier one, name it again | by design | pronouns.md | — | — |

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

- A rank fence (`zel` / `zuel` / `zael`, and their **-m** forms) takes, as its comparee, either a noun or exactly **one `/th/` stance word that sets a value**: a met sake, a channel, FORMER, NOTIONAL, PLAN, ABIL, REQUIRE, PERMIT, CONSENT, or a speaker attitude. Each keeps its own ending table, hosted `/b/`, holder seam, dated offset, and `barl` ([comparatives](../grammar/comparatives.md#bars)).
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

- Stances that set no value are not bars: clause poles, MAY, MIRATIVE, DECISION, universality, ATTEMPT, WANT, RESIDUE, CAUSE, and the deontic noes (FORBID, refused consent). The parser rejects them (`barKind`), and a second comparee next to a bar, noun or bar (`barCount`).
- A bar sits right before the join word, after the one ranked item (and after that item's own hook + `/b/`, as before a join word). A stance word after the fence is the claim's stance. With a bar and no ranked item, the stance word stays outside the fence.
- A holder seam on a bar names whose expectation it is; inside the fence the seam covers only the bar, not the ranking.
- A bar's `barl` ends its sentence at the fence: noun parts after the scale start the grounds sentence.

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
- Only knowing, guessing, and imagining hosts (the eight channels, MAY, NOTIONAL). DECISION, PLAN, CAUSE, sakes, and universality never host a holder; inside a holder clause they are the holder's.
- The holder word ends like a noun for that person: **-n** name, **-r** resume, **-lx** some people of a kind, with associative **-x** after any of them (`thodomazawanx`). A group is a holder only this way; there is no generic holder without a warrant.
- One clause, one holder, whole-clause scope regardless of position. A stance on someone's stance nests: yours in the main sentence, theirs in a dependent.
- `/w/` after a stance word is not reserved: it grades whatever it sits before (a `/ɡ/` or an `/h/`). The parser used to reject `th w g` because the `/h/`-unit loop took any `/w/` as the start of another `/h/` unit; that was a bug, not a rule.

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

- Extra-noun **`em`** is the use / access genitive (*B's* = in B's use; says nothing about title). It replaced *with … in mind*, which `el` *for* and `holalam` + `/b/` already covered. It is not a catch-all: ownership is `gegabem`, people take a tie (care = `gahabom`), parts / material / origin are of-relations, feelings are emotion compose, made things are role compounds. People are never `em` or `gegabem`; feelings and traits are never `em` or `gobom`. Fused `em` = *have in use*.
- No `el` / `em` / `er` possession series by time horizon (`rejected/el-em-er-possession.md`).
- Discourse **`aol …`** / **`aom …`** = *For example* (an instance of the prior claim; `al …` is a sibling point).
- Considered and left unassigned: stacked point-back **-r** (`aor` *on it*; a hook + resumed `/b/` already says it), same-role `aol` *namely* (`el` or an aside covers it), discourse *Alternatively* (a sentence-initial `xom` / `xaom` join) and *Apart from that* (`al …` / `ur …`). Same-role `ao` / `uo` / `ae` and discourse `oe` / `ua` / `uo` / `ue` have no pressing job.

## Role compound vowels

- Role vowel **`e`** is the **scene** (place or time) of an event, not place only.
- Stacked role vowels: **`ae`** instrument, **`oe`** goal, **`ua`** source, **`uo`** path, each echoing its extra-noun hook (`ael` / `oel` / `ual` / `uol`). **`ao`** = result (a made thing, apart from the changed undergoer `u`), **`ue`** = the one who bears the event's cost (apart from the acted-on `u`). Rejected for these stacks: co-agent (rare as a kind; join-relation *with* covers it), opponent (usually `u`), beneficiary (overlaps recipient `o`; *for* is the hook `el`).

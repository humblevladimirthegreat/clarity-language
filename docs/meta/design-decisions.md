# Design decisions

Editors only — not linked from grammar pages. This page records design decisions a reader **cannot see** in the grammar docs: deliberate omissions (forms the language chooses not to have), readings settled between two plausible options, and the reason behind a choice that would otherwise look like a gap. Grammar pages present only the current language, so anything they already teach does not belong here; add an entry only when the decision leaves no trace on a teaching page.

Do not re-raise these as gaps or inconsistencies. An English job that only an omitted form would serve is **covered** when the meaning has a natural route.

## By design

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
| D-13 | short *I* / *you* pronouns | *speaker* **`amegu`** / *listener* **`ehodo`** are five-letter on purpose (`FORCE_LONG` in `src/lexicon-place.ts`), so names or a dropped subject are the easier choice; inclusive *we* **`oha`** stays short | by design | pronouns.md | — | — |
| D-14 | *I hope X will happen* as a forecast | hope is not evidence, so a forecast still needs a channel: `thevegem thahur brabum …` ([say-reasons](../grammar/say-reasons.md#hope-forecast), [sakes](../grammar/sakes.md#speaker-attitude)) | by design | sakes.md, say-reasons.md | — | — |
| D-15 | an act as someone's (*the monkey's tricks*, *the sound of the drums*) | the act is its own sentence, then resumed, the same pattern as *who / that / which* ([dependents](../grammar/dependents.md#which-noun), [say-people-places](../grammar/say-people-places.md)); something that only comes from B is origin `gagum` + `/b/`; `em` never takes an act | by design | dependents.md, say-people-places.md | — | — |

## Stance time and emotional blame

- No separate stimulus-timing words: a channel + offset in an emotion-compose clause dates the stimulus, and the `/th/` *as-of* pair dates the stance.
- AIMED (direction locus `o`) never carries blame; fault lives only on the because-pole ending.
- The because-pole `/b/` should be an act or a thing, not a bare person. This is guidance, not parser-enforced: a named `/b/` can be a named event or place.

## Dated channels

- A hosted `/b/` after an evidential is read by its filler: a time measure = offset; a person or other noun = source (*per Alahen*). The source reading is settled but not yet taught. A clause as the grounds is the separate [evidence clause](../grammar/knowing.md#evidence-clause): only INFERRED and PATTERN take `barl`, and other channels keep a noun source.
- No number form means *imaginary*: *as if* belongs to NOTIONAL `ove`, not to a digitless number.

## Holders (whose view)

- Someone else's stance is written only as a holder fused onto an evidential, MAY, or NOTIONAL (`thevemazawan`). There is no free holder word or hosted `/b/` holder: fusing makes a warrant-less attribution unwritable even where no parser checks it.
- The seam is the host's own **-l / -m / -r**, so strength and holds survive. A `th` seam (`thevethazawan`) was rejected because it drops the grade; a consonant + `th` cluster (`thevemthazawan`) is illegal mid-word. **-n** is never a seam.
- Hosts are recognized by spelling: a `/th/` word that begins with a closed host root, then `l` / `m` / `r`, then a vowel, is a holder. This is safe only while no published root begins with a host root + `l` / `m` / `r` + vowel; a new root of that shape must be respelled, not given a special case.
- Holder and source are different jobs: the holder is whose view the clause is (`themamazawan`: I hear it is Azawan's view); a person in hosted `/b/` after an evidential is where you heard it (`themam balahen`: per Alahen). Both can appear on one word.
- Only knowing, guessing, and imagining hosts (the eight channels, MAY, NOTIONAL). DECISION, PLAN, CAUSE, sakes, and universality never host a holder; inside a holder clause they are the holder's.
- The holder word ends like a noun for that person: **-n** name, **-r** resume, **-lx** some people of a kind, with associative **-x** after any of them (`thodumazawanx`). A group is a holder only this way; there is no generic holder without a warrant.
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

- Extra-noun **`em`** is the use / access genitive (*B's* = in B's use; says nothing about title). It replaced *with … in mind*, which `el` *for* and `hegulam` + `/b/` already covered. It is not a catch-all: ownership is `gegabem`, people take a tie (care = `gahazum`), parts / material / origin are of-relations, feelings are emotion compose, made things are role compounds. People are never `em` or `gegabem`; feelings and traits are never `em` or `gabom`. Fused `em` = *have in use*.
- No `el` / `em` / `er` possession series by time horizon (`rejected/el-em-er-possession.md`).
- Discourse **`aol …`** / **`aom …`** = *For example* (an instance of the prior claim; `al …` is a sibling point).
- Considered and left unassigned: stacked point-back **-r** (`aor` *on it*; a hook + resumed `/b/` already says it), same-role `aol` *namely* (`el` or an aside covers it), discourse *Alternatively* (a sentence-initial `xom` / `xaom` join) and *Apart from that* (`al …` / `ur …`). Same-role `ao` / `uo` / `ae` and discourse `oe` / `ua` / `uo` / `ue` have no pressing job.

## Role compound vowels

- Role vowel **`e`** is the **scene** (place or time) of an event, not place only.
- Stacked role vowels: **`ae`** instrument, **`oe`** goal, **`ua`** source, **`uo`** path, each echoing its extra-noun hook (`ael` / `oel` / `ual` / `uol`). **`ao`** = result (a made thing, apart from the changed undergoer `u`), **`ue`** = the one who bears the event's cost (apart from the acted-on `u`). Rejected for these stacks: co-agent (rare as a kind; join-relation *with* covers it), opponent (usually `u`), beneficiary (overlaps recipient `o`; *for* is the hook `el`).

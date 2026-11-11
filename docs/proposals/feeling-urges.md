# Feeling urges

**Status:** ready to implement. Nothing has run. User decisions, all 2026-11-11:

- `o` is GIVING; VICARIOUS is dropped, and someone else's stake is said with whose stake.
- `ae` is one HELD urge, covering frozen and held in.
- The last ending is duration, not motion.
- A feeling word takes one `bl-`. With a landmark urge it is the landmark, and someone else's stake goes in a sentence of its own.
- A predicted feeling takes MAY. A stacked stance stays open.
- A feeling with no stimulus stays legal.
- The journal editor asks stance, urge, and duration before the sake, with *not sure* first among the sakes.
- Rung 1 is taught with no owner on the body part.
- Gloss labels: STAYING, AIMED, TOWARD, GIVING, RESISTING, AWAY, RELEASING, PLACATING, HELD, UNPLACED; SETTLED, OPEN, FLEETING.
- Two stage pages, a new late-Beginner sitting and the Intermediate page, and no Advanced page.
- Two Claritish lessons.

**Related:** [feelings.md](../grammar/intermediate/feelings.md), [sakes.md](../grammar/beginner/sakes.md), [for-a-sake.md](../grammar/intermediate/for-a-sake.md), [knowing.md](../grammar/beginner/knowing.md), [extra-noun-hooks.md](../grammar/beginner/extra-noun-hooks.md), [purpose.md](../grammar/purpose.md), [claritish/feelings.md](../grammar/claritish/feelings.md), [cheat-sheets/vowels.md](../grammar/cheat-sheets/vowels.md), [say-reasons.md](../grammar/say-reasons.md), [learning-levels.md](../meta/learning-levels.md), [reading-order.ts](../grammar/.vitepress/lib/reading-order.ts), [claritish-triggers.csv](../../data/claritish-triggers.csv), [terminology.md](../grammar/terminology.md), [feature-criteria.md](../meta/feature-criteria.md), [unassigned-reserved.md](../meta/unassigned-reserved.md), [design-decisions.md](../meta/design-decisions.md), [claritish-flows.json](../../data/claritish-flows.json), [morph-gloss.ts](../../src/parse/morph-gloss.ts), [enforce.ts](../../src/parse/enforce.ts), [constructions.ts](../../src/parse/constructions.ts).

**Depends on:** none. **Order:** `style-pass.md` rewrites teaching English on the same pages; run this one first so the style pass sees the new wording.

**Design authority:** changes readings, adds no spelling, and changes no lexicon row.

- The ten feeling loci keep their vowels. `a`, `ae`, `ue`, and `o` get new readings; `oe`, `ua`, and `ao` are widened or renamed.
- The last ending of a feeling word changes from how the feeling moves to how long the feeling lasts.
- A `bl-` word after an `a`, `ae`, or `ue` feeling becomes whose stake. Today it is rejected after `a` and `ue` and is the landmark after `ae`.
- The existing MAY word next to a feeling word gets a taught reading (the cost or payoff is predicted, not actual). It already parses.

## Problem

The feeling system has two aims: help people who have trouble labeling an emotion to recognize it, and have the form itself suggest a healthy way to handle it. It meets neither well.

**Recognition**

1. **It asks the hardest question first.** A feeling word cannot be built without a sake, a stance, and a changeability ending. Someone who struggles to label a feeling can usually report a body sensation, an urge, and how strong it is. *Which need is at stake?* is where they end up, not where they start.
2. **Five choices sit in one word.** 9 sakes × 2 stances × 3 endings × 10 loci × 3 motions is 1,620 forms, chosen while upset. [Feature criteria](../meta/feature-criteria.md#easy-to-use) allow about one extra second of thought.
3. **The locus slot mixes three things**: where the feeling sits (`a`, `ae`, `ue`), what it pulls you to do (`e`, `oe`, `uo`, `u`, `ua`, `ao`), and whose stake it is (`o`). One vowel fits, so *anxious* (`wuwathuraer`) says *over the room* and cannot also say *wanting out*.
4. **Threat and loss are one stance.** `wuwathuraer` is spelled unmet-passing and glossed *at stake*. A predicted cost and an actual cost are different facts, and the difference between fear and sadness.
5. **Ordinary emotion words have no bridge in.** Plain roots (`gonumul`, *angry*) are mentioned once as a way out. No table says how *angry*, *ashamed*, or *lonely* usually compose.

**Handling**

1. **Motion's advice is prose.** The page says surging can be a cue to ground. The form says only how the feeling moves.
2. **STATIC lumps opposites.** Fury held in check and numb flatness share **-l** and call for different responses.
3. **The pulls are mostly threat responses.** Seven directions, of which five are fight, flight, freeze, fawn, and collapse. Met feelings nearly all take `a` (INTERNAL), with nothing for savoring, sharing, or giving back. Guilt's pull to repair has no vowel.
4. **Two names read as verdicts.** FAWN and COLLAPSE name trauma responses, against [avoids shame](../meta/feature-criteria.md). COLLAPSE also merges defeat with letting go, which is what grief is for.
5. **VICARIOUS duplicates [whose stake](../grammar/intermediate/for-a-sake.md#whose-stake)**, and a direction tail blocks whose stake, because both want the `/b/`.

## Goals

- A learner can say something true about a feeling at every level of clarity, from *my chest is tight* to the full composed word.
- Each slot in the feeling word answers one question, and each answer is something a person can check in themselves.
- The word itself shows something to do: a need to ask for, a pull to notice before acting on it, a prediction to test, a feeling that will pass.
- No urge reads as the correct one. Each has a situation where it belongs.
- No new spellings: every vowel and ending below is already in the language.

## Non-goals

- The sake inventory, the stance vowels, and the sake word's own ending stay as they are.
- Speaker attitudes (`thuwuyom`, `tholezem`, `thewemum`) stay as they are.
- Someone else's feeling still goes through a [holder](../grammar/intermediate/holder.md).
- No slot for body sensation or for arousal. Sensation is ordinary noun and adjective grammar; strength stays on the degree word.
- Fault and cause stay outside the feeling word.

## Design

### Word shape

A feeling word is still a sake word plus a two-part tail. Only the meaning of the tail changes.

| Part | Letters | Question it answers | Change |
|------|---------|---------------------|--------|
| sake root | `una` `uwa` `owe` `uro` `awe` `ewa` `ode` `oba` `uda` | which need? | none |
| stance | `tha` met, `tho` motive, `thu` unmet | does this serve it or cost it? | none |
| sake ending | **-l** / **-m** / **-r** | how lasting is the payoff or the cost? | none |
| **urge** | `a` `e` `oe` `o` `uo` `u` `ua` `ao` `ae` `ue` | what does the feeling pull you to do? | was locus |
| **duration** | **-l** / **-m** / **-r** | how long does the feeling last? | was motion |

Placement is unchanged: on `/ɡ/` after a belonging, on `/w/` before **`goyom`** for a noun that is not yours, on `/th/` for the clause or alone. Prescription **`the`** still takes no tail.

Morph glosses below use the proposed labels.

> `zonal wawethumel goyom blalazun.`
>
> z-memo | [[w-relatedness-unmet-modifiable-AIMED-SETTLED | g-stimulus] | bl-Alazun]
>
> "The memo costs me connection. It can still change, I want to take it up with Alazun, and the feeling has settled in."

### Urge

The urge is the vowels of an [extra-noun hook](../grammar/beginner/extra-noun-hooks.md), read as the direction the feeling moves you. All ten hooks are used, as now.

| Urge | Hook | Gloss | The pull | Belongs when | Was |
|------|------|-------|----------|--------------|-----|
| **`a`** | *in* | STAYING | stay in it: savor it, sit with it; no pull to move | a good moment; a loss that needs time | INTERNAL |
| **`e`** | *at* | AIMED | act on a target: confront, thank, press for | something can be said or done to someone | AIMED |
| **`oe`** | *toward* | TOWARD | turn to someone: for comfort, or to share it | company would help, or good news wants telling | SEEKING |
| **`o`** | *for* | GIVING | do something for someone: give back, make amends | you were helped, or you caused a cost | VICARIOUS |
| **`uo`** | *against* | RESISTING | push back on an outcome or a demand | a limit is being crossed | RESISTING |
| **`u`** | *from* | AWAY | move off: avoid, leave, hide | the danger is real, or you need room | AWAY |
| **`ua`** | *out of* | RELEASING | step out of the fight: let go, yield | it cannot be changed, or it is not worth the cost | COLLAPSE |
| **`ao`** | *using* | PLACATING | use yourself to keep the peace | calming things down keeps someone safe | FAWN |
| **`ae`** | *on* | HELD | stuck on the spot: frozen, or keeping a lid on it | acting now would cost more than waiting | CIRCUM |
| **`ue`** | *through* | UNPLACED | it runs through you and you cannot tell which way it pulls | you do not know yet | UNPLACED |

What changed and why:

- **`a` STAYING.** *In* now means staying in the feeling, not that the feeling is inside you. Every feeling is inside you; whether you want to stay is information.
- **`oe` TOWARD** covers sharing as well as seeking comfort. With a met sake it is *I want to tell someone*; with an unmet sake it is *I want someone with me*.
- **`o` GIVING** replaces VICARIOUS. With a met sake it is *I want to give back*; with an unmet sake it is *I want to make it right*. Someone else's stake is said with whose stake, below.
- **`ua` RELEASING** and **`ao` PLACATING** are the same pulls under neutral names.
- **`ae` HELD** takes over freezing and holding in, which the old **-l** motion carried. The cue is *on the spot* and *a lid on it*.
- **`ue` UNPLACED** now means you cannot name the pull, not that you cannot name the source. A feeling with no stimulus already says it is about nothing you can point to.
- **CIRCUM is dropped.** The atmosphere of a situation is said by making the situation the stimulus.

An urge names the **dominant** pull. Two pulls take two feeling words, as now.

### Duration

The last ending says how long the feeling itself lasts, on the [settled-to-passing scale](../grammar/beginner/sakes.md#settled-to-passing) every other sake ending uses.

| Ending | Gloss | Meaning | Was |
|--------|-------|---------|-----|
| **-l** | SETTLED | it has settled in: hours, days, a mood | STATIC |
| **-m** | OPEN | unstated (the default) | FLOWING |
| **-r** | FLEETING | a flash or a wave: it will pass | SURGING |

The word now holds two readings of one scale: the middle ending is about the **situation**, the last about the **feeling**. They can disagree, and the disagreement is useful.

| Word | Situation | Feeling | What it shows |
|------|-----------|---------|---------------|
| `thawethulual` | irreversible | settled | grief: a loss that stays, and a feeling that has moved in |
| `thawethuluar` | irreversible | fleeting | a wave of grief over an old loss |
| `thawethurual` | passing | settled | the cost has passed and the feeling has not |
| `thawethumuar` | modifiable | fleeting | a moment of wanting to give up on something fixable |

The water cue (still, current, wave) goes away with motion.

### Landmark and whose stake

Seven urges move you relative to something, and take that landmark in a `bl-` word right after the feeling (after **`goyom`** when the feeling is on `/w/`): `e`, `oe`, `o`, `uo`, `u`, `ua`, `ao`. With no `/b/` the urge points at the stimulus noun when there is one, otherwise at someone unnamed. This is today's rule.

Three urges have no landmark: `a`, `ae`, `ue`. After one of these, a `bl-` word is [whose stake](../grammar/intermediate/for-a-sake.md#whose-stake), as on any sake word.

> `thunathulam blazozon.`
>
> [th-autonomy-unmet-irreversible-STAYING-OPEN | bl-Azozon]
>
> "Azozon lost their say for good, and I'm sitting with that."

A feeling word takes **one** `bl-`. When the urge takes a landmark and the stake is someone else's, say their stake first with a plain sake word, then your own feeling:

> `thunathul blazozon. thudathumoem blazozon.`
>
> [th-autonomy-unmet-irreversible | bl-Azozon] . [th-sake-unmet-modifiable-TOWARD-OPEN | bl-Azozon]
>
> "Azozon has lost their say for good. Something in me is off, and I want to go to them."

Two sentences keep what happened to them apart from what you feel.

The parser rejects `thunathulam blazozon` today (`feelingLandmark`), and the same rule rejects `zonal wawethumam goyom blazozon` in the table of current examples below. Every other spelling in this proposal parses today, under the old labels.

### Predicted, not actual

A feeling about something that has not happened puts [MAY](../grammar/beginner/knowing.md#may) next to the feeling word. The sake word then says what the event **may** cost or pay off, not what it has. No new form: MAY is already a `/th/` stance, and these parse today.

> `zezuyol thomam wuwathurur goyom.`
>
> z-speech | th-MAY | [w-competence-unmet-passing-AWAY-FLEETING | g-stimulus]
>
> "The dialogue may cost me competence for now. I want out, and the feeling will pass."

MAY's [follow-up endings](../grammar/beginner/knowing.md#follow-up-endings-may) carry over, so the anxious sentence can say what the speaker will do about the prediction:

| Ageben | English |
|--------|---------|
| `zezuyol thomal wuwathurur goyom` | *…may cost me competence, and I'll find out* |
| `zezuyol thomar wuwathurur goyom` | *…may cost me competence; a passing thought* |
| `thomam thobathumum` | *I may be in danger, and I want to get away* (afraid) |
| `thomam thurothamem` | *this may serve my purpose, and I want to go after it* (hopeful) |

Without MAY, the cost or payoff is reported as real. This replaces glossing unmet-passing as *at stake*.

### Strength

Unchanged: a [degree word](../grammar/intermediate/very-and-slightly.md#degree-w) on `/w/` right before the feeling word (`wamezem` *slightly*, `wohalal` *overwhelmingly*). With none, strength is unstated.

> `zezuyol wohalal wuwathumael goyom.`
>
> z-speech | [w-ocean | w-competence-unmet-modifiable-HELD-SETTLED | g-stimulus]
>
> "The dialogue has me completely frozen, and has for a while."

### The ladder

The page teaches four rungs. Each is a complete sentence, so a learner stops where their clarity stops. Rungs 1 and 2 are existing grammar and existing roots.

| Rung | What you can report | Ageben | English |
|------|---------------------|--------|---------|
| 1 | a body sensation | `zobal gayewal` | *chest, tight* (lungs; clamp-like) |
| | | `zadedul garolel` | *stomach, heavy* (rock-like) |
| 2 | a plain label | `zuwen gonumul` | *I am angry* |
| 3 | stance, urge, duration; sake unnamed | `thudathumuor` | *something is off, I want to push back, it will pass* |
| 4 | the named sake | `thunathumuor` | *my say was taken; it can change; I want to push back; it will pass* |

Rung 1 names no owner: in a sentence about how you feel, the body is the speaker's. Rung 3 uses the unspecified sake `uda`. Rung 3 with `ue` is the least a feeling word can say: `thudathumuem`, *something is off and I can't tell what it wants*.

Published roots for rung 2, as `/ɡ/` property words:

| Ageben | English | Root | Ageben | English | Root |
|--------|---------|------|--------|---------|------|
| `gonumul` | *angry* | `onumu` | `gugomal` | *glad* | `ugoma` |
| `gevemul` | *afraid* | `evemu` | `guremel` | *calm, relieved* | `ureme` |
| `godebel` | *sad* | `odebe` | `gebumal` | *excited* | `ebuma` |
| `gewemul` | *worried* | `ewemu` | `gemel` | *surprised* | `eme` |
| `gubamol` | *embarrassed* | `ubamo` | `gonomul` | *disgusted* | `onomu` |
| `gehamul` | *heartbroken* | `ehamu` | `goyomel` | *bored* | `oyome` |
| `gadamul` | *worn out* | `adamu` | | | |

### From an English emotion word

A lookup keyed by English, so it lives on the recipe track ([say-reasons.md](../grammar/say-reasons.md#feelings)) and not on a stage page. The Intermediate page keeps a short example table, which feeds the cheat sheet. Each row is a **typical** build, not a definition: the same English word can take another sake or urge. Forms are shown on `/th/` with no object and **-m** duration unless a part is the point.

| English | Typical build | Ageben |
|---------|---------------|--------|
| *angry* | a sake unmet, modifiable; RESISTING | `thunathumuom` |
| *resentful* | relatedness unmet; AIMED; SETTLED | `thawethumel` + `bl-` |
| *afraid* | MAY + physical unmet; AWAY | `thomam thobathumum` |
| *anxious* | MAY + competence unmet, passing; AWAY; FLEETING | `thomam thuwathurur` |
| *frozen* | physical unmet; HELD; FLEETING | `thobathumaer` |
| *sad, grieving* | relatedness unmet, irreversible; RELEASING; SETTLED | `thawethulual` |
| *lonely* | relatedness unmet, modifiable; TOWARD | `thawethumoem` |
| *ashamed* | relatedness unmet; AWAY | `thawethumum` |
| *guilty* | beneficence unmet, modifiable; GIVING | `thewathumom` + `bl-` |
| *appeasing* | relatedness unmet; PLACATING | `thawethumaom` + `bl-` |
| *uneasy* | unspecified sake unmet; UNPLACED | `thudathumuem` |
| *proud* | competence met; TOWARD (show someone) or STAYING | `thuwathamoem`, `thuwathamam` |
| *grateful* | relatedness met; AIMED (thank) or GIVING (give back) | `thawethamem`, `thawethamom` + `bl-` |
| *content* | pleasure met; STAYING; SETTLED | `thodethamal` |
| *moved* | relatedness met; STAYING; FLEETING | `thawethamar` |
| *hopeful* | MAY + purpose met; AIMED | `thomam thurothamem` |

### What the form suggests

Each part of the word points at one thing to do. This is what the page teaches in place of the prose cues on motion.

| Part | What it shows | What it suggests |
|------|---------------|------------------|
| sake | which need | what to ask for |
| sake ending on unmet | modifiable or irreversible | work on it, or make room for it |
| urge | the pull, named before it is followed | a choice: follow it or not |
| sake + urge together | whether the pull serves the need it names | `thawethumum` is *connection is missing, and I want to hide*: the pull works against the need |
| duration | whether the feeling will pass | **-r**: wait it out; **-l**: it needs attention of its own |
| sake ending vs duration | whether the feeling still matches the situation | a settled feeling over a passed cost is worth a second look |
| MAY | predicted or actual | **-l** on MAY: go and find out |

### Current examples under the new system

| English | Now | Proposed |
|---------|-----|----------|
| *anxious about the dialogue* | `zezuyol wuwathuraer goyom` (CIRCUM, SURGING) | `zezuyol thomam wuwathurur goyom` (MAY; AWAY, FLEETING) |
| *anxious, can't say why* | `thuwathuruer` (UNPLACED, SURGING) | `thomam thuwathuruer` (MAY; pull unnamed, FLEETING) |
| *proud of my draft* | `zobewom guwathamar` (INTERNAL, SURGING) | `zobewom guwathamoer` (TOWARD: want to show it) or `zobewom guwathamar` (STAYING, FLEETING) |
| *resent Alazun over the memo, holding it in* | `zonal wawethumel goyom blalazun` (AIMED, STATIC) | same spelling: AIMED, SETTLED, *a standing resentment*; held in is `zonal wawethumaem goyom` |
| *given up over the division* | `zozowum wawethumual goyom` (COLLAPSE, STATIC) | same spelling: RELEASING, SETTLED |
| *upset for Azozon about the memo* | `zonal wawethumom goyom blazozon` (VICARIOUS) | `zonal wawethumam goyom blazozon` (STAYING; Azozon's stake) |
| *frozen, wanting out* | `…um` + **-l** (AWAY, STATIC) | `…umae` + duration (HELD) |

### Where it is taught

Two stage pages, split by form and not by rung. Rungs 1 and 2 add no form, and rung 4 differs from rung 3 only by a sake root the learner already has, so the whole ladder is Beginner. What Intermediate adds is the rest of the urge series and the duration endings.

| | Beginner: `beginner/how-you-feel.md` (new) | Intermediate: [feelings.md](../grammar/intermediate/feelings.md) (same URL) |
|---|---|---|
| Ladder | all four rungs | — |
| Urges | `a` STAYING, `e` AIMED, `o` GIVING, `u` AWAY | `oe` TOWARD, `uo` RESISTING, `ua` RELEASING, `ao` PLACATING, `ae` HELD, `ue` UNPLACED |
| Duration | **-m** only, taught as *leave it open* | **-l** SETTLED, **-r** FLEETING, and reading duration against the sake ending |
| `bl-` after the feeling | the landmark of `e`, `o`, `u` | whose stake after `a`, `ae`, `ue`; the two-sentence pattern |
| Other | a feeling with no object; MAY beside a feeling | strength; what the form suggests, in full; the attitude words |

- **Beginner placement.** Last in the *Talking together* unit, after *Thanks and sorry*. Every home it uses is earlier in the band: [sakes](../grammar/beginner/sakes.md), [predication](../grammar/beginner/predication.md), [knowing](../grammar/beginner/knowing.md), [extra-noun hooks](../grammar/beginner/extra-noun-hooks.md). The four Beginner urges are the single-vowel hooks that band already teaches.
- **Why the split.** The [Beginner gate](../meta/learning-levels.md#gates): saying how you feel is a first-stretch job, the full map fails *usable*, and this slice passes it.
- **`#feeling-no-object`** moves to the Beginner page with `npm run move-heading`, so its links follow it. **`#emotion-compose`** and **`#speaker-attitude`** stay on the Intermediate page.
- **No Advanced page.** The named sake tells the learner what to ask for, so it cannot wait. What adds no form (two feeling words for mixed pulls, the English lookup) goes on the recipe track.
- With duration left at **-m**, a Beginner feeling word is four choices, and the unspecified sake and `a` make two of them optional in practice.

Beginner examples, all with **-m** duration:

| Ageben | English |
|--------|---------|
| `thudathumum` | *something is off, and I want to get away* |
| `thunathumem blalazun` | *my say was taken, and I want to take it up with Alazun* |
| `thewathumom blalazun` | *I cost Alazun something, and I want to make it right* |
| `thawethamam` | *I feel connected, and I want to stay in it* |
| `thomam thobathumum` | *I may be in danger, and I want to get away* |

### Claritish

Two lessons in place of *Feelings in three parts*, mirroring the stage split. Rungs 1 and 2 are plain English in this track and need no lesson.

| Lesson | File | Gap | Forms |
|--------|------|-----|-------|
| What a feeling wants | `claritish/what-a-feeling-wants.md` (new) | an emotion word hides the need and the pull | a thanks or sorry word + one of `a` `e` `o` `u` + **-m** |
| Feelings in full | [claritish/feelings.md](../grammar/claritish/feelings.md) (same URL, retitled) | an emotion word hides whether the feeling will pass, and whether its cause has happened | the six stacked urges; **-l** / **-r** duration; MAY beside a feeling |

The track then has eleven lessons and the bonus. First-person cues (*I'm anxious*, *makes me feel…*) point at the first lesson.

### Journal editor flow

The `feeling` flow in [claritish-flows.json](../../data/claritish-flows.json) asks the checkable questions first:

1. *Is something met, or unmet?* (stance)
2. *What does the feeling pull you to do?* (urge; the four single-vowel urges first, then the six stacked)
3. *How long does it last?* (duration; **-m** first)
4. *Which need?* (sake; *not sure* first, which is `uda`)
5. *How lasting is the payoff or the cost?* (sake ending; **-m** first)

A writer who answers only the first two and takes the defaults gets a rung 3 word.

### What is lost

- **How a feeling moves** (steady or in waves) has no slot. **-r** FLEETING covers a wave; a feeling that surges over days does not fit one word.
- **Where a feeling sits** has no slot. *Over the room* becomes a stimulus that is the situation.
- **Numbness** is not a pull. It is a degree word (`wamezem`) with HELD or UNPLACED, or it is rung 1.
- **Whose stake and a landmark in one word.** They take two sentences ([landmark and whose stake](#landmark-and-whose-stake)).

### Against the feature criteria

| Criterion | Now | Proposed |
|-----------|-----|----------|
| Helps with language goals | Names the need. | Also names the pull, the prediction, and whether the feeling will pass. |
| Common problem | Yes. | Yes. |
| Easy to use | Five choices, all required, on one Intermediate page. | A learner can stop at rung 1, 2, or 3. Beginner asks for a stance and one of four urges; the rest comes a band later. |
| Avoids shame | FAWN and COLLAPSE read as faults. | Each urge has a *belongs when*. |
| Reminders where needed | Prose cues on motion. | The cues are in the parts of the word. |

## What changes, by file

No spelling changes, so this is not a retie. A locus vowel in an example changes through `node scripts/find.mjs … --map locus=from:to` ([searching by construction](../meta/procedures/read-ageben.md#find)). Glosses regenerate through `npm run regloss-docs -- --write`.

**Parser**

- [morph-gloss.ts](../../src/parse/morph-gloss.ts): the locus labels and `EMOTION_MOTION`, to the names on the Status line.
- [enforce.ts](../../src/parse/enforce.ts) `feelingLandmark`: a `bl-` after `a`, `ae`, or `ue` is accepted and read as whose stake. This is the one behavior change, and it lands in the same commit as the Intermediate page that teaches it.
- [constructions.ts](../../src/parse/constructions.ts) and [llm-prompt.ts](../../src/parse/llm-prompt.ts): reader notes and the `feelingLandmark` summary.
- Tests that name the old labels: `morph-gloss.test.ts`, `llm-prompt.test.ts`, `invalid-forms.test.ts`, `terminology-docs.test.ts`, `find/query.test.ts`.
- `src/english-helper/detectors.ts`: any cue keyed to a locus name.

**Stage pages**

- `beginner/how-you-feel.md`: new sitting, as in [where it is taught](#where-it-is-taught), with Practice. A row in the *Talking together* unit of [reading-order.ts](../grammar/.vitepress/lib/reading-order.ts), a drill allowlist row, and an item in the Beginner level review.
- [feelings.md](../grammar/intermediate/feelings.md): rewrite `#emotion-compose` as the rest of the series; `#feeling-no-object` leaves; new Practice. Measure the sitting and peel if it runs over ([restructure sittings](../meta/procedures/restructure-sittings.md)).
- Examples elsewhere: 100 feeling words on ten pages. All need the last ending re-read. The 62 with `a` (24), `ae` (16), `ue` (14), or `o` (8) need new English or a new vowel. By page: `say-reasons.md` 30, `feelings.md` 27, `terminology.md` 13, `claritish/feelings.md` 13, `cheat-sheets/why-allowed.md` 10 (generated), `say-questions.md` 2, `holder.md` 2, `mirative.md` 1, `compound-families.md` 1, `claritish/cheat-sheet.md` 1.
- [say-reasons.md](../grammar/say-reasons.md#feelings): gains the [English lookup](#from-an-english-emotion-word) and a recipe for mixed pulls.
- [purpose.md](../grammar/purpose.md#emotions-as-composition): the three parts become need, urge, and duration; the Claritish link names the first lesson.
- [cheat-sheets/vowels.md](../grammar/cheat-sheets/vowels.md): the feeling rows in `#place` (now stage B) and `#extra-noun-stacks`, and *feeling loci* in the vowel tree. Generated blocks through `npm run cheat-sheet-blocks -- --write`.
- [terminology.md](../grammar/terminology.md): urge and duration replace locus and motion; the ten names.

**Claritish**

- `claritish/what-a-feeling-wants.md`: new lesson. [claritish/feelings.md](../grammar/claritish/feelings.md): rewritten as *Feelings in full*. Its breakdown table shows `ao` for *over the room* where the word has `ae`; the rewrite removes it.
- `claritishLessons` in [reading-order.ts](../grammar/.vitepress/lib/reading-order.ts); `claritish/index.md`, `claritish/learn.md`, and `claritish/cheat-sheet.md` wherever they count or list lessons.
- [claritish-triggers.csv](../../data/claritish-triggers.csv): the `feeling-unmet`, `feeling-met`, and `emotion-words` rows name the first lesson.
- [claritish-flows.json](../../data/claritish-flows.json): the `feeling` flow, as in [journal editor flow](#journal-editor-flow). `src/claritish-editor/data.test.ts`, `read-back.test.ts`, and [claritish-editor-data.md](../meta/claritish-editor-data.md) follow.

**Editor notes**

- [unassigned-reserved.md](../meta/unassigned-reserved.md): drop the open row for `bl-` after an INTERNAL or UNPLACED feeling; add an open row for a second `bl-` after a feeling word.
- [design-decisions.md](../meta/design-decisions.md): why there is no placement locus, no motion ending, no arousal slot, no vicarious urge, and one `bl-` per feeling word.
- `AGENTS.md`: the `feelings.md` Owns line gains `how-you-feel.md`; the Claritish row says eleven lessons.
- `TODO.md`: remove the *reconsider emotions* lines.

## Implementation plan

Runs through subagents: the work spans the parser, two teaching pages, example judgment on ten pages, and the Claritish track, which share little. One fresh subagent per unit, in this order. If the user says to stop partway, the orchestrator [consolidates this proposal](../meta/procedures/proposals.md#consolidate-on-stop) before the session ends.

| Unit | Items | Agent | `model` | `effort` | May edit |
|------|-------|-------|---------|----------|----------|
| U1 | Gloss labels in the parser and its tests | `proposal-worker` | `opus` | `medium` | `src/parse/`, `src/find/*.test.ts`, `src/lint/terminology-docs.test.ts`, `src/english-helper/detectors.ts` |
| U2 | `npm run regloss-docs -- --write` | orchestrator | — | — | regenerated glosses only |
| U3 | Write `beginner/how-you-feel.md` teaching sections; move `#feeling-no-object` to it; reading-order row | `proposal-worker` | `opus` | `high` | the new page, `feelings.md` (the moved H3 only), `reading-order.ts` |
| U4 | Rewrite `feelings.md` teaching sections; `feelingLandmark` in the parser with its tests; `unassigned-reserved.md`; `design-decisions.md`; measure and peel | `proposal-worker` | `opus` | `high` | `feelings.md`, `src/parse/enforce.ts`, `constructions.ts`, `llm-prompt.ts`, their tests, the two meta notes, any page a peel creates |
| U5 | Feeling examples on `say-reasons.md`, `say-questions.md`, `holder.md`, `mirative.md`, `compound-families.md`, `terminology.md`; the English lookup and mixed-pulls recipe on `say-reasons.md` | `proposal-worker` | `opus` | `high` | those six pages |
| U6 | Practice on `how-you-feel.md`, then on `feelings.md`; allowlist rows | `checkpoint-writer` | `opus` | `high` | the two Practice sections, the drill allowlist |
| U7 | Level review items: one new in `review.md`; re-check the feelings items in `review-intermediate.md` | `checkpoint-writer` | `opus` | `high` | the two review pages |
| U8 | Claritish: the new lesson, the rewritten lesson, the cheat sheet, lesson lists and counts | `proposal-worker` | `opus` | `high` | `docs/grammar/claritish/`, `reading-order.ts` (`claritishLessons`) |
| U9 | Journal editor: cue rows, the `feeling` flow, editor tests, the editor data note | `proposal-worker` | `opus` | `medium` | `data/claritish-triggers.csv`, `data/claritish-flows.json`, `src/claritish-editor/*.test.ts`, `claritish-editor-data.md` |
| U10 | `purpose.md`, `cheat-sheets/vowels.md` hand rows, `TODO.md` | `proposal-worker` | `opus` | `medium` | those three files |
| U11 | `npm run cheat-sheet-blocks -- --write` | orchestrator | — | — | generated blocks only |
| U12 | Audit: old labels left anywhere, English that no longer matches its gloss, a Beginner example that uses an Intermediate urge or ending | `proposal-worker` | `opus` | `high` | none; reports only |

Notes on order:

- **U1 then U2.** Renaming labels changes no behavior, but it leaves every documented feeling gloss stale until U2 regenerates them. U1 is gated on the parser tests alone.
- **U3 before U4**, so the Intermediate page is written against a Beginner page that exists. `reading-order.ts` takes one writer at a time: U3, then U8.
- **U4 carries the one behavior change** with the page that teaches it.
- **U6 before U7**: the checkpoint writer for `how-you-feel.md` must not have read `feelings.md`'s new sections, so the orchestrator's pack (`tmp/checkpoint-pack/feeling-urges.md`) names the sittings in path order.
- The orchestrator applies the `AGENTS.md` lines after U10.

**Rule digest** (paste into every prompt):

> - Call the language Ageben. Show only the current language: no *was INTERNAL*, no former names, no dual spellings.
> - No spelling changes. Never type a root by hand; never bulk-replace. Change a locus vowel in an example with `node scripts/find.mjs … --map locus=from:to` (dry run first, then `--write`), which also regenerates the gloss.
> - Urges: `a` STAYING, `e` AIMED, `oe` TOWARD, `o` GIVING, `uo` RESISTING, `u` AWAY, `ua` RELEASING, `ao` PLACATING, `ae` HELD, `ue` UNPLACED. Duration: **-l** SETTLED, **-m** OPEN, **-r** FLEETING.
> - Beginner pages use only `a` `e` `o` `u` and **-m** duration. The six stacked urges, **-l** / **-r** duration, and whose stake after a feeling are Intermediate.
> - A feeling word takes one `bl-`: the landmark after `e` `oe` `o` `uo` `u` `ua` `ao`, whose stake after `a` `ae` `ue`. Someone else's stake with a landmark urge is two sentences.
> - A predicted cost or payoff takes MAY (`thomam` / `thomal` / `thomar`) beside the feeling word. Do not gloss unmet as *at stake*.
> - For each example, keep the English and change the vowel when the English is the teaching point; keep the spelling and change the English when the spelling is. Say which in the report.
> - Check every Ageben sentence with `node scripts/parse.mjs` (all sentences in one call). Work out meaning with `--llm-prompt`, not from memory.
> - Stage pages never link to the `say-*.md` recipe track or to `terminology.md`. Claritish lessons carry no lesson numbers and no links to each other or into the grammar. Never link to a page under `docs/proposals/`.
> - Move a heading with `npm run move-heading`; never retarget links by hand.
> - A grammar question you cannot settle from this digest is not yours to settle: skip the item and report it.
> - Stop and report, without working around it, if: a premise here no longer holds; later units would need a different design; skipping would leave later work on a broken state; or you are skipping most of your items.
> - Read slices: list headings (`grep -n '^#'`), then read the ranges you edit. After a file changes, read `git diff`, not the file.
> - Verify with `npm run verify -- --allow-generate` at the end of the item (`--fast` inside it). On a new error, read only that line of `tmp/verify-last.log`. Never paste raw build output.
> - Do not commit.
> - Report, in fixed fields: what changed (with ids), files touched (count), registry edits, `AGENTS.md` Owns lines to change, the `verify` line, skips with reasons, **left:**, **inefficient:**.
> - At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.

Full rules a subagent may open when the digest does not settle a question: [where it is taught](#where-it-is-taught), [urge](#urge), [landmark and whose stake](#landmark-and-whose-stake), [learning-levels.md](../meta/learning-levels.md#gates), [claritish-style.md](../meta/claritish-style.md), [restructure-sittings.md](../meta/procedures/restructure-sittings.md).

**Gates.** The orchestrator saves `npm run verify -- --baseline` before U1 and again after U2. Each later unit ends on `npm run verify -- --allow-generate`. Between U2 and U5, prose and terminology errors on pages a later unit rewrites are expected; the orchestrator lists them after U2 and checks each off as its unit lands. Run `npm run grammar-check` only if `sentence-parser.ts` changed. Final gate: a clean `npm run build` and `npm test` after U11, with nothing left on a **generate** row.

**Commits.** Ten, each starting `feeling-urges <unit>` and ending `[skip-cd]` and the co-author line: U1; U2 (tool output alone, naming the command); U3; U4; U5; U6; U7; U8 with U9; U10 with the `AGENTS.md` lines; U11 (tool output alone). U12 makes none unless it finds fixes, which go in an eleventh.

## Open decisions

None. The eleven decisions on the Status line were settled on 2026-11-11.

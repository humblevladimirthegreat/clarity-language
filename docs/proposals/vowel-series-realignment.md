# Proposal: realign amount-scale vowel series

**Status:** PROPOSED. Nothing here is absorbed.  
**Related:** [root tails](/root-tails#root-tails) (size), [joins](/joins#join-type-vowel-series), [speech acts](/speech-moves#speech-act-beginner), [polar stance](/questions#polar-stance), [hooks](/hooks), [extra nouns](/hooks#extra-noun), [sakes](/sakes#word-shape), [tag pronouns](/tag-pronouns#tag-pronouns), [vowel pitch](/phonology#vowel-pitch), [finger code](/finger-code), [digit syllables](/numbers#counts), [letter names](/phonotactics#letter-names), [conversation length](/compound-families#conversation-length), [ability](/can-and-cant#ability), [label scope](/label-seams#label-scope), [role compounds](/roles#one-time-or-a-practice), [role pointers](/pronouns#role-pointers), [say-word scope](/feelings-permission#say-scope), [landmark facing](/viewpoint#landmark-facing), [stacked scope](/label-seams#scope-stacks), [Claritish Labels](/claritish/labels) and [Can and can't](/claritish/can-and-cant), [D-40](../meta/design-decisions.md), [D-44](../meta/design-decisions.md), [D-49](../meta/design-decisions.md).  
**Design authority:** none until absorbed into those pages. Parser summaries in [`src/parse/constructions.ts`](../../src/parse/constructions.ts) follow the pages.

## Idea

**a o e u** has two sibling readings: size is amount (biggest to smallest), order is sequence (first to fourth). This proposal puts every *amount* series on size, and retargets the join table so **how much list you are left with** is the same scale. Conversation length, the [middle vowel](/root-tails#root-tails), and sake follow size. Root-job last vowels follow join (the page already uses the join series). Act words, polar answers, and hooks follow join (speech, then join, then size). Extra-noun derives from hook: it is the `/b/`-after job of the same spelling. Digit vowels and tags follow order: assign **a** first, **u** last. Letter names sit under digits as the [opposite vowel](/phonology#opposite-vowels). [Vowel pitch](/phonology#vowel-pitch) follows order (first is low, fourth is high). The [finger code](/finger-code) vowel hand follows order: pinky first.

| | **a** | **o** | **e** | **u** |
|--|-------|-------|-------|-------|
| Size (keep) | about your size or bigger | between your hand and you | no bigger than your hand | nothing you could measure |
| Pitch (keep, follows order) | low | mid-low | mid-high | high |
| Finger code vowel hand (keep, follows order) | 1 (pinky) | 2 | 3 | 4 |
| Order (keep) | first | second | third | fourth |
| Digit vowel (keep) | `ba` `za` `na` | `do` `vo` `mo` | `ge` `re` | `hu` `lu` |
| Letter name (keep, opposite of digit) | `u` (`bu`) | `e` (`de`) | `o` (`go`) | `a` (`ha`) |
| Join (do) | *and* (the list grows) | rank (membership stays) | choice (collapses to one) | *not* (the list disappears) |
| Act (do) | statement | command | question | prohibition |
| Hook (do) | *including* | *rather* | *instead* | *except* |
| Extra-noun (do) | *in* | *for* | *at* | *from* |
| Sake (do) | met / serves | motive | prescription (*ought*) | unmet / detracts |
| Root job (do) | holds or gathers | path / sequence | one whole thing | takes away |
| Pointer (do) | the other one (furthest) | this sentence | latest (closest) | unsaid |
| Tag (do) | first (A) | second (O) | third (E) | last (U) |

Read **a > o > e > u** as biggest to smallest, or as first to fourth (also low to high). Teach amount series in size order.

Which series sits in which family: [Families](#families). Size and order are siblings. Sake follows size. Tags, vowel pitch, and the finger-code vowel hand follow order. Letter names are the opposite of the digit.

## Joins, acts, polar (do)

**a** and **u** stay. **o** and **e** swap on the join simplex.

| | Now | Proposed |
|--|-----|----------|
| **a** | add (*and*) | add: the result is bigger |
| **o** | pick one | rank: membership stays, only order changes |
| **e** | rank | choice: the list collapses to one |
| **u** | *not* / *none of* | negation: the list disappears |

Stacks keep composing. **ao** (*and/or*) swaps with **ae** (*A, then B*). **uo** (*anything but*) swaps with **ue** (rank reversed). **oe** (tie) and **ua** (*everything but*) stay. Tie’s composition becomes rank-then-choice; **eo** is still not a stack.

*More* is the rank join: `**zel` → `zol*`*. The equative `**zoel**` stays. Grammar docs mention `**zel**` about 230 times.

The same swap hits every join of occasions or of a stance toward a member: unspecified `**zor` ↔ `zer**`, restrictors `**hol` ↔ `hel**`, join-acts `**von` ↔ `ven**`, join-relations `**gon` ↔ `gen**`, and their **ao**/**ae** and **uo**/**ue** stacks. Number markers follow rank: `**#`** moves **e → o**, the digit-string marker `**_`** moves **o → e**.

Parser membership moves with the letters: [`RANK_SERIES`](../../src/parse/series.ts) / `BAR_SERIES` / `SCALE_SERIES` become **o** / **ao** / **uo** (/ **oe**). `KIND_SERIES` becomes **ua**, **ue**.

### Act words and polar follow

| | Now | Proposed | Size |
|--|-----|----------|------|
| **yal** | statement | statement | add a claim |
| **yol** | question | command | rank: this is what to do |
| **yel** | command | question | choice: collapse to an answer |
| **yul** | prohibition | prohibition | none of the act |

Usual order stays tied to the *act*, not the letter: only a command starts with its verb ([D-44](../meta/design-decisions.md)). So `**yol*`* commands with the verb first, `**yel**` asks with the verb second. A missed question still falls back to a statement. Grammar docs mention `**yol**` about 300 times, `**yel**` about 90.

Rhetorical / quiz stacks in [`stackKind`](../../src/parse/series.ts) are currently statement-over-question **a**/**o**. They become **a**/**e**.

Polar answers compose from the same vowels. *Yes* is add + command, *sure* is add + question:

| | Now | Proposed |
|--|-----|----------|
| **ae** `yael` | *yes* / *will do* | *sure* |
| **ao** `yaol` | *sure* | *yes* / *will do* |
| **ue** `yuel` | *no* / *I won't* | *not that* |
| **uo** `yuol` | *not that* | *no* / *I won't* |
| **ua** `yual` | doesn't apply | doesn't apply |
| **oe** `yoel` | *I won't answer* | *I won't answer* |

Beginner *yes* and *sure* swap spellings; *no* and *not that* swap. Soft and *for now* endings ride along (`yaem` *I think so* becomes `yaom`).

Stand-ins match acts: `**dorl**` *whether* → `**derl*`*, `**derl**` *to* → `**dorl*`*. Say-word *answers* match acts: **o** require (`hwavem` *you have to* → `hwavom` before scope), **e** their call. Allow and forbid stay **a** / **u**.

## Ability (do)

Reorder remaining ability down to none. That is the same **o** / **e** swap, on a different slot.

| | Now | Proposed | Size |
|--|-----|----------|------|
| **xa** | can | can | biggest: capability is in |
| **xo** | can't yet | can't, just for now (usually can) | medium: a dip, not a hole |
| **xe** | can't right now | can't yet | small: not there yet |
| **xu** | can never | can never | none |

Default when unsure moves with *can't yet*: use **xe**. Hostless `**oda*`* takes the same vowels (`hodaxel` is then *can't yet*, `hodaxol` *can't right now*). Today's `zolazun vezuyoxel` (*can't sing right now*) becomes `zolazun vezuyoxol`.

Claritish: `drive-xo` a sprained ankle, `code-xe` hasn't learned yet.

## Conversation length (do)

Follows size, not join. Drop the join cues. Swap **o** and **e**.

| | Now | Proposed | Size |
|--|-----|----------|------|
| **a** | open-ended | open-ended | biggest stretch |
| **o** | one slot | a few minutes | medium, still a talk |
| **e** | a few minutes | one slot | small: one ask |
| **u** | passing | passing | none |

Forms: `SELFxon` a few minutes, `SELFxen` one slot. At departure, **o** is leaving soon, **e** is about to leave.

## Label scope and role compounds (do)

How *far* the claim reaches, biggest to smallest.

| | Now | Proposed | Size |
|--|-----|----------|------|
| **a** | this episode | a type across scenes | biggest claim |
| **o** | this pair | a practiced role | medium: a life you inhabit |
| **e** | a practiced role | this pair | small: one person in reach |
| **u** | a type | this episode | none: a speck of time |

Role compounds write the same vowels after `**w**`.

| Now | Proposed | English |
|-----|----------|---------|
| `zwazuduyel` | `zwuzuduyel` | *someone who teaches* (this once) |
| `zwezuduyel` | `zwozuduyel` | *a teacher* (practice) |
| `gwozuduyel blolazun` | `gwezuduyel blolazun` | *is a teacher to Olazun* |
| `zwuzuduyel` | `zwazuduyel` | *a teacher type* |

On a content root: `gunemuthal` *angry this time* becomes `gunemuthul`; `ganumuthul` *an anxious type* becomes `ganumuthal`; `golayothom blolazun` *a stranger to Olazun* becomes `golayothem`; `gwezuduyel` *is a teacher* becomes `gwozuduyel`.

**a** ↔ **u** and **o** ↔ **e** are pairwise swaps: every old spelling still parses, with the opposite reach. `zwazuduyel` left untouched would become *a teacher type*.

### Keep the one-act nudge

[D-40](../meta/design-decisions.md) still holds: every role word picks a scope, so one fight is not a fighter. **a** is now the wide claim, so do **not** teach it first. Beginner role compounds open with **u** (*someone who teaches*), then **o** (*a teacher*). Type **a** stays Intermediate. Update D-40's example spellings when absorbed (`zwuzuduyel` / `zwozuduyel`).

### Stacked scope: English stays, letters follow joins and hooks

Stacked scope already says not to read a pair as the first simplex then the second. Keep today's *English*. Join and extra-noun stacks swap **ao**/**ae** and **uo**/**ue**, so the letters follow: **ae** the situation (*over*), **ao** using the role, **oe** toward the role, **ua** except this episode, **ue** except this pair, **uo** off duty.

Today **ua** / **uo** happen to *look* like type (**u**) minus episode / pair. After simplex remap they will not: type is **a**, episode is **u**, and **au** is not a stack. **ua** still does *except this once* as join *everything but*. Do not retarget stacks to the new simplex letters.

### Other words that use label-scope vowels

Say-word *scope* is label scope. Say-word *answers* follow acts (above). Both slots can move in one word.

| Scope now | Proposed | Example now → proposed |
|-----------|----------|-------------------------|
| **a** this act | **u** this act | `hwavam` *you may* → `hwuvam`; `hwadam` *they agreed* → `hwudam`; `hwazal` a vow → `hwuzal` |
| **e** standing | **o** standing | `hwedam` standing consent → `hwodam`; `hwevam` standing permission → `hwovam` |
| **o** toward one party | **e** toward one party | `hwozal blahelan` a vow toward Ahelan → `hwezal`; `hwovam` *fine by me* → `hwevam` |
| **u** a type | **a** a type | `hwudam` *the type who's fine with it* → `hwadam` |

Require on this act: `hwavem` *you have to* → `hwuvom`. `hwadam` and `hwudam` swap meaning from scope alone.

Landmark facing is pair scope on a direction: `**tho` → `the**`. `gazuhethol blahehal` *behind the house* becomes `gazuhethel`. Arrow roots still take no other scope vowel. Motive stays `**tho*`*, so landmark facing and motive no longer share a letter.

Role pointers always write episode scope after `**w**`. That letter becomes **u**. Combined with the pointer vowels below, `zwazar` *the latest doer* becomes `zwuzer`.

## Pointers (do)

The pointer vowel (after the part consonant) is a separate series from scope. Use size as **how far the pointer reaches**.

| | Now | Proposed | Size as distance |
|--|-----|----------|------------------|
| **a** | latest (*again*) | the other one | furthest: skip the last person, reach past them |
| **o** | the other one | this sentence (*themself*) | medium: the event in your hands |
| **e** | this sentence (*echo*) | latest | closest: the last person, still in reach |
| **u** | unsaid | unsaid | none: no one was measured |

Drop **a** ≈ again / **e** ≈ echo / **o** ≈ other. **u** ≈ unsaid stays. **a**, **o**, **e** cycle; **u** does not move.

With episode scope **u**: `zwuzer` the latest doer, `zwuzar` the other one, `dwuzor` themself, `zwuzur` whoever it was. Today's `zwazar` left untouched would be *the other one*.

Beginner pointers open with **e** (*the latest*), then **a** (*the other one*). Themself **o** and unsaid **u** keep their current sections.

**-m** share currently bans **e** (a share cannot be part of the event being described). Ban **o** instead. **-l** *a new one* still has no **u**. Unsaid is still the **e** rule turned around: **e** skips a sentence with nobody in that part, **u** looks for exactly that sentence.

## Hooks (do)

Keep **one spelling, three jobs**. Same-role and discourse glue follow join. Extra-noun is the third job of those same hooks ([Extra nouns](#extra-nouns-do)), so it derives from hook, not from size.

### Same-role, glue, resume

How much of A is still in the slot:

| | Now | Proposed | Join |
|--|-----|----------|------|
| **a** `al` | *including* | *including* | bigger: B is added |
| **o** `ol` | *instead* | *rather* / *In other words* | same: still A, better wording |
| **e** `el` | *rather* | *instead* / *Actually* | one: B replaces A |
| **u** `ul` | *except* | *except* | none of B |

*Rather* keeps the referent (membership stays, like rank). *Instead* picks one other thing (like choice). Discourse glue and hook resume ride the same letters: `ol …` *In other words*, `el …` *Instead*; `or …` *As I said*, `er …` *Anyway*. Hook prefixes and hooked joins use these vowels too.

Ranges on same-role hooks ([ending grids](/ending-grids#ranges)) use **ua** / **oe** / **ue**. **oe** *A through B* stays. **ue** *outside A–B* becomes **uo**.

## Extra nouns (do)

Derives from hook: it is the same spelling with `/b/` right after it. Same **o** / **e** swap as same-role. The extra-noun English is how those hook vowels read on a landmark.

| | Now | Proposed | Hook |
|--|-----|----------|------|
| **a** `al` | *in* | *in* | *including*: B is added; a volume the event sits inside |
| **o** `ol` | *at* | *for* | *rather*: still this aim, person-scale, in your hands |
| **e** `el` | *for* | *at* | *instead*: a point in place of a volume |
| **u** `ul` | *from* | *from* | *except*: none of the landmark left; you left it |

*In* a house is including a place. *For* a family is rather-this-aim: a person you hold as the goal, not a room and not a pinpoint. *At* a table is instead-a-point: coincidence with a contact, no bigger than a hand. *From* a teapot is except: none of that landmark left at the event. *Since* stays `**ul*`*: the starting time is the place you left.

Size pictures (volume / person-scale / point / none) help remember the landmark. They are not a second parent: extra-noun → hook → join → size.

*Where?* is then `el bar` (the point blank). *Where from?* stays `ul bar`. *For whom?* is `ol bar`.

Feeling loci follow extra-noun: *in* (inside), *for* (on behalf), *at* (aimed), *from* (away).

**-m** frames keep the picture, looser: `**am`** *amid* (volume as setting), `**om*`* in B's use (the aim already reached B), `**em**` *near* (the point as setting), `**um*`* *away from*.

### Stacks still compose as today

Extra-noun stacks are hook stacks. Same rule as [stacked scope](#stacked-scope-english-stays-letters-follow-joins-and-hooks): keep today's English; the letters follow the simplex remap, which is the same **ao**/**ae** and **uo**/**ue** swap as joins.

| Stack | Now | Proposed |
|-------|-----|----------|
| **ao** | *on* / *over* | *using* / *by* |
| **ae** | *using* / *by* | *on* / *over* |
| **oe** | *toward* | *toward* (for then at; **eo** is not a stack) |
| **uo** | *through* | *against* / *contrary to* |
| **ue** | *against* / *contrary to* | *through* |
| **ua** | *out of* | *out of* |

The costly two:

- [Whose](/extra-noun-hooks#genitive) `**em**` (*in B's use*) becomes `**om*`*. Today's `**om**` *near* becomes `**em*`*.
- [Contrary to](/sakes#contrary-to-stance) `**uem**` becomes `**uom**`. [D-49](../meta/design-decisions.md) cites `uem` in front of a say word; that spelling would then be *through* as a frame.

## Sake stance (do)

Follows size: **how much of the sake is in**. Letters stay.

|           | Now                    | Proposed               | Size                                   |
| --------- | ---------------------- | ---------------------- | -------------------------------------- |
| `**tha**` | met / serves           | met / serves           | biggest: the payoff is in              |
| `**tho**` | motive                 | motive                 | medium: you are doing it for this sake |
| `**the**` | prescription (*ought*) | prescription (*ought*) | small: you only have the advice        |
| `**thu**` | unmet / detracts       | unmet / detracts       | none: you do not have it               |

Beginner still only needs the ends: `**tha**` met, `**thu**` unmet. Motive is more “have” than prescription: the act is happening for the sake, versus only being told it ought to.

`**the**` is *ought this act for this sake*: advice, not yet yours. `**tho*`* is *doing for this sake*: a description, not a *should*. A command still tells someone to act without naming a sake; prescription names the sake. Ending tables and feeling tails stay on these letters.

Forms stay: `thawathum` *detracts from relatedness*, `thawothem` *ought, offered, for relatedness*, `thawothom` *talks to feel connected*, `thawatham` *serves relatedness*.

## Root job (do)

The [middle vowel](/root-tails#root-tails) follows size (keep). The last vowel follows join, not size and not hook. The owning page already says it uses the same series as [joins](/joins): **a** add, **o** one, **e** order, **u** undo. After the join remap that is **a** add, **o** rank, **e** choice, **u** *not*. Hook would spell the same letters (it derives from join); the parent is join.

In [`SHAPE_VOWELS`](../../src/root-tails.ts), `**one**` becomes **e** (choice: one compact thing) and `**order`** becomes **o** (rank: a path, membership stays). The `shape` column keeps those names. `**holds`** and `**takes-away**` stay **a** / **u**.

| Last vowel | Now | Proposed | Join |
|------------|-----|----------|------|
| **a** | holds or gathers | holds or gathers | *and*: containers, groups, masses grow |
| **o** | one whole thing | order: a path, sequence, stage, or cycle | rank: the line stays, you travel it |
| **e** | order / path | one whole thing: round or compact | choice: collapses to one piece |
| **u** | takes away | takes away | *not*: cuts, removes, harms |

Fallback outline follows the letters: hollow **a**, long **o** (a road), round **e** (an apple, a cat), sharp **u**. Feelings: toward others **a**, along a standing or what comes next **o**, inward **e**, against **u**. Actions: with others **a**, along a course **o**, once on the spot **e**, stops or hurts **u**. Tie order is unchanged: try **u**, then **a**, then **o** (the old “then **e**” for path).

Tail suffixes follow: *friend* (*hug* + person, one thing marked by the left) is `**ye*`*, not `**yo**`.

About 250 `one` tails and 280 `order` tails move, including ~20 + ~18 three-letter roots. Procedure: point `SHAPE_VOWELS` at the new letters, then `npm run convert-word -- --lexicon --all`, then `retie-docs`. `--all` currently keeps three-letter roots, so the absorb must retarget those tails too (re-place them, or extend `--all`); otherwise short *one* roots still end in **o**. If the dry run prints `language name 👓 old → new`, run `**npm run rename-language*`*: the glasses root is `body` + `one`, so its last vowel moves with this map. Pegs follow the consonants; `npm test` fails if a respelling empties a 0–9 / 00–99 cell.

## Tags (do)

Tags are still letter names (`zwar` is tag A). They do not measure. Assign them in [order](#order-keep): the first unused tag is **a**, then **o**, then **e**, last **u**. Digit vowels follow the same order (`ba` `do` `ge` `hu`). Letter names are the opposite of the digit, not the assignment order. The finger-code vowel hand counts the same way: pinky first is **a**, four fingers is **u**.

This is a teaching default, not a parse ban: a skipped tag still names that letter. Beginner and Intermediate examples that now tag A then E (`zwal` … `zwel`, pair `zwaer`) become A then O (`zwal` … `zwol`, pair `zwaor`). The six pair stacks stay; the everyday pair is the first two. The other tags follow the same pattern: third is E (`zwel`), fourth is U (`zwul`).

## Finger code (keep)

The [finger code](/finger-code#counting) adds no grammar. Only the **vowel hand** follows order: a run of 1 to 4 fingers from the pinky, first vowel to fourth. Pinky is **a**, four fingers is **u**. Opposite vowels are one finger against four. The consonant hand does not: it counts digit letters from the index.

Piano keys and guitar bass still climb with the count, because [vowel pitch](/phonology#vowel-pitch) also follows order (first is low, fourth is high). This proposal does not retarget the shapes. A piano that fell as the count rose, or shapes in alphabet order (`u a o e`), is already rejected.

Hang the vowel hand on the tree under order. The rest of the code (consonant hand, hooked runs, piano left-thumb hook) is not an order series.

## Order (keep)

[Digit vowels](/numbers#counts) follow order. The cycle **a o e u** is first, second, third, fourth: `ba` `do` `ge` `hu`, then the climb starts again (`za` `vo` `re` `lu` `na` `mo`). Today’s cue (they climb the vowel pitches) becomes: they follow order. Letters stay. Tags use this same assignment.

[Vowel pitch](/phonology#vowel-pitch) follows order: first is low, fourth is high. It adds no meaning of its own. Pitch is Beginner; size is Advanced.

The finger-code **vowel hand** follows order: pinky first ([Finger code](#finger-code-keep)).

[Letter names](/phonotactics#letter-names) sit under digits as the [opposite vowel](/phonology#opposite-vowels). Each digit letter’s name keeps the consonant and takes the opposite (`a`↔`u`, `o`↔`e`), so naming a letter never sounds like counting. Reciting those ten names walks **u e o a** (`bu` `de` `go` `ha` …) as a consequence, not as a family. The rest of the alphabet continues that walk.

## Families

The letter order **a o e u** has two sibling readings. A **family** is a set of series that share one reading of those letters. Stacks compose inside their family. Amount series follow size. Digit vowels, tags, vowel pitch, and the finger-code vowel hand follow order. Letter names are the opposite of the digit.

| Family | **a** | **o** | **e** | **u** |
|--------|-------|-------|-------|-------|
| **Size** | big | medium | small | none |
| **Join** | *and* (grows) | rank (stays) | choice (one) | *not* (gone) |
| **Act** | statement | command | question | prohibition |
| **Hook** | *including* | *rather* | *instead* | *except* |
| **Extra-noun** | *in* | *for* | *at* | *from* |
| **Scope** | type | practiced role | this pair | this episode |
| **Ability** | can | can't right now | can't yet | never |
| **Pointer** | the other one | this sentence | latest | unsaid |
| **Sake** | met | motive | prescription | unmet |
| **Tag** | first (A) | second (O) | third (E) | last (U) |
| **Finger code** (vowel hand) | 1 (pinky) | 2 | 3 | 4 |
| **Order** | first | second | third | fourth |

Which cue each series follows:

**Size** (big / medium / small / none)

- [Middle vowel](/root-tails#root-tails)
- [Ability](/can-and-cant#ability)
- [Pointer vowel](/pronouns#role-pointers)
- [Conversation length](/compound-families#conversation-length)
- [Sake stance](/sakes#word-shape)

**Join** (*and* / rank / choice / *not*)

- [Join](/joins#join-type-vowel-series)
- [Stacked joins](/rank-joins)
- [Unspecified **-r](/joins#unspecified-member-r-phrase)**
- [Restrictor](/restrictors) / [more occasions](/more-occasions)
- [Comparative](/comparatives) / [equative](/comparatives#equatives)
- [Number marker](/number-markers#marker-vowel-referential-identity)
- [Join-act](/join-across-roles#join-act-verbs) / [join-relation](/join-across-roles#join-relations)
- [Root job](/root-tails#root-tails) (last vowel) / [tail suffixes](/root-tails#tail-suffixes)

**Speech** (statement / command / question / prohibition)

- [Speech act](/speech-moves#speech-act-beginner)
- [Stand-in](/sentence-linkers#stand-in)
- [Say-word answer](/feelings-permission#say-words)
- [Polar](/questions#polar-stance) / [polar inventory](/polar-inventory)
- Rhetorical / quiz stacks

**Hook** (*including* / *rather* / *instead* / *except*)

- [Same-role hook](/hooks#including)
- [Discourse glue](/hooks#discourse-hooks)
- [Hook resume](/discourse-hooks#hook-resume)
- [Hook prefix](/hook-compounds#hook-prefixes) / [hooked join](/hooked-joins)
- [Ranges](/ending-grids#ranges)

**Extra-noun** (*in* / *for* / *at* / *from*; derives from hook)

- [Extra-noun](/hooks#extra-noun) / [stacked extra-noun](/extra-noun-hooks)
- [Feeling locus](/feelings-permission#emotion-compose)

**Scope** (type / practice / pair / episode)

- [Label scope](/label-seams#label-scope)
- [Role compound](/roles#one-time-or-a-practice)
- [Say-word scope](/feelings-permission#say-scope)
- [Landmark facing](/viewpoint#landmark-facing)
- Pointer *scope* slot

**Order** (first / second / third / fourth)

- [Digit vowels](/numbers#counts)
- [Tag](/tag-pronouns#tag-pronouns) (assign **a** first, **u** last)
- [Letter names](/phonotactics#letter-names) (opposite of the digit)
- [Vowel pitch](/phonology#vowel-pitch) (first is low, fourth is high)
- [Finger code](/finger-code#counting) vowel hand (pinky first)

[Stacked scope](/label-seams#scope-stacks) writes Scope letters but reads as Join invert and Hook. Stacked extra-noun writes Hook letters and reads as Join stacks. A say word is Scope then Speech (`hwuvom`: this-act **u**, require **o**). A role pointer is Scope then Pointer (`zwuzer`: episode **u**, latest **e**).

## Remaining series

### Order — sibling of size

Size and order are sibling readings of **a o e u**: size is amount, order is sequence. Pitch adds no meaning of its own; it follows order (first is low, fourth is high). Digit vowels, tags, and the finger-code vowel hand use order. Letter names are the opposite of the digit. Pitch is Beginner; size is Advanced. Neither hangs on the other.

## What a learner then holds

Two sibling maps on **a o e u**: size biggest to smallest, order first to fourth, read per family in the table above. Tags are letter names assigned first to last. Digit vowels follow that same order. Letter names take the opposite vowel of the digit. Vowel pitch climbs with the count. The finger-code vowel hand counts from the pinky, first to fourth. Sake is how much of the sake is in: met, motive, prescription, unmet.

Opposite vowels still line up: **a** ↔ **u** is most ↔ none, and **o** ↔ **e** is the middle pair.

On the [vowels cheat sheet](/cheat-sheets/vowels), group by family: Size (including middle vowel and sake) and Order (digits, tags, letter names as opposite, pitch, vowel hand) as siblings, then Join (including last-vowel job), Speech, Hook (including extra-noun), Scope, Ability, Pointer.

### Last phase: write the cue tree on `vowels.md`

After the letters and examples are absorbed, the last phase is to write the cue dependency tree onto [vowels.md](/cheat-sheets/vowels), as the map of which series follows which. The tree this proposal holds:

```
a o e u
├── size (big → none)
│     ├── middle vowel
│     ├── ability
│     ├── pointer vowel
│     ├── conversation length
│     ├── sake (met → motive → prescription → unmet)
│     ├── scope
│     │     ├── label scope
│     │     ├── role compound
│     │     ├── say-word scope
│     │     ├── landmark facing
│     │     ├── pointer scope slot
│     │     └── stacked scope (letters from scope, reading from join / hook)
│     └── join (and / rank / choice / not)
│           ├── stacked joins
│           ├── unspecified -r
│           ├── restrictors / more occasions
│           ├── comparatives / equative
│           ├── number markers
│           ├── join-act / join-relation
│           ├── root job (last vowel) / tail suffixes
│           ├── hook
│           │     ├── same-role
│           │     ├── discourse glue
│           │     ├── hook resume
│           │     ├── hook prefix / hooked join
│           │     ├── ranges
│           │     └── extra-noun
│           │           ├── stacked extra-noun
│           │           └── feeling loci
│           └── speech
│                 ├── speech act
│                 ├── stand-in
│                 ├── say-word answer
│                 ├── polar / polar inventory
│                 └── rhetorical / quiz stacks
└── order (first → fourth)
      ├── digit names (ba do ge hu za …)
      │     └── letter names (opposite: bu de go ha zu …)
      ├── tags (assign A first, U last)
      └── vowel pitch (low → high)
            └── finger-code vowel hand (pinky first)
```

Every series in [Families](#families) is a leaf. Size and order are siblings. A say word is scope then speech (`hwuvom`). A role pointer is scope then pointer (`zwuzer`).

## Absorb

Owning pages first. Parser construction *reader* strings, series sets, and summaries follow the pages. Grammar-letter swaps parse already; only which cell they name moves. Root-job last vowels are a real respell. Last phase: the cue tree on `vowels.md` (above).

Joins, acts, polar, hooks, ability, and label-scope **o**/**e** are pairwise swaps, plus polar **ae**↔**ao** and **ue**↔**uo**. A missed example is the opposite English. Pointers are a three-cycle on **a** / **o** / **e**. Label-scope **a**/**u** also swap. Sake letters stay; the cue becomes size. Digit vowels stay; their cue moves from pitch to order. Letter names stay; they are the opposite of the digit. Tag assignment, vowel pitch, and the finger-code vowel hand sit under order. Root tails need `convert-word` and `retie-docs`.

Touch list when absorbed:

- Grammar: `joins.md`, `rank-joins.md`, `speech-moves.md`, `questions.md`, `polar-inventory.md`, `hooks.md`, `extra-noun-hooks.md`, `discourse-hooks.md`, `ending-grids.md`, `compound-families.md`, `can-and-cant.md`, `label-seams.md`, `roles.md`, `pronouns.md`, `tag-pronouns.md`, `feelings-permission.md`, `viewpoint.md`, `sakes.md`, `ought-for-a-sake.md`, `prescription.md`, `root-tails.md`, comparatives and restrictors, plus every example that spells the old cells (`zel`, `yol`, `yael`, `zwazuduyel`, `hwavam`, `vezuyoxel`, `SELFxen`, `dwazer`, `gazuhethol`, `em`, `uem`, `ol bar`). Tag examples that assign A then E become A then O (`zwel` → `zwol`, `zwaer` → `zwaor`); the letters do not move. Sake cues on `sakes.md` / `prescription.md` / `ought-for-a-sake.md`; forms stay. Digit-vowel and letter-name cues on `numbers.md` / `phonotactics.md`.
- Lexicon: [`src/root-tails.ts`](../../src/root-tails.ts) `SHAPE_VOWELS`; `convert-word --lexicon --all` (and three-letter tails); `retie-docs --write`; `rename-language` if 👓 moves; `english-helper-wordnet` after the CSV change.
- Claritish: `labels.md`, `can-and-cant.md`, cheat sheet, editor flows if a cell name is a suffix.
- Editor notes: D-40, D-44, D-49 example spellings; [`src/parse/series.ts`](../../src/parse/series.ts); construction readers; english-helper cases (`at` / `for` / `using` / `whose`); [lexicon.md](../meta/lexicon.md) shape-letter map.
- Cheat sheets: vowels, joins-hooks, talking, word-shape, roles-comparing, knowing-intending, numbers, why-allowed, people-pointing (tag examples A then O).
- Finger code: [`finger-code.md`](/finger-code) letters stay; the vowel hand (pinky first) appears on the `vowels.md` cue tree under order. The consonant hand does not.

Series-letter examples are a hand edit: `retie-docs` will not catch them. Root respellings it will.

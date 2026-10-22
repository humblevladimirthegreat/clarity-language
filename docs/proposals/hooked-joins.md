# Proposal: Hooked joins (role + `w` + join + hook)

**Status:** PROPOSED. Nothing here is implemented. It replaces the current [kind indefinites](../grammar/joins.md#kind-indefinites) (role letter + **`w`** + knowledge vowel + kind letter + join). Retiring them frees role letter + **`w`** for this shape and for `role-consonant-compounds.md`, which moves role compounds and pointers there. The two shapes never collide ([spelling](#spelling-and-parsing)), so this proposal needs nothing from that one. It lands first; until that one lands, role compounds and pointers keep today's `x` shape.  
**Related:** [standalone joins](../grammar/joins.md#standalone-phrase), [unspecified member](../grammar/joins.md#unspecified-member-r-phrase), [universals and domains](../grammar/joins.md#universals-domains-generics), [extra-noun hooks](../grammar/hooks.md#extra-noun), [stacked extra-noun vowels](../grammar/hooks.md#extra-noun-intermediate), [hook point-back](../grammar/hooks.md#hook-resume), [here and there](../grammar/hooks.md#deixis), [since](../grammar/hooks.md#since), [tag pronouns](../grammar/pronouns.md#tag-pronouns), [hosted `bl-` words](../grammar/clause.md#extra-nouns), [of-relations](../grammar/relations.md#of-relations), [restrictors](../grammar/restrictors.md), [fill-ask](../grammar/questions.md#fill-ask-r).

## Problem

**1. A join can't say how its set is bounded.** To limit *every cat* to one place, [joins.md](../grammar/joins.md#universals-domains-generics) adds a hook after the kind: `zual gagozol ol bahehal vuhohol.` *Every cat at the house sits.* But that hook is a clause extra: the parser reads `ol bahehal` as the clause's extra noun. So *every cat at the house sits* (who counts) and *every cat sits at the house* (where it happens) share one spelling. The same is true of *someone in the school*, *something for me*, *everyone against me*.

**2. Most of the kind indefinite doesn't earn its place.** The kind letter mostly makes a one-word version of something already sayable (`zeyol zar`, `zul geyol`). Most uses of the knowledge vowel are covered by plain forms, resume **-r**, PLAN or MEMORY ([what the knowledge vowel did](#what-the-knowledge-vowel-did)). Two uses are worth keeping: the quiz, which moves to `stacked-speech-acts.md` (`yol yal`), and *the times we both know*, which the [holder](../grammar/knowing.md#holder) seam already covers ([shared history](#shared-history)).

A **hooked join** fixes the first problem in the shape the second one gives back. It puts the hook inside the join word, so the hook bounds the join's set and is never read as a clause extra.

## The shape

```
role letter + w + join vowel(s) + join ending + hook vowel(s) + hook ending (+ x)
```

| Piece | What it says | In `zwualol` |
|-------|--------------|--------------|
| role letter | the slot **now**: `/z/`, `/d/`, `/b/`, or `/h/` | `z` |
| `w` | a hooked join starts here | `w` |
| join vowel(s) + ending | any standalone join, read as usual | `ual` *everyone* |
| hook vowel(s) + ending | an [extra-noun hook](../grammar/hooks.md#extra-noun), read as usual | `ol` *at* |
| `x` | **-rx** on the join, moved to the end of the word | |

The **landmark** is a hosted `bl-` word right after the hooked join, as it is for any relation word.

The teaching cue: take a join and a hook you already know (`zual ol`), write them as one word, and put **`w`** after the role letter. The join keeps its meaning and its ending, the hook keeps its meaning and its ending, and the landmark takes `bl-` because it completes the word before it.

> `zwualol blahehal vezuvol.`
>
> [z-everything.at | bl-house] | v-sleep
>
> "Everyone at the house sleeps."

> `zual vezuvol ol bahehal.`
>
> z-everything | v-sleep | [at | b-house]
>
> "Everyone sleeps at the house."

Both can appear in one clause, and they do different jobs:

> `zwualal bluzahal vezuvol ol bahehal.`
>
> [z-everything.in | bl-school] | v-sleep | [at | b-house]
>
> "Everyone in the school sleeps at the house."

## Hook vowels and the hook's ending

Only the [extra-noun](../grammar/hooks.md#extra-noun-intermediate) readings are used. The set is the members that stand in that relation to the landmark. The relation is between each member and the landmark, not between the event and the landmark. The hook keeps its full ending grid: **-l** is the exact relation, **-m** the frame, as on a free hook.

| Vowel | **-l** | Sketch | **-m** | Sketch |
|-------|--------|--------|--------|--------|
| `a` | *in* | `dwaral blahehal` *something in the house* | *amid* | `zwaram bluzahal` *someone amid the school* |
| `ao` | *on* | `dwaraol bledohol` *something on the table* | *over* | `dwaraom bledohol` *something over the table* |
| `o` | *at* | `zwualol blahehal` *everyone at the house* | *near* | `zwualom bluwon` *everyone here* |
| `oe` | *toward* | `zwaroelx bluzahal` *some people heading to the school* | *in the direction of* | |
| `u` | *from* | `dwarul blahehal` *something that came from the house* | *away from* | `zwualum bluwon` *everyone away from me* |
| `ua` | *out of* | `dwarual blahehal` *something out of the house* | *out from among* | |
| `uo` | *through* | `zwaruol blahehal` *someone passing through the house* | *by way of* | |
| `e` | *for* | `dwarel bluwon` *something for me* | *used by* | `dwarem bluwon` *something I use* |
| `ae` | *using* | `zwualael blanewul` *everyone with a knife* | *by* | |
| `ue` | *against* | `zwualuel bluwon` *everyone against me* | *contrary to* | |

**Here and there.** A person landmark gives [deixis](../grammar/hooks.md#deixis) with the same hooks the free phrase uses: `zwualom bluwon` *everyone here*, `zwualom blawan` *everyone there by you*, `zwualum blayan` *everyone over there*. `zwualol bluwon` is *everyone right where I am*.

**`u` is a path, not an origin.** `dwarul blahehal` is something that came from the house, as hook `ul` names a path's source. Where someone is from, as identity, is the [of-relation](../grammar/relations.md#of-relations) **`gaham`**, which already bounds a join as SHARED: `zual gaham blahaham` *everyone from the village*.

**`a` is containment, not membership.** `zwualal blavayal` is everyone inside the family's space. Membership is the of-relation **`gobem`**, again as SHARED: `zual gobem blavayal` *everyone in the family*.

**Why not the in-clause readings?** The same vowels also mean *including*, *rather*, *instead*, and *except*. Those are set operations, and the join series already has them: `zuzozen zual` is *everyone but Uzozen*, and `zur` is *someone else*. Giving the hook those readings too would make two spellings that mean the same thing, and an ambiguity, for no gain.

### Point back (hook **-r**)

With hook **-r** and no `bl-` word, the hooked join points back to the landmark already in play, by the [hook **-r**](../grammar/hooks.md#hook-resume) rule exactly: `zwualor` is *everyone there* as `or` is *there*.

> `zuzozen vuhohol ol bahehal. zwualor vezuvol.`
>
> z-Uzozen | v-sit | [at | b-house] . z-everything.there | v-sleep
>
> "Uzozen sits at the house. Everyone there sleeps."

A `bl-` word after hook **-r** has nothing to complete. Hook **-l** or **-m** with no `bl-` word after it is not a sentence: the landmark is left unsaid only by **-r**. If no landmark is in play, hook **-r** points at nothing, and the whole thing is not a sentence, as with a pointer.

## The landmark

Any word that can be a hosted `/b/` today works: a name (`bluzozen`), a content word (`blahehal`), a special pronoun (`bluwon`, `blawan`, `blayan`), a resume (`blahehar`). Today a `bl-` word must complete a `/ɡ/`, `/h/`, or `/th/` word right before it. This adds the hooked join to that list.

**A standalone join.** As after any relation word ([relations](../grammar/relations.md#locative-relations)), a join with no items is the whole landmark and takes `bl-`. It names the widest bound out loud:

| Agebon | English |
|--------|---------|
| `zwualol blual` | *everyone, anywhere, no exceptions* |
| `zwuamol blual` | *people anywhere, in general, as far as I know* |
| `zwalol blual` | *nobody anywhere* |

**Order with SHARED.** The `bl-` word comes right after the hooked join, because it completes the word right before it. A SHARED `/ɡ/` comes after it: `zwualol blahehal gagozol` is *every cat at the house*.

### Bounded by a clause

On `/h/` only, the landmark may be the stand-in **`blarl`**, as [`ul barl`](../grammar/hooks.md#since) takes one for *since*. The sentence after it is the time that bounds the restrictor, and it runs to the period, so the hooked join comes last.

> `zawan vebal hwalul blarl zayan vavobel al bahehal.`
>
> z-listener | v-hear | [h-never.from | bl-that-clause] | z-interlocutors | v-go | [in | b-house]
>
> "You haven't listened since we moved into the house."

This gives *never, in all the time since …* a checkable stretch the speaker names.

### Shared history

*Any time we both know of* is a stance, not a stretch, so it needs no landmark. It is the [holder](../grammar/knowing.md#holder) seam with the interlocutors as holder:

> `zawan vebal hal thevumayan.`
>
> z-listener | v-hear | h-never | th-MEMORY-interlocutors
>
> "From what I remember of what we both saw, you've never listened."

MEMORY says the claim rests on the speaker's memory, and the holder says the view is one both people share. The speaker can't know the listener's memory, only claim the view is shared, and the listener can answer with a memory of their own. `ham thevumayan` adds *as far as I know*. The same seam covers *nobody / nothing we both know of* (`zal`, `dal` with `thevumayan`).

## Endings

The join part keeps its readings ([recap](../grammar/joins.md#join-type-vowel-series)). The hook only bounds the set it ranges over. Each line below works with any hook ending.

| Join ending | Sketch | English | Under `yol` |
|-------------|--------|---------|-------------|
| **-r** | `zwarol blahehal` | *someone at the house* | *who at the house?* |
| **-r**, other arities | `zworol` / `zwurol` / `zwerol` | *anyone there* / *someone else there* / *whoever there ranks highest* | *any? / who else? / which one most?* |
| **-r** + **-x** | `zwarolx blahehal` | *some people at the house* | *who all at the house?* |
| **-l** | `zwalol blahehal` | *nobody at the house* | |
| **-m** | `zwamol blahehal` | *nobody at the house, as far as I know* | |
| **-l** on `ua` | `zwualol blahehal` | *everyone at the house, no exceptions* | |
| **-m** on `ua` | `zwuamol blahehal` | *everyone at the house, as far as I know* | |

The two endings are independent: `zwuamom bluwon` is *everyone around here, as far as I know*.

**-x** always ends the word (`zwarolx`, never `zwarxol`): `rx` mid-word would close a syllable with `r`.

**-n** stays reserved on both sides: `zwualon` and `zwuanol` have no reading.

> `yol dwarel bluwon.`
>
> y-question | [d-wh.for | bl-speaker]
>
> "What is there for me?"

### With items before it

On **-l** and **-m**, the items are the whole list within the bounded set, as on any closed or open join:

> `zuzozen zwalol blahehal vowurel.`
>
> [z-Uzozen | z-and.at | bl-house] | v-walk
>
> "Of everyone at the house, only Uzozen walks."

On **-r**, the join stands for one of the items, and the hook says which: the one that stands in that relation.

> `yol zudozol zagozol zwarol blahehal.`
>
> y-question | [z-dog | z-cat | z-something.at | bl-house]
>
> "Which of the dog and the cat is at the house?"

## Where it may sit

- **`/z/` and `/d/`:** where a noun would stand.
- **`/b/`:** a plain `/b/` hooked join is the recipient (`vezuyel bwarol blahehal` *tells someone at the house*). After an extra-noun hook it is that hook's landmark: `al bwaraol bledohol` is *in something on the table*.
- **`/h/`:** the join part is a bare restrictor (`al`, `am`, `ual`, `uam`, `ar`, `or`, `ur`, `er`), and a time landmark bounds which times the restrictor covers. Only hooks with a time reading take part:

| Hook | Times | Sketch | English |
|------|-------|--------|---------|
| `al` | within the landmark's span | `hwualal blenulul` | *always, during the thunderstorm* |
| `ol` | at that moment | `hwarol blenulul` | *at some point at the thunderstorm* |
| `ul` | from that point on ([since](../grammar/hooks.md#since)) | `hwalul blenulul` | *never since the thunderstorm* |
| `oel` | up to that point | `hwualoel blenulul` | *always, until the thunderstorm* |
| `om` | around that moment (the frame of `ol`) | `hwualom blenulul` | *always, around the time of the thunderstorm* |

> `zawan vebal hwamul blenulul.`
>
> z-listener | v-hear | [h-never.open.from | bl-thunderstorm]
>
> "You haven't listened since the thunderstorm, as far as I know."

> `zuzozen vowurel hwualoel blenulul.`
>
> z-Uzozen | v-walk | [h-always.toward | bl-thunderstorm]
>
> "Uzozen always walked, until the thunderstorm."

> `zuzozen vezuyol hwualom blenulul.`
>
> z-Uzozen | v-sing | [h-always.near | bl-thunderstorm]
>
> "Uzozen always sings around the time of the thunderstorm."

[`harum`](../grammar/dependents.md#time-poles) *until* places the event; `hwualoel` bounds the *always*. A loose bound is often the honest one: *you always get like this at the holidays* is usually *around* them (`hwualom`), and the listener can check it.

These time readings belong to the `/h/` hooked join only, where they bound a restrictor. A free hook on a time is still only `ul` *since*; the event's own time takes the [time poles](../grammar/dependents.md#time-poles). The other hooks stay unassigned on `/h/`: `uo` would repeat `a` (*throughout* is *within*), `am` (*in the thick of*) is close to `al`, `oem` (*in the run-up to*) overlaps [`habam`](../grammar/dependents.md#time-poles) *before*, and `ua`, `um`, `ao`, `e`, `ae`, `ue` and their frames have no time reading.

**Point back to a time.** Hook **-r** on `/h/` takes the latest **time landmark**: the `bl-` word of a time pole (`herem`, `habam`, `halam`, `harum`, `hevahum`), the landmark of an earlier `/h/` hooked join, or a `blarl` clause in either. It skips place landmarks, and with no time landmark in play it is not a sentence, as on any pointer.

> `zuzozen vowurel halam blenulul. zawan vebal hwalur.`
>
> z-Uzozen | v-walk | [h-after | bl-thunderstorm] . z-listener | v-hear | h-never.since.then
>
> "Uzozen walked after the thunderstorm. You haven't listened since then."

Every target is marked by structure, so the resolver needs no noun meanings. A free `ul` on a time (`ul benulul`) reads as *since* only because of the noun, so it is not a target.

- **Not on `/v/`, `/ɡ/`, `/x/`, `/th/`, `/w/`, or `/y/`.** An act is placed with a clause extra (`var` plus a hook). Adjectives, clauses, stances and calls have no set that a landmark could bound.

## Why it helps

- **It shows the scope of a sweeping claim.** *Everyone at work hates me* and *everyone's against me* hide how far they reach. Here the speaker states the bound (`zwualol blovahal`, `zwualuel bluwon`), and the join ending says whether exceptions are ruled out: `zwualuel` (*every one of them, no exceptions*) and `zwuamuel` (*as far as I know*) sound different. The listener can push back on the bound, or ask for the exception. A stereotype takes the same choice through `gaham`: `zual gaham blahaham` against `zuam gaham blahaham`.
- **It separates who counts from where it happens.** A domain is never mistaken for a location.
- **It types a question by relation.** `yol dwarel bluwon` (*anything for me?*) and `yol zwarol blahehal` (*who's at the house?*) ask about a set the listener can check.
- **Time bounds for *never* and *always*.** *You never listen* becomes *you haven't listened since …* (`hwalul`), and *you always did* becomes *always, until …* (`hwualoel`), claims about a stretch the listener can check. A clause can name the stretch (`hwalul blarl`). This covers part of what the knowledge vowel's `e` did on `/h/`.
- **The word is the phrase.** `zwualol blahehal` is `zual ol bahehal` written as one word, in the same order, so a learner reads it with what they already know.

## What the knowledge vowel did

Every kind indefinite was optional, and plain `zar` stayed the default. A route with an extra clause is just as optional, so nothing is lost on how often people mark it, only length.

| Current form | Job | Route after this proposal |
|--------------|-----|---------------------------|
| `yol ol bwuhar` | a real question | plain `yol ol bar` ([questions.md](../grammar/questions.md#four-kinds-of-question) already says so) |
| `zwuyar` | *someone; I don't know who* | plain `zar` / `zeyol zar` |
| `zweyar` | *that person, you know the one* | resume **-r** with no antecedent: `zeyor` ([resume](../grammar/pronouns.md#resume-r)) |
| `zwoyar` | *a certain someone* (I know who) | `zar` plus `zuwon vanam dorl zar.` (*I know who*) |
| `yol zwoyar …`, `yol xwovar` | a quiz | `yol yal` (`stacked-speech-acts.md`) |
| `yol ol bwehar zayan vagedal` | *remind me* | MEMORY: `yol ol bar zayan thevum vagedal.` |
| `yol ol bwahar zayan vagedal`, `yol vwavar zayan` | a choice | PLAN: `yol ol bar zayan thagem vagedal.`, `yol var zayan thagem.` |
| `thebam blwoyar` / `thebam blwuyar` | a source you won't name / don't know | `thebam blumon` plus `zuwon vanam dorl zar.` (or its denial) |
| `zwuyual` | *everyone here* | `zwualom bluwon`, or plain `zual geyol` |
| `zwayual` / `zwayuam` | *all people anywhere* / *people in general* | `zwualol blual` / `zwuamol blual`, `eyon` |
| `zwoyual` | *everyone I mean* | dropped (vague by design) |
| `hweral`, `zweyal`, `vweval` | *never / nobody / nothing we both know of* | the holder seam: `hal thevumayan` ([shared history](#shared-history)); a stretch the speaker can name takes `hwalul blarl` ([bounded by a clause](#bounded-by-a-clause)) |
| `zweyual` | *everyone we know* (a domain) | SHARED role compound with pair scope: `zual guxanathom blayan` ([open question](#open-questions)) |
| `gwuzar`, `gwalar` | a typed *what kind?* | plain `gar` ([what kind?](../grammar/questions.md#what-kind)) |
| `xwuvar`, `xwevar` | *something happened* + knowledge | plain `xar` |

`zarx` and **-rx** on plain joins stay. They were added with kind indefinites, but they don't depend on them. The [root-tail](../grammar/compounds.md#root-tails) consonants go back to being a memory aid only.

## Spelling and parsing

- **The shape is today's kind indefinite slot.** Kind letters include `l`, `m`, `r`, and `n`, so today `zwalol` reads as a kind indefinite (`a` + kind letter `l` + `ol`). It is free only once kind indefinites are gone, which this proposal does.
- **Three readings after role + `w` + vowel(s):** the next letter decides.
  - A part consonant (`z`, `d`, `b`, `h`, `g`, `th`, `v`): a role compound or pointer, once `role-consonant-compounds.md` lands. Until then, no word has any consonant other than an ending letter there.
  - An ending letter (`l`, `m`, `n`, `r`), then the end of the word, **-x**, or **-n**: a [tag](../grammar/pronouns.md#tag-pronouns) (`zwal`, `zwarx`). A tag has one vowel.
  - An ending letter, then a vowel: a hooked join. The vowel starts the hook.
- **Syllables:** the join's ending starts the hook's syllable (`zwu-a-lol`), as the left ending does in a [hook compound](../grammar/hooks.md#hook-compounds). No consonant closes a syllable mid-word.
- **Stacks:** a join stack and a hook stack can meet (`zwuamuel`, `dwaraol`). Each side follows the six-stack rule ([phonology](../grammar/phonology.md)).
- **Length:** `zwualol blahehal` is two words where `zual ol bahehal` is three, with the same number of syllables.
- **Sound-alikes:** with a landmark, `zwalol blahehal` and a tag before a hook (`zwal ol bahehal`) differ in `bl-` against `b-`. With hook **-r**, `zwaror vowurel` (*someone there walks*) and `zwar or vowurel` (*A walks there*) differ only by the word break, and [first-syllable stress](../grammar/phonology.md#rhythm-and-stress) marks it: `zwaror` takes one beat, and `zwar or` a fresh one on `or`. [Hook compounds](../grammar/hooks.md#hook-compounds) already rely on this (`vowurel ol` against `vowurelol`).
- **No seams:** a hooked join never sits after a `th` seam (holder, lateral). It isn't a person-naming word.
- **Morph gloss:** the join's label, then `.open` for join **-m**, then the hook's label from the [extra-noun grid](../grammar/hooks.md#extra-noun-intermediate) (the frame label on hook **-m**). The landmark rides in the bracket: `[z-everything.at | bl-house]`, `[z-everything.open.near | bl-speaker]`, `d-wh.for`, `h-never.open.from`. Hook **-r** takes the hook **-r** label: `z-everything.there`, `d-something.on.it`, `z-someone.from.there`.

## Open questions

### Everyone we know, as a domain

Old `zweyual` named the people both speakers are acquainted with. That is a set, not a stance, so the [holder seam](#shared-history) doesn't cover it, and no hook names *known to*, so a hooked join doesn't either. This proposal lands before `role-consonant-compounds.md`, so the route has to use today's [role compounds](../grammar/roles.md#role-compounds).

Today's grammar already has one. The undergoer role compound of *know* is *one who is known* (`guxanam`). [Pair scope](../grammar/predication.md#scope-relative) **`tho`** says the label holds toward one other party, named in a `bl-` word, as `golayothom blolazun` is *a stranger to Olazun*. Together, `guxanathom blayan` is *known to the two of us*, and as SHARED after a join it bounds the set:

> `zual guxanathom blayan vezuvol.`
>
> [z-everything | [g-patient-x-knowledge-th-pair | bl-interlocutors]] | v-sleep
>
> "Everyone we know sleeps."

The join does the rest, as on any SHARED bound, and every row below parses with one tree today:

| Agebon | English |
|--------|---------|
| `zual guxanathom blayan` | *everyone we know* |
| `zuam guxanathom blayan` | *everyone we know, as far as I know* |
| `zal guxanathom blayan` | *nobody we know* |
| `zarx guxanathom blayan` | *some people we know* |
| `zual guxanathom blayan zul` | *not everyone we know* ([not every](../grammar/joins.md#not-every)) |
| `zual guxanathom bluwon` | *everyone I know* |

The pair scope keeps the claim honest in the same way as the rest of this proposal. *Everyone hates me* bounded to `blayan` is *everyone we both know*, and the listener can name someone in that set. The other party is a group here, and `blayan` reads as the two of us together: people both of us know. People either of us knows would take a join of landmarks, as after any relation word ([relations](../grammar/relations.md#locative-relations)).

The cost is length: three words where `zweyual` was one. That is the same trade as the other [routes](#what-the-knowledge-vowel-did), and the form is built from parts a learner already has at intermediate level.

**Recommendation:** close the question with this route. Put it in the route table and on [joins.md](../grammar/joins.md#kind-domains) where the *every and none, by set* table is rewritten, with no G-row. When `role-consonant-compounds.md` lands later, its retie respells `guxanathom` with the rest of the role compounds (scope moves to V1 there, so the pair scope `o` goes up front: `gwodanam blayan`). No hooked-join form depends on it.

## What changes

- **Grammar:**
  - [joins.md](../grammar/joins.md): rewrite the kind-indefinite section as hooked joins, rewrite the *every and none, by set* table, and change the universals paragraph so a hook after the kind is a clause extra and the bound takes a hooked join or a SHARED relation (`gobem`, `gaham`).
  - [questions.md](../grammar/questions.md): remove *four kinds of question* and the typed-blank rules after `yal yol`, and add hooked-join blanks.
  - [knowing.md](../grammar/knowing.md): source table and holder note.
  - [restrictors.md](../grammar/restrictors.md): replace *always and never, by which times* with `/h/` hooked joins: the time hooks including `om`, **`blarl`**, point-back to a time, and the holder seam for shared history.
  - [hooks.md](../grammar/hooks.md): place indefinites, a deixis note for `zwualom bluwon`, and **`blarl`** beyond `ul`.
  - [pronouns.md](../grammar/pronouns.md): the tag intro says `w` followed by vowels and an ending is a tag; add that a vowel after the ending makes a hooked join.
  - [relations.md](../grammar/relations.md): a compare line on `gobem` and `gaham` as set bounds.
  - [phonology.md](../grammar/phonology.md): `zwaror` against `zwar or` as an example in *rhythm and stress*.
  - Smaller edits: [compounds.md](../grammar/compounds.md) root tails, [english.md](../grammar/english.md) some- and any- rows, [terminology.md](../grammar/terminology.md) (drop knowledge vowel and kind letter; add hooked join), and [phonology.md](../grammar/phonology.md) cluster list.
  - The cheat sheets `joins-hooks`, `talking`, `restrictors-spans`, `knowing-intending`, `to-english`, and the say pages that cite kind indefinites.
- **Design notes:**
  - `unassigned-reserved.md`: join **-n** and hook **-n** on a hooked join; hook **-m** on `/h/` other than `om` (open); `/h/` with hooks that have no time reading (`ua`, `uo`, `ao`, `e`, `ae`, `ue`); and the retired kind-indefinite spellings, unless `role-consonant-compounds.md` claims them.
  - `design-decisions.md`: why in-clause readings are excluded, why `a` and `u` stay spatial (membership and origin are `gobem` and `gaham`), why time readings stay on the `/h/` hooked join and off free hooks, why **-x** moves to the end, and why the knowledge vowel was dropped.
  - `glosses.md`: the gloss row.
- **Code:**
  - Replace [`kind-indefinite.ts`](../../src/parse/kind-indefinite.ts) and the `kindIndefinite` rule in [`word.peggy`](../../src/parse/word.peggy) with the hooked-join rule.
  - Allow the `bl-` landmark (enforce, hosted rules), and **`blarl`** after an `/h/` hooked join.
  - Point-back resolution in `resolve.ts`, reusing the hook **-r** logic, with time landmarks only on `/h/`.
  - Update the morph gloss and gloss-inverse, `constructions.ts` reader notes, the LLM prompt, and the english-helper recipes.
  - Then run `npm run grammar-check`.

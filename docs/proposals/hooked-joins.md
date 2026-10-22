# Proposal: Hooked joins (role + hook + `x` + join)

**Status:** PROPOSED. Nothing here is implemented. The hooked join is built in the order `hook-prefixes.md` uses: hook vowels, **`x`**, then the head. It takes the role letter + vowel + **`x`** + vowel + ending slot, which is no longer a role pointer (pointers use role letter + **`w`**). So it lands with or after `hook-prefixes.md`, and no page ever reads a hooked join as a pointer.  
**Related:** [standalone joins](../grammar/joins.md#standalone-phrase), [unspecified member](../grammar/joins.md#unspecified-member-r-phrase), [universals and domains](../grammar/joins.md#universals-domains-generics), [extra-noun hooks](../grammar/hooks.md#extra-noun), [stacked extra-noun vowels](../grammar/hooks.md#extra-noun-intermediate), [hook point-back](../grammar/hooks.md#hook-resume), [hook compounds](../grammar/hooks.md#hook-compounds), [here and there](../grammar/hooks.md#deixis), [since](../grammar/hooks.md#since), [left and right of `x`](../grammar/compounds.md#families-by-shape), [hosted `bl-` words](../grammar/clause.md#extra-nouns), [of-relations](../grammar/relations.md#of-relations), [restrictors](../grammar/restrictors.md), [fill-ask](../grammar/questions.md#fill-ask-r).

## Problem

A join can't say how its set is bounded. To limit *every cat* to one place, [joins.md](../grammar/joins.md#universals-domains-generics) adds a hook after the kind: `zual gagozol ol bahehal vuhohol.` *Every cat at the house sits.* But that hook is a clause extra: the parser reads `ol bahehal` as the clause's extra noun. So *every cat at the house sits* (who counts) and *every cat sits at the house* (where it happens) share one spelling. The same is true of *someone in the school*, *something for me*, *everyone against me*.

A **hooked join** fixes this. It puts the hook inside the join word, so the hook bounds the join's set and is never read as a clause extra.

## The shape

```
role letter + hook vowel(s) (+ m or r) + x + join vowel(s) + join ending (+ x)
```

| Piece | What it says | In `zoxual` |
|-------|--------------|-------------|
| role letter | the slot **now**: `/z/`, `/d/`, `/b/`, or `/h/` | `z` |
| hook vowel(s) | an [extra-noun hook](../grammar/hooks.md#extra-noun), read as usual | `o` *at* |
| `m` or `r` | the hook's ending when it is not **-l**: **-m** the frame, **-r** [point back](#point-back-hook--r) | none: **-l** |
| `x` | the seam, as in a hook prefix | `x` |
| join vowel(s) + ending | any standalone join, read as usual | `ual` *everyone* |
| final `x` | **-rx** on the join | |

The **landmark** is a hosted `bl-` word right after the hooked join, as it is for any relation word.

The teaching cue: take a hook and a join you already know (`ol`, `zual`). Write the hook first, as in a hook prefix, then **`x`**, then the join, and put the role letter in front. As on a hook prefix, the hook's **-l** is not written; an **-m** or **-r** stays, right before the seam. The join keeps its meaning and its ending, and the landmark takes `bl-` because it completes the word before it.

> `zoxual blahehal vezuvol.`
>
> [z-at-x-everything | bl-house] | v-sleep
>
> "Everyone at the house sleeps."

> `zual vezuvol ol bahehal.`
>
> z-everything | v-sleep | [at | b-house]
>
> "Everyone sleeps at the house."

Both can appear in one clause, and they do different jobs:

> `zaxual bluzahal vezuvol ol bahehal.`
>
> [z-in-x-everything | bl-school] | v-sleep | [at | b-house]
>
> "Everyone in the school sleeps at the house."

## Hook vowels and the hook's ending

Only the [extra-noun](../grammar/hooks.md#extra-noun-intermediate) readings are used. The set is the members that stand in that relation to the landmark. The relation is between each member and the landmark, not between the event and the landmark. The hook keeps its full ending grid: **-l** (no letter) is the exact relation, **-m** (`m` before the seam) the frame, as on a free hook.

| Vowel | **-l** | Sketch | **-m** | Sketch |
|-------|--------|--------|--------|--------|
| `a` | *in* | `daxar blahehal` *something in the house* | *amid* | `zamxar bluzahal` *someone amid the school* |
| `ao` | *on* | `daoxar bledohol` *something on the table* | *over* | `daomxar bledohol` *something over the table* |
| `o` | *at* | `zoxual blahehal` *everyone at the house* | *near* | `zomxual bluwon` *everyone here* |
| `oe` | *toward* | `zoexarx bluzahal` *some people heading to the school* | *in the direction of* | |
| `u` | *from* | `duxar blahehal` *something that came from the house* | *away from* | `zumxual bluwon` *everyone away from me* |
| `ua` | *out of* | `duaxar blahehal` *something out of the house* | *out from among* | |
| `uo` | *through* | `zuoxar blahehal` *someone passing through the house* | *by way of* | |
| `e` | *for* | `dexar bluwon` *something for me* | *used by* | `demxar bluwon` *something I use* |
| `ae` | *using* | `zaexual blanewul` *everyone with a knife* | *by* | |
| `ue` | *against* | `zuexual bluwon` *everyone against me* | *contrary to* | |

The abstract-landmark readings that `hook-prefixes.md` gives the hooks apply here too, because they belong to the hooks: `zaxual blobowum` *everyone in crisis*, `zuexual blonam` *everyone against the policy*.

**Here and there.** A person landmark gives [deixis](../grammar/hooks.md#deixis) with the same hooks the free phrase uses: `zomxual bluwon` *everyone here*, `zomxual blawan` *everyone there by you*, `zumxual blayan` *everyone over there*. `zoxual bluwon` is *everyone right where I am*.

**`u` is a path, not an origin.** `duxar blahehal` is something that came from the house, as hook `ul` names a path's source. Where someone is from, as identity, is the [of-relation](../grammar/relations.md#of-relations) **`gaham`**, which already bounds a join as SHARED: `zual gaham blahaham` *everyone from the village*.

**`a` is containment, not membership.** `zaxual blavayal` is everyone inside the family's space. Membership is the of-relation **`gobem`**, again as SHARED: `zual gobem blavayal` *everyone in the family*.

**Why not the in-clause readings?** The same vowels also mean *including*, *rather*, *instead*, and *except*. Those are set operations, and the join series already has them: `zuzozen zual` is *everyone but Uzozen*, and `zur` is *someone else*. Giving the hook those readings too would make two spellings that mean the same thing, and an ambiguity, for no gain.

### Point back (hook **-r**)

With `r` before the seam and no `bl-` word, the hooked join points back to the landmark already in play, by the [hook **-r**](../grammar/hooks.md#hook-resume) rule exactly: `zorxual` is *everyone there* as `or` is *there*.

> `zuzozen vuhohol ol bahehal. zorxual vezuvol.`
>
> z-Uzozen | v-sit | [at | b-house] . z-there-x-everything | v-sleep
>
> "Uzozen sits at the house. Everyone there sleeps."

A `bl-` word after hook **-r** has nothing to complete. Hook **-l** or **-m** with no `bl-` word after it is not a sentence: the landmark is left unsaid only by **-r**. If no landmark is in play, hook **-r** points at nothing, and the whole thing is not a sentence, as with a pointer.

## The landmark

Any word that can be a hosted `/b/` today works: a name (`bluzozen`), a content word (`blahehal`), a special pronoun (`bluwon`, `blawan`, `blayan`), a resume (`blahehar`). Today a `bl-` word must complete a `/ɡ/`, `/h/`, or `/th/` word right before it. This adds the hooked join to that list.

**A standalone join.** As after any relation word ([relations](../grammar/relations.md#locative-relations)), a join with no items is the whole landmark and takes `bl-`. It names the widest bound out loud:

| Agebon | English |
|--------|---------|
| `zoxual blual` | *everyone, anywhere, no exceptions* |
| `zoxuam blual` | *people anywhere, in general, as far as I know* |
| `zoxal blual` | *nobody anywhere* |

**Order with SHARED.** The `bl-` word comes right after the hooked join, because it completes the word right before it. A SHARED `/ɡ/` comes after it: `zoxual blahehal gagozol` is *every cat at the house*.

### Bounded by a clause

On `/h/` only, the landmark may be the stand-in **`blarl`**, as [`ul barl`](../grammar/hooks.md#since) takes one for *since*. The sentence after it is the time that bounds the restrictor, and it runs to the period, so the hooked join comes last.

> `zawan vebal huxal blarl zayan vavobel al bahehal.`
>
> z-listener | v-hear | [h-from-x-never | bl-that-clause] | z-interlocutors | v-go | [in | b-house]
>
> "You haven't listened since we moved into the house."

This gives *never, in all the time since …* a checkable stretch the speaker names.

## Compare with the hook prefix

`zoxual blahehal` and `zual goxahehal` (a SHARED `/ɡ/` hook prefix, *everyone at-home*) overlap, and both are allowed. The hook prefix fuses the landmark into one word, so it names a kind of member: a standing property that can enter the dictionary. The hooked join keeps the landmark a hosted word, so it can be a name, a special pronoun (`bluwon`), a resume, a standalone join (`blual`), or a clause (`blarl`). Only the hooked join has the **-m** frames and point-back, and only it bounds a restrictor on `/h/`. Use the hook prefix for a kind of member (*the at-home people*), and the hooked join for one landmark (*everyone at that house*).

The two words read their right side differently. In a hook prefix, the stem after **`x`** is the landmark: `guexavuvul` is *anti-fighting*. In a hooked join, the join after **`x`** is the word's head, and the landmark is the `bl-` word: `zuexual bluwon` is *everyone against me*, not *against everyone*. The shape after **`x`** tells them apart: a stem is a root, and a join is only vowels and an ending.

## Endings

The join part keeps its readings ([recap](../grammar/joins.md#join-type-vowel-series)). The hook only bounds the set it ranges over. Each line below works with any hook ending.

| Join ending | Sketch | English | Under `yol` |
|-------------|--------|---------|-------------|
| **-r** | `zoxar blahehal` | *someone at the house* | *who at the house?* |
| **-r**, other arities | `zoxor` / `zoxur` / `zoxer` + `blahehal` | *anyone* / *someone else* / *whoever ranks highest*, at the house | *any? / who else? / which one most?* |
| **-r** + **-x** | `zoxarx blahehal` | *some people at the house* | *who all at the house?* |
| **-l** | `zoxal blahehal` | *nobody at the house* | |
| **-m** | `zoxam blahehal` | *nobody at the house, as far as I know* | |
| **-l** on `ua` | `zoxual blahehal` | *everyone at the house, no exceptions* | |
| **-m** on `ua` | `zoxuam blahehal` | *everyone at the house, as far as I know* | |

The two endings are independent: `zomxuam bluwon` is *everyone around here, as far as I know*.

The hook's ending sits before the seam and the join's ending at the end of the word, so the two never meet: in `zorxarx`, the first `r` is the hook's point-back and the last `rx` the join's group.

**-n** stays reserved on both sides: `zonxual` and `zoxuan` have no reading. `l` before the seam (`zolxual`) has no reading either: **-l** is the bare form.

> `yol dexar bluwon.`
>
> y-question | [d-for-x-wh | bl-speaker]
>
> "What is there for me?"

### With items before it

On **-l** and **-m**, the items are the whole list within the bounded set, as on any closed or open join:

> `zuzozen zoxal blahehal vowurel.`
>
> [z-Uzozen | z-at-x-and | bl-house] | v-walk
>
> "Of everyone at the house, only Uzozen walks."

On **-r**, the join stands for one of the items, and the hook says which: the one that stands in that relation.

> `yol zudozol zagozol zoxar blahehal.`
>
> y-question | [z-dog | z-cat | z-at-x-something | bl-house]
>
> "Which of the dog and the cat is at the house?"

## Where it may sit

- **`/z/` and `/d/`:** where a noun would stand.
- **`/b/`:** a plain `/b/` hooked join is the recipient (`vezuyel boxar blahehal` *tells someone at the house*). After an extra-noun hook it is that hook's landmark: `al baoxar bledohol` is *in something on the table*.
- **`/h/`:** the join part is a bare restrictor (`al`, `am`, `ual`, `uam`, `ar`, `or`, `ur`, `er`), and a time landmark bounds which times the restrictor covers. Only hooks with a time reading take part:

| Hook | Times | Sketch | English |
|------|-------|--------|---------|
| `a` | within the landmark's span | `haxual blenulul` | *always, during the thunderstorm* |
| `o` | at that moment | `hoxar blenulul` | *at some point at the thunderstorm* |
| `u` | from that point on ([since](../grammar/hooks.md#since)) | `huxal blenulul` | *never since the thunderstorm* |
| `oe` | up to that point | `hoexual blenulul` | *always, until the thunderstorm* |
| `om` | around that moment (the frame of `o`) | `homxual blenulul` | *always, around the time of the thunderstorm* |

> `zawan vebal huxam blenulul.`
>
> z-listener | v-hear | [h-from-x-never.open | bl-thunderstorm]
>
> "You haven't listened since the thunderstorm, as far as I know."

> `zuzozen vowurel hoexual blenulul.`
>
> z-Uzozen | v-walk | [h-toward-x-always | bl-thunderstorm]
>
> "Uzozen always walked, until the thunderstorm."

> `zuzozen vezuyol homxual blenulul.`
>
> z-Uzozen | v-sing | [h-near-x-always | bl-thunderstorm]
>
> "Uzozen always sings around the time of the thunderstorm."

[`harum`](../grammar/dependents.md#time-poles) *until* places the event; `hoexual` bounds the *always*. A loose bound is often the honest one: *you always get like this at the holidays* is usually *around* them (`homxual`), and the listener can check it.

These time readings belong to the `/h/` hooked join only, where they bound a restrictor. A free hook on a time is still only `ul` *since*; the event's own time takes the [time poles](../grammar/dependents.md#time-poles). The other hooks stay unassigned on `/h/`: `uo` would repeat `a` (*throughout* is *within*), `am` (*in the thick of*) is close to `a`, `oem` (*in the run-up to*) overlaps [`habam`](../grammar/dependents.md#time-poles) *before*, and `ua`, `um`, `ao`, `e`, `ae`, `ue` and their frames have no time reading.

**Point back to a time.** Hook **-r** on `/h/` takes the latest **time landmark**: the `bl-` word of a time pole (`herem`, `habam`, `halam`, `harum`, `hevahum`), the landmark of an earlier `/h/` hooked join, or a `blarl` clause in either. It skips place landmarks, and with no time landmark in play it is not a sentence, as on any pointer.

> `zuzozen vowurel halam blenulul. zawan vebal hurxal.`
>
> z-Uzozen | v-walk | [h-after | bl-thunderstorm] . z-listener | v-hear | h-since.then-x-never
>
> "Uzozen walked after the thunderstorm. You haven't listened since then."

Every target is marked by structure, so the resolver needs no noun meanings. A free `ul` on a time (`ul benulul`) reads as *since* only because of the noun, so it is not a target.

- **Not on `/v/`, `/ɡ/`, `/x/`, `/th/`, `/w/`, or `/y/`.** An act is placed with a clause extra (`var` plus a hook). Adjectives, clauses, stances and calls have no set that a landmark could bound. A `/ɡ/` word with a join after the seam (`goxual`) is neither a hooked join nor a hook prefix, and has no reading.

## Why it helps

- **It shows the scope of a sweeping claim.** *Everyone at work hates me* and *everyone's against me* hide how far they reach. Here the speaker states the bound (`zoxual blovahal`, `zuexual bluwon`), and the join ending says whether exceptions are ruled out: `zuexual` (*every one of them, no exceptions*) and `zuexuam` (*as far as I know*) sound different. The listener can push back on the bound, or ask for the exception. A stereotype takes the same choice through `gaham`: `zual gaham blahaham` against `zuam gaham blahaham`.
- **It separates who counts from where it happens.** A domain is never mistaken for a location.
- **It types a question by relation.** `yol dexar bluwon` (*anything for me?*) and `yol zoxar blahehal` (*who's at the house?*) ask about a set the listener can check.
- **Time bounds for *never* and *always*.** *You never listen* becomes *you haven't listened since …* (`huxal`), and *you always did* becomes *always, until …* (`hoexual`), claims about a stretch the listener can check. A clause can name the stretch (`huxal blarl`). This gives retired `hweral` a tighter route ([routes](#routes-for-retired-kind-indefinites)).
- **One way to fuse a hook.** The hooked join is built like a hook prefix: hook vowels, **`x`**, then the rest. A learner who reads `guexavuvul` *anti-fighting* already knows where the hook is in `zuexual bluwon`.

## Routes for retired kind indefinites

Kind indefinites are already retired, and each job has a plain route. A hooked join gives a tighter route for three of them:

| Retired form | Job | Plain route | Hooked-join route |
|--------------|-----|-------------|-------------------|
| `zwuyual` | *everyone here* | `zual geyol` | `zomxual bluwon` |
| `zwayual` / `zwayuam` | *all people anywhere* / *people in general* | `zual` / `zuam`, `eyon` | `zoxual blual` / `zoxuam blual` |
| `hweral` | *never*, over a stretch the speaker can name | the holder seam, `hal thevumayan` | `huxal blarl` ([bounded by a clause](#bounded-by-a-clause)) |

## Spelling and parsing

- **The slot is unclaimed.** Role letter + vowel + **`x`** + vowel + ending used to be a role pointer; pointers now use role letter + **`w`** (`zwabar` is *the latest extra party*). `hook-prefixes.md` leaves this slot unclaimed too. The hooked join claims it, with hook stacks on the left and join stacks on the right.
- **Right of `x`:** the next letters decide.
  - A root (vowel, consonant, vowel, …): a hook prefix, `goxahehal`.
  - Vowels, then an ending letter, then the end of the word or **-x**: a hooked join, `zoxual`, `zoxarx`.
- **Left of `x`:** one hook vowel or one hook pair, as in a hook prefix, then optionally `m` or `r`. A vowel pair that is not a hook has no reading, as on a hook prefix. `l` or `n` before the seam has no reading.
- **Syllables:** **`x`** opens the join's syllable (`zo-xu-al`), as in any **`x`** compound. With `m` or `r`, that letter closes the hook's syllable (`zom-xu-al`, `zor-xu-al`). This is a new syllable-final consonant inside a word, beside the lexical join before `r`. The clusters `mx` and `rx` are already said at the end of a word (`zarx`), so the sound is not new.
- **Stacks:** a hook stack and a join stack can meet (`zuexuam`, `daoxar`). Each side follows the six-stack rule ([phonology](../grammar/phonology.md)).
- **Length:** `zoxual blahehal` is two words where `zual ol bahehal` is three, with the same number of syllables.
- **Sound-alikes:** `zorxar vowurel` (*someone there walks*) and `zorx ar vowurel` (*some people walk in there*) differ only by the word break, and [first-syllable stress](../grammar/phonology.md#rhythm-and-stress) marks it: `zorxar` takes one beat, and `zorx ar` a fresh one on `ar`. [Hook compounds](../grammar/hooks.md#hook-compounds) already rely on this (`vowurel ol` against `vowurelol`).
- **No seams:** a hooked join never sits after a `th` seam (holder, lateral). It isn't a person-naming word.
- **Morph gloss:** the hook's label from the [extra-noun grid](../grammar/hooks.md#extra-noun-intermediate) (the frame label on hook **-m**, the hook **-r** label on hook **-r**), then **`-x-`** as in a hook prefix gloss, then the join's label, then `.open` for join **-m**. The landmark rides in the bracket: `[z-at-x-everything | bl-house]`, `[z-near-x-everything.open | bl-speaker]`, `d-for-x-wh`, `h-from-x-never.open`, `z-there-x-everything`, `d-on.it-x-something`, `z-from.there-x-someone`. On `/h/`, hook **-r** on `u` is `since.then`.

## What changes

- **Grammar:**
  - [joins.md](../grammar/joins.md): a hooked-join section, its rows in the *every and none, by set* table, and the universals paragraph pointing to it as the way to bound a set by a landmark.
  - [questions.md](../grammar/questions.md): hooked-join blanks (`yol dexar bluwon`).
  - [restrictors.md](../grammar/restrictors.md): `/h/` hooked joins, with the time hooks including `om`, **`blarl`**, and point-back to a time.
  - [hooks.md](../grammar/hooks.md): place indefinites, a deixis note for `zomxual bluwon`, **`blarl`** beyond `ul`, and a compare-with between the hooked join and the hook prefix.
  - [compounds.md](../grammar/compounds.md#families-by-shape): in the family table, the row for vowels left of **`x`** splits by what is right of it: a root is a hook prefix, a join is a hooked join.
  - [relations.md](../grammar/relations.md): a compare line on `gobem` and `gaham` as set bounds.
  - [phonology.md](../grammar/phonology.md): `mx` and `rx` before the seam on a hooked join in the cluster list, and `zorxar` against `zorx ar` as an example in *rhythm and stress*.
  - [terminology.md](../grammar/terminology.md): add hooked join.
- **Design notes:**
  - `unassigned-reserved.md`: join **-n** and hook **-n** on a hooked join (`zoxuan`, `zonxual`), `l` before the seam, a join after the seam on `/ɡ/` and the other unlisted role letters, hook **-m** on `/h/` other than `om` (open), `/h/` with hooks that have no time reading (`ua`, `uo`, `ao`, `e`, `ae`, `ue`).
  - `design-decisions.md`: why in-clause readings are excluded, why `a` and `u` stay spatial (membership and origin are `gobem` and `gaham`), why time readings stay on the `/h/` hooked join and off free hooks, and why the hook comes first and its **-l** goes unwritten (the hook-prefix order).
  - `glosses.md`: the gloss row.
- **Code:**
  - A hooked-join rule for role letter + hook vowels + optional `m` / `r` + **`x`** + join, beside the hook-prefix rule, which it tells apart by what follows **`x`**.
  - Allow the `bl-` landmark (enforce, hosted rules), and **`blarl`** after an `/h/` hooked join.
  - Point-back resolution in `resolve.ts`, reusing the hook **-r** logic, with time landmarks only on `/h/`.
  - Update the morph gloss and gloss-inverse, `constructions.ts` reader notes, the LLM prompt, and the english-helper recipes.
  - Then run `npm run grammar-check`.

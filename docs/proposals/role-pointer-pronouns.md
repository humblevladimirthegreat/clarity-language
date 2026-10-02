# Proposal: whole-stem resume and role-pointer pronouns

**Status:** PROPOSED (not current language). Grammar today: content **-r** resumes the most recent word whose root matches either a **short** stem (cut through the 2nd vowel) or the **full** root ([pronouns](../grammar/pronouns.md#resume-r)). Role compounds resume an event with the same short cut (`zaxehaher`, [roles](../grammar/roles.md#role-compounds)).  
**Related:** [pronouns.md](../grammar/pronouns.md), [roles.md](../grammar/roles.md#role-compounds), [x-compounds.md](../grammar/x-compounds.md#families-by-shape), [spans.md](../grammar/spans.md#endings), [questions.md](../grammar/questions.md), [design-decisions.md](../meta/design-decisions.md) (D-03, D-13, D-17), `[src/parse/resolve.ts](../../src/parse/resolve.ts)`  
**Design authority:** none until absorbed.

## Summary

1. **Drop the short resume.** Content **-r** always spells the antecedent's **whole stem**, compounds included. The definite reading (*the dog*, the one you both know) and every **-r** table row stay.
2. **Add role pointers** for short, nearby reference: role letter + role-compound vowel(s) + `x` + a **pointer vowel** + **-r** (`zaxar`). This is a role compound whose event stem is replaced by a vowel that picks the event by position: the latest predicate with that role (forgiving for the core roles), the nearest one with *someone else* in that role, or this clause's own.

Both resolve mechanically. Tooling must be able to match every referent, and a human must be able to produce the form without tracking a sound-prefix list.

## Motivation

The short resume carries most of the cost of today's system:

- **Production load.** The speaker recalls the antecedent's root, cuts it at the 2nd vowel, and checks that cut against every recent word in every role before speaking (`eze` matches both *sleep* `ezeba` and *speechless* `ezebo`).
- **Unnatural listener memory.** The listener keeps recent words indexed by sound prefix. Natural languages track referents by role and salience, so learners get no transfer.
- **Collisions grow with the lexicon.** Matching ignores role, so a denser lexicon means more forced full-root fallbacks. The house-cast stem `aha` (*Ahaben*) already matches inclusive *we* `aha`.
- **Blurred readings.** A root ending at its 2nd vowel (`oze`) is the same short and full, so "points back" and "the one you both know" share a spelling with different conditions.
- **No short form anyway.** A resume has at least five letters, so the short cut saves little over the whole stem while adding the rules above.

The full-root layer carries most of the benefit: the definite reading (D-03), uniform **-r** across every role letter, cross-role recast, *do so / too / such / in that case*, and deterministic matching. This proposal keeps that layer and replaces the short layer with something short **and** easy to track.

Normal pronouns were considered and rejected as the replacement: they must split on some category (gender, animacy), and a single *it / they* gives up mechanical reference matching. See [Considered and rejected](#considered-and-rejected).

## Part 1: whole-stem resume



### Rule

Content **-r** = role letter for the slot now + the antecedent's **whole stem** + **-r**. It picks the **most recent** word with the identical stem. With no earlier match, it is the one you both already know (current full-root behavior).


| Antecedent         | Today (short)                        | Proposed                                       |
| ------------------ | ------------------------------------ | ---------------------------------------------- |
| `zazawan` *Azawan* | `zazar`                              | `zazawar`                                      |
| `zodogal` *a dog*  | `zodor`                              | `zodogar`                                      |
| `vezebal` *sleep*  | `vezer` (collides with *speechless*) | `vezebar`                                      |
| `oze` *scroll*     | `dozer`                              | `dozer` (unchanged: the root is already short) |




### Compounds match on the whole stem

A compound resumes only with its **entire** stem. Neither part alone matches it:

- `ebedalahaza` *bedroom* resumes as `debedalahazar`. `debedar` is *the bed* and never matches the bedroom.
- Hook compounds (`owogalal` *enter*, `owogalul` *leave*, and 18 more on `owoga`) differ only on the right. Matching only part of the stem would merge them all with plain *walk*.

This removes every built-in collision between a root and the compounds that contain it. The cost is length on compounds, which the role pointers below offset for nearby reference.

### What stays the same

- The definite reading of **-r** with no prior match ([pronouns](../grammar/pronouns.md#resume-r)).
- The same-role table (*do so*, *such*, *thus*, *in that case*, *likewise*) and cross-role recast (*do the same with him*, *of that kind*, *a blue one*), now always with whole stems ([pronouns](../grammar/pronouns.md#intermediate)).
- Associative **-rx**, collective **-rx** on `/v/` and `/ɡ/` ([plurality](../grammar/plurality.md)).
- Closed roots whose own **-r** is a meaning (`thovur`, `thamar`, the fault share) stay non-resumes.
- Span resume (`daxur`, `d[=]`), resume hooks (`ar` / `or` / `ur` / `er`), and backward stand-ins (`-rth`) do not use root prefixes and are unaffected.
- Thread return keeps its shape with the whole stem (`xazawar`).
- Role compounds keep resuming an event, now with the whole event stem (`zaxehaher` is already whole, since `ehahe` is the full root of *sit*).



## Part 2: role pointers



### Idea

A role compound on **-r** already names a participant of the latest event with a given stem: `zaxehaher` is the doer of the latest *sit*, `daexavadar` the tool of the latest *fight* ([roles](../grammar/roles.md#role-compounds)). A role pointer is the same word with the event stem replaced by a **pointer vowel** that picks the event by position instead of by stem. Role compounds and pointers share one vowel inventory and one meaning for it; only the way the event is found differs.

### Shape

```
ROLE-LETTER + ROLE-VOWEL(S) + x + POINTER-VOWEL + r (+ x)
```

- **ROLE-LETTER** is the slot the pointer fills **now**: `/z/`, `/d/`, or `/b/`.
- **ROLE-VOWEL(S)** is any role-compound vowel, single or stacked ([roles](../grammar/roles.md#role-compounds), [stacked](../grammar/roles.md#instrument)). It names which participant of the event you mean.
- **POINTER-VOWEL** picks the event (the **anchor**).
- **-x** is associative or group, exactly as on **-r** today ([plurality](../grammar/plurality.md)).



### The anchor: a predicate, not a clause

The anchor is a **predicate**: a clause's verb, or its `/ɡ/` word when the clause has no verb (*Azawan is big*). Verbs are what listeners already track ("the one who walked"), and a role vowel is defined relative to an event, so anchoring on the predicate keeps the role meaning exact.


| Pointer vowel | Anchor                                                                                                                   | English                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| `a`           | **same**: the latest predicate before this clause that has that role (core roles); the latest predicate (implicit roles) | *he / she / it / they*; *the one who just did it* |
| `o`           | **other** (core roles only): the nearest earlier predicate whose filler of that role is a different referent from the `a` reading | *the other one* |
| `e`           | **self**: this clause's predicate                                                                                        | *themself / itself*                               |


Pointer vowel `u` is left unused. After a single role vowel, vowel + `x` + `u` + **-r** is already a span resume ([spans](../grammar/spans.md#endings)), and keeping `u` out everywhere keeps the series the same across single and stacked role vowels.

**Why "other", not "the predicate before that".** In *Azawan walks. Alahen runs. Alahen sits. ___ sleeps.* "the predicate before that" lands on Alahen again. *The other one* is the job listeners need: the nearest earlier event with someone **else** in that role, here Azawan.

**`o` is for core roles only.** *The other one* compares referents, which tools can do only when both fillers are overt. Scene and result are often implicit, and the hook-paired roles are overt only when the hook is there, so `o` on them would be valid in some clauses and not others. Implicit roles take only `a` and `e`. For *the other tool* or *the other place*, use whole-stem **-r** or a role compound with its stem (`daexavadar`).

### Role vowels and where the filler comes from


| Role vowel | Participant           | Overt filler in the anchor's clause |
| ---------- | --------------------- | ----------------------------------- |
| `a`        | doer                  | `/z/`                               |
| `u`        | undergoer             | `/d/`                               |
| `o`        | extra party           | the predicate's own `/b/`: unhosted `/b/` after a verb, or the `/b/` a `/ɡ/` predicate hosts |
| `e`        | scene (place or time) | the `/b/` of a place hook (`al`, `am`, `aol`, `aom`, `ol`, `om`), if any |
| `ae`       | instrument            | `ael` + `/b/`                       |
| `oe`       | goal                  | `oel` + `/b/`                       |
| `ua`       | source                | `ual` + `/b/`                       |
| `uo`       | path                  | `uol` + `/b/`                       |
| `ao`       | result                | none needed                         |
| `ue`       | the one who pays      | `uel` + `/b/`                       |


`a` / `u` / `o` are **core** roles: the anchor is the latest predicate whose clause has that slot filled, so a clause without it is skipped ([forgiving lookup](#forgiving-lookup)). Every other role can be **implicit**: if the clause has the matching hook + `/b/`, the pointer is that `/b/`; otherwise it names the event's own instance of that participant, exactly as the role compound on **-r** does today (*Alahen sees what Azawan fought with*).

**The extra party is the predicate's own.** For a verb predicate it is the unhosted `/b/` right after the verb (*the one told*). For a `/ɡ/` predicate it is the `/b/` that word hosts: a relation's other party (`ganam balahen` *bound to Alahen*), as role-compound `o` already names it ([roles](../grammar/roles.md#the-extra-b-party-o)). A `/b/` hosted by any other hook in the clause is never the extra party; the stacked vowels and scene `e` cover those hooks.

**The scene takes a place hook's `/b/`.** If the anchor's clause has a place hook (`al` *in*, `am` *amid*, `aol` *on*, `aom` *over*, `ol` *at*, `om` *near*, [hooks](../grammar/hooks.md#extra-noun)), scene `e` is that hook's `/b/`; with several, the first. Otherwise it is the event's own place or time, as today. Time expressions stay implicit (see [open questions](#open-questions)).

### Cue

The role vowel keeps its role-compound cue. For the pointer vowel: **a** ≈ again (the same event), **o** ≈ other, **e** ≈ echo (this same clause).

### Examples (proposed forms)

Same subject again:

> `zazawan vowogal. zaxar vehahel.`
>
> z-Azawan | v-walk . z-←agent.same | v-sit
>
> "Azawan walks. They sit."

The last object as the new subject, a role switch with no name:

> `zazawan dalahen vahahal. zuxar varahal.`
>
> z-Azawan | d-Alahen | v-see . z-←patient.same | v-run
>
> "Azawan sees Alahen. Alahen runs."

The other one:

> `zazawan vowogal. zalahen varahal. zalahen vehahel. zaxor vezebal.`
>
> z-Azawan | v-walk . z-Alahen | v-run . z-Alahen | v-sit . z-←agent.other | v-sleep
>
> "Azawan walks. Alahen runs. Alahen sits. Azawan sleeps." (`zaxar` would be Alahen)

Reflexive:

> `zazawan vahahal daxer.`
>
> z-Azawan | v-see | d-←agent.self
>
> "Azawan sees themself."

An implicit participant with a stacked vowel:

> `zazawan vavadal. zalahen daexar vahahal.`
>
> z-Azawan | v-fight . z-Alahen | d-←instrument.same | v-see
>
> "Azawan fights. Alahen sees what Azawan fought with."

A relation's other party:

> `zazawan ganam balahen. zoxar varahal.`
>
> z-Azawan | [g-bond | b-Alahen] . z-←extra.same | v-run
>
> "Azawan is bound to Alahen. Alahen runs."

An overt scene:

> `zazawan vezebal al bahazal. zalahen dexar vahahal.`
>
> z-Azawan | v-sleep | [in | b-house] . z-Alahen | d-←scene.same | v-see
>
> "Azawan sleeps in a house. Alahen sees the house."

Associates, as on **-r** today:

> `zazawan vowogal. zaxarx vehahel.`
>
> z-Azawan | v-walk . z-←agent.same-x | v-sit
>
> "Azawan walks. Azawan and associates sit."

Reported speech. The content clause's predicate is its own anchor, so `a` reaches the outer *tell*:

> `zazawan balahen vezebel darl. zoxar varahal.`
>
> z-Azawan | b-Alahen | v-tell | d-that-clause . z-←extra.same | v-run
>
> "Azawan tells Alahen that Alahen runs."



### Forgiving lookup {#forgiving-lookup}

A core-role pointer skips back past predicates that lack that role:

> `zazawan dalahen vahahal. zazawan vowogal. zuxar varahal.`
>
> z-Azawan | d-Alahen | v-see . z-Azawan | v-walk . z-←patient.same | v-run
>
> "Azawan sees Alahen. Azawan walks. Alahen runs." (*walk* has no `/d/`, so `zuxar` reaches *see*)

The same holds across stand-in content, verbless clauses, and subjectless clauses, which would otherwise block `zaxar` constantly:

> `zazawan vezebel darl. verehel. zaxar vowogal.`
>
> z-Azawan | v-tell | d-that-clause . v-rain . z-←agent.same | v-walk
>
> "Azawan says that it rains. Azawan walks." (the content clause has no `/z/`)

So core pointers track **whoever last filled that slot**; implicit-role pointers track **the last event**. One sentence can therefore mix anchors: `zaxar` and `zuxar` side by side may come from different events. Teach the split as one line: *core roles follow the slot, the others follow the event.*

Strict lookup (latest predicate only; a missing core role is invalid) was rejected: it fails after every intransitive, weather, verbless, or subjectless clause, and after any stand-in content clause, since those count as anchors. It would push speakers back to whole-stem resumes for ordinary narrative.

### Resolution rules

These must be written down exactly so every tool agrees:

1. **Anchors.** Every clause body the parser emits contributes one anchor (its predicate), in order, including stand-in content and `/x/`-chained clauses. Span interiors (quotes, asides) do not. Event nouns (`davadal` *a fight*) are not anchors for pointers; a role compound with an explicit stem still matches them as today.
2. **Filler.** A filler is that slot's **referent** after resolving any **-r** or pointer in it. A resumed name and the name itself are the same referent. A joined slot (`zazawan zalahen zal`) is one filler, a group, and a pointer to it takes **-x**, as **-rx** does today.
3. **Same.** For a core role, `a` anchors on the latest predicate before the pointer's clause whose clause has that slot filled; predicates without it are skipped. For an implicit role, `a` anchors on the latest predicate, whatever it has. If no earlier predicate has the core slot filled, the pointer is invalid.
4. **Other.** `o` takes only the core role vowels `a` / `u` / `o`. It anchors on the nearest earlier predicate whose filler of that role is a different referent from the `a` reading. If there is none, the pointer is invalid.
5. **Extra party.** Role vowel `o` reads the anchor's own `/b/`: unhosted `/b/` for a verb predicate, the hosted `/b/` for a `/ɡ/` predicate. No other hosted `/b/` counts.
6. **Scene.** Role vowel `e` reads the `/b/` of the first place hook (`al`, `am`, `aol`, `aom`, `ol`, `om`) in the anchor's clause; with none, the event's own implicit place or time.
7. **Self.** `e` anchors on this clause's predicate; the filler may sit anywhere in the clause. A pointer that would point to its own slot (`zaxer` in `/z/`) is invalid.
8. **Coordinated verbs** in one clause share participants, so they count as one anchor.
9. **No match is an error.** Tools reject a pointer with no referent. They never guess.



### Where pointers sit

Pointers are nouns. They fill `/z/`, `/d/`, and `/b/`, including hosted `/b/` after a hook or relation (`em` + pointer is *their*), and the holder slot of the holder seam. Pointers on `/v/`, `/ɡ/`, `/h/`, `/w/` are left undefined, as role compounds are today ([unassigned-reserved](../meta/unassigned-reserved.md)). For *does so* and *such*, use whole-stem **-r**.

## Interactions to update on absorb


| Area                                                                                                                                                          | Change                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [pronouns.md](../grammar/pronouns.md)                                                                                                                         | Beginner: whole-stem **-r** only; pointers as the short pronoun. Remove the short / full split and the collision example. Reflexive moves to `daxer` (whole-stem `dazawar` stays valid).                                                              |
| D-17 *the former*                                                                                                                                             | No longer omitted: `zaxor` when the two were in the same role; whole stem otherwise. Update [design-decisions](../meta/design-decisions.md).                                                                                                          |
| D-13                                                                                                                                                          | Unchanged. Pointers are third-person only; *I* / *you* stay `amago` / `ehodo`, and names remain preferred.                                                                                                                                            |
| [roles.md](../grammar/roles.md#role-compounds)                                                                                                                | Role-compound **-r** uses the whole event stem. Add pointers as the stem-less member of the family (all ten role vowels), and add a row to [families by shape](../grammar/x-compounds.md#families-by-shape) (role vowel(s) `x` `a`/`e`/`o` + **-r**). |
| [questions.md](../grammar/questions.md)                                                                                                                       | The letter-count rule (resume ≥ 5, join **-r** < 5) still holds: whole-stem resumes and pointers are both ≥ 5. Reword the reason (no prefix copying).                                                                                                 |
| [intention.md](../grammar/intention.md)                                                                                                                       | *So can I* resumes the whole stem with the `x` vowel, not the short stem.                                                                                                                                                                             |
| [plurality.md](../grammar/plurality.md)                                                                                                                       | Note that **-x** on a pointer reads as on **-rx**: that one and associates, or the earlier group.                                                                                                                                                     |
| [introduction.md](../grammar/introduction.md)                                                                                                                 | Replace the line on pronouns copying a short start of the root.                                                                                                                                                                                       |
| [say-people-places.md](../grammar/say-people-places.md), [join-across-roles.md](../grammar/join-across-roles.md), [terminology.md](../grammar/terminology.md) | Respell short resumes; add terminology entries for *role pointer*.                                                                                                                                                                                    |
| Every grammar example with a short resume                                                                                                                     | Respell to the whole stem, or to a pointer where it reads better.                                                                                                                                                                                     |
| [glosses.md](../meta/glosses.md), [drill-generation.md](../meta/drill-generation.md), [parser-pipeline.md](../meta/parser-pipeline.md)                        | Drop short-stem gloss and drill rules; add a pointer gloss (`←agent.same`, `←patient.other`, `←extra.self`).                                                                                                                                          |




## Parser and tooling

- `[resolve.ts](../../src/parse/resolve.ts)`: `contentMatch` drops the `"letter"` case and matches only identical stems. `contentRoots` treats a compound as one stem rather than offering its left and right roots separately.
- New `x` family for pointers. Today `zaxar` / `zaxor` fall through to an ordinary compound of one-vowel "roots", which do not exist. Classify role vowel(s) + `x` + `a`/`e`/`o` + **-r** as a pointer. After a single vowel, the same shape on **-l** / **-m** / **-n** stays a span open; after a stacked vowel it is rejected.
- Pointer resolution needs a list of anchors (one predicate per clause body) with each one's role frame: fillers for `/z/` / `/d/`, the extra party (unhosted `/b/` of a verb, hosted `/b/` of a `/ɡ/` predicate), the first place-hook `/b/` for scene, and the hooks paired with stacked vowels (`ael`, `oel`, `ual`, `uol`, `uel`). The resolver already resolves role-compound **-r** against events by stem; pointers reuse that path with a lookup by position.
- Retie tooling (`src/retie/resume.ts`, `binds.ts`, the `shared-prefix` retie comment) no longer needs prefix cutting. A whole-stem resume respells exactly like its root.
- Lint: reject short resumes in docs once absorbed.



## Considered and rejected


| Option                                                                                                        | Why not                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep the short resume                                                                                         | Real-time prefix cutting and collision checks are the main cost; see Motivation.                                                                                                                                |
| Ordinary pronouns (*he / she / it*)                                                                           | Must pick a category, and gender conflicts with the project's aims. A single *it* gives up mechanical matching.                                                                                                 |
| Match a compound on its first part                                                                            | Merges a root with its compounds (*bed* / *bedroom*), and merges the 20 `owoga` hook compounds with *walk*.                                                                                                     |
| Pointer vowel = clauses back (last clause, the one before)                                                    | Deterministic but hard for people: counting clauses is not something listeners track.                                                                                                                           |
| Pointer vowel = predicates back (this verb, the last verb, the one before)                                    | Clearer than clauses, and kept for `a` / `e`. As the third vowel, "the one before" often lands on the same person again; *the other one* is the job people need.                                                |
| Strict lookup for `a` (latest predicate only)                                                                 | Breaks after any clause lacking the role, including stand-in content; see [forgiving lookup](#forgiving-lookup).                                                                                                |
| Pointer vowel = role-based referent tracking for every role (latest filler of that role, regardless of event) | Adopted for core roles via forgiving lookup, but not for the rest. Anchoring on the predicate lets stacked and implicit roles (instrument, result, scene) work, and makes pointers the stem-less role compound. |
| **-x** as group agreement on pointers                                                                         | Would give **-x** a second meaning; pointers keep the associative / group **-x** of **-rx**.                                                                                                                    |
| `o` on implicit roles (overt fillers only, or each event's own instance) | Overt-only is valid in some clauses and not others; each-event-instance turns *other* into *the one before* and counts the same place twice. |
| Role vowel `o` reaching any hosted `/b/` | Several fillers per clause, and overlaps the stacked vowels (`ae` already reads the `ael` `/b/`). |
| Role vowel `o` reaching only unhosted `/b/` | Leaves a `/ɡ/` relation's other party unreachable, unlike role-compound `o`. |
| Pointer vowel = named / kind                                                                                  | Grammatically visible, but two named people in the same role (the common story case) still collide.                                                                                                             |
| Pointer vowel = whose turn (yours / mine)                                                                     | Useful only in dialogue; no help in narration.                                                                                                                                                                  |
| Topic / non-topic pronouns                                                                                    | Needs a new topic marker and topic-reset rules.                                                                                                                                                                 |
| Referent tags assigned at introduction                                                                        | Deterministic and short, but the speaker must plan tags in advance. Could return later as an optional tool for stories with many characters.                                                                    |
| `-rth` on pointers (*what that one said*)                                                                     | A possible fit for multi-party claims, but not needed now.                                                                                                                                                      |
| Bare word-final `-th` on pointers                                                                             | Illegal coda today ([phonotactics](../grammar/phonology.md#phonotactics)); no meaning to inherit.                                                                                                               |




## Open questions

1. **Reach limit.** Forgiving lookup is unbounded. If silent long-distance matches confuse listeners in practice, stop the search at a turn change or paragraph break, or after two or three predicates. ANSWER: unbounded for now
2. **Turns.** Do other speakers' clauses contribute anchors? The proposal says yes (every clause in order). A dialogue-heavy page might want the opposite. ANSWER:YES
3. **Scene and time.** Scene `e` reads place hooks only. Should a time expression (an `/h/` time word with its `/b/`, such as `huwem banadal` *at night*) also count as the scene's overt filler, and which forms count?
4. **Comparatives.** Under rule 5, a `/ɡ/` predicate's hosted `/b/` is the extra party, which would include a comparison standard (*bigger than Alahen*). Check [comparatives](../grammar/comparatives.md) that this `/b/` is hosted by the `/ɡ/` predicate and not by a join or comparison word, and whether reaching it is wanted.

## Non-goals

- Changing the definite reading of **-r**, span resume, resume hooks, or `-rth`.
- Pointers for *I* / *you* / inclusive *we*.
- Pointers on `/v/`, `/ɡ/`, `/h/`, `/w/`.
- Teaching any of this on grammar pages while it stays a proposal.


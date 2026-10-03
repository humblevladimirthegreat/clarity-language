# Proposal: role-pointer endings and the unsaid pointer

**Status:** PROPOSED (not current language). Today a [role pointer](../grammar/pronouns.md#role-pointers) ends only in **-r**, names a participant (`zaxar` *whoever did the latest thing*), and needs a participant who was actually named. Three things have no short form:

- a new thing of the same kind as a participant (English *one* in *Alahen saw one too*)
- one participant's part in an event, apart from the participant (*what they did*)
- a participant the event left unsaid (*whoever did it*)

**Related:** [pronouns.md](../grammar/pronouns.md#role-pointers), [roles.md](../grammar/roles.md#role-pointers-family), [stacked pointers](../grammar/roles.md#stacked-pointers), [word-endings.md](../grammar/word-endings.md), [spans.md](../grammar/spans.md#loans), [dependents.md](../grammar/dependents.md#stand-in-back), [x-compounds.md](../grammar/x-compounds.md#families-by-shape), [design-decisions.md](../meta/design-decisions.md)  
**Design authority:** none until absorbed.

## Overview

The pointer shape keeps its role vowel (which part) and pointer vowel (which event). The proposal adds two endings and one pointer vowel.

| Ending | Names | `/z/` + doer + latest |
|--------|-------|-----------------------|
| **-r** (today) | the participant | `zaxar` *they* (whoever did it) |
| **-l** (proposed) | a **new one** of the same kind as the participant | `zaxal` *one* / *another one* |
| **-m** (proposed) | the participant's **part** in the event | `zaxam` *what they did* |
| **-n** | not a pointer: stays the ordinary proper-name ending | |

| Pointer vowel | Picks | Cue |
|---------------|-------|-----|
| **`a`** (today) | the latest event with that role filled | again |
| **`e`** (today) | this sentence's own event | echo |
| **`o`** (today, widened) | the nearest earlier event with a **different** filler in that role; now also on stacked role vowels | other |
| **`u`** (proposed) | the latest event that left that role **unsaid** | unsaid |

The **-l**, **-m**, and **`u`** words now parse only as vowel-letter compounds, and nothing uses them, so the change needs no new root, overlay, or letter.

**Sense follows the referent.** On a pointer, **-l** and **-m** pick what is named (a new one, or a part), not concrete versus abstract. The sense is whatever the earlier filler had. After an abstract filler, **-l** is a new one in that abstract sense. After a concrete filler, **-m** is that concrete participant's part.

## `-l`: a new one {#new-one}

### Motivation

- **English *one*.** *Azawan saw a cookie. Alahen saw **one** too.* The second cookie is a different cookie, so **-r** (the same one) is wrong, and today the only way to say it is to spell the stem again. That costs the most when the filler was long: a compound, a role compound, a joined list, or a span.
- **A first mention.** **-l** is the first-mention ending ([concrete **-l**](../grammar/word-endings.md#concrete-l)): a new thing coming into the talk. The pointer part says what kind it is, without spelling the stem.
- **The same one versus a new one.** **-r** and **-l** differ only in the ending, so the speaker always says whether this is the same thing or another of its kind. English *one* / *it* sometimes leave that unclear.
- **It survives a question.** Today's *one* recipe ([pronouns](../grammar/pronouns.md#cross-role-recast), *a blue one*) is `dar` plus a `/ɡ/` resume of the kind. `dar` is a join **-r**, and under `yol` / `yom` a join **-r** is the fill-ask blank, so *Does Alahen see a blue one?* comes out as *Which blue dog-kind thing does Alahen see?*. The pointer is a content word, so it stays an ordinary noun in any speech act. It is also shorter.

### Shape

```text
{z|d|b}{ROLE VOWEL(S)}x{POINTER VOWEL}l
```

The role vowel and pointer vowel find the anchor and the earlier filler exactly as **-r** does. **-l** then names a **new** thing of that filler's kind, in the filler's sense. It is never the earlier filler itself (for that, use **-r**).

| Role vowel | `-r` (today) | `-l` (proposed) |
|------------|--------------|-----------------|
| **`a`** doer | `zaxar` whoever did it | `zaxal` another one like the doer (*another teacher*) |
| **`u`** undergoer | `zuxar` whatever it happened to | `zuxal` another one like that (*one* in *saw one too*) |
| **`o`** extra party | `zoxar` whoever was told | `zoxal` another one like the one told |
| **`e`** scene | `zexar` that place or time | `zexal` another place like that (*another house*) |

Stacked role vowels work the same way: `daexal` *another tool like that one*, `doexal` *another place like where it headed*.

### Pointer vowels

| Pointer vowel | With `-l` |
|---------------|-----------|
| **`a`** | a new one like the filler in the latest event with that role filled |
| **`e`** | a new one like this sentence's own filler for that role: *trade a cookie for **another***. As with **-r**, a word never points at its own slot |
| **`o`** | a new one like the **other** filler: the nearest earlier event with a different filler. On every role vowel except the scene, stacked vowels included |
| **`u`** | no reading: an unsaid filler has no kind to copy |

### Which kind

**Head only.** **-l** copies the earlier filler's stem, never the `/ɡ/` words that described it. After `dodogal geredal` *a red dog*, `duxal` is *a dog*, and `duxal gubuhel` is *a blue one*. This matches English *one*, which stands for the noun and leaves the adjectives to be said again (*a red dog … a blue one*). If **-l** copied the adjectives, *a blue one* would have to read as a red and blue dog, and there would be no way to drop the old property. To keep a property, say it again (`duxal geredal` *another red one*).

- **An ordinary noun:** its stem, in its sense. After `dugugol` *a cookie*, `duxal` is *a cookie* (another one). After `azawam` *grace*, `duxal` is another grace, in the abstract sense.
- **A role compound or compound:** the whole stem. After `zaxedehol` *a teacher*, `zaxal` is *another teacher*.
- **A joined filler:** a new group of the same make-up. After *a cookie and a knife*, `duxal` is another cookie and another knife. A name in the list is copied like any other member (see the next line).
- **A span:** another one of what the span holds. After the opaque `d<Big Mac>`, `duxal` is *another Big Mac*. After a cite, it is another quote with the same words.
- **A name (-n), or a span with `@`:** a new thing the name applies to, the same as writing [**-ln**](../grammar/word-endings.md#name-instance--ln) or `^@`. After the product `d@<Big Mac>`, `duxal` is *a Big Mac*; after a person `zazawan`, it is someone else named Azawan.
- **One of a name (-ln), or a span with `^@`:** another thing the name applies to. After `d^@<Big Mac>`, `duxal` is *another Big Mac*.
- **A pronoun or pointer:** use what it points to.
- **A special pronoun** (`amago`, `ehodo`, `aha`, `una`, `oben`): no reading.

### Example

Sketch only; check with `node scripts/parse.mjs` once the parser supports it.

> `zazawan dugugol vahahal. zalahen duxal vahahal.`
>
> z-Azawan | d-cookie | v-see . z-Alahen | d-←patient.same.new | v-see
>
> "Azawan sees a cookie. Alahen sees one too." (a different cookie; `duxar` would be the same cookie)

> `zazawan dodogal geredal vahahal. zalahen duxal gubuhel vahahal.`
>
> z-Azawan | [d-dog | g-red] | v-see . z-Alahen | [d-←patient.same.new | g-blue] | v-see
>
> "Azawan sees a red dog. Alahen sees a blue one."

> `zazawan dodogal geredal vahahal. yol zalahen duxal gubuhel vahahal.`
>
> z-Azawan | [d-dog | g-red] | v-see . y-question | z-Alahen | [d-←patient.same.new | g-blue] | v-see
>
> "Azawan sees a red dog. Does Alahen see a blue one?" (yes/no: the pointer is not a blank)

## `-m`: share {#share}

### Motivation

- **Separate the act from the person.** English *that was cruel* and *they were cruel* drift together. When the short words for "what they did" and "them" differ only in the ending, the speaker has to pick one, and a reader can see which was picked. This supports the compassion aim: you can criticize behavior without making it about who someone is.
- **Name each party's part.** In *Azawan punched Alahen*, the whole event is one thing, Azawan's part (the punching) is another, and Alahen's part (being punched) is a third. A resumed event noun names only the whole event. Talking about responsibility, credit, or harm needs the parts.
- **Credit the circumstances.** With the scene vowel, the same form names what the setting contributed. People tend to blame the person and overlook the situation (the fundamental attribution error). Having a word for each makes both sides easy to say.
- **The ending fits.** **-m** is the abstract ending ([abstract **-m**](../grammar/word-endings.md#abstract-m)). A participant's part is something you cannot point at, sitting on the participant that **-r** names.

### Shape

```text
{z|d|b}{ROLE VOWEL(S)}x{POINTER VOWEL}m
```

Same as a role pointer, but with **-m** in place of **-r**. The role vowel and pointer vowel find the anchor and the participant exactly as a role pointer does ([parser-pipeline](../meta/parser-pipeline.md), D-19). **-m** then names that participant's **part in that event**, not the participant.

| Role vowel | `-r` (today) | `-m` (proposed) |
|------------|--------------|-----------------|
| **`a`** doer | `zaxar` whoever did it | `zaxam` what they did (their doing) |
| **`u`** undergoer | `zuxar` whoever it happened to | `zuxam` what it was for them (their undergoing) |
| **`o`** extra party | `zoxar` whoever was told or given | `zoxam` what reached them (their receiving) |
| **`e`** scene | `zexar` that place or time | `zexam` what the setting contributed (the circumstances: the storm, the crowded room) |

#### Stacked role vowels

Stacked vowels work the same way, with the same rule that a matching hook's `/b/` wins ([stacked pointers](../grammar/roles.md#stacked-pointers)):

| `-r` (today) | `-m` (proposed) |
|--------------|-----------------|
| `daexar` the tool | `daexam` what the tool did (its part) |
| `doexar` where it headed | `doexam` what the goal contributed |
| `duaxar` where it came out of | `duaxam` what the source contributed |
| `duoxar` the way it went | `duoxam` what the route contributed |
| `daoxar` what it made | `daoxam` what came of it, the making |
| `zuexar` the one who paid | `zuexam` the cost they bore |

`zuexam` is the most useful of these: it names the cost to one person directly, as distinct from the event (*the theft*) and from the person (*the victim*).

### Pointer vowels

| Pointer vowel | With `-m` |
|---------------|-----------|
| **`a`** | the part played in the latest event with that role filled (as for **-r**) |
| **`o`** | the other one's part: the nearest earlier event with a different filler in that role. On every role vowel except the scene, stacked vowels included. Use: comparing two people's actions (*what the other one did was worse*), or two costs (`zuexom` *the other one's cost*) |
| **`u`** | the unsaid participant's part: *whatever was done, by whoever* ([below](#unsaid)) |
| **`e`** | **not used.** **-r** **`e`** works because the referent is a person in this sentence (*themself*). With **-m**, it would name a part in the very event being described (*Azawan sees Azawan's own seeing*), which has no use. The parser rejects it |

### Examples

Sketch only; check every form with `node scripts/parse.mjs` once the parser supports it.

> `zazawan dalahen vabahel. zaxar genehem.`
>
> z-Azawan | d-Alahen | v-punch . z-←agent.same | g-harm
>
> "Azawan punches Alahen. They are harmful." (today: a claim about Azawan)

> `zazawan dalahen vabahel. zaxam genehem.`
>
> z-Azawan | d-Alahen | v-punch . z-←agent.same.part | g-harm
>
> "Azawan punches Alahen. What they did is harmful." (proposed: a claim about the punch as Azawan's act)

The second sentence says nothing about Azawan as a person. To say Azawan is harmful, write `zaxar`.

### Role compounds with a stem keep their abstract sense

On a role compound with a stem (`zaxabahem`), **-m** stays the abstract sense of that compound. A newly built compound has no other way to tell its concrete sense from its abstract one, so **-m** can't also mean the share there. The share is the stemless pointer only. To name the part one participant played in a particular named event, resume the event and use the pointer: `zaxam` after the event.

## Pointer vowel `u`: the unsaid participant {#unsaid}

### Motivation

- **Talk about responsibility without guessing.** *The cookie got eaten. **Whoever did it** ran.* Today `zaxar` skips an event with no doer, so it can't reach the unknown eater, and naming anyone would be a guess. `zaxur` refers to whoever filled the role without saying who. This is the same restraint as `una` *someone*, tied to a known event.
- **Pairs with the share.** `zaxum` *whatever was done, by whoever* lets a speaker talk about an act when nobody knows who did it, without inventing someone to do it.
- **Mechanical.** The referent is the empty role of a known event, so a tool can still find the anchor from the words alone.

### Lookup

**`u`** picks the latest event that has **nobody stated** in that role: the counterpart of **`a`**, which skips those events. The referent is whoever filled that role in reality. No verb is skipped: after a verb that has no doer, such as *it rains*, `zaxur` still points at that event. Whether the sentence makes sense is up to the speaker, and a tool reads the anchor from the words alone.

| Ending | With **`u`** | Example |
|--------|--------------|---------|
| **-r** | whoever it was | `zaxur` *whoever did it*; `zexur` *wherever it happened*; `daexur` *whatever it was done with* |
| **-m** | the unsaid participant's part | `zaxum` *what was done, by whoever* |
| **-l** | no reading (an unsaid filler has no kind) | |

**`u`** goes on every role vowel, stacked vowels included.

**`u`** says the filler is unknown, and that holds even for the scene. `zexar` is *where it happened*, a known place or the event's own place and time. `zexur` is *wherever it happened*: it stresses that nobody has said where.

### Example

Sketch only; check with `node scripts/parse.mjs` once the parser supports it.

> `dugugol vahahal. zaxur varahal.`
>
> d-cookie | v-see . z-←agent.unsaid | v-run
>
> "The cookie is seen. Whoever saw it runs."

Once used, `zaxur` fills a role like any noun, so a later `zaxar` can reach it (*they*, still unnamed).

## Pointer vowel `o` on stacked role vowels (all endings)

D-19 limits **`o`** to the doer, undergoer, and extra party, because other roles are often left unsaid and could not be compared. The proposal lifts that limit for stacked role vowels on **-r**, **-l**, and **-m** with one rule: **only an overt filler counts.** A stacked role counts as filled only when the clause has the matching hook with its `/b/`. Events whose tool, goal, and so on are left unsaid are skipped, as **`a`** skips events with nobody in the role. So `daexor` is *the other tool*: the nearest earlier event whose overt tool is a different referent.

The scene stays out (`zexor`, `zexol`, `zexom` are rejected). This proposal does not reopen the scene's overt-filler rule.

## Boundaries with existing forms

| Form | Names | Example |
|------|-------|---------|
| Event noun, resumed with **-r** | the whole event, all participants together | *that punch* |
| Back stand-in **`darth`** ([dependents](../grammar/dependents.md#stand-in-back)) | the last statement as content | *Alahen doubts that* |
| Role pointer **-r** | the participant | *they* (Azawan) |
| Role pointer **`u`** (proposed) | the participant the event left unsaid | *whoever did it* |
| `una` ([special pronouns](../grammar/pronouns.md#special-pronouns)) | someone, tied to no event | *someone* |
| Whole-stem **-l** (first mention again) | a new one, with the stem spelled out | *a cookie* |
| Role pointer **-l** (proposed) | a new one of the participant's kind, without the stem | *one* / *another one* |
| `dar` + `/ɡ/` resume of the kind ([pronouns](../grammar/pronouns.md#cross-role-recast)) | something of that kind, for a noun no pointer reaches; a fill-ask blank under a question | *one* (statements only) |
| Role pointer **-m** (proposed) | one participant's part in the event | *what Azawan did* |
| Role compound **-m** with a stem | the compound's abstract sense | |

**-l** and the whole stem say the same thing; the pointer only saves spelling the stem again. In an event with only one participant, `zaxam` and the resumed event noun come close in meaning. The difference stays in what the speaker is talking about: the event, or one person's part in it.

## Interactions

- **Lookup:** **-l** and **-m** find their anchor exactly as the matching **-r** pointer does, including the D-19 limits as amended here. **`u`** looks for the latest event with that role unsaid. No anchor means no sentence.
- **Slots:** `/z/`, `/d/`, `/b/` only, as for pointers (D-24). A share is an abstract thing, so it does not fill a holder seam. A new one or an unsaid pointer fills a holder seam only if a first-mention noun could.
- **Anchors and later pointers:** a share is not itself an anchor, the same as event nouns (D-19). A new one or an unsaid pointer fills its role like any noun, so later **-r** pointers reach it.
- **Associative -x:** none on a share (a part is not a group of people; `zaxamx` has no reading). On a new one, number follows whatever a first-mention noun of that kind takes ([plurality](../grammar/plurality.md)).
- **Glossing** ([glosses](../meta/glosses.md)): add `.new` or `.part` to the pointer gloss, and use `unsaid` for pointer vowel **`u`**. `duxal` → `d-←patient.same.new`, `zaxam` → `z-←agent.same.part`, `zoxom` → `z-←recipient.other.part`, `zaxur` → `z-←agent.unsaid`, `zaxum` → `z-←agent.unsaid.part`.

## Absorption checklist

- [pronouns.md](../grammar/pronouns.md#cross-role-recast), the *a blue one* recipe: lead with the pointer (`duxal gubuhel`). Keep `dar` + `/ɡ/` resume only for a noun that no pointer reaches (a topic, a noun inside a cite, a hook landmark with no role vowel), with a **Compare with** that under a question `dar` is the fill-ask blank (*which one?*), so a yes/no question uses the pointer or spells the noun again.
- [pronouns.md](../grammar/pronouns.md#role-pointers): new subsections after *The other one*: *whoever it was* (**`u`**), *a new one* (**-l**, with a **Compare with** against **-r** *the same one*), then *share* (**-m**, with a **Compare with** against the resumed event noun and `zaxar`). Add `una` to the **Compare with** for **`u`**.
- [roles.md](../grammar/roles.md#stacked-pointers): **-l** and **-m** columns in the stacked-pointer table; allow **`o`** and **`u`** there, and drop the line that rules out *the other one*.
- [x-compounds.md](../grammar/x-compounds.md#families-by-shape): widen the role-pointer row and the decision order to **-r** / **-l** / **-m** and pointer vowels **`a`** / **`e`** / **`o`** / **`u`**. Note that **-m** on a role compound with a stem is its abstract sense.
- [word-endings.md](../grammar/word-endings.md): **Compare with** lines under concrete **-l** and abstract **-m**, if those sections name their other uses.
- [spans.md](../grammar/spans.md#loans): one line that **-l** on a span filler is another of what the span holds.
- [design-decisions.md](../meta/design-decisions.md): amend D-19 (**`o`** on stacked roles with an overt filler; **`u`** lookup) and D-24 (the new endings). Record that **-l** copies the head stem only, not the filler's `/ɡ/` words. Settle the rejected cells: **-l** on a special pronoun; **-l** with **`u`**; **-m** with **`e`**; **`o`** on the scene; **-x** on a share.
- [unassigned-reserved.md](../meta/unassigned-reserved.md): drop the **-l** / **-m** cells and the **`u`** + **-r** row ("pointer vowel **`u`**: not a pointer") from the vowel-letter compound silhouettes.
- [glosses.md](../meta/glosses.md): the `.new`, `.part`, and `unsaid` glosses.
- Parser, in the same change as the grammar edit:
  - read `{z|d|b}` + role vowel(s) + **`x`** + pointer vowel + **-l** as a new one (**`a`** / **`e`** / **`o`**)
  - read **-m** as a share (**`a`** / **`o`** / **`u`**)
  - read **-r** with **`u`** as the unsaid pointer
  - allow **`o`** on stacked roles, counting only overt fillers
- Translation checkpoints at Beginner in pronouns ([translation-exercises](../meta/translation-exercises.md)).

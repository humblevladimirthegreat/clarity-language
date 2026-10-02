# Proposal: topic pronoun

**Status:** PROPOSED (not current language). Expected to fold into a broader proposal on topics. Grammar today: a referent is picked up with content **-r** ([pronouns](../grammar/pronouns.md#resume-r)); *as for X* is **`hahehom`** + `/b/` for one sentence ([say-people-places](../grammar/say-people-places.md#as-for)); *going back to X* is continue `/x/` + resume ([thread return](../grammar/pronouns.md#going-back-to-a-thread)). There is no pronoun that stays fixed to one referent across roles.  
**Related:** `role-pointer-pronouns.md` (role pointers and whole-stem resume), `ordinal-pronouns.md` (stable pronouns by order of introduction), [pronouns.md](../grammar/pronouns.md), [say-people-places.md](../grammar/say-people-places.md#as-for), [hooks.md](../grammar/hooks.md#hook-resume), [dependents.md](../grammar/dependents.md#sentence-linkers), [`data/lexicon-overlays.csv`](../../data/lexicon-overlays.csv)  
**Design authority:** none until absorbed.

## Motivation

The role pointers in `role-pointer-pronouns.md` name a **slot**: whoever last filled `/z/`, `/d/`, or `/b/`. The same person therefore changes pronoun as they change role: Azawan is `zaxar` after being a subject and `zuxar` after being an object. That suits *the one who did that*, but not the main character of a story, who is referred to most often and in every role.

A **topic pronoun** fixes one referent, the current topic, to one pronoun in every role. Only the role letter changes. This is how proximate marking works in Algonquian languages: one referent stays proximate across clauses whatever its grammatical role, and everyone else is the other one.

For tooling, the topic must never be inferred from salience. It is set by a default and changed only by overt forms, so every tool computes the same topic at every point.

## Proposed shape

The topic pronoun is the published root **`aheho`** (#️⃣ *hash*, abstract *topic*) with **-n**, the same way *speaker* and *listener* are overlays on **`amago`** and **`ehodo`** ([special pronouns](../grammar/pronouns.md#special-pronouns)):

| Form | Meaning | English |
|------|---------|---------|
| `zahehon` / `dahehon` / `bahehon` | the current topic, in the slot it fills now | *he / she / it / they* (the main one) |
| `…ahehonx` | the topic and associates | *they* (that one and associates) |

The cue is the existing one: a hashtag marks what the post is about. The overlay attaches to the published row, as new overlays must ([overlay kinds](../meta/parser-pipeline.md#overlay-kinds)).

**Length.** At seven letters it is no shorter than a name. The gain is stability (the same word in every role, never a collision), not brevity. If brevity matters, see [open questions](#open-questions).

## Which referent is the topic

1. **Default.** At the start of a conversation there is no topic. The first named referent (`-n` or `-nx`) to fill `/z/` becomes the topic.
2. **Set by *as for*.** `hahehom` + `/b/` X makes X the topic, from that sentence on. Today *as for* is scoped to one sentence; this proposal makes the topic persist after it.
3. **Set by thread return.** `/x/` + whole-stem resume (`xazawar`, *going back to Azawan*) makes that referent the topic. Today thread return only points the listener at a thread; this proposal gives it a lasting effect.
4. **The topic persists** until rule 2 or 3 changes it. Being mentioned, even as subject, never changes it on its own.
5. **No topic, no pronoun.** Using `ahehon` before any topic exists is invalid.

Each rule refers to overt forms, so the topic at every point is computed mechanically.

### Examples (proposed forms)

The topic stays fixed across roles:

> `zazawan dalahen vahahal. zalahen dahehon vezebel. zahehon varahal.`
>
> z-Azawan | d-Alahen | v-see . z-Alahen | d-topic | v-tell . z-topic | v-run
>
> "Azawan sees Alahen. Alahen tells Azawan. Azawan runs."

Changing the topic with *as for*:

> `hahehom balahen zazawan vowogal. zahehon vehahel.`
>
> [h-topic | b-Alahen] | z-Azawan | v-walk . z-topic | v-sit
>
> "As for Alahen, Azawan walks. Alahen sits."

## The other one

Option: a second closed pronoun for **the most recent named referent that is not the topic**. It is less stable than the topic pronoun: it shifts as other people come and go.

Role pointers already give *the other one* within a role (`zaxor`). A non-topic pronoun would add *the other one* across roles. Whether that earns a second closed form is left to the topics expansion. If adopted, it follows the same rules: named referents only, whole-stem resume for things, invalid with no match.

## Interactions

| Area | Effect |
|------|--------|
| Role pointers (`role-pointer-pronouns.md`) | Unchanged. Pointers name slots and event participants; the topic pronoun names one referent. A pointer may resolve to the topic; the two never conflict. |
| Whole-stem **-r** | Unchanged. Use it for any non-topic referent, and to point at the topic by name. |
| Reflexive | The topic pronoun works in any slot, so *Azawan sees themself* with Azawan as topic can be `zazawan vahahal dahehon.`; `daxer` still works. |
| *As for* (`hahehom`) | Gains a lasting effect. On absorb, update [say-people-places](../grammar/say-people-places.md#as-for). |
| Thread return (`xazawar`) | Gains a lasting effect. The rule "drop it and the claim is unchanged" still holds for the sentence it opens. |
| `xavazem` *by the way* / `or …` *anyway* | Open: does a side topic suspend the topic and `or …` restore it? See below. |
| D-13 (long *I* / *you*) | Unchanged. The topic pronoun is third person. The speaker can be the topic only by name. |
| Ordinary `aheho` | `ahehol` *hash* and `ahehom` *topic* keep their senses; `hahehom` keeps its *as for* job. Only **-n** is overlaid. |

## Parser and tooling

- Overlay row for `aheho` **-n** in [`lexicon-overlays.csv`](../../data/lexicon-overlays.csv), taught on the pronouns page.
- The resolver tracks one topic value through the discourse: set by the default, by `hahehom` + `/b/`, and by `/x/` + whole-stem **-r**. A topic pronoun binds to it, or is rejected when it is unset.
- Morph gloss: `topic` (the same gloss `hahehom` already uses on its own root, so the gloss for `hahehom` may need to become *as-for* to avoid confusion).

## Open questions

1. **Brevity.** Keep the seven-letter `aheho` overlay, or spend a short closed root (five-letter word) so the most frequent pronoun is also the shortest?
2. **Turns.** Does the topic persist across speakers, or does each speaker carry their own?
3. **Side topics.** Should `xavazem` *by the way* suspend the topic, and `or …` *anyway* restore it? That would tie the referent topic to the existing discourse-thread forms.
4. **Unnamed topics.** Should a kind (`zodogal` *a dog*) be able to become the topic through rules 2 and 3? Rule 1 is limited to names so that incidental things never take the topic by default.
5. **Default rule.** First named `/z/`, or no default at all (the topic exists only once *as for* or thread return sets it)?
6. **The other one.** Adopt a non-topic pronoun, or leave *the other one* to role pointers and whole-stem resume?

## Non-goals

- Inferring the topic from salience, frequency, or position.
- Changing role pointers or whole-stem resume.
- First- and second-person pronouns.
- Teaching any of this on grammar pages while it stays a proposal.

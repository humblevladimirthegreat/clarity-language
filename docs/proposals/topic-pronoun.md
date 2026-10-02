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

## Topics more broadly: `/x/` as the topic slot

The rules above use three setters from three places: a default on `/z/`, *as for* on `/h/`, and thread return on `/x/`. A simpler alternative: **every topic change is an `/x/` word.** `/x/` already sits between clauses and carries discourse structure (linkers, agenda labels, numbered points, thread return), so the topic becomes one more thing that only `/x/` changes.

### What counts as a topic change

Not every `/x/` word. If clause joins (`xal` *and*) or *therefore* changed the topic, it would reset in the middle of every chain. Only `/x/` words that **name a referent or open a new frame** count:

| `/x/` form today | Today | Topic effect under this variant |
|------------------|-------|---------------------------------|
| root + **-n** (`xazawan`) | titled agenda label: *let's now talk about Azawan* | **Introduce**: sets the topic |
| whole-stem **-r** with a noun antecedent (`xazawar`) | thread return: *going back to Azawan* | **Return**: sets the topic |
| **-r** with an `/x/` antecedent | same linker again (*likewise*) | none |
| `xevavem` *next* | moves to the next frame; opens a new topic | **Clear**: no topic until the default rule fires again |
| `xavazem` *by the way* | opens a side topic | **Push**: suspends the topic (see [side topics](#side-topics-as-a-stack)) |
| other linkers (`xodum`, `xezom`, `xagagam`, `xagezam`) | glue to the last claim | none |
| clause joins (`xal`, `xan`, …) | join clauses | none |
| numbered points (`x#N`), label cites (`x_…`), *Finally* / *Starting with* | agenda structure | none on their own; **-n** on a point (titled item) introduces it. Outline depth: see [side topics](#side-topics-as-a-stack) |

The resolver decides the **-r** row by the antecedent's role letter, so the split stays mechanical.

**Introduce vs return** mirrors the rest of the language: **-n** names, **-r** picks up. A speaker opens a new topic with the name and comes back to an old one with the resume.

### Consequences

1. ***As for* stays sentence-scoped.** Rule 2 is dropped. `hahehom` + `/b/` keeps today's meaning: a frame for this sentence only. Scope then follows the role letter: `/h/` sits inside one clause and cannot outlive it; `/x/` sits between clauses and persists. English *as for X* splits into two jobs that English blurs: *in this sentence, regarding X* (`hahehom bazawan`) and *now, about X* (`xazawan`). The *as for* example above becomes:

   > `xalahen zazawan vowogal. zahehon vehahel.`
   >
   > x-Alahen | z-Azawan | v-walk . z-topic | v-sit
   >
   > "Now, about Alahen: Azawan walks. Alahen sits."

   while `hahehom balahen zazawan vowogal. zahehon vehahel.` would leave the topic where it was (Azawan, by the default rule).

2. **Thread return gains a lasting effect.** [Going back to a thread](../grammar/pronouns.md#going-back-to-a-thread) says it names someone *without making the next sentence about them*. That changes: dropping `xazawar` still leaves the claim unchanged, but it changes what every later topic pronoun picks up. Thread return becomes claim-neutral but discourse-active.

3. **The topic pronoun is a pointer to the `/x/` slot.** Role pointers name *whoever last filled `/z/`* (or `/d/`, `/b/`). Under this variant the topic is *whatever the last topic-setting `/x/` word named*, plus the default. That is the same kind of lookup, on a different slot, so the topic pronoun can be taught as the `/x/` member of the pointer idea rather than as a separate overlay. This bears on open question 1: a short pointer-shaped form may fit better than the `aheho` overlay.

4. **`xahehon` needs a reading.** Today it is an agenda label titled *Topic*. With the `aheho` **-n** overlay, it is `/x/` + the topic pronoun: *back to the topic*. That is a useful form (a referent-level *anyway*, see below), but it must be stated, not left to fall out.

5. **Unnamed topics come in through labels (open question 4).** Root + **-n** on `/x/` is already a titled label, so `/x/` + a kind root + **-n** makes that thing the topic by an overt choice. The default rule stays limited to names, so incidental things still never take the topic.

6. **Referent topic vs subject-matter topic.** Agenda labels often name subject matter, not a referent (*the budget*, *ward 3*, *item 12*). The topic pronoun tracks a referent. Either the topic pronoun picks up whatever the label names, read as the titled thing, or subject-matter labels (`x_…` cites, numbered points) are kept out of the topic. The table above takes the second option for cites and bare numbers.

7. **The default re-arms after a clear.** Rule 1 generalizes: at the start of a conversation, **or after `xevavem`**, the first named `/z/` becomes the topic. This answers part of open question 5: the default is how a new frame gets its topic without an extra word.

8. **Topic shift never changes the speech move.** `/x/` continues the move ([continue](../grammar/dependents.md#continue-x)), so changing the topic inside a question keeps it a question: `xazawan` mid-question is *and about Azawan, …?*. A new move with a new topic is `/y/` followed by an `/x/` topic word.

9. **Spans do not leak.** A topic word inside a quote or aside sets nothing outside it, as span interiors are not anchors for role pointers.

### Side topics as a stack

`xavazem` *by the way* and `or …` *anyway* already describe a side topic and a return to the main line ([discourse hooks](../grammar/hooks.md#hook-resume)). If they also move the referent topic, the topic is a **stack**:

- `xavazem` pushes: the side frame starts with no topic, and the default rule fires inside it.
- `or …` pops back to the topic before `xavazem`.
- Agenda depth can drive the same stack: a deeper outline point (`x#3e2`) pushes, a parent-layer point (`xrebuwol`) pops.

**The `or` outlier.** `or` is a prefix-less hook, not an `/x/` word, so "every topic change is `/x/`" has one exception. Two ways to close it: accept it (`or` restores the topic rather than changing it, and hooks already own discourse glue), or make `xahehon` *back to the topic* the referent-level pop and leave `or` to lines of talk only.

### Prosody

The [prosody table](../grammar/dependents.md) gives `/x/` a dip with no pitch reset, which signals *same speech move*. Natural languages mark a topic change with a pitch reset at the start of the new stretch. Topic-setting `/x/` words could take their own row (a reset, with the speech move still unchanged), so a listener hears the change as well as the word.

### Why this matters for learners

- **Topic drift becomes visible.** Every change of topic is an overt word, so *who changed the subject, and when* has an answer. A side topic is admitted (`xavazem`), and a return to the main line is explicit. That fits the rationality theme: derailing and whataboutism are easier to notice when the topic cannot change silently.
- **Tools can segment by topic.** A transcript splits into topic stretches mechanically, with the speaker who opened each one.
- **One rule replaces three.** The listener tracks one slot (`/x/`) and one default, instead of a default, a scoped hook that also persists, and a linker.

## Interactions

| Area | Effect |
|------|--------|
| Role pointers (`role-pointer-pronouns.md`) | Unchanged. Pointers name slots and event participants; the topic pronoun names one referent. A pointer may resolve to the topic; the two never conflict. |
| Whole-stem **-r** | Unchanged. Use it for any non-topic referent, and to point at the topic by name. |
| Reflexive | The topic pronoun works in any slot, so *Azawan sees themself* with Azawan as topic can be `zazawan vahahal dahehon.`; `daxer` still works. |
| *As for* (`hahehom`) | Gains a lasting effect under rule 2; unchanged under the [`/x/` variant](#topics-more-broadly-x-as-the-topic-slot), which adds *now, about X* (`xazawan`) beside it. On absorb, update [say-people-places](../grammar/say-people-places.md#as-for). |
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
7. **`/x/` as the topic slot.** Adopt the [`/x/` variant](#topics-more-broadly-x-as-the-topic-slot) (as for stays sentence-scoped), or keep rule 2?
8. **Subject-matter labels.** Do label cites, numbered points, and titled agenda items on non-names set the topic, or only labels on names and kinds?
9. **Stack.** Should agenda depth push and pop the topic, or only `xavazem` and `or`? Close the `or` outlier with `xahehon`, or accept it?
10. **Prosody.** Give topic-setting `/x/` words a pitch reset of their own?

## Non-goals

- Inferring the topic from salience, frequency, or position.
- Changing role pointers or whole-stem resume.
- First- and second-person pronouns.
- Teaching any of this on grammar pages while it stays a proposal.

# Proposal: topics and the topic pronoun

**Status:** PROPOSED (not current language). Grammar today: a referent is picked up with content **-r** ([pronouns](../grammar/pronouns.md#resume-r)); every named person keeps one [ordinal pronoun](../grammar/pronouns.md#ordinal-pronouns) in every role, numbered by order of introduction; *as for X* is **`hahehom`** + `/b/` for one sentence ([say-people-places](../grammar/say-people-places.md#as-for)); *going back to X* is continue `/x/` + resume ([thread return](../grammar/pronouns.md#going-back-to-a-thread)). Nothing tracks which referent the talk is currently about.  
**Related:** [role pointers](../grammar/pronouns.md#role-pointers), [pronouns.md](../grammar/pronouns.md), [say-people-places.md](../grammar/say-people-places.md#as-for), [hooks.md](../grammar/hooks.md#hook-resume), [dependents.md](../grammar/dependents.md#sentence-linkers), [word-endings.md](../grammar/word-endings.md#continue-x), [clause.md](../grammar/clause.md#word-order-emphasis), [joins.md](../grammar/joins.md#unspecified-member-r-phrase), [`data/lexicon-overlays.csv`](../../data/lexicon-overlays.csv)  
**Design authority:** none until absorbed.

## Motivation

[Role pointers](../grammar/pronouns.md#role-pointers) name a **slot**: whoever last filled `/z/`, `/d/`, or `/b/`. The same person therefore changes pronoun as they change role: Azawan is `zaxar` after being a subject and `zuxar` after being an object. That suits *the one who did that*, but not the main character of a story, who is referred to most often and in every role.

[Ordinal pronouns](../grammar/pronouns.md#ordinal-pronouns) fix each named person to one pronoun in every role, but the listener has to keep a count that runs for the whole conversation (`zrewor` is the first person named), and the pronoun says nothing about who matters now.

A **topic** is what the talk is about from here on. A **topic pronoun** fixes the current topic to one pronoun in every role. Only the role letter changes. This is how proximate marking works in Algonquian languages: one referent stays proximate across clauses whatever its grammatical role, and everyone else is the other one.

For tooling, the topic must never be inferred from salience. It is set only by overt forms, so every tool computes the same topic at every point.

## Proposed shape

The topic pronoun is the published root **`aheho`** (#️⃣ *hash*, abstract *topic*) with **-n**, the same way *speaker* and *listener* are overlays on **`amago`** and **`ehodo`** ([special pronouns](../grammar/pronouns.md#special-pronouns)):

| Form | Meaning | English |
|------|---------|---------|
| `zahehon` / `dahehon` / `bahehon` | the current topic, in the slot it fills now | *he / she / it / they* (the main one) |
| `…ahehonx` | the topic and associates | *they* (that one and associates) |

The overlay is on `/z/`, `/d/`, and `/b/` only. The cue is the existing one: a hashtag marks what the post is about. The overlay attaches to the published row, as new overlays must ([overlay kinds](../meta/parser-pipeline.md#overlay-kinds)).

**Length.** At seven letters it is no shorter than a name. See [ordinals and the topic](#ordinals-and-the-topic) for a five-letter alternative.

## `/x/` is the only way to set a topic

`/x/` already sits between clauses and carries discourse structure: linkers, agenda labels, numbered points, thread return. **Every topic change is an `/x/` word.** Nothing else sets, changes, or clears the topic: not being named first, not being subject, not *as for*.

1. **No topic at the start.** A conversation opens with no topic.
2. **Introduce.** `/x/` + a root + **-l**, **-m**, or **-n** makes that referent the topic. The ending reads as on any noun: `xodogal` *now, about a dog*, `xazawam` *now, about grace*, `xazawan` *now, about Azawan*. The topic need not be a person or a name.
3. **Return.** `/x/` + whole-stem **-r** with a noun antecedent (`xazawar`, *going back to Azawan*) makes that referent the topic again.
4. **Clear.** `xevavem` *next* and `xavazem` *by the way* each open a new frame ([linkers](../grammar/dependents.md#sentence-linkers)). After either, there is no topic until the next introduce or return.
5. **Persist.** The topic holds until rule 2, 3, or 4 changes it.
6. **No topic, no pronoun.** A topic pronoun with no topic set is invalid.
7. **Reset the count.** Every topic change (introduce, return, clear) restarts [ordinal](../grammar/pronouns.md#ordinal-pronouns) counting from 1. See [ordinals and the topic](#ordinals-and-the-topic).

**Introduce vs return** mirrors the rest of the language: **-l** / **-m** / **-n** introduce, **-r** picks up.

**Every return is explicit.** The topic is one value, not a stack. Coming back from a side topic, or from a new frame, means naming the old topic again with `xazawar`. `or …` *anyway* returns to the main **line of talk** and leaves the topic alone, so after a side topic the full return is `or xazawar …`.

### What each `/x/` word does

| `/x/` form | Today | Topic effect |
|------------|-------|--------------|
| non-linker root + **-n** (`xazawan`) | titled agenda label | **Introduce** |
| non-linker root + **-l** / **-m** (`xodogal`, `xazawam`) | rejected (only the six linkers take **-l** / **-m**) | **Introduce** |
| whole-stem **-r** with a noun antecedent (`xazawar`) | thread return | **Return** |
| **-r** with an `/x/` antecedent | same linker again (*likewise*) | none |
| `xevavem` *next*, `xavazem` *by the way* | open a new frame / side topic | **Clear** |
| other linkers (`xodum`, `xezom`, `xagagam`, `xagezam`, firm **-l**) | glue to the last claim | none |
| clause joins (`xal`, `xan`, …) and clause stand-ins (`xar`, `xur`, …) | join clauses / *something happened* | none |
| numbered points (`x#N`), label cites (`x_…`), *Finally* / *Starting with*, outline depth | agenda structure | none |

**The six linker roots.** `odu`, `ezo`, `agaga`, `evave`, `ageza`, and `avaze` keep their linker readings on **-m** (and firm **-l** on three). To make one of those things the topic, use **-n** (`xodun`), which is a titled label on any root.

If clause joins or *therefore* changed the topic, it would reset in the middle of every chain, so only words that introduce, return, or open a frame count. The resolver decides the **-r** row by the antecedent's role letter, so the split stays mechanical.

### Examples (proposed forms)

The topic stays fixed across roles:

> `xazawan zazawan dalahen vahahal. zalahen dahehon vezebel. zahehon varahal.`
>
> x-Azawan | z-Azawan | d-Alahen | v-see . z-Alahen | d-topic | v-tell . z-topic | v-run
>
> "Now, about Azawan: Azawan sees Alahen. Alahen tells Azawan. Azawan runs."

A thing as topic:

> `xodogal zazawan dahehon vahahal. zahehon varahal.`
>
> x-dog | z-Azawan | d-topic | v-see . z-topic | v-run
>
> "Now, about a dog: Azawan sees it. It runs."

*As for* frames one sentence and leaves the topic alone, so here the topic stays Azawan:

> `xazawan zazawan vowogal. hahehom balahen zodogal varahal. zahehon vehahel.`
>
> x-Azawan | z-Azawan | v-walk . [h-topic | b-Alahen] | z-dog | v-run . z-topic | v-sit
>
> "Now, about Azawan: Azawan walks. As for Alahen, a dog runs. Azawan sits."

A side topic, then an explicit return:

> `xazawan zazawan vowogal. xavazem zodogal varahal. or xazawar zahehon vehahel.`
>
> x-Azawan | z-Azawan | v-walk . x-by-the-way | z-dog | v-run . anyway | x-←Azawan | z-topic | v-sit
>
> "Now, about Azawan: Azawan walks. By the way, a dog runs. Anyway, back to Azawan: Azawan sits."

Without `xazawar`, the last sentence would have no topic and `zahehon` would be invalid.

## Ordinals and the topic

Rule 7 restarts the ordinal count at every topic change. Counts stay small (most topic stretches have one to three people), which fixes the main weakness the [ordinals page](../grammar/pronouns.md#ordinal-pronouns) admits: *when the listener would have to stop and count, say the name.* The cost is that numbers no longer last the whole conversation: after a reset, someone named earlier has no number until they are named again, and the greeting numbers (*2 sees 1* from either speaker) last only until the first topic.

With the reset, ordinals and a topic pronoun overlap heavily. When the topic is a named person, the topic is almost always number 1 in its stretch. So there are two coherent designs:

**A. Ordinals carry the topic (recommended).** The `/x/` word that sets the topic always takes number 1, whatever its ending, so the topic pronoun **is** `zrewor` / `drewor` / `brewor`. Other names count from 2 in order of entry. No `aheho` overlay and no separate *other one* pronoun: in the common two-party stretch, *the other one* is number 2.

- One system to learn instead of two, already in the parser.
- Five letters instead of seven.
- Stable: number 2 stays number 2 for the whole stretch, where a dynamic *other one* shifts as people come and go.
- The cue still works: number 1 is the main one.
- Kinds and things other than the topic still take no number; they use role pointers or whole-stem **-r**.

**B. Topic and other one replace ordinals.** Keep the `aheho` overlay for the topic, add a closed *other one* (the most recent named referent that is not the topic), and drop ordinals.

- No counting at all, and the Algonquian proximate / obviative split is a known, learnable pattern.
- Only two referents get a stable pronoun. A third person in the stretch needs a name or a role pointer.
- Two new seven-letter overlays where ordinals have five letters.

A wins on length, on stretches with three or more people, and on stability; B wins only on removing the count, and the reset already makes the count short. Under A, the rest of this proposal reads with `zrewor` for `zahehon`, and the [proposed shape](#proposed-shape) section is dropped.

## Asking about the topic

No `/x/` word ending in **-r** asks *what are we talking about?* today:

| Form | Meaning today |
|------|---------------|
| `xar` / `xor` / `xer` / `xur` | join **-r** on `/x/`: a clause stand-in (*something happened*, *anything*, *whatever ranks highest*, *something else happened*). Under `yol` they ask for an **event**: *what happened?* / *what else happened?* ([fill-ask](../grammar/questions.md#fill-ask-r), [unspecified member](../grammar/joins.md#unspecified-member-r-phrase)) |
| `x` + root + **-r** | a resume (*likewise*, or thread return). Always has an antecedent, so never a blank |
| `xrer`, `xrar`, `xrur`, `xror` | digitless discourse numbers on **-r**: a blank for a numbered point or a label cite (*which point?*, *which item?*), not a referent ([digitless](../grammar/numbers.md#digitless)) |
| `xaxar` and other pointer shapes | rejected: role pointers fill only `/z/`, `/d/`, `/b/`, and a holder slot |

`/x/` blanks are clause-sized because `/x/` is where clauses join, so reusing `xar` for the topic would make *what happened?* ambiguous. Ask with the existing pieces instead: an identity question with the topic pronoun.

> `yol zar gugol bahehon.`
>
> y-question | z-who | [g-SAME | b-topic]
>
> "Who (or what) is the topic?"

Under design A this is `yol zar gugol brewor.` The natural answer is an `/x/` introduce or return (`xazawar.`), which sets the topic for both speakers at once. `yol xror.` (*under which label?*) stays the question for agenda items.

## How topics meet the rest of the grammar

Agazan has several things English lumps under *topic*. This proposal keeps them apart, and each stays on its own form:

| Layer | Scope | Form | Sets the topic? |
|-------|-------|------|-----------------|
| Discourse topic | until the next `/x/` change | `/x/` (this proposal) | yes, the only setter |
| Sentence frame | this sentence | `hahehom` + `/b/` *as for* | no |
| Highlight | this sentence | first content word ([word order](../grammar/clause.md#word-order-emphasis)) | no |
| Contrast | one phrase | `&` ([tone marks](../grammar/speech-moves.md#tone-marks)) | no |
| Rank among others | one phrase | `zal` / `zem` / `zel` *only / especially* | no |
| Line of talk | between sentences | `or` / `ar` / `er` / `ur` ([resume hooks](../grammar/hooks.md#hook-resume)) | no |

Area by area:

| Area | Effect |
|------|--------|
| [Word order](../grammar/clause.md#word-order-emphasis) | The first content word is *what the sentence is about, or the new information*. With a discourse topic, that "about" is only sentence-level. On absorb, reword clause.md so first position is a highlight and the discourse topic is `/x/`. A topic pronoun in first position is the unmarked case. |
| `&` contrast, `zal` / `zem` / `zel` | Unaffected. `&zahehon` is *it was the main one (not someone else)*; `zahehon zal` is *only the main one*. |
| *As for* (`hahehom`) | Unchanged: a frame for one sentence. English *as for X* splits into *in this sentence, regarding X* (`hahehom bazawan`) and *now, about X* (`xazawan`). Rename its gloss to *as-for* so it does not read like the topic. |
| [Thread return](../grammar/pronouns.md#going-back-to-a-thread) | Gains a lasting effect. Today it names someone *without making the next sentence about them*; under this proposal, dropping it still leaves the claim unchanged, but it changes the topic and resets the count. |
| [Agenda labels](../grammar/word-endings.md#continue-x) | `/x/` root + **-n** becomes one of three introduce endings. **-l** / **-m** on `/x/` are new for non-linker roots. |
| [Ordinal pronouns](../grammar/pronouns.md#ordinal-pronouns) | Counting restarts at every topic change ([above](#ordinals-and-the-topic)). The page's *the whole conversation* rule becomes *the current topic stretch*. |
| [Role pointers](../grammar/pronouns.md#role-pointers) | Unchanged. Pointers name slots; the topic pronoun names one referent. A pointer may resolve to the topic. `/x/` words are not pointer anchors. |
| Whole-stem **-r** | Unchanged. Use it for any referent, including someone from before the last reset. |
| Reflexive | With Azawan as topic, *Azawan sees themself* can be `zazawan vahahal dahehon.`; `daxer` still works. |
| [Speech moves](../grammar/speech-moves.md) | A topic change never changes the speech move: `/x/` continues it, so `xazawan` mid-question is *and about Azawan, …?*. A new move (`/y/`) does not clear the topic. Vocatives call someone; they do not make them the topic. The topic is shared across speakers, so either party can change it and both compute the same value. A goodbye ends the conversation and clears it. |
| [Plurality](../grammar/plurality.md) | **-x** is unused on `/x/`, so `xazawanx` is rejected, and joined `/x/` names do not parse. Since `/x/` is now the only way in, a group topic needs **-x** on `/x/` introduce and return words (*now, about Azawan and associates*). |
| [Of-relations](../grammar/relations.md#of-relations) | The topic pronoun fills hosted `/b/`: `em bahehon` is *the main one's*, stable across roles. |
| [Holder seam](../grammar/knowing.md#holder) | The topic pronoun can be the holder: the main character's own view or feeling. |
| [Stand-ins](../grammar/dependents.md) and content clauses | A topic pronoun inside content resolves to the outer topic, so *Azawan says that the main one runs* means the speaker's topic, not Azawan's. `/x/` topic words inside content set nothing outside it. |
| [Spans](../grammar/spans.md) | Quotes and asides do not leak topic changes. Open: does a quote start with no topic (it is someone else's talk), while an aside inherits the speaker's? |
| [Prosody](../grammar/dependents.md) | `/x/` is a dip with no pitch reset (*same speech move*). Natural languages mark a topic change with a pitch reset. Topic-setting `/x/` words could take their own row: a reset, speech move unchanged. |
| D-13 (long *I* / *you*) | Making a conversation participant the topic now takes an overt `/x/` word, so it is a choice, never an accident. Open: is `/x/` + the speaker or listener overlay (*now, about me*) allowed? |
| Recipe track | On absorb, add *now, about X*, *speaking of X*, *back to X*, *what are we talking about?* to [english.md](../grammar/english.md) beside the *regarding* row. |
| Ordinary `aheho` | `ahehol` *hash* and `ahehom` *topic* keep their senses; `hahehom` keeps its *as for* job. Under design B only **-n** on `/z/`, `/d/`, `/b/` is overlaid; under A nothing is. |

## Why this matters for learners

- **Topic drift becomes visible.** Every change of topic is an overt word, so *who changed the subject, and when* has an answer. A side topic is admitted (`xavazem`), and the return is spelled out (`xazawar`), never assumed. That fits the rationality theme: derailing and whataboutism are easier to notice when the topic cannot change silently.
- **Tools can segment by topic.** A transcript splits into topic stretches mechanically, with the speaker who opened each one.
- **One slot to watch.** The listener tracks one slot (`/x/`), and the count of names restarts with each topic.

## Parser and tooling

- `/x/` + non-linker root + **-l** / **-m** becomes valid (today it is rejected as an unknown linker).
- The resolver tracks one topic value per conversation: set by `/x/` + **-l** / **-m** / **-n** or noun-antecedent **-r**, cleared by `xevavem`, `xavazem`, and goodbye. Each change also restarts the ordinal count. Spans and stand-in content get their own scope. A topic pronoun binds to the value or is rejected when it is unset.
- Design A: the topic word takes ordinal 1 whatever its ending. Design B: an overlay row for `aheho` **-n** on `/z/`, `/d/`, `/b/` in [`lexicon-overlays.csv`](../../data/lexicon-overlays.csv), and ordinals are removed.
- Morph gloss: `topic` for the pronoun (B) or the usual ordinal gloss (A); `hahehom` moves to `as-for`.

## Open questions

1. **Ordinals.** Design A (ordinals carry the topic) or B (topic and other-one pronouns replace ordinals)?
2. **What resets.** Does a clear (`xevavem`, `xavazem`) reset the count as well as an introduce or return, as rule 7 says?
3. **Subject-matter labels.** Can an agenda label on a non-referent (*the budget*, *ward 3*) be the topic the pronoun picks up?
4. **Groups on `/x/`.** Allow **-x** on `/x/` introduce and return words?
5. **Participants.** Can the speaker or listener be the topic?
6. **Quotes.** Does a quote start with no topic?
7. **Prosody.** Give topic-setting `/x/` words a pitch reset of their own?

## Non-goals

- Inferring the topic from salience, frequency, or position.
- A default topic. Only `/x/` sets one.
- A topic stack. Returns are always explicit.
- Changing role pointers or whole-stem resume.
- First- and second-person pronouns.
- Teaching any of this on grammar pages while it stays a proposal.

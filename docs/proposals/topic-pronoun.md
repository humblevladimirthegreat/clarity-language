# Proposal: topics and the topic pronoun

**Status:** PROPOSED (not current language). Grammar today: a referent is picked up with content **-r** ([pronouns](../grammar/pronouns.md#resume-r)); every named person keeps one [ordinal pronoun](../grammar/pronouns.md#ordinal-pronouns) in every role, numbered by order of introduction across the whole conversation; *as for X* is **`hahehom`** + `/b/` for one sentence ([say-people-places](../grammar/say-people-places.md#as-for)); *going back to X* is continue `/x/` + resume ([thread return](../grammar/pronouns.md#going-back-to-a-thread)). Nothing tracks which referent the talk is currently about.  
**Related:** [role pointers](../grammar/pronouns.md#role-pointers), [pronouns.md](../grammar/pronouns.md), [say-people-places.md](../grammar/say-people-places.md#as-for), [hooks.md](../grammar/hooks.md#hook-resume), [dependents.md](../grammar/dependents.md#dependent-clauses), [word-endings.md](../grammar/word-endings.md#continue-x), [clause.md](../grammar/clause.md#word-order-emphasis), [joins.md](../grammar/joins.md#scope-fence-p-join), [spans.md](../grammar/spans.md), [lexicon editing](../meta/lexicon.md), [`src/lexicon-place.ts`](../../src/lexicon-place.ts), [`src/closed-roots.ts`](../../src/closed-roots.ts)  
**Design authority:** none until absorbed.

## Motivation

[Role pointers](../grammar/pronouns.md#role-pointers) name a **slot**: whoever last filled `/z/`, `/d/`, or `/b/`. The same person therefore changes pronoun as they change role: Azawan is `zaxar` after being a subject and `zuxar` after being an object. That suits *the one who did that*, but not the main character of a story, who is referred to most often and in every role.

[Ordinal pronouns](../grammar/pronouns.md#ordinal-pronouns) fix each named person to one pronoun in every role, but the count runs for the whole conversation, so numbers grow and the listener has to stop and count. Nothing says who matters now.

A **topic** is what the talk is about from here on. This proposal makes the topic overt, gives it one pronoun of its own, and restarts the ordinal count at every topic change so numbers stay small. This is how proximate marking works in Algonquian languages: one referent stays proximate across clauses whatever its grammatical role, and everyone else is counted separately.

For tooling, the topic must never be inferred from salience. It is set only by overt forms, so every tool computes the same topic at every point.

## `/x/` is the only way to set a topic

`/x/` already sits between clauses and carries discourse structure: linkers, agenda labels, numbered points, thread return. **Every topic change is an `/x/` word.** Nothing else sets, changes, or clears the topic: not being named first, not being subject, not *as for*.

1. **No topic at the start.** A conversation opens with no topic.
2. **Introduce.** `/x/` + any noun makes it the topic: *now, about X*. The noun keeps its ordinary ending, so the topic need not be a person or a name (`xodogal` *now, about a dog*, `xazawan` *now, about Azawan*). **-x** works as on any noun (`xazawanx` *now, about Azawan and associates*, `xodogalx` *now, about some dogs*). The topic word takes the same package as any noun, adjectives and hooks included, so any noun phrase can be the topic (*now, about the blue dog*, *now, about Azawan's dog*). A topic word may also stand alone as a whole sentence (`xazawan.` *About Azawan.*), to announce a topic before saying anything about it. The six [linkers](../grammar/dependents.md#sentence-linkers) keep their readings.
3. **Return.** `/x/` + whole-stem **-r** with a noun antecedent (`xazawar`, *going back to Azawan*; `xazawarx` for a group) makes that referent the topic again.
4. **Clear.** `xevavem` *next* and `xavazem` *by the way* each open a new frame. After either, there is no topic until the next introduce or return.
5. **Persist.** The topic holds until rule 2, 3, or 4 changes it. Clause joins, other linkers, and agenda numbering leave it alone.
6. **Reset.** Every topic change, including a clear, starts a new **topic stretch**; see [what resets](#what-resets-on-a-topic-change).
7. **Where.** A topic word opens a sentence in the speaker's own talk, or in a quote. It is not allowed inside a dependent or an aside; see [topic words and dependents](#topic-words-and-dependents) and [quotes and asides](#quotes-and-asides).

**Every return is explicit.** The topic is one value, not a stack. Coming back from a side topic, or from a new frame, means naming the old topic again with `xazawar`. `or …` *anyway* returns to the main **line of talk** and leaves the topic alone, so after a side topic the full return is `or xazawar …`.

**Prosody.** A topic-setting `/x/` word takes a **pitch reset**, as a new `/y/` turn does, but the speech move is unchanged: the listener hears that the subject changed, not that a new act began. Other `/x/` words keep the dip with no reset ([periods](../grammar/dependents.md#orthography-and-prosody-periods)).

## The topic pronoun

The topic is always referred to with the topic pronoun: the published root **`oza`** (⭐ *star*, abstract *fame*) with **-n**, a marked pronoun row like *someone* (**`una`**) and *speaker* / *listener* (**`amago`** / **`ehodo`**) ([special pronouns](../grammar/pronouns.md#special-pronouns)). Marked pronoun rows get three-letter roots, so the word is two syllables, the same length as an ordinal. `oza` is already three letters.

| Form | Meaning | English |
|------|---------|---------|
| `zozan` / `dozan` / `bozan` | the current topic, in the slot it fills now | *he / she / it / they* (the one we are talking about) |
| `…ozanx` | the topic and associates | *they* (that one and associates) |

The pronoun reading is on `/z/`, `/d/`, and `/b/` only. (cue: ⭐ the star of the talk: what everyone is looking at)

A topic pronoun with no topic set is invalid. **`oza`** keeps its ordinary senses on **-l** / **-m** (`zozal` *a star*, `zozam` *fame*).

## Ordinals count everyone else

Ordinal counting restarts at every topic change. **The topic never takes a number**, even when it is a name and even when it is named again inside the stretch. Other names count from 1 in order of entry. So the topic is always `zozan`, and `zrewor` is always the first *other* person: one form per referent, with no case split between named and unnamed topics.

### Examples (proposed forms)

The topic keeps one pronoun in every role; the first other name is number 1:

> `xazawan zozan dalahen vahahal. zrewor dozan vezebel. zozan varahal.`
>
> x-Azawan | z-TOPIC | d-Alahen | v-see . z-←1st | d-TOPIC | v-tell . z-TOPIC | v-run
>
> "Now, about Azawan: Azawan sees Alahen. Alahen tells Azawan. Azawan runs."

A thing as topic works the same way:

> `xodogal zazawan dozan vahahal. zozan varahal. zrewor vehahel.`
>
> x-dog | z-Azawan | d-TOPIC | v-see . z-TOPIC | v-run . z-←1st | v-sit
>
> "Now, about a dog: Azawan sees it. It runs. Azawan sits."

*As for* frames one sentence and leaves the topic alone:

> `xazawan zozan vowogal. hahehom balahen zodogal varahal. zozan vehahel.`
>
> x-Azawan | z-TOPIC | v-walk . [h-topic | b-Alahen] | z-dog | v-run . z-TOPIC | v-sit
>
> "Now, about Azawan: Azawan walks. As for Alahen, a dog runs. Azawan sits."

A side topic, then an explicit return:

> `xazawan zozan vowogal. xavazem zodogal varahal. or xazawar zozan vehahel.`
>
> x-Azawan | z-TOPIC | v-walk . x-by-the-way | z-dog | v-run . anyway | x-←Azawan | z-TOPIC | v-sit
>
> "Now, about Azawan: Azawan walks. By the way, a dog runs. Anyway, back to Azawan: Azawan sits."

Without `xazawar`, the last sentence would have no topic and `zozan` would be invalid.

## What resets on a topic change

Introduce, return, and clear all reset:

| State | Resets? | Why |
|-------|---------|-----|
| [Ordinal count](../grammar/pronouns.md#ordinal-pronouns) | yes | Keeps numbers small. Greeting numbers (*2 sees 1* from either speaker) last only until the first topic; after that, use `amago` / `ehodo` or names. |
| [Role pointer](../grammar/pronouns.md#role-pointers) anchors | yes | `zaxar` *the latest doer* and `zaxor` *the other one* stop at the topic change, so a pointer never reaches into an earlier stretch. Someone from before is picked up by name or whole-stem **-r**. |
| [Ambient order of magnitude](../grammar/numbers.md) | yes | A new topic is a new stretch, so bare numbers go back to ones until an ambient decade is set again. |
| Whole-stem **-r** | no | It is the explicit way back (`xazawar`), so it must reach across stretches. |
| [Tale](../grammar/knowing.md#evidentiality) now (`thozem`) | no | A story moves between characters (*meanwhile, about Alahen…*) without leaving the tale. It still ends at another channel or a new turn. |
| Agenda numbering (`x#N`, outline depth) | no | Agenda items sit above topics; one item may hold several. |
| Speech move, resume hooks (`or` / `ar` / `er` / `ur`), span resume | no | They track the move and the line of talk, not referents. |

## Thread return gains a lasting effect

Today [thread return](../grammar/pronouns.md#going-back-to-a-thread) (`xazawar`, *going back to Azawan*) only points the listener at an earlier thread: *you can drop that word and the following claim is unchanged*. Under this proposal it is one of the two ways to set a topic, so it does four things at once:

1. **Sets the topic.** From here on, `zozan` is Azawan, in every role, until the next topic change.
2. **Starts a stretch.** The ordinal count, role-pointer anchors, and ambient magnitude reset. Anyone from the side topic who comes up again is counted afresh, in order of re-entry.
3. **Asserts nothing.** The word still makes no claim. Dropping it leaves the truth of the next sentence the same **only if** that sentence says Azawan in full. If it says `zozan`, dropping `xazawar` changes who `zozan` is, or leaves it with no topic, which is invalid.
4. **Reaches anywhere.** Whole-stem **-r** is not reset, so a return can reach back across any number of stretches to the most recent word with that stem, including a word inside a quote ([quotes and asides](#quotes-and-asides)).

What the old wording gets wrong is *only points at a thread*: the return is now how a conversation gets back to someone, and most of its effect is on the sentences after it.

### Return vs introduce

Both set the topic. The difference is the ordinary difference between **-r** and a first mention:

| Form | Topic | English |
|------|-------|---------|
| `xazawan` | Azawan | *now, about Azawan* (a name picks out the same person either way) |
| `xazawar` | Azawan, the one mentioned before | *back to Azawan* |
| `xodogal` | **a** dog, new to the talk | *now, about a dog* |
| `xodogar` | **the** dog from before | *back to the dog* |

For names, the two pick the same person; choose by what the listener should hear: something new, or a way back. For kinds, only the return reaches the earlier thing. A return with no earlier match is the definite *the one you both know*, as for any **-r**.

### Returning to the current topic

`xazawar` while Azawan is already the topic is still a topic change: it starts a new stretch with the same topic. That gives the speaker a way to clear a crowded count (*so, Azawan again*) without leaving the topic. Every return resets, so the rule stays mechanical.

### On absorb

- Rewrite [going back to a thread](../grammar/pronouns.md#going-back-to-a-thread): it sets the topic and starts a stretch; drop *without making the next sentence about them* and *you can drop that word*.
- In the [resume hook](../grammar/hooks.md#hook-resume) *Compare with*, keep the split: `or` returns to a line of talk, `xazawar` to a referent.
- English recipes: *back to X*, *as I was saying about X*, *anyway, X …* (`or xazawar …`).

## Topic words and dependents

A [dependent](../grammar/dependents.md#dependent-clauses) is the sentence after a stand-in (`darl`, `dorl`, `derl`, `durl`, `barl` after a pole, a lexicalized stand-in verb such as `vaen`). It runs to the end of the written sentence, and `/x/` clause joins inside it stay in the dependent. So a topic word there would read as part of the content:

> `zazawan vezebel darl xalahen zrewor vowogal.` (invalid)
>
> z-Azawan | v-tell | d-that-clause | x-Alahen | z-←1st | v-walk

The parser already rejects this: an `/x/` linker or agenda label comes only at the start of a sentence, and dependents.md teaches that a linker *starts the next written sentence*. So the question is whether to keep that rule once these words carry the topic. Three readings are possible, and only one holds up.

**Leak: the topic changes for the talk that follows.** The topic would change from inside content that the speaker does not assert: *if*, *whether*, *lest*, *Azawan says that*. A topic change is the speaker's own act on the conversation, and it would be buried mid-sentence, in a spot a listener files as someone else's content. It also forces a pitch reset inside a stand-in hang, which the hang exists to prevent.

**Local: the topic holds only inside the dependent.** The dependent would get its own stretch, so ordinals, role pointers, and ambient magnitude would reset inside it. Then the content can no longer reach the people of the sentence it belongs to: in *Azawan tells Alahen that …*, `zrewor` inside the content would no longer be Alahen. The topic word buys a frame and costs every short pronoun that frame needs.

**Not allowed (recommended, and today's behavior).** Topic words are invalid inside a dependent, at any depth. That covers introduce, return, and the clearing linkers `xevavem` and `xavazem`. This is the same rule the stand-in already has for `/y/`: a dependent does not open a speech act, because the act belongs to the speaker's own talk. A topic change belongs there too.

What the speaker does instead:

| Want | Use |
|------|-----|
| Content about X, in one sentence | `hahehom` + `/b/` *as for* inside the dependent: a frame for that clause only, no reset |
| Change the topic, then report | Put the `/x/` word before the outer sentence: `xalahen zazawan vezebel darl zozan vowogal.` *Now, about Alahen: Azawan says that Alahen walks.* |
| Report someone's own topic change | Quote their wording ([spans](../grammar/spans.md)). A quote is their talk, so topic words are allowed inside and do not leak. |

**Reading the topic from inside a dependent** is fine and unchanged: `zozan`, ordinals, and role pointers inside the content resolve to the speaker's current stretch. *Azawan says that the main one runs* means the **speaker's** topic, not Azawan's, the same way ordinals inside content count the speaker's names.

**Clause joins are not dependents.** A sentence chained with `xal` / `xan` is still the speaker's own talk, but a join keeps the clauses in one written sentence. A topic word cannot sit after a join either: change the topic between sentences, after a period.

## Quotes and asides

| Span | Topic at the start | Topic words inside | Leaks out? |
|------|--------------------|--------------------|------------|
| Quote | none (it is someone else's talk) | allowed; the quote's own `/x/` word sets its topic | no |
| Aside (`th(…)`) | inherits the speaker's | not allowed | — |

Ordinals and role pointers follow the same split: a quote counts and anchors from scratch; an aside uses the speaker's stretch.

**Resumes and quotes are one-way.** A whole-stem **-r** outside a quote can find a word inside it; a **-r** inside a quote cannot find a word outside it. Talking about what someone was quoted saying is common (*Alahen said Azawan walked. Back to Azawan …*), so the outer talk must reach in. But the quoted words were said before the surrounding sentence existed, so they cannot point at it. Today neither direction resolves: a resume inside a quote is left unresolved, and one outside skips quote interiors. This rule applies to every whole-stem **-r**, not only to returns.

An aside is a remark in passing inside the speaker's own sentence. A topic change is a turn in the conversation, which an aside by definition is not, and a change that could not leak would be a topic for a few words. For a real side topic, end the sentence and use `xavazem`.

## Groups: `-x` on `/x/` or on the pronoun

Two ways to talk about a group as the topic. Today **-x** is rejected on `/x/`, and the topic pronoun takes associative **-x** like any pronoun (`zozanx`).

**A. `-x` on `/x/`.** `xazawanx` makes *Azawan and associates* the topic; `xodogalx` makes *some dogs* the topic; `xazawarx` returns to the group. `zozan` then means the group.

**B. `-x` only on the pronoun.** The topic is always one referent. *Azawan and associates* is `xazawan` then `zozanx` wherever the group is meant. `/x/` keeps today's rule.

| | A: on `/x/` | B: on the pronoun only |
|---|-------------|------------------------|
| Indefinite groups (`-lx`, *some dogs*) | can be the topic | **cannot**: no anchor to add associates to |
| Groups named with `-nx` (*Team Alpha*) | can be the topic | **cannot**, unless respelled as a group noun |
| Return to a group (`xodogarx`) | yes | no |
| Switching between *Azawan* and *Azawan's group* | needs a topic change (`xazawan` ↔ `xazawanx`), which resets the stretch | free: `zozan` and `zozanx` in the same stretch |
| What `zozan` means | whatever was set, one or many | always one referent |
| Change to the plurality rule | **-x** allowed on `/x/` nouns and resumes | none |
| Proximate analogy | proximate can be plural | one proximate referent |

B is simpler and keeps *Azawan* and *Azawan's group* in one stretch, but it cannot make a plain plural the topic at all: *now, about the dogs we saw* has no form. A covers every group shape that already exists elsewhere in the language. **Decided: A,** with associative `zozanx` still available on top (*the topic and associates*), so the B-style switch remains possible when the topic is one person.

## Speaker or listener as topic

Can `/x/` + the speaker or listener pronoun (*now, about me*, *now, about you*) set the topic?

**Pros:**

- **Real talk is often about *me* or *you*.** Feedback, advice, apology, therapy, and checking in all turn on one of the people talking. Barring them would push that talk into the no-topic state, where the pronoun is unavailable.
- **It makes self-focus visible.** Turning the conversation to yourself (*the shift response*: answering someone's news with your own) becomes an overt word. A learner can notice when they take the topic, and a listener can name it. That fits the compassion and rationality themes directly.
- **No exception.** `/x/` + any noun stays the whole rule.
- **Perspective-free reference.** Like ordinals, `zozan` names a person, not a role, so after *now, about you*, both speakers say `zozan` for the same person. That avoids the I / you swap across turns.

**Cons:**

- **A short *I* / *you*.** D-13 keeps `amago` / `ehodo` long on purpose, so names or a dropped subject are easier. After `xamagon`, `zozan` is a two-syllable *I* for the whole stretch. The cost is an overt `/x/` word, so it is a visible choice, but it is still a way around D-13.
- **Who `zozan` is must be fixed at the moment it is set.** `amago` means whoever is speaking, so the topic must resolve to the person who said `xamagon`, not to whoever speaks later. That is mechanical, but learners may expect `zozan` to follow the speaker.
- **Generic *you*.** Settled by making `ehodo` always the actual listener; generic *one* moves to its own pronoun (`generic-pronoun.md`).
- **Address sets.** The listener can be a group; the topic is then that group, which ties this to the [groups](#groups-x-on-x-or-on-the-pronoun) choice.

**Decided: allow**, resolved to the person (or address set) at the moment of setting. The visibility of self-focus is exactly the kind of distinction Agazan exists to encode, and D-13's aim (easier to use a name) still holds for ordinary sentences; only a stretch the speaker overtly made about themself gets the short form.

## Asking about the topic

No `/x/` word ending in **-r** asks *what are we talking about?*: `xar` / `xor` / `xer` / `xur` are clause stand-ins (`yol xar.` is *what happened?*), `x` + root + **-r** is a resume, and digitless `xrer` / `xror` ask *which point?* / *which item?*.

Ask with the ordinary *which X* shape instead: the join blank **`zar`** with **`gahehom`** *topic* as [SHARED](../grammar/joins.md#scope-fence-p-join) `/ɡ/` after it.

> `yol zar gahehom.`
>
> y-question | [z-which | g-topic]
>
> "Which topic?" / "What are we talking about?"

The natural answer is a lone `/x/` introduce or return (`xazawar.` *Back to Azawan.*), which also sets the topic for both speakers.

## How topics meet the rest of the grammar

Agazan has several things English lumps under *topic*. This proposal keeps them apart, and each stays on its own form:

| Layer | Scope | Form | Sets the topic? |
|-------|-------|------|-----------------|
| Discourse topic | until the next `/x/` change | `/x/` (this proposal) | yes, the only setter |
| Sentence frame | this clause | `hahehom` + `/b/` *as for* | no |
| Highlight | this sentence | first content word ([word order](../grammar/clause.md#word-order-emphasis)) | no |
| Contrast | one phrase | `&` ([tone marks](../grammar/speech-moves.md#tone-marks)) | no |
| Rank among others | one phrase | `zal` / `zem` / `zel` *only / especially* | no |
| Line of talk | between sentences | `or` / `ar` / `er` / `ur` ([resume hooks](../grammar/hooks.md#hook-resume)) | no |

Area by area:

| Area | Effect |
|------|--------|
| [Word order](../grammar/clause.md#word-order-emphasis) | The first content word is *what the sentence is about, or the new information*. With a discourse topic, that "about" is only sentence-level. On absorb, reword clause.md so first position is a highlight and the discourse topic is `/x/`. |
| `&` contrast, `zal` / `zem` / `zel` | Unaffected. `&zozan` is *it was the one we're talking about (not someone else)*; `zozan zal` is *only that one*. |
| *As for* (`hahehom`) | Unchanged: a frame for one clause. English *as for X* splits into *in this sentence, regarding X* (`hahehom bazawan`) and *now, about X* (`xazawan`). It is also the way to frame content inside a dependent. |
| [Thread return](../grammar/pronouns.md#going-back-to-a-thread) | Sets the topic and starts a stretch; see [thread return gains a lasting effect](#thread-return-gains-a-lasting-effect). |
| [Agenda labels](../grammar/word-endings.md#continue-x) | `/x/` root + **-n** stops being a separate *titled agenda label* and is only the topic introduce. `/x/` + a non-linker root on **-l** / **-m**, rejected today, becomes valid. Titled numbered points (`x#N` + **-n**) and label cites (`x_…`) never set the topic. |
| [Ordinal pronouns](../grammar/pronouns.md#ordinal-pronouns) | *The whole conversation* becomes *the current topic stretch*, and the topic is skipped. |
| Reflexive | With Azawan as topic, *Azawan sees themself* is `zozan vahahal dozan.`; `daxer` still works. |
| [Speech moves](../grammar/speech-moves.md) | A topic change never changes the speech move: `/x/` continues it, so `xazawan` mid-question is *and about Azawan, …?*. A new move (`/y/`) does not clear the topic. Vocatives call someone; they do not make them the topic. The topic is shared across speakers. A goodbye ends the conversation and clears it. |
| [Plurality](../grammar/plurality.md) | **-x** becomes valid on `/x/` nouns and resumes (today it is rejected on `/x/`). Joined names (`xazawan xalahen xal`) still read as a clause join; use **-x** or a group noun. |
| [Of-relations](../grammar/relations.md#of-relations) | `em bozan` is *the topic's*, stable across roles. |
| [Holder seam](../grammar/knowing.md#holder) | The topic pronoun can be the holder. |
| [Prosody](../grammar/dependents.md#orthography-and-prosody-periods) | New row: topic-setting `/x/` word, pitch reset, speech move kept. |
| D-13 (long *I* / *you*) | A participant becomes the topic only through an overt `/x/` word; see [speaker or listener as topic](#speaker-or-listener-as-topic). Note in D-13 that `zozan` can be a short *I* / *you* inside such a stretch. |
| Recipe track | On absorb, add *now, about X*, *speaking of X*, *back to X*, *what are we talking about?* to [english.md](../grammar/english.md) beside the *regarding* row. |

## Why this matters for learners

- **Topic drift becomes visible.** Every change of topic is an overt word, so *who changed the subject, and when* has an answer. A side topic is admitted (`xavazem`), and the return is spelled out (`xazawar`), never assumed. That fits the rationality theme: derailing and whataboutism are easier to notice when the topic cannot change silently.
- **Tools can segment by topic.** A transcript splits into topic stretches mechanically, with the speaker who opened each one.
- **Small numbers.** Counting restarts with each topic, and the topic itself never needs counting.

## Parser and tooling

- `/x/` + a non-linker root on **-l** / **-m** becomes valid, and **-x** becomes valid on `/x/` nouns and resumes.
- The resolver tracks one topic per conversation: set by `/x/` introduce or noun-antecedent **-r**, cleared by `xevavem`, `xavazem`, and goodbye. Each change starts a stretch that resets the ordinal count, role-pointer anchors, and ambient magnitude. The topic referent never takes an ordinal.
- Topic words (introduce, return, `xevavem`, `xavazem`) stay sentence-initial only, as all `/x/` root words are today ([sentence linkers](../grammar/dependents.md#sentence-linkers)), so they are already rejected after a clause join and inside a dependent. Inside an aside they are also rejected.
- Quotes open with no topic and their own count; asides inherit. Neither leaks.
- Whole-stem **-r** outside a quote searches quote interiors; **-r** inside a quote searches only that quote.
- A lone topic word with a period is a whole sentence. The topic word takes adjectives and hooks like any noun (today `em` + `/b/` after it is rejected).
- Returning to the current topic starts a new stretch.
- ⭐ `oza` becomes a marked pronoun row (`MARKED` in [`src/lexicon-place.ts`](../../src/lexicon-place.ts), [`src/closed-roots.ts`](../../src/closed-roots.ts)), taught on the pronouns page, with morph gloss `TOPIC`. It is rejected when no topic is set. `hahehom` glosses as `as-for`.
- The lexicon pass shared with `generic-pronoun.md` is in [implementation](#implementation).

## Implementation

One lexicon pass covers this proposal and `generic-pronoun.md`. Root spellings come only from `convert-word`, never by hand ([lexicon editing](../meta/lexicon.md)).

1. **Mark the new pronoun rows.** Add ⭐ *star* and 🧑 *person* to `MARKED` (`pronoun`) in [`src/lexicon-place.ts`](../../src/lexicon-place.ts), and add both to [`src/closed-roots.ts`](../../src/closed-roots.ts) so code never spells the roots. Marked rows are placed on three-letter roots, so both pronouns are two syllables.
2. **Respell.** Run `npm run convert-word -- --lexicon --only` with:
   - 🧑 *person*, which gains a three-letter root (today five letters, so `zebezan` is three syllables);
   - every row that still has a three-letter root but no overlay and no mark, so it goes back to five letters (a three-syllable word). Today these are 💦 *sweat*, 👥 *silhouettes*, 🐹 *hamster*, 🍎 *apple*, 🌶️ *pepper*, 🥦 *broccoli*, 🌐 *globe*, ⛅ *cloudy*, 🥼 *lab-coat*, 💊 *pill*, ☯️ *yin-yang*, 🔁 *repeat*. Recompute the list just before the run: a row is short exactly when it has a non-join overlay or is marked, and is not in `FORCE_LONG`.

   ⭐ *star* keeps `oza`; it is already short and becomes marked.
3. **Retie.** `npm run retie-docs` (dry run), read the review list and warnings, then `npm run retie-docs -- --write`, `npm run build`, and `npm test`. The respelling of 🧑 reaches every use of *person*, *humanity*, and the address form `yebezanx.`; the twelve lengthened rows reach their ordinary uses.
4. **Proposals.** `retie-docs` does not cover `docs/proposals/`, so respell the 🧑 forms in this file and `generic-pronoun.md` by hand to the new root.
5. **Parser and grammar.** Then the parser changes listed under [parser and tooling](#parser-and-tooling), shipped with the matching grammar-page edits.

## Open questions

None open. Decided in review: `/x/` is the only setter; the topic never takes an ordinal and is always the `oza` pronoun; introduce, return, and clear reset the count, role-pointer anchors, and ambient magnitude; returning to the current topic resets too; **-x** on `/x/` and on the pronoun; participants can be the topic; topic words never inside dependents or asides; quotes start with no topic and do not leak; resumes reach into quotes but not out; a lone topic word is a sentence; the topic word takes adjectives and hooks; agenda labels merge into introduce; pitch reset on topic words; `hahehom` glosses as `as-for`; `ehodo` is always the actual listener (generic *one* in `generic-pronoun.md`).

## Non-goals

- Inferring the topic from salience, frequency, or position.
- A default topic. Only `/x/` sets one.
- A topic stack. Returns are always explicit.
- Changing whole-stem resume.
- First- and second-person pronouns.
- Teaching any of this on grammar pages while it stays a proposal.

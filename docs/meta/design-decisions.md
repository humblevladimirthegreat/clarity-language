# Design decisions

Editors only — not linked from grammar pages. This page answers **why the language does not do X**, or **why this reading over another**, when no teaching page shows it. Do not re-raise these as gaps or inconsistencies.

**What belongs here:**

- **A deliberate omission with its reason.** The reason must say what a reading would cost: it would collide with a live reading or spelling, break a stated invariant (one parse, one topic position, a warrant for others' views), or work against the project's aims.
- **A rejected alternative and why**, when the grammar page presents only the current choice.

**Two ways to say one thing are fine.** Repeating another route is not a cost. When a form is intuitive and would arise naturally (a learner builds it from rules they already know, for a job they have), allow it even if another form says the same thing. Banning it would be the counterintuitive choice, so it needs a cost from the list above.

**What does not:**

- **A rule a grammar page already teaches.** That includes omissions the page states (*there is no X; use Y*). Delete the entry.
- **A settled reading.** Once a reading is settled, teach it on its owning grammar page in the same change. Never park it here.
- **A spelling that just has no good reading.** *No English job*, *no guessable reading*, or *no learner would reach for it* is not a decision. Those forms are **open** in [unassigned-reserved.md](unassigned-reserved.md), even when the parser rejects them. *Another route already covers it* is no reason to keep a form out at all (above).
- **Spelling inventories.** One example per entry at most. Every closed spelling is listed in [unassigned-reserved.md](unassigned-reserved.md) with its D-id.
- **An English job with a route and no omitted form.** That goes on the [recipe track](grammar-docs.md#recipe-track).

IDs are stable (code and other meta pages cite them). Retired IDs are not reused.

## By design

| ID | Decision | Reason | Owning page |
|----|----------|--------|-------------|
| D-10 | Every offset from now sits on an evidential, a forecast (channel + `b+`) or a PLAN; a wrong sign on a one-way channel is not a sentence. A signed offset in a time pole's `/b/` needs a command, a request, a PLAN, or a channel. In as-of `/b/` it is allowed only on stance as-of (`thuhum` / `thuram`), which dates the stance; `huhum` / `huram` / `wuhum` keep dates, event nouns and `barl` clauses. Absolute dates need no channel | a bare *earlier* / *now* / *later* would date an event without saying how you know it, which is the job verbs without tense leave to the channels | knowing.md |
| D-16 | No root for a bare evaluative (*good*, *bad*, *nice*, *great*, *terrible*, *quality*, *effective*, *practical*, …) | a bare evaluative hides **whose** need it serves and **what bar** it is measured against, which the language wants audible. Applies to bare evaluatives only: a root whose sense is a quality (delight, beauty, anguish, safety) stays, and scale adjectives (*expensive*, *thick*) take a bar. When a learner needs a new quality, add a root for that quality, not for the evaluation | sakes.md, say-reasons.md |
| D-18 | No *he* / *she* / *it* (a short pronoun split by gender or animacy) | a single *it* would give up mechanical matching, and a gender split conflicts with the project's aims. Short reference is a role pointer or a tag the speaker assigns | pronouns.md |
| D-20 | The topic is set only by an overt `/x/` word, never inferred from salience, first mention, or subjecthood, and there is no topic stack: every return is spelled out (`xazawar`). Topic words never sit in a dependent, after a clause join, or in an aside; a quote keeps its own topic and tags | every tool computes the same topic at every point, from the words alone | pronouns.md |
| D-22 | A hosted `/b/` after `/z/` / `/d/` / `/v/` / `/w/`; a dropped subject read as the topic | the `/b/` there is already the unhosted recipient. A dropped subject stays unmentioned, and the topic doer is written `zozan` (D-20) | clause.md, pronouns.md |
| D-23 | `~` as a tone mark; a third copy of a mark (`!!!`, `???`) | `~` is the opaque marker. Marks stack freely, but two of a kind is the most: a third level would need a voice difference a listener can hear, and none is named yet. Parser: `toneStack` | speech-moves.md |
| D-24 | A role pointer or a tag pronoun on `/y/` or `/x/` (`yaxar`, `xaxar`, `ywar`, `xwar`) | a call or a topic return names the stem (`yazawar`, `xazawar`), so the listener and every tool read one topic from the words alone (D-20) | pronouns.md |
| D-28 | Any span under `/w/` | a degree word is a closed class, so it has no loan reading | spans.md |
| D-31 | A topic-only question (`yol xazawan.`); a polar word before an act word, or two in a row (`yael yal`, `yael yuel`) | `yol xazawan.` would reset the topic for a throwaway *And you?*, which `yol zazawan zam.` says without side effects (D-20). A polar word is one answer, so an answer and a question are two turns. Parser: `polarOrder` | questions.md |
| D-32 | A stand-in on `/ɡ/` (`garl`); a linker and a topic word in one sentence (`xezom xazawan …`) | a stand-in on `/ɡ/` would let a clause modify a noun, against the [which-noun](../grammar/dependents.md#which-noun) rule; *the fact that* is a predicate with a `/z/` stand-in, or two sentences. One `/x/` word opens a sentence, so every tool reads the topic from one position (D-20). Parser: `standInRole` | dependents.md |
| D-33 | A bare `/ɡ/` right after the verb as a depictive or resultative (`zalahen vedabal gadadal.`); `gugon` / `gugor` as identity | after an object noun a trailing `/ɡ/` is that noun's own adjective, so the rule could only be subject-only and asymmetrical. `gugon` / `gugor` are the ordinary root *coin* as a name / resume. Parser: `predicateAfterVerb` | predication.md |
| D-34 | A role compound or a social tie on `/h/` (*as a teacher* as `haxedehol`, *as a friend of Azawan* as `hemezem bazawan`) | `/h/` already means manner, so each would share a spelling with the manner word (*in a teacherly way*, *companionably*); say the role in its own clause (`zamun gaxedehol. zamur …`). Parser: `roleCompoundSlot` | roles.md, relations.md |
| D-35 | A mirative, deontic or consent overlay on `/w/` (`wezul`, `wedem bazawan`); PLAN, DECISION, ATTEMPT or WANT on `/w/`; a clause pole on `/w/` or `/h/` (`woyem`, `hoyem` as *in case*) | on `/w/` those spellings are their roots' ordinary words (`wezum` *surprisingly*, `wedem` *forbiddenly*, `wamam` *as planned*, `wehum` *decidedly*, `wudum` *tentatively*, `wohum` *wishfully*, `woyem` *opportunely*). A deontic **-m**, the intention moods, and a pole each need a `/b/`, and `/w/` takes none; an intention mood before an adjective would also split its holder between the subject and that adjective's noun. *In case of rain* is `thoyem berehel` | knowing.md, intention.md, causation.md, sakes.md |
| D-36 | **-n** on a sake word (`ganathan`) | `ganathanar` would read as a viewpoint lateral | sakes.md |
| D-37 | **-x** on a `/th/` stance word (`thovumx` as *we may*) | it would hand the stance to the speaker's associates without saying how you know they hold it. Someone else's view goes through a holder, whose host is that warrant (`thunemazawanx`). Parser: `pluralOnPos` | plurality.md, knowing.md |
| D-38 | `th#1` as *first-hand* (`threwol`) | first-hand is a live look or a memory, and the channels keep those apart because a memory can be wrong; a bare *first-hand* would claim the warrant without saying which | knowing.md, numbers.md |
| D-39 | A single-item clause join (`A xul` *not the case that A*) | said aloud, `A xul.` before a new sentence `B` sounds like `A xul B` (*neither A nor B*) when the pause is missed, which flips the next claim. Deny or single out the verb or noun (`vowogal vul`, `zazawan zal`). Parser: `clauseSingleItem` | joins.md |
| D-40 | A bare role compound is not a kind or occupation (`zaxedehol` is *someone who teaches*; *a teacher* is `zaxedehothel`) | a kind reading by default turns one act into a claim about someone's nature (*one fight makes a fighter*), the shortcut label scope exists to slow down. The usual role takes practiced-role **`the`**, so the trait is chosen, not implied. Rejected: kind by default with scope only to narrow it, and a kind reading only on `/ɡ/` (the same word would then reach differently by slot) | roles.md |
| D-41 | `th#N` after LIVE or MEMORY (`thodom thredul`) | the number counts hands between the event and you, and these channels are first-hand by definition (same reason as D-38), so the pair contradicts itself. The count is of hands on the evidence, never reasoning steps (CLUES) and never reliability (the channel ending). Parser: `handDepthChannel` | knowing.md, numbers.md |
| D-42 | `/th/` on the record or scroll root (`therem`, `thozem`) | either would be read as a channel, and each bundles jobs the six channels keep apart: footage is your own senses (LIVE / MEMORY, and footage you watched can be misremembered), a document is someone else's word (REPORTED), a schedule is a PLAN, and a tale is NOTIONAL when made up or REPORTED when passed on as true. A stance word on these roots would blur exactly those lines. Parser: `retiredChannelRoot` | knowing.md |
| D-43 | A `/b/` hosted by a call or reaction (`yuhohul bazawan` as *hooray for Azawan*) | a `/b/` right after a `/y/` word opens the body as the person who receives (*Alahen, tell Azawan …*), a natural order after a call; hosting it would take that away. A reaction's target already has hook + `/b/` (`yuhohul el bazawan`). A `gl-` adjective before the call or reaction still hosts its own `/b/` | speech-moves.md |

## Rejected alternatives

### Comparison bars

**No named -n bars.** A closed list of standards (root + **-n** under `/z/` `/d/` `/b/`) repeated what the stance words already say. It also hid *how you know* the standard, and it needed a placement rule to keep sake bars apart from judgment bars. Each old bar maps onto a stance:

| Old bar | Say instead |
|---------|-------------|
| Typical, Average, Social / Professional, Everyone | PATTERN `thobam` (population in `/b/` when needed), REQUIRE for a custom or rule, or a superlative |
| my standard | REQUIRE `thumem`, or the attitude `thevegem` |
| Best-effort | ABIL `thezexal` |
| the nine sake bars | the met sake word (`thegatham`, `thoyutham`, …) |

### Contrary to a stance (`uem`)

The stance after `uem` must have content the event can contradict: a norm, an intention, a wish, a report, or an expectation. The parser rejects other stances (`frameKind`). Those cells are open in [unassigned-reserved](unassigned-reserved.md).

### Whose want, plan, or decision

A plan with both an owner and a date keeps the person in PLAN's hosted `/b/` and puts the date on a time pole (`huwem bral`). Rejected:

- **A holder seam (`thamamalahen`).** A seam grants access to someone's view and hands them the whole clause.
- **A person + time join in the one slot.** That puts two kinds in one slot.

### Stand-in dependents

A dependent runs to the end of the written sentence, so `dorl P xol Q` is *whether P or Q*. Rejected: a join that closes everything before it, main clause included. That left *whether P or Q* with different subjects no route except asking the question and pointing back with `dorth`.

### Channel frames

- **No reset at every turn.** A bare answer, a tag, a call, an interjection, and a narrator's own question all sit inside a story. A question or command already keeps the frame off its own body (a channel in a question is the listener's grounds), so it needs no reset to stay clear of it.
- **No reset at a topic change.** A story moves from one person to the next; topics keep no stack, so a return could not restore the frame; and `xevavem` *next* is how a narrative sequences. Only `xavazem` *by the way*, a digression, ends it.
- **No frame shared across speakers.** A frame is one speaker's evidence. A reply that ended it would cut off a story the first speaker is still telling, and a reply that inherited it would claim evidence the replier does not have.
- **No carried frame for a time pole's offset.** A signed offset on a pole still needs a channel in its own clause, so each clause shows its warrant to a reader who starts there.

### Holders

- **No free holder word or hosted `/b/` holder.** Fusing the holder onto a warrant makes a warrant-less attribution unwritable, even where no parser checks it.
- **No `th` seam (`thunethazawan`).** It drops the grade. A consonant + `th` cluster (`thevemthazawan`) is illegal mid-word.
- **Recognition by spelling.** A `/th/` word that begins with a closed host root, then `l` / `m` / `r`, then a vowel, is a holder. This is safe only while no published root has that shape: respell a new root of that shape rather than add a special case.

### General claims

- **No universality moods** (COMMON, UNCOUNTERED, FORMAL, NATURAL, RULE: `ogade` / `ebeza` / `oza` / `abovu` / `obebe` on `/th/`). Each mixed two jobs the language keeps apart: how far a claim reaches is the fence or restrictor, and what it rests on is a channel.
- **Open -m never asserts an amount.** Rejected: *just about everything* / *hardly anything* for the empty forms (`zam`, `zuam`, `ham`, …). Those readings assert an amount -m never states, and they made the counting forms read unlike deny, menu, and rank. Agazan does not split *I have not checked* from *I know of exceptions but am not listing them*.
- **The kind itself is `zuan` + SHARED kind.** Rejected:
  - `zalebam` + kind: it names the label or category, not the lineage (*the cat category was domesticated* is wrong).
  - **-n** on the kind root: `zagadun` is a creature named Cat.
  - **-nx**: a named team.
  - Recipes alone: *domesticated*, *invented* and *evolved* do not reduce to claims about members.

### Names and their instances

One of a name is **-ln** (span `^@`). Rejected:

- **-l:** on a native root it is already the root's own sense (`dazawal` *a swan*).
- **-nx:** it is *name and associates*.
- **`dar` + `/ɡ/`:** under `yol` the join **-r** becomes a fill-ask blank.

### Multipart names

A full name is the given name plus a family name on `/ɡ/` + **-n** ([word-endings.md](../grammar/word-endings.md#multipart-names)). Rejected:

- **`/v/`, `/h/`, `/w/` or `/th/` + -n as a name part:** each works on the whole clause and already has its own **-n** reading (a titled event, a named standard, a named scale), so a name like *Agave Owoga* on `/v/` would read as *Agave performs Owoga*. Names with grammar inside are titled phrases or spans.
- **`/ɡ/` + -m for belonging to a family:** **-m** is a root's published abstract sense, so a family-name root on **-m** could not be told from that sense. Belonging uses *whose* (`em` + the family).
- **`/ɡ/` + -n never hosts a `/b/`:** hosting is decided by position alone. An exception for one ending would fix only this case while every trailing adjective keeps the same trap; the recipient's usual place after the verb avoids it.
- **The length bid on the family name:** **`x`** + vowel on `/ɡ/` is ability, so the bid goes on the given name.

### Spans

**A span is written only.** The spoken open, close and resume served only speech-to-text, which does not exist, and they cost the TYPE and EDGE vowels, three close words and a spoken `/y/` span. Revisit only with real speech-to-text.

### Stacked vowels

Only the six standard stacks exist (`ao` `ua` `uo` `ae` `oe` `ue`). A reversed or extra pair is too easy to confuse by ear with its standard twin (`eo` vs `oe`). The former reversed-sequence join `eo` was removed for this reason.

### Closed-root endings

- **-r on a closed root** is the family's own **-r** where it defines one (a settled-to-passing grade, or the *because* share). Everywhere else it is the whole-stem resume (`thoyer` *in that case*), so giving such a family an **-r** grade would take away a live reading.
- **-n on a mood root** is an ordinary proper name. There is no named-mood overlay.
- **-n on `/y/`** calls someone, so the act and polar series have no named-formula interjection.
- **-r on the act series** is the *for now* act (`yar` *as things stand*), so no `/y/` word is a fill-ask blank for the act itself (*are you asking or telling?*).

### Hooks and relations

- **`oel` stays** although `al` already spans numbers. For other nouns, *A, including B* depends on whether A names a group, which the syntax cannot see.
- **No `el` / `em` / `er` possession series by time horizon** (`rejected/el-em-er-possession.md`).
- **Stacked role vowels:** co-agent, opponent and beneficiary were not given a stack. Co-agent is rare as a kind and the join-relation *with* covers it; an opponent is usually `u`; a beneficiary overlaps recipient `o`, and *for* is the hook `el`.

### Sake inventory

- **Understanding is its own sake, not part of competence.** Boredom with an easy task is competence met and understanding unmet, and the two call for different help. Novelty for its own sake stays under pleasure.
- **Surprise is not a sake.** It is the MIRATIVE (`thezum`), a closed `/th/` mood apart from the eight channels: it says nothing about how you know and stacks with a channel.

### Experiencer adjectives

No adjective for someone else's feeling: it would bypass the holder warrant. A noun before a lone feeling is an existence clause, so `zalahen thulothuruor` is *anxious that Alahen is here*. Someone else's objectless feeling goes through a holder (`thulothuruor thunemalahen`).

### Denying a list

A **u** join after a closed list denies the list as a whole: it is single-item *not X*, with the list as X (`val vul` *not both*). The rejected reading denied each item and kept the list's vowel. It made `val vul` a second *neither*, it made `vol vul` say the same as plain `vol`, and it left *not both* with no form.

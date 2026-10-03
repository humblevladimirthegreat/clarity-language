# Design decisions

Editors only — not linked from grammar pages. This page answers **why the language does not do X**, or **why this reading over another**, when no teaching page shows it. Do not re-raise these as gaps or inconsistencies.

**What belongs here:**

- **A deliberate omission with its reason.** The reason must say what a reading would cost: it would collide with a live reading or spelling, break a stated invariant (one parse, one topic position, a warrant for others' views), or work against the project's aims.
- **A rejected alternative and why**, when the grammar page presents only the current choice.

**What does not:**

- **A rule a grammar page already teaches.** That includes omissions the page states (*there is no X; use Y*). Delete the entry.
- **A settled reading.** Once a reading is settled, teach it on its owning grammar page in the same change. Never park it here.
- **A spelling that just has no good reading.** *No English job*, *no guessable reading*, *adds nothing*, or *another route already covers it* is not a decision. Those forms are **open** in [unassigned-reserved.md](unassigned-reserved.md), even when the parser rejects them.
- **Spelling inventories.** One example per entry at most. Every closed spelling is listed in [unassigned-reserved.md](unassigned-reserved.md) with its D-id.
- **An English job with a route and no omitted form.** That goes on the [recipe track](grammar-docs.md#recipe-track).

IDs are stable (code and other meta pages cite them). Retired IDs are not reused.

## By design

| ID | Decision | Reason | Owning page |
|----|----------|--------|-------------|
| D-10 | Every offset from now sits on an evidential, a forecast (channel + `b+`) or a PLAN; a wrong sign on a one-way channel is not a sentence. A signed offset in a time pole's `/b/` needs a command, a request, a PLAN, or a channel. In as-of `/b/` it is allowed only on stance as-of (`thuhum` / `thuram`), which dates the stance; `huhum` / `huram` / `wuhum` keep dates, event nouns and `barl` clauses. Absolute dates need no channel | a bare *earlier* / *now* / *later* would date an event without saying how you know it, which is the job verbs without tense leave to the channels | knowing.md |
| D-13 | *speaker* **`amago`** and *listener* **`ehodo`** are five letters on purpose (`FORCE_LONG` in `src/lexicon-place.ts`); inclusive *we* **`aha`** stays short. The topic pronoun (`zozan`) is a short *I* / *you* only inside a stretch the speaker overtly made about themself (`xamagon`, `xehodon`) | a short *I* / *you* would make self-reference the easiest choice; names or a dropped subject should be easier | pronouns.md |
| D-16 | No root for a bare evaluative (*good*, *bad*, *nice*, *great*, *terrible*, *quality*, *effective*, *practical*, …) | a bare evaluative hides **whose** need it serves and **what bar** it is measured against, which the language wants audible. Applies to bare evaluatives only: a root whose sense is a quality (delight, beauty, anguish, safety) stays, and scale adjectives (*expensive*, *thick*) take a bar. When a learner needs a new quality, add a root for that quality, not for the evaluation | sakes.md, say-reasons.md |
| D-18 | No *he* / *she* / *it* (a short pronoun split by gender or animacy) | a single *it* would give up mechanical matching, and a gender split conflicts with the project's aims. Short reference is a role pointer; pointers are third person only (D-13) | pronouns.md |
| D-20 | The topic is set only by an overt `/x/` word, never inferred from salience, first mention, or subjecthood, and there is no topic stack: every return is spelled out (`xazawar`). Topic words never sit in a dependent, after a clause join, or in an aside; a quote keeps its own topic and count | every tool computes the same topic at every point, from the words alone | pronouns.md |
| D-22 | A hosted `/b/` after `/z/` / `/d/` / `/v/` / `/w/`; a dropped subject read as the topic | the `/b/` there is already the unhosted recipient. A dropped subject stays unmentioned, and the topic doer is written `zozan` (D-20) | clause.md, pronouns.md |
| D-23 | Combined tone marks beyond `?!` (`!?`, `%!`); `~` as a tone mark | an open stack grammar would make `!?` and `?!` two spellings of one sound; mix tones by marking a word inside a marked sentence. `~` is the opaque marker | speech-moves.md |
| D-24 | A role pointer or an ordinal pronoun on `/y/` or `/x/` (`yaxar`, `xaxar`, `yredur`) | a call or a topic return names the stem (`yazawar`, `xazawar`), so the listener and every tool read one topic from the words alone (D-20) | pronouns.md |
| D-28 | Any span under `/w/` | a degree word is a closed class, so it has no loan reading | spans.md |
| D-31 | A topic-only question (`yol xazawan.`); a polar word before an act word, or two in a row (`yael yal`, `yael yuel`) | `yol xazawan.` would reset the topic for a throwaway *And you?*, which `yol zazawan zam.` says without side effects (D-20). A polar word is one answer, so an answer and a question are two turns. Parser: `polarOrder` | questions.md |
| D-32 | A stand-in on `/ɡ/` (`garl`); a linker and a topic word in one sentence (`xezom xazawan …`) | a stand-in on `/ɡ/` would let a clause modify a noun, against the [which-noun](../grammar/dependents.md#which-noun) rule; *the fact that* is a predicate with a `/z/` stand-in, or two sentences. One `/x/` word opens a sentence, so every tool reads the topic from one position (D-20). Parser: `standInRole` | dependents.md |
| D-33 | A bare `/ɡ/` right after the verb as a depictive or resultative (`zalahen vedabal gadadal.`); `gugon` / `gugor` as identity | after an object noun a trailing `/ɡ/` is that noun's own adjective, so the rule could only be subject-only and asymmetrical. `gugon` / `gugor` are the ordinary root *coin* as a name / resume. Parser: `predicateAfterVerb` | predication.md |
| D-34 | A role compound on `/h/` (*as a teacher* as `haxedehol`) | `/h/` already means manner, so it would share a spelling with *in a teacherly way*; say the role in its own clause (`zamagon gaxedehol. zamagor …`). Parser: `roleCompoundSlot` | roles.md |
| D-35 | A mirative, deontic or consent overlay on `/w/` (`wezul`, `wedem bazawan`); PLAN, DECISION, ATTEMPT or WANT on `/w/`; a clause pole on `/w/` or `/h/` (`woyem`, `hoyem` as *in case*) | on `/w/` those spellings are their roots' ordinary words (`wezum` *surprisingly*, `wedem` *forbiddenly*, `wamam` *as planned*, `wehum` *decidedly*, `wudum` *tentatively*, `wohum` *wishfully*, `woyem` *opportunely*). A deontic **-m**, the intention moods, and a pole each need a `/b/`, and `/w/` takes none; an intention mood before an adjective would also split its holder between the subject and that adjective's noun. *In case of rain* is `thoyem berehel` | knowing.md, intention.md, causation.md, sakes.md |
| D-36 | **-n** on a sake word (`ganathan`) | `ganathanar` would read as a viewpoint lateral | sakes.md |

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

### Spans

**A span is written only.** The spoken open, close and resume served only speech-to-text, which does not exist, and they cost the TYPE and EDGE vowels, three close words and a spoken `/y/` span. Revisit only with real speech-to-text.

### Stacked vowels

Only the six standard stacks exist (`ao` `ua` `uo` `ae` `oe` `ue`). A reversed or extra pair is too easy to confuse by ear with its standard twin (`eo` vs `oe`). The former reversed-sequence join `eo` was removed for this reason.

### Closed-root endings

- **-r on a closed root** is the family's own **-r** where it defines one (a strong-to-light grade, or the *because* share). Everywhere else it is the whole-stem resume (`thoyer` *in that case*), so giving such a family an **-r** grade would take away a live reading.
- **-n on a mood root** is an ordinary proper name. There is no named-mood overlay.
- **-n on `/y/`** calls someone, so the act and polar series have no named-formula interjection.

### Hooks and relations

- **`oel` stays** although `al` already spans numbers. For other nouns, *A, including B* depends on whether A names a group, which the syntax cannot see.
- **No `el` / `em` / `er` possession series by time horizon** (`rejected/el-em-er-possession.md`).
- **Stacked role vowels:** co-agent, opponent and beneficiary were not given a stack. Co-agent is rare as a kind and the join-relation *with* covers it; an opponent is usually `u`; a beneficiary overlaps recipient `o`, and *for* is the hook `el`.

### Sake inventory

- **Understanding is its own sake, not part of competence.** Boredom with an easy task is competence met and understanding unmet, and the two call for different help. Novelty for its own sake stays under pleasure.
- **Surprise is not a sake.** It is the MIRATIVE (`thezum`), a closed `/th/` mood apart from the eight channels: it says nothing about how you know and stacks with a channel.

### Experiencer adjectives

No adjective for someone else's feeling: it would bypass the holder warrant. A noun before a lone feeling is an existence clause, so `zalahen thulothuruor` is *anxious that Alahen is here*. Someone else's objectless feeling goes through a holder (`thulothuruor thunemalahen`).

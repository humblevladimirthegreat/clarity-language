# Interpreter

<!-- retie: skip -->

**Status:** DRAFT (classification for clause structure, hooks, hinges and dependents, causation, knowing, residue, intention; the rest is marked `R1b`)  
**Design authority:** [`docs/grammar/`](../grammar/introduction.md). The reader copies what the parse tree and the resolve stage already say; it never re-derives a reading.

The interpreter turns a parse into **readings**, one per clause, so tools can compare, show, or check what a text says without walking the parse tree for meaning. This note owns the terms, the frame families, the classification table every reader switches on, the links, the scope statements copied from the grammar pages, and the reader rules. Every row cites the grammar anchor that decides it; a row with no anchor is still to be classified. The parser side is in [parser pipeline](parser-pipeline.md); construction ids come from `constructionRegistry()` in `src/parse/constructions.ts`.

## Terms

| Term | Meaning |
|------|---------|
| **reading** | What one clause says: a claim, its frames, and pointers back into the parse tree |
| **claim** | The bare clause: verb, role-filled arguments, predicate, details |
| **frame** | A construction that changes the claim's truth, force, or owner: speech act, negation, a say word, a stance, a holder, a condition |
| **detail** | A construction that narrows the claim without changing it: place, time, manner, degree |
| **label** | A construction that is part of a word's own wording: an ending, a compound seam |
| **link** | A pointer from one reading to another: a pronoun, a tag, an answer filling a blank, a stand-in |
| **structure** | A key with no meaning of its own: punctuation, the slots that build the claim, and wrappers whose meaning is in the words inside |
| **log** | Readings in order, each with who said it |
| **host** | The tool that supplies the context a reading is run in |
| **whole-clause frame** | A frame whose word reaches the whole clause wherever it sits. Two of these on one clause are a **pair** ([reader rules](#reader-rules)) |
| **adjective reach** | A frame form on `/w/` that reaches only the `/ɡ/` adjective right after it. The tree attaches it to that adjective, so it nests by rule 2 and is never in a pair |

## Frame families

| Family | What it changes | Owning pages |
|--------|-----------------|--------------|
| `hinge` | Ties the claim to a condition, cause, concession, fault, or aim: *if*, *only if*, *iff*, *because*, *although*, *so that*, fault, CAUSE | `causation.md`, `because-and-iff.md`, `fault.md`, `cause.md`, `dependents.md#hinges`, `more-hinges.md#result-hinge` |
| `stance` | How you know the claim or how sure you are: MAY, the channels, deduction | `knowing.md#may`, `knowing.md#live-vs-memory`, `evidentiality.md`, `dated-channel.md`, `usually-vs-must.md`, `universality.md` |
| `holder` | Whose view the clause gives | `holder.md#holder` |
| `intention` | Want, plan, decision, attempt: the claim is a mind's aim or an attempt, not a plain event | `intention.md#plan`, `want-and-decide.md`, `try.md#try` |
| `ability` | Can / can't for the whole clause, or built into a verb or adjective | `can-and-cant.md#ability`, `can-and-cant.md#ability-fallback`, `can-and-cant.md#intention-adverbs` |
| `phase` | Already, still, not yet, no longer: what holds now against a change | `already-still-yet.md#phasal` |
| `residue` | RESIDUE (outcome still in effect), FORMER (pattern not claimed for now) | `residue-and-former.md#residue-and-former-climate` |
| `notional` | The scene is imagined; no claim it happens | `notional.md#notional-as-if-framing` |
| `mirative` | The claim ran against what you expected | `mirative.md#mirative` |
| `contrary` | The event goes against a plan, a say word, a channel, or a holder's view (`uom` + that word) | `contrary-to.md` |
| `occasion` | Restrictors: only when, never, always, sometimes, the occasion list | `restrictors.md`, `more-occasions.md` |
| `unknown` | A construction with no row | this note |
| `force` | *R1b*: speech act and question type | `speech-moves.md`, `questions.md` |
| `polarity` | *R1b*: negation and polar words | `joins.md#negation-u`, `questions.md` |
| `say` | *R1b*: say words | `permission-consent.md#say-words` |
| `sake` | *R1b*: whose sake or stake | `sakes.md`, `feelings.md` |
| `bar` | *R1b*: than planned, than usual, enough, too | `bars.md` |
| `quote` | *R1b*: quoted speech | `spans.md` |
| `binder` | *R1b*: universals and bound tags | `universals-domains.md` |

R1a dropped no first-cut family and added `intention`, `ability`, and `residue`: each has whole-clause forms that change the claim and that the first cut did not name. R1b may add families from its pages (speaker attitude is a candidate).

## Classification table

Key types: `unit` is `Unit.kind`; `hookJob` is `HookJob`; `lexReading` is `LexReading`; `wordFamily` is `MorphWordFamily.kind`; `xFamily` is `XFamily`; `overlay` is overlay `kind` and PoS letter (`overlay:<kind>:<pos>`, with `overlay:<kind>:<pos>:<gloss>` overriding it for one gloss); `joinSeries` is the join series; `anaphor`, `ask`, `answer`, and `shared` are the resolve records (`AnaphorBind` by kind, `AskRecord` by kind, `AnswerRecord`, `SharedRecord` by role); `ending`, `slot`, `edge`, `body`, `reading`, and `word` are keys that only construction ids use (see [construction ids](#construction-ids)). A class of `R1b` means R1b classifies the row.

| Key type | Key | Class | Anchor | Note |
|----------|-----|-------|--------|------|
| unit | `np` | structure | `clause.md#who-acts-and-the-action` | A role phrase: fills `claim.roles` by its role letter |
| unit | `vp` | structure | `clause.md#who-acts-and-the-action` | Fills `claim.verb`; a joined verb list is R1b |
| unit | `predicate` | structure | `predication.md#identity` | Clause-level `/ɡ/`: fills `claim.predicate` |
| unit | `h` | detail:adverb | `clause.md#adverbs-h` | Default for a plain `/h/` word. An `/h/` word with a restrictor, ability, or overlay reading takes that word's row first |
| unit | `linker` | link | `sentence-linkers.md#sentence-linkers` | Points back to the one sentence before the period |
| unit | `hook` | structure | `hooks.md#including-am-al` | Read by its `hookJob` row |
| unit | `writingSpan` | R1b | | |
| unit | `island` | structure | `scope-islands.md#scope-islands` | Nests: a stance inside frames that chunk only (rule 2) |
| unit | `clauseCoord` | structure | `joins.md#clause-joins` | One reading per member (rule 1); the join itself is R1b |
| unit | `gCoord` | R1b | | |
| hookJob | `discourse` | link | `hooks.md#discourse-hooks` | Ties this sentence to prior talk: add, reword, replace, except. With `-r` it points back to an earlier stretch (`discourse-hooks.md#discourse`) |
| hookJob | `clause` | detail:hook | `in-clause-hooks.md#in-clause` | Including, rather, instead, except on a phrase of the clause |
| hookJob | `extraNoun` | detail:place | `extra-noun-hooks.md#extra-noun-stacked-vowels-and-loose-m` | On, through, using, near: a landmark for the clause or a hosted landmark; `hooks.md#since` is the time case |
| hookJob | `genitive` | detail:relation | `social-ties.md#genitive` | `om` + `/b/` on the noun to its left: a detail of that term |
| hookJob | `stray` | structure | `social-ties.md#genitive` | Rejected by enforce; never reaches a reading |
| hookJob | `span` | detail:range | `ranges.md#ranges` | A hook between two endpoints of one kind |
| hookJob | `resume` | link | `in-clause-hooks.md#hook-resume` | `-r` hook: points back to a landmark |
| hookJob | `zone` | frame:contrary | `contrary-to.md#contrary-to-stance` | `uom` + the stance it holds as the opposing zone; that stance is the frame's `content`, not a frame on the claim |
| lexReading | `ordinary` | structure | `clause.md#who-acts-and-the-action` | Read by its PoS slot |
| lexReading | `sake` | R1b | | |
| lexReading | `ability` | frame:ability | `can-and-cant.md#ability` | |
| lexReading | `greeting` | R1b | | |
| lexReading | `restrictor` | frame:occasion | `restrictors.md#only-when-never-hal` | `/h/` limits the whole clause; `/w/` limits one adjective (`restrictors.md#on-the-following-adjective-w`) |
| lexReading | `overlay` | structure | `parser-pipeline.md#overlay-kinds` | Read by its `overlay` row |
| lexReading | `mention` | R1b | | |
| lexReading | `sameRole` | detail:time | `same-role-words.md#before-and-after` | `A CITE B`: before, after, while, like between two phrases of one role |
| lexReading | `join` | R1b | | |
| lexReading | `standIn` | link | `dependents.md#dependent-clauses` | The slot a dependent fills; the dependent is a nested reading |
| lexReading | `standInNamed` | link | `stand-in-roles.md#stand-in-roles` | |
| lexReading | `standInBack` | link | `stand-in-vowels.md#stand-in-back` | `-rth`: points back to an earlier sentence |
| lexReading | `listVerb` | R1b | | |
| lexReading | `joinRelation` | R1b | | |
| lexReading | `number` | R1b | | |
| lexReading | `unknown` | frame:unknown | | Also an `unread` entry |
| wordFamily | `content` | structure | `phonology.md#word-edges` | Read by its `lexReading` |
| wordFamily | `number` | R1b | | |
| wordFamily | `x` | structure | `compounds.md#two-roots-one-word` | Read by its `xFamily` |
| wordFamily | `hook` | structure | `hooks.md#including-am-al` | Read by its `hookJob` |
| wordFamily | `hookCompound` | label | `hook-compounds.md#hook-compounds` | |
| wordFamily | `joinMarker` | R1b | | |
| wordFamily | `writingSpan` | R1b | | |
| wordFamily | `foreign` | R1b | | |
| wordFamily | `tag` | R1b | | |
| wordFamily | `say` | R1b | | |
| xFamily | `role` | label | `roles.md#role-compounds` | |
| xFamily | `pointer` | R1b | | |
| xFamily | `hookPrefix` | label | `hook-compounds.md#hook-prefixes` | |
| xFamily | `sake` | R1b | | |
| xFamily | `scope` | label | `label-seams.md#label-reach` | How far a label reaches |
| xFamily | `lateral` | label | `viewpoint.md#viewpoint-laterals` | |
| xFamily | `holder` | frame:holder | `holder.md#holder` | Fixed by word shape: the seam sits on its stance; `party` is the holder |
| xFamily | `ability` | frame:ability | `can-and-cant.md#ability` | Inside the verb or adjective word; reaches that word's claim |
| xFamily | `numeric` | R1b | | |
| xFamily | `compound` | label | `compounds.md#two-roots-one-word` | |
| overlay | `sake:th` | R1b |  |  |
| overlay | `sake:w` | R1b |  |  |
| overlay | `evidential:th` | frame:stance | `knowing.md#live-vs-memory` |  |
| overlay | `evidential:w` | frame:stance | `universality.md#mood-on-one-adjective` | adjective reach |
| overlay | `mirative:th` | frame:mirative | `mirative.md#mirative` |  |
| overlay | `residue:h` | frame:residue | `residue-and-former.md#residue-and-former-climate` |  |
| overlay | `residue:w` | frame:residue | `universality.md#mood-on-one-adjective` | adjective reach |
| overlay | `former_climate:h` | frame:residue | `residue-and-former.md#residue-and-former-climate` |  |
| overlay | `former_climate:w` | frame:residue | `universality.md#mood-on-one-adjective` | adjective reach |
| overlay | `plan:th` | frame:intention | `intention.md#plan` |  |
| overlay | `decision:th` | frame:intention | `want-and-decide.md#decision-revisability` |  |
| overlay | `may:th` | frame:stance | `knowing.md#may` |  |
| overlay | `may:w` | frame:stance | `universality.md#mood-on-one-adjective` | adjective reach |
| overlay | `notional:th` | frame:notional | `notional.md#notional-as-if-framing` |  |
| overlay | `notional:w` | frame:notional | `universality.md#mood-on-one-adjective` | adjective reach |
| overlay | `ability:h` | frame:ability | `can-and-cant.md#ability-fallback` |  |
| overlay | `ability:w` | frame:ability | `can-and-cant.md#ability-fallback` | adjective reach |
| overlay | `identity:g` | structure | `predication.md#identity` | fills `claim.predicate` |
| overlay | `clause_hinge:th` | frame:hinge | `causation.md#if` |  |
| overlay | `clause_hinge:g` | frame:hinge | `causation.md#if` | on a noun; frame by default |
| overlay | `clause_hinge:h` | frame:hinge | `dependents.md#hinges` | whereas, so … that; frame by default |
| overlay | `clause_hinge:*:while` | detail:time | `dependents.md#hinges` | time hinge, any PoS |
| overlay | `clause_hinge:*:until` | detail:time | `dependents.md#hinges` | time hinge, any PoS |
| overlay | `clause_hinge:*:by` | detail:time | `dependents.md#hinges` | time hinge, any PoS |
| overlay | `clause_hinge:*:before` | detail:time | `dependents.md#hinges` | time hinge, any PoS |
| overlay | `clause_hinge:*:after` | detail:time | `dependents.md#hinges` | time hinge, any PoS |
| overlay | `clause_hinge:*:as-of.ledger` | detail:time | `as-of.md#as-of` | as-of, any PoS; on `/th/` it dates the stance |
| overlay | `clause_hinge:*:as-of.bookmark` | detail:time | `as-of.md#as-of` | as-of, any PoS; on `/th/` it dates the stance |
| overlay | `cause:th` | frame:hinge | `cause.md#cause` |  |
| overlay | `cause:w` | frame:hinge | `cause.md#cause` | adjective reach; frame by default |
| overlay | `list_verb:v` | R1b |  |  |
| overlay | `join_relation:g` | R1b |  |  |
| overlay | `join_relation:h` | R1b |  |  |
| overlay | `locative:h` | detail:place | `locative-relations.md#locative-relations` |  |
| overlay | `locative:g` | detail:place | `locative-relations.md#locative-relations` |  |
| overlay | `likeness:h` | detail:likeness | `clause.md#extra-nouns` |  |
| overlay | `likeness:g` | detail:likeness | `relations.md#likeness` |  |
| overlay | `exchange:h` | detail:relation | `relations.md#exchange` |  |
| overlay | `exchange:g` | detail:relation | `relations.md#exchange` |  |
| overlay | `proxy:h` | detail:relation | `relations.md#proxy` |  |
| overlay | `proxy:g` | detail:relation | `relations.md#proxy` |  |
| overlay | `stimulus:g` | R1b |  |  |
| overlay | `of_relation:h` | detail:relation | `of-relations.md#of-relations` |  |
| overlay | `of_relation:g` | detail:relation | `of-relations.md#of-relations` |  |
| overlay | `phasal:h` | frame:phase | `already-still-yet.md#phasal` |  |
| overlay | `phasal:w` | frame:phase | `already-still-yet.md#phasal` | adjective reach |
| overlay | `phasal:th` | frame:phase | `already-still-yet.md#phasal` |  |
| overlay | `attempt:h` | frame:intention | `try.md#try` |  |
| overlay | `want:th` | frame:intention | `want-and-decide.md#want` |  |
| overlay | `pairing:w` | R1b |  |  |
| overlay | `mention:g` | R1b |  |  |
| overlay | `likeness:cite` | detail:likeness | `same-role-words.md#same-role-like` | same-role words |
| joinSeries | `a` | R1b | | |
| joinSeries | `o` | R1b | | |
| joinSeries | `ao` | R1b | | |
| joinSeries | `u` | R1b | | |
| joinSeries | `ua` | R1b | | |
| joinSeries | `uo` | R1b | | |
| joinSeries | `e` | R1b | | |
| joinSeries | `ae` | R1b | | |
| joinSeries | `oe` | R1b | | |
| joinSeries | `ue` | R1b | | |
| anaphor | `content` | R1b | | |
| anaphor | `number` | R1b | | |
| anaphor | `role` | R1b | | |
| anaphor | `pointer` | R1b | | |
| anaphor | `tag` | R1b | | |
| anaphor | `topic` | R1b | | |
| anaphor | `landmark` | link | `hooked-joins.md#hooked-joins` | A hooked join's landmark pointing back |
| ask | `yesNo` | R1b | | |
| ask | `fillAsk` | R1b | | |
| ask | `rhetorical` | R1b | | |
| ask | `none` | R1b | | |
| answer | `answer` | R1b | | |
| shared | `distribute` | R1b | | |
| shared | `collective` | R1b | | |
| shared | `scale` | R1b | | |
| shared | `equative` | R1b | | |
| shared | `kind` | R1b | | |
| shared | `ordinary` | R1b | | |
| ending | `l` | label | `phonology.md#word-edges` | |
| ending | `m` | label | `word-endings.md#abstract-m` | |
| ending | `n` | label | `proper-names.md#name-instance--ln` | Named reference; the term's `named` |
| ending | `ln` | label | `proper-names.md#name-instance--ln` | |
| ending | `r` | R1b | | |
| ending | `rl` | link | `dependents.md#dependent-clauses` | Stand-in for the dependent that follows |
| ending | `rm` | link | `stand-in-vowels.md#stand-in` | |
| ending | `rn` | link | `stand-in-roles.md#stand-in-roles` | |
| ending | `rth` | link | `stand-in-vowels.md#stand-in-back` | |
| slot | `adj` | detail:adjective | `clause.md#adjectives-ɡ` | A `/ɡ/` on a noun: a detail of that term |
| slot | `w` | detail:degree | `clause.md#adjective-detail-w` | A plain `/w/`; a `/w/` frame form takes its `overlay` row with adjective reach |
| slot | `hosted` | structure | `clause.md#extra-nouns` | The hosted `/b/`: its host's landmark or content |
| slot | `gl` | detail:adjective | `left-bound-adjectives.md#left-bound-adjectives` | |
| slot | `asOf` | detail:time | `as-of.md#as-of` | |
| slot | `grounds` | link | `evidentiality.md#evidence-clause` | `blarl`: the next sentence is the content of the frame it hosts on (see [links](#links)) |
| slot | `boundJoin` | R1b | | |
| slot | `tag` | R1b | | |
| slot | `bar` | R1b | | |
| slot | `dependent` | structure | `dependents.md#dependent-clauses` | `Clause.dependent`: a nested reading in the stand-in's term |
| edge | `vocative` | R1b | | |
| edge | `interjection` | R1b | | |
| edge | `polar` | R1b | | |
| edge | `force` | R1b | | |
| edge | `hook` | link | `hooks.md#discourse-hooks` | The left-edge hook; read as `hookJob:discourse` |
| edge | `tone` | R1b | | |
| body | `sentence` | structure | `clause.md#who-acts-and-the-action` | A body and its punctuation |
| body | `fragment` | R1b | | |
| body | `topicMarker` | R1b | | |
| reading | `existence` | structure | `predication.md#existence` | Claim shape: no verb |
| reading | `unsaidEvent` | structure | `predication.md#unsaid-event` | Claim shape: the verb is unsaid |
| reading | `kind` | R1b | | |
| reading | `amountScale` | R1b | | |
| reading | `frequencyScale` | R1b | | |
| reading | `bareQuestion` | R1b | | |
| reading | `greeting` | R1b | | |
| reading | `verbFirstItem` | R1b | | |
| reading | `verbSharedNoun` | R1b | | |
| reading | `fromTo` | R1b | | |
| reading | `feelingLandmark` | R1b | | |
| reading | `feelingStake` | R1b | | |
| word | `plural` | R1b | | |
| word | `hookedJoin` | R1b | | |
| word | `rangeMember` | detail:range | `ranges.md#ranges` | |

## Links

Each link type joins two readings, or a word and a reading. Confirmed against its page:

| Link | Record or key | Anchor |
|------|---------------|--------|
| Pronoun, role pointer, topic pronoun, tag | `AnaphorBind` | *R1b confirms*: `pronouns.md`, `topic.md#topic-pronoun`, `tag-pronouns.md` |
| Landmark pointed back to by a hooked join | `anaphor:landmark` | `hooked-joins.md#hooked-joins` |
| Item shared by a list's members | `SharedRecord` | *R1b confirms*: `list-structure.md` |
| Argument shared by joined verbs | `sharedUnits` on `VpCoord` | *R1b confirms*: `verb-and-stance-joins.md#vp-clause-forms` |
| *Respectively* pairs | | *R1b confirms*: `list-structure.md#respectively` |
| Reply filling a blank | `AnswerRecord` | *R1b confirms*: `questions.md#fill-ask` |
| Stand-in to the dependent it stands for | `lexReading:standIn`, `ending:rl` / `rm` / `rn` | `dependents.md#dependent-clauses`, `stand-in-vowels.md#stand-in`, `stand-in-roles.md#stand-in-roles` |
| Stand-in pointing back to an earlier sentence | `ending:rth` | `stand-in-vowels.md#stand-in-back` |
| Sentence linker to the one sentence before it | `unit:linker` | `sentence-linkers.md#sentence-linkers` |
| What carries past a period | | `sentence-linkers.md#past-a-period` |
| **Added:** discourse hook to prior talk (`-r`: to an earlier stretch) | `hookJob:discourse`, `edge:hook` | `hooks.md#discourse-hooks`, `discourse-hooks.md#discourse` |
| **Added:** in-clause hook pointing back to a landmark | `hookJob:resume` | `in-clause-hooks.md#hook-resume` |
| **Added:** frame content in the next sentence (`blarl`): a hinge's condition, a channel's grounds | `slot:grounds` | `causation.md#if`, `dependents.md#hinges`, `evidentiality.md#evidence-clause` |
| **Added:** a carried frame: a channel, holder, NOTIONAL, or dated offset that goes on over later bare sentences | | `evidentiality.md#carry-forward`, `holder.md#holder`, `notional.md#notional-as-if-framing`, `dated-channel.md#dated-channel` |

The last two shape the reading: a hinge whose condition is `blarl` gets that next sentence's reading as its `content` through the link, and a carried frame appears on a later reading as a link to the reading that set it, never as a copied frame.

## Scope statements

Per family: the forms that reach the whole clause, then every sentence on its pages that states a scope order against another frame, quoted.

### hinge

**Whole clause:** the `/th/` hinges (`overlay:clause_hinge:th`, `overlay:cause:th`). The `/h/` time hinges are details; the `/ɡ/` hinges sit on a noun.

- `dependents.md#hinges`: "*Because* is your stance on why the claim holds, *so that* is your own aim for the event, and *although* is your expectation that the first event would normally have stopped the second, so they take `/th/`."
- `causation.md#if` (against `force`): "A command or request makes no claim, so an *if* hinge on it limits the instruction instead: do this only in that case."
- `because-and-iff.md#only-because` (two hinges): "*Only because* stacks two hinges: `thebem` (the outcome needs it), then `thahum` with the condition (and it is a fact)."
- `cause.md#cause` (CAUSE with a hinge): "English *habit* / *triggered by*, when a trigger is how the act is produced, uses this same stack: `thewom` right before the hinge, and the trigger in the hinge's `/b/`."
- `usually-vs-must.md#generalization` (against `occasion` and `binder`): "A [cause or condition](/causation) on a general claim says how things work. It holds for *each* member or occasion, the same way the verb does."

### stance

**Whole clause:** MAY, the channels, and deduction on `/th/`. On `/w/` they have adjective reach.

- `universality.md`: "In Ageben the mood words, which say how you know something or how it stands, cover the whole sentence: the `/th/` words MAY and the channels, …"
- `evidentiality.md#evidence-clause` (against `hinge`): "A cause or condition word may not come before the channel. Put the channel first (`theyom thahum blarl`) to say both that you inferred it and that it was caused."
- `usually-vs-must.md#generalization` (against `hinge`): "The channel stays on the main sentence and covers the whole generalization. Put it before the hinge, as with the evidence clause: …"
- `usually-vs-must.md#generalization` (against `occasion`): "The fence says how far the claim reaches, and the channel says what it rests on. Keep the two apart: *always, as far as I have checked* is closed `hual` with a weak channel, because you claim no exceptions on thin evidence."
- `evidentiality.md#carry-forward` (against another speaker): "The frame is yours. It covers only your own claims, and someone else who replies never inherits it."
- `evidentiality.md#carry-forward` (against `quote`): "A quote keeps its speaker's frame: nothing carries into it from outside, and your own frame resumes after it."
- `want-and-decide.md#whose-intention` (against `force`): "… just as a channel in a question asks about the listener's grounds …"

### holder

**Whole clause:** the holder seam reaches its clause and any dependent inside it. Fixed by word shape: it sits on its stance.

- `holder.md#holder`: "Each clause has one holder. The holder covers its clause and any dependent sentence inside it; a new `/x/` sentence is yours again unless it has its own seam word. A dependent with its own seam word switches holder for that sentence only."
- `holder.md#holder` (against `force`, `say`, speaker attitude): "Pronouns, speech moves, and speaker attitudes stay yours: `uwen` is still you, the sentence is still your turn, and *hopefully* is still your hope."
- `holder.md#holder` (against `hinge`): "The so that hinge alone is your aim; after a holder it is the holder's, …"
- `holder.md#holder` (against `sake`): "The first sake word has no holder, so it is yours. The second is Azozon's."
- `holder.md#holder` (against `occasion`): "On MEMORY this is the history you both know, so a sweeping *never* or *always* covers only the times you both remember: …"
- `holder.md#holder` (which stances take one): "Only the seven channels and MAY take a holder: they are the ways you can have access to someone else's view." `notional.md#follow-up-endings-notional` adds NOTIONAL, and `want-and-decide.md#whose-intention` adds WANT, PLAN, and DECISION after a holder.

### intention

**Whole clause:** PLAN, WANT, DECISION on `/th/`; the attempt adverb on `/h/`.

- `intention.md#plan`: "PLAN covers the whole sentence, wherever it sits. The plan stays yours when someone else does the act: …"
- `try.md#try`: "It is an intention adverb: it covers the whole clause wherever it sits."
- `try.md#fallback` (against a joined clause): "An intention adverb covers only its own clause, so the backup above is a plain *Azozon sings*."
- `want-and-decide.md#want` (within the family): "A want and a plan are different steps, so they stack in that order:"
- `want-and-decide.md#endings-changeability` (within the family): "A want comes before both, so the three stack in the order want, plan, decision:"
- `want-and-decide.md#whose-intention` (against `force`): "In a question, a bare WANT, PLAN, or DECISION asks about the listener's mind, with no holder."

### ability

**Whole clause:** the hostless ability adverb on `/h/`. The `x` seam form reaches its own verb or adjective.

- `can-and-cant.md#intention-adverbs`: "Because an intention adverb is about the whole claim wherever it sits, you may put it anywhere in the sentence and the meaning stays the same."

### phase

**Whole clause:** the `/h/` and `/th/` words. On `/w/` they have adjective reach.

- `already-still-yet.md#phasal`: "When only one `/ɡ/` adjective is still or no longer so, write the same word under `/w/` immediately before that adjective."

No sentence states an order against another frame.

### residue

**Whole clause:** RESIDUE and FORMER on `/h/`. On `/w/` they have adjective reach.

- `residue-and-former.md#residue-and-former-climate`: "Put RESIDUE and FORMER on `/h/`, anywhere in the sentence: like an intention adverb, each covers the whole clause."
- Same section (against `contrary`): "Neither follows `uom` (contrary to): neither is something the event could go against."
- Same section (against `occasion`, word position only): "Do not write `helam` right before `hual`: that spot holds the restrictor's list of occasions (*always except when …*)."

### notional

**Whole clause:** NOTIONAL on `/th/`; carries forward. On `/w/` it has adjective reach.

- `notional.md#notional-as-if-framing`: "NOTIONAL carries forward like a channel, so a story you make up, or a supposition you reason through, runs over several sentences."

No sentence states an order against another frame.

### mirative

**Whole clause:** MIRATIVE on `/th/`.

- `mirative.md#mirative`: "`themem` says the whole claim was unexpected." The page says it "is not a channel" and to add a channel beside it; it states no order between the two.

### contrary

**Whole clause:** `uom` + its word frames the claim; the word after `uom` is the frame's content, not a frame on the claim.

- `contrary-to.md#contrary-to-stance` (against `stance`, `intention`): "Only the stance right after `uom` is what the event goes against. A stance anywhere else in the clause still applies to the claim:"
- `contrary-to.md#contrary-to-holder` (against `holder`): "A holder on a channel after `uom` names whose view the event goes against. The holder covers only that pair: the event is still your claim."

### occasion

**Whole clause:** the `/h/` restrictors. On `/w/` they have adjective reach.

- `restrictors.md#on-the-following-adjective-w`: "An `/h/` restrictor, by contrast, limits the whole clause."
- `more-occasions.md#occasions-vs-a-dependent-when` (against `hinge`): "A restrictor lists occasion words; a whole sentence as the occasion takes a hinge word and **`blarl`**."
- See `stance` and `holder` above for the statements against `occasion`.

## Reader rules

1. **One reading per clause.** A `BodyClause` gives one. A clause join gives one per member, held by a list term. A dependent, a hinge's clause, an island, and a quote give nested readings in `content`.
2. **Nesting comes only from the tree.** A frame sits inside another only where the parse tree nests them. A frame form with adjective reach nests under its adjective. A hinge or channel whose content is a `blarl` next sentence takes that reading through the [grounds link](#links), not by moving it.
3. **Frame order.** What is left after rule 2 is two frames that both reach the whole clause. The reader sorts every such pair of families into one of four kinds from the [pair table](#pair-table): **commutes** (records nothing), **fixed by word shape** (records the order in `order`, citing the word's section), **fixed by a rule** (copies it into `order`, citing the rule from [scope statements](#scope-statements) or the resolve stage), **unsettled** (puts the pair in `unordered`). No reader, consumer, or host picks an order for an unsettled pair; settling one is a grammar decision.
4. **Not stated stays empty.** A missing source, holder, or closure is absent from the reading, never defaulted. A carried frame is a link to the reading that set it, not a default.
5. **Pointers, not copies.** Every frame, detail, and term keeps its `LexWord`s, so a consumer can show the text, the gloss, and the position.
6. **Pronouns keep both ends.** A pronoun term holds the resolver's `AnaphorBind` and, when bound, its antecedent's term. The reader never binds one itself.
7. **Numbers stay stems** in the reading; phase 2 adds their values for comparison.
8. **No row is an unknown frame.** A construction the reader meets with no row in the [classification table](#classification-table) becomes an `unknown` frame and an `unread` entry.

## Pair table

R1b fills this table once every family is fixed.

## Construction ids

Every id in `constructionRegistry()` maps to one key of the [classification table](#classification-table). Overlay ids (`overlay.<form>.<pos>`) map to `overlay:<kind>:<pos>`, or to the gloss override when one exists.

| Key | Construction ids |
|-----|------------------|
| `anaphor:content` | `resolve.content.bound`, `resolve.content.unbound` |
| `anaphor:landmark` | `resolve.landmark.bound` |
| `anaphor:number` | `resolve.number.bound` |
| `anaphor:pointer` | `resolve.pointer.bound` |
| `anaphor:role` | `resolve.role.bound`, `resolve.role.unbound` |
| `anaphor:tag` | `resolve.tag.bound`, `resolve.tag.each` |
| `anaphor:topic` | `resolve.topic.bound` |
| `body:fragment` | `sentence.sentence.fragment` |
| `body:sentence` | `sentence.document.sentence`, `sentence.document.Period`, `sentence.document.EOF`, `sentence.sentence.leftEdge`, `sentence.sentence.edgeBody`, `sentence.sentence.bodyClause`, `sentence.bodyClause.clause`, `sentence.clause.clauseItem`, `sentence.unit.unit`, `sentence.clauseItem.unit` |
| `body:topicMarker` | `sentence.bodyClause.topicMarker` |
| `edge:force` | `sentence.leftEdge.ForceEcho`, `sentence.leftEdge.ForceAnswer`, `sentence.leftEdge.ForceQuiz`, `sentence.leftEdge.ForceStack`, `sentence.leftEdge.Force`, `token.force`, `force.a`, `force.o`, `force.e`, `force.u`, `force.soft` |
| `edge:hook` | `sentence.leftEdge.W`, `sentence.leftEdge.Hook` |
| `edge:interjection` | `sentence.turnWord.Interjection`, `token.yInterjection` |
| `edge:polar` | `sentence.leftEdge.Polar`, `token.polar`, `polar.starter`, `polar.fuller` |
| `edge:tone` | `tone.mark.strong`, `tone.mark.strong2`, `tone.mark.unsure`, `tone.mark.unsure2`, `tone.mark.joking`, `tone.mark.joking2`, `tone.mark.contrast`, `tone.mark.contrast2`, `tone.mark.warm`, `tone.mark.warm2`, `tone.mark.stack`, `tone.scope.word`, `tone.scope.island`, `tone.scope.span`, `tone.scope.rest` |
| `edge:vocative` | `sentence.leftEdge.turnWord`, `sentence.turnWord.Vocative`, `sentence.turnWord.gPackage`, `sentence.turnWord.glAdj`, `sentence.turnWord.W`, `token.yVocative` |
| `ending:l` | `word.ending.l` |
| `ending:ln` | `word.ending.ln` |
| `ending:m` | `word.ending.m` |
| `ending:n` | `sentence.npPackage.Citation`, `word.ending.n` |
| `ending:r` | `word.ending.r` |
| `ending:rl` | `word.ending.rl` |
| `ending:rm` | `word.ending.rm` |
| `ending:rn` | `word.ending.rn` |
| `ending:rth` | `word.ending.rth` |
| `hookJob:zone` | `sentence.hUnitRule.Held`, `sentence.hookUnit.zone` |
| `joinSeries:a` | `join.a` |
| `joinSeries:ae` | `join.ae` |
| `joinSeries:ao` | `join.ao` |
| `joinSeries:e` | `join.e` |
| `joinSeries:o` | `join.o` |
| `joinSeries:oe` | `join.oe` |
| `joinSeries:u` | `join.u` |
| `joinSeries:ua` | `join.ua` |
| `joinSeries:ue` | `join.ue` |
| `joinSeries:uo` | `join.uo` |
| `lexReading:ability` | `word.reading.ability` |
| `lexReading:greeting` | `token.greeting`, `word.reading.greeting` |
| `lexReading:join` | `word.reading.join` |
| `lexReading:joinRelation` | `token.joinRelationG`, `token.joinRelationH` |
| `lexReading:listVerb` | `token.listVerb` |
| `lexReading:number` | `word.reading.number` |
| `lexReading:ordinary` | `token.content`, `token.citationFallback`, `word.reading.ordinary` |
| `lexReading:restrictor` | `word.reading.restrictor`, `restrictor.onlyWhen`, `restrictor.always`, `restrictor.sometimes`, `restrictor.set`, `restrictor.ranked` |
| `lexReading:sake` | `word.reading.sake`, `sake.stance.a`, `sake.stance.u`, `sake.stance.e`, `sake.stance.o`, `sake.ending.a.l`, `sake.ending.a.m`, `sake.ending.a.r`, `sake.ending.u.l`, `sake.ending.u.m`, `sake.ending.u.r`, `sake.ending.e.l`, `sake.ending.e.m`, `sake.ending.e.r`, `sake.ending.o.l`, `sake.ending.o.m`, `sake.ending.o.r`, `sake.emotion` |
| `lexReading:sameRole` | `sentence.unit.sameRolePair`, `sentence.sameRolePair.Hook`, `sentence.sameRolePair.Blank`, `token.sameRole` |
| `lexReading:standIn` | `token.standIn`, `word.reading.standIn`, `standIn.a`, `standIn.o`, `standIn.e`, `standIn.u` |
| `lexReading:standInBack` | `word.reading.standInBack`, `standInBack.a`, `standInBack.o`, `standInBack.e`, `standInBack.u` |
| `lexReading:standInNamed` | `word.reading.standInNamed` |
| `lexReading:unknown` | `word.reading.unknown` |
| `overlay:ability:h` | `token.clauseAdverb`, `overlay.odam.h` |
| `overlay:ability:w` | `overlay.odam.w` |
| `overlay:attempt:h` | `overlay.owal.h`, `overlay.owam.h`, `overlay.owar.h` |
| `overlay:cause:th` | `overlay.ewom.th` |
| `overlay:cause:w` | `overlay.ewom.w` |
| `overlay:clause_hinge:*:after` | `overlay.alam.h`, `overlay.alam.g`, `overlay.alam.cite`, `overlay.alal.cite` |
| `overlay:clause_hinge:*:as-of.bookmark` | `overlay.unom.h`, `overlay.unom.g`, `overlay.unom.w`, `overlay.unom.th`, `overlay.unor.h`, `overlay.unor.g`, `overlay.unor.w`, `overlay.unor.th` |
| `overlay:clause_hinge:*:as-of.ledger` | `overlay.enam.h`, `overlay.enam.g`, `overlay.enam.w`, `overlay.enam.th`, `overlay.enar.h`, `overlay.enar.g`, `overlay.enar.w`, `overlay.enar.th` |
| `overlay:clause_hinge:*:before` | `overlay.abam.h`, `overlay.abam.g`, `overlay.abam.cite`, `overlay.abal.cite` |
| `overlay:clause_hinge:*:by` | `overlay.uvahum.h`, `overlay.uvahum.g` |
| `overlay:clause_hinge:*:until` | `overlay.arum.h`, `overlay.arum.g` |
| `overlay:clause_hinge:*:while` | `overlay.erom.h`, `overlay.erom.g`, `overlay.erom.cite`, `overlay.erol.cite` |
| `overlay:clause_hinge:g` | `overlay.ohem.g`, `overlay.ehom.g`, `overlay.ahum.g`, `overlay.ebem.g`, `overlay.ezem.g`, `overlay.ovam.g` |
| `overlay:clause_hinge:h` | `overlay.ezem.h`, `overlay.ahom.h` |
| `overlay:clause_hinge:th` | `overlay.ohem.th`, `overlay.ehom.th`, `overlay.ahum.th`, `overlay.ahul.th`, `overlay.ahur.th`, `overlay.ebem.th`, `overlay.ezem.th`, `overlay.ovam.th` |
| `overlay:decision:th` | `overlay.ogel.th`, `overlay.ogem.th`, `overlay.oger.th` |
| `overlay:evidential:th` | `overlay.evum.th`, `overlay.evul.th`, `overlay.evur.th`, `overlay.ugem.th`, `overlay.ugel.th`, `overlay.uger.th`, `overlay.ubom.th`, `overlay.ubol.th`, `overlay.ubor.th`, `overlay.eyom.th`, `overlay.eyol.th`, `overlay.eyor.th`, `overlay.anam.th`, `overlay.anal.th`, `overlay.anar.th`, `overlay.ebam.th`, `overlay.ebal.th`, `overlay.ebar.th`, `overlay.abem.th`, `overlay.abel.th`, `overlay.aber.th` |
| `overlay:evidential:w` | `overlay.evum.w`, `overlay.evul.w`, `overlay.evur.w`, `overlay.ugem.w`, `overlay.ugel.w`, `overlay.uger.w`, `overlay.ubom.w`, `overlay.ubol.w`, `overlay.ubor.w`, `overlay.eyom.w`, `overlay.eyol.w`, `overlay.eyor.w`, `overlay.anam.w`, `overlay.anal.w`, `overlay.anar.w`, `overlay.ebam.w`, `overlay.ebal.w`, `overlay.ebar.w`, `overlay.abem.w`, `overlay.abel.w`, `overlay.aber.w` |
| `overlay:exchange:g` | `overlay.eham.g` |
| `overlay:exchange:h` | `overlay.eham.h` |
| `overlay:former_climate:h` | `overlay.elam.h` |
| `overlay:former_climate:w` | `overlay.elam.w` |
| `overlay:identity:g` | `overlay.orel.g` |
| `overlay:join_relation:g` | `overlay.an.g`, `overlay.on.g`, `overlay.aon.g`, `overlay.un.g`, `overlay.uan.g`, `overlay.uon.g`, `overlay.en.g`, `overlay.aen.g`, `overlay.oen.g`, `overlay.uen.g` |
| `overlay:join_relation:h` | `overlay.an.h`, `overlay.on.h`, `overlay.aon.h`, `overlay.un.h`, `overlay.uan.h`, `overlay.uon.h`, `overlay.en.h`, `overlay.aen.h`, `overlay.oen.h`, `overlay.uen.h` |
| `overlay:likeness:cite` | `overlay.ewem.cite`, `overlay.ewel.cite` |
| `overlay:likeness:g` | `overlay.ewem.g`, `overlay.ewel.g` |
| `overlay:likeness:h` | `overlay.ewem.h`, `overlay.ewel.h` |
| `overlay:list_verb:v` | `overlay.an.v`, `overlay.on.v`, `overlay.aon.v`, `overlay.un.v`, `overlay.uan.v`, `overlay.uon.v`, `overlay.en.v`, `overlay.aen.v`, `overlay.oen.v`, `overlay.uen.v` |
| `overlay:locative:g` | `overlay.edam.g`, `overlay.ohom.g`, `overlay.evam.g`, `overlay.egalom.g`, `overlay.erahom.g`, `overlay.avunam.g`, `overlay.uzurum.g` |
| `overlay:locative:h` | `overlay.edam.h`, `overlay.ohom.h`, `overlay.evam.h`, `overlay.egalom.h`, `overlay.erahom.h`, `overlay.avunam.h`, `overlay.uzurum.h` |
| `overlay:may:th` | `overlay.omam.th`, `overlay.omal.th`, `overlay.omar.th` |
| `overlay:may:w` | `overlay.omam.w`, `overlay.omal.w`, `overlay.omar.w` |
| `overlay:mention:g` | `overlay.egol.g`, `overlay.egon.g` |
| `overlay:mirative:th` | `overlay.emem.th`, `overlay.emel.th`, `overlay.emer.th` |
| `overlay:notional:th` | `overlay.eyum.th`, `overlay.eyur.th`, `overlay.eyul.th` |
| `overlay:notional:w` | `overlay.eyum.w`, `overlay.eyur.w`, `overlay.eyul.w` |
| `overlay:of_relation:g` | `overlay.obom.g`, `overlay.adam.g`, `overlay.ulom.g`, `overlay.aham.g` |
| `overlay:of_relation:h` | `overlay.obom.h`, `overlay.adam.h`, `overlay.ulom.h`, `overlay.aham.h` |
| `overlay:pairing:w` | `overlay.ubam.w` |
| `overlay:phasal:h` | `overlay.avel.h`, `overlay.avem.h`, `overlay.aver.h`, `overlay.awul.h`, `overlay.awum.h`, `overlay.awur.h`, `overlay.uvul.h`, `overlay.uvum.h`, `overlay.uvur.h` |
| `overlay:phasal:th` | `overlay.elol.th`, `overlay.elom.th`, `overlay.elor.th` |
| `overlay:phasal:w` | `overlay.avel.w`, `overlay.avem.w`, `overlay.aver.w`, `overlay.awul.w`, `overlay.awum.w`, `overlay.awur.w`, `overlay.elol.w`, `overlay.elom.w`, `overlay.elor.w`, `overlay.uvul.w`, `overlay.uvum.w`, `overlay.uvur.w` |
| `overlay:plan:th` | `overlay.agor.th`, `overlay.agom.th`, `overlay.agol.th` |
| `overlay:proxy:g` | `overlay.anem.g` |
| `overlay:proxy:h` | `overlay.anem.h` |
| `overlay:residue:h` | `overlay.aram.h` |
| `overlay:residue:w` | `overlay.aram.w` |
| `overlay:sake:th` | `overlay.unam.th`, `overlay.uwam.th`, `overlay.urom.th`, `overlay.awem.th`, `overlay.ewam.th`, `overlay.odem.th`, `overlay.obam.th`, `overlay.owem.th`, `overlay.udam.th` |
| `overlay:sake:w` | `overlay.unam.w`, `overlay.uwam.w`, `overlay.urom.w`, `overlay.awem.w`, `overlay.ewam.w`, `overlay.odem.w`, `overlay.obam.w`, `overlay.owem.w`, `overlay.udam.w` |
| `overlay:stimulus:g` | `overlay.oyom.g` |
| `overlay:want:th` | `overlay.alol.th`, `overlay.alom.th`, `overlay.alor.th` |
| `reading:amountScale` | `reading.amountScale` |
| `reading:bareQuestion` | `reading.bareQuestion` |
| `reading:existence` | `reading.existence` |
| `reading:feelingLandmark` | `reading.feelingLandmark` |
| `reading:feelingStake` | `reading.feelingStake` |
| `reading:frequencyScale` | `reading.frequencyScale` |
| `reading:fromTo` | `reading.fromTo` |
| `reading:greeting` | `reading.greeting` |
| `reading:kind` | `reading.kind` |
| `reading:unsaidEvent` | `reading.unsaidEvent` |
| `reading:verbFirstItem` | `reading.verbFirstItem` |
| `reading:verbSharedNoun` | `reading.verbSharedNoun` |
| `shared:ordinary` | `sentence.npJoinClose.sharedAfterJoin` |
| `shared:scale` | `sentence.npJoinClose.factor`, `sentence.sharedAfterJoin.scale` |
| `slot:adj` | `sentence.hUnitRule.gPackage`, `sentence.npPackage.gPackage`, `sentence.gPackage.gPackage`, `sentence.sharedAfterJoin.gPackage` |
| `slot:asOf` | `sentence.asOfWPair.W`, `sentence.asOfWPair.B`, `sentence.gPackage.asOfWPair` |
| `slot:bar` | `sentence.zCoordPart.bar`, `sentence.dCoordPart.bar`, `sentence.bCoordPart.bar` |
| `slot:boundJoin` | `sentence.hUnitRule.boundJoinTail`, `sentence.gPackage.boundJoinTail`, `sentence.boundJoinTail.B`, `sentence.boundJoinTail.JoinB` |
| `slot:dependent` | `sentence.hUnitRule.Odo`, `sentence.npPackage.Odo` |
| `slot:gl` | `word.gl` |
| `slot:hosted` | `sentence.hUnitRule.B`, `sentence.hUnitRule.G`, `sentence.gPackage.G`, `sentence.gPackage.B`, `word.bl` |
| `slot:tag` | `sentence.npCoordPart.groupTag`, `sentence.npPackage.tag` |
| `slot:w` | `sentence.hUnitRule.W`, `sentence.gPackage.W` |
| `unit:clauseCoord` | `sentence.clause.midJoin`, `sentence.clauseItem.standIn`, `sentence.bodyClause.crossJoin` |
| `unit:gCoord` | `sentence.unit.gCoord`, `sentence.gCoord.gCoordPart`, `sentence.gCoordPart.gPackage` |
| `unit:h` | `sentence.unit.hCoord`, `sentence.hCoord.hCoordPart`, `sentence.hCoordPart.hUnitRule`, `sentence.hCoordPart.lateBound`, `sentence.hUnitRule.H`, `sentence.sharedAfterJoin.hUnitRule` |
| `unit:hook` | `sentence.unit.hookUnit`, `sentence.hookUnit.W`, `sentence.hookUnit.Hook`, `sentence.npCoordPart.itemHook`, `sentence.npCoordPart.itemHookBound` |
| `unit:island` | `sentence.unit.islandUnit`, `sentence.islandUnit.IslandOpen`, `sentence.islandUnit.IslandClose`, `sentence.islandUnit.unit` |
| `unit:linker` | `sentence.bodyClause.Linker`, `token.linker` |
| `unit:np` | `sentence.unit.zCoord`, `sentence.unit.dCoord`, `sentence.unit.bCoord`, `sentence.zCoord.zCoordPart`, `sentence.dCoord.dCoordPart`, `sentence.bCoord.bCoordPart`, `sentence.zCoordPart.npConjunct`, `sentence.dCoordPart.npConjunct`, `sentence.bCoordPart.npConjunct`, `sentence.npPackage.Z`, `sentence.npPackage.D`, `sentence.npPackage.B` |
| `unit:vp` | `sentence.unit.vpCoord`, `sentence.vpCoord.vpCoordPart`, `sentence.vpCoordPart.V`, `sentence.vpCoordPart.B`, `sentence.vpCoordPart.vpItemUnit`, `sentence.vpItemUnit.dCoord`, `sentence.vpItemUnit.bCoord`, `sentence.vpItemUnit.hCoord`, `sentence.vpItemUnit.hookUnit`, `sentence.vJoinClose.sharedAfterJoin` |
| `word:hookedJoin` | `sentence.npJoinClose.joinLandmark`, `word.hookedJoin` |
| `word:plural` | `word.plural.z`, `word.plural.d`, `word.plural.b`, `word.plural.y`, `word.plural.v`, `word.plural.g` |
| `word:rangeMember` | `rangeMember.oer`, `rangeMember.uer`, `rangeMember.uar`, `rangeMember.uor`, `rangeMember.aor` |
| `wordFamily:content` | `word.family.content` |
| `wordFamily:foreign` | `word.family.foreign` |
| `wordFamily:hook` | `token.hook`, `word.family.hook`, `hook.ar`, `hook.er`, `hook.or`, `hook.ur`, `hook.aor`, `hook.aer`, `hook.uer`, `hook.al`, `hook.am`, `hook.el`, `hook.em`, `hook.ol`, `hook.om`, `hook.ul`, `hook.um`, `hook.aol`, `hook.aom`, `hook.ael`, `hook.aem`, `hook.oel`, `hook.oem`, `hook.ual`, `hook.uam`, `hook.uol`, `hook.uom`, `hook.uel`, `hook.uem` |
| `wordFamily:hookCompound` | `word.family.hookCompound` |
| `wordFamily:joinMarker` | `sentence.zCoordPart.npJoinClose`, `sentence.zCoordPart.standaloneJoin`, `sentence.dCoordPart.npJoinClose`, `sentence.dCoordPart.standaloneJoin`, `sentence.bCoordPart.npJoinClose`, `sentence.bCoordPart.standaloneJoin`, `sentence.npJoinClose.JoinZ`, `sentence.npJoinClose.JoinD`, `sentence.npJoinClose.JoinB`, `sentence.npJoinClose.W`, `sentence.vpCoordPart.vJoinClose`, `sentence.vpCoordPart.standaloneJoin`, `sentence.vJoinClose.W`, `sentence.vJoinClose.JoinV`, `sentence.gCoordPart.gJoinClose`, `sentence.gCoordPart.standaloneJoin`, `sentence.gJoinClose.W`, `sentence.gJoinClose.JoinG`, `sentence.hCoordPart.hJoinClose`, `sentence.hCoordPart.standaloneJoin`, `sentence.hJoinClose.JoinH`, `token.join`, `word.family.joinMarker`, `join.plural` |
| `wordFamily:number` | `word.family.number`, `number.marker.scalarPos`, `number.marker.scalarNeg`, `number.marker.ordinalFwd`, `number.marker.ordinalEnd`, `number.marker.label`, `number.marker.negativeLabel`, `number.marker.errorBound`, `number.digitless`, `number.exponent`, `number.exp.landmark`, `number.exp.bareOom`, `number.exp.zero`, `number.exp.hyperbole`, `number.exp.shortfall`, `number.percent`, `number.decimal`, `number.groups`, `number.code`, `number.calendar`, `number.writingMark.~`, `number.writingMark.@`, `number.writingMark.=`, `number.pos.v`, `number.pos.h`, `number.pos.th`, `number.pos.y`, `number.pos.x` |
| `wordFamily:say` | `word.family.say` |
| `wordFamily:tag` | `token.tagAssign`, `word.family.tag` |
| `wordFamily:writingSpan` | `sentence.npPackage.WritingSpan`, `token.writingSpanSlot`, `token.writingSpan`, `word.family.writingSpan`, `span.mark.^@`, `span.mark.@`, `span.mark.~` |
| `wordFamily:x` | `word.family.x` |
| `xFamily:ability` | `word.xFamily.ability`, `role.ability` |
| `xFamily:compound` | `word.xFamily.compound` |
| `xFamily:holder` | `word.xFamily.holder` |
| `xFamily:hookPrefix` | `word.xFamily.hookPrefix` |
| `xFamily:lateral` | `word.xFamily.lateral` |
| `xFamily:numeric` | `word.xFamily.numeric` |
| `xFamily:pointer` | `word.xFamily.pointer`, `pointer.scope.u`, `pointer.part.z`, `pointer.part.d`, `pointer.part.b`, `pointer.part.h`, `pointer.part.g`, `pointer.part.th`, `pointer.part.w`, `pointer.part.y`, `pointer.part.x`, `pointer.part.v`, `pointer.vowel.e`, `pointer.vowel.a`, `pointer.vowel.o`, `pointer.vowel.u`, `pointer.new`, `pointer.share` |
| `xFamily:role` | `word.xFamily.role`, `role.part.z`, `role.part.d`, `role.part.b`, `role.part.h`, `role.part.g`, `role.part.th`, `role.part.w`, `role.part.y`, `role.part.x`, `role.scope.a`, `role.scope.e`, `role.scope.o`, `role.scope.u`, `role.scope.ae`, `role.scope.ao`, `role.scope.oe`, `role.scope.ua`, `role.scope.ue`, `role.scope.uo`, `role.instance`, `role.actingAs` |
| `xFamily:sake` | `word.xFamily.sake` |
| `xFamily:scope` | `word.xFamily.scope`, `scope.vowel.a`, `scope.vowel.e`, `scope.vowel.o`, `scope.vowel.u`, `scope.vowel.ae`, `scope.vowel.ao`, `scope.vowel.oe`, `scope.vowel.ua`, `scope.vowel.ue`, `scope.vowel.uo` |

Keys with no construction id (the reader still switches on them): `unit:predicate`, `unit:writingSpan`, the `hookJob` keys, `lexReading:overlay`, `lexReading:mention`, the `ask`, `answer`, and most `shared` keys, `slot:grounds`.

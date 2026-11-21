# Interpreter

<!-- retie: skip -->

**Status:** all keys classified; pair table filled; host contract and loop shipped  
**Design authority:** [`docs/grammar/`](../grammar/introduction.md). The reader copies what the parse tree and the resolve stage already say; it never re-derives a reading.

The interpreter turns a parse into **readings**, one per clause, so tools can compare, show, or check what a text says without walking the parse tree for meaning. This note owns the terms, the frame families, the classification table every reader switches on, the links, the scope statements copied from the grammar pages, the reader rules, the log, the matcher's rules, the host contract, the loop with its pass-through list and default verdict, and which tools read readings and which the parse. Every row cites the grammar anchor that decides it; a row with no anchor is still to be classified. The parser side is in [parser pipeline](parser-pipeline.md); construction ids come from `constructionRegistry()` in `src/parse/constructions.ts`.

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
| **stance list** | The stance words one `/th/` join closes, as one list (`verb-and-stance-joins.md#stance-joins`: "The other join vowels work on stance words the same way they work on a phrase list"). `Reading.stanceLists` holds each in text order: the join word, its `series`, its `members` (pointers to the stance frames it closes, in text order, or to an earlier stance list the join closes as one fence), and in `inner` the join's own frame: `polarity` for `u` and `ue`, `binder` for `ua` and `uo`, none for a structure series. That frame reaches the list, never the clause, so it never pairs. One stance word closed is a list of one: every `/th/` join over stance words sits in one place, and a frame's `inner` keeps one meaning, frames it holds. What denying, ranking, or excluding the list means is the consumer's, from `set-joins.md` and `rank-joins.md`; the reader only copies the members, the join and its frame |
| **adjective reach** | A frame form on `/w/` that reaches only the `/ɡ/` adjective right after it. The tree attaches it to that adjective, so it nests by rule 2 and is never in a pair |

## Frame families

| Family | What it changes | Owning pages |
|--------|-----------------|--------------|
| `hinge` | Ties the claim to a condition, cause, concession, fault, or aim: *if*, *only if*, *iff*, *because*, *although*, *so that*, fault, CAUSE | `causation.md`, `because-and-iff.md`, `fault.md`, `cause.md`, `dependents.md#hinges`, `more-hinges.md#result-hinge` |
| `stance` | How you know the claim or how sure you are: MAY, the channels, deduction | `knowing.md#may`, `knowing.md#live-vs-memory`, `evidentiality.md`, `dated-channel.md`, `usually-vs-must.md`, `universality.md` |
| `holder` | Whose view the clause gives | `holder.md#naming-a-holder` |
| `intention` | Want, plan, decision, attempt: the claim is a mind's aim or an attempt, not a plain event | `intention.md#plan`, `want-and-decide.md`, `try.md#trying` |
| `ability` | Can / can't for the whole clause, or built into a verb or adjective | `can-and-cant.md#ability`, `can-and-cant.md#ability-fallback`, `can-and-cant.md#intention-adverbs` |
| `phase` | Already, still, not yet, no longer: what holds now against a change | `already-still-yet.md#stage-of-change` |
| `residue` | RESIDUE (outcome still in effect), FORMER (pattern not claimed for now) | `residue-and-former.md#residue` |
| `notional` | The scene is imagined; no claim it happens | `notional.md#notional-as-if-framing` |
| `mirative` | The claim ran against what you expected | `mirative.md#mirative` |
| `contrary` | The event goes against a plan, a say word, a channel, or a holder's view (`uom` + that word) | `contrary-to.md` |
| `occasion` | Restrictors: only when, never, always, sometimes, the occasion list | `restrictors.md`, `more-occasions.md` |
| `unknown` | A construction with no row | this note |
| `force` | Speech act and question type, a greeting | `speech-moves.md`, `firm-soft.md`, `more-turn-words.md`, `questions.md` |
| `polarity` | Denies the items of its list (`u` list joins, which do not pair); a standalone `/th/` join (`thul`, `thum`, `thur`) says how to take the whole claim and pairs | `joins.md#negation-u`, `set-joins.md`, `verb-and-stance-joins.md#stance-joins`, `verb-and-stance-joins.md#standalone-stance-joins`, `universals-domains.md#not-every` |
| `say` | Someone's say over the act: permission, requirement, consent | `permission-consent.md#say-words` |
| `sake` | Which need the claim or a noun serves or detracts from, and whose stake; a feeling's stake | `sakes.md`, `for-a-sake.md`, `ought-for-a-sake.md`, `feelings.md#feeling-whose-stake` |
| `bar` | The stance a ranking is measured against: than planned, than usual, enough, too | `bars.md` |
| `quote` | Quoted words: a nested reading with its own speaker | `spans.md#writing`, `quote-contents.md` |
| `attitude` | **Added.** How you feel about the claim or how you say it: *hopefully*, speech manner, tone marks, interjections | `feelings.md#speaker-attitude`, `speech-manner.md`, `tone-marks.md`, `speech-moves.md#interjections-reactions` |
| `binder` | *Every*, *no*, *everything but*, and a new member a later phrase falls under; bound tags | `joins.md#everything-ua`, `universals-domains.md` |
| `call` | **Added.** Names who the turn is for (`party`); commutes with every other frame in its clause | `speech-moves.md#vocative` |

R1a dropped no first-cut family and added `intention`, `ability`, and `residue`: each has whole-clause forms that change the claim and that the first cut did not name. R1b dropped no first-cut family and added `attitude`: speaker attitude, speech manner and tone marks change no truth, but they are the speaker's and stay so under a holder (`holder.md#what-the-holder-covers`), so they cannot be details. Unit R6d added `call`: a call was filed under `force`, but it commutes with every frame, the act word included, so no `force` row fits it. The final list: `force`, `polarity`, `say`, `stance`, `holder`, `hinge`, `intention`, `ability`, `phase`, `residue`, `notional`, `mirative`, `contrary`, `occasion`, `sake`, `attitude`, `bar`, `quote`, `binder`, `call`, `unknown`.

## Classification table

Key types: `unit` is `Unit.kind`; `hookJob` is `HookJob`; `lexReading` is `LexReading`; `wordFamily` is `MorphWordFamily.kind`; `xFamily` is `XFamily`; `overlay` is overlay `kind` and PoS letter (`overlay:<kind>:<pos>`, with `overlay:<kind>:<pos>:<gloss>` overriding it for one gloss); `joinSeries` is the join series; `anaphor`, `ask`, `answer`, and `shared` are the resolve records (`AnaphorBind` by kind, `AskRecord` by kind, `AnswerRecord`, `SharedRecord` by role); `ending`, `slot`, `edge`, `body`, `reading`, and `word` are keys that only construction ids use (see [construction ids](#construction-ids)).

| Key type | Key | Class | Anchor | Note |
|----------|-----|-------|--------|------|
| unit | `np` | structure | `clause.md#who-acts-and-the-action` | A role phrase: fills `claim.roles` by its role letter |
| unit | `vp` | structure | `clause.md#who-acts-and-the-action` | Fills `claim.verb`; a joined verb list is a list term, its join read by its `joinSeries` row |
| unit | `predicate` | structure | `predication.md#identity` | Clause-level `/ɡ/`: fills `claim.predicate` |
| unit | `h` | detail:adverb | `clause.md#adverbs-h` | Default for a plain `/h/` word. An `/h/` word with a restrictor, ability, or overlay reading takes that word's row first, except on a restrictor's occasion list, where it is this row whatever its reading (`residue-and-former.md#former-climate`) |
| unit | `linker` | link | `sentence-linkers.md#sentence-linkers` | Points back to the one sentence before the period. On any other `/x/` word, a topic word or agenda number (`topic.md#topic`): links nothing to the claim |
| unit | `hook` | structure | `hooks.md#including-am-al` | Read by its `hookJob` row |
| unit | `writingSpan` | frame:quote | `spans.md#writing` | A cite fills one role; its words are a nested reading that keeps its own act word and frames (`quote-contents.md#quote-acts`, `evidentiality.md#carry-forward`). Loan, opaque and mention spans are `literal` terms (`spans.md#loans`); an aside `th(…)` is a nested comment reading (`spans.md#asides-th`) |
| unit | `island` | structure | `scope-islands.md#scope-islands` | Nests: a stance inside frames that chunk only (rule 2) |
| unit | `clauseCoord` | structure | `joins.md#clause-joins` | One reading per member (rule 1); the join itself is read by its `joinSeries` row |
| unit | `gCoord` | structure | `joins.md#right-close` | A `/ɡ/` list; its join is read by its `joinSeries` row |
| hookJob | `discourse` | link | `hooks.md#discourse-hooks` | Ties this sentence to prior talk: add, reword, replace, except. With `-r` it points back to an earlier stretch (`discourse-hooks.md#discourse`) |
| hookJob | `clause` | detail:hook | `in-clause-hooks.md#in-clause` | Including, rather, instead, except on a phrase of the clause |
| hookJob | `extraNoun` | detail:place | `extra-noun-hooks.md#extra-noun-stacked-vowels-and-loose-m` | On, through, using, near: a landmark for the clause or a hosted landmark; `hooks.md#since` is the time case |
| hookJob | `genitive` | detail:relation | `social-ties.md#genitive` | `om` + `/b/` on the noun to its left: a detail of that term |
| hookJob | `stray` | structure | `social-ties.md#genitive` | Rejected by enforce; never reaches a reading |
| hookJob | `span` | detail:range | `ranges.md#ranges` | A hook between two endpoints of one kind: the first end fills the role and the detail hosts the second (`zragel oel zrazal`). On a counted noun (`ranges.md#number-ranges`, `open-ranges.md#rays`: "put the endpoints on the counted noun"), a span between the noun's number and a second number (`zodozel gragel oel grazal`, `dodozel grawal uel gragel`) is a detail of that number detail, with both ends there: the first end is that detail's own word, and the range hosts the second as a `number` term. No second number is read as the clause's predicate |
| hookJob | `resume` | link | `in-clause-hooks.md#hook-resume` | `-r` hook: points back to a landmark (see [links](#links)) |
| hookJob | `zone` | frame:contrary | `contrary-to.md#contrary-to-stance` | `uom` + the stance it holds as the opposing zone; that stance is the frame's `content`, not a frame on the claim. A holder word there (`contrary-to.md#contrary-to-holder`) gives the holder frame with its `party`, and its host stance, with that stance's own gloss, in the holder's `inner`: no word-shape order is kept inside the zone, so the host nests (rule 2) |
| lexReading | `ordinary` | structure | `clause.md#who-acts-and-the-action` | Read by its PoS slot |
| lexReading | `sake` | frame:sake | `sakes.md#word-shape` | Met, unmet, motive, prescription. On `/th/` it is about the whole claim (`for-a-sake.md#whose-stake`); on `/ɡ/` it nests under its noun. A `bl-` is whose stake (`party`). Feeling words read here too (`how-you-feel.md#feeling-word`) |
| lexReading | `ability` | frame:ability | `can-and-cant.md#ability` | |
| lexReading | `greeting` | frame:force | `word-endings.md#greeting` | A greeting turn |
| lexReading | `restrictor` | frame:occasion | `restrictors.md#only-when-never-hal` | `/h/` limits the whole clause; `/w/` limits one adjective (`restrictors.md#on-the-following-adjective-w`). An `/h/` restrictor's frame holds its occasions in text order (`occasions`): the unbroken run of `/h/` words right before it, which the resolve stage marks (`ScopeFrame.occasions`). An earlier restrictor ends the run, since each occasion is one simple content word (`restrictors.md#listed-occasions-open`). Each occasion stays a `unit:h` detail of the claim; the frame points at it, and it is no frame of its own |
| lexReading | `overlay` | structure | `parser-pipeline.md#overlay-kinds` | Read by its `overlay` row |
| lexReading | `mention` | structure | `spans-as-words.md#mention` | Fills a `literal` term |
| lexReading | `sameRole` | detail:time | `same-role-words.md#before-and-after` | `A CITE B`: before, after, while, like between two phrases of one role |
| lexReading | `join` | structure | `joins.md#right-close` | Read by its `joinSeries` row |
| lexReading | `standIn` | link | `dependents.md#dependent-clauses` | The slot a dependent fills; the dependent is a nested reading |
| lexReading | `standInNamed` | link | `stand-in-roles.md#speech-act-verbs` | |
| lexReading | `standInBack` | link | `stand-in-vowels.md#stand-in-back` | `-rth`: points back to the most recent content of its kind (see [links](#links)) |
| lexReading | `listVerb` | structure | `list-verbs.md#list-verbs` | A verb whose act is a join move (*includes*, *chooses*): fills `claim.verb`; its `/d/` is the list |
| lexReading | `joinRelation` | detail:relation | `join-relations.md#join-relations` | *with*, *without*, *prioritizing* + `/b/` |
| lexReading | `number` | structure | `number-roles.md#number-as-verb-by-marker` | Read by PoS: on `/th/` frame:stance (`number-roles.md#number-as-stance-by-marker`, whole clause); on `/h/` detail:adverb; on `/w/` detail:degree; on a noun a `number` term (rule 7) |
| lexReading | `unknown` | frame:unknown | | Also an `unread` entry |
| wordFamily | `content` | structure | `phonology.md#word-edges` | Read by its `lexReading` |
| wordFamily | `number` | structure | `numbers.md#counts` | Read by `lexReading:number`; markers and endings are the term's `values` |
| wordFamily | `x` | structure | `compounds.md#two-roots-one-word` | Read by its `xFamily` |
| wordFamily | `hook` | structure | `hooks.md#including-am-al` | Read by its `hookJob` |
| wordFamily | `hookCompound` | label | `hook-compounds.md#hook-compounds` | |
| wordFamily | `joinMarker` | structure | `joins.md#right-close` | Closes a list; read by its `joinSeries` row |
| wordFamily | `writingSpan` | structure | `spans.md#writing` | Read by `unit:writingSpan` |
| wordFamily | `foreign` | label | `spans.md#loans` | A loan or opaque payload: a `literal` term |
| wordFamily | `tag` | link | `tag-pronouns.md#naming-with-a-tag` | Assigns a tag, or recalls one through `anaphor:tag` |
| wordFamily | `say` | frame:say | `permission-consent.md#say-words` | Covers the whole clause. Fixed by word shape: reach, whose say (`party`), answer, ending are `values` (`permission-consent.md#say-reach`) |
| xFamily | `role` | label | `roles.md#role-compounds` | |
| xFamily | `pointer` | link | `pronouns.md#role-pointers` | Read through `anaphor:pointer` |
| xFamily | `hookPrefix` | label | `hook-compounds.md#hook-prefixes` | |
| xFamily | `sake` | frame:sake | `sakes.md#word-shape` | The sake seam; read as `lexReading:sake` |
| xFamily | `scope` | label | `label-seams.md#reach-vowels` | How far a label reaches |
| xFamily | `lateral` | label | `viewpoint.md#viewpoint-laterals` | |
| xFamily | `holder` | frame:holder | `holder.md#naming-a-holder` | Fixed by word shape: the seam sits on its stance; `party` is the holder, marked `named` on `-n` / `-ln` as the same name in a role is, and on `-r` ("someone already named", read as the name it resumes). The topic pronoun is a pronoun with the topic it is bound to as its antecedent (`topic.md#topic-pronoun`); the listener is the listener term, as `zawan` is in a role |
| xFamily | `ability` | frame:ability | `can-and-cant.md#ability` | Inside the verb or adjective word; reaches that word's claim |
| xFamily | `numeric` | label | `numeric-derivation.md` | Number + `x` + root |
| xFamily | `compound` | label | `compounds.md#two-roots-one-word` | |
| overlay | `sake:th` | frame:sake | `sakes.md#word-shape` |  |
| overlay | `sake:w` | frame:sake | `sakes.md#personal-possession` | adjective reach |
| overlay | `evidential:th` | frame:stance | `knowing.md#live-vs-memory` | On your own claim, row 1 with the frame in `notes` (D8); a stance number beside it goes to the notes too |
| overlay | `evidential:w` | frame:stance | `universality.md#mood-on-one-adjective` | adjective reach |
| overlay | `mirative:th` | frame:mirative | `mirative.md#mirative` |  |
| overlay | `residue:h` | frame:residue | `residue-and-former.md#residue` |  |
| overlay | `residue:w` | frame:residue | `universality.md#mood-on-one-adjective` | adjective reach |
| overlay | `former_climate:h` | frame:residue | `residue-and-former.md#former-climate` |  |
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
| overlay | `clause_hinge:th` | frame:hinge | `causation.md#if` | *Only because* (`because-and-iff.md#choosing-a-hinge`): a `thebem` with no `/b/`, right before a `thahum` that has one, takes its condition: the same `hosted` term, and its own `grounds` link when the condition is the next sentence |
| overlay | `clause_hinge:g` | frame:hinge | `causation.md#if` | on a noun; frame by default. *Depends on* (`because-and-iff.md#choosing-a-hinge`, `gebem gahum`): a `gebem` detail with no `/b/`, right before a `gahum` detail of the same noun that has one, takes its condition: the same `hosted` term (`/ɡ/` takes no `blarl`) |
| overlay | `clause_hinge:h` | frame:hinge | `dependents.md#hinges` | whereas, so … that; frame by default |
| overlay | `clause_hinge:*:while` | detail:time | `dependents.md#hinges` | time hinge, any PoS |
| overlay | `clause_hinge:*:until` | detail:time | `dependents.md#hinges` | time hinge, any PoS |
| overlay | `clause_hinge:*:by` | detail:time | `dependents.md#hinges` | time hinge, any PoS |
| overlay | `clause_hinge:*:before` | detail:time | `dependents.md#hinges` | time hinge, any PoS |
| overlay | `clause_hinge:*:after` | detail:time | `dependents.md#hinges` | time hinge, any PoS |
| overlay | `clause_hinge:*:as-of.ledger` | detail:time | `as-of.md#as-of` | as-of, any PoS; on `/th/` it dates the stance |
| overlay | `clause_hinge:*:as-of.bookmark` | detail:time | `as-of.md#as-of` | as-of, any PoS; on `/th/` it dates the stance |
| overlay | `cause:th` | frame:hinge | `cause.md#mechanism` |  |
| overlay | `cause:w` | frame:hinge | `cause.md#mechanism` | adjective reach; frame by default |
| overlay | `list_verb:v` | structure | `list-verbs.md#list-verbs` | as `lexReading:listVerb` |
| overlay | `join_relation:g` | detail:relation | `join-relations.md#join-relations` |  |
| overlay | `join_relation:h` | detail:relation | `join-relations.md#join-relations` |  |
| overlay | `locative:h` | detail:place | `locative-relations.md#locative-relations` |  |
| overlay | `locative:g` | detail:place | `locative-relations.md#locative-relations` |  |
| overlay | `likeness:h` | detail:likeness | `clause.md#extra-nouns` |  |
| overlay | `likeness:g` | detail:likeness | `relations.md#likeness` |  |
| overlay | `exchange:h` | detail:relation | `relations.md#exchange` |  |
| overlay | `exchange:g` | detail:relation | `relations.md#exchange` |  |
| overlay | `proxy:h` | detail:relation | `relations.md#proxy` |  |
| overlay | `proxy:g` | detail:relation | `relations.md#proxy` |  |
| overlay | `stimulus:g` | frame:sake | `sakes.md#personal-possession` | a sake about a noun you do not possess; nests under its noun |
| overlay | `of_relation:h` | detail:relation | `of-relations.md#of-relations` |  |
| overlay | `of_relation:g` | detail:relation | `of-relations.md#of-relations` |  |
| overlay | `phasal:h` | frame:phase | `already-still-yet.md#stage-of-change` |  |
| overlay | `phasal:w` | frame:phase | `already-still-yet.md#stage-of-change` | adjective reach |
| overlay | `phasal:th` | frame:phase | `already-still-yet.md#stage-of-change` |  |
| overlay | `attempt:h` | frame:intention | `try.md#trying` |  |
| overlay | `want:th` | frame:intention | `want-and-decide.md#want` |  |
| overlay | `pairing:w` | link | `list-structure.md#respectively` | *Respectively*: pairs two lists' members by position |
| overlay | `mention:g` | structure | `spans-as-words.md#mention` | fills a `literal` term |
| overlay | `likeness:cite` | detail:likeness | `same-role-words.md#same-role-like` | same-role words |
| joinSeries | `a` | structure | `joins.md#and-lists-a` | A list term, set *and*; on a verb list, a claim per verb (`verb-and-stance-joins.md#vp-clause-forms`) |
| joinSeries | `o` | structure | `joins.md#rank-o` | A list term, rank |
| joinSeries | `ao` | structure | `rank-joins.md#route-ao` | A list term, in order |
| joinSeries | `u` | frame:polarity | `joins.md#negation-u` | List reach: a list join denies only its items, so it nests in its list term (rule 2) and does not pair. On `/v/` it denies the verb (`verb-and-stance-joins.md#vp-clause-forms`); on `/th/` the stance words right before it, so it sits in their [stance list](#terms) (`verb-and-stance-joins.md#stance-joins`, `verb-and-stance-joins.md#stance-join-reach`). A standalone `/th/` join (`thul`, `thum`, `thur`) has no stance words right before it and says how to take the whole claim, so it pairs (`verb-and-stance-joins.md#standalone-stance-joins`). A `zul` fence with no items and a shared kind is `u:kind`. Two `u` lists in one clause: every pairing denied, `neg(T[a][b])` (D9) |
| joinSeries | `u:kind` | frame:binder | `universals-domains.md#universals-domains-generics` | *No K*: a `zul` fence (any role level) with no items and the kind on shared `/ɡ/`, "the same shape with `u`" as *every K* (`zul gogozel vehohel.`; with no verb, *there is no K*: `zul godozel.`). The fence binds as `ua` does and hosts its list; the `u` denial is the frame's `inner` (a `joinSeries:u` polarity frame on the same word), not a frame on the list term. Its shared word is `shared:kind` |
| joinSeries | `ua` | frame:binder | `joins.md#everything-ua` | *Every K* / *everything but X* (`universals-domains.md#universals-domains-generics`); reaches from where it stands to the end of its sentence. On `/th/` after stance words (`thual`, *every ground but these*), it sits in their [stance list](#terms) (`verb-and-stance-joins.md#stance-joins`) |
| joinSeries | `uo` | frame:binder | `rank-joins.md#invert-u-stacks` | Ranked counterpart of `ua`; frame by default. On `/th/` after stance words, it sits in their [stance list](#terms) (`verb-and-stance-joins.md#stance-joins`) |
| joinSeries | `e` | structure | `joins.md#choice-e` | A list term, choice |
| joinSeries | `ae` | structure | `set-joins.md#full-single-item-and-standalone-inventories` | A list term |
| joinSeries | `oe` | structure | `set-joins.md#full-single-item-and-standalone-inventories` | A list term; with a shared scale a tie, `tie(S, A, B, E)` per ordered pair; closed `-l` clashes with rank `o` on the same scale; with a verb each member's act holds (D17) |
| joinSeries | `ue` | frame:polarity | `set-joins.md#exclusivity-and-denying-a-whole-list` | List reach, as `u`; frame by default. Row 2 on each item; nothing for the outside item (D7). With no verb, a fragment |
| anaphor | `content` | link | `pronouns.md#resume-r` | Whole-stem resume |
| anaphor | `number` | link | `pronouns.md#resume-r` | A number resumed with `-r` |
| anaphor | `role` | link | `pronouns.md#resume-r` | Resume by role compound |
| anaphor | `pointer` | link | `pronouns.md#role-pointers` |  |
| anaphor | `tag` | link | `tag-pronouns.md#naming-with-a-tag` | A bound tag names each member in turn (`universals-domains.md#bound-tags`) |
| anaphor | `topic` | link | `topic.md#topic-pronoun` |  |
| anaphor | `landmark` | link | `hooked-joins.md#hooked-joins` | A hooked join's landmark pointing back |
| ask | `yesNo` | frame:force | `questions.md#question` | `AskRecord`: the question type is a `value` of the force frame |
| ask | `fillAsk` | frame:force | `questions.md#fill-ask` | The blank is a `blank` term; the fill job binds each `blank` term; `follows` / `couldBe` answer `beyond` |
| ask | `rhetorical` | frame:force | `more-turn-words.md#rhetorical` |  |
| ask | `none` | structure | `questions.md#question` | Not a question |
| answer | `answer` | link | `questions.md#fill-ask` | A reply filling a blank |
| shared | `distribute` | link | `list-structure.md#shared-after-the-join` | SHARED describes each member. A hook right after a noun list's join word ("is SHARED, like an adjective there: it belongs to every item") is read by its `hookJob` row into the list's `sharedDetails` with role `distribute`, not into the claim's details; the parser keeps it a clause unit and gives it no `SharedRecord`, so it has no `shared` link. A hosted `/ɡ/` + `/b/` and a verb join's shared `/d/`, `/b/` or `/h/`: a detail of each member (row 14) / a part of each verb's term. A hosted relation with no `bl-` word: each member to each other member |
| shared | `collective` | link | `collectives.md#verbs-v` | The list acts as one. On a `/ɡ/` adjective, the list as one, `isa(ls(..), K)`; no member facts |
| shared | `scale` | link | `list-structure.md#shared-after-the-join` | A shared scale word after the join; one item before `o`: the superlative, `most(S, A)`, or with an ordinal on `/w/` a place, `place(S, A, N)` (D22) |
| shared | `equative` | link | `list-structure.md#shared-after-the-join` | A tie, `tie(S, A, B, E)` per ordered pair; closed `-l` clashes with rank `o` on the same scale; with a verb each member's act holds (D17) |
| shared | `kind` | link | `universals-domains.md#universals-domains-generics` | The kind after a `ua` / `uo` fence, or after a *no K* `zul` fence (`joinSeries:u:kind`) |
| shared | `ordinary` | link | `list-structure.md#shared-after-the-join` |  |
| ending | `l` | label | `phonology.md#word-edges` | |
| ending | `m` | label | `word-endings.md#abstract-m` | |
| ending | `n` | label | `proper-names.md#name-instance--ln` | Named reference; the term's `named` |
| ending | `ln` | label | `proper-names.md#name-instance--ln` | |
| ending | `r` | link | `pronouns.md#resume-r` |  |
| ending | `rl` | link | `dependents.md#dependent-clauses` | Stand-in for the dependent that follows |
| ending | `rm` | link | `stand-in-vowels.md#stand-in` | |
| ending | `rn` | link | `stand-in-roles.md#speech-act-verbs` | |
| ending | `rth` | link | `stand-in-vowels.md#stand-in-back` | |
| slot | `adj` | detail:adjective | `clause.md#adjectives-ɡ` | A `/ɡ/` on a noun: a detail of that term |
| slot | `w` | detail:degree | `clause.md#adjective-detail-w` | A plain `/w/`; a `/w/` frame form takes its `overlay` row with adjective reach |
| slot | `hosted` | structure | `clause.md#extra-nouns` | The hosted `/b/`: its host's landmark or content |
| slot | `gl` | detail:adjective | `left-bound-adjectives.md#left-bound-adjectives` | |
| slot | `asOf` | detail:time | `as-of.md#as-of` | |
| slot | `grounds` | link | `evidentiality.md#evidence-clause` | `blarl`: the next sentence is the content of the frame it hosts on (see [links](#links)) |
| slot | `boundJoin` | structure | `joins.md#standalone-phrase` | A join as a `bl-` partner (`blal` *nobody*) |
| slot | `newMember` | frame:binder | `joins.md#everything-ua` | **Added.** A `/z/`, `/d/` or plain `/b/` phrase that brings in a new member (decided 2026-11-17): a lone first-mention noun, concrete `-l` or abstract `-m` (`word-endings.md#concrete-l`, `#abstract-m`), a root or an `x` compound, a tag may name it, or a "new one" pointer in `-l` (`pronouns.md#a-new-one`; settled 2026-11-19, `joins.md#new-member-in-a-statement`: it stands for the noun it copies written out, and after a name it is a new thing the name applies to; `sameReadings` spells the frame's word as the antecedent's head written out), and its adjectives (a number among them, `numbers.md`) sit inside the phrase; an and-list of such nouns, fenced or not, scoped as one phrase at its position; a phrase whose join is the unspecified member `-r` (`zar`, `joins.md#unspecified-member-r-phrase`). A hook's landmark counts (*at a house*). Not a new member (decided 2026-11-17): a fill-ask blank, which asks (`questions.md#fill-ask`; the resolve stage's ask gaps, so two blanks make no pair), a measure phrase, an `-m` unit noun carrying a `/ɡ/` number, which gives an amount (`measures-and-percent.md#units`; a counted `-l` noun and an `-m` noun with no number keep the frame), and the phrases on either side of a titling `-n` hook, a name's wording (`proper-names.md#titled-phrases`). A role phrase of a verb-list item is one of that item's reading (no scope record: the reader places the frame, as for a stance word in an island); one every verb shares is the clause's. The frame keeps the phrase's first word and hosts its term (the role's, or the hook's landmark). No construction id |
| slot | `tag` | link | `tag-pronouns.md#naming-with-a-tag` | After a `zual` / `zuam` / `zul` fence it binds (`universals-domains.md#bound-tags`) |
| slot | `bar` | frame:bar | `bars.md#bars` | Inside the rank fence: covers only the ranking, so it nests (rule 2) and is never in a pair |
| slot | `th` | frame:attitude | `feelings.md#speaker-attitude` | **Added.** A plain `/th/` word on an ordinary root: speaker attitude (*hopefully*; a feeling root such as *angry*, "Any feeling root works the same way", `feelings.md#speaker-attitude`) and speech manner (`speech-manner.md#speech-manner`). Whole clause. No construction id yet: today it reads as `lexReading:ordinary` |
| slot | `dependent` | structure | `dependents.md#dependent-clauses` | `Clause.dependent`: a nested reading in the stand-in's term |
| edge | `vocative` | frame:call | `speech-moves.md#vocative` | Names the addressee (`party`); in the scope record, and commutes with every frame. The log gives each turn its `addressees` (`LogEntry`): its own calls, the frames on its utterance's first body; else its speaker's last call; else, with two speakers, the other one (decision D16 of `solver-coverage.md`). A reading with only a call claims nothing |
| edge | `interjection` | frame:attitude | `speech-moves.md#interjections-reactions` | A reaction |
| edge | `polar` | link | `questions.md#polar-particle` | Replies to the yes / no question before it; a body after it is the answer |
| edge | `force` | frame:force | `speech-moves.md#speech-act-statement-question-command` | On the turn's left edge, outside the body; firm / soft / for-now ending is a `value` (`firm-soft.md#firm-or-soft-act`); a stack's first word is the act (`more-turn-words.md#stacked-acts`) |
| edge | `hook` | link | `hooks.md#discourse-hooks` | The left-edge hook; read as `hookJob:discourse` |
| edge | `tone` | frame:attitude | `tone-marks.md#showing-your-tone` | Voice only, never the act. Reach by `tone.scope.*` (the resolve stage's `ToneRecord`): a word or span tone is a frame on that word's term, detail or frame (its `inner`); an island tone, on the island's reading; a free-standing tone at the start of its sentence (`ToneRecord.initial`), a whole-clause frame of the clause its first colored body word sits in, placed just before that word; a free-standing tone later in the sentence, a frame on each word it colors (up to the period or the next free-standing mark), with no clause reach. No word carries a tone: its frame's `words` is empty, and `values` hold `mark`, `names` and `scope` |
| body | `sentence` | structure | `clause.md#who-acts-and-the-action` | A body and its punctuation |
| body | `fragment` | structure | `spans.md#asides-th` | A body with no clause |
| body | `topicMarker` | link | `topic.md#topic` | Sets the topic later pronouns follow |
| reading | `existence` | structure | `predication.md#existence` | Claim shape: no verb |
| reading | `unsaidEvent` | structure | `predication.md#unsaid-event` | Claim shape: the verb is unsaid |
| reading | `kind` | structure | `universals-domains.md#kind-reference` | A `thing` term naming the kind itself |
| reading | `amountScale` | detail:degree | `vague-amounts.md` | frame-or-detail unclear; see report |
| reading | `frequencyScale` | detail:degree | `comparative-arity.md#frequency-scale` | The scale a rank join ranks by, *how often*: a shared detail on the list term, never a restrictor on the clause |
| reading | `bareQuestion` | frame:force | `questions.md#question` | No body: asks about what was just said |
| reading | `greeting` | frame:force | `word-endings.md#greeting` | The named citation alone, in a turn with nothing on its left edge; a one-name reply after `yal` is an answer (`questions.md#fill-ask`). The frame keeps the name and hosts the role's term. A bid on the citation (`alahexon.`, no `/y/`; `conversation-length.md#conversation-length`) sits on the left edge and is this frame too; under `/y/` it is a call. Never pairs: a greeting turn holds no other frame |
| reading | `verbFirstItem` | structure | `verb-and-stance-joins.md#vp-clause-forms` |  |
| reading | `verbSharedNoun` | link | `verb-and-stance-joins.md#vp-clause-forms` | An argument shared by joined verbs |
| reading | `fromTo` | detail:range | `ranges.md#ranges` |  |
| reading | `feelingLandmark` | structure | `feelings.md#feeling-whose-stake` | The `bl-` is the urge's landmark |
| reading | `feelingStake` | structure | `feelings.md#feeling-whose-stake` | No frame of its own: the `bl-` is the `party` of the feeling word's sake frame (`lexReading:sake`), "the need is theirs, and the feeling is yours" |
| word | `plural` | label | `plurality.md#associative` | On a verb it is collective (`collectives.md#verbs-v`) |
| word | `hookedJoin` | detail:bound | `hooked-joins.md#hooked-joins` | "the hook now says which members count: the ones that stand in that relation to the landmark": the list term's `bound`, or the blank's detail |
| word | `rangeMember` | detail:range | `ranges.md#ranges` | |

## Links

Each link type joins two readings, or a word and a reading. Confirmed against its page:

| Link | Record or key | Anchor |
|------|---------------|--------|
| Pronoun, role pointer, topic pronoun, tag | `AnaphorBind` | `pronouns.md#resume-r`, `pronouns.md#role-pointers`, `topic.md#topic-pronoun`, `tag-pronouns.md#naming-with-a-tag` |
| Landmark pointed back to by a hooked join | `anaphor:landmark` | `hooked-joins.md#hooked-joins` |
| Item shared by a list's members | `SharedRecord` | `list-structure.md#shared-after-the-join` |
| Argument shared by joined verbs | `sharedUnits` on `VpCoord` | `verb-and-stance-joins.md#vp-clause-forms`; `reading:verbSharedNoun` |
| *Respectively* pairs, to its partner list (`partners`, from the resolve stage's `PairingRecord`) | `overlay:pairing:w` | `list-structure.md#respectively` |
| Reply filling a blank | `AnswerRecord` | `questions.md#fill-ask` |
| Stand-in to the dependent it stands for | `lexReading:standIn`, `ending:rl` / `rm` / `rn` | `dependents.md#dependent-clauses`, `stand-in-vowels.md#stand-in`, `stand-in-roles.md#speech-act-verbs` |
| Stand-in pointing back: `to` the most recent content of its vowel's kind, by the act vowels (`a` a statement, `e` a question, `o` an instruction, `u` *not* / *lest* content): an earlier sentence by its act word (none states), or a dependent a stand-in of that vowel fills in it (`durl …`), the sentence before its dependents; no `to` when there is none | `ending:rth`, `lexReading:standInBack` | `stand-in-vowels.md#stand-in-back` |
| Sentence linker to the one sentence before it | `unit:linker` | `sentence-linkers.md#sentence-linkers` |
| What carries past a period | | `sentence-linkers.md#past-a-period` |
| **Added:** discourse hook to prior talk (`-r`: `to` an earlier stretch; `el` / `em` / `ul` / `um`: `to` the sentence before, the claim it replaces or makes an exception to) | `hookJob:discourse`, `edge:hook` | `hooks.md#discourse-hooks`, `discourse-hooks.md#discourse` |
| **Added:** in-clause hook pointing back to a landmark: `resumed` the latest extra-noun hook detail in an earlier sentence (for stacked vowels, the latest with the same vowels), its `hosted` the landmark, and `to` its sentence; neither when there is none | `hookJob:resume` | `in-clause-hooks.md#hook-resume` |
| **Added:** frame content in the next sentence (`blarl`): a hinge's condition, a channel's grounds | `slot:grounds` | `causation.md#if`, `dependents.md#hinges`, `evidentiality.md#evidence-clause` |
| **Added:** a carried frame: a channel, holder, NOTIONAL, or dated offset that goes on over later bare sentences. One `carriedFrame` link per inherited frame, `to` the reading that set it, `frame` that reading's frame; a dated channel's link also holds its offset words. Settled 2026-11-18: a holder on MAY carries and the MAY does not (`holder.md#naming-a-holder`); only a channel on the main clause starts or ends a frame, never one in a dependent or on one clause-join member (`evidentiality.md#carry-forward`); the grounds after `blarl` sit in the body that takes the frame (decision 16, no page edit); a carried frame covers what you claim, never your own stance (decision 15, `evidentiality.md#carry-forward`): a statement whose clause has WANT, PLAN or DECISION neither takes nor ends it, and on a statement with a speaker attitude (`slot:th`) or a feeling word on `/th/` (a sake word with a moved horizon, `how-you-feel.md#feeling-word`) the claim takes it and the link's `coveredBy` lists those frames, which sit over it. The order is a link field, not an `order` entry, because the carried frame is never in the later reading's `frames` | `ResolveInfo.carried` (`BodyCarry` → `CarriedFrame`); `carry:channel`, `carry:holder`, `carry:notional` | `evidentiality.md#carry-forward`, `holder.md#naming-a-holder`, `notional.md#notional-as-if-framing`, `dated-channel.md#counting-from-now` |

| **Added:** a polar word replying to the yes / no question before it | `edge:polar` | `questions.md#polar-particle` |
| **Added:** a bound tag, naming each member of a `zual` / `zuam` fence in turn, to the end of its sentence and through the stand-ins in it | `slot:tag`, `anaphor:tag` | `universals-domains.md#bound-tags` |
| **Added:** a topic set by an `/x/` word, which later pronouns follow | `body:topicMarker` | `topic.md#topic` |

The grounds link and the carried frame shape the reading: a hinge whose condition is `blarl` gets that next sentence's reading as its `content` through the link, and a carried frame appears on a later reading as a link to the reading that set it, never as a copied frame.

## Scope statements

Per family: the forms that reach the whole clause, then every sentence on its pages that states a scope order against another frame, quoted.

### hinge

**Whole clause:** the `/th/` hinges (`overlay:clause_hinge:th`, `overlay:cause:th`). The `/h/` time hinges are details; the `/ɡ/` hinges sit on a noun. A hinge with `blarl` is "kept together last in the main sentence" (`dependents.md#hinges`), so every other frame word comes before it in text.

- `dependents.md#hinges`: "*Because* is your stance on why the claim holds, *so that* is your own aim for the event, and *although* is your expectation that the first event would normally have stopped the second, so they take `/th/`."
- `causation.md#if` (against `force`): "A command or request makes no claim, so an *if* hinge on it limits the instruction instead: do this only in that case."
- `because-and-iff.md#choosing-a-hinge` (two hinges): "*Only because* stacks two hinges: `thebem` (the outcome needs it), then `thahum` with the condition (and it is a fact)."
- `cause.md#mechanism` (CAUSE with a hinge): "English *habit* / *triggered by*, when a trigger is how the act is produced, uses this same stack: `thewom` right before the hinge, and the trigger in the hinge's `/b/`."
- `usually-vs-must.md#how-things-work` (against `occasion` and `binder`): "A [cause or condition](/causation) on a general claim says how things work. It holds for *each* member or occasion, the same way the verb does."

### stance

**Whole clause:** MAY, the channels, and deduction on `/th/`. On `/w/` they have adjective reach.

- `universality.md`: "In Ageben the mood words, which say how you know something or how it stands, cover the whole sentence: the `/th/` words MAY and the channels, …"
- `evidentiality.md#evidence-clause` (against `hinge`): "A cause or condition word may not come before the channel. Put the channel first (`theyom thahum blarl`) to say both that you inferred it and that it was caused."
- `usually-vs-must.md#how-things-work` (against `hinge`): "The channel stays on the main sentence. For the whole generalization, put it first, before the fence and the hinge, as with the evidence clause: …"
- `usually-vs-must.md#general-claims` (channel against `binder` and `occasion`): "Like any stance word, it covers what comes after it … Put first, before the universal fence or restrictor, it says how you know the whole generalization"; "After the fence or restrictor, the channel says how you know each case instead" (`zual gogozel vezuvel thugel.`).
- `usually-vs-must.md#general-claims` (against `occasion`): "The fence says how far the claim reaches, and the channel says what it rests on. Keep the two apart: *always, as far as I have checked* is closed `hual` with a weak channel, because you claim no exceptions on thin evidence."
- `evidentiality.md#carry-forward` (against another speaker): "The frame is yours. It covers only your own claims, and someone else who replies never inherits it."
- `evidentiality.md#carry-forward` (against `quote`): "A quote keeps its speaker's frame: nothing carries into it from outside, and your own frame resumes after it."
- `evidentiality.md#carry-forward` (a channel below the main clause): "A channel starts or ends a frame only on the sentence's main clause. A channel inside a dependent or on one member of a clause join is about that part alone."
- `holder.md#naming-a-holder` (MAY under a holder): "A holder on MAY carries too, but the MAY stays on its own sentence."
- `evidentiality.md#carry-forward` (a carried frame against `intention`, `attitude` and a feeling word): "The frame says how you learned a claim, so it never covers your own stance. A sentence that only plans, wants, or decides claims nothing: it takes no frame and does not end it, and your next statement picks the frame up again. An attitude or a feeling about a claim leaves the claim under the frame, and the feeling stays yours, outside it."
- `want-and-decide.md#whose-intention` (against `force`): "… just as a channel in a question asks about the listener's grounds …"
- `already-still-yet.md#stage-of-change` (MAY against any `/th/` word): "Like any stance, *not yet* can take MAY in front of it, when you are not sure the change has still not come." The sample (`zalazun thomam thelom vudurul`) has MAY right before the word it covers; MAY elsewhere in the clause follows text order (`clause.md#which-covers-which`).
- `usually-vs-must.md#how-things-work` (MAY against `binder`): "*Maybe every cat sleeps* is [MAY](/knowing#may) on the same clause."

### holder

**Whole clause:** the holder seam reaches its clause and any dependent inside it. Fixed by word shape: it sits on its stance.

- `holder.md#what-the-holder-covers`: "Each clause has one holder. The holder covers its clause and any dependent sentence inside it; a new `/x/` sentence is yours again unless it has its own seam word. A dependent with its own seam word switches holder for that sentence only."
- `holder.md#what-the-holder-covers` (against `force`, `say`, speaker attitude): "Pronouns, speech moves, and speaker attitudes stay yours: `uwen` is still you, the sentence is still your turn, and *hopefully* is still your hope."
- `holder.md#holder-plans-and-motives` (against `hinge`): "The so that hinge alone is your aim; after a holder it is the holder's, …"
- `holder.md#what-the-holder-covers` (against `sake`): "The first sake word has no holder, so it is yours. The second is Azozon's."
- `holder.md#what-the-holder-covers` (against `polarity`): a standalone stance join is a row of the holder table ("how you take the claim" / "how the holder takes it"), and "The no-judgment is Azozon's, like any other stance word under the holder. To take no view yourself, say it in a sentence of its own, with no holder." (`zazozon vowurol thul thevumazozon.`)
- `holder.md#what-the-holder-covers` (against `occasion`): "On MEMORY this is the history you both know, so a sweeping *never* or *always* covers only the times you both remember: …"
- `holder.md#what-the-holder-covers` (which stances take one): "Only the seven channels and MAY take a holder: they are the ways you can have access to someone else's view." `notional.md#follow-up-endings-notional` adds NOTIONAL, and `want-and-decide.md#whose-intention` adds WANT, PLAN, and DECISION after a holder.

### intention

**Whole clause:** PLAN, WANT, DECISION on `/th/`; the attempt adverb on `/h/`.

- `intention.md#plan`: "PLAN covers the whole sentence. Next to another word that covers it, the earlier of the two covers the later" (`clause.md#which-covers-which`). The plan stays yours when someone else does the act.
- `try.md#trying`: "it covers the whole clause, and next to another word that does, the earlier of the two covers the later" (`clause.md#which-covers-which`).
- `try.md#fallback` (against a joined clause): "An intention adverb covers only its own clause, so the backup above is a plain *Azozon sings*."
- `want-and-decide.md#want` (within the family): "A want and a plan are different steps, so they stack in that order:"
- `want-and-decide.md#endings-changeability` (within the family): "A want comes before both, so the three stack in the order want, plan, decision:"
- `want-and-decide.md#whose-intention` (against `force`): "In a question, a bare WANT, PLAN, or DECISION asks about the listener's mind, with no holder."

### ability

**Whole clause:** the hostless ability adverb on `/h/`. The `x` seam form reaches its own verb or adjective.

- `can-and-cant.md#intention-adverbs`: "alone, its place changes nothing, and next to another word about the whole claim, the earlier of the two covers the later" (`clause.md#which-covers-which`).
- `can-and-cant.md#ability-fallback`: "Prefer the verb itself whenever one root is enough." The seam form (`vowuroxam`) reaches only its verb, so every whole-clause frame sits over it (rule 2): that is the frame-over-ability reading of each `ability` pair, said today.

### phase

**Whole clause:** the `/h/` and `/th/` words. On `/w/` they have adjective reach.

- `already-still-yet.md#stage-of-change`: "When only one `/ɡ/` adjective is still or no longer so, write the same word under `/w/` immediately before that adjective."

No sentence states an order against another frame.

### residue

**Whole clause:** RESIDUE and FORMER on `/h/`. On `/w/` they have adjective reach.

- `residue-and-former.md#former-climate`: "Put RESIDUE and FORMER on `/h/`, anywhere in the sentence: like an intention adverb, each covers the whole clause."
- Same section (against `contrary`): "Neither follows `uom` (contrary to): neither is something the event could go against."
- Same section (against `occasion`, word position only): "Do not write `helam` right before `hual`: that spot holds the restrictor's list of occasions (*always except when …*)."
- Same section (FORMER against `occasion`): `zazozon hual vozuyel helam.` is "Azozon always used to sing": FORMER says "a usual pattern held, but you are not claiming it holds now", so it sits over the restrictor. No sentence orders RESIDUE against a restrictor.

### notional

**Whole clause:** NOTIONAL on `/th/`; carries forward. On `/w/` it has adjective reach.

- `notional.md#notional-as-if-framing`: "NOTIONAL carries forward like a channel, so a story you make up, or a supposition you reason through, runs over several sentences."

No sentence states an order against another frame.

### mirative

**Whole clause:** MIRATIVE on `/th/`.

- `mirative.md#mirative`: "`themem` says the whole claim was unexpected." The page says it "is not a channel" and to add a channel beside it; it states no order between the two, so text order holds (`clause.md#which-covers-which`).
- `mirative.md#mirative` (against `force`): "In a question MIRATIVE stays yours, outside what is asked, as a speaker attitude does: the surprise is your own, so the question asks only about the claim".

### contrary

**Whole clause:** `uom` + its word frames the claim; the word after `uom` is the frame's content, not a frame on the claim.

- `contrary-to.md#contrary-to-stance` (against `stance`, `intention`): "Only the stance right after `uom` is what the event goes against. A stance anywhere else in the clause still applies to the claim:"
- `contrary-to.md#contrary-to-holder` (against `holder`): "A holder on a channel after `uom` names whose view the event goes against. The holder covers only that pair: the event is still your claim."

### occasion

**Whole clause:** the `/h/` restrictors. On `/w/` they have adjective reach. The frame holds its occasion list.

- `restrictors.md#on-the-following-adjective-w`: "An `/h/` restrictor, by contrast, limits the whole clause."
- `restrictors.md#only-when-never-hal` (its occasions): "occasion words first, the restrictor last, the way a join word ends a list"; "With a restrictor after them, they would be its occasions instead, since a restrictor's list is the whole run of `/h/` words right before it." An `/h/` word with a frame reading of its own is an occasion there, not a frame (`residue-and-former.md#former-climate`: "that spot holds the restrictor's list of occasions"), so `zazozon helam hual vozuyel.` and `zazozon hual vozuyel helam.` read differently.
- `more-occasions.md#occasions-vs-a-dependent-when` (against `hinge`): "A restrictor lists occasion words; a whole sentence as the occasion takes a hinge word and **`blarl`**."
- See `stance` and `holder` above for the statements against `occasion`.

### force

**Whole clause:** the act word, on the turn's left edge outside the body. Every frame in the body sits under it in the tree (rule 2).

- `speech-moves.md#speech-act-statement-question-command`: "Each turn does one thing: it states, asks, commands, or forbids."
- `more-turn-words.md#stacked-acts` (within the family): "the *first* is what you really do, and the *second* is how it sounds." Each act word is a frame; the first covers the second.
- `more-turn-words.md#doubled-act` (within the family): "The act stays the same and only grows more insistent; the repeat never cancels it." The two frames commute.
- `quote-contents.md#quote-acts` (against `quote`): "The outer sentence is still your claim (*said*), and `yel` or `yol` belongs to the quoted talk."
- `spans.md#asides-th` (against an aside): "a clause with the same speech act as the outer sentence (both statements, both questions, or both commands)."
- `questions.md#embedded-whether` (against a dependent): "The whole sentence is still a statement, so do not write `yel` at its start."
- `tone-marks.md#showing-your-tone` (against `attitude`): "It never changes the speech act (that is the act word's job)".
- See `hinge`, `stance`, `holder`, and `intention` above for the statements against `force`.

### call

**Whole clause:** a call on the turn's left edge names who the turn is for; it frames each sentence body of its turn.

- `speech-moves.md#vocative` (against every family, itself included): decided 2026-11-17, a call commutes with every other frame in its clause. The prose unit after R6d states it on the page.

### polarity

**Whole clause:** a standalone `/th/` `u` join (`thul`, `thum`, `thur`), which has no stance words right before it and says how to take the claim (`verb-and-stance-joins.md#standalone-stance-joins`): it pairs with other whole-clause frames. A *no K* `zul` fence is a binder carrying its denial (`joinSeries:u:kind`). Any other `u` join denies only its list, so it nests in its term and every whole-clause frame on the clause sits over it; on `/th/` that term is the [stance list](#terms) of the stance words it closes, one or several. *Possibly not* and *not possibly* are told apart by where the `u` goes: on the verb (`vowurol vul`, under MAY by rule 2) or right after MAY (`thomam thul`, denying MAY). With other words between MAY and the join, MAY is a frame of its own and the join is standalone (`verb-and-stance-joins.md#stance-join-reach`).

- `joins.md#negation-u`: "Because the denial is a join, it reaches only the items in its list: `zazozon zul` denies who it is, and leaves the rest of the sentence standing."
- `verb-and-stance-joins.md#stance-joins` (against `stance`, `hinge`): "The join works only on the stance words before it, so the claim itself still stands and only its grounds are denied or ranked."
- `verb-and-stance-joins.md#stance-join-reach` (against every `/th/` frame): "A stance word with other words between it and the join is a stance of its own, and the join after it is standalone."
- `universals-domains.md#not-every` (against `binder`): "Where the denial goes changes the claim:" (`zual gogozel zul` is *not every cat*).

### say

**Whole clause:** the say word on `/h/`.

- `permission-consent.md#say-words`: "like an [intention adverb](/can-and-cant#intention-adverbs), it covers the whole clause."

No sentence states an order against another frame.

### sake

**Whole clause:** met, unmet, prescription and motive on the clause (`/th/`). On `/ɡ/` a sake word nests under its noun; inside a rank fence it is a bar.

- `bars.md#sake-bars`: "the same met word after the fence is about the whole claim".
- `for-a-sake.md#whose-stake`: "what the act serves is your stake, as you see it. A `/b/` names whose stake the act serves, not whose reason it is."
- `feelings.md#feeling-whose-stake`: "the need is theirs, and the feeling is yours."
- `for-a-sake.md#whose-stake` (against `force`): "A sake word on the clause stays outside a question: it is your own remark on what the act serves (with no `/b/`, your own stake), so the question asks only about the act".
- See `holder` above for the statement against `holder`.

### attitude

**Whole clause:** speaker attitude and speech manner on `/th/`; a tone mark at the start of the sentence; an interjection.

- `feelings.md#speaker-attitude`: "It is always the speaker's attitude, never the subject's, so it never says that the subject feels it."
- Same section (against `stance`): "Hope says how you feel about the claim; the channel says what backs it."
- `speech-manner.md#speech-manner`: "Like any stance word, it may sit anywhere in the sentence; the start is usual."
- `tone-marks.md#showing-your-tone` (within one mark): "A stack has no spaces and its order does not matter", so a stack is one frame.
- [`tone-marks.md#showing-your-tone`](../grammar/intermediate/tone-marks.md#showing-your-tone): "A free-standing mark at the start colors the whole sentence. One later in the sentence colors only the words after it, and takes over from the earlier mark there, so two free-standing marks color separate stretches." So only a mark at the start is a whole-clause frame; a later one is a tone on each word it colors (`! zazozon % dodozel vayebel.`, `zazozon ! dodozel vayebel.`), and two such marks commute.
- `feelings.md#speaker-attitude` (against `force`): "It is always the speaker's attitude"; a drill reads `yem thavewom zalazun vayebel dadorol.` as *Honestly, does Alazun see the trumpet, I wonder?* (`speech-manner.md#intermediate-ageben-to-english`). In a question the attitude stays yours and is not asked.
- `feelings.md#speaker-attitude` (against `force`): "In a question the attitude still stays yours, outside what is asked".
- See `holder` above: speaker attitudes stay yours.

### bar

**Whole clause:** none. A bar sits inside its rank fence.

- `bars.md#channel-bars` (against `holder`): "Inside the fence the seam covers only the bar: the ranking itself is still your claim."
- `bars.md#bars`: "The same stance word after the fence has its ordinary reading, a stance on the whole sentence."

### quote

**Whole clause:** none on the outer clause. The quoted words are a nested reading.

- `quote-contents.md#quote-acts`: "A quoted question or command keeps its own act word inside the cite, the same way it keeps a tone mark."
- See `stance` above: "A quote keeps its speaker's frame".

### binder

**Whole clause:** a `ua` / `uo` fence and a phrase that brings in a new member (`slot:newMember`, decided 2026-11-17) each reach from where they stand to the end of the sentence, and on through a stand-in in it.

- Order (within the family and against any frame word): `clause.md#which-covers-which`, as `joins.md#everything-ua` says: "Such a phrase follows the order rule for words that cover the whole clause …: when a clause has two of them, or one and a stance word, the earlier covers the later." Reach: `joins.md#everything-ua`, "reaches from where it stands to the end of its sentence. Whatever comes later is inside it."
- A hook's landmark after a frame word on the hook (`zodozel vezuvel wal al bohehal.`, *never in a house*): the frame word comes first and reaches only the hook's phrase, so its binder nests under that frame word (rule 2; `clause.md#which-covers-which`, `in-clause-hooks.md#hook-w`) and does not pair.
- `universals-domains.md#bound-tags`: "A bound tag holds from the phrase that assigns it to the end of its sentence, and through every sentence a [stand-in](/dependents#hinges) in that stretch points to".
- `universals-domains.md#not-every` (against `polarity`): see `polarity`.
- Standing exception: the holder covers its clause (`holder.md#what-the-holder-covers`). A channel follows text order like any stance word (`usually-vs-must.md#general-claims`).
- See `hinge` and `stance` above (`usually-vs-must.md#general-claims`) for the statements against `hinge` and `stance`.
- What a universal commits to: closed `zual` claims no exceptions; open `zuam` "leaves the list of exceptions open … you only do not rule them out" (`universals-domains.md#not-every`).

## Reader rules

1. **One reading per clause.** A `BodyClause` gives one. A clause join gives one per member, held by a list term. A dependent, a hinge's clause, an island, and a quote give nested readings in `content`.
2. **Nesting comes only from the tree.** A frame sits inside another only where the parse tree nests them. A frame form with adjective reach nests under its adjective. A `/th/` join that closes stance words nests in their [stance list](#terms). A hinge or channel whose content is a `blarl` next sentence takes that reading through the [grounds link](#links), not by moving it.
3. **Frame order.** What is left after rule 2 is two frames that both reach the whole clause. The reader sorts every such pair of families into one of four kinds from the [pair table](#pair-table): **commutes** (records nothing), **fixed by word shape** (records the order in `order`, citing the word's section), **fixed by a rule** (copies it into `order`, citing the rule from [scope statements](#scope-statements) or the resolve stage), **unsettled** (puts the pair in `unordered`). No reader, consumer, or host picks an order for an unsettled pair; settling one is a grammar decision.
4. **Not stated stays empty.** A missing source, holder, or closure is absent from the reading, never defaulted. A carried frame is a link to the reading that set it, not a default.
5. **Pointers, not copies.** Every frame, detail, and term keeps its `LexWord`s, so a consumer can show the text, the gloss, and the position. A tone mark is the one frame with no word: it sits on the place it colors, and `ResolveInfo.tones` keeps its words.
6. **Pronouns keep both ends.** A pronoun term holds the resolver's `AnaphorBind` and, when bound, its antecedent's term. The reader never binds one itself.
7. **Numbers stay stems** in the reading; phase 2 adds their values for comparison.
8. **No row is an unknown frame.** A construction the reader meets with no row in the [classification table](#classification-table) becomes an `unknown` frame and an `unread` entry.

## The log

`Log` (`src/interpret/log.ts`) holds readings in order, each turn with its `speaker` and `at`. Each new turn is parsed together with the transcript so far, or the host's `window` of it, so the resolver's bindings cross turns with no parser change; the same turns always give the same log. The log closes each turn with a period before it joins the transcript. A turn that does not parse adds nothing and goes in `rejected`. The window is parsed with each sentence's speaker (`ParseOptions.speakers`, [stage 4](parser-pipeline.md#stage-4--resolve-ast--discourse-sidecar)), so a carried frame is per speaker.

A call, *yes* / *no*, or interjection closed by a period is its own utterance, so the next sentence reads as a new move ([past a period](/sentence-linkers#past-a-period)); the log keeps it as its own reading.

## Matching

`match(query, target)` (`match.ts`) compares two claims; the step conditions it shares with the [solver](solver.md) are in `steps.ts`. `ask(question, log, host)` (`ask.ts`) returns every logged reading, nested ones included, whose claim fits the question's: the blanks it binds, its **frame path** (the frames on the matched reading and on every reading that contains it), its unsettled pairs, and the switches it went through. Neither walks the parse tree, decides that a framed claim holds (the [verdict](#the-default-verdict) does), or picks an order for an unsettled pair (it travels with the match).

### Matching a claim

- **The question is read after the log's window.** `readQuestion` (`log.ts`) parses it as the next sentence of the window's transcript, so its pronouns bind through the resolver to the log's terms ([reader rule 6](#reader-rules)); the matcher follows that binding.
- **Verb** by root. **Roles** by letter, never by word order; a role the query leaves out matches anything.
- **Terms** by the host's referent when both resolve; otherwise by root, the query's details a subset of the target's. A pronoun matches through its antecedent, a literal by exact payload, a number by its value (`value.ts`), so the written and the spoken form of one number match.
- **A blank binds** to the target's term in that place. Its `at` names the place: `verb`, a role letter, `predicate.<i>`, or a detail path. `blankSites(claim)` (`host.ts`) lists the same ids, so a host keys held answers by them.
- **A number blank in a measure detail** binds to a target detail with the same key and the same number kind, at `<path>/number`.
- **A role missing from the outer claim** is looked for in the claim's scope islands ([scope islands](/scope-islands#scope-islands)): an island holds a chunk of the clause, so its `/b/` is still the clause's. The island's reading goes on the path (`Binding.islands`), so a stance inside it stays with the match.
- **A list's SHARED words** (D21, [shared after the join](/list-structure#shared-after-the-join)): each query word fits a target word as a detail does, so a rank or tie on one scale never fits one on another. A number under the word (a factor, [factor](/comparative-arity#factor); a place, [place on a scale](/comparative-arity#place-on-a-scale)) is compared both ways, so a plain rank or tie fits no ratio or place, nor the other way round. A rank or tie list (a SHARED scale or equative word) fits only one with the same ending, `-l` or `-m`.
- **A ratio fits its inverse** ([factor](/comparative-arity#factor)): a two-member `zoel` list with a factor also fits the list with its members swapped and the factor's value negated, since `ru` divides, so *twice as big* (`zazozon zalazun zoel gelazem hradol.`) fits *half as big* the other way round (`zalazun zazozon zoel gelazem hrudol.`). The scale and the ending still match as said.
- **A genitive on the clause** ([whose](/social-ties#genitive)): when the `/z/` role is a noun and the clause has no `/d/` or `/b/`, a genitive the reader puts on the clause is matched as a detail of the `/z/` noun, on both sides. So *does Ahelan's cat walk?* (`yel zogozel om bahelan vowurol.`) fits a list whose SHARED genitive is on each member (`zodozel zogozel zal om bahelan vowurol.`). With another role there, `om` may sit on that role's noun, so the genitive stays on the clause.
- **A member of a `u` list.** A query term that is not a list matches one member of a target `u` list ([negation](/joins#negation-u)); the list's frames go on the path (`Binding.listFrames`), so the denial travels with the match. This is not a switch.

### Question filters

Each frame on the question is a filter or not by this table; a later change is a row. A filter passes when the path carries a frame of the same family with equal `values` and, when the filter has a `party`, a party that matches it (compared as a one-role claim, so through referent and antecedent).

| Frame on the question | Filter | Why |
|-----------------------|:------:|-----|
| its own ask force | no | It is the question |
| `slot:newMember` binder | no | Decision 18: a question about a first-mention noun asks about such a thing, not one newly brought in, so the term matches by root or referent like a bare noun. Other binders stay filters |
| bar | no | It sits on its detail, not on the clause, so it is not among the question's frames |
| a frame on the [pass-through list](#pass-through-list), and MIRATIVE | no | Decision 25 (a): outside the act is outside what is asked. A later act word, a call, an attitude, a clause sake, contrary to a stance, or MIRATIVE ([mirative](/mirative#mirative)) asks the same thing as the bare question. `passThrough` decides, with the question's frames other than its ask force as `all` |
| every other family | yes | It changes what is asked |

- **A denied or excluded frame passes.** A path frame that a stance list denies (`u`) or excludes (`ua`, `ue`) still passes an equal filter, with its standing on the path (`PathFrame.lists`; `negated()` tells it). Whether the claim holds is the verdict's.
- **Holder filters** compare the holder (as the party) and its channel, never the ending: on a holder seam the word's ending is the holder's own form ([holder](/holder#naming-a-holder)), so it is left out of the values on the holder frame and on the stance it sits on.

### Switches

`widen` and `infer` are off by default; a host turns them on in `switches`. Every match found through one names it in `Match.switches`, and the [default verdict](#the-default-verdict) never counts it.

- **`widen`**: a compound in the target matches on its head, the last root ([two roots](/compounds#two-roots-one-word)). Dictionary compounds take their head from the lexicon's compound rows, so the host supplies `lexicon`.
- **`infer`**, membership: a query term matches one member of a target *and* list, only where the claim says who goes with what: the target claim has that one list, or its lists are paired by *respectively* ([respectively](/list-structure#respectively)). Two unpaired lists infer nothing.
- **`infer`**, universal to instance: closed *every K* with a kind and no leftovers holds of each K ([universals](/universals-domains#universals-domains-generics)); the open universal does not.
- Neither infers with a collective verb or under a list frame.
- Questions that take more than one step (a chain of hinges, a clash, what to give up) are the [solver](solver.md)'s, with its own switches.

## The host

The contract is `Host<E>` in `src/interpret/host.ts`; `ask.ts` re-exports it, and no consumer defines a second one. `E` is the host's entity. Every member is optional: a host with none is a pure reader's client.

| Member | Gives | Read by |
|--------|-------|---------|
| `refer(term, ctx)` | What a term refers to: one, several, or none | the loop, for a command's roles and a question's bound roles; `ask`, when `referent` is unset |
| `referent(term, side, site)` | A string id when the host can tell; terms that both resolve match by it. A logged `speaker` term has its turn in `site.entry` | `ask` |
| `holds(claim, bound)` | Live state about a question's claim: `Held` (`holds`, `source`, `answers` keyed by role letter or a blank's `at`) | the loop |
| `handler(root)` | What a verb does, by root: `ok` with effects, or a `Refusal` | the loop, for a command |
| `told(reading, session)` | What a statement does beyond being logged: effects, or a `Refusal` that makes it `refused` and keeps the turn out of the log | the loop, before logging |
| `verdict(question, matches, held)` | Yes, no, unknown, fill answers, or refused. Unset: the [default verdict](#the-default-verdict) | the loop |
| `accepts(reading)` | Parts this host cannot act on yet; each makes the turn `beyond`. It only narrows | the loop |
| `window` | How many earlier turns are parsed with each new one. Unset: the whole transcript | the log |
| `switches`, `lexicon` | The [switches](#switches), and the tables `widen` reads | `ask` |

Only `refer` is needed, and only for a command with roles: without it such a command is `beyond`.

## The loop

`createSession(host, tables, { speaker?, text? })` and `run(text, session) → TurnResult` in `src/interpret/run.ts`. `TurnResult` holds `outcome`, `beyond` (each part named), `readings` (one result per dispatched reading), `effects`, and `replies`.

**Dispatch.** Each top-level reading is dispatched on its force frame:

| Force | Loop does |
|-------|-----------|
| statement (also *yes* / *no*, which imply the assertion) | calls `told`; if nothing in the turn is refused, adds the turn to the log |
| said: a greeting, or an interjection with an empty claim | as a statement; no handler, no question |
| question | `ask`, then `holds`, then `verdict`; replies |
| command, prohibition | refers each role with `refer`, then runs the verb's `handler` (a prohibition with `prohibition: true`) |

**A turn, in order:**

1. Read the turn after the log's window. If it does not parse: `parse`.
2. Before dispatch, collect what puts any reading `beyond`: an `unread` construction, an `unordered` pair, a part `accepts` names, a force the loop does not dispatch, and on a command a frame off the [pass-through list](#pass-through-list), a clause join, a verb that is not a root, a verb with no handler, or roles with no `refer`. Any of these: `beyond`, every part named, nothing dispatched, the log unchanged.
3. Statements and said turns: the turn is appended to a copy of the log, and `told` runs on each. If none is refused, the copy becomes the log. A turn is logged whole or not at all.
4. Questions and commands. A role that refers to several is `refused` with a *which one?* reply; to none, `refused`. A handler's `Refusal` is `refused` with its reason. A missing handler found here is `beyond`.

**Outcomes:** `parse`, `beyond`, `refused`, `ok`, always distinct. *Unknown* on a yes / no question is `ok` with a *can't say* reply.

### Pass-through list

A command runs only when every frame on it other than its force, on the clause and on its terms and details at any depth, is on `PASS_THROUGH` (`host.ts`). Each row cites the grammar section that shows the frame leaves what the command does unchanged; a later change is a row. No host widens the list: it is a const, not a host member, and `accepts` only narrows.

| Family | Condition | Anchors |
|--------|-----------|---------|
| `force` | Act words after the first: a doubled act, or a stacked one that only says how it sounds | [doubled act](/more-turn-words#doubled-act), [stacked acts](/more-turn-words#stacked-acts) |
| `call` | Always | [vocative](/speech-moves#vocative) |
| `attitude` | Always: a tone mark, speaker attitude or speech manner | [tone marks](/tone-marks#showing-your-tone), [speaker attitude](/feelings#speaker-attitude), [speech manner](/speech-manner#speech-manner) |
| `binder` | `slot:newMember` hosting one noun (no list, no number on it), with no other binder on the command; `refer` picks the one | [new member in a command](/joins#new-member-in-a-command) |
| `sake` | Whole-clause reach: a sake word or feeling word on the clause | [whose stake](/for-a-sake#whose-stake), [feeling word](/how-you-feel#feeling-word) |
| `contrary` | Contrary to a stance: what follows `uom` is a stance word or an intention adverb only (no say word, no holder); a reluctant or defiant order | [contrary to a stance](/contrary-to#contrary-to-stance) |

Every other family makes a command `beyond` and names it. REPORTED on a command is a relayed order ([carrying a channel forward](/evidentiality#carry-forward)): the order is someone else's, so it stays `beyond` and has no row. MIRATIVE, MAY and every other channel on a command, request or prohibition never reach the loop: the parser rejects them (`directiveMirative`, `directiveMay`, `directiveChannel`; [mirative](/mirative#mirative), [MAY](/knowing#may), D-77), and the turn is a `parse` outcome.

### The default verdict

With no host `verdict`, the loop counts a match only when it is **plain**: every frame on its path passes the pass-through list, it has no unsettled pair, and it went through no switch. An `attitude` and a `slot:newMember` binder are ordered by text order ([speaker attitude](/feelings#speaker-attitude), settled 2026-11-19), and each frame passes through on its own, so a statement path with both is plain in either order: the attitude does not change what is claimed, and the noun says the claim holds of one such thing. A call does not change what a sentence claims ([vocative](/speech-moves#vocative)), and in a statement a first-mention noun says the claim holds of one such thing ([new member in a statement](/joins#new-member-in-a-statement)).

- A fill question: the plain matches' bound blanks, then held answers that hold; none gives *unknown*.
- A yes / no question: held state that does not hold, with nothing else, gives *no*; a held state that holds or a plain match gives *yes*; otherwise *unknown*.
- `because` lists the deciding readings by id and held state by `source`; the loop adds a *why* reply. A framed match never decides by default; that is a host's own verdict.

### What the loop probe settled

The probe is the last describe block of `src/interpret/run.test.ts`. It builds a command and a yes / no question under 20 of the 21 frame families; `unknown` cannot be built, being the parser's fallback for an unread word.

- **Commands run** under a doubled or stacked act word, a clause sake, a speaker attitude, an interjection, a lone first-mention noun, a call, and contrary to a stance: each frame on a pass-through row.
- **Commands are `beyond`** under polarity, say, stance (REPORTED, a relayed order), holder, hinge, intention (plan, want, try), ability, phase, residue (RESIDUE, FORMER), notional, occasion, a universal, a bar, and a quote. None is refused.
- **Commands do not parse** under MIRATIVE, MAY, or a channel other than REPORTED (decision 26, D-77): the turn's outcome is `parse`, its error citing the page, and no handler runs.
- **Questions:** every frame is a filter except a first-mention noun, a bar, a frame a command passes through (a doubled act word, a call, an attitude or interjection, a clause sake, contrary to a stance), and MIRATIVE, as in [question filters](#question-filters). Those questions answer *yes* after a plain logged claim, as the bare question does.
- **Turns:** a call, *yes*, *no*, or an interjection closed by a period, then a bare body or a sentence linker, is its own move, and the turn is logged as one. A lone greeting or interjection is force said. *Unknown* on a yes / no question is an `ok` *can't say* reply.

## Writing a host

1. **Choose `E`**, the entity a role refers to. Give `refer` for any command with roles; give `referent` too when `E` is not a string or number, so `ask` can match by it.
2. **Give a `handler` per root** the host acts on, named by concrete sense, never by spelling. It gets the reading, the referred roles, and `prohibition`, and returns effects or a `Refusal` with a reason the player or user sees.
3. **Give `told`** for what a statement does beyond being logged; a refusal keeps the turn out of the log.
4. **Give `holds`** for live state the log does not hold. Key a fill answer by its blank's `at` from `blankSites`, as a morph-gloss leaf.
5. **Give a `verdict`** only to count framed matches (a host's own precedence). It never picks an order for an unsettled pair.
6. **Give `accepts`** to refuse parts the host cannot act on yet; it never makes a command run that the loop holds `beyond`.
7. **Set `window`** when the transcript grows long, and `switches` when a match may widen or infer.
8. **Never walk the parse tree** for meaning. If a reading lacks what the host needs, the fix is a row in the [classification table](#classification-table), not a local walker; the same holds for every tool ([parse or reading](#parse-or-reading)). Replies are morph-gloss drafts that `reply.ts` spells and parses.

The wizard's engine is a host: `createGameHost` in `src/game/host.ts`. A call sets the addressee and wakes them, and a call that finds no one is refused, with or without a body. A command to someone other than the one called is refused (*A command goes to the one you called.*). A statement whose subject is the speaker runs that verb's handler.

## Parse or reading

A tool that needs what a sentence says reads readings; a tool that needs how it is written reads the parse. Word order, spelling, brackets, construction ids and morph glosses are form. Roles, frames, what covers what, and what a pronoun or carried frame points to are meaning.

**No tool walks the parse tree or the resolve records for meaning.** The [host](#writing-a-host) rule holds for every tool: when a reading lacks something a tool needs, the fix is a row in the [classification table](#classification-table) or a change to the reader, never a local walker.

| Tool | Reads |
|------|-------|
| The loop (`run.ts`), `ask` (`ask.ts`), the matcher (`match.ts`) | readings |
| The [solver](solver.md) (`solve.ts`, `translate.ts`) | readings |
| The wizard's engine and host (`src/game/engine.ts`, `src/game/host.ts`) | readings |
| `scripts/reading.mjs` (`npm run reading`) | readings |
| The "same reading" lint (`src/lint/practice-item-rules.ts`, through `sameReadings`) | readings |
| Construction search's frame queries (`frame=`, `--over`, `--under`, `--unordered`, `--diff` in `src/find/`) | readings |
| The translation prompt (`src/parse/llm-prompt.ts`, `parse.mjs --llm-prompt`) | parse (morph gloss). Tried 2026-11-19 with reader structure lines added (what covers what, unsettled pairs, carried frames); on 20 pairs with two or more whole-clause frames the miss rate rose from 20% to 28%, so the lines were dropped. |
| Inspect (`src/parse/inspect.ts`) | parse; readings on top: its frame notes (`src/interpret/inspect-notes.ts`, shown on the site through `@interpret-browser`) read the parse `inspectText` made. Its word layer runs even when the sentence does not parse; the notes then show nothing. |
| The doc, morph-gloss, word-bank, number-speech and word-order lints | parse (form) |
| Retie, tts, pegs, and the lexicon lints | parse (form) |
| The English helper's `verify` and `coverage`, `gloss-structure.ts` | parse (form) |
| The wizard's gloss and root gating (`src/game/`) | parse (form) |

### Equal readings

`sameReadings(textA, textB, tables)` (`equal.ts`) says whether two texts say the same thing: `same`, `different`, or `unsettled`. It reads both texts, builds each side's canonical form with `canonicalReadings(readings)`, and compares the two with `compareCanonical`. A text that does not parse is `different`, with the error. The rules:

- **Positions dropped.** `at`, reading ids and source indexes are not compared.
- **Words by identity of form.** A word compares by its raw spelling, except where a rule below replaces it. A frame or detail compares by family or kind, key, construction, words, values and what it holds; its anchor is not compared.
- **Roles by letter.** `z`, `d`, `b`, the predicate and the verb compare by slot, never by text order (`clause.md#role-letters`).
- **Details and links as multisets.** Text order between details, between predicate items and between links carries no meaning. An `anaphor` link is left out: the pronoun term holds its bind (reader rule 6).
- **Frames with their order.** Frames compare as a multiset; each `order` entry compares as (over, under, kind) by canonical frame. Two readings whose frames match but whose `order` differs are `different` (`clause.md#which-covers-which`). A restrictor's `occasions` compare as a list in text order, as a join's items do: the restrictor ends its list the way a join word does (`restrictors.md#only-when-never-hal`), and a ranked restrictor ranks them by that order (`more-occasions.md#ranked-with-listed-occasions`).
- **Unsettled pairs.** When the two texts put an `unordered` pair in different text order, the result is `unsettled`, naming the pair, whatever else differs: the grammar has not said whether that order matters ([reader rules](#reader-rules), rule 3).
- **The omitted act word.** A sentence (and a quote's sentence) with no `force` frame takes the statement act, with the order the [pair table](#pair-table) gives `force` against each of its frames, citing `speech-moves.md#speech-act-statement-question-command`: `yal` written and `yal` omitted compare equal. This is a comparison rule; the reader still leaves the frame out (reader rule 4).
- **Pronouns by referent.** A bound pronoun compares as its antecedent's canonical term, keeping its ending's sense: `-r` the one meant (through a chain of `-r` pronouns to the first mention, with the sentence it was met in, `pronouns.md#resume-r`), `-l` the antecedent written out with the pronoun's role letter (`pronouns.md#a-new-one`), `-m` a share of it (`pronouns.md#share`). A role compound keeps its reach and part (`roles.md#role-compounds`). An unbound pronoun compares by form.
- **Nested readings** (dependents, islands, quotes, clause-join members, a frame's content) compare recursively, in place.

## Pair table

One row per pair of families whose forms can both reach the whole clause, counting a carried frame (see [links](#links)). Same-family pairs are in the [scope statements](#scope-statements) (`binder`, `intention`, and two different act words in `force`: fixed by a rule; a doubled act word: commutes; two free-standing tone marks: commute, see [attitude](#attitude)), except `stance` × `stance` and `call` × `call`, which have rows. Samples spell the frame word with one exemplar per family (MAY for `stance`, PLAN for `intention`, *always* for `occasion`, *already* for `phase`, RESIDUE for `residue`, *if* for `hinge`, `uom` PLAN for `contrary`) and are checked with `--check-lexicon`. Two samples put the frames in both text orders. Where no other rule orders them, the earlier covers the later (`clause.md#which-covers-which`).

Counts: fixed by a rule 126, unsettled 0, commutes 26, fixed by word shape 3.

Decided 2026-11-13, on the grammar pages since unit S1 of `ageben-interpreter.md`: where no other rule orders two frames that both reach the whole clause, the earlier in the text covers the later (`clause.md#which-covers-which`); an attitude word, MIRATIVE, and a sake word stay outside a question (`feelings.md#speaker-attitude`, `mirative.md#mirative`, `for-a-sake.md#whose-stake`). Standing exceptions keep their own rows: force first (`speech-moves.md#speech-act-statement-question-command`), a `blarl` hinge last (`dependents.md#hinges`; the hinge over a word is a `blarth` hinge put first, `stand-in-vowels.md#stand-in-back`), the holder over its clause (`holder.md#what-the-holder-covers`), and FORMER over a restrictor (`residue-and-former.md#former-climate`). Unit S2 has the parser's resolve stage emit the order.

| Pair | Kind | Anchor | Note |
|------|------|--------|------|
| `force` × `say` | fixed by a rule | `speech-moves.md#speech-act-statement-question-command` | Force over it: the act word is on the turn's left edge, outside the body (rule 2) |
| `force` × `sake` | fixed by a rule | `for-a-sake.md#whose-stake` | The sake word stays outside the question: it is your own remark on what the act serves, so only the claim is asked (`for-a-sake.md#whose-stake`). The asked reading is a second sentence: `zazozon vowurol. yel zarth gobatham blawan.` (z-Azozon | v-walk . y-question | z-that-same-claim | [g-physical-met-any-term | bl-listener]). Samples: `yel zazozon vowurol thobatham.` (y-question | z-Azozon | v-walk | th-physical-met-any-term); `yel thobatham zazozon vowurol.` (y-question | th-physical-met-any-term | z-Azozon | v-walk). Readings: *does Azozon walking serve your health?* / *does Azozon walk? (that would serve my health)* |
| `force` × `attitude` | fixed by a rule | `feelings.md#speaker-attitude` | The attitude stays outside the question (`feelings.md#speaker-attitude`), and the asked reading makes the hope the verb: `yel zawan vuwuyom darl zazozon vowurol.` (y-question | z-listener | v-hope | d-that-clause | z-Azozon | v-walk). Also: "It is always the speaker's attitude" (`feelings.md#speaker-attitude`), and a drill reads `yem thavewom zalazun vayebel dadorol.` as *Honestly, does Alazun see the trumpet, I wonder?* (`speech-manner.md#intermediate-ageben-to-english`). Samples: `yel zazozon vowurol thuwuyom.` (y-question | z-Azozon | v-walk | th-hope); `yel thuwuyom zazozon vowurol.` (y-question | th-hope | z-Azozon | v-walk). Reading (both): *does Azozon walk? (I hope so)* |
| `force` × `binder` | fixed by a rule | `speech-moves.md#speech-act-statement-question-command` | Force over it: the act word is on the turn's left edge, outside the body (rule 2) |
| `force` × `hinge` | fixed by a rule | `causation.md#if` | Force over hinge: on a command, *if* limits the instruction; on a question, it asks whether the conditional holds |
| `force` × `stance` | fixed by a rule | `want-and-decide.md#whose-intention` | Force over stance: a channel in a question asks about the listener's grounds |
| `force` × `holder` | fixed by a rule | `holder.md#what-the-holder-covers` | Force over holder: speech moves stay yours |
| `force` × `intention` | fixed by a rule | `want-and-decide.md#whose-intention` | Force over intention: in a question a bare WANT, PLAN or DECISION asks about the listener's mind |
| `force` × `ability` | fixed by a rule | `speech-moves.md#speech-act-statement-question-command` | Force over it: the act word is on the turn's left edge, outside the body (rule 2) |
| `force` × `phase` | fixed by a rule | `speech-moves.md#speech-act-statement-question-command` | Force over it: the act word is on the turn's left edge, outside the body (rule 2) |
| `force` × `residue` | fixed by a rule | `speech-moves.md#speech-act-statement-question-command` | Force over it: the act word is on the turn's left edge, outside the body (rule 2) |
| `force` × `notional` | fixed by a rule | `speech-moves.md#speech-act-statement-question-command` | Force over it: the act word is on the turn's left edge, outside the body (rule 2) |
| `force` × `mirative` | fixed by a rule | `mirative.md#mirative` | MIRATIVE stays outside the question: the surprise is yours, so only the claim is asked (`mirative.md#mirative`). The asked reading makes the surprise the verb: `yel zawan vemem darl zazozon vowurol.` (y-question | z-listener | v-amazement | d-that-clause | z-Azozon | v-walk). Samples: `yel zazozon vowurol themem.` (y-question | z-Azozon | v-walk | th-MIRATIVE); `yel themem zazozon vowurol.` (y-question | th-MIRATIVE | z-Azozon | v-walk). Readings: *did it surprise you that Azozon walks?* / *does Azozon walk? (that surprises me)* |
| `force` × `contrary` | fixed by a rule | `speech-moves.md#speech-act-statement-question-command` | Force over it: the act word is on the turn's left edge, outside the body (rule 2) |
| `force` × `occasion` | fixed by a rule | `speech-moves.md#speech-act-statement-question-command` | Force over it: the act word is on the turn's left edge, outside the body (rule 2) |
| `say` × `sake` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `hwuvam zazozon vowurol thobatham.` (h-episode-event-ALLOW-said | z-Azozon | v-walk | th-physical-met-any-term); `thobatham zazozon vowurol hwuvam.` (th-physical-met-any-term | z-Azozon | v-walk | h-episode-event-ALLOW-said). Readings: *it is allowed that Azozon walks, and that serves my health* / *it is allowed that Azozon walks, and that serves my health* |
| `say` × `attitude` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `hwuvam zazozon vowurol thuwuyom.` (h-episode-event-ALLOW-said | z-Azozon | v-walk | th-hope); `thuwuyom zazozon vowurol hwuvam.` (th-hope | z-Azozon | v-walk | h-episode-event-ALLOW-said). Readings: *it is allowed that hopefully Azozon walks* / *hopefully it is allowed that Azozon walks* |
| `say` × `binder` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Reach: from where the binder stands to the end of its sentence (`joins.md#everything-ua`). Samples: `hwuvam zual godozel vowurol.` (h-episode-event-ALLOW-said | [z-everything | g-dog] | v-walk); `zual godozel vowurol hwuvam.` ([z-everything | g-dog] | v-walk | h-episode-event-ALLOW-said). Readings: *it is allowed that every dog walks* / *for every dog: it is allowed that the dog walks* |
| `say` × `hinge` | fixed by a rule | `clause.md#which-covers-which`, `dependents.md#hinges`, `stand-in-vowels.md#stand-in-back` | Text order: the earlier covers the later (`clause.md#which-covers-which`). The hinge and `blarl` sit last (`dependents.md#hinges`), so a word before them covers them; the hinge over that word is a hinge + `blarth` put first (`stand-in-vowels.md#stand-in-back`). Samples: `hwuvam zazozon vowurol thohem blarl. zalazun vezuyol.` (h-episode-event-ALLOW-said | z-Azozon | v-walk | [th-if | bl-that-clause] . z-Alazun | v-tell); `zalazun vezuyol. thohem blarth zazozon vowurol hwuvam.` (z-Alazun | v-tell . [th-if | bl-that-same-claim] | z-Azozon | v-walk | h-episode-event-ALLOW-said). Readings: *it is allowed that if Alazun talks, Azozon walks* / *if Alazun talks, it is allowed that Azozon walks* |
| `say` × `stance` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `hwuvam zazozon vowurol thomam.` (h-episode-event-ALLOW-said | z-Azozon | v-walk | th-MAY); `thomam zazozon vowurol hwuvam.` (th-MAY | z-Azozon | v-walk | h-episode-event-ALLOW-said). Readings: *it is allowed that possibly Azozon walks* / *possibly it is allowed that Azozon walks* |
| `say` × `holder` | fixed by a rule | `holder.md#what-the-holder-covers` | Holder over it: "The holder covers its clause and any dependent sentence inside it" |
| `say` × `intention` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `hwuvam zazozon vowurol thagom.` (h-episode-event-ALLOW-said | z-Azozon | v-walk | th-plan-itinerary); `thagom zazozon vowurol hwuvam.` (th-plan-itinerary | z-Azozon | v-walk | h-episode-event-ALLOW-said). Readings: *it is allowed that I plan that Azozon walks* / *I plan that it is allowed that Azozon walks* |
| `say` × `ability` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `hwuvam zazozon vowurol hodam.` (h-episode-event-ALLOW-said | z-Azozon | v-walk | h-ABIL); `hodam zazozon vowurol hwuvam.` (h-ABIL | z-Azozon | v-walk | h-episode-event-ALLOW-said). Readings: *it is allowed that it is within reach that Azozon walks* / *it is within reach that it is allowed that Azozon walks* |
| `say` × `phase` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `hwuvam zazozon vowurol havem.` (h-episode-event-ALLOW-said | z-Azozon | v-walk | h-already); `havem zazozon vowurol hwuvam.` (h-already | z-Azozon | v-walk | h-episode-event-ALLOW-said). Readings: *it is allowed that already Azozon walks* / *already it is allowed that Azozon walks* |
| `say` × `residue` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `hwuvam zazozon vowurol haram.` (h-episode-event-ALLOW-said | z-Azozon | v-walk | h-RESIDUE); `haram zazozon vowurol hwuvam.` (h-RESIDUE | z-Azozon | v-walk | h-episode-event-ALLOW-said). Readings: *it is allowed that Azozon walks, and the outcome is still in effect* / *it is allowed that Azozon walks, and the outcome is still in effect* |
| `say` × `notional` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `hwuvam zazozon vowurol theyum.` (h-episode-event-ALLOW-said | z-Azozon | v-walk | th-NOTIONAL); `theyum zazozon vowurol hwuvam.` (th-NOTIONAL | z-Azozon | v-walk | h-episode-event-ALLOW-said). Readings: *it is allowed that as if Azozon walks* / *as if it is allowed that Azozon walks* |
| `say` × `mirative` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `hwuvam zazozon vowurol themem.` (h-episode-event-ALLOW-said | z-Azozon | v-walk | th-MIRATIVE); `themem zazozon vowurol hwuvam.` (th-MIRATIVE | z-Azozon | v-walk | h-episode-event-ALLOW-said). Readings: *it is allowed that surprisingly Azozon walks* / *surprisingly it is allowed that Azozon walks* |
| `say` × `contrary` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `hwuvam zazozon vowurol uom thagom.` (h-episode-event-ALLOW-said | z-Azozon | v-walk | [contrary-to | th-plan-itinerary]); `uom thagom zazozon vowurol hwuvam.` ([contrary-to | th-plan-itinerary] | z-Azozon | v-walk | h-episode-event-ALLOW-said). Readings: *it is allowed that Azozon walks, contrary to plan* / *it is allowed that Azozon walks, contrary to plan* |
| `say` × `occasion` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `hwuvam zazozon vowurol hual.` (h-episode-event-ALLOW-said | z-Azozon | v-walk | h-always); `hual zazozon vowurol hwuvam.` (h-always | z-Azozon | v-walk | h-episode-event-ALLOW-said). Readings: *it is allowed that always Azozon walks* / *always it is allowed that Azozon walks* |
| `sake` × `attitude` | commutes | `mirative.md#mirative`, `feelings.md#speaker-attitude`, `for-a-sake.md#whose-stake`, `contrary-to.md#contrary-to-stance` | Both are your remarks on the bare claim, each "about the whole claim", and neither changes what is claimed |
| `sake` × `binder` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Reach: from where the binder stands to the end of its sentence (`joins.md#everything-ua`). Samples: `thobatham zual godozel vowurol.` (th-physical-met-any-term | [z-everything | g-dog] | v-walk); `zual godozel vowurol thobatham.` ([z-everything | g-dog] | v-walk | th-physical-met-any-term). Readings: *every dog walks, and that serves my health* / *for every dog: the dog walks, and that serves my health* |
| `sake` × `hinge` | fixed by a rule | `clause.md#which-covers-which`, `dependents.md#hinges`, `stand-in-vowels.md#stand-in-back` | Text order: the earlier covers the later (`clause.md#which-covers-which`). The hinge and `blarl` sit last (`dependents.md#hinges`), so a word before them covers them; the hinge over that word is a hinge + `blarth` put first (`stand-in-vowels.md#stand-in-back`). Samples: `thobatham zazozon vowurol thohem blarl. zalazun vezuyol.` (th-physical-met-any-term | z-Azozon | v-walk | [th-if | bl-that-clause] . z-Alazun | v-tell); `zazozon vowurol thobatham thohem blarl. zalazun vezuyol.` (z-Azozon | v-walk | th-physical-met-any-term | [th-if | bl-that-clause] . z-Alazun | v-tell). Readings: *Azozon walking if Alazun talks serves my health (the arrangement serves it)* / *if Alazun talks, Azozon walks, and that walk serves my health* |
| `sake` × `stance` | fixed by a rule | `clause.md#which-covers-which`, `already-still-yet.md#stage-of-change` | MAY right before a `/th/` word covers it: "Like any stance, *not yet* can take MAY in front of it" (`already-still-yet.md#stage-of-change`, `thomam thelom`): MAY right before the sake word is stance over it (fixed by a rule). By text order (`clause.md#which-covers-which`): MAY apart from it, and a stance number. Samples: `thobatham zazozon vowurol thomam.` (th-physical-met-any-term | z-Azozon | v-walk | th-MAY); `thomam zazozon vowurol thobatham.` (th-MAY | z-Azozon | v-walk | th-physical-met-any-term). Readings: *possibly Azozon walks; that walking would serve my health (my remark on the act)* / *possibly (Azozon walks and it serves my health)* |
| `sake` × `holder` | fixed by a rule | `holder.md#what-the-holder-covers` | A sake word before the holder is yours, after it the holder's |
| `sake` × `intention` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `thobatham zazozon vowurol thagom.` (th-physical-met-any-term | z-Azozon | v-walk | th-plan-itinerary); `thagom zazozon vowurol thobatham.` (th-plan-itinerary | z-Azozon | v-walk | th-physical-met-any-term). Readings: *I plan that Azozon walks; the walk would serve my health (my remark now)* / *my plan is that Azozon walks so that it serves my health* |
| `sake` × `ability` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `thobatham zazozon vowurol hodam.` (th-physical-met-any-term | z-Azozon | v-walk | h-ABIL); `hodam zazozon vowurol thobatham.` (h-ABIL | z-Azozon | v-walk | th-physical-met-any-term). Readings: *Azozon can walk; walking would serve my health* / *it is within reach that Azozon walks and that it serves my health* |
| `sake` × `phase` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `thobatham zazozon vowurol havem.` (th-physical-met-any-term | z-Azozon | v-walk | h-already); `havem zazozon vowurol thobatham.` (h-already | z-Azozon | v-walk | th-physical-met-any-term). Readings: *already Azozon walks, and that serves my health* / *already Azozon walks, and that serves my health* |
| `sake` × `residue` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `thobatham zazozon vowurol haram.` (th-physical-met-any-term | z-Azozon | v-walk | h-RESIDUE); `haram zazozon vowurol thobatham.` (h-RESIDUE | z-Azozon | v-walk | th-physical-met-any-term). Readings: *Azozon walks, and the outcome is still in effect, and that serves my health* / *Azozon walks, and that serves my health, and the outcome is still in effect* |
| `sake` × `notional` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `thobatham zazozon vowurol theyum.` (th-physical-met-any-term | z-Azozon | v-walk | th-NOTIONAL); `theyum zazozon vowurol thobatham.` (th-NOTIONAL | z-Azozon | v-walk | th-physical-met-any-term). Readings: *as if Azozon walks, and that serves my health* / *as if Azozon walks, and that serves my health* |
| `sake` × `mirative` | commutes | `mirative.md#mirative`, `feelings.md#speaker-attitude`, `for-a-sake.md#whose-stake`, `contrary-to.md#contrary-to-stance` | Both are your remarks on the bare claim, each "about the whole claim", and neither changes what is claimed |
| `sake` × `contrary` | commutes | `mirative.md#mirative`, `feelings.md#speaker-attitude`, `for-a-sake.md#whose-stake`, `contrary-to.md#contrary-to-stance` | Both are your remarks on the bare claim, each "about the whole claim", and neither changes what is claimed |
| `sake` × `occasion` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `thobatham zazozon vowurol hual.` (th-physical-met-any-term | z-Azozon | v-walk | h-always); `hual zazozon vowurol thobatham.` (h-always | z-Azozon | v-walk | th-physical-met-any-term). Readings: *always Azozon walks, and that serves my health* / *always Azozon walks, and that serves my health* |
| `attitude` × `binder` | fixed by a rule | `clause.md#which-covers-which`, `feelings.md#speaker-attitude` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Reach: from where the binder stands to the end of its sentence (`joins.md#everything-ua`). A first-mention noun (`slot:newMember`) too, settled 2026-11-19: "Where the attitude stands matters when the clause brings in something new … whichever comes first covers the other" (`feelings.md#speaker-attitude`); `dadal thevemem vumewel.` (d-jar | th-doubt | v-find) *there is a jar, and I doubt it was found* / `thevemem dadal vumewel.` (th-doubt | d-jar | v-find) *I doubt that a jar was found*. Samples: `thuwuyom zual godozel vowurol.` (th-hope | [z-everything | g-dog] | v-walk); `zual godozel vowurol thuwuyom.` ([z-everything | g-dog] | v-walk | th-hope). Readings: *hopefully every dog walks* / *for every dog: hopefully the dog walks* |
| `attitude` × `hinge` | fixed by a rule | `clause.md#which-covers-which`, `dependents.md#hinges`, `stand-in-vowels.md#stand-in-back` | Text order: the earlier covers the later (`clause.md#which-covers-which`). The hinge and `blarl` sit last (`dependents.md#hinges`), so a word before them covers them; the hinge over that word is a hinge + `blarth` put first (`stand-in-vowels.md#stand-in-back`). Samples: `thuwuyom zazozon vowurol thohem blarl. zalazun vezuyol.` (th-hope | z-Azozon | v-walk | [th-if | bl-that-clause] . z-Alazun | v-tell); `zazozon vowurol thuwuyom thohem blarl. zalazun vezuyol.` (z-Azozon | v-walk | th-hope | [th-if | bl-that-clause] . z-Alazun | v-tell). Readings: *hopefully if Alazun talks, Azozon walks* / *if Alazun talks, hopefully Azozon walks* |
| `attitude` × `stance` | fixed by a rule | `clause.md#which-covers-which`, `feelings.md#speaker-attitude`, `already-still-yet.md#stage-of-change` | A channel commutes with speaker attitude: "Hope says how you feel about the claim; the channel says what backs it". MAY right before a `/th/` word covers it: "Like any stance, *not yet* can take MAY in front of it" (`already-still-yet.md#stage-of-change`, `thomam thelom`): MAY right before *hopefully* is MAY over it (fixed by a rule). By text order (`clause.md#which-covers-which`): MAY apart from it, and a stance number. Samples: `thuwuyom zazozon vowurol thomam.` (th-hope | z-Azozon | v-walk | th-MAY); `thomam zazozon vowurol thuwuyom.` (th-MAY | z-Azozon | v-walk | th-hope). Readings: *I hope that possibly Azozon walks* / *possibly I hope that Azozon walks* |
| `attitude` × `holder` | fixed by a rule | `holder.md#what-the-holder-covers` | Attitude stays yours: it is not under the holder |
| `attitude` × `intention` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `thuwuyom zazozon vowurol thagom.` (th-hope | z-Azozon | v-walk | th-plan-itinerary); `thagom zazozon vowurol thuwuyom.` (th-plan-itinerary | z-Azozon | v-walk | th-hope). Readings: *hopefully I plan that Azozon walks* / *I plan that hopefully Azozon walks* |
| `attitude` × `ability` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `thuwuyom zazozon vowurol hodam.` (th-hope | z-Azozon | v-walk | h-ABIL); `hodam zazozon vowurol thuwuyom.` (h-ABIL | z-Azozon | v-walk | th-hope). Readings: *hopefully it is within reach that Azozon walks* / *it is within reach that hopefully Azozon walks* |
| `attitude` × `phase` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `thuwuyom zazozon vowurol havem.` (th-hope | z-Azozon | v-walk | h-already); `havem zazozon vowurol thuwuyom.` (h-already | z-Azozon | v-walk | th-hope). Readings: *hopefully already Azozon walks* / *already hopefully Azozon walks* |
| `attitude` × `residue` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `thuwuyom zazozon vowurol haram.` (th-hope | z-Azozon | v-walk | h-RESIDUE); `haram zazozon vowurol thuwuyom.` (h-RESIDUE | z-Azozon | v-walk | th-hope). Readings: *hopefully Azozon walks, and the outcome is still in effect* / *hopefully Azozon walks, and the outcome is still in effect* |
| `attitude` × `notional` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `thuwuyom zazozon vowurol theyum.` (th-hope | z-Azozon | v-walk | th-NOTIONAL); `theyum zazozon vowurol thuwuyom.` (th-NOTIONAL | z-Azozon | v-walk | th-hope). Readings: *hopefully as if Azozon walks* / *as if hopefully Azozon walks* |
| `attitude` × `mirative` | commutes | `mirative.md#mirative`, `feelings.md#speaker-attitude`, `for-a-sake.md#whose-stake`, `contrary-to.md#contrary-to-stance` | Both are your remarks on the bare claim, each "about the whole claim", and neither changes what is claimed |
| `attitude` × `contrary` | commutes | `mirative.md#mirative`, `feelings.md#speaker-attitude`, `for-a-sake.md#whose-stake`, `contrary-to.md#contrary-to-stance` | Both are your remarks on the bare claim, each "about the whole claim", and neither changes what is claimed |
| `attitude` × `occasion` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `thuwuyom zazozon vowurol hual.` (th-hope | z-Azozon | v-walk | h-always); `hual zazozon vowurol thuwuyom.` (h-always | z-Azozon | v-walk | th-hope). Readings: *hopefully always Azozon walks* / *always hopefully Azozon walks* |
| `binder` × `hinge` | fixed by a rule | `clause.md#which-covers-which`, `dependents.md#hinges` | Binder over hinge: the hinge sits last, so the binder before it covers it, and the hinge holds for each member (`usually-vs-must.md#how-things-work`). Text order: the earlier covers the later (`clause.md#which-covers-which`). |
| `binder` × `stance` | fixed by a rule | `clause.md#which-covers-which`, `usually-vs-must.md#general-claims` | Text order for every member: the earlier covers the later (`clause.md#which-covers-which`). A channel first says how you know the whole generalization; after the binder, how you know each case (`usually-vs-must.md#general-claims`, `zual gogozel vezuvel thugel.`). "*Maybe every cat sleeps* is [MAY](/knowing#may) on the same clause" only names MAY as the form. Samples: `thraremol zual godozel vowurol.` (th-70-percent-likely | [z-everything | g-dog] | v-walk); `zual godozel vowurol thraremol.` ([z-everything | g-dog] | v-walk | th-70-percent-likely). Readings: *70% likely that every dog walks* / *for every dog: 70% likely that the dog walks* |
| `binder` × `holder` | fixed by a rule | `holder.md#what-the-holder-covers` | Holder over it: "The holder covers its clause and any dependent sentence inside it" |
| `binder` × `intention` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Reach: from where the binder stands to the end of its sentence (`joins.md#everything-ua`). Samples: `thagom zual godozel vowurol.` (th-plan-itinerary | [z-everything | g-dog] | v-walk); `zual godozel vowurol thagom.` ([z-everything | g-dog] | v-walk | th-plan-itinerary). Readings: *I plan that every dog walks* / *for every dog: I plan that the dog walks* |
| `binder` × `ability` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Reach: from where the binder stands to the end of its sentence (`joins.md#everything-ua`). Samples: `hodam zual godozel vowurol.` (h-ABIL | [z-everything | g-dog] | v-walk); `zual godozel vowurol hodam.` ([z-everything | g-dog] | v-walk | h-ABIL). Readings: *it is within reach that every dog walks* / *for every dog: it is within reach that the dog walks* |
| `binder` × `phase` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Reach: from where the binder stands to the end of its sentence (`joins.md#everything-ua`). Samples: `havem zual godozel vowurol.` (h-already | [z-everything | g-dog] | v-walk); `zual godozel vowurol havem.` ([z-everything | g-dog] | v-walk | h-already). Readings: *already every dog walks* / *for every dog: already the dog walks* |
| `binder` × `residue` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Reach: from where the binder stands to the end of its sentence (`joins.md#everything-ua`). Samples: `haram zual godozel vowurol.` (h-RESIDUE | [z-everything | g-dog] | v-walk); `zual godozel vowurol haram.` ([z-everything | g-dog] | v-walk | h-RESIDUE). Readings: *every dog walks, and the outcome is still in effect* / *for every dog: the dog walks, and the outcome is still in effect* |
| `binder` × `notional` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Reach: from where the binder stands to the end of its sentence (`joins.md#everything-ua`). Samples: `theyum zual godozel vowurol.` (th-NOTIONAL | [z-everything | g-dog] | v-walk); `zual godozel vowurol theyum.` ([z-everything | g-dog] | v-walk | th-NOTIONAL). Readings: *as if every dog walks* / *for every dog: as if the dog walks* |
| `binder` × `mirative` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Reach: from where the binder stands to the end of its sentence (`joins.md#everything-ua`). Samples: `themem zual godozel vowurol.` (th-MIRATIVE | [z-everything | g-dog] | v-walk); `zual godozel vowurol themem.` ([z-everything | g-dog] | v-walk | th-MIRATIVE). Readings: *surprisingly every dog walks* / *for every dog: surprisingly the dog walks* |
| `binder` × `contrary` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Reach: from where the binder stands to the end of its sentence (`joins.md#everything-ua`). Samples: `uom thagom zual godozel vowurol.` ([contrary-to | th-plan-itinerary] | [z-everything | g-dog] | v-walk); `zual godozel vowurol uom thagom.` ([z-everything | g-dog] | v-walk | [contrary-to | th-plan-itinerary]). Readings: *every dog walks, contrary to plan* / *for every dog: the dog walks, contrary to plan* |
| `binder` × `occasion` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Reach: from where the binder stands to the end of its sentence (`joins.md#everything-ua`). Samples: `hual zual godozel vowurol.` (h-always | [z-everything | g-dog] | v-walk); `zual godozel vowurol hual.` ([z-everything | g-dog] | v-walk | h-always). Readings: *always every dog walks* / *for every dog: always the dog walks* |
| `hinge` × `stance` | fixed by a rule | `clause.md#which-covers-which`, `dependents.md#hinges`, `stand-in-vowels.md#stand-in-back`, `evidentiality.md#evidence-clause`, `already-still-yet.md#stage-of-change` | A channel goes before the hinge and covers it (fixed by a rule). MAY right before a `/th/` word covers it: "Like any stance, *not yet* can take MAY in front of it" (`already-still-yet.md#stage-of-change`, `thomam thelom`), so `thomam thohem blarl` is stance over hinge (fixed by a rule). By text order (`clause.md#which-covers-which`): MAY apart from the hinge, and a stance number. The hinge and `blarl` sit last (`dependents.md#hinges`), so a word before them covers them; the hinge over that word is a hinge + `blarth` put first (`stand-in-vowels.md#stand-in-back`). Samples: `thomam zazozon vowurol thohem blarl. zalazun vezuyol.` (th-MAY | z-Azozon | v-walk | [th-if | bl-that-clause] . z-Alazun | v-tell); `zazozon vowurol thraremol thohem blarl. zalazun vezuyol.` (z-Azozon | v-walk | th-70-percent-likely | [th-if | bl-that-clause] . z-Alazun | v-tell). Readings: *if Alazun talks, possibly Azozon walks* / *possibly (Azozon walks if Alazun talks)*; the same two with *70% likely* |
| `hinge` × `holder` | fixed by a rule | `holder.md#what-the-holder-covers` | *So that* after a holder is the holder's, alone it is yours |
| `hinge` × `intention` | fixed by a rule | `clause.md#which-covers-which`, `dependents.md#hinges`, `stand-in-vowels.md#stand-in-back` | Text order: the earlier covers the later (`clause.md#which-covers-which`). The hinge and `blarl` sit last (`dependents.md#hinges`), so a word before them covers them; the hinge over that word is a hinge + `blarth` put first (`stand-in-vowels.md#stand-in-back`). Samples: `thagom zazozon vowurol thohem blarl. zalazun vezuyol.` (th-plan-itinerary | z-Azozon | v-walk | [th-if | bl-that-clause] . z-Alazun | v-tell); `zazozon vowurol thagom thohem blarl. zalazun vezuyol.` (z-Azozon | v-walk | th-plan-itinerary | [th-if | bl-that-clause] . z-Alazun | v-tell). Readings: *if Alazun talks, I plan that Azozon walks* / *I plan that if Alazun talks, Azozon walks* |
| `hinge` × `ability` | fixed by a rule | `clause.md#which-covers-which`, `dependents.md#hinges`, `stand-in-vowels.md#stand-in-back` | Text order: the earlier covers the later (`clause.md#which-covers-which`). The hinge and `blarl` sit last (`dependents.md#hinges`), so a word before them covers them; the hinge over that word is a hinge + `blarth` put first (`stand-in-vowels.md#stand-in-back`). Samples: `hodam zazozon vowurol thohem blarl. zalazun vezuyol.` (h-ABIL | z-Azozon | v-walk | [th-if | bl-that-clause] . z-Alazun | v-tell); `zazozon vowurol hodam thohem blarl. zalazun vezuyol.` (z-Azozon | v-walk | h-ABIL | [th-if | bl-that-clause] . z-Alazun | v-tell). Readings: *if Alazun talks, it is within reach that Azozon walks* / *it is within reach that if Alazun talks, Azozon walks* |
| `hinge` × `phase` | fixed by a rule | `clause.md#which-covers-which`, `dependents.md#hinges`, `stand-in-vowels.md#stand-in-back` | Text order: the earlier covers the later (`clause.md#which-covers-which`). The hinge and `blarl` sit last (`dependents.md#hinges`), so a word before them covers them; the hinge over that word is a hinge + `blarth` put first (`stand-in-vowels.md#stand-in-back`). Samples: `havem zazozon vowurol thohem blarl. zalazun vezuyol.` (h-already | z-Azozon | v-walk | [th-if | bl-that-clause] . z-Alazun | v-tell); `zazozon vowurol havem thohem blarl. zalazun vezuyol.` (z-Azozon | v-walk | h-already | [th-if | bl-that-clause] . z-Alazun | v-tell). Readings: *if Alazun talks, already Azozon walks* / *already if Alazun talks, Azozon walks* |
| `hinge` × `residue` | fixed by a rule | `clause.md#which-covers-which`, `dependents.md#hinges`, `stand-in-vowels.md#stand-in-back` | Text order: the earlier covers the later (`clause.md#which-covers-which`). The hinge and `blarl` sit last (`dependents.md#hinges`), so a word before them covers them; the hinge over that word is a hinge + `blarth` put first (`stand-in-vowels.md#stand-in-back`). Samples: `haram zazozon vowurol thohem blarl. zalazun vezuyol.` (h-RESIDUE | z-Azozon | v-walk | [th-if | bl-that-clause] . z-Alazun | v-tell); `zazozon vowurol haram thohem blarl. zalazun vezuyol.` (z-Azozon | v-walk | h-RESIDUE | [th-if | bl-that-clause] . z-Alazun | v-tell). Readings: *the outcome of (Azozon walks if Alazun talks) is still in effect* / *if Alazun talks, Azozon walks and its outcome is still in effect* |
| `hinge` × `notional` | fixed by a rule | `clause.md#which-covers-which`, `dependents.md#hinges`, `stand-in-vowels.md#stand-in-back` | Text order: the earlier covers the later (`clause.md#which-covers-which`). The hinge and `blarl` sit last (`dependents.md#hinges`), so a word before them covers them; the hinge over that word is a hinge + `blarth` put first (`stand-in-vowels.md#stand-in-back`). Samples: `theyum zazozon vowurol thohem blarl. zalazun vezuyol.` (th-NOTIONAL | z-Azozon | v-walk | [th-if | bl-that-clause] . z-Alazun | v-tell); `zazozon vowurol theyum thohem blarl. zalazun vezuyol.` (z-Azozon | v-walk | th-NOTIONAL | [th-if | bl-that-clause] . z-Alazun | v-tell). Readings: *if Alazun talks, as if Azozon walks* / *as if if Alazun talks, Azozon walks* |
| `hinge` × `mirative` | fixed by a rule | `clause.md#which-covers-which`, `dependents.md#hinges`, `stand-in-vowels.md#stand-in-back` | Text order: the earlier covers the later (`clause.md#which-covers-which`). The hinge and `blarl` sit last (`dependents.md#hinges`), so a word before them covers them; the hinge over that word is a hinge + `blarth` put first (`stand-in-vowels.md#stand-in-back`). Samples: `themem zazozon vowurol thohem blarl. zalazun vezuyol.` (th-MIRATIVE | z-Azozon | v-walk | [th-if | bl-that-clause] . z-Alazun | v-tell); `zazozon vowurol themem thohem blarl. zalazun vezuyol.` (z-Azozon | v-walk | th-MIRATIVE | [th-if | bl-that-clause] . z-Alazun | v-tell). Readings: *if Alazun talks, surprisingly Azozon walks* / *surprisingly if Alazun talks, Azozon walks* |
| `hinge` × `contrary` | fixed by a rule | `clause.md#which-covers-which`, `dependents.md#hinges`, `stand-in-vowels.md#stand-in-back` | Text order: the earlier covers the later (`clause.md#which-covers-which`). The hinge and `blarl` sit last (`dependents.md#hinges`), so a word before them covers them; the hinge over that word is a hinge + `blarth` put first (`stand-in-vowels.md#stand-in-back`). Samples: `uom thagom zazozon vowurol thohem blarl. zalazun vezuyol.` ([contrary-to | th-plan-itinerary] | z-Azozon | v-walk | [th-if | bl-that-clause] . z-Alazun | v-tell); `zalazun vezuyol. thohem blarth zazozon vowurol uom thagom.` (z-Alazun | v-tell . [th-if | bl-that-same-claim] | z-Azozon | v-walk | [contrary-to | th-plan-itinerary]). Readings: *contrary to plan, Azozon walks if Alazun talks (the link goes against the plan)* / *if Alazun talks, Azozon walks contrary to plan* |
| `hinge` × `occasion` | fixed by a rule | `usually-vs-must.md#how-things-work` | Occasion over hinge: the hinge holds for each occasion |
| `stance` × `holder` | fixed by word shape | `holder.md#what-the-holder-covers` | The seam sits on its stance |
| `stance` × `intention` | fixed by a rule | `clause.md#which-covers-which`, `already-still-yet.md#stage-of-change` | MAY right before a `/th/` word covers it: "Like any stance, *not yet* can take MAY in front of it" (`already-still-yet.md#stage-of-change`, `thomam thelom`): MAY right before WANT, PLAN or DECISION is stance over it (fixed by a rule). By text order (`clause.md#which-covers-which`): MAY apart from it, and a stance number. Samples: `thomam zazozon vowurol thagom.` (th-MAY | z-Azozon | v-walk | th-plan-itinerary); `thagom zazozon vowurol thomam.` (th-plan-itinerary | z-Azozon | v-walk | th-MAY). Readings: *possibly I plan that Azozon walks* / *I plan that possibly Azozon walks* |
| `stance` × `ability` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `thomam zazozon vowurol hodam.` (th-MAY | z-Azozon | v-walk | h-ABIL); `hodam zazozon vowurol thomam.` (h-ABIL | z-Azozon | v-walk | th-MAY). Readings: *possibly it is within reach that Azozon walks* / *it is within reach that possibly Azozon walks* |
| `stance` × `phase` | fixed by a rule | `clause.md#which-covers-which`, `already-still-yet.md#stage-of-change` | MAY right before a `/th/` word covers it: "Like any stance, *not yet* can take MAY in front of it" (`already-still-yet.md#stage-of-change`, `thomam thelom`): MAY right before a `/th/` phase word is stance over it (fixed by a rule; the page's own sample). By text order (`clause.md#which-covers-which`): a phase word on `/h/`, MAY apart from it, and a stance number. Samples: `thomam zazozon vowurol havem.` (th-MAY | z-Azozon | v-walk | h-already); `havem zazozon vowurol thomam.` (h-already | z-Azozon | v-walk | th-MAY). Readings: *possibly already Azozon walks* / *already possibly Azozon walks* |
| `stance` × `residue` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `thomam zazozon vowurol haram.` (th-MAY | z-Azozon | v-walk | h-RESIDUE); `haram zazozon vowurol thomam.` (h-RESIDUE | z-Azozon | v-walk | th-MAY). Readings: *possibly (Azozon walked and its outcome is still in effect)* / *the outcome of what possibly happened (Azozon walked) is still in effect* |
| `stance` × `notional` | fixed by a rule | `clause.md#which-covers-which`, `already-still-yet.md#stage-of-change` | MAY right before a `/th/` word covers it: "Like any stance, *not yet* can take MAY in front of it" (`already-still-yet.md#stage-of-change`, `thomam thelom`): MAY right before NOTIONAL is stance over it (fixed by a rule). By text order (`clause.md#which-covers-which`): MAY apart from it, and a stance number. Samples: `thomam zazozon vowurol theyum.` (th-MAY | z-Azozon | v-walk | th-NOTIONAL); `theyum zazozon vowurol thomam.` (th-NOTIONAL | z-Azozon | v-walk | th-MAY). Readings: *possibly as if Azozon walks* / *as if possibly Azozon walks* |
| `stance` × `mirative` | fixed by a rule | `clause.md#which-covers-which`, `mirative.md#mirative`, `already-still-yet.md#stage-of-change` | A channel commutes with MIRATIVE: MIRATIVE "is not a channel"; the page adds a channel beside it, each on the whole claim. MAY right before a `/th/` word covers it: "Like any stance, *not yet* can take MAY in front of it" (`already-still-yet.md#stage-of-change`, `thomam thelom`): MAY right before MIRATIVE is MAY over it (fixed by a rule). By text order (`clause.md#which-covers-which`): MAY apart from MIRATIVE, and a stance number. Samples: `themem zazozon vowurol thomam.` (th-MIRATIVE | z-Azozon | v-walk | th-MAY); `thomam zazozon vowurol themem.` (th-MAY | z-Azozon | v-walk | th-MIRATIVE). Readings: *it surprised me that possibly Azozon walks* / *possibly it surprised me that Azozon walks* |
| `stance` × `contrary` | commutes | `contrary-to.md#contrary-to-stance` | "A stance anywhere else in the clause still applies to the claim" |
| `stance` × `occasion` | fixed by a rule | `clause.md#which-covers-which`, `usually-vs-must.md#general-claims` | Text order for every member: the earlier covers the later (`clause.md#which-covers-which`). A channel first says how you know the whole generalization; after the restrictor, how you know each case (`usually-vs-must.md#general-claims`). Samples: `thomam zazozon vowurol hual.` (th-MAY | z-Azozon | v-walk | h-always); `hual zazozon vowurol thomam.` (h-always | z-Azozon | v-walk | th-MAY). Readings: *possibly always Azozon walks* / *always possibly Azozon walks* |
| `holder` × `intention` | fixed by word shape | `want-and-decide.md#whose-intention` | The seam sits on WANT, PLAN or DECISION |
| `holder` × `ability` | fixed by a rule | `holder.md#what-the-holder-covers` | Holder over it: "The holder covers its clause and any dependent sentence inside it" |
| `holder` × `phase` | fixed by a rule | `holder.md#what-the-holder-covers` | Holder over it: "The holder covers its clause and any dependent sentence inside it" |
| `holder` × `residue` | fixed by a rule | `holder.md#what-the-holder-covers` | Holder over it: "The holder covers its clause and any dependent sentence inside it" |
| `holder` × `notional` | fixed by word shape | `notional.md#follow-up-endings-notional` | The seam sits on NOTIONAL |
| `holder` × `mirative` | fixed by a rule | `holder.md#what-the-holder-covers` | Holder over it: "The holder covers its clause and any dependent sentence inside it" |
| `holder` × `contrary` | fixed by a rule | `holder.md#what-the-holder-covers`, `contrary-to.md#contrary-to-holder` | Holder over it: "Everything else in the clause, wherever it sits, belongs to the holder". A holder after `uom` is the contrary's own content (it covers only that pair) and does not pair |
| `holder` × `occasion` | fixed by a rule | `holder.md#what-the-holder-covers` | Under MEMORY, *never* / *always* cover only the times you both remember |
| `intention` × `ability` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `thagom zazozon vowurol hodam.` (th-plan-itinerary | z-Azozon | v-walk | h-ABIL); `hodam zazozon vowurol thagom.` (h-ABIL | z-Azozon | v-walk | th-plan-itinerary). Readings: *I plan that it is within reach that Azozon walks* / *it is within reach that I plan that Azozon walks* |
| `intention` × `phase` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `thagom zazozon vowurol havem.` (th-plan-itinerary | z-Azozon | v-walk | h-already); `havem zazozon vowurol thagom.` (h-already | z-Azozon | v-walk | th-plan-itinerary). Readings: *I plan that already Azozon walks* / *already I plan that Azozon walks* |
| `intention` × `residue` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `thagom zazozon vowurol haram.` (th-plan-itinerary | z-Azozon | v-walk | h-RESIDUE); `haram zazozon vowurol thagom.` (h-RESIDUE | z-Azozon | v-walk | th-plan-itinerary). Readings: *I plan that Azozon walks with its outcome left in effect* / *the outcome of my plan that Azozon walks is still in effect* |
| `intention` × `notional` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `thagom zazozon vowurol theyum.` (th-plan-itinerary | z-Azozon | v-walk | th-NOTIONAL); `theyum zazozon vowurol thagom.` (th-NOTIONAL | z-Azozon | v-walk | th-plan-itinerary). Readings: *I plan that as if Azozon walks* / *as if I plan that Azozon walks* |
| `intention` × `mirative` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `thagom zazozon vowurol themem.` (th-plan-itinerary | z-Azozon | v-walk | th-MIRATIVE); `themem zazozon vowurol thagom.` (th-MIRATIVE | z-Azozon | v-walk | th-plan-itinerary). Readings: *I plan that surprisingly Azozon walks* / *surprisingly I plan that Azozon walks* |
| `intention` × `contrary` | commutes | `contrary-to.md#contrary-to-stance` | As with a stance: only the word after `uom` is what the event goes against |
| `intention` × `occasion` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `thagom zazozon vowurol hual.` (th-plan-itinerary | z-Azozon | v-walk | h-always); `hual zazozon vowurol thagom.` (h-always | z-Azozon | v-walk | th-plan-itinerary). Readings: *I plan that always Azozon walks* / *always I plan that Azozon walks* |
| `ability` × `phase` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `hodam zazozon vowurol havem.` (h-ABIL | z-Azozon | v-walk | h-already); `havem zazozon vowurol hodam.` (h-already | z-Azozon | v-walk | h-ABIL). Readings: *it is within reach that already Azozon walks* / *already it is within reach that Azozon walks* |
| `ability` × `residue` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `hodam zazozon vowurol haram.` (h-ABIL | z-Azozon | v-walk | h-RESIDUE); `haram zazozon vowurol hodam.` (h-RESIDUE | z-Azozon | v-walk | h-ABIL). Readings: *it is within reach that Azozon walks with its outcome left in effect* / *Azozon was able to walk, and that ability is still in effect* |
| `ability` × `notional` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `hodam zazozon vowurol theyum.` (h-ABIL | z-Azozon | v-walk | th-NOTIONAL); `theyum zazozon vowurol hodam.` (th-NOTIONAL | z-Azozon | v-walk | h-ABIL). Readings: *it is within reach that as if Azozon walks* / *as if it is within reach that Azozon walks* |
| `ability` × `mirative` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `hodam zazozon vowurol themem.` (h-ABIL | z-Azozon | v-walk | th-MIRATIVE); `themem zazozon vowurol hodam.` (th-MIRATIVE | z-Azozon | v-walk | h-ABIL). Readings: *it is within reach that surprisingly Azozon walks* / *surprisingly it is within reach that Azozon walks* |
| `ability` × `contrary` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `hodam zazozon vowurol uom thagom.` (h-ABIL | z-Azozon | v-walk | [contrary-to | th-plan-itinerary]); `uom thagom zazozon vowurol hodam.` ([contrary-to | th-plan-itinerary] | z-Azozon | v-walk | h-ABIL). Readings: *it is within reach that Azozon walks contrary to plan* / *contrary to plan, it is within reach that Azozon walks* |
| `ability` × `occasion` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `hodam zazozon vowurol hual.` (h-ABIL | z-Azozon | v-walk | h-always); `hual zazozon vowurol hodam.` (h-always | z-Azozon | v-walk | h-ABIL). Readings: *it is within reach that always Azozon walks* / *always it is within reach that Azozon walks* |
| `phase` × `residue` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `havem zazozon vowurol haram.` (h-already | z-Azozon | v-walk | h-RESIDUE); `haram zazozon vowurol havem.` (h-RESIDUE | z-Azozon | v-walk | h-already). Readings: *already Azozon walks, and the outcome is still in effect* / *already Azozon walks, and the outcome is still in effect* |
| `phase` × `notional` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `havem zazozon vowurol theyum.` (h-already | z-Azozon | v-walk | th-NOTIONAL); `theyum zazozon vowurol havem.` (th-NOTIONAL | z-Azozon | v-walk | h-already). Readings: *already as if Azozon walks* / *as if already Azozon walks* |
| `phase` × `mirative` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `havem zazozon vowurol themem.` (h-already | z-Azozon | v-walk | th-MIRATIVE); `themem zazozon vowurol havem.` (th-MIRATIVE | z-Azozon | v-walk | h-already). Readings: *already surprisingly Azozon walks* / *surprisingly already Azozon walks* |
| `phase` × `contrary` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `havem zazozon vowurol uom thagom.` (h-already | z-Azozon | v-walk | [contrary-to | th-plan-itinerary]); `uom thagom zazozon vowurol havem.` ([contrary-to | th-plan-itinerary] | z-Azozon | v-walk | h-already). Readings: *already Azozon walks, contrary to plan* / *already Azozon walks, contrary to plan* |
| `phase` × `occasion` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `havem zazozon vowurol hual.` (h-already | z-Azozon | v-walk | h-always); `hual zazozon vowurol havem.` (h-always | z-Azozon | v-walk | h-already). Readings: *already always Azozon walks* / *always already Azozon walks* |
| `residue` × `notional` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `haram zazozon vowurol theyum.` (h-RESIDUE | z-Azozon | v-walk | th-NOTIONAL); `theyum zazozon vowurol haram.` (th-NOTIONAL | z-Azozon | v-walk | h-RESIDUE). Readings: *as if Azozon walks, and the outcome is still in effect* / *as if Azozon walks, and the outcome is still in effect* |
| `residue` × `mirative` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `haram zazozon vowurol themem.` (h-RESIDUE | z-Azozon | v-walk | th-MIRATIVE); `themem zazozon vowurol haram.` (th-MIRATIVE | z-Azozon | v-walk | h-RESIDUE). Readings: *surprisingly Azozon walks, and the outcome is still in effect* / *surprisingly Azozon walks, and the outcome is still in effect* |
| `residue` × `contrary` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `haram zazozon vowurol uom thagom.` (h-RESIDUE | z-Azozon | v-walk | [contrary-to | th-plan-itinerary]); `uom thagom zazozon vowurol haram.` ([contrary-to | th-plan-itinerary] | z-Azozon | v-walk | h-RESIDUE). Readings: *Azozon walks, contrary to plan, and the outcome is still in effect* / *Azozon walks, and the outcome is still in effect, contrary to plan* |
| `residue` × `occasion` | fixed by a rule | `clause.md#which-covers-which`, `residue-and-former.md#former-climate` | FORMER over the restrictor (fixed by a rule): the page reads `zazozon hual vozuyel helam.` as *Azozon always used to sing*, since FORMER says "a usual pattern held, but you are not claiming it holds now" (`residue-and-former.md#former-climate`). By text order (`clause.md#which-covers-which`): RESIDUE with a restrictor. Samples: `haram zazozon vowurol hual.` (h-RESIDUE | z-Azozon | v-walk | h-always); `hual zazozon vowurol haram.` (h-always | z-Azozon | v-walk | h-RESIDUE). Readings: *always Azozon walks, and the outcome is still in effect* / *always Azozon walks, and the outcome is still in effect* |
| `notional` × `mirative` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `theyum zazozon vowurol themem.` (th-NOTIONAL | z-Azozon | v-walk | th-MIRATIVE); `themem zazozon vowurol theyum.` (th-MIRATIVE | z-Azozon | v-walk | th-NOTIONAL). Readings: *as if surprisingly Azozon walks* / *surprisingly as if Azozon walks* |
| `notional` × `contrary` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `theyum zazozon vowurol uom thagom.` (th-NOTIONAL | z-Azozon | v-walk | [contrary-to | th-plan-itinerary]); `uom thagom zazozon vowurol theyum.` ([contrary-to | th-plan-itinerary] | z-Azozon | v-walk | th-NOTIONAL). Readings: *as if Azozon walks, contrary to plan* / *as if Azozon walks, contrary to plan* |
| `notional` × `occasion` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `theyum zazozon vowurol hual.` (th-NOTIONAL | z-Azozon | v-walk | h-always); `hual zazozon vowurol theyum.` (h-always | z-Azozon | v-walk | th-NOTIONAL). Readings: *as if always Azozon walks* / *always as if Azozon walks* |
| `mirative` × `contrary` | commutes | `mirative.md#mirative`, `feelings.md#speaker-attitude`, `for-a-sake.md#whose-stake`, `contrary-to.md#contrary-to-stance` | Both are your remarks on the bare claim, each "about the whole claim", and neither changes what is claimed |
| `mirative` × `occasion` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `themem zazozon vowurol hual.` (th-MIRATIVE | z-Azozon | v-walk | h-always); `hual zazozon vowurol themem.` (h-always | z-Azozon | v-walk | th-MIRATIVE). Readings: *surprisingly always Azozon walks* / *always surprisingly Azozon walks* |
| `contrary` × `occasion` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Samples: `uom thagom zazozon vowurol hual.` ([contrary-to | th-plan-itinerary] | z-Azozon | v-walk | h-always); `hual zazozon vowurol uom thagom.` (h-always | z-Azozon | v-walk | [contrary-to | th-plan-itinerary]). Readings: *always Azozon walks, contrary to plan* / *always Azozon walks, contrary to plan* |
| `stance` × `stance` | fixed by a rule | `clause.md#which-covers-which`, `already-still-yet.md#stage-of-change` | MAY right before a `/th/` word covers it: "Like any stance, *not yet* can take MAY in front of it" (`already-still-yet.md#stage-of-change`, `thomam thelom`): MAY right before a channel is MAY over the channel (fixed by a rule). By text order (`clause.md#which-covers-which`): a channel before MAY or apart from it, and a stance number with either. Samples: `thomam zazozon vowurol theyom.` (th-MAY | z-Azozon | v-walk | th-CLUES); `theyom zazozon vowurol thomam.` (th-CLUES | z-Azozon | v-walk | th-MAY). Readings: *possibly I infer that Azozon walks* / *I infer that possibly Azozon walks* |
| `polarity` × `force` | fixed by a rule | `speech-moves.md#speech-act-statement-question-command` | Force over it: the act word is on the turn's left edge, outside the body (rule 2). Sample: `yel zazozon vowurol thul.` (y-question | z-Azozon | v-walk | th-not) |
| `polarity` × `stance` | fixed by a rule | `clause.md#which-covers-which`, `verb-and-stance-joins.md#standalone-stance-joins`, `verb-and-stance-joins.md#stance-join-reach` | Text order: the earlier covers the later (`clause.md#which-covers-which`). A standalone `/th/` `u` join (`thul`, `thum`, `thur`) has no stance words before it and "says what that empty stance means". A `/th/` word right before the join is its item and nests (rule 2: `zazozon vowurol thomam thul.`, z-Azozon | v-walk | [th-MAY | th-not]). A `/th/` word with other words between it and the join is a frame of its own and the join is standalone (`verb-and-stance-joins.md#stance-join-reach`), so either order is said and the earlier covers the later. Samples: `zazozon vowurol thul thomam.` (z-Azozon | v-walk | th-not | th-MAY); `thomam zazozon vowurol thul.` (th-MAY | z-Azozon | v-walk | th-not). Readings: *no judgment on whether possibly Azozon walks* / *possibly Azozon walks, no judgment* |
| `polarity` × `intention` | fixed by a rule | `clause.md#which-covers-which`, `verb-and-stance-joins.md#standalone-stance-joins`, `verb-and-stance-joins.md#stance-join-reach` | Text order: the earlier covers the later (`clause.md#which-covers-which`). As `polarity` × `stance`. Samples: `zazozon vowurol thul thagom.` (z-Azozon | v-walk | th-not | th-plan-itinerary); `thagom zazozon vowurol thul.` (th-plan-itinerary | z-Azozon | v-walk | th-not). Readings: *no judgment on my plan that Azozon walks* / *I plan that Azozon walks, no judgment* |
| `polarity` × `hinge` | fixed by a rule | `clause.md#which-covers-which`, `dependents.md#hinges`, `stand-in-vowels.md#stand-in-back`, `verb-and-stance-joins.md#standalone-stance-joins`, `verb-and-stance-joins.md#stance-join-reach` | Text order: the earlier covers the later (`clause.md#which-covers-which`). As `polarity` × `stance`; a hinge right before the join is its item instead (`verb-and-stance-joins.md#stance-join-reach`, `verb-and-stance-joins.md#stance-join-before-barl`). Samples: `zazozon vowurol thul thohem blarl. zalazun vezuyol.` (z-Azozon | v-walk | th-not | [th-if | bl-that-clause] . z-Alazun | v-tell). Readings: *no judgment on whether Azozon walks if Alazun talks* / *if Alazun talks, Azozon walks, no judgment* |
| `polarity` × `ability` | fixed by a rule | `clause.md#which-covers-which`, `verb-and-stance-joins.md#standalone-stance-joins` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Both reach the whole clause; neither has a fixed place. Samples: `zazozon vowurol thul hodam.` (z-Azozon | v-walk | th-not | h-ABIL); `hodam zazozon vowurol thul.` (h-ABIL | z-Azozon | v-walk | th-not). Readings: *no judgment on whether Azozon can walk* / *it is within reach that Azozon walks, no judgment* |
| `polarity` × `say` | fixed by a rule | `clause.md#which-covers-which`, `verb-and-stance-joins.md#standalone-stance-joins` | Text order: the earlier covers the later (`clause.md#which-covers-which`). As `polarity` × `ability`. Samples: `zazozon vowurol thul hwuvam.` (z-Azozon | v-walk | th-not | h-episode-event-ALLOW-said); `hwuvam zazozon vowurol thul.` (h-episode-event-ALLOW-said | z-Azozon | v-walk | th-not). Readings: *no judgment on whether it is allowed that Azozon walks* / *it is allowed that Azozon walks, no judgment* |
| `polarity` × `sake` | fixed by a rule | `clause.md#which-covers-which`, `verb-and-stance-joins.md#standalone-stance-joins`, `verb-and-stance-joins.md#stance-join-reach` | Text order: the earlier covers the later (`clause.md#which-covers-which`). As `polarity` × `stance`: a `/th/` word right before the join is its item (rule 2); with other words between, either order is said and the earlier covers the later (`verb-and-stance-joins.md#stance-join-reach`). Samples: `zazozon vowurol thul thobatham.` (z-Azozon | v-walk | th-not | th-physical-met-any-term); `thobatham zazozon vowurol thul.` (th-physical-met-any-term | z-Azozon | v-walk | th-not). Readings: *no judgment on whether Azozon walking serves my health* / *Azozon walking serves my health, no judgment* |
| `polarity` × `attitude` | fixed by a rule | `clause.md#which-covers-which`, `verb-and-stance-joins.md#standalone-stance-joins`, `verb-and-stance-joins.md#stance-join-reach` | Text order: the earlier covers the later (`clause.md#which-covers-which`). As `polarity` × `stance`: a `/th/` word right before the join is its item (rule 2); with other words between, either order is said and the earlier covers the later (`verb-and-stance-joins.md#stance-join-reach`). Samples: `zazozon vowurol thul thuwuyom.` (z-Azozon | v-walk | th-not | th-hope); `thuwuyom zazozon vowurol thul.` (th-hope | z-Azozon | v-walk | th-not). Readings: *no judgment on whether, hopefully, Azozon walks* / *hopefully Azozon walks, no judgment* |
| `polarity` × `binder` | fixed by a rule | `clause.md#which-covers-which` | Text order: the earlier covers the later (`clause.md#which-covers-which`). Reach: from where the binder stands to the end of its sentence (`joins.md#everything-ua`). Samples: `thul zual godozel vowurol.` (th-not | [z-everything | g-dog] | v-walk); `zual godozel vowurol thul.` ([z-everything | g-dog] | v-walk | th-not). Readings: *no judgment on whether every dog walks* / *for every dog: the dog walks, no judgment* |
| `polarity` × `holder` | fixed by a rule | `holder.md#what-the-holder-covers`, `verb-and-stance-joins.md#stance-join-reach` | Holder over: a standalone stance join is the holder's, like any stance word under it; your own no-view goes in a sentence of its own (`holder.md#what-the-holder-covers`). A holder's stance right before the join is its item (rule 2, `verb-and-stance-joins.md#stance-join-reach`). Samples: `zazozon vowurol thul thevumazozon.` (z-Azozon | v-walk | th-not | th-MEMORY-Azozon). Reading: *as Azozon remembers it, Azozon walks, and Azozon takes no view on it* |
| `polarity` × `phase` | fixed by a rule | `clause.md#which-covers-which`, `verb-and-stance-joins.md#standalone-stance-joins` | Text order: the earlier covers the later (`clause.md#which-covers-which`). As `polarity` × `ability`. Samples: `zazozon vowurol thul havem.` (z-Azozon | v-walk | th-not | h-already); `havem zazozon vowurol thul.` (h-already | z-Azozon | v-walk | th-not). Readings: *no judgment on whether Azozon already walks* / *already Azozon walks, no judgment* |
| `polarity` × `residue` | fixed by a rule | `clause.md#which-covers-which`, `verb-and-stance-joins.md#standalone-stance-joins` | Text order: the earlier covers the later (`clause.md#which-covers-which`). As `polarity` × `ability`. Samples: `zazozon vowurol thul haram.` (z-Azozon | v-walk | th-not | h-RESIDUE); `haram zazozon vowurol thul.` (h-RESIDUE | z-Azozon | v-walk | th-not). Readings: *no judgment on whether the outcome of Azozon walking is still in effect* / *Azozon walks and the outcome is still in effect, no judgment* |
| `polarity` × `notional` | fixed by a rule | `clause.md#which-covers-which`, `verb-and-stance-joins.md#standalone-stance-joins`, `verb-and-stance-joins.md#stance-join-reach` | Text order: the earlier covers the later (`clause.md#which-covers-which`). As `polarity` × `stance`: a `/th/` word right before the join is its item (rule 2); with other words between, either order is said and the earlier covers the later (`verb-and-stance-joins.md#stance-join-reach`). Samples: `zazozon vowurol thul theyum.` (z-Azozon | v-walk | th-not | th-NOTIONAL); `theyum zazozon vowurol thul.` (th-NOTIONAL | z-Azozon | v-walk | th-not). Readings: *no judgment on the imagined scene of Azozon walking* / *imagine Azozon walking, no judgment* |
| `polarity` × `mirative` | fixed by a rule | `clause.md#which-covers-which`, `verb-and-stance-joins.md#standalone-stance-joins`, `verb-and-stance-joins.md#stance-join-reach` | Text order: the earlier covers the later (`clause.md#which-covers-which`). As `polarity` × `stance`: a `/th/` word right before the join is its item (rule 2); with other words between, either order is said and the earlier covers the later (`verb-and-stance-joins.md#stance-join-reach`). Samples: `zazozon vowurol thul themem.` (z-Azozon | v-walk | th-not | th-MIRATIVE); `themem zazozon vowurol thul.` (th-MIRATIVE | z-Azozon | v-walk | th-not). Readings: *no judgment on whether it surprised me that Azozon walks* / *surprisingly Azozon walks, no judgment* |
| `polarity` × `contrary` | fixed by a rule | `clause.md#which-covers-which`, `verb-and-stance-joins.md#standalone-stance-joins`, `verb-and-stance-joins.md#stance-join-reach` | Text order: the earlier covers the later (`clause.md#which-covers-which`). As `polarity` × `stance`: a `/th/` word right before the join is its item (rule 2); with other words between, either order is said and the earlier covers the later (`verb-and-stance-joins.md#stance-join-reach`). Samples: `zazozon vowurol thul uom thagom.` (z-Azozon | v-walk | th-not | [contrary-to | th-plan-itinerary]); `uom thagom zazozon vowurol thul.` ([contrary-to | th-plan-itinerary] | z-Azozon | v-walk | th-not). Readings: *no judgment on whether Azozon walks contrary to plan* / *contrary to plan, Azozon walks, no judgment* |
| `polarity` × `occasion` | fixed by a rule | `clause.md#which-covers-which`, `verb-and-stance-joins.md#standalone-stance-joins` | Text order: the earlier covers the later (`clause.md#which-covers-which`). As `polarity` × `ability`. Keep `thul` apart from `hual`: the spot right before `hual` holds its occasion list (`residue-and-former.md#former-climate`), and `thul hual` parses as *always except*. Samples: `thul zazozon hual vowurol.` (th-not | z-Azozon | h-always | v-walk); `hual zazozon vowurol thul.` (h-always | z-Azozon | v-walk | th-not). Readings: *no judgment on whether Azozon always walks* / *always Azozon walks, no judgment* |
| `call` × `force` | commutes | `speech-moves.md#vocative` | A call names who the turn is for and changes nothing about what is claimed, asked, or how |
| `call` × `polarity` | commutes | `speech-moves.md#vocative` | A call names who the turn is for and changes nothing about what is claimed, asked, or how |
| `call` × `say` | commutes | `speech-moves.md#vocative` | A call names who the turn is for and changes nothing about what is claimed, asked, or how |
| `call` × `stance` | commutes | `speech-moves.md#vocative` | A call names who the turn is for and changes nothing about what is claimed, asked, or how |
| `call` × `holder` | commutes | `speech-moves.md#vocative` | A call names who the turn is for and changes nothing about what is claimed, asked, or how |
| `call` × `hinge` | commutes | `speech-moves.md#vocative` | A call names who the turn is for and changes nothing about what is claimed, asked, or how |
| `call` × `intention` | commutes | `speech-moves.md#vocative` | A call names who the turn is for and changes nothing about what is claimed, asked, or how |
| `call` × `ability` | commutes | `speech-moves.md#vocative` | A call names who the turn is for and changes nothing about what is claimed, asked, or how |
| `call` × `phase` | commutes | `speech-moves.md#vocative` | A call names who the turn is for and changes nothing about what is claimed, asked, or how |
| `call` × `residue` | commutes | `speech-moves.md#vocative` | A call names who the turn is for and changes nothing about what is claimed, asked, or how |
| `call` × `notional` | commutes | `speech-moves.md#vocative` | A call names who the turn is for and changes nothing about what is claimed, asked, or how |
| `call` × `mirative` | commutes | `speech-moves.md#vocative` | A call names who the turn is for and changes nothing about what is claimed, asked, or how |
| `call` × `contrary` | commutes | `speech-moves.md#vocative` | A call names who the turn is for and changes nothing about what is claimed, asked, or how |
| `call` × `occasion` | commutes | `speech-moves.md#vocative` | A call names who the turn is for and changes nothing about what is claimed, asked, or how |
| `call` × `sake` | commutes | `speech-moves.md#vocative` | A call names who the turn is for and changes nothing about what is claimed, asked, or how |
| `call` × `attitude` | commutes | `speech-moves.md#vocative` | A call names who the turn is for and changes nothing about what is claimed, asked, or how |
| `call` × `binder` | commutes | `speech-moves.md#vocative` | A call names who the turn is for and changes nothing about what is claimed, asked, or how |
| `call` × `call` | commutes | `speech-moves.md#vocative` | Two calls name two addressees; neither covers the other |

**Never in a pair:** `polarity` list joins (list reach: they deny only their items, `joins.md#negation-u`; the standalone `/th/` joins pair), `bar` (inside its rank fence, `bars.md#channel-bars`), `quote` (a nested reading), and `unknown` (an `unread` entry, never ordered).

**The other reading today:** where a fixed place allows one order, the other is said with another form: a hinge + `blarth` first (`stand-in-vowels.md#stand-in-back`); for a question, the hope or the surprise as the verb, or the act first and a question about `zarth` (`feelings.md#speaker-attitude`, `mirative.md#mirative`, `for-a-sake.md#whose-stake`). A scope island cannot carry one: it "holds at most one phrase" (`scope-islands.md#scope-islands`), so it cannot hold a frame and the clause it frames.

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

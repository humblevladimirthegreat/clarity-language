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
| D-10 | Every offset from now sits on an evidential, a forecast (channel + `bl+`) or a `/th/` PLAN (`+` only); a wrong sign on a one-way channel is not a sentence. A signed offset in a time pole's `/b/` needs a command, a request, a PLAN, or a channel. In as-of `/b/` it is allowed only on stance as-of (`thenam` / `thunem`), which dates the stance; `henam` / `hunem` / `wenam` keep dates, event nouns and `blarl` clauses. Absolute dates need no channel | a bare *earlier* / *now* / *later* would date an event without saying how you know it, which is the job verbs without tense leave to the channels | knowing.md |
| D-16 | No root for a bare evaluative (*good*, *bad*, *nice*, *great*, *terrible*, *quality*, *effective*, *practical*, …) | a bare evaluative hides **whose** need it serves and **what bar** it is measured against, which the language wants audible. Applies to bare evaluatives only: a root whose sense is a quality (delight, beauty, anguish, safety) stays, and scale adjectives (*expensive*, *thick*) take a bar. When a learner needs a new quality, add a root for that quality, not for the evaluation | sakes.md, say-reasons.md |
| D-18 | No *he* / *she* / *it* (a short resuming pronoun split by gender or animacy) | a single *it* would give up mechanical matching, and a gender split conflicts with the project's aims. Short reference is a role pointer or a tag the speaker assigns. | pronouns.md |
| D-20 | The topic is set only by an overt `/x/` word, never inferred from salience, first mention, or subjecthood, and there is no topic stack: every return is spelled out (`xuzozer`). Topic words never sit in a dependent, after a clause join, or in an aside; a quote keeps its own topic and tags | every tool computes the same topic at every point, from the words alone | pronouns.md |
| D-22 | A `bl-` word after `/z/` / `/d/` / `/v/` / `/w/` (other than a [hooked join](../grammar/hooks.md#hooked-joins)); a dropped subject read as the topic | those words name no relation for a `bl-` word to complete, so it has no host (`blNoHost`); the recipient is a plain `/b/`. A dropped subject stays unmentioned, and the topic doer is written `zalon` (D-20) | clause.md, pronouns.md |
| D-23 | `~` as a tone mark; a third copy of a mark (`!!!`, `???`) | `~` is the opaque marker. Marks stack freely, but two of a kind is the most: a third level would need a voice difference a listener can hear, and none is named yet. Parser: `toneStack` | speech-moves.md |
| D-24 | A role pointer or a tag pronoun on `/y/` or `/x/` (`ywazar`, `xwazar`, `ywar`, `xwar`) | a call or a topic return names the stem (`yuzozer`, `xuzozer`), so the listener and every tool read one topic from the words alone (D-20) | pronouns.md |
| D-31 | A topic-only question (`yol xuzozen.`); a polar word before an act word, or two in a row (`yael yal`, `yael yuel`) | `yol xuzozen.` would reset the topic for a throwaway *And you?*, which `yol zuzozen zam.` says without side effects (D-20). A polar word is one answer, so an answer and a question are two turns. Parser: `polarOrder` | questions.md |
| D-32 | A stand-in on `/ɡ/` (`garl`); a linker and a topic word in one sentence (`xezom xuzozen …`) | a stand-in on `/ɡ/` would let a clause modify a noun, against the [which-noun](../grammar/dependents.md#which-noun) rule; *the fact that* is a predicate with a `/z/` stand-in, or two sentences. One `/x/` word opens a sentence, so every tool reads the topic from one position (D-20). Parser: `standInRole` | dependents.md |
| D-33 | A bare `/ɡ/` right after the verb as a depictive or resultative (`zolazun velurul godamul.`); `goron` / `goror` as identity | after an object noun a trailing `/ɡ/` is that noun's own adjective, so the rule could only be subject-only and asymmetrical. `goron` / `goror` are the ordinary root *coin* as a name / resume. Parser: `predicateAfterVerb` | predication.md |
| D-34 | A social tie on `/h/` (*as a friend of Uzozen* as `humayam bluzozen`) | `/h/` already means manner, so it would share a spelling with the manner word (*companionably*). A slot-part role compound on `/h/` is the capacity the act is done in (`hwezuduyel` *as a teacher*), which a person-as-adverb cannot mean; a social tie has no such split | relations.md |
| D-35 | A mirative overlay on `/w/` (`wemol`); PLAN, DECISION, ATTEMPT or WANT on `/w/`; a clause pole on `/w/` or `/h/` (`wohom`, `hohom` as *in case*) | on `/w/` those spellings are their roots' ordinary words (`wemom` *surprisingly*, `wagem` *as planned*, `wogom` *decidedly*, `wowam` *tentatively*, `walem` *wishfully*, `wohom` *opportunely*). A pole needs a `/b/`, and `/w/` takes none; an intention mood is about an act, and an adjective names none, so on `/w/` it would also split its holder between the clause and that adjective's noun. *In case of rain* is `thohom blerulal` | knowing.md, intention.md, causation.md |
| D-36 | **-n** on a sake word (`gawothan`) | `gawothawor` would read as a viewpoint lateral | sakes.md |
| D-37 | **-x** on a `/th/` stance word (`thomamx` as *we may*) | it would hand the stance to the speaker's associates without saying how you know they hold it. Someone else's view goes through a holder, whose host is that warrant (`theyemuzozenx`). Parser: `pluralOnPos` | plurality.md, knowing.md |
| D-38 | `th#1` as *first-hand* (`threbal`) | first-hand is a live look or a memory, and the channels keep those apart because a memory can be wrong; a bare *first-hand* would claim the warrant without saying which | knowing.md, numbers.md |
| D-39 | A single-item clause join (`A xul` *not the case that A*) | said aloud, `A xul.` before a new sentence `B` sounds like `A xul B` (*neither A nor B*) when the pause is missed, which flips the next claim. Deny or single out the verb or noun (`vowurel vul`, `zuzozen zal`). Parser: `clauseSingleItem` | joins.md |
| D-40 | A bare role compound is not a kind or occupation (`zwazuduyel` is *someone who teaches*; *a teacher* is `zwezuduyel`) | a kind reading by default turns one act into a claim about someone's nature (*one fight makes a fighter*), the shortcut label scope exists to slow down. The usual role takes practiced-role **`the`**, so the trait is chosen, not implied. Rejected: kind by default with scope only to narrow it, and a kind reading only on `/ɡ/` (the same word would then reach differently by slot) | roles.md |
| D-41 | `th#N` after LIVE or MEMORY (`thugom thredol`) | the number counts hands between the event and you, and these channels are first-hand by definition (same reason as D-38), so the pair contradicts itself. The count is of hands on the evidence, never reasoning steps (CLUES) and never reliability (the channel ending). Parser: `handDepthChannel` | knowing.md, numbers.md |
| D-42 | `/th/` on the record or scroll root (`thegom`, `thonem`) | either would be read as a channel, and each bundles jobs the channels keep apart: footage is your own senses (LIVE / MEMORY, and footage you watched can be misremembered), a document is someone else's word (REPORTED), a schedule is a PLAN, and a tale is NOTIONAL when made up or REPORTED when passed on as true. A stance word on these roots would blur exactly those lines. Parser: `retiredChannelRoot` | knowing.md |
| D-43 | A `bl-` word hosted by a call or reaction (`yohumal bluzozen` as *hooray for Uzozen*) | a plain `/b/` right after a `/y/` word opens the body as the person who receives (*Olazun, tell Uzozen …*), a natural order after a call; a second, hosted reading of the same spot would add a job with no gain. A reaction's target already has hook + `/b/` (`yohumal el buzozen`). A `gl-` adjective before the call or reaction still hosts its own `bl-` word | speech-moves.md |
| D-44 | Word order carries no meaning beyond the speech act's usual order and, inside a verb join, which verb a word goes with (D-47): no information focus by fronting, and the usual order is never required. Rejected: verb first in yes/no questions and prohibitions | the usual orders are redundancy for a missed act word, so order is spent on that one job. Focus by fronting would make every reordered statement sound like another act; contrast already has `&`, and plain new information is clear from context. Only a command starts with its verb, so a lost `yol` / `yul` falls back to a statement, never to an order to act. A bare-verb body (`yul vowurel`) has no order to vary; `yul yul` covers it | speech-moves.md, questions.md, clause.md |
| D-46 | `/th/` is what is in a mind (the speaker's, or a holder's through the seam); what someone did, can do, or said that others could check is on `/h/`: ATTEMPT, hostless ability, a say word (permission, prohibition, requirement, consent), and the books words RESIDUE and FORMER. WANT, PLAN, DECISION and motive are `/th/`. WANT, PLAN and DECISION take no `bl-` person (`thalem blolazun`, `thagem blolazun`); a plain `/b/` after them is the verb's recipient; someone else's goes through a holder (`thebamuzozen thagem`, and after `uem` the holder then the stance). PLAN's `bl-` word is only a forward offset; DECISION takes no `bl-` word at all, since it carries no time (date it with `thenam`). Parser: `intentionHost`, `retiredDeonticRoot` | a stance letter that also held facts about the subject made *the subject's own plan* and *my doubt* look alike, and a `bl-` owner let a word state another person's wish, plan or choice with no grounds, against the warrant-for-others'-views invariant. A plan or a decision is not something others can watch: they see an announcement or behavior, and how firm a choice is or whether backups exist is in the planner's mind. Reading intentions into others is a classic bias, so it needs a channel. A try, an ability, a grant, a ban, a demand and a yes are acted or said openly. The say words stay one family on one letter, so the rule, person and custom endings stay together; a bare **`v`** keeps the speaker as its default owner (*you may go* is a performative), so in a statement whose speaker is a participant it has no reading: the speaker's say over their own act is their part (`hwazem`), and *I have to* must say whether the rules, a person, custom, or the speaker requires it (`saySpeaker`) | clause.md, intention.md, knowing.md, sakes.md |
| D-45 | A `bl-` word right after a measure amount (`bagorum grugel blahelan`) or an equative's factor (`gelazom hradol blahelan`). Parser: `slotlessHost` | hosting there would need a reading with no job: the amount already counts the unit, and the equative's other item is already in its list. A plain `/b/` there is the clause's recipient | numbers-applied.md, comparatives.md |
| D-47 | A shared object or recipient on a joined verb that has its own (`duredal vugudel vagedal val doledol`: two objects for *cook*). Scope by position: the words between the subject and the first verb are the first verb's, and words before the subject or after the join are every verb's. A from–to pair that straddles a verb join (`ul X` before the first verb, `oel Y` after the join) is not paired across it. Parser: `verbSharedOwn` | a verb takes one object and one recipient, so a second would have to read as a list, which a join already says. The first item starts at the subject so a learner's *popcorn cook* is *cook popcorn*, as in English, and so one clause can give the first verb alone an object; before the subject stays free for scene-setting words and a verb-late shared object (English shares a fronted object too). Rejected: words before the first verb cover every verb (no one-clause way to give the first verb its own object). The straddling halves stay apart because pairing them would reach across the join's items; each half reads by its own position | join-across-roles.md, numbers-applied.md |
| D-48 | `/h/` on the map or check root (`hagem`, `hogom`, any ending but **-n**) | the ordinary `/h/` reading (*as planned*, *decidedly*) would state that the subject intends or chose the act with no channel, the exact claim D-46 moves to `/th/`, and it would sit one letter from PLAN and DECISION. `/w/` `wagem` / `wogom` stay ordinary (D-35). Parser: `retiredIntentionRoot` | intention.md |
| D-49 | `uem` before a say word that says yes (answer **`a`**): permission, and a participant's yes, on yourself or from someone in the act (`uem hwavam`, `zuzozen dolazun vawebol uem hwadam` *against Olazun's withdrawn yes*, `uem hwazal` *breaking my promise*). Parser: `frameKind` | a listener who misses `uem` hears the plain word, and after a yes that is *they agreed*: a consent violation turns into a claim of consent, and *breaking my promise* into *I promise*. After a refusal a missed `uem` still says no (`uem hwadum` → `hwadum`). Each reading it would carry already has an exact form that cannot flip: a yes taken back is a no (`uem hwadum`), an act past the agreed terms is the consent bar (`hwadam` before a rank join), and a broken promise is `hezom blarl` + a sentence with `hwazal`. Rejected: allowing it only on yourself, for a broken promise, since the flip is the same | sakes.md |
| D-50 | A hook compound on a three-letter root (*map* + *from*): only a five-letter root fuses with an extra-noun hook. Parser: `parseHookCompoundCite` | a three-letter root + ending + a one-vowel hook spells the same letters as a five-letter root with **l / m** second + its ending (`VCV` + m + `ul` = `VCVmu` + **-l**). Allowing both would make placement keep every nature and mind root off a three-letter onset, or make the reader know the roots to split the word. Three-letter roots are overlay hosts, nearly all nouns, and hooks fuse onto motion and speech verbs, so no fused word is lost; the two-word form (`… ul …`) stays | hooks.md |
| D-51 | Hosting by position (any `/b/` right after a `/ɡ/`, `/h/` or `/th/` word completes it). For a hosted number or tag: a one-onset `brl-` / `bwl-` / `blr-` / `blw-`, a written vowel (`blo-` / `ble-`), a schwa (written `i` or unwritten), or leaving numbers and tags positional. A mark on the host instead (`hlewom`) | position put a recipient one misplaced adjective or adverb away from a complement, and made words with no relation (*angry*) take one anyway; D-44 gives order no meaning, so it cannot carry this job. Two approximants in one onset get a vowel slipped in, so the cited sound would not be the spoken one; `blo` + `r…` reads as `bl` + a root in `or…`; a schwa adds a fifth vowel; tags are pronouns, so a positional tag recipient keeps the same accident; two host marks are easy to mix. The beat is written: syllabic `l` | clause.md, phonology.md |
| D-56 | A tag in a holder seam (`theyemwar`). Parser: `holderSeamW` | the seam letter before `w` would end a syllable mid-word, which the singable shape allows only for the `m` before a prefix's `x`. A holder you don't name is a kind of person (`theyemeyol` *someone*, `theyemeyolx` *some people*) | knowing.md, phonology.md |
| D-52 | `we` / `wo` in a number body | `w` is the exponent sign and uses only `a` / `u`. `we` is a hard confusion pair with digit 7 `re` (r/w), and `wo` with digit 6 `vo` (v/w), so a misheard digit would land on a valid-looking filler. Parser: `SpeechDigitSyllable` | numbers.md |
| D-57 | An `lx` seam after hook vowels or a number body (`guelxavuvul`, `zolxual`, `zragelxezuyel`). Parser: no word | plain **`x`** already spells the hook's **-l** reading (on a hook prefix and a hooked join) and an exact number, so `lx` would add nothing but a syllable-final `l` mid-word, against the [singable shape](../grammar/phonology.md#singability-constraints), on the commonest prefixes. The **-m** frame and an approximate number need their `m` (`uemx`, `ragemx`), because plain **`x`** is taken | hooks.md, numeric-derivation.md |
| D-58 | The root-first numeric shape: root, **-l** / **-m**, then a number body (`zolamalrawal`). Parser: no word | the word is a kind of its root, and in every other compound the kind comes last; root first was the one compound a learner read backward, against English *quasi-*, *proto-*, *multi-*, *tri-*. The join before **`r`** also closed a syllable mid-word on every such word, against the [singable shape](../grammar/phonology.md#singability-constraints). Number first on the **`x`** seam keeps each piece of meaning on one letter: the root's sense moves to the final ending, as on any **`x`** compound, and *approximate* moves to the seam (`mx`) | numeric-derivation.md, phonology.md |

## Rejected alternatives

### Comparison bars

**No named -n bars.** A closed list of standards (root + **-n** under `/z/` `/d/` `/b/`) repeated what the stance words already say. It also hid *how you know* the standard, and it needed a placement rule to keep sake bars apart from judgment bars. Each old bar maps onto a stance:

| Old bar | Say instead |
|---------|-------------|
| Typical, Average, Social / Professional, Everyone | PATTERN `thubem` (population in `/b/` when needed), REQUIRE for a custom or rule, or a superlative |
| my standard | REQUIRE `hwavem`, or the attitude `thoguyem` |
| Best-effort | ABIL `hodaxal` |
| the nine sake bars | the met sake word (`thudatham`, `thobatham`, …) |

### Contrary to a stance (`uem`)

The stance after `uem` must have content the event can contradict: a norm, an intention, a wish, a report, or an expectation. The parser rejects other stances (`frameKind`). Those cells are open in [unassigned-reserved](unassigned-reserved.md).

### Whose plan or decision

Someone else's plan or decision goes through a holder seam (`thebamuzozen thagem`), like a want (D-46). Rejected:

- **A `/b/` owner after PLAN or DECISION** (`thagem blolazun`). It names whose plan it is without saying how you know, and it made PLAN's one `/b/` hold either the owner or the date, so a dated plan with an owner needed a time pole. With the holder, PLAN's `/b/` is only the date.
- **PLAN and DECISION as one word.** At their soft defaults both said only *intends to*, but preparation (do backups exist?) and firmness (can it still change?) are separate questions, and each guards a different failure: not anticipating setbacks, and locking in a choice. One word has room for one ending scale. They stay two words, with PLAN on a later act and DECISION carrying no time.
- **`-m` read as a firm claim for your own plan.** `-m` stays *unstated* everywhere; for your own PLAN, *no backups yet* is only an implicature, because you know whether you have them. Firmness and how long a want lasts are self-predictions, so no implicature is taught there.

### Stand-in dependents

A dependent runs to the end of the written sentence, so `dorl P xol Q` is *whether P or Q*. Rejected: a join that closes everything before it, main clause included. That left *whether P or Q* with different subjects no route except asking the question and pointing back with `dorth`.

### Channel frames

- **No reset at every turn.** A bare answer, a tag, a call, an interjection, and a narrator's own question all sit inside a story. A question or command already keeps the frame off its own body (a channel in a question is the listener's grounds), so it needs no reset to stay clear of it.
- **No reset at a topic change.** A story moves from one person to the next; topics keep no stack, so a return could not restore the frame; and `xuvewem` *next* is how a narrative sequences. Only `xuvedam` *by the way*, a digression, ends it.
- **No frame shared across speakers.** A frame is one speaker's evidence. A reply that ended it would cut off a story the first speaker is still telling, and a reply that inherited it would claim evidence the replier does not have.
- **No carried frame for a time pole's offset.** A signed offset on a pole still needs a channel in its own clause, so each clause shows its warrant to a reader who starts there.

### Deduction

- **No negative DEDUCED channel** for *that doesn't follow*. A channel says how you know a claim; a "does not follow" channel would deny a link instead, its endings would need a second meaning, and it would cover deduction only. A stance join between the pole and `blarl` (`thanam thohom thul blarl`) denies the link and also gives *not because P* for any clause grounds.

### Holders

- **No free holder word or hosted `/b/` holder.** Fusing the holder onto a warrant makes a warrant-less attribution unwritable, even where no parser checks it.
- **No `th` seam (`theyethuzozen`).** It drops the grade. A consonant + `th` cluster (`thevemthazawan`) is illegal mid-word.
- **Recognition by spelling.** A `/th/` word that begins with a closed host root, then `l` / `m` / `r`, then a vowel, is a holder. This is safe only while no published root has that shape: respell a new root of that shape rather than add a special case.

### General claims

- **No universality moods** (COMMON, UNCOUNTERED, FORMAL, NATURAL, RULE: `ogulu` / `obebu` / `alo` / `oledo` / `ubedu` on `/th/`). Each mixed two jobs the language keeps apart: how far a claim reaches is the fence or restrictor, and what it rests on is a channel.
- **Open -m never asserts an amount.** Rejected: *just about everything* / *hardly anything* for the empty forms (`zam`, `zuam`, `ham`, …). Those readings assert an amount -m never states, and they made the counting forms read unlike deny, menu, and rank. Agebon does not split *I have not checked* from *I know of exceptions but am not listing them*.
- **The kind itself is `zuan` + SHARED kind.** Rejected:
  - `zulenom` + kind: it names the label or category, not the lineage (*the cat category was domesticated* is wrong).
  - **-n** on the kind root: `zagozon` is a creature named Cat.
  - **-nx**: a named team.
  - Recipes alone: *domesticated*, *invented* and *evolved* do not reduce to claims about members.

### Kind indefinites

Role letter + `w` + knowledge vowel + kind letter + a standalone join (`zwuyar` *someone; I don't know who*, `zweyual` *everyone we know*, `hweral` *never, in the times we both know*) is retired.

- **The kind letter** mostly made one word of what two already say (`zeyol zar`, `zul geyol`). It also made a root tail, otherwise a memory aid, into grammar.
- **The knowledge vowel** was optional, and plain `zar` stayed the default. A route with an extra clause is just as optional, so nothing is lost on how often people mark who knows which one, only length. A real question is plain `yol … bar`; *remind me* takes MEMORY on the question, and a choice PLAN; *I know who* is its own sentence (`zuwon vanam dorl zar.`); *you know the one* is a resume with no antecedent (`zeyor`); *nobody I'll name* as a source is `thebam blumon` plus that sentence; a shared-history *never* is the holder seam (`hal thevumayan`); *everyone we know* bounds the join with pair scope (`zual gwodanam blayan`). The quiz has no taught route yet (`stacked-speech-acts.md`).
- **The shape is wanted elsewhere.** Role letter + `w` + vowel + consonant is the shape of [role compounds and pointers](../grammar/roles.md#role-compounds).
- **Hooked joins tighten three of them.** *Everyone here* is `zomxual bluwon`, *people anywhere* `zoxuam blual`, and *never, over a stretch the speaker names* `huxal blarl` ([hooked joins](../grammar/hooks.md#hooked-joins)).

### Hooked parts and the result

A role compound names a participant that sat in `/z/`, `/d/`, or `/b/`. Retired:

- **The scene, tool, goal, source, path, and bearer** (`dexezuvol`, `daexarayel`, `doexaruvel`, `duaxobuvur`, `duoxowurel`, `zuexurozum`). A hooked landmark sits in `/b/` behind its hook, so naming it from the slot would need the hook vowel too, which collides with the recipient (no hook) and with label scope. Every fix tried (a separate recipient part, merging the recipient into the goal) cost more than the forms are worth. Losses: a short form for an unnamed landmark (*wherever it happened*), and person nouns for the bearer and the beneficiary (*a theft victim*). A kind of place, tool, or time is an ordinary compound with a head root; a named landmark is resumed or pointed back to with its hook.
- **A separate result** (`daoxeguyel`). What an event makes sits in `/d/` (*builds a house*), so the undergoer names it. Whether a verb's `/d/` is acted on or brought into being is a fact about the verb, and a verb rarely has both; a second spelling would make the learner pick between two parts for one slot. Loss: no spelling marks *this did not exist before*; the stem carries it.

### Role scope at the front {#role-scope-at-the-front}

A role word writes its label scope right after **`w`** (`zwazuduyel`, `zwezuduyel`), and every role word picks one.

- **Scope is required.** A single fight gives *someone who fought* (`zwazavuvul`); calling someone *a fighter* (`zwezavuvul`) is a separate, visible choice. Cost: with **`a`** as the default reading, *this time only* is no longer apart from *at least once*. A strict *only this time* can be a scope pair later.
- **Written once.** A **`th`** scope after the stem (`zwazuduyethel`) has no reading, so a role word never carries two scopes. Ordinary roots keep the **`th`** seam, so label scope is taught in two places: after **`th`** on other words, at the front of a role word.
- **Scope and ability combine.** With scope at the front, the ability vowel after the stem no longer competes for the same spot (`gwezuduyexal` *can be a teacher, as a practice*).

### Stacked scope readings {#stacked-scope-readings}

A **`u`** scope pair reads like a join's *everything but* (**`u`** every scene, the second vowel set aside), and the other pairs read like extra-noun hooks, so **`ao`** is *over*: the label belongs to the situation, not the person ([predication](../grammar/predication.md#scope-stacks)).

- **`ao` is not *this time, toward this one*.** That reading was plain **`a`** + **`o`**, the only non-**`u`** pair that ignored its hook. The situation reading targets the commonest labeling bias (character blamed for what the circumstances did), which **`tha`** only limits in time. Loss: *this once, to Olazun* takes **`tha`** with a plain recipient, or two words.
- **`ue` is off duty, not refusal.** Setting the role aside presumes it; refusing it denies it, and one spelling cannot do both. Denying a label is **`gul`** after it.
- Rejected: **`ao`** as *on paper* / *by title* (the hook's footing reading), which reads oddly on adjectives (*officially angry*).

### Hook prefixes {#hook-prefixes}

A hook prefix (`guexavuvul` *anti-fighting*, [hooks.md](../grammar/hooks.md#hook-prefixes)) takes the role letter + vowels + **`x`** shape that role compounds left when they moved to **`w`**.

- **Scope stays optional** on a person noun (`zuexavuvul` *an opponent of fighting*), unlike a role word (D-40). A role word names a part in an event, so a bare one would turn one act into a trait. A hook prefix names a stance toward its stem, not a part someone played, so there is no single act for the label to inflate. The **`th`** seam after the stem still says the reach (`zuexavuvuthel` *a committed opponent*, `zuexavuvuthal` *against fighting this time*). Rejected: required scope at the front, as on role words, which would put two vowel slots before the seam and spend a letter on every prefix word.
- **The -m frames get `mx`.** Leaving the frames without prefixes would lose *contra-*, *inter-* (*amid*), and *para-* (*near*). The **`m`** is the letter that marks the frame on the free hook (`uel` → `uem`), so `uemx` reads without a new rule. Cost: a syllable-final `m` mid-word, the same one an approximate [numeric prefix](#numeric-prefixes) uses (D-57 for why not `lx`).
- **Slots.** A prefix word fills `/ɡ/`, `/z/` `/d/` `/b/`, and `/h/`. On `/v/` it would repeat the `/ɡ/` predicate, and `/w/`, `/th/`, `/x/`, and `/y/` have no reading yet ([unassigned-reserved](unassigned-reserved.md#hook-prefixes)).

### Hooked joins {#hooked-joins}

A hooked join (`zoxual blahehal` *everyone at the house*, [hooks.md](../grammar/hooks.md#hooked-joins)) takes role letter + hook vowels + **`x`** + a join, the slot role pointers left when they moved to **`w`** and that hook prefixes leave open (a prefix stem is a root).

- **Hook first, as on a hook prefix.** The hook comes before the seam and its **-l** goes unwritten, so a learner who reads `guexavuvul` already knows where the hook is. The two read their right side differently: a root after **`x`** is the prefix's landmark, and a join after **`x`** is the word's head, with the landmark in `bl-` after it. The shape after the seam tells them apart. Rejected: the join first (`zualxol`), which would make the join a left piece of a compound, the opposite of every other **`x`** word, where the head comes last.
- **Only extra-noun readings.** The same vowels also mean *including*, *rather*, *instead*, and *except*, but those are set operations the join series already has (`zuzozen zual` *everyone but Uzozen*, `zur` *someone else*). Reading them inside a hooked join would make one spelling ambiguous between a bound and a set operation, a cost, not just a second route.
- **`a` and `u` stay spatial.** `zaxual blavayal` is everyone inside the family's space and `zuxual blahaham` everyone who came from the town. Membership and origin as identity are of-relations (`gobem`, `gaham`), which already bound a join as SHARED. Reading `a` as membership or `u` as origin would give one hook two pictures, chosen by the landmark's meaning, which the parser and the learner cannot see.
- **Time readings only on the `/h/` hooked join.** There they bound which times a restrictor covers, and the time reading is fixed by the slot. On a free hook a time reading would depend on whether the landmark noun names a time, which the syntax cannot see; a free hook keeps only `ul` *since*, and the event's own time takes the time poles. For the same reason a time point-back takes only structurally marked time landmarks (a time pole's `bl-` word, an `/h/` hooked join's landmark, a `blarl` in either).
- **Point-back by the hook's own -r.** `r` before the seam is allowed only on the hooks whose free **-r** points back (`ar`, `aor`, `or`, `ur`, `uor`, `er`, `aer`), so the reading is the one the learner already has. A hook prefix takes no `r` before its seam (`gorxahehal`): its stem is the landmark, so nothing is left unsaid to point back to.
- **Only hooks fuse with a join.** A number body or a role-compound stem before **`x`** + a join (`zragexual`, `zwazuduyexual`) has no reading. A free number or a role compound after a join is already a SHARED `/ɡ/` with one reading (`zarx gragel` *some three people*, `zual gwazuduyel` *everyone who teaches*), so there is no clause-extra reading to escape, which is the hooked join's only job. Their meanings also do not carry over: a numeric prefix describes the kind named by its root, and a join has no root; a role compound has no seam, and a join after its stem would become the head, giving mid-word **`x`** a third reading.
- **Mid-word `r` before `x`.** It widens the singable-shape exception from the `m` before **`x`** to the `m` or `r` before **`x`**. Accepted: point-back stays one short word, and `rx` is already said at the end of a word (`zarx`), so the sound is not new. The word break against `zarx ar` is carried by first-syllable stress, as for hook compounds.

### Numeric prefixes {#numeric-prefixes}

A numeric prefix (`zragexezuyel` *a three-part dialogue*, [numeric-derivation.md](../grammar/numeric-derivation.md)) puts the number body before **`x`** and the root; D-58 closes the root-first shape.

- **The seam marks approximate.** Plain **`x`** is exact and **`mx`** is approximately that number, as **-m** is on a free number (`gragem`). The final ending is then free to pick the root's sense, as on every **`x`** compound. Rejected: approximate on the final **-m** (the old reading), which would leave the root's sense nowhere but a mid-word join letter.
- **One prefix family.** With hook prefixes, the left of the seam says what kind of prefix it is: hook vowels name a relation to the stem (an *anti-war* stance is not a war), a number body names what kind of stem it is (*a tri-dialogue* is a dialogue). Both use **`x`**, and both use **`mx`** for their **-m**. A number body starts with **`r`**, which no root, hook vowel, or role marker does, so the two never collide.
- **Still one digit.** **`+N`** / **`-N`** / **`#N`** keep one digit, and **`_`** keeps any digits. The seam would delimit a longer body, but no reading asks for one: *twelve-step* counts steps, not parts of the stem.

### Pointers in a seam {#pointers-in-a-seam}

A role pointer is no holder and no viewpoint lateral's facing anchor. Its stem opens with **`w`**: after a holder's grade letter that `w` ends a syllable mid-word (D-56, as for a tag), and after a lateral's **`th`** it makes a `thw` cluster. A resume of the person says the same (`theyemuzozer`, `howuhethuzozer`), at the cost of spelling their stem.

### Names and their instances

One of a name is **-ln** (span `^@`). Rejected:

- **-l:** on a native root it is already the root's own sense (`duzozel` *a swan*).
- **-nx:** it is *name and associates*.
- **`dar` + `/ɡ/`:** under `yol` the join **-r** becomes a fill-ask blank.

### First person

Plain *I* is `uwon`, not your own name. A name for *I* left *I* and *you* unmatched (an example cannot know the listener's name), mixed name and pronoun in one sentence (`zSELFn … em buwon`), and modeled a habit that sounds childish or grandiose to most learners. The name stays where it is the form: a greeting, a conversation-length bid, introducing yourself, and a mention that must keep meaning you outside this conversation.

### Multipart names

A full name is the given name plus a family name on `/ɡ/` + **-n** ([word-endings.md](../grammar/word-endings.md#multipart-names)). Rejected:

- **`/v/`, `/h/`, `/w/` or `/th/` + -n as a name part:** each works on the whole clause and already has its own **-n** reading (a titled event, a named standard, a named scale), so a name like *Uguda Owoga* on `/v/` would read as *Uguda performs Owoga*. Names with grammar inside are titled phrases or spans.
- **`/ɡ/` + -m for belonging to a family:** **-m** is a root's published abstract sense, so a family-name root on **-m** could not be told from that sense. Belonging uses *whose* (`em` + the family).
- **`/ɡ/` + -n never hosts a `/b/`:** hosting is decided by position alone. An exception for one ending would fix only this case while every trailing adjective keeps the same trap; the recipient's usual place after the verb avoids it.
- **The length bid on the family name:** **`x`** + vowel on `/ɡ/` is ability, so the bid goes on the given name.

### Spans

**A span is written only.** The spoken open, close and resume served only speech-to-text, which does not exist, and they cost the TYPE and EDGE vowels, three close words and a spoken `/y/` span. Revisit only with real speech-to-text.

### Stacked vowels

Only the six standard stacks exist (`ua` `uo` `ue` `ao` `ae` `oe`), always in the order **u**, **a**, **o**, **e**. A reversed or extra pair is too easy to confuse by ear with its standard twin (`eo` vs `oe`).

**Stacks have their own order, not pitch order.** Each vowel keeps its pitch in a stack, so every stack is a small melody, and stacks are worth telling apart by ear. In pitch order (`u e o a`) every stack falls, and `ue`, `eo` and `oa` are all one-step falls that differ only in height. Contrast needs falls and rises mixed, so the order must go down in pitch and back up. All six orders that keep **u** first (the `u` stacks carry **u**-first readings) were scored by close pairs: two stacks whose start and end are each within one pitch step.

| Stack order | Stacks | Close pairs | Falls exactly on the **u** stacks |
|-------------|--------|-------------|------------------------------------|
| `u e o a` (pitch order: all falls) | `ua uo ue ea oa eo` | 10 | no |
| `u e a o` | `ua uo ue ea eo ao` | 8 | no |
| `u a e o` | `ua uo ue ae ao eo` | 6 | no |
| **`u a o e`** | `ua uo ue ao ae oe` | **5** | **yes** |
| `u o e a` | `ua uo ue oe oa ea` | 5 | no |
| `u o a e` | `ua uo ue oa ae oe` | 3 | no |

The ranking is the same in semitones (0 / 3 / 5 / 7) as in steps. An order with **o** before **u** (`ua ou ue ae oa eo`) has no two stacks one step apart at either end, but its preferences run in a circle, so learners would memorize six pairs instead of one order. The alphabet's vowels follow the same order, so a stack is always in alphabetical order.

**A fall marks the u stacks.** `u a o e` is the only order that puts the three other vowels in rising pitch (`a`, `o`, `e`), so every **u** stack falls and every other stack rises. A **u** stack is the undo or set-aside member of its family, so the contour's direction, the pitch cue that best survives quick or flat speech, carries polarity ([phonology](../grammar/phonology.md#phonotactics)).

**Direction outranks the close-pair count.** `u o a e` scores best (3 close pairs to 5), and it differs from `u a o e` in one stack only: a small low fall `oa` (3 → 0 semitones) where `u a o e` has a small low rise `ao` (0 → 3). Of the five pairs that stack is in, three become clearer and two less clear:

- **Clearer:** against `ua`, `uo` and `ue`, the stack now runs the other way. The count missed the worst of the old pairs: `oa` and `uo` (7 → 3) have the same shape, a fall of 3 to 4 semitones, only about 3.5 semitones apart in height. That pair crosses the **u** line, so a slip flips the meaning: *sure* heard as *not that*, *picks* as *bars*, *on this pair* as *except this pair*.
- **Less clear:** `ao` against `ae` (same start, ends 2 semitones apart) and against `oe` (rises of 3 and 2 semitones, about 2.5 apart in height). `ao` and `oe` are now the closest pair in the system, and the three rises crowd together, more so for a speaker who flattens the low end of the range, where `ao` starts. Both pairs stay on one side of the **u** line, so the worst slip keeps the polarity: *sure* heard as *true* or *I won't answer*, *on* as *using* or *toward*.

Vowel sound still separates every pair, so the crowded rises cost something only when the vowels are also half-heard. Removing a same-shape pair that crosses the **u** line, and giving polarity the strongest pitch cue, was judged worth two close pairs inside the non-**u** side.

**Polar stance reads by its first vowel.** Alphabet order matches the family ranking (undo, then accept, then pass), so the first vowel of a polar pair names its family ([questions](../grammar/questions.md#polar-stance-fuller-inventory)). Under `u o a e`, *sure* could not start with its accept vowel, and a pair would have to be read by which vowels it has.

**e comes last, not o.** In a rank join stack the last vowel names the move and the first adjusts it, so every rank join ends in **e** (`e` `ae` `ue` `oe`). Spelling the tie `eo` would make it the one rank join that does not end in **e**. With **u** as /ʉ/, `oe` vs `ue` is a clear contrast, so the sound gives no reason to move **o** last.

### Closed-root endings

- **-r on a closed root** is the family's own **-r** where it defines one (a settled-to-passing grade, or the *because* share). Everywhere else it is the whole-stem resume (`thohor` *in that case*), so giving such a family an **-r** grade would take away a live reading.
- **-n on a mood root** is an ordinary proper name. There is no named-mood overlay.
- **-n on `/y/`** calls someone, so the act and polar series have no named-formula interjection.
- **-r on the act series** is the *for now* act (`yar` *as things stand*), so no `/y/` word is a fill-ask blank for the act itself (*are you asking or telling?*).

### Hooks and relations

- **`oel` stays** although `al` already spans numbers. For other nouns, *A, including B* depends on whether A names a group, which the syntax cannot see.
- **No `el` / `em` / `er` possession series by time horizon** (`rejected/el-em-er-possession.md`).
- **No co-agent, opponent, or beneficiary part:** those were not given a part consonant. Co-agent is rare as a kind and the join-relation *with* covers it; an opponent is usually the undergoer; a beneficiary overlaps recipient, and *for* is the hook `el`.

### Sake inventory

- **Understanding is its own sake, not part of competence.** Boredom with an easy task is competence met and understanding unmet, and the two call for different help. Novelty for its own sake stays under pleasure.
- **Surprise is not a sake.** It is the MIRATIVE (`themom`), a closed `/th/` mood apart from the eight channels: it says nothing about how you know and stacks with a channel.

### Experiencer adjectives

No adjective for someone else's feeling: it would bypass the holder warrant. A noun before a lone feeling is an existence clause, so `zolazun thuwathuruor` is *anxious that Olazun is here*. Someone else's objectless feeling goes through a holder (`thuwathuruor theyemolazun`).

**No default reading of a motive as the actor's own.** A motive word on someone else's act stays your stake, as every sake word does. Reading it as the actor's reason would state what is in their mind without a warrant. Someone else's motive goes through a holder (`thawothom theyemuzozen`), as their feelings do. The same holds for prescription: plain `the` is advice for your stake, and advice for the advisee's own good names them in `/b/`.

### Young and sexed animals {#young-and-sexed-animals}

*Puppy*, *mare* and *ewe* are the animal's root plus a `/ɡ/` adjective (`zudozol gahoyel`, `zohazel gevugol`), taught in [young, male and female animals](../grammar/say-people-places.md#young-animals). Two alternatives were rejected:

- **A live `x` compound** (`zahoyexudozol`, *child* + *dog*). A compound's left root narrows the head without saying how. The dictionary's *baby* + *room* is a room **for** a baby, so *child* + *dog* reads as *a dog for children* just as easily as *a young dog*. The adjective says the dog **is** young. The compound stays legal, but it is not what the recipe teaches.
- **A dictionary row per English word** (*puppy*, *mare*, *gelding*, *cygnet*). Age and sex are properties of one animal, not kinds of it: a puppy becomes a dog. Rule 1 of [when a compound earns a row](lexicon.md#when-a-compound-earns-a-row) keeps out a thing plus a property. Rows would also add hundreds of English-specific words that one pattern already covers, and the [kin words](../grammar/say-people-places.md#kin-words) say sex with the same adjectives.

### Denying a list

A **u** join after a closed list denies the list as a whole: it is single-item *not X*, with the list as X (`val vul` *not both*). The rejected reading denied each item and kept the list's vowel. It made `val vul` a second *neither*, it made `vol vul` say the same as plain `vol`, and it left *not both* with no form.

### Digit syllables

The digit table is built from two rules, consonant blocks and a vowel cycle that climbs the [vowel pitches](../grammar/phonology.md#vowel-pitch), rather than English cues (*one*, *duo*, *zero*), which left 4, 6, 7 and 8 with no cue and caught none of the likeliest mishearings.

- **Consonant blocks:** the stops `b d g` (1–3), the breathy sounds `h z v` (4–6), and the four word endings `r l n m` (7–0).
- **Scale cycle:** digit vowels run `a o e u` from 1, lowest pitch to highest, as scale degrees do. 1 is the lowest note, 5 starts the next round, and 0 counts as the tenth digit. Letter names keep the opposite-vowel rule, so they walk the scale down.

**Confusion test.** Each digit consonant has one vowel, so 30 of the 40 consonant + vowel pairs are not digits. A consonant pair that is easy to mishear must not share a vowel, so the mistake lands on a non-digit:

- **Hard pairs** (must differ): m/n, d/g, b/d, b/v, l/r, b/g, v/w, r/w, l/n, v/z, v/h. Place of articulation is the weakest cue in noise (Miller & Nicely 1955). Common second-language merges: l/r (Japanese, Korean), b/v (Spanish), v/w (German, Hindi), l/n (some Chinese varieties).
- **Soft pairs** (avoid when free): d/l, d/n, d/z, b/m, g/h, l/y, r/y.

The test covers digit pairs and digit–filler pairs. The exponent filler is checked on `a` / `u`, and the points filler `y` on all four vowels. The table passes every hard pair and every soft pair between digits. `y` still shares vowels with `l` and `r`, which no filler that uses all four vowels can avoid. A unit test pins the pairs (`src/tts/numbers.test.ts`).

**Fillers `w` + `y`.** Inside a number word, digits avoid `th` (the group separator) and `x` (the seam and plural). That leaves twelve letters for ten digits and two fillers. Keeping `y` keeps the points syllables. `w` and `y` are the two rarest first consonants of ordinary roots, so the [number pegs](../grammar/pegs.md) keep every 00–99 cell filled.

**Consonant order.** With a scale cycle from 1, digits 4 and 8 take `u`. `v` and `r` cannot sit there: `vu` and `ru` are hard pairs (v/w, r/w) with the exponent filler `wu`, and `ru` is also the negative marker. So `v` takes 6 (`vo`) and `r` takes 7 (`re`), which leaves `h` on 4 and `l` on 8 and keeps `m` on 0, clear of the soft d/l, d/n and b/m clashes. Within the stops each digit moves further back in the mouth; within the breathy sounds each moves further forward.

| Design | Hard pairs | Soft pairs | Pitch gap on test pairs (sum) |
|---|---|---|---|
| `u a o e` from 1, `b d g v z h l r n m` | pass | pass | 27 |
| `a o e u` from 1, `b d g v z h l r n m` | fails v/w, r/w; 8 is the negative marker `ru` | pass | — |
| **`a o e u` from 1, `b d g h z v r l n m`** | pass | pass | 19 |

The pitch gap is lower because a scale puts neighbouring digits on neighbouring pitches, and neighbouring digits are the most confusable consonant pairs (`b`/`d`, `d`/`g`, `m`/`n`). Their vowels still always differ, which is what the confusion test requires; only the pitch backup on top of it is smaller.

**Rejected:**

| Alternative | Why not |
|-------------|---------|
| Vowel cycle `u a o e` from 1 | It climbs from 2 to 5 and from 6 to 9, but 1 is the top note, so digits are not scale degrees |
| Exponent filler `we` / `wo`, so `vu` and `ru` could stay digits | Loses the *add* / *undo* cue of `wa` / `wu`, and digit 8 would be the negative marker `ru` |
| Counting down the scale (`u e o a` from 1) | Counts, ranks and scale degrees all go up |
| `b` + `y` fillers, the other letters reordered | Passes digit–digit pairs but not the filler: the exponent vs a `g` digit on the same vowel. No order that follows one principle passes both. |
| Base 5 (five consonants; a rounded vowel for 1–5, `a` for +5) | A misheard vowel gives a valid digit off by five, and nothing in the syllable catches it. |
| `r` as the exponent (`ra` / `ru`) | The exponent follows the marker, so about 30% of number words would open with a repeated syllable (`grara…`). Dropping one gives a valid number with the wrong order of magnitude. |
| `n` + `y` fillers | `na` / `nu` is a hard pair with `m` and `l`, and every passing assignment then puts `r` on `ra` or `ru`. |
| `h` + `y` fillers | `h` is the weakest consonant for an exponent, and the best order has no rule. |
| `m` + `n` fillers | The two fillers would be confusable with each other (`na` / `ma`). |
| Place walk on `w` / `y` (`mu ba vo re lu za do ne gu ha`) | Puts `m`, the thinnest first consonant, on 1, the most frequent leading digit. Back to front puts `h` there. |
| Marker harmony (each digit copies the marker vowel) | Leaves no vowel redundancy to catch a misheard consonant. |

**Accepted costs.** `r` still sounds like a marker (7 is `re`, so *the 7th* is `grerel`); the marker always comes straight after the role letter, and taking `r` off the digits would make it the exponent. Neighbouring digits sit on neighbouring pitches, so the pitch backup between them is small. `wa` / `wu` is a weaker sign than a stop, and `wu` does not exist in Japanese. The weights come from published phonetics, not from tests with Agebon listeners.

### Letter names

A digit letter's name is its digit syllable with the opposite vowel, so the ten names walk the vowel scale down (`u e o a`). The four other consonants have no digit, so their names are chosen to carry on that walk: after `m` the cycle reaches `o a u e`, so the four names use each vowel once, and that fixes their alphabet order (`th w y x`). Which letter takes which vowel follows the confusion test above, applied to spelling aloud: a letter does not share a vowel with the letter it is most often misheard as.

- **`w` takes `a`.** `wu` blurs into one sound, and `we` / `wo` would pair with `ve` (v/w) and `ro` (r/w), both hard pairs.
- **`th` takes `o`.** /ð/ is misheard as /v/ and /z/, so `the` and `thu` would pair with `ve` and `zu`.
- **`x` takes `e`.** /ʃ/ against unvoiced /s/ is *shoe* against *sue*, so `xu` would pair with `zu`.
- **`y` takes `u`.** No confusable letter is left on `u`, and `yu` is the English *you*, the `u` cue.

| Alternative | Why not |
|-------------|---------|
| `we ya tho xu` in order `w y th x` | Breaks the walk after `m`, and keeps the v/w and z/x pairs (`we` / `ve`, `xu` / `zu`) |
| `wo tha yu xe` in order `w th y x` | Fits the walk, but pairs `wo` with `ro` (r/w) |
| `xu we tho ya` in order `x w th y`, the cycle starting over at `x` | Fits only by restarting the cycle, and keeps `xu` / `zu` |
| A syllable for each of the four in the digit direction (`the yu xa wo`) | They are not digits and are said nowhere; three are already other words (`the`, `yu`, `xa`) |

**Accepted cost.** Like every consonant + vowel syllable, the names overlap grammar words (`wa` the exponent, `yu` points, `tho` motive, `xe` *can't, for now*); a name is said only when spelling aloud or as a mention.

### Finger code

The [finger code](../grammar/finger-code.md) gives each letter a shape counted on the fingers, with a separate piano form and its own guitar strings.

**Handedness.** The hands follow dominance, not left and right: the consonant hand holds fourteen shapes, including the hooked runs and grace shapes, and the vowel hand holds four. Sign languages split the work the same way. Piano is the exception (the bass is always on the left, so the left hand plays vowels). A left-handed guitar mirrors the instrument, so the picking hand still carries consonants.

**Vowel hand sideways.** Four fingers is a shape on both hands (`u` and `h`), and a run from the pinky is hard to tell from a run from the index at a distance, so the vowel hand's fingers point toward the other hand. A sideways palm was rejected: seen edge-on, the raised fingers hide behind each other.

**Two forms (shape and piano).** In the air most people can't raise the ring finger alone, and a lone middle finger is rude, so shapes keep to runs. On piano, whole runs make clusters that blur by ear, so the keys strike the run's end. A run is fully described by its last finger, so the two forms carry the same letters. Hooking means nothing on a key, so the vowel hand's thumb marks it.

**Vowel shapes count up the pitches.** The vowel hand's shapes are runs of 1 to 4 fingers from the pinky, in pitch order from the lowest (`a o e u`), the way the digits count. Signing, touch, piano and guitar then share one rule, *more fingers, higher vowel*, and the left hand keeps its natural layout (pinky on D♯3, index on A♯3) with the struck key climbing as the run grows. The consonant hand counts from the index, so the only shape on both hands is four fingers, and its spares *pinky alone* and *middle + ring + pinky* stay unassigned because they look like vowels. The cost is pinky + ring for `o`, the hardest of the four shapes; the thumb holds the index and middle down.

| Alternative | Why not |
|-------------|---------|
| Vowel runs from the index | On the left hand the index plays the highest key, so a one-finger `a` would strike A♯3 and the piano would fall as the count rose. It would need either *fewer fingers, higher vowel* (shapes that count against the digits) or vowels on the right hand (consonants below them and a new piano layout) |
| Vowel shapes in alphabet order (`u a o e`) | The piano's finger-to-key layout would no longer match the vowel pitches |

| Alternative | Why not |
|-------------|---------|
| Frequency hand (single fingers for `z b g d h`, the next easiest pairs for the next letters) | Faster to play, but loses the count logic and must be learned as a table |
| One form everywhere: the piano layout | Raised in the air it gave `l`, `v`, `y` and `x` hard shapes, made `d` a lone middle finger and `a` a lone ring finger. Pressed into a palm, the receiver had to tell which single fingertip landed, which touch does poorly at speed |
| One form everywhere: whole runs on piano | About 2.7 notes per consonant; a quarter of consonants become four- or five-note clusters, and a listener can't tell four notes from five. `e` in the bass is a cluster around D♯3 |
| Separate shapes for `b y th x` (hooked index, crossed fingers, thumb–index circle, thumb + index + pinky) | Four unrelated shapes, and two failed by touch: crossed fingertips land like `d`, and the circle's pinch lands where the index would, so `th` felt like `v`. The plain-finger fixes made `th` / `g` and `x` / `l` differ only by which end of the hand the dots sit at |

**Piano.** Two keys a step apart sound harsh together, and on the black keys neighboring fingers are always a step apart, so no piano form presses two neighboring fingers; `v` is `z` + hook for that reason. The right thumb sits on F♯, the tonic of the black-key pentatonic: `z` is about 30% of onsets and the codas `-l` and `-n` about 75% of codas, so the thumb's key is about a third of all notes. The left hand starts on D♯, the only start where no beat sounds a second or a ninth. Tried by ear and rejected:

| Alternative | Why not |
|-------------|---------|
| Hooked runs as the run's end plus the next finger up, `v` as thumb + index, `x` as 2 + 4 | Three of the four neighbor pairs are whole steps |
| The same pairs with the upper key flicked | The step is still harsh, even briefly |
| Each beat's notes played one after another | Striking together sounds better |
| Consonants in the left hand, vowels in the right | Can be clash-free (consonants from G♯, vowels from A♯), but consonants on top sound clearer |
| Vowels from F♯ | Puts `e a u` on the tonic chord, but the hook mark then sits a step above `u` |

**Guitar.** The finger shapes don't carry over: a pentatonic scale puts two notes on each string, so some pairs would need one string to sound two notes. Open G keeps every consonant shape inside a G major chord. Standard tuning was tried first (consonants on open D G B E, vowels G2 A2 B2 D3): its open D and E are a ninth apart, it clashed on `r`, `n` and `x` and on many vowel pairs, and no four fretted bass vowels avoid a step with the treble strings. The vowels are E2 G2 B2 D3 in pitch order, not the piano's intervals (0 / 3 / 5 / 7, which would make `e` A2): no set at those intervals avoids a second or a ninth against the open G, B and D strings, and A2 sounds a ninth under every consonant on B. The guitar keeps the vowels' order; the piano is the pitch reference.

### Vowel pitch and the voice

[Vowel pitch](../grammar/phonology.md#vowel-pitch) gives each vowel a fixed pitch as backup to its sound. Once vowels own pitch, any other use of pitch competes with them, so each dial of the voice has one job: **pitch** carries vowel pitch and the `?` mark (a raised word); **loudness** carries word stress, the words never said quietly, `!` and `;`; **time** carries equal beats, held endings, rests at sentence edges, and `&`. The finger code already splits the work this way: beats and rests carry the edges, and a stronger beat carries stress.

**Sentence edges are rests.** Almost every edge is already a word the listener hears, so only the period (a rest) and a scope island (a break before and after) keep a voice cue, and that cue is time.

| Alternative | Why not |
|-------------|---------|
| Edges as register shifts (tone-language style: a period lowers the whole range, a turn resets it) | English-speaking learners would produce them as contours, a fall on the last syllable, which bends that syllable's vowel pitch. Pitch edges vanish in song and in the finger code; rests survive both. Every edge but two is already a word |
| A level pitch on list items before the join | A second word with the same role letter already says a list is under way |

**Stress is loudness.** Pitch belongs to the vowels and length to the beats: equal syllables are what make a rest countable. Rejected: stress by a pitch peak or a longer vowel (the English pattern), which would bend a stressed low `a` toward a higher vowel.

**Syllabic `l` has a fixed pitch** (+4 semitones, between `o` and `e`). Rejected: copying a neighbor's pitch. In `blral` the beat after it is the number marker's vowel; copying that pitch would blur the `l` into a long vowel and hide the extra beat that tells `blral` from `bral`.

**Rising stacks are not question-like.** A yes/no question is spelled with `yol`, and `?` raises a whole word's range; no contour means *question*, so a rising `ae` or `oe` is never heard as one.

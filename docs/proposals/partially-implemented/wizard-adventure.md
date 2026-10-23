# Wizard text adventure

Status: milestone 1 (the sandbox) implemented; milestones 2–4 proposed. Not design authority; fold into grammar / meta docs, then drop. A solo browser game for learning Agebon vocabulary and grammar. No LLM: the parser, a hand-written rule engine, and authored dialogue do all the work.

## Problem

Learners read the grammar pages and practice in checkpoints, but nothing makes them *use* Agebon for a reason of their own. A game where Agebon is the only way to act, ask and answer gives that reason. Each correct sentence changes something in the world, and each wrong one gets an immediate, specific answer.

## Proposal

The player is a wizard, but most of play is mundane: picking things up, asking a guard where a book is, telling a dog to sit, answering a teacher's question. Every action is one Agebon sentence typed at a prompt, using the same clause grammar the grammar pages teach. **Spells are a thin layer on top**: the same grammar with a small set of extra verbs (make, unmake, grow, …) for what hands cannot do. There is no separate magic register to learn; magic is a reward for speaking well, not a second language.

**Agebon in, Agebon out where the player can read it.** The player types only Agebon, and characters speak only Agebon. Narration shifts from English to Agebon one line at a time as the player's grammar grows ([narration](#narration)). The engine never parses English or mixed English–Agebon text, which keeps it to one input language; English is only ever output, and no sentence mixes the two.

The engine both **reads and writes Agebon**. It parses what the player types, and characters speak back in Agebon built from world state. Every Agebon line the game writes is parser-checked before it is shown, as doc examples are at build time.

### Learning principles

**Input before output.**

- Characters speak constantly, pitched just above the player's level: unlocked roots and grammar, plus at most one new root per scene, always tappable.
- Any Agebon word in the game can be tapped for its gloss, and any line for its free English, at no cost. Lookups are tracked as a not-yet-known signal for repetition (below).

**Make the language necessary.**

- **Information gaps.** What the player needs is in a character's head (where the book is, what the guard wants), and a well-formed question is the only way to get it. Two characters may each hold half.
- **Task-essential forms.** Each area is built so its target grammar is required, not merely useful. With two dogs and two cats in the scene, role letters decide who chases whom, and the wrong letter has a visible result.
- **Pushed output.** A character who cannot tell which thing is meant says so, and the player rephrases more precisely.

**Feedback that keeps the player playing.**

- **Recasts, not error screens.** For a near-miss, a character answers the likely meaning and models the correct form (*ah, you mean …?*), [chosen in layers](#recasts). The full parser error card sits behind a toggle.
- **No penalty for language errors.** A wrong sentence costs nothing; danger comes from the story, never from grammar.
- **Three failures, always distinct** ([turns](#turns)): the sentence did not parse, it parsed but the game cannot do it yet, or a character did not understand.

**Recycling.**

- **Built-in spaced repetition** with FSRS (the scheduler modern Anki uses, through `ts-fsrs`). Items are roots and constructions; scene objects, character lines and errands are chosen to bring back what is due. Vocabulary is never local to one area.
- **Graded from play, not quizzes:** used correctly with no lookup is *good*, needed a recast is *hard*, tapped for a gloss is *again*.
- **Item keys** are the stable note ids [`flashcards.ts`](../../../src/flashcards.ts) already generates for roots, and construction ids for grammar, so game state and the Anki deck can sync later. Checkpoints are static pages with no learner state, so there is nothing to share with yet. State lives in browser storage, with export and import.
- **Chunks first.** Greetings, thanks, apologies and turn-taking ([speech moves](../../grammar/speech-moves.md)) arrive as fixed social moves before the grammar behind them is taught. This also carries the gratitude theme.

**Fading scaffolds.** Typing support starts with a word bank and sentence frames, moves to autocomplete from the spellbook, and ends with free typing. Like the English helper, it never writes the whole sentence.

**Transfer out of the game.**

- A **journal** keeps the player's own sentences, each with its gloss and a link to the grammar section behind it. The game may link into the grammar; grammar pages never link to the game ([placement](#placement)).
- Areas follow the [cross-doc path](../../meta/learning-levels.md#cross-doc-path). Each area can close with an in-world challenge covering the same ground as its [level review](../../grammar/review.md).
- The psychological themes appear in ordinary exchanges, not only in special puzzles: characters mark how they know things (seen vs. heard), and the player weighs it; gratitude and consent come up in everyday dealings.

### World structure

The world mixes three layers:

| Layer | Approach | Why |
|-------|----------|-----|
| Objects and actions | Open and systemic | Any root can be conjured and behaves sensibly ([objects from root tails](#objects-from-root-tails)). Experiment teaches, and players find unplanned solutions |
| Places, characters, main dialogue | Closed and authored | Pitching a scene just above the player's level needs curation, and characters the player cares about give a reason to talk |
| Errands and encounters | Generated from templates | Practice volume. Errands are filled with the roots and constructions due for review, so repetition becomes gameplay |

A fully closed world runs out of practice and recycles badly; a fully generative one has no learning order and nothing to care about. Generation is the filler between authored scenes.

### Plot: a hub with a light main thread

- **The first area is a school of wizardry**, in two wings with a main quest each. Its vocabulary is not chosen but read from the `core` column, and that set already reads as a school (school, book, bell, eraser, magnify, chair, guard, eye, speech, money, think, run, …).
  - **First wing** (cross-doc path through [dependents](../../grammar/dependents.md#beginner)): the player acts by **calling and commanding** things, creatures and people ([call](../../grammar/speech-moves.md#vocative), [speech act](../../grammar/speech-moves.md#speech-act-beginner)), and asks yes/no questions. Characters talk about each other by name. The wizard ordering a door to open is where the game feels most like magic. Commands before *I* and *you* matches the path, where pronouns come later; that order is intended.
  - **Second wing** (through [pronouns](../../grammar/pronouns.md) and [plurality](../../grammar/plurality.md)): *I* and *you* arrive with [special pronouns](../../grammar/pronouns.md#special-pronouns), and real conversation opens up, along with groups and counting. Their checkpoints add a few food roots (cookie, sandwich, drink, basket) that suit a school canteen and lead into the village.
- **A village hub** opens after the school, once food roots arrive with [joins](../../grammar/joins.md#beginner) and [numbers](../../grammar/numbers.md#beginner). Its recurring characters' relationships with the player change, and they recycle vocabulary naturally: the baker always talks about bread, prices and thanks.
- **One main quest per area.** Areas open in grammar-stage order, so the main thread enforces the learning path without a fixed linear story.
- **Free exploration within an area**, with optional quests (often generated errands) for review and extra practice.
- **Optional content is never required.** The main path assumes only what the main path taught.

### Companions {#companions}

A relationship subsystem, borrowed from dating and friendship sims, for the village's recurring characters. A few characters can become companions (a friendship, a partnership, or a romance, whichever the player and the character choose). It opens with [sakes](../../grammar/prescription.md), when feelings, thanks and consent can be said.

**Attunement, not winning someone over.** The usual genre loop (find the right line to unlock affection) would turn characters into puzzles to beat, which goes against the language's purpose. Here a relationship deepens when the player understands the character and is honest with them:

| Player move | Grammar | Effect |
|-------------|---------|--------|
| Asks what the character feels or wants, instead of assuming | [Fill questions](../../grammar/polar-inventory.md), [whose stake](../../grammar/prescription.md#whose-stake) | Opens what the character is holding back, an information gap about a person |
| Says how they know something about the character (*I saw* vs. *I heard*) | [Evidentiality](../../grammar/knowing.md#evidentiality) | Rumor stated as fact cools the character; marked hearsay invites a correction |
| Asks before acting on or for the character | [Permission](../../grammar/feelings-permission.md#permission), [consent](../../grammar/feelings-permission.md#consent) | The next step happens only with consent; a *no* is final for that scene and costs the player nothing if it is accepted |
| Thanks or apologizes specifically | [Thanks and sorry](../../grammar/feelings-permission.md#thanks-sorry) | Specific thanks for a named act counts; a bare greeting chunk does not |
| Names a feeling with its object | [Emotion compose](../../grammar/feelings-permission.md#emotion-compose) | Characters answer in kind, which is input for the same forms |

- **Characters have their own sakes and limits** drawn from the [sake inventory](../../grammar/sakes.md#sake-inventory). What a character wants is authored; what they reveal depends on being asked well.
- **Relationship state is not a score the player sees.** Characters show it in what they say and do: what they share, whether they seek the player out, how they speak to them.
- **Pressure never works.** Repeating a request after a *no*, or a command where a request was needed, has no effect except the character saying so. No dialogue path rewards pushing past a refusal.
- **Endings are mutual.** A character may prefer friendship to romance, or may not want to become closer at all, and the game treats that as a complete outcome rather than a failure.
- **Errands come from companions.** A companion's needs make generated errands personal (the baker's sister is ill; ask what would help), so practice and story share content.

### Mysteries {#mysteries}

A detective subsystem for the language's bias-awareness theme: the player works out what happened from what witnesses say, and the skill is knowing how each witness knows. It opens with [evidentiality](../../grammar/knowing.md#evidentiality), and causal accusations wait for [causation](../../grammar/iff-fault.md).

- **Witnesses mark their source.** Every claim carries how the witness knows it ([evidentiality](../../grammar/knowing.md#evidentiality), [evidence strength](../../grammar/knowing.md#evidence-strength), [second-hand and further](../../grammar/knowing.md#hand-depth)). A confident witness who only heard it is the classic trap.
- **Interviews are information gaps.** The player asks [who, where, when and why](../../grammar/polar-inventory.md), and can ask a witness for their [source](../../grammar/knowing.md#source). Two witnesses may each hold half of a fact.
- **Biased witnesses.** Some witnesses have a stake in the outcome (their [sakes](../../grammar/prescription.md#whose-stake)), and the case gives the player a way to find that out. Learning that a witness has a reason to blame someone, without assuming they are lying, is the lesson.
- **Accusations are sentences.** To close a case the player states what caused what, with [*because*](../../grammar/iff-fault.md#only-because) and [fault](../../grammar/iff-fault.md#fault), and marks how they know it. The engine checks the claim against the case's hidden facts. A true claim stated with too much certainty from weak evidence is accepted, but a character points out the overreach.
- **Wrong accusations cost story, not grammar.** An accused innocent is hurt and says so, and the case continues; the player apologizes and keeps going. This keeps the [no penalty for language errors](#learning-principles) rule: the cost is for a wrong judgment, not a wrong sentence.
- **Generated cases.** A case is a small hidden event graph (who did what, who saw, heard or inferred which part), and witnesses' lines come from it through the same generator as narration. Authored cases carry the main thread; generated ones are errands that review what is due.
- **The journal holds the evidence**, each claim with its witness and source marking, so the player reasons from a record rather than memory.

### Turns {#turns}

Each line the player types goes through three steps:

1. **Parse.** [`src/parse/browser.ts`](../../../src/parse/browser.ts) already runs the parser in the browser (the Inspect page uses it). A sentence that does not parse gets a [recast](#recasts) when a near form exists, and otherwise a short in-world sign of confusion; the parser's error card is one tap away.
2. **Resolve.** The engine walks the tree. Role letters give it exact slots (who acts, what is acted on, the action, properties), so there is no English-style guessing about the command. Each noun is matched to an object in the scene ([reference](#reference)). A sentence addressed to a character goes to that character's dialogue instead.
3. **Apply.** The verb's handler changes the world state, or the character answers. The game prints what happened, plus the morph gloss of the player's sentence, so the player sees what they actually said.

A sentence that parses but has no handler gets its own message, in the game's voice (*the words are true, but beyond your power yet*). A character who cannot act on a grammatical sentence says so in character. Players must never take a grammatical sentence for a wrong one, so the three failures always look different.

### Recasts {#recasts}

Two layers pick the likely meaning of a near-miss:

1. **An error table** of patterns from a slip to a candidate fix, keyed by the parser's error kind. The turn log fills it over time; the seed comes from the docs and the orthography:

   | Source | Slips |
   |--------|-------|
   | The docs' own *`X`, not `Y`* contrasts and **Compare with** notes, extracted by script | e.g. `/b/` vs `/d/` after a *for* hook |
   | [Orthography](../../grammar/phonology.md) | `t` for `th`, capitals, a hyphen after the PoS letter |
   | Typed morph gloss (`z-dog v-chase`) | Run through gloss-inverse and recast as Agebon; players will type glosses because the game shows one every turn |
   | Endings | `-l` / `-m` / `-n` swapped |
   | Role letters | Missing, or `/b/` vs `/d/` confused |
2. **Token edit distance**, limited to the player's unlocked roots and constructions. A candidate counts only if it parses to one tree and its nouns resolve to something in the scene.

One surviving candidate: the character recasts it. Two or more: the character asks which was meant, which is pushed output for free. None: in-world confusion.

### Narration {#narration}

Narration comes from the same structured world events the systemic world and characters' reports already need, so it goes through the same generator and gating as character speech. Each narration line has an English version and an Agebon gloss, and the game shows the Agebon **whenever every construction and root in it is unlocked**, otherwise the English, with the other version one tap away. Narration drifts into Agebon line by line, with no switch point to choose, and re-gates with the docs like everything else.

| When | Agebon narration |
|------|------------------|
| From [clause Beginner](../../grammar/clause.md#beginner) | Events (*the guard sits*, *the bell rings*, *the dog sees the cat*) and descriptions (*the book is red*) |
| Before location can be said | Scene contents as an emoji-and-citation-noun list, not sentences; *on the table* waits for [hooks](../../grammar/hooks.md#beginner) |
| As grammar arrives | Location, groups, *because* and *then* chaining, what characters believe |
| Last | Authored story beats, which need an author-written gloss and stay English until then |

By the end of the Beginner band nearly every generated line passes the gate, so the switch completes on its own. A setting, unlocked at the end of Beginner, forces all-Agebon (or all-English) narration for players who want it. Agebon and English lines are styled distinctly so the mix reads clearly. Early Agebon narration is plain and repetitive (*the X does Y*); for a beginner that is comprehensible input, not a flaw.

### Objects from root tails {#objects-from-root-tails}

Every published root records a `kind`, `shape` and `size` ([root tails](../../meta/lexicon.md#root-tails)), and its spelling encodes them. The engine reads the columns (not the spelling, since size is only a placement preference) and gives every object default behavior:

| Column | Values | Game default |
|--------|--------|--------------|
| `kind` | creature, person, food, tool, nature, place, body, … (letter map in [`src/root-tails.ts`](../../../src/root-tails.ts)) | Creatures move and react, people talk, food is eaten, tools are wielded, nature things burn, flow or grow, places are entered |
| `shape` | `holds`, `one`, `order`, `takes-away` | Containers hold things; `takes-away` things cut, hide or harm; `order` things lead somewhere (paths, ladders, stages) |
| `size` | `small`, `medium`, `big`, `none` | Small things are carried, big things block a way, `none` is a substance or an act with no body |

So any of the roughly 1,150 non-`named` roots can appear in the world with sensible behavior. A small **override table** inside the game adds the interactions that make play fun (fire burns wood, water puts out fire, a dog chases a cat) and fixes the few rows whose category is right for spelling but odd in play. The lexicon is never edited for the game's sake.

The tails also give a learning payoff: a player who knows the tail letters can guess what an unfamiliar word will do before using it.

### Verbs

A verb is a root used as a verb, so a handler belongs to a root. Verbs are the real design work: the first set needs about 20 handlers, and the full game perhaps 60. A verb with no handler gives the *beyond your power* message, never silence.

The first 20 meet three rules: the root is a first-area core root (or a spell verb), the result is visible in the world, and together they cover one-, two- and three-party sentences. A draft from the lexicon:

| Group | Handlers (root in parentheses where it differs) |
|-------|-----------------------------------|
| Everyday | see (eye), find (magnify), sit (chair), tell (speech), pay (money), carry (luggage), go (footprints), open (door), run, walk, write, peek, sleep, eat (cutlery), drink, pour |
| Spells | grow (seedling), burn (the fire root), make / unmake |
| Three-party | give, built as in the give / get recipe in [`say-people-places.md`](../../grammar/say-people-places.md#give-get) |

Give and buy have no root of their own; the first handlers still cover giving, because handing things over is central to mundane play. The turn log picks the handlers after these.

### Grammar in play

Each grammar feature has an everyday use and, where it fits, a spell use. Areas follow the [cross-doc path](../../meta/learning-levels.md#cross-doc-path), so an area never needs grammar the player has not reached.

| Grammar | Everyday use | Spell use |
|---------|--------------|-----------|
| Role letters ([clause](../../grammar/clause.md)) | Who does what to whom. Changing one letter changes the act; reordering words with the same letters changes nothing. Puzzles test both | |
| Adjectives | Describing and choosing things (*the red cup*) | Enchant: give an object a property |
| [Questions](../../grammar/questions.md) | Asking characters for what they know; answering their questions | Divination: questions the world itself answers truthfully |
| [Plurality](../../grammar/plurality.md) | Counting, buying several, addressing a group | Spells on a whole group at once |
| [Comparatives](../../grammar/comparatives.md) | Haggling, choosing the bigger or cheaper one | Scaling: make something bigger than the door |
| Negation | Refusing, correcting a character | Dispel and unmake |
| [Causation](../../grammar/causation.md) and conditions | Bargains and promises (*if you bring water, I'll …*) | Traps and triggers that fire when something happens |
| [Habitual](../../grammar/restrictors.md) | Characters' routines, asked about and relied on | Lasting enchantments that run every turn |
| [Knowing](../../grammar/knowing.md) | Weighing what a character saw vs. heard | Illusions; exposing a mistaken belief |

### Reference {#reference}

The engine must decide *which* dog a noun means. Start simple: the only visible one, or else the game asks. Later areas use the grammar's own tools for this ([pronouns](../../grammar/pronouns.md), [restrictors](../../grammar/restrictors.md)), and [`src/parse/resolve.ts`](../../../src/parse/resolve.ts) already tracks topics across sentences.

### Spellbook

The spellbook is the vocabulary list and, from the first area on, the progression (the sandbox opens every page). Words are learned mostly by hearing them in use; scrolls and characters' teaching unlock roots (in `core` order, [core vocabulary](../../meta/lexicon.md#core-vocabulary-column)) or a grammar feature. Each root's page shows its emoji, concrete and abstract senses, and mnemonic from [`lexicon-published.csv`](../../../data/lexicon-published.csv), plus the player's own repetition history. Inscriptions and overheard speech may carry the scene's one new root, so the player can guess its meaning from context before it is confirmed.

A long construction the player has used correctly once (a trap, a lasting enchantment) becomes a **mastered spell** they can recall by name. Advanced grammar is rewarded without forcing the player to type it out every time.

### Abstract senses and the language's themes

Abstract senses live mostly in conversation, used as naturally as in the grammar's examples. To give them weight, characters carry a little inner state (trust, mood): abstract words in the player's speech move it, and characters answer differently because of it. Only a handful become spells (*loyalty* makes a creature follow you).

Some puzzles should be solved through the psychological distinctions the language encodes, not by force: calming a hostile creature with gratitude rather than fire, or freeing a character by showing them that a belief has no evidence. This makes it an Agebon game, not just a wizard game written in Agebon.

### No impossible quests {#no-impossible-quests}

Impossible quests come from **dead ends**: the player burns the only key or drives off the only character who knows the password. A systemic world allows that whatever engine runs it, so three defenses reinforce each other:

1. **No dead ends, enforced by the engine.** Quest-critical objects and characters are tagged and cannot be lost for good: a burned key turns up in the ashes, a scared character comes back. Experiment must never be punished in a language game.
2. **Walkthrough tests in `npm test`.** Every quest has a script of Agebon sentences that must reach its goal. These double as the sandbox's finish line ([sandbox](#sandbox)).
3. **Reachability check.** Each quest's preconditions and effects are data, and a search confirms the goal is reachable from the start and from every reachable state. It searches the quest's abstract state, not the whole world, so it needs no planner library.

The first and third do most of the work; the walkthroughs catch drift between the engine's real behavior and the quest data.

### Derived from the docs {#derived-from-the-docs}

The grammar docs and lexicon stay the only source for what the game teaches. When they change, the game re-orders, re-gates and re-spells itself; the build fails loudly where a person must step in. Most of the inputs exist already:

| Game need | Source |
|-----------|--------|
| Area order | [`learning-order.ts`](../../../src/lint/learning-order.ts): global section order from the sidebar and stage headings |
| Grammar a sentence uses | The construction registry ([`constructions.ts`](../../../src/parse/constructions.ts)) maps every parser production to the section that teaches it |
| When each root is introduced | The `core` column ([core vocabulary](../../meta/lexicon.md#core-vocabulary-column), [`core-vocabulary.ts`](../../../src/core-vocabulary.ts)) |
| Object defaults | The `kind` / `shape` / `size` tail columns |
| Sentences with English | The doc example index ([`llm-examples.ts`](../../../src/parse/llm-examples.ts)) |
| Spelling from meaning | Gloss → Agebon round trip ([`gloss-inverse.ts`](../../../src/parse/gloss-inverse.ts), [glosses](../../meta/glosses.md#round-trip)) |
| Glosses and word pages | [`morph-gloss.ts`](../../../src/parse/morph-gloss.ts) and the lexicon CSVs |

How the game uses them:

1. **Gating from the docs.** The player's progress is a position on the cross-doc path plus the core roots reached. Every Agebon line shown (authored, generated, or an inscription) is parsed first; each construction's anchor must be at or before the player's position, and each root unlocked (bar the scene's one new root). When a section moves stage, dialogue and errands re-gate with it.
2. **Authored content in morph gloss.** Characters' Ink lines are written as glosses (`z-dog v-chase b-cat`), never spelled Agebon, and gloss-inverse spells them at build time. A root respelling reaches the game with no retie pass.
3. **Quests name grammar by construction id.** A quest declares the sections it needs (for example a fill question), and its area is computed from them. If the docs restage a section, the quest moves with it, or the build fails when that breaks the quest order.
4. **Doc examples as a sentence pool.** Inscriptions, overheard speech and errand requests come from doc examples with one root swapped, then re-parsed and re-glossed to confirm. New doc examples become new game lines. Some `kind` values are mixed (`counting` holds dash, walk, coin, bell and guitar), so a swap must pass four rules:
   - both roots are in a physical `kind` (creature, food, tool, nature, place, body), the same one, with the same `size`; `mind`, `doing`, `counting`, `title` and `sign` roots are never swapped;
   - neither root has its own `english_by_pos` reading (eye → see, cutlery → eat, chair → sit), since swapping one changes the verb;
   - the new root is accepted by every handler the sentence's verb uses (a mango can stand in for bread under *eat*, a hammer cannot);
   - the sentence has no house cast or `named` roots.

   A deny list starts empty and takes only the pairs the sandbox turn log surfaces.
5. **A content lint**, reusing the existing checks: taught-before-used from [`construction-order.ts`](../../../src/lint/construction-order.ts) with the area's position as the cutoff, the parse and lexicon-root checks of `lint-agebon-docs`, the gloss round trip, and the one-tree rule ([`ambiguity.ts`](../../../src/parse/ambiguity.ts)). It runs in **`npm run build`**, since the game ships with the site and a doc edit that breaks the game should fail the same build. Walkthroughs and the reachability search run in **`npm test`**.

What stays hand-made:

- **Story, characters and puzzle design.** The docs say what forms mean, not what makes a good quest.
- **What verbs do in the world.** A handler is game code. When the docs change what a construction *means*, not just how it is spelled, the walkthroughs catch the break. Once the game ships, the rule that parser changes ship with grammar changes extends to game handlers.
- **Removed or renamed construction ids.** The build fails and a person fixes the content.
- **The sentence generator.** Building new sentences beyond the example pool is a second implementation of the grammar that can drift. Keep it small: it produces glosses, every result goes through gloss-inverse and the parser, so it can never show an unparsed line (only an odd one).

The generator's first shapes are the ones the school needs, each a gloss template gated like any other line: a yes/no answer, a fill answer (one-word fragment and full clause), describing an object, reporting an action (who did what to whom), and the greeting and thanks chunks. Early areas prefer fragment answers. The turn log picks the shapes after these.

| Content | Follows the docs |
|---------|------------------|
| Stage order, gating, vocabulary order, spellings, glosses, object defaults, word pages | Fully automatic |
| Authored dialogue and quests | Re-spelled and re-gated automatically, build-checked; meaning changes need a person |
| Generated sentences | Checked automatically; shapes maintained by hand |
| Story and verb handlers | Hand-made, guarded by walkthroughs |

### Sandbox {#sandbox}

The first phase is an open sandbox, built to refine the engine before any content depends on it. It is a **test bench for the designer and fluent testers, not a learner's first experience**: with every root and grammar feature open, it is the opposite of input pitched at the player's level. Learners start in the first area; the sandbox becomes free play once they have the language to use it.

One open scene with one or two characters to talk to and a few seeded objects. Every non-`named` root and every grammar feature the parser accepts is available. It tests the engine's general rules against what people actually type, while those rules are still cheap to change:

- **Tail defaults.** Do the `kind` / `shape` / `size` defaults give sensible behavior, and which rows need an override?
- **Verb handlers.** Which verbs do players reach for first, and which handlers interact badly?
- **Generation.** Do characters' answers and Agebon narration read as correct, natural Agebon?
- **Recasts.** Does the near-miss guess match what the player meant?
- **Reference.** How often is a noun ambiguous in a crowded scene, and does *the only visible one, or else ask* hold up?
- **Failures.** Are the three failure kinds ever confused, and does the printed gloss help?

The sandbox keeps a **turn log** the player can export: each line typed, its parse, and what happened. The log picks the next handlers, overrides, error-table rows and generator shapes. It stays in the browser; nothing is sent anywhere.

**Finish line.** Before building it, write the school's scenarios as walkthrough scripts: first wing (call the guard and order the door open, ask whether the book is red), second wing (ask the guard where the book is, find it with the magnifier, give it to the teacher). Phase 1 is done when those scripts play well in the sandbox.

### Placement {#placement}

The game lives on the grammar site, as an entry in the **Tools** sidebar group of [`config.ts`](../../grammar/.vitepress/config.ts) beside Lexicon and Inspect, at its own route. It stays out of the top nav until it ships.

Once it ships, it is linked from the Tools sidebar and from one line on [How to learn](../../grammar/introduction.md#how-to-learn), the same exception the terminology page has. Stage pages and level reviews never link to it, as with the recipe track. While it is a proposal, nothing links to it ([proposals](../../meta/proposals.md)).

### Milestone 1 as built {#milestone-1}

The engine is in [`src/game/`](../../../src/game/), the page is [`wizard.md`](../../grammar/wizard.md) (off the sidebar and site search), and the editor note is [wizard-game.md](../../meta/wizard-game.md). Where the build departs from the plan above, or found something:

- **The first-wing finish line needs a later stage.** *Ask whether the book is red* resumes *the book* with **-r** ([resume](../../grammar/pronouns.md#resume-r)), and the **-l** alternative (*is there a red book?*) needs [existence](../../grammar/predication.md#existence); both come after the calls-and-commands stretch of the path. The quest declares the resume, so its computed area is Pronouns Beginner. A first-wing yes/no question has to ask about an act, not a property.
- **The error table's doc seed is the Fix it drills**, not the **Compare with** notes: a drill pairs a wrong form with its fix and the reason, while a Compare-with note contrasts two right forms. 20 of the 49 drills reduce to a row (role letter, ending, whole word, turn word to the front); the rest are structural.
- **Make and unmake** are `construct` 👷 and `eraser` 🪌, both core roots of the school.
- **No Ink yet.** The fixed lines (*yes*, *no*, *sure*, *huh?*, *thank you*) are glosses spelled at build time; generated lines are spelled in the browser with an index that grows one root at a time. A name in an authored gloss is a `{concrete}` slot (`y-{guard}`), so it follows a respelling.
- **A resume binds to a same-stem verb in its sentence.** `yel vohol dohor` resumes the opening, not the door ([resume](../../grammar/pronouns.md#resume-r): the most recent word with that stem), so the scripts say `dohol`, and the generator falls back to **-l** when a **-r** would bind to the verb.
- **No verb puts a thing down.** Among the first handlers, things leave your hands only by giving; the quest models have no *drop* action, and a person can always be asked to give a thing back.
- **The player's position** is a section on the learning order. The sandbox opens everything, and a tester can pretend to have reached any checkpoint to watch narration and speech gate.

## Inspiration

| Game | What to borrow |
|------|----------------|
| *Enchanter*, *Sorcerer*, *Spellbreaker* (Infocom) | Spellbook and scrolls as progression; puzzles that need a known spell used in an odd way |
| *Suveh Nux* (David Fisher) | Magic as a small invented language learned by experiment, then combined into longer spells |
| *Hadean Lands* (Andrew Plotkin) | Rituals performed once can be recalled by name: the mastered-spell idea |
| *Counterfeit Monkey* (Emily Short) | Words and objects tied together; deep puzzles from a few word operations |
| *Ad Verbum* (Nick Montfort) | Rooms that each limit or demand one kind of sentence |
| *Heaven's Vault*, *Chants of Sennaar*, *Sethian* | Working out a language from context; Sethian's typed queries match divination |
| *Scribblenauts* | Any noun appears with sensible behavior: the model for tail defaults |
| Lucasfilm adventures (*Monkey Island*) | No dead ends: the player can always still win |

## Technology

A TypeScript web app, deployed with the site and importing the parser directly. Lexicon CSVs are read at build time. Text plus emoji is enough; a tile view can come later. Unity or Godot would mean porting the parser or embedding a JS runtime, which costs effort and gives a text game nothing.

**No full interactive-fiction engine.** Inform 7, TADS 3 and Dialog are battle-tested, but their most tested part is the English command parser, which this game replaces. Their games compile to virtual machines (Glulx, T3) run by a browser interpreter, so passing parse trees in and world state out for Agebon generation crosses a fragile boundary; their objects are fixed at compile time, which fights conjuring any root; their text output assumes English; and repetition tracking, recasts and the turn log would be bolted on from outside. Their **world models** (containment, scope, light, doors, carrying) are still the reference design: read Inform's Standard Rules for edge cases, do not run them.

**[Ink](https://github.com/inkle/ink) for the authored layer.** Ink (inkle; used in *80 Days*, *Heaven's Vault*, *Sable*) handles dialogue, quest flow and narration. `inkjs` runs it in the browser, and scripts compile to JSON driven from TypeScript through variables and external functions. The split:

| Part | Owner |
|------|-------|
| Parser, world model, tail defaults, verb handlers, reference, recasts, Agebon generation, repetition tracking, gating | Custom TypeScript |
| Authored scenes, characters, main quests, story beats | Ink, with all Agebon (speech and narration glosses) written as morph gloss |
| Spelling, stage checks, walkthroughs | Build step and lint ([derived from the docs](#derived-from-the-docs)) |

New dependencies: Ink and `ts-fsrs`. Both are mature and narrow in scope.

## Scope

| Milestone | Contents |
|-----------|----------|
| 1. Sandbox | One open scene with one or two characters; the first 20 handlers; objects from tails plus the override table; simple reference; generator with its first shapes, for speech and narration; recasts with the seeded error table; the three distinct failures; morph gloss on every turn; exportable turn log; no-dead-ends tagging and the reachability check; gating from the construction registry and `core` column; content lint. Done when the school's walkthrough scripts play well |
| 2. School of wizardry | Two wings with a main quest each; authored characters in Ink; per-line Agebon narration; fading scaffolds; spellbook and journal; Tools sidebar entry; grammar through the pronouns and plurality Beginner checkpoints |
| 3. Village hub, errands and repetition | Hub with recurring characters; generated errands and encounters driven by FSRS; optional quests |
| 4. Later areas | One per grammar stage along the cross-doc path: groups, comparatives, conditions, habitual, knowing; mastered spells |

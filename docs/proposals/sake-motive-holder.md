# Proposal: whose motive, whose stake (sakes)

Status: PROPOSED. Not design authority. Raised by the free English review (`llm-gloss-prompt.md`, phase 1 step 5, wave 1). Once the editor approves, fold it into [sakes.md](../grammar/sakes.md), [design-decisions.md](../meta/design-decisions.md), and the [why-allowed cheat sheet](../grammar/cheat-sheets/why-allowed.md), then drop this file. [Step 3](#first-person) also touches [pronouns.md](../grammar/pronouns.md) and the house-cast rules in `docs/meta/`.

## Problem

Agazan deliberately makes it hard to state someone else's motive. Their reasons are in their mind, and another person's view goes through a [holder](../grammar/knowing.md#holder), which says how you know. The grammar already says this for sakes, but in two other places:

- [knowing.md § whose view](../grammar/knowing.md#holder): with a holder, sake words and emotion compose are the holder's stake and feeling.
- [design-decisions.md § experiencer adjectives](../meta/design-decisions.md): there is no adjective for someone else's feeling, because it would bypass the holder warrant.

[sakes.md](../grammar/sakes.md) states the rule ([§ whose stake](../grammar/sakes.md#whose-stake): a sake word with no `/b/` is **your** sake, on every stance and placement). It never says why, and never says what follows for someone else's motive. Its examples teach the opposite reading:

- Clause sake words on a named person's act read as that person's own reason: *Azawan talks for relatedness*, *Alahen kneels for an immediate sense of purpose*. Thirteen examples and checkpoint lines do this (listed [below](#example-rewrites)).
- Pick one item 85 (`zazawan venehal thanathom.`) has the note *(why Azawan is doing it)*. That states Azawan's motive outright.
- [sakes.md § prescription](../grammar/sakes.md#sake-force) says `the` is "advice about the sake named on this word". That is vague about whose stake, and the advice examples (*Ahaben ought to sing, to serve the physical sake*) read as the advisee's.
- The Claritish lesson `claritish/oughts-and-motives.md` glosses `thoyuthem` as *that's worth doing for your health*, which is the listener's health, with no `/b/`.

A learner who follows the examples will read a motive word on someone else's act as that person's reason. The design means the opposite.

## Proposal

### 1. Say it on the page

**§ Whose stake**: add after the first paragraph.

> This holds on someone else's act too. `zazawan vezebel thanathom` is *Azawan talks for my sake*: what the talk serves is your stake, as you see it. It does not say why Azawan talks. Their reasons are in their mind, so you give them the way you give any view of theirs, through a [holder](knowing.md#holder) that says how you know: `zazawan vezebel thanathom thunemazawan` is *I gather Azawan talks to feel connected*. A `/b/` names whose stake the act serves, not whose reason it is.

**§ Motive**: add one sentence after the first example.

> The reason is yours, or a holder's when you name one. Agazan has no way to say a reason belongs to whoever is acting.

Then add the holder example from the paragraph above as a block (`z-Azawan | v-tell | th-relatedness-motive-any-term | th-CLUES-Azawan`).

**§ Prescription, line 454**: replace the **Compare with** line.

> **Compare with:** to ask someone to act for **your** sake, make it a [request](speech-moves.md#speech-act) (`yem`) with motive `tho`. `the` is advice. When it is for the other person's good, name them in `/b/`; that names their stake, not their reason.

**design-decisions.md**: add a paragraph under § experiencer adjectives (or its own heading next to it).

> **No default reading of a motive as the actor's own.** A motive word on someone else's act stays your stake, as every sake word does. Reading it as the actor's reason would state what is in their mind without a warrant. Someone else's motive goes through a holder, as their feelings do.

### 2. Make the examples natural

Two changes cover most of them:

- **Name the owner in the English**: *my*, *their*, or the person's name. The speaker's stake is the default, so a learner should see *my* every time.
- **Use one everyday phrase per sake**, from the page's [Which sake?](../grammar/sakes.md#which-sake) table: *my confidence* (competence), *my enjoyment* (pleasure), *feeling connected* (relatedness), *my health* (physical), *a sense of purpose*, *my freedom to choose* (autonomy), *my understanding*, *a chance to help* (beneficence). Use the same phrase for the same sake everywhere on the page.

Then sort the examples by job:

| Job | Form |
|-----|------|
| Met or unmet on someone else's act | Keep the Agazan; the English says *my*. |
| Motive, the main teaching examples | Subject `zamun` ([step 3](#first-person)). Naming your own reason is the use the feature is for, and it needs no warrant. |
| Someone else's motive | A holder (new example in § Motive). |
| Prescription for someone else's good | Their name or a resume in `/b/`. This adds a `/b/` construction, which the diff guard lists for review. |

<a id="example-rewrites"></a>
**Example rewrites** (ids from `tmp/free-english-review/sakes.json`; line numbers as of wave 1):

| id | Line | Now | Proposed |
|----|------|-----|----------|
| 7 | 149 | `zazawan vezebel thulotham.` "Azawan talks, and that serves competence." | Same Agazan. "Azawan talks, and that boosts my confidence." |
| 14 | 251 | `zazawan vugugal thozothar.` *Azawan cooks, and that serves pleasure right now.* | Same Agazan. *Azawan cooks, and I enjoy it right now.* |
| 19 | 298 | `zazawan vezehel thulothum.` *Azawan sings, and that detracts from competence.* (modifiable) | Same Agazan. *Azawan sings, and that knocks my confidence.* (it can be repaired) |
| 23 | 329 | `zahaben vezehel thozotham.` *Ahaben sings, and that serves pleasure.* | Same Agazan. *Ahaben sings, and I enjoy it.* |
| 29 | 467 | `zazawan vezebel thanathem.` "Azawan ought to talk, to serve relatedness." (unasked advice) | `zazawan vezebel thanathem bazawar.` "Azawan ought to talk; it would help them feel connected." (unasked advice) |
| 30 | 473 | `zahaben vezehel thoyuthel.` "Ahaben ought to sing, to serve the physical sake." (Ahaben asked for advice) | `zahaben vezehel thoyuthel bahaber.` "Ahaben ought to sing; it's good for their health." (Ahaben asked for advice) |
| 31 | 479 | `zalahen vabayal thanather.` "Alahen ought to try bowing, to see whether it serves relatedness." | `zalahen vabayal thanather balaher.` "Alahen could try bowing, to see whether it helps them feel connected." |
| 33 | 498 | `zazawan vezebel thanathom.` "Azawan talks for relatedness." | `zamun vezebel thanathom.` "I talk to feel connected." Then the new holder example. |
| 35 | 568 | `zazawan vezebel thulothal thanathom.` "Azawan talks for relatedness, and it builds lasting competence too." | `zamun vezebel thulothal thanathom.` "I talk to feel connected, and it builds my confidence for the long run." |
| 73 | 992 | `zazawan vebevol thanathem.` *Azawan ought to pray to serve relatedness.* (unasked advice) | `zazawan vebevol thanathem bazawar.` *Azawan ought to pray; it would help them feel connected.* (unasked advice) |
| 74 | 1000 | `zalahen venehal thamethor.` *Alahen kneels for an immediate sense of purpose.* | `zamun venehal thamethor.` *I kneel for a quick sense of purpose.* |
| 85 | 1092 | `zazawan venehal thanathom.` *Azawan kneels for relatedness.* (why Azawan is doing it) | `zamun venehal thanathom.` *I kneel to feel connected.* The Pick one explanation compares `tho` and `the` with the `zamun` subject. |

The § whose stake examples already have a `/b/` and stay. Their English changes only if [open question 1](#open-questions) is answered (b).

**Follow-ups:**
- Word banks: the beginner and intermediate checkpoints gain or lose *I* / `amun` and person rows to match.
- [why-allowed.md](../grammar/cheat-sheets/why-allowed.md): rows 110 to 114 quote ids 7, 29, 33, and the § whose stake example.
- `claritish/oughts-and-motives.md`: *that's worth doing for your health* (`thoyuthem`) and the table's *how connected you two are* need to match whatever [open question 2](#open-questions) settles. Claritish adds no forms, so its readings must agree with sakes.md.
- Check the new forms: `node scripts/parse.mjs`, then `npm run regloss-docs` for the morph lines, `npm run build`, and the diff guard. All the candidate forms above parse today.

<a id="first-person"></a>
### 3. First person is the pronoun

Step 2 moves the motive examples to a first-person subject, so it needs a settled answer to "how does Agazan say *I*?" The grammar answers *your name*. [pronouns.md § special pronouns](../grammar/pronouns.md#special-pronouns) says to prefer a proper name "including for talking about yourself", with `zSELFn vowogal.` glossed "You name yourself rather than saying *I*." [§ me or you as the topic](../grammar/pronouns.md#topic-participants) repeats it. The house-cast rules in [grammar-docs.md](../meta/grammar-docs.md#house-cast), [translation-exercises.md](../meta/translation-exercises.md), [drill-generation.md](../meta/drill-generation.md), and [glosses.md](../meta/glosses.md) build on that preference.

No page says what naming yourself does for the speaker, and the preference costs the learner:

- **I and you don't match.** *I* is a name, but *you* is `ehon`, because an example cannot know the listener's name. In real talk you know both, so the rule does not hold even on its own terms.
- **Sentences mix the two.** The syntax corpus has `zSELFn … em bamun` (*I lost my blanket*): a name for *I*, the pronoun for *my*.
- **It models a habit speakers would not keep.** Saying your own name for *I* in conversation sounds childish or grandiose in most languages learners already speak. Examples should model what a speaker would actually say.
- **An extra step for the reader.** The reader sees their name in the Agazan and *I* in the English, and has to connect them. A reader with no name chosen already sees `amun`.

The name still does a job where the name itself is what you are saying: a [greeting](../grammar/word-endings.md#greeting), a [conversation-length bid](../grammar/x-compounds.md#conversation-length), introducing yourself, and a reference that must stay fixed outside this conversation (a note to read later, minutes). `amun` shifts with each turn; a name does not.

**pronouns.md § special pronouns.** Replace the "prefer that name" paragraph and drop the `zSELFn vowogal.` block:

> Use **`amu`** (*speaker*) and **`eho`** (*listener*) for *I* and *you*. Use your own name where the name is the point: a greeting, introducing yourself, or a mention that has to mean you outside this conversation, such as a note someone reads later.

The existing `zamun vowogal.` block becomes the first example.

**pronouns.md § me or you as the topic.** Drop "Prefer a name where one is available … visible choice." `xamun` is already the visible choice.

**Examples.** `SELF` stays only where the name is the form: greetings and bids (word-endings.md, x-compounds.md, review.md, english.md, say-questions.md, why-agazan.md, and their cheat-sheet rows). Every plain *I* becomes `amun` with its resume: sakes.md (7, merged with step 2), predication.md 480 and 504, say-reasons.md 134, why-allowed.md 200 to 241, people-pointing.md 108 (drop "Your own name works as *I*"), knowing.md 1299 ("`amun` is still you"), and the `SELFn` rows in [syntax-test-corpus.md](../meta/syntax-test-corpus.md). Pages earlier in the path than pronouns.md use the house cast, not *I*.

**Meta rules.**

- [grammar-docs.md § house cast](../meta/grammar-docs.md#house-cast), *The learner (first person)*: `SELF` is for greetings, bids, and self-introduction. Plain *I* / *you* are `amun` / `ehon` from pronouns.md Beginner on.
- [translation-exercises.md](../meta/translation-exercises.md) item 10 and *English pronouns match*, and [drill-generation.md](../meta/drill-generation.md) lines 81 and 413: *I* / *you* through `amun` / `ehon` are allowed from pronouns.md Beginner on; before that, no *I* except a greeting.
- [glosses.md](../meta/glosses.md) lines 125 and 384: keep the `SELF` gloss, narrowed to the name uses.
- `AGENTS.md` *Learner name slot* and [agents-md.md](../meta/agents-md.md): say what the slot is for, not only how to spell it.
- [design-decisions.md](../meta/design-decisions.md): one line on why *I* is not your name by default (the costs above). A self-talk use of the name, if added, belongs to the Claritish editor first (`claritish-editor.md`), not here.

**Word banks:** checkpoints that drop a `SELFn` row add `amun` on the first checkpoint that uses it; specials do not count against the new-word cap.

<a id="open-questions"></a>
## Open questions

1. **What does a motive word assert on someone else's act, with no holder?** The proposal reads `zazawan vezebel thanathom` as *the act serves my stake, as I see it*: your framing of what the act is for, not a report of Azawan's reasons.
   - (a) Keep that reading and teach it as written above. *Recommended*: it keeps every sake word the speaker's, as the rule already says. EDITOR: AGREED
   - (b) Allow motive without a holder only on your own acts, so motive on someone else's act always needs a holder. That is stricter and simpler to teach, but it rejects a form the parser accepts. It would need an `unassigned-reserved.md` row and a parser rejection.
2. **Whose stake is plain prescription for?** By the rule, `zahaben vezehel thoyuthel` (no `/b/`) is advice to sing for **my** health. Claritish reads the same shape as the listener's health.
   - (a) Keep the rule. Advice for the advisee names them in `/b/` (the rewrites above), and Claritish changes to match. *Recommended*: one rule for every sake word, and naming whose good the advice serves is the point of the feature. EDITOR: AGREED
   - (b) Make the advisee the default for prescription only. That fixes Claritish and the old examples for free, but it breaks the "every sake word is yours" rule that the motive design depends on.
3. **Thanks and sorry to someone else's stake** (`thanathum balahen`, *owns up to a harm to Alahen*) are not affected: the `/b/` names the stake. No change.
4. **The learner's name as a teaching device.** Step 3 removes most of the places a reader sees their own name. Keep it in greetings and bids only (*recommended*), or also keep one `SELF` sentence on pronouns.md showing a name used where the mention must outlast the conversation.

## Done when

sakes.md teaches the rule and the holder route in § whose stake and § motive. No example or checkpoint line reads a sake word as someone else's reason without a holder. design-decisions.md records why. The cheat sheet and Claritish agree. Plain *I* in examples is `amun`, `SELF` appears only where the name is the form, and the meta rules say so. `npm run build` passes.

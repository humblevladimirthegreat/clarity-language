<!-- retie: skip -->
# Cool Features Posts

This document contains a record of features that have been posted to the r/conlangs Cool Features You've Added thread. It does not necessarily describe the current state of the language as these are produced over time and the language could have changed in the meantime. 

Use this document for styling examples when producing more posts, and seeing what has already been posted. New posts should be added at the top under this section.

Only the five most recent posts are kept in full below. Older posts are summarized at the end; full text is in [cool-features-archive.md](cool-features-archive.md). When adding a post, move the oldest full post to the archive and summarize it.

## Ideas for future posts

Not yet posted. Read the owning grammar page before drafting.

* **Thanks and sorry** (`thanks-and-sorry.md`): gratitude and apology have dedicated structure. Most on-theme, easy vivid examples.
* **Mirative** (`mirative.md`): marks "this surprised me" as the speaker's reaction, not a claim about the world. Pairs with the *may* and future-evidentiality posts.
* **Already / still / not yet / no longer** (`already-still-yet.md`): expectation-aware aspect words that encode what you expected, not just timing.
* **Residue and former** (`residue-and-former.md`): marks what is left over from an earlier state.
* **Enough and too** (`bars.md`): the standard for "enough" and "too" is tied to a sake and made explicit.
* **Ability and incapability, try and fallback** (`can-and-cant.md`, `try.md`): "can't" and "won't" can't blur together. Follow-up to Revamped Intentions.
* **Rhetorical questions and quizzes** (`more-turn-words.md`): a question that doesn't ask for information is marked as such.
* **Tone marks and speech manner** (`tone-marks.md`, `speech-manner.md`): sarcasm or gentleness built into the grammar.
* **Firm and soft** (`firm-soft.md`): commands, requests and statements softened or hardened by a grammatical marker.
* **Wizard sandbox game** (`wizard-game.md`): a game whose content is written as morph gloss. About the project, not one feature.
* **Cheat sheets and the English helper**: tooling that makes the language easier to learn.

## Recent posts

### Evidentials Required for Other People's Minds

In English it's easy to say things like "He thinks I'm bad" even when they haven't told you. Psychologists call the habit of treating your guess about someone's thoughts as fact "mind reading", and it's one of the classic cognitive distortions.

In Ageben you can only talk about what's going on in someone else's mind by adding an evidential word. That means you can't report someone's view without also saying how you know about it.

> `thuwathuruer theyomalazun.`
>
> th-anxious | th-CLUES-Alazun
>
> "I gather Alazun is anxious."

The CLUES evidential is attached to Alazun (proper name) so you are saying that you are inferring from hints (e.g. body language) that Alazun is anxious, as opposed to Alazun telling you that he is anxious. Without `theyomalazun` the sentence fragment would just mean that you (the speaker) are anxious, which needs no evidential because you are the authority on your own thoughts. This also ensures the evidential is used, since omitting the evidential means it is first person, so third person evidential for views is not only grammatically necessary but would mean something different if you don't use it.

Full docs: https://clarityconlang.com/grammar/holder.html#holder

### Finger Code

Ageben's relatively small alphabet (14 consonants and 4 vowels) and fairly consistent CV syllable structure allows for an easy-to-learn two-handed manual phonology.

You use your dominant hand to spell consonants by raising the number of fingers for the letter's position in the alphabet. Your thumb represents adding five. Once you get to 11, you hook the fingers to keep counting.

At the same time as the right hand, you use your left hand to spell one of the four vowels for the syllable, simply raising the number of fingers for the vowel.

It is easy to remember each letter's number position because the digit names also go in alphabetical order: *ba* means one, *b* is the first consonant and *a* is the first vowel. *do* means two, *d* is the second consonant and *o* is the second vowel, etc.

This isn't meant to be a proper sign language as it's probably too slow for consistent use, but it should work well as an easy-to-use system everyone can learn for signing a couple of words. Example uses:

* communicating across a loud room ("get margarita")

* surreptitious communication by tapping someone's body using the same code ("let's go")

* mute/deaf/hard-of-hearing communication when one party isn't fluent in sign language

The finger code can also be applied to music though I'm still iterating on the design for that.

full docs: https://clarityconlang.com/grammar/finger-code.html

### The last four letters of a stem carry distinct meanings

Most stems in Ageben have six letters of the form VCVCVC. Everything but the first two letters have a meaning loosely applied to help you remember what the word is. The first vowel and consonant are used to disambiguate between similar words.

The second vowel indicates how big the object is. The second consonant defines its "kind". The third vowel is the "job" (kind and job are explained in the linked documentation). The final consonant indicates whether you are using the concrete, abstract, or proper name sense of the word.

`amahul` *mountain* is person-sized-or-bigger (`a`), a place (`h`) that works against you (`u`) and is concrete (`l`). Its abstract form `amahum` is *challenge*:  something hard to face.

`agebel` *glasses* is hand-sized (`e`), something worn on the body (`b`) that is one compact thing (`e`) and is concrete (`l`). Its abstract form `agebem` is *clarity*, seeing clearly. The language's name comes from the proper form `ageben` *Clarity* / *Glasses*.

You can't tell what an uknown word is from these letter cues alone, but it should greatly aid in recognition especially in the context of a sentence.

Full docs: https://clarityconlang.com/grammar/root-tails.html

### Command vs Prohibition Redundancy via Word-Order

Sentences in Ageben start with a speech act word: yal for statements (usually omitted), yol for questions, yel for commands, and yul for prohibitions. Being only a single vowel apart can lead to mishearing though, so each act also has its own usual word order for redundancy:

* statement - verb last
* question - verb second
* command - verb first (after the act word)
* prohibition - verb last (like a statement)

Prohibitions use the same word order as statements because that is less dangerous to confuse than sharing the same word order as a command. In the third and fourth examples below, note that even if you miss or mistake the first word, the word order means that you can't confuse "Don't eat the mushroom" with "Eat the mushroom." At worst you hear "(Someone) eats the mushroom" a description rather than an instruction.

> `(yal) zazawan damahul vagadel.`
>
> /(ˈjäl) ˈzä.zä.wän ˈdä.mä.ɦʉl ˈvä.ɡä.de̞l/
>
> z-Azawan | d-mushroom | v-eat
>
> "Azawan eats the mushroom."

> `yel zazawan vagadel damahul.`
>
> /ˈjo̞l ˈzä.zä.wän ˈvä.ɡä.de̞l ˈdä.mä.ɦʉl/
>
> y-question | z-Azawan | v-eat | d-mushroom
>
> "Does Azawan eat the mushroom?"

> `yol vagadel damahul.`
>
> /ˈje̞l ˈvä.ɡä.de̞l ˈdä.mä.ɦʉl/
>
> y-command | v-eat | d-mushroom
>
> "Eat the mushroom."

> `yul damahul vagadel.`
>
> /ˈjʉl ˈdä.mä.ɦʉl ˈvä.ɡä.de̞l/
>
> y-prohibition | d-mushroom | v-eat
>
> "Don't eat the mushroom."

When you want to be extra sure that *don't* isn't missed, you can also say yul twice for emphasis.

> `yul yul damahul vagadel.`
>
> /ˈjʉl ˈjʉl ˈdä.mä.ɦʉl ˈvä.ɡä.de̞l/
>
> y-prohibition | y-prohibition | d-mushroom | v-eat
>
> "Don't eat the mushroom. Seriously, don't."

Full docs: https://clarityconlang.com/grammar/speech-moves.html#act-word-order

### Labels Say How Far They Reach

Judging a person's character from one action is a common cognitive distortion (the fundamental attribution error), and treating that character as a fixed essence (Essentialism) makes it worse. Both make us less compassionate towards others.

Ageben lets any label mark how essential we treat the behavior with an infix before the ending letter:

- **tha** — this one occasion: `gozovothul` "lazy this time" (one slow day is not a trait)
- **the** — a pattern with exceptions: `gozovothol` "tends to be lazy" (as opposed to being a consistently lazy person)
- **tho** — true in one relationship: `gozovothem blalahen` "lazy as far as Alahen is concerned" (Alahen's opinion, not a confirmed trait)
- **thu** — a name only, not an explanation: `gozovothal` "what gets called lazy" (society's view is not a confirmed trait)

It's an optional efficient way to express a more charitable view of someone's trait.

You can learn more here: https://main.d2xds94zsgwptg.amplifyapp.com/grammar/label-seams.html#label-reach

## Older posts (summaries)

Full text is in [cool-features-archive.md](cool-features-archive.md). Newest first.

* **Collective Verbs and Adjectives Use Plural**: `-x` on a verb or adjective means the group does or has it collectively (`vezehelx` sing together, `garagamx` collectively heavy), independent of whether the noun is plural.
* **May Says If You're Finding Out**: stance `ovu` (*may*) takes an ending saying whether you'll find out (`-m` plain possibility, `-l` I'll find out, `-r` who knows).
* **Greetings and Goodbyes Set Conversation Length**: name greeting suffixes `-xan/-xen/-xon/-xun` set open-ended / brief / quick / passing; at departure the same forms say how soon you leave. The lower level wins.
* **Pronouns Point by Role**: pronouns point by role in a recent event (doer, one it happened to, extra party), with no gender or animacy; older referents resume the whole stem plus `-r`.
* **Single-Item and Standalone Conjunctions**: `zal`/`zol`/`zul` (and, or, not) on one or zero items mean *only X*, *nothing*, *the only choice*, *no*; `u` complements the set (`zual` everything).
* **Egocentric Directions Require Viewpoint**: no bare left/right; compass word + reference point (west-you = your left). Up arrow means ahead, double up arrow means up a level.
* **Span Markers**: cite, mention, opaque, aside; opening marks `~` paraphrase and `@` proper noun; closing marks `#` sic and `-` cut off; nestable, with a pronoun for a prior span.
* **Value Judgments Made Explicit (draft)**: neutral vocabulary with explicit value judgments. Unfinished.
* **Numeric Derivations**: number words with infinity and exponents give prefixes: infinitesimal, smallest ordinal, annihilate (0^inf), paradox (0^0), gazillion (1^inf).
* **Ranked Conjunctions**: items listed in priority order with fallbacks (*burger, else chicken, else hot dog*), with open and closed forms.
* **Mindfulness Noting**: attitude verbs (think, doubt, worry, fear) need a short noting marker, prompting a Noting-style check against rumination.
* **Required Denominator for Percentages**: percentages must state what they are a percentage of, curbing base-rate errors.
* **Attribution Causality (draft)**: verbs marked for internal (intended, with a sake) or external (caused, default) locus, so credit and blame become choices. Unfinished.
* **Emotions based on activation, locus, need**: feelings built from activation, locus, need and met/unmet, each implying what to do. Unfinished.
* **Criterion for Features**: a feature must help the language goals, address a common bias, be easy to use, avoid shame, and remind only where needed. Exhaustive Or is the model case.
* **Long Perspective Marker**: a one-syllable particle for the longer-term effect (safety, contentment, excitement) alongside the immediate one.
* **Modifiers Decline By Comparison**: adjectives and adverbs mark the basis of comparison (average, own typical, personal standard, social presentation, professional, everyone).
* **Revamped Intentions**: first-person actions carry a particle for the value sought, simplified to safety, contentment, excitement, unknown.
* **Negative Judgments Require Explicit Comparisons**: no word for *bad*; say *worse than...*.
* **Future Evidentiality**: future tense marks why you believe it: prediction, intention, potential, each graded.
* **Introducing Claritish**: modified English for journaling with letter codes and punctuation marking which value an event fulfilled or violated.
* **Grammatical Number uses actual numbers for precision**: a pre-noun particle (`ya-`, `ye-`, `yo-`) means at least, exactly, at most, with an optional number.
* **Habitual Tenses**: frequent, schedule and trigger tenses make you think about how a habit is set up.
* **Ambiguity Checking**: plan to test written and spoken unambiguity by generating many sentences and removing spaces.
* **Numbers use Scientific Notation**: numbers are spoken as digit groups with exponents, replacing metric prefixes (40e3 grams). Includes a pronunciation guide.
* **Built-in Number Mneumonics**: vocabulary is built so each three-digit number has a near-homophone word, aiding memory.
* **Brainstorming Reminders using Numbers (draft)**: *idea*, *problem*, *goal*, *solution* require a number suffix to encourage several. Unfinished.
* **First Person Emotional Intention**: the first-person subject is replaced by the need the action serves.
* **Intention Greeting and Gratitude Goodbyes**: a heart salute plus a stated intention on greeting; a stated gratitude on goodbye.
* **General Statement Justification**: general claims use a verb for the kind of generalization, with the subject giving the justification.
* **Generalization Counterexample Prompt**: *always* and *never* split into "none can exist" and "I can't think of any".
* **Discouraged Labeling**: no personality-judgment adjectives; describe the behavior instead.
* **Phonotactic Grammar Hints**: wrong part-of-speech use of a word (like a mental-state word as a verb) is deliberately awkward to pronounce.
* **Silver Lining Conjunction**: disliking something requires a conjunction that adds something good after it.
* **Need Fulfillment Intention**: an Intention part of speech states the need the speaker wants met.
* **Unstated Premises**: conclusions use a conjunction that forces the major premise to be stated.
* **Exhaustive Or**: *or* splits into exhaustive and inexhaustive, flagging false dichotomies.
* **Consider Other Side**: liking or disliking requires a balance conjunction with a like and a dislike slot.

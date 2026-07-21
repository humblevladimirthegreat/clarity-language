# Reference Document for Clarity v0.7

# Introduction

Clarity is a language designed to encode psychological concepts and techniques that have been scientifically proven to improve your life. The encoding is done primarily through carefully selecting the vocabulary so that when you are trying to apply those concepts, it will nudge you in a better direction. For example, there are two words for *to say*. One means "they literally said" and the other "I perceived the meta-message to be" This division helps the listener realize when they are applying their own interpretation on a message, and it helps the speaker to be more mindful of what meta-messages (attitude toward the recipient) they could be construed as sending.

When I say that Clarity helps you improve your life, I mean that it improves these three broad categories:

(1) Love. Clarity encodes self acceptance and acceptance of others by highlighting when judgments are taking place. For example: the personal possessive adjective (my) in Clarity has a form that means “the speaker is grateful for this” because frequent gratitude is scientifically shown to increase happiness.

(2) Truth. Clarity improves critical thinking by making obvious the common biases we hold that cause us to delude ourselves.

Example: When you say you believe something, you specify whether you also looked for disconfirming evidence (heard from both sides of the issue). This helps fight the tendency of confirmation bias, one of the most pervasive and difficult-to-detect errors of thinking.

(3) Freedom. Clarity frees us to live our authentic selves and be creative by helping us recognize the reasons behind our actions and break free from old patterns and traditions.

Example: The word for problem comes in two forms: “the original problem as stated” and “a subsequent restatement of the problem” Creativity often requires thinking about a problem in different ways.

Aside from the psychology-based vocabulary, there are also some non-core features that I am also excited about:  
a) The grammar is unambiguous, but still easy to use. This will allow some computer applications to potentially further improve our lives, such as an automated tutoring system for learning the language.  
b) The phonology and syllable structure was chosen to be easy to sing.

# Grammar \- Unambiguous But Not Difficult

This page describes the goals for the grammar \- skip to the next page for the actual grammar

Clarity has an unambiguous grammar in order to support a variety of computational tools that could better utilize the language. The Lojban language is the poster child for this, but it is infamously difficult to use the predicate-logic-inspired grammar. An unambiguous grammar need not be based on predicate logic (see [**Predicate logic is a suboptimal basis for real time logical**](http://ling.auf.net/lingbuzz/002272/v1.pdf)) and Clarity resolves ambiguities in ways that are relatively simple.

**Syntactic Unambiguity**: It is always clear the part of speech a word is and how they relate to the sentence.

This is accomplished via each word preceded by a particle indicating the part of speech. Words are isolating (they do not change based on part of speech) but the particle changes depending on part of speech. Thus we don't need to rely on word order (though the default should be treated as SOV) to parse the sentence.

**Referential Unambiguity**: It is always clear what pronouns refer to.

A difficult problem for computationally parsing a sentence is figuring out what vague pronouns like English *it* refer to. Clarity avoids that by forming anaphoric pronouns from the referent’s own letters, with **-rn** to bind to the most recent compatible antecedent and **-r** to reuse that binding (see [References: unambiguous pronouns](#references-unambiguous-pronouns)), plus a small set of special pronouns for discourse roles. There are no vague person/number pronouns in the English sense.

**Semantic Unambiguity**: It is always clear in what sense a word is being used.

How can the computer know what sense a word is being used? Easy\! Words only have one sense. However multiple senses of a word is useful for applying related concepts to different fields. This is allowed by explicitly having an infix that means "in the sense of \[topic\]" and a separate dictionary entry for the sense (essentially a new compound word).

**Ambiguity we are not trying to resolve**:

We're not trying to be as precise as Ithkuil, because that language is very difficult to use. Here are some things we have to live with for practicality:

* Vagueness is helpful in language because we often think in vague terms. You should be able to say something is “good” without specifying precisely which aspect you are referring to.  
* Derivational opaqueness is also fine. There doesn’t need to be any indication that “food” and “cook” are related.

# Criterion for Features

The goal of r/claritylanguage is to help foster compassion, rationality, and empowerment in its speakers, using language design techniques described in Language as a Cognitive Framework. I’ve decided to formalize requirements for adding new features to the language.

* Helps with Language Goals. The feature should help the speaker be more compassionate, rational, and/or empowered. Ideally there should be research to support that framing the language in this way helps, However, given the innovative nature of this language, research can be scarce, so user testing can be used instead. 

* Addresses a Common Problem. The feature should address cognitive bias(es) that happen in the majority of people. Implementing features for rarely-occurring problems makes the language more cumbersome for relatively little benefit.

* Easy to use. The feature should be explainable with a single paragraph and a couple of examples. The feature should be usable in sentences with at most one extra second of thought (after you’ve practiced it).

* Avoids shame. Features should avoid giving the impression that one option for the feature is generally more socially acceptable than another. Each feature option has cases where they should be used. Otherwise, a part of the feature might be avoided entirely, which would defeat the purpose.

* Reminders where they are needed. Ideally, the feature should encourage compassion, rationality, and/or empowerment only in cases where that is relevant - i.e. when we are likely to act uncompassionately, irrationally, and/or disempowered. There will be many false positives, but the feature should strive to minimize pointless applications.

# Parts of Speech

Parts of speech are determined by a prefix consonant added before each word. Words do not change form based on usage, and can be used in most parts of speech, so the prefix is how you know a word's role.

The standard word order is Subject \- Direct Object \- Verb. Order can change for stylistic reasons or due to certain constructs like dependent clauses. Prepositional phrases are treated like modifiers and go after what they modify.

## Part-of-speech prefixes

| Prefix | Role |
|--------|------|
| /z/ | subject |
| /d/ | direct object |
| /b/ | indirect object |
| /v/ | verb |
| /w/ | modifier |
| /ɡ/ | other grammar (preposition / conjunction / quotation) |
| /h/ | mood / tense |
| j /dʑ/ | interjections, direct address |

## Entity

These are words that can stand alone as arguments in the sentence.

Subject (/z/) \- the thing doing the action  
Direct Object (/d/) \- the thing on the receiving end of the action  
Indirect Object (/b/) \- the recipient or beneficiary of the action  
Verb (/v/) \- the action being done

## Simple Modifier

A word that describes another word (adjective / adverb), marked with /w/. Modifiers go after the word they modify.

## Complex Modifier and Argument Entity

“complex modifiers” can accept an additional word as part of the modifier, such as the possessive adjective can have the owner, then you need two parts \-  the argument entity and the modifier. The argument follows the modifier and is marked with “go-” \+ the base entity prefix (the dictionary shows how it affects the base entity)

The argument is now the new entity, so any simple modifiers would affect the argument rather than the original entity. You can also have a complex modifier modify a complex modifier or argument and continue the chain. This also means you can’t have two complex modifiers affect the same entity, if this is the case then you need to describe the entity further as a separate sentence.

Complex modifiers are used for many things, including what would be considered prepositional phrases in other languages, such as “located at”. If you’re not sure where to put the complex modifier because it affects the whole sentence, it goes after the verb. It can even be used as simple dependent clauses (the verb is the complex modifier and the argument is the subject)

## Mood

Indicates the mood/tense of the sentence. Marked with the /h/ prefix. Use this to describe when the events are taking place and how you know about it. For example: “h vizinin” means “I remember the events of this sentence (which occurred in the past)”

## Interjections and Direct Address

Marked with j /dʑ/. Used for exclamations, greetings, and vocatives that address someone directly.

## Dependent Clauses

Dependent clauses are formed by a special pronoun (form TBD) that refers to the next sentence. To be unambiguous and reduce cognitive load, dependent clauses must come at the end of the sentence, so you must rearrange the word order if needed. Example is *I told him that...* 

## Quotations

When quoting someone, using a proper noun, using a foreign word, or using a slang word, you must use the square brackets \[ \]. Begin-quote, end-quote, and escape forms are /ɡ/-prefixed other-grammar words (the dictionary lists the specific forms). On the off chance you need to use a quotation marker word within the quotation, it is escaped with \\ or the escape form immediately before it. These spoken forms are probably not needed in casual speech, but can be helpful if speaking with voice-to-text or if you want to emphasize the quoting. 

# References: unambiguous pronouns

Pronouns replace definite articles: once something has been introduced, you refer back with a pronoun (or an alternate construct below), not with a separate “the X” form.

## Letter-based anaphoric pronouns

An anaphoric pronoun is built from the **first three letters of the referent’s root**, plus further **CV pairs** from that root if needed to distinguish referents. It takes the usual part-of-speech prefix and one of two pronoun endings:

| Ending | Meaning |
|--------|---------|
| **-rn** | **Bind** this letter-form to the **most recently mentioned** compatible antecedent (root matches the pronoun’s letters). Later **-r** uses of the same form refer to that binding. |
| **-r** | **Use** the **existing binding** for this letter-form. Never assigns a new antecedent. |

Add **-z** after the word-form ending to mark **plural**: the **group containing** the referent. Example: a bound pronoun `…r` refers to one entity; `…rz` refers to the group that includes that entity. The same **-z** works on full words and on **-rn** binds (`…rnz`).

Resolution is deterministic for a parser:

1. **-rn** → among antecedents whose roots are compatible with the pronoun’s letters, bind this form to the most recently mentioned one (and that use refers to it).
2. **-r** → look up the current binding for this letter-form. If none exists, the pronoun is ill-formed.

Rebinding: a later **-rn** with the same letters replaces the previous binding.

* If two different antecedents share a root prefix so that letters alone cannot separate them at bind time, disambiguate with a **modifier** (adjective) or an **ordinal** on the **-rn** form (or use an alternate construct).
* If the same word was introduced more than once as distinct referents, disambiguate the same way — letter length alone cannot separate identical roots.

**Compatible / recent.** “Compatible” means the referent’s root begins with the pronoun’s letter sequence. “Most recently mentioned” counts full-word mentions and successful pronoun resolutions in the discourse so far (within the current topic segment). Topic boundaries clear bindings so a fresh **-rn** is required after a shift.

There are no English-style 3rd-person pronouns (*he* / *she* / *it* / *they*) and no impersonal *one*.

## Special pronouns

Forms TBD. Roles:

* **Speaker** (1st person)
* **Listener** (2nd person)
* **Generic single person** (a nonspecific individual — not impersonal *one*)
* **Next clause** (used for dependent clauses; see above)

**Group containing** a referent is not a separate special pronoun: append **-z** to the word (see above).

**Prefer names.** When a proper name is available, use it — including for self-address — rather than the speaker/listener special pronoun. The special pronouns are for the narrow cases where a name is unavailable, awkward, or would obscure the discourse role.

# Phonology and Phonotactics

Clarity has the following goals for its phonology:

1. Easy to sing (explained below).  
2. Unambiguous pronunciation \- it should always be clear how to pronounce it from the spelling.  
3. Clear word boundaries (even within a compound word).

### Vowels

I chose vowels that aren't fully open or fully closed so you don't have to do [vowel modification](https://www.singwise.com/articles/vowels-formants-modifications) (see section "VOWEL MODIFICATION ('COPERTURA')") to sing them in your high/low range.

e /e̞/ \- o /o̞/ \- u /ɶ/ \- a /ɑ/  (roundedness is non-contrastive)

### Consonants at beginning of syllables

The language has no distinction between voiced/unvoiced, but the voiced version is preferred because you can sustain notes across letters (voiceless requires briefly stopping the airflow). You can still use the unvoiced for stylistic reasons.

h /ɣ/, w /w/, g /ɡ/, d /d/, j /dʑ/, b /b/, z /z/, m /m/, n /n/, v /v/

s /s/ (s is only used for clusters) sn, sm, sl, zh, gr, gl, dr, br, bl

### Consonants at end of syllables (except end of word)

g /ɡ/, d /d/, j /dʑ/, b /b/, z /z/, m /m/, v /v/  (cannot double with the second beginning consonant)

### Phonotactics

A word contains three parts:
1. the part of speech prefix
2. the root(s) - multiple if compound word
3. the word form suffix: literal (**-l**), metaphorical (**-m**), proper name (**-n**), bound pronoun use (**-r**), pronoun bind-to-most-recent (**-rn**)
4. optional plural **-z** (the group containing the referent), after the word-form suffix

roots have form V(CV)+
if a compound root, then "j" separates them

a) A word root almost always starts with a vowel. The ending and beginning consonants were carefully chosen so that you can never confuse which syllable a consonant belongs to (vaban must be pronounced va'ban and not vab'an because syllables never end with a consonant unless it's the end of the word).

b) All words end with a word-form suffix (**-l**, **-m**, **-n**, **-r**, or **-rn**), optionally followed by plural **-z**. No other syllables end with a consonant, so word boundaries stay clear even when pauses are unreliable (as in singing). Allowed word-final clusters: **-rn**, and any of those endings plus **-z** (**-lz**, **-mz**, **-nz**, **-rz**, **-rnz**).

c) Easy to tell the components of a compound word because j separates them
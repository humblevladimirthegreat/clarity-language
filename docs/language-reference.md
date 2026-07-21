# Reference Document for Clarity v0.7

# Introduction

Geran is a language designed to encode psychological concepts and techniques that have been scientifically proven to improve your life. The encoding is done primarily through carefully selecting the vocabulary so that when you are trying to apply those concepts, it will nudge you in a better direction. For example, there are two words for *to say*. One means "they literally said" and the other "I perceived the meta-message to be" This division helps the listener realize when they are applying their own interpretation on a message, and it helps the speaker to be more mindful of what meta-messages (attitude toward the recipient) they could be construed as sending.

When I say that Geran helps you improve your life, I mean that it improves these three broad categories:

(1) Love. Geran encodes self acceptance and acceptance of others by highlighting when judgments are taking place. For example: the personal possessive adjective (my) in Geran has a form that means “the speaker is grateful for this” because frequent gratitude is scientifically shown to increase happiness.

(2) Truth. Geran improves critical thinking by making obvious the common biases we hold that cause us to delude ourselves.

Example: When you say you believe something, you specify whether you also looked for disconfirming evidence (heard from both sides of the issue). This helps fight the tendency of confirmation bias, one of the most pervasive and difficult-to-detect errors of thinking.

(3) Freedom. Geran frees us to live our authentic selves and be creative by helping us recognize the reasons behind our actions and break free from old patterns and traditions.

Example: The word for problem comes in two forms: “the original problem as stated” and “a subsequent restatement of the problem” Creativity often requires thinking about a problem in different ways.

Aside from the psychology-based vocabulary, there are also some non-core features that I am also excited about:  
a) The grammar is unambiguous, but still easy to use. This will allow some computer applications to potentially further improve our lives, such as an automated tutoring system for learning the language.  
b) The phonology and syllable structure was chosen to be easy to sing.

# Grammar \- Unambiguous But Not Difficult

This page describes the goals for the grammar \- skip to the next page for the actual grammar

Geran has an unambiguous grammar in order to support a variety of computational tools that could better utilize the language. The Lojban language is the poster child for this, but it is infamously difficult to use the predicate-logic-inspired grammar. An unambiguous grammar need not be based on predicate logic (see [**Predicate logic is a suboptimal basis for real time logical**](http://ling.auf.net/lingbuzz/002272/v1.pdf)) and Geran resolves ambiguities in ways that are relatively simple.

**Syntactic Unambiguity**: It is always clear the part of speech a word is and how they relate to the sentence.

This is accomplished via each word preceded by a particle indicating the part of speech. Words are isolating (they do not change based on part of speech) but the particle changes depending on part of speech. Thus we don't need to rely on word order (though the default should be treated as SOV) to parse the sentence.

**Referential Unambiguity**: It is always clear what pronouns refer to.

A difficult problem for computationally parsing a sentence is trying to figure out what 3rd-person pronouns refer to (“it”). My solution? There are 2 forms of 3rd-person pronouns \- one that is based on part of speech “\[the previously mentioned subject\]” and another that is based on assignment “I gave the (pencil and paper) \[henceforth collectively known as x\] to you. I hope you appreciate x.”

**Semantic Unambiguity**: It is always clear in what sense a word is being used.

How can the computer know what sense a word is being used? Easy\! Words only have one sense. However multiple senses of a word is useful for applying related concepts to different fields. This is allowed by explicitly having an infix that means "in the sense of \[topic\]" and a separate dictionary entry for the sense (essentially a new compound word).

**Ambiguity we are not trying to resolve**:

We're not trying to be as precise as Ithkuil, because that language is very difficult to use. Here are some things we have to live with for practicality:

* Vagueness is helpful in language because we often think in vague terms. You should be able to say something is “good” without specifying precisely which aspect you are referring to.  
* Derivational opaqueness is also fine. There doesn’t need to be any indication that “food” and “cook” are related.

# Parts of Speech

Parts of speech are determined by particles added before each word. Words do not change form based on usage, and can be used in most parts of speech, so the part-of-speech marker is how you know it is being used.

The standard word order is Intention \- Subject \- Direct Object \- Verb. Order can change for stylistic reasons or due to certain constructs like dependent clauses. Prepositional phrases are treated like modifiers and go after what they modify. 

## Entity

These are words that can stand alone. The nouns have definite forms (“the tree”) and indefinite (“a tree”)  
Verb \- the action being done. Signified with the article “vel”  
Subject \- the thing doing the action. “zil” for indefinite; “zel” for definite   
Direct Object \- the thing on receiving end of action. “dil” for indefinite; “del” for definite

## Simple Modifier

A word that describes another word (adjective / adverb). They go after the word they modify.

no particle means that it modifies the preceding entity  “**French** (history teacher)”  
“mol” means that it modifies the preceding modifier “(**French** history) teacher

## Complex Modifier and Argument Entity

“complex modifiers” can accept an additional word as part of the modifier, such as the possessive adjective can have the owner, then you need two parts \-  the argument entity and the modifier. The argument follows the modifier and has the article of “go-” \+ the base entity article (the dictionary shows how it affects the base entity)

The argument is now the new entity, so any simple modifiers would affect the argument rather than the original entity. You can also have a complex modifier modify a complex modifier or argument and continue the chain. This also means you can’t have two complex modifiers affect the same entity, if this is the case then you need to describe the entity further as a separate sentence.

Complex modifiers are used for many things, including what would be considered prepositional phrases in other languages, such as “located at”. If you’re not sure where to put the complex modifier because it affects the whole sentence, it goes after the verb. It can even be used as simple dependent clauses (the verb is the complex modifier and the argument is the subject)

## Intention Word

A novel invention of Geran, the intention part of speech is optionally used by the speaker to signify why they are speaking the sentence. Examples include “improving our relationship” “uphold my boundaries” and “self-disclosure.” The particle is “mil.” The intention PoS helps with mindfulness and assertiveness by encouraging thinking about and explicitly stating your reasons for saying something.

## Mood

Indicates the mood/tense of the sentence. The particle is “mol.” Use this to describe when the events are taking place and how you know about it. For example: “mol vizinin” means “I remember the events of this sentence (which occurred in the past)”

## Dependent Clauses

Dependent **c**l**a**uses are formed by a special pronoun “gal” that refers to the next sentence. To be unambiguous and reduce cognitive load, dependent clauses must come at the end of the sentence, so you must rearrange the word order if needed. Example is *I told him that...* 

## Quotations

When quoting someone, using a proper noun, using a foreign word, or using a slang word, you must use the square brackets \[ \]. They are phonetized as “bil” and “bel” for **b**eg**i**n-quote and **e**nd-quote respectively. On the off chance you need to use standalone “bil” or “bel” within the quotation, it is esc**a**ped with \\ or “bal” immediately before it. These phonetizations are probably not needed in casual speech, but can be helpful if speaking with voice-to-text or if you want to emphasize the quoting. 

# 

# References: unambiguous pronouns

In general, referring to something is ambiguous, especially the vague 3rd-person pronoun *it*. The only unambiguous pronouns are singular 1st and 2nd person, “mel” and “jul” respectively. Here are my alternatives to 3rd-person pronouns.

Reference the previous entity that has the same particle: prepend “zhy-”  
Reference the prior entity before that prepend “zhyzhy-”

You can also use alternate constructs rather than pronouns in order to have a more precise way of referring to other entities. These other ways are as follows, in order of preference:

* If something has a proper name, use that name.   
* If there is only one type of that entity, use the definite noun. *I bought a hotdog; I ate the hotdog*  
* If the entities can be differentiated by modifiers, use them. *I saw a tall person and a short person. I talked to the short person.*  
* If there are two of the same entity, you can use the recency particle prefix “by-” for *the most recently mentioned \[entity\]* and use “bo-” for *the other one*  
* You can use verbal adjuncts to refer to entities affected by a verb, like *the attacker* or *the attacked*. The adjunct particle is formed by prefixing “vy-”  So “vyzin \[verb\]” would refer to the person who performed the most recently referenced \[verb\].   
* For plural pronouns, you refer to a group containing a specified entity. *Karl and Susan went to lunch. **The group containing** Susan ate curry.* The particle suffix is “-am” 

# Phonology and Phonotactics

Geran has the following goals for its phonology:

1. Easy to sing (explained below).  
2. Unambiguous pronunciation \- it should always be clear how to pronounce it from the spelling.  
3. Clear word boundaries (even within a compound word).

### Vowels

I chose vowels that aren't fully open or fully closed so you don't have to do [vowel modification](https://www.singwise.com/articles/vowels-formants-modifications) (see section "VOWEL MODIFICATION ('COPERTURA')") to sing them in your high/low range.

e /e̞/ \- i /ə/ \- o /ɑ/ \- a /a/ \- u /ɑ/

### Consonants at beginning of syllables

The language has no distinction between voiced/unvoiced, but the voiced version is preferred because you can sustain notes across letters (voiceless requires briefly stopping the airflow). You can still use the unvoiced for stylistic reasons.

h /ɣ/, w /w/, g /ɡ/, d /d/, j /dʑ/, b /b/, z /z/, m /m/, n /n/, v /v/

s /s/ (s is only used for clusters) sn, sm, sl, zh, gr, gl, dr, br, bl

### Consonants at end of syllables (except end of word)

g /ɡ/, d /d/, j /dʑ/, b /b/, z /z/, m /m/, v /v/  (cannot double with the second beginning consonant)

End of the word (or end of component if compound word) must be l (for partic**l**e) or n (for e**n**tity)

### Phonotactics

a) A syllable can never start with a vowel, and the ending and beginning consonants were carefully chosen so that you can never confuse which syllable a consonant belongs to (dala must be pronounced da'la and not dal'a because syllables never start with vowels).

b) All particles end with "l". Since all content words have a particle in front, word boundaries are easy to spot and unambiguous, even when pauses are unreliable (as in singing).

c) Easy to tell the components of a compound word because each component (except the last) will end with n plus a vowel. 


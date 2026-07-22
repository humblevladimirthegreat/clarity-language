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

This is accomplished via each word preceded by a prefix indicating the part of speech. Words are isolating (they do not change based on part of speech) but the prefix changes depending on part of speech. Thus we don't need to rely on word order (though the default should be treated as SOV) to parse the sentence.

**Referential Unambiguity**: It is always clear what pronouns refer to.

A difficult problem for computationally parsing a sentence is figuring out what vague pronouns like English *it* refer to. Clarity avoids that by forming anaphoric pronouns from a fixed prefix of **any** prior word’s root (through the 2nd vowel), resolved to the **most recently mentioned matching** antecedent (see [References: unambiguous pronouns](#references-unambiguous-pronouns)), plus a small set of special pronouns for discourse roles. There are no vague person/number pronouns in the English sense.

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

Every sentence begins with a **clause-force** `/h/` (see [Adverbs](#adverbs-h)); that fixed left edge is how sentence boundaries stay clear under free word order. After that opener, the standard order is Subject \- Direct Object \- Verb. Order of those core roles can change for stylistic reasons or due to certain constructs like dependent clauses. Adjectives (`/w/`) go after what they modify. Non-force adverbs (`/h/`) may appear anywhere in the clause (see below).

## Part-of-speech prefixes

| Prefix | Role |
|--------|------|
| /z/ | subject (noun) |
| /d/ | direct object (noun) |
| /b/ | argument noun (of a complex adjective or adverb) |
| /v/ | verb |
| /w/ | adjective |
| /ɡ/ | adjective adjunct (modifies the previous `/w/`) |
| /h/ | adverb (clause force, mood / tense / evidentiality, adjuncts) |
| x /ʒ/ | discourse marker (conjunctions, quotation markers) |
| j /dʑ/ | interjections, direct address |

There is no dedicated indirect-object prefix. Recipients and beneficiaries (English *to* / *for*) are expressed with a complex adverb (`/h/` + `/b/`) plus an argument noun, the same pattern as other verb-level prepositional-phrase meanings.

## Nouns and verbs

Nouns can stand alone as core arguments of the clause. Verbs mark the action.

Subject (/z/) \- the thing doing the action  
Direct Object (/d/) \- the thing on the receiving end of the action  
Verb (/v/) \- the action being done

## Adjectives (`/w/`)

`/w/` marks **adjectives** (and noun-level relational phrases). They go **after** the word they modify.

## Adjective adjuncts (`/ɡ/`)

`/ɡ/` marks a word that **modifies the previous adjective** (`/w/` unit). It does not modify the verb or the noun directly. Use it for degree (*very*, *slightly*) and for tense/mood/evidentiality scoped only to that property (*former* / *recent*, *alleged*, and the same mood roots as `/h/` when the framing applies just to the adjective).

The `/ɡ/` word sits on its host: normally immediately after the `/w/` (or after that `/w/`’s contiguous `/b/` argument if the adjective is complex). Unlike `/h/`, `/ɡ/` does **not** float. Several `/ɡ/` words may stack on one `/w/` (`w-happy g-recent g-very`); each applies to that same adjective. `/ɡ/` words are typically simple (no `/b/` argument); if a relation needs an argument, use a complex adjective (`/w/` + `/b/`) instead.

Same root, different prefix → different scope: `/h/` frames the clause; `/ɡ/` frames only the preceding adjective.

## Adverbs (`/h/`)

`/h/` marks **adverbs** (modifiers of the verb or clause). That includes **clause force**, manner, time/place adjuncts, recipients (*to* / *for*), and mood/tense/evidentiality. Example mood form: “h vizinin” means “I remember the events of this sentence (which occurred in the past).”

### Clause force (required sentence opener)

Every sentence begins with a **clause-force** `/h/` that marks the speech act. The dictionary lists the specific forms. The closed set for now is:

* **statement** — assertoric claim or description
* **polar question** — yes/no question
* **imperative** — directive (command / instruction)

Clause force is **fixed at the left edge** of the sentence; it does not float. A new clause-force `/h/` starts a new sentence. Other speech acts (request, promise, wish, evaluative judgment, and so on) are not separate forces yet — express them with ordinary vocabulary under one of these three; the dictionary may add dedicated force forms later.

Content questions (*who* / *what* / *where*) use the [interrogative special pronoun](#special-pronouns) for the queried role and, for now, the same **polar question** force opener as yes/no questions.

Bare vocatives and exclamations that are only `/j/` (no clause) do not take clause force.

### Other `/h/` (free within the clause)

Because non-force `/h/` always targets the clause’s verb, **position is free within the clause** (before/after arguments, next to the verb, clause-final, etc.) for style, focus, or meter. `/h/` material must stay inside its own clause: it must not float into a following sentence or into a trailing dependent clause (dependent clauses stay at the end; see below).

When several `/h/` units appear in one clause, interpret them in this **relative order** for scope: clause force (already sentence-initial) → mood/evidential → role/place/time adjuncts (including recipient) → manner. If two units share a band, left-to-right in the spoken order breaks the tie.

## Complex adjectives, complex adverbs, and argument nouns

A **complex adjective** or **complex adverb** takes an extra participant: the adjective or adverb word plus an **argument noun** (`/b/`). The argument immediately follows the adjective or adverb. That word carries the relation; `/b/` only marks “argument of that adjective or adverb” (the dictionary entry says how it relates to the host).

- **Complex adjectives** use `/w/` + `/b/` (e.g. possessive owner, “book *on* the table”).
- **Complex adverbs** use `/h/` + `/b/` (e.g. recipient *to*, “happened *at*”). The `/h/` + `/b/` pair is one unit and **stays contiguous** even when that unit floats.

Example (recipient): `/h/` *to* + `/b/` recipient may sit anywhere in the clause as a pair.

After a complex adjective or adverb, the argument is the new noun for further adjective modification: a simple `/w/` after `/b/` describes the argument, not the original host. `/ɡ/` after a `/w/` (+ optional `/b/`) grades or frames that adjective, not the noun. You can chain by having a complex adjective or adverb modify another complex adjective/adverb or its argument. You can’t have two complex adjectives affect the same noun; if you need that, describe the noun further in a separate sentence. Multiple `/h/` units on the same verb are allowed (each simple `/h/` or contiguous `/h/`+`/b/` counts as one unit), subject to the scope order above.

Complex adjectives and adverbs cover what would be prepositional phrases in other languages. A verb used as a complex adverb with a `/b/` argument can form a simple dependent-clause-like adjunct (the `/b/` argument is the clause’s subject-like participant).

## Interjections and direct address (`/j/`)

Marked with j /dʑ/. Used for exclamations, greetings, and vocatives that address someone directly.

## Discourse markers (`/x/`)

Marked with x /ʒ/. Used for **conjunctions** (*and* / *or* / *but*, etc.) and **quotation markers** (see below). The dictionary lists the specific forms. The same sound **x** also joins roots inside compound words (see Phonotactics); it is not used as an ordinary root consonant, so mid-word **x** always means “next root,” and word-initial **x** always means discourse marker.

## Dependent Clauses

Dependent clauses are formed by a special pronoun (form TBD) that refers to the next sentence. To be unambiguous and reduce cognitive load, dependent clauses must come at the end of the sentence, so you must rearrange the word order if needed. Example is *I told him that...* The dependent material is itself a full sentence and therefore begins with its own clause-force `/h/`. Main-clause `/h/` units stay in the main clause and do not float into the dependent clause.

## Quotations

When quoting someone, using a proper noun, using a foreign word, or using a slang word, you must use the square brackets \[ \]. Begin-quote, end-quote, and escape forms are **/x/-prefixed** words (the dictionary lists the specific forms). On the off chance you need to use a quotation marker word within the quotation, it is escaped with \\ or the escape form immediately before it. These spoken forms are probably not needed in casual speech, but can be helpful if speaking with voice-to-text or if you want to emphasize the quoting. 

# References: unambiguous pronouns

Pronouns replace definite articles: once something has been introduced, you refer back with a pronoun (or an alternate construct below), not with a separate “the X” form.

## Letter-based anaphoric pronouns

An anaphoric pronoun can refer back to **any prior word** (noun, verb, adjective, adverb, and so on — not only arguments). It is built from a **fixed prefix of that word’s root**, cut **up to and including the 2nd vowel**, plus the usual part-of-speech prefix and the pronoun lexical ending **-r**. (Roots are `V(CV)+`, so the stem is typically the opening `VCV`.) The pronoun’s PoS prefix is whatever role you need **now**; it need not match the antecedent’s original PoS.

Resolution is always unambiguous for the listener and for a parser: a **-r** pronoun refers to the **most recently mentioned matching** antecedent — the most recent word whose root begins with that stem. There is no guesswork about which match was meant.

**Mention = any word use in the discourse** (any part of speech), including pronoun uses themselves. Resolving a pronoun counts as a new mention of that referent and makes it the most recent again.

It is the **speaker’s** job to ensure the intended referent is the most recent match. Use the letter pronoun when that is already true. If the most recent match is **not** what you intend, use the **full word**. If even the full word isn't distinct, add an **adjective / ordinal** to disambiguate. That mention becomes most recent, so later pronouns can refer to it again.

Add **-z** after the lexical ending to mark **plural**: the **group containing** the referent. Example: `…r` refers to one noun; `…rz` refers to the group that includes that noun. The same **-z** works on full words (`…lz`, etc.).

There are no English-style 3rd-person pronouns (*he* / *she* / *it* / *they*) and no impersonal *one*.

## Special pronouns

Forms TBD. Roles:

* **Speaker** (1st person)
* **Listener** (2nd person)
* **Generic single person** (a nonspecific individual — not impersonal *one*)
* **Next clause** (used for dependent clauses; see above)
* **Interrogative pronoun** (who/what/where) all use same root

**Group containing** a referent is not a separate special pronoun: append **-z** to the word (see above).

**Prefer names.** When a proper name is available, use it and/or its pronoun — including for self-address — rather than the speaker/listener special pronoun. The special pronouns are for the narrow cases where a name is unavailable or undesired.

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

h /ɣ/, w /w/, g /ɡ/, d /d/, j /dʑ/, b /b/, z /z/, m /m/, n /n/, v /v/, x /ʒ/

possible clusters:
gr, gl, dr, br, bl

### Consonants at end of syllables (except end of word)

g /ɡ/, d /d/, j /dʑ/, b /b/, z /z/, m /m/, v /v/  (cannot double with the second beginning consonant)

(**x** /ʒ/ is not used as a syllable coda or as an ordinary root consonant; see compounds below.)

### Phonotactics

A word contains three parts:
1. the part of speech prefix
2. the root(s) - multiple if compound word
3. the lexical ending: literal (**-l**), metaphorical (**-m**), proper name (**-n**), pronoun (**-r**)
4. optional plural **-z** (the group containing the referent), after the lexical ending

roots have form V(CV)+
if a compound root, then **x** separates them

a) A word root almost always starts with a vowel. The ending and beginning consonants were carefully chosen so that you can never confuse which syllable a consonant belongs to (vaban must be pronounced va'ban and not vab'an because syllables never end with a consonant unless it's the end of the word).

b) All words end with a lexical ending (**-l**, **-m**, **-n**, or **-r**), optionally followed by plural **-z**. No other syllables end with a consonant, so word boundaries stay clear even when pauses are unreliable (as in singing). Allowed word-final clusters are those endings plus **-z** (**-lz**, **-mz**, **-nz**, **-rz**).

c) Easy to tell the components of a compound word because **x** separates them. Mid-word **x** is only the compound joiner (never part of a root); word-initial **x** is the discourse-marker prefix.
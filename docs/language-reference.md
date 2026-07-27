# Reference Document for Clarity v0.7

# Introduction

Clarity is a language designed to encode psychological concepts and techniques that have been scientifically proven to improve your life. The encoding is done primarily through carefully selecting the vocabulary so that when you are trying to apply those concepts, it will nudge you in a better direction. For example, there are two words for *to say*. One means "they literally said" and the other "I perceived the meta-message to be" This division helps the listener realize when they are applying their own interpretation on a message, and it helps the speaker to be more mindful of what meta-messages (attitude toward the recipient) they could be construed as sending.

When I say that Clarity helps you improve your life, I mean that it improves these three broad categories:

(1) Love. Clarity encodes self acceptance and acceptance of others by highlighting when judgments are taking place. For example: the personal possessive adjective (my) in Clarity has a form that means “the speaker is grateful for this” because frequent gratitude is scientifically shown to increase happiness — implemented as a [value](values.md) on `/w/` (`…xa…` = serves a named need).

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

A difficult problem for computationally parsing a sentence is figuring out what vague pronouns like English *it* refer to. Clarity avoids that by forming anaphoric pronouns from a fixed prefix of **any** prior word’s root (through the 2nd vowel), resolved to the **most recently mentioned matching** antecedent (see [pronouns.md](pronouns.md)), plus a small set of special pronouns for discourse roles. There are no vague person/number pronouns in the English sense.

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

Every sentence begins with an **utterance-frame** `/j/` cluster that includes **clause force** (see [Utterance markers](#utterance-markers-j)); that fixed left edge is how sentence boundaries stay clear under free word order. After that opener, the standard order is Subject \- Direct Object \- Verb. Order of those core roles can change for stylistic reasons (including **focus**), or due to certain constructs like dependent clauses. Adjectives (`/ɡ/`) go **after** what they modify by default, or **before** when marked left-bound (**`gl-`** — see [Adjectives](#adjectives-ɡ)). Adverbs (`/h/`) may appear anywhere in the clause (see below).

## Part-of-speech prefixes

| Prefix | Role |
|--------|------|
| /z/ | subject (noun) |
| /d/ | direct object (noun) |
| /b/ | argument noun (of a complex adjective or adverb) |
| /v/ | verb |
| /ɡ/ | adjective |
| /w/ | adjective adjunct (modifies the previous `/ɡ/`) |
| /h/ | adverb (mood / tense / evidentiality, adjuncts) |
| x /ʒ/ | discourse marker (sentence linkers, discourse-only [span](quotations.md) opens, span closes **`xuxul`** / **`xuxum`**, …) |
| j /dʑ/ | utterance marker (clause force, vocative, interjection) |

There is no dedicated indirect-object prefix. Recipients and beneficiaries (English *to* / *for*) are expressed with a complex adverb (`/h/` + `/b/`) plus an argument noun, the same pattern as other verb-level prepositional-phrase meanings.

## Nouns and verbs

Nouns can stand alone as core arguments of the clause. Verbs mark the action.

Subject (/z/) \- the thing doing the action  
Direct Object (/d/) \- the thing on the receiving end of the action  
Verb (/v/) \- the action being done. [Ability / incapability](special-vocabulary.md#ability) compounds onto the verb root when that is the denied activity (`v-singxun` = can’t sing, fixed); hostless *can’t* uses floating **`h-ABIL…`**.

There is **no** general *to-be* verb. [Classification](predication.md#classification) (*Sam is a teacher*) and absolute property claims (*Sam is big*) are **zero-copula**: subject + predicative `/ɡ/`. [Identity](predication.md#identity) (*Clark is Superman*) uses closed complex **`g-SAME`** + `/b/`. Full rules: **[predication.md](predication.md)**.

## Adjectives (`/ɡ/`)

`/ɡ/` marks **adjectives** (and noun-level relational phrases). Predicative use (property or kind ascription without `/v/`) is [zero-copula](predication.md#zero-copula).

**Default (right-bound):** the adjective goes **after** the word it modifies (`z-dogl g-bigl` = *a big dog*). Attachment is to the **previous** eligible host.

**Left-bound (`gl-`):** insert **l** as the second letter of the word — PoS `/ɡ/` + **l** + root + reference suffix — forming the onset cluster **`gl-`** (already legal in [phonology](phonology.md#phonotactics)). That adjective goes **before** its host and binds the **next** eligible host (`gl-bigl z-dogl` = *a big dog*). Only `/ɡ/` may take this mid-word **l**; other PoS prefixes have no left-bound **l** form.

The contiguous adjective unit is the same in both orders: simple `/ɡ/`, or complex `/ɡ/` + `/b/`, plus any following `/w/` stack on that `/ɡ/`. Left-bound marks the `/ɡ/` word; `/b/` and `/w/` still follow that `/ɡ/` (`gl-ofl b-Samn z-dogl` = *Sam’s dog*; `gl-bigl w-veryl z-dogl` = *a very big dog*). Do not invent `wl-` or `bl-` for left attachment.

Left-bound is optional style (meter, focus, L1 comfort). Prefer default postposed order in neutral prose. On [phrase fences](coordination.md#scope-fence-p-coord), ordinary `/ɡ/` in the SHARED slot under **`a`** **distributes** over conjuncts when gradable (`zal g-bigl z-Samn z-Lean` = *Sam and Lea are big*) or is whole-phrase description when non-scalar (`zam g-ofl b-Samn z-dogl z-catl`); SHARED `/ɡ/`…**-sh** under **`a`** is [**collective**](plurality.md#collective-ascription) (*heavy together* — `zal g-heavylsh z-boxl z-cratel`); under **`ae`**, SHARED scale `/ɡ/` is [equative](comparatives.md#equatives) (`zael g-bigl z-Samn z-Lean` = *as big as*); under invert **ua** / **uo**, SHARED `/ɡ/` is the [kind / domain](coordination.md#universals-domains-generics) (`zual g-catl` = *every cat*); under ranked **`e` / `oe` / `ue`**, SHARED `/ɡ/` is the [comparison scale](comparatives.md) (`zel g-bigl z-Samn z-Lean` = *Sam is bigger than Lea*; focus `zel g-bigl z-Samn` = *Sam is the biggest*; bare `zoel g-bigl` = *there is no biggest*; bare `zel g-bigl` = *unspecified who’s biggest*); under **`a` / `e` / `ue` / `ua`** with exactly two number endpoints, SHARED continuum `/ɡ/` is a [numeric span](numbers.md#ranges) (`zel g-agel z+3l z+5l` = *from age 3 to 5*; bare `zel z+3l z+5l` = preference). Scale and continuum `/ɡ/` stay singular (no **-sh**). `gl-` after a left fence binds only the **next** conjunct (`zam gl-bigl z-dogl z-catl` = *(big dog) and (cat)*).

## Adjective adjuncts (`/w/`)

`/w/` marks a word that **modifies the previous adjective** (`/ɡ/` unit). It does not modify the verb or the noun directly. **Default content reading is a [value](values.md)** (need ascription on that property: gratitude, judgment, …). Other closed subcategories stay non-value: degree (*very*, *slightly*), tense/mood/evidentiality scoped only to that property (*former* / *recent*, *alleged*, and the same mood roots as `/h/` when the framing applies just to the adjective), hostless [ability](special-vocabulary.md#ability) (`w-ABILxu…`), and [restrictor](restrictors.md) joins. Ability on a property root itself uses host+`xa`/`xu` on that `/ɡ/` (`g-leadxun`).

The `/w/` word sits on its host: normally immediately after the `/ɡ/` (or after that `/ɡ/`’s contiguous `/b/` argument if the adjective is complex) — including when that `/ɡ/` is left-bound (`gl-…`). Unlike `/h/`, `/w/` does **not** float. Several `/w/` words may **juxtapose** on one `/ɡ/` (`g-happy w-recent w-very`); each applies to that same adjective — that is ordinary co-stacking, **not** a join fence. `/w/` words are typically simple (no `/b/` argument); if a relation needs an argument, use a complex adjective (`/ɡ/` + `/b/`) instead.

Prefixed `/w/` **joins** (`wal` / `wam` / …, `war` / …) are **not** sibling adjunct *and*. They are [restrictors](restrictors.md) on when the host adjective applies (`wal` → *never* for that property; `wal w-allegedl` → *only when alleged*). Same fence rules; `/w/` exact parallel of `/h/` (**defined core** only).

Same root, different prefix → different scope: `/h/` frames the clause; `/w/` frames only the preceding adjective.

## Adverbs (`/h/`)

`/h/` marks **adverbs** (modifiers of the verb or clause). **Default content reading is a [value](values.md)** (clause-level need: motive, ought-stake, event judgment). Other closed subcategories stay non-value: manner, time/place adjuncts, recipients (*to* / *for*), topic/aboutness frames (*as for* / *regarding*), mood/tense/evidentiality (including [COMMENT](special-vocabulary.md#comment) / mindfulness noting), hostless [ability](special-vocabulary.md#ability) (`h-ABILxu…`), [restrictor](restrictors.md) joins, and [number](numbers.md) words under `/h/`. Ability on an event root uses host+`xa`/`xu` on `/v/` (`v-singxun`), not a floating `/h/` copy of that root. Example mood form: “h vizinin” means “I remember the events of this sentence (which occurred in the past).” Clause force is **not** `/h/`; it is an utterance marker (`/j/`).

Because `/h/` always targets the clause’s verb, **position is free within the clause** (before/after arguments, next to the verb, clause-final, etc.) for style, focus, or meter. `/h/` material must stay inside its own clause: it must not float into a following sentence or into a trailing dependent clause (dependent clauses stay at the end; see below).

**Co-applying adverbs** (manner, mood, …) **juxtapose** with no join: `h-quicklyl h-quietlyl` → *quickly and quietly*. Prefixed `/h/` **joins** (`hal` / `ham` / …, `har` / …) are [restrictors](restrictors.md): they say **when / under which cases** the clause holds (`hal` → *never*; `hal h-rainl` → *only when raining*; `hual` → *always*). Only a **defined core** is used; other reserved `/h/` spellings are undefined there. Complex `/h/`+`/b/` units may be circumstance conjuncts; next-clause *when* / *if* stays `/h/`+`/b/` next-clause pronoun (not this fence series for now).

**Topic** (*as for X*, *regarding X*) is a complex adverb: `/h/` + `/b/` topic noun (lexicon role: aboutness). There are **no dedicated focus markers**; highlight by rearranging free word order (and ordinary intensifiers like *only* / *especially* if needed). Topic/focus are not `/x/` discourse markers.

English-looking **epistemic hedges** that really mark how you know or how strong the claim is (*apparently*, *supposedly*, *allegedly*, *maybe*, *perhaps*) are **mood/evidentiality**, not discourse markers: use `/h/` for the whole clause, or `/w/` when the framing applies only to the preceding adjective (e.g. *alleged*). Do not put them under `/x/`.

There is **no fixed scope-band order** among multiple `/h/` units. Each adverb’s contribution (mood/evidential, time/place/recipient adjunct, manner, and so on) comes from its **lexicon role**; spoken order is free for style and does not reorder those roles. If two units of the same role need a relative ranking, left-to-right in the spoken order breaks the tie. Circumstance **ranking** of cases uses the `/h/` ranked restrictor series (`hel` / …), not bare juxtaposition order.

## Complex adjectives, complex adverbs, and argument nouns

A **complex adjective** or **complex adverb** takes an extra participant: the adjective or adverb word plus an **argument noun** (`/b/`). The argument immediately follows the adjective or adverb. That word carries the relation; `/b/` only marks “argument of that adjective or adverb” (the dictionary entry says how it relates to the host).

- **Complex adjectives** use `/ɡ/` + `/b/` (e.g. possessive owner, “book *on* the table”).
- **Complex adverbs** use `/h/` + `/b/` (e.g. recipient *to*, “happened *at*”, topic *regarding*, adverbial subordination *because* / *if* with the [next-clause pronoun](pronouns.md#special-pronouns) as `/b/`). The `/h/` + `/b/` pair is one unit and **stays contiguous** even when that unit floats.

Example (recipient): `/h/` *to* + `/b/` recipient may sit anywhere in the clause as a pair. Example (topic): `/h/` *regarding* + `/b/` topic noun likewise floats as a pair. Example (cause): `/h/` *because* + `/b/` next-clause pronoun, with the reason sentence last.

After a complex adjective or adverb, the argument is the new noun for further adjective modification: a simple `/ɡ/` after `/b/` describes the argument, not the original host. `/w/` after a `/ɡ/` (+ optional `/b/`) grades or frames that adjective, not the noun. You can chain by having a complex adjective or adverb modify another complex adjective/adverb or its argument. You can’t have two complex adjectives affect the same noun; if you need that, describe the noun further in a separate sentence. Multiple `/h/` units on the same verb are allowed (each simple `/h/` or contiguous `/h/`+`/b/` counts as one unit); each unit’s role is read from the lexicon as above.

Complex adjectives and adverbs cover what would be prepositional phrases in other languages. A verb used as a complex adverb with a `/b/` argument can form a simple dependent-clause-like adjunct (the `/b/` argument is the clause’s subject-like participant).

## Utterance markers (`/j/`)
<a id="utterance-markers-j"></a>

Marked with j /dʑ/. These frame the **utterance**, not the verb: **clause force**, **vocatives** (direct address), and **interjections** (exclamations, greetings, and similar). The dictionary lists the forms and which subclass each root belongs to.

### Left-edge order and sentence boundaries

The left edge of a sentence is a `/j/` cluster in this order:

1. Optional **vocative**(s) — who is addressed (*Sam*, *everyone*, …)
2. Optional **interjection**(s) — *wow*, greetings, and other expressives
3. Required **clause force** — the speech act (see below); **last** in the cluster, immediately before the clause body

Clause force closes the opener and does not appear in the clause body. A new clause-force `/j/` (after any vocatives/interjections of the new sentence) starts a new sentence. That is how sentence boundaries stay unambiguous under free word order.

**Vocatives and interjections appear only in this left-edge cluster** (or as bare utterances below). They must not occur mid-clause or at the end of a sentence — otherwise a trailing `/j/` could be read as either the end of the current sentence or the start of the next. After a clause body, any non-force `/j/` begins the next utterance’s opener. Mid-sentence asides use [aside fences](quotations.md) (prefer `/h/`: `hexal` / `h(…)` / … + `xuxul`), not floating `/j/`.

Bare vocatives and exclamations with no clause (e.g. only calling a name, or only *wow*) use `/j/` without clause force.

### Clause force
<a id="clause-force"></a>

Every full sentence includes exactly one **clause-force** `/j/`. Forms are **`j` + join vowel + ending** (same letter jobs as [join series](coordination.md#join-type-vowel-series)): vowel = illocution frame; **-l** = closed / committed; **-m** = open / soft. Do **not** use **-n** or **-r** on force (**-r** stays on body joins for unspecified-member / fill-ask).

| Form | Force | Letter logic |
|------|--------|----------------|
| **jal** | **statement** — assertoric claim or description | **a** inventory / holds + **-l** stand behind |
| **jam** | **hedged statement** — tentative / provisional assert | **a** + **-m** open |
| **jol** | **question** — yes/no **and** content / fill-ask; formerly *polar question* — **[questions.md](questions.md)** | **o** menu / pick-one + **-l** |
| **jom** | **soft question** — wonder, gentle ask, offer-like question | **o** + **-m** |
| **jel** | **imperative** — command / instruction | **e** ranked priority + **-l** |
| **jem** | **request** — soft directive (*please…*) | **e** + **-m** |
| **jul** | **prohibition** — *don’t…* (closed) | **u** negation + **-l** |
| **jum** | **soft prohibition** — *please don’t…* / *I’d rather you not…* | **u** + **-m** |



**Numbers are not clause force.** A `/j/` number word is an [interjection](numbers.md#number-as-interjection-by-marker) (*N more!*, deficit/shortfall call, digit-label / score call, place cheer). It may sit in the left-edge cluster before force, or stand alone as a bare utterance with no force.

Interrogative grammar (yes/no vs fill-ask, multi-gap **fill-all**, focus/bare under **jol** / **jom**): **[questions.md](questions.md)**.

## Phrase-level, VP-level, and clause-level joins

There is **no** prefix-less **join** series. **`/z/` `/d/` `/b/` `/ɡ/` `/v/` `/x/`** + the join vowels + ending (`zam`, `dol`, `bem`, `gam`, `vam`, `xam`, `zar`, `zor`, `zer`, `zur`, `var`, `xar`, …) join same-slot phrases, VPs, or sentences with a **fence** (shared modifiers immediately after the join — left preferred: `zam g-ofl b-Samn z-dogl z-catl` = *Sam’s (dog and cat)*; right close allowed; nesting: left stack = right-assoc `vol A val B C` = *A or (B and C)*, right stack = left-assoc `A B vol C val` = *(A or B) and C*; **pure infix illegal**). **`/h/`** and **`/w/`** use the **same fence forms** as [restrictors](restrictors.md) (defined core: `hal` = *never*, `hal h-rainl` = *only when raining*, `hual` = *always*, `har` = *sometime* (under question → *When?* — [questions.md](questions.md#circumstance-when)); sibling manner/adjunct *and* is **juxtaposition**; other `/h/`/`/w/` join spellings reserved but undefined). On VP chains, `/h/` before a left fence scopes over all VPs; `/h/` inside a conjunct scopes that VP only. **-l** / **-m** = closed/open on every join vowel (**a** / **o** / **u** / **ao** / **e** / **ae** / **oe** / **ua** / **uo** / **ue**); phrase **-n** = named; clause soft **-n** = *and then…* **`xan`** / uncertain reconstruction / soft ranking; VP `-n` = [join-act verbs](special-vocabulary.md#join-act-verbs); **-r** on **a** / **o** / **e** / **u** at all levels = [unspecified-member](coordination.md#unspecified-member-r-phrase) (`zar` / `zor` / `zer` / `zur` / `var` / `vor` / `ver` / `vur` / `xar` / … = *something* / *anything* / *whatever-by-rank* / *something else* (other than) — VP *do something*, clause *something happened*; under [question](questions.md) = fill-ask; under `/h/` `/w/` = *sometime* / *anytime* / … — *When?* under question: [questions.md](questions.md#circumstance-when)); **e** / **oe** / **ue** are **directional **rank join (**e** / **oe**: earlier ≻ later; **oe** = exclusive; **ue** = rank reversal); **ae** = **equality / tie** (multi + SHARED scale = [equative](comparatives.md#equatives); bare **ae** = draw). On NP fences, SHARED scale `/ɡ/` under **`e` / `oe` / `ue`** = [comparatives](comparatives.md) (multi = *bigger than*; focus **`e`** = **superlative** — `zel g-bigl z-Samn`; bare **`oe`** = **empty superlative** — `zoel g-bigl`; bare **`e`** + scale = unspecified top — `zel g-bigl`); under **`ae`** multi = *as … as* — `zael g-bigl z-Samn z-Lean`; under **`a`** = distributive — `zal g-bigl z-Samn z-Lean`; plain **u** = [negation](coordination.md#negation-u) (focus *not X*, multi *none of*, bare *no*; no separate `/h/` “not” root); leading **u** on **a** / **o** / **e** = [invert](coordination.md#invert-u-stacks) (`ua` = *everything but*; `uo` = *anything but*; `ue` = **rank reversal**, later ≻ earlier — not plain **u** [negation](coordination.md#negation-u) (*not* / *none of* / *no*); no three-vowel stacks; empty-allowed / *or none* on plain **o** + **-m** only (`zom` / `vom` / `xom` = at most one; `zol` / `vol` / `xol` = exactly one — [coordination.md](coordination.md#empty-allowed-om)); **-m** on other join vowels does not imply *or none*). Phrase focus / bare: **…em** / **…el** / **…ael** / **…aem** / **…aen** / **…oem** / **…oel** / **…uem** / **…uel** / **…en** / **…al** / **…am** / **…an** / **…ol** / **…om** / **…ual** / **…uam** / **…uol** / **…uom** / **…aol** / **…aom** / **…ul** / **…um** / **…un** / **…ar** / **…or** / **…er** / **…ur** (focus: *X first* / *only X matters* / *try X first* / *only try X* / *X last* / *not X* / *everything but X* / *anything but X* / …; bare: *unspecified ranking* / *nothing comes to mind* / *null* / *no options* / *no* / *everything* / *anything (goes)* / …; **…an** = *null* / *void*, **…aen** = *it’s a draw*, **…en** = *unspecified ranking* (stock), **…ar** = *something*, **…or** = *anything*, **…er** = *whatever-by-rank*, **…ur** = *something else*, **…un** = named/conventional *not X* / *no* — [coordination.md](coordination.md#focus-phrase); under `/h/` `/w/`: `hal` = *never*, `hual` = *always*, `hael` = *equally often*, … — [circumstance](restrictors.md); VP/clause focus/bare on **-r** and on negation **…ul** / **…um** / soft **…un**; interrogative readings: [questions.md](questions.md)). Correlatives come later.

**Revisers:** prefix-less **al** / **am** / **an** / **el** / **em** / **en** / **ol** / **om** / **on** / **ul** / **um** / **un** (**-l** / **-m** / **-n** required: closed/open right-hand side or named/conventional; bare **a** / **e** / **o** / **u** illegal) revise a fixed same-slot **A** with one or more right-hand sides in parallel (`A am B ul C` = including B and except C; not nested). Not list joins and not sentence linkers. Joins: **[coordination.md](coordination.md)**. Revisers: **[revisers.md](revisers.md)**. Restrictors: **[restrictors.md](restrictors.md)**.

## Discourse markers (`/x/`)

Marked with x /ʒ/. Used for **discourse glue** that is not same-slot phrase/VP joins: sentence linkers (*however*, *therefore*, *meanwhile*, *but*, …), and related fences. **Span fences** ([quotations.md](quotations.md)) **open** with any PoS for the slot they fill (`daxal` … = object quote; `daxan` = atomic; `daxar` = *that* quote; `hexal` … = aside; `duxal` … = opaque; `xaxal` … = discourse-only quote); **escape** with **`xoxol`** (next token raw); **close** with **`xuxul`** / **`xuxum`** under this prefix. The dictionary lists linker roots. The same sound **x** also joins roots inside compound words and inside span-fence markers (see [Phonotactics](phonology.md#phonotactics)); it is not used as an ordinary root consonant, so mid-word **x** always means “next root,” and word-initial **x** always means discourse-marker PoS.

Phrase-level *and* / *or* / *none of* / *and/or* / ranked / invert joins are **not** general `/x/` linkers — they use `/z/` `/d/` `/b/` `/ɡ/` + the join vowels + ending (`zam`, `gam`, `zar`, `zor`, `zer`, `zur`, `zel`, `zael`, `zoel`, `zual`, `zuol`, `zuel`, …) with a **fence** (left preferred; right close allowed — [coordination.md](coordination.md)). **`/h/`** / **`/w/`** use those same forms as [restrictors](restrictors.md) (`hal` / `wal` / …). VP-level uses `/v/` (`vam`, `var`, `vel`, `vael`, `voel`, `vual`, `vuol`, `vuel`, …) — same fence; **-r** = unspecified action (*do something*). Clause-level forms **are** `/x/` + the same vowels + ending (`xal`, `xar`, `xel`, `xael`, `xoel`, `xual`, `xuol`, `xuel`, …) — see [coordination.md](coordination.md#clause-level-coordination).

`/x/` connects or fences discourse; it does **not** carry evidential or epistemic framing of the claim. Softeners that encode source-of-knowledge or claim strength stay `/h/` or `/w/` (see [Adverbs](#adverbs-h)). Contrast: *however* / *in other words* → `/x/`; *apparently* / *allegedly* → `/h/` or `/w/`.

**Numbered list / enumeration markers** are `/x/` + [number word](numbers.md#number-as-discourse-marker-by-marker) (*point N:* neutral, *corroborating N:*, *independent N:*, *re item 12*). Marker vowel chooses independence framing (or cite-as-label); details live in numbers.md.

**Not `/x/`:** phrase-level and VP-level joins ([coordination.md](coordination.md)) and [revisers](revisers.md); English-style subordinators that relate a following clause to a slot in the main clause (*if*, *because*, *although*, *while*, *until*) — those use the [next-clause pronoun](pronouns.md#special-pronouns) plus a lexicon relation (usually `/h/` + `/b/`), not a discourse-marker prefix. `/x/` sentence linkers (*therefore*, *however*, *meanwhile*) and number enumeration markers do not fill a main-clause argument or adjunct slot.

## Dependent Clauses

Dependent clauses use a [next-clause special pronoun](pronouns.md#special-pronouns) (form TBD): it stands in the main clause for “whatever the next sentence says.” The dependent material is itself a **full sentence** and begins with its own `/j/` cluster (optional vocative(s) and interjection(s), then clause force). To keep boundaries clear under free word order and to reduce nesting load, the dependent sentence **must come at the end** of the main sentence — rearrange word order if needed. Main-clause `/h/` units stay in the main clause and do not float into the dependent clause.

The next-clause pronoun takes whatever PoS prefix the slot needs:

* **Complement / content clause** — usually a core argument. Example: *I told him that…* → next-clause as direct object (`/d/`) of *tell* (or another role the verb requires).
* **Adverbial relation** (*because*, *if*, *although*, *while*, *until*, …) — a complex adverb: `/h/` relation word + `/b/` next-clause pronoun. The lexicon entry names the relation; there is **no** separate `/x/` subordinator for these.

`/x/` is only for discourse glue that does **not** occupy a main-clause argument or adjunct slot (sentence linkers, discourse-only [span](quotations.md) opens with PoS `/x/`, span closes **`xuxul`** / **`xuxum`**, [numbered enumeration](numbers.md#number-as-discourse-marker-by-marker)). Spans that fill a clause slot **open** with that slot’s PoS (`daxal`, `zoxal`, `hexal`, `duxal`, …). Phrase-level uses `/z/` `/d/` `/b/` `/ɡ/` `/w/` `/h/`; VP-level uses `/v/`; clause joins uses this vowel series under `/x/` ([coordination.md](coordination.md)). Do not encode *because* / *if*-style subordination as `/x/`.

# Reference Suffix

Reference suffix grammar (**-l** / **-m** / **-n** / **-r**) lives in **[reference-suffix.md](reference-suffix.md)**. Compact multipart proper names (given+family, *New York*) are mid-word **`x`-compounds** with one ending — [phrasal proper names](reference-suffix.md#phrasal-proper-names) — not adjacent bare same-PoS **-n** words. Long / mixed-PoS work titles stay [mention](quotations.md) spans.

# Plurality

Plural grammar (**-sh** after the reference suffix: group referent on nouns / event-sets / vocatives; **collective** ascription on `/ɡ/`; unused on `/w/` `/h/` `/x/` and number words) lives in **[plurality.md](plurality.md)**. Generics and *every K* use invert **ua** with SHARED kind (`zual g-catl`), not **-sh** — [coordination.md](coordination.md#universals-domains-generics). Habitual / characterizing pattern uses **`hual`**, not adjective **-sh**.

# Pronouns

Pronoun grammar (anaphoric **-r** forms, special pronouns) lives in **[pronouns.md](pronouns.md)**.

# Numbers

Numeral grammar (digit roots, [digitless / zero-group forms](numbers.md#zero-digit-groups), engineering/scientific forms, ordinals, digit-strings, `/x/` enumeration, number-word shape, [percent denominators](numbers.md#percent-denominators), [ranges](numbers.md#ranges) / [thresholds](numbers.md#numeric-thresholds) / [measure phrases](numbers.md#measure-phrases)) lives in **[numbers.md](numbers.md)**.

# Comparatives, superlatives, and equatives

Scalar comparison (ranked **`e` / `oe` / `ue`** *more / …-est*, **`ae`** *as … as*, distributive **`a`** + SHARED `/ɡ/`, measured differentials, [judgment benchmarks](comparatives.md#judgment-benchmarks) *worse than Average|…* via **`ue`** + closed **-n** comparees): **[comparatives.md](comparatives.md)**. Measure NP shape (unit + amount): **[numbers.md § Measure phrases](numbers.md#measure-phrases)**.

# Predication (classification and identity)

Zero-copula **classification** / property ascription (`jal z-Samn g-teacherl`) and closed **`SAME`** **identity** (`jal z-Clarkn g-SAMEl b-Superman`): **[predication.md](predication.md)**. Not scalar equative `ae`; no general *to-be* `/v/`.

# Phrase-level, VP-level, and clause-level joins

Phrase-level **zam** / **gam** / …, VP **vam** / **var** / … (joins **-l** / **-m** / **-r**; VP `-n` = [join-act verbs](special-vocabulary.md#join-act-verbs); `/ɡ/` `/h/` `-n` = [join-relations](special-vocabulary.md#join-relations)), and clause `/x/` + vowel + ending (soft **-n** ≠ named **-n**; *and then* = **`xan`**; **-r** = unspecified-member at all levels): **fence** (left preferred, right close for style/comedy; shared modifiers immediately after the join; [fence nesting](coordination.md#fence-nesting)); SHARED scale `/ɡ/` = [comparatives / equatives](comparatives.md) (`zel g-bigl z-Samn z-Lean` / `zael g-bigl z-Samn z-Lean` / `zal g-bigl z-Samn z-Lean` = distributive *both big* / `zal g-heavylsh z-boxl z-cratel` = [collective](plurality.md#collective-ascription) / focus `zel g-bigl z-Samn` / bare `zoel g-bigl` = *no biggest*); SHARED continuum `/ɡ/` + two number endpoints = [number ranges](numbers.md#ranges) (`zel g-agel z+3l z+5l` = *from age 3 to 5*; bare `zel z+3l z+5l` = preference); invert **ua** SHARED `/ɡ/` = [kind domain / generics](coordination.md#universals-domains-generics) (`zual g-catl` = *every cat*; `hual` = habitual *always*); prefix-less **al** / **am** / **an** / **el** / … (**-l** / **-m** / named **-n** required; parallel chains on A) = revisers (*including* / *rather* / *instead* / *except*): **[coordination.md](coordination.md)**. Number ranges and measure phrases: **[numbers.md](numbers.md)**. No bare word-level joins.

# Questions

Interrogative forces (**jol** / **jom**), yes/no vs fill-ask, multi-gap **fill-all**, and focus/bare under question: **[questions.md](questions.md)**.

# Quotations, mentions, and asides

Span fences: **open** `{PoS}{TYPE}x{EDGE}{ENDING}` (writing = PoS + `[…]` / `{…}` / `(…)` / `<…>` with **`~`** = paraphrase; TYPE **a** quote / **e** aside / **o** mention / **u** opaque; EDGE **a** multi / **e** clause-scoped / **u** empty; escape **`xoxol`** (EDGE **o**); **-l** exact / **-m** paraphrase / **-n** atomic / **-r** span anaphor (*that* quote); e.g. `daxal` / `daxan` / `daxar` / `d[…]` / `d[hi]` / `d[·]`); **close** **`xuxul`** (pop one) / **`xuxum`** (pop all): **[quotations.md](quotations.md)**.

# Values

Ordinary **`/h/`** / **`/w/`** content defaults to **values** (needs): **topic** (bare need) or compound **`need x {a\|e\|o\|u}`** = **met** / **motive** / **prescription** / **unmet**; endings = **contact channel** on **`xa`**, **preference standing** on **`xe`**, **prescription force** on **`xo`** (invite / endorse / commit / bound), or **changeability** on **`xu`**. **[values.md](values.md)**.

# Special vocabulary

Closed non-need **ability** / **incapability**: primary compound **`HOST x {a\|u}`** with **changeability** endings (`v-singxun` = can’t sing, fixed); fallback closed **`ABIL x {a\|u}`** when hostless / clause-wide; **`xe`** / **`xo`** undefined. **Role compounds**: **`{a\|u\|o} x ROOT`** = **agent** / **patient** / **reltum** of an event or relation root (`z-axattackr` = *the attacker*; `d-uxattackr` = *the one attacked*; bare `z-attackr` = *that attack*); **`e x …`** reserved; ordinary **-l/-m/-n/-r**. **Join-act verbs**: closed defective `/v/`…**-n** (`van` / `von` / …) enact the join-series move on an object — not VP soft joins; *and then* = clause **`xan`**. **Join-relations**: closed defective `/ɡ/` `/h/`…**-n** (`gan` / `han` / …) = complex adj/adv with unary `/b/` (*including* / *with* / *without* / …) — not named AP lists (use [mention](quotations.md) for stock bundles). **Plan / predict**: closed mood roots **`PLAN`** / **`PREDICT`** under `/h/` — **not** `x`-compounds; predict stacks with ordinary evidentiality. **Emotion compose**: drop opaque emotion-for-judgment; stack ordinary [value](values.md) + closed **ACT** (high/med/low) + **LOCUS** (internal/external/circumstantial) — **not** a parallel `x`-system. **COMMENT** (mindfulness noting): one mental-commentary mood; six synonymous `/h/` noting exponents (looking / hearing / feeling / smelling / tasting / minding) — **not** separate fear/hope moods. **[special-vocabulary.md](special-vocabulary.md)**. Mid-word **`x`** parser families: **[x-compounds.md](x-compounds.md)**.

# Phonology and Phonotactics

Phonology, syllable structure, and phonotactics live in **[phonology.md](phonology.md)**. Mid-word **`x`** family disambiguation: **[x-compounds.md](x-compounds.md)**.
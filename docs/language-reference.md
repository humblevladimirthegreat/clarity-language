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

Every sentence begins with an **utterance-frame** `/j/` cluster that includes **clause force** (see [Utterance markers](#utterance-markers-j)); that fixed left edge is how sentence boundaries stay clear under free word order. After that opener, the standard order is Subject \- Direct Object \- Verb. Order of those core roles can change for stylistic reasons (including **focus**), or to put a [next-clause pronoun](#dependent-clauses) **matrix-final** before a trailing dependent. Adjectives (`/ɡ/`) go **after** what they modify by default, or **before** when marked left-bound (**`gl-`** — see [Adjectives](#adjectives-ɡ)). Adverbs (`/h/`) may appear anywhere in the clause (see below) except a next-clause `/h/`+`/b/` unit, which is matrix-final.

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
| x /ʒ/ | discourse marker (sentence linkers, discourse-only [span](spans.md) opens, span closes **`xuxul`** / **`xuxur`** / **`xuxun`** / **`xuxum`**, …) |
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

Left-bound is optional style (meter, focus, L1 comfort). Prefer default postposed order in neutral prose. On [phrase fences](coordination.md#scope-fence-p-coord), ordinary `/ɡ/` in the SHARED slot under **`a`** **distributes** over conjuncts when gradable (`z-Samn z-Lean zal g-bigl` = *Sam and Lea are big*) or is whole-phrase description when non-scalar (`z-dogl z-catl zam g-ofl b-Samn`); SHARED `/ɡ/`…**-sh** under **`a`** is [**collective**](plurality.md#collective-ascription) (*heavy together* — `z-boxl z-cratel zal g-heavylsh`); under **`ae`**, SHARED scale `/ɡ/` is [equative](comparatives.md#equatives) (`z-Samn z-Lean zael g-bigl` = *as big as*); under invert **ua** / **uo**, SHARED `/ɡ/` is the [kind / domain](coordination.md#universals-domains-generics) (`zual g-catl` = *every cat*); under ranked **`e` / `oe` / `ue`**, SHARED `/ɡ/` is the [comparison scale](comparatives.md) (`z-Samn z-Lean zel g-bigl` = *Sam is bigger than Lea*; focus `z-Samn zel g-bigl` = *Sam is the biggest*; bare `zoel g-bigl` = *there is no biggest*; bare `zel g-bigl` = *unspecified who’s biggest*); under **`a` / `e` / `ue` / `ua`** with exactly two number endpoints, SHARED continuum `/ɡ/` is a [numeric span](numbers.md#ranges) (`z+3 z+5 zel g-agel` = *from age 3 to 5*; bare `z+3 z+5 zel` = preference). Scale and continuum `/ɡ/` stay singular (no **-sh**). `gl-` after a left fence binds only the **next** conjunct (`z-dogl z-catl zam gl-bigl` = *(big dog) and (cat)*).

## Adjective adjuncts (`/w/`)

`/w/` marks a word that **modifies the previous adjective** (`/ɡ/` unit). It does not modify the verb or the noun directly. **Default content reading is a [value](values.md)** (need ascription on that property: gratitude, judgment, …). Other closed subcategories stay non-value: degree (*very*, *slightly*), tense/mood/evidentiality scoped only to that property (*former* / *recent*, *alleged*, and the same mood roots as `/h/` when the framing applies just to the adjective), hostless [ability](special-vocabulary.md#ability) (`w-ABILxu…`), and [restrictor](restrictors.md) joins. Ability on a property root itself uses host+`xa`/`xu` on that `/ɡ/` (`g-leadxun`).

The `/w/` word sits on its host: normally immediately after the `/ɡ/` (or after that `/ɡ/`’s contiguous `/b/` argument if the adjective is complex) — including when that `/ɡ/` is left-bound (`gl-…`). Unlike `/h/`, `/w/` does **not** float. Several `/w/` words may **juxtapose** on one `/ɡ/` (`g-happy w-recent w-very`); each applies to that same adjective — that is ordinary co-stacking, **not** a join fence. `/w/` words are typically simple (no `/b/` argument); if a relation needs an argument, use a complex adjective (`/ɡ/` + `/b/`) instead.

Prefixed `/w/` **joins** (`wal` / `wam` / …, `war` / …) are **not** sibling adjunct *and*. They are [restrictors](restrictors.md) on when the host adjective applies (`wal` → *never* for that property; `w-allegedl wal` → *only when alleged*). Same fence rules; `/w/` exact parallel of `/h/` (**defined core** only).

Same root, different prefix → different scope: `/h/` frames the clause; `/w/` frames only the preceding adjective.

## Adverbs (`/h/`)

`/h/` marks **adverbs** (modifiers of the verb or clause). **Default content reading is a [value](values.md)** (clause-level need: motive, ought-stake, event judgment). Other closed subcategories stay non-value: manner, time/place adjuncts, recipients (*to* / *for*), topic/aboutness frames (*as for* / *regarding*), mood/tense/evidentiality (including [COMMENT](special-vocabulary.md#comment) / mindfulness noting, [emotion compose](special-vocabulary.md#emotion-compose) ACT / LOCUS, [plan / predict](special-vocabulary.md#plan-predict), [memory / record](special-vocabulary.md#memory-record) past framing), hostless [ability](special-vocabulary.md#ability) (`h-ABILxu…`), [restrictor](restrictors.md) joins, and [number](numbers.md) words under `/h/`. Ability on an event root uses host+`xa`/`xu` on `/v/` (`v-singxun`), not a floating `/h/` copy of that root. Example past framing: `h-uhunul` = *according to memory* (reconstructive); `h-erogel` = *on record* (captured) — [memory / record](special-vocabulary.md#memory-record). Clause force is **not** `/h/`; it is an utterance marker (`/j/`).

Because `/h/` always targets the clause’s verb, **position is free within the clause** (before/after arguments, next to the verb, clause-final, etc.) for style, focus, or meter — **except** a next-clause `/h/`+`/b/` unit, which must be [matrix-final](#dependent-clauses). `/h/` material must stay inside its own clause: it must not float into a following sentence or into a trailing dependent clause.

**Co-applying adverbs** (manner, mood, …) **juxtapose** with no join: `h-quicklyl h-quietlyl` → *quickly and quietly*. Prefixed `/h/` **joins** (`hal` / `ham` / …, `har` / …) are [restrictors](restrictors.md): they say **when / under which cases** the clause holds (`hal` → *never*; `h-rainl hal` → *only when raining*; `hual` → *always*). Only a **defined core** is used; other reserved `/h/` spellings are undefined there. Complex `/h/`+`/b/` units may be circumstance conjuncts; next-clause *when* / *if* stays `/h/`+`/b/` next-clause pronoun (not this fence series for now).

**Topic** (*as for X*, *regarding X*) is a complex adverb: `/h/` + `/b/` topic noun (lexicon role: aboutness). There are **no dedicated focus markers**; highlight by rearranging free word order (and ordinary intensifiers like *only* / *especially* if needed). Topic/focus are not `/x/` discourse markers.

English-looking **epistemic hedges** that really mark how you know or how strong the claim is (*apparently*, *supposedly*, *allegedly*, *maybe*, *perhaps*) are **mood/evidentiality**, not discourse markers: use `/h/` for the whole clause, or `/w/` when the framing applies only to the preceding adjective (e.g. *alleged*). Do not put them under `/x/`.

There is **no fixed scope-band order** among multiple `/h/` units. Each adverb’s contribution (mood/evidential, time/place/recipient adjunct, manner, and so on) comes from its **lexicon role**; spoken order is free for style and does not reorder those roles. If two units of the same role need a relative ranking, left-to-right in the spoken order breaks the tie. Circumstance **ranking** of cases uses the `/h/` ranked restrictor series (`hel` / …), not bare juxtaposition order.

## Complex adjectives, complex adverbs, and argument nouns

A **complex adjective** or **complex adverb** takes an extra participant: the adjective or adverb word plus an **argument noun** (`/b/`). The argument immediately follows the adjective or adverb. That word carries the relation; `/b/` only marks “argument of that adjective or adverb” (the dictionary entry says how it relates to the host).

- **Complex adjectives** use `/ɡ/` + `/b/` (e.g. possessive owner, “book *on* the table”).
- **Complex adverbs** use `/h/` + `/b/` (e.g. recipient *to*, “happened *at*”, topic *regarding*, adverbial subordination *because* / *if* with the [next-clause pronoun](pronouns.md#special-pronouns) as `/b/`). The `/h/` + `/b/` pair is one unit and **stays contiguous**. Ordinary pairs may float; a pair whose `/b/` is the next-clause pronoun is **[matrix-final](#dependent-clauses)** (it does not float mid-clause).

Example (recipient): `/h/` *to* + `/b/` recipient may sit anywhere in the clause as a pair. Example (topic): `/h/` *regarding* + `/b/` topic noun likewise floats as a pair. Example (cause): `/h/` *because* + `/b/` next-clause pronoun is matrix-final; the reason sentence follows immediately.

After a complex adjective or adverb, the argument is the new noun for further adjective modification: a simple `/ɡ/` after `/b/` describes the argument, not the original host. `/w/` after a `/ɡ/` (+ optional `/b/`) grades or frames that adjective, not the noun. You can chain by having a complex adjective or adverb modify another complex adjective/adverb or its argument. You can’t have two complex adjectives affect the same noun; if you need that, describe the noun further in a separate sentence. Multiple `/h/` units on the same verb are allowed (each simple `/h/` or contiguous `/h/`+`/b/` counts as one unit); each unit’s role is read from the lexicon as above.

Complex adjectives and adverbs cover what would be prepositional phrases in other languages. A verb used as a complex adverb with a `/b/` argument can form a simple dependent-clause-like adjunct (the `/b/` argument is the clause’s subject-like participant).

## Utterance markers (`/j/`)
<a id="utterance-markers-j"></a>

Marked with j /dʑ/. These frame the **utterance**, not the verb: **clause force**, **vocatives** (direct address), and **interjections** (exclamations, greetings, and similar). The dictionary lists the forms and which subclass each root belongs to.

### Left-edge order and sentence boundaries
<a id="left-edge-order-and-sentence-boundaries"></a>

The left edge of a sentence is a `/j/` cluster in this order:

1. Optional **vocative**(s) — who is addressed (*Sam*, *everyone*, …)
2. Optional **interjection**(s) — *wow*, greetings, [yes/no polarity](questions.md#yes-no-polarity) particles, and other expressives
3. Optional **discourse reviser** — prefix-less **`al` / `am` / `an` / `el` / …** (*additionally* / *in other words* / *instead* / *except*) immediately before force — [revisers.md § Discourse](revisers.md#discourse-revisers)
4. Required **clause force** — the speech act (see below); **last** in the cluster, immediately before the clause body

Clause force closes the opener and does not appear in the clause body. A new clause-force `/j/` (after any vocatives/interjections/discourse reviser of the new sentence) starts a new sentence. That is how sentence boundaries stay unambiguous under free word order.

**Vocatives and interjections appear only in this left-edge cluster** (or as bare utterances below). They must not occur mid-clause or at the end of a sentence — otherwise a trailing `/j/` could be read as either the end of the current sentence or the start of the next. After a clause body, any non-force `/j/` begins the next utterance’s opener. Mid-sentence asides use [aside fences](spans.md) (prefer `/h/`: `hexal` / `h(…)` / … + `xuxul`), not floating `/j/`.

Bare vocatives and exclamations with no clause (e.g. only calling a name, only *wow*, or a bare polar answer **`jael`** / **`juel`**) use `/j/` without clause force.

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

### Yes / no polarity (interjections)

Closed **`/j/`** polar answer particles (**`jael`** / *true*, **`juel`** / *false*, **`jaol`**, **`juol`**, **`jual`**, soft **-m** twins, …) — inventory and readings: **[questions.md § Yes / no polarity](questions.md#yes-no-polarity)**. Not clause force; left-edge or bare utterance only.

## Phrase-level, VP-level, and clause-level joins

There is **no** prefix-less **join** series. **`/z/` `/d/` `/b/` `/ɡ/` `/v/` `/x/`** + the join vowels + ending (`zam`, `dol`, `bem`, `gam`, `vam`, `xam`, `zar`, `zor`, `zer`, `zur`, `var`, `xar`, …) join same-slot phrases, VPs, or sentences with a **right-close fence** (shared modifiers immediately after the join — e.g. `z-dogl z-catl zam g-ofl b-Samn` = *Sam’s (dog and cat)*; nesting: right-close stack left-assoc `A B vol C val` = *(A or B) and C*; island `A ^ B C val ^ vol` = *A or (B and C)*; **left fences illegal**; **pure infix illegal**). **`/h/`** and **`/w/`** use the **same fence forms** as [restrictors](restrictors.md) (defined core: `hal` = *never*, `h-rainl hal` = *only when raining*, `hual` = *always*, `har` = *sometime* (under question → *When?* — [questions.md](questions.md#circumstance-when)); sibling manner/adjunct *and* is **juxtaposition**; other `/h/`/`/w/` join spellings reserved but undefined). On VP chains, `/h/` before the VP stretch (or in SHARED after the join) scopes over all VPs; `/h/` inside a conjunct scopes that VP only. **-l** / **-m** = closed/open on every join vowel (**a** / **o** / **u** / **ao** / **e** / **ae** / **oe** / **ua** / **uo** / **ue**); phrase **-n** = named; clause soft **-n** = *and then…* **`xan`** / uncertain reconstruction / soft ranking; VP `-n` = [join-act verbs](special-vocabulary.md#join-act-verbs); **-r** on **a** / **o** / **e** / **u** at all levels = [unspecified-member](coordination.md#unspecified-member-r-phrase) (`zar` / `zor` / `zer` / `zur` / `var` / `vor` / `ver` / `vur` / `xar` / … = *something* / *anything* / *whatever-by-rank* / *something else* (other than) — VP *do something*, clause *something happened*; under [question](questions.md) = fill-ask; under `/h/` `/w/` = *sometime* / *anytime* / … — *When?* under question: [questions.md](questions.md#circumstance-when)); **e** / **oe** / **ue** are **directional **rank join (**e** / **oe**: earlier ≻ later; **oe** = exclusive; **ue** = rank reversal); **ae** = **equality / tie** (multi + SHARED scale = [equative](comparatives.md#equatives); bare **ae** = draw). On NP fences, SHARED scale `/ɡ/` under **`e` / `oe` / `ue`** = [comparatives](comparatives.md) (multi = *bigger than*; focus **`e`** = **superlative** — `z-Samn zel g-bigl`; bare **`oe`** = **empty superlative** — `zoel g-bigl`; bare **`e`** + scale = unspecified top — `zel g-bigl`); under **`ae`** multi = *as … as* — `z-Samn z-Lean zael g-bigl`; under **`a`** = distributive — `z-Samn z-Lean zal g-bigl`; plain **u** = [negation](coordination.md#negation-u) (focus *not X*, multi *none of*, bare *no*; no separate `/h/` “not” root); leading **u** on **a** / **o** / **e** = [invert](coordination.md#invert-u-stacks) (`ua` = *everything but*; `uo` = *anything but*; `ue` = **rank reversal**, later ≻ earlier — not plain **u** [negation](coordination.md#negation-u) (*not* / *none of* / *no*); no three-vowel stacks; empty-allowed / *or none* on plain **o** + **-m** only (`zom` / `vom` / `xom` = at most one; `zol` / `vol` / `xol` = exactly one — [coordination.md](coordination.md#empty-allowed-om)); **-m** on other join vowels does not imply *or none*). Phrase focus / bare: **…em** / **…el** / **…ael** / **…aem** / **…aen** / **…oem** / **…oel** / **…uem** / **…uel** / **…en** / **…al** / **…am** / **…an** / **…ol** / **…om** / **…ual** / **…uam** / **…uol** / **…uom** / **…aol** / **…aom** / **…ul** / **…um** / **…un** / **…ar** / **…or** / **…er** / **…ur** (focus: *X first* / *only X matters* / *try X first* / *only try X* / *X last* / *not X* / *everything but X* / *anything but X* / …; bare: *unspecified ranking* / *nothing comes to mind* / *null* / *no options* / *no* / *everything* / *anything (goes)* / …; **…an** = *null* / *void*, **…aen** = *it’s a draw*, **…en** = *unspecified ranking* (stock), **…ar** = *something*, **…or** = *anything*, **…er** = *whatever-by-rank*, **…ur** = *something else*, **…un** = named/conventional *not X* / *no* — [coordination.md](coordination.md#focus-phrase); under `/h/` `/w/`: `hal` = *never*, `hual` = *always*, `hael` = *equally often*, … — [circumstance](restrictors.md); VP/clause focus/bare on **-r** and on negation **…ul** / **…um** / soft **…un**; interrogative readings: [questions.md](questions.md)). Correlatives come later.

**Revisers:** prefix-less **al** / **am** / **an** / **el** / **em** / **en** / **ol** / **om** / **on** / **ul** / **um** / **un** (**-l** / **-m** / **-n** required; bare **a** / **e** / **o** / **u** illegal). **In-clause:** same-slot `A REV B` (parallel chains: `A am B ul C` = including B and except C). **Discourse:** same forms immediately before clause force = *additionally* / *in other words* / *instead* / *except* (`al jal …`). *Starting with* = **`x#e-`**, *Finally* = **`x#e`** ([numbers.md](numbers.md#number-as-discourse-marker-by-marker)), not **`al`**. Not list joins; not adversative *but* / *however*. Joins: **[coordination.md](coordination.md)**. Revisers: **[revisers.md](revisers.md)**. Restrictors: **[restrictors.md](restrictors.md)**.

## Discourse markers (`/x/`)

Marked with x /ʒ/. Used for **discourse glue** that is not same-slot phrase/VP joins and not [discourse revisers](revisers.md#discourse-revisers): sentence linkers (*however*, *therefore*, *meanwhile*, *but*, standalone *next*, …), [numbered enumeration](numbers.md#number-as-discourse-marker-by-marker) (including *Starting with* = **`x#e-`**, *Finally* = **`x#e`**), and related fences. (*Additionally* / *in other words* / claim-level *instead* / *except* use prefix-less revisers before `/j/`.) **Span fences** ([spans.md](spans.md)) **open** with any PoS for the slot they fill (`daxal` … = object cite; `daxol` = atomic; `daxan` = proper; `daxar` = *that* cite; `hexal` … = aside; `duxal` … = opaque; `xaxal` … = discourse-only cite); **close** with **`xuxul`** / **`xuxur`** / **`xuxun`** / **`xuxum`** under this prefix. The dictionary lists linker roots. The same sound **x** also joins roots inside compound words and inside span-fence markers (see [Phonotactics](phonology.md#phonotactics)); it is not used as an ordinary root consonant, so mid-word **x** always means “next root,” and word-initial **x** always means discourse-marker PoS.

Phrase-level *and* / *or* / *none of* / *and/or* / ranked / invert joins are **not** general `/x/` linkers — they use `/z/` `/d/` `/b/` `/ɡ/` + the join vowels + ending (`zam`, `gam`, `zar`, `zor`, `zer`, `zur`, `zel`, `zael`, `zoel`, `zual`, `zuol`, `zuel`, …) with a **fence** (right close only — [coordination.md](coordination.md)). **`/h/`** / **`/w/`** use those same forms as [restrictors](restrictors.md) (`hal` / `wal` / …). VP-level uses `/v/` (`vam`, `var`, `vel`, `vael`, `voel`, `vual`, `vuol`, `vuel`, …) — same fence; **-r** = unspecified action (*do something*). Clause-level forms **are** `/x/` + the same vowels + ending (`xal`, `xar`, `xel`, `xael`, `xoel`, `xual`, `xuol`, `xuel`, …) — see [coordination.md](coordination.md#clause-level-coordination).

`/x/` connects or fences discourse; it does **not** carry evidential or epistemic framing of the claim. Softeners that encode source-of-knowledge or claim strength stay `/h/` or `/w/` (see [Adverbs](#adverbs-h)). Contrast: *however* / *therefore* → `/x/` linkers; *Starting with* → **`x#e-`**; *Finally* → **`x#e`**; *additionally* / *in other words* / claim *instead* / *except* → [discourse reviser](revisers.md#discourse-revisers); *apparently* / *allegedly* → `/h/` or `/w/`.

**Numbered list / enumeration markers** are `/x/` + [number word](numbers.md#number-as-discourse-marker-by-marker) (*point N:* neutral, *corroborating N:*, *independent N:*, *re item 12*). Marker vowel chooses independence framing (or cite-as-label); details live in numbers.md.

**Not `/x/`:** phrase-level and VP-level joins ([coordination.md](coordination.md)); [revisers](revisers.md) (in-clause *and* discourse *additionally* / *in other words* / *instead* / *except*); English-style subordinators that relate a following clause to a slot in the main clause (*if*, *because*, *although*, *while*, *until*) — those use the [next-clause pronoun](pronouns.md#special-pronouns) plus a lexicon relation (usually `/h/` + `/b/`), not a discourse-marker prefix. `/x/` sentence linkers (*therefore*, *however*, *meanwhile*, *but*, *next*), number enumeration markers (including **`x#e-`** *Starting with*, **`x#e`** *Finally*), and related fences do not fill a main-clause argument or adjunct slot.

## Dependent Clauses
<a id="dependent-clauses"></a>

Dependent clauses use a [next-clause special pronoun](pronouns.md#special-pronouns) (form TBD): it stands in the main clause for “whatever follows immediately.”

**Placement (hard):** the next-clause pronoun is **matrix-final** in **its** clause, and the dependent material **immediately follows** it — no host-clause words after that NEXT, and no gap between NEXT and the dependent. Rearrange free word order so that holds. For adverbial subordination, the whole contiguous `/h/` + `/b/` NEXT unit is matrix-final (NEXT last). That final NEXT is the **subordinating edge**: everything after it (until the next peer boundary) is the dependent of **that** clause.

**Chaining:** allowed. Each clause may have **at most one** matrix-final NEXT. A dependent may itself end in NEXT and bind a further dependent (*I said NEXT₁ [that she left NEXT₂ [because it rained]]*). Depth is right-branching only — no second NEXT in the same clause, and no two dependents as siblings under one host. Host-clause `/h/` units stay in their own clause and do not float into a dependent.

The dependent material is itself a **full sentence** and begins with its own `/j/` cluster (optional vocative(s) and interjection(s), then clause force). Force marks the dependent’s illocution (statement / embedded ask / directed action, …); the **boundary** is NEXT, not that `/j/`.

The next-clause pronoun takes whatever PoS prefix the slot needs:

* **Complement / content clause** — usually a core argument, matrix-final. Example: *I told him that…* → next-clause as direct object (`/d/`) of *tell* (last in the matrix); dependent sentence follows immediately.
* **Adverbial relation** (*because*, *if*, *although*, *while*, *until*, …) — a complex adverb: `/h/` relation word + `/b/` next-clause pronoun, as a contiguous **matrix-final** unit. The lexicon entry names the relation; there is **no** separate `/x/` subordinator for these.

`/x/` is only for discourse glue that does **not** occupy a main-clause argument or adjunct slot (sentence linkers still under `/x/`, discourse-only [span](spans.md) opens with PoS `/x/`, span closes **`xuxul`** / **`xuxur`** / **`xuxun`** / **`xuxum`**, [numbered enumeration](numbers.md#number-as-discourse-marker-by-marker) including *Starting with* **`x#e-`**, *Finally* **`x#e`**). *Additionally* / *in other words* / claim *instead* / *except* are [discourse revisers](revisers.md#discourse-revisers) (prefix-less, before `/j/`), not `/x/`. Spans that fill a clause slot **open** with that slot’s PoS (`daxal`, `zoxal`, `hexal`, `duxal`, …). Phrase-level uses `/z/` `/d/` `/b/` `/ɡ/` `/w/` `/h/`; VP-level uses `/v/`; clause joins uses this vowel series under `/x/` ([coordination.md](coordination.md)). Do not encode *because* / *if*-style subordination as `/x/`.

# Reference Suffix

Reference suffix grammar (**-l** / **-m** / **-n** / **-r**) lives in **[reference-suffix.md](reference-suffix.md)**. Compact multipart proper names (given+family, *New York*) are mid-word **`x`-compounds** with one ending — [phrasal proper names](reference-suffix.md#phrasal-proper-names) — not adjacent bare same-PoS **-n** words. Long / mixed-PoS work titles prefer [cite](spans.md) spans (often proper **`@`** / **-n**); *the title/saying X* as a named unit uses [mention](spans.md) **-n**.

# Plurality

Plural grammar (**-sh** after the reference suffix: group referent on nouns / event-sets / vocatives; **collective** ascription on `/ɡ/`; unused on `/w/` `/h/` `/x/` and number words) lives in **[plurality.md](plurality.md)**. Generics and *every K* use invert **ua** with SHARED kind (`zual g-catl`), not **-sh** — [coordination.md](coordination.md#universals-domains-generics). Habitual / characterizing pattern uses **`hual`**, not adjective **-sh**.

# Pronouns

Pronoun grammar (anaphoric **-r** forms, special pronouns) lives in **[pronouns.md](pronouns.md)**.

# Numbers

Numeral grammar (digit roots, [digitless / zero-group forms](numbers.md#zero-digit-groups), [digitless exponents](numbers.md#digitless-exponents) (+∞ / −∞ / last place / start place / [notional / imaginary](numbers.md#imaginary) **`g-e-`** / [zero × exponent](numbers.md#zero-exponent) — **`g+0e`** absolute zero / **`g+e0`** unit amount / **`g+0e0`** `0⁰`; **`v+0el`** *annihilate* / **`v+e0`** *unitize* / **`j+0e`** *Annihilate!* / …; `/v/` `/h/` overlays / **`j+e`** *To infinity!* / …), engineering/scientific forms, ordinals (forward **`#`**, end-relative **`#-`** / **`eu`**, [generation](numbers.md#ordinal-generation) via digitful exp), digit-strings, `/x/` enumeration, number-word shape, [preferred writing](numbers.md#writing-preferred-shorthand) (second-slot **`~`** / **`@`** / **`=`** for endings), [percent denominators](numbers.md#percent-denominators), [ranges](numbers.md#ranges) / [thresholds](numbers.md#numeric-thresholds) / [measure phrases](numbers.md#measure-phrases); PoS-less stems in [numeric derivation](special-vocabulary.md#numeric-derivation) compounds) lives in **[numbers.md](numbers.md)**.

# Comparatives, superlatives, and equatives

Scalar comparison (ranked **`e` / `oe` / `ue`** *more / …-est*, **`ae`** *as … as*, distributive **`a`** + SHARED `/ɡ/`, measured differentials, [judgment benchmarks](comparatives.md#judgment-benchmarks) *worse than Average|…* via **`ue`** + closed **-n** comparees): **[comparatives.md](comparatives.md)**. Measure NP shape (unit + amount): **[numbers.md § Measure phrases](numbers.md#measure-phrases)**.

# Predication (classification and identity)

Zero-copula **classification** / property ascription (`jal z-Samn g-teacherl`) and closed **`SAME`** **identity** (`jal z-Clarkn g-SAMEl b-Superman`): **[predication.md](predication.md)**. Not scalar equative `ae`; no general *to-be* `/v/`.

# Causation (necessary / sufficient)

Causal / condition claims reuse existing joins — default open sufficient (**`…aom`** / **`haon`**); necessity via **`huan`/`guan`** / **`hal`**; clause poles via `/h/`+NEXT (not `xaom`-as-cause); preference-as-law stacks [values](values.md); no cause-arrow word: **[causation.md](causation.md)**.

# Phrase-level, VP-level, and clause-level joins

Phrase-level **zam** / **gam** / …, VP **vam** / **var** / … (joins **-l** / **-m** / **-r**; VP `-n` = [join-act verbs](special-vocabulary.md#join-act-verbs); `/ɡ/` `/h/` `-n` = [join-relations](special-vocabulary.md#join-relations)), and clause `/x/` + vowel + ending (soft **-n** ≠ named **-n**; *and then* = **`xan`**; **-r** = unspecified-member at all levels): **fence** (right close only; shared modifiers immediately after the join; [fence nesting](coordination.md#fence-nesting)); SHARED scale `/ɡ/` = [comparatives / equatives](comparatives.md) (`z-Samn z-Lean zel g-bigl` / `z-Samn z-Lean zael g-bigl` / `z-Samn z-Lean zal g-bigl` = distributive *both big* / `z-boxl z-cratel zal g-heavylsh` = [collective](plurality.md#collective-ascription) / focus `z-Samn zel g-bigl` / bare `zoel g-bigl` = *no biggest*); SHARED continuum `/ɡ/` + two number endpoints = [number ranges](numbers.md#ranges) (`z+3 z+5 zel g-agel` = *from age 3 to 5*; bare `z+3 z+5 zel` = preference); invert **ua** SHARED `/ɡ/` = [kind domain / generics](coordination.md#universals-domains-generics) (`zual g-catl` = *every cat*; `hual` = habitual *always*); prefix-less **al** / **am** / **an** / **el** / … (**-l** / **-m** / named **-n** required; parallel chains on A) = revisers (*including* / *rather* / *instead* / *except*): **[coordination.md](coordination.md)**. Number ranges and measure phrases: **[numbers.md](numbers.md)**. No bare word-level joins.

# Questions

Interrogative forces (**jol** / **jom**), yes/no vs fill-ask, multi-gap **fill-all**, focus/bare under question, and polar answers (**`jael`** / *true*, **`juel`** / *false*, **`jaol`** / **`juol`** / **`jual`** …): **[questions.md](questions.md)** ([yes/no polarity](questions.md#yes-no-polarity)).

# Citations, mentions, and asides

Span fences: **open** `{PoS}{TYPE}x{EDGE}{ENDING}` (writing = PoS + optional **`@`** / **`~`** after PoS + `[…]` / `{…}` / `(…)` / `<…>`; **`d@[…]`** = proper, **`d~[…]`** = paraphrase; hedged proper `@~` spelled **`d@[…]`** with uncertain tone; TYPE **a** cite / **e** aside / **o** mention / **u** opaque; EDGE **a** multi / **e** clause-scoped / **o** atomic / **u** empty; **-l** exact / **-m** paraphrase / **-n** proper / **-r** span anaphor (*that* cite); e.g. `daxal` / `daxol` / `daxan` / `daxar` / `d[…]` / `d[hi]` / `d@[…]` / `d[=]`); **close** **`xuxul`** (complete) / **`xuxur`** (truncated — `-]`) / **`xuxun`** (sic — `#]`) / **`xuxum`** (pop all; writing `-\|` / `#\|` = truncated or sic + pop all). **Adjunct-scope islands** **`^ … ^`** (prosody-only; binder inside: `/h/` and/or join; no nesting): **[spans.md](spans.md)**.

# Values

Ordinary **`/h/`** / **`/w/`** content defaults to **values** (needs): **topic** (bare need) or compound **`need x {a\|e\|o\|u}`** = **met** / **motive** / **prescription** / **unmet**; endings = **contact channel** on **`xa`**, **preference standing** on **`xe`**, **prescription force** on **`xo`** (invite / endorse / commit / bound), or **changeability** on **`xu`**. **[values.md](values.md)**.

# Special vocabulary

Closed non-need **ability** / **incapability**: primary compound **`HOST x {a\|u}`** with **changeability** endings (`v-singxun` = can’t sing, fixed); fallback closed **`ABIL x {a\|u}`** when hostless / clause-wide; **`xe`** / **`xo`** undefined. **Role compounds**: **`{a\|u\|o} x ROOT`** = **agent** / **patient** / **reltum** of an event or relation root (`z-axattackr` = *the attacker*; `d-uxattackr` = *the one attacked*; bare `z-attackr` = *that attack*); **`e x …`** reserved; ordinary **-l/-m/-n/-r**. **Numeric derivation**: **`ROOT x NUM`** (PoS-less number stem, no number ending on `NUM`) = essence (`ROOTx+e`), grain (`ROOTx+e-`), void (`ROOTx-e`), quasi (`ROOTx-e-`; `ROOTx-e-1` / `ROOTx-e-2` quasi-N), origin/telos (`ROOTx#e-` / `ROOTx#e`), poly/de (`ROOTx+` / `ROOTx-`), digit morphs (`ROOTx+1`…`+9` strong readings; `ROOTx-N` = privative including `ROOTx-0` anti-null; `ROOTx+0` = null; PoS readings for null / anti-null — [null / anti-null](special-vocabulary.md#null-anti-null); ordinal digit morphs `ROOTx#N` = rank-N / Nth-order kind — [ordinal digit morphs](special-vocabulary.md#ordinal-digit-morphs); bare `ROOTxN` illegal), [zero × exp / identity](special-vocabulary.md#zero-exponent-derivation) (`ROOTx+0e` total null / `ROOTx+0e-` sterile / `ROOTx-0e` absolute residue / `ROOTx+e0` identity form / `ROOTx+0e0` `0⁰` paradox — free twins **`v+0el`** *annihilate*, **`g+e0`**, …), label/code (`ROOTx_` / `ROOTx_N` — *specimen #1*, not *first*; infinite / landmark labels `ROOTx_e` / `ROOTx_e-` / `ROOTx_1e` — [infinite labels](special-vocabulary.md#infinite-labels)), hyperbole (`ROOTx+1e` / `ROOTx#1e` / `ROOTx_1e`); ordinary host ending only — [numeric derivation](special-vocabulary.md#numeric-derivation). **Join-act verbs**: closed defective `/v/`…**-n** (`van` / `von` / …) enact the join-series move on an object — not VP soft joins; *and then* = clause **`xan`**. **Join-relations**: closed defective `/ɡ/` `/h/`…**-n** (`gan` / `han` / …) = complex adj/adv with unary `/b/` (*including* / *with* / *without* / …) — not named AP lists (use [mention](spans.md) for stock bundles). **Plan / predict**: closed mood roots **`owaro`** (*plan*, 🗺️) / **`edelo`** (*forecast*, 🔭) under `/h/` — **not** `x`-compounds; predict stacks with ordinary evidentiality. **Memory / record** (past framing): closed **`uhunu`** (*memory*, 🎣 fishing) vs **`eroge`** (*record*, ⏺️) under `/h/` — reconstructive recall vs captured past; **not** `x`-compounds. **Emotion compose**: drop opaque emotion-for-judgment; stack ordinary [value](values.md) + closed **ACT** (`ogena` flood / `oju` flow / `ozono` stillness) + **LOCUS** (`abobo` bottle / `oburo` pour / `agena` awash) — water tide/vessel metaphors; **not** a parallel `x`-system. **COMMENT** (mindfulness noting): closed **`uho`** 💭 (*thought* → *commentary*) for **cognitive** attitudes (*think* / *assume* / *imagine* / *wonder*) — **not** stacked on [emotion compose](special-vocabulary.md#emotion-compose); *believe* waits on evidentiality. **[special-vocabulary.md](special-vocabulary.md)**. Mid-word **`x`** parser families: **[x-compounds.md](x-compounds.md)**.

# Phonology and Phonotactics

Phonology, syllable structure, and phonotactics live in **[phonology.md](phonology.md)**. Mid-word **`x`** family disambiguation: **[x-compounds.md](x-compounds.md)**.
# Reference Suffix

Every content word ends with a **reference suffix** — one of four final consonants that encode how the root is used in discourse: literal vs metaphorical sense, proper name, or anaphoric reference. The lexicon stores **roots** only; the reference suffix (and PoS prefix) are applied at use time.

## Word shape

```
[PoS prefix] + root (+ x + root …) + reference suffix + [z?]
```

1. **PoS prefix** — role in the clause (see [language-reference.md](language-reference.md#part-of-speech-prefixes)).
2. **Root(s)** — `V(CV)+`; compound roots join with **x** (see [phonology.md](phonology.md#phonotactics)).
3. **Reference suffix** — **-l**, **-m**, **-n**, or **-r** (below).
4. **Plural -z** — optional; marks the **group containing** the referent, after the reference suffix.

## The four suffixes

| Suffix | Name | Discourse job |
|--------|------|----------------|
| **-l** | literal | Indefinite introduction in the literal sense (“a / some X”) — first mention |
| **-m** | metaphorical | Indefinite introduction in a figurative sense — first mention |
| **-n** | proper name | Definite / unique by nature (not “a John”) |
| **-r** | pronoun | Definite reference to an already-introduced referent |

A bare **-l** / **-m** word always introduces; it is never used to resume a prior referent. Resumption is always marked with **-r**. Anaphoric **-r** grammar lives in **[pronouns.md](pronouns.md)**.

## Proper name (`-n`)

**-n** marks a **named designation**: the speaker treats the root as a definite, established label — not “a kind of X” (`-l` / `-m`) and not a back-reference (`-r`). The usual case is people and places (`/z/`…**-n**, `/d/`…**-n**), but **-n** is available on **any** PoS prefix. The prefix says what role the word plays **now**; **-n** says you are invoking a **title, proper label, or conventionally unique name** for that root, not introducing a fresh indefinite reading.

Prefer **-n** (and its **-r** pronoun) over speaker/listener special pronouns when a name exists — see [pronouns.md](pronouns.md#special-pronouns).

### Nouns (`/z/`, `/d/`, `/b/`)

Named individuals, places, one-off objects, and other referents that are definite by nature: *Sam*, *Paris*, *the Odyssey* (as a titled work). You are not saying “a Sam” or “some Paris”; you are using the established name. Argument nouns under a complex adjective or adverb can be **-n** when the relation’s participant is a named entity (*book by* **[Rowling]**).

### Verbs (`/v/`)

A **named action, rite, or event** — not a generic instance of the verb. English parallels: *perform* **[Hamlet]**, *run* **[the Boston Marathon]**, *observe* **[Ramadan]**, *do* **[the Macarena]**. The verb root names the kind of doing; **-n** says you mean **that** titled or conventional occurrence, not “a run” or “some performing” in the abstract.

### Adjectives (`/ɡ/`)

A **named category, style, or affiliation** used as a label on the host noun — when the point is the proper designation, not a fresh literal description. English parallels: **[Art Deco]** furniture, **[Buddhist]** monastery (the named tradition), **[iOS]** app. Contrast **-l**: *a buddhist text* (indefinite, literal kind) vs **-n** when the tradition’s name is the intended frame. Brand and movement names on `/ɡ/` belong here; generic material or color readings stay **-l**.

### Adjective adjuncts (`/w/`)

Rare. **-n** marks a **named scale, grade, or criterion** for reading the preceding `/ɡ/` — not ordinary intensity. The adjunct names *which* fixed standard or named band applies to that property. English parallels: *spicy* **[Scoville]** (under that scale), *severe* **[DSM]** (under that diagnostic frame), *large* **[King-size]** (that commercial size name), *original* **[Director’s Cut]** (that titled cut’s sense of “original”). Ordinary degree and mood/evidentiality on the adjective (*very*, *slightly*, *alleged*, *former*) stay **-l** / **-m**. If the root is itself the category label on the noun (**[Art Deco]** furniture), that stays `/ɡ/`…**-n**, not `/w/`.

### Adverbs (`/h/`)

A **named circumstance, channel, or standard** framing the clause — official schedules, titled eras, conventional place labels in time/space adjuncts. Aligns with [number **-n**](numbers.md#number-endings) (*the Second…*, a conventional date name). English parallels: *according to* **[GAAP]**, *on* **[channel 7]** when 7 is a fixed designation, *in* **[Q3]** as the named quarter. Manner and mood roots usually stay **-l** / **-m** unless the manner is itself a proper name (*do it* **[the Walmart way]**).

### Utterance markers (`/j/`)

Depends on the subclass (see [utterance markers](language-reference.md#utterance-markers-j)):

* **Vocatives** — Natural home for **-n**. Address someone or something by name: *Sam!*, *Paris!* (as a city name). Kind-based address (*everyone*) stays **-l**; a titled group label (*Team Alpha*) takes **-n**. Prefer names here over speaker/listener special pronouns when a name exists.
* **Interjections** — Mostly **-l** / **-m** (*wow*, *hello*). Use **-n** when the shout *is* a named formula or conventional call: **[Mazel tov]**, **[Amen]**, **[Bingo]** as the game’s proper call, branded catchphrases. Aligns with [number `/j/`…**-n**](numbers.md#number-as-interjection-by-marker) (conventional call name).
* **Clause force** — Do **not** use **-n**. Force roots are a closed set (statement / polar question / imperative); they are not names.

### Discourse markers (`/x/`)

* **Coordinators / linkers** (*and*, *but*, *however*, *therefore*) — Stay **-l** / **-m**; not names.
* **Quotation / fence markers** — Brackets mark quoting; **-n** on the quote marker itself is unnecessary. Named material *inside* the quote takes **-n** on its own PoS (`/z/`…**-n**, etc.).
* **Named discourse glue** — **-n** for titled section/agenda labels, official list-item names, and branded discourse frames. English parallels: **[Item Zero]**, **[Appendix A]** as a discourse cite, a fixed ritual segue name. Ordinary *firstly* stays **-l**. Aligns with [number `/x/`…**-n**](numbers.md#number-as-discourse-marker-by-marker) (titled / official item name).

### Borrowed and quoted forms

Foreign words, slang, and other non-lexicon surface forms still use [quotation brackets](language-reference.md#quotations) when required. **-n** marks that you are treating the material as a **name or fixed label**; the brackets mark that the form is quoted or imported, not an ordinary dictionary root.

### Summary

| PoS | **-n** means… |
|-----|----------------|
| `/z/` `/d/` `/b/` | This named entity (person, place, title, unique referent) |
| `/v/` | This named event, rite, performance, or titled action |
| `/ɡ/` | This named style, tradition, brand, or category label |
| `/w/` | (Rare) this named scale, grade, or criterion on the preceding adjective |
| `/h/` | This named standard, channel, period, or official circumstance |
| `/j/` vocative | Address this named person, place, or title |
| `/j/` interjection | This named formula or conventional call |
| `/j/` clause force | *(not used)* |
| `/x/` | This titled / official discourse label or list name (not ordinary *and* / *but*) |

Do **not** use **-n** for generic first mention (**-l** / **-m**) or for resuming a prior mention (**-r**).

## Plural **-z**

Add **-z** after the reference suffix to mark **plural**: the **group containing** the referent. Example: `…r` refers to one noun; `…rz` refers to the group that includes that noun. The same **-z** works on full words (`…lz`, `…nz`, etc.).

Allowed word-final clusters are the four reference suffixes plus **-z** (**-lz**, **-mz**, **-nz**, **-rz**). No other syllables end with a consonant, so word boundaries stay clear even when pauses are unreliable (as in singing). Details in [phonology.md](phonology.md#phonotactics).

## Number-word exception

In [number words](numbers.md), the same four letters (**-l**, **-m**, **-n**, **-r**) have **number-specific** meanings instead of ordinary reference-suffix senses. After a PoS prefix, the number marker **r** may also form clusters that are not otherwise allowed; that is legal **only** in number words — see [phonology.md](phonology.md#phonotactics).

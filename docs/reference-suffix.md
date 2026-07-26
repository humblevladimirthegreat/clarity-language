# Reference Suffix

Every content word ends with a **reference suffix** — one of four final consonants that encode how the root is used in discourse: literal vs metaphorical sense, proper name, or anaphoric reference. The lexicon stores **roots** only; the reference suffix (and PoS prefix) are applied at use time.

## Word shape

```
[PoS prefix] + [l?] + root (+ x + root …) + reference suffix + [sh?]
```

1. **PoS prefix** — role in the clause (see [language-reference.md](language-reference.md#part-of-speech-prefixes)).
2. **Left-bound `l`** — optional; **adjectives only** (`/ɡ/` → **`gl-`**). Marks [left-bound attachment](language-reference.md#adjectives-ɡ) (adjective before host). Not the word-final reference suffix **-l**.
3. **Root(s)** — `V(CV)+`; compound roots join with **x** (see [phonology.md](phonology.md#phonotactics)).
4. **Reference suffix** — **-l**, **-m**, **-n**, or **-r** (below).
5. **Plural -sh** — optional; marks a **group referent** (or collective `/ɡ/`), after the reference suffix — see [plurality.md](plurality.md).

## The four suffixes

| Suffix | Name | Discourse job |
|--------|------|----------------|
| **-l** | literal | Indefinite introduction in the literal sense (“a / some X”) — first mention |
| **-m** | metaphorical | Indefinite introduction in a figurative sense — first mention |
| **-n** | proper name | Definite / unique by nature (not “a John”) |
| **-r** | pronoun | Definite reference to an already-introduced referent |

A bare **-l** / **-m** word always introduces; it is never used to resume a prior referent. Resumption is always marked with **-r**. Anaphoric **-r** grammar lives in **[pronouns.md](pronouns.md)**. The dictionary has separate entries for the literal (**-l**) and metaphorical (**-m**) sense of each word.

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
* **Clause force** — Do **not** use **-n** or **-r**. Force forms are the closed **`jal` / `jam` / `jol` / `jom` / `jel` / `jem` / `jul` / `jum`** set ([clause force](language-reference.md#clause-force)); they are not names.

### Discourse markers (`/x/`)

* **Linkers** (*but*, *however*, *therefore*) — Stay **-l** / **-m**; not names. Phrase-level *and* / *or* / *none of* / *and/or* / rank join use `/z/` `/d/` `/b/` `/ɡ/` `/w/` `/h/` (`zam`, `zan`, `zar`, `zor`, `zer`, `zur`, `zul`, `zum`, `zun`, `gam`, `gan`, `zel`, `zael`, `zoel`, `zen`, …) with named **-n** where allowed and **-r** on **a**/**o**/**e**/**u** for *something*/*anything*/*whatever-by-rank*/*something else* (fence: left preferred, right close allowed; nesting per [fence nesting](coordination.md#fence-nesting)). VP-level uses `/v/` (`vam`, `van`, `var`, `vul`, `vum`, `vun`, `vel`, `vael`, `voel`, …) with soft **-n** and unspecified-member **-r** (same fence) — see [coordination.md](coordination.md).
* **Clause joins** (`xa` / `xo` / `xu` / `xao` / `xe` / `xae` / `xoe` + ending) — Vowel = join type (**e** / **oe** = ranked — unmarked / exclusive; **ae** = equality / tie); **-l** / **-m** = closed vs open committed lists on every join vowel; **-n** = soft packaging (*and then* / uncertain reconstruction / soft ranking / soft denial; **not** phrase named-list **-n**); **-r** on **a** / **o** / **e** / **u** = unspecified-member (*something happened* / *anything* / *whatever-by-rank* / *something else*; under [question](questions.md) = fill-ask) — **not** list continue. Same **fence** as phrase and VP (left preferred; right close; nesting: left stack = right-assoc, right stack = left-assoc; pure infix illegal). Full table: [coordination.md](coordination.md#vp-clause-forms).
* **Quote / mention / aside markers (`xl-`)** — Closed span series ([quotations.md](quotations.md)): vowel = open type (**a** quote / **e** aside / **o** mention) or close (**u**); **-l** = exact; **-m** = paraphrase; no **-n** on these markers (proverbs → quote; formula-as-label → mention). **-r** reserved for resume-prior-span. Named material *inside* the brackets still takes ordinary PoS + **-n** (`z-Samn`, …). Not clause-join soft **-n**.
* **Named discourse glue** — **-n** for titled section/agenda labels, official list-item names, and branded discourse frames (**other** `/x/` roots — not the clause-join vowel series, where **-n** is soft join packaging, and not the **`xl-`** span series). Like `/x/`…**-r** on [pronouns](pronouns.md) (*going back to subject X* / thread resume), titled `/x/`…**-n** is **discourse navigation**: a **thread shift** — *let’s now talk about X* (opening or moving to that named topic), not clause aboutness. English parallels: **[Item Zero]**, **[Appendix A]** as a discourse cite, a fixed ritual segue name. Ordinary *firstly* stays **-l**. Aligns with [number `/x/`…**-n**](numbers.md#number-as-discourse-marker-by-marker) (titled / official item name).

### Borrowed and quoted forms

Foreign words, slang, and other non-lexicon surface forms still use [quotation / mention brackets](quotations.md) when required. Content-word **-n** marks that you are treating the material as a **name or fixed label**; the brackets (and spoken **`xl-`** markers) mark that the form is quoted or imported, not an ordinary dictionary root. Span markers themselves take only **-l** / **-m** (exact / paraphrase).

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
| `/x/` | Titled / official discourse label — thread shift (*let’s now talk about X*; other roots). On **`xl-`** span markers, only **-l** / **-m** (exact / paraphrase) — no **-n** ([quotations.md](quotations.md)). On clause joins, **-n** is soft join packaging (*and then* / uncertain reconstruction / soft ranking); **-r** on **a**/**o**/**e**/**u** is unspecified-member (*something happened*, …) — see [coordination.md](coordination.md). Ordinary *but* / *however* stay **-l** / **-m**. Phrase- and VP-level joins: [coordination.md](coordination.md) |

Do **not** use **-n** for generic first mention (**-l** / **-m**) or for resuming a prior mention (**-r**).

## Plural **-sh**

Plural grammar (**-sh** after the reference suffix; group referent on nouns/verbs/vocatives; collective on `/ɡ/`; unused on `/w/` `/h/` `/x/` and number words) lives in **[plurality.md](plurality.md)**. Short form: `…r` is one referent; `…rsh` is the group that includes that referent. Allowed word-final clusters: **-lsh**, **-msh**, **-nsh**, **-rsh** — see [phonology.md](phonology.md#phonotactics).

## Number-word exception

In [number words](numbers.md), the same four letters (**-l**, **-m**, **-n**, **-r**) have **number-specific** meanings instead of ordinary reference-suffix senses. After a PoS prefix, the number marker **r** may also form clusters that are not otherwise allowed; that is legal **only** in number words — see [phonology.md](phonology.md#phonotactics).

## Value-compound exception

On [value](values.md) compounds under `/h/` or `/w/` with an **`x`+a/e/o/u** stake half (`…xal`, `…xum`, …), the same four letters mean **changeability** (temporary / modifiable / irreversible / won't-now) instead of ordinary reference-suffix senses. Bare need words (no `x`-addition) keep ordinary **-l / -m / -n / -r** for now. Details: [values.md](values.md#value-changeability).

## Join exception

On [joins](coordination.md), the same letters are specialized again: phrase-level **zal** / **zam** / **zan** / **zar** / **zol** / **zom** / **zor** / **zul** / **zum** / **zun** / **zur** / **zel** / **zem** / **zen** / **zer** / **zael** / **zoel** / … / **gal** / **gam** / **gan** / **gel** / … (and `/w/` `/h/` forms) use **-l** / **-m** / **-n** for **closed** / **open** / **named** on every join vowel (**a** / **o** / **u** / **ao** / **e** / **ae** / **oe**; **e** / **ae** / **oe** = **rank joins** — unmarked / equality / exclusive (**e** unmarked order; **ae** tie/equality; **oe** exclusive)), plus **-r** on **a** / **o** / **e** / **u** for [unspecified-member](coordination.md#unspecified-member-r-phrase) (**zar** / **zor** / **zer** / **zur**, all arities), while VP-level **val** / **vam** / **van** / **var** / **vul** / **vum** / **vun** / **vel** / **vael** / **voel** / … (under `/v/`) and clause **xal** / **xan** / **xar** / **xul** / **xum** / **xun** / **xel** / **xael** / **xoel** / **xen** / … use **-l** / **-m** for closed/open, **-n** for **soft** packaging (*and then* / uncertain reconstruction / soft ranking / soft denial; not the phrase named sense), and **-r** on **a** / **o** / **e** / **u** for the same unspecified-member series (*do something* / *something happened*, …; under [question](questions.md) = fill-ask) — **not** list continue. All levels share a **fence** (left preferred; right close; [fence nesting](coordination.md#fence-nesting); pure infix illegal). There are no prefix-less joins. Prefix-less **al** / **am** / **an** / **el** / **em** / **en** / **ol** / **om** / **on** / **ul** / **um** / **un** (**-l** / **-m** / named **-n** required; no **-r**; bare **a** / **e** / **o** / **u** illegal) are [revisers](revisers.md): vowel = *including* / *rather* / *instead* / *except*; **-l** / **-m** = exhaustive vs open **right-hand side**; **-n** = named/conventional frame (phrase-style, not soft); chains `A REV₁ B REV₂ C` apply each **REV** in **parallel to A** (mixed vowels/endings allowed). Details live in coordination.md.

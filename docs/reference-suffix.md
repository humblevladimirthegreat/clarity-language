# Reference Suffix

Every content word ends with a **reference suffix** — one of four final consonants that encode how the root is used in discourse: literal vs metaphorical sense, proper name, or anaphoric reference. The lexicon stores **roots** only; the reference suffix (and PoS prefix) are applied at use time.

## Word shape

```
[PoS prefix] + [l?] + root (+ x + root …) + reference suffix + [sh?]
```

Written as **one token with no hyphen** after the PoS letter (`zivon`, not `z-ivon`). Foreign roots: `PoS<…>ENDING` (e.g. `d<english>l`). Opaque spans: no ending after `>` (`d<sushi>`). See **[orthography](language-reference.md#orthography)**.

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

### Phrasal proper names (mid-word `x`)
<a id="phrasal-proper-names"></a>

**Multipart proper names** — given + family, compact multi-token place names, and similar **one-referent** labels that English writes as several capitalized words — are **one content word** when short enough to stay handy.

| Shape | Example | Reading |
|-------|---------|---------|
| **Foreign** multipart (donor spelling in one `<>`) | `z<Mary Smith>n` | *Mary Smith* (one person) — space inside `<>` OK |
| same under other slots | `d<New York>n`, `b<Leonardo da Vinci>n` | one named place / person as object or argument |
| **Nativized** multipart (published / adapted Clarity roots + mid-word **`x`**) | `zuzuzuxogeven` | *Sushi-Coffee* as one nativized label (roots `uzuzu` / `ogeve`) — pattern for when both halves are lexicon roots |

**Do not** spell a phrasal name as adjacent bare same-PoS words (`z<Mary>n z<Smith>n`). Inside a [join](coordination.md) that would look like two conjuncts (*Mary and Smith*), and elsewhere it competes with inventory *and*, [identity](predication.md#identity), and [classification](predication.md#classification). One word (foreign `<>` or nativized **`x`-compound**) keeps **one** anaphor target ([pronouns](pronouns.md): resume from the compound’s root prefix through the 2nd vowel) and one slot filler.

**Long titles** (book / film / album names, and other designations that would need many roots, mixed PoS, or an internal *and*) prefer a [**cite**](spans.md) span when used as title wording to pick out the work (often proper **`@`** / **-n**); *the title X* / *the proverb X* as a named unit uses [**mention**](spans.md) **-n** — do **not** force a single **`x`-compound**. Resume with a [span anaphor](spans.md#endings) (`daxar` / `doxar` / …), not content-word **-r** on a fake mega-root. Compact person/place compounds above are the default; span fences are the escape hatch when the compound would be clumsy.

**Not this:** coordination of distinct people (`zam z<Mary>n z<Smith>n` = *Mary and Smith*); role ascription (`z<Sam>n gedagel`); co-reference (`gogunol b-…`); raw donor spelling as an **opaque** span when you meant a compact foreign content word (`d<sushi>` opaque blob ≠ `d<sushi>l` / nativized `duzuzul` — [loans](spans.md#loans)).

Phonotactics for **`x`**: [phonology.md](phonology.md#phonotactics).

### Verbs (`/v/`)

A **named action, rite, or event** — not a generic instance of the verb. English parallels: *perform* **[Hamlet]**, *run* **[the Boston Marathon]**, *observe* **[Ramadan]**, *do* **[the Macarena]**. The verb root names the kind of doing; **-n** says you mean **that** titled or conventional occurrence, not “a run” or “some performing” in the abstract.

### Adjectives (`/ɡ/`)

A **named category, style, or affiliation** used as a label on the host noun — when the point is the proper designation, not a fresh literal description. English parallels: **[Art Deco]** furniture, **[Buddhist]** monastery (the named tradition), **[iOS]** app. Contrast **-l**: *a buddhist text* (indefinite, literal kind) vs **-n** when the tradition’s name is the intended frame. Brand and movement names on `/ɡ/` belong here; generic material or color readings stay **-l**.

### Adjective adjuncts (`/w/`)

Rare. **-n** marks a **named scale, grade, or criterion** for reading the preceding `/ɡ/` — not ordinary intensity. The adjunct names *which* fixed standard or named band applies to that property. English parallels: *spicy* **[Scoville]** (under that scale), *severe* **[DSM]** (under that diagnostic frame), *large* **[King-size]** (that commercial size name), *original* **[Director’s Cut]** (that titled cut’s sense of “original”). Ordinary degree and mood/evidentiality on the adjective (*very*, *slightly*, *alleged*, *former*) stay **-l** / **-m**. If the root is itself the category label on the noun (**[Art Deco]** furniture), that stays `/ɡ/`…**-n**, not `/w/`. **Judgment benchmarks** (*worse than Professional*, …) are **not** this `/w/` use — they are **-n** comparees on a ranked fence: [comparatives.md § Judgment benchmarks](comparatives.md#judgment-benchmarks).

### Adverbs (`/h/`)

A **named circumstance, channel, or standard** framing the clause — official schedules, titled eras, conventional place labels in time/space adjuncts. Aligns with [number **-n**](numbers.md#number-endings) (*the Second…*, a conventional date name). English parallels: *according to* **[GAAP]**, *on* **[channel 7]** when 7 is a fixed designation, *in* **[Q3]** as the named quarter. Manner and mood roots usually stay **-l** / **-m** unless the manner is itself a proper name (*do it* **[the Walmart way]**).

### Utterance markers (`/j/`)

Depends on the subclass (see [utterance markers](language-reference.md#utterance-markers-j)):

* **Vocatives** — Natural home for **-n**. Address someone or something by name: *Sam!*, *Paris!* (as a city name). Kind-based address (*everyone*) stays **-l**; a titled group label (*Team Alpha*) takes **-n**. Prefer names here over speaker/listener special pronouns when a name exists.
* **Interjections** — Mostly **-l** / **-m** (*wow*, *hello*). Use **-n** when the shout *is* a named formula or conventional call: **[Mazel tov]**, **[Amen]**, **[Bingo]** as the game’s proper call, branded catchphrases. Aligns with [number `/j/`…**-n**](numbers.md#number-as-interjection-by-marker) (conventional call name). Closed [yes/no polarity](questions.md#yes-no-polarity) particles (**`jael`** / **`juel`** / **`jaol`** / **`juol`** / **`jual`**, and soft **-m** twins) use **-l** / **-m** only — not **-n** / **-r**.
* **Clause force** — Do **not** use **-n** or **-r**. Force forms are the closed **`jal` / `jam` / `jol` / `jom` / `jel` / `jem` / `jul` / `jum`** set ([clause force](language-reference.md#clause-force)); they are not names.

### Discourse markers (`/x/`)

* **Linkers** (*but*, *however*, *therefore*, …) — Stay **-l** / **-m**; not names. Prefix-less [discourse revisers](revisers.md#discourse-revisers) (*additionally* / *in other words* / *instead* / *except* before `/j/`) keep reviser **-l** / **-m** / named **-n**. *Starting with* / *Finally* are number discourse **`x#e-`** / **`x#e`** ([numbers.md](numbers.md#number-as-discourse-marker-by-marker)), not revisers. Phrase-level *and* / *or* / *none of* / *and/or* / rank join use `/z/` `/d/` `/b/` `/ɡ/` `/w/` `/h/` (`zam`, `zan`, `zar`, `zor`, `zer`, `zur`, `zul`, `zum`, `zun`, `gam`, `gal`, `zel`, `zael`, `zoel`, `zen`, …) with named **-n** on `/z/` `/d/` `/b/` `/w/` and **-r** on **a** / **o** / **e** / **u** for *something* / *anything* / *whatever-by-rank* / *something else* (fence: right close only; nesting per [fence nesting](coordination.md#fence-nesting)). `/ɡ/` `/h/` **-n** (`gan`, `han`, …) are [join-relations](special-vocabulary.md#join-relations). VP-level uses `/v/` (`vam`, `var`, `vul`, `vum`, `vel`, `vael`, `voel`, …) with **-l** / **-m** / **-r** only as joins; VP `-n` spellings (`van`, `von`, …) are [join-act verbs](special-vocabulary.md#join-act-verbs) — see [coordination.md](coordination.md).
* **Clause joins** (`xa` / `xo` / `xu` / `xao` / `xe` / `xae` / `xoe` + ending) — Vowel = join type (**e** / **oe** = ranked — unmarked / exclusive; **ae** = equality / tie); **-l** / **-m** = closed vs open committed lists on every join vowel; **-n** = soft packaging (*and then* **`xan`** / uncertain reconstruction / soft ranking / soft denial; **not** phrase named-list **-n**); **-r** on **a** / **o** / **e** / **u** = unspecified-member (*something happened* / *anything* / *whatever-by-rank* / *something else*; under [question](questions.md) = fill-ask) — **not** list continue. Same **right-close fence** as phrase and VP (nesting left-associative only; left fences illegal; pure infix illegal). Full table: [coordination.md](coordination.md#vp-clause-forms).
* **Cite / aside / mention / opaque markers** — Closed span series ([spans.md](spans.md)): **open** `{PoS}{TYPE}x{EDGE}{ENDING}` (e.g. `daxal`); TYPE = **a** cite / **e** aside / **o** mention / **u** opaque; EDGE = **a** multi / **e** clause-scoped / **o** atomic / **u** empty; **-l** = exact; **-m** = paraphrase; **-n** = proper (titled designation of the whole span — same mnemonic as content-word **-n**); **-r** = [span anaphor](spans.md#endings) (*that* cite / mention / … — ordinary pronoun, not a re-open). **Close** = **`xuxul`** (complete) / **`xuxur`** (truncated — **`-]`**) / **`xuxun`** (sic — **`#]`**) / **`xuxum`** (pop all) — not PoS/TYPE-matched; not clause-join soft **-n**. Named material *inside* cite / mention / aside still takes ordinary content-word **-n** (`z<Sam>n`, …). Opaque interiors are not parsed as Clarity.
* **Named discourse glue** — **-n** for titled section/agenda labels, official list-item names, and branded discourse frames (**other** `/x/` roots — not the clause-join vowel series, where **-n** is soft join packaging, and not span-fence markers). Like `/x/`…**-r** on [pronouns](pronouns.md) (*going back to subject X* / thread resume), titled `/x/`…**-n** is **discourse navigation**: a **thread shift** — *let’s now talk about X* (opening or moving to that named topic), not clause aboutness. English parallels: **[Item Zero]**, **[Appendix A]** as a discourse cite, a fixed ritual segue name. Ordinary *firstly* stays **-l**. Aligns with [number `/x/`…**-n**](numbers.md#number-as-discourse-marker-by-marker) (titled / official item name).

### Borrowed and cited forms

Foreign / code / raw non-lexicon surfaces use [opaque spans](spans.md) (`d<sushi>` / `duxol sushi` / `duxal` … `xuxul`). Use–mention and *the title/saying X* as a named unit use [mention](spans.md) (often **-n**); long work titles used as wording to pick out the work prefer [cite](spans.md) (often proper **-n**). Content-word **-n** marks a **name or fixed label** on ordinary or span-interior words. Span markers use **-l** / **-m** / **-n** / **-r** (exact / paraphrase / proper / span anaphor) — span **-n** matches this proper-name mnemonic for the **whole span**. **Nativized loans** (adapted Clarity root + ordinary PoS + ending) need no span — see [spans.md § Mentions, opaque, and loan words](spans.md#loans). Compact nativized **multipart** person/place names use **`x`-compounds**; long / mixed-PoS titles stay **cite** (or mention **-n** for the named-unit reading) — [phrasal proper names](#phrasal-proper-names).

### Summary

| PoS | **-n** means… |
|-----|----------------|
| `/z/` `/d/` `/b/` | This named entity (person, place, title, unique referent) |
| `/v/` | This named event, rite, performance, or titled action. Closed [join-act verbs](special-vocabulary.md#join-act-verbs) (`van`, `von`, …) live here as defective **-n**-only forms. |
| `/ɡ/` | This named style, tradition, brand, or category label. Closed [join-relations](special-vocabulary.md#join-relations) (`gan`, `gon`, …) live here as defective **-n**-only complex adjectives (unary `/b/`). |
| `/w/` | (Rare) this named scale, grade, or criterion on the preceding adjective |
| `/h/` | This named standard, channel, period, or official circumstance. Closed [join-relations](special-vocabulary.md#join-relations) (`han`, `hon`, …) live here as defective **-n**-only complex adverbs (unary `/b/`). |
| `/j/` vocative | Address this named person, place, or title |
| `/j/` interjection | This named formula or conventional call |
| `/j/` clause force | *(not used)* |
| `/x/` | Titled / official discourse label — thread shift (*let’s now talk about X*; other roots). On [span](spans.md) markers, **-l** / **-m** / **-n** / **-r** = exact / paraphrase / proper / span anaphor; closes are **`xuxul`** / **`xuxur`** / **`xuxun`** / **`xuxum`**. On clause joins, **-n** is soft join packaging (*and then* **`xan`** / uncertain reconstruction / soft ranking); **-r** on **a** / **o** / **e** / **u** is unspecified-member (*something happened*, …) — see [coordination.md](coordination.md). Ordinary *but* / *however* stay **-l** / **-m**. Phrase- and VP-level joins: [coordination.md](coordination.md); VP `-n` = [join-act verbs](special-vocabulary.md#join-act-verbs); `/ɡ/` `/h/` `-n` = [join-relations](special-vocabulary.md#join-relations) |

Do **not** use **-n** for generic first mention (**-l** / **-m**) or for resuming a prior mention (**-r**).

## Plural **-sh**

Plural grammar (**-sh** after the reference suffix; group referent on nouns/verbs/vocatives; collective on `/ɡ/`; unused on `/w/` `/h/` `/x/` and number words) lives in **[plurality.md](plurality.md)**. Short form: `…r` is one referent; `…rsh` is the group that includes that referent. Allowed word-final clusters: **-lsh**, **-msh**, **-nsh**, **-rsh** — see [phonology.md](phonology.md#phonotactics).

## Number-word exception

In [number words](numbers.md), the same four letters (**-l**, **-m**, **-n**, **-r**) have **number-specific** meanings instead of ordinary reference-suffix senses. After a PoS prefix, the number marker **r** may also form clusters that are not otherwise allowed; that is legal **only** in number words — see [phonology.md](phonology.md#phonotactics).

## Value-compound exception

On [value](values.md) compounds under `/h/` or `/w/` with an **`x`+a/e/o/u** stake half, the same four letters are specialized: on **`xa`** they mean **contact channel** (physical / mental / social / spiritual); on **`xe`** they mean **preference standing** (circumstantial / internal / habitual / protective); on **`xo`** they mean **prescription force** (invite / endorse / commit / bound); on **`xu`** they mean **changeability** (temporary / modifiable / irreversible / won't-now). Bare need words (no `x`-addition) are **topic** only and keep ordinary **-l / -m / -n / -r** for now. Details: [values.md](values.md).

On [ability](special-vocabulary.md#ability) compounds — **host + `x` + {a\|u}** (primary: `v<sing>xun`) or fallback **`egera` + `x` + {a\|u}`** (**`ABIL`**) — **-l / -m / -n / -r** are **changeability** on both **`xa`** (capable) and **`xu`** (incapable) — same senses as unmet **`xu`**, not contact / standing / force. **`xe`** / **`xo`** are undefined on ability. Need-root + `x…` stays [values](values.md). Details: [special-vocabulary.md](special-vocabulary.md).

On [role compounds](special-vocabulary.md#role-compounds) — **`{a\|u\|o} x ROOT`** (agent / patient / reltum) — **-l / -m / -n / -r** keep **ordinary** reference-suffix senses (kind / soft / titled / resume participant). Not contact / standing / force / changeability. Mid-word **`x`** families: [x-compounds.md](x-compounds.md).

## Join exception

On [joins](coordination.md), the same letters are specialized again: phrase-level **zal** / **zam** / **zan** / **zar** / **zol** / **zom** / **zor** / **zul** / **zum** / **zun** / **zur** / **zel** / **zem** / **zen** / **zer** / **zael** / **zoel** / … (and `/d/` `/b/` `/w/` forms) use **-l** / **-m** / **-n** for **closed** / **open** / **named** on every join vowel; `/ɡ/` **gal** / **gam** / **gar** / **gel** / … and `/h/` **hal** / **ham** / **har** / … use **-l** / **-m** / **-r** as joins or [restrictors](restrictors.md) — their **-n** spellings (`gan`, `han`, `gen`, `hen`, …) are closed [join-relations](special-vocabulary.md#join-relations) (unary `/b/`), not named lists. Rank vowels **e** / **ae** / **oe** / **ue** as usual. **-r** on **a** / **o** / **e** / **u** = [unspecified-member](coordination.md#unspecified-member-r-phrase) at all levels. VP-level **val** / **vam** / **var** / … use **-l** / **-m** / **-r** as joins; VP **-n** (`van`, `von`, …) = [join-act verbs](special-vocabulary.md#join-act-verbs). Clause **xal** / **xan** / … use **-l** / **-m** closed/open, **-n** soft packaging (*and then* **`xan`**), **-r** unspecified-member. All levels share a **right-close fence** (left fences illegal; [fence nesting](coordination.md#fence-nesting); pure infix illegal). There are no prefix-less joins. Prefix-less **al** / **am** / **an** / **el** / **em** / **en** / **ol** / **om** / **on** / **ul** / **um** / **un** are [revisers](revisers.md) (in-clause or discourse by placement). Details live in coordination.md / revisers.md.

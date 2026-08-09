# Numbers
<a id="numbers"></a>

Numerals are a **closed formal subsystem**, not ordinary lexicon roots. Open quantifiers (*many*, *all*, *some*, …) stay lexicon. This page owns numeral grammar: [digitless](#zero-digit-groups) forms, [digitless exponents](#digitless-exponents), [writing](#writing-preferred-shorthand), [percent](#percent-and-percentage-points), [ranges](#ranges), and [measure phrases](#measure-phrases). PoS-less stems after mid-word **`x`** on content roots are [numeric derivation](special-vocabulary.md#numeric-derivation) — not free clause-slot numerals.

A whole numeric value is **one word**, even when it contains several digit groups (or none).

**Prerequisites:** [core.md](core.md) Beginner (PoS prefixes); [reference-suffix.md](reference-suffix.md) Beginner (ordinary **-l** / **-m** / **-n** / **-r** — number endings differ); [plurality.md](plurality.md) Beginner (**-sh** is not used on number words).

## Beginner
<a id="beginner"></a>

### Word shape

```
[PoS] + r + V + ( [exponent?] [mantissa digits?] )* + [ending]
```

1. **PoS** — same prefix inventory as elsewhere; [roles for number words](#parts-of-speech-on-numbers) below.
2. **Number marker** — consonant **r** plus a vowel **V** (see [Marker vowel](#marker-vowel-referential-identity)). **V** is usually a single vowel; end-relative ordinals use digraph **`eu`**. The PoS+`r` cluster is a [number-only phonotactic exception](phonology.md#phonotactics).
3. **Zero or more digit groups** — each group is an optional exponent and optional mantissa digits (at least one of the two **when the group is present**, except a [digitless exponent](#digitless-exponents) group is **`ba`/`bu` alone**). Digits compound with **no** **x** separator. There is **no per-group polarity**; sign (when it applies) is once for the whole word — see [Sign](#sign). **No groups** = [unspecified magnitude](#zero-digit-groups) of that marker identity (or [digitless **-r** anaphora](#number-endings)).
4. **Ending** — `-l` / `-m` / `-n` / `-r` with [number-specific meanings](#number-endings) (not ordinary [reference suffix](reference-suffix.md) senses). Number words **do not** take plural **-sh** — group reference stays on ordinary nouns (see [plurality.md](plurality.md)).

**Writing** for free number words uses a [preferred shorthand](#writing-preferred-shorthand) for the marker and body (`g+3`, not *grarel*; digitless `g+`, not *gral*; end-relative `g#-2`, not *greudul`); speech is always the full CV form. [Numeric derivation](special-vocabulary.md#numeric-derivation) prefers the spelled CV form in running text — see [Style](#writing-style-numeric-vs-spelled).

**Lexicon rule:** Any stem that matches this grammar is a number, never an ordinary root. Dictionary generation must reject colliding roots. A number stem **after mid-word `x`** on a content host is [numeric derivation](special-vocabulary.md#numeric-derivation), not a free number word (and takes the host’s ordinary reference ending, not [number endings](#number-endings)).

### Parts of speech on numbers
<a id="parts-of-speech-on-numbers"></a>

The number word takes whichever PoS prefix the role needs (clause slot, interjection, or discourse glue). The stem (marker + digits + ending) does not change.

**Referential** prefixes (`/ɡ/`, `/z/`, `/d/`, `/b/`) use [marker identity](#marker-vowel-referential-identity) as-is — PoS only chooses the slot or modifier role. **Overlay** prefixes (`/v/`, `/h/`, `/j/`, `/x/`) keep that identity but add a role-specific reading — [Intermediate overlays](#number-overlays).

| Prefix | Role with a number |
|--------|--------------------|
| `/ɡ/` | **modifier** — referential: the number describes the preceding noun (*three cats*, *the second page*, *room 12*). Goes after the noun, like other adjectives. |
| `/z/` | **subject** — referential: the numeric value, digit-string, or rank is the subject. |
| `/d/` | **direct object** — referential: the number is the object (common for digit-strings / codes being dialed, entered, stated). |
| `/b/` | **argument noun** — referential: the number fills the `/b/` slot of a complex adjective or adverb (*of size 12*, host *on* + channel/label, host *at* + time when a relation is named, …). Bare temporal circumstance (no host) uses `/h/` + **`ro`** ([Time](#time)). |
| `/v/` | **verb** — overlay: the number is the clause’s action; see [by marker](#number-as-verb-by-marker). Not multiply/divide by N (use ordinary *multiply* / *divide* plus `/h/`). |
| `/h/` | **adverb** — overlay: see [by marker](#number-as-adverb-by-marker) (*N times*, ÷N, **time** via **`ro`**, *for the Nth time*). |
| `/j/` | **interjection** — overlay: see [by marker](#number-as-interjection-by-marker) (*N more!*, deficit, label/score call, place cheer). Left-edge or bare utterance only — [utterance-marker rules](core.md#utterance-markers-j). **Not** clause force. |
| `/x/` | **discourse marker** — overlay: see [by marker](#number-as-discourse-marker-by-marker). Does **not** fill a clause slot. |

**`/w/` (adjective adjunct):** numbers do not take `/w/`, and a `/ɡ/` number is not a host for `/w/` grading or framing. Degree and “aboutness” of a quantity use [number endings](#number-endings) (especially **-m** for approximate).


Digit-strings (`ro`…) usually take the argument role the clause needs (often `/d/`). Ordinals that modify a noun use `/ɡ/`; an ordinal used as a standalone rank uses `/z/`, `/d/`, or `/b/` as appropriate. Discourse list items use `/x/` + number ([by marker](#number-as-discourse-marker-by-marker): **`re`** / **`reu`** neutral forward / end-relative, **`ra`** corroborating, **`ru`** independent); *for the Nth time* uses `/h/` + **`re`** / **`reu`**; place cheer *First!* uses `/j/` + **`re`** — none of these is `/ɡ/`.

### Marker vowel (referential identity)
<a id="marker-vowel-referential-identity"></a>

**V** encodes the number’s **referential identity** — scalar vs ordinal vs digit-string. For **scalars**, **V** also carries the **sign of the whole number** (`a` positive, `u` negative). Forward ordinal **`e`** aligns with [rank join **e**](coordination.md#ranked-conjunction-e) (*rank*); end-relative ordinal **`eu`** is a **separate marker** (speech digraph), not join **`ue`** and not scalar **`u`**.

| V | Writing | Referent | Examples |
|---|---------|----------|----------|
| **a** | `+` | Positive **scalar** (count or measure amount) | `g+3` *three cats*; `g+` *plural / more than one*; `z+3` *three* (subj); `b+12` *of size 12* |
| **u** | `-` | Negative **scalar** | `d-3` *−3* (obj); `z-` *some negative amount*; `g-2` signed measure on a noun |
| **e** | `#` | **Ordinal** / rank **from the start** (same-generation cohort when [exp omitted](#ordinal-generation); see also [digitful generation](#ordinal-generation)) | `g#2` *the second page*; `g#` *some rank*; `z#2` *second* (rank as subject) |
| **eu** | `#-` | **End-relative ordinal** — rank **from the end** of the same cohort | `g#-2` *2nd from the end* / *penultimate*; `g#-1` ≡ last place end-framed ([from the end](#from-the-end)); `g#-` *some end-relative rank* |
| **o** | `_` | **Digit-string** / label (phones, IDs, “read the digits”) | `d_555,123,4567`; `d_` *some code*; `g_12` *room 12*-style; `b_…` under a host relation |

Do not combine conflicting identity types on one word (e.g. do not use `re` and `ro` for the same token). In [preferred writing](#writing-preferred-shorthand), the marker is **`+`** / **`-`** / **`#`** / **`#-`** / **`_`** (not written `r`+V). Write end-relative as **`#-`** after PoS (or after an ending mark): `g#-2`, never `g-#2` (that looks like scalar **`-`** then ordinal).

#### Sign
<a id="sign"></a>

| Identity | How sign works |
|----------|----------------|
| **Scalar** (`a` / `u`, written `+` / `-`) | Sign **is** **V**. Multi-group scalars share one sign for the whole word (e.g. −1 000 265 004 is one **`ru`** word). |
| **Forward ordinal** (`e`, written `#`) | **No scalar-style sign extender.** Direction *from the start* is the marker itself. End-relative place uses the **separate** marker **`#-`** / **`eu`**, not `#` plus a minus. |
| **End-relative ordinal** (`eu`, written `#-`) | Direction *from the end* **is** the marker. Digits are the count-back index (`#-1` = last, end-framed). |
| **Digit-string** (`o`, written `_`) | **Unsigned only.** Do **not** write `_-…`. |

Do **not** insert speech **`ru`** after **`re`** / **`reu`** / **`ro`**. Do **not** write join-shaped **`ue`** as a number marker — end-relative speech is **`eu`** (`reu…`). If a negative-looking **label** must be described (a code that includes a minus), use ordinary lexicon plus an unsigned digit-string — not a numeral sign extender.

There is no separate “mathematical object” marker. To talk about a number as an entity, use a scalar (**`ra`** / **`ru`**) in a referential slot (often with ordinary wording such as the noun *number*), not a distinct numeral class.

`/v/`, `/h/`, `/j/`, and `/x/` still choose among the same markers, but each overlay gives that identity a **role-specific** reading (add vs ×N vs *N more!* vs corroborating/independent list item, and so on) — [Intermediate overlays](#number-overlays).

### Number endings
<a id="number-endings"></a>

Ordinary [reference suffix](reference-suffix.md) senses do **not** apply inside number words. Speech keeps the ending letter; [preferred writing](#writing-preferred-shorthand) uses a **second-slot mark** after PoS (same glyphs as [span fences](spans.md)).

| Ending | Meaning | Preferred writing |
|--------|---------|-------------------|
| **-l** | Exact, newly stated (default) | *(none)* — `g+3`, `g+` |
| **-m** | Approximate / non-literal (“about N”) | **`~`** after PoS — `g~+3`, `g~+` |
| **-n** | Conventional / proper designation (titles, official labels, *the Second…*) | **`@`** after PoS — `g@#2`, `g@+1e` |
| **-r** | Anaphoric resume of a previously stated number, code, or rank | **`=`** after PoS — `g=+`, `x=#2`, `d=_` |

**-r** may be **digitless**: marker + **-r** alone resumes the prior value of that identity without restating digits (`g=+` = *that (scalar) amount again*; `d=_` = *that code again*; `g=#` = *that rank again*). Digits + **-r** still fine when you want to name which prior item (`x=#2` = *as in (2) above*). Marker must match the resumed identity (do not resume a scalar with `g=#`). **`=`** does **not** combine with **`~`** / **`@`**.

On [digitless](#zero-digit-groups) words, **-l** / **-m** / **-n** keep the same discourse jobs relative to the unspecified magnitude (*exact plural count* / *about several* / *conventional “plural” or unlabeled-rank style*, etc.).

### Zero digit groups
<a id="zero-digit-groups"></a>
<a id="digitless-numbers"></a>
<a id="bare-marker"></a>

A number word may omit every digit group: **PoS + marker + ending** only. The marker still fixes referential identity. With **-l** / **-m** / **-n**, the magnitude (or label/rank payload) is **unspecified** as in the table below. With **-r**, the word is [digitless anaphora](#number-endings) only — resume a prior value of that identity; it does **not** introduce a new unspecified magnitude.

| Marker | Writing | Digitless sense | Partition / notes |
|--------|---------|-----------------|-------------------|
| **`ra`** | `…+` (etc.) | Unspecified **positive scalar**, specialized to **plural count / amount `>1`** | Complements `…+0` (zero), `…+1` (one), `…+N` (exact N≥2). Not “any non-negative,” not “≥0.” |
| **`ru`** | `…-` | Unspecified **negative scalar** (*some negative amount*; deficit of unnamed size) | Exact negatives stay `…-N`. |
| **`re`** | `…#` | Unspecified **rank from the start** (*some nth* / *some place*) | Exact ranks stay `…#N`. |
| **`reu`** | `…#-` | Unspecified **end-relative rank** (*some nth from the end*) | Exact end-relative ranks stay `…#-N`. |
| **`ro`** | `…_` | Unspecified **digit-string / label** (*some code*; *a label*) | Exact labels stay `…_…`. |

**Vs noun plural `-sh`:** `-sh` marks that a **referent is a group** ([plurality.md](plurality.md)) — indefinite group introduction stays **-lsh** / **-msh**, not digitless. Digitless **`ra`** marks that a **count/amount is `>1`** without naming N. They are different jobs (quantity vs group-reference) and may co-occur (`zagadalsh g+3`). Do **not** treat `g+` as a replacement for noun **-lsh**, nor as plural morphology on verbs, circumstance, or number words themselves.

**Vs fence `-r`:** phrase **`zar`** / **`zor`** / … pick an unspecified **member of an inventory**. Digitless number **-r** resumes a **prior numeric value**. Digitless number **-l** (etc.) introduces an unspecified magnitude of that marker — not inventory membership.

**Overlays** inherit the same emptiness (marker identity → role reading, payload unspecified):

| Overlay | Digitless examples |
|---------|-------------------|
| `/ɡ/` `/z/` `/d/` `/b/` | `g+` *plural / more than one* (on a noun); `z-` *some negative amount* (subj); `b#` *of some rank*; `b#-` *of some end-relative rank*; `d_` *some code* (obj) |
| `/v/` | Unspecified amount under the verb sense: **`v+`** *increase*; **`v-`** *decrease*; **`v#`** *take / assign some rank*; **`v#-`** *take some end-relative place*; **`v_`** *enter / dial some code*. Soft: **`v~+`** *increase a bit*; **`v~-`** *decrease a bit* |
| `/h/` | Unspecified amount under the adverb sense: **`h+`** *multiple times*; **`h-`** *÷ / into some number of parts*; **`h#`** *for some nth time*; **`h#-`** *for some nth-from-last time*; **`h_`** *at some clock or date* (still bare-`hro` **time** only — not channel codes). Soft: **`h~+`** *a few times*; **`h~-`** *÷ a bit* / *into a few parts* |
| `/j/` | **`j+`** *More!*; **`j-`** *Short!* / *down by some amount!*; **`j#`** *Nth!* (place cheer, rank unnamed); **`j#-`** *Nth-from-end!*; **`j_`** *…!* (unspecified score / code call). Soft: **`j~+`** *a bit more!* |
| `/x/` | `x#` *some point:* (neutral, number unnamed); `x#-` *some end-relative point:*; `x+` / `x-` corroborating / independent item of unnamed index; `x_` *regarding some (unnamed) label* |

**`h_` vs `har`:** digitless time `h_` is still a **number word** (unspecified clock/date reading under bare `hro`). Circumstance **`har`** (*sometime*) is the [restrictor](restrictors.md), not a numeral — do not swap them.

**Illegal with zero groups:** percent / percentage-point closers (**`jo`** / **`ju`**) still need a mantissa group — bare `…+%` is not a shortcut for “some percent.” Exponent-only groups with **digits** (`e9`) are **not** zero-group forms; they are ordinary one-group bare OoM. Exponent markers **without** digits are [digitless exponents](#digitless-exponents) (special values) — also not zero-group forms.

### Digits

Remapped CV syllables (current vowels; preferred voiced consonants):

| Digit | Syllable |
|-------|----------|
| 1 | wo |
| 2 | du |
| 3 | re |
| 4 | mo |
| 5 | va |
| 6 | gu |
| 7 | le |
| 8 | ha |
| 9 | na |
| 0 | zo |


How each syllable sounds: [phonology.md](phonology.md).

### Exponents

Within each digit group, speech markers build ordinary magnitudes (and later specials):

| Marker | Role |
|--------|------|
| **ba** | Positive exponent, followed by the exponent’s digits |
| **bu** | Negative exponent, followed by the exponent’s digits |
| **ja** | After exponent digits when a **mantissa follows** (not a digit) |
| **je** | **Decimal point** (not a digit) |
| **jo** | **Percent** closer — [percent](#percent-and-percentage-points) |
| **ju** | **Percentage-point** closer — [percent](#percent-and-percentage-points) |

- The **exponent comes before** the group’s mantissa digits.
- If a mantissa follows the exponent, say **`ja`** after the last exponent digit, then the mantissa. Example: `27e12` → `ba` + `wo` + `du` + `ja` + `du` + `le`.
- **Bare order of magnitude** (exponent only, no mantissa): use `ba`/`bu` + exponent digits and **omit** **`ja`**. Example: *e9* → `ba` + `na`. Decade-band readings: [Bare OoM](#bare-oom-bands).
- Ordinary magnitudes usually **omit** exponent **`0`** — `g+3`, not `*g+3e0`. Named **`e0`** / ambient scale: [Ambient scale](#ambient-scale).
- Default scale uses **engineering notation**: exponents are usually multiples of **3** (e.g. `27e6`, not `2.7e7`).
- **Decimal point:** say **`je`** after the digit(s) left of the point; digits after **`je`** are the fractional part.
- **No metric prefixes** in the lexicon — base unit + exponent / exact count on the amount ([measure phrases](#no-metric-prefixes)).

Digitless specials (+∞, last place, hyperbole, zero×exp, …) and ordinal **generation** offsets: [Intermediate](#intermediate) / [Advanced](#advanced).

### Writing (preferred shorthand)
<a id="writing-preferred-shorthand"></a>

Speech always uses the full CV grammar above (marker as `r`+V; ending as **-l** / **-m** / **-n** / **-r**). For **free number words**, writing prefers shorthand for the ending, marker, and body. Which surface to use when (shorthand vs spelled CV) is [style](#writing-style-numeric-vs-spelled), not grammar — parsers accept both.

```
[PoS] + [~|@|=]? + [marker] + [body?]
```

#### Ending marks (second slot, after PoS)

Same glyphs and jobs as [span-fence marks](spans.md#writing) (**`~`** soft / **`@`** proper); anaphor uses **`=`** (keyboard-friendly; spans use interior **`=`** — `d[=]`).

| Mark | Speech ending | Job | Examples |
|------|---------------|-----|----------|
| *(none)* | **-l** | exact (default) | `g+3`, `g+`, `x#2`, `d_555,123,4567` |
| **`~`** | **-m** | approximate / soft | `g~+3`, `g~+`, `g~+27e6`, `g~#e` |
| **`@`** | **-n** | conventional / proper | `g@#2`, `g@+1e`, `x@#e` |
| **`=`** | **-r** | anaphoric resume | `g=+`, `d=_`, `x=#2`, `g=#1e` |

Order when both **`@`** and **`~`** apply: **`@` then `~`**. **Do not write** the stack with both glyphs — spell **`@`** only, with uncertain tonality (same hedge habit as spans). **`=`** does **not** combine with **`~`** / **`@`**. Full phonetic spelling with a trailing ending letter (e.g. *grarel*, *gram*) is the [style default](#writing-style-numeric-vs-spelled) for [numeric derivation](special-vocabulary.md#numeric-derivation); on free number words it is fine as a pronunciation gloss, not preferred in running text.

#### Marker (not written as `r`+V)

| Symbol | Speech | Meaning |
|--------|--------|---------|
| **`+`** | `ra` | Positive scalar |
| **`-`** | `ru` | Negative scalar |
| **`#`** | `re` | Ordinal (from the start) |
| **`#-`** | `reu` | End-relative ordinal (from the end) |
| **`_`** | `ro` | Digit-string |

Place the identity symbol **immediately after** any ending mark (or after PoS when exact), **before the body** (or alone when the body is empty): `g+3`, `g~+3`, `g=+`, `d_555,123,4567`, `d=_`, `g@#2`, `g#-2`, `g~#-2`. Marker **`#-`** is one identity (two glyphs); do **not** write `g-#2`. After bare **`_`**, do **not** write a following **`-`** (labels stay unsigned) — see [Sign](#sign).

#### Body

| Speech | Preferred writing |
|--------|-------------------|
| *(no digit groups)* | *(empty after marker)* `g+`, `g~-`, `g=#`, `g=#-`, `h_` |
| Digit syllables (`wo`…`zo`) | Arabic **`0`–`9`** |
| `ba` / `bu` (+ `ja` when a mantissa follows) | **`e`** / **`e-`** (engineering, scientific, or [ordinal generation](#ordinal-generation)) |
| `ba` / `bu` with **no** digits ([digitless exp](#digitless-exponents)) | **`e`** / **`e-`** with no power digits — specials `g+e`, `g+e-`; zero×digitless `g+0e`, `g+0e-`, `g#0e`; hyperbole `g+1e`, `g+1e-`, `g#1e`, `g#1e-` |
| named exp **`0`** (bare OoM / assert) | **`e0`** — ones band `g+e0`; assert `g+3e0` / `g#e0` (omit still usual when ones/current is clear; [ambient](#ambient-scale)) |
| mantissa **`0`** + digitful **`e-1`** ([engineering null](#zero-exponent)) | **`0e-1`** — `g+0e-1` / `g-0e-1` only |
| `je` | **`.`** |
| `jo` | **`%`** |
| `ju` | **`%*`** |

Do **not** write out **`ja`**, **`je`**, **`jo`**, or **`ju`** in shorthand — use `e` / `.` / `%` / `%*` instead.

**Commas** separate digit groups for readability (preferred for multi-group values). Commas are orthographic only; they are not spoken and do not change the word. Digitless forms have no commas.

For long values, break into digit groups of at most three mantissa digits (plus their exponents); all groups still sit in **one** word after a single marker.

### Starter examples

Prefer shorthand in free slots. Speech is always the full CV form.

| Value | Writing | Reading |
|-------|---------|--------|
| plural / more than one | `g+` | *more than one* (digitless **`ra`**) |
| three (modifier) | `g+3` | *three* (on a noun) |
| three (subject) | `z+3` | *three* |
| −3 (object) | `d-3` | *−3* |
| second (modifier) | `g#2` | *the second* |
| about 3 | `g~+3` | approximate (**-m**) |
| that amount again | `g=+` | digitless **-r** resume |
| room 12 | `g_12` | digit-string label |

Full inventory tables: [Intermediate examples](#examples).

## Intermediate
<a id="intermediate"></a>

### Overlay roles (`/v/` `/h/` `/j/` `/x/`)
<a id="number-overlays"></a>

Overlay prefixes keep marker identity but add a role-specific reading. Referential prefixes (`/ɡ/` `/z/` `/d/` `/b/`) use the marker as-is — [Beginner marker vowel](#marker-vowel-referential-identity).

#### Number as verb (by marker)
<a id="number-as-verb-by-marker"></a>

`/v/` + number inherits the marker’s identity, so the action type follows **V**.

| Marker | Verb sense |
|--------|------------|
| **`ra`** | **Add N / increase by N** — transitive *add N of (object)* / *increase (object) by N*; intransitive *grow by N* when the patient is clear from context. |
| **`ru`** | **Remove N / decrease by N** — transitive *remove N of (object)* / *decrease (object) by N*; intransitive *shrink by N*. |
| **`re`** | **Take / assign rank N (from the start)** — intransitive *place Nth* / *come in Nth*; transitive *put (object) in Nth place* / *rank as Nth*. |
| **`reu`** | **Take / assign Nth-from-end place** — intransitive *place Nth from the end* / *come in penultimate* (etc.); transitive *put (object) Nth from the end*. |
| **`ro`** | **Enter / dial / input that digit-string** — type the code, dial the phone number, key the ID. Object (if any) is the channel or device; the digits are in the verb. |

“Set to N” (bring a quantity to an absolute value) is not a number-verb sense — use an ordinary verb plus the number as argument or adverb. Multiply/divide likewise stay ordinary verbs plus the number as `/h/` (**`h+N`** / **`h-N`**). With [percentage points](#percent-and-percentage-points) (**`ju`**), **`ra`** / **`ru`** as verbs mean increase/decrease by that point amount (not a relative %-change factor).

Endings still apply (**-m** ≈ *about* that amount/code/rank, **-r** resume — including [digitless](#zero-digit-groups) `v=+` / `v=_`, etc.).

#### Number as adverb (by marker)
<a id="number-as-adverb-by-marker"></a>

`/h/` + number inherits the marker’s identity, so the adverbial role follows **V**.

| Marker | Writing | Adverb sense |
|--------|---------|--------------|
| **`ra`** | `h+N` | **Multiplicative / factor** — *N times*; *×N*; *by a factor of N* (alone, or with ordinary *multiply*). |
| **`ru`** | `h-N` | **Inverse / partition** — *÷N*; *into N parts*; *1/N as often*; *every Nth* (alone, or with ordinary *divide*). |
| **`re`** | `h#N` | **Nth occurrence of the event (from the start)** — *for the Nth time*; *on the Nth try* (clause-event ordinal, not discourse list independence). |
| **`reu`** | `h#-N` | **Nth-from-last occurrence** — *for the Nth-from-last time*; *the penultimate time* (`h#-2`). |
| **`ro`** | `h_…` | **Temporal circumstance only** — *at 15:30*; *on 2026-07-22* (clock or calendar digit reading). **Not** channel, frequency, gate, or other non-time codes — those use a host relation + `/b/` (or `/ɡ/` on a noun). See [Time](#time). |

Contrasts:

- `h+3` — *three times* / ×3
- `h-3` — ÷3 / every third / into 3
- `h+` — *multiple times* (unspecified)
- `h#e` — *for the last time*
- `h#e-` — *for the first time* (onset landmark; contrast numbered `h#1`)
- `h#-2` — *for the penultimate time* ([from the end](#from-the-end))
- `h_15,30` — *at 15:30* (bare `hro` = time; [Time](#time))
- `h_2026,07,22` — *on 2026-07-22* (bare `hro` date)
- `/h/` *on* + `b_101.1` — *on 101.1* (non-time code; not bare `h_…`)
- `h#3` — *for the third time*
- `h#1e` — *for the gazillionth time* ([hyperbole](#hyperbole-gazillion))
- `j#3` — *Third!* (place cheer)
- `j#-2` — *Penultimate!*
- `j#e` — *Finally!* ([digitless exp](#digitless-exponents))
- `j+e` — *To infinity!*
- `x#3` — *point 3:* (neutral discourse item)
- `x#-2` — *2nd-from-end point:*
- `g#3` — *the third* (modifies a noun)
- `g#-2` — *the penultimate* (modifies a noun)
- `v+3` — *add 3* (verb)
- `v+` — *increase* (unspecified amount)
- `v#e` — *take last place*
- `v#-2` — *take / come in 2nd from the end*

Endings still apply (**-m** ≈ *about* that many times / that clock or date, **-r** resume — including digitless `h=+` / `h=_`). Relative %-change factors use **`h+…`** (e.g. ×1.5), not **`jo`** / **`ju`** alone — see [percent](#percent-and-percentage-points).

#### Number as interjection (by marker)
<a id="number-as-interjection-by-marker"></a>

`/j/` + number is an **interjection** (expressive call-out), not clause force. Clause force stays the closed non-numeric set in the [utterance-marker section](core.md#clause-force). Number interjections appear only in the left-edge `/j/` cluster (before force, when a clause follows) or as a bare utterance with no force.

| Marker | Writing | Interjection sense |
|--------|---------|-------------------|
| **`ra`** | `j+N` | **Quantity addition** — *Three more!*; *Ten more!* (add N to the relevant count / tally / order). |
| **`ru`** | `j-N` | **Deficit / shortfall call** — *Three short!*; *Three fewer!*; *Down by 2!*; *−3!* (mirror of `j+`). |
| **`re`** | `j#N` | **Place / rank cheer (from the start)** — *First!*; *Second!* (podium / place shout). |
| **`reu`** | `j#-N` | **End-relative place cheer** — *Penultimate!*; *Last!* end-framed (`j#-1`). |
| **`ro`** | `j_…` | **Digit-label / magnitude call-out** — *Three!*; *B-12!*; *five-five-five!*; score, bingo, code, or ID as a bare reading of the digits (not “N more”). |

**Label vs addition:** bare English *Three!* / *Twelve!* as naming a score, ball, or count → **`j_`**. *Three more!* (increment the tally) → **`j+`**. Bingo / room codes / phone fragments → **`j_`**.

Contrasts:

- `j_3` — *Three!* (label / score / count reading)
- `j+3` — *Three more!* (quantity addition)
- `j-3` — *Three short!* / *Three fewer!* / *−3!* (deficit)
- `j_27` — *Twenty-seven!* as label call
- `j#1` — *First!* (place cheer)
- `j#-2` — *Penultimate!* / *Second from last!* ([from the end](#from-the-end))
- `j#e` — *Finally!* (coda cheer — [digitless exp](#digitless-exponents); contrast **`x#e`** *Finally:*)
- `j#e-` — *(finally, we're) starting!* (onset cheer; contrast **`x#e-`** *Starting with:*)
- `j+e` — *To infinity!*
- `j#1e` — *Gazillionth!* (comic late place cheer — [hyperbole](#hyperbole-gazillion))
- `j#1e-` — *Gazillionth-first!* (comic early place cheer)
- `x#1` — *point 1:* (neutral discourse item)
- `x#-1` — *1st-from-end point:* / *Starting with the last one:*
- `h#1` — *for the first time* (numbered)
- `h#e-` — *for the first time* (onset landmark)
- `h#e` — *for the last time*
- `h#1e` — *for the gazillionth time*
- `h#-2` — *for the penultimate time*
- `v#1` — *take / assign 1st* (verb)
- `v#e` — *take last place*
- `v#e-` — *take starting place*
- `v#-2` — *take 2nd from the end*

Endings still apply (**-m** fuzzy *about three more!* / *about three!*, **-n** conventional call name, **-r** resume a prior shout’s value — digitless `j=+` / `j=_` allowed).

#### Number as discourse marker (by marker)
<a id="number-as-discourse-marker-by-marker"></a>

`/x/` + number is discourse glue for numbered list items and label cites. Marker vowel encodes **independence framing** of the list item (or cite-as-label for **`ro`**), except **`reu`** / **`#-`**, which marks **end-relative** place in the list (not independence). It does **not** occupy a main-clause argument or adjunct slot (contrast `/ɡ/` *the second page*, `/h/` *three times* / *for the Nth time*, `/j/` interjection shouts).

| Marker | Writing | Discourse sense |
|--------|---------|-----------------|
| **`re`** | `x#N` | **Neutral point N** — numbered item from the start, no independence framing (*point N:*, *note N:*, bare *(N)*). |
| **`reu`** | `x#-N` | **End-relative point N** — count back from the last agenda slot (*Nth-from-end point:*, *penultimate item:*). **`x#-1`** ≡ **`x#e`** *Finally:* end-framed (*Starting with the last one:*). Writing **`x#-2`** ≠ independent **`x-2`**. |
| **`ra`** | `x+N` | **Corroborating item N** — backs, restates, or same-directions an earlier item (*corroborating N:*, *echoing N:*). Legitimate for emphasis, clarity, teaching, or a related source—not a new line of support. |
| **`ru`** | `x-N` | **Independent item N** — a new line of support or consideration (*independent N:*, *distinct N:*). Would still matter if other listed items were gone. |
| **`ro`** | `x_…` | **Cite a discourse label** — agenda item, section code, slide, ticket id (digits as label, not independence framing) (*regarding item 12; under 3.2*). |

**Last point / *Finally*:** digitless-exp last-place under `/x/` + **`re`** is defined — **`x#e`** = *Finally:* / *last point:* (committed coda item). Soft **`x~#e`** = near-final / soft wrap-up point; named **`x@#e`** = ritual / titled *Finally*; **`x=#e`** resumes that last-point marker. End-framed twin: **`x#-1`**. This is **not** discourse reviser **`al`** (*additionally* — [revisers.md](revisers.md#discourse-revisers)).

**Starting point / *Starting with*:** digitless-exp start-place under `/x/` + **`re`** — **`x#e-`** = *Starting with:* / *to begin:* (committed opening item; beginning/onset framing, **not** English *firstly*). Soft **`x~#e-`** = near-start / soft lead-in; named **`x@#e-`** = ritual / titled *Starting with*; **`x=#e-`** resumes that start-point marker. Ordinary numbered *firstly* stays **`x#1`**.

**Nested agenda (digitful exp):** under `/x/`, [ordinal generation](#ordinal-generation) = **outline depth** relative to the focused agenda item — **`x#3e2`** = *3rd sub-sub-point under the focus*; **`x#e-1`** = *parent-layer item(s)*; **`x#e0`** = *current-layer item(s)* (assert this outline level). Flat talks stay **`x#N`** / **`x#-N`** / landmarks.

Other `/x/` no-mantissa digitless-exp forms (**`x+e`**, **`x-e`**, …) stay **undefined** — except notional **`x-e-`** ([digitless exponents](#imaginary)). Mantissa + digitless-exp discourse indices: **`x#1e`** *umpteenth point:* / **`x#1e-`** *umpteenth-first point:* ([hyperbole](#hyperbole-gazillion)) — not end-relative (use **`x#-N`**) and not the start/last landmarks.

**Independence framing:** **`#`** = unmarked inventory or steps (from the start); **`#-`** = end-relative inventory; **`+`** = corroborating; **`-`** = independent (new line of support). Do not use **`+`** / **`-`** for for/against or open vs scratch a bullet — independence is the point. Ordinary *firstly / secondly* without that framing is **`x#N`**. *Starting with* without a numeric step count is **`x#e-`**; *Finally* without a numeric step count is **`x#e`** (or end-framed **`x#-1`**). For/against and both-sides checks stay in ordinary wording or claim-level evidentiality, not on the number marker.

Contrasts:

- `g#2` — *the second* (modifies a noun)
- `g#-2` — *the penultimate* (modifies a noun)
- `x#2` — *point 2:* (neutral discourse item)
- `x#-2` — *2nd-from-end point:* / *penultimate item:*
- `x#-1` — *1st-from-end point:* / *Starting with the last one:* (≡ **`x#e`** end-framed)
- `x#e-` — *Starting with:* / *to begin:* (digitless start-place under `/x/`)
- `x#e` — *Finally:* / *last point:* (digitless last-place under `/x/`)
- `x#3e2` — *3rd nested point at depth +2:* ([ordinal generation](#ordinal-generation))
- `j#e-` — *(finally, we're) starting!* (onset cheer)
- `j#e` — *Finally!* (coda cheer)
- `j+e` — *To infinity!*
- `x+2` — *corroborating 2:*
- `x-2` — *independent 2:* (≠ **`x#-2`**)
- `h#2` — *for the second time* (event ordinal adverb)
- `j#2` — *Second!* (place cheer)
- `j_3` — *Three!* (label / score reading)
- `j+3` — *Three more!* (quantity addition)
- `j-3` — *Three short!* / *Three fewer!* / *−3!* (deficit)

Endings still apply (**-l** newly stated item, **-r** *as in (N) above* or digitless `x=#` / `x=#-` / `x=+` / … for *as in that item above* with same marker framing, **-n** titled / official item name, **-m** fuzzy *around item N*; on last-place **`x#e`** / **`x~#e`** / **`x@#e`** / **`x=#e`** and start-place **`x#e-`** / **`x~#e-`** / **`x@#e-`** / **`x=#e-`** as above). Percent / percentage-point closers are not used with `/x/` numbers.


### Bare OoM decade bands
<a id="bare-oom-bands"></a>
<a id="bare-oom"></a>

**Bare** order of magnitude (exponent digits, **no mantissa**) names the **half-open decade band** `[10ᴷ, 10ᴷ⁺¹)`, not “K and every larger engineering step.”

| Form | Band | Gloss |
|------|------|--------|
| **`g+e0`** | `[10⁰, 10¹)` = **1–9** | *ones* (some amount in the ones place) |
| **`g+e1`** | `[10¹, 10²)` = **10–99** | *tens* |
| **`g+e2`** | `[10², 10³)` = **100–999** | *hundreds* |
| **`g+e3`** | `[10³, 10⁴)` = **1000–9999** | *thousands* — **not** tens/hundreds of thousands (`e4` / `e5`) |
| **`g+e6`** | `[10⁶, 10⁷)` | *millions* band only |
| **`g-e3`** | `(−10⁴, −10³]` polarity with **`ru`** | negative thousands band |

Same under `/z/` `/d/` `/b/`. Soft **`g~+e3`** ≈ *about in the thousands band*. Exact count inside a band uses a mantissa (`g+4e3` = 4000), not bare OoM.

**Overlays** inherit the band as the verb/adverb magnitude: **`v+e3`** *increase by a thousands-band amount*; **`h+e0`** *× a ones-band factor*; **`j+e3`** *Thousands!* (band cheer).


### Ambient scale (casual)
<a id="ambient-scale"></a>

In **formal** writing and careful speech, treat **omitted exp as ones-place** (`g+3` = 3). **Do not** rely on a discourse-default decade.

**Casually**, measure-heavy talk may establish an **ambient OoM** (often an engineering `e3` / `e6` / …) and elide repeating exponents — bare mantissas then heard at that ambient scale. That habit is **discouraged** in the reference standard but expected in informal use.

**Named `e0` asserts OoM 0** and cancels ambient inheritance:

| In a stretch where ambient OoM = 3 | Reading |
|------------------------------------|---------|
| **`g+3`** (casual ambient) | *three at ambient* → often 3×10³ |
| **`g+3e3`** | *three at 10³* (exp explicit) |
| **`g+3e0`** | *three at OoM 0* → 3×10⁰ = **3** (break out of ambient) |
| **`g+e0`** | *ones-band amount* (bare OoM), not ambient thousands |

**`Ne0`** is the normal assert form (any mantissa **`N≠0`**). Formal prose that never uses ambient still rarely needs **`e0`**; omit remains fine when ones-place is already clear.


### From the end — end-relative ordinal marker **`#-`** / **`eu`**
<a id="from-the-end"></a>
<a id="nth-from-the-end"></a>
<a id="negative-ordinal"></a>

**End-relative place** uses marker **`eu`** (writing **`#-`**), not mantissa + digitless **`bu`** on forward **`#`**. Count back from last place within the **same generation / cohort** (exp omitted). Exact (or soft) end-relative ordinal; **not** hyperbole and **not** the no-mantissa start landmark **`g#e-`**.

Speech is **`reu`** + digits + ending (e.g. `g#-2` → *greudul*). Digraph **`eu`** avoids colliding with rank-join **`ue`**.

| Form | Reading |
|------|---------|
| **`g#-1`** | *1st from the end* — same referent as last-place **`g#e`**, framed as counting from the end (English *Starting with the last one*) |
| **`g#-2`** | *2nd from the end* / *penultimate* |
| **`g#-3`** | *3rd from the end* / *antepenultimate* |
| **`g~#-2`** | *about 2nd from the end* |
| **`g@#-2`** | conventional / titled *penultimate* (etc.) |
| **`g=#-2`** | resume that prior end-relative place |
| **`g#-`** | unspecified end-relative rank ([zero groups](#zero-digit-groups)) |

**Contrast:** **`g#2`** = numbered *2nd* (from the start); **`g#-2`** = *2nd from the end*; **`g#e`** = last as landmark; **`g~#e`** = near last (no count); **`g#e-`** / **`g~#e-`** = start / near first (no mantissa); **`g#2e-`** = early hyperbole (not penultimate); **`g#2e-1`** = 2nd of gen −1 ([generation](#ordinal-generation)).

**Overlays** inherit:

| Form | Reading |
|------|---------|
| **`h#-2`** | *for the 2nd-from-last time* / *the penultimate time* |
| **`v#-2`** | *place / come in 2nd from the end* |
| **`j#-2`** | *Penultimate!* / *Second from last!* |
| **`x#-1`** | *1st-from-end point:* / *Starting with the last one:* (counting twin of **`x#e`** *Finally:*) |
| **`x#-2`** | *2nd-from-end point:* / *penultimate item:* |

Digitless-exp and hyperbole on **`#-`** stay **undefined**. Combine with [digitful generation](#ordinal-generation) when needed: **`g#-3e2`** = 3rd from the end **in generation +2**.


### Ordinal generation — digitful exponent on **`#`** / **`#-`**
<a id="ordinal-generation"></a>
<a id="generation-ordinal"></a>

On forward **`#`** / **`re`** and end-relative **`#-`** / **`reu`**, a **digitful** exponent is **not** scalar power-of-ten. It is **generation offset** from the **focused item** (kinship, version line, nested outline, …):

| Piece | Job |
|-------|-----|
| **Marker `#` / `#-`** | Count **from the start** / **from the end** within that generation’s cohort |
| **Digitful exp `eK` / `e-K`** | Generation **+K** (descendants / nested deeper) or **−K** (ancestors / enclosing layer) |
| **Mantissa** | Which **slot** in that cohort (omit mantissa = bare OoM: the generation as a whole) |
| **Exp omitted** | **Same generation** as the focus (`g#3` = 3rd peer) — formal default |
| **Named `e0`** | **Assert current generation** (gen 0) — parallel to scalar [OoM-0 assert](#ambient-scale); usually redundant when omit already means current, but cancels casual “ambient generation” elision |

| Form | Reading |
|------|---------|
| **`g#3`** | 3rd of the focus’s own generation (from the start) |
| **`g#-3`** | 3rd of the focus’s own generation (from the end) |
| **`g#3e0`** | 3rd of the **current** generation, exp asserted (gen 0) |
| **`g#e0`** | **current generation** cohort as a whole (member unspecified) |
| **`g#3e2`** | 3rd from the start **in generation +2** (e.g. 3rd in the grandchild cohort) |
| **`g#3e-2`** | 3rd from the start **in generation −2** (e.g. 3rd in the great-grandparent cohort) |
| **`g#-1e2`** | last of generation +2 (end-framed within that cohort) |
| **`g#e2`** | generation +2 cohort as a whole (member unspecified) |
| **`g#e-1`** | generation −1 / parent layer (member unspecified) |
| **`g#1e-1`** | 1st of generation −1 (often *the parent* when the cohort is singleton-framed) |

**Not** this cell: digitless **`g#e`** / **`g#e-`** = telos / origin **landmarks** (extremes of the axis); digitless mantissa forms **`g#1e`** / **`g#1e-`** = [hyperbole](#hyperbole-gazillion); digitless **`g#0e`** = [rank annihilated](#rank-annihilated) (not generation). Do **not** read **`g#2e-`** as *grandparent* — use **`g#e-2`** / **`g#1e-2`**. Do **not** read **`g#0e-1`** as engineering null — that is scalar **`g+0e-1`**.

**Overlays:** `/x/` treats generation as **agenda nesting** (`x#3e2` = *3rd sub-sub-point under the focus*; **`x#e0`** = *current-layer item(s)* / assert this outline level). `/h/` / `/v/` / `/j/` inherit the same product (*for the 3rd time in gen +2*, *place 3rd in gen +2*, …) when the series is generation-structured; flat event counts stay **`h#N`**.

**Derivation:** free generation is series-relative; kind morphs keep digitless **`ROOTx#e-`** / **`ROOTx#e`** as origin / telos of the **kind** — no productive free-style **`ROOTx#-N`** or **`ROOTx#NeK`** in this pass ([special-vocabulary.md](special-vocabulary.md#ordinal-digit-morphs)).


### Percent and percentage points
<a id="percent-and-percentage-points"></a>

Percent and percentage points are **scalar notation modes** on **`ra`** / **`ru`**, not new marker identities and not endings. They use group closers **`jo`** / **`ju`**, parallel to **`je`**.

| Closer | Sense | Mantissa digits | Underlying magnitude |
|--------|-------|-----------------|----------------------|
| **`jo`** | **Percent** (portion of a whole) | Everyday percent figure (`25` in `25%`) | mantissa ÷ 100 |
| **`ju`** | **Percentage points** (point-scale amount or delta) | Point figure (`2` in `+2%*`) | mantissa ÷ 100 |

Mantissa digits follow the [normal mantissa rules](#exponents) (including optional **`je`** inside the percent/point reading). Say the digits you mean (`100%` → `wo zo zo jo`, not a shortened speech form).

#### Form

```
mantissa-digits ( je fraction-digits )? jo|ju
```

- **Order:** integer digits, optional **`je`** + fractional digits, then **`jo`** or **`ju`**. Never `… jo/ju … je …`.
- **Scalars only:** **`re…jo/ju`** and **`ro…jo/ju`** are illegal.
- **No exponent in the same group:** do not combine **`ba`** / **`bu`** with **`jo`** or **`ju`**. Use a plain scalar (`je` / `e-N`) for rates outside everyday percent talk.
- **One closer per word:** at most one **`jo`** or **`ju`** group in the number word (not both; not repeated across groups).
- **Bare closer** (no mantissa): illegal.
- Do not mark the same group with both **`jo`** and an equivalent `e-2` exponent.

Endings still apply (**-l** exact, **-m** about, **-n** conventional label, **-r** resume).

In [preferred writing](#writing-preferred-shorthand): **`%`** → speech **`jo`**; **`%*`** → speech **`ju`** (sign still on **`ra`** / **`ru`**, written **`+`** / **`-`**).

#### What each closer is for

| English habit | Clarity |
|---------------|---------|
| `25% of X` (portion) | whole NP + `/ɡ/` **`…jo`** — [denominator](#percent-denominators) |
| `+2 percentage points` / `from 10% to 12%` point delta | **`ju`** (often as `/v/` **`ra`** / **`ru`**: increase/decrease by that point amount) |
| `+50% relative to baseline` (factor change) | **Not** **`jo`** / **`ju`** — use a multiplicative `/h/` factor (**`h+1.5`**, etc.) or ordinary *relative-to* wording |

`25%` (`…jo`) and `0.25` (plain scalar) name the same magnitude; **`jo`** only chooses the percent-scale reading. **`ju`** likewise names a ÷100 magnitude, but framed as **points** (not as “N% of a whole”).

#### Denominator (portion “of what”)
<a id="percent-denominators"></a>
<a id="percent-of-what"></a>

The **whole** / reference class is **not** inside the number word — no denom closer, no open argument on the numeral.

**Default:** the whole is the **host noun**; the percent is an ordinary `/ɡ/` scalar on that noun — same slot as a count (`zagadalsh g+3` = *three cats*):

| Shape | Gloss |
|-------|--------|
| `zagadalsh g+25%` | *25% of the cats* |
| `d<test>lsh g+95%` | *95% of the tests* (object) |
| `b<people>lsh g+5%` under a host relation | *5% of the people* as `/b/` |

The noun names the reference class; **`jo`** grades how much of that class. Same endings on the percent word (**-m** ≈ *about 25% of …*).

**When the whole is not the modified head:** use a complex `/ɡ/` or `/h/` *of* / *out of* (lexicon relation) + `/b/` whole, with the percent elsewhere in the clause as needed. Do **not** invent a second `/b/` on the number word (numbers take no `/w/` and no open arguments).

**Not a denom job** (no portion-whole required):

| Habit | Why |
|-------|-----|
| **`…ju`** point amounts / deltas | Points move a percent-scale quantity already in play |
| `from A% to B%` [spans](#ranges) | Endpoints are percent readings; continuum supplies the line |
| `N% relative to` baseline | Factor change — `/h/` **`h+…`** or ordinary *relative-to* wording |
| *top / bottom N%* | Rank band; class usually clear from context or named separately |
| *N% done / complete* | Whole = the task; often clear without a separate denom NP |

**Style:** a bare `/z/` (or other freestanding) **`…jo`** percent with no named whole is **grammatical but stylistically bad** — prefer an explicit whole (*percent of what*). Bare **`…ju`** point amounts are fine when the percent-scale quantity being moved is already clear.


### Digit-strings

Use marker **`ro`** (written **`_`**). Omit exponents. Prefer groups of three digits when digits are present. Ending is usually **-l** (exact label); **-n** for an official designation; **-r** to resume a prior code (**digitless** `d=_` / `g=_` allowed). [Digitless](#zero-digit-groups) `…_` = unspecified label / some code. Bare `/h/` + **`ro`** is **[temporal circumstance only](#time)** (`h_15,30`, `h_2026,07,22`, digitless `h_`) — not a generic code adverb. Non-time labels as circumstance use a host relation + `/b/` (e.g. `/h/` *on* + `b_7` *channel 7*), or modify a noun with `/ɡ/`. Digit-strings are unsigned — see [Sign](#sign). Clock and calendar field orders are under [Time](#time).


### Time
<a id="time"></a>

Time uses the existing number grammar; there is **no** fifth marker vowel and **no** time closer parallel to **`jo`** / **`ju`**.

**Bare `/h/` + `ro` (`hro…`) is reserved for temporal circumstance** (clock or calendar). Spoken `hro` already marks that reading; do not use bare `h_…` for channel, frequency, gate, room-as-where, or other non-time codes.

| Job | How |
|-----|-----|
| **Clock / schedule** | Digit-string **`ro`** as bare `/h/`. Default **24h**. Fields left→right, commas orthographic only: hour, minute, optional seconds — `h_15,30`, `h_15,30,00`. Digitless `h_` = *at some (unspecified) clock time*. |
| **Calendar date** | Digit-string **`ro`**, ISO-ish fields: year, month, day — bare `h_2026,07,22`, or modifier `g_2026,07,22`. Digitless `h_` likewise covers an unspecified date reading when context is calendric. An explicit *date* host + `/b/` is optional when you want to name the relation; it is not required to license bare `hro` (bare `hro` already means time). |
| **Duration** | Scalar **`ra`** / **`ru`** plus a lexicon **unit** in a [measure phrase](#measure-phrases) (*hour*, *day*, …) — not a digit-string, not bare `hro`. Same engineering-exponent habits as other measures when useful. |
| **Deixis / tense** | Ordinary lexicon `/h/` (*yesterday*, *ago*, *until*, mood/evidential). Numbers appear only for a numeric payload (*3 days ago* = relation + scalar + unit). |
| **Non-time digit labels** | Host relation + `/b/` (`/h/` *on* + `b_101.1`), or `/ɡ/` on a noun (*channel* `g_7`) — **not** bare `h_…`. |

**Not bare `hro`:** `h+3` (×3 / *three times*); `h#3` (*for the third time*); non-time codes as above. Do not use a scalar for a clock face (`*g+1530*` for 15:30). Timezone, era, and calendar system stay lexicon adjuncts, not inside the number word.

Endings: **-l** exact reading; **-m** fuzzy (*around 15:30*); **-n** conventional schedule/date name; **-r** resume a prior clock or date label (digitless `h=_` = *that time/date again*). Digitless `h_` ≠ circumstance **`har`** (*sometime*) — see [zero digit groups](#zero-digit-groups).


### Style (numeric vs spelled)
<a id="writing-style-numeric-vs-spelled"></a>
<a id="writing-style"></a>

Both writings name the **same word**. Choose the surface by **job**: quantity/math vs ordinary lexicon.

| Job | Prefer | Why |
|-----|--------|-----|
| Free number in a clause slot | **shorthand** | `g+3`, `x#2`, `d_…` — numeral as numeral |
| [Numeric derivation](special-vocabulary.md#numeric-derivation) / kind morph | **spelled CV** | `zolexrabal`, not `zolex+el` |
| Metalanguage / inventory tables | **shorthand** | patterns like `ROOTx+e` stay scannable |

**Prefer shorthand** for counts, measures, ranks, ranges, thresholds (`zagadalsh g+3`, `z+3 z+5 zel`); digit-strings / times / codes (`d_555,123,4567`, `h_15:30`); scientific / engineering register (`g+5.2e-4`, `g+0e-1`, `g+e3`); compact agenda markers (`x#1`, `x#3e2`); and docs that teach the numeral system.

**Prefer spelled CV** for anything after mid-word **`x`** on a content root (lexicon citation forms always spelled); lexicalized morphs treated as affixes (essence / void / quasi / poly / digit morphs / zero×exp on ROOT); literary, sung, or long prose where `+` `#` `_` and second-slot `~`/`@`/`=` break word rhythm; and pronunciation teaching.

**Avoid** the hybrid that derivation invites: shorthand body + host letter ending (`…x+el`). Free numbers use second-slot marks or trailing letters consistently; derived words use ordinary reference endings on the host with a fully spelled `NUM`.

**Gray zone (either OK):** discourse *Finally* / *Starting with* (`x#e` / `x#e-` vs `xrebal` / `xrebual` — lean spelled in prose, shorthand in outlines); digitless plural (`g+` / `gral`); cheers (`j+e` / `jrabal`); soft free specials when hedging a discourse particle rather than a quantity.

**House rules:** (1) free numeral → shorthand by default; (2) content-root derivation → spelled CV by default; (3) shorthand in derivation tables is schematic only; (4) never put number second-slot marks (`~`/`@`/`=`) on derived `NUM`; (5) parsers accept both.


### Measure phrases
<a id="measure-phrases"></a>
<a id="units"></a>
<a id="unit-amount"></a>

A **measure** is a lexicon **unit** noun plus a scalar **amount** grading that unit — not two bare `/b/` arguments, and not a new number closer (unlike closed **`jo`** / **`ju`**).

**Shape:** unit as the head noun in the needed slot; amount as ordinary `/ɡ/` scalar on that unit:

| Slot | Shape | Gloss |
|------|--------|--------|
| Argument of a complex `/ɡ/` / `/h/` | `b<inch>l g+2` | *two inches* (one `/b/` NP) |
| Subject / object / … | `z<hour>l g+3`, `d<meter>l g+5` | *three hours*, *five meters* |
| Modifier on a noun | `g<inch>l g+2` on a host | rare; prefer unit as `/b/` or freestanding NP |

Same endings and fuzzy **-m** habits as other number words on the amount (`g~+2` ≈ *about two*). The **unit** is ordinary lexicon (reference suffixes as usual). Do **not** encode open-class units inside the numeral word.

#### No metric prefixes
<a id="no-metric-prefixes"></a>
<a id="metric-prefixes"></a>

**Metric prefixes are not lexicon roots.** There is no dictionary entry *kilometer*, *milligram*, *nanosecond*, and so on. Lexicon units are **base** (*meter*, *gram*, *second*, …). Scale the amount instead:

| Prefer | Avoid |
|--------|--------|
| *meter* + amount in thousands / `e3` (or the exact count) | *kilometer* |
| `b<meter>l g+5400` or `b<meter>l g+5.4e3` for 5.4 km | `*b<kilometer>l g+5.4` |
| `b<gram>l g+40e3` | *40 kilograms* as a prefixed unit word |

Use [engineering exponents](#exponents) on the amount when convenient (`e3` / `e-3` / `e6` / …), or write the full scalar (`5400` meters). Same habit for other SI-style prefixes (*milli-*, *micro-*, *mega-*, …): keep the base unit; put the power of ten in the number.

**Measured differentials** (*two inches taller*) put that measure NP as the **single `/b/`** on the SHARED scale adjective of a [comparative](comparatives.md#measured-differentials):

`z<Sam>n z<Lea>n zel g<tall>l b<inch>l g+2` → *Sam is two inches taller than Lea*

Vague degree stays `/w/` on the scale (`zel w<much>l g<tall>l …`) — no unit. Duration and other clause measures use the same unit+amount habit in whatever slot the relation needs.

**Not this pattern:** percentage closers (**`jo`** / **`ju`**); bare multiplicative `/h/` factors (`h+1.5`); stacking `b+2 b<inch>l` as two arguments of one adjective.


### Ranges
<a id="ranges"></a>
<a id="number-ranges"></a>
<a id="numeric-ranges"></a>
<a id="from-to"></a>
<a id="shared-continuum"></a>

Spans reuse [phrase fences](coordination.md) whose conjuncts are number words, with a **SHARED continuum** `/ɡ/` naming the line — the same SHARED slot [comparatives](comparatives.md) use for a scale, but here the `/ɡ/` is a **dimension / quantity continuum**, not an entity-ranking scale. There is **no** range form inside a single number word (no `g+3-5`). Fence join vowels, endings, revision, and **-r** are defined in coordination; **this section** is the source of truth for when those forms mean a numeric span.

**Trigger (all required):**

1. Exactly **two** endpoints that are **compatible** number words (same marker identity: both scalar, both ordinal, or both digit-string / time).
2. Join **`a`** / **`e`** / **`ue`** / **`ua`** (or those vowels’ **-r**).
3. A **SHARED continuum** `/ɡ/` immediately after the join (lexicon: dimension / quantity line — *age*, *price*, *time*, *height*, …; stock **`g<span>l`** / **`g<amount>l`** when the line is pure numeric or supplied by context/head).

The fence PoS matches the slot (`zal` / `dal` / `gal` / `bal` / …). Mixed identities on one span are illegal.

**Without SHARED continuum:** two number conjuncts are **ordinary coordination** — never a span. In particular bare **`z+3 z+5 zel`** = *3 ≻ 5* (preference / rank), not *from 3 to 5*.

| Join | Inclusive shape | Reading |
|------|-----------------|--------|
| **`a`** | `z+3 z+5 zal g<age>l` | *between 3 and 5* on age (unordered filled interval; both ends in) |
| **`e`** | `z+3 z+5 zel g<age>l` | *from 3 to 5* on age (directed; first → second) |
| **`ue`** | `z+5 z+3 zuel g<age>l` | directed reverse path on age (spoken order = path; here *from 5 to 3*) |
| **`ua`** | `z+3 z+5 zual g<age>l` | *outside 3–5* on age (complement on the line) |
| **`o`** / **`ao`** | — | **Not** ranges — stay discrete (*3 or 5* / *3 and/or 5*); SHARED continuum does not license a span |
| **`ae`** | `z+5 z+5 zael` / `z+3 z+5 zaem` | *equal to 5* / *approximately equal* — **not** a span (no continuum needed; continuum + **`ae`** + numbers is not a range reading) |
| **`oe`** | — | **Not** ranges — exclusive ranked / bare empty superlative with scale |

**Arity escape:** three or more number conjuncts under **`a`** stay an ordinary discrete inventory (`zal z+1 z+3 z+7` = *1, 3, and 7*), even with SHARED. Focus **`zal z+3`** stays *just 3*, not a ray. Focus **ranked** with a number is a [threshold](#numeric-thresholds), not ordinary *only X matters*.

**Contrast with comparatives:** `z<Sam>n z<Lea>n zel g<big>l` = *Sam is bigger than Lea* (SHARED **scale**, non-number conjuncts). `z+3 z+5 zel g<age>l` = *from 3 to 5 on age* (SHARED **continuum**, number endpoints). Bare `z+3 z+5 zel` = prefer 3 over 5.

#### Thresholds (focus ranked)
<a id="numeric-thresholds"></a>
<a id="greater-less-than"></a>

When the **sole** conjunct of a [rank join](coordination.md#ranked-conjunction-e) fence (**`e`** / **`ue`**, and their open / named twins) is a **compatible number word**, that number is an **extremum on the line**, not “only this value matters” and not a two-endpoint [span](#ranges). SHARED continuum is **optional** on thresholds: absent = implicit / contextual numeric line; present = that named line (`z+5 zel g<age>l` = *age \< 5*). Special values such as +∞ use [digitless exponents](#digitless-exponents) inside the number word (`g+e`), not focus ranked zero-group forms.

| Form | Reading | Mnemonic |
|------|--------|----------|
| **`z+5 zel`** | ***less than 5*** (`< 5`) | 5 is the **greatest** (ceiling); the ray is everything it outranks |
| **`zem z+5`** | soft / approximate *less than ~5* | open twin |
| **`z+5 zuel`** | ***greater than 5*** (`> 5`) | 5 is the **least** (floor); reverse-ranked extremum |
| **`zuem z+5`** | soft / approximate *greater than ~5* | open reverse twin |
| **`zen z+5`** | named/conventional **unspecified** extremum label (*under-fives*-style) | phrase **-n** on **e** |
| **`zaen z+5`** | named/conventional **equal-to-5** band / tie label | phrase **-n** on **ae** |
| **`zuen z+5`** | named/conventional floor band | phrase **-n** reverse |

Same under `/d/` `/b/` `/ɡ/` (`gel g+5` = modifier *\<5*; `duel d+10` = object *\>10*). **`ae`** / **`oe`** focus with a number are **not** thresholds (stay ordinary ranked focus / triage). Boolean focus (**`zal`** / **`zol`** / …) is **not** a threshold. Focus **`zel z+`** (zero-group) is **not** +∞ and **not** a threshold — ordinary focus on plural/unspecified amount; use **`z+e`** / **`g+e`** for +∞.

**Inclusive bounds:** default is **strict** (`<` / `>`). For **≤ 5** / **≥ 5**, use a two-endpoint [span](#ranges) with the bound included — do **not** flip focus ranked to inclusive. Exclusive-high **`ul`** stays a two-side span tool (`z+3 ul z+5 zal g<span>l`), not a focus threshold marker.

**Unspecified in a threshold:** bare **`e`** + **-r** = unspecified member of the *\< X* ray — `zer z+5` → *some/whatever value \< 5* (under question → *which value \< 5?*). **`ue`** takes **no** **-r** (stacked forms never do — [coordination](coordination.md#unspecified-member-r-phrase)); there is no `zuer` threshold. For an unspecified value *\> 5*, use other wording (not a reverse **-r** fence).

Contrast: `z+3 z+5 zel g<age>l` = *from 3 to 5 on age* (span); `z+3 z+5 zel` = *3 ≻ 5* (preference); `z+5 zel` = *\< 5* (focus threshold); `z+e` / `g+e` = +∞ ([digitless exponents](#digitless-exponents)). `z<Sam>n zel` (non-number) stays ordinary *only Sam matters* / [superlative-with-scale](comparatives.md) — **focus number conjunct** triggers the threshold reading when the number is a bound (typically digitful).

#### Half-open (exclude the high end only)

[Revisers](revisers.md) **inside the range** marks an exclusive **upper** bound. Replace the second (high) conjunct with prefix-less **`ul`** + that number. SHARED continuum stays required:

| Shape | Reading |
|-------|--------|
| `z+3 z+5 zal g<span>l` | *[3, 5]* — inclusive both ends |
| `z+3 ul z+5 zal g<span>l` | *[3, 5)* — *3 up to but not including 5* |
| `z+3 ul z+5 zel g<span>l` | *from 3 up to but not including 5* |

The low endpoint is **always inclusive**. Do **not** exclude the beginning edge (no `ul` before the low; no open-low span). Do **not** list the high end as a conjunct and then except it (`*zal g<span>l z+3 z+5 ul z+5`); the exclusive high is **only** the in-range `ul` shape. Open **`um`** on the high end = soft / non-exhaustive exclusion of that bound (rare). Other revision vowels (**`al`** / **`el`** / **`ol`**) are not range-bound markers.

Fence **-l** / **-m** / **-n** keep ordinary closed / open / named senses on the span (*exactly this band* / *around this band* / *the teens*-style label). Endpoint [number endings](#number-endings) still apply (**-m** ≈ fuzzy that bound).

#### Unspecified value in the span (**-r**)

Fence **-r** on a number-range shape (still with SHARED continuum) = an **unspecified member of the span** (not content-word anaphor **-r**, not a discrete *something among two listed values*):

| Form | Reading |
|------|--------|
| `z+3 z+5 zar g<span>l` | *some value in [3, 5]* |
| `zar g<span>l z+3 ul z+5` | *some value in [3, 5)* |
| `zor g<span>l z+3 z+5` | *any value in [3, 5]* (free-choice) |
| `zer g<span>l z+3 z+5` | *whatever-by-rank in [3, 5]* |
| `zur g<span>l z+3 z+5` | *some value other than (in) [3, 5]* — other-than the span |

Under [question](questions.md#fill-ask-r) force, these are fill-asks (*which value in 3–5?*). Same under `/d/` `/b/` / `/ɡ/` as the slot needs (`g+3 g+5 gal g<age>l` = modifier *ages 3–5*; `d+10 ul d+20 dar g<span>l` = object *some value in [10, 20)*).

**Clock / date spans:** do **not** use bare circumstance-`hal` (that series is [applicability](restrictors.md)). Prefer SHARED continuum **`gumedul`** (or a host relation + `/b/`) with digit-string endpoints (`bal gumedul b_15,00 b_16,00`).

Examples: `z+3 z+5 zal g<age>l` → *between ages 3 and 5*; `z<kid>l g+3 g+5 gal g<age>l` → *kids ages 3–5*; `z+3 ul z+5 zal g<span>l` → *[3, 5)*; `z+10 z+20 zel g<age>l` → *from age 10 to 20*; `z+3 z+5 zel` → *3 ≻ 5* (preference, not a span); `z+5 zel` → *\< 5*; `z+5 zuel` → *\> 5*; `g+e` → +∞; `g-e-` → notional / imaginary amount; `g+1e` → *one gazillion*; `g@+1e` → proper name *the Gazillion*; `g~+e` → arbitrarily large but finite; `g+e-` → arbitrarily small but finite; `g#e` → last place; `g~#e` → near last place; `g#e-` → start / beginning place; `g~#e-` → near first place; `g#1e` → *the gazillionth* / *umpteenth*; `g#1e-` → *the gazillionth-first*; `g#-2` → *2nd from the end* / *penultimate*; `g#3e2` → *3rd of gen +2*; `h#1e` → *for the gazillionth time*; `h#-2` → *for the penultimate time*; `x#e-` → *Starting with:*; `x#-1` → *Starting with the last one:*; `x-e-` → *imagine that:*; `v+e` → increase without bound; `v-e-` → treat as imaginary; `h+e` → unbounded multiplicity; `h-e-` → notionally / as if; `j+e` → *To infinity!*; `j#e` → *Finally!*; `j#-2` → *Penultimate!*; `j-e-` → *As if!*; `z+5 z+5 zael` → *equally 5* / *5 equals 5*; `z+3 z+5 zaem` → *3 and 5 approximately equal*; `z+3 z+5 zar g<span>l` → *some value in 3–5*; `z+3 z+5 zol` → *3 or 5* (discrete, not a range).


### Examples inventory
<a id="examples"></a>


Preferred writing first; speech sketches show structure (exact **-l** unless noted). Digits in speech use the [digit table](#digits).

| Value | Preferred writing | Speech sketch |
|-------|-------------------|---------------|
| plural / more than one | `g+` | *gral* (`g` + `ra` + `l` — [digitless](#zero-digit-groups)) |
| about several (`>1`) | `g~+` | *gram* |
| +∞ | `g+e` | *grabal* (`g` + `ra` + `ba` + `l` — [digitless exp](#digitless-exponents)) |
| arbitrarily large but finite | `g~+e` | *grabam* |
| one gazillion (hyperbole) | `g+1e` | *grawobal* (`ra` + wo + `ba` + `l`) |
| absolute zero (totalized null) | `g+0e` | *grazobal* (`ra` + zo + `ba` + `l` — [zero × exponent](#zero-exponent)) |
| sterile / null-at-seed amount | `g+0e-` | *grazobul* (`ra` + zo + `bu` + `l`) |
| engineering null at OoM −1 | `g+0e-1` | *grabuwojazool* (`ra` + `bu` wo **ja** zo + `l`) |
| engineering residue at OoM −1 | `g-0e-1` | *grubuwojazool* (`ru` + `bu` wo **ja** zo + `l`) |
| rank annihilated / disqualified | `g#0e` | *grezobal* (`re` + zo + `ba` + `l`) |
| ones band (1–9) | `g+e0` | *grabazol* (`ra` + `ba` + zo + `l` — [bare OoM](#bare-oom-bands)) |
| three at asserted OoM 0 | `g+3e0` | *grabazojarel* (`ra` + `ba` + zo + `ja` + re + `l`) |
| thousands band (1000–9999) | `g+e3` | *grabarel* (`ra` + `ba` + re + `l`) |
| current generation cohort | `g#e0` | *grebazol* (`re` + `ba` + zo + `l` — [generation](#ordinal-generation)) |
| *annihilate* | `v+0e` | *vrazobal* |
| *Annihilate!* | `j+0e` | *jrazobal* |
| about a gazillion | `g~+1e` | *grawobam* |
| the Gazillion (proper name) | `g@+1e` | *grawoban* |
| one gazillionth | `g+1e-` | *grawobul* (`ra` + wo + `bu` + `l`) |
| the gazillionth / umpteenth | `g#1e` | *grewobal* (`re` + wo + `ba` + `l`) |
| about the gazillionth | `g~#1e` | *grewobam* |
| the gazillionth-first | `g#1e-` | *grewobul* (`re` + wo + `bu` + `l`) |
| 2nd from the end / penultimate | `g#-2` | *greudul* (`reu` + du + `l`) |
| 1st from the end / *Starting with the last one* | `g#-1` | *greuwol* (`reu` + wo + `l`) |
| 3rd of gen +2 | `g#3e2` | *grebadujarel* (`re` + `ba` + du + `ja` + re + `l` — [generation](#ordinal-generation)) |
| gen −2 cohort | `g#e-2` | *grebudul* (`re` + `bu` + du + `l`) |
| for the gazillionth time | `h#1e` | *hrewobal* |
| for the penultimate time | `h#-2` | *hreudul* |
| *Gazillionth!* | `j#1e` | *jrewobal* |
| *Penultimate!* | `j#-2` | *jreudul* |
| umpteenth point: | `x#1e` | *xrewobal* |
| 2nd-from-end point: | `x#-2` | *xreudul* |
| *Starting with the last one:* | `x#-1` | *xreuwol* |
| arbitrarily small but finite | `g+e-` | *grabul* (`ra` + `bu` + `l`) |
| −∞ | `g-e` | *grubal* |
| last place | `g#e` | *grebal* |
| near last place | `g~#e` | *grebam* |
| start / beginning place | `g#e-` | *grebul* |
| near first place | `g~#e-` | *grebum* |
| *Starting with:* | `x#e-` | *xrebul* |
| *Finally:* | `x#e` | *xrebal* |
| increase without bound | `v+e` | *vrabal* |
| increase a lot but finite | `v~+e` | *vrabam* |
| nudge up | `v+e-` | *vrabul* |
| decrease without bound | `v-e` | *vrubal* |
| treat as imaginary / notionalize | `v-e-` | *vrubul* |
| soft notionalize | `v~-e-` | *vrubum* |
| notional / imaginary amount | `g-e-` | *grubul* (`ru` + `bu` + `l`) |
| soft notional | `g~-e-` | *grubum* |
| notionally / as if | `h-e-` | *hrubul* |
| *As if!* / *Imagine!* | `j-e-` | *jrubul* |
| *imagine that:* | `x-e-` | *xrubul* |
| take last place | `v#e` | *vrebal* |
| take starting place | `v#e-` | *vrebul* |
| take 2nd from the end | `v#-2` | *vreudul* |
| some end-relative rank | `g#-` | *greul* |
| unbounded multiplicity | `h+e` | *hrabal* |
| many times but finite | `h~+e` | *hrabam* |
| a gazillion times | `h+1e` | *hrawobal* |
| unbounded duplicity | `h+e-` | *hrabul* |
| for the last time | `h#e` | *hrebal* |
| for the first time (onset) | `h#e-` | *hrebul* |
| *To infinity!* | `j+e` | *jrabal* |
| *Finally!* | `j#e` | *jrebal* |
| *(finally, we're) starting!* | `j#e-` | *jrebul* |
| some negative amount | `z-` | *zrul* |
| some rank | `g#` | *grel* |
| some code (object) | `d_` | *drol* |
| that (prior) scalar again | `g=+` | *grar* (digitless **-r**) |
| that (prior) code again | `d=_` | *dror* |
| increase (unspecified) | `v+` | *vral* |
| increase a bit | `v~+` | *vram* |
| multiple times | `h+` | *hral* |
| a few times | `h~+` | *hram* |
| at some clock/date | `h_` | *hrol* — still bare `hro` = time; ≠ `har` |
| More! | `j+` | *jral* |
| 3 | `g+3` | *grarel* (`g` + `ra` + re + `l`) |
| −3 | `g-3` | *grurel* (`g` + `ru` + re + `l`) |
| 3 (as subject) | `z+3` | *zrarel* |
| −3 (as object) | `d-3` | *drurel* |
| of size 12 | `b+12` | *brawodul* (`b` + `ra` + wo du) |
| room 12 (modifier) | `g_12` | *growodul* (`g` + `ro` + wo du) |
| 139 | `g+139` | *graworenal* (`ra` + wo re na) |
| 27e12 | `g+27e12` | *grabawodujadulel* (`ra` + ba wo du **ja** + du le) |
| e9 (bare) | `g+e9` | *grabanal* (`ra` + ba na; **no** `ja`) |
| 50e-6 | `g+50e-6` | *grabugujavazol* (`ra` + bu gu **ja** + va zo) |
| −1e9 −265e3 −4 | `g-1e9,265e3,4` | *grubanajawobarejaduguvamol* — **`ru`**; groups: ba na **ja** wo · ba re **ja** du gu va · mo |
| $5860.04 → 5e3 + 860 + 4e-2 | `g+5e3,860,4e-2` | *grabarejavahaguzobudujamol* — ba re **ja** va · ha gu zo · bu du **ja** mo |
| 2nd | `g#2` | *gredul*; title-like *the Second…* may take **-n** (`g@#2` / *gredun*) |
| penultimate | `g#-2` | *greudul* |
| about 27e6 | `g~+27e6` | *grabagujadulem* (ba gu **ja** du le, ending **-m**) |
| phone 555-123-4567 | `d_555,123,4567` | *drovavavawoduremovagulel* (`d` + `ro` + va×3 · wo du re · mo va gu · le + `l`) |
| scientific 5.2487083e-4 | `g+5.2487083e-4` | *grabumojavajedumohalezoharel* (`ra` + bu mo **ja** + va **je** + du mo ha · le zo ha · re) |
| 25% | `g+25%` | *graduvajol* (`g` + `ra` + du va **jo** + `l`) |
| 25% of the cats | `zagadalsh g+25%` | host whole + `/ɡ/` percent — [denominator](#percent-denominators) |
| about 3% | `g~+3%` | *grarejom* (`ra` + re **jo** + `m`) |
| −12.5% | `g-12.5%` | *gruwodujevajol* (`ru` + wo du **je** va **jo**) |
| 100% | `g+100%` | *grawozozojol* (`ra` + wo zo zo **jo**; normal mantissa digits) |
| +2 pp | `g+2%*` | *gradujul* (`ra` + du **ju**) |
| about −1.5 pp | `g~-1.5%*` | *gruwojevajum* (`ru` + wo **je** va **ju** + `m`) |
| neutral point 1 / 2 | `x#1`, `x#2` | *xrewol*, *xredul* (`x` + `re` + …) |
| end-relative point 2 | `x#-2` | *xreudul* (`x` + `reu` + du) |
| corroborating item 3 | `x+3` | *xrarel* (`x` + `ra` + re) |
| independent item 2 | `x-2` | *xrudul* (`x` + `ru` + du) — ≠ **`x#-2`** |
| regarding agenda 12 | `x_12` | *xrowodul* (`x` + `ro` + wo du) |
| as in (2) above (neutral) | `x=#2` | *xredur* (ending **-r**) |
| three times / ×3 | `h+3` | *hrarel* (`h` + `ra` + re) |
| ÷3 / every third | `h-3` | *hrurel* (`h` + `ru` + re) |
| at 15:30 | `h_15,30` | *hrowovarezol* (`h` + `ro` + wo va · re zo) — bare `hro` = time |
| on 2026-07-22 | `h_2026,07,22` | *hrowoduzoguzoledudul* (`h` + `ro` + …) — bare `hro` date |
| date 2026-07-22 (modifier) | `g_2026,07,22` | *growoduzoguzoledudul* (`g` + `ro` + wo du zo gu · zo le · du du) — date fields, not threes |
| on 101.1 (frequency) | `/h/` *on* + `b_101.1` | not bare `h_…`; host + `/b/` digit-string |
| for the third time | `h#3` | *hrerel* (`h` + `re` + re) |
| Three! (label / score) | `j_3` | *jrorel* (`j` + `ro` + re) |
| Three more! | `j+3` | *jrarel* (`j` + `ra` + re) |
| Three short! / Three fewer! / −3! | `j-3` | *jrurel* (`j` + `ru` + re) |
| twenty-seven! (label) | `j_27` | *jrodulel* (`j` + `ro` + du le) |
| First! (place cheer) | `j#1` | *jrewol* (`j` + `re` + wo) |

In a sentence, the PoS attaches to that single number word (see [Parts of speech on numbers](#parts-of-speech-on-numbers); e.g. direct-object digit-string: `d_…`). Prefer naming the whole as the host of a `/ɡ/` **`jo`** percent ([denominator](#percent-denominators): `zagadalsh g+25%`).


## Advanced
<a id="advanced"></a>

### Digitless exponents
<a id="digitless-exponents"></a>
<a id="extremum-digitless"></a>
<a id="infinity"></a>
<a id="special-numeric-values"></a>
<a id="hyperbole-gazillion"></a>

A digit group may use an exponent marker (**`ba`** or **`bu`**) with **no** exponent digits. Readings depend on whether a **mantissa** is present (and, on ordinals, on **`ba`** vs **`bu`**):

| Shape | Reading |
|-------|---------|
| **`ba`/`bu` alone** (no mantissa) | **Special value** — +∞ / −∞ / last place / start place / … (tables below) |
| **Mantissa `≠0` + `ba`/`bu`∅** | **Hyperbole** on scalars (*N gazillion* / *N gazillionth*); on ordinals **both** polarities (*umpteenth* late / *umpteenth-first* early) — see [hyperbole](#hyperbole-gazillion). End-relative place is marker **`#-`**, not mantissa+`bu` |
| **Mantissa `0` + `ba`/`bu`∅** | **[Zero × digitless exp](#zero-exponent)** — total null / sterile / residue specials — **not** hyperbole |

None of these is bare OoM (which always **names** the power: `g+e9`, including ones-band **`g+e0`**) nor a [zero-group](#zero-digit-groups) word (`g+` = plural `>1`). Named **`e0`** on scalars is ordinary bare OoM / **`Ne0`** assert — [Bare OoM](#bare-oom-bands) / [Ambient scale](#ambient-scale) — **not** a digitless special. Mantissa **`0`** + named **`e0`** (**`g+0e0`**) is **not used**. On ordinals, **digitful** exp is [generation offset](#ordinal-generation), not scalar power-of-ten (**`g#e0`** = current generation).

**Writing:** **`e`** = speech **`ba`**; **`e-`** = speech **`bu`**. Digitless means no power digits after that mark: `g+e`, `g+1e`, `g+0e`, `g+e-`, `g+1e-`. Bare / assert **`e0`** writes power **`0`**: `g+e0`, `g+3e0` (not digitless).

**Shape limits:** one such group only in the word; do not combine digitless exp with real exp digits, percent closers, or further groups. Marker identity still applies. Digitless exp on **`ro`** / **`_`** is **undefined** on free number words. Derivation compounds may use digitless **`_`** as [infinite / landmark labels](special-vocabulary.md#infinite-labels) (`ROOTx_e`, `ROOTx_e-`, `ROOTx_1e`, …).

#### Special values — no mantissa

##### Referential (`/ɡ/` `/z/` `/d/` `/b/`)

| Form | Anatomy | Reading |
|------|---------|---------|
| **`g+e`** (etc.) | **`ra`** + **`ba`∅** + **-l** | **+∞** |
| **`g~+e`** | **`ra`** + **`ba`∅** + **-m** | **arbitrarily large but finite** |
| **`g+e-`** | **`ra`** + **`bu`∅** + **-l** | **arbitrarily small but finite** |
| **`g-e`** | **`ru`** + **`ba`∅** + **-l** | **−∞** |
| **`g~-e`** | **`ru`** + **`ba`∅** + **-m** | **arbitrarily large but finite** (negative / deficit) |
| **`g#e`** | **`re`** + **`ba`∅** + **-l** | **last place** / telos landmark (ultimate-descendant pole of the [generation](#ordinal-generation) axis) |
| **`g~#e`** | **`re`** + **`ba`∅** + **-m** | **near last place** |
| **`g#e-`** | **`re`** + **`bu`∅** + **-l** | **start / beginning place** / origin landmark — first with emphasis on **onset** (*the starting one*, *at the beginning*), not mere numbered 1st (`g#1`); ultimate-ancestor pole |
| **`g~#e-`** | **`re`** + **`bu`∅** + **-m** | **near first place** |
| **`g-e-`** | **`ru`** + **`bu`∅** + **-l** | **notional / imaginary amount** — as-if magnitude off the real commitment ledger (metaphorical; not ℂ math notation) |
| **`g~-e-`** | **`ru`** + **`bu`∅** + **-m** | **soft notional** — *sort of imaginary* / hedged as-if amount |

Same under `/z/` `/d/` `/b/` (`z+e` = +∞ as subject; `d#e-` = start-place as object; `b+e-` = *of an arbitrarily small but finite amount*; `z-e-` = notional amount as subject). Contrast **`g#1`** = numbered *first* / *1st*; **`g#e-`** = beginning/onset landmark.

<a id="imaginary"></a>
<a id="notional-amount"></a>

**Notional / imaginary (`g-e-`):** negative marker (**`ru`**) + digitless negative exponent (**`bu`∅), no mantissa — completes the scalar special grid. Reading is **metaphorical**: a magnitude named *as if* it counted, without entering the real tally. **Not** falsehood ([yes/no polarity](questions.md#yes-no-polarity) **`juel`**), **not** ordinary soft real amount (`g~+3`), **not** −∞ (`g-e`), **not** micro-real (`g+e-`). No separate *i* closer — digitful engineering (`g-50e-6`) and bare OoM **`g-e-1`** / **`g-e-2`** stay real (−10⁻¹ / −10⁻²). Mantissa + digitless **`bu`** on **`ru`** (`g-1e-`) stays [hyperbole](#hyperbole-gazillion) (*minus one gazillionth*), not *Ni*. Kind-morph twins: [quasi-ROOT](special-vocabulary.md#quasi) **`ROOTx-e-`**; [quasi-N](special-vocabulary.md#quasi-n) **`ROOTx-e-1`** / **`ROOTx-e-2`** (derivation only — not free OoM).

**Psychological as-if** (clause framed as pretensive / mind-only, with flexibility hold endings) uses spelled mood **`edahe`** — [special-vocabulary.md § Notional](special-vocabulary.md#notional) (`hedahem`, …) — not these free number forms. Free **`grubul`** / **`xrubul`** / **`hrubul`** / **`vrubul`** / **`jrubul`** stay amount, discourse *imagine that:*, manner *as if*, verb *notionalize*, and cheer overlays on the number grid.

**Endings** (no-mantissa specials):

| Ending | Sense |
|--------|-------|
| **-l** | Exact special value (default): +∞ / −∞ / last place / start place / arbitrarily small but finite / notional as in the form table |
| **-m** on **`ba`∅** (`…em`) | **Arbitrarily large but finite** on scalars (`g~+e` / `g~-e`); on ordinals (`g~#e`) = **near last place** |
| **-m** on **`bu`∅** (`…e-m`) | Soft / approximate small on scalars (`g~+e-`); soft notional on **`ru`+`bu`∅** (`g~-e-`); on ordinals (`g~#e-`) = **near first place** |
| **-n** | Proper / conventional designation of that special (named ∞ symbol, official *last place* / *starting* title, conventional *imaginary* label, …) |
| **-r** | Resume a prior special value of that marker+exp polarity (`g=+e` = *that +∞ again*; `g=+e-` = *that start/small again*; `g=-e-` = *that notional amount again*) |

**Contrast:** zero-group `g+` = plural count `>1`. Bare OoM `g+e9` = [decade band](#bare-oom-bands) `[10⁹, 10¹⁰)`; **`g+e0`** = ones band **1–9**. No-mantissa `g+e` = +∞; no-mantissa `g#e` = last place. Mantissa **`≠0`** + digitless **`ba`/`bu`** (`g+1e` / `g#1e` / `g#1e-`) = [hyperbole](#hyperbole-gazillion). Mantissa **`0`** + digitless (`g+0e` / `g#0e`) = [zero × exponent](#zero-exponent). Mantissa **`0`** + digitful **`e-1`** (`g±0e-1`) = engineering null / residue. Mantissa **`≠0`** + named **`e0`** (`g+3e0`) = ones-place assert ([ambient](#ambient-scale)). End-relative ordinals use marker **`#-`** ([from the end](#from-the-end)). Focus ranked digitless (`zel z+`) is **not** a special value — ordinary *only (plural) matters* / preference framing (not a special-value reading).

##### Overlay `/v/` and `/h/`

No-mantissa digitless-exp under `/v/` and `/h/` inherit special-value identity (∞ / last / start / micro) into the verb or adverb role. Soft **-m** parallels referential softs (*a lot but finite* / *near last* / …).

**Scalars (`ra` / `ru`):**

| Form | Reading |
|------|---------|
| **`v+e`** | **increase without bound** |
| **`v~+e`** | *increase a lot but finite* |
| **`v-e`** | **decrease without bound** |
| **`v~-e`** | *decrease a lot but finite* |
| **`v+e-`** | **nudge up** — increase by an arbitrarily small but finite amount |
| **`v-e-`** | **treat as imaginary / notionalize** — frame the patient as make-believe / mind-only / not for the real tally (not “nudge down”) |
| **`v~-e-`** | *softly notionalize* / treat as *sort of* imaginary |
| **`h+e`** | **unbounded multiplicity** (× without bound / unboundedly many times) |
| **`h~+e`** | *many times but finite* |
| **`h+e-`** | **unbounded duplicity** (÷ without bound / into unboundedly many parts) |
| **`h~+e-`** | *÷ a lot / into many parts, but finite* |
| **`h-e-`** | **notionally / as if / for the sake of argument** — event under imag framing |
| **`h~-e-`** | soft notional framing |

**Ordinals (`re`) — start/last landmarks:**

| Form | Reading |
|------|---------|
| **`v#e`** | *take / come in last place* |
| **`v~#e`** | *take / come in near last place* |
| **`v#e-`** | *take / come in starting place* |
| **`v~#e-`** | *take / come in near first place* |
| **`h#e`** | *for the last time* |
| **`h~#e`** | *for a near-last time* |
| **`h#e-`** | *for the first time* (onset framing — contrast numbered **`h#1`**) |
| **`h~#e-`** | *for a near-first time* |

**`ro`** under `/v/` `/h/` stays **undefined**. Soft/named/resume endings (**`~`** / **`@`** / **`=`**) apply as on other specials.

##### Overlay `/j/`

No-mantissa digitless-exp under `/j/` (interjection cheers):

| Form | Reading |
|------|---------|
| **`j+e`** | *To infinity!* |
| **`j~+e`** | *To a huge (but finite) amount!* |
| **`j#e`** | *Finally!* (place/coda cheer — contrast discourse **`x#e`** *Finally:*) |
| **`j~#e`** | *Almost finally!* / soft coda cheer |
| **`j#e-`** | *(finally, we're) starting!* (onset cheer — contrast discourse **`x#e-`** *Starting with:*) |
| **`j~#e-`** | soft onset cheer |
| **`j-e-`** | *As if!* / *Imagine!* / *In theory!* (notional cheer) |
| **`j~-e-`** | soft *as if!* / hedged imagine-cheer |

Other `/j/` no-mantissa digitless-exp forms (`j-e`, `j+e-`, `j_…`, …) stay **undefined**.

##### Overlay `/x/`

Under `/x/`, **last-place** **`x#e`** (and **`x~#e`** / **`x@#e`** / **`x=#e`**) = discourse *Finally* / last point, and **start-place** **`x#e-`** (and **`x~#e-`** / **`x@#e-`** / **`x=#e-`**) = discourse *Starting with:* / beginning — see [Number as discourse marker](#number-as-discourse-marker-by-marker). End-relative discourse points use **`x#-N`**. **Notional discourse:** **`x-e-`** = *imagine that:* / notional agenda point (side-track; not corroborating **`x+`** or independent **`x-`**); soft **`x~-e-`**; named **`x@-e-`**; resume **`x=-e-`**. **`x+e`** / **`x-e`** (and other `/x/` no-mantissa digitless-exp forms beyond start/last/notional) stay **undefined**. Digitless-exp on end-relative marker **`#-`** / **`reu`** stays **undefined**.

#### Zero × exponent
<a id="zero-exponent"></a>
<a id="zero-exponential"></a>
<a id="annihilate"></a>

Forms that pair **mantissa `0`** with an exponent (digitless or the engineering **`e-1`** pair). Same anatomy family as [numeric derivation](special-vocabulary.md#zero-exponent-derivation); free words are **hostless** amounts / acts; derived words attach the morph to a ROOT.

**Not** plain zero (`g+0`), **not** +∞ (`g+e`), **not** hyperbole (`g+1e`), **not** bare OoM (`g+e9`, **`g+e0`** ones band — [Bare OoM](#bare-oom-bands)). Soft / named / resume endings (**`~`** / **`@`** / **`=`**) apply as on other specials.

##### Referential (`/ɡ/` `/z/` `/d/` `/b/`)

| Form | Anatomy | Reading |
|------|---------|---------|
| **`g+0e`** | mantissa **`0`** + digitless **`ba`** | **absolute zero** / totalized null quantity — stronger than plain **`g+0`** |
| **`g+0e-`** | mantissa **`0`** + digitless **`bu`** | **sterile / null-at-seed** amount — emptiness at grain scale |
| **`g-0e`** | **`ru`** + mantissa **`0`** + digitless **`ba`** | **absolute residue** quantity — amount that will not totally wipe |
| **`g-0e-`** | **`ru`** + mantissa **`0`** + digitless **`bu`** | **micro-residue** amount |
| **`g+0e-1`** | mantissa **`0`** + digitful **`bu`** + exp **`1`** | **engineering null at OoM −1** — amount wiped at scale 10⁻¹ (deci-null); **not** sterile digitless **`g+0e-`**, **not** bare OoM **`g+e-1`** |
| **`g-0e-1`** | **`ru`** + mantissa **`0`** + digitful **`bu`** + exp **`1`** | **engineering residue at OoM −1** — irreducible leftover at that scale |

Same under `/z/` `/d/` `/b/` (`z+0e` = absolute-zero as subject; `z+0e-1` = deci-null as subject).

**Emptiness chain (amounts):** **`g-e`** (−∞ deficit) ≠ **`g+0`** (plain zero) ≠ **`g+0e`** (absolute zero) ≠ **`g+0e-`** (sterile micro-null) ≠ **`g+0e-1`** (engineering null at 10⁻¹). Bare **`g+e0`** is the [ones decade band](#bare-oom-bands) (1–9), not emptiness and not a former “identity element.”

**Scalars only for `±0e-1`:** engineering scale-null is **`ra` / `ru`**. On ordinals, digitful exp is [generation](#ordinal-generation) (`g#0e-1` ≠ engineering; **`g#e0`** = current generation). Ordinal zero×digitless **`g#0e`** = [rank annihilated](#rank-annihilated) below.

Mantissa **`0`** + named exp **`0`** (**`…0e0`**) is **not used**.

##### Overlay `/v/` and `/h/`

| Form | Reading |
|------|---------|
| **`v+0e`** / **`v+0el`** | **annihilate** / wipe totally (hostless total null as act) |
| **`v+0e-`** | **sterilize** / null at the seed |
| **`v+0e-1`** | **null at OoM −1** / wipe at deci scale |
| **`v-0e`** | **leave irreducible residue** / refuse total wipe |
| **`v-0e-`** | leave **micro-residue** |
| **`v-0e-1`** | leave **residue at OoM −1** |
| **`h+0e`** | **zero times (totally)** / annihilate repetition — **not** restrictor **`hal`** (*never* as applicability) |
| **`h+0e-`** | sterile / grain-null multiplicity framing |
| **`h+0e-1`** | zero-times framing **at OoM −1** |
| **`h-0e`** | with irreducible residual repetition |
| **`h-0e-1`** | residual repetition **at OoM −1** |

Ones-band / assert-`e0` overlays are ordinary bare OoM / **`Ne0`** (**`v+e0`**, **`h+3e0`**, …) — [Bare OoM](#bare-oom-bands) / [Ambient](#ambient-scale) — **not** this zero×exp table. Soft **-m** hedges (*almost annihilate*, *almost deci-null*, …).

##### Overlay `/j/`

| Form | Reading |
|------|---------|
| **`j+0e`** | *Annihilate!* / *Wipe it!* |
| **`j+0e-`** | *Sterilize!* / *Null the seed!* |
| **`j+0e-1`** | *Null at deci!* / *Wipe at 10⁻¹!* |
| **`j-0e`** | *Residue stands!* / *Won’t totally wipe!* |
| **`j-0e-1`** | *Deci-residue stands!* |

**`j+e0`** = ones-band cheer (ordinary bare OoM). Other `/j/` zero-exp forms beyond the table above are **undefined**.

##### Overlay `/x/`

Zero×exp under `/x/` is **undefined**. Discourse nesting uses [generation](#ordinal-generation) (**`x#e0`** = current-layer assert; **`x#3e2`** = nested depth).

##### Ordinal rank annihilated (`#0e`)
<a id="rank-annihilated"></a>

Mantissa **`0`** + digitless **`ba`** under forward ordinal **`re` / `#`**. **Not** zeroth-order **`#0`** (still a rung), **not** origin **`#e-`**, **not** generation **`#e0`** / **`#0e-1`** (digitful), **not** scalar **`+0e`**.

| Form | Reading |
|------|---------|
| **`g#0e`** | **rank annihilated** / **disqualified** / place wiped — unplaceable in the series |
| **`z#0e`** / **`d#0e`** / **`b#0e`** | same as subject / object / modifier |
| **`v#0e`** | *disqualify* / take annihilated place |
| **`h#0e`** | *for a disqualified / struck turn* |
| **`j#0e`** | *Disqualified!* / *Rank wiped!* |

Soft **-m** hedges (*near-disqualified*, …). Ordinal zero×digitless under `/x/` is **undefined**. Free twin of derivation **`ROOTx#0e`** — [special-vocabulary.md](special-vocabulary.md#rank-annihilated-morph).

##### Free vs derived

| Free | Derived (spelled) | Contrast |
|------|---------|----------|
| **`v+0el`** | **`v<score>xrazobal`** | hostless *annihilate* vs *annihilate-the-score* (kind) |
| **`g+0e`** | **`z<debt>xrazobal`** | absolute-zero amount vs total-null debt-kind |
| **`g+0e-1`** | **`z<debt>xrabuwojazol`** | deci-null amount vs kind nullified at OoM −1 |
| **`g-0e-1`** | **`z<debt>xrubuwojazol`** | deci-residue amount vs kind residue at OoM −1 |
| **`g#0e`** | **`z<contestant>xrezobal`** | disqualified place vs disqualified-*kind* |
| **`v+0l`** | **`v<score>xrazol`** | ordinary zeroing / null-reset — weaker than **`…+0e`** |

Free **`g+e0`** / **`g+Ne0`** are bare OoM / scale assert, **not** derivation morphs. Engineering scale-null is **only** **`±0e-1`** (no other **`±0eN`**). Mantissa **`0`** + named **`e0`** is **not used**.

#### Hyperbole — mantissa + digitless exponent
<a id="gazillion"></a>

**Mantissa digits `≠0`** (ordinary count) plus digitless **`ba`** / **`bu`** = a **hyperbolic** magnitude on **scalars** (comic huge / tiny) and on **ordinals** (comic late / early place). Mantissa **`0`** + digitless is [zero × exponent](#zero-exponent), **not** hyperbole. Not a real power of ten, not [ordinal generation](#ordinal-generation) (that needs **digitful** exp), and not a no-mantissa special (+∞ / last place / …). End-relative place is marker **`#-`**, not mantissa+`bu`.

##### Scalar (`ra` / `ru`)

| Form | Reading |
|------|---------|
| **`g+1e`** | *one gazillion* (committed hyperbolic huge) |
| **`g+3e`** | *three gazillion* |
| **`g+1e-`** | *one gazillionth* / vanishingly small hyperbole |
| **`g-1e`** | *minus one gazillion* (hyperbolic deficit) |

Same under other referential PoS for scalars.

##### Ordinal umpteenth / umpteenth-first (`re` + **`ba`∅** / **`bu`∅**)

Mantissa = how many joke-units of **late** (**`ba`**) or **early** (**`bu`**) rank. Still **finite** place hyperbole — not landmarks **`g#e`** / **`g#e-`**.

| Form | Reading |
|------|---------|
| **`g#1e`** | *the gazillionth* / *umpteenth* (comic late place — toward telos) |
| **`g#3e`** | *the three-gazillionth* |
| **`g~#1e`** | *about the gazillionth* / soft umpteenth |
| **`g#1e-`** | *the gazillionth-first* / comic early place (toward onset) |
| **`g#3e-`** | *the three-gazillionth-first* |
| **`g~#1e-`** | *about the gazillionth-first* |

Contrast: **`g#e`** = last place; **`g~#e`** = near last; **`g#e-`** = start landmark; **`g#1`** = numbered *1st*; **`g#-2`** = penultimate ([from the end](#from-the-end)).

Digit-string **`ro`** / **`_`** + mantissa + digitless exp stays **undefined**. Digitless-exp hyperbole on **`#-`** / **`reu`** stays **undefined**.

**Endings** on hyperbolic forms:

| Ending | Sense | Example |
|--------|-------|---------|
| **-l** | Committed hyperbole — speaker stands behind the joke magnitude | `g+1e` *one gazillion*; `g#1e` *the gazillionth*; `g#1e-` *the gazillionth-first* |
| **-m** | Soft / hedged hyperbole — *about a gazillion*, *umpteen* | `g~+1e` *roughly a gazillion*; `g~#1e` *about the gazillionth* |
| **-n** | **Proper noun / proper designation** — the hyperbolic numeral as a name (a building called *the Gazillion*, a title *One Gazillion*, *the Gazillionth*, …) | `g@+1e`; `g@#1e` |
| **-r** | Resume that prior hyperbolic amount or place (mantissa may repeat or drop when clear: `g=+1e` / `g=+e`; `g=#1e` / `g=#e` if the prior was this hyperbole) | |

**Overlays** (hyperbole) inherit freely:

| Form | Reading |
|------|---------|
| **`h+1e`** | *a gazillion times* |
| **`h#1e`** | *for the gazillionth time* |
| **`h#1e-`** | *for the gazillionth-first time* |
| **`v+1e`** | *add a gazillion* |
| **`v#1e`** | *place / come in gazillionth* / *rank as umpteenth* |
| **`v#1e-`** | *place / come in gazillionth-first* |
| **`j+1e`** | *a gazillion more!* |
| **`j#1e`** | *Gazillionth!* (comic late place cheer) |
| **`j#1e-`** | *Gazillionth-first!* (comic early place cheer) |
| **`x#1e`** | *umpteenth point:* / joke late agenda item |
| **`x#1e-`** | *umpteenth-first point:* / joke early agenda item |

**Not hyperbole:** `g+e` (no mantissa) = +∞; `g#e` / `g#e-` (no mantissa) = last / start place; mantissa **`0`** + digitless (`g+0e` / `g+0e-`) = [zero × exponent](#zero-exponent); bare / assert **`e0`** (`g+e0` / `g+3e0`) = [ones band](#bare-oom-bands) / [OoM-0 assert](#ambient-scale); end-relative **`g#-N`** = [from the end](#from-the-end); digitful ordinal exp = [generation](#ordinal-generation) (**`g#e0`** = current gen); `g+e9` (digitful exp) = bare OoM; `g+1e9` = 1×10⁹ (real engineering). Do not mix digitless exp with **`je`** / **`jo`** / **`ju`** in the same group.


Examples: `g+e` → +∞; `g~+e` → arbitrarily large but finite; `g+1e` → *one gazillion*; `g~+1e` → *about a gazillion*; `g@+1e` → proper name *One Gazillion* / *the Gazillion*; `g+1e-` → *one gazillionth*; `g+e-` → arbitrarily small but finite; `g-e` → −∞; `g-e-` → notional / imaginary amount; `g~-e-` → soft notional; `g#e` → last place; `g~#e` → near last place; `g#e-` → start / beginning place; `g~#e-` → near first place; `g#1e` → *the gazillionth* / *umpteenth*; `g#1e-` → *the gazillionth-first*; `g#-2` → *2nd from the end* / *penultimate*; `g#-1` → *1st from the end* / *Starting with the last one*; `g#3e2` → *3rd of gen +2*; `g#e0` → current generation cohort; `g#3e0` → *3rd of current gen (asserted)*; `g#e-2` → *gen −2 cohort*; `g+0e` → absolute zero; `g+0e-` → sterile / null-at-seed amount; `g+0e-1` → engineering null at OoM −1; `g-0e-1` → engineering residue at OoM −1; `g#0e` → rank annihilated / disqualified; `g+e0` → ones band (1–9); `g+3e0` → *three at OoM 0*; `g+e3` → thousands band (1000–9999); `v+0e` → *annihilate*; `j+0e` → *Annihilate!*; `j#0e` → *Disqualified!*; `h#1e` → *for the gazillionth time*; `h#-2` → *for the penultimate time*; `x#e-` → *Starting with:*; `x#e` → *Finally:* / last discourse point; `x#e0` → *current-layer point(s):*; `x#-1` → *Starting with the last one:*; `x#-2` → *penultimate point:*; `x#3e2` → *3rd nested point at depth +2:*; `x-e-` → *imagine that:*; `v+e` → increase without bound; `v~+e` → increase a lot but finite; `v+e-` → nudge up; `v-e-` → treat as imaginary / notionalize; `h+e` → unbounded multiplicity; `h-e-` → notionally / as if; `h#e` → *for the last time*; `h#e-` → *for the first time* (onset); `v#e` → *take last place*; `v#e-` → *take starting place*; `v#-2` → *take 2nd from the end*; `j+e` → *To infinity!*; `j#e` → *Finally!*; `j#e-` → *(finally, we're) starting!*; `j#-2` → *Penultimate!*; `j-e-` → *As if!* / *Imagine!*; `h+1e` → *a gazillion times*; `g+e9` → bare OoM e9 band; `g+` → plural `>1`.

### Numeric derivation (compounds)

PoS-less number stems may follow mid-word **`x`** on an ordinary content root (`ROOTx+e`, `ROOTx_12`, `ROOTx_e`, `ROOTx+1e`, …). That family is **derivation** (essence, coded subtype, [infinite labels](special-vocabulary.md#infinite-labels), hyperbole-ROOT, …), documented in **[special-vocabulary.md § Numeric derivation](special-vocabulary.md#numeric-derivation)**; parser cue in **[x-compounds.md](x-compounds.md)**. Running-text examples prefer spelled CV (`zolexrabal`) — [writing style](#writing-style-numeric-vs-spelled). Free number words on this page stay clause-slot counts, ranks, labels, overlays, and discourse items.


### Stress (pronunciation guide)

- Digitless numbers (marker + ending only): stress the **marker** syllable (`ra` / `ru` / `re` / `reu` / `ro`). For **`reu`**, stress the first vowel of the digraph (`e`).
- [Digitless exponent](#digitless-exponents) forms (`ba`/`bu` alone): stress the **exponent marker** (`ba` / `bu`).
- Single-digit magnitude groups: stress the digit syllable.
- Multi-digit groups without exponent: stress the **leftmost** digit.
- Groups with an exponent: stress the **leftmost exponent digit**.
- **`je`** (decimal point): always stressed when present.
- **`jo`** / **`ju`** (percent / percentage points): always stressed when present.
- Digit-string groups: stress the **first digit** of each group.

## See also

- Phrase fences for ranges: [coordination.md](coordination.md)
- Scalar comparison / measured differentials: [comparatives.md](comparatives.md)
- Numeric derivation on roots: [special-vocabulary.md](special-vocabulary.md#numeric-derivation)
- Mid-word **`x`** families: [x-compounds.md](x-compounds.md)
- Number-word phonotactics: [phonology.md](phonology.md)
- Discourse *Starting with* / *Finally* vs revisers: [revisers.md](revisers.md)

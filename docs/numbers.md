# Numbers

Numerals are a **closed formal subsystem**, not ordinary lexicon roots. Open quantifiers (*many*, *all*, *some*, …) stay lexicon; the numeral word itself can be [digitless](#zero-digit-groups) (unspecified magnitude of a marker identity, including plural **`>1`** on **`ra`**) or carry a [digitless exponent](#digitless-exponents) for special values (+∞ / −∞ / last place / …). PoS prefixes are defined in [language-reference.md](language-reference.md); plural **-sh** in [plurality.md](plurality.md); general phonotactics live in [phonology.md](phonology.md); ordinary reference suffixes in [reference-suffix.md](reference-suffix.md). This page is the source of truth for numeral grammar, including [percent denominators](#percent-denominators) (whole NP + `/ɡ/` `…jo`), [ranges](#ranges) (spans reuse [phrase fences](coordination.md) with SHARED continuum `/ɡ/`, documented here), [digitless exponents](#digitless-exponents), and [measure phrases](#measure-phrases) (unit + amount for differentials and durations). PoS-less number stems also compound onto content roots as [numeric derivation](special-vocabulary.md#numeric-derivation) (`ROOTx+e` = *essence of ROOT*, `ROOTx+1e` = *gazillion-ROOT*, …) — not free clause-slot numerals.

A whole numeric value is **one word**, even when it contains several digit groups (or none).

## Word shape

```
[PoS] + r + V + ( [exponent?] [mantissa digits?] )* + [ending]
```

1. **PoS** — same prefix inventory as elsewhere; [roles for number words](#parts-of-speech-on-numbers) below.
2. **Number marker** — consonant **r** plus a vowel **V** (see [Marker vowel](#marker-vowel-referential-identity)). The PoS+`r` cluster is a [number-only phonotactic exception](phonology.md#phonotactics).
3. **Zero or more digit groups** — each group is an optional exponent and optional mantissa digits (at least one of the two **when the group is present**, except a [digitless exponent](#digitless-exponents) group is **`ba`/`bu` alone**). Digits compound with **no** **x** separator. There is **no per-group polarity**; sign (when it applies) is once for the whole word — see [Sign](#sign). **No groups** = [unspecified magnitude](#zero-digit-groups) of that marker identity (or [digitless **-r** anaphora](#number-endings)).
4. **Ending** — `-l` / `-m` / `-n` / `-r` with [number-specific meanings](#number-endings) (not ordinary [reference suffix](reference-suffix.md) senses). Number words **do not** take plural **-sh** — group reference stays on ordinary nouns (see [plurality.md](plurality.md)).

**Writing** uses a [preferred shorthand](#writing-preferred-shorthand) for the marker and body (`g+3`, not *grarel*; digitless `g+`, not *gral*); speech is always the full CV form.

**Lexicon rule:** Any stem that matches this grammar is a number, never an ordinary root. Dictionary generation must reject colliding roots. A number stem **after mid-word `x`** on a content host is [numeric derivation](special-vocabulary.md#numeric-derivation), not a free number word (and takes the host’s ordinary reference ending, not [number endings](#number-endings)).

## Parts of speech on numbers

The number word takes whichever PoS prefix the role needs (clause slot, interjection, or discourse glue). The stem (marker + digits + ending) does not change.

**Referential** prefixes (`/ɡ/`, `/z/`, `/d/`, `/b/`) use [marker identity](#marker-vowel-referential-identity) as-is — PoS only chooses the slot or modifier role. **Overlay** prefixes (`/v/`, `/h/`, `/j/`, `/x/`) keep that identity but add a role-specific reading (sections below).

| Prefix | Role with a number |
|--------|--------------------|
| `/ɡ/` | **modifier** — referential: the number describes the preceding noun (*three cats*, *the second page*, *room 12*). Goes after the noun, like other adjectives. |
| `/z/` | **subject** — referential: the numeric value, digit-string, or rank is the subject. |
| `/d/` | **direct object** — referential: the number is the object (common for digit-strings / codes being dialed, entered, stated). |
| `/b/` | **argument noun** — referential: the number fills the `/b/` slot of a complex adjective or adverb (*of size 12*, host *on* + channel/label, host *at* + time when a relation is named, …). Bare temporal circumstance (no host) uses `/h/` + **`ro`** ([Time](#time)). |
| `/v/` | **verb** — overlay: the number is the clause’s action; see [by marker](#number-as-verb-by-marker). Not multiply/divide by N (use ordinary *multiply* / *divide* plus `/h/`). |
| `/h/` | **adverb** — overlay: see [by marker](#number-as-adverb-by-marker) (*N times*, ÷N, **time** via **`ro`**, *for the Nth time*). |
| `/j/` | **interjection** — overlay: see [by marker](#number-as-interjection-by-marker) (*N more!*, deficit, label/score call, place cheer). Left-edge or bare utterance only — [utterance-marker rules](language-reference.md#utterance-markers-j). **Not** clause force. |
| `/x/` | **discourse marker** — overlay: see [by marker](#number-as-discourse-marker-by-marker). Does **not** fill a clause slot. |

**Not valid with numbers:**

- **`/w/` (adjective adjunct)** — numbers do not take `/w/`, and a `/ɡ/` number is not a host for `/w/` grading or framing. Degree and “aboutness” of a quantity use [number endings](#number-endings) (especially **-m** for approximate), not `/w/`.

Digit-strings (`ro`…) usually take the argument role the clause needs (often `/d/`). Ordinals that modify a noun use `/ɡ/`; an ordinal used as a standalone rank uses `/z/`, `/d/`, or `/b/` as appropriate. Discourse list items use `/x/` + number ([by marker](#number-as-discourse-marker-by-marker): **`re`** neutral, **`ra`** corroborating, **`ru`** independent); *for the Nth time* uses `/h/` + **`re`**; place cheer *First!* uses `/j/` + **`re`** — none of these is `/ɡ/`.

## Marker vowel (referential identity)

**V** encodes the number’s **referential identity** — scalar vs ordinal vs digit-string. For **scalars**, **V** also carries the **sign of the whole number** (`a` positive, `u` negative). Ordinal **`e`** aligns with [rank join **e**](coordination.md#ranked-conjunction-e) (*rank*).

| V | Writing | Referent | Examples |
|---|---------|----------|----------|
| **a** | `+` | Positive **scalar** (count or measure amount) | `g+3` *three cats*; `g+` *plural / more than one*; `z+3` *three* (subj); `b+12` *of size 12* |
| **u** | `-` | Negative **scalar** | `d-3` *−3* (obj); `z-` *some negative amount*; `g-2` signed measure on a noun |
| **e** | `#` | **Ordinal** / rank | `g#2` *the second page*; `g#` *some rank*; `z#2` *second* (rank as subject) |
| **o** | `_` | **Digit-string** / label (phones, IDs, “read the digits”) | `d_555,123,4567`; `d_` *some code*; `g_12` *room 12*-style; `b_…` under a host relation |

Do not combine conflicting identity types on one word (e.g. do not use `re` and `ro` for the same token). In [preferred writing](#writing-preferred-shorthand), the marker is **`+`** / **`-`** / **`#`** / **`_`** (not written `r`+V).

### Sign

| Identity | How sign works |
|----------|----------------|
| **Scalar** (`a` / `u`, written `+` / `-`) | Sign **is** **V**. Multi-group scalars share one sign for the whole word (e.g. −1 000 265 004 is one **`ru`** word). |
| **Ordinal** (`e`, written `#`) or **digit-string** (`o`, written `_`) | **Unsigned only.** There is no signed label or signed ordinal form inside the number word. |

Do **not** write `#-…` or `_-…`, and do **not** insert speech **`ru`** after **`re`** / **`ro`**. If a negative-looking label or negative rank must be described (*−2nd*, a code that includes a minus), use ordinary lexicon (typically an adjective or complex adjective) plus an unsigned number — not a numeral sign extender.

There is no separate “mathematical object” marker. To talk about a number as an entity, use a scalar (**`ra`** / **`ru`**) in a referential slot (often with ordinary wording such as the noun *number*), not a distinct numeral class.

`/v/`, `/h/`, `/j/`, and `/x/` still choose among the same four markers, but each overlay gives that identity a **role-specific** reading (add vs ×N vs *N more!* vs corroborating/independent list item, and so on) — see the sections below.

### Number as verb (by marker)

`/v/` + number inherits the marker’s identity, so the action type follows **V**.

| Marker | Verb sense |
|--------|------------|
| **`ra`** | **Add N / increase by N** — transitive *add N of (object)* / *increase (object) by N*; intransitive *grow by N* when the patient is clear from context. |
| **`ru`** | **Remove N / decrease by N** — transitive *remove N of (object)* / *decrease (object) by N*; intransitive *shrink by N*. |
| **`re`** | **Take / assign rank N** — intransitive *place Nth* / *come in Nth*; transitive *put (object) in Nth place* / *rank as Nth*. |
| **`ro`** | **Enter / dial / input that digit-string** — type the code, dial the phone number, key the ID. Object (if any) is the channel or device; the digits are in the verb. |

“Set to N” (bring a quantity to an absolute value) is not a number-verb sense — use an ordinary verb plus the number as argument or adverb. Multiply/divide likewise stay ordinary verbs plus the number as `/h/` (**`h+N`** / **`h-N`**). With [percentage points](#percent-and-percentage-points) (**`ju`**), **`ra`** / **`ru`** as verbs mean increase/decrease by that point amount (not a relative %-change factor).

Endings still apply (**-m** ≈ *about* that amount/code/rank, **-r** resume — including [digitless](#zero-digit-groups) `v=+` / `v=_`, etc.).

### Number as adverb (by marker)

`/h/` + number inherits the marker’s identity, so the adverbial role follows **V**.

| Marker | Writing | Adverb sense |
|--------|---------|--------------|
| **`ra`** | `h+N` | **Multiplicative / factor** — *N times*; *×N*; *by a factor of N* (alone, or with ordinary *multiply*). |
| **`ru`** | `h-N` | **Inverse / partition** — *÷N*; *into N parts*; *1/N as often*; *every Nth* (alone, or with ordinary *divide*). |
| **`re`** | `h#N` | **Nth occurrence of the event** — *for the Nth time*; *on the Nth try* (clause-event ordinal, not discourse list independence). |
| **`ro`** | `h_…` | **Temporal circumstance only** — *at 15:30*; *on 2026-07-22* (clock or calendar digit reading). **Not** channel, frequency, gate, or other non-time codes — those use a host relation + `/b/` (or `/ɡ/` on a noun). See [Time](#time). |

Contrasts:

- `h+3` — *three times* / ×3
- `h-3` — ÷3 / every third / into 3
- `h+` — *multiple times* (unspecified)
- `h#e` — *for the last time*
- `h#e-` — *for the first time* (onset landmark; contrast numbered `h#1`)
- `h_15,30` — *at 15:30* (bare `hro` = time; [Time](#time))
- `h_2026,07,22` — *on 2026-07-22* (bare `hro` date)
- `/h/` *on* + `b_101.1` — *on 101.1* (non-time code; not bare `h_…`)
- `h#3` — *for the third time*
- `h#1e` — *for the gazillionth time* ([hyperbole](#hyperbole-gazillion))
- `j#3` — *Third!* (place cheer)
- `j#e` — *Finally!* ([digitless exp](#digitless-exponents))
- `j+e` — *To infinity!*
- `x#3` — *point 3:* (neutral discourse item)
- `g#3` — *the third* (modifies a noun)
- `v+3` — *add 3* (verb)
- `v+` — *increase* (unspecified amount)
- `v#e` — *take last place*

Endings still apply (**-m** ≈ *about* that many times / that clock or date, **-r** resume — including digitless `h=+` / `h=_`). Relative %-change factors use **`h+…`** (e.g. ×1.5), not **`jo`** / **`ju`** alone — see [percent](#percent-and-percentage-points).

### Number as interjection (by marker)

`/j/` + number is an **interjection** (expressive call-out), not clause force. Clause force stays the closed non-numeric set in the [utterance-marker section](language-reference.md#clause-force). Number interjections appear only in the left-edge `/j/` cluster (before force, when a clause follows) or as a bare utterance with no force.

| Marker | Writing | Interjection sense |
|--------|---------|-------------------|
| **`ra`** | `j+N` | **Quantity addition** — *Three more!*; *Ten more!* (add N to the relevant count / tally / order). |
| **`ru`** | `j-N` | **Deficit / shortfall call** — *Three short!*; *Three fewer!*; *Down by 2!*; *−3!* (mirror of `j+`). |
| **`re`** | `j#N` | **Place / rank cheer** — *First!*; *Second!* (podium / place shout). |
| **`ro`** | `j_…` | **Digit-label / magnitude call-out** — *Three!*; *B-12!*; *five-five-five!*; score, bingo, code, or ID as a bare reading of the digits (not “N more”). |

**Label vs addition:** bare English *Three!* / *Twelve!* as naming a score, ball, or count → **`j_`**. *Three more!* (increment the tally) → **`j+`**. Bingo / room codes / phone fragments → **`j_`**.

Contrasts:

- `j_3` — *Three!* (label / score / count reading)
- `j+3` — *Three more!* (quantity addition)
- `j-3` — *Three short!* / *Three fewer!* / *−3!* (deficit)
- `j_27` — *Twenty-seven!* as label call
- `j#1` — *First!* (place cheer)
- `j#e` — *Finally!* (coda cheer — [digitless exp](#digitless-exponents); contrast **`x#e`** *Finally:*)
- `j#e-` — *(finally, we're) starting!* (onset cheer; contrast **`x#e-`** *Starting with:*)
- `j+e` — *To infinity!*
- `j#1e` — *Gazillionth!* (comic place cheer — [hyperbole](#hyperbole-gazillion))
- `j#2e-` — *Penultimate!* / *Second from last!* ([from the end](#from-the-end))
- `x#1` — *point 1:* (neutral discourse item)
- `h#1` — *for the first time* (numbered)
- `h#e-` — *for the first time* (onset landmark)
- `h#e` — *for the last time*
- `h#1e` — *for the gazillionth time*
- `h#2e-` — *for the penultimate time*
- `v#1` — *take / assign 1st* (verb)
- `v#e` — *take last place*
- `v#e-` — *take starting place*

Endings still apply (**-m** fuzzy *about three more!* / *about three!*, **-n** conventional call name, **-r** resume a prior shout’s value — digitless `j=+` / `j=_` allowed).

### Number as discourse marker (by marker)

`/x/` + number is discourse glue for numbered list items and label cites. Marker vowel encodes **independence framing** of the list item (or cite-as-label for **`ro`**). It does **not** occupy a main-clause argument or adjunct slot (contrast `/ɡ/` *the second page*, `/h/` *three times* / *for the Nth time*, `/j/` interjection shouts).

| Marker | Writing | Discourse sense |
|--------|---------|-----------------|
| **`re`** | `x#N` | **Neutral point N** — numbered item with no independence framing (*point N:*, *note N:*, bare *(N)*). |
| **`ra`** | `x+N` | **Corroborating item N** — backs, restates, or same-directions an earlier item (*corroborating N:*, *echoing N:*). Legitimate for emphasis, clarity, teaching, or a related source—not a new line of support. |
| **`ru`** | `x-N` | **Independent item N** — a new line of support or consideration (*independent N:*, *distinct N:*). Would still matter if other listed items were gone. |
| **`ro`** | `x_…` | **Cite a discourse label** — agenda item, section code, slide, ticket id (digits as label, not independence framing) (*regarding item 12; under 3.2*). |

**Last point / *Finally*:** digitless-exp last-place under `/x/` + **`re`** is defined — **`x#e`** = *Finally:* / *last point:* (committed coda item). Soft **`x~#e`** = near-final / soft wrap-up point; named **`x@#e`** = ritual / titled *Finally*; **`x=#e`** resumes that last-point marker. This is **not** discourse reviser **`al`** (*additionally* — [revisers.md](revisers.md#discourse-revisers)).

**Starting point / *Starting with*:** digitless-exp start-place under `/x/` + **`re`** — **`x#e-`** = *Starting with:* / *to begin:* (committed opening item; beginning/onset framing, **not** English *firstly*). Soft **`x~#e-`** = near-start / soft lead-in; named **`x@#e-`** = ritual / titled *Starting with*; **`x=#e-`** resumes that start-point marker. Ordinary numbered *firstly* stays **`x#1`**.

Other `/x/` no-mantissa digitless-exp forms (**`x+e`**, **`x-e`**, …) stay **undefined**. Mantissa + digitless-exp discourse indices: **`x#1e`** *umpteenth point:* ([hyperbole](#hyperbole-gazillion)); **`x#2e-`** *2nd-from-end point:* ([from the end](#from-the-end)) — not the start/last landmarks.

**Independence framing:** **`#`** = unmarked inventory or steps; **`+`** = corroborating (aligned with something already listed); **`-`** = independent (new line of support). Do not use **`+`** / **`-`** for for/against or open vs scratch a bullet — independence is the point. Ordinary *firstly / secondly* without that framing is **`x#N`**. *Starting with* without a numeric step count is **`x#e-`**; *Finally* without a numeric step count is **`x#e`**. For/against and both-sides checks stay in ordinary wording or claim-level evidentiality, not on the number marker.

Contrasts:

- `g#2` — *the second* (modifies a noun)
- `x#2` — *point 2:* (neutral discourse item)
- `x#e-` — *Starting with:* / *to begin:* (digitless start-place under `/x/`)
- `x#e` — *Finally:* / *last point:* (digitless last-place under `/x/`)
- `j#e-` — *(finally, we're) starting!* (onset cheer)
- `j#e` — *Finally!* (coda cheer)
- `j+e` — *To infinity!*
- `x+2` — *corroborating 2:*
- `x-2` — *independent 2:*
- `h#2` — *for the second time* (event ordinal adverb)
- `j#2` — *Second!* (place cheer)
- `j_3` — *Three!* (label / score reading)
- `j+3` — *Three more!* (quantity addition)
- `j-3` — *Three short!* / *Three fewer!* / *−3!* (deficit)

Endings still apply (**-l** newly stated item, **-r** *as in (N) above* or digitless `x=#` / `x=+` / … for *as in that item above* with same independence framing, **-n** titled / official item name, **-m** fuzzy *around item N*; on last-place **`x#e`** / **`x~#e`** / **`x@#e`** / **`x=#e`** and start-place **`x#e-`** / **`x~#e-`** / **`x@#e-`** / **`x=#e-`** as above). Percent / percentage-point closers are not used with `/x/` numbers.

## Number endings

Ordinary [reference suffix](reference-suffix.md) senses do **not** apply inside number words. Speech keeps the ending letter; [preferred writing](#writing-preferred-shorthand) uses a **second-slot mark** after PoS (same glyphs as [span fences](spans.md)).

| Ending | Meaning | Preferred writing |
|--------|---------|-------------------|
| **-l** | Exact, newly stated (default) | *(none)* — `g+3`, `g+` |
| **-m** | Approximate / non-literal (“about N”) | **`~`** after PoS — `g~+3`, `g~+` |
| **-n** | Conventional / proper designation (titles, official labels, *the Second…*) | **`@`** after PoS — `g@#2`, `g@+1e` |
| **-r** | Anaphoric resume of a previously stated number, code, or rank | **`=`** after PoS — `g=+`, `x=#2`, `d=_` |

**-r** may be **digitless**: marker + **-r** alone resumes the prior value of that identity without restating digits (`g=+` = *that (scalar) amount again*; `d=_` = *that code again*; `g=#` = *that rank again*). Digits + **-r** still fine when you want to name which prior item (`x=#2` = *as in (2) above*). Marker must match the resumed identity (do not resume a scalar with `g=#`). **`=`** does **not** combine with **`~`** / **`@`**.

On [digitless](#zero-digit-groups) words, **-l** / **-m** / **-n** keep the same discourse jobs relative to the unspecified magnitude (*exact plural count* / *about several* / *conventional “plural” or unlabeled-rank style*, etc.).

## Zero digit groups
<a id="zero-digit-groups"></a>
<a id="digitless-numbers"></a>
<a id="bare-marker"></a>

A number word may omit every digit group: **PoS + marker + ending** only. The marker still fixes referential identity. With **-l** / **-m** / **-n**, the magnitude (or label/rank payload) is **unspecified** as in the table below. With **-r**, the word is [digitless anaphora](#number-endings) only — resume a prior value of that identity; it does **not** introduce a new unspecified magnitude.

| Marker | Writing | Digitless sense | Partition / notes |
|--------|---------|-----------------|-------------------|
| **`ra`** | `…+` (etc.) | Unspecified **positive scalar**, specialized to **plural count / amount `>1`** | Complements `…+0` (zero), `…+1` (one), `…+N` (exact N≥2). Not “any non-negative,” not “≥0.” |
| **`ru`** | `…-` | Unspecified **negative scalar** (*some negative amount*; deficit of unnamed size) | Exact negatives stay `…-N`. |
| **`re`** | `…#` | Unspecified **rank** (*some nth* / *some place*) | Exact ranks stay `…#N`. |
| **`ro`** | `…_` | Unspecified **digit-string / label** (*some code*; *a label*) | Exact labels stay `…_…`. |

**Vs noun plural `-sh`:** `-sh` marks that a **referent is a group** ([plurality.md](plurality.md)) — indefinite group introduction stays **-lsh** / **-msh**, not digitless. Digitless **`ra`** marks that a **count/amount is `>1`** without naming N. They are different jobs (quantity vs group-reference) and may co-occur (`z-catlsh g+3`). Do **not** treat `g+` as a replacement for noun **-lsh**, nor as plural morphology on verbs, circumstance, or number words themselves.

**Vs fence `-r`:** phrase **`zar`** / **`zor`** / … pick an unspecified **member of an inventory**. Digitless number **-r** resumes a **prior numeric value**. Digitless number **-l** (etc.) introduces an unspecified magnitude of that marker — not inventory membership.

**Overlays** inherit the same emptiness (marker identity → role reading, payload unspecified):

| Overlay | Digitless examples |
|---------|-------------------|
| `/ɡ/` `/z/` `/d/` `/b/` | `g+` *plural / more than one* (on a noun); `z-` *some negative amount* (subj); `b#` *of some rank*; `d_` *some code* (obj) |
| `/v/` | Unspecified amount under the verb sense: **`v+`** *increase*; **`v-`** *decrease*; **`v#`** *take / assign some rank*; **`v_`** *enter / dial some code*. Soft: **`v~+`** *increase a bit*; **`v~-`** *decrease a bit* |
| `/h/` | Unspecified amount under the adverb sense: **`h+`** *multiple times*; **`h-`** *÷ / into some number of parts*; **`h#`** *for some nth time*; **`h_`** *at some clock or date* (still bare-`hro` **time** only — not channel codes). Soft: **`h~+`** *a few times*; **`h~-`** *÷ a bit* / *into a few parts* |
| `/j/` | **`j+`** *More!*; **`j-`** *Short!* / *down by some amount!*; **`j#`** *Nth!* (place cheer, rank unnamed); **`j_`** *…!* (unspecified score / code call). Soft: **`j~+`** *a bit more!* |
| `/x/` | `x#` *some point:* (neutral, number unnamed); `x+` / `x-` corroborating / independent item of unnamed index; `x_` *regarding some (unnamed) label* |

**`h_` vs `har`:** digitless time `h_` is still a **number word** (unspecified clock/date reading under bare `hro`). Circumstance **`har`** (*sometime*) is the [restrictor](restrictors.md), not a numeral — do not swap them.

**Illegal with zero groups:** percent / percentage-point closers (**`jo`** / **`ju`**) still need a mantissa group — bare `…+%` is not a shortcut for “some percent.” Exponent-only groups with **digits** (`e9`) are **not** zero-group forms; they are ordinary one-group bare OoM. Exponent markers **without** digits are [digitless exponents](#digitless-exponents) (special values) — also not zero-group forms.

## Digits

Remapped CV syllables (current vowels; preferred voiced consonants):

| Digit | Syllable | IPA (approx.) |
|-------|----------|----------------|
| 1 | wo | /wo̞/ |
| 2 | du | /dɶ/ |
| 3 | re | /re̞/ |
| 4 | mo | /mo̞/ |
| 5 | va | /vɑ/ |
| 6 | gu | /ɡɶ/ |
| 7 | le | /le̞/ |
| 8 | ha | /ɣɑ/ |
| 9 | na | /nɑ/ |
| 0 | zo | /zo̞/ |

## Exponents

Within each digit group:

| Marker | Role |
|--------|------|
| **ba** | Positive exponent, followed by the exponent’s digits — or [digitless](#digitless-exponents) (no digits) for special values |
| **bu** | Negative exponent, followed by the exponent’s digits — or [digitless](#digitless-exponents) (no digits) for special values |
| **ja** | After exponent digits when a **mantissa follows** (not a digit) |
| **je** | **Decimal point** (not a digit) |
| **jo** | **Percent** closer (not a digit) — see [Percent and percentage points](#percent-and-percentage-points) |
| **ju** | **Percentage-point** closer (not a digit) — see [Percent and percentage points](#percent-and-percentage-points) |

- The **exponent comes before** the group’s mantissa digits.
- If a mantissa follows the exponent, say **`ja`** after the last exponent digit, then the mantissa. Example: `27e12` → `ba` + `wo` + `du` + `ja` + `du` + `le`.
- **Bare order of magnitude** (exponent only, no mantissa): use `ba`/`bu` + exponent digits and **omit** **`ja`**. The group ends at the next `ba`/`bu`, or at the word ending. Example: *e9* → `ba` + `na` (not `*banaja`).
- **Digitless exponent** ([special values](#digitless-exponents) or [hyperbole](#hyperbole-gazillion)): use `ba`/`bu` with **no** exponent digits — alone for specials (`g+e`), or after mantissa digits for hyperbole (`g+1e`). Not the same as bare OoM (which always names the power) and not a [zero-group](#zero-digit-groups) word.
- If the exponent is **0**, omit the exponent (and thus omit **`ja`**) entirely — except do **not** confuse omitted-zero with digitless `ba`/`bu` special values.
- Default spoken/written scale uses **engineering notation**: exponents are usually multiples of **3** (e.g. `27e6`, not `2.7e7`).
- **Decimal point:** say **`je`** after the digit(s) left of the point; digits after **`je`** are the fractional part (group in threes if long). May appear with or without an exponent.
- **Scientific register** is optional: exp-first, then **`ja`**, then mantissa with **`je`** after the leading digit (usual scientific shape). Example: `5.2487083e-4` → `bu` + `mo` + `ja` + `va` + `je` + `du` + `mo` + `ha` + `le` + `zo` + `ha` + `re`.
- Bare OoM uses scalar marker **`ra`** (or **`ru`** if negative). Digitless-exponent special values also use **`ra`** / **`ru`** / **`re`** as in that section — not **`ro`**.
- **Cents / fixed subunits:** an exponent need not be a multiple of 3 when the unit has a conventional subunit (e.g. dollars: `4e-2` for four cents). Same pattern for other fixed subunits if needed. Do **not** use **`jo`** for money subunits.
- **No metric prefixes** in speech or lexicon: see [measure phrases](#no-metric-prefixes) — base unit + engineering exponent / exact count (`40e3` grams, not “40 kilograms”; `12e-9` meters, not “12 nanometers”).

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
| **Mantissa digits + `ba`/`bu`∅** | **Hyperbole** on scalars (*N gazillion* / *N gazillionth*); on ordinals **`ba`** only (*the N-gazillionth* / *umpteenth*). Ordinal **`bu`** + mantissa = [N from the end](#from-the-end) (not hyperbole) |

None of these is bare OoM (which always **names** the power: `g+e9`) nor a [zero-group](#zero-digit-groups) word (`g+` = plural `>1`).

**Writing:** **`e`** = speech **`ba`**; **`e-`** = speech **`bu`**. Digitless means no power digits after that mark: `g+e`, `g+1e`, `g+e-`, `g+1e-`.

**Shape limits:** one such group only in the word; do not combine digitless exp with real exp digits, percent closers, or further groups. Marker identity still applies. Digitless exp on **`ro`** / **`_`** is **undefined**.

#### Special values — no mantissa

##### Referential (`/ɡ/` `/z/` `/d/` `/b/`)

| Form | Anatomy | Reading |
|------|---------|---------|
| **`g+e`** (etc.) | **`ra`** + **`ba`∅** + **-l** | **+∞** |
| **`g~+e`** | **`ra`** + **`ba`∅** + **-m** | **arbitrarily large but finite** |
| **`g+e-`** | **`ra`** + **`bu`∅** + **-l** | **arbitrarily small but finite** |
| **`g-e`** | **`ru`** + **`ba`∅** + **-l** | **−∞** |
| **`g~-e`** | **`ru`** + **`ba`∅** + **-m** | **arbitrarily large but finite** (negative / deficit) |
| **`g#e`** | **`re`** + **`ba`∅** + **-l** | **last place** |
| **`g~#e`** | **`re`** + **`ba`∅** + **-m** | **near last place** |
| **`g#e-`** | **`re`** + **`bu`∅** + **-l** | **start / beginning place** — first with emphasis on **onset** (*the starting one*, *at the beginning*), not mere numbered 1st (`g#1`) |
| **`g~#e-`** | **`re`** + **`bu`∅** + **-m** | **near first place** |
| **`g-e-`** (`ru` + **`bu`∅**) | — | **Undefined** for now (spare cell) |

Same under `/z/` `/d/` `/b/` (`z+e` = +∞ as subject; `d#e-` = start-place as object; `b+e-` = *of an arbitrarily small but finite amount*). Contrast **`g#1`** = numbered *first* / *1st*; **`g#e-`** = beginning/onset landmark.

**Endings** (no-mantissa specials):

| Ending | Sense |
|--------|-------|
| **-l** | Exact special value (default): +∞ / −∞ / last place / start place / arbitrarily small but finite as in the form table |
| **-m** on **`ba`∅** (`…em`) | **Arbitrarily large but finite** on scalars (`g~+e` / `g~-e`); on ordinals (`g~#e`) = **near last place** |
| **-m** on **`bu`∅** (`…e-m`) | Soft / approximate small on scalars; on ordinals (`g~#e-`) = **near first place** |
| **-n** | Proper / conventional designation of that special (named ∞ symbol, official *last place* / *starting* title, …) |
| **-r** | Resume a prior special value of that marker+exp polarity (`g=+e` = *that +∞ again*; `g=+e-` = *that start/small again*) |

**Contrast:** zero-group `g+` = plural count `>1`. Bare OoM `g+e9` = order 10⁹. No-mantissa `g+e` = +∞; no-mantissa `g#e` = last place. Mantissa + digitless **`ba`** (`g+1e` / `g#1e`) = [hyperbole](#hyperbole-gazillion). Mantissa + digitless **`bu`** on **`#`** (`g#2e-`) = [from the end](#from-the-end). Focus ranked digitless (`zel z+`) is **not** a special value — ordinary *only (plural) matters* / preference framing (the old focus→∞ reading is **removed**).

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
| **`v-e-`** | **nudge down** — decrease by an arbitrarily small but finite amount |
| **`h+e`** | **unbounded multiplicity** (× without bound / unboundedly many times) |
| **`h~+e`** | *many times but finite* |
| **`h+e-`** | **unbounded duplicity** (÷ without bound / into unboundedly many parts) |
| **`h~+e-`** | *÷ a lot / into many parts, but finite* |

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

Other `/j/` no-mantissa digitless-exp forms (`j-e`, `j+e-`, `j_…`, …) stay **undefined**.

##### Overlay `/x/`

Under `/x/`, **last-place** **`x#e`** (and **`x~#e`** / **`x@#e`** / **`x=#e`**) = discourse *Finally* / last point, and **start-place** **`x#e-`** (and **`x~#e-`** / **`x@#e-`** / **`x=#e-`**) = discourse *Starting with:* / beginning — see [Number as discourse marker](#number-as-discourse-marker-by-marker). **`x+e`** / **`x-e`** (and other `/x/` no-mantissa digitless-exp forms beyond start/last) stay **undefined**.

#### Hyperbole — mantissa + digitless exponent
<a id="gazillion"></a>

**Mantissa digits** (ordinary count) plus digitless **`ba`** / **`bu`** = a **hyperbolic** magnitude on **scalars** (comic huge / tiny). On **ordinals**, only mantissa + digitless **`ba`** is hyperbole (*umpteenth*); mantissa + digitless **`bu`** is [N from the end](#from-the-end), not hyperbole. Not a real power of ten and not a no-mantissa special (+∞ / last place / …).

##### Scalar (`ra` / `ru`)

| Form | Reading |
|------|---------|
| **`g+1e`** | *one gazillion* (committed hyperbolic huge) |
| **`g+3e`** | *three gazillion* |
| **`g+1e-`** | *one gazillionth* / vanishingly small hyperbole |
| **`g-1e`** | *minus one gazillion* (hyperbolic deficit) |

Same under other referential PoS for scalars.

##### Ordinal umpteenth (`re` + **`ba`∅**)

Mantissa = how many joke-units of **late** rank. Still **finite** place hyperbole — not last-place **`g#e`**.

| Form | Reading |
|------|---------|
| **`g#1e`** | *the gazillionth* / *umpteenth* (comic late place) |
| **`g#3e`** | *the three-gazillionth* |
| **`g~#1e`** | *about the gazillionth* / soft umpteenth |

Contrast: **`g#e`** = last place; **`g~#e`** = near last; **`g#1`** = numbered *1st*.

Digit-string **`ro`** / **`_`** + mantissa + digitless exp stays **undefined**.

**Endings** on hyperbolic forms:

| Ending | Sense | Example |
|--------|-------|---------|
| **-l** | Committed hyperbole — speaker stands behind the joke magnitude | `g+1e` *one gazillion*; `g#1e` *the gazillionth* |
| **-m** | Soft / hedged hyperbole — *about a gazillion*, *umpteen* | `g~+1e` *roughly a gazillion*; `g~#1e` *about the gazillionth* |
| **-n** | **Proper noun / proper designation** — the hyperbolic numeral as a name (a building called *the Gazillion*, a title *One Gazillion*, *the Gazillionth*, …) | `g@+1e`; `g@#1e` |
| **-r** | Resume that prior hyperbolic amount or place (mantissa may repeat or drop when clear: `g=+1e` / `g=+e`; `g=#1e` / `g=#e` if the prior was this hyperbole) | |

**Overlays** (hyperbole) inherit freely:

| Form | Reading |
|------|---------|
| **`h+1e`** | *a gazillion times* |
| **`h#1e`** | *for the gazillionth time* |
| **`v+1e`** | *add a gazillion* |
| **`v#1e`** | *place / come in gazillionth* / *rank as umpteenth* |
| **`j+1e`** | *a gazillion more!* |
| **`j#1e`** | *Gazillionth!* (comic place cheer) |
| **`x#1e`** | *umpteenth point:* / joke late agenda item |

**Not hyperbole:** `g+e` (no mantissa) = +∞; `g#e` / `g#e-` (no mantissa) = last / start place; mantissa + **`bu`** on **`#`** = [from the end](#from-the-end); `g+e9` (digitful exp) = bare OoM; `g+1e9` = 1×10⁹ (real engineering). Do not mix digitless exp with **`je`** / **`jo`** / **`ju`** in the same group.

#### From the end — ordinal mantissa + digitless **`bu`**
<a id="from-the-end"></a>
<a id="nth-from-the-end"></a>

On **`re`** only: mantissa digits + digitless **`bu`** (**`e-`**) = **Nth from the end** — count back from last place. Exact (or soft) end-relative ordinal; **not** hyperbole and **not** the no-mantissa start landmark **`g#e-`**.

| Form | Reading |
|------|---------|
| **`g#1e-`** | *1st from the end* — same referent as last-place **`g#e`**, framed as counting from the end (English *Starting with the last one*) |
| **`g#2e-`** | *2nd from the end* / *penultimate* |
| **`g#3e-`** | *3rd from the end* / *antepenultimate* |
| **`g~#2e-`** | *about 2nd from the end* |
| **`g@#2e-`** | conventional / titled *penultimate* (etc.) |
| **`g=#2e-`** | resume that prior end-relative place |

**Contrast:** **`g#2`** = numbered *2nd* (from the start); **`g#2e-`** = *2nd from the end*; **`g#e`** = last as landmark; **`g~#e`** = near last (no count); **`g#e-`** / **`g~#e-`** = start / near first (no mantissa).

**Overlays** inherit:

| Form | Reading |
|------|---------|
| **`h#2e-`** | *for the 2nd-from-last time* / *the penultimate time* |
| **`v#2e-`** | *place / come in 2nd from the end* |
| **`j#2e-`** | *Penultimate!* / *Second from last!* |
| **`x#1e-`** | *1st-from-end point:* / *Starting with the last one:* (counting twin of **`x#e`** *Finally:*) |
| **`x#2e-`** | *2nd-from-end point:* / *penultimate item:* |

Examples: `g+e` → +∞; `g~+e` → arbitrarily large but finite; `g+1e` → *one gazillion*; `g~+1e` → *about a gazillion*; `g@+1e` → proper name *One Gazillion* / *the Gazillion*; `g+1e-` → *one gazillionth*; `g+e-` → arbitrarily small but finite; `g-e` → −∞; `g#e` → last place; `g~#e` → near last place; `g#e-` → start / beginning place; `g~#e-` → near first place; `g#1e` → *the gazillionth* / *umpteenth*; `g#2e-` → *2nd from the end* / *penultimate*; `g#1e-` → *1st from the end* / *Starting with the last one*; `h#1e` → *for the gazillionth time*; `h#2e-` → *for the penultimate time*; `x#e-` → *Starting with:*; `x#e` → *Finally:* / last discourse point; `v+e` → increase without bound; `v~+e` → increase a lot but finite; `v+e-` → nudge up; `h+e` → unbounded multiplicity; `h#e` → *for the last time*; `h#e-` → *for the first time* (onset); `v#e` → *take last place*; `v#e-` → *take starting place*; `j+e` → *To infinity!*; `j#e` → *Finally!*; `j#e-` → *(finally, we're) starting!*; `h+1e` → *a gazillion times*; `g+e9` → bare OoM e9; `g+` → plural `>1`.

## Percent and percentage points

Percent and percentage points are **scalar notation modes** on **`ra`** / **`ru`**, not new marker identities and not endings. They use group closers **`jo`** / **`ju`**, parallel to **`je`**.

| Closer | Sense | Mantissa digits | Underlying magnitude |
|--------|-------|-----------------|----------------------|
| **`jo`** | **Percent** (portion of a whole) | Everyday percent figure (`25` in `25%`) | mantissa ÷ 100 |
| **`ju`** | **Percentage points** (point-scale amount or delta) | Point figure (`2` in `+2%*`) | mantissa ÷ 100 |

Mantissa digits follow the [normal mantissa rules](#exponents) (including optional **`je`** inside the percent/point reading). Say the digits you mean (`100%` → `wo zo zo jo`, not a shortened speech form).

### Form

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

### What each closer is for

| English habit | Clarity |
|---------------|---------|
| `25% of X` (portion) | whole NP + `/ɡ/` **`…jo`** — [denominator](#percent-denominators) |
| `+2 percentage points` / `from 10% to 12%` point delta | **`ju`** (often as `/v/` **`ra`** / **`ru`**: increase/decrease by that point amount) |
| `+50% relative to baseline` (factor change) | **Not** **`jo`** / **`ju`** — use a multiplicative `/h/` factor (**`h+1.5`**, etc.) or ordinary *relative-to* wording |

`25%` (`…jo`) and `0.25` (plain scalar) name the same magnitude; **`jo`** only chooses the percent-scale reading. **`ju`** likewise names a ÷100 magnitude, but framed as **points** (not as “N% of a whole”).

### Denominator (portion “of what”)
<a id="percent-denominators"></a>
<a id="percent-of-what"></a>

The **whole** / reference class is **not** inside the number word — no denom closer, no open argument on the numeral.

**Default:** the whole is the **host noun**; the percent is an ordinary `/ɡ/` scalar on that noun — same slot as a count (`z-catlsh g+3` = *three cats*):

| Shape | Gloss |
|-------|--------|
| `z-catlsh g+25%` | *25% of the cats* |
| `d-testlsh g+95%` | *95% of the tests* (object) |
| `b-peoplelsh g+5%` under a host relation | *5% of the people* as `/b/` |

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

**Style:** a bare `/z/` (or other freestanding) **`…jo`** percent with no named whole is **grammatical but stylistically bad** — same pressure as Claritish *Percent of what*. Prefer an explicit whole. Bare **`…ju`** point amounts are fine when the percent-scale quantity being moved is already clear.

## Digit-strings

Use marker **`ro`** (written **`_`**). Omit exponents. Prefer groups of three digits when digits are present. Ending is usually **-l** (exact label); **-n** for an official designation; **-r** to resume a prior code (**digitless** `d=_` / `g=_` allowed). [Digitless](#zero-digit-groups) `…_` = unspecified label / some code. Bare `/h/` + **`ro`** is **[temporal circumstance only](#time)** (`h_15,30`, `h_2026,07,22`, digitless `h_`) — not a generic code adverb. Non-time labels as circumstance use a host relation + `/b/` (e.g. `/h/` *on* + `b_7` *channel 7*), or modify a noun with `/ɡ/`. Digit-strings are unsigned — see [Sign](#sign). Clock and calendar field orders are under [Time](#time).

## Time

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

## Writing (preferred shorthand)
<a id="writing-preferred-shorthand"></a>

Speech always uses the full CV grammar above (marker as `r`+V; ending as **-l** / **-m** / **-n** / **-r**). **Writing prefers shorthand** for the ending, marker, and body.

```
[PoS] + [~|@|=]? + [marker] + [body?]
```

### Ending marks (second slot, after PoS)

Same glyphs and jobs as [span-fence marks](spans.md#writing) (**`~`** soft / **`@`** proper); anaphor uses **`=`** (keyboard-friendly; spans use interior **`=`** — `d[=]`).

| Mark | Speech ending | Job | Examples |
|------|---------------|-----|----------|
| *(none)* | **-l** | exact (default) | `g+3`, `g+`, `x#2`, `d_555,123,4567` |
| **`~`** | **-m** | approximate / soft | `g~+3`, `g~+`, `g~+27e6`, `g~#e` |
| **`@`** | **-n** | conventional / proper | `g@#2`, `g@+1e`, `x@#e` |
| **`=`** | **-r** | anaphoric resume | `g=+`, `d=_`, `x=#2`, `g=#1e` |

Order when both **`@`** and **`~`** apply: **`@` then `~`**. **Do not write** the stack with both glyphs — spell **`@`** only, with uncertain tonality (same hedge habit as spans). **`=`** does **not** combine with **`~`** / **`@`**. Full phonetic spelling with a trailing ending letter (e.g. *grarel*, *gram*) is fine as a pronunciation gloss, not preferred in running text.

### Marker (not written as `r`+V)

| Symbol | Speech | Meaning |
|--------|--------|---------|
| **`+`** | `ra` | Positive scalar |
| **`-`** | `ru` | Negative scalar |
| **`#`** | `re` | Ordinal |
| **`_`** | `ro` | Digit-string |

Place the identity symbol **immediately after** any ending mark (or after PoS when exact), **before the body** (or alone when the body is empty): `g+3`, `g~+3`, `g=+`, `d_555,123,4567`, `d=_`, `g@#2`. After **`#`** or **`_`**, do **not** write a following **`-`** (no signed labels/ordinals) — see [Sign](#sign).

### Body

| Speech | Preferred writing |
|--------|-------------------|
| *(no digit groups)* | *(empty after marker)* `g+`, `g~-`, `g=#`, `h_` |
| Digit syllables (`wo`…`zo`) | Arabic **`0`–`9`** |
| `ba` / `bu` (+ `ja` when a mantissa follows) | **`e`** / **`e-`** (engineering or scientific form) |
| `ba` / `bu` with **no** digits ([digitless exp](#digitless-exponents)) | **`e`** / **`e-`** with no power digits — specials `g+e`, `g+e-`; hyperbole `g+1e`, `g+1e-`; from-the-end `g#2e-` |
| `je` | **`.`** |
| `jo` | **`%`** |
| `ju` | **`%*`** |

Do **not** write out **`ja`**, **`je`**, **`jo`**, or **`ju`** in shorthand — use `e` / `.` / `%` / `%*` instead.

**Commas** separate digit groups for readability (preferred for multi-group values). Commas are orthographic only; they are not spoken and do not change the word. Digitless forms have no commas.

For long values, break into digit groups of at most three mantissa digits (plus their exponents); all groups still sit in **one** word after a single marker.

## Examples

Preferred writing first; speech sketches show structure (exact **-l** unless noted). Digits in speech use the [digit table](#digits).

| Value | Preferred writing | Speech sketch |
|-------|-------------------|---------------|
| plural / more than one | `g+` | *gral* (`g` + `ra` + `l` — [digitless](#zero-digit-groups)) |
| about several (`>1`) | `g~+` | *gram* |
| +∞ | `g+e` | *grabal* (`g` + `ra` + `ba` + `l` — [digitless exp](#digitless-exponents)) |
| arbitrarily large but finite | `g~+e` | *grabam* |
| one gazillion (hyperbole) | `g+1e` | *grawobal* (`ra` + wo + `ba` + `l`) |
| about a gazillion | `g~+1e` | *grawobam* |
| the Gazillion (proper name) | `g@+1e` | *grawoban* |
| one gazillionth | `g+1e-` | *grawobul* (`ra` + wo + `bu` + `l`) |
| the gazillionth / umpteenth | `g#1e` | *grewobal* (`re` + wo + `ba` + `l`) |
| about the gazillionth | `g~#1e` | *grewobam* |
| 2nd from the end / penultimate | `g#2e-` | *gredubul* (`re` + du + `bu` + `l`) |
| 1st from the end / *Starting with the last one* | `g#1e-` | *grewobul* (`re` + wo + `bu` + `l`) |
| for the gazillionth time | `h#1e` | *hrewobal* |
| for the penultimate time | `h#2e-` | *hredubul* |
| *Gazillionth!* | `j#1e` | *jrewobal* |
| *Penultimate!* | `j#2e-` | *jredubul* |
| umpteenth point: | `x#1e` | *xrewobal* |
| 2nd-from-end point: | `x#2e-` | *xredubul* |
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
| nudge down | `v-e-` | *vrubul* |
| take last place | `v#e` | *vrebal* |
| take starting place | `v#e-` | *vrebul* |
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
| about 27e6 | `g~+27e6` | *grabagujadulem* (ba gu **ja** du le, ending **-m**) |
| phone 555-123-4567 | `d_555,123,4567` | *drovavavawoduremovagulel* (`d` + `ro` + va×3 · wo du re · mo va gu · le + `l`) |
| scientific 5.2487083e-4 | `g+5.2487083e-4` | *grabumojavajedumohalezoharel* (`ra` + bu mo **ja** + va **je** + du mo ha · le zo ha · re) |
| 25% | `g+25%` | *graduvajol* (`g` + `ra` + du va **jo** + `l`) |
| 25% of the cats | `z-catlsh g+25%` | host whole + `/ɡ/` percent — [denominator](#percent-denominators) |
| about 3% | `g~+3%` | *grarejom* (`ra` + re **jo** + `m`) |
| −12.5% | `g-12.5%` | *gruwodujevajol* (`ru` + wo du **je** va **jo**) |
| 100% | `g+100%` | *grawozozojol* (`ra` + wo zo zo **jo**; normal mantissa digits) |
| +2 pp | `g+2%*` | *gradujul* (`ra` + du **ju**) |
| about −1.5 pp | `g~-1.5%*` | *gruwojevajum* (`ru` + wo **je** va **ju** + `m`) |
| neutral point 1 / 2 | `x#1`, `x#2` | *xrewol*, *xredul* (`x` + `re` + …) |
| corroborating item 3 | `x+3` | *xrarel* (`x` + `ra` + re) |
| independent item 2 | `x-2` | *xrudul* (`x` + `ru` + du) |
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

In a sentence, the PoS attaches to that single number word (see [Parts of speech on numbers](#parts-of-speech-on-numbers); e.g. direct-object digit-string: `d_…`). Prefer naming the whole as the host of a `/ɡ/` **`jo`** percent ([denominator](#percent-denominators): `z-catlsh g+25%`).

## Measure phrases
<a id="measure-phrases"></a>
<a id="units"></a>
<a id="unit-amount"></a>

A **measure** is a lexicon **unit** noun plus a scalar **amount** grading that unit — not two bare `/b/` arguments, and not a new number closer (unlike closed **`jo`** / **`ju`**).

**Shape:** unit as the head noun in the needed slot; amount as ordinary `/ɡ/` scalar on that unit:

| Slot | Shape | Gloss |
|------|--------|--------|
| Argument of a complex `/ɡ/` / `/h/` | `b-inchl g+2` | *two inches* (one `/b/` NP) |
| Subject / object / … | `z-hourl g+3`, `d-meterl g+5` | *three hours*, *five meters* |
| Modifier on a noun | `g-inchl g+2` on a host | rare; prefer unit as `/b/` or freestanding NP |

Same endings and fuzzy **-m** habits as other number words on the amount (`g~+2` ≈ *about two*). The **unit** is ordinary lexicon (reference suffixes as usual). Do **not** encode open-class units inside the numeral word.

### No metric prefixes
<a id="no-metric-prefixes"></a>
<a id="metric-prefixes"></a>

**Metric prefixes are not lexicon roots.** There is no dictionary entry *kilometer*, *milligram*, *nanosecond*, and so on. Lexicon units are **base** (*meter*, *gram*, *second*, …). Scale the amount instead:

| Prefer | Avoid |
|--------|--------|
| *meter* + amount in thousands / `e3` (or the exact count) | *kilometer* |
| `b-meterl g+5400` or `b-meterl g+5.4e3` for 5.4 km | `*b-kilometerl g+5.4` |
| `b-graml g+40e3` | *40 kilograms* as a prefixed unit word |

Use [engineering exponents](#exponents) on the amount when convenient (`e3` / `e-3` / `e6` / …), or write the full scalar (`5400` meters). Same habit for other SI-style prefixes (*milli-*, *micro-*, *mega-*, …): keep the base unit; put the power of ten in the number.

**Measured differentials** (*two inches taller*) put that measure NP as the **single `/b/`** on the SHARED scale adjective of a [comparative](comparatives.md#measured-differentials):

`zel g-talll b-inchl g+2 z-Samn z-Lean` → *Sam is two inches taller than Lea*

Vague degree stays `/w/` on the scale (`zel w-muchl g-talll …`) — no unit. Duration and other clause measures use the same unit+amount habit in whatever slot the relation needs.

**Not this pattern:** percentage closers (**`jo`** / **`ju`**); bare multiplicative `/h/` factors (`h+1.5`); stacking `b+2 b-inchl` as two arguments of one adjective.

## Ranges
<a id="number-ranges"></a>
<a id="numeric-ranges"></a>
<a id="from-to"></a>
<a id="shared-continuum"></a>

Spans reuse [phrase fences](coordination.md) whose conjuncts are number words, with a **SHARED continuum** `/ɡ/` naming the line — the same SHARED slot [comparatives](comparatives.md) use for a scale, but here the `/ɡ/` is a **dimension / quantity continuum**, not an entity-ranking scale. There is **no** range form inside a single number word (no `g+3-5`). Fence join vowels, endings, revision, and **-r** are defined in coordination; **this section** is the source of truth for when those forms mean a numeric span.

**Trigger (all required):**

1. Exactly **two** endpoints that are **compatible** number words (same marker identity: both scalar, both ordinal, or both digit-string / time).
2. Join **`a`** / **`e`** / **`ue`** / **`ua`** (or those vowels’ **-r**).
3. A **SHARED continuum** `/ɡ/` immediately after the join (lexicon: dimension / quantity line — *age*, *price*, *time*, *height*, …; stock **`g-spanl`** / **`g-amountl`** when the line is pure numeric or supplied by context/head).

The fence PoS matches the slot (`zal` / `dal` / `gal` / `bal` / …). Mixed identities on one span are illegal.

**Without SHARED continuum:** two number conjuncts are **ordinary coordination** — never a span. In particular bare **`zel z+3 z+5`** = *3 ≻ 5* (preference / rank), not *from 3 to 5*.

| Join | Inclusive shape | Reading |
|------|-----------------|--------|
| **`a`** | `zal g-agel z+3 z+5` | *between 3 and 5* on age (unordered filled interval; both ends in) |
| **`e`** | `zel g-agel z+3 z+5` | *from 3 to 5* on age (directed; first → second) |
| **`ue`** | `zuel g-agel z+5 z+3` | directed reverse path on age (spoken order = path; here *from 5 to 3*) |
| **`ua`** | `zual g-agel z+3 z+5` | *outside 3–5* on age (complement on the line) |
| **`o`** / **`ao`** | — | **Not** ranges — stay discrete (*3 or 5* / *3 and/or 5*); SHARED continuum does not license a span |
| **`ae`** | `zael z+5 z+5` / `zaem z+3 z+5` | *equal to 5* / *approximately equal* — **not** a span (no continuum needed; continuum + **`ae`** + numbers is not a range reading) |
| **`oe`** | — | **Not** ranges — exclusive ranked / bare empty superlative with scale |

**Arity escape:** three or more number conjuncts under **`a`** stay an ordinary discrete inventory (`zal z+1 z+3 z+7` = *1, 3, and 7*), even with SHARED. Focus **`zal z+3`** stays *just 3*, not a ray. Focus **ranked** with a number is a [threshold](#numeric-thresholds), not ordinary *only X matters*.

**Contrast with comparatives:** `zel g-bigl z-Samn z-Lean` = *Sam is bigger than Lea* (SHARED **scale**, non-number conjuncts). `zel g-agel z+3 z+5` = *from 3 to 5 on age* (SHARED **continuum**, number endpoints). Bare `zel z+3 z+5` = prefer 3 over 5.

### Thresholds (focus ranked)
<a id="numeric-thresholds"></a>
<a id="greater-less-than"></a>

When the **sole** conjunct of a [rank join](coordination.md#ranked-conjunction-e) fence (**`e`** / **`ue`**, and their open / named twins) is a **compatible number word**, that number is an **extremum on the line**, not “only this value matters” and not a two-endpoint [span](#ranges). SHARED continuum is **optional** on thresholds: absent = implicit / contextual numeric line; present = that named line (`zel g-agel z+5` = *age \< 5*). Special values such as +∞ use [digitless exponents](#digitless-exponents) inside the number word (`g+e`), not focus ranked zero-group forms.

| Form | Reading | Mnemonic |
|------|--------|----------|
| **`zel z+5`** | ***less than 5*** (`< 5`) | 5 is the **greatest** (ceiling); the ray is everything it outranks |
| **`zem z+5`** | soft / approximate *less than ~5* | open twin |
| **`zuel z+5`** | ***greater than 5*** (`> 5`) | 5 is the **least** (floor); reverse-ranked extremum |
| **`zuem z+5`** | soft / approximate *greater than ~5* | open reverse twin |
| **`zen z+5`** | named/conventional **unspecified** extremum label (*under-fives*-style) | phrase **-n** on **e** |
| **`zaen z+5`** | named/conventional **equal-to-5** band / tie label | phrase **-n** on **ae** |
| **`zuen z+5`** | named/conventional floor band | phrase **-n** reverse |

Same under `/d/` `/b/` `/ɡ/` (`gel g+5` = modifier *\<5*; `duel d+10` = object *\>10*). **`ae`** / **`oe`** focus with a number are **not** thresholds (stay ordinary ranked focus / triage). Boolean focus (**`zal`** / **`zol`** / …) is **not** a threshold. Focus **`zel z+`** (zero-group) is **not** +∞ and **not** a threshold — ordinary focus on plural/unspecified amount; use **`z+e`** / **`g+e`** for +∞.

**Inclusive bounds:** default is **strict** (`<` / `>`). For **≤ 5** / **≥ 5**, use a two-endpoint [span](#ranges) with the bound included — do **not** flip focus ranked to inclusive. Exclusive-high **`ul`** stays a two-side span tool (`zal g-spanl z+3 ul z+5`), not a focus threshold marker.

**Unspecified in a threshold:** bare **`e`** + **-r** = unspecified member of the *\< X* ray — `zer z+5` → *some/whatever value \< 5* (under question → *which value \< 5?*). **`ue`** takes **no** **-r** (stacked forms never do — [coordination](coordination.md#unspecified-member-r-phrase)); there is no `zuer` threshold. For an unspecified value *\> 5*, use other wording for now (e.g. a two-endpoint span with an open high, once defined), not a reverse **-r** fence.

Contrast: `zel g-agel z+3 z+5` = *from 3 to 5 on age* (span); `zel z+3 z+5` = *3 ≻ 5* (preference); `zel z+5` = *\< 5* (focus threshold); `z+e` / `g+e` = +∞ ([digitless exponents](#digitless-exponents)). `zel z-Samn` (non-number) stays ordinary *only Sam matters* / [superlative-with-scale](comparatives.md) — **focus number conjunct** triggers the threshold reading when the number is a bound (typically digitful).

### Half-open (exclude the high end only)

[Revisers](revisers.md) **inside the range** marks an exclusive **upper** bound. Replace the second (high) conjunct with prefix-less **`ul`** + that number. SHARED continuum stays required:

| Shape | Reading |
|-------|--------|
| `zal g-spanl z+3 z+5` | *[3, 5]* — inclusive both ends |
| `zal g-spanl z+3 ul z+5` | *[3, 5)* — *3 up to but not including 5* |
| `zel g-spanl z+3 ul z+5` | *from 3 up to but not including 5* |

The low endpoint is **always inclusive**. Do **not** exclude the beginning edge (no `ul` before the low; no open-low span). Do **not** list the high end as a conjunct and then except it (`*zal g-spanl z+3 z+5 ul z+5`); the exclusive high is **only** the in-range `ul` shape. Open **`um`** on the high end = soft / non-exhaustive exclusion of that bound (rare). Other revision vowels (**`al`** / **`el`** / **`ol`**) are not range-bound markers.

Fence **-l** / **-m** / **-n** keep ordinary closed / open / named senses on the span (*exactly this band* / *around this band* / *the teens*-style label). Endpoint [number endings](#number-endings) still apply (**-m** ≈ fuzzy that bound).

### Unspecified value in the span (**-r**)

Fence **-r** on a number-range shape (still with SHARED continuum) = an **unspecified member of the span** (not content-word anaphor **-r**, not a discrete *something among two listed values*):

| Form | Reading |
|------|--------|
| `zar g-spanl z+3 z+5` | *some value in [3, 5]* |
| `zar g-spanl z+3 ul z+5` | *some value in [3, 5)* |
| `zor g-spanl z+3 z+5` | *any value in [3, 5]* (free-choice) |
| `zer g-spanl z+3 z+5` | *whatever-by-rank in [3, 5]* |
| `zur g-spanl z+3 z+5` | *some value other than (in) [3, 5]* — other-than the span |

Under [question](questions.md#fill-ask-r) force, these are fill-asks (*which value in 3–5?*). Same under `/d/` `/b/` / `/ɡ/` as the slot needs (`gal g-agel g+3 g+5` = modifier *ages 3–5*; `dar g-spanl d+10 ul d+20` = object *some value in [10, 20)*).

**Clock / date spans:** do **not** use bare circumstance-`hal` (that series is [applicability](restrictors.md)). Prefer SHARED continuum **`g-timel`** (or a host relation + `/b/`) with digit-string endpoints (`bal g-timel b_15,00 b_16,00`).

Examples: `zal g-agel z+3 z+5` → *between ages 3 and 5*; `z-kidl gal g-agel g+3 g+5` → *kids ages 3–5*; `zal g-spanl z+3 ul z+5` → *[3, 5)*; `zel g-agel z+10 z+20` → *from age 10 to 20*; `zel z+3 z+5` → *3 ≻ 5* (preference, not a span); `zel z+5` → *\< 5*; `zuel z+5` → *\> 5*; `g+e` → +∞; `g+1e` → *one gazillion*; `g@+1e` → proper name *the Gazillion*; `g~+e` → arbitrarily large but finite; `g+e-` → arbitrarily small but finite; `g#e` → last place; `g~#e` → near last place; `g#e-` → start / beginning place; `g~#e-` → near first place; `g#1e` → *the gazillionth* / *umpteenth*; `g#2e-` → *2nd from the end* / *penultimate*; `h#1e` → *for the gazillionth time*; `x#e-` → *Starting with:*; `v+e` → increase without bound; `h+e` → unbounded multiplicity; `j+e` → *To infinity!*; `j#e` → *Finally!*; `zael z+5 z+5` → *equally 5* / *5 equals 5*; `zaem z+3 z+5` → *3 and 5 approximately equal*; `zar g-spanl z+3 z+5` → *some value in 3–5*; `zol z+3 z+5` → *3 or 5* (discrete, not a range).

## Numeric derivation (compounds)

PoS-less number stems may follow mid-word **`x`** on an ordinary content root (`ROOTx+e`, `ROOTx_12`, `ROOTx+1e`, …). That family is **derivation** (essence, coded subtype, hyperbole-ROOT, …), documented in **[special-vocabulary.md § Numeric derivation](special-vocabulary.md#numeric-derivation)**; parser cue in **[x-compounds.md](x-compounds.md)**. Free number words on this page stay clause-slot counts, ranks, labels, overlays, and discourse items.

## Stress (pronunciation guide)

- Digitless numbers (marker + ending only): stress the **marker** syllable (`ra` / `ru` / `re` / `ro`).
- [Digitless exponent](#digitless-exponents) forms (`ba`/`bu` alone): stress the **exponent marker** (`ba` / `bu`).
- Single-digit magnitude groups: stress the digit syllable.
- Multi-digit groups without exponent: stress the **leftmost** digit.
- Groups with an exponent: stress the **leftmost exponent digit**.
- **`je`** (decimal point): always stressed when present.
- **`jo`** / **`ju`** (percent / percentage points): always stressed when present.
- Digit-string groups: stress the **first digit** of each group.

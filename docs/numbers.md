# Numbers

Numerals are a **closed formal subsystem**, not ordinary lexicon roots. Open quantifiers (*many*, *all*, *some*, …) stay lexicon; the numeral word itself can be [digitless](#zero-digit-groups) (unspecified magnitude of a marker identity, including plural **`>1`** on **`ra`**). PoS prefixes are defined in [language-reference.md](language-reference.md); plural **-sh** in [plurality.md](plurality.md); general phonotactics live in [phonology.md](phonology.md); ordinary reference suffixes in [reference-suffix.md](reference-suffix.md). This page is the source of truth for numeral grammar, including [percent denominators](#percent-denominators) (whole NP + `/ɡ/` `…jo`), [ranges](#ranges) (spans reuse [phrase fences](coordination.md) with SHARED continuum `/ɡ/`, documented here) and [measure phrases](#measure-phrases) (unit + amount for differentials and durations).

A whole numeric value is **one word**, even when it contains several digit groups (or none).

## Word shape

```
[PoS] + r + V + ( [exponent?] [mantissa digits?] )* + [ending]
```

1. **PoS** — same prefix inventory as elsewhere; [roles for number words](#parts-of-speech-on-numbers) below.
2. **Number marker** — consonant **r** plus a vowel **V** (see [Marker vowel](#marker-vowel-referential-identity)). The PoS+`r` cluster is a [number-only phonotactic exception](phonology.md#phonotactics).
3. **Zero or more digit groups** — each group is an optional exponent and optional mantissa digits (at least one of the two **when the group is present**). Digits compound with **no** **x** separator. There is **no per-group polarity**; sign (when it applies) is once for the whole word — see [Sign](#sign). **No groups** = [unspecified magnitude](#zero-digit-groups) of that marker identity (or [digitless **-r** anaphora](#number-endings)).
4. **Ending** — `-l` / `-m` / `-n` / `-r` with [number-specific meanings](#number-endings) (not ordinary [reference suffix](reference-suffix.md) senses). Number words **do not** take plural **-sh** — group reference stays on ordinary nouns (see [plurality.md](plurality.md)).

**Writing** uses a [preferred shorthand](#writing-preferred-shorthand) for the marker and body (`g+3l`, not *grarel*; digitless `g+l`, not *gral*); speech is always the full CV form.

**Lexicon rule:** Any stem that matches this grammar is a number, never an ordinary root. Dictionary generation must reject colliding roots.

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
| **a** | `+` | Positive **scalar** (count or measure amount) | `g+3l` *three cats*; `g+l` *plural / more than one*; `z+3l` *three* (subj); `b+12l` *of size 12* |
| **u** | `-` | Negative **scalar** | `d-3l` *−3* (obj); `z-l` *some negative amount*; `g-2l` signed measure on a noun |
| **e** | `#` | **Ordinal** / rank | `g#2l` *the second page*; `g#l` *some rank*; `z#2l` *second* (rank as subject) |
| **o** | `_` | **Digit-string** / label (phones, IDs, “read the digits”) | `d_555,123,4567l`; `d_l` *some code*; `g_12l` *room 12*-style; `b_…` under a host relation |

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

“Set to N” (bring a quantity to an absolute value) is not a number-verb sense — use an ordinary verb plus the number as argument or adverb. Multiply/divide likewise stay ordinary verbs plus the number as `/h/` (**`h+Nl`** / **`h-Nl`**). With [percentage points](#percent-and-percentage-points) (**`ju`**), **`ra`** / **`ru`** as verbs mean increase/decrease by that point amount (not a relative %-change factor).

Endings still apply (**-m** ≈ *about* that amount/code/rank, **-r** resume — including [digitless](#zero-digit-groups) `v+r` / `v_r`, etc.).

### Number as adverb (by marker)

`/h/` + number inherits the marker’s identity, so the adverbial role follows **V**.

| Marker | Writing | Adverb sense |
|--------|---------|--------------|
| **`ra`** | `h+Nl` | **Multiplicative / factor** — *N times*; *×N*; *by a factor of N* (alone, or with ordinary *multiply*). |
| **`ru`** | `h-Nl` | **Inverse / partition** — *÷N*; *into N parts*; *1/N as often*; *every Nth* (alone, or with ordinary *divide*). |
| **`re`** | `h#Nl` | **Nth occurrence of the event** — *for the Nth time*; *on the Nth try* (clause-event ordinal, not discourse list independence). |
| **`ro`** | `h_…l` | **Temporal circumstance only** — *at 15:30*; *on 2026-07-22* (clock or calendar digit reading). **Not** channel, frequency, gate, or other non-time codes — those use a host relation + `/b/` (or `/ɡ/` on a noun). See [Time](#time). |

Contrasts:

- `h+3l` — *three times* / ×3
- `h-3l` — ÷3 / every third / into 3
- `h_15,30l` — *at 15:30* (bare `hro` = time; [Time](#time))
- `h_2026,07,22l` — *on 2026-07-22* (bare `hro` date)
- `/h/` *on* + `b_101.1l` — *on 101.1* (non-time code; not bare `h_…`)
- `h#3l` — *for the third time*
- `j#3l` — *Third!* (place cheer)
- `x#3l` — *point 3:* (neutral discourse item)
- `g#3l` — *the third* (modifies a noun)
- `v+3l` — *add 3* (verb)

Endings still apply (**-m** ≈ *about* that many times / that clock or date, **-r** resume — including digitless `h+r` / `h_r`). Relative %-change factors use **`h+…`** (e.g. ×1.5), not **`jo`** / **`ju`** alone — see [percent](#percent-and-percentage-points).

### Number as interjection (by marker)

`/j/` + number is an **interjection** (expressive call-out), not clause force. Clause force stays the closed non-numeric set in the [utterance-marker section](language-reference.md#clause-force). Number interjections appear only in the left-edge `/j/` cluster (before force, when a clause follows) or as a bare utterance with no force.

| Marker | Writing | Interjection sense |
|--------|---------|-------------------|
| **`ra`** | `j+Nl` | **Quantity addition** — *Three more!*; *Ten more!* (add N to the relevant count / tally / order). |
| **`ru`** | `j-Nl` | **Deficit / shortfall call** — *Three short!*; *Three fewer!*; *Down by 2!*; *−3!* (mirror of `j+`). |
| **`re`** | `j#Nl` | **Place / rank cheer** — *First!*; *Second!* (podium / place shout). |
| **`ro`** | `j_…l` | **Digit-label / magnitude call-out** — *Three!*; *B-12!*; *five-five-five!*; score, bingo, code, or ID as a bare reading of the digits (not “N more”). |

**Label vs addition:** bare English *Three!* / *Twelve!* as naming a score, ball, or count → **`j_`**. *Three more!* (increment the tally) → **`j+`**. Bingo / room codes / phone fragments → **`j_`**.

Contrasts:

- `j_3l` — *Three!* (label / score / count reading)
- `j+3l` — *Three more!* (quantity addition)
- `j-3l` — *Three short!* / *Three fewer!* / *−3!* (deficit)
- `j_27l` — *Twenty-seven!* as label call
- `j#1l` — *First!* (place cheer)
- `x#1l` — *point 1:* (neutral discourse item)
- `h#1l` — *for the first time*
- `v#1l` — *take / assign 1st* (verb)

Endings still apply (**-m** fuzzy *about three more!* / *about three!*, **-n** conventional call name, **-r** resume a prior shout’s value — digitless `j+r` / `j_r` allowed).

### Number as discourse marker (by marker)

`/x/` + number is discourse glue for numbered list items and label cites. Marker vowel encodes **independence framing** of the list item (or cite-as-label for **`ro`**). It does **not** occupy a main-clause argument or adjunct slot (contrast `/ɡ/` *the second page*, `/h/` *three times* / *for the Nth time*, `/j/` interjection shouts).

| Marker | Writing | Discourse sense |
|--------|---------|-----------------|
| **`re`** | `x#Nl` | **Neutral point N** — numbered item with no independence framing (*point N:*, *note N:*, bare *(N)*). |
| **`ra`** | `x+Nl` | **Corroborating item N** — backs, restates, or same-directions an earlier item (*corroborating N:*, *echoing N:*). Legitimate for emphasis, clarity, teaching, or a related source—not a new line of support. |
| **`ru`** | `x-Nl` | **Independent item N** — a new line of support or consideration (*independent N:*, *distinct N:*). Would still matter if other listed items were gone. |
| **`ro`** | `x_…l` | **Cite a discourse label** — agenda item, section code, slide, ticket id (digits as label, not independence framing) (*regarding item 12; under 3.2*). |

**Independence framing:** **`#`** = unmarked inventory or steps; **`+`** = corroborating (aligned with something already listed); **`-`** = independent (new line of support). Do not use **`+`** / **`-`** for for/against or open vs scratch a bullet — independence is the point. Ordinary *firstly / secondly* without that framing is **`x#Nl`**. For/against and both-sides checks stay in ordinary wording or claim-level evidentiality, not on the number marker.

Contrasts:

- `g#2l` — *the second* (modifies a noun)
- `x#2l` — *point 2:* (neutral discourse item)
- `x+2l` — *corroborating 2:*
- `x-2l` — *independent 2:*
- `h#2l` — *for the second time* (event ordinal adverb)
- `j#2l` — *Second!* (place cheer)
- `j_3l` — *Three!* (label / score reading)
- `j+3l` — *Three more!* (quantity addition)
- `j-3l` — *Three short!* / *Three fewer!* / *−3!* (deficit)

Endings still apply (**-l** newly stated item, **-r** *as in (N) above* or digitless `x#r` / `x+r` / … for *as in that item above* with same independence framing, **-n** titled / official item name, **-m** fuzzy *around item N*). Percent / percentage-point closers are not used with `/x/` numbers.

## Number endings

Ordinary [reference suffix](reference-suffix.md) senses do **not** apply inside number words.

| Ending | Meaning |
|--------|---------|
| **-l** | Exact, newly stated (default) |
| **-m** | Approximate / non-literal (“about N”) |
| **-n** | Conventional / proper designation (titles, official labels, *the Second…*) |
| **-r** | Anaphoric resume of a previously stated number, code, or rank |

**-r** may be **digitless**: marker + **-r** alone resumes the prior value of that identity without restating digits (`g+r` = *that (scalar) amount again*; `d_r` = *that code again*; `g#r` = *that rank again*). Digits + **-r** still fine when you want to name which prior item (`x#2r` = *as in (2) above*). Marker must match the resumed identity (do not resume a scalar with `g#r`).

On [digitless](#zero-digit-groups) words, **-l** / **-m** / **-n** keep the same discourse jobs relative to the unspecified magnitude (*exact plural count* / *about several* / *conventional “plural” or unlabeled-rank style*, etc.).

## Zero digit groups
<a id="zero-digit-groups"></a>
<a id="digitless-numbers"></a>
<a id="bare-marker"></a>

A number word may omit every digit group: **PoS + marker + ending** only. The marker still fixes referential identity. With **-l** / **-m** / **-n**, the magnitude (or label/rank payload) is **unspecified** as in the table below. With **-r**, the word is [digitless anaphora](#number-endings) only — resume a prior value of that identity; it does **not** introduce a new unspecified magnitude.

| Marker | Writing | Digitless sense | Partition / notes |
|--------|---------|-----------------|-------------------|
| **`ra`** | `…+l` (etc.) | Unspecified **positive scalar**, specialized to **plural count / amount `>1`** | Complements `…+0l` (zero), `…+1l` (one), `…+Nl` (exact N≥2). Not “any non-negative,” not “≥0.” |
| **`ru`** | `…-l` | Unspecified **negative scalar** (*some negative amount*; deficit of unnamed size) | Exact negatives stay `…-Nl`. |
| **`re`** | `…#l` | Unspecified **rank** (*some nth* / *some place*) | Exact ranks stay `…#Nl`. |
| **`ro`** | `…_l` | Unspecified **digit-string / label** (*some code*; *a label*) | Exact labels stay `…_…l`. |

**Vs noun plural `-sh`:** `-sh` marks that a **referent is a group** ([plurality.md](plurality.md)) — indefinite group introduction stays **-lsh** / **-msh**, not digitless. Digitless **`ra`** marks that a **count/amount is `>1`** without naming N. They are different jobs (quantity vs group-reference) and may co-occur (`z-catlsh g+3l`). Do **not** treat `g+l` as a replacement for noun **-lsh**, nor as plural morphology on verbs, circumstance, or number words themselves.

**Vs fence `-r`:** phrase **`zar`** / **`zor`** / … pick an unspecified **member of an inventory**. Digitless number **-r** resumes a **prior numeric value**. Digitless number **-l** (etc.) introduces an unspecified magnitude of that marker — not inventory membership.

**Overlays** inherit the same emptiness (marker identity → role reading, payload unspecified):

| Overlay | Digitless examples |
|---------|-------------------|
| `/ɡ/` `/z/` `/d/` `/b/` | `g+l` *plural / more than one* (on a noun); `z-l` *some negative amount* (subj); `b#l` *of some rank*; `d_l` *some code* (obj) |
| `/v/` | `v+l` *add some plural amount* / *increase by more than one*; `v-l` *decrease by some amount*; `v#l` *take / assign some rank*; `v_l` *enter / dial some code* |
| `/h/` | `h+l` *multiple times* / ×(unspecified `>1`); `h-l` *÷(unspecified)* / *into some number of parts*; `h#l` *for some nth time*; `h_l` *at some clock or date* (still bare-`hro` **time** only — not channel codes) |
| `/j/` | `j+l` *More!* (unspecified plural addition); `j-l` *Short!* / *down by some amount!*; `j#l` *Nth!* (place cheer, rank unnamed); `j_l` *…!* (unspecified score / code call) |
| `/x/` | `x#l` *some point:* (neutral, number unnamed); `x+l` / `x-l` corroborating / independent item of unnamed index; `x_l` *regarding some (unnamed) label* |

**`h_l` vs `har`:** digitless time `h_l` is still a **number word** (unspecified clock/date reading under bare `hro`). Circumstance **`har`** (*sometime*) is the [restrictor](restrictors.md), not a numeral — do not swap them.

**Illegal with zero groups:** percent / percentage-point closers (**`jo`** / **`ju`**) still need a mantissa group — bare `…+%l` is not a shortcut for “some percent.” Exponent-only groups (`e9`) are **not** zero-group forms; they are ordinary one-group bare OoM.

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
| **ba** | Positive exponent, followed by the exponent’s digits |
| **bu** | Negative exponent, followed by the exponent’s digits |
| **ja** | After exponent digits when a **mantissa follows** (not a digit) |
| **je** | **Decimal point** (not a digit) |
| **jo** | **Percent** closer (not a digit) — see [Percent and percentage points](#percent-and-percentage-points) |
| **ju** | **Percentage-point** closer (not a digit) — see [Percent and percentage points](#percent-and-percentage-points) |

- The **exponent comes before** the group’s mantissa digits.
- If a mantissa follows the exponent, say **`ja`** after the last exponent digit, then the mantissa. Example: `27e12` → `ba` + `wo` + `du` + `ja` + `du` + `le`.
- **Bare order of magnitude** (exponent only, no mantissa): use `ba`/`bu` + exponent digits and **omit** **`ja`**. The group ends at the next `ba`/`bu`, or at the word ending. Example: *e9* → `ba` + `na` (not `*banaja`).
- If the exponent is **0**, omit the exponent (and thus omit **`ja`**) entirely.
- Default spoken/written scale uses **engineering notation**: exponents are usually multiples of **3** (e.g. `27e6`, not `2.7e7`).
- **Decimal point:** say **`je`** after the digit(s) left of the point; digits after **`je`** are the fractional part (group in threes if long). May appear with or without an exponent.
- **Scientific register** is optional: exp-first, then **`ja`**, then mantissa with **`je`** after the leading digit (usual scientific shape). Example: `5.2487083e-4` → `bu` + `mo` + `ja` + `va` + `je` + `du` + `mo` + `ha` + `le` + `zo` + `ha` + `re`.
- Bare OoM uses scalar marker **`ra`** (or **`ru`** if negative).
- **Cents / fixed subunits:** an exponent need not be a multiple of 3 when the unit has a conventional subunit (e.g. dollars: `4e-2` for four cents). Same pattern for other fixed subunits if needed. Do **not** use **`jo`** for money subunits.
- **No metric prefixes** in speech or lexicon: see [measure phrases](#no-metric-prefixes) — base unit + engineering exponent / exact count (`40e3` grams, not “40 kilograms”; `12e-9` meters, not “12 nanometers”).

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
| `+50% relative to baseline` (factor change) | **Not** **`jo`** / **`ju`** — use a multiplicative `/h/` factor (**`h+1.5l`**, etc.) or ordinary *relative-to* wording |

`25%` (`…jo`) and `0.25` (plain scalar) name the same magnitude; **`jo`** only chooses the percent-scale reading. **`ju`** likewise names a ÷100 magnitude, but framed as **points** (not as “N% of a whole”).

### Denominator (portion “of what”)
<a id="percent-denominators"></a>
<a id="percent-of-what"></a>

The **whole** / reference class is **not** inside the number word — no denom closer, no open argument on the numeral.

**Default:** the whole is the **host noun**; the percent is an ordinary `/ɡ/` scalar on that noun — same slot as a count (`z-catlsh g+3l` = *three cats*):

| Shape | Gloss |
|-------|--------|
| `z-catlsh g+25%l` | *25% of the cats* |
| `d-testlsh g+95%l` | *95% of the tests* (object) |
| `b-peoplelsh g+5%l` under a host relation | *5% of the people* as `/b/` |

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

Use marker **`ro`** (written **`_`**). Omit exponents. Prefer groups of three digits when digits are present. Ending is usually **-l** (exact label); **-n** for an official designation; **-r** to resume a prior code (**digitless** `d_r` / `g_r` allowed). [Digitless](#zero-digit-groups) `…_l` = unspecified label / some code. Bare `/h/` + **`ro`** is **[temporal circumstance only](#time)** (`h_15,30l`, `h_2026,07,22l`, digitless `h_l`) — not a generic code adverb. Non-time labels as circumstance use a host relation + `/b/` (e.g. `/h/` *on* + `b_7l` *channel 7*), or modify a noun with `/ɡ/`. Digit-strings are unsigned — see [Sign](#sign). Clock and calendar field orders are under [Time](#time).

## Time

Time uses the existing number grammar; there is **no** fifth marker vowel and **no** time closer parallel to **`jo`** / **`ju`**.

**Bare `/h/` + `ro` (`hro…`) is reserved for temporal circumstance** (clock or calendar). Spoken `hro` already marks that reading; do not use bare `h_…` for channel, frequency, gate, room-as-where, or other non-time codes.

| Job | How |
|-----|-----|
| **Clock / schedule** | Digit-string **`ro`** as bare `/h/`. Default **24h**. Fields left→right, commas orthographic only: hour, minute, optional seconds — `h_15,30l`, `h_15,30,00l`. Digitless `h_l` = *at some (unspecified) clock time*. |
| **Calendar date** | Digit-string **`ro`**, ISO-ish fields: year, month, day — bare `h_2026,07,22l`, or modifier `g_2026,07,22l`. Digitless `h_l` likewise covers an unspecified date reading when context is calendric. An explicit *date* host + `/b/` is optional when you want to name the relation; it is not required to license bare `hro` (bare `hro` already means time). |
| **Duration** | Scalar **`ra`** / **`ru`** plus a lexicon **unit** in a [measure phrase](#measure-phrases) (*hour*, *day*, …) — not a digit-string, not bare `hro`. Same engineering-exponent habits as other measures when useful. |
| **Deixis / tense** | Ordinary lexicon `/h/` (*yesterday*, *ago*, *until*, mood/evidential). Numbers appear only for a numeric payload (*3 days ago* = relation + scalar + unit). |
| **Non-time digit labels** | Host relation + `/b/` (`/h/` *on* + `b_101.1l`), or `/ɡ/` on a noun (*channel* `g_7l`) — **not** bare `h_…`. |

**Not bare `hro`:** `h+3l` (×3 / *three times*); `h#3l` (*for the third time*); non-time codes as above. Do not use a scalar for a clock face (`*g+1530l*` for 15:30). Timezone, era, and calendar system stay lexicon adjuncts, not inside the number word.

Endings: **-l** exact reading; **-m** fuzzy (*around 15:30*); **-n** conventional schedule/date name; **-r** resume a prior clock or date label (digitless `h_r` = *that time/date again*). Digitless `h_l` ≠ circumstance **`har`** (*sometime*) — see [zero digit groups](#zero-digit-groups).

## Writing (preferred shorthand)

Speech always uses the full CV grammar above. **Writing prefers shorthand** for the marker and body. **PoS** and **ending** are still written as letters.

```
[PoS] + [marker] + [body] + [ending]
```

### Marker (not written as `r`+V)

| Symbol | Speech | Meaning |
|--------|--------|---------|
| **`+`** | `ra` | Positive scalar |
| **`-`** | `ru` | Negative scalar |
| **`#`** | `re` | Ordinal |
| **`_`** | `ro` | Digit-string |

Place the identity symbol **immediately after PoS, before the body** (or before the ending when the body is empty): `g+3l`, `g+l`, `d_555,123,4567l`, `d_r`, `g#2n`. After **`#`** or **`_`**, do **not** write a following **`-`** (no signed labels/ordinals) — see [Sign](#sign).

### Body

| Speech | Preferred writing |
|--------|-------------------|
| *(no digit groups)* | *(empty — marker then ending)* `g+l`, `g-m`, `g#r`, `h_l` |
| Digit syllables (`wo`…`zo`) | Arabic **`0`–`9`** |
| `ba` / `bu` (+ `ja` when a mantissa follows) | **`e`** / **`e-`** (engineering or scientific form) |
| `je` | **`.`** |
| `jo` | **`%`** |
| `ju` | **`%*`** |

Do **not** write out **`ja`**, **`je`**, **`jo`**, or **`ju`** in shorthand — use `e` / `.` / `%` / `%*` instead.

**Commas** separate digit groups for readability (preferred for multi-group values). Commas are orthographic only; they are not spoken and do not change the word. Digitless forms have no commas.

Full phonetic spelling of a number word (e.g. *grarel*) is fine as a pronunciation gloss, not preferred in running text.

For long values, break into digit groups of at most three mantissa digits (plus their exponents); all groups still sit in **one** word after a single marker and before a single ending.

## Examples

Preferred writing first; speech sketches show structure (exact **-l** unless noted). Digits in speech use the [digit table](#digits).

| Value | Preferred writing | Speech sketch |
|-------|-------------------|---------------|
| plural / more than one | `g+l` | *gral* (`g` + `ra` + `l` — [digitless](#zero-digit-groups)) |
| about several (`>1`) | `g+m` | *gram* |
| some negative amount | `z-l` | *zrul* |
| some rank | `g#l` | *grel* |
| some code (object) | `d_l` | *drol* |
| that (prior) scalar again | `g+r` | *grar* (digitless **-r**) |
| that (prior) code again | `d_r` | *dror* |
| multiple times | `h+l` | *hral* |
| at some clock/date | `h_l` | *hrol* — still bare `hro` = time; ≠ `har` |
| More! | `j+l` | *jral* |
| 3 | `g+3l` | *grarel* (`g` + `ra` + re + `l`) |
| −3 | `g-3l` | *grurel* (`g` + `ru` + re + `l`) |
| 3 (as subject) | `z+3l` | *zrarel* |
| −3 (as object) | `d-3l` | *drurel* |
| of size 12 | `b+12l` | *brawodul* (`b` + `ra` + wo du) |
| room 12 (modifier) | `g_12l` | *growodul* (`g` + `ro` + wo du) |
| 139 | `g+139l` | *graworenal* (`ra` + wo re na) |
| 27e12 | `g+27e12l` | *grabawodujadulel* (`ra` + ba wo du **ja** + du le) |
| e9 (bare) | `g+e9l` | *grabanal* (`ra` + ba na; **no** `ja`) |
| 50e-6 | `g+50e-6l` | *grabugujavazol* (`ra` + bu gu **ja** + va zo) |
| −1e9 −265e3 −4 | `g-1e9,265e3,4l` | *grubanajawobarejaduguvamol* — **`ru`**; groups: ba na **ja** wo · ba re **ja** du gu va · mo |
| $5860.04 → 5e3 + 860 + 4e-2 | `g+5e3,860,4e-2l` | *grabarejavahaguzobudujamol* — ba re **ja** va · ha gu zo · bu du **ja** mo |
| 2nd | `g#2l` | *gredul*; title-like *the Second…* may take **-n** (`g#2n` / *gredun*) |
| about 27e6 | `g+27e6m` | *grabagujadulem* (ba gu **ja** du le, ending **-m**) |
| phone 555-123-4567 | `d_555,123,4567l` | *drovavavawoduremovagulel* (`d` + `ro` + va×3 · wo du re · mo va gu · le + `l`) |
| scientific 5.2487083e-4 | `g+5.2487083e-4l` | *grabumojavajedumohalezoharel* (`ra` + bu mo **ja** + va **je** + du mo ha · le zo ha · re) |
| 25% | `g+25%l` | *graduvajol* (`g` + `ra` + du va **jo** + `l`) |
| 25% of the cats | `z-catlsh g+25%l` | host whole + `/ɡ/` percent — [denominator](#percent-denominators) |
| about 3% | `g+3%m` | *grarejom* (`ra` + re **jo** + `m`) |
| −12.5% | `g-12.5%l` | *gruwodujevajol* (`ru` + wo du **je** va **jo**) |
| 100% | `g+100%l` | *grawozozojol* (`ra` + wo zo zo **jo**; normal mantissa digits) |
| +2 pp | `g+2%*l` | *gradujul* (`ra` + du **ju`) |
| about −1.5 pp | `g-1.5%*m` | *gruwojevajum* (`ru` + wo **je** va **ju** + `m`) |
| neutral point 1 / 2 | `x#1l`, `x#2l` | *xrewol*, *xredul* (`x` + `re` + …) |
| corroborating item 3 | `x+3l` | *xrarel* (`x` + `ra` + re) |
| independent item 2 | `x-2l` | *xrudul* (`x` + `ru` + du) |
| regarding agenda 12 | `x_12l` | *xrowodul* (`x` + `ro` + wo du) |
| as in (2) above (neutral) | `x#2r` | *xredur* (ending **-r**) |
| three times / ×3 | `h+3l` | *hrarel* (`h` + `ra` + re) |
| ÷3 / every third | `h-3l` | *hrurel* (`h` + `ru` + re) |
| at 15:30 | `h_15,30l` | *hrowovarezol* (`h` + `ro` + wo va · re zo) — bare `hro` = time |
| on 2026-07-22 | `h_2026,07,22l` | *hrowoduzoguzoledudul* (`h` + `ro` + …) — bare `hro` date |
| date 2026-07-22 (modifier) | `g_2026,07,22l` | *growoduzoguzoledudul* (`g` + `ro` + wo du zo gu · zo le · du du) — date fields, not threes |
| on 101.1 (frequency) | `/h/` *on* + `b_101.1l` | not bare `h_…`; host + `/b/` digit-string |
| for the third time | `h#3l` | *hrerel* (`h` + `re` + re) |
| Three! (label / score) | `j_3l` | *jrorel* (`j` + `ro` + re) |
| Three more! | `j+3l` | *jrarel* (`j` + `ra` + re) |
| Three short! / Three fewer! / −3! | `j-3l` | *jrurel* (`j` + `ru` + re) |
| twenty-seven! (label) | `j_27l` | *jrodulel* (`j` + `ro` + du le) |
| First! (place cheer) | `j#1l` | *jrewol* (`j` + `re` + wo) |

In a sentence, the PoS attaches to that single number word (see [Parts of speech on numbers](#parts-of-speech-on-numbers); e.g. direct-object digit-string: `d_…l`). Prefer naming the whole as the host of a `/ɡ/` **`jo`** percent ([denominator](#percent-denominators): `z-catlsh g+25%l`).

## Measure phrases
<a id="measure-phrases"></a>
<a id="units"></a>
<a id="unit-amount"></a>

A **measure** is a lexicon **unit** noun plus a scalar **amount** grading that unit — not two bare `/b/` arguments, and not a new number closer (unlike closed **`jo`** / **`ju`**).

**Shape:** unit as the head noun in the needed slot; amount as ordinary `/ɡ/` scalar on that unit:

| Slot | Shape | Gloss |
|------|--------|--------|
| Argument of a complex `/ɡ/` / `/h/` | `b-inchl g+2l` | *two inches* (one `/b/` NP) |
| Subject / object / … | `z-hourl g+3l`, `d-meterl g+5l` | *three hours*, *five meters* |
| Modifier on a noun | `g-inchl g+2l` on a host | rare; prefer unit as `/b/` or freestanding NP |

Same endings and fuzzy **-m** habits as other number words on the amount (`g+2m` ≈ *about two*). The **unit** is ordinary lexicon (reference suffixes as usual). Do **not** encode open-class units inside the numeral word.

### No metric prefixes
<a id="no-metric-prefixes"></a>
<a id="metric-prefixes"></a>

**Metric prefixes are not lexicon roots.** There is no dictionary entry *kilometer*, *milligram*, *nanosecond*, and so on. Lexicon units are **base** (*meter*, *gram*, *second*, …). Scale the amount instead:

| Prefer | Avoid |
|--------|--------|
| *meter* + amount in thousands / `e3` (or the exact count) | *kilometer* |
| `b-meterl g+5400l` or `b-meterl g+5.4e3l` for 5.4 km | `*b-kilometerl g+5.4l` |
| `b-graml g+40e3l` | *40 kilograms* as a prefixed unit word |

Use [engineering exponents](#exponents) on the amount when convenient (`e3` / `e-3` / `e6` / …), or write the full scalar (`5400` meters). Same habit for other SI-style prefixes (*milli-*, *micro-*, *mega-*, …): keep the base unit; put the power of ten in the number.

**Measured differentials** (*two inches taller*) put that measure NP as the **single `/b/`** on the SHARED scale adjective of a [comparative](comparatives.md#measured-differentials):

`zel g-talll b-inchl g+2l z-Samn z-Lean` → *Sam is two inches taller than Lea*

Vague degree stays `/w/` on the scale (`zel w-muchl g-talll …`) — no unit. Duration and other clause measures use the same unit+amount habit in whatever slot the relation needs.

**Not this pattern:** percentage closers (**`jo`** / **`ju`**); bare multiplicative `/h/` factors (`h+1.5l`); stacking `b+2l b-inchl` as two arguments of one adjective.

## Ranges
<a id="number-ranges"></a>
<a id="numeric-ranges"></a>
<a id="from-to"></a>
<a id="shared-continuum"></a>

Spans reuse [phrase fences](coordination.md) whose conjuncts are number words, with a **SHARED continuum** `/ɡ/` naming the line — the same SHARED slot [comparatives](comparatives.md) use for a scale, but here the `/ɡ/` is a **dimension / quantity continuum**, not an entity-ranking scale. There is **no** range form inside a single number word (no `g+3-5l`). Fence join vowels, endings, revision, and **-r** are defined in coordination; **this section** is the source of truth for when those forms mean a numeric span.

**Trigger (all required):**

1. Exactly **two** endpoints that are **compatible** number words (same marker identity: both scalar, both ordinal, or both digit-string / time).
2. Join **`a`** / **`e`** / **`ue`** / **`ua`** (or those vowels’ **-r**).
3. A **SHARED continuum** `/ɡ/` immediately after the join (lexicon: dimension / quantity line — *age*, *price*, *time*, *height*, …; stock **`g-spanl`** / **`g-amountl`** when the line is pure numeric or supplied by context/head).

The fence PoS matches the slot (`zal` / `dal` / `gal` / `bal` / …). Mixed identities on one span are illegal.

**Without SHARED continuum:** two number conjuncts are **ordinary coordination** — never a span. In particular bare **`zel z+3l z+5l`** = *3 ≻ 5* (preference / rank), not *from 3 to 5*.

| Join | Inclusive shape | Reading |
|------|-----------------|--------|
| **`a`** | `zal g-agel z+3l z+5l` | *between 3 and 5* on age (unordered filled interval; both ends in) |
| **`e`** | `zel g-agel z+3l z+5l` | *from 3 to 5* on age (directed; first → second) |
| **`ue`** | `zuel g-agel z+5l z+3l` | directed reverse path on age (spoken order = path; here *from 5 to 3*) |
| **`ua`** | `zual g-agel z+3l z+5l` | *outside 3–5* on age (complement on the line) |
| **`o`** / **`ao`** | — | **Not** ranges — stay discrete (*3 or 5* / *3 and/or 5*); SHARED continuum does not license a span |
| **`ae`** | `zael z+5l z+5l` / `zaem z+3l z+5l` | *equal to 5* / *approximately equal* — **not** a span (no continuum needed; continuum + **`ae`** + numbers is not a range reading) |
| **`oe`** | — | **Not** ranges — exclusive ranked / bare empty superlative with scale |

**Arity escape:** three or more number conjuncts under **`a`** stay an ordinary discrete inventory (`zal z+1l z+3l z+7l` = *1, 3, and 7*), even with SHARED. Focus **`zal z+3l`** stays *just 3*, not a ray. Focus **ranked** with a number is a [threshold](#numeric-thresholds), not ordinary *only X matters*.

**Contrast with comparatives:** `zel g-bigl z-Samn z-Lean` = *Sam is bigger than Lea* (SHARED **scale**, non-number conjuncts). `zel g-agel z+3l z+5l` = *from 3 to 5 on age* (SHARED **continuum**, number endpoints). Bare `zel z+3l z+5l` = prefer 3 over 5.

### Thresholds (focus ranked)
<a id="numeric-thresholds"></a>
<a id="greater-less-than"></a>

When the **sole** conjunct of a [rank join](coordination.md#ranked-conjunction-e) fence (**`e`** / **`ue`**, and their open / named twins) is a **compatible number word**, that number is an **extremum on the line**, not “only this value matters” and not a two-endpoint [span](#ranges). SHARED continuum is **optional** on thresholds: absent = implicit / contextual numeric line; present = that named line (`zel g-agel z+5l` = *age \< 5*).

| Form | Reading | Mnemonic |
|------|--------|----------|
| **`zel z+5l`** | ***less than 5*** (`< 5`) | 5 is the **greatest** (ceiling); the ray is everything it outranks |
| **`zem z+5l`** | soft / approximate *less than ~5* | open twin |
| **`zuel z+5l`** | ***greater than 5*** (`> 5`) | 5 is the **least** (floor); reverse-ranked extremum |
| **`zuem z+5l`** | soft / approximate *greater than ~5* | open reverse twin |
| **`zen z+5l`** | named/conventional **unspecified** extremum label (*under-fives*-style) | phrase **-n** on **e** |
| **`zaen z+5l`** | named/conventional **equal-to-5** band / tie label | phrase **-n** on **ae** |
| **`zuen z+5l`** | named/conventional floor band | phrase **-n** reverse |

Same under `/d/` `/b/` `/ɡ/` (`gel g+5l` = modifier *\<5*; `duel d+10l` = object *\>10*). **`ae`** / **`oe`** focus with a number are **not** thresholds (stay ordinary ranked focus / triage). Boolean focus (**`zal`** / **`zol`** / …) is **not** a threshold.

**Inclusive bounds:** default is **strict** (`<` / `>`). For **≤ 5** / **≥ 5**, use a two-endpoint [span](#ranges) with the bound included — do **not** flip focus ranked to inclusive. Exclusive-high **`ul`** stays a two-side span tool (`zal g-spanl z+3l ul z+5l`), not a focus threshold marker.

**Unspecified in a threshold:** bare **`e`** + **-r** = unspecified member of the *\< X* ray — `zer z+5l` → *some/whatever value \< 5* (under question → *which value \< 5?*). **`ue`** takes **no** **-r** (stacked forms never do — [coordination](coordination.md#unspecified-member-r-phrase)); there is no `zuer` threshold. For an unspecified value *\> 5*, use other wording for now (e.g. a two-endpoint span with an open high, once defined), not a reverse **-r** fence.

Contrast: `zel g-agel z+3l z+5l` = *from 3 to 5 on age* (span); `zel z+3l z+5l` = *3 ≻ 5* (preference); `zel z+5l` = *\< 5* (focus threshold). `zel z-Samn` (non-number) stays ordinary *only Sam matters* / [superlative-with-scale](comparatives.md) — **focus number conjunct** triggers the threshold reading.

### Half-open (exclude the high end only)

[Revisers](revisers.md) **inside the range** marks an exclusive **upper** bound. Replace the second (high) conjunct with prefix-less **`ul`** + that number. SHARED continuum stays required:

| Shape | Reading |
|-------|--------|
| `zal g-spanl z+3l z+5l` | *[3, 5]* — inclusive both ends |
| `zal g-spanl z+3l ul z+5l` | *[3, 5)* — *3 up to but not including 5* |
| `zel g-spanl z+3l ul z+5l` | *from 3 up to but not including 5* |

The low endpoint is **always inclusive**. Do **not** exclude the beginning edge (no `ul` before the low; no open-low span). Do **not** list the high end as a conjunct and then except it (`*zal g-spanl z+3l z+5l ul z+5l`); the exclusive high is **only** the in-range `ul` shape. Open **`um`** on the high end = soft / non-exhaustive exclusion of that bound (rare). Other revision vowels (**`al`** / **`el`** / **`ol`**) are not range-bound markers.

Fence **-l** / **-m** / **-n** keep ordinary closed / open / named senses on the span (*exactly this band* / *around this band* / *the teens*-style label). Endpoint [number endings](#number-endings) still apply (**-m** ≈ fuzzy that bound).

### Unspecified value in the span (**-r**)

Fence **-r** on a number-range shape (still with SHARED continuum) = an **unspecified member of the span** (not content-word anaphor **-r**, not a discrete *something among two listed values*):

| Form | Reading |
|------|--------|
| `zar g-spanl z+3l z+5l` | *some value in [3, 5]* |
| `zar g-spanl z+3l ul z+5l` | *some value in [3, 5)* |
| `zor g-spanl z+3l z+5l` | *any value in [3, 5]* (free-choice) |
| `zer g-spanl z+3l z+5l` | *whatever-by-rank in [3, 5]* |
| `zur g-spanl z+3l z+5l` | *some value other than (in) [3, 5]* — other-than the span |

Under [question](questions.md#fill-ask-r) force, these are fill-asks (*which value in 3–5?*). Same under `/d/` `/b/` / `/ɡ/` as the slot needs (`gal g-agel g+3l g+5l` = modifier *ages 3–5*; `dar g-spanl d+10l ul d+20l` = object *some value in [10, 20)*).

**Clock / date spans:** do **not** use bare circumstance-`hal` (that series is [applicability](restrictors.md)). Prefer SHARED continuum **`g-timel`** (or a host relation + `/b/`) with digit-string endpoints (`bal g-timel b_15,00l b_16,00l`).

Examples: `zal g-agel z+3l z+5l` → *between ages 3 and 5*; `z-kidl gal g-agel g+3l g+5l` → *kids ages 3–5*; `zal g-spanl z+3l ul z+5l` → *[3, 5)*; `zel g-agel z+10l z+20l` → *from age 10 to 20*; `zel z+3l z+5l` → *3 ≻ 5* (preference, not a span); `zel z+5l` → *\< 5*; `zuel z+5l` → *\> 5*; `zael z+5l z+5l` → *equally 5* / *5 equals 5*; `zaem z+3l z+5l` → *3 and 5 approximately equal*; `zar g-spanl z+3l z+5l` → *some value in 3–5*; `zol z+3l z+5l` → *3 or 5* (discrete, not a range).

## Stress (pronunciation guide)

- Digitless numbers (marker + ending only): stress the **marker** syllable (`ra` / `ru` / `re` / `ro`).
- Single-digit magnitude groups: stress the digit syllable.
- Multi-digit groups without exponent: stress the **leftmost** digit.
- Groups with an exponent: stress the **leftmost exponent digit**.
- **`je`** (decimal point): always stressed when present.
- **`jo`** / **`ju`** (percent / percentage points): always stressed when present.
- Digit-string groups: stress the **first digit** of each group.

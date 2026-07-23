# Numbers

Numerals are a **closed formal subsystem**, not ordinary lexicon roots. Quantifiers (*many*, *all*, *some*, …) are out of scope here. PoS prefixes and plural **-z** are defined in [language-reference.md](language-reference.md); general phonotactics live in [phonology.md](phonology.md); ordinary reference suffixes in [reference-suffix.md](reference-suffix.md). This page is the source of truth for numeral grammar.

A whole numeric value is **one word**, even when it contains several digit groups.

## Word shape

```
[PoS] + r + V + ( [exponent?] [mantissa digits?] )+ + [ending] + [z?]
```

1. **PoS** — same prefix inventory as elsewhere; [roles for number words](#parts-of-speech-on-numbers) below.
2. **Number marker** — consonant **r** plus a vowel **V** (see [Marker vowel](#marker-vowel-referential-identity)). The PoS+`r` cluster is a [number-only phonotactic exception](phonology.md#phonotactics).
3. **One or more digit groups** — each group is an optional exponent and optional mantissa digits (at least one of the two). Digits compound with **no** **x** separator. There is **no per-group polarity**; sign (when it applies) is once for the whole word — see [Sign](#sign).
4. **Ending** — `-l` / `-m` / `-n` / `-r` with [number-specific meanings](#number-endings) (not ordinary [reference suffix](reference-suffix.md) senses).
5. **Plural `-z`** — optional; same sense as elsewhere (the group containing that numeric referent).

**Writing** uses a [preferred shorthand](#writing-preferred-shorthand) for the marker and body (`g+3l`, not *grarel*); speech is always the full CV form.

**Lexicon rule:** Any stem that matches this grammar is a number, never an ordinary root. Dictionary generation must reject colliding roots.

## Parts of speech on numbers

The number word takes whichever PoS prefix the role needs (clause slot, interjection, or discourse glue). The stem (marker + digits + ending) does not change.

**Referential** prefixes (`/ɡ/`, `/z/`, `/d/`, `/b/`) use [marker identity](#marker-vowel-referential-identity) as-is — PoS only chooses the slot or modifier role. **Overlay** prefixes (`/v/`, `/h/`, `/j/`, `/x/`) keep that identity but add a role-specific reading (sections below).

| Prefix | Role with a number |
|--------|--------------------|
| `/ɡ/` | **modifier** — referential: the number describes the preceding noun (*three cats*, *the second page*, *room 12*). Goes after the noun, like other adjectives. |
| `/z/` | **subject** — referential: the numeric value, digit-string, or rank is the subject. |
| `/d/` | **direct object** — referential: the number is the object (common for digit-strings / codes being dialed, entered, stated). |
| `/b/` | **argument noun** — referential: the number fills the `/b/` slot of a complex adjective or adverb (*of size 12*, host *on* + channel/label, host *at* + time when a relation is named, …). Bare temporal circumstance (no host) uses `/h/` + **`re`** ([Time](#time)). |
| `/v/` | **verb** — overlay: the number is the clause’s action; see [by marker](#number-as-verb-by-marker). Not multiply/divide by N (use ordinary *multiply* / *divide* plus `/h/`). |
| `/h/` | **adverb** — overlay: see [by marker](#number-as-adverb-by-marker) (*N times*, ÷N, **time** via **`re`**, *for the Nth time*). |
| `/j/` | **interjection** — overlay: see [by marker](#number-as-interjection-by-marker) (*N more!*, deficit, label/score call, place cheer). Left-edge or bare utterance only — [utterance-marker rules](language-reference.md#utterance-markers-j). **Not** clause force. |
| `/x/` | **discourse marker** — overlay: see [by marker](#number-as-discourse-marker-by-marker). Does **not** fill a clause slot. |

**Not valid with numbers:**

- **`/w/` (adjective adjunct)** — numbers do not take `/w/`, and a `/ɡ/` number is not a host for `/w/` grading or framing. Degree and “aboutness” of a quantity use [number endings](#number-endings) (especially **-m** for approximate), not `/w/`.

Digit-strings (`re`…) usually take the argument role the clause needs (often `/d/`). Ordinals that modify a noun use `/ɡ/`; an ordinal used as a standalone rank uses `/z/`, `/d/`, or `/b/` as appropriate. Discourse list items use `/x/` + number ([by marker](#number-as-discourse-marker-by-marker): **`ro`** neutral, **`ra`** corroborating, **`ru`** independent); *for the Nth time* uses `/h/` + **`ro`**; place cheer *First!* uses `/j/` + **`ro`** — none of these is `/ɡ/`.

## Marker vowel (referential identity)

**V** encodes the number’s **referential identity** — scalar vs digit-string vs ordinal. For **scalars**, **V** also carries the **sign of the whole number** (`a` positive, `u` negative).

| V | Writing | Referent | Examples |
|---|---------|----------|----------|
| **a** | `+` | Positive **scalar** (count or measure amount) | `g+3l` *three cats*; `z+3l` *three* (subj); `b+12l` *of size 12* |
| **u** | `-` | Negative **scalar** | `d-3l` *−3* (obj); `g-2l` signed measure on a noun |
| **e** | `_` | **Digit-string** / label (phones, IDs, “read the digits”) | `d_555,123,4567l`; `g_12l` *room 12*-style; `b_…` under a host relation |
| **o** | `#` | **Ordinal** / rank | `g#2l` *the second page*; `z#2l` *second* (rank as subject) |

Do not combine conflicting identity types on one word (e.g. do not use `re` and `ro` for the same token). In [preferred writing](#writing-preferred-shorthand), the marker is **`+`** / **`-`** / **`_`** / **`#`** (not written `r`+V).

### Sign

| Identity | How sign works |
|----------|----------------|
| **Scalar** (`a` / `u`, written `+` / `-`) | Sign **is** **V**. Multi-group scalars share one sign for the whole word (e.g. −1 000 265 004 is one **`ru`** word). |
| **Digit-string** (`e`, written `_`) or **ordinal** (`o`, written `#`) | **Unsigned only.** There is no signed label or signed ordinal form inside the number word. |

Do **not** write `_-…` or `#-…`, and do **not** insert speech **`ru`** after **`re`** / **`ro`**. If a negative-looking label or negative rank must be described (*−2nd*, a code that includes a minus), use ordinary lexicon (typically an adjective or complex adjective) plus an unsigned number — not a numeral sign extender.

There is no separate “mathematical object” marker. To talk about a number as an entity, use a scalar (**`ra`** / **`ru`**) in a referential slot (often with ordinary wording such as the noun *number*), not a distinct numeral class.

`/v/`, `/h/`, `/j/`, and `/x/` still choose among the same four markers, but each overlay gives that identity a **role-specific** reading (add vs ×N vs *N more!* vs corroborating/independent list item, and so on) — see the sections below.

### Number as verb (by marker)

`/v/` + number inherits the marker’s identity, so the action type follows **V**.

| Marker | Verb sense |
|--------|------------|
| **`ra`** | **Add N / increase by N** — transitive *add N of (object)* / *increase (object) by N*; intransitive *grow by N* when the patient is clear from context. |
| **`ru`** | **Remove N / decrease by N** — transitive *remove N of (object)* / *decrease (object) by N*; intransitive *shrink by N*. |
| **`re`** | **Enter / dial / input that digit-string** — type the code, dial the phone number, key the ID. Object (if any) is the channel or device; the digits are in the verb. |
| **`ro`** | **Take / assign rank N** — intransitive *place Nth* / *come in Nth*; transitive *put (object) in Nth place* / *rank as Nth*. |

“Set to N” (bring a quantity to an absolute value) is not a number-verb sense — use an ordinary verb plus the number as argument or adverb. Multiply/divide likewise stay ordinary verbs plus the number as `/h/` (**`h+Nl`** / **`h-Nl`**). With [percentage points](#percent-and-percentage-points) (**`ju`**), **`ra`** / **`ru`** as verbs mean increase/decrease by that point amount (not a relative %-change factor).

Endings still apply (**-m** ≈ *about* that amount/code/rank, **-r** resume, etc.).

### Number as adverb (by marker)

`/h/` + number inherits the marker’s identity, so the adverbial role follows **V**.

| Marker | Writing | Adverb sense |
|--------|---------|--------------|
| **`ra`** | `h+Nl` | **Multiplicative / factor** — *N times*; *×N*; *by a factor of N* (alone, or with ordinary *multiply*). |
| **`ru`** | `h-Nl` | **Inverse / partition** — *÷N*; *into N parts*; *1/N as often*; *every Nth* (alone, or with ordinary *divide*). |
| **`re`** | `h_…l` | **Temporal circumstance only** — *at 15:30*; *on 2026-07-22* (clock or calendar digit reading). **Not** channel, frequency, gate, or other non-time codes — those use a host relation + `/b/` (or `/ɡ/` on a noun). See [Time](#time). |
| **`ro`** | `h#Nl` | **Nth occurrence of the event** — *for the Nth time*; *on the Nth try* (clause-event ordinal, not discourse list independence). |

Contrasts:

- `h+3l` — *three times* / ×3
- `h-3l` — ÷3 / every third / into 3
- `h_15,30l` — *at 15:30* (bare `hre` = time; [Time](#time))
- `h_2026,07,22l` — *on 2026-07-22* (bare `hre` date)
- `/h/` *on* + `b_101.1l` — *on 101.1* (non-time code; not bare `h_…`)
- `h#3l` — *for the third time*
- `j#3l` — *Third!* (place cheer)
- `x#3l` — *point 3:* (neutral discourse item)
- `g#3l` — *the third* (modifies a noun)
- `v+3l` — *add 3* (verb)

Endings still apply (**-m** ≈ *about* that many times / that clock or date, **-r** resume, etc.). Relative %-change factors use **`h+…`** (e.g. ×1.5), not **`jo`** / **`ju`** alone — see [percent](#percent-and-percentage-points).

### Number as interjection (by marker)

`/j/` + number is an **interjection** (expressive call-out), not clause force. Clause force stays the closed non-numeric set in the [utterance-marker section](language-reference.md#clause-force). Number interjections appear only in the left-edge `/j/` cluster (before force, when a clause follows) or as a bare utterance with no force.

| Marker | Writing | Interjection sense |
|--------|---------|-------------------|
| **`ra`** | `j+Nl` | **Quantity addition** — *Three more!*; *Ten more!* (add N to the relevant count / tally / order). |
| **`ru`** | `j-Nl` | **Deficit / shortfall call** — *Three short!*; *Three fewer!*; *Down by 2!*; *−3!* (mirror of `j+`). |
| **`re`** | `j_…l` | **Digit-label / magnitude call-out** — *Three!*; *B-12!*; *five-five-five!*; score, bingo, code, or ID as a bare reading of the digits (not “N more”). |
| **`ro`** | `j#Nl` | **Place / rank cheer** — *First!*; *Second!* (podium / place shout). |

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

Endings still apply (**-m** fuzzy *about three more!* / *about three!*, **-n** conventional call name, **-r** resume a prior shout’s value).

### Number as discourse marker (by marker)

`/x/` + number is discourse glue for numbered list items and label cites. Marker vowel encodes **independence framing** of the list item (or cite-as-label for **`re`**). It does **not** occupy a main-clause argument or adjunct slot (contrast `/ɡ/` *the second page*, `/h/` *three times* / *for the Nth time*, `/j/` interjection shouts).

| Marker | Writing | Discourse sense |
|--------|---------|-----------------|
| **`ro`** | `x#Nl` | **Neutral point N** — numbered item with no independence framing (*point N:*, *note N:*, bare *(N)*). |
| **`ra`** | `x+Nl` | **Corroborating item N** — backs, restates, or same-directions an earlier item (*corroborating N:*, *echoing N:*). Legitimate for emphasis, clarity, teaching, or a related source—not a new line of support. |
| **`ru`** | `x-Nl` | **Independent item N** — a new line of support or consideration (*independent N:*, *distinct N:*). Would still matter if other listed items were gone. |
| **`re`** | `x_…l` | **Cite a discourse label** — agenda item, section code, slide, ticket id (digits as label, not independence framing) (*re item 12; under 3.2*). |

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

Endings still apply (**-l** newly stated item, **-r** *as in (N) above* with same independence framing, **-n** titled / official item name, **-m** fuzzy *around item N*). Percent / percentage-point closers are not used with `/x/` numbers.

## Number endings

Ordinary [reference suffix](reference-suffix.md) senses do **not** apply inside number words.

| Ending | Meaning |
|--------|---------|
| **-l** | Exact, newly stated (default) |
| **-m** | Approximate / non-literal (“about N”) |
| **-n** | Conventional / proper designation (titles, official labels, *the Second…*) |
| **-r** | Anaphoric resume of a previously stated number, code, or rank |

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
- **No metric prefixes** in speech: prefer base unit + engineering exponent (`40e3` grams, not “40 kilograms”; `12e-9` meters, not “12 nanometers”).

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
| `25% of X` (portion) | **`jo`** number + whole in the clause |
| `+2 percentage points` / `from 10% to 12%` point delta | **`ju`** (often as `/v/` **`ra`** / **`ru`**: increase/decrease by that point amount) |
| `+50% relative to baseline` (factor change) | **Not** **`jo`** / **`ju`** — use a multiplicative `/h/` factor (**`h+1.5l`**, etc.) or ordinary *relative-to* wording |

`25%` (`…jo`) and `0.25` (plain scalar) name the same magnitude; **`jo`** only chooses the percent-scale reading. **`ju`** likewise names a ÷100 magnitude, but framed as **points** (not as “N% of a whole”).

### Denominator (portion “of what”)

The **whole** / reference class is **not** inside the number word. Prefer clause structure that names it (typically noun + `/ɡ/` percent number, or a complex adjective/adverb + `/b/` whole). Exact denominator patterns are **TBD** later.

**Style:** a bare `/z/` (or other freestanding) **`…jo`** percent with no named whole is **grammatical but stylistically bad** — same pressure as Claritish *Percent of what*. Prefer an explicit whole. Bare **`…ju`** point amounts are fine when the percent-scale quantity being moved is already clear.

## Digit-strings

Use marker **`re`** (written **`_`**). Omit exponents. Prefer groups of three digits. Ending is usually **-l** (exact label); **-n** for an official designation; **-r** to resume a prior code. Bare `/h/` + **`re`** is **[temporal circumstance only](#time)** (`h_15,30l`, `h_2026,07,22l`) — not a generic code adverb. Non-time labels as circumstance use a host relation + `/b/` (e.g. `/h/` *on* + `b_7l` *channel 7*), or modify a noun with `/ɡ/`. Digit-strings are unsigned — see [Sign](#sign). Clock and calendar field orders are under [Time](#time).

## Time

Time uses the existing number grammar; there is **no** fifth marker vowel and **no** time closer parallel to **`jo`** / **`ju`**.

**Bare `/h/` + `re` (`hre…`) is reserved for temporal circumstance** (clock or calendar). Spoken `hre` already marks that reading; do not use bare `h_…` for channel, frequency, gate, room-as-where, or other non-time codes.

| Job | How |
|-----|-----|
| **Clock / schedule** | Digit-string **`re`** as bare `/h/`. Default **24h**. Fields left→right, commas orthographic only: hour, minute, optional seconds — `h_15,30l`, `h_15,30,00l`. |
| **Calendar date** | Digit-string **`re`**, ISO-ish fields: year, month, day — bare `h_2026,07,22l`, or modifier `g_2026,07,22l`. An explicit *date* host + `/b/` is optional when you want to name the relation; it is not required to license bare `hre` (bare `hre` already means time). |
| **Duration** | Scalar **`ra`** / **`ru`** plus a lexicon **unit** (*hour*, *day*, …) in the clause — not a digit-string, not bare `hre`. Same engineering-exponent habits as other measures when useful. |
| **Deixis / tense** | Ordinary lexicon `/h/` (*yesterday*, *ago*, *until*, mood/evidential). Numbers appear only for a numeric payload (*3 days ago* = relation + scalar + unit). |
| **Non-time digit labels** | Host relation + `/b/` (`/h/` *on* + `b_101.1l`), or `/ɡ/` on a noun (*channel* `g_7l`) — **not** bare `h_…`. |

**Not bare `hre`:** `h+3l` (×3 / *three times*); `h#3l` (*for the third time*); non-time codes as above. Do not use a scalar for a clock face (`*g+1530l*` for 15:30). Timezone, era, and calendar system stay lexicon adjuncts, not inside the number word.

Endings: **-l** exact reading; **-m** fuzzy (*around 15:30*); **-n** conventional schedule/date name; **-r** resume a prior clock or date label.

## Writing (preferred shorthand)

Speech always uses the full CV grammar above. **Writing prefers shorthand** for the marker and body. **PoS**, **ending**, and optional **-z** are still written as letters.

```
[PoS] + [marker] + [body] + [ending] + [z?]
```

### Marker (not written as `r`+V)

| Symbol | Speech | Meaning |
|--------|--------|---------|
| **`+`** | `ra` | Positive scalar |
| **`-`** | `ru` | Negative scalar |
| **`_`** | `re` | Digit-string |
| **`#`** | `ro` | Ordinal |

Place the identity symbol **immediately after PoS, before the digits**: `g+3l`, `d_555,123,4567l`, `g#2n`. After **`_`** or **`#`**, do **not** write a following **`-`** (no signed labels/ordinals) — see [Sign](#sign).

### Body

| Speech | Preferred writing |
|--------|-------------------|
| Digit syllables (`wo`…`zo`) | Arabic **`0`–`9`** |
| `ba` / `bu` (+ `ja` when a mantissa follows) | **`e`** / **`e-`** (engineering or scientific form) |
| `je` | **`.`** |
| `jo` | **`%`** |
| `ju` | **`%*`** |

Do **not** write out **`ja`**, **`je`**, **`jo`**, or **`ju`** in shorthand — use `e` / `.` / `%` / `%*` instead.

**Commas** separate digit groups for readability (preferred for multi-group values). Commas are orthographic only; they are not spoken and do not change the word.

Full phonetic spelling of a number word (e.g. *grarel*) is fine as a pronunciation gloss, not preferred in running text.

For long values, break into digit groups of at most three mantissa digits (plus their exponents); all groups still sit in **one** word after a single marker and before a single ending.

## Examples

Preferred writing first; speech sketches show structure (exact **-l** unless noted). Digits in speech use the [digit table](#digits).

| Value | Preferred writing | Speech sketch |
|-------|-------------------|---------------|
| 3 | `g+3l` | *grarel* (`g` + `ra` + re + `l`) |
| −3 | `g-3l` | *grurel* (`g` + `ru` + re + `l`) |
| 3 (as subject) | `z+3l` | *zrarel* |
| −3 (as object) | `d-3l` | *drurel* |
| of size 12 | `b+12l` | *brawodul* (`b` + `ra` + wo du) |
| room 12 (modifier) | `g_12l` | *grewodul* (`g` + `re` + wo du) |
| 139 | `g+139l` | *graworenal* (`ra` + wo re na) |
| 27e12 | `g+27e12l` | *grabawodujadulel* (`ra` + ba wo du **ja** + du le) |
| e9 (bare) | `g+e9l` | *grabanal* (`ra` + ba na; **no** `ja`) |
| 50e-6 | `g+50e-6l` | *grabugujavazol* (`ra` + bu gu **ja** + va zo) |
| −1e9 −265e3 −4 | `g-1e9,265e3,4l` | *grubanajawobarejaduguvamol* — **`ru`**; groups: ba na **ja** wo · ba re **ja** du gu va · mo |
| $5860.04 → 5e3 + 860 + 4e-2 | `g+5e3,860,4e-2l` | *grabarejavahaguzobudujamol* — ba re **ja** va · ha gu zo · bu du **ja** mo |
| 2nd | `g#2l` | *grodul*; title-like *the Second…* may take **-n** (`g#2n` / *grodun*) |
| about 27e6 | `g+27e6m` | *grabagujadulem* (ba gu **ja** du le, ending **-m**) |
| phone 555-123-4567 | `d_555,123,4567l` | *drevavavawoduremovagulel* (`d` + `re` + va×3 · wo du re · mo va gu · le + `l`) |
| scientific 5.2487083e-4 | `g+5.2487083e-4l` | *grabumojavajedumohalezoharel* (`ra` + bu mo **ja** + va **je** + du mo ha · le zo ha · re) |
| 25% | `g+25%l` | *graduvajol* (`g` + `ra` + du va **jo** + `l`) |
| about 3% | `g+3%m` | *grarejom* (`ra` + re **jo** + `m`) |
| −12.5% | `g-12.5%l` | *gruwodujevajol* (`ru` + wo du **je** va **jo**) |
| 100% | `g+100%l` | *grawozozojol* (`ra` + wo zo zo **jo**; normal mantissa digits) |
| +2 pp | `g+2%*l` | *gradujul* (`ra` + du **ju`) |
| about −1.5 pp | `g-1.5%*m` | *gruwojevajum* (`ru` + wo **je** va **ju** + `m`) |
| neutral point 1 / 2 | `x#1l`, `x#2l` | *xrowol*, *xrodul* (`x` + `ro` + …) |
| corroborating item 3 | `x+3l` | *xrarel* (`x` + `ra` + re) |
| independent item 2 | `x-2l` | *xrudul* (`x` + `ru` + du) |
| re agenda 12 | `x_12l` | *xrewodul* (`x` + `re` + wo du) |
| as in (2) above (neutral) | `x#2r` | *xrodur* (ending **-r**) |
| three times / ×3 | `h+3l` | *hrarel* (`h` + `ra` + re) |
| ÷3 / every third | `h-3l` | *hrurel* (`h` + `ru` + re) |
| at 15:30 | `h_15,30l` | *hrewovarezol* (`h` + `re` + wo va · re zo) — bare `hre` = time |
| on 2026-07-22 | `h_2026,07,22l` | *hrewoduzoguzoledudul* (`h` + `re` + …) — bare `hre` date |
| date 2026-07-22 (modifier) | `g_2026,07,22l` | *grewoduzoguzoledudul* (`g` + `re` + wo du zo gu · zo le · du du) — date fields, not threes |
| on 101.1 (frequency) | `/h/` *on* + `b_101.1l` | not bare `h_…`; host + `/b/` digit-string |
| for the third time | `h#3l` | *hrorel* (`h` + `ro` + re) |
| Three! (label / score) | `j_3l` | *jrerel* (`j` + `re` + re) |
| Three more! | `j+3l` | *jrarel* (`j` + `ra` + re) |
| Three short! / Three fewer! / −3! | `j-3l` | *jrurel* (`j` + `ru` + re) |
| twenty-seven! (label) | `j_27l` | *jredulel* (`j` + `re` + du le) |
| First! (place cheer) | `j#1l` | *jrowol* (`j` + `ro` + wo) |

In a sentence, the PoS attaches to that single number word (see [Parts of speech on numbers](#parts-of-speech-on-numbers); e.g. direct-object digit-string: `d_…l`). Prefer naming the whole with a `/ɡ/` **`jo`** percent (denominator patterns TBD).

## Stress (pronunciation guide)

- Single-digit magnitude groups: stress the digit syllable.
- Multi-digit groups without exponent: stress the **leftmost** digit.
- Groups with an exponent: stress the **leftmost exponent digit**.
- **`je`** (decimal point): always stressed when present.
- **`jo`** / **`ju`** (percent / percentage points): always stressed when present.
- Digit-string groups: stress the **first digit** of each group.

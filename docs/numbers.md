# Numbers

Numerals are a **closed formal subsystem**, not ordinary lexicon roots. Quantifiers (*many*, *all*, *some*, …) are out of scope here. PoS prefixes, plural **-z**, and general phonotactics are defined in [language-reference.md](language-reference.md); this page is the source of truth for numeral grammar.

A whole numeric value is **one word**, even when it contains several digit groups.

## Word shape

```
[PoS] + r + V + [ru?] + ( [exponent?] [mantissa digits?] )+ + [ending] + [z?]
```

1. **PoS** — same prefix inventory as elsewhere; [roles for number words](#parts-of-speech-on-numbers) below.
2. **Number marker** — consonant **r** plus a vowel **V** (see [Marker vowel](#marker-vowel-referential-identity)). The PoS+`r` cluster is a [number-only phonotactic exception](language-reference.md#phonotactics).
3. **Optional sign extender `ru`** — only after identity **`e`** or **`o`**, when a rare negative label or negative ordinal is needed (see [Sign](#sign)). Written **`-`** immediately after **`_`** or **`#`**. Not used after scalar **`a`** / **`u`** (those vowels already carry sign).
4. **One or more digit groups** — each group is an optional exponent and optional mantissa digits (at least one of the two). Digits compound with **no** **x** separator. There is **no per-group polarity**; sign (when it applies) is once for the whole word.
5. **Ending** — `-l` / `-m` / `-n` / `-r` with [number-specific meanings](#number-endings).
6. **Plural `-z`** — optional; same sense as elsewhere (the group containing that numeric referent).

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
| `/b/` | **argument noun** — referential: the number fills the `/b/` slot of a complex adjective or adverb (*of size 12*, host *at* + time/label, …). Clock-as-circumstance without a host relation prefers `/h/` + **`re`**. |
| `/v/` | **verb** — overlay: the number is the clause’s action; see [by marker](#number-as-verb-by-marker). Not multiply/divide by N (use ordinary *multiply* / *divide* plus `/h/`). |
| `/h/` | **adverb** — overlay: see [by marker](#number-as-adverb-by-marker) (*N times*, ÷N, clock readings, *for the Nth time*). |
| `/j/` | **interjection** — overlay: see [by marker](#number-as-interjection-by-marker). Left-edge or bare utterance only — [utterance-marker rules](language-reference.md#utterance-markers-j). **Not** clause force. |
| `/x/` | **discourse marker** — overlay: see [by marker](#number-as-discourse-marker-by-marker). Does **not** fill a clause slot. |

**Not valid with numbers:**

- **`/w/` (adjective adjunct)** — numbers do not take `/w/`, and a `/ɡ/` number is not a host for `/w/` grading or framing. Degree and “aboutness” of a quantity use [number endings](#number-endings) (especially **-m** for approximate), not `/w/`.

Digit-strings (`re`…) usually take the argument role the clause needs (often `/d/`). Ordinals that modify a noun use `/ɡ/`; an ordinal used as a standalone rank uses `/z/`, `/d/`, or `/b/` as appropriate. Discourse *firstly / secondly* uses `/x/` + **`ro`**; *for the Nth time* uses `/h/` + **`ro`**; place cheer *First!* uses `/j/` + **`ro`** — none of these is `/ɡ/`.

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
| **Digit-string** (`e`, written `_`) or **ordinal** (`o`, written `#`) | Default is unsigned. In the **rare** case a negative label or negative ordinal is needed, add speech **`ru`** (writing **`-`**) **immediately after** the identity marker, before the digits: `re`+`ru`… / `_-…`, `ro`+`ru`… / `#-…`. |

Examples: `g#-2l` (*−2nd*) → *grorudul* (`g` + `ro` + **`ru`** + du + `l`); `d_-12l` (negative-style label) → *dreruwodul* (`d` + `re` + **`ru`** + wo du + `l`).

Do **not** stack a sign extender after scalar **`ra`** / **`ru`** (no `*ra`+`ru`…`). Overlay prefixes (`/v/`, `/h/`, `/j/`, `/x/`) use the same sign rules on the same stem.

There is no separate “mathematical object” marker. To talk about a number as an entity, use a scalar (**`ra`** / **`ru`**) in a referential slot (often with ordinary wording such as the noun *number*), not a distinct numeral class.

`/v/`, `/h/`, `/j/`, and `/x/` still choose among the same four markers, but each overlay gives that identity a **role-specific** reading (add vs ×N vs score-shout vs *firstly*, and so on) — see the sections below.

### Number as verb (by marker)

`/v/` + number inherits the marker’s identity, so the action type follows **V**.

| Marker | Verb sense |
|--------|------------|
| **`ra`** | **Add N / increase by N** — transitive *add N of (object)* / *increase (object) by N*; intransitive *grow by N* when the patient is clear from context. |
| **`ru`** | **Remove N / decrease by N** — transitive *remove N of (object)* / *decrease (object) by N*; intransitive *shrink by N*. |
| **`re`** | **Enter / dial / input that digit-string** — type the code, dial the phone number, key the ID. Object (if any) is the channel or device; the digits are in the verb. Rare negative label: **`re`+`ru`** / `v_-…l`. |
| **`ro`** | **Take / assign rank N** — intransitive *place Nth* / *come in Nth*; transitive *put (object) in Nth place* / *rank as Nth*. Rare negative rank: **`ro`+`ru`** / `v#-Nl`. |

“Set to N” (bring a quantity to an absolute value) is not a number-verb sense — use an ordinary verb plus the number as argument or adverb. Multiply/divide likewise stay ordinary verbs plus the number as `/h/` (**`h+Nl`** / **`h-Nl`**). With [percentage points](#percent-and-percentage-points) (**`ju`**), **`ra`** / **`ru`** as verbs mean increase/decrease by that point amount (not a relative %-change factor).

Endings still apply (**-m** ≈ *about* that amount/code/rank, **-r** resume, etc.). Sign for `re`/`ro` stems: see [Sign](#sign).

### Number as adverb (by marker)

`/h/` + number inherits the marker’s identity, so the adverbial role follows **V**.

| Marker | Writing | Adverb sense |
|--------|---------|--------------|
| **`ra`** | `h+Nl` | **Multiplicative / factor** — *N times*; *×N*; *by a factor of N* (alone, or with ordinary *multiply*). |
| **`ru`** | `h-Nl` | **Inverse / partition** — *÷N*; *into N parts*; *1/N as often*; *every Nth* (alone, or with ordinary *divide*). |
| **`re`** | `h_…l` | **Clock / code as circumstance** — *at 15:30*; *on 101.1*; *channel 7* (digits as when/where label, not a count of times). Rare negative label: `h_-…l`. |
| **`ro`** | `h#Nl` | **Nth occurrence of the event** — *for the Nth time*; *on the Nth try* (clause-event ordinal, not discourse *Nth-ly*). Rare negative ordinal: `h#-Nl`. |

Contrasts:

- `h+3l` — *three times* / ×3
- `h-3l` — ÷3 / every third / into 3
- `h_15,30l` — *at 15:30* (clock-ish digit reading)
- `h#3l` — *for the third time*
- `j#3l` — *Third!* (place cheer)
- `x#3l` — *thirdly* (discourse list)
- `g#3l` — *the third* (modifies a noun)
- `v+3l` — *add 3* (verb)

Endings still apply (**-m** ≈ *about* that many times / that clock reading, **-r** resume, etc.). Relative %-change factors use **`h+…`** (e.g. ×1.5), not **`jo`** / **`ju`** alone — see [percent](#percent-and-percentage-points). Sign for `re`/`ro` stems: see [Sign](#sign).

### Number as interjection (by marker)

`/j/` + number is an **interjection** (expressive call-out), not clause force. Clause force stays the closed non-numeric set in the [utterance-marker section](language-reference.md#clause-force). Number interjections appear only in the left-edge `/j/` cluster (before force, when a clause follows) or as a bare utterance with no force.

| Marker | Writing | Interjection sense |
|--------|---------|-------------------|
| **`ra`** | `j+Nl` | **Quantity shout / score call** — *Three!*; *Ten!* (hit that count; celebration of magnitude N). |
| **`ru`** | `j-Nl` | **Countdown / remaining** — *Three… Two… One!*; *T-minus 10*; *three to go!* |
| **`re`** | `j_…l` | **Digit-label call-out** — *B-12!*; *five-five-five!*; reading a code/ID/bingo ball as a label shout. Rare negative label: `j_-…l`. |
| **`ro`** | `j#Nl` | **Place / rank cheer** — *First!*; *Second!* (podium / place shout). Rare negative place: `j#-Nl`. |

**Bingo / ball calls:** prefer **`j_`** when the shout names a label or ball id; prefer **`j+`** when celebrating a count or score. Same English *Twelve!* can be either.

Contrasts:

- `j+3l` — *Three!* (score / count shout)
- `j-3l` — *Three!* (countdown / remaining)
- `j_27l` — *Twenty-seven!* as label call
- `j#1l` — *First!* (place cheer)
- `x#1l` — *firstly* (discourse)
- `h#1l` — *for the first time*
- `v#1l` — *take / assign 1st* (verb)

Endings still apply (**-m** fuzzy *about three!*, **-n** conventional call name, **-r** resume a prior shout’s value). Sign for `re`/`ro` stems: see [Sign](#sign).

### Number as discourse marker (by marker)

`/x/` + number is discourse glue for lists and numbered references — parallel to the `/v/` senses at discourse scale. It does **not** occupy a main-clause argument or adjunct slot (contrast `/ɡ/` *the second page*, `/h/` *three times* / *for the Nth time*, `/j/` interjection shouts).

| Marker | Writing | Discourse sense |
|--------|---------|-----------------|
| **`ro`** | `x#Nl` | **Discourse ordinal** — step N in the current spoken list (*firstly, secondly, thirdly*). Rare negative step: `x#-Nl`. |
| **`ra`** | `x+Nl` | **Open / add point N** — introduce or label a numbered point or bullet (*point N:; (N)*). |
| **`ru`** | `x-Nl` | **Withdraw / skip point N** — retract, defer, or mark “not counting N” (*scratch N; skipping N*). |
| **`re`** | `x_…l` | **Cite a discourse label** — agenda item, section code, slide, ticket id (digits as label, not rank) (*re item 12; under 3.2*). Rare negative label cite: `x_-…l`. |

**`#`** vs **`+`:** use **`ro`** / **`#`** for adverbial list connectives (*Nth-ly*); use **`ra`** / **`+`** for numbered headings or bullet labels (*Point N:*). Do not collapse them.

Contrasts:

- `g#2l` — *the second* (modifies a noun)
- `x#2l` — *secondly* (discourse linker)
- `h#2l` — *for the second time* (event ordinal adverb)
- `j#2l` — *Second!* (place cheer)
- `j+3l` — *Three!* (quantity shout)
- `j-3l` — *Three!* (countdown)
- `x+3l` — *point 3:* (discourse heading)

Endings still apply (**-l** newly stated point, **-r** *as in (N) above*, **-n** titled section / official item name, **-m** fuzzy *around point N*). Percent / percentage-point closers are not used with `/x/` numbers. Sign for `re`/`ro` stems: see [Sign](#sign).

## Number endings

Ordinary literal / metaphorical / name / pronoun senses do **not** apply inside number words.

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

Use marker **`re`** (written **`_`**). Omit exponents. Prefer groups of three digits. Ending is usually **-l** (exact label); **-n** for an official designation; **-r** to resume a prior code. As `/h/`, a digit-string is a [clock / code circumstance](#number-as-adverb-by-marker) (`h_15,30l`), not a count of times. Rare negative labels use the [sign extender](#sign) (`_-…` / `re`+`ru`…).

## Writing (preferred shorthand)

Speech always uses the full CV grammar above. **Writing prefers shorthand** for the marker and body. **PoS**, **ending**, and optional **-z** are still written as letters.

```
[PoS] + [marker] + [-? after _ or #] + [body] + [ending] + [z?]
```

### Marker (not written as `r`+V)

| Symbol | Speech | Meaning |
|--------|--------|---------|
| **`+`** | `ra` | Positive scalar |
| **`-`** | `ru` | Negative scalar |
| **`_`** | `re` | Digit-string |
| **`#`** | `ro` | Ordinal |

Place the identity symbol **immediately after PoS, before the digits**: `g+3l`, `d_555,123,4567l`, `g#2n`.

**Sign extender:** after **`_`** or **`#`** only, optional **`-`** (speech **`ru`**) before the body — `g#-2l`, `d_-12l`. After scalar **`+`** / **`-`**, do not add another **`-`**. See [Sign](#sign).

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
| −2nd (rare) | `g#-2l` | *grorudul* (`g` + `ro` + **`ru`** + du) |
| negative label −12 (rare) | `d_-12l` | *dreruwodul* (`d` + `re` + **`ru`** + wo du) |
| about 27e6 | `g+27e6m` | *grabagujadulem* (ba gu **ja** du le, ending **-m**) |
| phone 555-123-4567 | `d_555,123,4567l` | *drevavavawoduremovagulel* (`d` + `re` + va×3 · wo du re · mo va gu · le + `l`) |
| scientific 5.2487083e-4 | `g+5.2487083e-4l` | *grabumojavajedumohalezoharel* (`ra` + bu mo **ja** + va **je** + du mo ha · le zo ha · re) |
| 25% | `g+25%l` | *graduvajol* (`g` + `ra` + du va **jo** + `l`) |
| about 3% | `g+3%m` | *grarejom* (`ra` + re **jo** + `m`) |
| −12.5% | `g-12.5%l` | *gruwodujevajol* (`ru` + wo du **je** va **jo**) |
| 100% | `g+100%l` | *grawozozojol* (`ra` + wo zo zo **jo**; normal mantissa digits) |
| +2 pp | `g+2%*l` | *gradujul* (`ra` + du **ju`) |
| about −1.5 pp | `g-1.5%*m` | *gruwojevajum* (`ru` + wo **je** va **ju** + `m`) |
| firstly / secondly | `x#1l`, `x#2l` | *xrowol*, *xrodul* (`x` + `ro` + …) |
| point 3: (heading) | `x+3l` | *xrarel* (`x` + `ra` + re) |
| skipping 2 | `x-2l` | *xrudul* (`x` + `ru` + du) |
| re agenda 12 | `x_12l` | *xrewodul* (`x` + `re` + wo du) |
| as in (2) above | `x#2r` | *xrodur* (ending **-r**) |
| three times / ×3 | `h+3l` | *hrarel* (`h` + `ra` + re) |
| ÷3 / every third | `h-3l` | *hrurel* (`h` + `ru` + re) |
| at 15:30 | `h_15,30l` | *hrewovarezol* (`h` + `re` + wo va · re zo) |
| for the third time | `h#3l` | *hrorel* (`h` + `ro` + re) |
| Three! (score) | `j+3l` | *jrarel* (`j` + `ra` + re) |
| Three! (countdown) | `j-3l` | *jrurel* (`j` + `ru` + re) |
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

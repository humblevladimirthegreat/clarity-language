# Numbers

Numerals are a **closed formal subsystem**, not ordinary lexicon roots. Quantifiers (*many*, *all*, *some*, …) are out of scope here. PoS prefixes, plural **-z**, and general phonotactics are defined in [language-reference.md](language-reference.md); this page is the source of truth for numeral grammar.

A whole numeric value is **one word**, even when it contains several digit groups.

## Word shape

```
[PoS] + r + V + ( [exponent?] [mantissa digits?] )+ + [ending] + [z?]
```

1. **PoS** — same prefix inventory as elsewhere; [roles for number words](#parts-of-speech-on-numbers) below.
2. **Number marker** — consonant **r** plus a vowel **V** (see [Marker vowel](#marker-vowel)). The PoS+`r` cluster is a [number-only phonotactic exception](language-reference.md#phonotactics).
3. **One or more digit groups** — each group is an optional exponent and optional mantissa digits (at least one of the two). Digits compound with **no** **x** separator. There is **no per-group polarity**; sign (when it applies) is on the marker vowel for the whole word.
4. **Ending** — `-l` / `-m` / `-n` / `-r` with [number-specific meanings](#number-endings).
5. **Plural `-z`** — optional; same sense as elsewhere (the group containing that numeric referent).

**Writing** uses a [preferred shorthand](#writing-preferred-shorthand) for the marker and body (`g+3l`, not *grarel*); speech is always the full CV form.

**Lexicon rule:** Any stem that matches this grammar is a number, never an ordinary root. Dictionary generation must reject colliding roots.

## Parts of speech on numbers

The number word takes whichever PoS prefix the role needs (clause slot, interjection, or discourse glue). The stem (marker + digits + ending) does not change.

| Prefix | Role with a number |
|--------|--------------------|
| `/ɡ/` | **modifier** — the number describes the preceding noun (*three cats*, *the second page*). Goes after the noun, like other adjectives. |
| `/z/` | **subject** — the numeric value (or digit-string / rank) is the subject. |
| `/d/` | **direct object** — the number is the object (common for digit-strings / codes being dialed, entered, stated). |
| `/b/` | **argument noun** — the number fills the `/b/` slot of a complex adjective or adverb (*at 3*, *of size 12*, …). |
| `/v/` | **verb** — the number is the clause’s action; sense depends on the [marker vowel](#number-as-verb-by-marker). Not multiply/divide by N (use ordinary *multiply* / *divide* plus the number as `/h/`). |
| `/h/` | **adverb** — the number modifies the verb/clause: *N times*, factors (*multiply by three*), clock/time readings, and similar. |
| `/j/` | **interjection** — a bare shouted or exclaimed number with no clause (*Three!*, bingo call-outs, countdown beats). Vocative/interjection rules in the [utterance-marker section](language-reference.md#utterance-markers-j) still apply (left-edge cluster only, or bare utterance). |
| `/x/` | **discourse marker** — numbered list / enumeration glue; sense depends on the [marker vowel](#number-as-discourse-marker-by-marker). Does **not** fill a clause slot (same class as other `/x/` linkers). |

**Not valid with numbers:**

- **`/w/` (adjective adjunct)** — numbers do not take `/w/`, and a `/ɡ/` number is not a host for `/w/` grading or framing. Degree and “aboutness” of a quantity use [number endings](#number-endings) (especially **-m** for approximate), not `/w/`.

Digit-strings (`re`…) usually take the argument role the clause needs (often `/d/`). Ordinals that modify a noun use `/ɡ/`; an ordinal used as a standalone rank uses `/z/`, `/d/`, or `/b/` as appropriate. Discourse *firstly / secondly* uses `/x/` + **`ro`**, not `/ɡ/`.

### Number as verb (by marker)

`/v/` + number inherits the marker’s identity, so the action type follows **V**.

| Marker | Verb sense |
|--------|------------|
| **`ra`** | **Add N / increase by N** — transitive *add N of (object)* / *increase (object) by N*; intransitive *grow by N* when the patient is clear from context. |
| **`ru`** | **Remove N / decrease by N** — transitive *remove N of (object)* / *decrease (object) by N*; intransitive *shrink by N*. |
| **`re`** | **Enter / dial / input that digit-string** — type the code, dial the phone number, key the ID. Object (if any) is the channel or device; the digits are in the verb. |
| **`ro`** | **Take / assign rank N** — intransitive *place Nth* / *come in Nth*; transitive *put (object) in Nth place* / *rank as Nth*. |

“Set to N” (bring a quantity to an absolute value) is not a number-verb sense — use an ordinary verb plus the number as argument or adverb. Multiply/divide likewise stay ordinary verbs plus the number as `/h/`. With [percentage points](#percent-and-percentage-points) (**`ju`**), **`ra`** / **`ru`** as verbs mean increase/decrease by that point amount (not a relative %-change factor).

Endings still apply (**-m** ≈ *about* that amount/code/rank, **-r** resume, etc.).

### Number as discourse marker (by marker)

`/x/` + number is discourse glue for lists and numbered references — parallel to the `/v/` senses at discourse scale. It does **not** occupy a main-clause argument or adjunct slot (contrast `/ɡ/` *the second page*, `/h/` *three times*, `/j/` *Three!*).

| Marker | Writing | Discourse sense |
|--------|---------|-----------------|
| **`ro`** | `x#Nl` | **Discourse ordinal** — step N in the current spoken list (*firstly, secondly, thirdly*). |
| **`ra`** | `x+Nl` | **Open / add point N** — introduce or label a numbered point or bullet (*point N:; (N)*). |
| **`ru`** | `x-Nl` | **Withdraw / skip point N** — retract, defer, or mark “not counting N” (*scratch N; skipping N*). |
| **`re`** | `x_…l` | **Cite a discourse label** — agenda item, section code, slide, ticket id (digits as label, not rank) (*re item 12; under 3.2*). |

**`#`** vs **`+`:** use **`ro`** / **`#`** for adverbial list connectives (*Nth-ly*); use **`ra`** / **`+`** for numbered headings or bullet labels (*Point N:*). Do not collapse them.

Contrasts:

- `g#2l` — *the second* (modifies a noun)
- `x#2l` — *secondly* (discourse linker)
- `j+3l` — *Three!* (interjection shout)
- `x+3l` — *point 3:* (discourse heading)

Endings still apply (**-l** newly stated point, **-r** *as in (N) above*, **-n** titled section / official item name, **-m** fuzzy *around point N*). Percent / percentage-point closers are not used with `/x/` numbers.

## Marker vowel

**V** encodes both identity (scalar vs digit-string vs ordinal) and, for scalars, the **sign of the whole number**. Notation mode (plain / engineering / scientific / digit-string body / percent / percentage points) is read from the group contents, not from a separate mode vowel.

| V | Use |
|---|-----|
| **a** | Positive **scalar** (count or measure amount) |
| **u** | Negative **scalar** |
| **e** | **Digit-string** / label (phones, IDs, “read the digits”) |
| **o** | **Ordinal** / rank |

Do not combine conflicting identity types on one word (e.g. do not use `re` and `ro` for the same token). In [preferred writing](#writing-preferred-shorthand), the marker is **`+`** / **`-`** / **`_`** / **`#`** (not written `r`+V).

Digit-strings and ordinals are not signed via **V** (a negative phone number or “−2nd” is not part of this system; use ordinary vocabulary if needed). Multi-group scalars share one sign: e.g. −1 000 265 004 is one **`ru`** word whose groups add as a single negative magnitude.

There is no separate “mathematical object” marker. To talk about a number as an entity, use a scalar (**`ra`** / **`ru`**) with ordinary wording (e.g. the noun *number*), not a distinct numeral class.

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
| `+50% relative to baseline` (factor change) | **Not** **`jo`** / **`ju`** — use a factor as `/h/` (e.g. ×1.5) or ordinary *relative-to* wording |

`25%` (`…jo`) and `0.25` (plain scalar) name the same magnitude; **`jo`** only chooses the percent-scale reading. **`ju`** likewise names a ÷100 magnitude, but framed as **points** (not as “N% of a whole”).

### Denominator (portion “of what”)

The **whole** / reference class is **not** inside the number word. Prefer clause structure that names it (typically noun + `/ɡ/` percent number, or a complex adjective/adverb + `/b/` whole). Exact denominator patterns are **TBD** later.

**Style:** a bare `/z/` (or other freestanding) **`…jo`** percent with no named whole is **grammatical but stylistically bad** — same pressure as Claritish *Percent of what*. Prefer an explicit whole. Bare **`…ju`** point amounts are fine when the percent-scale quantity being moved is already clear.

## Digit-strings

Use marker **`re`** (written **`_`**). Omit exponents. Prefer groups of three digits. Ending is usually **-l** (exact label); **-n** for an official designation; **-r** to resume a prior code.

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

Place the symbol **immediately after PoS, before the digits**: `g+3l`, `d_555,123,4567l`, `g#2n`.

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
| firstly / secondly | `x#1l`, `x#2l` | *xrowol*, *xrodul* (`x` + `ro` + …) |
| point 3: (heading) | `x+3l` | *xrarel* (`x` + `ra` + re) |
| skipping 2 | `x-2l` | *xrudul* (`x` + `ru` + du) |
| re agenda 12 | `x_12l` | *xrewodul* (`x` + `re` + wo du) |
| as in (2) above | `x#2r` | *xrodur* (ending **-r**) |

In a sentence, the PoS attaches to that single number word (see [Parts of speech on numbers](#parts-of-speech-on-numbers); e.g. direct-object digit-string: `d_…l`). Prefer naming the whole with a `/ɡ/` **`jo`** percent (denominator patterns TBD).

## Stress (pronunciation guide)

- Single-digit magnitude groups: stress the digit syllable.
- Multi-digit groups without exponent: stress the **leftmost** digit.
- Groups with an exponent: stress the **leftmost exponent digit**.
- **`je`** (decimal point): always stressed when present.
- **`jo`** / **`ju`** (percent / percentage points): always stressed when present.
- Digit-string groups: stress the **first digit** of each group.

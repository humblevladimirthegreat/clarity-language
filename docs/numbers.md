# Numbers

Numerals are a **closed formal subsystem**, not ordinary lexicon roots. Quantifiers (*many*, *all*, *some*, …) are out of scope here. PoS prefixes, plural **-z**, and general phonotactics are defined in [language-reference.md](language-reference.md); this page is the source of truth for numeral grammar.

A whole numeric value is **one word**, even when it contains several digit groups.

## Word shape

```
[PoS] + r + V + ( [exponent?] [mantissa digits?] )+ + [ending] + [z?]
```

1. **PoS** — same prefixes as elsewhere. Use `/ɡ/` when the number modifies a noun; use `/z/`, `/d/`, or `/b/` when the number is itself an argument. Digit-strings usually take the role the clause needs (often `/d/`).
2. **Number marker** — consonant **r** plus a vowel **V** (see [Marker vowel](#marker-vowel)). The PoS+`r` cluster is a [number-only phonotactic exception](language-reference.md#phonotactics).
3. **One or more digit groups** — each group is an optional exponent and optional mantissa digits (at least one of the two). Digits compound with **no** **x** separator. There is **no per-group polarity**; sign (when it applies) is on the marker vowel for the whole word.
4. **Ending** — `-l` / `-m` / `-n` / `-r` with [number-specific meanings](#number-endings).
5. **Plural `-z`** — optional; same sense as elsewhere (the group containing that numeric referent).

**Lexicon rule:** Any stem that matches this grammar is a number, never an ordinary root. Dictionary generation must reject colliding roots.

## Marker vowel

**V** encodes both identity (scalar vs digit-string vs ordinal) and, for scalars, the **sign of the whole number**. Notation mode (plain / engineering / scientific / digit-string body) is read from the group contents, not from a separate mode vowel.

| V | Use |
|---|-----|
| **a** | Positive **scalar** (count or measure amount) |
| **u** | Negative **scalar** |
| **e** | **Digit-string** / label (phones, IDs, “read the digits”) |
| **o** | **Ordinal** / rank |

Do not combine conflicting identity types on one word (e.g. do not use `re` and `ro` for the same token). Writing sugar: ordinals may be written with **`#`** (e.g. `2#`) while speech uses marker **`ro`**.

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

- The **exponent comes before** the group’s mantissa digits.
- If a mantissa follows the exponent, say **`ja`** after the last exponent digit, then the mantissa. Example: `27e12` → `ba` + `wo` + `du` + `ja` + `du` + `le`.
- **Bare order of magnitude** (exponent only, no mantissa): use `ba`/`bu` + exponent digits and **omit** **`ja`**. The group ends at the next `ba`/`bu`, or at the word ending. Example: *e9* → `ba` + `na` (not `*banaja`).
- If the exponent is **0**, omit the exponent (and thus omit **`ja`**) entirely.
- Default spoken/written scale uses **engineering notation**: exponents are usually multiples of **3** (e.g. `27e6`, not `2.7e7`).
- **Decimal point:** say **`je`** after the digit(s) left of the point; digits after **`je`** are the fractional part (group in threes if long). May appear with or without an exponent.
- **Scientific register** is optional: exp-first, then **`ja`**, then mantissa with **`je`** after the leading digit (usual scientific shape). Example: `5.2487083e-4` → `bu` + `mo` + `ja` + `va` + `je` + `du` + `mo` + `ha` + `le` + `zo` + `ha` + `re`.
- Bare OoM uses scalar marker **`ra`** (or **`ru`** if negative).
- **Cents / fixed subunits:** an exponent need not be a multiple of 3 when the unit has a conventional subunit (e.g. dollars: `4e-2` for four cents). Same pattern for other fixed subunits if needed.
- **No metric prefixes** in speech: prefer base unit + engineering exponent (`40e3` grams, not “40 kilograms”; `12e-9` meters, not “12 nanometers”).

### Writing

Either form is acceptable in writing:

- Digits only (commas optional for readability), or
- Engineering-style forms (`27e6`, `50e-6`, multi-group values as successive groups).

Speech always follows the number-word grammar above. For long values, break into digit groups of at most three mantissa digits (plus their exponents); all groups still sit in **one** word after a single marker and before a single ending.

## Digit-strings

Use marker **`re`**. Omit exponents. Prefer groups of three digits. Ending is usually **-l** (exact label); **-n** for an official designation; **-r** to resume a prior code.

## Examples

Digits below use the table above; glosses show structure, not stress detail.

| Value | Speech sketch (exact `-l` unless noted) |
|-------|----------------------------------------|
| 3 | *grarel* (`g` + `ra` + re + `l`) |
| −3 | *grurel* (`g` + `ru` + re + `l`) |
| 139 | *graworenal* (`ra` + wo re na) |
| 27e12 | *grabawodujadulel* (`ra` + ba wo du **ja** + du le) |
| e9 (bare) | *grabanal* (`ra` + ba na; **no** `ja`) |
| 50e-6 | *grabugujavazol* (`ra` + bu gu **ja** + va zo) |
| −1e9 −265e3 −4 | *grubanajawobarejaduguvamol* — **`ru`**; groups: ba na **ja** wo · ba re **ja** du gu va · mo |
| $5860.04 → 5e3 + 860 + 4e-2 | *grabarejavahaguzobudujamol* — ba re **ja** va · ha gu zo · bu du **ja** mo |
| 2nd (`2#`) | *grodul*; title-like *the Second…* may take **-n** (*grodun*) |
| about 27e6 | *grabagujadulem* (ba gu **ja** du le, ending **-m**) |
| phone 555-123-4567 | *drevavavawoduremovagulel* (`d` + `re` + va×3 · wo du re · mo va gu · le + `l`) |
| scientific 5.2487083e-4 | *grabumojavajedumohalezoharel* (`ra` + bu mo **ja** + va **je** + du mo ha · le zo ha · re) |

In a sentence, the PoS attaches to that single number word (e.g. direct-object digit-string: `/d/` + `re` + … + ending).

## Stress (pronunciation guide)

- Single-digit magnitude groups: stress the digit syllable.
- Multi-digit groups without exponent: stress the **leftmost** digit.
- Groups with an exponent: stress the **leftmost exponent digit**.
- **`je`** (decimal point): always stressed when present.
- Digit-string groups: stress the **first digit** of each group.

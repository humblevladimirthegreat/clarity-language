# Numbers

Numerals are a **closed formal subsystem**, not ordinary lexicon roots. Quantifiers (*many*, *all*, *some*, …) are out of scope here. PoS prefixes, plural **-z**, and general phonotactics are defined in [language-reference.md](language-reference.md); this page is the source of truth for numeral grammar.

A whole numeric value is **one word**, even when it contains several digit groups.

## Word shape

```
[PoS] + r + V + ( [polarity?] [exponent?] [digits] )+ + [ending] + [z?]
```

1. **PoS** — same prefixes as elsewhere. Use `/w/` when the number modifies a noun; use `/z/`, `/d/`, or `/b/` when the number is itself an argument. Digit-strings usually take the role the clause needs (often `/d/`).
2. **Number marker** — consonant **r** plus a vowel **V** (see [Quantity vs identity](#quantity-vs-identity-marker-vowel)). The PoS+`r` cluster is a [number-only phonotactic exception](language-reference.md#phonotactics).
3. **One or more digit groups** — each group is optional polarity, optional exponent, then one or more digit syllables. Digits compound with **no** **x** separator.
4. **Ending** — `-l` / `-m` / `-n` / `-r` with [number-specific meanings](#number-endings).
5. **Plural `-z`** — optional; same sense as elsewhere (the group containing that numeric referent).

**Lexicon rule:** Any stem that matches this grammar is a number, never an ordinary root. Dictionary generation must reject colliding roots.

## Quantity vs identity (marker vowel)

Notation mode (plain / engineering / scientific / digit-string body) is read from the group contents, not from **V**.

| V | Use |
|---|-----|
| **a** | Scalar **magnitude** (count or measure amount) |
| **e** | **Digit-string** / label (phones, IDs, “read the digits”) |
| **o** | **Ordinal** / rank |
| **u** | **Mathematical object** (the number as a value in itself) |

Do not combine conflicting identity types on one word (e.g. do not use `re` and `ro` for the same token). Writing sugar: ordinals may be written with **`#`** (e.g. `2#`) while speech uses marker **`ro`**.

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

## Polarity and exponents

Within each digit group:

| Marker | Role |
|--------|------|
| **a** | Positive group value (may be **omitted**) |
| **u** | Negative group value (required when negative) |
| **ba** | Positive exponent, followed by the exponent’s digits |
| **bu** | Negative exponent, followed by the exponent’s digits |

- The **exponent comes before** the group’s main digits (mantissa).
- If the exponent is **0**, omit the exponent entirely.
- Default spoken/written scale uses **engineering notation**: exponents are usually multiples of **3** (e.g. `27e6`, not `2.7e7`).
- **Scientific register** is optional: still **exp-first**, but the mantissa uses **`ja`** after the first digit to mark the decimal point (always stressed). Break the remaining mantissa digits into groups of at most three.
- **Bare order of magnitude:** only the exponent part (no mantissa digits), with magnitude marker **`ra`** (e.g. *e9* / “a billion”).
- **Cents / fixed subunits:** an exponent need not be a multiple of 3 when the unit has a conventional subunit (e.g. dollars: `4e-2` for four cents). Same pattern for other fixed subunits if needed.
- **No metric prefixes** in speech: prefer base unit + engineering exponent (`40e3` grams, not “40 kilograms”; `12e-9` meters, not “12 nanometers”).

### Writing

Either form is acceptable in writing:

- Digits only (commas optional for readability), or
- Engineering-style forms (`27e6`, `50e-6`, multi-group values as successive groups).

Speech always follows the number-word grammar above. For long values, break into digit groups of at most three mantissa digits (plus their exponents); all groups still sit in **one** word after a single marker and before a single ending.

## Digit-strings

Use marker **`re`**. Omit exponents. Prefer groups of three digits. Positive polarity may be omitted. Ending is usually **-l** (exact label); **-n** for an official designation; **-r** to resume a prior code.

## Examples

Digits below use the table above; glosses show structure, not stress detail.

| Value | Speech sketch (exact `-l` unless noted) |
|-------|----------------------------------------|
| 3 | *wrarel* (`w` + `ra` + re + `l`) |
| −3 | *wraurel* (`w` + `ra` + u + re + `l`) |
| 139 | *wraworenal* (`ra` + wo re na; positive polarity omitted) |
| 27e12 | *wrabawodudulel* (`ra` + ba wo du + du le) |
| e9 (bare) | *wrabanal* (`ra` + ba na; no mantissa) |
| 50e-6 | *wrabuguvazol* (`ra` + bu gu + va zo) |
| −1e9 −265e3 −4 | *wraubanawoubareduguvaumol* — groups: u ba na wo · u ba re du gu va · u mo |
| $5860.04 → 5e3 + 860 + 4e-2 | *wrabarevahaguzobudumol* — last group bu du + mo (cents) |
| 2nd (`2#`) | *wrodul*; title-like *the Second…* may take **-n** (*wrodun*) |
| about 27e6 | same body as 27e6 with ending **-m** |
| phone 555-123-4567 | *drevavavawoduremovagulel* (`d` + `re` + va×3 · wo du re · mo va gu · le + `l`) |
| scientific 5.2487083e-4 | *wrabumovajadumohalezoharel* (or **`ru`** instead of **`ra`** if treated as a pure math value) |

In a sentence, the PoS attaches to that single number word (e.g. direct-object digit-string: `/d/` + `re` + … + ending).

## Stress (pronunciation guide)

- Single-digit magnitude groups: stress the digit syllable (after optional polarity).
- Multi-digit groups without exponent: stress the **leftmost** digit.
- Groups with an exponent: stress the **leftmost exponent digit**.
- Scientific **`ja`**: always stressed (marks that register).
- Digit-string groups: stress the **first digit** of each group.

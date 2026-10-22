# Proposal: letters in codes, and initials as handles

**Status:** PROPOSED (not current language). Grammar today: a code is digits only on the digit-string marker **`_`** ([digit-strings](../grammar/numbers-applied.md#digit-strings)); a handle is one **published** root + **-n** ([named handles](../grammar/say-people-places.md#named-handles)); a long title is a hyphenated name (`ROOT x ROOT` … + **-n**, [multipart names](../grammar/word-endings.md#multipart-names)) or a [titled phrase](../grammar/word-endings.md#titled-phrases).  
**Related:** [letter names](../grammar/phonology.md#letter-names), [group separator](../grammar/numbers.md#group-separator), [shorthand](../grammar/numbers.md#writing-preferred-shorthand), [stacked markers](../grammar/numbers.md#stacked-markers), [numeric prefixes](../grammar/numeric-derivation.md), [spans](../grammar/spans.md#loans)  
**Code:** [`src/parse/word.peggy`](../../src/parse/word.peggy) (number bodies, `separatorVowel`, `writingMarkerFromSpeechV`)  
**Design authority:** none until absorbed.

## Motivation

English names many things with letter codes: offices (*FBI*), paper sizes (*A4*), vitamins (*B12*), flats (*4B*), routes (*9A*). Agebon codes hold digits only, so a letter code today goes into an opaque span (`z@<FBI>`) or is dropped.

Two jobs, one change:

- **Codes with letters.** Let the digit-string marker **`_`** carry letters as well as digits: `z_b12`.
- **Initials as handles.** A long title gets a short name from its roots' initials, written as a code with **`@`** (**-n**, an official designation, which `_` already has): `z@_nl` for *Book-Courage*.

Earlier drafts minted handles as place-name roots harvested from the title's consonants. That approach is rejected below.

## Non-goals

- Changing how **-n**, mention `[…]`, or opaque `<…>` work.
- Putting handles in [`lexicon-published.csv`](../../data/lexicon-published.csv).
- Letters on any marker but **`_`**: a count, a rank, or a sign has no letters.

## Characters

A code is a run of characters after **`_`**. Each character is **one syllable**, and each syllable means one thing.

| Character | Count | Written | Spoken |
|-----------|-------|---------|--------|
| Digit | 10 | `0`–`9` | its digit syllable (`ba` … `mo`) |
| Consonant | 13 | `b d g h z v r l n m th w y` | its [letter name](../grammar/phonology.md#letter-names) (`bu` … `me`, `tho`, `wa`, `yu`) |
| Vowel | 4 | `u a o e` | the bare vowel, after a break |
| Field break | | `,` | `the` |

A letter name never sounds like its digit: the name takes the [opposite vowel](../grammar/phonology.md#opposite-vowels) (`bu` *b*, `ba` *1*). So `w`, `y`, `th`, and `r` are plain letters in a code. None of them starts a number-syntax syllable there (see [number syntax on codes](#number-syntax-on-codes)).

**`x` is not a character.** See [why `x` stays out](#why-x-stays-out).

## Writing

Codes are written in shorthand, in the same slots as other numbers: `[role][mark]_[characters]`.

| Shorthand | Ending | Reads |
|-----------|--------|-------|
| `z_vba` | **-l** | the code V-B-A (exact label) |
| `z_b12` | **-l** | B-1-2 |
| `z_4b` | **-l** | 4-B |
| `z@_nl` | **-n** | the designation N-L |
| `z=_nl` | **-r** | that code again |
| `z_2,1` | **-l** | version 2.1 (two fields) |

Letters are lowercase, like all native text. A code with a letter is always written in shorthand. The spelled form shows up only on 🔊 lines.

## Speech

Say the role letter, the marker `ro`, one syllable per character, then the ending.

| Shorthand | 🔊 | Syllables |
|-----------|----|-----------|
| `z_vba` | `zrovebu'al` | `ro` · `ve` `bu` `'a` · `-l` |
| `z_b12` | `zrobubadol` | `ro` · `bu` `ba` `do` · `-l` |
| `z@_nl` | `zronulan` | `ro` · `nu` `la` · `-n` |
| `z_bu` | `zrobu'ul` | `ro` · `bu` `'u` · `-l` |
| `z_e1` | `zro'ebal` | `ro` · `'e` `ba` · `-l` |
| `z_thw` | `zrothowal` | `ro` · `tho` `wa` · `-l` |
| `z_2,1` | `zrodothebal` | `ro` · `do` · `the` · `ba` · `-l` |

### Vowel characters

A vowel character is its bare letter name (`u`, `a`, `o`, `e`), always said **after a break**, a short catch as in English *uh-oh*. The spelled form writes the break as **`'`**.

- **Same vowels stay apart.** `bu` + `u` would merge into one long vowel without the break, and so would `ro` + `o`.
- **It reuses a rule.** Spelling aloud already pauses between letter names so two names do not run into one syllable ([letter names](../grammar/phonology.md#letter-names)). A code is spelling aloud, with the pause made required before a vowel.
- **Dates stay apart.** The date marker `_#` is the stack `roe` ([stacked markers](../grammar/numbers.md#stacked-markers)), said with no break. `zroebal` is the date `_#1`; `zro'ebal` is the code `_e1`.

### Code phonotactics

A code is spelled aloud, not sung as a smooth word. Inside the body it may break the ordinary [word shape](../grammar/phonology.md#phonotactics) in two ways: a break before a vowel, and two vowels in a row (including the same vowel twice). The role letter + `r` cluster ([number-word exception](../grammar/phonology.md#number-word-exception)) already tells the hearer a number-family word is coming, so a code never looks like a root.

The body splits into characters one way only:

- A consonant always takes its letter-name vowel or its digit vowel.
- Any vowel after `'` is a character.
- `the` is never a character's name.

## One separator: `the`

The [group separator](../grammar/numbers.md#group-separator) becomes **`the`** for **every** marker. Today the separator echoes the marker's vowel (`tha`, `thu`, `the`, `tho`), but `tho` is now the letter `th`.

- One syllable means *next group* in every number, with no choice to make on a stacked marker.
- `the` keeps the reading **e** ≈ order: the next group comes in order. That fits ranks (`g#2,3`), clock times (`h_15,30`), dates, and codes.
- The trade: a hearer who missed the start of a long negative number no longer hears the sign at each break. Long grouped negatives are rare in speech, and the sign is still said at the start.

| Shorthand | 🔊 today | 🔊 proposed |
|-----------|----------|-------------|
| `d_555,123,4567` | `drozazazathobadogethohuzavorel` | `drozazazathebadogethehuzavorel` |
| `h_15,30` | `hrobazathogemol` | `hrobazathegemol` |
| `g+5e3,860` | `grawageyazathaluvomol` | `grawageyazatheluvomol` |
| `g#2,3` | `gredothegel` | `gredothegel` (unchanged) |

### Fields in codes

A comma in a code marks a **field**: a part that is a value on its own. The comma is part of the code, so `h_15,30` and `h_1530` are different words.

| Rule | Examples |
|------|----------|
| Put a comma between fields | clock `h_15,30`, ledger `bl-_22,7`, version `_2,1,3`, phone `_555,123,4567` (area code, exchange, line) |
| Two number fields side by side always take one; without it they merge | `_15,30` (two fields) vs `_1,530` (a different code) |
| No comma between letters and digits; the switch is audible | `_v16` *F-16*, `_b12` *B12*, `_4b` *4B* |
| Drop source punctuation that marks no field | the hyphen in *F-16*, spaces in a serial number |
| Do not chunk one long field; a speaker may pause, but says no `the` | serial `_4071229385` |
| `.` only for one decimal value used as a label; multi-part dots are fields | `b_101.1` *101.1 FM*; *1.2.3* is `_1,2,3` |

Digit strings today are grouped in threes; for codes, these rules replace that.

## Number syntax on codes

| Syllable | Job today | On `_` |
|----------|-----------|--------|
| `wa` / `wu` | exponent | **retired**: `_e`, `_e-`, `_1e` (numeric-prefix landmark labels, `zrowaxudenel`) leave the language. `e` in a code is always the vowel, and `wa` is always `w`. |
| `ya` | mantissa after an exponent | gone with exponents |
| `ye` | decimal `.` | **kept**: `b_101.1` (`brobamobayebal`). It is not the name of any character. |
| `yo` / `yu` | `%` / `%*` | **closed**: percent sits on `ra` / `ru` only (already the grammar; the parser accepts `d_5%` today and must stop). |

So in a code, `yu` is always the letter `y`. All four `y` syllables keep their jobs elsewhere, and none needs to move. Inside one `_` word, the decimal `ye` and the letter `yu` are the only `y` syllables, and they never clash.

## Why `x` stays out

- **The numeric-prefix seam.** Codes take numeric prefixes ([numeric derivation](../grammar/numeric-derivation.md)). The parser reads `zrobaxezuyul` as `_1` + `x` + `ezuyu`. If `x` (`xe`) were a character, the same spelling would also be the code `_1xzy`. This clash hits every root that starts with `e` and whose remaining syllables happen to be valid code characters.
- **Plural.** In shorthand, `x` after a code is already plural (`z_90x`, [plural labels](../grammar/numbers-applied.md#plural-labels)).

Real-world codes drop look-alike letters too (*I* and *O* in vehicle numbers). No root contains `x`, so leaving it out never blocks an initial.

## Initials as handles

A title's initials are each content root's **first consonant** (skip joins, revisers, and number words), in title order, written as a code with **`@`**. A root always starts with a vowel, so its literal first letter would give only four choices.

| Agebon | Use | English |
|--------|-----|---------|
| `zanaxolazun` | long title (`ana` × `olazu`) | *Book-Courage* |
| `z@_nl` | handle (🔊 `zronulan`) | the same office, short |
| `z=_nl` | resume (🔊 `zronular`) | that office again |

- **Nothing can fail.** Each initial is its own syllable, so doubled consonants (`ana` × `anumu` → `z@_nn`, `zronunun`) and `l` / `m` + `r` (`z@_lr`, `zrolaron`) need no fallback. Short roots are no special case.
- **Any length.** One syllable per root; no arity cap.
- **No dictionary clash.** The role letter + `r` cluster marks every code.
- **Shared initials happen, as in English.** First consonants are skewed (`b`, `g`, and `z` each start about 13% of published roots), so there are 144 two-letter and 1,728 three-letter handles. Context sorts out a shared one, as it does for English initialisms. A speaker who needs a distinct name can still pick a published root, as today.
- **Doable mid-sentence.** The whole rule is *say each root's first consonant by its letter name*, so no widget is needed.

## Rejected alternatives

- **Consonant harvest** (first vowel + two consonants + last vowel as a place-name root, `zanlun`). Over all pairs of published roots, it needed a fallback 10% of the time (9.5% doubled consonants, 0.8% the `l` / `m` + `r` seam). It made a weak cluster (`h`, `w`, or `y`) 24% of the time and had only 2,304 possible handles, so collisions with other handles would be routine.
- **Letter names as a root** (`anula`). This needs a vowel first, and 73 published roots are already a vowel plus letter-name syllables (`olazu` among them).
- **Doubled consonants in a root.** The length contrast is weak for English speakers and lost in song (`anna` → `ana`, an ordinary root shape). The respeller already says a doubled letter once.
- **Vowels without a break.** Same-vowel neighbors merge (`bu` + `u`), and `ro` + `e` reads as the date stack `roe`.
- **A carrier consonant for vowels** (`y` + vowel). It would give `y` a special meaning in codes, and no consonant is spare.
- **A silent comma.** Fields carry content (`h_15,30`, `bl-_22,7`).
- **Leaving `th` out of codes and keeping `tho`.** This works, but `the` everywhere frees `th` and drops a per-marker choice.
- **`the`, but `thu` on negatives.** This keeps the sign redundancy, at the cost of two separator syllables.

## Foreign codes

A foreign code is respelled when every letter has an Agebon letter. English *p t k s f* are the unvoiced sounds of `b d g z v`, so they take those letters: *F-16* is `_v16`, *P2* is `_b2`. A code with a letter that has no Agebon sound (*c*, *i*, *j*, *q*, *x*) keeps the span (`z@<FBI>`).

## Prefixes and plurals

- **Numeric prefixes** take letter codes (*a B12 pill*: `_b12` + `x` + root). With `x` out of codes, the seam is unambiguous.
- **Plural -x** works as on digit codes: final zeros stand for any digit, so `_b0x` covers B0 to B9. A code that does not end in a zero takes no **-x**.

## Absorb sketch (if yes)

1. **Separator, everywhere.** In [numbers.md](../grammar/numbers.md#group-separator), collapse the separator table to `the` and respell every 🔊 line that says `tha`, `thu`, or `tho` at a comma (numbers.md, numbers-applied.md, the numbers cheat sheet). In the parser, `separatorVowel` returns `e` and the separator-matches-marker check goes.
2. **Letters in codes.** Add an Intermediate subsection after [digit-strings](../grammar/numbers-applied.md#digit-strings): characters, vowel break, fields, writing in shorthand, foreign codes. On digit-strings, replace *group the digits in threes* with the field rules. Add a code paragraph to [phonology](../grammar/phonology.md#number-word-exception) for the code phonotactics and the `'` break, and a pointer from [letter names](../grammar/phonology.md#letter-names).
3. **Initials.** Advanced subsection on the same page, linked from [multipart names](../grammar/word-endings.md#multipart-names). Add a row to the [named handles](../grammar/say-people-places.md#named-handles) recipe, and change its *Compare with* line so a letter code is a native code, not only a span.
4. **Retire `_e` / `_e-` / `_1e`.** Remove the landmark-label section from [numeric-derivation.md](../grammar/numeric-derivation.md) and the line in numbers.md that allows them.
5. **Parser** (`word.peggy`): letter and vowel characters in the `_` body, writing and speech. The `'` break goes in speech. Remove exponents on `_`, remove `%` on `_`. Make the code-character mark carry over into morph gloss and the LLM prompt.
6. **[`unassigned-reserved.md`](../meta/unassigned-reserved.md)**, closed: `x` in a code; letters on `+`, `-`, `#`, and stacked markers; `%` on `_`; exponents on `_`. **[`design-decisions.md`](../meta/design-decisions.md)**: why `x` is out, why `_e` retired, why the separator is uniform.
7. Run `npm run grammar-check`, `npm run cheat-sheet-blocks -- --write`, `npm run build`, `npm test`.

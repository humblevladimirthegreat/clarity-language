---
band: intermediate
---

# Number markers and endings {#number-markers-and-endings}

English numbers do more than count a noun: *three* on its own, *minus three*, *about twenty*, *the Second …* in a title, a code such as *room 12* or *B12*, and a short way to write them. Ageben keeps the same one-word number and changes its role letter, marker vowel, or ending.

### Word shape

Beginner already built one word: role letter, marker, digit syllables, ending. The same four slots hold every **free number** you meet next (a number word on its own, not built onto a content root).

```text
[PoS] + r + V + ( group ( the + group )* )? + [ending]
group = [exponent?] [mantissa digits?]
```

1. **PoS:** the role letter (part of speech), as on any other word.
2. **Number marker:** the consonant `r` plus a vowel, written **V** in the pattern above. V is a single vowel at this stage. The cluster of role letter plus `r` is a [number-only letter-cluster exception](phonotactics.md#phonotactics). The marker always comes straight after the role letter, so `grorel` is *the seventh* (rank `ro`, then digit 7 `re`).
3. **Zero or more digit groups:** each group is an optional exponent (the *order of magnitude* piece) and optional mantissa digits (the ordinary digits). A group always has at least one of those two pieces. Digits sit next to each other with no `x` between them. A sign, when there is one, applies once to the whole word. With no groups, the word is digitless: it says what kind of number it is, but not its value.
4. **Group separator:** each group after the first opens with `the`.
5. **Ending:** `-l` / `-m` / `-n` / `-r`.

Speech always uses the fully spelled form. Writing also has a shorthand for numbers with two or more digits (`g+12`); zero, one digit, or none stays spelled (`gragel`, `gral`).

**Related form:** naming a group of people or things uses [`-x`](/plurality) on an ordinary noun.

### Parts of speech on numbers {#parts-of-speech-on-numbers}

Beginner put the number after a noun (*three cats*). You can also use the number word on its own, in another role: as the subject, as the object, or as the extra noun under a host.

Change only the first letter. The marker and digits stay the same, and on these four role letters the number still means a plain amount, rank, or code.

> `zragel vezuvel.`
> z-three | v-sleep
>
> "Three are sleeping."

<!-- cheat-sheet: numbers -->
| Prefix | Use | English |
|--------|-----|---------|
| `/ɡ/` | modifier after the noun | *three cats*, *the second page*, *room 12* |
| `/z/` | subject | the value, code, or rank as subject |
| `/d/` | direct object | a code being dialed or a value being stated |
| `/b/` | extra noun | *of size 12*; host *on* + a label |

### Count, rank, or label: the marker vowel {#marker-vowel-referential-identity}

English uses different words for a count (*three*), a rank (*third*), and a code you read digit by digit (*room 12*). In Ageben the vowel of the number marker, the marker vowel V, makes that choice. Beginner already used `ra` (*how many*) and `ro` (*which place from the start*); the full set has four, and on a count the vowel also gives the sign of the whole number. So the same digits read as an amount, a place in order, or a label, depending on one vowel.

The table shows each marker's shorthand symbol in parentheses. Forward ordinal `o` matches [rank join `o`](rank-joins.md#rank-joins).

<!-- cheat-sheet: numbers -->
| Ageben | Use | English | Cue |
|---|---------|---------|-----|
| `a` (`+`) | positive **scalar** (count or measure amount) | `g+3` *three cats*; `g+` *plural / more than one*; `z+3` *three* (subj); `b+12` *of size 12* | `a` ≈ add |
| `u` (`-`) | negative scalar | `d-3` *−3* (obj); `z-` *some negative amount*; `g-2` signed measure on a noun | `u` ≈ undo |
| `o` (`#`) | **ordinal** / rank from the start | `g#2` *the second page*; `g#` *some rank*; `z#2` *second* (rank as subject) | `o` ≈ rank |
| `e` (`_`) | **digit-string** / label (phones, IDs, “read the digits”) | `d_5551234`; `d_` *some code*; `g_12` *room 12*-style; `b_…` under a host relation | `e` ≈ choice (one string) |

Each number word is one kind of number, set by its marker. In preferred writing, the marker is `+` / `-` / `#` / `_`.

#### Sign {#sign}

| Identity | How sign works |
|----------|----------------|
| Scalar (`a` / `u`, written `+` / `-`) | The vowel V is the sign. Multi-group scalars share one sign for the whole word (e.g. −1 000 265 004 is one `ru` word). |
| Forward ordinal (`o`, written `#`) | Direction *from the start* |
| Digit-string (`e`, written `_`) | Labels are unsigned. |

### Number endings {#number-endings}

Beginner already used exact `-l`. A number word takes the same four ending letters as any other word, but on a number they have their own meanings: the other endings mark *about*, a named title, or a repeat of a number you already gave. Speech keeps the ending letter. Shorthand writing shows the ending as a mark right after the role letter (the same marks as on [spans](/spans)).

<!-- cheat-sheet: numbers -->
| Written | Spoken | Use | Cue |
|---------|--------|-----|-----|
| *(none)*: `g+3`, `g+` | `-l` | exact, newly stated (default) | `-l` stands behind the amount |
| `~` after PoS: `g~+3`, `g~+` | `-m` | approximate / non-literal (“about N”) | `-m` leaves the hold open |
| `@` after PoS: `g@#2` | `-n` | named designation (titles, official labels, *the Second…*) | `-n` names the number |
| `=` after PoS: `g=+3`, `g=#2`, `d=_12` | `-r` | resume of a previously stated number, code, or rank (at least one digit) | `-r` points back |

A resume needs at least one digit: `grager` = *that three again*; `grodor` = *that second one again*. Use the same marker as the number you repeat. Digitless `-r` (`grar`) is not a resume: like a standalone join `-r`, it is *some number* in a statement and *which number?* in a question. `=` is never combined with `~` or `@`.

> `zalazun dragel vayebel. zazozon drager vayebel.`
> z-Alazun | d-three | v-see . z-Azozon | d-←three | v-see
>
> "Alazun sees three. Azozon sees those three too."

### Writing (preferred shorthand) {#writing-preferred-shorthand}

Beginner spelled every number out (`gragel`, `gradomol`). Writing also has a **shorthand** for the ending, marker, and body: `g+3` for `gragel`, `g+20` for `gradomol`. Both writings name the same word, so the choice changes only how the page looks, never what you say aloud. The style table at the end of this section says which writing to use.

```text
[PoS] + [~|@|=]? + [marker] + [body?]
```

#### Ending marks (second slot, after PoS)

These are the same marks, with the same meanings, as on [spans](/spans#writing): `~` soft, `@` proper. A resume uses `=`.

<!-- cheat-sheet: numbers -->
| Mark | Speech ending | Job | Examples |
|------|---------------|-----|----------|
| *(none)* | `-l` | exact (default) | `g+3`, `g+`, `g#2`, `d_12` |
| `~` | `-m` | approximate / soft | `g~+3`, `g~+`, `g~+12`, `g~#2` |
| `@` | `-n` | named | `g@#2`, `g@_12` |
| `=` | `-r` | resume (digit) / blank | `g=+3`, `g=#2`, `g=+` |

A hedged named number (both `@` and `~`) is written with `@` only, as on spans. `=` is never combined with another mark. A spelled word shows its ending as the last letter (`gragel`, `gram`) instead of a mark.

#### Marker (not written as `r`+V)

| Symbol | Speech | Meaning |
|--------|--------|---------|
| `+` | `ra` | Positive scalar |
| `-` | `ru` | Negative scalar |
| `#` | `ro` | Ordinal (from the start) |
| `_` | `re` | Digit-string |

Put the marker symbol right after the ending mark (or right after the role letter when there is no mark), before the digits (or last, when there are no digits): `g+3`, `g~+3`, `g=+`, `d_12`, `d=_`, `g@#2`. A `_` label never takes a sign ([Sign](#sign)).

A [citation](/word-endings#citation-forms) has no role letter, in shorthand as in speech, and takes any ending: `+12` (`rabadol`) *twelve*, `#2` (`rodol`) *second*, `=+3` (`rager`) *those three again*, `=+` (`rar`) *some number*. A written citation keeps a digit or the `=`, so a lone `+` stays a symbol.

#### Body

| Speech | Preferred writing |
|--------|-------------------|
| *(no digit groups)* | *(empty after marker)* `g+`, `g~-`, `g=#`, `d_` |
| Digit syllables (`ba`…`mo`) | Arabic `0`–`9` |

For long values, break into digit groups of at most three mantissa digits; all groups still sit in one word after a single marker. In speech, a number word stresses the last digit of each group, as a one-group number does ([counts](/numbers#counts)).

#### Starter examples {#starter-examples}

Common values in shorthand, as tables write them. Speech always uses the fully spelled form.

<!-- cheat-sheet: numbers -->
| Value | Writing | Reading |
|-------|---------|--------|
| plural / more than one | `g+` | *more than one* (digitless `ra`) |
| three (modifier) | `g+3` | *three* (on a noun) |
| three (subject) | `z+3` | *three* |
| −3 (object) | `d-3` | *−3* |
| second (modifier) | `g#2` | *the second* |
| about 3 | `g~+3` | approximate (`-m`) |
| how many? / some amount | `g=+` | digitless `-r` blank |
| that three again | `g=+3` | `-r` resume (needs a digit) |
| room 12 | `g_12` | digit-string label |

#### Style (numeric vs spelled) {#writing-style}
<a id="writing-style-numeric-vs-spelled"></a>

Both writings name the same word, so choose between them by one test: how many digits does the word have? Count every digit, including exponent digits.

| Word | Prefer | Why |
|------|--------|-----|
| Free number with two or more digits | shorthand | `g+12`, `g#12`: a value to scan and compare |
| Free number with one digit or none | spelled | `gragel` *three*, `grodol` *second*, `gramol` *zero*, `gral` *more than one*, `drar` *how many*; reads as a word, as English writes *three* |
| Digit-string label or code (`_`) | shorthand | `d_5`, `d_12`: a code, not an amount (English *Room 5*) |
| Numeric prefix | spelled (required) | shorthand before `x` and a root does not form a word |
| Inventory tables | shorthand | patterns are easy to scan |

Number words next to each other (a list of values) share one writing. If any of them needs shorthand, write them all in shorthand: `z+3 z+12 zal`, not `zragel z+12 zal`.

Speech and writing drills that teach the shorthand itself still show one-digit shorthand.

A free number in shorthand shows its ending as a mark after the role letter (`g~+3`); spelled out, it shows the ending as its last letter (`gragem`). A number built onto a content root is always spelled out (`NUM`) and never takes the marks `~` / `@` / `=`.

### Letter codes {#letter-codes}

English names many things with letters as well as digits: a vitamin (*B12*), a flat (*4B*), a jet (*F-16*). A `_` code may hold letters too. Write each letter in lowercase, in shorthand, just like the digits: `g_b12`.

> `zazozon debebul g_b12 vagedal.`
>
> 🔊 `zazozon debebul grebubadol vagedal.`
>
> z-Azozon | [d-pill | g-_b12] | v-eat
>
> "Azozon takes a B12 pill."

Say each character as one syllable, after the marker `re`:

- A digit is its digit syllable (`ba` … `mo`).
- A consonant is its [letter name](letter-names.md#letter-names) (`bu` … `me`, `tho`, `wa`, `yu`). A letter name never sounds like a digit, because it takes the [opposite vowel](/phonology#opposite-vowels): `bu` is *b*, `ba` is *1*.
- A vowel is its own sound after a short break, the catch in English *uh-oh*. The spelled form writes the break as `'`. Without it, `bu` + `u` would run into one long vowel, and `re` + `o` would sound like another marker.

<!-- cheat-sheet: numbers -->
| Ageben | Use | English |
|--------|-----|---------|
| `z_b12` (🔊 `zrebubadol`) | letter, then digits | *B12* |
| `z_4b` (🔊 `zrehubul`) | digit, then letter | *4B* |
| `z_vba` (🔊 `zrevebu'al`) | vowel after a break | *VBA* |
| `z_e1` (🔊 `zre'ebal`) | code that starts with a vowel | *E1* |
| `z_thw` (🔊 `zrethowal`) | `th` is one letter | *THW* |
| `z_2,1` (🔊 `zredothebal`) | two fields | *version 2.1* |

Rules for letters in a code:

- No comma between letters and digits: the switch is audible (`z_b12`, not `z_b,12`).
- `x` is never a character, so a code before `x` is always a numeric prefix or plural `-x` (`z_b0x` covers B0 to B9, as in [plural labels](/digit-strings#plural-labels)).
- Only the `_` marker takes letters: a count, a rank, a sign, or a date has none.
- In a code, `e` is always the vowel letter, never an exponent.
- A letter at the end of a code is a character, not the ending. A code with a letter always shows its ending by a mark: `z_nl` is `-l`, `z@_nl` is `-n`, `z=_nl` is `-r`.

A foreign code keeps its letters when each one has an Ageben letter. English *p*, *t*, *k*, *s*, and *f* are the voiceless sounds of `b`, `d`, `g`, `z`, and `v`, so they take those letters: *F-16* is `z_v16`, and *P2* is `z_b2`. A code with a letter that has no Ageben sound (*c*, *i*, *j*, *q*, *x*) stays a [span](/spans#loans): *FBI* is <code>z@&lt;FBI&gt;</code>.

### Practice {#intermediate-practice}

Short drills for Intermediate. Try each item before opening **Show answer**. Use shorthand for two or more digits (`g+12`, `g#12`); spell zero, one digit, or none (`gragem`, `grodol`, `gral`).

**Setting:** a sports stadium

**New words:**

| English | Ageben | Cue |
|---------|--------|-----|
| *seat* | `uzohel` | 💺 |

**Review:**

| English | Ageben |
|---------|--------|
| *Azozon* | `azozon` |
| *Alazun* | `alazun` |
| *Ahelan* | `ahelan` |
| *trophy* | `odoral` |
| *see* | `vayebel` |
| *croissant* | `agedel` |

#### English → Ageben {#intermediate-english-to-ageben}

**1.** *There are about three seats.*

::: details Show answer
`zuzohelx gragem.`

z-seat-x | g-three.about
:::

**2.** *Alazun sees twelve seats.*

::: details Show answer
`zalazun duzohelx g+12 vayebel.`

z-Alazun | [d-seat-x | g-twelve] | v-see
:::

**3.** *Alazun sees three seats, and Azozon sees those three.*

::: details Show answer
`zalazun duzohelx gragel vayebel xal zazozon drager vayebel.`

[z-Alazun | [d-seat-x | g-three] | v-see | x-and | z-Azozon | d-←three | v-see]
:::

**4.** *Ahelan sees seat 4B.*

::: details Show answer
`zahelan duzohel g_4b vayebel.`

🔊 `zahelan duzohel grehubul vayebel.`

z-Ahelan | [d-seat | g-_4b] | v-see
:::

#### Ageben → English {#intermediate-ageben-to-english}

**1.** `zrodol dodoral vayebel.`

::: details Show answer
z-2nd | d-trophy | v-see

*The second one sees the trophy.*
:::

**2.** `zahelan duzohelx g~+30 vayebel.`

::: details Show answer
🔊 `zahelan duzohelx gragemom vayebel.`

z-Ahelan | [d-seat-x | g-30.about] | v-see

*Ahelan sees about thirty seats.*
:::

**3.** `zazozon dodoral grodol vayebel.`

::: details Show answer
z-Azozon | [d-trophy | g-2nd] | v-see

*Azozon sees the second trophy.*
:::

**4.** `zalazun drugel vayebel.`

::: details Show answer
z-Alazun | d-minus-three | v-see

*Alazun sees −3.* (on the scoreboard)
:::

**5.** `zahelan dagedelx g+12 vayebel.`

::: details Show answer
z-Ahelan | [d-croissant-x | g-twelve] | v-see

*Ahelan sees twelve croissants.* (at the snack stand)
:::

**6.** `zalazun duzohel g_e1 vayebel.`

::: details Show answer
🔊 `zalazun duzohel gre'ebal vayebel.`

z-Alazun | [d-seat | g-_e1] | v-see

*Alazun sees seat E1.*
:::

#### Pick one {#intermediate-pick-one}

**1.** *Alazun sees about four seats.* `zalazun duzohelx grahum vayebel.` or `zalazun duzohelx grahul vayebel.`

::: details Show answer
`zalazun duzohelx grahum vayebel.`

z-Alazun | [d-seat-x | g-four.about] | v-see

**-m** makes the number approximate; **-l** is exact.
:::

**2.** *Ahelan sees seat 5.* (its label) `zahelan duzohel grezal vayebel.` or `zahelan duzohel grazal vayebel.`

::: details Show answer
`zahelan duzohel grezal vayebel.`

z-Ahelan | [d-seat | g-_5.spelled] | v-see

A label is a digit string, marker **`re`**; **`ra`** would count five.
:::

#### Fix it {#intermediate-fix-it}

**1.** *There is a fifth seat.* <!-- lint: error -->`zuzohel grazal.`

::: details Show answer
`zuzohel grozal.`

z-seat | g-5th

A place in a series is a rank, marker **`ro`**; **`ra`** counts.
:::

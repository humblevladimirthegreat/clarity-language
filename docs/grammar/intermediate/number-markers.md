---
band: intermediate
---

# Number shape {#word-shape-markers-and-endings}

### Word shape

Beginner already built one word: role letter, marker, digit syllables, ending. The same four slots hold every **free number** you meet next (a number word on its own, not built onto a content root).

```text
[PoS] + r + V + ( group ( the + group )* )? + [ending]
group = [exponent?] [mantissa digits?]
```

1. **PoS:** the role letter (part of speech), as on any other word.
2. **Number marker:** consonant **r** plus a vowel **V**. **V** is a single vowel at this stage. The cluster of role letter plus `r` is a [number-only letter-cluster exception](phonotactics.md#phonotactics). A marker can sound like a digit (rank **`re`**, digit 7 **`re`**), but the marker always comes straight after the role letter, so `grerel` is *the seventh*.
3. **Zero or more digit groups:** each group is an optional exponent (the *order of magnitude* piece) and optional mantissa digits (the ordinary digits). A group always has at least one of those two pieces. Digits sit next to each other with no **x** between them. A sign, when there is one, applies once to the whole word. With **no groups**, the word is digitless: it says what kind of number it is, but not its value.
4. **Group separator:** each group after the first opens with **`the`** (the spoken comma).
5. **Ending:** `-l` / `-m` / `-n` / `-r`.

Speech always uses the fully spelled form. Writing also has a shorthand for numbers with two or more digits (`g+12`); zero, one digit, or none stays spelled (`gragel`, `gral`).

**Related form:** naming a group of people or things uses [**-x**](/plurality) on an ordinary noun.

### Parts of speech on numbers {#parts-of-speech-on-numbers}

Beginner put the number after a noun (*three cats*). You can also put the **number word on its own** in other slots: as the subject, as the object, or as the extra noun under a host.

Change only the first letter. The marker and digits stay the same, and on these four role letters the number still means a plain amount, rank, or code.

> `zragel vezuvol.`
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

### Marker vowel (referential identity) {#marker-vowel-referential-identity}

Beginner already used **`ra`** (*how many*) and **`re`** (*which place from the start*). The marker vowel **V** completes that set: it says whether the word is a count, a rank, or a string of digits, and on a count it also gives the sign of the whole number. The table shows each marker's shorthand symbol in parentheses. Forward ordinal **`e`** matches [rank join **e**](rank-joins.md#rank-joins).

<!-- cheat-sheet: numbers -->
| Agebon | Use | English | Cue |
|---|---------|---------|-----|
| **a** (`+`) | positive **scalar** (count or measure amount) | `g+3` *three cats*; `g+` *plural / more than one*; `z+3` *three* (subj); `b+12` *of size 12* | **`a`** ≈ add |
| **u** (`-`) | negative **scalar** | `d-3` *−3* (obj); `z-` *some negative amount*; `g-2` signed measure on a noun | **`u`** ≈ undo |
| **e** (`#`) | **ordinal** / rank **from the start** | `g#2` *the second page*; `g#` *some rank*; `z#2` *second* (rank as subject) | **`e`** ≈ order |
| **o** (`_`) | **digit-string** / label (phones, IDs, “read the digits”) | `d_5551234`; `d_` *some code*; `g_12` *room 12*-style; `b_…` under a host relation | **`o`** ≈ one (one string) |

Each number word is one kind of number, set by its marker. In preferred writing, the marker is **`+`** / **`-`** / **`#`** / **`_`**.

#### Sign {#sign}

| Identity | How sign works |
|----------|----------------|
| **Scalar** (`a` / `u`, written `+` / `-`) | Sign **is** **V**. Multi-group scalars share one sign for the whole word (e.g. −1 000 265 004 is one **`ru`** word). |
| **Forward ordinal** (`e`, written `#`) | Direction *from the start* |
| **Digit-string** (`o`, written `_`) | Labels are unsigned. |

### Number endings {#number-endings}

Beginner already used exact **-l**. The other endings mark *about*, a conventional title, or a repeat of a number you already gave. Speech keeps the ending letter. Shorthand writing shows the ending as a mark right after the role letter (the same marks as on [spans](/spans)).

<!-- cheat-sheet: numbers -->
| Written | Spoken | Use | Cue |
|---------|--------|-----|-----|
| *(none)*: `g+3`, `g+` | **-l** | exact, newly stated (default) | **-l** stands behind the amount |
| **`~`** after PoS: `g~+3`, `g~+` | **-m** | approximate / non-literal (“about N”) | **-m** leaves the hold open |
| **`@`** after PoS: `g@#2` | **-n** | conventional designation (titles, official labels, *the Second…*) | **-n** names the number |
| **`=`** after PoS: `g=+3`, `g=#2`, `d=_12` | **-r** | resume of a previously stated number, code, or rank (at least one digit) | **-r** points back |

A resume needs **at least one digit**: `grager` = *that three again*; `gredor` = *that second one again*. Use the same marker as the number you repeat. Digitless **-r** (`grar`) is not a resume: like a standalone join **-r**, it is *some number* in a statement and *which number?* in a question. **`=`** is never combined with **`~`** or **`@`**.

> `zolazun dragel vawebol. zuzozen drager vawebol.`
> z-Olazun | d-three | v-see . z-Uzozen | d-←three | v-see
>
> "Olazun sees three. Uzozen sees those three too."

### Writing (preferred shorthand) {#writing-preferred-shorthand}

Beginner spelled every number out (`gragel`, `gradomol`). Writing also has a **shorthand** for the ending, marker, and body: `g+3` for `gragel`, `g+20` for `gradomol`. Both writings name the same word. Running text uses shorthand once a number has two or more digits; zero, one digit, or none stays spelled. Tables use shorthand for every row, so patterns line up.

```text
[PoS] + [~|@|=]? + [marker] + [body?]
```

#### Ending marks (second slot, after PoS)

These are the same marks, with the same meanings, as on [spans](/spans#writing): **`~`** soft, **`@`** proper. A resume uses **`=`**.

<!-- cheat-sheet: numbers -->
| Mark | Speech ending | Job | Examples |
|------|---------------|-----|----------|
| *(none)* | **-l** | exact (default) | `g+3`, `g+`, `g#2`, `d_12` |
| **`~`** | **-m** | approximate / soft | `g~+3`, `g~+`, `g~+12`, `g~#2` |
| **`@`** | **-n** | conventional | `g@#2`, `g@_12` |
| **`=`** | **-r** | resume (digit) / blank | `g=+3`, `g=#2`, `g=+` |

A hedged conventional number (both **`@`** and **`~`**) is written with **`@`** only, as on spans. **`=`** is never combined with another mark. A spelled word shows its ending as the last letter (`gragel`, `gram`) instead of a mark.

#### Marker (not written as `r`+V)

| Symbol | Speech | Meaning |
|--------|--------|---------|
| **`+`** | `ra` | Positive scalar |
| **`-`** | `ru` | Negative scalar |
| **`#`** | `re` | Ordinal (from the start) |
| **`_`** | `ro` | Digit-string |

Put the marker symbol **right after** the ending mark (or right after the role letter when there is no mark), **before the digits** (or last, when there are no digits): `g+3`, `g~+3`, `g=+`, `d_12`, `d=_`, `g@#2`. A **`_`** label never takes a sign ([Sign](#sign)).

#### Body

| Speech | Preferred writing |
|--------|-------------------|
| *(no digit groups)* | *(empty after marker)* `g+`, `g~-`, `g=#`, `d_` |
| Digit syllables (`ba`…`mo`) | Arabic **`0`–`9`** |

For long values, break into digit groups of at most three mantissa digits; all groups still sit in **one** word after a single marker.

#### Starter examples {#starter-examples}

Common values in shorthand, as tables write them. Speech always uses the fully spelled form.

<!-- cheat-sheet: numbers -->
| Value | Writing | Reading |
|-------|---------|--------|
| plural / more than one | `g+` | *more than one* (digitless **`ra`**) |
| three (modifier) | `g+3` | *three* (on a noun) |
| three (subject) | `z+3` | *three* |
| −3 (object) | `d-3` | *−3* |
| second (modifier) | `g#2` | *the second* |
| about 3 | `g~+3` | approximate (**-m**) |
| how many? / some amount | `g=+` | digitless **-r** blank |
| that three again | `g=+3` | **-r** resume (needs a digit) |
| room 12 | `g_12` | digit-string label |

#### Style (numeric vs spelled) {#writing-style}
<a id="writing-style-numeric-vs-spelled"></a>

Both writings name the **same word**. Choose the surface by one test: **how many digits does the word have?** Count every digit, including exponent digits.

| Word | Prefer | Why |
|------|--------|-----|
| Free number with **two or more digits** | **shorthand** | `g+12`, `g#12`: a value to scan and compare |
| Free number with **one digit or none** | **spelled** | `gragel` *three*, `gredol` *second*, `gramol` *zero*, `gral` *more than one*, `drar` *how many*; reads as a word, as English writes *three* |
| Digit-string label or code (`_`) | **shorthand** | `d_5`, `d_12`: a code, not an amount (English *Room 5*) |
| Numeric prefix | **spelled** (required) | shorthand before **`x`** and a root does not form a word |
| Inventory tables | **shorthand** | patterns are easy to scan |

**Side by side:** number words next to each other (a range, a list of values) share one writing. If any of them needs shorthand, write them all in shorthand: `z+3 al z+12`, not `zragel al z+12`.

Speech and writing drills that teach the shorthand itself still show one-digit shorthand.

A free number in shorthand shows its ending as a mark after the role letter (`g~+3`); spelled out, it shows the ending as its last letter (`gragem`). A number built onto a content root is always spelled out (`NUM`) and never takes the marks **`~`** / **`@`** / **`=`**.

### Number as verb / adverb / interjection / discourse
<a id="number-as-roles"></a>

You can use a number as the **action** (*add three*), as **how often** (*three times*), as **how likely** (*70% likely*), as a **shout** (*Three more!*), as a **list label** (*point 2:*), or as a **place on a scale** (*second biggest*). Put the same number word on `/v/`, `/h/`, `/th/`, `/y/`, `/x/`, or `/w/`. The role letter picks the use; the marker still says count, rank, or code.

On `/ɡ/`, `/z/`, `/d/`, and `/b/`, the number stays a plain amount, rank, or code ([marker vowel](#marker-vowel-referential-identity)).

#### Number as verb (by marker) {#number-as-verb-by-marker}

On `/v/`, the marker decides which action the number names.

| Marker | Verb sense |
|--------|------------|
| **`ra`** | **Add N / increase by N**: transitive *add N of (object)* / *increase (object) by N*; intransitive *grow by N* when the patient is clear from context. |
| **`ru`** | **Remove N / decrease by N**: transitive *remove N of (object)* / *decrease (object) by N*; intransitive *shrink by N*. |
| **`re`** | **Take / assign rank N (from the start)**: intransitive *place Nth* / *come in Nth*; transitive *put (object) in Nth place* / *rank as Nth*. |
| **`ro`** | **Enter / dial / input that digit-string**: type the code, dial the phone number, key the ID. Object (if any) is the channel or device; the digits are in the verb. |

To set a quantity to a value, use an ordinary verb with the number as its object or as an adverb. For *multiply* and *divide*, use an ordinary verb plus **`h+N`** / **`h-N`**.

Endings still apply (**-m** ≈ *about* that amount/code/rank, **-r** resume with a digit; digitless `vrar` / `vror` is a blank).

#### Number as adverb (by marker) {#number-as-adverb-by-marker}

On `/h/`, the marker decides what kind of adverb the number is.

| Marker | Writing | Adverb sense |
|--------|---------|--------------|
| **`ra`** | `h+N` | **Multiplicative / factor**: *N times*; *×N*; *by a factor of N* (alone, or with ordinary *multiply*). |
| **`ru`** | `h-N` | **Inverse / partition**: *÷N*; *into N parts*; *1/N as often*; *every Nth* (alone, or with ordinary *divide*). |
| **`re`** | `h#N` | **Nth occurrence of the event (from the start)**: *for the Nth time*; *on the Nth try* (clause-event ordinal, not discourse list independence). |
| **`ro`** | `h_…` | **Clock** and **date** (a calendar ordinal). Channel, frequency, and other codes use a host relation + `/b/` (or `/ɡ/` on a noun). |

> `zolazun vowurel hragel.`
> z-Olazun | v-walk | h-three
>
> "Olazun walks three times."

Worked examples: `hragel` *three times*; `hrugel` *÷3 / into 3*; `hregel` *for the third time*. A frequency code goes after a relation word: *on* (on `/h/`) + `b_101`.

Endings still apply (**-m** ≈ *about* that many times / that clock or date, **-r** resume with a digit; digitless `hrar` *how many times?* / `hror` *when?* is a blank). Relative %-change factors use **`h+…`** (e.g. ×1.5).

#### Number as interjection (by marker) {#number-as-interjection-by-marker}

On `/y/`, a number is a **shout** (*Three more!*, a score). Number cheers sit with the other opening `/y/` words (before the act word, when a clause follows) or alone as a whole turn with no act word.

| Marker | Writing | Interjection sense |
|--------|---------|-------------------|
| **`ra`** | `y+N` | **Quantity addition**: *Three more!*; *Ten more!* (add N to the relevant count / tally / order). |
| **`ru`** | `y-N` | **Deficit / shortfall call**: *Three short!*; *Three fewer!*; *Down by 2!*; *−3!* (mirror of `y+`). |
| **`re`** | `y#N` | **Place / rank cheer (from the start)**: *First!*; *Second!* (podium / place shout). |
| **`ro`** | `y_…` | **Digit-label / magnitude call-out**: *Three!*; *B-12!*; *five-five-five!*; score, bingo, code, or ID as a bare reading of the digits (not “N more”). |

English *Three!* naming a score or count is **`yrol`**. *Three more!* (increment the tally) is **`yral`**.

Worked examples: `y_3` *Three!*; `yragel` *Three more!*; `yrugel` *Three short!*; `yrebal` *First!*.

Endings still apply (**-m** fuzzy *about three more!*, **-n** conventional call name, **-r** resume a prior shout’s value, with a digit).

**Compare with:** statement / question / command words in the [speech-act section](/firm-soft#speech-act).

#### Number as discourse marker (by marker) {#number-as-discourse-marker-by-marker}

To number the points of a list (*point 2:*, *firstly*) or to cite a label (*item 12*), put the number on `/x/`, the linker that opens a sentence. The marker says how the point stands toward the other points: **`#`** is a plain numbered step, **`+`** backs up an earlier point, and **`-`** is a new, independent line of support. **`_`** cites a label instead. None of these is part of the sentence's own roles, unlike `/ɡ/` *the second page* or `/h/` *three times*.

| Marker | Writing | Discourse sense |
|--------|---------|-----------------|
| **`re`** | `x#N` | **Neutral point N**: numbered item from the start, no independence framing (*point N:*, *note N:*, bare *(N)*). |
| **`ra`** | `x+N` | **Corroborating item N**: backs, restates, or same-directions an earlier item (*corroborating N:*, *echoing N:*). Legitimate for emphasis, clarity, teaching, or a related source, not a new line of support. |
| **`ru`** | `x-N` | **Independent item N**: a new line of support or consideration (*independent N:*, *distinct N:*). Would still matter if other listed items were gone. |
| **`ro`** | `x_…` | **Cite a discourse label**: agenda item, section code, slide, ticket id (digits as label, not independence framing) (*regarding item 12; under 3.2*). |

Ordinary *firstly* / *secondly* is **`x#N`**. The marker does not say whether a point argues for or against; say that in ordinary words (or with evidentiality on the claim).

Worked examples: `xredol` *point 2:*; `xradol` *corroborating 2:*; `xrudol` *independent 2:*.

Endings still apply (**-l** newly stated item, **-r** *as in (N) above* (with a digit; digitless `xrer` is a blank), **-n** titled item name, **-m** fuzzy *around item N*).

#### Number as degree (by marker) {#number-as-degree}
<a id="place-on-a-scale"></a>

On `/w/`, a number sits in the degree slot right before an adjective or adverb ([clause](/clause#adjective-detail-w)). Only the ordinal marker gives a new reading: **`w#N`** (N from 2) is the **place on that scale**, in a superlative frame (`zuzozen zel wredol gelazom` *Uzozen is the second biggest*). A count or a fraction on `/w/` (`w+3`) is not used: a factor goes on `/h/` (`hradol` *twice*, factor).

#### Number as stance (by marker) {#number-as-stance-by-marker}
<a id="likelihood"></a>

`/th/` + number is your [stance](/clause#stance-th) on the whole claim: how likely you think it is, or which numbered source it rests on. Spoken, it starts **`thr…`**, as in English *three*.

> `zolazun vowurel th+70.`
>
> 🔊 `zolazun vowurel thraremol.`
>
> z-Olazun | v-walk | th-70-percent-likely
>
> "Olazun is probably walking." (I'd put it at 70%)

| Marker | Writing | Stance sense |
|--------|---------|--------------|
| **`ra`** | `th+N` | **Likelihood N percent**: `th+70` *70% likely*; `th+99` *99% likely*. The digits are already a percent, 0–100; do not add `%`. |
| **`ra`** / **`ru`** | `th+` / `th-` | **likely** / **unlikely**, with no figure |
| **`ro`** | `th_N` | **According to source N**: a footnote, reference, or exhibit label (`th_3` *per [3]*). Digitless `th_` = *per a source* you do not name. |
| **`re`** | `th#N` | **N-th hand** (N from 2): how many hands stand between the event and you, on any channel that is not first-hand (`th#3` *third-hand*, a tertiary source). |

For *30% unlikely*, give the likelihood of the claim itself (`th+70`). A minus with digits (`th-N`) and an end-relative rank (`th#-N`) are not used, and neither is `th#1`: first-hand is a channel word.

Endings still apply: **-m** *about* that likelihood (`th~+70` *roughly 70%*), **-n** a conventional level (`th@+95` *at the 95% confidence level*), **-r** *the same likelihood as before* (`th=+70`); digitless `thrar` asks *how likely?* under question, and `threr` asks *how many hands?*

### Practice {#intermediate-practice}

Short drills for Intermediate. Try each item before opening **Show answer**. Use shorthand for two or more digits (`g+12`, `g#12`); spell zero, one digit, or none (`gragem`, `gredol`, `gral`).

**Setting:** a sports stadium

**New words:**

| English | Agebon | Cue |
|---------|--------|-----|
| *seat* | `ozohol` | 💺 |

**Review:**

| English | Agebon |
|---------|--------|
| *Uzozen* | `uzozen` |
| *Olazun* | `olazun` |
| *Ahelan* | `ahelan` |
| *trophy* | `odoral` |
| *see* | `vawebol` |
| *sit* | `vuhohol` |
| *run* | `varuvel` |
| *punch* | `vanuvul` |

#### English → Agebon {#intermediate-english-to-agebon}

**1.** *There are about three seats.*

::: details Show answer
`zozoholx gragem.`

z-seat-x | g-three.about
:::

**2.** *Olazun runs three times.*

::: details Show answer
`zolazun varuvel hragel.`

z-Olazun | v-run | h-three
:::

**3.** *Point 2: Uzozen sits.*

::: details Show answer
`xredol zuzozen vuhohol.`

x-2nd | z-Uzozen | v-sit
:::

**4.** *Olazun removes three from the score.*

::: details Show answer
`zolazun dodoram vrugel.`

z-Olazun | d-score | v-minus-three
:::

**5.** *Uzozen is probably throwing a punch.* (I'd put it at 70%)

::: details Show answer
`zuzozen vanuvul th+70.`

🔊 `zuzozen vanuvul thraremol.`

z-Uzozen | v-punch | th-70-percent-likely
:::

**6.** *Olazun sees three seats, and Uzozen sees those three.*

::: details Show answer
`zolazun dozoholx gragel vawebol xal zuzozen drager vawebol.`

[z-Olazun | [d-seat-x | g-three] | v-see | x-and | z-Uzozen | d-←three | v-see]
:::

#### Agebon → English {#intermediate-agebon-to-english}

**1.** `zredol dodoral vawebol.`

::: details Show answer
z-2nd | d-trophy | v-see

*The second one sees the trophy.*
:::

**2.** `y_3.`

::: details Show answer
🔊 `yrogel.`

y-_3

*Three!* (a score or label)
:::

**3.** `zahelan vuhohol hregel.`

::: details Show answer
z-Ahelan | v-sit | h-3rd

*Ahelan sits for the third time.*
:::

**4.** `zahelan dozoholx g~+30 vawebol.`

::: details Show answer
🔊 `zahelan dozoholx gragemom vawebol.`

z-Ahelan | [d-seat-x | g-30.about] | v-see

*Ahelan sees about thirty seats.*
:::

#### Pick one {#intermediate-pick-one}

**1.** *Olazun sees about four seats.* `zolazun dozoholx grahum vawebol.` or `zolazun dozoholx grahul vawebol.`

::: details Show answer
`zolazun dozoholx grahum vawebol.`

z-Olazun | [d-seat-x | g-four.about] | v-see

**-m** makes the number approximate; **-l** is exact.
:::

**2.** *Ahelan sees seat 5.* (its label) `zahelan dozohol grozal vawebol.` or `zahelan dozohol grazal vawebol.`

::: details Show answer
`zahelan dozohol grozal vawebol.`

z-Ahelan | [d-seat | g-_5.spelled] | v-see

A label is a digit string, marker **`ro`**; **`ra`** would count five.
:::

#### Fix it {#intermediate-fix-it}

**1.** *There is a fifth seat.* <!-- lint: error -->`zozohol grazal.`

::: details Show answer
`zozohol grezal.`

z-seat | g-5th

A place in a series is a rank, marker **`re`**; **`ra`** counts.
:::

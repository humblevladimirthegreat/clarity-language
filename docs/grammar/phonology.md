# Phonology and phonotactics
<a id="phonology"></a>

How to **sound out** Agazan. Each letter has one pronunciation. Syllables end with a consonant only at the end of the word (one rare number-word exception is under [Advanced](#singability-constraints)), so you know when words stop.

## Beginner {#beginner}

Pronounce each letter the same way every time. A **syllable** is one beat with one vowel. Spell the beats you actually say: a consonant starts a beat, and the last consonant of a content word (a word built on a root, such as a noun or verb) is where that word ends.

Write native Agazan in **lowercase**. Two vowel letters in a row are two syllables. Say each vowel as its own beat.

<!-- Sync: the IPA in the vowel and consonant tables must match LETTER_IPA in src/tts/phonemes.ts. Change both together. -->

### Vowels

Agazan has four vowel letters. In English, a vowel letter’s sound depends on the letters around it; each Agazan vowel always has the same sound.

The cue words below are pronounced as in Standard American English.

| Agazan | IPA | Cue |
|--------|-----|-----|
| `e` | /e̞/ <IpaPlay file="Mid_front_unrounded_vowel.ogg" label="e" /> | *bet* |
| `u` | /u/ <IpaPlay file="Close_back_rounded_vowel.ogg" label="u" /> | *boot* (no glide, like Spanish *tú*) |
| `o` | /o̞/ <IpaPlay file="Mid_back_rounded_vowel.ogg" label="o" /> | *Cambodia* (no glide, like Spanish *todo*) |
| `a` | /ä/ <IpaPlay file="Open_central_unrounded_vowel.ogg" label="a" /> | *spa* (like Spanish *casa*) |

Audio is from Wikimedia Commons under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). /u/ and /ä/ are by [Denelson83](https://commons.wikimedia.org/wiki/User:Denelson83), and /e̞/ and /o̞/ by [TFighterPilot](https://commons.wikimedia.org/wiki/User:TFighterPilot).

### Consonants

A consonant starts a syllable. Many consonants have a **voiced** sound (vocal cords buzzing, as in *zoo*) and an unvoiced one (as in *sea*), and Agazan treats the two as the same letter. Prefer the voiced sound so you can hold a sung note; the unvoiced one is fine for style.
<!-- Consonant order: lips (b m w v), tongue tip (d n z l r), y (palatal, between tongue tip and back), back (g h, then th as the "other h"), then the English false friend (x). Canonical alphabet / letter-name recitation follows this table (vowels e u o a first). -->

| Agazan | IPA | Cue | Unvoiced variant |
|--------|-----|-----|------------------|
| `b` | /b/ <IpaPlay file="Voiced_bilabial_plosive.ogg" label="b" /> | *be* | /p/ <IpaPlay file="Voiceless_bilabial_plosive.ogg" label="unvoiced b" />, *pay* |
| `m` | /m/ <IpaPlay file="Bilabial_nasal.ogg" label="m" /> | *me* | |
| `w` | /w/ <IpaPlay file="Voiced_labio-velar_approximant.ogg" label="w" /> | *we* | |
| `v` | /v/ <IpaPlay file="Voiced_labiodental_fricative.ogg" label="v" /> | *vie* | /f/ <IpaPlay file="Voiceless_labiodental_fricative.ogg" label="unvoiced v" />, *fee* |
| `d` | /d/ <IpaPlay file="Voiced_alveolar_plosive.ogg" label="d" /> | *do* | /t/ <IpaPlay file="Voiceless_alveolar_plosive.ogg" label="unvoiced d" />, *toe* |
| `n` | /n/ <IpaPlay file="Alveolar_nasal.ogg" label="n" /> | *no* | |
| `z` | /z/ <IpaPlay file="Voiced_alveolar_sibilant.ogg" label="z" /> | *zoo* | /s/ <IpaPlay file="Voiceless_alveolar_sibilant.ogg" label="unvoiced z" />, *sea* |
| `l` | /l/ <IpaPlay file="Alveolar_lateral_approximant.ogg" label="l" /> | *lie* | |
| `r` | /ɹ/ <IpaPlay file="Alveolar_approximant.ogg" label="r" /> | *red* | |
| `y` | /j/ <IpaPlay file="Palatal_approximant.ogg" label="y" /> | *yes* | |
| `g` | /ɡ/ <IpaPlay file="Voiced_velar_plosive.ogg" label="g" /> | *go* | /k/ <IpaPlay file="Voiceless_velar_plosive.ogg" label="unvoiced g" />, *kite* |
| `h` | /ɦ/ <IpaPlay file="Voiced_glottal_fricative.ogg" label="h" /> | *ahead* | /h/ <IpaPlay file="Voiceless_glottal_fricative.ogg" label="unvoiced h" />, *hat* |
| `th` | /ð/ <IpaPlay file="Voiced_dental_fricative.ogg" label="th" /> | *this* | /θ/ <IpaPlay file="Voiceless_dental_fricative.ogg" label="unvoiced th" />, *thin* |
| `x` | /ʒ/ <IpaPlay file="Voiced_palato-alveolar_sibilant.ogg" label="x" /> | *vision* (the *si*) | /ʃ/ <IpaPlay file="Voiceless_palato-alveolar_sibilant.ogg" label="unvoiced x" />, *shy* |

::: tip Remember
`x` sounds different from English *x*. The rest are familiar. `y` is always a consonant, never a vowel.
:::

`th` is **one letter** written with two characters. Agazan has no `t`, so `th` never means `t` followed by `h`.

Audio is from Wikimedia Commons under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) by [Peter Isotalo](https://commons.wikimedia.org/wiki/User:Peter_Isotalo), except /ɹ/ by [Erutuon](https://commons.wikimedia.org/wiki/File:Alveolar_approximant.ogg).

### Word edges

A content word ends in one of four consonants: `-l`, `-m`, `-n`, or `-r`. That last consonant is the audible end of the word. Inside the word, consonants start syllables. They do not close a syllable in the middle.

`azawan` = *a-za-wan*. `odogal` = *o-do-gal*.

## Intermediate {#intermediate}

::: tip Reminder:
Intermediate sections assume you have read the beginner sections of every page.
:::

### Phonotactics (word shape)
<a id="phonotactics"></a>

Beginner already used word edges: a content word ends in `-l` / `-m` / `-n` / `-r`. Here is the full shape of that word, in order, written as one lowercase token (`zazawan`).

| Agazan | Use | English |
|--------|-----|---------|
| Role letter | first letter | role in the clause (subject, verb, …) |
| Optional `l` after `/ɡ/` | adjective before the noun | `gl-` looks ahead to the next noun |
| Root(s) **V(CV)+** | content | start with a vowel; each later consonant starts a new syllable |
| Mid-word `x` | productive compound seam | joins two roots inside one word |
| Mid-word `th` | stance seam | joins a sake to its stance vowel ([sakes](sakes.md)), any other root to a scope vowel ([label scope](predication.md#label-scope)), or a direction to whose facing counts ([viewpoint laterals](roles.md#viewpoint-laterals)) |
| Dictionary stem (no `x`) | lexical compound | one long simple-looking root (`ebedalahaza` *bedroom*) |
| `-l` / `-m` / `-n` / `-r` | [word ending](word-endings.md) | audible end of the content word |
| Name instance **`-ln`** | [one of a name](word-endings.md#name-instance--ln) | word-final coda `ln` |
| Optional `-x` | [plural](plurality.md) after the suffix | word-final `-lx` / `-mx` / `-nx` / `-rx` / `-lnx` (letter `x`) |
| Stand-in **`-rl` / `-rm`** | [dependent clauses](dependents.md#dependent-clauses) | word-final coda `rl` / `rm` |
| Backward stand-in **`-rth`** | [pointing back](dependents.md#stand-in-back) | word-final coda `rth`; the only word-final `th` |

A syllable ends with a consonant only at the **end of the word**. In a fused extra-noun [hook compound](hooks.md#hook-compounds), the cited **-l** / **-m** starts the hook's syllable, because the hook begins with a vowel. Inside a root, `l` and `r` always have a vowel after them, so they start a syllable rather than sounding like a suffix (`zubuhel`: prefix `z`, root `ubuhe`, ending `-l`). Each spelling has only one pronunciation. Writing does not mark stress. Musical rhythm may still place emphasis.

**Related form:** word-initial `x` is the [continue](dependents.md#continue-x) prefix (discourse), not a compound seam.

### Number-word exception {#number-word-exception}

When English says *how many* or *which place*, Agazan uses a [number word](numbers.md). A number word puts `r` right after the role letter. Ordinary words never have that cluster, because their roots start with a vowel, so a role letter followed directly by `r` tells you a number is coming. The marker is `ra`, `ru`, `re`, or `ro`; counting from the end is written `#-`, spelled and spoken **rue** before the digits. Two vowels in a row stay two separate syllables.

> `zagadulx grarel.`
>
> z-cat-x | g-three
>
> "Three cats."

`grarel` is `g` + `ra` + digit `re` + `-l`. In a long number, each written comma is spoken as a [group separator](numbers.md#group-separator), **`th`** plus the marker’s vowel.

**Compare with:** ordinary endings on content words use [word ending](word-endings.md) senses. Number words reuse those same four letters with [number-specific endings](word-endings.md#number-word-exception).

### Letter names {#letter-names}
<a id="letter-names-and-digits"></a>

When you **spell a word aloud** or **name a letter**, say the Agazan name for it. Pause between names so two names do not run into one syllable.

| Agazan | Name | Cue |
|--------|------|-----|
| `e` | `e` | *bet* |
| `u` | `u` | *boot* |
| `o` | `o` | *Cambodia* (no glide) |
| `a` | `a` | *father* |
| `b` | `be` | *beg* |
| `m` | `me` | *met* |
| `w` | `we` | *wet* |
| `v` | `vu` | *voodoo* |
| `d` | `da` | *Dada* |
| `n` | `nu` | *noon* |
| `z` | `ze` | *zen* |
| `l` | `lo` | *low* |
| `r` | `ro` | *row* |
| `y` | `ya` | *yacht* |
| `g` | `ga` | *gaga* |
| `h` | `hu` | *who* |
| `th` | `tha` | *that* |
| `x` | `xe` | *shed* |

```text
`agadu` → `a` `ga` `a` `da` `a`
```

In a clause, a letter you talk about (such as `z`) is a [mention](spans.md#mention); read it aloud by its letter name (`ze`).

Ten letters also begin a [digit syllable](numbers.md#counts). The letter name uses the **opposite** vowel (`a`↔`u`, `o`↔`e`), so naming the letter is not the same as counting.

| Agazan | Digit syllable | Name | Cue |
|--------|----------------|------|-----|
| `w` | `wo` (1) | `we` | `o` ↔ `e` |
| `d` | `du` (2) | `da` | `u` ↔ `a` |
| `r` | `re` (3) | `ro` | `e` ↔ `o` |
| `m` | `mo` (4) | `me` | `o` ↔ `e` |
| `v` | `va` (5) | `vu` | `a` ↔ `u` |
| `g` | `gu` (6) | `ga` | `u` ↔ `a` |
| `l` | `le` (7) | `lo` | `e` ↔ `o` |
| `h` | `ha` (8) | `hu` | `a` ↔ `u` |
| `n` | `na` (9) | `nu` | `a` ↔ `u` |
| `z` | `zo` (0) | `ze` | `o` ↔ `e` |

## Advanced {#advanced}

### Singability constraints {#singability-constraints}

These choices about word shape make Agazan easier to sing:

| Constraint | Why it helps | How Agazan keeps it |
|------------|--------------|---------------------|
| Mostly mid-to-open vowels | Close vowels lose support on high notes, so they shrink a comfortable high range | Three mid-to-open vowels (/e̞ o̞ ä/) plus close /u/; no /i/ |
| Vowels far apart | Singers open vowels on high notes; well-spaced vowels stay recognizable when they shift | Four of the five classical singing vowels: central /ä/, mid /e̞/ and /o̞/, and corner /u/, which keeps the **u** ≈ undo vowel (negation, prohibition) clearly apart from **a** and **o** |
| Pure vowels | A vowel that glides into another (English *go*, *day*) changes tone on a held note | Mid /e̞/ and /o̞/ sit away from the English glides /eɪ/ and /oʊ/, so learners hold them steady |
| One vowel per letter | Sliding from one vowel to another mid-note forces the mouth to change | Stacked vowels = separate syllables |
| Few consonant clusters | Clusters are harder to say quickly | Ordinary shape is consonant-then-vowel at the start of a syllable; limited clusters below |
| Voiced preferred | Voiceless stops cut the note; singers often voice them anyway | Voiced preferred; unvoiced allowed as style only |
| No mid-word syllable-final consonant | Ending a syllable on a consonant breaks a held note | Roots are **V(CV)+**; a final consonant only at the **word edge** or a lexical join (**-l** / **-m**) before a number marker `r` |
| No lexical stress | Music already places emphasis | Rhythm may stress a beat; spelling does not encode stress |
| Spelling = pronunciation | You do not memorize special readings | One path from letters to sound |
| Audible word edges | Song often removes speech pauses | Content words end in `-l` / `-m` / `-n` / `-ln` / `-r` (optional `-x`); stand-ins end in `-rl` / `-rm` |

On high notes, **u** may open toward [ʊ] (as in *book*); that is still **u**.

Legal clusters: left-hanging `gl-`; number-word role letter + `r`; lexical join **-l** / **-m** plus number marker `r` on a [kind morph](numeric-derivation.md); word-final `-lx` / `-mx` / `-nx` / `-rx`; name instance `-ln` / `-lnx`; stand-in `-rl` / `-rm` / `-rth`. The lexical join before `r` is the only syllable-final consonant inside a word.

Try singing a short Agazan line quickly at a high but comfortable pitch:

`zazawan gamadam.`

/ zä.zä.wän ɡä.mä.däm /

A line that piles up close vowels, clusters, and mid-word stops is harder to sustain even when it is only a little harder to speak:

/ seiɹ ˈʈʂuɹt tis ˈheb.ɡiɹn fuofts /

## See also

- Citation (root + ending, no sentence): [word-endings.md](word-endings.md)
- Role letters in a clause: [clause.md](clause.md#role-letters)
- Numbers (PoS+`r` exception and [digit syllables](numbers.md#counts)): [numbers.md](numbers.md)
- Mention spans (letter as form in a clause): [spans.md](spans.md)
- Mid-word `x` and `th`: [x-compounds.md](x-compounds.md)

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
| `u` | /ʉ/ <IpaPlay file="Close_central_rounded_vowel.ogg" label="u" /> | *you* (without the *y*) |
| `a` | /ä/ <IpaPlay file="Open_central_unrounded_vowel.ogg" label="a" /> | *spa* (like Spanish *casa*) |
| `o` | /o̞/ <IpaPlay file="Mid_back_rounded_vowel.ogg" label="o" /> | *Cambodia* (no glide, like Spanish *todo*) |
| `e` | /e̞/ <IpaPlay file="Mid_front_unrounded_vowel.ogg" label="e" /> | *bet* |

Audio is from Wikimedia Commons under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). /ʉ/ and /ä/ are by [Denelson83](https://commons.wikimedia.org/wiki/User:Denelson83), and /e̞/ and /o̞/ by [TFighterPilot](https://commons.wikimedia.org/wiki/User:TFighterPilot).

#### Opposite vowels {#opposite-vowels}

The four vowels form two **opposite** pairs. Within a pair, the tongue moves along one line and the lips change shape:

| Pair | Tongue | Lips |
|------|--------|------|
| `u` ↔ `a` | high ↔ low, centered | rounded ↔ relaxed |
| `o` ↔ `e` | back ↔ front, same height | rounded ↔ spread |

To find `u`, start from `a`: keep the tongue centered, close the jaw, and round the lips. To find `o`, start from `e`: keep the jaw where it is, pull the tongue back, and round the lips. Moving between the two vowels of a pair is a small step.

### Consonants

A consonant starts a syllable. Many consonants have a **voiced** sound (vocal cords buzzing, as in *zoo*) and an unvoiced one (as in *sea*), and Agazan treats the two as the same letter. Prefer the voiced sound so you can hold a sung note; the unvoiced one is fine for style.
<!-- Consonant order is alphabet order: the ten digit letters in digit order (w d r m v g l h n z = 1–9, 0), then b y th x. The alphabet / letter-name recitation ends with the vowels u a o e, the same order as vowel stacks. -->

| Agazan | IPA | Cue | Unvoiced variant |
|--------|-----|-----|------------------|
| `w` | /w/ <IpaPlay file="Voiced_labio-velar_approximant.ogg" label="w" /> | *we* | |
| `d` | /d/ <IpaPlay file="Voiced_alveolar_plosive.ogg" label="d" /> | *do* | /t/ <IpaPlay file="Voiceless_alveolar_plosive.ogg" label="unvoiced d" />, *toe* |
| `r` | /ɹ/ <IpaPlay file="Alveolar_approximant.ogg" label="r" /> | *red* | |
| `m` | /m/ <IpaPlay file="Bilabial_nasal.ogg" label="m" /> | *me* | |
| `v` | /v/ <IpaPlay file="Voiced_labiodental_fricative.ogg" label="v" /> | *vie* | /f/ <IpaPlay file="Voiceless_labiodental_fricative.ogg" label="unvoiced v" />, *fee* |
| `g` | /ɡ/ <IpaPlay file="Voiced_velar_plosive.ogg" label="g" /> | *go* | /k/ <IpaPlay file="Voiceless_velar_plosive.ogg" label="unvoiced g" />, *kite* |
| `l` | /l/ <IpaPlay file="Alveolar_lateral_approximant.ogg" label="l" /> | *lie* | |
| `h` | /ɦ/ <IpaPlay file="Voiced_glottal_fricative.ogg" label="h" /> | *ahead* | /h/ <IpaPlay file="Voiceless_glottal_fricative.ogg" label="unvoiced h" />, *hat* |
| `n` | /n/ <IpaPlay file="Alveolar_nasal.ogg" label="n" /> | *no* | |
| `z` | /z/ <IpaPlay file="Voiced_alveolar_sibilant.ogg" label="z" /> | *zoo* | /s/ <IpaPlay file="Voiceless_alveolar_sibilant.ogg" label="unvoiced z" />, *sea* |
| `b` | /b/ <IpaPlay file="Voiced_bilabial_plosive.ogg" label="b" /> | *be* | /p/ <IpaPlay file="Voiceless_bilabial_plosive.ogg" label="unvoiced b" />, *pay* |
| `y` | /j/ <IpaPlay file="Palatal_approximant.ogg" label="y" /> | *yes* | |
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

<!-- cheat-sheet: sounds-spelling -->
| Agazan | Use | English |
|--------|-----|---------|
| Role letter | first letter | role in the clause (subject, verb, …) |
| Optional `l` after `/ɡ/` | adjective before the noun | `gl-` looks ahead to the next noun |
| Root(s) **V(CV)+** | content | start with a vowel; each later consonant starts a new syllable |
| Mid-word `x` | productive compound seam | joins two roots inside one word |
| Mid-word `th` | stance seam | joins a sake to its stance vowel ([sakes](sakes.md)), any other root to a scope vowel ([label scope](predication.md#label-scope)), or a direction to whose facing counts ([viewpoint laterals](roles.md#viewpoint-laterals)) |
| Dictionary stem (no `x`) | lexical compound | one long simple-looking root (`ebedaluruhe` *bedroom*) |
| `-l` / `-m` / `-n` / `-r` | [word ending](word-endings.md) | audible end of the content word |
| Name instance **`-ln`** | [one of a name](word-endings.md#name-instance--ln) | word-final coda `ln` |
| Optional `-x` | [plural](plurality.md) after the ending | word-final `-lx` / `-mx` / `-nx` / `-rx` / `-lnx` (letter `x`) |
| Stand-in **`-rl` / `-rm`** | [dependent clauses](dependents.md#dependent-clauses) | word-final coda `rl` / `rm` |
| Backward stand-in **`-rth`** | [pointing back](dependents.md#stand-in-back) | word-final coda `rth`; the only word-final `th` |

A syllable ends with a consonant only at the **end of the word**. Inside a root, `l` and `r` always have a vowel after them, so they start a syllable rather than sounding like a suffix (`zubuhel`: prefix `z`, root `ubuhe`, ending `-l`). Each spelling has only one pronunciation. Writing does not mark stress. Musical rhythm may still place emphasis.

Some short grammar words stack two vowels (a join such as **ua**). A stack always puts its vowels in [alphabetical order](#letter-names) (**u**, **a**, **o**, **e**): **u** comes first and **e** comes last. That gives six stacks: **ua**, **uo**, **ue**, **ao**, **ae**, and **oe**. The two vowels stay two separate syllables.

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

The table is in **alphabetical order**. The ten letters that begin a [digit syllable](#digit-letters) come first, in digit order (1 to 9, then 0), so `w` is the first letter and `z` the tenth. The other consonants follow, and the vowels come last.

<!-- cheat-sheet: sounds-spelling -->
| Agazan | Name | Cue |
|--------|------|-----|
| `w` | `we` | *wet* |
| `d` | `da` | *Dada* |
| `r` | `ro` | *row* |
| `m` | `me` | *met* |
| `v` | `vu` | *voodoo* |
| `g` | `ga` | *gaga* |
| `l` | `lo` | *low* |
| `h` | `hu` | *who* |
| `n` | `nu` | *noon* |
| `z` | `ze` | *zen* |
| `b` | `be` | *beg* |
| `y` | `ya` | *yacht* |
| `th` | `tho` | *though* (no glide) |
| `x` | `xu` | *shoe* |
| `u` | `u` | *you* (without the *y*) |
| `a` | `a` | *spa* |
| `o` | `o` | *Cambodia* (no glide) |
| `e` | `e` | *bet* |

```text
`agadu` → `a` `ga` `a` `da` `a`
```

In a clause, a letter you talk about (such as `z`) is a [mention](spans.md#mention); read it aloud by its letter name (`ze`).

<a id="digit-letters"></a>
Ten letters also begin a [digit syllable](numbers.md#counts). The letter name uses the [opposite vowel](#opposite-vowels) (`a`↔`u`, `o`↔`e`), so naming the letter is not the same as counting.

<!-- cheat-sheet: sounds-spelling -->
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
| One vowel per letter | Sliding from one vowel to another mid-note forces the mouth to change | Stacked vowels = separate syllables |
| Few consonant clusters | Clusters are harder to say quickly | Ordinary shape is consonant-then-vowel at the start of a syllable; limited clusters below |
| Voiced preferred | Voiceless stops cut the note; singers often voice them anyway | Voiced preferred; unvoiced allowed as style only |
| No mid-word syllable-final consonant | Ending a syllable on a consonant breaks a held note | Roots are **V(CV)+**; a final consonant only at the **word edge** or a lexical join (**-l** / **-m**) before a number marker `r` |
| No lexical stress | Music already places emphasis | Stress always falls on the same beat ([rhythm and stress](#rhythm-and-stress)); spelling does not mark it, and music may move it |
| Spelling = pronunciation | You do not memorize special readings | One path from letters to sound |
| Audible word edges | Song often removes speech pauses | Content words end in `-l` / `-m` / `-n` / `-ln` / `-r` / `-rl` / `-rm` (optional `-x`); stand-ins end in `-rl` / `-rm` / `-rth` |

Legal clusters: left-hanging `gl-`; number-word role letter + `r`; [tag pronoun](pronouns.md#tag-pronouns) role letter + `w` (`zw`, `dw`, `bw`); lexical join **-l** / **-m** plus number marker `r` on a [kind morph](numeric-derivation.md); word-final `-lx` / `-mx` / `-nx` / `-rx`; name instance `-ln` / `-lnx`; stand-in and sense-pinned resume `-rl` / `-rm`, stand-in `-rth`. The lexical join before `r` is the only syllable-final consonant inside a word.

Try singing a short Agazan line quickly at a high but comfortable pitch:

`zazawan gamadam.`

/ zä.zä.wän ɡä.mä.däm /

A line that piles up close vowels, clusters, and mid-word stops is harder to sustain even when it is only a little harder to speak:

/ seiɹ ˈʈʂuɹt tis ˈheb.ɡiɹn fuofts /

### Rhythm and stress {#rhythm-and-stress}

Give every syllable about the same length, and keep its vowel full however fast you talk. English weakens unstressed vowels to *uh* (the second *a* in *banana*). Agazan never does, because many words differ by one vowel (`val`, `vol`, `vul`), and weak vowels would make them sound alike.

Each word takes a light stress on its **first syllable**. Since the rule never changes, spelling does not mark it. The ending consonant already tells a listener where a word stops; the stressed first beat tells them where the next one starts, so fast speech still splits into words. A [number word](numbers.md) stresses the last digit of each group instead.

`zazawan gamadam.`

/ ˈzä.zä.wän ˈɡä.mä.däm /

**Hold the ending.** Let the final `-l`, `-m`, `-n` or `-r` sound for a moment instead of clipping it. It is often the only difference between two words (`vul`, `vum`, `vur`), and all four are sounds you can hold. In singing, put the cutoff on it.

### Words never said quietly {#never-quiet}

English swallows small words that change the meaning: *can* and *can't* often differ by one weak sound, and *I think* is usually mumbled. In Agazan, give these words their full stress even when the words around them are light:

| Words | Why |
|-------|-----|
| Negation: the **u** joins ([negation](joins.md#negation-u)) | Missing one flips the claim |
| [MAY](knowing.md#may) and its hold endings | Missing one makes a guess sound certain |
| [How you know](knowing.md#evidentiality) and [how strong the evidence is](knowing.md#evidence-strength) | Missing one hides where the claim came from |
| The kind of *can't* ([ability](intention.md#ability)) | Missing one turns *not right now* into *not ever* |

### Voice and certainty {#voice-and-certainty}

Only the words and the written [tone marks](speech-moves.md#tone-marks) carry meaning. How firmly you stand behind a claim is the ending on the [act word](speech-moves.md#speech-act); how sure you are is [MAY](knowing.md#may). Your pitch may agree with them, but an unwritten rise or fall adds nothing. A statement said with a rising voice is still a statement, and a firm **-l** claim said hesitantly is still firm.

So listen to the words, not the voice. A speaker whose voice naturally rises at the end is not hedging, and a confident voice is not evidence.

### Speech edges {#speech-edges}

Each edge in a sentence has its own sound. From smallest to largest:

| Edge | Voice | Taught in |
|------|-------|-----------|
| Word | Stress on the first syllable, ending held | [rhythm and stress](#rhythm-and-stress) |
| Item in a list, before the join word | Level pitch, no fall: more is coming | [right-close fence](joins.md#right-close) |
| Join word that ends a list | Fall | [right-close fence](joins.md#right-close) |
| Scope island | Brief pitch reset, one tight phrase, pause after its last word | [scope islands](spans.md#scope-islands) |
| `/x/` continue, linker, stand-in | Dip, no pitch reset | [periods](dependents.md#orthography-and-prosody-periods) |
| Period | Fall on the last word, short pause | [periods](dependents.md#orthography-and-prosody-periods) |
| Topic word | Pitch reset; same speech act | [topic](pronouns.md#topic) |
| New `/y/` turn | Full pitch reset | [periods](dependents.md#orthography-and-prosody-periods) |

The level pitch on list items matters because the join word comes last: it lets a listener hear that a list is under way before the join arrives.

### Singing on one note {#one-note}

Every distinction Agazan makes is spelled in its letters, so a line sung on a single pitch still says everything it says in speech. When a melody takes over your pitch, voice each [tone mark](speech-moves.md#tone-marks) with how you shape the note:

| Mark | In speech | In song |
|------|-----------|---------|
| `!` | Louder, stressed | Accent: a stronger attack, louder |
| `?` | Rising, tentative | A lighter attack, slightly late |
| `%` | Light, smiling | Short and detached |
| `&` | Stressed and slowed | Held for its full length |
| `;` | Soft, gentle | Smooth and connected, softer |

### Thinking sounds {#thinking-sounds}

When you need a moment in the middle of speaking, English fills the gap with *um* or *uh*. Agazan has two sounds for that gap, and each tells the listener what would help. Neither is a word, and neither is written.

| Sound | Means | The listener | Cue |
|-------|-------|--------------|-----|
| *mmm*, lips closed | I am thinking it over | waits and leaves the silence | Lips closed: not ready to speak |
| A held `a`, `e` or `o` (any of them) | I know what I mean but cannot find the word | may offer a word | Mouth open: the word is on its way |

Do not hold `u`: it is the undo vowel, so a held `u` can sound like a denial. A thinking vowel is held well past one beat, so it does not sound like a [letter name](#letter-names), which is short and followed by a pause.

**Compare with:** a thinking sound only holds the gap. To fix a word you already said, use a hook: [`el`](hooks.md#rather) for a better wording of the same thing, [`ol`](hooks.md#instead) for the thing you meant instead.

## See also

- Citation (root + ending, no sentence): [word-endings.md](word-endings.md)
- Role letters in a clause: [clause.md](clause.md#role-letters)
- Numbers (role letter + `r` exception and [digit syllables](numbers.md#counts)): [numbers.md](numbers.md)
- Mention spans (letter as form in a clause): [spans.md](spans.md)
- Mid-word `x` and `th`: [x-compounds.md](x-compounds.md)

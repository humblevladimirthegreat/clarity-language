# Proposal: twelve-note chord channel

**Status:** REJECTED. On piano, the root changes at syllable rate, so the left hand jumps all over the keyboard, and the chromatic root movement can't be predicted from the text. Adopted instead: the pentatonic piano channel in `manual-phonology.md`, where neither hand moves and nothing clashes.  
**Related:** [phonology.md](/phonology) ([opposite vowels](/phonology#opposite-vowels), [letter names](/phonology#letter-names)); [numbers.md § Counts](/numbers#counts) (digit letters).

## Idea

Each syllable is one chord. Spoken and sung Agazan keep the normal phonology; this was an instrumental channel only.

### Roots and qualities

**Consonant = chord root.** For the 12 consonants found in roots, the root sits as many semitones above home (C) as the letter's digit. `b` and `y`, which are not digit letters, take 10 and 11.

| Letter | `z` | `w` | `d` | `r` | `m` | `v` | `g` | `l` | `h` | `n` | `b` | `y` |
|--------|---|---|---|---|---|---|---|---|---|---|---|---|
| Semitones | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
| Root | C | C♯ | D | E♭ | E | F | F♯ | G | A♭ | A | B♭ | B |

**Vowel = chord quality.** Each vowel feature becomes one chord tone:

| | Unrounded | Rounded (♭3) |
|---|---|---|
| Open / close pair: triad | `a` = major | `u` = minor |
| Mid pair: adds ♭7 | `e` = dominant 7 | `o` = minor 7 |

The two vowels of each opposite pair differ by one note, moved a semitone.

### `th` and `x`: frame families

`th` and `x` have no root. Each has its own chord family, and the vowel picks the chord. The anchor note is the vowel's place in the alphabet (`u a o e` = 0–3), counted in semitones above C.

| | `u` | `a` | `o` | `e` |
|---|---|---|---|---|
| `x` → augmented | C+ | C♯+ | D+ | E♭+ |
| `th` → sus4 | Csus4 | C♯sus4 | Dsus4 | E♭sus4 |

Outside a syllable, a pitched consonant is one bare note at its root. `th` and `x` play the signature interval of their family instead: `x` = C–G♯ and `th` = C–F.

### Syllable rules

| Spoken | Musical |
|--------|---------|
| Consonant + vowel | Chord, with the root struck |
| No onset | Keeps the previous onset and changes the quality legato, without re-striking: `xuen` = C+ → E♭+ |
| Onset cluster | Grace note or dyad for the first letter, then the chord |
| Coda | Bare held note or notes: `-n` = A, `-lx` = G, then C–G♯ |

All 56 chords have different sets of pitch classes, so voicing and inversion are free.

### Examples

- `zazawan gamadam.`: C · C · C♯ · *A held* ‖ F♯ · E · D · *E held*
- `xodum`: D+ · Dm · *E held*
- `thoyem`: Dsus4 · B7 · *E held*

## Why rejected

- **Hand movement.** The root changes on almost every syllable, so the left hand jumps between roots at speaking pace.
- **Sound.** All 12 roots get used, so a line has no key, and its chromatic root movement can't be predicted from the text.
- **Open problems at rejection:** `e` (frequent) made dominant 7ths everywhere; a syllable with no onset at the start of an utterance had no root to hold; and telling legato from a re-strike (`za·a` vs `zaza`) relied on fragile articulation.
- **Guitar** would have suited it better: the chords are standard shapes, and hammer-ons give the legato rule. That didn't outweigh the piano cost.

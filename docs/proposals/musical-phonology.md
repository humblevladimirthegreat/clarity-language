# Proposal: musical phonology (instrumental channel)

**Status:** PROPOSED. Nothing here is built.  
**Related:** [phonology.md](../grammar/phonology.md) (letters, [alphabet order](../grammar/phonology.md#letter-names), [opposite vowels](../grammar/phonology.md#opposite-vowels), [phonotactics](../grammar/phonology.md#phonotactics), [rhythm and stress](../grammar/phonology.md#rhythm-and-stress)); [numbers.md § Counts](../grammar/numbers.md#counts) (digit letters); [clause.md § Role letters](../grammar/clause.md#role-letters) (`/th/` stance); [dependents.md § Continue](../grammar/dependents.md#continue-x) (`/x/`); [`data/lexicon-published.csv`](../../data/lexicon-published.csv); `diphone-singing.md` (a separate tooling idea for sung speech); rejected alternative `musical-chords.md` (twelve-note chords).  
**Design authority:** none. Spoken and sung Agazan keep the normal phonology. This is a second way to sound the language on an instrument, like drummed or whistled speech. It adds no forms, readings, or spellings.

## Motivation

Agazan's spelling is phonemic, its syllables have a fixed shape, and its word edges can be heard, so a melody can stand in for its letters. An instrumental channel would let a pianist "say" a sentence, and a listener who knows the code could read it back. The code is meant to be **read and played**. Singing is not a goal here; singers use the spoken phonology.

The design: every note is a piano **black key**, so every sound belongs to one pentatonic scale (C♯ D♯ F♯ G♯ A♯) and nothing clashes. **Neither hand moves**: each hand rests over one octave of five black keys, starting on C♯ for now (see [open question 1](#open-questions)). The left hand plays vowels, and the right hand plays consonants as **abacus shapes**.

## What the channel must cover

- **18 letters:** 14 consonants (`w d r m v g l h n z b y th x`) and 4 vowels (`u a o e`).
- **`th` and `x` start words.** `/th/` is the stance role letter (`thoyem`) and `/x/` starts clause joins and linkers (`xan`, `xodum`). Both also occur as seams, in codas (`-x`, `-rth`), and in clusters (`xrebal`).
- **Syllables:** consonant + vowel; a syllable with no onset (vowel stacks such as `ua`, `xuen`); onset clusters (`gl-`, role letter + `r`, role letter + `w`).
- **Codas:** `-l -m -n -r`, optionally followed by `-x`, plus `-ln`, `-rl`, `-rm`, `-rth`.
- **Prosody:** equal syllable length and stress on the first syllable ([rhythm and stress](../grammar/phonology.md#rhythm-and-stress)).

## Left hand: vowels

The vowels repeat most often, so they go in the bass:

| Key | C♯3 | D♯3 | F♯3 | G♯3 | A♯3 |
|-----|-----|-----|-----|-----|-----|
| Vowel | `u` | `a` | `o` | `e` | spare |

Opposite vowels sit on neighboring keys. A letter name and its digit syllable (`da` / `du`) differ by moving one left-hand finger one key.

## Right hand: consonants (abacus hand)

Five keys can't carry 14 consonants as single notes without moving the hand. Single keys plus two-finger pairs can: 5 + 10 = 15 shapes. The thumb rests on C♯5 and fingers 2–5 on D♯5, F♯5, G♯5, A♯5.

The hands sit two octaves apart. That makes it obvious which hand a lone note belongs to (a coda or a syllable with no onset), and it keeps same-letter octaves (`vu`, `wa`, `do`, `re`) from blending into one note.

The thumb counts as five, like the five bead on an abacus:

| Shape | Letter | Digit |
|-------|--------|-------|
| Finger 2 / 3 / 4 / 5 alone | `w` `d` `r` `m` | 1 2 3 4 |
| Thumb alone | `v` | 5 |
| Thumb + finger 2 / 3 / 4 / 5 | `g` `l` `h` `n` | 6 7 8 9 |
| 2 + 5 (outer pair, empty middle) | `z` | 0 |
| 2+3, 3+4, 4+5 | `b` `y` `th` | |
| 2+4 | `x` | |
| 3+5 | spare | |

A digit's shape is its count, so number words come out naturally, and `th` and `x` are ordinary shapes with no special cases. The cost: the most frequent consonants in roots (`g`, `b`, `z`, `h`) are pairs.

**Alternative considered: frequency hand.** Single keys for the five most frequent consonants in roots (`g b d z h`), with the easiest pairs going to the next most frequent. It is faster to play but loses the digit logic and has to be learned as a table.

## Syllable rules

| Spoken | Piano |
|--------|-------|
| Syllable | One beat |
| Consonant + vowel | Both hands strike together |
| No onset | Left hand alone |
| Onset cluster | Grace shape in the right hand, then the syllable |
| Coda (`-n`, `-lx`, `-rth`, …) | Right hand alone; the last shape is held. The coda is the word's audible end, as in speech |
| Stress on the first syllable | Accent on the word's first beat |
| Period | Rest |

Each hand covers its own band, so these readings are always unambiguous. The white keys carry no letters and stay free for a later layer, such as periods, [tone marks](../grammar/speech-moves.md#tone-marks), or span fences.

## Examples

`zazawan gamadam.`

| Syllable | Right hand | Left hand |
|----------|------------|-----------|
| za | D♯5+A♯5 | D♯3 |
| za | D♯5+A♯5 | D♯3 |
| wa | D♯5 | D♯3 |
| -n | C♯5+A♯5, held | none |
| ga | C♯5+D♯5 | D♯3 |
| ma | A♯5 | D♯3 |
| da | F♯5 | D♯3 |
| -m | A♯5, held | none |

- `thoyem`: G♯5+A♯5 / F♯3 · F♯5+G♯5 / G♯3 · A♯5 held
- `xodum`: D♯5+G♯5 / F♯3 · F♯5 / C♯3 · A♯5 held

## Guitar adaptation

The piano shapes don't carry over to guitar. In any fretboard position, a pentatonic scale puts two notes on each string, so some consonant pairs would need one string to sound two notes at once. The changes:

- **Key:** G pentatonic (G A B D E) instead of the black keys, because the open D, G, B and E strings all belong to it.
- **Vowels:** played by the fretting hand alone, on G A B D on the low E and A strings.
- **Consonants:** which open treble strings (D G B E) the picking hand plucks. 4 single strings + 6 pairs + 4 triples = 14 shapes, one per consonant; all four strings is the spare. The fretting hand never holds a treble shape.
- **Unchanged:** the syllable rules (bass alone = no onset, treble alone = coda, accent on the first syllable).
- **Weak point:** four-string plucks need i-m-a plus the pinky, or hybrid picking. Triples that include the D string are slow unless the thumb sweeps the A and D strings together.

## Open questions

1. **Starting key:** Which black key should each hand start on? C♯ is a placeholder. The start changes which bass notes come up most: the frequent vowels `a` and `e` sit on fingers 2 and 4, so they land a fourth apart from a C♯ or F♯ start, and on tonic and major third (F♯ and A♯) from a D♯ start. The letter shapes stay the same whatever the start. Settle it by listening to demos of the same passages played from each start.
2. **Guitar:** Which consonant gets which string subset? An abacus order would keep the digit logic.
3. **Spares:** What should the spare shapes (left A♯3, right 3+5) and the white keys carry? Candidates: the period, `/y/` turns, tone marks.
4. **Speech edges:** The [speech edges](../grammar/phonology.md#speech-edges) (level pitch on list items, a reset at a new turn) need a rendering. Dynamics and rests are the natural tools.
5. **Tooling:** A player could render any parsed sentence from `src/tts/` phoneme output. That would make examples on the site audible.

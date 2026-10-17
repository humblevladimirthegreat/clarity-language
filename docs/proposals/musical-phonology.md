# Proposal: musical phonology (instrumental and signed channels)

**Status:** PROPOSED. Nothing here is built.  
**Related:** [phonology.md](../grammar/phonology.md) (letters, [alphabet order](../grammar/phonology.md#letter-names), [opposite vowels](../grammar/phonology.md#opposite-vowels), [phonotactics](../grammar/phonology.md#phonotactics), [rhythm and stress](../grammar/phonology.md#rhythm-and-stress)); [numbers.md § Counts](../grammar/numbers.md#counts) (digit letters); [clause.md § Role letters](../grammar/clause.md#role-letters) (`/th/` stance); [dependents.md § Continue](../grammar/dependents.md#continue-x) (`/x/`); [`data/lexicon-published.csv`](../../data/lexicon-published.csv); `diphone-singing.md` (a separate tooling idea for sung speech); rejected alternatives `musical-chords.md` (twelve-note chords) and `fingerspelling.md` (one-handed letter spelling).  
**Design authority:** none. Spoken and sung Agazan keep the normal phonology. This is a second way to sound the language on an instrument, like drummed or whistled speech, and a third way to show it with the hands. It adds no forms, readings, or spellings.

## Motivation

Agazan's spelling is phonemic, its syllables have a fixed shape, and its word edges can be heard, so a melody can stand in for its letters. An instrumental channel would let a pianist "say" a sentence, and a listener who knows the code could read it back. The code is meant to be **read and played**. Singing is not a goal here; singers use the spoken phonology.

The design: every note is a piano **black key**, so every sound belongs to one pentatonic scale (C♯ D♯ F♯ G♯ A♯) and nothing clashes. **Neither hand moves**: each hand rests over one octave of five black keys, starting on C♯ for now (see [open question 1](#open-questions)). The left hand plays vowels, and the right hand plays consonants as **finger-count shapes**.

Because neither hand moves, each letter is just a set of fingers. The same sets work as handshapes held up in the air, so the code also gives a [sign adaptation](#sign-adaptation): a manual channel that signs one syllable per beat.

## What the channel must cover

- **18 letters:** 14 consonants (`w d r m v g l h n z b y th x`) and 4 vowels (`u a o e`).
- **`th` and `x` start words.** `/th/` is the stance role letter (`thoyem`) and `/x/` starts clause joins and linkers (`xan`, `xodum`). Both also occur as seams, in codas (`-x`, `-rth`), and in clusters (`xrebal`).
- **Syllables:** consonant + vowel; a syllable with no onset (vowel stacks such as `ua`, `xuen`); onset clusters (`gl-`, role letter + `r`, role letter + `w`).
- **Codas:** `-l -m -n -r`, optionally followed by `-x`, plus `-ln`, `-rl`, `-rm`, `-rth`.
- **Prosody:** equal syllable length and stress on the first syllable ([rhythm and stress](../grammar/phonology.md#rhythm-and-stress)).

## Counting runs

The piano and sign layouts share one idea. A count from 1 to 4 is a **run** of fingers starting at the index finger: index; index + middle; index + middle + ring; all four. The thumb adds five, like the five bead on an abacus. Zero is index + pinky, the outer pair with an empty middle.

- **Signing** raises the whole run, the way people count on their fingers.
- **Piano** strikes only the finger where the run ends, plus the thumb when it is part of the count.

So the signer raises the count, and the pianist strikes where the count ends. Shapes that are not runs press exactly the fingers that are raised. Fingers are numbered 1 (thumb) to 5 (pinky).

## Left hand: vowels

The vowels repeat most often, so they go in the bass. Each vowel is a run in alphabet order (`u a o e` = 1 to 4). The left hand is mirrored, with the pinky on the lowest key, so the vowels run down the keyboard:

| Key | C♯3 | D♯3 | F♯3 | G♯3 | A♯3 |
|-----|-----|-----|-----|-----|-----|
| Finger | 5 | 4 | 3 | 2 | 1 |
| Vowel | `e` | `o` | `a` | `u` | spare |

Opposite vowels sit on neighboring keys. A letter name and its digit syllable (`da` / `du`) differ by moving one left-hand finger one key.

## Right hand: consonants

Five keys can't carry 14 consonants as single notes without moving the hand. Single keys plus finger sets can. The thumb rests on C♯5 and fingers 2–5 on D♯5, F♯5, G♯5, A♯5.

The hands sit two octaves apart. That makes it obvious which hand a lone note belongs to (a coda or a syllable with no onset), and it keeps same-letter octaves from blending into one note.

| Piano shape | Keys | Letter | Digit |
|-------------|------|--------|-------|
| Finger 2 / 3 / 4 / 5 alone | D♯5 / F♯5 / G♯5 / A♯5 | `w` `d` `r` `m` | 1 2 3 4 |
| Thumb alone | C♯5 | `v` | 5 |
| Thumb + finger 2 / 3 / 4 / 5 | C♯5 + the same | `g` `l` `h` `n` | 6 7 8 9 |
| 2 + 5 (outer pair, empty middle) | D♯5 + A♯5 | `z` | 0 |
| 2 + 3 | D♯5 + F♯5 | `x` | |
| 2 + 4 | D♯5 + G♯5 | `b` | |
| 3 + 4 + 5 | F♯5 + G♯5 + A♯5 | `th` | |
| 1 + 2 + 5 | C♯5 + D♯5 + A♯5 | `y` | |
| 3 + 4, 3 + 5 | | spare | |

Each digit is the end of its count, so number words come out naturally. `x`, `th`, and `y` press the same fingers their signs raise (see [sign adaptation](#sign-adaptation)); `b` is the one pairing to learn. The cost: the most frequent consonants in roots (`g`, `b`, `z`, `h`) are pairs, and `th` and `y` take three notes. Across the example text in `docs/grammar/` this averages about 1.8 notes per consonant.

**Alternative considered: frequency hand.** Single keys for the five most frequent consonants in roots (`g b d z h`), with the easiest pairs going to the next most frequent. It is faster to play but loses the count logic and has to be learned as a table.

**Alternative considered: press every raised finger.** The piano would play the sign shapes in full. It never clashes, but the texture gets heavy: about 2.7 notes per consonant, and a quarter of consonants become four- or five-note clusters. Words ending in `-n` and `-m` would hold a black-key cluster, and a listener can't tell four notes from five by ear. In the left hand, `e` would be a four-note cluster around C♯3, which is mud. Crossed fingers have no piano form.

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
| za | D♯5+A♯5 | F♯3 |
| za | D♯5+A♯5 | F♯3 |
| wa | D♯5 | F♯3 |
| -n | C♯5+A♯5, held | none |
| ga | C♯5+D♯5 | F♯3 |
| ma | A♯5 | F♯3 |
| da | F♯5 | F♯3 |
| -m | A♯5, held | none |

- `thoyem`: F♯5+G♯5+A♯5 / D♯3 · C♯5+D♯5+A♯5 / C♯3 · A♯5 held
- `xodum`: D♯5+F♯5 / D♯3 · F♯5 / G♯3 · A♯5 held

## Sign adaptation

The same code, held up in the air. The left hand signs vowels, the right hand signs consonants, and both hands change shape together once per syllable. It is a **manual code** for Agazan sounds, like fingerspelling or Cued Speech, not a sign language: it has no lexical signs and makes no use of signing space.

### Raised, not pressed

Pressing the piano fingers in the air does not work. Most people can't move the ring finger alone, and a lone middle finger is a rude gesture. The piano shapes would give `r`, `h`, `y`, and `x` hard shapes and make `a`, the most frequent vowel, a lone ring finger.

So each sign **raises fingers from a fist**, and the four fingers rise only in runs that start at the index finger ([counting runs](#counting-runs)). The ring finger never rises without its neighbors, and the middle finger never stands alone. The shapes outside the runs are common, easy handshapes in existing sign languages.

### Right hand: consonants

| Sign (raised) | Letter | Digit | Piano |
|---------------|--------|-------|-------|
| Index | `w` | 1 | 2 |
| Index + middle (V) | `d` | 2 | 3 |
| Index + middle + ring | `r` | 3 | 4 |
| Four fingers, thumb tucked (flat hand) | `m` | 4 | 5 |
| Thumb alone | `v` | 5 | 1 |
| Thumb + index (L) | `g` | 6 | 1 + 2 |
| Thumb + index + middle | `l` | 7 | 1 + 3 |
| Thumb + index + middle + ring | `h` | 8 | 1 + 4 |
| Open hand | `n` | 9 | 1 + 5 |
| Index + pinky (horns) | `z` | 0 | 2 + 5 |
| Index and middle crossed | `x` | | 2 + 3 |
| Index hooked | `b` | | 2 + 4 |
| Thumb–index circle, other three raised | `th` | | 3 + 4 + 5 |
| Thumb + index + pinky | `y` | | 1 + 2 + 5 |
| Pinky alone | spare | | |
| **Fist** | **rest** | | |

A digit's sign is its count held up. The fist is never a letter, so it means *this hand is silent*.

### Left hand: vowels

| Sign (raised) | Vowel |
|---------------|-------|
| Index | `u` |
| Index + middle | `a` |
| Index + middle + ring | `o` |
| Four fingers | `e` |
| Thumb | spare |
| Fist | rest |

Opposite vowels differ by one finger (`u` ↔ `a`, `o` ↔ `e`), so `du` / `da` is one finger rising. The most frequent vowel, `a`, is the easy V shape.

### Beat and timing

The [syllable rules](#syllable-rules) carry over, with a fist in place of a silent hand:

| Spoken | Sign |
|--------|------|
| Syllable | Both hands form their shapes and pulse forward together, once per beat |
| No onset | Right fist, left hand signs the vowel |
| Onset cluster | A quick flash of the first shape, then the syllable |
| Coda | Right shape held through the beat with no pulse; left fist |
| Stress on the first syllable | A bigger pulse on the word's first beat |
| Period | Both fists drop |

The hands are held at chest height, palms toward the viewer. Hand roles belong to the signer's hands: a viewer facing the signer sees the vowel hand on their right. Left-handed signers may mirror the whole layout.

Hand location, palm direction, wrist movement, and the face carry no letters. Like the white keys, they stay free for periods, [tone marks](../grammar/speech-moves.md#tone-marks), span fences, and the [speech edges](../grammar/phonology.md#speech-edges).

### Examples

- `zazawan gamadam.`: right hand horns · horns · index · *open hand, held* ‖ L · flat · V · *flat, held*; left hand V on every beat, fist on the codas
- `thoyem`: circle / three fingers · thumb + index + pinky / flat · *flat, held*
- `xodum`: crossed / three fingers · V / index · *flat, held*

### Touch

The same shapes can be felt. The receiver rests a hand over each of the signer's hands, as DeafBlind users already receive fingerspelling, or the signer presses the shapes into the receiver's palms. The word edge is a brief lift of both hands, since a visual drop can't be felt.

### Why this replaces fingerspelling

The rejected `fingerspelling.md` spelled one letter per hold, with 18 shapes borrowed from three manual alphabets. This channel signs one **syllable** per beat with both hands, so it should be faster. Its shapes follow one counting rule, and they match the piano, so one chart teaches both channels.

## Guitar adaptation

The piano shapes don't carry over to guitar. In any fretboard position, a pentatonic scale puts two notes on each string, so some consonant pairs would need one string to sound two notes at once. The changes:

- **Key:** G pentatonic (G A B D E) instead of the black keys, because the open D, G, B and E strings all belong to it.
- **Vowels:** played by the fretting hand alone, on G A B D on the low E and A strings.
- **Consonants:** which open treble strings (D G B E) the picking hand plucks. 4 single strings + 6 pairs + 4 triples = 14 shapes, one per consonant; all four strings is the spare. The fretting hand never holds a treble shape.
- **Unchanged:** the syllable rules (bass alone = no onset, treble alone = coda, accent on the first syllable).
- **Weak point:** four-string plucks need i-m-a plus the pinky, or hybrid picking. Triples that include the D string are slow unless the thumb sweeps the A and D strings together.

## Open questions

1. **Starting key:** Which black key should each hand start on? C♯ is a placeholder. The start changes which bass notes come up most: the frequent vowels `a` and `e` sit on the left middle finger and pinky, so they land a fourth apart from every start except F♯, where they are tonic and major third (F♯ and A♯). The letter shapes stay the same whatever the start. Settle it by listening to demos of the same passages played from each start.
2. **Guitar:** Which consonant gets which string subset? A count order would keep the digit logic.
3. **Spares:** What should the spare shapes (left thumb, right 3 + 4 and 3 + 5, sign pinky alone) and the white keys carry? Candidates: the period, `/y/` turns, tone marks.
4. **Speech edges:** The [speech edges](../grammar/phonology.md#speech-edges) (level pitch on list items, a reset at a new turn) need a rendering. Dynamics and rests are the natural tools on piano; hand height or a pause in signing.
5. **Tooling:** A player could render any parsed sentence from `src/tts/` phoneme output. That would make examples on the site audible, and the same data could drive a signing hand animation.
6. **Sign legibility:** Film real sentences and check that viewers can read them at a normal syllable rate. Pairs that differ by one finger (`w` / `d`, `u` / `a`, `o` / `e`) and the hooked vs straight index (`b` / `w`) need the most checking.
7. **Sign `h`:** Thumb + three fingers with the pinky folded is the one awkward run shape. If it reads badly, the fallback is the thumb touching the pinky tip with the other three raised; the thumb gives the pinky something to fold to.
8. **Gesture meanings:** The thumb–index circle (`th`) and the raised thumb (`v`) are rude in some regions. A quick, pulsed shape mostly avoids that reading, but check before teaching it.

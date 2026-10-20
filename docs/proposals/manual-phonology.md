# Proposal: manual phonology (finger code)

**Status:** PROPOSED. Nothing here is built.  
**Related:** [phonology.md](../grammar/phonology.md) (letters, [alphabet order](../grammar/phonology.md#letter-names), [opposite vowels](../grammar/phonology.md#opposite-vowels), [phonotactics](../grammar/phonology.md#phonotactics), [rhythm and stress](../grammar/phonology.md#rhythm-and-stress), [speech edges](../grammar/phonology.md#speech-edges)); [numbers.md § Counts](../grammar/numbers.md#counts) (digit letters); [clause.md § Role letters](../grammar/clause.md#role-letters) (`/th/` stance); [dependents.md § Continue](../grammar/dependents.md#continue-x) (`/x/`); [`data/lexicon-published.csv`](../../data/lexicon-published.csv); `diphone-singing.md` (a separate tooling idea for sung speech); rejected alternatives `musical-chords.md` (twelve-note chords) and `fingerspelling.md` (one-handed letter spelling).  
**Design authority:** none. Spoken and sung Agazan keep the normal phonology. This is a second way to produce the language, with the fingers instead of the voice, like drummed or whistled speech. It adds no forms, readings, or spellings.

## Motivation

Agazan's spelling is phonemic, its syllables have a fixed shape, and its word edges are clear, so a small set of finger shapes can stand in for its letters. One **finger code** assigns every letter a shape on one of two hands. The code is then carried by whatever the fingers touch or show:

| Channel | The fingers… | Received by |
|---------|--------------|-------------|
| [Piano](#piano) | press black keys | ear |
| [Guitar](#guitar) | pluck strings | ear |
| [Touch](#touch) | press into a surface or a receiver's hands | touch, or eye |
| [Signed](#signed) | rise from a fist in the air | eye |

One chart teaches every channel. Someone who learns to sign the code can also tap it on a table, press it into a DeafBlind friend's palms, or play it on a keyboard. A listener or viewer who knows the code can read it back.

## What the code must cover

- **18 letters:** 14 consonants (`w d r m v g l h n z b y th x`) and 4 vowels (`u a o e`).
- **`th` and `x` start words.** `/th/` is the stance role letter (`thoyem`) and `/x/` starts clause joins and linkers (`xan`, `xodum`). Both also occur as seams, in codas (`-x`, `-rth`), and in clusters (`xrebal`).
- **Syllables:** consonant + vowel; a syllable with no onset (vowel stacks such as `ua`, `xuen`); onset clusters (`gl-`, role letter + `r`, role letter + `w`).
- **Codas:** `-l -m -n -r`, optionally followed by `-x`, plus `-ln`, `-rl`, `-rm`, `-rth`.
- **Prosody:** equal syllable length and stress on the first syllable ([rhythm and stress](../grammar/phonology.md#rhythm-and-stress)).

## The finger code

### Two hands, fixed

The **non-dominant hand carries vowels** and the **dominant hand carries consonants**. Neither hand moves: each letter is just a set of fingers. A hand with no letter on a beat is silent (a fist, or no press).

Fingers are numbered 1 (thumb) to 5 (pinky).

### Handedness

The roles follow dominance, not left and right, because the consonant hand does the harder work: 15 shapes, including the hooked runs, plus grace shapes and holds. The vowel hand has four runs and a thumb. Sign languages follow the same pattern: left-handed signers swap hands, and when the two hands hold different shapes, the non-dominant hand keeps to a few simple ones.

| Channel | Left-handed users |
|---------|-------------------|
| [Signed](#signed), [touch](#touch) | Mirror the layout |
| [Guitar](#guitar) | Follow the instrument: a left-handed guitar mirrors it, so the picking hand is still the consonant hand |
| [Piano](#piano) | Fixed layout: the bass is always on the left, so the left hand plays vowels |

Every vowel shape is also a consonant shape (index = `u` / `w`, V = `a` / `d`), so a viewer can't tell the hands apart by shape alone. In the air the **vowel hand's fingers point sideways**, toward the other hand, while the consonant hand's fingers point up. Which hand is which then shows on every beat, whatever the signer's handedness, and a lone hand (coda vs no onset) is never ambiguous. Both palms face the viewer, so every finger stays countable. A sideways palm was considered and rejected, because seen edge-on the raised fingers hide behind each other.

### Counting runs

A count from 1 to 4 is a **run** of fingers starting at the index finger: index; index + middle; index + middle + ring; all four. The thumb adds five, like the five bead on an abacus. Zero is index + pinky, the outer pair with an empty middle.

The four letters after the digits (`b y th x`, in [alphabet order](../grammar/phonology.md#letter-names)) are **hooked runs**: the same runs with the fingers hooked. A hooked finger keeps its base knuckle straight and curls its two outer joints, so the hook sticks out of the fist instead of folding into it. The thumb is never hooked. Straight fingers mean a digit letter; hooked fingers mean one of the other four.

Each shape has two forms:

- **Shape:** the whole run rises from a fist, the way people count on their fingers. Used by every channel except piano ([signed](#signed), [touch](#touch)).
- **Piano:** only the finger where the run ends goes down, plus the thumb when it is part of the count. A hooked run strikes its end and the next finger up.

So the signer raises the count, and the pianist strikes where the count ends. Shapes that are not runs (`z`, the spares) press exactly the fingers that are raised.

Why two forms: in the air, most people can't raise the ring finger alone, and a lone middle finger is a rude gesture, so shapes keep to runs. On piano, pressing whole runs makes dense clusters that blur by ear, so the piano keeps to the run's end. Each run is fully described by its last finger, so the two forms carry the same information. Hooking has no meaning on a key, which is why hooked runs need their own piano pairs.

### Vowel hand (non-dominant)

Each vowel is a run in alphabet order (`u a o e` = 1 to 4). In the air, the fingers point sideways ([handedness](#handedness)):

| Vowel | Shape | Piano |
|-------|-------|-------|
| `u` | index | 2 |
| `a` | index + middle (V) | 3 |
| `o` | index + middle + ring | 4 |
| `e` | four fingers | 5 |
| spare | thumb | 1 |

Opposite vowels differ by one finger (`u` ↔ `a`, `o` ↔ `e`), so a letter name and its digit syllable (`da` / `du`) differ by one finger. The most frequent vowel, `a`, is the easy V shape.

### Consonant hand (dominant)

| Letter | Count | Shape | Piano |
|--------|-------|-------|-------|
| `w` | 1 | index | 2 |
| `d` | 2 | index + middle (V) | 3 |
| `r` | 3 | index + middle + ring | 4 |
| `m` | 4 | four fingers, thumb tucked (flat hand) | 5 |
| `v` | 5 | thumb alone | 1 |
| `g` | 6 | thumb + index (L) | 1 + 2 |
| `l` | 7 | thumb + index + middle | 1 + 3 |
| `h` | 8 | thumb + index + middle + ring | 1 + 4 |
| `n` | 9 | open hand | 1 + 5 |
| `z` | 0 | index + pinky (horns) | 2 + 5 |
| `b` | hooked 1 | index hooked | 2 + 3 |
| `y` | hooked 2 | index + middle hooked | 3 + 4 |
| `th` | hooked 3 | index + middle + ring hooked | 4 + 5 |
| `x` | hooked 4 | four fingers hooked (claw) | 2 + 4 |
| spare | | pinky alone; middle + ring + pinky; thumb + index + pinky; thumb + any hooked run | 3 + 5 |
| **rest** | | **fist** | **none** |

A digit's shape is its count held up, so number words come out naturally. The fist is never a letter, so it means *this hand is silent*.

On piano, `x` is the one learned pair: a hooked run of four has no finger after the pinky. The most frequent consonants in roots (`g`, `b`, `z`, `h`) are pairs, and the consonants average about 1.7 notes each across the example text in `docs/grammar/`.

### Syllable rules

Every channel keeps these rules. Each channel section says how it realizes a beat, a hold, and a rest.

| Spoken | Finger code |
|--------|-------------|
| Syllable | One beat |
| Consonant + vowel | Both hands on the same beat |
| No onset | Vowel hand alone |
| Onset cluster | A quick grace shape on the consonant hand, then the syllable |
| Coda (`-n`, `-lx`, `-rth`, …) | Consonant hand alone; the last shape is held. The coda is the word's audible end, as in speech |
| Stress on the first syllable | A stronger first beat |
| Period | Both hands rest |

Because each hand carries its own letters, these readings are always unambiguous.

### Free layers

Each channel has room the letters don't use: the white keys on piano; hand location, wrist movement, and the face in signing (finger direction already marks the vowel hand). These stay free for periods, [tone marks](../grammar/speech-moves.md#tone-marks), span fences, and the [speech edges](../grammar/phonology.md#speech-edges).

### Alternatives considered

- **Frequency hand.** Single fingers for the five most frequent consonants in roots (`g b d z h`), with the easiest pairs going to the next most frequent. It is faster to play but loses the count logic and has to be learned as a table.
- **One form (piano everywhere).** The earlier piano layout put single letters on single fingers. Raised in the air, it gave `r`, `h`, `y`, and `x` hard shapes, made `d` a lone middle finger, and made `a` a lone ring finger. Pressed into a palm, the receiver had to tell which single fingertip landed, which touch does poorly at speed.
- **One form (shape everywhere).** Pressing whole runs on piano averages about 2.7 notes per consonant, and a quarter of consonants become four- or five-note clusters. Words ending in `-n` and `-m` would hold a black-key cluster, and a listener can't tell four notes from five by ear. In the bass, `e` would be a four-note cluster around C♯3, which is mud.
- **Separate shapes for `b y th x`.** A hooked index for `b`, crossed index + middle for `x`, a thumb–index circle for `th`, and thumb + index + pinky for `y`. Four unrelated shapes to learn, and two failed by touch: crossed fingertips land side by side exactly like `d`, and the circle's pinch lands where the index would, so `th` felt like `m`. Plain middle + ring + pinky for `th` and thumb + middle + ring + pinky for `x` fix that, but `th` / `r` and `x` / `h` then differ only by which end of the hand the dots sit at.

## Channels

### Piano

Every note is a **black key**, so every sound belongs to one pentatonic scale (C♯ D♯ F♯ G♯ A♯) and nothing clashes. Each hand rests over one octave of five black keys, starting on C♯ for now (see [open question 1](#open-questions)), and plays **piano** forms. The layout is the same for every player: the left hand plays vowels and the right hand consonants ([handedness](#handedness)).

The left hand is mirrored, with the pinky on the lowest key, so the vowels run down the keyboard:

| Key | C♯3 | D♯3 | F♯3 | G♯3 | A♯3 |
|-----|-----|-----|-----|-----|-----|
| Finger | 5 | 4 | 3 | 2 | 1 |
| Vowel | `e` | `o` | `a` | `u` | spare |

The right hand's thumb rests on C♯5 and fingers 2–5 on D♯5, F♯5, G♯5, A♯5. The hands sit two octaves apart. That makes it obvious which hand a lone note belongs to (a coda or a syllable with no onset), and it keeps same-letter octaves from blending into one note.

| Code | Piano |
|------|-------|
| Beat | Both hands strike together |
| Hold | The key stays down |
| Stress | Accent |
| Rest | A rest |

The white keys carry no letters.

`zuzazon gumahom.`

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

- `thoyem`: G♯5+A♯5 / D♯3 · F♯5+G♯5 / C♯3 · A♯5 held
- `xodum`: D♯5+G♯5 / D♯3 · F♯5 / G♯3 · A♯5 held

### Guitar

The finger shapes don't carry over to guitar. In any fretboard position, a pentatonic scale puts two notes on each string, so some consonant pairs would need one string to sound two notes at once. Guitar keeps the code's two-hand split and syllable rules, with its own shapes:

- **Key:** G pentatonic (G A B D E) instead of the black keys, because the open D, G, B and E strings all belong to it.
- **Vowels:** played by the fretting hand alone, on G A B D on the low E and A strings.
- **Consonants:** which open treble strings (D G B E) the picking hand plucks. 4 single strings + 6 pairs + 4 triples = 14 shapes, one per consonant; all four strings is the spare. The fretting hand never holds a treble shape.
- **Syllable rules:** bass alone = no onset, treble alone = coda, accent on the first syllable.
- **Handedness:** a left-handed guitar mirrors the layout, so the picking hand carries consonants for every player.
- **Weak point:** four-string plucks need i-m-a plus the pinky, or hybrid picking. Triples that include the D string are slow unless the thumb sweeps the A and D strings together.

### Touch

The code can be felt as well as seen or heard. Every mode uses the **shape** form, the same chart as signing:

| Mode | How |
|------|-----|
| **Tapping** | Both hands tap the shapes on a table or the thighs. Silent; useful for practice and quiet use, and visible to someone watching |
| **Palm press** | The signer presses the shapes into the receiver's upturned palms, each hand into the palm facing it |
| **Hand-over-hand** | The receiver rests a hand over each of the signer's hands and feels the shape in the air, as DeafBlind users already receive fingerspelling. The sideways vowel hand can be felt too |

When pressing, straight fingers land on their **fingertips**, a little spread at their natural rest spacing, and hooked fingers land on their **middle knuckles**. A shape is then read from features touch picks up well:

- **How many:** separate dots, and a group that widens from one finger to four. Runs always start at the index edge, so the only question is how far they reach.
- **Thumb:** an extra dot well apart from the fingers, so +5 is a plain yes or no.
- **Gap:** horns (`z`) is two dots with the middle fingers missing.
- **Pad or knuckle:** a soft fingertip vs a hard, broad knuckle separates straight runs from hooked ones.

None of this asks the receiver which single fingertip landed. Fingertips beat whole flat fingers here: dots are easier to count than the width of a solid bar, and fingertip taps are quick and light, like drumming. Flat fingers give a stronger signal through clothing or on the forearm, but the code keeps one style.

| Code | Touch |
|------|-------|
| Beat | A tap or press, both hands together |
| Hold | The fingers stay down, or the shape stays still in hand-over-hand |
| Stress | A firmer press |
| Rest | Both hands lift briefly; this also marks the word edge, since a visual drop can't be felt |

A pressed shape has no finger direction, so in palm press the receiver tells the hands apart by which palm is touched. Partners agree on the signer's handedness before they start; mirroring is allowed ([handedness](#handedness)).

### Signed

The code held up in the air in the **shape** form, received by eye. It is a **manual code** for Agazan sounds, like fingerspelling or Cued Speech, not a sign language: it has no lexical signs and makes no use of signing space.

| Code | Signed |
|------|--------|
| Beat | Both hands form their shapes and pulse forward together |
| Hold | The shape is held through the beat with no pulse |
| Grace shape | A quick flash of the first shape |
| Stress | A bigger pulse |
| Silent hand | Fist |
| Rest | Both fists drop |

The hands are held at chest height, palms toward the viewer, with the consonant hand's fingers pointing up and the vowel hand's pointing sideways toward it ([handedness](#handedness)). Left-handed signers mirror the layout; the sideways fingers show the vowel hand either way.

- `zuzazon gumahom.`: consonant hand horns · horns · index · *open hand, held* ‖ L · flat · V · *flat, held*; vowel hand V (sideways) on every beat, fist on the codas
- `thoyem`: hooked three / three fingers · hooked V / flat · *flat, held*
- `xodum`: claw / three fingers · V / index · *flat, held*

**Why this replaces fingerspelling:** the rejected `fingerspelling.md` spelled one letter per hold, with 18 shapes borrowed from three manual alphabets. The signed channel signs one **syllable** per beat with both hands, so it should be faster. Its shapes follow one counting rule, straight or hooked, and match the other channels.

## Open questions

1. **Piano starting key:** Which black key should each hand start on? C♯ is a placeholder. The start changes which bass notes come up most: the frequent vowels `a` and `e` sit on the left middle finger and pinky, so they land a fourth apart from every start except F♯, where they are tonic and major third (F♯ and A♯). The letter shapes stay the same whatever the start. Settle it by listening to demos of the same passages played from each start.
2. **Guitar:** Which consonant gets which string subset? A count order would keep the digit logic.
3. **Spares:** What should the spare shapes (vowel-hand thumb; consonant-hand pinky alone, middle + ring + pinky, thumb + index + pinky, thumb + a hooked run; piano 3 + 5) and the free layers carry? Candidates: the period, `/y/` turns, tone marks.
4. **Speech edges:** The [speech edges](../grammar/phonology.md#speech-edges) (level pitch on list items, a reset at a new turn) need a rendering in each channel: dynamics and rests on piano, hand height or a pause in signing, a lift or press strength in touch.
5. **Tooling:** A player could render any parsed sentence from `src/tts/` phoneme output. That would make examples on the site audible, and the same data could drive a signing hand animation.
6. **Signed legibility:** Film real sentences and check that viewers can read them at a normal syllable rate. Check first: pairs that differ by one finger (`w` / `d`, `u` / `a`, `o` / `e`); hooked vs straight, since a hooked index can pass for a pointing finger and hooked fingers look shorter from the front; the claw (`x`) vs a fist (rest); and hooked `th`, where the pinky folds while the other three hook. If the claw fails, `x` falls back to thumb + middle + ring + pinky.
7. **Touch legibility:** Test palm press and tapping at a normal syllable rate: knuckle vs fingertip with light, fast presses; the shapes with the most dots (`m`, `e`, `n`); and whether the lift-off word edge is clear in fast speech. If hooked runs fail by touch, a brush across the palm in place of a tap is the fallback mark for `b y th x`.
8. **The `h` shape:** Thumb + three fingers with the pinky folded is the one awkward run shape. If it reads badly, the fallback is the thumb touching the pinky tip with the other three raised; the thumb gives the pinky something to fold to.
9. **Sideways vowel hand:** Check that holding the vowel hand's fingers sideways stays comfortable over a long conversation and does not slow shape changes. Fallback: point the vowel hand's fingers diagonally.
10. **Gesture meanings:** The raised thumb (`v`) and horns (`z`) are rude in some regions. A quick, pulsed shape mostly avoids that reading, but check before teaching it.

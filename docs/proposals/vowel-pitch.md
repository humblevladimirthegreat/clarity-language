# Proposal: vowel pitch, scale digits, stack order u o a e, rhythm for sentence edges

**Status:** PROPOSED (not current language).  
**Related:** [phonology.md § vowels](../grammar/phonology.md#vowels), [§ opposite vowels](../grammar/phonology.md#opposite-vowels), [§ letter names](../grammar/phonology.md#letter-names), [§ rhythm and stress](../grammar/phonology.md#rhythm-and-stress), [§ speech edges](../grammar/phonology.md#speech-edges), [§ singing](../grammar/phonology.md#singability-constraints); [dependents.md § periods](../grammar/dependents.md#orthography-and-prosody-periods); [spans.md § scope islands](../grammar/spans.md#scope-islands); [numbers.md § counts](../grammar/numbers.md#counts); [pegs.md](../grammar/pegs.md); [finger-code.md](../grammar/finger-code.md); [speech-moves.md § tone marks](../grammar/speech-moves.md#tone-marks); [questions.md § polar stance](../grammar/questions.md); [design-decisions.md](../meta/design-decisions.md) (stacked vowels, digit syllables); [unassigned-reserved.md](../meta/unassigned-reserved.md).  
**Design authority:** none until absorbed.

Give each vowel a fixed pitch as redundant backup to its quality, and line the rest of the language up with it:

- **Vowel pitch**, high to low **u e o a**. The finger code's vowel shapes count up the pitches like the digits (1 to 4 fingers from the pinky), and the piano and the guitar follow.
- **Digits climb the scale.** Digit 1 is the lowest pitch and each digit steps up (`a o e u`), as scale degrees do in music. Letter names take the opposite vowel, so they walk down the scale. Two pairs of digit consonants trade places (`h`↔`v`, `l`↔`r`) so the digits still pass the confusion test.
- **Stacks and the alphabet's vowels follow u o a e**, an order chosen so stacks sound different from each other ([why stacks have their own order](#why-stacks-have-their-own-order)). Only `ao` → `oa` changes.
- **Pitch for vowels only.** Sentence edges move to rhythm (rests counted in beats), and word stress is loudness.

## Why

Many words differ by one vowel (`val` / `vol` / `vul`), and the opposite pair `a` ↔ `u` often carries opposite meanings (`u` undoes). Mishearing that one vowel gives a valid word that says the reverse. A pitch tied to each vowel gives the ear a second cue that survives a muffled vowel quality (noise, a phone line, an accent).

Vowel pitches are **optional and fully predictable** from the vowel. They add no meaning, so the rule that unwritten pitch adds nothing ([phonology.md § voice and certainty](../grammar/phonology.md#voice-and-certainty)) still holds. Song drops them, since the melody owns pitch; the vowel letter still says everything.

**The vowel wins.** When a vowel's sound and its pitch disagree, the sound is the vowel. Pitch only backs it up: it never turns one vowel into another. A speaker who skips vowel pitch, or lifts a word for emphasis, is never misheard because of it.

**Where it helps most.** Pitch is heard against the speaker's own range, so the cue is strongest inside a sentence and inside a two-vowel word, which carries its own contour (`yael` rises, `yuel` falls). A lone one-vowel word heard with no context (`val` alone over a bad line) gets the least help.

## The vowel pitches

| Vowel | Pitch | Natural basis |
|-------|------|---------------|
| `u` /ʉ/ | **high** (4) | close vowels are already slightly higher in every language |
| `e` /e̞/ | **mid-high** (3) | |
| `o` /o̞/ | **mid-low** (2) | |
| `a` /ä/ | **low** (1) | open vowels are already slightly lower |

Four level pitches, no contours, so the no-glide rule for vowels still holds.

### Pitch values

Vowel pitches are **intervals above the speaker's own `a`**, not fixed notes: voices differ by an octave or more.

| Vowel | Semitones above `a` | Scale degree | Piano (finger code) |
|-------|---------------------|--------------|---------------------|
| `a` | 0 | 1 | D♯3 |
| `o` | +3 | ♭3 | F♯3 |
| `e` | +5 | 4 | G♯3 |
| `u` | +7 | 5 | A♯3 |

- **The piano is the reference.** With the finger code's vowel shapes counting up the pitches ([finger code and instruments](#finger-code-and-instruments)), each vowel's piano key sits at its interval above D♯3, the default base for `a`. Grammar pages play that key as the pitch cue, and the practice widget moves the base to the learner's own voice ([piano cues](#piano-cues)), until recorded pitched vowels replace it. Learners match the intervals, not the notes.
- **Pentatonic.** The four pitches are minor-pentatonic degrees 1, ♭3, 4, 5. Any two form a consonant interval, so a line chanted on its vowel pitches sounds like music, not out of tune. A songwriter may optionally let a melody follow the vowel pitches (as Cantonese pop lyric-setting does), but no song has to.
- **Widest gaps where they matter.** `a` ↔ `u`, the opposite pair that flips meaning, is a fifth apart. `u` ↔ `o`, the two rounded vowels and the closest pair by ear, is 4 semitones. The 2-semitone steps (`e` ↔ `o`, `u` ↔ `e`) sit between vowels that already differ in lip or tongue position.
- **Realistic.** Cantonese level tones span about 5–6 semitones; an English emphatic rise often reaches a fifth.

The range narrows with speed; the order never changes.

| Speech | Range | `a` / `o` / `e` / `u` |
|--------|-------|------------------------|
| Careful, teaching, and full-stress grammar words | full | 0 / 3 / 5 / 7 |
| Ordinary running speech | about ⅔ | 0 / 2 / 3.5 / 5 |
| Fast speech (floor) | about ½ | 0 / 1.5 / 2.5 / 3.5 |

At the floor the 1-semitone steps are about the size of the pitch differences vowels already have in any language, so fast speech keeps little more than the order. That is the intended floor, not a failure: the full range belongs to careful speech and the words that change the meaning.

- **Opposite pairs.** `a` ↔ `u` are low against high, the widest gap, where a mishearing costs most. `o` ↔ `e` are one step apart in pitch but far apart in quality.
- **Size vowels.** A five-letter root's middle vowel tracks size ([lexicon § size](../meta/lexicon.md#size)): `e` small, `o` medium, `a` big. The pitches match the common sound-symbolism of small = high, big = low.

### Every vowel, full range on stressed grammar words

Every vowel carries its pitch, in roots and grammar words alike. A speaker cannot sort vowels into "important" and "unimportant" at speaking speed, and a listener can only lean on a cue that is always there. Root vowels also form one-vowel minimal pairs.

The words that [phonology.md](../grammar/phonology.md#never-quiet) already says keep full stress in light speech (the short words that change the meaning) keep the **full pitch range**. Other words may narrow the range in fast speech, as English narrows unstressed syllables, but never flatten or reorder it.

### Interactions

| With | Rule |
|------|------|
| [Tone marks](../grammar/speech-moves.md#tone-marks) | `?` raises the word's whole range; the four vowel pitches keep their order inside it. The other marks are loudness (`!`, `;`), length (`&`) or voice quality (`%`), not pitch |
| [Stress](../grammar/phonology.md#rhythm-and-stress) | Loudness only, never pitch ([stress](#stress-loudness-only)) |
| [Sentence edges](../grammar/phonology.md#speech-edges) | Rests, not pitch ([sentence edges](#sentence-edges-rests-not-pitch)) |
| Numbers | Counting climbs the scale ([scale digits](#phase-2-scale-digits-and-letter-names)) |
| Vowel stacks | Each stack has its own contour ([stack order](#phase-3-stack-order-u-o-a-e)) |
| [Thinking sounds](../grammar/phonology.md#thinking-sounds) | Hold the vowel at its own pitch |
| [Syllabic `l`](../grammar/phonology.md#syllabic-l) | Fixed at +4 semitones, between `o` and `e` (see [decisions](#decisions)) |
| Song | Vowel pitches are dropped; the [singing table](../grammar/phonology.md#singability-constraints) says so in one row |
| Whisper | No pitch; quality alone carries the vowel, as now |
| Downdrift | A voice may drift lower over a long sentence; that carries nothing, as long as neighbouring vowels keep their order |

## The three vowel orders

| Order | Used by | Chosen for |
|-------|---------|------------|
| **u e o a** (pitch, high to low) | Vowel pitches, letter names | It *is* the pitches, so it needs no memorizing |
| **a o e u** (pitch, low to high) | Digits, from 1; finger-code vowel shapes (1 to 4 fingers from the pinky), piano, guitar | Counting climbs the scale, like scale degrees |
| **u o a e** (stack order) | Vowel stacks, the vowels at the end of the alphabet | Stacks with contours that differ from each other |

Learners memorize only the stack order. The other two are the pitches, heard down or up.

### Why stacks have their own order

A stack's two vowels have two pitches, so every stack is a small melody: a fall or a rise, big or small, high or low. Stacks are worth telling apart by ear, so their contours should differ as much as possible. That rules out any order that follows the pitches:

- **Pitch order makes every stack fall.** With stacks in `u e o a`, the six stacks are falls that differ only in size and height (`ue`, `eo` and `oa` are all one-step falls). Telling them apart by pitch would mean knowing the speaker's range exactly.
- **Contrast needs falls and rises mixed.** That takes an order whose pitches go down and back up, which no scale does.

All six orders that keep `u` first (the `u` stacks carry `u`-first readings) were scored by how far apart their contours sit. Two stacks are *close* when both their start and their end are within one pitch step.

| Stack order | Stacks | Close pairs |
|-------------|--------|-------------|
| `u e o a` (pitch order: all falls) | `ua uo ue ea oa eo` | 10 |
| `u e a o` | `ua uo ue ea eo ao` | 8 |
| `u a e o` | `ua uo ue ae ao eo` | 6 |
| `u a o e` (today) | `ua uo ue ae ao oe` | 5 |
| `u o e a` | `ua uo ue oe oa ea` | 5 |
| **`u o a e`** | `ua uo ue oa ae oe` | **3** |

The ranking is the same when the gaps are measured in semitones (0 / 3 / 5 / 7) instead of steps. One order that puts `o` before `u` (`ua ou ue ae oa eo`) has no two stacks one step apart at either end, but its preferences run in a circle, so learners would memorize six pairs instead of one order.

## One job per dial

Once vowels own pitch, any other use of pitch competes with them. Each dial of the voice gets one job:

| Dial | Job |
|------|-----|
| **Pitch** | Vowel pitch, and the `?` mark raising a word's whole range |
| **Loudness** | Word stress, the words never said quietly, `!` louder, `;` softer |
| **Time** | Equal beats, held endings, rests at sentence edges, `&` slowed |

This is the split the finger code already uses: its beats and rests carry the edges, and a stronger beat carries stress. Speech and every finger-code channel then mark edges and stress the same way.

### Sentence edges: rests, not pitch

**Drop pitch from every sentence edge, and mark the two edges that have no word with rests.** Almost every edge in the [speech edges table](../grammar/phonology.md#speech-edges) is already a word the listener hears (a join, an `/x/` word, a `/y/` word), so its pitch was only a backup. Only two edges have no word: the period, and a scope island's start and end.

Two sizes of silence, counted in beats. Every syllable is the same length, so a listener hears the difference as rhythm, as in music:

- a **break**: the next beat comes half a beat late;
- a **rest**: one whole silent beat.

| Edge | Voice today | New | Why that is enough |
|------|-------------|-----|--------------------|
| Word | Stress on the first syllable, ending held | Louder first syllable, ending held | Unchanged except that stress is loudness |
| Item in a list, before the join word | Level pitch, no fall | Nothing extra | A second word with the same role letter already says a list is under way |
| Join word that ends a list | Fall | Nothing extra | The join word is heard |
| Soft **-m** statement or answer | Lighter fall | Nothing extra | The **-m** is heard |
| Scope island | Brief pitch reset, one tight phrase, pause after | Break before, one tight phrase, break after | An island has no spoken edge word, so it keeps a timing cue |
| `/x/` continue, stand-in hang | Dip, no reset | No rest | The `/x/` word or stand-in is heard; no rest means the sentence goes on |
| Period | Fall on the last word, short pause | Rest | A bare body after a period has no word to mark the edge |
| Linker or topic `/x/` word after a period | Dip, or pitch reset | The period's rest | The `/x/` word is heard and says which |
| New `/y/` turn | Full pitch reset | The period's rest | The `/y/` word is heard |

In song, a period takes a rest or a held note, and an island is phrased as its own short phrase. The finger code keeps its own rests (one beat between words, a longer rest at the end of a sentence).

**Rejected: edges as register shifts** (tone-language style: a period lowers the whole range, a turn resets it).

- English-speaking learners would produce the edges as contours, a fall on the last syllable, which bends that syllable's vowel pitch: the cue vowel pitch exists to protect.
- Pitch edges vanish in song and in the finger code. Rests survive both, and the finger code already marks edges by rests.
- Every edge but two is already a word.

### Stress: loudness only

**A word's first syllable is louder, with a crisp start. Its pitch stays its vowel's pitch, and its length stays one beat.**

- Pitch belongs to vowels, and length belongs to beats and rests: equal syllables are what make a rest countable. Loudness is the dial left.
- The finger code already stresses this way: a stronger beat, a bigger pulse, a firmer press.
- English marks stress with a pitch peak and a longer vowel, so learners will raise a stressed low `a`. Teach it as a drum accent: say the word on its vowel pitches, then tap the first beat louder. A stressed `a` is loud and low.
- Unchanged: a number word stresses the last digit of each group; the words never said quietly keep full loudness and the full pitch range; `!` makes the word louder and `&` makes it louder and slower (both are written, so they may use loudness and length).
- In song, a word's first syllable sits best on a strong beat, by choice.

## Phase 1: vowel pitch, rhythm and stress, finger-code vowels

No spelling changes.

### Where it is taught

**Beginner.** Vowel pitches are predictable, so they cost no memorization: each vowel has one pitch, as it has one sound. Pronunciation habits set early and are hard to retrofit, so learners should hear and copy the pitches from their first vowel. Because vowel pitch is optional, nothing later depends on them, and a learner who skips them loses no grammar. Teaching is split by the [learning-levels](../meta/learning-levels.md) dependency rule:

| Level | Section | What it teaches |
|-------|---------|-----------------|
| Beginner | [phonology.md § vowels](../grammar/phonology.md#vowels) | A pitch column in the vowel table (high / mid-high / mid-low / low) with a piano cue on each row, and the [practice widget](#practice-widget) in its beginner modes. One paragraph: each vowel always has its own pitch; vowel pitch is optional and adds no meaning; when pitch and sound disagree, trust the sound; keep each vowel's pitch when you stress or emphasize a word, because Agebon stresses with loudness. |
| Beginner | [§ opposite vowels](../grammar/phonology.md#opposite-vowels) | One line: `a` and `u` are also the furthest apart in pitch. |
| Intermediate | [speech-moves.md § tone marks](../grammar/speech-moves.md#tone-marks) | `?` voice becomes *raised, tentative*: it lifts the whole word, and the vowel pitches keep their order inside it. |
| Advanced | [§ rhythm and stress](../grammar/phonology.md#rhythm-and-stress) | Stress is loudness, not pitch or length, with the drum-accent drill. The exact intervals (0 / 3 / 5 / 7 with the piano reference) and how the range narrows in faster speech, with the practice widget's contour and range modes. |
| Advanced | [§ words never said quietly](../grammar/phonology.md#never-quiet) | Those words keep full loudness and the full pitch range. |
| Advanced | [§ voice and certainty](../grammar/phonology.md#voice-and-certainty) | Pitch carries vowel pitch and the `?` mark, nothing else. |
| Advanced | [§ speech edges](../grammar/phonology.md#speech-edges) | The edge table with breaks and rests ([sentence edges](#sentence-edges-rests-not-pitch)); the closing line about list pitch becomes the role-letter cue. |
| Advanced | [§ singing on one note](../grammar/phonology.md#one-note) and [§ singability](../grammar/phonology.md#singability-constraints) | Song drops vowel pitch; a melody may follow them by choice. |
| Advanced | [§ thinking sounds](../grammar/phonology.md#thinking-sounds) | Hold the vowel at its own pitch. |
| Section's level | [dependents.md § periods](../grammar/dependents.md#orthography-and-prosody-periods) | Intro line and Speech column: rest at a period, no rest before `/x/` continue or a stand-in hang. |
| Section's level | [spans.md § scope islands](../grammar/spans.md#scope-islands) | The speech line: break before, tight phrase, break after. |
| Section's level | [pronouns.md § topic](../grammar/pronouns.md#topic) | The topic word needs no pitch reset: the `/x/` word says it. |
| Finger code | [finger-code.md](../grammar/finger-code.md) | Vowel shapes as pinky runs in digit order, piano and guitar following them ([below](#finger-code-and-instruments)); the two-hands paragraph (index alone is only `b`), touch reading from the pinky edge, the `thohom` beat table. |
| Cheat sheet | [cheat-sheets/sounds-spelling.md](../grammar/cheat-sheets/sounds-spelling.md), talking sheet | The pitch on each vowel row; the `?` voice. |

The Claritish track adds no vowel pitch: its words are spoken inside English, where pitch belongs to English intonation.

### Piano cues

Each vowel row plays its left-hand finger-code key (D♯3 to A♯3), the reference for its pitch. A small component (for example `<PitchPlay vowel="u" />`, or a pitch option on `IpaPlay`) gets the key from `pianoNotes` in [`src/finger-code.ts`](../../src/finger-code.ts) and plays it with the finger code's piano voice, moved out of [`FingerCode.vue`](../grammar/.vitepress/components/FingerCode.vue) into a shared module so both use one sound. Recorded pitched vowels replace the piano cues later; the IPA clips stay as they are.

#### Practice widget

A drill component (for example `<PitchDrill />`) plays a short pattern on the piano voice and highlights each vowel letter as its note sounds; the learner sings the vowels back. D♯3 is above most men's speaking voices and below most women's and children's, so a fixed key would push many learners out of a comfortable range.

- **Movable base.** A semitone stepper sets the note for `a`, default D♯3 (the finger-code key); the other vowels follow at 0 / 3 / 5 / 7. Later, *find my `a`*: the learner sings a comfortable `a` into the microphone and the widget sets the base from its pitch.
- **Base first.** Every pattern after the scales opens with `a`, so the learner finds each vowel as an interval from their own `a`, not as a note of a remembered tune.
- **Ascending is the warm-up, not the drill.** `a o e u` upward is the opening of the minor pentatonic scale; after a few rounds it is sung as a melody, not as four vowel heights.

| Mode | Pattern | Level |
|------|---------|-------|
| Scale up | `a o e u` (the digits climb the scale) | Beginner |
| Scale down | `u e o a` (letter names walk down) | Beginner |
| Pairs | `a`–`u` (opposites, a fifth), `o`–`e` (opposites, one step), `u`–`o` (the closest pair by ear) | Beginner |
| Random | `a` then one vowel at random; the learner sings it and the widget plays it after | Beginner |
| Contours | Two-vowel words (`yael` rises, `yuel` falls) and the six stacks | Advanced |
| Range | Full / ⅔ / ½ ([pitch values](#pitch-values)): the same patterns narrowed, order kept | Advanced |

A microphone check (sung pitch against target, within about a semitone) can follow *find my `a`*; the drill works without it.

### Finger code and instruments

The vowel hand counts like the digits: its shapes are runs of 1 to 4 fingers **from the pinky**, in digit order **a o e u**, so more fingers means a higher vowel on every channel:

| Vowel | Count | Shape | Piano (left hand) | Guitar |
|-------|-------|-------|-------------------|--------|
| `a` | 1 | pinky | D♯3 | E, 6th string fret 2 |
| `o` | 2 | pinky + ring | F♯3 | G, 6th string fret 5 |
| `e` | 3 | pinky + ring + middle | G♯3 | A, 5th string fret 2 |
| `u` | 4 | four fingers | A♯3 | B, 5th string fret 4 |

- **One rule on every channel:** *more fingers, higher vowel*, counted the way the digits climb the scale. Voice, signing, touch, piano and guitar need no list beyond the pitches themselves.
- **The piano keys stay where they are.** The left hand keeps its natural layout (pinky on D♯3, index on A♯3) and a run still strikes only its last finger. A pinky run ends one finger further toward the index each time, so the struck key climbs with the count. The vowels stay on the left hand.
- **The guitar plays E, G, A, B** in open G tuning: the same 0 / 3 / 5 / 7 intervals, climbing in count order within frets 2 to 5.
- **The hands look different.** The consonant hand counts from the index, the vowel hand from the pinky, so the only shape on both hands is four fingers (`u`, and the flat hand of digit 4). The consonant hand's spares *pinky alone* and *middle + ring + pinky* look like vowels, so they stay unassigned. In a palm press the receiver reads the vowel group from the pinky edge.
- **Opposite pairs:** `a` ↔ `u` are one finger against four, in a palm press one point of pressure against four. `o` ↔ `e` are one finger apart, as they are one step apart in pitch. Drop the line that opposite vowels differ by one finger.
- **Forming `o`.** Pinky + ring is the hardest of the four shapes, because the middle finger tends to rise with the ring. Fold the thumb over the index and middle to hold them down.
- The `thohom` beat table changes: `o` is pinky + ring.

**Rejected: runs from the index.** On the left hand the index plays the highest key, so a one-finger `a` would strike A♯3 and the piano would fall as the count rose. Counting from the index would mean either *fewer fingers, higher vowel* (shapes that count against the digits) or vowels on the right hand (consonants below them and a new piano layout).

**Rejected: shapes in alphabet order.** The piano's finger-to-key layout would no longer match pitch, and with the stack order `u o a e` the opposite pairs would each be two fingers apart.

### Steps

1. [`src/finger-code.ts`](../../src/finger-code.ts): vowel shapes as pinky runs in digit order (`a o e u`), with `pianoForm` reading a pinky run's last finger as the innermost one; guitar vowel map; their tests. Check the Try-it chart by eye and by ear on each channel.
2. The piano cue and practice widget components and their registration in the theme; check that the build's tag checks ([`scripts/lint-md-balance.mjs`](../../scripts/lint-md-balance.mjs), Vue-illegal tags) accept it.
3. Grammar text from the [table above](#where-it-is-taught).
4. Meta: [design-decisions.md](../meta/design-decisions.md) entries for edges by rests (register edges rejected), stress as loudness, and vowel shapes as pinky runs in digit order (runs from the index and alphabet-order shapes rejected).
5. `npm run cheat-sheet-blocks -- --write`, `npm run build`, `npm test`.

## Phase 2: scale digits and letter names

### The digits

Digit vowels climb the scale, **a o e u**, starting at 1, as scale degrees do: 1 is the lowest pitch, 4 the highest, and 5 starts the next round. 0 counts as the tenth digit, so it carries on the climb. Letter names take the [opposite vowel](../grammar/phonology.md#opposite-vowels), so they cycle **u e o a** and walk down the scale.

| Digit | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0 |
|-------|---|---|---|---|---|---|---|---|---|---|
| Consonant | b | d | g | **h** | z | **v** | **r** | **l** | n | m |
| Syllable | ba | do | ge | hu | za | vo | re | lu | na | mo |
| Pitch | 1 | 2 | 3 | 4 | 1 | 2 | 3 | 4 | 1 | 2 |
| Letter name | bu | de | go | ha | zu | ve | ro | la | nu | me |

Every digit syllable and every digit letter name changes; `b`, `d`, `g`, `z`, `n` and `m` keep their digits.

- **Counting is a melody.** 1 to 4 sing D♯ F♯ G♯ A♯ on the piano, and every four digits repeat it. Reciting the letter names walks back down.

### Why `h`↔`v` and `l`↔`r`

With today's consonants, `a o e u` from 1 puts `u` on 4 and 8: `vu` and `ru`. That fails the hard pairs **v/w** and **r/w** against the exponent filler `wu` ([digit-syllable confusion test](../meta/design-decisions.md#digit-syllables)), and `ru` is also the negative marker. `v` and `r` need a digit on `o` or `e`. Within their blocks that is 6 for `v`, and 7 or 0 for `r`. Putting `r` on 7 keeps `m` on 0.

| Design | Hard pairs | Soft pairs | Pitch gap on test pairs (sum) |
|---|---|---|---|
| Today (`u a o e`, today's consonants) | pass | pass | 27 |
| `a o e u`, today's consonants | **fails v/w, r/w**; 8 is the negative marker `ru` | pass | — |
| **`a o e u`, `h`↔`v`, `l`↔`r`** | pass | pass | 19 |

The pitch gap is lower because a scale puts neighbouring digits on neighbouring pitches, and neighbouring digits are the most confusable consonant pairs (`b`/`d`, `d`/`g`, `m`/`n`). Their vowels still always differ, which is what the confusion test requires; only the pitch backup on top of it is smaller. Digit 7 `re` sounds like the rank marker `re`, as digit 8 does today; the marker always comes straight after the role letter.

**Rejected:** keeping today's digits (they climb from 2 to 5 and from 6 to 9, but 1 is the top note, so digits are not scale degrees); moving the exponent filler to `we` / `wo` so `vu` and `ru` could stay (loses the *add* / *undo* cue and makes digit 8 the negative marker); counting down to hear a rising scale (counts, ranks and scale degrees all go up).

### Number cues

The table in [numbers.md § counts](../grammar/numbers.md#counts) keeps two patterns:

- **Consonant:** 1–3 are the stops **b d g**, each further back in the mouth; 4–6 the breathy sounds **h z v**, each further forward; 7–0 the four [word endings](../grammar/word-endings.md) **r l n m**.
- **Vowel:** the digits climb the vowel pitches **a o e u** from 1, low to high, like the notes of a scale.

Ending cues: a **7**'s stroke runs back to the left, and **-r** is the ending that points back; an **8** is a loop (*l* for *loop*); for **0** the lips close and nothing comes out (*mmm*).

### What else moves

- **Alphabet.** The alphabet's consonants follow digit order, so they become `b d g h z v r l n m`, then `w y th x`. Reciting the digit letters' names walks down the pitches.
- **Finger code.** Consonant shapes are digit counts, so `h` takes the flat hand (4) and `v` thumb + index (6); `r` and `l` trade the 7 and 8 shapes. On piano, `v` becomes the letter learned separately (thumb + index strike neighbouring keys, so it is `z` + hook). Hooked letters are unchanged.
- **Pegs.** Each digit consonant still spells one digit, so every 0–9 and 00–99 cell stays filled; roots with `h`, `v`, `l` or `r` spell new digits. The root-tail cues on [pegs.md](../grammar/pegs.md) (2 food, 5 animal, 9 title) keep their digits.

### Steps (one change)

1. Number code: `NUMBER_SYLLABLES` in [`src/tts/numbers.ts`](../../src/tts/numbers.ts). [`src/finger-code.ts`](../../src/finger-code.ts) and [`src/digit-pegs.ts`](../../src/digit-pegs.ts) derive from it; check that the parser's number reader does too. Turn the confusion test into a unit test over the hard and soft pairs, fillers and markers included.
2. A one-off **renumber** script: parse every number word in `docs/`, `data/` and `src/game/` (quests and narration in [`quests.ts`](../../src/game/quests.ts) and [`scene.ts`](../../src/game/scene.ts)), read its digits, respell from the new table, re-parse. Then run the game's content lint and reachability tests.
3. Letter names: the letter-name tables in [phonology.md](../grammar/phonology.md#letter-names) (the retie letter-name pass reads them), the spell-outs marked `<!-- retie: letter-names -->`, and any page that names a digit letter aloud. Check that no new syllable or name collides with a bare CV word.
4. Grammar text: [numbers.md § counts](../grammar/numbers.md#counts) (table and cues above; drop "That is also their order in the alphabet"; the marker line becomes *rank `re`, digit 7 `re`*), [phonology.md § letter names](../grammar/phonology.md#letter-names) (consonant order, the digit-letter table, the alphabet comment), [numbers-applied.md](../grammar/numbers-applied.md), [numeric-derivation.md](../grammar/numeric-derivation.md), [pegs.md](../grammar/pegs.md) examples, [finger-code.md](../grammar/finger-code.md) (consonant table, the `h` piano note, examples), [cheat-sheets](../grammar/cheat-sheets/), flashcards, any Claritish lesson that spells a number.
5. Meta: [design-decisions.md § digit syllables](../meta/design-decisions.md#digit-syllables): the scale cycle, the consonant blocks (`h z v`, `r l n m`), the confusion table above, and the rejected alternatives.
6. `npm run build`, `npm test`, `node scripts/pegs.mjs --check`.

## Phase 3: stack order u o a e

Stacks follow **u o a e** ([why stacks have their own order](#why-stacks-have-their-own-order)), and the vowels at the end of the alphabet follow the same order, so the rule that a stack puts its vowels in alphabetical order still holds.

| Stack | Pitch | Contour |
|-------|-------|---------|
| `ua` | 4 → 1 | big fall |
| `uo` | 4 → 2 | medium fall |
| `ue` | 4 → 3 | small fall, high |
| `oa` | 2 → 1 | small fall, low |
| `ae` | 1 → 3 | medium rise |
| `oe` | 2 → 3 | small rise, mid |

Three falls from the top, one low fall and two rises. `oa` falls where the other two non-`u` stacks rise, so it is at least two steps from each of them at one end. The `u` stacks keep their spelling and their `u`-first readings (`zual`, `ruo`, `rua`, `rue`). `ae`, `oe` and `roe` are unchanged. **Only `ao` → `oa` changes.**

A reversed stack is still not a word, and the contour backs that up: a fall where a rise belongs (or the reverse) tells the listener something went wrong.

### What `ao` → `oa` touches

About 120 code spans in 26 grammar pages, 3 rows of [`lexicon-overlays.csv`](../../data/lexicon-overlays.csv), the Claritish feelings lesson and cheat sheet, the `"ao"` literals in the parser, and the game's polar table. Roots never contain two vowels in a row, so **no root changes**.

| Use | Today | New | Cue today | Read as `oa` | Verdict |
|-----|-------|-----|-----------|--------------|---------|
| Inclusive *and/or* join ([joins](../grammar/joins.md)) | `zaol` / `zaom`, … | `zoal` / `zoam` | **a** then **o**; *X is enough*, *at least X* | **o** one, then **a** add: *at least one, more may join* | better |
| Join-across-roles ([join-across-roles](../grammar/join-across-roles.md)) | `xaon`, `vaon`, `thaol`, `thaor` | `xoan`, `voan`, `thoal`, `thoar` | add then one; *more may follow* | one, then add: *this one, and maybe more* | better |
| Open to / among ([join-across-roles](../grammar/join-across-roles.md)) | `gaon` / `haon` | `goan` / `hoan` | add + one (admit, still open) | one admitted, more may be added | better |
| Restrictor ([restrictors](../grammar/restrictors.md)) | `haol` / `haom` | `hoal` / `hoam` | add + one | one time suffices, others add | neutral |
| Extra-noun hook *on* / *over* ([hooks](../grammar/hooks.md)) | `aol` / `aom` / `aor`, `owurelaol` | `oal` / `oam` / `oar`, `owureloal` | add onto one face | one face, added onto; `oal` also starts like English *on* | better |
| Discourse *for example* ([hooks](../grammar/hooks.md)) | `aol …` / `aom …` | `oal …` / `oam …` | add one: a single sample | one sample, added | neutral |
| Scope *on this pair* ([predication](../grammar/predication.md#scope-stacks)) | `thao` | `thoa` | **ao** ≈ on (fixed meaning) | same fixed meaning, same *on* cue as the hook | neutral |
| Result role vowel ([roles](../grammar/roles.md#result)) | `ao` + `x` | `oa` + `x` | add one: a new thing in the world | one new thing, added to the world | neutral |
| Emotion locus CIRCUM ([sakes](../grammar/sakes.md#emotion-compose)) | `wuwathuraor` | `wuwathuroar` | hook *over* | hook *over* | neutral |
| Two tags *A and O* ([pronouns](../grammar/pronouns.md#tag-pairs)) | `zwaor` | `zwoar` | one spelling whichever is named first | same | neutral |
| **Polar stance *sure*** ([questions](../grammar/questions.md)) | `yaol` / `yaom` / `yaor` | `yoal` / `yoam` / `yoar` | **first vowel = family**: **a** accept + **o** this option | first vowel **o** is the pass family (`yoel` *I won't answer*) | **breaks** |

Most `ao` cues read as well or better reversed: *one, and more may follow* is exactly what an inclusive or open pick means. The one rule that breaks is the polar stance map in [questions.md](../grammar/questions.md), which reads the **first** vowel as the family (**a** accept, **u** undo, **o** pass) and the second as what is answered. Under stack order `u o a e`, `a` can never come before `o`, so *sure* cannot start with `a`.

**Fix: read the polar pair by which vowels it contains, not their order.** `u` in the pair is the undo family; otherwise `a` is the accept family; otherwise `o`, pass. The other vowel says what you are answering. Every stance word keeps its reading:

| Word | Contains | Family | Other vowel | Reading |
|------|----------|--------|-------------|---------|
| `yael` | `a` | accept | `e` claim | *true* |
| `yoal` | `a` | accept | `o` option | *sure* |
| `yuel` | `u` | undo | `e` claim | *false* |
| `yuol` | `u` | undo | `o` option | *not that* |
| `yual` | `u` | undo | `a` premise | *the question doesn't apply* |
| `yoel` | neither | pass | `e` order | *I won't answer* |

The ranking is its own short rule, not a vowel order: undo outranks accept, and accept outranks pass, so a pair that undoes anything is a rejection, whatever else it names. Pronoun tag pairs already ignore order ("one spelling, whichever tag you name first"), so the fix makes stance words consistent with them.

### Steps (one change)

1. Parser: the `"ao"` literals in [`src/parse/`](../../src/parse/) (`types.ts` `RoleVowel` / `ScopeVowel` / locus, `constructions.ts` `JoinSeries`, `resolve.ts`, `enforce.ts`, `classify.ts`, `gloss-inverse.ts`, `morph-gloss.ts`, `hook-compounds.ts` (`"aol"`, `"aom"`), `sentence-parser.ts` incl. `IMPLIED_SUBJECT_SERIES`), and the `"aol"` hook in [`src/lint/template-trace.ts`](../../src/lint/template-trace.ts). Then `npm run grammar-check`.
2. Game: the `POLARS` table in [`src/game/read.ts`](../../src/game/read.ts) (`ao: "sure"` → `oa`) and its tests; any Agebon in quests and narration ([`quests.ts`](../../src/game/quests.ts), [`scene.ts`](../../src/game/scene.ts)) goes through the restack script in step 4. Run the game's content lint and reachability tests.
3. **Check feeling words and role compounds.** These are the two places where `oa` sits inside a longer word, so a new split could appear. Add parser tests (and lines to the doc examples `grammar-check` covers) that pin one tree each:
   - **Feeling words:** sake word + locus `oa` + motion ending, e.g. `wuwathuroar` and `thuwathuroar`. The parse must read locus `oa` + **-r**, never locus `o` followed by a stray `ar`, and every other locus (`a`, `uo`, …) must still parse beside it.
   - **Role compounds:** role letter + `oa` + `x` + event stem (the result role), and the bare role pointer built on it. The parse must read the two-vowel slot `oa`, never role vowel `o` with `a` starting the stem, and must not collide with any other role vowel before `x`.
   - Run `node scripts/parse.mjs --check-ambiguity` on each test form and on the converted doc examples that contain them.
4. A one-off **restack** script, not a bulk text replace: parse each Agebon code span and example line in `docs/`, rewrite only tokens whose parse names the `ao` stack, and re-parse. Dry run, read the list, write. The same pass covers `data/lexicon-overlays.csv`, `data/claritish-*`, and game content in `src/game/`.
5. **Polar stance rule.** In [questions.md](../grammar/questions.md) § polar stance, replace "The first vowel gives the family … The second vowel says what you are answering" with the contents rule:
   > Read the pair by which vowels it has, not their order. A pair with **`u`** is the undo family. Otherwise a pair with **`a`** is the accept family. Otherwise it is the **`o`** family: pass. The other vowel says what you are answering: **`e`** the claim or the order, **`o`** this option, **`a`** the question's own premise.
   - Respell `yaol` / `yaom` / `yaor` to `yoal` / `yoam` / `yoar` in the inventory tables, beginner text and examples; the cue column for *sure* becomes **a** ≈ add (accept) + **o** ≈ this option.
   - Update the parser's stance reading and the morph gloss for `yoal`, and pin it with a test that every stance word keeps its reading (table above).
   - Add the rule to the polar stance [cheat sheet](../grammar/cheat-sheets/) row and the `--llm-prompt` reader note if either restates the first-vowel rule.
6. Grammar text:
   - [phonology.md](../grammar/phonology.md): the vowel rows of the letter-name table and the alphabet comment in **u o a e**; the stack paragraph lists the stacks in that order, with the contour table and a line on why stacks mix falls and rises.
   - Every page that names the order in prose ("stack **a** then **o**" in [joins.md](../grammar/joins.md); cue lines "add then one" in [join-across-roles.md](../grammar/join-across-roles.md), [restrictors.md](../grammar/restrictors.md), [hooks.md](../grammar/hooks.md), [roles.md](../grammar/roles.md#result)) rewritten as *one, then add*.
   - [compounds.md](../grammar/compounds.md) role-vowel list, [terminology.md](../grammar/terminology.md) cochoice row, [english.md](../grammar/english.md) rows.
7. Meta: [design-decisions.md](../meta/design-decisions.md) stacked-vowels entry (why stacks have their own order, the scoring table; the near-twin argument is unchanged); [unassigned-reserved.md](../meta/unassigned-reserved.md) reversed stacks become `au` `ou` `eu` `ao` `ea` `eo`.
8. `npm run cheat-sheet-blocks -- --write`, `npm run build`, `npm test`, `npm run english-helper-recall -- --check`.

## Writing the grammar edits

Every grammar page, cheat sheet, Claritish page, generated prompt and code comment touched by this proposal presents **only the result**, for a reader meeting Agebon fresh ([present the current language only](../meta/grammar-docs.md#present-the-current-language-only)):

- Never mention an earlier digit syllable, letter name, digit consonant, stack spelling, vowel order, finger shape or edge pitch, and never say that anything changed, swapped or was reordered.
- Teach each order as simply what it is: digits climb the vowel pitches; letter names use the opposite vowel; the finger code's vowel shapes count up the pitches like the digits, and the instruments follow; stacks and the alphabet's vowels follow **u o a e** so stacks sound different from each other. Give the reason in present terms, never as a contrast with what came before.
- Cues are written for the current spelling (*one, then add* for `oa`), not as a reversal of another cue.
- In [design-decisions.md](../meta/design-decisions.md), other choices appear only as **rejected alternatives** (stacks in pitch order, the other stack orders in the scoring table, digits that do not climb, the `we` / `wo` filler, vowel runs from the index, finger shapes in alphabet order, edges as register shifts), never as former forms. Drop the sentence about a former reversed-sequence join `eo`, since `eo` is now simply a reversed stack.
- [unassigned-reserved.md](../meta/unassigned-reserved.md) lists the reversed stacks as closed spellings with the near-twin reason, with no note that any of them was once standard.

## Order of work

Phase 1 goes first: phases 2 and 3 teach their orders by pitch. Phase 2 lands before or with phase 3, because [numbers.md](../grammar/numbers.md#counts) teaches today's digit cycle as the alphabet's vowel order, which phase 3 changes. Each phase is one change, so no published page mixes digit tables or stack spellings.

## Decisions

- **Three orders, one to memorize.** Pitch order read down (vowel pitches, letter names) or up (digits, finger-code vowel shapes, instruments), and the stack order `u o a e` (stacks, the alphabet's vowels). Stacks cannot follow pitch, since every stack would then fall; see [why stacks have their own order](#why-stacks-have-their-own-order).
- **Digits climb, names descend.** Digits are scale degrees (`a o e u` from 1); letter names keep the opposite-vowel rule, which makes them the scale walked down.
- **Vowel shapes count like digits.** Runs of 1 to 4 fingers from the pinky, in digit order, so signing, touch, piano and guitar share *more fingers, higher vowel*, and the left hand's piano keys climb with the count; see [finger code and instruments](#finger-code-and-instruments).
- **Sentence edges are rests; stress is loudness.** Pitch carries the vowels and the `?` mark only; see [one job per dial](#one-job-per-dial).
- **Syllabic `l`: fixed mid pitch, +4 semitones** (between `o` +3 and `e` +5; it narrows with the range like the vowels). It never copies a neighbour. In `blral` the beat after it is the number marker vowel; copying that pitch would blur the `l` into a long vowel and hide the extra beat that tells `blral` from `bral`. A fixed pitch is also one rule with nothing to look ahead for.
- **Naming: keep "tone marks"; call the new feature *vowel pitch*.** The marks already use *tone* in its everyday English sense (*tone of voice*: teasing, gentle, unsure), which is exactly what they mean. *Vowel pitch* says plainly what the new feature is, and leaves *tone* with one meaning. When absorbed, grammar pages, the terminology page and cheat sheets use *vowel pitch* (*the pitch of `u` is high*); this proposal already uses that wording.
- **Rising stacks are not question-like.** A yes/no question is spelled with the unstacked question word `yol` ([questions](../grammar/questions.md)), and the only pitch mark, `?`, raises a whole word's range. No contour means *question*, so a rising `ae` or `oe` cannot be heard as one.

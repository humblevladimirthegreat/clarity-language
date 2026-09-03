# Proposal: diphone concatenative Speak (replace Kitten)

**Status:** PROPOSED  
**Related:** existing Speak stack in `learner-tts.md` (parse → `toSpeech` → `toPhonemes` stays); inverse dictation is `learner-stt.md`; sung contours (same bank) in `diphone-singing.md`; phones from [phonology.md](../grammar/phonology.md)  
**Design authority:** spoken forms and IPA stay in the grammar docs. This proposal covers **only** the **`synthesize`** stage: a recorded Agalan diphone bank plus in-browser concatenation. It does not change letters, phonotactics, or writing→speech maps.

## Motivation

KittenTTS is an English-trained neural vocoder with an IPA tokenizer. Feeding Agalan G2P still imposes **English rhythm** (stress-timed shortening, pull toward schwa). The current workaround lengthens non-final vowels (`ː` in `wordIpaPhones`) so Kitten does not reduce them. That is not Agalan phonology.

Learners need to hear the [phonology](../grammar/phonology.md) table: four full vowels, stacked vowels as **two syllables**, monophthong **`o`**, `/ɦ/` and `/ɹ/` as specified. A diphone concatenator plays **those** takes, with **duration owned by the engine** (equal syllable timing), not by an English acoustic prior.

There is **no** off-the-shelf IPA-universal diphone database. MBROLA / Festival banks are other languages (English `/oʊ/`, Spanish tap **r**, missing `/ʌ/` `/ɦ/`). Reusing them would repeat Kitten’s class of error. The bank is **one speaker, recorded for Agalan**.

## Goals

1. Replace Kitten ONNX as the default **native** synthesizer for docs Speak (Inspect / gloss Play).
2. Keep **`toSpeech` / `toPhonemes`** as the only Agalan-specific linguistic stages; `synthesize` consumes the phoneme plan (phones, syllable breaks, boundary tags).
3. Concatenate **diphones** (mid-phone to mid-phone), not CV islands spliced on vowel edges.
4. **Own timing:** equal (or coda-weighted) ms per syllable; stretch the **steady vowel**, not the burst. Drop the Kitten `ː` length hack from G2P.
5. **Own pitch:** record near-monotone; impose F0 at synthesis (flat, then coarse drops at documented boundaries). Takes need not share exact Hertz.
6. Ship **offline** in the browser (audio sprite or per-unit buffers + Web Audio). No cloud TTS. No English G2P.
7. Inventory **derived from phonotactics**, not a full 18×18 phone grid.

## Non-goals

- Neural Agalan voice training, Toucan / FastSpeech2, or fine-tunes on eSpeak.
- Studio naturalness, singing, or musical timing (phonology singability stays a **design** filter; Speak stays speech).
- Unvoiced **style** allophones in v1 (`/k t p s f h/` etc.) — default **voiced** inventory only.
- Reusing MBROLA/Festival diphone files as the shipped voice.
- Changing [phonology.md](../grammar/phonology.md) to match a synthesizer.
- Speaking opaque / foreign interiors as Agalan (same loan policy as `learner-tts.md`).
- Perfect discourse intonation beyond existing SpeechPlan pause / turn / continue tags.

## Pipeline

```text
PhonemePlan (existing)
        │
        ▼
┌──────────────────────────┐
│  diphone sequence        │  phone_i – phone_{i+1} including # silence
└──────────┬───────────────┘
           ▼
┌──────────────────────────┐
│  overlap-add + stretch   │  join in the steady mid-phone; hold vowels
└──────────┬───────────────┘
           ▼
┌──────────────────────────┐
│  F0 / energy (optional)  │  TD-PSOLA or equivalent; clause-boundary dip
└──────────┬───────────────┘
           ▼
        AudioBuffer
```

`toPhonemes` stays the [letter table](../grammar/phonology.md): **`e`** `/e̞/`, **`u`** `/ʌ/`, **`o`** `/o/`, **`a`** `/ɑ/`, **`h`** `/ɦ/`, **`r`** `/ɹ/`, **`x`** `/ʒ/`, word-final **`sh`** `/ʃ/`. The concatenator maps those IPA symbols onto **unit ids**, not onto English ARPAbet.

## Diphone definition

A diphone is the waveform from the **middle of phone A** to the **middle of phone B**. The A→B formant transition lives **inside** one file. Concatenation overlaps the two **steady** middles (same phone on both sides of the join) with a short crossfade (~10–30 ms).

Example: `zazawan` → `#–z`, `z–ɑ`, `ɑ–z`, `z–ɑ`, `ɑ–w`, `w–ɑ`, `ɑ–n`, `n–#`.

Naive CV files join on the **edge** of the vowel (worst splice). Diphones join where the spectrum is stable.

## Inventory (legal set only)

Phone set for v1 (plus silence `#`):

| Kind | IPA |
|------|-----|
| Vowels | `/e̞/` `/ʌ/` `/o/` `/ɑ/` |
| Onsets | `/ɦ/` `/w/` `/ɡ/` `/d/` `/j/` `/b/` `/z/` `/m/` `/n/` `/v/` `/l/` `/ɹ/` `/ʒ/` |
| Extra coda | `/ʃ/` (plural **-sh** only) |

Do **not** ship unused C–C pairs. Generate the list from [phonotactics](../grammar/phonology.md#phonotactics) and [number-word exception](../grammar/phonology.md#number-word-exception):

| Pattern | Diphones |
|---------|----------|
| Word edge | `#–C` (PoS), `#–V` if needed, coda/`ʃ`–`#` |
| Open syllables | every attested **C–V** and **V–C** (root `(CV)+` after the role letter) |
| Hiatus | all **V–V** (stacked vowels are two syllables) |
| Endings | **V–l/m/n/ɹ**; then **-lsh** etc. **l/m/n/ɹ–ʃ**, **ʃ–#** |
| Number marker | documented **PoS–ɹ** then **ɹ–V** (`ra` / `ru` / `re` / `ro`, **`eu`** as `e–ʌ`) |
| Adjective **gl-** | **`ɡ–l`** then **l–V** |

Expect on the order of **150–220** units, not ~360. A TypeScript fixture enumerates the set; missing unit at Speak time is a hard error (beep / skip that span), never an English fallback.

## Recording

- **One speaker**, one session if possible, same mic distance, quiet room.
- **Near-monotone** on a chosen note (slightly sung, vowels held) so later F0 imposition has clean periods. Exact match across takes is **not** required once PSOLA/WORLD (or equivalent) retunes F0.
- **Carrier** frames (phone not at breath edge), e.g. hold vowel — *target* — hold vowel. Cut in Praat (or equal) at mid-phone.
- Store 16-bit PCM (or a packed sprite + index JSON). Unit id = `A+B` IPA keys used by the concatenator.
- License the recordings for the docs site (unlike many MBROLA voices).

v1 quality bar: **language-lab clear**, metronomic syllables, audible splices acceptable if phones are right. Not a human conversation.

## Synthesis rules

| Parameter | v1 policy |
|-----------|-----------|
| Syllable duration | Equal ms per syllable (tune one constant); last syllable may add coda time |
| Stretch | Time-scale the **vowel steady state** inside the diphone; do not smear stops |
| F0 | Constant; small fall at `.` / `?` / `!` and the existing `/j/` vs `/x/` tags from the SpeechPlan |
| Energy | Match overlap RMS so joins do not pump |
| Join | Equal-power crossfade in the mid-phone overlap |
| Gap | SpeechPlan pauses only; no extra English-like isochrony |

Remove `kittenLengthNucleus` / non-final `ː` once this engine is default. Phoneme fixtures stay **short** vowels as in phonology.

## Browser / bundle

| Piece | Ship? | Notes |
|-------|-------|-------|
| Kitten ONNX + ORT WASM | **Remove** from default Speak when diphones ship | Optional “legacy neural” behind a flag only if still useful for demos |
| Diphone sprite + index | Yes | Dominates bytes; lazy-load on first Play (same gate as today’s model fetch) |
| Concatenator TS | Yes | Small; no PyTorch |
| TD-PSOLA / light vocoder | v1 if monotone glue clicks on F0; else raw overlap-add first | Prefer the smallest thing that hides pitch jumps |

No IMS-Toucan in the docs path (Python, large, approximate phones).

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Clicks / double consonants | Recut mids; longer overlap only on vowels |
| Pitch yodel | Monotone takes + F0 imposition; do not ship raw glue if F0 varies |
| Missing number **PoS–ɹ** units | Inventory fixture includes every number PoS from [numbers.md](../grammar/numbers.md) |
| Speaker drift across sessions | Re-record the whole bank rather than mixing rooms |
| Bundle size | Sprite compress (Opus/ADPCM); lazy-load; voiced-only v1 |
| Learners copy the metronome as “the accent” | UI copy: instructional timing; phonology still allows musical stress later |

## Alternatives considered

| Alternative | Why not default |
|-------------|-----------------|
| Keep Kitten, more `ː` / stress marks | Treats English reduction as the problem to patch |
| Equal-syllable **CV** concat | Simpler record list; splices on the vowel edge |
| Formant / Klatt | Exact targets possible; more robotic than recorded diphones |
| IMS Toucan + forced duration | Human timbre; phones still approximate (`/oʊ/`, `/ɦ/`, `/ɹ/`) |
| MBROLA `us*` / `es*` | Wrong phonology; often non-commercial voices |
| FastSpeech2 LJSpeech | English prior with a duration knob |

## Acceptance criteria

- [ ] Legal diphone list is generated from phonotactics + number **PoS–ɹ** + **gl-** + **-sh** clusters; tests fail if Speak requests an unlisted unit.
- [ ] Native example words from [phonology.md](../grammar/phonology.md) play with **one vowel nucleus per letter**, no G2P `ː`.
- [ ] Hiatus (`juon` = `/ju.on/`) is two syllables of comparable length.
- [ ] Default Speak path does not load Kitten for native Agalan.
- [ ] Offline after first sprite load; no cloud.
- [ ] Opaque interiors still do not use Agalan units (loan policy unchanged).
- [ ] Recording protocol (carrier, cut points, F0 note) is documented next to the bank (editor path under `docs/grammar/public/tts/` or `data/tts/`, not a grammar teaching page).

## Phased delivery

1. **Inventory + concatenator on silence/tones** — sequence builder + overlap-add with placeholder tones; fixtures for `zazawan`, `juon`, `zelulul`, a number word, `…sh`.
2. **Record + label** the legal bank (voiced only).
3. **Wire Speak** — swap Kitten; drop vowel-length hack; lazy-load sprite.
4. **F0 / pause** — map existing SpeechPlan boundary tags onto a flat pitch plus falls.
5. **Loan islands** — unchanged from `learner-tts.md` Phase 4 (`speechSynthesis` or skip).

## Cross-links

| Topic | Doc |
|-------|-----|
| Letter IPA | [phonology.md](../grammar/phonology.md) |
| Phonotactics / **-sh** / **gl-** / number **r** | [phonology.md](../grammar/phonology.md#phonotactics) |
| SpeechPlan / G2P | `src/tts/` (`phonemes.ts`, `plan.ts`); Kitten adapter is what this replaces |
| Writing → speech | [spans.md](../grammar/spans.md#writing-vs-speech), [numbers.md](../grammar/numbers.md#writing-preferred-shorthand) |
| Current Kitten fetch | [public/tts README](../grammar/public/tts/README.md) |

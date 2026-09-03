# Proposal: diphone singing (pitch / timing contour)

**Status:** PROPOSED  
**Related:** waveform units and concat glue in `diphone-tts.md`; parse → `toSpeech` → `toPhonemes` in `learner-tts.md`; singability **design** (not this UI) in [phonology.md § Singability](../grammar/phonology.md#singability-constraints)  
**Design authority:** letters, syllables, and voiced-preferred consonants stay in the grammar. This proposal is **tooling only**: the same recorded diphone bank, with a **drawn F0 + duration contour** instead of spoken defaults. It does not add melody to the language or a singing orthography.

## Motivation

[Phonology](../grammar/phonology.md) is built so ordinary lines are easy to sing: mid-to-open vowels, one nucleus per letter, almost no mid-word codas, voiced consonants so a note can continue. Docs Speak still **speaks**. Kitten-class neural TTS cannot take a melody without an English singing prior.

Classic singing synth (Vocaloid-era concatenative, UTAU) is diphones plus a **score**. `diphone-tts.md` already imposes F0 and stretches vowel mids for speech (flat pitch, equal ms). Singing is that renderer with the numbers coming from a **contour**, not a new model.

Spoken Play is then the boring special case of the same engine.

## Goals

1. Map a **contour** onto the existing phoneme / syllable plan (not onto English spelling).
2. **Timing:** note (or drag) length is absorbed by the **vowel steady-state**; onsets and bursts stay short.
3. **Pitch:** F0 polyline or piano-roll notes, applied after concat (WORLD or PSOLA), not baked into the WAVs.
4. Keep **one human diphone bank** as the mouth; do not mix Toucan language ids or neural singers.
5. v1 range: **speech, chant, and simple melody** inside a safe shift of the recorded pitch (see [Pitch banks](#pitch-banks)).
6. Offline in the browser, same sprite as Speak once `diphone-tts.md` ships.
7. Optional later: MIDI / MusicXML as just another way to fill the two arrays.

## Non-goals

- Changing [singability constraints](../grammar/phonology.md#singability-constraints) or encoding stress/melody in spelling.
- Neural singing (DiffSinger, SynthV, “AI cover”) or cloning a singer.
- Choir, harmony, or multi-track v1 (one F0 stream).
- Studio Vocaloid expressivity (phoneme timing editors with dozens of flags) in v1.
- Unvoiced style allophones as a singing feature (same voiced-only bank as diphone Speak v1).
- Teaching English glosses as lyrics.
- Opaque / foreign interiors as Agalan melody (same loan skip as Speak).

## Pipeline

```text
PhonemePlan (syllables, phones, #)
        +
Contour (ms[] + f0[] per phone, or note grid)
        │
        ▼
diphone sequence (same as Speak)
        │
        ▼
time-scale vowel mids to contour ms
        │
        ▼
replace F0 (WORLD preferred for leaps; PSOLA for small range)
        │
        ▼
        AudioBuffer
```

Speech defaults when no contour is supplied:

| Field | Speak | Sung |
|-------|--------|------|
| Syllable ms | One constant (equal timing) | From contour |
| F0 | Flat + boundary fall from SpeechPlan tags | From contour; tags may still insert rests |
| Joins | Mid-phone overlap-add | Same |

## Contour model

Aligned to **phones** (or to syllables with consonants locked to the vowel):

```ts
type PhoneContour = {
  durationMs: number;
  f0Hz: number[]; // 1+ breakpoints through this phone; vowels may be a held note
};

type SingingPlan = {
  phones: /* from toPhonemes */;
  contour: PhoneContour[];
};
```

**Rules:**

- **Onset consonants** (`/z/` in `za`): short; F0 may track the following vowel or stay unvoiced-noise-shaped; do not stretch to a whole beat.
- **Nucleus:** holds the note. Hiatus (`juon` = `/ju.on/`) is **two** nuclei — two notes, or one note with two vowel qualities in sequence, never a diphthong slide unless the contour **draws** a glide (discouraged; fights phonology).
- **Coda** (`/n/` in `wan`, `/ʃ/` in **-sh**): short at the end of the last note; word-edge still audible as in singability notes.
- **Rests:** SpeechPlan pauses and explicit contour gaps; not English isochrony.
- **Legato:** no gap + voiced diphones. **Attack:** optional `#` or a short glottal if the editor marks a new note onset on a vowel-initial syllable.

v1 UI for **one word:** X = syllables from `toPhonemes`; drag bar widths; draw or snap F0 on vowel bars; consonant slivers stay glued to the left of each nucleus (onset) and to the last bar (coda). Phrase mode concatenates words; pauses are rests.

MIDI/MusicXML (later) maps lyric syllables to those bars. Lyrics must be Agalan speech-surface tokens, already expanded (`toSpeech`), not number shorthand.

## Pitch banks

<a id="pitch-banks"></a>

The bank in `diphone-tts.md` is recorded **near-monotone** on one note. Imposing F0 is clean for about a **fifth to an octave** before formants and grain fail (naive resample moves formants; WORLD keeps envelope and swaps F0, still degrades far from the take).

| Phase | Bank | Use |
|-------|------|-----|
| Speak / chant / v1 song | One pitch | Melody stays near the recorded note |
| Wider song | Same diphones at 2–4 pitches (e.g. low / mid / high), crossfade by target F0 | UTAU-style; **same speaker**, same cut points |

Do not record a new **language**; only extra **F0** sessions of the same inventory. v1 does not block Speak on missing high banks.

Vibrato, scoop, and portamento are F0 wiggles on the contour, not extra diphones.

## Browser / bundle

Same sprite as diphone Speak. Singing adds:

- Contour editor (docs page or Inspect experiment) — JS, lazy.
- WORLD/PSOLA WASM (or a small vocoder already chosen for Speak F0). If Speak v1 ships raw overlap-add only, **singing is blocked** until F0 imposition exists; this proposal **depends** on that step in `diphone-tts.md`.

No extra neural weights.

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Chipmunk / gravel on wide melody | Document safe range; extra pitch banks later |
| Stretched `/z/` hiss | Editor + engine: duration budget is vowel-only |
| Hiatus sung as English `/ju/` | Two nuclei in the plan; fixtures on `juon` |
| Learners think spelling marks pitch | Contour is UI-only; grammar stays unstressed |
| Joins worse when notes jump | Crossfade still mid-phone; optional tiny `#` at leap |
| WORLD WASM size | Share with Speak; load on first Sung Play |

## Alternatives considered

| Alternative | Why not default |
|-------------|-----------------|
| Neural singer + Agalan text | English/multilingual prior; diphthongs on high notes |
| MIDI karaoke on Kitten | Same Kitten timing/phone problems |
| Separate sung recordings per song | Not a generator; no arbitrary grammar examples |
| Formant singing (vocal tract model) | Exact F0; less like the human diphone voice |
| Bake melody into diphone WAVs | Would explode the inventory; contour must stay data |

## Acceptance criteria

- [ ] Diphone Speak F0 imposition exists (dependency).
- [ ] A `SingingPlan` (or equivalent) plays a phonology example on a **held monotone** longer than speech, phones unchanged (no G2P `ː`).
- [ ] Same word with **two different syllable width** contours changes timing, not letter identity.
- [ ] Hiatus: `juon` remains two vowels under a two-note contour.
- [ ] v1 documents the safe F0 window around the recorded pitch.
- [ ] Offline after sprite + vocoder load; no cloud.
- [ ] Grammar pages do not claim a sung orthography.

## Phased delivery

1. **Data model + fixtures** — contour on `toPhonemes` output; CLI dump of ms/F0; no UI.
2. **Engine** — vowel stretch + F0 replace on the diphone chain (chant a word on 1–3 notes).
3. **Word editor** — draw timing + pitch on Inspect (or a dedicated lab page under grammar public, not a teaching chapter).
4. **Phrase + rests** — SpeechPlan pauses; optional MIDI in.
5. **Pitch banks** — if v1 range is too small for real tunes.

## Cross-links

| Topic | Doc |
|-------|-----|
| Singability (language design) | [phonology.md](../grammar/phonology.md#singability-constraints) |
| Letter IPA / hiatus | [phonology.md](../grammar/phonology.md) |
| Diphone bank / concat | `diphone-tts.md` |
| SpeechPlan / G2P | `src/tts/` |

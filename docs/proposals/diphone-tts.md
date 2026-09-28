# Proposal: diphone concatenative Speak

**Status:** PROPOSED  
**Related:** kept linguistic stages in `src/tts/` (parse → `toSpeech` → `toPhonemes`; see [Existing stages](#existing-stages)); inverse dictation is `learner-stt.md`; sung contours (same bank) in `diphone-singing.md`; phones from [phonology.md](../grammar/phonology.md)  
**Design authority:** spoken forms and IPA stay in the grammar docs. This proposal covers the **`synthesize`** stage (a recorded Agazan diphone bank plus in-browser concatenation) and the site **Speak UI**. It does not change letters, phonotactics, or writing→speech maps. It is the only proposal needed to reimplement Speak; the earlier `learner-tts.md` (KittenTTS) is rejected and its still-relevant policy is folded in below.

## Motivation

Learners need to **hear** Agazan, not only read it. Native `speechSynthesis` on raw orthography fails: letter values differ from English (`x` = /ʒ/), stacked vowels are separate syllables, and preferred **writing** forms (number shorthand, span brackets) are not what speech uses.

A first attempt shipped KittenTTS (an English-trained neural vocoder with an IPA tokenizer) and was removed: output was unreliable, the build downloaded the model from HuggingFace (failing in restricted networks), and feeding Agazan G2P still imposed **English rhythm** (stress-timed shortening, pull toward schwa). Its workaround — lengthening non-final vowels with `ː` — was not Agazan phonology and has been dropped from `wordIpaPhones`.

Learners need to hear the [phonology](../grammar/phonology.md) table: four full vowels, stacked vowels as **two syllables**, monophthong **`o`**, `/ɦ/` and `/ɹ/` as specified. A diphone concatenator plays **those** takes, with **duration owned by the engine** (equal syllable timing), not by an English acoustic prior.

There is **no** off-the-shelf IPA-universal diphone database. MBROLA / Festival banks are other languages (English `/oʊ/`, Spanish tap **r**, missing `/ɦ/`). Reusing them would repeat Kitten’s class of error. The bank is **one speaker, recorded for Agazan**.

## Goals

1. Provide the **native** synthesizer for docs Speak (Inspect / gloss Play; see [UI integration](#ui-integration)).
2. Keep **`toSpeech` / `toPhonemes`** as the only Agazan-specific linguistic stages; `synthesize` consumes the phoneme plan (phones, syllable breaks, boundary tags).
3. Concatenate **diphones** (mid-phone to mid-phone), not CV islands spliced on vowel edges.
4. **Own timing:** equal (or coda-weighted) ms per syllable; stretch the **steady vowel**, not the burst. G2P emits short vowels only.
5. **Own pitch:** record near-monotone; impose F0 at synthesis (flat, then coarse drops at documented boundaries). Takes need not share exact Hertz.
6. Ship **offline** in the browser (audio sprite or per-unit buffers + Web Audio). No cloud TTS. No English G2P. No build step that fetches from the network — the bank is committed (or published) with the repo.
7. Inventory **derived from phonotactics**, not a full 18×18 phone grid.

## Non-goals

- Neural Agazan voice training, Toucan / FastSpeech2, or fine-tunes on eSpeak.
- Studio naturalness, singing, or musical timing (phonology singability stays a **design** filter; Speak stays speech).
- Unvoiced **style** allophones in v1 (`/k t p s f h/` etc.) — default **voiced** inventory only.
- Reusing MBROLA/Festival diphone files as the shipped voice.
- Changing [phonology.md](../grammar/phonology.md) to match a synthesizer.
- Speaking opaque / foreign interiors as Agazan — see [Foreign and opaque](#foreign-and-opaque).
- Speaking parser recoveries or other material **not present in the written input** — see [Write-only surface](#write-only-surface).
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

`toPhonemes` stays the [letter table](../grammar/phonology.md): **`e`** `/e̞/`, **`u`** `/u/`, **`o`** `/o/`, **`a`** `/ɑ/`, **`h`** `/ɦ/`, **`r`** `/ɹ/`, **`x`** `/ʒ/`. The concatenator maps those IPA symbols onto **unit ids**, not onto English ARPAbet.

## Existing stages

These are implemented in `src/tts/` and tested; `synthesize` consumes their output.

```text
Agazan text → parse → toSpeech (SpeechPlan) → toPhonemes (PhonemePlan) → synthesize (this proposal)
```

| Stage | Input | Output | Owns |
|-------|--------|--------|------|
| **Parse** | Surface string | Typed AST | [parser-pipeline.md](../meta/parser-pipeline.md) |
| **`toSpeech`** (`plan.ts`) | AST | Ordered speech tokens + boundary tags + skipped items | Writing↔speech maps in spans / numbers |
| **`toPhonemes`** (`plan.ts`, `phonemes.ts`) | Speech tokens | Per-word syllables + IPA (`ipa` dotted for display; `ipaPhonemes` undotted stream with boundary punctuation) | [phonology.md](../grammar/phonology.md) letter table only |
| **`synthesize`** | Phoneme plan | Audio | This proposal |

Public helpers: `previewSpeech(text)`, `previewPhonemes(text)`, `skipLabel(reason)` (exported via `src/tts/browser.ts`, aliased `@tts-browser` in the VitePress config). Inspect already shows `previewPhonemes(text).words[].ipa` as the **IPA:** line. **No lexicon lookup** drives pronunciation of native Agazan.

### Speech normalization (`toSpeech`)

| Writing | Spoken behavior | Doc |
|---------|-----------------|-----|
| Free-number shorthand (`g+3`, `g#-2`, `d_…`, `%`, …) | Full CV number word, group-final stress mark `ˈ` | [numbers.md](../grammar/numbers.md#writing-preferred-shorthand) |
| Span brackets (`d[…]`, `d@[Hamlet]`, `th(…)`, …) | Open word + interior tokens + close when required | [spans.md](../grammar/spans.md#writing-vs-speech) |
| Span anaphor / empty (`d[=]`, `d[]`) | Spoken open only | same |
| Orthographic digit-group commas | Spoken separator per numbers.md | [numbers.md](../grammar/numbers.md#group-separator) |
| `.` / `?` / `!`, soft **-m** body | Boundary tags `period` / `qmark` / `bang` / `softM` | [dependents.md](../grammar/dependents.md#orthography-and-prosody-periods) |
| `/x/` continue vs new `/y/` turn | `xContinue` / `yTurn` | same |
| Scope island `^ … ^` | `islandEnter` / `islandExit`; no spoken words | [spans.md](../grammar/spans.md#scope-islands) |

Skip reasons (`foreign`, `writing`, `shorthand`, `punct`, `error`) are surfaced to the UI via `skipLabel`.

### Foreign and opaque

Never run Agazan G2P on opaque / foreign payloads (`d<sushi>`, `z<Sam>n`). The PoS…ending **shell** is Agazan; the interior is a **loan segment**. Today loan segments are skipped (`foreign`). Planned default: a brief browser `speechSynthesis` island in a `lang`-matched voice when available, else skip with a short pause and a tooltip (“foreign surface — not Agazan phonology”). Never substitute an Agazan unit or an English fallback for a missing native diphone.

### Write-only surface

Speak **only what appears in the input**, after documented writing→speech expansion. Parser recoveries, implied force, elided defaults, and other unspoken structure are never inserted.

## UI integration

The previous Speak UI was removed with Kitten; restore these surfaces when this engine ships:

| Surface | Behavior |
|---------|----------|
| [Inspect](../grammar/inspect.md) paste box | **Speak Agazan** button beside the existing **IPA:** line; a “Will speak: … / Skipped: …” preview built from `PhonemePlan.words` + `skipped` |
| Inspect card (hover / pinned) | **Speak word** button on the selected word or range; keyboard **`s`** speaks the selection |
| Name picker (`NameHelper.vue`) | **Say it** on the offered / chosen name (`<name>n.`) |
| Grammar examples (later) | Play control on fenced `agazan` lines / exercise keys |
| Errors | Show engine / load errors inline; skipped tokens listed, never voiced |

Behavior notes carried from the Kitten implementation:

- One shared composable owns `busy` / `loading` / `error`; a second press while speaking **stops** (generation counter so a stale finish cannot clear a newer run).
- Let the button paint its loading state (two animation frames) before heavy work starts.
- Synthesize in a **Web Worker**; play via Web Audio on the main thread.
- Lazy-load the bank on first Play; Inspect may prefetch on mount. Never autoplay.
- Accessible names on every button (“Speak Agazan”, “Speak word”, “Say it”).

## Diphone definition

A diphone is the waveform from the **middle of phone A** to the **middle of phone B**. The A→B formant transition lives **inside** one file. Concatenation overlaps the two **steady** middles (same phone on both sides of the join) with a short crossfade (~10–30 ms).

Example: `zazawan` → `#–z`, `z–ɑ`, `ɑ–z`, `z–ɑ`, `ɑ–w`, `w–ɑ`, `ɑ–n`, `n–#`.

Naive CV files join on the **edge** of the vowel (worst splice). Diphones join where the spectrum is stable.

## Inventory (legal set only)

Phone set for v1 (plus silence `#`):

| Kind | IPA |
|------|-----|
| Vowels | `/e̞/` `/u/` `/o/` `/ɑ/` |
| Onsets | `/ɦ/` `/w/` `/ɡ/` `/d/` `/j/` `/b/` `/z/` `/m/` `/n/` `/v/` `/l/` `/ɹ/` `/ʒ/` |
| Extra coda | none (plural **-x** is letter **x** `/ʒ/` after the ending) |

Do **not** ship unused C–C pairs. Generate the list from [phonotactics](../grammar/phonology.md#phonotactics) and [number-word exception](../grammar/phonology.md#number-word-exception):

| Pattern | Diphones |
|---------|----------|
| Word edge | `#–C` (PoS), `#–V` if needed, coda/`ʒ`–`#` |
| Open syllables | every attested **C–V** and **V–C** (root `(CV)+` after the role letter) |
| Hiatus | all **V–V** (stacked vowels are two syllables) |
| Endings | **V–l/m/n/ɹ**; then **-lx** etc. **l/m/n/ɹ–ʒ**, **ʒ–#** |
| Number marker | documented **PoS–ɹ** then **ɹ–V** (`ra` / `ru` / `re` / `ro`, **`eu`** as `e–u`) |
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
| F0 | Constant; small fall at `.` / `?` / `!` and the existing `/y/` vs `/x/` tags from the SpeechPlan |
| Energy | Match overlap RMS so joins do not pump |
| Join | Equal-power crossfade in the mid-phone overlap |
| Gap | SpeechPlan pauses only; no extra English-like isochrony |

Phoneme fixtures stay **short** vowels as in phonology (already the case).

## Browser / bundle

| Piece | Ship? | Notes |
|-------|-------|-------|
| Diphone sprite + index | Yes | Dominates bytes; lazy-load on first Play; committed with the site, not fetched at build time |
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
| KittenTTS (shipped, then removed) | Unreliable; English reduction patched with `ː`; network model fetch broke builds |
| eSpeak-NG WASM | Robotic, and its phone set approximates `/e̞/`, `/ɦ/`, `/ɹ/` |
| Web Speech API only | Cannot hit Agazan phones; kept only for loan islands |
| Cloud neural TTS | Network, cost, privacy, weak conlang phone control |
| Equal-syllable **CV** concat | Simpler record list; splices on the vowel edge |
| Formant / Klatt | Exact targets possible; more robotic than recorded diphones |
| IMS Toucan + forced duration | Human timbre; phones still approximate (`/oʊ/`, `/ɦ/`, `/ɹ/`) |
| MBROLA `us*` / `es*` | Wrong phonology; often non-commercial voices |
| FastSpeech2 LJSpeech | English prior with a duration knob |

## Acceptance criteria

- [ ] Legal diphone list is generated from phonotactics + number **PoS–ɹ** + **gl-** + **-x** clusters; tests fail if Speak requests an unlisted unit.
- [ ] Native example words from [phonology.md](../grammar/phonology.md) play with **one vowel nucleus per letter**, no G2P `ː`.
- [ ] Hiatus (`yuon` = `/ju.on/`) is two syllables of comparable length.
- [ ] Speak UI surfaces in [UI integration](#ui-integration) are restored and pass the Vue a11y lint.
- [ ] Offline after first sprite load; no cloud.
- [ ] Opaque interiors still do not use Agazan units (loan policy unchanged).
- [ ] Recording protocol (carrier, cut points, F0 note) is documented next to the bank (editor path under `docs/grammar/public/tts/` or `data/tts/`, not a grammar teaching page).

## Phased delivery

1. **Inventory + concatenator on silence/tones** — sequence builder + overlap-add with placeholder tones; fixtures for `zazawan`, `yuon`, `zelulul`, a number word, `…x`.
2. **Record + label** the legal bank (voiced only).
3. **Wire Speak** — restore the [UI integration](#ui-integration) surfaces; lazy-load sprite.
4. **F0 / pause** — map existing SpeechPlan boundary tags onto a flat pitch plus falls.
5. **Loan islands** — `speechSynthesis` island or skip, per [Foreign and opaque](#foreign-and-opaque).

## Cross-links

| Topic | Doc |
|-------|-----|
| Letter IPA | [phonology.md](../grammar/phonology.md) |
| Phonotactics / **-x** / **gl-** / number **r** | [phonology.md](../grammar/phonology.md#phonotactics) |
| SpeechPlan / G2P | `src/tts/` (`phonemes.ts`, `plan.ts`, `numbers.ts`, `spans.ts`) |
| Rejected predecessor | `learner-tts.md` (KittenTTS) |
| Writing → speech | [spans.md](../grammar/spans.md#writing-vs-speech), [numbers.md](../grammar/numbers.md#writing-preferred-shorthand) |

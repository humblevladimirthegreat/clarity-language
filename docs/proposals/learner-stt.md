# Proposal: learner STT (phoneme ASR, no Agalan speech corpus)

**Status:** PROPOSED  
**Related:** reverse of `learner-tts.md`; long-term TODO *speech to text*; parser assumed shipped ([parser-pipeline.md](../meta/parser-pipeline.md))  
**Design authority:** spoken forms stay in the grammar docs ([phonology.md](../grammar/phonology.md), [spans.md](../grammar/spans.md#writing-vs-speech), [numbers.md](../grammar/numbers.md#writing-preferred-shorthand), [core.md](../grammar/core.md#orthography)). This proposal covers **tooling only**: microphone audio → Agalan letters → optional preferred writing. It does **not** train an Agalan acoustic model.

## Motivation

Learners will want to **check pronunciation** (did this utterance match the example?) and later **dictate** drills. English-centric STT (unconstrained Whisper, Web Speech API) will invent English spelling and wrong phones (`j` as *jay*, `x` as *ks*, stacked vowels as diphthongs).

Agalan is a small, regular sound system with spelling that shows the sound. The expensive part of ASR is **acoustics**; the Agalan-specific part is **mapping phones to letters and legal words**. Existing open-source **universal / multilingual phoneme recognizers** already do the first job. This proposal reuses those models unchanged and puts Agalan knowledge in a thin inverse of the TTS stack (`toPhonemes` run backwards, then `toSpeech` run backwards).

**“Usable” here means:** careful, native-phonology speech from a learner mic becomes a speech-surface string (and, where documented, preferred writing). It does **not** mean English-Whisper quality, singing ASR, or a custom neural Agalan voice/listener.

## Goals

1. Transcribe **native Agalan speech** to the **spoken channel** (CV number words, spoken span opens/closes, ordinary `PoS+root+ending`).
2. Reuse a **pretrained phoneme ASR** (no Agalan recordings, no fine-tune on eSpeak).
3. Map phones → letters with the **same table** as [phonology.md](../grammar/phonology.md) / [`src/tts/phonemes.ts`](../../src/tts/phonemes.ts), including collapse of unvoiced **style** allophones.
4. Segment words using **phonotactics** (coda only at the word edge: **-l / -m / -n / -r**, optional **-sh**).
5. Optionally **snap** tokens to published roots and closed lists; optionally **compress** spoken numbers/spans to preferred writing (inverse of TTS `toSpeech`).
6. Keep fixtures **doc-locked**: phone collapse, letter map, and writing↔speech maps quoted from grammar pages.

## Non-goals

- Collecting or training on an Agalan speech corpus (including TTS-synthetic fine-tunes).
- Unconstrained Whisper / cloud dictation as the default engine.
- Singing mode.
- Guessing **opaque / foreign** interiors as Agalan (`d<sushi>`, `z<Sam>n`) — same policy as TTS: skip or mark, do not run native G2P.
- Inventing spoken or written forms not in the grammar docs.
- Replacing the parser as design authority.

## Chosen approach (option 1)

**Phoneme ASR + invert G2P + optional lexicon snap.**

```text
Microphone audio
        │
        ▼
┌──────────────────────────┐
│  pretrained phoneme ASR  │  Allosaurus / XLS-R CTC / SpeechBrain / ESPnet
│  (frozen weights)        │  output: IPA or phone alphabet
└──────────┬───────────────┘
           ▼
┌──────────────────────────┐
│  collapse allophones     │  unvoiced style → voiced letters
└──────────┬───────────────┘
           ▼
┌──────────────────────────┐
│  phonesToLetters         │  inverse of toPhonemes (phonology table)
└──────────┬───────────────┘
           ▼
┌──────────────────────────┐
│  segmentWords            │  legal coda / sh; hiatus = two syllables
└──────────┬───────────────┘
           ▼
┌──────────────────────────┐
│  snapLexicon (optional)  │  published roots + closed class
└──────────┬───────────────┘
           ▼
┌──────────────────────────┐
│  toWriting (optional)    │  inverse of toSpeech (numbers, spans)
└──────────────────────────┘
```

| Stage | Input | Output | Owns |
|-------|--------|--------|------|
| **Phoneme ASR** | Wav / mic | Phone sequence | Third-party model; thin adapter |
| **`collapseAllophones`** | IPA | Agalan-target IPA | [phonology.md](../grammar/phonology.md) (no voice contrast) |
| **`phonesToLetters`** | Target IPA | Letter stream (`e u o a` … `x`, word-final `sh`) | Inverse of [`phonemes.ts`](../../src/tts/phonemes.ts) |
| **`segmentWords`** | Letter stream | Speech-surface tokens | [phonotactics](../grammar/phonology.md#phonotactics) |
| **`snapLexicon`** | Tokens | Tokens (nearest legal word) | Lexicon CSV + closed lists |
| **`toWriting`** | Speech tokens | Preferred writing | Inverse of TTS expansions |

No lexicon lookup is required for **pronunciation** of native Agalan. Lexicon snap is a **recognizer language model**, not a new sound system.

## Phoneme engine (frozen)

Pick one default; keep the adapter swappable.

| Option | Pros | Cons |
|--------|------|------|
| **A — Allosaurus** | Universal phones; small; meant for “any language” | Python-first; need a CLI or WASM/ONNX port for browser |
| **B — wav2vec2 XLS-R + phoneme CTC** (Hugging Face) | Strong multilingual acoustics; ONNX/WASM paths exist | Output alphabet varies by checkpoint; mapping table per model |
| **C — SpeechBrain / ESPnet** pretrained phoneme recipes | Research-quality; documented recipes | Heavier runtime |

**Default for v1 tooling: A or a small XLS-R phoneme CTC**, whichever is easier to run **offline from Node** (`npm` script) first. Browser WASM is a later phase (same split as eSpeak lazy-load). Do not default to full Whisper.

The acoustic model’s phone set will not match Agalan IPA 1:1. The adapter owns a **model-phone → Agalan-target IPA** table (documented per engine). Fixtures test **requested** Agalan phones after collapse, not the vendor’s raw labels.

## Collapse and letter map

Unvoiced variants are **style**, not letters. Before `phonesToLetters`:

| Heard (typical) | Collapse to | Letter |
|-----------------|-------------|--------|
| [ɡ] [k] | /ɡ/ | **g** |
| [d] [t] | /d/ | **d** |
| [b] [p] | /b/ | **b** |
| [z] [s] | /z/ | **z** |
| [v] [f] | /v/ | **v** |
| [ʒ] [ʃ] | /ʒ/ | **x** — **except** word-final plural **sh** /ʃ/ after **-l/-m/-n/-r** |
| [ɦ] [h] | /ɦ/ | **h** |
| [e] [e̞] [ɛ] | /e̞/ | **e** |
| [ʌ] [ə] [ʊ] (model-dependent) | /ʌ/ | **u** (adapter documents the mapping) |
| [o] [o̞] [ɔ] | /o/ | **o** (reject /oʊ/ as two targets if the model emits a glide) |
| [ɑ] [a] | /ɑ/ | **a** |
| [j] | /j/ | **j** |
| [w] | /w/ | **w** |
| [m] [n] [l] | same | **m** **n** **l** |
| [ɹ] [r] [ɾ] | /ɹ/ | **r** |

**Hiatus:** two adjacent vowel phones → two letters, two syllables (`juon` not a diphthong). If the model emits a diphthong symbol, split it in the adapter.

**`sh`:** only legal as the plural coda after a reference suffix. Mid-word [ʃ] collapses to **x** (/ʒ/), matching “unvoiced **x** as style.”

## Segmentation

Walk the letter stream with the same syllabify rules as TTS (onset + vowel; leftover consonants attach as **word-final coda only**). Emit a word boundary when a legal ending is complete:

- **-l / -m / -n / -r**
- same plus **-sh** (`lsh` `msh` `nsh` `rsh`)

Prefix-less [citation](../grammar/core.md#citation-forms) is legal (root + ending, no PoS). **`PoS+r`** is reserved for [number words](../grammar/phonology.md#number-word-exception). Revisers (`al`, `am`, …) stay prefix-less closed words.

If segmentation fails, return a **partial transcript** plus a skip/error span (do not invent phones). Same spirit as TTS: do not speak or hear material that is not in the signal.

## Lexicon snap (optional, recommended)

After segmentation, optionally replace each token with the nearest **legal** word:

- Published roots with any PoS + ending + optional **sh**
- Closed lists already used in TTS (span opens/closes, revisers, join closes, spelled number CV)

Distance is over letters after collapse (or over phones before letters). Prefer **exact match**; only snap when unique within a small edit radius so a real nonce root is not overwritten.

v1 may skip snap and still be useful for “show letters.” Snap is what makes dictation usable.

## Spoken → writing (`toWriting`)

Inverse of TTS `toSpeech`. v1 may stop at the **speech surface** (`previewSpeech` in reverse). v2:

| Spoken | Preferred writing |
|--------|-------------------|
| Full CV number word | Shorthand (`g+3`, `g#-2`, …) when uniquely recoverable |
| `daxal` … `xuxul` (etc.) | Bracket spans when uniquely recoverable |
| Ordinary content | Unchanged |

Ambiguous recoveries stay in speech form. Never write a shorthand the grammar would not speak from that spelling.

## API sketch

```ts
type ListenOptions = {
  snapLexicon?: boolean;
  toWriting?: boolean;
};

type ListenResult = {
  phones: string;           // collapsed Agalan-target IPA
  spoken: string[];         // speech-surface words
  writing?: string;         // optional preferred writing
  skipped: string[];        // unmapped / foreign / failed spans
};

function listenWav(path: string, opts?: ListenOptions): Promise<ListenResult>;
function previewPhonesToLetters(ipa: string): string;
```

CLI: `npm run listen -- clip.wav` prints phones, spoken tokens, and optional writing. Browser mic is a later phase (lazy model load, same pattern as Speak Agalan).

## UI integration (later)

| Surface | Behavior |
|---------|----------|
| Gloss overlay | Optional **Listen** next to **Speak Agalan** — compare spoken preview to mic |
| Drills | Accept spoken answer; score against expected speech surface |
| Errors | Failed phones stay visible; do not silently drop |

Do not auto-start the mic on page load.

## Testing

1. **Inverse G2P fixtures** — IPA (after collapse) → letters (phonology table + compounds / plurals / hiatus).  
2. **Round-trip with TTS** — `toPhonemes(word)` → `phonesToLetters` → same word for native speech-shaped tokens (no audio).  
3. **Segmentation fixtures** — letter streams from grammar examples → word lists.  
4. **Optional audio smoke** — if a phoneme engine is in CI, a handful of **English or multilingual** clips that happen to contain Agalan-like phone sequences; **not** a requirement to record Agalan.  
5. **Doc sync** — phonology or writing↔speech changes fail fixtures until STT maps update.

Do **not** gate merge on WER against an Agalan speech set that does not exist.

## Browser / bundle

| Piece | Ship in v1? | Notes |
|-------|-------------|--------|
| `collapseAllophones` + `phonesToLetters` + `segmentWords` | Yes | Small pure TS; testable without a model |
| Inverse `toWriting` | v2 | Depends on TTS expansion completeness |
| Phoneme model | Node CLI first | WASM/ONNX in the docs app later; lazy-load like eSpeak |
| Lexicon snap | Optional | Uses existing CSV |

Expect the phoneme model to dwarf the TS glue. Keep it off the critical docs render path.

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Model phones ≠ Agalan IPA | Per-engine mapping table; fixtures on collapsed Agalan phones |
| Four vowels confused (`e`/`u`/`o`/`a`) | Lexicon snap; learner-facing “show phones” so the miss is visible |
| **l** vs **r** | Same; do not add a new phoneme to “help ASR” |
| Diphthong merge on hiatus | Adapter splits glides; syllabify matches TTS |
| Word-final **sh** vs mid **x** | Segmentation owns **sh**; mid [ʃ] → **x** |
| Foreign interiors | Skip; never native G2P |
| Quiet / sung / overlapping speech | Out of scope; same as TTS non-goals |
| Treating eSpeak audio as training data | Explicitly forbidden; frozen public acoustics only |

## Alternatives considered

| Alternative | Why not default |
|-------------|-----------------|
| Fine-tune Whisper on eSpeak Agalan | Still training; learns TTS artifacts, not mouths |
| Unconstrained Whisper + prompt “transcribe Agalan” | Invents English; no letter table |
| whisper.cpp + GBNF letter grammar | Cheap experiment later; acoustics still English-biased |
| Vosk/Kaldi custom dict, English acoustics | Valid (option 2); more English-phone assumption; keep as fallback if phoneme engines fail in-browser |
| PocketSphinx command grammar | Fine for a handful of drill phrases; not general dictation |
| Web Speech API | English (or locale) orthography; rejected as sole engine |

## Acceptance criteria

- [ ] `phonesToLetters` inverts the phonology letter table; stacked vowels stay two letters; word-final **-sh** is `sh`.  
- [ ] Unvoiced style phones collapse to voiced letters per the table above.  
- [ ] Native speech-shaped words round-trip `toPhonemes` → `phonesToLetters` without audio.  
- [ ] `segmentWords` splits on legal endings (including **-sh** and citation forms).  
- [ ] A frozen phoneme ASR can be invoked from a Node CLI; Agalan weights are not trained in this repo.  
- [ ] Opaque/foreign policy matches TTS (skip / mark).  
- [ ] No Agalan speech corpus and no TTS-synthetic fine-tune required for the default path.

## Phased delivery

1. **Inverse G2P + segmentation** — pure TS; fixtures; CLI that accepts **IPA strings** (no mic).  
2. **Node phoneme engine** — Allosaurus or XLS-R CTC adapter; `npm run listen -- clip.wav` → spoken tokens.  
3. **Lexicon snap** — published roots + closed class.  
4. **`toWriting`** — numbers and spans, inverse of TTS.  
5. **Browser mic** — lazy ONNX/WASM; optional Listen on gloss overlay.

## Cross-links

| Topic | Doc |
|-------|-----|
| Forward speech stack | `learner-tts.md` |
| Phonology / IPA | [phonology.md](../grammar/phonology.md) |
| Writing vs speech (spans) | [spans.md](../grammar/spans.md#writing-vs-speech) |
| Number shorthand vs speech | [numbers.md](../grammar/numbers.md#writing-preferred-shorthand) |
| Orthography / citation | [core.md](../grammar/core.md#orthography) |
| Parser | [parser-pipeline.md](../meta/parser-pipeline.md) |

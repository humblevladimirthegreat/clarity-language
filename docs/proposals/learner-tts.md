# Proposal: usable learner TTS (in-browser)

**Status:** PHASE 1 IN PROGRESS (phoneme core + Gloss overlay play)  
**Related:** long-term TODO *text to speech*; depends on [parser-pipeline.md](../meta/parser-pipeline.md) (**assumed shipped** — `parse(text)` → typed AST)  
**Design authority:** spoken forms stay in the grammar docs ([phonology.md](../grammar/phonology.md), [spans.md](../grammar/spans.md#writing-vs-speech), [numbers.md](../grammar/numbers.md#writing-preferred-shorthand), [core.md](../grammar/core.md#orthography-and-prosody-periods)). This proposal covers **tooling only**: writing → speech surface → audio.

## Motivation

Learners need to **hear** Agelan, not only read it. Native `speechSynthesis` on raw orthography fails: letter values differ from English (`j` = /j/, `x` = /ʒ/, `u` = /ʌ/), stacked vowels are separate syllables, and preferred **writing** forms (number shorthand, span brackets) are not what speech uses.

With a finished parser, most of the hard mapping is already structured in the AST. Usable learner TTS is then a thin **speech-normalization** pass plus a deterministic **grapheme→phoneme** table from phonology, rendered by an in-browser phoneme engine — not a custom neural voice.

**“Usable” here means:** letter-accurate native words, correct expansion of writing-only forms, and coarse pause / pitch cues aligned with documented prosody. It does **not** mean studio-quality singing or a trained Agelan speaker model.

## Goals

1. Play **any parseable Agelan string** in the browser (docs examples, exercises, future UI).
2. Expand **writing → speech** from the AST (spans, free-number shorthand, writing atoms) before synthesis.
3. Map speech-surface letters to **IPA / phonemes** exactly as [phonology.md](../grammar/phonology.md) specifies (including syllable splits on stacked vowels and word-final **-sh**).
4. Ship **offline-capable** synthesis (WASM or equivalent) so docs work without a cloud TTS API.
5. Expose a small API (`speak(text)` / `speakAst(ast)`) shared by CLI smoke tests and web UI.
6. Keep fixtures **doc-locked**: speech expansions and phoneme strings quoted from grammar pages.

## Non-goals

- Custom / neural Agelan voice training.
- Singing mode, melody, or musical timing (phonology’s singability goals stay design filters; TTS stays speech).
- Perfect intonation for every Intermediate/Advanced prosody note (islands, quote voice, soft **-m** shading) in v1 — only coarse cues (see [Prosody v1](#prosody-v1)).
- Teaching English glosses aloud (TTS speaks **Agelan**, not free English).
- Guessing pronunciation of **opaque / foreign** interiors (`d<sushi>`, `z<Sam>n`) as if they were Agelan — see [Foreign and opaque](#foreign-and-opaque).
- Speaking parser recoveries or other material **not present in the written input** — see [Write-only surface](#write-only-surface).
- Replacing the parser or inventing spoken forms not in the grammar docs.

## Pipeline

```text
Agelan text (writing or speech surface)
        │
        ▼
┌──────────────────────┐
│  parse(text) → AST   │  ← assumed done (parser-pipeline)
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  toSpeech(ast)       │  writing → spoken tokens + pause marks
│  SpeechPlan          │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  toPhonemes(plan)    │  letter table + syllable split
│  PhonemePlan         │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  synthesize(plan)    │  in-browser phoneme engine
│  AudioBuffer / play  │
└──────────────────────┘
```

| Stage | Input | Output | Owns |
|-------|--------|--------|------|
| **Parse** | Surface string | Typed AST | Existing library ([parser-pipeline.md](../meta/parser-pipeline.md)) |
| **`toSpeech`** | AST | Ordered **speech tokens** + boundary tags | Writing↔speech maps in spans / numbers / core |
| **`toPhonemes`** | Speech tokens | Phoneme strings + syllable breaks | [phonology.md](../grammar/phonology.md) letter table only |
| **`synthesize`** | Phoneme plan | Audio | Third-party engine + thin adapter |

**No lexicon lookup is required for pronunciation** of native Agelan (spelling shows the sound). Lexicon may still annotate UI (“play this example”) but does not drive G2P.

## Speech normalization (`toSpeech`)

Preferred writing is not always what is spoken. The AST already distinguishes writing atoms from spoken word shapes; `toSpeech` **emits the spoken channel**.

### Must expand in v1

| Writing | Spoken behavior | Doc |
|---------|-----------------|-----|
| Free-number shorthand (`g+3`, `g#-2`, `d_…`, `%`, …) | Full CV number word (marker `r`+V, spoken digits / specials, ending letter) | [numbers.md](../grammar/numbers.md#writing-preferred-shorthand) |
| Span brackets (`d[…]`, `d@[Hamlet]`, `h(…)`, …) | Open word (`daxal` / `daxon` / …) + interior tokens + close when required | [spans.md](../grammar/spans.md#writing-vs-speech) |
| Span anaphor / empty (`d[=]`, `d[]`) | Spoken open only (`daxur`, `daxul`) | same |
| Orthographic-only commas in digit groups | **Omit** (not spoken) | [numbers.md](../grammar/numbers.md#writing-preferred-shorthand) |
| Period / `?` / `!` | Boundary tags for pause + pitch hint | [core.md](../grammar/core.md#orthography-and-prosody-periods) |
| `/x/` continue vs new `/j/` turn | Boundary tags (dip vs reset) | same |
| Adjunct-scope `^ … ^` | **No** open/close words; island boundary tags only | [spans.md](../grammar/spans.md#adjunct-scope-islands) |

### Already speech-shaped

Ordinary content words (`zumogon`), revisers (`al`), join closes, spoken span opens/closes, spelled number CV — pass through with word-boundary marks.

### Foreign and opaque

| Form | TTS policy (v1) |
|------|-----------------|
| Nativized ordinary word | Speak as Agelan phonemes |
| `PoS<…>ENDING` with foreign payload | Speak PoS…ENDING **shell** with Agelan phonemes; payload as a **loan segment** (see below) |
| Opaque `PoS<…>` (no ending) | Speak open/close (if span-expanded) in Agelan; interior as loan segment |
| Atomic cite/mention interiors that are raw Latin letters | Loan segment |

**Loan segment (v1):** do **not** run Agelan G2P on the interior. Options (pick one default; expose override later):

1. **Spell-letter mode** — Agelan letter names / one phoneme per Latin letter when the payload is plain ASCII (rough but deterministic).  
2. **Skip + short beep / pause** — mark unreadable foreign audio; show tooltip “foreign surface — not Agelan phonology.”  
3. **Browser `speechSynthesis` island** — briefly switch to an English (or `lang`-tagged) voice for the payload only, then resume Agelan engine.

**Recommendation:** default **(3)** when `speechSynthesis` has a matching voice; else **(2)**. Never pretend opaque interiors are Agelan roots.

### Write-only surface

TTS speaks **only what appears in the input string**, after documented writing→speech expansion of those written forms (number shorthand, span brackets, and the like). Parser recoveries, implied force, elided defaults, and other unspoken structure are **never** inserted into the speech plan.

## Grapheme → phoneme (`toPhonemes`)

Single table from [phonology.md](../grammar/phonology.md); no English respelling stage.

| Orthography | IPA (engine input) | Notes |
|-------------|--------------------|-------|
| **e** | /e̞/ | mid; not English “ee” |
| **u** | /ʌ/ | |
| **o** | /o/ | monophthong — no /oʊ/ glide |
| **a** | /ɑ/ | |
| **h** | /ɦ/ | |
| **w** | /w/ | |
| **g** | /ɡ/ | |
| **d** | /d/ | |
| **j** | /j/ | |
| **b** | /b/ | |
| **z** | /z/ | |
| **m** **n** **v** **l** | /m/ /n/ /v/ /l/ | |
| **r** | /ɹ/ | |
| **x** | /ʒ/ | mid-word compound joiner and discourse `/x/` prefix — same phone |
| **sh** | /ʃ/ | word-final plural only (after reference suffix) |

**Syllables:** split so each vowel is its own nucleus; stacked vowels are separate syllables (`juon` → `ju.ón`-style timing, not a diphthong). Onsets attach left-to-right per phonotactics. Word-final coda = reference suffix (+ optional **sh** only).

**Clusters still legal:** `gl-` (left-bound), `PoS+r` (numbers), finals `-lsh` / `-msh` / `-nsh` / `-rsh`.

**Stress:** no lexical stress. Engine default: light even timing; optional final-lengthening before body-boundary pauses.

Unvoiced allophones are **not** requested in v1 (voiced preferred).

## Synthesis engine

| Option | Pros | Cons |
|--------|------|------|
| **A — eSpeak-NG / espeakng WASM** (or fork) | Phoneme/IPA input; offline; small enough for docs; deterministic | Robotic; IPA dialect mapping needs a thin adapter |
| **B — MeSpeak / speak.js lineage** | Proven in-browser pattern | Older voice quality; maintenance risk |
| **C — Web Speech API only** | Zero bundle weight | Cannot reliably hit Agelan phones; rejected as sole engine |
| **D — Cloud neural TTS** | Natural | Network, cost, privacy; poor conlang phoneme control unless custom lexicon — rejected for v1 default |

**Default: A.** Adapter converts `PhonemePlan` → engine phoneme string (X-SAMPA or engine-native) and calls WASM. Keep **C** only as the optional **loan-segment island** helper above.

Bundle the WASM asset with the docs/web app; lazy-load on first Play so ordinary page views stay light.

## Prosody v1

Coarse cues only — enough for learners to hear structure, not a full intonation grammar.

| Tag from `toSpeech` | Audio cue |
|---------------------|-----------|
| Body end `.` | Fall + medium pause |
| `?` | Rise or high level + pause |
| `!` | Clipped fall + pause |
| Soft **-m** force / particle | Slightly shorter / lighter fall (if engine allows; else same as `.`) |
| `/x/` continue | Short dip / pause; **no** full reset |
| New `/j/` turn | Longer pause + pitch reset if engine supports |
| Scope island `^…^` | Slight reset in; tighter spacing inside; boundary after last island word |
| Word boundary | Tiny gap or engine word break |
| Span open / close words | Spoken as ordinary words (they are phonotactically normal) |

Advanced quote / aside “voice quality” changes are **out of scope** for v1 (same voice throughout).

## API sketch

```ts
type SpeakOptions = {
  loanMode?: "browser" | "skip" | "spell";
  rate?: number;
};

function speak(text: string, opts?: SpeakOptions): Promise<void>;
function speakAst(ast: Ast, opts?: SpeakOptions): Promise<void>;
function previewSpeech(text: string): SpeechPlan; // for tests / “show spoken form”
function previewPhonemes(text: string): PhonemePlan;
```

CLI: `npm run speak -- "zumogon guzem."` prints speech surface + phonemes and optionally writes a `.wav` via the same WASM path (Node binding or headless play stub).

## UI integration

| Surface | Behavior |
|---------|----------|
| **Gloss overlay** (Phase 1) | **Speak Agelan** on the paste box; **Speak word** / `s` on the inspect card. Lazy WASM. |
| Grammar doc examples | Play control on fenced Agelan lines / exercise keys (Phase 5) |
| Future web tools | Play selection or current sentence |
| Errors | If a token is not a native speech-shaped word, skip it; do not invent audio |

Accessibility: Play button has an accessible name (“Speak Agelan”); do not autoplay on page load.

## Testing

1. **Expansion fixtures** — writing string → `SpeechPlan` token list (from spans/numbers examples).  
2. **Phoneme fixtures** — speech token → IPA/phoneme string (from phonology cue table + a few compounds / plurals / numbers).  
3. **Golden audio (optional, sparse)** — hash or duration smoke on a handful of utterances in CI with WASM; not full waveform golden files for every example.  
4. **Doc sync** — when grammar changes a writing↔speech map, fixtures fail until TTS maps update (same spirit as parser fixtures).

## Browser / bundle size

| Piece | Ship? | Notes |
|-------|-------|-------|
| Parser (already planned) | Yes | Shared with gloss / speed-reading tools |
| `toSpeech` + `toPhonemes` | Yes | Small pure TS |
| eSpeak-NG WASM + voice data | Lazy | Dominates TTS weight; load on first Play |
| `speechSynthesis` | Optional | Loan islands only; no extra bytes |

Expect the WASM voice pack to dwarf the TS glue; keep it out of the critical render path.

## Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Engine IPA ≠ Agelan targets (`/e̞/`, `/ɹ/`, `/ɦ/`) | Document closest engine phones; prefer consistency over perfection; fixture the **requested** phones even if engine approximates |
| Writing↔speech drift from docs | Fixtures quoted from spans/numbers; no ad-hoc expansions |
| Foreign interiors sound “Agelan” | Explicit loan policy; never run native G2P on opaque payloads |
| Bundle too heavy for docs site | Lazy-load WASM; Play-button gate |
| Prosody over-promised | v1 table is pause/reset only; no claim of natural discourse |
| Parser AST shape churn | `toSpeech` depends on stable AST node kinds from parser-pipeline; version the SpeechPlan if needed |

## Alternatives considered

| Alternative | Why not default |
|-------------|-----------------|
| English-respelling + `speechSynthesis` only | Fast demo; wrong phones; fails on `x` / stacked vowels / shorthand |
| Skip parser; regex replace brackets/numbers | Re-implements grammar; fights spans/nesting/numbers |
| Cloud neural TTS | Cost, privacy, weak phoneme control for a conlang |
| Full custom concatenative Agelan voice | High effort; defer until learner TTS proves demand |
| Speak orthography without span/number expansion | “Usable” fails on ordinary preferred writing |

## Acceptance criteria

- [x] `toSpeech` expands number shorthand and span writing forms to the spoken channel per grammar docs. (Phase 2)  
- [x] `toPhonemes` matches the phonology letter table; stacked vowels are separate syllables; **-sh** is /ʃ/. (Phase 1)  
- [x] In-browser Play speaks a parseable example offline after first WASM load. (Phase 1 Gloss overlay)  
- [x] Opaque/foreign interiors never use Agelan G2P; loan policy is documented and tested. (Phase 2 skips interiors; loan islands are Phase 4)  
- [ ] Fixtures cover at least: plain clause, plural **-sh**, compound mid-word **`x`**, free-number shorthand, multi-token cite with close, island boundaries, `?` / `/x/` continue. (Phase 2: shorthand, multi-token cite, `?`; island / `/x/` continue in Phase 3)  
- [x] `previewSpeech` available for pedagogy (“show what will be spoken”). (Phase 1 Gloss preview line + CLI)  
- [x] No cloud TTS required for native Agelan audio.

## Phased delivery

1. **Phoneme core** — native words only (already speech-shaped strings) + WASM play. **v1 surface:** [Gloss overlay](../grammar/gloss.md) (**Speak Agelan** / **Speak word**).  
2. **Normalizer** — numbers + spans + period/`?`/`!` pauses.  
3. **Framing cues** — `/j/` vs `/x/`, soft **-m**, islands.  
4. **Loan islands** — `speechSynthesis` (or skip) for `<>` payloads.  
5. **Doc UX** — Play on grammar examples; `previewSpeech` toggle in docs.

## Cross-links

| Topic | Doc |
|-------|-----|
| Parser dependency | [parser-pipeline.md](../meta/parser-pipeline.md) |
| Phonology / IPA | [phonology.md](../grammar/phonology.md) |
| Writing vs speech (spans) | [spans.md](../grammar/spans.md#writing-vs-speech) |
| Number shorthand vs speech | [numbers.md](../grammar/numbers.md#writing-preferred-shorthand) |
| Periods / force prosody | [core.md](../grammar/core.md#orthography-and-prosody-periods) |
| Orthography | [core.md](../grammar/core.md#orthography) |

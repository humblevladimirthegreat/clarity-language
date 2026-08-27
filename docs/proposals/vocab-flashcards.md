# Proposal: vocab flashcard generator / system

**Status:** PROPOSED  
**Related:** long-term TODO *vocab flashcard generator/system*; reuses [lexicon search](../grammar/lexicon.md) / [`src/lexicon-search.ts`](../../src/lexicon-search.ts); optional later drill UI may sit next to [gloss-overlay-ui.md](gloss-overlay-ui.md) and [learner-tts.md](learner-tts.md) (neither required for v1)  
**Design authority:** remains [`docs/grammar/`](../grammar/introduction.md), [glosses.md](../meta/glosses.md), and lexicon CSVs. This proposal covers **tooling only**: turn published roots and overlays into study decks; do not invent senses or replace the lexicon as source of truth.

## Motivation

Learners can **look up** roots ([lexicon](../grammar/lexicon.md)) and eventually **inspect** sentences in context ([gloss-overlay-ui.md](gloss-overlay-ui.md)). They still lack a path to **retain** vocabulary: Agalan ↔ English mappings, literal vs metaphorical senses, and the closed overlay inventory.

The data is already curated (`lexicon-published.csv`, `lexicon-overlays.csv`). Spaced repetition is a solved product problem (Anki and FSRS). The missing piece is a **thin generator** that emits Agalan-shaped note types from those CSVs — not a second dictionary, not a custom SRS engine, and not a fork of generic “AI vocab deck” tools that assume natural-language TTS and LLM enrichment.

## Goals

1. Generate **importable study decks** from the published lexicon and overlay CSVs (regenerable; CSV stays canonical).
2. Ship **Agalan-aware note types**: literal vs metaphorical, emoji/mnemonic optional, overlays as their own deck — not a single “word / translation” template.
3. Prefer **Anki** for long-term review (scheduling, mobile, offline).
4. Support **curated subsets** (tag / band / theme) so learners are not dumped the full root list on day one.
5. Keep generation **deterministic and gloss-locked** — no AI sense invention; optional English-side media only if explicitly added later.
6. Expose a small CLI (`npm` script) that fits existing TypeScript tooling.

## Non-goals

- Replacing lexicon search or becoming the primary root browser.
- Training or shipping **Agalan TTS** on cards (see [learner-tts.md](learner-tts.md) when speech exists; flashcards do not depend on it).
- LLM sentence enrichment, DALL·E card art, or forking CSV→Anki SaaS/CLIs aimed at natural L2 pairs.
- Implementing a full custom SRS product (scheduling, sync, mobile clients).
- Inflected full-sentence production as the v1 unit of study (roots and overlays first; cloze / PoS+ending drills later).
- Changing lexicon schema or gloss writing rules.

## Product shells

| Shell | Role |
|-------|------|
| **A — CSV → Anki exporter** | CLI builds `.apkg` (or Anki-friendly `.tsv`) from published + overlay CSVs. Best v1. |
| **B — Curated deck presets** | Same exporter with filters/tags (e.g. overlays-only, metaphor-filled rows, beginner root slices). |
| **C — In-docs drill** | Optional VitePress / `web/` practice page using the same note model + [`ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs) + `localStorage`; still exportable to Anki. |
| **D — Exercise cloze decks** | Later: cards from [translation exercises](../meta/translation-exercises.md) / grammar examples once those are machine-listable. |

**Recommendation:** ship **A** + a few **B** presets. Treat **C** / **D** as follow-ons that consume the same note model.

## Reuse (OSS)

| Need | Prefer | Avoid |
|------|--------|--------|
| Scheduling + client | **Anki** (import `.apkg` / TSV) | Building sync / mobile / review UX |
| Deck packaging | **`genanki`** (Python) *or* TSV + Anki import; thin wrapper from this repo | Forking anki-artisan / anita / VocabAudioAutomator (natural-L2 + TTS/LLM assumptions) |
| In-browser SRS (optional **C**) | **`ts-fsrs`** | Homegrown interval math |
| Lookup / filter helpers | Existing **MiniSearch** lexicon search | Parallel search stack inside the exporter |
| Sense text | Published CSV + overlays only | AI “enrichment” of glosses |

## Note model

Fields drawn from CSV (and tags derived at export time):

| Field | Source | Role on card |
|-------|--------|----------------|
| `emoji` | published | Optional hint / mnemonic face |
| `root` | `clarity` | Agalan stem (no PoS / ending) |
| `literal` | published | English literal sense |
| `metaphorical` | published (may be empty) | Separate sense when present |
| `mnemonic` | published | Optional reveal / soft hint |
| overlay: `sense_form`, `pos`, `definition`, `mnemonic` | overlays CSV | Closed special-vocabulary drills |
| `tags` | derived | `literal` / `metaphor` / `overlay` / theme / band |

**Citation vs sentence use:** cards study **roots** (and overlay forms) as in the lexicon. PoS letter and reference ending are **not** baked into the root side of v1 cards; learners add them when writing sentences ([core orthography](../grammar/core.md#orthography)). A later note type may prompt “noun exact …” → `z…l` once a tiny inflection helper exists.

### Card templates (v1)

| Template | Front | Back (reveal) | When |
|----------|-------|---------------|------|
| **Recognition** | Agalan `root` | literal (+ emoji); metaphorical if any | all published rows |
| **Production** | English literal | `root` (+ emoji / mnemonic optional) | all published rows |
| **Metaphor** | metaphorical gloss | `root` | only rows with metaphorical filled |
| **Overlay** | `sense_form` + PoS (or definition prompt) | definition (+ mnemonic) | overlay CSV |

Do not merge literal and metaphorical into one bidirectional card: that fights [glosses](../meta/glosses.md) (literal / metaphorical as separate senses).

## Pipeline

```text
lexicon-published.csv ─┐
                       ├─► buildNotes(opts) ─► Note[] ─► .apkg / .tsv
lexicon-overlays.csv ──┘         │
                                 ├─ filters (preset, tags, metaphor-only, …)
                                 └─ note types (recognition / production / metaphor / overlay)
```

- **Canonical data:** CSVs under `data/`. Regenerating the deck overwrites generated artifacts; do not hand-edit Anki notes as source of truth.
- **Opts:** deck name, preset id, include/exclude empty metaphorical, overlay on/off.
- **CI optional later:** smoke that export runs and note counts match CSV filters.

## Curated presets (sketch)

| Preset | Intent |
|--------|--------|
| `overlays` | Full closed overlay inventory (small, high levuzo) |
| `metaphor` | Rows with metaphorical sense only |
| `published-all` | Full published root list (power users) |
| `published-slice-N` | First *N* or explicitly listed beginner roots (maintain a small allowlist file if needed) |

Exact beginner slices can follow [learning-levels.md](../meta/learning-levels.md) pedagogy without claiming the exporter is design authority.

## Phasing

### v1

- `npm` script: CSV → Anki `.apkg` or `.tsv`.
- Note types: recognition, production, metaphor (conditional), overlay.
- At least: `overlays` + `published-all` (+ one small slice if an allowlist is cheap).
- Short maintainer note in this proposal or a one-pager under `docs/` tooling: regenerate from CSV; import into Anki.

### v2

- Preset allowlists aligned with learner bands / themes.
- Optional in-docs **C** drill (same notes, `ts-fsrs`).
- Optional English-only TTS on the English face (not Agalan speech).

### v3

- Inflected prompts (PoS + ending → surface form).
- **D** cloze / translation-exercise decks.
- Optional Agalan audio on the Agalan face once [learner-tts.md](learner-tts.md) ships.

## Interaction with other proposals

| Proposal | Relationship |
|----------|----------------|
| Lexicon search (shipped) | Discovery and filtering inspiration; flashcards are retention, not lookup |
| [gloss-overlay-ui.md](gloss-overlay-ui.md) | Sentence inspect while reading; flashcards study isolated roots/overlays |
| [learner-tts.md](learner-tts.md) | Optional later audio on Agalan face; not a v1 dependency |
| [parser-pipeline.md](../meta/parser-pipeline.md) | Needed for inflected / cloze decks (v3), not for root export |

## Out of scope for product debates

- Whether Anki or a web drill is “the” learner product — Anki is the v1 delivery; web drill is optional sugar.
- Redesigning emoji-seeded lexicon layout — export consumes current columns.
- Teaching full grammar via vocab cards — morphology teaching stays in grammar docs; cards drill lexicon memory.

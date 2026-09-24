# Grammar consistency audit

Editors only — not linked from grammar pages. Tracks which `docs/grammar/` pages have been checked for incorrect, confusing, meaningless, or counterintuitive grammar. If examples are non-sensicle, choose better examples. Fix what is obviously wrong. Ask about less clear cases.

Status: `[x]` full pass · `[~]` partial (sections listed) · `[ ]` not started.

## Waves

Audit in waves; each wave treats earlier waves as settled. Pages within a wave are independent enough to audit in parallel.

- **One agent per page.** Agents edit only their own page; cross-page problems are reported, not fixed. Exceptions: `numbers-applied.md` + `numeric-derivation.md` share one agent; `roles.md` + `x-compounds.md` share one agent; `causation.md` runs after `knowing.md` (or shares its agent).
- **Each agent updates only its own table row.**
- **Between waves:** run `npm run build` once, then add new settled decisions to [Decisions](#decisions-do-not-re-raise) before starting the next wave.
- **Wave 6 last:** overview pages summarize the rest, so audit them after terms and examples settle.

### Wave 0 — foundations (done)

| Status | Page | Covered | Date |
|--------|------|---------|------|
| [x] | `clause.md` | all | 2026-09-24 |
| [x] | `phonology.md` | all | 2026-09-24 |
| [x] | `word-endings.md` | all | 2026-09-24 |

### Wave 1 — core cited everywhere

| Status | Page | Covered | Date |
|--------|------|---------|------|
| [x] | `numbers.md` | all | 2026-09-24 |
| [ ] | `pronouns.md` |  |  |
| [ ] | `plurality.md` |  |  |
| [ ] | `speech-moves.md` |  |  |

### Wave 2 — phrase structure

| Status | Page | Covered | Date |
|--------|------|---------|------|
| [ ] | `joins.md` |  |  |
| [ ] | `hooks.md` |  |  |
| [ ] | `restrictors.md` |  |  |
| [ ] | `spans.md` |  |  |

### Wave 3 — built on joins / hooks / numbers

| Status | Page | Covered | Date |
|--------|------|---------|------|
| [ ] | `comparatives.md` |  |  |
| [ ] | `join-across-roles.md` |  |  |
| [ ] | `relations.md` |  |  |
| [ ] | `numbers-applied.md` |  |  |
| [ ] | `numeric-derivation.md` |  |  |

### Wave 4 — meaning and mood

| Status | Page | Covered | Date |
|--------|------|---------|------|
| [ ] | `questions.md` |  |  |
| [ ] | `predication.md` |  |  |
| [ ] | `dependents.md` |  |  |
| [ ] | `roles.md` |  |  |
| [ ] | `x-compounds.md` |  |  |

### Wave 5 — psychology

| Status | Page | Covered | Date |
|--------|------|---------|------|
| [ ] | `knowing.md` |  |  |
| [ ] | `causation.md` |  |  |
| [ ] | `intention.md` |  |  |
| [ ] | `values.md` |  |  |

### Wave 6 — overview and reference

| Status | Page | Covered | Date |
|--------|------|---------|------|
| [ ] | `terminology.md` |  |  |
| [ ] | `why-agelan.md` |  |  |
| [ ] | `introduction.md` |  |  |
| [ ] | `english.md` |  |  |
| [ ] | `index.md` |  |  |
| [ ] | `inspect.md` |  |  |
| [ ] | `lexicon.md` |  |  |

## Decisions (do not re-raise)

- **Hosted `/b/` is structural.** `/b/` right after any `/ɡ/`, `/h/`, or `/th/` word is hosted, whatever the host means; a recipient placed there is a speaker error.
- **`r` + vowel overlap is accepted.** Every vowel after number `r` has a meaning, so marker `re`, digit `re`, and letter name `ro` overlap. Number words stay unambiguous because the marker is always first.
- **Word edges before vowel-initial words are not fixed.** Resyllabifying `…l al` across a word boundary is accepted.
- **Hook compounds have no mid-word coda.** The cited `-l` / `-m` starts the hook's syllable (`a-wa-la-lul`).

# Grammar consistency audit

Editors only — not linked from grammar pages. Tracks which `docs/grammar/` pages have been checked for incorrect, confusing, meaningless, or counterintuitive grammar. If examples are non-sensicle, choose better examples. Fix what is obviously wrong. Ask about less clear cases with your recommendation.

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
| [x] | `pronouns.md` | all | 2026-09-24 |
| [x] | `plurality.md` | all | 2026-09-24 |
| [x] | `speech-moves.md` | all | 2026-09-24 |

### Wave 2 — phrase structure

| Status | Page | Covered | Date |
|--------|------|---------|------|
| [x] | `joins.md` | all | 2026-09-24 |
| [x] | `hooks.md` | all | 2026-09-24 |
| [x] | `restrictors.md` | all | 2026-09-24 |
| [x] | `spans.md` | all | 2026-09-24 |

### Wave 3 — built on joins / hooks / numbers

| Status | Page | Covered | Date |
|--------|------|---------|------|
| [x] | `comparatives.md` | all | 2026-09-24 |
| [x] | `join-across-roles.md` | all | 2026-09-24 |
| [x] | `relations.md` | all | 2026-09-24 |
| [x] | `numbers-applied.md` | all | 2026-09-24 |
| [x] | `numeric-derivation.md` | all | 2026-09-24 |

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
- **Sentences end in `.`, never `?` or `!`.** The act word carries question and command force. `?` / `!` / `!!` / `?!` / `%` / `&` / `;` are prefix [tone marks](../grammar/speech-moves.md#tone-marks) with no grammatical meaning.
- **Short resumes are preferred when unambiguous.** The build accepts a short resume when its antecedent is earlier in the same code span or fenced block.
- **`/ɡ/` + -r on a noun means *of that kind*,** never possession.
- **`/v/` + -r on a noun means *do the same action again, now involving that entity*.**
- **-lx / -mx on a kind is an indefinite group** (a set in this situation), not anchor plus associates.
- **Conventional-call interjections (`juruzen`) name the call with -n,** not a person.
- **Ordinal commas are nested rank.** On `#`, each comma is a place within the previous place, innermost first like dates (`g#2,3` = seat 2 in row 3). An ordinal exponent is always generation, so a large ordinal is one all-digit group (`g#1005`).
- **Phrase-join -n with items titles the bundle;** standalone `…an` (no items) is null / void.
- **A tie (`ae`) does not rank its members;** spoken order is irrelevant.
- **Join -r is single-vowel only** (`a` / `o` / `e` / `u`), on every role letter that takes joins, including `/x/` (`xar`).
- **`A ol B` = *B instead of A*** — the left item is the one replaced.
- **Restrictor occasions are times or cases, never places.** Places go in extra-noun hooks.
- **A clause-scoped span open (EDGE `e`) runs to clause end,** so the verb comes before it.
- **Phrase joins are written right-close everywhere,** including single-item thresholds and range members: items, then the join, then the SHARED `/ɡ/` (`z+5 zem`, `z+3 … zar gurulel`).
- **Measured comparative gaps use a measurable scale plus a published unit** (`godowem bedurem g+2`), never an abstract quality.
- **An unspecified date is `h_#`;** bare `h_` is an unspecified clock time.
- **"Departure" is `vebarul` / `bebarul`;** `-m` `ebarum` means *abandonment*.
- **Locative *in* / *on* / *at* / *from* / *using* are extra-noun hooks,** never hosted relation roots or join-relations (tool *using* = `ael`, not `han`).
- **Join-act verbs take one `/d/` phrase;** a phrase-join group counts as one phrase.

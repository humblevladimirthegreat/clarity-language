# Migration: grammar-docs + learning-levels for `docs/grammar/`

Plan to bring every file in **`docs/grammar/`** in line with [grammar-docs.md](grammar-docs.md) and [learning-levels.md](learning-levels.md).

**Phase 0 done:** all former top-level `docs/*.md` live under `docs/grammar/`; core sentence page is [core.md](../grammar/core.md); repo pointers updated; grammar pages no longer cite `meta/` / `data/` / other folders.

**Still to do:** Waves 6–7 (Phases 1–3 banding continues; Waves 0–5 done).

## Scope (read this first)

| Location | Role |
|----------|------|
| **`docs/grammar/`** | Learner-facing grammar (design authority for morphology). **Only** this folder is in scope for [learning-levels.md](learning-levels.md) and [grammar-docs.md](grammar-docs.md). |
| **`docs/meta/`** | Editor pedagogy (this plan, banding rubric, prose style, glosses). Not learner reading path. |
| **`docs/examples/`**, **`docs/proposals/`**, repo root (`AGENTS.md`, `TODO.md`, …) | Outside the grammar folder. |

### Rules for files inside `docs/grammar/`

- **Cross-links only to peers** in `docs/grammar/` (e.g. `core.md`, `pronouns.md#…`).
- **Never** link to, path-mention, or prose-mention **`meta/`**, **`examples/`**, **`proposals/`**, **`data/`**, repo-root files, or any other folder outside `grammar/`.
- Do **not** point learners at learning-levels, grammar-docs, glosses, `TODO.md`, or `AGENTS.md` from inside a grammar page. Editors follow those privately; grammar pages state the language only.
- Unassigned design: short **Design notes** appendix on the page, or leave it in `TODO.md` **without** the grammar page citing that file.

[learning-levels.md](learning-levels.md) and [grammar-docs.md](grammar-docs.md) apply **only** to `docs/grammar/`. They do not govern `meta/`, `examples/`, or `proposals/`.

## Goals

1. **`git mv`** every current top-level `docs/*.md` into `docs/grammar/`, and **rename** `language-reference.md` → `core.md` (title may become “Clarity core grammar” or similar; keep stable section anchors).
2. **Strip** from every `grammar/` page any links or mentions of folders outside `grammar/` (including today’s `meta/learning-levels` / `meta/grammar-docs` lines on the core page).
3. **Band** every grammar page that teaches morphology/phonology with `## Beginner` / `## Intermediate` / `## Advanced` (and `<a id="beginner">` etc. where useful). Exception: [introduction.md](../grammar/introduction.md) stays orientation + feature criteria — **not** a learning band — but still lives in `grammar/` and must obey the no-out-of-folder rule.
4. **Restyle** each banded page to the [grammar-docs](grammar-docs.md) skeleton and voice.
5. **Publish a cross-doc path** in [learning-levels.md](learning-levels.md) once enough pages are banded (exact Beginner reading order among `grammar/` files).

Pedagogy only — do not change language design while migrating.

## Non-goals / special cases

| Path (after Phase 0) | Treatment |
|----------------------|-----------|
| `docs/grammar/introduction.md` | Orientation + feature criteria — **not** a learning band. Peer links only (`core.md`, …). No “see meta/…” pointers. |
| `docs/grammar/phonology.md` | Own IPA / phonotactics. Apply skeleton + bands lightly. Still the only place for IPA. |
| `docs/meta/*` | Update links to `../grammar/core.md`; state that banding/style apply only to `grammar/`. |
| `docs/examples/`, `docs/proposals/` | Update inbound links to `../grammar/…`. Not banded. Grammar pages must not link back here. |
| `TODO.md`, `AGENTS.md`, `README.md` | Repo pointers → `docs/grammar/…`. Grammar pages must not mention these files. |

## Phase 0 — Folder move + `core.md` rename

Do this **first** (one mechanical commit) so later page edits do not thrash paths twice.

### Layout target

```
docs/
  grammar/          ← all former top-level docs/*.md
    core.md         ← was core.md
    introduction.md
    phonology.md
    …
  meta/             ← unchanged location
  examples/
  proposals/
```

### Steps

1. `mkdir -p docs/grammar`
2. `git mv` **every** current top-level file `docs/*.md` into `docs/grammar/` (today: `introduction`, `language-reference`, `phonology`, `reference-suffix`, `pronouns`, `plurality`, `questions`, `predication`, `revisers`, `restrictors`, `coordination`, `spans`, `numbers`, `comparatives`, `causation`, `values`, `special-vocabulary`, `x-compounds`, and any other top-level `.md` present at migration time). Leave `meta/`, `examples/`, and `proposals/` where they are.
3. `git mv docs/grammar/core.md docs/grammar/core.md`
4. Adjust `core.md` H1 / one-line job if needed (“core sentence grammar”, not “language reference”).
5. **Repo-wide link sweep** (outside `grammar/` and inside):
   - Replace `core.md` → `core.md` (or `grammar/core.md` from outside the folder).
   - Prefix former top-level doc links with `grammar/` when linking from `AGENTS.md`, `README.md`, `TODO.md`, `docs/meta/*`, `docs/examples/*`, `docs/proposals/*`.
   - Fix relative paths between peers now living under `grammar/` (many were same-directory already and stay same-directory).
6. **Inside every `grammar/` file:** remove links and prose that mention `meta/`, `examples/`, `proposals/`, `data/`, or other out-of-folder paths. On `core.md` specifically, drop prerequisite lines that point at learning-levels / grammar-docs; keep only peer grammar prerequisites (e.g. `reference-suffix.md`, `pronouns.md`) and/or a short in-page note that levels are Beginner → Intermediate → Advanced without naming the meta files.
7. Prefer link text like “core grammar” / `core.md` over “language reference”.
8. Default: **no stub** at old `docs/core.md` or old top-level paths (no redirect trails for learners).
9. Run `npm run lint:md` and fix broken anchors.

**Acceptance:**

- No `docs/*.md` left at the top level of `docs/` (only subfolders + whatever non-markdown assets belong there).
- Zero in-repo references to `core.md` (except historical notes in this plan).
- Zero links from `docs/grammar/**` to `meta/`, `examples/`, `proposals/`, `data/`, or repo-root docs.
- `core.md` still has Beginner / Intermediate / Advanced; lint passes.

## Phase 1 — Per-page rewrite checklist

For each banded page under `docs/grammar/`, apply in order. Editors use meta docs; the page itself never cites them.

### A. Skeleton

1. Title + **one-line job** (what this page owns / does not).
2. **Prerequisites** — 1–3 links to earlier Beginner material **inside `grammar/` only** (always include `core.md` Beginner when the page assumes clause shape).
3. Top-level **`## Beginner` / `## Intermediate` / `## Advanced`** only (no parallel “full inventory” H1 tree outside bands).
4. Optional **See also** at the end — peer links only; no lead link wall.
5. Preserve stable `<a id="…">` anchors; move sections under the right band without breaking inbound links.

### B. Banding ([learning-levels](learning-levels.md#rubric-three-questions))

For each H2/H3, ask the three questions. Prefer the **earlier** band when learners need the form to read ordinary examples. Dependency beats “feels hard.”

| Band | Typical content |
|------|-----------------|
| **Beginner** | Forms needed for short dialogue; freestanding after one short explanation |
| **Intermediate** | Needs another subsystem fluent (joins, numbers, values, spans, …) |
| **Advanced** | Edge inventory, hyperbole, rare overlays, stylistic variants |

### C. Prose / examples ([grammar-docs](grammar-docs.md))

- Teach order: English job → Clarity shape → mnemonic → examples → contrast only if trap → table.
- Second person; plain language (define technical labels in the same breath).
- Mnemonics from metaphor / vowel series / endings — one cue.
- Minimal examples; omit recoverable `jal`; morph gloss + loose free English (follow gloss conventions without linking to `meta/glosses.md`).
- Positive rules first; **Not this** only for expected learner mistakes.
- Strip process leftover (“don’t write X anymore”, hyphen lectures, changelog asides).
- No IPA outside `phonology.md`.
- After edits: `npm run lint:md`.

### D. Scope hygiene

- Own the subsystem; link out to other **`grammar/`** pages only.
- Unassigned design → **Design notes** appendix or silent `TODO.md` (no citation from the page).

## Phase 2 — Suggested page order

Work **dependency-first** so Prerequisites links stay honest. Paths below are under `docs/grammar/` after Phase 0.

| Wave | Page | Notes |
|------|------|--------|
| 0 | **Folder move + `core.md`** | Mechanical: `git mv` top-level → `grammar/`, rename, link sweep, strip out-of-folder mentions. Light title/job polish on `core.md` only. |
| 1 | `reference-suffix.md` | Endings **-l** / **-m** / **-n** / **-r**; Beginner core of almost everything. |
| 1 | `pronouns.md` | Anaphor **-r** + specials; trim English translation tables or demote dense ones to Intermediate. |
| 1 | `plurality.md` | **-sh** associative / address set / collective; generics → link coordination. |
| 1 | `questions.md` | `jol` / `jom`, fill-ask; polar stance inventory may split Intermediate/Advanced. |
| 2 | `predication.md` | Classification vs **`SAME`**; short page — good template check. |
| 2 | `revisers.md` | In-clause vs discourse; *Starting with* / *Finally* → numbers discourse forms. |
| 2 | `restrictors.md` | `hal` / `hual` / … — applicability vs sibling *and*. |
| 3 | `coordination.md` | Joins — large; Beginner = set/rank + bare/focus pattern; Intermediate = nesting / soft **-n** / frame echo; Advanced = rare arities. |
| 3 | `spans.md` | Writing fences Beginner; open/close TYPE×EDGE Intermediate; trunc/sic/close-all Advanced. |
| 4 | `numbers.md` | Largest page — migrate in **sub-passes**. Band aggressively; hyperbole / imaginary / zero×exp → Advanced. |
| 4 | `comparatives.md` | Depends on joins (+ measures); Intermediate-heavy by rubric. |
| 4 | `causation.md` | Depends on joins + `odo`; Intermediate default. |
| 5 | `values.md` | Need inventory + stances; Beginner topic/met; Intermediate prescription/unmet; Advanced ending matrices if dense. |
| 5 | `special-vocabulary.md` | Split by family: join-acts / roles Beginner–Intermediate; numeric derivation / overlays / emotion compose Intermediate–Advanced. |
| 5 | `x-compounds.md` | Parser-family map — Intermediate+; keep short, link owners inside `grammar/`. |
| 6 | `phonology.md` | Light banding; IPA stays here. |
| 6 | `introduction.md` | No bands; peer-only links; “how to learn” describes Beginner→… without naming meta files. |
| 7 | Meta + repo path | Update [learning-levels.md](learning-levels.md) cross-doc path to `../grammar/…`; [grammar-docs.md](grammar-docs.md) “What belongs where”; `AGENTS.md` / `README.md` sources → `docs/grammar/`. |

Waves 1–2 unstick reading ordinary examples. Waves 3–5 unlock the psychological morphology stack. Wave 7 is the “migration complete” signal.

## Phase 3 — Cross-doc learning path

When Waves 0–2 are done (and ideally Wave 3 Beginner), replace the placeholder in [learning-levels.md](learning-levels.md#cross-doc-path) with a concrete order over **`docs/grammar/`** only, e.g.:

1. `introduction.md` (orientation, not a band)
2. `core.md` Beginner
3. `reference-suffix.md` Beginner → `pronouns.md` / `plurality.md` / `questions.md` Beginner
4. Remaining `grammar/` docs’ Beginner
5. Then all Intermediate, then all Advanced

Keep the list short; link to each doc’s `#beginner` (or equivalent).

## Tracking

- [x] Phase 0: `docs/grammar/` move + `core.md` rename + link sweep + strip out-of-folder mentions + `lint:md`
- [x] `reference-suffix.md`
- [x] `pronouns.md`
- [x] `plurality.md`
- [x] `questions.md`
- [x] `predication.md`
- [x] `revisers.md`
- [x] `restrictors.md`
- [x] `coordination.md`
- [x] `spans.md`
- [x] `numbers.md` (may be multiple PRs)
- [x] `comparatives.md`
- [x] `causation.md`
- [x] `values.md`
- [x] `special-vocabulary.md`
- [x] `x-compounds.md`
- [ ] `phonology.md`
- [ ] `introduction.md` (peer-only / no meta mentions)
- [ ] Phase 3: learning-levels path + meta/`AGENTS` final pointers to `docs/grammar/`
- [ ] Confirm no `grammar/**` file links outside the folder (grep)
- [ ] Delete this plan or fold a one-line “complete” note into `TODO.md` when all boxes are done

## PR / commit hygiene

- Prefer **one grammar page per PR** after Phase 0 (Phase 0 is its own mechanical PR; `numbers.md` / `special-vocabulary.md` / `coordination.md` may split into sub-passes).
- Do not mix language-design changes with pedagogy migration in the same PR.
- Every docs PR: run `npm run lint:md`.
- Commit messages: focus on *why* (learner path / pedagogy), e.g. “Band pronouns for the cross-doc beginner path”.

## Definition of done

1. All former top-level grammar markdown lives under `docs/grammar/`; core page is `docs/grammar/core.md`.
2. [learning-levels.md](learning-levels.md) and [grammar-docs.md](grammar-docs.md) are documented as applying **only** to `docs/grammar/`.
3. No file under `docs/grammar/` mentions or links outside that folder.
4. All banded grammar pages have Beginner / Intermediate / Advanced (introduction excepted as noted).
5. [learning-levels.md](learning-levels.md) lists a concrete Beginner order over `grammar/` peers.
6. Spot-check: Beginner-only reading works without Intermediate dumps, editor leftover, or meta/folder leakage.
7. `npm run lint:md` clean.

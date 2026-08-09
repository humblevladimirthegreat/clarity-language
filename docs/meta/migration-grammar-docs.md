# Migration: grammar-docs + learning-levels for `docs/grammar/`

**Status: complete.** All learner grammar under **`docs/grammar/`** follows [grammar-docs.md](grammar-docs.md) and [learning-levels.md](learning-levels.md). Cross-doc Beginner path: [learning-levels.md § Cross-doc path](learning-levels.md#cross-doc-path). Keep this file as a short historical checklist; unassigned language design stays in [TODO.md](../../TODO.md).

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

## Tracking (all done)

- [x] Phase 0: `docs/grammar/` move + `core.md` rename + link sweep + strip out-of-folder mentions + `lint:md`
- [x] Waves 1–5 banded pages (`reference-suffix` … `x-compounds`)
- [x] `phonology.md` (Wave 6)
- [x] `introduction.md` peer-only / no meta mentions (Wave 6)
- [x] Phase 3 / Wave 7: [learning-levels](learning-levels.md#cross-doc-path) path + meta / `AGENTS` / `README` pointers to `docs/grammar/`
- [x] Confirm no `grammar/**` file links outside the folder
- [x] One-line complete note in `TODO.md`

## Definition of done (met)

1. All former top-level grammar markdown lives under `docs/grammar/`; core page is `docs/grammar/core.md`.
2. [learning-levels.md](learning-levels.md) and [grammar-docs.md](grammar-docs.md) apply **only** to `docs/grammar/`.
3. No file under `docs/grammar/` mentions or links outside that folder.
4. All banded grammar pages have Beginner / Intermediate / Advanced (`introduction.md` excepted — orientation only).
5. [learning-levels.md](learning-levels.md) lists a concrete Beginner order over `grammar/` peers.
6. `npm run lint:md` clean.

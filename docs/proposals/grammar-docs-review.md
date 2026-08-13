# Proposal: grammar-docs review follow-through (phased)

**Status:** IN PROGRESS — first pass done (Phases 1–3 + thin Phase 2/4 cuts).  
**Design authority:** remains [`docs/grammar/`](../grammar/introduction.md) (core sentence grammar: [core.md](../grammar/core.md)). This file is an **editor plan** — pedagogy, page IA, leftover wording, and a few banding / presentation cuts. It does **not** change join morphology, **`odo` last**, or the four-ending system.  
**Out of scope:** dedicated observation vs imagination **tense** (stays in [TODO.md](../../TODO.md)). Unassigned number / derivation cells stay unassigned until a spoken need exists.

## Motivation

A full pass over `docs/grammar/` and `docs/meta/` found a coherent language with a teaching order that does not match real dependencies, Beginner bands that dump later inventory, psychological payload sitting behind join machinery, and leftover process / legacy wording. The language’s own [easy-to-use criterion](../grammar/why-agelan.md#criterion-for-features) is the bar for what belongs in Beginner.

## Non-goals (do not redesign)

- Right-close joins, illegal left fences, **`odo` last**
- The four reference letters (**-l** / **-m** / **-n** / **-r**) or the **`a` / `o` / `e` / `u`** series as the reuse system
- Polar stance vs clause force vs propositional negation as **three jobs** (keep the split; teach it in one table)
- Growing unassigned number stems (`…0e0`, `ROOTx+e0`, …) into learner pages
- Tense / observation-vs-imagination (TODO)

## Target Beginner path

**Shipped** in the first pass. Sidebar ([`docs/grammar/.vitepress/config.ts`](../grammar/.vitepress/config.ts) `readingOrder`) and [learning-levels.md](../meta/learning-levels.md) match:

1. [why-agelan.md](../grammar/why-agelan.md) · [introduction.md](../grammar/introduction.md) (orientation, not bands)
2. [core.md](../grammar/core.md) Beginner · [phonology.md](../grammar/phonology.md) Beginner · [reference-suffix.md](../grammar/reference-suffix.md) Beginner
3. [pronouns.md](../grammar/pronouns.md) · [plurality.md](../grammar/plurality.md)
4. [predication.md](../grammar/predication.md)
5. **[coordination.md](../grammar/coordination.md)**
6. **[questions.md](../grammar/questions.md)**
7. **[revisers.md](../grammar/revisers.md) → [restrictors.md](../grammar/restrictors.md)**
8. [spans.md](../grammar/spans.md) → [numbers.md](../grammar/numbers.md) → [comparatives.md](../grammar/comparatives.md) → [causation.md](../grammar/causation.md)
9. [values.md](../grammar/values.md) → [special-vocabulary.md](../grammar/special-vocabulary.md) → [x-compounds.md](../grammar/x-compounds.md)

---

## First pass (done)

Phases 1–3 plus the small Phase 2/4 presentation cuts. No morphology changes. [AGENTS.md](../../AGENTS.md) already points at learning-levels (no third path).

### Path and Needs

- Sidebar + [learning-levels.md](../meta/learning-levels.md) reorder; Intermediate / Advanced numbered **14 / 15**; thin-Beginner rule added
- [predication.md](../grammar/predication.md) Beginner: invert **`ua` / `uo`** teaser removed (contrast lives in Intermediate); published-root patterns, not `<>` schematics
- [causation.md](../grammar/causation.md) Needs: **`odo`** is core **Beginner**; Beginner sufficient = phrase **`…aom`** only (full clauses, not `haon` schematics)
- [x-compounds.md](../grammar/x-compounds.md) Beginner: one ordinary **`ROOT x ROOT`** example
- [grammar-docs.md](../meta/grammar-docs.md) Needs example: `odo` from core Beginner

### Leftover wording, glosses, jargon

- [core.md](../grammar/core.md) title: dropped `(v0.7)`; Beginner *if and only if*; “main sentence” not *matrix*
- [why-agelan.md](../grammar/why-agelan.md): *Can a language change how you think?*; community link labeled Agelan (URL unchanged)
- [introduction.md](../grammar/introduction.md): *compendium*; extra space removed
- [phonology.md](../grammar/phonology.md): dropped “no hyphen” negative
- Glosses: `z-←grace` / `z-who` (not `z-r` / `z-ar`)
- Jargon: *illocution*, *matrix-final*, *predicative* / *zero-copula* (lead), *use–mention* → school English (anchor `zero-copula` kept)

### Meta policy

- Mnemonics required for **Beginner** only
- Dual-role: Advanced may be inventory-first; split if Advanced dwarfs Beginner
- [translation-exercises.md](../meta/translation-exercises.md): only core has a checkpoint; next: coordination, questions, values
- [glosses.md](../meta/glosses.md): editor check line for resume / fill-ask

### Thin Phase 4 presentation

- [questions.md](../grammar/questions.md): one table for clause force vs polar stance vs in-clause denial
- [restrictors.md](../grammar/restrictors.md) Beginner: closed starter list (not a join table with holes)

---

## Remaining

### Phase 2 leftover — numbers Beginner slim

[numbers.md](../grammar/numbers.md) Beginner still dumps marker identity, sign, endings, zero-groups, digits, exponents, and shorthand, and word-shape still points at **Advanced** digitless exponents.

**Keep in Beginner:** `/ɡ/` counts (`g+3`), ordinals (`g#2`), maybe digitless `g+` (*more than one*).  
**Defer:** shorthand depth, overlays, ranges, percent, digitless ∞, zero×exp, Advanced links from word-shape.

Large file (~1,200 lines); easy to leave dangling “below” links. Own pass.

### Phase 4 leftover — banding (still no new morph)

| Page | Still to do |
|------|-------------|
| [values.md](../grammar/values.md) | Keep topic + met in Beginner; **pull unmet `xu` and prescription `xo` into Beginner**. Motive `xe` may stay Intermediate |
| [special-vocabulary.md](../grammar/special-vocabulary.md) Beginner | Lead with **ability + COMMENT (one overlay)** before the ten join-act verbs. Join-act verbs → Intermediate |

Restrictors Intermediate / Advanced inventory and the three *yes* / *no* jobs are unchanged (Beginner presentation already shipped).

### Phase 5 — page IA

Do after the remaining Phase 2/4 work. Larger diffs; no change to joins / `odo` / endings.

**Vowel-series orientation.** Short map after core Beginner (own thin page, or a section in [introduction.md](../grammar/introduction.md) / core): *these four vowels keep the same jobs; the prefix tells you which table.* Not a new morph. Put it on the Beginner path only if it stays one screen.

**Split special-vocabulary.** [special-vocabulary.md](../grammar/special-vocabulary.md) (~1,300 lines) owns ~twelve subsystems. Candidate peer pages:

- Ability
- Evidentiality + COMMENT + NOTIONAL
- Plan / predict + DECISION
- Role compounds + viewpoint laterals
- Numeric derivation (or keep with numbers Advanced)

Join-act verbs / join-relations can stay with coordination or a thin “join extras” page. Update AGENTS.md sources-of-truth table, x-compounds family links, and causation See also.

**Numbers as a specialist module.** After the Beginner slim: Intermediate / Advanced number grammar (overlays, ranges, digitless exponents, zero×exp, derivation) is explicitly **optional** — not required to finish a first dialogue corpus.

---

## Suggested sequence (what’s left)

1. Numbers Beginner slim (Phase 2 leftover)  
2. Values `xu` / `xo` + special-vocab Beginner lead (Phase 4 leftover)  
3. Phase 5 (vowel map + split special-vocabulary + numbers-optional)

## Checks

After each pass that touches `docs/`: **`npm run lint:md`**. Grammar pages still must not link to `meta/`, `proposals/`, or `TODO.md`.

# Rename look-alike grammar terms

**Status:** Accepted, not started. Not design authority; fold into grammar / meta, then drop.  
**Related:** [terminology](../grammar/terminology.md), [morph gloss](../../src/parse/morph-gloss.ts), [constructions](../../src/parse/constructions.ts), [overlays](../../data/lexicon-overlays.csv), [site redirects](../meta/site-redirects.md), [present the current language only](../meta/grammar-docs.md#present-the-current-language-only).

## Problem

Several English names for grammar features sound alike but mean different things (*hold* vs *holder*, three *sequence*s, five *frame*s). Others name one feature in two ways (*label scope* / *scope vowel*, *simile* / *similative*). A learner who meets the second term assumes it is the first.

## Goals

1. Each term on [terminology](../grammar/terminology.md) names one thing, and no two terms sound alike unless they are related.
2. Every learner-visible string changes: headings, prose, glossary entries, morph-gloss labels, SMALLCAPS tags, cheat-sheet cells, LLM-prompt text, and English-helper descriptions.
3. Page and heading ids follow the new names, and old URLs redirect.
4. Code names follow too: TypeScript identifiers, types and fields, Peggy rule and label names, overlay `kind` values, `find.mjs` keys and values, test names, and file names. No old term survives as an identifier.

## Non-goals

- No change to any form, reading, or spelling. These are English-name changes only.
- No former-name notes anywhere. Old names disappear; they are never mentioned.

## Rename list

**Keep** is the side that keeps its name. **Rename** is the side that changes.

### Strong clashes

| # | Clash | Keep | Rename | New name |
|---|-------|------|--------|----------|
| S1 | hold / holder | **Holder** | "Hold endings" on MAY and NOTIONAL | **Follow-up endings** |
| S2 | hang cue / hangs on | "hangs on" (prose verb) | "Hang cue" column and glossary entry | **Fit cue** |
| S3 | sequence ×3 | clause **sequence** (`xan`, *Clause sequence*) | join vowel **`ao`** "sequence"; the order scale's "sequence (first to fourth)" | **route** (join vowel); **position** (scale) |
| S4 | proxy / ON-BEHALF | **Proxy** (*on behalf of*) | emotion locus **ON-BEHALF** | **VICARIOUS** |
| S5 | STILL / phasal *still* | phasal *still* | emotion motion **STILL** | **STATIC** |
| S6 | trial ×2 | ATTEMPT **-r** trial run | prescription **-r** "trial" on sake `the` | **experiment** |
| S7 | offer ×2 | **Offer (question)** | prescription **-m** "offered" | **unasked** |

S6 and S7 together: the prescription ladder becomes **invited / unasked / experiment**, and the glossary entry *Invited / offered / trial* becomes **Invited / unasked / experiment**.

### Medium clashes

| # | Clash | Keep | Rename | New name |
|---|-------|------|--------|----------|
| M1 | frame ×5 | carried-channel **frame** | hook **-m** "frame", "frame extra"; also "superlative frame", "facing frame", as-for "a frame for one sentence" | **zone -m**, **zone extra**; plain prose for the other three ("superlative shape", "facing", "sets the scene for one sentence") |
| M2 | scope ×4 | **scope island**, **SCOPE**, binders | **label scope** / "scope vowel"; page *Role scope* | **label reach** / **reach vowel**; page **Role parts** |
| M3 | tag ×2 | **tag pronoun** | glossary section "Mood tags" | **Mood labels** |
| M4 | pole / polar | **polar** (yes/no) | **clause pole / NP pole**, "pole word", the *poles* headings | **clause hinge / NP hinge**, **hinge word**, *hinges* |
| M5 | stance ×3 | `/th/` **stance**, sake stances | **polar stance** | **polar particle** |
| M6 | act ×3 | **speech act**, **act word** | **join-act verb** | **list verb** |
| M7 | SAME / SHARED | **SHARED** | **SAME** (identity copula) | **IDENTITY** |
| M8 | simile / similative | neither | both | **Likeness (*like*)** |
| M9 | capacity / ability | ABIL, *can* | **Capacity** | **Acting as** |
| M10 | usual ×3 | **practiced role** | **usual role**; **usual order** | merge into **practiced role**; **default order** |
| M11 | conventional / compound names | — | number **-n** "conventional"; "conventional compounds" and "lexical compound" | **named** (same as content **-n**); **dictionary compound** |

## How to rename

- **Find every use first.** Grep is fine for these fixed English strings. Search `docs/grammar`, `docs/examples`, `docs/meta`, `src`, `scripts`, `data`, `AGENTS.md`, and `TODO.md`. Many words are also plain English (*hold*, *frame*, *capacity*, *conventional*, *still*, *offer*, *trial*), so read each hit. Change only the term, never ordinary English.
- **Morph glosses come from code.** Change the label in [`morph-gloss.ts`](../../src/parse/morph-gloss.ts) (or the overlay `gloss` / `definition` column), then regenerate doc glosses with `node scripts/find.mjs --word 'raw=…' --map …` (dry run, then `--write`) or by re-running the gloss writer the build points to. Never hand-edit morph lines in bulk.
- **Headings and ids.** When a heading is renamed, change the heading **and** its `{#id}`, rewrite every `page.md#old` link across docs, src, and data, and leave no silent `<a id="old">` ([site redirects](../meta/site-redirects.md)). A renamed page gets a `pageMoves` row in `scripts/site-redirects.json`, and its sidebar row and AGENTS.md routing row change too.
- **Cheat sheets.** Regenerate with `npm run cheat-sheet-blocks -- --write`; hand-edit only cells outside the `<!-- generated -->` markers.
- **Code names.** Rename identifiers with a symbol-aware rename where possible (TypeScript rename in the editor, or `tsc --noEmit` after a grep-based rename to catch misses). Peggy grammars (`*.peggy`) are plain text: rename rule names and labels by hand, then let the build regenerate the parser. A renamed `find.mjs` key or value also changes its line in AGENTS.md tooling notes. Exception: the `find.mjs` key `scope` keeps its name (see phase 4).
- **Present the current language only.** No "formerly called" notes anywhere in `docs/grammar/`.

### Checks at the end of every phase

1. `npm run build`
2. `npm test`
3. `npm run grammar-check` if `sentence-parser.ts` changed
4. `npm run english-helper-recall -- --check` if `src/english-helper/` or a recipe table changed
5. `npx --no-install tsc --noEmit` if identifiers were renamed
6. A grep for the old term (case-insensitive, word boundary, and camelCase / snake_case spellings such as `scopeVowel`, `clause_pole`) over the paths above. Each remaining hit must be ordinary English.

## Phases

One **agent session per phase**. Do not start the next phase in the same session while build or tests are red. When a phase finishes, mark its row done here.

| Phase | Renames | Why this bundle |
|-------|---------|-----------------|
| 1 | S2, S3 (scale half), M1 (prose half: superlative / facing / as-for), M3, M10, M11 | Prose and glossary only; no parser, gloss, or URL change. Warms up the grep-and-read routine. |
| 2 | S1, S4, S5, S6, S7, M7 | Morph-gloss labels and SMALLCAPS tags on knowing, feelings, and sakes. Same files: `morph-gloss.ts`, `constructions.ts`, `llm-prompt.ts`, overlays, their tests. |
| 3 | S3 (join-vowel half), M1 (hook **-m** zone), M4, M5, M6 | Joins, hooks, causation, and questions. Touches `series.ts`, the overlay kind `clause_pole`, and the `join-acts.md` page title and URL. |
| 4 | M2, M8, M9 | Roles and relations. Renames the `role-scope.md` page and the `#similative` ids, and the role-compound gloss text. |
| 5 | Sweep | Terminology page read-through, AGENTS.md rows, cheat sheets, LLM prompt, English-helper text, leftover grep across the whole repo. |

The phases can run as five separate sessions (the [session prompt](#session-prompt-every-phase) below), or all in one session that hands each phase to a subagent ([orchestrated run](#orchestrated-run)).

---

## Orchestrated run

One main session runs all five phases, one subagent per phase, in order. Never run two phases at once: they share files (terminology, `morph-gloss.ts`, cheat sheets, the build).

### Main-session prompt

Run every unfinished phase of `terminology-renames.md`, in order, one subagent per phase. Call the language **Ageben**.

Before phase 1, run `git status`. If the tree has any change besides this proposal file, stop and ask the user to commit or stash it first, so phase commits hold only rename work.

For each phase:

1. **Launch** one general-purpose subagent with the [session prompt](#session-prompt-every-phase), the phase number, and this line: *You are a subagent: do not ask questions. If a choice is not settled by the proposal or the grammar docs, take the option that changes the least and list it under "Open questions" in your report. Do not commit.* Ask it to report: renames done, files touched, check results, anything skipped, open questions.
2. **Verify yourself.** Do not trust the report. Run `npm run build`, `npm test`, and `npx --no-install tsc --noEmit`, plus `npm run grammar-check` if `src/parse/sentence-parser.ts` changed and `npm run english-helper-recall -- --check` if `src/english-helper/` or a recipe table changed. Grep for the phase's old terms (prose, camelCase, snake_case).
3. **Fix through the same subagent.** If a check fails or old terms remain, send the failure to that subagent (SendMessage) so it fixes it with its context intact. Repeat until green. If it cannot get green after three rounds, stop the run and report to the user.
4. **Mark the phase done** in the Phases table of this file.
5. **Commit** everything in the tree (`git add -A`): message `terminology renames: phase N` with a one-line list of renames, ending with ` [skip-cd]` and the co-author line. Do not pause for review; start the next phase.

After phase 5, delete this file in a final commit (same message rules), then tell the user: the commits, any open questions the subagents listed, and anything skipped.

---

## Session prompt (every phase)

Do phase N of `terminology-renames.md`. Call the language **Ageben**. Present the current language only. Open each owning page and the code that prints the label; do not trust ids, file names, or label sources from memory or from this file.

For each rename in the phase:

1. Grep the old term across `docs/grammar`, `docs/examples`, `docs/meta`, `src`, `scripts`, `data`, `AGENTS.md`, and `TODO.md`, including camelCase and snake_case spellings. List the hits that are the term (not plain English) before editing.
2. Rename code names: identifiers, types, fields, Peggy rules and labels, overlay `kind` values, `find.mjs` keys and values, test names, and file names.
3. If the term is printed by code (morph gloss, SMALLCAPS tag, construction summary, LLM prompt, English-helper description, overlay `gloss` / `definition`), change that string. Then regenerate the doc glosses and update tests that assert the old string.
4. Edit prose, headings, ids, and links. Rewrite every link to a renamed id. Add a `pageMoves` row for a renamed page, and update the sidebar and AGENTS.md.
5. Update the [terminology](../grammar/terminology.md) entry: heading, anchor, gloss, and any **Compare with** lines that name the old term.

Run the phase checks. Mark the phase done in this file. Leave changes in the tree; do not commit. (In an [orchestrated run](#orchestrated-run) the main session marks the phase and commits.)

---

## Phase 1: prose and glossary

- **S2 Fit cue.** The "Hang cue" column in [vowels](../grammar/cheat-sheets/vowels.md) and [consonants](../grammar/cheat-sheets/consonants.md) cheat sheets, their intro paragraphs, and the glossary entry. If the column header comes from the cheat-sheet generator, change it there. "Hangs on" stays.
- **S3, scale half: position.** The **order** scale on **a o e u** is glossed "sequence (first to fourth)" on the vowels cheat sheet and in the glossary **Scale** entry. It becomes "position (first to fourth)". The join vowel `ao` waits for phase 3.
- **M1, prose half.** "superlative frame" (comparatives), "facing frame" (viewpoint, glossary **Viewpoint laterals**), and as-for's "a frame for one sentence" (say-people-places, glossary **As-for**, **Topic** compare line). Rewrite as plain prose. The carried-channel **frame** stays.
- **M3 Mood labels.** The glossary section heading and its id, plus links to `terminology#mood-tags` (Adverb and Digitless-exponent compare lines, and any page).
- **M10.** "usual role" → **practiced role** in docs and in `src/english-helper/` description text (`analyze.ts`, `describe.ts`, and tests). Merge the glossary entries **Usual role** and **Label scope**'s compare line onto **Practiced role**. "usual order" → **default order** on speech-moves, questions, and the glossary; fix its id.
- **M11.** Number ending **-n** "conventional" (number-markers, digitless pages, glossary **Conventional (number -n)**) → **named**. Merge the glossary entry into **Concrete / abstract / named / resume** or rename it **Named (number -n)**. "lexical compound" and "conventional compounds" (glossary, compounds pages, AGENTS.md `lexicon-compounds.csv` row, [lexicon](../meta/lexicon.md)) → **dictionary compound**. Do not touch `english-wordnet.json`.

## Phase 2: gloss labels on knowing, feelings, and sakes

- **S1 Follow-up endings.** Headings *Hold endings (MAY)* on [knowing](../grammar/beginner/knowing.md) and *Hold endings (NOTIONAL)* on notional, their ids (`may-hold`, `hold-endings-notional`, `notional-hold`), every link to them (say-reasons, cheat sheets, overlays `anchor` column), and the glossary **Hold** entry. **Holder** stays.
- **S4 VICARIOUS.** `ON-BEHALF` in `morph-gloss.ts` (emotion locus map), `llm-prompt.ts`, and their tests. Then feelings-permission, holder, and the glossary mood-tag row plus the **Holder** compare line.
- **S5 STATIC.** `STILL` in `EMOTION_MOTION` in `morph-gloss.ts`, and the feelings-permission motion table and prose ("Surging and still are…"). The overlay definitions in `lexicon-overlays.csv` that say "STILL phasal" are the phasal word: change that text to lowercase *still* or "phasal still" so no caps STILL remains.
- **S6, S7: invited / unasked / experiment.** In the prescription ending map in `morph-gloss.ts` (`e: { l: "invited", m: "offered", r: "trial" }`), the `ending.e.m` / `ending.e.r` summaries and the sake reader note in `constructions.ts`, and tests. Then [ought-for-a-sake](../grammar/beginner/ought-for-a-sake.md) tables and cue column, sakes, prescription, cheat sheets, and the glossary entry (keep its three `<a id>` lines only if they are live link targets; otherwise drop them). ATTEMPT's **trial run** and **Offer (question)** stay.
- **M7 IDENTITY.** The `orel` overlay `gloss` / `definition` (`SAME`), any SAME label in `morph-gloss.ts`, `scripts/lib/lexicon-review-checks.ts`, tests, the predication page, the glossary **Identity** / **Classification** / **Likeness** compare lines, and the mood-tag table row. Check that **SHARED** stays unchanged.

## Phase 3: joins, hooks, causation, questions

- **S3, join half: route.** `ao: { english: "sequence", … }` in [`series.ts`](../../src/parse/series.ts), the join-vowel names table in the glossary, the joins and rank-joins pages, the vowels cheat sheet, root-tails ("**o** path or sequence"), and the `ao…` empty-allowed cells ("open sequence start" → "open route start"). Check `gloss-inverse.ts`, `reading-equivalence.ts`, and `find/query` tests for the string. Clause **sequence** stays.
- **M1, hook half: zone -m.** "the **-m** frame", "frame **-m**", "frame extra", and "`mx` for the -m frame" on hooks, ending-grids, locative-relations, hook-compounds, hooked-joins, extra-noun-hooks, and the glossary **Hook**, **Hook prefix**, **Hooked join**, and **Locative relation** entries. Check the gloss and construction text in `src/` for "frame".
- **M4 hinge.** "clause pole", "NP pole", "pole word", "pole" headings and ids on causation, dependents (`#poles`, `#time-poles`), iff-fault, say-reasons, and the glossary **Clause pole / NP pole** entry plus compare lines (**Stand-in**). The overlay kind `clause_pole` → `clause_hinge` and its `definition` text in `lexicon-overlays.csv`, and the overlay-kinds list in [parser pipeline](../meta/parser-pipeline.md#overlay-kinds). Grep `src` for `clause_pole`.
- **M5 polar particle.** "polar stance" on questions, polar-inventory, speech-moves, the glossary entry and its compare lines (**Act word**, **Speech act**, **Check-back**, **Yes/no**), plus `enforce.ts` / `constructions.ts` messages and tests.
- **M6 list verb.** The page *Join-act verbs* (`join-acts.md`) → *List verbs* (`list-verbs.md`), with a `pageMoves` row, sidebar row, and AGENTS.md `join-across-roles.md` Owns line. Rename "join-act verb" in prose, the glossary entry **Join-act verb / join-relation** (→ **List verb / join-relation**), and printed text in `src/` (token or construction summaries). Rename `joinAct` identifiers, token kinds, and the overlay kind (`tokens.ts`, `types.ts`, `lexicon-search`, `lexicon-overlays.csv`) to `listVerb` / `list_verb`.

## Phase 4: roles and relations

- **M2 label reach.** "label scope" and "scope vowel" on [label-seams](../grammar/beginner/label-seams.md), roles, role-scope, pronouns (role pointers), the glossary entries **Label scope**, **Role compound**, and **Role pointer**, and printed text in `src/` (`enforce.ts` and `invalid-forms` messages, morph-gloss tests). The *label-scope* page and ids become *label reach*. The page *Role scope* (`role-scope.md`) → **Role parts** (`role-parts.md`), with a `pageMoves` row, sidebar row, AGENTS.md `roles.md` row, and every `role-scope.md#…` link in docs, `src/parse/llm-prompt.ts`, `types.ts`, tests, and the `lexicon-published.csv` anchor column. Rename `scopeVowel` → `reachVowel` and `labelScope` → `labelReach` in `word.peggy`, `types.ts`, `enforce.ts`, `inspect.ts`, `find/query.ts`, and tests. The `find.mjs` key `scope` **stays** (decided): it reads the role-compound vowel and other families (`say` scope, the `x` scope family). Only the identifiers behind it change.
- **M8 Likeness.** The `#similative` heading and id on [relations](../grammar/beginner/relations.md), exactly-like, every `relations#similative` link, the glossary entry *Simile (like)*, the **Capacity** / **Exchange** compare lines, and printed text in `src/` (`lexicon-search.ts`, `free-english.ts`, `inspect.ts`, overlays `kind` / `definition`). Rename the overlay kind `similative` → `likeness` (overlays CSV, `enforce.ts` and other `overlay.kind` checks, parser-pipeline overlay list) and any `similative` identifiers.
- **M9 Acting as.** The *Capacity* heading and id on role-scope (role-parts after M2), the glossary entry, the role-compound compare line, and printed text and identifiers (`capacity` → `actingAs`) in `enforce.ts`, `constructions.ts`, `types.ts`, and tests. Plain-English *capacity* in `lexicon-published.csv` senses stays.

## Phase 5: sweep

- Read [terminology](../grammar/terminology.md) top to bottom: each renamed entry sits in A–Z order, its anchor matches its heading, and no **Compare with** line names an old term.
- `npm run cheat-sheet-blocks -- --write`; read the vowels, consonants, and to-English sheets.
- AGENTS.md: each renamed page's routing row, and any old term in a topic noun.
- `node scripts/parse.mjs --llm-prompt` on one sentence per renamed label; check that the prompt prints the new names.
- Run the old-term grep from [Checks](#checks-at-the-end-of-every-phase) across the whole repo for all 18 renames.
- Run the code-name grep (camelCase, snake_case, file names) across `src`, `scripts`, and `data` for all 18 renames.
- Delete this file once nothing is left.

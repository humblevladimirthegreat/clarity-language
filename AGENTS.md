# Agazan

Constructed language and tooling that encode psychologically useful distinctions into vocabulary and grammar (compassion / rationality / empowerment themes: gratitude, bias awareness, authentic choice). Unambiguous syntax supports computational tools; phonology aims to be easy to sing.

Always call the language **Agazan** (Clarity is a legacy name). Do not restate the English gloss from [`docs/grammar/introduction.md`](docs/grammar/introduction.md). The name is tied to the glasses root, [language-name.md](docs/meta/language-name.md). Grammar and in-scope editor blurbs show **only the current language**: current published spellings and current English names. No former-name notes or dual spellings, [present the current language only](docs/meta/grammar-docs.md#present-the-current-language-only).

**This file routes; it does not teach.** Never trust a form or meaning from memory or from this file, open the owning doc. What belongs here: [AGENTS.md policy](docs/meta/agents-md.md).

## Sources of truth

Each row names what the file owns. The file is the authority; this table is only a pointer.

### Grammar (learner-facing, `docs/grammar/`)

| Source | Owns |
|--------|------|
| `why-agazan.md` | Psychological purpose, limits, feature criteria, learner tour. Site home. |
| `introduction.md` | Name, design goals, learning path. |
| `clause.md` | **Source of truth** for one-clause grammar: role letters, default order, hosting, chaining. Other docs own their subsystems. |
| `phonology.md` | Phonology, phonotactics, letter names. |
| `word-endings.md` | Word endings, proper names, titled phrases, citation forms, greetings. |
| `pronouns.md` | Whole-stem resume, role pointers, ordinal, special, generic, and topic pronouns; the discourse topic. |
| `plurality.md` | Plural, associative, address sets, clusivity, collectives. |
| `questions.md` | Yes/no and fill questions, polar stance particles. |
| `speech-moves.md` | Turns, vocatives, interjections, speech acts, the reusable vowel series, tone marks. |
| `dependents.md` | Next-sentence grammar: continue, stand-ins, subordinators, relative-clause equivalents, linkers. |
| `relations.md` | Hosted relation catalog: similative, exchange, proxy, of-relations, as-of, social ties. |
| `hooks.md` | Prefix-less hooks: in-clause, span hooks, discourse glue, extra-noun, hook compounds. |
| `restrictors.md` | `/h/` / `/w/` restrictors, habitual. |
| `joins.md` | Phrase and clause joins, fences, set vs rank, arity, denying a whole list. |
| `join-across-roles.md` | Joins across roles, join-act verbs, join-relations. |
| `comparatives.md` | Comparatives, superlatives, equatives, manner scale, stance bars. |
| `predication.md` | Classification, identity, label scope. |
| `causation.md` | Causation / condition poles, fault, CAUSE mood. |
| `sakes.md` | Sakes, emotion compose, permission, consent. |
| `intention.md` | Plan, decision, try / fallback, ability / incapability. |
| `knowing.md` | MAY, evidentiality and evidence strength, forecasts, residue / former, notional, universality. |
| `roles.md` | Role compounds, viewpoint laterals, landmark facing, gravity. |
| `x-compounds.md` | Mid-word `x` families and the mid-word `th` seam, conversation length. |
| `spans.md` | Span fences, asides, scope islands. |
| `numbers.md` | Numerals, digitless forms, exponents, stance numbers, group separator, writing style. |
| `numbers-applied.md` | Digit strings, time and date, ranges, measure phrases. |
| `numeric-derivation.md` | Root + number derivation (advanced only). |
| `english.md` + `say-*.md` | **Saying it in Agazan** recipe track, keyed by English job. Outside stage order; stage pages never link to it, [recipe track](docs/meta/grammar-docs.md#recipe-track). New gap resolutions that add no form go here. |
| `claritish/` | **Claritish** on-ramp: closed Agazan words dropped into English, an intro page, ten lessons, a bonus tone-marks lesson, and a closing plug. Adds no forms; never links into the grammar except the closing page, [Claritish track](docs/meta/grammar-docs.md#claritish-track). |
| `exceptions-cheatsheet.md` | **Cheat Sheets** sidebar: quick-glance list of where the grammar breaks its own pattern, linking to the owning pages. Adds no forms. |
| `terminology.md` | English names for grammatical features. Teaching pages do not link into it except [How to learn](docs/grammar/introduction.md#how-to-learn). |

### Data

| Source | Owns |
|--------|------|
| `data/lexicon-published.csv` | Published emoji-seeded roots. PoS and ending applied at use time. |
| `data/lexicon-compounds.csv` | Conventional compounds without mid-word `x`. |
| `data/lexicon-overlays.csv` | Closed overlay inventory and the anchor that teaches each row, [overlay kinds](docs/meta/parser-pipeline.md#overlay-kinds). New overlays attach to an existing published row. |

### Editor notes (`docs/meta/`, not published)

| Source | Owns |
|--------|------|
| `grammar-docs.md` | Content and teaching policy for grammar pages, house cast, retie-safe writing, marking Agazan. |
| `doc-style.md` | Wording and voice. |
| `claritish-style.md` | Wording and voice for the Claritish track, and the hyphenated English host. |
| `glosses.md` | Morph and free gloss rules. |
| `learning-levels.md` | Beginner / intermediate / advanced rubric and the cross-doc path. |
| `translation-exercises.md` | Translation checkpoint policy. |
| `drill-generation.md` | Procedure for adding checkpoints. |
| `lexicon.md` | Root spellings, root length, respelling, moving an overlay to another row. |
| `design-decisions.md` | Why a form or reading is deliberately absent, and rejected alternatives. Not a restatement of grammar pages; settled readings go on grammar pages, never here. |
| `unassigned-reserved.md` | Every spelling with no reading, marked open (no natural reading yet) or closed (by a design decision). Never linked from grammar pages. |
| `language-name.md` | Why the name is Agazan. |
| `proposals.md` | Notes for `docs/proposals/`, never link to proposal pages (filenames in backticks only). |
| `site-redirects.md` | Public URL remaps. |
| `agents-md.md` | What belongs in this file. |
| `TODO.md` (root) | Planned revisions; fold into grammar docs as work proceeds. |

## Tooling notes

- Node ≥ 24 (runs `.ts` natively; see `.nvmrc`).
- Tests run with **`npm test`** (Node's built-in runner via `tsx --test`). Vitest is intentionally **not** installed, never run bare `npx vitest`. Use `npx --no-install <tool>` to check for a CLI; avoid bare `npx <tool>` for tools this repo does not depend on.
- Language design work goes through `introduction.md`, `why-agazan.md`, `clause.md` and the linked grammar docs (and `TODO.md` until absorbed). Do **not** treat any parser implementation as design authority until it matches the docs.
- **Parser changes ship with grammar changes:** a change to what the parser accepts, rejects, or how it reads a form lands in the same change as the grammar-doc edit that teaches it (the owning page, plus `unassigned-reserved.md` for a newly rejected spelling and `design-decisions.md` when the rejection has a reason beyond *no reading yet*). Never change parser behavior without the matching grammar edit.
- **Orthography invariants** ([phonology](docs/grammar/phonology.md)): `th` is one letter written with two characters, and there is no `t`. No hyphen after the PoS letter. Native text is unicase lowercase; capitals only inside foreign / opaque payloads ([spans](docs/grammar/spans.md)). Named reference is marked by ending, not case. Prefer published lexicon roots when the gloss matches.
- **Example sentences**: do not add a leading assertion turn to every example when it is omissible, see [clause.md](docs/grammar/clause.md) and [speech-moves.md](docs/grammar/speech-moves.md).
- **Learner name slot:** write the reader-as-speaker name as **`SELF`**: [first person](docs/meta/grammar-docs.md#house-cast). The site fills it ([`src/learner-name.ts`](src/learner-name.ts)).
- **Parsing Agazan:** run **`node scripts/parse.mjs '<sentence>'`** directly (not `npm run parse` or `tsx src/parse/cli.ts`). It rebuilds automatically when `src/` changes. Pass several quoted inputs in one call (JSON array out), or `-` for one input per line on stdin. Add `--check-ambiguity` as needed, and `--check-lexicon` to list words the lexicon does not know (a stem that only parses is not a lexicon word, and an unlisted compound shows its possible split).
- **Searching examples by construction:** grep is fine for a fixed spelling. For grammar questions use **`node scripts/find.mjs`** with `key=value[,…]` terms (`role`, `ending`, `root`, `family`, `overlay`, `unit`, `raw`). Each value is a regex that must match the whole field, and `key!=value` negates: e.g. `--word role=v,ending=r`, `--seq 'role!=[zdb]' family=hook,raw=em role=b`, `--word 'raw=.*em'`, `--construction 'overlay.<form>*'` or `'/regex/'`. Add `--count` or `--json`.
- **Finding a form from an English cue:** run **`node scripts/find-english.mjs '<phrase>'`** before logging a grammar gap, and log the phrases you tried in the gap row. It searches example English, word glosses, table rows, and practice in `docs/grammar/`, plus published-root senses and `english_aliases` synonyms (`--kind root`), grouped by owning section. Add `--stage`, `--kind`, `--json`, or `--count`.
- **New root spellings:** always generate them with `npm run convert-word`, never by hand. Root length, moving an overlay to another row, and the full procedure: [lexicon editing](docs/meta/lexicon.md).
- **Respelling roots:** after `npm run convert-word -- --lexicon`, run **`npm run retie-docs`** (dry run), then **`npm run retie-docs -- --write`**, then `npm run build` and `npm test`, and read the review list and warnings. Never bulk-replace old roots across Markdown. Code never spells a root as a string literal, use [`src/closed-roots.ts`](src/closed-roots.ts). `--lexicon --only LITERAL` respells matching rows only. Writing rules that keep pages retie-safe: [retie-safe writing](docs/meta/grammar-docs.md#retie-safe-writing).
- **After editing Markdown** under `docs/` (or `AGENTS.md` / `TODO.md`), run **`npm run build`**: no separate lint command. Skip it when the only changes are under `docs/meta/` or `docs/proposals/`. The build checks emphasis syntax, Vue-illegal tags, proposal links, that Agazan in code spans parses and uses lexicon roots, morph glosses, **Roots used here** tables, the terminology page, and dead URLs, details in [marking Agazan](docs/meta/grammar-docs.md#marking-agazan). Write `*a* / *b*`, not `*a*/*b*`; in bold text put forms in backticks only.
- **Commits made by AI:** always append **`[skip-cd]`** to the commit message so Amplify doesn't start a build.
- **Bash permission classifier errors:** if a Bash call fails because the auto-mode classifier gave no verdict, retry the same call up to 5 times with exponential backoff (for example 1, 5, 25, 125, 625 seconds). If it still fails, stop working and tell the user. Do not switch to workarounds.

# Evaluating ideas

Dev effort is not a con against an idea. Weigh options by their effect on the end user, unless the implementation is risky (a new library, or something an AI might implement incorrectly). For example, needing to update many cross-references is not a downside of a new language feature. Legacy learners are also not a concern - we have no current speakers, so learners needing to unlearn a changed grammar is not a downside.

A second way to say the same thing is not a downside either. If a form is intuitive and would arise naturally, allow it; ban an intuitive form only for a stated cost ([design-decisions](docs/meta/design-decisions.md)).

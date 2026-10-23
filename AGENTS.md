# Agebon

Constructed language and tooling that encode psychologically useful distinctions into vocabulary and grammar (compassion / rationality / empowerment themes: gratitude, bias awareness, authentic choice). Unambiguous syntax supports computational tools; phonology aims to be easy to sing.

Always call the language **Agebon** (Clarity is a legacy name). Do not restate the English gloss from [`docs/grammar/introduction.md`](docs/grammar/introduction.md). The name is tied to the glasses root, [language-name.md](docs/meta/language-name.md). Grammar and in-scope editor blurbs show **only the current language**: current published spellings and current English names. No former-name notes or dual spellings, [present the current language only](docs/meta/grammar-docs.md#present-the-current-language-only).

**This file routes; it does not teach.** Never trust a form or meaning from memory or from this file, open the owning doc. What belongs here: [AGENTS.md policy](docs/meta/agents-md.md).

## Sources of truth

Each row names what the file owns. The file is the authority; this table is only a pointer.

### Grammar (learner-facing, `docs/grammar/`)

| Source | Owns |
|--------|------|
| `purpose.md` | Psychological purpose, limits, learner tour. Site home. |
| `introduction.md` | Name, design goals, learning path. |
| `clause.md` | **Source of truth** for one-clause grammar: role letters, default order, hosting; left-bound adjectives, chaining (`left-bound.md`); emphasis, audible start (`emphasis.md`). Other docs own their subsystems. |
| `phonology.md` | Phonology; phonotactics, letter names (`phonotactics.md`); singability, speech edges (`singability.md`). |
| `word-endings.md` | Word endings, citation forms, greetings; proper names and titled phrases (`proper-names.md`). |
| `pronouns.md` | Whole-stem resume, role pointers, special, and generic pronouns; tag pronouns (`tag-pronouns.md`). |
| `topic.md` | Discourse topic, topic pronoun. |
| `plurality.md` | Plural, associative, address sets, clusivity; collectives (`collectives.md`). |
| `questions.md` | Yes/no and fill questions, polar stance particles; polar inventory and rhetorical (`polar-inventory.md`). |
| `fill-ask-roles.md` | Fill-ask roles: arity, what kind / when / where / whose / how / why, blank in a dependent. |
| `speech-moves.md` | Turns, vocatives, interjections, speech acts, the reusable vowel series; tone marks (`speech-acts.md`). |
| `dependents.md` | Next-sentence grammar: continue, subordinators; sentence linkers, stand-ins (`sentence-linkers.md`); lexicalized stand-ins (`stand-in-roles.md`). |
| `relations.md` | Hosted relation catalog: similative, exchange, proxy; of-relations, social ties (`of-relations.md`); as-of (`as-of.md`). |
| `hooks.md` | Prefix-less hooks: in-clause, discourse glue, extra-noun; ending grids, ranges (`ending-grids.md`); hook compounds, prefixes, hooked joins (`hook-compounds.md`). |
| `discourse-hooks.md` | Stacked discourse, somewhere / nowhere / everywhere, here and there, hook resume, parallel chains, discourse placements. |
| `restrictors.md` | `/h/` / `/w/` restrictors, habitual; more occasions (`more-occasions.md`). |
| `joins.md` | Phrase and clause joins, fences, set vs rank; rank joins (`rank-joins.md`); join islands, role grid (`join-islands.md`). |
| `join-across-roles.md` | Joins across roles, join-act verbs, join-relations. |
| `comparatives.md` | Comparatives, superlatives, equatives; manner scale (`comparative-arity.md`); stance bars (`stance-bars.md`). |
| `predication.md` | Classification, identity; label scope (`label-scope.md`). |
| `causation.md` | Causation / condition poles; iff, fault, CAUSE (`iff-fault.md`). |
| `sakes.md` | Sakes, met / unmet; prescription, motive, attachment, whose stake, contrary, sake bars (`prescription.md`). |
| `feelings-permission.md` | Feelings, thanks, speaker attitude, permission, consent. |
| `intention.md` | Plan; decision, try / fallback, ability / incapability (`ability.md`). |
| `knowing.md` | MAY; evidentiality, holder (`evidentiality.md`); universality, dated channel (`universality.md`). |
| `notional-standing.md` | Notional and standing: mirative, residue / former, phasal, notional, channel bars. |
| `roles.md` | Role compounds; viewpoint laterals, landmark facing, gravity (`viewpoint.md`). |
| `compounds.md` | Mid-word `x`, dictionary compounds; compound families, conversation length (`compound-families.md`); root tails, tail suffixes (`root-tails.md`). |
| `spans.md` | Span fences, asides; mention, scope islands (`span-mention.md`); editorial close, nesting (`span-nesting.md`). |
| `numbers.md` | Numerals; word shape, markers, endings, writing (`number-markers.md`); end-relative, stacked markers (`stacked-markers.md`). |
| `digitless-exponents.md` | Digitless forms, exponents, bare OoM, group separator; special values, hyperbole, number as stance (`special-values.md`). |
| `numbers-applied.md` | Digit strings, time and date, ranges, measure phrases; initials, rays, named ranges (`initials.md`). |
| `numeric-derivation.md` | Numeric prefixes: number + `x` + root (advanced only). |
| `review.md` | **Level reviews**: one `### Practice` per band (`review.md`, `review-intermediate.md`, `review-advanced.md`), last in each sidebar group; adds no forms and no words, [level reviews](docs/meta/translation-exercises.md#level-reviews). |
| `english.md` + `say-*.md` | **Saying it in Agebon** recipe track, keyed by English job. Outside stage order; stage pages never link to it, [recipe track](docs/meta/grammar-docs.md#recipe-track). New gap resolutions that add no form go here. |
| `claritish/` | **Claritish** on-ramp: closed Agebon words dropped into English, an intro page, ten lessons, a bonus tone-marks lesson, a closing plug, a one-page cheat sheet, and a journal editor. Adds no forms; never links into the grammar except the closing page, [Claritish track](docs/meta/grammar-docs.md#claritish-track). |
| `cheat-sheets/` | **Cheat Sheets** sidebar: one printable lookup page per subsystem, plus Agebon → English and Exceptions; each row links to its owning section. Tables between `<!-- generated -->` markers come from the data via `npm run cheat-sheet-blocks -- --write`; never edit them by hand. Adds no forms, [cheat sheets](docs/meta/grammar-docs.md#cheat-sheets). |
| `terminology.md` | English names for grammatical features. Teaching pages do not link into it except [How to learn](docs/grammar/introduction.md#how-to-learn). |

### Data

| Source | Owns |
|--------|------|
| `data/lexicon-published.csv` | Published roots: each has a concrete sense and usually an emoji or pictograph seed, [seeds](docs/meta/lexicon.md#seeds-concrete-senses-and-pictographs). PoS and ending applied at use time. The `core` column is the core vocabulary order, [core vocabulary](docs/meta/lexicon.md#core-vocabulary-column). `kind` and `shape` spell a root's tail, and `size` steers a five-letter root's middle vowel, [root tails](docs/meta/lexicon.md#root-tails). |
| `data/lexicon-compounds.csv` | Conventional compounds without mid-word `x`, with the same `core` column. |
| `data/lexicon-overlays.csv` | Closed overlay inventory and the anchor that teaches each row, [overlay kinds](docs/meta/parser-pipeline.md#overlay-kinds). New overlays attach to an existing published row. |
| `data/claritish-triggers.csv` | Journal editor cues: the English patterns each Claritish lesson's gap names, their exclusions, flow, placement, and mirror wording, [editor cards](docs/meta/claritish-style.md#editor-cards). |
| `data/claritish-flows.json` | Journal editor question flows and slash commands: each answer names a Claritish cheat sheet cell, never a spelling, [editor cards](docs/meta/claritish-style.md#editor-cards). |
| `data/claritish-words.csv` | Journal editor word lists the cues name as `@list`: the trait words a label names, the emotion words a feeling names, and the degree words between, [editor cards](docs/meta/claritish-style.md#editor-cards). |

### Editor notes (`docs/meta/`, not published)

| Source | Owns |
|--------|------|
| `grammar-docs.md` | Content and teaching policy for grammar pages, house cast, retie-safe writing, marking Agebon, cheat sheets. |
| `doc-style.md` | Wording and voice. |
| `claritish-style.md` | Wording and voice for the Claritish track, and the hyphenated English host. |
| `glosses.md` | Morph and free gloss rules. |
| `learning-levels.md` | Beginner / intermediate / advanced rubric and the cross-doc path. |
| `translation-exercises.md` | Translation checkpoint policy. |
| `drill-generation.md` | Procedure for adding checkpoints. |
| `lexicon.md` | Root spellings, root length, respelling, moving an overlay to another row. |
| `retie.md` | Known retie limits: the language-name pass, skipped pages, docs and tests to fix by hand after `--write`. |
| `design-decisions.md` | Why a form or reading is deliberately absent, and rejected alternatives. Not a restatement of grammar pages; settled readings go on grammar pages, never here. |
| `unassigned-reserved.md` | Every spelling with no reading, marked open (no natural reading yet) or closed (by a design decision). Never linked from grammar pages. |
| `feature-criteria.md` | The test a psychological feature must pass to enter the language. |
| `language-name.md` | Why the name is Agebon. |
| `proposals.md` | Notes for `docs/proposals/`, never link to proposal pages (filenames in backticks only). |
| `site-redirects.md` | Public URL remaps. |
| `agents-md.md` | What belongs in this file. |
| `wizard-game.md` | Wizard sandbox engine (`src/game/`): what it reads from the docs, writing game content as morph gloss, and its checks. |
| `TODO.md` (root) | Planned revisions; fold into grammar docs as work proceeds. |

## Tooling notes

- Node ≥ 24 (runs `.ts` natively; see `.nvmrc`).
- Tests run with **`npm test`** (Node's built-in runner via `tsx --test`). Vitest is intentionally **not** installed, never run bare `npx vitest`. Use `npx --no-install <tool>` to check for a CLI; avoid bare `npx <tool>` for tools this repo does not depend on.
- Language design work goes through `introduction.md`, `purpose.md`, `clause.md` and the linked grammar docs (and `TODO.md` until absorbed). Do **not** treat any parser implementation as design authority until it matches the docs.
- **Parser changes ship with grammar changes:** a change to what the parser accepts, rejects, or how it reads a form lands in the same change as the grammar-doc edit that teaches it (the owning page, plus `unassigned-reserved.md` for a newly rejected spelling and `design-decisions.md` when the rejection has a reason beyond *no reading yet*). Never change parser behavior without the matching grammar edit.
- **Orthography invariants** ([phonology](docs/grammar/phonology.md)): `th` is one letter written with two characters, and there is no `t`. No hyphen after the PoS letter. Native text is unicase lowercase; capitals only inside foreign / opaque payloads ([spans](docs/grammar/spans.md)). Named reference is marked by ending, not case. Prefer published lexicon roots when the gloss matches.
- **Example sentences**: do not add a leading assertion turn to every example when it is omissible, see [clause.md](docs/grammar/clause.md) and [speech-moves.md](docs/grammar/speech-moves.md).
- **Learner name slot:** **`SELF`** is the reader's own name, only where the name is the form (greeting, conversation-length bid, self-introduction); plain *I* is not the slot: [first person](docs/meta/grammar-docs.md#house-cast). The site fills it ([`src/learner-name.ts`](src/learner-name.ts)).
- **One tree per sentence:** after changing `src/parse/sentence-parser.ts` (rules or `markContext`), run **`npm run grammar-check`** (about a minute; not part of `npm test`). It fails on any `GATE`, LR(1) conflict, or doc sentence with two trees; turn a new choice into structure or a token mark, never a gate.
- **Parsing Agebon:** run **`node scripts/parse.mjs '<sentence>'`** directly (not `npm run parse` or `tsx src/parse/cli.ts`). It rebuilds automatically when `src/` changes. Pass several quoted inputs in one call (JSON array out), or `-` for one input per line on stdin. Add `--check-ambiguity` as needed, and `--check-lexicon` to list words the lexicon does not know (a stem that only parses is not a lexicon word, and an unlisted compound shows its possible split).
- **Translating Agebon to English:** run **`node scripts/parse.mjs --llm-prompt '<sentence>'`** (several quoted inputs make one passage; `--loose` for no note) and follow the prompt it prints. It is self-contained: how to read the morph gloss, the tags and constructions that sentence uses, and the closest doc examples with their English. Use it instead of reading grammar pages to work out what a sentence means. It is built from the docs, so where it and a grammar page disagree, the page wins: fix the prompt's source (core in [`src/parse/llm-prompt.ts`](src/parse/llm-prompt.ts), `reader` notes in [`src/parse/constructions.ts`](src/parse/constructions.ts)). `npm run llm-eval` scores it on doc pairs; it calls models and costs money, so run it only when asked.
- **Searching examples by construction:** grep is fine for a fixed spelling. For grammar questions use **`node scripts/find.mjs`** with `key=value[,…]` terms (`role`, `ending`, `root`, `family`, `overlay`, `unit`, `raw`). Each value is a regex that must match the whole field, and `key!=value` negates: e.g. `--word role=v,ending=r`, `--seq 'role!=[zdb]' family=hook,raw=em role=b`, `--word 'raw=.*em'`, `--construction 'overlay.<form>*'` or `'/regex/'`. Add `--count` or `--json`.
- **Finding a form from an English cue:** run **`node scripts/find-english.mjs '<phrase>'`** before logging a grammar gap, and log the phrases you tried in the gap row. It searches example English, word glosses, table rows, and practice in `docs/grammar/`, plus published-root senses and `english_aliases` synonyms (`--kind root`), grouped by owning section. Add `--stage`, `--kind`, `--json`, or `--count`.
- **English → Agebon suggestions:** run **`node scripts/english-helper.mjs '<english>'`** for per-clause root and grammar-section suggestions. It only suggests and never writes the sentence. Add `--stage`, `--json`, or force a reading with `saw/n` (`/v`, `/adj`, `/adv`). `--llm-prompt` wraps the suggestions in a prompt for an LLM to write the sentence; `--verify '<draft>'` (one per English input) parses a draft beside its English. `npm run english-helper-recall` scores it on doc pairs, English → Agebon checkpoint items, and the held-out wild set (`src/english-helper/wild.tsv`; never copy its sentences into cue rows or examples), including whether each reference word is in the prompt (free; report and worklist in `tmp/`); run it with `-- --check` before committing a change to `src/english-helper/` or a recipe table, and `-- --write-baseline` to keep improved numbers. Pin each fixed behavior with a line in `src/english-helper/cases.tsv`. After a lexicon CSV change, run `npm run english-helper-wordnet` to regenerate its WordNet index (`npm test` fails when it is stale).
- **Number pegs:** run **`node scripts/pegs.mjs '<digits>'`** for the roots whose consonants spell each chunk, or `'<agebon>'` for the digits a word spells; `--check` lists any empty 0–9 / 00–99 cell. The method is taught on [pegs.md](docs/grammar/pegs.md); `npm test` fails if a respelling empties a cell.
- **New root spellings:** always generate them with `npm run convert-word`, never by hand. Root length, moving an overlay to another row, and the full procedure: [lexicon editing](docs/meta/lexicon.md).
- **Peel a sitting:** `npm run peel-band -- --parent joins.md --band intermediate --to rank-joins.md --title "Rank joins"` (dry run); `--write` copies that band to a new file, rewrites `parent.md#id`, and appends the hash map and the matching sidebar group. One sitting per file ([how to apply](docs/meta/learning-levels.md#how-to-apply)). Then `npm run cheat-sheet-blocks -- --write` and `npm run build`. AGENTS.md stays a routing table of topic nouns: edit the parent’s Owns line when a job leaves; add a row only for a new topic.
- **Respelling roots:** after `npm run convert-word -- --lexicon --only …` (or `--all` for the whole lexicon), run **`npm run retie-docs`** (dry run), then **`npm run retie-docs -- --write`**, then `npm run build` and `npm test`, and read the review list and warnings. When the dry run prints `language name 👓 old → new`, run **`npm run rename-language`** (dry run), then `-- --write`, in the same change. Never bulk-replace old roots across Markdown. Code never spells a root as a string literal, use [`src/closed-roots.ts`](src/closed-roots.ts). `--lexicon` requires `--only LITERAL` (matching rows only) or `--all`. Writing rules that keep pages retie-safe: [retie-safe writing](docs/meta/grammar-docs.md#retie-safe-writing).
- **After editing Markdown** under `docs/` (or `AGENTS.md` / `TODO.md`), run **`npm run build`**: no separate lint command. Skip it when the only changes are under `docs/meta/` or `docs/proposals/`. The build checks emphasis syntax, forward links in stage pages (`npm run lint:forward-links`), Vue-illegal tags, proposal links, that Agebon in code spans parses and uses lexicon roots, morph glosses, checkpoint word banks and their core vocabulary, the terminology page, and dead URLs, details in [marking Agebon](docs/meta/grammar-docs.md#marking-agebon). Write `*a* / *b*`, not `*a*/*b*`; in bold text put forms in backticks only.
- **Commits made by AI:** always append **`[skip-cd]`** to the commit message so Amplify doesn't start a build.
- **Bash permission classifier errors:** if a Bash call fails because the auto-mode classifier gave no verdict, retry the same call up to 5 times with exponential backoff (for example 1, 5, 25, 125, 625 seconds). If it still fails, stop working and tell the user. Do not switch to workarounds.

# Evaluating ideas

Dev effort is not a con against an idea. Weigh options by their effect on the end user, unless the implementation is risky (a new library, or something an AI might implement incorrectly). For example, needing to update many cross-references is not a downside of a new language feature. Legacy learners are also not a concern - we have no current speakers, so learners needing to unlearn a changed grammar is not a downside.

A second way to say the same thing is not a downside either. If a form is intuitive and would arise naturally, allow it; ban an intuitive form only for a stated cost ([design-decisions](docs/meta/design-decisions.md)).

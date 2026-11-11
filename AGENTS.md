# Ageben

Constructed language and tooling that encode psychologically useful distinctions into vocabulary and grammar (compassion / rationality / empowerment themes: gratitude, bias awareness, authentic choice). Unambiguous syntax supports computational tools; phonology aims to be easy to sing.

Always call the language **Ageben** (Clarity is a legacy name). Do not restate the English gloss from [`docs/grammar/introduction.md`](docs/grammar/introduction.md). The name is tied to the glasses root, [language-name.md](docs/meta/language-name.md). Grammar and in-scope editor blurbs show **only the current language**: current published spellings and current English names. No former-name notes or dual spellings, [present the current language only](docs/meta/grammar-docs.md#present-the-current-language-only).

**This file routes; it does not teach.** Never trust a form or meaning from memory or from this file, open the owning doc. What belongs here: [AGENTS.md policy](docs/meta/agents-md.md).

## Sources of truth

Each row names what the file owns. The file is the authority; this table is only a pointer.

### Grammar (learner-facing, `docs/grammar/`)

Stage pages sit in `beginner/`, `intermediate/`, or `advanced/` under `docs/grammar/`; locate one with `ls docs/grammar/*/NAME.md`. Within a band they are grouped into units, in `docs/grammar/.vitepress/lib/reading-order.ts`.

| Source | Owns |
|--------|------|
| `purpose.md` | Psychological purpose, limits, learner tour. Site home. |
| `introduction.md` | Name, design goals, learning path. |
| `clause.md` | **Source of truth** for one-clause grammar: role letters, default order, hosting; adjectives before the noun (`left-bound-adjectives.md`); leaving out who acts (`no-subject.md`); degree words (`very-and-slightly.md`); chaining (`longer-chains.md`). Other docs own their subsystems. |
| `phonology.md` | Phonology, rhythm and stress, thinking sounds; phonotactics, syllabic `l` (`phonotactics.md`); letter names (`letter-names.md`); voicing: singability, vowel pitch, speech edges, audible start (`singability.md`). |
| `word-endings.md` | Word endings, citation forms, greetings; proper names and titled phrases (`proper-names.md`); place-name roots (`place-name-roots.md`). |
| `pronouns.md` | Whole-stem resume, role pointers, special, and generic pronouns; resume, further: one sense, cross-role recast (`resume-sense.md`); tag pronouns (`tag-pronouns.md`). |
| `topic.md` | Discourse topic, topic pronoun. |
| `plurality.md` | Plural, associative, address sets, clusivity; groups, further: collectives, each other, addressing several people (`collectives.md`). |
| `questions.md` | Yes/no and fill questions, polar particles; polar inventory, tags (`polar-inventory.md`). |
| `fill-ask-roles.md` | Fill-ask roles: arity, blank in a dependent; what kind / when / where / whose / how / why (`fill-ask-jobs.md`). |
| `speech-moves.md` | Turns, vocatives, interjections, continue, speech acts, the reusable vowel series; firm and soft (`firm-soft.md`); turn words, further: doubled and stacked acts, commands to be ADJ, describing a call, rhetorical questions, quizzes (`more-turn-words.md`); speech manner (`speech-manner.md`); tone marks, emphasis and clefts (`tone-marks.md`). |
| `dependents.md` | Next-sentence grammar: subordinators; continue overview, sentence linkers, what carries past a period (`sentence-linkers.md`); hinges on a degree or a noun (`more-hinges.md`); stand-in vowels, pointing back (`stand-in-vowels.md`); lexicalized stand-ins (`stand-in-roles.md`); nested dependents (`nested-dependents.md`). |
| `relations.md` | Hosted relation catalog: likeness, exchange, proxy; of-relations (`of-relations.md`); exactly like (`exactly-like.md`); locative relations (`locative-relations.md`); whose, social ties (`social-ties.md`); as-of (`as-of.md`); same-role words: before, after, while, like (`same-role-words.md`). |
| `hooks.md` | Prefix-less hooks: in-clause, discourse glue, extra-noun; stacked extra-noun (`extra-noun-hooks.md`); in-clause hooks: parallel chains, hook detail, point back (`in-clause-hooks.md`); ranges, including ranges of numbers (`ranges.md`); abstract landmarks (`abstract-landmarks.md`); hook compounds, prefixes (`hook-compounds.md`); hooked joins (`hooked-joins.md`). |
| `discourse-hooks.md` | Discourse endings at the front (in fact, anyway), stacked discourse, discourse placements; here, there, and somewhere (`here-there.md`). |
| `restrictors.md` | `/h/` / `/w/` restrictors, habitual, again; more occasions (`more-occasions.md`). |
| `joins.md` | Phrase and clause joins, fences, set vs rank; what a list word reaches: SHARED, respectively, fence nesting (`list-structure.md`); rank joins, invert, route (`rank-joins.md`); and/or, whole-list denial, set inventories (`set-joins.md`); a whole kind: universals, domains, bound tags (`universals-domains.md`); join limits, role grid (`join-limits.md`); named phrases (`named-phrases.md`). |
| `verb-and-stance-joins.md` | Joins on verbs and stances: verb-phrase, clause and stance joins; list verbs (`list-verbs.md`); join-relations (`join-relations.md`); clause sequence (`clause-sequence.md`). |
| `comparatives.md` | Comparatives, superlatives, equatives; ranking on any scale (`comparative-arity.md`); vague amounts (`vague-amounts.md`); stance bars (`stance-bars.md`). |
| `predication.md` | Classification, identity, lone object; how far a label reaches (`label-seams.md`); how a label holds: packaging, IDENTITY endings (`label-reach.md`). |
| `causation.md` | if, only if, iff (condition hinges); fault (`fault.md`); because (`because-and-iff.md`); CAUSE, make (`cause.md`). |
| `sakes.md` | Sakes, met / unmet; ought for a sake (`ought-for-a-sake.md`); doing it for a sake: motive, attachment, whose stake (`for-a-sake.md`); bars: than planned, than usual, enough and too (`bars.md`). |
| `feelings.md` | Feelings, speaker attitude; permission, consent (`permission-consent.md`); thanks and sorry (`thanks-and-sorry.md`). |
| `intention.md` | Plan; try / fallback (`try.md`); want, decision (`want-and-decide.md`); ability / incapability (`can-and-cant.md`). |
| `knowing.md` | MAY, live / memory; evidentiality (`evidentiality.md`); holder (`holder.md`); mood on one adjective (`universality.md`); dated channel (`dated-channel.md`); usually vs must (`usually-vs-must.md`). |
| `residue-and-former.md` | Residue / former; contrary to: plan, say words, channels, whose (`contrary-to.md`); mirative (`mirative.md`); notional (`notional.md`); already / still / not yet / no longer (`already-still-yet.md`). |
| `roles.md` | Role compounds; viewpoint laterals, landmark facing, gravity (`viewpoint.md`); role parts (`role-parts.md`). |
| `compounds.md` | Mid-word `x`, dictionary compounds; compound families (`compound-families.md`); conversation length (`conversation-length.md`); root tails, tail suffixes (`root-tails.md`). |
| `spans.md` | Span fences, asides; spans as words: mention, span nouns, `gl` spans, one of a title (`spans-as-words.md`); inside a quote: act words, topics (`quote-contents.md`); scope islands (`scope-islands.md`); editorial close, nesting (`span-nesting.md`). |
| `numbers.md` | Numerals; word shape, markers, endings, writing, letter codes (`number-markers.md`); number as verb, adverb, interjection, discourse, degree, stance (`number-roles.md`); end-relative, stacked markers (`stacked-markers.md`). |
| `digitless-exponents.md` | Digitless forms, exponents, bare OoM, ambient magnitude, group separator; special values, just and soon, hyperbole, number as stance (`special-values.md`). |
| `measures-and-percent.md` | Measure phrases, percent, fractions; digit strings and time (`digit-strings.md`); initials (`initials.md`); rays, named ranges (`open-ranges.md`); ordinal generations, kin (`generations.md`). |
| `numeric-derivation.md` | Numeric prefixes: number + `x` + root (advanced only). |
| `review.md` | **Level reviews**: one `### Practice` per band (`review.md`, `review-intermediate.md`, `review-advanced.md`), last in each sidebar group; adds no forms and no words, [level reviews](docs/meta/translation-exercises.md#level-reviews). |
| `english.md` + `say-*.md` | **Saying it in Ageben** recipe track, keyed by English job. Outside stage order; stage pages never link to it, [recipe track](docs/meta/grammar-docs.md#recipe-track). New gap resolutions that add no form go here. |
| `claritish/` | **Claritish** on-ramp: closed Ageben words dropped into English, an intro page, ten lessons, a bonus tone-marks lesson, a closing plug, a printable cheat sheet, and a journal editor. Adds no forms; never links into the grammar except the closing page, [Claritish track](docs/meta/grammar-docs.md#claritish-track). |
| `cheat-sheets/` | **Cheat Sheets** sidebar: one printable lookup page per subsystem, plus letter meanings (vowels, consonants) and Ageben → English; each row links to its owning section. Tables between `<!-- generated -->` markers come from the data via `npm run cheat-sheet-blocks -- --write`; never edit them by hand. Adds no forms, [cheat sheets](docs/meta/grammar-docs.md#cheat-sheets). |
| `terminology.md` | English names for grammatical features. Teaching pages do not link into it except [How to learn](docs/grammar/introduction.md#how-to-learn). |

### Data

| Source | Owns |
|--------|------|
| `data/lexicon-published.csv` | Published roots: each has a concrete sense and usually an emoji or pictograph seed, [seeds](docs/meta/procedures/lexicon.md#seeds-concrete-senses-and-pictographs). PoS and ending applied at use time. The `core` column is the core vocabulary order, [core vocabulary](docs/meta/procedures/lexicon.md#core-vocabulary-column). `kind` and `shape` spell a root's tail, and `size` steers a five-letter root's middle vowel, [root tails](docs/meta/procedures/lexicon.md#root-tails). |
| `data/lexicon-compounds.csv` | Dictionary compounds without mid-word `x`, with the same `core` column. |
| `data/lexicon-overlays.csv` | Closed overlay inventory and the anchor that teaches each row, [overlay kinds](docs/meta/parser-pipeline.md#overlay-kinds). New overlays attach to an existing published row. |
| `data/claritish-triggers.csv` | Journal editor cues: the English patterns each Claritish lesson's gap names, their exclusions, flow, placement, and mirror wording, [cues](docs/meta/claritish-editor-data.md#cues). |
| `data/claritish-flows.json` | Journal editor question flows and slash commands: each answer names a Claritish cheat sheet cell, never a spelling, [flows](docs/meta/claritish-editor-data.md#flows). |
| `data/claritish-words.csv` | Journal editor word lists the cues name as `@list`: the trait words a label names, the emotion words a feeling names, and the degree words between, [word lists](docs/meta/claritish-editor-data.md#word-lists). |

### Editor notes (`docs/meta/`, not published)

| Source | Owns |
|--------|------|
| `grammar-docs.md` | Content and teaching policy for grammar pages, house cast, retie-safe writing, marking Ageben, cheat sheets. |
| `doc-style.md` | Wording and voice. |
| `orientation-style.md` | Wording and voice for the two orientation pages, `purpose.md` and `introduction.md`. |
| `claritish-style.md` | Wording and voice for the Claritish track, the hyphenated English host, and what counts as a journal editor cue. |
| `claritish-editor-data.md` | File formats of the journal editor data: cue columns and pattern syntax, word lists, flow keys. |
| `glosses.md` | Morph and free gloss rules. |
| `learning-levels.md` | Beginner / intermediate / advanced gates and the cross-doc path. |
| `translation-exercises.md` | Translation checkpoint policy. |
| `design-decisions.md` | Why a form or reading is deliberately absent, and rejected alternatives. Not a restatement of grammar pages; settled readings go on grammar pages, never here. |
| `unassigned-reserved.md` | Every spelling with no reading, marked open (no natural reading yet) or closed (by a design decision). Never linked from grammar pages. |
| `feature-criteria.md` | The test a psychological feature must pass to enter the language. |
| `language-name.md` | Why the name is Ageben. |
| `site-redirects.md` | Public URL remaps. |
| `agents-md.md` | What belongs in this file. |
| `wizard-game.md` | Wizard sandbox engine (`src/game/`): what it reads from the docs, writing game content as morph gloss, and its checks. |
| `TODO.md` (root) | Planned revisions; fold into grammar docs as work proceeds. |

### Procedures (`docs/meta/procedures/`, not published)

Before doing one of these tasks, read its file in full and follow it. Each file is the authority for its steps; nothing here restates them.

| Task | Read first |
|------|------------|
| Parse an Ageben sentence, work out what one means, search examples by construction, find a form from an English cue, `grammar-check` after a parser rule change | `read-ageben.md` |
| English → Ageben suggestions, or changing and scoring the English helper | `english-helper.md` |
| Add, retitle, or respell a root or compound, move an overlay, edit `core`, number pegs | `lexicon.md`; when anything is respelled, also `retie.md` |
| Measure, peel, or move sittings and H3s | `restructure-sittings.md` |
| Write or top up a checkpoint or level review, edit the drill allowlist | `drill-generation.md` |
| Write a proposal, or orchestrate one as the session the user talks to: subagents, gates, commits, resuming. A subagent running one unit skips it; its brief is complete | `proposals.md` |

## Tooling notes

- Node ≥ 24 (runs `.ts` natively; see `.nvmrc`).
- Tests run with **`npm test`** (Node's built-in runner via `tsx --test`). `npm test` and `npm run build` end with a failure footer: each issue with `file:line`, the assertion or the fix, and the rule's `docs/meta/` anchor. Read it instead of rerunning; full output is in `tmp/test-last.log` / `tmp/build-last.log` (`BUILD_VERBOSE=1` prints it all). Vitest is intentionally **not** installed, never run bare `npx vitest`. Use `npx --no-install <tool>` to check for a CLI; avoid bare `npx <tool>` for tools this repo does not depend on.
- Language design work goes through `introduction.md`, `purpose.md`, `clause.md` and the linked grammar docs (and `TODO.md` until absorbed). Do **not** treat any parser implementation as design authority until it matches the docs.
- **Parser changes ship with grammar changes:** a change to what the parser accepts, rejects, or how it reads a form lands in the same change as the grammar-doc edit that teaches it (the owning page, plus `unassigned-reserved.md` for a newly rejected spelling and `design-decisions.md` when the rejection has a reason beyond *no reading yet*). Never change parser behavior without the matching grammar edit.
- **Orthography invariants** ([phonology](/phonology)): `th` is one letter written with two characters, and there is no `t`. No hyphen after the PoS letter. Native text is unicase lowercase; capitals only inside foreign / opaque payloads ([spans](/spans)). Named reference is marked by ending, not case. Prefer published lexicon roots when the gloss matches.
- **Example sentences**: do not add a leading assertion turn to every example when it is omissible, see [clause.md](/clause) and [speech-moves.md](/speech-moves).
- **Learner name slot:** **`SELF`** is the reader's own name, only where the name is the form (greeting, conversation-length bid, self-introduction); plain *I* is not the slot: [first person](docs/meta/grammar-docs.md#house-cast). The site fills it ([`src/learner-name.ts`](src/learner-name.ts)).
- **Never by hand:** root spellings come from `npm run convert-word`, and a respelling goes through `retie-docs`, never a bulk replace ([lexicon editing](docs/meta/procedures/lexicon.md#respelling-a-row)). Work out what an Ageben sentence means with `node scripts/parse.mjs --llm-prompt`, not by reading grammar pages ([reading Ageben](docs/meta/procedures/read-ageben.md#translating)).
- **Quiet verification:** `npm run verify -- --baseline` saves the current build and test errors to `tmp/verify-baseline.json`; `npm run verify` prints PASS/FAIL, only errors new since the baseline, and a resolved count. `--allow-generate` counts checkpoint errors on allowlist **generate** rows as expected; `--fast` skips tests. Full log in `tmp/verify-last.log`.
- **Proposal pages:** never link to a page under `docs/proposals/` from anywhere; name it by filename in backticks ([folder and links](docs/meta/procedures/proposals.md#folder-and-links)).
- **Moving files:** move or rename a tracked file with `git mv`, never by copying and deleting, so history follows it. Then fix every link and path literal to it in the same change.
- **After editing Markdown** under `docs/` (or `AGENTS.md` / `TODO.md`), run **`npm run build`**: no separate lint command. Skip it when the only changes are under `docs/meta/` or `docs/proposals/`. The build checks emphasis syntax, forward links in stage pages (`npm run lint:forward-links`), wording rules (`npm run lint:prose`, [what the build checks](docs/meta/doc-style.md#what-the-build-checks)), Vue-illegal tags, proposal links, that Ageben in code spans parses and uses lexicon roots, morph glosses, checkpoint word banks and their core vocabulary, the terminology page, and dead URLs, details in [marking Ageben](docs/meta/grammar-docs.md#marking-ageben). Write `*a* / *b*`, not `*a*/*b*`; in bold text put forms in backticks only.
- **Commits made by AI:** always append **`[skip-cd]`** to the commit message so Amplify doesn't start a build. Commit before and after any tool's large `--write` so its diff stands alone, [fence automated rewrites](docs/meta/procedures/proposals.md#fence-automated-rewrites).
- **Large output:** when a result says *Output too large … saved to*, grep or slice the saved file; never read it whole. Before reading a long page or proposal, list its headings (`grep -n '^#'`) and read the ranges you need. After a file you have read changes, read the change (`git diff`), not the file again. Run a repo-wide grep with `-l` or `-c` first.
- **Delegated searches:** when a search would read more than about 15k tokens and you need only its conclusion (a repo-wide rename sweep, where a rule is implemented), give it to an `Explore` subagent and keep the answer. Below that, read slices yourself. Why: [where the tokens go](docs/meta/procedures/proposals.md#where-the-tokens-go).
- **End of run:** close a task (or a subagent's report) with a line or two naming anything that looked inefficient in the run, such as a large read, a rerun, or a search that went wide. Note it and move on; do not analyze it or propose fixes.
- **Bash permission classifier errors:** if a Bash call fails because the auto-mode classifier gave no verdict, retry the same call up to 5 times with exponential backoff (for example 1, 5, 25, 125, 625 seconds). If it still fails, stop working and tell the user. Do not switch to workarounds.

# Evaluating ideas

Dev effort is not a con against an idea. Weigh options by their effect on the end user, unless the implementation is risky (a new library, or something an AI might implement incorrectly). For example, needing to update many cross-references is not a downside of a new language feature. Legacy learners are also not a concern - we have no current speakers, so learners needing to unlearn a changed grammar is not a downside.

A second way to say the same thing is not a downside either. If a form is intuitive and would arise naturally, allow it; ban an intuitive form only for a stated cost ([design-decisions](docs/meta/design-decisions.md)).

# Proposal: lexicon fill-in from the New General Service List

**Status:** PROPOSED  
**Related:** `unicode-pictograph-seeds.md`, `expressiveness-review.md`  
**Design authority:** roots stay assigned in [`data/lexicon-published.csv`](../../data/lexicon-published.csv), compounds in [`data/lexicon-compounds.csv`](../../data/lexicon-compounds.csv), overlays in [`data/lexicon-overlays.csv`](../../data/lexicon-overlays.csv). This note covers a **gap-finding pass** only. It changes no grammar.

## Motivation

The published lexicon grew from emoji seeds. That gives good coverage of things you can picture (food, animals, faces, tools). It says nothing about which words people use most. A learner who knows every root can still get stuck on everyday talk: *wait*, *maybe*, *enough*, *mean*, *guess*, *bother*, *deal*, *miss*.

Checking a list of the most common English words against what Agazan can already say gives a list of the gaps that matter most.

## Goals

1. Get a ranked list of common English words that Agazan has **no clear way to say**.
2. Sort each gap into the cheapest fix: a recipe, a compound, a new sense on an existing root, or a new root.
3. Feed new-root candidates into the normal emoji-seeded process (seed → concrete → abstract → mnemonic → `convert-word`).
4. Leave a reusable script so the pass can be rerun after later lexicon work.

## Non-goals

- Matching English word for word. Many common English words are grammar in Agazan (pronouns, tense, questions, joins, hooks, stance). Those count as **covered**, not as gaps.
- Coining roots for common words that clash with Agazan's design aims (for example, a vague *should* that hides whose need it is). Those go to a recipe that shows the Agazan way to say it.
- Changing roots that `lexicon-overlays.csv` uses.

## Data source

**NGSL 1.2** (New General Service List; Browne, Culligan, Phillips; CC BY-SA 4.0): 2809 lemmas that cover about 92% of general English, ranked by frequency in a 273M-word modern corpus. The script downloads two files from newgeneralservicelist.com into `tmp/`:

- `NGSL_12_stats.csv` — lemma and rank;
- `NGSL_12_lemmatized_for_research.csv` — each lemma's word forms (*go*: *goes*, *went*, *gone*, …), used when matching lexicon senses.

The list is already lemmatized and has no names or noise, so the pass needs no folding rules or stop lists of its own.

Synonym candidates (step 3) come from **WordNet 3.0** synsets, extracted from `WordNet-3.0.tar.gz` (wordnetcode.princeton.edu) into `tmp/WordNet-3.0/`.

## Part of speech

**Don't split rows by part of speech. Split by sense only where the triage finds a homograph.**

Agazan roots carry no part of speech. It is added when the word is used, through the PoS letter and ending. One root covers *walk* as noun and as verb, and *calm* as adjective, verb, and noun. Splitting rows by part of speech would:

- count the same gap two or three times (*help* n / *help* v) and inflate the gap list;
- make the automatic check miss hits, because `concrete` / `abstract` glosses are mostly nouns while the English cue may be a verb.

A part-of-speech split only helps when the parts of speech carry **different senses**: *mean* (intend) vs *mean* (cruel) vs *mean* (average); *kind* (sort) vs *kind* (nice); *like* (enjoy) vs *like* (similar). That is a sense problem, and part-of-speech tags don't solve it. So:

- The automatic check works on untagged lemmas, and matches `english_by_pos` entries (`v:tell`, `v:hear`) across all parts of speech.
- The triage splits a lemma into senses when a reviewer sees two unrelated meanings. Each sense is triaged separately and keeps the lemma's rank.
- Where one sense already has a root and another doesn't, the gap is the missing sense, not the word.

## Method

Steps 1–3 are mechanical, and an agent can run them without review. Step 4 needs editor judgment and stops for review after each batch. Step 5 applies only rows the editor approved.

### 1. Coverage check

`npx tsx scripts/frequency-coverage.ts` tags each NGSL lemma. The first match wins:

| Check | Source | Tag |
|-------|--------|-----|
| Concrete or abstract sense matches the lemma or one of its forms | `lexicon-published.csv` `concrete`, `abstract`, `english_by_pos` | `root` |
| Compound sense | `lexicon-compounds.csv` `concrete`, `abstract` | `compound` |
| Overlay gloss | `lexicon-overlays.csv` | `overlay` |
| Function word find-english drops | find-english stop list | `stop` |
| Gloss or table row that is exactly the word | `docs/grammar/` via the find-english index | `grammar` |
| Reviewed in step 2 | `ngsl-lexicon-mentions.csv` | `covered` or `gap` |
| Gloss or table row that contains the word among other English | find-english index | `mention` |
| Only inside example or practice English | same | `example` |
| Nothing | — | `gap` |

Sense cells must match a whole sense, not a substring, so *car* does not hit *care*.

### 2. Settle `mention` rows

A `mention` means some table row contains the word, but that row may be teaching something else. An agent reads the find-english hits for each `mention` row and records one of:

- `covered` — a section teaches the word's everyday sense (give the section);
- `gap` — the row only contains it, or teaches only one sense of a word with several (*right*, *fair*, *own*).

The decisions go in `docs/proposals/ngsl-lexicon-mentions.csv` (`lemma, verdict, section, note`). The script reads that file, so a rerun keeps them.

### 3. Synonym candidates

`npx tsx scripts/frequency-coverage.ts --candidates` (about 30 s) writes the triage file, with one row per `gap` or `example` lemma. The `candidates` column lists published roots whose concrete or abstract sense shares a WordNet synset with the lemma. These are **candidates**, not decisions: WordNet includes rare senses (*know* ↔ *bed*), so many candidates will be rejected. A rerun refreshes only the candidates column and keeps the triage decisions already written.

### 3b. Grammar leads (pre-filter)

The same `--candidates` run fills a `grammar_leads` column. It runs find-english on the lemma, its NGSL forms, and its WordNet synonyms, and keeps up to four gloss or table rows that contain the cue (*really* → `welavam` via *very*). These are pointers for the translation test, not verdicts. A row with neither root candidates nor grammar leads is very likely a real lexical gap.

The `stage` column says what happens next: `translate` (a candidate or lead exists, so run the translation test) or `triage` (neither, so go straight to a fix). A translation test moves a row to `triage` or marks it covered. A rerun keeps any stage already written.

### 4. Triage in batches

Work top rank first, about 200 gaps per batch. Each gap gets one fix:

| Fix | When | Where it lands |
|-----|------|----------------|
| **Grammar** | Agazan says it with a construction, not a word | Recipe in `say-*.md` if no page already teaches that English cue |
| **Covered** | An earlier editor ruling already settled it (see [Earlier rulings](#earlier-rulings)) | Nothing new; add the ruling's reading to the recipe track if `find-english` misses it |
| **Synonym** | An existing root already means it; the gloss just used another English word | Add the word to that root's `english_aliases` (search only; not `english_by_pos`, which is role English for morph glosses) |
| **Compound** | Two published roots combine clearly | `lexicon-compounds.csv` |
| **New abstract sense** | A published root's picture fits, and its `abstract` cell is empty | Fill that row's `abstract` and `mnemonic` |
| **New root** | None of the above, and a fitting emoji exists | New emoji-seeded row (propose the emoji) |
| **Human review** | Needs a new root, but no emoji is a good seed (*deal*, *matter*, *stuff*) | Flag it. Don't force a loose seed |
| **Decline** | Clashes with a design aim | Log in [`design-decisions.md`](../meta/design-decisions.md) with the recipe that replaces it |

A lemma with two unrelated senses (*mean*, *kind*, *like*) is split into one row per sense (see [Part of speech](#part-of-speech)). The agent stops after each batch for editor review. Nothing lands in the lexicon or grammar docs during triage.

### 5. Apply approved rows

Recipes, `english_aliases` entries, compounds, and new abstract senses are edited directly. New roots follow the existing path: emoji seed, `concrete` / `abstract` / `mnemonic`, `npm run convert-word -- --lexicon --only <concrete>`, then `npm run lint:lexicon`, `npm run build`, and `npm test`. New roots take normal placement. NGSL rank does **not** earn a two-syllable slot.

## Output

- `scripts/frequency-coverage.ts` — the coverage check (`--gaps-only`, `--json`, `--candidates`).
- `tmp/frequency-coverage.csv` — generated, not committed: `rank, lemma, per_million, tag, hit`.
- `docs/proposals/ngsl-lexicon-mentions.csv` — step 2 verdicts.
- `docs/proposals/ngsl-lexicon-triage.csv` — one row per gap lemma: `rank, lemma, sense, stage, candidates, grammar_leads, fix, proposal, note`. Steps 3–4 fill it. Senses are described in `proposal` instead of split into rows, because a search alias does not need a sense.

## Settled

- **Word list:** NGSL 1.2 only, all 2809 lemmas.
- **Part of speech:** untagged lemmas, with a sense split during triage.
- **Two-syllable slots:** rank does not earn a shorter root. New roots are placed as usual.
- **No good emoji:** flagged for human review, not seeded loosely.
- **Synonyms are search aliases:** a new `english_aliases` column in `lexicon-published.csv` (search-only, no part of speech). `english_by_pos` stays role English. Sense splits are not needed for aliases.
- **Compounds have no emoji column.** `lexicon-compounds.csv` is `stem, left, join, right, concrete, abstract, mnemonic`.
- **Imperial units are allowed.** Units are abstract senses on an existing root (*mile* on `ubuda`).
- **Gendered kin pairs are allowed.**
- **Evaluatives are Declined as bare roots.** *good*, *bad*, *nice*, *great*, *wonderful*, *excellent*, *quality* and their near neighbours route to met / unmet sakes, ranks against a bar, or a specific content root.
- **Flashcards:** out of scope.

## Coverage results (2026-09-30, after steps 1–3)

| Tag | Count |
|-----|-------|
| `root` | 602 |
| `covered` (mention reviewed) | 133 |
| `grammar` | 85 |
| `overlay` | 47 |
| `compound` | 12 |
| `stop` | 5 |
| `example` | 41 |
| `gap` (includes 469 reviewed mentions) | 1884 |

The triage file has 1925 rows (gap + example):

| Bucket | Rows | Next step |
|--------|------|-----------|
| Root candidate and/or grammar lead | 1331 | Translation test: probably partly covered in a different form |
| Neither | 594 | Very likely real lexical gaps (*government*, *student*, *food*, *sell*, *war*, *happy*, *explain*) — straight to triage |

A few "neither" rows are grammar the leads miss (reflexives such as *himself*, *themselves*). Triage has not started.

## Triage results (2026-09-30, after the full pass)

All 1925 rows have a `fix`. First 789 rows by hand, the rest by six parallel passes from a written rubric, then two review passes.

| Fix | Rows |
|-----|------|
| Synonym | 1090 |
| Grammar | 589 |
| Compound | 141 |
| Covered | 68 |
| New abstract sense | 18 |
| Decline | 13 |
| New root | 5 |
| Human review | 1 |

### Earlier rulings

The coverage check only reads `docs/grammar/`. Editor notes in `docs/meta/` (`syntax-test-results.md`, `register-results.md`) had already settled many of these words: *wide* (abstract width on `agode`), *narrow* and *short* (the comparative *less*), *village* (`ahede` locality), *father* (kin number plus *male*), *table* (`exagude`), *river* (`owode`), *branch* / *root* / *valley* (`x` compounds), *concert* and *hall* (scene compounds), *soldier* (*guard*), *give* (*present*), and about fifty more. Those rows are now `Covered` with the ruling quoted. The triage had proposed conflicting readings for them before this was noticed.

### Applied

- `lexicon-published.csv` has the new `english_aliases` column (empty), loaded and indexed by `src/lexicon-search.ts`, with tests.
- `lexicon-compounds.csv` lost its `emoji` column (code, data, tests).
- `node scripts/parse.mjs --check-lexicon` lists words the lexicon does not know. The earlier "parses" checks on proposed compound stems proved nothing, because the parser reads any well-formed root.
- `validateCompoundRows` now also rejects a missing mnemonic, a repeated root, and a gloss that duplicates a published sense or another compound.
- New roots: 🆕 `unuhe` (novelty), 🏘️ `ahezo` (town), 🤏 `eboho` (inch), 🏚️ `ahezu` (ruin).
- New abstract senses with mnemonics: life, body, mile, softness, sexuality, fruit, circle, metal, swing, neck, toy, burial, clothing, tail, skin, stomach, iron, plastic.
- *deep* was dropped as a new root: `anaya` (🧅) already has the abstract *depth*, and the new row failed `lint:lexicon`.

### Aliases populated (2026-09-30)

- `english_aliases` now holds 1093 cues on 496 published rows, taken from 1087 of the 1090 Synonym rows. A first pass wrote the 880 rows whose proposal named one root. The other 207 were picked by hand: where a proposal offered two roots the first-listed or most general sense won (*believe* → `egeho` trust, *song* → `uduha`, *bag* → `ahaba`, *college* / *university* → `omobo`). Split rows took the sense an English speaker searching that word most likely means (*take* → `alaga` carry, *close* → `alage` shut, *beat* → `odove` win). *steel* → `ahave` (iron) and *ally* → `emeze` (companionship). `lint:lexicon`, `npm test` and `npm run build` pass. The triage note on each applied row starts `Applied: english_aliases on ROOT`.
- **Held, 3 rows:** *set* (no single root), *far* (a distance-hook recipe) and *bias* (left to bias-awareness content). Their triage notes start `Held:`.
- Aliases are for search, so a wrong pick costs a stray search hit, not a wrong meaning. Other senses of a split lemma still need their own cue on the right root; add them when a search shows the gap.

### Compounds added (2026-09-30)

- `lexicon-compounds.csv` gained 125 rows (36 → 160 lines). Each row is left + join + right. The join is **-l** when the left piece is its everyday sense and **-m** when it is the abstract sense (35 rows, such as `agazamezebe` *explanation*). Mnemonics follow one shape, "LEFT specifying RIGHT is …". `npm run check-compounds` (factorization, duplicate stems and glosses, stems that are already roots), `lint:lexicon`, `npm test` and `npm run build` pass.
- **Merged, 9 lemmas:** lemmas that shared a stem took one row (*invest* with *investment*, *negotiate* with *negotiation*, *evolve*, *summarize*, *jail* with *prison*, *troop* with *army*, *democratic*, *presidential* as *president*). *carbon* became the abstract sense of *coal*.
- **Not applied, 8 lemmas:** *mom*, *dad*, *husband*, *visitor*, *guest* and *historic* are settled by earlier rulings (*mother*, *father*, *wife*, *guests*, *history*). *racial* stays with the `ezo` / `avaha` cues. *politician* needs a role compound on *government*, since its left side is itself a compound.
- `src/parse/lexicon-check.test.ts` used *government* (`agulaguga`) as its example of an unlisted compound. It is listed now, so the test uses `agulahazal` (*country house*) instead.
- The weak ones flagged earlier (*god*, *leather*, *paragraph*, *grammar*, *veteran*, *alcohol*, *philosophy*, *legislation*, *cup*) are in. Templated mnemonics are serviceable, but give those a second look.

### Reconciled rulings (2026-09-30)

- **Other editor notes checked.** `translation-exercises.md`, `drill-generation.md`, `glosses.md`, `grammar-docs.md`, `doc-style.md`, `design-decisions.md` and `cool-features.md` only use the triage words as editor English, so they hold no rulings. `syntax-test-corpus.md` does. Its per-sentence notes settled *need* (`ebo` necessity, `vebom`), *seem* (holder seam), *travel* (`eheba` voyage), *happy* (emotion compose), *prepare* and *ready* (`abu`, `vabum`), *mother* (`eveva` before the kin number), *warm* (*quite hot*), *opposite* (`honovathohan`) and *indeed* (`!` tone mark). Those 10 rows are `Covered`. *long* (`adaha` duration, `hadaham`) and *ever* (`huham … har`) keep their fix but cite the ruling. Stale *wide* / *deep* new-root leftovers in *widely*, *deeply* and *extensive* are corrected.
- **The script needs no change.** Decisions already in the triage file survive a `--candidates` rerun, so settled words are not reopened. Only a fresh triage file would lose them.
- **Decided *give*.** The editor kept 🎁 *present* (`ebezo`). No 🫴 root was ever added, so nothing is undone. *get*, *receive*, *provide*, *supply*, *contribute*, *earn*, *income* and *borrow* read the `o` role of *present*.

## Remaining work

1. **Write the grammar cues** (589 rows). *Batch 1 done (11 rows):* the nine targeted cues plus *somebody* and *furthermore*, in `english.md` (`#everyday-words`: place / path, *some-* / *any-*, greetings) and `say-reasons.md#english-cues`; `till` also in `say-amounts.md#pole-from-now`. Each row's triage note starts `Applied:`. *Batch 2 done (35 rows):* place, path and motion words in `english.md` (`#place-path`, `#motion`): 24 applied, 11 logged `Gap:` (*external*, *beyond*, *throughout*, *apart*, *abroad*, *overseas*, *middle*, *central*, *bottom*, *lean*, *parallel*). *Batch 3 done (104 rows):* `say-people-places.md` gained `#agent-nouns` (34 verified doer stems), `#kin-words`, `#buy-sell`, `#other-different` and `#reflexive`; *thing* / *stuff* went into `english.md#some-any`. A role compound on a compound root (*reader*, *driver*, *poet*, *historian*, *investor*, *user*) fails to parse after `x`, so those are `Gap:`. Several triage stems named roots that do not exist (`arezo`, `eboga` spelled `ebogo`, `ebuda` for artist), so each stem was rebuilt from the lexicon. *Batch 4 done (94 rows):* `say-amounts.md` gained `#degree-manner` (`#degree-words`, `#manner-words`, `#frequency-words`, `#quantity-words`). *Quickly* is a `Gap:` because `avazo` has no abstract sense (editor: add *speed*). *Batch 5 done (47 rows):* `say-tense.md` gained `#time-words` and `#ability-words`. A triage note that read `thuhul` as *continue* was wrong (it is *want, lasting*); *continue* is `hagem`. *Gap fixes applied:* 26 gaps closed. Role compounds now take a listed compound stem (`src/parse/classify.ts`, roles.md; *reader*, *driver*, *poet*, *investor*, *employee*, *employer*); `avazo` gained abstract *speed*; `ahadu` gained `m.w:completely` and `wahadum` joined the stock degree words (clause.md); `brubum` (*recently*) is taught in knowing.md. *Tonight* and *forever* use composed forms, not the first suggestion (night has no unit abstract). Remaining gaps are the locative overlays, roles with no root, and Decline candidates. Next batches go one target page at a time. into `english.md` and the `say-*.md` pages (recipe track only; stage pages never link to it). Nine cues had no `find-english` hit and now have targets: *whereas*, *moreover*, *nevertheless*, *onto* (`aol`), *till*, *anybody*, *somehow* (`homem bor`), *via*, *hi*. Doer-noun stems need checking against `roles.md` (some vowels fail after `x`, for example `zaxovel`).
2. **Open items.** *corner* needs a new root (register ruling L-02) and an emoji. *sex* is a Human review: the topic stays, gendered pairs are allowed, decide whether a neutral root is also wanted. Units: *foot* (`uvuda`), *pound* and other imperial units still need abstract senses.
3. **Log the Decline rule** in [`design-decisions.md`](../meta/design-decisions.md): bare evaluatives (*good*, *bad*, *nice*, *great*, *wonderful*, *excellent*, *quality*, *lovely*, *terrible*, *awful*, *horrible*, *fantastic*, *brilliant*) are not roots; the routes are listed above.
4. **Run `npm run lint:lexicon`, `npm run build` and `npm test`** after each batch of applied rows.


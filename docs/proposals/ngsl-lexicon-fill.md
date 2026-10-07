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
| Search alias (`english_aliases` synonym) | `lexicon-published.csv` `english_aliases` | `alias` |
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
- *deep* was first dropped as a new root: `anaya` (🧅) already has the abstract *depth*, and the proposed row failed `lint:lexicon` on the label. It was later added under a different label (*deep*, on ⛏️ `ebega`; see batch 22 below).

### Aliases populated (2026-09-30)

- `english_aliases` now holds 1093 cues on 496 published rows, taken from 1087 of the 1090 Synonym rows. A first pass wrote the 880 rows whose proposal named one root. The other 207 were picked by hand: where a proposal offered two roots the first-listed or most general sense won (*believe* → `egeho` trust, *song* → `uduha`, *bag* → `ahaba`, *college* / *university* → `omobo`). Split rows took the sense an English speaker searching that word most likely means (*take* → `alaga` carry, *close* → `alage` shut, *beat* → `odove` win). *steel* → `ahave` (iron) and *ally* → `emeze` (companionship). `lint:lexicon`, `npm test` and `npm run build` pass. The triage note on each applied row starts `Applied: english_aliases on ROOT`.
- **Held, 3 rows:** *set* (no single root), *far* (later applied: `azedo` 🛰️ gained the abstract sense distance, with `far` / `distant` / `remote` aliases) and *bias* (left to bias-awareness content). *Set* and *bias* were applied in batch 24.
- Aliases are for search, so a wrong pick costs a stray search hit, not a wrong meaning. Other senses of a split lemma still need their own cue on the right root; add them when a search shows the gap.

### Compounds added (2026-09-30)

- `lexicon-compounds.csv` gained 125 rows (36 → 160 lines). Each row is left + join + right. The join is **-l** when the left piece is its everyday sense and **-m** when it is the abstract sense (35 rows, such as `agazamezebe` *explanation*). Mnemonics follow one shape, "LEFT specifying RIGHT is …". `npm run check-compounds` (factorization, duplicate stems and glosses, stems that are already roots), `lint:lexicon`, `npm test` and `npm run build` pass.
- **Merged, 9 lemmas:** lemmas that shared a stem took one row (*invest* with *investment*, *negotiate* with *negotiation*, *evolve*, *summarize*, *jail* with *prison*, *troop* with *army*, *democratic*, *presidential* as *president*). *carbon* became the abstract sense of *coal*.
- **Not applied, 8 lemmas:** *mom*, *dad*, *husband*, *visitor*, *guest* and *historic* are settled by earlier rulings (*mother*, *father*, *wife*, *guests*, *history*). *racial* stays with the `ezo` / `avaha` cues. *politician* needs a role compound on *government*, since its left side is itself a compound.
- `src/parse/lexicon-check.test.ts` used *government* (`agulaguga`) as its example of an unlisted compound. It is listed now, so the test uses `agulahazal` (*country house*) instead.
- The weak ones flagged earlier (*god*, *leather*, *paragraph*, *grammar*, *veteran*, *alcohol*, *philosophy*, *legislation*, *cup*) are in. Templated mnemonics are serviceable, but give those a second look.

### Lexicon additions while writing cues

- `azedo` (🛰️ satellite) was an unfilled published row. It now has the abstract sense distance, the mnemonic "a satellite hangs far overhead; distance is how far away something is", and the aliases `far`, `distant`, `remote`, `faraway`. No new root was spelled, so no retie was needed. Taught as `zahen zel gazedom` in `say-amounts.md#bar-words`.
- Batches 20 and 21 added compounds `ageladahe` (*hang*) and `ebeyulerabe` (*editing*), and filled `uvuda`, `ahabo` and `adoda` (see above).
- `lexicon-compounds.csv` gained, in batch 19, `ahulohaha` (*emotion*: heart specifying ocean), `ezebelozege` (*verb*), `ezebelaneda` (*noun*), `ezebelegu` (*consultation*), `alavalehoba` (*popularity*), `ehobalagode` (*density*), `azazaladazo` (*afternoon*) and `ebegologove` (*abortion*).
- `lexicon-compounds.csv` gained `ahazamolo` (*environment*), `avagemazewe` (*efficiency*), `ahadalahaba` (*holder*) and `alavalogoda` (*favorite*).
- `lexicon-compounds.csv` gained `ahaholehego` (*lawsuit*: judge specifying problem), which gives *case* its legal sense.
- `lexicon-compounds.csv` gained `ezebelovo` (*meaning*: speech specifying thought), which closes *mean* (signify), *define* and *definition*.

- **Wide and deep, own roots (batch 22).** `oroda` (🛣️ road) gained the abstract sense *wide* and `ebega` (⛏️ pick) gained *deep*, so the adjectives and the adverbs *widely* (`horodam`) and *deeply* (`hebegam`) no longer depend on width (`agode`) or depth (`anaya`), which keep their own senses. *Narrow* and *shallow* are the same roots ranked below the bar (`zuel`).

### Reconciled rulings (2026-09-30)

- **Other editor notes checked.** `translation-exercises.md`, `drill-generation.md`, `glosses.md`, `grammar-docs.md`, `doc-style.md`, `design-decisions.md` and `cool-features.md` only use the triage words as editor English, so they hold no rulings. `syntax-test-corpus.md` does. Its per-sentence notes settled *need* (`ebo` necessity, `vebom`), *seem* (holder seam), *travel* (`eheba` voyage), *happy* (emotion compose), *prepare* and *ready* (`abu`, `vabum`), *mother* (`eveva` before the kin number), *warm* (*quite hot*), *opposite* (`honovathohan`) and *indeed* (`!` tone mark). Those 10 rows are `Covered`. *long* (`adaha` duration, `hadaham`) and *ever* (`huham … har`) keep their fix but cite the ruling. Stale *wide* / *deep* new-root leftovers in *widely*, *deeply* and *extensive* are corrected.
- **The script needs no change.** Decisions already in the triage file survive a `--candidates` rerun, so settled words are not reopened. Only a fresh triage file would lose them.
- **Decided *give*.** The editor kept 🎁 *present* (`ebezo`). No 🫴 root was ever added, so nothing is undone. *get*, *receive*, *provide*, *supply*, *contribute*, *earn*, *income* and *borrow* read the `o` role of *present*.

## Handoff: how to continue the grammar cues {#handoff}

Read this section first when asked to "proceed with the next batch". It holds everything the earlier sessions learned. The state is in the triage CSV `note` column; this section is the procedure.

### Status (after batch 22)

- Rows with `fix = Grammar`: 589. **None are left without a note** (540 Applied, 46 Partial, 3 Decline; no Gap after batch 24). A row is done when its `note` starts with `Applied:`, `Partial:` or `Gap:`. List the rest with the snippet under [Listing the open rows](#handoff-list).
- Batches 1–22 are done, all in the recipe track (`english.md` and the `say-*.md` pages). Batches 1–11 are committed (the last commit was `continued triage`); batches 12–22 are uncommitted. Commit only when the user asks.
- Sections added in batches 6–13 (batches 12–13: `say-amounts.md` `#focus-words` and `#bar-words`; `say-reasons.md` `#trait-words`; new rows in `english.md` `#place-path`, `#of`, `#noun-adjectives`, `say-tense.md` `#time-words`, and `say-reasons.md` `#english-cues`, `#stance-adverbs`, `#sake-words`, `#wrong-ugly`): `say-reasons.md` `#stance-adverbs`, `#reason-purpose-guilty`, `#cause-verbs`, `#sake-words`, `#wrong-ugly`; `say-people-places.md` `#give-get`, `#role-title-address`, `#words-about-words`; `say-amounts.md` `#group-words`; `english.md` `#noun-adjectives`; `say-questions.md` `#ask-words`, `#offer-words`, `#reply-words`. Grep the page before adding a cue: a section may already hold it.
- Baseline checks: `npm run build` ok, `npm test` 705 of 705.

### Working rules (from the user; they win over a triage row)

- **One target page per batch. Stop after each batch and wait for the user's go-ahead.** Do the work yourself; subagents only as read-only checkers.
- Read `AGENTS.md` first, then `docs/meta/grammar-docs.md` (recipe track, present-the-current-language-only, retie-safe writing), `doc-style.md`, `glosses.md`, `design-decisions.md`, `docs/meta/syntax-test-results.md`.
- **Recipe track only.** Stage pages never link to it. The only stage-page edits allowed are a one-sentence teaching edit that ships with a parser or lexicon change, or that teaches a form the recipe relies on.
- Never trust a form or meaning from memory or from the triage `proposal` text. Open the owning doc. **Do not add grammar.** If a cue cannot be said with a taught form, write `Gap:` with the reason. Bare evaluatives are not roots (see Earlier rulings); route them to a met or unmet sake, a rank against a bar, or a content root.
- Earlier rulings win over the triage row: give is `ebezo`; need = `vebom`; seem = `thevemehodon`; travel = `vehebam`; happy = emotion compose; prepare / ready = `vabum`; mother = `geveval` before the kin number; warm = quite hot; opposite = `honovathohan`; indeed = the `!` tone mark; long = `hadaham`; ever = `huham … har`.
- Examples: no leading assertion turn when omissible; the learner name slot is `SELF`; native text is unicase lowercase, `th` is one letter, there is no `t`. Italic English that is also a valid Agazan word fails the retie check (write it plain). Names in glosses are capitalised by the parser (`b-Ahodon-x`).
- Commits: only when asked. Append `[skip-cd]` and the session's Co-Authored-By line. If a Bash call fails on the permission classifier, retry up to 5 times with exponential backoff (1, 5, 25, 125, 625 s), then stop and tell the user.
- **Declines:** only bare evaluatives (design-decisions.md D-16) and the by-design cases logged in the triage notes (*effective*, *effectively*, and *latter*, D-17). The earlier list of about thirty candidates (*total*, *actual*, *real*, *modern*, *largely*, and so on) was reviewed and mostly resolved with existing roots or a Partial route; do not decline a word just because it appeared on it.
- **Out of scope (mention in the wrap-up only):** *corner* needs a new root and emoji; *sex* is a Human review; imperial units need abstract senses; locative overlays (*middle*, *central*, *bottom*, *external*, *beyond*, *throughout*, *apart*, *lean*, *parallel*) need roots and emoji; roles with no root (*colleague*, *owner*, *sponsor*, *host*, *candidate*, *buyer*, *customer*, *consumer*, *officer*, *secretary*, *minister*, *editor*, *artist*, *passenger*, *staff*, *personnel*, *shareholder*, *historian*, *user*).

### Workflow per batch

1. List the open rows for the theme (below). Run `node scripts/find-english.mjs '<phrase>'` for each cue first. If a taught section already covers it, add only a cue row, not a new recipe.
2. Open the owning doc and find the taught form. Look up every root in `data/lexicon-published.csv` (`grep -E ",root,"`): check the concrete and abstract senses and the aliases before you choose **-l** or **-m**.
3. Test each form (see [Checking a form](#handoff-check)).
4. Edit the target page. Copy the shape of the earlier sections: an H3 with an English `{#id}`, a **Needs:** line, a short lead that names the English job, the Agazan shape and the consequence, a table, one or two worked examples with a morph gloss, and **Compare with:** only when a real sibling exists. A lead that says an English word hides several jobs, then a table split by job, worked every time.
5. Run `npm run build`; on a `morph gloss mismatch` copy the parser's gloss into the doc. Then `npm test`.
6. Write the triage notes and add a "Batch N done" sentence to the Remaining work list. Use `Applied: <page>#<anchor> (<form>).`, `Partial: …` or `Gap: <reason>.`, `Decline: <reason>.`
7. Stop. Report what was added, which cues were already covered, the gaps, and any decision needed. Do not start the next batch.

### Checking a form {#handoff-check}

`node scripts/parse.mjs --check-lexicon '<sentence>'` prints `not in the lexicon: X` to stderr and exits 1 when a word is unlisted. A plain parse accepts any well-formed root, so it proves nothing about the lexicon, and **passing it does not prove a root means what you want**. Two earlier slips passed the check: `gahabal` (*handbag*, not beauty `gahabel`) and `zevebel` (*fingerprint*, not `zezebel` *speech*). Always confirm the root in the lexicon, and let the build's morph-gloss comparison catch the rest. The check cannot handle cite or mention spans (`d[…]`, `z{…}`); run those through plain `node scripts/parse.mjs` and let `npm run build` validate them.

A wrapper that prints OK / FAIL for each sentence (put it in the session scratchpad):

```bash
#!/bin/bash
cd /workspaces/clarity-language
for s in "$@"; do
  out=$(node scripts/parse.mjs --check-lexicon "$s" 2>&1 >/dev/null | grep -v '^\s*at ' | head -3)
  if [ -z "$out" ]; then echo "OK   $s"; else echo "FAIL $s :: $out" | cut -c1-300; fi
done
```

Form rules that recur:

- Citation = root + ending (`azewe` → `azewel` / `azewem`). **-l** is the concrete sense, **-m** the abstract sense. The noun letter goes in front (`zebehem`); a verb or adjective root that lacks an `english_by_pos` entry usually takes the sense you need on **-l** or **-m**, so read the row.
- Doer nouns are `z` + `ax` + root + **-l**; recipient `ox`, undergoer `ux`, scene `ex`. Role compounds accept a listed compound stem.
- Causation: `thegem` + `/b/` causer after the event (`zalahen vazagal thegem bazawan.`). Fault is `theral` / `therar` on the because pole with an **act** in `/b/`.
- Sakes: `tha` met, `thu` unmet, `tho` motive, `the` prescription; sake roots `aba` `udu` `ona` `ozu` `uho` `uge`. On a noun of yours the sake word is on `/ɡ/` (`gudutham`); on another noun it is on `/w/` before `gobom`. Emotion compose adds a locus and a motion ending (`wonathumar`).
- Noun-root adjectives: the root on `/ɡ/` (`gogodal`). Of-relations are `gabom` / `gaham` / `guwam` / `gagum`.
- Degree words are on `/w/`; manner adverbs are `h` + root + **-m**; frequency is `hual` / `huam` / `har`. Offsets with a time pole need a command, plan or channel around them. Night (`anada`) is not a unit.
- Stance words: evidentials `thodu-` `thunu-` `theru-` `thabe-` `theve-` `thema-` `thahu-` `thazo-` with **-l / -m / -r** for evidence strength; MAY `thovo-`; NOTIONAL `thove-`; speaker attitude `thevegem` / `theledem` / `thewedam`.
- Speech acts: `yal` `yam` `yol` `yom` `yel` `yem` `yul` `yum`; polar `yael` / `yaem` / `yuel` / `yuem` / `yaol` / `yaom`.

### Writing the triage notes

The file has quoted commas. Parse it with a real CSV reader, round-trip it first (read, write, compare the bytes), then rewrite only the `note` column of the rows you touched. A minimal script:

```python
import csv, io
p = 'docs/proposals/ngsl-lexicon-triage.csv'
raw = open(p, newline='').read()
rd = list(csv.reader(io.StringIO(raw)))
assert io.StringIO() is not None
hdr = rd[0]; ni = hdr.index('note'); li = hdr.index('lemma'); fi = hdr.index('fix')
notes = {'lemma': 'Applied: page.md#anchor (form).'}
for r in rd[1:]:
    if r[li] in notes and r[fi] == 'Grammar':
        r[ni] = notes[r[li]]
out = io.StringIO(); csv.writer(out, lineterminator='\n').writerows(rd)
open(p, 'w', newline='').write(out.getvalue())
```

### Listing the open rows {#handoff-list}

```python
import csv
rows = list(csv.DictReader(open('docs/proposals/ngsl-lexicon-triage.csv')))
open_rows = [r for r in rows if r['fix'] == 'Grammar'
             and not r['note'].startswith(('Applied:', 'Partial:', 'Gap:', 'Decline:'))]
print(len(open_rows))
for r in open_rows:
    print(r['rank'], r['lemma'], '|', r['proposal'], '|', r['note'])
```

### Remaining themes (none open)

Themes 1–4 are done. Theme 3 (verbs) went into `say-reasons.md` (`#cause-verbs`, `#mind-verbs`) and `say-people-places.md` (`#relating-verbs`); theme 4 (abstract nouns) into `say-reasons.md#reason-nouns` and `say-people-places.md#thing-nouns`. The rows once logged `Gap:` only because they were not written were done in `say-people-places.md#sense-nouns` (batch 16), and the three that stayed (*environment*, *efficiency*, *holder*) were closed with new compounds. Batches 17 and 18 did the role nouns (`#agent-nouns`) and the adjective, adverb and verb gaps. Batch 19 retried the gaps with compounds, hooks and stance words, and batch 21 retried the last ones. Two rows were `Gap:` again (*sentence* → *punishment*, *particular* → *picky*) until batch 24 closed them with the *penalty* compound and a bar word. *Final* and *request* got aliases on `ogove` and `ebeya`. No other row is a plain `Gap:`: *latter* is a Decline by design (D-17, resume -r). Batch 23 closed the act nouns (`say-people-places.md#act-nouns`) and 20 leftover senses whose synonym is already in the lexicon (`#leftover-senses`). The open `Partial:` rows each give the sense that is covered and the sense that is not.

## Remaining work

1. **Write the grammar cues** (589 rows). *Batch 1 done (11 rows):* the nine targeted cues plus *somebody* and *furthermore*, in `english.md` (`#everyday-words`: place / path, *some-* / *any-*, greetings) and `say-reasons.md#english-cues`; `till` also in `say-amounts.md#pole-from-now`. Each row's triage note starts `Applied:`. *Batch 2 done (35 rows):* place, path and motion words in `english.md` (`#place-path`, `#motion`): 24 applied, 11 logged `Gap:` (*external*, *beyond*, *throughout*, *apart*, *abroad*, *overseas*, *middle*, *central*, *bottom*, *lean*, *parallel*). *Batch 3 done (104 rows):* `say-people-places.md` gained `#agent-nouns` (34 verified doer stems), `#kin-words`, `#buy-sell`, `#other-different` and `#reflexive`; *thing* / *stuff* went into `english.md#some-any`. A role compound on a compound root (*reader*, *driver*, *poet*, *historian*, *investor*, *user*) fails to parse after `x`, so those are `Gap:`. Several triage stems named roots that do not exist (`arezo`, `eboga` spelled `ebogo`, `ebuda` for artist), so each stem was rebuilt from the lexicon. *Batch 4 done (94 rows):* `say-amounts.md` gained `#degree-manner` (`#degree-words`, `#manner-words`, `#frequency-words`, `#quantity-words`). *Quickly* is a `Gap:` because `avazo` has no abstract sense (editor: add *speed*). *Batch 5 done (47 rows):* `say-tense.md` gained `#time-words` and `#ability-words`. A triage note that read `thuhul` as *continue* was wrong (it is *want, lasting*); *continue* is `hagem`. *Gap fixes applied:* 26 gaps closed. Role compounds now take a listed compound stem (`src/parse/classify.ts`, roles.md; *reader*, *driver*, *poet*, *investor*, *employee*, *employer*); `avazo` gained abstract *speed*; `ahadu` gained `m.w:completely` and `wahadum` joined the stock degree words (clause.md); `brubum` (*recently*) is taught in knowing.md. *Tonight* and *forever* use composed forms, not the first suggestion (night has no unit abstract). Remaining gaps are the locative overlays, roles with no root, and Decline candidates. Next batches go one target page at a time. *Batch 6 done (10 rows):* `say-reasons.md` gained `#stance-adverbs` (*obviously*, *apparently*, *presumably*, *guess*, *assume*, *unfortunately*) and `#reason-purpose-guilty` (*reason*, *purpose*, *justify*, *guilty*). *Batch 7 done (16 rows):* `say-reasons.md` gained `#sake-words` (*important*, *useful*, *helpful*, *suitable*, *benefit*, *advantage*, *satisfy*, *upset*), `#wrong-ugly` and `#cause-verbs` (*kill*, *feed*, *remove*, *prevent*, *persuade*, *introduce*). *Introduce* is `velehal` (learn) with `thegem`; *more important than* is a rank on the lasting met sake. *Batches 20 and 21 done:* open items closed (*corner*: `adoda` 🔻 abstract corner; *foot* and *pound*: `uvuda` foot-length and `ahabo` pound-mass, taught with *inch* and *mile* in numbers-applied.md#stock-units; *sex*: alias on `elebu` plus the female / male pair) and 14 more gaps retried (*available*, *independent*, *straight*, *hang*, *bottom*, *editor*, *closely*, *lean*, *briefly*, *parallel*, *wherever*, *attribute*, *characterize*, *effectively* as a Decline). *Batch 19 done (44 rows):* the remaining gaps retried. Spatial words come from existing hooks and joins in `english.md#place-path` (*outside*, *throughout*, *abroad*, *overseas*, *beyond*, *versus*), abstract adverbs from stance, adverb and CAUSE forms in `say-reasons.md#stance-adverbs` (*necessarily*, *basically*, *overall*, *automatically*), verbs and nouns from existing roots and new compounds in `say-people-places.md` (`#relating-verbs`, `#sense-nouns`). *Emotion* gets a general word. *Batches 17 and 18 done (44 rows):* role nouns with no root (*officer*, *secretary*, *owner*, *customer*, *host*, *staff*, *candidate*, and more) through role compounds, and adjective, adverb and verb gaps (*real*, *reality*, *favorite*, *count*, *qualify*, *criticize*, *middle*, *primarily*, *ultimately*) through existing roots, one new compound and cue rows; *emotion* and *emotional* are Declines by design. *Batch 16 done (23 rows):* the "not written" gaps, in `say-people-places.md#sense-nouns` (*case*, *deal*, *figure*, *object*, *board*, *series*, *reduce*, *furniture*, and more); three stay `Gap:` (*environment*, *efficiency*, *holder*). *Batch 15 done (73 rows):* abstract nouns in `say-reasons.md#reason-nouns` (*condition*, *factor*, *motivation*, *satisfaction*, *truth*, *regret*) and `say-people-places.md#thing-nouns` (*piece*, *species*, *gender*, *patient*, *size*, *way*, *friendship*); 36 applied, 14 partial, 23 `Gap:` (most with reason "not written"). *Batch 14 done (56 rows):* `say-reasons.md#cause-verbs` (*show*, *create*, *excite*, *encourage*, *convince*), `#mind-verbs` (*mean*, *explain*, *realize*, *forget*, *become*, *depend*) and `say-people-places.md#relating-verbs` (*join*, *belong*, *comprise*, *replace*, *represent*, *prefer*, *involve*, *apply*, *agree*). *Batch 13 done (58 rows):* evaluative and of-a-kind adjectives in `english.md#noun-adjectives`, `say-amounts.md` (`#bar-words`, `#quantity-words`) and `say-reasons.md` (`#trait-words`, `#sake-words`); 31 applied, 17 partial, 9 gap, 1 decline. *Batch 12 done (34 rows):* stance, focus and time adverbs in `say-amounts.md#focus-words`, `say-tense.md#time-words` and `say-reasons.md`. *Batch 11 done (19 rows):* `say-questions.md` gained `#ask-words`, `#offer-words` and `#reply-words` (*ask*, *interview*, *conversation*, *chat*, *dialog*, *offer*, *suggest*, *propose*, *recommend*, *advice*, *suggestion*, *proposal*, *invite*, *welcome*, *hello*, *sir*, *yeah*, *quote*, *mention*); *sir* is `Partial:`. *Batch 10 done (14 rows):* `say-amounts.md#group-words` (*group*, *crowd*, *bunch*, *pair*, *member*, *list*, *range*); `say-people-places.md` `#role-title-address` (*role*, *title*, *address*) and `#words-about-words` (*sentence*, *phrase*); *verb* and *noun* are `Gap:`. *Batch 9 done (8 rows):* `english.md#noun-adjectives` (*golden*, *wooden*, *royal*, *solar*, *musical*, *biological*, *institutional*, *structural*). *Batch 8 done (10 rows):* `say-people-places.md` gained `#give-get` (*get*, *receive*, *provide*, *earn*, *borrow*, *owe*, *distribute*, *contribute*, *acquire*, *supplier*). into `english.md` and the `say-*.md` pages (recipe track only; stage pages never link to it). Nine cues had no `find-english` hit and now have targets: *whereas*, *moreover*, *nevertheless*, *onto* (`aol`), *till*, *anybody*, *somehow* (`homem bor`), *via*, *hi*. Doer-noun stems need checking against `roles.md` (some vowels fail after `x`, for example `zaxovel`).
*Batch 24 done (8 rows):* the last two gaps, the two held rows and the compound leftovers. *Picky* is a bar word (`thobam zel gabehum`, say-amounts.md#bar-words); *punishment* / *punish* use the existing *penalty* compound `abazemenehe` (say-people-places.md#sense-nouns); *set* (a group) is `-lx` in the same table; *bias* (the noun) is the biased sentence in say-reasons.md#biased, not an alias on `aboga`; *mother* / *mom* and *father* / *dad* rows in `#kin-words`; *politician* is `zaxagulageduthel` in `#agent-nouns`; *racial* is an alias on `azewe`.
2. **Open items: done.** *Corner*, *sex*, *foot*, *pound* and *inch* are closed (see batches 20 and 21). Other imperial units (*ounce*, *gallon*, *acre*, *yard* as a measure) are not NGSL words and are left; add an abstract sense on an unfilled row when a learner needs one.
3. **Decline rule: done.** Logged as D-16 and the *Bare evaluatives* section of [`design-decisions.md`](../meta/design-decisions.md). *Emotion* was first declined for emotion compose, then given a general word after review (`ahulohaha`, batch 19); only the four by-design Declines remain (*effective*, *effectively*, and *latter*, D-17).
4. **Run `npm run lint:lexicon`, `npm run build` and `npm test`** after each batch of applied rows.


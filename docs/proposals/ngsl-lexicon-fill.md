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
| **Synonym** | An existing root already means it; the gloss just used another English word | Add the word to `english_by_pos` or the recipe track so `find-english` hits it |
| **Compound** | Two published roots combine clearly | `lexicon-compounds.csv` |
| **New abstract sense** | A published root's picture fits, and its `abstract` cell is empty | Fill that row's `abstract` and `mnemonic` |
| **New root** | None of the above, and a fitting emoji exists | New emoji-seeded row (propose the emoji) |
| **Human review** | Needs a new root, but no emoji is a good seed (*deal*, *matter*, *stuff*) | Flag it. Don't force a loose seed |
| **Decline** | Clashes with a design aim | Log in [`design-decisions.md`](../meta/design-decisions.md) with the recipe that replaces it |

A lemma with two unrelated senses (*mean*, *kind*, *like*) is split into one row per sense (see [Part of speech](#part-of-speech)). The agent stops after each batch for editor review. Nothing lands in the lexicon or grammar docs during triage.

### 5. Apply approved rows

Recipes, `english_by_pos` additions, compounds, and new abstract senses are edited directly. New roots follow the existing path: emoji seed, `concrete` / `abstract` / `mnemonic`, `npm run convert-word -- --lexicon --only <concrete>`, then `npm run lint:lexicon`, `npm run build`, and `npm test`. New roots take normal placement. NGSL rank does **not** earn a two-syllable slot.

## Output

- `scripts/frequency-coverage.ts` — the coverage check (`--gaps-only`, `--json`, `--candidates`).
- `tmp/frequency-coverage.csv` — generated, not committed: `rank, lemma, per_million, tag, hit`.
- `docs/proposals/ngsl-lexicon-mentions.csv` — step 2 verdicts.
- `docs/proposals/ngsl-lexicon-triage.csv` — one row per gap (or gap sense): `rank, lemma, sense, stage, candidates, grammar_leads, fix, proposal, note`. Steps 3–4 fill it.

## Settled

- **Word list:** NGSL 1.2 only, all 2809 lemmas.
- **Part of speech:** untagged lemmas, with a sense split during triage.
- **Two-syllable slots:** rank does not earn a shorter root. New roots are placed as usual.
- **No good emoji:** flagged for human review, not seeded loosely.
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

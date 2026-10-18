# Proposal: English → Agazan helper

**Status:** APPROVED (2026-10-18). Phases 1 and 2 built (2026-10-18), see [Phase 1 results](#phase-1-results) and [Phase 2 results](#phase-2-results). Approved: suggestion-only output, the UI as its own section below the inspector, `compromise` as the tagger (with the recall eval as the check), WordNet for build-time meaning only, reading the recipe tables from their structure, and the four compound cases.  
**Related:** [`scripts/find-english.mjs`](../../scripts/find-english.mjs) / [`src/find/english.ts`](../../src/find/english.ts) (phrase search), [`scripts/frequency-coverage.ts`](../../scripts/frequency-coverage.ts) (NGSL coverage on the shared ladder), [`src/wordnet.ts`](../../src/wordnet.ts), [`src/parse/llm-prompt.ts`](../../src/parse/llm-prompt.ts) / [`src/parse/llm-examples.ts`](../../src/parse/llm-examples.ts) (Agazan → English prompt), [`GlossViewer.vue`](../grammar/.vitepress/components/GlossViewer.vue) on the [Inspect](../grammar/inspect.md) page  
**Design authority:** remains [`docs/grammar/`](../grammar/introduction.md) and the lexicon CSVs. This proposal covers **tooling only**: it suggests roots and grammar sections for an English input. It adds no forms, readings or senses, and it never changes what the parser accepts.

## Motivation

Agazan → English is well served: the parser, the morph gloss, the Inspect page and `--llm-prompt`. The other direction has only [`find-english.mjs`](../../scripts/find-english.mjs). It answers a **phrase** well (`because` → `thavem` / `gavem`, grouped by section), but a whole sentence returns noisy hits. It doesn't analyze word by word, doesn't know a word's part of speech, and has nothing to offer for a word with no direct root (`sister` gives "no entry" from root search, though [kin generations](../grammar/numbers-applied.md#kin-generations) cover the job).

A learner or editor translating English needs three things for each clause:

1. which **roots** carry the content words, with the ending that part of speech implies;
2. which **grammar sections** the function words and constructions point at (tense, *because*, *could*, plurals, questions, names);
3. which words have **no** answer yet, so they can be logged as gaps rather than guessed.

## Goals

1. A deterministic **analyzer** that turns English into a per-clause skeleton of root and grammar **suggestions**, shared by a CLI and the Inspect page.
2. **Suggestion-only.** The analyzer never assembles an Agazan sentence. When a word has several Agazan jobs (*by*, *for*, *could*), it shows all of them with their teaching links and lets the user pick.
3. An optional **LLM prompt** that wraps the analyzer output, relevant doc examples and core rules, and asks the model to draft and then check its own draft.
4. **Built from the docs and data**, like the translation prompt: no hand-kept parallel cue list where a grammar table already says the same thing.
5. A **free recall eval** on doc example pairs that shows where the cue index is thin.

## Non-goals

- Producing finished translations deterministically.
- New grammar, senses or aliases. Gaps found while using the tool are logged for a decision, as now.
- Replacing `find-english.mjs`. It stays the phrase-level search, and the helper calls into it.
- Linking from stage pages. The helper lives on the Inspect page, which teaching pages don't send learners to as a lesson step.

## Pipeline

Input is English text. Output is a list of clauses, each a list of **slots**: one per English word or construction, each with ranked suggestions and the tier that produced them.

### 1. Segment and tag

Split into sentences and clauses, expand contractions (*couldn't* → *could not*), and give each word a lemma and a part of speech **in context**. The same step records clause features: tense and aspect, negation, question, possessive, plural, proper names. This step needs an NLP library; see [NLP library choice](#nlp-library-choice).

### 2. Content words → roots

Content words (nouns, verbs, adjectives, adverbs) go through a lookup ladder, first hits ranked first. It is the ladder [`frequency-coverage.ts`](../../scripts/frequency-coverage.ts) already uses, moved into a shared module:

| Tier | Source |
|------|--------|
| `root` | published `concrete`, `abstract`, `english_by_pos` |
| `alias` | published `english_aliases` (search cue only) |
| `compound` | `lexicon-compounds.csv` `concrete`, `abstract`, longest English n-gram first (*living room* before *room*) |
| `overlay` | `lexicon-overlays.csv` `gloss` |
| `grammar` | a gloss or table row in `docs/grammar/` that is exactly this word (via `find-english`) |
| `synonym` | a root whose sense shares a WordNet synset with the lemma |
| `broader` | a root whose sense is a WordNet hypernym of the lemma (one or two levels) |
| `route` | the lemma belongs to a class the lexicon leaves out on purpose (see below) |
| `live` | a live `x` compound built from the parts' suggestions (see [Compounds](#compounds)) |
| `gap` | none of the above |

**Words left out of the lexicon on purpose.** [Lexicon editing](../meta/lexicon.md#when-a-compound-earns-a-row) lists English words that never get a row. Kin terms are [kin generations](../grammar/numbers-applied.md#kin-generations). Doers are [role compounds](../grammar/roles.md#role-compounds). Young and sexed animals use `/ɡ/`. A tie between people is a [social relation](../grammar/relations.md#social-relations). For these words "gap" is the wrong answer, and the right one is a grammar route. The `route` tier recognizes them by WordNet class (a hyponym of *relative*, *young mammal*, …) or by the doer suffix the tagger already sees (*teacher*, *walker*). It then points at the owning section, like a detector. The class → section list is a short hand-kept table with build-checked anchors, the same as the detector table.

Each suggestion shows the emoji, root, matched sense, tier, and the role letter that part of speech implies, read from `english_by_pos` when the row has one. The `synonym` and `broader` tiers are labeled as such, so nobody mistakes a WordNet lead for a lexicon sense.

### 3. Function words and constructions → grammar jobs

The cue index is generated at build time from:

- the tables in [`english.md`](../grammar/english.md) (for example [One English word, many jobs](../grammar/english.md#many-jobs)) and the `say-*.md` recipe tables: English cue → Agazan job → teaching link;
- `find-english` gloss and table entries for single function words (*because*, *although*, *already*);
- a small set of **structural detectors** fed by step 1, each pointing at an owning section:

| Detector | Points at |
|----------|-----------|
| past / perfect / progressive / future, *used to* | [`say-tense.md`](../grammar/say-tense.md) |
| modal (*can*, *could*, *may*, *must*, *should*) | [`say-tense.md`](../grammar/say-tense.md), then the owning sections it links |
| `?`, *wh-* word, inverted auxiliary | [`questions.md`](../grammar/questions.md) / [`say-questions.md`](../grammar/say-questions.md) |
| *not*, *never*, *no* | the owning denial section |
| plural noun, *we* / *they* | [`plurality.md`](../grammar/plurality.md) |
| proper name | [proper names](../grammar/word-endings.md) |
| possessive *'s* / *of* | [*'s* / *of*](../grammar/english.md#of) |
| *-ing* / *-er* / *-ed* used as noun or adjective | [participles](../grammar/english.md#participles) |

The detector table is the one hand-kept part, and it holds only cue → anchor pointers. Its anchors are checked by the build like any other link, and its tests fail when an anchor moves.

When a cue has several jobs, the slot lists them in table order with each row's English itch, so the user chooses by meaning.

### 4. Gaps

Any slot with no suggestion is reported with the lemma, its synonyms and the phrases tried. That is the record the gap-logging workflow already asks for.

### 5. Stage filter

`--stage beginner|intermediate|advanced` (and a matching UI toggle) hides suggestions whose owning section is above that level, using the bands `find-english` already reads.

### Example output (CLI)

```
clause 1  "my sister could not come"   [past? no · negated · statement]
  my      possessive → english.md#of · pronouns.md
  sister  noun → /z/   route: kin term (WordNet: relative) → numbers-applied.md#kin-generations
  could   modal: 3 jobs  [pick one]
            ability        → say-tense.md …
            possibility    → knowing.md#hold-endings-may
            past of can    → say-tense.md …
  not     negation → …
  come    verb → /v/   root: <root> (concrete "come")
```

(The `…` and `<root>` are placeholders. The real output reads every form and anchor from the docs and data at run time.)

## LLM layer

`--llm-prompt` prints a self-contained prompt, mirroring `parse.mjs --llm-prompt`:

- the analyzer skeleton, with tiers and jobs left open where there is more than one;
- core rules: default order, role letters, endings (the core already in [`llm-prompt.ts`](../../src/parse/llm-prompt.ts));
- for each grammar job suggested, that section's reader note ([`constructions.ts`](../../src/parse/constructions.ts)) and its closest doc example pairs, retrieved by **English** similarity (a reverse key on the index [`llm-examples.ts`](../../src/parse/llm-examples.ts) builds);
- instructions to use only the suggested roots or say that a word has none, to pick among multi-job slots by meaning, then to run `parse.mjs` on the draft and `--llm-prompt` on the result to check the back-translation.

The analyzer's job here is to narrow the context. The model sees the roots and sections that are probably relevant instead of the whole grammar, which cuts invented roots and wrong-section guesses. The parser and the back-translation catch what is left.

## CLI

```
node scripts/english-helper.mjs '<english>' [more…]   # skeleton (default)
  --stage beginner|intermediate|advanced
  --json
  --llm-prompt                                         # wrap the skeleton for an LLM
  --verify '<agazan draft>'                            # parse + --check-lexicon + morph gloss, beside the English
```

`--verify` puts the existing parser output next to the English line. It adds no new checks of its own.

## UI

A **separate section on the Inspect page, below the Agazan inspector** (`GlossViewer`), under its own heading, for example `## English helper`, with an `<EnglishHelper />` component:

- **English input.** Analysis runs as you type, debounced.
- **One row per clause.** Each slot is a card: the English word, then suggestion chips. A root chip shows emoji and root (click to copy) with its tier on hover. A grammar chip shows the job name and links to the owning section. Multi-job slots show their chips side by side with the English itch under each.
- **Gap list** at the end of the section.
- **Level toggle** (beginner / intermediate / advanced).
- **Copy Helper Prompt** button, the LLM layer above, matching the inspector's Copy Translation Prompt. It arrives with the LLM layer in phase 4; the rest of the section ships first, in phase 3.
- **Send to inspector**: a draft box whose button copies the draft into the inspector input above and scrolls there. Checking happens in the inspector, so the page doesn't need a second parser view.

Loading follows the inspector's pattern: the NLP library and the English cue/root index load as their own chunk, started on mount, so the inspector is not slowed by the helper.

## NLP library choice

### What step 1 needs

- **Contextual part of speech.** English is full of words whose role depends on the sentence: *saw* (see / tool), *left* (leave / side), *can* (modal / container), *like* (verb / similative), *walk* (verb / noun). The part of speech decides both which root sense to offer and which role letter. A per-word dictionary lookup can't decide this; only a tagger that reads the sentence can.
- **Lemmas** for inflected forms, irregulars included (*went* → *go*, *children* → *child*).
- **Clause features** for the detectors: tense and aspect, negation, questions, contractions, possessives, names.
- **Runs in Node and the browser**, with no server and no model download at run time, because the UI is a static VitePress page.

### Approved: `compromise`

[`compromise`](https://github.com/spencermountain/compromise) (MIT; 14.x, maintained) is a rule-and-lexicon English tagger written in JavaScript:

- **Contextual tagging** of the ambiguous words above, plus lemmas: `verbs().toInfinitive()`, `nouns().toSingular()`.
- **High-level views that match the detector table almost one to one:** verb phrases with tense, auxiliary, negation and modal; `questions()`; `contractions().expand()`; possessives; `people()` / `places()` for names; plural nouns. With a plain tagger, these would be detectors we write and test ourselves.
- **Same code in Node and the browser:** no model files, no WASM, no native build, three small dependencies (`efrt`, `grad-school`, `suffix-thumb`).
- **Learner-sized input.** It is weaker than statistical taggers on long or messy text, but the helper's input is short teaching sentences, where rule-based tagging does well. The recall eval below measures this rather than taking it on trust.

Costs to check before adopting:

- **Bundle size.** The package is about 2.7 MB unpacked across several builds. Measure the minified, gzipped browser chunk with esbuild before committing. Lazy loading keeps it off the inspector's critical path either way.
- **Tagging errors.** They pass straight into suggestions. The UI and CLI show the tag the analyzer used ("*saw* read as verb *see*") so a wrong reading is obvious, and the user can force a reading (for example `saw/n`).
- **It is a new runtime dependency,** the kind of risk AGENTS.md says to weigh. Keep it behind one module (`src/english-helper/tag.ts`) that returns our own types. Then swapping libraries touches one file and the tests that pin its output.

### Alternative: `wink-nlp`

[`wink-nlp`](https://github.com/winkjs/wink-nlp) (MIT) with `wink-eng-lite-web-model` is a statistical pipeline: probably more accurate tagging, lemmas, negation flags, sentence splitting. It is the fallback if the recall eval shows `compromise` mis-tagging often. Against it: the model is a separate package of about 3.8 MB unpacked, and it has no tense, question or contraction views, so the detectors would be ours to write.

### Not recommended: no library

The repo already stems lightly (`find-english` drops stop words and strips suffixes). Taking that further means hand-writing irregular forms, contractions and tense detection, and it still can't separate *saw* the verb from *saw* the noun. That is the "something an AI might implement incorrectly" risk, for worse results than a maintained tagger.

## WordNet

### Approved: use it at build time, for meaning; not at run time for grammar

WordNet is the right tool for step 2's `synonym` and `broader` tiers. It is the only source here that knows *sister* is a kind of *sibling*, or that *glad* and *happy* share a synset. The repo already relied on it for this exact job: the NGSL triage used WordNet synonyms to find root candidates for gaps, and `compound-fill` uses its noun hyponyms.

It is **not** a substitute for the tagger:

- **No function words.** WordNet covers nouns, verbs, adjectives and adverbs only, with no prepositions, pronouns, determiners, modals or auxiliaries: exactly the words that point at grammar sections.
- **No context.** Its lemmatizer (*morphy*: suffix rules plus the `*.exc` exception lists) returns every possible lemma for every part of speech. *saw* gives both *saw* (n) and *see* (v), with nothing to choose between them.
- **Too big for the page.** The full database is about 35 MB unpacked (`wordnet-db` 3.1); the noun files alone, in `tmp/wordnet/`, are about 20 MB.

### How to use it

1. **Extend the loader.** `src/wordnet.ts` reads WordNet 3.1 nouns from the `wordnet-db` tarball. Extend it to all four parts of speech, with synonym, hypernym and derivation (`+` pointer: *hasty* ↔ *haste*) walks. It is the only WordNet loader: the WordNet 3.0 reader in `frequency-coverage.ts` went with the finished NGSL triage.
2. **Generate a reverse index at build time.** For each published root, compound and overlay sense, walk WordNet synonyms and hyponyms (so a lemma below a root sense finds that root as `broader`). Write `english → [{ root, sense, tier, via }]` to a committed file under `src/generated/`, next to `word-parser.js`, through an `npm run` script. It only holds English words that reach a lexicon sense, so it stays small enough to ship to the browser. Because it is committed, neither the site build nor CI needs to download WordNet.
3. **Regenerate when the lexicon changes,** on the same trigger as other generated data, with a test that fails when the committed index is stale for the current CSVs.

Optionally, morphy's exception lists can back up `compromise`'s lemmatizer for rare irregulars. It's a small table, used only when the tagger's lemma isn't in the index.

## Evaluation

**Recall on doc pairs (free, deterministic).** Run the analyzer on the English side of every doc example pair in the `llm-examples.ts` index. For each pair, check how many of the roots and constructions the reference Agazan actually uses appear among the suggestions, and at what rank (top-1, top-3, anywhere). Report by tier and by section, like `frequency-coverage`. This shows:

- which content words fall to `gap` though the docs translate them (missing aliases or senses, logged for a decision, never auto-added);
- which constructions have no cue (missing detector or table row);
- whether tagging errors are common enough to justify `wink-nlp`.

**Model eval (costs money, only when asked).** A reverse `llm-eval`: English → Agazan with the helper prompt, scored by "parses" plus "morph gloss matches the reference". Later, and only on request.

## Phases

1. **Shared lookup and CLI.** Move the frequency-coverage ladder into `src/english-helper/`, add the tagger module and the detectors, extend the `find-english` table harvest with `teach` and `cues` plus its lint ([reading the recipe tables](#reading-the-recipe-tables)), build the cue index on it, ship `english-helper.mjs`, and run the recall eval. Decide `compromise` vs `wink-nlp` from the numbers.
2. **WordNet index.** Extend `wordnet.ts`, generate the committed reverse index, and add the `synonym`, `broader` and `route` tiers and the [compound](#compounds) cases.
3. **Inspect page section** below the inspector, reusing the generated index: everything in [UI](#ui) except the Copy Helper Prompt button.
4. **LLM layer and `--verify`,** including the prompt builder's integration into the Inspect page section (the Copy Helper Prompt button).

## Reading the recipe tables {#reading-the-recipe-tables}

**Question.** The cue index needs the English cue → Agazan job → teaching link rows in [`english.md`](../grammar/english.md) and the `say-*.md` pages. Should the build read them from their Markdown structure, or should editors mark the tables to harvest, like `<!-- cheat-sheet: ID -->` and `<!-- generated -->`?

**What already exists.** [`src/find/english.ts`](../../src/find/english.ts) already harvests these tables. `tableRows()` finds every table with an Agazan column (an `Agazan`, `Form` or `Agazan job` header, or a column that is mostly backticked) and an English column (`English…`, `Reading`, `You mean`, …). `node scripts/find-english.mjs by --kind table` returns the *by* rows of [One English word, many jobs](../grammar/english.md#many-jobs) today. The recipe pages use a handful of header shapes (`English | Agazan | Reading` and `English itch | Agazan job | Teach` cover most rows), and the existing heuristic already handles all of them.

The helper needs two things the current harvest drops:

1. **The teaching link.** `Teach` is in `OTHER_HEADER`, so the link in that column is discarded, and a hit points at the recipe section instead of the grammar section that teaches the job.
2. **The cue word.** In the many-jobs tables the English cue isn't in the row. It's the `###` heading (`### *by*`, `### *'s* / *of*`), and each row's English cell is the *itch* (*tool (writes by / with a hammer)*). Matching the input word *by* against itch cells would be noisy.

**Approved: read the structure, add no markers, and lint the convention.**

- Extend `EnglishEntry` with an optional `teach` (the first link in a `Teach` column) and a `cues` list (the italic words of the nearest `###` heading, when the table sits under `#many-jobs`). The helper and `find-english` share one harvest, so a table fixed for one is fixed for both.
- Add a lint so the structure can't drift silently. Under `#many-jobs`, every `###` heading is a list of italic cues, and every table there has `English itch | Agazan job | Teach` with a link in `Teach`. In the `say-*.md` pages, every table has an English column the harvest recognizes. A new table in a shape the harvest can't read fails the build instead of quietly missing from the helper.
- Why no markers: the cheat-sheet marker records a choice the page structure doesn't state (which tables belong on which sheet). Here the structure already says everything: the heading names the cue, the header names the columns, and the `Teach` cell names the link. A marker would repeat that, and it's one more thing an editor can forget when adding a table. The lint gives the same guarantee without anyone maintaining it.
- Fallback: if the recall eval finds a table the heuristic misreads and the table can't reasonably be reshaped, add a narrow opt-out (`<!-- english-cue: skip -->`) then, not an opt-in on every table now.

## Compounds {#compounds}

**Question.** Beyond a direct sense match (*bedroom* → the listed compound), should the analyzer suggest compounds from parts that are suggested separately?

**How compounds work.** Agazan has two kinds:

- **Dictionary compounds** ([lexical compounds](../grammar/x-compounds.md#lexical-compounds)): one listed stem, left root + boundary letter + head, in `lexicon-compounds.csv`. A row is added only for a fixed kind ([when a compound earns a row](../meta/lexicon.md#when-a-compound-earns-a-row)).
- **Live `x` compounds** ([adding another piece](../grammar/x-compounds.md#ordinary-compound-order)): pairings made on the spot, roots joined with mid-word `x` in English order, with the last root as the kind. These are open: anyone can build one without a lexicon row.

So English noun + noun phrases (*tea shop*, *dog walker*, *glass door*) usually have a legitimate answer even with no row, and the helper should show it. It needs four cases, in this order:

1. **Direct match, longest first.** The English n-gram is a compound's sense (*bedroom*, *living room*, *dress shoe*). Show the listed compound. This is the `compound` tier, and it beats per-word matches on the parts.
2. **Parts match a listed compound.** The modifier's and head's top suggestions are exactly a listed row's left and head (*bed* + *room* written as two words). Show the listed compound first, with a note that the dictionary word exists. The per-part and live options follow.
3. **Live compound.** The tagger groups a modifier noun with a head noun, and both have root suggestions. Show a `live` suggestion: the parts in English order, the last as the kind, joined with `x`, with the ending the slot implies, and a link to [adding another piece](../grammar/x-compounds.md#ordinary-compound-order). The candidate stem is run through the parser before display and dropped if it fails. A doer head (*dog walker*) goes to the `route` tier instead: a [role compound](../grammar/roles.md#role-compounds) whose stem can be the stack.
4. **Adjective + noun stays two words.** *a blue dog* is a thing plus a property, not a compound (rule 1 of [when a compound earns a row](../meta/lexicon.md#when-a-compound-earns-a-row)). The tagger's adjective/noun split keeps these as two slots, and no compound is suggested.

**Approved: do all four, and nothing more.** In particular, no meaning-level guessing: the helper doesn't map *sleeping room* to the bedroom compound, or *a place where you sleep* to anything, by paraphrase. That is the LLM layer's job, and the prompt says so. WordNet multiword lemmas (*living_room*) still count as synonyms through the reverse index, because that's a listed equivalence, not a guess.

Live suggestions are labeled `live` and rank below every listed match, so a learner can see "the dictionary has a word for this" vs "you can build this on the spot". The recall eval reports `live` hits separately. A live compound that the doc examples keep using is a lead for a dictionary row: logged for a decision, never added automatically.

## Phase 1 results {#phase-1-results}

Built: `src/english-helper/` (`tag.ts` wraps `compromise`, `lexicon.ts` is the ladder `frequency-coverage.ts` now shares, `cues.ts` reads the harvested tables, `detectors.ts` is the hand-kept table, `analyze.ts`, `load.ts`, `cli.ts`), `scripts/english-helper.mjs`, and `npm run english-helper-recall`. `EnglishEntry` gained `teach` and `cues`, and `lintRecipeTables` runs as a test over `english.md` and the `say-*.md` pages. Two `say-amounts.md` table headers were renamed so the harvest reads them (`Example` → `Agazan`, `Unit` → `English unit`).

Beyond the plan: cues come from every teaching table's English column, not only the recipe pages (so *I* finds `amun` and *sister* finds the kin row), skipping cheat sheets, the level review, and `### Practice` word banks. A house-cast name suggests the root it is built on with **-n** (*Azawan* → `zazawan`). Each root suggestion links the section for its role letter. Three detectors were added: numbers, *and* / *or* lists, and *there is*.

Recall on 1,134 doc example pairs (3,204 root uses):

| Measure | Result |
|---------|--------|
| Root suggested, top-1 | 74.5% |
| Root suggested anywhere (lexicon or a grammar row's form) | 88.4% |
| Root missed though a sentence word maps to it (tagging miss) | 25 (0.8%) |
| Construction's home page suggested (structure in ≥20% of examples left out) | 51.2% |

**Decision: keep `compromise`.** Tagging misses are under 1% of root uses. Most misses are lexicon gaps instead (*leave* / *left* for `edaba`, *asleep* for `ezeba`). They are listed in `tmp/english-helper-recall.csv` for a decision, and nothing was added automatically. Some misses only look like misses: the eval counts an overlay word's host root as a root use (`hamom` counts as `amo` *money*), while the helper points at that overlay through a detector link that has no form to match. The tagging measure only counts misses where some reading of a sentence word maps to the root, so a word mis-read under a lemma the lexicon lacks (*spoke* read as a noun) is not counted.

The browser chunk for `compromise` is about 358 KB minified, 148 KB gzipped (esbuild), so it should load as its own lazy chunk in phase 3.

**Startup.** The sentence parser is now built on first use (`sentence-parser.ts`), and the helper checks spelled words with the word parser and the lexicon tables (`classifyAll`) instead of a sentence parse. Warm CLI startup went from about 4.6 s to 0.5 s. The grammar-page entries are cached in `src/find/entries-cache.ts`, shared with `find-english` (9.6 s → 0.13 s warm) and `frequency-coverage.ts`. The first run after a change under `docs/grammar`, `src` or `data` rebuilds the cache, which parses every gloss.

**Doer nouns (part of the `route` tier, moved up from phase 2).** A doer noun (*-er* or *-or* over an English verb) with no root of its own gets role compounds built on the verb's event root, each checked by the word parser. The usual role comes first (`zaxedehothel` *a teacher*, linked to [the usual role](../grammar/roles.md#usual-role)), then the plain doer (`zaxedehol` *someone who teaches*, linked to [role compounds](../grammar/roles.md#role-compounds)). A noun just before the doer goes into the stem (`zaxodogaxowogathel` *a dog walker*). A table row that spells the same word is dropped as a repeat. Cues led by an article (*a dog walker* in the participles table) are no longer matched, so they don't swallow the doer slot. Irregular doers (*actor* over *act*, which has no root; *journalist*) still come from the `#agent-nouns` cue rows. The rest of the `route` tier (kin terms and young animals by WordNet class) stays in phase 2. With role-compound stems counted as root uses, recall is 3,242 uses, 74.5% top-1, 88.1% anywhere.

## Phase 2 results {#phase-2-results}

Built: `src/wordnet.ts` reads all four parts of speech (hypernym, hyponym, similar-to and derivation pointers, SemCor tag counts). It is still the only WordNet loader, and `compound-fill` uses it. `npm run english-helper-wordnet` (`scripts/english-helper-wordnet.ts`) writes the committed `src/generated/english-wordnet.json`, and `src/english-helper/wordnet-index.ts` reads it. A test fails when the file is stale for the lexicon CSVs, or names a sense the lexicon no longer has. The `wordnet-db` 3.1 tarball has no morphy exception lists, so the optional backup lemmatizer was skipped.

**What the index holds.** English words with no lexicon key of their own → lexicon **sense words**, never root spellings. A respelled root never makes the file stale, because the analyzer resolves each sense through the lexicon index at run time. Each entry records the English word's WordNet part of speech, so a tagged noun skips verb-only links (*kitten* the verb is *bear*). Rules:

- `synonym`: the word shares a synset with a sense, and that synset is within the first 3 senses of both words. Also an adjective that WordNet lists as similar to a sense, and a word derived from a sense where either side is an adjective (*hasty* ← *haste*). Noun ↔ verb derivations crossed senses too freely (*stroller* the pram → *stroll*), so they are left out.
- `broader`: the word's synset sits one or two levels under one of a sense's first 4 senses.
- Every sense is read in all four parts of speech, since a root takes its part of speech at use time (*stroll* the noun sits under *walk* the noun).
- Only common words are kept: some sense tagged in SemCor, or a word compromise knows. At most 4 entries are kept per word and part of speech.

Size: 10,002 words and 409 routes, 1.1 MB raw, 154 KB gzipped. It can load in the same lazy chunk as `compromise` in phase 3.

**Routes.** Hyponyms of *relative* are `kin`, linked to [kin](../grammar/numbers-applied.md#kin-generations) and [kin words](../grammar/say-people-places.md#kin-words). A cue row such as *aunt* still wins, so the route shows only for words the tables leave out (*cousin*, *nephew*). An animal whose gloss opens with *young*, *female* or *male*, or that sits under *young* (the noun), is `young` / `female` / `male`. The route spells the animal's word plus the `/ɡ/` word (`gahadol` *young* on the child root, `geveval`, `gemehel`), with the qualifier read from the lexicon at run time. It links to [young, male and female animals](../grammar/say-people-places.md#young-animals), added after phase 2 (adjective, not compound: [design decisions](../meta/design-decisions.md#young-and-sexed-animals)). A word in that section's table (*puppy*, *mare*) gets the table row, and the route covers the rest (*piglet*). The animal is the nearest rooted animal above it in the tree, or a narrower one its gloss names (*kitten*: *young domestic cat*, under *young mammal* → *cat*). Some routes have no animal because the lexicon has no root for it (*bull*, *calf*, *sow*: *cattle* and *swine*), so they show the class and the link only. Social relations were not given a route class. WordNet has no clean class for them, and the docs' tie roots already come through the cue tables.

**Compounds.** All four cases are built. (1) A run of 2–3 content words ending in a noun is matched joined by space, hyphen or nothing (*living room* → `living-room`, *bed room* → *bedroom*), and also against WordNet multiword synonyms. A match becomes one noun slot. (2) Two nouns whose top roots are a listed row's left root and head get that row first on the head slot, with a "dictionary word" note (*school book* → *textbook*). (3) Otherwise two nouns with roots get a `live` stem on the head slot, kept only when the word parser accepts it (*tea shop*). It ranks last. (4) An adjective + noun pair (*a blue dog*) never gets a compound.

**Recall** on the same 1,134 pairs (3,242 root uses): top-1 74.5% → 74.9%, anywhere 88.1% → 88.2%. Roots found by tier: root 2,338, alias 77, compound 3, grammar 413, synonym 5, broader 13, route 11. The gain is small because doc examples are written with lexicon words, and the WordNet tiers are for English the docs don't use. The reference Agazan has 5 two-root `x` compounds. All are names or cue-table examples (*peanut butter* comes from its table row), so the `live` tier builds none of them. It offered 21 live compounds across the set. The most-missed roots are unchanged lexicon gaps (*departure* for *leave*, *sleep* for *asleep*). They are in `tmp/english-helper-recall.csv` for a decision, and nothing was added automatically.


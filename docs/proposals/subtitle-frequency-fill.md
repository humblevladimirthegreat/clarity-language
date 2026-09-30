# Proposal: lexicon fill-in from subtitle word frequency

**Status:** PROPOSED  
**Related:** `unicode-pictograph-seeds.md`, `expressiveness-review.md`  
**Design authority:** roots stay assigned in [`data/lexicon-published.csv`](../../data/lexicon-published.csv), compounds in [`data/lexicon-compounds.csv`](../../data/lexicon-compounds.csv), overlays in [`data/lexicon-overlays.csv`](../../data/lexicon-overlays.csv). This note covers a **gap-finding pass** only. It changes no grammar.

## Motivation

The published lexicon grew from emoji seeds. That gives good coverage of things you can picture (food, animals, faces, tools). It says nothing about which words people use most. A learner who knows every root can still get stuck on everyday talk: *wait*, *maybe*, *enough*, *mean*, *guess*, *bother*, *deal*, *miss*.

Film and TV subtitles are the best free proxy for everyday speech. They correlate better with word-recognition speed than written corpora do (SUBTLEX results). Ranking English lemmas by subtitle frequency and checking each against what Agazan can already say gives a list of the gaps that matter most.

## Goals

1. Get a ranked list of the most frequent English lemmas that Agazan has **no clear way to say**.
2. Sort each gap into the cheapest fix: a recipe, a compound, a new sense on an existing root, or a new root.
3. Feed new-root candidates into the normal emoji-seeded process (seed → concrete → abstract → mnemonic → `convert-word`).
4. Leave a reusable script so the pass can be rerun after later lexicon work.

## Non-goals

- Matching English word for word. Many frequent English words are grammar in Agazan (pronouns, tense, questions, joins, hooks, stance). Those count as **covered**, not as gaps.
- Coining roots for frequent words that clash with Agazan's design aims (for example, a vague *should* that hides whose need it is). Those go to a recipe that shows the Agazan way to say it.
- Proper nouns, profanity lists, interjection spelling variants, and subtitle noise (`[music]`, speaker tags).
- Changing roots that `lexicon-overlays.csv` uses.

## Data source

Use the list we already have: `tmp/en_50k.txt`, the top 50k English word forms from the OpenSubtitles 2018 frequency lists (hermitdave `FrequencyWords`). [`src/lexicon-place.ts`](../../src/lexicon-place.ts) already fetches it (`ensureFrequencyFile`) and ranks it (`loadFrequencyRanks`) for root placement.

### Pros and cons of the existing list

| Pros | Cons |
|------|------|
| Already downloaded, and code already fetches and loads it. No new source, license, or loader. | **Word forms, not lemmas.** *going*, *went*, *gone*, *goes* rank separately, so the pass has to fold them itself. |
| Same ranking that root placement uses, so "frequent" means one thing across the lexicon tooling. | **No part-of-speech tags.** It can't tell *left* (direction) from *left* (went away). |
| Large corpus (hundreds of millions of subtitle tokens), so the top few thousand ranks are stable. | **Tokenizer noise.** Contractions are split (`'s`, `'t`, `'m`, `don`), and slang forms (*gonna*, *wanna*) rank high. These need a small hand-made fold table. |
| Subtitles are close to everyday speech, which is the kind of gap this pass targets. | Some English subtitles are translations of foreign films, so the list partly reflects translators' English. This hardly changes the top 3000. |
| Rerunnable at no cost. The URL is pinned in code. | Names and subtitle artifacts show up in the list and need a stop list. |

**Decision:** use the existing list. What SUBTLEX-US adds is lemmas and part-of-speech tags. The next section argues that part of speech is not the right way to split words, and folding forms into lemmas is a small table plus suffix stripping. Only the top ~3000 forms need folding, and nearly all of them are plain lowercase words.

### Folding forms into lemmas

1. Drop contraction fragments and fold slang to the base (*gonna* → *go*, *wanna* → *want*).
2. Irregular table for common verbs and nouns (*went*, *gone* → *go*; *men* → *man*).
3. Strip regular suffixes (*-s*, *-ed*, *-ing*, *-er*, *-est*, *-ly*) only when the stripped form is also in the list.
4. The lemma takes the **summed** frequency of its forms, and its rank is recomputed from the sums.

## Part of speech

**Recommendation: don't split rows by part of speech. Split by sense only where the triage finds a homograph.**

Agazan roots carry no part of speech. It is added when the word is used, through the PoS letter and ending. One root covers *walk* as noun and as verb, and *calm* as adjective, verb, and noun. Splitting frequency rows by part of speech would:

- count the same gap two or three times (*help* n / *help* v) and inflate the gap list;
- make the automatic check miss hits, because `concrete` / `abstract` glosses are mostly nouns while the English cue may be a verb.

A part-of-speech split only helps when the parts of speech carry **different senses**: *mean* (intend) vs *mean* (cruel) vs *mean* (average); *kind* (sort) vs *kind* (nice); *like* (enjoy) vs *like* (similar). That is a sense problem, and the untagged list can't see it either way. So:

- The automatic check works on untagged lemmas, and matches `english_by_pos` entries (`v:tell`, `v:hear`) across all parts of speech.
- The triage splits a lemma into senses when a reviewer sees two unrelated meanings. Each sense is triaged separately and keeps the lemma's rank. A known homograph list for the top ranks can be written down in advance so reviewers don't have to spot them.
- Where one sense already has a root and another doesn't, the gap is the missing sense, not the word.

## Method

### 1. Build the candidate list

Take the top **N** lemmas by subtitle frequency (start with N = 3000; about 90% of running subtitle text). Drop stop-list noise, names, and contractions split badly by the tokenizer.

### 2. Check coverage automatically

For each lemma, in order, stop at the first hit:

| Check | Source | Result tag |
|-------|--------|------------|
| Concrete or abstract gloss match | `lexicon-published.csv` `concrete`, `abstract`, `english_by_pos` | `root` |
| Compound gloss match | `lexicon-compounds.csv` `concrete`, `abstract` | `compound` |
| Overlay gloss match | `lexicon-overlays.csv` | `overlay` |
| English cue in grammar docs | `node scripts/find-english.mjs '<lemma>'` (JSON) | `grammar` |
| No hit | — | `gap` |

Glosses must match the **whole** sense word, not a substring, so *car* does not hit *care*.

### 3. Triage the gaps by hand

Automatic matches will have false hits (same spelling, different sense) and false misses (synonym glossed differently). An editor reviews the `gap` rows plus a sample of hits, top rank first, and gives each gap one fix:

| Fix | When | Where it lands |
|-----|------|----------------|
| **Covered by grammar** | Agazan says it with a construction, not a word | Recipe in `say-*.md` if no page already teaches that English cue |
| **Synonym** | An existing root already means it; the gloss just used another English word | Add the word to `english_by_pos` or the recipe track so `find-english` hits it |
| **Compound** | Two published roots combine clearly | `lexicon-compounds.csv` |
| **New abstract sense** | A published root's picture fits, and its `abstract` cell is empty | Fill that row's `abstract` and `mnemonic` |
| **New root** | None of the above, and a fitting emoji exists | New emoji-seeded row, then the respell workflow |
| **Human review** | Needs a new root, but no emoji is a good seed (*deal*, *matter*, *stuff*) | Flag it in the triage table. Don't force a loose seed |
| **Decline** | Clashes with a design aim | Log in [`design-decisions.md`](../meta/design-decisions.md) with the recipe that replaces it |

Gaps go into a results table for a decision, not straight into the lexicon.

### 4. Add new roots

New roots follow the existing path: pick an emoji seed, write `concrete` / `abstract` / `mnemonic`, run `npm run convert-word -- --lexicon --only <concrete>`, then `npm run lint:lexicon`, `npm run build`, and `npm test`. New roots take normal placement. Subtitle rank does **not** earn a two-syllable slot.

## Output

- `scripts/frequency-coverage.ts` — reads `tmp/en_50k.txt` through `loadFrequencyRanks`, folds forms into lemmas, prints the tagged table (`--json`, `--gaps-only`, `--top N`).
- `tmp/frequency-coverage.csv` — generated, not committed: `rank, lemma, forms, count, tag, hit`.
- A triage table (lemma, sense, rank, fix, notes) kept in this proposal or a sibling working file until absorbed.

## Settled

- **Two-syllable slots:** frequency does not earn a shorter root. New roots are placed as usual.
- **No good emoji:** flagged for human review, not seeded loosely.
- **Flashcards:** out of scope.
- **Part of speech:** untagged lemmas, with a sense split during triage (see [Part of speech](#part-of-speech)).

## Open questions

- **N.** 3000 is a guess. Coverage per extra 1000 lemmas can be plotted after the first run to pick a stopping point.

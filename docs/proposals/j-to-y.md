# Proposal: spell the palatal approximant `y` instead of `j`

**Status:** phases 1–3 done 2026-09-26; phase 4 (lexicon) waits for the next batched retie; phase 5 after that. Spelling change only; the sound /j/ is unchanged.  
**Origin:** `TODO.md` — "j should just be y, remind that y is never a vowel".  
**Related:** [phonology.md](../grammar/phonology.md), [clause.md](../grammar/clause.md), [speech-moves.md](../grammar/speech-moves.md), [questions.md](../grammar/questions.md), [numbers.md](../grammar/numbers.md), [src/parse/word.peggy](../../src/parse/word.peggy), [data/lexicon-published.csv](../../data/lexicon-published.csv)

## Motivation

The letter `j` already sounds like English *y* (*yes*, *yacht*). The phonology page has to warn that "`j` and `x` have sounds different than English", and learners carry that false friend into every turn word (`jal`, `jol`, `jael`), vocative, and root that contains it.

Writing it `y` removes one of the two false friends. English readers pronounce `yal`, `yol`, `yael` correctly on first sight. It also matches IPA /j/ in sound, if not in symbol, the same way most romanizations do.

**Cost to the learner:** `y` has to be taught as a consonant only. Agalan never uses it as a vowel (`y` is never a vowel; English *my*, *gym* are the false friend now). This is one short note, and `y` stays in onset position, where English speakers already read it as a consonant.

**No collision:** `y` is currently unused in native Agalan. Foreign / opaque payloads (`<…>`) keep their own orthography and are not touched.

## Scope

Everything that spells native Agalan `j`:

| Area | What changes | Rough size today |
|------|--------------|------------------|
| Role letter | turn `/j/` → `/y/` (`jal` → `yal`, `jululon` → `yululon`, `jol`, `jom`, polar stance `jael` / `juel` / …) | every speech-moves, questions, vocative example |
| Lexicon roots | roots containing `j` (`ejo`, `uju`, `ajara`, `ejeze`, …) | 41 published roots; 3 compound rows; overlay rows spelling those roots |
| Number words | `j+e`, `j#e`, `j-e-`, `j+0e`, and spoken number syllables (`ja` / `je` / `ju` / `jo` in the speech grammar: exponent `…ja…`, decimal `je`, percent `jo` / `ju`) | numbers.md, numbers-applied.md, `word.peggy` speech rules |
| Letter names | `ja` → `ya` | phonology [letter names](../grammar/phonology.md#letter-names) |
| Tooling | role-letter sets, `Pos` type, word grammar, converter consonant inventory, TTS phoneme map, lint letter lists | ~20 files under `src/` |
| Meta / AGENTS | `/j/` mentions in `AGENTS.md`, `docs/meta/`, `TODO.md` | editor notes |

Out of scope: the IPA symbol /j/ in phonology tables (it stays /j/ — that is the correct IPA), foreign payloads, English text.

## Phases

### Phase 1 — Tooling accepts `y` (no doc changes)

Goal: every tool understands `y` as the letter, so later phases are a pure respell.

1. `src/parse/types.ts`: `Pos` gains `"y"`; keep `"j"` temporarily.
2. `src/parse/word.peggy`: role letter, root consonant class (`ROOT_CONS`), and spoken-number syllables accept `y` alongside `j`. Regenerate the word parser.
3. Every hard-coded letter list: `src/lexicon-search.ts`, `src/parse/span-scan.ts`, `src/parse/gloss-inverse.ts`, `src/parse/classify.ts`, `src/parse/tokens.ts`, `src/parse/resolve.ts`, `src/parse/construction-trace.ts`, `src/parse/morph-gloss.ts`, `src/lint/template-trace.ts`, `src/lint/*` number-speech lint. Prefer normalizing to one internal letter at tokenize time over duplicating every `=== "j"` check.
4. `src/tts/phonemes.ts` and `src/tts/plan.ts`: `y` → /j/.
5. `src/word-converter.ts`: consonant inventory and fallback consonant use `y`.
6. Tests: parametrize the existing `j` tests to also run with `y`; add a test that `y` never parses as a vowel.

Exit: `npm test` green; `node scripts/parse.mjs 'yal zazawan vawalal.'` gives the same tree as the `jal` input.

### Phase 2 — Respell role letter, number words, and letter names in docs

Content roots keep `j` for now (see [Phase 4](#phase-4-respell-the-lexicon-batched-retie)). Tooling from Phase 1 accepts mixed text such as `yal zejon`, so docs stay buildable in between.

1. Write a token-aware script (reuse the retie tokenizer, not a text replace) that rewrites Agalan tokens only: `/j/` role prefix, `j`-prefixed number words (`j+e`, `j#e`, `j#e-`, `j-e-`, `j+0e`), spoken number syllables in speech lines, and `/j/` in prose role-letter references. Scope: `docs/grammar/`, `docs/examples/`, `docs/meta/`, `AGENTS.md`, `TODO.md`. It must not touch `j` inside content roots.
2. Leave IPA `/j/` inside phonology sound columns as is; hand-check phonology.md.
3. Hand-edit [phonology.md](../grammar/phonology.md):
   - consonant table row: `y` | /j/ | *yes*;
   - the "Remember" tip now names only `x` as a false friend, plus one line: `y` is always a consonant, never a vowel;
   - letter names: `y` → `ya` (*yacht*);
   - alphabet order: `y` leaves the false-friend group and goes by place of articulation, between tongue tip and back (palatal sits between them): lips (b m w v), tongue tip (d n z l r), **`y`**, back (g h th), false friend (x). Update the order comment, the consonant table, the letter-name table, and any recitation text to match.
4. Check pages whose mnemonics reference the spelling `j` (e.g. "Germanic *j* as in *ja*") and rewrite them for `y`.

Exit: `npm run build` green (every Agalan span parses, morph glosses match).

### Phase 3 — Remaining non-lexicon cleanup

**Done notes:** the parser reads `y` and `j` as the same role letter and reports `y` (`Pos` returns `"y"`). Content roots still use `j`. Heading anchors whose slugs changed (`speech-moves.md#turn-j` → `#turn-y`, `plurality.md#vocatives-j` → `#vocatives-y`, the pronouns and terminology `/y/` headings) cannot get a server redirect, since `#hash` never reaches the server, and [site-redirects.md](../meta/site-redirects.md) rules out keeping old-slug ids, so old deep links land at the top of the page. Nothing stored outside the docs needed respelling: speech is synthesized in the browser from `src/tts/phonemes.ts`.

1. `AGENTS.md`: role-letter bullets (**`/j/`** = turn → **`/y/`**), orthography note.
2. Any public URL or anchor that contains a `j` role-letter or number form (e.g. a heading slug with `jael`) gets a redirect in [site-redirects.md](../meta/site-redirects.md).
3. Regenerate TTS / audio caches and flashcard data for the respelled turn and number words.

### Phase 4 — Respell the lexicon (batched retie)

Deferred as late as possible so it rides along with other pending lexicon respellings in **one** `convert-word` / `retie-docs` pass.

1. Add `j` → `y` to that batch: the 41 published roots containing `j` (`ejo`, `uju`, `ajara`, `ejeze`, …), plus stems and `sense_form` values in `data/lexicon-compounds.csv` and `data/lexicon-overlays.csv` that spell those roots. Check the batch for collisions with the other respellings in it.
2. `npm run retie-docs` (dry run), review, then `--write`.
3. Redirects for any anchors that contained a respelled root; regenerate audio / flashcards for them.

Exit: lexicon lint and `npm run build` green; retie dry run shows no English substrings touched.

### Phase 5 — Remove `j`

1. Drop `"j"` from `Pos`, the word grammar, and every letter list, so `j` becomes an unknown letter in native text (still fine inside `<…>` payloads).
2. Add a lint that fails on native-token `j` in `docs/` with a message pointing to `y`.
3. Remove the `TODO.md` line; move this proposal to done.

Exit: `npm test` and `npm run build` green with `j` rejected.

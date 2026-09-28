# Retie failures (lexicon revamp, 2026-09-28)

Editor notes. What went wrong when the revamped lexicon was retied into the repo (commit `0233521` *executed the retie*, then `ed2b9f9` *fully removed j*), grouped by cause. Each category lists what broke, an example, how it surfaced, and what would stop it happening next time.

Before the repair, `npm run build` failed with 752 morph-gloss issues, 136 word-bank issues, 61 unknown-word issues, 7 unparseable sentences / templates, 7 learning-order issues, 101 failing tests, and a broken `docs:publish`.

The map itself was sound: `tmp/lexicon-retie-map.json` pairs each emoji's old root with its new root. Almost every failure came from **where** the map was applied, **how** it was applied, or what it could not reach.

## 1. Chained substitution in `lexicon-compounds.csv`

**What broke.** The compound part columns were rewritten one pair at a time instead of all at once. A part moved to its new root, and a later pair then moved it again, because the new spelling was also some *other* row's old spelling.

| Compound | Should be | Got | Chain |
|----------|-----------|-----|-------|
| bedroom | bed + house `ahaza` | bed + `ahevo` *hand-of-fatima* | `ohohu` → `ahaza` → `ahevo` |
| raincoat | rain + coat `ogodu` | rain + `aguda` *crocodile* | `oja` → `ogodu` → `aguda` |
| textbook | school `uzugu` + book | `azawo` *sigh* + book | `ahala` → `uzugu` → `azawo` |
| writing-book | write `arada` + book | `arade` *rat* + book | `uwuru` → `arada` → `arade` |
| greenhouse | flower `avavu` + house | `eveve` *fairy* + `ahevo` | `ovowe` → `avavu` → `eveve` |

Seven of the eleven two-root compounds were wrong. The `stem` column was rebuilt from the wrong parts, so it matched nothing in the docs.

**How it surfaced.** Every lexical compound in the docs was an unknown word (`zabedelohohul`, `zadorolobelel`, …).

**Prevention.** Apply the map in one simultaneous pass: look each old token up once, and never feed a rewritten value back into the map. Add a check that every compound part's emoji and literal agree with its published row.

## 2. Doc compound stems not retied

**What broke.** The docs kept the old compound spellings (`zabedelohohul`, `zonogoleberel`, `zanunuloyal`, `zovowelohohul`, `zadorolobelel`). The retie only rewrites a word it can parse against the lexicon, and a compound stem is one opaque root that is not in the published map.

**How it surfaced.** Unknown-root and unparseable-sentence errors in x-compounds.md, word-endings.md, numeric-derivation.md and phonology.md.

**Prevention.** Build compound stem pairs (old stem → new stem) into the map from the compounds CSV before retieing the docs.

## 3. English words rewritten as Agalan

**What broke.** The retie also rewrites emphasised prose (`*…*`) that reads as Agalan. Short English words that happen to fit the root shape `V(CV)+`, optionally after a role letter, were treated as roots.

| English | Became | Why it matched |
|---------|--------|----------------|
| *one* | *ovavo* | old root `one` |
| *here* / *there* | *hedehu* / *thedehu* | `h` / `th` + old root `ere` |
| *bone* | *bovavo* | `b` + old root `one` |
| *wave* | *wozobo* | `w` + old root `ave` |
| *even* | *evevun* | old root `eve` + **-n** |
| *bagel* | *bezegol* | `b` + old root `age` + **-l** |

About 40 places across grammar and meta pages were affected, in prose, table cells and word-bank **English** columns.

**How it surfaced.** Only the word-bank cases were caught (*wozobo*, *bezegol*). The prose cases lint cleanly and needed a manual diff of the retie commit.

**Prevention.** Rewrite emphasised prose only when the whole run parses as an Agalan *sentence* or multi-word phrase, never a lone short word. Keep a stoplist of English words that fit the root shape. After a retie, list every changed word that appears in a common-English word list for review.

## 4. English names derived from Agalan spellings

**What broke.** A named **-n** word glosses as its own spelling, capitalised (`zonodan` → *Onodan*). Those English names live in morph lines and free English, which the retie does not touch.

- House cast: *Ululon* / *Uhubun* stayed while the Agalan became `zalahen` / `zahaben` (about 1,000 lines across 30 pages).
- One-off names: *Uzugon*, *Edozen*, *Uruzen*, *Ozorun*, *Oduna*-x-*Alanen*, *Ogove*-x-*Adeda*-x-*Unuden*, and others.

**How it surfaced.** Most of the 752 morph-gloss mismatches (`documented: z-Ululon`, `parser: z-Alahen`).

**Prevention.** Retie morph lines and free English for named forms: when a named word's root changes, rewrite its capitalised name wherever it appears on the page.

## 5. Quoted payloads in glosses

**What broke.** Mention and cite interiors are quoted verbatim in morph lines (`z-MENTION["odogo"]`) and free English (*the word “uzugo”*). The Agalan inside `{…}` / `[…]` was retied, but the quoted copies were not. Opaque interiors were not retied at all (`d[abugum#]` stayed on the old *flaw* spelling).

**How it surfaced.** Morph-gloss mismatches in spans.md and glosses.md.

**Prevention.** Retie quoted payloads in morph lines and quoted English alongside the span they copy. Treat a cite span's interior as Agalan unless it is fenced opaque.

## 6. Resume forms respelled wrongly

The retie handled **-r** resumes in three different wrong ways.

- **Short stem mapped as a root.** When the short stem is itself an old root, the map respelled it as that unrelated root instead of cutting the new antecedent: `zazar` (*Azawan*) became `zezor` in dependents.md.
- **Short resumes lengthened into full-root resumes.** Old two-syllable roots had a short cut equal to the whole root (`eje` → `vejer`). After respelling to a longer root, the same word became a full-root resume (`vahahar`, `delavar`). The parser then glosses `.full`, and the documented morph line no longer matches (8 examples in pronouns.md).
- **New prefix collisions.** New spellings made unrelated roots share a short stem. `zazar` now binds to *stand* (`azado`) instead of *Azawan* in intention.md, and `aba` (*ballot*) captures a short resume of `abuba…`.

**How it surfaced.** Morph-gloss mismatches (`z-←stand` where `z-←Azawan` was intended, missing `.full`), plus a failing test.

**Prevention.** Resolve each resume against its antecedent *before* the retie, then rebuild it from the new antecedent: same kind (short or full), recut from the new root. After the retie, re-resolve and flag any resume whose antecedent changed.

## 7. Examples whose point no longer holds

**What broke.** Some examples depend on a spelling coincidence that the new lexicon removed. The pronouns page taught full-root resumes with *sleep* and *big* sharing short **`ele`**. After the retie they are `ezeba` / `elava`, which share nothing, so the example no longer demonstrates anything. It still parses, so no lint caught it.

A related case is bare short resumes in prose (`zodor`, `dodor`, `godor`). Each inline code span is linted alone, so these only passed while the short stem happened to be a published root. After the retie they were unknown words.

**How it surfaced.** Unknown-root errors for the prose cases. The pronouns example was found only while reading the page.

**Prevention.** List every doc example that relies on two roots sharing a prefix, and recheck those by hand after any retie. The lint now accepts a short resume stem cut from a published root.

## 8. Hardcoded roots outside the retie's scope

**What broke.** The retie covers `docs/` and `lexicon-compounds.csv`. Source code that names specific roots was left on old spellings.

| Where | Stale content | Effect |
|-------|---------------|--------|
| `morph-gloss.ts` | house cast, short house stems, special pronouns (`ugobo` / `edone` / `aha` / `enenu`), `/x/` linkers, `awave` greeting | wrong glosses on every house name, pronoun and linker |
| `classify.ts` | `ARROW_ROOTS` | landmark laterals glossed as label scope |
| `learner-name.ts` | house cast, special pronouns, `DEFAULT_SELF_ROOT`, `LANGUAGE_ROOT`, suggested names | `SELF` slot filled with an unknown word; name suggestions pointed at dead roots |
| `template-trace.ts` | sample fillers (`vawalal`, `gonogo`, `olozo`, `eweze`, …) | every template failed to parse |
| `lint-agalan-docs.ts`, `retie/markdown.ts` | `SELF` fill `zugobon` | lint read the learner slot as unknown |
| `.vitepress` components | GlossViewer sample, NameHelper default | site showed unknown words |

**How it surfaced.** Most of the remaining morph-gloss mismatches, the template failures, and site text found by grep.

**Prevention.** Keep closed-form root spellings in one data file that the retie rewrites, or add a check that every quoted root in non-test source is still a published root. The check used for this repair scanned for string literals that match an old root with no current row.

## 9. Overlay rows respelled wrongly

**What broke.** Overlay `sense_form` values with a mid-word **`x`** were rewritten badly. The consent forms `uxerenel` / `uxononel` (role vowel **`u`** + **`x`** + root) became `ogexerenel` / `erexononel`: the mapped root replaced the role vowel and the old root stayed on the right. The correct forms are `uxogel` / `uxerel`. Separately, the ABIL overlay anchor still pointed at a heading renamed by the retie (`…-egera` → `…-aze`).

**How it surfaced.** The docs' `thuxogem` read as an ordinary role compound (`th-patient-x-green`) instead of `CONSENT-given`. There was also a learning-order error for an unresolved anchor.

**Prevention.** Parse each overlay `sense_form` with the word grammar and rebuild it through `retieCore`, the same way the docs are rewritten. Retie heading ids that contain Agalan, and every anchor that points at them, in the same pass.

## 10. Test fixtures and the `j` → `y` pass

**What broke.** Test files are outside the retie's scope, so about 90 fixtures kept old spellings. The later `j` → `y` commit changed old roots in some fixtures (`vajul` → `vayul`), which put them out of reach of the map, whose old roots still spell `j`.

**How it surfaced.** 101 failing tests, mostly `UnknownWordError`.

**Prevention.** Include string literals in `*.test.ts` in the retie, excluding tests of the retie tool itself, which use their own fixture maps. Do spelling-rule passes like `j` → `y` either before building the map or after the retie, never between the two.

## 11. Build break unrelated to spellings

`docs:publish` failed because the browser parser imported `isClarityRootShape` from `word-converter.ts`, which loads the CMU dictionary through `node:fs`. This is not a retie failure, but it landed in the same window. The function now lives in `src/root-shape.ts`, which has no Node imports.

## Open question

[language-name.md](language-name.md) now says the glasses root is `agaza`, while the language is still called **Agalan**. The retie respelled the root, but it cannot rename the language. The learner-name ban list now uses `agaza`. Decide whether the name should follow the root or the root should be restored.

## Checklist for the next retie

1. Apply the map simultaneously (no chains), including in the compounds CSV and overlay rows.
2. Add compound-stem, named-gloss and quoted-payload pairs to the map.
3. Rebuild resumes from their antecedents, then re-resolve and diff.
4. Retie source-code root tables and test fixtures, or move them into data the retie already covers.
5. Review every changed word that is also an English word.
6. Recheck examples that depend on two roots sharing a prefix.
7. Run `npm run build` and compare issue counts with the pre-retie baseline.

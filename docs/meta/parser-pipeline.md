# Parser pipeline

<!-- retie: skip -->

**Status:** CURRENT  
**Design authority:** [`docs/grammar/`](../grammar/introduction.md) — parsers implement the docs; they do not define the language.

Library-first multi-stage parser for CLI checks, fixtures that lock the grammar docs, and later UI. Recursive / ordered-choice structure lives in Peggy and Chevrotain; TypeScript is wiring, table lookup, AST assembly, and a discourse post-pass.

## Goals

1. **Library-owned string and clause structure** — morphology, numbers, writing atoms, joins, spans, utterance framing.
2. **Thin custom layer** — lexicon/overlay classification, token adapters, AST assembly, orchestration, resolve.
3. **Doc sync** — mid-word **`x`** rule order mirrors [compounds.md](/compounds); number stems mirror [numbers.md](/numbers); sentence fences mirror [joins.md](/joins) / [spans.md](/spans) / [clause.md](/clause) / [dependents.md](/dependents).
4. **Testable stages** — morph fixtures, classify fixtures, sentence fixtures, and resolve fixtures fail independently.
5. **No design authority creep** — if a parse fork is not in the docs, fix the docs or reject the input; do not paper over with backtracking across stages.
6. **Form, not meaning** — the parse serves tools that need how a sentence is written; a tool that needs what it says reads readings ([parse or reading](interpreter.md#parse-or-reading)).

## Non-goals (still out)

- Multi-document / conversation-level discourse (this pipeline resolves within one `parse(text)` call).
- Checking fill-ask *answers* against prior gaps.
- Treating the parser as a substitute for grammar docs.
- In-house PEG combinator kits as the foundation.

## Stack

| Layer | Library | Role |
|-------|---------|------|
| Word morph, number stems, writing forms | **[Peggy](https://peggyjs.org/)** | Ordered choice matches the [compounds decision order](/compound-families#decision-order); generates JS + `.d.ts` at build time |
| Sentence / joins / spans / stand-ins / framing | **[Chevrotain](https://chevrotain.io/)** | Grammar as TS; CST → sentence AST; operates on **typed word tokens**, not raw characters |
| Overlays and open roots | CSV → `Map` | [`lexicon-overlays.csv`](../../data/lexicon-overlays.csv), [`lexicon-published.csv`](../../data/lexicon-published.csv), [`lexicon-compounds.csv`](../../data/lexicon-compounds.csv) — classification, not parsing |
| Anaphor / question / SHARED resolve | [`src/parse/resolve.ts`](../../src/parse/resolve.ts) | Discourse over a finished AST |

**Rejected for the foundation:** Parsimmon / Arcsecond / `typescript-parsec`; Ohm as default; Chevrotain alone for character-level morph; a single mega-grammar for all stages.

## Pipeline

```text
Ageben text
    │
    ▼
┌──────────────────────────────────────┐
│  Peggy — src/parse/word.peggy        │
│  PoS / gl- / endings / -x            │
│  <> foreign, writing atoms, numbers  │
│  xFamily via alternation order       │
└──────────────────────────────────────┘
    │  MorphWord[]
    ▼
┌──────────────────────────────────────┐
│  classify() — Maps only              │
│  overlay (sense_form, pos)           │
│  published roots / compound lemmas   │
│  need-set                            │
└──────────────────────────────────────┘
    │  LexWord[]  →  Chevrotain IToken[]
    ▼
┌──────────────────────────────────────┐
│  Chevrotain — SentenceParser         │
│  /y/ turns, /x/ continue             │
│  right-close joins, islands          │
│  { } islands, stand-in dependents         │
└──────────────────────────────────────┘
    │  ParseResult.utterances
    ▼
┌──────────────────────────────────────┐
│  resolve() — discourse sidecar       │
│  -r anaphors, fill-ask vs yes/no     │
│  SHARED /ɡ/ or /h/ scale vs ordinary   │
└──────────────────────────────────────┘
    │
    ▼
ParseResult  (utterances + resolve)
```

Public entry: `parse(text)` in [`src/parse/index.ts`](../../src/parse/index.ts). CLI: `node scripts/parse.mjs 'zazawan vowogal.'` (several quoted inputs, or `-` for one per line on stdin)

### Stage 1 — Peggy (characters → `MorphWord`)

[`src/parse/word.peggy`](../../src/parse/word.peggy) → [`src/generated/word-parser.js`](../../src/generated/word-parser.js) via `npm run generate:word`. Wrapper: [`src/parse/word.ts`](../../src/parse/word.ts).

Owns every **string-shaped** subsystem:

- PoS prefix, left-bound **`gl-`**, reference ending, optional **-x**
- Foreign `PoS<…>ENDING` / opaque `PoS<…>` (no phonology inside `<>`)
- Free number words and writing shorthand ([numbers.md](/numbers))
- Role compounds take an ordinary-compound stem and one tail: ability (`/ɡ/` only) or label reach; `enforce` limits them to `/z/` `/d/` `/b/` `/ɡ/`, `/x/` (a topic word) and `/y/` + **-n** / **-r**
- Mid-word **`x`** families: rule alternation order = doc decision order (role → conversation length name+vowel+**-n` (citation or `/y/`) → hook prefix → value/try → numeric prefix → ordinary compound)
- Writing bracket atoms (`d@[…]`, `th(…)`, `d<…>`); a span has no spoken word shape
- Prefix-less [hooks](/hooks)

Semantic actions build a discriminated `MorphWord` only. **No lexicon calls inside Peggy.**

### Stage 2 — classify (tables → `LexWord`)

[`src/parse/classify.ts`](../../src/parse/classify.ts). Lookup order:

1. Overlay hit on `(sense_form, pos)` → closed special vocabulary reading
2. Else already-classified number stem → stay number
3. Else value/try vs [conversation length](/conversation-length#conversation-length) (named citation or `/y/` + **-n**) vs published root vs [hook compound](/hook-compounds#hook-compounds) (citation + extra-noun hook) vs dictionary-compound stem
4. Else unknown / foreign payload

This is where list verb vs soft clause **-n**, mood vs manner, value vs ability, etc. become **readings** without re-parsing spelling.

### Closed forms follow the lexicon
<a id="closed-forms-follow-lexicon"></a>

Hosted overlays (needs, evidentials, MAY, NOTIONAL, plan / DECISION, clause hinges, locatives, means, likeness *like*, exchange *for*, proxy *on behalf of*, of-relations, …) are **the published root** for that host (emoji / English literal) plus the overlay ending. When you **add** a closed overlay, pick an existing published row and spell that root plus ending (`ovu` + **-m** → **`ovum`**). Do **not** freeze a private spelling, do **not** coin a new lexicon word just to host the overlay, and do **not** put a productive stem (numeric derivation, role, values) in `sense_form`. If conversion reassigns *fishing*, witnessed **`thevom`** moves with **`evo`**. If conversion reassigns *attest*, live **`thodom`** moves with **`odo`**.

**Exception:** list verb / join-relation sense-forms (`an` / `en` / `aen` / …) and other **vowel-series** morphology (join fences, restrictor cores) are keyed by **`a` / `o` / `e` / `u`**, not by a lexicon row — those spellings stay. Do **not** add a hosted overlay whose `sense_form` is a join stem (`uan`, `an`, …) unless it is this vowel-series family.

### Overlay kinds
<a id="overlay-kinds"></a>

[`lexicon-overlays.csv`](../../data/lexicon-overlays.csv) has **`kind`** (taxonomy) and **`gloss`** (stable English tag). Not on published or compounds CSVs. `classify` maps `kind` → `LexReading`; morph gloss uses `gloss`. Host validation skips `list_verb` / `join_relation`.

| `kind` | `LexReading` | Inventory |
|--------|--------------------|-----------|
| `sake` | `sake` (on `x`+vowel hosts only) | eight sakes + unspecified; bare spelling is ordinary content |
| `ability` | `ability` | hostless **`ubo`** |
| `list_verb` | `listVerb` | vowel-series `/v/` **`an`** / **`en`** / … |
| `join_relation` | `joinRelation` | same stems on `/g/` `/h/` |
| `evidential` | `mood` | LIVE / MEMORY / … |
| `residue` | `mood` | RESIDUE **`amo`** |
| `former_climate` | `mood` | FORMER **`eno`** |
| `phasal` | `mood` | *already* **`oha`** / *still* **`age`** / *not yet* **`uze`** / *no longer* **`ewe`** |
| `may` | `mood` | MAY follow-up map (find out / default / who knows) |
| `notional` | `mood` | NOTIONAL follow-up map |
| `plan` | `mood` | map-resolution endings |
| `predict` | `mood` | **`edazo`** |
| `decision` | `mood` | DECISION changeability |
| `attempt` | `mood` | ATTEMPT commitment (**`udu`**) |
| `want` | `mood` | WANT lastingness |
| `cause` | `mood` | CAUSE **`ege`** |
| `clause_hinge` | `mood` | *if* / *only-if* / *iff* / *because* / *so-that* / *as-of* / … |
| `identity` | `mood` | IDENTITY **`ugo`** |
| `locative` | `locative` | *between* |
| `means` | `means` | *using* **`ahada`** |
| `likeness` | `likeness` | *like* **`ewe`** |
| `of_relation` | `ofRelation` | *part of* / *contents* / *material* / *origin* |
| `exchange` | `exchange` | *in-exchange-for* **`ehe`** |
| `proxy` | `proxy` | *on-behalf-of* **`ade`** |
| `stimulus` | `stimulus` | need about an unowned noun **`obu`** |
| `mirative` | `mood` | MIRATIVE expectation map (firm / default / loose) on **`ezu`** |
| `mention` | `mention` (a `gl-` word right before a written span only) | the mention marker, the *letters* root on **-l** (a word or phrase) and **-n** (a name-string); the bare spelling is the ordinary adjective |
| `clause_hinge` / `likeness` on `pos` **`cite`** | `sameRole` (inside a clause only) | same-role words *before* **`abam`**, *after* **`alam`**, *while* **`erom`**, *like* **`ewem`**, each on **-m** and **-l**: a citation with no role letter, written bare (no `cite` prefix) |

**`pos` `cite`** marks a same-role word (`same-role-words.md`): the overlay is written as its bare sense form, which every tool spells through `overlaySpelling` / `overlayPrefix` in [`classify.ts`](../../src/parse/classify.ts) (the retie, the cheat sheets, the English helper). A listed word is a same-role word only inside a clause, a sentence with a `/z/` `/d/` `/b/` `/v/` `/h/` or `/th/` word (`markSameRoleWords`, run by the tokenizer; the morph gloss takes it from the parse). Alone, or with only what describes it, it stays the root's ordinary citation (`abam.` *preparation*). The token class is `HookPlain` (branch `sameRole`); right before a `/z/` `/d/` `/v/` blank it is the `SameRolePair` unit, so the pair may come first.

Later splits of `mood` (token class, gloss tag) can follow this column without new English regexes. Special pronouns stay published + gloss, not this table, until they need a parse fork.

### Stage 3 — Chevrotain (typed tokens → sentence AST)

Adapter: [`src/parse/tokens.ts`](../../src/parse/tokens.ts) / [`src/parse/tokenize.ts`](../../src/parse/tokenize.ts) maps `LexWord[]` plus peeled `.`, leading tone-mark stacks (`!` `?` `%` `&` `;`, any order, each at most twice), and `{` / `}` → Chevrotain `IToken[]` (no second character lexer). `enforceTones` takes the tone marks out of the stream before the grammar runs and keeps a `ToneRecord` for each: the stack as written (`mark`), its `names`, its `scope` (`word`, `span`, `island`, `rest`), its place (`at`, the first word after it), and the `words` it colors; the resolve stage carries them on `ResolveInfo.tones` ([tone-marks.md](/tone-marks#showing-your-tone)). Grammar: [`src/parse/sentence-grammar.ts`](../../src/parse/sentence-grammar.ts).

Owns:

- Utterance framing ([speech-moves.md](/speech-moves) — `/y/` turns, including a written `/y/` span at the left edge ([spans.md](/spans#y-spans)), omissible default assertoric; [dependents.md](/dependents) — `/x/` continue)
- Right-close joins at phrase / VP / clause level (illegal left fence); a `/th/` stance word right before a rank join (`e` / `ue` / `oe`, **-l** / **-m**) is that fence's bar, an `NpItem` of kind `bar` ([bars.md](/bars#bars))
- `uom` right before a `/th/` stance word holds that stance (with its hosted `/b/`) as the hook unit's `zone`, job `zone`, at the left edge too: the stance the event goes against, not a stance on the claim ([sakes.md](/contrary-to#contrary-to-stance)). Enforce checks the zone kind (`zoneKind`)
- Adjunct islands **`{ … }`** (`IslandOpen` / `IslandClose` tokens); a mention marker before a topic span (`topicMarker`)
- Complex `/ɡ|h/` + `/b/`; `/w/` + `/b/` only for *as-of* overlays; floating `/h/` as adjuncts
- Matrix-final **stand-in** (`darl` / `barl`) + contiguous dependent; a stand-in inside that dependent opens its own, nested in it ([nested-dependents.md](/nested-dependents#nested-dependents)), and clause joins after it land in the innermost one
- `Clause.predicateAdj`: a verbless clause of one noun with one `/ɡ/`, then only `/h/` words, marks that `/ɡ/` as the clause's predicate, which the tree keeps in the noun's package ([predication.md](/predication#classification-property))

Before the grammar runs, `markContext` ([`src/parse/mark-context.ts`](../../src/parse/mark-context.ts)) retypes tokens by their neighbors, so the grammar needs no lookahead past one token. It runs the named passes of `CONTEXT_PASSES` in order, each reading the tokens as the passes before it left them.

A choice the grammar can make by place needs no pass. A verb that goes on a verb list (right after another verb or a `/v/` join, past its own item) keeps its `VPlainEnd` / `VPlainMore` type, and the verb-list rule reads it by where it stands. A pass retypes only the marked case: a noun-phrase stand-in (`OdoZ` / `OdoD` / `OdoB`) keeps its lexer type as a phrase of its own, and the `standIn` pass retypes it to `OdoZList` / `OdoDList` / `OdoBList` only when its run reaches a list's join. The retypes decided by the word before stay passes: a `bl-` word after its host, an amount, a scale, a factor, a zone, a hosted or late stand-in. Read by place, each of these words could also start the next phrase right there, which is an LR(1) conflict.

`npm run context-report` reruns each pass on every prefix of the distinct grammar examples and records, for each retype, how many tokens past the word the decision needed before it stopped changing (*ahead*). Each decision also has a *settles at* class:

- `itself`: the word before decides it, ahead 0.
- `word`: the next word decides it, by design.
- `join`: a join later in the sentence decides it, as a verb list settles at its second verb.

The class comes from one table in `src/parse/context-report.ts`, not from the saved counts. Stdout is the per-pass summary; the full report, with the *settles at* column and samples, goes to `tmp/logs/context-report.md`. `--save` writes the counts to `tmp/state/context-report.json`, and `--diff` prints only the counts that changed since the save.

#### Why the remaining passes stay
<a id="why-passes-stay"></a>

Each pass below retypes a word that stays ambiguous until a later word arrives. Trials that read each one by place in the grammar failed `grammar-check`'s LR(1) check, because a production had to choose before the deciding word:

| Pass (retypes) | LR(1) conflicts | Shape |
|---|---|---|
| `wLeaf` (`/w/` targets, 315) | 3,801 in 342 decisions | after a finished phrase, a `/w/` word starts a modifier run or attaches higher; the word after a run of any length decides |
| `glLean` (`gl-` lean, 38) | 678 in 150 | noun or package, and list-item close; the noun after the `gl-` word decides |
| `verbEnd` (`VPlainEnd` / `VPlainMore`, `JoinVEnd` / `JoinVMore`) | 1,892 in 55 | lone verb or list at the first verb, where the second verb may come any number of words later; the `/v/` join's *end* and *more* readings reduce on the same lookahead |
| `hosted` (`HostedBNoun`, `HostedBNumber`, `HostedOdo`, `LateOdo`, `Amount`, `HScale`, `BScale`, `Factor`, `HZone`, `HZoneHeld`, `HSharedV`) | 3 to 2,916 per family | after a host (or a rank join, a shared adverb, `HookHosting`), the same word could also start a new phrase; `Amount` is reduce/reduce, cardinal or adjective on the landmark |

`HookHosting` was not tried. In the examples the deciding word is never far (`npm run context-report`, 6,088 examples):

| Pass | Decided at the word | 1 ahead | 2+ ahead | Max |
|---|---|---|---|---|
| `hosted` | 1,025 | 279 | 0 | 1 |
| `verbEnd` | 3,145 | 25 | 8 | 3 |
| `glLean` | 2 | 33 | 3 | 2 |
| `wLeaf` | 79 | 222 | 16 | 3 |

So the conflicts come from runs the grammar allows to be any length, not from sentences a listener finds hard. There are three causes:

- **A modifier that leans on the word after its run** (`/w/`, `gl-`). Joins close on the right, so the parser can't tell whether the phrase before has ended until the run's target arrives. For `gl-` the choice is about the noun before it: a list item if the noun after the `gl-` word has the same role, a lone phrase if not.
- **No apposition settles a verb list at its second verb**, which may come several words later.
- **Hosting.** The deciding facts are in the words (`bl-`, `uom`, the join's series, the number kind), but the grammar also lets the hosted word start a new phrase in that spot. Every hosted retype is set by the word's own class and the word before it, except `HookHosting` and `HostedBJoined` (the next word, or the rest of the list) and `HZoneHeld` (`uom` two words back).

`HSharedV` also stays for a reason of its own. Without it, an `/h/` after a `/v/` join parses as an ordinary phrase after the verb list, like a `/d/` or `/b/` there, and the grammar is LR(1)-clean. But the adverb then lands among the clause's shared phrases instead of on the join, which gives a different tree (`zazozon vowurol veruvol val hahunom.`).

Alternatives considered and rejected:

- **Regroup after the parse:** parse the ambiguous stretch as neutral units and regroup them afterward. That is post-parse reshaping again, and it renames construction ids.
- **Change the forms:** a role-marked `gl-`, a `/w/` that agrees with its target, or a marker on a verb list's first verb. Each changes forms for a parser gain. Limiting verb lists to standalone or one-item joins makes acts with their own objects or recipients take a clause join, which repeats the subject. Allowing only bare-verb items leaves only the first verb with words of its own.
- **Lexer types for the hosting facts,** with chain variants per host kind (no new-phrase path right after the host). Neither this nor precedence changes a parse. Variants multiply the 36 or so unit-chain rules, and a missed path drops sentences silently: trials left 1 to 802 doc sentences with no tree.
- **A declared nearest-host precedence in `grammar-check`.** It weakens what the check proves, needs the tree count and Chevrotain to agree with every declaration, and cannot settle `Amount`, which is reduce/reduce.

Revisit precedence if later work keeps adding host kinds. Without it, each new host is one more `hosted` case and token type. With it, each is one declaration.

Recovery is off. Illegal left fences and binderless islands throw `SentenceParseError`.

### Word slots
<a id="word-slots"></a>

`data/word-slots.csv` is the slot table: for each word feature with a slot or ending rule (a sake word, label reach, a hook prefix, ability, plural **-x**, …), the PoS letters and endings it is allowed on, the rejection id that closes the rest, and the grammar anchor that teaches the rule. It reaches the parser in `ClassifyTables`, like the lexicon CSVs ([`src/parse/word-slots.ts`](../../src/parse/word-slots.ts)). `enforce` reads the `letters` column through `slotAllows` instead of keeping its own letter sets. Ending rules, and any condition the columns can't hold, stay in code; the row's `note` names the function that checks it.

### Stage 4 — resolve (AST → discourse sidecar)

[`src/parse/resolve.ts`](../../src/parse/resolve.ts). `parse(text)` always runs it; `resolve(result)` is also exported. Annotations sit on `ParseResult.resolve` — the Stage 3 tree is unchanged.

| Job | Rule |
|-----|------|
| Content **-r** | Most recent prior word with the identical whole stem (the letters between role letter and ending; a compound or hook compound only as a whole). With none, a lexicon stem is the one you both know; any other stem is rejected ([pronouns.md](/pronouns#resume-r)) |
| Role pointer | One anchor per clause body: its verb, or its `/ɡ/` predicate. Each anchor records the overt filler of every role (`/z/`, `/d/`, the extra party, the scene, the stacked-hook `/b/`s). **`a`**: core roles take the latest anchor with that role filled, other roles the latest anchor; **`o`**: the nearest earlier anchor whose core filler is a different referent; **`e`**: this clause's anchor. No referent is a rejection ([pronouns.md](/pronouns#role-pointers)) |
| Number **-r** / `g=+` | Most recent number with the same marker identity ([numbers.md](/number-markers#number-endings)) |
| Role **-r** | This instance of the matching event’s role (doer / place / undergoer / extra `/b/` party); most recent verb / event noun / relation / role compound with that whole stem. Non-resume is the lexical kind (*teacher* vs *the one teaching*) ([roles.md](/roles)) |
| Join **-r** under `yel` / `yem` | Fill-ask gaps in spoken order; none → yes/no ([questions.md](/questions)) |
| SHARED `/ɡ/` or `/h/` after a join | `scale` / `equative` / `distribute` / `collective` / `kind` / `ordinary` from join series + conjunct kinds (`/h/` is manner scale under rank / `oe`) |
| *Respectively* partner | `pairings`: each `wubam` list's `PairingRecord`, the other `a` lists in its unit list with as many items (the lists `enforceRespectively` checks, both from `joinParts`); several are kept, never picked between ([list-structure.md](/list-structure#respectively)) |

Skipped as anaphors: join **-r** (ask / unspecified-member), restrictors, values / ability ending channels, and every overlay whose family defines its own **-r** (the settled-to-passing grades, `because` share). Other closed roots resume with **-r** like content ([pronouns.md](/resume-sense#how-english-approximates-r)). Dangling resumes are recorded with no `antecedent` — they do not fail the parse.

SHARED classification is **structural** (join vowel + conjunct kinds). The lexicon CSV has no gradable column yet. Number ranges are hooks, not joins: the span reading (`isSpanHook`) is decided in the morph gloss from the endpoint number kinds.

## Custom code budget

| Allowed custom | Not allowed as “the parser” |
|----------------|-----------------------------|
| `classify` Map lookups + small PoS/ending branches | Recursive morph / number descent |
| `LexWord` → `IToken` adapter | Character-level backtracking toolkit |
| Peggy / Chevrotain action bodies that build AST nodes | Parallel hand fence-stack that duplicates Chevrotain rules |
| `resolve` walks over a finished AST | Re-parsing spelling to bind anaphors |
| `parse(text)` orchestration + CLI | Silent recovery that invents structure absent from docs |

Principle: **mature libraries parse; repo code classifies, assembles, and annotates.** If a rule is in `docs/grammar/`, it should appear as a Peggy/Chevrotain production, a CSV row, or an explicit resolve walk.

## Repo layout

```text
src/
  generated/word-parser.js       # Peggy output (+ .d.ts) — import this, do not generate at runtime
  parse/
    word.peggy                   # Peggy — morph + numbers + writing atoms
    word.ts                      # Stage 1 wrapper
    classify.ts                  # Stage 2
    tokenize.ts / tokens.ts      # peel .?! { } ; LexWord → IToken
    sentence-parser.ts           # Stage 3 entry: parser instance, parseSentenceTokens
    sentence-grammar.ts          # Stage 3 Chevrotain grammar class: rule fields, constructor, DSL handle
    grammar/                     # Stage 3 rule families, one definer each: clause, unit, np, vp, modifier, package
    sentence-shapes.ts           # Stage 3 shared head: error class, slot types and consts, error messages
    mark-context.ts              # before Stage 3: markContext retypes tokens by lookahead (CONTEXT_PASSES)
    context-report.ts            # npm run context-report: ahead and settles-at of each CONTEXT_PASSES decision
    sentence-build.ts            # after Stage 3: post-parse fixes, CST → AST
    hook-jobs.ts                 # each hook's job, decided once after Stage 3
    ast-walk.ts                  # the one AST visitor (resolve, enforce, inspect are handler sets)
    series.ts                    # join-series, scale and number helpers shared across stages
    enforce.ts                   # named rejections, entry point: enforceTokens, enforceResult, diagnoseParseError
    enforce-word.ts              # word-shape checks on the token stream, before Stage 3 (and tone marks)
    enforce-structure.ts         # structure checks on the AST, after Stage 3
    enforce-binding.ts           # binding checks on ResolveInfo, after Stage 4: tag, pointer, resume, as-of bound
    enforce-retired.ts           # RETIRED: retired shapes, one row per rejection id with its D-id
    word-slots.ts                # loader for data/word-slots.csv, the letters each feature is allowed on
    resolve.ts                   # Stage 4
    index.ts                     # parse(text)
    types.ts                     # MorphWord / LexWord / AST / ResolveInfo
    cli.ts                       # npm run parse
data/
  lexicon-overlays.csv
  lexicon-published.csv
  word-slots.csv
```

npm scripts: `generate:word` (Peggy); `build` (generate + `tsc`); `test`; `parse`. Chevrotain needs no generate step.

Library entry points, for a script or lint rule that reads Ageben:

- walk every Ageben code span in the docs: `walkAgebenSpans`, `classifyAgebenSpan` (`src/lint/ageben-docs.ts`)
- parse with tables: `parseWithTables` (`src/parse/parse-core.ts`), `loadDefaultTables` (`src/parse/index.ts`)
- visit words: `visitResult` (`src/parse/ast-walk.ts`)
- the site origin: `SITE_ORIGIN` (`scripts/lib/llms-txt.ts`)

## IR

Canonical types: [`src/parse/types.ts`](../../src/parse/types.ts).

- **`MorphWord`** — Stage 1: `pos`, `ending`, `plural`, `gl`, discriminated `family` (`content` / `number` / `x` / `reviser` / `joinMarker` / `writingSpan` / `foreign`).
- **`LexWord`** — Stage 2: `MorphWord` plus `reading`, optional `overlay` / `rootGloss`.
- **Sentence AST** — `Utterance` → `BodyClause` → `Clause` (`units`, optional stand-in `dependent`). A call, *yes* / *no*, or interjection closed by a period is its own utterance: the sentence after it opens a new one (`buildUtterances`, `afterTurnWord` in `sentence-build.ts`; [past a period](/sentence-linkers#past-a-period)). Units: NP/VP coords, predicate `/ɡ/`, `/h/`, written spans (as noun heads), islands, clause coords, revisers.
- **`ResolveInfo`** — `anaphors[]`, `asks[]` (`yesNo` / `fillAsk` / `none`), `shared[]` (`SharedRole`), and when present `answers[]`, `pairings[]`, `scope[]` (whole-clause frame order, `src/parse/scope.ts`; a rest-of-sentence tone is an `attitude` frame there), `tones[]` (`ToneRecord`), `carried[]` (`BodyCarry`, `src/parse/carry.ts`): for each later bare statement, the frames it inherits past a period, each a `CarriedFrame` `{ kind: "channel" | "holder" | "notional"; word; utteranceIndex; bodyIndex; offset?: { bound; amount? } }` pointing at the frame's word in the sentence that set it ([carry forward](/evidentiality#carry-forward)). A holder seam gives a `holder` entry and one for the channel or NOTIONAL it sits on (none for MAY); a dated channel's signed `/b/` is its `offset`. The carry starts on a statement's own whole-clause channel, NOTIONAL or holder; questions, commands and requests neither take nor end it; a new one of the three, a written statement word as the real act, *by the way* (`xavedam`), or a goodbye (as the resolver tells it from a hello) ends it. The record keeps one carry per speaker: `ParseOptions.speakers` names who says each sentence, in text order (one per body, or per bodiless utterance), so another speaker's reply neither takes nor ends a speaker's frame, and a goodbye ends every speaker's. With no `speakers`, the text is one speaker.

## Browser / bundle size

In-browser use is a **goal** (CLI and web share one pipeline). Peggy is **pre-generated**; do **not** call `peggy.generate()` in the page. Chevrotain ships browser ESM.

The docs site bundles the parser and lexicon search through Vite (`@parse-browser` / `@tts-browser` aliases in the VitePress config); there is no separate standalone page bundle. Expected parser page cost: Chevrotain (~31 KB gzip) + generated morph parser (~5–40 KB gzip) + classify/AST/resolve glue → on the order of **~40–80 KB gzip** before lexicon data.

## What is shipped vs leftover

**Shipped**

- Peggy word grammar covers orthography, numbers (writing + speech), and [compounds](/compounds) decision order.
- `classify` is table-driven from the lexicon CSVs. Overlay **`kind`** / **`gloss`** live on overlays only ([kinds](#overlay-kinds)).
- Chevrotain sentence grammar covers framing, right-close joins, islands, and **stand-in** dependents.
- Public `parse(text)` returns a typed AST plus `resolve`; fixture tests drawn from `docs/grammar/`.
- Peggy parser is pre-generated; `peggy` is a devDependency.
- No ANTLR artifacts.

**Not yet**

- Browser bundle of the parse pipeline.
- Lexicon column for gradable adjectives (SHARED `scale` vs ordinary `/ɡ/` is join-driven for now).
- Join-arity inventory checks beyond fence shape.
- Multi-turn discourse outside one `parse(text)` call.

## Risks

| Risk | Mitigation |
|------|------------|
| Peggy grammar drifts from docs | Fixtures quoted from grammar pages; fail CI on mismatch |
| Chevrotain LL(k) vs PEG morph | Morph finished before clause stage; clause tokens are already disambiguated |
| Overlay vs restrictor vs value same spelling | `classify` tables + PoS/ending; document any residual ambiguity as a language bug |
| Resolve over-binds (join `-r`, value `-r`) | Explicit skip list; fixtures that `zar` / `halorodoxar` are not content anaphors |
| Accidental Peggy-compiler-in-bundle | Generate at build time; do not import `peggy` from `src/parse/` |

## Cross-links

| Topic | Doc |
|-------|------|
| Clause grammar / `/y/` framing | [clause.md](/clause) |
| Dependents / `/x/` continue / stand-ins | [dependents.md](/dependents) |
| Hosted relations | [relations.md](/relations) |
| Mid-word **`x`** families | [compounds.md](/compounds) |
| Numbers | [numbers.md](/numbers) |
| Digitless and exponents | [digitless-exponents.md](/digitless-exponents) |
| Joins | [joins.md](/joins) |
| Spans | [spans.md](/spans) |
| Pronouns / **-r** | [pronouns.md](/pronouns) |
| Topic | [topic.md](/topic) |
| Questions / fill-ask | [questions.md](/questions) |
| Fill-ask roles | [fill-ask-roles.md](/fill-ask-roles) |
| Comparatives / SHARED scale | [comparatives.md](/comparatives) |
| Closed overlays | [lexicon](../grammar/lexicon.md) |
| Hooks | [hooks.md](/hooks) |
| Discourse hooks | [discourse-hooks.md](/discourse-hooks) |
| Readings, the log, matching, hosts, the loop | [interpreter](interpreter.md) |

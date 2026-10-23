# Proposal: realign amount-scale vowel series

**Status:** Phase 1 and Phase 2 absorbed. Later phases are still proposed.  
**Related:** [root tails](/root-tails#root-tails) (size), [joins](/joins#join-type-vowel-series), [speech acts](/speech-moves#speech-act-beginner), [polar stance](/questions#polar-stance), [hooks](/hooks), [extra nouns](/hooks#extra-noun), [sakes](/sakes#word-shape), [tag pronouns](/tag-pronouns#tag-pronouns), [vowel pitch](/phonology#vowel-pitch), [finger code](/finger-code), [digit syllables](/numbers#counts), [letter names](/phonotactics#letter-names), [conversation length](/compound-families#conversation-length), [ability](/can-and-cant#ability), [label scope](/label-seams#label-scope), [role compounds](/roles#one-time-or-a-practice), [role pointers](/pronouns#role-pointers), [say-word scope](/feelings-permission#say-scope), [landmark facing](/viewpoint#landmark-facing), [stacked scope](/label-seams#scope-stacks), [Claritish Labels](/claritish/labels) and [Can and can't](/claritish/can-and-cant), [D-40](../meta/design-decisions.md), [D-44](../meta/design-decisions.md), [D-49](../meta/design-decisions.md), [`scripts/find.mjs`](../../scripts/find.mjs) (`--map` / `--write`; `src/find/`).  
**Design authority:** none until absorbed into those pages. Parser summaries in [`src/parse/constructions.ts`](../../src/parse/constructions.ts) follow the pages.

## Idea

**a o e u** has two sibling **scales**: size is amount (biggest to smallest), order is sequence (first to fourth). This proposal puts every amount **series** on size, and retargets the join series so **how much list you are left with** is the same scale.

A series that reuses another series' leftover-logic **hangs on** it. Join hangs on size (leftover list). Act hangs on join (leftover-list work on claims). Hook hangs on join (leftover A in a slot). Extra-noun **is the hook spelling** after `/b/`. Conversation length hangs on size (how much talk is left) — that is the contrast that keeps act off size. Digit vowels hang on order (next unused vowel). Letter names are the **opposite of** the digit. [Vowel pitch](/phonology#vowel-pitch) hangs on order (first is low, fourth is high). The [finger code](/finger-code) vowel hand hangs on order: pinky first.

Terms, hang cues, and the tree: [Scales and series](#scales-and-series). Absorb in [Phases](#phases), biggest remap first.

| | **a** | **o** | **e** | **u** |
|--|-------|-------|-------|-------|
| Size (keep) | about your size or bigger | between your hand and you | no bigger than your hand | nothing you could measure |
| Pitch (keep, hangs on order) | low | mid-low | mid-high | high |
| Finger code vowel hand (keep, hangs on order) | 1 (pinky) | 2 | 3 | 4 |
| Order (keep) | first | second | third | fourth |
| Digit vowel (keep) | `ba` `za` `na` | `do` `vo` `mo` | `ge` `re` | `hu` `lu` |
| Letter name (keep, opposite of digit) | `u` (`bu`) | `e` (`de`) | `o` (`go`) | `a` (`ha`) |
| Join (do) | *and* (the list grows) | rank (membership stays) | choice (collapses to one) | *not* (the list disappears) |
| Act (do) | statement | command | question | prohibition |
| Hook (do) | *including* | *rather* | *instead* | *except* |
| Extra-noun (do) | *in* | *for* | *at* | *from* |
| Sake (do) | met / serves | motive | prescription (*ought*) | unmet / detracts |
| Root job (do) | holds or gathers | path / sequence | one whole thing | takes away |
| Pointer (do) | the other one (furthest) | this sentence | latest (closest) | unsaid |
| Tag (do) | first (A) | second (O) | third (E) | last (U) |

Read **a > o > e > u** as biggest to smallest, or as first to fourth (also low to high). Teach amount series in size order.

## Terms

Do not call these a **family**. That word already means parser `family=` (`joinMarker`, `hook`, `tag`, `say`), [compound families](/compound-families), and the English root in examples. Sweep commands still use `family=` as the find key.

| Term | Means | Example |
|------|--------|---------|
| **Letter order** | `a o e u` as a sequence | first to fourth vowel |
| **Scale** | one of two sibling readings of that order | **size** (amount: big → none), **order** (sequence: first → fourth) |
| **Series** | one four-cell English map | join, act, hook, extra-noun, scope, ability, pointer, sake, tag, digit |
| **Job** | a use of a series that does **not** get its own slogans | restrictors **are** join; feeling loci **are** extra-noun; role compounds **are** scope |
| **Cell** | one letter in one series | join **o** = rank |
| **Stack** | two-vowel composition **inside** a series | polar `yaol`, join `ae` |
| **Slot** | a vowel position on a word that can belong to a different series than another position | say-word **scope slot** vs **answer slot** |
| **Parent** | the series or scale whose letter-logic this series reuses | extra-noun’s parent is hook |

**Series vs job:** new series if a learner would learn a different four slogans (`in` / `for` / `at` / `from` is not `including` / `rather` / `instead` / `except`). Job if the slogans stay (`and` / rank / choice / `not` on a restrictor).

Name the **relation**, not a vague *follows*:

| Relation | When | Example |
|----------|------|---------|
| **is** | job uses the parent’s slogans on another host | restrictors **are** the join series |
| **hangs on** | own slogans; letters and leftover-logic come from the parent | act **hangs on** join |
| **same spelling as** | one form, another job | extra-noun **is the hook spelling** after `/b/` |
| **writes …, reads as** | letters from one series, composition from another | stacked scope **writes** scope, **reads as** join/hook |
| **opposite of** | each letter is the pair of another series | letter names **opposite of** digit vowels |

Two kinds of cue (both required; they are not interchangeable):

1. **Cell cue** — why this letter means this *here*. Stays in the Cue column ([cues live in tables](../meta/grammar-docs.md#cues-live-in-tables)).
2. **Hang cue** — why this series hangs on *that* parent, in one affirmative sentence. Owning-page lead, and a short gloss on the `vowels.md` tree. A cell slogan that would also fit the near-miss parent is not a hang cue.

**Phase**, **map**, and **sweep** are editor/implementation words. On absorb, [terminology.md](/terminology#vowel-series) “vowel series” (today: add / one / order / undo, prefix picks the table) becomes the **join series**.

## Phases

A **phase** is one session. Several commits inside a phase are expected. Do not start the next phase in the same session.

Bigger remaps go first, so a stop still leaves the amount scale in place. Grammar-letter swaps already parse; only which cell they name moves. Root-job last vowels (Phase 6) are a real respell.

Example Agebon is a `find.mjs --map` pass, not a hand edit and not `retie-docs`. `retie-docs` still only follows lexicon roots (Phase 6). Cue English, owning-page maps, hang cues, and D-40 / D-44 / D-49 prose stay hand work.

If tokens run low inside a phase: land **owning pages + parser**, then the `--write` (it is mechanical). Read the dry-run **skip** and **review** lines before writing (unparsed spans that still look like a hit, and matched words that could not splice). After a pairwise **o**/**e** swap, a missed example is the opposite English.

### Blast radius

Pin counts with `node scripts/find.mjs --word … --count` on the default paths (`docs/grammar` `docs/examples`), then the same flags with `src` `scripts` `docs/meta`. `--count` is matching **examples**, not replacements. A dry-run `--map` (no `--count`) prints one line per replacement; that is the write size. Re-pin at absorb: these numbers are from this draft.

`--count` with `--map` is the same match count, not a replacement count. Number `marker` treats writing and speech twins as the same job (`#` / `re`), so `--word marker=re --count` also matches writing `#`. For a speech-only remap, pin the dry-run replacement list, not the twin-inflated `--count`.

| Phase | Remap | Spec | docs examples → replacements | code examples → replacements | Why this order |
|-------|--------|------|------------------------------|------------------------------|----------------|
| 1 | Join (jobs that **are** join) | [Joins](#joins-acts-polar-do) | series 754 → 758; marker 566 → 261 | 215 → 219; 143 → 84 | The amount scale. Parser membership. |
| 2 | Act | [Act words and polar](#act-words-and-polar-follow) | act/polar 582 → 661; stand-in 91 → 91; say answer 96 → 96 | 234 → 249; 17 → 17; 20 → 20 | Hangs on join. Stand-in and say answers must move in the same session as the act letters. |
| 3 | Hook + extra-noun | [Hooks](#hooks-do), [Extra nouns](#extra-nouns-do) | hook 869 → 470; prefix 109 → 73; hooked form → 82; locus 377 → 67 | 601 → 356; 38 → 33; → 42; 80 → 21 | Same spelling, three jobs. *Whose* / contrary. |
| 4 | Scope | [Label scope](#label-scope-and-role-compounds-do) | role/scope 439 → 327; say scope 247 → 247; landmark 48 → 16 | 140 → 108; 53 → 55; 20 → 7 | **a**↔**u** on roles. Landmark dest `the` needs membership union `o`/`e` around the write. |
| 5 | Pointers + ability + conversation | [Pointers](#pointers-do), [Ability](#ability-do), [Conversation length](#conversation-length-do) | pointer 162 → 162; ability 88 → 43; greeting 38 | 102 → 104; 50 → 26; 13 | Remaining size letter-swaps. Split off scope so this session is two maps, not four. |
| 6 | Root job | [Root job](#root-job-do) | lexicon: 246 `one` + 282 `order` rows (19 + 18 three-letter). `retie-docs`, not find. | | Teach `--all` three-letter tails, then `SHAPE_VOWELS` / retie. Maybe the language name. |
| 7 | Hang cues + tags + cue tree | [Sake](#sake-stance-do), [Tags](#tags-do), [Finger code](#finger-code-keep), [Order](#order-keep) | tags 97 docs / 60 code (hand-edit A then O). Other series cue-only. | | Hang cues on every owning page. Letters already sit. |

Hook compounds are `xFamily=hookPrefix` (0 hits for `family=hookCompound`). Breakdowns used to decide the split live in the phase bodies.

Do not split Phase 1 into join vs number markers: `#` **is** rank. Do not split Phase 2: a session that moved `yol` but not `dorl` / say answers would teach two maps. Do not split Phase 3: extra-noun is the same spelling as the hook.

### Shared rules

- Owning pages first. Parser *reader* strings, series sets, and summaries follow the pages.
- Present the current language only on grammar pages.
- After any `sentence-parser.ts` rules or `markContext` change: `npm run grammar-check`.
- After every phase: `npm test` and `npm run build`.
- **Sweep:** pin `--count` on the source letter (**without** `--map`). Dry-run `node scripts/find.mjs --word … --map …` (default `docs/grammar` `docs/examples`, then the same flags with `src` `scripts` `docs/meta`; the walk skips `src/retie`). Then `--write`. Then `--count` the destination letter; it should match the pinned source (except number-marker twins, above). Maps run on the original parse, so `e:o,o:e` is a swap in one pass. `--write` leaves a span whose dest does not reparse and still writes the rest of the file (nonzero exit). If membership would reject the dest letter (`TIME_HOOKS`, `POINT_BACK_HOOKS`, `feelingLandmark`, …), widen that set to the union around the write, then shrink. Teaching stubs (`el …`, `A ol B`) rewrite; cue English still does not.
- **Find/replace bugs:** if a dry-run **review** line, a dest that does not reparse, a skip that looks like a hit, a `--count` that does not move with the map, or a slot the map cannot see, **fix `src/find/` and/or classify in that same phase** before hand-editing examples. Do not work around a mapper bug with a bulk hand edit. Then re-run the dry-run. Marker-stub, `SELF`, and landmark-facing slots already splice; do not re-open those as expected leftovers.
- **`OE`** below means write `e:o,o:e,ae:ao,ao:ae,ue:uo,uo:ue` on the field that phase names (`series`, `form`, `scope`, `locus`). **oe** and **ua** stay.
- Update the cheat-sheet **rows this series owns** in the same phase (row English by hand; Agebon in examples via `--map`). Hang cues and the [vowels.md](/cheat-sheets/vowels) tree wait for Phase 7.
- Do not retarget stacked scope or stacked extra-noun English to the new simplex letters. Letters follow **OE**; English stays.
- Each spec section below is what that phase implements. Later series still teach the old cells until their phase; that is expected.

### Phase 1 — Join (absorbed)

Implement the join simplex remap and every job that **is** a join. Leave act, hooks, extra-noun, scope, ability, conversation length, pointers, root job, and hang cues.

**Hang cue (join → size):** how much **list you are left with** (grows / stays / collapses to one / gone). Not order: rank is leftover membership, not first-to-fourth.

**Map:** **a** *and* (stays), **o** rank, **e** choice, **u** *not* (stays). Stacks: **ao**↔**ae**, **uo**↔**ue**; **oe** and **ua** stay. `zel` → `zol` (*more*). `zoel` stays. Unspecified `zor`↔`zer`, restrictors `hol`↔`hel`, join-acts `von`↔`ven`, join-relations `gon`↔`gen`, and those stacks. Number markers: `#` **e→o**, `_` **o→e**.

**Blast:** join **OE** 754 docs examples / 54 files / 758 replacements (code 215 / 23 / 219). Of those, `series=e` 324 docs (255 are role=`z`, the `zel` cluster), `series=o` 152, stacks `ae|ao` 114, `ue|uo` 164. Staying put: `oe` 111, `ua` 357. Marker speech 566 docs examples / 261 replacements (code 143 / 84). Writing stubs (`th#N`) match via twins and stay; they are not reviews.

**Parser:** [`RANK_SERIES`](../../src/parse/series.ts) / `BAR_SERIES` / `SCALE_SERIES` become **o** / **ao** / **uo** (/ **oe**). `KIND_SERIES` becomes **ua**, **ue**. `JOIN_SERIES` English and jobs. Tests that pin membership.

**Pages:** `joins.md`, `rank-joins.md`, `comparatives.md`, `comparative-arity.md`, `restrictors.md`, `more-occasions.md`, `number-markers.md`, `join-across-roles.md`, `stance-bars.md`. Cheat-sheet join rows on `joins-hooks.md`, `roles-comparing.md`, `numbers.md`. Hang cue in the join lead; cell Cue column as today.

**Sweep:**

```text
node scripts/find.mjs --word 'family=joinMarker,role!=y,reading!=standIn,reading!=standInBack,series=e|o|ae|ao|ue|uo' --map series=e:o,o:e,ae:ao,ao:ae,ue:uo,uo:ue
node scripts/find.mjs --word 'marker=re|ro|rue|ruo' --map marker=re:ro,ro:re,rue:ruo,ruo:rue
```

Includes restrictors, join-acts, join-relations, hooked-join **series** (the hook form waits for Phase 3), unspecified **-r**. Number-marker speech follows rank (`gredol` → `grodol`, `rue` ↔ `ruo`); writing `#` / `_` / `#-` / `#_` stay on the job. Do not map `#:_`. Calendar `roe` stays. Cue English on the owning page.

**Not this phase:** `yol` / `yel` / polar; hook `ol` / `el`; extra-noun *at* / *for*; role-compound scope; `SHAPE_VOWELS`.

**Commits:** (1) `series.ts` + tests; (2) owning pages + cell English; (3) `--map` dry run, `--write` join series on docs then `src` `scripts` `docs/meta`; (4) `--write` marker speech; (5) `grammar-check` / `npm test` / `build` fixes.

**Done when:** *more* is `zol`, parser rank series is **o**, marker speech `#`/`re` is rank **o**, and the sweep skip/review list is empty or reviewed.

### Phase 2 — Act (absorbed)

Act words, polar, stand-ins, rhetorical / quiz stacks, and say-word **answers** (not scope). Hangs on the join letters from Phase 1.

**Hang cue (act → join):** a speech act is leftover-list work on claims: add a claim, rank an instruction, collapse to an answer, take the act away. Not size: **how much talk remains** is conversation length (Phase 5). Polar **stacks two act vowels**. Stand-in **names the act of the next sentence**. Say-word **answer slot** is the act you license; the scope slot waits for Phase 4.

**Map:** `yal` statement, `yol` command (verb first), `yel` question (verb second), `yul` prohibition. Polar: `yaol` *yes*, `yael` *sure*, `yuol` *no*, `yuel` *not that*; `yual` / `yoel` stay. Soft endings ride along (`yaem` → `yaom`). Stand-ins: `dorl`↔`derl`. Say-word answers: **o** require, **e** their call; allow / forbid stay **a** / **u**. On a word that also has scope, change **only the answer slot** (`hwavem` → `hwavom`; scope waits for Phase 4). `stackKind`: rhetorical **a**/**e**, quiz **e**/**a**. Usual order stays tied to the act ([D-44](../meta/design-decisions.md)).

**Blast:** act/polar **OE** 582 docs examples / 48 files / 661 replacements (code 234 / 28 / 249). `yol` (today’s question) 320 docs / 131 code; `yel` 123 / 68; polar stacks 203 / 47. Stand-in **e|o** 91 / 17. Say answer **e|o** 96 / 20. Do not split: `dorl` and `hwavem` have to match the new act letters in the same session.

**Parser:** `stackKind` in `series.ts`. Construction readers for acts / polar / stand-ins. Game answer keys if they pin `yol` as question.

**Pages:** `speech-moves.md`, `questions.md`, `polar-inventory.md`, `speech-acts.md`, `sentence-linkers.md` (stand-in), say-word **answer** rows on `feelings-permission.md`, D-44 examples. Cheat sheet `talking.md`. Hang cue in the act lead (contrast conversation length).

**Sweep:**

```text
node scripts/find.mjs --word 'family=joinMarker,role=y,series=e|o|ae|ao|ue|uo' --map series=e:o,o:e,ae:ao,ao:ae,ue:uo,uo:ue
node scripts/find.mjs --word 'reading=standIn|standInBack,series=e|o' --map series=e:o,o:e
node scripts/find.mjs --word family=say --map answer=e:o,o:e
```

Say **scope** is not in the third map (`hwavem` → `hwavom`; `hwa…` waits for Phase 4).

**Commits:** (1) `stackKind` + tests; (2) owning pages + D-44; (3) `--write` act/polar; (4) `--write` stand-in + say answers + talking cheat-sheet Agebon; (5) verify.

**Done when:** `yol` commands, `yaol` is *yes*, and `--word family=joinMarker,role=y,series=o --count` is the old question count.

### Phase 3 — Hook and extra-noun

One spelling, three jobs. Same **o**/**e** swap as join, on prefix-less hooks only (not join `zol`).

**Hang cue (hook → join):** how much of **A is still in the slot** after B arrives (added / still A / replaced / none of B). Not size: you are changing membership of the slot, not measuring A.

**Hang cue (extra-noun → hook):** extra-noun **is the hook word** with `/b/` after it. Recast the landmark as the hook job: *in* = including a place; *for* = rather this aim; *at* = instead a point; *from* = except that landmark. Size pictures (volume / hand / point / none) help the cells; they must not choose the parent. Feeling loci **are** extra-noun.

**Map:** same-role / glue: `ol` *rather* / *In other words*, `el` *instead* / *Actually*; `al` / `ul` stay. Resume, prefixes, hooked joins, ranges: **ue** *outside A–B* → **uo**; **oe** *through* stays. Extra-noun: `ol` *for*, `el` *at*; `al` *in*, `ul` *from*. Stacks: keep English, letters follow **ao**↔**ae** and **uo**↔**ue**. *Whose* `em` → `om`; *near* `om` → `em`. Contrary `uem` → `uom`. Feeling loci follow extra-noun.

**Blast:** `family=hook` 869 docs examples / 61 files / 901 words, of which 470 replacements (code 601 / 55 / 642 words / 356 replacements). `ol|el` 148 docs; `om|em` 100. Prefix 109 docs / 73 replacements (code 38 / 33). Hooked-join **form** 82 docs replacements / 42 code — do **not** query bare `family=joinMarker` (that is 3287 docs examples, 82 hits). Filter `form=` to the letters that move. Sake locus 377 docs examples / 67 replacements (code 80 / 21): most sakes are `tha`/`thu`; the 67 are feeling loci.

**Parser:** `POINT_BACK_HOOKS`, `TIME_HOOKS`, `TIME_JOINS` if a listed spelling's job moved (**ol** / **el**, **or** / **er**, **om** / **em**). D-49 `uem` → `uom`. english-helper cases `at` / `for` / `using` / `whose`.

**Pages:** `hooks.md`, `extra-noun-hooks.md`, `discourse-hooks.md`, `ending-grids.md`, `hook-compounds.md`, `hooked-joins.md`, feeling-locus rows on `feelings-permission.md`. Cheat-sheet extra-noun / glue rows on `joins-hooks.md`. Hang cues in the hook lead and the extra-noun lead.

**Sweep:** prefix-less hooks, hook prefixes, and hooked-join **form** (join `zol` is `series`, not `form`). Feeling loci use `locus`, not `form`.

```text
node scripts/find.mjs --word 'family=hook|hookCompound' --map form=ol:el,el:ol,om:em,em:om,or:er,er:or,aol:ael,ael:aol,aom:aem,aem:aom,uol:uel,uel:uol,uom:uem,uem:uom,uor:uer,uer:uor
node scripts/find.mjs --word xFamily=hookPrefix --map form=ol:el,el:ol,om:em,em:om,aol:ael,ael:aol,aom:aem,aem:aom,uol:uel,uel:uol,uom:uem,uem:uom
node scripts/find.mjs --word 'family=joinMarker,form=ol|el|om|em|or|er|aol|ael|aom|aem|uol|uel|uom|uem|uor|uer' --map form=ol:el,el:ol,om:em,em:om,or:er,er:or,aol:ael,ael:aol,aom:aem,aem:aom,uol:uel,uel:uol,uom:uem,uem:uom,uor:uer,uer:uor
node scripts/find.mjs --word xFamily=sake --map locus=o:e,e:o,ao:ae,ae:ao,uo:ue,ue:uo
```

**oe** forms (`oel`, `oem`) stay (not in the map). `--seq family=hook,form=em 'role!=[zdb]' role=b` is the *whose* check after the write (`om`). `cases.tsv` and game keys move with the `src` `--write` path.

**Commits:** (1) parser hook sets + D-49; (2) owning pages; (3) `--write` hooks + prefixes; (4) `--write` hooked-join form + feeling loci; (5) verify *whose* / contrary / `ol bar`.

**Done when:** `ol bar` is *for whom?*, `el bar` is *where?*, `om` is *whose*, same-role `ol` is *rather*, and `--word family=hook,form=ol --count` is the old *instead* / *at* count.

### Phase 4 — Scope

Label scope, role compounds, say-word **scope** slot, stacked scope, landmark facing, D-40, Claritish Labels. Not pointers, ability, or conversation length.

**Hang cue (scope → size):** how **far the label reaches** (type / practice / pair / episode) — amount of scenes. Not join: a type is a bigger claim, not an *and*. Not order: tags are which person in a queue.

**Scope:** **a** type, **o** practice, **e** pair, **u** episode. Role compounds after **`w`**: beginner opens **u** then **o**; type **a** stays Intermediate. D-40 examples `zwuzuduyel` / `zwozuduyel`. Stacked scope: English stays; letters follow Phase 1 and 3 stacks. Say-word **scope** slot (answer slot already moved in Phase 2): `hwavam` → `hwuvam`, `hwavom` → `hwuvom`. Landmark facing **`tho` → `the`**; motive stays **`tho`**. Pointer **scope** on role pointers waits for Phase 5 (same `--map scope` there). Claritish Labels.

**Blast:** `xFamily=role|scope|hookPrefix` 439 docs examples / 24 files / 327 replacements (code 140 / 108). Roles 284 docs; hosted scope 46. Simplex **a|u** 172; **o|e** 127; stacks 24. Say scope 247 docs examples / 247 replacements (every say word has a scope slot; code 53 / 55). Landmark facing: `xFamily=lateral` 48 docs examples / 16 replacements (code 20 / 7). Pair scope is on `scope`; motive `tho` does not match. Dest `gazuhethel` still classifies as label scope until `landmarkLateral` accepts **e** (widen to the union around the write, then shrink).

**Pages:** `label-seams.md`, `roles.md`, `viewpoint.md` (landmark facing), say-scope rows, Claritish `labels.md`, D-40. Cheat sheets `word-shape-clause.md`. Hang cue in the label-scope lead.

**Sweep:** scope letters use **OE** plus **a**↔**u**. Do not `--map` pointer vowels (Phase 5) or every tag **e** (Phase 7).

```text
node scripts/find.mjs --word 'xFamily=role|scope|hookPrefix' --map scope=a:u,u:a,e:o,o:e,ae:ao,ao:ae,ue:uo,uo:ue
node scripts/find.mjs --word family=say --map scope=a:u,u:a,e:o,o:e,ae:ao,ao:ae,ue:uo,uo:ue
node scripts/find.mjs --word xFamily=lateral --map scope=o:e,e:o
```

The third command rewrites `gazuhethol` → `gazuhethel` and not motive `tho`. Widen `landmarkLateral` to **o** and **e** around that write, then shrink to **e**.

**Commits:** (1) `landmarkLateral` union **o**/**e**; (2) scope owning pages + D-40; (3) `--write` role/scope/hookPrefix + say-scope + stacked scope; (4) `--write` landmark facing, then shrink `landmarkLateral` to **e**; (5) Claritish Labels; (6) verify.

**Done when:** `zwuzuduyel` is *someone who teaches*, `hwuvam` is *you may*, `gazuhethel` is *behind the house*, and `landmarkLateral` reads pair scope **e** only.

### Phase 5 — Pointers, ability, conversation length

Everything that hangs on size **and still has a letter swap** after Phase 4. Pointer vowel is a three-cycle. Ability and conversation are **o**↔**e**. Two-slot role pointers (`zwuzer`) finish here: episode scope **u** plus the pointer cycle.

**Hang cue (pointer → size):** how **far the pointing reaches** (past the last person / this event / the last person / nobody). Not order: **tags** are the assignment queue.

**Hang cue (ability → size):** how much **can-do is in** (full / a dip / not yet / never). Not join: you are not combining options. Drop today’s add / one / order / undo cues (Claritish still uses them).

**Hang cue (conversation length → size):** how much **talk is left** (open / a stretch / one ask / none). Not join: remaining time, not list type. Today it sits in the join table on `vowels.md`.

**Pointer vowel:** **a** the other one, **o** themself, **e** latest, **u** unsaid. Combined with episode scope: `zwuzer` the latest doer. Ban **-m** share on **o** (was **e**).

**Ability:** `xo` can't right now, `xe` can't yet; default when unsure **xe**. Claritish `can-and-cant.md`.

**Conversation length:** `SELFxon` a few minutes, `SELFxen` one slot. Drop join cues.

**Blast:** pointers 162 docs examples / 23 files / 162 replacements (code 102 / 104) — every pointer moves. Ability 88 docs / 43 replacements (code 50 / 26). Greeting bids 38 of those docs examples; `SELF` slots rewrite in place (`SELFxen` → `SELFxon`).

**Pages:** `pronouns.md` (pointers), `can-and-cant.md`, `ability.md`, `compound-families.md`, Claritish `can-and-cant.md`. Cheat sheets `people-pointing.md` (pointer rows, not tags), `knowing-intending.md`. Hang cues in each lead.

**Sweep:** pointer vowel is a cycle, not a swap. Two `--map` flags on one pointer word apply to the original parse. Conversation-length bids are `xFamily=ability,reading=greeting`; the ability `stance` map covers them.

```text
node scripts/find.mjs --word xFamily=pointer --map scope=a:u,u:a,e:o,o:e,ae:ao,ao:ae,ue:uo,uo:ue --map pointer=a:o,o:e,e:a
node scripts/find.mjs --word xFamily=ability --map stance=e:o,o:e
```

**Commits:** (1) pointer owning pages; (2) `--write` pointers; (3) ability + conversation pages (drop join cues); (4) `--write` ability + greetings + Claritish; (5) verify.

**Done when:** `zwuzer` is the latest doer, `vezuyoxol` is *can't right now*, `SELFxon` is a few minutes.

### Phase 6 — Root job

Last vowel **hangs on join**: **`one`** → **e**, **`order`** → **o**. `holds` / `takes-away` stay. Middle vowel stays size.

**Hang cue (last vowel → join):** what the root **does to stuff** (gathers / travel the line / one piece / take away) — list operations. Size is the **middle** vowel (how big). Hook would predict the same letters; the parent is still join.

**Blast:** published lexicon 246 `one` + 282 `order` rows, including 19 + 18 three-letter roots. Compounds have no `shape` column; they follow the head via retie. Find does not rewrite this phase.

**Tooling first:** `--all` currently keeps three-letter roots, so a `SHAPE_VOWELS` flip would leave those 19 + 18 short *one* / *order* tails on the old last vowel. Change `convert-word` so `--all` rewrites those last vowels from `kind` + `shape` and keeps the first vowel (overlay uniqueness is the first two letters; a last-vowel swap does not need a re-place). Do not retarget three-letter rows by hand. Document that in [lexicon.md](../meta/lexicon.md).

**Then the usual remap:** point `SHAPE_VOWELS` at the new letters (`one` → **e**, `order` → **o**); `npm run convert-word -- --lexicon --all`; `npm run retie-docs` then `-- --write`; if the dry run prints `language name 👓 old → new`, `npm run rename-language` then `-- --write` in this same phase (glasses is `body` + `one`, `agebo` → `agebe`); `npm run english-helper-wordnet`; lexicon.md shape-letter map; `root-tails.md` including tail suffixes (`ye` not `yo` for *friend*); pegs (`npm test` fails on an empty 0–9 / 00–99 cell).

**Commits:** (1) `convert-word` three-letter tail rewrite + lexicon.md; (2) `SHAPE_VOWELS` + `convert-word -- --lexicon --all`; (3) `retie-docs --write`; (4) `rename-language --write` if needed; (5) wordnet + root-tails.md + pegs + tests.

**Done when:** `--all` remaps three-letter last vowels, a *one* root ends in **e**, an *order* root in **o**, retie has no leftover old tails, and pegs still fill 0–9 / 00–99.

### Phase 7 — Hang cues, sake cue, tags, vowels.md tree

Letters stay except tag **examples** (A then O, not A then E). Every owning page that this proposal retargets gets its **hang cue** in the lead (cell Cue columns already moved in earlier phases).

**Sake:** hang cue becomes size (how much of the sake is in). Forms stay: do not `--map stance` on `xFamily=sake`. `sakes.md`, `prescription.md`, `ought-for-a-sake.md`, cheat sheet `why-allowed.md`.

**Order:** digit-vowel hang cue moves from pitch to order (`numbers.md`). Letter names sit under digits as opposite (`phonotactics.md`). Vowel pitch hangs on order (`phonology.md`). Finger-code **vowel hand** hangs on order, pinky first; consonant hand does not (`finger-code.md`).

**Tags:** assign **a** first, **u** last. Hang cue: same **assignment queue** as digits, not amount of person and not pointer distance. Examples that tag A then E become A then O (`zwel` → `zwol`, `zwaer` → `zwaor`). Third is still E. Do **not** `--map pointer` or tag vowels globally (third is still E; assignment order is not a letter swap). Inventory with `--word family=tag --json`, then edit those examples by hand. Blast: 97 docs examples / 6 files / 120 words (code 60 / 8 / 102). `tag-pronouns.md`, people-pointing tag rows.

**Last:** write the cue tree onto [vowels.md](/cheat-sheets/vowels) as in [Scales and series](#scales-and-series), hang cue in each node label. Sweep leftover cheat-sheet cues (conversation length still under joins; ability still add / one / order / undo).

**Commits:** (1) hang cues + sake / order / pitch / digit / letter-name / finger-code; (2) tag examples from the `--word family=tag` list; (3) `vowels.md` tree + leftover cheat sheets; (4) `terminology.md` series/scale/hangs-on; (5) `npm test` / `build`.

**Done when:** the vowels cheat sheet shows the tree with hang cues, tags in examples are A then O, no grammar page still cues join as add / one / order / undo, and each series lead can tell its parent from the near-miss parent.

## Joins, acts, polar (do)

**a** and **u** stay. **o** and **e** swap on the join simplex.

Hang cue: how much list you are left with.

| | Now | Proposed |
|--|-----|----------|
| **a** | add (*and*) | add: the result is bigger |
| **o** | pick one | rank: membership stays, only order changes |
| **e** | rank | choice: the list collapses to one |
| **u** | *not* / *none of* | negation: the list disappears |

Stacks keep composing. **ao** (*and/or*) swaps with **ae** (*A, then B*). **uo** (*anything but*) swaps with **ue** (rank reversed). **oe** (tie) and **ua** (*everything but*) stay. Tie’s composition becomes rank-then-choice; **eo** is still not a stack.

*More* is the rank join: **`zel` → `zol`**. The equative **`zoel`** stays.

The same swap hits every join of occasions or of a stance toward a member: unspecified **`zor` ↔ `zer`**, restrictors **`hol` ↔ `hel`**, join-acts **`von` ↔ `ven`**, join-relations **`gon` ↔ `gen`**, and their **ao**/**ae** and **uo**/**ue** stacks. Number markers follow rank: **`#`** moves **e → o**, the digit-string marker **`_`** moves **o → e**.

Parser membership moves with the letters: [`RANK_SERIES`](../../src/parse/series.ts) / `BAR_SERIES` / `SCALE_SERIES` become **o** / **ao** / **uo** (/ **oe**). `KIND_SERIES` becomes **ua**, **ue**.

### Act words and polar follow

Hang cue: leftover-list work on claims. Column **Join** is the cell paraphrase of that parent, not a second scale.

| | Now | Proposed | Join |
|--|-----|----------|------|
| **yal** | statement | statement | add a claim |
| **yol** | question | command | rank: this is what to do |
| **yel** | command | question | choice: collapse to an answer |
| **yul** | prohibition | prohibition | none of the act |

Usual order stays tied to the *act*, not the letter: only a command starts with its verb ([D-44](../meta/design-decisions.md)). So **`yol`** commands with the verb first, **`yel`** asks with the verb second. A missed question still falls back to a statement.

Rhetorical / quiz stacks in [`stackKind`](../../src/parse/series.ts) are currently statement-over-question **a**/**o**. They become **a**/**e**.

Polar answers compose from the same vowels. *Yes* is add + command, *sure* is add + question:

| | Now | Proposed |
|--|-----|----------|
| **ae** `yael` | *yes* / *will do* | *sure* |
| **ao** `yaol` | *sure* | *yes* / *will do* |
| **ue** `yuel` | *no* / *I won't* | *not that* |
| **uo** `yuol` | *not that* | *no* / *I won't* |
| **ua** `yual` | doesn't apply | doesn't apply |
| **oe** `yoel` | *I won't answer* | *I won't answer* |

Beginner *yes* and *sure* swap spellings; *no* and *not that* swap. Soft and *for now* endings ride along (`yaem` *I think so* becomes `yaom`).

Stand-ins match acts: **`dorl`** *whether* → **`derl`**, **`derl`** *to* → **`dorl`**. Say-word *answers* match acts: **o** require (`hwavem` *you have to* → `hwavom` before scope), **e** their call. Allow and forbid stay **a** / **u**.

## Ability (do)

Hang cue: how much can-do is in. Reorder remaining ability down to none. Same **o** / **e** swap, on a different slot.

| | Now | Proposed | Size |
|--|-----|----------|------|
| **xa** | can | can | biggest: capability is in |
| **xo** | can't yet | can't, just for now (usually can) | medium: a dip, not a hole |
| **xe** | can't right now | can't yet | small: not there yet |
| **xu** | can never | can never | none |

Default when unsure moves with *can't yet*: use **xe**. Hostless **`oda`** takes the same vowels (`hodaxel` is then *can't yet*, `hodaxol` *can't right now*). Today's `zolazun vezuyoxel` (*can't sing right now*) becomes `zolazun vezuyoxol`.

Claritish: `drive-xo` a sprained ankle, `code-xe` hasn't learned yet.

## Conversation length (do)

Hang cue: how much talk is left. Drop the join cues. Swap **o** and **e**.

| | Now | Proposed | Size |
|--|-----|----------|------|
| **a** | open-ended | open-ended | biggest stretch |
| **o** | one slot | a few minutes | medium, still a talk |
| **e** | a few minutes | one slot | small: one ask |
| **u** | passing | passing | none |

Forms: `SELFxon` a few minutes, `SELFxen` one slot. At departure, **o** is leaving soon, **e** is about to leave.

The contrast with act: conversation length is remaining talk (size); act is what you do to the claim list (join).

## Label scope and role compounds (do)

Hang cue: how far the label reaches, biggest to smallest.

| | Now | Proposed | Size |
|--|-----|----------|------|
| **a** | this episode | a type across scenes | biggest claim |
| **o** | this pair | a practiced role | medium: a life you inhabit |
| **e** | a practiced role | this pair | small: one person in reach |
| **u** | a type | this episode | none: a speck of time |

Role compounds write the same vowels after **`w`**.

| Now | Proposed | English |
|-----|----------|---------|
| `zwazuduyel` | `zwuzuduyel` | *someone who teaches* (this once) |
| `zwezuduyel` | `zwozuduyel` | *a teacher* (practice) |
| `gwozuduyel blolazun` | `gwezuduyel blolazun` | *is a teacher to Olazun* |
| `zwuzuduyel` | `zwazuduyel` | *a teacher type* |

On a content root: `gunemuthal` *angry this time* becomes `gunemuthul`; `ganumuthul` *an anxious type* becomes `ganumuthal`; `golayothom blolazun` *a stranger to Olazun* becomes `golayothem`; `gwezuduyel` *is a teacher* becomes `gwozuduyel`.

**a** ↔ **u** and **o** ↔ **e** are pairwise swaps: every old spelling still parses, with the opposite reach. `zwazuduyel` left untouched would become *a teacher type*.

### Keep the one-act nudge

[D-40](../meta/design-decisions.md) still holds: every role word picks a scope, so one fight is not a fighter. **a** is now the wide claim, so do **not** teach it first. Beginner role compounds open with **u** (*someone who teaches*), then **o** (*a teacher*). Type **a** stays Intermediate. Update D-40's example spellings when absorbed (`zwuzuduyel` / `zwozuduyel`).

### Stacked scope: English stays, letters follow joins and hooks

Stacked scope **writes** scope letters and **reads as** join invert and hook. It does not hang on a third scale. Keep today's *English*. Join and extra-noun stacks swap **ao**/**ae** and **uo**/**ue**, so the letters follow: **ae** the situation (*over*), **ao** using the role, **oe** toward the role, **ua** except this episode, **ue** except this pair, **uo** off duty.

Today **ua** / **uo** happen to *look* like type (**u**) minus episode / pair. After simplex remap they will not: type is **a**, episode is **u**, and **au** is not a stack. **ua** still does *except this once* as join *everything but*. Do not retarget stacks to the new simplex letters.

### Other words that use label-scope vowels

Say-word *scope* is label scope. Say-word *answers* hang on act (above). Both slots can move in one word.

| Scope now | Proposed | Example now → proposed |
|-----------|----------|-------------------------|
| **a** this act | **u** this act | `hwavam` *you may* → `hwuvam`; `hwadam` *they agreed* → `hwudam`; `hwazal` a vow → `hwuzal` |
| **e** standing | **o** standing | `hwedam` standing consent → `hwodam`; `hwevam` standing permission → `hwovam` |
| **o** toward one party | **e** toward one party | `hwozal blahelan` a vow toward Ahelan → `hwezal`; `hwovam` *fine by me* → `hwevam` |
| **u** a type | **a** a type | `hwudam` *the type who's fine with it* → `hwadam` |

Require on this act: `hwavem` *you have to* → `hwuvom`. `hwadam` and `hwudam` swap meaning from scope alone.

Landmark facing is pair scope on a direction: **`tho` → `the`**. `gazuhethol blahehal` *behind the house* becomes `gazuhethel`. Arrow roots still take no other scope vowel. Motive stays **`tho`**, so landmark facing and motive no longer share a letter. The facing vowel is already on `scope`; Phase 4 still widens `landmarkLateral` to **o**/**e** around the write so dest `the` reparses as facing, not label scope.

Role pointers always write episode scope after **`w`**. That letter becomes **u**. Combined with the pointer vowels below, `zwazar` *the latest doer* becomes `zwuzer`.

## Pointers (do)

The pointer vowel (after the part consonant) is a separate series from scope. Hang cue: how far the pointer reaches.

| | Now | Proposed | Size as distance |
|--|-----|----------|------------------|
| **a** | latest (*again*) | the other one | furthest: skip the last person, reach past them |
| **o** | the other one | this sentence (*themself*) | medium: the event in your hands |
| **e** | this sentence (*echo*) | latest | closest: the last person, still in reach |
| **u** | unsaid | unsaid | none: no one was measured |

Drop **a** ≈ again / **e** ≈ echo / **o** ≈ other. **u** ≈ unsaid stays. **a**, **o**, **e** cycle; **u** does not move.

With episode scope **u**: `zwuzer` the latest doer, `zwuzar` the other one, `dwuzor` themself, `zwuzur` whoever it was. Today's `zwazar` left untouched would be *the other one*.

Beginner pointers open with **e** (*the latest*), then **a** (*the other one*). Themself **o** and unsaid **u** keep their current sections.

**-m** share currently bans **e** (a share cannot be part of the event being described). Ban **o** instead. **-l** *a new one* still has no **u**. Unsaid is still the **e** rule turned around: **e** skips a sentence with nobody in that part, **u** looks for exactly that sentence.

## Hooks (do)

Keep **one spelling, three jobs**. Same-role and discourse glue hang on join. Extra-noun is the third job of those same hooks ([Extra nouns](#extra-nouns-do)): **same spelling as** hook, not a hang on size.

### Same-role, glue, resume

Hang cue: how much of A is still in the slot.

| | Now | Proposed | Join |
|--|-----|----------|------|
| **a** `al` | *including* | *including* | bigger: B is added |
| **o** `ol` | *instead* | *rather* / *In other words* | same: still A, better wording |
| **e** `el` | *rather* | *instead* / *Actually* | one: B replaces A |
| **u** `ul` | *except* | *except* | none of B |

*Rather* keeps the referent (membership stays, like rank). *Instead* picks one other thing (like choice). Discourse glue and hook resume ride the same letters: `ol …` *In other words*, `el …` *Instead*; `or …` *As I said*, `er …` *Anyway*. Hook prefixes and hooked joins **are** hook (same hang cue).

Ranges on same-role hooks ([ending grids](/ending-grids#ranges)) use **ua** / **oe** / **ue**. **oe** *A through B* stays. **ue** *outside A–B* becomes **uo**.

## Extra nouns (do)

**Same spelling as** hook with `/b/` right after it. Same **o** / **e** swap as same-role. The extra-noun English is how those hook vowels read on a landmark.

Hang cue: recast the landmark as the hook job. Size pictures help cells; they are not the parent.

| | Now | Proposed | Hook |
|--|-----|----------|------|
| **a** `al` | *in* | *in* | *including*: B is added; a volume the event sits inside |
| **o** `ol` | *at* | *for* | *rather*: still this aim, person-scale, in your hands |
| **e** `el` | *for* | *at* | *instead*: a point in place of a volume |
| **u** `ul` | *from* | *from* | *except*: none of the landmark left; you left it |

*In* a house is including a place. *For* a family is rather-this-aim: a person you hold as the goal, not a room and not a pinpoint. *At* a table is instead-a-point: coincidence with a contact, no bigger than a hand. *From* a teapot is except: none of that landmark left at the event. *Since* stays **`ul`**: the starting time is the place you left.

*Where?* is then `el bar` (the point blank). *Where from?* stays `ul bar`. *For whom?* is `ol bar`.

Feeling loci **are** extra-noun: *in* (inside), *for* (on behalf), *at* (aimed), *from* (away).

**-m** frames keep the picture, looser: **`am`** *amid* (volume as setting), **`om`** in B's use (the aim already reached B), **`em`** *near* (the point as setting), **`um`** *away from*.

### Stacks still compose as today

Extra-noun stacks **write** hook letters and **read as** join stacks. Same rule as [stacked scope](#stacked-scope-english-stays-letters-follow-joins-and-hooks): keep today's English; the letters follow the simplex remap, which is the same **ao**/**ae** and **uo**/**ue** swap as joins.

| Stack | Now | Proposed |
|-------|-----|----------|
| **ao** | *on* / *over* | *using* / *by* |
| **ae** | *using* / *by* | *on* / *over* |
| **oe** | *toward* | *toward* (for then at; **eo** is not a stack) |
| **uo** | *through* | *against* / *contrary to* |
| **ue** | *against* / *contrary to* | *through* |
| **ua** | *out of* | *out of* |

The costly two:

- [Whose](/extra-noun-hooks#genitive) **`em`** (*in B's use*) becomes **`om`**. Today's **`om`** *near* becomes **`em`**.
- [Contrary to](/sakes#contrary-to-stance) **`uem`** becomes **`uom`**. [D-49](../meta/design-decisions.md) cites `uem` in front of a say word; that spelling would then be *through* as a frame.

## Sake stance (do)

Hang cue: how much of the sake is in. Letters stay.

| | Now | Proposed | Size |
|--|-----|----------|------|
| **`tha`** | met / serves | met / serves | biggest: the payoff is in |
| **`tho`** | motive | motive | medium: you are doing it for this sake |
| **`the`** | prescription (*ought*) | prescription (*ought*) | small: you only have the advice |
| **`thu`** | unmet / detracts | unmet / detracts | none: you do not have it |

Beginner still only needs the ends: **`tha`** met, **`thu`** unmet. Motive is more “have” than prescription: the act is happening for the sake, versus only being told it ought to.

**`the`** is *ought this act for this sake*: advice, not yet yours. **`tho`** is *doing for this sake*: a description, not a *should*. A command still tells someone to act without naming a sake; prescription names the sake. Ending tables and feeling tails stay on these letters.

Forms stay: `thawathum` *detracts from relatedness*, `thawothem` *ought, offered, for relatedness*, `thawothom` *talks to feel connected*, `thawatham` *serves relatedness*.

## Root job (do)

The [middle vowel](/root-tails#root-tails) hangs on size (keep): how big the named thing is. The last vowel hangs on join, not size and not hook. The owning page already says it uses the same series as [joins](/joins): **a** add, **o** one, **e** order, **u** undo. After the join remap that is **a** add, **o** rank, **e** choice, **u** *not*.

In [`SHAPE_VOWELS`](../../src/root-tails.ts), **`one`** becomes **e** (choice: one compact thing) and **`order`** becomes **o** (rank: a path, membership stays). The `shape` column keeps those names. **`holds`** and **`takes-away`** stay **a** / **u**.

| Last vowel | Now | Proposed | Join |
|------------|-----|----------|------|
| **a** | holds or gathers | holds or gathers | *and*: containers, groups, masses grow |
| **o** | one whole thing | order: a path, sequence, stage, or cycle | rank: the line stays, you travel it |
| **e** | order / path | one whole thing: round or compact | choice: collapses to one piece |
| **u** | takes away | takes away | *not*: cuts, removes, harms |

Fallback outline follows the letters: hollow **a**, long **o** (a road), round **e** (an apple, a cat), sharp **u**. Feelings: toward others **a**, along a standing or what comes next **o**, inward **e**, against **u**. Actions: with others **a**, along a course **o**, once on the spot **e**, stops or hurts **u**. Tie order is unchanged: try **u**, then **a**, then **o** (the old “then **e**” for path).

Tail suffixes follow: *friend* (*hug* + person, one thing marked by the left) is **`ye`**, not **`yo`**.

Change `convert-word` so `--all` rewrites three-letter last vowels from `shape` (keep the first vowel); then point `SHAPE_VOWELS` at the new letters, run `npm run convert-word -- --lexicon --all`, then `retie-docs`. Do not re-place those short roots by hand. If the dry run prints `language name 👓 old → new`, run **`npm run rename-language`**: the glasses root is `body` + `one`, so its last vowel moves with this map. Pegs follow the consonants; `npm test` fails if a respelling empties a 0–9 / 00–99 cell.

## Tags (do)

Tags are still letter names (`zwar` is tag A). They do not measure. Hang cue: same assignment queue as [order](#order-keep) / digits — first unused tag is **a**, then **o**, then **e**, last **u**. Digit vowels hang on that same order (`ba` `do` `ge` `hu`). Letter names are the opposite of the digit, not the assignment order. The finger-code vowel hand counts the same way: pinky first is **a**, four fingers is **u**.

This is a teaching default, not a parse ban: a skipped tag still names that letter. Beginner and Intermediate examples that now tag A then E (`zwal` … `zwel`, pair `zwaer`) become A then O (`zwal` … `zwol`, pair `zwaor`). The six pair stacks stay; the everyday pair is the first two. The other tags follow the same pattern: third is E (`zwel`), fourth is U (`zwul`).

## Finger code (keep)

The [finger code](/finger-code#counting) adds no grammar. Only the **vowel hand** hangs on order: a run of 1 to 4 fingers from the pinky, first vowel to fourth. Pinky is **a**, four fingers is **u**. Opposite vowels are one finger against four. The consonant hand does not: it counts digit letters from the index.

Piano keys and guitar bass still climb with the count, because [vowel pitch](/phonology#vowel-pitch) also hangs on order (first is low, fourth is high). This proposal does not retarget the shapes. A piano that fell as the count rose, or shapes in alphabet order (`u a o e`), is already rejected.

Hang the vowel hand on the tree under order. The rest of the code (consonant hand, hooked runs, piano left-thumb hook) is not an order series.

## Order (keep)

[Digit vowels](/numbers#counts) hang on order. Hang cue: counting assigns the next unused vowel. The cycle **a o e u** is first, second, third, fourth: `ba` `do` `ge` `hu`, then the climb starts again (`za` `vo` `re` `lu` `na` `mo`). Today’s cue (they climb the vowel pitches) inverts the tree: pitch is how the count **sounds**, not the parent of digits. Letters stay. Tags use this same assignment.

[Vowel pitch](/phonology#vowel-pitch) hangs on order: first is low, fourth is high. It adds no meaning of its own. Pitch is Beginner; size is Advanced.

The finger-code **vowel hand** hangs on order: pinky first ([Finger code](#finger-code-keep)).

[Letter names](/phonotactics#letter-names) sit under digits as the [opposite vowel](/phonology#opposite-vowels). Each digit letter’s name keeps the consonant and takes the opposite (`a`↔`u`, `o`↔`e`), so naming a letter never sounds like counting. Reciting those ten names walks **u e o a** (`bu` `de` `go` `ha` …) as a consequence, not as a series. The rest of the alphabet continues that walk.

## Scales and series
<a id="families"></a>

The letter order **a o e u** has two sibling **scales**. Amount series hang on size. Digit vowels, tags, vowel pitch, and the finger-code vowel hand hang on order. Letter names are the opposite of the digit. Stacks compose inside their series.

| Series | Parent | Hang cue | **a** | **o** | **e** | **u** |
|--------|--------|----------|-------|-------|-------|-------|
| **Size** (scale) | — | how much is there | big | medium | small | none |
| **Order** (scale) | — | which slot in a count of four | first | second | third | fourth |
| **Join** | size | how much list is left | *and* (grows) | rank (stays) | choice (one) | *not* (gone) |
| **Act** | join | what you do to the discourse list | statement | command | question | prohibition |
| **Hook** | join | how much of A is still in the slot | *including* | *rather* | *instead* | *except* |
| **Extra-noun** | hook (same spelling) | landmark as the hook job | *in* | *for* | *at* | *from* |
| **Scope** | size | how far the label reaches | type | practiced role | this pair | this episode |
| **Ability** | size | how much can-do is in | can | can't right now | can't yet | never |
| **Pointer** | size | how far the pointing reaches | the other one | this sentence | latest | unsaid |
| **Sake** | size | how much of the sake is in | met | motive | prescription | unmet |
| **Tag** | order | same assignment queue as digits | first (A) | second (O) | third (E) | last (U) |
| **Digit** | order | next unused vowel | `ba` `za` `na` | `do` `vo` `mo` | `ge` `re` | `hu` `lu` |
| **Finger code** (vowel hand) | order | pinky-first count | 1 (pinky) | 2 | 3 | 4 |

Jobs under each series (no new slogans):

**Size** (how much is there)

- [Middle vowel](/root-tails#root-tails) — how big the named thing is
- [Ability](/can-and-cant#ability)
- [Pointer vowel](/pronouns#role-pointers)
- [Conversation length](/compound-families#conversation-length)
- [Sake stance](/sakes#word-shape)
- [Label scope](/label-seams#label-scope) / [role compound](/roles#one-time-or-a-practice) / [say-word scope](/feelings-permission#say-scope) / [landmark facing](/viewpoint#landmark-facing) / pointer *scope* slot

**Join** (*and* / rank / choice / *not*)

- [Join](/joins#join-type-vowel-series)
- [Stacked joins](/rank-joins)
- [Unspecified **-r**](/joins#unspecified-member-r-phrase)
- [Restrictor](/restrictors) / [more occasions](/more-occasions)
- [Comparative](/comparatives) / [equative](/comparatives#equatives)
- [Number marker](/number-markers#marker-vowel-referential-identity)
- [Join-act](/join-across-roles#join-act-verbs) / [join-relation](/join-across-roles#join-relations)
- [Root job](/root-tails#root-tails) (last vowel) / [tail suffixes](/root-tails#tail-suffixes)

**Act** (statement / command / question / prohibition)

- [Speech act](/speech-moves#speech-act-beginner)
- [Stand-in](/sentence-linkers#stand-in)
- [Say-word answer](/feelings-permission#say-words)
- [Polar](/questions#polar-stance) / [polar inventory](/polar-inventory)
- Rhetorical / quiz stacks

**Hook** (*including* / *rather* / *instead* / *except*)

- [Same-role hook](/hooks#including)
- [Discourse glue](/hooks#discourse-hooks)
- [Hook resume](/discourse-hooks#hook-resume)
- [Hook prefix](/hook-compounds#hook-prefixes) / [hooked join](/hooked-joins)
- [Ranges](/ending-grids#ranges)
- [Extra-noun](/hooks#extra-noun) / [stacked extra-noun](/extra-noun-hooks) / [feeling locus](/feelings-permission#emotion-compose)

**Order** (first / second / third / fourth)

- [Digit vowels](/numbers#counts)
- [Tag](/tag-pronouns#tag-pronouns) (assign **a** first, **u** last)
- [Letter names](/phonotactics#letter-names) (opposite of the digit)
- [Vowel pitch](/phonology#vowel-pitch) (first is low, fourth is high)
- [Finger code](/finger-code#counting) vowel hand (pinky first)

[Stacked scope](/label-seams#scope-stacks) writes scope letters but reads as join invert and hook. Stacked extra-noun writes hook letters and reads as join stacks. A say word is scope then act (`hwuvom`: this-act **u**, require **o**). A role pointer is scope then pointer (`zwuzer`: episode **u**, latest **e**).

## Remaining series

### Order — sibling of size

Size and order are sibling scales of **a o e u**: size is amount, order is sequence. Pitch adds no meaning of its own; it hangs on order (first is low, fourth is high). Digit vowels, tags, and the finger-code vowel hand use order. Letter names are the opposite of the digit. Pitch is Beginner; size is Advanced. Neither hangs on the other.

## What a learner then holds

Two sibling scales on **a o e u**: size biggest to smallest, order first to fourth. Each series has a hang cue for its parent, then cell cues for **a o e u**. Tags are letter names assigned first to last. Digit vowels hang on that same order. Letter names take the opposite vowel of the digit. Vowel pitch climbs with the count. The finger-code vowel hand counts from the pinky, first to fourth. Sake is how much of the sake is in: met, motive, prescription, unmet.

Opposite vowels still line up: **a** ↔ **u** is most ↔ none, and **o** ↔ **e** is the middle pair.

On the [vowels cheat sheet](/cheat-sheets/vowels), group by scale, then series, hang cue in the node label:

```
a o e u
├── size (how much is there)
│     ├── middle vowel (how big the thing is)
│     ├── ability (how much can-do is in)
│     ├── pointer vowel (how far the pointing reaches)
│     ├── conversation length (how much talk is left)
│     ├── sake (how much of the sake is in)
│     ├── scope (how far the label reaches)
│     │     ├── label scope
│     │     ├── role compound
│     │     ├── say-word scope
│     │     ├── landmark facing
│     │     ├── pointer scope slot
│     │     └── stacked scope (writes scope, reads as join / hook)
│     └── join (how much list is left)
│           ├── stacked joins
│           ├── unspecified -r
│           ├── restrictors / more occasions
│           ├── comparatives / equative
│           ├── number markers
│           ├── join-act / join-relation
│           ├── root job (what the root does to stuff) / tail suffixes
│           ├── hook (how much of A is still in the slot)
│           │     ├── same-role
│           │     ├── discourse glue
│           │     ├── hook resume
│           │     ├── hook prefix / hooked join
│           │     ├── ranges
│           │     └── extra-noun (same spelling; landmark as hook job)
│           │           ├── stacked extra-noun (writes hook, reads as join stacks)
│           │           └── feeling loci
│           └── act (what you do to the discourse list)
│                 ├── speech act
│                 ├── stand-in
│                 ├── say-word answer
│                 ├── polar / polar inventory
│                 └── rhetorical / quiz stacks
└── order (which slot in a count of four)
      ├── digit names (next unused vowel: ba do ge hu za …)
      │     └── letter names (opposite, so naming ≠ counting: bu de go ha zu …)
      ├── tags (same assignment queue: A first, U last)
      ├── vowel pitch (the count climbs: low → high)
      └── finger-code vowel hand (pinky-first count; consonant hand does not)
```

Every series in [Scales and series](#scales-and-series) is a leaf. Size and order are siblings. A say word is scope then act (`hwuvom`). A role pointer is scope then pointer (`zwuzer`).

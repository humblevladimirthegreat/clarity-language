# Proposal: realign amount-scale vowel series

**Status:** PROPOSED. Nothing here is absorbed.  
**Related:** [root tails](/root-tails#root-tails) (size), [joins](/joins#join-type-vowel-series), [speech acts](/speech-moves#speech-act-beginner), [polar stance](/questions#polar-stance), [hooks](/hooks), [extra nouns](/hooks#extra-noun), [sakes](/sakes#word-shape), [tag pronouns](/tag-pronouns#tag-pronouns), [vowel pitch](/phonology#vowel-pitch), [finger code](/finger-code), [digit syllables](/numbers#counts), [letter names](/phonotactics#letter-names), [conversation length](/compound-families#conversation-length), [ability](/can-and-cant#ability), [label scope](/label-seams#label-scope), [role compounds](/roles#one-time-or-a-practice), [role pointers](/pronouns#role-pointers), [say-word scope](/feelings-permission#say-scope), [landmark facing](/viewpoint#landmark-facing), [stacked scope](/label-seams#scope-stacks), [Claritish Labels](/claritish/labels) and [Can and can't](/claritish/can-and-cant), [D-40](../meta/design-decisions.md), [D-44](../meta/design-decisions.md), [D-49](../meta/design-decisions.md), [`scripts/find.mjs`](../../scripts/find.mjs) (`--map` / `--write`; `find-replace.md`).  
**Design authority:** none until absorbed into those pages. Parser summaries in [`src/parse/constructions.ts`](../../src/parse/constructions.ts) follow the pages.

## Idea

**a o e u** has two sibling readings: size is amount (biggest to smallest), order is sequence (first to fourth). This proposal puts every *amount* series on size, and retargets the join table so **how much list you are left with** is the same scale. Conversation length, the [middle vowel](/root-tails#root-tails), and sake follow size. Root-job last vowels follow join (the page already uses the join series). Act words, polar answers, and hooks follow join (speech, then join, then size). Extra-noun derives from hook: it is the `/b/`-after job of the same spelling. Digit vowels and tags follow order: assign **a** first, **u** last. Letter names sit under digits as the [opposite vowel](/phonology#opposite-vowels). [Vowel pitch](/phonology#vowel-pitch) follows order (first is low, fourth is high). The [finger code](/finger-code) vowel hand follows order: pinky first.

| | **a** | **o** | **e** | **u** |
|--|-------|-------|-------|-------|
| Size (keep) | about your size or bigger | between your hand and you | no bigger than your hand | nothing you could measure |
| Pitch (keep, follows order) | low | mid-low | mid-high | high |
| Finger code vowel hand (keep, follows order) | 1 (pinky) | 2 | 3 | 4 |
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

Which series sits in which family: [Families](#families). Size and order are siblings. Sake follows size. Tags, vowel pitch, and the finger-code vowel hand follow order. Letter names are the opposite of the digit.

Absorb in [Phases](#phases), biggest family first.

## Phases

A **phase** is one session. Several commits inside a phase are expected. Do not start the next phase in the same session.

Bigger families go first, so a stop still leaves the amount scale in place. Grammar-letter swaps already parse; only which cell they name moves. Root-job last vowels (Phase 5) are a real respell.

Example Agebon is a `find.mjs --map` pass, not a hand edit and not `retie-docs`. `retie-docs` still only follows lexicon roots (Phase 5). Cue English, owning-page maps, and D-40 / D-44 / D-49 prose stay hand work (`find-replace.md`).

If tokens run low inside a phase: land **owning pages + parser**, then the `--write` (it is mechanical). Read the dry-run skip list (unparsed spans) before writing. After a pairwise **o**/**e** swap, a missed example is the opposite English.

### Shared rules

- Owning pages first. Parser *reader* strings, series sets, and summaries follow the pages.
- Present the current language only on grammar pages.
- After any `sentence-parser.ts` rules or `markContext` change: `npm run grammar-check`.
- After every phase: `npm test` and `npm run build`.
- **Sweep:** pin `--count` on the source letter. Dry-run `node scripts/find.mjs --word … --map …` (default `docs/grammar` `docs/examples`, then the same flags with `src` `scripts` `docs/meta`; the write walk skips `src/retie`). Then `--write`. Then `--count` the destination letter; it should match the pinned source count. Unparsed spans stay on the dry-run skip list (review, then hand-fix). Maps run on the original parse, so `e:o,o:e` is a swap in one pass.
- **`OE`** below means write `e:o,o:e,ae:ao,ao:ae,ue:uo,uo:ue` on the field that phase names (`series`, `form`, or `scope`). **oe** and **ua** stay.
- Update the cheat-sheet **rows this family owns** in the same phase (row English by hand; Agebon in examples via `--map`). The [vowels.md](/cheat-sheets/vowels) cue tree waits for Phase 6.
- Do not retarget stacked scope or stacked extra-noun English to the new simplex letters. Letters follow **OE**; English stays.
- Each spec section below is what that phase implements. Later families still teach the old cells until their phase; that is expected.

| Phase | Family | Spec | Why this order |
|-------|--------|------|----------------|
| 1 | Join | [Joins](#joins-acts-polar-do) (join rows only) | The amount scale. Parser membership. ~230 `zel`. |
| 2 | Speech | [Act words and polar](#act-words-and-polar-follow) | Follows join. ~300 `yol`, ~90 `yel`. |
| 3 | Hook + extra-noun | [Hooks](#hooks-do), [Extra nouns](#extra-nouns-do) | Same spelling, three jobs. *Whose* / contrary. |
| 4 | Scope + other size letter-swaps | [Label scope](#label-scope-and-role-compounds-do), [Pointers](#pointers-do), [Ability](#ability-do), [Conversation length](#conversation-length-do) | **a**↔**u** on roles; remaining size letters. |
| 5 | Root job | [Root job](#root-job-do) | Teach `--all` three-letter tails, then `SHAPE_VOWELS` / retie. Maybe the language name. |
| 6 | Order cues + cue tree | [Sake](#sake-stance-do), [Tags](#tags-do), [Finger code](#finger-code-keep), [Order](#order-keep) | Cue-only (and tag examples). Letters already sit. |

### Phase 1 — Join

Implement the join simplex remap and every series that **is** a join. Leave speech, hooks, extra-noun, scope, ability, conversation length, pointers, root job, and order cues.

**Map:** **a** *and* (stays), **o** rank, **e** choice, **u** *not* (stays). Stacks: **ao**↔**ae**, **uo**↔**ue**; **oe** and **ua** stay. `zel` → `zol` (*more*). `zoel` stays. Unspecified `zor`↔`zer`, restrictors `hol`↔`hel`, join-acts `von`↔`ven`, join-relations `gon`↔`gen`, and those stacks. Number markers: `#` **e→o**, `_` **o→e**.

**Parser:** [`RANK_SERIES`](../../src/parse/series.ts) / `BAR_SERIES` / `SCALE_SERIES` become **o** / **ao** / **uo** (/ **oe**). `KIND_SERIES` becomes **ua**, **ue**. `JOIN_SERIES` English and jobs. Tests that pin membership.

**Pages:** `joins.md`, `rank-joins.md`, `comparatives.md`, `comparative-arity.md`, `restrictors.md`, `more-occasions.md`, `number-markers.md`, `join-across-roles.md`, `stance-bars.md`. Cheat-sheet join rows on `joins-hooks.md`, `roles-comparing.md`, `numbers.md`.

**Sweep:**

```text
node scripts/find.mjs --word 'family=joinMarker,role!=y,reading!=standIn,reading!=standInBack,series=e|o|ae|ao|ue|uo' --map series=e:o,o:e,ae:ao,ao:ae,ue:uo,uo:ue
node scripts/find.mjs --word 'marker=re|ro|rue|ruo' --map marker=re:ro,ro:re,rue:ruo,ruo:rue
```

Includes restrictors, join-acts, join-relations, hooked-join **series** (the hook form waits for Phase 3), unspecified **-r**. Number-marker speech follows rank (`gredol` → `grodol`, `rue` ↔ `ruo`); writing `#` / `_` / `#-` / `#_` stay on the job. Do not map `#:_`. Calendar `roe` stays. Cue English on the owning page.

**Not this phase:** `yol` / `yel` / polar; hook `ol` / `el`; extra-noun *at* / *for*; role-compound scope; `SHAPE_VOWELS`.

**Commits:** (1) `series.ts` + tests; (2) owning pages + cue English; (3) `--map` dry run, `--write` on docs then `src` `scripts` `docs/meta`; (4) `grammar-check` / `npm test` / `build` fixes.

**Done when:** *more* is `zol`, parser rank series is **o**, and the sweep skip list is empty or reviewed.

### Phase 2 — Speech

Act words, polar, stand-ins, rhetorical / quiz stacks, and say-word **answers** (not scope). Follows the join letters from Phase 1.

**Map:** `yal` statement, `yol` command (verb first), `yel` question (verb second), `yul` prohibition. Polar: `yaol` *yes*, `yael` *sure*, `yuol` *no*, `yuel` *not that*; `yual` / `yoel` stay. Soft endings ride along (`yaem` → `yaom`). Stand-ins: `dorl`↔`derl`. Say-word answers: **o** require, **e** their call; allow / forbid stay **a** / **u**. On a word that also has scope, change **only the answer slot** (`hwavem` → `hwavom`; scope waits for Phase 4). `stackKind`: rhetorical **a**/**e**, quiz **e**/**a**. Usual order stays tied to the act ([D-44](../meta/design-decisions.md)).

**Parser:** `stackKind` in `series.ts`. Construction readers for acts / polar / stand-ins. Game answer keys if they pin `yol` as question.

**Pages:** `speech-moves.md`, `questions.md`, `polar-inventory.md`, `speech-acts.md`, `sentence-linkers.md` (stand-in), say-word **answer** rows on `feelings-permission.md`, D-44 examples. Cheat sheet `talking.md`.

**Sweep:**

```text
node scripts/find.mjs --word 'family=joinMarker,role=y,series=e|o|ae|ao|ue|uo' --map series=e:o,o:e,ae:ao,ao:ae,ue:uo,uo:ue
node scripts/find.mjs --word 'reading=standIn|standInBack,series=e|o' --map series=e:o,o:e
node scripts/find.mjs --word family=say --map answer=e:o,o:e
```

Say **scope** is not in the third map (`hwavem` → `hwavom`; `hwa…` waits for Phase 4).

**Commits:** (1) `stackKind` + tests; (2) owning pages + D-44; (3) `--write` + talking cheat-sheet Agebon; (4) verify.

**Done when:** `yol` commands, `yaol` is *yes*, and `--word family=joinMarker,role=y,series=o --count` is the old question count.

### Phase 3 — Hook and extra-noun

One spelling, three jobs. Same **o**/**e** swap as join, on prefix-less hooks only (not join `zol`).

**Map:** same-role / glue: `ol` *rather* / *In other words*, `el` *instead* / *Actually*; `al` / `ul` stay. Resume, prefixes, hooked joins, ranges: **ue** *outside A–B* → **uo**; **oe** *through* stays. Extra-noun: `ol` *for*, `el` *at*; `al` *in*, `ul` *from*. Stacks: keep English, letters follow **ao**↔**ae** and **uo**↔**ue**. *Whose* `em` → `om`; *near* `om` → `em`. Contrary `uem` → `uom`. Feeling loci follow extra-noun. Size pictures are memory aids, not a second parent.

**Parser:** `POINT_BACK_HOOKS`, `TIME_HOOKS`, `TIME_JOINS` if a listed spelling's job moved (**ol** / **el**, **or** / **er**, **om** / **em**). D-49 `uem` → `uom`. english-helper cases `at` / `for` / `using` / `whose`.

**Pages:** `hooks.md`, `extra-noun-hooks.md`, `discourse-hooks.md`, `ending-grids.md`, `hook-compounds.md`, `hooked-joins.md`, feeling-locus rows on `feelings-permission.md`. Cheat-sheet extra-noun / glue rows on `joins-hooks.md`.

**Sweep:** prefix-less hooks and hook prefixes, not join `zol`.

```text
node scripts/find.mjs --word family=hook --map form=ol:el,el:ol,om:em,em:om,or:er,er:or,aol:ael,ael:aol,uol:uel,uel:uol,uom:uem,uem:uom,uor:uer,uer:uor
node scripts/find.mjs --word xFamily=hookPrefix --map form=ol:el,el:ol,om:em,em:om,aol:ael,ael:aol,uol:uel,uel:uol,uom:uem,uem:uom
```

**oe** forms (`oel`, `oem`) stay. `--seq family=hook,form=em 'role!=[zdb]' role=b` is the *whose* check after the write (`om`). english-helper `cases.tsv` is in the `src` `--write` path.

**Commits:** (1) parser hook sets + D-49; (2) owning pages; (3) `--write`; (4) verify *whose* / contrary / `ol bar`.

**Done when:** `ol bar` is *for whom?*, `el bar` is *where?*, `om` is *whose*, same-role `ol` is *rather*, and `--word family=hook,form=ol --count` is the old *instead* / *at* count.

### Phase 4 — Scope and the other size letter-swaps

Everything that follows size **and still has a letter swap**. Scope **a**↔**u** and **o**↔**e**; ability and conversation **o**↔**e**; pointer vowel is a three-cycle. Two-slot words (`hwuvom`, `zwuzer`) finish in this phase.

**Scope:** **a** type, **o** practice, **e** pair, **u** episode. Role compounds after **`w`**: beginner opens **u** then **o**; type **a** stays Intermediate. D-40 examples `zwuzuduyel` / `zwozuduyel`. Stacked scope: English stays; letters follow Phase 1 and 3 stacks. Say-word **scope** slot (answer slot already moved in Phase 2): `hwavam` → `hwuvam`, `hwavom` → `hwuvom`. Landmark facing **`tho` → `the`**; motive stays **`tho`**. Pointer **scope** is **u**. Claritish Labels.

**Pointer vowel:** **a** the other one, **o** themself, **e** latest, **u** unsaid. Combined with episode scope: `zwuzer` the latest doer. Ban **-m** share on **o** (was **e**).

**Ability:** `xo` can't right now, `xe` can't yet; default when unsure **xe**. Claritish `can-and-cant.md`.

**Conversation length:** `SELFxon` a few minutes, `SELFxen` one slot. Drop join cues.

**Pages:** `label-seams.md`, `roles.md`, `viewpoint.md`, `pronouns.md` (pointers), `can-and-cant.md`, `ability.md`, `compound-families.md`, say-scope rows, Claritish `labels.md` and `can-and-cant.md`. Cheat sheets `word-shape-clause.md`, `knowing-intending.md`, `people-pointing.md` (pointer rows, not tags).

**Sweep:** scope letters use **OE** plus **a**↔**u**. Pointer vowel is a cycle, not a swap. Two `--map` flags on one pointer word apply to the original parse. Conversation-length bids are `xFamily=ability,reading=greeting`; the ability `stance` map covers them.

```text
node scripts/find.mjs --word 'xFamily=role|scope|hookPrefix' --map scope=a:u,u:a,e:o,o:e,ae:ao,ao:ae,ue:uo,uo:ue
node scripts/find.mjs --word family=say --map scope=a:u,u:a,e:o,o:e,ae:ao,ao:ae,ue:uo,uo:ue
node scripts/find.mjs --word xFamily=pointer --map scope=a:u,u:a,e:o,o:e,ae:ao,ao:ae,ue:uo,uo:ue --map pointer=a:o,o:e,e:a
node scripts/find.mjs --word xFamily=lateral --map scope=o:e,e:o
node scripts/find.mjs --word xFamily=ability --map stance=e:o,o:e
```

Do not `--map` every tag **e** (Phase 6).

**Commits:** (1) scope owning pages + D-40; (2) `--write` scope + say-scope + landmark + stacked scope; (3) `--write` pointers; (4) `--write` ability + conversation length + Claritish; (5) verify.

**Done when:** `zwuzuduyel` is *someone who teaches*, `zwuzer` is the latest doer, `vezuyoxol` is *can't right now*, `SELFxon` is a few minutes.

If tokens run low: finish scope `--write` (commits 1–2) before ability, conversation, and pointers.

### Phase 5 — Root job

Last vowel follows join: **`one`** → **e**, **`order`** → **o**. `holds` / `takes-away` stay. Middle vowel stays size.

**Tooling first:** `--all` currently keeps three-letter roots, so a `SHAPE_VOWELS` flip would leave ~20 + ~18 short *one* / *order* tails on the old last vowel. Change `convert-word` so `--all` rewrites those last vowels from `kind` + `shape` and keeps the first vowel (overlay uniqueness is the first two letters; a last-vowel swap does not need a re-place). Do not retarget three-letter rows by hand. Document that in [lexicon.md](../meta/lexicon.md).

**Then the usual remap:** point `SHAPE_VOWELS` at the new letters (`one` → **e**, `order` → **o**); `npm run convert-word -- --lexicon --all`; `npm run retie-docs` then `-- --write`; if the dry run prints `language name 👓 old → new`, `npm run rename-language` then `-- --write` in this same phase; `npm run english-helper-wordnet`; lexicon.md shape-letter map; `root-tails.md` including tail suffixes (`ye` not `yo` for *friend*); pegs (`npm test` fails on an empty 0–9 / 00–99 cell).

**Commits:** (1) `convert-word` three-letter tail rewrite + lexicon.md; (2) `SHAPE_VOWELS` + `convert-word -- --lexicon --all`; (3) `retie-docs --write`; (4) `rename-language --write` if needed; (5) wordnet + root-tails.md + pegs + tests.

**Done when:** `--all` remaps three-letter last vowels, a *one* root ends in **e**, an *order* root in **o**, retie has no leftover old tails, and pegs still fill 0–9 / 00–99.

### Phase 6 — Order cues, sake cue, vowels.md tree

Letters stay except tag **examples** (A then O, not A then E).

**Sake:** cue becomes size (how much of the sake is in). Forms stay: do not `--map stance` on `xFamily=sake`. `sakes.md`, `prescription.md`, `ought-for-a-sake.md`, cheat sheet `why-allowed.md`.

**Order:** digit-vowel cue moves from pitch to order (`numbers.md`). Letter names sit under digits as opposite (`phonotactics.md`). Vowel pitch follows order (`phonology.md`). Finger-code **vowel hand** follows order, pinky first; consonant hand does not (`finger-code.md`).

**Tags:** assign **a** first, **u** last. Examples that tag A then E become A then O (`zwel` → `zwol`, `zwaer` → `zwaor`). Third is still E. Do **not** `--map pointer` or tag vowels globally (third is still E; assignment order is not a letter swap). Inventory with `--word family=tag --json`, then edit those examples by hand. `tag-pronouns.md`, people-pointing tag rows.

**Last:** write the cue tree onto [vowels.md](/cheat-sheets/vowels) as in [Families](#families). Group Size (middle vowel, sake) and Order (digits, tags, letter names as opposite, pitch, vowel hand) as siblings, then Join (including last-vowel job), Speech, Hook (including extra-noun), Scope, Ability, Pointer. Sweep leftover cheat-sheet cues.

**Commits:** (1) sake + order / pitch / digit / letter-name / finger-code cues; (2) tag examples from the `--word family=tag` list; (3) `vowels.md` tree + leftover cheat sheets; (4) `npm test` / `build`.

**Done when:** the vowels cheat sheet shows the tree, tags in examples are A then O, and no grammar page still cues join as add / one / order / undo.

## Joins, acts, polar (do)

**a** and **u** stay. **o** and **e** swap on the join simplex.

| | Now | Proposed |
|--|-----|----------|
| **a** | add (*and*) | add: the result is bigger |
| **o** | pick one | rank: membership stays, only order changes |
| **e** | rank | choice: the list collapses to one |
| **u** | *not* / *none of* | negation: the list disappears |

Stacks keep composing. **ao** (*and/or*) swaps with **ae** (*A, then B*). **uo** (*anything but*) swaps with **ue** (rank reversed). **oe** (tie) and **ua** (*everything but*) stay. Tie’s composition becomes rank-then-choice; **eo** is still not a stack.

*More* is the rank join: **`zel` → `zol`**. The equative **`zoel`** stays. Grammar docs mention **`zel`** about 230 times.

The same swap hits every join of occasions or of a stance toward a member: unspecified **`zor` ↔ `zer`**, restrictors **`hol` ↔ `hel`**, join-acts **`von` ↔ `ven`**, join-relations **`gon` ↔ `gen`**, and their **ao**/**ae** and **uo**/**ue** stacks. Number markers follow rank: **`#`** moves **e → o**, the digit-string marker **`_`** moves **o → e**.

Parser membership moves with the letters: [`RANK_SERIES`](../../src/parse/series.ts) / `BAR_SERIES` / `SCALE_SERIES` become **o** / **ao** / **uo** (/ **oe**). `KIND_SERIES` becomes **ua**, **ue**.

### Act words and polar follow

| | Now | Proposed | Size |
|--|-----|----------|------|
| **yal** | statement | statement | add a claim |
| **yol** | question | command | rank: this is what to do |
| **yel** | command | question | choice: collapse to an answer |
| **yul** | prohibition | prohibition | none of the act |

Usual order stays tied to the *act*, not the letter: only a command starts with its verb ([D-44](../meta/design-decisions.md)). So **`yol`** commands with the verb first, **`yel`** asks with the verb second. A missed question still falls back to a statement. Grammar docs mention **`yol`** about 300 times, **`yel`** about 90.

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

Reorder remaining ability down to none. That is the same **o** / **e** swap, on a different slot.

| | Now | Proposed | Size |
|--|-----|----------|------|
| **xa** | can | can | biggest: capability is in |
| **xo** | can't yet | can't, just for now (usually can) | medium: a dip, not a hole |
| **xe** | can't right now | can't yet | small: not there yet |
| **xu** | can never | can never | none |

Default when unsure moves with *can't yet*: use **xe**. Hostless **`oda`** takes the same vowels (`hodaxel` is then *can't yet*, `hodaxol` *can't right now*). Today's `zolazun vezuyoxel` (*can't sing right now*) becomes `zolazun vezuyoxol`.

Claritish: `drive-xo` a sprained ankle, `code-xe` hasn't learned yet.

## Conversation length (do)

Follows size, not join. Drop the join cues. Swap **o** and **e**.

| | Now | Proposed | Size |
|--|-----|----------|------|
| **a** | open-ended | open-ended | biggest stretch |
| **o** | one slot | a few minutes | medium, still a talk |
| **e** | a few minutes | one slot | small: one ask |
| **u** | passing | passing | none |

Forms: `SELFxon` a few minutes, `SELFxen` one slot. At departure, **o** is leaving soon, **e** is about to leave.

## Label scope and role compounds (do)

How *far* the claim reaches, biggest to smallest.

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

Stacked scope already says not to read a pair as the first simplex then the second. Keep today's *English*. Join and extra-noun stacks swap **ao**/**ae** and **uo**/**ue**, so the letters follow: **ae** the situation (*over*), **ao** using the role, **oe** toward the role, **ua** except this episode, **ue** except this pair, **uo** off duty.

Today **ua** / **uo** happen to *look* like type (**u**) minus episode / pair. After simplex remap they will not: type is **a**, episode is **u**, and **au** is not a stack. **ua** still does *except this once* as join *everything but*. Do not retarget stacks to the new simplex letters.

### Other words that use label-scope vowels

Say-word *scope* is label scope. Say-word *answers* follow acts (above). Both slots can move in one word.

| Scope now | Proposed | Example now → proposed |
|-----------|----------|-------------------------|
| **a** this act | **u** this act | `hwavam` *you may* → `hwuvam`; `hwadam` *they agreed* → `hwudam`; `hwazal` a vow → `hwuzal` |
| **e** standing | **o** standing | `hwedam` standing consent → `hwodam`; `hwevam` standing permission → `hwovam` |
| **o** toward one party | **e** toward one party | `hwozal blahelan` a vow toward Ahelan → `hwezal`; `hwovam` *fine by me* → `hwevam` |
| **u** a type | **a** a type | `hwudam` *the type who's fine with it* → `hwadam` |

Require on this act: `hwavem` *you have to* → `hwuvom`. `hwadam` and `hwudam` swap meaning from scope alone.

Landmark facing is pair scope on a direction: **`tho` → `the`**. `gazuhethol blahehal` *behind the house* becomes `gazuhethel`. Arrow roots still take no other scope vowel. Motive stays **`tho`**, so landmark facing and motive no longer share a letter.

Role pointers always write episode scope after **`w`**. That letter becomes **u**. Combined with the pointer vowels below, `zwazar` *the latest doer* becomes `zwuzer`.

## Pointers (do)

The pointer vowel (after the part consonant) is a separate series from scope. Use size as **how far the pointer reaches**.

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

Keep **one spelling, three jobs**. Same-role and discourse glue follow join. Extra-noun is the third job of those same hooks ([Extra nouns](#extra-nouns-do)), so it derives from hook, not from size.

### Same-role, glue, resume

How much of A is still in the slot:

| | Now | Proposed | Join |
|--|-----|----------|------|
| **a** `al` | *including* | *including* | bigger: B is added |
| **o** `ol` | *instead* | *rather* / *In other words* | same: still A, better wording |
| **e** `el` | *rather* | *instead* / *Actually* | one: B replaces A |
| **u** `ul` | *except* | *except* | none of B |

*Rather* keeps the referent (membership stays, like rank). *Instead* picks one other thing (like choice). Discourse glue and hook resume ride the same letters: `ol …` *In other words*, `el …` *Instead*; `or …` *As I said*, `er …` *Anyway*. Hook prefixes and hooked joins use these vowels too.

Ranges on same-role hooks ([ending grids](/ending-grids#ranges)) use **ua** / **oe** / **ue**. **oe** *A through B* stays. **ue** *outside A–B* becomes **uo**.

## Extra nouns (do)

Derives from hook: it is the same spelling with `/b/` right after it. Same **o** / **e** swap as same-role. The extra-noun English is how those hook vowels read on a landmark.

| | Now | Proposed | Hook |
|--|-----|----------|------|
| **a** `al` | *in* | *in* | *including*: B is added; a volume the event sits inside |
| **o** `ol` | *at* | *for* | *rather*: still this aim, person-scale, in your hands |
| **e** `el` | *for* | *at* | *instead*: a point in place of a volume |
| **u** `ul` | *from* | *from* | *except*: none of the landmark left; you left it |

*In* a house is including a place. *For* a family is rather-this-aim: a person you hold as the goal, not a room and not a pinpoint. *At* a table is instead-a-point: coincidence with a contact, no bigger than a hand. *From* a teapot is except: none of that landmark left at the event. *Since* stays **`ul`**: the starting time is the place you left.

Size pictures (volume / person-scale / point / none) help remember the landmark. They are not a second parent: extra-noun → hook → join → size.

*Where?* is then `el bar` (the point blank). *Where from?* stays `ul bar`. *For whom?* is `ol bar`.

Feeling loci follow extra-noun: *in* (inside), *for* (on behalf), *at* (aimed), *from* (away).

**-m** frames keep the picture, looser: **`am`** *amid* (volume as setting), **`om`** in B's use (the aim already reached B), **`em`** *near* (the point as setting), **`um`** *away from*.

### Stacks still compose as today

Extra-noun stacks are hook stacks. Same rule as [stacked scope](#stacked-scope-english-stays-letters-follow-joins-and-hooks): keep today's English; the letters follow the simplex remap, which is the same **ao**/**ae** and **uo**/**ue** swap as joins.

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

Follows size: **how much of the sake is in**. Letters stay.

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

The [middle vowel](/root-tails#root-tails) follows size (keep). The last vowel follows join, not size and not hook. The owning page already says it uses the same series as [joins](/joins): **a** add, **o** one, **e** order, **u** undo. After the join remap that is **a** add, **o** rank, **e** choice, **u** *not*. Hook would spell the same letters (it derives from join); the parent is join.

In [`SHAPE_VOWELS`](../../src/root-tails.ts), **`one`** becomes **e** (choice: one compact thing) and **`order`** becomes **o** (rank: a path, membership stays). The `shape` column keeps those names. **`holds`** and **`takes-away`** stay **a** / **u**.

| Last vowel | Now | Proposed | Join |
|------------|-----|----------|------|
| **a** | holds or gathers | holds or gathers | *and*: containers, groups, masses grow |
| **o** | one whole thing | order: a path, sequence, stage, or cycle | rank: the line stays, you travel it |
| **e** | order / path | one whole thing: round or compact | choice: collapses to one piece |
| **u** | takes away | takes away | *not*: cuts, removes, harms |

Fallback outline follows the letters: hollow **a**, long **o** (a road), round **e** (an apple, a cat), sharp **u**. Feelings: toward others **a**, along a standing or what comes next **o**, inward **e**, against **u**. Actions: with others **a**, along a course **o**, once on the spot **e**, stops or hurts **u**. Tie order is unchanged: try **u**, then **a**, then **o** (the old “then **e**” for path).

Tail suffixes follow: *friend* (*hug* + person, one thing marked by the left) is **`ye`**, not **`yo`**.

About 250 `one` tails and 280 `order` tails move, including ~20 + ~18 three-letter roots. Change `convert-word` so `--all` rewrites three-letter last vowels from `shape` (keep the first vowel); then point `SHAPE_VOWELS` at the new letters, run `npm run convert-word -- --lexicon --all`, then `retie-docs`. Do not re-place those short roots by hand. If the dry run prints `language name 👓 old → new`, run **`npm run rename-language`**: the glasses root is `body` + `one`, so its last vowel moves with this map. Pegs follow the consonants; `npm test` fails if a respelling empties a 0–9 / 00–99 cell.

## Tags (do)

Tags are still letter names (`zwar` is tag A). They do not measure. Assign them in [order](#order-keep): the first unused tag is **a**, then **o**, then **e**, last **u**. Digit vowels follow the same order (`ba` `do` `ge` `hu`). Letter names are the opposite of the digit, not the assignment order. The finger-code vowel hand counts the same way: pinky first is **a**, four fingers is **u**.

This is a teaching default, not a parse ban: a skipped tag still names that letter. Beginner and Intermediate examples that now tag A then E (`zwal` … `zwel`, pair `zwaer`) become A then O (`zwal` … `zwol`, pair `zwaor`). The six pair stacks stay; the everyday pair is the first two. The other tags follow the same pattern: third is E (`zwel`), fourth is U (`zwul`).

## Finger code (keep)

The [finger code](/finger-code#counting) adds no grammar. Only the **vowel hand** follows order: a run of 1 to 4 fingers from the pinky, first vowel to fourth. Pinky is **a**, four fingers is **u**. Opposite vowels are one finger against four. The consonant hand does not: it counts digit letters from the index.

Piano keys and guitar bass still climb with the count, because [vowel pitch](/phonology#vowel-pitch) also follows order (first is low, fourth is high). This proposal does not retarget the shapes. A piano that fell as the count rose, or shapes in alphabet order (`u a o e`), is already rejected.

Hang the vowel hand on the tree under order. The rest of the code (consonant hand, hooked runs, piano left-thumb hook) is not an order series.

## Order (keep)

[Digit vowels](/numbers#counts) follow order. The cycle **a o e u** is first, second, third, fourth: `ba` `do` `ge` `hu`, then the climb starts again (`za` `vo` `re` `lu` `na` `mo`). Today’s cue (they climb the vowel pitches) becomes: they follow order. Letters stay. Tags use this same assignment.

[Vowel pitch](/phonology#vowel-pitch) follows order: first is low, fourth is high. It adds no meaning of its own. Pitch is Beginner; size is Advanced.

The finger-code **vowel hand** follows order: pinky first ([Finger code](#finger-code-keep)).

[Letter names](/phonotactics#letter-names) sit under digits as the [opposite vowel](/phonology#opposite-vowels). Each digit letter’s name keeps the consonant and takes the opposite (`a`↔`u`, `o`↔`e`), so naming a letter never sounds like counting. Reciting those ten names walks **u e o a** (`bu` `de` `go` `ha` …) as a consequence, not as a family. The rest of the alphabet continues that walk.

## Families

The letter order **a o e u** has two sibling readings. A **family** is a set of series that share one reading of those letters. Stacks compose inside their family. Amount series follow size. Digit vowels, tags, vowel pitch, and the finger-code vowel hand follow order. Letter names are the opposite of the digit.

| Family | **a** | **o** | **e** | **u** |
|--------|-------|-------|-------|-------|
| **Size** | big | medium | small | none |
| **Join** | *and* (grows) | rank (stays) | choice (one) | *not* (gone) |
| **Act** | statement | command | question | prohibition |
| **Hook** | *including* | *rather* | *instead* | *except* |
| **Extra-noun** | *in* | *for* | *at* | *from* |
| **Scope** | type | practiced role | this pair | this episode |
| **Ability** | can | can't right now | can't yet | never |
| **Pointer** | the other one | this sentence | latest | unsaid |
| **Sake** | met | motive | prescription | unmet |
| **Tag** | first (A) | second (O) | third (E) | last (U) |
| **Finger code** (vowel hand) | 1 (pinky) | 2 | 3 | 4 |
| **Order** | first | second | third | fourth |

Which cue each series follows:

**Size** (big / medium / small / none)

- [Middle vowel](/root-tails#root-tails)
- [Ability](/can-and-cant#ability)
- [Pointer vowel](/pronouns#role-pointers)
- [Conversation length](/compound-families#conversation-length)
- [Sake stance](/sakes#word-shape)

**Join** (*and* / rank / choice / *not*)

- [Join](/joins#join-type-vowel-series)
- [Stacked joins](/rank-joins)
- [Unspecified **-r**](/joins#unspecified-member-r-phrase)
- [Restrictor](/restrictors) / [more occasions](/more-occasions)
- [Comparative](/comparatives) / [equative](/comparatives#equatives)
- [Number marker](/number-markers#marker-vowel-referential-identity)
- [Join-act](/join-across-roles#join-act-verbs) / [join-relation](/join-across-roles#join-relations)
- [Root job](/root-tails#root-tails) (last vowel) / [tail suffixes](/root-tails#tail-suffixes)

**Speech** (statement / command / question / prohibition)

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

**Extra-noun** (*in* / *for* / *at* / *from*; derives from hook)

- [Extra-noun](/hooks#extra-noun) / [stacked extra-noun](/extra-noun-hooks)
- [Feeling locus](/feelings-permission#emotion-compose)

**Scope** (type / practice / pair / episode)

- [Label scope](/label-seams#label-scope)
- [Role compound](/roles#one-time-or-a-practice)
- [Say-word scope](/feelings-permission#say-scope)
- [Landmark facing](/viewpoint#landmark-facing)
- Pointer *scope* slot

**Order** (first / second / third / fourth)

- [Digit vowels](/numbers#counts)
- [Tag](/tag-pronouns#tag-pronouns) (assign **a** first, **u** last)
- [Letter names](/phonotactics#letter-names) (opposite of the digit)
- [Vowel pitch](/phonology#vowel-pitch) (first is low, fourth is high)
- [Finger code](/finger-code#counting) vowel hand (pinky first)

[Stacked scope](/label-seams#scope-stacks) writes Scope letters but reads as Join invert and Hook. Stacked extra-noun writes Hook letters and reads as Join stacks. A say word is Scope then Speech (`hwuvom`: this-act **u**, require **o**). A role pointer is Scope then Pointer (`zwuzer`: episode **u**, latest **e**).

## Remaining series

### Order — sibling of size

Size and order are sibling readings of **a o e u**: size is amount, order is sequence. Pitch adds no meaning of its own; it follows order (first is low, fourth is high). Digit vowels, tags, and the finger-code vowel hand use order. Letter names are the opposite of the digit. Pitch is Beginner; size is Advanced. Neither hangs on the other.

## What a learner then holds

Two sibling maps on **a o e u**: size biggest to smallest, order first to fourth, read per family in the table above. Tags are letter names assigned first to last. Digit vowels follow that same order. Letter names take the opposite vowel of the digit. Vowel pitch climbs with the count. The finger-code vowel hand counts from the pinky, first to fourth. Sake is how much of the sake is in: met, motive, prescription, unmet.

Opposite vowels still line up: **a** ↔ **u** is most ↔ none, and **o** ↔ **e** is the middle pair.

On the [vowels cheat sheet](/cheat-sheets/vowels), group by family: Size (including middle vowel and sake) and Order (digits, tags, letter names as opposite, pitch, vowel hand) as siblings, then Join (including last-vowel job), Speech, Hook (including extra-noun), Scope, Ability, Pointer.

The cue tree Phase 6 writes onto `vowels.md`:

```
a o e u
├── size (big → none)
│     ├── middle vowel
│     ├── ability
│     ├── pointer vowel
│     ├── conversation length
│     ├── sake (met → motive → prescription → unmet)
│     ├── scope
│     │     ├── label scope
│     │     ├── role compound
│     │     ├── say-word scope
│     │     ├── landmark facing
│     │     ├── pointer scope slot
│     │     └── stacked scope (letters from scope, reading from join / hook)
│     └── join (and / rank / choice / not)
│           ├── stacked joins
│           ├── unspecified -r
│           ├── restrictors / more occasions
│           ├── comparatives / equative
│           ├── number markers
│           ├── join-act / join-relation
│           ├── root job (last vowel) / tail suffixes
│           ├── hook
│           │     ├── same-role
│           │     ├── discourse glue
│           │     ├── hook resume
│           │     ├── hook prefix / hooked join
│           │     ├── ranges
│           │     └── extra-noun
│           │           ├── stacked extra-noun
│           │           └── feeling loci
│           └── speech
│                 ├── speech act
│                 ├── stand-in
│                 ├── say-word answer
│                 ├── polar / polar inventory
│                 └── rhetorical / quiz stacks
└── order (first → fourth)
      ├── digit names (ba do ge hu za …)
      │     └── letter names (opposite: bu de go ha zu …)
      ├── tags (assign A first, U last)
      ├── vowel pitch (low → high)
      └── finger-code vowel hand (pinky first; consonant hand does not follow)
```

Every series in [Families](#families) is a leaf. Size and order are siblings. A say word is scope then speech (`hwuvom`). A role pointer is scope then pointer (`zwuzer`).

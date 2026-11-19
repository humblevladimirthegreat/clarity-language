# Why-links audit (D3)

Compares each branch of `whyFor` in `src/parse/inspect.ts` (its `href`) with the classification-table anchor of the key `wordKey` (`src/interpret/read.ts`) gives the same word. Report only; `whyFor` is unchanged.

Classes:

- **same**: same page (the whyFor link may be page-level or on a sibling anchor of that page).
- **purpose**: a different page, but the whyFor link is a live page or anchor that is the beginner or parent page for the topic, and the table owner is a deeper subpage.
- **drift**: the whyFor anchor is not on its page (the section moved to a subpage), or the link names the wrong topic for the key.
- **no row**: the table has no row for this word (read as an ordinary word), so nothing to compare.

A dead anchor still lands on the right page top, so it fails soft; it is drift because the link no longer reaches the section it names. Anchors were checked against `id=` and heading text on the stage pages.

`wordKey` returns only `holder`, `ability`, `pointer` for the `x` families; other `x` words read by their `lexReading` (`slot:*`, `lexReading:ordinary`). Where that happens the row cites the family row, which is the row `interpreter.md` gives the family.

| # | whyFor branch (word) | whyFor href | wordKey / table key | Table anchor | Class |
|---|----------------------|-------------|---------------------|--------------|-------|
| 1 | hooked join (`joinMarker` + hook) | `hooks#hooked-joins` | `joinSeries:*`; `word:hookedJoin` | `hooked-joins.md#hooked-joins` (advanced) | drift: `hooks.md` has no `hooked-joins` anchor |
| 2 | `x` family `sake` | `sakes` | `xFamily:sake` | `sakes.md#word-shape` | same |
| 3 | `lateral` with landmark | `roles#landmark-facing` | `xFamily:lateral` | `viewpoint.md#viewpoint-laterals` | drift: anchor now only on `viewpoint.md#landmark-facing` |
| 4 | `holder` | `knowing#holder` | `xFamily:holder` | `holder.md#naming-a-holder` | drift: no anchor on `knowing.md` |
| 5 | `lateral` | `roles#viewpoint-laterals` | `xFamily:lateral` | `viewpoint.md#viewpoint-laterals` | drift: anchor moved to `viewpoint.md` |
| 6 | `ability` family, greeting reading | `compounds#conversation-length` | `xFamily:ability` (family check runs before reading); `lexReading:greeting` is `word-endings.md#greeting` | `can-and-cant.md#ability` | drift: no anchor on `compounds.md` (lives in `conversation-length.md`); `wordKey` also says ability, not greeting |
| 7 | `ability` family | `intention#ability` | `xFamily:ability` | `can-and-cant.md#ability` | drift: no anchor on `intention.md` |
| 8 | `role` | `roles#role-compounds` | `xFamily:role` (word reads `slot:*`) | `roles.md#role-compounds` | same |
| 9 | `pointer` | `pronouns#role-pointers` | `xFamily:pointer` | `pronouns.md#role-pointers` | same |
| 10 | `hookPrefix` | `hooks#hook-prefixes` | `xFamily:hookPrefix` | `hook-compounds.md#hook-prefixes` (advanced) | drift: anchor only on `hook-compounds.md` |
| 11 | `writingSpan` | `spans` | `unit:writingSpan` | `spans.md#writing` | same |
| 12 | `numeric` prefix | `numeric-derivation#numeric-derivation` | `xFamily:numeric` | `numeric-derivation.md` | same |
| 13 | hook compound | `hooks#hook-compounds` | `wordFamily:hookCompound` | `hook-compounds.md#hook-compounds` (advanced) | drift: anchor only on `hook-compounds.md` |
| 14 | dictionary compound | `compounds#dictionary-compounds` | `lexReading:ordinary` / slot | none for compounds | no row |
| 15 | unlisted dictionary compound | `compounds#dictionary-compounds` | as 14 | none | no row |
| 16 | `x` family `compound` | `compounds#families-by-shape` | `xFamily:compound` | `compounds.md#two-roots-one-word` | drift: `families-by-shape` is only on `compound-families.md` |
| 17 | other mid-word `x` | `compounds#families-by-shape` | `wordFamily:x` | `compounds.md#two-roots-one-word` | drift: as 16 |
| 18 | rank / equative join (SHARED scale) | `comparatives` | `joinSeries:o` etc.; `shared:scale` | `joins.md#rank-o`; `list-structure.md#shared-after-the-join` | purpose: beginner page that teaches ranking |
| 19 | join | `joins` | `joinSeries:*` | `joins.md#...` (some `rank-joins.md`, `set-joins.md`) | same (page level; set and rank series have deeper owners) |
| 20 | hook | `hooks` | `unit:hook` | `hooks.md#including-am-al` | same |
| 21 | number | `numbers` | `lexReading:number` / `wordFamily:number` | `numbers.md#counts`, `number-roles.md#...` | same |
| 22 | overlay `locative` | `relations#locative-relations` | `overlay:locative:h/g` | `locative-relations.md#locative-relations` | drift: no anchor on `relations.md` |
| 23 | overlay `of_relation` | `relations#of-relations` | `overlay:of_relation:h/g` | `of-relations.md#of-relations` | drift: no anchor on `relations.md` |
| 24 | overlay `likeness` | `relations#likeness` | `overlay:likeness:g` (`h` is `clause.md#extra-nouns`) | `relations.md#likeness` | same |
| 25 | overlay `exchange` | `relations#exchange` | `overlay:exchange:*` | `relations.md#exchange` | same |
| 26 | overlay `proxy` | `relations#proxy` | `overlay:proxy:*` | `relations.md#proxy` | same |
| 27 | overlay `stimulus` | `sakes#stimulus` | `overlay:stimulus:g` | `sakes.md#personal-possession` | same (page; other anchor, live) |
| 28a | overlay `plan` | `intention` | `overlay:plan:th` | `intention.md#plan` | same |
| 28b | overlay `decision`, `want` | `intention` | `overlay:decision:th`, `overlay:want:th` | `want-and-decide.md#...` | purpose: parent page |
| 28c | overlay `attempt` | `intention` | `overlay:attempt:h` | `try.md#trying` | purpose: parent page |
| 28d | overlay `predict` | `intention` | no overlay has this kind | none | no row: dead branch |
| 29a | overlay `residue`, `former_climate` | `residue-and-former` | `overlay:residue:*`, `overlay:former_climate:*` | `residue-and-former.md#...` | same |
| 29b | overlay `mirative` | `residue-and-former` | `overlay:mirative:th` | `mirative.md#mirative` | purpose: parent page |
| 29c | overlay `notional` | `residue-and-former` | `overlay:notional:*` | `notional.md#...` | purpose: parent page |
| 29d | overlay `phasal` | `residue-and-former` | `overlay:phasal:*` | `already-still-yet.md#stage-of-change` | purpose: parent page |
| 30a | overlay fallback, `evidential`, `may` | `knowing` | `overlay:evidential:*`, `overlay:may:*` | `knowing.md#...` | same |
| 30b | overlay fallback, `cause` | `knowing` | `overlay:cause:th/w` | `cause.md#mechanism` | drift: wrong topic |
| 30c | overlay fallback, `clause_hinge` | `knowing` | `overlay:clause_hinge:*` | `causation.md#if`, `dependents.md#hinges`, `as-of.md#as-of` | drift: wrong topic |
| 30d | overlay fallback, `identity` | `knowing` | `overlay:identity:g` | `predication.md#identity` | drift: wrong topic |
| 30e | overlay fallback, `pairing` | `knowing` | `overlay:pairing:w` | `list-structure.md#respectively` | drift: wrong topic |
| 30f | overlay fallback, `mention` | `knowing` | `overlay:mention:g` | `spans-as-words.md#mention` | drift: wrong topic, if a mention word keeps the `overlay` reading (the sake, ability, list verb and join relation kinds do not reach this branch) |
| 31 | `listVerb` | `list-verbs` | `lexReading:listVerb` | `list-verbs.md#list-verbs` | same |
| 32 | `joinRelation` | `join-relations` | `lexReading:joinRelation` | `join-relations.md#join-relations` | same |
| 33 | `sameRole` | `same-role-words` | `lexReading:sameRole` | `same-role-words.md#before-and-after` | same |
| 34 | ending `-r` anaphor | `pronouns` | `anaphor:*`, `ending:r` | `pronouns.md#resume-r` (`tag` and `topic` have their own pages) | same (page; tag and topic anaphors are `tag-pronouns.md`, `topic.md`) |
| 35 | plural | `plurality#associative` | `word:plural` | `plurality.md#associative` | same |
| 36 | default "word form" | `clause` | `lexReading:ordinary` | `clause.md#who-acts-and-the-action` | same |

## Counts

Rows counted by the branch lines above (28 to 30 split by kind):

| Class | Rows |
|-------|------|
| same | 2, 8, 9, 11, 12, 19, 20, 21, 24, 25, 26, 27, 28a, 29a, 30a, 31, 32, 33, 34, 35, 36 = 21 |
| purpose | 18, 28b, 28c, 29b, 29c, 29d = 6 |
| drift | 1, 3, 4, 5, 6, 7, 10, 13, 16, 17, 22, 23, 30b, 30c, 30d, 30e, 30f = 17 |
| no row | 14, 15, 28d = 3 |

Twelve drift rows (1, 3, 4, 5, 6, 7, 10, 13, 16, 17, 22, 23) are the same cause: the page the link names no longer holds the anchor, because the section moved to an intermediate or advanced subpage. Rows 30b to 30f are one cause: the closed-mood fallback names `knowing`.

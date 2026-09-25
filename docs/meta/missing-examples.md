# Missing examples (editors only)

Constructions the parser accepts and the grammar treats as valid, but that no example on the teaching page exercises. The source is the coverage report `npm run lint:agalan` prints (check 2 in `parser-strictness.md`, a proposal). Each fix is a teach example on the named page, with a morph gloss and loose English per [grammar-docs](grammar-docs.md).

Snapshot: 2026-09-25. The report gives 176 constructions; 148 are exercised by their anchor page and 28 are not. The last two sections list the gaps that are **not** here as missing examples.

## Valid, needs an example on its page


| Construction                                                     | Page to teach it                                                     | Shape                                                          | Currently used on                                                          |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `sentence.clausePart.standaloneJoin`                             | [join-across-roles](../grammar/join-across-roles.md#clause-sequence) | standalone clause join (`/x/` join with no clause before it)   | none                                                                       |
| `sentence.hCoordPart.standaloneJoin`                             | [join-across-roles](../grammar/join-across-roles.md#stance-joins)    | standalone `/h/` or stance join                                | none                                                                       |
| `sentence.dCoordPart.npJoinClose` / `sentence.npJoinClose.JoinD` | [joins](../grammar/joins.md#right-close)                             | `/d/` join after its conjuncts                                 | join-across-roles, numbers-applied, questions                              |
| `sentence.bCoordPart.npJoinClose` / `sentence.npJoinClose.JoinB` | [joins](../grammar/joins.md#right-close)                             | `/b/` join after its conjuncts                                 | causation, hooks, join-across-roles, numbers-applied, questions, relations |
| `sentence.dCoordPart.standaloneJoin`                             | [joins](../grammar/joins.md#standalone-phrase)                       | standalone `/d/` join                                          | questions                                                                  |
| `sentence.bCoordPart.standaloneJoin`                             | [joins](../grammar/joins.md#standalone-phrase)                       | standalone `/b/` join (`gan bar`)                              | hooks, join-across-roles, questions                                        |
| `sentence.gCoordPart.standaloneJoin`                             | [comparatives](../grammar/comparatives.md#comparatives)              | standalone rank join on `/ɡ/` (*no biggest*)                   | predication                                                                |
| `sentence.gJoinClose.sharedAfterJoin`                            | [comparatives](../grammar/comparatives.md#comparative-shared-scale)  | shared word after a `/ɡ/` join                                 | numbers-applied                                                            |
| `token.standInVerb`                                              | [dependents](../grammar/dependents.md#stand-in)                      | stand-in on `/v/` (lexicalized verb reading, **-rn** / **-n**) | none                                                                       |
| `token.greeting` / `word.reading.greeting`                       | [word-endings](../grammar/word-endings.md#greeting)                  | greeting citation as an utterance (`azawan.`)                  | x-compounds                                                                |
| `word.plural.b`                                                  | [plurality](../grammar/plurality.md#associative)                     | associative **-x** on `/b/`                                    | numbers-applied                                                            |
| `resolve.span.bound`                                             | [spans](../grammar/spans.md#endings)                                 | span resume (**-r**) binding an earlier span                   | none                                                                       |
| `sentence.vJoinClose.sharedAfterJoin` (`/h/`)                   | [join-across-roles](../grammar/join-across-roles.md#vp-clause-forms) | shared `/h/` after a `/v/` join (covers every verb)             | none                                                                       |
| `/w/` before an `/h/` / `/th/` join                              | [join-across-roles](../grammar/join-across-roles.md#stance-joins)    | `/w/` grading the whole joined list                            | none                                                                       |
| `resolve.number.bound`                                           | [numbers](../grammar/numbers.md#digitless)                           | number **-r** binding an earlier number                        | relations                                                                  |




## Decided: rejected in parser strictness phase 2

Each row is settled and enforced (2026-09-25): a grammar removal or an `enforce.ts` rule, with an `invalid-forms` test; no teach example.

| Construction | Decision | Doc basis |
| --- | --- | --- |
| `sentence.utterance.QMark` / `sentence.utterance.Bang` | Reject: sentences end in `.`; `?` / `!` are tone-mark prefixes | [speech-moves](../grammar/speech-moves.md#tone-marks) |
| `word.plural.w` / `.h` / `.th` / `.x` | Reject: **-x** is unused on these | [plurality](../grammar/plurality.md) |
| `resolve.content.unbound` (short resume only) | Reject a short **-r** with no earlier match. A full-root **-r** with no match stays valid (*the one you both know*); the plurality `zazawarx` examples are full-root, so they stay | [pronouns](../grammar/pronouns.md#resume-r) |
| `sentence.vJoinClose.sharedAfterJoin` (`/ɡ/` only) | Reject a shared `/ɡ/` after a `/v/` join. A shared `/h/` after a `/v/` join covers every item (join-across-roles already says so) and moves to the table above as a needed example | [join-across-roles](../grammar/join-across-roles.md#vp-clause-forms) |
| `sentence.hJoinClose.sharedAfterJoin` | Reject. To grade the whole list, put `/w/` immediately before the join word | [join-across-roles](../grammar/join-across-roles.md#stance-joins) |
| `sentence.xJoinClose.sharedAfterJoin` | Reject | [join-across-roles](../grammar/join-across-roles.md#clause-sequence) |
| `sentence.asOfWPair.Odo` | Reject: the as-of bound is never a stand-in | [relations](../grammar/relations.md) |

## Not an example gap

- `word.reading.means`: deleted in phase 2 (no overlay row had kind `means`).


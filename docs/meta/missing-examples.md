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
| `resolve.number.bound`                                           | [numbers](../grammar/numbers.md#digitless)                           | number **-r** binding an earlier number                        | relations                                                                  |




## Doubtful: decide before adding an example

The parser accepts these, but no page clearly licenses them. Parser strictness phase 2 either rejects each one or adds an example once a page defines it.


| Construction                                           | Question                                                                                                |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `sentence.utterance.QMark` / `sentence.utterance.Bang` | Sentences always end in `.`, and `?` / `!` are tone-mark prefixes. Reject `?` / `!` as sentence ends?   |
| `word.plural.w` / `.h` / `.th` / `.x`                  | [plurality](../grammar/plurality.md) says **-x** is unused on these. Reject?                            |
| `resolve.content.unbound`                              | **-r** with no earlier match. Used on numbers-applied and plurality: check those examples, then reject? |
| `sentence.vJoinClose.sharedAfterJoin`                  | Shared word after a `/v/` join: does any page define its reading?                                       |
| `sentence.hJoinClose.sharedAfterJoin`                  | Shared word after an `/h/` join: define or reject?                                                      |
| `sentence.xJoinClose.sharedAfterJoin`                  | Shared word after a clause join: define or reject?                                                      |
| `sentence.asOfWPair.Odo`                               | As-of pair whose bound is a stand-in: define or reject?                                                 |




## Not an example gap

- `word.reading.means`: no overlay row has kind `means`, so the parser can never produce this reading. Delete the branch in `classify.ts`, or add the overlay.


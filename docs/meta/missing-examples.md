# Missing examples (editors only)

Constructions the parser accepts and the grammar treats as valid, but that no example on the teaching page exercises. The source is the coverage report `npm run lint:agalan` prints (check 2 in `parser-strictness.md`, a proposal). Each fix is a teach example on the named page, with a morph gloss and loose English per [grammar-docs](grammar-docs.md).

Snapshot: 2026-09-25, after phase 3. All 166 constructions are exercised by their anchor page, and the lint now fails the build when one is not, so the table below stays empty. Phase 3 filled or resolved every earlier row (see Rollout step 3 in `parser-strictness.md`).

## Valid, needs an example on its page

None.

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
- `sentence.hCoordPart.standaloneJoin`: deleted in phase 3. Plain `/h/` join forms are restrictors, and a stance join needs stance words before it.
- `token.standInVerb`: deleted in phase 3 (unreachable; `/v/` join forms are never stand-ins).


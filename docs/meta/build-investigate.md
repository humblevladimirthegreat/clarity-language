# Build investigation: unparseable examples pass the build

Editors only. Handoff note from the expressiveness review (Phase 1, 2026-09-25) for a separate investigation.

## Confirmed case

[questions.md](../grammar/questions.md) § *Confirming a negative* (lines ~402–408):

```
> `jol zazawan vul vurunul. jael.`
> `jael vul vurunul.`
```

`npm run parse -- 'jol zazawan vul vurunul.'` fails: **`Illegal left fence: join before conjuncts`**. `jel vul vawalal.` fails the same way. Moving `vul` after the verb (`vurunul vul`) parses. Yet `npm run build` (including `lint-agalan-docs`) passed at commit `48a682c`.

The page is wrong (clause *not* goes after the verb, as a right-close join)

## Likely cause

[src/lint/agalan-docs.ts](../../src/lint/agalan-docs.ts) walks code spans with `forEachMarkdownCodeToken` and checks **each word** parses and has lexicon roots. Whole-sentence errors (fence order, join arity) are probably never checked. The morph-gloss comparison ([src/lint/morph-gloss-docs.ts](../../src/lint/morph-gloss-docs.ts)) may also compare per word, or skip a pair when the sentence parse fails, instead of reporting the failure. Confirm both.

## Suggested checks

- Parse every code span that ends in `.` as a full utterance and fail on parse errors.
- Grep `docs/grammar/` for `` `… vul v`` / `` `… zul z`` patterns (negation before its target) to find other cases.

## Other parser / docs mismatches from Phase 1

Reported by the review agents and **not yet verified**. Each is either a parser bug or a missing doc reading.

**Documented forms the parser rejects:**

- `th( zululon vawalal ).` — aside fence. The spelled-out form `thexal … xuxul` parses.
- `zual gagadal zul` (*no K*): rejected as an illegal left fence.
- `… vawalal war.`
- `godogolr` on its own.
- `g+3~`.

**Forms the parser accepts that no page defines:**

- `zual gagadalx`
- `zel gelem h+2`, `zel h+ vawalal`
- clauses with no verb (`zodogol.`, `zululon dagadal.`, `zodogol om banabal.`) — existential vs gapping readings would compete
- `hezazam barl`, `thezebam barl`, `hezebam thadorom barl`
- `thadorom burl` (docs say only `holalam` takes `burl`)
- `xezebal` mid-clause (taught only after a period)
- **-r** with no earlier word to point back to (`hogobor`)
- `g+r` (glosses as *more than one*)
- bare `jol.`, bare `jom.`, `jelel`
- values on `/j/` (`jonogotham`), `thabenem`, `gerenem`, `hagadum`

**Performance:** `npm run parse` takes about 30 s per call. Agents batch-checked via a script importing `src/parse/index.js`.

**Doc content errors (not parser):**

- [english.md](../grammar/english.md) maps *by* (deadline) to `hudumem barl` (*until*), a different meaning.
- Hook `aom` glossed *over* competes with vertical *over* (`gubal` + `/b/`).

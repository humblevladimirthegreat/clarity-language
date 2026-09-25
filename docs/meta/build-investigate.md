# Build investigation: parser / docs mismatches

Editors only. Handoff note from the expressiveness review (Phase 1, 2026-09-25) for a separate investigation.

## Resolved (2026-09-25)

The lint checked one word at a time, and the morph-gloss check dropped any example whose sentence parse failed. It now parses every example sentence and multi-word phrase as a whole. It reports a parse failure instead of skipping the gloss comparison, and it fails any code span it can't classify ([marking Agalan](grammar-docs.md#marking-agalan)). The docs the new checks flagged are fixed (questions.md *not* order, pronouns.md resume glosses, numeric-derivation `/w/` order, and others), along with two parser gaps (`v[…]` / `th(…)` outside noun slots, `xuxur xuxum`). Any documented form the parser rejects now fails `npm run build`, so the old "documented forms the parser rejects" list is covered.

## Open: parser strictness

Reported by review agents and **not yet verified**. The parser accepts these forms, but no page defines them. Either the parser is too loose, or a doc reading is missing. The docs lint can't catch these, because it only checks what the docs contain.

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

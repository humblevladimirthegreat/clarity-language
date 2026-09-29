# Syntax test results

Editors only — not linked from grammar pages. Findings from translating the syntax test corpus ([syntax-test-corpus](syntax-test-corpus.md)) for Phase 2a of the expressiveness review (`docs/proposals/expressiveness-review.md`). Each row is a point where the translator had to stop, paraphrase heavily, or settle for an approximation. Rows cite `STC-nn`.

Progress: STC-1–50 translated.

Fields follow the old ledger: **Verdict** is **awkward** · **missing** · **by design?** (needs a ruling). **Priority** is **P1** common everyday English · **P2** common in writing · **P3** niche. `G-nn` is a grammar gap and `L-nn` is lexicon only.

## Grammar gaps

| ID | STC | English job | Current route | Verdict | Owning page | Proposal | Priority |
|----|-----|-------------|---------------|---------|-------------|----------|----------|
| G-01 | 14 (also ahead: 88, 94) | someone else's feeling as a plain attribute (*happy people*, *the girl seemed lonely*) | Emotion compose is the speaker's feeling unless a [holder](../grammar/knowing.md#holder) seam names the person, and a holder needs a name plus a channel. A generic group (*happy people*) cannot be a holder. Fallback: the opaque abstract adjective `gegevam` (*delight*). | by design | sakes.md, knowing.md | None. Another person's feeling needs a holder with a channel, so the speaker never states someone else's inner state as plain fact. | — |
| G-02 | 14 | *often* | Resolved: *often* / *rarely* is a rank join against the Typical bar with `hral`, the same pattern as *many* / *few*; now listed in comparatives.md § vague amounts (`zazawan zahen zel hral vowogal`). A bar-only join was rejected: one name before `zel` is already a superlative. | done | comparatives.md | — | P1 |
| G-03 | 22, 23, 30, 36 (also ahead: 139, 152, 159, 193) | *soon*, *early*, *late*, *too soon* | Resolved: *soon* is `brabum` (open **-m** on *a hair after now*, knowing.md § dated channel). *Early* / *late* use the new time scale: digitless `bral` shared after a rank join (comparatives.md § time scale); *too soon* is `zugen zuel bral`. Parser takes `bral` as the shared scale. | done | knowing.md, comparatives.md | — | P1 |
| G-04 | 23 | *I hope X will happen* | Ruled by design: hope is not evidence, so a forecast still needs a channel (sakes.md § speaker attitude already says so). Recipe added: say-reasons.md § hoping something will happen (`thevegem thahur brabum …`). | by design | sakes.md, say-reasons.md | — | P2 |
| G-05 | 25, 48 (also ahead: 68, 129, 208) | *around* (encircling) | Resolved: new hosted locative `hegozem` / `gegozem` (🎠 *carousel*), relations.md § locative relations. *Look around* (in all directions, STC-25) stays *at everything* `ol bual`. | done | relations.md | — | P1 |
| G-06 | 35, 37 | comparative against the subject's own usual behavior (*eat more slowly*, *write more neatly*) | Resolved: new benchmark bar `zereben` *Usual* (🔁 *repeat*), the ranked item's own usual level (comparatives.md § judgment benchmarks). | done | comparatives.md | — | P1 |
| G-07 | 39, 40, 41 | possessed noun + predicate adjective (*My cat is black*) | Resolved: in `N G em B` the adjective and `em` both attach to the noun, and a noun marked with `em` counts as known, so the verbless clause is a property: `zagadal gabagol em bamegun` is *My cat is black*. | done | hooks.md (genitive), predication.md (existence) | Taught in hooks.md § Whose with drills; predication.md § existence notes it; parser reads it as a property, not existence. | P1 |

## Lexicon

| ID | STC | Word | Resolution | Status |
|----|-----|------|------------|--------|
| L-01 | 1–9 | *shine* | `v:shine` added to 🔆 *bright* (`abawe`). | done |
| L-02 | 11–47 | *shout*, *jump*, *eat*, *wait*, *look* | Role English added to existing rows: 🔊 `v:shout`, 🦘 `v:jump`, 🍴 `v:eat`, 🚏 `m.v:wait`, 👀 `m.v:look`. | done |
| L-04 | 20, 44 | *play* (a game, as children do) | `m.v:play` added to 🛝 *playground* (`vebogam`). ▶️ concrete renamed *play-button* so `v-play` no longer collides. | done |
| L-03 | 16, 24, 31, 41, 46 | *table*, *animal*, *ball*, *doll*, *river* | *ball*: 🏀 concrete renamed *ball* (`abezo`), STC-31 now `zabezol`. Still open: *table*, *animal*, *doll*, *river* have no free emoji; stand-ins stay (*table* = `exagude`, *animal* = `elebe`, *doll* = `eneze`, *river* = `owode`). | needs decision |

Covered without new rows: *kitten* (live compound `ebebexagada`), *village* (`ahede` abstract *locality*), *father* (kin number + *male*), *campers* (agent compound on *camp*), *work* (*sweat* abstract *effort*), *live* (*house* abstract *home*).

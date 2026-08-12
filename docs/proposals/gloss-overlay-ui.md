# Proposal: click-to-gloss overlay UI

**Status:** PROPOSED  
**Related:** long-term TODO *web tools (overlay glosses)*; depends on [parser-pipeline.md](parser-pipeline.md) (**assumed shipped** — `parse(text)` → typed AST + morph tokens); [speed-reading-view.md](speed-reading-view.md) / [speed-reading-icons.md](speed-reading-icons.md) may share the same token map later  
**Design authority:** remains [`docs/grammar/`](../grammar/introduction.md) and lexicon CSVs. This proposal covers **tooling only**: render parsed Agelan so learners can inspect a word (or construction) without leaving the reading surface.

## Motivation

Agelan packs psychologically useful morphology into word form (PoS, reference endings, mid-word **`x`** families, values, numbers, joins, spans). A lexicon search page helps find roots; it does not help *while reading a sentence*. Learners need: click a surface word → see gloss + morph breakdown + a path into the grammar docs.

With a finished parser and lexicon/overlay classification, the hard part is already structured. The UI is a thin **token → card** layer over the AST, not a second analysis stack.

## Goals

1. Paste or embed **parseable Agelan** and make each word **clickable** for a tooltip / inspect card.
2. Show **progressive disclosure**: compact peek first; pin or second click for full morph + grammar links.
3. Reuse one **inspect component** across shells (standalone page, VitePress examples, later editor / extension).
4. Prefer **romanized Agelan** as the copy target (same clipboard rule as [speed-reading-icons.md](speed-reading-icons.md)).
5. Surface **parse failures** as inspectable tokens (red underline + expected …), not silent missing glosses.

## Non-goals

- Implementing or redesigning the parser (see [parser-pipeline.md](parser-pipeline.md)).
- Full discourse resolve in v1 (anaphors, fill-ask vs yes/no) — optional later pass when the pipeline exposes it.
- Replacing the published lexicon search UI; this is sentence-level overlay, not root browsing.
- Shipping a full speed-reading glyph mode in v1 (share the token map later).
- Teaching English aloud (see [learner-tts.md](learner-tts.md) for speech).

## Product shells

| Shell | Role |
|-------|------|
| **A — Gloss overlay viewer** | Standalone page: paste / load Agelan; click-to-gloss is the primary UI. Best v1. |
| **B — VitePress doc widget** | Same component inside grammar examples so learners inspect live sentences in-docs. |
| **C — Browser extension / bookmarklet** | Enable click-to-gloss on a selected region or `.agelan` blocks on any page. |
| **D — Editor assist** | TipTap (already a dependency) compose surface + click-inspect (“did this morph parse as I meant?”). |

**Recommendation:** ship **A**, then embed the same component as **B**. Treat **C** / **D** as follow-ons that consume the same inspect API.

## Tooltip content (layers)

Keep a **compact card**; do not dump the whole AST on first click.

| Layer | Content |
|-------|---------|
| **Header** | Full surface form + PoS chip + ending sense (`-l` / `-m` / `-n` / `-r`) |
| **Gloss** | Lexicon or overlay English; optional **strict vs loose** toggle per [glosses.md](../meta/glosses.md#strict-vs-loose-free-english) |
| **Morph strip** | Stem · mid-`x` family · number anatomy · `-sh` · role / value / ability bits (chips, not a tree) |
| **Why** | One line naming the parser family (e.g. “values, not role”) + link into the owning grammar page |
| **Related** | When available: anaphor target for `-r`; join fence mate; span open / close pair |

- **Click once** → peek tooltip.
- **Pin** or **second click** → side panel with full morph tree + grammar deep-links.

Optional later tabs on the card: strict / loose gloss, and mnemonic (emoji or future icon id) without changing the romanized copy target.

## Interaction

- **Hover** for a light gloss; **click** for morph inspect — hover stays readable while scanning; click is for analysis.
- **Underline by ending class** (optional visual hint that the ending, not the PoS letter, is the usual learner question).
- **Multi-select** a join, span fence, or `^ … ^` island — the card upgrades from word → construction (e.g. rank join `e`, adjunct island).
- **Keyboard:** walk tokens; open the grammar anchor from **Why**; copy romanized form.
- **Parse-error tokens:** failed spans stay in the stream with a failure card (“expected …”) from the parser, not an empty gloss.

## Shared inspect API (sketch)

```text
parse(text) → AST
        │
        ▼
tokensFromAst(ast) → InspectToken[]   // surface range + morph + lex/overlay id
        │
        ▼
GlossOverlay / InspectCard             // tooltip + pin panel
```

One token model feeds the standalone viewer, VitePress widget, and later speed-read / editor shells. Lexicon and overlay lookup stay table-driven ([lexicon-published.csv](../../data/lexicon-published.csv), [lexicon-overlays.csv](../../data/lexicon-overlays.csv)); the UI does not invent senses.

## Phasing

### v1

- Paste box → tokenize → click word → PoS + ending + lexicon/overlay gloss + morph chips.
- Pin panel optional but recommended.
- Parse-error underlines.

### v2

- Construction selection (joins / spans / islands).
- Anaphor / related links when resolve exists.
- Grammar deep-links from **Why**.
- VitePress embedding; TipTap editor; optional extension.
- Optional speed-read glyph mode sharing the same token map.

## Out of scope for styling debates

PoS is already marked on every word; the overlay should not spend design budget on PoS-as-color encoding. Prefer ending hints, morph chips, and construction selection instead.

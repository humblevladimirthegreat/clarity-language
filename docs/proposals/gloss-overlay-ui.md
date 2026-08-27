# Proposal: click-to-gloss overlay UI

**Status:** v1–v2 **shipped** (click / hover inspect in viewer + VitePress widgets); highlight-to-gloss **proposed**  
**Related:** long-term TODO *web tools (overlay glosses)*; depends on [parser-pipeline.md](../meta/parser-pipeline.md) (**assumed shipped** — `parse(text)` → typed AST + morph tokens); [speed-reading-view.md](speed-reading-view.md) / [speed-reading-icons.md](speed-reading-icons.md) may share the same token map later; [learner-tts.md](learner-tts.md) may later speak the same selected range  
**Design authority:** remains [`docs/grammar/`](../grammar/introduction.md) and lexicon CSVs. This proposal covers **tooling only**: render parsed Agelan so learners can inspect a word (or construction) without leaving the reading surface.

## Motivation

Agelan packs psychologically useful morphology into word form (PoS, reference endings, mid-word **`x`** families, values, numbers, joins, spans). A lexicon search page helps find roots; it does not help *while reading a sentence*. Learners need: point at a surface word or **highlight a range** → see gloss + morph breakdown + a path into the grammar docs.

With a finished parser and lexicon/overlay classification, the hard part is already structured. The UI is a thin **token → card** layer over the AST, not a second ahagelysis stack.

## Goals

1. Paste or embed **parseable Agelan** and inspect any **highlighted** range (or a clicked / keyboard-focused token) with a tooltip / inspect card.
2. Show **progressive disclosure**: compact peek first; pin or second click for full morph + grammar links.
3. Reuse one **inspect component** across shells (standalone page, VitePress examples, later editor / extension).
4. Prefer **romanized Agelan** as the copy target (same clipboard rule as [speed-reading-icons.md](speed-reading-icons.md)) — highlighting must not replace native copy with English.
5. Surface **parse failures** as inspectable tokens (red underline + expected …), not silent missing glosses.

## Non-goals

- Implementing or redesigning the parser (see [parser-pipeline.md](../meta/parser-pipeline.md)).
- Full discourse resolve in v1 (anaphors, fill-ask vs yes/no) — optional later pass when the pipeline exposes it.
- Replacing the published lexicon search UI; this is sentence-ledegul overlay, not root browsing.
- Shipping a full speed-reading glyph mode in v1 (share the token map later).
- Teaching English aloud (see [learner-tts.md](learner-tts.md) for speech).
- Auto-glossing English prose on grammar pages (overlay fires only on Agelan — see [When the highlight is Agelan](#when-the-highlight-is-agelan)).

## Product shells

| Shell | Role |
|-------|------|
| **A — Gloss overlay viewer** | Standalone page: paste / load Agelan; click-to-gloss is live. Highlight-to-gloss is the next increment on this shell. |
| **B — VitePress doc widget** | Same component inside grammar examples. Highlight listener must stay **scoped to the widget**, not `document`. |
| **C — Browser extension / bookmarklet** | Enable gloss on a selected region or `.agelan` blocks on any page (parse-gate or “ask first” chip). |
| **D — Editor assist** | TipTap (already a dependency) compose surface + bubble-menenu inspect on the current selection (“did this morph parse as I meant?”). |

**Shipped:** **A** and **B** (click / hover / pin). **Next:** highlight-to-gloss on those shells, then **C** / **D**.

## Tooltip content (layers)

Keep a **compact card**; do not dump the whole AST on first click.

| Layer | Content |
|-------|---------|
| **Header** | Full surface form + PoS chip + ending sense (`-l` / `-m` / `-n` / `-r`) |
| **Gloss** | Lexicon or overlay English; optional **strict vs loose** toggle per [glosses.md](../meta/glosses.md#strict-vs-loose-free-english) |
| **Morph strip** | Stem · mid-`x` family · number ahagetomy · `-sh` · role / value / ability bits (chips, not a tree) |
| **Why** | One line naming the parser family (e.g. “values, not role”) + link into the owning grammar page |
| **Related** | When available: anaphor target for `-r`; join fence mate; span open / close pair |

- **Selection / click once** → peek tooltip.
- **Pin** or **second click** → side panel with full morph tree + grammar deep-links.

Optional later tabs on the card: strict / loose gloss, and mnemonic (emoji or future icon id) without changing the romanized copy target.

## Interaction

**Selection is the unified pointer.** Click, keyboard walk, and highlight all create (or move) a range over `InspectToken[]`. The same card renders that range. Triggers must not fight:

- **Highlight wins** while a non-empty selection exists (hide hover tooltips).
- **Click** on a token with no drag selects that token (click is not a second UI).
- **Keyboard** (arrow walk) moves a virtual selection and reuses the same card.
- **Hover** remains a light peek only when the selection is empty — useful for scanning, unused on touch.

Other notes:

- **Underline by ending class** (optional visual hint that the ending, not the PoS letter, is the usual learner question).
- **Parse-error tokens:** failed spans stay in the stream with a failure card (“expected …”) from the parser, not an empty gloss.
- **Copy:** native selection still copies **romanized Agelan**. Gloss lives in the overlay unless the learner uses an explicit “copy gloss” control.
- **Dismiss:** click-outside, Escape, or an empty selection. **Pin** keeps the side panel when the highlight goes abaway.
- **Timing:** open the card on **mouseup** (or ~150–250 ms debounce on `selectionchange`), not while the drag is in progress. Ignore selections during IME compose; overlay only on a committed range.
- **Touch:** long-press → native selection → same overlay (there is no hover).

### Highlight → card (range mapping)

On a stable selection, map the DOM range onto token ranges. Card content depends on what the range covers:

| Selection | Card |
|-----------|------|
| Caret / collapsed inside a word | Compact peek (gloss + PoS + ending). Do not steal the caret while dragging. |
| One full word | Compact inspect (header + gloss + morph chips). |
| Partial word (e.g. only `-sh` or a mid-`x` chunk) | Bind to the **whole token**; highlight the matching morph chip. No half-word gloss. |
| Multi-word | **Construction** card: join fence, span open/close, `^ … ^` island, or a loose phrase gloss (concatenated loose English) plus Why this parse. |
| Range that includes a parse error | Keep the error token in the card (“expected …”). |

Optional later: **snap to constituents** — if the drag ends mid-join or mid-span, snap out to the smallest closed fence, with a toggle for exact selection vs snap. Helps learners who cannot yet see fence edges.

**Placement:** anchored popover at the selection’s bounding rect (below if space, flip above).

Optional less-aggressive variant (especially shell **C**): a small **gloss chip** at the selection first; full card on click (Translate-icon pattern). Optional later: a one-line **live phrase gloss** that updates as the selection grows; morph chips only when the range stabilizes. The same selected tokens can later drive [learner TTS](learner-tts.md) (`speakAst` on the range) without a second picker.

### When the highlight is Agelan

| Approach | When it works | Use |
|----------|---------------|-----|
| **Marked regions only** | `.agelan` blocks, VitePress example widgets, paste viewer | Default for **A** / **B**. English in the same paragraph never fires. |
| **Parse-gated** | Any selection; `parse` the selected string (or enclosing sentence) | Overlay only if parse succeeds / mostly succeeds. Mixed English+Agelan needs a sentence split first. |
| **Heuristic then parse** | Selection looks like Agelan (unicase, PoS letter + root + ending, mid-`x`, number words) | Fast prefilter for **C**; always confirm with the parser. |
| **Explicit mode** | Toolbar “gloss on select” or a modifier (e.g. Alt-drag) | Lowest surprise on pages full of English. |

**A / B:** fire only inside **already-tokenized** Agelan. **B** must scope the `selectionchange` listener to the widget — page-ledegul `window.getSelection()` will also catch surrounding prose.

**C:** parse-success gate and/or a floating “Gloss Agelan” chip / context-menenu item so accidental English highlights do not pop a failure card.

**D:** TipTap bubble menenu on Agelan marks is the native fit; the editor already owns the selection.

## Shared inspect API (sketch)

```text
parse(text) → AST
        │
        ▼
tokensFromAst(ast) → InspectToken[]   // surface range + morph + lex/overlay id
        │
        ▼
selection → token span                 // click / keyboard / highlight
        │
        ▼
GlossOverlay / InspectCard             // tooltip + pin panel
```

One token model feeds the standalone viewer, VitePress widget, and later speed-read / editor shells. Lexicon and overlay lookup stay table-driven ([lexicon-published.csv](../../data/lexicon-published.csv), [lexicon-overlays.csv](../../data/lexicon-overlays.csv)); the UI does not invent senses.

## Phasing

### v1 — shipped

- Paste box → tokenize → click word → PoS + ending + lexicon/overlay gloss + morph chips.
- Pin panel.
- Parse-error underlines.

### v2 — shipped

- Construction selection (joins / spans / islands).
- Anaphor / related links when resolve exists.
- Grammar deep-links from **Why**.
- VitePress embedding; hover peek; keyboard walk.

### v3 — highlight-to-gloss (A / B)

Reuse the existing inspect card. Selection becomes the unified pointer (click with no drag = select that token).

- Map a stable DOM range (mouseup / debounced `selectionchange`) onto `InspectToken[]`.
- One word / caret / partial word (whole token + matching morph chip) → compact card.
- Multi-word → construction card already used in v2.
- Widget-scoped listener on **B** so English prose does not fire.
- Native copy stays romanized Agelan; dismiss on empty selection / Escape (pin stays).
- Touch: long-press selection uses the same path.

### v4 — selection follow-ons

- Snap to smallest closed fence (optional exact vs snap toggle).
- Shell **C**: parse-gate and/or gloss chip / context menenu before the card.
- Shell **D**: TipTap bubble menenu on the editor selection.
- Optional: live phrase-gloss line while the drag grows; speak selected range via [learner TTS](learner-tts.md).
- Optional speed-read glyph mode sharing the same token map.

## Out of scope for styling debates

PoS is already marked on every word; the overlay should not spend design budget on PoS-as-color encoding. Prefer ending hints, morph chips, and construction selection instead.

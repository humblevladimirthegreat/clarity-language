# Proposal: lexicon icons for speed-reading (copy → romanization)

**Status:** PROPOSED  
**Related:** [speed-reading-view.md](speed-reading-view.md) (emoji-era sketch), long-term TODO *speed reading display*  
**Design authority:** lexicon roots stay in [`data/lexicon-published.csv`](../../data/lexicon-published.csv); grammar docs are unchanged. This proposal only covers **display glyphs** and **clipboard behavior**.

## Motivation

The published lexicon seeds roots with emoji mainly so a [speed-reading view](speed-reading-view.md) can show a pictograph per word. Emoji lock the mnemonic inventory to Unicode RGI scenes and are awkward to restyle.

Switching to a dedicated icon pack lets each root map to a named glyph (`tabler:heart`, `icons8:shield`, …) while the **underlying Agelan spelling** remains the thing learners copy, search, and paste into docs.

**Requirement:** when a learner selects a speed-read glyph and copies, the clipboard should contain the **romanized Agelan** (root or full word as shown), not a Private Use Area webfont codepoint or an emoji.

## Goals

1. Replace emoji-as-mandatory seed with an **icon id** (emoji may remain optional / transitional).
2. Ensure **copy/paste yields romanized Agelan**.
3. Pick a primary icon pack suitable for “common things” mnemonics.
4. Keep rendering workable in a web speed-reading view (SVG or font), with consistent sizing/color.

## Non-goals

- Changing phonology or root assignment rules.
- Filling every unused VCVCV root just because an icon exists.
- Multi-artist style mixing inside one reading mode (one pack / one style per mode).
- Shipping a full custom icon set drawn from scratch in v1.

## Icon pack options

| Option | Source | Style | Notes |
|--------|--------|-------|-------|
| **A — Tabler outline** | [Tabler Icons](https://tabler.io/icons) (outline / stroke set) | Monochrome line, 24×24, ~2px stroke | MIT; large consistent free set; treat **outline** as the inventory (filled variants are mostly the same concepts). Best when the reader should feel like UI chrome, not stickers. |
| **B — Icons8 Color** | [Icons8 Color](https://icons8.com/icons/color) | Full-color flat pictographs | Paid license for attribution-free / commercial embedding; closer to emoji’s “instant scene” mnemonic; check download vs API terms if icons are served from the app. |

**Recommendation to decide later:** prototype both on a short lexicon sample (faces, tools, animals, abstract moods). Prefer **B** if speed-reading depends on pictorial recognition; prefer **A** if density, theming, and free/MIT matter more.

Either pack needs a stable **icon id → Agelan root** map (new CSV column or sidecar), not reliance on Unicode codepoints.

## Rendering + clipboard options

Both options below put **romanized Agelan in the DOM** as the copyable string. They differ in how the icon is drawn.

### Option 1 — Ligature webfont (romanization is the text)

**Idea:** the text node is the Agelan spelling (e.g. `uze`). A custom (or subset) webfont maps that string to an icon glyph via OpenType **ligatures** (same pattern as classic Material Icons: `<span class="material-icons">home</span>`).

```html
<span class="agelan-icon">uze</span>
```

| | |
|-|-|
| **Screen** | Ligature substitutes the letters for the pack glyph (or a PUA glyph keyed off the liga). |
| **Copy** | Clipboard gets `uze` because that is the real character data. |
| **Pros** | Single stream; selection/copy “just works”; screen readers can read the word if the font fails. |
| **Cons** | Requires building/maintaining a **custom font** that ligates every used root (or word form) to a glyph from Tabler / Icons8. Stock Tabler/Icons8 webfonts do **not** know Agelan spellings. Multi-color Icons8 Color does not map cleanly to a single-color glyph font without flattening. Font subset must update when the lexicon map changes. |
| **Fits pack** | Stronger fit for **Tabler outline** (monochrome). Weak fit for **Icons8 Color** unless glyphs are flattened to one ink. |

### Option 2 — Decorative icon + real text

**Idea:** render the pack icon as decoration (inline SVG, `<img>`, or CSS `::before` with a pack webfont). Keep romanized Agelan as a real text node that remains the copy/selection target (visible, visually hidden, or shown on focus — product choice).

```html
<span class="word" data-root="uze" data-icon="tabler:mood-smile">
  <span class="icon" aria-hidden="true"><!-- SVG or ::before --></span>
  <span class="roman">uze</span>
</span>
```

| | |
|-|-|
| **Screen** | Icon carries the mnemonic; `.roman` may be hidden in “icons only” mode or shown as caption. |
| **Copy** | Selection / `copy` handler uses `.roman` (or `data-root`). Icon layer is `aria-hidden` and preferably `user-select: none`. |
| **Pros** | Works with **SVG from either pack**; full-color Icons8 Color stays full-color; no custom ligature font; easy to swap packs; map is data-only. |
| **Cons** | Need a clear copy story in “icons-only” mode (hidden text still selectable, or a `copy` event that writes `data-root`). Slightly heavier DOM than a single text node. |
| **Fits pack** | Fits **Tabler outline** and **Icons8 Color** equally. |

Optional hardening for option 2: on `copy`, set clipboard text explicitly from `data-root` / full surface form so browsers that skip hidden text still paste Agelan.

## Comparison (clipboard goal)

| | Option 1 (ligatures) | Option 2 (decorative + text) |
|--|----------------------|------------------------------|
| Copy → romanization | Native | Native if text selectable; or JS `copy` |
| Tabler outline | Good | Good |
| Icons8 Color | Poor / forced mono | Good |
| Build cost | Custom font pipeline | Icon id map + SVG/CSS |
| Pack switching | Rebuild font | Remap ids / assets |

## Suggested decision path

1. Choose pack **A** or **B** from a short visual prototype in the speed-reading layout ([speed-reading-view.md](speed-reading-view.md)).
2. Default implementation path: **Option 2** (decorative icon + romanization), unless Tabler-only and a ligature font is explicitly wanted for a minimal DOM.
3. Add lexicon field(s), e.g. `icon` (`tabler:…` / `icons8:…`), keep `emoji` until migration is done.
4. Speed-reading view reads `icon` first, falls back to `emoji`.

## Open questions

- Copy surface: bare **root** (`uzumu`) vs full **word** with PoS/ending (`guzumum`)?
- Icons-only mode: is hidden romanization always in the accessibility tree?
- License: Icons8 Color embedding limits for an offline/static lexicon bundle vs CDN/API.
- One icon per root, or separate icons for literal vs metaphorical sense?

## See also

- [speed-reading-view.md](speed-reading-view.md)
- [lexicon.md](../grammar/lexicon.md)
- Published seeds: [`data/lexicon-published.csv`](../../data/lexicon-published.csv)

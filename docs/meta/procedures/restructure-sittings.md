# Restructuring sittings

Editors only. How to measure a sitting, split one off a page, and move H3s between sittings. What one sitting holds: [one sitting](../grammar-docs.md#one-sitting); one sitting per file: [how to apply](../learning-levels.md#how-to-apply). Wrapped by the `restructure-sittings` skill.

## Sitting length {#sitting-length}

`npm run page-lines` counts lines and taught H3s per grammar page (`--sittings`, `--headings`). A sitting past 10 taught sections splits ([sitting length](drill-generation.md#sitting-length)).

## Peel a band onto a new file {#peel-band}

`npm run peel-band -- --parent joins.md --band intermediate --to rank-joins.md --title "Rank joins"` (dry run); `--write` copies that band to a new file, rewrites `parent.md#id`, and appends the hash map, the matching sidebar group, and a **generate** row in the [drill allowlist](drill-generation.md#allowlist) (the build fails until the sitting has a Practice or a **skip** reason).

## Peel named H3s onto a new sitting {#peel-headings}

To peel named H3s onto a new sitting of another band: `npm run peel-headings -- --parent more-turn-words.md --ids speech-act --to firm-soft.md --title "Firm and soft" --band beginner` (dry run); `--write` copies those clusters, rewrites anchors, and appends the sidebar row and the allowlist row. Split Practice by hand.

## Move an H3 between sittings {#move-heading}

`npm run move-heading -- --from a.md --ids x,y --into b.md (--after id | --before id | --end)` (dry run); `--write` moves the clusters, rewrites `a.md#x` links everywhere `peel-headings` does, and adds `hash-redirect.ts` rows so `a.html#x` lands on `b.html#x`. `--record-only` writes only the hash rows for a move already made by hand (`--ids old:new` for a renamed id). Practice, the allowlist, the sidebar and reviews stay hand work.

## After any of these {#after}

1. Commit before and after each `--write` so its diff stands alone ([fence automated rewrites](proposals.md#fence-automated-rewrites)).
2. Run `npm run cheat-sheet-blocks -- --write`, then `npm run build`. When a sheet's layout changed, run the print check in [cheat sheets](../grammar-docs.md#cheat-sheets).
3. `AGENTS.md` stays a routing table of topic nouns: edit the parent's **Owns** line when a job leaves; add a row only for a new topic.

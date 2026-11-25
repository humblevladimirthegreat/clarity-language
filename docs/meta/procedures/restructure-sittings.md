# Restructuring sittings

Editors only. How to measure a sitting, split one off a page, move H3s between sittings, and split an H3 in place. What one sitting holds: [one sitting](../grammar-docs.md#one-sitting); one sitting per file: [how to apply](../learning-levels.md#how-to-apply). Wrapped by the `restructure-sittings` skill.

## Sitting length {#sitting-length}

`npm run page-lines` counts lines and taught H3s per grammar page (`--sittings`, `--headings`). A sitting past 10 taught sections splits ([sitting length](drill-generation.md#sitting-length)).

## Peel a band onto a new file {#peel-band}

`npm run peel-band -- --parent joins.md --band intermediate --to rank-joins.md --title "Rank joins"` (dry run); `--write` copies that band to a new file, rewrites `parent.md#id`, and appends the hash map, the matching sidebar group, and a **generate** row in the [drill allowlist](drill-generation.md#allowlist) (the build fails until the sitting has a Practice or a **skip** reason).

## Peel named H3s onto a new sitting {#peel-headings}

To peel named H3s onto a new sitting of another band: `npm run peel-headings -- --parent more-turn-words.md --ids speech-act --to firm-soft.md --title "Firm and soft" --band beginner` (dry run); `--write` copies those clusters, rewrites anchors, and appends the sidebar row and the allowlist row. Split Practice by hand.

`peel-band` and `peel-headings` put the new sidebar row directly after its parent, in the parent's [unit](../learning-levels.md#units). `--unit "<title>"` puts it at the end of that unit instead. A peel into a different band from its parent has no parent unit there, so the tool stops and asks for `--unit`.

## Move an H3 between sittings {#move-heading}

`npm run move-heading -- --from a.md --ids x,y --into b.md (--after id | --before id | --end)` (dry run); `--write` moves the clusters, rewrites `a.md#x` links everywhere `peel-headings` does, and adds `hash-redirect.ts` rows so `a.html#x` lands on `b.html#x`. `--record-only` writes only the hash rows for a move already made by hand (`--ids old:new` for a renamed id). Practice, the allowlist, the sidebar and reviews stay hand work.

## Split an H3 on its page {#split-heading}

1. Split the H3 by hand. Give each new H3 its own `{#id}`, none of them the old id, and remove the old id and any `<a id>` line under it.
2. `npm run retarget-id -- --page a.md --id old --to new --list` prints every reference to `a.md#old` repo-wide, including same-page `](#old)` links: `file:line`, the link text, and the text around it. Pick the default target, the H3 most references mean, and read each sentence to see which H3 it means.
3. `npm run retarget-id -- --page a.md --id old --to new --except path/b.md:88=other,…` (dry run, paths from the repo root); `--write` rewrites each reference to `--to` or to its line's exception, and adds one `hash-redirect.ts` row so `a.html#old` lands on `a.html#new`.
4. The tool sends a whole line to one target. A line marked `(×2)` whose references mean different H3s is fixed by hand after `--write`.

## Move an anchor to another page {#move-anchor}

For an id with no heading cluster to cut, such as an `<a id>` line whose teaching moves to an earlier page. A whole H3 moves with `move-heading` instead.

1. Move the anchor by hand: remove the old id from `a.md` and add the new one on `b.md` (the same name or a new one).
2. `npm run retarget-id -- --page a.md --id old --to b.md#new` (dry run; `--list` and `--except path/c.md:88=other` or `=b.md#other` work as in [splitting an H3](#split-heading)). `--write` rewrites every reference, turns `a.md`'s same-page `](#old)` links into links to `b.md`, makes links already on `b.md` same-page, and adds the `hash-redirect.ts` row `a.html#old` → `b.html#new`.
3. The dry run flags a rewrite on a stage page that now points to a later stage page. Reword those links or drop them; the build's `lint:forward-links` decides.

## After any of these {#after}

1. Commit before and after each `--write` so its diff stands alone ([fence automated rewrites](proposals.md#fence-automated-rewrites)).
2. Run `npm run cheat-sheet-blocks -- --write`, then `npm run build`. When a sheet's layout changed, run the [print check](cheat-sheets.md#print-breaks).
3. `AGENTS.md` stays a routing table of topic nouns: edit the parent's **Owns** line when a job leaves; add a row only for a new topic.
4. When the restructure moved, peeled, merged, or rewrote sections, its last unit is a style review. Run `npm run changed-sections -- <rev>` with the commit before the restructure, and hand that list to a fresh `style-editor` subagent that made none of the changes ([what the build checks](../doc-style.md#what-the-build-checks)). A move changes what comes before a section, so a lead, a first-use gloss, or a preview that was right in the old place can be wrong in the new one.

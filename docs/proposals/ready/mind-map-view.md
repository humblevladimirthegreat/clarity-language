# Collapsible mind map of a passage

**Status:** READY. Decided 2026-11-11: labels show the Ageben word with its gloss below, with a toggle; layout by `d3-hierarchy@3.1.3`, left-to-right, indented outline under 640px; Inspect page only; emoji on topic nodes only; two layers by default with a 1–3 depth control; *respectively* shown by matching pair markers. Decided 2026-11-13: the map is built from the shared interpreter's readings, not from its own walk of the parse tree, and the lift / fold / label classification moves to `ageben-interpreter.md` (units R1a, R1b). Not design authority; when carried out, the rules move to a new meta note and this file is deleted.

**Related:** [Inspect](/inspect) and its viewer [`GlossViewer.vue`](../../grammar/.vitepress/components/GlossViewer.vue); the interpreter's reader (`src/interpret/`, its types and table in `docs/meta/interpreter.md`, both made by `ageben-interpreter.md`); parse tree types [`src/parse/types.ts`](../../../src/parse/types.ts) and [`resolve.ts`](../../../src/parse/resolve.ts), which the readings point back into; grammar pages [topic](/topic), [pronouns](/pronouns), [joins](/joins), [list structure](/list-structure), [verb and stance joins](/verb-and-stance-joins), [dependents](/dependents), [causation](/causation), [knowing](/knowing), [residue and former](/residue-and-former), [questions](/questions), [feelings](/feelings).

**Depends on:** phase 3 of `ageben-interpreter.md` (the reader; its classification table is in `docs/meta/interpreter.md`). No unit here starts before that phase is committed. **Order:** lands after `reading-consumers.md`, whose phase 4 adds the reader to Inspect: reuse its `@interpret-browser` alias in `config.ts` and the `ParseResult` that `inspectText` returns, so the page parses once. Shares topic-stretch detection with `syntax-highlighting.md`; whichever lands second reuses the first one's helper. Topic emoji follow `speed-reading-view.md` if it has landed.

**Design authority:** *none*. Tooling only: no form or reading changes, and the parser's accept/reject behavior does not change.

## Problem

A paragraph of Ageben is hard to take in at once: a reader sees a flat run of words and has to rebuild who did what, under which condition, and who believes it. Ageben already marks that structure in its grammar. Its syntax is unambiguous, so each sentence has one parse; role letters name each argument's role; join fences say exactly what a list covers; subordinators and hinges name how clauses relate; and resolved pronouns link one sentence to the next. None of this is visible on the page.

A mind map shows it, but a full map of even five sentences is too big to read. A map that shows only the top layers, with the rest folded, is easy to read, as long as folding never changes what the visible part says.

## Goals

1. On the [Inspect](/inspect) page, a **Map** view of the pasted passage: a tree from one root, showing the root and two layers below it, with every deeper branch folded and expandable.
2. **No folded meaning.** A collapsed node never reads as a different claim from the text. Anything that changes truth, force, or ownership (a condition, a stance, whose belief or feeling it is, negation, an open list) is shown on the node it modifies, even when its own content is folded.
3. The tree comes only from the interpreter's readings, which copy the parser and resolver. Where a reading states nothing, the map shows nothing, never a guess.
4. It works at phone width, by keyboard, with a screen reader, and in both themes.

## Non-goals

- Summarizing or ranking ideas by importance. The map follows the grammar's structure, not salience.
- Editing Ageben through the map.
- Maps on grammar pages, in examples, or in the Claritish journal. Grammar examples are mostly one sentence, where a map adds little; revisit once U4 shows how longer passages come out.
- A graph view centred on one entity, with every sentence that mentions it around it. Cross-link markers cover this for now ([tree, not graph](#tree-not-graph)).
- Export to mind-map apps (OPML, Markdown outline). Easy to add later from the same tree.
- Any change to what the parser accepts or how it reads a form, and any walk of the parse tree for meaning inside `src/mind-map/`. If the builder needs something a reading does not carry, that is a [stop-and-alert](../../meta/procedures/proposals.md#stop-and-alert) finding for the interpreter's table, not a local fix.

## Design

### Layers

| Layer | Holds | Shown by default |
|-------|-------|------------------|
| Root | The passage's topic, or *passage* when there is none or there are several topic stretches | yes |
| 1 | One node per top-level reading (a main clause), labelled by its claim's verb or predicate. With several topic stretches, one node per stretch, its clauses below | yes |
| 2 | The claim's roles, each link labelled by role letter | yes |
| 3+ | Details, the nested readings in a frame's or detail's `content` (dependents, hinge clauses, islands, quotes, asides), a term's own details (adjectives, relations), compound parts | folded |

- **A level with one child merges into its parent.** A passage with one topic stretch makes the topic the root, so its clauses are layer 1.
- **Joins don't use up a layer.** A join is drawn as a bracket over its members, labelled with the join word and its badges (closed or open, set or rank, distribute or collective from `SharedRecord`), not as a node of its own. A clause join therefore still shows each clause's arguments at layer 2.
- **Text order.** Children appear in the order they are written, so a folded branch still reads like its sentence.
- **Folded count.** A folded node shows how many nodes are under it (`+4`).
- **Depth control.** Two layers below the root by default. A control sets one to three; the choice is kept per viewer in `localStorage` (wrapped in try/catch, falling back to two).
- **Unparsed sentences** become one grey leaf holding the raw text, marked *doesn't parse*. The rest of the passage still maps.

### Lift and fold

The interpreter's reader has already sorted every construction into a class, in the table that `docs/meta/interpreter.md` owns. The map draws each class one way and classifies nothing itself:

| Reader class | Meaning | On the map |
|--------------|---------|------------|
| **frame** (*lift*) | Changes what the node claims: truth, force, or whose claim it is | A badge on the node it modifies, always visible. The badge names the frame's family and values (`if`, `although`, `reported`, `holder's belief`, `not`, `open list`); the frame's `content` may still fold as a child |
| **detail** (*fold*) | Narrows but does not change the claim (place, time, manner, degree, an extra argument, an aside) | A child node, folded below layer 2 |
| **label** | Part of the node's own wording (the verb, a noun head, the ending that makes it a name) | Merged into the node's label |
| **link** | Points at another reading | A cross-link marker ([tree, not graph](#tree-not-graph)) |

Rule of thumb: **lift the kind, fold the content.** A main clause with an *although* dependent carries an `although` badge at layer 1; what the dependent clause says folds below it.

**An unsettled pair is shown, never resolved.** When a reading's `unordered` holds two frames (they do not commute, and no grammar rule orders them), the map draws both badges with an *order not settled* marker between them. It never stacks one inside the other.

**An `unknown` frame is drawn as a badge, never folded.** The reader makes one for any construction with no table row. Showing too much clutters the map; hiding a stance misstates it.

The map needs one thing the reader's table does not hold: the badge text for each frame family and value. That wording lives in `src/mind-map/` and in `docs/meta/mind-map.md`.

### Tree, not graph

Each sentence's readings form a tree: a reading nests others only where the parse tree nests them (the reader's rule), through a frame's or detail's `content` and through clause terms. The map uses that nesting as its backbone, so it can always be drawn as a tree. The meaning of a passage is a graph, though: some words point elsewhere, and some items belong to several others. Each such link is drawn as below, never as a second parent.

| Source | Shape | On the map |
|--------|-------|------------|
| Pronouns, tags, topic pronoun, role pointers (`AnaphorBind`) | A word points to a node elsewhere, often in another sentence | Cross-link marker ([pronouns and cross-links](#pronouns-and-cross-links)) |
| An item shared by a list's members (`SharedRecord`) | One node, several parents | Drawn once on the join's bracket, with its distribute or collective badge |
| An argument shared by joined verbs ([verb and stance joins](/verb-and-stance-joins)) | One argument, several verbs | Drawn once on the bracket over the joined verbs, like SHARED |
| *Respectively* ([list structure](/list-structure)) | Members of two lists paired one to one | Matching pair markers (①, ②, …) on the members of both lists. Each list keeps its place in the tree and its text order; hover or focus on a marker outlines its partner |
| A reply that fills an earlier question (`AnswerRecord`) | A link from one sentence to another | Cross-link marker from each filled blank to the blank it answers |
| Stand-in vowels, linkers, and what carries past a period ([dependents](/dependents)) | A clause pointing back at an earlier clause or role | Cross-link marker |

Cross-links are not followed when the tree is built, so a link that points back to its own clause (a cycle) cannot break the layout. At worst it draws a marker pointing to a node above it. The resolver already flags some of these (`ownSlot`).

Each row is a `link` class in the reader's table, confirmed against its grammar page by units R1a and R1b of `ageben-interpreter.md`. A linking construction missing here is added there, and the map draws it by its link type.

### Pronouns and cross-links

Each pronoun term with an antecedent (the reader keeps the resolver's `AnaphorBind` on it) is labelled with its antecedent's label and a link marker. Hover or focus outlines the antecedent's node. When the antecedent sits in a folded branch, the marker reads *also in: …*, and activating it unfolds the path to that node. A pronoun with no antecedent keeps its own gloss and gets no marker. Nodes are repeated, never merged, so the map stays a tree. Answer links and stand-in links behave the same way.

### Labels and pictures

- Each node shows the Ageben word, with its gloss (`senseLabel` / `morphGlossFor`) below. A toggle swaps to the English gloss, with the Ageben word on hover. The page serves learners, and seeing the word beside its structure is the learning; the toggle helps a reader who only wants the gist.
- Topic nodes carry their root's emoji seed; no other node does. Few pictures stay distinct, as `speed-reading-view.md` argues, and abstract roots' seeds can mislead when they sit on every node.

### Layout and drawing

`d3-hierarchy@3.1.3` places the nodes; Vue draws them. Placement is where hand-written code goes wrong, so a library does it, and everything else stays in plain Vue.

- **Placement:** `d3.tree()` (the tidy-tree algorithm) on the visible nodes only, recomputed on each fold or unfold. Node sizes are measured from the DOM after first render; a `separation` function spaces neighbours by their measured heights, and each column is as wide as its widest label. Left-to-right, which keeps text order.
- **Drawing:** nodes are HTML elements, absolutely placed; parent links, join brackets (from the laid-out extent of their members) and cross-link lines share one SVG layer underneath.
- **Access:** the map is a `role="tree"` with `treeitem` nodes, `aria-expanded`, and `aria-level`. Arrow keys move between nodes; Enter or Space folds and unfolds. Badges are text, not just colour.
- **Themes:** the site's existing colour tokens, following VitePress's light/dark toggle.
- **Phones:** under 640px, an indented outline of the same tree, with the same folding, badges and markers. It needs no layout.
- **Server-side build:** the component loads in the browser only (`<ClientOnly>`), as other inspector widgets do.

Checked 2026-11-11: `d3-hierarchy` 3.1.3 is a repackaging of 3.1.2. Its bundled code matches 3.1.2's apart from the header and module wrapper; it ships a prebuilt ESM bundle instead of `src/`; and it was published from GitHub Actions with SLSA provenance. ISC licence, no dependencies.

### Data flow

`inspectText` already parses and resolves the passage in the browser. The interpreter's reader (`src/interpret/browser.ts`) turns that `ParseResult` into readings. A new pure module `src/mind-map/` turns the readings into a `MapNode` tree (`{ id, label, gloss, role?, badges[], children[], foldedByDefault, crossLinks[], pairMarker? }`). It holds the badge wording and the layer rules, and no grammar table. The Vue component only lays out and draws the tree; it has no grammar logic.

## Implementation plan

The work runs through subagents: the audit needs a fresh context, and the builder and the component share little. If the user says to stop partway, the orchestrator [consolidates this proposal](../../meta/procedures/proposals.md#consolidate) before the session ends.

The classification that this plan once held as U1a and U1b is now units R1a and R1b of `ageben-interpreter.md`; the ids below keep their old numbers.

### Units

| ID | Items | Agent | `model` | effort | May edit |
|----|-------|-------|---------|--------|----------|
| U2 | `src/mind-map/build.ts` (readings → `MapNode` tree, badge wording per frame family and value) and `build.test.ts`: layers, merge-single-child, joins as brackets, shared items on brackets, *respectively* pair markers, frame badges, an `unknown` frame drawn as a badge, cross-links (pronouns, answers, stand-ins), a self-pointing link, unparsed leaf. Write the drawing rules (layers, brackets, badges, cross-links) to a new `docs/meta/mind-map.md`, which points to `docs/meta/interpreter.md` for the classes | `proposal-worker` | `opus` | `high` | `src/mind-map/**`, `docs/meta/mind-map.md` |
| U3 | Add `d3-hierarchy@3.1.3`. `MindMap.vue` per [layout and drawing](#layout-and-drawing): tidy-tree placement from measured sizes, folding with `+N` counts, depth control, label toggle, topic emoji, cross-link and pair-marker highlighting with unfold-to-target, tree ARIA and keyboard, outline under 640px. Add a **Map** view to `GlossViewer.vue` or a section on [`inspect.md`](../../grammar/inspect.md) with a one-paragraph explanation; add the `@mind-map` alias in `config.ts` | `proposal-worker` | `opus` | `medium` | `docs/grammar/.vitepress/components/MindMap.vue`, `GlossViewer.vue`, `config.ts`, `theme/index.ts`, `docs/grammar/inspect.md`, `package.json`, `package-lock.json` |
| U4 | Fresh-context audit: run the builder on 20 multi-sentence passages drawn from grammar examples (`node scripts/find.mjs` by construction), including SHARED, *respectively*, a fill-ask with its reply, and cross-sentence pronouns. Check, from `--llm-prompt` readings, that no collapsed view misstates its sentence. Sort each failure: a wrong class is a finding for the interpreter's table; a wrong drawing is the builder's. Report failures; fix only test fixtures | `proposal-worker` | `opus` | `high` | `src/mind-map/build.test.ts` |
| U5 | Style review of the `npm run changed-sections -- <rev>` list (the `inspect.md` paragraph), `<rev>` being the commit before U2 | `style-editor` (fresh) | `opus` | `high` | `docs/grammar/inspect.md` |

Order: U2 → U3 → U4 → U5, in sequence. U4's builder failures go back to a fresh U2-style subagent with the failing passages and the diff stat; its class failures stop the run per [stop and alert](../../meta/procedures/proposals.md#stop-and-alert) when they misstate a sentence, since the fix is in the interpreter. The orchestrator then adds the `docs/meta/mind-map.md` row to `AGENTS.md` (editor notes table) and deletes this proposal.


### Rule digest (pasted into every brief)

> - Read `AGENTS.md` first; it routes. This is tooling: never change a form, a reading, or what the parser accepts.
> - The map is built from the interpreter's readings (`src/interpret/`; classes in `docs/meta/interpreter.md`), never from its own walk of the parse tree. A **frame** is a badge on the node it modifies, always visible; a **detail** is a child below layer 2; a **label** is part of the node's wording; a **link** is a cross-link marker. Lift the kind, fold the content.
> - An `unknown` frame is drawn as a badge, never folded.
> - Do not classify here. If a reading puts a construction in the wrong class, or lacks what the map needs, stop and report it; the fix is a row in the interpreter's table. Work out what a sample means with `node scripts/parse.mjs --llm-prompt`, and see its readings with `npm run -s reading -- '<text>'`.
> - Layers: root, then main clauses, then arguments; deeper folds. A single child merges into its parent. Joins are brackets, not layers. Children keep text order.
> - The map is always a tree built from the parse nesting. Every other link (pronouns, answers, stand-ins) is a cross-link marker; shared items sit once on their bracket; *respectively* pairs get matching markers. Nodes never merge and never get a second parent.
> - Where a reading states nothing, the map shows nothing.
> - Never patch the parser or the reader from here.
> - Read slices: list headings (`grep -n '^#'`) first, then the ranges you need.
> - Scripted edits go in a file under `tmp/scratch/`, never inline.
> - Verify with `npm run verify -- --allow-generate` at the end of the item (`--fast` inside it). Read only new error lines from `tmp/logs/verify-last.log`.
> - Stop and report, without working around, when: a premise here no longer holds; later units would need a different design or order; skipping would leave later units on a broken state; or enough is skipped that the goals can't be met.
> - At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
> - Do not commit. Report in these fields: **done**, **files touched** (count), **reader findings** (a wrong class or a missing field, each with its sentence), **AGENTS.md Owns lines**, **verify** line, **skips** with reasons, **left**, **inefficient**.

### Gates

- `npm run verify -- --baseline` at the start of each unit; `npm run verify -- --allow-generate` must show no new errors before its commit.
- U2 and U4: `npm test` green.
- U3 and final: a clean `npm run build` (the `inspect.md` edit is a grammar page).

### Commits

One per unit after its gate, plus one final commit for the `AGENTS.md` row and the proposal's deletion: five commits expected. Messages start `mind-map-view U2:` (and so on), then `[skip-cd]`, then the co-author line. Only the orchestrator commits.

## Open decisions

None. Grammar questions about how a construction is read belong to `ageben-interpreter.md`; a question about how the map draws one is logged here per the [proposal procedure](../../meta/procedures/proposals.md#open-decisions).

## Historical note: layout libraries considered

Checked on npm 2026-11-11, before `d3-hierarchy` was chosen. Kept so the choice need not be redone.

- **`markmap-view`** (MIT, depends on all of `d3`): a complete collapsible mind map, with an initial expand level. Nodes are HTML strings inside SVG `foreignObject`, so they can't be Vue components; folding is mouse-only; there is no way to bracket a range of siblings; and highlighting cross-links would mean editing its internal DOM.
- **`mind-elixir`** 6.0.0 (MIT, no dependencies, about 42 KB gzipped, 31 KB lite): a mind-map *editor* core with DOM nodes. It has much of what this map needs: per-node `expanded` and expand-to-depth, node `tags` (rendered as text) for badges, `icons` for emoji, labelled `arrows` between any nodes for cross-links, `summaries` (a bracket over a range of siblings) for joins, a one-sided right layout, a separate Outliner view for phones, CSS-variable themes and a dark theme, and per-node `metadata`. Against it: no ARIA at all, with only the outer container focusable; editing, menus, toolbar, drag and editing keys all have to be switched off; it picks dark mode from the system setting instead of the site toggle; nodes are its own DOM, not Vue; and 6.0.0 came out on 2026-11-04 after a long prerelease series. Not confirmed: how an arrow draws when one end is in a folded branch. The fastest route to a working map, but it fails the keyboard and screen-reader goal.
- **General graph layout** (`@dagrejs/dagre`, `elkjs`) and **node editors** (`@vue-flow/core`): built for graphs, not tidy trees. `elkjs` is about 8 MB unpacked under EPL/GPL; Vue Flow is a node editor that still needs a layout library.
- **`d3-flextree`** (tidy tree with nodes of different sizes): last released 2022, depends on `d3-hierarchy` 1.x, WTFPL licence. Not needed, since `d3-hierarchy` handles varied sizes through `separation` with measured nodes.
- **Hand-written placement**: rejected; placing nodes without overlaps is where hand-written code goes wrong.

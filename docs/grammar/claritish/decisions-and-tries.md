<!-- read-by (generated: npm run page-readers -- --write; do not edit)
Page shape read by code:
- H1: the journal editor's lesson title (src/claritish-editor/data.ts)
- #forms: the editor's "Learn this" link (src/claritish-editor/data.ts)
- #gap: a level-2 section with id gap; each italic phrase in it raises the lesson's cue or is exempt (scripts/lint-claritish-editor.ts, src/claritish-editor/data.ts)
- tables: each table row's spans are on the Claritish cheat sheet (scripts/lint-cheat-sheets.ts)
- practice: numbered practice items, each a bold number, an italic prompt and an optional note, then the answer in a Show answer details block (src/claritish-editor/data.ts)
Named by data: 3 cues (claritish-triggers.csv), 2 flows (claritish-flows.json), 2 cheat-sheet rows.
Inbound links: npm run page-refs -- claritish/decisions-and-tries.md
-->

# Decisions and tries {#decisions-and-tries}

## The gap {#gap}

*I've decided* sounds final even when you could still change your mind, and *I'll try* sounds like a hedge even when you are committed to trying. Neither *I've decided* nor *I'll try* says how settled you are. In Ageben, the ending on the decision or try word says it.

## The forms {#forms}

| Drop-in | Meaning |
|---------|---------|
| `thogel` / `thogem` / `thoger` | decided for good / decided, can still change / decided for now |
| `howal` / `howam` / `howar` | committed to trying / tries / a trial run |

The drop-in goes where an English adverb or tag would go.

The endings are back on the settled-to-passing scale: `-l` for good, `-m` the default, `-r` right now only.

A trial run (`howar`) plans for failure: if it doesn't work, finding that out was the point. Use it to lower the stakes of starting something, for yourself or for someone else.

When the English already says how settled you are (*for now*, *for good*, *just trying it*), leave the drop-in off.

## Examples {#examples}

> I'm going vegetarian `howar`.  
> We're moving to Denver `thogel`.  
> I'm taking the job `thogem`.  
> I'm learning piano `howal`.  
> We're skipping the party `thoger`.

*I'm learning piano `howal`* says you'll keep at it until it works or is ruled out. *I'm going vegetarian `howar`* is a trial run, which makes the change easier to start.

## Practice {#practice}

Add the drop-in that fits the note.

**1.** *I'm quitting coffee.* (just a trial)

::: details Show answer
I'm quitting coffee `howar`.
:::

**2.** *We're selling the house.* (decided for good)

::: details Show answer
We're selling the house `thogel`.
:::

**3.** *I'm staying home tonight.* (decided for now)

::: details Show answer
I'm staying home tonight `thoger`.
:::

<!-- Source (editors): want-and-decide.md#decision, try.md#trying. -->

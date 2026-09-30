# find-english: search the docs by English phrase

Editors only — not linked from grammar pages. Proposal for `scripts/find-english.mjs`, the English-side counterpart of `node scripts/find.mjs`.

## Problem

Translating English into Agazan starts from an English cue (*anyway*, *late*, *last time*, *should have*) and needs the taught form. No tool answers that.

| Tool | Searches | Why it misses |
|------|----------|---------------|
| `npm run lexicon-search` | Lexicon rows and overlay rows, by English gloss | A form that is a hook or a construction, not a root, has no row. *Anyway* returns nothing. Fuzzy matching returns noise (*late* returns `plate`, *should have* returns `shave`). |
| `node scripts/find.mjs` | Docs examples, by parse | The query is Agazan (`role`, `ending`, `overlay`, …). It needs the form you are trying to discover. |
| `grep` | Any text | It matches only the wording the doc chose. *Last time* is taught as *penultimate*, and *as of then* as *the ledger*. |
| [english.md](../grammar/english.md) | A hand-kept table of `by` / `for` / `'s` / `about` / `as` | Only what an editor remembered to add. |

Register-sample translation of RS-1 logged G-01, G-02, G-03 and G-05 as gaps when taught routes already existed (`hulam barl` + PLAN, `gruedul`, `or …`, `thenem`). Each was missed for the reasons above, not because the docs were silent.

## Proposal

`node scripts/find-english.mjs <phrase> [<phrase> …]` searches the **English text the docs already carry** and prints the Agazan form, the section that owns it, and one example.

### What it indexes

The docs already pair English with Agazan in three regular shapes, so no separate data file is needed:

1. **Example blocks.** The quoted free English under each example (`> "Anyway, Azawan walks."`), with the example's Agazan line and morph gloss. `src/find/examples.ts` already collects these blocks for `find.mjs`; the free-English line is the extra field.
2. **Table rows.** Tables whose header has an English column (`English`, `English itch`, `Use`, `Reading`) next to an Agazan column (`Agazan`, `Form`). Each row is one entry: cue text, form, section heading.
3. **Translation practice.** The `**n.** *English*` prompts and their `Show answer` blocks.

Each entry records: English text, Agazan form, page, section id, source kind (example / table / practice), and the doc's stage (Beginner / Intermediate / Advanced) from the enclosing heading.

### How it matches

- **Word-level, stemmed, case-insensitive.** *should have* matches *should* and *ought* through a small synonym list kept in the script (*late* / *early*, *last time* / *previous* / *penultimate*, *as of* / *then* / *back then*). The list is editable and stays short; it exists for the cues that are worded differently in the docs.
- **Phrase first.** A whole-phrase hit ranks above a hit on one word. Stop words (*a*, *the*, *to*) are ignored.
- **Output is grouped by section**, best section first, three entries each, so one taught construction appears once and not once per drill.

```
$ node scripts/find-english.mjs 'anyway'
hooks.md § Point back (#hook-resume)  Intermediate
  table   `or …`             Anyway, …   (back to the main line after a side topic)
  example `or zazawan vowogal.`   "Anyway, Azawan walks."

$ node scripts/find-english.mjs 'should have'
relations.md § Stance as-of (#stance-as-of)  Advanced
  table   `thenem`           I thought / I felt (then)
sakes.md § Prescription (#sake-force)  Intermediate
  table   `…thel` / `…them` / `…ther`   ought … for this sake
```

Flags: `--json` for agents, `--count`, `--stage beginner|intermediate|advanced`, `--kind example|table|practice`, and an optional list of paths, defaulting to `docs/grammar` like `find.mjs`.

### Where the text is missing

The tool can only find what the docs say. Two follow-ups make it more useful without changing its design:

- **A phrase that returns nothing** is a real signal. It is either a gap or a form whose doc never states the English cue. Both are worth logging, and the tool's output ("no entry") is the evidence.
- **Add the missed cues to [english.md](../grammar/english.md)** (*anyway*, *late* / *early*, *last time*, *should have* / *I felt then*, *by the way*). The index picks up english.md's tables like any other, so the recipe track and the tool reinforce each other.

## Workflow change

Add one line to the **Tooling notes** in `AGENTS.md`, beside `find.mjs`:

> **Finding a form from an English cue:** run `node scripts/find-english.mjs '<phrase>'` before logging a grammar gap. Log the phrases you tried in the gap row.

And add a "before you log a gap" checklist to [syntax-test-corpus](../meta/syntax-test-corpus.md#when-a-sentence-will-not-translate-as-is) and [register-samples](../meta/register-samples.md): run the tool on the cue, then try the recurring fixes: a resume hook (`or` / `er` / `ar` / `ur`), stance as-of (`thenem`), counting from the end (`gruedul`), the discourse hooks (`ael` / `aol`), and a time pole plus PLAN.

## Implementation notes

- New `src/find/english.ts`, sharing the markdown walk in `src/markdown-files.ts` and the example collector in `src/find/examples.ts`. `scripts/find-english.mjs` uses `runBundled("find-english")` like the other scripts.
- The table reader needs care with the column shapes in use (`| Agazan | English |`, `| English | Agazan | Teach |`, `| Agazan | Use | English | Cue |`). Match on header text, not column position, and skip tables with no Agazan column.
- Strip markdown (`*`, backticks, links) from cue text before indexing. Keep the original for display.
- Tests in `src/find/english.test.ts`, run with `npm test`. Pin the four misses as fixtures: *anyway* → `or`, *late* → `zahen zel bral` and `hulam`, *last time* → `gruedul`, *should have* → `thenem`. If a doc edit breaks one, the test fails and says which cue lost its entry.
- The index rebuilds from the docs on each run, like `find.mjs`. Nothing is stored, so nothing goes stale.

## Risks and limits

- **Recall depends on doc wording.** The synonym list is the mitigation. It should stay small; a long one hides gaps by matching too much.
- **False confidence.** A hit shows a form exists, not that it fits the sentence. The tool prints the doc's own English so the reader judges the fit, and it never claims coverage.
- **Editor notes are excluded by default.** `docs/meta/` and `docs/proposals/` mention forms that are not taught. Indexing only `docs/grammar/` avoids sending an agent to an untaught form.

## Open questions

1. Does the synonym list live in the script, or in a small data file under `data/` so editors can extend it without touching code?
2. Should hits from Advanced sections be marked, so a beginner-level translation task can see that the only route is taught late?
3. Should the tool also search `docs/examples/`, as `find.mjs` does by default?

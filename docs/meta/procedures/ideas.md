# Ideas (editors)

How to write and keep an **idea**: a loose spec in `docs/proposals/ideas/` for a change nobody has planned yet. This page is all you need to write one. Turning an idea into a plan someone can build follows [proposals.md](proposals.md) instead.

## Folder and links

`docs/proposals/` sorts files by readiness:

| Folder | Holds |
|--------|-------|
| `ideas/` | loose specs: a problem, a sketch, open questions |
| `ready/` | plans that can start now ([proposals.md](proposals.md#ready-to-implement)) |
| `in-progress/` | plans with a phase under way |
| `rejected/` | ideas and plans turned down, kept as they were |

Files move between these folders, so **never markdown-link to one**, from anywhere, including other ideas. Name it by filename in backticks (`diphone-tts.md`). An idea may link out to `docs/grammar/`, `docs/meta/`, `data/`, and code.

Grammar pages never mention any of this.

## What an idea holds

An idea answers *what problem, roughly what fix, and what is still undecided*. It is not design authority and needs no plan: no phases, units, gates, digest, or commit plan.

**Header lines:**

| Line | Holds |
|------|-------|
| **Status:** | `IDEA`, the date it was written, and each user decision with its date. When an earlier version shipped, one clause naming what shipped and the doc that now owns it. |
| **Related:** | Links out to the pages, data, and code it would touch. Optional. |

**Body sections:**

1. **Problem**: what a learner or editor cannot do now, or does badly.
2. **Sketch**: the rough design. Enough that a reader can judge whether it is worth planning; one or two worked examples beat a spec.
3. **Open questions**: each states the question, lists the options, and ends with a **Recommendation:** when you have one, weighed by its effect on the learner. Say so when you have no basis to choose.

Add **Non-goals** or **Not yet** only when they head off a likely misreading. Keep an idea short: under about 100 lines. Research that runs longer (measurements, library surveys) goes in its own section at the end, so a reader can stop before it.

## Rules

- Grammar decisions belong to the user. An idea may leave them open; it never settles one by writing it into a grammar page.
- Do not write an implementation plan into an idea. When the user wants it built, it becomes a plan per [proposals.md](proposals.md#ready-to-implement) and moves to `ready/` with `git mv`.
- To drop an idea, `git mv` it to `rejected/` and put `REJECTED`, the date, and the reason on its Status line. A reason beyond *no reading yet* also gets an entry in [design-decisions.md](../design-decisions.md).
- When a plan stops with work left that nobody has planned, its remainder comes back here as an idea ([proposals.md](proposals.md#consolidate)). The shipped part is owned by its grammar or meta doc; the idea keeps only the one Status clause naming it.

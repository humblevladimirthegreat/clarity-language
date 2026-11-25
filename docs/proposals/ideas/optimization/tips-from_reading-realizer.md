# Optimization tips from the phase 3 run of `reading-realizer.md`

**Status:** IDEA, 2026-11-25.  
**Related:** `scripts/round-trip.ts`, `scripts/realize.ts`, `scripts/lib/sweep.ts`, [realizer.md: the script and probes](../../../meta/realizer.md#probes).

Not design authority. Tooling only. Measured with `npm run token-report` over session `38dcc99c` (one session ran phase 3 as its own orchestrator, with workers U9a, U9b and U9a2). The run cost 2.1M weighted tokens. One cause adds up to more than 30k.

## Problem

**Round-trip triage is put together by hand from shell pipelines, in every agent.** To find out what fails under a key and why, each agent runs `round-trip --detail KEY --limit 200` to a file, then greps it: `grep detail: | sort | uniq -c` to count reasons, `paste - - -` to put verdict, text and detail on one line, `--texts` piped through `mapfile` into `realize view` so it can grep the meaning views for a field. Each of these takes a call at 20k to 110k of context, and the larger results stay in context until the agent ends. Measured, as cost of the calls plus carry:

- Orchestrator, calls 8 to 12: it read `--detail` samples and passed hand-picked texts to `realize view` and `realize spell`, one key at a time, to check that the spell layer works before the units start. About 76k at 111k to 114k of context.
- U9a, calls 5, 6, 11, 12, 13, 17 and 34: it counted reasons, pulled texts for four keys, viewed them all and grepped the views for `rhetorical` and `edge:vocative`. Call 17 returned 4k tokens that stayed in context for 30 calls. About 93k. U9a went over its call cap and left tone marks undone. That cost a third worker (U9a2, 289k), which had to read the realizer code again.
- U9b, calls 2, 3, 22, 33, 35 and 36: the same `paste` and `uniq -c` tallies, run again after each edit. About 76k.
- U9a2, calls 2 to 6 and 21. About 52k.

Total about 300k. With a tally and a sample in the tool, each check is one call, and the run needs about 130k. **About 170k could have been avoided** (an estimate: part of each call's cost is reasoning the agent needs anyway). The report's *Recurring shapes* section does not catch this, because each agent writes the pipeline slightly differently.

## Sketch

Two flags in `scripts/round-trip.ts`, using `tripTexts` and `formatTexts` in `scripts/lib/sweep.ts`:

- `--tally KEY …`: the trips under each key, grouped by the reason in their detail line (the part after the last `: `, with the gloss replaced by `…`). Each reason gets its count and one sample text with its file. This replaces `--detail … > f; grep detail: f | sort | uniq -c` and the `paste - - -` lines.

  ```
  edge:force  145
    61  no rule for act word on -n            yam zazozon vowurol.  speech-moves.md:40
    22  gloss does not round-trip: …          yel gar zodozel.      firm-soft.md:31
  ```

- `--per-key N` with `--detail`: at most N trips from each key, not the first N overall. With it, the orchestrator checks the spell layer in one call (`--detail edge:force edge:vocative edge:polar … --per-key 1`).

In `scripts/realize.ts`, `view --key KEY [--has TEXT]`: view every text behind a round-trip key, keeping only the readings whose meaning-view JSON contains `TEXT`. This replaces U9a's chain of `--texts`, `mapfile`, `view` and `grep -B3 '"rhetorical"'`.

Then document the flags in the script paragraph and in **Probes** in `docs/meta/realizer.md`, and say there that triage starts with `--tally`. Workers' briefs point to that page, so they would try it first.

## Open questions

1. **Where to put the meaning-view filter.** Options: (a) `realize view --key KEY --has TEXT`; (b) a `--view` flag on `round-trip --detail`, which prints each trip's meaning view inline. **Recommendation:** (a). It keeps `--detail` short, and `view` already prints the meaning view. Confidence **medium**.
2. **How to group reasons.** Options: (a) take the text after the last `: ` and replace the quoted gloss; (b) have `src/round-trip/round-trip.ts` record a structured reason code beside the free-text detail. **Recommendation:** (a) for now. (b) is cleaner but touches every gap site. Confidence **medium**.

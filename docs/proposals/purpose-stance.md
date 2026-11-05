# Proposal: Purpose is a stance (`thovam`)

**Status:** PROPOSED, ready to implement. Workstreams done: none.

User decisions (2026-11-05):
- The purpose job (*so that*, *in order to*, *what for?*, *so that … not*) **stays**. It is not removed.
- It moves from `/h/` to `/th/`, so it follows the rules every mind word already follows.
- In a question, `/th/` purpose asks about the listener's aim, like any channel in a question ([in a question](#in-a-question)).
- `govam` keeps its spelling on a noun and takes the same reading: your aim for the thing ([on a noun](#on-a-noun)).

**Related:** [dependents.md](../grammar/beginner/dependents.md#hinges) (the hinge letter rule, [so that](../grammar/beginner/dependents.md#so-that)), [intention.md](../grammar/beginner/intention.md#plan) (PLAN is yours by default), [holder.md](../grammar/intermediate/holder.md#holder), [prescription.md](../grammar/intermediate/prescription.md#motive) (motive and its "other English *for*" list), [evidentiality.md](../grammar/intermediate/evidentiality.md) (a channel in a question asks the listener), [fill-ask-jobs.md](../grammar/beginner/fill-ask-jobs.md#why), [stand-in-vowels.md](../grammar/intermediate/stand-in-vowels.md) (`blurl` *so that … not*), [sentence-linkers.md](../grammar/intermediate/sentence-linkers.md) (`hahom` vs purpose), [extra-noun-hooks.md](../grammar/beginner/extra-noun-hooks.md), [purpose.md](../grammar/purpose.md), [english.md](../grammar/english.md), [say-reasons.md](../grammar/say-reasons.md), [say-amounts.md](../grammar/say-amounts.md), [terminology.md](../grammar/terminology.md), [linking-clauses](../grammar/cheat-sheets/linking-clauses.md) and [talking](../grammar/cheat-sheets/talking.md) cheat sheets, [`data/lexicon-overlays.csv`](../../data/lexicon-overlays.csv) (`ovam` rows), [`src/parse/parse.test.ts`](../../src/parse/parse.test.ts), [syntax-test-corpus.md](../meta/syntax-test-corpus.md), [design-decisions.md](../meta/design-decisions.md) (D-46), [unassigned-reserved.md](../meta/unassigned-reserved.md), [proposals.md](../meta/proposals.md).
**Depends on:** none.
**Design authority:** changes these forms and readings:
- The purpose hinge is spelled `thovam` in every job: `thovam blarl` *so that*, `thovam blurl` *so that … not*, `thovam blar` *what for?*, and `thovam` + `bl-` noun *for a goal*.
- A bare purpose is the **speaker's own aim**. Someone else's aim goes through a holder.
- `hovam` is left with no reading (**closed**).
- In a question, the purpose is the **listener's** aim.
- `govam`, on a noun, keeps its spelling and takes the same reading: your aim for the thing.

Once implemented, the grammar pages own the result and this file is deleted.

## Problem

1. **Purpose is filed as a fact about the event.** [dependents.md](../grammar/beginner/dependents.md#hinges) splits the hinges by letter:
   - *because* and *if* are "your stance on why the claim holds", so they take `/th/`;
   - *although*, *while*, *until*, *before*, *after*, and *so that* "describe the event itself", so they take `/h/`.

   *Before* and *after* really are facts others could check. *So that* is not: an act has a purpose only because someone holds an aim for it.
2. **So nothing says whose aim it is.** `zazozon vowurol hovam blarl zazozon vehohel.` *Azozon walks in order to sit* states Azozon's intention with no warrant. [D-46](../meta/design-decisions.md) forbids exactly this for WANT, PLAN, DECISION, and motive: "reading intentions into others is a classic bias, so it needs a channel".
3. **The neighbouring form undoes motive's protection.**
   - Motive never reads as the actor's own reason ([design-decisions](../meta/design-decisions.md), *No default reading of a motive as the actor's own*).
   - But the motive page sends every intended event to `hovam`, which has no such rule.
4. **A reading rule on `/h/` is not enough.** One fix kept `/h/` and read the aim "as the speaker sees it". That still lets the speaker state a guess at someone else's aim, so it renames the mind-reading without removing it.

## Goals

1. Purpose obeys D-46 like every other mind word: it is yours by default, and someone else's goes through a holder.
2. Your own aim stays one easy form, in statements, commands, prevention, and *what for?*.
3. Every page that uses *so that* agrees with the new reading.

## Non-goals

- **Other hinges stay as they are.** That covers the result hinge `hahom` (it claims the result happened), the time hinges, and *because*.
- **No change to motive (`tho`) or to the sakes.**
- **No ban on talking about others' aims.** They go through the holder, as plans and wants already do.
- **No same-role `ovam`, ever.** A letterless form would drop the `/th/` that makes the aim the speaker's. `same-role-relations.md` lists every `/th/` relation as off its list.

## Design

### The form

The root stays `ova` (🥅 *goal*), and only the role letter changes. Every job `hovam` had moves over unchanged:

| Job | Before | After |
|-----|--------|-------|
| *so that* / *in order to* | `hovam blarl` | **`thovam blarl`** |
| *so that … not* | `hovam blurl` | **`thovam blurl`** |
| *what for?* | `hovam blar` | **`thovam blar`** |
| *for* a goal noun (*practices for a race*) | `hovam` + `bl-` | **`thovam`** + `bl-` |
| on a noun | `govam` | `govam` (same spelling; [your aim](#on-a-noun)) |

- **The pair works like *because*.** `thovam blarl` takes the same place as `thahum blarl`: last in the main sentence, with **`blarl`** at the very end.
- **It still makes no claim that the outcome happens.** That is unchanged from `hovam`, and it is still the contrast with `hahom`.
- **The hinge letter rule** on dependents.md moves *so that* into the stance group: *because*, *if*, *only if*, *if and only if*, and *so that* are your stance, so they take `/th/`. *Although*, *while*, *until*, *before*, and *after* describe the event itself, so they take `/h/`.

### Whose aim

Like any `/th/` word with nothing else marked ([intention.md](../grammar/beginner/intention.md#plan)), the purpose is **yours**, the speaker's.

| Subject | Reading | Example |
|---|---|---|
| **I / we** | Your own aim. | `zuwen vowurol thovam blarl zuwen vehohel.` *I walk in order to sit.* |
| **You**, in a command | Your aim for the listener's act. | *Walk so that you sit.* |
| **Someone else** | Your aim for their act (a coach, a parent), never your guess at theirs. The same holds for PLAN: `zazozon thagom vowurol` is *I plan for Azozon to walk*. | `zazozon vowurol thovam blarl zalazun vehohel.` *Azozon walks, and my aim is for Alazun to sit.* |
| **Someone else's own aim** | Put a holder on the clause, so the clause is their view and the holder says how you know. | `zazozon thebamazozon vowurol thovam blarl zazozon vehohel.` *I hear Azozon walks in order to sit.* |
| **Something with no aimer** | Function with nobody's aim is not purpose. Use the result hinge if it happened, or say what the thing can do. | *The door lets air in.* |

**Free English.**
- With *I* or *we* as the subject, *so that* / *in order to* reads as it does in English.
- With anyone else, the free English shows that the aim is yours, the way motive shows *to me it is about* ([prescription.md](../grammar/intermediate/prescription.md#motive)): *Azozon walks, and my aim is for Alazun to sit*.
- English *Azozon walks in order to sit*, said as Azozon's own aim, takes a holder. Never translate a bare `thovam` as *Azozon wants* or *Azozon intends*.

### In a question

A channel in a question asks about the **listener's** grounds ([evidentiality.md](../grammar/intermediate/evidentiality.md)). `/th/` purpose does the same: in a question, the aim is the listener's.

- `yel thovam blar zawan vowurol.` *What do you walk for?* asks the actor directly, which is the honest way to learn an aim.
- With a third-person subject, `yel thovam blar zazozon vowurol.` asks *What is your aim for Azozon's walk?* To learn what Azozon is aiming at, ask Azozon, or ask with a holder.

### On a noun

`govam` keeps its spelling on a noun (*a key for the door*), as `ahum` keeps a `/ɡ/` row beside `/th/`, and takes the same reading as the hinge: **your aim for the thing**. This matches motive on `/ɡ/`, which already gives your own noun's purpose. Its only learner-facing use today is a cheat-sheet row.

### Why `/th/` and not removal

Removing the hinge would lose the harmless uses, which are also the most common:
- your own purpose;
- purpose in commands;
- *what for?* asked of the actor;
- prevention (`thovam blurl`), which [prescription.md](../grammar/intermediate/prescription.md#motive) relies on for a reason held to keep a cost off.

PLAN cannot stand in, because it cannot link a means to an end.

On `/th/`, the bare form has no *their aim* reading at all, so the only way to state someone else's aim is the holder, which asks how you know.

**The cost:** third-person purpose in narration (*Azozon went out to buy milk*) needs a holder, or it reads as your own aim. The language already pays this cost for *Azozon plans* and *Azozon wants*. D-46 says why it is worth paying.

### Rejected

- **`hovam` with no reading.** Log it as **closed** in unassigned-reserved. Add a design-decisions entry: an aim is in a mind, so it is `/th/` under D-46, and a bare `/h/` form would state the actor's intention with no channel. The same entry records that a `/th/` relation has no letterless same-role form (`ovam`), because its letter is its meaning.
- **Keeping `/h/` with an "as the speaker sees it" rule.** It still states the speaker's guess at another's aim ([problem 4](#problem)).

## Implementation plan

The work runs in **one session**, per [proposals.md](../meta/proposals.md):
- The main agent does the baseline, the parser and data, and the closing.
- One subagent does the pages, which share one context: every *so that* example and the lines that teach it.

| Workstream | Who | Commit |
|------------|-----|--------|
| 0 baseline | main agent, no edits | none |
| 1 parser and data | main agent | together with 2 |
| 2 pages | one subagent | 1: `purpose stance: 1-2, purpose hinge moves to /th/ [skip-cd]` |
| 3 closing | main agent | 2: `purpose stance: 3, closing [skip-cd]` |

### Rules for the main agent

- **Sequential.** The overlay CSV, `constructions.ts`, the cheat sheets, unassigned-reserved, and design-decisions take one writer at a time.
- **One commit for workstreams 1 and 2.** Per `AGENTS.md`, a change to what the parser accepts lands with the page that teaches it.
  - Each message ends with a blank line and `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
  - Stage only this proposal's files. Never amend or force-push. Subagents never commit.
  - After each commit, update **Status**.
- **Green between items.** Send a failure back to the subagent that made it.
- **No grammar decisions.** A form or reading this Design does not settle goes under [open decisions](#open-decisions), and the item is skipped.
- **Stop and alert** ([proposals.md](../meta/proposals.md#stop-and-alert)) if any of these holds:
  - `thovam blarl` cannot pass `grammar-check` without a gate or a second tree;
  - a holder on the clause does not cover the hinge pair, so *someone else's aim* has no form;
  - an example cannot be recast without a form this proposal does not give.

### Gates

| When | Run |
|------|-----|
| After any item | `npm run build` and `npm test`. Check every changed example with `node scripts/parse.mjs` (several inputs in one call). |
| After a change to `sentence-parser.ts` | `npm run grammar-check` |
| After a change to `data/lexicon-overlays.csv` | `npm run english-helper-wordnet` |
| After a change to `src/english-helper/` or a recipe table | `npm run english-helper-recall -- --check` |
| After a cheat-sheet change | `npm run cheat-sheet-blocks -- --write`, then the build. Run `npm run lint:cheat-sheet-print -- --only <id>` if Chromium is installed. |

### Subagent brief
<a id="subagent-brief"></a>

1. **Read once, at the start:** this proposal's [Design](#design) and [Gates](#gates), plus the rules in step 3. Read each page when its first item needs it.
2. **Edit only** the files workstream 2 lists.
3. **Follow these rules:**
   - `AGENTS.md`;
   - [present the current language only](../meta/grammar-docs.md#present-the-current-language-only), [teach now; don't preview later](../meta/grammar-docs.md#teach-now-dont-preview-later), [house cast](../meta/grammar-docs.md#house-cast), [marking Ageben](../meta/grammar-docs.md#marking-ageben), and [retie-safe writing](../meta/grammar-docs.md#retie-safe-writing);
   - [doc-style.md](../meta/doc-style.md) and [glosses.md](../meta/glosses.md), including when a free-English note is required.
4. **No grammar decisions.** If an example needs a form the Design does not give, report it and leave the example as it is. If a finding would change later items, report it and stop.
5. **Report each item** in fixed fields:
   - what changed, with ids
   - files touched, as a count
   - examples recast, as a count, plus any left as they were, with reasons
   - cheat-sheet edits
   - `AGENTS.md` Owns lines to change
   - gate results
   - anything skipped, and why

### Workstream 0: baseline (main agent, no edits)

- Run `git status`. If a file this proposal edits has changes it did not make, **stop and ask the user** to commit or stash them.
- Run `npm run build`, `npm test`, and `npm run grammar-check`, and record the results.
- Count the uses: `node scripts/find.mjs --word 'root=ova,role=[hg]' --count` over `docs/grammar`, `docs/meta`, `src`, and the TSVs. Record the count for the report.

### Workstream 1: parser and data (main agent)

**May edit:**
- `data/lexicon-overlays.csv`, `src/parse/` and its tests, `src/closed-roots.ts`;
- `src/english-helper/` (`cases.tsv`; the baseline only when the numbers improve);
- `docs/meta/unassigned-reserved.md` and `design-decisions.md`.

| Item | Work |
|------|------|
| 1.1 | **Overlay rows.** `ovam,h` becomes `ovam,th`, with the same kind (`clause_hinge`) and gloss. Its definition gains *the speaker's aim*. `ovam,g` keeps its spelling; its definition gains *the speaker's aim for the thing* ([on a noun](#on-a-noun)). |
| 1.2 | **Hinge class.** List `thovam` with the `/th/` hinges, so `blarl`, `blurl`, `blar`, and a `bl-` noun follow it as they followed `hovam`. Make sure a holder on the clause covers the pair (see stop and alert). Retire `hovam` with a construction that names `thovam`. Run `grammar-check`. |
| 1.3 | **Readers and helper.** <ul><li>Give the hinge a `reader` note in `constructions.ts`: the speaker's own aim; with another subject, write *my aim is …*; in a question, the listener's aim (*what do you … for?*, or *what is your aim for …?* with another subject); never *wants* or *intends*.</li><li>Update `llm-prompt.ts` if it names `hovam`.</li><li>English-helper cases: *in order to* with *I* → `thovam blarl`; *X intends to* / *X's plan is to* → holder + PLAN.</li><li>Fix the literal in `parse.test.ts`.</li></ul> |
| 1.4 | **Notes.** Add a **closed** row for `hovam` in unassigned-reserved. Extend D-46 (or add a sibling entry) per [rejected](#rejected). |

**End:** run the gates. Do not commit; workstream 2 follows.

### Workstream 2: pages (one subagent)

**May edit** the files in **Related** above, and `docs/grammar/intermediate/holder.md`. Edit the cheat sheets by the generator, or by hand only outside the `<!-- generated -->` markers.

| Item | Work |
|------|------|
| 2.1 | **Letter swap, scripted.** Run `node scripts/find.mjs --word 'role=h,root=ova' --map role=h:th` as a dry run, then with `--write` (add `--tests` for test files) over `docs/grammar`, `docs/meta`, and the TSVs. Then grep for any `hovam` the script could not reach (prose, tables, cue rows) and fix those by hand. Run the build. |
| 2.2 | **Recast the examples.** For every *so that* example: <ul><li>With *I* / *we* as subject, keep it.</li><li>With anyone else, recast it on beginner pages with *I* as the subject. On intermediate and later pages, either recast it, or keep it with the *my aim* free English, or add a holder where the point is someone else's aim.</li><li>On Practice items, change only the subject and the English, with no new words. Report any item that needs more.</li></ul> |
| 2.3 | **Teaching lines.** <ul><li>dependents.md: the hinge letter rule, the *So that* section (one paragraph on whose aim; no holder link, since the holder is later), the hinge table row, and the cue row.</li><li>holder.md *Someone else's plan*: a Compare-with line for someone else's aim.</li><li>prescription.md: the "other English *for*" bullet.</li><li>purpose.md: the causation paragraph.</li><li>stand-in-vowels.md: the `blurl` exception.</li><li>sentence-linkers.md: the `hahom` contrast.</li><li>extra-noun-hooks.md: the Compare-with line.</li><li>fill-ask-jobs.md *Why*: the *what for?* example asks the listener, per [in a question](#in-a-question).</li></ul> |
| 2.4 | **Recipes, terminology, cheat sheets.** english.md, say-reasons.md, say-amounts.md, the terminology entries, and the hand-written cheat-sheet rows (including the talking sheet's *What for?* row, per [in a question](#in-a-question), and the `govam` row, per [on a noun](#on-a-noun)), then `npm run cheat-sheet-blocks -- --write`. |

**End:** the main agent runs every gate, reads `git diff --stat`, and makes commit 1.

### Workstream 3: closing (main agent)

- Apply any reported `AGENTS.md` Owns-line changes.
- Delete this proposal, or move it to `partially-implemented/` if an item was skipped.
- Run the build and tests, then make commit 2.

## Open decisions

None. Both earlier questions were settled on 2026-11-05 and are now in [Design](#design).

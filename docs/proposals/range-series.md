# Proposal: One range series for every ordered line

**Status:** PROPOSED. Decided by the user on 2026-11-04: option U2 below.
**Related:** [ordered-ranges.md](../grammar/intermediate/ordered-ranges.md#ranges), [numbers-applied.md](../grammar/intermediate/numbers-applied.md#ranges), [open-ranges.md](../grammar/advanced/open-ranges.md), [hooks.md](../grammar/beginner/hooks.md) (*including* / *except*), [extra-noun-hooks.md](../grammar/beginner/extra-noun-hooks.md), [say-amounts.md](../grammar/say-amounts.md), [unassigned-reserved.md](../meta/unassigned-reserved.md), [design-decisions.md](../meta/design-decisions.md), [`src/parse/morph-gloss.ts`](../../src/parse/morph-gloss.ts) (`HOOK_SPAN`), [`src/parse/constructions.ts`](../../src/parse/constructions.ts).
**Design authority:** this proposal changes grammar. It removes the number-only range reading of `al` / `ul` / `am` / `um` / `an` / `ar` / `ur` / `un`, and it assigns `uel` between same-role words. Once implemented, the grammar pages own the result, a short entry in design-decisions records why, and this file is deleted.
**Order:** implement this before `sitting-cohesion.md`, whose ranges item assumes the series is already unified.

## Problem

Ageben has two range systems today.

- **The range hooks** (`oel` *through*, `ual` *strictly between*, `uol` *outside*) work on any ordered line: people in a queue, days, chapters, numbers. They have no half-open form.
- **A number-only family** reuses the in-clause hooks. `al` (*including*) reads as *through* between two numbers, because "3, including 5" has nothing to include into. `ul` (*except*) reads as *up to B, B left out*. The family's soft (-m), some-member (-r), and named (-n) endings get matching range readings.

For *3 through 5*, a learner meets `zragel oel zrazal` early in the Intermediate group and `zragel al zrazal` 11 sittings later. Both pages call their H3 *Ranges* with `{#ranges}`, and neither says which form to reach for. The morph glosses already render both as *through* ([`HOOK_SPAN`](../../src/parse/morph-gloss.ts)).

### Where ranges confuse

Range spellings borrow from three systems a learner has already met: the in-clause hooks (`al` *including*, `ul` *except*), the [extra-noun hooks](../grammar/beginner/extra-noun-hooks.md) (`al` *in*, `ul` *from*, `oel` *toward*, `ual` *out of*, `uel` *through*, `uol` *against*), and the joins (`zoel` tie, `zaol` route, `zual` everything). Ordered by risk:

| # | Confusion | Example | Why it happens | Risk | After this proposal |
|---|-----------|---------|----------------|------|---------------------|
| 1 | **`ul` read as *from*** | *from 3 to 5* → `zragel ul zrazal`, which today means *3 up to but not including 5* | `ul` is *from* as an extra-noun hook, and *from … to* is the commonest English range phrase | High: a natural guess parses and silently means something else | Gone: `ul` is never a range |
| 2 | **`uel` read as *through*** | *Azozon through Ahelan* → `zazozon uel zahelan` | `uel` is *through* as an extra-noun hook, but the range *through* is `oel` | Medium: today the parser rejects it | Remains, as a silent misread; see [costs](#costs) |
| 3 | **`al` changes reading with its items** | `zazozon al zahelan` *including*; `zragel al zrazal` *through* | One spelling, two readings, chosen by whether both ends are numbers | Medium | Gone: `al` always means *including* |
| 4 | **The digits condition is wrong as written** | numbers-applied requires digits on both ends, but open-ranges uses `zrazal al zrawal` (+∞) and `zrodol al zrowal` (*2nd through last*) | The rule was written before rays and first / last place were ends | Medium | Gone: the [endpoint rule](#endpoints) replaces it (digitless ends allowed, mixed kinds banned) |
| 5 | **The u-forms look alike** | `ul` / `ual` / `uol`; under -r, `ur` (inside) vs `uor` (outside) | No stated logic for the second vowel | Medium | Gone: one [cue](#the-series) for the `u` forms |
| 6 | **Half-open only for numbers** | *Monday up to but not including Friday* has no form | `ul` is *except* between non-numbers | Medium | Gone: `uel` works on every line |
| 7 | **Order matters for some hooks only** | `zragel ul zrazal` [3, 5) vs `zrazal ul zragel` (3, 5] | Only one-end exclusion depends on which end is said second | Low | Same, now on `uel`; teach it once |
| 8 | **Range hook vs join with the same vowels** | `oel` (range) vs `zoel` (tie); `aol` (*using*) vs `zaol` (*then*) | Same vowel pairs | Low: the role letter decides | Unchanged |
| 9 | **Range vs extra noun when `/b/` is involved** | `oel` with `/b/` on the right and none on the left is *toward*; between two `/b/` words it is a range | The reading turns on the left word's role | Low | Unchanged; add one `/b/` range example |

## Decision: U2

### The series
<a id="the-series"></a>

One series works on any ordered line, numbers included:

| What is in | Hook | -m (soft ends) | -r (some member) | -n (named band) | Gloss |
|------------|------|----------------|------------------|-----------------|-------|
| A, B, and everything between | `oel` | `oem` | `oer` | `oen` | through |
| A and between, B left out | **`uel`** (new) | `uem` | `uer` | `uen` | through-excluding |
| Only what lies between | `ual` | `uam` | `uar` | `uan` | strictly-between |
| Only what lies outside | `uol` | `uom` | `uor` | `uon` | outside |

- **Cue for the `u` forms:** **u** ≈ leave something out, and the second vowel says what. **e** is the point B (as in `el` *at*), **a** is both ends, **o** is the whole stretch.
- **Which end `uel` leaves out:** the end said second, as `ul` does today. To leave out the low end, say it second: `zrazal uel zragel` is (3, 5].
- **-r and -n:** a range -r or -n needs a word on each side, as today. With nothing on the right, `uer` stays the extra-noun point-back *through there*, and `uem` stays the hook's ordinary zone reading.
- **-m:** with a word on each side, `uem` is *up to about B, not quite B* (today's `um`).

### Endpoints
<a id="endpoints"></a>

A range needs two points on one ordered line:
- people or things in a known order (a queue, days, chapters)
- numbers of one kind: amounts (scalar), ranks, or labels / times. Each number's kind comes from its marker (`SPAN_ENDPOINT_KIND` in [`src/parse/hook-jobs.ts`](../../src/parse/hook-jobs.ts)).
- ±∞ (`rawal` / `ruwal`)
- first or last place (`rowul` / `rowal`)

**Digitless ends count** (user decision, 2026-11-04). Rays already use them, so `zral oel zrazal` has a range reading. Drop the old digits-on-both-ends requirement everywhere it is stated.

**Mixed kinds are banned** (user decision, 2026-11-04). `zragel oel zrodol` (an amount through a rank) is rejected by the parser under a new construction, `rangeEndpointKind`. It goes into unassigned-reserved as **closed**. The design-decisions reason: a range needs one ordered line, and an amount and a rank are not one line.

### `al` and `ul` between numbers

These keep their ordinary in-clause readings: `A al B` *A, including B*, and `A ul B` *A, except B* ([hooks](../grammar/beginner/hooks.md)). That reading is legitimate for labels, as in *apply option 3, including option 5*. Between amounts it has no natural sense, but nothing is banned. The page simply doesn't teach it. `am`, `um`, `ar`, `ur`, `an`, and `un` likewise keep their ordinary hook readings.

### Rewrites

| Today | After |
|-------|-------|
| `zragel al zrazal` *3 to 5* | `zragel oel zrazal` |
| `zragel ul zrazal` [3, 5) | `zragel uel zrazal` |
| `zrazal ul zragel` (3, 5] | `zrazal uel zragel` |
| `zragel am zrazal` *roughly 3 to 5* | `zragel oem zrazal` |
| `zragel um zrazal` *3 up to about 5, not quite 5* | `zragel uem zrazal` |
| `zrazal al zrawal` *5 or more* | `zrazal oel zrawal` |
| `zrawal ul zrazal` *more than 5* | `zrawal uel zrazal` |
| `zruwal al zrazal` *at most 5* | `zruwal oel zrazal` |
| `zruwal ul zrazal` *less than 5* | `zruwal uel zrazal` |
| `zrodol al zrowal` *2nd through last* | `zrodol oel zrowal` |
| `z+13 an z+19` *the teens* | `z+13 oen z+19` |
| `zragel ar zrazal` *some value from 3 to 5* | `zragel oer zrazal` |
| `zragel ur zrazal` *some value from 3 up to 5* | `zragel uer zrazal` |
| `zodozel gragel al grazal` *three to five dogs* | `zodozel gragel oel grazal` |

Every rewrite still has to parse with `node scripts/parse.mjs`.

### Rejected alternatives (for design-decisions)

- **U0, teach both families side by side, no grammar change.** This leaves confusion 1 (a silent *from* misread), confusion 3 (one spelling, two readings), and confusion 6 (no half-open on non-number lines).
- **U1, add `uel` and keep `al` / `ul` as number twins of `oel` / `uel`.** This fixes 5 and 6, but keeps 1 and 3. The ban's stated cost: `ul` between numbers reads as English *from*, and the misread parses.

### Costs
<a id="costs"></a>

- **`uel` *through* (extra noun) vs `uel` *B left out* (range).** A learner who guesses *Azozon through Ahelan* = `zazozon uel zahelan` gets a half-open range. Today that is a parse error. The split matches the other range hooks: `oel` is *toward* / *through*, `ual` *out of* / *strictly between*, `uol` *against* / *outside*. The range table gets one Compare-with line: *for* through, *use `oel`; `uel` leaves B out*.
- **A short, already-taught form goes.** `al` is one vowel shorter than `oel`.

## Scope of change

Locate every number-range use with:

```sh
node scripts/find.mjs --seq 'family=number' 'raw=(al|ul|am|um|ar|ur|an|un)' 'family=number'
```

Add `src docs/meta` and `--count` as needed. Today this finds 74 examples in `docs/grammar`:

| File | Matches | Notes |
|------|---------|-------|
| [open-ranges.md](../grammar/advanced/open-ranges.md) | 27 | rays, ranks, named bands, -r. Restate the endpoint rule |
| [cheat-sheets/numbers.md](../grammar/cheat-sheets/numbers.md) | 18 | rows outside `<!-- generated -->` markers are edited by hand; generated ones come from `npm run cheat-sheet-blocks -- --write` |
| [numbers-applied.md](../grammar/intermediate/numbers-applied.md) | 12 | the *Ranges* H3: rewrite (see [page shape](#page-shape)) |
| [say-amounts.md](../grammar/say-amounts.md) | 12 | recipe rows (*at least* / *at most*, *range*, *multiple*, some value). These rows feed the English helper |
| [review-advanced.md](../grammar/advanced/review-advanced.md) | 3 | item 8, *at most five*, accepts `gruwal ul grazal` as an alternative. That means *fewer than five* today, so the answer key is already wrong. Rewrite the item to `gruwal oel grazal` only |
| [number-markers.md](../grammar/intermediate/number-markers.md) | 2 | shorthand example `z+3 al z+12` |
| [`morph-gloss.test.ts`](../../src/parse/morph-gloss.test.ts) | 5 | lines 98–104. `zral al zrazal` *including* stays |
| `docs/meta/syntax-test-corpus.md` | 1 | |

Also in scope:
- [`src/parse/morph-gloss.ts`](../../src/parse/morph-gloss.ts) `HOOK_SPAN`: drop the number readings of `al` `am` `an` `ar` `ul` `um` `un` `ur`, so they gloss as *including* / *except*. Add `uel` *through-excluding*, `uem` *through-excluding.approx*, `uen` *through-excluding.named*, and `uer` *some.through-excluding*.
- [`src/parse/sentence-parser.ts`](../../src/parse/sentence-parser.ts) (or wherever the same-role hook gate lives; constructions key `hookSameRoleStack`): accept `uel` / `uem` / `uen` / `uer` between same-role words, and drop any number-only range path for `al` / `ul`. Run `npm run grammar-check`.
- [`src/parse/constructions.ts`](../../src/parse/constructions.ts):
  - add `uel` / `uer` range entries anchored at `ordered-ranges.md#ranges`;
  - update `hookSameRoleStack`'s message to list `uel`;
  - update reader notes, so `--llm-prompt` explains the range series and that `al` / `ul` between numbers mean *including* / *except*.
- [`src/english-helper/analyze.ts`](../../src/english-helper/analyze.ts): its `numberCuePhrase` comment and anything that respells range rows (`grazal al grawal`). Add `src/english-helper/cases.tsv` lines for *3 to 5*, *up to but not including*, *at most*, and *at least*. Run `npm run english-helper-recall -- --check`, then `-- --write-baseline` if the numbers improve. Never edit `wild.tsv`.
- [ordered-ranges.md](../grammar/intermediate/ordered-ranges.md): the [series table](#the-series) with the `u` cue, plus examples for `uel`, `uer`, and one `/b/` range. Cut the sentence that sends numbers to `al` / `ul`.
- [unassigned-reserved.md](../meta/unassigned-reserved.md):
  - drop `uel` from the open in-clause stacks;
  - fix that line's vowel labels: it lists "`ao` / `ae` / `ue` (`ael` / `aol` / `uol`)", but the parser's open stacks are `ael` / `aol` / `uel`, and `uol` is assigned;
  - add the mixed-kind endpoint case from [endpoints](#endpoints) as **closed**.
- [design-decisions.md](../meta/design-decisions.md): one entry giving the decision (one series; `al` / `ul` keep *including* / *except*, useful for labels) and the [rejected alternatives](#rejected-alternatives-for-design-decisions).
- Checkpoints: Practice items in numbers-applied and open-ranges that use the old forms are rewritten in place (same item, new spelling). Changing a spelling is not a refill.

### Page shape
<a id="page-shape"></a>

This proposal edits pages in place and moves nothing between pages; `sitting-cohesion.md` merges them later.
- **ordered-ranges `#ranges`:** the series, the cue, and the endpoint rule.
- **numbers-applied's H3:** becomes `### Ranges of numbers {#number-ranges}`. It covers:
  - number ends use the same hooks (link to `#ranges`);
  - ranges on a counted noun;
  - which end `uel` leaves out;
  - the endpoint rule for kinds of number;
  - a Compare-with line: *`zragel al zrazal` is* 3, including 5*, an ordinary hook, not a range*.

  It drops the `ual` / `uol` rows (taught once on ordered-ranges) and the three silent anchors under the heading (`number-ranges`, `numeric-ranges`, `from-to`), retargeting their links to the new id.
- **open-ranges:** rays and named bands in the new spellings. Its *range* link points at `#number-ranges`.

## Implementation plan

**How the work runs (user decision, 2026-11-04):** one session, no subagents. Start from a clean worktree.

**Commits:** commit at the end of each step (0 has nothing to commit). This is an exception to the usual policy, under which agents never commit. The message reads `range series: step N, <summary>`, then `[skip-cd]`, then a blank line, then `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Before committing:** run `npm test`, and `npm run build` when docs changed.
- **Steps 1 and 2 go together:** the build checks doc glosses against the parser, so it may fail after Step 1 until Step 2 lands. Commit Step 1 anyway once `npm test` and `npm run grammar-check` pass, and say in the message that the build is red until Step 2.
- **Every later step:** commit only when green.

### Step 0: Baseline
- `npm run build`, `npm test`.
- The baseline count for `node scripts/find.mjs --count --seq 'family=number' 'raw=(al|ul|am|um|ar|ur|an|un)' 'family=number'` is **74** in the default paths and **6** in `src docs/meta`. Re-check it.

### Step 1: Parser and glosses
Code locations, as checked on 2026-11-04:
- [`src/parse/hook-jobs.ts`](../../src/parse/hook-jobs.ts):
  - `isSpanHook` (~line 53): a span is vowels `oe` / `ue` / `ua` / `uo` between same-role words. Remove the single-vowel `a` / `u` path, the number-only range.
  - `spanEndpointKind` (~line 37): return the marker's kind whether or not the number has digits; keep the `SPAN_ENDPOINT_KIND` table. Check its other callers.
- [`src/parse/enforce.ts`](../../src/parse/enforce.ts):
  - `enforceHookSlot` (~line 345): drop `ue` from the `clause` (same-role) gate, so `uel` between same-role words parses.
  - New check: a `span` hook between two number words whose `spanEndpointKind`s differ throws `ConstructionError("rangeEndpointKind", …)`.
  - `enforceStackedHookR` keeps `ue` exempt, so a lone `uer` stays the extra-noun point-back *through there*.
- [`src/parse/morph-gloss.ts`](../../src/parse/morph-gloss.ts) `HOOK_SPAN` (~line 1079): remove `al am an ar ul um un ur`. Add `uel` through-excluding, `uem` through-excluding.approx, `uen` through-excluding.named, `uer` some.through-excluding.
- [`src/parse/constructions.ts`](../../src/parse/constructions.ts):
  - `hookSameRoleStack` (~line 755): the message lists the range hooks as `oel uel ual uol`.
  - Add `rangeEndpointKind`, anchored at `ordered-ranges.md#ranges`.
  - Add `uel` / `uer` range entries.
  - Reader notes for `--llm-prompt`: one series, and `al` / `ul` between numbers mean *including* / *except*.
- Tests:
  - `morph-gloss.test.ts` lines ~98–104: `zral al zrazal` *including* stays.
  - `invalid-forms.test.ts`: add a mixed-kind case (`zragel oel zrodol.`), and remove any same-role `uel` rejection.
- Run `npm run grammar-check`.

### Step 2: Mechanical respelling
- Dry run:

  ```sh
  node scripts/find.mjs --seq 'family=number' 'raw=(al|ul|am|um|ar|ur|an|un)' 'family=number' --map raw=al:oel,ul:uel,am:oem,um:uem,an:oen,ar:oer,ur:uer,un:uen
  ```

  Then run it again over `src docs/meta` with `--tests`.
- Read the diff:
  - Only the hook slot may change.
  - Test pins that check the *including* reading (`zral al zrazal`) must stay.
- Then add `--write`. It regenerates the morph glosses.
- This covers most of the [scope table](#scope-of-change).
- Respell Practice items in place; changing a spelling is not a refill.

### Step 3: Hand edits to pages
Follow the [page shape](#page-shape):
- **ordered-ranges `#ranges`:**
  - the series table and the `u` cue;
  - which end `uel` leaves out;
  - `uel` / `uer` examples and one `/b/` range example;
  - the Compare-with line from [costs](#costs);
  - the amended [endpoint rule](#endpoints).
  - Cut the sentence that sends numbers to `al` / `ul`.
- **numbers-applied:**
  - the H3 becomes `### Ranges of numbers {#number-ranges}`, with the contents listed under page shape;
  - drop the `ual` / `uol` rows and the silent anchors;
  - grep the repo for links to `number-ranges`, `numeric-ranges`, `from-to` and `#ranges` on that page, and retarget them.
- **open-ranges:** restate the endpoint rule (digitless ends fine, no mixing). The *range* link points at `#number-ranges`.
- **review-advanced item 8:** the answer is `gruwal oel grazal` only.
- **say-amounts and number-markers:** reread the prose around the respelled rows.
- **Cheat sheets:** `npm run cheat-sheet-blocks -- --write`.
- Rules: [present the current language only](../meta/grammar-docs.md#present-the-current-language-only) (no "formerly `al`" notes), and [glosses](../meta/glosses.md).

### Step 4: Meta pages
- [unassigned-reserved.md](../meta/unassigned-reserved.md):
  - drop `uel` from the open in-clause stacks;
  - fix the vowel labels to `ael` / `aol` / `uel`;
  - add mixed-kind endpoints as **closed**.
- [design-decisions.md](../meta/design-decisions.md):
  - the U2 entry (one series; `al` / `ul` keep *including* / *except*, useful for labels);
  - the [rejected alternatives](#rejected-alternatives-for-design-decisions);
  - the mixed-kind ban.

### Step 5: English helper
- [`src/english-helper/analyze.ts`](../../src/english-helper/analyze.ts): the `numberCuePhrase` comment and any range respelling Step 2 missed (`grazal al grawal`).
- [`src/english-helper/cases.tsv`](../../src/english-helper/cases.tsv) pins: *3 to 5*, *up to but not including*, *at most*, *at least*. Never edit `wild.tsv`.
- `npm run english-helper-recall -- --check`, then `-- --write-baseline` if the numbers improve.
- `npm run english-helper-wordnet` only if a lexicon CSV changed (it should not).

### Step 6: Sweep and close
- Re-run the `find.mjs --count`: target 0, except Compare-with lines that show the *including* reading.
- Grep the prose for "through" near `al`, and for `ul` near *from*.
- `node scripts/find-english.mjs 'up to but not including'` and `'at most'` land on the new forms.
- Delete this proposal. Check that `sitting-cohesion.md` names it only in backticks, and that its ranges item still makes sense.

### Verification
- Parses:

  ```sh
  node scripts/parse.mjs 'zragel uel zrazal.' 'zazozon uel zahelan.' 'zral oel zrazal.' 'zragel oem zrazal.' 'z+13 oen z+19.'
  ```

- Rejected with `rangeEndpointKind`: `zragel oel zrodol.`
- Glosses *including*: `zragel al zrazal.`
- All green: `npm run build`, `npm test`, `npm run grammar-check`, `npm run english-helper-recall -- --check`.

# Proposal: One range series for every ordered line

**Status:** PROPOSED, ready to implement. User decisions: option U2 (2026-11-04); the [endpoint rule](#endpoints), the [`ual` / `uol` swap](#swap), [`aol` *in turn*](#in-turn) with `ael` left open (2026-11-04); `aor` and the [landmark rule](#landmark) (2026-11-05).
**Related:** [ordered-ranges.md](../grammar/intermediate/ordered-ranges.md#ranges), [numbers-applied.md](../grammar/intermediate/numbers-applied.md#ranges), [open-ranges.md](../grammar/advanced/open-ranges.md), [hooks.md](../grammar/beginner/hooks.md) (*including* / *except*), [extra-noun-hooks.md](../grammar/beginner/extra-noun-hooks.md), [say-amounts.md](../grammar/say-amounts.md), [unassigned-reserved.md](../meta/unassigned-reserved.md), [design-decisions.md](../meta/design-decisions.md), [`src/parse/morph-gloss.ts`](../../src/parse/morph-gloss.ts) (`HOOK_SPAN`), [`src/parse/constructions.ts`](../../src/parse/constructions.ts).
**Design authority:** this proposal changes grammar. It removes the number-only range reading of `al` / `ul` / `am` / `um` / `an` / `ar` / `ur` / `un`, it assigns `uel` between same-role words, it swaps the range readings of `ual` (now *outside*) and `uol` (now *strictly between*), it assigns `aol` *in turn* between same-role words, and it makes every hook right after a landmark an extra noun (no range there). Extra-noun readings do not change. Same-role `ael` stays open. Once implemented, the grammar pages own the result, a short entry in design-decisions records why, and this file is deleted.
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
| 5 | **The u-forms look alike** | `ul` / `ual` / `uol`; under -r, `ur` (inside) vs `uor` (outside) | No stated logic for the second vowel | Medium | Gone: one [cue](#cues) for the `u` forms |
| 6 | **Half-open only for numbers** | *Monday up to but not including Friday* has no form | `ul` is *except* between non-numbers | Medium | Gone: `uel` works on every line |
| 7 | **Order matters for some hooks only** | `zragel ul zrazal` [3, 5) vs `zrazal ul zragel` (3, 5] | Only one-end exclusion depends on which end is said second | Low | Same, now on `uel`; teach it once |
| 8 | **Range hook vs join with the same vowels** | `oel` (range) vs `zoel` (tie); `aol` (*using*) vs `zaol` (*then*) | Same vowel pairs | Low: the role letter decides | Unchanged; same-role `aol` *in turn* now agrees with `zaol` *then* |
| 9 | **Range vs extra noun after a landmark** | `al bohehal oel bobewol` is a range today, but `al bohehal el bobewol` and `al bohehal aol bobewol` describe the house | The parser lets range vowels override the taught rule (*a hook + `/b/` right after a landmark describes that landmark*); the learner cannot tell until the vowel | Medium: making `uel` / `aol` range hooks would flip more readings | Gone: the [landmark rule](#landmark): after a landmark every hook is an extra noun |
| 10 | **`ual` guessed from *out of* gives the opposite set** | *everyone out of the Azozon–Ahelan band* → `zazozon ual zahelan`, which today means *strictly between* | `ual` is *out of* as an extra-noun hook, but its range reading is the inside | High: the guess parses and names the complement | Gone: the [`ual` / `uol` swap](#swap) makes `ual` *outside* |
| 11 | **The `oel` cue has its vowels reversed** | the range table cue says "**o** ≈ at + **e** ≈ for"; the extra-noun row says "*at* then *for*" | Plain hooks are `el` *at* and `ol` *for*, so **o** is *for* and **e** is *at* | Medium: a learner checking the cue against `el` / `ol` finds it backwards | Gone: [cue fix](#cues) on both pages; no form changes |

## Decision: U2

### The series
<a id="the-series"></a>

One series works on any ordered line, numbers included:

| What is in | Hook | -m (soft ends) | -r (some member) | -n (named band) | Gloss |
|------------|------|----------------|------------------|-----------------|-------|
| A, B, and everything between | `oel` | `oem` | `oer` | `oen` | through |
| A and between, B left out | **`uel`** (new) | `uem` | `uer` | `uen` | through-excluding |
| Only what lies outside | **`ual`** | `uam` | `uar` | `uan` | outside |
| Only what lies between | **`uol`** | `uom` | `uor` | `uon` | strictly-between |
| A through B, one after another | **`aol`** (new) | `aom` | `aor` | `aon` | in-turn |

- **Which end `uel` leaves out:** the end said second, as `ul` does today. To leave out the low end, say it second: `zrazal uel zragel` is (3, 5].
- **-r and -n:** a range -r or -n needs a word on each side, as today. With nothing on the right, `uer` stays the extra-noun point-back *through there*, and `uem` stays the hook's ordinary zone reading.
- **-m:** with a word on each side, `uem` is *up to about B, not quite B* (today's `um`).
- **Glosses** for each row: -l as in the table, -m adds `.approx`, -n adds `.named`, -r is `some.` + the -l gloss (`some.through`, `some.in-turn`).

### Cues
<a id="cues"></a>

Each second vowel borrows its plain hook's sense (user decision, 2026-11-04):
- **`oel`:** **o** ≈ *for* (`ol`), **e** ≈ *at* a point (`el`): head for point B. As an extra noun that is *toward*. As a range, start at A and head for B, taking everything on the way. Fix the cue on both [ordered-ranges](../grammar/intermediate/ordered-ranges.md#ranges) and the extra-noun grid in [extra-noun-hooks](../grammar/beginner/extra-noun-hooks.md); both state it backwards today.
- **The `u` forms:** **u** ≈ leave something out (`ul` *except*), and the second vowel says what.
  - **e** = the point B, as in `el` *at*. So `uel` leaves out B.
  - **a** = the stretch as a space, as in `al` *in*. So `ual` leaves out the stretch: *outside*. This also matches extra-noun `ual` *out of*.
  - **o** = the two ends you aim at, as in `ol` *for*. So `uol` leaves out the ends: *strictly between*. This is the weakest link of the three, but every cue now comes from a plain hook.

### `aol`: in turn
<a id="in-turn"></a>

User decision, 2026-11-04. `oel` names a set; **`aol`** names an ordered walk from A to B, one member after another, in the order said.
- **Examples:** `zazozon aol zahelan vowurol.` *Azozon through Ahelan walk, one after another.* `zragel aol zrazal` *counting 3 to 5, in turn*.
- **Cue:** **a** = the stretch (`al` *in*), **o** = the aim (`ol` *for*): go through the stretch toward B. It agrees with the join `zaol` *then* (an order) and extra-noun `aol` *using* (a route).
- **Why:** today an order needs `zaol` over a list that names every member; `aol` gives it from the two ends alone.
- **-m:** `aom` softens the ends, as on every range hook: *roughly from A to B, in turn*.
- **-n:** `aon` names the sequence as a whole (*the A–B run*).
- **-r:** `aor` is **the current one, whose turn it is**, gloss *some.in-turn* (user decision, 2026-11-05). Like every range -r, it stands in for one unnamed member, and under a [question](../grammar/beginner/questions.md#fill-ask-r) it asks which one. Because the stretch is walked in order, the unnamed member is the one the walk is on now.
  - Statement: `zazozon aor zahelan vowurol.` *Whoever's turn it is, from Azozon through Ahelan, walks.*
  - Question: *whose turn is it?*, *which chapter are you on?*, *which step are we at?* This is the main use.
  - Progress follows without being stated: the members before the current one have had their turn. The page need not teach *already* / *not yet* here.
  - Compare with `oer`, some member of the set, with no sense of order. Under a question, `oer` asks *which one?* and `aor` asks *which one now?*
  - With nothing on the right, `aor` keeps its extra-noun point-back, as `oer` / `uer` do.
- **Same-role `ael`** stays **open**. The candidates (*throughout*, *next to*, *wrapping*, *midway*) have no guessable cue, and *somewhere between* is already `oer` / `uor`.

### Swap of `ual` and `uol`
<a id="swap"></a>

Only the **range** readings swap (same-role, between two words). Extra-noun `ual` *out of* and `uol` *against*, `uom` *contrary to* (and the `zone` job), and every other job stay as they are. The -m / -r / -n forms swap with their -l: `uam` ↔ `uom`, `uar` ↔ `uor`, `uan` ↔ `uon`, in range use only.

Reason (for design-decisions): extra-noun `ual` *out of* invites *outside* as the range guess, and today that guess silently names the inside ([confusion 10](#where-ranges-confuse)). `uol` *against* suggests neither reading, so it takes the one left over.

| Today | After |
|-------|-------|
| `zazozon ual zahelan` *strictly between* | `zazozon uol zahelan` |
| `zazozon uol zahelan` *outside* | `zazozon ual zahelan` |
| `zazozon uar zahelan` *someone strictly between* | `zazozon uor zahelan` |
| `zazozon uor zahelan` *someone outside* | `zazozon uar zahelan` |

### After a landmark
<a id="landmark"></a>

User decision, 2026-11-05. **A hook right after a landmark is always an extra noun on that landmark, never a range.** extra-noun-hooks already teaches this: *a hook + `/b/` right after a landmark describes that landmark, not the clause*. Today the parser makes an untaught exception for the range vowels: `endsInLandmark(...) && !isSpanHook(...)` at [`hook-jobs.ts`](../../src/parse/hook-jobs.ts) ~line 139. So the reading depends on the vowel, and making `uel` / `aol` range hooks would widen the exception.

Readings, checked on 2026-11-05:

| Sentence | Today | After |
|---|---|---|
| `zazozon vowurol al bohehal el bobewol.` | in [the house at the pencil] | same |
| `zazozon vowurol al bohehal aol bobewol.` | in [the house using the pencil] | same |
| `zazozon vowurol al bohehal uel bobewol.` | in [the house through the pencil] | same |
| `zazozon vowurol al bohehal oel bobewol.` | [in the house] through the pencil (range) | in [the house toward the pencil] |
| `zazozon vowurol al bohehal ual bobewol.` | [in the house] strictly-between the pencil (range) | in [the house out of the pencil] |
| `zazozon vowurol bohehal oel bobewol.` | house through pencil (range between two recipient `/b/`) | same |

- **Why:** one rule for every vowel, the rule already taught, and the learner knows the reading before reaching the hook. No doc example uses a range right after a landmark. The only `/b/ oel /b/` examples are the from–to construction (`zazozon ul b_9 oel b_17 vowurol.`, `closesFromTo`), which runs first and is unaffected. [syntax-test-corpus.md](../meta/syntax-test-corpus.md) row 168 (`… om bezezar aol bebelal …`, *using herbs*) keeps its reading.
- **Ranges stay** between two same-role words that are not landmarks: two recipient `/b/` words, or two `/z/`, `/d/`, … words.
- **Ranging a landmark** (*walk in rooms 3 through 5*) has no direct form. Use from–to (`ul bX oel bY`) for *from X to Y*. Otherwise state the range in its own role. Log it in unassigned-reserved as **open**. Scope islands cannot help: a hook is never a binder.
- **Compare-with line** on ordered-ranges: a hook right after a landmark describes that landmark; for *from X to Y* use `ul … oel`.

### Endpoints
<a id="endpoints"></a>

A range needs two points on one ordered line:
- people or things in a known order (a queue, days, chapters)
- numbers of one kind: amounts (scalar), ranks, or labels / times. Each number's kind comes from its marker (`SPAN_ENDPOINT_KIND` in [`src/parse/hook-jobs.ts`](../../src/parse/hook-jobs.ts)).
- ±∞ (`rawal` / `ruwal`)
- first or last place (`rowul` / `rowal`)

**Digitless ends count** (user decision, 2026-11-04). Rays already use them, so `zral oel zrazal` has a range reading. Drop the old digits-on-both-ends requirement everywhere it is stated.

**Mixed kinds are banned** (user decision, 2026-11-04). `zragel oel zrodol` (an amount through a rank) is rejected by the parser under a new construction, `rangeEndpointKind`. It goes into unassigned-reserved as **closed**. The design-decisions reason: a range needs one ordered line, and an amount and a rank are not one line.

**The kind check applies only when both ends are numbers** (user decision, 2026-11-05).
- **Non-number ends:** a non-number end pairs with any number. Ranks and labels are positions that named members share a line with: `zazozon oel zrogel` *from Azozon through the fifth in line*, *from the preface through chapter 3*. *Azozon through 5* as an amount parses but is odd, much like `al` between amounts; nothing bans it.
- **±∞ and first / last place:** they keep the kinds `SPAN_ENDPOINT_KIND` gives them today: ±∞ is an amount, first / last place a rank. So `zrodol oel zrawal` (*2nd through +∞*) is mixed and rejected: a rank line ends at last place, `zrodol oel zrowal`.

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

- **`uel` *through* (extra noun) vs `uel` *B left out* (range).** A learner who guesses *Azozon through Ahelan* = `zazozon uel zahelan` gets a half-open range. Today that is a parse error. The split matches the other range hooks: `oel` is *toward* / *through*, `ual` *out of* / *outside*, `uol` *against* / *strictly between*. The range table gets one Compare-with line: *for* through, *use `oel`; `uel` leaves B out*.
- **A short, already-taught form goes.** `al` is one vowel shorter than `oel`.
- **No direct range of landmarks.** After the [landmark rule](#landmark), *in rooms 3 through 5* needs from–to or a second phrase.
- **`uol` *strictly between* has a weak cue.** *Against* gives no hint, and "leave out the aims (ends)" is a stretch. It is still better than today, where `ual` invites the opposite reading.

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

Every other file and change is listed in the [implementation plan](#implementation-plan), which is the only checklist.

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

  It drops the `ual` / `uol` rows (taught once on ordered-ranges) and the silent anchors under the heading. `number-ranges` becomes the H3 id itself, so remove its `<a id>` to avoid a duplicate. `numeric-ranges` and `from-to` go, and their links are retargeted to `#number-ranges`.
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
  - `isSpanHook` (~line 53): a span is vowels `oe` / `ue` / `ua` / `uo` / `ao` between same-role words. Remove the single-vowel `a` / `u` path, the number-only range.
  - `spanEndpointKind` (~line 37): return the marker's kind whether or not the number has digits; keep the `SPAN_ENDPOINT_KIND` table. Check its other callers.
  - `hookJob` (~line 139): drop `&& !isSpanHook(word, prevWord, nextWord)` so a hook after a landmark is always an extra noun ([landmark rule](#landmark)). `closesFromTo` still runs first.
- [`src/parse/enforce.ts`](../../src/parse/enforce.ts):
  - `enforceHookSlot` (~line 345): drop `ue` and `ao` from the `clause` (same-role) gate, so `uel` and `aol` between same-role words parse; `ae` stays gated.
  - New check: a `span` hook throws `ConstructionError("rangeEndpointKind", …)` when both ends are numbers and their kinds differ. A non-number end is never checked.
  - `enforceStackedHookR` keeps `ue` and `ao` exempt, so a lone `uer` / `aor` stays the extra-noun point-back. Between same-role words, `aor` is a range -r like `oer`.
- [`src/parse/morph-gloss.ts`](../../src/parse/morph-gloss.ts) `HOOK_SPAN` (~line 1079): remove `al am an ar ul um un ur`. Add `uel` through-excluding, `uem` through-excluding.approx, `uen` through-excluding.named, `uer` some.through-excluding. Swap the `ua*` / `uo*` values ([swap](#swap)). Add `aol` in-turn, `aom` in-turn.approx, `aon` in-turn.named, `aor` some.in-turn.
- [`src/parse/constructions.ts`](../../src/parse/constructions.ts):
  - `hookSameRoleStack` (~line 755): the message lists the range hooks as `oel uel ual uol aol`.
  - Add `rangeEndpointKind`, anchored at `ordered-ranges.md#ranges`.
  - Reader note: a hook right after a landmark describes that landmark.
  - Add `uel` / `uer` / `aol` / `aor` range entries (the `aor` reader note: the current one, whose turn it is; under a question, *whose turn?* / *which one now?*), and swap the readings in any existing `ual` / `uol` / `uar` / `uor` range entries and reader notes.
  - Reader notes for `--llm-prompt`: one series, and `al` / `ul` between numbers mean *including* / *except*.
- Tests:
  - `morph-gloss.test.ts` lines ~98–104: `zral al zrazal` *including* stays. Update the `strictly-between` / `outside` expectations for the swap.
  - `invalid-forms.test.ts`: add mixed-kind cases (`zragel oel zrodol.`, `zrodol oel zrawal.`).
  - Add the [landmark](#landmark) table rows as morph-gloss tests. The existing case `zuvayal aol zazozon.` → `hookSameRoleStack` (~line 101) now parses as a range: replace it with a same-role `ael` case (`zuvayal ael zazozon.`), and remove any same-role `uel` rejection.
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
- **Then the `ual` / `uol` swap**, as a separate pass on the already-respelled tree:

  ```sh
  node scripts/find.mjs --seq 'role=z' 'raw=u[ao][lmnr]' 'role=z' --map raw=ual:uol,uol:ual,uam:uom,uom:uam,uar:uor,uor:uar,uan:uon,uon:uan
  ```

  Run it on the default paths, then on `src docs/meta --tests`. Read the dry run, because extra-noun uses must not match: with `/z/` on both sides they cannot be extra nouns. Then `--write`.
- Grep `strictly-between` / `outside` again for uses with `/w/` before the hook, and swap them by hand. Check that the English and free glosses next to every swapped example still say the right thing: the spelling changes, not the meaning.
- Respell Practice items in place; changing a spelling is not a refill.
- `docs/meta/syntax-test-corpus.md` row 168 should not change; confirm its gloss still shows *using*.

### Step 3: Hand edits to pages
Follow the [page shape](#page-shape):
- **ordered-ranges `#ranges`:**
  - the series table and the [cues](#cues), including the fixed `oel` cue and the swapped `ual` / `uol` rows;
  - which end `uel` leaves out;
  - `uel` / `uer` examples, an `aor` example in statement and question form (*whose turn?*), an `aol` example with its contrast to `oel` (a walk vs a set) and to `zaol` (needs every member named), and one `/b/` range example;
  - the Compare-with line from [costs](#costs), and the one from the [landmark rule](#landmark);
  - the amended [endpoint rule](#endpoints).
  - Cut the sentence that sends numbers to `al` / `ul`.
- **numbers-applied:**
  - the H3 becomes `### Ranges of numbers {#number-ranges}`, with the contents listed under page shape;
  - drop the `ual` / `uol` rows and the silent anchors;
  - grep the repo for links to `number-ranges`, `numeric-ranges`, `from-to` and `#ranges` on that page, and retarget them.
- **open-ranges:** restate the endpoint rule (digitless ends fine, no mixing). The *range* link points at `#number-ranges`.
- **extra-noun-hooks:** fix the `oel` cue in the stacked grid. The landmark rule there is already right; if the page mentions a range exception, cut it.
- **review-advanced item 8:** the answer is `gruwal oel grazal` only.
- **say-amounts and number-markers:** reread the prose around the respelled rows.
- **Cheat sheets:** `npm run cheat-sheet-blocks -- --write`.
- Rules: [present the current language only](../meta/grammar-docs.md#present-the-current-language-only) (no "formerly `al`" notes), and [glosses](../meta/glosses.md).

### Step 4: Meta pages
- [unassigned-reserved.md](../meta/unassigned-reserved.md):
  - add mixed-kind number endpoints as **closed**;
  - add a range as a landmark (*in rooms 3 through 5*) as **open**;
  - rewrite the open same-role stacks line: only `ael` (with -m / -n / -r) stays open, with the reasons from [in turn](#in-turn).
- [design-decisions.md](../meta/design-decisions.md):
  - the U2 entry (one series; `al` / `ul` keep *including* / *except*, useful for labels);
  - the [rejected alternatives](#rejected-alternatives-for-design-decisions);
  - the mixed-kind ban (two number ends only; a non-number end pairs with any number);
  - the [landmark rule](#landmark) and why (one rule for every vowel, already taught);
  - the `ual` / `uol` [swap](#swap) and its reason. Same-role `ael` is open, not banned, so it goes only in unassigned-reserved (above), never here.

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
  node scripts/parse.mjs 'zragel uel zrazal.' 'zazozon uel zahelan.' 'zral oel zrazal.' 'zragel oem zrazal.' 'z+13 oen z+19.' 'zazozon ual zahelan.' 'zazozon uol zahelan.' 'zazozon aol zahelan vowurol.' 'zragel aom zrazal.'
  ```

- Rejected with `rangeEndpointKind`: `zragel oel zrodol.`, `zrodol oel zrawal.`
- Parses: `zazozon oel zrogel.`, `zazozon oel zrowal.`, `zrodol oel zrowal.`, `zrazal oel zrawal.`
- [Landmark](#landmark) table: every row glosses as its *After* column, and the from–to examples in digit-strings.md are unchanged.
- Rejected: `zuvayal ael zazozon.` (same-role, open).
- Parses, gloss *some.in-turn*: `zazozon aor zahelan vowurol.` and its question form (copy the fill-ask -r pattern that ordered-ranges uses for `uar`).
- Unchanged: `zalazun dobonol aol bobewol varuyol.` stays *using* (extra noun).
- Glosses *including*: `zragel al zrazal.`
- Glosses: `zazozon ual zahelan` *outside* and `zazozon uol zahelan` *strictly-between* (ranges). `vowurol ual bohehal` stays *out of*, and `uol` + `/b/` stays *against* (extra nouns).
- All green: `npm run build`, `npm test`, `npm run grammar-check`, `npm run english-helper-recall -- --check`.

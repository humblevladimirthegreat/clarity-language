# Translation prompt from the parser

Status: phase 1, steps 1 (policy edits), 2 (extractor and lint, warn mode until step 7, [as built](#phase-1-step-2-as-built)), and 3 (review lists, [as built](#phase-1-step-3-as-built)) done, with the [finding categories](#finding-categories) sorted and their four rules written. Step 4 (calibration, [as built](#phase-1-step-4-as-built)) done and approved. Step 4b (scripted fixes, [as built](#phase-1-step-4b-as-built)) done. Step 5 (page review): waves 1 to 5 done (wave 4 ran before wave 3), waves 3 and 5 awaiting the editor's review of their diffs ([as built](#phase-1-step-5-as-built)). Step 6 (wave check) ran after each wave. Step 7 (lint to error, [as built](#phase-1-step-7-as-built)) done. The editor items are [settled](#phase-1-still-open). Phase 2 built ([as built](#phase-2-as-built)) and revised after phase 1 ([revision](#phase-2-revision)). Phase 3: the two prep items are done ([before phase 3](#before-phase-3)); the evaluation script is not built yet. Not design authority; fold into tooling and meta docs, then drop.

## Problem

The parser already writes a morph gloss for any sentence it accepts ([`morphGlossLine`](../../src/parse/morph-gloss.ts)), for example `z-Azawan | v-walk | th-CAUSE | [th-if | b-rain]`. An LLM that has never seen Agazan cannot read that line reliably. It does not know what the prefixes mean, what a bracket groups, what `←` points at, or what tags like `PATTERN` or `CLUES-Azawan` do. Given the bare line, it usually treats the prefixes as noise and guesses (see [pilot](#pilot)).

Goal: `node scripts/parse.mjs --llm-prompt '<sentence>'` prints a self-contained prompt. Pasted into any LLM with no Agazan context, the prompt gets back the English the docs would give: a natural sentence, plus a parenthetical for what Agazan marks and the sentence leaves out.

The prompt teaches by example from the docs, so it is only as consistent as the docs. Phase 1 makes the doc examples consistent first.

## Phases

| Phase | Work | Done when |
|-------|------|-----------|
| **1. Example English** | One written convention for free English (loose sentence + optional note), and every doc example rewritten to follow it | `lint:agazan` enforces the shape, and every page has had its review pass |
| **2. Prompt** | `--llm-prompt`: fixed core, trimmed legend, examples from the docs | The CLI prints the prompt; unit tests cover the core |
| **3. Evaluation** | A script that scores the prompt on held-out doc examples and lists what to fix | Failure rates per construction are reported, and the worst get `reader` notes |

Phase 1 is useful on its own: learners see the same convention on every page, whether or not phases 2 and 3 ever ship.

## Phase 1: example English

### What the docs do today

The policy in [strict vs loose](../meta/glosses.md#free-english-sentence-and-note) describes two layers: a **loose** line by default, and an optional **strict** second line labeled `strict:` for teaching packaging. The pages never use the second line. Of the 1,083 quoted English lines in `docs/grammar/` example blocks:

- **0** are labeled `strict:` or `loose:`, and no block has two free English lines.
- **96** end with a parenthetical after the closing quote that carries the strict content: *"Azawan left because Alahen told." (a cause, and no one is blamed)*, *"Azawan walks. Alahen sits on their left." (Azawan's left)*.
- **97** carry the same kind of note *inside* the quotes: *"tea or coffee (pick one)."*, *"You all (the addressees) walk."*, *"Azawan walks if there is rain (as mechanism)."*
- A few notes are teaching commentary, not translation: *(whose-now and the event's own time are separate)*, *(`/w/` does not retarget the verb)*.
- Some lines fold strict content into the sentence itself (*"You (Alahen) and your associates sit."*), and some drop a distinction the section teaches without any note.

The page that showed both lines (`rainy-evening-dialogue.md` under a removed `docs/examples/`) no longer exists; [glosses.md](../meta/glosses.md#free-english-sentence-and-note) still links to it.

So the real convention is already *loose sentence plus note*. Phase 1 writes it down and makes every example follow it.

### The convention

A free English line is:

```
"<loose sentence>" (<note>)
```

- **Sentence**: what a fluent speaker would say, as today's loose line. It keeps who / what / polarity / negation, force English can say, and stance that changes the claim ([keep in loose](../meta/glosses.md#keep-in-loose)). Parentheses inside the quotes are the English for an [aside](../grammar/spans.md#asides) span and nothing else: *"Azawan walks (quietly)."*, *"The dog (it is blue) walks."* An aside may also come out as commas or *by the way*, as the spans page already shows.
- **Note**: optional, one parenthetical after the closing quote. It states, in plain English, what the gloss marks and the sentence drops: whose clue or feeling it is, an open or closed list, cause versus blame, whose *left*, what a stand-in refers to, how firm a decision is. It is the strict layer, written as a fact rather than as an awkward sentence.

| Today | Convention |
|-------|------------|
| "tea or coffee (pick one)." | "tea or coffee." (pick one) |
| "You all (the addressees) walk." | "You all walk." (the addressees) |
| "Azawan walks if there is rain (as mechanism)." | "Azawan walks if it rains." (rain as the mechanism) |
| "You (Alahen) and your associates sit." | "You and your associates sit." (said to Alahen) |
| "Alahen left, so they say. Did Alahen run? Alahen sang (so they say)." | "Alahen left, so they say. Did Alahen run? Alahen sang." (the singing is hearsay too) |
| "Azawan walks (quietly)." (an aside) | Unchanged: the parentheses translate the aside span |

**Several sentences on one line.** The note still goes after the closing quote and names which sentence it is about (*the singing is hearsay too*, *such = muted too*). The note never goes in the middle of the quote.

**Spoiler answers.** Agazan → English answers in checkpoints and on [review.md](../grammar/review.md) are italic, not quoted (*Ahaben sees that Alahen sneaks.*). They keep the italics and follow the same convention with the italics in place of the quotes:

```
*<loose sentence>* (<note>)
```

The note rules are the same, except that a note is never required in an answer ([policy edits](#policy-edits)). English → Agazan prompts are italic English too; they follow the same shape, and a note there tells the learner what to mark.

### When a note is required

| Case | Note |
|------|------|
| The example teaches the marking (the section's new form) and the sentence drops it | **Required** |
| The sentence drops a marking that changes how a careful reader would take the claim (a holder that is not the speaker, a closed list, a pointer English would leave unclear) | **Required** |
| A marking the section does not teach and that English drops harmlessly (an open join in passing, an evidential tag on a non-evidence page) | Optional; leave it out on Beginner pages |
| Distinctions only the morph line carries ([drop in loose](../meta/glosses.md#drop-in-loose): sense-picking endings, cast-letter scaffolding, fence shapes) | **Never** |

A note is a translation, so it never contains:

- Agazan forms, backticks, or gloss labels (`th-CLUES`, `PATTERN`).
- Grammar terms (*holder seam*, *mirative*, */w/*). Say *the surprise is Azawan's*, not *mirative with an Azawan holder*.
- Teaching commentary about how the form works. That goes in the prose under the block, or in a **Compare with** line ([compare with](../meta/grammar-docs.md#compare-with)).

Explanation that is not translation (*You name yourself rather than saying I.*, which now follows `"I walk."` on the same line) moves to its own line under the block.

### Policy edits

The convention replaces the two-line layer everywhere it is described:

| File | Edit |
|------|------|
| [glosses.md](../meta/glosses.md) | Goals and Layers tables: free English is *loose sentence + optional note*; drop the separate strict row. Rewrite [strict vs loose](../meta/glosses.md#free-english-sentence-and-note) around the note, with the table above. Rework the tea-or-coffee [three readings](../meta/glosses.md#example-same-agazan-sentence-and-note) and the "(Strict teaching line: …)" under [metaphor vs overlay](../meta/glosses.md#metaphor-vs-overlay-vs-literal) into notes. Remove the dead `rainy-evening-dialogue.md` link. Update the anti-pattern and checklist rows that mention strict lines. |
| [grammar-docs.md § Examples](../meta/grammar-docs.md#examples) | Replace "Strict free English only when teaching packaging" with the note rule. |
| [translation-exercises.md](../meta/translation-exercises.md) | English answers and English prompts follow the same convention in italics: `*sentence* (note)`. A note is never required in an answer, but it is allowed when the checkpoint drills the marking. |

### Lint

New checks in `lint:agazan`, on every quoted free English line in an example block and every italic English answer or prompt in a checkpoint:

- The line is `"…"` (or `*…*` in a checkpoint), or alternatives `"…" / "…"`, or dialogue turns `"…" "…"`, followed by at most one ` (…)`; nothing else after the closing quote or italics.
- No more `(…)` groups inside the quotes or italics than the Agazan has [aside](../grammar/spans.md#asides) spans (`ASIDE[…]`) and scope islands (`SCOPE[…]`), not counting a `(A)` letter for a tag the gloss sets ([inside parentheses](../meta/glosses.md#inside-parentheses)). An aside rendered with commas or *by the way* uses fewer, which is fine. Any further real use gets its own written rule in [glosses.md](../meta/glosses.md) and lint case, not a per-line exemption.
- The note has no backticks, no gloss label (any label in `MORPH_GLOSS_LABELS` or the terminology closed labels), and none of a short list of grammar terms.

The lint cannot tell whether a required note is missing. That is the review pass's job, and phase 3 measures it.

### Implementation

Scope: every free English line in an example block under `docs/grammar/` (about 1,100, including blocks with no morph line), and every italic English answer or prompt in a `### Practice` checkpoint and on [review.md](../grammar/review.md). Grammar-table English cells beside an Agazan phrase or sentence were added later ([grammar-table gloss](../meta/glosses.md#grammar-table-gloss-free-english-only)): shape and inside parentheses only, not the note bans.

<a id="strange-examples"></a>
**Strange examples.** The review pass reads every example on a page, so it also fixes the ones that make no sense to a plain reader, Agazan included. Fixing the free English is the occasion; the example's meaning is fair game while the page is open. A strange example teaches the form badly: the learner stops at *a blue Azawan* and misses the channel on the adjective.

| Strange | Example | Rewrite |
|---------|---------|---------|
| A property that does not fit the noun | *Azawan, surprisingly blue, walks*; *a cat that is still blue* | *Azawan walks, surprisingly tired*; *a cat that is still sleepy* |
| An identity or relation between things that cannot share it | *a dog the very same as Azawan* (SAME is identity) | *a guard who is the very same person as Azawan* |
| A manner or stance that does not fit the verb | *Ahaben hastily sees a box*; *Azawan may be seeing a sandwich* | *Ahaben hastily punches a box*; *Azawan may be eating a sandwich* |
| A verb missing the object or setting English needs | *Azawan always tells*; *A train stands again* | *Azawan always used to sing*; *A train stands still again* |

Rules for the rewrite:

- **Keep the construction.** The section's new form, the role letters, and the structure stay; only roots and English change. If the only fix needs a different construction, list it for the editor instead.
- **Fix the English alone when that is enough** (*stands* → *stands up*). Change the Agazan only when no natural English fits it.
- **Published roots only**, picked from the page's setting and word bank where possible. Never coin a root; if nothing fits, list it.
- **Update everything that cites the example:** prose that quotes its words (*blue* → *angry*), a checkpoint's word bank (one row per root across New words and Review, so check the lint), the answer's explanation, Pick one / What changes alternatives, and [cheat-sheet](../grammar/cheat-sheets/) rows that quote it (`lint:cheat-sheets` fails until they match). A word new to a checkpoint may need its lexicon `core` cell set, as the core-vocabulary lint says. Cheat sheets and the lexicon are shared files, so a subagent lists those follow-ups in its report and the main session applies them in step 6.
- **Morph lines come from the parser.** Write the new morph, then `npm run regloss-docs` must report 0 rewrites on the page.
- **Leave alone:** playful but coherent examples (*A dog sleeps like Azawan*), the running cast and setting, cheat-sheet blocks between `<!-- generated -->` markers (rerun `npm run cheat-sheet-blocks -- --write` instead), and grammar tables.
- **Report** each rewrite in one line (old English → new English) so the editor can check the meaning.

**Claritish is out of scope.** Its examples are English with Agazan words dropped in, not translations of an Agazan sentence, so the convention does not apply. Its one quoted free English line (`claritish/learn-agazan.md`, the closing plug) is left as it is.

The work splits into what sets the rules, done once in the main session, and the per-page review, which goes to subagents.

| Step | Who | Output |
|------|-----|--------|
| 1. Policy edits | Main session; the editor reviews before step 4 | The [policy edits](#policy-edits) above. Subagents read glosses.md as their rule, so it lands first. |
| 2. Extractor and lint | Main session | The extractor returns every (Agazan, free English) pair, including blocks with no morph line and italic checkpoint answers and prompts, and splits sentence from note. The main session also drafts the banned grammar-term list for the note check. The [lint](#lint) checks run in warn mode: findings print, the build passes. Unit tests cover the aside count and the note bans. |
| 3. Review list | Main session | One scratch JSON per page (not committed): each example's line number, section heading, Agazan, parser morph, current English, and lint findings. A subagent works from this list, so it cannot skip an example. |
| 4. Calibration | Main session, two pages | [clause.md](../grammar/clause.md) (Beginner, few notes) and [knowing.md](../grammar/knowing.md) (evidence and stance, many notes). Every [finding category](#finding-categories) on these two pages, the scripted ones included, is fixed by hand. The editor reviews both diffs. Any judgment call they raise is written into glosses.md before step 5. |
| 4b. Scripted fixes | Main session | After the editor approves the calibration diffs: a one-off script applies the two mechanical fixes from the [finding categories](#finding-categories) (1a and 2a) on every page except the two calibration pages, then `npm run free-english-review` reruns so the subagents get clean lists. `npm run build` passes, and the editor skims the diff before step 5. |
| 5. Page review | Subagents, in waves | One subagent per page (two small pages may share one), about six per wave. Brief below. |
| 6. Wave check | Main session | The cheat-sheet and `core` follow-ups from the reports, then a [diff guard](#diff-guard) (script written by the main session before the first wave), `npm run build`, the subagents' unsure lists, and the editor's review of the wave diff. One commit per wave. |
| 7. Lint to error | Main session | The shape checks fail the build. `npm run build` and `npm test` pass. |

<a id="phase-1-step-2-as-built"></a>
**Step 2 as built.** [`free-english.ts`](../../src/lint/free-english.ts) (extractor, splitter, checks; tests in `free-english.test.ts`), run by `lint:agazan` on top-level grammar pages as `free-english <kind>` warnings. The prompt index ([`llm-examples.ts`](../../src/parse/llm-examples.ts)) now reads blocks and splits lines through it, so both agree on the shape.

- **Extracted:** 1,864 lines: 1,082 example lines, 314 English → Agazan prompts, 308 Agazan → English answers, 111 Pick one and 49 Fix it prompts. What changes items are left out: their spoiler English is commentary, not a translation.
- **Shape is strict:** a period after the note (`*Azawan sits* (no one is to blame).`) is a shape finding. Write the period inside the sentence.
- **Warnings today:** 128 inside-parentheses, 79 shape, 18 grammar term, 4 Agazan form, 1 gloss label. Inside-parentheses hits include letter tags (*Azawan (A) punches*) and grouping (*Azawan and (just water)*): if review keeps either, it gets its own written rule, per [lint](#lint). Four checkpoint lines spell the learner slot as a literal *(Your name)*.
- **Grammar-term list** (`NOTE_GRAMMAR_TERMS`, for editor review): word-shape and gloss words (*morph*, *ending*, *root*, *citation*, *loan verb*, …), word classes and roles (*noun*, *verb*, *hook*, *pointer*, *resume*, *stand-in*, …), joins and spans (*join*, *fence*, *span*), stance and evidence (*holder*, *mirative*, *evidential*, *residue*, *whose-now*, *tense*, …), number and comparison (*plural*, *associative*, *comparative*, …). Everyday words that also name a feature (*topic*, *list*, *open*, *closed*, *cause*, *pattern*, *addressee*) are left out. The longest matching term is reported.

<a id="phase-1-step-3-as-built"></a>
**Step 3 as built.** `npm run free-english-review` (optionally `-- docs/grammar/<page>.md …`) writes `tmp/free-english-review/<page>.json` for the 32 top-level pages with free English, and `index.json` with per-page counts (lines, notes, lines with findings) for sizing waves. `tmp/` is gitignored. Each item has a page-local `id` for reports and unsure lists, `line`, `kind`, `section` (title, slug, band), `agazan`, `docMorph`, `parserMorph` (`SELF` parsed as the unset default; 0 parse errors today), `english` as written, `sentence` / `note` (null when the shape fails), and the lint `findings` on that line. Rerun it after calibration so the lists match the edited pages.

<a id="finding-categories"></a>
**Finding categories** (after the four rules below; 193 lines with findings). Numbers are the lines in each category. The subagent brief points here for the hand fixes.

| # | Category | Lines | Example | Fix |
|---|----------|-------|---------|-----|
| 1a | Note at the end of the sentence, inside the quotes | 78 | "Azawan walks if there is rain (as mechanism)." | **Script (4b):** `"X (n)."` → `"X." (n)`; in a checkpoint `*X (n).*` → `*X.* (n)`. Only when the group sits right before the final mark and is the line's only group |
| 1b | Who someone is, mid-sentence | ~28 | "We (you and I) walk." · "Ahaben sees him (Alahen)." · "some (unknown) person" | Subagent: sentence plus note, "We walk." (you and I). Usually **required**: clusivity and referents are what those sections teach |
| 1c | Grouping English can say | 4 | "(Azawan walks or Alahen runs) and Ahaben sleeps." | Subagent: *either … or …, and …*; repeat the shared word (*a challenging dog and a challenging cat*) |
| 1d | Implied answer or dropped word | 5 (questions.md) | "Who cares? (Nobody.)" · "True: (they) didn't run." | Subagent: "Who cares?" (nobody does); write the word |
| 1e | Alternatives with a note inside one of them | 2 | *a cart, for one* / *a cart (and possibly more)* | Subagent: one note after the last, or split the alternatives across rows if they mean different things |
| 2a | Period after the note, or the sentence's period outside the italics | 36, mostly checkpoints | *There are many trumpets* (more than usual). | **Script (4b):** `*X* (n).` → `*X.* (n)`; keep a `?` / `!` the sentence already has |
| 2b | Teaching commentary after the quote | 6 | "I walk." You name yourself rather than saying *I*. | Subagent: prose line under the block |
| 2c | Description outside the italics | 3 | *courage*, as a name (citation) · *Resentful at the bell*, in waves. | Subagent: *courage* (as a name) · *Resentful at the bell.* (in waves) |
| 2d | Tone mark as *(?)* | 5 (speech-moves.md) | "Azawan saw a dog (?)." (unsure about just *dog*). | Subagent: English hedge or stress, "Azawan saw a dog, I think." (unsure about just the dog) |
| 2e | Instruction between checkpoint italics | 3 (questions.md) | *Didn’t Azawan tell?* Then confirm: *true, Azawan didn’t.* | Subagent: turns plus the instruction as the note, *Didn’t Azawan tell?* *True, Azawan didn’t.* (confirm the negative) |
| 2f | *(Your name)* | 3 | *(Your name), I'm here; we can stay.* | Subagent: the `SELF` slot |
| 3a | Grammar word in the note | 15 | (adjective before the noun) · (citation) · (loan verb) · (a call, then a discourse hook) · (a pointer to the quote) | Subagent: drop a word-order hint English already shows; (the dictionary form); (a borrowed word); (said to Azawan); (*that* is the quote) |
| 3b | Teaching commentary as the note | 7 | relations.md *as of* notes (*whose-now …*, *`/w/` does not retarget the verb*) · pronouns.md / knowing.md (*`zaxar` would be Alahen*, *quitting for good is `hewel`*) | Subagent: prose under the block, or a **Compare with** line for a contrast |
| 3c | Gloss label in the note | 1 | knowing.md (LIVE is how Azawan knows) | Subagent: (Azawan saw it happen) |

**Rules written for the cleanup** ([inside parentheses](../meta/glosses.md#inside-parentheses), linted): parentheses inside the quotes for a scope island (*Azawan and (just water)*) and for a tag letter (*A dog (A) sees a cookie (E)*); alternative renderings `"Yes." / "True."`; dialogue turns `"Walk." "Will do."`. These cleared 11 inside-parentheses lines and 25 shape lines. The prompt index takes the first alternative and joins turns.

<a id="phase-1-step-4b-as-built"></a>
**Step 4b as built.** A one-off script (not kept) applied categories 1a and 2a on the 30 pages other than clause.md and knowing.md: 72 lines on 21 pages (52 of 1a, 20 of 2a). It only touched lines the lint flagged and whose shape matched exactly. `npm run free-english-review` now reports 101 lines with findings (was 193), 0 parse errors; `npm run build` and `npm test` pass. Some 1a fixes leave a fragment note that reads oddly (*"Azawan sees us." (you and I)*); the page review in step 5 may fold those into 1b.

<a id="phase-1-step-4-as-built"></a>
**Step 4 as built.** [clause.md](../grammar/clause.md): 5 lines (two inside-quote notes moved out, two *(adjective before the noun)* drill hints now *(sleepy first)* style). [knowing.md](../grammar/knowing.md): 37 lines. Besides the lint findings, the pass rewrote stilted sentences into natural English with the channel's own phrase (*live / from the scene* → *I can see it*; *a former pattern, not today's* → *used to*), dropped notes that restated the sentence, replaced *from the clouds* (a source the gloss lacks) with *it looks like*, and split *I gather Azawan thinks Alahen left, and is asleep* into two sentences plus a carry-forward note. One note contradicted the page: the advanced English → Agazan holder drill said *(Azawan's clues, not mine)*, but the seam word is the speaker's; it now reads *(Azawan's view; the clues are mine)*. It also rewrote the [strange examples](#strange-examples) on both pages (a rule added after the pass started): clause.md's blue dog is now an angry dog, the SAME examples use a guard instead of a dog that *is* Azawan, *sleeps like blue Azawan* is *Azawan sleeps like a tired dog*, and the circus drills punch instead of *hastily see*. knowing.md's adjective-mood examples use a hat *I remember as red* instead of a blue Azawan, FORMER and *contrary to* use *sing* instead of a bare *tell*, and *may be seeing a sandwich* is *eating*. Word banks, two cheat-sheet pages, and the `core` cells for *eat* and *hat* follow. Two readings changed on purpose, for the editor to confirm: `th-CLUES-Azawan | th-LIVE` is now *Azawan is watching Alahen leave* (LIVE is now, so not *saw*), and the question forecast is *going by the pattern you see* (a question's channel is the listener's). Judgment calls written into [glosses.md § sentence first](../meta/glosses.md#sentence-first). Cheat-sheet tables were left alone (out of scope).

**Why subagents for step 5 only.** The review is about 1,100 separate judgments, and each needs the teaching context of its own page: what the section's new form is, and what it marks. Spread across 30-odd pages, that is too much reading for one context to keep sharp, while the pages are independent of each other. Steps 1 to 4 and 6 set or check the rule. They need one consistent judgment, so they stay in the main session. Calibration comes before any fan-out because subagents copy whatever the calibration pages show: a mistake there repeats on every page.

**Subagent brief** (each one gets the same text, its page, and its review list):

- Read the convention in [glosses.md](../meta/glosses.md) and the two calibrated pages' diffs before editing.
- For each example on the list: is the marking the section teaches stated, in the sentence or the note? Add a required note when it is not, move an inside-quote note out, keep aside, scope-island, and tag-letter parentheses, and move teaching commentary into a prose line under the block. Fix each lint finding as its [category](#finding-categories) says.
- Edit only free English lines, and add prose lines directly under a block, except for a [strange example](#strange-examples): there, rewrite the example's Agazan, morph line, citing prose, and word bank rows as that section says. Never edit headings, tables, or any other page; list cheat-sheet rows and lexicon `core` cells a rewrite needs.
- If an example's English seems to contradict the grammar on its page, do not fix either. List it as a gap for the editor.
- Leave the English of sake words (`th…tha/thu/the/tho…`, and sake words on `/ɡ/` and `/w/`) as it is, apart from lint fixes. Whose stake they name is settled on sakes.md (§ whose stake, § motive): a sake word with no `/b/` is the speaker's stake, and someone else's motive takes a holder. List any that still read as someone else's motive.
- Bare *tell* (`v-tell` with nothing told) is *talks* / *speaks*, with the Agazan unchanged. Swap the root only when the example needs a different act.
- On `say-*.md` pages, review the `## Practice` items by reading the page: the extractor reads only `### Practice` checkpoints, so they are not on the list.
- Run `npm run lint:agazan -- docs/grammar/<page>.md` on its own page. Check a rewrite with `node scripts/parse.mjs --constructions '<sentence>'`; it must keep the old sentence's construction IDs. Run `npm run regloss-docs` as a dry run only (`--write` rewrites every page) and copy any `+` line for your page by hand. Do not run `npm run build`, `npm test`, `cheat-sheet-blocks --write`, `retie-docs`, `convert-word`, or any git command that changes state: parallel builds share output.
- Report: how many lines changed, each added required note in one line, each strange-example rewrite in one line (old → new English and Agazan), follow-ups (cheat-sheet rows, lexicon `core` cells), gaps, and an unsure list with review-list ids.

All subagents work in the same tree, without worktrees. Each one owns different files, so nothing conflicts, and worktrees would only add merge steps. They run on the default model, not a smaller one: deciding whether a note is required is judgment about the grammar.

<a id="diff-guard"></a>
**Diff guard** (step 6): a script that fails when a changed line in a wave's diff is anything other than a free English line in an example block or a new prose line directly after one. A changed table row (other than a word bank row) or heading means a subagent went out of scope. That page is reverted and redone. A changed Agazan code span or morph line is allowed only as a [strange-example](#strange-examples) rewrite: the guard parses old and new and fails unless both have the same construction IDs (roots may differ), and the subagent's report lists the rewrite. `npm run regloss-docs` must report 0 rewrites after each wave.

<a id="phase-1-step-5-as-built"></a>
**Step 5 as built.** The diff guard is `npx tsx scripts/free-english-diff-guard.ts [--base <rev>] [pages…]`. It fails on a changed heading, a changed table row other than a word bank row, or an Agazan row rewrite that drops a construction ID. A rewrite that only adds IDs (the calibration added objects to a few examples) and any other changed prose line are listed for review against the reports. Subagents run on the default model, at `xhigh` effort for pages heavy in referent, scope, or turn judgments and `high` for the rest. The extractor reads only `### Practice` checkpoints, so the five `say-*.md` pages' `## Practice` sections are reviewed by reading.

Waves. Pages heavy in referent, scope, or turn judgments run at `xhigh`; the rest at `high`. Small pages share a subagent.

| Wave | Pages (`xhigh` in bold) | Status | Lines with findings after |
|------|-------------------------|--------|---------------------------|
| 1 | **hooks**, **joins**, **sakes**, **questions**, comparatives, say-people-places | done | 68 (was 101) |
| 2 | **spans**, **pronouns**, relations, roles, intention, say-reasons | done | 47 (was 68) |
| 3 | **speech-moves**, dependents, numbers, predication, restrictors, review | done, awaiting the editor's review | 1 (was 12; say-reasons) |
| 4 | **plurality**, causation, x-compounds, word-endings + phonology, numbers-applied + english, join-across-roles | done | 12 (was 47; all on wave 3 pages and say-reasons) |
| 5 | say-tense + say-questions, say-amounts + numeric-derivation | done (main session, no subagents), awaiting the editor's review | 0 (was 0; all 32 pages now 0) |

Wave 1 decisions:
- **Applied:** fill-ask `…or` on one item is *Any X?*, as the [arity table](../grammar/questions.md#fill-ask-arity) says. The parser's label went from `which` to `any`. Bare `v-tell` is *talks* / *speaks*, now a rule in [glosses.md § sentence first](../meta/glosses.md#sentence-first).
- **Guard exception:** the joins.md respectively example swaps SAME for *like* (`gumum`), so the guard reports one construction change there. The editor approved it.
- **Settled:** whose motive and whose stake, on sakes.md § whose stake and § motive (folded from the former `sake-motive-holder.md`). Plain *I* is `amun`; `SELF` is only for greetings, bids and self-introduction.

Wave 2 decisions:
- **Applied in the wave check:** bare `v-tell` is *speak*, not *speak up* (not a sense alias, and it adds *voicing an objection*). A note that repeats *Taking 22 July as now* (*a placeholder*) is dropped, as on relations.md. RESIDUE is *had left and was still gone*, as on knowing.md. Generic `oben` is *one* / *you* (people in general).
- **Strange examples:** blue dogs are red (spans.md, keeping *only the color is what Azawan says*) or black (pronouns.md, next to a red dog); *the book sits above the tree* is *a bird sits above the dog*; a spoken quote is written down, not seen; *saw …* with no object is *walk*. On say-reasons.md `## Practice`, a bare *see* gains *a fire* (`davahel`, already in the bank), so the guard lists added constructions there.
- **Gaps for the editor** (resolved 2026-10-17: `bozan`; a punched undergoer in roles.md practice and the result note; `doexarahal` *a finish line*; DECISION moved to `/h/`, so `huhum` dates it; WANT is the speaker's unless a holder names someone else, design-decisions D-46):
  - pronouns.md topic pronoun block: `zalaher dozan vezebel` is glossed *Alahen tells Azawan*, but `/d/` on *tell* is what is said. Fix with `bozan`, or a verb whose `/d/` is a person.
  - roles.md: `duxagozal` is *something constructed*, but § result says a newly made thing is `ao` (`daoxagozal`).
  - roles.md: `doexuvudel` is *a destination* (from *go*), but **-l** takes the concrete sense, so the parser glosses `goal-x-footprints`.
  - say-reasons.md *As of 22 July, Alahen had decided to walk*: relations.md § as-of says `/h/` *as-of* moves only the event, so the decision is still now.
  - intention.md WANT (*Alahen wants Azawan to walk*) states someone else's want with no holder. knowing.md settles PLAN (it needs no channel), not WANT, which is closer to a feeling.
- **For `sake-motive-holder.md`:** say-reasons.md sake words that read as someone else's motive: the blocks at lines 116 and 262, and the table rows *motivation* (252), *biased* / *bias* (285–286), and *deserves* (557, 562, no `/b/` for whose stake). Folded; *deserves* stays as the speaker's view of what is fair.

Wave 4 (run before wave 3):
- **Applied in the wave check:** cheat-sheet rows that quote changed examples (numbers.md 4, why-allowed.md 12, roles-comparing.md 1); `core` cell for `azewe` (*group*, now in the join-across-roles.md Fix it). Cheat-sheet English cells take a note like any free English line. Later, `lint:agazan` took the shape and inside-parentheses checks (not the note bans) to every italic table English cell beside an Agazan phrase or sentence, on grammar pages and cheat sheets ([grammar-table gloss](../meta/glosses.md#grammar-table-gloss-free-english-only)). The first runs fixed 13 cheat-sheet cells and 13 grammar-page cells.
- **Strange examples:** join-across-roles.md *cooked popcorn and sat around the fire* is *ate it* (the shared object needs a verb that takes it); the Fix it's *finish line including Ahaben* is *a group including Ahaben*.
- **For the editor to confirm:**
  - Past tense where the Agazan fixes the time: *walked in the ’90s* / *in 1962* (numbers-applied.md), MEMORY and rank evidence lines (join-across-roles.md).
  - Greetings are *Hello.* (said by Ahaben), and *Hello.* / *Goodbye.* where both uses are taught (word-endings.md). Own-name lines on x-compounds.md use a note (*hello, with your own name*), not a literal `SELF`, which the site would show as *speaker*.
  - plurality.md writes the addressee set as *(everyone I'm talking to)*, not glosses.md's *(the addressees)*, and speaker **-x** as *My people and I* (not you), from the table.
  - causation.md `wegem gelevam` is *walks, straining* (something is causing the strain); fallback *exerted*, as on say-amounts.md.
  - word-endings.md checkpoint notes *(the dictionary form)* repeat the checkpoint's own instruction and could go.
  - phonology.md and numbers.md *Three cats.* for `zagadulx grarel.`, which parses as a sentence (*There are three cats.*).
  - plurality.md *sing as one outing* follows the table's phrase but reads oddly for singing. Collective **-x** *(but not individually)*: the prose does not say the property fails for each member; the Pick one answer says *heavy only together*.
  - x-compounds.md `gagayoxalaval` is an adjective, but its English (*love in the crush sense*) is a noun phrase; a cheat sheet quotes it.
- **Gap:** join-across-roles.md never says whether a `/d/` before a verb-phrase join is shared by every verb or belongs to the first. The parser reads it as shared; there is no stated way to give only the first verb an object.
- **For wave 3:** review.md line 126 (`zazawan vezebel balahenx.`) still reads *tells*; plurality.md now has *talks to Alahen and associates*.

## Phase 2: the prompt

The prompt has six parts, in this order:

1. **Header.** One line: this is a word-by-word gloss of a sentence in a constructed language.
2. **How to read the gloss.** A fixed core (below), always included.
3. **Tags used here.** One line for each tag and construction this sentence uses ([trimmed legend](#trimmed-legend)).
4. **Examples.** Four doc examples close to this sentence, each gloss with its doc English ([examples](#examples-from-the-docs)).
5. **Task.** The sentence and when to add a note ([task](#task-and-reply-format)).
6. **The gloss line(s).** Gloss only, with no Agazan spelling. Names are already English in the gloss, and opaque payloads are already quoted, so the Agazan adds nothing a reader without the language can use.

### Fixed core

A short block covering what every gloss uses. It stays small enough (about 1.5 KB) that trimming it is not worth the risk of a missing rule.

- Word separator ` | `, sentence separator ` . `, `[ … ]` groups one slot and nesting shows attachment, join word last in a fence, `LABEL[ … ]` packages ([phrase brackets](../meta/glosses.md#phrase-brackets)).
- Prefixes: one plain-English line per PoS letter the gloss can print (`y z d b v g gl w h th x`, and prefix-less relation words), from [role letters](../grammar/clause.md#role-letters).
- `-x-` inside one word, trailing `-x` (associates / group), `←X` (refers back to X), and the form suffixes from [round trip](../meta/glosses.md#round-trip) (`.open`, `.new`, `.part`, `.self` / `.same` / `.other` / `.unsaid`, `.instance`, `.about`, …).
- House-cast names are personal names; `SELF` is the speaker's name (*I*).
- No tense is marked: choose natural English tense, present by default ([English lemma](../meta/glosses.md#english-lemma)).
- Keep vague things vague: do not add a gender, a time, or a count the gloss leaves open ([underspecification](../meta/glosses.md#underspecification-and-joins)).

Source: a `GLOSS_READER` table in a new `src/parse/llm-prompt.ts` next to the gloss emitter. A unit test fails when the emitter can print a PoS prefix or form suffix that has no `GLOSS_READER` line, so the core cannot fall behind the gloss format.

### Trimmed legend
<a id="trimmed-legend"></a>

Only what this sentence uses, from two sources:

| Source | Covers | Text comes from |
|--------|--------|-----------------|
| **Labels** in the gloss line (`CAUSE`, `PATTERN`, `MIRATIVE`, `RESIDUE`, …) | Closed SMALLCAPS tags | The Gloss column of [terminology closed labels](../grammar/terminology.md#closed-labels). That table is already linted against the emitter ([`terminology-docs.ts`](../../src/lint/terminology-docs.ts)). |
| **Constructions** in the parse (`parse(text, …, { constructions: true })`) | Meaning that comes from a combination, not one tag: a holder (`th-CLUES-Azawan` = the clue is Azawan's, not the speaker's), `PATTERN` with `rank/more` (*than usual*), a date in digit form (`b-_22,7` = 22 July), a role-compound resume (`←bearer-x-steal` = the one stolen from) | A new optional `reader` field on [`ConstructionEntry`](../../src/parse/constructions.ts) |

The existing `summary` field stays as it is. It is written for maintainers and uses Agazan terms (`/ɡ/`, `yal`), so it cannot go into the prompt. `reader` is written in gloss notation for someone who knows only the fixed core. Most constructions are pure structure (`sentence.document.EOF`, `sentence.clause.clauseItem`) and get no `reader` note. Only constructions where a careful reader of the core would still guess wrong need one. Phase 3 finds those, and notes are added as failures show up; nothing requires full coverage.

Labels that also appear in the chosen examples are included, so the examples do not bring in unexplained tags.

### Examples from the docs
<a id="examples-from-the-docs"></a>

[`extractMorphPairs`](../../src/lint/morph-gloss-docs.ts) already finds each block's Agazan and morph. It returns the free English line too, split into sentence and note (phase 1 makes that split reliable).

**Index.** Parse each pair's Agazan once with constructions on, and store `{ gloss, sentence, note, constructions, labels, anchor }`. Build it at bundle time into the same output `scripts/parse.mjs` already rebuilds, so the CLI does not parse a thousand sentences per call.

**Selection.** Score each pair against the input by shared construction IDs and labels. Weight each shared ID by its rarity across the index (inverse document frequency), so near-universal IDs (`sentence.document.Period`, `word.ending.l`) count for nothing and a shared `word.xFamily.holder` counts for a lot. Then pick greedily: each next example is the one that covers the most rare features *not already covered*. Four `x-and` examples teach less than one join, one comparative, and one stance tag.

- Skip pairs whose gloss equals the input's, so the prompt never contains its own answer.
- At least one chosen example has a note and, when the pool allows, at least one has none, so the model sees both that notes exist and that most sentences need none.
- Default 4 examples; `--examples N` to change, `--examples 0` for legend only.

### Task and reply format
<a id="task-and-reply-format"></a>

The task restates the phase 1 convention for the model:

- Write what a fluent English speaker would say, keeping who / what / negation and any stance that changes the claim.
- If the gloss marks something that sentence leaves out (whose feeling or clue it is, a closed or open list, cause versus blame, who a pointer refers to), add one short plain-English note in parentheses after the sentence. Otherwise add nothing.

Reply format: exactly one line, `ENGLISH: "…" (…)`, with the note optional. With several inputs, the gloss lines are numbered and each reply line takes the number (`1 ENGLISH: …`). That keeps the reply machine-checkable for phase 3.

`--loose` asks for the sentence with no note.

### Several inputs

Several inputs make **one** prompt for the whole passage, not one prompt each. A `←X` across sentences then refers to a line the LLM can see, and the trimmed legend and examples cover the union of the lines' constructions. Each input is glossed separately and numbered.

### CLI

```
node scripts/parse.mjs --llm-prompt [--loose] [--examples N] '<Agazan>' ['<Agazan>' …]
```

Prints plain text, not JSON. A parse failure prints the parser error and exits 1, as today. `--llm-prompt` with `--constructions` or `--check-ambiguity` is an error. Those flags already shape JSON output.

### As built
<a id="phase-2-as-built"></a>

Code: [`llm-prompt.ts`](../../src/parse/llm-prompt.ts) (core, selection, prompt; pure), [`llm-examples.ts`](../../src/parse/llm-examples.ts) (doc examples, terminology glosses, reader notes), tests in `llm-prompt.test.ts`. Where it differs from the plan above:

- **Index cache.** Built on first use and cached at `dist/parse/llm-examples.json`, rebuilt when anything under `docs/grammar/*.md`, `src/`, or `data/` is newer. About 3 s to build; then the CLI costs the same as a plain parse.
- **Example source.** Blockquote example blocks on the top-level grammar pages (926 distinct glosses when built, 88 with a note; table rows were added in the [revision](#phase-2-revision)). A dialogue block's Agazan lines are joined. Checkpoint answers are not used: they are the phase 3 test set. A block is skipped when its free English line does not split as `"…"` plus at most one `(…)`, when it has backticks or links, when the quotes hold more `(…)` than the gloss allows (asides, scope islands, tag letters), or when the gloss has an unbound `←"…"`. So every phase 1 page pass adds examples.
- **Core size.** About 4 KB, not 1.5 KB: role names, pointer vowels, tone marks, and the hook reading (`d-tea | instead | d-coffee` = coffee instead of tea) all proved necessary.
- **Variant tails** of overlay labels (`.strong`, `.weak`, `.fault`, `.share`, `.ledger`, `.bookmark`, `.lasting`, …) are a fixed `GLOSS_READER.tails` table, shown in the legend only when a gloss uses one, not `reader` notes per overlay row. The test fails when an overlay gloss has a tail with no line.
- **Hyphenated labels.** `CLUES-TOPIC` (a holder) and `AIMED-FLOWING` (emotion pieces) are legend-matched by piece; `ON-BEHALF` by the whole run.
- **Seed `reader` notes:** holder (`word.xFamily.holder`), date (`number.calendar`), rank (`join.e`), and bars (`sentence.{z,d,b}CoordPart.bar`), from the pilot misses. The holder and bar notes' examples turned out to be doc sentences; all seed notes now use placeholder names ([before phase 3](#before-phase-3)).
- **Filler examples.** When nothing in the index shares a rare feature with the input, the greedy pick fell back to the shortest glosses, and the forced note example could be one whose note was still teaching commentary (*office handle on first mention*). Fixed in the [revision](#phase-2-revision).

### Revision after phase 1
<a id="phase-2-revision"></a>

Phase 2 was built before phase 1, so it was revised to match what phase 1 settled:

- **Rules match glosses.md.** The core's tense rule is the [English lemma](../meta/glosses.md#english-lemma) rule (past for a past date, MEMORY, RESIDUE, FORMER, a past as-of, hearsay or clues about a finished event, a quote; *will* for a forecast; no added time word). The task carries [sentence first](../meta/glosses.md#sentence-first): put the natural phrase for a tag in the sentence and reuse the examples' phrase, add nothing the gloss lacks, and never a note that repeats the sentence. The core's join example no longer puts a note inside the English.
- **Table rows are examples.** Grammar-page table cells that translate an Agazan phrase or sentence now follow the convention ([grammar-table gloss](../meta/glosses.md#grammar-table-gloss-free-english-only)), so the index reads them through the lint's `tableEnglish`. An example block wins when both give the same gloss. Contrast tables put a section's forms side by side, each in the house English, so the examples now carry each tag's usual phrase; the legend keeps the terminology Gloss cell for what the tag means rather than parsing a phrase out of each owning table.
- **`SELF` slots** are filled as the speaker before parsing, as the review lists do, so greeting and conversation-length examples are no longer skipped.
- **Selection.** An example is picked only when it covers a rare input feature (weight ≥ 1, about a third of the index or fewer) not yet covered; padding stops at two examples, so a plain input still shows the reply format. A note example is added only when it shares a rare feature with the input; a note about something else teaches the model to annotate the wrong thing.
- **Joined labels.** A run like `ON-BEHALF-FLOWING` lists every sub-run, so the legend finds `ON-BEHALF` and `FLOWING`; before, it split to `ON` and `BEHALF` and explained neither. Table rows were the first examples with such a run.

Index after the revision: 1,134 distinct glosses, 181 with a note (was 926 and 88).

### Before phase 3
<a id="before-phase-3"></a>

Both done.

- **Checkpoint answers are the test set.** `buildTestSet` in [`llm-examples.ts`](../../src/parse/llm-examples.ts) reads the Agazan → English answers through the lint's extractor: 305 distinct glosses, 43 with a note. They are not in the example pool, so the evaluation needs no hold-out for them; 25 share a gloss with a pool example, which the prompt already skips as the input's own. A note is never required in an answer, so the judge scores only the sentence there; the note score comes from the held-out example blocks.
- **Reader notes use placeholder names.** The holder note read `th-CLUES-Azawan` = *I gather Azawan thinks …*, the opening of three knowing.md answers, and the bar note's *Alahen leaves later than planned* was comparatives.md's *Azawan arrives later than planned* with the name and verb swapped. Every cast name has a holder example somewhere, so no swap of names would do: the holder, bar, and rank notes now write X and Y (`th-CLUES-X` = I gather X thinks …). A unit test fails when a reader note uses any name a doc gloss uses. The usual phrases themselves (*I gather … thinks*, *than usual*) stay: teaching the phrase is what the note is for, and a user's prompt gets the same help.

## Phase 3: evaluation
<a id="evaluation"></a>

A script, not part of `npm test` (it calls a model and costs money). It runs the real prompt over the doc pairs and reports where it fails:

1. For each pair (or a sample), build the prompt with that pair and any pair sharing its gloss held out of the example pool.
2. Translate with an isolated model: `claude -p --model haiku --tools "" --setting-sources "" --strict-mcp-config --no-session-persistence --system-prompt …`, run from an empty directory so no project `AGENTS.md` loads. This works locally today with no API key.
3. Judge with a stronger model, given the doc line and the reply, in two parts:
   - **Sentence**: same claim as the doc sentence? *same* / *partly* / *wrong*, plus which gloss piece was misread. Meaning, not wording: *walks if it rains* matches *walks if there is rain*.
   - **Note**: if the doc has a note, does the reply's note (or sentence) carry the same point? If the doc has none, an extra note counts against the reply only when it is wrong.
4. Report the failure rate per construction ID and per label. The worst rows are the next `reader` notes to write, or terminology Gloss cells to sharpen. A construction whose doc examples rarely have a note while replies keep adding the same correct one is a hint that phase 1 missed a required note.

Run it on the smallest model you expect people to paste into. A prompt that works on Haiku will work on larger models.

**First run (editor's settings):** 200 pairs sampled across the example blocks, table rows, and checkpoint answers; translated by Haiku and judged by Opus; reports written to `tmp/llm-eval/` (gitignored), not committed.

## Pilot
<a id="pilot"></a>

A hand-built version of phase 2 ran on 2026-10-16, before phase 1. Twelve doc examples with closed tags, pointers, `rank/`, `.open`, or `-x` were translated by Haiku 4.5 through `claude -p` with no tools, no settings, no project files, and a one-line system prompt. It asked for separate strict and loose lines, the format this proposal has since dropped. Two prompts each:

- **A**: the gloss line and the task only.
- **B**: a hand-written fixed core, the terminology Gloss for each label, and four examples picked by overlap of gloss pieces (a stand-in for construction overlap). No `reader` notes.

Scored by hand against the doc English, on the loose line:

| | Right | Partly right | Wrong |
|-|-------|--------------|-------|
| A (gloss only) | 3 | 1 | 8 |
| B (core + labels + examples) | 8 | 2 | 2 |

Without a legend, the model read prefixes as case markers ("Azawan (z-marked) …") and guessed at the rest. It turned `←bearer-x-steal` into *he* and `th-CAUSE` into *makes someone walk*.

B's misses are what the `reader` notes are for:

- `[z-Azawan | th-PATTERN | z-rank/more | g-sleepy]` became *the sleepiest, going by the pattern*. Doc English: *sleepier than usual*. Needs a note on `PATTERN` as the comparison baseline.
- `z-Alahen | th-MIRATIVE | th-CLUES-Azawan | v-departure` became *Azawan thinks Alahen left*. Doc: *I gather Alahen's leaving surprised Azawan*. Needs a holder note.
- `b-_22,7` became *ledger entry 22.7*. Doc: *22 July*. Needs a date note.
- One example glossed `d-←agent.self` as *himself*, adding a gender the gloss leaves open, even with the "keep vague" rule.

B's strict lines were weaker than its loose lines (*Azawan is caused to walk*, *sees the self of the agent*). Every example it saw had one unlabeled English line, sometimes loose and sometimes strict-ish, with the strict content scattered between the sentence and parentheticals. That finding is what led to phase 1 and to notes instead of strict sentences.

Twelve sentences and one judge (the author of the prompt) are a signal, not a result.

## Open questions

- Should the published site offer the prompt (a "copy translation prompt" button next to the parse view in [`browser.ts`](../../src/parse/browser.ts)), or is this a CLI tool only?

Wave 3:
- **Applied in the wave check:** cheat-sheet rows that quote changed examples (word-shape-clause.md 3, restrictors-spans.md 10, numbers.md 9 including a note moved outside the italics, linking-clauses.md 3, talking.md 1). phonology.md *Three cats.* is *There are three cats.*, as on numbers.md. speech-moves.md § vocative's **Compare with** said *saying Alahen walks* over `zazawan vowogal`; the code span is now `zalahen vowogal`, with the talking.md row that quotes it. The restrictors.md ranked rewrite uses *weekends* (`habeham`) over the subagent's *dawn*, the abstract sense of daybreak.
- **Strange examples:** predication.md *Is Alahen me?* is *Are you Alahen?* (`behon`; the Beginner bank row `amun` is now `ehon`); restrictors.md *preferably in an emergency rather than for convenience* is *preferably on weekends, or else at night* (an **-m** word stays, or the guard loses `word.ending.m`); dependents.md *so hastily that Alahen sits* is *… runs*, and the prompt *Alahen runs so hastily that Azawan sees the luggage* is *Alahen sneaks so hastily that Azawan sees them*; numbers.md *almost blue dog* is *almost angry*; speech-moves.md *blue Alahen!* is *sleepy Alahen!*; review.md *that red is from memory* is *Azawan, whom I remember as sleepy, is sleeping* (the Advanced bank drops *red*).
- **For the editor to confirm:**
  - restrictors.md *when raining* is *when it rains* in examples and checkpoints; prose and answer explanations still say *only when raining*. Ranked `hel` is *preferably A, or else B*, not *rather than* (both occasions count) and not *prefers to* (that would be Azawan's preference).
  - speech-moves.md tone marks follow glosses.md's model (*Azawan saw a dog, I think.* (unsure about just the dog)), though knowing.md treats an *I think* on reasons as a channel. *Surprise!* is *What a surprise!*; teasing `%` is *Good old Alahen*. The tone-mark table's Cue cell and talking.md line 51 still describe English *(?)*.
  - review.md *It looks like Alahen fought.* (strong clues) keeps the past tense with no time in the Agazan, as with wave 4's past-tense question.
  - predication.md *Alahen is me.* (`zalahen gugol bamun.`) has a house person stand for the speaker; *The guard is me.* (`zagavol`) keeps the constructions.
- **Resolved (editor):** a number on `/z/` is a new noun, so `zrarel gubuhel.` is *there is a blue three*; the number as a value is a mention. The example was strange regardless and is now `zrarel vezebal.` *Three are sleeping.* (the section intro says *number word on its own*, not *number itself*). The existence ordinals (*There is a first pie*) are fine.

Wave 5 (four small pages, 92 lines with no findings, reviewed in the main session):
- **Applied:** the channel and stance phrases from knowing.md, sakes.md, and intention.md: *Azawan walked, I remember it*; *Azawan is walking, I can see it*; *It will rain, going by the pattern*; RESIDUE *has left and is still gone* (with *as of 22 July*, *had left and was still gone*); FORMER *Azawan always used to talk.* (no claim about now); *I intend to walk; the details are open*; *Azawan may walk; I'm allowing it*. Prescription **-m** notes are *(unasked advice)*, not *(offered)*. Bare `v-tell` is *talk* / *speak*, including the cite on say-questions.md (*Azawan said, “Alahen talks.”*). say-*.md `## Practice` notes no longer use grammar words: *(rank offer)* is *(as an offer)*, *(standalone rank)* is *(no names given)*, *(closed rank of those two)* is *(just those two)*, and the two `vs` answers on say-questions.md each have one line per form.
- **Strange example:** say-amounts.md *A fairly blue dog walks* is *A fairly big dog walks* (`gelavam`; same constructions).
- **For the editor to confirm:**
  - say-tense.md CLUES with today's offset was *Azawan must be walking today*; it is now *It looks like Azawan is walking today*, because *must* on this page is a requirement.
  - say-amounts.md *Azawan especially walks* is *Azawan in particular walks*: the English put *especially* on the walking, but `zem` ranks Azawan. *Azawan and Alahen are both challenging* says the distributive reading in the sentence.
  - numeric-derivation.md `zalavalrabal.` was the citation *essence of love*; following the *There are three cats* ruling, it is now *There is an essence of love.*
  - Kept: *Azawan barely sits* (numbers.md and its cheat sheet use the same sentence); say-amounts.md *Alahen and Ahaben are exerted* (the wave 4 *exerted* fallback is still open); *said* in the say-questions.md cite (the open past-tense item from waves 3 and 4).
- **Fixed after the wave (editor's request):** say-questions.md's two rank tables had tie (**oe**) and sequence (**ae**) swapped against joins.md and the page's own practice. Single-item *Start with X?* / *Maybe start with X?* are now `…ael` / `…aem`; standalone *Tie?* / *Probably a tie?* / *Draw?* are `…oel` / `…oem` / `…oen`, and *Any order?* / *Not sure where to start?* are `…ael` / `…aem`. Two wave 1 cheat-sheet leftovers in why-allowed.md now match sakes.md: *Ought* is *Azawan ought to talk; it would help them feel connected.* (unasked advice), and *Requirement, by rule* is *The rules require Azawan to walk.*
- **Also fixed in why-allowed.md:** *Detracts* is *My book detracts from competence.* (modifiable), and *Permission, granted* is *Azawan may walk; I'm allowing it.*, as on sakes.md.

<a id="phase-1-step-7-as-built"></a>
**Step 7 as built.** `lint:agazan` now counts `free-english` findings in its failure total and prints them as errors, so `npm run build` fails on a shape, inside-parentheses, grammar term, Agazan form, or gloss label finding on a top-level grammar page. All 32 pages have 0 findings. `npm test` passes.

### Settled after phase 1
<a id="phase-1-still-open"></a>

The "for the editor to confirm" items from waves 3 to 5, settled in one pass after step 7. Closed earlier: *Three cats* (now *There are three cats.* on both pages), the verb-join `/d/` gap (settled by the verb join scope change), and the two why-allowed.md rows.

- **Tense** is now a rule in [English lemma](../meta/glosses.md#english-lemma): present by default, past when the Agazan puts the event before now (a past date or offset, MEMORY, RESIDUE, FORMER, a past as-of) or when the sentence reports an event that is over (hearsay or clues about something that happened, a quote). That is what knowing.md, the calibration page, already does (*Alahen left, so they say*), so *walked in 1962*, the MEMORY and rank evidence lines, review.md *It looks like Alahen fought.*, and the *Azawan said* cite all stay in the past. Tense never adds a time word.
- **Addressee note:** glosses.md now writes *(everyone I'm talking to)*, as plurality.md does.
- **`gelevam`** is *straining* on causation.md and say-amounts.md.
- **`gagayoxalaval`** is *in love* (the crush kind) on x-compounds.md and roles-comparing.md.
- **plurality.md:** *They sing as one performance.* in the example, the table, the checkpoint, and people-pointing.md. The collective adjective prose now says a pile can be heavy when no single box is, which backs *(but not individually)*.
- **word-endings.md** checkpoint prompts dropped *(the dictionary form)*: the checkpoint says every answer is a citation. hooks.md keeps the note, where it is what tells the citation from a sentence.
- **predication.md:** *Alahen is me.* is `zagavol gugol bamun.` *The guard is me.*
- **Restrictor prose** says *only when it rains*, to match the examples (restrictors.md, predication.md, say-people-places.md, restrictors-spans.md).
- **Tone mark `?`:** the Cue cells on speech-moves.md and talking.md now say *…, I think*. The scope note keeps it apart from knowing.md's belief channel.
- **Accepted as written:** greetings *Hello.* (said by Ahaben) and own-name lines with a note, not a literal `SELF`; speaker **-x** as *My people and I*; ranked `hel` as *preferably A, or else B*; the wave 5 wording (*It looks like Azawan is walking today*, *Azawan in particular walks*, *both challenging*, *There is an essence of love.*, *Azawan barely sits*).

**Not done:** the free English lint still reads only top-level grammar pages, not cheat-sheet English cells (in TODO.md).

# Translation prompt from the parser

Status: phase 1, steps 1 (policy edits) and 2 (extractor and warn-mode lint, [as built](#phase-1-step-2-as-built)) done; awaiting editor review before step 4. Phase 2 built ([as built](#phase-2-as-built)); its examples improve as phase 1 lands. Not design authority; fold into tooling and meta docs, then drop.

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

- The line is `"…"` (or `*…*` in a checkpoint) followed by at most one ` (…)`; nothing else after the closing quote or italics.
- No more `(…)` groups inside the quotes or italics than the Agazan has [aside](../grammar/spans.md#asides) spans (`ASIDE[…]` in the parse). An aside rendered with commas or *by the way* uses fewer, which is fine. If cleanup turns up another real use of inside parentheses, it gets its own written rule in [glosses.md](../meta/glosses.md) and lint case, not a per-line exemption.
- The note has no backticks, no gloss label (any label in `MORPH_GLOSS_LABELS` or the terminology closed labels), and none of a short list of grammar terms.

The lint cannot tell whether a required note is missing. That is the review pass's job, and phase 3 measures it.

### Implementation

Scope: every free English line in an example block under `docs/grammar/` (about 1,100, including blocks with no morph line), and every italic English answer or prompt in a `### Practice` checkpoint and on [review.md](../grammar/review.md). Grammar-table Gloss cells are out of scope ([open questions](#open-questions)).

**Claritish is out of scope.** Its examples are English with Agazan words dropped in, not translations of an Agazan sentence, so the convention does not apply. Its one quoted free English line (`claritish/learn-agazan.md`, the closing plug) is left as it is.

The work splits into what sets the rules, done once in the main session, and the per-page review, which goes to subagents.

| Step | Who | Output |
|------|-----|--------|
| 1. Policy edits | Main session; the editor reviews before step 4 | The [policy edits](#policy-edits) above. Subagents read glosses.md as their rule, so it lands first. |
| 2. Extractor and lint | Main session | The extractor returns every (Agazan, free English) pair, including blocks with no morph line and italic checkpoint answers and prompts, and splits sentence from note. The main session also drafts the banned grammar-term list for the note check. The [lint](#lint) checks run in warn mode: findings print, the build passes. Unit tests cover the aside count and the note bans. |
| 3. Review list | Main session | One scratch JSON per page (not committed): each example's line number, section heading, Agazan, parser morph, current English, and lint findings. A subagent works from this list, so it cannot skip an example. |
| 4. Calibration | Main session, two pages | [clause.md](../grammar/clause.md) (Beginner, few notes) and [knowing.md](../grammar/knowing.md) (evidence and stance, many notes). The editor reviews both diffs. Any judgment call they raise is written into glosses.md before step 5. |
| 5. Page review | Subagents, in waves | One subagent per page (two small pages may share one), about six per wave. Brief below. |
| 6. Wave check | Main session | A [diff guard](#diff-guard) (script written by the main session before the first wave), `npm run build`, the subagents' unsure lists, and the editor's review of the wave diff. One commit per wave. |
| 7. Lint to error | Main session | The shape checks fail the build. `npm run build` and `npm test` pass. |

<a id="phase-1-step-2-as-built"></a>
**Step 2 as built.** [`free-english.ts`](../../src/lint/free-english.ts) (extractor, splitter, checks; tests in `free-english.test.ts`), run by `lint:agazan` on top-level grammar pages as `free-english <kind>` warnings. The prompt index ([`llm-examples.ts`](../../src/parse/llm-examples.ts)) now reads blocks and splits lines through it, so both agree on the shape.

- **Extracted:** 1,864 lines: 1,082 example lines, 314 English → Agazan prompts, 308 Agazan → English answers, 111 Pick one and 49 Fix it prompts. What changes items are left out: their spoiler English is commentary, not a translation.
- **Shape is strict:** a period after the note (`*Azawan sits* (no one is to blame).`) is a shape finding. Write the period inside the sentence.
- **Warnings today:** 128 inside-parentheses, 79 shape, 18 grammar term, 4 Agazan form, 1 gloss label. Inside-parentheses hits include letter tags (*Azawan (A) punches*) and grouping (*Azawan and (just water)*): if review keeps either, it gets its own written rule, per [lint](#lint). Four checkpoint lines spell the learner slot as a literal *(Your name)*.
- **Grammar-term list** (`NOTE_GRAMMAR_TERMS`, for editor review): word-shape and gloss words (*morph*, *ending*, *root*, *citation*, *loan verb*, …), word classes and roles (*noun*, *verb*, *hook*, *pointer*, *resume*, *stand-in*, …), joins and spans (*join*, *fence*, *span*), stance and evidence (*holder*, *mirative*, *evidential*, *residue*, *whose-now*, *tense*, …), number and comparison (*plural*, *associative*, *comparative*, …). Everyday words that also name a feature (*topic*, *list*, *open*, *closed*, *cause*, *pattern*, *addressee*) are left out. The longest matching term is reported.

**Why subagents for step 5 only.** The review is about 1,100 separate judgments, and each needs the teaching context of its own page: what the section's new form is, and what it marks. Spread across 30-odd pages, that is too much reading for one context to keep sharp, while the pages are independent of each other. Steps 1 to 4 and 6 set or check the rule. They need one consistent judgment, so they stay in the main session. Calibration comes before any fan-out because subagents copy whatever the calibration pages show: a mistake there repeats on every page.

**Subagent brief** (each one gets the same text, its page, and its review list):

- Read the convention in [glosses.md](../meta/glosses.md) and the two calibrated pages' diffs before editing.
- For each example on the list: is the marking the section teaches stated, in the sentence or the note? Add a required note when it is not, move an inside-quote note out, keep aside parentheses, and move teaching commentary into a prose line under the block.
- Edit only free English lines, and add prose lines directly under a block. Never edit Agazan, morph lines, tables, headings, or any other page.
- If an example's English seems to contradict the grammar on its page, do not fix either. List it as a gap for the editor.
- Run `npm run lint:agazan -- docs/grammar/<page>.md` on its own page. Do not run `npm run build`: parallel builds share output.
- Report: how many lines changed, each added required note in one line, and an unsure list.

All subagents work in the same tree, without worktrees. Each one owns different files, so nothing conflicts, and worktrees would only add merge steps. They run on the default model, not a smaller one: deciding whether a note is required is judgment about the grammar.

<a id="diff-guard"></a>
**Diff guard** (step 6): a script that fails when a changed line in a wave's diff is anything other than a free English line in an example block or a new prose line directly after one. A changed code span, morph line, table row, or heading means a subagent went out of scope. That page is reverted and redone.

None of this changes a morph line, so `npm run regloss-docs` and the round-trip tests are unaffected.

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
- **Example source.** Blockquote example blocks on the top-level grammar pages only (926 distinct glosses today, 88 with a note). A dialogue block's Agazan lines are joined. Tables and checkpoint answers are not used yet. A block is skipped when its free English line does not split as `"…"` plus at most one `(…)`, when it has backticks or links, when the quotes hold more `(…)` than the gloss has `ASIDE[` spans, or when the gloss has an unbound `←"…"`. So every phase 1 page pass adds examples.
- **Core size.** About 4 KB, not 1.5 KB: role names, pointer vowels, tone marks, and the hook reading (`d-tea | instead | d-coffee` = coffee instead of tea) all proved necessary.
- **Variant tails** of overlay labels (`.strong`, `.weak`, `.fault`, `.share`, `.ledger`, `.bookmark`, `.lasting`, …) are a fixed `GLOSS_READER.tails` table, shown in the legend only when a gloss uses one, not `reader` notes per overlay row. The test fails when an overlay gloss has a tail with no line.
- **Hyphenated labels.** `CLUES-TOPIC` (a holder) and `AIMED-FLOWING` (emotion pieces) are legend-matched by piece; `ON-BEHALF` by the whole run.
- **Seed `reader` notes:** holder (`word.xFamily.holder`), date (`number.calendar`), rank (`join.e`), and bars (`sentence.{z,d,b}CoordPart.bar`), from the pilot misses. Their examples are not doc sentences, so a note never hands the model the answer to a held-out pair.
- **Filler examples.** When nothing in the index shares a rare feature with the input, the greedy pick falls back to the shortest glosses, and the forced note example can be one whose note is still teaching commentary (*office handle on first mention*). Phase 1 removes those notes.

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

- Should table **Gloss** cells in grammar tables follow the note convention too, or stay short free English? This proposal leaves them alone.
- Should the published site offer the prompt (a "copy translation prompt" button next to the parse view in [`browser.ts`](../../src/parse/browser.ts)), or is this a CLI tool only?

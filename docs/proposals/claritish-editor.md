# Proposal: Claritish writing editor

**Status:** PROPOSED. Nothing here is built.  
**Related:** [Claritish track](../meta/grammar-docs.md#claritish-track) (what a drop-in is, placement, the cheat sheet), [Claritish wording and voice](../meta/claritish-style.md), [the gap sections](../grammar/claritish/index.md#lessons) of each lesson, [`scripts/lint-cheat-sheets.ts`](../../scripts/lint-cheat-sheets.ts), `syntax-highlighting.md` (a separate idea for structure highlighting in full Agazan).  
**Design authority:** none. The editor adds no forms. It points at lessons and drop-ins that already exist.

## Problem

The Claritish lessons teach a drop-in at the moment of reading. The habit they target shows up later, while the learner is writing an ordinary message: the *probably* that hides a guess, the *I heard* that passes on a rumor, the *he's a liar* that turns one act into a nature. Nothing catches that moment. The cheat sheet helps only if the writer already noticed the trap and went to look it up.

Each lesson's `## The gap` section already names those English words. A client-side editor can watch for them while the writer types, explain the trap in one line, and help pick the drop-in that fits.

## Goals

1. **Spot the habit where it happens.** Mark English cues that a lesson's gap names, while the writer is typing.
2. **Help choose, don't hand over a table.** Ask the question the lesson implies and build the drop-in from the answer.
3. **Never call English wrong.** Plain English stays a first-class choice, as every lesson says ([say when to leave it out](../meta/claritish-style.md#forms)).
4. **Stay in step with the lessons.** No spelling, gloss, or trap description is written twice. A lesson edit or a root respelling reaches the editor through the build.
5. **Private by construction.** Text never leaves the browser: no server, no analytics on content.

## Non-goals

- Grammar checking of English.
- Full Agazan: no role letters, joins, or clause grammar. The editor knows only Claritish drop-ins.
- New forms or new readings. A cue with no fitting drop-in is not a trigger. If a cue looks like it needs one, it goes to the usual grammar gap process, not into the editor.
- Rewriting the user's text without being asked.

## User experience

### Spotting

The editor scans each sentence for **cues**, English words and phrases from the lesson gaps:

| Lesson | Example cues |
|--------|--------------|
| [How sure are you?](../grammar/claritish/could-be.md) | *I think, probably, maybe, I guess, might, definitely* |
| [How do you know?](../grammar/claritish/how-you-know.md) | *apparently, I heard, they say, I remember, must have, obviously, I feel like* |
| [Labels](../grammar/claritish/labels.md) | pronoun + *is / are / was* + trait word: *he's a liar, you're so lazy, I'm an idiot* |
| [Can and can't](../grammar/claritish/can-and-cant.md) | *can't, cannot, unable to, not able to* |
| [Thanks and sorry](../grammar/claritish/thanks-and-sorry.md) | *thanks, thank you, sorry, I apologize* |
| [Allowed, required, agreed](../grammar/claritish/allowed-required-agreed.md) | *can I, may I, you have to, must, not allowed, is that OK* |
| [Oughts and motives](../grammar/claritish/oughts-and-motives.md) | *you should, ought to, I did it for you* |
| [Wants and plans](../grammar/claritish/wants-and-plans.md) | *I want to, I'd like to, I'm going to, I will, planning to* |
| [Decisions and tries](../grammar/claritish/decisions-and-tries.md) | *I've decided, I'll try, let's try* |
| [Feelings](../grammar/claritish/feelings.md) | emotion words: *anxious, resentful, proud, stressed, upset* |
| [Tone marks](../grammar/claritish/tone-marks.md) | *lol, jk, /s*, a winking emoji, ALL CAPS, *!!!*, *you're the worst* |

A cue gets a soft dotted underline in the lesson's colour, never a red squiggle. To keep the noise down:

- **One mark per sentence.** When several cues fire, show the one from the earliest lesson in track order. The others show in its card under *Also here*.
- **Lesson filter.** A row of toggles, one per lesson, defaulting to the first three lessons. Only enabled lessons mark text, so the editor grows with the learner instead of flagging every *can't* on day one. A "match my progress" option could later follow which lessons the reader has opened.
- **Ignore.** *Leave it* dismisses one mark. *Never for this phrase* is stored per browser.
- **Skip quoted text.** Text inside quotation marks and code spans is someone else's words or not prose, so it is not scanned.

### The help card

Hover, or the keyboard shortcut, opens a card on the marked cue:

1. **The trap, in one line.** Taken from the lesson's `## The gap` (the first sentence, or a short excerpt picked in the trigger data).
2. **One or two questions** that pick the form, with the default answer first:
   - *probably*: "What will you do about the guess?" → *find out* / *leave it at could be* / *just a passing thought* → `thovul` / `thovum` / `thovur`
   - *I heard*: "How do you know?" → channel; then "How strong is it?" → ending
   - *thanks*: "What did it do for you?" → sake; then "How long will it stay with you?" → ending
   - *I can't*: "Not right now, not yet, or never?" → `-xe` / `-xo` / `-xu`
3. **Preview** of the sentence with the drop-in in place, and the English gloss of the form.
4. **Actions:** *Use this*, **Leave it in English** (as prominent as *Use this*), ▶ pronounce, *Learn this* (link to the lesson anchor).

*Use this* places the drop-in the way the lessons do ([placement](../meta/grammar-docs.md#claritish-track)): after the clause for stance words, as a hyphen suffix on the English host for label scope and ability, and before the word it colours for tone marks. Where the lesson's examples drop the English cue (*I think the store is closed* → *The store is closed `thovum`*), the preview offers to drop it too, and the writer can keep it.

Drop-ins are written plainly in the editor, without backticks, as in real use.

### Reading back what you wrote

- **Hover a drop-in** to see its gloss and the lesson it comes from.
- **Near misses.** A word that looks like a drop-in but is not one gets a suggestion: `thovom` → *did you mean `thovum`?*; `lied-ta` → *no `t` in Agazan: `-tha`?*; `lied-thal` → *suffixes take no ending*. Matching is against the generated form list, by edit distance, not against the parser.
- **Pronounce** any drop-in with the existing [TTS](../../src/tts/browser.ts).

### Writing without a cue

- **Slash commands.** `/sorry`, `/thanks`, `/know`, `/sure`, `/feel`, `/can`, `/tone` open the matching card at the cursor with no English cue needed.
- **Autocomplete.** After `th`, offer drop-ins from enabled lessons only, each with its gloss.

### Feelings composer

The emotion compose is the hardest drop-in to build by hand: sake, stance, ending, locus, motion. The `/feel` card (and an emotion-word cue) opens three pickers, **need**, **emotion locus**, **emotion motion**, plus met / unmet and the ending, and builds the word live with the same part-by-part breakdown the [cheat sheet](../grammar/claritish/cheat-sheet.md#feelings) shows. The emotion word in the English stays where it is unless the writer removes it.

### Mirror panel

An optional side panel counts, for the whole text, the cues still in plain English: *2 unmarked guesses · 1 label on a person · 1 should with no reason given*. It is a mirror, not a score: no totals, no colours that read as pass or fail, no nudge to reach zero. Each line jumps to its cue.

### For the person reading

Claritish is usually sent to someone who has not learned it.

- **Recipient preview** shows the message as a non-learner sees it, with each drop-in's gloss on hover.
- **Copy with footnotes** copies the text with a numbered gloss for each drop-in and one link to the [Claritish intro](../grammar/claritish/index.md). **Copy plain** copies the text as written.

### Practice mode

Loads a lesson's English example sentences with the drop-ins removed as prompts. The writer adds drop-ins with the normal editor, then compares with the lesson's version. Any drop-in that fits the prompt's note counts, not only the lesson's one.

## Content rules

- **Card copy** follows [Claritish wording and voice](../meta/claritish-style.md): the grammar's terms (*evidential channel*, *label scope*, *sake*, *emotion locus*), each glossed in plain English on first use. No Claritish-only coinages.
- **No forms in code.** Spellings come from the build, never from string literals in the editor or the trigger data, matching the [closed-roots rule](../../src/closed-roots.ts).
- **Nothing implies English is a mistake.** No "fix", "error", or "should" in the UI. *Leave it in English* is a normal outcome, not a dismissal.

## Architecture

### Where it lives

A Vue component `ClaritishEditor.vue` in [`.vitepress/components`](../grammar/.vitepress/components/), registered like `AgazanInspect`, rendered inside `<ClientOnly>` on one page. Where that page goes is an open question (below).

### Editor engine

**CodeMirror 6** (`@codemirror/state`, `view`, `lint`, `autocomplete`). Messages are plain text, and CodeMirror has the parts this needs built in: lint diagnostics with actions, hover tooltips, decorations, autocomplete, and keyboard access. It is a new dependency, but a mature, well-documented one, and it only ships in the site bundle for this page.

Alternative: Tiptap is already a dev dependency (used only by a lint script). It is rich-text oriented and has no lint or hover layer, so every card and underline would be custom ProseMirror decoration code, which is the riskier path.

### Data, generated at build

| File | Source | Holds |
|------|--------|-------|
| `data/claritish-triggers.csv` (new, hand-written) | Editors | One row per cue: id, lesson anchor, pattern, placement (`after-clause` / `suffix` / `before-word`), whether to offer dropping the cue, flow id, gap excerpt |
| `data/claritish-flows.json` (new, hand-written) | Editors | Question flows: prompts and choices. Each choice names a **cheat sheet cell** (row label × column header), never a spelling |
| `src/generated/claritish-editor.json` | Build | Resolved forms, glosses, gap excerpts, lesson URLs: everything the component needs, nothing it must look up |

The forms are read from the **cheat sheet**, which `lint-cheat-sheets.ts` already keeps equal to the lesson tables, and its table parsing can be shared. So a lesson edit or a respelling (via `retie-docs`) reaches the editor with no editor-side change. The build fails when a flow names a cheat sheet cell that does not exist.

### Matching

- Sentence split, then tokens with character offsets.
- Most cues are token sequences with optional words (*I (just) heard (that)*) and are case-insensitive.
- **Labels** need *pronoun + copula + (a / an / so / such a)? + trait word*. Start with a curated trait-word list in the trigger data. Add part-of-speech tagging (e.g. compromise.js) only if the list misses too much.
- **Feelings** use an emotion-word list in the trigger data.
- **Exclusions** per cue for common non-trap uses: *I think so*, *thanks to*, *sorry?* as a request to repeat, *can't wait*, *I'm going to the store*.
- Matching re-runs on the changed paragraph only, debounced.

### Storage

Draft text, lesson toggles, and the never-flag list in `localStorage`, wrapped in try/catch, with the page working when storage is empty or blocked.

## Checks and tests

- **Gap coverage lint (build).** Each italic English phrase in a lesson's `## The gap` matches a trigger row for that lesson, or is listed as exempt in the trigger data with a reason. A gap reworded without updating the triggers fails the build.
- **Flow lint (build).** Every flow choice resolves to a cheat sheet cell, every trigger's flow exists, and every lesson anchor exists.
- **Example round-trip (`npm test`).** For each lesson example, the English with the drop-in removed raises a cue from that lesson where the gap's cue is present, and the full example has no near-miss warnings.
- **False-positive corpus (`npm test`).** A fixed set of everyday sentences with no trap (*I think so*, *thanks to the rain*, *I can't wait*) raises nothing.
- **Component tests** with happy-dom, as for the existing components: placement of inserted drop-ins, one mark per sentence, lesson filter.

## Phased plan

Each phase ships on its own and leaves the site in a usable state.

### Phase 0: data and build plumbing

- Write `data/claritish-triggers.csv` and `data/claritish-flows.json` for **How sure are you?**, **How do you know?**, and **Thanks and sorry**.
- Factor the cheat sheet table parser out of `lint-cheat-sheets.ts` into a shared module and generate `src/generated/claritish-editor.json`.
- Add the flow lint and the gap coverage lint, limited to the three lessons.
- Add rows for the two new data files to the sources-of-truth table in `AGENTS.md`, and a short editor note (in `claritish-style.md` or its own meta page) on writing triggers and card copy.

**Done when:** the build produces the JSON, a deliberately broken flow fails it, and the three lessons' gaps are covered.

### Phase 1: minimum useful editor

- `ClaritishEditor.vue` on CodeMirror 6, on its page.
- Cue marking for the three lessons, one mark per sentence, quoted text skipped.
- Help card: gap line, question flow, preview, *Use this*, *Leave it in English*, ▶ pronounce, *Learn this*.
- Lesson filter, *Leave it*, *Never for this phrase*, saved draft.
- Example round-trip and false-positive tests for the three lessons.

**Done when:** a learner can paste a message, see cues from the three lessons, and add or decline a drop-in for each with the keyboard alone.

### Phase 2: all simple lessons, and reading back

- Triggers and flows for **Can and can't**, **Allowed, required, agreed**, **Oughts and motives**, **Wants and plans**, **Decisions and tries**, and **Tone marks**.
- Hyphen-suffix placement and before-word placement for tone marks.
- Hover gloss on existing drop-ins, near-miss suggestions.
- Slash commands and autocomplete.
- Gap coverage lint extended to every lesson.

**Done when:** every lesson except Labels and Feelings has cues, and every cheat sheet form can be inserted from a card or a slash command.

### Phase 3: Labels and Feelings

- Labels pattern with the trait-word list; measure misses against the lesson examples and a sample of everyday text, and decide on part-of-speech tagging from that.
- Emotion-word list and the feelings composer with its part-by-part breakdown.

**Done when:** the Labels and Feelings examples round-trip, and the composer can build every feeling form the lesson shows.

### Phase 4: reflection and sharing

- Mirror panel.
- Recipient preview, *Copy with footnotes*, *Copy plain*.
- Practice mode over the lesson examples.

**Done when:** a message can go from draft to clipboard with glosses a non-learner can follow.

### Later, if wanted

- A browser extension that runs the same matcher in other text boxes (email, chat). The matcher and data are already client-side, so this is packaging, but it brings permission and privacy review.
- "Match my progress": tie the lesson filter to the lessons the reader has opened.

## Open questions

1. **Where the page lives.** A last page in the Claritish sidebar after the cheat sheet, a link from the cheat sheet, or a separate *Tools* section. The track rules say the cheat sheet is the last page and sets `next: false`.
2. **Default lessons.** Three lessons on by default, all on, or "only lessons you've opened".
3. **Dropping the English cue.** Offer by default (closer to the lesson examples) or keep the cue by default (less editing of the writer's words).
4. **Mirror panel** default on or off.
5. **CodeMirror vs Tiptap**, if adding a dependency is a concern.

# Grammar doc wording and voice

Wording rules for editors who write the learner-facing Ageben grammar pages under `docs/grammar/`. What those pages teach, and how the material is organized, is in [grammar-docs.md](grammar-docs.md). The [Claritish track](grammar-docs.md#claritish-track) follows this page too, and [claritish-style.md](claritish-style.md) says what differs there. The two orientation pages, `purpose.md` and `introduction.md`, follow it as well, and [orientation-style.md](orientation-style.md) says what differs for them.

This page is private editor guidance. Grammar pages never link to it or mention it.

## Checklist
<a id="checklist"></a>

Each line is one rule. *Build* means `npm run build` checks it, so you do not need to hold it in mind. *Judgment* means only a reader can check it.

| Rule | Checked by | Section |
|------|------------|---------|
| No em dashes in published pages | Build, fails | [Punctuation](#punctuation) |
| Link text is a title or a plain job, never a filename | Build, fails | [Link text](#link-text) |
| No throat-clearing phrases | Build, fails | [Voice and length](#voice-and-length) |
| No empty reassurance, no exclamation marks in prose | Build, fails | [Warmth](#warmth) |
| No cue in the first sentence of a section | Build, fails | [Explain before you slogan](#explain-before-you-slogan) |
| No editor folders or legacy language name on a grammar page | Build, fails | [What the build checks](#what-the-build-checks) |
| Specialist terms are glossed where they first appear | Build, warns | [Plain language](#plain-language-no-assumed-linguistics) |
| A paragraph has at most five sentences | Build, warns | [Voice and length](#voice-and-length) |
| Bold is rare | Build, warns | [Voice and length](#voice-and-length) |
| A form is bold only where the page introduces it; letters and endings go in backticks, never bold | Judgment | [Voice and length](#voice-and-length) |
| A Beginner lead has two to four sentences before its example | Build, warns | [Explain before you slogan](#explain-before-you-slogan) |
| Second person; no maintainer *we*, no author *I* | Judgment | [Voice and length](#voice-and-length) |
| The lead says the English job, the Ageben shape, and the consequence | Judgment | [Explain before you slogan](#explain-before-you-slogan) |
| Every section that introduces a distinction says why the learner cares | Judgment | [Consequence](#consequence) |
| A point is previewed once and explained once | Judgment | [Say it once](#say-it-once) |
| A choice says when to pick each side | Judgment | [A choice says when](#a-choice-says-when) |
| A picture or metaphor follows the plain rule | Judgment | [Unpack English pictures](#unpack-english-pictures) |
| House shorthand is said in longer English on first use | Judgment | [House shorthand](#house-shorthand) |
| Reassurance changes what the learner does or expects | Judgment | [Warmth](#warmth) |
| Controls are described in a table | Judgment | [Interface instructions](#interface-instructions) |

Run the [closing tests](#before-you-finish) on anything you wrote or rewrote.

## Which rules apply to which page
<a id="which-page"></a>

The lead rules were written for a section that teaches a grammar feature. Other kinds of page use them as follows.

| Kind of page or section | What applies |
|-------------------------|--------------|
| A section that teaches a new English job | Everything on this page |
| A later-stage section that only finishes a series already taught | A one-sentence pointer and a table are enough ([later-stage shape](grammar-docs.md#later-stage-shape)). Skip the slogan test. Gloss any new label |
| A pronunciation section | There is no English job. The lead says what to do with the mouth or voice, then what a listener gains from it. Everything else applies |
| The lead of a whole page | It previews each section in at most one sentence ([say it once](#say-it-once)) |
| Instructions for a control or tool on the page | [Interface instructions](#interface-instructions) |
| A [Claritish](claritish-style.md) lesson | `## The gap` replaces the lead: it names the English habit and its cost, and Ageben enters only in its last sentence ([the gap](claritish-style.md#the-gap)). Skip the lead rules and the slogan test. Everything else applies |
| Tables | May stay telegraphic. Running prose may not |
| An orientation page (`purpose.md`, `introduction.md`) | [orientation-style.md](orientation-style.md). The lead rules and the slogan test do not apply; the rest of this page does, as that page lists |
| The glossary (`terminology.md`) | Exempt from the specialist-term check, since defining those terms is its job |
| A recipe page (`english.md`, `say-*.md`) | The heading already names the English job, and a **Needs:** line comes first. The lead restates the job in a clause at most, often as the English example, then gives the Ageben shape, and still ends with the consequence. Everything else applies |
| A cheat sheet (`cheat-sheets/`) or level review (`review*.md`) | Lookup and practice. Only [punctuation](#punctuation), [link text](#link-text), [plain language](#plain-language-no-assumed-linguistics), and voice apply to their prose. Generated tables and Practice are not edited for style |

## What the build checks
<a id="what-the-build-checks"></a>

`npm run build` runs `scripts/lint-prose-style.ts` over every page under `docs/grammar/`. The rules live in `src/lint/prose-style.ts`. Fenced code and HTML comments are never checked.

Exact rules fail the build:

| Rule | Fails on |
|------|----------|
| `link-filename` | Link text that is a filename, such as `[word-endings.md](…)` |
| `throat-clearing` | A fixed list of phrases: *in this section*, *it is important to note*, *it is worth noting*, *we now*, *as mentioned above*, *keep in mind that*, and a sentence that opens with *Note that* |
| `empty-warmth` | A fixed list of phrases: *don't worry*, *no worries*, *it's easy*, *great job*, *well done*, *congratulations* |
| `exclamation` | An exclamation mark in a prose paragraph, outside italics and quotation marks |
| `cue-first` | `(cue: …)` in the first sentence under a heading, on stage pages |
| `editor-path` | A mention of `docs/meta/` or `docs/proposals/` |
| `legacy-name` | The language's former name as a word. A real community URL on a legacy host is a link target, and link targets are not checked |

Quoted example lines and English in italics are examples, not the page's own voice, so the phrase lists skip them.

Heuristic rules warn. The build prints one count per rule, and `npm run lint:prose -- --report` lists each hit with its file and line.

| Rule | Warns on |
|------|----------|
| `jargon` | A specialist term from the list in the lint. A page that glosses the term where it first appears is added to `JARGON_ALLOWED` there |
| `long-paragraph` | More than five sentences in one paragraph |
| `bold-density` | More than four bold phrases in one paragraph |
| `beginner-lead` | Fewer than two or more than four sentences between a Beginner H3 and its first example |
| `voice` | Maintainer *we* (*we*, *us*, *our* and their forms) and author *I* (*I*, *me*, *my* and their forms) in the page's own words. Examples are skipped: italics, quotation marks, quoted lines, tables, numbered prompts, example lines in answers, and a gloss in parentheses after an example. Author *I* is allowed in the introduction's Acknowledgments and the purpose page's Criticisms ([voice and length](#voice-and-length)) |

A warning is a place to look, not a verdict. A one-sentence lead is right when the previous section already made the job obvious.

Warnings are ratcheted. `src/lint/prose-style-baseline.json` holds each page's count per rule, and the build fails when a page's count rises above it. A page or rule missing from the file counts as zero. To accept a warning, or to lock in a page you cleaned up, run `npm run lint:prose -- --update-baseline` with the page paths (or none, for every page). The file's diff shows the decision. An accepted warning stays in the file, so a warning is still a place to look, not a verdict.

To add a phrase or a term, edit the list in `src/lint/prose-style.ts` and add a case to its test.

Two commands support a style review. Neither runs in the build.

| Command | Use it to |
|---------|-----------|
| `npm run changed-sections -- <rev> [paths…]` | Find the sections to review: each H2 or H3 under `docs/grammar/` whose text changed since `<rev>`, is new or moved, or follows one that changed, plus a changed page lead |
| `npm run wording-only -- [--since <rev>] [paths…]` | Prove an edit changed wording only. It fails when headings, anchor ids, fenced blocks, Practice, generated blocks, the forms in code spans, link targets, or example glosses differ from `<rev>` (default `HEAD`) |

## Punctuation
<a id="punctuation"></a>

Em dashes are banned in published and root Markdown, and the build fails on them. Use commas, colons, parentheses, or separate sentences. Three places are exempt:

- A hang tree may use an em dash in a node label (the fit cue after `├──`).
- A table cell that holds only an em dash marks an unused slot.
- Fenced code, `docs/meta/` and `docs/proposals/` are not checked.

## Voice and length
<a id="voice-and-length"></a>

- Address the learner in second person ("use `-r` when…", "prefer names when…"). That *you* is English teaching voice, not an Ageben pronoun.
- Teaching stages do not use maintainer *we* ("we now write…") or author *I*. Author *I* is allowed only on signed prose that does not teach rules: the acknowledgments and the criticisms on the purpose page ([orientation voice](orientation-style.md#voice)).
- One idea per H2 or H3.
- Keep a paragraph to five sentences or fewer. When a paragraph lists parallel items (controls, cases, options), use a table.
- Do not clear your throat ("In this section…", "It is important to note…"). An extra sentence must add mechanism or consequence.
- Bold sparingly: a term at the point it is defined, and a control's label. Put Ageben forms in backticks, not italics.
- Treat a form like a term. An Ageben form may be bold where the page introduces it, and is plain backticks after that, so bold tells the learner *this is where it is taught*. Bare letters and endings always go in backticks (`` `-l` ``, never **-l**). A paragraph that introduces more than four forms still trips `bold-density`; the fix is usually a table. A heading that spells a content root pins an English `{#id}` ([retie-safe writing](grammar-docs.md#retie-safe-writing)).

### Warmth
<a id="warmth"></a>

Most warm sentences are filler: praise, cheerleading, *don't worry*, *it's easy*. They tell the learner nothing, and *easy* discourages the reader who is finding it hard. The build rejects the common ones.

Three kinds of sentence sound warm and carry information. They are allowed:

| Kind | What it tells the learner | Example |
|------|---------------------------|---------|
| Normalizing a predictable struggle | Missing at first is expected and is not a reason to stop | "Matching a note takes practice at first, and it improves quickly." |
| Permission | Where the bar honestly sits | "Vowel pitch is optional." "Any comfortable note works." |
| The human payoff | What the form lets you say to someone or notice in yourself | See [consequence](#consequence) |

**Test (warmth):** the sentence may stay if it changes what the learner does or expects. "This takes practice at first" passes. "You're doing great" fails.

Put reassurance where the difficulty is predictable (a new sound, pitch, the first long sentences), at most once in a section. Let the examples carry most of the warmth: sentences about real feelings and the [house people](grammar-docs.md#house-people) show the language's character better than friendly prose around a table.

## Explain before you slogan
<a id="explain-before-you-slogan"></a>

Brevity means no filler. It does not mean the most claims per clause. Use a longer sentence when the shorter one only stays short through awkward phrasing.

On a new job, the first paragraph is one complete explanation. A Beginner lead may take two to four short sentences before the first example. One sentence is enough only when the previous H3 already made the job, shape, and consequence obvious. This is the same bar as the [easy-to-use feature criterion](feature-criteria.md#easy-to-use): about one paragraph plus a couple of examples.

Inside the lead, teach in this order. It is the lead-sized form of [teach in this order](grammar-docs.md#teach-in-this-order).

1. **English job.** What the learner is trying to say, in school-grammar English.
2. **Ageben shape.** Which letter, ending, or slot does that job, and where it sits.
3. **Consequence.** What the learner can now do ([consequence](#consequence)).
4. **Cue last.** Letter puns, emoji scenes, and [English pictures](#unpack-english-pictures) come after the rule. They are never the definition.

Do not merge steps 1 to 3 into a slogan of the form *X is Y*, or into a packed command (*do A so that B*), until all three have been said in ordinary English. The sentence that introduces a new choice (reorder, omit, attach) should not also introduce a new metaphor or a new technical noun. Split it.

| Smell | Why it fails | Prefer |
|-------|--------------|--------|
| *X is Y* slogan: "the role letter is the job" | Equates a letter with an abstract label and never says what you read off the letter | "The first letter of the word tells you its role (subject, verb, …). Change only that letter when the same meaning plays a different role." |
| Packed emphasis: "Put first what you want heard as the point" | "Point" is undefined, and the sentence assumes free word order | First: roles stay on the letters, so order is free. Then: the leftmost content word is what you highlight (what the sentence is about, or the new information). |
| Cue as definition: "`d` = done to" in the rule sentence | The pun is memorable only after "acted on" is taught | Teach that the direct object is who or what is acted on, then `(cue: d ≈ done to)`. |
| Label as explanation: "The boundary is `darl`." | Names the form without saying what a boundary does | "The main sentence stops after `darl`; the next full sentence is the content that `darl` stands for." |
| Omission as slogan: "Leave `yal` out when a period already marks a statement" | Assumes the reader knows why `yal` exists | "A period already means 'this is a statement,' so you do not also write the statement word `yal`." |
| Packed command: "Spell the beats you actually say" | The reader cannot tell what to do differently | "Spelling follows the beats you say. A consonant starts a beat." |

### A worked lead
<a id="worked-lead"></a>

Before:

> **No subject.** Drop `/z/` for an agentless clause (cue: nobody home).

The heading is restated as a slogan, *agentless clause* is unglossed, the cue sits in the rule sentence, and nothing says what the reader gains.

After:

> English uses the passive (*The cat was seen*, *Mistakes were made*) to avoid naming who acted. Ageben leaves out the `/z/` word. The verb and its object stay the same, and the sentence says nothing about who did it.

The first sentence is the English job. The second is the Ageben shape. The third is the consequence: nothing else in the sentence changes, and you can report what happened without saying who did it.

### Consequence
<a id="consequence"></a>

Every section that introduces a distinction says what the learner can now do with it. Two kinds count:

- **Mechanical.** What you may now reorder, leave out, or attach.
- **Human.** What the form lets you say to someone, or notice in yourself, that English makes awkward. Ageben exists for these, so name one when the feature has it.

A section that describes a pattern and stops has no consequence. "The four vowels form two opposite pairs" needs a next sentence saying what the pairing is for.

### Say it once
<a id="say-it-once"></a>

The lead of a page may preview a point in one sentence. The section that owns the point explains it once. Nothing between the two restates it.

When you find the same explanation a third time, keep the one in the owning section and cut the others down to the preview or to nothing.

### A choice says when
<a id="a-choice-says-when"></a>

When a page offers two ways to do something, it says when to pick each. "The unvoiced sound is fine for style" leaves the reader guessing. "The unvoiced sound means the same, so use it whenever you like its sound better" does not.

A mention of something the section does not explain is a related fault. Either explain it in a clause or cut it ([teach now; don't preview later](grammar-docs.md#teach-now-dont-preview-later)).

### Unpack English pictures
<a id="unpack-english-pictures"></a>

A picture in the teaching English (weather, law, climate, theater, gears) is a cue, not the rule. State the English job in school words first. The picture may then follow, in the same breath or in the Cue column.

Do not let the picture stand in for the contrast. Cover the image words: what is left must still name both sides of the split. A verb can be a picture too. "That climb hangs on letter order" and "pitch backs up the vowel" both make the reader decode an image before they reach the fact.

| Smell | Why it fails | Prefer |
|-------|--------------|--------|
| "Habitual *always* stays a weather report rather than a law of nature." | *Weather report* and *law of nature* are undefined images, and *stays* guards against a reading nobody proposed | "Habitual *always* is the usual pattern (exceptions expected), not something that must happen, and not an ought." Then, if useful: `(cue: usual weather, not a law of nature)`. |
| "Universal claims are weather reports." as the first teaching sentence | Equates the mood with the picture before *usually* and *by natural necessity* are named | Name COMMON and NATURAL (or *usually* and *must happen that way*) first, then the climate picture |
| A new picture in the same sentence as a new choice | Two new things at once | Split: the job, then the picture |

Allowed: published-root scenes in the Cue column, [conceptual metaphors](../grammar/purpose.md#conceptual-metaphors) after the job is named, and one short `(cue: …)` after the plain rule.

### House shorthand needs a first-use gloss
<a id="house-shorthand"></a>

Some house labels look like ordinary English. If a heading or a table column uses the short word, the first teaching sentence still says it in longer English once.

| Short word | Unpack on first use as |
|------------|------------------------|
| job | Role in the clause (subject, verb, …). The table header **Use** is the same idea |
| point, prominence | What comes first for emphasis (what the sentence is about, or the new information) |
| setting | Statement, question, or command |
| body | The clause after any opening `/y/` words |
| glue, linker | A word that connects one sentence to the next |

Three table headers are defined once in [How to learn](../grammar/introduction.md#cues) and are not unpacked again on each page: **Use**, **Cue** (a memory aid), and **Same root as** (the everyday kind of that root, in its citation form).

Intermediate and Advanced sections that finish a series may stay denser once Beginner has unpacked the terms. A later-stage new job still glosses any new label on first use.

## Plain language (no assumed specialist vocabulary)
<a id="plain-language-no-assumed-linguistics"></a>

Write for a motivated learner with ordinary school grammar (*subject*, *verb*, *adjective*). Do not assume linguistics, and do not assume any other specialist field either. Music terms (*semitone*, *cutoff*), notation (the IPA stress mark), and software terms need the same gloss as *adjunct* does.

| Do | Don't |
|----|-------|
| Use everyday English for the job (*statement*, *ask*, *main clause*, *at the end of…*) | Lead with bare terms like *assertoric*, *illocution*, *matrix-final*, *predicative*, *prosody*, *paradigm* |
| Define a technical label in the same sentence as its first use, when the label helps later cross-links | Use the label alone and hope context teaches it |
| Define invented or uncommon labels the same way (*turn*, *continue*, *speech act*, *polar particle*, *role letter*, *citation*), and [house shorthand](#house-shorthand) too | Use the label in an earlier section or a bare heading and gloss it later |
| Use a label in a heading only after its gloss, or let the heading carry the gloss (*Turn (`/y/`): start a new speech move*) | Stack several undefined terms in one sentence (*recoverable*, *utterance*, *left-edge cluster*) |
| Use school-grammar words (*subject*, *direct object*, *adverb*) when the English job is clear | Pack shorthand (*classification* without *is a kind*, *right-bound*, *adjunct*, *complement clause*) without a plain gloss |

[terminology.md](../grammar/terminology.md) is a later lookup, reached through How to learn. It is never the first definition, and teaching pages do not assume the reader has opened it.

A page title may be a specialist term when the name is established (*Phonology*). The first sentence under it then glosses the term.

## Link text
<a id="link-text"></a>

Link text is the target's title or the job in plain words. It is never a filename: write `[Word endings](word-endings.md)`, not `[word-endings.md](word-endings.md)`. The build fails on filename link text.

In a See also list, a line may be the plain job, a colon, and the titled link: "Saying a word on its own: [Word endings](word-endings.md)". The job tells the reader why to follow the link, and the title tells them where they will land.

## Interface instructions
<a id="interface-instructions"></a>

Some pages carry a control: a drill, a player, an editor. Describe it this way:

- Give the steps to start in one short paragraph, in the order the learner does them.
- Put the controls in a table with two columns, the control and what it does. Bold each label exactly as the page shows it.
- State privacy and storage facts (what is recorded, what is saved, where) in sentences of their own.
- Keep the instructions next to the control, and no longer than the teaching they support ([required before optional](grammar-docs.md#required-before-optional)).

## Before you finish
<a id="before-you-finish"></a>

Run these on each section you wrote. Skip the first on a table that only finishes a series.

1. **Slogan test.** Cover the example block. Could a careful adult who has never opened this repo restate the rule in their own words from the lead alone? If they would have to guess what "job", "point", "setting", or "body" means, unpack those words in the lead. A cue in parentheses does not count as unpacking. On a later-stage new job the reader knows the Beginner terms, and must still get the new choice from the lead.
2. **One new move.** Does the sentence that introduces a new choice also introduce a new metaphor or a new technical noun? Split it.
3. **Cover the picture.** Delete the metaphor nouns and verbs. Can the reader still restate both sides of the split? If not, state the rule plainly first.
4. **Plain language.** Hide the rest of the page. Does the first sentence that contains an invented or specialist word still teach what that word means? If not, rewrite the lead in plain words and move the term into a parenthesis or a later note.
5. **Why care.** Does the section say what the learner can now do or hear? If it only describes, add the [consequence](#consequence).
6. **Once.** Is any explanation on the page for the second time? Keep it where it is owned.
7. **Warmth.** Does each reassuring sentence change what the learner does or expects? Cut the ones that do not.

# Grammar doc wording and voice

Wording policies for editors writing learner-facing Agalan grammar pages under **`docs/grammar/`**. For what those pages should teach and how to organize the material, see [grammar-docs.md](grammar-docs.md). Grammar pages must **not** link to or mention `meta/` or any other folder outside `grammar/`; this page is private editor guidance.

## Punctuation

Prefer commas, colons, parentheses, or separate sentences over em dashes.

## Voice and length

- Address the learner in second person (“use **-r** when…”, “prefer names when…”). That *you* is English pedagogy — not Agalan **`edone`**.
- Teaching stages do not use maintainer *we* (“we now write…”) or author *I*. Author *I* is allowed only on signed non-teaching prose in this folder (acknowledgments; the purpose / limits essay), not on rule pages.
- One idea per H2/H3. On a **new job**, the first paragraph should be one **complete** explanation: English job, Agalan shape, and what that lets the learner do ([explain before you slogan](#explain-before-you-slogan)). That is the same bar as the [easy-to-use feature criterion](../grammar/why-agelan.md#criterion-for-features) (roughly one paragraph plus a couple of examples), not a one-sentence aphorism. A later-stage H3 that only finishes a series may be a short pointer plus a table ([later-stage shape](grammar-docs.md#later-stage-shape)).
- Prefer short paragraphs plus a table over a wall of prose.
- Bold sparingly; put Agalan forms in backticks (`yal`, **-r**, `/ɡ/`).
- Always call the language **Agalan**. Community / project URLs that still use a legacy host path are fine when they are the real link; do not “fix” them in learner prose.

## Explain before you slogan
<a id="explain-before-you-slogan"></a>

Brevity means **no filler**, not **maximum claims per clause**. Conciseness must not come at the cost of clarity: use a longer sentence when the shorter version depends on awkward phrasing to stay brief. A Beginner lead may take **two to four short sentences** before the first example. One sentence is allowed only when job, shape, and consequence are already obvious from the previous H3. Later-stage **new-job** leads use the same unpacking (no hard sentence count). Later-stage **finish-the-series** leads may be one pointer sentence before the table.

**Teach in this order inside the lead** (same as [Teach in this order](grammar-docs.md#teach-in-this-order), enforced inside the first paragraph):

1. **English job** — what the learner is trying to say, in school-grammar English.
2. **Agalan shape** — which letter, ending, or slot does that job, and where it sits.
3. **Consequence** — what they may now do that English does not (reordering, omitting a word, attaching a clause).
4. **Cue last** — letter puns, emoji scenes, and [English pictures](#unpack-english-pictures) are **after the rule**, never the definition.

Do not merge (1)–(3) into a copula slogan (*X is Y*) or a packed imperative (*do A so that B*) until those three pieces have been said in ordinary English.

| Smell | Why it fails | Prefer |
|-------|--------------|--------|
| Copula slogan: “the role letter is the job” | Equates a letter with an abstract label; never says *what you read off the letter* | “The first letter of the word tells you its role (subject, verb, …). Change only that letter when the same meaning plays a different role.” |
| Packed prominence: “Put first what you want heard as the point” | “Point” is undefined; also smuggles free word order | First: roles stay on the letters, so order is free. Then: the leftmost content word is what you highlight (what the sentence is “about,” or the new information). |
| Cue as definition: “**d** = done to” in the rule sentence | The pun is memorable only after “acted on” is taught | Teach *direct object = who or what is acted on*, then `(cue: **d** ≈ done to)`. |
| Label = explanation: “The **boundary** is **`darl`**.” | Names the form without saying what a boundary *does* | “The main sentence stops after **`darl`**; the next full sentence is the content that **`darl`** stands for.” |
| Omission as slogan: “**Leave `yal` out** when a period already marks a statement” | Assumes they know why `yal` exists | “A period already means ‘this is a statement,’ so you do not also write the statement word **`yal`**.” |

**Test (slogan test):** cover the example block. Could a careful adult who has never opened this repo restate the rule in their own words from the lead alone? If they would have to guess what “job,” “point,” “setting,” or “body” means, unpack those words in the lead. A cue in parentheses does not count as unpacking. On Intermediate / Advanced **new-job** leads, they may already know Beginner terms; they must still get the **new** choice from the lead. Skip this test on finish-the-series tables.

**Test (one new move):** the sentence that introduces a *new* choice (reorder, omit, attach) should not also introduce a new metaphor or a new technical noun. Split it.

Do **not** pad with throat-clearing (“In this section we will…”, “It is important to note…”). Extra sentences must add **mechanism or consequence**, not warmth.

Tables may stay telegraphic (**Agalan · Use · English · Same root as · Cue**). Running prose may not.

### Unpack English pictures
<a id="unpack-english-pictures"></a>

A picture in the teaching English (weather, law, climate, theater, gears) is a **cue**, not the rule. State the English job in school words first. Then the picture may follow, in the same breath or in **Cue**.

Do **not** let the picture stand in for the contrast. Cover the image words: the leftover must still name both sides of the split.

| Smell | Why it fails | Prefer |
|-------|--------------|--------|
| “Habitual *always* stays a weather report rather than a law of nature.” | *Weather report* / *law of nature* are undefined vehicles; *stays* is writer fencing | “Habitual *always* is the usual pattern (exceptions expected), not something that must happen, and not an ought.” Then, if useful: `(cue: usual weather, not a law of nature).` |
| “Universal claims are **weather reports**.” as the first teaching sentence | Equates the mood with the picture before *usually* vs *by natural necessity* | Name COMMON vs NATURAL (or *usually* vs *must happen that way*) first; then the climate picture |
| New picture in the same sentence as a new choice | [one new move](#explain-before-you-slogan) | Split: job, then picture |

**Test (cover the picture):** delete the metaphor nouns. Could they still restate the split? If not, unpack first.

Allowed: published-root scenes in **Cue**; [conceptual metaphors](../grammar/why-agelan.md#conceptual-metaphors) after the job is named; one short `(cue: …)` after the plain rule.

### House shorthand needs a first-use gloss
<a id="house-shorthand"></a>

[Plain language](#plain-language-no-assumed-linguistics) already requires glossing invented labels (*turn*, *role letter*, *speech act*). The same rule applies to **house shorthand that looks like ordinary English**. If the heading or table column uses the short word, the first teaching sentence must still say it in longer English once.

| Short word | Unpack on first use as |
|------------|------------------------|
| **job** | role in the clause (subject, verb, …). Table header **Use** is the same idea; do not re-gloss the column name on every page ([How to learn](../grammar/introduction.md#cues)) |
| **Cue** | memory aid; defined once in How to learn — not unpacked in each table |
| **Same root as** | everyday kind of that root (citation **-l**); defined once in How to learn — not a second **English** column |
| **point** / **prominence** | what comes first for emphasis (what the sentence is “about,” or the new information) |
| **setting** | statement vs question vs command |
| **body** | the clause after any opening `/y/` words |
| **glue** / **linker** | sentence-to-sentence connective |

Intermediate / Advanced **finish-the-series** inventories may stay denser once Beginner has unpacked the terms. A later-stage **new job** still glosses any **new** label on first use.

## Plain language (no assumed linguistics)
<a id="plain-language-no-assumed-linguistics"></a>

Do **not** assume the reader knows linguistics jargon. Write for a motivated learner with ordinary school grammar (*subject*, *verb*, *adjective*), not for a linguistics seminar.

| Do | Don’t |
|----|--------|
| Prefer everyday English for the job (*statement*, *ask*, *main clause*, *at the end of…*) | Lead with bare terms like *assertoric*, *illocution*, *matrix-final*, *predicative*, *prosody*, *paradigm* |
| If a short technical label helps later cross-links, **define it in the same breath** on first use | Use the label alone and hope context teaches it |
| **Define invented or uncommon labels before using them** (*turn*, *continue*, *speech act*, *polar stance*, *role letter*, *citation*): everyday English in the **same sentence as first use**. Same for [house shorthand](#house-shorthand) (*job*, *point*, *setting*, *body*, *linker*) | Use the label in an earlier section or as a bare heading, then gloss later; rely on [terminology.md](../grammar/terminology.md) as the first definition |
| A heading may use that label only **after** the gloss, or the heading itself carries the gloss (*Turn (`/y/`): start a new speech move*) | Stack several undefined jargon words in one sentence (*recoverable*, *utterance*, *left-edge cluster* without a plain paraphrase) |
| School-grammar words (*subject*, *direct object*, *adverb*) are fine when the English job is clear | Pack morphosyntax shorthand (*classification* without *is a kind*, *right-bound*, *adjunct*, *complement clause*) without a plain gloss |

[terminology.md](../grammar/terminology.md) is a later lookup (via How to learn), not the first definition. Teaching pages do not assume the reader has opened it.

**Test:** would a careful reader who never took a linguistics class still get the rule from the first paragraph and the example? If you hide the rest of the page, does the first sentence that contains an invented word still teach what that English word means? If not, rewrite the lead in plain words and demote the technical term to a parenthetical or a later Intermediate note.

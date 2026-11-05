# Proposal: Same-role relation words (closed citation list)

**Status:** PROPOSED, ready to implement. Session 1 can start now, and Session 2 follows it. Workstreams done: none.

User decisions (2026-11-05):
- It is a **closed list**, never any lexicon word.
- The citation words take over **only the same-role job**. `/h/` / `/ɡ/` relation words keep their clause and noun jobs (`habam blarl …` *before* between clauses stays).
- **-l** / **-m** carry the hook's closed / open meaning.
- A reaches the **nearest same-role phrase**.
- B may be a **fill-ask blank**. The blank comes first, as with every fill-ask.
- A lone `/d/` (`dodozel.`) means *something unspecified happened to the dog*. It is a valid answer when the blank was a `/d/`.
- An answer bigger than one noun phrase is a **sentence that keeps only the blank's role**, with every letter: existence for a `/z/` blank, the lone `/d/` for a `/d/` blank.
- Every listed word takes both **-l** and **-m**, with no per-row exceptions.
- The overlap with the order joins (`zaol`) is kept, with a Compare-with line.
- Part 2 is taught at **intermediate**, after the hinges. Part 1 is taught where fill answers are first taught.
- The work runs in **two sessions**: Session 1 is Part 1, and Session 2 is Part 2 and closing.
- **Four words ship:** `abam`, `alam`, `erom`, and `ewem`. `ovam`, `ahom`, `arum`, `anem`, and `ezem` are not shipped ([not shipped](#not-shipped)). `ovam` never ships: it would come from a `/th/` relation.

**Related:** [hooks.md](../grammar/beginner/hooks.md) (same-role `A HOOK B`, [closed and open endings](../grammar/beginner/hooks.md#closed-and-open-endings)), [relations.md](../grammar/beginner/relations.md), [dependents.md](../grammar/beginner/dependents.md#hinges), [sentence-linkers.md](../grammar/intermediate/sentence-linkers.md#sentence-linkers), [rank-joins.md](../grammar/intermediate/rank-joins.md) (`zaol`), [word-endings.md](../grammar/beginner/word-endings.md#citation-forms), [questions.md](../grammar/beginner/questions.md) (fill answers), [fill-ask-jobs.md](../grammar/beginner/fill-ask-jobs.md), [predication.md](../grammar/beginner/predication.md#existence), [viewpoint.md](../grammar/intermediate/viewpoint.md#landmark-facing), [locative-relations.md](../grammar/intermediate/locative-relations.md), [english.md](../grammar/english.md#motion), [`data/lexicon-overlays.csv`](../../data/lexicon-overlays.csv), [`src/parse/sentence-parser.ts`](../../src/parse/sentence-parser.ts) (`citation` rule in clause units, ~line 702), [`src/parse/tokens.ts`](../../src/parse/tokens.ts) (`citationFallback`), [`src/parse/constructions.ts`](../../src/parse/constructions.ts), [unassigned-reserved.md](../meta/unassigned-reserved.md), [design-decisions.md](../meta/design-decisions.md), [proposals.md](../meta/proposals.md) (how this plan runs), [drill-generation.md](../meta/drill-generation.md).
**Depends on:** none.
**Design authority:** changes these forms and readings:
- **Part 1:**
  - A bare citation in a clause body loses its untaught reading.
  - A bare fill answer must be one noun phrase. Bare fragments of more than one phrase are rejected, except a full name.
  - A lone `/d/` gains the reading *something happened to it*.
  - A sentence that keeps only the blank's role (existence, or the lone `/d/`) is taught as an answer.
- **Part 2:**
  - 8 same-role citations (four words, each with **-l** and **-m**), including the fronted word + blank in a fill-ask.
  - **-n** / **-r** on a listed word are left with no reading.

Once implemented, the grammar pages own the result and this file is deleted.

## Problem

1. **The parser reads more than the docs teach.** A bare citation inside a clause body parses today with no error (`zazozon vowurol azozol.`, `citationFallback`, "names, filling no slot"). No page teaches that reading.
2. **Fill answers and that fallback are one parser rule.** `citation` is a clause unit read at the subject level (`zCoord`). The one-word answer `azozon.` and the untaught `zazozon vowurol azozol.` come from the same rule. So the fallback cannot be retired without first saying what a citation answer is.
3. **The docs disagree on what a citation answer is.**
   - [questions.md](../grammar/beginner/questions.md#fill-ask) says a fill answer is root + ending with no role letter (`azozon.`).
   - [fill-ask-jobs.md](../grammar/beginner/fill-ask-jobs.md) calls `gelazem.`, `el bohehal.`, and `om bazozon.` citations, but each keeps its role letter.
   - In practice, only a noun-blank answer drops its letter.
4. **Hooks have three jobs, but content roots reach only two.**
   - **Discourse glue:** the `/x/` sentence linkers (`xahom`, `xezem`, …) are a closed list of content roots.
   - **Extra noun:** the `/h/` / `/ɡ/` relations and hinges (`hewem bl…`, `habam bl…`) are a closed list of content roots.
   - **Same role** (`A HOOK B`, B keeps A's role letter): only the four vowel hooks (`al` / `ol` / `el` / `ul`) and the ranges. No content root can relate two members of one role.
5. **English *A before B*, *A like B*, *walks while singing* need a whole second clause today.** The second clause has to restate what the two share: `zazozon vowurol habam blarl zahelan vowurol.` *Azozon walks before Ahelan walks.*

## Goals

1. **One rule for fill answers.** It says what a fill answer may drop, it is taught once, and every page that shows an answer agrees with it.
2. **No parser reading without a page that teaches it.** The untaught `citationFallback` reading of a bare word in a clause body goes away, and the lone `/d/` gets a taught reading.
3. **Content roots reach the same-role job.** A closed list of relation words relates two members of one role, the way the vowel hooks do.
4. **One clause for *A before B*, *A like B*, *walks while swimming*.** None of these needs a second clause that restates what the two share.

## Non-goals

- **No change to the other jobs.** The `/h/` / `/ɡ/` relation words keep their clause and extra-noun jobs, and discourse glue stays with the `/x/` sentence linkers.
- **No change to citations outside a sentence.** That covers greetings, conversation-length bids, full names, lists, and headings.
- **No new roots.** Every listed word is an overlay on an existing published row.
- **No landmark relations.** No form exists yet for spatial *past* (*walks past the house*), *opposite* / *across from*, or *beyond* as *on the far side of*. *Along* and *up / down the hill* are only approximate. These are landmark relations, so they become new `/h/` + `bl-` rows on [locative-relations.md](../grammar/intermediate/locative-relations.md), not same-role citations. Workstream 5 logs them in `TODO.md`.
- **No hooked joins.** A [hooked join](../grammar/advanced/hooked-joins.md#hooked-joins) limits a set by a `bl-` landmark, and a listed word never takes one. Both readings already have forms:
  - Limiting the set: a join with a `/ɡ/` relation (`zual gewem blazozon vowurol.` *Everyone like Azozon walks*; `zual gabam blazozon vowurol.` *Everyone before Azozon walks*).
  - Relating a set to a member: a listed word with a join as A (`zarx abam zazozon vowurol.` *Some people walk before Azozon*).

  A consonant root before the seam (`zabax…`) would also look like an `x` compound or an ability ending. The new sitting gets one Compare-with line pointing to the `/ɡ/` relations.

## Design

### Part 1: a citation answer is one noun phrase

A fill answer that drops its role letter is **one noun phrase**: one citation, with its `/ɡ/` words (`odozel gelazem`, a full name `alon golowon`). It answers a noun blank only. No other answer drops a letter.

- **Every other short answer keeps its letters**, as the pages already show:
  - adjective: `gelazem.`
  - hook + landmark: `el bohehal.`, `om bazozon.`
  - relation + `bl-`: `hewem blowowol.`
  - clause hinge: `ul barl zalazun vezuvel.`

  Reword fill-ask-jobs to call these **short answers**, not citations.
- **Anything bigger keeps its letters.** That includes two members, a join, or a relation between members. `azozon ewem ahelan.` and `azozon ahelan al.` have no reading as fragments (log as **closed**).
  - **The short answer is a sentence that keeps only the blank's role.** It keeps every letter, so joins and listed words read exactly as they do in a clause. It needs no new form: existence and the lone `/d/` (below) are ordinary sentences, and the reply only has to match the blank's role.
    - For a `/z/` blank, use existence: `zazozon zahelan zal.` *There are Azozon and Ahelan* answers *Who walks?*
    - For a `/d/` blank, use the lone `/d/`: `dodozel dalazun dal.` answers *Whom does Azozon see?*
    - A relation works the same way: `zazozon ewem zahelan.` answers *Who walks?* with *Azozon, like Ahelan.*
  - The answer section on [questions.md](../grammar/beginner/questions.md#fill-ask) gains one line: for one noun, use the bare citation; for more, keep the blank's letter.
- **A lone `/d/` is a sentence: something happened to it.** `dodozel.` means *Something happened to the dog*, with the event left unsaid. It sits beside [existence](../grammar/beginner/predication.md#existence): a lone `/z/` says the thing is there, and a lone `/d/` says something befell it. A noun plus a `/d/` word with no verb (`zazozon dalazun.`) still has no reading.
  - As a reply to a `/d/` blank, the lone `/d/` is a valid answer. The dog is what the event happened to, and the question already named the event.

    > `yel dar zazozon vayebel.`
    >
    > "What does Azozon see?"

    > `dodozel.`
    >
    > "The dog."

  - The bare `odozel.` answers the same question.
- **Why not drop letters more widely:** dropping the letter erases the lines the grammar draws.
  - The join `zal` becomes `al`, the vowel hook.
  - `hewem` becomes `ewem`, the same-role word in Part 2.
  - A string of bare words could be a list, a relation, or a name.

  The same-role test ("B keeps A's role letter") means nothing when neither side has one.
- **Why keep the bare answer:** it is the most natural reply there is, and it fits every noun blank. A lone lettered noun is a sentence of its own: `zazozon.` is *There is Azozon* ([existence](../grammar/beginner/predication.md#existence)), and `dodozel.` is *Something happened to the dog*. Each one also works as an answer, but only for a blank in its own role.
- **Greetings and conversation-length bids do not change.** They are the same one-citation shape (`SELFn.`).
- **Parser:** the citation leaves the clause units. A new utterance-level fragment rule allows one citation phrase, with no role level, and the resolver ties it to the open blank. Inside a clause body, a bare citation is either a listed word from Part 2 or rejected.

### Part 2: same-role relation citations

A **closed list** of relation roots may stand in a clause as a **citation**: root + ending, with no role letter. Placed between two phrases in the **same role**, it works like a same-role hook:

```text
A CITE B
```

- **B keeps A's role letter.** B is a co-member of A's slot, in the same event.
- **A is the nearest same-role phrase** before the citation, as with the vowel hooks. Both sides carry the same role letter, so a verb pairs with a verb and a noun with a noun.
- **B may be a fill-ask blank.** As with [`hewem blar`](../grammar/beginner/questions.md#fill-ask), the blank comes first in the body together with the word it completes. The fronted `CITE` + blank pair takes A from the **nearest same-role phrase after it**. This is the only place a listed word comes before A.

  > `yel abam zar zazozon vowurol.`
  >
  > "Before whom does Azozon walk?"

  When the blank is A, it is first already, and nothing moves: `yel zar abam zazozon vowurol.` *Who walks before Azozon?* In a statement, A always comes first.
- **Spelling:** the relation word minus its role letter, with the hook's ending (`habam` → `abam`, `hewem` → `ewem`).
- **The ending carries the hook's closed / open meaning**, as in [closed and open endings](../grammar/beginner/hooks.md#closed-and-open-endings).
  - **-l**: B is the whole of it (`abal zahelan` *before Ahelan*, and that is the whole story).
  - **-m**: B may not be the only one (`abam zahelan` *before Ahelan, and maybe others*).
  - As with the vowel hooks, prefer **-m** when unsure. Examples use **-m**.
  - Every listed word takes both endings, with no per-row exceptions. One rule across the list is easier to learn than a list of rows where **-l** is missing. The closed reading is natural on the verb pair too: `erol` is *only while B*.
  - The relation's own **-l** reading does not carry over: the citation `ewel` is *like B, and B alone*, not *exactly like*. Exactly-like stays with [`hewel`](../grammar/intermediate/exactly-like.md).
  - **-n** / **-r** on a listed word have no reading (log as **open**).
- **Same-role only.**
  - At the start of a sentence, a lone listed word is an ordinary one-citation fragment ([Part 1](#part-1-a-citation-answer-is-one-noun-phrase)): `abam.` is the root's abstract, not *before*. It is never discourse glue. Glue stays with the `/x/` linkers and the fronted vowel hooks.
  - A listed word followed by `/b/` is not an extra noun. That job stays with `/h/` / `/ɡ/` + `bl-`.
- **Any other citation in a clause body has no reading.** That includes a listed word without a same-role phrase on each side. The parser rejects it (log as **closed** in unassigned-reserved). This retires the untaught `citationFallback` reading.
- **Shape never collides with hooks.**
  - Vowel hooks are V(V) + ending: two or three letters.
  - A citation is a three- or five-letter root + ending: four letters or more, with a consonant inside.
  - Some -l forms spell a root's ordinary concrete citation (`abal` *backpack*, `alal` *sand*). Inside a clause body that reading no longer exists, so there is no clash. In a fragment, the ordinary reading wins.
- **Storage:** new rows in `lexicon-overlays.csv`, on the existing published row, with a new `pos` value for same-role citations. Each row has its own `gloss`. The overlay table is the closed list.

### Shipped words

Each shipped word is the same-role face of an existing relation. The **clause** form below is today's way to say it, and it stays. Examples use the open **-m**.

| Citation | From | Same-role reading | Example | Today (stays) |
|---|---|---|---|---|
| **`abam`** / **`abal`** | `habam` *before* | A ahead of B, in time or in a moving line, both in the role | `zazozon abam zahelan vowurol.` *Azozon walks before / ahead of Ahelan.* · `zazozon vowurol abam vazuvol.` *Azozon walks before swimming.* | `zazozon vowurol habam blarl zahelan vowurol.` |
| **`alam`** / **`alal`** | `halam` *after* | A after B, in time or in a moving line | `zazozon alam zahelan vowurol.` *Azozon walks after / behind Ahelan.* · `zazozon dedudal alam dogudal …` *tea after coffee* | `halam blarl …`; `hazuhothel` + `/b/` *follow* |
| **`erom`** / **`erol`** | `herom` *during / while* | A and B at the same time | `zazozon vowurol erom vazuvol.` *Azozon walks while swimming.* | `herom blarl zazozon vazuvol` |
| **`ewem`** / **`ewel`** | `hewem` *like* | A, like B: B fills the same role too, as background | `zazozon ewem zahelan vowurol.` *Azozon, like Ahelan (and maybe others), walks.* | no same-role form; `hewem bl…` is manner (*walks like a duck*) |

These four pass every test a same-role word must pass:
- **Same meaning:** the word means what its `/h/` relation means.
- **Co-member:** B really fills A's role in the same event.
- **Need:** the English pattern is common, and today's form repeats a clause or doesn't exist.
- **No clash:** it does not crowd a form that already exists.

### Not shipped
<a id="not-shipped"></a>

| Word | From | Why not |
|---|---|---|
| `ovam` | `thovam` *so that* (`purpose-stance.md`) | **Never.** Purpose is on `/th/`, and the letter is what says the aim is the speaker's. Without it, `zazozon vowurol ovam vezuvel.` reads as a plain statement of Azozon's own aim, the mind-reading the move to `/th/` closes. It also fails the co-member test: the aimed-at act is in the speaker's mind, not in the event. See the `/h/`-only rule in [not on the list](#not-on-the-list). |
| `ahom` | `hahom` *so (result)* | Low need: *runs and so sleeps* is rare, and `xahom` plus a second clause covers it. A light connective would also slip a causal claim between two verbs, where the [causation](../grammar/beginner/causation.md) pages keep causal claims explicit. |
| `arum` | `harum` *until* | Fails the co-member test. In *runs until falling asleep*, B is the point where A stops, a time landmark. It overlaps the ordered ranges and `harum bl-` + a time noun. |
| `anem` | `hanem` *on behalf of* | Fails the co-member test. In *speaks for Alazun*, Alazun does not speak, so B is in the role only notionally. `hanem blalazun` is one word longer, so there is little to gain. |
| `ezem` | `hezem` *despite* | Fails two tests. The meaning shifts from *despite* (an obstacle) to *unlike* (a contrast), so a learner cannot predict it from `hezem`. And *Azozon, unlike Ahelan, walks* shuts B out of the role. If *unlike* is wanted, it needs its own row. |

**Ahead of / behind.** `abam` / `alam` cover order in a moving line as well as order in time. When B moves too, it is a co-member of A's role, not a landmark: `zazozon alam zahelan vowurol.` says Ahelan walks as well. The landmark form `gazuhothel blohehal` *behind the house* places A against a fixed point. The page needs one Compare-with line, and the *follow* recipe in [english.md](../grammar/english.md#motion) gains `alam` as the form for walking behind someone who also walks.

### Not on the list

- **Landmarks.** This covers `hedam` *between*, `hohom` *across*, `hevam` *around*, gravity, and `haham` *origin*, plus the [non-goals](#non-goals) *past*, *opposite*, *beyond*, and *along*.
  - B is a fixed point, not a co-member of A's role. These already have homes: `/h/` + `bl-`, vowel hook + `/b/`, and the viewpoint `th` forms.
  - A citation form (`edam bohehal`) would be a third spelling of `hedam blohehal`. It would break the rule that a listed word followed by `/b/` is never an extra noun. It would also sit next to the short answer `el bohehal.` and bring back the confusion Part 1 removes.
  - *Strictly between* two same-role members is already a range hook.
  - The one same-role spatial case, B moving with A, is covered by `abam` / `alam` above.
  - *Beside / alongside* has no relation row to take a same-role face from (only the vowel hook `em`), so it stays out.
- **Exchange** (`heham`). The counter-item does not fill A's role.
- **As-of, deadline, because** (`henam` / `hunom`, `huvahum`, `thahum`). These are clause-level or time-anchored, with no natural same-role reading.
- **Any `/th/` relation** (`thahum` *because*, `thohem` *if*, `thovam` *so that*). Same-role words come only from `/h/` relations, whose letter says only that the word describes the event. A `/th/` letter says whose view the word gives, so a letterless form would drop its meaning.
  - A lettered option, `thovam` with a bare verb B (`zuwen vowurol thovam vezuvel`), is also out. A `/th/` word before a verb is how a stance such as PLAN attaches, so it would read as a stance on the second verb.
  - *In order to* restates the doer instead (`zuwen vowurol thovam blarl zuwen vezuvel.`), as [so that](../grammar/beginner/dependents.md#so-that) already teaches.
- **Join-relations** (`han`, `huan`, …). Without its role letter, each one is already a vowel hook spelling.

### Overlap with joins

`abam` / `alam` say the same order as the `zaol` *then* join and the planned `aol` *in turn* (`range-series.md`). The second way is kept. The page needs one Compare-with line: the join lists members in order, while `abam` makes B the background.

### Teaching stage

- **Part 2** is a new **intermediate** sitting placed after the [hinges](../grammar/beginner/dependents.md#hinges), so learners already know `habam` / `hewem` / … in their clause jobs.
- **Part 1** goes where fill answers are first taught, at beginner:
  - the one-noun rule and the lone-role answer go on [questions.md](../grammar/beginner/questions.md#fill-ask);
  - the lone `/d/` goes next to [existence](../grammar/beginner/predication.md#existence).
- **Mixed example:** the answer `zazozon ewem zahelan.` uses Part 2, so it appears only in the intermediate sitting.


## Implementation plan

The work runs in **two sessions**, per [proposals.md](../meta/proposals.md). Each session starts from the git log and the **Status** line ([resuming](../meta/proposals.md#resuming)).

| Session | Workstreams | Who edits | Commits |
|---------|-------------|-----------|---------|
| 1 | 0a baseline, 1 fill answers and lone `/d/` | main agent; a fresh checkpoint subagent only if item 1.5 is needed | 1 |
| 2 | 0b baseline, 2 parser and data, 3 teaching, 4 checkpoint, 5 closing | one subagent each for 2, 3, and 4; the main agent does 5 | 2 |
| **Total** | | | **3** |

### Rules for the main agent

- **Sequential.** These shared files take one writer at a time:
  - `src/parse/sentence-parser.ts`, `src/parse/constructions.ts`, and `data/lexicon-overlays.csv`;
  - the sidebar ([`reading-order.ts`](../grammar/.vitepress/lib/reading-order.ts)) and the [allowlist](../meta/drill-generation.md#allowlist);
  - the cheat sheets, `unassigned-reserved.md`, `design-decisions.md`, and `AGENTS.md`.
- **Green between items.** An item is done when its gates pass ([gates](#gates)). A failure goes back to the subagent that made the change (SendMessage), never to a new one.
- **No grammar decisions.** A subagent that needs a form or reading this proposal does not settle reports it. The main agent logs it under [open decisions](#open-decisions), and the item is skipped.
- **Stop and alert** ([proposals.md](../meta/proposals.md#stop-and-alert)) when a finding changes the plan, not just one item. For this proposal, that includes:
  - item 1.1 or 2.2 cannot pass `grammar-check` without a gate or a second tree;
  - a doc example turns out to depend on `citationFallback`;
  - the fronted word + blank pair conflicts with another fill-ask form.

  Workstreams 2–4 build on these items, so skipping one would leave later items building on a broken state.
- **Parser changes ship with their grammar.** Per `AGENTS.md`, a change to what the parser accepts lands in the same commit as the page that teaches it. So workstreams 2, 3, and 4 make **one** commit.
- **Keep the main agent lean.** Read each subagent's report and `git diff --stat`. Open a hunk only when a report flags it, a gate fails, or the stat shows a file outside the workstream's list.
- **One writer for `AGENTS.md`.** Subagents report the Owns-line changes they need, and the main agent applies them in workstream 5.
- **Commits**, per [commits](../meta/proposals.md#commits):

  | Commit | After | Message (first line) |
  |--------|-------|----------------------|
  | 1 | workstream 1 | `same-role relations: 1, fill answers and lone /d/ [skip-cd]` |
  | 2 | workstream 4 | `same-role relations: 2-4, same-role relation words [skip-cd]` |
  | 3 | workstream 5 | `same-role relations: 5, closing [skip-cd]` |

  - Each message ends with a blank line and `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
  - Stage only the workstream's files. Never amend or force-push. Subagents never commit.
  - A commit that has a skipped item names it and its open decision in the body.
  - After each commit, update **Status** with the workstreams done.

### Gates

| When | Run |
|------|-----|
| After any item | `npm run build` and `npm test`. Check every new or changed example with `node scripts/parse.mjs` (several inputs in one call). |
| After any change to `sentence-parser.ts` (rules or `markContext`) | `npm run grammar-check`: no `GATE`, no LR(1) conflict, no doc sentence with two trees |
| After a change to `data/lexicon-overlays.csv` | `npm run english-helper-wordnet` |
| After a change to `src/english-helper/` or a recipe table | `npm run english-helper-recall -- --check` |
| After a cheat-sheet change | `npm run cheat-sheet-blocks -- --write`, then the build. Run `npm run lint:cheat-sheet-print -- --only <id>` if Chromium is installed; otherwise say it was skipped. |
| End of each workstream | All of the above that apply, once more, before the report or the commit |

**Exception during workstream 3:** the build may fail **only** because the new sitting lacks its Practice. The allowlist row stays **generate**, and workstream 4 clears the failure. Any other build failure blocks the item.

### Subagent brief
<a id="subagent-brief"></a>

The first prompt to each subagent holds this brief and its workstream's item list. Later prompts name one item ("Do 2.3").

1. **Read once, at the start:** this proposal's [Design](#design) and [Gates](#gates), plus the rule sections in step 3. Read each page when its first item needs it, not up front.
2. **Edit only** the files your workstream lists, plus the shared files it names.
3. **Follow these rules:**
   - `AGENTS.md`;
   - [present the current language only](../meta/grammar-docs.md#present-the-current-language-only), [teach now; don't preview later](../meta/grammar-docs.md#teach-now-dont-preview-later), [what one sitting holds](../meta/grammar-docs.md#one-sitting), [house cast](../meta/grammar-docs.md#house-cast), [marking Ageben](../meta/grammar-docs.md#marking-ageben), and [retie-safe writing](../meta/grammar-docs.md#retie-safe-writing);
   - [doc-style.md](../meta/doc-style.md) and [glosses.md](../meta/glosses.md);
   - for overlay rows, [lexicon.md](../meta/lexicon.md#moving-an-overlay-to-another-row) and [overlay kinds](../meta/parser-pipeline.md#overlay-kinds).

   Code never spells a root as a string literal; use [`src/closed-roots.ts`](../../src/closed-roots.ts).
4. **No grammar decisions.** If an item needs a form, reading, band, or spelling that the Design does not settle, stop that item and report it. If a finding would change later items (see [stop and alert](#rules-for-the-main-agent)), report it and stop; do not work around it.
5. **Verify each item** with the gates that apply, before reporting it.
6. **Report each item** in fixed fields, a few lines each:
   - what changed, with ids (constructions, overlay rows, headings)
   - files touched, as a count
   - shared-file edits (sidebar, allowlist, cheat sheets, unassigned-reserved, design-decisions)
   - `AGENTS.md` Owns lines to change
   - gate results
   - anything skipped, and why

### Session 1

#### Workstream 0a: baseline (main agent, no edits)

- **Clean tree.** Run `git status`. Workstream 1 edits files under `src/parse/`, and on 2026-11-05 that folder held uncommitted changes from other work (`constructions.ts`, `enforce.ts`, `hook-jobs.ts`, `morph-gloss.ts`, and two tests). If any file workstream 1 edits has changes not made by this proposal, **stop and ask the user** to commit or stash them first.
- **Green baseline.** Run `npm run build`, `npm test`, and `npm run grammar-check`, and record the results.
- **Re-check the Problem.** Parse `zazozon vowurol azozol.`, `azozon ewem ahelan.`, `dodozel.`, and `zazozon dalazun.`, and confirm the Problem items still hold. Drop any that no longer do.

#### Workstream 1: fill answers and lone `/d/` (main agent)

The main agent runs it in its own context: a few pages and one cluster of changes ([one session or several subagents](../meta/proposals.md#one-session-or-several-subagents)).

**May edit:**
- the parser: `src/parse/` (sentence parser, tokens, constructions, enforce, the resolver, morph gloss, `llm-prompt.ts`, and their tests);
- the pages: `docs/grammar/beginner/questions.md`, `fill-ask-jobs.md`, `predication.md`, and `word-endings.md` (only where it describes fill answers);
- the recipe rows on `english.md` / `say-*.md` that show a fill answer;
- `docs/meta/unassigned-reserved.md` and `design-decisions.md`;
- `src/english-helper/cases.tsv`;
- the cheat sheets, by the generator only.

| Item | Work |
|------|------|
| 1.1 | **One-citation fragment.** Move `citation` out of the clause units into an utterance-level fragment rule: one citation phrase (with `/ɡ/` words, so a full name still parses), with no role level. The resolver ties it to the open blank. Keep greetings and conversation-length bids parsing as they do now. |
| 1.2 | **Rejections.** Retire `citationFallback` in clause bodies, and reject bare fragments of more than one phrase. Each gets a new construction. A full name is not rejected. Add **closed** rows to unassigned-reserved.md, and a design-decisions entry whose reason is the [why not drop letters more widely](#part-1-a-citation-answer-is-one-noun-phrase) bullet. |
| 1.3 | **Lone `/d/`.** Give a lone `/d/` the reading *something happened to it*. Let the resolver accept a lone-role sentence (existence for `/z/`, lone `/d/` for `/d/`) as the answer to a blank in the same role. Teach it as a new H3 after *Existence* on predication.md, with a Compare-with line to the rejected `zazozon dalazun.`. Check the [sitting length](../meta/drill-generation.md#sitting-length) cap. |
| 1.4 | **Answer pages.** On questions.md, the fill-answer paragraph says: a bare citation for one noun phrase; for more, a sentence that keeps the blank's letter (`zazozon zahelan zal.`, `dodozel dalazun dal.`). On fill-ask-jobs.md, "as a citation" becomes "as a short answer" wherever the answer keeps a letter. Update any recipe row that shows a fill answer. |
| 1.5 | **Coverage.** If the build's drill-coverage lint flags questions.md or predication.md, a **fresh** subagent adds 1–3 items to that page's existing checkpoint, under [drill-generation](../meta/drill-generation.md#execute). Otherwise skip this item. |

**End:** run the gates, then make commit 1 and update Status to `Workstreams done: 0a, 1`.

### Session 2

#### Workstream 0b: baseline (main agent, no edits)

- Read **Status**, and confirm that workstream 1 is done and committed.
- Run `npm run build`, `npm test`, and `npm run grammar-check`.

#### Workstream 2: parser and data (one subagent)

**May edit:**
- `data/lexicon-overlays.csv`;
- `src/parse/`, `src/closed-roots.ts`, and the WordNet index (regenerated);
- `src/english-helper/` (`cases.tsv`, and the baseline only when the numbers improve);
- `docs/meta/unassigned-reserved.md` and `design-decisions.md`.

| Item | Work |
|------|------|
| 2.1 | **Overlay rows.** Add an **-l** and an **-m** row for each of the four shipped words, on the existing published row, with a new `pos` value for same-role citations. Each row needs a `gloss`, a `definition`, a `mnemonic`, and an `anchor` (the new sitting's ids; agree them with the main agent before workstream 3). Add the classify reading. |
| 2.2 | **Same-role rule.** The listed word is valid only between two phrases with the same role letter, and A is the nearest same-role phrase before it. In a fill-ask, the fronted word + blank pair takes A from the nearest same-role phrase after it. Run `grammar-check` until clean. |
| 2.3 | **Rejections.** A listed word without a same-role phrase on each side, a listed word followed by `/b/`, and **-n** / **-r** on a listed word are each rejected with a construction. Add unassigned-reserved rows: **closed** for the first two, **open** for **-n** / **-r**. A lone listed word as a fragment stays the ordinary citation (item 1.1). |
| 2.4 | **Glosses and helper.** Add morph glosses on the vowel-hook pattern (`before.open`, `like.closed`). Add `reader` notes in `constructions.ts` so `--llm-prompt` explains the form. Add English-helper cases, one per shipped word (*before*, *after*, *while*, *like*). Run `english-helper-recall -- --check`. |

**End:** run the gates and report. **No commit** (see [rules](#rules-for-the-main-agent)).

#### Workstream 3: teaching (one fresh subagent)

**May edit:**
- the new sitting `docs/grammar/intermediate/<file>.md` (suggested `same-role-words.md`; the title is the subagent's to choose under doc-style);
- `reading-order.ts` and the [allowlist](../meta/drill-generation.md#allowlist) (a new **generate** row with a **Setting**);
- Compare-with lines on `hooks.md`, `dependents.md`, `viewpoint.md`, `rank-joins.md`, and `relations.md` if needed;
- `english.md` and `say-*.md`;
- the cheat sheets (generator, plus a marker for the new rows);
- `terminology.md`, if the build requires an entry for the new term.

| Item | Work |
|------|------|
| 3.1 | **Placement.** Use `reading-order.ts` to find the latest page whose forms the sitting uses: every `/h/` relation it draws from, the hinges, `rank-joins.md` for the `zaol` contrast, and `viewpoint.md` for the *behind* contrast. Place the sitting at intermediate after all of them. Report the position. |
| 3.2 | **The sitting.** Teach `A CITE B` and the nearest-phrase rule, the endings (**-l** / **-m**, with `erol` *only while*), each shipped word with a worked example and morph gloss, the fill-ask with the fronted pair, the lone-role answer `zazozon ewem zahelan.`, and *ahead of* / *behind* for a moving B. Stay under the sitting cap; do not add `### Practice`. |
| 3.3 | **Compare-with lines.** <ul><li>On hooks.md *Same role*: the vowel hooks, and the listed words that work the same way.</li><li>On dependents.md hinges: the clause form vs the same-role form.</li><li>On viewpoint.md *landmark facing*: behind the house vs behind someone who also walks.</li><li>On rank-joins.md `zaol`: the join lists members in order; `abam` makes B the background.</li></ul> Each line sits on the **later** page of its pair ([teach now](../meta/grammar-docs.md#teach-now-dont-preview-later)). |
| 3.4 | **Recipes and cheat sheet.** Add recipe rows for *before / after / while / like* when the two share a role, and *follow* → `alam` on [english.md](../grammar/english.md#motion). Then `npm run cheat-sheet-blocks -- --write`. |

**End:** run the gates (with the Practice exception) and report.

#### Workstream 4: checkpoint (one fresh subagent)

A fresh context is required: a checkpoint writer may read only its own sitting ([what you may read](../meta/drill-generation.md#execute)).

- **May edit:** the new sitting's `### Practice`, its allowlist row, and the lexicon `core` cells for the roots it introduces.
- **Item 4.1:** run [drill-generation](../meta/drill-generation.md#execute) on the new sitting.

**End:** the main agent runs every gate. All must be green with no exception. Then make commit 2 and update Status to `Workstreams done: 0a, 1, 0b, 2, 3, 4`.

#### Workstream 5: closing (main agent)

- **`AGENTS.md`:** apply the reported Owns-line changes. The `relations.md` row likely gains *same-role relation words* (`<file>.md`), and `predication.md` gains *lone object*.
- **`TODO.md`:** add one line for the landmark gaps in [non-goals](#non-goals).
- **Settled readings:** confirm each one is on its grammar page and that nothing settled lives only here. Leftover rejections go to design-decisions.md.
- **Delete this proposal**, or move it to `partially-implemented/` if any item was skipped (with its open decision kept).
- Run the build and tests, then make commit 3.

## Open decisions

None at present. The main agent adds anything a subagent reports, and skips the affected item until the user decides.

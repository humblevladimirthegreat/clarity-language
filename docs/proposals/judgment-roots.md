# Judgment roots

**Status:** ready to implement. Nothing implemented yet. All seven [decisions](#decisions) settled by the user on 2026-11-11, each taking the recommended option. Two independent phases, **Phase 1** (lexicon) and **Phase 2** (expectation words, a grammar change); either may run first.

**Related:** [lexicon-published.csv](../../data/lexicon-published.csv), [lexicon-compounds.csv](../../data/lexicon-compounds.csv), [design-decisions.md](../meta/design-decisions.md) (D-16, D-40, D-46), [lexicon.md](../meta/procedures/lexicon.md), [glosses.md](../meta/glosses.md), [label-seams.md](../grammar/beginner/label-seams.md), [say-reasons.md](../grammar/say-reasons.md), [say-people-places.md](../grammar/say-people-places.md), [english.md](../grammar/english.md), [purpose.md](../grammar/purpose.md), [feature-criteria.md](../meta/feature-criteria.md), [`scripts/regloss-docs.ts`](../../scripts/regloss-docs.ts). Phase 2: [lexicon-overlays.csv](../../data/lexicon-overlays.csv), [dependents.md](../grammar/beginner/dependents.md), [already-still-yet.md](../grammar/beginner/already-still-yet.md), [because-and-iff.md](../grammar/intermediate/because-and-iff.md), [contrary-to.md](../grammar/intermediate/contrary-to.md), [residue-and-former.md](../grammar/intermediate/residue-and-former.md), [universality.md](../grammar/advanced/universality.md), [unassigned-reserved.md](../meta/unassigned-reserved.md), [`src/parse/enforce.ts`](../../src/parse/enforce.ts), [`src/parse/constructions.ts`](../../src/parse/constructions.ts), [`src/parse/invalid-forms.test.ts`](../../src/parse/invalid-forms.test.ts).

**Depends on:** none.

**Design authority:** the published senses and aliases of `ulamu` 🤥, `unemu` 🫥, `adomu` 😛, `oruyu` 🏴‍☠️, `uzuyu` 🦹, `anemu` 💢, `enemu` 🤕 and `onumu` 😠; removal of the `ovayu` 👿 row; the mnemonic of the compound `uzuyuya` *gang*; a new design decision D-75. Phase 1 changes no spellings and no parser rules.

Phase 2: ALTHOUGH moves from `/h/` to `/th/` (`thezem`), and `/h/` `hezem` is reread as *whereas* (Decision 5); NOT YET moves from `/h/` to `/th/` (`thelom`, `thelol`, `thelor`), and `/h/` `helo-` is retired (Decision 6); a teaching note on RESIDUE after a harm (Decision 7); a new design decision D-76. Root spellings don't change; only the role letter does.

## Problem

`/th/` holds what is in a mind, and [D-46](../meta/design-decisions.md) keeps another person's mind out of plain statements: *Alazun wants to leave* needs a holder and a channel, because "reading intentions into others is a classic bias, so it needs a channel." [D-16](../meta/design-decisions.md) bans bare evaluatives (*good*, *bad*) because they hide whose need and what bar.

A handful of content roots get around both rules. A verb like *lie* packs four claims into one word:

1. the act: Alazun said X (checkable)
2. a fact: X is false (usually checkable)
3. a mind: Alazun knew X was false and meant you to believe it (inferred)
4. a verdict: Alazun is a liar (a label)

The grammar already handles 4 ([D-40](../meta/design-decisions.md), [label reach](../grammar/beginner/label-seams.md#reach-occasion): `vulamuthul` *lied this once* vs `vulamuthal` *a lying type*) and handles a broken norm with [fault](../grammar/beginner/fault.md#fault) and the say words. Nothing handles 3. So `zalazun vulamul.` (*Alazun lies*) asserts Alazun's knowledge and intent with no warrant, while the weaker *Alazun wanted me to believe X* needs a holder and a channel. Other roots carry a bare verdict on a person (*villain*, *criminal*) that D-16 would reject if it were an adjective.

This is where the psychological goal is most at stake: accusation verbs (*you lied*, *you ignored me*, *you're mocking me*) are the moment a guess about someone's mind hardens into fact ([treating a guess as fact](../grammar/purpose.md#trap-certainty)).

**Phase 2.** Two closed `/h/` words hold an expectation, which is in a mind. MIRATIVE (*against what I expected*) is already `/th/`. But *although* (`hezem`: P would normally have stopped Q) and *not yet* (`helom`: "the change is expected but has not come") are on `/h/`, as if the expectation were part of what happened. So they can't take a holder or MAY. *I failed although I studied* states a theory about effort as a fact about the event. `helol` (*not yet, but it will*) is a forecast, though [intention.md](../grammar/beginner/intention.md#L7) says a forecast always says what it rests on.

## Goals

- A bare content root states only what others could check: an act, a describable kind, or a feeling owned the usual way.
- Someone else's intent, knowledge, want or contempt goes through the existing holder seam and channels, as D-46 already requires for WANT and PLAN.
- A verdict on an act goes through fault, the say words, or an unmet sake; a verdict on a person goes through label reach.
- Every English accusation word still has a recipe, at most one clause longer than today.
- Phase 2: a word whose meaning includes an expectation is `/th/`, so the expectation reads as the speaker's and can take a holder or MAY.

## Non-goals

- **Feeling roots on `/ɡ/` and `/h/` about other people** (`gonumul` *an angry dog*, `huwuyom` *sitting hopefully*). Reading these as visible display is a separate question about every `mind` root in every slot; a later proposal.
- **The `/h/` vs `/th/` letter of TRY, RESIDUE and FORMER.** Settled by D-46. Phase 2 adds only a teaching note on RESIDUE.
- **ALREADY, STILL, NO LONGER.** Each can be watched, so they stay on `/h/`. Their **-l** / **-r** endings carry small forecasts (*for good*, *about to end*); left as they are.
- **Claritish cues for accusation verbs** (*lied*, *ignored*). The journal editor already flags trait labels (*liar*, *manipulative*); verb cues are a follow-up once the recipes exist.
- **Grammar changes in Phase 1.** Every recipe uses forms that already parse.

## Design

### The two tests

A root's concrete sense, abstract sense, `english_by_pos` lemmas and aliases each pass two tests:

- **T1, no hidden mind.** The sense does not state an unstated mental state of someone other than the speaker: intent, knowledge, a want, contempt. A feeling root (*angry*, *afraid*) is not caught: it names the feeling, and whose it is follows the usual owner rules.
- **T2, no bare verdict.** The sense adds more than *it was wrong* or *they are bad* to a describable act or kind. Breaking a named rule passes (the bar is named); *wrong* with no bar does not.

A sense that fails T1 is re-sensed to its observable core. A sense that fails T2 is dropped, and its English routes to a recipe. A row whose every sense fails, with a seed that another row already covers, is removed.

### Findings

From a keyword sweep of the `mind`, `person` and `doing` rows. Unit A completes it across the whole lexicon.

| Root | Seed | Now: concrete / abstract / aliases | Fails | Change |
|------|------|------------------------------------|-------|--------|
| `ulamu` | 🤥 | lie / deception | T1 | Concrete *untruth* (says what isn't so, whatever the speaker believed), `v:misstate`; abstract *misinformation*. [Decision 1](#d1-lie). |
| `unemu` | 🫥 | invisible / neglect; *ignore* | T1 (*ignore*: on purpose), T2 (*neglect*: a duty unmet, bar unnamed) | Abstract *going-unnoticed* (left unseen and unanswered); drop *ignore*. |
| `adomu` | 😛 | tongue-out / mockery ("the stance, not the gesture") | T1 | Abstract *ridicule*, defined as the act others see or hear; contempt is a holder claim. |
| `oruyu` | 🏴‍☠️ | robbery / exploitation; `m.v:exploit` | T2 (*unfair*, bar unnamed) | Abstract *coercion* (getting compliance by a threat); drop `m.v:exploit`; keep `v:rob`. |
| `uzuyu` | 🦹 | scheme / villainy; *criminal*, *plot* | T1 (*scheme*, *plot*: someone else's plan), T2 (*villainy*) | Retitle to *outlaw* / *lawbreaking*. [Decision 2](#d2-outlaw). |
| `ovayu` | 👿 | villain / malice | T1 (*malice*: wanting harm), T2 (*villain*) | Remove the row. [Decision 3](#d3-villain). |
| `anemu` | 💢 | anger / offense; *crime* | T2 (*crime*) | Drop *crime*. Restate *offense* as the offended person's sense of being wronged, a feeling owned like any other. |
| `enemu` | 🤕 | injured / harm; … *abuse* … | T2 (*abuse*) | Drop *abuse*. |
| `onumu` | 😠 | angry / hostility; *hate*, *aggressive* | T2 (*aggressive* is a trait label) | Drop *aggressive*. |
| `umuyu` | 🖕 | middle-finger / contempt | T1 (*contempt*: someone else's stance) | Abstract *defiance* (an open refusal others see); contempt is a holder claim. |
| `ezozu` | 🐍 | snake / treachery ("snake in the grass") | T1 (*treachery*: a hidden plan to betray), T2 | Abstract *ambush* (an attack from hiding), the observable core of the idiom. |
| `ozezu` | 🦂 | scorpion / betrayal ("stings the hand that feeds") | T2 (*betrayal*: a trust broken, bar unnamed) | Abstract *broken promise* (a said promise not kept, as in the scorpion and the frog); the bar is the promise. |
| `ubuda` | 🧈 | butter / flattery ("butter someone up") | T1 (*flattery*: praise not meant, or aimed at a favor) | Abstract *praise* (warm words said about someone); whether meant is a holder claim. |
| `avozu` | 🦊 | fox / cunning ("sly as a fox") | T1 (*cunning*: hidden deceit and plans) | Abstract *resourcefulness* (finding a way round an obstacle). |
| `ehuye` | 🤡 | jest / foolishness; *joke*, *fool* | T2 (*foolishness*, *fool*: a verdict on someone's sense) | Abstract *clowning* (playing the fool for a laugh, as the mnemonic says); drop *fool*; a person-verdict goes through label reach. |
| `umuyumezuyo` (compound) | 🖕 | insult; mnemonic *speech meant to put someone down* | T1 (*meant*: the speaker's intent) | Keep the spelling and *insult*; mnemonic *middle-finger specifying speech is words that, by convention, put someone down*. Follows `umuyu`. |

Kept, both tests pass: `arozu` 🦝 *theft* (consent is a say word others witness), `ebemo` 🫣 *surveillance*, `edema` 😜 *banter*, `ozuyu` 🥷 *stealth*, `ogayu` 👹 *menace* / *threat* (a threat is said), `adayu` 😈 *mischief*.

Compounds touched: `uzuyuya` *gang* keeps its spelling; its mnemonic becomes *people who break the law together* (under Decision 2). `onumuyu` *enemy* and `anemuya` *mob* pass: *enemy* is someone you stand against, a relation others see; *mob* is a crowd swept up in anger, a feeling owned like any other.

Unit A audit: 393 rows checked: all 271 `mind`, `person` and `doing` rows, 59 other published rows and 63 compounds that matched a judgment-keyword sweep (keywords matched by word start; place-name and sport hits like *con*, *sin*, *bad* set aside); 7 rows added (6 roots, 1 compound), 1 open decision (`eguma`). Also judged to pass: feeling roots (`unomu` *disdain*, `ezemo` *smugness*, `ubamo` *embarrassment*, `aremu` *destructiveness*), said or seen acts (`ubuyo` *accusation*, `ayomu` *dismiss*, `azemulezuyo` *gossip*, `abuyo` *apology*), and describable kinds (`ugozu` *scapegoat*, `uhoza` *conformity*, `avayu` *parasitism*, `eyu` *pretense*, `azayu` *mindlessness*).

### Recipes

A new H3 in [say-reasons.md](../grammar/say-reasons.md), after [Deserve, earn, entitled](../grammar/say-reasons.md#deserve): **Lie, ignore, mock, exploit, crime** `{#accusation-words}`. Each row splits the English word into the checkable act plus the inferred mind or verdict, through forms learners already have:

| English | Split |
|---------|-------|
| *lie*, *deceive* | the untruth verb, plus the speaker's knowing through a holder on a channel (*I gather Alazun knew*), or MAY |
| *honest*, *truthful*, *sincere* | *truthful*: no untruth; *sincere*: says what they believe (holder). Replaces the `gulamum gul` row at [say-reasons.md:651](../grammar/say-reasons.md#trait-words) |
| *ignore* | no response (the act) plus *on purpose* through a holder; *neglect* adds the say word that required the attention |
| *mock* | ridicule, plus contempt through a holder |
| *exploit* | an [exchange](../grammar/beginner/relations.md#exchange) plus an unmet fairness sake |
| *crime*, *criminal* | lawbreaking (Decision 2), or the act plus the say word that forbids it, plus [fault](../grammar/beginner/fault.md#fault) |
| *abuse* | harm plus fault plus a habitual restrictor |
| *villain*, *evil person* | label reach (`tha`) on the act, never a root |
| *aggressive* | the act root plus label reach |
| *scheme*, *plot* | someone else's PLAN through a holder ([D-46](../meta/design-decisions.md)) |

Unit D writes every form with `node scripts/parse.mjs` and checks it reads as the row says. The `liar` rows at [say-people-places.md:632-635](../grammar/say-people-places.md#act-nouns) are rewritten under Decision 1.

### The design decision

New row **D-75** in [design-decisions.md](../meta/design-decisions.md) under *By design*:

> No root sense, `english_by_pos` lemma, or alias states an unstated mind of someone other than the speaker (intent, knowledge, a want, contempt), or adds only a verdict (*wrong*, *a bad person*) to a describable act or kind. | A bare verb would assert another person's mind with no warrant, which the holder seam exists to prevent (D-46), and a bare verdict hides its bar (D-16). A feeling root keeps its sense; whose feeling it is follows the owner rules. When a learner needs the English word, add a recipe, not a root. | lexicon.md, say-reasons.md

[lexicon.md](../meta/procedures/lexicon.md) gets one line under *Labels and senses* pointing to D-75. Its example *"villain, not angry face with horns"* changes to another row's label.

### What is lost

- The bare verb no longer separates a lie from a mistake. That is the point: the separation is a claim about a mind, and it costs one clause that says how you know.
- *Villain* and *criminal* have no single word. A person-verdict was never a single word for *bad*, under D-16.

### Against the feature criteria

[Feature criteria](../meta/feature-criteria.md): it targets a common bias (reading intent into others, most of all in conflict); it is easy to use, since the act verb is still one word and the recipe uses forms taught already; it avoids shame, since *I gather you knew* is as easy to say as *you lied* and each fits its situation; and the nudge is targeted at the accusation words, not spread across the lexicon.

### Expectation words (Phase 2) {#expectation-words}

**The rule.** A word whose meaning includes an expectation is `/th/`. An expectation is in a mind; on `/h/` it reads as part of what happened, and it can't take a holder or MAY. MIRATIVE already follows this rule. Purpose moved from `/h/` to `/th/` the same way ([D-64](../meta/design-decisions.md), parser `retiredPurposeHinge`), and that change is the model here.

**ALTHOUGH → `thezem`.** The two clauses already state P and Q; the hinge adds only that P would normally have stopped Q.

- `thezem blarl` + the clause is *although*; `thezem` + a `bl-` noun is *despite*.
- *Even if* stays a two-hinge stack, `thezem thohem blarl`. [`enforce.ts`](../../src/parse/enforce.ts) allows the stack by overlay gloss (`although if`), not by letter, so the check carries over.
- On `/th/` it takes a holder the way PLAN does, through a channel before it. That gives *although, as Alazun saw it*, where the expectation that was overturned is Alazun's. Unit 2A confirms the stack parses before any page teaches it, and logs it under Open decisions if it doesn't.
- `gezem` (the hinge attached to a noun) stays on `/ɡ/`, read as the speaker's expectation, just as `govam` is the speaker's aim (D-64).
- [contrary-to.md](../grammar/intermediate/contrary-to.md) and [`constructions.ts`](../../src/parse/constructions.ts) (`hookStandIn`) say *contrary to an event is `hezem blarl`*. That becomes `thezem blarl`. The split stays: `uom` goes against a stance, the hinge against an event.
- `/h/` `hezem blarl` becomes *whereas*: two facts set side by side, with no expectation ([Decision 5](#d5-whereas)). `hezem` + a `bl-` noun has no reading, since *despite* is `/th/` only.

**NOT YET → `thelom`, `thelol`, `thelor`.** Of the four already / still / not-yet / no-longer words, it is the only one whose basic meaning is an expectation. *Still* and *no longer* can be watched; *not yet* waits on something.

- Its endings become how firmly you expect the change: **-l** *but it will*, **-m** expected, **-r** *may never come*. A forecast on `/th/` can take MAY, a channel or a holder like any other stance.
- `/w/` `welom` stays. `/w/` serves both letters ([universality.md](../grammar/advanced/universality.md)).
- `/h/` `helo-` is retired with a parser rejection, and a closed row goes in unassigned-reserved.md.
- already-still-yet.md teaches the four words as one family; the page now says why one of them sits on `/th/`.
- `th` + `el` collides with no `/th/` overlay (the `/th/` overlays begin `ev`, `ey`, `em`, `eb`, `eh`, `en`, `ew`, `om`, `ag`, `al`, `og`, `ah`, `ov`, `un`, `uw`, `ur` …); Unit 2D confirms it with the parser.

**RESIDUE after a harm (teaching note, letter unchanged).** [Decision 7](#d7-residue). residue-and-former.md gains a **Compare with**:
- After an act that broke a norm, `haram` says only that the outcome is still in effect: the money is still owed, the window still broken.
- That the act *still counts against* the person is fault plus a feeling, and both are yours.

**D-76**, in [design-decisions.md](../meta/design-decisions.md) under *By design*:

> A word whose meaning includes an expectation is `/th/`: MIRATIVE, ALTHOUGH (`thezem`), NOT YET (`thelom`). `/h/` `helo-` and `/h/` `hezem` + a `bl-` noun have no reading (Parser: retired-form rejections like `retiredPurposeHinge`); `/h/` `hezem blarl` is *whereas*, a contrast with no expectation. | An expectation is in a mind. On `/h/` it reads as part of what happened and can't take a holder or MAY, and a *not yet* ending would be a forecast with no grounds. Purpose moved the same way (D-64). ALREADY, STILL and NO LONGER stay `/h/`: each can be watched. `gezem` on a noun stays `/ɡ/`, the speaker's expectation, as `govam` is the speaker's aim. | dependents.md, already-still-yet.md

## Implementation plan

Orchestrated per [proposals.md](../meta/procedures/proposals.md), with subagents. If the user says to stop partway, the orchestrator [consolidates this proposal](../meta/procedures/proposals.md#consolidate) before the session ends. The phases share no files except `design-decisions.md`, so they run in either order, never at the same time.

### Phase 1: lexicon

Decisions 1–4 are settled. The orchestrator saves `npm run verify -- --baseline` before Unit B.

| Unit | Items | Agent | `model` / `effort` | May edit |
|------|-------|-------|--------------------|----------|
| **A** | Audit every row of `lexicon-published.csv` and `lexicon-compounds.csv` against T1 and T2 (concrete, abstract, `english_by_pos`, aliases, mnemonic). Write a script under `tmp/` that prints the `mind`, `person` and `doing` rows plus any row whose senses match a judgment keyword list; read its output, not the CSVs. Add rows to [Findings](#findings) with a recommended change. **Stop and alert** if it finds more than ten new rows or a row that needs a respelling. | `proposal-worker` | `opus` / `high` | this proposal |
| **B** | Apply the Findings table to the two lexicon CSVs; remove the `ovayu` row; rewrite the `uzuyuya` mnemonic; add D-75 and the lexicon.md line and example; update the `v-lie` expectations in [`src/parse/morph-gloss.test.ts`](../../src/parse/morph-gloss.test.ts). `npm test`, then `npm run regloss-docs` (dry run) and report its count. | `proposal-worker` | `opus` / `high` | the two CSVs, `design-decisions.md`, `lexicon.md`, `morph-gloss.test.ts` |
| **regloss** | Orchestrator runs `npm run regloss-docs -- --write` and commits it alone ([fence automated rewrites](../meta/procedures/proposals.md#fence-automated-rewrites)). | orchestrator | n/a | morph lines only |
| **C1** | Beginner pages that use a changed sense: `label-seams.md`, `questions.md`, `intention.md`, and `cheat-sheets/word-shape-clause.md`. Fix the English lines, Practice answers and prose so they match the new sense; keep an example when it still teaches its point, and say *said something untrue* where it said *lied*. | `proposal-worker` | `opus` / `medium` | those four pages |
| **C2** | Intermediate pages and the index: `polar-inventory.md`, `scope-islands.md`, `spans-as-words.md`, `list-verbs.md`, `english.md` rows 328–342, and `docs/meta/claritish-style.md` line 82. Same task as C1. | `proposal-worker` | `opus` / `medium` | those six pages |
| **D** | The [recipe section](#recipes) in `say-reasons.md`, the honest row, and the `liar` rows in `say-people-places.md`. Every form checked with `node scripts/parse.mjs --llm-prompt`. | `proposal-worker` | `opus` / `high` | `say-reasons.md`, `say-people-places.md` |
| **E** | Decision 4: one paragraph in `purpose.md` under [treating a guess as fact](../grammar/purpose.md#trap-certainty), per [orientation-style.md](../meta/orientation-style.md). | `proposal-worker` | `opus` / `high` | `purpose.md` |

Run units in order; C1 and C2 may run in parallel (disjoint files).

**Gates.** The orchestrator saves `npm run verify -- --baseline` before Unit B. Each unit ends with `npm run verify -- --allow-generate`. Final gate: a clean `npm run build` and `npm test`. If the English helper's scores move (aliases feed it), run its check per [english-helper.md](../meta/procedures/english-helper.md) and report.

**Commits**, each `judgment-roots <unit>: … [skip-cd]` plus the co-author line: A, B, regloss, C1, C2, D, E. Seven.

### Rule digest (paste into every brief)

```
Proposal: judgment-roots. Goal: a bare content root states only what others could check.
T1: no sense states an unstated mind of someone else (intent, knowledge, want, contempt).
    Feeling roots are not caught; whose feeling follows the owner rules.
T2: no sense adds only a verdict (wrong, bad person) to a describable act or kind.
    Breaking a named rule passes.
Someone else's mind: holder seam on a channel (holder.md), or MAY. Never a bare verb.
A verdict on an act: fault (fault.md), a say word, or an unmet sake. On a person: label reach (label-seams.md).
No spelling changes. Never hand-spell a root; never bulk-replace. Morph lines come from regloss-docs.
Stage pages never link to say-*.md. Never link to docs/proposals/.
Present the current language only: no "formerly", no old glosses.
Check every Ageben form with: node scripts/parse.mjs --llm-prompt '<sentence>'
Grammar decisions are the user's: log under Open decisions, skip the item, carry on.
Stop and report (do not work around) if: a premise no longer holds; later units would need a
different design; skipping would leave a broken state; too many skips to meet the goals.
Read headings first (grep -n '^#'), then only the ranges you edit.
Scripted edits go in a file under tmp/, never inline.
Verify with: npm run verify -- --allow-generate (--fast inside an item). Read only new error lines.
At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls.
If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a
clean point, leave the tree green, and report: done, left (as steps), files touched.
Report fields: done; files touched (count); registry edits; AGENTS.md lines to change; verify line;
skips with reasons; left; inefficient.
```

### Phase 2: expectation words

Decisions 5–7 are settled. The orchestrator saves `npm run verify -- --baseline` before Unit 2A.

**Parser changes ship with grammar changes** (AGENTS.md), so 2A, 2B and 2C land in one commit, and 2D carries its own pages. Between 2A and 2C, `verify` is expected to show new errors on the pages still being fixed; 2A's report lists them, and that list is the worklist for 2B and 2C.

| Unit | Items | Agent | `model` / `effort` | May edit |
|------|-------|-------|--------------------|----------|
| **2A** | ALTHOUGH data and parser. In `lexicon-overlays.csv`, add the `/th/` `ezem` row (gloss `although`, so the `although if` stack still matches); reread the `/h/` row as *whereas* (gloss `whereas`, definition *WHEREAS clause hinge (contrast; no expectation)*); keep the `/ɡ/` row. Add a retired-form rejection, modeled on `retiredPurposeHinge`, for `hezem` + a `bl-` noun. Update the `constructions.ts` summaries that name `hezem`, and update `invalid-forms.test.ts` (`thezem blarl` becomes valid; fix the `valid:` sides; add the rejection). Add D-76 and a closed row in unassigned-reserved.md, citing it, for `hezem` + a `bl-` noun. Check with the parser that `thezem thohem blarl`, `thezem` + `bl-` noun, and a channel-plus-holder before `thezem` parse. `npm test`, then `verify`; report the new doc errors by file without fixing them. | `proposal-worker` | `opus` / `high` | `lexicon-overlays.csv`, `src/parse/enforce.ts`, `src/parse/constructions.ts`, `src/parse/invalid-forms.test.ts`, the parser's rejection table, `design-decisions.md`, `unassigned-reserved.md` |
| **2B** | ALTHOUGH stage pages: `dependents.md` (the letter sentence at line 59, the hinge table, the *despite* paragraph, Practice), `because-and-iff.md` (*even if*, Practice), `more-hinges.md`, `contrary-to.md`. Teach the `/th/` reading as an expectation you hold; add the holder example only if 2A confirmed it parses. | `proposal-worker` | `opus` / `high` | those four pages |
| **2C** | ALTHOUGH recipe, index and editor pages: `say-reasons.md` rows 15–34, `say-questions.md` line 121, `english.md` rows 123–124, `terminology.md` line 249, the hand rows in `cheat-sheets/linking-clauses.md` and `cheat-sheets/why-allowed.md`, and `docs/meta/procedures/drill-generation.md`. The *whereas* rows point to `/h/` `hezem blarl` (Decision 5). | `proposal-worker` | `opus` / `medium` | those pages |
| **blocks** | Orchestrator commits 2A–2C together, then runs `npm run cheat-sheet-blocks -- --write` and commits that alone. | orchestrator | n/a | generated blocks only |
| **2D** | NOT YET, whole: the `/h/` `elo-` overlay rows become `/th/` (keep `/w/`), a retired-form rejection for `/h/`, tests, the NOT YET clause of D-76, a closed row in unassigned-reserved.md; `already-still-yet.md` (table, the family framing, endings as expectation, Practice); `universality.md` if its list needs it; the `knowing-intending.md` cheat-sheet hand rows, including the stale line 165 that calls PLAN and DECISION `/h/` words; `drill-generation.md`. Then the orchestrator commits, and runs and commits `cheat-sheet-blocks -- --write` on its own. | `proposal-worker` | `opus` / `high` | those files, plus the parser files 2A touched |
| **2E** | Decision 7: the RESIDUE **Compare with** on `residue-and-former.md`. | `proposal-worker` | `opus` / `medium` | `residue-and-former.md` |

**Gates.** `npm run verify -- --allow-generate` after each unit, against the Phase 2 baseline (2A and 2B carry the expected page errors forward). Final gate: a clean `npm run build` and `npm test`.

**Commits**, each `judgment-roots <unit>: … [skip-cd]` plus the co-author line: 2A–2C, blocks, 2D, blocks, 2E. Five.

**Digest lines added for Phase 2** (paste after the Phase 1 digest):

```
Phase 2 rule: a word whose meaning includes an expectation is /th/ (MIRATIVE, ALTHOUGH, NOT YET).
ALREADY, STILL, NO LONGER, RESIDUE, FORMER stay /h/ (D-46). /w/ forms serve both letters; keep them.
Model for the letter move and its parser rejection: D-64 (purpose, retiredPurposeHinge).
Parser changes ship with the grammar edit that teaches them; never one without the other.
Generated cheat-sheet blocks: never by hand; the orchestrator runs cheat-sheet-blocks.
```

## Decisions

All settled by the user on 2026-11-11, each taking the recommended option. Options not taken are in the git history of this file.

### 1. `ulamu` 🤥 means *untruth* {#d1-lie}

Concrete *untruth*, verb lemma *misstate*, abstract *misinformation*. *Lie* is untruth plus how you know they knew. The bare verb is what a learner reaches for in an argument, so it defaults to the claim others can check.

### 2. `uzuyu` 🦹 becomes *outlaw* {#d2-outlaw}

Concrete *outlaw*, abstract *lawbreaking*; *criminal* and *crime* are its aliases; `uzuyuya` *gang* keeps its spelling, with the mnemonic *people who break the law together*. Breaking a named rule passes T2, because the bar is the law.

### 3. Remove `ovayu` 👿 {#d3-villain}

The row goes. 👿 is a near-identical face to 😈 `adayu` *devil* / *mischief* ([which emoji to skip](../meta/procedures/lexicon.md#which-emoji-to-skip)), both its senses fail, and no page uses it.

### 4. A paragraph in `purpose.md` {#d4-purpose}

One paragraph under [treating a guess as fact](../grammar/purpose.md#trap-certainty): accusation words name the act, and what the other person knew or meant is said with how you know it. Unit E writes it.

### 5. `/h/` `hezem` is *whereas* {#d5-whereas}

`/h/` `hezem blarl` is *whereas*: two facts set side by side, with no expectation. ALTHOUGH is `thezem`. *Despite* + a `bl-` noun is `/th/` only, so `hezem` + a `bl-` noun has no reading. A neutral contrast beside the one that carries an expectation means neither reads as the correct default; it mirrors SO-THAT (`/th/`) beside SO-THAT-RESULT (`/h/`).

### 6. NOT YET moves to `/th/` {#d6-not-yet}

`thelom` / `thelol` / `thelor`; `/h/` `helo-` is retired; `/w/` `welom` stays. On `/th/`, the growth-mindset *yet* can take MAY or a holder.

### 7. A RESIDUE note after a harm {#d7-residue}

residue-and-former.md gains a **Compare with**: residue is the outcome still in effect; *it still counts against them* is fault plus a feeling. Unit 2E writes it.

## Open decisions

Agents log new ones here during the run, per [proposals.md](../meta/procedures/proposals.md#what-a-proposal-is).

### `eguma` 🤑 *greed* (Unit A)

**Problem:** `eguma`'s concrete sense is *greed* (abstract *wealth*; aliases *asset*, *wealthy*, *rich*). Greed is a want, and a want felt by the speaker is a feeling, which T1 lets through. But English *greed* also says the want is too much, with no bar named (T2), and said of someone else it is close to a trait label.

**Options:** (a) keep *greed* as a feeling, owned like any other; (b) re-sense the concrete to *money-hunger* (wanting money), so excess goes through the *too* bar ([bars](../grammar/intermediate/bars.md)) and a person-verdict through label reach; (c) re-sense the concrete to *riches*, folding it into *wealth*, and route *greed* to a recipe.

**Recommendation:** (b). It keeps the 🤑 face as a feeling root and moves the verdict to the bar, as T2 asks.

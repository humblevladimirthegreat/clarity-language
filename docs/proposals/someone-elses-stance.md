# Proposal: Someone else's stance in the English helper

**Status:** Ready to implement. D1–D3 accepted as recommended (2026-11-05). Steps done: 1, 2.

Already landed (2026-11-05), the base this builds on:
- `2b9acf28`: holder rows for someone else's want and plan on [say-tense.md](../grammar/say-tense.md) (*Will, want, try, let's*).
- `a5216e1d`: a multi-word cue matches on its first word's lemma (*wanted to* → *want to*).
- `80c27112`: the owner filter (`stanceOwner`, `HOLDER_LINKS` in [detectors.ts](../../src/english-helper/detectors.ts); `byStanceOwner` in [analyze.ts](../../src/english-helper/analyze.ts)).
- `fbbe2594`: plain stance cues, DECISION rows, one job per row.

**Related:** [holder.md](../grammar/intermediate/holder.md#holder), [want.md](../grammar/intermediate/want.md#whose-intention), [intention.md](../grammar/beginner/intention.md), [evidentiality.md](../grammar/intermediate/evidentiality.md) (forecast question, frame), [feelings-permission.md](../grammar/intermediate/feelings-permission.md#speaker-attitude), [pronouns.md](../grammar/beginner/pronouns.md#special-pronouns), [english.md](../grammar/english.md) (MEMORY and PLAN on a question), [say-tense.md](../grammar/say-tense.md#will-want), [say-reasons.md](../grammar/say-reasons.md), [english-helper.md](../meta/english-helper.md), [`src/english-helper/`](../../src/english-helper/) (`analyze.ts`, `detectors.ts`, `verify.ts`, `cases.tsv`), [`src/parse/constructions.ts`](../../src/parse/constructions.ts) (`reader` notes).
**Depends on:** none.
**Design authority:** none for steps 1–4 (tool code and recipe rows that restate taught forms). Steps 5–6 carry out D1–D3, and each one changes a reading:
- **D1:** a bare WANT, PLAN or DECISION in a question asks for the listener's.
- **D2:** *we* with a stance is your own stance about the group, and a shared one takes the interlocutors as holder.
- **D3:** a speaker attitude stays the speaker's after a holder.

Once implemented, the grammar pages and [english-helper.md](../meta/english-helper.md) own the result and this file is deleted.

## Problem

The owner filter reaches only WANT, PLAN and DECISION. The holder page teaches much more that the helper never points to:

1. **Belief, feeling, motive and perception get no holder.** [holder.md](../grammar/intermediate/holder.md#holder) teaches *Azozon thinks*, *Alazun is anxious*, *Azozon talks to feel connected*, *Azozon resents Alazun* and *Azozon is watching Alazun leave*. The helper offers a root for *think* or the feeling word, with no holder, so a translator writes the someone-else stance as a fact. That is exactly what the holder exists to prevent.
2. **The holder form is a pattern, not a word.** The rows spell the holder with *Azozon* standing in (`thebamazozon thalom`). For *Alazun wants to walk*, the translator must rebuild `thebamalazun` by hand. In the worklist this is *link without form*.
3. **The helper always offers both ways of knowing.** When the English says how the speaker knows (*apparently*, *seems*, *I gather*), it could lead with the matching holder word, the way `SAKE_ENDINGS` picks a sake ending.
4. **`--verify` misses a missing holder.** A draft with a bare `thalom` for *Azozon wants to walk* passes.
5. **Three readings are undecided:** a stance in a question (D1), a stance with *we* (D2), and someone else's *hope* (D3). Each leaves the helper guessing.

## Goals

1. Every stance the holder page teaches reaches the holder when someone else owns it, and only then.
2. The prompt spells the holder word with the sentence's own subject when it can.
3. The holder word leads with the way of knowing the English names.
4. `--verify` flags a bare stance when someone else owns it.
5. D1–D3 are settled on their grammar pages, and the helper follows them.

## Non-goals

- **No new forms.** Every row restates a taught form. A missing form is logged as a grammar gap with the `find-english.mjs` phrases tried ([english-helper.md](../meta/english-helper.md)).
- **No parser change.** D1–D3 add readings to forms that already parse (each example below parses today). Only the `reader` notes and pages change.
- **No subject parsing beyond the word before the stance.** Relative clauses (*the man who left wants…*) stay *unknown owner*, which keeps both rows: the behavior before the filter.

## Design

### A. More stances on the owner filter

Recipe rows in twin pairs, as for WANT. The own row says the bare stance; the holder row links `holder.md#holder` and spells the same stance word after the holder, so `byStanceOwner` drops the right one. Each row restates its page:

| English (someone else) | Holder row form | Taught on |
|---|---|---|
| *thinks*, *believes* | holder alone on the clause: `zalazun theyomazozon vudurul.` | [holder](../grammar/intermediate/holder.md#holder) |
| *is sure* | holder + certainty: `theyomazozon thrawal` | holder table (*everything else is the holder's*) and [stance numbers](../grammar/say-reasons.md) |
| *suspects*, *thinks maybe* | holder + MAY: `theyomazozon thomam` | holder table (MAY is the holder's) |
| *expects* | holder + forecast: `thebamazozon blral` | [holder](../grammar/intermediate/holder.md#holder) (*I hear Azozon expects it*) |
| *does X to feel Y* (motive) | motive + holder: `thawethom theyomazozon` | [holder](../grammar/intermediate/holder.md#holder) |
| *is watching* | holder + LIVE: `theyomazozon thugem` | [holder](../grammar/intermediate/holder.md#holder) |

*thinks* has no stance word of its own, so the own row and the holder row share nothing to drop. For the speaker, *I think* is a plain claim or MAY (`thomam`, [say-reasons.md](../grammar/say-reasons.md)), so the twin test is extended: a holder row whose form is the holder alone drops for the speaker, and the own row says *I think* → plain claim or MAY.

Each row is added only after `find-english.mjs` confirms the page teaches it. *doubts* is listed only if a page teaches it; otherwise it is logged as a gap.

### B. Feelings: a detector, not rows

Feeling words are an open class (*anxious*, *happy*, *upset*), so rows cannot list them. When a slot's suggestions link a feeling section ([feeling with no object](../grammar/intermediate/feelings-permission.md#feeling-no-object), [emotion compose](../grammar/intermediate/feelings-permission.md#emotion-compose), or a sake) and the owner is someone else, the analyzer adds one detector hit: *someone else's feeling: a holder after the feeling word* (`thuwathuruer theyomalazun`). Its links come from a new `FEELING_LINKS` list in `detectors.ts`, covered by the anchor test.

The owner of an adjective is the subject before the copula, so `OWNER_SKIP` also skips a copula (*Alazun is anxious*, *Alazun seems upset*). *seems* is also a CLUES cue for C2.

### C. The holder word, spelled

1. **The holder from the subject.** A step after `spellReaches`, `spellHolders`, rewrites each holder row's form with the sentence's owner:
   - a name: the name's root + **-n** (`thebamalazun thalom`)
   - *he* / *she* / *they*: **-r** on the last name before it in the sentence (`theyomazozor`, [holder](../grammar/intermediate/holder.md#holder)); with no earlier name, the pattern stays
   - *you*: `awan`; inclusive *we*: `ayan` (D2)
   - a common noun (*the teacher*): its root on **-l** when it has one; otherwise the pattern stays

   The spelled form becomes the row's `phrase`, as hooks do now, so `cases.tsv` can pin it with `form:` only for closed words (`awan`, `ayan`). Name cases pin a link and a `shape:`.
2. **The way of knowing from the English.** A table, `HOLDER_CHANNELS`, beside `SAKE_ENDINGS`:

   | English | Leads with |
   |---|---|
   | *apparently*, *they say*, *I hear*, *I heard*, *reportedly* | REPORTED `thebam…` |
   | *seems*, *looks like*, *I gather*, *it sounds like*, *must be* (inferring) | CLUES `theyom…` |
   | *maybe*, *perhaps*, *might* | MAY `thomam…` |
   | *rumor has it* | REPORTED weak `thebar…` |

   With no cue, both stay, CLUES first. *I gather* is the safer default because it claims less than hearsay.

### D. `--verify`: a missing holder

`verify.ts` gets one check: when the English owner is someone else and the draft has a WANT, PLAN, DECISION or feeling word in a clause with no seam word, it flags *someone else's stance needs a holder*. Planted-error tests in `verify.ts`'s suite pin it.

### E. Speaker-only rows

*hopefully*, *if only*, *I wish* are the speaker's by definition ([speaker attitude](../grammar/intermediate/feelings-permission.md#speaker-attitude)). They get a `SPEAKER_ONLY` mark by link. When the owner is someone else (*Azozon hopes*, *Azozon wishes*), the analyzer drops them and offers the D3 form instead.

### F. Questions and *we* (after D1 and D2)

- **D1:** in a question, *you* as owner counts as the speaker does: the holder row drops. A third-person owner in a question keeps the holder row, with the note *asks what the listener can tell*.
- **D2:** *we* leads with the bare stance, with `zayan` as subject, and keeps the holder row spelled with `ayan`, noted *if you claim the listener shares it*.

These change two pinned cases (*Do you want to sing?*, *Do you really want to sing?*), which move from `link:want.md#whose-intention` to `not:`.

## Recommendations for the decisions

### D1. A stance in a question asks for the listener's

**Recommend:** in a question, a bare WANT, PLAN or DECISION asks about the **listener's** stance, with no holder.

> `yel zawan thalom vowurol.`
>
> "Do you want to walk?"

A holder in a question asks how the listener knows that person's mind, as a channel in a question already does:

> `yel zazozon theyomazozon thalom vowurol.`
>
> "Can you tell whether Azozon wants to walk?"

**Why:**
- **It is already the rule next door.** *A channel in a question asks about the listener's grounds* ([evidentiality](../grammar/intermediate/evidentiality.md), forecast question and frame). [english.md](../grammar/english.md) already puts MEMORY on a question for *where was it again?* and PLAN on a question for *what shall we do?*. Both ask the listener's mind. D1 makes WANT, PLAN and DECISION match.
- **The holder says how *you* know.** In a question you don't know; you are asking. `yel … theyomawan thalom …` would say *I gather you want to walk, do you?*: a check that offers a guess, which is a different act. It stays available for exactly that.
- **It is the most common question about a stance.** Requiring a holder there would make *Do you want…?* the hardest way to ask.
- **A rhetorical question stays yours.** `yal yel` is your claim ([stacked acts](../grammar/intermediate/speech-acts.md#stacked-acts)), so its stance is the speaker's.

**Rejected:** requiring the listener as holder in every stance question. It puts a guess about the listener's mind into an honest question.

**Lands on:** a paragraph and one example in [want.md](../grammar/intermediate/want.md#whose-intention) (*In a question*), a line in [intention.md](../grammar/beginner/intention.md) for PLAN, the matching `reader` note in `constructions.ts`, and a row on [say-questions.md](../grammar/say-questions.md).

### D2. *we* with a stance

**Recommend:**
- **By default, *we want* is your own want about the group.** Inclusive *we* is the subject: `zayan thalom vowurol.` *I want us to walk.* This needs no new reading: WANT alone is yours, and its subject is who should do the thing. It matches *what shall we do?* = `yel var zayan thagom.` on [english.md](../grammar/english.md).
- **A want you claim the listener shares takes the interlocutors as holder:** `zayan theyomayan thalom vowurol.` *I gather we both want to walk.* The holder page already has this holder on MEMORY (`thevumayan`, *a view you both share*). D2 extends it to WANT, PLAN and DECISION.
- **Exclusive *we* (I and my people)** is your own stance with the group as subject: `zuwenx thalom vowurol.` *I want us (my people) to walk.* For the others' wants, name them as holder (`theyomazozonx`, *Azozon and co.*). **`uwen` never goes in a seam.** Your own view needs no holder, and the holder page keeps pronouns yours. Log `the…uwen` as **closed** in [unassigned-reserved.md](../meta/unassigned-reserved.md), with the reason in [design-decisions.md](../meta/design-decisions.md).

**Why:** the language's line is that you state only your own mind and report others' with how you know. *We want* in English blurs the two. The default says only what the speaker can know. The interlocutor holder is there when sharing is the point, and it still says how you know.

**Rejected:**
- **Reading *we want* as a joint want with no holder.** It claims the listener's mind as fact.
- **A new *we*-stance form.** The holder already covers it.

**Lands on:** a paragraph in [want.md](../grammar/intermediate/want.md#whose-intention), a sentence on [holder.md](../grammar/intermediate/holder.md#holder) where `thevumayan` is taught (the interlocutor holder works on any host), and a *we want* row on [say-tense.md](../grammar/say-tense.md#will-want).

### D3. Someone else's hope

**The tension:** [speaker attitude](../grammar/intermediate/feelings-permission.md#speaker-attitude) says *hopefully* is *always the speaker's attitude, never the subject's*. The [holder](../grammar/intermediate/holder.md#holder) table says everything in the clause after a holder is the holder's. The holder page also says *pronouns and speech moves stay yours*, but speaker attitudes are not listed either way.

**Recommend:** speaker attitudes stay the speaker's even after a holder, like pronouns and speech moves. *Azozon hopes Alazun walks* is holder + WANT:

> `zalazun theyomazozon thalom vowurol.`
>
> "I gather Azozon hopes Alazun walks."

**Why:**
- **It keeps the attitude page's *always* true.** One reading per word, with no exception to learn.
- **An attitude comments on the whole claim**, the way a speech move does. A holder's mind is content inside the claim.
- **Hope is a want.** The uncertainty English *hope* adds is already there: a holder clause never asserts the event.
- **`theyomazozon thuwuyom …` stays clear.** It reads *I gather Azozon thinks…, and hopefully…*: your hope about their view.

**Rejected:** reading an attitude after a holder as the holder's. It would make `thuwuyom` mean two things depending on what came earlier in the clause.

**Lands on:** *pronouns, speech moves and speaker attitudes stay yours* on [holder.md](../grammar/intermediate/holder.md#holder), a *Compare with* on [speaker attitude](../grammar/intermediate/feelings-permission.md#speaker-attitude) pointing *Azozon hopes* to holder + WANT, and a row on [say-tense.md](../grammar/say-tense.md#will-want).

## Implementation plan

Run in the **main session**. The steps share one small set of files (`analyze.ts`, `detectors.ts`, `verify.ts`, `cases.tsv`, two recipe pages), so subagents would pay cold starts for no gain.

**Gates for every step:**
- `npm test`
- `npm run english-helper-recall -- --check`, then `-- --write-baseline` when numbers improve
- `npm run build` when the step touches `docs/grammar/`
- new lines in `cases.tsv` (never wild or checkpoint sentences)

**Doc edits** are exact single-row edits with Edit, checked with `git diff --stat` before anything runs. Never a scripted search-and-replace across a section.

| Step | What | Files | Waits on |
|---|---|---|---|
| 1 | **A.** Belief, motive and perception rows. Extend the twin test for a holder-only row. | `say-reasons.md`, `say-tense.md`, `analyze.ts`, `cases.tsv` | — |
| 2 | **B.** Feeling detector and copula skip. | `detectors.ts`, `analyze.ts`, `cases.tsv` | — |
| 3 | **C.** `spellHolders` and `HOLDER_CHANNELS`. | `analyze.ts`, `detectors.ts`, `cases.tsv` | — |
| 4 | **D.** `--verify` missing-holder check. | `verify.ts`, its tests | — |
| 5 | **D1–D3 on the grammar pages:** the paragraphs, rows and `reader` notes above, plus `unassigned-reserved.md` and `design-decisions.md` for the closed `…uwen` seam. | `want.md`, `intention.md`, `holder.md`, `feelings-permission.md`, `say-tense.md`, `say-questions.md`, `constructions.ts`, meta notes | D1–D3 |
| 6 | **E** and **F.** Speaker-only rows, question and *we* owners, and the two re-pinned cases. | `analyze.ts`, `detectors.ts`, `cases.tsv` | step 5 |
| 7 | **Close.** Mark *Next round* item 2 done in [english-helper.md](../meta/english-helper.md), log any gaps from step 1, and delete this file. | `english-helper.md`, `TODO.md` | all |

**Stop and alert** ([proposals](../meta/proposals.md#stop-and-alert)) if:
- step 1 finds that the holder page no longer teaches a row's form
- the recall check fails on a quality metric the step cannot fix within its own files
- a D1–D3 edit needs a parser change after all

**Commits:** one per step, seven in all. The user authorized per-step commits for this work (2026-11-05). Message: `someone-elses-stance: step N, <what> [skip-cd]` plus the co-author line. Stage only that step's files.

## Open decisions

- **D1:** stance in a question asks for the listener's. Recommended: yes ([D1](#d1-a-stance-in-a-question-asks-for-the-listeners)).
- **D2:** *we* + stance is your own stance about the group; shared takes `…ayan`; `uwen` never in a seam. Recommended: yes ([D2](#d2-we-with-a-stance)).
- **D3:** speaker attitudes stay yours after a holder; *X hopes* is holder + WANT. Recommended: yes ([D3](#d3-someone-elses-hope)).

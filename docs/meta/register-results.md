# Register results

Editors only — not linked from grammar pages. Findings from translating the register samples ([register-samples](register-samples.md)) for Phase 2b of the expressiveness review (`docs/proposals/expressiveness-review.md`, where the translations live). Each row is a point where the translator had to stop, paraphrase heavily, or settle for an approximation. Rows cite `RS-n.m`.

Progress: RS-1 translated. G-01–G-03 turned out to have taught routes (marked covered). G-04–G-06 and L-01–L-04 are open (awaiting a ruling).

Fields follow [syntax-test-results](syntax-test-results.md): **Verdict** is **awkward** · **missing** · **by design?** (needs a ruling). **Priority** is **P1** common everyday English · **P2** common in writing · **P3** niche. `G-nn` is a grammar gap and `L-nn` is lexicon only.

## Grammar gaps

| ID | RS | English job | Current route | Verdict | Owning page | Proposal | Priority |
|----|----|-------------|---------------|---------|-------------|----------|----------|
| G-01 | 1.2c | *late* against an agreed time (*sorry I'm late*) | Not a gap. *Later than typical* is `zahen zel bral` (comparatives.md § benchmarks), which is the wrong bar here. An agreed time is a plan, so *late* is *after the planned arrival*: `zamegun thodum vevahal hulam barl zohan thumam vevahal`. Both `hulam barl` and PLAN are taught. My first pass used `zugen zel bral` (*too late for some sake*) because I missed this. | covered | dependents.md, intention.md | Optional recipe in say-amounts.md (*late* / *early* against a plan). | P1 |
| G-02 | 1.3b | *the same X as last time* (a previous occasion as the comparee) | Not a gap. Count the occasions from the end: the previous one is *2nd from the end* (`gruedul`, numbers.md § from the end). `yol zaxuvudel gogal bazaxuvudel gruedul` is *is the driver the same as the penultimate driver?*, and reads as *last time* whenever this ride is the latest. A dated resume (`-r`) or a `hulam` / `habum` clause would also work but says more than the English does. | covered | numbers.md | Optional recipe: *last time* = the penultimate item. | P1 |
| G-03 | 1.4c | *anyway* (drop the digression and return to the point) | Not a gap. A sentence-initial resume hook `or …` is *Anyway, …* (hooks.md § Point back). My first pass used `xevavel` because I missed it. | covered | hooks.md | None; listed in english.md only if a learner-facing entry is wanted. | P2 |
| G-04 | 1.5b | *so,* opening a question turn | A linker cannot precede the act word: `xevavel yom …` does not parse. Route: the act word first, then the linker (`yom xevavel …`). | awkward | dependents.md (sentence linkers), speech-moves.md | Teach that in a question the linker follows the act word, or let the linker come first. | P2 |
| G-05 | 1.7b | *should have* / *ought to have* (an obligation that was not met, said afterwards) | The ought is `thugethem` (`the` on the unspecified-sake root, sakes.md § prescription), which the doc defines as **deontic force, not a report that the act is happening**. It has no tense. `thunom` before it does parse (`zehodon thunom vezebel thugethem`), but no page says that a channel dates the ought, and WITNESSED says *I observed it*, which an ought cannot be. So that stack is a guess, not a route. Other routes checked: `themehom` (*required by a person*) has the same problem; `thovem` (NOTIONAL) with `thonathel` says *imagine it served*, not *it was owed*; `vuhum` (*wish*) says *I wish you had* but drops the obligation and can't take `thunom` inside without claiming the telling happened. Safe route: two sentences, *you did not say* (`zehodon thunom vezebel vul.`) then *saying ought to happen* (`zehodon thugethem vezebel.`), which loses that the ought belonged to the past. | awkward | sakes.md (prescription), knowing.md (channels) | Rule that an evidential on a prescription clause dates the scene the ought was about (`zehodon thunom vezebel thugethem` = *you should have said*), taught in sakes.md and listed in say-reasons.md. Alternative: leave it to the two-sentence route as a recipe. | P1 |
| G-06 | 1.11b | *by the way* in front of a question | An aside must keep the outer sentence's speech act, and it packages a clause as a stance word, so a bare *by the way* with no clause inside cannot open a question. Route: `yol xevavel …`, which gives *so, …* rather than *by the way*. | awkward | spans.md (asides), say-questions.md | A `th(` … `)` aside on a question with the same act inside, or a *by the way* linker. | P1 |

## Lexicon

| ID | RS | Word | Resolution | Status |
|----|----|------|------------|--------|
| L-01 | 1.7c | *bakery* / *shop* | Stand-in `zahazal gebewel` (*house*, *bread*). No published shop root, and the compound with *bread* is not conventional. | open |
| L-02 | 1.7c | *corner* (*around the corner*) | Stand-in *nearby* (`om bamegun`). No root for *corner*, and `hegozem` (*around*) circles a landmark. | open |
| L-03 | 1.9b, 1.10c | *pay* / *treat* (someone to something) | Stand-in `vamol` (*money* as a verb) with a plan. The exchange relation `hogem` would say *for* a swap, but no published verb says *pay*. | open |
| L-04 | 1.11b, 1.13 | *job* / *employ* (*to have you* as staff) | Stand-in `bebevel` (*briefcase*, abstract *business*). *To have you* is said as the condition *if you*, so *have* is lost. | open |

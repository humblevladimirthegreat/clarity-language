# Tags for someone, pseudonyms, and logic

**Status:** PROPOSED. User decisions, 2026-11-10: keep `eyen`; retire `umen`; tag **-n** becomes a pseudonym (a real, specific referent whose name is withheld), replacing named recall; `zwan` and `zwal` share the four tag letters and overwrite each other, except that a bound tag shadows (below); a tag on an every / no fence is a bound variable; pair forms bind; a quantified phrase never takes `zwan`; open every-kind `zuam` + tag is allowed (a default rule with exceptions); a pseudonym names a person only; `zwaon` recalls two pseudonyms; bare `zwan` never overwrites an **-l** holder, even one restored after a bound A expires; scope is reach, which starts at the quantified phrase, tagged or not, so reordering roles chooses scope; a tag on a not-every fence is rejected. Workstreams done: W1, W2, W3 (W1 and W2 each also rewrote the Practice item W5 listed: beginner pronouns `umen`, tag-page named recall).

**Related:** [pronouns.md](../grammar/beginner/pronouns.md#special-pronouns), [tag-pronouns.md](../grammar/intermediate/tag-pronouns.md), [universals-domains.md](../grammar/intermediate/universals-domains.md), [joins.md](../grammar/beginner/joins.md#unspecified-member-r-phrase), [causation.md](../grammar/beginner/causation.md#if), [predication.md](../grammar/beginner/predication.md#identity), [unassigned-reserved.md](../meta/unassigned-reserved.md), [design-decisions.md](../meta/design-decisions.md), [glosses.md](../meta/glosses.md), [grammar-docs.md](../meta/grammar-docs.md), [`src/parse/constructions.ts`](../../src/parse/constructions.ts), [`src/parse/enforce.ts`](../../src/parse/enforce.ts), [`src/parse/invalid-forms.test.ts`](../../src/parse/invalid-forms.test.ts), [`src/closed-roots.ts`](../../src/closed-roots.ts).

**Depends on:** none.

**Design authority:** retires the special pronoun `umen`; changes the reading of tag **-n** (`zwan`) from named recall to pseudonym; adds phrase + tag **-n** as an assignment; makes the relative order of quantified phrases in a sentence set their scope (an exception to *moving a word does not change the meaning*); gives a tag on a `zual` / `zuam` / `zul` fence a bound, one-at-a-time reading with its own reach; adds the rejections listed under [Rejections](#rejections).

## Problem

1. **`umen` overlaps two forms that say more.** Beginner `zeyel zar` already says *some person (unknown who)* ([unspecified member](../grammar/beginner/joins.md#unspecified-member-r-phrase)), and a bare `zwal` says *someone; call them A*. `umen` adds a third *someone* that commits to nothing either of those does not, and it costs a closed-root slot, two parser rejections (`nonspecificPlural`, `topicNonspecific`), and an unassigned-reserved row.
2. **Named recall (`zwan`) carries little.** It picks the same referent as `zwar` and only adds the claim that A is a name. Meanwhile there is no way to say *a real person, call her A*, as opposed to a hypothetical A in *suppose A tells O*. That split (real but anonymous vs hypothetical) matters for privacy, case studies, and telling a true story about someone without naming them.
3. **Tags are nearly logic variables, but they cannot be bound.** They are assigned explicitly, they hold across sentences, and they never fall back. A bare `zwal` already acts as an existential. But a tag after a join names the whole group, so `zual gogozel zwal` is *all the cats, call them A* and not *for each cat x*. Universals reach only through the [resume after `blarl`](../grammar/intermediate/universals-domains.md#universals-domains-generics) rule, which cannot tell two variables of the same kind apart.

## Goals

- Retire `umen`; *someone* is `zeyel zar` (no return planned) or `zwal` (you will return).
- `zwan` names a real, specific person whose name is withheld, and acts like a name from then on.
- Scope is visible: a quantified phrase covers what comes after it, and moving role-marked phrases chooses which covers which.
- A tag on an every / no fence is a bound variable with a clear reach, so first-order claims (∀, ∃, ¬, →, =) can be said with tags and existing joins, hinges, and identity.
- Every new rejection has a parser rule, a test, an unassigned-reserved row, and a design-decisions entry when the reason is more than *no reading yet*.

## Non-goals

- No change to `eyen` (the generic pronoun). A generic is a default with exceptions, not a quantified variable ([people in general](../grammar/intermediate/universals-domains.md#generic-neighbors)).
- No new tag vowels. Four tags (plus pairs) stay the limit on live variables.
- No formal-logic notation page. Logic is taught as a use of tags, not as a separate system.
- No change to role pointers, whole-stem resume, or `zuan` (the kind itself). A tag on `zuan gogozel` names the kind, as any assignment.

## Design

### Someone without `umen`

| Want | Form | Says |
|------|------|------|
| *someone*, no return planned | `zeyel zar` | some person, unknown or unsaid who |
| *something / someone* | `zar` | some member, unsaid |
| *someone; call them A* | `zwal` | a new referent, may be hypothetical |
| *a real person; call them A* | `zeyel zwan` / `zwan` | a specific person, name withheld ([pseudonym](#pseudonym-zwan)) |

`ume` stays a closed root for `umel` *neutral*. Its **-n** form becomes unassigned, closed by this decision. Every doc use of `umen` / `zumen` moves to `zeyel zar` (or `zwal` where the example resumes the person with a tag). Beginner Practice that drills `umen` is rewritten in W4.

### Pseudonym (`zwan`)

Tag **-n** is a name for a specific person whose real name is not said. A name means the same one every time, so `zwan` needs no separate assign and recall steps:

- **People only.** A pseudonym names a person. For a company, a town, or a dog, assign with `zwal`. Phrase + `zwan` takes a person phrase (`zeyel`, a kin or role noun). W2 checks whether the parser has a person class it can test. If it does not, this is a teaching rule with no parser rejection, and W2 logs that in its report.
- **Bare, A free.** `zwan` with A unassigned (or after a bound A has expired with nothing under it) introduces a specific person and calls them A.
- **After a phrase.** Phrase + `zwan` in the same role assigns A to a specific person that phrase names: `zeyel zwan` *a person, call her A (a real one)*. This overwrites any holder of A, as `zwal` does.
- **Recall.** While A is held by a `zwan`, a later `zwan` recalls it. `zwar` recalls it too (whole-stem resume); `zwan` restates that the person is specific.
- **Overwrite.** `zwal` and phrase + `zwan` both take A over from anyone. Only the bare forms differ: bare `zwal` brings in someone new and takes A; bare `zwan` while A is held by a **-l** assignment is not a sentence ([Rejections](#rejections)), so a listener never mistakes it for a recall. This includes an **-l** holder that A has gone back to after a bound A expired: bare `zwan` never overwrites, whatever the history.
- **Pairs.** `zwaon` recalls A and O together when both are held by `zwan`, as any pair form recalls its two tags.
- **Placeholder vs pseudonym.** Bare `zwal` claims no specific referent (*suppose A tells O*). `zwan` claims one (*a friend, call her A*). That is the logic split between a variable and a constant.
- **-x and -m.** `zwanx` is *A and associates*. A share on a pseudonym is `zwam`, as now.

> `zeyel zwan vowurol. zwan dodozel vayebel.`
>
> [z-person | z-tag.A.name] | v-walk . z-tag.A.name | d-dog | v-see
>
> "A person (call her A) walks. A sees a dog."

The gloss label (`tag.A.name` above) is settled in W2 against [glosses.md](../meta/glosses.md).

### Scope by order

A quantified phrase reaches from where it stands to the end of its sentence, plus every sentence a stand-in in that stretch points to. Anything later in that stretch is inside it. The quantified phrases are a `zual` / `zuam` / `zul` fence and a plain phrase that brings in a new member (*a cat*, the ∃ of logic). This holds whether or not the phrase carries a tag. A tag only lets you point back.

Role letters let phrases move, so **reordering roles is how you choose scope**. The default order puts the subject's phrase widest, which is the everyday English reading.

> `zual godozel dogozel vayebel.`
>
> [z-everything | g-dog] | d-cat | v-see
>
> "Every dog sees a cat." (∀x ∃y; each dog may see a different cat)

> `dogozel zual godozel vayebel.`
>
> d-cat | [z-everything | g-dog] | v-see
>
> "There is a cat that every dog sees." (∃y ∀x; one cat)

- **Who did what never changes.** Moving a word still keeps every role. What changes is only which of two quantified phrases covers the other. A clause with at most one quantified phrase reads the same in any order.
- **Across a period.** A phrase in an earlier sentence covers the later one. That is the same rule.
- **Negation already fits.** `vul` after the verb sits inside every quantified phrase before it: `zual gogozel vezuvel vul.` is *each cat, one by one, does not sleep* (the existing [not every](../grammar/intermediate/universals-domains.md#not-every) table). A `zul` that closes a fence denies only that fence.
- **Why earlier is wider.** A join's reach runs back from the join, so a later join is the outer one. A quantifier's reach runs forward, as a span's opener holds what follows it, because a tag must be assigned before it is recalled.
- **Why not islands.** A [scope island](../grammar/intermediate/scope-islands.md#scope-islands) narrows a binder to one chunk and never nests. Quantifier scope needs a reach over the rest of the sentence, nested to any depth. Islands stay as they are.

**Placement.** The rule is taught where `zual` is: beginner [joins](../grammar/beginner/joins.md), in `### Everything (ua)`, with the example pair above. [clause.md](../grammar/beginner/clause.md) (under *Direct object*) says that moving a word changes nothing. That sentence narrows to *who did what*, with no forward link: a beginner reading that page has not met quantifiers yet. The bound-tag H3 links back to the joins section.

### Bound tags

A tag right after a `zual` / `zuam` / `zul` fence (with or without the shared kind) **binds**: it names each member in turn, not the group.

| Logic | Ageben | English |
|-------|--------|---------|
| ∃x cat(x) | `zogozel zwal` | *a cat, A* |
| ∀x cat(x) | `zual gogozel zwal` | *every cat, each one A* |
| ¬∃x cat(x) | `zul gogozel zwal` | *no cat A* |
| ∀x | `zual zwal` | *everything, each one A* |
| default: x cat(x), exceptions allowed | `zuam gogozel zwal` | *cats in general, each one A* |
| constant | `zwan`, or any name | *A* (real, specific) |

Ordinary list joins keep the group reading (`zodozel zogozel zam zwal`). *All of them together* stays verb **-x**.

**Reach.** A bound tag holds from the phrase that assigns it to the end of its sentence, and through every sentence a stand-in in that stretch points to (a `blarl` condition, a `darl` content, and so on, recursively). At the end of that sentence, it expires. A tag assigned inside that reach expires with it, even an existential one: under *every dog*, *a cat O* is a different cat for each dog. A tag on a plain phrase outside any bound reach lasts as now. This follows English: *A farmer owns a donkey. He is happy.* works; *Every farmer owns a donkey. He is happy.* does not.

**Shadowing.** While a bound A is live, any earlier A is hidden. When the bound A expires, A refers to its earlier holder again. With no earlier holder, A is free.

**Order.** Tags follow [scope by order](#scope-by-order): a tag assigned later is inside the reach of every bound tag before it. To give a phrase wider scope, move it earlier in the clause or into an earlier sentence:

> `zual godozel zwal dogozel dwol vayebel.`
>
> [[z-everything | g-dog] | z-tag.A] | [d-cat | d-tag.O] | v-see
>
> "Every dog A sees a cat O." (∀x ∃y; each dog may see a different cat)

> `zogozel zwol. zual godozel zwal dwor vayebel.`
>
> [z-cat | z-tag.O] . [[z-everything | g-dog] | z-tag.A] | d-←tag.O | v-see
>
> "There is a cat O. Every dog A sees O." (∃y ∀x; one cat)

> `dogozel dwol zual godozel zwal vayebel.`
>
> [d-cat | d-tag.O] | [[z-everything | g-dog] | z-tag.A] | v-see
>
> "A cat O, every dog A sees." (∃y ∀x in one sentence)

**Connectives** are the existing ones: *and* / *or* from [set joins](../grammar/intermediate/set-joins.md), *not* (`vul`, and `zul` on a fence), *if* (`thohem blarl` + condition sentence, which falls inside the bound reach), *iff* ([because and iff](../grammar/intermediate/because-and-iff.md)), and x = y through [identity](../grammar/beginner/predication.md#identity).

> `zual gogozel zwal vezuvel thohem blarl zwar guzemel.`
>
> [[z-everything | g-cat] | z-tag.A] | v-sleep | [th-if | bl-that-clause] | [z-←tag.A | g-sleepy]
>
> "Every cat A sleeps if A is sleepy." (∀x (cat(x) ∧ sleepy(x) → sleeps(x)))

> `zual gogozel zwal dual gogozel dwol vayebel.`
>
> [[z-everything | g-cat] | z-tag.A] | [[d-everything | g-cat] | d-tag.O] | v-see
>
> "Every cat A sees every cat O." (∀x ∀y; the plain resume `zogozer` could not tell A from O)

**Pairs.** A pair form recalls two bound tags together (`zwaor` *A and O*) inside their reach, as for any tags.

**Relation to the resume rule.** The existing rule (after `blarl` on a general claim, a resume of the kind means the same member) stays. A bound tag is the explicit form of it, for two variables of one kind or when the resume would pick the wrong phrase. The universals page says so in one line.

### Rejections

| Form | Reason | Parser id (W2/W4 picks the final name) |
|------|--------|----------------------------------------|
| `umen` as a pronoun (`zumen`) | retired; `zeyel zar` / `zwal` | `retiredSomeone` |
| bare `zwan` while A is held by a **-l** assignment (`zazozon zwal … zwan`) | would read as a recall of a different referent; assign with phrase + `zwan` to move A | `tagNameHeld` |
| a quantified phrase + `zwan` (`zual gogozel zwan`) | a constant cannot be bound | `tagConstantBound` |
| a recall of a bound tag after its reach, with no earlier holder (`zual gogozel zwal vezuvel. zwar guzemel.`) | the variable is out of scope; tags never fall back | `tagBoundExpired` |
| assigning a tag that is bound and still live (`zual gogozel zwal … zodozel zwal` inside the reach) | would end the variable early; use another tag | `tagBoundRebind` |
| a tag on a not-every fence (`zual gogozel zul zwal`) | the denial leaves no member for A to name; *some cat A doesn't …* is `zogozel zwal … vul` | `tagNegatedEvery` |

`tagNameUnbound` (named recall with no name) is retired with named recall. `nonspecificPlural` and `topicNonspecific` are retired with `umen`.

## Implementation plan

If the user says to stop partway, the orchestrator [consolidates this proposal](../meta/procedures/proposals.md#consolidate-on-stop) before the session ends.

### Units

| ID | Items | Agent | Model / effort | May edit |
|----|-------|-------|----------------|----------|
| W1 | Retire `umen`: grammar prose and tables, meta notes, parser, tests. Not Practice. | `proposal-worker` | `opus` / `high` | `docs/grammar/beginner/pronouns.md` (not `### Practice`), `docs/grammar/intermediate/universals-domains.md` (row only), `docs/grammar/terminology.md`, `docs/grammar/intermediate/topic.md`, `docs/grammar/advanced/hook-compounds.md`, `docs/grammar/intermediate/resume-sense.md`, `docs/grammar/beginner/sakes.md`, `docs/grammar/english.md`, `docs/grammar/say-*.md`, `docs/grammar/finger-code.md`, hand-written rows in `docs/grammar/cheat-sheets/`, `docs/meta/glosses.md`, `docs/meta/grammar-docs.md`, `docs/meta/unassigned-reserved.md`, `docs/meta/design-decisions.md`, `src/parse/*`, `src/closed-roots.ts` (only if a special-pronoun list lives there) |
| W2 | Pseudonym `zwan`: tag page prose and table, parser (phrase + tag **-n** assigns; bare `zwan` rules; `tagNameHeld`), tests, glosses, reserved rows, design decisions. Not Practice. | `proposal-worker` | `opus` / `high` | `docs/grammar/intermediate/tag-pronouns.md` (not `### Practice`), hand rows in `docs/grammar/cheat-sheets/people-pointing.md`, `docs/meta/glosses.md`, `docs/meta/unassigned-reserved.md`, `docs/meta/design-decisions.md`, `src/parse/*` |
| W3 | Scope by order: the rule and example pair in beginner `### Everything (ua)`, the narrowed move-a-word sentence in `clause.md`, existing examples with two quantified phrases in one clause re-glossed to the rule, reader notes and LLM prompt (scope by order), tests if the parser marks scope, `npm run grammar-check` if `sentence-parser.ts` changes. | `proposal-worker` | `opus` / `high` | `docs/grammar/beginner/joins.md` (`### Everything (ua)` only), `docs/grammar/beginner/clause.md` (the move-a-word sentence only), any grammar page whose example W3's premise check flags (that example's gloss only), `src/parse/*` |
| W4 | Bound tags: new H3, Lists bullet and *a tag lasts* paragraph on the tag page, one-line cross-reference on the universals page, parser (bound reading, reach, shadowing, `tagConstantBound`, `tagBoundExpired`, `tagBoundRebind`, `tagNegatedEvery`), reader notes and LLM prompt, tests, `npm run grammar-check` if `sentence-parser.ts` changes. | `proposal-worker` | `opus` / `high` | `docs/grammar/intermediate/tag-pronouns.md`, `docs/grammar/intermediate/universals-domains.md` (not `### Practice`), `docs/meta/unassigned-reserved.md`, `docs/meta/design-decisions.md`, `docs/meta/glosses.md`, `src/parse/*` |
| W5 | Practice: top up one scope-by-order item on beginner joins, and one bound-tag item and one pseudonym item where the new H3 lands. | `checkpoint-writer` | `opus` / `high` | `### Practice` of the four pages; drill allowlist |
| W6 | Audit: read the changed sections and close neighbors; check that *someone* reads the same everywhere, that no page still teaches named recall or calls a pseudonym anything but a person, that no page still says moving a word never changes the meaning, that every example parses, and that `find-english.mjs 'someone'` points at the new forms. Fix small slips; report anything larger. | `proposal-worker` (fresh) | `opus` / `high` | any file W1–W5 touched |

Order: W1, W2, W3, W4, W5, W6, in sequence (W2 and W4 share the tag page and the parser; W4 links back to W3's section).

**Placement in W4.** The bound-tag H3 goes on whichever of `tag-pronouns.md` and `universals-domains.md` comes later in the intermediate path ([learning levels](../meta/learning-levels.md)), so it can link back to both without a forward link. The other page gets a one-line pointer only if it comes later. If the H3 would push its sitting past the size limit, stop and alert ([restructure sittings](../meta/procedures/restructure-sittings.md)).

**Premise checks** (stop and alert if one fails):
- W3 first lists existing examples (grammar pages, `say-*.md`, Practice) with two quantified phrases in one clause, and any prose that states a scope rule. It re-glosses examples outside Practice to [scope by order](#scope-by-order) and reports Practice items for W5. If a page states a different scope rule as a design point (not just an example gloss), stop and alert.
- W3 checks that the sitting holding beginner `### Everything (ua)` stays under the size limit after the addition. If it would not, stop and alert ([restructure sittings](../meta/procedures/restructure-sittings.md)).
- W1 checks that `umel` *neutral* has no other dependency on `umen`'s pronoun status (cheat-sheet seeds, Claritish lists, the English helper's data).

### Rule digest (pasted into every brief)

> - Ageben only; current forms only; no former-name or *used to be* notes ([present the current language only](../meta/grammar-docs.md#present-the-current-language-only)).
> - Parser changes ship with the grammar edit that teaches them, plus an `unassigned-reserved.md` row for each newly rejected spelling and a `design-decisions.md` entry when the reason is more than *no reading yet*.
> - Work out what a sentence means with `node scripts/parse.mjs --llm-prompt`; check that a form parses with `node scripts/parse.mjs` (all sentences in one call).
> - `umen` is retired. *Someone* is `zeyel zar` (no return planned) or `zwal` (you will return).
> - `zwan`: a real, specific person (people only) whose name is withheld. Bare `zwan` introduces when A is free and recalls when A is held by `zwan`; phrase + `zwan` assigns and overwrites; bare `zwan` while A is held by **-l** (even a restored one) is not a sentence; `zwaon` recalls two pseudonyms.
> - Scope by order: a quantified phrase (a `zual` / `zuam` / `zul` fence, or a phrase bringing in a new member) reaches from where it stands to the end of its sentence, plus the sentences its stand-ins point to; whatever comes later is inside it. Tagged or not. Reordering roles chooses scope; who did what never changes. Verb `vul` sits inside every quantified phrase before it.
> - A tag after a `zual` / `zuam` / `zul` fence binds (each member in turn). It holds from its phrase to the end of its sentence and through the sentences its stand-ins point to, then expires; tags assigned inside expire with it; an earlier holder of A is hidden while it is live and comes back after. A tag on a not-every fence (`zual` … `zul`) is not a sentence.
> - Rejections and their reasons: see the proposal's Rejections table, pasted below the digest for W2 and W4.
> - Do not link to any file under `docs/proposals/`.
> - Read slices: list headings first, read only the ranges you edit.
> - Cheat-sheet tables between `<!-- generated -->` markers are never edited by hand; report that a regeneration is needed and stop there.
> - Grammar decisions not settled here: log them in your report with options and a recommendation, skip the item, carry on.
> - Stop and alert (report and stop; do not work around): a premise no longer holds; later units would need a different design, order, or pages; skipping would leave later work on a broken state; enough is skipped that the goals cannot be met.
> - Verify with `npm run verify -- --allow-generate` at the end of each item (`--fast` inside an item). Never paste raw build output; read only the new error's line in `tmp/verify-last.log`.
> - At about 25 tool calls, check what is left. If it is small, finish the item, even past 25 calls. If a significant amount is left (more than a few edits, or pages you have not read yet), stop at a clean point, leave the tree green, and report: done, left (as steps), files touched.
> - Report, fixed fields: **done**; **files touched** (count); **registry edits**; **AGENTS.md Owns lines** to change; **verify** line; **skips** with reasons; **left**; **inefficient**.

### Gates

- Orchestrator saves `npm run verify -- --baseline` before W1.
- Each unit ends with a green `npm run verify -- --allow-generate` against that baseline.
- After W1, W2, and W4: `npm run cheat-sheet-blocks -- --write`, committed on its own ([fence automated rewrites](../meta/procedures/proposals.md#fence-automated-rewrites)) when it changes anything, then verify.
- After W3 and after W4: `npm run grammar-check` if `src/parse/sentence-parser.ts` changed.
- Final gate after W6: clean `npm run build` and `npm test`, with nothing left on a **generate** row.

### AGENTS.md

Orchestrator applies Owns-line changes at the end. Expected: the `joins.md` row's *a whole kind: universals, domains (`universals-domains.md`)* or the `pronouns.md` row's *tag pronouns (`tag-pronouns.md`)* gains *bound tags*, whichever page holds the new H3. The `clause.md` row's *default order* becomes *default order and scope by order* only if W3 puts the rule on `clause.md`; it stays as is when the rule lives in beginner joins.

### Commits

Seven to ten commits, each `tags-and-logic WN: <what> [skip-cd]` plus the co-author line, staging only that unit's files: W1, W1 cheat-sheet regeneration, W2, W2 cheat-sheet regeneration (if any table changed), W3, W4, W4 cheat-sheet regeneration (if any table changed), W5, W6 (if it fixed anything), and the AGENTS.md Owns lines with the proposal's removal.

## Open decisions

Decisions 1–4 were settled on 2026-11-10 (Status line).

1. **Bare `zwanx` with A free** (from W2). The parser makes **-x** and pairs on **-n** recall only, so a bare `zwanx` with A free is `tagUnbound`. Options: (a) keep **-x** recall-only; (b) let bare `zwanx` bring in *a real person and associates*. **Recommendation:** (a). Pairs never assign either, and phrase + `zwan` followed by `zwanx` already says it.

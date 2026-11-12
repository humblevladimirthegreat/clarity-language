# Style pass

**Status:** partially implemented. Decided 2026-11-11: a rising warning count fails the build on every page (the ratchet); recipe pages, cheat sheets, and level reviews get which-page rows; headings that need a retitle are logged and retitled together in H1; the user reviews each phase before the next starts; forms take bold only where introduced. **Phase 1 done 2026-11-11** (T1, T2, T3, C1). **Phase 2 done 2026-11-12** (B2 to B5). **Phase 3 done 2026-11-12** (B6 to B9; Beginner is finished). `purpose.md` and `introduction.md` were already rewritten to [orientation-style.md](../meta/orientation-style.md), so the pass skips them. Decided 2026-11-12: a page with two or more teaching sections needs a page lead (rule in [doc-style.md](../meta/doc-style.md#which-page)); 15 Intermediate and 9 Advanced pages lack one and get it in their units. **Phase 4 done 2026-11-12** (B10, O2, O3, O4; the recipe track and Claritish are finished, and the English-helper recall check passed). Decided 2026-11-12: Claritish further-inventory sections and run-in labels are now rules in [claritish-style.md](../meta/claritish-style.md#forms). **Phase 5 done 2026-11-12** (I1 to I6). Decided 2026-11-12: the four Claritish lessons that lacked one now say when to leave the drop-in out (where the English already says it). **Phase 6 done 2026-11-12** (I7 to I12). **Phase 7 done 2026-11-12** (I13 to I17; Intermediate is finished). **Phase 8 done 2026-11-12** (A1 to A5; Advanced is finished, so every page unit is done). Next: the user reviews the Phase 8 diffs (commits `d07e2f76` to `c952b242`) and the [fixes outside the pass](#fixes-outside-the-pass) that wait on them, then Phase 9.

**Related:** [doc-style.md](../meta/doc-style.md), [claritish-style.md](../meta/claritish-style.md), [orientation-style.md](../meta/orientation-style.md), [grammar-docs.md](../meta/grammar-docs.md), [reading-order.ts](../grammar/.vitepress/lib/reading-order.ts), [prose-style.ts](../../src/lint/prose-style.ts), [prose-style-baseline.json](../../src/lint/prose-style-baseline.json), [sections.ts](../../src/lint/sections.ts), [style-editor.md](../../.claude/agents/style-editor.md)

**Depends on:** none.

**Design authority:** *none*. The pass changes teaching English only. It adds, removes, and changes no form, reading, gloss, example, or checkpoint.

## Design

Each prose unit is one fresh `style-editor` subagent on one sidebar unit from `reading-order.ts`, in reading order. The agent file holds the rule digest, the checks, and the report format. Its brief file adds only the unit's pages, in reading order, the [glossed labels](#glossed-labels) list, and these cautions from earlier units:

- A bulk unbold must not turn bold English words (**is**, **no**) into code spans; unbold only Ageben letters, endings, and forms.
- A sentence that names a feature no earlier page teaches may be cut only when the page that owns the feature states it.
- Cue-column letters in `<!-- cheat-sheet: … -->` tables go in backticks, unless the cheat-sheet lint rejects a letter the cheat sheet lacks; then the letter stays bold and is reported. Each marker sits above its table, never between the header and separator rows.
- Examples stay where they stand. Add or drop a code span or link only when you must, since the wording-only check compares them. A unit of more than about 1,500 lines may stop at the turn check. A fresh `style-editor` then finishes the pages it names as left, under the same unit id.
- Forms take bold only where introduced.
- **Compare with:**, **Related form:**, **Not the same job as:**, and **For *X*, use:** are the four house run-in labels ([grammar-docs.md](../meta/grammar-docs.md#compare-with)). Keep them; rewrite the sentence after the label, never the label into prose.
- A page with two or more teaching sections (not counting Practice and See also) and no lead between the H1 and the first H3 gets one that previews each section in at most one sentence, from what the sections already say ([which page](../meta/doc-style.md#which-page), *the lead of a whole page*). A page with one teaching section keeps its one lead where it is.
- The Ageben lint rejects a letter group in one code span (`b d g`); write one span per letter (`b`, `d`, `g`).
- A script that splits a page on `### Practice` must match the whole heading line; `#### Practiced …` headings exist.
- The prose lint ends a sentence at a `?` inside italics, so a list of *when?*, *where?* can trip `long-paragraph`.
- A code span in a new page lead fails `wording-only` as a new span. That is expected: list those spans in the report, and the orchestrator accepts them after reading the lead.
- A sentence that says when to pick one form over another must restate what the page's own table or text already says; never infer a *when* from the form's gloss alone.
- Run the full `npm run verify -- --allow-generate` as the last step, not `--fast`.

The sidebar unit is the right size because a label is glossed on first use *in reading order*, so the worker needs to know what the pages before it already taught. Every page unit is done. The cautions still bind the Phase 9 `style-editor` units, L1 and X2.

## Implementation plan

Phase 9 remains, in one orchestrator session. At the end of each phase, and if the user says to stop partway, the orchestrator [consolidates this proposal](../meta/procedures/proposals.md#consolidate) before the session ends, keeping the [glossed labels](#glossed-labels), [headings to retitle](#headings-to-retitle), and [sections missing a fact](#sections-missing-a-fact) lists current.

Prose units run as `style-editor` on `model: opus`, `effort: high`, in sequence. Each one may edit only its own pages and `src/lint/prose-style-baseline.json`. A page with a control (a drill, a player, the journal editor) also gets the [interface instructions](../meta/doc-style.md#interface-instructions) check.

Each phase ends with the phase gate, the last unit's commit, consolidation, the proposal's commit, then a stop. The orchestrator tells the user what the phase settled, which open decisions wait on them, and the prompt for the next phase, *Carry out phase N of `style-pass.md`*.

### Phase 9: close

| Unit | Work | Agent | Model, effort |
|------|------|-------|---------------|
| L1 | Cheat-sheet prose outside the `<!-- generated -->` markers, level-review prose outside Practice, `terminology.md` link text and voice only | `style-editor` | `opus`, `high` |
| H1 | Retitle the headings in [headings to retitle](#headings-to-retitle) to plain language, each pinning its old id with `{#id}` so no link changes | `proposal-worker` | `opus`, `high` |
| X1 | Independent audit. A fresh subagent that has read no earlier report takes two sections per unit, chosen by the orchestrator, and runs the slogan test and the why-care test from the lead alone. It edits nothing and reports failures by section | `proposal-worker` | `opus`, `high` |
| X2 | Fix what X1 found, lower the baseline, and make `voice` a failing rule in `src/lint/prose-style.ts` (severity error, out of the baseline). The `voice` rule skips table cells, bold, and parentheses to avoid false positives, so X2 also greps those for maintainer *we* and author *I* by hand | `style-editor` | `opus`, `high` |

X1 and X2 share a phase because X2 works from X1's report. If X1 fails more than about one section in five, that is a [stop-and-alert](../meta/procedures/proposals.md#stop-and-alert) finding: the digest is not working and the user decides what to do.

### Glossed labels

Labels that finished units have glossed, in reading order, each with the page that glosses it. The orchestrator copies this list into each prose unit's brief and adds each report's newly glossed labels after the unit's commit.

| Label | Glossed on |
|-------|------------|
| root ("the part that carries its meaning"), pitch | `phonology.md` |
| `/z/` notation for a word's first letter | `clause.md` |
| speech move | `speech-moves.md`, page lead |
| role (subject, object, and so on), replacing *slot* | `dependents.md`, page lead |
| associative `-x` ("the ending in *Azozon and associates*") | `pronouns.md`, role pointers |
| body (subject, verb, and so on) | `questions.md` |
| met / unmet sake | `sakes.md`, page lead |
| stance vowel | `sakes.md`, sake inventory |
| prescription | `ought-for-a-sake.md`, lead |
| landmark (the hook's `/b/` noun: place, source, or goal) | `hooks.md`, extra noun |
| restrictor | `restrictors.md`, page lead |
| setting (the general surroundings, for the zone extra) | `extra-noun-hooks.md` |
| fixed word, replacing *stock word* | `restrictors.md`, again |
| rank join ("the join from the Joins page that puts items in order"), same height ("have the quality to the same degree") | `comparatives.md`, page lead |
| exponent ("power of ten") | `digit-strings.md` |
| `the` ("the spoken comma") | `digit-strings.md`, Fields table |
| reach vowel | `roles.md`, page lead |
| B ("call that person B") | `social-ties.md`, genitive |
| ability vowel | `can-and-cant.md`, Ability |
| intention adverb ("a word about the whole claim") | `can-and-cant.md`, page lead |
| bid ("an offer of how much time you have") | `conversation-length.md` |
| consonant cluster ("two consonants in a row") | `place-name-roots.md` |
| semitone ("one piano key") | `letter-names.md` |
| continue prefix ("adds a sentence to the speech move you already started") | `phonotactics.md` |
| check-back ("a short turn after your sentence that asks the listener for that answer"), undo answers ("the *not* family") | `polar-inventory.md` |
| *be ADJ!* ("*be* plus the adjective") | `more-turn-words.md`, commands to be ADJ |
| topic stretch ("the run of sentences from that change to the next one") | `topic.md`, topic resets |
| recast ("change only the first letter to the new role letter") | `resume-sense.md`, cross-role recast |
| stacked vowel ("stack their two tag vowels") | `tag-pronouns.md`, tag pairs |
| person-role specials ("the special pronouns for the speaker and the listener") | `collectives.md`, where `-x` sits |
| fence ("a list together with the join word that closes it"), resume ("a pronoun that points back to …") | `list-structure.md` |
| fixed for the `-n` join ending, replacing *stock* | `rank-joins.md` |
| K ("K for any kind") | `universals-domains.md`, every kind |
| standalone ("with no clause before it"); *list move* is said as "what a join does to a list" | `verb-and-stance-joins.md`; `list-verbs.md` |
| holder ("no one named whose view it gives"); channel ("no word for how you know it") | `try.md`; `permission-consent.md` |
| scope-taking ("a word, like *possibly*, that frames what it reaches") | `scope-islands.md`, binder required |
| `/x/` ("the role of words like *therefore* that open a sentence and link it to the one before") | `number-roles.md` |
| same-role hook ("the hooks that sit between two phrases in the same role, `A HOOK B`") | `in-clause-hooks.md`, In-clause |
| discourse hook ("a hook at the front of a sentence that ties it to what was said before"), stacked hook ("the hooks with two vowels") | `in-clause-hooks.md`, Detail on the hook; Point back |
| arrow root ("the word for the compass heading, such as *west*"), viewpoint anchor ("the person or thing whose facing counts"), DIR ("the direction root") | `viewpoint.md` |
| the notional ("the *as if* word") | `role-parts.md`, Content of the event |
| compound family ("kinds of compound, here called families") | `compound-families.md`, page lead |
| SHARED ("written right after the join word so they describe every item") | `of-relations.md` |
| bar ("the value you rank against") | `bars.md`, page lead |
| offset ("how far the event sits from now"); *evidential* is said as "channel word", *frame* as "a channel carried from an earlier sentence", *seam* as "holder" | `dated-channel.md`, lead; I17 pages |
| whose-now, snapshot ("the moment"), *as-of* pair ("the *as-of* word together with its `/b/`") | `as-of.md`, As-of lead |
| same generation ("among peers at one level, so the number takes no exponent") | `stacked-markers.md`, From the end |
| engineering `e-1` ("an exponent with digits, which puts the zero at the scale 10⁻¹") | `special-values.md`, Zero × exponent |
| focus ("the person, version, or outline point in focus") | `generations.md`, page lead |
| PoS ("the role letter of the whole word"), seam ("the letters between number and root") | `numeric-derivation.md`, Numeric prefixes table |
| V(CV)+ ("vowel, then consonant and vowel pairs"), pentatonic ("five-note"), a fifth ("seven semitones"), `/y/` word ("that opens a new turn") | `singability.md` |
| seam of a hooked join ("the letter that joins hook and join", the `x`); *closed / open pair* is said as "locked / open pair" | `hooked-joins.md`, Bounding who counts; `stand-in-roles.md` |

### Headings to retitle

Headings that prose units reported under rule 7 of the digest, each with its page, its id, and why it fails. H1 works from this list.

| Page | Id | Why it fails |
|------|----|--------------|
| `say-amounts.md` | `unspecified-value-in-the-range--r` | *Unspecified value in the range (**-r**)* bolds an ending in a heading |
| `say-reasons.md` | `factivity` | *Factivity* is a specialist term |
| `say-reasons.md` | `epistemic-because` | *Epistemic* is a specialist term |
| `say-reasons.md` | `stacks` | *evidentiality* is a specialist term |
| `say-people-places.md` | *Arrow roots as talk-moves* | *arrow roots* is house shorthand the heading does not explain |
| `say-questions.md` | `single-item-standalone-inventory` | names house terms, not an English job |
| `conversation-length.md` | `conversation-length` | bolds **`x`**, and *name `x` vowel* is shorthand no sentence above it explains |
| `label-reach.md` | *IDENTITY endings* (no id) | bolds the all-caps gloss label IDENTITY, which is not plain language |
| `more-turn-words.md` | `command-property` | *Commands to be ADJ*: ADJ is house shorthand |
| `tone-marks.md` | `emphasis-and-clefts` | *clefts* is a linguistics term |
| `polar-inventory.md` | `yes-no-single-item-standalone` | made of shorthand labels; the heading has no `{#id}`, only `<a id>` lines under it |
| `fill-ask-roles.md` | `fill-ask-arity` | *arity* is a specialist term |
| `resume-sense.md` | `how-english-approximates-r`, `resume-sense` | each bolds an ending in a heading |
| `collectives.md` | *Where -x sits* (no id) | bolds an ending in a heading |
| `collectives.md` | `associate-resolution` | *Associate-set resolution* is specialist wording |
| `rank-joins.md` | `invert-u-stacks`, `route-ao` | each bolds an Ageben form in a heading |
| `number-markers.md` | `marker-vowel-referential-identity` | *referential identity* is jargon the section never glosses |
| `digitless-exponents.md` | `bare-oom` | *OoM* is an abbreviation, glossed only in the section's second sentence |
| `discourse-hooks.md` | `discourse`, `discourse-placements` | *discourse* is a specialist word the headings do not gloss |
| `more-occasions.md` | `unspecified-member-r` | *Unspecified member* is jargon |
| `in-clause-hooks.md` | `in-clause` | *In-clause* is cheat-sheet shorthand (borderline) |
| `more-occasions.md` | *Occasions vs a dependent when* (no id) | needs a `{#id}` pinned before any retitle |
| `comparative-arity.md` | `comparative-arity`, `covarying` | *arity* and *covarying* are specialist terms |
| `want-and-decide.md` | `decision` (no `{#id}`, only `<a id>` lines) | *revisability* is not plain language; H4 *Endings: changeability* also lacks a `{#id}` |
| `mirative.md` | `mirative` | *Mirative* is a linguistics term |
| `notional.md` | `notional-as-if-framing` | *Notional* and *framing* are specialist labels |
| `generations.md` | `ordinal-generation` | *digitful* and *ordinal* are specialist terms; bolds forms in a heading |
| `numeric-derivation.md` | `limit-polarity-stage` | *polarity* is a specialist term |
| `numeric-derivation.md` | `scalar-digit-morphs`, `ordinal-digit-morphs`, `rank-annihilated-morph` | *scalar*, *ordinal*, and *morph* are specialist terms (check whether each heading has a `{#id}` before retitling) |
| `join-limits.md` | *Rare arities and edge readings* (no id) | *arities* is a specialist term |
| `named-phrases.md` | *Named phrase* with a bold `-n` (check for an id) | bolds an ending in a heading |
| `numeric-derivation.md` | `null-anti-null`; *Zero-exp prefix by PoS* and *Ordinal morph by PoS* (no id) | *by PoS* and *Zero-exp* are shorthand |

### Sections missing a fact

Sections that prose units reported under rule 6: the section needs a consequence or a *when* that no page states. Each needs a user decision or an owner-page edit; the pass does not fill them.

None open.

### Fixes outside the pass

Faults a prose unit found but could not fix within its scope. Add any a later unit reports.

- `special-values.md`: the H4 *Number as discourse* `{#zero-exponent-number-as-discourse}` has no body; the next H4 follows it directly. Nothing links to the id. It predates the pass; the H4 `{#special-number-as-discourse}` earlier on the page carries the content. Needs a decision: drop the empty heading (with a hash row if the id is public) or give it a body.
- The spoken vowel of the `#` marker: the owner table in [number-markers.md](../grammar/intermediate/number-markers.md) says `#` is `ro` and `_` is `re`, as do `numeric-derivation.md` *Ordinal digit morphs* (`ro` + digit) and `grogel` / `zrebaxudewal`. Three places say otherwise: `numeric-derivation.md` after the Numeric prefixes table (`ra` / `ru` / `re` for `+N` / `-N` / `#N`), the `generations.md` page lead (forward `#` / `re`, end-relative `#-` / `rue`), and the header row of the slot table in `cheat-sheets/numbers.md` (`re` `#`, `ro` `_`). They look like typos against the owner page; the fix changes a stated fact, so it waits for the user.
- `span-nesting.md`, Nesting: "opaque blob" is still a picture; the unit found no house term for that kind of span. X2 may settle it if [spans-as-words.md](../grammar/intermediate/spans-as-words.md) or [spans.md](../grammar/beginner/spans.md) names one.

### Gates

- The orchestrator saves `npm run verify -- --baseline` at the start of each phase.
- Each prose unit ends with `npm run wording-only`, `npm run lint:prose -- --update-baseline` on its pages (counts only fall), and `npm run verify -- --allow-generate`. The orchestrator reads the report and `git diff --stat`, and opens a hunk only when the stat shows a file outside the unit or the report flags one.
- Phase gate: the last unit's `verify` is green against the phase's baseline. When nothing has changed since that run, it is not repeated.
- Final gate, in Phase 9: a clean `npm run verify` against an empty baseline after X2.

### Commits

One commit per unit after its gate is green, by the orchestrator only, with the message `style-pass <unit id>: <what> [skip-cd]` and the co-author line. X1 edits nothing and makes no commit. Each phase ends with a commit of the consolidated proposal, `style-pass phase <N>: consolidate [skip-cd]`; in Phase 9 that commit deletes the proposal instead, once the meta notes own the result.

| Phase | 9 |
|-------|---|
| Commits | 4 |

## Open decisions

None.

## Background

### Problem

The pages under `docs/grammar/` have not been brought up to [doc-style.md](../meta/doc-style.md) as a whole. After Phase 5 the ratchet baseline holds 94 warnings: `bold-density` 80, `long-paragraph` 12, `beginner-lead` 1 (kept on `clause.md`), `voice` 1 (kept on `label-reach.md`: *our purposes* inside a Practice answer, which the pass may not edit). Beginner, Intermediate units I1 to I6, the recipe track, and Claritish have had their pass; Intermediate units I7 to I17, Advanced, cheat sheets, level reviews, and `terminology.md` have not.

The tooling that keeps the style applied has landed: the warning ratchet, the `voice` rule (a ratcheted warning until X2), `npm run changed-sections`, `npm run wording-only`, the `style-editor` agent, and the style gate in both procedures.

### Goals

1. Every learner-facing page passes the checklist: warnings cleared or individually accepted, and the seven closing tests run on every teaching section.
2. A page's warning count cannot rise without someone deciding it should. *(Done: the ratchet.)*
3. Any later change that moves, peels, merges, or rewrites sections ends with a style review of exactly those sections, by a reader with a fresh context. *(Done: the style gate.)*

### Non-goals

- No change to Ageben forms, glosses, examples, Practice checkpoints, word banks, or generated cheat-sheet tables.
- No moving or retitling of headings, and no change to heading ids, except in H1.
- No new rules of style. Where the guide is silent about a kind of page, the gap is logged for the user, not filled by a worker.

# Structure highlighting for Agazan examples

Status: idea. Not design authority; fold into grammar / meta docs, then drop.

## Problem

Role letters are visible in the spelling, so colouring by role adds little. What a skimmer cannot see in a flat string is structure the spelling does not show:

- **Join fences.** A join is right-close: the items come first and the join word closes them ([joins](../grammar/joins.md#right-close)). Nothing marks where a list began until its closer arrives, and nested fences ([fence nesting](../grammar/joins.md#fence-nesting)) stack closers with no visual cue.
- **Topic.** A topic is set only by an `/x/` word at the start of a sentence ([topic](../grammar/pronouns.md#topic)). Which stretch of text a topic governs, and where it resets, is not visible.
- **Pronoun antecedents.** Resumes, role pointers, tags and the topic pronoun can reach across sentences and turns ([role pointers](../grammar/pronouns.md#role-pointers)).

Spans (`[…]`, `<…>`, `th(…)`) already carry literal brackets, so they need at most a light tint.

## Scope

In:

1. **Fence underlines** from each join word back over the items it closes. Nested fences stack, outer lower. Join type (the vowel) sets hue; closed (-l) versus open (-m) sets solid versus dashed, so *and possibly more* is visible without reading the ending.
2. **Topic stretch**: a marker on the topic-setting `/x/` word, and a left rule or tint on each following sentence until the topic changes or clears. Introduce, return and clear look different.
3. **Pronoun to antecedent**: hover on a pronoun outlines its antecedent. The topic pronoun and tags may also carry a constant colour; other pronouns get hover only, because colour per referent stops being distinguishable after three or four.

Out for now (possible later): a stance / attitude layer (evidentials, polar particles, interjections, tone marks), glue words (hooks, linkers, subordinators) muted against content roots, and seam dividers inside compounds.

Rule for all of it: where the parser cannot resolve something, show nothing. A wrong highlight is worse than none.

## Data source

The parser already computes most of this.

- `resolve.anaphors` ([resolve.ts](../../src/parse/resolve.ts)) lists each pronoun with its `kind` (`topic`, `pointer`, `role`, `tag`, `content`, `number`) and its `antecedent` word, absent when nothing matches. The resolver keeps topic state across sentences by the rules in pronouns.md (introduce and return set it; *next*, *by the way* and goodbye clear it; tags survive a topic change).
- Each coordination in the tree has `parts: { items, join, … }` for noun, verb and adjective lists and bound `/b/` joins, so fence extents come from walking the tree. [ast-walk.ts](../../src/parse/ast-walk.ts) has a visitor for this.
- Words carry `at`, their index in the input. Highlighting needs a mapping from word index to character range in the source text. Spans, multi-sentence input and any text the tokenizer reshapes are the cases to check.

The CLI's nested JSON is not the right shape. The prototype should emit a flat list of `{ word index, text range, annotation }`.

## Which text is Agazan

Examples on grammar pages are written as a blockquote: the Agazan line as an inline code span, then a morph-gloss line as plain text, then the English. Only a few fenced blocks exist. So eligibility comes from the build's own classification of code spans ([marking Agazan](../meta/grammar-docs.md#marking-agazan)), not from fence tags:

| Class | Highlight |
|-------|-----------|
| sentence, phrase | yes, from a full parse |
| word | no structure to show; at most nothing |
| template, fragment | only if the build already parses it with sample context; otherwise leave plain |
| English, unclassified | never |

Morph-gloss lines (`z-Azawan | v-walk`) are not Agazan and must never be tagged or treated as such. They are plain text in a blockquote and are never touched.

### Fence tags

An audit found two fenced blocks tagged `agazan`, both in [say-people-places.md](../grammar/say-people-places.md) (the fence-glyph examples near *opaque spans*). Both are Agazan cites, not glosses, so the tag is correct there. No incorrectly tagged gloss exists today.

Policy to keep:

- A gloss, English line, table or diagram is never tagged `agazan`. Use `text`.
- `agazan` is only for real Agazan, checked line by line by the build.
- If the audit later finds a gloss tagged `agazan`, retag it `text` in the same change.

## Warning

`vitepress dev` prints *The language 'agazan' is not loaded* once per tagged fence (two). Register an `agazan` language in the VitePress config (a minimal grammar, or an alias to plain text) so the tag is known and the warning goes away. This is independent of the highlighting work and can ship first.

## Approach

Build-time, not runtime. A markdown-it transform in the docs build:

1. Take each code span the build classes as sentence or phrase, plus the surrounding sentences of the same example for topic and pronoun context.
2. Run the parser, build the flat annotation list.
3. Emit spans with data attributes and CSS classes. Hover behaviour is a small script or pure CSS.

This ships no parser to readers. [browser.ts](../../src/parse/browser.ts) suggests a client-side parser exists, but nothing here needs it.

## Design constraints

- Channels do not collide: fence underlines, a margin rule for topic, text colour or hover for pronouns.
- Underlines rather than backgrounds, so nesting stays legible and dark mode works.
- Non-colour cues (dash versus solid, weight) so colour-blind readers get the same information.
- Highlighting never changes the text, spacing or copy-paste result.
- Optional: a site toggle to switch it off.

## Open questions

- How examples spanning several sentences (topic and pronoun context) are grouped: per blockquote, per section, or per page.
- How a fragment with sample context should treat context sentences it does not display.
- Whether clause joins (`/x/`, between clauses, no right-close fence) get a divider or nothing.
- Whether word-index to range mapping holds for every span form.

## Plan

1. Register the `agazan` language to silence the warning.
2. Prototype: for a handful of doc examples, print the flat annotation list (fence extents, topic stretches, pronoun to antecedent) and check it by eye against the grammar pages.
3. If the mapping holds, add the build-time transform and CSS.
4. Fold the policy lines under *Fence tags* into [grammar-docs.md](../meta/grammar-docs.md) and drop this proposal.

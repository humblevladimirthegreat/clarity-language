# Verb-join scope: which verb a word belongs to

Status: decided by the editor 2026-10-17, not started. Not design authority; fold into the grammar pages below, then drop.

## Problem

A verb-phrase join is a right-close fence: verbs, then a join word (`vowogal varahal val`). [join-across-roles.md § verb-phrase forms](../grammar/join-across-roles.md#vp-clause-forms) says an item ends at its verb, so a `/d/`, `/b/` or `/h/` *between* two joined verbs belongs to the verb after it. It never says what a word *before the first* verb means. The parser treats it as clause-level, so it covers every verb:

| Input | Parser today |
|---|---|
| `zazawan dababol vugugel hugem bavahel vehahel val.` | `z-Azawan \| d-popcorn \| [v-cooking \| [[h-around \| b-fire] \| v-sit] \| v-and]`: popcorn is the object of both |
| `zazawan hadehum vugugel varahal val.` | `z-Azawan \| h-haste \| [v-cooking \| v-run \| v-and]`: both hasty (the page says so) |
| `zazawan bahaben vezebel bazawan vamol val.` | `z-Azawan \| b-Ahaben \| [v-tell \| [b-Azawan \| v-pay] \| v-and]`: two recipients for *pay* |

A learner reads *popcorn cook* as *cook popcorn*, as English does, and there is no one-clause way to give only the first verb an object.

## Decision

**One rule for every item: a word before a verb belongs to that verb. Shared words go after the join, or before the subject.**

1. **The first item starts at the subject.** The `/d/`, `/b/`, `/h/` and hook words between the subject and the first verb belong to the first verb. With no subject in the clause, the first item reaches back to the start of the clause.
2. **Words before the subject cover every verb.** That is the place for scene-setting words (`h_15,30 zazawan vowogal varahal val` *at 15:30 Azawan walks and runs*). It is also the verb-late place for a shared object: `dababol zazawan vugugel vagadel val` *popcorn, Azawan cooked and ate*. This matches English, where a fronted object is shared and *cooked popcorn and ate* is not.
3. **SHARED after a verb join** is a `/d/`, a recipient `/b/`, or an `/h/`, and it covers every verb, whether or not the items have words of their own. This drops the *every item is a bare verb* condition on shared `/d/`. `zazawan vugugel vagadel val dababol` *cooks and eats popcorn*; `vowogal varahal val hahegem` *both intensely*.
4. **Shared `/h/` moves after the join too.** An `/h/` before the first verb (after the subject) is the first verb's only. *Both hastily* is `val hadehum` or `hadehum zazawan …`.
5. **Not item words, wherever they sit:** `/th/` stance words and the [intention adverbs](../grammar/clause.md#intention-adverbs). Both already cover the whole claim by their own rules. A `/b/` right after an `/h/`, `/ɡ/` or `/th/` still completes that word ([extra nouns](../grammar/clause.md#extra-nouns)), and a `/b/` hosted by a pair-scope verb ([scope relative](../grammar/predication.md#scope-relative)) stays with that verb.
6. **A verb with its own object takes no shared object.** `dababol vugugel vagadel val dabovul` would give *cook* two objects: reject it, with a reason in design-decisions.md and a row in unassigned-reserved.md. The same holds for a recipient.
7. **Recipients.** The verb join counts as *the verb*, so a recipient right after the join is everyone's, and [speech-moves.md § act word order](../grammar/speech-moves.md#act-word-order)'s *right after the verb, wherever the verb goes* stays true as written. A recipient for one verb goes before that verb, like its object. clause.md's *a clause has at most one* recipient becomes *at most one per verb*: `zazawan bahaben vezebel bazawan vamol val` *tells Ahaben and pays Azawan*. A shared recipient goes before a shared `/h/` (`val bahaben hahegem`), since a `/b/` after an `/h/` completes it.
8. **The free word order caveat.** clause.md says moving a word does not change the meaning. Inside a verb join, position says which verb a word goes with (already true today for words between verbs). Add that caveat where clause.md promises free order.

### From … to as one unit

Today *from 9:00 to 17:00* must straddle the verb (`zazawan ul b_9 vowogal oel b_17`), because [numbers-applied.md § time](../grammar/numbers-applied.md#time) says two extra nouns need a non-`/b/` word between them: otherwise `b_9 oel b_17` reads as a [range](../grammar/hooks.md#ranges) between same-role words, and the parser gives `[from | b-_9] | through | b-_17`. Under the rule above, a straddling pair would split around a verb join (`ul b_9` on the first verb, `oel b_17` shared).

9. **`ul X oel Y` is one unit, *from X to Y*.** After an `ul` extra noun, `oel` plus `/b/` closes the pair; it is not a range. Nothing natural is lost: a starting point that is itself a range (*from (9 through 17)*) does not come up. The unit sits where its scope should be, like any other word: before the subject or after the join for every verb, before one verb for that verb alone. It works for any endpoints (*from the thunderstorm to the bell*), not only numbers.
10. **The straddling form stays** for a single verb, as a second way to say it. Inside a verb join it gets the plain reading by position (`ul` on its verb, `oel` after the join shared); the parser does not pair the two halves across the join. Pages teach the one-unit frame first.

Clock-time-only alternative that already parses, for reference: `zazawan h_9 al h_17 vowogal` (*9:00 through 17:00*, a band of time).

## Known cost

A subjectless statement with a shared object puts the verb first (`vugugel vagadel val dababol`), which is the command order ([act word order](../grammar/speech-moves.md#act-word-order)). With no subject there is no place before it to front the object. Subjectless statements are rare; the editor may want a line on it.

## Edits

| File | Edit |
|------|------|
| [join-across-roles.md § verb-phrase forms](../grammar/join-across-roles.md#vp-clause-forms) | State rules 1–7 with examples: first-item object (*cooked popcorn and sat around the fire*), fronted shared object, shared `/d/` / `/b/` / `/h/` after the join, per-verb recipients. Replace *An adverb `/h/` before all the joined verbs … covers every item* and the bare-verb condition on SHARED `/d/`. Say that `/th/` and intention adverbs are not item words before the first verb either. Rework the popcorn example (now *ate it*, which relies on the shared reading) and its practice items. |
| [joins.md § SHARED after the join](../grammar/joins.md#shared-after-the-join) | *After a verb join, only an `/h/` is SHARED* becomes `/d/`, recipient `/b/`, or `/h/`. |
| [clause.md](../grammar/clause.md) | Free-order caveat at the object order (§ direct object, *you may move those three words*), adverbs (*place it anywhere*), and emphasis (*any other order means exactly the same*). Recipient: *at most one per verb*. |
| [speech-moves.md § act word order](../grammar/speech-moves.md#act-word-order) | A line that a verb join is *the verb* for the recipient's place; optionally the subjectless cost above. |
| [numbers-applied.md § time](../grammar/numbers-applied.md#time) | Teach `ul X oel Y` as one unit first, the straddling form second; drop *keep a non-`/b/` word between them* as a requirement. |
| [hooks.md § ranges](../grammar/hooks.md#ranges) and § since | After `ul X`, `oel Y` is the end of a from–to, not a range; link to numbers-applied. |
| Cheat sheets | Rows that quote changed examples (`lint:cheat-sheets` lists them); the *From … to* row in `numbers.md` if the taught form changes. |
| [design-decisions.md](../meta/design-decisions.md), [unassigned-reserved.md](../meta/unassigned-reserved.md) | Rule 6's rejected form. Why the first item starts at the subject (scene-setting scope, verb-late shared objects), and why the straddling range is not paired across a join (one tree, local rules). |

The morph line for the from–to unit is the new session's call (for example `[from | b-_9 | toward | b-_17]` as one bracket); it must round-trip ([round trip](../meta/glosses.md#round-trip)).

## Parser

- Verb lists: [`sentence-parser.ts`](../../src/parse/sentence-parser.ts) `vpCoordPartRule` gives `items` (the `/h/`, `/d/`, `/b/` words before a verb) only to `later` parts; the `first` part needs them too, bounded by the subject. Token marks (`VPlainEnd` / `VPlainMore`, `markContext`) decide where a verb list starts and ends; prefer a token mark or structure to a gate.
- SHARED after a verb join: today a `/d/` after a non-bare verb join parses as a clause-level unit (same meaning); make it SHARED structurally, and reject rule 6.
- From–to unit: `ul` + `/b/` + `oel` + `/b/` as one unit, in [`enforce.ts`](../../src/parse/enforce.ts) / `tokens.ts` marks or a rule; check it does not change `ul barl` (*since* + clause), which runs to the period.
- Constructions: new IDs need entries in [`constructions.ts`](../../src/parse/constructions.ts) with an anchor.
- After each grammar change: `npm run grammar-check` (no `GATE`, no LR(1) conflict, one tree per doc sentence), `npm test`, `npm run regloss-docs` (dry run first), `npm run build`.

**Tests** (`parse.test.ts`, `morph-gloss.test.ts`, `invalid-forms.test.ts`):

| Input | Expect |
|---|---|
| `zazawan dababol vugugel hugem bavahel vehahel val.` | popcorn on *cook* only |
| `dababol zazawan vugugel vagadel val.` | popcorn shared |
| `zazawan vugugel vagadel val dababol.` | popcorn shared |
| `zazawan hadehum vugugel varahal val.` | haste on *cook* only |
| `hadehum zazawan vugugel varahal val.` and `zazawan vugugel varahal val hadehum.` | haste shared |
| `zazawan bahaben vezebel bazawan vamol val.` | Ahaben hears *tell*, Azawan is paid |
| `zazawan vugugel vagadel val bahaben hahegem.` | shared recipient, then shared adverb |
| `h_15,30 zazawan vowogal varahal val.` | time covers both |
| a `/th/` or intention adverb between subject and first verb | whole claim, not an item word |
| `zazawan dababol vugugel vagadel val dabovul.` | rejected (rule 6) |
| `zazawan ul b_9 oel b_17 vowogal.` | from 9:00 to 17:00 on *walk* |
| `zazawan vowogal varahal val ul b_9 oel b_17.` | from–to covers both |
| `zazawan ul b_9 vowogal oel b_17.` | unchanged |
| `zazawan vowogal ul barl zalahen vezebal.` | unchanged (*since*) |

## Doc examples affected

A grep of morph lines for a `/d/`, `/b/` or `/h/` right before a verb fence found one example whose meaning changes: the join-across-roles.md popcorn example. The others are single-verb denials (`[v-memory | v-not]`), where the first item is the only item. Before editing, search the Agazan too (code spans in prose, tables, checkpoints, cheat sheets), for example with `node scripts/find.mjs`, since morph lines do not cover every example.

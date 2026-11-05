# Proposal: Same-role relation words (closed citation list)

**Status:** PROPOSED, not implemented. User decisions (2026-11-05): a **closed list**, never any lexicon word; the citation words take over **only the same-role job**. `/h/` / `/ɡ/` relation words keep their clause and noun jobs (`habam blarl …` *before* between clauses stays).
**Related:** [hooks.md](../grammar/beginner/hooks.md) (same-role `A HOOK B`), [relations.md](../grammar/beginner/relations.md), [dependents.md](../grammar/beginner/dependents.md#hinges), [sentence-linkers.md](../grammar/intermediate/sentence-linkers.md#sentence-linkers), [word-endings.md](../grammar/beginner/word-endings.md#citation-forms), [`data/lexicon-overlays.csv`](../../data/lexicon-overlays.csv), [`src/parse/sentence-parser.ts`](../../src/parse/sentence-parser.ts) (`citation` rule in clause units, ~line 702), [unassigned-reserved.md](../meta/unassigned-reserved.md), [design-decisions.md](../meta/design-decisions.md).
**Design authority:** this proposal changes grammar. Once implemented, the grammar pages own the result and this file is deleted.

## Problem

1. **The parser reads more than the docs teach.** A bare citation inside a clause body parses today with no error (`zazozon vowurol azozol.`, `citationFallback`, "names, filling no slot"). No page teaches that reading.
2. **Hooks have three jobs, but content roots reach only two.**
   - **Discourse glue:** the `/x/` sentence linkers (`xahom`, `xezem`, …) are a closed list of content roots.
   - **Extra noun:** the `/h/` / `/ɡ/` relations and hinges (`hewem bl…`, `habam bl…`) are a closed list of content roots.
   - **Same role** (`A HOOK B`, B keeps A's role letter): only the four vowel hooks (`al` / `ol` / `el` / `ul`) and the ranges. No content root can relate two members of one role.
3. **English *A before B*, *A like B*, *walks while singing* need a whole second clause today.** The second clause has to restate what the two share: `zazozon vowurol habam blarl zahelan vowurol.` *Azozon walks before Ahelan walks.*

## Proposal

A **closed list** of relation roots may stand in a clause as a **citation**: root + ending, with no role letter. Placed between two phrases in the **same role**, it works like a same-role hook:

```text
A CITE B
```

- **B keeps A's role letter.** B is a co-member of A's slot, in the same event.
- **The relation word's spelling, minus the role letter.** `habam` → **`abam`**, `hewem` → **`ewem`**. The ending stays the relation's own (`ewem` *like*, `ewel` *exactly like*). It does not take the hook's closed / open **-l** / **-m** meaning. See [open questions](#open-questions).
- **Same-role only.**
  - A citation-list word at the start of a sentence is still a fragment answer or greeting, never discourse glue. Glue stays with the `/x/` linkers and the fronted vowel hooks.
  - A citation-list word followed by `/b/` is not an extra noun. That job stays with `/h/` / `/ɡ/` + `bl-`.
- **Any other citation in a clause body has no reading.** That includes a listed word that lacks a same-role phrase on each side. The parser rejects it (log as **closed** in unassigned-reserved). This retires the untaught `citationFallback` reading inside clauses. Citations outside a clause (lists, headings, greetings, fill answers, `alon golowon`) do not change.
- **Shape never collides with hooks.**
  - Vowel hooks are V(V) + ending: two or three letters.
  - A citation is a three- or five-letter root + ending: four letters or more, with a consonant inside.
- **Storage:** new rows in `lexicon-overlays.csv`, on the existing published row, with a new `pos` value for same-role citations. Each row has its own `gloss`. The overlay table is the closed list.

### Candidate list

Each candidate is the same-role face of an existing relation. The **clause** form below is today's way to say it, and it stays.

| Citation | From | Same-role reading | Example | Today (stays) |
|---|---|---|---|---|
| **`abam`** | `habam` *before* | A ahead of B, both in the role | `zazozon abam zahelan vowurol.` *Azozon walks before Ahelan.* · `zazozon vowurol abam vazuvol.` *Azozon walks before swimming.* | `zazozon vowurol habam blarl zahelan vowurol.` |
| **`alam`** | `halam` *after* | A after B | `zazozon dedudal alam dogudal …` *tea after coffee* | `halam blarl …` |
| **`erom`** | `herom` *during / while* | A and B at the same time | `zazozon vowurol erom vazuvol.` *Azozon walks while swimming.* | `herom blarl zazozon vazuvol` |
| **`ewem`** / **`ewel`** | `hewem` / `hewel` *like* | A, like B: B fills the same role too, as background | `zazozon ewem zahelan vowurol.` *Azozon, like Ahelan, walks.* | no same-role form; `hewem bl…` is manner (*walks like a duck*) |
| **`ovam`** | `hovam` *so that* | the first verb aims at the second, same subject | `zazozon vowurol ovam vezuvel.` *Azozon walks in order to sleep.* | `hovam blarl zazozon vezuvel` |
| **`ahom`** | `hahom` *so (result)* | the first verb leads to the second, same subject | `zazozon veruvol ahom vezuvel.` *Azozon runs and so sleeps.* | `hahom blarl …` |
| **`arum`** | `harum` *until* | the first verb lasts until the second | `zazozon veruvol arum vezuvel.` *Azozon runs until falling asleep.* | `harum blarl …` |
| **`anem`** | `hanem` *on behalf of* | A fills the role for B; B is the one notionally in it | `zazozon anem zalazun vezuyol.` *Azozon speaks for Alazun.* | `hanem blalazun` |
| **`ezem`** | `hezem` *despite*; `xezem` *however* | A, unlike B (contrast between two members) | `zazozon ezem zahelan vowurol.` *Azozon, unlike Ahelan, walks.* | `gewem blahelan gul` (nouns only) |

Strongest: `abam`, `alam`, `erom`, `ewem`, `ovam`. Weaker: `arum`, `ahom`, `anem`, and `ezem`, whose same-role reading shifts from *despite* to *unlike*. User call on each.

### Not on the list

- **Places** (`hedam` *between*, `hohom` *across*, `hevam` *around*, gravity, `haham` *origin*). B is a landmark, not a co-member of A's role. *Strictly between* two same-role members is already a range hook.
- **Exchange** (`heham`). The counter-item does not fill A's role.
- **As-of, deadline, because** (`henam` / `hunom`, `huvahum`, `thahum`). These are clause-level or time-anchored, with no natural same-role reading.
- **Join-relations** (`han`, `huan`, …). Without its role letter, each one is already a vowel hook spelling.

## Open questions

1. **Endings.** Does the citation keep the relation's ending (`ewem` / `ewel`), or does the ending switch to the hook's closed / open meaning (`abal` *strictly before B*, `abam` *before B and maybe others*)? Recommendation: keep the relation's ending, so the word is learned once.
2. **How far A reaches.** Is it the nearest same-role phrase, as with the vowel hooks? Do the two sides need to match: verb with verb, noun with noun?
3. **Fill questions.** May B be a blank (`zazozon abam zar vowurol?` *before whom?*)? Recommendation: yes, by the ordinary rules.
4. **Two citations as a fragment answer** (`azozon ewem ahelan.`). Allow this, since both sides lack a role letter alike, or not?
5. **Overlap with joins.** `abam` / `alam` say the same order as the `zaol` *then* join and the planned `aol` *in turn* (`range-series.md`). A second way is fine. The page needs one Compare-with line: the join lists members in order, while `abam` makes B the background.
6. **Teaching stage.** This could follow beginner [hooks](../grammar/beginner/hooks.md), as a new intermediate sitting after the [hinges](../grammar/beginner/dependents.md#hinges) are taught.

## Related gaps (separate from this proposal)

No form exists yet for spatial *past* (*walks past the house*), *opposite* / *across from*, or *beyond* as *on the far side of*. *Along* and *up / down the hill* are only approximate. These are landmark relations (`/h/` + `bl-`), not same-role. Log them separately.

## Implementation plan

1. Add overlay rows and a classify reading for same-role citations. Replace the clause-body `citation` unit with a same-role rule that is valid only between same-role phrases.
2. Make the parser reject any other citation in a clause body, with a new construction. Add an unassigned-reserved row (**closed**) and a design-decisions row (reason: a bare word fills no slot, and only the closed list relates two slot members).
3. Grammar: a new sitting (or an H3 on relations) with examples and Practice, a Compare-with line on hooks and dependents, recipe rows in `english.md` / `say-*.md`, and the cheat sheet (`npm run cheat-sheet-blocks -- --write`).
4. Run `npm run grammar-check`, `npm run build`, and `npm test`. Add morph glosses (e.g. `before`, `like`), English-helper cases, and run `npm run english-helper-recall -- --check`.

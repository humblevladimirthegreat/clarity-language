# Proposal: tag pronouns

**Status:** PROPOSED (not current language). Grammar today: short reference is a [role pointer](../grammar/pronouns.md#role-pointers), a [whole-stem resume](../grammar/pronouns.md#resume-r), an [ordinal pronoun](../grammar/pronouns.md#ordinal-pronouns) for names, or the [topic pronoun](../grammar/pronouns.md#topic-pronoun). This proposal adds tag pronouns and **removes ordinal pronouns**.  
**Related:** [pronouns.md](../grammar/pronouns.md), [phonology.md](../grammar/phonology.md#number-word-exception) (role letter + consonant), [numbers.md](../grammar/numbers.md#number-endings) (rank **-r** on `/z/` `/d/` `/b/`), [joins.md](../grammar/joins.md) (list fences), [design-decisions.md](../meta/design-decisions.md) (D-18, D-24)  
**Design authority:** none until absorbed.

## Motivation

Each current system picks its referent by a rule the speaker does not control:

| System | Picks by | Fails when |
|--------|----------|------------|
| Whole-stem **-r** (`zodogar`) | latest word with that stem | a second dog has appeared, and you mean the first; the stem is a long compound |
| Role pointer (`zaxar`) | latest sentence with someone in that part | the referent has changed role, or someone newer took the part |
| Ordinal (`zrewor`) | order of first naming | the referent is not a name; many names make the count hard |
| Topic (`zozan`) | the one topic | you need a second tracked referent |

Missing: a short, role-independent handle for **any** referent, chosen by the speaker, resolved by lookup and not by recency or counting. Sign languages do this with spatial loci; logic and code do it with variables (*let A be a dog*). It also gives Agazan a way to say hypotheticals with placeholder people (*suppose A tells E*), which today need `unan` and role pointers.

## Proposed forms

A **tag word** is a role letter, then **`w`**, then a tag vowel, then an ending. The four vowels are four tags, named by the vowel's [letter name](../grammar/phonology.md#letter-names): A, E, O, U.

| Form | Shape | Meaning |
|------|-------|---------|
| `zodogal zwal` | noun phrase, then tag + **-l** in the same role | *a dog, call it A* (assign) |
| `zwal` (no noun phrase before it) | tag + **-l** alone | *someone A*: a new unnamed referent |
| `zwar` / `dwar` / `bwar` | tag + **-r** | *A*, in that role |
| `zwam` / `dwam` / `bwam` | tag + **-m** | *what A did*: A's part in the latest event A took part in (a [share](../grammar/pronouns.md#share)) |
| `zwarx` | **-r** + **-x** | *A and associates* |

The other tags follow the same pattern: `zwel` / `zwer` / `zwem`, `zwol` / `zwor` / `zwom`, `zwul` / `zwur` / `zwum`.

> `zodogal zwal dugugol dwel vahahal. zagadul dwar vahahal. zwar vowogal.`
>
> [z-dog | z-tag.A] | [d-cookie | d-tag.E] | v-see . z-cat | d-←tag.A | v-see . z-←tag.A | v-walk
>
> "A dog (A) sees a cookie (E). A cat sees A. A walks."

The last `zwar` is still the dog, though the cat is the newer doer. `zaxar` would pick the cat.

> `zwal bwel vezebel. zwer dugugol vagadel.`
>
> z-tag.A | b-tag.E | v-tell . z-←tag.E | d-cookie | v-eat
>
> "A tells E. E eats a cookie." (placeholder people, as in *suppose A tells E*)

> `zazawan zwal dalahen vabahel. zahaben dwam vahahal.`
>
> [z-Azawan | z-tag.A] | d-Alahen | v-punch . z-Ahaben | d-←tag.A.part | v-see
>
> "Azawan (A) punches Alahen. Ahaben sees what A did."

## Rules

1. **Assign.** A tag with **-l** directly after a noun phrase in the same role names that phrase (the noun with its `/ɡ/` describers, a name, a resume, or a role pointer). With no noun phrase before it, it introduces a new unnamed referent.
2. **Recall is the existing resume rule.** The stem of `zwal` is `wa`, so `zwar` is its whole-stem **-r**, and the latest `wa` word is the one that assigned the tag. No new lookup is needed.
3. **Reassign.** A newer `zwal` takes the tag over, by rule 2.
4. **Retro-tag.** Tagging works on a resume: `dodogar dwel` *the dog, call it E*.
5. **Lists.** Inside a join fence, each tag names the item right before it: `zodogal zwal zagadul zwel zam` *a dog (A) and a cat (E)*. A new tag listed with something else goes first: `zwal zodogal zam` *A and a dog*.
6. **Share.** Tag + **-m** names A's part in the latest sentence where A filled a participant part, in whatever role. It never assigns. It takes no **-x**, as a pointer share takes none. Unlike `zaxam`, which picks the event by role, `zwam` picks it by who.
7. **No fallback.** Ordinary **-r** falls back to *the one you both know*. A tag **-r** or **-m** with no assignment earlier in the conversation is not a sentence.
8. **Slots.** `/z/`, `/d/`, `/b/` only. `/y/` and `/x/` closed for the D-24 reason (a call or a topic return names the stem). On `/v/`, `/ɡ/`, `/h/`, `/w/`, `/th/`, open for the reason pointers are open there (these slots take no participant).
9. **Lifetime.** A tag lasts until it is reassigned or the conversation ends (goodbye). A topic change (introduce, return, clear) leaves tags alone; a new row in [what a topic change resets](../grammar/pronouns.md#topic-resets) says *no*. A quote keeps its own tags, as it keeps its own topic.

### Why tags survive a topic change

The other states reset for reasons tags do not share:

| State | Why it resets | Applies to tags? |
|-------|---------------|------------------|
| Role pointer anchors | *latest* gets unreliable over a long stretch | no: a tag is assigned explicitly, so distance does not blur it |
| Ordinal count (removed here) | keeps numbers small | no: four tags, and reassignment overwrites (rule 3) |
| Ambient magnitude | a new stretch starts back at ones | no: not a running default |

Placeholder reasoning (*suppose A tells E…*) often runs across a side topic and a return. Clearing tags at every `xavazem` / `xazawar` would force the speaker to retag everyone, which defeats the system. The cost is memory: a tag set long ago is still live. That is the speaker's choice, and reassigning ends it.

## Replace ordinal pronouns

Tags make [ordinal pronouns](../grammar/pronouns.md#ordinal-pronouns) redundant:

- **Speaker-invariance.** *2 sees 1* means the same from either speaker, but so does a name resume (`zazawar`): a name never shifts with the speaker, and the greetings that set ordinals already say the names.
- **Any role.** Whole-stem **-r** reaches a name in any role, and two people rarely share a stem, so recency never picks the wrong one.
- **Length.** `zrewor` is barely shorter than `zazawar`; `zwar` is shorter than both.
- **The one unique feature** is that ordinals need no assignment. That saves about a syllable, and costs the listener counting every name in order of entry.

Removing them:

- **Drops an exception.** A rank with **-r** on `/z/` `/d/` `/b/` reads like `gredur` again: `zredur` is *that second one again*, a resumed rank, not a person ([number endings](../grammar/numbers.md#number-endings)).
- **One system, not two.** Learners learn speaker-chosen tags only, not also automatic counting.
- **Less state.** No order of entry, no greeting rule, no topic exemption from the count, no `#0` hole.

### What goes

| Where | What |
|-------|------|
| [pronouns.md](../grammar/pronouns.md) | [ordinal pronouns](../grammar/pronouns.md#ordinal-pronouns) section; [ordinals count everyone else](../grammar/pronouns.md#topic-ordinals); the ordinal row of [what a topic change resets](../grammar/pronouns.md#topic-resets); the ordinals in the topic-pronoun examples (`zrewor dozan vezebel`, `zrewor vehahel`); practice items using `zrewor dredur` |
| [numbers.md](../grammar/numbers.md) | the person reading of rank **-r** on `/z/` `/d/` `/b/` ([number endings](../grammar/numbers.md#number-endings)); counting from the end on an ordinal pronoun (`zruewor`) |
| [spans.md](../grammar/spans.md) | names inside a cite or aside not counting toward an ordinal |
| [english.md](../grammar/english.md) | the ordinal half of the *the latter* / *the former* row (point it at tags) |
| [terminology.md](../grammar/terminology.md) | the ordinal pronoun entry (replace with tag pronoun) |
| [glosses.md](../meta/glosses.md) | the ordinal pronoun gloss row (`z-←2nd`); add tag glosses (`z-tag.A`, `z-←tag.A`, `z-←tag.A.part`) |
| [unassigned-reserved.md](../meta/unassigned-reserved.md) | the `#0` section; the D-24 `yredur` row (replace with `ywar`) |
| [design-decisions.md](../meta/design-decisions.md) | D-24: swap the ordinal for tags |
| Parser | `ordinal.bound`, `ordinalUnbound`, `ordinalSlot`; ordinal resolution and the topic exemption in `resolve.ts`; **-x** on a number (`numberPlural`) shrinks to plural labels only (`z_90x`). Keep the greeting / goodbye boundary in `resolve.ts`: rule 9 needs it. Tests in `resolve.test.ts`, `invalid-forms.test.ts`, `morph-gloss.test.ts` |

Ordinal **nouns** stay (*solution 2*, `g#2` *the second page*, [why-agazan](../grammar/why-agazan.md)); only the pronoun use goes.

## Why `w`

**Free and unambiguous.** Roots start with a vowel, so a consonant right after the role letter is always structural: `r` starts a [number word](../grammar/phonology.md#number-word-exception), and `gl-` is the lean adjective. The parser rejects `zwal` today, so nothing existing changes meaning. A tag word is a marker, not a root, so it needs no lexicon row and no hand-picked spelling.

**Short.** `zwar` is one syllable.

**A pattern learners can see.** *Consonant after the role letter: `r` is a number, `w` is a tag.*

## Left open

- Tag + **-n**. No job yet.
- Tagging the topic, `amago`, `ehodo`, `aha`, or the generic pronoun. Each already has one fixed form.
- Tags inside a dependent or an aside: whether an assignment there survives into the main sentence. Proposed default: yes inside a dependent (the same talk, as the topic resolves there); no inside an aside (asides give role pointers nothing to point back to, [spans](../grammar/spans.md)).
- A cue for **`w`**. The tag vowels carry no cue (they are letter names); `w` itself needs one.

## Costs

- **New onset clusters.** `zw`, `dw`, `bw` join the [legal clusters](../grammar/phonology.md#singability-constraints). Few clusters is a singability value; `bw` is unusual for English speakers, though easy to say.
- **Near the digit 1.** Tag O `zwor` shares the syllable `wo` with a rank such as `zrewor`. The `r` marker keeps them apart.
- **No automatic handle.** Without ordinals, nothing gets a short handle unless the speaker assigns one; names fall back to `zazawar`.
- **One reading lost.** `zodogal zwal zam` cannot mean *a dog and someone A* (rule 5 gives the workaround).
- **Planning.** The speaker must tag before recalling. Rule 4 softens this.
- **Inventory of four.** Enough for a stretch; more referents fall back to names, resumes, and pointers.

## Alternatives considered

- **Tag roots `aya` / `eye` / `oyo` / `uyu`.** The only `VCV` set free in all four vowels in the lexicon. Two syllables per tag, near neighbours (`aha` *we*, published `oye` / `oyu`), and hand-picked spellings, which [lexicon.md](../meta/lexicon.md) bans.
- **Tag + -m as a claim label** (*call this claim A*, then *A, so E*). Fits the rationality theme, but numbered points `x#N` with *as in (1) above* (`xrewor`) and the backward stand-in **-rth** already cover most of it. The share reading is the one a learner who knows `zaxam` would guess.
- **Number tags with the label marker** (`zodogal zrowol`, *call it 1*). No inventory limit, but `zrowol` already reads as *code 1 as subject*, and the speaker is back to tracking digits.
- **Keep ordinals beside tags.** Two systems for one job, with different rules (automatic count vs speaker-chosen label), for about one syllable saved.
- **Clear tags on a topic change.** Matches the other resets, but none of their reasons apply (see rule 9).
- **Others** (second topic, category pointers, clipped resume, count-back, same-subject marking, ordinals at first **-r**) cover less ground or cost the listener more; category pointers also run into D-18.

## Absorb sketch (if yes)

1. Parser: role letter + `w` tag family; rule 1 binding (including inside join fences); share resolution (rule 6); rules 7 to 9; slot rejections. Remove ordinal pronouns (see [what goes](#what-goes)).
2. [phonology.md](../grammar/phonology.md): add `zw` / `dw` / `bw` to the cluster list and the role-letter + consonant paragraph.
3. [pronouns.md](../grammar/pronouns.md) Intermediate: tag pronouns replace the ordinal pronouns section; topic-resets row (*no*); rewrite the examples and practice items that used ordinals.
4. Every other row of [what goes](#what-goes), in the same change.
5. [unassigned-reserved.md](../meta/unassigned-reserved.md): the open and closed rows above (and `w` after other role letters); [design-decisions.md](../meta/design-decisions.md): D-24 names tags.
6. Retire `-numbered pronouns can refer to -r` in [`TODO.md`](../../TODO.md): tags cover it.

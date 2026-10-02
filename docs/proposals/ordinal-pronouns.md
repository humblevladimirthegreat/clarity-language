# Proposal: ordinal pronouns

**Status:** PROPOSED (not current language). Grammar today: a rank number on **-r** with a digit resumes a previously stated rank (`g=#2`, spoken `gredur`, *that second one again*, [numbers](../grammar/numbers.md#digitless)). People are picked up by name or by content **-r** ([pronouns](../grammar/pronouns.md#resume-r)); *speaker* and *listener* are **`amago`** / **`ehodo`** ([special pronouns](../grammar/pronouns.md#special-pronouns)).  
**Related:** `role-pointer-pronouns.md` (role pointers and whole-stem resume), `topic-pronoun.md` (the topic pronoun), [numbers.md](../grammar/numbers.md#ordinals), [word-endings.md](../grammar/word-endings.md#greeting), [speech-moves.md](../grammar/speech-moves.md#vocative), [design-decisions.md](../meta/design-decisions.md) (D-13, D-17)  
**Design authority:** none until absorbed.

## Summary

A rank number on **-r** in a noun slot names a person **by order of introduction**: `z=#1` (spoken `zrewor`) is the first named referent in the conversation, as subject; `d=#2` (`dredur`) is the second, as object. Counting from the end works too: `z=#-1` (`zruewor`) is the most recently introduced. The same person keeps the same number in every role; only the role letter changes.

Greetings and calls count as introductions, so the people talking get numbers like anyone else. **`amago`** / **`ehodo`** stay for conversation roles.

## Motivation

Role pointers (`role-pointer-pronouns.md`) name a **slot**, so the same person changes pronoun as they change role. The topic pronoun (`topic-pronoun.md`) fixes only **one** referent. Ordinal pronouns give every named person a pronoun that never changes during the conversation and that tooling resolves with an index into a list.

They also reuse an existing form instead of spending roots:

- **The slot is free.** Restating a rank (`gredul` again) means the same as resuming it, since numbers are not referents you track. A search of the grammar docs (`node scripts/find.mjs --word 'family=number,ending=r,role=[zdb]'`) finds 13 number **-r** words in noun slots: count resumes (`drarer`), label resumes (`b=_#22,7`), and digitless blanks (`drar`). None is a rank resume with a digit.
- **The meaning is transparent.** `z#2` on **-l** is already *a second one* as subject. On **-r**, *the second one* by introduction.
- **The form is unmistakable.** A role letter followed by `r` is already how every number word is heard ([phonology](../grammar/phonology.md#phonotactics)).

## Proposed shape

```
ROLE-LETTER + re + DIGITS + r        written ROLE-LETTER=#DIGITS
ROLE-LETTER + rue + DIGITS + r       written ROLE-LETTER=#-DIGITS
```

On `/z/`, `/d/`, and `/b/` only (hosted `/b/` included):

| Spoken | Written | Meaning |
|--------|---------|---------|
| `zrewor` | `z=#1` | the 1st-introduced person, as subject |
| `dredur` | `d=#2` | the 2nd-introduced, as object |
| `brerer` | `b=#3` | the 3rd-introduced, in `/b/` |
| `zruewor` | `z=#-1` | the most recently introduced, as subject |
| `druedur` | `d=#-2` | the one introduced before that, as object |

Digits are the ordinary digit syllables (1 `wo`, 2 `du`, 3 `re`, …, [numbers](../grammar/numbers.md#beginner)). Counting from the end uses the existing end-relative marker `rue` ([numbers](../grammar/numbers.md)).

### What changes and what stays

Only **rank -r with at least one digit, on `/z/` / `/d/` / `/b/`** gets the new reading, forward and end-relative. Every other number **-r** keeps its meaning:

| Form | Stays |
|------|-------|
| count resume (`drarer` *that three again*) | yes |
| label resume (`b=_#22,7`) | yes |
| digitless blanks (`drar` *some number / how many?*, `z=#` *which place?*) | yes |
| rank resume on `/ɡ/`, `/h/`, `/w/`, `/th/` (*is that rank again*) | yes |
| *as in (2) above* on `/x/` (`x=#2`) | yes |
| special values and hyperbolic ranks on **-r** (`g=#e`, `g=#1e`) | yes |

### Cue

**re** ≈ order (the existing rank cue): the person's place in the order they entered the talk.

## Which referents get a number

1. **Names only.** A referent takes the next number at its first `-n` or `-nx` mention. Kinds (`-l` / `-m`) never take a number, so incidental things never use up numbers; they are picked up with whole-stem **-r**.
2. **Greetings count.** A greeting citation (`SELFn.`, [greeting](../grammar/word-endings.md#greeting)) introduces that name. In the usual opening, the first greeter is #1 and the one who answers is #2.
3. **Calls count.** A vocative name (`yalahen`, [vocative](../grammar/speech-moves.md#vocative)) introduces that name. This is how the listener gets a number when they do not greet back.
4. **One number per referent.** A later mention, or a whole-stem resume, does not renumber. A group name on `-nx` takes one number for the group.
5. **The whole conversation.** Numbers persist across turns and across speakers. They are shared by everyone in the conversation, which is what lets the same sentence mean the same thing from either speaker.
6. **Out of range is an error.** `z=#4` with only three names introduced is invalid. Tools never guess.

### Speaker and listener

Ordinals do **not** shift with the speaker; **`amago`** / **`ehodo`** do. After *Azawan* greets and *Alahen* answers, "#2 sees #1" means the same from either speaker: from Azawan it is *you see me*, from Alahen *I see you*.

> `zazawan.`
> `zalahen.`
> `zredur drewor vahahal.`
>
> Azawan
> Alahen
> z-2nd | d-1st | v-see
>
> "Azawan." "Alahen." "Alahen sees Azawan." (*I see you* from Alahen, *you see me* from Azawan)

Consequences:

- **Speaker-independent meaning.** A transcript without speaker labels still resolves, and reported speech needs no pronoun shifting (*Azawan said #1 walks* stays accurate when repeated).
- **Self-reference by name gets cheaper.** The grammar already prefers your own name to *I*, and D-13 keeps `amago` / `ehodo` long so names win. A 6-letter ordinal is shorter than `zamagon` (7), so the name-based habit is also the shortest. This supports distanced self-talk, which helps with emotion regulation.
- **`amago` / `ehodo` / `aha` / `una` stay** for what ordinals cannot do: names not yet known, writing to an unknown reader, generic *you* (*you turn left here*), the conversation role itself, addressing a group (`ehodo` + `-x`), and inclusive *we*.
- **#0 stays unassigned.** Introduction starts at 1, so `z=#0` could become a shifting *speaker*. That would undo D-13's deliberate length, so it is not proposed.

## Examples (proposed forms)

A person keeps one pronoun across roles:

> `zazawan dalahen vahahal. zalahen drewor vezebel. zrewor varahal.`
>
> z-Azawan | d-Alahen | v-see . z-Alahen | d-1st | v-tell . z-1st | v-run
>
> "Azawan sees Alahen. Alahen tells Azawan. Azawan runs."

The newest person:

> `zazawan vowogal. zahaben vehahel. zruewor vezebal.`
>
> z-Azawan | v-walk . z-Ahaben | v-sit . z-last-1st | v-sleep
>
> "Azawan walks. Ahaben sits. Ahaben sleeps."

## Interactions

| Area | Effect |
|------|--------|
| Role pointers (`role-pointer-pronouns.md`) | Unchanged. Pointers name slots and event participants, including things; ordinals name people. A pointer and an ordinal may resolve to the same person. |
| Topic pronoun (`topic-pronoun.md`) | Unchanged. The topic person also has a number, so has two valid pronouns. The topic pronoun follows whoever is topic; the ordinal stays with one person. |
| Whole-stem **-r** | Unchanged. Still the way to reach a kind, or a name more than nine introductions back where a multi-digit ordinal would be clumsy. |
| D-17 *the former / the latter* | Partly covered by `#-1` / `#-2`, but by **introduction** order, not most recent mention. The role pointer `o` covers *the other one* by mention. |
| D-13 | Unchanged. Ordinals are names by another route; `amago` / `ehodo` stay long. |
| [numbers.md](../grammar/numbers.md#digitless) | The rank-resume row narrows to non-noun slots; the noun-slot reading moves to pronouns. |
| [pronouns.md](../grammar/pronouns.md) | New section after the special pronouns: ordinal pronouns, with the greeting and call rule. |
| [word-endings.md](../grammar/word-endings.md#greeting), [speech-moves.md](../grammar/speech-moves.md#vocative) | Note that a greeting and a call introduce the name for ordinals. |

## Parser and tooling

- [`resolve.ts`](../../src/parse/resolve.ts): keep an ordered list of introduced names for the discourse, fed by `-n` / `-nx` content words, greeting citations, and vocatives. A rank **-r** number with digits on `/z/` / `/d/` / `/b/` binds by index (forward or from the end) instead of matching an earlier number. Today those forms are rejected with "a number -r needs an earlier number to match"; the new error is "no Nth name introduced".
- Number resume on other role letters keeps its current matching.
- Morph gloss: `1st`, `2nd`, `last-1st` (or `←#1`, `←#-1`; settle in [glosses](../meta/glosses.md)).

## Considered and rejected

| Option | Why not |
|--------|---------|
| Medal-root overlays (`ogoda` / `ezeve` / `abazo` on **-n**) | Good cue, but 7 letters: no shorter than a name. |
| Medal roots respelled to three letters | 5 letters, but spends three scarce short roots, and is limited to three people. |
| Number first, role letter last (`wod`) | 3 letters, but breaks role-letter-first parsing (joins, hosting, glosses), misleads the listener (`duz` starts like an object), and ends words in stops, against audible word edges. |
| Vowel first (`od`) | Avoids the misleading onset but still breaks role-letter-first and word edges. |
| Ordinals replacing `amago` / `ehodo` | Ordinals do not shift with the speaker, and cannot cover unknown names, generic *you*, or groups. |
| `#0` as *speaker* | Would make *I* short, against D-13. |

## Open questions

1. **Which names count.** Rule 1 counts every `-n` name, including places, shops, and titles (`yagavon`). Should only people count, and if so, by what visible mark (for example, only names in greetings, calls, and `/z/`)?
2. **Associates.** Can an ordinal take **-x** (`zreworx`, *that one and associates*), as **-rx** does on content words? Word-final `-rx` is a legal cluster; numbers do not take **-x** today.
3. **Conversation boundary.** What ends a conversation and resets numbering: a goodbye greeting, a new heading, a new written text?
4. **Reintroduction.** If someone leaves and returns, do they keep their number? The proposal says yes (one number per referent per conversation).
5. **Large casts.** Past nine, ordinals take two digits (`z=#10`). Fine for tools; should style advice say to use names past a handful?

## Non-goals

- A shifting short *I* / *you*.
- Ordinals for kinds or things.
- Changing count, label, or non-noun rank resumes.
- Teaching any of this on grammar pages while it stays a proposal.

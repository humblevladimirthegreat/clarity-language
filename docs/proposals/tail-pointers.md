# Proposal: tail pointers (`PwV` + tail + ending)

**Status:** PROPOSED (not current language).  
**Related:** [pronouns.md](../grammar/pronouns.md#resume-r) (whole-stem **-r**), [§ role pointers](../grammar/pronouns.md#role-pointers), [§ tag pronouns](../grammar/pronouns.md#tag-pronouns); [compounds.md § root tails](../grammar/compounds.md#root-tails), [§ tail suffixes](../grammar/compounds.md#tail-suffixes), [§ lexical compounds](../grammar/compounds.md#lexical-compounds); [phonology.md § word edges](../grammar/phonology.md#word-edges); [design-decisions.md](../meta/design-decisions.md) D-18, D-24.  
**Design authority:** none until absorbed.

A **tail pointer** is a short resume that finds its antecedent by the last two letters of the **stem** (the root tail), then uses the same ending contrast as role pointers and tags. It does **not** copy the antecedent's ending, and it is not a kind-class *he* / *it*.

## Form

```
role + w + pointer vowel + tail + ending
```

`w` after the role letter is already the marker that the rest is not a root ([tag pronouns](../grammar/pronouns.md#tag-pronouns)). A tag is `w` + vowel(s) + ending (`zwar`, `zwaer`). A tail pointer keeps one pointer vowel, then a two-letter tail, then the ending (`zwahar`). Phonotactics need that vowel: `w` cannot sit against the tail consonant.

| Piece | What it is | Example in `dwahar` |
|-------|------------|---------------------|
| role | slot **now** (`/z/` `/d/` `/b/` only) | `d` |
| `w` | not-a-root marker | `w` |
| pointer vowel | which match | `a` latest |
| tail | last two letters of the antecedent's **stem** | `ha` |
| ending | same jobs as on a role pointer | **-r** the same one |

Bedroom `obahoha` ends in tail `ha`. After `zuzozen dobahohal vawebol`, `dwahar` is that bedroom as object.

The shape does not collide with tags: a tag never has a consonant between its vowel and its ending.

## What it matches

Take the most recent **earlier** content word whose stem ends in those two letters. Drop the role letter and the ending before comparing. Search leftward, across sentences, turns, and topic changes, the way whole-stem **-r** does (not the way a role pointer stops at a topic change). A quote keeps its own matches, as it keeps its own tags.

A compound keeps its **head's** tail, so this is resume-by-head-shape:

| Antecedent | Stem tail | Pointer (latest, same one, object) |
|------------|-----------|--------------------------------------|
| `dobahohal` *a bedroom* | `ha` | `dwahar` |
| `dayabaha` *a bathroom* | `ha` | `dwahar` |
| `dahuyayol` *a friend* | `yo` | `dwayar` |
| `dubedaxuyudal` *peanut butter* | last root's tail | that head's tail |
| `zaxuduyel` *someone who teaches* | the verb root's tail | that tail |

The tail is only the **search key**. It is not the kind of a new instance (see **-l** below).

**Not an antecedent:** another pronoun (tag, role pointer, special / generic / topic, a tail pointer), a number word, a restrictor, an act word, ability (`root` **`x`** vowel, stem ends in `xV`), or any stem whose last two letters are not a kind consonant plus a job vowel.

**No fallback.** A tag **-r** with no assignment is not a sentence. A tail pointer with no earlier match is not a sentence. It does not mean “the `ha` thing you both know.”

## Pointer vowels

Same series as role pointers, minus **`u`**.

| Vowel | Job | Example |
|-------|-----|---------|
| **`a`** | the latest match | `dwahar` the latest `ha` stem |
| **`o`** | skip that one; the next earlier match | `dwohar` the other `ha` stem |
| **`e`** | the latest match **in this sentence** | `dwehar` |

**`u`** (unsaid) has no spelled stem, so no tail. No reading.

**`o`** is the one that earns the extra vowel: two bedrooms, or a bedroom then a bathroom, without having tagged them.

## Endings

The ending is **not** part of the match. It does the same jobs as on a role pointer or a tag.

Once the match **A** is found:

| Ending | Job |
|--------|-----|
| **-r** | the same referent as A |
| **-l** | a **new** instance of **A's whole stem**, not of every word with A's tail. After a bedroom, `dwahal` is another bedroom. After a bathroom, it is another bathroom. Same rule as `duxal` copying the noun, not the role |
| **-m** | A's part in the latest earlier event A took part in (a [share](../grammar/pronouns.md#share)) |
| **-n** | same referent, and A was a **-n** word. If A was a kind, a placeholder, or a mixed group, not a sentence. Same extra claim as `zwan` |

**-x** only on **-r** and **-n**, as on tags: `zwaharx` is that one and associates. No **-x** on a share or on **-l** (tag a plural phrase instead, or write the new plural out).

No stand-in endings (`zwaharl`). No **-rl** / **-rm** in the first cut; pin the sense on a whole-stem resume if both senses of A's stem are in play.

## Where it may sit

`/z/`, `/d/`, `/b/` only, like a tag. A call or a topic return names the stem (`yobahohar`, `xobahohar`), so no `/y/` or `/x/` (D-24). No `/v/` `/ɡ/` `/h/` `/w/` `/th/`: those recasts already use whole-stem **-r**.

A tail pointer already has a short form, so it takes no tag. A tag, role pointer, or special / generic / topic pronoun is not an antecedent, so you cannot point at one by tail either.

## Why this version, not last-three-including-ending

The sketch that copies the last three letters (`PwVCVN` matching `CVN`) would put **-l** on a pronoun that means “that same bedroom.” Every other family uses **-l** for a new instance. Matching the tail only, and keeping the ending contrast, avoids that.

Copying the ending also cannot say “another bedroom” vs “that bedroom” without a second device. Here **-l** / **-r** already do that, and they copy A's **stem**, so two `ha` rooms of different stems do not collapse into “another place.”

## How to teach it (if absorbed)

Copy letters, do not name a class. The cue is: the last two letters of the stem you already said, plus the pointer vowel and ending you already know.

Do **not** gloss `zwayar` as *the person* or `zwazor` as *the animal*. That would be a short pronoun split by encoded kind, which D-18 refused. The optional mnemonic from [root tails](../grammar/compounds.md#root-tails) can wait until Advanced; nothing in the pointer **reads** kind or job.

Compounds.md would then drop “nothing in a sentence reads it.” The grammar that reads the tail is this pointer, and it reads **letters**, not the kind chart. The chart stays a memory aid.

Stage: Advanced on [pronouns.md](../grammar/pronouns.md), after tags. Beginner/Intermediate keep whole-stem **-r**, role pointers, and tags.

## When to reach for it

| Job | Prefer |
|-----|--------|
| Same thing, still the latest in that role | role pointer (`duxar`) — shorter |
| Long stem, you can mark it once | tag (`dobahohal dwal`, then `dwar`) — four letters after that, and unique while two `ha` things are in play |
| Long stem, not the latest in its role, unique in its tail right now, no tag yet | tail pointer |
| Two of the **same** stem | whole-stem **-r**, a tag, or pointer **`o`** if they are the only two of that tail |
| Two of the same tail, different stems (bedroom then bathroom) | pointer **`o`**, or tags |

Tags stay the right tool for “two of the same kind.” Tail pointers skip the assignment when the recent tail-bin is unique.

Length (object, same one): `duxar` 5, `dwar` 4, `dwahar` 6, `dobahohar` 10. The win is against whole-stem resume of a listed or **`x`** compound, not against a role pointer or a tag you already assigned.

## Crowding

There are 48 tails, badly skewed. Across published roots plus listed compounds, a first-mention **-l** word ending in `dal` is one of 206 rows; `hal` 131; `yal` 86. In a food- or people-heavy stretch, **`a`** is only as good as “the latest one in a large bin.” That is acceptable because **`o`**, tags, and whole-stem **-r** still exist, and because a miss (no match, or the wrong match) is audible: the listener copies letters, not a guess at *it*.

Do not add more letters to the key (size vowel, last four of the word). On a tail-suffix word those extra letters are the left root's last vowel, not a size, so the key would not mean one thing.

## Parser sketch

After a role letter, `w` starts this family or a tag:

- `w` + one or two vowels + ending → tag (including pairs)
- `w` + one vowel `a` / `e` / `o` + kind consonant + job vowel + ending → tail pointer

Reject `u` as the pointer vowel; reject other slots; reject stand-in endings; reject **-x** on **-l** / **-m**; reject a tag on a tail pointer; reject an unmatched **-r** / **-m** / **-n** (and **-n** when the match was not a name). Same topic/quote isolation as tags for not looking into a quote, and the same leftward search as whole-stem **-r** for looking across a topic change.

Morph gloss (proposed): `d-←ha` / `d-←ha.other` / `d-←ha.self` / `d-←ha.new` / `d-←ha.part` / `d-←ha.name` — the tail letters, never the referent and never *person* / *place*.

## Absorb sketch (if yes)

1. Keep a few dialogues where `dwahar` is the clear choice (role pointer would pick someone else, and a late tag is clumsier). If those are hard to write, do not absorb.
2. [pronouns.md](../grammar/pronouns.md) Advanced: the table, the match rule, the ending rule, one **Compare with** tags and one with role pointers.
3. [compounds.md](../grammar/compounds.md#root-tails): one line that a tail pointer copies the letters; the kind chart still does not feed the parser.
4. [unassigned-reserved.md](../meta/unassigned-reserved.md): the rejected cells (`u`, other slots, stand-in endings, tag-on-pointer).
5. Parser + morph gloss + cheat-sheet block for people-pointing, in the same change as the grammar page.

## Not in this proposal

- Matching the word ending, or last-three `CVN`
- A free “the person / the place” reading with no antecedent
- Pointer vowel **`u`**
- Use on `/v/` `/ɡ/` `/h/` or as a call / topic return
- Making the kind/job chart grammatical for any other form

# Proposal: `bl-` marks a hosted extra noun

**Status:** PROPOSED (not current language).  
**Related:** [clause.md § extra nouns](../grammar/clause.md#extra-nouns), [§ left-bound adjectives](../grammar/clause.md#left-bound-adjectives); [relations.md](../grammar/relations.md); [hooks.md § extra noun](../grammar/hooks.md#extra-noun); [dependents.md § poles](../grammar/dependents.md#poles); [pronouns.md § tag pronouns](../grammar/pronouns.md#tag-pronouns); [numbers.md](../grammar/numbers.md); [knowing.md § forecasts](../grammar/knowing.md#forecast), [§ dated channel](../grammar/knowing.md#dated-channel); [phonology.md § phonotactics](../grammar/phonology.md#phonotactics), [§ singability](../grammar/phonology.md#singability-constraints); [unassigned-reserved.md](../meta/unassigned-reserved.md) (lean `l` on `/b/`; unused onset `bl`); [design-decisions.md](../meta/design-decisions.md) D-22, D-43, D-45, D-46.  
**Design authority:** none until absorbed.

A `/b/` extra noun that **completes** a `/ɡ/`, `/h/`, or `/th/` host takes **`l` as the second letter** (`bl-`). A plain `/b/` word is who receives. Hosting is no longer inferred from sitting right after `/ɡ/` `/h/` `/th/`.

## Problem

`/b/` has two jobs and one spelling. Today the hosted job wins whenever `/b/` sits right after **any** `/ɡ/`, `/h/`, or `/th/` word, even a word with no complement job ([clause.md](../grammar/clause.md#extra-nouns)). The listener goes by position, not meaning. That keeps one tree from role letters alone, and it also produces **empty hosting**: `gunemul bolazun` completes *angry*, which has no taught reading.

Adjectives already sit on the noun, and adverbs and stances may sit anywhere, so a recipient is one misplaced word away from the wrong tree. The beginner drills, [family names](../grammar/word-endings.md#multipart-names), and D-45 (`slotlessHost`) are the same trap. D-44 says order carries no extra meaning, so “put the recipient after the verb” is a safety patch, not a rule.

Optional-slot hosts (PATTERN, permission, similative, …) stay dangerous even if hosting is limited to a host inventory: a following plain `/b/` still hosts.

## Form

```
b + l + (root / stand-in / pointer) + ending
```

Same slot as `gl-`: optional `l` after the role letter, then a vowel-initial stem ([phonology](../grammar/phonology.md#phonotactics)). `bl-` is **required** for the hosted job, not an order variant.

| Shape | Job | Example |
|-------|-----|---------|
| plain `/b/` | recipient (who gets what the verb passes on) | `varal bolazun` |
| hook + plain `/b/` | extra-noun landmark | `al bahehal` |
| `/ɡ/` `/h/` `/th/` + `bl-` | relation complement | `hewom bluzozen` |

Cue, after the rule: **l** ≈ lock (locked to the host before it). **Do not** reuse the `gl-` cue *lean ahead*. `gl-` is optional order on an adjective; `bl-` is a different job. Teach that contrast in the extra-noun lead.

### What takes `bl-`

- Ordinary complements: `bluzozen`, `bludozal`, resumes `bluzozer`
- Special and generic pronouns: `bluwon`, `blawan`
- Role pointers: `blaxar` (role vowel still follows `l`)
- Stand-ins after poles: `thahum blarl`; backward `blurl`
- Fill-ask after a relation: `hewom blar` (*like what?*)
- Every **member** of a hosted `/b/` list, not the join word: `hazam bludehal bluzedel bal`

`bar` after a **hook** stays `bar` (`ol bar` *where?*): the hook already marks the landmark.

### What does not

- Unhosted recipients, including after a finished pair (`hewom bluzozen bolazun`)
- Extra-noun hooks (`el`, `em`, `al`, `ul`, …)
- `/b/` join words (`bal`, `bam`, …)
- Rank-join time scale `zel bral` (a scale after a join, not a relation complement)
- `bl-` with no `/ɡ/` `/h/` `/th/` host: reject, parallel to `glNoNoun`

A `/w/` word still sits immediately before the host: `welazom hewom bluzozen`.

### Attachment (once `bl-` exists)

- Plain `/b/` after `/ɡ/` `/h/` `/th/` is the **recipient**, even if that word can take a complement (`hewom bolazun` = *similarly*, and Olazun receives; *like Olazun* is only `hewom bluzozen`).
- `bl-` after a word with **no** complement job is not a sentence (orphan lock).
- D-22 stays: a hosted complement is not licensed after `/z/` `/d/` `/v/` `/w/` (`bl-` does not create a new host class).
- D-43 stays: a `/b/` after `/y/` opens the body as a recipient; a call still does not take `bl-`.
- D-45: a measure amount or equative factor still takes no complement. Plain `/b/` after one is the recipient (the valid alternative in today’s `slotlessHost` tests). `bl-` there stays rejected.
- D-46: a **person** in `/b/` after WANT / PLAN / DECISION stays rejected as *whose intention*. A **time** in PLAN or a channel’s `/b/` is a complement (see numbers below). Plain `/b/` after WANT is the verb’s recipient (`thalem bolazun varal` = wants to pay Olazun).

## Why not the other fixes

| Alternative | Why not as the main rule |
|-------------|--------------------------|
| Host only if the previous word has a slot | Fixes empty hosting; optional-slot words still eat a following recipient |
| Parse-error on orphan contact (`slotlessHost` everywhere) | Loud, but the natural order stays illegal |
| Pin the recipient to the verb | Fights D-44; `varal hedurem bolazun` still hosts unless also banned |
| New role letter | Every consonant already has a job |
| Mark the recipient instead | Learners will still write a bare `/b/` next to an adjective |
| Complement before the host | Today’s safe order `bolazun hedurem` would become hosted |
| `i` = schwa in `bir` / `biw` (for numbers and tags) | No letter `i`; Latin `i` reads `/i/` not `/ə/`; `i` and `l` look alike as the two shapes of one mark; a schwa “only here” will leak ([phonology](../grammar/phonology.md#rhythm-and-stress)) |
| Unwritten schwa `/bɚl/` `/bəɹl/` (for numbers and tags) | Extra beat with no letter; `/ɚ/` hides `/r/`; cannot serve tags; the written beat is syllabic `l` ([below](#numbers-and-tags-syllabic-l)) |

## Numbers and tags: syllabic `l`

A number word puts `r` right after the role letter. A tag puts `w` there. A hosted number or tag writes **`l` first, then the marker**: `blr-` / `blw-`. The `l` is its **own beat**, a syllabic [l̩], so there is no three-consonant onset.

**Most hosted `/b/` words never need it.** Channel *three hours ago* is a **unit noun** in `/b/` and a `/ɡ/` amount (`thevum blagorum grurel`). Names, poles (`blarl`), and `blar` are `bl-` plus a vowel, one onset `/bl/`.

**Takes `blr-` / `blw-`**

| Plain today | Hosted | Job |
|-------------|--------|-----|
| `bral` / `brul` / `brubul` / `brabul` / `brabum` / `brubum` after a channel, PLAN, or stance as-of | `blral` / `blrul` / `blrubul` / … | digitless time offset |
| `henam b_#22,7`, `herem b_90x`, hosted digit-strings | `henam bl_#22,7`, `herem bl_90x` | date / label in `/b/` |
| `hewom bwar`, `thebam bwar`, `gorol bwer` | `hewom blwar`, `thebam blwar`, `gorol blwer` | tag as the whole complement |

Assignment after a hosted noun does not: `hewom bludozol bwal` (the tag sits after `/b/`, not after the host).

Worst line: `thubel blral blarl`, a hosted offset **and** a hosted stand-in in one clause.

`l` stays the second letter on every hosted `/b/`. The number / tag test reads the letter after an optional `l`: `blr` is a number, `blw` a tag, `bl` + vowel anything else.

### Speech

`l` between `b` and `r` / `w` is a syllable with no vowel letter: the end of *bottle*. `r` / `w` start the next beat as usual.

| Spelling | Citation IPA |
|----------|--------------|
| `bral` | `/bɹäl/` |
| `blral` (hosted *later*) | `/bl̩.ɹäl/` |
| `blrarel` | `/bl̩.ɹä.ɹe̞l/` |
| `bwar` | `/bwäɹ/` |
| `blwar` (hosted tag A) | `/bl̩.wäɹ/` |

- **Singable.** [l̩] can be held like a vowel; [rhythm and stress](../grammar/phonology.md#rhythm-and-stress) already asks the speaker to hold final `-l`. No syllable ends on a stop.
- **Spelling = sound.** The extra beat has a letter, `l`. No fifth vowel, no unwritten schwa, and `r` stays an onset rather than coloring a vowel.
- **Stress.** Tags stress the first beat (`/ˈbl̩.wäɹ/`). Number words keep stress on the last digit of each group, so the [l̩] beat is usually unstressed.
- **Learner slip.** A learner who says `[bəl.ɹäl]` collides with nothing: `ral` cannot start a word. Do not police it; cite [l̩].

Do not cite `/bɚl/`, `/bəɹl/`, `/blɚ/`, or syllabic `/ɹ/`.

### Rejected for this slot

| Alternative | Why not |
|-------------|---------|
| One onset `/bɹl/` `/bwl/` (`brl-` / `bwl-`) or `/blɹ/` `/blw/` | Two approximants in one onset; speakers insert a vowel anyway, so the cited sound would not be the spoken one |
| Written vowel `blo-` / `ble-` | A full extra syllable, and `blo` + `r…` reads as `bl` + a root in `or…`; needs a reserved prefix |
| Numbers and tags stay positional (`br-` / `bw-`) | Tags are pronouns, so a tag recipient after an adverb (`hewom bwar`) is the same accident `bl-` fixes |
| Mark the host (`hlewom bwar`) | Two host marks, easy to mix |

## Absorb checklist

Not design. Do this in the same change as the grammar if the proposal is taken.

- [clause.md](../grammar/clause.md#extra-nouns) extra-noun lead and beginner drills (pick-one / fix-it that currently punish recipient-next-to-`/h/` `/ɡ/`)
- [word-endings.md](../grammar/word-endings.md#multipart-names) family-name warning
- [relations.md](../grammar/relations.md), [dependents.md](../grammar/dependents.md), [knowing.md](../grammar/knowing.md), [intention.md](../grammar/intention.md), [sakes.md](../grammar/sakes.md), [hooks.md](../grammar/hooks.md) examples that show a hosted pair
- [phonology.md](../grammar/phonology.md) legal clusters (`bl-`); syllabic `l` in `blr-` / `blw-` with its IPA and the *bottle* cue; optional `l` after `/b/` in the shape table; the no-mid-word-coda row (the [l̩] beat is a nucleus, not a coda)
- [numbers.md](../grammar/numbers.md) digitless offsets (`blral` / `blrul`) and writing style (`bl_…`); [pronouns.md](../grammar/pronouns.md#tag-pronouns) hosted tags (`blwar`)
- TTS ([`src/tts/phonemes.ts`](../../src/tts/phonemes.ts)): `l` between `b` and `r` / `w` is a syllabic nucleus, not part of one onset
- [unassigned-reserved.md](../meta/unassigned-reserved.md): close lean `l` on `/b/` with this reading; close unused onset `bl`; keep other `Xl-` open
- D-22 / D-45 / D-46 notes if recipient-after-slotless-host is now grammatical
- Word parser: `bl` flag parallel to `gl`; number / tag test skips an optional `l` (`blr` number, `blw` tag); writing style `bl_` for hosted digit strings
- Sentence parser: `HostedB` from `bl-`, not from any `/b/` after `/ɡ/` `/h/` `/th/`; plain `/b/` there is unhosted
- Cheat-sheet generated blocks; `npm run build`; `npm run grammar-check` after parser rules
- Retie-safe examples: do not bulk-replace old `b` by hand across Markdown; list the hosted pairs for a dedicated pass

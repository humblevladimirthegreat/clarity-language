# Proposal: Role consonants in role compounds and pointers

**Status:** PROPOSED. Nothing here is implemented. It assumes the role-letter + **`w`** shape is free of kind indefinites, which `hooked-joins.md` retires; that proposal lands first or in the same change. Hooked joins share role letter + **`w`** with this proposal and with tags, without collisions (below).  
**Related:** [role compounds](../grammar/roles.md#role-compounds), [role pointers](../grammar/pronouns.md#role-pointers), [stacked pointers](../grammar/roles.md#stacked-pointers), [label scope on a role compound](../grammar/predication.md#scope-role), [extra-noun hooks](../grammar/hooks.md#extra-noun), [role letters](../grammar/clause.md#role-letters).

## Problem

Role compounds and role pointers pick a part of an event with a role vowel table of their own: **`a`** doer, **`u`** undergoer, **`e`** scene, **`o`** the extra `/b/` party, and then the pairs **`ae`** **`oe`** **`ua`** **`uo`** **`ao`** **`ue`**. Some of the pairs match a hook (**`ae`** / **`ael`**). The single vowels match nothing: elsewhere **`a`** is *in*, *this episode*, or *add*, never *the doer*. A learner has to memorize this table separately from everything else.

Agebon already has a letter for each part: the role consonant the participant had in its clause. The doer was `/z/`, the undergoer `/d/`, and the recipient or relation partner `/b/`. The new spelling names the part with that consonant. That frees the vowel to mean what the vowel series means everywhere else.

## The shape

| Form | Shape | Example | Gloss |
|------|-------|---------|-------|
| Role compound | role letter + **`w`** + V1 + part consonant + stem + ending | `zwazuduyel` | z-episode-agent-teach |
| Role pointer | role letter + **`w`** + V1 + part consonant + pointer vowel + ending | `zwazar` | z-episode-agent.same |

- **Role letter:** the word's slot **now**, as today.
- **Part consonant:** the slot the participant had **in the event**, or what that slot holds (table below).
- **V1:** label scope, on every part consonant: the same vowels written today after the **`th`** seam.
- **Pointer vowel and ending:** the same as today: **`a`** latest, **`e`** this sentence, **`o`** the other one, **`u`** unsaid; **-r**, **-l**, **-m**, **-x**.

A noun inside the stem keeps its mid-word **`x`** (`zwazudozoxowurel`, *someone who walks dogs*). The role compound itself loses its **`x`**. The closed part consonant right after V1 now marks the compound.

## Two rules for the part consonant

Each part consonant follows one of two rules:

- **The slot rule** (**`z`**, **`d`**, **`b`**): the participant that sat in that slot in the clause.
- **The content rule** (**`h`**, **`g`**, **`th`**, **`w`**, **`x`**, **`y`**, **`v`**): what that slot holds in a clause, said of the stem's event.

A consonant joins the system only through one of these rules, never because it is free.

| Consonant | Rule | Part | Today |
|-----------|------|------|-------|
| **`z`** | slot | the doer | `…ax…` |
| **`d`** | slot | whatever sat in `/d/`: what the event acts on, or what it brings into being | `…ux…`, `…ao…` |
| **`b`** | slot | the extra party with no hook: the recipient, or the other party of a relation | `…ox…` |
| **`h`** | content | the manner or circumstance: how, when, or where, as an adverb says it | new |
| **`g`** | content | the state the event leaves: a property it puts on a participant | new |
| **`th`** | content | the stance on the event: a reason, thought, or feeling about it | new |
| **`w`** | content | the extent of the event: how much of it there was | new |
| **`y`** | content | the speech move: the act of saying, apart from what was said | new |
| **`x`** | content | what follows: what the event leads to | new |
| **`v`** | content | the event itself (pointers only) | new |

Every role consonant is now a part consonant.

## V1: label scope

These are the vowels written today after the **`th`** seam ([label scope](../grammar/predication.md#scope-role)), moved to the front:

| V1 | Reach | Example | English |
|----|-------|---------|---------|
| **`a`** | this episode: one act is enough | `zwazuduyel` | *someone who teaches* |
| **`e`** | practiced role | `zwezuduyel` | *a teacher* |
| **`o`** | this pair: toward one party, named in a following `bl-` word | `gwozuduyel blolazun` | *is a teacher to Olazun* |
| **`u`** | a type across scenes | `zwuzuduyel` | *a teacher type* |
| pairs | the scope stacks: **`ao`**, **`ae`**, **`oe`**, **`ua`**, **`uo`**, **`ue`** | `gwuezuduyel` | *not in that capacity* |

Every role word must choose its scope. This supports one of the language's purposes: a single fight gives `zwazavuvul` (*someone who fought*), and calling someone *a fighter* (`zwezavuvul`) takes a separate, visible choice.

Scope also applies to pointers. `zwazar` is *the latest doer*. `zwezar` is *the latest doer, in their practiced role*: for example, after *Uzozen teaches*, `zwezar` is Uzozen as a teacher. With **-m** it gives a useful contrast: `dwazam` is *what they did (this time)*, and `dwezam` is *their practice, their craft*.

**Cost:** today a bare role compound leaves its reach unsaid. Under this proposal **`a`** takes that job, so *this time only* is no longer separate from *at least once*. That is acceptable. If a strict *only this time* is needed later, it can be a scope pair.

## Slot-rule parts

### The result is the `d` part

What an event brings into being sits in `/d/` in a clause (*Olazun builds a house*), so by the slot rule it is the **`d`** part. `dwadeguyel` is *a building*, and `dwadar` after *Olazun builds* is *what Olazun built*. Today's undergoer / result split was a fact about the verb, not about the slot: a verb's `/d/` is either what it acts on (*see*) or what it makes (*construct*), and the verb says which. A verb rarely has both. What a result is made from goes through the hook *out of*, not `/d/`.

**Cost:** no spelling marks *this did not exist before*. Today **`ao`** shows that contrast; under this proposal the stem carries it.

### Extra parties (`b`)

A recipient (`vezuyel bolazun` *tells Olazun*) and the other party of a relation (`gawom blolazun` *bound to Olazun*) are the **`b`** part, as they share **`o`** today. The stem says which one is meant: an action stem names its recipient, a relation stem its partner.

- `dwabezuyel` is *someone told*.
- `dwebezuyel` is *a confidant*, someone regularly told things (the practiced reach).
- `dwubezuyel` is *the type people confide in*.
- `dwabawol` is *someone one is bound to*.

`zwabar` is *the latest recipient or partner*.

### Hooked parts are not role compounds

Today's scene, instrument, goal, source, path, and bearer compounds (`…ex…`, `…aex…`, `…oex…`, `…uax…`, `…uox…`, `…uex…`) have no counterpart. A hooked landmark sits in `/b/` with a hook before it, so the slot rule would put it on **`b`** with the hook vowel as V1. That collides with the recipient, which has no hook vowel, and with scope. Every fix tried (a **`bl`** part for the recipient, merging the recipient into the goal) cost more than the forms are worth. Hook vowels fuse onto stems elsewhere instead (`hook-prefixes.md`).

What replaces each use:

| Use | Today | Instead |
|-----|-------|---------|
| a kind of place, tool, time | `dexezuvol`, `daexarayel` | an ordinary compound with a head root: `darayexuwal` *write + tool*, `dezuvoxadurel` *sleep + time*; common ones are dictionary words (*kitchen* is cook + `ha`) |
| the landmark a clause named | `dexar`, `daexar` | resume the landmark noun: after `al bahehal`, `dahehar` *that house* |
| the landmark as a place or means | `dexar`, `daexar` | the hook's own pointer: `ar` *in there*, `or` *there*, `aer` *with it*, `uor` *through there* ([point back](../grammar/hooks.md#hook-resume)) |
| a landmark nobody named | `dexar`, `daexur` | two sentences: *Olazun sees a place; the fighting was there* |
| the one who pays, the one it is for | `zuexurozum` | the hook in a clause (`uel`, `el` plus `/b/`), then a resume |

**Losses:** a short form for an unnamed landmark (*wherever it happened*, *whatever it was done with*), and person nouns for the bearer and beneficiary (*a theft victim*, *someone cooked for*). The bearer still has an exact clause form. A loose compound such as theft + person stays open between thief and victim.

## Content-rule parts

A content-rule pointer reads the latest event: if that clause has the matching word, the pointer is that word's content; otherwise it is the event's own, left unnamed.

### Manner and circumstance (`h`)

**`h`** names what an `/h/` adverb holds, said of the stem's event: how, when, or where it happened, as a quality of the event.

- `dwahavuvul` is *a way of fighting*.
- `dwehavuvul` is *someone's usual way of fighting* (the practiced reach).
- `dwuhavuvul` is *a fighting style* (the type reach).

If the latest clause has `/h/` adverbs, an **`h`** pointer is what they say together (`hedurem halozum`: *the haste and quiet of it*). Otherwise it is the event's own manner:

- `dwahar` is *the way it was done*.
- `dwahor` is *the other way*: the nearest earlier event whose named manner differs.
- `dwahur` is *however it was done*.

**Compare with:** a landmark is a thing (*the house*, *the knife*), reached by resuming its noun or with a hook pointer (`aer` *with it*). An **`h`** part is a quality of the event (*the haste*, *the lateness*): *how* is `dwahar`.

### The state the event leaves (`g`)

**`g`** names what a `/ɡ/` word holds, a property, said of the stem's event: the property the event puts on its participant.

- `dwaguguyel` is *how cooked it is*, its doneness.
- `dwagenamul` is *the injured state*, how hurt someone is.
- `dwegenamul` is *the state harm usually leaves* (the practiced reach).

A `/ɡ/` word in a clause describes something already there, not a result, so a **`g`** pointer always reads the event's own resulting state: `dwagar` is *the state it left them in*, and `dwagur` is *whatever state it left*.

*What state did it leave them in?* talks about an effect on a person without labeling the person.

### The stance on the event (`th`)

**`th`** names what a `/th/` word holds in a clause: something in a mind. Here it is in a mind **about the stem's event**, such as a reason for it, a thought about it, or a feeling toward it. It is a thing, not a person.

- `dwathavuvul` is *a reason to fight*, or *a feeling about fighting*.
- `dwethavuvul` is *the usual reason for fighting* (the practiced reach).
- `dwuthavuvul` is *the kind of motive that makes for fights* (the type reach).

The compound does not say whose mind holds it. To name the holder, use the [holder seam](../grammar/knowing.md#holder) in the next sentence.

- `dwathar` is *the reason for it* or *how it was felt*.
- `dwathor` is *the other reason*: the nearest earlier event whose named stance differs.
- `dwathur` is *whatever the reason was*.

**`th`** still names the event's reason when the event has no `/th/` word. That is the gap the spelling fills: *why did they do that?* gets a noun to talk about.

### The extent of the event (`w`)

**`w`** names what a `/w/` word holds in a clause: a degree. Here it is the degree of the stem's event, its size or intensity, as a thing you can talk about.

- `dwawavuvul` is *how fierce a fight is*, the amount of fighting.
- `dwewavuvul` is *the usual intensity of fighting* (the practiced reach).

- `dwawar` is *that much*, *how much it was*.
- `dwawor` is *the other amount*: the nearest earlier event whose named degree differs.
- `dwawur` is *however much it was*.

This lets a speaker hold an event's size apart from the event and talk about the size alone: *it was that much, not more*. Catastrophizing works by inflating the size, and here the size has its own noun to check.

### The speech move (`y`)

**`y`** names what a `/y/` word opens in a clause: a turn, a speech move. It is the act of saying something (the question, the command, the remark), as something someone did. **`v`** is the event a sentence describes; **`y`** is the turn that described it.

- `dwayavuvul` is *a remark about fighting*: a turn whose subject is the stem's event.
- `dweyavuvul` is *the usual remark about fighting* (the practiced reach), the stock thing people say about it.

A **`y`** pointer needs no stem; it reaches turns, not events:

- `dwayar` is *that remark*: the latest turn.
- `dwayor` is *the other remark*: the nearest earlier turn by someone else, or the one before the latest when one speaker is talking.
- `dwayur` is *whatever was said*: a turn known to have happened whose content nobody repeated.
- `dwayer` is *this very turn*, the one the pointer sits in. A statement can talk about itself (`dwayer` … *this sentence is short*), including the paradoxical *this statement is false*. The paradox is the speaker's to make, not a reason to ban the form.

With **-m**, `dwayam` is that turn's share: what the saying did, apart from what it said (*the remark landed as a jab*). This is the main use. Reacting to how something was said and not to what was said is a common source of conflict. A noun for the act lets a speaker say *I agree with what you said, but not with that remark*.

### What follows (`x`)

**`x`** names what an `/x/` linker hands on in a clause: the stretch that follows. Here it is what follows **from** the stem's event: the consequence, the aftermath, what it led to.

- `dwaxavuvul` is *what comes of fighting*.
- `dwexavuvul` is *what usually comes of fighting* (the practiced reach).
- `dwuxavuvul` is *the kind of consequence fights have* (the type reach).

If the next sentence after that event opened with a consequence linker (`xahem` *therefore*, `xahel` *it follows that*), an **`x`** pointer is that sentence's event:

- `dwaxar` is *what came of it*.
- `dwaxor` is *the other outcome*: the nearest earlier event whose named consequence differs.
- `dwaxur` is *whatever came of it*.

**Compare with:** **`g`** is the state the event leaves its participant in (hurt, cooked). **`x`** is what happens next because of it (a fight, then a feud). With **`th`** (the stance on it), **`h`** (how it went), **`w`** (how big it was), and **`g`**, **`x`** covers the event's whole arc. *And what came of it?* moves attention from the event to what it led to, which is basic consequential thinking.

### The event itself (`v`)

A **`v`** pointer reaches the latest event, whatever it was, without spelling its stem: `dwavar` is *that (event)*. A verb's own **-r** (`vavuvur`) still resumes one named stem; `dwavar` needs no stem, and pointer vowels work as usual (`dwavor` *the other event*, `dwavur` *the event whose kind was left unsaid*). Scope applies too: `dwevar` is *that, as a habit*. **`v`** forms no role compounds, because a stem plus **`v`** would just be the event noun (`davuvul`).

## Pointers: before and after

| Today | New | English |
|-------|-----|---------|
| `zaxar` | `zwazar` | *the latest doer* (as subject) |
| `duxar` | `dwadar` | *the latest undergoer* (as object) |
| `zoxar` | `zwabar` | *the latest recipient* |
| `daxer` | `dwazer` | *themself* |
| `zaxor` / `zaxur` | `zwazor` / `zwazur` | *the other one* / *whoever did it* |
| `duxal` | `dwadal` | *one (a new one like it)* |
| `daxam` | `dwazam` | *what they did* |
| `dexar` | resume the place, or `ar` / `or` | *the place (scene) of it* |
| `daexar` | resume the tool, or `aer` | *the tool of it* |
| `daoxar` | `dwadar` | *what it made* (the latest `/d/`) |
| (none) | `dwahar` | *the way it was done* |
| (none) | `dwagar` | *the state it left them in* |
| (none) | `dwavar` | *that event*, whatever it was |
| (none) | `dwathar` | *the reason for it, how it was felt* |
| (none) | `dwawar` | *that much* |
| (none) | `dwaxar` | *what came of it* |
| (none) | `dwayar` | *that remark* |
| (none) | `dwayer` | *this very turn* |

## Spelling and parsing

- **Length:** each form gets one letter longer (`zaxar` → `zwazar`, `zaxuduyel` → `zwazuduyel`).
- **Clusters:** the role letter + **`w`** cluster now opens every compound and pointer, including the first role word a beginner learns. Calling with `/y/` adds **`yw`** (`ywazobebun`, *calls the doctor*). A compound that itself fills a `bl-` slot opens with **`blw`**, which the [syllabic `l`](../grammar/phonology.md) already allows. The cluster list on [phonology](../grammar/phonology.md) grows to match.
- **No clash with tags or hooked joins:** a [tag pronoun](../grammar/pronouns.md#tag-pronouns) is role letter + **`w`** + V + ending, and a hooked join (`hooked-joins.md`) is role letter + **`w`** + join vowels + ending + hook vowels + ending. The part consonant is never **`l`**, **`m`**, **`n`**, or **`r`**, so the letter after V1 tells a compound or pointer from both. After an ending letter, a vowel starts a hooked join's hook; anything else ends a tag.
- **Hook prefixes take over the old shape:** `hook-prefixes.md` reuses role letter + vowel(s) + **`x`** + stem for hook prefixes, so the two proposals land together and every old role compound is respelled first.
- **Compound vs pointer:** after the part consonant, a pointer has one vowel and an ending, and a compound has a stem of at least three letters. One letter of lookahead decides which.
- **Repeated sounds:** `zwazar`, `dwadar`, and `bwabar` repeat a consonant. That is harmless, but it sounds different from today's pointers.

## What changes

- **Grammar:** rewrite [roles.md](../grammar/roles.md) (both levels; the vowel table and the separate pair sections become the consonant table plus the hook table), [role pointers](../grammar/pronouns.md#role-pointers) and the pointer sections after it, [scope on a role compound](../grammar/predication.md#scope-role) (scope moves to V1), and the phonology cluster list. Re-run the generated cheat-sheet blocks.
- **Design notes:** in `unassigned-reserved.md`, drop `zexor` / `zexol` / `zexom` and list **`v`** in a role compound as closed. The old pointer shape, role letter + vowel + **`x`** + vowel + ending (`zaxar`), is no longer claimed; list it as open. In `design-decisions.md`, add notes on why scope is required, and why hooked parts have no role compound (the losses above, and the recipient collision). Move the scene, instrument, goal, source, path, result, and bearer pointer examples on [roles.md](../grammar/roles.md) to resumes and hook pointers.
- **Code:** the role-compound and pointer rules in the parser, morph glosses (`z-agent-x-teach` → something like `z-episode-agent-teach`), the LLM prompt and construction notes, english-helper recipes, and the wizard content. Then run `npm run grammar-check`.

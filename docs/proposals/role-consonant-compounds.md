# Proposal: Role consonants in role compounds and pointers

**Status:** PROPOSED. Nothing here is implemented. It lands in two steps. **Step 1** retires the current [kind indefinites](../grammar/joins.md#kind-indefinites), which hold the role letter + **`w`** shape this proposal needs ([step 1](#step-1-retire-kind-indefinites)). It needs nothing from other proposals and comes first. **Step 2** is the rest of this page: role compounds and pointers move to role letter + **`w`**. The work lands as the phased commits in the [commit plan](#commit-plan); each commit ticks its box there.  
**Related:** [role compounds](../grammar/roles.md#role-compounds), [role pointers](../grammar/pronouns.md#role-pointers), [stacked pointers](../grammar/roles.md#stacked-pointers), [label scope on a role compound](../grammar/predication.md#scope-role), [extra-noun hooks](../grammar/hooks.md#extra-noun), [role letters](../grammar/clause.md#role-letters).

## Problem

Role compounds and role pointers pick a part of an event with a role vowel table of their own: **`a`** doer, **`u`** undergoer, **`e`** scene, **`o`** the extra `/b/` party, and then the pairs **`ae`** **`oe`** **`ua`** **`uo`** **`ao`** **`ue`**. Some of the pairs match a hook (**`ae`** / **`ael`**). The single vowels match nothing: elsewhere **`a`** is *in*, *this episode*, or *add*, never *the doer*. A learner has to memorize this table separately from everything else.

Agebon already has a letter for each part: the role consonant the participant had in its clause. The doer was `/z/`, the undergoer `/d/`, and the recipient or relation partner `/b/`. The new spelling names the part with that consonant. That frees the vowel to mean what the vowel series means everywhere else.

## The shape

| Form | Shape | Example | Gloss |
|------|-------|---------|-------|
| Role compound | role letter + **`w`** + V1 + part consonant + stem + ending | `zwazuduyel` | z-episode-agent-teach |
| Role pointer | role letter + **`w`** + V1 + part consonant + pointer vowel + ending | `zwazar` | z-←episode-agent.same |

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
| **`v`** | content | the event itself (pointers only); in a say word, someone over the act | new |

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

On a full compound with **-r**, V1 reads as it does on a pointer: `zwezuduyer` is *the one teaching, in their practiced role*. Pair scope **`o`** follows today's noun rule: it stands alone on `/z/`, `/d/`, and `/b/`, and takes its `bl-` party on `/ɡ/` and `/h/`.

**Scope is written once.** On a role word, scope is V1 and nothing else: a **`th`** scope after the stem (`zwazuduyethel`) has no reading. Ordinary roots keep the **`th`** seam, so [label scope](../grammar/predication.md#label-scope) teaches the same vowels in two places: after **`th`** on other words, and at the front of a role word.

**Scope and ability combine.** The [ability vowel](../grammar/intention.md#role-ability) stays at the end, after **`x`**. Today a role compound takes scope or ability but not both, because both sit after the stem. With scope at the front, both fit: `gwezuduyexal` is *can be a teacher, as a practice*.

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

### On `/h/`: capacity

A role compound with a slot part on `/h/` says the capacity someone acts in: *as a teacher*. A person can't be an adverb, so the compound names the role the act is done in. This fills the *as a teacher, I …* gap, which has no one-word form today.

> `zuwon vezuyel hwezuduyel.`
>
> z-speaker | v-tell | h-role-agent-teach
>
> "I'm speaking as a teacher."

V1 does its usual work. `hwazuduyel` is *as the one teaching this time*, `hwozuduyel blolazun` *as Olazun's teacher*, and `hwuezuduyel` *not as a teacher*, speaking off duty. The other slot parts work too: `hwedobebul` is *as a patient* (the one a doctor treats), and `hwebezuyel` *as a confidant*.

Consent is no longer a role compound: it becomes a [say word](#say-words-permission-requirement-consent). A say word is the pointer shape on `/h/`, and capacity is the compound shape, so the two never meet ([compound vs pointer](#spelling-and-parsing)).

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

A content-rule pointer reads the latest event. If that clause has a matching **content** word in the slot (one built on an ordinary root, not a closed word), the pointer is that word's content; otherwise it is the event's own, left unnamed. Structure decides which words count, so the resolver needs no word meanings.

### Manner and circumstance (`h`)

**`h`** names what an `/h/` adverb holds, said of the stem's event: how, when, or where it happened, as a quality of the event.

- `dwahavuvul` is *a way of fighting*.
- `dwehavuvul` is *someone's usual way of fighting* (the practiced reach).
- `dwuhavuvul` is *a fighting style* (the type reach).

If the latest clause has `/h/` content words, an **`h`** pointer is what they say together (`hedurem halozum`: *the haste and quiet of it*). Closed `/h/` words don't count: restrictors (`hal`), time poles (`herem blenulul`), [say words](#say-words-permission-requirement-consent), and pointers. Otherwise it is the event's own manner:

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

The state is the `/d/` participant's when the event has one, and the `/z/` participant's otherwise. After *Uzozen punches Olazun*, `dwagar` is Olazun's state; after *Uzozen runs*, it is Uzozen's. For anyone else's state, name them in a new sentence. `dwagor` has no reading: no clause names a resulting state for *the other* to differ from.

*What state did it leave them in?* talks about an effect on a person without labeling the person.

### The stance on the event (`th`)

**`th`** names what a `/th/` word holds in a clause: something in a mind. Here it is in a mind **about the stem's event**, such as a reason for it, a thought about it, or a feeling toward it. It is a thing, not a person.

- `dwathavuvul` is *a reason to fight*, or *a feeling about fighting*.
- `dwethavuvul` is *the usual reason for fighting* (the practiced reach).
- `dwuthavuvul` is *the kind of motive that makes for fights* (the type reach).

The compound does not say whose mind holds it. To name the holder, use the [holder seam](../grammar/knowing.md#holder) in the next sentence.

A **`th`** pointer reads the `/th/` content words of the latest clause: [sake words](../grammar/sakes.md), feeling roots, and [causation poles](../grammar/causation.md). The closed `/th/` words don't count: the [evidential channels](../grammar/knowing.md#evidentiality), MAY, the notional, and the holder. Those are the speaker's stance on the claim, not a stance on the event.

- `dwathar` is *the reason for it* or *how it was felt*.
- `dwathor` is *the other reason*: the nearest earlier event whose named stance differs.
- `dwathur` is *whatever the reason was*.

**`th`** still names the event's reason when the event has no `/th/` word. That is the gap the spelling fills: *why did they do that?* gets a noun to talk about.

### The extent of the event (`w`)

**`w`** names what a `/w/` word holds in a clause: a degree. Here it is the degree of the stem's event, its size or intensity, as a thing you can talk about.

- `dwawavuvul` is *how fierce a fight is*, the amount of fighting.
- `dwewavuvul` is *the usual intensity of fighting* (the practiced reach).

A `/w/` word never attaches to the event: it adds detail to the next `/ɡ/`, `/h/`, or `/th/` word. A clause never names the event's own degree, so a **`w`** pointer always reads the event's own extent, as a **`g`** pointer reads its own state:

- `dwawar` is *that much*, *how much it was*.
- `dwawur` is *however much it was*.

`dwawor` has no reading: no event names an amount for *the other* to differ from.

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

A **`v`** pointer reaches the latest event, whatever it was, without spelling its stem: `dwavar` is *that (event)*. A verb's own **-r** (`vavuvur`) still resumes one named stem; `dwavar` needs no stem, and pointer vowels work as usual (`dwavor` *the other event*, `dwavur` *the event whose kind was left unsaid*). Scope applies too: `dwevar` is *that, as a habit*. **`v`** forms no role compounds, because a stem plus **`v`** would just be the event noun (`davuvul`). On `/h/`, **`v`** names someone over the act in a [say word](#say-words-permission-requirement-consent).

## Say words: permission, requirement, consent

Today permission (`tholem`), prohibition (`thegum`), and requirement (`thonam`) are `/th/` stances on three roots, and [consent](../grammar/sakes.md#consent) (`huxolem`, `huxegum`) is an undergoer role compound on `/h/`. Every participant case of permission is already consent: the permission of the one it's done to is their consent, and the doer's own is letting themself. The only case left is someone over the act. So one shape covers all four, and the part consonant says whose say it is:

```
h + w + V1 + part consonant + answer vowel + ending
```

| Piece | Says | Values |
|-------|------|--------|
| part consonant | whose say | **`z`** the doer, **`d`** the one it's done to, **`b`** the recipient, **`v`** someone over the act and outside it: the speaker, or a person in a `bl-` word right after |
| answer vowel | what they said | **`a`** yes, allow (as in `yael`); **`u`** no, forbid (as in `yuel`); **`e`** require, ask for (**e** ≈ order); **`o`** their call (**o** ≈ pick) |
| ending | how it stands | **-l** a rule, or a binding agreement; **-m** a person said so; **-r** nobody said: tolerated, assumed, or customary |

A participant pointer has no reading on `/h/` (a person is not an adverb), so the slot parts and **`v`** are free there. The vowel after the part is an answer, not a pointer vowel, because a say always concerns its own clause. The endings keep today's cues: **-l** ≈ law, **-m** ≈ mouth, **-r** ≈ read the room.

### The forms

With **-m**:

| Answer | **`v`** someone over the act | **`z`** the doer | **`d`** the one it's done to | **`b`** the recipient |
|--------|------------------------------|------------------|------------------------------|-----------------------|
| **`a`** | `hwavam` *you may* (`tholem`) | `hwazam` *lets themself* | `hwadam` *they agreed* (`huxolem`) | `hwabam` *the recipient agreed* |
| **`u`** | `hwavum` *you may not* (`thegum`) | `hwazum` *won't let themself* | `hwadum` *they refused* (`huxegum`) | `hwabum` *the recipient refused* |
| **`e`** | `hwavem` *you have to* (`thonam`) | `hwazem` *makes themself* | `hwadem` *at their request* | `hwabem` *at the recipient's request* |
| **`o`** | `hwavom` *it's up to you* | `hwazom` *their own choice* | `hwadom` *it's their call* | `hwabom` *the recipient's call* |

On **`v`**, **-l** is the rules (`hwaval` *the rules allow*, `hwavul` *the rules forbid*, `hwavel` *the rules require*, `hwavol` *the rules leave it optional*) and **-r** is what nobody said (`hwavar` *tolerated*, `hwavur` *frowned on*, `hwaver` *customary*, `hwavor` *nobody cares either way*). On a participant, **-l** is binding and **-r** is assumed:

| Answer | **-l** binding | **-r** assumed |
|--------|----------------|----------------|
| **`a`** | `hwadal` *they signed on*, `hwazal` a vow | `hwadar` *they're probably OK with it* |
| **`e`** | `hwadel` *they're owed it*, `hwazel` *a rule they set themself* | `hwader` *they'd want it*, `hwazer` *feels they have to* |
| **`o`** | `hwadol` *their call, by agreement* | `hwazor` *presumably their own choice* |

- **`hwazer`** is the unspoken *should*: *I feel I have to* when nobody asked. Beside `hwavem blolazun` (someone asked), `hwavel` (the rules), and `hwazem` (pushing yourself), it makes a speaker show where the pressure comes from.
- **`hwazel`** is a personal rule (*I don't drink on weekdays*). Naming a rigid rule as self-set makes it something to examine. A vow (`hwazal`) commits to an act, and said to someone it is a promise; a self-set rule is a policy held toward yourself.
- **`hwader`** (*they'd want to know*) is a common excuse for acting on someone's behalf. **-r** marks it as an assumption, as `hwadar` does for consent.
- **`o`** hands the choice to that party: neither allowed, forbidden, nor required, but up to them. `hwazom` (*chose it freely*) differs from `hwazam` (*let themself*), which suggests a reluctance overcome. *No answer yet* needs no vowel: it is a question (`yom … hwadam`).

**-x** has no reading on a say word: a group's say comes from a group in the clause (`zudozolx`). **-n** stays reserved, as on other closed families.

> `zuzozen vowurel hwavam blolazun.`
>
> z-Uzozen | v-walk | [h-episode-event-ALLOW-said | bl-Olazun]
>
> "Olazun lets Uzozen walk."

> `zuzozen vezuyel bahelan hwabam.`
>
> z-Uzozen | v-tell | b-Ahelan | h-episode-recipient-ALLOW-said
>
> "Uzozen tells Ahelan, and Ahelan said yes to it."

The consenter needs no `bl-` word when they are already in the clause. Someone outside the act, such as an owner, a guardian, or the neighbors, takes **`v`** and a `bl-` word: `zuzozen dugedol vagedal hwavam blolazun.` is *Uzozen eats the cookie; Olazun said yes*.

**`v`** with no `bl-` word is the speaker, as today's permission defaults to the speaker (*you may go* is a performative). When the speaker is a participant, a bare **`v`** has no reading: the speaker's say over their own act is the participant's part (`hwazam`, `hwazem`). So *I have to walk* must say who requires it: the rules (`zuwon vowurel hwavel.`), a person (`hwavem blolazun`), custom (`hwaver`), or the speaker (`hwazem`, *I'm making myself*). Telling an outside demand from one you put on yourself is the point of the split.

### Scope (V1)

V1 is label scope, as on every role word:

- **`a`:** this act. `hwadam` is a yes to this act, which is why consent is asked for each time.
- **`e`:** standing. `hwedam` is standing consent (*they're generally fine with this*), `hwevam` standing permission (*you may, any time*), `hwevem` a standing duty, and `hwezem` a discipline. Standing is not binding: `hwedam` can still be taken back, and only **-l** binds.
- **`o`:** toward one party, named in a `bl-` word. `hwodam bluzozen` is *they agreed, to Uzozen only*. `hwozal blahelan` is a vow toward Ahelan: a promise to Ahelan. On **`v`**, the `bl-` word is still who has the say, and **`o`** limits it to their own part, as `tho` on a verb is *as far as Olazun is concerned* (`valamuthol blolazun`). `hwavam blolazun` is *Olazun lets Uzozen walk*; `hwovam blolazun` is *fine as far as Olazun is concerned*, and others may still object. Bare `hwovam` is *fine by me*, without speaking for anyone else. It separates *I'm OK with it* from *it's allowed*.
- **`u`:** a type across scenes. `hwudam` is *they're the type who's fine with it*, and `hwuvem` *their kind has to*. These are the inferences consent and fairness warn against. The form makes them visible instead of hiding them, as `zwuzavuvul` does for *a fighter type*.
- **Pairs** compose as on any label. `hwuevam` is *you may, but not in my official role*: allowed personally, off duty.

### What carries over

- **Bars:** say words rank as [stance bars](../grammar/comparatives.md) as today. The bar table already has `/h/` bars (consent, FORMER, ABIL): `hwaval` *over the limit*, `hwavel` *up to code*, `hwadam` *more than agreed*.
- **`uem`:** it goes before an intention adverb as today: `uem hwadum` is *against their will*, and `uem hwavul` *against the rules*. D-49's closure on a given yes carries to the participant yes forms (`uem hwadam`, `uem hwazal`).
- **Asking:** `yom zuwon vuhohol hwavam.` is *May I sit?*.

**Cost:** the seed cues 🟢 *green circle*, ⛔ *no entry*, and 📝 *memo* stop being the cues for these words, and the vowel cues replace them; the roots stay in the lexicon for their ordinary uses. **`v`** stretches from *the event itself* to *whoever governs the act*. The deontics move from `/th/` to `/h/`. They stay together on one letter, which was D-46's reason for keeping them on `/th/`, and a grant, a ban, and a demand are said openly, which is D-46's own test for `/h/`.

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

## Learning levels

- **Beginner:** the slot-rule parts **`z`**, **`d`**, **`b`**, and V1 **`a`** and **`e`**. **`a`** is today's bare reading (*one lesson is enough*), so a beginner's first role compound means what it does now, and **`e`** (*a teacher*) costs one paragraph. The choice between one act and an identity is a core purpose of the language, so it is taught from the first role word.
- **Intermediate:** V1 **`o`**, **`u`**, and the pairs, where label scope is taught today, and the seven content-rule parts. Each content part depends on its slot (`/h/`, `/th/`, `/y/`, `/x/` linkers) already being familiar. Capacity on `/h/` is Intermediate too, since it leans on scope. Say words stay where permission and consent are taught today, at Intermediate on sakes.md.

roles.md Beginner comes before predication.md Intermediate on the path, so a learner meets the scope vowels on role words first and on the **`th`** seam later.

## Spelling and parsing

- **Length:** each form gets one letter longer (`zaxar` → `zwazar`, `zaxuduyel` → `zwazuduyel`).
- **Clusters:** the role letter + **`w`** cluster now opens every compound and pointer, including the first role word a beginner learns. Calling with `/y/` adds **`yw`** (`ywezobebun`, *calls the doctor*). A compound that itself fills a `bl-` slot opens with **`blw`**, which the [syllabic `l`](../grammar/phonology.md) already allows. The cluster list on [phonology](../grammar/phonology.md) grows to match.
- **No clash with tags:** a [tag pronoun](../grammar/pronouns.md#tag-pronouns) is role letter + **`w`** + tag vowel(s) + ending (`zwar`, `zwaer`). The part consonant is never **`l`**, **`m`**, **`n`**, or **`r`**, so the letter after V1 tells a compound or pointer from a tag.
- **Hook prefixes take over the old shape:** `hook-prefixes.md` reuses role letter + vowel(s) + **`x`** + stem for hook prefixes. It lands after step 2, once every old role compound is respelled, so no page reads one as the other.
- **Compound vs pointer:** after the part consonant, a pointer is one vowel, an ending, and an optional **-x**, and then the word ends. A compound's stem goes on past that point (`zwazar` against `zwazarayel`, *someone who writes*), so the parser reads past the pointer vowel and ending to tell them apart.
- **Morph gloss:** role letter, V1 label, part label, then the stem: `z-episode-agent-teach`, `g-role-agent-teach`. V1 takes today's scope labels unchanged (`episode`, `role`, `pair`, `type`, and the pair labels). The part labels are **`z`** `agent`, **`d`** `patient`, **`b`** `recipient`, **`h`** `manner`, **`g`** `state`, **`th`** `stance`, **`w`** `extent`, **`y`** `move`, **`x`** `outcome`, and **`v`** `event`. A pointer keeps the arrow: `z-←episode-agent.same`. A say word glosses its answer as `ALLOW`, `FORBID`, or `REQUIRE` and its ending as `rule`, `said`, or `tacit`: `h-episode-patient-ALLOW-said` (*they agreed*), `h-episode-event-REQUIRE-rule` (*the rules require it*).
- **Repeated sounds:** `zwazar`, `dwadar`, and `bwabar` repeat a consonant. That is harmless, but it sounds different from today's pointers.

## Step 1: retire kind indefinites

Today role letter + **`w`** + knowledge vowel + kind letter + join is a [kind indefinite](../grammar/joins.md#kind-indefinites) (`zwuyar`, *someone; I don't know who*). Step 2 needs that shape, and most of the kind indefinite doesn't earn its place anyway. The kind letter mostly makes a one-word version of something already sayable (`zeyol zar`, `zul geyol`). Most uses of the knowledge vowel are covered by plain forms, resume **-r**, PLAN or MEMORY ([below](#what-the-knowledge-vowel-did)). Two uses are worth keeping: the quiz, which moves to `stacked-speech-acts.md` (`yol yal`), and *the times we both know*, which the [holder](../grammar/knowing.md#holder) seam already covers ([shared history](#shared-history)).

Step 1 has to clear every kind indefinite from the pages before step 2 lands. Most retired spellings are well-formed step 2 pointers: `zwuyar` would read as a **`y`** pointer.

### What the knowledge vowel did

Every kind indefinite was optional, and plain `zar` stayed the default. A route with an extra clause is just as optional, so nothing is lost on how often people mark it, only length.

| Current form | Job | Route after step 1 |
|--------------|-----|--------------------|
| `yol ol bwuhar` | a real question | plain `yol ol bar` ([questions.md](../grammar/questions.md#four-kinds-of-question) already says so) |
| `zwuyar` | *someone; I don't know who* | plain `zar` / `zeyol zar` |
| `zweyar` | *that person, you know the one* | resume **-r** with no antecedent: `zeyor` ([resume](../grammar/pronouns.md#resume-r)) |
| `zwoyar` | *a certain someone* (I know who) | `zar` plus `zuwon vanam dorl zar.` (*I know who*) |
| `yol zwoyar …`, `yol xwovar` | a quiz | `yol yal` (`stacked-speech-acts.md`, not yet taught) |
| `yol ol bwehar zayan vagedal` | *remind me* | MEMORY: `yol ol bar zayan thevum vagedal.` |
| `yol ol bwahar zayan vagedal`, `yol vwavar zayan` | a choice | PLAN: `yol ol bar zayan thagem vagedal.`, `yol var zayan thagem.` |
| `thebam blwoyar` / `thebam blwuyar` | a source you won't name / don't know | `thebam blumon` plus `zuwon vanam dorl zar.` (or its denial) |
| `zwuyual` | *everyone here* | plain `zual geyol` |
| `zwayual` / `zwayuam` | *all people anywhere* / *people in general* | plain `zual` / `zuam`, or the generic `eyon` |
| `zwoyual` | *everyone I mean* | dropped (vague by design) |
| `hweral`, `zweyal`, `vweval` | *never / nobody / nothing we both know of* | the holder seam: `hal thevumayan` ([shared history](#shared-history)) |
| `zweyual` | *everyone we know* (a domain) | SHARED role compound with pair scope: `zual guxanathom blayan` ([open question](#everyone-we-know-as-a-domain)) |
| `gwuzar`, `gwalar` | a typed *what kind?* | plain `gar` ([what kind?](../grammar/questions.md#what-kind)) |
| `xwuvar`, `xwevar` | *something happened* + knowledge | plain `xar` |

`hooked-joins.md` would add tighter routes for some rows (a bound like *everyone here*, a stretch the speaker names) when it lands. Step 1 waits for none of them.

`zarx` and **-rx** on plain joins stay. They were added with kind indefinites, but they don't depend on them. The [root-tail](../grammar/compounds.md#root-tails) consonants go back to being a memory aid only.

### Shared history

*Any time we both know of* is a stance, not a stretch, so it needs no landmark. It is the [holder](../grammar/knowing.md#holder) seam with the interlocutors as holder:

> `zawan vebal hal thevumayan.`
>
> z-listener | v-hear | h-never | th-MEMORY-interlocutors
>
> "From what I remember of what we both saw, you've never listened."

MEMORY says the claim rests on the speaker's memory, and the holder says the view is one both people share. The speaker can't know the listener's memory, only claim the view is shared, and the listener can answer with a memory of their own. `ham thevumayan` adds *as far as I know*. The same seam covers *nobody / nothing we both know of* (`zal`, `dal` with `thevumayan`).

### Open question: everyone we know, as a domain {#everyone-we-know-as-a-domain}

Old `zweyual` named the people both speakers are acquainted with. That is a set, not a stance, so the [holder seam](#shared-history) doesn't cover it, and no hook names *known to*. Step 1 lands before step 2, so the route uses today's [role compounds](../grammar/roles.md#role-compounds).

Today's grammar already has one. The undergoer role compound of *know* is *one who is known* (`guxanam`). [Pair scope](../grammar/predication.md#scope-relative) **`tho`** says the label holds toward one other party, named in a `bl-` word, as `golayothom blolazun` is *a stranger to Olazun*. Together, `guxanathom blayan` is *known to the two of us*, and as SHARED after a join it bounds the set:

> `zual guxanathom blayan vezuvol.`
>
> [z-everything | [g-patient-x-knowledge-th-pair | bl-interlocutors]] | v-sleep
>
> "Everyone we know sleeps."

The join does the rest, as on any SHARED bound, and every row below parses with one tree today:

| Agebon | English |
|--------|---------|
| `zual guxanathom blayan` | *everyone we know* |
| `zuam guxanathom blayan` | *everyone we know, as far as I know* |
| `zal guxanathom blayan` | *nobody we know* |
| `zarx guxanathom blayan` | *some people we know* |
| `zual guxanathom blayan zul` | *not everyone we know* ([not every](../grammar/joins.md#not-every)) |
| `zual guxanathom bluwon` | *everyone I know* |

The pair scope keeps the claim honest. *Everyone hates me* bounded to `blayan` is *everyone we both know*, and the listener can name someone in that set. The other party is a group here, and `blayan` reads as the two of us together: people both of us know. People either of us knows would take a join of landmarks, as after any relation word ([relations](../grammar/relations.md#locative-relations)).

The cost is length: three words where `zweyual` was one. That is the same trade as the other [routes](#what-the-knowledge-vowel-did), and the form is built from parts a learner already has at intermediate level.

**Recommendation:** close the question with this route. Put it in the route table and on [joins.md](../grammar/joins.md#kind-domains) where the *every and none, by set* table is rewritten, with no G-row. Step 2's respelling script respells `guxanathom` with the rest of the role compounds (scope moves to V1, so the pair scope `o` goes up front: `gwodanam blayan`).

## What changes

- **Step 1:**
  - **Grammar:**
    - [joins.md](../grammar/joins.md): remove the kind-indefinite section, rewrite the *every and none, by set* table with the routes, and change the universals paragraph so a hook after the kind is a clause extra and the bound takes a SHARED relation (`gobem`, `gaham`).
    - [questions.md](../grammar/questions.md): remove *four kinds of question* and the typed-blank rules after `yal yol`.
    - [knowing.md](../grammar/knowing.md): source table and holder note.
    - [restrictors.md](../grammar/restrictors.md): replace *always and never, by which times* with the holder seam for shared history.
    - [pronouns.md](../grammar/pronouns.md): the tag intro no longer contrasts tags with kind indefinites.
    - Smaller edits: [compounds.md](../grammar/compounds.md) root tails, [english.md](../grammar/english.md) some- and any- rows, [terminology.md](../grammar/terminology.md) (drop knowledge vowel and kind letter), and the [phonology.md](../grammar/phonology.md) cluster list (drop the kind-indefinite `w` clusters).
    - The cheat sheets `joins-hooks`, `talking`, `restrictors-spans`, `knowing-intending`, `to-english`, and the say pages that cite kind indefinites.
  - **Design notes:** in `unassigned-reserved.md`, list the retired kind-indefinite spellings as open until step 2 claims them. In `design-decisions.md`, add why the knowledge vowel was dropped.
  - **Code:** remove [`kind-indefinite.ts`](../../src/parse/kind-indefinite.ts) and the `kindIndefinite` rule in [`word.peggy`](../../src/parse/word.peggy), with their morph gloss, gloss-inverse, `constructions.ts` notes, and tests.
- **Step 2:**
  - **Grammar:**
    - Rewrite [roles.md](../grammar/roles.md) at the [levels above](#learning-levels): Beginner teaches **`z`** / **`d`** / **`b`** with V1 **`a`** and **`e`**, and Intermediate the other scopes and the content parts. The vowel table and the separate pair sections become the consonant table plus the hook table. Move the scene, instrument, goal, source, path, result, and bearer pointer examples to resumes and hook pointers.
    - [role pointers](../grammar/pronouns.md#role-pointers) and the pointer sections after it.
    - [predication.md](../grammar/predication.md#scope-role): scope on a role word moves to V1, the **`th`** seam stays for other words, and the one-seam note goes.
    - [intention.md](../grammar/intention.md#role-ability): scope and ability combine on a role word.
    - Capacity on `/h/`: a section on [roles.md](../grammar/roles.md) at Intermediate, and the *as a teacher, I …* row on `say-people-places.md` and [english.md](../grammar/english.md) (*not as a teacher*) take the one-word form.
    - [sakes.md](../grammar/sakes.md#permission): permission, requirement, and consent become one say-word section, and the promise paragraph takes `hwozal`. With them go the [stance bar](../grammar/comparatives.md) rows, the `uem` examples, the compare lines on intention.md and knowing.md, the say pages, the cheat sheets `why-allowed`, `to-english`, and `roles-comparing`, and the Claritish allowed / required / agreed lesson and cheat sheet (about 225 uses across 14 pages).
    - The phonology cluster list. Re-run the generated cheat-sheet blocks.
  - **Respelling:** `npm run retie-docs` handles only root respellings, so step 2 needs a one-off script for about 318 role compounds and 151 pointers across about 25 pages. A bare role compound takes V1 **`a`**, a trailing **`th`** scope moves to V1, and **`a`** / **`u`** / **`o`** become **`z`** / **`d`** / **`b`**. The script lists the hooked-part forms (about 39, with their practice items) for a hand rewrite, and doesn't change them. Then read the English of every bare form: one glossed as a profession (*the doctor*) takes **`e`**, not **`a`**. Then run `npm run build` and `npm run grammar-check`.
  - **Design notes:**
    - `unassigned-reserved.md`: drop `zexor` / `zexol` / `zexom`, and list **`v`** in a role compound as closed. The old pointer shape, role letter + vowel + **`x`** + vowel + ending (`zaxar`), is no longer claimed; list it as open. List a **`th`** scope after a role word's stem as closed. List as open `dwagor`, `dwawor`, **-n** on a say word, and a content-part compound on `/h/` (`hwahavuvul`). List as closed a bare **`v`** say word when the speaker is a participant, and **-x** on a say word.
    - `design-decisions.md`: why scope is required and written only at the front, and why hooked parts have no role compound (the losses above, and the recipient collision). Revise D-46: the deontics move to `/h/` with consent, as one say-word family. Extend D-49 to the participant yes forms.
    - `glosses.md`: the gloss rule above.
  - **Code:** the say-word rule on `/h/` (and removing the deontic stances on `/th/`), the role-compound and pointer rules in the parser, morph glosses (`z-agent-x-teach` → `z-episode-agent-teach`), the LLM prompt and construction notes, english-helper recipes, and the wizard content. Then run `npm run grammar-check`.

## Commit plan

The whole proposal is implemented as one change. The phase commits are checkpoints, so an interrupted session can tell where work stopped; they don't need to build or pass tests. Each phase ends in one commit with the message `role consonants phase N: <title> [skip-cd]`.

**To resume in a new session:**

1. Run `git log --oneline --grep 'role consonants phase'`. The highest phase listed is the last one that landed, and the boxes below should match it.
2. Run `git status` and `git diff --stat`. Uncommitted changes are the next phase in progress: read them before continuing, and don't start that phase over.

**In every commit:** tick the phase's box below.

**Decisions made while implementing (phases 1–4):**

- **Pointers in a seam are dropped (user decision, phase 5a).** The new pointer cannot anchor a viewpoint lateral (`howuhethaxar`: `thw` mid-word) or fill a holder seam (`theyemaxar`: D-56). A pointer is no longer an anchor or a holder; use a resume of the person (`howuhethuzozer`, `theyemuzozer`, `theyemeyor`). List the pointer-in-seam spelling as closed. The phase 2 script lists these 28 forms under *hand rewrite*; rewrite them with resumes, and remove the `holder` / `lateral` pointer branches from the parser.
- **Step 1 routes that would be forward links stayed off the stage page.** The holder seam is taught after restrictors.md Intermediate, so shared history (`hal thevumayan`) is taught on knowing.md#holder, not restrictors.md. The `gobem` / `gaham` set bounds are on relations.md#of-relations, not joins.md.
- **Say words (phase 4):** the answer **`o`** glosses as `CHOICE`. A bare **`v`** on **-m** is rejected only in a statement (`saySpeaker`); under `yol` / `yom` it asks the listener (*May I sit?*), and **-l** / **-r** on a bare **`v`** stay fine (`zuwon vowurel hwavel.`). A say word's yes or *their call* is no `uem` frame; its no or *their call* is no bar. The family is `{ kind: "say" }` in [`types.ts`](../../src/parse/types.ts); phase 5a reads the same shape off `/h/` as a pointer.
- **The english-helper baseline** was rewritten after phase 3: only doc composition moved it (of 1662 sentences in both runs, one changed, for the better).

- [x] **Phase 1: retire kind indefinites.** [Step 1](#step-1-retire-kind-indefinites) in full: remove `kind-indefinite.ts` and the `kindIndefinite` rule, rewrite the pages in its "What changes" list with the routes, and update `unassigned-reserved.md` and `design-decisions.md`.
- [x] **Phase 2: respelling script, dry run.** Add the one-off script described under *Respelling* in [What changes](#what-changes). It writes nothing yet: its report lists every role compound and pointer it would respell, the hooked-part forms left for hand rewrite, and every bare form whose English reads as a profession (an **`e`** candidate). Commit the script; put the report in `tmp/`.
- [x] **Phase 3: retire hooked parts.** Still in today's shape: the scene, instrument, goal, source, path, and bearer compounds and pointers stop parsing, and every use is rewritten to the [replacements](#hooked-parts-are-not-role-compounds) (compounds with a head root, resumes, hook pointers, clause hooks). A result (`ao`) becomes today's undergoer (`ux`), the form the **`d`** part takes over. Update roles.md, the `roles-comparing` cheat sheet, `unassigned-reserved.md` (drop `zexor` / `zexol` / `zexom`), and `design-decisions.md`.
- [x] **Phase 4: say words.** Permission, prohibition, requirement, and consent become [say words](#say-words-permission-requirement-consent) on `/h/`; the `/th/` deontics and `huxolel` / `huxegul` stop parsing. This needs only `hw…`, which phase 1 freed, so it lands before the respelling and consent is respelled once. Update sakes.md, the stance bar rows on comparatives.md, the `uem` examples, the say pages, the cheat sheets, the Claritish lesson and cheat sheet, D-46, and D-49.
- [ ] **Phase 5a: respell role compounds and pointers.** The parser takes role letter + **`w`** + V1 + **`z`** / **`d`** / **`b`**, rejects the old **`x`** shape, closes a **`th`** scope after a role stem, and lets scope and ability combine. Run the phase 2 script with `--write`. Rewrite roles.md (Beginner: **`z`** / **`d`** / **`b`** with V1 **`a`** and **`e`**), the role pointers on pronouns.md, predication.md, intention.md, phonology clusters, `glosses.md`, morph gloss and gloss-inverse, and the `constructions.ts` notes.
- [ ] **Phase 5b: profession review.** Docs only: go through the script's **`e`** candidates and move each bare form whose English is a profession (*the doctor*, `ywezobebun`) from **`a`** to **`e`**.
- [ ] **Phase 6: content-rule parts.** The **`h`**, **`g`**, **`th`**, **`w`**, **`y`**, **`x`**, and **`v`** parts as compounds and pointers, with resolution in `resolve.ts` by the structural rules above. Teach them at Intermediate on roles.md. List `dwagor`, `dwawor`, and a content-part compound on `/h/` in `unassigned-reserved.md`.
- [ ] **Phase 7: capacity on `/h/`.** The [capacity](#on-h-capacity) reading, its Intermediate section on roles.md, and the *as a teacher* rows on say-people-places.md and english.md.
- [ ] **Phase 8: sweep and checks.** Whatever the earlier phases left: the LLM prompt core, english-helper recipes and cases, wizard content, terminology.md, and the level reviews. Regenerate the cheat-sheet blocks (`npm run cheat-sheet-blocks -- --write`). Then run `npm run build`, `npm test`, `npm run grammar-check`, and `npm run english-helper-recall -- --check` (then `-- --write-baseline` if the numbers improved), and fix what they find. Fold anything left on this page into the grammar or meta docs and delete this file.

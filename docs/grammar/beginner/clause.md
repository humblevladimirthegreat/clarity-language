---
band: beginner
---

<!-- read-by (generated: npm run page-readers -- --write; do not edit)
Page shape read by code:
- cheat-sheet markers (1): each marker names a sheet id and sits right before a table whose forms are on that sheet (scripts/lint-cheat-sheets.ts)
Sections named by data:
- #who-acts-and-the-action: 4 construction homes, 4 interpreter rows, 4 interpreter classes
- #direct-object-d: 2 construction homes
- #adjectives-ɡ: 2 construction homes, 1 interpreter row, 1 interpreter class
- #adjective-detail-w: 2 construction homes, 1 rejection, 1 interpreter row, 1 interpreter class
- #adverbs-h: 3 construction homes, 1 interpreter row, 1 interpreter class
- #which-covers-which: 99 pair-table rules
- #extra-nouns: 4 construction homes, 2 rejections, 1 overlay row, 2 interpreter rows, 2 interpreter classes
Inbound links: npm run page-refs -- clause.md
-->

# The clause

How to read and write one Ageben **clause** (roughly, one simple sentence): who does what, how each word is shaped, and the default order.

You already write a [citation](word-endings.md), the root and ending you use for a word outside a sentence (`odozel`, `owurol`, `azozon`). In a sentence, put a **role letter** in front of it. That first letter says what the word is doing (who acts, the action, and so on). The root and ending stay the ones you already chose; only the first letter changes.

### Who acts and the action
<!-- Agent summary: subject (who acts) = `/z/`, verb (the action) = `/v/`. Word = role letter + root + ending, one word: citation `odozel` → `zodozel`; root and ending stay as cited. A name keeps its `-n`: `azozon` → `zazozon`. Subject + verb only → order Subject – Verb. A period ends the statement, so `zodozel vowurol.` is a whole sentence. -->

To say who does something and what they do, mark the **subject** (who acts) with `/z/` and the **verb** (the action) with `/v/`. Each of these letters goes in front of a citation as the word's first letter, and the result is written as one word, so the citation `odozel` becomes `zodozel`. With only a subject and a verb, the order is Subject – Verb, and a period ends the statement, so those two words already make a whole sentence.

> `zodozel vowurol.`
>
> z-dog | v-walk
>
> "A dog walks."

Compare `zodozel` with its citation `odozel`. The root and the ending `-l` are the same, and the `z` in front is the only new part: it says the dog is the one acting. The verb works the same way, with `v` in front of the citation `owurol`.

A name keeps its ending too. You cite a name with `-n` (`azozon`), so in the sentence it is `zazozon`, with the `-n` still at the end:

> `zazozon vowurol.`
>
> z-Azozon | v-walk
>
> "Azozon walks."

The two sentences differ only in who walks. Both subjects start with the same `z`, and each keeps the ending of its own citation: `-l` for the dog, `-n` for Azozon.

### Direct object (`/d/`)
<!-- Agent summary: direct object (who/what is acted on) = `/d/`. Default order Subject – Direct Object – Verb (`zodozel dogozel vayebel.`). The letters carry the roles: swapping `z` and `d` between two nouns swaps who does what (`zogozel dodozel vayebel.` = a cat sees a dog). Moving words keeps each role and adds no stress; keep the default order anyway. -->

To say who or what the action is done to, add a **direct object** and mark it with `/d/`. The default order is Subject – Direct Object – Verb, so the verb comes after the object.

> `zodozel dogozel vayebel.`
>
> z-dog | d-cat | v-see
>
> "A dog sees a cat."

Because each word's first letter says its role, swapping the letters swaps who does what. Here the cat does the seeing:

> `zogozel dodozel vayebel.`
>
> z-cat | d-dog | v-see
>
> "A cat sees a dog."

Both sentences use the same two roots and the same two letters. What changed is which noun carries which letter, and that alone turns the dog from the one who sees into the one who is seen.

Moving a word keeps its letter, so it keeps its role. You may move the subject, the direct object and the verb without changing who did what, and moving a word does not stress it. Here the object comes first, with the same meaning:

> `dogozel zodozel vayebel.`
>
> d-cat | z-dog | v-see
>
> "A dog sees a cat."

In English, order is often the only thing that says who sees whom, so *a dog sees a cat* and *a cat sees a dog* are different sentences. In Ageben the letters say it. Even so, keep the default order, Subject – Direct Object – Verb, because listeners expect it.

### Adjectives (`/ɡ/`) {#adjectives-ɡ}
<!-- Agent summary: adjective (property of a noun) = `/ɡ/`, right after the noun it describes; several may stack after one noun. Position picks the noun: `zodozel gonumul dogozel vayebel.` = an angry dog sees a cat; `zodozel dogozel gonumul vayebel.` = a dog sees an angry cat. Event root in `/ɡ/` → the noun is in the middle of the event (`zodozel gowurol` = a walking dog). -->

An **adjective** names a property of a noun, such as *angry*. Mark it with `/ɡ/` and put it right after the noun it describes, so for *an angry dog* you say the dog first and *angry* after it.

> `zodozel gonumul vowurol.`
>
> [z-dog | g-angry] | v-walk
>
> "An angry dog walks."

Because the adjective goes right after its noun, its position decides which noun has the property. In the next two sentences the words are the same, and only `gonumul` moves:

> `zodozel gonumul dogozel vayebel.`
>
> [z-dog | g-angry] | d-cat | v-see
>
> "An angry dog sees a cat."

> `zodozel dogozel gonumul vayebel.`
>
> z-dog | [d-cat | g-angry] | v-see
>
> "A dog sees an angry cat."

When the root names an event, the adjective says the noun is in the middle of it: `gowurol` after *dog* is *a walking dog*. Compare it with the verb `vowurol`, the same root with a different letter. In `zodozel vowurol.` the walking is the action the sentence reports. As `gowurol`, the walking describes the dog, and the sentence can report another action.

You can stack several adjectives after one noun, and each of them describes that noun:

> `zodozel gonumul gowurol dogozel vayebel.`
>
> [z-dog | g-angry | g-walk] | d-cat | v-see
>
> "An angry dog that is walking sees a cat."

### Extra detail on an adjective (`/w/`) {#adjective-detail-w}
<!-- Agent summary: `/w/` = detail on the word right after it, such as how strongly an adjective holds: `zodozel welazem gonumul` = a very angry dog; `welazem` describes `gonumul` only, not the dog. Goes immediately before its word; before a noun or a verb a `/w/` word is rejected (`welazem` after `gonumul` would land before the verb). -->

To say how strongly a property holds (*very* angry), add a word marked with `/w/` immediately before the adjective. The `/w/` word describes only the adjective right after it, so in the example below the dog is angry, and *very* says how angry.

> `zodozel welazem gonumul vowurol.`
>
> [z-dog | [w-very | g-angry]] | v-walk
>
> "A very angry dog walks."

Without `welazem`, `zodozel gonumul vowurol.` says only that an angry dog walks. Adding `welazem` changes how angry the dog is, and nothing else in the sentence.

Because the `/w/` word describes the word right after it, keep it on the near side of the adjective. Placed after `gonumul`, `welazem` would stand right before the verb `vowurol`, and a verb takes no `/w/` word, so that sentence is not well formed. A noun takes none either: to describe the dog itself, use a `/ɡ/` word.

### Adverbs (`/h/`) {#adverbs-h}
<!-- Agent summary: adverb (how, when or where the action happens) = `/h/`, anywhere in the sentence; moving it changes nothing (`zodozel hadurom vowurol.` = `zodozel vowurol hadurom.`). Several may sit together (`hadurom halozum` = hastily and quietly). Same root in `/ɡ/` describes the noun instead (`zodozel gadurom` = a hasty dog). A `/w/` word goes right before an `/h/` word too (`welazem hadurom` = very hastily). -->

An **adverb** says how, when, or where an action happens. Mark it with `/h/`. An adverb describes the action, not a noun beside it, so you may place it anywhere in the sentence.

> `zodozel hadurom vowurol.`
>
> z-dog | h-haste | v-walk
>
> "A dog walks hastily."

Put `hadurom` last instead, as in `zodozel vowurol hadurom.`, and the sentence means the same. Several adverbs can sit next to each other, as in `hadurom halozum` (*hastily and quietly*).

The same root with `/ɡ/` describes the dog instead of the walking:

> `zodozel gadurom vowurol.`
>
> [z-dog | g-haste] | v-walk
>
> "A hasty dog walks."

Here haste is a property of the dog, and the sentence says nothing about how this walk goes. With `hadurom`, the haste is in the walking. So when the word says how the action happens, use `/h/`. When it says what the person or thing is like, use `/ɡ/` and put it right after the noun.

A `/w/` word works before an adverb just as it does before an adjective, so `welazem hadurom` is *very hastily*.

### Stance (`/th/`) {#stance-th}
<!-- Agent summary: stance word = `/th/`: how the speaker stands toward the whole claim (how sure, how known, why it holds, only imagined); place it as freely as `/h/`. `thevemem zodozel vowurol.` = I doubt a dog is walking; without it, `zodozel vowurol.` = a dog walks. Same root in `/h/` describes the action instead (`zodozel hevemem vowurol.` = a dog walks doubtfully). `/th/` = what is in a mind; with nothing else marked, the speaker's mind, now, as they speak. -->

An adverb describes the action. A **stance** word describes how you, the speaker, stand toward the whole claim: how sure you are, how you know it, why it holds, or whether it is only imagined. Mark it with `/th/` (`th` counts as one letter, [phonology](phonology.md#consonants)) and, as with `/h/`, place it anywhere in the sentence. One sentence then states both the claim and your stance on it.

> `thevemem zodozel vowurol.`
>
> th-doubt | z-dog | v-walk
>
> "I doubt a dog is walking."

Compare the first sentence on this page, `zodozel vowurol.`, *a dog walks*. Adding `thevemem` keeps the same claim and adds that you doubt it.

The same root as an `/h/` adverb describes the walking instead, so it means something different:

> `zodozel hevemem vowurol.`
>
> z-dog | h-doubt | v-walk
>
> "A dog walks doubtfully."

With `/h/`, the doubt says how the dog walks. With `/th/`, the doubt is yours, and it is about whether the dog walks at all. So when you would say *I doubt* in English, use `/th/`, and keep `/h/` for *doubtfully* as a way of walking.

`/th/` marks what is in a mind, and with nothing else marked, that mind is yours, at the moment you speak.

### Which word covers which {#which-covers-which}
<!-- Agent summary: a `/th/` stance word is about the whole claim, as are some words taught later (*always*, *I plan*). With two such words, the earlier covers the later: it is about the later word and the claim together, so swapping them changes the meaning (`thewemum thevemem …` = the doubt worries you; `thevemem thewemum …` = the walking would worry you). A noun introducing someone or something new (*a dog* on first mention) takes part too: `zodozel thevemem vowurol.` = there is a dog that I doubt is walking; so put stance words before such a noun. With one such word, its place changes nothing. Ordinary `/h/` adverbs never take part. Table: words with their own rule (speech-act word first in its turn; *because* / *if* clause last, said first and pointed back to in order to cover; own feeling, surprise or benefit stays the speaker's; whose-view word covers the whole clause; join word right after stance words works only on them). -->

A stance word is about the whole claim, and so are a few other words you will meet later, such as *always* and *I plan*. When one sentence has two such words, the earlier one **covers** the later one: it is about the later word and the claim together. Their order alone sets this, so swapping the two changes what you say.

> `thewemum thevemem zodozel vowurol.`
>
> th-concern | th-doubt | z-dog | v-walk
>
> "Worryingly, I doubt a dog is walking." (the doubt worries you)

> `thevemem thewemum zodozel vowurol.`
>
> th-doubt | th-concern | z-dog | v-walk
>
> "I doubt a dog is walking, worrying as that would be." (the walking would worry you)

In the first sentence `thewemum` comes first, so the worry covers the doubt: what worries you is that you doubt the dog is walking. In the second, `thevemem` comes first, so the doubt covers the worry. You doubt the dog is walking, and the worry is about the walking, if it happens.

A noun that brings someone or something new into the talk, such as *a dog* the first time you mention it, takes part in this order too. Put the dog before the stance word, and the dog covers the doubt:

> `zodozel thevemem vowurol.`
>
> z-dog | th-doubt | v-walk
>
> "There is a dog that I doubt is walking."

Here you say there is a dog, and you doubt only its walking. In `thevemem zodozel vowurol.` the doubt comes first and covers the dog as well: *I doubt a dog is walking*. That is why the examples above put the stance words before the dog.

With only one such word, its place changes nothing. An ordinary adverb (how, when, or where) never takes part, so it may sit anywhere, before or after a stance word.

A few words keep a rule of their own, which their pages give:

| Word | Its own rule |
|------|--------------|
| A speech-act word, such as the one that makes a question | Comes first in its turn, so it covers the rest |
| A *because* or *if* word | Keeps its clause last, so the words before it cover it. To put it over them, say its clause first and point back to it |
| A word that only gives your own feeling, your surprise, or whose good the act serves | Stays yours, even in a question: the question asks only about the claim |
| A word naming whose view the clause gives | Covers the whole clause, wherever it sits |
| A join word (a word that closes a list, such as *and* or *not*) right after stance words | Works only on those stance words, so it covers nothing else |

### Extra nouns (`/b/`) {#extra-nouns}
<!-- Agent summary: extra noun beyond subject and object = `/b/`; the letter after `b` sets its job. Plain `b` = who receives what the verb passes on (who is paid, who is told); the thing given or said stays `/d/` (`zazozon daral varal balazun.` = Azozon pays Alazun money); at most one receiver per verb, usually right after the verb (S – D – V – B). `bl` = the second person or thing of a relation word (its host) in `/ɡ/`, `/h/` or `/th/`, right after the host: `hewem blazozon` = like Azozon; `/w/` goes before the host (`welazem hewem blazozon`). `/h/` host → the relation describes the action (`zodozel vezuvel hewem blazozon.` = a dog sleeps like Azozon). A `bl-` word not right after its host is not a sentence; plain `b` may stand next to any word (`hadurom balazun` = still the one paid). -->

Some sentences name a person or thing beyond the subject and direct object: who receives what is given, or whom something is like. Mark that **extra noun** with `/b/`, and the letter after the `b` says which of the two it is.

A plain `/b/` word is the person who receives what the verb passes on: who gets the thing given, or who hears what is told. What is given or said is still `/d/`, and each verb has at most one receiver, usually right after the verb (Subject – Direct Object – Verb – Extra noun).

> `zazozon vezuyol balazun.`
>
> z-Azozon | v-tell | b-Alazun
>
> "Azozon tells Alazun."

With a `/d/` word and a `/b/` word in one sentence, you can see the difference between them:

> `zazozon daral varal balazun.`
>
> z-Azozon | d-money | v-pay | b-Alazun
>
> "Azozon pays Alazun money."

The money is what passes from Azozon to Alazun, so it takes `/d/`. Alazun is the one who receives it, so `balazun` takes plain `b`.

Some words name a relation that needs a second person or thing (*like …*: like whom?). Put the relation word in `/ɡ/`, `/h/`, or `/th/`, then put the other noun right after it, with `l` after the `b`. The relation word is then the `bl-` word's **host**, and the `bl-` word completes the relation. (cue: think of `l` as *lock*: the word is locked to the host right before it)

> `hewem blazozon`
>
> [h-like | bl-Azozon]
>
> "like Azozon"

A `/w/` word still goes before the host, so the host and its `bl-` word stay side by side.

> `welazem hewem blazozon`
>
> [[w-very | h-like] | bl-Azozon]
>
> "very like Azozon"

Because `hewem` is an adverb, *like Azozon* here describes the action, the way the dog sleeps:

> `zodozel vezuvel hewem blazozon.`
>
> z-dog | v-sleep | [h-like | bl-Azozon]
>
> "A dog sleeps like Azozon."

A `bl-` word needs its host right before it, and placed anywhere else it makes a sentence that is not well formed. A plain `/b/` word is never a host's partner, so the person who receives may stand next to any word. To choose between them, ask what the noun does: if it receives something, use plain `b`, and if it completes a relation word right before it, use `bl`.

**Compare with:** in <!-- lint: moved -->`zazozon hadurom balazun varal.` (*Azozon hastily pays Alazun*), `balazun` sits right after an `/h/` word and is still the one paid. `hewem blalazun` is *like Alazun*.

### Role letters {#role-letters}
<!-- Agent summary: the eight role letters so far, in three groups. Nouns: `/z/` subject, `/d/` direct object, `/b/` extra noun (plain = receiver; `bl` = partner of the relation word before it). Action: `/v/` verb. Describers: `/ɡ/` a noun (right after it), `/w/` the next `/ɡ/`, `/h/` or `/th/` word, `/h/` the action (anywhere), `/th/` the speaker's stance on the claim (anywhere). -->

The role letters you have used so far:

<!-- cheat-sheet: consonants -->
| Ageben | Use | Cue |
|--------|-----|-----|
| `/z/` | subject (who acts) | `z` ≈ star (who the sentence is about) |
| `/d/` | direct object (who is acted on) | `d` ≈ done to (sound of *acted on*) |
| `/b/` | extra noun: recipient of the verb; with `bl-`, the piece after a relation word | `b` ≈ bolted on (the extra piece) |
| `/v/` | verb (the action) | `v` ≈ *verb* (the English name for the job starts with it) |
| `/ɡ/` | adjective (a property of the noun) | `ɡ` ≈ grade (a rating of the noun) |
| `/w/` | extra detail on the next `/ɡ/`, `/h/`, or `/th/` word | `w` ≈ with (stuck to that host) |
| `/h/` | adverb (how / when / where) | `h` starts *how* / *when* / *where* |
| `/th/` | stance (how sure, how known, why, as if): what is in a mind | `th` ≈ *think* (your stance on the claim) |

The eight letters fall into three groups. `/z/`, `/d/`, and `/b/` mark nouns, the people and things in the sentence, and `/v/` marks the action. The other four describe something, and each describes a different thing: `/ɡ/` a noun, `/w/` the word right after it, `/h/` the action, and `/th/` your stance on the whole claim. So when you choose a letter, first ask whether the word names someone, the action, or a description, and then ask what it describes.

### Practice {#beginner-practice}

Short drills for Beginner. Try each item before opening **Show answer**.

**Setting:** a bank

The word bank has two tables. **New words** are introduced here: **English** is what you produce, and **Ageben** is its citation, or the word with its role letter when that letter is part of the English (*pay* is `varal`, the money root as a verb). Then the **Cue** names the citation's sense (💰 from *money*). **Review** lists words from earlier checkpoints.

**New words:**

| English | Ageben | Cue |
|---------|--------|-----|
| *pay* | `varal` | 💰 from *money* |
| *angry* | `onumul` | 😠 |
| *very* | `welazem` | 🐘 from *elephant*: big, as a degree |
| *haste* | `hadurom` | 💨 from *dash* |
| *doubt* | `thevemem` | 🤔 from *think* |
| *like* | `hewem` | 🪞 from *mirror*: the image is like the model |

**Review:**

| English | Ageben |
|---------|--------|
| *Azozon* | `azozon` |
| *Alazun* | `alazun` |
| *Ahelan* | `ahelan` |
| *find* | `vumewel` |
| *eraser* | `erewul` |
| *book* | `anal` |
| *bell* | `eboral` |

#### English → Ageben {#beginner-english-to-ageben}

**1.** *Azozon pays Alazun.*

::: details Show answer
`zazozon varal balazun.`

z-Azozon | v-pay | b-Alazun

**Also correct:** `zazozon balazun varal.`
:::

**2.** *A very angry Alazun finds money.*

::: details Show answer
`zalazun welazem gonumul daral vumewel.`

[z-Alazun | [w-very | g-angry]] | d-money | v-find

**Also correct:** `zalazun welazem gonumul vumewel daral.`
:::

**3.** *Ahelan hastily finds an eraser.*

::: details Show answer
`zahelan hadurom derewul vumewel.`

z-Ahelan | h-haste | d-eraser | v-find

**Also correct:** `zahelan derewul vumewel hadurom.`
:::

**4.** *I doubt that Azozon pays Ahelan.*

::: details Show answer
`zazozon thevemem varal bahelan.`

z-Azozon | th-doubt | v-pay | b-Ahelan

**Also correct:** `zazozon bahelan thevemem varal.`
:::

**5.** *Ahelan finds Azozon.*

::: details Show answer
`zahelan dazozon vumewel.`

z-Ahelan | d-Azozon | v-find

**Also correct:** `zahelan vumewel dazozon.`
:::

#### Ageben → English {#beginner-ageben-to-english}

**1.** <!-- lint: moved -->`dalazun zahelan vumewel.`

::: details Show answer
d-Alazun | z-Ahelan | v-find

*Ahelan finds Alazun.*
:::

**2.** `zahelan welazem hadurom varal bazozon.`

::: details Show answer
z-Ahelan | [w-very | h-haste] | v-pay | b-Azozon

*Ahelan pays Azozon very hastily.*
:::

**3.** `zalazun deboral vumewel hewem blazozon.`

::: details Show answer
z-Alazun | d-bell | v-find | [h-like | bl-Azozon]

*Alazun finds a bell, like Azozon.*
:::

**4.** `zahelan thevemem danal vumewel.`

::: details Show answer
z-Ahelan | th-doubt | d-book | v-find

*I doubt that Ahelan finds a book.*
:::

**5.** `zalazun gonumul varal bazozon.`

::: details Show answer
[z-Alazun | g-angry] | v-pay | b-Azozon

*An angry Alazun pays Azozon.*
:::

#### Pick one {#beginner-pick-one}

**1.** *Azozon finds Alazun.* `zazozon dalazun vumewel.` or `zalazun dazozon vumewel.`

::: details Show answer
`zazozon dalazun vumewel.`

z-Azozon | d-Alazun | v-find

The finder takes `/z/` and the one found takes `/d/`; the other form has Alazun finding Azozon.
:::

**2.** *Alazun pays Azozon hastily.* `zalazun hadurom blazozon varal.` or <!-- lint: moved -->`zalazun hadurom bazozon varal.`

::: details Show answer
<!-- lint: moved -->`zalazun hadurom bazozon varal.`

z-Alazun | h-haste | b-Azozon | v-pay

The person paid takes plain `/b/`. `blazozon` would lock Azozon to `hadurom` as the partner of a relation, and *haste* has none.
:::

#### Fix it {#beginner-fix-it}

**1.** *An angry Ahelan pays Alazun.* <!-- lint: error -->`zahelan gonumul varal blalazun.`

::: details Show answer
`zahelan gonumul varal balazun.`

[z-Ahelan | g-angry] | v-pay | b-Alazun

A `bl-` word completes the `/ɡ/`, `/h/`, or `/th/` word right before it. After the verb there is no host, so the one paid takes plain `/b/`.
:::

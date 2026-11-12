# Claritish wording and voice

Wording policies for editors writing the **Claritish** track under **`docs/grammar/claritish/`**. What the track is, the lesson shape, what counts as a drop-in, placement, endings, and the link rules: [Claritish track](grammar-docs.md#claritish-track).

[doc-style.md](doc-style.md) applies here: run its [checklist](doc-style.md#checklist) on a lesson as on any grammar page. One group of its rules is replaced. The lead rules under [explain before you slogan](doc-style.md#explain-before-you-slogan) were written for a section that teaches a grammar feature, and a lesson has no such lead: [`## The gap`](#the-gap) does that job.

Claritish is the same voice aimed at a reader who has not opened the grammar and may never. This page adds only what is different, and owns the [hyphenated English host](#hyphenated-host), which exists in Claritish and nowhere in Ageben.

## Checklist
<a id="checklist"></a>

These are the rules this page adds. *Build* means `npm run build` checks it. *Judgment* means only a reader can check it.

| Rule | Checked by | Section |
|------|------------|---------|
| Every italic phrase in a cued lesson's gap raises a cue or is exempt | Build, fails | [Editor cues and cards](#editor-cards) |
| Every drop-in in a lesson table is on the cheat sheet, and the reverse | Build, fails | [Cheat sheet](grammar-docs.md#claritish-track) |
| A feature has the grammar's name, glossed in the sentence that first uses it | Judgment | [Use the grammar's terms](#grammar-terms) |
| No grammar machinery the reader cannot use yet | Judgment | [Use the grammar's terms](#grammar-terms) |
| The gap names a thinking trap, and each of its sentences reads alone | Judgment | [The gap](#the-gap) |
| The forms give a default, a place to leave the drop-in out, and the near miss | Judgment | [Forms](#forms) |
| A practice note says what the speaker means, never which form to write | Judgment | [Examples and practice](#examples-practice) |
| No full Ageben sentence and no morph gloss in a lesson | Judgment | [No glosses](#no-glosses) |
| No lesson numbers, no links between lessons or into the grammar | Judgment | [Back-references](#back-references) |
| Card copy and mirror names never imply English is a mistake | Judgment | [Editor cues and cards](#editor-cards) |

## Use the grammar's terms
<a id="grammar-terms"></a>

Name the feature the way the grammar names it. The reader is learning real Ageben words, so the English name they learn here must be the one they will meet again: **label reach** and **reach vowel**, **evidential channel**, feeling **urge**, **stance** word, **sake**, **tone mark**, **permission** / **requirement** / **consent**, **decision**, **try**. [terminology.md](../grammar/terminology.md) is the list; do not link to it from a lesson.

Do **not** coin a Claritish-only word for a feature that already has an English name. A track-local synonym costs the reader the term twice and makes the lesson stop transferring at the handoff.

| Smell | Prefer |
|-------|--------|
| *scope*, for how far a label applies | *label reach*; the vowel is the *reach vowel* |
| *channel*, introduced as if it were a Claritish word | *evidential channel* (*how you know*), then *channel* for short |
| *pull* or *impulse*, for what a feeling makes you want to do | *urge* |
| *need*, for the part of a feeling word that names what is at stake | *sake* |

Gloss the term in plain English in the **same sentence as first use**, exactly as [doc-style](doc-style.md#plain-language-no-assumed-linguistics) requires: *the reach vowel, which says how far the label reaches*. Using the grammar's name is not a licence to leave it unglossed.

Lessons own two terms, because the grammar has no name for them: **drop-in** (an Ageben word used inside an English sentence) and the **gap** section heading. Add no others in a lesson.

The journal editor has three interface words of its own: **cue**, **card**, and **mirror**. They name parts of the editor, not features of the language, and they stay on the editor page and in its data.

**Naming a feature is not teaching its grammar.** Keep out the machinery the reader cannot use yet: role letters, hosting, slots and word order, joins, spans, citation forms, the concrete / abstract split. A lesson says what the word means and where it goes in the English sentence, and stops.

## The gap names an English failure
<a id="the-gap"></a>

`## The gap` is two or three sentences on the English habit that misleads, with the real English words in italics (*I think* hides a guess; *he's a liar* turns one act into someone's nature). Ageben enters only in the last sentence, as one clause saying what it names instead.

The failure is psychological, not structural. A gap is a thinking trap the reader will recognize from their own week: the guess that sounds like a fact, the rumor that sounds like a sighting, the one act that becomes a nature. "English lacks a word for X" is not a gap on its own.

**Each sentence reads alone.** A [journal editor](#editor-cards) card shows one sentence of the gap by itself, beside the English that raised it. So a gap sentence names its own subject and quotes its own English: no *this*, *that habit*, or *the second one* pointing at a sentence the card does not show.

| Smell | Why it fails | Prefer |
|-------|--------------|--------|
| Opens with the Ageben form or inventory | Nothing yet says why the reader wants it | Name what English loses first; the forms come under `## The forms` |
| "Ageben marks evidentiality." | A feature announcement; no trap, and an unglossed term | "*He said it's fixed* and *I saw it's fixed* sound the same once you repeat them." |
| A gap that is only tidiness (*English is inconsistent here*) | Gives the reader no reason to change how they talk | Name the cost: what gets believed, or who gets blamed |
| "That makes the rumor sound like a sighting." | On a card, *that* points at nothing | "*I heard it's fixed* makes a rumor sound like a sighting." |

## Forms, then placement, then endings
<a id="forms"></a>

`## The forms` leads with the small table, then one sentence on where the drop-in goes in the English sentence, then the endings.

- **Give a default, and an escape.** Say which form to use when the reader cannot tell which fits ("when you are not sure which ending fits, use `thomam`").
- **Long menus say they are menus.** An urge or channel inventory is followed by *you don't need to memorize it*.
- **A further inventory section follows these rules.** A lesson section that is neither the gap nor the forms, such as `## The sakes` or `## The marks`, is held to the same rules as `## The forms`. When it lists a long menu, it says it is a menu (*Nine sakes is a menu; you don't need to memorize it.*).
- **No bold run-in labels.** When the forms section adds several things, introduce each in an ordinary sentence (*First, … Second, … Third, …*), not under a bold label at the start of a paragraph. Bold stays for a term where it is defined.
- **Say when to leave it out.** Every lesson marks at least one place the drop-in is unnecessary, and none of them implies that plain English is a mistake: *none of the three is the "right" one*; *leave the suffix off when the reach doesn't matter*.
- **Rule out the near miss.** Where the obvious English reading is wrong, deny it in one short sentence (*the urge is not a plan*).
- **Endings.** Which scale each lesson teaches, and its cue, is in [Claritish track](grammar-docs.md#claritish-track); this page adds nothing to it. A [hyphenated suffix](#hyphenated-host) takes no ending.
- **Pronunciation** is taught once, in *How sure are you?*, in English keywords. Later lessons do not repeat it.

## The hyphenated English host
<a id="hyphenated-host"></a>

Claritish adds to an English word in two places: [label reach](/label-seams#label-reach), English word + `-th` + reach vowel (`lied-tha`), and [ability](/can-and-cant#ability-changeability), English verb + `-x` + vowel (`sing-xu`). The hyphen marks an English host and the letters after it are spelled exactly as Ageben spells them. Neither suffix takes an ending, because its vowel carries the meaning.

The hyphen belongs to Claritish only. Ageben writes these mid-word on an Ageben root with no hyphen (`vulamuthul`, `vozuyexal`; the ending is the one the Ageben word would take), so a lesson teaching a suffix never implies the hyphen survives into the full language.

**Marking:** a hyphenated English host (`lied-tha`) is an English span, so the build does not parse it. Table rows for a suffix use `-tha` or `-xa`, not `…-tha` (a template that does not parse). A tone mark attaches to the English word it colors and is written bare (`%You're the worst.`), not as a backtick span.

## Examples and practice
<a id="examples-practice"></a>

About five one-line examples in a single blockquote, two trailing spaces per line. They are ordinary adult situations (a shipped draft, a delayed flight, a rewritten memo, a sister laid off), not toy sentences, and they carry no Ageben beyond the drop-in. The [house cast](grammar-docs.md#house-cast) stays out of the lessons; names appear only in the full sentence on the closing page.

After the block, one short paragraph unpacks two or three of the examples, not all five, and picks the ones where the ending or the reach does the work.

Practice items give the English sentence in italics, then a parenthesized note saying **what the speaker means**, never which form to write ("(could be; you'll call and check)", not "(use `thomal`)"). A note may name the parts when the word is composed, as in *Wants and plans*. Answers go in `::: details Show answer`.

## No Ageben sentences, no glosses
<a id="no-glosses"></a>

Lessons carry no full Ageben sentences and no morph gloss lines. Explain a drop-in by what it means, never by cutting it into Ageben morphemes. Where a word is built from parts, label the parts in plain English in a table (the parts row in *What a feeling wants*), and that is the ceiling. The single glossed Ageben sentence on the closing page is the only one in the track.

## Back-references
<a id="back-references"></a>

Lessons carry no numbers. A lesson may name an earlier lesson by title, in plain text, when it reuses its form ("start from a thanks or sorry word from Thanks and sorry"), as a reminder of one word, not a recap. No links between lessons, no links into the grammar, and no previews of lessons ahead outside the list on the intro page.

## Editor cues and cards
<a id="editor-cards"></a>

The [journal editor](grammar-docs.md#claritish-track) is for private journaling: the writer talking to themselves. Its cues and card questions are hand-written data, its forms are not. The file formats (columns, pattern syntax, flow keys) are in [Claritish editor data](claritish-editor-data.md); this section is what to put in them.

### What counts as a cue
<a id="what-counts-as-a-cue"></a>

A cue is an English habit that a lesson's gap names. Every italic phrase in a cued lesson's gap must raise one of that lesson's cues or be marked exempt; the build checks it.

- **A cue has a drop-in to offer.** A habit with no fitting drop-in is not a cue: it goes to the grammar gap process, not into the editor.
- **Exclude the common uses that are not the trap** (*I think so*, *thanks to the rain*, *sorry to hear*).
- ***Labels*** marks a negative trait word after a subject and a copula (*he's a liar*, *I was so lazy*, *my boss is a liar*, *they're idiots*), and someone else's painful emotion word in the present tense (*he's anxious*), which calls a feeling a type. No praise words: the lesson's gap is about judgment.
- ***What a feeling wants*** and ***Feelings in full*** mark an emotion word only in the first person (*I'm so anxious*, *it made me angry*, *feeling proud*). A feelings drop-in names the writer's own feeling, so someone else's (*my sister was upset*) has no drop-in to offer. The emotion word stays in the sentence.
- **One lesson per word.** Leave out of a word list a word another lesson's cue already owns (*grateful* is a thanks) and a word that is mostly not about a person or a feeling (*stuck*, *down*, *lost*).

### Card copy and mirror names
<a id="card-copy"></a>

Questions ask what the writer means (*What will you do about the guess?*), with the lesson's default answer first. Use the grammar's terms as the lessons do.

Nothing implies English is a mistake: no *fix*, *error*, or *should*. *Leave it in English* is a normal outcome. A mirror name describes what is left in English, never a fault (*unmarked guesses*): no *missing*, no *should*.

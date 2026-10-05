# Agazan Introduction

**Agazan** (`agaza` + the name ending **-n**) translates to English *clarity*.

How these docs work, and what “good grammar design” means for this language.

## Purpose {#purpose}

Agazan encodes psychological distinctions into vocabulary and grammar so ordinary speech can nudge you toward **compassion**, **rationality**, and **empowerment**. Purpose, limits, and a tour of those aims: [Why Agazan](why-agazan.md).

For an easy start before the grammar, [Claritish](claritish/index.md) teaches a few Agazan words you can drop into English today.

## Grammar design {#grammar-design}

Three supporting goals sit beside the psychology:

- **Unambiguous but usable:** precise enough for automatic tools to understand, without making ordinary speech hard.
- **Singable phonology:** syllable shape chosen to be easy to sing.
- **Reusable grammar:** a small set of patterns does many jobs. The same few endings, the same vowel series, and the same scales come back across the grammar, so each pattern you learn keeps paying off on later pages.

Agazan keeps three kinds of clarity in ordinary speech.

### Syntactic {#syntactic}

In a clause, every content word (a word built on a root, such as a noun, verb, or adjective) begins with a **role letter**: a letter that names its role (subject, object, verb, …), so you never have to guess a word’s role from its position, as English often makes you do. The default order is subject, object, verb, but you may reorder the words freely, because each first letter still marks the role.

### Referential {#referential}

Pronouns copy an earlier word’s whole stem (the word without its role letter and ending) and point to the **most recently mentioned matching** word. A shorter **role pointer** names someone by the part they played in a recent event (*the latest doer*, *the other one*). A few specials cover speaker, listener, and similar roles.

**Compare with:** English *it* / *they*. Each pronoun points at one earlier match by a fixed rule, so you are not guessing among many possible things.

### Semantic {#semantic}

Each dictionary entry has one sense. When a meaning is related to a word but belongs to a different field, it gets an explicit compound instead: the field first, then the kind (for example, *love* in the *crush* sense is its own compound, not a second meaning of *love*). The [compound pages](x-compounds.md) teach the spelling.

### Tools those goals make possible
<a id="tools"></a>

Role letters, a small fixed set of endings, and spelling that tracks sound mean a program can label word class, reference, and pronunciation from the writing. What you write is the language; Inspect only names the parts. Speakers still get free order and a singable shape.

- **[Inspect](inspect.md):** paste a sentence and click or highlight a word to see its role, root sense, and how the clause hangs together.
- **Pronunciation:** on that same page, **IPA:** transcribes the text as spoken. Letter-to-sound spelling plus a small syllable inventory make pronunciation a mapping from the letters.

## How to learn from these docs
<a id="how-to-learn"></a>

Grammar pages use **Beginner** / **Intermediate** / **Advanced** sections. **Finish all Beginner material across all pages before Intermediate, then Advanced.** Not every page has all three, so skip a page that has no section at your current level.

Follow the **Agazan Lessons** in the site sidebar. Read each page’s Beginner section in that order, then go back to the start and read each page’s Intermediate section, then do the same for Advanced.

The sidebar **Tools** list includes [Terminology](terminology.md) for the English names these pages use for grammar (with a short gloss and a link to the teaching section), plus Lexicon and [Inspect](inspect.md) for roots and word-by-word breakdowns.

### Tables: Use, English, Same root as, and Cue
<a id="cues"></a>

Inventory tables on grammar pages use these kinds of cell:

| Column | What it is |
|--------|------------|
| **Agazan** | The word or letter you write. If **Same root as** is blank, this is the citation form of the word (how it is written on its own, outside a sentence). The in-clause spelling (with its role letter) appears only when **Same root as** names the everyday kind. |
| **Use** | What that form **does**, its job (subject, question, *because* joining two sentences). This is the rule. |
| **English** | What you would **say**: the sense to produce or understand. In translation practice, a person’s English is their name (*Azawan*), not the virtue word the name is built from. |
| **Same root as** | The everyday kind of that same root, written as a citation (**-l**), when this row’s English is a different word from that citation’s English: the *brick* root when the row’s English is *because*; the *eye* root when the row’s English is *see*. Leave it blank when English already is the citation (a row whose English is *climb* for the *climb* root). Not every table has this column. |
| **Cue** | A memory aid that helps you **remember** the letter, vowel, or picture that maps to that row. |

**Cue** is an optional memory helper. `≈` in a cue means “sounds like.” When **Same root as** is there, **Cue** does not repeat the everyday English; it only says why that picture maps.

Continue with [phonology.md](phonology.md#beginner) for letters and word edges, then [word-endings.md](word-endings.md#beginner) for citation endings (you can already say your name as a [greeting](word-endings.md#greeting)), then [clause.md](clause.md#beginner) for clause shape, [speech-moves.md](speech-moves.md#beginner) for turns, then [dependents.md](dependents.md#beginner).

## License {#license}

These grammar pages, the lexicon, and the language materials are by **humblevladimirthegreat** and are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Software and tooling that accompany them are under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

Reuse of particular grammatical ideas, lexicon entries, or a derived language is allowed. If you publish a derived language, a fork of the grammar, or a substantial adaptation, mention **Agazan** in the introduction (or equivalent front matter) as the source or inspiration.

Do not present a fork, variant, or other project as the official Agazan project or as a drop-in substitute for these docs. Calling an unchanged copy of this language Agazan is fine. Calling a substantially different language Agazan as if it were this project is not. The licenses do not grant trademark rights and do not allow implying endorsement by the licensor.

Suggested attribution: *Agazan by humblevladimirthegreat, licensed under CC BY 4.0.*

## Acknowledgments {#acknowledgments}

I would like to thank ClearerThinking.org and their book *The 12 Levers* for being a helpful compendium of scientifically validated personal growth techniques and noting their safety conditions.

I would also like to thank the Conlangs community on Reddit for their wealth of resources, ideas, and support for conlangers everywhere.

I also thank all the beta testers and reviewers for their feedback and questions.

The grammar site is built with VitePress; parsing uses Chevrotain and Peggy.

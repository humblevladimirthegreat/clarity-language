# Introduction to Agalan

**Agalan** (`agala` + proper **-n**) translates to English *clarity*.

How these docs work, and what “good grammar design” means for this language.

## Purpose
<a id="purpose"></a>

Agalan encodes psychological distinctions into vocabulary and grammar so ordinary speech can nudge **compassion → rationality → empowerment**. Purpose, limits, and a tour of those aims: [Why Agalan](why-agelan.md).

## Grammar design
<a id="grammar-design"></a>

Two supporting goals sit beside the psychology:

- **Unambiguous but usable:** so automatic tools can understand the language without making ordinary speech hard.
- **Singable phonology:** syllable shape chosen to be easy to sing.

Agalan keeps three kinds of clarity in ordinary speech.

### Syntactic
<a id="syntactic"></a>

In a clause, every content word begins with a letter that names its role (subject, object, verb, …), so you do not have to guess from English-style word class. Default order is Subject–Object–Verb, but free order is safe because that first letter is what counts.

### Referential
<a id="referential"></a>

Pronouns copy a short start of an earlier word’s root (through the second vowel) and point to the **most recently mentioned matching** word. A few specials cover speaker, listener, and similar roles.

**Compare with:** English *it* / *they*. The copy points at one earlier match, so you are not guessing among many possible things.

### Semantic
<a id="semantic"></a>

Each dictionary sense is one entry. Related senses across fields use an explicit compound: kind first, then the topic after mid-word **`x`** (`golovexagal` *love in the crush sense*).

### Tools those goals make possible
<a id="tools"></a>

Role letters, closed endings, and spelling that tracks sound mean a program can label word class, reference, and pronunciation from the writing. What you write is the language; Inspect only names the parts. Speakers still get free order and a singable shape.

- **[Inspect](inspect.md):** paste a sentence and click or highlight a word to see its role, root sense, and how the clause hangs together.
- **Text-to-speech:** on that same page, **Speak Agalan** plays the text. Letter-to-sound spelling plus a small syllable inventory make speech a mapping from the letters. **Show IPA** transcribes the same spoken forms.

## How to learn from these docs
<a id="how-to-learn"></a>

Grammar pages use **Beginner** / **Intermediate** / **Advanced** sections so you can finish all Beginner material across this folder before Intermediate, then Advanced. Not every page has every difficulty section, so skip that page if it doesn't have the difficulty you are currently on.

Follow the **Suggested reading order** in the site sidebar. Read each page’s Beginner section in that order, then go back to the beginning and read every pages' Intermediate, then same for Advanced.

The sidebar **Tools** list includes [Terminology](terminology.md) for the English names these pages use for grammar (with a short gloss and a link to the teaching section), plus Lexicon and [Inspect](inspect.md) for roots and interlinear.

### Tables: Use, English, and Cue
<a id="cues"></a>

Inventory tables on grammar pages use four kinds of cell:

| Column | What it is |
|--------|------------|
| **Agalan** | The word or letter you write. |
| **Use** | What that form **does** (subject, question, *because* as a clause glue). This is the rule. |
| **English** | What you would **say**: the sense to produce or understand. |
| **Cue** | A hook that helps you **remember** the letter, vowel, or picture that maps to that row. |

**Cue** is optional but helps with learning. `≈` in a cue means “sounds like.” 

Continue with [phonology.md](phonology.md#beginner) for letters and word edges, then [reference-suffix.md](reference-suffix.md#beginner) for citation endings, then [core.md](core.md#beginner) for clause shape.

## License
<a id="license"></a>

These grammar pages, the lexicon, and the language materials are by **humblevladimirthegreat** and are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Software and tooling that accompany them are under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

Reuse of particular grammatical ideas, lexicon entries, or a derived language is allowed. If you publish a derived language, a fork of the grammar, or a substantial adaptation, mention **Agalan** in the introduction (or equivalent front matter) as the source or inspiration.

Do not present a fork, variant, or other project as the official Agalan project or as a drop-in substitute for these docs. Calling an unchanged copy of this language Agalan is fine. Calling a substantially different language Agalan as if it were this project is not. The licenses do not grant trademark rights and do not allow implying endorsement by the licensor.

Suggested attribution: *Agalan by humblevladimirthegreat, licensed under CC BY 4.0.*

## Acknowledgments
<a id="acknowledgments"></a>

I would like to thank ClearerThinking.org and their book The 12 Levers for being a helpful compendium of scientifically-validated personal growth techniques and noting their safety conditions.

I would also like to thank the Conlangs community on Reddit for their wealth of resources, ideas, and support for conlangers everywhere.

I also thank all the beta testers and reviewers for your feedback and questions.

Speak uses KittenTTS (KittenML) in the browser via ONNX Runtime Web, with token mapping and voice-file loading adapted from kitten-tts-js. The grammar site is built with VitePress; parsing uses Chevrotain and Peggy.

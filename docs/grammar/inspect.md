---
aside: false
outline: false
---

# Inspect

Paste Agebon and click or highlight a word for a floating inspect card with part of speech, reference ending, lexicon or overlay gloss, and morph chips. Failed words stay in the stream with an error card. Highlight a join, span fence, or island brace (`{` / `}`) to inspect the construction.

**IPA:** below the input transcribes the spoken forms (phonology letter table, with syllable dots). Writing shorthand and span brackets expand to their spoken forms first; foreign `<>` interiors and compact loan words are skipped (not Agebon phonology).

**Copy Translation Prompt** copies a prompt that asks an LLM to translate the input into English, one numbered line per input line. Use a model at least as capable as Claude Opus 5.5.

<GlossViewer />

## English helper

Type English to see, clause by clause, which roots and grammar sections could carry each word. The helper only suggests: it never writes the sentence for you. When a word has several jobs (*by*, *for*, *could*), it shows them all side by side; pick one by meaning and open its section. Click a word in a suggestion to copy it. Dashed suggestions are leads rather than dictionary matches: a related WordNet word, a pattern the lessons teach, or a compound built on the spot. Words with no suggestion are listed at the end. Force a reading with a suffix: *saw/n*, *saw/v*, *light/adj*, *fast/adv*.

The level buttons hide grammar from later levels. **Copy Helper Prompt** copies a prompt that asks an LLM to write the Agebon from these suggestions, with the writing rules and matching examples from the lessons. Write your draft, or paste the model's, in the box at the bottom and **Send to inspector** to check it above.

<EnglishHelper />

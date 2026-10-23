---
aside: false
outline: false
search: false
---

# Wizard sandbox

A test bench for the wizard game's engine, for the designer and fluent testers: every root and every grammar feature the parser accepts is open. You are a wizard in a small school with two people to talk to and a few things to handle. Type one Ageben sentence at a time. Call someone before you ask or command them; to act yourself, put yourself in the subject.

Each turn ends one of four ways, and the failures always look different:

- **It worked**: the world changes, or someone answers. Your sentence's morph gloss shows under it.
- **It did not parse** (red): a character asks what you meant, or offers the likely meaning; the parser's own error is one tap away.
- **It parsed, but the game cannot do it yet** (purple): the words are fine, and the turn names the part the game cannot read.
- **Someone could not or would not** (amber): nobody was listening, the thing is not here, or a character refuses.

Tap a word for its gloss, and **English** for the free translation. **Pretend you have reached** sets how far along the lessons you are: narration switches to Ageben line by line as its grammar is reached, and lines above that level are marked. **Export turn log** saves every line you typed, how it parsed, and what happened. The log stays in this browser; nothing is sent anywhere.

<WizardSandbox />

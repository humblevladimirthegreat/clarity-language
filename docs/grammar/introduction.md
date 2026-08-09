# Introduction to Clarity

Why the language exists, how the grammar supports that, how to read the docs, and what bars new features must meet. Core clause grammar starts in **[language-reference.md](language-reference.md)**.

## Purpose

Clarity encodes psychological concepts and techniques into vocabulary and grammar so that using the language nudges you toward better habits. For example, there are two words for *to say*: one means “they literally said,” and the other “I perceived the meta-message to be.” That split helps you notice when you are adding your own interpretation, and it helps speakers stay mindful of attitude toward the listener.

The design aims at three outcomes, in this order:

### Compassion

Support self-acceptance and acceptance of others, and make judgments visible when they arise. Example: a personal possessive can mark gratitude for what you have — a [value](values.md) on `/w/` (`…xa…` = serves a named need).

### Rationality

Surface common biases that make self-delusion easy. Example: when you say you believe something, you can mark whether you also looked for disconfirming evidence (heard both sides) — a check against confirmation bias.

### Empowerment

Support authentic choice by making reasons for action visible. Example: when framing work to do, prefer numbered candidates (`zubezul g#1`, `zegogel g#2`, …) over bare *the problem* / *the solution* / *the goal* ([numbered alternatives](special-vocabulary.md#numbered-alternatives)). Reframe the same situation with paraphrase (**-m**, discourse **`el`/`em`**, or a paraphrase span — [spans.md](spans.md)), not a second digit.

**Why this order.** Rationality is hard without compassion first: lack of self-acceptance fuels motivated reasoning, so truth-seeking collapses into defense. Empowerment without rationality is foolish; without compassion it is antisocial; without both it is dangerous. So the stack is compassion → rationality → empowerment.

## Grammar design

Two supporting goals sit beside the psychology:

- **Unambiguous but usable** — so tutoring and other tools can rely on the parse without making ordinary speech hard.
- **Singable phonology** — syllable shape chosen to be easy to sing ([phonology.md](phonology.md)).

Clarity keeps three kinds of clarity in ordinary speech:

**Syntactic.** Every content word carries a PoS prefix, so role in the clause does not depend on guessing from English-style word class. Default order is SOV, but free order is safe because the prefix is authoritative.

**Referential.** Anaphoric pronouns are built from a fixed prefix of **any** prior word’s root (through the 2nd vowel) and resolve to the **most recently mentioned matching** antecedent ([pronouns.md](pronouns.md)), plus a small set of special discourse-role pronouns. There are no vague English-style *it* / *they* pronouns.

**Semantic.** Each dictionary sense is one entry. Related senses across fields use an explicit “in the sense of [topic]” compound pattern rather than unmarked polysemy.

**What stays vague on purpose.** You can say something is “good” without naming every facet. Derivations need not show that *food* and *cook* are related. Precision that would make the language hard to use is out of scope.

## How to learn from these docs

Grammar pages use **beginner** / **intermediate** / **advanced** sections so you can finish all beginner material across docs before intermediate, then advanced. Rubric: **[learning-levels.md](meta/learning-levels.md)**. Prose and example style: **[grammar-docs.md](meta/grammar-docs.md)**.

Start with [language-reference.md](language-reference.md) (core sentence grammar), then Beginner sections in the other grammar docs under `docs/`. Orientation on this page is not a learning band.

## Criterion for features
<a id="criterion-for-features"></a>

New language features should meet these bars:

* **Helps with language goals.** Supports compassion, rationality, and/or empowerment. Prefer research when it exists; user testing is fine when research is scarce.

* **Addresses a common problem.** Targets biases or friction that show up for most people. Rare edge cases do not justify heavy machinery.

* **Easy to use.** Explainable in roughly one paragraph plus a couple of examples; usable in sentences with at most about one extra second of thought after practice. Same bar guides how grammar sections are written ([grammar-docs.md](meta/grammar-docs.md)).

* **Avoids shame.** No option should read as the socially “correct” default. Each choice has situations where it belongs.

* **Reminders where they are needed.** Nudge compassion, rationality, or empowerment mainly where those failures are likely — accept some false positives, minimize pointless ones.

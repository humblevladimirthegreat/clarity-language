# Introduction to Agelan

**Agelan** (`agela` + proper **-n**) translates to English *clarity*.

Why the language exists, how the grammar supports that, how to read the docs, and what bars new features must meet. Core clause grammar starts in [core.md](core.md).

## Purpose

Agelan encodes psychological concepts and techniques into vocabulary and grammar so that using the language nudges you toward better habits. For example, there are two words for *to say*: one means “they literally said,” and the other “I perceived the meta-message to be.” That split helps you notice when you are adding your own interpretation, and it helps speakers stay mindful of attitude toward the listener.

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

Agelan keeps three kinds of clarity in ordinary speech:

**Syntactic.** In a clause, every content word carries a PoS prefix, so role does not depend on guessing from English-style word class. Default order is SOV, but free order is safe because the prefix is authoritative. Outside a sentence, prefix-less **root + ending** is a [citation](core.md#citation-forms) (not a default `/z/`).

**Referential.** Anaphoric pronouns are built from a fixed prefix of **any** prior word’s root (through the 2nd vowel) and resolve to the **most recently mentioned matching** antecedent ([pronouns.md](pronouns.md)), plus a small set of special discourse-role pronouns. There are no vague English-style *it* / *they* pronouns.

**Semantic.** Each dictionary sense is one entry. Related senses across fields use an explicit “in the sense of [topic]” compound pattern rather than unmarked polysemy.

**What stays vague on purpose.** You can say something is “good” without naming every facet. Derivations need not show that *food* and *cook* are related. Precision that would make the language hard to use is out of scope.

## How to learn from these docs
<a id="how-to-learn"></a>

Grammar pages use **Beginner** / **Intermediate** / **Advanced** sections so you can finish all Beginner material across this folder before Intermediate, then Advanced. This page is orientation only — not a learning band.

Suggested **Beginner** order:

1. This page — purpose, design goals, how to learn, feature criteria
2. [core.md](core.md#beginner) — clause shape, PoS, writing words, utterance framing, **`odo`**
3. [phonology.md](phonology.md#beginner) — letters, word edges, phonotactics (optional early)
4. [reference-suffix.md](reference-suffix.md#beginner) — **-l** / **-m** / **-n** / **-r**
5. [pronouns.md](pronouns.md#beginner) — resume **-r**, special discourse pronouns
6. [plurality.md](plurality.md#beginner) — associative **-sh**
7. [questions.md](questions.md#beginner) — **jol** / **jom**, fill-ask, polar stance
8. [predication.md](predication.md#beginner) — classification and identity (*to be*)
9. [revisers.md](revisers.md#beginner) — prefix-less *including* / *rather* / *instead* / *except*
10. [restrictors.md](restrictors.md#beginner) — `/h/` `/w/` applicability (*when*)
11. [coordination.md](coordination.md#beginner) — joins (phrase, VP, clause)
12. [spans.md](spans.md#beginner) — span fences and adjunct-scope islands
13. [numbers.md](numbers.md#beginner) — numerals, ranges, measure phrases
14. [comparatives.md](comparatives.md#beginner) — comparatives, superlatives, equatives
15. [causation.md](causation.md#beginner) — necessary / sufficient, *if* / *because*
16. [values.md](values.md#beginner) — needs and stances on `/h/` `/w/`
17. [special-vocabulary.md](special-vocabulary.md#beginner) — closed morphs and mood roots
18. [x-compounds.md](x-compounds.md#beginner) — mid-word **`x`** parser families

Then every peer’s **Intermediate** section (same page order), then every peer’s **Advanced**.

### Psychological features (tour only)
<a id="psychological-features"></a>

To see how compassion / rationality / empowerment land in the grammar, these pages carry that morphology:

1. [values.md](values.md) — needs and stances on `/h/` `/w/`
2. [special-vocabulary.md](special-vocabulary.md) — ability / incapability, roles, plan / predict, evidentiality, universality, emotion compose, **COMMENT**, **NOTIONAL**, numbered alternatives
3. [causation.md](causation.md#preference-vs-law) — preference as law
4. [comparatives.md](comparatives.md#judgment-benchmarks) — judgment benchmarks (*worse than…*)
5. [x-compounds.md](x-compounds.md) — mid-word **`x`** families (values vs ability vs roles)
6. [restrictors.md](restrictors.md) — applicability *when* (neighbor to values, not need-stance)

**Skip the full Beginner path only for a tour.** Those pages assume clause basics from earlier steps. To learn to speak or parse Agelan, stay with the order above.

## Criterion for features
<a id="criterion-for-features"></a>

New language features should meet these bars:

* **Helps with language goals.** Supports compassion, rationality, and/or empowerment. Prefer research when it exists; user testing is fine when research is scarce.

* **Addresses a common problem.** Targets biases or friction that show up for most people. Rare edge cases do not justify heavy machinery.

* **Easy to use.** Explainable in roughly one paragraph plus a couple of examples; usable in sentences with at most about one extra second of thought after practice. Same bar guides how grammar sections are written.

* **Avoids shame.** No option should read as the socially “correct” default. Each choice has situations where it belongs.

* **Reminders where they are needed.** Nudge compassion, rationality, or empowerment mainly where those failures are likely — accept some false positives, minimize pointless ones.

import type { ChatMessage } from "./llm-client.js";
import type { Check, Subject, Verdict } from "./lexicon-review-types.js";

const SYSTEM = `You are a careful English lexicographer reviewing entries of a constructed language's dictionary. Each entry pairs a CONCRETE sense (a picturable thing, action or expression, like an emoji) with an ABSTRACT sense (an intangible psychological or social concept reached by figurative extension), plus a MNEMONIC sentence that helps a learner see the link.
You only see English. Judge the English; do not guess at any other language.
Reply with JSON only, no markdown: {"score": <integer 1-5>, "reason": "<at most 15 words>"}.`;

const SYSTEM_TAGGED = SYSTEM.replace(
  '{"score": <integer 1-5>, "reason": "<at most 15 words>"}',
  '{"score": <integer 1-5>, "reason": "<at most 15 words>", "tag": "<short label or empty string>"}',
);

function msgs(question: string, system = SYSTEM): ChatMessage[] {
  return [
    { role: "system", content: system },
    { role: "user", content: question },
  ];
}

function scale(five: string, three: string, one: string): string {
  return `Scale: 5 = ${five}; 3 = ${three}; 1 = ${one}.`;
}

/** Validate `{score, reason, tag?}`; scores outside 1–5 or non-integers are rejected so the runner retries. */
export function parseVerdict(value: unknown): Verdict {
  if (typeof value !== "object" || value === null) throw new Error("verdict is not an object");
  const v = value as Record<string, unknown>;
  const score = Number(v.score);
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    throw new Error(`score must be an integer 1-5, got ${String(v.score)}`);
  }
  const reason = typeof v.reason === "string" ? v.reason.trim() : "";
  const tag = typeof v.tag === "string" && v.tag.trim() ? v.tag.trim() : undefined;
  return { score, reason, ...(tag ? { tag } : {}) };
}

const low = (score: number) => score <= 2;
const high = (score: number) => score >= 4;
const always = () => true;

const hasAbstract = (s: Subject) => Boolean(s.data.abstract);

const leap: Check = {
  id: "leap",
  description: "Is the abstract a natural figurative extension of the concrete?",
  kind: "row",
  select: hasAbstract,
  flagged: low,
  prompt(s, variant) {
    const { concrete, abstract } = s.data;
    const rubric = scale(
      "obvious and natural; most speakers would see the link at once",
      "plausible once explained",
      "arbitrary or unrelated",
    );
    return variant === 0
      ? msgs(`Concrete: "${concrete}"\nAbstract: "${abstract}"\n\nWould an English speaker find "${abstract}" a natural figurative extension (metaphor or metonymy) of "${concrete}"?\n${rubric}`)
      : msgs(`A teacher wants to convey the concept "${abstract}" using the image of "${concrete}". How easily would a learner see why that image stands for that concept?\n${rubric}`);
  },
};

const mnemonicSound: Check = {
  id: "mnemonic-sound",
  description: "Does the mnemonic actually connect concrete to abstract?",
  kind: "row",
  select: (s) => hasAbstract(s) && Boolean(s.data.mnemonic),
  flagged: low,
  prompt(s, variant) {
    const { concrete, abstract, mnemonic } = s.data;
    const rubric = scale(
      "a clear, memorable link that explains why the concrete stands for the abstract",
      "a link exists but is vague or forced",
      "it only restates a word, is circular, or links to something else",
    );
    return variant === 0
      ? msgs(`Concrete: "${concrete}"\nAbstract: "${abstract}"\nMnemonic: "${mnemonic}"\n\nDoes the mnemonic genuinely connect the concrete sense to the abstract sense?\n${rubric}`)
      : msgs(`Mnemonic: "${mnemonic}"\n\nA learner must remember that "${abstract}" goes with the image "${concrete}". Does this mnemonic help, or does it merely repeat one of the words?\n${rubric}`);
  },
};

const abstractIsAbstract: Check = {
  id: "abstract-is-abstract",
  description: "Is the abstract word really an intangible concept (not a physical thing)?",
  kind: "row",
  select: hasAbstract,
  flagged: low,
  prompt(s, variant) {
    const { abstract } = s.data;
    const rubric = scale(
      'clearly an intangible idea, feeling, stance or social practice (e.g. "trust")',
      'mixed, or could be either',
      'a physical object, place, body part or literal action (e.g. "hammer")',
    );
    return variant === 0
      ? msgs(`Word: "${abstract}"\n\nIs this word an abstract psychological or social concept?\n${rubric}`)
      : msgs(`Consider the word "${abstract}". Could you point to it, photograph it or hold it? How abstract is what it names?\n${rubric}`);
  },
};

const concreteIsConcrete: Check = {
  id: "concrete-is-concrete",
  description: "Is the concrete word really a picturable thing, action or expression?",
  kind: "row",
  select: (s) => Boolean(s.data.concrete),
  flagged: low,
  prompt(s, variant) {
    const { concrete } = s.data;
    const rubric = scale(
      "easily pictured as a single image, object, gesture or action",
      "picturable only with some context",
      "an abstract idea that is hard to picture",
    );
    return variant === 0
      ? msgs(`Word: "${concrete}"\n\nCould this word be shown as one emoji-like picture?\n${rubric}`)
      : msgs(`Imagine drawing "${concrete}" as a single icon. How easy and unambiguous would that icon be?\n${rubric}`);
  },
};

const sensePrimary: Check = {
  id: "sense-primary",
  description: "Is the intended abstract sense a major sense of that English word?",
  kind: "row",
  select: hasAbstract,
  flagged: low,
  prompt(s, variant) {
    const { concrete, abstract } = s.data;
    const rubric = scale(
      `"${abstract}" is commonly understood in exactly this sense`,
      'this sense exists but is secondary or technical',
      'this sense is rare, archaic or not a real sense of the word',
    );
    return variant === 0
      ? msgs(`An entry glosses the image "${concrete}" as the abstract word "${abstract}". In everyday English, is the sense of "${abstract}" that goes with this image a main sense of the word?\n${rubric}`)
      : msgs(`List the main senses of "${abstract}" in your head. Then decide: does the sense that relates to "${concrete}" rank among them?\n${rubric}`);
  },
};

const aliasFit: Check = {
  id: "alias-fit",
  description: "Is each search alias a near-synonym of the entry's abstract (or concrete) sense?",
  kind: "alias",
  select: () => true,
  flagged: low,
  prompt(s, variant) {
    const { concrete, abstract, alias } = s.data;
    const target = abstract ? `"${concrete}" / "${abstract}"` : `"${concrete}"`;
    const rubric = scale(
      "a near-synonym a learner might search for",
      "loosely related",
      "different meaning or misleading",
    );
    return variant === 0
      ? msgs(`Entry senses: ${target}\nSearch alias: "${alias}"\n\nIf a learner types "${alias}" to find this entry, is that a good search cue for it?\n${rubric}`)
      : msgs(`Word: "${alias}"\nEntry senses: ${target}\n\nHow close in meaning is "${alias}" to at least one of the entry's senses?\n${rubric}`);
  },
};

const ROLE_ENGLISH_NOTE =
  'In this dictionary one sense can fill other grammatical jobs, and the learner needs the English word for that job. A noun sense used as a verb names the typical action of that thing (ear -> "hear", nose -> "smell", eye -> "see"); a sense used as a degree word names the degree it evokes (hundred -> "completely"). The proposed word is NOT expected to share a part of speech with the sense.';

const roleEnglish: Check = {
  id: "role-english",
  description: "Is the packed role English the natural English word for that role of the sense?",
  kind: "role",
  select: () => true,
  flagged: low,
  prompt(s, variant) {
    const { sense, lemma, role } = s.data;
    const rubric = scale(
      `"${lemma}" is the obvious English ${role} for this sense`,
      "acceptable but not the closest fit",
      `"${lemma}" is unrelated to what the sense suggests in that job`,
    );
    return variant === 0
      ? msgs(`${ROLE_ENGLISH_NOTE}\n\nSense: "${sense}"\nGrammatical job: ${role}\nProposed English word: "${lemma}"\n\nIs "${lemma}" the natural English ${role} for the sense "${sense}"?\n${rubric}`)
      : msgs(`${ROLE_ENGLISH_NOTE}\n\nWhat English ${role} would a speaker use to express what "${sense}" suggests in that job? Someone proposes "${lemma}". How well does it fit?\n${rubric}`);
  },
};

function compoundPrompt(field: "concrete" | "abstract"): Check["prompt"] {
  return (s, variant) => {
    const { left, right, mnemonic } = s.data;
    const result = s.data[field];
    const rubric = scale(
      "the parts clearly build the meaning",
      "partly; needs the mnemonic to see it",
      "the parts do not lead to the meaning",
    );
    return variant === 0
      ? msgs(`A compound word is built from two parts: a modifier "${left}" and a head "${right}" ("${left}" specifies "${right}").\nIt is glossed as "${result}".\nMnemonic: "${mnemonic}"\n\nDoes modifier + head naturally yield "${result}"?\n${rubric}`)
      : msgs(`Target meaning: "${result}"\nBuilt as: a kind of "${right}" specified by "${left}".\n\nHow well does that construction describe the target meaning?\n${rubric}`);
  };
}

const compoundConcrete: Check = {
  id: "compound-concrete",
  description: "Does left + right yield the compound's concrete gloss?",
  kind: "compound",
  select: (s) => Boolean(s.data.left && s.data.right && s.data.concrete),
  flagged: low,
  prompt: compoundPrompt("concrete"),
};

const compoundAbstract: Check = {
  id: "compound-abstract",
  description: "Does left + right (with the mnemonic) yield the compound's abstract gloss?",
  kind: "compound",
  select: (s) => Boolean(s.data.left && s.data.right && s.data.abstract),
  flagged: low,
  prompt: compoundPrompt("abstract"),
};

const biasProne: Check = {
  id: "bias-prone",
  description: "Is the abstract concept commonly distorted by a cognitive bias or loaded framing?",
  kind: "row",
  select: hasAbstract,
  flagged: high,
  prompt(s, variant) {
    const { abstract } = s.data;
    const rubric = scale(
      "people routinely distort this concept (blame, certainty, entitlement, in-group favoritism, etc.)",
      "sometimes distorted",
      "rarely distorted; fairly neutral",
    );
    const tagNote = 'Put the main bias or distortion in "tag" (e.g. "fundamental attribution error"), or "" if none.';
    return variant === 0
      ? msgs(`Concept: "${abstract}"\n\nAs a psychologist: how prone is thinking about this concept to cognitive biases or loaded moral framing?\n${rubric}\n${tagNote}`, SYSTEM_TAGGED)
      : msgs(`People often reason badly about some concepts. Rate how error-prone everyday reasoning about "${abstract}" is.\n${rubric}\n${tagNote}`, SYSTEM_TAGGED);
  },
};

const biasImage: Check = {
  id: "bias-image",
  description: "Could the concrete image prime the bias its abstract concept is prone to?",
  kind: "row",
  select: (s) => hasAbstract(s) && Boolean(s.data.biasTag),
  flagged: high,
  prompt(s, variant) {
    const { concrete, abstract, biasTag } = s.data;
    const rubric = scale(
      "the image strongly pushes people toward the distortion",
      "might nudge a little",
      "neutral or counteracts the distortion",
    );
    return variant === 0
      ? msgs(`Concept: "${abstract}" (prone to: ${biasTag})\nTeaching image: "${concrete}"\n\nCould using this image to teach the concept prime or reinforce that bias?\n${rubric}`)
      : msgs(`A learner memorizes "${concrete}" as the picture for "${abstract}". Given the known risk (${biasTag}), does the picture make that mistake more likely?\n${rubric}`);
  },
};

const pairOrder = (s: Subject, variant: 0 | 1) =>
  variant === 0
    ? { a: s.data.aText, b: s.data.bText }
    : { a: s.data.bText, b: s.data.aText };

const pairSynonym: Check = {
  id: "pair-synonym",
  description: "Do two entries mean nearly the same thing (learner confusion risk)?",
  kind: "pair",
  select: (s) => s.data.pairKind !== "overlay",
  flagged: high,
  prompt(s, variant) {
    const { a, b } = pairOrder(s, variant);
    const rubric = scale(
      "near-identical meaning; a learner could not tell them apart",
      "overlapping but distinguishable",
      "clearly different meanings",
    );
    return msgs(`Entry A: ${a}\nEntry B: ${b}\n\nHow close in meaning are these two dictionary entries?\n${rubric}`);
  },
};

const overload: Check = {
  id: "overload",
  description: "Two entries share one English word: same sense (duplicate) or different senses (ambiguous gloss)?",
  kind: "pair",
  select: (s) => s.data.pairKind === "same-abstract",
  flagged: always,
  prompt(s, variant) {
    const { a, b } = pairOrder(s, variant);
    return msgs(
      `Two dictionary entries use the same English word for their abstract sense.\nEntry A: ${a}\nEntry B: ${b}\n\nAre they using the SAME sense of that word, or DIFFERENT senses?\nScale: 5 = same sense (duplicate); 3 = overlapping senses; 1 = clearly different senses (the word alone is ambiguous).\nPut "duplicate", "overlap" or "polysemy" in "tag".`,
      SYSTEM_TAGGED,
    );
  },
};

const specialFormConflict: Check = {
  id: "special-form-conflict",
  description: "Does a published abstract duplicate the meaning of a closed special-form gloss?",
  kind: "pair",
  select: (s) => s.data.pairKind === "overlay",
  flagged: high,
  prompt(s, variant) {
    const { a, b } = pairOrder(s, variant);
    const rubric = scale(
      "near-identical meaning",
      "overlapping but distinguishable",
      "clearly different",
    );
    return msgs(`Entry A: ${a}\nEntry B: ${b}\n\nDo these two entries mean the same thing?\n${rubric}`);
  },
};

export const CHECKS: Check[] = [
  leap,
  mnemonicSound,
  abstractIsAbstract,
  concreteIsConcrete,
  sensePrimary,
  aliasFit,
  roleEnglish,
  compoundConcrete,
  compoundAbstract,
  biasProne,
  biasImage,
  pairSynonym,
  overload,
  specialFormConflict,
];

export function getCheck(id: string): Check {
  const found = CHECKS.find((c) => c.id === id);
  if (!found) {
    throw new Error(`Unknown check "${id}". Known: ${CHECKS.map((c) => c.id).join(", ")}`);
  }
  return found;
}

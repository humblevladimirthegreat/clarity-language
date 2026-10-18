/**
 * Structural detectors: English grammar the tagger sees (tense, modals, questions, negation,
 * plurals, names, possessives, participle shapes) → the section that owns the job. The one
 * hand-kept table in the English helper; it holds only cue → anchor pointers, and
 * detectors.test.ts fails when an anchor stops existing.
 */
import type { ClauseFeatures, TaggedTerm } from "./tag.js";
import type { RouteClass } from "./wordnet-index.js";

export type DetectorHit = {
  /** Detector id (`past`, `modal-can`, …). */
  id: string;
  /** What the detector saw, in English (`past tense`, `modal *could*`). */
  label: string;
  /** Sections that own the job, `page.md#id` relative to docs/grammar, best first. */
  links: string[];
};

/** A clause-level detector: fires on the clause's features. */
type ClauseDetector = { id: string; label: string; links: string[]; test: (f: ClauseFeatures) => boolean };

/** A word-level detector: fires on one tagged word (seen with the word after it), which becomes its slot. */
type WordDetector = { id: string; label: (t: TaggedTerm) => string; links: string[]; test: (t: TaggedTerm, next?: TaggedTerm) => boolean };

export const CLAUSE_DETECTORS: readonly ClauseDetector[] = [
  { id: "used-to", label: "*used to* (habit)", links: ["say-tense.md#used-to"], test: (f) => !!f.usedTo },
  { id: "past-perfect", label: "past perfect", links: ["say-tense.md#past-perfect"], test: (f) => !!f.perfect && f.tense === "past" },
  { id: "present-perfect", label: "present perfect", links: ["say-tense.md#present-perfect"], test: (f) => !!f.perfect && f.tense !== "past" },
  { id: "past", label: "past tense", links: ["say-tense.md#simple-past", "say-tense.md#tense-jobs"], test: (f) => f.tense === "past" && !f.perfect && !f.usedTo },
  { id: "progressive", label: "progressive", links: ["say-tense.md#progressive"], test: (f) => !!f.progressive },
  { id: "future", label: "future", links: ["say-tense.md#future"], test: (f) => f.tense === "future" },
  { id: "question", label: "question", links: ["questions.md#question", "questions.md#question-tone"], test: (f) => f.question },
];

const MODAL_LINKS: Record<string, string[]> = {
  can: ["say-tense.md#can-may", "say-tense.md#ability-words"],
  could: ["say-tense.md#can-may", "say-tense.md#ability-words"],
  may: ["say-tense.md#can-may"],
  might: ["say-tense.md#can-may"],
  must: ["say-tense.md#must-should"],
  should: ["say-tense.md#must-should"],
  ought: ["say-tense.md#must-should"],
  will: ["say-tense.md#will-want", "say-tense.md#future"],
  shall: ["say-tense.md#will-want", "say-tense.md#future"],
  would: ["say-tense.md#used-to", "say-reasons.md#remote-unreal"],
};

const WH_LINKS: Record<string, string[]> = {
  who: ["questions.md#fill-all"],
  what: ["questions.md#fill-all", "questions.md#what-kind"],
  which: ["questions.md#what-kind"],
  when: ["questions.md#when"],
  where: ["questions.md#where"],
  whose: ["questions.md#whose"],
  how: ["questions.md#how"],
  why: ["questions.md#why"],
};

/** The section that teaches each role letter a content word lands on. */
export const ROLE_LINKS: Readonly<Record<string, string>> = {
  z: "clause.md#who-acts-and-the-action",
  v: "clause.md#who-acts-and-the-action",
  d: "clause.md#direct-object-d",
  b: "clause.md#extra-nouns",
  ɡ: "clause.md#adjectives-ɡ",
  h: "clause.md#adverbs-h",
};

/** Classes the lexicon leaves out on purpose (wordnet-index.ts routes) → the sections that say them. */
export const ROUTE_LINKS: Readonly<Record<RouteClass, string[]>> = {
  kin: ["numbers-applied.md#kin-generations", "say-people-places.md#kin-words"],
  young: ["say-people-places.md#young-animals", "clause.md#adjectives-ɡ"],
  female: ["say-people-places.md#young-animals", "clause.md#adjectives-ɡ"],
  male: ["say-people-places.md#young-animals", "clause.md#adjectives-ɡ"],
};

/** The lexicon sense whose root is the `/ɡ/` word for each animal class (*young* is the child root). */
export const ROUTE_QUALIFIERS: Readonly<Record<Exclude<RouteClass, "kin">, string>> = { young: "child", female: "female", male: "male" };

/** A listed compound reached from its parts, and a live `x` compound built from them. */
export const COMPOUND_LINKS = { listed: "x-compounds.md#lexical-compounds", live: "x-compounds.md#ordinary-compound-order" } as const;

const THIRD_PERSON = new Set(["he", "she", "it", "they", "him", "her", "them", "his", "its", "their", "theirs", "hers"]);

export const WORD_DETECTORS: readonly WordDetector[] = [
  { id: "modal", label: (t) => `modal *${t.normal}*`, links: [], test: (t) => t.cls === "modal" && t.normal in MODAL_LINKS },
  { id: "wh", label: (t) => `question word *${t.normal}*`, links: [], test: (t) => t.cls === "question" && t.normal in WH_LINKS },
  { id: "copula", label: (t) => `*${t.normal}* (is a / is the same as)`, links: ["predication.md#classification", "predication.md#identity"], test: (t, next) => t.tags.includes("Copula") && next?.cls !== "verb" },
  { id: "existence", label: () => "*there is* (a lone noun)", links: ["predication.md#existence"], test: (t, next) => t.normal === "there" && !!next?.tags.includes("Copula") },
  { id: "number", label: (t) => `number *${t.normal}*`, links: ["numbers.md#counts"], test: (t) => t.cls === "number" },
  { id: "and-or", label: (t) => `*${t.normal}* (a list)`, links: ["joins.md#and-lists-a", "joins.md#join-type-vowel-series"], test: (t) => t.cls === "conjunction" && (t.normal === "and" || t.normal === "or") },
  { id: "negation", label: (t) => `negation *${t.normal}*`, links: ["joins.md#negation-u"], test: (t) => t.cls === "negative" },
  { id: "we", label: () => "*we* (who is in the group?)", links: ["pronouns.md#special-pronouns", "plurality.md#person-role-x"], test: (t) => t.normal === "we" || t.normal === "us" || t.normal === "our" },
  { id: "third-person", label: (t) => `*${t.normal}* (point back)`, links: ["pronouns.md#resume-r"], test: (t) => THIRD_PERSON.has(t.normal) },
  { id: "possessive", label: () => "possessive *'s*", links: ["english.md#of"], test: (t) => !!t.possessive && t.cls !== "pronoun" },
  { id: "possessive-pronoun", label: (t) => `possessive *${t.normal}*`, links: ["english.md#of"], test: (t) => !!t.possessive && t.cls === "pronoun" },
  { id: "proper-name", label: () => "proper name", links: ["word-endings.md#proper-name--n"], test: (t) => !!t.proper },
  { id: "plural", label: () => "plural noun", links: ["plurality.md#associative"], test: (t) => t.cls === "noun" && !!t.plural && !t.proper },
  { id: "participle", label: (t) => (t.shape === "er" ? "doer noun (*-er*, *-or*)" : `*-${t.shape}* word used as ${t.cls === "noun" ? "a noun" : "an adjective"}`), links: ["english.md#participles"], test: (t) => !!t.shape },
];

/** Every link the detector table names, for the anchor test. */
export function detectorLinks(): string[] {
  return [
    ...Object.values(ROLE_LINKS),
    ...Object.values(ROUTE_LINKS).flat(),
    ...Object.values(COMPOUND_LINKS),
    ...CLAUSE_DETECTORS.flatMap((d) => d.links),
    ...WORD_DETECTORS.flatMap((d) => d.links),
    ...Object.values(MODAL_LINKS).flat(),
    ...Object.values(WH_LINKS).flat(),
  ];
}

export function detectClause(f: ClauseFeatures): DetectorHit[] {
  return CLAUSE_DETECTORS.filter((d) => d.test(f)).map(({ id, label, links }) => ({ id, label, links }));
}

export function detectWord(t: TaggedTerm, next?: TaggedTerm): DetectorHit[] {
  return WORD_DETECTORS.filter((d) => d.test(t, next)).map((d) => {
    const links = d.id === "modal" ? MODAL_LINKS[t.normal]! : d.id === "wh" ? WH_LINKS[t.normal]! : d.links;
    return { id: d.id === "modal" || d.id === "wh" ? `${d.id}-${t.normal}` : d.id, label: d.label(t), links };
  });
}

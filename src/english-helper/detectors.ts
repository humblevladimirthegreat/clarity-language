/**
 * Structural detectors: English grammar the tagger sees (tense, modals, questions, negation,
 * plurals, names, possessives, participle shapes, hook shapes) → the section that owns the job. The one
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
export const COMPOUND_LINKS = { listed: "compounds.md#lexical-compounds", live: "compounds.md#ordinary-compound-order" } as const;

const THIRD_PERSON = new Set(["he", "she", "it", "they", "him", "her", "them", "his", "its", "their", "theirs", "hers"]);

/**
 * A word built from a relation and a noun (*anti-war*, *pro-choice*, *transoceanic*, *homeward*, *water-powered*):
 * a hook prefix ([english.md](english.md#relation-prefixes)). A prefix needs its hyphen, so *process* and *interest*
 * stay words; *-ward* needs none, but the everyday *-ward* words are not built from a noun.
 */
const RELATION_PREFIX = /^(anti|pro|contra|counter|intra|inter|mid|para|trans|cross|near|off)-[a-z]/;
const RELATION_SUFFIX = /[a-z]-(powered|based|driven|free|derived|sourced|bound|spanning|adjacent|facing|borne)$/;
const TRANS_WORD = /^trans(oceanic|atlantic|pacific|continental|national|border)$/;
const NOT_WARD = new Set(["toward", "towards", "forward", "forwards", "backward", "backwards", "afterward", "afterwards", "awkward", "reward", "steward", "coward", "untoward", "wayward"]);
function relationWord(word: string): boolean {
  if (RELATION_PREFIX.test(word) || RELATION_SUFFIX.test(word) || TRANS_WORD.test(word)) return true;
  return /^[a-z]{3,}wards?$/.test(word) && !NOT_WARD.has(word);
}

/**
 * A kind named by a number idea (*quasi-friend*, *proto-love*, *multi-faith*, *tri-dialogue*, *three-part*, *first-order*):
 * a numeric prefix ([english.md](english.md#number-prefixes)). A prefix needs its hyphen, so *union* and *decide* stay words;
 * the tagger keeps the hyphen only on prefixes it knows (*quasi-friend* reads `quasi friend`).
 */
const NUMBER_PREFIX = /^(quasi|proto|multi|poly|uni|mono|bi|tri|quad|de|null|mega)-[a-z]/;
const NUMBER_PART = /^(one|two|three|four|five|six|seven|eight|nine)-(part|fold|sided|way|piece)$|^(first|second|third|zeroth|nth)-(order|class|rate)$/;
function numberPrefixWord(normal: string): boolean {
  const word = normal.replace(/ /g, "-");
  return NUMBER_PREFIX.test(word) || NUMBER_PART.test(word);
}

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
  { id: "relation-prefix", label: (t) => `*${t.normal}*: a hook prefix (the hook's vowels, \`x\` or \`mx\`, then the noun's root)`, links: ["english.md#relation-prefixes", "hooks.md#hook-prefixes"], test: (t) => relationWord(t.normal) },
  { id: "number-prefix", label: (t) => `*${t.normal}*: a numeric prefix (the number body, \`x\` or \`mx\`, then the noun's root)`, links: ["english.md#number-prefixes", "numeric-derivation.md#numeric-derivation"], test: (t) => numberPrefixWord(t.normal) },
  { id: "participle", label: (t) => (t.shape === "er" ? "doer noun (*-er*, *-or*)" : `*-${t.shape}* word used as ${t.cls === "noun" ? "a noun" : "an adjective"}`), links: ["english.md#participles"], test: (t) => !!t.shape },
];

/**
 * Same-role hooks ([including](hooks.md#including) … [except](hooks.md#except)): the word after
 * one keeps the role of the phrase before it (*the family, except Azawan* → `zazawan`).
 */
export const SAME_ROLE_HOOKS: Readonly<Record<string, string>> = {
  including: "hooks.md#including",
  except: "hooks.md#except",
  excluding: "hooks.md#except",
  "other than": "hooks.md#except",
  "instead of": "hooks.md#instead",
  "rather than": "hooks.md#instead",
  "or rather": "hooks.md#rather",
};

/** Sections for each shape a hook takes in English, keyed by what comes before or after it. */
export const HOOK_LINKS = {
  /** A preposition + noun with no table row: an extra-noun hook. */
  extraNoun: ["hooks.md#extra-noun", "hooks.md#extra-noun-intermediate", "relations.md#locative-relations"],
  sameRole: ["english.md#same-slot"],
  /** A hook right after another landmark describes that landmark. */
  landmark: ["hooks.md#extra-noun-intermediate"],
  /** A hook right after a subject or object can describe that noun. */
  onNoun: ["relations.md#locative-relations"],
  fromTo: ["numbers-applied.md#time", "relations.md#locative-relations"],
  resume: ["hooks.md#hook-resume"],
  blank: ["questions.md#where", "hooks.md#place-indefinites"],
} as const;

/** Words a hook can point back to with **-r** (*on it*, *through there*). */
const RESUME_TARGETS = new Set(["it", "them", "there"]);
/** Prepositions that close a *from … to* unit. */
const GOAL_WORDS = new Set(["to", "toward", "towards", "till", "until"]);

/** What the analyzer sees around a preposition or same-role cue run. */
export type HookContext = {
  /** The preposition or cue run, lowercase (`in`, `instead of`). */
  word: string;
  /** The word right after it. */
  next?: TaggedTerm;
  /** A noun right before it, with the role the analyzer gave it. */
  before?: { text: string; role?: string };
  /** For a same-role hook: the phrase whose role the next word keeps. */
  left?: { text: string; role?: string };
  /** A *from* earlier in the clause. */
  afterFrom: boolean;
  /** Last word of a question (*what does Azawan write with?*). */
  stranded: boolean;
  /** The slot already names a hook form, so the landmark notes apply. */
  hook: boolean;
};

export function detectHook(c: HookContext): DetectorHit[] {
  const same = SAME_ROLE_HOOKS[c.word];
  if (same) {
    const keeps = c.left ? `the role of *${c.left.text}*${c.left.role ? ` (/${c.left.role}/)` : ""}` : "the first phrase's role";
    return [{ id: "same-role-hook", label: `*${c.word}* between two phrases in one role: what follows keeps ${keeps}`, links: [same, ...HOOK_LINKS.sameRole] }];
  }
  const out: DetectorHit[] = [];
  if (c.next?.cls === "question" || c.stranded) out.push({ id: "hook-blank", label: `*${c.word}* + a question word: the hook + blank \`bar\` (\`ol bar\` *where?*, \`ael bar\` *with what?*)`, links: [...HOOK_LINKS.blank] });
  else if (c.next && RESUME_TARGETS.has(c.next.normal)) out.push({ id: "hook-resume", label: `*${c.word} ${c.next.normal}*: the hook points back with -r (\`aor\` *on it*)`, links: [...HOOK_LINKS.resume] });
  if (c.afterFrom && GOAL_WORDS.has(c.word)) out.push({ id: "from-to", label: "*from … to*: one unit, `ul` + the source first, then `ol` (reached) or `oel` (toward) + the goal", links: [...HOOK_LINKS.fromTo] });
  else if (c.hook && c.before?.role === "b") out.push({ id: "hook-on-landmark", label: `right after the landmark *${c.before.text}*: the hook describes *${c.before.text}*, not the clause`, links: [...HOOK_LINKS.landmark] });
  else if (c.hook && c.before && (c.before.role === "z" || c.before.role === "d")) {
    out.push({ id: "hook-on-noun", label: `after *${c.before.text}*: right after that noun the hook describes it (*the guard in a bank*); elsewhere it describes the event`, links: [...HOOK_LINKS.onNoun] });
  }
  return out;
}

/** Sections for *that* / *whether* opening a clause. */
export const OPENER_LINKS = {
  /** *tells someone that the dog runs*: a stand-in, then the clause as the next sentence. */
  content: ["dependents.md#dependent-clauses"],
  /** *glad that it rains*: the feeling word goes on the clause it is about. */
  feeling: ["sakes.md#feeling-no-object"],
  /** *the dog that runs*: two sentences. */
  relative: ["dependents.md#which-noun"],
} as const;

/** Words that start a clause after *that*: a subject pronoun, a name or noun, or an article. */
const CLAUSE_START = new Set(["noun", "pronoun", "determiner", "number"]);

/**
 * *that* or *whether* opening a clause. After a verb, an adjective or a name, a clause start
 * (*that the dog runs*) is content: a stand-in. After a common noun, a verb (*the dog that runs*)
 * is a relative clause. *that* alone (*I know that*) is neither.
 */
export function detectClauseOpener(word: string, prev?: TaggedTerm, next?: TaggedTerm): DetectorHit[] {
  if (word === "whether") {
    return [{ id: "whether-clause", label: "*whether* + a clause: the stand-in `dorl` last in the main sentence, then the clause as the next sentence", links: [...OPENER_LINKS.content] }];
  }
  if (word !== "that" || !prev || !next) return [];
  if (prev.cls === "noun" && !prev.proper && (next.cls === "verb" || next.cls === "auxiliary" || next.cls === "modal")) {
    return [{ id: "relative-that", label: `*${prev.text} that* + a verb: no relative word; say the clause as its own sentence, then the noun again`, links: [...OPENER_LINKS.relative] }];
  }
  if (!CLAUSE_START.has(next.cls) || !(prev.cls === "verb" || prev.cls === "adjective" || prev.cls === "noun" || prev.cls === "pronoun")) return [];
  const content: DetectorHit = { id: "that-clause", label: "*that* + a clause: a stand-in last in the main sentence (`darl` for what is said or thought), then the clause as the next sentence", links: [...OPENER_LINKS.content] };
  if (prev.cls !== "adjective") return [content];
  return [{ id: "feeling-that", label: `*${prev.text} that* + a clause: no stand-in; say the clause as the sentence, with the feeling word on \`/th/\` in it`, links: [...OPENER_LINKS.feeling] }, content];
}

/** The fallback for a preposition + noun that no table row names. */
export function extraNounHook(word: string): DetectorHit {
  return { id: "extra-noun-hook", label: `*${word}* + a noun: an extra-noun hook, then the noun in \`/b/\``, links: [...HOOK_LINKS.extraNoun] };
}

/** Every link the detector table names, for the anchor test. */
export function detectorLinks(): string[] {
  return [
    ...Object.values(SAME_ROLE_HOOKS),
    ...Object.values(HOOK_LINKS).flat(),
    ...Object.values(OPENER_LINKS).flat(),
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

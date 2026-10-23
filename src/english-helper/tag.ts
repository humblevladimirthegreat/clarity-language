/**
 * English tagging for the English helper: sentences and clauses, each word's lemma and word
 * class in context, and the clause features the detectors read. The only module that touches
 * the NLP library (compromise); everything else sees these types, so swapping the library
 * changes this file and the tests that pin its output.
 *
 * A reading can be forced with a suffix: `saw/n`, `saw/v`, `light/adj`, `fast/adv`.
 */
import nlp from "compromise";

type Doc = ReturnType<typeof nlp>;

/** A one-word document read as `tag` (compromise's `tag()` returns the untyped base view). */
function taggedAs(word: string, tag: string): Doc {
  const doc = nlp(word);
  doc.tag(tag);
  return doc;
}

export const WORD_CLASSES = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "determiner",
  "preposition",
  "conjunction",
  "modal",
  "auxiliary",
  "number",
  "question",
  "negative",
  "other",
] as const;
export type WordClass = (typeof WORD_CLASSES)[number];

export type TaggedTerm = {
  /** The word as written (after contractions are expanded). */
  text: string;
  /** Lowercase, punctuation stripped. */
  normal: string;
  /** Dictionary form in context (`went` → `go`, `children` → `child`). */
  lemma: string;
  cls: WordClass;
  /** The library's own tags, for display and tests. */
  tags: string[];
  plural?: boolean;
  possessive?: boolean;
  /** A capitalized name: tagged proper, or capitalized mid-sentence. */
  proper?: boolean;
  /** The sentence's first word, so its capital says nothing. */
  initial?: boolean;
  /** The reading came from a `word/n` suffix, not the tagger. */
  forced?: boolean;
  /** Verbs: `past`, `present` or `future` read off this word alone. */
  tense?: "past" | "present";
  /** Verbs and adjectives used as nouns: `-ing`, `-ed` participle, or `-er` doer shape. */
  shape?: "ing" | "ed" | "or";
  /** An *-ing* noun or adjective: the verb under it (*lying* → *lie*), when that is a known verb. */
  verb?: string;
  /** Numbers: what this word alone counts (*three*, *3* → 3; *third* → 3 with `ordinal`). */
  value?: number;
  ordinal?: boolean;
};

export type ClauseFeatures = {
  tense?: "past" | "present" | "future";
  perfect?: boolean;
  progressive?: boolean;
  usedTo?: boolean;
  /** Modal verbs in the clause (`can`, `could`, `must`, …), lowercase. */
  modals: string[];
  negated: boolean;
  question: boolean;
};

export type TaggedClause = { text: string; terms: TaggedTerm[]; features: ClauseFeatures };
export type TaggedSentence = { text: string; clauses: TaggedClause[] };

const FORCE_SUFFIX = /([\p{L}'’-]+)\/(n|v|adj|adv)\b/gu;
const FORCE_TAG = { n: "Noun", v: "Verb", adj: "Adjective", adv: "Adverb" } as const;
const FORCE_CLASS = { n: "noun", v: "verb", adj: "adjective", adv: "adverb" } as const;
const NEGATIVES = new Set(["not", "never", "no", "nobody", "nothing", "nowhere", "none", "neither", "nor"]);
const MODALS = new Set(["can", "could", "may", "might", "must", "shall", "should", "will", "would", "ought"]);
/** Prepositions the library tags as adjectives (*aboard the train*, *underneath the table*). */
const PREPOSITIONS = new Set(["aboard", "underneath", "beneath"]);
const POSSESSIVE_PRONOUNS = new Set(["my", "your", "his", "hor", "its", "our", "their", "mine", "yours", "hers", "ours", "theirs"]);

const model = (nlp.world() as { model: unknown }).model as { one: { lexicon: Record<string, string> }; two: { switches: Record<string, string> } };

/** A known English verb: the library's lexicon lists it as one, or as a noun / verb switch (*walk*). */
function isVerb(word: string): boolean {
  return model.one.lexicon[word] === "Infinitive" || (model.two.switches[word] ?? "").includes("Verb");
}

/** Doer nouns with no *-er* / *-or* under them. */
const IRREGULAR_DOERS: Readonly<Record<string, string>> = { liar: "lie", beggar: "beg" };

/** *lying* → *lie*, *walking* → *walk*; undefined when no known verb is under the *-ing*. */
function ingVerb(word: string): string | undefined {
  if (!/..ing$/.test(word)) return undefined;
  const verb = taggedAs(word, "Verb").verbs().toInfinitive().text().toLowerCase();
  return verb && verb !== word && isVerb(verb) ? verb : undefined;
}

/**
 * *teacher* → *teach*, *writer* → *write*, *runner* → *run*, *actor* → *act*; undefined when
 * no verb is under the *-er* / *-or*.
 */
export function doerVerb(noun: string): string | undefined {
  if (IRREGULAR_DOERS[noun]) return IRREGULAR_DOERS[noun];
  if (!/[^aeiou](er|or)$/.test(noun) || noun.length < 5) return undefined;
  const base = noun.slice(0, -2);
  const candidates = [base, `${base}e`, ...(/(.)\1$/.test(base) ? [base.slice(0, -1)] : [])];
  return candidates.find(isVerb);
}

type JsonTerm = { text: string; normal: string; root?: string; tags: string[]; pre?: string; post?: string };

function classOf(t: JsonTerm): WordClass {
  const has = (tag: string) => t.tags.includes(tag);
  if (NEGATIVES.has(t.normal) || (has("Negative") && !t.normal)) return "negative";
  if (has("QuestionWord")) return "question";
  if (has("Modal") || (MODALS.has(t.normal) && has("Verb"))) return "modal";
  if (has("Auxiliary") || has("Copula")) return "auxiliary";
  if (has("Pronoun") || POSSESSIVE_PRONOUNS.has(t.normal)) return "pronoun";
  if (has("Value") || has("Cardinal") || has("Ordinal")) return "number";
  if (has("Determiner")) return "determiner";
  if (has("Preposition") || PREPOSITIONS.has(t.normal)) return "preposition";
  if (has("Conjunction")) return "conjunction";
  if (has("Verb")) return "verb";
  if (has("Adjective")) return "adjective";
  if (has("Adverb")) return "adverb";
  if (has("Noun") || has("Date")) return "noun";
  return "other";
}

/** Lemma for a forced reading: the tagger's own lemma may belong to the other part of speech. */
function forcedLemma(word: string, kind: keyof typeof FORCE_TAG): string {
  if (kind === "n") return taggedAs(word, "Noun").nouns().toSingular().text().toLowerCase() || word.toLowerCase();
  if (kind === "v") return taggedAs(word, "Verb").verbs().toInfinitive().text().toLowerCase() || word.toLowerCase();
  return word.toLowerCase();
}

function shapeOf(term: JsonTerm, cls: WordClass): TaggedTerm["shape"] {
  const n = term.normal;
  if (cls === "noun" && doerVerb((term.root ?? n).toLowerCase())) return "or";
  if ((cls === "noun" || cls === "adjective") && n.endsWith("ing") && term.tags.includes("Gerund")) return "ing";
  if (cls === "adjective" && /ed$/.test(n) && term.root && term.root !== n) return "ed";
  return undefined;
}

function toTerm(t: JsonTerm, input: string, initial: boolean): TaggedTerm {
  const cls = classOf(t);
  const normal = t.normal.replace(/['’]s$/, "");
  let lemma = (t.root ?? normal).toLowerCase().replace(/['’]s$/, "");
  // compromise leaves some participles without a root (*seen*); conjugate them back.
  if (cls === "verb" && lemma === normal && !t.tags.includes("Infinitive")) lemma = taggedAs(normal, "Verb").verbs().toInfinitive().text().toLowerCase() || lemma;
  // Nor some plural nouns (a sentence-first *Cats*); singularize them.
  if (cls === "noun" && lemma === normal && t.tags.includes("Plural")) lemma = taggedAs(normal, "Noun").nouns().toSingular().text().toLowerCase() || lemma;
  const term: TaggedTerm = { text: t.text, normal, lemma, cls, tags: t.tags };
  if (initial) term.initial = true;
  if (t.tags.includes("Plural")) term.plural = true;
  if (t.tags.includes("Possessive")) term.possessive = true;
  // A name is written capitalized: compromise reads some lowercase nouns as surnames (*walker*).
  // Mid-sentence, a capital is enough; sentence-first, the analyzer decides (it knows the lexicon).
  if (/^\p{Lu}/u.test(t.text) && input.includes(t.text) && (t.tags.includes("ProperNoun") || (!initial && cls === "noun"))) term.proper = true;
  if (t.tags.includes("PastTense")) term.tense = "past";
  else if (t.tags.includes("PresentTense")) term.tense = "present";
  const shape = shapeOf(t, cls);
  if (shape) term.shape = shape;
  const verb = cls === "noun" || cls === "adjective" ? ingVerb(normal) : undefined;
  if (verb) term.verb = verb;
  if (cls === "number") {
    const value = (nlp(t.text).numbers().get() as unknown[])[0];
    if (typeof value === "number") term.value = value;
    if (t.tags.includes("Ordinal")) term.ordinal = true;
  }
  return term;
}

function features(clause: Doc, terms: TaggedTerm[], sentenceIsQuestion: boolean): ClauseFeatures {
  const f: ClauseFeatures = { modals: [], negated: terms.some((t) => t.cls === "negative"), question: sentenceIsQuestion };
  for (const t of terms) if (t.cls === "modal" && !f.modals.includes(t.normal)) f.modals.push(t.normal);
  if (clause.has("used to #Verb")) f.usedTo = true;
  for (const v of clause.verbs().json() as { verb: { grammar: { tense?: string; form?: string; progressive?: boolean }; negative?: boolean } }[]) {
    const g = v.verb.grammar;
    if (v.verb.negative) f.negated = true;
    if (!f.tense && g.tense) f.tense = g.tense === "PastTense" ? "past" : g.tense === "FutureTense" ? "future" : "present";
    if (g.form?.includes("perfect")) f.perfect = true;
    if (g.progressive || g.form?.includes("progressive")) f.progressive = true;
  }
  if (f.modals.includes("will") || f.modals.includes("shall")) f.tense = "future";
  return f;
}

/** Sentences → clauses → tagged words, with forced readings applied. */
export function tagEnglish(input: string): TaggedSentence[] {
  const forced: { word: string; kind: keyof typeof FORCE_TAG }[] = [];
  const text = input.replace(FORCE_SUFFIX, (_, word: string, kind: keyof typeof FORCE_TAG) => {
    forced.push({ word: word.toLowerCase(), kind });
    return word;
  });
  const doc = nlp(text);
  doc.contractions().expand();
  if (forced.length) {
    let next = 0;
    doc.terms().forEach((term) => {
      const f = forced[next];
      if (f && term.text("normal") === f.word) {
        term.tag(FORCE_TAG[f.kind]);
        next++;
      }
    });
  }
  doc.compute("root");

  const forcedQueue = [...forced];
  return doc.sentences().map((view: unknown) => {
    const sentence = view as Doc;
    const question = /\?\s*$/.test(sentence.text()) || sentence.questions().length > 0;
    let c = 0;
    const clauses = sentence.clauses().map((view: unknown) => {
      const clause = view as Doc;
      // `root` is a term option compute("root") adds; the typings predate it.
      const options = { terms: { normal: true, root: true } } as Parameters<Doc["json"]>[0];
      const json = (clause.json(options) as { terms: JsonTerm[] }[])[0]?.terms ?? [];
      const initialClause = c++ === 0;
      const terms = json.filter((t) => t.normal || t.tags.includes("Negative")).map((t, i) => toTerm(t, input, initialClause && i === 0));
      for (const term of terms) {
        const f = forcedQueue[0];
        if (f && term.normal === f.word) {
          forcedQueue.shift();
          Object.assign(term, { cls: FORCE_CLASS[f.kind], lemma: forcedLemma(term.text, f.kind), forced: true });
        }
        // An expanded contraction leaves an empty term tagged Negative: *couldn't* → *could* + *not*.
        if (!term.normal && term.tags.includes("Negative")) Object.assign(term, { text: "not", normal: "not", lemma: "not", cls: "negative" });
      }
      return { text: clause.text().trim(), terms, features: features(clause, terms, question) };
    }) as TaggedClause[];
    return { text: sentence.text().trim(), clauses };
  }) as TaggedSentence[];
}

/** A cue phrase as the words the tagger would see: lowercase, contractions expanded (`can't` → `can`, `not`). */
export function cueWords(text: string): string[] {
  const doc = nlp(text);
  doc.contractions().expand();
  return ((doc.json({ terms: { normal: true } }) as { terms: { normal: string }[] }[]).flatMap((s) => s.terms.map((t) => t.normal)))
    .map((w) => w.replace(/[^\p{L}\p{N}'’-]/gu, ""))
    .filter(Boolean);
}

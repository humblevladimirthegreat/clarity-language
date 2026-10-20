/**
 * English → Agebon helper analyzer: English text → per-clause slots of root and grammar
 * suggestions. Suggestion-only: it never assembles an Agebon sentence. A word with several
 * Agebon jobs lists all of them, in table order, with their teaching links.
 *
 * Data comes in as a `HelperData` (load.ts builds it from the docs and the lexicon CSVs), so
 * the analyzer itself reads no files.
 */
import type { EnglishEntry } from "../find/english.js";
import { searchEnglish } from "../find/english.js";
import type { Band } from "../lint/learning-order.js";
import { BANDS } from "../lint/learning-order.js";
import { markerToSpeech, digitsToSyllables } from "../tts/numbers.js";
import { grammarPath, matchCues, resolveLink, type CueIndex, type GrammarJob } from "./cues.js";
import type { CompoundRow } from "../lexicon-compounds.js";
import { COMPOUND_LINKS, detectClause, detectClauseOpener, detectHook, detectWord, extraNounHook, ROLE_LINKS, ROUTE_LINKS, ROUTE_QUALIFIERS, SAME_ROLE_HOOKS, type DetectorHit } from "./detectors.js";
import { lookupLexicon, rootsByForm, sideEnding, type LexiconIndex, type LexiconSuggestion } from "./lexicon.js";
import { doerVerb, tagEnglish, type ClauseFeatures, type TaggedTerm, type WordClass } from "./tag.js";
import { lookupRoute, lookupWordnet, senseSuggestions, type RouteClass, type WordnetIndex, type WordnetPos } from "./wordnet-index.js";

/** Every tier, best first. */
export const TIERS = ["root", "alias", "compound", "overlay", "grammar", "synonym", "broader", "route", "live", "gap"] as const;
export type Tier = (typeof TIERS)[number];

export type SectionInfo = { title: string; band?: Band };

export type HelperData = {
  lexicon: LexiconIndex;
  cues: CueIndex;
  /** Grammar-page English entries, for one-word gloss and table matches (`grammar` tier). */
  entries: readonly EnglishEntry[];
  /** `page.md#id` → title and band, for links and the stage filter. */
  sections: ReadonlyMap<string, SectionInfo>;
  /** Spelled words are shown only when this accepts them (the word parser). */
  wordParses?: (word: string) => boolean;
  /** The WordNet reverse index (`synonym`, `broader`, and class routes); absent, those tiers stay empty. */
  wordnet?: WordnetIndex;
  /** Listed compounds by `left+head` root, for two English words whose roots make one (*bed room*). */
  compoundParts?: ReadonlyMap<string, CompoundRow>;
};

export type RootSuggestion = LexiconSuggestion & {
  kind: "lexicon";
  /** Role letter the tagged word class implies (`v` for a verb, `z` / `d` / `b` for a noun by position). */
  role?: string;
  /** The section that teaches that role letter. */
  roleLink?: string;
  /** A house-cast name built on this root with **-n**. */
  name?: boolean;
  /** Role letter + form + ending, when the word parser accepts it. */
  word?: string;
  /** A listed compound whose left root and head are the two words' own roots (*bed room*). */
  fromParts?: { left: string; head: string };
  /** Aliases: the word on each side of the row (`gebevol` *pray*, `gebevom` *gratitude*), since a search word fits either. */
  sideWords?: { side: "concrete" | "abstract"; sense: string; word: string }[];
};
/** A doc example from the section a suggestion links, so the prompt shows the job in a sentence. */
export type SectionExample = { form: string; english: string; link: string };
/** A hook job or entry followed by a noun spells the whole phrase: the hook, then the noun's `/b/` word (`al bahazal`). */
type HookPhrase = { phrase?: string };
/** Shown when the suggestion spells no word of its own (a pattern, a detector). */
type Exampled = { example?: SectionExample };
export type JobSuggestion = GrammarJob & HookPhrase & Exampled & { kind: "job"; tier: "grammar" };
/** `form`: the word the detector spells for this English word (a number: `gragol` *three*). */
export type DetectorSuggestion = DetectorHit & Exampled & { kind: "detector"; tier: "grammar"; form?: string };
export type EntrySuggestion = HookPhrase & Exampled & { kind: "entry"; tier: "grammar"; form: string; english: string; link: string; band?: Band };
/**
 * A role compound for a doer noun (*teacher*, *dog walker*): the `route` tier, since the lexicon
 * leaves doers out on purpose. `usual` adds **`the`** (*a teacher*, the usual role); without it
 * the word is *someone who teaches*.
 */
export type RoleSuggestion = {
  kind: "role";
  tier: "route";
  /** The spelled role compound. */
  form: string;
  usual: boolean;
  /** The doer noun, singular (*teacher*). */
  noun: string;
  /** The English verb under the doer noun, and the event root it maps to. */
  verb: string;
  root: string;
  emoji: string;
  sense: string;
  /** The noun before the doer that specifies the event (*dog* in *dog walker*), and its root. */
  modifier?: { english: string; root: string };
  link: string;
};
/**
 * A word in a class the lexicon leaves out on purpose (wordnet-index.ts routes): a kin term, or a
 * young or sexed animal, said as the animal's root plus a `/ɡ/` word (*puppy* → *dog* + *young*).
 */
export type ClassSuggestion = {
  kind: "class";
  tier: "route";
  class: RouteClass;
  links: string[];
  /** Young and sexed animals: the animal's root, and the root for *young* / *female* / *male*. */
  animal?: RootSuggestion;
  qualifier?: LexiconSuggestion;
  /** The animal's word and the `/ɡ/` word, as said (`zodogal gahadol` *puppy*). */
  phrase?: string;
};
/**
 * A live `x` compound built from a modifier noun and a head noun that have roots
 * ([adding another piece](compounds.md#ordinary-compound-order)): open, no lexicon row.
 */
export type LiveSuggestion = {
  kind: "live";
  tier: "live";
  /** Role letter + stem + ending, accepted by the word parser. */
  form: string;
  stem: string;
  role: string;
  parts: { english: string; form: string; emoji: string; sense: string }[];
  link: string;
};
export type Suggestion = RootSuggestion | JobSuggestion | DetectorSuggestion | EntrySuggestion | RoleSuggestion | ClassSuggestion | LiveSuggestion;

export type Slot = {
  /** The English word or cue run, as written. */
  text: string;
  lemma: string;
  cls: WordClass;
  /** How the tagger read the word, when it matters: `saw read as verb *see*`. */
  reading?: string;
  suggestions: Suggestion[];
  /** Function words the clause carries without a word of their own (*the*, auxiliary *is*). */
  skipped?: boolean;
};

export type Gap = { word: string; lemma: string; cls: WordClass; tried: string[] };

export type AnalyzedClause = { text: string; features: ClauseFeatures; detectors: DetectorSuggestion[]; slots: Slot[] };
export type Analysis = { clauses: AnalyzedClause[]; gaps: Gap[] };

export type AnalyzeOptions = { stage?: Band };

const CONTENT: ReadonlySet<WordClass> = new Set(["noun", "verb", "adjective", "adverb"]);
const ARTICLES = new Set(["a", "an", "the"]);
/** Auxiliaries that carry tense, aspect or question order and nothing else. */
const BARE_AUX = new Set(["be", "is", "are", "am", "was", "were", "been", "being", "have", "has", "had", "having", "do", "does", "did"]);

/** The same-role hook ending at `j` (*except*, *instead of*), and where it starts. */
function sameRoleAt(terms: readonly TaggedTerm[], j: number): number | undefined {
  if (SAME_ROLE_HOOKS[terms[j]!.normal]) return j;
  if (j > 0 && SAME_ROLE_HOOKS[`${terms[j - 1]!.normal} ${terms[j]!.normal}`]) return j - 1;
  return undefined;
}

/** The nearest noun before `j`: the phrase a same-role hook at `j` copies its role from. */
function leftNoun(terms: readonly TaggedTerm[], j: number): number | undefined {
  for (let k = j - 1; k >= 0; k--) if (terms[k]!.cls === "noun") return k;
  return undefined;
}

/**
 * The role letter a word class implies; a noun's by position (after a preposition `b`, after the
 * verb `d`). After a same-role hook (*the family, except Azawan*) a noun keeps the role of the noun
 * before it, in `outer` (the sentence's earlier clauses) when the hook opens its clause.
 */
function classRole(terms: readonly TaggedTerm[], i: number, outer: readonly TaggedTerm[] = []): string | undefined {
  const t = terms[i]!;
  if (t.cls === "verb") return "v";
  if (t.cls === "adjective") return "ɡ";
  if (t.cls === "adverb") return "h";
  if (t.cls !== "noun") return undefined;
  for (let j = i - 1; j >= 0; j--) {
    const p = terms[j]!;
    const same = sameRoleAt(terms, j);
    if (same !== undefined) {
      const left = leftNoun(terms, same);
      if (left !== undefined) return classRole(terms, left, outer);
      const outerLeft = leftNoun(outer, outer.length);
      if (outerLeft !== undefined) return classRole(outer, outerLeft);
      j = same;
      continue;
    }
    if (p.cls === "preposition") return "b";
    if (p.cls === "verb" || p.cls === "auxiliary" || p.cls === "modal") return "d";
  }
  return "z";
}

/** The ASCII role letter used in spelling (`ɡ` is written `g`). */
function spellRole(role: string): string {
  return role === "ɡ" ? "g" : role;
}

const nameRoots = new WeakMap<LexiconIndex, Map<string, LexiconSuggestion>>();

/** A house-cast name is a root with **-n** (*Azawan* → `azawa`): the row it is built on. */
function nameRoot(data: HelperData, t: TaggedTerm): LexiconSuggestion | undefined {
  let byForm = nameRoots.get(data.lexicon);
  if (!byForm) nameRoots.set(data.lexicon, (byForm = rootsByForm(data.lexicon)));
  return t.normal.endsWith("n") ? byForm.get(t.normal.slice(0, -1)) : undefined;
}

/** Tiers whose form is a root or compound stem, so role letter + form + ending spells a word. */
const SPELLED_TIERS = new Set<LexiconSuggestion["tier"]>(["root", "compound", "synonym", "broader"]);

function asRootSuggestion(data: HelperData, s: LexiconSuggestion, role: string | undefined, name = false): RootSuggestion {
  const out: RootSuggestion = { ...s, kind: "lexicon", ...(role ? { role } : {}), ...(role && ROLE_LINKS[role] ? { roleLink: ROLE_LINKS[role] } : {}), ...(name ? { name: true } : {}) };
  const ending = name ? "n" : sideEnding(s.side);
  if (role && ending && SPELLED_TIERS.has(s.tier)) {
    const word = `${spellRole(role)}${s.form}${ending}`;
    if (!data.wordParses || data.wordParses(word)) out.word = word;
  }
  if (role && s.tier === "alias" && s.senses) {
    const sides = (["concrete", "abstract"] as const).flatMap((side) => {
      const sense = s.senses![side];
      const word = `${spellRole(role)}${s.form}${sideEnding(side)}`;
      return sense && (!data.wordParses || data.wordParses(word)) ? [{ side, sense, word }] : [];
    });
    if (sides.length) out.sideWords = sides;
  }
  return out;
}

function rootSuggestions(data: HelperData, t: TaggedTerm, role: string | undefined): RootSuggestion[] {
  const name = t.proper ? nameRoot(data, t) : undefined;
  const hits = name ? [name] : lookupLexicon(data.lexicon, [...new Set([t.lemma, t.normal])]);
  return hits.map((s) => asRootSuggestion(data, s, role, !!name));
}

const CLASS_POS: Partial<Record<WordClass, WordnetPos>> = { noun: "n", verb: "v", adjective: "a", adverb: "r" };

/** WordNet leads for a content word with no lexicon sense: `synonym`, then `broader`. */
function leadSuggestions(data: HelperData, t: TaggedTerm, role: string | undefined): RootSuggestion[] {
  if (!data.wordnet) return [];
  return lookupWordnet(data.wordnet, data.lexicon, [...new Set([t.lemma, t.normal])], CLASS_POS[t.cls]).map((s) => asRootSuggestion(data, s, role));
}

/** A kin term or a young or sexed animal: the class's sections, and for an animal its root and qualifier. */
function classSuggestion(data: HelperData, t: TaggedTerm, role: string | undefined): ClassSuggestion | undefined {
  const route = data.wordnet && lookupRoute(data.wordnet, [...new Set([t.lemma, t.normal])]);
  if (!route) return undefined;
  const out: ClassSuggestion = { kind: "class", tier: "route", class: route.class, links: ROUTE_LINKS[route.class] };
  if (route.class === "kin") return out;
  const animal = route.sense ? senseSuggestions(data.lexicon, route.sense)[0] : undefined;
  if (animal) out.animal = asRootSuggestion(data, animal, role);
  const qualifier = senseSuggestions(data.lexicon, ROUTE_QUALIFIERS[route.class]).find((s) => s.tier === "root");
  if (qualifier) out.qualifier = qualifier;
  const adjective = qualifier && asRootSuggestion(data, qualifier, "ɡ").word;
  if (out.animal?.word && adjective) out.phrase = `${out.animal.word} ${adjective}`;
  return out;
}

/** The slot's own top root, when it is a root-tier sense: what a compound is built from. */
function topRoot(slot: Slot | undefined): RootSuggestion | undefined {
  const first = slot?.suggestions[0];
  return first?.kind === "lexicon" && first.tier === "root" && !first.name ? first : undefined;
}

/**
 * Two nouns in a row (*bed room*, *tea shop*): the listed compound when their roots are a row's
 * left root and head, else a live `x` compound when the word parser accepts it. An adjective
 * before a noun (*a blue dog*) is a thing and a property, never a compound. No meaning-level
 * guessing (*sleeping room* → the bedroom compound): paraphrase is the LLM prompt's job
 * (llm-prompt.ts), and WordNet multiword synonyms count only because they are listed.
 */
function compoundSuggestions(data: HelperData, modifier: { term: TaggedTerm; slot: Slot } | undefined, head: RootSuggestion | undefined, role: string | undefined): (RootSuggestion | LiveSuggestion)[] {
  const left = topRoot(modifier?.slot);
  if (!modifier || !left || !head || head.tier !== "root" || !role) return [];
  const row = data.compoundParts?.get(`${left.form}+${head.form}`);
  if (row) {
    const listed: LexiconSuggestion = { tier: "compound", form: row.stem, emoji: "", sense: row.concrete, side: "concrete" };
    return [{ ...asRootSuggestion(data, listed, role), fromParts: { left: modifier.term.normal, head: head.sense } }];
  }
  const ending = sideEnding(head.side);
  if (!ending) return [];
  const stem = `${left.form}x${head.form}`;
  const form = `${spellRole(role)}${stem}${ending}`;
  if (data.wordParses && !data.wordParses(form)) return [];
  const part = (english: string, s: RootSuggestion) => ({ english, form: s.form, emoji: s.emoji, sense: s.sense });
  return [{ kind: "live", tier: "live", form, stem, role, parts: [part(modifier.term.normal, left), part(head.sense, head)], link: COMPOUND_LINKS.live }];
}

/**
 * A run of two or three content words ending in a noun whose joined form is a lexicon or WordNet
 * sense (*living room*, *living-room*): the run is one slot. Longest first. A WordNet lead joins
 * the run only when its last noun has no lexicon sense, so *big hand* stays *big* + *hand*.
 */
function ngramMatch(data: HelperData, terms: readonly TaggedTerm[], i: number): { end: number; hits: LexiconSuggestion[] } | undefined {
  for (let len = Math.min(3, terms.length - i); len >= 2; len--) {
    const run = terms.slice(i, i + len);
    if (!run.every((t) => CONTENT.has(t.cls) && !t.proper) || run[len - 1]!.cls !== "noun") continue;
    const words = [...run.slice(0, -1).map((t) => t.normal), run[len - 1]!.lemma];
    const keys = [words.join(" "), words.join("-"), words.join("")];
    const hits = lookupLexicon(data.lexicon, keys).filter((s) => s.tier !== "alias");
    const headListed = lookupLexicon(data.lexicon, [run[len - 1]!.lemma, run[len - 1]!.normal]).some((s) => s.tier !== "alias");
    const leads = !hits.length && !headListed && data.wordnet ? lookupWordnet(data.wordnet, data.lexicon, keys, "n").filter((s) => s.tier === "synonym") : [];
    if (hits.length || leads.length) return { end: i + len, hits: [...hits, ...leads] };
  }
  return undefined;
}

/** The event roots an English verb maps to: root-tier senses, `english_by_pos` verbs first. */
function eventRoots(data: HelperData, verb: string): LexiconSuggestion[] {
  const roots = lookupLexicon(data.lexicon, [verb]).filter((s) => s.tier === "root");
  return [...roots.filter((s) => s.roles?.includes("v")), ...roots.filter((s) => !s.roles?.includes("v"))].slice(0, 2);
}

/**
 * Role compounds for a doer noun ([role compounds](roles.md#role-compounds)): the usual role
 * (`zaxedehothel` *a teacher*) and the plain doer (`zaxedehol` *someone who teaches*), and, when a
 * noun before it specifies the event, the stacked stem (`zaxodogaxowogathel` *a dog walker*).
 */
function roleSuggestions(data: HelperData, t: TaggedTerm, role: string | undefined, modifier: TaggedTerm | undefined): RoleSuggestion[] {
  const verb = doerVerb(t.lemma);
  if (!verb || !role || !["z", "d", "b"].includes(role)) return [];
  const modRoot = modifier ? lookupLexicon(data.lexicon, [modifier.lemma, modifier.normal]).find((s) => s.tier === "root" && s.side === "concrete") : undefined;
  const out: RoleSuggestion[] = [];
  for (const root of eventRoots(data, verb)) {
    const ending = sideEnding(root.side);
    if (!ending) continue;
    const stems = [...(modRoot ? [{ stem: `${modRoot.form}x${root.form}`, modifier: { english: modifier!.normal, root: modRoot.form } }] : []), { stem: root.form }];
    for (const { stem, modifier: mod } of stems) {
      for (const usual of [true, false]) {
        const form = `${role}ax${stem}${usual ? "the" : ""}${ending}`;
        if (data.wordParses && !data.wordParses(form)) continue;
        out.push({
          kind: "role",
          tier: "route",
          form,
          usual,
          noun: t.lemma,
          verb,
          root: root.form,
          emoji: root.emoji,
          sense: root.sense,
          ...(mod ? { modifier: mod } : {}),
          link: usual ? "roles.md#usual-role" : "roles.md#role-compounds",
        });
      }
    }
  }
  return out;
}

/** One-word gloss or table rows on grammar pages that are exactly this word. */
function entrySuggestions(data: HelperData, words: readonly string[]): EntrySuggestion[] {
  const out: EntrySuggestion[] = [];
  for (const word of words) {
    for (const section of searchEnglish(data.entries, word).slice(0, 4)) {
      const hit = section.hits.find((h) => (h.entry.kind === "gloss" || h.entry.kind === "table") && h.score >= 4 && !h.via);
      if (!hit) continue;
      const link = `${grammarPath(section.page)}#${section.slug}`;
      if (out.some((o) => o.link === link && o.form === hit.entry.form)) continue;
      out.push({ kind: "entry", tier: "grammar", form: hit.entry.form, english: hit.entry.english, link, ...(section.band ? { band: section.band } : {}) });
    }
    if (out.length) break;
  }
  return out.slice(0, 3);
}

/** By `page.md#slug`, and by `page.md|title` for a link to an `<a id>` alias of the heading. */
type ExampleIndex = { examples: Map<string, EnglishEntry[]>; rows: Map<string, EnglishEntry[]> };

function titleKey(page: string, title: string): string {
  return `${page}|${title.replace(/[`*]/g, "")}`;
}
const exampleIndexes = new WeakMap<readonly EnglishEntry[], ExampleIndex>();

/** Doc examples by section, and table rows with a `Teach` link by section. */
function exampleIndex(data: HelperData): ExampleIndex {
  let index = exampleIndexes.get(data.entries);
  if (index) return index;
  index = { examples: new Map(), rows: new Map() };
  for (const entry of data.entries) {
    const map = entry.kind === "example" ? index.examples : entry.kind === "table" && entry.teach ? index.rows : undefined;
    for (const key of [`${grammarPath(entry.page)}#${entry.slug}`, titleKey(grammarPath(entry.page), entry.title)]) map?.set(key, [...(map.get(key) ?? []), entry]);
  }
  exampleIndexes.set(data.entries, index);
  return index;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * A doc example for a suggestion's sections: one in a linked section whose English says one of
 * `words`; else one in the section a linked table row teaches, when the row says the word
 * (*my house* in english.md → *My dog sleeps.* in hooks.md); else the first in a linked section.
 */
export function sectionExample(data: HelperData, links: readonly string[], words: readonly string[]): SectionExample | undefined {
  const index = exampleIndex(data);
  const at = (map: Map<string, EnglishEntry[]>, link: string) => {
    const title = data.sections.get(link)?.title;
    return map.get(link) ?? (title ? map.get(titleKey(link.split("#")[0]!, title)) : undefined);
  };
  const examples = { get: (link: string) => at(index.examples, link) };
  const rows = { get: (link: string) => at(index.rows, link) };
  const said = words.length ? new RegExp(`\\b(${words.map(escapeRegExp).join("|")})\\b`, "i") : undefined;
  const pick = (link: string, entry: EnglishEntry | undefined) => entry && { form: entry.form, english: entry.english, link };
  if (said) {
    for (const link of links) {
      const hit = pick(link, examples.get(link)?.find((e) => said.test(e.english)));
      if (hit) return hit;
    }
    for (const link of links) {
      for (const row of rows.get(link) ?? []) {
        if (!said.test(row.english)) continue;
        const taught = resolveLink(row.page, row.teach!);
        const list = examples.get(taught) ?? [];
        const hit = pick(taught, list.find((e) => said.test(e.english)) ?? list[0]);
        if (hit) return hit;
      }
    }
  }
  for (const link of links) {
    const hit = pick(link, examples.get(link)?.[0]);
    if (hit) return hit;
  }
  return undefined;
}

/** A form with no piece the word parser reads as words (`/ɡ/ / -r`, `one of six linkers + -m`): a pattern, not a spelling. */
function patternForm(data: HelperData, form: string): boolean {
  if (!data.wordParses) return false;
  return !form.split(" / ").some((piece) => {
    const words = piece.trim().replace(/[.?!]$/, "").split(/\s+/);
    return words.length > 0 && words.every((w) => /^[a-z]/.test(w) && data.wordParses!(w));
  });
}

/** Detectors, and grammar rows whose form is only a pattern, get an example of the job in a sentence. */
function addExamples(data: HelperData, suggestions: Suggestion[], words: readonly string[]): void {
  for (const s of suggestions) {
    if (s.kind === "detector") {
      if (s.form) continue;
      const example = sectionExample(data, s.links, words);
      if (example) s.example = example;
    } else if ((s.kind === "job" || s.kind === "entry") && patternForm(data, s.form)) {
      const example = sectionExample(data, [s.link], words);
      if (example) s.example = example;
    }
  }
}

/** A lone count or rank word spelled as a `/ɡ/` number word ([counts](numbers.md#counts)): *three* → `gragol`, *third* → `gregol`. */
function numberWord(data: HelperData, t: TaggedTerm): string | undefined {
  if (t.value === undefined || !Number.isInteger(t.value) || t.value < 0) return undefined;
  const word = `g${markerToSpeech(t.ordinal ? "#" : "+")}${digitsToSyllables(String(t.value))}l`;
  return !data.wordParses || data.wordParses(word) ? word : undefined;
}

function bandOf(data: HelperData, link: string, own?: Band): Band | undefined {
  return data.sections.get(link)?.band ?? own;
}

/** Hide grammar suggestions whose owning section is above the chosen level. */
function withinStage(data: HelperData, s: Suggestion, stage: Band | undefined): boolean {
  if (!stage) return true;
  const max = BANDS.indexOf(stage);
  const ok = (link: string, own?: Band) => {
    const band = bandOf(data, link, own);
    return !band || BANDS.indexOf(band) <= max;
  };
  if (s.kind === "job" || s.kind === "role" || s.kind === "live") return ok(s.link);
  if (s.kind === "class") return s.links.some((l) => ok(l));
  if (s.kind === "entry") return ok(s.link, s.band);
  if (s.kind === "lexicon") return (!s.anchor || ok(s.anchor)) && (!s.roleLink || ok(s.roleLink));
  return true;
}

function filterDetector(data: HelperData, d: DetectorHit, stage: Band | undefined): DetectorSuggestion | undefined {
  const links = d.links.filter((l) => withinStage(data, { kind: "entry", tier: "grammar", form: "", english: "", link: l }, stage));
  return links.length ? { ...d, links, kind: "detector", tier: "grammar" } : undefined;
}

/** Classes that may sit between a hook and its landmark noun (*in the big house*). */
const BEFORE_LANDMARK: ReadonlySet<WordClass> = new Set(["adjective", "number", "determiner"]);

/** A noun or pronoun after `end`, past articles, adjectives and numbers: the hook's landmark. */
function nounFollows(terms: readonly TaggedTerm[], end: number): boolean {
  for (const t of terms.slice(end)) {
    if (ARTICLES.has(t.normal) || BEFORE_LANDMARK.has(t.cls)) continue;
    return t.cls === "noun" || t.cls === "pronoun";
  }
  return false;
}

const HOOK_FORM = /^[aeiou]{1,2}[lmnr]$/;
const HOSTED_FORM = /^[hɡg][a-z]+$/;

/** Sections whose lone-hook rows are extra-noun hooks (a lone `al` elsewhere may be a range or *including*). */
const EXTRA_NOUN_SECTION = /^hooks\.md#extra-noun/;

/**
 * The word a job's form puts before its `/b/` landmark: a hook with `/b/` (`om / /b/`) or alone
 * in an extra-noun section (`al`), or a hosted relation with `/b/` (`hadahel / gadahel / /b/`).
 */
function hookHead(form: string, link: string): string | undefined {
  const parts = form.split(" / ").map((p) => p.trim());
  const head = parts[0]!;
  if (HOOK_FORM.test(head) && (parts.includes("/b/") || (parts.length === 1 && EXTRA_NOUN_SECTION.test(link)))) return head;
  if (HOSTED_FORM.test(head) && parts.includes("/b/")) return head;
  return undefined;
}

/** The `/b/` word of the noun slot after slot `n`, past skipped words and modifiers. */
function landmarkWord(slots: readonly Slot[], n: number): string | undefined {
  for (const next of slots.slice(n + 1)) {
    if (next.skipped || BEFORE_LANDMARK.has(next.cls)) continue;
    if (next.cls !== "noun") return undefined;
    return next.suggestions.find((s): s is RootSuggestion => s.kind === "lexicon" && !!s.word?.startsWith("b"))?.word;
  }
  return undefined;
}

/** Spell each hook job with the landmark that follows it (`al bahazal`); a hosted relation locks it with `bl-` (`hewom blahazal`). */
function spellHookPhrases(slots: readonly Slot[]): void {
  slots.forEach((slot, n) => {
    const hooks = slot.suggestions.filter((s): s is JobSuggestion | EntrySuggestion => (s.kind === "job" || s.kind === "entry") && !!hookHead(s.form, s.link));
    const landmark = hooks.length ? landmarkWord(slots, n) : undefined;
    if (!landmark) return;
    for (const s of hooks) {
      const head = hookHead(s.form, s.link)!;
      s.phrase = `${head} ${HOOK_FORM.test(head) ? landmark : `bl${landmark.slice(1)}`}`;
    }
  });
}

function readingOf(t: TaggedTerm): string | undefined {
  if (t.forced) return `forced: ${t.cls} *${t.lemma}*`;
  if (CONTENT.has(t.cls) && t.lemma !== t.normal) return `read as ${t.cls} *${t.lemma}*`;
  return undefined;
}

export function analyzeEnglish(data: HelperData, text: string, options: AnalyzeOptions = {}): Analysis {
  const { stage } = options;
  const clauses: AnalyzedClause[] = [];
  const gaps: Gap[] = [];
  for (const sentence of tagEnglish(text)) {
    const outer: TaggedTerm[] = [];
    for (const clause of sentence.clauses) {
      const terms = clause.terms;
      const roleOf = (k: number) => classRole(terms, k, outer);
      const cueMatches = matchCues(
        data.cues,
        terms.map((t) => t.normal),
        terms.map((t) => t.lemma),
      );
      const slots: Slot[] = [];
      for (let i = 0; i < terms.length; ) {
        // An auxiliary before its verb only carries tense or aspect, which the clause detectors cover.
        const auxBeforeVerb = (t0: TaggedTerm, k: number) => t0.cls === "auxiliary" && terms.slice(k + 1).some((n) => n.cls === "verb");
        // A capitalized first word the lexicon does not know is a name too (*Azawan's dog …*).
        const first = terms[i]!;
        if (first.initial && !first.proper && first.cls === "noun" && /^\p{Lu}/u.test(first.text) && !lookupLexicon(data.lexicon, [first.lemma, first.normal]).length) {
          first.proper = true;
        }
        // A name is not a cue: table rows that mention *Azawan* are examples, not its job.
        const cue = auxBeforeVerb(first, i) || first.proper ? undefined : cueMatches.find((m) => m.start === i);
        // A multi-word lexicon sense (*living room*) is one slot, unless a longer cue starts here.
        const ngram = ngramMatch(data, terms, i);
        const useNgram = ngram && (!cue || cue.end <= ngram.end);
        const match = useNgram ? undefined : cue;
        const end = useNgram ? ngram.end : match && match.end - match.start > 1 ? match.end : i + 1;
        const run = terms.slice(i, end);
        const t = run[run.length - 1]!;
        const one = run.length === 1;
        const jobs: JobSuggestion[] = (match?.jobs ?? []).map((j) => ({ ...j, kind: "job", tier: "grammar" }));
        const detectors = one ? detectWord(t, terms[end]).flatMap((d) => filterDetector(data, d, stage) ?? []) : [];
        // A number next to another (*twenty one*) is one amount the words alone do not spell.
        const count = one && t.cls === "number" && terms[i - 1]?.cls !== "number" && terms[end]?.cls !== "number" ? numberWord(data, t) : undefined;
        for (const d of detectors) if (d.id === "number" && count) d.form = count;
        const role = roleOf(i);
        const roots = useNgram ? ngram.hits.map((s) => asRootSuggestion(data, s, role)) : one && CONTENT.has(t.cls) ? rootSuggestions(data, t, role) : [];
        // A doer noun with a root of its own (*flower*) is not an *-er* participle or a role compound.
        const prev = terms[i - 1];
        const prevSlot = slots[slots.length - 1];
        const modifier = prev?.cls === "noun" && !prev.proper ? prev : undefined;
        const roles = one && t.cls === "noun" && !roots.length ? roleSuggestions(data, t, role, modifier) : [];
        const compounds = one && t.cls === "noun" && modifier && prevSlot?.text === prev!.text ? compoundSuggestions(data, { term: modifier, slot: prevSlot }, roots[0], role) : [];
        const listed = compounds.filter((c) => c.kind === "lexicon");
        const live = compounds.filter((c) => c.kind === "live");
        const leads = one && CONTENT.has(t.cls) && !roots.length && !roles.length && !t.proper ? leadSuggestions(data, t, role) : [];
        // A kin cue row (*aunt*) already names the kin section; the class route is for the words the tables leave out.
        const klass = one && t.cls === "noun" && !roots.length && !t.proper ? classSuggestion(data, t, role) : undefined;
        const routes = klass && !jobs.some((j) => klass.links.includes(j.link)) ? [klass] : [];
        const shownDetectors = roots.length ? detectors.filter((d) => d.id !== "participle") : detectors;
        // A table row that spells the same role compound repeats it; the built one says how it is made.
        const shownJobs = jobs.filter((j) => !roles.some((r) => j.form === r.form));
        // An alias is a search word, not a sense: a grammar row for the word (*grateful*) comes first.
        const senses = roots.filter((s) => s.tier !== "alias");
        const aliases = roots.filter((s) => s.tier === "alias");
        let suggestions: Suggestion[] = [...listed, ...senses, ...roles, ...shownJobs, ...shownDetectors, ...aliases].filter((s) => withinStage(data, s, stage));
        const skipped =
          one && !suggestions.length && (ARTICLES.has(t.normal) || (BARE_AUX.has(t.normal) && auxBeforeVerb(t, i)) || (t.normal === "to" && terms[end]?.cls === "verb"));
        if (!suggestions.length && !skipped && !t.proper) {
          suggestions = entrySuggestions(data, [...new Set([t.lemma, t.normal])]).filter((s) => withinStage(data, s, stage));
        }
        // A preposition or same-role cue run: the shape its hook takes, and a hook when no row names one.
        const hookWord = run.map((r) => r.normal).join(" ");
        if (!skipped && (SAME_ROLE_HOOKS[hookWord] || (t.cls === "preposition" && !t.proper))) {
          const inClause = leftNoun(terms, i);
          const outerLeft = inClause === undefined ? leftNoun(outer, outer.length) : undefined;
          const left =
            inClause !== undefined ? { text: terms[inClause]!.text, role: roleOf(inClause) } : outerLeft !== undefined ? { text: outer[outerLeft]!.text, role: classRole(outer, outerLeft) } : undefined;
          const before = terms[i - 1]?.cls === "noun" ? i - 1 : undefined;
          const hits = detectHook({
            word: hookWord,
            next: terms[end],
            ...(before !== undefined ? { before: { text: terms[before]!.text, role: roleOf(before) } } : {}),
            ...(left ? { left } : {}),
            afterFrom: terms.slice(0, i).some((p) => p.normal === "from" && p.cls === "preposition"),
            stranded: clause.features.question && end === terms.length,
            hook: suggestions.some((s) => (s.kind === "job" || s.kind === "entry") && !!hookHead(s.form, s.link)),
          });
          if (!suggestions.length && nounFollows(terms, end)) hits.push(extraNounHook(hookWord));
          suggestions.push(...hits.flatMap((d) => filterDetector(data, d, stage) ?? []));
        }
        // *that* / *whether* opening a clause: the opener's job replaces *that* as a pronoun or determiner.
        const opener = one ? detectClauseOpener(t.normal, terms[i - 1] ?? outer[outer.length - 1], terms[end]).flatMap((d) => filterDetector(data, d, stage) ?? []) : [];
        if (opener.length) suggestions = [...opener, ...suggestions.filter((s) => s.kind !== "job" && s.kind !== "entry")];
        // WordNet leads and live compounds rank below every listed match and grammar row.
        suggestions.push(...[...leads, ...routes, ...live].filter((s) => withinStage(data, s, stage)));
        addExamples(data, suggestions, [...new Set(run.flatMap((r) => [r.normal, r.lemma]))]);
        const slot: Slot = { text: run.map((r) => r.text).join(" "), lemma: one ? t.lemma : run.map((r) => r.normal).join(" "), cls: one ? t.cls : useNgram ? "noun" : "other", suggestions };
        const reading = one ? readingOf(t) : undefined;
        if (reading) slot.reading = reading;
        if (skipped) slot.skipped = true;
        slots.push(slot);
        if (!suggestions.length && !skipped && t.cls !== "number") {
          gaps.push({ word: slot.text, lemma: slot.lemma, cls: slot.cls, tried: [...new Set([t.lemma, t.normal, slot.lemma])] });
        }
        i = end;
      }
      spellHookPhrases(slots);
      const detectors = detectClause(clause.features).flatMap((d) => filterDetector(data, d, stage) ?? []);
      addExamples(data, detectors, []);
      clauses.push({ text: clause.text, features: clause.features, detectors, slots });
      outer.push(...terms);
    }
  }
  return { clauses, gaps };
}

/** The sections a suggestion links: its own, a detector's or route's list, or a root's overlay anchor and role letter. */
export function suggestionLinks(s: Suggestion): string[] {
  if (s.kind === "job" || s.kind === "entry" || s.kind === "role" || s.kind === "live") return [s.link];
  if (s.kind === "detector" || s.kind === "class") return s.links;
  return [s.anchor, s.roleLink].filter((l): l is string => !!l);
}

/** The best suggestion's tier for a slot: `gap` when there is none. */
export function slotTier(slot: Slot): Tier | "skip" {
  if (slot.skipped) return "skip";
  const tiers = new Set<Tier>(slot.suggestions.map((s) => s.tier));
  return TIERS.find((t) => tiers.has(t)) ?? "gap";
}

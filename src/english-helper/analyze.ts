/**
 * English → Agazan helper analyzer: English text → per-clause slots of root and grammar
 * suggestions. Suggestion-only: it never assembles an Agazan sentence. A word with several
 * Agazan jobs lists all of them, in table order, with their teaching links.
 *
 * Data comes in as a `HelperData` (load.ts builds it from the docs and the lexicon CSVs), so
 * the analyzer itself reads no files.
 */
import type { EnglishEntry } from "../find/english.js";
import { searchEnglish } from "../find/english.js";
import type { Band } from "../lint/learning-order.js";
import { BANDS } from "../lint/learning-order.js";
import { grammarPath, matchCues, type CueIndex, type GrammarJob } from "./cues.js";
import { detectClause, detectWord, ROLE_LINKS, type DetectorHit } from "./detectors.js";
import { lookupLexicon, rootsByForm, sideEnding, type LexiconIndex, type LexiconSuggestion } from "./lexicon.js";
import { doerVerb, tagEnglish, type ClauseFeatures, type TaggedTerm, type WordClass } from "./tag.js";

/** Every tier, best first. Phase 1 fills root, alias, compound, overlay, grammar and gap. */
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
};
export type JobSuggestion = GrammarJob & { kind: "job"; tier: "grammar" };
export type DetectorSuggestion = DetectorHit & { kind: "detector"; tier: "grammar" };
export type EntrySuggestion = { kind: "entry"; tier: "grammar"; form: string; english: string; link: string; band?: Band };
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
export type Suggestion = RootSuggestion | JobSuggestion | DetectorSuggestion | EntrySuggestion | RoleSuggestion;

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

/** The role letter a word class implies; a noun's by position (after a preposition `b`, after the verb `d`). */
function classRole(terms: readonly TaggedTerm[], i: number): string | undefined {
  const t = terms[i]!;
  if (t.cls === "verb") return "v";
  if (t.cls === "adjective") return "ɡ";
  if (t.cls === "adverb") return "h";
  if (t.cls !== "noun") return undefined;
  for (let j = i - 1; j >= 0; j--) {
    const p = terms[j]!;
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

function rootSuggestions(data: HelperData, t: TaggedTerm, role: string | undefined): RootSuggestion[] {
  const name = t.proper ? nameRoot(data, t) : undefined;
  const hits = name ? [name] : lookupLexicon(data.lexicon, [...new Set([t.lemma, t.normal])]);
  return hits.map((s) => {
    const out: RootSuggestion = { ...s, kind: "lexicon", ...(role ? { role } : {}), ...(role && ROLE_LINKS[role] ? { roleLink: ROLE_LINKS[role] } : {}), ...(name ? { name: true } : {}) };
    const ending = name ? "n" : sideEnding(s.side);
    if (role && ending && (s.tier === "root" || s.tier === "compound")) {
      const word = `${spellRole(role)}${s.form}${ending}`;
      if (!data.wordParses || data.wordParses(word)) out.word = word;
    }
    return out;
  });
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
  if (s.kind === "job" || s.kind === "role") return ok(s.link);
  if (s.kind === "entry") return ok(s.link, s.band);
  if (s.kind === "lexicon") return (!s.anchor || ok(s.anchor)) && (!s.roleLink || ok(s.roleLink));
  return true;
}

function filterDetector(data: HelperData, d: DetectorHit, stage: Band | undefined): DetectorSuggestion | undefined {
  const links = d.links.filter((l) => withinStage(data, { kind: "entry", tier: "grammar", form: "", english: "", link: l }, stage));
  return links.length ? { ...d, links, kind: "detector", tier: "grammar" } : undefined;
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
    for (const clause of sentence.clauses) {
      const terms = clause.terms;
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
        const match = auxBeforeVerb(first, i) || first.proper ? undefined : cueMatches.find((m) => m.start === i);
        const end = match && match.end - match.start > 1 ? match.end : i + 1;
        const run = terms.slice(i, end);
        const t = run[run.length - 1]!;
        const one = run.length === 1;
        const jobs: JobSuggestion[] = (match?.jobs ?? []).map((j) => ({ ...j, kind: "job", tier: "grammar" }));
        const detectors = one ? detectWord(t, terms[end]).flatMap((d) => filterDetector(data, d, stage) ?? []) : [];
        const role = classRole(terms, i);
        const roots = one && CONTENT.has(t.cls) ? rootSuggestions(data, t, role) : [];
        // A doer noun with a root of its own (*flower*) is not an *-er* participle or a role compound.
        const prev = terms[i - 1];
        const modifier = prev?.cls === "noun" && !prev.proper ? prev : undefined;
        const roles = one && t.cls === "noun" && !roots.length ? roleSuggestions(data, t, role, modifier) : [];
        const shownDetectors = roots.length ? detectors.filter((d) => d.id !== "participle") : detectors;
        // A table row that spells the same role compound repeats it; the built one says how it is made.
        const shownJobs = jobs.filter((j) => !roles.some((r) => j.form === r.form));
        let suggestions: Suggestion[] = [...roots, ...roles, ...shownJobs, ...shownDetectors].filter((s) => withinStage(data, s, stage));
        const skipped =
          one && !suggestions.length && (ARTICLES.has(t.normal) || (BARE_AUX.has(t.normal) && auxBeforeVerb(t, i)) || (t.normal === "to" && terms[end]?.cls === "verb"));
        if (!suggestions.length && !skipped && !t.proper) {
          suggestions = entrySuggestions(data, [...new Set([t.lemma, t.normal])]).filter((s) => withinStage(data, s, stage));
        }
        const slot: Slot = { text: run.map((r) => r.text).join(" "), lemma: one ? t.lemma : run.map((r) => r.normal).join(" "), cls: one ? t.cls : "other", suggestions };
        const reading = one ? readingOf(t) : undefined;
        if (reading) slot.reading = reading;
        if (skipped) slot.skipped = true;
        slots.push(slot);
        if (!suggestions.length && !skipped && t.cls !== "number") {
          gaps.push({ word: slot.text, lemma: slot.lemma, cls: slot.cls, tried: [...new Set([t.lemma, t.normal, slot.lemma])] });
        }
        i = end;
      }
      const detectors = detectClause(clause.features).flatMap((d) => filterDetector(data, d, stage) ?? []);
      clauses.push({ text: clause.text, features: clause.features, detectors, slots });
    }
  }
  return { clauses, gaps };
}

/** The best suggestion's tier for a slot: `gap` when there is none. */
export function slotTier(slot: Slot): Tier | "skip" {
  if (slot.skipped) return "skip";
  const tiers = new Set<Tier>(slot.suggestions.map((s) => s.tier));
  return TIERS.find((t) => tiers.has(t)) ?? "gap";
}

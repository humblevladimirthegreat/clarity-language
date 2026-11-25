/** Reader context: word keys, the `Ctx` and `Here` records, scope copying, and the frame builders every reader group shares. */
import { overlayKey, type ClassifyTables } from "../parse/classify.js";
import { overlayConstructionId } from "../parse/construction-trace.js";
import { endsAt } from "../parse/discourse-slots.js";
import { linkerEnglish } from "../parse/linkers.js";
import { hookLabel, joinMarkerLabel } from "../parse/morph-gloss-labels.js";
import type { NestedKind } from "../parse/boundaries.js";
import { FRAME_KEYS, newMemberHead, type ClauseScope, type ScopeFrame } from "../parse/scope.js";
import type {
  AnaphorBind,
  Clause,
  CoordShared,
  LexWord,
  NpCoord,
  NumberStem,
  ParseResult,
  SharedRecord,
} from "../parse/types.js";
import { formatNumberGroup } from "../parse/morph-gloss-tables.js";
import { classOf, overlayClassKey } from "./classes.js";
import { toneFrame } from "./tones.js";
import type { Detail, Frame, Link, LinkKind, Reading, ReadingId, Term, Unread } from "./types.js";

export type ReadOptions = {
  /** Needed to read a quote's words (they are parsed as their own text). Without them a quote is an `unread` entry. */
  tables?: ClassifyTables;
  /** The text id that starts every {@link ReadingId}. */
  text?: string;
  /**
   * In an aside: the term already read outside it from a word, for a pronoun in the aside that points back out
   * (spans.md#asides-th). The reader sets it on an aside's words only.
   */
  outerTerm?: (word: LexWord) => Term | undefined;
};

// ── Keys ────────────────────────────────────────────────────────────────────

/** The classification-table key one word reads by (interpreter.md#classification-table). */
export function wordKey(word: LexWord, closes?: number[]): string {
  const family = word.family;
  const pos = word.pos ?? "";
  switch (family.kind) {
    case "say":
      return "wordFamily:say";
    case "joinMarker":
      if (word.reading !== "join") break;
      if (pos === "th" && family.series === "u" && closes?.length === 0) return "joinSeries:u:standalone";
      return `joinSeries:${family.series}`;
    case "tag":
      return "wordFamily:tag";
    case "foreign":
      return "wordFamily:foreign";
    case "writingSpan":
      return "unit:writingSpan";
    case "hookCompound":
      return "wordFamily:hookCompound";
    case "hook":
      return "unit:hook";
    case "x":
      if (family.xFamily === "holder" || family.xFamily === "ability" || family.xFamily === "pointer") return `xFamily:${family.xFamily}`;
      break;
  }
  switch (word.reading) {
    case "overlay":
      return word.overlay ? overlayClassKey(word.overlay) : "lexReading:overlay";
    case "sake":
      return pos === "g" ? "lexReading:sake:g" : "lexReading:sake";
    case "restrictor":
      return pos === "w" ? "lexReading:restrictor:w" : "lexReading:restrictor";
    case "number":
      return pos === "th" ? "lexReading:number:th" : "lexReading:number";
    case "ordinary":
      if (pos === "th" && family.kind === "content") return "slot:th";
      if (pos === "h") return "unit:h";
      if (pos === "w") return "slot:w";
      if (pos === "g") return word.gl ? "slot:gl" : "slot:adj";
      return "lexReading:ordinary";
    default:
      return `lexReading:${word.reading}`;
  }
}

/** The construction id a word carries for one key, or the key when no id names it. */
export function constructionFor(key: string, word?: LexWord): string {
  const [type, name] = key.split(":");
  if (!word) return key;
  if (type === "overlay" && word.overlay) return overlayConstructionId(word.overlay);
  switch (type) {
    case "lexReading":
      return `word.reading.${name}`;
    case "wordFamily":
      return `word.family.${name}`;
    case "xFamily":
      return `word.xFamily.${name}`;
    case "joinSeries":
      return `join.${name}`;
    case "reading":
      return `reading.${name}`;
    case "unit":
      return name === "writingSpan" ? "word.family.writingSpan" : key;
    case "edge":
      return { force: "token.force", interjection: "token.yInterjection", vocative: "token.yVocative", polar: "token.polar" }[name!] ?? key;
    default:
      return key;
  }
}

export const SAY_VALUES = (word: LexWord): Record<string, string> => {
  const family = word.family;
  if (family.kind !== "say") return {};
  return { reach: family.reach, part: family.part, answer: family.answer, ...(word.ending ? { ending: word.ending } : {}) };
};

/** The shorthand symbol of each speech marker (number-markers.md#writing-preferred-shorthand). */
const MARKER_SYMBOL: Record<string, string> = { ra: "+", ru: "-", ro: "#", re: "_", ruo: "#-", rue: "#_", rua: "+-" };

/**
 * A number stem as its shorthand body, with no role letter or ending mark (`+3`, `#2`, `+5e3,860`): the marker symbol,
 * a digitless exponent, then the digit groups. Both writings of one number give the same body
 * (number-markers.md#writing-preferred-shorthand: "Both writings name the same word").
 */
export function numberBody(stem: NumberStem): string {
  const marker = stem.calendarOrdinal ? "_#" : (MARKER_SYMBOL[stem.marker] ?? stem.marker);
  return `${marker}${stem.digitlessExp ?? ""}${stem.groups.map(formatNumberGroup).join(",")}`;
}

export function wordValues(word: LexWord): Record<string, string> {
  const family = word.family;
  const values: Record<string, string> = {};
  if (family.kind === "say") Object.assign(values, SAY_VALUES(word));
  if (family.kind === "joinMarker") {
    values.series = family.series;
    // A hooked join's or restrictor's hook: which relation to the landmark bounds it (hooked-joins.md#hooked-joins).
    if (family.hook) values.hook = family.hook;
  }
  // An ability word's vowel: can, or which kind of can't (can-and-cant.md#ability); a sake's or scope's vowel likewise.
  if (family.kind === "x" && family.stanceVowel) values.stanceVowel = family.stanceVowel;
  // A tag's vowels: which tags it names (tag-pronouns.md#naming-with-a-tag, two stacked in #tag-pairs).
  if (family.kind === "tag") values.tag = family.vowels.join("");
  // A hook's vowels, which say its relation (hooks.md, ranges.md#ranges); its ending is `ending`.
  if (family.kind === "hook" && word.ending) values.series = family.form.slice(0, -word.ending.length);
  if (word.overlay) values.gloss = word.overlay.gloss;
  if (word.ending && family.kind !== "say") values.ending = word.ending;
  // A plural `-x` on the word (plurality.md#associative).
  if (word.plural) values.plural = "x";
  return values;
}

// ── Context ─────────────────────────────────────────────────────────────────

export type Ctx = {
  result: ParseResult;
  options: ReadOptions;
  text: string;
  scopes: Map<Clause, ClauseScope>;
  /** The scope record of each turn with no body, by utterance (a bare question, a call). */
  bodiless: Map<number, ClauseScope>;
  anaphors: Map<LexWord, AnaphorBind>;
  /**
   * Each term read so far, by the word it was built from (a thing, number, pronoun, ...): a later pronoun that resumes
   * that word points at it (reader rule 6). A list is found by its join word in `lists`.
   */
  terms: Map<LexWord, Term>;
  blanks: Set<LexWord>;
  /** Phrases inside a title (proper-names.md#titled-phrases): a name's wording, no new member. */
  titled: Set<NpCoord>;
  shared: Map<LexWord, SharedRecord[]>;
  /** The resolve stage's record for each shared word, keyed by the tree's shared item. */
  sharedItems: Map<CoordShared, SharedRecord>;
  /**
   * First reading id of each sentence, in text order: what a linker, grounds or answer points to. `goodbye` marks a
   * sentence the resolve stage read as a goodbye (`ResolveInfo.goodbyes`).
   */
  sentences: { utterance: number; body: number; id: ReadingId; goodbye?: true }[];
  /** A dependent's reading, made once where its stand-in names it. */
  dependents: Map<Clause, Reading>;
  /** Each list term by the join words of its parts: where a *respectively* link finds its partner list. */
  lists: Map<LexWord, Term>;
  /** Each *respectively* link and its `/w/` word, filled once every list is read. */
  pairings: { link: Link; marker: LexWord }[];
};

export type Here = {
  ctx: Ctx;
  reading: Reading;
  utterance: number;
  body: number;
  /** A hook detail waiting for the phrase right after it: its landmark, or the phrase it joins to (in-clause-hooks.md#in-clause). */
  pendingHook?: Detail;
};

export function frameOf(key: string, word: LexWord | undefined, here: Here | undefined): Frame {
  const row = classOf(key);
  if (!row || !row.cls.startsWith("frame:")) {
    if (here) here.reading.unread.push({ construction: constructionFor(key, word), key, ...(word ? { word } : {}), reason: "noRow" });
    return { family: "unknown", construction: constructionFor(key, word), key, anchor: "", words: word ? [word] : [], values: {} };
  }
  const family = row.cls.slice("frame:".length) as Frame["family"];
  return { family, construction: constructionFor(key, word), key, anchor: row.anchor, words: word ? [word] : [], values: word ? wordValues(word) : {} };
}

/**
 * A holder seam's host stance: the channel, MAY or NOTIONAL its left root names (holder.md#naming-a-holder). The seam word has
 * no overlay of its own, so the host row's gloss is the stance word's own field, as a plain `/th/` overlay carries it.
 */
export function holderHostValues(word: LexWord, tables: ClassifyTables | undefined): Record<string, string> {
  const family = word.family;
  if (family.kind !== "x" || !tables || !family.leftRoots[0]) return {};
  const row = tables.overlays.get(overlayKey("th", `${family.leftRoots[0]}${family.grade ?? ""}`));
  return row ? { gloss: row.gloss } : {};
}

export function fromScope(frame: ScopeFrame, tables: ClassifyTables | undefined): Frame {
  // A tone mark has no word of its own (tone-marks.md#showing-your-tone).
  if (frame.tone) return toneFrame(frame.tone);
  const out = frameOf(frame.key, frame.word, undefined);
  if (frame.holderHost) out.values = { ...holderHostValues(frame.word, tables), ...out.values };
  return {
    ...out,
    family: frame.family,
    ...(frame.member ? { member: frame.member } : {}),
    ...(frame.holderHost ? { holderHost: true as const } : {}),
    // A restrictor's occasion list; each word's detail joins it as the reader meets the word (readH).
    ...(frame.occasions ? { occasions: [] } : {}),
    // A call names the addressee (speech-moves.md#vocative).
    ...(frame.key === "edge:vocative" ? { party: thing(frame.word) } : {}),
  };
}

/** Copy a scope record's frames, orders and unsettled pairs into a reading (reader rule 3). */
export function copyScope(reading: Reading, scope: ClauseScope | undefined, tables: ClassifyTables | undefined): void {
  if (!scope) return;
  const byScope = new Map<ScopeFrame, Frame>();
  for (const frame of scope.frames) {
    const copy = fromScope(frame, tables);
    byScope.set(frame, copy);
    reading.frames.push(copy);
  }
  for (const o of scope.order) reading.order.push({ over: byScope.get(o.over)!, under: byScope.get(o.under)!, kind: o.kind, anchors: o.anchors });
  for (const u of scope.unordered) reading.unordered.push([byScope.get(u.frames[0])!, byScope.get(u.frames[1])!]);
}

/** Frames whose word heads the role phrase they reach over: a new member (joins.md#everything-ua) and a greeting's name. */
export const PHRASE_FRAMES = new Set(["slot:newMember", "reading:greeting"]);

/** Such a frame keeps the head word and hosts the role's term, so the noun has one place (rule 5). */
export function hostOnHead(term: Term, head: LexWord | undefined, here: Here): void {
  const frame = here.reading.frames.find((f) => PHRASE_FRAMES.has(f.key) && !f.hosted && f.words[0] === head);
  if (frame) frame.hosted = term;
}

/**
 * A role phrase or landmark that brings in a new member (joins.md#everything-ua): its frame, from the reading's scope
 * record, hosts the phrase's term.
 */
export function memberFrame(coord: NpCoord, term: Term, here: Here): void {
  const head = here.ctx.titled.has(coord) ? undefined : newMemberHead(coord, here.ctx.blanks);
  if (!head) return;
  hostOnHead(term, head, here);
}

/**
 * A hook's landmark after a frame word on the hook (`wal al bohahal`, *never in a house*): the resolve stage gives it
 * no whole-clause frame (`framedLandmarks` in the scope stage), and its binder sits under that frame, earlier over later
 * (clause.md#which-covers-which, joins.md#everything-ua).
 */
export function framedMember(coord: NpCoord, term: Term, under: Frame, here: Here): void {
  const head = here.ctx.titled.has(coord) ? undefined : newMemberHead(coord, here.ctx.blanks);
  if (!head) return;
  nestFrame("slot:newMember", head, under, here).hosted = term;
}

export function detailOf(key: string, word: LexWord, kind: string): Detail {
  const anchor = classOf(key)?.anchor ?? "";
  const values = wordValues(word);
  // A plain content word's root is what the adjective, adverb or degree word says (clause.md#adjectives-ɡ).
  if (word.reading === "ordinary" && word.family.kind === "content") values.root = word.family.roots.join("");
  // A number word's value is what the count, rank or amount says (numbers.md#counts): its stem in shorthand.
  if (word.family.kind === "number") values.number = numberBody(word.family.stem);
  // A built word's stem is the root it builds on, and how it was built is meaning too (builtValues).
  const built = builtValues(word);
  if (built.built) Object.assign(values, built, { root: stemOf(word) });
  return { kind, construction: constructionFor(key, word), key, anchor, words: [word], values };
}

/** The `x` families that build a word from a stem (word-building), as against a seam that frames a host. */
const BUILT_X: ReadonlySet<string> = new Set(["role", "hookPrefix", "numeric", "scope", "compound"]);

/**
 * How a built word was built, since each way says something of its own (interpreter.md#terms): `built` is
 * `role` (a role word, roles.md#role-compounds: its `part` consonant and `reach` vowel), `hookPrefix` (an extra-noun
 * hook before the seam, hook-compounds.md#hook-prefixes: its `hook`, and a `reach` after the stem's `th` seam),
 * `numeric` (a number before the seam, numeric-derivation.md: its `number` in shorthand, and `approx` for the `mx`
 * seam), `scope` (a label seam, label-seams.md: its `stanceVowel`), `compound` (two roots at a mid-word `x`,
 * compounds.md) or `hookCompound` (a hook fused after a cited word, hook-compounds.md#hook-compounds: its `hook`).
 * A word built none of these ways gives nothing.
 */
export function builtValues(word: LexWord): Record<string, string> {
  const fused = word.hookCompound ?? (word.family.kind === "hookCompound" ? word.family : undefined);
  if (fused) return { built: "hookCompound", hook: fused.hook };
  const family = word.family;
  if (family.kind !== "x" || !BUILT_X.has(family.xFamily)) return {};
  const values: Record<string, string> = { built: family.xFamily };
  if (family.part) values.part = family.part;
  if (family.reachVowel) values.reach = family.reachVowel;
  if (family.stanceVowel) values.stanceVowel = family.stanceVowel;
  if (family.hook) values.hook = family.hook;
  if (family.stemHook) values.stemHook = `${family.stemHook.leftEnding}${family.stemHook.hook}`;
  if (family.numberStem) values.number = numberBody(family.numberStem);
  if (family.approx) values.approx = "mx";
  return values;
}

/** A built word's stem: its roots, parts joined at `x`; a listed hook compound's whole stem (`owurolul`). */
function stemOf(word: LexWord): string {
  return word.hookCompound?.stem ?? rootOf(word);
}

/** The link kinds whose one word's meaning the solver reads off `values` (interpreter.md#links). */
const VALUED_LINKS: ReadonlySet<LinkKind> = new Set(["linker", "discourse", "hookResume", "polar", "standIn", "standInBack"]);

export function link(kind: LinkKind, key: string, words: LexWord[], extra: Partial<Link> = {}): Link {
  const values = VALUED_LINKS.has(kind) && words.length === 1 ? linkValues(words[0]!, kind) : undefined;
  return { kind, key, anchor: classOf(key)?.anchor ?? "", words, ...(values ? { values } : {}), ...extra };
}

/**
 * A link word's values: its gloss as the morph gloss gives it (a sentence linker's, a discourse hook's, a join word's),
 * and, for a word built from a vowel series and an ending (a hook, a polar word, a stand-in), `series` and `ending`.
 */
function linkValues(word: LexWord, kind: LinkKind): Record<string, string> {
  const values = wordValues(word);
  const family = word.family;
  let gloss: string | undefined;
  // A hook's `series` comes with its word's values; a point-back hook glosses by its landmark job (*there*).
  if (family.kind === "hook") gloss = hookLabel(family.form, { hookJob: kind === "hookResume" ? "resume" : "discourse" });
  else if (family.kind === "joinMarker") gloss = joinMarkerLabel(word, {});
  else gloss = linkerEnglish(word);
  if (gloss && !values.gloss) values.gloss = gloss;
  return values;
}

export function unread(here: Here, reason: Unread["reason"], key: string, word?: LexWord): void {
  here.reading.unread.push({ construction: constructionFor(key, word), key, ...(word ? { word } : {}), reason });
}

/** The sentence after this one, if any (a `blarl` / `barl` grounds, sentence-linkers.md#past-a-period). */
export function nextSentence(here: Here): ReadingId | undefined {
  const at = here.ctx.sentences.findIndex((s) => s.utterance === here.utterance && s.body === here.body);
  return at >= 0 ? here.ctx.sentences[at + 1]?.id : undefined;
}

/**
 * The sentence before this one, if any: what a sentence linker, a discourse hook or a polar word reads
 * (sentence-linkers.md#past-a-period). A goodbye ends the conversation, so the sentence after one has none (the
 * `sentenceBefore` row's goodbye cell, interpreter.md#discourse-slots).
 */
export function previousSentence(here: Here): ReadingId | undefined {
  const at = here.ctx.sentences.findIndex((s) => s.utterance === here.utterance && s.body === here.body);
  const before = at > 0 ? here.ctx.sentences[at - 1] : undefined;
  return before?.goodbye && endsAt("sentenceBefore", "goodbye") ? undefined : before?.id;
}

function rootOf(word: LexWord): string {
  const family = word.family;
  if (family.kind === "content") return family.roots.join("");
  if (family.kind === "x") return [...family.leftRoots, ...(family.rightRoots ?? [])].join("x");
  return word.raw;
}

export function thing(word: LexWord): Term {
  return { kind: "thing", head: word, root: rootOf(word), named: word.ending === "n" || word.ending === "ln", values: termValues(word), details: [] };
}

/**
 * A term word's own ending and plural (word-endings.md, plurality.md#associative): the ending says how to take the
 * root, and `-x` names an anchor with its associates, so a term keeps both as meaning. A word with no role letter is
 * a bare citation, the word cited outside a sentence (word-endings.md#citation-forms): `citation: "bare"`.
 */
export function termValues(word: LexWord): Record<string, string> {
  return {
    ...builtValues(word),
    // A standalone join as a term (a `bl-` landmark, hooked-joins.md#hooked-joins-endings: `zexual blual`) is the
    // widest bound its series names, *everything*, *none*: its series says which.
    ...(word.family.kind === "joinMarker" ? { series: word.family.series } : {}),
    ...(word.ending ? { ending: word.ending } : {}),
    ...(word.plural ? { plural: "x" } : {}),
    ...(word.pos ? {} : { citation: "bare" }),
  };
}

/**
 * A frame word met in the clause: the resolve stage's frame when it gave one, else a frame of its own. A whole-clause
 * frame missing from the scope record is an `unread` entry, never placed here (interpreter.md#reader-rules, rule 3).
 */
export function placeFrame(key: string, word: LexWord, here: Here): Frame {
  // The resolve stage may file the word under another key of the same family (`lexReading:ability` for an
  // `xFamily:ability` word): one word, one frame of that family.
  const family = classOf(key)?.cls.slice("frame:".length);
  const existing = here.reading.frames.find((f) => f.words[0] === word && (f.key === key || f.family === "holder" || f.family === family));
  if (existing) return existing;
  const frame = frameOf(key, word, here);
  if (FRAME_KEYS[key]?.reach === "clause") unread(here, "unplaced", key, word);
  else here.reading.frames.push(frame);
  return frame;
}

/** A frame held inside another (rule 2): it keeps its word and sits in the outer frame's `inner`. */
function nestFrame(key: string, word: LexWord, outer: Frame, here: Here): Frame {
  const frame = frameOf(key, word, here);
  outer.inner = [...(outer.inner ?? []), frame];
  return frame;
}

/**
 * The boundary kinds a nested reading sits behind, outermost first (interpreter.md#boundaries), from its id's path under
 * its sentence: `m` a clause-join member, `d` a dependent (in a slot when its parent's `slot:dependent` link names it),
 * `i` / `v` an island, `q` a cite, `a` an aside. `byId` holds every reading.
 */
export function nestedKinds(reading: Reading, byId: ReadonlyMap<ReadingId, Reading>): NestedKind[] {
  const steps = reading.id.split("/");
  const kinds: NestedKind[] = [];
  for (let i = 1; i < steps.length; i++) {
    const parent = byId.get(steps.slice(0, i).join("/"));
    const id = steps.slice(0, i + 1).join("/");
    const step = steps[i]!;
    if (step.startsWith("m")) kinds.push("member");
    else if (step.startsWith("i") || step.startsWith("v")) kinds.push("island");
    else if (step === "d") kinds.push(parent?.links.some((l) => l.key === "slot:dependent" && l.to === id) ? "slotDependent" : "standInDependent");
    else if (step.startsWith("q")) kinds.push("quote");
    else if (step.startsWith("a")) kinds.push("aside");
  }
  return kinds;
}

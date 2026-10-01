import {
  parseCompoundCsv,
  potentialCompoundSplits,
  type CompoundRow,
} from "../lexicon-compounds.js";
import {
  type OverlayRow,
  type PublishedRow,
  parseOverlayCsv,
  parsePublishedCsv,
  senseFormRoot,
} from "../lexicon-search.js";

import {
  derivedHookGloss,
  hookCompoundFromMorph,
} from "./hook-compounds.js";
import type { LexOverlay, LexReading, LexWord, MorphWord } from "./types.js";
import { CLOSED } from "../closed-roots.js";
import { JOIN_SERIES, resumeCut } from "./series.js";

function sakeRootsFromOverlays(overlays: Iterable<OverlayRow>): Set<string> {
  const roots = new Set<string>();
  for (const overlay of overlays) {
    if (overlay.kind === "sake") {
      roots.add(senseFormRoot(overlay.senseForm));
    }
  }
  return roots;
}

function sakeGlossFromOverlays(overlays: Iterable<OverlayRow>): Map<string, string> {
  const gloss = new Map<string, string>();
  for (const overlay of overlays) {
    if (overlay.kind !== "sake") continue;
    const root = senseFormRoot(overlay.senseForm);
    if (!gloss.has(root)) gloss.set(root, overlay.gloss);
  }
  return gloss;
}

function hostlessAbilityRootFromOverlays(overlays: Iterable<OverlayRow>): string | null {
  for (const overlay of overlays) {
    if (overlay.kind === "ability") {
      return senseFormRoot(overlay.senseForm);
    }
  }
  return null;
}

/** Closed sake hosts — filled from overlay `kind` at table load. */
export const SAKE_ROOTS = new Set<string>();

/** Defined restrictor core spellings under `/h/` / `/w/` (not `-n`). */
const RESTRICTOR_CORE = new Set<string>([
  // starter bare core
  "al",
  "am",
  "ual",
  "uam",
  "ar",
  "or",
  "ur",
  // set / invert / inclusive
  "ol",
  "om",
  "aol",
  "aom",
  "ul",
  "um",
  "uol",
  "uom",
  // ranked (with conjuncts; bare `ael` allowed)
  "el",
  "em",
  "ael",
  "aem",
  "oel",
  "oem",
]);

export type ClassifyTables = {
  overlays: Map<string, OverlayRow>;
  published: Map<string, PublishedRow>;
  compounds: Map<string, CompoundRow>;
  sakeRoots: Set<string>;
  sakeGloss: Map<string, string>;
  hostlessAbilityRoot: string | null;
};

export function overlayKey(pos: string, senseForm: string): string {
  return `${pos}\0${senseForm}`;
}

function overlayFromRow(row: OverlayRow): LexOverlay {
  return {
    senseForm: row.senseForm,
    pos: row.pos,
    kind: row.kind,
    gloss: row.gloss,
    definition: row.definition,
    mnemonic: row.mnemonic,
    anchor: row.anchor,
  };
}

function overlaySenseForm(word: MorphWord): string | null {
  const { family, ending } = word;
  if (!ending) return null;

  if (family.kind === "content" && family.roots.length === 1) {
    return family.roots[0]! + ending;
  }

  if (family.kind === "joinMarker") {
    return family.series + ending;
  }

  if (
    family.kind === "x" &&
    family.xFamily === "role" &&
    family.leftRoots.length === 0 &&
    family.rightRoots?.length === 1
  ) {
    return `${family.roleVowel}x${family.rightRoots[0]}${ending}`;
  }

  return null;
}

/** True when the word is a closed overlay sense form for its PoS (`therar` TOLD.weak, not a resume). */
export function hasClosedOverlay(word: MorphWord, tables: ClassifyTables): boolean {
  const senseForm = overlaySenseForm(word);
  return Boolean(senseForm && word.pos && tables.overlays.has(overlayKey(word.pos, senseForm)));
}

function overlayReading(overlay: OverlayRow): LexReading {
  if (overlay.kind === "join_act") return "joinAct";
  if (overlay.kind === "join_relation") return "joinRelation";
  if (overlay.kind === "ability") return "ability";
  if (overlay.kind === "sake") return "sake";
  return "overlay";
}

export function isAsOfOverlay(word: { overlay?: { kind: string; gloss: string } }): boolean {
  return word.overlay?.kind === "clause_pole" && word.overlay.gloss.startsWith("as-of.");
}

function isRestrictor(word: MorphWord): boolean {
  const { family, pos, ending } = word;
  if (family.kind !== "joinMarker" || !pos || !ending) return false;
  if (pos !== "h" && pos !== "w") return false;
  if (ending === "n") return false;

  return RESTRICTOR_CORE.has(family.series + ending);
}

const JOIN_ENDING_GLOSS: Record<string, string> = {
  l: "closed",
  m: "open",
  n: "named",
  r: "unspecified member",
  rl: "stand-in locked",
  rm: "stand-in open",
};

const NAMED_STAND_IN_SERIES = new Set(["a", "o", "e", "u", "ae", "ue", "ao", "uo", "ua"]);

/** Fence-join gloss (not restrictors, join-acts, or `/y/` force/polar). */
export function joinFenceGloss(series: string, ending: string | undefined): string {
  const job = JOIN_SERIES[series]?.english ?? `join ${series}`;
  const close = ending ? JOIN_ENDING_GLOSS[ending] : undefined;
  return close ? `${job} (${close})` : job;
}

export type StandInKind = "forward" | "back" | "named";

const STAND_IN_SERIES = new Set(["a", "o", "e", "u"]);

/**
 * Which stand-in a word is, if any: forward (`darl` / `barl` / …, the slot the next sentence fills),
 * back (`darth` / `durth` / …, that same content already said), or a lexicalized name
 * (one-vowel `-rn`, or stacked-vowel verb `-n`).
 */
export function standInKind(word: MorphWord): StandInKind | undefined {
  if (word.family.kind !== "joinMarker") return undefined;
  if (word.pos === "x" || word.pos === "y" || !word.pos) return undefined;
  const { series } = word.family;
  if (word.pos !== "v" && STAND_IN_SERIES.has(series)) {
    if (word.ending === "rl" || word.ending === "rm") return "forward";
    if (word.ending === "rth") return "back";
  }
  if (!NAMED_STAND_IN_SERIES.has(series)) return undefined;
  const named = (series.length === 1 && word.ending === "rn") || (word.pos === "v" && series.length > 1 && word.ending === "n");
  return named ? "named" : undefined;
}

export const isStandIn = (word: MorphWord): boolean => standInKind(word) === "forward";
export const isBackStandIn = (word: MorphWord): boolean => standInKind(word) === "back";
export const isNamedStandIn = (word: MorphWord): boolean => standInKind(word) === "named";

function isFenceJoin(word: MorphWord): boolean {
  if (word.family.kind !== "joinMarker") return false;
  if (!word.pos || word.pos === "y") return false;
  if (standInKind(word)) return false;
  return !isRestrictor(word);
}

/**
 * Open roots that belong in the published / compound / overlay inventories.
 * Closed families (joins, spans, numbers, foreign payloads) contribute none.
 * Vowel-only ordinary compounds are series letters, not lexicon hosts.
 */
function hookCompoundLexiconRoots(
  word: MorphWord,
  known?: ReadonlySet<string>,
): string[] | undefined {
  if (!known) return undefined;
  const parts = hookCompoundFromMorph(word);
  if (!parts) return undefined;
  if (!known.has(parts.leftRoot)) return undefined;
  const morphRoot = word.family.kind === "content" ? word.family.roots[0] : undefined;
  if (morphRoot && known.has(morphRoot)) return undefined;
  return [parts.leftRoot];
}

export function lexiconContentRoots(
  word: MorphWord,
  known?: ReadonlySet<string>,
): string[] {
  const hooked = hookCompoundLexiconRoots(word, known);
  if (hooked) return hooked;
  const { family } = word;
  switch (family.kind) {
    case "content":
      return family.roots;
    case "x":
      if (family.xFamily === "span" || family.xFamily === "numeric") {
        return [];
      }
      if (family.xFamily === "role" && family.rightRoots?.length) {
        return family.rightRoots;
      }
      if (family.xFamily === "compound") {
        const hosts = [...family.leftRoots, ...(family.rightRoots ?? [])];
        // Vowel-only ordinary compounds (`xuxun`) are series letters, not lemmas.
        if (hosts.every((root) => root.length === 1)) {
          return [];
        }
        return hosts;
      }
      return family.leftRoots;
    case "hookCompound":
      return [family.leftRoot];
    default:
      return [];
  }
}

const knownRootsCache = new WeakMap<ClassifyTables, ReadonlySet<string>>();

/** Published lemmas, lexical-compound stems, and overlay host roots. */
export function knownLexiconRoots(tables: ClassifyTables): ReadonlySet<string> {
  let known = knownRootsCache.get(tables);
  if (!known) {
    const roots = new Set<string>(tables.published.keys());
    for (const stem of tables.compounds.keys()) {
      roots.add(stem);
    }
    for (const row of tables.overlays.values()) {
      roots.add(senseFormRoot(row.senseForm));
    }
    knownRootsCache.set(tables, roots);
    known = roots;
  }
  return known;
}

const shortResumeStemCache = new WeakMap<ClassifyTables, Set<string>>();

/** Short resume stems (`odo` of `odoga`, cut through the 2nd vowel) of published roots ([pronouns.md](../../docs/grammar/pronouns.md#resume-r)). */
function publishedShortResumeStems(tables: ClassifyTables): Set<string> {
  let stems = shortResumeStemCache.get(tables);
  if (!stems) {
    stems = new Set();
    for (const root of tables.published.keys()) {
      stems.add(resumeCut(root));
    }
    shortResumeStemCache.set(tables, stems);
  }
  return stems;
}

/** Content hosts missing from `known`. */
export function unknownLexiconContentRoots(
  word: MorphWord,
  known: ReadonlySet<string>,
): string[] {
  return lexiconContentRoots(word, known).filter((root) => !known.has(root));
}

function publishedGlossForRoots(
  tables: ClassifyTables,
  roots: string[],
  compoundStems = false,
): { gloss: { concrete?: string; abstract?: string }; allFound: boolean } | undefined {
  if (roots.length === 0) return undefined;
  const literals: string[] = [];
  const abstracts: string[] = [];
  let allFound = true;
  let any = false;
  for (const root of roots) {
    const row = tables.published.get(root);
    if (!row) {
      // A listed compound stem fills a root slot too (`zaxubugalahahal`, a role compound on `read`).
      const compound = compoundStems ? tables.compounds.get(root) : undefined;
      if (!compound) {
        allFound = false;
        continue;
      }
      any = true;
      literals.push(compound.concrete || root);
      if (compound.abstract) abstracts.push(compound.abstract);
      continue;
    }
    any = true;
    literals.push(row.concrete || root);
    if (row.abstract) abstracts.push(row.abstract);
  }
  if (!any) return undefined;
  const gloss: { concrete?: string; abstract?: string } = {};
  if (literals.length) gloss.concrete = literals.join(" · ");
  if (abstracts.length) gloss.abstract = abstracts.join(" · ");
  return { gloss, allFound };
}

function compoundLemmaGloss(row: CompoundRow): { concrete?: string; abstract?: string } {
  const gloss: { concrete?: string; abstract?: string } = {};
  if (row.concrete) gloss.concrete = row.concrete;
  if (row.abstract) gloss.abstract = row.abstract;
  return gloss;
}

function classifyHookCompound(word: MorphWord, tables: ClassifyTables): LexWord | undefined {
  const morphRoot = word.family.kind === "content" ? word.family.roots[0] : undefined;
  if (morphRoot && tables.published.has(morphRoot)) return undefined;
  const parts = hookCompoundFromMorph(word);
  if (!parts || !tables.published.has(parts.leftRoot)) return undefined;
  const listed = tables.compounds.get(parts.stem);
  const published = tables.published.get(parts.leftRoot);
  const bank =
    parts.leftEnding === "m" ? published?.posEnglish.abstract : published?.posEnglish.concrete;
  const packed = word.pos && bank ? bank[word.pos] : undefined;
  const leftSense =
    packed ||
    (parts.leftEnding === "m"
      ? published?.abstract || published?.concrete || parts.leftRoot
      : published?.concrete || published?.abstract || parts.leftRoot);
  const derived = derivedHookGloss(parts.hook);
  const gloss = listed
    ? compoundLemmaGloss(listed)
    : { concrete: `${leftSense}-${derived}` };
  return {
    ...word,
    family: { kind: "content", roots: [parts.leftRoot] },
    rootGloss: gloss,
    reading: "ordinary",
    lexicalCompound: Boolean(listed),
    hookCompound: parts,
  };
}

function compoundsFromRows(rows: CompoundRow[]): Map<string, CompoundRow> {
  const compounds = new Map<string, CompoundRow>();
  for (const row of rows) {
    if (row.stem) compounds.set(row.stem, row);
  }
  return compounds;
}

function finishTables(
  published: Map<string, PublishedRow>,
  overlays: Map<string, OverlayRow>,
  compounds: Map<string, CompoundRow>,
): ClassifyTables {
  const overlayList = [...overlays.values()];
  const sakeRoots = sakeRootsFromOverlays(overlayList);
  const sakeGloss = sakeGlossFromOverlays(overlayList);
  const hostlessAbilityRoot = hostlessAbilityRootFromOverlays(overlayList);
  SAKE_ROOTS.clear();
  for (const root of sakeRoots) {
    SAKE_ROOTS.add(root);
  }
  return { overlays, published, compounds, sakeRoots, sakeGloss, hostlessAbilityRoot };
}

export function createClassifyTables(
  publishedCsv: string,
  overlayCsv: string,
  compoundCsv = "",
): ClassifyTables {
  const publishedRows = parsePublishedCsv(publishedCsv);
  const overlayRows = parseOverlayCsv(overlayCsv);
  const compoundRows = compoundCsv.trim() ? parseCompoundCsv(compoundCsv) : [];

  const published = new Map<string, PublishedRow>();
  for (const row of publishedRows) {
    if (row.root) published.set(row.root, row);
  }

  const overlays = new Map<string, OverlayRow>();
  for (const row of overlayRows) {
    overlays.set(overlayKey(row.pos, row.senseForm), row);
  }

  return finishTables(published, overlays, compoundsFromRows(compoundRows));
}

export function createClassifyTablesFromRows(
  publishedRows: PublishedRow[],
  overlayRows: OverlayRow[],
  compoundRows: CompoundRow[] = [],
): ClassifyTables {
  const published = new Map<string, PublishedRow>();
  for (const row of publishedRows) {
    if (row.root) published.set(row.root, row);
  }

  const overlays = new Map<string, OverlayRow>();
  for (const row of overlayRows) {
    overlays.set(overlayKey(row.pos, row.senseForm), row);
  }

  return finishTables(published, overlays, compoundsFromRows(compoundRows));
}

/** Sake and hostless-ability rows register `x` hosts; the sake / ability word on that host uses the row. */
function hostOverlay(word: MorphWord, tables: ClassifyTables): { hostOverlay?: LexOverlay } {
  const host = word.family.kind === "x" ? word.family.leftRoots[0] : undefined;
  const row = host && word.pos ? tables.overlays.get(overlayKey(word.pos, `${host}m`)) : undefined;
  return row && (row.kind === "sake" || row.kind === "ability") ? { hostOverlay: overlayFromRow(row) } : {};
}

/** Channels whose hosted `/b/` may be a clause: the grounds, by inference or by pattern (knowing.md#evidence-clause). */
const GROUNDS_CHANNELS = new Set(["INFERRED", "PATTERN"]);

/** An INFERRED or PATTERN `/th/` channel, with or without a holder seam (`thevem`, `thabelazawan`). */
export function isGroundsChannel(word: LexWord, tables: ClassifyTables): boolean {
  if (word.pos !== "th") return false;
  const family = word.family;
  const row =
    family.kind === "x" && family.xFamily === "holder"
      ? tables.overlays.get(overlayKey("th", `${family.leftRoots[0]}${family.grade}`))
      : word.overlay
        ? { kind: word.overlay.kind, gloss: word.overlay.gloss }
        : undefined;
  return row?.kind === "evidential" && GROUNDS_CHANNELS.has(row.gloss.split(".")[0]!);
}

/** Closed `/th/` kinds a rank fence takes as its bar: each sets a value to rank against (comparatives.md#bars). */
const BAR_OVERLAY_KINDS = new Set(["evidential", "former_climate", "notional", "plan", "ability", "deontic"]);

/**
 * A `/th/` word that can be a rank fence's bar: a met sake word, an ability word, a channel, FORMER, NOTIONAL,
 * PLAN, permission, requirement, consent, a holder on one of those, or a speaker attitude (an ordinary content
 * root on `/th/`). Poles, MAY, MIRATIVE, DECISION, and the deontic noes set no value.
 */
export function isBarStance(word: LexWord, tables: ClassifyTables): boolean {
  if (word.pos !== "th") return false;
  const family = word.family;
  if (word.reading === "sake") return family.kind === "x" && family.stanceVowel === "a" && !family.horizon;
  if (word.reading === "ability") return true;
  const row =
    family.kind === "x" && family.xFamily === "holder"
      ? tables.overlays.get(overlayKey("th", `${family.leftRoots[0]}${family.grade}`))
      : word.overlay
        ? tables.overlays.get(overlayKey("th", word.overlay.senseForm))
        : undefined;
  if (row) return BAR_OVERLAY_KINDS.has(row.kind) && !isDeonticNo(row, tables);
  return word.reading === "ordinary" && family.kind === "content";
}

/** Closed `/th/` kinds `uem` takes as its frame: each has content an event can go against (sakes.md#contrary-to-stance). */
const FRAME_OVERLAY_KINDS = new Set(["evidential", "plan", "decision", "want", "deontic"]);

/**
 * A `/th/` word that can be the frame of `uem` *contrary to*: a channel (or a holder on one), PLAN, DECISION, WANT,
 * a ban, a requirement, a refusal, or a speaker attitude (an ordinary content root on `/th/`). Sakes, permission and
 * consent given, poles, MAY, NOTIONAL, MIRATIVE, RESIDUE, FORMER, CAUSE, ATTEMPT, and ability say
 * nothing an event can contradict.
 */
export function isFrameStance(word: LexWord, tables: ClassifyTables): boolean {
  if (word.pos !== "th") return false;
  const family = word.family;
  const row =
    family.kind === "x" && family.xFamily === "holder"
      ? tables.overlays.get(overlayKey("th", `${family.leftRoots[0]}${family.grade}`))
      : word.overlay
        ? tables.overlays.get(overlayKey("th", word.overlay.senseForm))
        : undefined;
  if (row) return FRAME_OVERLAY_KINDS.has(row.kind) && !isDeonticYes(row, tables);
  return word.reading === "ordinary" && family.kind === "content";
}

/** A permit or consent-given row: it shares the PERMIT rows' emoji (sakes.md#permission). */
function isDeonticYes(row: OverlayRow, tables: ClassifyTables): boolean {
  if (row.kind !== "deontic") return false;
  for (const other of tables.overlays.values()) {
    if (other.kind === "deontic" && other.gloss.startsWith("PERMIT") && other.emoji === row.emoji) return true;
  }
  return false;
}

/** A forbid or consent-refused row: it shares the FORBID rows' emoji (sakes.md#permission). */
function isDeonticNo(row: OverlayRow, tables: ClassifyTables): boolean {
  if (row.kind !== "deontic") return false;
  for (const other of tables.overlays.values()) {
    if (other.kind === "deontic" && other.gloss.startsWith("FORBID") && other.emoji === row.emoji) return true;
  }
  return false;
}

/** Arrow-rose roots (roles.md#arrow-rose-compass-vs-face); `DIR th o` on these is a landmark lateral. */
export const ARROW_ROOTS = new Set([
  CLOSED.north,
  CLOSED.northeast,
  CLOSED.east,
  CLOSED.southeast,
  CLOSED.south,
  CLOSED.southwest,
  CLOSED.west,
  CLOSED.northwest,
]);

/** `DIR th o` parses as a sake shape; on an arrow root it is the landmark's own facing. */
function landmarkLateral(word: MorphWord): MorphWord | undefined {
  const family = word.family;
  if (family.kind !== "x" || family.xFamily !== "sake" || family.stanceVowel !== "o" || family.horizon) return undefined;
  if (family.leftRoots.length !== 1 || !ARROW_ROOTS.has(family.leftRoots[0]!)) return undefined;
  return { ...word, family: { kind: "x", xFamily: "lateral", leftRoots: family.leftRoots, rightRoots: [], landmark: true } };
}

/** `ROOT th V` on any root outside the eight sake roots is label scope (predication.md#label-scope). */
function labelScope(word: MorphWord, tables: ClassifyTables): MorphWord | undefined {
  const family = word.family;
  if (family.kind !== "x" || family.xFamily !== "sake") return undefined;
  if (family.leftRoots.every((root) => tables.sakeRoots.has(root))) return undefined;
  return { ...word, family: { ...family, xFamily: "scope" } };
}

/**
 * `ROOT th V C V` + ending: the emotion tail on a sake root (sakes.md#emotion-compose);
 * on any other root the same letters are a viewpoint lateral `DIR th ANCHOR` (roles.md#viewpoint-laterals).
 */
function tailLateral(word: MorphWord, tables: ClassifyTables): MorphWord | undefined {
  const family = word.family;
  if (family.kind !== "x" || family.xFamily !== "sake" || !family.horizon) return undefined;
  if (family.leftRoots.every((root) => tables.sakeRoots.has(root))) return undefined;
  if (family.leftRoots.length !== 1 || (family.locus?.length ?? 0) !== 1) return undefined;
  const anchor = `${family.stanceVowel}${family.horizon}${family.locus}`;
  return { ...word, family: { kind: "x", xFamily: "lateral", leftRoots: family.leftRoots, rightRoots: [anchor] } };
}

/** Overlay kinds whose `/th/` word can take a holder after its grade letter (knowing.md#holder). */
const HOLDER_HOST_KINDS = new Set(["evidential", "may", "notional"]);

/**
 * `HOST GRADE NAME` on `/th/`: an evidential, MAY or NOTIONAL root, its own **-l / -m / -r** as the seam,
 * then whose view the clause reports (`thevemazawan`). The word grammar sees one long content root.
 */
function holderSeam(word: MorphWord, tables: ClassifyTables): MorphWord | undefined {
  const family = word.family;
  if (word.pos !== "th" || family.kind !== "content" || family.roots.length !== 1) return undefined;
  const root = family.roots[0]!;
  if (tables.published.has(root)) return undefined;
  for (let cut = 1; cut < root.length - 2; cut++) {
    const host = root.slice(0, cut);
    const grade = root[cut];
    const holder = root.slice(cut + 1);
    if (grade !== "l" && grade !== "m" && grade !== "r") continue;
    if (!/^[aeou]/.test(holder)) continue;
    const row = tables.overlays.get(overlayKey("th", `${host}${grade}`));
    if (!row || !HOLDER_HOST_KINDS.has(row.kind)) continue;
    return { ...word, family: { kind: "x", xFamily: "holder", leftRoots: [host], rightRoots: [holder], grade } };
  }
  return undefined;
}

/**
 * The word shape `classify` reads, before lexicon lookup: a lateral, landmark lateral or label scope
 * where the word grammar alone saw a sake shape (`gewezatheman` = *west* `th` *speaker*).
 */
export function classifiedShape(word: MorphWord, tables: ClassifyTables): MorphWord {
  const shaped = tailLateral(word, tables) ?? landmarkLateral(word) ?? labelScope(word, tables) ?? word;
  return holderSeam(shaped, tables) ?? shaped;
}

/** One reading a word can take. `match` builds the classified word, or returns `undefined` when the rule does not apply. */
type ClassifyRule = {
  source: ClassifyHit["source"] | ((word: LexWord) => ClassifyHit["source"]);
  match: (word: MorphWord, tables: ClassifyTables) => LexWord | undefined;
};

/** A single content root or hook-compound shape: the words a compound lemma or hook compound can read. */
function hookCompoundCandidate(word: MorphWord): boolean {
  return word.family.kind === "hookCompound" || (word.family.kind === "content" && word.family.roots.length === 1);
}

/**
 * Every reading rule, in priority order. `classify` takes the first that matches;
 * `classifyHits` reports every match (the ambiguity checker).
 */
const CLASSIFY_RULES: ClassifyRule[] = [
  {
    source: "overlay",
    match(word, tables) {
      const senseForm = overlaySenseForm(word);
      if (!senseForm || !word.pos) return undefined;
      const row = tables.overlays.get(overlayKey(word.pos, senseForm));
      // Sake overlays register hosts for `x`+vowel sake words; the bare spelling is ordinary.
      if (!row || row.kind === "sake") return undefined;
      return { ...word, overlay: overlayFromRow(row), reading: overlayReading(row) };
    },
  },
  {
    source: "number",
    match: (word) =>
      word.family.kind === "number" || (word.family.kind === "x" && word.family.xFamily === "numeric")
        ? { ...word, reading: "number" }
        : undefined,
  },
  {
    source: "sake",
    match: (word, tables) =>
      word.family.kind === "x" && word.family.xFamily === "sake" ? { ...word, ...hostOverlay(word, tables), reading: "sake" } : undefined,
  },
  {
    source: "ability",
    match(word, tables) {
      if (word.family.kind !== "x" || word.family.xFamily !== "ability") return undefined;
      if (word.ending === "n" && (!word.pos || word.pos === "y")) return { ...word, reading: "greeting" };
      return { ...word, ...hostOverlay(word, tables), reading: "ability" };
    },
  },
  { source: "restrictor", match: (word) => (isRestrictor(word) ? { ...word, reading: "restrictor" } : undefined) },
  { source: "standIn", match: (word) => (isStandIn(word) ? { ...word, reading: "standIn" } : undefined) },
  {
    source: "standInNamed",
    match: (word, tables) => (isNamedStandIn(word) && !hasClosedOverlay(word, tables) ? { ...word, reading: "standInNamed" } : undefined),
  },
  { source: "standInBack", match: (word) => (isBackStandIn(word) ? { ...word, reading: "standInBack" } : undefined) },
  {
    source: "join",
    match: (word) =>
      isFenceJoin(word) && word.family.kind === "joinMarker"
        ? { ...word, reading: "join", rootGloss: { concrete: joinFenceGloss(word.family.series, word.ending) } }
        : undefined,
  },
  {
    source: "compoundLemma",
    match(word, tables) {
      const family = word.family;
      const row = family.kind === "content" && family.roots.length === 1 ? tables.compounds.get(family.roots[0]!) : undefined;
      if (!row) return undefined;
      return {
        ...word,
        rootGloss: compoundLemmaGloss(row),
        reading: missingAbstractSense(word, tables) ? "unknown" : "ordinary",
        lexicalCompound: true,
      };
    },
  },
  {
    source: (word) => (word.lexicalCompound ? "compoundLemma" : "published"),
    match: (word, tables) => (hookCompoundCandidate(word) ? classifyHookCompound(word, tables) : undefined),
  },
  {
    source: "published",
    match(word, tables) {
      // A hook compound already read its left root; it is not a second published reading.
      if (hookCompoundCandidate(word) && classifyHookCompound(word, tables)) return undefined;
      const roots = lexiconContentRoots(word, knownLexiconRoots(tables));
      // A plain content word on a compound stem is a compound lemma (read above); only an `x` word fills a slot with one.
      const published = publishedGlossForRoots(tables, roots, word.family.kind === "x");
      if (!published) return undefined;
      return {
        ...word,
        rootGloss: published.gloss,
        reading: published.allFound && !missingAbstractSense(word, tables) ? "ordinary" : "unknown",
      };
    },
  },
  {
    source: "foreign",
    match: (word) => (word.family.kind === "foreign" || word.family.kind === "writingSpan" ? { ...word, reading: "unknown" } : undefined),
  },
];

/** A word no rule reads: a short resume of a published root, an unlisted root, or a plain word. */
function classifyUnlisted(word: MorphWord, tables: ClassifyTables): LexWord {
  const family = word.family;
  const roots = lexiconContentRoots(word, knownLexiconRoots(tables));
  // A short resume (`zodor`) cuts a published root; it reads as that root, not as an unknown word.
  if (word.ending === "r" && family.kind === "content" && roots.length === 1 && publishedShortResumeStems(tables).has(roots[0]!)) {
    return { ...word, reading: "ordinary" };
  }
  if (roots.length > 0) {
    const potentialCompounds = potentialCompoundsFor(word, tables);
    return potentialCompounds ? { ...word, reading: "unknown", potentialCompounds } : { ...word, reading: "unknown" };
  }
  return { ...word, reading: "ordinary" };
}

export function classify(word: MorphWord, tables: ClassifyTables): LexWord {
  const shaped = classifiedShape(word, tables);
  for (const rule of CLASSIFY_RULES) {
    const read = rule.match(shaped, tables);
    if (read) return read;
  }
  return classifyUnlisted(shaped, tables);
}

/** Candidate lexical-compound splits for an unknown single content root. */
function potentialCompoundsFor(
  word: MorphWord,
  tables: ClassifyTables,
): LexWord["potentialCompounds"] {
  if (word.family.kind !== "content" || word.family.roots.length !== 1) return undefined;
  const stem = word.family.roots[0]!;
  if (knownLexiconRoots(tables).has(stem)) return undefined;
  const splits = potentialCompoundSplits(stem, (root) => tables.published.has(root));
  if (splits.length === 0) return undefined;
  return splits.map((split) => {
    const left = tables.published.get(split.left);
    const right = tables.published.get(split.right);
    const leftSense =
      split.join === "m"
        ? left?.abstract || left?.concrete || split.left
        : split.join === "l"
          ? left?.concrete || split.left
          : split.left;
    const rightSense = right?.concrete || right?.abstract || split.right;
    return { ...split, gloss: `${leftSense}-${split.join} ${rightSense}` };
  });
}

/**
 * Content word on **-m** whose root has no abstract sense (published abstract,
 * packed abstract role English, or compound abstract) — an unknown word.
 * Closed overlays are classified before this and never reach it.
 */
export function missingAbstractSense(word: MorphWord, tables: ClassifyTables): string | undefined {
  if (word.ending !== "m" || word.family.kind !== "content") return undefined;
  for (const root of word.family.roots) {
    const compound = tables.compounds.get(root);
    if (compound) {
      if (!compound.abstract) return root;
      continue;
    }
    const row = tables.published.get(root);
    if (!row) continue;
    const packed = word.pos ? row.posEnglish.abstract[word.pos as keyof typeof row.posEnglish.abstract] : undefined;
    if (!row.abstract && !packed) return root;
  }
  return undefined;
}

export function classifyAll(words: MorphWord[], tables: ClassifyTables): LexWord[] {
  return words.map((word, at) => ({ ...classify(word, tables), at }));
}

/** Independent classify sources that apply (ignores first-match short-circuit). */
export type ClassifyHit = {
  source:
    | "overlay"
    | "number"
    | "sake"
    | "ability"
    | "restrictor"
    | "standIn"
    | "standInNamed"
    | "standInBack"
    | "join"
    | "compoundLemma"
    | "published"
    | "foreign";
  reading: LexReading;
};

export function classifyHits(word: MorphWord, tables: ClassifyTables): ClassifyHit[] {
  const shaped = classifiedShape(word, tables);
  const hits: ClassifyHit[] = [];
  for (const rule of CLASSIFY_RULES) {
    const read = rule.match(shaped, tables);
    if (read) hits.push({ source: typeof rule.source === "function" ? rule.source(read) : rule.source, reading: read.reading });
  }
  return hits;
}

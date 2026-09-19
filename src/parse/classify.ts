import {
  parseCompoundCsv,
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

function needRootsFromOverlays(overlays: Iterable<OverlayRow>): Set<string> {
  const roots = new Set<string>();
  for (const overlay of overlays) {
    if (overlay.kind === "need") {
      roots.add(senseFormRoot(overlay.senseForm));
    }
  }
  return roots;
}

function needGlossFromOverlays(overlays: Iterable<OverlayRow>): Map<string, string> {
  const gloss = new Map<string, string>();
  for (const overlay of overlays) {
    if (overlay.kind !== "need") continue;
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

/** Closed need hosts — filled from overlay `kind` at table load. */
export const NEED_ROOTS = new Set<string>();

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
  needRoots: Set<string>;
  needGloss: Map<string, string>;
  hostlessAbilityRoot: string | null;
};

function overlayKey(pos: string, senseForm: string): string {
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

  return null;
}

function overlayReading(overlay: OverlayRow): LexReading {
  if (overlay.kind === "join_act") return "joinAct";
  if (overlay.kind === "join_relation") return "joinRelation";
  if (overlay.kind === "ability") return "ability";
  if (overlay.kind === "need") return "value";
  if (overlay.kind === "locative") return "locative";
  if (overlay.kind === "means") return "means";
  if (overlay.kind === "similative") return "similative";
  if (overlay.kind === "of_relation") return "ofRelation";
  if (overlay.kind === "exchange") return "exchange";
  if (overlay.kind === "proxy") return "proxy";
  if (overlay.kind === "stimulus") return "stimulus";
  return "mood";
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

/** Join series English jobs — [joins.md](docs/grammar/joins.md) beginner set/rank tables. */
const JOIN_SERIES_GLOSS: Record<string, string> = {
  a: "and",
  o: "exclusive or",
  ao: "and/or",
  u: "not / none of",
  ua: "everything but",
  uo: "anything but",
  e: "rank",
  ae: "equal rank",
  oe: "ranked exclusive or",
  ue: "rank reversal",
};

const JOIN_ENDING_GLOSS: Record<string, string> = {
  l: "closed",
  m: "open",
  n: "named",
  r: "unspecified member",
  rl: "stand-in locked",
  rm: "stand-in open",
};

/** Fence-join gloss (not restrictors, join-acts, or `/j/` force/polar). */
export function joinFenceGloss(series: string, ending: string | undefined): string {
  const job = JOIN_SERIES_GLOSS[series] ?? `join ${series}`;
  const close = ending ? JOIN_ENDING_GLOSS[ending] : undefined;
  return close ? `${job} (${close})` : job;
}

/** Stand-in (`darl` / `barl` / …): slot filled by the following sentence — not a join fence. */
export function isStandIn(word: MorphWord): boolean {
  if (word.family.kind !== "joinMarker") return false;
  if (word.pos === "x" || word.pos === "j" || !word.pos) return false;
  const series = word.family.series;
  if (series !== "a" && series !== "o" && series !== "e" && series !== "u") return false;
  return word.ending === "rl" || word.ending === "rm";
}

function isFenceJoin(word: MorphWord): boolean {
  if (word.family.kind !== "joinMarker") return false;
  if (!word.pos || word.pos === "j") return false;
  if (isStandIn(word)) return false;
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

/** Published lemmas, lexical-compound stems, and overlay host roots. */
export function knownLexiconRoots(tables: ClassifyTables): Set<string> {
  const known = new Set<string>(tables.published.keys());
  for (const stem of tables.compounds.keys()) {
    known.add(stem);
  }
  for (const row of tables.overlays.values()) {
    known.add(senseFormRoot(row.senseForm));
  }
  return known;
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
): { gloss: { concrete?: string; abstract?: string }; allFound: boolean } | undefined {
  if (roots.length === 0) return undefined;
  const literals: string[] = [];
  const abstracts: string[] = [];
  let allFound = true;
  let any = false;
  for (const root of roots) {
    const row = tables.published.get(root);
    if (!row) {
      allFound = false;
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
  const needRoots = needRootsFromOverlays(overlayList);
  const needGloss = needGlossFromOverlays(overlayList);
  const hostlessAbilityRoot = hostlessAbilityRootFromOverlays(overlayList);
  NEED_ROOTS.clear();
  for (const root of needRoots) {
    NEED_ROOTS.add(root);
  }
  return { overlays, published, compounds, needRoots, needGloss, hostlessAbilityRoot };
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
    if (row.clarity) published.set(row.clarity, row);
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
    if (row.clarity) published.set(row.clarity, row);
  }

  const overlays = new Map<string, OverlayRow>();
  for (const row of overlayRows) {
    overlays.set(overlayKey(row.pos, row.senseForm), row);
  }

  return finishTables(published, overlays, compoundsFromRows(compoundRows));
}

export function classify(word: MorphWord, tables: ClassifyTables): LexWord {
  const senseForm = overlaySenseForm(word);
  const pos = word.pos;

  if (senseForm && pos) {
    const overlayRow = tables.overlays.get(overlayKey(pos, senseForm));
    // Need overlays register hosts for `x`+vowel values; the bare spelling is ordinary.
    if (overlayRow && overlayRow.kind !== "need") {
      return {
        ...word,
        overlay: overlayFromRow(overlayRow),
        reading: overlayReading(overlayRow),
      };
    }
  }

  const family = word.family;

  if (family.kind === "number" || (family.kind === "x" && family.xFamily === "numeric")) {
    return { ...word, reading: "number" };
  }

  if (family.kind === "x" && family.xFamily === "valueAbility") {
    if (word.ending === "n" && (!word.pos || word.pos === "j")) {
      return { ...word, reading: "greeting" };
    }
    const host = family.leftRoots[0];
    const reading: LexReading =
      host && tables.needRoots.has(host) ? "value" : "ability";
    return { ...word, reading };
  }

  if (isRestrictor(word)) {
    return { ...word, reading: "restrictor" };
  }

  if (isStandIn(word) && word.family.kind === "joinMarker") {
    return { ...word, reading: "standIn" };
  }

  if (isFenceJoin(word) && word.family.kind === "joinMarker") {
    return {
      ...word,
      reading: "join",
      rootGloss: { concrete: joinFenceGloss(word.family.series, word.ending) },
    };
  }

  if (family.kind === "hookCompound") {
    const hooked = classifyHookCompound(word, tables);
    if (hooked) return hooked;
  }

  if (family.kind === "content" && family.roots.length === 1) {
    const compoundRow = tables.compounds.get(family.roots[0]!);
    if (compoundRow) {
      return {
        ...word,
        rootGloss: compoundLemmaGloss(compoundRow),
        reading: "ordinary",
        lexicalCompound: true,
      };
    }
    const hooked = classifyHookCompound(word, tables);
    if (hooked) return hooked;
  }

  const roots = lexiconContentRoots(word, knownLexiconRoots(tables));
  const published = publishedGlossForRoots(tables, roots);
  if (published) {
    return {
      ...word,
      rootGloss: published.gloss,
      reading: published.allFound ? "ordinary" : "unknown",
    };
  }

  if (family.kind === "foreign" || family.kind === "writingSpan") {
    return { ...word, reading: "unknown" };
  }

  if (roots.length > 0) {
    return { ...word, reading: "unknown" };
  }

  return { ...word, reading: "ordinary" };
}

export function classifyAll(words: MorphWord[], tables: ClassifyTables): LexWord[] {
  return words.map((word) => classify(word, tables));
}

/** Independent classify sources that apply (ignores first-match short-circuit). */
export type ClassifyHit = {
  source:
    | "overlay"
    | "number"
    | "valueAbility"
    | "restrictor"
    | "standIn"
    | "join"
    | "compoundLemma"
    | "published"
    | "foreign";
  reading: LexReading;
};

export function classifyHits(word: MorphWord, tables: ClassifyTables): ClassifyHit[] {
  const hits: ClassifyHit[] = [];
  const senseForm = overlaySenseForm(word);
  const pos = word.pos;

  if (senseForm && pos) {
    const overlayRow = tables.overlays.get(overlayKey(pos, senseForm));
    if (overlayRow && overlayRow.kind !== "need") {
      hits.push({ source: "overlay", reading: overlayReading(overlayRow) });
    }
  }

  const family = word.family;

  if (family.kind === "number" || (family.kind === "x" && family.xFamily === "numeric")) {
    hits.push({ source: "number", reading: "number" });
  }

  if (family.kind === "x" && family.xFamily === "valueAbility") {
    if (word.ending === "n" && (!word.pos || word.pos === "j")) {
      hits.push({ source: "valueAbility", reading: "greeting" });
    } else {
      const host = family.leftRoots[0];
      hits.push({
        source: "valueAbility",
        reading: host && tables.needRoots.has(host) ? "value" : "ability",
      });
    }
  }

  if (isRestrictor(word)) {
    hits.push({ source: "restrictor", reading: "restrictor" });
  }

  if (isStandIn(word)) {
    hits.push({ source: "standIn", reading: "standIn" });
  }

  if (isFenceJoin(word) && word.family.kind === "joinMarker") {
    hits.push({ source: "join", reading: "join" });
  }

  let skipPublished = false;
  if (family.kind === "hookCompound" || (family.kind === "content" && family.roots.length === 1)) {
    if (family.kind === "content" && tables.compounds.get(family.roots[0]!)) {
      hits.push({ source: "compoundLemma", reading: "ordinary" });
    }
    const hooked = classifyHookCompound(word, tables);
    if (hooked) {
      hits.push({
        source: hooked.lexicalCompound ? "compoundLemma" : "published",
        reading: "ordinary",
      });
      skipPublished = true;
    }
  }

  if (!skipPublished) {
    const roots = lexiconContentRoots(word, knownLexiconRoots(tables));
    const published = publishedGlossForRoots(tables, roots);
    if (published) {
      hits.push({ source: "published", reading: published.allFound ? "ordinary" : "unknown" });
    }
  }

  if (family.kind === "foreign" || family.kind === "writingSpan") {
    hits.push({ source: "foreign", reading: "unknown" });
  }

  return hits;
}

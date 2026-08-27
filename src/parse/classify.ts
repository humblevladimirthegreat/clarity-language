import {
  type OverlayRow,
  type PublishedRow,
  parseOverlayCsv,
  parsePublishedCsv,
  senseFormRoot,
} from "../lexicon-search.js";

import type { LexOverlay, LexReading, LexWord, MorphWord } from "./types.js";

function needRootsFromOverlays(overlays: Iterable<OverlayRow>): Set<string> {
  const roots = new Set<string>();
  for (const overlay of overlays) {
    if (overlay.definition.includes("need (")) {
      roots.add(senseFormRoot(overlay.senseForm));
    }
  }
  return roots;
}

function hostlessAbilityRootFromOverlays(overlays: Iterable<OverlayRow>): string | null {
  for (const overlay of overlays) {
    if (overlay.definition.includes("hostless ability")) {
      return senseFormRoot(overlay.senseForm);
    }
  }
  return null;
}

/** Six closed needs — filled from overlay definitions at table load. */
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
  needRoots: Set<string>;
  hostlessAbilityRoot: string | null;
};

function overlayKey(pos: string, senseForm: string): string {
  return `${pos}\0${senseForm}`;
}

function overlayFromRow(row: OverlayRow): LexOverlay {
  return {
    senseForm: row.senseForm,
    pos: row.pos,
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

function overlayReading(word: MorphWord, overlay: OverlayRow, tables: ClassifyTables): LexReading {
  const { family, pos, ending } = word;
  const senseRoot = senseFormRoot(overlay.senseForm);

  if (family.kind === "joinMarker" && ending === "n") {
    if (pos === "v") return "joinAct";
    if (pos === "g" || pos === "h") return "joinRelation";
  }

  if (tables.hostlessAbilityRoot && senseRoot === tables.hostlessAbilityRoot) return "ability";
  if (tables.needRoots.has(senseRoot)) return "value";

  return "mood";
}

function isRestrictor(word: MorphWord): boolean {
  const { family, pos, ending } = word;
  if (family.kind !== "joinMarker" || !pos || !ending) return false;
  if (pos !== "h" && pos !== "w") return false;
  if (ending === "n") return false;

  return RESTRICTOR_CORE.has(family.series + ending);
}

/** Join series English jobs — [coordination.md](docs/grammar/coordination.md) beginner set/rank tables. */
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
};

/** Fence-join gloss (not restrictors, join-acts, or `/j/` force/polar). */
export function joinFenceGloss(series: string, ending: string | undefined): string {
  const job = JOIN_SERIES_GLOSS[series] ?? `join ${series}`;
  const close = ending ? JOIN_ENDING_GLOSS[ending] : undefined;
  return close ? `${job} (${close})` : job;
}

function isFenceJoin(word: MorphWord): boolean {
  if (word.family.kind !== "joinMarker") return false;
  if (!word.pos || word.pos === "j") return false;
  return !isRestrictor(word);
}

function bareNeedTopic(word: MorphWord, tables: ClassifyTables): boolean {
  const { family, pos } = word;
  if (family.kind !== "content" || family.roots.length !== 1) return false;
  if (pos !== "h" && pos !== "w") return false;
  return tables.needRoots.has(family.roots[0]!);
}

function publishedRoots(word: MorphWord): string[] {
  const { family } = word;
  switch (family.kind) {
    case "content":
      return family.roots;
    case "x":
      if (family.xFamily === "role" && family.rightRoots?.length) {
        return family.rightRoots;
      }
      if (family.xFamily === "compound") {
        return [...family.leftRoots, ...(family.rightRoots ?? [])];
      }
      return family.leftRoots;
    default:
      return [];
  }
}

function publishedGlossForRoots(
  tables: ClassifyTables,
  roots: string[],
): { gloss: { literal?: string; metaphorical?: string }; allFound: boolean } | undefined {
  if (roots.length === 0) return undefined;
  const literals: string[] = [];
  const metaphoricals: string[] = [];
  let allFound = true;
  let any = false;
  for (const root of roots) {
    const row = tables.published.get(root);
    if (!row) {
      allFound = false;
      continue;
    }
    any = true;
    literals.push(row.literal || root);
    if (row.metaphorical) metaphoricals.push(row.metaphorical);
  }
  if (!any) return undefined;
  const gloss: { literal?: string; metaphorical?: string } = {};
  if (literals.length) gloss.literal = literals.join(" · ");
  if (metaphoricals.length) gloss.metaphorical = metaphoricals.join(" · ");
  return { gloss, allFound };
}

function finishTables(
  published: Map<string, PublishedRow>,
  overlays: Map<string, OverlayRow>,
): ClassifyTables {
  const overlayList = [...overlays.values()];
  const needRoots = needRootsFromOverlays(overlayList);
  const hostlessAbilityRoot = hostlessAbilityRootFromOverlays(overlayList);
  NEED_ROOTS.clear();
  for (const root of needRoots) {
    NEED_ROOTS.add(root);
  }
  return { overlays, published, needRoots, hostlessAbilityRoot };
}

export function createClassifyTables(
  publishedCsv: string,
  overlayCsv: string,
): ClassifyTables {
  const publishedRows = parsePublishedCsv(publishedCsv);
  const overlayRows = parseOverlayCsv(overlayCsv);

  const published = new Map<string, PublishedRow>();
  for (const row of publishedRows) {
    if (row.clarity) published.set(row.clarity, row);
  }

  const overlays = new Map<string, OverlayRow>();
  for (const row of overlayRows) {
    overlays.set(overlayKey(row.pos, row.senseForm), row);
  }

  return finishTables(published, overlays);
}

export function createClassifyTablesFromRows(
  publishedRows: PublishedRow[],
  overlayRows: OverlayRow[],
): ClassifyTables {
  const published = new Map<string, PublishedRow>();
  for (const row of publishedRows) {
    if (row.clarity) published.set(row.clarity, row);
  }

  const overlays = new Map<string, OverlayRow>();
  for (const row of overlayRows) {
    overlays.set(overlayKey(row.pos, row.senseForm), row);
  }

  return finishTables(published, overlays);
}

export function classify(word: MorphWord, tables: ClassifyTables): LexWord {
  const senseForm = overlaySenseForm(word);
  const pos = word.pos;

  if (senseForm && pos) {
    const overlayRow = tables.overlays.get(overlayKey(pos, senseForm));
    if (overlayRow) {
      return {
        ...word,
        overlay: overlayFromRow(overlayRow),
        reading: overlayReading(word, overlayRow, tables),
      };
    }
  }

  const family = word.family;

  if (family.kind === "number" || (family.kind === "x" && family.xFamily === "numeric")) {
    return { ...word, reading: "number" };
  }

  if (family.kind === "x" && family.xFamily === "valueAbility") {
    const host = family.leftRoots[0];
    const reading: LexReading =
      host && tables.needRoots.has(host) ? "value" : "ability";
    return { ...word, reading };
  }

  if (isRestrictor(word)) {
    return { ...word, reading: "restrictor" };
  }

  if (isFenceJoin(word) && word.family.kind === "joinMarker") {
    return {
      ...word,
      reading: "join",
      rootGloss: { literal: joinFenceGloss(word.family.series, word.ending) },
    };
  }

  if (bareNeedTopic(word, tables)) {
    return { ...word, reading: "value" };
  }

  const roots = publishedRoots(word);
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

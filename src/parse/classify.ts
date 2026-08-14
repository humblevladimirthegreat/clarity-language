import {
  type OverlayRow,
  type PublishedRow,
  parseOverlayCsv,
  parsePublishedCsv,
  senseFormRoot,
} from "../lexicon-search.js";

import type { LexOverlay, LexReading, LexWord, MorphWord } from "./types.js";

/** Six closed needs — [values.md § need inventory](docs/grammar/values.md#need-inventory). */
export const NEED_ROOTS = new Set([
  "obola",
  "odolo",
  "ogono",
  "azedo",
  "uzehu",
  "egege",
]);

const HOSTLESS_ABILITY_ROOT = "egera";

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

function rootGlossFromRow(row: PublishedRow): { literal?: string; metaphorical?: string } {
  const gloss: { literal?: string; metaphorical?: string } = {};
  if (row.literal) gloss.literal = row.literal;
  if (row.metaphorical) gloss.metaphorical = row.metaphorical;
  return gloss;
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

function overlayReading(word: MorphWord, overlay: OverlayRow): LexReading {
  const { family, pos, ending } = word;
  const senseRoot = senseFormRoot(overlay.senseForm);

  if (family.kind === "joinMarker" && ending === "n") {
    if (pos === "v") return "joinAct";
    if (pos === "g" || pos === "h") return "joinRelation";
  }

  if (senseRoot === HOSTLESS_ABILITY_ROOT) return "ability";
  if (NEED_ROOTS.has(senseRoot)) return "value";

  return "mood";
}

function isRestrictor(word: MorphWord): boolean {
  const { family, pos, ending } = word;
  if (family.kind !== "joinMarker" || !pos || !ending) return false;
  if (pos !== "h" && pos !== "w") return false;
  if (ending === "n") return false;

  return RESTRICTOR_CORE.has(family.series + ending);
}

function bareNeedTopic(word: MorphWord): boolean {
  const { family, pos } = word;
  if (family.kind !== "content" || family.roots.length !== 1) return false;
  if (pos !== "h" && pos !== "w") return false;
  return NEED_ROOTS.has(family.roots[0]!);
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

function lookupPublished(tables: ClassifyTables, roots: string[]): PublishedRow | undefined {
  for (const root of roots) {
    const row = tables.published.get(root);
    if (row) return row;
  }
  return undefined;
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

  return { overlays, published };
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

  return { overlays, published };
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
        reading: overlayReading(word, overlayRow),
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
      host && NEED_ROOTS.has(host) ? "value" : "ability";
    return { ...word, reading };
  }

  if (isRestrictor(word)) {
    return { ...word, reading: "restrictor" };
  }

  if (bareNeedTopic(word)) {
    return { ...word, reading: "value" };
  }

  const roots = publishedRoots(word);
  const publishedRow = lookupPublished(tables, roots);
  if (publishedRow) {
    return {
      ...word,
      rootGloss: rootGlossFromRow(publishedRow),
      reading: "ordinary",
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

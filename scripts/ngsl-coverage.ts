/**
 * NGSL → published-lexicon coverage report.
 *
 * Reads: data/ngsl.csv, lexicon-published.csv, ngsl-function-words.txt, ngsl-lemma-map.csv
 * Writes: data/ngsl-coverage.csv
 *
 * Run: npm run ngsl-coverage
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { escapeCsvField, parseCsv } from "./collapse-variants.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const ngslPath = join(rootDir, "data", "ngsl.csv");
const publishedPath = join(rootDir, "data", "lexicon-published.csv");
const functionPath = join(rootDir, "data", "ngsl-function-words.txt");
const lemmaMapPath = join(rootDir, "data", "ngsl-lemma-map.csv");
const outputPath = join(rootDir, "data", "ngsl-coverage.csv");

export type CoverageStatus =
  | "literal"
  | "metaphor"
  | "function"
  | "gap"
  | "skip-inflection";

export type CoverageRow = {
  lemma: string;
  status: CoverageStatus;
  emoji: string;
  literal: string;
  clarity: string;
  source: string;
  notes: string;
};

type PublishedRow = {
  emoji: string;
  literal: string;
  clarity: string;
  metaphorical: string;
};

/** Semicolon-separated lemmas in metaphorical cells; trim; drop empties. */
export function parseMetaphoricalCell(cell: string): string[] {
  return cell
    .split(";")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
}

export function formatMetaphoricalCell(lemmas: string[]): string {
  return lemmas.map((l) => l.trim().toLowerCase()).filter(Boolean).join(";");
}

function stripCommentLines(content: string): string {
  return content
    .split(/\r?\n/)
    .filter((line) => {
      const t = line.trim();
      return t.length > 0 && !t.startsWith("#");
    })
    .join("\n");
}

function loadFunctionWords(path: string): Set<string> {
  const words = new Set<string>();
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim().toLowerCase();
    if (!t || t.startsWith("#")) continue;
    words.add(t);
  }
  return words;
}

function loadLemmaMap(path: string): Map<string, string> {
  const content = stripCommentLines(readFileSync(path, "utf8"));
  const { rows } = parseCsv(content);
  const map = new Map<string, string>();
  for (const row of rows) {
    const surface = (row.surface ?? "").trim().toLowerCase();
    const lemma = (row.lemma ?? "").trim().toLowerCase();
    if (!surface || !lemma) continue;
    if (surface === lemma) continue;
    map.set(surface, lemma);
  }
  return map;
}

function loadNgsl(path: string): string[] {
  const { headers, rows } = parseCsv(readFileSync(path, "utf8"));
  if (headers[0]?.toLowerCase() !== "english") {
    throw new Error(`Expected ngsl.csv header "english", got "${headers[0]}"`);
  }
  return rows.map((r) => (r.english ?? "").trim().toLowerCase()).filter(Boolean);
}

function loadPublished(path: string): PublishedRow[] {
  const { rows } = parseCsv(readFileSync(path, "utf8"));
  return rows.map((r) => ({
    emoji: r.emoji ?? "",
    literal: (r.literal ?? "").trim().toLowerCase(),
    clarity: (r.clarity ?? "").trim(),
    metaphorical: r.metaphorical ?? "",
  }));
}

function resolveLemma(surface: string, lemmaMap: Map<string, string>): string {
  let cur = surface;
  const seen = new Set<string>();
  while (lemmaMap.has(cur)) {
    if (seen.has(cur)) {
      throw new Error(`Lemma-map cycle involving "${surface}"`);
    }
    seen.add(cur);
    cur = lemmaMap.get(cur)!;
  }
  return cur;
}

export function buildCoverage(args: {
  ngsl: string[];
  published: PublishedRow[];
  functionWords: Set<string>;
  lemmaMap: Map<string, string>;
}): { rows: CoverageRow[]; warnings: string[] } {
  const { ngsl, published, functionWords, lemmaMap } = args;
  const warnings: string[] = [];

  const byLiteral = new Map<string, PublishedRow>();
  const byMetaphorLemma = new Map<string, PublishedRow>();

  for (const row of published) {
    if (!row.literal) continue;
    if (byLiteral.has(row.literal)) {
      warnings.push(`Duplicate published literal "${row.literal}"`);
    } else {
      byLiteral.set(row.literal, row);
    }
    for (const lemma of parseMetaphoricalCell(row.metaphorical)) {
      const prev = byMetaphorLemma.get(lemma);
      if (prev && prev.emoji !== row.emoji) {
        warnings.push(
          `Metaphor lemma "${lemma}" on multiple rows (${prev.emoji} and ${row.emoji})`,
        );
      } else {
        byMetaphorLemma.set(lemma, row);
      }
    }
  }

  // Surface → lemma; first NGSL order wins for lemma rank
  const lemmaFirstIndex = new Map<string, number>();
  const skipRows: CoverageRow[] = [];
  const surfacesByLemma = new Map<string, string[]>();

  ngsl.forEach((surface, index) => {
    const lemma = resolveLemma(surface, lemmaMap);
    if (surface !== lemma) {
      skipRows.push({
        lemma: surface,
        status: "skip-inflection",
        emoji: "",
        literal: "",
        clarity: "",
        source: "lemma-map",
        notes: `→ ${lemma}`,
      });
    }
    const list = surfacesByLemma.get(lemma) ?? [];
    list.push(surface);
    surfacesByLemma.set(lemma, list);
    if (!lemmaFirstIndex.has(lemma)) {
      lemmaFirstIndex.set(lemma, index);
    }
  });

  const lemmas = [...lemmaFirstIndex.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([lemma]) => lemma);

  const claimedByLiteral = new Set<string>();
  const rows: CoverageRow[] = [...skipRows];

  for (const lemma of lemmas) {
    if (functionWords.has(lemma)) {
      rows.push({
        lemma,
        status: "function",
        emoji: "",
        literal: "",
        clarity: "",
        source: "denylist",
        notes: "",
      });
      continue;
    }

    const litHit = byLiteral.get(lemma);
    if (litHit) {
      claimedByLiteral.add(lemma);
      const metaClash = byMetaphorLemma.get(lemma);
      const notes =
        metaClash && metaClash.emoji !== litHit.emoji
          ? `warn: also listed as metaphor on ${metaClash.emoji}`
          : "";
      if (notes) warnings.push(`Lemma "${lemma}" is literal and metaphor on different rows`);
      rows.push({
        lemma,
        status: "literal",
        emoji: litHit.emoji,
        literal: litHit.literal,
        clarity: litHit.clarity,
        source: "exact",
        notes,
      });
      continue;
    }

    const metaHit = byMetaphorLemma.get(lemma);
    if (metaHit) {
      rows.push({
        lemma,
        status: "metaphor",
        emoji: metaHit.emoji,
        literal: metaHit.literal,
        clarity: metaHit.clarity,
        source: "metaphorical",
        notes: "",
      });
      continue;
    }

    rows.push({
      lemma,
      status: "gap",
      emoji: "",
      literal: "",
      clarity: "",
      source: "",
      notes: "",
    });
  }

  // Unused: keep claimedByLiteral for future audits
  void claimedByLiteral;

  return { rows, warnings };
}

function countByStatus(rows: CoverageRow[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }
  return counts;
}

function main(): void {
  const ngsl = loadNgsl(ngslPath);
  const published = loadPublished(publishedPath);
  const functionWords = loadFunctionWords(functionPath);
  const lemmaMap = loadLemmaMap(lemmaMapPath);

  const { rows, warnings } = buildCoverage({
    ngsl,
    published,
    functionWords,
    lemmaMap,
  });

  const header = "lemma,status,emoji,literal,clarity,source,notes";
  const lines = [
    header,
    ...rows.map((r) =>
      [
        escapeCsvField(r.lemma),
        escapeCsvField(r.status),
        escapeCsvField(r.emoji),
        escapeCsvField(r.literal),
        escapeCsvField(r.clarity),
        escapeCsvField(r.source),
        escapeCsvField(r.notes),
      ].join(","),
    ),
  ];
  writeFileSync(outputPath, lines.join("\n") + "\n");

  const counts = countByStatus(rows);
  const contentLemmas = rows.filter((r) => r.status !== "skip-inflection").length;
  const assigned = (counts.literal ?? 0) + (counts.metaphor ?? 0);

  console.log(`Wrote ${rows.length} rows to ${outputPath}`);
  console.log(`NGSL surfaces: ${ngsl.length}`);
  console.log(`Published roots: ${published.length}`);
  console.log(`Function denylist size: ${functionWords.size}`);
  console.log(`Lemma-map entries: ${lemmaMap.size}`);
  console.log("Status counts:", counts);
  console.log(
    `Content lemmas (excl. skip-inflection): ${contentLemmas}; assigned literal|metaphor: ${assigned}`,
  );

  for (const w of warnings) {
    console.warn(`warn: ${w}`);
  }
}

main();

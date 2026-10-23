/**
 * Count lines per grammar page.
 *
 * Run: npm run page-lines
 *      npm run page-lines -- --sittings
 *      npm run page-lines -- --headings clause.md
 *      npm run page-lines -- --json
 *      npm run page-lines -- --sort teach
 */
import { readFileSync } from "node:fs";
import { relative } from "node:path";

import { countPageLines, type PageLineCount } from "../src/lint/page-lines.js";
import { listMarkdown } from "../src/markdown-files.js";
import { GRAMMAR_DIR, grammarFile } from "../src/repo-paths.js";

const SITTING_SPLIT = 10;

type Kind = "sitting" | "review" | "orientation" | "recipe" | "claritish" | "cheat-sheet" | "other";
type SortKey = "lines" | "teach" | "practice" | "S";

type Options = {
  sittings: boolean;
  headings: boolean;
  json: boolean;
  sort: SortKey;
  pages: string[];
};

type Row = PageLineCount & { page: string; kind: Kind };

function parseArgs(argv: string[]): Options {
  const options: Options = { sittings: false, headings: false, json: false, sort: "lines", pages: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--sittings") options.sittings = true;
    else if (arg === "--headings") options.headings = true;
    else if (arg === "--json") options.json = true;
    else if (arg === "--sort") {
      const value = argv[++i];
      if (value !== "lines" && value !== "teach" && value !== "practice" && value !== "S") {
        throw new Error('Missing or invalid value for --sort (use "lines", "teach", "practice", or "S")');
      }
      options.sort = value;
    } else if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    } else if (arg.startsWith("-")) {
      throw new Error(`Unknown argument: ${arg}`);
    } else {
      options.pages.push(arg);
    }
  }
  return options;
}

function printUsage(): void {
  console.error(`Usage: npm run page-lines -- [--sittings] [--headings] [--json] [--sort lines|teach|practice|S] [page.md…]

Counts lines per docs/grammar page: total, teaching body (everything except
Practice and See also), Practice, and taught H3s (S). A sitting past 10 taught
sections splits onto a sibling page.

Examples:
  npm run page-lines
  npm run page-lines -- --sittings
  npm run page-lines -- --headings clause.md
  npm run page-lines -- --json --sort teach`);
}

function pageKind(rel: string, count: PageLineCount): Kind {
  if (rel.startsWith("claritish/")) return "claritish";
  if (rel.startsWith("cheat-sheets/")) return "cheat-sheet";
  if (/^(?:english|say-[a-z0-9-]+)\.md$/.test(rel)) return "recipe";
  if (/^review(?:-intermediate|-advanced)?\.md$/.test(rel.replace(/^.*\//, ""))) return "review";
  if (count.band) return "sitting";
  if (/^(?:index|purpose|introduction)\.md$/.test(rel)) return "orientation";
  return "other";
}

function namedPages(args: readonly string[]): Set<string> {
  const out = new Set<string>();
  for (const arg of args) {
    const normalized = arg
      .replace(/\\/g, "/")
      .replace(/^\.\//, "")
      .replace(/^docs\/grammar\//, "")
      .replace(/\.html?$/i, ".md");
    const withMd = normalized.endsWith(".md") ? normalized : `${normalized}.md`;
    out.add(withMd);
    out.add(withMd.replace(/^.*\//, ""));
    out.add(relative(GRAMMAR_DIR, grammarFile(withMd.replace(/^.*\//, ""))));
  }
  return out;
}

function loadRows(options: Options): Row[] {
  const named = namedPages(options.pages);
  const rows: Row[] = [];
  for (const file of listMarkdown(GRAMMAR_DIR)) {
    const page = relative(GRAMMAR_DIR, file);
    if (named.size && !named.has(page) && !named.has(page.replace(/^.*\//, ""))) continue;
    const count = countPageLines(readFileSync(file, "utf8"));
    const kind = pageKind(page, count);
    if (options.sittings && kind !== "sitting" && kind !== "review") continue;
    rows.push({ page, kind, ...count });
  }
  const key = options.sort;
  rows.sort((a, b) => b[key] - a[key] || a.page.localeCompare(b.page));
  return rows;
}

function pad(value: string | number, width: number, align: "left" | "right" = "right"): string {
  const text = String(value);
  if (text.length >= width) return text;
  const fill = " ".repeat(width - text.length);
  return align === "right" ? fill + text : text + fill;
}

function note(row: Row): string {
  return row.kind === "sitting" && row.S > SITTING_SPLIT ? "split (S>10)" : "";
}

function numWidth(rows: readonly Row[], key: "lines" | "teach" | "practice" | "seeAlso" | "S", min: number): number {
  return Math.max(min, ...rows.map((r) => String(r[key]).length));
}

function printTable(rows: Row[], headings: boolean): void {
  const showNote = rows.some((r) => note(r));
  const kindWidth = Math.max(4, ...rows.map((r) => r.kind.length));
  const bandWidth = Math.max(4, ...rows.map((r) => (r.band ?? "").length));
  const pageWidth = Math.max(4, ...rows.map((r) => r.page.length));
  const noteWidth = Math.max(4, ...rows.map((r) => note(r).length));
  const widths = {
    lines: numWidth(rows, "lines", 5),
    teach: numWidth(rows, "teach", 5),
    prac: numWidth(rows, "practice", 4),
    also: numWidth(rows, "seeAlso", 4),
    S: numWidth(rows, "S", 1),
    kind: kindWidth,
    band: bandWidth,
    page: pageWidth,
    note: noteWidth,
  };
  const cells = (row: {
    lines: string | number;
    teach: string | number;
    prac: string | number;
    also: string | number;
    S: string | number;
    kind: string;
    band: string;
    page: string;
    note: string;
  }) =>
    [
      pad(row.lines, widths.lines),
      pad(row.teach, widths.teach),
      pad(row.prac, widths.prac),
      pad(row.also, widths.also),
      pad(row.S, widths.S),
      pad(row.kind, widths.kind, "left"),
      pad(row.band, widths.band, "left"),
      pad(row.page, widths.page, "left"),
      ...(showNote ? [pad(row.note, widths.note, "left")] : []),
    ].join("  ");
  console.log(
    cells({
      lines: "lines",
      teach: "teach",
      prac: "prac",
      also: "also",
      S: "S",
      kind: "kind",
      band: "band",
      page: "page",
      note: "note",
    }),
  );
  for (const row of rows) {
    console.log(
      cells({
        lines: row.lines,
        teach: row.teach,
        prac: row.practice,
        also: row.seeAlso,
        S: row.S,
        kind: row.kind,
        band: row.band ?? "",
        page: row.page,
        note: note(row),
      }),
    );
    if (!headings || row.headings.length === 0) continue;
    for (const heading of [...row.headings].sort((a, b) => b.lines - a.lines)) {
      console.log(`        ${pad(heading.lines, 5)}  #${heading.id}  ${heading.title}`);
    }
  }
  const sittings = rows.filter((r) => r.kind === "sitting");
  if (sittings.length) {
    const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    console.log("");
    console.log(
      `${sittings.length} sittings: median teach ${median(sittings.map((r) => r.teach))}, mean teach ${mean(sittings.map((r) => r.teach)).toFixed(0)}, median S ${median(sittings.map((r) => r.S))}`,
    );
  }
}

function median(xs: number[]): number {
  const sorted = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length === 0) return 0;
  return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1]! + sorted[mid]!) / 2) : sorted[mid]!;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const rows = loadRows(options);
  if (options.pages.length && rows.length === 0) {
    throw new Error(`No grammar page matched: ${options.pages.join(", ")}`);
  }
  if (options.json) {
    console.log(
      JSON.stringify(
        rows.map((row) => ({
          page: row.page,
          kind: row.kind,
          band: row.band ?? null,
          lines: row.lines,
          teach: row.teach,
          practice: row.practice,
          seeAlso: row.seeAlso,
          S: row.S,
          note: note(row) || null,
          headings: options.headings ? row.headings : undefined,
        })),
        null,
        2,
      ),
    );
    return;
  }
  printTable(rows, options.headings);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

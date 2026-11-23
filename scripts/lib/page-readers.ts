/**
 * Read-by blocks (scripts/page-readers.ts): one generated comment per grammar page, after the
 * frontmatter and before the H1, that says what reads the page. Pure: the script gathers the
 * registries and pages, this file inverts, renders and places.
 *
 *   <!-- read-by (generated: npm run page-readers -- --write; do not edit)
 *   Page shape read by code:
 *   - …
 *   Sections named by data:
 *   - #id: 4 construction homes, 12 interpreter rows
 *   Named by data: 3 cues (claritish-triggers.csv), 2 flows (claritish-flows.json).
 *   Inbound links: npm run page-refs -- clause.md
 *   -->
 *
 * Placement is exact so `--strip` gives back the page byte for byte: with frontmatter the block
 * goes right after its closing `---` line as `\n` + block + `\n`; without, at the top as block + `\n\n`.
 */
import ts from "typescript";

import { READ_BY_OPEN } from "../../src/lint/page-lines.ts";
import type { PageContract, PageSet } from "../../src/page-contracts.ts";

export { READ_BY_OPEN };

export const READ_BY_HEADER = `${READ_BY_OPEN} (generated: npm run page-readers -- --write; do not edit)`;
const READ_BY_CLOSE = "-->";

/** One registry the generator reads. `kind: "section"` rows name `page.md#id`; `"page"` rows name a whole page. */
export type Registry = {
  name: string;
  kind: "section" | "page";
  singular: string;
  plural: string;
};

/** One registry row: the page key it names, the section id (`""` for the page itself), and where the row is. */
export type RegistryRef = { registry: string; page: string; id: string; where: string };

/** Per page: section id → registry name → count, and registry name → count for whole-page rows. */
export type PageCounts = { sections: Map<string, Map<string, number>>; named: Map<string, number> };

const bump = (map: Map<string, number>, key: string) => map.set(key, (map.get(key) ?? 0) + 1);

/** Turn registries around, from row → section to page → section → counts. */
export function invertRegistries(registries: readonly Registry[], refs: readonly RegistryRef[]): Map<string, PageCounts> {
  const kinds = new Map(registries.map((r) => [r.name, r.kind]));
  const out = new Map<string, PageCounts>();
  for (const ref of refs) {
    const kind = kinds.get(ref.registry);
    if (!kind) throw new Error(`${ref.where}: unknown registry \`${ref.registry}\``);
    let counts = out.get(ref.page);
    if (!counts) out.set(ref.page, (counts = { sections: new Map(), named: new Map() }));
    if (kind === "page") bump(counts.named, ref.registry);
    else {
      let section = counts.sections.get(ref.id);
      if (!section) counts.sections.set(ref.id, (section = new Map()));
      bump(section, ref.registry);
    }
  }
  return out;
}

/** `4 construction homes, 12 interpreter rows`, registries in their fixed order, zero counts left out. */
export function countText(registries: readonly Registry[], counts: ReadonlyMap<string, number>): string {
  return registries
    .filter((r) => counts.get(r.name))
    .map((r) => {
      const n = counts.get(r.name)!;
      return `${n} ${n === 1 ? r.singular : r.plural}`;
    })
    .join(", ");
}

export type BlockInput = {
  /** The key `npm run page-refs` takes. */
  pageKey: string;
  /** Page-shape lines (one English line each, with the reading file); none yet. */
  shape: readonly string[];
  registries: readonly Registry[];
  counts: PageCounts | undefined;
  /** The page's ids in page order; sections are listed in this order, the page itself first. */
  idOrder: readonly string[];
};

export function renderBlock(input: BlockInput): string {
  const lines = [READ_BY_HEADER];
  if (input.shape.length) lines.push("Page shape read by code:", ...input.shape.map((s) => `- ${s}`));
  const sections = input.counts?.sections ?? new Map<string, Map<string, number>>();
  if (sections.size) {
    const rank = new Map(input.idOrder.map((id, i) => [id, i]));
    const ids = [...sections.keys()].sort((a, b) => (a === "" ? -1 : b === "" ? 1 : (rank.get(a) ?? Infinity) - (rank.get(b) ?? Infinity)));
    lines.push("Sections named by data:");
    for (const id of ids) lines.push(`- ${id === "" ? "(page)" : `#${id}`}: ${countText(input.registries, sections.get(id)!)}`);
  }
  const named = input.counts?.named;
  if (named?.size) lines.push(`Named by data: ${countText(input.registries, named)}.`);
  lines.push(`Inbound links: npm run page-refs -- ${input.pageKey}`, READ_BY_CLOSE);
  return lines.join("\n");
}

const FRONTMATTER = /^---\n[\s\S]*?\n---\n/;

/** The page split at the block's place: frontmatter (or `""`) and everything after it. */
export function splitHead(markdown: string): { head: string; rest: string } {
  const m = FRONTMATTER.exec(markdown);
  return m ? { head: m[0], rest: markdown.slice(m[0].length) } : { head: "", rest: markdown };
}

/** The block text at the start of `rest` (as placed), or undefined. */
function placedBlock(head: string, rest: string): { block: string; length: number } | undefined {
  const lead = head ? "\n" : "";
  if (!rest.startsWith(`${lead}${READ_BY_OPEN}`)) return;
  const end = rest.indexOf(`\n${READ_BY_CLOSE}`, lead.length);
  if (end < 0) return;
  const blockEnd = end + 1 + READ_BY_CLOSE.length;
  const tail = head ? "\n" : "\n\n";
  if (!rest.startsWith(tail, blockEnd)) return;
  return { block: rest.slice(lead.length, blockEnd), length: blockEnd + tail.length };
}

/** The page without its read-by block (unchanged when it has none in place). */
export function stripBlock(markdown: string): string {
  const { head, rest } = splitHead(markdown);
  const placed = placedBlock(head, rest);
  return placed ? head + rest.slice(placed.length) : markdown;
}

/** The page with `block` in place; any block already in place is replaced. */
export function placeBlock(markdown: string, block: string): string {
  const { head, rest } = splitHead(stripBlock(markdown));
  return head ? `${head}\n${block}\n${rest}` : `${block}\n\n${rest}`;
}

/** The block in place, if any. */
export function currentBlock(markdown: string): string | undefined {
  const { head, rest } = splitHead(markdown);
  return placedBlock(head, rest)?.block;
}

export type PageResult = { next: string; problem?: "missing" | "stale" | "misplaced" };

/**
 * Check one page against its fresh block. `next` is the page with the fresh block in place (what
 * `--write` saves). A `<!-- read-by` left anywhere outside the place is `misplaced`.
 */
export function refreshPage(markdown: string, block: string): PageResult {
  const current = currentBlock(markdown);
  const stripped = stripBlock(markdown);
  const next = placeBlock(stripped, block);
  if (stripped.includes(READ_BY_OPEN)) return { next, problem: "misplaced" };
  if (current === undefined) return { next, problem: "missing" };
  return current === block ? { next } : { next, problem: "stale" };
}

// ---------------------------------------------------------------- shape lines

/** One contract from src/page-contracts.ts, by its export name, with the files that import it. */
export type ContractInfo = { name: string; contract: PageContract; readers: readonly string[] };

/** Whether a contract covers every page or every stage page; such a contract is listed once, in grammar-docs.md. */
export function isWholeSite(set: PageSet): boolean {
  return set.kind === "every page" || set.kind === "stage pages";
}

/** The part's name in a line: `H1`, `#gap`, `tables`, or the contract's label. */
export function partLabel(contract: PageContract): string {
  if (contract.label) return contract.label;
  if (contract.part === "h1") return "H1";
  if ((contract.part === "section" || contract.part === "anchor") && contract.id) return `#${contract.id}`;
  return contract.part;
}

/** `#gap: requires (reader, reader)`; with `count`, the label carries it: `markers (3)`. */
export function shapeLine(info: ContractInfo, count?: number): string {
  const label = count === undefined ? partLabel(info.contract) : `${partLabel(info.contract)} (${count})`;
  return `${label}: ${info.contract.requires} (${info.readers.join(", ")})`;
}

/**
 * How many times the part is on the page: matches of the pattern, the id (0 or 1), or table rows.
 * `ids` is the page's published ids.
 */
export function partCount(contract: PageContract, markdown: string, ids: ReadonlySet<string>): number {
  const body = markdown.replace(/<!--[\s\S]*?-->/g, (c) => (contract.part === "marker" ? c : ""));
  if (contract.pattern) return [...body.matchAll(new RegExp(contract.pattern.source, contract.pattern.flags.includes("g") ? contract.pattern.flags : `${contract.pattern.flags}g`))].length;
  if (contract.part === "section" || contract.part === "anchor") return contract.id && ids.has(contract.id) ? 1 : 0;
  if (contract.part === "tables") return body.split("\n").filter((l) => l.startsWith("|")).length;
  if (contract.part === "examples") return [...body.matchAll(/`[^`\n]+`/g)].length;
  if (contract.part === "h1") return [...body.matchAll(/^# /gm)].length;
  return 0;
}

// ---------------------------------------------------------------- whole-site block (grammar-docs.md)

export const SITE_OPEN = "<!-- read-by-site (generated: npm run page-readers -- --write; do not edit) -->";
export const SITE_CLOSE = "<!-- /read-by-site -->";

/** The whole-site block's body: contracts on every page or stage page, then the tools that read every page alike. */
export function renderSiteBody(contracts: readonly ContractInfo[], tools: readonly string[]): string {
  const lines = ["Page shape read on every page or every stage page:", ""];
  for (const info of contracts) {
    const where = info.contract.pages.kind === "every page" ? "every page" : "stage pages";
    lines.push(`- ${partLabel(info.contract)} (${where}${info.contract.part === "marker" ? ", where present; counted in each page's block" : ""}): ${info.contract.requires} (${info.readers.map((r) => `\`${r}\``).join(", ")})`);
  }
  lines.push("", "Tools that read or rewrite every page alike, with no page contract:", "", ...tools.map((t) => `- \`${t}\``));
  return lines.join("\n");
}

/** The page with the whole-site block's body refreshed; `problem` when the markers are absent or the body is stale. */
export function refreshSiteBlock(markdown: string, body: string): { next: string; problem?: "no marker" | "stale" } {
  const open = markdown.indexOf(SITE_OPEN);
  const close = markdown.indexOf(SITE_CLOSE, open);
  if (open < 0 || close < 0) return { next: markdown, problem: "no marker" };
  const start = open + SITE_OPEN.length;
  const fresh = `\n\n${body}\n\n`;
  const next = markdown.slice(0, start) + fresh + markdown.slice(close);
  return next === markdown ? { next } : { next, problem: "stale" };
}

// ---------------------------------------------------------------- new readers

/** Code that names a grammar path: the helpers, the folder, or the path in parts. */
export const GRAMMAR_PATH_RE = /grammarFile\(|GRAMMAR_DIR|docs\/grammar|["']docs["'],\s*["']grammar["']/;

/** A source file's code with its comments removed (a `.vue` file's `<script>` blocks only). */
export function codeOnly(file: string, text: string): string {
  const source = file.endsWith(".vue") ? [...text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]!).join("\n") : text;
  const kind = /\.[cm]?js$/.test(file) ? ts.ScriptKind.JS : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file.replace(/\.vue$/, ".ts"), source, ts.ScriptTarget.Latest, false, kind);
  return ts.createPrinter({ removeComments: true }).printFile(sf);
}

/** Whether a source file names a grammar path in code, not only in comments; the site's code folder (`docs/grammar/.vitepress`) is not a page path. */
export function namesGrammarPath(file: string, text: string): boolean {
  return GRAMMAR_PATH_RE.test(text) && GRAMMAR_PATH_RE.test(codeOnly(file, text).replaceAll("docs/grammar/.vitepress", ""));
}

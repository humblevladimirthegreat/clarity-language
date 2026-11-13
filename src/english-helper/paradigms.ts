/**
 * Paradigm blocks: the cheat sheet tables (docs/grammar/cheat-sheets/), read as small tables of
 * closed forms that belong together, so the prompt can show a whole paradigm whenever the analysis
 * links one of its rows' sections (docs/meta/procedures/english-helper.md). Pure: the caller reads
 * the sheets and resolves anchors. The cue index skips these pages (cues.ts `SKIP_PAGES`); a block
 * is shown whole, never matched as a cue.
 */

/** One table row: the sections it links (`page.md#slug`, canonical), and its rendered lines: every cell, or only its forms and English. */
export type ParadigmRow = { links: string[]; line: string; lean: string };
export type ParadigmStyle = "line" | "lean";
/** Under a cap: drop the largest block until the rest fit, or take blocks nearest first (a linked row's table, then its page, then its sheet), smallest first within each. */
export type CapFill = "drop-largest" | "nearest";

/** One cheat sheet table, under the heading it sits in. */
export type ParadigmBlock = {
  /** `cheat-sheets/x.md`. */
  sheet: string;
  /** The heading the table sits under. */
  heading: string;
  rows: ParadigmRow[];
};

/**
 * How far a linked section reaches into the blocks:
 * - `rows`: only the rows that link the section
 * - `table`: every row of a table with a row that links the section
 * - `page`: every table with a row that links any section of the section's page
 * - `sheet`: every table on a sheet with a row that links the section
 * - `all`: every table (a ceiling, not a choice)
 */
export const REACHES = ["rows", "table", "page", "sheet", "all"] as const;
export type Reach = (typeof REACHES)[number];

/** Split a table line into its cells, on pipes outside code spans (`a|b` in backticks stays one cell). */
export function tableCells(line: string): string[] {
  const cells: string[] = [];
  let cell = "";
  let code = false;
  for (let k = 0; k < line.length; k++) {
    const ch = line[k]!;
    if (ch === "\\" && line[k + 1] === "|") {
      cell += "|";
      k++;
    } else if (ch === "`") {
      code = !code;
      cell += ch;
    } else if (ch === "|" && !code) {
      cells.push(cell.trim());
      cell = "";
    } else cell += ch;
  }
  cells.push(cell.trim());
  // A row starts and ends with a pipe: drop the empty edges.
  if (cells[0] === "") cells.shift();
  if (cells.at(-1) === "") cells.pop();
  return cells;
}

/** `/comparatives#equatives` → `comparatives.md#equatives`; none for a link off the grammar pages. */
export function siteLink(href: string): string | undefined {
  const m = /^\/([a-z0-9-]+)(?:#([^\s)]+))?$/.exec(href);
  if (!m || m[1] === "cheat-sheets") return undefined;
  return m[2] ? `${m[1]}.md#${m[2]}` : `${m[1]}.md`;
}

/** A cell as prompt text: links keep their text, emphasis marks and HTML go. */
function plainCell(cell: string): string {
  return cell
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/(?<![`\w])\*\*?([^*`]+)\*\*?(?![`\w])/g, "$1")
    .trim();
}

/**
 * Every table on one cheat sheet, as blocks. `canonical` maps a `page.md#id` link to the section
 * it lands in (`page.md#slug`, so a pinned old id and the heading id agree); a link it does not
 * know is kept as written. The Stage column is dropped from each line.
 */
export function parseParadigmBlocks(sheet: string, markdown: string, canonical: (link: string) => string = (l) => l): ParadigmBlock[] {
  const blocks: ParadigmBlock[] = [];
  let heading = "";
  let fence = false;
  const lines = markdown.split("\n");
  for (let k = 0; k < lines.length; k++) {
    const line = lines[k]!;
    if (/^\s*```/.test(line)) fence = !fence;
    if (fence) continue;
    const h = /^#{1,6}\s+(.*?)\s*(?:\{#[^}]+\})?$/.exec(line);
    if (h) heading = h[1]!;
    if (!line.startsWith("|") || !/^\|[\s:|-]+\|$/.test(lines[k + 1] ?? "")) continue;
    const header = tableCells(line);
    const stage = header.findIndex((c) => c.toLowerCase() === "stage");
    const rows: ParadigmRow[] = [];
    for (k += 2; k < lines.length && lines[k]!.startsWith("|"); k++) {
      const cells = tableCells(lines[k]!);
      const links = [...lines[k]!.matchAll(/\]\(([^)\s]+)\)/g)].flatMap((m) => siteLink(m[1]!) ?? []).map(canonical);
      const text = cells.filter((_, c) => c !== stage).map(plainCell).filter(Boolean);
      const forms = [...new Set(cells.flatMap((c) => [...c.matchAll(/`([^`]+)`/g)].map((m) => `\`${m[1]}\``)))];
      const english = cells.flatMap((c) => [...c.replace(/`[^`]*`/g, "").matchAll(/(?<![*\w])\*([^*]+)\*(?![*\w])/g)].map((m) => m[1]!.trim()));
      const lean = forms.length ? `- ${forms.join(" / ")}${english.length ? ` — ${english.join(" / ")}` : ""}` : "";
      if (text.length) rows.push({ links: [...new Set(links)], line: `- ${text.join(" — ")}`, lean });
    }
    k--;
    if (rows.length) blocks.push({ sheet, heading, rows });
  }
  return blocks;
}

const pageOf = (link: string) => link.split("#")[0]!;

/**
 * The block lines a set of linked sections brings in at a reach, each line once, grouped under
 * its block's heading. `links` are canonical `page.md#slug` sections.
 */
export function paradigmLines(
  blocks: readonly ParadigmBlock[],
  links: Iterable<string>,
  reach: Reach,
  style: ParadigmStyle = "line",
  cap = Infinity,
  fill: CapFill = "drop-largest",
): string[] {
  const linked = new Set(links);
  const pages = new Set([...linked].map(pageOf));
  const rowHit = (row: ParadigmRow) => row.links.some((l) => linked.has(l));
  const sheets = new Set(blocks.filter((b) => b.rows.some(rowHit)).map((b) => b.sheet));
  const groups: string[][] = [];
  const tier = new Map<string[], number>();
  const seen = new Set<string>();
  const nearest = [...blocks].sort((a, b) => tierOf(a) - tierOf(b));
  function tierOf(block: ParadigmBlock): number {
    if (block.rows.some(rowHit)) return 0;
    if (block.rows.some((r) => r.links.some((l) => pages.has(pageOf(l))))) return 1;
    return sheets.has(block.sheet) ? 2 : 3;
  }
  for (const block of fill === "nearest" ? nearest : blocks) {
    let rows: ParadigmRow[];
    switch (reach) {
      case "rows":
        rows = block.rows.filter(rowHit);
        break;
      case "table":
        rows = block.rows.some(rowHit) ? block.rows : [];
        break;
      case "page":
        rows = block.rows.some((r) => r.links.some((l) => pages.has(pageOf(l)))) ? block.rows : [];
        break;
      case "sheet":
        rows = sheets.has(block.sheet) ? block.rows : [];
        break;
      case "all":
        rows = block.rows;
        break;
    }
    const fresh = rows.map((r) => r[style]).filter((line) => line && !seen.has(line));
    if (!fresh.length) continue;
    const group = [`### ${block.heading}`, ...fresh];
    groups.push(group);
    tier.set(group, tierOf(block));
    for (const line of fresh) seen.add(line);
  }
  const size = (g: readonly string[]) => g.reduce((a, l) => a + l.length + 1, 0);
  if (fill === "nearest") {
    const kept = new Set<string[]>();
    let used = 0;
    for (const g of [...groups].sort((a, b) => tier.get(a)! - tier.get(b)! || size(a) - size(b))) {
      if (used + size(g) > cap) continue;
      kept.add(g);
      used += size(g);
    }
    return groups.filter((g) => kept.has(g)).flat();
  }
  // Over the cap, the largest block goes first: a small paradigm is more likely the one the sentence needs.
  let total = groups.reduce((a, g) => a + size(g), 0);
  const dropped = new Set<string[]>();
  for (const g of [...groups].sort((a, b) => size(b) - size(a))) {
    if (total <= cap) break;
    dropped.add(g);
    total -= size(g);
  }
  return groups.filter((g) => !dropped.has(g)).flat();
}

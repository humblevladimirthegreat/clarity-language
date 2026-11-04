/**
 * Checkpoint inventory (docs/meta/drill-generation.md#allowlist and #settings): the allowlist
 * names every sidebar sitting once, by file, and says whether it has a checkpoint.
 *
 * - Every sitting has exactly one allowlist row, and every row names a sitting or an
 *   orientation page (always **skip**). A later-band row's **Band** matches the page's `band:`; the Beginner
 *   table (no Band column) holds Beginner sittings and orientation pages.
 * - **exists**: the page has exactly one `### Practice`, with a **Setting:** line equal to the
 *   row's Setting cell. **skip**: no Practice, Setting `—`, and a reason in the notes cell.
 *   **generate**: the checkpoint is still to write, so it fails.
 * - Settings are unique across stage checkpoints (a leading *a* / *an* / *the* and case do not
 *   count). Each recipe-track practice block (`say-*.md`) has a row in the recipe table; it may
 *   share a setting only with the stage page its **From** cell names.
 */
import type { Band } from "./learning-order.js";
import { grammarHeadings } from "./grammar-anchors.js";
import { practiceRanges } from "./practice-sections.js";

export type TableRow = {
  /** Lowercased header cell → cell text (trimmed). */
  cells: Map<string, string>;
  /** 1-based line in the markdown. */
  line: number;
};

/** Rows of every pipe table in `markdown`, keyed by their header. */
export function markdownTableRows(markdown: string): TableRow[] {
  const rows: TableRow[] = [];
  let header: string[] | undefined;
  markdown.split("\n").forEach((text, i) => {
    if (!text.trimStart().startsWith("|")) {
      header = undefined;
      return;
    }
    const cells = text.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    if (!header) {
      header = cells.map((c) => c.toLowerCase());
      return;
    }
    if (cells.every((c) => /^:?-+:?$/.test(c))) return;
    const map = new Map<string, string>();
    header.forEach((h, j) => map.set(h, cells[j] ?? ""));
    rows.push({ cells: map, line: i + 1 });
  });
  return rows;
}

const plain = (cell: string | undefined) => (cell ?? "").replace(/[`*]/g, "").trim();
const isNone = (cell: string) => cell === "" || cell === "—" || cell === "-";

export type AllowlistRow = {
  file: string;
  /** From the Band column; Beginner when the table has none. */
  band: Band;
  status: string;
  /** Setting cell, `""` when the cell is `—` or the table has no Setting column. */
  setting: string;
  notes: string;
  line: number;
};

/** Rows of the allowlist tables: any table with File and Status columns. */
export function allowlistRows(markdown: string): AllowlistRow[] {
  const out: AllowlistRow[] = [];
  for (const { cells, line } of markdownTableRows(markdown)) {
    if (!cells.has("file") || !cells.has("status")) continue;
    const file = plain(cells.get("file"));
    if (!file) continue;
    const setting = (cells.get("setting") ?? "").trim();
    const notesKey = [...cells.keys()].find((k) => k.includes("notes"));
    out.push({
      file,
      band: (plain(cells.get("band")).toLowerCase() || "beginner") as Band,
      status: plain(cells.get("status")).toLowerCase(),
      setting: isNone(setting) ? "" : setting,
      notes: notesKey ? plain(cells.get(notesKey)) : "",
      line,
    });
  }
  return out;
}

export type RecipeRow = { file: string; practice: string; setting: string; from: string; line: number };

/** Rows of the recipe-track settings table: File, Practice (block id), Setting, From. */
export function recipeRows(markdown: string): RecipeRow[] {
  const out: RecipeRow[] = [];
  for (const { cells, line } of markdownTableRows(markdown)) {
    if (!cells.has("file") || !cells.has("practice") || !cells.has("from")) continue;
    const from = plain(cells.get("from"));
    out.push({
      file: plain(cells.get("file")),
      practice: plain(cells.get("practice")).replace(/^#/, ""),
      setting: (cells.get("setting") ?? "").trim(),
      from: isNone(from) ? "" : from,
      line,
    });
  }
  return out;
}

const SETTING_RE = /^\*\*Setting:\*\*\s*(.*?)\s*\.?\s*$/;

/** The **Setting:** text of each `### Practice` section on a sitting (undefined when it has none). */
export function practiceSettings(markdown: string): (string | undefined)[] {
  const lines = markdown.split("\n");
  return practiceRanges(lines).map(({ start, end }) => {
    for (let i = start + 1; i < end; i++) {
      const m = SETTING_RE.exec(lines[i]!);
      if (m) return m[1]!;
    }
    return undefined;
  });
}

export type RecipeBlock = { page: string; id: string; setting: string };

/** Recipe-track practice blocks: each **Setting:** line, under its nearest H3. */
export function recipeBlocks(page: string, markdown: string): RecipeBlock[] {
  const headings = grammarHeadings(markdown).filter((h) => h.level === 3);
  const out: RecipeBlock[] = [];
  markdown.split("\n").forEach((text, line) => {
    const m = SETTING_RE.exec(text);
    if (!m) return;
    const h3 = headings.filter((h) => h.line < line).at(-1);
    out.push({ page, id: h3?.id ?? "", setting: m[1]! });
  });
  return out;
}

/** Setting compared for reuse: case and a leading article do not count. */
export function settingKey(setting: string): string {
  return setting
    .toLowerCase()
    .replace(/\.$/, "")
    .trim()
    .replace(/^(?:a|an|the)\s+/, "");
}

export type SittingCheckpoints = {
  page: string;
  /** Front matter `band:`; undefined for an orientation page. */
  band?: Band;
  /** One entry per `### Practice` section: its setting, or undefined when it has none. */
  settings: (string | undefined)[];
};

export type InventoryFinding = {
  /** `drill-generation.md` (with `line`) or a grammar page. */
  file: string;
  line?: number;
  detail: string;
};

const META = "drill-generation.md";

export function lintCheckpointInventory(input: {
  allowlist: string;
  /** Sidebar sittings, in reading order. */
  pages: readonly SittingCheckpoints[];
  /** Orientation pages: a row is allowed (as **skip**) but not required. */
  orientation?: readonly string[];
  recipes: readonly RecipeBlock[];
}): InventoryFinding[] {
  const findings: InventoryFinding[] = [];
  const meta = (line: number, detail: string) => findings.push({ file: META, line, detail });
  const pages = new Map(input.pages.map((p) => [p.page, p]));
  const rows = allowlistRows(input.allowlist);
  const rowsByFile = new Map<string, AllowlistRow[]>();
  for (const row of rows) rowsByFile.set(row.file, [...(rowsByFile.get(row.file) ?? []), row]);

  for (const p of input.pages) {
    const own = rowsByFile.get(p.page) ?? [];
    if (own.length === 0) {
      findings.push({
        file: p.page,
        detail: `no allowlist row: add one (status **exists** with its setting, or **skip** with a reason)`,
      });
    }
  }

  for (const [file, own] of rowsByFile) {
    for (const extra of own.slice(1)) meta(extra.line, `\`${file}\` has more than one allowlist row (first on line ${own[0]!.line}); one sitting, one row`);
    const row = own[0]!;
    const page = pages.get(file);
    if (!page && input.orientation?.includes(file)) {
      if (row.status !== "skip") meta(row.line, `\`${file}\` is an orientation page: mark it **skip**`);
      continue;
    }
    if (!page) {
      meta(row.line, `\`${file}\` is not a sidebar sitting: drop the row, or rename it to the file that now holds this checkpoint`);
      continue;
    }
    if (page.band && row.band !== page.band) meta(row.line, `\`${file}\` is ${page.band} (front matter) but the row says ${row.band}`);
    const practices = page.settings.length;
    if (row.status === "exists") {
      if (practices !== 1) {
        meta(row.line, `\`${file}\` is **exists** but has ${practices} ### Practice section(s); expected one`);
        continue;
      }
      const actual = page.settings[0];
      if (actual === undefined) findings.push({ file, detail: "### Practice has no **Setting:** line" });
      else if (!row.setting) meta(row.line, `\`${file}\` Setting cell is empty; the page says "${actual}"`);
      else if (row.setting !== actual) meta(row.line, `\`${file}\` Setting cell "${row.setting}" does not match the page's "${actual}"`);
    } else if (row.status === "skip") {
      if (practices > 0) meta(row.line, `\`${file}\` is **skip** but has a ### Practice section; mark it **exists** with its setting`);
      if (row.setting) meta(row.line, `\`${file}\` is **skip**: its Setting cell must be —`);
      if (isNone(row.notes)) meta(row.line, `\`${file}\` is **skip** with no reason in the notes cell`);
    } else if (row.status === "generate") {
      meta(row.line, `\`${file}\` is **generate**: write its ### Practice checkpoint (then mark it **exists**), or mark it **skip** with a reason`);
    } else {
      meta(row.line, `\`${file}\` status "${row.status}" is not exists / skip / generate`);
    }
  }

  // Stage settings come from the pages themselves, so an unlisted page still counts.
  const stageOwners = new Map<string, string[]>();
  for (const p of input.pages) {
    for (const s of p.settings) {
      if (s === undefined) continue;
      const key = settingKey(s);
      stageOwners.set(key, [...(stageOwners.get(key) ?? []), p.page]);
    }
  }
  for (const [key, owners] of stageOwners) {
    if (owners.length > 1) {
      for (const owner of owners.slice(1)) {
        findings.push({ file: owner, detail: `setting "${key}" is also used by ${owners[0]}; pick one no other checkpoint names` });
      }
    }
  }

  const recipeTable = recipeRows(input.allowlist);
  const recipeKey = (file: string, id: string) => `${file}#${id}`;
  const recipeRowsByKey = new Map(recipeTable.map((r) => [recipeKey(r.file, r.practice), r]));
  const blockKeys = new Set(input.recipes.map((b) => recipeKey(b.page, b.id)));
  for (const row of recipeTable) {
    if (!blockKeys.has(recipeKey(row.file, row.practice))) {
      meta(row.line, `recipe row \`${row.file}\` #${row.practice} has no practice block with a **Setting:** under that heading`);
    }
  }
  const recipeOwners = new Map<string, string>();
  for (const block of input.recipes) {
    const where = recipeKey(block.page, block.id);
    const row = recipeRowsByKey.get(where);
    if (!row) {
      findings.push({ file: block.page, detail: `practice block #${block.id} ("${block.setting}") has no row in the recipe settings table` });
    } else if (row.setting !== block.setting) {
      meta(row.line, `recipe row ${where} Setting "${row.setting}" does not match the page's "${block.setting}"`);
    }
    const key = settingKey(block.setting);
    const stage = stageOwners.get(key);
    if (stage) {
      if (!row?.from) {
        findings.push({ file: block.page, detail: `#${block.id} setting "${key}" is used by ${stage[0]}; name that page in From if its items moved here, or pick another setting` });
      } else if (!stage.includes(row.from)) {
        meta(row.line, `recipe row ${where} From \`${row.from}\` does not use "${key}" (${stage[0]} does)`);
      }
    } else if (row?.from) {
      meta(row.line, `recipe row ${where} From \`${row.from}\` does not use "${key}"`);
    }
    const other = recipeOwners.get(key);
    if (other) findings.push({ file: block.page, detail: `#${block.id} setting "${key}" is also used by recipe block ${other}` });
    else recipeOwners.set(key, where);
  }
  return findings;
}

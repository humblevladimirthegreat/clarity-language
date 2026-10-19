// Reads the Claritish cheat sheet (docs/grammar/claritish/cheat-sheet.md) for the editor's
// flows: a flow names a cell (row label × column header, or a cell by its English), a column
// header, or a prose line, and never a spelling. So a lesson edit that reaches the sheet, or a
// respelling by retie-docs, reaches the editor with no change to the flow data.
import { cells, spans, tables } from "../lint/cheat-sheet-tables.js";

/** A place on the sheet. String fields may hold `{question}`, filled from the writer's answers. */
export type SheetRef = {
  /** `{#id}` of the sheet heading. */
  section: string;
  /** 1-based table in the section; the first by default. */
  table?: number;
  /** Row label: the first cell's English, matched whole or as a word prefix. */
  row?: string;
  /** Column header, matched the same way (`-l`, `Stance`). */
  col?: string;
  /** A form cell anywhere in the table, by its English (`autonomy`) or the meaning in the cell beside it (`can never`). */
  cell?: string;
  /** A prose line in the section, by its opening words. */
  line?: string;
  /** What to read: the cell's first form (default), its English, the row label, the header's English, or the header's ending letter. */
  take?: "span" | "english" | "row" | "col" | "ending";
};

type SheetTable = { header: string[]; rows: string[][] };

export type Sheet = { tables: Map<string, SheetTable[]>; lines: Map<string, string[]> };

export function readSheet(markdown: string): Sheet {
  const byTable = new Map<string, SheetTable[]>();
  for (const table of tables(markdown)) {
    if (!table.section) continue;
    const list = byTable.get(table.section) ?? [];
    list.push({ header: cells(table.header), rows: table.rows.map((r) => cells(r.text)) });
    byTable.set(table.section, list);
  }
  const lines = new Map<string, string[]>();
  let section: string | undefined;
  for (const line of markdown.split("\n")) {
    const id = /^#{1,6}\s.*\{#([\w-]+)\}\s*$/.exec(line)?.[1];
    if (id) section = id;
    else if (section && line.trim() && !line.startsWith("|")) lines.set(section, [...(lines.get(section) ?? []), line]);
  }
  return { tables: byTable, lines };
}

/** Markdown to plain text: links to their text, emphasis and backticks dropped. */
export function plain(md: string): string {
  return md
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/\*([^*]*)\*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** A cell's English: the text after its leading form (`` `ahu` autonomy `` → `autonomy`). */
export function cellEnglish(cell: string): string {
  return plain(cell.replace(/^`[^`]+`[,\s]*/, ""));
}

/** A header's English without its ending tag (`**-l** strong` → `strong`). */
function headerEnglish(header: string): string {
  return plain(header).replace(/^-[a-z]\b\s*/, "");
}

function fill(value: string, answers: Readonly<Record<string, string>>): string {
  return value.replace(/\{([\w-]+)\}/g, (_, id: string) => {
    const answer = answers[id];
    if (answer === undefined) throw new Error(`no answer for {${id}}`);
    return answer;
  });
}

/** The one item that is `wanted`, or starts with it at a word boundary. */
function pick(items: readonly string[], wanted: string, what: string): number {
  const w = wanted.toLowerCase();
  const exact = items.flatMap((item, i) => (item.toLowerCase() === w ? [i] : []));
  if (exact.length === 1) return exact[0]!;
  const prefix = items.flatMap((item, i) => (item.toLowerCase().startsWith(w) && !/[\p{L}\p{N}]/u.test(item[w.length] ?? "") ? [i] : []));
  if (prefix.length === 1) return prefix[0]!;
  throw new Error(`${what} \`${wanted}\` ${prefix.length ? "is ambiguous" : "is not on the sheet"} (have: ${items.join("; ")})`);
}

function tableOf(sheet: Sheet, ref: SheetRef): SheetTable {
  const list = sheet.tables.get(ref.section);
  if (!list) throw new Error(`no table in sheet section #${ref.section}`);
  const table = list[(ref.table ?? 1) - 1];
  if (!table) throw new Error(`sheet section #${ref.section} has no table ${ref.table}`);
  return table;
}

/** The text a ref reads: a form for `span`, English otherwise. */
export function resolveRef(sheet: Sheet, ref: SheetRef, answers: Readonly<Record<string, string>> = {}): string {
  const where = `#${ref.section}${ref.table ? ` table ${ref.table}` : ""}`;
  if (ref.line !== undefined) return sheetLine(sheet, ref.section, fill(ref.line, answers));
  const table = tableOf(sheet, ref);
  const take = ref.take ?? "span";
  let cell: string;
  let rowLabel = "";
  if (ref.cell !== undefined) {
    const entries = formCells(table);
    const entry = entries[pick(entries.map((e) => e.english), fill(ref.cell, answers), `cell in ${where}`)]!;
    if (take === "english") return entry.english;
    cell = entry.cell;
  } else {
    let col: number | undefined;
    if (ref.col !== undefined) {
      col = pick(table.header.map(plain), fill(ref.col, answers), `column in ${where}`);
      const header = table.header[col]!;
      if (take === "col") return headerEnglish(header);
      if (take === "ending") {
        const ending = /^-([a-z])\b/.exec(plain(header))?.[1];
        if (!ending) throw new Error(`column \`${plain(header)}\` in ${where} names no ending`);
        return ending;
      }
    }
    if (ref.row === undefined) throw new Error(`ref to ${where} names no row or cell`);
    const row = table.rows[pick(table.rows.map((r) => cellEnglish(r[0] ?? "")), fill(ref.row, answers), `row in ${where}`)]!;
    rowLabel = cellEnglish(row[0] ?? "");
    if (take === "row") return rowLabel;
    if (col === undefined) throw new Error(`ref to ${where} names a row but no column`);
    cell = row[col] ?? "";
  }
  if (take === "english") return cellEnglish(cell);
  if (take !== "span") throw new Error(`take \`${take}\` needs a column in ${where}`);
  const form = spans(cell)[0];
  if (!form) throw new Error(`cell \`${cell}\` in ${where} has no form`);
  return form;
}

/**
 * The cells that hold a form, each with its English: the cell's own (`` `ahu` autonomy ``), or,
 * for a cell that is only a form, the form-less cell to its right (`` | `-xo` | can't yet | ``).
 */
function formCells(table: SheetTable): { cell: string; english: string }[] {
  return table.rows.flatMap((row) =>
    row.flatMap((cell, i) => {
      if (!spans(cell).length) return [];
      const next = row[i + 1] ?? "";
      const english = cellEnglish(cell) || (spans(next).length ? "" : plain(next));
      return [{ cell, english }];
    }),
  );
}

function sheetLine(sheet: Sheet, section: string, opening: string): string {
  const lines = (sheet.lines.get(section) ?? []).filter((l) => plain(l).startsWith(opening));
  if (lines.length !== 1) throw new Error(`${lines.length ? "several lines" : "no line"} in sheet section #${section} start with \`${opening}\``);
  return lines[0]!;
}

/** A word formula on the sheet: `` Sake word: `th` + sake + stance + ending. `` → literal and slot parts. */
export function readFormula(line: string): ({ literal: string } | { slot: string })[] {
  const body = line.slice(line.indexOf(":") + 1).trim().replace(/\.$/, "");
  const parts = body.split(/\s*\+\s*/).map((part) => {
    const literal = /^`([^`]+)`$/.exec(part)?.[1];
    if (literal) return { literal };
    if (/^[a-z]+$/.test(part)) return { slot: part };
    throw new Error(`formula part \`${part}\` is neither a form nor a slot name`);
  });
  if (parts.length < 2) throw new Error(`\`${line}\` is not a formula (\`form\` + slot + …)`);
  return parts;
}

/** A swap rule on the sheet: `` `g` for `th` `` → replace the literal `th` with `g`. */
export function readSwap(line: string): { from: string; to: string } {
  const m = /`([^`]+)` for `([^`]+)`/.exec(line);
  if (!m) throw new Error(`\`${line}\` has no \`X\` for \`Y\` swap`);
  return { to: m[1]!, from: m[2]! };
}

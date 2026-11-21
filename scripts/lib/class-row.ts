/**
 * The classification table of `docs/meta/interpreter.md` read as rows, for `npm run class-row` (scripts/class-row.ts):
 * each row of a part key with its line number and its note cell. Pure; the script reads the file.
 */

export type ClassTableRow = { line: number; keyType: string; key: string; cls: string; anchor: string; note: string };

/** The full key a reading's part carries: `joinSeries:ue`, `overlay:clause_hinge:th`. */
export const fullKey = (row: ClassTableRow): string => `${row.keyType}:${row.key}`;

/** Every row of the `## Classification table` section, with its 1-based line in `text`. */
export function parseClassTable(text: string): ClassTableRow[] {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => l === "## Classification table");
  if (start < 0) throw new Error("no '## Classification table' heading");
  const rows: ClassTableRow[] = [];
  for (let i = start + 1; i < lines.length && !lines[i]!.startsWith("## "); i++) {
    const m = /^\| (\w+) \| `([^`]+)` \| ([^|]+?) \| ([^|]*?) \|(.*)\|$/.exec(lines[i]!);
    if (m) rows.push({ line: i + 1, keyType: m[1]!, key: m[2]!, cls: m[3]!.trim(), anchor: m[4]!.trim().replace(/^`|`$/g, ""), note: m[5]!.trim() });
  }
  return rows;
}

/** The rows of one requested key: the exact full key, else every row under it (`joinSeries` gives the join series, `overlay:clause_hinge` its rows). */
export function rowsFor(rows: ClassTableRow[], wanted: string): ClassTableRow[] {
  const exact = rows.filter((r) => fullKey(r) === wanted);
  return exact.length ? exact : rows.filter((r) => fullKey(r).startsWith(`${wanted}:`));
}

/** One row as a line: `docs/meta/interpreter.md:LINE  key  class  anchor  note`. */
export function formatRow(row: ClassTableRow, file: string): string {
  return `${file}:${row.line}  ${fullKey(row)}  ${row.cls}  ${row.anchor}  ${row.note || "(no note)"}`;
}

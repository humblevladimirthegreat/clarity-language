/**
 * Counting for `npm run sweep` (scripts/sweep.ts): the translation accounting walk of
 * `src/interpret/accounting-walk.ts` reduced to counts, saved, diffed and printed. Pure; the script does the I/O.
 */
import type { Walk } from "../../src/interpret/accounting-walk.js";

/** Three tables of counts: `left` by `"<reason> <key>"`, `unused` by the key of each unused part, `threw` by message. */
export type SweepCounts = { kept: number; left: Record<string, number>; unused: Record<string, number>; threw: Record<string, number> };

const bump = (table: Record<string, number>, key: string): void => {
  table[key] = (table[key] ?? 0) + 1;
};

/** The key of an unused part's text: `link hookJob:resume "ar"` is `hookJob:resume`; a text with no key is its kind. */
export function partKey(text: string): string {
  const m = /^(\S+)(?: (\S+))?/.exec(text);
  return m?.[2] ?? m?.[1] ?? text;
}

export function countWalk(walk: Pick<Walk, "kept" | "left" | "threw">): SweepCounts {
  const counts: SweepCounts = { kept: walk.kept, left: {}, unused: {}, threw: {} };
  for (const l of walk.left) {
    bump(counts.left, `${l.reason} ${l.key}`);
    for (const text of l.unused) bump(counts.unused, partKey(text));
  }
  for (const t of walk.threw) bump(counts.threw, t.message);
  return counts;
}

export type Change = { table: "left" | "unused" | "threw" | "kept"; key: string; before: number; after: number };

/** Every key whose count differs, a missing key counting as 0; sorted by table, then key. */
export function diffCounts(before: SweepCounts, after: SweepCounts): Change[] {
  const out: Change[] = [];
  if (before.kept !== after.kept) out.push({ table: "kept", key: "readings kept", before: before.kept, after: after.kept });
  for (const table of ["left", "unused", "threw"] as const) {
    const keys = new Set([...Object.keys(before[table] ?? {}), ...Object.keys(after[table] ?? {})]);
    for (const key of [...keys].sort()) {
      const a = before[table]?.[key] ?? 0;
      const b = after[table]?.[key] ?? 0;
      if (a !== b) out.push({ table, key, before: a, after: b });
    }
  }
  return out;
}

const byCount = (table: Record<string, number>): [string, number][] => Object.entries(table).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

/** The report: left readings under their reason, then unused parts by key, then throws. */
export function formatCounts(counts: SweepCounts): string[] {
  const lines = [`readings kept: ${counts.kept}`];
  const reasons = new Map<string, [string, number][]>();
  for (const [rk, n] of byCount(counts.left)) {
    const at = rk.indexOf(" ");
    const reason = rk.slice(0, at);
    reasons.set(reason, [...(reasons.get(reason) ?? []), [rk.slice(at + 1), n]]);
  }
  const total = (rows: [string, number][]): number => rows.reduce((n, r) => n + r[1], 0);
  for (const [reason, rows] of [...reasons].sort((a, b) => total(b[1]) - total(a[1]))) {
    lines.push("", `left, ${reason}: ${total(rows)}`);
    for (const [key, n] of rows) lines.push(`  ${String(n).padStart(5)}  ${key}`);
  }
  const unused = byCount(counts.unused);
  lines.push("", `unused parts, by part key: ${total(unused)}`);
  for (const [key, n] of unused) lines.push(`  ${String(n).padStart(5)}  ${key}`);
  const threw = byCount(counts.threw);
  lines.push("", `translate() threw: ${total(threw)}`);
  for (const [message, n] of threw) lines.push(`  ${String(n).padStart(5)}  ${message}`);
  return lines;
}

/** The diff report: one line per changed key, `before -> after`; "no change" when none. */
export function formatDiff(changes: Change[]): string[] {
  if (!changes.length) return ["no change since the save"];
  return changes.map((c) => `${c.table.padEnd(6)} ${String(c.before).padStart(5)} -> ${String(c.after).padEnd(5)} ${c.key}`);
}

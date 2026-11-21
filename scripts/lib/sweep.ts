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

/** True when `key` names `candidate`: the same key, or a type that heads it (`lexReading` names `lexReading:standIn`). */
const names = (key: string, candidate: string): boolean => candidate === key || candidate.startsWith(`${key}:`);

/** One distinct example text behind a key: how many left readings it gave, the first file it came from. */
export type KeyText = { key: string; text: string; file: string; count: number };

/**
 * The example texts behind each key (`--texts`): a key matches a left reading's reason, its frame key, or the key of any of
 * its unused parts. Grouped by key, then text, the commonest first.
 */
export function textsFor(left: readonly Walk["left"][number][], keys: readonly string[]): KeyText[] {
  const out = new Map<string, KeyText>();
  for (const l of left) {
    const hits = new Set<string>();
    for (const k of keys) {
      if (l.reason === k || names(k, l.key)) hits.add(l.key);
      for (const part of l.unused) if (names(k, partKey(part))) hits.add(partKey(part));
    }
    for (const key of hits) {
      const id = `${key}\u0000${l.text}`;
      const row = out.get(id) ?? { key, text: l.text, file: l.file, count: 0 };
      row.count++;
      out.set(id, row);
    }
  }
  return [...out.values()].sort((a, b) => a.key.localeCompare(b.key) || b.count - a.count || a.text.localeCompare(b.text));
}

/** The `--texts` report: per key, one line per text, `count | text  (file)`; no match says so. */
export function formatTexts(rows: readonly KeyText[], keys: readonly string[]): string[] {
  const lines: string[] = [];
  for (const key of [...new Set(rows.map((r) => r.key))]) {
    const mine = rows.filter((r) => r.key === key);
    lines.push(`${key}: ${mine.reduce((n, r) => n + r.count, 0)} left, ${mine.length} text(s)`);
    for (const r of mine) lines.push(`  ${String(r.count).padStart(4)} | ${r.text}  (${r.file})`);
  }
  if (!rows.length) lines.push(`no left reading matches ${keys.join(", ")}`);
  return lines;
}

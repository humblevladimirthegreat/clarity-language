/**
 * Counting for `npm run sweep` (scripts/sweep.ts): the translation accounting walk of
 * `src/interpret/accounting-walk.ts` reduced to counts, saved, diffed and printed; and the same for `npm run round-trip`
 * (scripts/round-trip.ts), on the shared table, diff and `--texts` helpers. Pure; the scripts do the I/O.
 */
import type { Walk } from "../../src/interpret/accounting-walk.js";

/** Three tables of counts: `left` by `"<reason> <key>"`, `unused` by the key of each unused part, `threw` by message. */
export type SweepCounts = { kept: number; left: Record<string, number>; unused: Record<string, number>; threw: Record<string, number> };

/** Count one more under `key`. */
export const bump = (table: Record<string, number>, key: string): void => {
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

export type Change = { table: string; key: string; before: number; after: number };

/** Every key of one table whose count differs, a missing key counting as 0; sorted by key. */
export function diffTable(table: string, before: Record<string, number> | undefined, after: Record<string, number> | undefined): Change[] {
  const out: Change[] = [];
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  for (const key of [...keys].sort()) {
    const a = before?.[key] ?? 0;
    const b = after?.[key] ?? 0;
    if (a !== b) out.push({ table, key, before: a, after: b });
  }
  return out;
}

/** Every key whose count differs, a missing key counting as 0; sorted by table, then key. */
export function diffCounts(before: SweepCounts, after: SweepCounts): Change[] {
  const out: Change[] = [];
  if (before.kept !== after.kept) out.push({ table: "kept", key: "readings kept", before: before.kept, after: after.kept });
  for (const table of ["left", "unused", "threw"] as const) out.push(...diffTable(table, before[table], after[table]));
  return out;
}

/** A table's rows, the commonest first, then by key. */
export const byCount = (table: Record<string, number>): [string, number][] => Object.entries(table).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

const total = (rows: [string, number][]): number => rows.reduce((n, r) => n + r[1], 0);

/**
 * A table keyed `"<group> <key>"` as one block per group, the largest group first: a `heading(group): total` line, then
 * one line per key, the commonest first.
 */
export function formatGrouped(table: Record<string, number>, heading: (group: string) => string): string[] {
  const lines: string[] = [];
  const groups = new Map<string, [string, number][]>();
  for (const [gk, n] of byCount(table)) {
    const at = gk.indexOf(" ");
    const group = gk.slice(0, at);
    groups.set(group, [...(groups.get(group) ?? []), [gk.slice(at + 1), n]]);
  }
  for (const [group, rows] of [...groups].sort((a, b) => total(b[1]) - total(a[1]))) {
    lines.push("", `${heading(group)}: ${total(rows)}`);
    for (const [key, n] of rows) lines.push(`  ${String(n).padStart(5)}  ${key}`);
  }
  return lines;
}

/** The report: left readings under their reason, then unused parts by key, then throws. */
export function formatCounts(counts: SweepCounts): string[] {
  const lines = [`readings kept: ${counts.kept}`, ...formatGrouped(counts.left, (reason) => `left, ${reason}`)];
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
  const hits: { key: string; text: string; file: string }[] = [];
  for (const l of left) {
    const keyed = new Set<string>();
    for (const k of keys) {
      if (l.reason === k || names(k, l.key)) keyed.add(l.key);
      for (const part of l.unused) if (names(k, partKey(part))) keyed.add(partKey(part));
    }
    for (const key of keyed) hits.push({ key, text: l.text, file: l.file });
  }
  return collectTexts(hits);
}

/**
 * Hits of example texts under keys, counted: one row per key and text, with the first hit's file; grouped by key, then
 * text, the commonest first.
 */
export function collectTexts(hits: readonly { key: string; text: string; file: string }[]): KeyText[] {
  const out = new Map<string, KeyText>();
  for (const hit of hits) {
    const id = `${hit.key}\u0000${hit.text}`;
    const row = out.get(id) ?? { ...hit, count: 0 };
    row.count++;
    out.set(id, row);
  }
  return [...out.values()].sort((a, b) => a.key.localeCompare(b.key) || b.count - a.count || a.text.localeCompare(b.text));
}

/** The `--texts` report: per key, one line per text, `count | text  (file)`; no match says so. `noun` names what is counted. */
export function formatTexts(rows: readonly KeyText[], keys: readonly string[], noun: { counted: string; none: string } = { counted: "left", none: "left reading" }): string[] {
  const lines: string[] = [];
  for (const key of [...new Set(rows.map((r) => r.key))]) {
    const mine = rows.filter((r) => r.key === key);
    lines.push(`${key}: ${mine.reduce((n, r) => n + r.count, 0)} ${noun.counted}, ${mine.length} text(s)`);
    for (const r of mine) lines.push(`  ${String(r.count).padStart(4)} | ${r.text}  (${r.file})`);
  }
  if (!rows.length) lines.push(`no ${noun.none} matches ${keys.join(", ")}`);
  return lines;
}

/** A trip of `npm run round-trip` as counted: its verdict, the key it is filed under, its example. */
export type TripRow = { verdict: string; key: string; ageben: string; source: string };

/** The round trip's counts: trips by verdict, and by `"<verdict> <key>"`. */
export type TripCounts = { examples: number; verdicts: Record<string, number>; keys: Record<string, number> };

export function countTrips(trips: readonly TripRow[]): TripCounts {
  const out: TripCounts = { examples: trips.length, verdicts: {}, keys: {} };
  for (const trip of trips) {
    bump(out.verdicts, trip.verdict);
    bump(out.keys, `${trip.verdict} ${trip.key}`);
  }
  return out;
}

/** Every verdict and verdict-key count that differs; sorted by table, then key. */
export function diffTrips(before: TripCounts, after: TripCounts): Change[] {
  const out: Change[] = before.examples === after.examples ? [] : [{ table: "examples", key: "examples", before: before.examples, after: after.examples }];
  return [...out, ...diffTable("verdict", before.verdicts, after.verdicts), ...diffTable("key", before.keys, after.keys)];
}

/** The round-trip report: the totals by verdict, then each verdict's keys. */
export function formatTrips(counts: TripCounts): string[] {
  const lines = [`examples: ${counts.examples}`, ...byCount(counts.verdicts).map(([verdict, n]) => `  ${String(n).padStart(5)}  ${verdict}`)];
  return [...lines, ...formatGrouped(counts.keys, (verdict) => verdict)];
}

/**
 * The trips behind each key (`--texts`): a key matches a trip's verdict (`gap:noRule`, `skipped:unread`), the key it is
 * filed under, or a type that heads that key (`edge` names `edge:force`).
 */
export function tripTexts(trips: readonly TripRow[], keys: readonly string[]): KeyText[] {
  const hits: { key: string; text: string; file: string }[] = [];
  for (const trip of trips) {
    for (const k of keys) {
      if (trip.verdict === k) hits.push({ key: k, text: trip.ageben, file: trip.source });
      else if (names(k, trip.key)) hits.push({ key: `${trip.verdict} ${trip.key}`, text: trip.ageben, file: trip.source });
    }
  }
  return collectTexts(hits);
}

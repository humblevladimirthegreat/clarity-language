/**
 * Triage helpers for `npm run round-trip` (scripts/round-trip.ts) and `npm run realize -- view --key`
 * (scripts/realize.ts): which trips a key argument names, each trip's reason, the `--tally` of reasons, the `--per-key`
 * pick, and a long report written to a log with a short summary for stdout. Pure but for `writeLog`.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { tmpPath, tmpRel } from "../../src/tmp-paths.js";
import { clip } from "./build-output.ts";

/** The fields of a `Trip` (src/round-trip/round-trip.ts) that triage reads. */
export type TriageTrip = { verdict: string; key: string; ageben: string; source: string; detail?: string | undefined };

/** What names a trip. */
type Named = Pick<TriageTrip, "verdict" | "key">;

/** Whether a key argument names a trip: its verdict, its key, or a type heading its key (`edge` names `edge:force`). */
export function names(arg: string, trip: Named): boolean {
  return trip.verdict === arg || trip.key === arg || trip.key.startsWith(`${arg}:`);
}

const escape = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * The reason in a trip's detail line, for grouping: a detail reads `HEAD: REASON`, where HEAD is the trip's key
 * (`edge:force: frame slot:th` gives `frame slot:th`) or a gloss; after a gloss, every word of it in the reason (the
 * gloss, its spelling) is replaced by `…`, so `z-dog | v-see: gloss does not round-trip: z-dog | v-see` gives
 * `gloss does not round-trip: …`. A detail with no `: ` is its own reason; a trip with no detail is `(VERDICT)`.
 */
export function tripReason(trip: Pick<TriageTrip, "verdict" | "key" | "detail">): string {
  const { detail } = trip;
  if (!detail) return `(${trip.verdict})`;
  const at = detail.indexOf(": ");
  if (at < 0) return detail;
  if (detail.slice(0, at) === trip.key) return detail.slice(at + 2);
  const words = [...new Set(detail.slice(0, at).split(/\s+/).map((w) => w.replace(/^[[(]+|[\])]+$/g, "")))]
    .filter((w) => w.length > 1 && /[\p{L}\d]/u.test(w))
    .sort((a, b) => b.length - a.length);
  let reason = detail.slice(at + 2);
  for (const w of words) reason = reason.replace(new RegExp(`(?<![\\p{L}\\d_.:←-])${escape(w)}(?![\\p{L}\\d_-])`, "gu"), "…");
  return reason.replace(/\[*…(?:[\s|→[\]]*…)*\]*/g, "…");
}

/** One reason under a key: how many trips gave it, and the first such trip's text and file:line. */
export type TallyRow = { reason: string; count: number; text: string; source: string };

/** One key argument's tally: its trip count and its reasons, the commonest first. */
export type Tally = { key: string; trips: number; reasons: TallyRow[] };

/** The `--tally` of each key argument: the trips it names, grouped by {@link tripReason}. */
export function tallyTrips(trips: readonly TriageTrip[], keys: readonly string[]): Tally[] {
  return keys.map((key) => {
    const rows = new Map<string, TallyRow>();
    let count = 0;
    for (const trip of trips) {
      if (!names(key, trip)) continue;
      count++;
      const reason = tripReason(trip);
      const row = rows.get(reason) ?? { reason, count: 0, text: trip.ageben, source: trip.source };
      row.count++;
      rows.set(reason, row);
    }
    return { key, trips: count, reasons: [...rows.values()].sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason)) };
  });
}

/** The tally report: per key, `KEY  N trip(s)`, then one line per reason, `count  reason  text  file:line`. */
export function formatTally(tallies: readonly Tally[], maxReasons = Infinity): string[] {
  const lines: string[] = [];
  for (const t of tallies) {
    lines.push(`${t.key}  ${t.trips} trip(s), ${t.reasons.length} reason(s)`);
    if (!t.trips) lines.push("  no trip matches");
    const width = Math.min(48, Math.max(0, ...t.reasons.map((r) => r.reason.length)));
    for (const r of t.reasons.slice(0, maxReasons)) {
      const reason = r.reason.length > width ? `${r.reason.slice(0, width - 1)}…` : r.reason.padEnd(width);
      lines.push(`  ${String(r.count).padStart(4)}  ${reason}  ${r.text}  ${r.source}`);
    }
    if (t.reasons.length > maxReasons) lines.push(`  … ${t.reasons.length - maxReasons} more reason(s)`);
  }
  return lines;
}

/** The trips any key names, in order; with `perKey`, at most that many named by each key (a trip counts once). */
export function pickTrips<T extends Named>(trips: readonly T[], keys: readonly string[], perKey?: number): T[] {
  if (perKey === undefined) return trips.filter((trip) => keys.some((k) => names(k, trip)));
  const picked = new Set<T>();
  for (const k of keys) for (const trip of trips.filter((t) => names(k, t)).slice(0, perKey)) picked.add(trip);
  return trips.filter((trip) => picked.has(trip));
}

/** Write `lines` in full to `tmp/logs/NAME`; return the repo-relative path for the summary line. */
export function writeLog(name: string, lines: readonly string[]): string {
  const file = tmpPath("logs", name);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${lines.join("\n")}\n`);
  return tmpRel("logs", name);
}

/** The first `max` lines, each clipped, for stdout. */
export const shortLines = (lines: readonly string[], max: number): string => lines.slice(0, max).map(clip).join("\n");

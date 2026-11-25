/**
 * The round trip (docs/meta/realizer.md#round-trip): each doc example read as a one-turn log, every reading projected
 * and realized, the realized sentences joined in order and judged against the original with `sameReadings`.
 */
import { canonicalReadings, sameReadings } from "../interpret/equal.js";
import { allReadings, readText } from "../interpret/read.js";
import type { Reading } from "../interpret/types.js";
import type { ClassifyTables } from "../parse/classify.js";
import { project } from "../realize/meaning.js";
import { firstKey, realize, type GapKind, type Realized } from "../realize/realize.js";
import { corpus, readTurn, type CorpusEntry } from "./corpus.js";

/** Why an example is not judged: it does not parse, a reading has an `unread` entry, or its readings did not project. */
export type SkipReason = "noParse" | "unread" | "project";

export type Verdict = "ok" | "different" | "unsettled" | `gap:${GapKind}` | `skipped:${SkipReason}`;

/**
 * One example's round trip. `key` files it for the counts: a gap's key, else the key (`firstKey`) of the first reading
 * that differs, or of the first reading; `(none)` when nothing was read. `path` is the first differing path of a
 * `different` verdict (`idempotence` when the realized text realizes to another gloss).
 */
export type Trip = { source: string; ageben: string; verdict: Verdict; key: string; gloss?: string; realized?: string; path?: string; detail?: string };

/** The key of a trip with no reading to file it under. */
export const NO_KEY = "(none)";

/** A text's readings realized in order: the joined glosses and spellings, or the first gap. */
function realizeAll(readings: Reading[], tables: ClassifyTables): Realized {
  const glosses: string[] = [];
  const lines: string[] = [];
  for (const view of project(readings, tables)) {
    const out = realize(view, tables);
    if ("gap" in out) return out;
    glosses.push(out.gloss);
    lines.push(out.ageben);
  }
  return { gloss: glosses.join(" | "), ageben: lines.join(" ") };
}

/**
 * The first place two canonical forms differ, as a path: the sentence index, then object keys and array indices
 * (`1.claim.roles.z.stem.0`); `sentences` when the counts differ.
 */
export function firstDifference(a: readonly string[], b: readonly string[]): string {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) continue;
    return [String(i), ...(diffPath(JSON.parse(a[i]!), JSON.parse(b[i]!)) ?? [])].join(".");
  }
  return a.length === b.length ? "" : "sentences";
}

/** The path to the first differing value, or undefined when equal. */
function diffPath(x: unknown, y: unknown): string[] | undefined {
  if (JSON.stringify(x) === JSON.stringify(y)) return undefined;
  if (!x || !y || typeof x !== "object" || typeof y !== "object" || Array.isArray(x) !== Array.isArray(y)) return [];
  const xo = x as Record<string, unknown>;
  const yo = y as Record<string, unknown>;
  const keys = Array.isArray(x) ? [...Array(Math.max((x as unknown[]).length, (y as unknown[]).length)).keys()].map(String) : [...new Set([...Object.keys(xo), ...Object.keys(yo)])].sort();
  for (const key of keys) {
    const sub = diffPath(xo[key], yo[key]);
    if (sub) return [key, ...sub];
  }
  return [];
}

/** One example's round trip. */
export function tripEntry(entry: CorpusEntry, tables: ClassifyTables): Trip {
  const base = { source: entry.source, ageben: entry.ageben };
  const keyAt = (index: number): string => (entry.meanings[index] ? firstKey(entry.meanings[index]) : NO_KEY);
  if (allReadings(entry.readings).some((r) => r.unread.length)) return { ...base, verdict: "skipped:unread", key: keyAt(0) };
  const out = realizeAll(entry.readings, tables);
  if ("gap" in out) return { ...base, verdict: `gap:${out.gap.kind}`, key: out.gap.key, detail: out.gap.detail };
  const done = { ...base, gloss: out.gloss, realized: out.ageben };
  const judged = sameReadings(entry.ageben, out.ageben, tables);
  if (judged.verdict === "unsettled") return { ...done, verdict: "unsettled", key: keyAt(0), detail: judged.pairs?.map((p) => p.join(" / ")).join("; ") };
  if (judged.verdict === "different") {
    if (judged.error) return { ...done, verdict: "different", key: keyAt(0), path: "parse", detail: judged.error };
    const path = firstDifference(canonicalReadings(readText(entry.ageben, tables)).sentences, canonicalReadings(readText(out.ageben, tables)).sentences);
    return { ...done, verdict: "different", key: keyAt(Number(path.split(".")[0]) || 0), path };
  }
  let again: ReturnType<typeof realizeAll>;
  try {
    again = realizeAll(readTurn(out.ageben, tables), tables);
  } catch (error) {
    return { ...done, verdict: "different", key: keyAt(0), path: "idempotence", detail: (error as Error).message };
  }
  if ("gap" in again || again.gloss !== out.gloss) return { ...done, verdict: "different", key: keyAt(0), path: "idempotence", detail: "gap" in again ? again.gap.detail : again.gloss };
  return { ...done, verdict: "ok", key: keyAt(0) };
}

/** Every doc example's round trip, those that did not parse or project included as skipped. */
export function roundTrip(tables: ClassifyTables): Trip[] {
  const { entries, unparsed, failures } = corpus(tables);
  return [
    ...entries.map((entry) => tripEntry(entry, tables)),
    ...unparsed.map((u): Trip => ({ source: u.source, ageben: u.ageben, verdict: "skipped:noParse", key: NO_KEY, detail: u.error })),
    ...failures.map((f): Trip => ({ source: "", ageben: f, verdict: "skipped:project", key: NO_KEY })),
  ];
}

// ── Counts ──

/** The ratchet (`round-trip-ratchet.json`): the `ok` count, and the failures (not `ok`, not skipped) by key. */
export type Ratchet = { ok: number; keys: Record<string, number> };

/** A trip the realizer failed: not `ok`, and not skipped before the realizer ran. */
export const failed = (trip: Trip): boolean => trip.verdict !== "ok" && !trip.verdict.startsWith("skipped:");

export function ratchetOf(trips: readonly Trip[]): Ratchet {
  const keys = new Map<string, number>();
  for (const trip of trips) if (failed(trip)) keys.set(trip.key, (keys.get(trip.key) ?? 0) + 1);
  return { ok: trips.filter((t) => t.verdict === "ok").length, keys: Object.fromEntries([...keys].sort(([a], [b]) => a.localeCompare(b))) };
}

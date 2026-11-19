/**
 * Scope queries over the readings' frame order (`--over` / `--under`, `--unordered`) and the pure half of `--diff`:
 * each example's scope order as plain strings, and the difference between two passes' records. Every reading counts,
 * nested ones included (clause-join members, dependents, islands, verb-list items, quotes).
 * The strings depend only on a frame's family, member, word spelling and position, so an older
 * reader's readings compare with the current ones whatever their object shape.
 */
import type { ClassifyTables } from "../parse/classify.js";
import type { Example, FindParser } from "./examples.js";
import type { FindQuery } from "./walk.js";

type LooseWord = { raw?: string; at?: number };
/** A frame as both passes give it; every field is optional so an older reading still reads. */
type LooseFrame = { family?: string; member?: string; words?: LooseWord[]; values?: Record<string, string> };
/** A reading's order: `order` pairs and `unordered` pairs of frames. */
type LooseReading = { order?: { over?: LooseFrame; under?: LooseFrame }[]; unordered?: (LooseFrame | undefined)[][] };

const wordOf = (frame: LooseFrame | undefined): LooseWord | undefined => frame?.words?.[0];

function readingsOf(example: Pick<Example, "allReadings">): LooseReading[] {
  return example.allReadings as unknown as LooseReading[];
}

/** `family` or `family/member`: what `--over` and `--under` name. */
export function frameMatches(frame: LooseFrame, spec: string): boolean {
  if (!frame.family) return false;
  return spec === frame.family || (frame.member !== undefined && spec === `${frame.family}/${frame.member}`);
}

function wordIndexes(example: Example, frames: (LooseFrame | undefined)[]): number[] {
  const out: number[] = [];
  example.words.forEach((item, i) => {
    if (frames.some((frame) => wordOf(frame) === item.word)) out.push(i);
  });
  return out;
}

/** Highlighted word indexes for a scope query, or null when no reading matches. */
export function matchScopeQuery(example: Example, query: Extract<FindQuery, { kind: "scope" | "unordered" }>): number[] | null {
  const hits: number[] = [];
  let matched = false;
  for (const reading of readingsOf(example)) {
    if (query.kind === "unordered") {
      for (const pair of reading.unordered ?? []) {
        matched = true;
        hits.push(...wordIndexes(example, pair));
      }
      continue;
    }
    for (const order of reading.order ?? []) {
      if (query.over !== undefined && !(order.over && frameMatches(order.over, query.over))) continue;
      if (query.under !== undefined && !(order.under && frameMatches(order.under, query.under))) continue;
      matched = true;
      hits.push(...wordIndexes(example, [order.over, order.under]));
    }
  }
  return matched ? [...new Set(hits)] : null;
}

/** One example's scope order as strings: `over F raw@pos > under G raw@pos`, and `unordered A ~ B`. */
export type ScopeRecord = {
  file: string;
  line: number;
  index: number;
  text: string;
  pairs: string[];
  unordered: string[];
};

function frameLabel(frame: LooseFrame | undefined, positions: Map<unknown, number>): string {
  if (!frame) return "?";
  const name = frame.member ? `${frame.family}/${frame.member}` : `${frame.family ?? "?"}`;
  const word = wordOf(frame);
  const position = positions.get(word) ?? word?.at ?? -1;
  // A tone mark holds no word (tone-marks.md#showing-your-tone): its mark names it.
  return `${name} ${word?.raw ?? frame.values?.mark ?? "?"}@${position}`;
}

/** Scope strings of one example; a frame's position is its chunk in the stored span, else `word.at`. */
export function scopeStrings(example: Pick<Example, "words" | "allReadings">): { pairs: string[]; unordered: string[] } {
  const positions = new Map<unknown, number>();
  for (const item of example.words) if (item.position >= 0) positions.set(item.word, item.position);
  const pairs: string[] = [];
  const unordered: string[] = [];
  for (const reading of readingsOf(example)) {
    for (const order of reading.order ?? []) {
      pairs.push(`over ${frameLabel(order.over, positions)} > under ${frameLabel(order.under, positions)}`);
    }
    for (const pair of reading.unordered ?? []) {
      const labels = pair.map((frame) => frameLabel(frame, positions)).sort();
      unordered.push(`unordered ${labels.join(" ~ ")}`);
    }
  }
  return { pairs: [...new Set(pairs)].sort(), unordered: [...new Set(unordered)].sort() };
}

/** An example whose scope order differs between the two passes. */
export type ScopeDiff = {
  file: string;
  line: number;
  text: string;
  /** Pairs and unordered entries only at REV. */
  removed: string[];
  /** Pairs and unordered entries only now. */
  added: string[];
  /** The parser at REV did not parse the example. */
  missingAtRev?: true;
};

const recordKey = (record: Pick<ScopeRecord, "file" | "index" | "text">) => `${record.file}\0${record.index}\0${record.text}`;

/**
 * Compares the current pass's records (already filtered by the query flags) with the pass at REV.
 * An example the old parser missed counts as having no order there.
 */
export function diffScopeRecords(atRev: ScopeRecord[], now: ScopeRecord[]): ScopeDiff[] {
  const old = new Map(atRev.map((record) => [recordKey(record), record]));
  const out: ScopeDiff[] = [];
  for (const record of now) {
    const before = old.get(recordKey(record));
    const was = new Set([...(before?.pairs ?? []), ...(before?.unordered ?? [])]);
    const is = new Set([...record.pairs, ...record.unordered]);
    const removed = [...was].filter((entry) => !is.has(entry));
    const added = [...is].filter((entry) => !was.has(entry));
    if (!removed.length && !added.length) continue;
    out.push({
      file: record.file,
      line: record.line,
      text: record.text,
      removed,
      added,
      ...(before ? {} : { missingAtRev: true as const }),
    });
  }
  return out;
}

/** Text lines for one difference: `file:line  text`, then `-` and `+` lines. */
export function formatScopeDiff(diff: ScopeDiff): string[] {
  return [
    `${diff.file}:${diff.line}  ${diff.text}`,
    ...(diff.missingAtRev ? ["  ! does not parse at REV"] : []),
    ...diff.removed.map((entry) => `  - ${entry}`),
    ...diff.added.map((entry) => `  + ${entry}`),
  ];
}

/** The parser a scope pass runs: tables, the sentence parse and its reader, current or loaded from REV. */
export type ScopeParser = { tables: ClassifyTables } & FindParser;

/** True when a parse result carries a `resolve.scope`-shaped record (an array of clauses with `order`). */
export function hasScopeRecord(result: unknown): boolean {
  const scope = (result as { resolve?: { scope?: unknown } } | null)?.resolve?.scope;
  return Array.isArray(scope) && scope.every((entry) => Array.isArray((entry as { order?: unknown } | null)?.order));
}

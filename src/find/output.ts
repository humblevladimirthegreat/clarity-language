/**
 * Text output of a find listing: a count line, `FIND_SHOWN` items spread over the files,
 * and a footer naming `--all` when the list was cut. `--json` and `--count`
 * bypass this; `--values` and `--constructions` tallies print in full.
 */
import { basename } from "node:path";

/** Items a listing shows before the footer, unless `--all`. */
export const FIND_SHOWN = 10;

/** Per-file counts the count line names before `… N more files`. */
const FILES_NAMED = 5;

export type CappedListing<T> = {
  items: T[];
  /** One item's lines (a scope diff takes several). */
  render: (item: T) => string[];
  file: (item: T) => string;
  /** Singular and plural of what is counted: `["example", "examples"]`. */
  noun: [string, string];
  all: boolean;
};

function plural(n: number, [one, many]: [string, string]): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** `117 examples in 23 files: holder.md 40, knowing.md 22, … 18 more files`. */
export function countLine<T>(items: T[], file: (item: T) => string, noun: [string, string]): string {
  const byFile = new Map<string, number>();
  for (const item of items) byFile.set(file(item), (byFile.get(file(item)) ?? 0) + 1);
  const head = plural(items.length, noun);
  if (byFile.size === 0) return head;
  if (byFile.size === 1) return `${head} in ${basename([...byFile.keys()][0]!)}`;
  const rows = [...byFile].sort(([a, x], [b, y]) => y - x || a.localeCompare(b));
  const named = rows.slice(0, FILES_NAMED).map(([f, n]) => `${basename(f)} ${n}`);
  const rest = rows.length - named.length;
  return `${head} in ${rows.length} files: ${named.join(", ")}${rest ? `, … ${plural(rest, ["more file", "more files"])}` : ""}`;
}

/**
 * Up to `FIND_SHOWN` items spread over the files: each file's first item in turn, then each
 * file's second, and so on, kept in their original order.
 */
export function spreadSample<T>(items: T[], file: (item: T) => string): T[] {
  if (items.length <= FIND_SHOWN) return items;
  const queues = new Map<string, number[]>();
  items.forEach((item, i) => {
    const key = file(item);
    const queue = queues.get(key);
    if (queue) queue.push(i);
    else queues.set(key, [i]);
  });
  const picked: number[] = [];
  for (let round = 0; picked.length < FIND_SHOWN; round++) {
    for (const queue of queues.values()) {
      if (round < queue.length && picked.length < FIND_SHOWN) picked.push(queue[round]!);
    }
  }
  return picked.sort((a, b) => a - b).map((i) => items[i]!);
}

/** The count line, then every item with `all`, else a `spreadSample` and a footer. */
export function formatCapped<T>({ items, render, file, noun, all }: CappedListing<T>): string[] {
  const shown = all ? items : spreadSample(items, file);
  const lines = [countLine(items, file, noun), ...shown.flatMap(render)];
  const hidden = items.length - shown.length;
  if (hidden > 0) lines.push(`… ${hidden} more; --all lists every one, --count prints only the count`);
  return lines;
}

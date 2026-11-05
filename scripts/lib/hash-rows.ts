/**
 * Hash rows for H3s that changed pages (`a.md#x` → `b.md#x`), written into
 * docs/grammar/.vitepress/lib/hash-redirect.ts without chains.
 */
import type { HashRedirect } from "../../docs/grammar/.vitepress/lib/hash-redirect.js";

/** One id that left `from` and now lives at `into#toId`. */
export type HashMove = { from: string; id: string; into: string; toId: string };

/**
 * Rows after `moves`:
 * - a row on the same old fragment (`from#id`) is replaced, not duplicated;
 * - a row whose old fragment is a destination (`into#toId`) is dropped, since that id is live again;
 * - a row that lands on a moved id (`to: from`, `toHash: id`, or no `toHash` with `hash: id`) is repointed;
 * - one row per move is appended.
 */
export function applyHashMoves(
  rows: readonly HashRedirect[],
  moves: readonly HashMove[],
): { rows: HashRedirect[]; notes: string[] } {
  const notes: string[] = [];
  for (const m of moves) {
    if (m.from === m.into && m.id === m.toId) throw new Error(`${m.from}#${m.id} moves onto itself`);
  }
  const key = (page: string, hash: string) => `${page}#${hash}`;
  const replaced = new Set(moves.map((m) => key(m.from, m.id)));
  const live = new Set(moves.map((m) => key(m.into, m.toId)));
  const out: HashRedirect[] = [];
  for (const row of rows) {
    const k = key(row.page, row.hash);
    if (replaced.has(k)) {
      notes.push(`replace ${describe(row)}`);
      continue;
    }
    if (live.has(k)) {
      notes.push(`drop ${describe(row)} (that id is live again)`);
      continue;
    }
    const move = moves.find(
      (m) => row.to === m.from && (row.toHash === m.id || (row.toHash === undefined && row.hash === m.id)),
    );
    if (move) {
      const next: HashRedirect = { page: row.page, hash: row.hash, to: move.into, toHash: move.toId };
      notes.push(`repoint ${describe(row)} → ${describe(next)}`);
      out.push(next);
      continue;
    }
    out.push({ ...row });
  }
  for (const m of moves) {
    const row: HashRedirect = { page: m.from, hash: m.id, to: m.into, toHash: m.toId };
    notes.push(`add ${describe(row)}`);
    out.push(row);
  }
  return { rows: out, notes };
}

export function describe(row: HashRedirect): string {
  return `${row.page}#${row.hash} → ${row.to}${row.toHash ? `#${row.toHash}` : ""}`;
}

export function formatHashRow(row: HashRedirect): string {
  const toHash = row.toHash === undefined ? "" : `, toHash: ${JSON.stringify(row.toHash)}`;
  return `{ page: ${JSON.stringify(row.page)}, hash: ${JSON.stringify(row.hash)}, to: ${JSON.stringify(row.to)}${toHash} },`;
}

/** Replace the `hashRedirects` array body in hash-redirect.ts with `rows`, one per line. */
export function writeHashRedirects(source: string, rows: readonly HashRedirect[]): string {
  const marker = "export const hashRedirects";
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`missing ${marker}`);
  const open = source.indexOf("[", source.indexOf("=", start));
  const close = source.indexOf("\n]", open);
  if (open < 0 || close < 0) throw new Error("hashRedirects is not a one-row-per-line array");
  const body = rows.map((row) => `  ${formatHashRow(row)}`).join("\n");
  return `${source.slice(0, open + 1)}\n${body}${source.slice(close)}`;
}

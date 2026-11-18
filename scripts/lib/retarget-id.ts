/**
 * Retarget links to an id that left its page when an H3 split in place. Pure transform; the CLI
 * (scripts/retarget-id.ts) scans files and writes them.
 *
 * Works line by line with the same rewrites as link-rewrite.ts (`applyMaps`), so `--list` finds
 * exactly what `--write` changes. Each line's references go to one target: the default, or the
 * exception named for that `file:line`.
 */
import { applyMaps } from "./link-rewrite.ts";

export type Reference = {
  /** 1-based line. */
  line: number;
  /** References to `page#old` on this line. */
  count: number;
  /** Link texts on this line, when the reference is a Markdown link. */
  linkTexts: string[];
  /** About 80 characters around the first reference. */
  context: string;
};

/** Every line of `text` that refers to `page#oldId`; `file` is the absolute path. */
export function findReferences(text: string, file: string, page: string, oldId: string): Reference[] {
  const probe = new Map([[`${page}#${oldId}`, `${page}#${oldId}--probe`]]);
  const out: Reference[] = [];
  text.split("\n").forEach((lineText, i) => {
    const { changes } = applyMaps(lineText, file, probe);
    if (!changes.length) return;
    out.push({
      line: i + 1,
      count: changes.length,
      linkTexts: linkTexts(lineText, oldId),
      context: contextAround(lineText, oldId),
    });
  });
  return out;
}

/** Rewrite each reference to `page#oldId` to `page#targetFor(line)`. */
export function retargetText(
  text: string,
  file: string,
  page: string,
  oldId: string,
  targetFor: (line: number) => string,
): { text: string; edits: { line: number; count: number; to: string }[] } {
  const edits: { line: number; count: number; to: string }[] = [];
  const lines = text.split("\n").map((lineText, i) => {
    const to = targetFor(i + 1);
    const { text: next, changes } = applyMaps(lineText, file, new Map([[`${page}#${oldId}`, `${page}#${to}`]]));
    if (changes.length) edits.push({ line: i + 1, count: changes.length, to });
    return next;
  });
  return { text: lines.join("\n"), edits };
}

/** `file:line=id,file:line=id` → map keyed `file:line`. */
export function parseExceptions(value: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const part of value.split(",").map((s) => s.trim()).filter(Boolean)) {
    const m = /^(.+):(\d+)=#?([A-Za-z0-9_-]+)$/.exec(part);
    if (!m) throw new Error(`--except entry "${part}" is not file:line=id`);
    const key = `${m[1]!.replace(/^\.\//, "")}:${Number(m[2])}`;
    if (out.has(key)) throw new Error(`--except names ${key} twice`);
    out.set(key, m[3]!);
  }
  return out;
}

function linkTexts(line: string, oldId: string): string[] {
  const re = new RegExp(`\\[([^\\]]*)\\]\\([^)\\s]*#${escape(oldId)}\\)`, "g");
  return [...line.matchAll(re)].map((m) => m[1]!);
}

function contextAround(line: string, oldId: string): string {
  const at = Math.max(0, line.indexOf(`#${oldId}`));
  const start = Math.max(0, at - 40);
  const end = Math.min(line.length, at + oldId.length + 41);
  return `${start > 0 ? "…" : ""}${line.slice(start, end).trim()}${end < line.length ? "…" : ""}`;
}

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

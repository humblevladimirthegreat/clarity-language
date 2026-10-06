/**
 * A heading that spells Agazan (`### Ability (`egera`)`) gets a slug from that spelling, so a
 * retie renames its id. Links to the old id, on any page, and overlay `anchor` cells follow.
 */
import { dirname, resolve } from "node:path";

import { grammarHeadings } from "../lint/grammar-anchors.js";

/** Absolute page path → old id → new id. */
export type AnchorRenames = Map<string, Map<string, string>>;

/** Heading ids that changed between two versions of one page (pinned `{#id}` ids never change). */
export function headingIdRenames(before: string, after: string): Map<string, string> {
  const renames = new Map<string, string>();
  const a = grammarHeadings(before);
  const b = grammarHeadings(after);
  if (a.length !== b.length) return renames;
  a.forEach((heading, i) => {
    const next = b[i]!;
    if (!heading.custom && !next.custom && heading.id !== next.id) renames.set(heading.id, next.id);
  });
  return renames;
}

/** Rewrite Markdown links `](page.md#old)` / `](#old)` in the page at `file`. */
export function relinkMarkdown(
  text: string,
  file: string,
  renames: AnchorRenames,
): { text: string; changes: { from: string; to: string; index: number }[] } {
  const changes: { from: string; to: string; index: number }[] = [];
  const out = text.replace(/\]\(([^)#\s]*)#([^)\s]+)\)/g, (whole, target: string, id: string, offset: number) => {
    const page = target === "" ? file : resolve(dirname(file), target);
    const next = renames.get(page)?.get(id);
    if (next === undefined) return whole;
    changes.push({ from: `${target}#${id}`, to: `${target}#${next}`, index: offset });
    return `](${target}#${next})`;
  });
  return { text: out, changes };
}

/**
 * Anchor cells (`page.md#id`, relative to `grammarDir`) in a lexicon CSV text: overlay `anchor`,
 * published / compound `core`.
 */
export function relinkOverlayAnchors(
  csv: string,
  grammarDir: string,
  renames: AnchorRenames,
): { text: string; changes: { from: string; to: string }[] } {
  const changes: { from: string; to: string }[] = [];
  const text = csv.replace(/(?<=^|,|")([\w./-]+\.md)#([^,"\s]+)(?=$|,|")/gm, (whole, page: string, id: string) => {
    const next = renames.get(resolve(grammarDir, page))?.get(id);
    if (next === undefined) return whole;
    changes.push({ from: whole, to: `${page}#${next}` });
    return `${page}#${next}`;
  });
  return { text, changes };
}

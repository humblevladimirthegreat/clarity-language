/**
 * Anchor ids a grammar page publishes: explicit `<a id="…">` plus VitePress
 * heading slugs (default mdit-vue `slugify`, or a `{#custom}` heading id).
 */
const rControl = /[\u0000-\u001f]/g;
const rSpecial = /[\s~`!@#$%^&*()\-_+=[\]{}|\;:"'“”‘’<>,.?/]+/g;
const rCombining = /[̀-ͯ]/g;

/** VitePress / mdit-vue default heading slug. */
export function headingSlug(text: string): string {
  return text
    .normalize("NFKD")
    .replace(rCombining, "")
    .replace(rControl, "")
    .replace(rSpecial, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/^(\d)/, "_$1")
    .toLowerCase();
}

/** Heading text as rendered (markdown emphasis, code ticks, and links stripped). */
export function headingText(raw: string): string {
  return raw
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*]/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export type Heading = {
  level: number;
  title: string;
  /** Published id: `{#custom}`, or the slug with VitePress's `-1` / `-2` suffix on repeats. */
  id: string;
  custom: boolean;
  /** Offset of the heading line. */
  offset: number;
  /** 0-based line number. */
  line: number;
};

/** Headings outside fences, with the ids VitePress publishes (markdown-it-anchor `uniqueSlug`). */
export function grammarHeadings(markdown: string): Heading[] {
  const out: Heading[] = [];
  const used = new Set<string>();
  let inFence = false;
  let offset = 0;
  markdown.split("\n").forEach((text, line) => {
    const lineOffset = offset;
    offset += text.length + 1;
    if (/^\s*```/.test(text)) inFence = !inFence;
    if (inFence) return;
    const heading = /^(#{1,6})\s+(.*)$/.exec(text);
    if (!heading) return;
    const custom = /\{#([^}]+)\}\s*$/.exec(heading[2]!);
    const title = headingText(heading[2]!.replace(/\s*\{#[^}]+\}\s*$/, ""));
    let id = custom ? custom[1]! : headingSlug(title);
    if (!custom) for (let i = 1, base = id; used.has(id); i += 1) id = `${base}-${i}`;
    used.add(id);
    out.push({ level: heading[1]!.length, title, id, custom: Boolean(custom), offset: lineOffset, line });
  });
  return out;
}

/** Explicit `<a id="…">` anchors with their offsets. */
export function anchorTags(markdown: string): { id: string; offset: number }[] {
  return [...markdown.matchAll(/<a\s+id="([^"]+)"/g)].map((m) => ({ id: m[1]!, offset: m.index! }));
}

/** Ids published more than once on a page (headings and `<a id>` share one namespace). */
export function duplicateIds(markdown: string): string[] {
  const counts = new Map<string, number>();
  for (const h of grammarHeadings(markdown)) counts.set(h.id, (counts.get(h.id) ?? 0) + 1);
  for (const a of anchorTags(markdown)) counts.set(a.id, (counts.get(a.id) ?? 0) + 1);
  return [...counts].filter(([, n]) => n > 1).map(([id]) => id);
}

export function grammarAnchors(markdown: string): Set<string> {
  return new Set([...grammarHeadings(markdown).map((h) => h.id), ...anchorTags(markdown).map((a) => a.id)]);
}

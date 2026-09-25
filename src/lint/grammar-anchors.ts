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
function headingText(raw: string): string {
  return raw
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*]/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export function grammarAnchors(markdown: string): Set<string> {
  const ids = new Set<string>();
  for (const m of markdown.matchAll(/<a\s+id="([^"]+)"/g)) ids.add(m[1]!);
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    if (!heading) continue;
    const custom = /\{#([^}]+)\}\s*$/.exec(heading[1]!);
    ids.add(custom ? custom[1]! : headingSlug(headingText(heading[1]!)));
  }
  return ids;
}

/**
 * Fails on a Markdown link `](page#id)` whose target page publishes no such id.
 *
 * Scans docs/ (proposals left out), AGENTS.md, TODO.md and README.md, outside fenced code and
 * inline code spans. Grammar links resolve the way the site does (`resolveLinkPage`); other `.md`
 * targets resolve by path. A page's ids are its headings plus `<a id>` tags (grammar-anchors.ts);
 * a retired grammar id with a `hash-redirect.ts` row passes. Pages outside docs/grammar render on
 * GitHub, so their headings' GitHub slugs count too.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { hashRedirects } from "../docs/grammar/.vitepress/lib/hash-redirect.ts";
import { anchorTags, grammarHeadings } from "../src/lint/grammar-anchors.ts";
import { GRAMMAR_DIR, REPO_ROOT } from "../src/repo-paths.ts";
import { pageKeyFile, pageKeyOf, resolveLinkPage } from "./lib/link-rewrite.ts";

const ROOT_FILES = ["AGENTS.md", "TODO.md", "README.md"];
const SKIP_DIRS = new Set(["node_modules", "proposals", "public", "dist", "cache", ".vitepress"]);
const EXTERNAL = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

export type AnchorLink = { line: number; href: string; id: string };
export type DeadAnchor = { file: string; line: number; target: string; id: string };

/** Markdown with fenced code and inline code spans blanked out, offsets and newlines kept. */
export function blankCode(markdown: string): string {
  const blank = (m: string) => m.replace(/[^\n]/g, " ");
  const lines = markdown.split("\n");
  let fence: string | undefined;
  const out = lines.map((text) => {
    const open = /^\s*(`{3,}|~{3,})/.exec(text);
    if (fence) {
      if (open && open[1]!.startsWith(fence)) fence = undefined;
      return blank(text);
    }
    if (open) {
      fence = open[1]!;
      return blank(text);
    }
    return text;
  });
  return out.join("\n").replace(/(`+)(?!`)[\s\S]*?(?<!`)\1(?!`)/g, blank);
}

/** Links with a `#` fragment, outside code. `href` is the part before `#` (empty for `#id`). */
export function anchorLinks(markdown: string): AnchorLink[] {
  const text = blankCode(markdown);
  const out: AnchorLink[] = [];
  for (const m of text.matchAll(/\]\(<?([^)\s#>]*)#([^)\s>]+)>?(?:\s+"[^"]*")?\)/g)) {
    const line = text.slice(0, m.index).split("\n").length;
    out.push({ line, href: m[1]!, id: decodeURIComponent(m[2]!) });
  }
  return out;
}

/** GitHub's heading slug (github-slugger): lowercase, punctuation dropped, each space a hyphen. */
export function githubSlug(title: string): string {
  return title.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, "").replace(/ /g, "-");
}

/**
 * Ids a page publishes: heading ids and `<a id>` tags. A page outside docs/grammar renders on
 * GitHub, so it also publishes each heading's GitHub slug (a repeat gets `-1`, `-2`, …); its
 * `{#custom}` ids stay accepted, since the docs use them as stable link targets.
 */
export function pageIds(markdown: string, github = false): Set<string> {
  const ids = new Set(anchorTags(markdown).map((a) => a.id));
  const seen = new Map<string, number>();
  for (const h of grammarHeadings(markdown)) {
    ids.add(h.id);
    if (!github) continue;
    const slug = githubSlug(h.title);
    const n = seen.get(slug) ?? 0;
    seen.set(slug, n + 1);
    ids.add(n ? `${slug}-${n}` : slug);
  }
  return ids;
}

/** The absolute file a link in `file` points at, or `undefined` for an external or non-page target. */
export function linkTargetFile(file: string, href: string): string | undefined {
  if (EXTERNAL.test(href)) return;
  if (href === "") return file;
  const path = href.split("?")[0]!;
  if (path.startsWith("/")) {
    if (!isGrammar(file)) return;
    const key = resolveLinkPage(file, path);
    return key ? pageKeyFile(key) : undefined;
  }
  const abs = resolve(dirname(file), path);
  if (isGrammar(abs)) {
    if (/\.\w+$/.test(path) && !/\.(?:md|html)$/.test(path)) return;
    const key = isGrammar(file) ? resolveLinkPage(file, path) : pageKeyOf(abs.replace(/(?:\.md|\.html)?$/, ".md"));
    return key ? pageKeyFile(key) : undefined;
  }
  return abs.endsWith(".md") ? abs : undefined;
}

function isGrammar(file: string): boolean {
  return file.startsWith(`${GRAMMAR_DIR}${sep}`);
}

/** Whether a `hash-redirect.ts` row covers `id` on the grammar page `file`. */
function redirected(file: string, id: string): boolean {
  if (!isGrammar(file)) return false;
  const key = pageKeyOf(file);
  return hashRedirects.some((row) => row.page === key && row.hash === id);
}

/** Dead anchors in the given files; `read` loads a file once (cached). */
export function deadAnchors(files: readonly string[], read: (file: string) => string | undefined): DeadAnchor[] {
  const ids = new Map<string, Set<string> | undefined>();
  const idsOf = (file: string) => {
    if (!ids.has(file)) {
      const text = read(file);
      ids.set(file, text === undefined ? undefined : pageIds(text, !isGrammar(file)));
    }
    return ids.get(file);
  };
  const out: DeadAnchor[] = [];
  for (const file of files) {
    const text = read(file);
    if (text === undefined) continue;
    for (const link of anchorLinks(text)) {
      const target = linkTargetFile(file, link.href);
      if (!target) continue;
      const published = idsOf(target);
      if (!published || published.has(link.id) || redirected(target, link.id)) continue;
      out.push({ file, line: link.line, target, id: link.id });
    }
  }
  return out;
}

function markdownFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (!SKIP_DIRS.has(name) && !name.startsWith(".")) markdownFiles(full, out);
    } else if (name.endsWith(".md")) out.push(full);
  }
  return out;
}

function main(): void {
  const files = [
    ...ROOT_FILES.map((name) => join(REPO_ROOT, name)).filter((file) => existsSync(file)),
    ...markdownFiles(join(REPO_ROOT, "docs")),
  ];
  const cache = new Map<string, string | undefined>();
  const read = (file: string) => {
    if (!cache.has(file)) cache.set(file, existsSync(file) ? readFileSync(file, "utf8") : undefined);
    return cache.get(file);
  };
  const dead = deadAnchors(files, read);
  if (!dead.length) {
    console.log(`OK: every anchored link in ${files.length} files resolves.`);
    return;
  }
  console.error(`Dead anchors (${dead.length}):`);
  for (const d of dead) console.error(`  ${relative(REPO_ROOT, d.file)}:${d.line} → ${relative(REPO_ROOT, d.target)}#${d.id}`);
  console.error(
    "Fix: point each link at the id that now holds its content (`npm run page-refs -- PAGE` helps find it), or add a hash-redirect.ts row when a grammar id moved.",
  );
  process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

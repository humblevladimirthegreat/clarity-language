#!/usr/bin/env node
/**
 * Fail if Markdown will break Cursor's inline rich editor (TipTap / ProseMirror).
 *
 * Primary check: parse each file with TipTap's Markdown extension (same stack
 * family as Cursor) and walk the resulting JSON for duplicate marks on a
 * single text node — e.g. marks: ["italic","italic"]. That is exactly the
 * RangeError Cursor throws:
 *   Invalid collection of marks for node text: italic,italic
 *
 * Secondary (cheap, no TipTap): slash-joined emphasis with no spaces
 * (e.g. *a* + "/" + *b* with no spaces), which historically produced the
 * same class of error.
 *
 * Tertiary: broken internal links — relative paths and `#` fragments on
 * `.md` targets (explicit `<a id>` or GFM heading slugs). Skips http(s),
 * mailto, and tel.
 *
 * Note: TipTap's default schema also rejects bold+code (`**`foo`**`). Cursor
 * accepts that pattern (other docs render fine), so we do NOT treat bold+code
 * as a failure — only duplicate same-type marks.
 *
 * Usage: node scripts/lint-md-balance.mjs [paths...]
 * Default: docs/, AGENTS.md, TODO.md, README.md (if present)
 */
import { readdir, readFile, access, stat } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Window } from "happy-dom";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));

/** Emph spans joined by "/" with no spaces (ProseMirror italic,italic / bold,bold). */
const SLASH_JOINED_EMPHASIS =
  /(?:\*\*[^*\n]+?\*\*|\*[^*\n]+?\*)(?:\/(?:\*\*[^*\n]+?\*\*|\*[^*\n]+?\*))+/g;

/** Inline `[…](url)` and `![…](url)` outside fenced code. */
const INLINE_LINK_RE = /(!?)\[([^\]]*)\]\(([^)]+)\)/g;

/** Skip external URL schemes. */
const EXTERNAL_SCHEME_RE = /^(?:https?:|mailto:|tel:)/i;

function installDom() {
  const window = new Window({ url: "https://example.local/" });
  Object.defineProperty(globalThis, "window", {
    value: window,
    configurable: true,
  });
  Object.defineProperty(globalThis, "document", {
    value: window.document,
    configurable: true,
  });
  for (const key of [
    "Node",
    "Element",
    "HTMLElement",
    "DocumentFragment",
    "MutationObserver",
  ]) {
    Object.defineProperty(globalThis, key, {
      value: window[key],
      configurable: true,
    });
  }
  Object.defineProperty(globalThis, "getComputedStyle", {
    value: window.getComputedStyle.bind(window),
    configurable: true,
  });
  globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function collectMdFiles(entry, out = []) {
  const path = resolve(ROOT, entry);
  if (!(await exists(path))) return out;
  const st = await stat(path);
  if (st.isFile()) {
    if (path.endsWith(".md")) out.push(path);
    return out;
  }
  for (const name of await readdir(path)) {
    if (name === "node_modules" || name === ".git" || name === "dist") continue;
    await collectMdFiles(join(path, name), out);
  }
  return out;
}

/** Blank out protected spans so * inside them are ignored. */
function stripProtected(line) {
  let s = line;
  s = s.replace(/`[^`]*`/g, (m) => " ".repeat(m.length));
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, (m) => " ".repeat(m.length));
  s = s.replace(/\]\([^)]*\)/g, (m) => " ".repeat(m.length));
  s = s.replace(/\]\[[^\]]*\]/g, (m) => " ".repeat(m.length));
  s = s.replace(/<[^>]+>/g, (m) => " ".repeat(m.length));
  s = s.replace(/\\[*_]/g, "  ");
  return s;
}

/**
 * Walk TipTap JSON for text nodes whose mark list repeats a type
 * (italic,italic / bold,bold) — illegal in ProseMirror and what Cursor throws.
 * @returns {{ text: string, marks: string[] }[]}
 */
function findDuplicateMarks(node, out = []) {
  if (node?.type === "text" && Array.isArray(node.marks) && node.marks.length) {
    const names = node.marks.map((m) => m.type);
    const counts = Object.create(null);
    for (const n of names) counts[n] = (counts[n] || 0) + 1;
    if (Object.values(counts).some((c) => c > 1)) {
      out.push({ text: node.text ?? "", marks: names });
    }
  }
  for (const child of node?.content ?? []) findDuplicateMarks(child, out);
  return out;
}

/** Secondary: tight emph spans joined by "/" with no spaces around the slash. */
function findSlashJoined(text) {
  /** @type {{ line: number, col: number, match: string }[]} */
  const hits = [];
  const lines = text.split(/\r?\n/);
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const s = stripProtected(line);
    for (const m of s.matchAll(SLASH_JOINED_EMPHASIS)) {
      hits.push({
        line: i + 1,
        col: (m.index ?? 0) + 1,
        match: m[0],
      });
    }
  }
  return hits;
}

/** GFM-style heading slug (lowercase, strip markup, spaces → hyphens). */
function githubSlug(heading) {
  let s = heading
    .replace(/^#{1,6}\s+/, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_~]+/g, "")
    .trim()
    .toLowerCase();
  s = s.replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-");
  return s;
}

/** Collect explicit ids and heading slugs from a Markdown file. */
function collectAnchors(text) {
  const ids = new Set();
  for (const m of text.matchAll(/<a\s+[^>]*\bid=["']([^"']+)["'][^>]*>/gi)) {
    ids.add(m[1]);
  }
  for (const m of text.matchAll(/<a\s+[^>]*\bname=["']([^"']+)["'][^>]*>/gi)) {
    ids.add(m[1]);
  }
  const lines = text.split(/\r?\n/);
  let inFence = false;
  const slugCounts = Object.create(null);
  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const hm = /^(#{1,6})\s+(.+)$/.exec(line);
    if (!hm) continue;
    const base = githubSlug(hm[2]);
    if (!base) continue;
    const n = (slugCounts[base] = (slugCounts[base] || 0) + 1);
    ids.add(n === 1 ? base : `${base}-${n - 1}`);
  }
  return ids;
}

/** Parse `[…](url)` target; returns null when unparseable. */
function parseLinkTarget(raw) {
  const trimmed = raw.trim();
  const angle = /^<([^>]+)>$/.exec(trimmed);
  const url = angle ? angle[1] : trimmed.split(/\s+/)[0];
  return url;
}

/**
 * Find broken internal links in one file.
 * @returns {Promise<{ line: number, col: number, url: string, reason: string }[]>}
 */
async function findBrokenLinks(file, anchorCache) {
  /** @type {{ line: number, col: number, url: string, reason: string }[]} */
  const hits = [];
  const text = await readFile(file, "utf8");
  const lines = text.split(/\r?\n/);
  let inFence = false;

  async function anchorsFor(targetFile) {
    if (!anchorCache.has(targetFile)) {
      const t = await readFile(targetFile, "utf8");
      anchorCache.set(targetFile, collectAnchors(t));
    }
    return anchorCache.get(targetFile);
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    for (const m of line.matchAll(INLINE_LINK_RE)) {
      const url = parseLinkTarget(m[3]);
      if (!url || EXTERNAL_SCHEME_RE.test(url) || url.startsWith("//")) continue;

      const hashIdx = url.indexOf("#");
      const pathPart = hashIdx === -1 ? url : url.slice(0, hashIdx);
      let frag = "";
      if (hashIdx !== -1) {
        try {
          frag = decodeURIComponent(url.slice(hashIdx + 1));
        } catch {
          hits.push({
            line: i + 1,
            col: (m.index ?? 0) + 1,
            url,
            reason: "invalid fragment encoding",
          });
          continue;
        }
      }

      let targetFile = file;
      if (pathPart) {
        const target = resolve(dirname(file), pathPart);
        const targetRel = relative(ROOT, target).replaceAll("\\", "/");
        if (
          targetRel === "docs/proposals" ||
          targetRel.startsWith("docs/proposals/")
        ) {
          hits.push({
            line: i + 1,
            col: (m.index ?? 0) + 1,
            url,
            reason:
              "do not link to proposal pages (see docs/meta/proposals.md)",
          });
          continue;
        }
        if (!(await exists(target))) {
          hits.push({
            line: i + 1,
            col: (m.index ?? 0) + 1,
            url,
            reason: "target not found",
          });
          continue;
        }
        const st = await stat(target);
        if (st.isDirectory()) {
          if (frag) {
            hits.push({
              line: i + 1,
              col: (m.index ?? 0) + 1,
              url,
              reason: "fragment on directory link",
            });
          }
          continue;
        }
        if (frag && !target.endsWith(".md")) {
          hits.push({
            line: i + 1,
            col: (m.index ?? 0) + 1,
            url,
            reason: "fragment on non-markdown target",
          });
          continue;
        }
        targetFile = target;
      }

      if (frag) {
        const ids = await anchorsFor(targetFile);
        if (!ids.has(frag)) {
          hits.push({
            line: i + 1,
            col: (m.index ?? 0) + 1,
            url,
            reason: `missing fragment #${frag}`,
          });
        }
      }
    }
  }
  return hits;
}

async function main() {
  installDom();

  const args = process.argv.slice(2);
  const entries =
    args.length > 0 ? args : ["docs", "AGENTS.md", "TODO.md", "README.md"];

  const files = [];
  for (const e of entries) {
    await collectMdFiles(e, files);
  }
  files.sort();

  if (files.length === 0) {
    console.error("lint-md-balance: no .md files found");
    process.exit(2);
  }

  const mount = document.createElement("div");
  document.body.appendChild(mount);
  const editor = new Editor({
    element: mount,
    extensions: [StarterKit, Markdown],
    content: "",
    contentType: "markdown",
  });

  const anchorCache = new Map();
  let failed = 0;
  try {
    for (const file of files) {
      const rel = relative(ROOT, file);
      const text = await readFile(file, "utf8");

      editor.commands.setContent(text, { contentType: "markdown" });
      const dups = findDuplicateMarks(editor.getJSON());
      for (const hit of dups) {
        failed += 1;
        console.error(
          `${rel}: TipTap parse produced duplicate marks [${hit.marks.join(",")}] on ${JSON.stringify(hit.text)} — Cursor rich preview throws RangeError: Invalid collection of marks for node text`,
        );
      }

      for (const hit of findSlashJoined(text)) {
        failed += 1;
        console.error(
          `${rel}:${hit.line}:${hit.col}: slash-joined emphasis ${JSON.stringify(hit.match)} — use spaces (*a* / *b*) or one span (*a/b*); Cursor rich preview rejects duplicate italic/bold marks`,
        );
      }

      for (const hit of await findBrokenLinks(file, anchorCache)) {
        failed += 1;
        console.error(
          `${rel}:${hit.line}:${hit.col}: broken link ${JSON.stringify(hit.url)} — ${hit.reason}`,
        );
      }
    }
  } finally {
    editor.destroy();
  }

  if (failed > 0) {
    console.error(
      `\nlint-md-balance: ${failed} problem(s) in ${files.length} file(s)`,
    );
    process.exit(1);
  }
  console.log(`lint-md-balance: ok (${files.length} file(s))`);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});

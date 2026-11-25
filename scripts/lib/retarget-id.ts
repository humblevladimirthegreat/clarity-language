/**
 * Retarget links to an id that left its page: an H3 split in place, or an anchor moved to another
 * page. Pure transform; the CLI (scripts/retarget-id.ts) scans files and writes them.
 *
 * Works line by line with the same rewrites as link-rewrite.ts (`applyMaps`), so `--list` finds
 * exactly what `--write` changes. Each line's references go to one target: the default, or the
 * exception named for that `file:line`. A target is an id on the same page or `page.md#id` on
 * another; on the target page itself a retargeted link becomes a same-page `](#id)`.
 */
import { sep } from "node:path";

import { REPO_ROOT } from "../../src/repo-paths.js";
import { applyMaps, pageKeyArg, pageKeyOf, resolveLinkPage } from "./link-rewrite.ts";

/** Where references go: a page key and an id on it. */
export type Target = { page: string; id: string };

const ID = /^[A-Za-z0-9_-]+$/;

/** `id`, `#id`, or `page.md#id` (also `page#id`, `/page#id`, `beginner/page.md#id`); a bare id is on `samePage`. */
export function parseTarget(value: string, samePage: string): Target {
  const hash = value.lastIndexOf("#");
  const pagePart = hash < 0 ? "" : value.slice(0, hash);
  const id = hash < 0 ? value : value.slice(hash + 1);
  if (!ID.test(id)) throw new Error(`target "${value}" is not id or page.md#id`);
  return { page: pagePart ? pageKeyArg(pagePart) : samePage, id };
}

/** `#id` on the same page, else `page.md#id`. */
export function targetLabel(target: Target, page: string): string {
  return target.page === page ? `#${target.id}` : `${target.page}#${target.id}`;
}

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

export type Edit = { line: number; count: number; to: Target };

/**
 * Rewrite each reference to `page#oldId` to `targetFor(line)`: a bare id stays on `page`, a
 * `Target` may name another page.
 */
export function retargetText(
  text: string,
  file: string,
  page: string,
  oldId: string,
  targetFor: (line: number) => string | Target,
): { text: string; edits: Edit[] } {
  const edits: Edit[] = [];
  const here = file.endsWith(".md") ? pageKeyOf(file) : undefined;
  const lines = text.split("\n").map((lineText, i) => {
    const target = targetFor(i + 1);
    const to = typeof target === "string" ? { page, id: target } : target;
    const map = new Map([[`${page}#${oldId}`, `${to.page}#${to.id}`]]);
    const { text: next, changes } = applyMaps(lineText, file, map);
    if (!changes.length) return next;
    edits.push({ line: i + 1, count: changes.length, to });
    return to.page === here && to.page !== page ? samePageLinks(next, file, to) : next;
  });
  return { text: lines.join("\n"), edits };
}

/** On the target page, `](page.md#id)` to the target becomes `](#id)`. */
function samePageLinks(line: string, file: string, to: Target): string {
  return line.replace(/\]\(([^)\s#]+)#([^)\s]+)\)/g, (whole, href: string, id: string) =>
    id === to.id && resolveLinkPage(file, href) === to.page ? `](#${id})` : whole,
  );
}

export type PageReference = {
  /** 1-based line. */
  line: number;
  /** The id the reference points at; `undefined` for the page itself. */
  id: string | undefined;
  /** Link text, when the reference is a Markdown link. */
  linkText: string | undefined;
  /** About 80 characters around the reference. */
  context: string;
};

const PROPOSALS = `${REPO_ROOT}${sep}docs${sep}proposals${sep}`;

/**
 * Every reference in `text` to page key `page` (`feelings.md`, `claritish/feelings.md`), anchored
 * or not, by the scan of link-rewrite.ts: Markdown links in `.md` files resolve from `file`; bare
 * `a.md` / `a.md#id` refs key by their folder, and are skipped in proposals.
 */
export function findPageReferences(text: string, file: string, page: string): PageReference[] {
  const markdown = file.endsWith(".md");
  const bare = !file.startsWith(PROPOSALS);
  const out: PageReference[] = [];
  text.split("\n").forEach((lineText, i) => {
    const found: { at: number; ref: PageReference }[] = [];
    const add = (at: number, length: number, id: string | undefined, linkText: string | undefined) =>
      found.push({ at, ref: { line: i + 1, id, linkText, context: contextAt(lineText, at, length) } });
    if (markdown) {
      for (const m of lineText.matchAll(/\[([^\]]*)\]\(([^)\s]*)\)/g)) {
        const href = m[2]!;
        if (resolveLinkPage(file, href) !== page) continue;
        const hash = href.indexOf("#");
        add(m.index!, m[0].length, hash < 0 ? undefined : href.slice(hash + 1), m[1]!);
      }
    }
    if (bare) {
      const re = /(\]\()?((?:[\w.-]+\/)*)([\w.-]+\.md)(?:#([A-Za-z0-9_-]+))?(?![\w-])/g;
      for (const m of lineText.matchAll(re)) {
        if (m[1] && markdown) continue;
        const before = lineText[m.index! - 1];
        if (!m[1] && before && /[\w/.-]/.test(before)) continue;
        const folder = m[2]!.split("/").filter((part) => part && part !== ".").at(-1);
        const key = folder === "claritish" || folder === "cheat-sheets" ? `${folder}/${m[3]}` : m[3]!;
        if (key === page) add(m.index!, m[0].length, m[4], undefined);
      }
    }
    out.push(...found.sort((x, y) => x.at - y.at).map((f) => f.ref));
  });
  return out;
}

/** `file:line=id,file:line=page.md#id` → target map keyed `file:line`; a bare id is on `samePage`. */
export function parseExceptions(value: string, samePage: string): Map<string, Target> {
  const out = new Map<string, Target>();
  for (const part of value.split(",").map((s) => s.trim()).filter(Boolean)) {
    const m = /^(.+):(\d+)=((?:[\w./-]+)?#?[A-Za-z0-9_-]+)$/.exec(part);
    if (!m) throw new Error(`--except entry "${part}" is not file:line=id or file:line=page.md#id`);
    const key = `${m[1]!.replace(/^\.\//, "")}:${Number(m[2])}`;
    if (out.has(key)) throw new Error(`--except names ${key} twice`);
    out.set(key, parseTarget(m[3]!, samePage));
  }
  return out;
}

function contextAt(line: string, at: number, length: number): string {
  const start = Math.max(0, at - 30);
  const end = Math.min(line.length, at + length + 30);
  return `${start > 0 ? "…" : ""}${line.slice(start, end).trim()}${end < line.length ? "…" : ""}`;
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

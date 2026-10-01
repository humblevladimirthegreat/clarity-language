/**
 * Writing rules that keep a lexicon retie from chasing a second copy of a spelling.
 * Grammar pages: [retie-safe writing](../../docs/meta/grammar-docs.md#retie-safe-writing).
 */
import { grammarHeadings } from "./grammar-anchors.js";
import { ENGLISH_IN_CODE } from "./agazan-docs.js";
import { contentStemRoots } from "../retie/resume.js";
import { hasClosedOverlay, type ClassifyTables } from "../parse/classify.js";
import { letterPrefix } from "../parse/resolve.js";
import { parseWord } from "../parse/word.js";

export type RetieFormatFinding = {
  index: number;
  detail: string;
};

const SENSE_FORMS = new WeakMap<ClassifyTables, Set<string>>();

function senseForms(tables: ClassifyTables): Set<string> {
  let forms = SENSE_FORMS.get(tables);
  if (!forms) {
    forms = new Set([...tables.overlays.values()].map((row) => row.senseForm));
    SENSE_FORMS.set(tables, forms);
  }
  return forms;
}

/** A backtick form whose spelling moves when the lexicon does. Closed letters and hooks do not. */
export function retieableSpelling(core: string, tables: ClassifyTables): boolean {
  if (ENGLISH_IN_CODE.has(core)) return false;
  if (tables.published.has(core) || tables.compounds.has(core) || senseForms(tables).has(core)) return true;
  try {
    const word = parseWord(core);
    if (hasClosedOverlay(word, tables)) return true;
    return contentStemRoots(word).some((root) => tables.published.has(root) || tables.compounds.has(root));
  } catch {
    return false;
  }
}

function lineAt(markdown: string, offset: number): string {
  const end = markdown.indexOf("\n", offset);
  return markdown.slice(offset, end === -1 ? undefined : end);
}

function coresInBackticks(text: string): string[] {
  const cores: string[] = [];
  for (const match of text.matchAll(/`([^`]+)`/g)) {
    for (const core of match[1]!.split(/[^a-z]+/)) {
      if (core) cores.push(core);
    }
  }
  return cores;
}

/** Published content roots named in backtick spans, in order. Resumes are skipped. */
export function contentRootsIn(text: string, tables: ClassifyTables): string[] {
  const roots: string[] = [];
  for (const core of coresInBackticks(text)) {
    if (tables.published.has(core)) {
      roots.push(core);
      continue;
    }
    try {
      const word = parseWord(core);
      if (word.ending === "r" && word.family.kind === "content" && !hasClosedOverlay(word, tables)) continue;
      for (const root of contentStemRoots(word)) {
        if (tables.published.has(root)) roots.push(root);
      }
    } catch {
      // not a word
    }
  }
  return roots;
}

function prefixGroups(roots: readonly string[]): Map<string, number[]> {
  const groups = new Map<string, number[]>();
  roots.forEach((root, index) => {
    const prefix = letterPrefix(root);
    const list = groups.get(prefix) ?? [];
    list.push(index);
    groups.set(prefix, list);
  });
  return groups;
}

/** Two different published roots in `roots` share a short cut (through the 2nd vowel). */
export function sharesShortCut(roots: readonly string[]): boolean {
  for (const indices of prefixGroups(roots).values()) {
    const distinct = new Set(indices.map((index) => roots[index]!));
    if (distinct.size >= 2) return true;
  }
  return false;
}

/**
 * Roots that shared a short cut before a retie no longer share one after it.
 * Pairing is by order of the backtick roots in the marked region.
 */
export function shortCutLost(before: readonly string[], after: readonly string[]): boolean {
  if (before.length !== after.length) return sharesShortCut(before);
  for (const indices of prefixGroups(before).values()) {
    const distinct = new Set(indices.map((index) => before[index]!));
    if (distinct.size < 2) continue;
    const afterCuts = new Set(indices.map((index) => letterPrefix(after[index]!)));
    if (afterCuts.size !== 1) return true;
  }
  return false;
}

const SHARED_PREFIX_RE = /<!--\s*retie:\s*shared-prefix\s*-->/g;
const RETIE_SKIP_RE = /<!--\s*retie:\s*skip\s*-->/;

/** From the comment through the following blockquote, or null when that example is missing. */
function regionThroughBlockquote(markdown: string, commentEnd: number): string | null {
  const rest = markdown.slice(commentEnd);
  const lines = rest.split("\n");
  let offset = 0;
  let started = false;
  let end = 0;
  for (const line of lines) {
    const quote = /^\s*>/.test(line);
    if (!started) {
      offset += line.length + 1;
      if (quote) {
        started = true;
        end = offset;
      }
      continue;
    }
    if (quote || line.trim() === "") {
      offset += line.length + 1;
      if (quote) end = offset;
      continue;
    }
    break;
  }
  return started ? rest.slice(0, end) : null;
}

function headingFindings(markdown: string, tables: ClassifyTables): RetieFormatFinding[] {
  const out: RetieFormatFinding[] = [];
  for (const heading of grammarHeadings(markdown)) {
    if (heading.custom) continue;
    const line = lineAt(markdown, heading.offset);
    const token = coresInBackticks(line).find((core) => retieableSpelling(core, tables));
    if (!token) continue;
    out.push({
      index: heading.offset,
      detail: `heading id \`${heading.id}\` is spelled from \`${token}\`; pin an English {#id}`,
    });
  }
  return out;
}

function sharedPrefixFindings(markdown: string, tables: ClassifyTables): RetieFormatFinding[] {
  const out: RetieFormatFinding[] = [];
  for (const match of markdown.matchAll(SHARED_PREFIX_RE)) {
    const region = regionThroughBlockquote(markdown, match.index! + match[0].length);
    if (region === null || !sharesShortCut(contentRootsIn(region, tables))) {
      out.push({
        index: match.index!,
        detail:
          region === null
            ? "<!-- retie: shared-prefix --> needs the example blockquote that follows"
            : "<!-- retie: shared-prefix --> marks a spot where two roots do not share a short cut",
      });
    }
  }
  return out;
}

export function lintRetieFormat(markdown: string, tables: ClassifyTables): RetieFormatFinding[] {
  const out: RetieFormatFinding[] = [];
  const skip = RETIE_SKIP_RE.exec(markdown);
  if (skip) {
    out.push({
      index: skip.index,
      detail: "<!-- retie: skip --> is only for a page that records past spellings",
    });
  }
  out.push(...headingFindings(markdown, tables));
  out.push(...sharedPrefixFindings(markdown, tables));
  return out;
}

export type SharedPrefixLoss = { index: number; detail: string };

/** Marked regions whose shared short cut does not survive the rewrite. */
export function sharedPrefixLosses(
  before: string,
  after: string,
  beforeTables: ClassifyTables,
  afterTables: ClassifyTables,
): SharedPrefixLoss[] {
  const earlier = [...before.matchAll(SHARED_PREFIX_RE)];
  const later = [...after.matchAll(SHARED_PREFIX_RE)];
  const out: SharedPrefixLoss[] = [];
  const count = Math.max(earlier.length, later.length);
  for (let i = 0; i < count; i++) {
    const was = earlier[i];
    const now = later[i];
    if (!was || !now) {
      out.push({
        index: was?.index ?? now!.index!,
        detail: "shared-prefix marker was added or removed",
      });
      continue;
    }
    const beforeRegion = regionThroughBlockquote(before, was.index + was[0].length);
    const afterRegion = regionThroughBlockquote(after, now.index + now[0].length);
    const beforeRoots = beforeRegion ? contentRootsIn(beforeRegion, beforeTables) : [];
    const afterRoots = afterRegion ? contentRootsIn(afterRegion, afterTables) : [];
    if (!shortCutLost(beforeRoots, afterRoots)) continue;
    const shown = (roots: string[]) => [...new Set(roots)].join(", ");
    out.push({
      index: was.index,
      detail: `shared-prefix roots no longer share a short cut (${shown(beforeRoots)} → ${shown(afterRoots)})`,
    });
  }
  return out;
}

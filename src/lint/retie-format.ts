/**
 * Writing rules that keep a lexicon retie from chasing a second copy of a spelling.
 * Grammar pages: [retie-safe writing](../../docs/meta/grammar-docs.md#retie-safe-writing).
 */
import { grammarHeadings } from "./grammar-anchors.js";
import { ENGLISH_IN_CODE } from "./agazan-docs.js";
import { contentStemRoots } from "../retie/resume.js";
import { hasClosedOverlay, type ClassifyTables } from "../parse/classify.js";
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

const RETIE_SKIP_RE = /<!--\s*retie:\s*skip\s*-->/;

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
  return out;
}

/** Markdown block extraction and comparison of morph lines ([glosses.md](../../docs/meta/glosses.md)). */

import { type ClassifyTables } from "./classify.js";
import { WordParseError } from "./word.js";
import { morphGlossLine } from "./morph-gloss.js";
import { type CompareMorphGlossResult, type ExampleBlockPair, type TeachBlock } from "./morph-gloss-tables.js";

export function normalizeMorphLine(line: string): string {
  return line
    .normalize("NFC")
    .trim()
    .replace(/(?<!\]#?)[ \t]*\|[ \t]*/g, " | ")
    .replace(/[ \t]+/g, " ");
}

export function normalizeAgeben(text: string): string {
  let t = text.normalize("NFC").trim();
  if (/[.?!]$/.test(t)) t = t.slice(0, -1).trimEnd();
  return t;
}

export function compareMorphGloss(
  ageben: string,
  documented: string,
  tables: ClassifyTables,
): CompareMorphGlossResult {
  const expected = normalizeMorphLine(documented);
  try {
    const actual = normalizeMorphLine(
      morphGlossLine(ageben.normalize("NFC").trim(), tables, { strict: true }),
    );
    return { ok: expected === actual, expected, actual };
  } catch (error) {
    const parseError = error instanceof WordParseError
      ? error.message
      : error instanceof Error
        ? error.message
        : String(error);
    return { ok: false, expected, actual: "", parseError };
  }
}

/** Loose free English for redundancy checks — [glosses.md#example-block](../../docs/meta/glosses.md#example-block). */
export function normalizeLooseEnglish(loose: string): string {
  let t = loose.normalize("NFC").trim();
  if (t.startsWith('"') && t.includes('"', 1)) {
    const end = t.indexOf('"', 1);
    t = t.slice(1, end);
  }
  t = t.trim().toLowerCase();
  t = t.replace(/[.?!]+$/g, "").trim();
  return t;
}

const MORPH_POS_PREFIX_RE = /^(?:th|[zdbvgwhxy])l?-(.+)$/;

function morphSegmentBodyForLooseCompare(segment: string): string {
  const m = MORPH_POS_PREFIX_RE.exec(segment.trim());
  return (m ? m[1]! : segment).trim().toLowerCase();
}

/**
 * True when an omitted morph line is allowed: parser output is one segment and matches loose English.
 * See [glosses.md#example-block](../../docs/meta/glosses.md#example-block).
 */
export function morphRedundantWithLoose(
  ageben: string,
  loose: string,
  tables: ClassifyTables,
): boolean {
  let canonical: string;
  try {
    canonical = normalizeMorphLine(morphGlossLine(normalizeAgeben(ageben), tables, { strict: true }));
  } catch {
    return false;
  }
  if (canonical.includes(" | ")) return false;
  const looseNorm = normalizeLooseEnglish(loose);
  if (!looseNorm) return false;
  const morphBody = morphSegmentBodyForLooseCompare(canonical);
  return morphBody === looseNorm;
}

// The prefix before `←` is a holder host (`th-CLUES-←Uzozen`) or a lateral's direction (`h-west-th-←Uzozen`).
const MORPH_TOKEN_RE =
  /^(?:(?:th|[zdbvgwhxy])l?-)?(?:[A-Z][A-Za-z.]*-(?=←)|[a-z][A-Za-z.-]*-th-(?=←))?←*[A-Za-z0-9…/'’._#+∞≤≥≠@{}^|,-]*(?:-x-[A-Za-z0-9…/'’._#+∞≤≥≠@{}^|,-]+)*(?:-x)?$|^[<>^]$|^\^-start$|^\^-end$/;

export function looksLikeMorphLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("`") || trimmed.startsWith('"')) return false;
  if (/^(strict|loose):/i.test(trimmed)) return false;
  const flat = trimmed
    .replace(QUOTED_PAYLOAD_RE, "Q")
    .replace(PACKAGE_OPEN_RE, "")
    .replace(/\[/g, "")
    .replace(/\][#|]?/g, "");
  const parts = flat
    .replace(/\s+[?!]$/, "")
    // Free-standing tone mark slot (`; | `), not a ` ; ` separator.
    .replace(/(^|\s)[!?%&;]+\s+\|\s+/g, "$1")
    .split(/\s+\|\s+|\s+·\s+|\s+;\s+|\s+[.?!]\s+/);
  return parts.length > 0 && parts.every((part) => MORPH_TOKEN_RE.test(part.replace(/^[!?%&;]+\s*/, "")));
}

/** Quoted pass-through payload in a morph line (`"…"`, `""` escape). */
const QUOTED_PAYLOAD_RE = /"(?:[^"]|"")*"/g;

/** Labeled package open (`d-CITE.multi[`, `NAME[`, `SCOPE[`). */
const PACKAGE_OPEN_RE =
  /(?:(?:th|[zdbvgwhxy])l?-)?(?:NAME\.)?(?:CITE|MENTION|ASIDE|OPAQUE|SCOPE|NAME)(?:\.[a-z]+)*\[/g;

function collectBlockquoteGroup(
  lines: string[],
  start: number,
): { block: { text: string; abs: number }[]; next: number } {
  const block: { text: string; abs: number }[] = [];
  let i = start;
  while (i < lines.length) {
    const line = lines[i]!;
    if (isBlockquoteLine(line)) {
      block.push({ text: stripBlockquote(line), abs: i });
      i += 1;
      continue;
    }
    // A blank (non-`>`) line ends the blockquote: the next `>` starts a new example.
    break;
  }
  return { block, next: i };
}

function parseLooseFromBlockquoteLine(text: string): string | null {
  const trimmed = text.trim();
  const m = trimmed.match(/^"([^"]*)"/);
  return m ? m[1]! : null;
}

function normalizeBlockMorphLine(source: string): string {
  return source.replace(/\s+·\s+/g, " | ").replace(/\s+;\s+/g, " | ");
}

/** glosses.md-style teach blockquotes: backticked Ageben, optional morph, optional quoted loose English. */
export function extractTeachBlocks(markdown: string): TeachBlock[] {
  const blocks: TeachBlock[] = [];
  const lines = markdown.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    if (!isBlockquoteLine(lines[i]!)) {
      i += 1;
      continue;
    }
    const { block, next } = collectBlockquoteGroup(lines, i);
    i = next;
    const nonempty = block.filter((row) => row.text.trim().length > 0);
    const first = nonempty[0];
    if (!first) continue;
    const ageben = unwrapCode(first.text.trim());
    if (!ageben) continue;

    let morph: string | null = null;
    let loose: string | null = null;
    for (let j = 1; j < nonempty.length; j++) {
      const line = nonempty[j]!.text.trim();
      if (loose == null) {
        const quoted = parseLooseFromBlockquoteLine(line);
        if (quoted != null) {
          loose = quoted;
          continue;
        }
      }
      if (morph == null && looksLikeMorphLine(line)) {
        morph = normalizeBlockMorphLine(line);
      }
    }

    blocks.push({ ageben, morph, loose, agebenIndex: first.abs });
  }
  return blocks;
}

/**
 * Parse glosses.md-style example blockquotes that include an explicit morph line.
 */
export function extractExampleBlocks(markdown: string): ExampleBlockPair[] {
  const pairs: ExampleBlockPair[] = [];
  for (const block of extractTeachBlocks(markdown)) {
    if (!block.morph) continue;
    pairs.push({
      ageben: block.ageben,
      morph: block.morph,
      agebenIndex: block.agebenIndex,
    });
  }
  return pairs;
}

function isBlockquoteLine(line: string): boolean {
  return /^[ \t]*>/.test(line);
}

function stripBlockquote(line: string): string {
  return line.replace(/^[ \t]*>[ \t]?/, "");
}

/** Ageben in a backtick span, or in `<code>` with `<` / `>` as entities (a raw `<…>` span is a Vue tag in Markdown). */
function unwrapCode(text: string): string | null {
  const m = text.match(/^`([^`]+)`\.?$/);
  if (m) return m[1]!;
  const html = text.match(/^<code>([^<]+)<\/code>\.?$/);
  return html ? html[1]!.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") : null;
}

/**
 * Translation-practice **Roots used here** tables: English must be a
 * lexicon / overlay / morph sense for that Agalan spelling.
 */
import { classify, lexiconContentRoots, type ClassifyTables } from "../parse/classify.js";
import { senseFormEnding, senseFormRoot, type OverlayKind } from "../lexicon-search.js";
import { senseLabel } from "../parse/morph-gloss.js";
import { parseWord, WordParseError } from "../parse/word.js";
import { lineNumberAt } from "../retie/tokens.js";

export type WordBankFinding = {
  line: number;
  agalan: string;
  english: string;
  column: "Agalan" | "Same root as";
  expected: string[];
  detail: string;
};

const PRACTICE_H3_RE = /^### Translation practice\b/;
const ROOTS_CAPTION_RE = /^\*\*Roots used here/;

export function lintWordBankMarkdown(
  text: string,
  tables: ClassifyTables,
): WordBankFinding[] {
  const findings: WordBankFinding[] = [];
  const lines = text.split(/\r?\n/);
  for (const range of practiceRanges(lines)) {
    const table = findRootsTable(lines, range.start, range.end);
    if (!table) continue;
    for (const row of table.rows) {
      const line = lineNumberAt(text, lineIndexToCharIndex(text, row.lineIndex));
      if (row.agalan && row.english) {
        const hit = checkPair(row.agalan, row.english, tables, "Agalan");
        if (hit) findings.push({ ...hit, line });
      }
      if (row.sameAgalan && row.sameEnglish) {
        const hit = checkPair(row.sameAgalan, row.sameEnglish, tables, "Same root as");
        if (hit) findings.push({ ...hit, line });
      }
    }
  }
  return findings;
}

function checkPair(
  agalan: string,
  english: string,
  tables: ClassifyTables,
  column: "Agalan" | "Same root as",
): Omit<WordBankFinding, "line"> | null {
  const surface = decodeEntities(agalan).replace(/[.,!?]+$/, "");
  const got = normalizeEnglish(english);
  if (!got) return null;

  let morph;
  try {
    morph = parseWord(surface);
  } catch (error) {
    if (error instanceof WordParseError) {
      return {
        agalan: surface,
        english,
        column,
        expected: [],
        detail: "does not parse",
      };
    }
    throw error;
  }

  if (isForeignPayload(morph.family)) {
    const payload = foreignPayload(morph.family);
    if (payload && normalizeEnglish(payload) === got) return null;
    return {
      agalan: surface,
      english,
      column,
      expected: payload ? [payload] : [],
      detail: "foreign English must match the payload",
    };
  }

  if (morph.family.kind === "x" && morph.family.xFamily === "role" && column === "Agalan") {
    const allowed = allowedSenses(morph, tables);
    const host = allowed.hostLemmas;
    if (host.has(got) || allowed.all.has(got)) return null;
    return {
      agalan: surface,
      english,
      column,
      expected: [...allowed.all, ...host].sort(),
      detail: "role-compound English must be the morph sense or the host lexicon lemma",
    };
  }

  const allowed = allowedSenses(morph, tables);
  if (allowed.all.has(got)) return null;
  return {
    agalan: surface,
    english,
    column,
    expected: [...allowed.all].sort(),
    detail: "English is not a lexicon / overlay sense for this spelling",
  };
}

function allowedSenses(
  morph: ReturnType<typeof parseWord>,
  tables: ClassifyTables,
): { all: Set<string>; hostLemmas: Set<string> } {
  const all = new Set<string>();
  const hostLemmas = new Set<string>();
  const word = classify(morph, tables);
  add(all, senseLabel(word, tables));

  const roots = lexiconContentRoots(morph);
  const ending = morph.ending;
  for (const root of roots) {
    const pub = tables.published.get(root);
    if (pub) {
      add(all, pub.literal);
      add(hostLemmas, pub.literal);
      if (pub.metaphorical) {
        add(all, pub.metaphorical);
        add(hostLemmas, pub.metaphorical);
      }
      const packed =
        ending === "m" ? pub.posEnglish.metaphorical : pub.posEnglish.literal;
      if (morph.pos) add(all, packed[morph.pos]);
      for (const lemma of Object.values(pub.posEnglish.literal)) add(all, lemma);
      for (const lemma of Object.values(pub.posEnglish.metaphorical)) add(all, lemma);
    }
    const compound = tables.compounds.get(root);
    if (compound) {
      add(all, compound.literal);
      add(all, compound.metaphorical);
      add(hostLemmas, compound.literal);
      add(hostLemmas, compound.metaphorical);
    }
  }

  const senseForm =
    morph.family.kind === "content" && morph.family.roots.length === 1 && ending
      ? morph.family.roots[0]! + ending
      : morph.family.kind === "joinMarker" && ending
        ? morph.family.series + ending
        : null;

  for (const row of tables.overlays.values()) {
    addOverlay(all, row.kind, row.gloss, row.senseForm, senseForm, roots, morph.pos);
  }

  return { all, hostLemmas };
}

function addOverlay(
  into: Set<string>,
  kind: OverlayKind,
  gloss: string,
  overlayForm: string,
  wordForm: string | null,
  roots: string[],
  pos: string | undefined,
): void {
  if (wordForm && overlayForm === wordForm) {
    add(into, gloss);
    return;
  }
  const host = senseFormRoot(overlayForm);
  if (!roots.includes(host)) return;
  if (kind === "need") {
    add(into, gloss);
    return;
  }
  if (!pos && senseFormEnding(overlayForm) === (wordForm ? wordForm.at(-1) : null)) {
    add(into, gloss);
  }
}

function add(into: Set<string>, value: string | undefined): void {
  if (!value) return;
  into.add(normalizeEnglish(value));
}

export function normalizeEnglish(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_/]+/g, " ")
    .replace(/\s+/g, "-")
    .replace(/[()]/g, "");
}

function isForeignPayload(family: ReturnType<typeof parseWord>["family"]): boolean {
  return family.kind === "foreign" || (family.kind === "writingSpan" && family.bracket === "<");
}

function foreignPayload(family: ReturnType<typeof parseWord>["family"]): string | null {
  if (family.kind === "foreign" || family.kind === "writingSpan") return family.payload;
  return null;
}

function practiceRanges(lines: string[]): { start: number; end: number }[] {
  const ranges: { start: number; end: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!PRACTICE_H3_RE.test(lines[i]!)) continue;
    let end = lines.length;
    for (let j = i + 1; j < lines.length; j++) {
      if (isPracticeBoundary(lines[j]!)) {
        end = j;
        break;
      }
    }
    ranges.push({ start: i, end });
  }
  return ranges;
}

function isPracticeBoundary(line: string): boolean {
  const isH2 = /^## /.test(line) && !/^### /.test(line);
  const isH3 = /^### /.test(line) && !/^#### /.test(line);
  return isH2 || isH3;
}

type BankRow = {
  lineIndex: number;
  english: string | null;
  agalan: string | null;
  sameEnglish: string | null;
  sameAgalan: string | null;
};

function findRootsTable(
  lines: string[],
  start: number,
  end: number,
): { rows: BankRow[] } | null {
  let caption = -1;
  for (let i = start; i < end; i++) {
    if (ROOTS_CAPTION_RE.test(lines[i]!)) {
      caption = i;
      break;
    }
  }
  if (caption < 0) return null;

  let headerIndex = -1;
  for (let i = caption; i < end && i < caption + 6; i++) {
    if (isTableRow(lines[i]!)) {
      headerIndex = i;
      break;
    }
  }
  if (headerIndex < 0) return null;

  const header = splitRow(lines[headerIndex]!);
  const englishCol = header.findIndex((h) => /^english$/i.test(h));
  const agalanCol = header.findIndex((h) => /^agalan$/i.test(h));
  const sameCol = header.findIndex((h) => /^same root as$/i.test(h));
  if (englishCol < 0 || agalanCol < 0) return null;

  let i = headerIndex + 1;
  if (i < end && isDividerRow(lines[i]!)) i += 1;
  const rows: BankRow[] = [];
  while (i < end && isTableRow(lines[i]!) && !isDividerRow(lines[i]!)) {
    const cells = splitRow(lines[i]!);
    const same = sameCol >= 0 ? parseSameRoot(cells[sameCol] ?? "") : { agalan: null, english: null };
    rows.push({
      lineIndex: i,
      english: firstItalic(cells[englishCol] ?? ""),
      agalan: firstAgalan(cells[agalanCol] ?? ""),
      sameEnglish: same.english,
      sameAgalan: same.agalan,
    });
    i += 1;
  }
  return { rows };
}

function parseSameRoot(cell: string): { agalan: string | null; english: string | null } {
  return { agalan: firstAgalan(cell), english: firstItalic(cell) };
}

function firstItalic(cell: string): string | null {
  const m = cell.match(/\*([^*]+)\*/);
  return m ? m[1]!.trim() : null;
}

function firstAgalan(cell: string): string | null {
  const decoded = decodeEntities(cell);
  const code = decoded.match(/`([^`]+)`/);
  if (code) return code[1]!.trim();
  const html = decoded.match(/<code>([^<]+)<\/code>/i);
  if (html) return html[1]!.trim();
  return null;
}

function decodeEntities(text: string): string {
  return text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

function isTableRow(line: string): boolean {
  const t = line.trim();
  return t.startsWith("|") && t.includes("|", 1);
}

function isDividerRow(line: string): boolean {
  return /^\s*\|?\s*:?-{3,}/.test(line);
}

function splitRow(line: string): string[] {
  const t = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return t.split("|").map((cell) => cell.trim());
}

function lineIndexToCharIndex(text: string, lineIndex: number): number {
  let offset = 0;
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lineIndex && i < lines.length; i++) {
    offset += lines[i]!.length + 1;
  }
  return offset;
}

export function formatWordBankFinding(relpath: string, finding: WordBankFinding): string {
  const expect =
    finding.expected.length > 0 ? finding.expected.map((s) => `*${s}*`).join(" / ") : "(none)";
  return [
    `${relpath}:${finding.line}  word-bank English mismatch (${finding.column})`,
    `  agalan: \`${finding.agalan}\``,
    `  documented: *${finding.english}*`,
    `  lexicon:     ${expect}`,
    `  ${finding.detail}`,
  ].join("\n");
}

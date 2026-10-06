/**
 * Translation-practice **Roots used here** tables: English must be a
 * lexicon / overlay / morph sense for that Agazan spelling.
 */
import { classify, lexiconContentRoots, type ClassifyTables } from "../parse/classify.js";
import { derivedHookGloss, hookCompoundFromMorph } from "../parse/hook-compounds.js";
import { senseFormEnding, senseFormRoot, type OverlayKind } from "../lexicon-search.js";
import { senseLabel } from "../parse/morph-gloss.js";
import { parseWord, WordParseError } from "../parse/word.js";
import { lineNumberAt } from "../retie/tokens.js";
import { fillSelf, hasSelfSlot } from "../learner-name.js";
import { collectExamples } from "../find/examples.js";
import type { LexWord } from "../parse/types.js";

export type WordBankFinding = {
  line: number;
  agazan: string;
  english: string;
  column: "Agazan" | "Same root as";
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
      if (row.agazan && row.english) {
        const hit = checkPair(row.agazan, row.english, tables, "Agazan");
        if (hit) findings.push({ ...hit, line });
      }
      if (row.sameAgazan && row.sameEnglish) {
        const hit = checkPair(row.sameAgazan, row.sameEnglish, tables, "Same root as");
        if (hit) findings.push({ ...hit, line });
      }
    }
  }
  return findings;
}

function checkPair(
  agazan: string,
  english: string,
  tables: ClassifyTables,
  column: "Agazan" | "Same root as",
): Omit<WordBankFinding, "line"> | null {
  const surface = decodeEntities(agazan).replace(/[.,!?]+$/, "");
  const got = normalizeEnglish(english);
  if (!got) return null;

  // The learner's own name (`SELFn`) is not a lexicon word; its English is *your name*.
  if (hasSelfSlot(surface)) {
    if (got === normalizeEnglish("your name")) return null;
    return { agazan: surface, english, column, expected: ["your name"], detail: "SELF row English must be *your name*" };
  }

  let morph;
  try {
    morph = parseWord(surface);
  } catch (error) {
    if (error instanceof WordParseError) {
      return {
        agazan: surface,
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
      agazan: surface,
      english,
      column,
      expected: payload ? [payload] : [],
      detail: "foreign English must match the payload",
    };
  }

  const allowed = allowedSenses(morph, tables);
  if (allowed.all.has(got) || allowed.hostLemmas.has(got)) return null;
  return {
    agazan: surface,
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
  add(all, senseLabel(word, tables)?.split("-x-").join("-"));
  // **-ln** is one thing the name applies to: *an Azawan* (word-endings.md#name-instance--ln).
  if (morph.ending === "ln") {
    const name = senseLabel(word, tables)?.replace(/\.instance$/, "").split("-x-").join("-");
    add(all, name && `a ${name}`);
    add(all, name && `an ${name}`);
  }

  const roots = lexiconContentRoots(morph);
  const ending = morph.ending;
  for (const root of roots) {
    const pub = tables.published.get(root);
    if (pub) {
      add(all, pub.concrete);
      add(hostLemmas, pub.concrete);
      if (pub.abstract) {
        add(all, pub.abstract);
        add(hostLemmas, pub.abstract);
      }
      const packed =
        ending === "m" ? pub.posEnglish.abstract : pub.posEnglish.concrete;
      if (morph.pos) add(all, packed[morph.pos]);
      for (const lemma of Object.values(pub.posEnglish.concrete)) add(all, lemma);
      for (const lemma of Object.values(pub.posEnglish.abstract)) add(all, lemma);
    }
    const compound = tables.compounds.get(root);
    if (compound) {
      add(all, compound.concrete);
      add(all, compound.abstract);
      add(hostLemmas, compound.concrete);
      add(hostLemmas, compound.abstract);
    }
  }
  const hooked = hookCompoundFromMorph(morph);
  if (hooked) {
    add(all, derivedHookGloss(hooked.hook));
    const listed = tables.compounds.get(hooked.stem);
    if (listed) {
      add(all, listed.concrete);
      add(all, listed.abstract);
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
  if (kind === "sake") {
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

export function practiceRanges(lines: string[]): { start: number; end: number }[] {
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

export type BankRow = {
  lineIndex: number;
  english: string | null;
  agazan: string | null;
  sameEnglish: string | null;
  sameAgazan: string | null;
};

export function findRootsTable(
  lines: string[],
  start: number,
  end: number,
): { rows: BankRow[]; caption: number; end: number } | null {
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
  const agazanCol = header.findIndex((h) => /^agazan$/i.test(h));
  const sameCol = header.findIndex((h) => /^same root as$/i.test(h));
  if (englishCol < 0 || agazanCol < 0) return null;

  let i = headerIndex + 1;
  if (i < end && isDividerRow(lines[i]!)) i += 1;
  const rows: BankRow[] = [];
  while (i < end && isTableRow(lines[i]!) && !isDividerRow(lines[i]!)) {
    const cells = splitRow(lines[i]!);
    const same = sameCol >= 0 ? parseSameRoot(cells[sameCol] ?? "") : { agazan: null, english: null };
    rows.push({
      lineIndex: i,
      english: firstItalic(cells[englishCol] ?? ""),
      agazan: firstAgazan(cells[agazanCol] ?? ""),
      sameEnglish: same.english,
      sameAgazan: same.agazan,
    });
    i += 1;
  }
  return { rows, caption, end: i };
}

function parseSameRoot(cell: string): { agazan: string | null; english: string | null } {
  return { agazan: firstAgazan(cell), english: firstItalic(cell) };
}

function firstItalic(cell: string): string | null {
  const m = cell.match(/\*([^*]+)\*/);
  return m ? m[1]!.trim() : null;
}

function firstAgazan(cell: string): string | null {
  const code = cell.match(/`([^`]+)`/);
  if (code) return decodeEntities(code[1]!.trim());
  const html = cell.match(/<code>([^<]+)<\/code>/i);
  if (html) return decodeEntities(html[1]!.trim());
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

export type WordBankUsageFinding = {
  line: number;
  kind: "missing" | "unused" | "no-bank";
  /** Lexicon roots the finding is about (empty for `no-bank`). */
  roots: string[];
  /** The word as written: the drill use (`missing`) or the bank cell (`unused`). */
  surface: string;
};

/**
 * Word banks against their drills: every lexicon content root the drills use
 * (answer spoilers and Agazan prompts, under the `####` direction headings) has
 * a **Roots used here** row, and every row is used. Roots match, not spellings
 * (`veyel` in the bank covers `zeyel`, a full-root resume, a role compound's
 * inner root). Overlay words need no row, but a row for one must be used.
 */
export function lintWordBankUsage(text: string, tables: ClassifyTables): WordBankUsageFinding[] {
  // `SELF` fills as the default learner root, so the `SELFn` row covers `SELF` uses.
  const filled = fillSelf(text);
  const lines = filled.split(/\r?\n/);
  const lineStarts: number[] = [];
  let offset = 0;
  for (const line of lines) {
    lineStarts.push(offset);
    offset += line.length + 1;
  }
  const lineOf = (index: number): number => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid]! <= index) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  };

  const examples = collectExamples(filled, tables);
  const findings: WordBankUsageFinding[] = [];
  for (const range of practiceRanges(lines)) {
    let drillStart = -1;
    for (let i = range.start + 1; i < range.end; i++) {
      if (/^#### /.test(lines[i]!)) {
        drillStart = i;
        break;
      }
    }
    if (drillStart < 0) continue;

    const used = new Set<string>();
    const required = new Map<string, { line: number; surface: string }>();
    for (const example of examples) {
      const at = lineOf(example.index);
      if (at < drillStart || at >= range.end) continue;
      for (const { word } of example.words) {
        // A bound resume's stem is a cut of its antecedent, which counts on its own.
        if (example.boundResumes.has(word)) continue;
        for (const { root, overlay } of vocabUses(word, tables)) {
          used.add(root);
          if (!overlay && !required.has(root)) required.set(root, { line: at + 1, surface: word.raw });
        }
      }
    }

    const table = findRootsTable(lines, range.start, drillStart);
    if (!table) {
      if (required.size > 0) {
        findings.push({ line: range.start + 1, kind: "no-bank", roots: [], surface: "" });
      }
      continue;
    }

    const banked = new Set<string>();
    for (const row of table.rows) {
      if (!row.agazan) continue;
      const roots = bankRoots(row.agazan, tables);
      for (const root of roots) banked.add(root);
      if (roots.length > 0 && !roots.some((root) => used.has(root))) {
        findings.push({ line: row.lineIndex + 1, kind: "unused", roots, surface: row.agazan });
      }
    }
    for (const [root, use] of required) {
      if (!banked.has(root)) findings.push({ line: use.line, kind: "missing", roots: [root], surface: use.surface });
    }
  }
  return findings.sort((a, b) => a.line - b.line);
}

/**
 * Lexicon roots a word spells (published or compound stems): a numeric derivation keeps its host,
 * a viewpoint lateral its anchor, and a `[…]` / `{…}` / `(…)` span the words inside it.
 * `overlay` marks roots that only host a closed overlay here.
 */
function vocabUses(word: LexWord, tables: ClassifyTables): { root: string; overlay: boolean }[] {
  const { family } = word;
  if (family.kind === "writingSpan") {
    if (family.bracket === "<") return [];
    const inner: { root: string; overlay: boolean }[] = [];
    for (const chunk of family.payload.split(/\s+/)) {
      const core = chunk.replace(/^[^a-z]+|[^a-z]+$/g, "");
      if (!core) continue;
      try {
        inner.push(...vocabUses(classify(parseWord(core), tables), tables));
      } catch (error) {
        // The span lint reports an interior that does not parse.
        if (!(error instanceof WordParseError)) throw error;
      }
    }
    return inner;
  }
  let roots = lexiconContentRoots(word);
  if (family.kind === "x" && family.xFamily === "numeric") roots = family.leftRoots;
  if (family.kind === "x" && family.xFamily === "lateral") roots = [...family.leftRoots, ...(family.rightRoots ?? [])];
  const overlay = Boolean(word.overlay || word.hostOverlay);
  return roots
    .filter((root) => tables.published.has(root) || tables.compounds.has(root))
    .map((root) => ({ root, overlay }));
}

export function bankRoots(agazan: string, tables: ClassifyTables): string[] {
  return bankUses(agazan, tables).map((use) => use.root);
}

/** Lexicon roots a bank cell spells, with `overlay` set where the cell is a closed overlay word on that root. */
export function bankUses(agazan: string, tables: ClassifyTables): { root: string; overlay: boolean }[] {
  const surface = agazan.replace(/[.,!?]+$/, "");
  try {
    const morph = parseWord(surface);
    if (isForeignPayload(morph.family)) return [];
    return vocabUses(classify(morph, tables), tables);
  } catch (error) {
    // The English check reports a bank cell that does not parse.
    if (error instanceof WordParseError) return [];
    throw error;
  }
}

export function formatWordBankUsageFinding(relpath: string, finding: WordBankUsageFinding): string {
  switch (finding.kind) {
    case "missing":
      return `${relpath}:${finding.line}  word-bank missing root  \`${finding.surface}\` uses ${finding.roots.join(", ")}, which has no **Roots used here** row`;
    case "unused":
      return `${relpath}:${finding.line}  word-bank unused row  \`${finding.surface}\` (${finding.roots.join(", ")}) is not used in the drills`;
    case "no-bank":
      return `${relpath}:${finding.line}  word-bank missing  translation practice uses content roots but has no **Roots used here** table`;
  }
}

export function formatWordBankFinding(relpath: string, finding: WordBankFinding): string {
  const expect =
    finding.expected.length > 0 ? finding.expected.map((s) => `*${s}*`).join(" / ") : "(none)";
  return [
    `${relpath}:${finding.line}  word-bank English mismatch (${finding.column})`,
    `  agazan: \`${finding.agazan}\``,
    `  documented: *${finding.english}*`,
    `  lexicon:     ${expect}`,
    `  ${finding.detail}`,
  ].join("\n");
}

import { parseWord } from "../parse/word.js";
import type { MorphWord } from "../parse/types.js";
import { toSpeechText } from "../tts/plan.js";

/**
 * Pronunciation rows on the number pages (numbers.md, numbers-applied.md,
 * numeric-derivation.md — the last is spelled out, so it rarely needs rows).
 *
 * Every Egabon example line whose speech differs from its writing (shorthand
 * number words) carries a `🔊 \`spoken\`` row directly underneath. Spoken →
 * written drills put the 🔊 row on the prompt instead. Tables with a written
 * column and a **Spoken** column start each spoken cell with `\`spoken\``.
 * The expected spoken form is computed from the shorthand.
 */

export const SPEECH_MARK = "🔊";

export const NUMBER_SPEECH_FILES = ["numbers.md", "numbers-applied.md", "numeric-derivation.md"];

export type NumberSpeechFinding = {
  line: number;
  egabon: string;
  expected: string;
  documented: string | null;
};

const ITEM_START_RE = /^\*\*\d+\.\*\*\s*/;
const SPEECH_ROW_RE = new RegExp(`^${SPEECH_MARK}\\s+\`([^\`]+)\``);
const WRITTEN_COL_RE = /^(?:written|writing|preferred writing|egabon)$/i;
const SPOKEN_COL_RE = /^(?:spoken|speech|pronunciation)$/i;

function isNumberWord(word: MorphWord): boolean {
  const family = word.family;
  return family.kind === "number" || (family.kind === "x" && family.xFamily === "numeric");
}

const BOUNDARY_TEXT: Record<string, string> = {
  period: ".",
  softM: ".",
  qmark: "?",
  bang: "!",
};

/** Spoken sentence for written Egabon: number shorthand spelled out, other words as written. */
export function spokenForm(egabon: string): string {
  let out = "";
  for (const token of toSpeechText(egabon)) {
    if (token.kind === "boundary") {
      out += BOUNDARY_TEXT[token.tag] ?? "";
      continue;
    }
    out += (out ? " " : "") + token.raw;
  }
  return out.replace(/ ([.?!])/g, "$1").trim();
}

/** True when the line contains a number word whose speech differs from its writing. */
export function needsSpeechRow(egabon: string): boolean {
  return normalize(spokenForm(egabon)) !== normalize(egabon);
}

function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function stripQuote(line: string): string {
  return line.replace(/^[ \t]*>[ \t]?/, "").trim();
}

/** Backticked line that is a whole Egabon example (optionally an **N.** prompt). */
function egabonOnLine(text: string): string | null {
  const body = text.replace(ITEM_START_RE, "");
  const m = body.match(/^`([^`]+)`\.?$/);
  if (!m) return null;
  try {
    const plan = toSpeechText(m[1]!);
    if (plan.some((t) => t.kind === "skip" && t.reason === "error")) return null;
  } catch {
    return null;
  }
  return m[1]!;
}

function speechOnLine(text: string): string | null {
  const body = text.replace(ITEM_START_RE, "");
  const m = body.match(SPEECH_ROW_RE);
  return m ? m[1]!.trim() : null;
}

function isBoundary(text: string): boolean {
  return /^#{1,6}\s/.test(text) || ITEM_START_RE.test(text);
}

export function lintNumberSpeechMarkdown(markdown: string): NumberSpeechFinding[] {
  const findings: NumberSpeechFinding[] = [];
  const lines = markdown.split(/\r?\n/);
  let inFence = false;
  /** Answer lines already paired with a 🔊 prompt above them. */
  const paired = new Set<number>();

  const check = (lineIndex: number, egabon: string, documented: string | null): void => {
    const expected = spokenForm(egabon);
    if (documented != null && normalize(documented) === normalize(expected)) return;
    if (documented == null && !needsSpeechRow(egabon)) return;
    findings.push({ line: lineIndex + 1, egabon, expected, documented });
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]!;
    if (/^\s*```/.test(raw)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const text = stripQuote(raw);

    // Spoken → written prompt: the 🔊 row comes first, the answer's Egabon follows.
    if (ITEM_START_RE.test(text) && speechOnLine(text) != null) {
      const documented = speechOnLine(text)!;
      for (let j = i + 1; j < lines.length; j++) {
        const next = stripQuote(lines[j]!);
        if (isBoundary(next)) break;
        const egabon = egabonOnLine(next);
        if (egabon != null) {
          check(j, egabon, documented);
          paired.add(j);
          break;
        }
      }
      continue;
    }

    const egabon = egabonOnLine(text);
    if (egabon == null || paired.has(i)) continue;

    // The 🔊 row is the next non-blank line in the item (a details opener may sit between).
    let documented: string | null = null;
    for (let j = i + 1; j < lines.length; j++) {
      const next = stripQuote(lines[j]!);
      if (next === "" || next.startsWith("::: details")) continue;
      documented = speechOnLine(next);
      break;
    }
    check(i, egabon, documented);
  }

  findings.push(...lintSpeechTables(lines));
  return findings;
}

function splitRow(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

function isTableRow(line: string): boolean {
  const t = line.trim();
  return t.startsWith("|") && t.includes("|", 1);
}

function isDividerRow(line: string): boolean {
  return /^\s*\|?\s*:?-{3,}/.test(line);
}

function singleNumberWord(cell: string): string | null {
  const codes = [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]!);
  if (codes.length !== 1) return null;
  try {
    return isNumberWord(parseWord(codes[0]!)) ? codes[0]! : null;
  } catch {
    return null;
  }
}

function lintSpeechTables(lines: string[]): NumberSpeechFinding[] {
  const findings: NumberSpeechFinding[] = [];
  let i = 0;
  while (i < lines.length) {
    if (!isTableRow(lines[i]!)) {
      i += 1;
      continue;
    }
    const header = splitRow(lines[i]!);
    i += 1;
    if (i < lines.length && isDividerRow(lines[i]!)) i += 1;
    const writtenCol = header.findIndex((h) => WRITTEN_COL_RE.test(h));
    const spokenCol = header.findIndex((h) => SPOKEN_COL_RE.test(h));
    while (i < lines.length && isTableRow(lines[i]!) && !isDividerRow(lines[i]!)) {
      if (writtenCol >= 0 && spokenCol >= 0) {
        const cells = splitRow(lines[i]!);
        const egabon = singleNumberWord(cells[writtenCol] ?? "");
        if (egabon != null) {
          const m = (cells[spokenCol] ?? "").match(/^`([^`]+)`/);
          const documented = m ? m[1]!.trim() : null;
          const expected = spokenForm(egabon);
          if (documented !== expected) {
            findings.push({ line: i + 1, egabon, expected, documented });
          }
        }
      }
      i += 1;
    }
  }
  return findings;
}

export function formatNumberSpeechFinding(relpath: string, finding: NumberSpeechFinding): string {
  const loc = `${relpath}:${finding.line}`;
  if (finding.documented == null) {
    return `${loc}  missing pronunciation row  \`${finding.egabon}\`  (expected ${SPEECH_MARK} \`${finding.expected}\`)`;
  }
  return `${loc}  pronunciation mismatch  \`${finding.egabon}\`  documented \`${finding.documented}\`, expected \`${finding.expected}\``;
}

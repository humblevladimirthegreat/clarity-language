/**
 * Items of converted checkpoints (`### Practice`), typed by their H4
 * (docs/meta/translation-exercises.md#template), plus the section-shape findings:
 * known H4s in template order, both translation directions, items numbered from 1 under
 * each H4, item counts (docs/meta/drill-generation.md#execute), and a spoiler on every item.
 */
import { SPEECH_MARK } from "./number-speech-docs.js";
import { practiceRanges } from "./practice-sections.js";

export type PracticeItemType = "en-ag" | "ag-en" | "pick" | "fix" | "changes";

/** H4 titles in template order. */
export const PRACTICE_H4: readonly { type: PracticeItemType; title: string }[] = [
  { type: "en-ag", title: "English → Agazan" },
  { type: "ag-en", title: "Agazan → English" },
  { type: "pick", title: "Pick one" },
  { type: "fix", title: "Fix it" },
  { type: "changes", title: "What changes" },
];

/** Items per translation direction, and decision items per checkpoint, across all bands. */
export const TRANSLATION_ITEMS = { min: 3, max: 6 };
export const DECISION_ITEMS = { min: 2, max: 3 };

/** The marker that lets a **Fix it** prompt hold the wrong form. */
export const ERROR_MARKER = "lint: error";

export type PracticeSpan = { text: string; index: number; marker?: string };

/** `speech`: a 🔊 pronunciation row under a number answer ([number-speech-docs.ts](number-speech-docs.ts)). */
export type SpoilerLineKind = "agazan" | "also" | "english" | "speech" | "text";
export type SpoilerLine = { text: string; index: number; kind: SpoilerLineKind };

export type PracticeItem = {
  type: PracticeItemType;
  number: number;
  /** Char index of the item's `**N.**`. */
  index: number;
  /** Char range of the prompt line. */
  prompt: { start: number; end: number };
  promptSpans: PracticeSpan[];
  promptEnglish: string | null;
  hasDetails: boolean;
  /** Non-blank lines inside the spoiler, in order. */
  spoiler: SpoilerLine[];
  /** Variants on the **Also correct:** line. */
  alsoCorrect: PracticeSpan[];
};

export type PracticeShapeFinding = { index: number; detail: string };

const ITEM_START_RE = /^\*\*(\d+)\.\*\*(.*)$/;
const H4_RE = /^#### (.+?)\s*(?:\{#[^}]*\})?\s*$/;
const SPAN_RE = /(?:<!--\s*([\s\S]*?)\s*-->\s*)?`([^`]+)`/g;
const ALSO_RE = /^\*\*Also correct:\*\*/;

export function practiceItems(markdown: string): { items: PracticeItem[]; findings: PracticeShapeFinding[] } {
  const lines = markdown.split(/\r?\n/);
  const starts: number[] = [];
  let offset = 0;
  for (const line of lines) {
    starts.push(offset);
    offset += line.length + 1;
  }
  const items: PracticeItem[] = [];
  const findings: PracticeShapeFinding[] = [];

  for (const range of practiceRanges(lines)) {
    if (!range.converted) continue;
    const sectionItems: PracticeItem[] = [];
    const seen: PracticeItemType[] = [];
    let type: PracticeItemType | undefined;
    let lastOrder = -1;
    let expected = 1;

    for (let i = range.start + 1; i < range.end; i++) {
      const line = lines[i]!;
      const h4 = H4_RE.exec(line);
      if (h4) {
        const order = PRACTICE_H4.findIndex((h) => h.title === h4[1]);
        if (order < 0) {
          findings.push({ index: starts[i]!, detail: `unknown checkpoint H4 "${h4[1]}"; use ${PRACTICE_H4.map((h) => h.title).join(" / ")}` });
          type = undefined;
          continue;
        }
        if (order <= lastOrder) {
          findings.push({ index: starts[i]!, detail: `"${h4[1]}" is out of template order (${PRACTICE_H4.map((h) => h.title).join(", ")}), or repeated` });
        }
        lastOrder = Math.max(lastOrder, order);
        type = PRACTICE_H4[order]!.type;
        seen.push(type);
        expected = 1;
        continue;
      }
      const start = ITEM_START_RE.exec(line);
      if (!start) continue;
      if (!type) {
        findings.push({ index: starts[i]!, detail: "checkpoint item outside a known H4" });
        continue;
      }
      const number = Number(start[1]);
      if (number !== expected) findings.push({ index: starts[i]!, detail: `item **${number}.** should be **${expected}.** (number from 1 under each H4)` });
      expected = number + 1;

      let end = i + 1;
      while (end < range.end && !ITEM_START_RE.test(lines[end]!) && !H4_RE.test(lines[end]!)) end += 1;
      const item = readItem(lines, starts, i, end, type, number);
      if (!item.hasDetails) findings.push({ index: item.index, detail: "checkpoint item has no ::: details spoiler" });
      sectionItems.push(item);
      i = end - 1;
    }

    const at = starts[range.start]!;
    for (const type of ["en-ag", "ag-en"] as const) {
      const title = PRACTICE_H4.find((h) => h.type === type)!.title;
      const count = sectionItems.filter((item) => item.type === type).length;
      if (!seen.includes(type)) findings.push({ index: at, detail: `checkpoint has no #### ${title}` });
      else if (count < TRANSLATION_ITEMS.min || count > TRANSLATION_ITEMS.max) {
        findings.push({ index: at, detail: `${count} ${title} item(s); use ${TRANSLATION_ITEMS.min}–${TRANSLATION_ITEMS.max}` });
      }
    }
    const decisions = sectionItems.filter((item) => item.type !== "en-ag" && item.type !== "ag-en").length;
    if (decisions < DECISION_ITEMS.min || decisions > DECISION_ITEMS.max) {
      findings.push({ index: at, detail: `${decisions} decision item(s) (Pick one / Fix it / What changes); use ${DECISION_ITEMS.min}–${DECISION_ITEMS.max}` });
    }
    items.push(...sectionItems);
  }
  return { items, findings };
}

/** Char ranges of **Fix it** prompt lines, where {@link ERROR_MARKER} is allowed. */
export function fixPromptRanges(markdown: string): { start: number; end: number }[] {
  return practiceItems(markdown).items.filter((item) => item.type === "fix").map((item) => item.prompt);
}

function readItem(
  lines: readonly string[],
  starts: readonly number[],
  first: number,
  end: number,
  type: PracticeItemType,
  number: number,
): PracticeItem {
  const promptLine = lines[first]!;
  const promptRest = ITEM_START_RE.exec(promptLine)![2]!;
  const restAt = starts[first]! + promptLine.length - promptRest.length;
  const spoiler: SpoilerLine[] = [];
  const alsoCorrect: PracticeSpan[] = [];
  let hasDetails = false;
  let inDetails = false;
  for (let i = first + 1; i < end; i++) {
    const trimmed = lines[i]!.trim();
    if (!inDetails) {
      if (/^::: details\b/.test(trimmed)) inDetails = hasDetails = true;
      continue;
    }
    if (/^:::$/.test(trimmed)) break;
    if (!trimmed) continue;
    const index = starts[i]! + lines[i]!.indexOf(trimmed);
    const kind = spoilerKind(trimmed);
    spoiler.push({ text: kind === "agazan" ? trimmed.slice(1, -1) : trimmed, index, kind });
    if (kind === "also") alsoCorrect.push(...spans(trimmed, index));
  }
  return {
    type,
    number,
    index: starts[first]!,
    prompt: { start: starts[first]!, end: starts[first]! + promptLine.length },
    promptSpans: spans(promptRest, restAt),
    promptEnglish: /\*([^*]+)\*/.exec(promptRest.replace(/<!--[\s\S]*?-->/g, ""))?.[1]?.trim() ?? null,
    hasDetails,
    spoiler,
    alsoCorrect,
  };
}

function spoilerKind(trimmed: string): SpoilerLineKind {
  if (/^`[^`]+`$/.test(trimmed)) return "agazan";
  if (ALSO_RE.test(trimmed)) return "also";
  if (trimmed.startsWith(SPEECH_MARK)) return "speech";
  if (/^\*[^*].*\*$/.test(trimmed)) return "english";
  return "text";
}

function spans(text: string, at: number): PracticeSpan[] {
  return [...text.matchAll(SPAN_RE)].map((m) => ({
    text: m[2]!,
    index: at + m.index! + m[0].length - m[2]!.length - 1,
    ...(m[1] !== undefined ? { marker: m[1] } : {}),
  }));
}

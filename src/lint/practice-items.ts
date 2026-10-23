/**
 * Items of converted checkpoints (`### Practice`), typed by their H4
 * (docs/meta/translation-exercises.md#template), plus the section-shape findings:
 * known H4s in template order, both translation directions, items numbered from 1 under
 * each H4, item counts scaled by band and taught-section count *S*
 * (docs/meta/drill-generation.md#execute), and a spoiler on every item.
 * A level review ([level-review.ts](level-review.ts)) has its own counts, so `review` skips them.
 */
import { SPEECH_MARK } from "./number-speech-docs.js";
import { BANDS, type Band } from "./learning-order.js";
import { PRACTICE_H3_RE, practiceRanges } from "./practice-sections.js";

export type PracticeItemType = "en-ag" | "ag-en" | "pick" | "fix" | "changes";

/** H4 titles in template order. */
export const PRACTICE_H4: readonly { type: PracticeItemType; title: string }[] = [
  { type: "en-ag", title: "English → Agebon" },
  { type: "ag-en", title: "Agebon → English" },
  { type: "pick", title: "Pick one" },
  { type: "fix", title: "Fix it" },
  { type: "changes", title: "What changes" },
];

/** Translation and decision caps from band kind and taught-section count *S*. */
export type ItemLimits = {
  translation: { min: number; max: number };
  decision: { min: number; max: number };
};

/**
 * Item caps for a converted checkpoint (docs/meta/drill-generation.md#execute).
 * *S* is the number of `###` headings in the band above the checkpoint, not counting Practice.
 * Beginner / Intermediate stay at 3–6 / 2–3 until *S* is large; Advanced uses a tighter floor.
 */
export function itemLimits(band: Band | undefined, S: number): ItemLimits {
  const advanced = band === "advanced";
  const translationMax = Math.min(advanced ? 8 : 10, Math.max(advanced ? 4 : 6, Math.ceil(S / 2) + (advanced ? 1 : 2)));
  const decisionMax = Math.min(advanced ? 4 : 5, Math.max(advanced ? 2 : 3, Math.ceil(S / 4)));
  return {
    translation: { min: 3, max: translationMax },
    decision: { min: 2, max: decisionMax },
  };
}

const BAND_H2 = /^## (Beginner|Intermediate|Advanced)\b/i;

/** Band of a checkpoint, and taught `###` count *S* above it (not counting Practice). */
export function practiceBandStats(
  lines: readonly string[],
  practiceStart: number,
): { band: Band | undefined; S: number } {
  let band: Band | undefined;
  let bandLine = -1;
  let inFence = false;
  for (let i = 0; i < practiceStart; i++) {
    const line = lines[i]!;
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const h2 = BAND_H2.exec(line);
    if (!h2) continue;
    const name = h2[1]!.toLowerCase();
    if (!BANDS.includes(name as Band)) continue;
    band = name as Band;
    bandLine = i;
  }
  let S = 0;
  inFence = false;
  for (let i = 0; i < practiceStart; i++) {
    const line = lines[i]!;
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence) continue;
    if (i <= bandLine) continue;
    if (/^### /.test(line) && !PRACTICE_H3_RE.test(line)) S += 1;
  }
  return { band, S };
}

/** The marker that lets a **Fix it** prompt hold the wrong form. */
export const ERROR_MARKER = "lint: error";

export type PracticeSpan = { text: string; index: number; marker?: string };

/**
 * `speech`: a 🔊 pronunciation row under a number answer ([number-speech-docs.ts](number-speech-docs.ts)).
 * `rule`: the **Rule:** link that ends a level review answer.
 */
export type SpoilerLineKind = "agebon" | "also" | "english" | "speech" | "rule" | "text";
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
export const RULE_RE = /^\*\*Rule:\*\*/;

export function practiceItems(
  markdown: string,
  { review = false, page }: { review?: boolean; page?: string } = {},
): { items: PracticeItem[]; findings: PracticeShapeFinding[] } {
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
    const { band, S } = practiceBandStats(lines, range.start);
    if (!review && S > 10) {
      const pageName = page ?? "this page";
      const bandName = band ? `${band[0]!.toUpperCase()}${band.slice(1)}` : "this band";
      findings.push({
        index: at,
        detail: `${pageName} ${bandName} teaches ${S} sections; a band past 10 splits into a sibling page`,
      });
    }
    const limits = itemLimits(band, S);
    for (const type of ["en-ag", "ag-en"] as const) {
      const title = PRACTICE_H4.find((h) => h.type === type)!.title;
      const count = sectionItems.filter((item) => item.type === type).length;
      if (!seen.includes(type)) findings.push({ index: at, detail: `checkpoint has no #### ${title}` });
      else if (review) continue;
      else if (count < limits.translation.min || count > limits.translation.max) {
        findings.push({
          index: at,
          detail: `${count} ${title} item(s); this band teaches ${S} sections, use ${limits.translation.min}–${limits.translation.max}`,
        });
      }
    }
    const decisions = sectionItems.filter((item) => item.type !== "en-ag" && item.type !== "ag-en").length;
    if (!review && (decisions < limits.decision.min || decisions > limits.decision.max)) {
      findings.push({
        index: at,
        detail: `${decisions} decision item(s) (Pick one / Fix it / What changes); this band teaches ${S} sections, use ${limits.decision.min}–${limits.decision.max}`,
      });
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
    spoiler.push({ text: kind === "agebon" ? trimmed.slice(1, -1) : trimmed, index, kind });
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
  if (/^`[^`]+`$/.test(trimmed)) return "agebon";
  if (ALSO_RE.test(trimmed)) return "also";
  if (RULE_RE.test(trimmed)) return "rule";
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

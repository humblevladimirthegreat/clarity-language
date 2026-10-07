/**
 * Rules for converted checkpoint items (docs/meta/translation-exercises.md#item-types):
 * **Pick one**, **Fix it**, **What changes**, and **Also correct:** variants. Morph lines are
 * compared to the parser in [morph-gloss-docs.ts](morph-gloss-docs.ts); this file checks
 * that each item has its parts, that its forms parse, and how its forms relate.
 */
import type { ClassifyTables } from "../parse/classify.js";
import { normalizeAgazan } from "../parse/morph-gloss.js";
import { parseWithTables } from "../parse/parse-core.js";
import type { LexWord } from "../parse/types.js";
import { compareReadings } from "./reading-equivalence.js";
import { ERROR_MARKER, practiceItems, type PracticeItem, type SpoilerLine } from "./practice-items.js";

export type PracticeItemFinding = { index: number; detail: string };

export function lintPracticeItems(markdown: string, tables: ClassifyTables, options: { review?: boolean } = {}): PracticeItemFinding[] {
  const { items, findings } = practiceItems(markdown, options);
  const out: PracticeItemFinding[] = [...findings];
  for (const item of items) {
    const push = (detail: string, index = item.index) => out.push({ index, detail: `${LABEL[item.type]} ${item.number}: ${detail}` });
    if (item.alsoCorrect.length > 0 && item.type !== "en-ag") push("**Also correct:** belongs only in English → Agazan answers");
    switch (item.type) {
      case "en-ag":
        lintAlsoCorrect(item, tables, push);
        break;
      case "pick":
        lintPickOne(item, tables, push);
        break;
      case "fix":
        lintFixIt(item, tables, push);
        break;
      case "changes":
        lintWhatChanges(item, tables, push);
        break;
    }
  }
  return out;
}

const LABEL: Record<PracticeItem["type"], string> = {
  "en-ag": "English → Agazan",
  "ag-en": "Agazan → English",
  pick: "Pick one",
  fix: "Fix it",
  changes: "What changes",
};

type Push = (detail: string, index?: number) => void;

function lintAlsoCorrect(item: PracticeItem, tables: ClassifyTables, push: Push): void {
  if (item.alsoCorrect.length === 0) return;
  const answer = item.spoiler.find((line) => line.kind === "agazan");
  if (!answer) return push("**Also correct:** with no Agazan answer line");
  // A level review answer ends with its **Rule:** link, after **Also correct:**.
  const last = item.spoiler.filter((line) => line.kind !== "rule").at(-1);
  if (last?.kind !== "also") push("**Also correct:** must be the last line of the answer (before **Rule:** in a level review)");
  for (const variant of item.alsoCorrect) {
    if (same(variant.text, answer.text)) {
      push(`variant \`${variant.text}\` repeats the main answer`, variant.index);
      continue;
    }
    const compare = compareReadings(answer.text, variant.text, tables);
    if (compare.error) push(`does not parse (${compare.error})`, variant.index);
    else if (!compare.same) push(`variant \`${variant.text}\` has a different morph reading from \`${answer.text}\``, variant.index);
  }
}

/** English, two forms that differ only in the decision; answer: the right form, its morph, one line on why. */
function lintPickOne(item: PracticeItem, tables: ClassifyTables, push: Push): void {
  if (!item.promptEnglish) push("prompt needs the English sentence");
  if (item.promptSpans.length !== 2) return push(`prompt needs two Agazan forms, found ${item.promptSpans.length}`);
  const [a, b] = item.promptSpans as [PracticeItem["promptSpans"][0], PracticeItem["promptSpans"][0]];
  const compare = compareReadings(a.text, b.text, tables);
  if (compare.error) push(`both forms must parse (${compare.error})`);
  else if (compare.same) push("the two forms have the same reading, so neither is wrong");
  else if (!sameMultiset(contentRoots(a.text, tables), contentRoots(b.text, tables))) {
    push("the two forms use different content roots; they should differ only in this stage's decision");
  }
  const { answer, morphs, prose } = answerParts(item.spoiler);
  if (!answer) push("answer needs the right form as an Agazan line");
  else if (!same(answer.text, a.text) && !same(answer.text, b.text)) push(`answer \`${answer.text}\` is neither prompt form`, answer.index);
  if (morphs.length === 0) push("answer needs a morph line after the right form");
  if (prose.length === 0) push("answer needs one line on why");
}

/** English meaning and the wrong form; answer: the corrected form, its morph, one line naming the error. */
function lintFixIt(item: PracticeItem, tables: ClassifyTables, push: Push): void {
  if (!item.promptEnglish) push("prompt needs the English meaning");
  if (item.promptSpans.length !== 1) return push(`prompt needs one Agazan sentence, found ${item.promptSpans.length}`);
  const wrong = item.promptSpans[0]!;
  if (wrong.marker !== ERROR_MARKER) push(`mark the wrong form <!-- ${ERROR_MARKER} -->`, wrong.index);
  const { answer, morphs, prose } = answerParts(item.spoiler);
  if (!answer) push("answer needs the corrected sentence as an Agazan line");
  if (morphs.length === 0) push("answer needs a morph line after the corrected sentence");
  if (prose.length === 0) push("answer needs one line naming the error");
  if (!answer) return;
  if (same(wrong.text, answer.text)) return push("the corrected sentence is the same as the wrong one", answer.index);
  const error = parseError(answer.text, tables);
  if (error) return push(`corrected sentence does not parse (${error})`, answer.index);
  // A wrong form the parser rejects is fine; one that parses must read differently.
  if (compareReadings(answer.text, wrong.text, tables).same) {
    push("the wrong form has the same reading as the correction, so nothing is wrong", wrong.index);
  }
}

/** Two forms that differ in one morph; answer: a morph line for each, then the difference in plain English. */
function lintWhatChanges(item: PracticeItem, tables: ClassifyTables, push: Push): void {
  if (item.promptSpans.length !== 2) return push(`prompt needs two Agazan sentences, found ${item.promptSpans.length}`);
  const [a, b] = item.promptSpans.map((s) => s.text) as [string, string];
  for (const text of [a, b]) {
    const error = parseError(text, tables);
    if (error) push(`\`${text}\` does not parse (${error})`);
  }
  const wa = words(a);
  const wb = words(b);
  const differ = wa.length === wb.length ? wa.filter((w, i) => w !== wb[i]).length : -1;
  if (differ !== 1) push("the two sentences must differ in exactly one word, in the same order");
  const lines = item.spoiler.filter((line) => line.kind === "text" || line.kind === "english");
  if (item.spoiler.some((line) => line.kind === "agazan")) push("answer gives morph lines and English, not Agazan lines");
  if (lines.length < 3 || lines[0]!.kind !== "text" || lines[1]!.kind !== "text") push("answer needs a morph line for each sentence, then the difference in plain English");
}

/** The first Agazan line, the morph line right after it, and the prose lines after that. */
function answerParts(spoiler: readonly SpoilerLine[]): { answer?: SpoilerLine; morphs: SpoilerLine[]; prose: SpoilerLine[] } {
  const at = spoiler.findIndex((line) => line.kind === "agazan");
  if (at < 0) return { morphs: [], prose: [] };
  const rest = spoiler.slice(at + 1).filter((line) => line.kind === "text" || line.kind === "english");
  const morphs = rest[0]?.kind === "text" ? rest.slice(0, 1) : [];
  return { answer: spoiler[at], morphs, prose: rest.slice(morphs.length) };
}

function same(a: string, b: string): boolean {
  return normalizeAgazan(a) === normalizeAgazan(b);
}

function words(text: string): string[] {
  return normalizeAgazan(text).split(/\s+/);
}

function parseError(text: string, tables: ClassifyTables): string | undefined {
  try {
    parseWithTables(text.normalize("NFC").trim(), tables);
    return undefined;
  } catch (error) {
    return (error instanceof Error ? error.message : String(error)).split("\n")[0]!;
  }
}

/** Content roots of every word in a sentence, sorted. */
function contentRoots(text: string, tables: ClassifyTables): string[] {
  const roots: string[] = [];
  const visit = (value: unknown): void => {
    if (value === null || typeof value !== "object") return;
    if (Array.isArray(value)) return value.forEach(visit);
    const word = value as Partial<LexWord>;
    if (typeof word.raw === "string") roots.push(...familyRoots(word.family));
    for (const child of Object.values(value)) visit(child);
  };
  visit(parseWithTables(text.normalize("NFC").trim(), tables).utterances);
  return roots.sort();
}

/** The content roots a word spells: a plain stem, the host and right roots of an x-family word, a hook compound's left word. */
function familyRoots(family: LexWord["family"] | undefined): string[] {
  switch (family?.kind) {
    case "content":
      return family.roots;
    case "x":
      return [...family.leftRoots, ...(family.rightRoots ?? [])];
    case "hookCompound":
      return [family.leftRoot];
    default:
      return [];
  }
}

function sameMultiset(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

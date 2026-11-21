/**
 * Overlay examples for flashcards (`vocab-flashcards.md`, overlay notes): each overlay row's example is the
 * shortest code span in its anchor section whose parse uses the overlay in the row's slot, else the shortest
 * from the rest of the anchor's page before the row's checkpoint. Spans are read the way the docs lint reads them
 * ({@link walkAgebenSpans}); only sentences and phrases count, so a lone citation is never an example.
 */
import { anchorCheckpoint, type FlashcardInputs } from "./flashcards.js";
import type { OverlayRow } from "./lexicon-search.js";
import { classifyAgebenSpan, walkAgebenSpans } from "./lint/ageben-docs.js";
import { visitResult } from "./parse/ast-walk.js";
import type { ClassifyTables } from "./parse/classify.js";
import { morphGlossLine } from "./parse/morph-gloss.js";
import { parseWithTables } from "./parse/parse-core.js";
import type { LexWord } from "./parse/types.js";

/** A page span that parses, with the overlay slots (`sense_form@pos`) its words use. */
type ParsedSpan = { text: string; index: number; slots: Set<string> };

export type OverlayExample = {
  /** The span text, trimmed. */
  text: string;
  /** Offset of the span in its page. */
  index: number;
  /** `section` when found in the anchor section, `page` when found elsewhere on the page before the checkpoint. */
  from: "section" | "page";
  /** Morph gloss of the example, from the parser. */
  gloss: string;
};

export function overlaySlot(senseForm: string, pos: string): string {
  return `${senseForm}@${pos}`;
}

/** Key of an overlay row in the map {@link overlayExamples} returns. */
export function overlayRowKey(row: Pick<OverlayRow, "senseForm" | "pos" | "anchor">): string {
  return `${overlaySlot(row.senseForm, row.pos)} ${row.anchor}`;
}

function wordSlot(word: LexWord): string | undefined {
  const overlay = word.overlay ?? word.hostOverlay;
  return overlay ? overlaySlot(overlay.senseForm, overlay.pos) : undefined;
}

/** Every sentence or phrase span on a page that parses, with the overlay slots it uses. */
function parsedSpans(text: string, tables: ClassifyTables): ParsedSpan[] {
  const out: ParsedSpan[] = [];
  const visit = (span: string, index: number) => {
    const cls = classifyAgebenSpan(span);
    if (cls !== "sentence" && cls !== "phrase") return;
    const slots = new Set<string>();
    try {
      const add = (word: LexWord) => {
        const slot = wordSlot(word);
        if (slot) slots.add(slot);
      };
      visitResult(parseWithTables(span.trim(), tables), { word: add, join: add });
    } catch {
      return;
    }
    if (slots.size) out.push({ text: span.trim(), index, slots });
  };
  walkAgebenSpans(text, { text: visit, moved: visit });
  return out;
}

function shortest(spans: readonly ParsedSpan[]): ParsedSpan | undefined {
  let best: ParsedSpan | undefined;
  for (const span of spans) if (!best || span.text.length < best.text.length) best = span;
  return best;
}

/**
 * Example per overlay row, keyed by {@link overlayRowKey}. A row with no anchor section, no checkpoint, or no
 * span using its slot is absent.
 */
export function overlayExamples(
  rows: readonly OverlayRow[],
  inputs: Pick<FlashcardInputs, "checkpoints" | "anchorSection" | "pageText">,
  tables: ClassifyTables,
): Map<string, OverlayExample> {
  const pages = new Map<string, ParsedSpan[]>();
  const spansOf = (page: string) => {
    if (!pages.has(page)) pages.set(page, parsedSpans(inputs.pageText(page), tables));
    return pages.get(page)!;
  };
  const out = new Map<string, OverlayExample>();
  for (const row of rows) {
    const section = inputs.anchorSection(row.anchor);
    const checkpoint = anchorCheckpoint(row.anchor, inputs);
    if (!section || !checkpoint) continue;
    const page = checkpoint.page;
    const text = inputs.pageText(page);
    const line = inputs.checkpoints.find((c) => c.anchor === checkpoint.anchor)!.line;
    const cpOffset = text.split("\n").slice(0, line - 1).join("\n").length;
    const slot = overlaySlot(row.senseForm, row.pos);
    const using = spansOf(page).filter((s) => s.slots.has(slot));
    const inSection = shortest(using.filter((s) => s.index >= section.offset && s.index < section.end));
    const found = inSection ?? shortest(using.filter((s) => s.index < cpOffset && (s.index < section.offset || s.index >= section.end)));
    if (!found) continue;
    out.set(overlayRowKey(row), {
      text: found.text,
      index: found.index,
      from: inSection ? "section" : "page",
      // The same glosser, in the same strict mode, that checks morph glosses on grammar pages (lint/morph-gloss-docs.ts).
      gloss: morphGlossLine(found.text, tables, { strict: true }),
    });
  }
  return out;
}

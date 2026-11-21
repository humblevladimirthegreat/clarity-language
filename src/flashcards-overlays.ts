/**
 * Ageben overlay word notes (`vocab-flashcards.md`, overlay notes): one note per sense form at the first
 * checkpoint that drills it. The rows of the form that map to that checkpoint fold in; where their
 * definitions differ, the note lists them per slot. Rows an ending note covers ({@link coveredByEndingNote})
 * get no word note. Rows at later checkpoints are slot notes, built elsewhere.
 */
import { anchorCheckpoint, coveredByEndingNote, noteGuid, type AnchorCheckpoint, type FlashcardInputs, type OverlayNote } from "./flashcards.js";
import { overlayExamples, overlayRowKey, overlaySlot, type OverlayExample } from "./flashcards-examples.js";
import { senseFormRoot, type OverlayRow, type PublishedRow } from "./lexicon-search.js";
import { visitResult } from "./parse/ast-walk.js";
import type { ClassifyTables } from "./parse/classify.js";
import { loadDefaultTables } from "./parse/index.js";
import { parseWithTables } from "./parse/parse-core.js";
import type { LexWord } from "./parse/types.js";

/** Public grammar site: a page is `<page>.html` under it (`scripts/lib/llms-txt.ts` `SITE_ORIGIN`, VitePress `base`). */
const GRAMMAR_URL = "https://clarityconlang.com/grammar/";

export type OverlayNoteInputs = Pick<FlashcardInputs, "overlays" | "published" | "checkpoints" | "anchorSection" | "pageText">;

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Public URL of a `page.md#id` anchor. */
export function anchorUrl(anchor: string): string {
  const [page, id] = anchor.split("#") as [string, string | undefined];
  return `${GRAMMAR_URL}${page.replace(/\.md$/, ".html")}${id ? `#${id}` : ""}`;
}

/**
 * The example as HTML with the word that uses one of `slots` (`sense_form@pos`) wrapped in
 * `<span class="overlay">`. Words are found in the text left to right, in parse order.
 */
export function highlightExample(text: string, slots: ReadonlySet<string>, tables: ClassifyTables): string {
  const words: LexWord[] = [];
  const add = (word: LexWord) => {
    if (word.at !== undefined && !words.some((w) => w.at === word.at)) words.push(word);
  };
  visitResult(parseWithTables(text, tables), { word: add, join: add });
  words.sort((a, b) => a.at! - b.at!);
  const lower = text.toLowerCase();
  let cursor = 0;
  for (const word of words) {
    const at = lower.indexOf(word.raw.toLowerCase(), cursor);
    if (at < 0) break;
    const overlay = word.overlay ?? word.hostOverlay;
    if (overlay && slots.has(overlaySlot(overlay.senseForm, overlay.pos))) {
      const end = at + word.raw.length;
      return `${escapeHtml(text.slice(0, at))}<span class="overlay">${escapeHtml(text.slice(at, end))}</span>${escapeHtml(text.slice(end))}`;
    }
    cursor = at + word.raw.length;
  }
  throw new Error(`example \`${text}\`: no word uses ${[...slots].join(", ")}`);
}

/** Per-slot readings as HTML, one line per distinct definition (`th / g`); empty when all slots read alike. */
export function slotReadings(rows: readonly Pick<OverlayRow, "pos" | "definition">[]): string {
  const bySense = new Map<string, string[]>();
  for (const row of rows) {
    const slots = bySense.get(row.definition) ?? [];
    if (!slots.includes(row.pos)) slots.push(row.pos);
    bySense.set(row.definition, slots);
  }
  if (bySense.size < 2) return "";
  return [...bySense].map(([definition, slots]) => `<div class="line"><span class="label">${escapeHtml(slots.join(" / "))}</span>${escapeHtml(definition)}</div>`).join("");
}

/** Host line: the sense form's root and its concrete sense, when the root is published (bare-vowel forms have none). */
export function hostLine(senseForm: string, published: readonly Pick<PublishedRow, "root" | "concrete">[]): string {
  const root = senseFormRoot(senseForm);
  const row = published.find((r) => r.root === root);
  return row ? `${root} (${row.concrete})` : "";
}

/** The GUID gloss of a word note: its rows' distinct glosses, sorted, so row order never changes it. */
export function wordNoteGloss(rows: readonly Pick<OverlayRow, "gloss">[]): string {
  return [...new Set(rows.map((r) => r.gloss))].sort().join(" / ");
}

/**
 * One Ageben overlay word note per sense form, in checkpoint order, then CSV order. `examples` defaults to
 * {@link overlayExamples} over the inputs; pass it to reuse one computation.
 */
export function overlayWordNotes(inputs: OverlayNoteInputs, examples?: ReadonlyMap<string, OverlayExample>, tables: ClassifyTables = loadDefaultTables()): OverlayNote[] {
  const found = examples ?? overlayExamples(inputs.overlays, inputs, tables);
  const checkpointIndex = new Map(inputs.checkpoints.map((c, i) => [c.anchor, i]));
  const bySense = new Map<string, { row: OverlayRow; cp: AnchorCheckpoint; order: number }[]>();
  inputs.overlays.forEach((row, order) => {
    if (coveredByEndingNote(row)) return;
    const cp = anchorCheckpoint(row.anchor, inputs);
    if (!cp) throw new Error(`overlay ${row.senseForm}@${row.pos}: anchor ${row.anchor} maps to no checkpoint`);
    bySense.set(row.senseForm, [...(bySense.get(row.senseForm) ?? []), { row, cp, order }]);
  });
  const notes: { note: OverlayNote; at: number; order: number }[] = [];
  for (const [senseForm, all] of bySense) {
    const at = Math.min(...all.map((r) => checkpointIndex.get(r.cp.anchor)!));
    const here = all.filter((r) => checkpointIndex.get(r.cp.anchor) === at);
    const rows = here.map((r) => r.row);
    const { cp } = here[0]!;
    const kinds = new Set(rows.map((r) => r.kind));
    if (kinds.size > 1) throw new Error(`overlay ${senseForm}: rows at ${cp.anchor} disagree on kind (${[...kinds].join(", ")})`);
    const lead = rows.find((r) => found.has(overlayRowKey(r)));
    if (!lead) throw new Error(`overlay ${senseForm}: no example for any row at ${cp.anchor}`);
    const example = found.get(overlayRowKey(lead))!;
    const gloss = wordNoteGloss(rows);
    notes.push({
      at,
      order: here[0]!.order,
      note: {
        source: "overlay",
        model: "Ageben overlay",
        key: senseForm,
        guid: noteGuid("overlay", senseForm, gloss),
        fields: {
          example: highlightExample(example.text, new Set([overlaySlot(lead.senseForm, lead.pos)]), tables),
          form: senseForm,
          definition: lead.definition,
          readings: slotReadings(rows),
          host: hostLine(senseForm, inputs.published),
          slot_of: "",
          gloss: example.gloss,
          link: anchorUrl(lead.anchor),
          // The example's row: folded rows of one form share the mnemonic's image, so a join repeats it.
          mnemonic: lead.mnemonic,
          kind: lead.kind,
        },
        tags: [
          "ageben::overlay",
          `ageben::overlay::${lead.kind}`,
          ...[...new Set(rows.map((r) => r.pos))].map((pos) => `ageben::pos::${pos}`),
          `ageben::stage::${cp.band}`,
          cp.tag,
        ],
        core: "",
      },
    });
  }
  return notes.sort((a, b) => a.at - b.at || a.order - b.order).map((n) => n.note);
}

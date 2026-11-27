/**
 * Ageben overlay word notes (`vocab-flashcards.md`, overlay notes): one note per sense form at the first
 * checkpoint that drills it. The rows of the form that map to that checkpoint fold in; where their
 * definitions differ, the note lists them per slot. Rows an ending note covers ({@link coveredByEndingNote})
 * get no word note. Rows at a later checkpoint that teach the form a new slot make a slot note there.
 */
import { anchorCheckpoint, coveredByEndingNote, noteGuid, type AnchorCheckpoint, type FlashcardInputs, type OverlayNote } from "./flashcards.js";
import { overlayExamples, overlayRowKey, overlaySlot, type OverlayExample } from "./flashcards-examples.js";
import { letterTablesFor, lettersHtml, wordLetters } from "./flashcards-letters.js";
import type { OverlayRow } from "./lexicon-search.js";
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

/** The word a highlighted example marks: the letters are explained as the card shows them (a sake word with its stance). */
function highlightedWord(html: string): string {
  const word = /<span class="overlay">([^<]+)<\/span>/.exec(html)?.[1];
  if (!word) throw new Error(`no highlighted word in ${html}`);
  return word;
}

/** The GUID gloss of a word note: its rows' distinct glosses, sorted, so row order never changes it. */
export function wordNoteGloss(rows: readonly Pick<OverlayRow, "gloss">[]): string {
  return [...new Set(rows.map((r) => r.gloss))].sort().join(" / ");
}

/** A slot note's key and GUID spelling: the sense form at the checkpoint's page, `ezem@more-hinges`. */
export function slotNoteKey(senseForm: string, page: string): string {
  return `${senseForm}@${page.replace(/\.md$/, "")}`;
}

/**
 * True when a row's slot is taught by its ending set's `-m` form: an `-l` / `-r` sense form whose `-m`
 * sibling of the same kind takes the same slot, and whose reading carries over (its gloss there is one of
 * `taughtGlosses`, its glosses in slots already taught). A form whose gloss changes in the new slot keeps
 * its own slot note (`ewel` cite: *like*, taught as *exactly-like*).
 */
export function slotTaughtByMForm(
  row: Pick<OverlayRow, "senseForm" | "pos" | "kind" | "gloss">,
  overlays: readonly Pick<OverlayRow, "senseForm" | "pos" | "kind">[],
  taughtGlosses: ReadonlySet<string>,
): boolean {
  if (!/[lr]$/.test(row.senseForm) || !taughtGlosses.has(row.gloss)) return false;
  const m = `${row.senseForm.slice(0, -1)}m`;
  return overlays.some((r) => r.senseForm === m && r.kind === row.kind && r.pos === row.pos);
}

type PlacedRow = { row: OverlayRow; cp: AnchorCheckpoint; at: number; order: number };

/** Rows an ending note does not cover, by sense form in CSV order, each with its checkpoint and index. */
function placedRows(inputs: OverlayNoteInputs): Map<string, PlacedRow[]> {
  const checkpointIndex = new Map(inputs.checkpoints.map((c, i) => [c.anchor, i]));
  const bySense = new Map<string, PlacedRow[]>();
  inputs.overlays.forEach((row, order) => {
    if (coveredByEndingNote(row)) return;
    const cp = anchorCheckpoint(row.anchor, inputs);
    if (!cp) throw new Error(`overlay ${row.senseForm}@${row.pos}: anchor ${row.anchor} maps to no checkpoint`);
    bySense.set(row.senseForm, [...(bySense.get(row.senseForm) ?? []), { row, cp, at: checkpointIndex.get(cp.anchor)!, order }]);
  });
  return bySense;
}

/** An overlay note from the rows of one sense form at one checkpoint: a word note, or a slot note when `slot` is given. */
function overlayNote(
  senseForm: string,
  here: readonly PlacedRow[],
  inputs: OverlayNoteInputs,
  found: ReadonlyMap<string, OverlayExample>,
  tables: ClassifyTables,
  slot?: { of: OverlayNote },
): OverlayNote {
  const rows = here.map((r) => r.row);
  const { cp } = here[0]!;
  const kinds = new Set(rows.map((r) => r.kind));
  if (kinds.size > 1) throw new Error(`overlay ${senseForm}: rows at ${cp.anchor} disagree on kind (${[...kinds].join(", ")})`);
  const lead = rows.find((r) => found.has(overlayRowKey(r)));
  if (!lead) throw new Error(`overlay ${senseForm}: no example for any row at ${cp.anchor}`);
  const example = found.get(overlayRowKey(lead))!;
  const key = slot ? slotNoteKey(senseForm, cp.page) : senseForm;
  const highlighted = highlightExample(example.text, new Set([overlaySlot(lead.senseForm, lead.pos)]), tables);
  return {
    source: "overlay",
    model: "Ageben overlay",
    key,
    guid: noteGuid("overlay", key, wordNoteGloss(rows)),
    fields: {
      example: highlighted,
      form: senseForm,
      definition: lead.definition,
      readings: slotReadings(rows),
      host: lettersHtml(wordLetters(highlightedWord(highlighted), new Map(inputs.published.map((r) => [r.root, r])), letterTablesFor(inputs.pageText), { overlayKind: lead.kind })),
      slot_of: slot ? `${slot.of.fields.form} · ${slot.of.fields.definition}` : "",
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
  };
}

/** Notes sorted by checkpoint, then by their first row's CSV order. */
function byCheckpoint(notes: { note: OverlayNote; at: number; order: number }[]): OverlayNote[] {
  return notes.sort((a, b) => a.at - b.at || a.order - b.order).map((n) => n.note);
}

/**
 * One Ageben overlay word note per sense form, in checkpoint order, then CSV order. `examples` defaults to
 * {@link overlayExamples} over the inputs; pass it to reuse one computation.
 */
export function overlayWordNotes(inputs: OverlayNoteInputs, examples?: ReadonlyMap<string, OverlayExample>, tables: ClassifyTables = loadDefaultTables()): OverlayNote[] {
  const found = examples ?? overlayExamples(inputs.overlays, inputs, tables);
  const notes: { note: OverlayNote; at: number; order: number }[] = [];
  for (const [senseForm, all] of placedRows(inputs)) {
    const at = Math.min(...all.map((r) => r.at));
    const here = all.filter((r) => r.at === at);
    notes.push({ at, order: here[0]!.order, note: overlayNote(senseForm, here, inputs, found, tables) });
  }
  return byCheckpoint(notes);
}

/**
 * One Ageben overlay slot note per later checkpoint that puts a known sense form in a new slot: the form's
 * rows there whose slot no earlier checkpoint taught fold in, as on a word note, and `slot_of` names the
 * word note. An `-l` / `-r` row whose `-m` sibling takes the slot with the reading it already has gets
 * none ({@link slotTaughtByMForm}). `wordNotes` are {@link overlayWordNotes} over the same inputs.
 */
export function overlaySlotNotes(
  inputs: OverlayNoteInputs,
  wordNotes: readonly OverlayNote[],
  examples?: ReadonlyMap<string, OverlayExample>,
  tables: ClassifyTables = loadDefaultTables(),
): OverlayNote[] {
  const found = examples ?? overlayExamples(inputs.overlays, inputs, tables);
  const wordNote = new Map(wordNotes.map((n) => [n.key, n]));
  const notes: { note: OverlayNote; at: number; order: number }[] = [];
  const keys = new Set<string>();
  for (const [senseForm, all] of placedRows(inputs)) {
    const first = Math.min(...all.map((r) => r.at));
    const later = [...new Set(all.map((r) => r.at))].filter((at) => at > first).sort((a, b) => a - b);
    for (const at of later) {
      const earlier = all.filter((r) => r.at < at);
      const known = new Set(earlier.map((r) => r.row.pos));
      const taught = new Set(earlier.map((r) => r.row.gloss));
      const here = all.filter((r) => r.at === at && !known.has(r.row.pos) && !slotTaughtByMForm(r.row, inputs.overlays, taught));
      if (here.length === 0) continue;
      const of = wordNote.get(senseForm);
      if (!of) throw new Error(`overlay ${senseForm}: slot rows at ${here[0]!.cp.anchor} but no word note`);
      const note = overlayNote(senseForm, here, inputs, found, tables, { of });
      if (keys.has(note.key)) throw new Error(`overlay slot note ${note.key}: two checkpoints on one page`);
      keys.add(note.key);
      notes.push({ at, order: here[0]!.order, note });
    }
  }
  return byCheckpoint(notes);
}

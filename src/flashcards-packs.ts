/**
 * Ageben packs: the Beginner, Intermediate and Advanced band packs, one subdeck per sidebar unit, and the
 * Everything lookup pack; and the Anki-importable TSV of a pack, one file per note type.
 */
import { advancedUnits, beginnerUnits, intermediateUnits, type Unit } from "../docs/grammar/.vitepress/lib/reading-order.js";
import { SCALE_NOTE_KEY } from "./flashcards-endings.js";
import {
  checkpointTag,
  deckId,
  fieldValues,
  LEXICON_MODEL,
  NOTE_FIELDS,
  OVERLAY_FIELDS,
  OVERLAY_MODEL,
  SET_FIELDS,
  SET_MODEL,
  type FlashcardInputs,
  type FlashcardNote,
  type FlashcardNotes,
  type LexiconPackId,
  type Pack,
  type PackDeck,
} from "./flashcards.js";
import type { Band } from "./lint/learning-order.js";

const DECK_ROOT = "Ageben";

/** Band pack names, numbered so Anki lists them in band order: `Ageben::1 Beginner::…`. */
export const BAND_PACK_NAMES: Record<Band, string> = { beginner: "1 Beginner", intermediate: "2 Intermediate", advanced: "3 Advanced" };

/** A sidebar unit: its band, 1-based place in the band, sidebar title, and pages (`clause.md`). */
export type PackUnit = { band: Band; number: number; title: string; pages: readonly string[] };

/** The sidebar units of every band, from `reading-order.ts`. */
export function packUnits(bands: Record<Band, readonly Unit[]> = { beginner: beginnerUnits, intermediate: intermediateUnits, advanced: advancedUnits }): PackUnit[] {
  return (Object.entries(bands) as [Band, readonly Unit[]][]).flatMap(([band, units]) =>
    units.map((unit, i) => ({ band, number: i + 1, title: unit.text, pages: unit.items.map((item) => `${item.link.replace(/^\//, "").replace(/[?#].*$/, "")}.md`) })),
  );
}

/** Deck name of a unit's subdeck: `Ageben::1 Beginner::04 Why and what for`. */
export function unitDeckName(unit: PackUnit): string {
  return `${DECK_ROOT}::${BAND_PACK_NAMES[unit.band]}::${String(unit.number).padStart(2, "0")} ${unit.title}`;
}

function deck(name: string, notes: FlashcardNote[]): PackDeck {
  const full = name.startsWith(`${DECK_ROOT}::`) ? name : `${DECK_ROOT}::${name}`;
  return { name: full, id: deckId(full), notes };
}

/** The unlock tag a note carries (`ageben::cp::<page>::<band>`), if any. */
function cpTagOf(note: FlashcardNote): string | undefined {
  return note.tags.find((t) => t.startsWith("ageben::cp::"));
}

/** The overlay kind a grammar note groups under; the scale note sits with the sake kind. */
function groupKind(note: FlashcardNote): string {
  if (note.model === OVERLAY_MODEL) return note.fields.kind;
  if (note.key === SCALE_NOTE_KEY) return "sake";
  if (note.tags.includes("ageben::names")) return "names";
  const tag = note.tags.find((t) => t.startsWith("ageben::overlay::"));
  if (!tag) throw new Error(`${note.source} ${note.key}: no overlay kind tag`);
  return tag.slice("ageben::overlay::".length);
}

/**
 * The notes one checkpoint first drills, in new-card order: core words (roots, then compounds), closed words,
 * then per overlay kind (in order of its first note) its word notes, slot notes, ending note (or the scale note), set note.
 */
export function checkpointNotes(notes: FlashcardNotes, checkpoint: { anchor: string; page: string; band: Band }): FlashcardNote[] {
  const tag = checkpointTag(checkpoint.page, checkpoint.band);
  const at = (list: readonly FlashcardNote[]) => list.filter((n) => cpTagOf(n) === tag);
  const core = [...notes.roots, ...notes.compounds].filter((n) => n.core === checkpoint.anchor);
  const groups = new Map<string, FlashcardNote[]>();
  for (const note of [...at(notes.overlays), ...at(notes.slots), ...at(notes.endings), ...at(notes.sets), ...at(notes.names)]) {
    const kind = groupKind(note);
    groups.set(kind, [...(groups.get(kind) ?? []), note]);
  }
  return [...core, ...at(notes.closed), ...[...groups.values()].flat()];
}

/**
 * A band pack: one subdeck per sidebar unit of the band, holding the notes of the unit's checkpoints in checkpoint
 * order. Units with no notes get no deck. Throws when a band checkpoint's page is in no unit of the band.
 */
export function bandPack(band: Band, notes: FlashcardNotes, inputs: Pick<FlashcardInputs, "checkpoints" | "units">): Pack {
  const units = inputs.units.filter((u) => u.band === band);
  const byUnit = new Map<PackUnit, FlashcardNote[]>();
  for (const checkpoint of inputs.checkpoints) {
    if (checkpoint.band !== band || checkpoint.review) continue;
    const here = checkpointNotes(notes, checkpoint);
    if (here.length === 0) continue;
    const unit = units.find((u) => u.pages.includes(checkpoint.page));
    if (!unit) throw new Error(`${checkpoint.anchor}: page is in no ${band} unit`);
    byUnit.set(unit, [...(byUnit.get(unit) ?? []), ...here]);
  }
  const decks = units.filter((u) => byUnit.has(u)).map((u) => deck(unitDeckName(u), byUnit.get(u)!));
  return { id: band, decks };
}

/** The Everything lookup pack: every root, compound, closed word and overlay word note, one deck per source. */
export function everythingPack(notes: FlashcardNotes): Pack {
  return {
    id: "everything",
    decks: [deck("Everything::Roots", notes.roots), deck("Everything::Compounds", notes.compounds), deck("Everything::Closed", notes.closed), deck("Everything::Overlays", notes.overlays)],
  };
}

export function buildPack(id: LexiconPackId, notes: FlashcardNotes, inputs: Pick<FlashcardInputs, "checkpoints" | "units">): Pack {
  return id === "everything" ? everythingPack(notes) : bandPack(id, notes, inputs);
}

/** Cards a note makes: two for lexicon and overlay notes (recognition, production), one per cloze number for set notes. */
export function noteCards(note: FlashcardNote): number {
  if (note.model !== SET_MODEL) return 2;
  return new Set([...note.fields.text.matchAll(/\{\{c(\d+)::/g)].map((m) => m[1])).size;
}

/** Per note type: its TSV file suffix, whether its file is HTML, the fields that already hold HTML, and its field order. */
const tsvTypes = () => [
  { model: LEXICON_MODEL, suffix: "", html: false, htmlFields: new Set<string>(), fields: NOTE_FIELDS },
  { model: OVERLAY_MODEL, suffix: "-overlay", html: true, htmlFields: new Set<string>(["example", "readings"]), fields: OVERLAY_FIELDS },
  { model: SET_MODEL, suffix: "-set", html: true, htmlFields: new Set<string>(["text"]), fields: SET_FIELDS },
] as const;

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Anki-importable TSVs of a pack, one per note type it holds: directive header, then one line per note
 * (deck, GUID, fields, tags). `suffix` goes before `.tsv` (empty for Ageben lexicon notes, `-overlay`, `-set`).
 * HTML files escape the plain fields as the packager does.
 */
export function packTsvs(pack: Pack): { model: string; suffix: string; text: string }[] {
  const clean = (s: string) => s.replace(/[\t\r\n]+/g, " ");
  const out: { model: string; suffix: string; text: string }[] = [];
  for (const type of tsvTypes()) {
    const rows: string[] = [];
    for (const d of pack.decks) {
      for (const note of d.notes) {
        if (note.model !== type.model) continue;
        const values = fieldValues(note).map((v, i) => (type.html && !type.htmlFields.has(type.fields[i]!) ? escapeHtml(v) : v));
        rows.push([d.name, note.guid, ...values, note.tags.join(" ")].map(clean).join("\t"));
      }
    }
    if (rows.length === 0) continue;
    const header = [
      "#separator:tab",
      `#html:${type.html}`,
      `#notetype:${type.model}`,
      "#deck column:1",
      "#guid column:2",
      `#tags column:${type.fields.length + 3}`,
      `#columns:deck\tguid\t${type.fields.join("\t")}\ttags`,
    ];
    out.push({ model: type.model, suffix: type.suffix, text: `${[...header, ...rows].join("\n")}\n` });
  }
  return out;
}

/**
 * Vocabulary flashcards: notes for Anki built from the lexicon CSVs (`vocab-flashcards.md`).
 * One note per published root, compound, closed word, overlay sense form and new overlay slot; packs filter the notes into
 * decks. The CSVs stay canonical: nothing here adds or rewrites a sense.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { loadClosedWords, type ClosedWordRow } from "./closed-words.js";
import { stageCheckpoints, type Checkpoint } from "./core-vocabulary.js";
import { parseCompoundCsv, type CompoundRow } from "./lexicon-compounds.js";
import { parseOverlayCsv, parsePublishedCsv, type OverlayRow, type PublishedRow } from "./lexicon-search.js";
import { overlayExamples, type OverlayExample } from "./flashcards-examples.js";
import { endingNotes } from "./flashcards-endings.js";
import { overlaySlotNotes, overlayWordNotes } from "./flashcards-overlays.js";
import { packUnits, type PackUnit } from "./flashcards-packs.js";
import { overlaySetNotes } from "./flashcards-sets.js";
import { pageSections, type Band, type PageSections } from "./lint/learning-order.js";
import { loadDefaultTables } from "./parse/index.js";
import { grammarFile, readData, REPO_ROOT } from "./repo-paths.js";

export type NoteSource = "root" | "compound" | "closed" | "overlay" | "set";

/** Note-type fields, in Anki field order. `kind` is the closed-word kind on closed words, empty on roots and compounds. */
export const NOTE_FIELDS = ["front", "concrete", "abstract", "aliases", "parts", "mnemonic", "kind"] as const;

export type NoteFields = Record<(typeof NOTE_FIELDS)[number], string>;

type NoteBase = {
  source: NoteSource;
  /** Stable key: published `root`, compound `stem`, closed-word `form`, or overlay `sense_form`. */
  key: string;
  guid: string;
  tags: string[];
  /** The `core` cell (roots and compounds); empty when not core. */
  core: string;
};

/** A root, compound or closed word: the Ageben lexicon note type. */
export type LexiconNote = NoteBase & { model: typeof LEXICON_MODEL; fields: NoteFields };
export type OverlayNoteFields = Record<(typeof OVERLAY_FIELDS)[number], string>;
/** An overlay word note: the Ageben overlay note type. */
export type OverlayNote = NoteBase & { model: typeof OVERLAY_MODEL; fields: OverlayNoteFields };
export type SetNoteFields = Record<(typeof SET_FIELDS)[number], string>;
/** A cloze over a set of members: the Ageben set note type (scale and ending notes). */
export type SetNote = NoteBase & { model: typeof SET_MODEL; fields: SetNoteFields };
export type FlashcardNote = LexiconNote | OverlayNote | SetNote;

/**
 * `closed` are the closed function words (`data/closed-words.csv`), in checkpoint order;
 * `overlays` are word notes; `slots` are slot notes, a known form in a new slot at a later checkpoint;
 * `sets` are set notes over word notes (`flashcards-sets.ts`), each after its members;
 * `endings` are the scale note and the ending notes (`flashcards-endings.ts`).
 */
export type FlashcardNotes = { roots: LexiconNote[]; compounds: LexiconNote[]; closed: LexiconNote[]; overlays: OverlayNote[]; slots: OverlayNote[]; sets: SetNote[]; endings: SetNote[] };

/** A note's field values in its note type's field order. */
export function fieldValues(note: FlashcardNote): string[] {
  if (note.model === OVERLAY_MODEL) return OVERLAY_FIELDS.map((f) => note.fields[f]);
  if (note.model === SET_MODEL) return SET_FIELDS.map((f) => note.fields[f]);
  return NOTE_FIELDS.map((f) => note.fields[f]);
}

export type FlashcardInputs = {
  published: readonly PublishedRow[];
  compounds: readonly CompoundRow[];
  overlays: readonly OverlayRow[];
  closedWords: readonly ClosedWordRow[];
  checkpoints: readonly Checkpoint[];
  /** Band of the section a `page.md#id` anchor lands in. */
  anchorBand: (anchor: string) => Band | undefined;
  /** Band, 1-based heading line, and `[offset, end)` in the page text of the section a `page.md#id` anchor lands in. */
  anchorSection: (anchor: string) => { band: Band | undefined; line: number; offset: number; end: number } | undefined;
  /** Markdown of a grammar page. */
  pageText: (page: string) => string;
  /** Sidebar units of every band, which name the band packs' subdecks (`flashcards-packs.ts`). */
  units: readonly PackUnit[];
};

/** The three band packs, the Everything lookup pack, and the Claritish pack. */
export const PACK_IDS = ["beginner", "intermediate", "advanced", "everything", "claritish"] as const;
export type PackId = (typeof PACK_IDS)[number];
/** Packs built from these notes (`flashcards-packs.ts`); `claritish` has its own note type (`flashcards-claritish.ts`). */
export type LexiconPackId = Exclude<PackId, "claritish">;

export type PackDeck = { name: string; id: number; notes: FlashcardNote[] };
export type Pack = { id: LexiconPackId; decks: PackDeck[] };

/** Note types `scripts/flashcards-package.py` builds, by name, with their field order. */
export const LEXICON_MODEL = "Ageben lexicon" as const;
export const OVERLAY_MODEL = "Ageben overlay" as const;
/** `example` is HTML with the overlay word in `<span class="overlay">`; `readings` is HTML. */
export const OVERLAY_FIELDS = ["example", "form", "definition", "readings", "host", "slot_of", "gloss", "link", "mnemonic", "kind"] as const;
/** Anki Cloze type; `text` is the cloze HTML, one `{{cN::…}}` per member. */
export const SET_MODEL = "Ageben set" as const;
export const SET_FIELDS = ["text", "title", "link", "mnemonic"] as const;

/** A note in the pack JSON; `model` names its note type when it is not the pack's default. */
export type PackJsonNote = { guid: string; fields: string[]; tags: string[]; model?: string };
/**
 * The JSON `scripts/flashcards-package.py` packages: the default note type and its field order,
 * the field order of any other type a note names (`modelFields`), and the decks.
 */
export type PackJson = {
  model: string;
  fields: readonly string[];
  modelFields?: Record<string, readonly string[]>;
  decks: { name: string; id: number; notes: PackJsonNote[] }[];
};

/** The pack JSON of a lexicon pack: Ageben lexicon notes by default; overlay and set notes name their own type. */
export function packJson(pack: Pack): PackJson {
  const has = (model: string) => pack.decks.some((d) => d.notes.some((n) => n.model === model));
  const modelFields = Object.fromEntries(
    ([[OVERLAY_MODEL, OVERLAY_FIELDS], [SET_MODEL, SET_FIELDS]] as const).filter(([model]) => has(model)),
  ) as Record<string, readonly string[]>;
  return {
    model: LEXICON_MODEL,
    fields: NOTE_FIELDS,
    ...(Object.keys(modelFields).length > 0 ? { modelFields } : {}),
    decks: pack.decks.map((d) => ({
      name: d.name,
      id: d.id,
      notes: d.notes.map((n): PackJsonNote => ({ guid: n.guid, fields: fieldValues(n), tags: n.tags, ...(n.model === LEXICON_MODEL ? {} : { model: n.model }) })),
    })),
  };
}

/**
 * Anki GUID from the source, spelling and concrete gloss, never from row order. A respelling or a
 * new concrete gloss makes a new note; an edited alias, mnemonic, `core` cell or deck keeps it.
 */
export function noteGuid(source: NoteSource, spelling: string, gloss: string): string {
  return createHash("sha256").update(JSON.stringify(["ageben/v2", source, spelling, gloss])).digest("base64url").slice(0, 12);
}

/** First 8 hex of a hash of the note list without tags: changes only when note content changes. */
export function releaseId(notes: readonly FlashcardNote[]): string {
  const body = [...notes]
    .sort((a, b) => (a.guid < b.guid ? -1 : a.guid > b.guid ? 1 : 0))
    .map((n) => [n.source, n.guid, fieldValues(n), n.core]);
  return createHash("sha256").update(JSON.stringify(body)).digest("hex").slice(0, 8);
}

/** Tag every note with the release search tag `ageben::release::<id>`. */
export function releaseTag(notes: readonly FlashcardNote[]): string {
  return `ageben::release::${releaseId(notes)}`;
}

/** Stable Anki deck id from the deck name, in genanki's recommended range [2^30, 2^31). */
export function deckId(name: string): number {
  return (1 << 30) + (createHash("sha256").update(`ageben-deck/${name}`).digest().readUInt32BE(0) % (1 << 30));
}

/** Every note: roots, compounds, closed words, overlay word, slot and set notes, scale and ending notes. `examples` defaults to {@link overlayExamples} over the inputs. */
export function buildNotes(inputs: Omit<FlashcardInputs, "units">,examples?: ReadonlyMap<string, OverlayExample>): FlashcardNotes {
  const checkpointBand = new Map(inputs.checkpoints.map((c) => [c.anchor, c.band]));
  const coreTags = (source: NoteSource, key: string, cell: string | undefined): string[] => {
    if (!cell) return [];
    const band = checkpointBand.get(cell);
    if (!band) throw new Error(`${source} ${key}: core cell ${cell} names no stage checkpoint`);
    return [checkpointTag(cell.split("#")[0]!, band)];
  };
  const concreteOf = new Map(inputs.published.map((r) => [r.root, r.concrete]));
  const empty: NoteFields = { front: "", concrete: "", abstract: "", aliases: "", parts: "", mnemonic: "", kind: "" };

  const roots = inputs.published.map((r): LexiconNote => ({
    source: "root",
    model: LEXICON_MODEL,
    key: r.root,
    guid: noteGuid("root", r.root, r.concrete),
    fields: { ...empty, front: r.root, concrete: r.concrete, abstract: r.abstract, aliases: (r.englishAliases ?? []).join(", "), mnemonic: r.mnemonic },
    tags: ["ageben::root", ...coreTags("root", r.root, r.core)],
    core: r.core ?? "",
  }));

  const part = (root: string) => {
    const gloss = concreteOf.get(root);
    return gloss ? `${root} (${gloss})` : root;
  };
  const compounds = inputs.compounds.map((r): LexiconNote => ({
    source: "compound",
    model: LEXICON_MODEL,
    key: r.stem,
    guid: noteGuid("compound", r.stem, r.concrete),
    fields: { ...empty, front: r.stem, concrete: r.concrete, abstract: r.abstract, parts: r.join ? `${part(r.left)} + ${r.join} + ${part(r.right)}` : `${part(r.left)} + ${r.right}`, mnemonic: r.mnemonic },
    tags: ["ageben::compound", ...coreTags("compound", r.stem, r.core)],
    core: r.core ?? "",
  }));

  const closed = closedWordNotes(inputs);

  // One overlay word note per sense form at its first checkpoint, a slot note per later new slot (flashcards-overlays.ts).
  const tables = loadDefaultTables();
  const found = examples ?? overlayExamples(inputs.overlays, inputs, tables);
  const overlays = overlayWordNotes(inputs, found, tables);
  const slots = overlaySlotNotes(inputs, overlays, found, tables);
  // A cloze set note per kind with three or more word notes at one checkpoint (flashcards-sets.ts).
  const sets = overlaySetNotes(inputs, overlays);
  // The scale note and one ending note per scale-ending kind (flashcards-endings.ts).
  const endings = endingNotes(inputs);

  const all = [...roots, ...compounds, ...closed, ...overlays, ...slots, ...sets, ...endings];
  const release = releaseTag(all);
  for (const note of all) note.tags.push(release);
  return { roots, compounds, closed, overlays, slots, sets, endings };
}

/**
 * A closed word's English as plain text: the `*…*` markup dropped (`*I* (the speaker)` → `I (the speaker)`).
 * Ageben lexicon fields are plain text, escaped by the packager and the TSV.
 */
export function closedEnglish(english: string): string {
  return english.replace(/\*([^*]+)\*/g, "$1");
}

/** The gloss words of a closed word's English: its `*…*` spans, joined (`*one*, generic *you*` → `one, you`). */
export function closedGloss(english: string): string {
  return [...english.matchAll(/\*([^*]+)\*/g)].map((m) => m[1]!).join(", ");
}

/**
 * One Ageben lexicon note per closed word, placed like an overlay: at the checkpoint its anchor maps to
 * ({@link anchorCheckpoint}), in checkpoint order, then CSV order. GUID: form + English.
 */
export function closedWordNotes(inputs: Pick<FlashcardInputs, "closedWords" | "checkpoints" | "anchorSection">): LexiconNote[] {
  const checkpointIndex = new Map(inputs.checkpoints.map((c, i) => [c.anchor, i]));
  const placed = inputs.closedWords.map((row, order) => {
    const cp = anchorCheckpoint(row.anchor, inputs);
    if (!cp) throw new Error(`closed word ${row.form}: anchor ${row.anchor} maps to no checkpoint`);
    const note: LexiconNote = {
      source: "closed",
      model: LEXICON_MODEL,
      key: row.form,
      guid: noteGuid("closed", row.form, row.english),
      fields: { front: row.form, concrete: closedGloss(row.english), abstract: closedEnglish(row.english), aliases: "", parts: "", mnemonic: "", kind: row.kind },
      tags: ["ageben::closed", `ageben::closed::${row.kind}`, `ageben::stage::${cp.band}`, cp.tag],
      core: "",
    };
    return { note, at: checkpointIndex.get(cp.anchor)!, order };
  });
  return placed.sort((a, b) => a.at - b.at || a.order - b.order).map((p) => p.note);
}

/** The glosses on a production front, which must pick out one stem (aliases are cues and may repeat). */
export function productionGlosses(note: FlashcardNote): string {
  if (note.model === OVERLAY_MODEL) {
    // The overlay front: the definition and the example with the overlay word blanked.
    return `${note.fields.definition} | ${note.fields.example.replace(/<span class="overlay">.*?<\/span>/, "___")}`;
  }
  if (note.model === SET_MODEL) return `${note.fields.title} | ${note.fields.text}`;
  return `${note.fields.concrete} | ${note.fields.abstract}`;
}

/** The checkpoint that first drills an anchored row: page, band, Practice heading id, and unlock tag. */
export type AnchorCheckpoint = { page: string; band: Band; id: string; anchor: string; tag: string };

/** Unlock tag of a checkpoint: `ageben::cp::<page>::<band>`, page without `.md`. */
export function checkpointTag(page: string, band: Band): string {
  return `ageben::cp::${page.replace(/\.md$/, "")}::${band}`;
}

/**
 * Map a row's `anchor` (`page.md#id`, explicit id or heading slug) to the first non-review
 * checkpoint after the anchor's section on the same page, in that section's band. Row-agnostic:
 * overlay and closed-word rows both call it. Undefined when the anchor or its checkpoint is missing.
 */
export function anchorCheckpoint(anchor: string, inputs: Pick<FlashcardInputs, "checkpoints" | "anchorSection">): AnchorCheckpoint | undefined {
  const section = inputs.anchorSection(anchor);
  if (!section?.band) return undefined;
  const page = anchor.split("#")[0]!;
  const checkpoint = inputs.checkpoints.find((c) => c.page === page && c.band === section.band && !c.review && c.line >= section.line);
  if (!checkpoint) return undefined;
  const id = checkpoint.anchor.split("#")[1]!;
  return { page, band: checkpoint.band, id, anchor: checkpoint.anchor, tag: checkpointTag(page, checkpoint.band) };
}

/** Overlay kinds whose `-l` / `-r` endings read the scale: one ending note per kind teaches those endings. */
export const SCALE_ENDING_KINDS: ReadonlySet<string> = new Set(["evidential", "phasal", "want", "attempt", "decision", "mirative"]);

/** `-l` / `-r` forms of scale-ending kinds whose ending is lexical: each keeps its own word note. */
export const LEXICAL_ENDING_FORMS: ReadonlySet<string> = new Set(["elol", "elor", "ahul", "ahur"]);

/**
 * True when an overlay row gets no word note of its own: an `-l` / `-r` form of a {@link SCALE_ENDING_KINDS} kind,
 * taught by the kind's ending note, unless its ending is lexical ({@link LEXICAL_ENDING_FORMS}). Such rows need no example.
 */
export function coveredByEndingNote(row: Pick<OverlayRow, "kind" | "senseForm">): boolean {
  return SCALE_ENDING_KINDS.has(row.kind) && /[lr]$/.test(row.senseForm) && !LEXICAL_ENDING_FORMS.has(row.senseForm);
}

/** Inputs from data/ and docs/grammar/: `pages` is the reading order with titles, reviews last in each group. */
export function loadFlashcardInputs(
  pages: readonly { page: string; title: string }[],
  reviewPages: string | readonly string[],
): FlashcardInputs {
  const grammarDir = join(REPO_ROOT, "docs", "grammar");
  const markdown = new Map<string, string>();
  for (const { page } of pages) {
    try {
      markdown.set(page, readFileSync(grammarFile(page), "utf8"));
    } catch {
      // Off-disk sidebar pages have no checkpoints.
    }
  }
  const sections = new Map<string, PageSections>();
  const pageText = (page: string) => {
    if (!markdown.has(page)) markdown.set(page, readFileSync(grammarFile(page), "utf8"));
    return markdown.get(page)!;
  };
  const sectionsOf = (page: string) => {
    if (!sections.has(page)) sections.set(page, pageSections(page, pageText(page)));
    return sections.get(page)!;
  };
  return {
    published: parsePublishedCsv(readData("lexicon-published.csv")),
    compounds: parseCompoundCsv(readData("lexicon-compounds.csv")),
    overlays: parseOverlayCsv(readData("lexicon-overlays.csv")),
    closedWords: loadClosedWords(),
    checkpoints: stageCheckpoints(pages.map((p) => p.page), (page) => markdown.get(page), loadDefaultTables(), reviewPages),
    anchorBand: (anchor) => {
      const [page, id] = anchor.split("#") as [string, string | undefined];
      return sectionsOf(page).anchors.get(id ?? "")?.band;
    },
    anchorSection: (anchor) => {
      const [page, id] = anchor.split("#") as [string, string | undefined];
      const section = sectionsOf(page).anchors.get(id ?? "");
      if (!section) return undefined;
      const text = pageText(page);
      return { band: section.band, line: text.slice(0, section.offset).split("\n").length, offset: section.offset, end: section.end };
    },
    pageText,
    units: packUnits(),
  };
}

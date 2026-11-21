/**
 * Vocabulary flashcards: notes for Anki built from the lexicon CSVs (`vocab-flashcards.md`).
 * One note per published root, compound, overlay sense form and new overlay slot; packs filter the notes into
 * decks. The CSVs stay canonical: nothing here adds or rewrites a sense.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { stageCheckpoints, type Checkpoint } from "./core-vocabulary.js";
import { parseCompoundCsv, type CompoundRow } from "./lexicon-compounds.js";
import { parseOverlayCsv, parsePublishedCsv, senseFormRoot, type OverlayRow, type PublishedRow } from "./lexicon-search.js";
import { overlayExamples, type OverlayExample } from "./flashcards-examples.js";
import { overlaySlotNotes, overlayWordNotes } from "./flashcards-overlays.js";
import { pageSections, type Band, type PageSections } from "./lint/learning-order.js";
import { loadDefaultTables } from "./parse/index.js";
import { grammarFile, readData, REPO_ROOT } from "./repo-paths.js";

export type NoteSource = "root" | "compound" | "overlay";

/** Note-type fields, in Anki field order. `kind` is the overlay kind, empty on roots and compounds. */
export const NOTE_FIELDS = ["front", "concrete", "abstract", "aliases", "parts", "mnemonic", "kind"] as const;

export type NoteFields = Record<(typeof NOTE_FIELDS)[number], string>;

type NoteBase = {
  source: NoteSource;
  /** Stable key: published `root`, compound `stem`, or overlay `sense_form`. */
  key: string;
  guid: string;
  tags: string[];
  /** The `core` cell (roots and compounds); empty when not core. */
  core: string;
};

/** A root or compound: the Ageben lexicon note type. */
export type LexiconNote = NoteBase & { model: typeof LEXICON_MODEL; fields: NoteFields };
export type OverlayNoteFields = Record<(typeof OVERLAY_FIELDS)[number], string>;
/** An overlay word note: the Ageben overlay note type. */
export type OverlayNote = NoteBase & { model: typeof OVERLAY_MODEL; fields: OverlayNoteFields };
export type FlashcardNote = LexiconNote | OverlayNote;

/** `overlays` are word notes; `slots` are slot notes, a known form in a new slot at a later checkpoint. */
export type FlashcardNotes = { roots: LexiconNote[]; compounds: LexiconNote[]; overlays: OverlayNote[]; slots: OverlayNote[] };

/** A note's field values in its note type's field order. */
export function fieldValues(note: FlashcardNote): string[] {
  return note.model === OVERLAY_MODEL ? OVERLAY_FIELDS.map((f) => note.fields[f]) : NOTE_FIELDS.map((f) => note.fields[f]);
}

export type FlashcardInputs = {
  published: readonly PublishedRow[];
  compounds: readonly CompoundRow[];
  overlays: readonly OverlayRow[];
  checkpoints: readonly Checkpoint[];
  /** Band of the section a `page.md#id` anchor lands in. */
  anchorBand: (anchor: string) => Band | undefined;
  /** Band, 1-based heading line, and `[offset, end)` in the page text of the section a `page.md#id` anchor lands in. */
  anchorSection: (anchor: string) => { band: Band | undefined; line: number; offset: number; end: number } | undefined;
  /** Markdown of a grammar page. */
  pageText: (page: string) => string;
  /** Display title of a grammar page (`clause.md` → `Clause`). */
  pageTitle: (page: string) => string;
  /** Sake roots in sake-inventory order. */
  sakeRoots: readonly string[];
};

export const PACK_IDS = ["core", "sakes", "everything", "claritish"] as const;
export type PackId = (typeof PACK_IDS)[number];
/** Packs of the Ageben lexicon note type; `claritish` has its own (`flashcards-claritish.ts`). */
export type LexiconPackId = Exclude<PackId, "claritish">;

export type PackDeck = { name: string; id: number; notes: FlashcardNote[] };
export type Pack = { id: LexiconPackId; decks: PackDeck[] };

/** Note types `scripts/flashcards-package.py` builds, by name, with their field order. */
export const LEXICON_MODEL = "Ageben lexicon" as const;
export const OVERLAY_MODEL = "Ageben overlay" as const;
/** `example` is HTML with the overlay word in `<span class="overlay">`; `readings` is HTML. */
export const OVERLAY_FIELDS = ["example", "form", "definition", "readings", "host", "slot_of", "gloss", "link", "mnemonic", "kind"] as const;
/** Anki Cloze type; `text` is the cloze HTML, one `{{cN::…}}` per member. */
export const SET_MODEL = "Ageben set";
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

/** The pack JSON of a lexicon pack: Ageben lexicon notes by default; overlay notes name their own type. */
export function packJson(pack: Pack): PackJson {
  const overlays = pack.decks.some((d) => d.notes.some((n) => n.model === OVERLAY_MODEL));
  return {
    model: LEXICON_MODEL,
    fields: NOTE_FIELDS,
    ...(overlays ? { modelFields: { [OVERLAY_MODEL]: OVERLAY_FIELDS } } : {}),
    decks: pack.decks.map((d) => ({
      name: d.name,
      id: d.id,
      notes: d.notes.map((n): PackJsonNote => ({ guid: n.guid, fields: fieldValues(n), tags: n.tags, ...(n.model === LEXICON_MODEL ? {} : { model: n.model }) })),
    })),
  };
}

const DECK_ROOT = "Ageben";

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

/** Every note: roots, compounds, overlay word and slot notes. `examples` defaults to {@link overlayExamples} over the inputs. */
export function buildNotes(inputs: Omit<FlashcardInputs, "pageTitle" | "sakeRoots">, examples?: ReadonlyMap<string, OverlayExample>): FlashcardNotes {
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

  // One overlay word note per sense form at its first checkpoint, a slot note per later new slot (flashcards-overlays.ts).
  const tables = loadDefaultTables();
  const found = examples ?? overlayExamples(inputs.overlays, inputs, tables);
  const overlays = overlayWordNotes(inputs, found, tables);
  const slots = overlaySlotNotes(inputs, overlays, found, tables);

  const release = releaseTag([...roots, ...compounds, ...overlays, ...slots]);
  for (const note of [...roots, ...compounds, ...overlays, ...slots]) note.tags.push(release);
  return { roots, compounds, overlays, slots };
}

/** The glosses on a production front, which must pick out one stem (aliases are cues and may repeat). */
export function productionGlosses(note: FlashcardNote): string {
  if (note.model === OVERLAY_MODEL) {
    // The overlay front: the definition and the example with the overlay word blanked.
    return `${note.fields.definition} | ${note.fields.example.replace(/<span class="overlay">.*?<\/span>/, "___")}`;
  }
  return `${note.fields.concrete} | ${note.fields.abstract}`;
}

function deck(name: string, notes: FlashcardNote[]): PackDeck {
  const full = `${DECK_ROOT}::${name}`;
  return { name: full, id: deckId(full), notes };
}

export function buildPack(id: LexiconPackId, notes: FlashcardNotes, inputs: Pick<FlashcardInputs, "checkpoints" | "pageTitle" | "sakeRoots">): Pack {
  if (id === "core") {
    const words = [...notes.roots, ...notes.compounds].filter((n) => n.core);
    const decks: PackDeck[] = [];
    for (const checkpoint of inputs.checkpoints) {
      const here = words.filter((n) => n.core === checkpoint.anchor);
      if (here.length === 0) continue;
      const number = String(decks.length + 1).padStart(2, "0");
      decks.push(deck(`Core::${number} ${inputs.pageTitle(checkpoint.page)} · ${checkpoint.band}`, here));
    }
    return { id, decks };
  }
  if (id === "sakes") {
    const ordered: FlashcardNote[] = [];
    for (const root of inputs.sakeRoots) {
      const rootNote = notes.roots.find((n) => n.key === root);
      const overlay = notes.overlays.find((n) => n.fields.kind === "sake" && senseFormRoot(n.key) === root);
      if (!rootNote || !overlay) throw new Error(`sake root ${root}: no published row or no sake overlay`);
      ordered.push(rootNote, overlay);
    }
    return { id, decks: [deck("Sakes", ordered)] };
  }
  return { id, decks: [deck("Everything::Roots", notes.roots), deck("Everything::Compounds", notes.compounds), deck("Everything::Overlays", notes.overlays), deck("Everything::Slots", notes.slots)] };
}

/** Sake roots from the first column of the sake inventory table (sakes.md#sake-inventory). */
export function sakeInventoryRoots(sakesMarkdown: string): string[] {
  const lines = sakesMarkdown.split(/\r?\n/);
  const start = lines.findIndex((l) => /^#+ .*\{#sake-inventory\}/.test(l));
  if (start < 0) throw new Error("sakes.md has no #sake-inventory heading");
  const roots: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^#/.test(line)) break;
    const cell = /^\|\s*\*\*`([a-z]+)`\*\*\s*\|/.exec(line);
    if (cell) roots.push(cell[1]!);
    else if (roots.length > 0 && !line.startsWith("|")) break;
  }
  return roots;
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
  const titles = new Map(pages.map((p) => [p.page, p.title]));
  return {
    published: parsePublishedCsv(readData("lexicon-published.csv")),
    compounds: parseCompoundCsv(readData("lexicon-compounds.csv")),
    overlays: parseOverlayCsv(readData("lexicon-overlays.csv")),
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
    pageTitle: (page) => titles.get(page) ?? page.replace(/\.md$/, ""),
    sakeRoots: sakeInventoryRoots(markdown.get("sakes.md") ?? readFileSync(grammarFile("sakes.md"), "utf8")),
  };
}

/**
 * Anki-importable TSV: directive header, then one line per Ageben lexicon note (deck, GUID, fields, tags).
 * One TSV holds one note type, so overlay notes are in the `.apkg` and `.json` only.
 */
export function packTsv(pack: Pack): string {
  const clean = (s: string) => s.replace(/[\t\r\n]+/g, " ");
  const lines = [
    "#separator:tab",
    "#html:false",
    `#notetype:${LEXICON_MODEL}`,
    "#deck column:1",
    "#guid column:2",
    `#tags column:${NOTE_FIELDS.length + 3}`,
    `#columns:deck\tguid\t${NOTE_FIELDS.join("\t")}\ttags`,
  ];
  for (const d of pack.decks) {
    for (const note of d.notes) {
      if (note.model === LEXICON_MODEL) lines.push([d.name, note.guid, ...NOTE_FIELDS.map((f) => note.fields[f]), note.tags.join(" ")].map(clean).join("\t"));
    }
  }
  return `${lines.join("\n")}\n`;
}

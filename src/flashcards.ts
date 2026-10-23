/**
 * Vocabulary flashcards: notes for Anki built from the lexicon CSVs (`vocab-flashcards.md`).
 * One note per published root, compound, and overlay sense form; packs filter the notes into
 * decks. The CSVs stay canonical: nothing here adds or rewrites a sense.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { stageCheckpoints, type Checkpoint } from "./core-vocabulary.js";
import { parseCompoundCsv, type CompoundRow } from "./lexicon-compounds.js";
import { parseOverlayCsv, parsePublishedCsv, senseFormRoot, type OverlayRow, type PublishedRow } from "./lexicon-search.js";
import { BANDS, pageSections, type Band, type PageSections } from "./lint/learning-order.js";
import { loadDefaultTables } from "./parse/index.js";
import { grammarFile, readData, REPO_ROOT } from "./repo-paths.js";

export type NoteSource = "root" | "compound" | "overlay";

/** Note-type fields, in Anki field order. `kind` is the overlay kind, empty on roots and compounds. */
export const NOTE_FIELDS = ["front", "concrete", "abstract", "aliases", "parts", "mnemonic", "kind"] as const;

export type NoteFields = Record<(typeof NOTE_FIELDS)[number], string>;

export type FlashcardNote = {
  source: NoteSource;
  /** Stable key: published `root`, compound `stem`, or overlay `sense_form`. */
  key: string;
  guid: string;
  fields: NoteFields;
  tags: string[];
  /** The `core` cell (roots and compounds); empty when not core. */
  core: string;
};

export type FlashcardNotes = { roots: FlashcardNote[]; compounds: FlashcardNote[]; overlays: FlashcardNote[] };

export type FlashcardInputs = {
  published: readonly PublishedRow[];
  compounds: readonly CompoundRow[];
  overlays: readonly OverlayRow[];
  checkpoints: readonly Checkpoint[];
  /** Band of the section a `page.md#id` anchor lands in. */
  anchorBand: (anchor: string) => Band | undefined;
  /** Display title of a grammar page (`clause.md` → `Clause`). */
  pageTitle: (page: string) => string;
  /** Sake roots in sake-inventory order. */
  sakeRoots: readonly string[];
};

export const PACK_IDS = ["core", "sakes", "everything"] as const;
export type PackId = (typeof PACK_IDS)[number];

export type PackDeck = { name: string; id: number; notes: FlashcardNote[] };
export type Pack = { id: PackId; decks: PackDeck[] };

const DECK_ROOT = "Agebon";

/** Anki GUID from the source and stable key, never from row order. */
export function noteGuid(source: NoteSource, key: string): string {
  return createHash("sha256").update(`agebon/${source}/${key}`).digest("base64url").slice(0, 12);
}

/** Stable Anki deck id from the deck name, in genanki's recommended range [2^30, 2^31). */
export function deckId(name: string): number {
  return (1 << 30) + (createHash("sha256").update(`agebon-deck/${name}`).digest().readUInt32BE(0) % (1 << 30));
}

/** `speech-acts.md#intermediate-practice` → `agebon::core::speech-moves::intermediate`. */
function coreTag(cell: string, band: Band): string {
  return `agebon::core::${cell.split("#")[0]!.replace(/\.md$/, "")}::${band}`;
}

function earliestBand(bands: readonly (Band | undefined)[]): Band | undefined {
  return BANDS.find((b) => bands.includes(b));
}

export function buildNotes(inputs: Omit<FlashcardInputs, "pageTitle" | "sakeRoots">): FlashcardNotes {
  const checkpointBand = new Map(inputs.checkpoints.map((c) => [c.anchor, c.band]));
  const coreTags = (source: NoteSource, key: string, cell: string | undefined): string[] => {
    if (!cell) return [];
    const band = checkpointBand.get(cell);
    if (!band) throw new Error(`${source} ${key}: core cell ${cell} names no stage checkpoint`);
    return [coreTag(cell, band)];
  };
  const concreteOf = new Map(inputs.published.map((r) => [r.root, r.concrete]));
  const empty: NoteFields = { front: "", concrete: "", abstract: "", aliases: "", parts: "", mnemonic: "", kind: "" };

  const roots = inputs.published.map((r): FlashcardNote => ({
    source: "root",
    key: r.root,
    guid: noteGuid("root", r.root),
    fields: { ...empty, front: r.root, concrete: r.concrete, abstract: r.abstract, aliases: (r.englishAliases ?? []).join(", "), mnemonic: r.mnemonic },
    tags: ["agebon::root", ...coreTags("root", r.root, r.core)],
    core: r.core ?? "",
  }));

  const part = (root: string) => {
    const gloss = concreteOf.get(root);
    return gloss ? `${root} (${gloss})` : root;
  };
  const compounds = inputs.compounds.map((r): FlashcardNote => ({
    source: "compound",
    key: r.stem,
    guid: noteGuid("compound", r.stem),
    fields: { ...empty, front: r.stem, concrete: r.concrete, abstract: r.abstract, parts: r.join ? `${part(r.left)} + ${r.join} + ${part(r.right)}` : `${part(r.left)} + ${r.right}`, mnemonic: r.mnemonic },
    tags: ["agebon::compound", ...coreTags("compound", r.stem, r.core)],
    core: r.core ?? "",
  }));

  // The `th` / `w` rows of one sense form collapse into one note. Only sakes for now (v1 packs
  // use no other overlay); some other sense forms differ by PoS row and need a key rule first.
  const bySense = new Map<string, OverlayRow[]>();
  for (const row of inputs.overlays.filter((r) => r.kind === "sake")) bySense.set(row.senseForm, [...(bySense.get(row.senseForm) ?? []), row]);
  const overlays = [...bySense].map(([senseForm, rows]): FlashcardNote => {
    const first = rows[0]!;
    for (const row of rows) {
      if (row.kind !== first.kind || row.gloss !== first.gloss || row.definition !== first.definition) {
        throw new Error(`overlay ${senseForm}: the ${first.pos} and ${row.pos} rows disagree on kind, gloss, or definition`);
      }
    }
    const stage = earliestBand(rows.map((r) => inputs.anchorBand(r.anchor)));
    return {
      source: "overlay",
      key: senseForm,
      guid: noteGuid("overlay", senseForm),
      fields: { ...empty, front: senseForm, concrete: first.gloss, abstract: first.definition, mnemonic: first.mnemonic, kind: first.kind },
      tags: [
        "agebon::overlay",
        `agebon::overlay::${first.kind}`,
        ...[...new Set(rows.map((r) => r.pos))].map((pos) => `agebon::pos::${pos}`),
        ...(stage ? [`agebon::stage::${stage}`] : []),
      ],
      core: "",
    };
  });

  return { roots, compounds, overlays };
}

/** The glosses on a production front, which must pick out one stem (aliases are cues and may repeat). */
export function productionGlosses(note: FlashcardNote): string {
  return `${note.fields.concrete} | ${note.fields.abstract}`;
}

function deck(name: string, notes: FlashcardNote[]): PackDeck {
  const full = `${DECK_ROOT}::${name}`;
  return { name: full, id: deckId(full), notes };
}

export function buildPack(id: PackId, notes: FlashcardNotes, inputs: Pick<FlashcardInputs, "checkpoints" | "pageTitle" | "sakeRoots">): Pack {
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
  return { id, decks: [deck("Everything::Roots", notes.roots), deck("Everything::Compounds", notes.compounds)] };
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
  const sectionsOf = (page: string) => {
    if (!sections.has(page)) {
      const text = markdown.get(page) ?? readFileSync(grammarFile(page), "utf8");
      sections.set(page, pageSections(page, text));
    }
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
    pageTitle: (page) => titles.get(page) ?? page.replace(/\.md$/, ""),
    sakeRoots: sakeInventoryRoots(markdown.get("sakes.md") ?? readFileSync(grammarFile("sakes.md"), "utf8")),
  };
}

/** Anki-importable TSV: directive header, then one line per note (deck, GUID, fields, tags). */
export function packTsv(pack: Pack): string {
  const clean = (s: string) => s.replace(/[\t\r\n]+/g, " ");
  const lines = [
    "#separator:tab",
    "#html:false",
    "#notetype:Agebon lexicon",
    "#deck column:1",
    "#guid column:2",
    `#tags column:${NOTE_FIELDS.length + 3}`,
    `#columns:deck\tguid\t${NOTE_FIELDS.join("\t")}\ttags`,
  ];
  for (const d of pack.decks) {
    for (const note of d.notes) lines.push([d.name, note.guid, ...NOTE_FIELDS.map((f) => note.fields[f]), note.tags.join(" ")].map(clean).join("\t"));
  }
  return `${lines.join("\n")}\n`;
}

/**
 * Claritish flashcards: one note per distinct form on the Claritish cheat sheet
 * (docs/grammar/claritish/cheat-sheet.md), each filed under the lesson the sheet links it to,
 * or else the first lesson that teaches it.
 * Card text comes only from the sheet's tables and lines; nothing here types a form or a meaning.
 * Pure at import time: `buildClaritishPack` takes markdown, `loadClaritishPack` reads the files.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { cellEnglish, plain, readFormula, readSheet, type Sheet } from "./claritish-editor/sheet.js";
import { spans, swapEnding } from "./lint/cheat-sheet-tables.js";
import { REPO_ROOT } from "./repo-paths.js";

/** The Claritish note type: its own model, never shared with the Ageben packs. */
export const CLARITISH_MODEL = "Claritish";
/** Note-type fields, in Anki field order. */
export const CLARITISH_FIELDS = ["front", "meaning", "lesson"] as const;
export type ClaritishFields = Record<(typeof CLARITISH_FIELDS)[number], string>;

/** A form's ending reading: `label: detail`, or either alone. */
export type ClaritishReading = { label?: string; detail?: string };

/**
 * One meaning on a back: `head` in bold, `context` in brackets, then `label: detail` or `detail`.
 * `also`: the row's other ending forms, which get no note of their own, on a muted line below.
 */
export type ClaritishMeaning = { head: string; context?: string; also?: ({ form: string } & ClaritishReading)[] } & ClaritishReading;

export type ClaritishLesson = { title: string; slug: string; page: string };

export type ClaritishNote = {
  form: string;
  /** Sheet section id of the form's first place. */
  section: string;
  meanings: ClaritishMeaning[];
  /** Lesson page the sheet links the form's first place to (row, then column, then heading), if any. */
  sheetLesson?: string;
  lesson: ClaritishLesson;
  guid: string;
  tags: string[];
  fields: ClaritishFields;
};

export type ClaritishDeck = { title: string; slug: string; name: string; id: number; notes: ClaritishNote[] };

export type ClaritishPack = { notes: ClaritishNote[]; decks: ClaritishDeck[]; releaseId: string };

/** A lesson page as `buildClaritishPack` reads it. */
export type ClaritishLessonPage = ClaritishLesson & { markdown: string };

const DECK_ROOT = "Claritish";
const TAG_ROOT = "claritish";
/** Sidebar entries of the Claritish track that are not lessons (by slug). */
const NOT_LESSONS = new Set(["", "learn", "cheat-sheet", "flashcards", "editor"]);
/** Sheet sections that hold no notes: sounds, not meanings. */
const NO_NOTES = new Set(["sounds"]);

/** GUID from the sheet section and the form: a new meaning keeps the note, a respelling makes a new one. */
export function claritishGuid(section: string, form: string): string {
  return createHash("sha256").update(`claritish/${section}/${form}`).digest("base64url").slice(0, 12);
}

/** Stable Anki deck id from the deck name, the same scheme as the Ageben packs. */
function deckId(name: string): number {
  return (1 << 30) + (createHash("sha256").update(`ageben-deck/${name}`).digest().readUInt32BE(0) % (1 << 30));
}

/** A word with its `-l` / `-m` / `-r` ending swapped: the variants the cheat sheet lint accepts as taught. */
export function endingVariants(form: string): string[] {
  return /\s/.test(form) || form.startsWith("-") ? [form] : swapEnding(form);
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** `form` is a span, or a whole word of one (`thawethum` in `thawethum blawan`). */
function inSpans(form: string, list: ReadonlySet<string>): boolean {
  if (list.has(form)) return true;
  const word = new RegExp(`(?:^|\\s)${escapeRe(form)}(?:\\s|$)`, "u");
  return [...list].some((s) => /\s/.test(s) && word.test(s));
}

const lcFirst =(s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const headerEnglish = (header: string) => plain(header).replace(/^-[a-z]\b\s*/, "");
const headerEnding = (header: string) => /^-([a-z])$/.exec(plain(header).split(/\s/)[0] ?? "")?.[1];
const firstLink = (...texts: string[]) => {
  for (const text of texts) {
    const m = /\]\(([\w-]+\.md)(?:#[\w-]*)?\)/.exec(text);
    if (m) return m[1];
  }
  return undefined;
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function readingHtml(r: ClaritishReading): string {
  if (r.label && r.detail) return `${escapeHtml(r.label)}: <i>${escapeHtml(r.detail)}</i>`;
  if (r.detail) return `<i>${escapeHtml(r.detail)}</i>`;
  return escapeHtml(r.label ?? "");
}

/** A back as HTML: meanings joined by a line break; a meaning's other ending forms in a muted block. */
export function meaningHtml(meanings: readonly ClaritishMeaning[]): string {
  return meanings
    .map((m) => {
      let out = `<b>${escapeHtml(m.head)}</b>`;
      if (m.context) out += ` (${escapeHtml(m.context)})`;
      if (m.label && m.detail) out += ` · ${escapeHtml(m.label)}: <i>${escapeHtml(m.detail)}</i>`;
      else if (m.label || m.detail) out += ` · ${escapeHtml((m.label || m.detail)!)}`;
      if (m.also?.length) out += `<div class="also">${m.also.map((a) => `${escapeHtml(a.form)} ${readingHtml(a)}`).join(" · ")}</div>`;
      return out;
    })
    .join("<br>");
}

/**
 * One table row's ending cells as places. `keepAll` gives every cell a note: the row that first
 * teaches its table's ending scale. Otherwise only the `-m` cell gets one, with the others in `also`.
 */
function rowPlaces(cells: readonly ({ form: string; ending: string } & ClaritishReading)[], keepAll: boolean, place: (form: string, reading: ClaritishReading) => Place, where: string): Place[] {
  const reading = (c: ClaritishReading): ClaritishReading => ({ ...(c.label ? { label: c.label } : {}), ...(c.detail ? { detail: c.detail } : {}) });
  if (keepAll) return cells.map((c) => place(c.form, reading(c)));
  const main = cells.find((c) => c.ending === "m");
  if (!main) throw new Error(`${where}: no \`-m\` cell`);
  const p = place(main.form, reading(main));
  const also = cells.filter((c) => c !== main).map((c) => ({ form: c.form, ...reading(c) }));
  return [{ ...p, meaning: { ...p.meaning, also } }];
}

type Place = { form: string; section: string; meaning: ClaritishMeaning; link?: string };

function table(sheet: Sheet, section: string, n: number) {
  const t = sheet.tables.get(section)?.[n];
  if (!t) throw new Error(`cheat sheet section #${section} has no table ${n + 1}`);
  return t;
}

function column(header: readonly string[], name: string, section: string): number {
  const i = header.findIndex((h) => plain(h) === name);
  if (i < 0) throw new Error(`cheat sheet #${section}: no \`${name}\` column`);
  return i;
}

function only(list: readonly string[], what: string): string {
  if (list.length !== 1) throw new Error(`${what}: expected one form, found ${list.length}`);
  return list[0]!;
}

/**
 * Row label × ending column tables (#settled, #how-you-know, #allowed). Each table is one ending
 * scale: its first row gets a place per cell, every later row one for its `-m` cell (`rowPlaces`).
 */
function gridPlaces(sheet: Sheet, section: string, headingLink: string | undefined): Place[] {
  return (sheet.tables.get(section) ?? []).flatMap((t) =>
    t.rows.flatMap((row, r) => {
      const head = cellEnglish(row[0] ?? "");
      const where = `#${section} row ${head}`;
      const cells = t.header.flatMap((header, j) => {
        const ending = headerEnding(header);
        if (!ending) return [];
        return [{ form: only(spans(row[j] ?? ""), where), ending, label: headerEnglish(header), detail: cellEnglish(row[j] ?? ""), header }];
      });
      const headerOf = new Map(cells.map((c) => [c.form, c.header]));
      return rowPlaces(cells, r === 0, (form, reading) => ({ form, section, meaning: { head, ...reading }, link: firstLink(row[0] ?? "", headerOf.get(form)!) ?? headingLink }), where);
    }),
  );
}

/** Tables of form / English column pairs (#suffixes, #tone-marks, the urge table): one place per form cell. */
function pairPlaces(sheet: Sheet, section: string, n: number, headingLink: string | undefined, head: (header: string, next: string, english: string) => ClaritishMeaning): Place[] {
  const t = table(sheet, section, n);
  return t.rows.flatMap((row) =>
    row.flatMap((cell, i): Place[] => {
      const form = spans(cell)[0];
      if (!form || i % 2 !== 0) return [];
      return [{ form, section, meaning: head(t.header[i]!, t.header[i + 1]!, plain(row[i + 1] ?? "")), link: firstLink(t.header[i]!) ?? headingLink }];
    }),
  );
}

/** The #sakes section: needs, stances, stance × ending on each row's Example, and the forms in its prose. */
function sakePlaces(sheet: Sheet, headingLink: string | undefined, endingLabel: ReadonlyMap<string, string>): Place[] {
  const section = "sakes";
  const places: Place[] = [];
  const needs = table(sheet, section, 0);
  const needOf = new Map<string, string>();
  for (const row of needs.rows) {
    for (const cell of row) {
      const form = spans(cell)[0];
      if (!form) continue;
      needOf.set(form, cellEnglish(cell));
      places.push({ form, section, meaning: { head: cellEnglish(cell) }, link: headingLink });
    }
  }

  const lines = sheet.lines.get(section) ?? [];
  const formulaLine = lines.find((l) => {
    try {
      readFormula(l);
      return true;
    } catch {
      return false;
    }
  });
  if (!formulaLine) throw new Error("cheat sheet #sakes: no sake word formula");
  const formula = readFormula(formulaLine);
  const prefix = formula[0];
  if (formula.length !== 4 || !prefix || !("literal" in prefix)) throw new Error("cheat sheet #sakes: the sake word formula is not `prefix` + sake + stance + ending");

  const stanceRows: Place[] = [];
  const crossRows: Place[] = [];
  const saysForms: Place[] = [];
  // Stance tables: the first reads #settled's scale, so each row gets its `-m` form only; a later
  // table is a scale of its own, and its first row gets every ending (`rowPlaces`).
  const stanceTables = (sheet.tables.get(section) ?? []).slice(1);
  if (!stanceTables.length) throw new Error("cheat sheet #sakes has no stance table");
  stanceTables.forEach((stances, k) => {
    const stanceCol = column(stances.header, "Stance", section);
    const saysCol = column(stances.header, "Says", section);
    const exampleCol = column(stances.header, "Example", section);
    stances.rows.forEach((row, r) => {
      const stanceCell = row[stanceCol] ?? "";
      const stance = only(spans(stanceCell), "#sakes stance cell");
      const saysCell = row[saysCol] ?? "";
      const says = plain(saysCell).split(",")[0]!.trim();
      const link = firstLink(saysCell, stanceCell) ?? headingLink;
      stanceRows.push({ form: stance, section, meaning: { head: cellEnglish(stanceCell), detail: says }, link });
      const example = spans(row[exampleCol] ?? "")[0];
      if (!example) throw new Error(`#sakes stance ${stance}: no Example`);
      const stem = example.slice(0, -1);
      if (!example.startsWith(prefix.literal) || !stem.endsWith(stance)) throw new Error(`#sakes Example \`${example}\` does not fit the sake word formula`);
      const need = needOf.get(stem.slice(prefix.literal.length, -stance.length));
      if (!need) throw new Error(`#sakes Example \`${example}\`: its sake is not in the needs table`);
      const cells = stances.header.flatMap((header, i) => {
        const ending = headerEnding(header);
        if (!ending) return [];
        const label = headerEnglish(header) || (k === 0 ? endingLabel.get(ending) : undefined);
        if (k === 0 && !label) throw new Error(`#sakes: ending -${ending} has no label in #settled`);
        return [{ form: stem + ending, ending, ...(label ? { label } : {}), detail: plain(row[i] ?? "") }];
      });
      crossRows.push(...rowPlaces(cells, k > 0 && r === 0, (form, reading) => ({ form, section, meaning: { head: says, context: need, ...reading }, link }), `#sakes stance ${stance}`));
      // A form in the Says cell (`blawan` for *yours*): its meaning is the emphasis after it.
      for (const m of saysCell.matchAll(/`([^`]+)`[^`*]*\*([^*]+)\*/g)) {
        saysForms.push({ form: m[1]!, section, meaning: { head: m[2]!, detail: plain(saysCell) }, link });
      }
    });
  });
  places.push(...stanceRows, ...crossRows, ...saysForms);

  // A prose line with a swap (`g` for `th`) and its example: *my coat* `gobathal`.
  for (const line of lines) {
    const m = /\*([^*]+)\*\s*`([^`]+)`\.?\s*$/.exec(line);
    if (!m || line === formulaLine) continue;
    places.push({ form: m[2]!, section, meaning: { head: m[1]!, detail: lcFirst(plain(line.slice(0, line.indexOf(":")))) }, link: firstLink(line) ?? headingLink });
  }
  return places;
}

/** The #feelings section: the urge table, and a line that gives a form already on the sheet another meaning. */
function feelingPlaces(sheet: Sheet, headingLink: string | undefined, known: ReadonlySet<string>): Place[] {
  const section = "feelings";
  const urges = pairPlaces(sheet, section, 1, headingLink, (header, next, english) => ({ head: lcFirst(plain(header)), detail: `${lcFirst(plain(next))} ${english}` }));
  const joins: Place[] = [];
  for (const line of sheet.lines.get(section) ?? []) {
    const m = /^([^:`]+):\s*`([^`]+)`\s+([^`]+?)\.?\s*$/.exec(line);
    if (!m || !known.has(m[2]!)) continue;
    joins.push({ form: m[2]!, section, meaning: { head: lcFirst(plain(m[1]!)), detail: plain(m[3]!) }, link: firstLink(line) });
  }
  return [...urges, ...joins];
}

/** Heading links by section id (`## [Sakes](thanks-and-sorry.md) {#sakes}` → `thanks-and-sorry.md`). */
function headingLinks(markdown: string): Map<string, string | undefined> {
  const out = new Map<string, string | undefined>();
  for (const line of markdown.split("\n")) {
    const id = /^#{1,6}\s.*\{#([\w-]+)\}\s*$/.exec(line)?.[1];
    if (id) out.set(id, firstLink(line));
  }
  return out;
}

/** Every place on the sheet that makes or joins a note, in sheet order. */
function sheetPlaces(markdown: string): Place[] {
  const sheet = readSheet(markdown);
  const links = headingLinks(markdown);
  const settled = table(sheet, "settled", 0);
  const endingLabel = new Map(settled.header.flatMap((h) => (headerEnding(h) ? [[headerEnding(h)!, headerEnglish(h)] as const] : [])));
  const places: Place[] = [];
  for (const section of links.keys()) {
    if (NO_NOTES.has(section) || !sheet.tables.has(section)) continue;
    const link = links.get(section);
    if (section === "settled" || section === "how-you-know" || section === "allowed") places.push(...gridPlaces(sheet, section, link));
    else if (section === "suffixes") places.push(...pairPlaces(sheet, section, 0, link, (header, _next, english) => ({ head: lcFirst(plain(header)), detail: english })));
    else if (section === "sakes") places.push(...sakePlaces(sheet, link, endingLabel));
    else if (section === "feelings") places.push(...feelingPlaces(sheet, link, new Set(places.map((p) => p.form))));
    else if (section === "tone-marks") places.push(...pairPlaces(sheet, section, 0, link, (_h, _n, english) => ({ head: english })));
    else throw new Error(`cheat sheet section #${section} has tables but no note rule`);
  }
  return places;
}

/** Lessons in sidebar order, from the Claritish track's `{ text, link }` list. */
export function claritishLessonList(sidebar: readonly { text: string; link: string }[]): ClaritishLesson[] {
  return sidebar.flatMap(({ text, link }) => {
    const slug = link.replace(/^\/claritish\/?/, "");
    return NOT_LESSONS.has(slug) ? [] : [{ title: text, slug, page: `${slug}.md` }];
  });
}

export function buildClaritishPack(sheetMarkdown: string, lessons: readonly ClaritishLessonPage[]): ClaritishPack {
  const lessonSpans = lessons.map((l) => ({ lesson: { title: l.title, slug: l.slug, page: l.page }, spans: new Set(spans(l.markdown)) }));
  const byForm = new Map<string, { places: Place[] }>();
  for (const place of sheetPlaces(sheetMarkdown)) {
    const entry = byForm.get(place.form) ?? { places: [] };
    entry.places.push(place);
    byForm.set(place.form, entry);
  }

  const draft = [...byForm].map(([form, { places }]) => {
    const first = places[0]!;
    // The sheet's link wins (row, column header, heading); otherwise the first lesson that has the form.
    const variants = endingVariants(form);
    const found = first.link
      ? lessonSpans.find((l) => l.lesson.page === first.link)
      : lessonSpans.find((l) => variants.some((v) => inSpans(v, l.spans)));
    if (!found) throw new Error(first.link ? `Claritish form \`${form}\`: the sheet links ${first.link}, which is not a lesson` : `Claritish form \`${form}\` is in no lesson`);
    return {
      form,
      section: first.section,
      meanings: places.map((p) => p.meaning),
      ...(first.link ? { sheetLesson: first.link } : {}),
      lesson: found.lesson,
      guid: claritishGuid(first.section, form),
    };
  });

  const decks: ClaritishDeck[] = [];
  // Numbered by lesson, so a lesson with no notes yet leaves its number free and names stay stable.
  lessonSpans.forEach(({ lesson }, i) => {
    const here = draft.filter((n) => n.lesson.slug === lesson.slug);
    if (here.length === 0) return;
    const name = `${DECK_ROOT}::${String(i + 1).padStart(2, "0")} ${lesson.title}`;
    decks.push({ title: lesson.title, slug: lesson.slug, name, id: deckId(name), notes: here.map((n) => ({ ...n, tags: [], fields: { front: n.form, meaning: meaningHtml(n.meanings), lesson: lesson.title } })) });
  });

  const ordered = decks.flatMap((d) => d.notes);
  const releaseId = createHash("sha256")
    .update(JSON.stringify(decks.map((d) => [d.name, d.id, d.notes.map((n) => [n.guid, CLARITISH_FIELDS.map((f) => n.fields[f])])])))
    .digest("hex")
    .slice(0, 8);
  for (const note of ordered) note.tags = [TAG_ROOT, `${TAG_ROOT}::lesson::${note.lesson.slug}`, `${TAG_ROOT}::release::${releaseId}`];
  return { notes: ordered, decks, releaseId };
}

/** Reads the cheat sheet and the lesson pages: pass the Claritish sidebar (`claritishLessons`). */
export function loadClaritishPack(sidebar: readonly { text: string; link: string }[]): ClaritishPack {
  const dir = join(REPO_ROOT, "docs", "grammar", "claritish");
  const lessons = claritishLessonList(sidebar).map((l) => ({ ...l, markdown: readFileSync(join(dir, l.page), "utf8") }));
  return buildClaritishPack(readFileSync(join(dir, "cheat-sheet.md"), "utf8"), lessons);
}

/** The JSON `scripts/flashcards-package.py` packages: the Claritish note type and its decks. */
export function claritishPackJson(pack: ClaritishPack) {
  return {
    model: CLARITISH_MODEL,
    fields: CLARITISH_FIELDS,
    decks: pack.decks.map((d) => ({ name: d.name, id: d.id, notes: d.notes.map((n) => ({ guid: n.guid, fields: CLARITISH_FIELDS.map((f) => n.fields[f]), tags: n.tags })) })),
  };
}

/** Anki-importable TSV for the Claritish note type. */
export function claritishTsv(pack: ClaritishPack): string {
  const clean = (s: string) => s.replace(/[\t\r\n]+/g, " ");
  const lines = [
    "#separator:tab",
    "#html:true",
    `#notetype:${CLARITISH_MODEL}`,
    "#deck column:1",
    "#guid column:2",
    `#tags column:${CLARITISH_FIELDS.length + 3}`,
    `#columns:deck\tguid\t${CLARITISH_FIELDS.join("\t")}\ttags`,
  ];
  for (const d of pack.decks) {
    for (const n of d.notes) lines.push([d.name, n.guid, ...CLARITISH_FIELDS.map((f) => n.fields[f]), n.tags.join(" ")].map(clean).join("\t"));
  }
  return `${lines.join("\n")}\n`;
}

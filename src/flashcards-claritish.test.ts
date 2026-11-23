import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

import { claritishLessons } from "../docs/grammar/.vitepress/lib/reading-order.js";
import { readFormula, readSheet, readSwap } from "./claritish-editor/sheet.js";
import { buildClaritishPack, claritishGuid, endingVariants, claritishLessonList, claritishTsv, loadClaritishPack, type ClaritishLessonPage } from "./flashcards-claritish.js";
import { spans } from "./lint/cheat-sheet-tables.js";
import { REPO_ROOT } from "./repo-paths.js";

const dir = join(REPO_ROOT, "docs", "grammar", "claritish");
const sheetMarkdown = readFileSync(join(dir, "cheat-sheet.md"), "utf8");
const lessons: ClaritishLessonPage[] = claritishLessonList(claritishLessons).map((l) => ({ ...l, markdown: readFileSync(join(dir, l.page), "utf8") }));
const pack = buildClaritishPack(sheetMarkdown, lessons);
const sheet = readSheet(sheetMarkdown);

describe("Claritish notes", () => {
  it("maps every note to one lesson: the sheet's link where it has one, and that lesson has the form", () => {
    const slugs = new Set(lessons.map((l) => l.slug));
    for (const note of pack.notes) {
      assert.ok(slugs.has(note.lesson.slug), `${note.form}: ${note.lesson.slug} is not a lesson`);
      if (note.sheetLesson) assert.equal(note.lesson.page, note.sheetLesson, `${note.form}: lesson disagrees with the sheet's link`);
      const pageSpans = spans(lessons.find((l) => l.slug === note.lesson.slug)!.markdown);
      const variants = endingVariants(note.form);
      assert.ok(
        pageSpans.some((s) => variants.includes(s) || (/\s/.test(s) && variants.some((v) => s.split(/\s+/).includes(v)))),
        `${note.form}: ${note.lesson.page} has no \`${note.form}\` (or an ending variant) in a backtick span`,
      );
      assert.equal(note.tags.filter((t) => t.startsWith("claritish::lesson::")).length, 1, note.form);
      assert.equal(note.fields.lesson, note.lesson.title);
    }
  });

  it("has no two notes with the same front", () => {
    const fronts = pack.notes.map((n) => n.fields.front);
    assert.equal(new Set(fronts).size, fronts.length);
  });

  it("makes no note for sounds, pattern pieces, bare endings, or the formula table", () => {
    const fronts = new Set(pack.notes.map((n) => n.fields.front));
    assert.ok(!pack.notes.some((n) => n.section === "sounds"));
    const sakeLines = sheet.lines.get("sakes") ?? [];
    const formula = readFormula(sakeLines.find((l) => l.includes("+"))!);
    const swap = readSwap(sakeLines.find((l) => / for `/.test(l))!);
    for (const piece of [...formula.flatMap((p) => ("literal" in p ? [p.literal] : [])), swap.from, swap.to]) assert.ok(!fronts.has(piece), piece);
    for (const front of fronts) assert.doesNotMatch(front, /^-?[lmr]$/);
    const [formulaTable, ...rest] = sheet.tables.get("feelings")!;
    const elsewhere = new Set([...rest, ...[...sheet.tables].filter(([id]) => id !== "feelings").flatMap(([, t]) => t)].flatMap((t) => [...t.header, ...t.rows.flat()].flatMap(spans)));
    for (const form of [...formulaTable!.header, ...formulaTable!.rows.flat()].flatMap(spans)) {
      if (!elsewhere.has(form)) assert.ok(!fronts.has(form), form);
    }
    assert.ok(!fronts.has(spans(sheet.tables.get("sounds")![0]!.rows.at(-1)![0]!)[0]!), "the x sound");
  });

  it("drills each ending scale once: later rows of a table get their -m form, with -l and -r on the back", () => {
    const byFront = new Map(pack.notes.map((n) => [n.fields.front, n]));
    for (const section of ["settled", "how-you-know", "allowed"]) {
      for (const t of sheet.tables.get(section)!) {
        const endingCols = t.header.flatMap((h, j) => (/^`-[lmr]`/.test(h.trim()) ? [j] : []));
        t.rows.forEach((row, r) => {
          const forms = endingCols.map((j) => spans(row[j] ?? "")[0]!);
          const main = forms.find((f) => f.endsWith("m"))!;
          if (r === 0) {
            for (const f of forms) assert.ok(byFront.has(f), `${f}: first row of its table has no note`);
            return;
          }
          const also = byFront.get(main)?.meanings[0]?.also?.map((a) => a.form) ?? [];
          for (const f of forms.filter((f) => f !== main)) {
            assert.ok(!byFront.has(f), `${f}: a later row's -l / -r form has a note of its own`);
            assert.ok(also.includes(f), `${f}: not on the back of ${main}`);
          }
        });
      }
    }
    assert.match(byFront.get("thawetham")!.fields.meaning, /<div class="also">thawethal /);
    assert.ok(byFront.has("thawethel") && byFront.has("thawether"), "a later stance table's first row keeps every ending");
  });

  it("joins a form's meanings from two places into one note", () => {
    const joined = pack.notes.filter((n) => n.meanings.length > 1);
    assert.ok(joined.length >= 1);
    for (const note of joined) assert.equal(note.fields.meaning.split("<br>").length, note.meanings.length);
  });

  it("orders notes by deck, and each deck's notes by lesson", () => {
    assert.deepEqual(pack.notes, pack.decks.flatMap((d) => d.notes));
    for (const d of pack.decks) {
      assert.match(d.name, /^Claritish::\d\d /);
      for (const n of d.notes) assert.equal(n.lesson.slug, d.slug);
    }
    const order = lessons.map((l) => l.slug);
    const deckOrder = pack.decks.map((d) => order.indexOf(d.slug));
    assert.deepEqual(deckOrder, [...deckOrder].sort((a, b) => a - b));
  });

  it("tags every note with the pack, its lesson, and the release", () => {
    assert.match(pack.releaseId, /^[0-9a-f]{8}$/);
    for (const note of pack.notes) assert.deepEqual(note.tags, ["claritish", `claritish::lesson::${note.lesson.slug}`, `claritish::release::${pack.releaseId}`]);
  });
});

describe("Claritish note identity", () => {
  it("is stable across two runs", () => {
    const again = loadClaritishPack(claritishLessons);
    assert.deepEqual(again.notes.map((n) => n.guid), pack.notes.map((n) => n.guid));
    assert.deepEqual(again.decks.map((d) => d.id), pack.decks.map((d) => d.id));
    assert.equal(again.releaseId, pack.releaseId);
    assert.equal(claritishTsv(again), claritishTsv(pack));
  });

  it("keeps the GUID when a meaning changes, and changes the release id", () => {
    const note = pack.notes.find((n) => n.meanings[0]!.detail && n.section === "settled")!;
    const detail = note.meanings[0]!.detail!;
    const edited = buildClaritishPack(sheetMarkdown.replace(`\`${note.form}\` ${detail}`, `\`${note.form}\` ${detail} (edited)`), lessons);
    const after = edited.notes.find((n) => n.fields.front === note.form)!;
    assert.notEqual(after.fields.meaning, note.fields.meaning);
    assert.equal(after.guid, note.guid);
    assert.notEqual(edited.releaseId, pack.releaseId);
  });

  it("gives a respelled form a new GUID", () => {
    const note = pack.notes[0]!;
    const respelled = `${note.form}zz`;
    const swap = (md: string) => md.replaceAll(`\`${note.form}\``, `\`${respelled}\``);
    const edited = buildClaritishPack(swap(sheetMarkdown), lessons.map((l) => ({ ...l, markdown: swap(l.markdown) })));
    const after = edited.notes.find((n) => n.fields.front === respelled)!;
    assert.ok(after);
    assert.notEqual(after.guid, note.guid);
    assert.equal(after.guid, claritishGuid(note.section, respelled));
    assert.ok(!edited.notes.some((n) => n.guid === note.guid));
  });
});

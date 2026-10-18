import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { levelReviewPage, readingOrder } from "../docs/grammar/.vitepress/lib/reading-order.js";
import { CLOSED } from "./closed-roots.js";
import { NOT_CORE_ROOTS } from "./core-vocabulary.js";
import {
  buildNotes,
  buildPack,
  loadFlashcardInputs,
  noteGuid,
  packTsv,
  productionGlosses,
  sakeInventoryRoots,
} from "./flashcards.js";
import { sidebarPage } from "./lint/learning-order.js";

const pages = [...readingOrder.map((item) => ({ page: sidebarPage(item.link), title: item.text })), { page: levelReviewPage, title: "Review" }];
const inputs = loadFlashcardInputs(pages, levelReviewPage);
const notes = buildNotes(inputs);
const SAKES = [CLOSED.ballot, CLOSED.tool, CLOSED.lightbulb, CLOSED.compass, CLOSED.knot, CLOSED.present, CLOSED.strawberry, CLOSED.lungs, CLOSED.egg];

describe("buildNotes", () => {
  it("makes one note per published root, compound, and sake sense form", () => {
    assert.equal(notes.roots.length, inputs.published.length);
    assert.equal(notes.compounds.length, inputs.compounds.length);
    const senseForms = new Set(inputs.overlays.filter((r) => r.kind === "sake").map((r) => r.senseForm));
    assert.equal(notes.overlays.length, senseForms.size);
  });

  it("collapses the th / w rows of a sake into one note tagged with both", () => {
    const rows = inputs.overlays.filter((r) => r.kind === "sake" && r.senseForm === inputs.overlays[0]!.senseForm);
    assert.ok(rows.length >= 2);
    const note = notes.overlays.find((n) => n.key === rows[0]!.senseForm)!;
    for (const { pos } of rows) assert.ok(note.tags.includes(`agazan::pos::${pos}`), pos);
    assert.ok(note.tags.includes("agazan::stage::beginner"));
    assert.equal(note.fields.concrete, rows[0]!.gloss);
    assert.equal(note.fields.abstract, rows[0]!.definition);
  });

  it("derives GUIDs from source and key, not row order", () => {
    const reversed = buildNotes({ ...inputs, published: [...inputs.published].reverse() });
    const guid = new Map(reversed.roots.map((n) => [n.key, n.guid]));
    for (const n of notes.roots) assert.equal(guid.get(n.key), n.guid);
    assert.equal(notes.roots[0]!.guid, noteGuid("root", notes.roots[0]!.key));
    const all = [...notes.roots, ...notes.compounds, ...notes.overlays].map((n) => n.guid);
    assert.equal(new Set(all).size, all.length);
  });

  it("shows a compound's parts with each root's concrete gloss", () => {
    const row = inputs.compounds.find((r) => inputs.published.some((p) => p.root === r.left) && inputs.published.some((p) => p.root === r.right))!;
    const gloss = (root: string) => inputs.published.find((p) => p.root === root)!.concrete;
    const note = notes.compounds.find((n) => n.key === row.stem)!;
    assert.equal(note.fields.parts, `${row.left} (${gloss(row.left)}) + ${row.join} + ${row.right} (${gloss(row.right)})`);
  });

  it("gives no two production fronts the same glosses", () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const n of [...notes.roots, ...notes.compounds, ...notes.overlays]) {
      const key = productionGlosses(n);
      if (seen.has(key)) dupes.push(`${seen.get(key)} / ${n.key}: ${key}`);
      else seen.set(key, n.key);
    }
    assert.deepEqual(dupes, []);
  });
});

describe("packs", () => {
  it("Core: one subdeck per checkpoint with new words, in path order", () => {
    const core = buildPack("core", notes, inputs);
    const order = new Map(inputs.checkpoints.map((c, i) => [c.anchor, i]));
    const at = core.decks.map((d) => order.get(d.notes[0]!.core)!);
    assert.deepEqual(at, [...at].sort((a, b) => a - b));
    core.decks.forEach((d, i) => {
      assert.match(d.name, new RegExp(`^Agazan::Core::${String(i + 1).padStart(2, "0")} `));
      assert.equal(new Set(d.notes.map((n) => n.core)).size, 1, d.name);
    });
    const packed = core.decks.flatMap((d) => d.notes.map((n) => n.key));
    const coreKeys = [...notes.roots, ...notes.compounds].filter((n) => n.core).map((n) => n.key);
    assert.deepEqual([...packed].sort(), [...coreKeys].sort());
    assert.ok(!packed.some((k) => NOT_CORE_ROOTS.has(k)));
    assert.ok(!core.decks.some((d) => d.notes[0]!.core.startsWith(`${levelReviewPage}#`)));
  });

  it("Sakes: nine roots, each followed by its sake overlay, in inventory order", () => {
    const [deck] = buildPack("sakes", notes, inputs).decks;
    assert.equal(deck!.notes.length, 18);
    assert.deepEqual(new Set(inputs.sakeRoots), new Set(SAKES));
    deck!.notes.forEach((n, i) => {
      assert.equal(n.source, i % 2 === 0 ? "root" : "overlay");
      if (i % 2 === 0) assert.equal(n.key, inputs.sakeRoots[i / 2]);
      else assert.equal(n.fields.kind, "sake");
    });
  });

  it("Everything: all roots and compounds, one deck per source", () => {
    const decks = buildPack("everything", notes, inputs).decks;
    assert.deepEqual(decks.map((d) => [d.name, d.notes.length]), [
      ["Agazan::Everything::Roots", inputs.published.length],
      ["Agazan::Everything::Compounds", inputs.compounds.length],
    ]);
  });

  it("writes one TSV line per note under the header", () => {
    const pack = buildPack("sakes", notes, inputs);
    const lines = packTsv(pack).trimEnd().split("\n");
    assert.equal(lines.filter((l) => !l.startsWith("#")).length, 18);
    assert.ok(lines.filter((l) => !l.startsWith("#")).every((l) => l.split("\t").length === 10));
  });
});

describe("sakeInventoryRoots", () => {
  it("reads the first column of the inventory table", () => {
    const md = "### Sake inventory {#sake-inventory}\n\n| Agazan | Use |\n|---|---|\n| **`ahu`** | autonomy |\n| **`ulo`** | competence |\n\nAfter.\n";
    assert.deepEqual(sakeInventoryRoots(md), ["ahu", "ulo"]);
  });
});

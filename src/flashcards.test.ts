import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isLevelReview, lessonPages, levelReviewPages } from "../docs/grammar/.vitepress/lib/reading-order.js";
import { CLOSED } from "./closed-roots.js";
import { NOT_CORE_ROOTS } from "./core-vocabulary.js";
import {
  anchorCheckpoint,
  buildNotes,
  coveredByEndingNote,
  LEXICAL_ENDING_FORMS,
  buildPack,
  loadFlashcardInputs,
  noteGuid,
  packTsv,
  releaseId,
  productionGlosses,
  sakeInventoryRoots,
} from "./flashcards.js";
import { overlayExamples, overlayRowKey } from "./flashcards-examples.js";
import { loadDefaultTables } from "./parse/index.js";
import { morphGlossLine } from "./parse/morph-gloss.js";

const pages = lessonPages();
const inputs = loadFlashcardInputs(pages, levelReviewPages);
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
    for (const { pos } of rows) assert.ok(note.tags.includes(`ageben::pos::${pos}`), pos);
    assert.ok(note.tags.includes("ageben::stage::beginner"));
    assert.equal(note.fields.concrete, rows[0]!.gloss);
    assert.equal(note.fields.abstract, rows[0]!.definition);
  });

  it("derives GUIDs from source, spelling and concrete gloss, not row order", () => {
    const reversed = buildNotes({ ...inputs, published: [...inputs.published].reverse() });
    const guid = new Map(reversed.roots.map((n) => [n.key, n.guid]));
    for (const n of notes.roots) assert.equal(guid.get(n.key), n.guid);
    for (const n of notes.roots) assert.equal(n.guid, noteGuid("root", n.key, n.fields.concrete));
    for (const n of notes.compounds) assert.equal(n.guid, noteGuid("compound", n.key, n.fields.concrete));
    for (const n of notes.overlays) assert.equal(n.guid, noteGuid("overlay", n.key, n.fields.concrete));
    const all = [...notes.roots, ...notes.compounds, ...notes.overlays].map((n) => n.guid);
    assert.equal(new Set(all).size, all.length);
  });

  it("keeps the GUID through an alias or mnemonic edit; a respelling or new gloss makes a new one", () => {
    const [a, b] = inputs.published;
    const edited = buildNotes({ ...inputs, published: [{ ...a!, mnemonic: `${a!.mnemonic} x`, englishAliases: ["zz"] }, ...inputs.published.slice(1)] });
    assert.equal(edited.roots[0]!.guid, notes.roots[0]!.guid);
    // A retie hands row a the old spelling of row b: the note must not inherit b's history.
    const retied = buildNotes({ ...inputs, published: [{ ...a!, root: b!.root }, ...inputs.published.slice(1)] });
    assert.notEqual(retied.roots[0]!.guid, notes.roots[1]!.guid);
    assert.notEqual(retied.roots[0]!.guid, notes.roots[0]!.guid);
    const reglossed = buildNotes({ ...inputs, published: [{ ...a!, concrete: `${a!.concrete} x` }, ...inputs.published.slice(1)] });
    assert.notEqual(reglossed.roots[0]!.guid, notes.roots[0]!.guid);
  });

  it("tags every note with one release id that changes only when content changes", () => {
    const all = [...notes.roots, ...notes.compounds, ...notes.overlays];
    const id = releaseId(all);
    assert.match(id, /^[0-9a-f]{8}$/);
    for (const n of all) assert.equal(n.tags.filter((t) => t.startsWith("ageben::release::")).join(), `ageben::release::${id}`, n.key);
    const reversed = buildNotes({ ...inputs, published: [...inputs.published].reverse() });
    assert.equal(releaseId([...reversed.roots, ...reversed.compounds, ...reversed.overlays]), id);
    assert.equal(releaseId(all.map((n) => ({ ...n, tags: [] }))), id);
    const [a] = inputs.published;
    const edited = buildNotes({ ...inputs, published: [{ ...a!, mnemonic: `${a!.mnemonic} x` }, ...inputs.published.slice(1)] });
    assert.notEqual(releaseId([...edited.roots, ...edited.compounds, ...edited.overlays]), id);
  });

  it("tags core words and overlays with the checkpoint that first drills them", () => {
    for (const n of [...notes.roots, ...notes.compounds]) {
      const cps = n.tags.filter((t) => t.startsWith("ageben::cp::"));
      if (!n.core) {
        assert.deepEqual(cps, [], n.key);
        continue;
      }
      const cp = inputs.checkpoints.find((c) => c.anchor === n.core)!;
      assert.deepEqual(cps, [`ageben::cp::${cp.page.replace(/\.md$/, "")}::${cp.band}`], n.key);
    }
    for (const n of notes.overlays) assert.equal(n.tags.filter((t) => t.startsWith("ageben::cp::")).length, 1, n.key);
    assert.ok(!notes.roots.some((n) => n.tags.some((t) => t.startsWith("ageben::core::"))));
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
      assert.match(d.name, new RegExp(`^Ageben::Core::${String(i + 1).padStart(2, "0")} `));
      assert.equal(new Set(d.notes.map((n) => n.core)).size, 1, d.name);
    });
    const packed = core.decks.flatMap((d) => d.notes.map((n) => n.key));
    const coreKeys = [...notes.roots, ...notes.compounds].filter((n) => n.core).map((n) => n.key);
    assert.deepEqual([...packed].sort(), [...coreKeys].sort());
    assert.ok(!packed.some((k) => NOT_CORE_ROOTS.has(k)));
    assert.ok(!core.decks.some((d) => isLevelReview(d.notes[0]!.core.split("#")[0]!)));
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
      ["Ageben::Everything::Roots", inputs.published.length],
      ["Ageben::Everything::Compounds", inputs.compounds.length],
    ]);
  });

  it("writes one TSV line per note under the header", () => {
    const pack = buildPack("sakes", notes, inputs);
    const lines = packTsv(pack).trimEnd().split("\n");
    assert.equal(lines.filter((l) => !l.startsWith("#")).length, 18);
    assert.ok(lines.filter((l) => !l.startsWith("#")).every((l) => l.split("\t").length === 10));
  });
});

describe("anchorCheckpoint", () => {
  it("maps every overlay row's anchor to a checkpoint on its page, in its band", () => {
    const missing = inputs.overlays.filter((r) => !anchorCheckpoint(r.anchor, inputs)).map((r) => `${r.senseForm} ${r.anchor}`);
    assert.deepEqual(missing, []);
    for (const row of inputs.overlays) {
      const cp = anchorCheckpoint(row.anchor, inputs)!;
      assert.equal(cp.page, row.anchor.split("#")[0]);
      assert.equal(cp.band, inputs.anchorBand(row.anchor));
      assert.equal(cp.tag, `ageben::cp::${cp.page.replace(/\.md$/, "")}::${cp.band}`);
      assert.ok(inputs.checkpoints.some((c) => c.anchor === `${cp.page}#${cp.id}` && !c.review));
    }
  });

  it("maps a checkpoint heading to itself and an unknown anchor to nothing", () => {
    const cp = inputs.checkpoints.find((c) => !c.review)!;
    assert.equal(anchorCheckpoint(cp.anchor, inputs)?.anchor, cp.anchor);
    assert.equal(anchorCheckpoint("clause.md#no-such-section", inputs), undefined);
  });
});

describe("sakeInventoryRoots", () => {
  it("reads the first column of the inventory table", () => {
    const md = "### Sake inventory {#sake-inventory}\n\n| Ageben | Use |\n|---|---|\n| **`ahu`** | autonomy |\n| **`ulo`** | competence |\n\nAfter.\n";
    assert.deepEqual(sakeInventoryRoots(md), ["ahu", "ulo"]);
  });
});

describe("overlayExamples", () => {
  const tables = loadDefaultTables();
  const started = performance.now();
  const examples = overlayExamples(inputs.overlays, inputs, tables);
  const elapsed = Math.round(performance.now() - started);

  it("gives every overlay row an example, except the -l / -r forms an ending note covers", (t) => {
    t.diagnostic(`overlayExamples: ${inputs.overlays.length} rows in ${elapsed} ms`);
    const missing = inputs.overlays
      .filter((row) => !coveredByEndingNote(row) && !examples.has(overlayRowKey(row)))
      .map((row) => overlayRowKey(row));
    assert.deepEqual(missing, [], `overlay rows with no example (sense_form@pos anchor):\n${missing.join("\n")}`);
  });

  it("exempts only scale-ending -l / -r forms, never the lexical ones", () => {
    assert.ok(coveredByEndingNote({ kind: "evidential", senseForm: "ubol" }));
    assert.ok(!coveredByEndingNote({ kind: "evidential", senseForm: "ubom" }));
    assert.ok(!coveredByEndingNote({ kind: "may", senseForm: "omal" }));
    for (const form of LEXICAL_ENDING_FORMS) assert.ok(!coveredByEndingNote({ kind: "phasal", senseForm: form }), form);
  });

  it("glosses every example with the page glosser, naming the overlay's slot word", () => {
    const unnamed: string[] = [];
    for (const row of inputs.overlays) {
      const example = examples.get(overlayRowKey(row));
      if (!example) continue;
      assert.ok(example.gloss.trim(), overlayRowKey(row));
      assert.equal(example.gloss, morphGlossLine(example.text, tables, { strict: true }));
      // The slot word's gloss: the row's gloss, or the parser's label for it, which the definition names.
      const labels = example.gloss.split("|").map((w) => w.replace(/[[\]{}]/g, "").trim().replace(/^[a-z]+-/, ""));
      if (!example.gloss.includes(row.gloss) && !labels.some((l) => l && row.definition.includes(l))) unnamed.push(`${overlayRowKey(row)}: ${example.gloss}`);
    }
    assert.deepEqual(unnamed, []);
  });

  // A small page: a short example outside the anchor section, a longer one inside it, and a lone citation.
  const page = [
    "# Page",
    "",
    "## Elsewhere {#elsewhere}",
    "",
    "Short: `zazozon thomam`.",
    "",
    "## Taught {#taught}",
    "",
    "Citation: `thomam`. Sentence: `zalazun thomam dahelan vudurul.`",
    "",
    "## Cited only {#cited}",
    "",
    "Citation: `thomam`.",
    "",
    "### Practice {#practice}",
    "",
  ].join("\n");
  const sectionOf = (id: string) => {
    const offset = page.indexOf(`{#${id}}`);
    const next = page.indexOf("\n#", offset);
    return { band: "beginner" as const, line: page.slice(0, offset).split("\n").length, offset: page.lastIndexOf("\n", offset) + 1, end: next < 0 ? page.length : next + 1 };
  };
  const fake = {
    checkpoints: [{ anchor: "p.md#practice", page: "p.md", band: "beginner", line: page.split("\n").indexOf("### Practice {#practice}") + 1, review: false }] as unknown as typeof inputs.checkpoints,
    anchorSection: (anchor: string) => sectionOf(anchor.split("#")[1]!),
    pageText: () => page,
  };
  const may = inputs.overlays.find((r) => r.senseForm === "omam" && r.pos === "th")!;

  it("prefers an example in the anchor section over a shorter one elsewhere on the page", () => {
    const example = overlayExamples([{ ...may, anchor: "p.md#taught" }], fake, tables).get(overlayRowKey({ ...may, anchor: "p.md#taught" }));
    assert.equal(example?.text, "zalazun thomam dahelan vudurul.");
    assert.equal(example?.from, "section");
  });

  it("never takes a lone citation; falls back to the rest of the page", () => {
    const row = { ...may, anchor: "p.md#cited" };
    const example = overlayExamples([row], fake, tables).get(overlayRowKey(row));
    assert.equal(example?.text, "zazozon thomam");
    assert.equal(example?.from, "page");
  });
});

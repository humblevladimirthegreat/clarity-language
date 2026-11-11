import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";

import { glossLabels, lintTerminology } from "./terminology-docs.js";

const tables = loadDefaultTables();

const SAKES = [
  "# Sakes",
  "",
  "### Emotion compose {#emotion-compose}",
  "",
  "`zobewom guwathamar` and `wuwathuraer`.",
].join("\n");

function terminology(rows: string[], body = ""): string {
  return ["# Terminology", "", "### Mood labels", "", "| Label | Gloss | Example | Teach |", "|---|---|---|---|", ...rows, "", body].join("\n");
}

function lint(markdown: string, labels: string[]) {
  const pages = new Map([["sakes.md", SAKES], ["terminology.md", markdown]]);
  return lintTerminology(markdown, pages, tables, new Set(labels), new Map([["sakes.md", "Sakes"]])).map((f) => f.detail);
}

const STAYING = "| **STAYING** | stay in it | `guwathamar` | [Sakes](sakes.md#emotion-compose) |";

describe("lintTerminology", () => {
  it("passes a current row", () => {
    assert.deepEqual(lint(terminology([STAYING]), ["STAYING"]), []);
  });

  it("collects overlay and glosser labels", () => {
    const labels = glossLabels(tables.overlays.values());
    for (const label of ["MEMORY", "STAYING", "FLEETING", "CITE"]) assert.ok(labels.has(label), label);
  });

  it("flags a printed label with no row", () => {
    assert.match(lint(terminology([STAYING]), ["STAYING", "HELD"]).join("\n"), /print HELD/);
  });

  it("flags a row whose example lacks the label or is not on the page", () => {
    const wrong = "| **HELD** | stuck on the spot | `guwathamar` | [Sakes](sakes.md#emotion-compose) |";
    assert.match(lint(terminology([wrong]), ["HELD"]).join("\n"), /without HELD/);
    const missing = "| **HELD** | stuck on the spot | `wuwathuraol` | [Sakes](sakes.md#emotion-compose) |";
    assert.match(lint(terminology([missing]), ["HELD"]).join("\n"), /does not appear on sakes\.md/);
  });

  it("flags a row no morph line prints and the page never uses", () => {
    const stale = "| **ACT** | arousal | `guwathamar` | [Sakes](sakes.md#emotion-compose) |";
    assert.match(lint(terminology([stale]), []).join("\n"), /drop the row/);
  });

  it("flags stale forms, bare roots, anchors and link names in entries", () => {
    const body = [
      "### Emotion",
      "",
      "Say `wonathonar` with **ACT**; the root `ezuyo`.",
      "",
      "[Feelings](sakes.md#nowhere)",
    ].join("\n");
    const out = lint(terminology([STAYING], body), ["STAYING"]).join("\n");
    assert.match(out, /`wonathonar` does not appear/);
    assert.match(out, /\*\*ACT\*\*/);
    assert.match(out, /bare root `ezuyo`/);
    assert.match(out, /sakes\.md#nowhere is not an anchor/);
    assert.match(out, /link text "Feelings"/);
  });
});

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
  "`zebeyom gulothamar` and `wulothuraor`.",
].join("\n");

function terminology(rows: string[], body = ""): string {
  return ["# Terminology", "", "### Mood tags", "", "| Label | Gloss | Example | Teach |", "|---|---|---|---|", ...rows, "", body].join("\n");
}

function lint(markdown: string, labels: string[]) {
  const pages = new Map([["sakes.md", SAKES], ["terminology.md", markdown]]);
  return lintTerminology(markdown, pages, tables, new Set(labels), new Map([["sakes.md", "Sakes"]])).map((f) => f.detail);
}

const INTERNAL = "| **INTERNAL** | held inside | `gulothamar` | [Sakes](sakes.md#emotion-compose) |";

describe("lintTerminology", () => {
  it("passes a current row", () => {
    assert.deepEqual(lint(terminology([INTERNAL]), ["INTERNAL"]), []);
  });

  it("collects overlay and glosser labels", () => {
    const labels = glossLabels(tables.overlays.values());
    for (const label of ["WITNESSED", "PERMIT", "INTERNAL", "SURGING", "CITE"]) assert.ok(labels.has(label), label);
  });

  it("flags a printed label with no row", () => {
    assert.match(lint(terminology([INTERNAL]), ["INTERNAL", "CIRCUM"]).join("\n"), /print CIRCUM/);
  });

  it("flags a row whose example lacks the label or is not on the page", () => {
    const wrong = "| **CIRCUM** | atmosphere | `gulothamar` | [Sakes](sakes.md#emotion-compose) |";
    assert.match(lint(terminology([wrong]), ["CIRCUM"]).join("\n"), /without CIRCUM/);
    const missing = "| **CIRCUM** | atmosphere | `wulothuraol` | [Sakes](sakes.md#emotion-compose) |";
    assert.match(lint(terminology([missing]), ["CIRCUM"]).join("\n"), /does not appear on sakes\.md/);
  });

  it("flags a row no morph line prints and the page never uses", () => {
    const stale = "| **ACT** | arousal | `gulothamar` | [Sakes](sakes.md#emotion-compose) |";
    assert.match(lint(terminology([stale]), []).join("\n"), /drop the row/);
  });

  it("flags stale forms, bare roots, anchors and link names in entries", () => {
    const body = [
      "### Emotion",
      "",
      "Say `wonathumer` with **ACT**; the root `ezebe`.",
      "",
      "[Feelings](sakes.md#nowhere)",
    ].join("\n");
    const out = lint(terminology([INTERNAL], body), ["INTERNAL"]).join("\n");
    assert.match(out, /`wonathumer` does not appear/);
    assert.match(out, /\*\*ACT\*\*/);
    assert.match(out, /bare root `ezebe`/);
    assert.match(out, /sakes\.md#nowhere is not an anchor/);
    assert.match(out, /link text "Feelings"/);
  });
});

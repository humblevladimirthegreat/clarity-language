import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadParadigmBlocks } from "./load.js";
import { paradigmLines, parseParadigmBlocks, siteLink, tableCells } from "./paradigms.js";

const SHEET = [
  "# Sheet",
  "",
  "## Ranks {#ranks}",
  "",
  "| Ageben | Use | English | Stage |",
  "|--------|-----|---------|-------|",
  "| [Rank `o` (`zol`)](/comparatives#comparatives) | rank | *more … than* | B |",
  "| [Tie `oe` (`zoel`)](/comparatives#old-equatives) | tie | *as … as* | B |",
  "",
  "| Job | Example | Stage |",
  "|-----|---------|-------|",
  "| [Amount](/comparative-arity#amount-scale) | `zogozelx zodozelx zol gral.` | I |",
  "",
  "## Other {#other}",
  "",
  "| Form | Meaning |",
  "|------|---------|",
  "| `a|b` | [pipe](/hooks#hooks) |",
].join("\n");
const canonical = (link: string) => (link === "comparatives.md#old-equatives" ? "comparatives.md#equatives" : link);
const blocks = parseParadigmBlocks("cheat-sheets/test.md", SHEET, canonical);

describe("paradigm blocks", () => {
  it("splits cells on pipes outside code spans", () => {
    assert.deepEqual(tableCells("| `a|b` | x \\| y |"), ["`a|b`", "x | y"]);
  });

  it("reads site links as grammar pages", () => {
    assert.equal(siteLink("/comparatives#equatives"), "comparatives.md#equatives");
    assert.equal(siteLink("/hooks"), "hooks.md");
    assert.equal(siteLink("/cheat-sheets/numbers#x"), undefined);
    assert.equal(siteLink("https://example.com"), undefined);
  });

  it("reads one block per table, links resolved, the Stage column dropped", () => {
    assert.deepEqual(
      blocks.map((b) => [b.heading, b.rows.length]),
      [
        ["Ranks", 2],
        ["Ranks", 1],
        ["Other", 1],
      ],
    );
    assert.deepEqual(blocks[0]!.rows[1]!.links, ["comparatives.md#equatives"]);
    assert.equal(blocks[0]!.rows[0]!.line, "- Rank `o` (`zol`) — rank — more … than");
    assert.equal(blocks[0]!.rows[0]!.lean, "- `o` / `zol` — more … than");
    assert.equal(blocks[2]!.rows[0]!.lean, "- `a|b`");
  });

  it("widens with the reach", () => {
    const lean = (reach: Parameters<typeof paradigmLines>[2]) => paradigmLines(blocks, ["comparatives.md#equatives"], reach, "lean").filter((l) => l.startsWith("- "));
    assert.deepEqual(lean("rows"), ["- `oe` / `zoel` — as … as"]);
    assert.equal(lean("table").length, 2);
    assert.equal(lean("page").length, 2);
    assert.equal(lean("sheet").length, 4);
    assert.deepEqual(paradigmLines(blocks, [], "sheet"), []);
  });

  it("fills a cap nearest first", () => {
    const capped = paradigmLines(blocks, ["comparatives.md#equatives"], "sheet", "lean", 80, "nearest");
    assert.ok(capped.includes("- `oe` / `zoel` — as … as"));
    assert.ok(!capped.some((l) => l.includes("gral")));
  });

  it("indexes every cheat sheet", () => {
    const all = loadParadigmBlocks();
    assert.ok(all.length > 100);
    assert.ok(all.every((b) => b.sheet.startsWith("cheat-sheets/")));
    // Rows link canonical sections: a pinned old id resolves to its heading's id.
    assert.ok(all.some((b) => b.rows.some((r) => r.links.includes("comparatives.md#comparatives"))));
  });
});

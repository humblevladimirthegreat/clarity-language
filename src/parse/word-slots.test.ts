import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { grammarHeadings } from "../lint/grammar-anchors.js";
import { grammarFile, readData } from "../repo-paths.js";
import { REJECTIONS } from "./constructions.js";
import { parseWordSlotsCsv, SLOT_FEATURES, WORD_SLOTS_FILE } from "./word-slots.js";

const slots = parseWordSlotsCsv(readData(WORD_SLOTS_FILE));

describe("word-slots.csv", () => {
  it("names a rejection in REJECTIONS on every row", () => {
    assert.ok(slots.size > 0);
    const unknown = [...slots.values()].filter((row) => !(row.rejection in REJECTIONS)).map((row) => `${row.feature}: ${row.rejection}`);
    assert.deepEqual(unknown, []);
  });

  it("has letters for every feature enforce reads", () => {
    assert.deepEqual(SLOT_FEATURES.filter((feature) => !slots.get(feature)?.letters), []);
  });

  // Same rule as the registry anchors (constructions.test.ts): a grammar page heading id.
  it("anchors resolve to a grammar page heading id", () => {
    const anchorsByPage = new Map<string, Set<string>>();
    const broken: string[] = [];
    for (const row of slots.values()) {
      const [page, fragment] = row.anchor.split("#") as [string, string];
      const path = grammarFile(page);
      if (!existsSync(path)) {
        broken.push(`${row.feature}: ${row.anchor}`);
        continue;
      }
      let anchors = anchorsByPage.get(page);
      if (!anchors) {
        anchors = new Set(grammarHeadings(readFileSync(path, "utf8")).map((h) => h.id));
        anchorsByPage.set(page, anchors);
      }
      if (!anchors.has(fragment)) broken.push(`${row.feature}: ${row.anchor}`);
    }
    assert.deepEqual(broken, []);
  });
});

describe("parseWordSlotsCsv", () => {
  const header = "feature,rejection,letters,endings,note,anchor\n";

  it("reads space-separated letters and endings, empty as no limit", () => {
    const parsed = parseWordSlotsCsv(`${header}sake word,sakeSlot,g th w,,,sakes.md#a\nsake ending,sakeEnding,,l m r,,sakes.md#b\n`);
    assert.deepEqual([...parsed.get("sake word")!.letters!], ["g", "th", "w"]);
    assert.equal(parsed.get("sake word")!.endings, null);
    assert.equal(parsed.get("sake ending")!.letters, null);
    assert.deepEqual([...parsed.get("sake ending")!.endings!], ["l", "m", "r"]);
  });

  it("rejects a wrong header, an unknown letter, a bad anchor and a duplicate feature", () => {
    assert.throws(() => parseWordSlotsCsv("feature,rejection,letters,anchor\n"), /header/);
    assert.throws(() => parseWordSlotsCsv(`${header}a,sakeSlot,g q,,,sakes.md#a\n`), /unknown PoS letter q/);
    assert.throws(() => parseWordSlotsCsv(`${header}a,sakeSlot,g,,,sakes.md\n`), /not page.md#id/);
    assert.throws(() => parseWordSlotsCsv(`${header}a,sakeSlot,g,,,sakes.md#a\na,sakeSlot,w,,,sakes.md#a\n`), /duplicate feature a/);
  });
});

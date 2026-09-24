import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createClassifyTables, createClassifyTablesFromRows } from "./classify.js";
import { parse } from "./index.js";
import { parseWord } from "./word.js";
import { classifyHits } from "./classify.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);

describe("checkAmbiguity", () => {
  it("is off by default (no ambiguity field)", () => {
    const result = parse("zazawan vawalal.", tables);
    assert.equal(result.ambiguity, undefined);
  });

  it("returns an empty list when the flag is on and nothing residual collides", () => {
    const result = parse("zazawan vawalal.", tables, { checkAmbiguity: true });
    assert.deepEqual(result.ambiguity, []);
  });

  it("does not treat overlay-vs-published as unresolved (closed overlay rule)", () => {
    const sense = [...tables.overlays.values()].find(
      (o) => o.pos === "th" && /live evidential/i.test(o.definition),
    );
    assert.ok(sense);
    const result = parse(`th${sense.senseForm}.`, tables, { checkAmbiguity: true });
    assert.deepEqual(result.ambiguity, []);
  });

  it("does not treat span-close vs type-u open twin as unresolved", () => {
    const result = parse("daxal zadagal xuxul vawalal.", tables, { checkAmbiguity: true });
    assert.equal(
      result.ambiguity?.some((c) => c.surface === "xuxul"),
      false,
    );
  });

  it("flags overlay vs restrictor when both apply with no grammar winner", () => {
    const planted = createClassifyTablesFromRows(
      [],
      [
        {
          senseForm: "al",
          pos: "h",
          emoji: "",
          kind: "evidential",
          gloss: "planted",
          definition: "planted overlay",
          mnemonic: "",
        },
      ],
    );
    const hits = classifyHits(parseWord("hal"), planted);
    assert.ok(hits.some((h) => h.source === "overlay"));
    assert.ok(hits.some((h) => h.source === "restrictor"));
    const result = parse("hal.", planted, { checkAmbiguity: true });
    assert.ok(result.ambiguity?.some((c) => c.stage === "classify" && c.sources.includes("overlay")));
  });
});

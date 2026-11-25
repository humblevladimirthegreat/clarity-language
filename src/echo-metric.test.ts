import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { CMU_PATH } from "./cmu-dict.ts";
import { deriveLegalOnsets, LEGAL_ONSETS } from "./echo-metric.ts";

describe("legal onsets", () => {
  it("keeps a word-initial cluster only when at least 20 words start with it", () => {
    const lines = [
      ...Array.from({ length: 20 }, (_, i) => `str${i} S T R IY1 T`),
      ...Array.from({ length: 19 }, (_, i) => `vl${i} V L AA1 D`),
      "apple AE1 P AH0 L",
    ];
    assert.deepEqual([...deriveLegalOnsets(lines.join("\n"))], ["S T R"]);
  });

  // The constant stands in for the download; this guards it wherever the cache exists (node scripts/echo-pronunciation.ts fetches it).
  it("matches the pinned CMU dictionary", { skip: !existsSync(CMU_PATH) && "no cached CMU dictionary" }, () => {
    assert.deepEqual([...LEGAL_ONSETS].sort(), [...deriveLegalOnsets(readFileSync(CMU_PATH, "utf8"))].sort());
  });
});

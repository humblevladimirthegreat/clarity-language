import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { parseWithTables } from "../parse/parse-core.js";
import { passageText, structureLines, wholeClauseFrameCount } from "./prompt-notes.js";

const tables = loadDefaultTables();

describe("structureLines", () => {
  it("knowing.md#may: one whole-clause frame gives no lines", () => {
    assert.deepEqual(structureLines(["thomam zazozon vowurol."], tables), []);
    assert.equal(wholeClauseFrameCount(["thomam zazozon vowurol."], tables), 1);
  });

  it("holder.md#holder-plans-and-motives: the holder's channel covers the want, named by gloss with a gist", () => {
    const text = "zazozon thebamazozon thalom vowurol.";
    assert.equal(wholeClauseFrameCount([text], tables), 3);
    // The holder and its channel share one word: no line pairs them, and the word is named once with both gists.
    assert.deepEqual(structureLines([text], tables), [
      "`th-REPORTED-Azozon` (whose view; how it is known or how sure) covers `th-WANT-unstated` (a plan, want, or decision).",
    ]);
  });

  it("evidentiality.md#carry-forward: a carried channel is named with the sentence it comes from", () => {
    const text = "zalazun thebam vudurul. zalazun thonumum veruvol.";
    assert.deepEqual(structureLines([text], tables), [
      "In sentence 2, `th-REPORTED` (how it is known or how sure) from sentence 1 still applies, and `th-hostility` (the speaker's feeling about it) covers it.",
    ]);
    // Several inputs are numbered lines in the prompt.
    assert.deepEqual(structureLines(["zalazun thebam vudurul.", "zalazun thonumum veruvol."], tables), [
      "In line 2, `th-REPORTED` (how it is known or how sure) from line 1 still applies, and `th-hostility` (the speaker's feeling about it) covers it.",
    ]);
  });

  it("an unsettled pair is said to be not settled and never ordered", () => {
    const inputs = ["zazozon thebamazozon thalom vowurol."];
    const parsed = parseWithTables(passageText(inputs), tables);
    // No pair is unsettled in the pair table today, so the order is moved to `unordered` by hand, as equal.test.ts does.
    for (const clause of parsed.resolve!.scope!) {
      clause.unordered = clause.order.map((o) => ({ frames: [o.under, o.over], anchors: o.anchors }));
      clause.order = [];
    }
    assert.deepEqual(structureLines(inputs, tables, parsed), [
      "The order of `th-REPORTED-Azozon` (whose view; how it is known or how sure) and `th-WANT-unstated` (a plan, want, or decision) is not settled: either may cover the other.",
    ]);
  });
});

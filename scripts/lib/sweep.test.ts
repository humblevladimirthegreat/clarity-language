import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { countWalk, diffCounts, formatCounts, formatDiff, partKey } from "./sweep.ts";

const left = (reason: string, key: string, unused: string[] = []) => ({ file: "f.md", text: "t", reading: "t:0.0", reason, key, unused });

describe("sweep counts", () => {
  it("partKey reads the key out of a part's text", () => {
    assert.equal(partKey('link hookJob:resume "ar"'), "hookJob:resume");
    assert.equal(partKey("blank"), "blank");
  });

  const walk = {
    kept: 10,
    left: [left("noRow", "joinSeries:ue"), left("noRow", "joinSeries:ue"), left("unused", "hookJob:resume", ['link hookJob:resume "ar"', 'frame shared:equative "x"'])],
    threw: [{ file: "f.md", text: "t", message: "boom" }],
  };

  it("counts left by reason and key, unused by part key, throws by message", () => {
    const c = countWalk(walk);
    assert.deepEqual(c.left, { "noRow joinSeries:ue": 2, "unused hookJob:resume": 1 });
    assert.deepEqual(c.unused, { "hookJob:resume": 1, "shared:equative": 1 });
    assert.deepEqual(c.threw, { boom: 1 });
  });

  it("diffs only the keys that changed, a missing key being zero", () => {
    const a = countWalk(walk);
    const b = countWalk({ ...walk, left: [left("noRow", "joinSeries:ue"), left("noRow", "edge:force")] });
    assert.deepEqual(diffCounts(a, a), []);
    assert.deepEqual(
      diffCounts(a, b).map((c) => `${c.table} ${c.key} ${c.before}>${c.after}`),
      ["left noRow edge:force 0>1", "left noRow joinSeries:ue 2>1", "left unused hookJob:resume 1>0", "unused hookJob:resume 1>0", "unused shared:equative 1>0"],
    );
    assert.deepEqual(formatDiff([]), ["no change since the save"]);
  });

  it("prints the biggest reason first, with its keys by count", () => {
    const lines = formatCounts(countWalk(walk));
    assert.ok(lines.indexOf("left, noRow: 2") < lines.indexOf("left, unused: 1"));
    assert.ok(lines.includes("      2  joinSeries:ue"));
    assert.ok(lines.includes("translate() threw: 1"));
  });
});

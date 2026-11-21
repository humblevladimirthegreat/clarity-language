import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { countWalk, diffCounts, formatCounts, formatDiff, formatTexts, partKey, textsFor } from "./sweep.ts";

const left = (reason: string, key: string, unused: string[] = [], text = "t") => ({ file: "f.md", text, reading: "t:0.0", reason, key, unused });

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

  it("lists the texts behind a reason, a key, a part key or a type", () => {
    const rows = [left("fragment", "lexReading:standIn", [], "herom blarl"), left("fragment", "lexReading:standIn", [], "herom blarl"), left("unused", "edge:force", ['link hookJob:resume "ar"'], "zarx ar")];
    assert.deepEqual(textsFor(rows, ["fragment"]).map((r) => `${r.key} ${r.count} ${r.text}`), ["lexReading:standIn 2 herom blarl"]);
    assert.deepEqual(textsFor(rows, ["hookJob:resume"]).map((r) => r.text), ["zarx ar"]);
    assert.deepEqual(textsFor(rows, ["lexReading"]).map((r) => r.key), ["lexReading:standIn"]);
    assert.ok(formatTexts(textsFor(rows, ["fragment"]), ["fragment"]).includes("     2 | herom blarl  (f.md)"));
    assert.deepEqual(formatTexts([], ["nosuch"]), ["no left reading matches nosuch"]);
  });
});

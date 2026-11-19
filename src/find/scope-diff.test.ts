import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadDefaultTables } from "../parse/index.js";
import { collectExamples, type Example } from "./examples.js";
import { matchQuery, parseFindArgs } from "./pass.js";
import { diffScopeRecords, formatScopeDiff, frameMatches, scopeStrings, type ScopeRecord } from "./scope-diff.js";

const tables = loadDefaultTables();

const record = (index: number, pairs: string[], unordered: string[] = []): ScopeRecord => ({
  file: "docs/a.md",
  line: index + 1,
  index,
  text: `example ${index}`,
  pairs,
  unordered,
});

describe("frameMatches", () => {
  it("takes a family or family/member", () => {
    const frame = { family: "stance", member: "channel" };
    assert.ok(frameMatches(frame, "stance"));
    assert.ok(frameMatches(frame, "stance/channel"));
    assert.ok(!frameMatches(frame, "stance/may"));
    assert.ok(!frameMatches({ family: "stance" }, "stance/channel"));
  });
});

describe("scopeStrings", () => {
  it("names each frame by family, member, spelling and chunk position, whatever the reading's shape", () => {
    const yel = { raw: "yel", at: 0 };
    const tho = { raw: "thobatham", at: 7 };
    const hal = { raw: "hal", at: 1 };
    const example = {
      words: [
        { word: yel, unit: "", position: 0 },
        { word: tho, unit: "", position: 3 },
      ],
      allReadings: [
        {
          order: [{ over: { family: "sake", words: [tho], extra: 1 }, under: { family: "force", words: [yel] } }],
          unordered: [[{ family: "stance", member: "may", words: [tho] }, { family: "occasion", words: [hal] }]],
        },
      ],
    } as unknown as Pick<Example, "words" | "allReadings">;
    assert.deepEqual(scopeStrings(example), {
      pairs: ["over sake thobatham@3 > under force yel@0"],
      unordered: ["unordered occasion hal@1 ~ stance/may thobatham@3"],
    });
  });
});

describe("diffScopeRecords", () => {
  it("lists pairs only at REV and only now, for the current pass's examples", () => {
    const atRev = [record(0, ["over a x@0 > under b y@1"]), record(1, ["over a x@0 > under b y@1"]), record(5, ["p"])];
    const now = [record(0, ["over b y@1 > under a x@0"], ["unordered a x@0 ~ c z@2"]), record(1, ["over a x@0 > under b y@1"])];
    assert.deepEqual(diffScopeRecords(atRev, now), [
      {
        file: "docs/a.md",
        line: 1,
        text: "example 0",
        removed: ["over a x@0 > under b y@1"],
        added: ["over b y@1 > under a x@0", "unordered a x@0 ~ c z@2"],
      },
    ]);
  });

  it("counts an example the old parser missed as having no order there", () => {
    const [diff] = diffScopeRecords([], [record(2, ["p"]), record(3, [])]).map((d) => ({ ...d }));
    assert.deepEqual(diff, { file: "docs/a.md", line: 3, text: "example 2", removed: [], added: ["p"], missingAtRev: true });
    assert.deepEqual(formatScopeDiff(diff!), ["docs/a.md:3  example 2", "  ! does not parse at REV", "  + p"]);
  });
});

describe("scope queries", () => {
  it("pairs --over with the --under that follows it", () => {
    const options = parseFindArgs(["--over", "sake", "--under", "force", "--under", "stance", "--unordered"]);
    assert.deepEqual(options.queries, [
      { kind: "scope", over: "sake", under: "force" },
      { kind: "scope", under: "stance" },
      { kind: "unordered" },
    ]);
    assert.equal(parseFindArgs(["--diff", "HEAD"]).diff, "HEAD");
    assert.throws(() => parseFindArgs(["--diff", "HEAD", "--map", "series=e:o"]), /--diff does not take/);
    assert.throws(() => parseFindArgs(["--over"]), /--over needs a frame/);
  });

  it("matches a clause whose order has the pair and highlights both words", () => {
    const [example] = collectExamples("`yel zazozon vowurol thobatham.`", tables);
    const hits = matchQuery(example!, { kind: "scope", over: "sake", under: "force" });
    assert.deepEqual(
      hits?.map((i) => example!.words[i]!.word.raw).sort(),
      ["thobatham", "yel"],
    );
    assert.equal(matchQuery(example!, { kind: "scope", over: "force", under: "sake" }), null);
    assert.equal(matchQuery(example!, { kind: "unordered" }), null);
  });
});

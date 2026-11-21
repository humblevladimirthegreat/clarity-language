/** The fill job (docs/meta/solver.md#jobs, R4c-9 to R4c-13, D10): fill() over the solve-fill fixture, read as solve.test.ts reads one. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createClassifyTables } from "../parse/classify.js";
import { buildLog } from "./log.js";
import { readText } from "./read.js";
import { fill, follows, type FillOptions, type SolveOptions } from "./solve.js";
import type { Reading } from "./types.js";

const here = dirname(fileURLToPath(import.meta.url));
const rootDir = join(here, "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);

/** A solver fixture's Ageben lines by label. */
function fixture(name: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const block of readFileSync(join(here, "fixtures", `solve-${name}.txt`), "utf8").split(/\n\s*\n/)) {
    const lines = block.split("\n").filter((l) => l && !l.startsWith("#"));
    if (lines.length) out.set(lines[0]!.replace(/^@ /, ""), lines[1]!);
  }
  return out;
}

/** A log of the named fixture entries, then any extra lines, in order; reading `i` has id `t:0.i`. */
function log(name: string, labels: string[], extra: string[] = []) {
  const f = fixture(name);
  return buildLog([...labels.map((l) => f.get(l)!), ...extra].map((text, at) => ({ speaker: "a", at, text })), tables);
}

const q = (text: string): Reading => readText(text, tables)[0]!;
const base: SolveOptions = { lexicon: tables };

describe("solve: the fill job (R4c-9 to R4c-13, D10)", () => {
  const filled = async (labels: string[], question: string, options: FillOptions = {}, extra: string[] = []) => {
    const a = await fill(log("fill", labels, extra), q(question), { ...base, ...options });
    return { verdict: a.verdict, terms: a.fillers.map((f) => f.term), because: a.fillers.map((f) => f.because) };
  };

  it("an open blank lists every filler, each with its reading; none is unknown, or nobody under closedWorld", async () => {
    assert.deepEqual(await filled(["f1"], "yel zar vowurol."), { verdict: "filled", terms: [["zazozon"]], because: [["t:0.0"]] });
    assert.deepEqual(await filled(["f1", "f2"], "yel zar vowurol."), { verdict: "filled", terms: [["zazozon"], ["zalazun"]], because: [["t:0.0"], ["t:0.1"]] });
    assert.equal((await filled(["f1"], "yel zar vezuvel.")).verdict, "unknown");
    const closed = await fill(log("fill", ["f1"]), q("yel zar vezuvel."), { ...base, closedWorld: true });
    assert.equal(closed.verdict, "nobody");
    assert.deepEqual(closed.switches, ["closedWorld"]);
  });

  it("a listed blank fills only from its items; zarx and membership list every member", async () => {
    assert.deepEqual((await filled(["f1"], "yel zazozon zalazun zar vowurol.")).terms, [["zazozon"]]);
    assert.deepEqual((await filled(["f1", "f2"], "yel zalazun zahelan zar vowurol.")).terms, [["zalazun"]]);
    assert.deepEqual((await filled(["f6"], "yel zar vowurol.")).terms, [["zazozon"], ["zalazun"]]);
    assert.deepEqual(await filled(["f6"], "yel zarx vowurol."), { verdict: "filled", terms: [["zazozon"], ["zalazun"]], because: [["t:0.0"], ["t:0.0"]] });
  });

  it("fill-all gives tuples in the blanks' order", async () => {
    const a = await fill(log("fill", ["f7", "f8"]), q("yel zar dar vayebel."), base);
    assert.equal(a.verdict, "filled");
    assert.deepEqual(a.fillers.map((f) => [f.at, f.term]), [[["z", "d"], ["zazozon", "dodozel"]], [["z", "d"], ["zalazun", "dogozel"]]]);
  });

  it("fillers ask cannot reach: a closed universal to its instance, a met hinge", async () => {
    assert.deepEqual(await filled(["f3", "f4"], "yel zar vezuvel."), { verdict: "filled", terms: [["zazozon"]], because: [["t:0.0", "t:0.1"]] });
    const hinge = await filled(["f1", "f5"], "yel zar vehohel.");
    assert.deepEqual(hinge, { verdict: "filled", terms: [["zalazun"]], because: [["t:0.0", "t:0.1"]] });
  });

  it("…er asks whether any binding exists: yes with its readings, else unknown, no under closedWorld", async () => {
    const yes = await fill(log("fill", ["f1"]), q("yel zer vowurol."), base);
    assert.deepEqual([yes.verdict, yes.fillers, yes.because], ["yes", [], ["t:0.0"]]);
    assert.equal((await filled(["f1"], "yel zer vezuvel.")).verdict, "unknown");
    assert.equal((await filled(["f1"], "yel zer vezuvel.", { closedWorld: true })).verdict, "no");
    // R4c-11 on a predicate blank: ger asks whether it is like anything, existence over isa.
    const like = await fill(log("fill", ["f4"]), q("yel ger zazozon."), base);
    assert.deepEqual([like.verdict, like.fillers, like.because], ["yes", [], ["t:0.0"]]);
    assert.equal((await filled(["f1"], "yel ger zazozon.")).verdict, "unknown");
    assert.equal((await filled(["f1"], "yel ger zazozon.", { closedWorld: true })).verdict, "no");
  });

  it("cautious by default; possible fills from some world", async () => {
    assert.equal((await filled(["f10"], "yel zar vudurul.")).verdict, "unknown");
    assert.deepEqual((await filled(["f10"], "yel zar vudurul.", { possible: true })).terms, [["zalazun"]]);
  });

  it("gar asks what kind, from isa only (R4c-12)", async () => {
    assert.deepEqual(await filled(["f4"], "yel gar zazozon."), { verdict: "filled", terms: [["gogozel"]], because: [["t:0.0"]] });
    assert.equal((await filled(["f1"], "yel gar zazozon.")).verdict, "unknown");
  });

  it("why binds a cause's condition, never a met if (R4c-13)", async () => {
    const why = await fill(log("fill", ["f9"]), q("yel thahum blar zazozon vowurol."), base);
    assert.deepEqual([why.verdict, why.fillers], ["filled", [{ at: ["bl"], term: ["zalazun vezuvel"], because: ["t:0.0"] }]]);
    assert.equal((await filled(["f1", "f5"], "yel thahum blar zalazun vehohel.")).verdict, "unknown");
  });

  it("follows and couldBe still answer a fill question beyond; a blank no fill row reads is beyond", async () => {
    assert.equal((await follows(log("fill", ["f1"]), q("yel zar vowurol."), base)).verdict, "beyond");
    assert.equal((await filled(["f1"], "yel zur vowurol.")).verdict, "beyond");
    assert.equal((await filled(["f1"], "yel zazozon zar.")).verdict, "beyond");
    // R4c decision 7 and R4c-13: …ur, a blank beside why, and other condition words with blar wait for their rows.
    assert.equal((await filled(["f4"], "yel gur zazozon.")).verdict, "beyond");
    assert.equal((await filled(["f9"], "yel thahum blar zar vowurol.")).verdict, "beyond");
    assert.equal((await filled(["f9"], "yel thovam blar zazozon vowurol.")).verdict, "beyond");
    assert.equal((await filled(["f1"], "yel el bar zazozon vowurol.")).verdict, "beyond");
    assert.equal((await filled(["f1"], "yel hewem blar zazozon vowurol.")).verdict, "beyond");
  });
});

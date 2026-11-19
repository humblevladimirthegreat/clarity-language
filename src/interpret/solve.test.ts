import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { fullGlossIndex } from "../game/build.js";
import { createClassifyTables } from "../parse/classify.js";
import { glossToAgeben } from "../parse/gloss-inverse.js";
import { buildLog } from "./log.js";
import { match } from "./match.js";
import { readText } from "./read.js";
import { whyReply } from "./reply.js";
import { clashes, couldBe, follows, splitAtom, type SolveOptions } from "./solve.js";
import type { Reading } from "./types.js";

const here = dirname(fileURLToPath(import.meta.url));
const rootDir = join(here, "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);
const index = fullGlossIndex(tables);

/** A solver fixture's Ageben lines by label. */
function fixture(name: string): Map<string, string> {
  const out = new Map<string, string>();
  const blocks = readFileSync(join(here, "fixtures", `solve-${name}.txt`), "utf8").split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l && !l.startsWith("#"));
    if (lines.length) out.set(lines[0]!.replace(/^@ /, ""), lines[1]!);
  }
  return out;
}

/** A log of the named fixture entries, in order; reading `i` has id `t:0.i`. */
function log(name: string, labels: string[], extra: string[] = []) {
  const f = fixture(name);
  const texts = [...labels.map((l) => f.get(l)!), ...extra];
  return buildLog(texts.map((text, at) => ({ speaker: "a", at, text })), tables);
}

const q = (text: string): Reading => readText(text, tables)[0]!;
const fromGloss = (gloss: string): string => glossToAgeben(gloss, tables, index) + ".";
const base: SolveOptions = { lexicon: tables };

describe("solve: the worked example (Sketch, what the solver may conclude)", () => {
  // s1 open "birds usually fly", s2 "no penguin flies", s3 "Azozon is a penguin and a bird", s6 "Ahelan is a bird".
  const worked = log("worked", ["s1", "s2", "s3", "s6"]);

  it("does Azozon fly? no, because s2 and s3", async () => {
    const a = await follows(worked, q("zazozon vewobol."), base);
    assert.equal(a.verdict, "no");
    assert.deepEqual(a.because, ["t:0.1", "t:0.2"]);
    assert.deepEqual(a.switches, []);
    assert.deepEqual(whyReply(a.because).because, ["t:0.1", "t:0.2"]);
  });

  it("does Ahelan fly? cannot say; could Ahelan fly? yes, because s1 and s6", async () => {
    assert.equal((await follows(worked, q("zahelan vewobol."), base)).verdict, "unknown");
    const could = await couldBe(worked, q("zahelan vewobol."), base);
    assert.equal(could.verdict, "yes");
    assert.deepEqual(could.because, ["t:0.0", "t:0.3"]);
    assert.equal((await couldBe(worked, q("zazozon vewobol."), base)).verdict, "no");
  });

  it("with everyday defaults Ahelan flies, and the answer names the switch", async () => {
    const a = await follows(worked, q("zahelan vewobol."), { ...base, defaults: true });
    assert.equal(a.verdict, "yes");
    assert.deepEqual(a.because, ["t:0.0", "t:0.3"]);
    assert.deepEqual(a.switches, ["defaults"]);
    assert.equal((await follows(worked, q("zazozon vewobol."), { ...base, defaults: true })).verdict, "no");
  });

  it("the unsaid: cannot say by default; no in a closed world, naming it", async () => {
    assert.equal((await follows(worked, q("zahelan vowurol."), base)).verdict, "unknown");
    const a = await follows(worked, q("zahelan vowurol."), { ...base, closedWorld: true });
    assert.equal(a.verdict, "no");
    assert.deepEqual(a.switches, ["closedWorld"]);
  });
});

describe("solve: clashes (Sketch, naming a clash)", () => {
  it("s1 closed: the two smallest clashes are {s1, s2, s3} and {s1, s4, s5}", async () => {
    const result = await clashes(log("clash", ["s1", "s2", "s3", "s4", "s5"]), base);
    assert.deepEqual(
      result.clashes.map((c) => c.readings),
      [
        ["t:0.0", "t:0.1", "t:0.2"],
        ["t:0.0", "t:0.3", "t:0.4"],
      ],
    );
    assert.equal(result.clashes[0]!.english, "These cannot all hold: t:0.0, t:0.1, t:0.2.");
  });

  it("the removal pass drops a reading the clash does not need (a fact derived two ways)", async () => {
    const result = await clashes(log("clash", ["s1", "s4", "s5"], ["zalazun gebezel."]), base);
    assert.deepEqual(result.clashes.map((c) => c.readings), [["t:0.0", "t:0.2", "t:0.3"]]);
  });

  it("the open s1 of the worked example clashes with nothing", async () => {
    assert.deepEqual((await clashes(log("worked", ["s1", "s2", "s3", "s6"]), base)).clashes, []);
  });

  it("a plain claim and its denial clash (denial d1 + d2)", async () => {
    const result = await clashes(log("denial", ["d1", "d2"]), base);
    assert.deepEqual(result.clashes.map((c) => c.readings), [["t:0.0", "t:0.1"]]);
  });
});

describe("solve: hinge chains (causation.md#if, #only-if)", () => {
  it("h1 + h2 + h3: Ahelan sleeps, because of all three", async () => {
    const a = await follows(log("hinges", ["h1", "h2", "h3"]), q("zahelan vezuvel."), base);
    assert.equal(a.verdict, "yes");
    assert.deepEqual(a.because, ["t:0.0", "t:0.1", "t:0.2"]);
  });

  it("h1o + h4: Alazun does not sit, because of both", async () => {
    const a = await follows(log("hinges", ["h1o", "h4"]), q("zalazun vehohel."), base);
    assert.equal(a.verdict, "no");
    assert.deepEqual(a.because, ["t:0.0", "t:0.1"]);
  });

  it("R1-5: Alazun sits only if Azozon walks; Alazun sits; so Azozon walks", async () => {
    const a = await follows(log("hinges", ["h1o"], ["zalazun vehohel."]), q("zazozon vowurol."), base);
    assert.equal(a.verdict, "yes");
    assert.deepEqual(a.because, ["t:0.0", "t:0.1"]);
  });

  it("an if-clause alone claims nothing", async () => {
    assert.equal((await follows(log("hinges", ["h1"]), q("zalazun vehohel."), base)).verdict, "unknown");
  });
});

describe("solve: numbers (numbers.md#counts, row 12)", () => {
  const counts = log("numbers", ["n1", "n2"]);

  it("more than three dogs: n2 (five) answers it, n1 (three) does not", async () => {
    const more = await follows(counts, q("zalazun dodozel grawal uel gragel vayebel."), base);
    assert.equal(more.verdict, "yes");
    assert.deepEqual(more.because, ["t:0.1"]);
    assert.equal((await follows(counts, q("zazozon dodozel grawal uel gragel vayebel."), base)).verdict, "unknown");
  });

  it("a count matches by value", async () => {
    const a = await follows(counts, q("zazozon dodozel gragel vayebel."), base);
    assert.equal(a.verdict, "yes");
    assert.deepEqual(a.because, ["t:0.0"]);
  });
});

describe("solve: the two engines agree on one-step cases (match.test.ts)", () => {
  // match.test.ts "match: switches", universals-domains.md#universals-domains-generics: closed zual + kind holds of an
  // instance (infer); a different kind, open, denied, or collective does not.
  const cases: [query: string, target: string, todo?: string][] = [
    ["z-cat | v-sleep", fromGloss("[z-everything | g-cat] | v-sleep")],
    ["z-dog | v-sleep", fromGloss("[z-everything | g-cat] | v-sleep")],
    ["z-cat | v-sleep", "zuam gogozel vezuvel."],
    ["z-cat | v-sleep", "zual gogozel zul vezuvel."],
    ["z-cat | v-sleep", "zual gogozel vezuvelx."],
  ];
  for (const [query, target, todo] of cases) {
    it(`infer: ${query} against ${target}`, { todo }, async () => {
      const question = q(fromGloss(query));
      const stated = q(target);
      const matcher = match(question.claim, stated.claim, { switches: { infer: true }, targetSite: { reading: stated } });
      const solver = await follows(buildLog([{ speaker: "a", at: 0, text: target }], tables), question, base);
      assert.equal(solver.verdict === "yes", matcher !== undefined, `matcher ${matcher ? "matches" : "does not match"}; solver says ${solver.verdict}`);
    });
  }

  it("widen (audit.test.ts A21): Azozon sees a doorbell; does Azozon see a bell?", async () => {
    const stated = fromGloss("z-Azozon | d-doorbell | v-see");
    const question = q(fromGloss("z-Azozon | d-bell | v-see"));
    for (const widen of [false, true]) {
      const matcher = match(question.claim, q(stated).claim, { switches: { widen }, lexicon: tables });
      const solver = await follows(buildLog([{ speaker: "a", at: 0, text: stated }], tables), question, { ...base, widen });
      assert.equal(solver.verdict === "yes", matcher !== undefined);
      assert.deepEqual(solver.switches, matcher?.switches ?? []);
    }
  });

  it("row 11, solver only: Azozon is a robin, so with widen Azozon is a bird, naming the switch", async () => {
    const question = q("zazozon gebezel.");
    const solver = await follows(log("compound", ["k1"]), question, { ...base, widen: true });
    assert.equal(solver.verdict, "yes");
    assert.deepEqual(solver.switches, ["widen"]);
    assert.deepEqual(solver.because, ["t:0.0"]);
    assert.equal((await follows(log("compound", ["k1"]), question, base)).verdict, "unknown");
  });
});

describe("solve: limits", () => {
  it("a program over the size limit is refused with a reply, not a crash", async () => {
    const a = await follows(log("worked", ["s1", "s6"]), q("zahelan vewobol."), { ...base, maxBytes: 100 });
    assert.equal(a.verdict, "refused");
    assert.match(a.english ?? "", /too large/);
    assert.match((await clashes(log("clash", ["s1"]), { ...base, maxBytes: 100 })).refused ?? "", /too large/);
  });

  it("a question with a frame that has no row is beyond", async () => {
    const f = fixture("hinges");
    assert.equal((await follows(log("hinges", ["h3"]), q(f.get("h1")!), base)).verdict, "beyond");
  });

  it("splitAtom keeps strings and nested terms whole", () => {
    assert.deepEqual(splitAtom('used("t:0.0",f(a,"b,c"),isa(X,k))'), { name: "used", args: ['"t:0.0"', 'f(a,"b,c")', "isa(X,k)"] });
  });
});

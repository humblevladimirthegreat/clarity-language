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
import { clashes, couldBe, follows, giveUp, splitAtom, whyNot, type SolveOptions } from "./solve.js";
import { translate } from "./translate.js";
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

describe("solve: clashes under choices (Sketch, naming a clash; S1-1)", () => {
  // always.md a5 "Azozon usually sits" is an open rule (row 9): its choice gives the program two worlds.
  const usually = fixture("always").get("a5")!;
  const example = ["s1", "s2", "s3", "s4", "s5"];

  it("the clash example, plain: give up {s1}", async () => {
    const result = await giveUp(log("clash", example), base);
    assert.deepEqual(result.giveUp, ["t:0.0"]);
    assert.equal(result.english, "Giving up t:0.0 resolves every clash.");
  });

  it("the clash example beside an open rule: re-solved, the same two clashes, give up {s1}", async () => {
    const choices = log("clash", example, [usually]);
    const result = await clashes(choices, base);
    assert.deepEqual(
      result.clashes.map((c) => c.readings),
      [
        ["t:0.0", "t:0.1", "t:0.2"],
        ["t:0.0", "t:0.3", "t:0.4"],
      ],
    );
    assert.ok(result.clashes.every((c) => c.atom.length));
    assert.deepEqual((await giveUp(choices, base)).giveUp, ["t:0.0"]);
  });

  it("open universals: the worked example has several worlds and nothing to give up", async () => {
    const worked = log("worked", ["s1", "s2", "s3", "s6"]);
    assert.deepEqual((await clashes(worked, base)).clashes, []);
    assert.deepEqual((await giveUp(worked, { ...base, defaults: true })).giveUp, []);
    assert.deepEqual((await clashes(worked, { ...base, defaults: true, closedWorld: true })).clashes, []);
  });

  it("an open universal beside a plain clash: only the clash, and one of its two readings to give up", async () => {
    const d = fixture("denial");
    const mixed = log("worked", ["s1", "s6"], [d.get("d1")!, d.get("d2")!]);
    assert.deepEqual((await clashes(mixed, base)).clashes.map((c) => c.readings), [["t:0.2", "t:0.3"]]);
    const up = (await giveUp(mixed, base)).giveUp;
    assert.equal(up.length, 1);
    assert.ok(["t:0.2", "t:0.3"].includes(up[0]!));
  });
});

describe("solve: why not (Sketch, naming a clash)", () => {
  it("why can't Alazun not fly? it joins the clash with s1 and s4", async () => {
    const s5 = q(fixture("clash").get("s5")!);
    assert.deepEqual((await whyNot(log("clash", ["s1", "s4"]), s5, base)).clash?.readings, ["t:0.0", "t:0.1"]);
    // The log's own clash {s1, s2, s3} is not one the claim joins.
    const result = await whyNot(log("clash", ["s1", "s2", "s3", "s4"]), s5, base);
    assert.deepEqual(result.clash?.readings, ["t:0.0", "t:0.3"]);
    assert.equal(result.clash?.english, "That cannot hold with t:0.0, t:0.3.");
  });

  it("why can't Azozon fly? s2 and s3, under an open rule too", async () => {
    const flies = q("zazozon vewobol.");
    assert.deepEqual((await whyNot(log("clash", ["s2", "s3"]), flies, base)).clash?.readings, ["t:0.0", "t:0.1"]);
    assert.deepEqual((await whyNot(log("worked", ["s1", "s2", "s3", "s6"]), flies, base)).clash?.readings, ["t:0.1", "t:0.2"]);
  });

  it("a claim that clashes with nothing has no clash", async () => {
    assert.equal((await whyNot(log("worked", ["s1", "s2", "s3", "s6"]), q("zahelan vewobol."), base)).clash, undefined);
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

describe("solve: holders (R2-1 rows 1 to 3, R2-2, R2-4, R2-5)", () => {
  const b = (labels: string[]) => log("holders", labels);
  const view = (text: string) => q(text);

  it("b1 + b2: one holder's views clash, and the reply names the holder", async () => {
    const result = await clashes(b(["b1", "b2"]), base);
    assert.deepEqual(result.clashes.map((c) => c.readings), [["t:0.0", "t:0.1"]]);
    assert.equal(result.clashes[0]!.atom, "view(azozo,uduru(z(alazu)))");
    assert.equal(result.clashes[0]!.english, "In Azozon's view these cannot all hold: t:0.0, t:0.1.");
    assert.equal((await giveUp(b(["b1", "b2"]), base)).giveUp.length, 1);
    const a = await follows(b(["b1", "b2"]), view(fixture("holders").get("b1")!), base);
    assert.equal(a.verdict, "both");
    assert.deepEqual(a.because, ["t:0.0", "t:0.1"]);
    assert.deepEqual((await whyNot(b(["b1"]), view(fixture("holders").get("b2")!), base)).clash?.readings, ["t:0.0"]);
  });

  it("two holders never clash (b1 + b3, b8 + b9), nor a view and your own claim", async () => {
    assert.deepEqual((await clashes(b(["b1", "b3"]), base)).clashes, []);
    assert.deepEqual((await clashes(b(["b8", "b9"]), base)).clashes, []);
    // Your claim first: after b1 a bare claim would carry Azozon's view (row 2).
    assert.deepEqual((await clashes(b(["b4", "b1"]), base)).clashes, []);
  });

  it("a view is not your claim: Alazun left? cannot say after b1", async () => {
    assert.equal((await follows(b(["b1"]), q("zalazun vudurul."), base)).verdict, "unknown");
  });

  it("b5: a carried holder gives Azozon's view, not your claim", async () => {
    assert.equal((await follows(b(["b5"]), q("zalazun vezuvel."), base)).verdict, "unknown");
    const a = await follows(b(["b5"]), view("zalazun theyomazozon vezuvel."), base);
    assert.equal(a.verdict, "yes");
    assert.deepEqual(a.because, ["t:0.1"]);
  });

  it("b10 + b11: Azozon's own rule runs inside Azozon's view", async () => {
    const a = await follows(b(["b10", "b11"]), view("zalazun theyomazozon vudurul."), base);
    assert.equal(a.verdict, "yes");
    assert.deepEqual(a.because, ["t:0.0", "t:0.1"]);
    // Your own rule never reaches a view.
    assert.equal((await follows(b(["b11"]), view("zalazun theyomazozon vudurul."), base)).verdict, "unknown");
  });
});

describe("solve: say words (R2-1 row 4, R2-6 to R2-9)", () => {
  const p = (labels: string[]) => log("say", labels);
  const say = fixture("say");

  it("p1 + p2: the rules allow and forbid the same walk", async () => {
    const result = await clashes(p(["p1", "p2"]), base);
    assert.deepEqual(result.clashes.map((c) => c.readings), [["t:0.0", "t:0.1"]]);
    assert.equal(result.clashes[0]!.english, "These cannot all hold: t:0.0, t:0.1.");
    assert.deepEqual((await clashes(p(["p7", "p2"]), base)).clashes.map((c) => c.readings), [["t:0.0", "t:0.1"]]);
  });

  it("another party, or another reach, never clashes (p4 + p5, p8 + p9)", async () => {
    assert.deepEqual((await clashes(p(["p4", "p5"]), base)).clashes, []);
    assert.deepEqual((await clashes(p(["p8", "p9"]), base)).clashes, []);
  });

  it("a say word's content stays wrapped: no say word claims its act, consent too", async () => {
    assert.equal((await follows(p(["p1"]), q(say.get("p3")!), base)).verdict, "unknown");
    assert.equal((await follows(p(["p6"]), q("zazozon dalazun vayebel."), base)).verdict, "unknown");
  });

  it("p2 + p3: the act against a stated ban is data, never a clash", async () => {
    assert.deepEqual((await clashes(p(["p2", "p3"]), base)).clashes, []);
  });

  it("p7: a requirement gives permission; may Azozon walk? yes, citing p7", async () => {
    const a = await follows(p(["p7"]), q(say.get("p1")!), base);
    assert.equal(a.verdict, "yes");
    assert.deepEqual(a.because, ["t:0.0"]);
  });

  it("the turn's speaker is the one with the say on -m: two speakers' say never clash", async () => {
    const two = (speakers: string[]) => buildLog([say.get("p8")!.replace("hwovam", "hwuvam"), say.get("p9")!].map((text, at) => ({ speaker: speakers[at]!, at, text })), tables);
    assert.deepEqual((await clashes(two(["a", "a"]), base)).clashes.map((c) => c.readings), [["t:0.0", "t:0.1"]]);
    assert.deepEqual((await clashes(two(["a", "b"]), base)).clashes, []);
  });
});

describe("solve: MAY (R3-1 rows 1 to 6, R3-2, R3-5 to R3-7)", () => {
  const m = (labels: string[], extra: string[] = []) => log("maybe", labels, extra);
  const left = q("zalazun vudurul.");

  it("m1 alone: Alazun left? cannot say; could Alazun have left? yes. m4's ending reads the same", async () => {
    for (const label of ["m1", "m4"]) {
      assert.equal((await follows(m([label]), left, base)).verdict, "unknown");
      const a = await couldBe(m([label]), left, base);
      assert.equal(a.verdict, "yes");
      assert.deepEqual(a.because, ["t:0.0"]);
    }
  });

  it("R3-2: maybe P never clashes with not P or with P; after not P, could P be? no", async () => {
    assert.deepEqual((await clashes(m(["m1", "m2"]), base)).clashes, []);
    assert.deepEqual((await clashes(m(["m1", "m3"]), base)).clashes, []);
    assert.equal((await couldBe(m(["m1", "m2"]), left, base)).verdict, "no");
    assert.equal((await follows(m(["m1", "m3"]), left, base)).verdict, "yes");
  });

  it("m5: possibly not; m6: MAY denied is a plain claim, its thul kept in the notes", async () => {
    assert.equal((await couldBe(m(["m5"]), q("zalazun vudurul vul."), base)).verdict, "yes");
    assert.equal((await follows(m(["m5"]), q("zalazun vudurul vul."), base)).verdict, "unknown");
    assert.equal((await follows(m(["m5"]), left, base)).verdict, "unknown");
    assert.equal((await follows(m(["m6"]), left, base)).verdict, "yes");
    assert.deepEqual(translate(m(["m6"]), { lexicon: tables }).notes.map((n) => n.frame.key), ["joinSeries:u"]);
  });

  it("m7 (b6): maybe Azozon thinks Alazun left; beside m8 no clash, and R3-2 drops the clashing world", async () => {
    const view = q("zalazun theyomazozon vudurul.");
    for (const label of ["m7", "b6"]) {
      assert.equal((await couldBe(m([label]), view, base)).verdict, "yes");
      assert.equal((await follows(m([label]), view, base)).verdict, "unknown");
    }
    assert.deepEqual((await clashes(m(["m7", "m8"]), base)).clashes, []);
    assert.equal((await couldBe(m(["m7", "m8"]), view, base)).verdict, "no");
  });

  it("m9: the holder's own MAY is a term inside the view (R3-6)", async () => {
    const a = await follows(m(["m9"]), q("zalazun theyomazozon vudurul thomam."), base);
    assert.equal(a.verdict, "yes");
    assert.deepEqual(a.because, ["t:0.0"]);
    assert.equal((await follows(m(["m9"]), q("zalazun theyomazozon vudurul."), base)).verdict, "unknown");
    assert.equal((await couldBe(m(["m9"]), q("zalazun theyomazozon vudurul."), base)).verdict, "unknown");
  });

  it("m10 + m12: MAY over a hinge gates it; m11: a hinge over MAY makes the outcome a choice", async () => {
    const sits = q("zalazun vehohel.");
    for (const labels of [["m10", "m12"], ["m11"]]) {
      assert.equal((await couldBe(m(labels), sits, base)).verdict, "yes", labels.join());
      assert.equal((await follows(m(labels), sits, base)).verdict, "unknown", labels.join());
    }
  });

  it("m13: MAY on the condition reads may(T); a stated walk and a possible one both give it (R3-5)", async () => {
    const sits = q("zalazun vehohel.");
    const a = await follows(m(["m13", "m12"]), sits, base);
    assert.equal(a.verdict, "yes");
    assert.deepEqual(a.because, ["t:0.0", "t:0.1"]);
    assert.equal((await follows(m(["m13"], ["zazozon thomam vowurol."]), sits, base)).verdict, "yes");
    assert.equal((await follows(m(["m13"]), sits, base)).verdict, "unknown");
  });

  it("m14 beside o4 + o5: no clash, since the world without the gate is clash-free", async () => {
    const o = fixture("or");
    assert.deepEqual((await clashes(m(["m14"], [o.get("o4")!, o.get("o5")!]), base)).clashes, []);
  });

  it("m15 + m16: could Ahelan sleep? yes; does Ahelan sleep? cannot say, with defaults too", async () => {
    const sleeps = q("zahelan vezuvel.");
    assert.equal((await couldBe(m(["m15", "m16"]), sleeps, base)).verdict, "yes");
    assert.equal((await follows(m(["m15", "m16"]), sleeps, base)).verdict, "unknown");
    assert.equal((await follows(m(["m15", "m16"]), sleeps, { ...base, defaults: true })).verdict, "unknown");
  });

  it("R3-7: an estimate is a choice with its figure as data; certain is a claim, no chance a denial", async () => {
    assert.equal((await couldBe(m(["m17"]), left, base)).verdict, "yes");
    assert.equal((await follows(m(["m17"]), left, base)).verdict, "unknown");
    assert.match(translate(m(["m17"]), { lexicon: tables }).program, /^likely\("t:0\.0",v\(70\)\) :- on\("t:0\.0"\)\.$/m);
    assert.equal((await couldBe(m([], ["zalazun vudurul th+0."]), left, base)).verdict, "yes");
    assert.equal((await follows(m(["m18"]), left, base)).verdict, "yes");
    assert.equal((await follows(m(["m19"]), left, base)).verdict, "no");
  });
});

describe("solve: or (R3-1 rows 7 and 8, R3-3, R3-4)", () => {
  const o = (labels: string[], extra: string[] = []) => log("or", labels, extra);
  const walks = q("zazozon vowurol.");
  const runs = q("zazozon veruvol.");

  it("o1 alone: could Azozon walk? yes; does Azozon walk? cannot say", async () => {
    assert.equal((await couldBe(o(["o1"]), walks, base)).verdict, "yes");
    assert.equal((await follows(o(["o1"]), walks, base)).verdict, "unknown");
  });

  it("the bounds: exactly one, at least one, at most one", async () => {
    const a = await follows(o(["o1", "o4"]), runs, base);
    assert.equal(a.verdict, "yes");
    assert.deepEqual(a.because, ["t:0.0", "t:0.1"]);
    assert.equal((await follows(o(["o1", "o6"]), runs, base)).verdict, "no");
    assert.equal((await follows(o(["o2", "o6"]), runs, base)).verdict, "unknown");
    assert.equal((await follows(o(["o2", "o4"]), runs, base)).verdict, "yes");
    assert.equal((await follows(o(["o3", "o6"]), runs, base)).verdict, "no");
    assert.equal((await follows(o(["o3", "o4"]), runs, base)).verdict, "unknown");
    assert.equal((await couldBe(o(["o7"]), q("zalazun vowurol."), base)).verdict, "yes");
  });

  it("o1 + o4 + o5: every world clashes; the clash is all three, and the answer shows both", async () => {
    const all = o(["o1", "o4", "o5"]);
    assert.deepEqual((await clashes(all, base)).clashes.map((c) => c.readings), [["t:0.0", "t:0.1", "t:0.2"]]);
    assert.equal((await giveUp(all, base)).giveUp.length, 1);
    assert.equal((await follows(all, walks, base)).verdict, "both");
  });

  it("R3-4: reasoning by cases, A or B; if A then C; if B then C; so C", async () => {
    const cases = o(["o1"], ["zalazun vehohel thohem blarl zazozon vowurol.", "zalazun vehohel thohem blarl zazozon veruvol."]);
    const a = await follows(cases, q("zalazun vehohel."), base);
    assert.equal(a.verdict, "yes");
  });

  it("o8 to o12: every world clashes with no shared atom; re-solved, one smallest clash of all five", async () => {
    const all = o(["o8", "o9", "o10", "o11", "o12"]);
    const result = await clashes(all, base);
    assert.deepEqual(result.clashes.map((c) => c.readings), [["t:0.0", "t:0.1", "t:0.2", "t:0.3", "t:0.4"]]);
    assert.equal((await giveUp(all, base)).giveUp.length, 1);
  });

  it("o8 + o13: could Ahelan sleep? yes; does Ahelan sleep? cannot say, with defaults too", async () => {
    const sleeps = q("zahelan vezuvel.");
    assert.equal((await couldBe(o(["o8", "o13"]), sleeps, base)).verdict, "yes");
    assert.equal((await follows(o(["o8", "o13"]), sleeps, base)).verdict, "unknown");
    assert.equal((await follows(o(["o8", "o13"]), sleeps, { ...base, defaults: true })).verdict, "unknown");
  });

  it("row 7: not exactly one is both or neither; not at least one denies each", async () => {
    assert.equal((await follows(o(["o14", "o6"]), runs, base)).verdict, "yes");
    assert.equal((await follows(o(["o14", "o4"]), runs, base)).verdict, "no");
    assert.equal((await follows(o(["o15"]), walks, base)).verdict, "no");
    assert.equal((await follows(o(["o15"]), runs, base)).verdict, "no");
  });
});

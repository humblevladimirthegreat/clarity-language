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
import { clashes, couldBe, follows, giveUp, splitAtom, stands, whyNot, type SolveOptions, type StandsResult } from "./solve.js";
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
  return buildLog(texts.map((text, at) => named(text, at)), tables);
}

/** A fixture line's turn: a leading "Name: " sets its speaker, as the log reader does; else the default speaker "a". */
function named(line: string, at: number) {
  const m = /^([A-Z][A-Za-z0-9_-]*):\s*(.*)$/.exec(line);
  return m ? { speaker: m[1]!, at, text: m[2]! } : { speaker: "a", at, text: line };
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

describe("solve: a question's witness carries no claim (solver.md#jobs, R4c-1)", () => {
  // Only a first-mention noun's kind, count and details stay on; a lone-adjective claim on it is the question's own.
  const unrelated = buildLog([{ speaker: "a", at: 0, text: "zazozon vowurol." }], tables);
  for (const text of ["yel zodozel gamahum.", "yel zobonol garolem."]) {
    it(`${text} after an unrelated claim: cannot say`, async () => {
      assert.equal((await follows(unrelated, q(text), base)).verdict, "unknown");
    });
  }

  it("the same claim stated answers it: yes", async () => {
    const stated = buildLog([{ speaker: "a", at: 0, text: "zodozel gamahum." }], tables);
    const a = await follows(stated, q("yel zodozel gamahum."), base);
    assert.equal(a.verdict, "yes");
    assert.deepEqual(a.because, ["t:0.0"]);
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
    // A *because* hinge on a question has no row (R4e-4 covers only if, only if and iff).
    assert.equal((await follows(log("hinges", ["h3"]), q("zalazun vehohel thahum blarl zazozon vowurol."), base)).verdict, "beyond");
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

describe("solve: holders over restrictors, denials, say words and hinges (R4a-1 to R4a-5, R4a-13, R4e-5)", () => {
  const b = (labels: string[]) => log("holders", labels);
  const atoms = async (labels: string[]) => (await clashes(b(labels), base)).clashes.map((c) => [c.atom, c.readings, c.english]);

  it("R4a-1: always and never clash inside one view (k1 + k2), never across holders (k1 + k3) or into your claim", async () => {
    assert.deepEqual(await atoms(["k1", "k2"]), [["view(azozo,ozuye(z(alazu)))", ["t:0.0", "t:0.1"], "In Azozon's view these cannot all hold: t:0.0, t:0.1."]]);
    assert.deepEqual(await atoms(["k1", "k3"]), []);
    assert.equal((await follows(b(["k1"]), q("zalazun vozuyel."), base)).verdict, "unknown");
    assert.deepEqual(await atoms(["k4"]), [["view(we(0),eba(z(listener(0))))", ["t:0.0", "t:0.1"], "In our view these cannot all hold: t:0.0, t:0.1."]]);
  });

  it("R4a-2: a whole-list denial inside a view clashes with the holder's items (k6 to k8), never with yours", async () => {
    assert.deepEqual(await atoms(["k6", "k7", "k8"]), [['view(alazu,notall("t:0.0"))', ["t:0.0", "t:0.1", "t:0.2"], "In Alazun's view these cannot all hold: t:0.0, t:0.1, t:0.2."]]);
    assert.deepEqual(await atoms(["k9", "k10", "k6"]), []);
  });

  it("R4a-3: no dogs, in Azozon's view, clashes with Azozon's view that Azozon is a dog (k11 + k12), not with yours", async () => {
    assert.deepEqual(await atoms(["k11", "k12"]), [['view(azozo,none("t:0.0"))', ["t:0.0", "t:0.1"], "In Azozon's view these cannot all hold: t:0.0, t:0.1."]]);
    assert.deepEqual(await atoms(["k13", "k11"]), []);
  });

  it("R4a-4: a topic-pronoun holder is the topic, and its anaphor link is used", () => {
    const t = translate(buildLog([{ speaker: "a", at: 0, text: "xazozon theyomalen zalazun vudurul." }], tables));
    assert.deepEqual(t.left.map((l) => l.unused), [['link unit:linker "xazozon"']]);
    const u = translate(buildLog([{ speaker: "a", at: 0, text: "zodozel vudurul. zalazun theyomodozer vezuvel." }], tables));
    assert.match(u.program, /^holds\(view\(nm\("t:0\.0",z\),ezuve\(z\(alazu\)\)\)\) :- on\("t:0\.1"\)\.$/m);
  });

  it("R4a-5: a listener holder is the turn's listener; two views of one turn's listener clash", async () => {
    const one = buildLog([{ speaker: "a", at: 0, text: "zalazun theyomawan vudurul. zalazun theyomawan vudurul vul." }], tables);
    const result = await clashes(one, base);
    assert.deepEqual(result.clashes.map((c) => [c.atom, c.english]), [["view(listener(0),uduru(z(alazu)))", "In your view these cannot all hold: t:0.0, t:0.1."]]);
  });

  it("R4a-13: a holder over a say word: a ban and a grant clash in the view (k51 + k52), and the ban answers no", async () => {
    assert.deepEqual(await atoms(["k51", "k52"]), [["view(alazu,say(rules,v,u,u,l,owuro(z(azozo))))", ["t:0.0", "t:0.1"], "In Alazun's view these cannot all hold: t:0.0, t:0.1."]]);
    assert.deepEqual(await atoms(["k39", "k51"]), []);
    const a = await follows(b(["k52"]), q(fixture("holders").get("k51")!), base);
    assert.equal(a.verdict, "no");
    assert.deepEqual(a.because, ["t:0.0"]);
  });

  it("R4e-5: a holder's conditional runs in the view (hg13 + hg14); its denial clashes there (hg13 + hg15), not with yours (hg1)", async () => {
    const h = (labels: string[]) => log("hinges", labels);
    const a = await follows(h(["hg13", "hg14"]), q("zalazun theyomazozon vehohel."), base);
    assert.equal(a.verdict, "yes");
    assert.deepEqual(a.because, ["t:0.0", "t:0.1"]);
    const c = await clashes(h(["hg13", "hg15"]), base);
    assert.deepEqual(c.clashes.map((x) => [x.readings, x.english]), [[["t:0.0", "t:0.1"], "In Azozon's view these cannot all hold: t:0.0, t:0.1."]]);
    assert.deepEqual((await clashes(h(["hg1", "hg15"]), base)).clashes, []);
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

  it("a ban denies the matching permission: after p2, may Azozon walk? no, citing p2; p7 + p2 still clash", async () => {
    const a = await follows(p(["p2"]), q(say.get("p1")!), base);
    assert.equal(a.verdict, "no");
    assert.deepEqual(a.because, ["t:0.0"]);
    assert.equal((await follows(p(["p2"]), q(say.get("p2")!), base)).verdict, "yes");
    assert.deepEqual((await clashes(p(["p7", "p2"]), base)).clashes.map((c) => c.readings), [["t:0.0", "t:0.1"]]);
  });

  it("the turn's speaker is the one with the say on -m: two speakers' say never clash", async () => {
    const two = (speakers: string[]) => buildLog([say.get("p8")!.replace("hwovam", "hwuvam"), say.get("p9")!].map((text, at) => ({ speaker: speakers[at]!, at, text })), tables);
    assert.deepEqual((await clashes(two(["a", "a"]), base)).clashes.map((c) => c.readings), [["t:0.0", "t:0.1"]]);
    assert.deepEqual((await clashes(two(["a", "b"]), base)).clashes, []);
  });
});

describe("solve: the turn's people and say words over frames (R4a-7 to R4a-12)", () => {
  const k = (labels: string[]) => log("holders", labels);
  const p = (labels: string[]) => log("say", labels);
  const sets = async (l: ReturnType<typeof log>) => (await clashes(l, base)).clashes.map((c) => [c.atom, c.readings]);
  const allow = q("zazozon vowurol hwuval.");

  it("R4a-7: zaya is the turn's speaker plus its addressees, by call or last call; no addressee fits no other turn", async () => {
    assert.deepEqual(await sets(k(["k21", "k22"])), [['owuro(z(we(azozo,sp("Bea"))))', ["t:1.0", "t:1.1"]]]);
    assert.deepEqual(await sets(k(["k23", "k24", "k25", "k26"])), []);
    assert.deepEqual(await sets(k(["k27", "k28"])), []);
    assert.match(translate(k(["k27"]), { lexicon: tables }).program, /^holds\(owuro\(z\(we\(0\)\)\)\)/m);
  });

  it("R4a-8 (D16): zawan is the one called, then the last call, else the other of two speakers; a call alone claims nothing", async () => {
    const a = await follows(k(["k29"]), q("zazozon vowurol."), base);
    assert.deepEqual([a.verdict, a.left], ["yes", []]);
    assert.equal((await follows(k(["k30", "k31"]), q("zazozon vowurol."), base)).verdict, "yes");
    assert.deepEqual((await clashes(k(["k32", "k33", "k34"]), base)).clashes.map((c) => c.atom), ['owuro(z(sp("Bea")))']);
    assert.deepEqual(await sets(k(["k23", "k24", "k35", "k36"])), []);
    assert.deepEqual((await clashes(k(["k16", "k15"]), base)).clashes.map((c) => c.atom), ["view(azozo,uduru(z(alazu)))"]);
  });

  it("R4a-9: a hinge over a say word (blarth first) gives the say term; a ban then denies the condition, which clashes", async () => {
    assert.equal((await follows(p(["k53"]), allow, base)).verdict, "yes");
    assert.deepEqual((await clashes(p(["k53", "p2"]), base)).clashes.map((c) => c.readings), [["t:0.0", "t:0.1", "t:0.2"]]);
  });

  it("R4a-10: a binder over a say word reaches each member; a ban there denies each permission", async () => {
    assert.equal((await follows(p(["k40", "k54"]), allow, base)).verdict, "yes");
    assert.equal((await follows(p(["k41", "k54"]), allow, base)).verdict, "no");
  });

  it("R4a-11 (D1): over every or an and list, allow reaches each member and a ban only the whole", async () => {
    assert.equal((await follows(p(["k42", "k54"]), allow, base)).verdict, "yes");
    assert.equal((await follows(p(["k43", "k54"]), allow, base)).verdict, "unknown");
    assert.equal((await couldBe(p(["k43", "k54"]), allow, base)).verdict, "unknown");
    assert.equal((await follows(p(["k44"]), allow, base)).verdict, "yes");
    assert.equal((await follows(p(["k45"]), allow, base)).verdict, "unknown");
    assert.equal((await follows(p(["k46"]), q("zazozon vezuyol bahelan hwubar."), base)).verdict, "yes");
  });

  it("R4a-12 (D1): a say word over a hinge, because, MAY or a zone is data: neither half follows", async () => {
    for (const label of ["k37", "k47", "k48", "k49", "k50"]) assert.equal((await follows(p([label, "k38"]), allow, base)).verdict, "unknown", label);
    assert.match(translate(p(["k47"]), { lexicon: tables }).program, /^holds\(say\(rules,v,u,a,l,if\(ezuyo\(z\(alazu\)\),owuro\(z\(azozo\)\)\)\)\) :- on\("t:0\.0"\)\.$/m);
    assert.equal((await follows(p(["k50"]), q("zalazun vezuyol."), base)).verdict, "unknown");
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

describe("solve: because, fault, contrary to (R2-1 rows 5 to 9, R2-10, R2-11)", () => {
  const c = (labels: string[]) => log("because", labels);
  const pairs = async (labels: string[]) => (await clashes(c(labels), base)).clashes.map((x) => x.readings);

  it("c1: the outcome, the condition and the link all hold", async () => {
    const one = c(["c1"]);
    assert.equal((await follows(one, q("zazozon vowurol."), base)).verdict, "yes");
    assert.deepEqual((await follows(one, q("zalazun vezuvel."), base)).because, ["t:0.0"]);
    assert.match(translate(one, { lexicon: tables }).program, /^holds\(cause\(ezuve\(z\(alazu\)\),owuro\(z\(azozo\)\)\)\) :- on\("t:0.0"\)\.$/m);
  });

  it("c1 clashes with a denied condition (c2), a denied outcome (c4) and a denied link (c3)", async () => {
    assert.deepEqual(await pairs(["c1", "c2"]), [["t:0.0", "t:0.1"]]);
    assert.deepEqual(await pairs(["c1", "c4"]), [["t:0.0", "t:0.1"]]);
    assert.deepEqual(await pairs(["c1", "c3"]), [["t:0.0", "t:0.1"]]);
  });

  it("not because leaves the condition unstated and keeps the claim (R2-10)", async () => {
    const three = c(["c3"]);
    assert.equal((await follows(three, q("zalazun vezuvel."), base)).verdict, "unknown");
    assert.equal((await follows(three, q("zazozon vowurol."), base)).verdict, "yes");
  });

  it("fault and share share the link: c3-style denial clashes with each; thahum and thahul do not clash (c5 + c7)", async () => {
    const denied = "zazozon vudurul thahum thul blarl zalazun vezuyol.";
    assert.deepEqual((await clashes(log("because", ["c5"], [denied]), base)).clashes.map((x) => x.readings), [["t:0.0", "t:0.1"]]);
    assert.deepEqual((await clashes(log("because", ["c6"], [denied]), base)).clashes.map((x) => x.readings), [["t:0.0", "t:0.1"]]);
    assert.deepEqual(await pairs(["c5", "c7"]), []);
    assert.deepEqual((await clashes(log("because", ["c5"], ["zalazun vezuyol hwuval."]), base)).clashes, []);
  });

  it("c8: only because adds only-if on the same condition", async () => {
    const program = translate(c(["c8"]), { lexicon: tables }).program;
    assert.match(program, /^holds\(neg\(owuro\(z\(azozo\)\)\)\) :- holds\(onlyif\(c\("t:0.0"\),o\("t:0.0"\)\)\), fits\(P,c\("t:0.0"\)\), holds\(neg\(P\)\), on\("t:0.0"\)\.$/m);
    assert.equal((await follows(c(["c8"]), q("zalazun vezuvel."), base)).verdict, "yes");
  });

  it("contrary to: the event is still your claim; c4 clashes with c9 and c10", async () => {
    assert.equal((await follows(c(["c9"]), q("zazozon vowurol."), base)).verdict, "yes");
    assert.match(translate(c(["c9"]), { lexicon: tables }).program, /^holds\(against\(owuro\(z\(azozo\)\),plan\(sp\("a"\)\)\)\) :- on\("t:0.0"\)\.$/m);
    assert.deepEqual(await pairs(["c4", "c9"]), [["t:0.0", "t:0.1"]]);
    assert.deepEqual(await pairs(["c4", "c10"]), [["t:0.0", "t:0.1"]]);
  });

  it("R2-11: a say-word zone claims its say word: c10 + c12 clash; do the rules forbid it? yes", async () => {
    assert.deepEqual(await pairs(["c10", "c12"]), [["t:0.0", "t:0.1"]]);
    const a = await follows(c(["c10"]), q("zazozon vowurol hwuvul."), base);
    assert.equal(a.verdict, "yes");
    assert.deepEqual(a.because, ["t:0.0"]);
  });

  it("a channel or a holder after uom has no row yet", () => {
    assert.deepEqual(translate(buildLog([{ speaker: "a", at: 0, text: "zazozon vowurol uom thebamalazun." }], tables), { lexicon: tables }).left.map((l) => l.key), ["hookJob:zone"]);
  });
});

describe("solve: what stands (R2-12, R2-13)", () => {
  const labels = (r: StandsResult) => Object.fromEntries(r.stands.map((s) => [s.reading, s.label]));

  it("solve-clash: s1 is attacked by s2 and by s5; s3 and s4 stand", async () => {
    const r = await stands(log("clash", ["s1", "s2", "s3", "s4", "s5"]), base);
    assert.deepEqual(r.attacks, [["t:0.0", "t:0.1"], ["t:0.0", "t:0.4"], ["t:0.1", "t:0.0"], ["t:0.4", "t:0.0"]]);
    assert.deepEqual(labels(r), { "t:0.0": "undec", "t:0.1": "undec", "t:0.2": "in", "t:0.3": "in", "t:0.4": "undec" });
  });

  it("c1 + c2 + c13: grounded gives c13 in, c1 and c2 undecided", async () => {
    const r = await stands(log("because", ["c1", "c2", "c13"]), base);
    assert.deepEqual(r.attacks, [["t:0.0", "t:0.1"], ["t:0.1", "t:0.0"]]);
    assert.deepEqual(labels(r), { "t:0.0": "undec", "t:0.1": "undec", "t:0.2": "in" });
    assert.deepEqual(r.extensions, [["t:0.2"]]);
    assert.equal(r.english, "Standing: t:0.2. Undecided: t:0.0, t:0.1.");
  });

  it("c1 + c2 + c13: preferred and stable give {c1, c13} and {c2, c13}; c1 and c2 credulous only", async () => {
    for (const semantics of ["preferred", "stable"] as const) {
      const r = await stands(log("because", ["c1", "c2", "c13"]), { ...base, semantics });
      assert.deepEqual(r.extensions.map((e) => e.join(" ")).sort(), ["t:0.0 t:0.2", "t:0.1 t:0.2"], semantics);
      assert.deepEqual(labels(r), { "t:0.0": "undec", "t:0.1": "undec", "t:0.2": "in" }, semantics);
      assert.deepEqual(r.stands.map((s) => s.credulous), [true, true, true], semantics);
    }
  });

  it("a ban and a requirement attack each other through the permission; an open universal attacks nothing", async () => {
    assert.deepEqual((await stands(log("say", ["p7", "p2"]), base)).attacks, [["t:0.0", "t:0.1"], ["t:0.1", "t:0.0"]]);
    const open = await stands(log("worked", ["s1", "s2", "s3", "s6"]), base);
    assert.deepEqual(open.attacks, []);
    assert.ok(open.stands.every((s) => s.label === "in"));
  });

  it("under choices the attacks come from the brave run: o1 + o4 + o5", async () => {
    const r = await stands(log("or", ["o1", "o4", "o5"]), base);
    assert.ok(r.attacks.length > 0);
    assert.ok(r.stands.every((s) => s.label !== "in" || !r.attacks.some(([, b]) => b === s.reading)));
  });
});

describe("solve: faithfulness (the 2026-11-19 triage, fixture solve-faithful)", () => {
  const f = fixture("faithful");
  /** A log of fixture entries, each with its speaker. */
  const turns = (...pairs: [string, string][]) => buildLog(pairs.map(([speaker, label], at) => ({ speaker, at, text: f.get(label)! })), tables);
  const clashSets = async (l: ReturnType<typeof turns>) => (await clashes(l, base)).clashes.map((c) => c.readings);

  it("uwen is the turn's speaker: two speakers' I walk / I don't walk never clash; one speaker's do", async () => {
    assert.deepEqual(await clashSets(turns(["a", "f1"], ["b", "f2"])), []);
    assert.deepEqual(await clashSets(turns(["a", "f1"], ["a", "f2"])), [["t:0.0", "t:0.1"]]);
  });

  it("awan is the turn's addressee (R4a-8): with no call, the first turn's is unknown and the second's the other speaker", async () => {
    assert.deepEqual(await clashSets(turns(["a", "f3"], ["b", "f4"])), []);
    assert.match(translate(turns(["a", "f3"], ["b", "f4"]), { lexicon: tables }).program, /holds\(owuro\(z\(listener\(0\)\)\)\)[^\n]*\n[\s\S]*holds\(neg\(owuro\(z\(sp\("a"\)\)\)\)\)/);
  });

  it("a question has no turn: does uwen walk? does not fit a logged speaker's claim", async () => {
    assert.equal((await follows(turns(["a", "f1"]), q("yel zuwen vowurol."), base)).verdict, "unknown");
  });

  it("who walks? is a fill question: follows and couldBe answer beyond, reason fillAsk", async () => {
    const l = turns(["a", "f5"], ["a", "f6"]);
    for (const job of [follows, couldBe]) {
      const a = await job(l, q("yel zar vowurol."), base);
      assert.equal(a.verdict, "beyond");
      assert.deepEqual(a.left.map((x) => x.reason), ["fillAsk"]);
    }
  });

  it("aem needs at least one (set-joins.md#exclusivity-and-denying-a-whole-list, row 20)", async () => {
    assert.equal((await follows(turns(["a", "f9"], ["a", "f10"]), q("zazozon veruvol."), base)).verdict, "yes");
    assert.deepEqual(await clashSets(turns(["a", "f9"], ["a", "f10"], ["a", "f11"])), [["t:0.0", "t:0.1", "t:0.2"]]);
  });

  it("SHARED /ɡ/ after a join: a detail of each first-mention member; isa of each named member with no verb", async () => {
    const t = translate(turns(["a", "f7"]), { lexicon: tables });
    assert.deepEqual(t.left, []);
    for (const place of ["z1", "z2"]) assert.match(t.program, new RegExp(`^detail\\(nm\\("t:0.0",${place}\\),dt\\("slot:adj","gamayam"\\)\\) :- on`, "m"));
    assert.deepEqual(translate(turns(["a", "f8"]), { lexicon: tables }).left, []);
    assert.equal((await follows(turns(["a", "f8"]), q("zalazun gamayam."), base)).verdict, "yes");
  });
});

describe("solve: the conditional as a claim term (R4e-1 to R4e-4, R4e-7, R4b-1)", () => {
  const h = (labels: string[], extra: string[] = []) => log("hinges", labels, extra);
  const pairs = async (labels: string[]) => (await clashes(h(labels), base)).clashes.map((x) => x.readings);

  it("R4e-1: hg1 + hg2 answer through the conditional, and each hinge claims its term", async () => {
    const a = await follows(h(["hg1", "hg2"]), q("zalazun vehohel."), base);
    assert.equal(a.verdict, "yes");
    assert.deepEqual(a.because, ["t:0.0", "t:0.1"]);
    assert.match(translate(h(["hg1"]), { lexicon: tables }).program, /^used\("t:0\.0",ehohe\(z\(alazu\)\),if\(c\("t:0\.0"\),o\("t:0\.0"\)\)\) :- /m);
    for (const label of ["hg3", "hg4"]) assert.equal((await follows(h([label, "hg2"]), q("zalazun vehohel."), base)).verdict, "yes", label);
  });

  it("R4e-2, R4e-3: a denied conditional clashes with one that says at least as much", async () => {
    assert.deepEqual(await pairs(["hg5", "hg6"]), [["t:0.0", "t:0.1"]]);
    assert.deepEqual(await pairs(["hg1", "hg8"]), [["t:0.0", "t:0.1"]]);
    assert.deepEqual(await pairs(["hg3", "hg9"]), [["t:0.0", "t:0.1"]]);
    assert.deepEqual(await pairs(["hg4", "hg10"]), [["t:0.0", "t:0.1"]]);
    assert.deepEqual(await pairs(["hg1", "hg10"]), []);
    assert.equal((await follows(h(["hg8", "hg2"]), q("zalazun vehohel."), base)).verdict, "unknown");
  });

  it("R4e-2: a first mention in the condition meets a stated one", async () => {
    assert.equal((await follows(h(["hg5", "hg7"]), q("zalazun vehohel."), base)).verdict, "yes");
  });

  it("R4e-4: a question over a hinge asks whether the conditional holds", async () => {
    const asked = q("zalazun vehohel thohem blarl zazozon vowurol.");
    assert.equal((await follows(h(["hg1"]), asked, base)).verdict, "yes");
    assert.equal((await follows(h(["hg8"]), asked, base)).verdict, "no");
    assert.equal((await follows(h(["hg2"]), asked, base)).verdict, "unknown");
    assert.equal((await follows(h(["hg1", "hg12"]), q("zahelan vezuvel thohem blarl zazozon vowurol."), base)).verdict, "unknown");
    assert.equal((await follows(h(["hg5"]), q("zalazun vehohel thohem blarl zodozel vowurol."), base)).verdict, "yes");
    assert.equal((await follows(h(["hg5"]), q("zalazun vehohel thohem blarl zogozel vowurol."), base)).verdict, "unknown");
  });

  it("R4e-7: a noun outcome under a /ɡ/ hinge is an existence claim", async () => {
    assert.equal((await follows(h(["hg17", "hg18"]), q("zerulal."), base)).verdict, "yes");
    assert.equal((await follows(h(["hg19", "hg20"]), q("zugalal."), base)).verdict, "yes");
    for (const text of ["zerulal.", "zugalal."]) assert.equal((await follows(h(["hg21"]), q(text), base)).verdict, "yes", text);
  });

  it("R4b-1: a bl- noun condition reads as its kind", async () => {
    const b = (labels: string[]) => log("because", labels);
    assert.equal((await follows(b(["bc3"]), q("zahelan vayebel."), base)).verdict, "unknown");
    assert.equal((await follows(b(["bc4"]), q("zazozon vowurol."), base)).verdict, "yes");
  });
});

describe("solve: because with a holder, MAY, a restrictor or or; the /ɡ/ stack (R4b-2 to R4b-8)", () => {
  const b = (labels: string[], extra: string[] = []) => log("because", labels, extra);
  const pairs = async (labels: string[], extra: string[] = []) => (await clashes(b(labels, extra), base)).clashes.map((x) => x.readings);
  const verdict = async (labels: string[], text: string, opts: SolveOptions = base) => (await follows(b(labels), q(text), opts)).verdict;
  const could = async (labels: string[], text: string) => (await couldBe(b(labels), q(text), base)).verdict;

  it("R4b-2: because inside a holder's view: bc5 + bc6 clash in Azozon's view; the view is not your claim", async () => {
    const r = await clashes(b(["bc5", "bc6"]), base);
    assert.deepEqual(r.clashes.map((x) => x.readings), [["t:0.0", "t:0.1"]]);
    assert.match(r.clashes[0]!.atom, /^view\(azozo,/);
    assert.equal(await verdict(["bc5"], "zalazun vudurul."), "unknown");
    assert.match(translate(b(["bc5"]), { lexicon: tables }).program, /^holds\(view\(azozo,cause\(erula,uduru\(z\(alazu\)\)\)\)\) :- on\("t:0.0"\)\.$/m);
  });

  it("R4b-3: the /ɡ/ stack on a noun is row 13 on the kinds; no clouds clashes", async () => {
    assert.equal(await verdict(["bc7"], "zerulal."), "yes");
    assert.deepEqual(await pairs(["bc7"], ["zul gugalal."]), [["t:0.0", "t:0.1"]]);
    assert.match(translate(b(["bc7"]), { lexicon: tables }).program, /^holds\(onlyif\(c\("t:0.0"\),o\("t:0.0"\)\)\) :- on\("t:0.0"\)\.$/m);
  });

  it("R4b-4 (D2): a condition with its own MAY, holder or say word is that clause's own term", async () => {
    assert.equal(await verdict(["bc8"], "zazozon vowurol."), "yes");
    assert.equal(await verdict(["bc8"], "zalazun vezuvel."), "unknown");
    assert.equal(await could(["bc8"], "zalazun vezuvel."), "yes");
    assert.equal(await verdict(["bc9"], "zalazun vezuvel."), "unknown");
    assert.equal(await verdict(["bc10"], "zazozon vowurol."), "yes");
    assert.match(translate(b(["bc8"]), { lexicon: tables }).program, /^holds\(cause\(may\(ezuve\(z\(alazu\)\)\),owuro\(z\(azozo\)\)\)\) :- on\("t:0.0"\)\.$/m);
  });

  it("R4b-5 (D3): MAY right before because hedges only the link", async () => {
    assert.deepEqual(await pairs(["bc11", "bc12"]), [["t:0.0", "t:0.1"]]);
    assert.equal(await verdict(["bc13"], "zazozon vowurol."), "yes");
    assert.equal(await verdict(["bc13"], "zalazun vezuyol."), "yes");
    const program = translate(b(["bc13"]), { lexicon: tables }).program;
    assert.match(program, /^holds\(may\(cause\(ezuyo\(z\(alazu\)\),owuro\(z\(azozo\)\)\)\)\) :- on\("t:0.0"\)\.$/m);
    assert.match(program, /^holds\(fault\(ezuyo\(z\(alazu\)\),owuro\(z\(azozo\)\)\)\) :- maybe\("t:0.0"\), on\("t:0.0"\)\.$/m);
  });

  it("R4b-6 (D11): because over MAY: the condition claimed, the outcome possible", async () => {
    assert.equal(await verdict(["bc14"], "zazozon vowurol."), "unknown");
    assert.equal(await could(["bc14"], "zazozon vowurol."), "yes");
    assert.equal(await verdict(["bc14"], "zalazun vezuvel."), "yes");
    assert.match(translate(b(["bc14"]), { lexicon: tables }).program, /^holds\(cause\(ezuve\(z\(alazu\)\),may\(owuro\(z\(azozo\)\)\)\)\) :- on\("t:0.1"\)\.$/m);
  });

  it("R4b-7 (D12): always marks all three, often gates all three, or links each item where it holds", async () => {
    assert.deepEqual(await pairs(["bc15", "bc16"]), [["t:0.0", "t:0.1"]]);
    assert.match(translate(b(["bc15"]), { lexicon: tables }).program, /^always\(cause\(erula,owuro\(z\(azozo\)\)\)\) :- on\("t:0.0"\)\.$/m);
    assert.equal(await verdict(["bc17"], "zazozon vowurol."), "unknown");
    assert.equal(await could(["bc17"], "zazozon vowurol."), "yes");
    assert.equal(await verdict(["bc17"], "zazozon vowurol.", { ...base, defaults: true }), "yes");
    assert.equal(await verdict(["bc18"], "zazozon vowurol."), "yes");
    assert.match(translate(b(["bc18"]), { lexicon: tables }).program, /^holds\(cause\(ugala,owuro\(z\(azozo\)\)\)\) :- holds\(ugala\), on\("t:0.0"\)\.$/m);
    assert.deepEqual(translate(b(["bc19"]), { lexicon: tables }).left, []);
  });
});

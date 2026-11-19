import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { fullGlossIndex } from "../game/build.js";
import { createClassifyTables } from "../parse/classify.js";
import { glossToAgeben } from "../parse/gloss-inverse.js";
import { buildLog } from "./log.js";
import { inRange, translate } from "./translate.js";

const here = dirname(fileURLToPath(import.meta.url));
const rootDir = join(here, "..", "..");
const fixtures = join(here, "fixtures");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);
const index = fullGlossIndex(tables);

/** A solver fixture's entries: label, Ageben line, English. */
function entries(file: string): { label: string; text: string }[] {
  return readFileSync(join(fixtures, file), "utf8")
    .split(/\n\s*\n/)
    .map((block) => block.split("\n").filter((l) => l && !l.startsWith("#")))
    .filter((lines) => lines.length)
    .map((lines) => ({ label: lines[0]!.replace(/^@ /, ""), text: lines[1]! }));
}

const logOf = (texts: string[]) => buildLog(texts.map((text, at) => ({ speaker: "a", at, text })), tables);
const program = (...texts: string[]) => translate(logOf(texts), { lexicon: tables });
const fromGloss = (gloss: string): string => glossToAgeben(gloss, tables, index) + ".";

describe("translate: golden program per solver fixture", () => {
  for (const file of readdirSync(fixtures).filter((f) => /^solve-.*\.txt$/.test(f))) {
    it(file, () => {
      const list = entries(file);
      const t = translate(logOf(list.map((e) => e.text)), { lexicon: tables });
      assert.deepEqual(t.left, [], "every fixture reading has a row");
      // The golden file names each reading id's fixture label, so a reader can follow it.
      const labels = t.readings.map((id, i) => `% ${id} = ${list[i]?.label}`).join("\n");
      const text = `${labels}\n\n${t.program}`;
      const golden = join(fixtures, file.replace(/\.txt$/, ".lp"));
      if (process.env.UPDATE_GOLDEN || !existsSync(golden)) writeFileSync(golden, text);
      assert.equal(text, readFileSync(golden, "utf8"), `golden differs: rerun with UPDATE_GOLDEN=1 if the change is meant (${golden})`);
    });
  }
});

describe("translate: encoding", () => {
  it("Clingo 5 / 6 common ground: no classical negation, no conditional literal in a body, no `_` inside `not`", () => {
    for (const file of readdirSync(fixtures).filter((f) => /^solve-.*\.txt$/.test(f))) {
      const { program: text } = translate(logOf(entries(file).map((e) => e.text)), { lexicon: tables, switches: { widen: true, defaults: true, closed: true } });
      const rules = text.split("\n").filter((l) => l && !l.startsWith("%"));
      assert.ok(!rules.some((l) => /(^|[\s,(])-holds/.test(l)), `${file}: a denial is holds(neg(T))`);
      assert.ok(!rules.some((l) => /:-.*[^:]:[^-]/.test(l.replace(/"[^"]*"/g, ""))), `${file}: no conditional literal`);
      assert.ok(!rules.some((l) => /not [^,.]*\b_\b/.test(l)), `${file}: no _ inside not`);
    }
  });

  it("every reading is switched by on(Id), and every rule has its fired twin", () => {
    const t = program("zazozon vowurol.", "zalazun vehohel thohem blarl zazozon vowurol.");
    assert.deepEqual(t.readings, ["t:0.0", "t:0.1"]);
    const lines = t.program.split("\n");
    lines.forEach((line, i) => {
      if (/^(holds|clash|count|detail|always|never|\{)/.test(line) && line.includes('on("')) assert.match(lines[i + 1] ?? "", /^fired\(/, line);
    });
  });

  it("R1-2: no K with a verb denies the head; with no verb the kind itself clashes", () => {
    const t = program("zul gobozal vewobol.", "zul godozel.");
    assert.match(t.program, /^holds\(neg\(ewobo\(z\(X\)\)\)\) :- holds\(isa\(X,oboza\)\), on\("t:0\.0"\)\.$/m);
    assert.match(t.program, /^clash\(none\("t:0\.1"\)\) :- holds\(isa\(X,odoze\)\), on\("t:0\.1"\)\.$/m);
  });

  it("row 8: a closed universal with its verb denied denies each member", () => {
    const t = program("zual gogozel vezuvel vul.");
    assert.match(t.program, /^holds\(neg\(ezuve\(z\(X\)\)\)\) :- holds\(isa\(X,ogoze\)\), on\("t:0\.0"\)\.$/m);
  });

  it("row 8: a hinge on a closed universal takes the kind in its body", () => {
    const t = program("zual gebezel vewobol thohem blarl zazozon vowurol.");
    assert.deepEqual(t.left, []);
    assert.match(t.program, /^holds\(ewobo\(z\(X\)\)\) :- holds\(isa\(X,ebeze\)\), fits\(c\("t:0\.0"\),P\), holds\(P\), on\("t:0\.0"\)\.$/m);
  });

  it("R1-9: standalone thul keeps the claim and notes the frame", () => {
    const t = program("zazozon vowurol thul.");
    assert.match(t.program, /^holds\(owuro\(z\(azozo\)\)\) :- on\("t:0\.0"\)\.$/m);
    assert.equal(t.notes.length, 1);
    assert.equal(t.notes[0]!.frame.key, "joinSeries:u:standalone");
  });

  it("a frame with no row leaves its reading out, reported", () => {
    const t = program("zazozon vowurol.", fromGloss("y-question | z-Azozon | v-walk"));
    assert.deepEqual(t.readings, ["t:0.0"]);
    assert.equal(t.left.length, 1);
    assert.equal(t.left[0]!.reading, "t:1.0");
    assert.equal(t.left[0]!.reason, "noRow");
  });

  it("a collective -x verb under zual + kind gets no per-member rule: the reading is left out, reported", () => {
    const t = program("zual gogozel vezuvelx.");
    assert.deepEqual(t.readings, []);
    assert.doesNotMatch(t.program, /ezuve/);
    assert.equal(t.left.length, 1);
    assert.equal(t.left[0]!.reading, "t:0.0");
    assert.equal(t.left[0]!.reason, "noRow");
    assert.equal(t.left[0]!.key, "joinSeries:ua");
  });

  it("closed world: a candidate per ground term, under switch(closed)", () => {
    const t = translate(logOf(["zazozon vowurol."]), { switches: { closed: true } });
    assert.match(t.program, /^switch\(closed\)\.$/m);
    assert.match(t.program, /^candidate\(owuro\(z\(azozo\)\)\)\.$/m);
  });
});

describe("translate: holders and say words (R2-1, R2-4)", () => {
  const holds = (t: ReturnType<typeof program>): string[] => t.program.split("\n").filter((l) => /^(holds|via)\(.*on\("/.test(l));

  it("row 1: a holder's view is wrapped, never your claim; its channel is data", () => {
    assert.deepEqual(holds(program("zalazun theyomazozon vudurul.")), ['via("t:0.0",clues) :- on("t:0.0").', 'holds(view(azozo,uduru(z(alazu)))) :- on("t:0.0").']);
  });

  it("row 3, R2-4: -r resumes its root; -x, the interlocutors and the generic pronoun are their own holders", () => {
    assert.match(program("zazozon vowurol. zalazun theyomazozor vudurul.").program, /^holds\(view\(azozo,uduru\(z\(alazu\)\)\)\) :- on\("t:0\.1"\)\.$/m);
    assert.match(program("zalazun theyomazozonx vudurul.").program, /^holds\(view\(grp\(azozo\),/m);
    assert.match(program("zalazun theyomayan vudurul.").program, /^holds\(view\(interlocutors,/m);
    assert.match(program("theyomeyen zalazun vudurul.").program, /^holds\(view\(generic,/m);
    assert.match(program("zalazun theyomeyel vudurul.").program, /^holds\(isa\(nm\("t:0\.0",h\),eye\)\) :- on\("t:0\.0"\)\.$/m);
  });

  it("a holder with no row yet is left out: on MAY (B6b), the topic pronoun", () => {
    assert.deepEqual(program("zalazun thomamazozon vudurul.").left.map((l) => l.key), ["overlay:may:th"]);
    assert.deepEqual(program("xazozon theyomalen zalazun vudurul.").left.map((l) => l.key), ["xFamily:holder"]);
  });

  it("row 4: who has the say, by part and ending; pair reach e on z keeps its bl- word as to(X)", () => {
    assert.match(program("zazozon vowurol hwuval.").program, /^holds\(say\(rules,v,u,a,l,owuro\(z\(azozo\)\)\)\) :- on/m);
    assert.match(program("zazozon vowurol hwuvam blalazun.").program, /^holds\(say\(alazu,v,u,a,m,owuro\(z\(azozo\)\)\)\) :- on/m);
    assert.match(program("zazozon vowurol hwuvam.").program, /^holds\(say\(sp\("a"\),v,u,a,m,/m);
    assert.match(program("zalazun vezuvel hwuvur.").program, /^holds\(say\(unsaid,v,u,u,r,/m);
    assert.match(program("zuwen vowurol hwezal blahelan.").program, /^holds\(say\(sp\("a"\),z,e,a,l,owuro\(z\(sp\("a"\)\)\),to\(ahela\)\)\) :- on/m);
    assert.doesNotMatch(program("zazozon vowurol hwuval.").program, /^holds\(owuro/m);
  });
});

describe("translate: ranges (ranges.md#ranges, open-ranges.md#rays)", () => {
  const v = (value: number) => ({ kind: "scalar" as const, value });
  const end = (value: number) => ({ value: v(value) });
  it("oel keeps both ends, uel leaves out the end said second, uol both, ual keeps the outside", () => {
    assert.equal(inRange(v(3), { first: end(3), second: end(5), hook: "oel" }), true);
    assert.equal(inRange(v(5), { first: end(3), second: end(5), hook: "uel" }), false);
    assert.equal(inRange(v(3), { first: end(5), second: end(3), hook: "uel" }), false);
    assert.equal(inRange(v(4), { first: end(5), second: end(3), hook: "uel" }), true);
    assert.equal(inRange(v(3), { first: end(3), second: end(5), hook: "uol" }), false);
    assert.equal(inRange(v(6), { first: end(3), second: end(5), hook: "ual" }), true);
    assert.equal(inRange(v(4), { first: end(3), second: end(5), hook: "ual" }), false);
  });

  it("rays: +∞ down to 3 with 3 left out is more than 3; −∞ up to 5 is at most 5", () => {
    assert.equal(inRange(v(5), { first: { infinite: 1 }, second: end(3), hook: "uel" }), true);
    assert.equal(inRange(v(3), { first: { infinite: 1 }, second: end(3), hook: "uel" }), false);
    assert.equal(inRange(v(5), { first: { infinite: -1 }, second: end(5), hook: "oel" }), true);
    assert.equal(inRange(v(6), { first: { infinite: -1 }, second: end(5), hook: "oel" }), false);
  });
});

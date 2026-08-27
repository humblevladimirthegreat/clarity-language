import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import { createClassifyTables } from "./classify.js";
import { parse, SentenceParseError } from "./index.js";
import { parseSentenceTokens } from "./sentence-parser.js";
import { tokenizeUtterance } from "./tokenize.js";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const tables = createClassifyTables(
  readFileSync(join(rootDir, "data", "lexicon-published.csv"), "utf8"),
  readFileSync(join(rootDir, "data", "lexicon-overlays.csv"), "utf8"),
);

function parseText(text: string) {
  return parse(text, tables);
}

describe("parse — core.md beginner", () => {
  it("parses zazawan vawalal.", () => {
    const result = parseText("zazawan vawalal.");
    assert.equal(result.utterances.length, 1);
    const body = result.utterances[0]!.bodies[0]!;
    assert.equal(body.clause.units.length, 2);
    assert.equal(body.clause.units[0]!.kind, "np");
    assert.equal(body.clause.units[1]!.kind, "vp");
  });

  it("parses zadagal gelulul. as zero-copula predicate", () => {
    const result = parseText("zadagal gelulul.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    assert.equal(units.length, 2);
    assert.equal(units[0]!.kind, "np");
    assert.equal(units[1]!.kind, "predicate");
  });

  it("parses zazawan gedegel. as subject + predicate adjective", () => {
    const result = parseText("zazawan gedegel.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    assert.equal(units.length, 2);
    assert.equal(units[1]!.kind, "predicate");
  });

  it("omits jal when recoverable", () => {
    const result = parseText("zazawan vawalal.");
    assert.equal(result.utterances[0]!.left.force, undefined);
    assert.equal(result.utterances[0]!.left.impliedForce, "jal");
  });

  it("parses jol question", () => {
    const result = parseText("jol zugobon vawalal.");
    assert.ok(result.utterances[0]!.left.force);
    assert.equal(result.utterances[0]!.left.force!.raw, "jol");
  });

  it("parses confirm tag as second utterance", () => {
    const result = parseText("zazawan vawalal. jael.");
    assert.equal(result.utterances.length, 2);
    assert.equal(result.utterances[1]!.left.polars[0]?.raw, "jael");
  });

  it("parses jam soft statement", () => {
    const result = parseText("jam zazawan vawalal.");
    assert.equal(result.utterances[0]!.left.force?.raw, "jam");
  });

  it("parses jel command with bang", () => {
    const result = parseText("jel vuzunel!");
    assert.equal(result.utterances[0]!.left.force?.raw, "jel");
    assert.equal(result.utterances[0]!.bodies[0]!.punct, "bang");
  });

  it("parses polar plus body", () => {
    const result = parseText("jael zugobon vawalal.");
    assert.equal(result.utterances[0]!.left.polars[0]?.raw, "jael");
    assert.equal(result.utterances[0]!.bodies[0]!.clause.units.length, 2);
  });
});

describe("parse — coordination.md", () => {
  it("parses zadagal zagadal zam.", () => {
    const result = parseText("zadagal zagadal zam.");
    const unit = result.utterances[0]!.bodies[0]!.clause.units[0]!;
    assert.equal(unit.kind, "np");
    if (unit.kind !== "np") return;
    assert.equal(unit.coord.parts.length, 1);
    assert.equal(unit.coord.parts[0]!.items.length, 2);
    assert.equal(unit.coord.parts[0]!.items[0]!.kind, "package");
    assert.equal(unit.coord.parts[0]!.items[1]!.kind, "package");
    assert.equal(unit.coord.parts[0]!.join?.raw, "zam");
  });

  it("rejects frame echo zual zonunol zugumel zual", () => {
    const tokens = tokenizeUtterance("zual zonunol zugumel zual.", tables);
    assert.throws(() => parseSentenceTokens(tokens), SentenceParseError);
  });

  it("parses join scope island", () => {
    const result = parseText("zazawan ^ zununel zal ^ zam.");
    const unit = result.utterances[0]!.bodies[0]!.clause.units[0]!;
    assert.equal(unit.kind, "np");
    if (unit.kind !== "np") return;
    assert.equal(unit.coord.parts.length, 1);
    assert.equal(unit.coord.parts[0]!.items.length, 2);
    assert.equal(unit.coord.parts[0]!.join?.raw, "zam");
    assert.equal(unit.coord.parts[0]!.items[0]!.kind, "package");
    assert.equal(unit.coord.parts[0]!.items[1]!.kind, "island");
  });

  it("parses nested left-associative VP joins", () => {
    const result = parseText("vawalal velebel vol vurunul val.");
    const unit = result.utterances[0]!.bodies[0]!.clause.units[0]!;
    assert.equal(unit.kind, "vp");
    if (unit.kind !== "vp") return;
    assert.equal(unit.coord.parts.length, 2);
    assert.equal(unit.coord.parts[0]!.items.length, 2);
    assert.equal(unit.coord.parts[0]!.join?.raw, "vol");
    assert.equal(unit.coord.parts[1]!.items.length, 1);
    assert.equal(unit.coord.parts[1]!.join?.raw, "val");
  });
});

describe("parse — orodo dependents", () => {
  it("parses hurugum borodol dependent", () => {
    const result = parseText("zazawan guzumum hurugum borodol zululon vawalal.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.equal(clause.dependent!.orodo.raw, "borodol");
    assert.equal(clause.dependent!.clause.units.length, 2);
  });

  it("parses content dorodol with matrix verb after orodo", () => {
    const result = parseText("zazawan dululon dorodol vezehel zadagal vurunul.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.equal(clause.units.some((u) => u.kind === "vp"), true);
    assert.equal(clause.dependent!.clause.units.length, 2);
  });
});

describe("parse — spans", () => {
  it("parses daxal … xuxul span", () => {
    const result = parseText("daxal zadagal xuxul vawalal.");
    const spanUnit = result.utterances[0]!.bodies[0]!.clause.units.find((u) => u.kind === "span");
    assert.ok(spanUnit);
    if (spanUnit?.kind !== "span") return;
    assert.equal(spanUnit.span.open.raw, "daxal");
    assert.equal(spanUnit.span.close.raw, "xuxul");
  });
});

describe("parse — SVO slots", () => {
  it("parses zar dugobon vozowol as subject, object, verb (roles.md)", () => {
    const result = parseText("zar dugobon vozowol.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    assert.equal(units.length, 3);
    assert.equal(units[0]!.kind, "np");
    assert.equal(units[1]!.kind, "np");
    assert.equal(units[2]!.kind, "vp");
    if (units[0]!.kind !== "np" || units[1]!.kind !== "np") return;
    assert.equal(units[0]!.coord.ledegul, "z");
    assert.equal(units[0]!.coord.parts[0]!.join?.raw, "zar");
    assert.equal(units[1]!.coord.ledegul, "d");
    const obj = units[1]!.coord.parts[0]!.items[0];
    assert.equal(obj?.kind, "package");
    if (obj?.kind !== "package") return;
    assert.equal(obj.package.head.raw, "dugobon");
  });
});

describe("parse — illegal fences", () => {
  it("rejects left fence zam zadagal zagadal", () => {
    const tokens = tokenizeUtterance("zam zadagal zagadal.", tables);
    assert.throws(() => parseSentenceTokens(tokens), SentenceParseError);
  });

  it("rejects infix A zam B zal C", () => {
    const tokens = tokenizeUtterance("zadagal zam zagadal zal zadagal.", tables);
    assert.throws(() => parseSentenceTokens(tokens), SentenceParseError);
  });
});

describe("parse — stage 4 resolve", () => {
  it("attaches resolve to parse(text)", () => {
    const result = parseText("zululon vawalal. zulur vajul.");
    assert.ok(result.resolve);
    assert.equal(result.resolve.anaphors[0]?.antecedent?.raw, "zululon");
  });

  it("marks jol zar vawalal. as fill-ask", () => {
    const result = parseText("jol zar vawalal.");
    assert.equal(result.resolve?.asks[0]?.kind, "fillAsk");
  });
});

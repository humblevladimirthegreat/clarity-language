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
  readFileSync(join(rootDir, "data", "lexicon-compounds.csv"), "utf8"),
);

function parseText(text: string) {
  return parse(text, tables);
}

describe("parse — clause.md beginner", () => {
  it("parses zazawan vawalal.", () => {
    const result = parseText("zazawan vawalal.");
    assert.equal(result.utterances.length, 1);
    const body = result.utterances[0]!.bodies[0]!;
    assert.equal(body.clause.units.length, 2);
    assert.equal(body.clause.units[0]!.kind, "np");
    assert.equal(body.clause.units[1]!.kind, "vp");
  });

  it("parses zadagal gelulul. as classification predicate", () => {
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

  it("parses citation greeting azawan.", () => {
    const result = parseText("azawan.");
    assert.equal(result.utterances.length, 1);
    assert.equal(result.utterances[0]!.bodies[0]!.clause.units[0]!.kind, "np");
  });

  it("parses greeting bid azawaxan. as vocative-shaped left edge", () => {
    const result = parseText("azawaxan.");
    assert.equal(result.utterances[0]!.left.vocatives[0]?.raw, "azawaxan");
    assert.equal(result.utterances[0]!.bodies.length, 0);
  });

  it("parses vocative jululon.", () => {
    const result = parseText("jululon.");
    assert.equal(result.utterances[0]!.left.vocatives[0]?.raw, "jululon");
  });

  it("parses unhosted /b/ recipient plus verb", () => {
    const result = parseText("zazawan bululon vezehel.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    assert.equal(units.length, 3);
    assert.equal(units[0]!.kind, "np");
    assert.equal(units[1]!.kind, "np");
    assert.equal(units[2]!.kind, "vp");
    if (units[1]!.kind !== "np") return;
    assert.equal(units[1]!.coord.level, "b");
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

describe("parse — joins.md", () => {
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

describe("parse — stand-in dependents", () => {
  it("parses hurugum barl dependent", () => {
    const result = parseText("zazawan guzumum hurugum barl zululon vawalal.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.equal(clause.dependent!.orodo.raw, "barl");
    assert.equal(clause.dependent!.clause.units.length, 2);
  });

  it("parses holalam barl purpose dependent", () => {
    const result = parseText("zazawan vawalal holalam barl zululon vajul.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.equal(clause.dependent!.orodo.raw, "barl");
    assert.equal(clause.dependent!.clause.units.length, 2);
  });

  it("parses darl object with matrix verb before the opener", () => {
    const result = parseText("zazawan bululon vezehel darl zadagal vurunul.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.equal(clause.units.some((u) => u.kind === "vp"), true);
    assert.equal(clause.dependent!.orodo.raw, "darl");
    assert.equal(clause.dependent!.clause.units.length, 2);
  });

  it("parses dorl whether without inner jol", () => {
    const result = parseText("zazawan vejel dorl zululon vawalal.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    assert.equal(clause.dependent!.orodo.raw, "dorl");
  });
});

describe("parse — comparatives manner scale", () => {
  it("attaches /h/ immediately after zel as SHARED, then the verb", () => {
    const result = parseText("zululon zazawan zel hohogem vawalal.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    assert.equal(units.length, 2);
    assert.equal(units[0]!.kind, "np");
    assert.equal(units[1]!.kind, "vp");
    if (units[0]!.kind !== "np") return;
    const part = units[0]!.coord.parts[0]!;
    assert.equal(part.join?.raw, "zel");
    assert.equal(part.shared.length, 1);
    const shared = part.shared[0]!;
    assert.ok("word" in shared);
    assert.equal(shared.word.raw, "hohogem");
    assert.equal(shared.word.pos, "h");
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
    assert.equal(units[0]!.coord.level, "z");
    assert.equal(units[0]!.coord.parts[0]!.join?.raw, "zar");
    assert.equal(units[1]!.coord.level, "d");
    const obj = units[1]!.coord.parts[0]!.items[0];
    assert.equal(obj?.kind, "package");
    if (obj?.kind !== "package") return;
    assert.equal(obj.package.head.raw, "dugobon");
  });
});

describe("parse — hosted /w/ before /b/", () => {
  it("parses simile with /w/ left of host, then /b/", () => {
    const result = parseText("zazawan welem hurorom budugul vawalal.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    const h = units.find((u) => u.kind === "h");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.modifiers[0]?.raw, "welem");
    assert.equal(h.unit.bound?.raw, "budugul");
  });

  it("parses extra-noun hook with restrictor /w/ left of the hook", () => {
    const result = parseText("zodogol velebel wal al bohohul.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    const hook = units.find((u) => u.kind === "hook");
    assert.ok(hook && hook.kind === "hook");
    assert.equal(hook.modifiers[0]?.raw, "wal");
  });

  it("parses discourse hook with /w/", () => {
    const result = parseText("welem al zazawan vawalal.");
    assert.equal(result.utterances[0]!.left.hook?.raw, "al");
    assert.equal(result.utterances[0]!.left.hookModifiers?.[0]?.raw, "welem");
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

describe("parse — as-of poles", () => {
  it("parses hosted ledger plus date /b/", () => {
    const result = parseText("zululon honenom helerem b_#22,7 vebarum.");
    const h = result.utterances[0]!.bodies[0]!.clause.units.find((u) => u.kind === "h" && u.unit.word.raw === "helerem");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.word.overlay?.gloss, "as-of.ledger");
    assert.equal(h.unit.bound?.raw, "b_#22,7");
  });

  it("parses as-of resume without /b/", () => {
    const result = parseText("zazawan helerer vawalal.");
    const h = result.utterances[0]!.bodies[0]!.clause.units.find((u) => u.kind === "h");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.word.raw, "helerer");
    assert.equal(h.unit.bound, undefined);
  });

  it("rejects as-of resume plus /b/", () => {
    assert.throws(() => parseText("zazawan helerer b_#22,7 vawalal."), SentenceParseError);
  });

  it("rejects as-of introduce without /b/", () => {
    assert.throws(() => parseText("zazawan helerem vawalal."), SentenceParseError);
  });

  it("parses /ɡ/ ledger on a noun", () => {
    const result = parseText("zonenol gelerem b_#22,7.");
    const units = result.utterances[0]!.bodies[0]!.clause.units;
    const pred = units.find((u) => u.kind === "predicate");
    const np = units.find((u) => u.kind === "np");
    if (pred?.kind === "predicate") {
      assert.equal(pred.adj.word.raw, "gelerem");
      assert.equal(pred.adj.bound?.raw, "b_#22,7");
      return;
    }
    assert.ok(np && np.kind === "np");
    const item = np.coord.parts[0]!.items[0];
    assert.equal(item?.kind, "package");
    if (item?.kind !== "package") return;
    const g = item.package.adjs[0];
    assert.equal(g?.word.raw, "gelerem");
    assert.equal(g?.bound?.raw, "b_#22,7");
  });

  it("parses /w/ as-of before a shared adjective", () => {
    const result = parseText("zazawan zululon zel welerem b_#22,7 gomonam.");
    const np = result.utterances[0]!.bodies[0]!.clause.units[0];
    assert.ok(np && np.kind === "np");
    const shared = np.coord.parts[0]!.shared[0];
    assert.ok(shared && "asOf" in shared);
    assert.equal(shared.asOf?.word.raw, "welerem");
    assert.equal(shared.asOf?.bound?.raw, "b_#22,7");
    assert.equal(shared.word.raw, "gomonam");
  });

  it("parses bookmark as-of plus barl dependent", () => {
    const result = parseText("zadorol gologem honenom helezom hobomam barl zululon vebarum.");
    const clause = result.utterances[0]!.bodies[0]!.clause;
    assert.ok(clause.dependent);
    const h = clause.units.find((u) => u.kind === "h" && u.unit.word.raw === "hobomam");
    assert.ok(h && h.kind === "h");
    assert.equal(h.unit.bound?.raw, "barl");
  });

  it("parses channel plus residue plus as-of", () => {
    const result = parseText("zululon huvuvum honenom helerem b_#22,7 vebarum.");
    const hs = result.utterances[0]!.bodies[0]!.clause.units.filter((u) => u.kind === "h");
    assert.equal(hs.length, 3);
  });

  it("rejects two as-of /h/ hosts in one clause", () => {
    assert.throws(
      () => parseText("zazawan helerem b_#22,7 hobomam b_#23,7 vawalal."),
      SentenceParseError,
    );
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
